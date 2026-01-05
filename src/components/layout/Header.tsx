import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onClose?: () => void;
}

export function Header({ title, showBack = false, showClose = false, onClose }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {title && (
          <h1 className="font-display text-lg font-semibold text-foreground">
            {title}
          </h1>
        )}
        
        <div className="w-10">
          {showClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
