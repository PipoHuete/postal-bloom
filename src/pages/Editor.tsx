import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { PostcardTabs } from '@/components/postcard/PostcardTabs';
import { PostcardFront } from '@/components/postcard/PostcardFront';
import { PostcardBack } from '@/components/postcard/PostcardBack';
import { PostcardPreview } from '@/components/postcard/PostcardPreview';
import { PostcardBack } from '@/components/postcard/PostcardBack';
import { usePostcard } from '@/contexts/PostcardContext';
import { supabase } from '@/integrations/supabase/client';

export default function Editor() {
  const navigate = useNavigate();
  const { postcard } = usePostcard();
  const [activeTab, setActiveTab] = useState<'anverso' | 'dorso' | 'preview'>('anverso');
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const handleBack = () => {
    if (activeTab === 'preview') {
      setActiveTab('dorso');
    } else if (activeTab === 'dorso') {
      setActiveTab('anverso');
    } else {
      navigate('/gallery');
    }
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!postcard.message || postcard.message.trim() === '') {
      missing.push('mensaje');
    }
    if (!postcard.contact && !postcard.recipientName) {
      missing.push('destinatario');
    }
    return missing;
  };

  const handleNext = () => {
    if (activeTab === 'anverso') {
      setActiveTab('dorso');
    } else if (activeTab === 'dorso') {
      const missing = getMissingFields();
      if (missing.length > 0) {
        toast.error(`Faltan campos: ${missing.join(', ')}`);
        return;
      }
      setActiveTab('preview');
    } else {
      navigate('/checkout');
    }
  };

  const isNextDisabled = () => {
    if (activeTab === 'anverso') {
      return !postcard.image;
    }
    return false;
  };

  const isNextDisabled = () => {
    if (activeTab === 'anverso') {
      return !postcard.image;
    }
    // En dorso, siempre habilitado - la validación se hace al hacer clic
    return false;
  };

  return (
    <>
      <Helmet>
        <title>Personaliza tu Postal Vintage | Filtros Retro - SelfiePostal</title>
        <meta name="description" content="Aplica filtros vintage y retro a tu foto, escribe un mensaje personalizado y añade la dirección del destinatario. Crea una postal única en minutos." />
        <link rel="canonical" href="https://selfiepostal.com/editor" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pb-24">
        <Header title="Personaliza tu Postal" showBack />
        
        <main className="container px-4 py-6 max-w-lg mx-auto">
          {/* Tabs */}
          <nav className="mb-6" aria-label="Pasos de edición de postal">
            <PostcardTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </nav>

          {/* Content */}
          <section aria-label={activeTab === 'anverso' ? 'Anverso de la postal - Foto y filtros' : 'Dorso de la postal - Mensaje y dirección'}>
            {activeTab === 'anverso' ? <PostcardFront /> : <PostcardBack />}
          </section>
        </main>

        <NavigationBar
          onBack={handleBack}
          onNext={handleNext}
          backLabel={activeTab === 'dorso' ? 'Anverso' : 'Galería'}
          nextLabel={activeTab === 'dorso' ? 'Pagar' : 'Dorso'}
          nextDisabled={isNextDisabled()}
        />
      </div>
    </>
  );
}
