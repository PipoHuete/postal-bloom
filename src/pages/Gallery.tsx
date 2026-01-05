import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { NavigationBar } from '@/components/layout/NavigationBar';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { usePostcard } from '@/contexts/PostcardContext';
import { Button } from '@/components/ui/button';
import { Camera, ImagePlus, Images } from 'lucide-react';
import { PostcardImage } from '@/types/postcard';
import { supabase } from '@/integrations/supabase/client';

// Demo images - in production these would come from the device gallery
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate('/auth');
      }
    });
  }, [navigate]);

  const handleSelect = (image: PostcardImage) => {
    setSelectedId(image.id);
    setImage({ ...image, filter: 'none' });
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
      const newImage: PostcardImage = {
        id: `upload-${Date.now()}`,
        url,
        thumbnail: url,
        filter: 'none',
      };
      setImage(newImage);
      setSelectedId(newImage.id);
    }
  };

  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Nueva Postal" showClose />
      
      <main className="container px-4 py-6 max-w-lg mx-auto">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="postcard"
            className="flex-1"
            onClick={handleCameraClick}
          >
            <Camera className="w-5 h-5 mr-2" />
            Cámara
          </Button>
          <Button
            variant="postcard"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-5 h-5 mr-2" />
            Subir
          </Button>
          {/* Camera input - opens camera directly on mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />
          {/* File input - opens gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2 mb-4">
          <Images className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Galería</h2>
        </div>

        {/* Gallery Grid */}
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
  );
}
