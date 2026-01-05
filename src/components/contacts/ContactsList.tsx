import React, { useState, useEffect } from 'react';
import { X, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/postcard';
import { ContactForm } from './ContactForm';

interface ContactsListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
}

export function ContactsList({ isOpen, onClose, onSelectContact }: ContactsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, address, postal_code, city')
      .order('name');

    if (error) {
      // Error logged server-side only
    } else {
      setContacts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (showForm) {
    return (
      <ContactForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onContactAdded={fetchContacts}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-medium uppercase tracking-wider">Mis Contactos</h2>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <User className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No tienes contactos guardados</p>
              <p className="text-sm text-muted-foreground">Añade uno pulsando el botón +</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    onSelectContact(contact);
                    onClose();
                  }}
                  className="w-full p-4 text-left border-2 border-border rounded-lg hover:border-primary transition-colors"
                >
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {contact.postal_code} {contact.city}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <div className="absolute bottom-6 right-6">
          <Button
            onClick={() => setShowForm(true)}
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
