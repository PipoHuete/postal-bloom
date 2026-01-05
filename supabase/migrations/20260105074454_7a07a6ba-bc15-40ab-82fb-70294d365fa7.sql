-- Create font_style enum for message typography
CREATE TYPE public.font_style AS ENUM ('courier', 'bradley', 'snell');

-- Create contacts table for user's address book
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create postcards table for saving postcard state
CREATE TABLE public.postcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  image_filter TEXT DEFAULT 'none',
  message TEXT DEFAULT '',
  font_style font_style DEFAULT 'courier',
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postcards ENABLE ROW LEVEL SECURITY;

-- RLS policies for contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
ON public.contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
ON public.contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
ON public.contacts FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for postcards
CREATE POLICY "Users can view their own postcards"
ON public.postcards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own postcards"
ON public.postcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own postcards"
ON public.postcards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own postcards"
ON public.postcards FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_postcards_updated_at
BEFORE UPDATE ON public.postcards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();