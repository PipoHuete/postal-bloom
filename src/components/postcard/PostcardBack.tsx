import React, { useState } from 'react';
import { usePostcard } from '@/contexts/PostcardContext';
import { Stamp, ChevronRight } from 'lucide-react';
import { MessageEditor } from './MessageEditor';
import { ContactsList } from '@/components/contacts/ContactsList';
import { FontStyle } from '@/types/postcard';

const FONT_CLASS_MAP: Record<FontStyle, string> = {
  courier: 'font-courier',
  bradley: 'font-bradley',
  snell: 'font-snell',
};

export function PostcardBack() {
  const { postcard, setMessage, setFontStyle, setContact, setAddress } = usePostcard();
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const handleSaveMessage = (message: string, fontStyle: FontStyle) => {
    setMessage(message);
    setFontStyle(fontStyle);
  };

  const fontClass = FONT_CLASS_MAP[postcard.fontStyle] || 'font-courier';

  return (
    <>
      <div className="animate-fade-in">
        <div className="postcard-container bg-postcard-cream p-6">
          <div className="flex gap-4 min-h-[320px]">
            {/* Left Side - Message */}
            <div className="flex-1 flex flex-col">
              <button
                onClick={() => setShowMessageEditor(true)}
                className="flex-1 flex flex-col text-left"
              >
                {postcard.message ? (
                  <p className={`text-foreground text-sm leading-relaxed ${fontClass}`}>
                    {postcard.message}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Añade tu mensaje</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
              {postcard.message && (
                <span className="text-xs text-muted-foreground text-right mt-2">
                  {postcard.message.length}/300
                </span>
              )}
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

              {/* Address Section */}
              {postcard.contact ? (
                <button
                  onClick={() => setShowContacts(true)}
                  className="flex flex-col gap-1 text-left"
                >
                  <p className="address-line text-sm font-medium">{postcard.recipientName}</p>
                  <p className="address-line text-sm">{postcard.addressLine1}</p>
                  <p className="address-line text-sm">
                    {postcard.postalCode} {postcard.city}
                  </p>
                </button>
              ) : (
                <button
                  onClick={() => setShowContacts(true)}
                  className="flex items-center gap-2 text-muted-foreground py-2"
                >
                  <span className="text-sm">Añade al destinatario</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Editor Modal */}
      <MessageEditor
        isOpen={showMessageEditor}
        onClose={() => setShowMessageEditor(false)}
        message={postcard.message}
        fontStyle={postcard.fontStyle}
        onSave={handleSaveMessage}
      />

      {/* Contacts List Modal */}
      <ContactsList
        isOpen={showContacts}
        onClose={() => setShowContacts(false)}
        onSelectContact={setContact}
      />
    </>
  );
}
