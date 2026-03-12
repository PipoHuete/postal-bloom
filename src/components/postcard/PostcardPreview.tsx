import React from 'react';
import { usePostcard } from '@/contexts/PostcardContext';
import { FILTERS, FontStyle } from '@/types/postcard';
import { Stamp } from 'lucide-react';

const FONT_CLASS_MAP: Record<FontStyle, string> = {
  caveat: 'font-caveat',
  dancing: 'font-dancing',
  vibes: 'font-vibes',
  lora: 'font-lora',
  merriweather: 'font-merriweather',
  mono: 'font-mono',
};

export function PostcardPreview() {
  const { postcard } = usePostcard();
  const filterOption = FILTERS.find(f => f.id === (postcard.image?.filter || 'none'));
  const fontClass = FONT_CLASS_MAP[postcard.fontStyle] || 'font-caveat';

  return (
    <div className="animate-fade-in space-y-6">
      {/* Front */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Anverso</h3>
        <div className="postcard-container aspect-[3/2] overflow-hidden">
          {postcard.image ? (
            <img
              src={postcard.image.url}
              alt="Anverso de tu postal"
              className="w-full h-full object-cover"
              style={{ filter: filterOption?.cssFilter || 'none' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}
        </div>
      </div>

      {/* Back */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Dorso</h3>
        <div className="postcard-container bg-postcard-cream p-6">
          <div className="flex gap-4 min-h-[200px]">
            {/* Message */}
            <div className="flex-1">
              {postcard.message ? (
                <p className={`text-foreground text-sm leading-relaxed ${fontClass}`}>
                  {postcard.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin mensaje</p>
              )}
            </div>

            <div className="postcard-divider" />

            {/* Address */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-end mb-2">
                <div className="stamp-area w-12 h-16">
                  <Stamp className="w-6 h-6 text-postcard-stamp" />
                </div>
              </div>
              {postcard.recipientName ? (
                <div className="flex flex-col gap-1">
                  <p className="address-line text-sm font-medium">{postcard.recipientName}</p>
                  <p className="address-line text-sm">{postcard.addressLine1}</p>
                  <p className="address-line text-sm">
                    {postcard.postalCode} {postcard.city}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin destinatario</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
