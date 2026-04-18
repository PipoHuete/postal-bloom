import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

export interface PostcardPDFData {
  imageUrl: string;
  imageFilter?: string;
  message: string;
  fontStyle: string;
  recipientName: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  city: string;
  country?: string;
}

// Map frontend font styles to a downloadable Google Fonts TTF URL.
// We use the static TTF files hosted on github (google/fonts) for reliability with jsPDF.
const FONT_URLS: Record<string, { url: string; family: string; style: string }> = {
  caveat: {
    url: "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat%5Bwght%5D.ttf",
    family: "Caveat",
    style: "normal",
  },
  dancing: {
    url: "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript%5Bwght%5D.ttf",
    family: "DancingScript",
    style: "normal",
  },
  vibes: {
    url: "https://github.com/google/fonts/raw/main/ofl/greatvibes/GreatVibes-Regular.ttf",
    family: "GreatVibes",
    style: "normal",
  },
  lora: {
    url: "https://github.com/google/fonts/raw/main/ofl/lora/Lora%5Bwght%5D.ttf",
    family: "Lora",
    style: "normal",
  },
  merriweather: {
    url: "https://github.com/google/fonts/raw/main/ofl/merriweather/Merriweather%5Bopsz%2Cwdth%2Cwght%5D.ttf",
    family: "Merriweather",
    style: "normal",
  },
  mono: {
    url: "https://github.com/google/fonts/raw/main/apache/robotomono/RobotoMono%5Bwght%5D.ttf",
    family: "RobotoMono",
    style: "normal",
  },
};

// Cache fonts in-memory across invocations (per warm container)
const fontCache = new Map<string, string>();

async function fetchFontAsBase64(url: string): Promise<string | null> {
  if (fontCache.has(url)) return fontCache.get(url)!;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error("Font fetch failed:", url, res.status);
      return null;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunk)) as any);
    }
    const base64 = btoa(binary);
    fontCache.set(url, base64);
    return base64;
  } catch (e) {
    console.error("Error loading font:", e);
    return null;
  }
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; format: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    let format = "JPEG";
    if (contentType.includes("png")) format = "PNG";
    else if (contentType.includes("gif")) format = "GIF";
    else if (contentType.includes("webp")) format = "WEBP";
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < uint8Array.length; i += chunk) {
      binary += String.fromCharCode.apply(null, Array.from(uint8Array.subarray(i, i + chunk)) as any);
    }
    return { base64: btoa(binary), format };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function registerCustomFont(doc: any, fontStyle: string): Promise<string> {
  const fontInfo = FONT_URLS[fontStyle] || FONT_URLS.lora;
  const base64 = await fetchFontAsBase64(fontInfo.url);
  if (!base64) {
    console.warn(`Falling back to helvetica for fontStyle=${fontStyle}`);
    return "helvetica";
  }
  const fileName = `${fontInfo.family}.ttf`;
  try {
    doc.addFileToVFS(fileName, base64);
    doc.addFont(fileName, fontInfo.family, fontInfo.style);
    return fontInfo.family;
  } catch (e) {
    console.error("Error registering font:", e);
    return "helvetica";
  }
}

export async function generatePostcardPDF(postcardData: PostcardPDFData): Promise<string> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "cm",
    format: [10, 15],
  });

  const pageWidth = 15;
  const pageHeight = 10;

  // Register the custom font for the message
  const messageFont = await registerCustomFont(doc, postcardData.fontStyle);

  // === PAGE 1: FRONT (Image) ===
  if (postcardData.imageUrl) {
    const imageData = await fetchImageAsBase64(postcardData.imageUrl);
    if (imageData) {
      try {
        doc.addImage(
          `data:image/${imageData.format.toLowerCase()};base64,${imageData.base64}`,
          imageData.format,
          0, 0,
          pageWidth, pageHeight,
        );
      } catch (imgError) {
        console.error("Error adding image to PDF:", imgError);
        doc.setFillColor(200, 200, 200);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("Imagen no disponible", pageWidth / 2, pageHeight / 2, { align: "center" });
      }
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text("ANVERSO", 0.3, pageHeight - 0.3);

  // === PAGE 2: BACK ===
  doc.addPage([10, 15], "landscape");

  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([0.1, 0.1], 0);
  doc.line(pageWidth / 2, 0.5, pageWidth / 2, pageHeight - 0.5);
  doc.setLineDashPattern([], 0);

  // LEFT: Message with custom font
  const messageX = 0.5;
  const messageY = 1.2;
  const messageWidth = (pageWidth / 2) - 1;

  try {
    doc.setFont(messageFont, "normal");
  } catch {
    doc.setFont("helvetica", "normal");
  }

  // Larger size for handwriting fonts so they read like real handwriting
  const handwritingFonts = ["caveat", "dancing", "vibes"];
  const fontSize = handwritingFonts.includes(postcardData.fontStyle) ? 18 : 11;
  doc.setFontSize(fontSize);
  doc.setTextColor(50, 50, 50);

  const message = postcardData.message || "(Sin mensaje)";
  const splitMessage = doc.splitTextToSize(message, messageWidth);
  doc.text(splitMessage, messageX, messageY);

  // RIGHT: Stamp + Address
  const addressX = (pageWidth / 2) + 0.5;

  const stampX = pageWidth - 2;
  const stampY = 0.5;
  const stampW = 1.5;
  const stampH = 1.8;

  doc.setDrawColor(155, 127, 212);
  doc.setLineDashPattern([0.1, 0.1], 0);
  doc.rect(stampX, stampY, stampW, stampH);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(155, 127, 212);
  doc.text("SELLO", stampX + stampW / 2, stampY + stampH / 2 + 0.1, { align: "center" });

  const addressLines: string[] = [
    postcardData.recipientName,
    postcardData.addressLine1,
    postcardData.addressLine2,
    `${postcardData.postalCode} ${postcardData.city}`,
    postcardData.country,
  ].filter((line): line is string => Boolean(line));

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  let addressY = 3.5;
  const lineHeight = 0.6;

  doc.setDrawColor(200, 200, 200);
  addressLines.forEach((line, index) => {
    const y = addressY + (index * lineHeight);
    doc.setFont("helvetica", index === 0 ? "bold" : "normal");
    doc.text(line, addressX, y);
    doc.line(addressX, y + 0.15, pageWidth - 0.5, y + 0.15);
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text("DORSO - Postal 10x15cm", 0.3, pageHeight - 0.3);

  const pdfOutput = doc.output("datauristring");
  return pdfOutput.split(",")[1];
}
