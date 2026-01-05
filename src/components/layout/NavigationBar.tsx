import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface NavigationBarProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showBack?: boolean;
  showNext?: boolean;
  nextDisabled?: boolean;
}

export function NavigationBar({
  onBack,
  onNext,
  backLabel = 'Atrás',
  nextLabel = 'Siguiente',
  showBack = true,
  showNext = true,
  nextDisabled = false,
}: NavigationBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4">
      <div className="container flex items-center justify-between gap-4 max-w-lg mx-auto">
        {showBack ? (
          <Button
            variant="postcard"
            size="lg"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        
        {showNext && (
          <Button
            variant="postcard-nav"
            size="lg"
            onClick={onNext}
            disabled={nextDisabled}
            className="flex-1"
          >
            {nextLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
