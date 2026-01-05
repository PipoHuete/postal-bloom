import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send, Heart, Sparkles } from 'lucide-react';
import portadaImage from '@/assets/portada.jpg';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <img 
            src={portadaImage} 
            alt="SelfiePostal - Envía postales personalizadas" 
            className="w-full h-auto rounded-2xl shadow-hover object-cover"
          />
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl font-bold text-foreground text-center mb-4 animate-fade-in">
          Saludos desde Roma!!
        </h1>
        
        <p className="text-muted-foreground text-center max-w-xs mb-8 animate-fade-in">
          Envía postales físicas personalizadas a cualquier parte del mundo
        </p>

        {/* Features */}
        <div className="flex gap-6 mb-12 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Filtros</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Personal</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Envío 24h</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="postcard-nav"
          size="xl"
          onClick={() => navigate('/gallery')}
          className="animate-fade-in"
        >
          Crear Postal
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Desde <span className="font-semibold text-primary">2,68€</span> por postal
        </p>
      </footer>
    </div>
  );
}
