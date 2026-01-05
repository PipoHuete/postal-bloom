import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { PostcardTabs } from '@/components/postcard/PostcardTabs';
import { PostcardFront } from '@/components/postcard/PostcardFront';
import { PostcardBack } from '@/components/postcard/PostcardBack';
import { usePostcard } from '@/contexts/PostcardContext';

export default function Editor() {
  const navigate = useNavigate();
  const { postcard } = usePostcard();
  const [activeTab, setActiveTab] = useState<'anverso' | 'dorso'>('anverso');

  const handleBack = () => {
    if (activeTab === 'dorso') {
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
    } else {
      const missing = getMissingFields();
      if (missing.length > 0) {
        toast.error(`Faltan campos: ${missing.join(', ')}`);
        return;
      }
      navigate('/checkout');
    }
  };

  const isNextDisabled = () => {
    if (activeTab === 'anverso') {
      return !postcard.image;
    }
    // En dorso, siempre habilitado - la validación se hace al hacer clic
    return false;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Editar Postal" showBack />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Tabs */}
        <div className="mb-6">
          <PostcardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === 'anverso' ? <PostcardFront /> : <PostcardBack />}
        </div>
      </main>

      <NavigationBar
        onBack={handleBack}
        onNext={handleNext}
        backLabel={activeTab === 'dorso' ? 'Anverso' : 'Galería'}
        nextLabel={activeTab === 'dorso' ? 'Pagar' : 'Dorso'}
        nextDisabled={isNextDisabled()}
      />
    </div>
  );
}
