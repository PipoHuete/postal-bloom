import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generatePostcardPDF } from "../_shared/pdf.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PostcardEmailRequest {
  recipientEmail: string;
  postcardData: {
    imageUrl: string;
    imageFilter: string;
    message: string;
    fontStyle: string;
    recipientName: string;
    addressLine1: string;
    addressLine2?: string;
    postalCode: string;
    city: string;
    country?: string;
  };
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; format: string } | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;
    
    const contentType = response.headers.get('content-type') || '';
    let format = 'JPEG';
    if (contentType.includes('png')) format = 'PNG';
    else if (contentType.includes('gif')) format = 'GIF';
    else if (contentType.includes('webp')) format = 'WEBP';
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return { base64: btoa(binary), format };
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

async function generatePostcardPDF(postcardData: PostcardEmailRequest['postcardData']): Promise<string> {
  // Create PDF with landscape 10x15 cm pages
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'cm',
    format: [10, 15] // height x width in cm
  });

  const pageWidth = 15;
  const pageHeight = 10;

  // === PAGE 1: FRONT (Image) ===
  // Try to add the image
  if (postcardData.imageUrl) {
    const imageData = await fetchImageAsBase64(postcardData.imageUrl);
    if (imageData) {
      try {
        doc.addImage(
          `data:image/${imageData.format.toLowerCase()};base64,${imageData.base64}`,
          imageData.format,
          0, 0,
          pageWidth, pageHeight
        );
      } catch (imgError) {
        console.error("Error adding image to PDF:", imgError);
        // Add placeholder if image fails
        doc.setFillColor(200, 200, 200);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('Imagen no disponible', pageWidth / 2, pageHeight / 2, { align: 'center' });
      }
    }
  }

  // Add small label
  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('ANVERSO', 0.3, pageHeight - 0.3);

  // === PAGE 2: BACK (Message + Address) ===
  doc.addPage([10, 15], 'landscape');

  // Background color (cream/beige)
  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Vertical divider line (dashed)
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([0.1, 0.1], 0);
  doc.line(pageWidth / 2, 0.5, pageWidth / 2, pageHeight - 0.5);
  doc.setLineDashPattern([], 0);

  // LEFT SIDE: Message
  const messageX = 0.5;
  const messageY = 1;
  const messageWidth = (pageWidth / 2) - 1;

  // Set font based on style
  let fontName = 'courier';
  if (postcardData.fontStyle === 'bradley' || postcardData.fontStyle === 'snell') {
    fontName = 'helvetica';
  }
  
  doc.setFont(fontName, postcardData.fontStyle === 'snell' ? 'italic' : 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  // Word wrap the message
  const message = postcardData.message || '(Sin mensaje)';
  const splitMessage = doc.splitTextToSize(message, messageWidth);
  doc.text(splitMessage, messageX, messageY);

  // RIGHT SIDE: Stamp and Address
  const addressX = (pageWidth / 2) + 0.5;

  // Stamp box (top right)
  const stampX = pageWidth - 2;
  const stampY = 0.5;
  const stampW = 1.5;
  const stampH = 1.8;
  
  doc.setDrawColor(155, 127, 212);
  doc.setLineDashPattern([0.1, 0.1], 0);
  doc.rect(stampX, stampY, stampW, stampH);
  doc.setLineDashPattern([], 0);
  
  doc.setFontSize(6);
  doc.setTextColor(155, 127, 212);
  doc.text('SELLO', stampX + stampW / 2, stampY + stampH / 2 + 0.1, { align: 'center' });

  // Address lines
  const addressLines: string[] = [
    postcardData.recipientName,
    postcardData.addressLine1,
    postcardData.addressLine2,
    `${postcardData.postalCode} ${postcardData.city}`,
    postcardData.country,
  ].filter((line): line is string => Boolean(line));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  let addressY = 3.5;
  const lineHeight = 0.6;
  
  // Draw address lines with underlines
  doc.setDrawColor(200, 200, 200);
  addressLines.forEach((line, index) => {
    const y = addressY + (index * lineHeight);
    if (index === 0) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, addressX, y);
    doc.line(addressX, y + 0.15, pageWidth - 0.5, y + 0.15);
  });

  // Add small label
  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('DORSO - Postal 10x15cm', 0.3, pageHeight - 0.3);

  // Get PDF as base64
  const pdfOutput = doc.output('datauristring');
  // Remove the data URI prefix to get just the base64
  const base64 = pdfOutput.split(',')[1];
  
  return base64;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, postcardData }: PostcardEmailRequest = await req.json();

    console.log("Sending test postcard email to:", recipientEmail);
    console.log("Postcard data:", JSON.stringify(postcardData, null, 2));

    const fontFamily = {
      courier: "'Courier New', monospace",
      bradley: "'Bradley Hand', cursive",
      snell: "'Snell Roundhand', cursive",
    }[postcardData.fontStyle] || "'Courier New', monospace";

    // Generate PDF
    console.log("Generating PDF...");
    const pdfBase64 = await generatePostcardPDF(postcardData);
    console.log("PDF generated successfully, size:", pdfBase64.length);

    // Generate HTML email with postcard preview
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Postal de Prueba</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #9b7fd4, #b69adf); color: white; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 24px; }
          .postcard { border: 2px solid #e8e0f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
          .postcard-label { background: #f0ebf7; padding: 8px 16px; font-weight: bold; color: #6b5b8c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          .front-image { width: 100%; height: 200px; object-fit: cover; display: block; }
          .back-content { background: #faf8f5; padding: 20px; display: flex; gap: 20px; min-height: 180px; }
          .message-side { flex: 1; border-right: 1px dashed #ccc; padding-right: 20px; }
          .address-side { flex: 1; display: flex; flex-direction: column; }
          .stamp { width: 50px; height: 60px; border: 2px dashed #9b7fd4; display: flex; align-items: center; justify-content: center; align-self: flex-end; margin-bottom: 12px; color: #9b7fd4; font-size: 10px; }
          .address-lines { margin-top: auto; }
          .address-line { border-bottom: 1px solid #ddd; padding: 4px 0; margin-bottom: 4px; font-size: 13px; }
          .pdf-notice { background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center; }
          .pdf-notice h3 { margin: 0 0 8px 0; color: #2e7d32; }
          .pdf-notice p { margin: 0; color: #388e3c; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📮 Postal de Prueba</h1>
          </div>
          <div class="content">
            <div class="pdf-notice">
              <h3>📎 PDF Adjunto Listo para Imprimir</h3>
              <p>Hemos adjuntado un archivo PDF con el anverso y dorso de la postal en tamaño exacto 10x15 cm, optimizado para impresión a doble cara.</p>
            </div>

            <!-- Front (Anverso) -->
            <div class="postcard">
              <div class="postcard-label">📷 Anverso (Vista previa)</div>
              <img src="${postcardData.imageUrl}" alt="Postal" class="front-image" style="filter: ${postcardData.imageFilter};" />
            </div>
            
            <!-- Back (Dorso) -->
            <div class="postcard">
              <div class="postcard-label">✉️ Dorso (Vista previa)</div>
              <div class="back-content">
                <div class="message-side">
                  <p style="font-family: ${fontFamily}; font-size: 14px; line-height: 1.6; margin: 0; color: #333;">
                    ${postcardData.message || '(Sin mensaje)'}
                  </p>
                </div>
                <div class="address-side">
                  <div class="stamp">SELLO</div>
                  <div class="address-lines">
                    <div class="address-line"><strong>${postcardData.recipientName}</strong></div>
                    <div class="address-line">${postcardData.addressLine1}</div>
                    ${postcardData.addressLine2 ? `<div class="address-line">${postcardData.addressLine2}</div>` : ''}
                    <div class="address-line">${postcardData.postalCode} ${postcardData.city}</div>
                    ${postcardData.country ? `<div class="address-line">${postcardData.country}</div>` : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="footer">
            Este es un email de prueba. El PDF adjunto está listo para imprimir en formato 10x15 cm a doble cara.
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email with PDF attachment
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Postales <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "📮 Postal de Prueba - PDF para Imprimir (10x15cm)",
        html: emailHtml,
        attachments: [
          {
            filename: "postal_10x15cm.pdf",
            content: pdfBase64,
            type: "application/pdf",
          }
        ],
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully with PDF attachment:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-test-postcard function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to send test email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
