import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Generate a simple PDF with two pages (front and back of postcard)
// Page size: 10x15 cm (approximately 283x425 points at 72 DPI)
function generatePostcardPDF(postcardData: PostcardEmailRequest['postcardData'], imageBase64: string): string {
  const pageWidth = 425; // 15 cm in points (15 * 28.35)
  const pageHeight = 283; // 10 cm in points (10 * 28.35)
  
  const fontFamily = {
    courier: "Courier",
    bradley: "Helvetica",
    snell: "Helvetica-Oblique",
  }[postcardData.fontStyle] || "Courier";

  // Clean the message for PDF (escape special characters)
  const cleanMessage = (postcardData.message || '(Sin mensaje)')
    .replace(/\\\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\n/g, ') Tj T* (');

  // Build address lines
  const addressLines: string[] = [
    postcardData.recipientName,
    postcardData.addressLine1,
    postcardData.addressLine2,
    `${postcardData.postalCode} ${postcardData.city}`,
    postcardData.country,
  ].filter((line): line is string => Boolean(line));

  // Create PDF content
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 5 0 R /Resources << /XObject << /Img 7 0 R >> /Font << /F1 8 0 R >> >> >>
endobj

4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 6 0 R /Resources << /Font << /F1 8 0 R /F2 9 0 R >> >> >>
endobj

5 0 obj
<< /Length 100 >>
stream
q
${pageWidth} 0 0 ${pageHeight} 0 0 cm
/Img Do
Q
BT
/F1 8 Tf
10 10 Td
(ANVERSO - Postal 10x15cm) Tj
ET
endstream
endobj

6 0 obj
<< /Length 800 >>
stream
q
0.95 0.93 0.91 rg
0 0 ${pageWidth} ${pageHeight} re f
Q

q
0.8 0.8 0.8 RG
0.5 w
${pageWidth / 2} 20 m
${pageWidth / 2} ${pageHeight - 20} l
S
Q

BT
/F2 11 Tf
1 0 0 1 20 ${pageHeight - 40} Tm
12 TL
(${cleanMessage}) Tj
ET

q
0.6 0.5 0.7 RG
1 w
${pageWidth - 70} ${pageHeight - 70} 50 60 re S
Q

BT
/F1 8 Tf
0.6 0.5 0.7 rg
${pageWidth - 60} ${pageHeight - 45} Td
(SELLO) Tj
ET

BT
/F1 10 Tf
0 0 0 rg
1 0 0 1 ${pageWidth / 2 + 20} ${pageHeight - 100} Tm
14 TL
${addressLines.map(line => `(${line.replace(/\\\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj T*`).join('\n')}
ET

BT
/F1 8 Tf
0.5 0.5 0.5 rg
10 10 Td
(DORSO - Postal 10x15cm) Tj
ET
endstream
endobj

7 0 obj
<< /Type /XObject /Subtype /Image /Width 600 /Height 400 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBase64.length} >>
stream
${imageBase64}
endstream
endobj

8 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

9 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /${fontFamily} >>
endobj

xref
0 10
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000280 00000 n 
0000000445 00000 n 
0000000598 00000 n 
0000001451 00000 n 
0000001700 00000 n 
0000001769 00000 n 

trailer
<< /Size 10 /Root 1 0 R >>
startxref
1840
%%EOF`;

  return pdf;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    // Fetch the image and convert to base64 for the PDF
    let imageBase64 = "";
    try {
      if (postcardData.imageUrl) {
        const imageResponse = await fetch(postcardData.imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const uint8Array = new Uint8Array(imageBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        imageBase64 = btoa(binary);
      }
    } catch (imgError) {
      console.error("Error fetching image for PDF:", imgError);
    }

    // Generate HTML email with postcard preview (keeping this for visual preview)
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
              <h3>📎 PDF Adjunto para Imprimir</h3>
              <p>Hemos adjuntado un PDF con el anverso y dorso de la postal en tamaño 10x15 cm, listo para imprimir a doble cara.</p>
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
            Este es un email de prueba. El PDF adjunto contiene la postal lista para imprimir en formato 10x15 cm.
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a simple HTML-based "PDF" as base64 for attachment
    // Note: For a real PDF, we'd need a PDF library. This creates a printable HTML file.
    const printableHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Postal 10x15cm</title>
  <style>
    @page { size: 15cm 10cm landscape; margin: 0; }
    @media print {
      body { margin: 0; }
      .page { page-break-after: always; }
      .page:last-child { page-break-after: auto; }
    }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; }
    .page { 
      width: 15cm; 
      height: 10cm; 
      position: relative; 
      overflow: hidden;
      box-sizing: border-box;
    }
    .front-page { background: #000; }
    .front-page img { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
      filter: ${postcardData.imageFilter};
    }
    .back-page { 
      background: #faf8f5; 
      display: flex; 
      padding: 15px;
    }
    .message-area { 
      flex: 1; 
      border-right: 1px dashed #999; 
      padding-right: 15px;
      font-family: ${fontFamily};
      font-size: 12px;
      line-height: 1.5;
    }
    .address-area { 
      flex: 1; 
      padding-left: 15px;
      display: flex;
      flex-direction: column;
    }
    .stamp { 
      width: 40px; 
      height: 50px; 
      border: 2px dashed #9b7fd4; 
      align-self: flex-end;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #9b7fd4;
    }
    .address-lines { 
      margin-top: auto; 
      font-size: 11px;
    }
    .address-line { 
      border-bottom: 1px solid #ccc; 
      padding: 3px 0; 
      margin-bottom: 3px; 
    }
  </style>
</head>
<body>
  <!-- Página 1: Anverso -->
  <div class="page front-page">
    <img src="${postcardData.imageUrl}" alt="Postal" />
  </div>
  
  <!-- Página 2: Dorso -->
  <div class="page back-page">
    <div class="message-area">
      ${(postcardData.message || '').replace(/\n/g, '<br>')}
    </div>
    <div class="address-area">
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
</body>
</html>`;

    // Encode the printable HTML as base64
    const encoder = new TextEncoder();
    const printableBytes = encoder.encode(printableHtml);
    let printableBase64 = '';
    for (let i = 0; i < printableBytes.length; i++) {
      printableBase64 += String.fromCharCode(printableBytes[i]);
    }
    printableBase64 = btoa(printableBase64);

    // Send email with attachment
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Postales <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "📮 Postal de Prueba - Vista Previa + PDF para Imprimir",
        html: emailHtml,
        attachments: [
          {
            filename: "postal_10x15cm.html",
            content: printableBase64,
            type: "text/html",
          }
        ],
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully with printable attachment:", emailResponse);

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
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
