import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Stamp } from 'lucide-react';

interface PaymentSimulationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function PaymentSimulationModal({
  open,
  onClose,
  onConfirm,
  isLoading,
}: PaymentSimulationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-postcard-cream border-2 border-dashed border-postcard-stamp flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-postcard-stamp" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Pasarela de Pagos
          </DialogTitle>
          <DialogDescription className="text-center">
            Estamos integrando la pasarela de pagos. Por ahora, tu pedido se registrará 
            como simulación y podrás ver el flujo completo.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary rounded-lg p-3 text-center my-4">
          <p className="text-sm text-muted-foreground">Total a pagar</p>
          <p className="font-display text-2xl font-bold text-primary">2,68€</p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            variant="postcard-nav"
            className="w-full"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Stamp className="w-5 h-5 mr-2 animate-bounce" />
                Procesando...
              </>
            ) : (
              <>
                <Stamp className="w-5 h-5 mr-2" />
                Confirmar Pedido (Simulación)
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
