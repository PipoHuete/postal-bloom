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

// PDF generation moved to ../_shared/pdf.ts

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
