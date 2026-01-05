import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Package, MapPin, Image, Eye, Loader2, RefreshCw, Mail } from 'lucide-react';

type OrderStatus = 'pendiente' | 'pagado' | 'enviado' | 'entregado' | 'cancelado';

interface Order {
  id: string;
  email: string;
  recipient_name: string;
  recipient_address: string;
  recipient_postal_code: string;
  recipient_city: string;
  image_url: string | null;
  image_filter: string | null;
  message: string | null;
  font_style: string | null;
  status: OrderStatus;
  price_cents: number;
  created_at: string;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  pagado: 'bg-blue-100 text-blue-800 border-blue-300',
  enviado: 'bg-green-100 text-green-800 border-green-300',
  entregado: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelado: 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const FONT_CLASS_MAP: Record<string, string> = {
  caveat: 'font-caveat',
  dancing: 'font-dancing',
  vibes: 'font-vibes',
  lora: 'font-lora',
  merriweather: 'font-merriweather',
  mono: 'font-mono',
};

export default function AdminPostals() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar pedidos');
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, orderEmail: string) => {
    setUpdatingId(orderId);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Estado actualizado a "${STATUS_LABELS[newStatus]}"`);
      
      // TODO: Enviar email de notificación cuando el estado cambie a 'enviado'
      // Se puede implementar con Resend:
      // if (newStatus === 'enviado') {
      //   await supabase.functions.invoke('send-shipping-notification', {
      //     body: { email: orderEmail, orderId }
      //   });
      // }
    }
    
    setUpdatingId(null);
  };

  const openPreview = (order: Order, side: 'front' | 'back') => {
    setPreviewOrder(order);
    setPreviewSide(side);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Postales - SelfiePostal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen pb-8">
        <Header title="Admin Postales" showBack />

        <main className="container px-4 py-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl font-bold">Gestión de Pedidos</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(['pendiente', 'pagado', 'enviado', 'entregado'] as OrderStatus[]).map(status => (
              <div key={status} className="postcard-container bg-postcard-cream p-3 text-center">
                <p className="text-2xl font-display font-bold text-primary">
                  {orders.filter(o => o.status === status).length}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {STATUS_LABELS[status]}
                </p>
              </div>
            ))}
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="postcard-container bg-postcard-cream p-8 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos todavía</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="postcard-container bg-postcard-cream p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="font-display font-semibold text-lg">
                            {order.recipient_name}
                          </p>
                        </div>
                        <Badge className={`${STATUS_COLORS[order.status]} border`}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <p>{order.recipient_address}</p>
                          <p>{order.recipient_postal_code} {order.recipient_city}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <p>{order.email}</p>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(order.created_at)} · {(order.price_cents / 100).toFixed(2)}€
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 sm:w-48">
                      {/* Preview Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openPreview(order, 'front')}
                          disabled={!order.image_url}
                        >
                          <Image className="w-4 h-4 mr-1" />
                          Anverso
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openPreview(order, 'back')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Dorso
                        </Button>
                      </div>

                      {/* Status Selector */}
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus, order.email)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="w-full">
                          {updatingId === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map(status => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewOrder} onOpenChange={() => setPreviewOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {previewSide === 'front' ? 'Anverso' : 'Dorso'} - #{previewOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {previewOrder && (
            <div className="mt-4">
              {previewSide === 'front' ? (
                <div className="aspect-[3/2] rounded-lg overflow-hidden border-2 border-postcard-stamp">
                  {previewOrder.image_url ? (
                    <img
                      src={previewOrder.image_url}
                      alt="Anverso de la postal"
                      className="w-full h-full object-cover"
                      style={{ 
                        filter: previewOrder.image_filter && previewOrder.image_filter !== 'none' 
                          ? previewOrder.image_filter 
                          : undefined 
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Sin imagen</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/2] postcard-container bg-postcard-cream p-4">
                  <div className="flex gap-3 h-full">
                    {/* Message */}
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-foreground text-sm leading-relaxed ${FONT_CLASS_MAP[previewOrder.font_style || 'caveat'] || 'font-caveat'}`}>
                        {previewOrder.message || '(Sin mensaje)'}
                      </p>
                    </div>

                    <div className="w-px bg-border" />

                    {/* Address */}
                    <div className="flex-1 flex flex-col text-sm">
                      <p className="font-medium">{previewOrder.recipient_name}</p>
                      <p className="text-muted-foreground">{previewOrder.recipient_address}</p>
                      <p className="text-muted-foreground">
                        {previewOrder.recipient_postal_code} {previewOrder.recipient_city}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle preview side */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant={previewSide === 'front' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewSide('front')}
                >
                  Anverso
                </Button>
                <Button
                  variant={previewSide === 'back' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewSide('back')}
                >
                  Dorso
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
