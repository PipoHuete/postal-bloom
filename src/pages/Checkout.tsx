import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { usePostcard } from '@/contexts/PostcardContext';
import { FILTERS } from '@/types/postcard';
import { CreditCard, MapPin, Mail, Send } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { postcard } = usePostcard();
  const filterOption = FILTERS.find(f => f.id === (postcard.image?.filter || 'none'));

  const handlePay = () => {
    // Stripe integration will go here
    alert('Integración con Stripe pendiente - Precio: 2,68€');
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header title="Resumen" showBack />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Postcard Preview */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Tu Postal
          </h2>
          
          <div className="postcard-container aspect-[4/3] relative overflow-hidden mb-4">
            {postcard.image && (
              <img
                src={postcard.image.url}
                alt="Tu postal"
                className="w-full h-full object-cover"
                style={{ filter: filterOption?.cssFilter || 'none' }}
              />
            )}
          </div>

          {/* Message Preview */}
          {postcard.message && (
            <div className="bg-postcard-cream rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground italic">"{postcard.message}"</p>
            </div>
          )}
        </div>

        {/* Address Summary */}
        <div className="mb-8">
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
            <p className="text-sm text-muted-foreground">{postcard.country}</p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Resumen del Pago
          </h2>
          
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Postal personalizada</span>
              <span className="font-medium">2,00€</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Envío</span>
              <span className="font-medium">0,68€</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-display font-semibold text-lg">Total</span>
                <span className="font-display font-bold text-xl text-primary">2,68€</span>
              </div>
            </div>
          </div>
        </div>

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
