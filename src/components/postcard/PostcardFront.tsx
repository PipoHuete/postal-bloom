import React from 'react';
import { usePostcard } from '@/contexts/PostcardContext';
import { ImageFilters } from './ImageFilters';
import { FILTERS } from '@/types/postcard';
import { ImagePlus } from 'lucide-react';

export function PostcardFront() {
  const { postcard, setFilter } = usePostcard();
  const activeFilter = postcard.image?.filter || 'none';
  const filterOption = FILTERS.find(f => f.id === activeFilter);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Image Preview Area */}
      <div className="postcard-container aspect-[4/3] relative overflow-hidden">
        {postcard.image ? (
          <img
            src={postcard.image.url}
            alt={`Vista previa de tu postal personalizada${filterOption ? ` con filtro ${filterOption.name}` : ''}`}
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: filterOption?.cssFilter || 'none' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary gap-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ImagePlus className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              Selecciona una imagen
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      {postcard.image && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Filtros
          </h3>
          <ImageFilters
            imageUrl={postcard.image.url}
            activeFilter={activeFilter}
            onFilterChange={setFilter}
          />
        </div>
      )}
    </div>
  );
}
