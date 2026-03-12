import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { ImageCropper } from '@/components/gallery/ImageCropper';
import { usePostcard } from '@/contexts/PostcardContext';
import { Button } from '@/components/ui/button';
import { Camera, ImagePlus, Images } from 'lucide-react';
import { PostcardImage } from '@/types/postcard';
import { supabase } from '@/integrations/supabase/client';

const DEMO_IMAGES: PostcardImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300' },
  { id: '2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300' },
  { id: '3', url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800', thumbnail: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=300' },
  { id: '4', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300' },
  { id: '5', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300' },
  { id: '6', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', thumbnail: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300' },
  { id: '7', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800', thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=300' },
  { id: '8', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800', thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300' },
  { id: '9', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', thumbnail: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=300' },
];

export default function Gallery() {
  const navigate = useNavigate();
  const { postcard, setImage } = usePostcard();
  const [selectedId, setSelectedId] = useState<string | null>(postcard.image?.id || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ id: string; originalUrl: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const openCropper = (id: string, url: string) => {
    setPendingImage({ id, originalUrl: url });
    setCropImageUrl(url);
  };

  const handleSelect = (image: PostcardImage) => {
    openCropper(image.id, image.url);
  };

  const handleCropComplete = (croppedBlobUrl: string) => {
    if (!pendingImage) return;
    const newImage: PostcardImage = {
      id: pendingImage.id,
      url: croppedBlobUrl,
      thumbnail: croppedBlobUrl,
      filter: 'none',
    };
    setImage(newImage);
    setSelectedId(newImage.id);
    setCropImageUrl(null);
    setPendingImage(null);
  };

  const handleCropCancel = () => {
    setCropImageUrl(null);
    setPendingImage(null);
  };

  const handleNext = () => {
    if (selectedId) {
      navigate('/editor');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const id = `upload-${Date.now()}`;
      openCropper(id, url);
    }
    // Reset input so the same file can be re-selected
    event.target.value = '';
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <>
      <Helmet>
        <title>Selecciona tu Foto | Crear Postal Personalizada - SelfiePostal</title>
        <meta name="description" content="Elige una foto de tu galería o haz una selfie para crear tu postal vintage personalizada. Sube tu imagen y aplica filtros retro únicos." />
        <link rel="canonical" href="https://selfiepostal.com/gallery" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen pb-24">
        <Header title="Selecciona Foto" showClose />
        
        <main className="container px-4 py-6 max-w-lg mx-auto">
          <section className="flex gap-3 mb-6" aria-label="Opciones para añadir foto">
            <Button
              variant="postcard-primary"
              className="flex-1"
              onClick={handleCameraClick}
              aria-label="Tomar foto con la cámara para postal personalizada"
            >
              <Camera className="w-5 h-5 mr-2" aria-hidden="true" />
              Cámara
            </Button>
            <Button
              variant="postcard-primary"
              className="flex-1"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Subir foto desde galería para postal vintage"
            >
              <ImagePlus className="w-5 h-5 mr-2" aria-hidden="true" />
              Subir
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden="true"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              aria-hidden="true"
            />
          </section>

          <div className="flex items-center gap-2 mb-4">
            <Images className="w-5 h-5 text-primary" aria-hidden="true" />
            <h1 className="font-display text-lg font-semibold">Galería de Fotos para tu Postal</h1>
          </div>

          <GalleryGrid
            images={DEMO_IMAGES}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </main>

        <NavigationBar
          showBack={false}
          nextLabel="Continuar"
          onNext={handleNext}
          nextDisabled={!selectedId}
        />
      </div>

      {/* Image Cropper */}
      {cropImageUrl && (
        <ImageCropper
          imageUrl={cropImageUrl}
          isOpen={true}
          onClose={handleCropCancel}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
