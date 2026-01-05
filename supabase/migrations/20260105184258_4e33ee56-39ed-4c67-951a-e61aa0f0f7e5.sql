-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado');

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  
  -- Recipient data
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_postal_code TEXT NOT NULL,
  recipient_city TEXT NOT NULL,
  
  -- Postcard data
  image_url TEXT,
  image_filter TEXT DEFAULT 'none',
  message TEXT,
  font_style TEXT DEFAULT 'courier',
  
  -- Order details
  price_cents INTEGER NOT NULL DEFAULT 268,
  status order_status NOT NULL DEFAULT 'pendiente',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();