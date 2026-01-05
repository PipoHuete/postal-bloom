import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, MapPin, Stamp, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderData {
  id: string;
  recipient_name: string;
  recipient_address: string;
  recipient_postal_code: string;
  recipient_city: string;
  created_at: string;
}

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, recipient_name, recipient_address, recipient_postal_code, recipient_city, created_at')
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Stamp className="w-12 h-12 text-primary mx-auto animate-bounce" />
          <p className="mt-4 font-display">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>¡Pedido Recibido! - SelfiePostal</title>
        <meta name="description" content="Tu postal personalizada ha sido recibida y será impresa y enviada en breve." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="min-h-screen pb-8">
        <Header title="Confirmación" />
        
        <main className="container px-4 py-8 max-w-lg mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              {/* Vintage stamp circle */}
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-dashed border-primary flex items-center justify-center bg-postcard-cream animate-[spin_20s_linear_infinite]">
                <div className="absolute inset-2 rounded-full border-2 border-primary/30" />
              </div>
              
              {/* Checkmark overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            
            <h1 className="font-display text-3xl font-bold text-primary mt-6 mb-2">
              ¡Pedido Recibido!
            </h1>
            
            <p className="text-muted-foreground">
              Tu postal está lista para ser impresa
            </p>
          </div>

          {/* Order Details Card */}
          <div className="postcard-container bg-postcard-cream p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-display font-semibold text-sm uppercase tracking-wider text-primary">
                  Número de Pedido
                </p>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  {order?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                </p>
              </div>
            </div>

            <div className="border-t border-postcard-stamp/30 pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-display font-semibold text-sm uppercase tracking-wider text-primary">
                    Envío a
                  </p>
                  <div className="text-sm mt-1 space-y-0.5">
                    <p className="font-medium">{order?.recipient_name}</p>
                    <p className="text-muted-foreground">{order?.recipient_address}</p>
                    <p className="text-muted-foreground">
                      {order?.recipient_postal_code} {order?.recipient_city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative stamp */}
            <div className="flex justify-end mt-4">
              <div className="w-16 h-20 border-2 border-dashed border-postcard-stamp flex flex-col items-center justify-center bg-postcard-cream/50">
                <Stamp className="w-8 h-8 text-postcard-stamp" />
                <span className="text-[8px] text-postcard-stamp font-mono mt-1">2,68€</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-secondary rounded-lg p-4 mb-6">
            <h2 className="font-display font-semibold mb-3">¿Qué pasa ahora?</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Recibirás un email de confirmación
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Imprimiremos tu postal en papel premium
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                La enviaremos en 24-48h laborables
              </li>
            </ul>
          </div>

          {/* Return Button */}
          <Button
            variant="postcard-nav"
            size="xl"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            ¿Dudas? Escríbenos a hola@selfiepostal.com
          </p>
        </main>
      </div>
    </>
  );
}
