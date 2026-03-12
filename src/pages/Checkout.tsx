import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { usePostcard } from '@/contexts/PostcardContext';
import { PaymentSimulationModal } from '@/components/checkout/PaymentSimulationModal';
import { FILTERS, FontStyle } from '@/types/postcard';
import { CreditCard, MapPin, Mail, Send, TestTube, Loader2, Stamp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { uploadPostcardImage } from '@/lib/uploadImage';

const FONT_CLASS_MAP: Record<FontStyle, string> = {
  caveat: 'font-caveat',
  dancing: 'font-dancing',
  vibes: 'font-vibes',
  lora: 'font-lora',
  merriweather: 'font-merriweather',
  mono: 'font-mono',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { postcard, resetPostcard } = usePostcard();
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const filterOption = FILTERS.find(f => f.id === (postcard.image?.filter || 'none'));
  const fontClass = FONT_CLASS_MAP[postcard.fontStyle] || 'font-caveat';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth', { replace: true });
      }
      setCheckingAuth(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth', { replace: true });
      }
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('No se pudo obtener tu email. Inicia sesión de nuevo.');
        return;
      }

      if (!postcard.recipientName || !postcard.addressLine1 || !postcard.postalCode || !postcard.city) {
        toast.error('Faltan datos del destinatario. Vuelve al editor.');
        return;
      }

      // Upload image to storage to get a public URL
      let publicImageUrl = postcard.image?.url || '';
      if (publicImageUrl) {
        try {
          publicImageUrl = await uploadPostcardImage(publicImageUrl);
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
        }
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          email: user.email,
          recipient_name: postcard.recipientName,
          recipient_address: postcard.addressLine1 + (postcard.addressLine2 ? `, ${postcard.addressLine2}` : ''),
          recipient_postal_code: postcard.postalCode,
          recipient_city: postcard.city,
          image_url: publicImageUrl || null,
          image_filter: postcard.image?.filter || 'none',
          message: postcard.message || '',
          font_style: postcard.fontStyle,
          price_cents: 268,
          status: 'pendiente',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Send order confirmation email (non-blocking)
      try {
        await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId: order.id,
            recipientEmail: user.email,
            postcardData: {
              imageUrl: publicImageUrl,
              imageFilter: filterOption?.cssFilter || 'none',
              message: postcard.message,
              fontStyle: postcard.fontStyle,
              recipientName: postcard.recipientName,
              addressLine1: postcard.addressLine1,
              addressLine2: postcard.addressLine2,
              postalCode: postcard.postalCode,
              city: postcard.city,
              country: postcard.country,
            },
          },
        });
        console.log('Order confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't block the flow - order is already saved
      }

      // Reset postcard and navigate to success
      resetPostcard();
      navigate(`/order-success?order=${order.id}`);
      
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error('Error al crear el pedido. Inténtalo de nuevo.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('No se pudo obtener tu email. Inicia sesión de nuevo.');
        return;
      }

      // Upload image to get a public URL
      let publicImageUrl = postcard.image?.url || '';
      if (publicImageUrl) {
        try {
          publicImageUrl = await uploadPostcardImage(publicImageUrl);
        } catch (uploadErr) {
          console.error('Error uploading image:', uploadErr);
          toast.error('Error al subir la imagen');
          return;
        }
      }

      const { data, error } = await supabase.functions.invoke('send-test-postcard', {
        body: {
          recipientEmail: user.email,
          postcardData: {
            imageUrl: publicImageUrl,
            imageFilter: filterOption?.cssFilter || 'none',
            message: postcard.message,
            fontStyle: postcard.fontStyle,
            recipientName: postcard.recipientName,
            addressLine1: postcard.addressLine1,
            addressLine2: postcard.addressLine2,
            postalCode: postcard.postalCode,
            city: postcard.city,
            country: postcard.country,
          },
        },
      });

      if (error) throw error;

      toast.success(`¡Email de prueba enviado a ${user.email}!`);
    } catch (error: any) {
      toast.error('Error al enviar el email de prueba');
    } finally {
      setIsSendingTest(false);
    }
  };

  // JSON-LD Product Schema for SEO/GEO
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Custom Postcard - Postal Personalizada",
    "description": "Postal física personalizada con tu foto y mensaje. Impresión premium en papel vintage de alta calidad.",
    "image": postcard.image?.url || "",
    "brand": {
      "@type": "Brand",
      "name": "SelfiePostal"
    },
    "offers": {
      "@type": "Offer",
      "price": "2.68",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "seller": {
        "@type": "Organization",
        "name": "SelfiePostal"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Confirmar Postal Personalizada | Carrito - SelfiePostal</title>
        <meta name="description" content="Revisa tu postal vintage personalizada antes de enviarla. Impresión premium en papel de alta calidad y envío físico real en 24-48h laborables." />
        <link rel="canonical" href="https://selfiepostal.com/checkout" />
        <meta name="robots" content="noindex, nofollow" />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen pb-8">
        <Header title="Carrito" showBack />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Postcard Previews */}
        <section className="mb-6" aria-label="Vista previa de tu postal">
          <h1 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
            Tu Postal Personalizada
          </h1>
          
          {/* Front Preview (Anverso) */}
          <figure className="mb-4">
            <figcaption className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Anverso</figcaption>
            <div className="postcard-container aspect-[3/2] relative overflow-hidden">
              {postcard.image && (
                <img
                  src={postcard.image.url}
                  alt={`Postal vintage personalizada con filtro retro ${filterOption?.name || 'original'} - lista para enviar por correo físico`}
                  className="w-full h-full object-cover"
                  style={{ filter: filterOption?.cssFilter || 'none' }}
                  loading="lazy"
                />
              )}
            </div>
          </figure>

          {/* Back Preview (Dorso) */}
          <figure>
            <figcaption className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Dorso</figcaption>
            <div className="postcard-container bg-postcard-cream p-4 aspect-[3/2]">
              <div className="flex gap-3 h-full">
                {/* Left Side - Message */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <p className={`text-foreground text-xs leading-relaxed ${fontClass} line-clamp-6`}>
                    {postcard.message || '(Sin mensaje)'}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px bg-border" aria-hidden="true" />

                {/* Right Side - Address */}
                <address className="flex-1 flex flex-col gap-1 not-italic">
                  {/* Stamp Area */}
                  <div className="flex justify-end mb-2">
                    <div className="w-10 h-12 border-2 border-dashed border-postcard-stamp flex items-center justify-center">
                      <Stamp className="w-5 h-5 text-postcard-stamp" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="text-xs space-y-0.5 mt-auto">
                    <p className="font-medium truncate">{postcard.recipientName}</p>
                    <p className="text-muted-foreground truncate">{postcard.addressLine1}</p>
                    <p className="text-muted-foreground truncate">
                      {postcard.postalCode} {postcard.city}
                    </p>
                  </div>
                </address>
              </div>
            </div>
          </figure>
        </section>

        {/* Address Summary */}
        <section className="mb-6" aria-label="Dirección de envío de la postal">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
            Dirección de Envío
          </h2>
          
          <address className="bg-secondary rounded-lg p-4 space-y-1 not-italic">
            <p className="font-medium">{postcard.recipientName}</p>
            <p className="text-sm text-muted-foreground">{postcard.addressLine1}</p>
            {postcard.addressLine2 && (
              <p className="text-sm text-muted-foreground">{postcard.addressLine2}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {postcard.postalCode} {postcard.city}
            </p>
            {postcard.country && (
              <p className="text-sm text-muted-foreground">{postcard.country}</p>
            )}
          </address>
        </section>

        {/* Price Summary */}
        <section className="mb-6" aria-label="Resumen del pago">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" aria-hidden="true" />
            Resumen del Pago
          </h2>
          
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal (postal personalizada)</span>
              <span className="font-medium">2,21€</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">IVA (21%)</span>
              <span className="font-medium">0,47€</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-display font-semibold text-lg">Total</span>
                <span className="font-display font-bold text-xl text-primary">2,68€</span>
              </div>
            </div>
          </div>
        </section>

        {/* Test Email Button */}
        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={handleSendTest}
          disabled={isSendingTest}
        >
          {isSendingTest ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="w-4 h-4 mr-2" />
          )}
          {isSendingTest ? 'Enviando...' : 'Enviar Prueba por Mail'}
        </Button>

        {/* Order Button */}
        <Button
          variant="postcard-nav"
          size="xl"
          className="w-full"
          onClick={() => setShowPaymentModal(true)}
        >
          <Send className="w-5 h-5 mr-2" />
          Pagar y Enviar - 2,68€
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Tu postal será impresa y enviada en 24-48h laborables
        </p>
      </main>
      </div>

      {/* Payment Simulation Modal */}
      <PaymentSimulationModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePlaceOrder}
        isLoading={isPlacingOrder}
      />
    </>
  );
}
