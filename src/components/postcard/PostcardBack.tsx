import React from 'react';
import { usePostcard } from '@/contexts/PostcardContext';
import { Stamp } from 'lucide-react';

export function PostcardBack() {
  const { postcard, setMessage, setAddress } = usePostcard();

  return (
    <div className="animate-fade-in">
      <div className="postcard-container bg-postcard-cream p-6">
        <div className="flex gap-4 min-h-[320px]">
          {/* Left Side - Message */}
          <div className="flex-1 flex flex-col">
            <textarea
              value={postcard.message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 bg-transparent resize-none focus:outline-none text-foreground placeholder:text-muted-foreground font-body text-sm leading-relaxed"
              maxLength={300}
            />
            <span className="text-xs text-muted-foreground text-right mt-2">
              {postcard.message.length}/300
            </span>
          </div>

          {/* Divider */}
          <div className="postcard-divider" />

          {/* Right Side - Address */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Stamp Area */}
            <div className="flex justify-end mb-4">
              <div className="stamp-area w-16 h-20">
                <Stamp className="w-8 h-8 text-postcard-stamp" />
              </div>
            </div>

            {/* Address Lines */}
            <div className="flex flex-col gap-1">
              <input
                type="text"
                value={postcard.recipientName}
                onChange={(e) => setAddress({ recipientName: e.target.value })}
                placeholder="Nombre del destinatario"
                className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm font-medium"
              />
              <input
                type="text"
                value={postcard.addressLine1}
                onChange={(e) => setAddress({ addressLine1: e.target.value })}
                placeholder="Dirección línea 1"
                className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
              <input
                type="text"
                value={postcard.addressLine2}
                onChange={(e) => setAddress({ addressLine2: e.target.value })}
                placeholder="Dirección línea 2 (opcional)"
                className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postcard.postalCode}
                  onChange={(e) => setAddress({ postalCode: e.target.value })}
                  placeholder="C.P."
                  className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm w-20"
                />
                <input
                  type="text"
                  value={postcard.city}
                  onChange={(e) => setAddress({ city: e.target.value })}
                  placeholder="Ciudad"
                  className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm flex-1"
                />
              </div>
              <input
                type="text"
                value={postcard.country}
                onChange={(e) => setAddress({ country: e.target.value })}
                placeholder="País"
                className="address-line bg-transparent focus:outline-none text-foreground placeholder:text-muted-foreground text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
