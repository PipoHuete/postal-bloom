import React from 'react';
import { cn } from '@/lib/utils';
import { FILTERS, ImageFilter } from '@/types/postcard';

interface ImageFiltersProps {
  imageUrl: string;
  activeFilter: ImageFilter;
  onFilterChange: (filter: ImageFilter) => void;
}

export function ImageFilters({ imageUrl, activeFilter, onFilterChange }: ImageFiltersProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-4 px-2 -mx-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className="flex flex-col items-center gap-2 flex-shrink-0"
        >
          <div
            className={cn(
              'filter-circle',
              activeFilter === filter.id && 'filter-circle-active'
            )}
          >
            <img
              src={imageUrl}
              alt={filter.name}
              className="w-full h-full object-cover"
              style={{ filter: filter.cssFilter }}
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.crossOrigin) {
                  target.crossOrigin = '';
                  target.src = imageUrl;
                }
              }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {filter.name}
          </span>
        </button>
      ))}
    </div>
  );
}
