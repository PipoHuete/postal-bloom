import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generatePostcardPDF } from "../_shared/pdf.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
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

async function generatePostcardPDF(postcardData: OrderConfirmationRequest['postcardData']): Promise<string> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'cm',
    format: [10, 15]
  });

  const pageWidth = 15;
  const pageHeight = 10;

  // === PAGE 1: FRONT (Image) ===
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
        doc.setFillColor(200, 200, 200);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text('Imagen no disponible', pageWidth / 2, pageHeight / 2, { align: 'center' });
      }
    }
  }

  doc.setFontSize(6);
  doc.setTextColor(255, 255, 255);
  doc.text('ANVERSO', 0.3, pageHeight - 0.3);

  // === PAGE 2: BACK (Message + Address) ===
  doc.addPage([10, 15], 'landscape');

  doc.setFillColor(250, 248, 245);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([0.1, 0.1], 0);
  doc.line(pageWidth / 2, 0.5, pageWidth / 2, pageHeight - 0.5);
  doc.setLineDashPattern([], 0);

  const messageX = 0.5;
  const messageY = 1;
  const messageWidth = (pageWidth / 2) - 1;

  let fontName = 'courier';
  if (postcardData.fontStyle === 'bradley' || postcardData.fontStyle === 'snell') {
    fontName = 'helvetica';
  }
  
  doc.setFont(fontName, postcardData.fontStyle === 'snell' ? 'italic' : 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  const message = postcardData.message || '(Sin mensaje)';
  const splitMessage = doc.splitTextToSize(message, messageWidth);
  doc.text(splitMessage, messageX, messageY);

  const addressX = (pageWidth / 2) + 0.5;

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

  doc.setFontSize(6);
  doc.setTextColor(150, 150, 150);
  doc.text('DORSO - Postal 10x15cm', 0.3, pageHeight - 0.3);

  const pdfOutput = doc.output('datauristring');
  const base64 = pdfOutput.split(',')[1];
  
  return base64;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, recipientEmail, postcardData }: OrderConfirmationRequest = await req.json();

    console.log("Sending order confirmation email to:", recipientEmail);
    console.log("Order ID:", orderId);
    console.log("Postcard data:", JSON.stringify(postcardData, null, 2));

    // Generate PDF
    console.log("Generating PDF...");
    const pdfBase64 = await generatePostcardPDF(postcardData);
    console.log("PDF generated successfully, size:", pdfBase64.length);

    // Retro-styled HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Tu Postal Está en Camino!</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Special+Elite&display=swap');
          
          body { 
            font-family: Georgia, 'Times New Roman', serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f0e6;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4c5a9' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E");
          }
          
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #fffef9; 
            border-radius: 4px; 
            overflow: hidden; 
            box-shadow: 0 8px 32px rgba(139, 90, 43, 0.15);
            border: 3px solid #d4b896;
          }
          
          .header { 
            background: linear-gradient(135deg, #8b5a2b 0%, #a0522d 50%, #8b5a2b 100%); 
            color: #f5f0e6; 
            padding: 32px 24px; 
            text-align: center;
            border-bottom: 4px solid #6b4423;
            position: relative;
          }
          
          .header::before {
            content: '✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉ ✉';
            position: absolute;
            top: 8px;
            left: 0;
            right: 0;
            font-size: 10px;
            letter-spacing: 2px;
            opacity: 0.5;
          }
          
          .header h1 { 
            margin: 0; 
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 28px; 
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            letter-spacing: 2px;
          }
          
          .header .subtitle {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 12px;
            margin-top: 8px;
            opacity: 0.9;
            letter-spacing: 3px;
            text-transform: uppercase;
          }
          
          .postmark {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%) rotate(-12deg);
            width: 70px;
            height: 70px;
            border: 3px solid rgba(245, 240, 230, 0.6);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.8;
          }
          
          .postmark .date {
            font-size: 10px;
            font-weight: bold;
          }
          
          .content { 
            padding: 32px 24px; 
            background: #fffef9;
          }
          
          .main-message {
            background: linear-gradient(to bottom, #f9f5eb, #f5f0e6);
            border: 2px solid #d4b896;
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            margin-bottom: 24px;
            position: relative;
          }
          
          .main-message::before,
          .main-message::after {
            content: '❦';
            position: absolute;
            font-size: 24px;
            color: #a0522d;
            opacity: 0.5;
          }
          
          .main-message::before { top: 8px; left: 16px; }
          .main-message::after { bottom: 8px; right: 16px; }
          
          .main-message h2 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 26px;
            color: #6b4423;
            margin: 0 0 12px 0;
            font-style: italic;
          }
          
          .main-message p {
            color: #8b7355;
            font-size: 15px;
            margin: 0;
            line-height: 1.6;
          }
          
          .order-details {
            background: #faf8f3;
            border: 1px dashed #c4a77d;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
          }
          
          .order-details h3 {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 14px;
            color: #6b4423;
            margin: 0 0 16px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #d4c5a9;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dotted #e8dcc8;
            font-size: 14px;
          }
          
          .detail-row:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            color: #8b7355;
          }
          
          .detail-value {
            color: #5a4630;
            font-weight: 600;
          }
          
          .address-section {
            background: #f9f5eb;
            border-left: 4px solid #a0522d;
            padding: 16px 20px;
            margin-bottom: 24px;
          }
          
          .address-section h4 {
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 12px;
            color: #a0522d;
            margin: 0 0 12px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          
          .address-section p {
            margin: 4px 0;
            color: #5a4630;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .pdf-notice {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border: 2px solid #81c784;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .pdf-notice h3 {
            font-family: 'Playfair Display', Georgia, serif;
            margin: 0 0 8px 0;
            color: #2e7d32;
            font-size: 16px;
          }
          
          .pdf-notice p {
            margin: 0;
            color: #388e3c;
            font-size: 13px;
          }
          
          .footer { 
            text-align: center; 
            padding: 24px; 
            background: linear-gradient(to bottom, #f5f0e6, #e8dcc8);
            border-top: 2px solid #d4b896;
          }
          
          .footer p {
            margin: 4px 0;
            color: #8b7355;
            font-size: 12px;
          }
          
          .footer .brand {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 18px;
            color: #6b4423;
            margin-bottom: 8px;
            font-weight: 700;
          }
          
          .stamp-decoration {
            display: inline-block;
            border: 2px solid #a0522d;
            padding: 8px 16px;
            margin-top: 12px;
            font-family: 'Special Elite', 'Courier New', monospace;
            font-size: 10px;
            color: #a0522d;
            text-transform: uppercase;
            letter-spacing: 3px;
            transform: rotate(-2deg);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="postmark">
              <span>CORREOS</span>
              <span class="date">${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
              <span>ESPAÑA</span>
            </div>
            <h1>🏤 OFICINA DE CORREOS</h1>
            <div class="subtitle">SelfiePostal • Servicio Premium</div>
          </div>
          
          <div class="content">
            <div class="main-message">
              <h2>¡Tu postal está en camino al buzón!</h2>
              <p>Hemos recibido tu pedido y estamos preparando tu postal personalizada con todo el cariño del mundo.</p>
            </div>
            
            <div class="order-details">
              <h3>📋 Detalles del Pedido</h3>
              <div class="detail-row">
                <span class="detail-label">Nº de Pedido</span>
                <span class="detail-value">#${orderId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estado</span>
                <span class="detail-value">✓ Confirmado</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tiempo de Entrega</span>
                <span class="detail-value">24-48h laborables</span>
              </div>
            </div>
            
            <div class="address-section">
              <h4>📍 Dirección de Envío</h4>
              <p><strong>${postcardData.recipientName}</strong></p>
              <p>${postcardData.addressLine1}</p>
              ${postcardData.addressLine2 ? `<p>${postcardData.addressLine2}</p>` : ''}
              <p>${postcardData.postalCode} ${postcardData.city}</p>
              ${postcardData.country ? `<p>${postcardData.country}</p>` : ''}
            </div>
            
            <div class="pdf-notice">
              <h3>📎 Tu Copia Digital</h3>
              <p>Hemos adjuntado un PDF con tu postal en formato 10x15cm, lista para imprimir como recuerdo.</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="brand">📮 SelfiePostal</div>
            <p>Transformando momentos en recuerdos tangibles</p>
            <div class="stamp-decoration">Gracias por tu confianza</div>
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
        from: "SelfiePostal <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "🏤 ¡Tu postal está en camino al buzón! - Pedido Confirmado",
        html: emailHtml,
        attachments: [
          {
            filename: `postal_${orderId.slice(0, 8)}_10x15cm.pdf`,
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

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to send confirmation email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
