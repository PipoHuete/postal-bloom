import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

export function ContactForm({ isOpen, onClose, onContactAdded }: ContactFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !address.trim() || !postalCode.trim() || !city.trim()) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Debes iniciar sesión para guardar contactos');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('contacts').insert({
      user_id: user.id,
      name: name.trim(),
      address: address.trim(),
      postal_code: postalCode.trim(),
      city: city.trim(),
    });

    if (error) {
      toast.error('Error al guardar el contacto');
    } else {
      toast.success('Contacto guardado');
      onContactAdded();
      onClose();
      // Reset form
      setName('');
      setAddress('');
      setPostalCode('');
      setCity('');
    }
    
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-medium uppercase tracking-wider">Nuevo Contacto</h2>
          <div className="w-10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle y número"
              className="border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="00000"
              className="border-2 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad"
              className="border-2 border-border"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Contacto'}
          </Button>
        </form>
      </div>
    </div>
  );
}
