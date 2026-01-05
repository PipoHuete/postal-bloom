import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    navigate('/gallery');
  };

  const handleNext = () => {
    if (activeTab === 'anverso') {
      setActiveTab('dorso');
    } else {
      navigate('/checkout');
    }
  };

  const isNextDisabled = () => {
    if (activeTab === 'anverso') {
      return !postcard.image;
    }
    // For dorso, check if required address fields are filled
    return !postcard.recipientName || !postcard.addressLine1 || !postcard.city || !postcard.postalCode || !postcard.country;
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
