import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
}

interface GalleryGridProps {
  images: GalleryImage[];
  selectedId: string | null;
  onSelect: (image: GalleryImage) => void;
}

export function GalleryGrid({ images, selectedId, onSelect }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image) => (
        <button
          key={image.id}
          onClick={() => onSelect(image)}
          className={cn(
            'relative aspect-square rounded-lg overflow-hidden transition-all duration-200 group',
            selectedId === image.id 
              ? 'ring-2 ring-primary ring-offset-2 scale-[0.98]' 
              : 'hover:scale-[1.02]'
          )}
        >
          <img
            src={image.thumbnail || image.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {selectedId === image.id && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
