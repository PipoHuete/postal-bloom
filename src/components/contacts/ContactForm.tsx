import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: 'El nombre es obligatorio' }).max(100, { message: 'Nombre demasiado largo' }),
  address: z.string().trim().min(1, { message: 'La dirección es obligatoria' }).max(200, { message: 'Dirección demasiado larga' }),
  postalCode: z.string().trim().min(1, { message: 'El código postal es obligatorio' }).max(20, { message: 'Código postal demasiado largo' }).regex(/^[a-zA-Z0-9\s-]+$/, { message: 'Código postal inválido' }),
  city: z.string().trim().min(1, { message: 'La ciudad es obligatoria' }).max(100, { message: 'Ciudad demasiado larga' }),
});

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
  const [errors, setErrors] = useState<{ name?: string; address?: string; postalCode?: string; city?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate inputs
    const result = contactSchema.safeParse({ 
      name: name.trim(), 
      address: address.trim(), 
      postalCode: postalCode.trim(), 
      city: city.trim() 
    });
    
    if (!result.success) {
      const fieldErrors: { name?: string; address?: string; postalCode?: string; city?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
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
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Nombre completo"
              className={`border-2 ${errors.name ? 'border-destructive' : 'border-border'}`}
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
              }}
              placeholder="Calle y número"
              className={`border-2 ${errors.address ? 'border-destructive' : 'border-border'}`}
              maxLength={200}
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
                if (errors.postalCode) setErrors((prev) => ({ ...prev, postalCode: undefined }));
              }}
              placeholder="00000"
              className={`border-2 ${errors.postalCode ? 'border-destructive' : 'border-border'}`}
              maxLength={20}
            />
            {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
              }}
              placeholder="Ciudad"
              className={`border-2 ${errors.city ? 'border-destructive' : 'border-border'}`}
              maxLength={100}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
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
