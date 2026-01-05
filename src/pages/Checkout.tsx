import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { usePostcard } from '@/contexts/PostcardContext';
import { FILTERS, FontStyle } from '@/types/postcard';
import { CreditCard, MapPin, Mail, Send, TestTube, Loader2, Stamp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const { postcard } = usePostcard();
  const [isSendingTest, setIsSendingTest] = useState(false);
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

  const handlePay = () => {
    // Stripe integration will go here
    toast.info('Integración con Stripe pendiente - Precio: 2,68€');
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    
    try {
      // Obtener el email del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('No se pudo obtener tu email. Inicia sesión de nuevo.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-test-postcard', {
        body: {
          recipientEmail: user.email, // Usar el email del usuario autenticado
          postcardData: {
            imageUrl: postcard.image?.url || '',
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

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header title="Carrito" showBack />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Postcard Previews */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Tu Postal
          </h2>
          
          {/* Front Preview (Anverso) */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Anverso</p>
            <div className="postcard-container aspect-[3/2] relative overflow-hidden">
              {postcard.image && (
                <img
                  src={postcard.image.url}
                  alt="Anverso de tu postal"
                  className="w-full h-full object-cover"
                  style={{ filter: filterOption?.cssFilter || 'none' }}
                />
              )}
            </div>
          </div>

          {/* Back Preview (Dorso) */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">Dorso</p>
            <div className="postcard-container bg-postcard-cream p-4 aspect-[3/2]">
              <div className="flex gap-3 h-full">
                {/* Left Side - Message */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <p className={`text-foreground text-xs leading-relaxed ${fontClass} line-clamp-6`}>
                    {postcard.message || '(Sin mensaje)'}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px bg-border" />

                {/* Right Side - Address */}
                <div className="flex-1 flex flex-col gap-1">
                  {/* Stamp Area */}
                  <div className="flex justify-end mb-2">
                    <div className="w-10 h-12 border-2 border-dashed border-postcard-stamp flex items-center justify-center">
                      <Stamp className="w-5 h-5 text-postcard-stamp" />
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Summary */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Dirección de Envío
          </h2>
          
          <div className="bg-secondary rounded-lg p-4 space-y-1">
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
          </div>
        </div>

        {/* Price Summary */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Resumen del Pago
          </h2>
          
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Subtotal</span>
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
        </div>

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

        {/* Pay Button */}
        <Button
          variant="postcard-nav"
          size="xl"
          className="w-full"
          onClick={handlePay}
        >
          <Send className="w-5 h-5 mr-2" />
          Pagar y Enviar Postal
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Tu postal será impresa y enviada en 24-48h laborables
        </p>
      </main>
    </div>
  );
}
