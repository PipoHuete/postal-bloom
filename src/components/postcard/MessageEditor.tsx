import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FontStyle } from '@/types/postcard';

interface MessageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  fontStyle: FontStyle;
  onSave: (message: string, fontStyle: FontStyle) => void;
}

const FONT_OPTIONS: { id: FontStyle; name: string; className: string }[] = [
  { id: 'courier', name: 'Courier', className: 'font-courier' },
  { id: 'bradley', name: 'Bradley Hand', className: 'font-bradley' },
  { id: 'snell', name: 'Snell Roundhand', className: 'font-snell' },
];

export function MessageEditor({ isOpen, onClose, message, fontStyle, onSave }: MessageEditorProps) {
  const [localMessage, setLocalMessage] = useState(message);
  const [localFont, setLocalFont] = useState<FontStyle>(fontStyle);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localMessage, localFont);
    onClose();
  };

  const selectedFontClass = FONT_OPTIONS.find(f => f.id === localFont)?.className || 'font-courier';

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-medium uppercase tracking-wider">Mensaje</h2>
          <Button onClick={handleSave} variant="postcard-primary" size="sm" className="active:scale-95 transition-transform">
            Guardar
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 p-4">
          <textarea
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí..."
            className={`w-full h-full resize-none bg-transparent focus:outline-none text-lg leading-relaxed ${selectedFontClass}`}
            maxLength={300}
          />
        </div>

        {/* Font Selector */}
        <div className="border-t p-4">
          <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wider">Tipografía</p>
          <div className="flex gap-3">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                onClick={() => setLocalFont(font.id)}
                className={`flex-1 py-4 px-3 rounded-lg border-2 transition-all ${
                  localFont === font.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <span className={`text-lg ${font.className}`}>Aa</span>
                <p className="text-xs text-muted-foreground mt-1">{font.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Character Count */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-right">
            {localMessage.length}/300
          </p>
        </div>
      </div>
    </div>
  );
}
