import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Send, Heart, Sparkles, Palette, PenLine, Mail, Stamp } from 'lucide-react';
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

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cómo enviar una postal personalizada",
    "description": "Crea y envía postales físicas personalizadas con estilo retro en 3 sencillos pasos",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Crea",
        "text": "Sube tu foto y personaliza tu diseño con filtros vintage en nuestro editor"
      },
      {
        "@type": "HowToStep",
        "name": "Escribe",
        "text": "Añade un mensaje personal con tipografías manuscritas"
      },
      {
        "@type": "HowToStep",
        "name": "Envía",
        "text": "Nosotros la imprimimos en papel premium 10x15cm y la enviamos por correo real"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Envía Postales Físicas Retro | Regalo Original y Personalizado - SelfiePostal</title>
        <meta name="description" content="Recupera la magia de lo físico. Crea postales personalizadas online con estilo retro y envíalas por correo real. Desde 2,68€, envío en 24-48h a todo el mundo." />
        <link rel="canonical" href="https://selfiepostal.com/" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center px-6 py-12">
          {/* Hero Image */}
          <figure className="mb-8 animate-fade-in w-full max-w-2xl px-0">
            <img 
              src={portadaImage} 
              alt="Postal vintage personalizada con filtro retro - ejemplo de postal física que puedes crear y enviar" 
              className="w-full h-auto rounded-2xl shadow-hover object-cover"
              loading="eager"
              width="672"
              height="448"
            />
          </figure>

          {/* Main Heading - H1 optimizado para SEO */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-4 animate-fade-in leading-tight">
            Recupera la magia de lo físico
          </h1>
          
          <p className="text-foreground text-center max-w-md mb-6 animate-fade-in text-lg">
            Envía <strong>postales personalizadas</strong> con el encanto retro de antes y la tecnología de ahora
          </p>

          {/* Trust Block */}
          <p className="text-muted-foreground text-center max-w-sm mb-10 animate-fade-in text-sm italic border-l-2 border-primary/30 pl-4">
            Tus recuerdos impresos en papel de calidad, enviados desde nuestro buzón al suyo
          </p>

          {/* Features Section */}
          <section aria-label="Características principales" className="flex gap-6 mb-12 animate-fade-in">
            <article className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <h2 className="text-xs text-muted-foreground">Estilo Retro</h2>
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
              <h2 className="text-xs text-muted-foreground">Envío Físico</h2>
            </article>
          </section>

          {/* CTA Button */}
          <Button
            variant="postcard-nav"
            size="xl"
            onClick={() => navigate('/gallery')}
            className="animate-fade-in mb-16"
            aria-label="Comenzar a crear tu postal personalizada"
          >
            Crear Mi Postal
          </Button>

          {/* How It Works Section */}
          <section className="w-full max-w-lg animate-fade-in" aria-labelledby="how-it-works-title">
            <h2 id="how-it-works-title" className="font-display text-2xl font-bold text-foreground text-center mb-8">
              Cómo funciona
            </h2>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <article className="flex items-start gap-4 bg-secondary/50 rounded-xl p-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-primary/30">
                  <Palette className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    1. Crea
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Personaliza tu diseño con nuestro editor vintage. Sube tu foto y aplica filtros con <strong>estilo retro</strong> auténtico.
                  </p>
                </div>
              </article>

              {/* Step 2 */}
              <article className="flex items-start gap-4 bg-secondary/50 rounded-xl p-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-primary/30">
                  <PenLine className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    2. Escribe
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Añade un mensaje personal que llegará al corazón. Elige entre tipografías manuscritas que dan calidez a tus palabras.
                  </p>
                </div>
              </article>

              {/* Step 3 */}
              <article className="flex items-start gap-4 bg-secondary/50 rounded-xl p-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-primary/30">
                  <Mail className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                    3. Envía
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Nosotros la imprimimos en alta calidad (10×15 cm) y la enviamos por correo real. <strong>Envío físico</strong> en 24-48h a todo el mundo.
                  </p>
                </div>
              </article>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-border/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stamp className="w-5 h-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <strong>Postales personalizadas</strong> desde <span className="font-semibold text-primary">2,68€</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Impresión premium · Envío físico real · Estilo retro único
          </p>
        </footer>
      </div>
    </>
  );
}
