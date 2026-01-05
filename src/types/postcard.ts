export interface PostcardImage {
  id: string;
  url: string;
  thumbnail?: string;
  filter?: ImageFilter;
}

export type ImageFilter = 
  | 'none' 
  | 'grayscale' 
  | 'sepia' 
  | 'vintage' 
  | 'warm' 
  | 'cool' 
  | 'contrast';

export type FontStyle = 'courier' | 'bradley' | 'snell';

export interface Contact {
  id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
}

export interface PostcardData {
  image: PostcardImage | null;
  message: string;
  fontStyle: FontStyle;
  contact: Contact | null;
  recipientName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface FilterOption {
  id: ImageFilter;
  name: string;
  preview: string;
  cssFilter: string;
}

export const FILTERS: FilterOption[] = [
  { id: 'none', name: 'Original', preview: '', cssFilter: 'none' },
  { id: 'grayscale', name: 'B&N', preview: '', cssFilter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', preview: '', cssFilter: 'sepia(80%)' },
  { id: 'vintage', name: 'Vintage', preview: '', cssFilter: 'sepia(30%) contrast(110%) brightness(90%)' },
  { id: 'warm', name: 'Cálido', preview: '', cssFilter: 'saturate(130%) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Frío', preview: '', cssFilter: 'saturate(110%) hue-rotate(20deg) brightness(105%)' },
  { id: 'contrast', name: 'Contraste', preview: '', cssFilter: 'contrast(130%) saturate(110%)' },
];
