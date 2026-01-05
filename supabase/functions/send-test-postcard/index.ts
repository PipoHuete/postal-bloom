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
          .recipient-info { background: #f0ebf7; padding: 20px; border-radius: 8px; }
          .recipient-info h3 { margin: 0 0 12px 0; color: #6b5b8c; font-size: 14px; text-transform: uppercase; }
          .info-row { display: flex; margin-bottom: 8px; }
          .info-label { font-weight: bold; width: 100px; color: #666; font-size: 13px; }
          .info-value { color: #333; font-size: 13px; }
          .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📮 Postal de Prueba</h1>
          </div>
          <div class="content">
            <!-- Front (Anverso) -->
            <div class="postcard">
              <div class="postcard-label">📷 Anverso</div>
              <img src="${postcardData.imageUrl}" alt="Postal" class="front-image" style="filter: ${postcardData.imageFilter};" />
            </div>
            
            <!-- Back (Dorso) -->
            <div class="postcard">
              <div class="postcard-label">✉️ Dorso</div>
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

            <!-- Recipient Information for Printing -->
            <div class="recipient-info">
              <h3>📦 Datos para Impresión y Envío</h3>
              <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span class="info-value">${postcardData.recipientName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Dirección:</span>
                <span class="info-value">${postcardData.addressLine1}${postcardData.addressLine2 ? ', ' + postcardData.addressLine2 : ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">CP:</span>
                <span class="info-value">${postcardData.postalCode}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ciudad:</span>
                <span class="info-value">${postcardData.city}</span>
              </div>
              ${postcardData.country ? `
              <div class="info-row">
                <span class="info-label">País:</span>
                <span class="info-value">${postcardData.country}</span>
              </div>
              ` : ''}
            </div>
          </div>
          <div class="footer">
            Este es un email de prueba generado por la aplicación de postales.
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend API directly
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Postales <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "📮 Postal de Prueba - Vista Previa",
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

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
