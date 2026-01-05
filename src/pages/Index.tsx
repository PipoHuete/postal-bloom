import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send, Heart, Sparkles } from 'lucide-react';
import portadaImage from '@/assets/portada.png';

export default function Index() {
  const navigate = useNavigate();

  // JSON-LD Schema for Organization and Service
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SelfiePostal",
    "url": "https://selfiepostal.com",
    "logo": "https://selfiepostal.com/images/og-image.jpg",
    "description": "Servicio de postales personalizadas online con estilo vintage. Envía postales físicas reales a cualquier parte del mundo.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hola@selfiepostal.com",
      "contactType": "customer service"
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Postales Personalizadas Online",
    "description": "Crea postales personalizadas con tus fotos, aplica filtros vintage retro y envíalas por correo físico real. El regalo más original y emotivo.",
    "provider": {
      "@type": "Organization",
      "name": "SelfiePostal"
    },
    "areaServed": "Worldwide",
    "offers": {
      "@type": "Offer",
      "price": "2.68",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <Helmet>
        <title>Envía Postales Físicas Retro | Regalo Original y Personalizado - SelfiePostal</title>
        <meta name="description" content="Crea postales personalizadas online con estilo vintage y envíalas a cualquier parte del mundo. Postales físicas reales desde 2,68€. ¡El regalo más emotivo!" />
        <link rel="canonical" href="https://selfiepostal.com/" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          {/* Hero Image */}
          <figure className="mb-8 animate-fade-in w-full max-w-lg">
            <img 
              src={portadaImage} 
              alt="Postal vintage personalizada con filtro retro - ejemplo de postal física que puedes crear y enviar" 
              className="w-full h-auto rounded-2xl shadow-hover object-cover"
              loading="eager"
              width="512"
              height="341"
            />
          </figure>

          {/* Main Heading - H1 optimizado para SEO */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-4 animate-fade-in">
            Envía Postales Físicas con Estilo Retro a Cualquier Parte del Mundo
          </h1>
          
          <p className="text-foreground text-center max-w-md mb-8 animate-fade-in">
            Crea <strong>postales personalizadas online</strong> con tus fotos, aplica filtros vintage y envía un <strong>regalo original y emotivo</strong> por correo tradicional
          </p>

          {/* Features Section */}
          <section aria-label="Características principales" className="flex gap-6 mb-12 animate-fade-in">
            <article className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-xs text-muted-foreground">Filtros Vintage</h2>
            </article>
            <article className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-xs text-muted-foreground">Regalo Emotivo</h2>
            </article>
            <article className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-xs text-muted-foreground">Envío Real 24h</h2>
            </article>
          </section>

          {/* CTA Button */}
          <Button
            variant="postcard-nav"
            size="xl"
            onClick={() => navigate('/gallery')}
            className="animate-fade-in"
            aria-label="Comenzar a crear tu postal personalizada"
          >
            Crear Postal Personalizada
          </Button>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Postales físicas reales</strong> desde <span className="font-semibold text-primary">2,68€</span> · Envío en 24-48h
          </p>
        </footer>
      </div>
    </>
  );
}
