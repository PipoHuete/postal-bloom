import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PostcardData, PostcardImage, ImageFilter, FontStyle, Contact } from '@/types/postcard';

interface PostcardContextType {
  postcard: PostcardData;
  setImage: (image: PostcardImage | null) => void;
  setFilter: (filter: ImageFilter) => void;
  setMessage: (message: string) => void;
  setFontStyle: (fontStyle: FontStyle) => void;
  setContact: (contact: Contact | null) => void;
  setAddress: (address: Partial<PostcardData>) => void;
  resetPostcard: () => void;
}

const initialPostcard: PostcardData = {
  image: null,
  message: '',
  fontStyle: 'courier',
  contact: null,
  recipientName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: '',
};

const PostcardContext = createContext<PostcardContextType | undefined>(undefined);

export function PostcardProvider({ children }: { children: ReactNode }) {
  const [postcard, setPostcard] = useState<PostcardData>(initialPostcard);

  const setImage = (image: PostcardImage | null) => {
    setPostcard(prev => ({ ...prev, image }));
  };

  const setFilter = (filter: ImageFilter) => {
    if (postcard.image) {
      setPostcard(prev => ({
        ...prev,
        image: prev.image ? { ...prev.image, filter } : null,
      }));
    }
  };

  const setMessage = (message: string) => {
    setPostcard(prev => ({ ...prev, message }));
  };

  const setFontStyle = (fontStyle: FontStyle) => {
    setPostcard(prev => ({ ...prev, fontStyle }));
  };

  const setContact = (contact: Contact | null) => {
    if (contact) {
      setPostcard(prev => ({
        ...prev,
        contact,
        recipientName: contact.name,
        addressLine1: contact.address,
        postalCode: contact.postal_code,
        city: contact.city,
      }));
    } else {
      setPostcard(prev => ({ ...prev, contact: null }));
    }
  };

  const setAddress = (address: Partial<PostcardData>) => {
    setPostcard(prev => ({ ...prev, ...address }));
  };

  const resetPostcard = () => {
    setPostcard(initialPostcard);
  };

  return (
    <PostcardContext.Provider
      value={{
        postcard,
        setImage,
        setFilter,
        setMessage,
        setFontStyle,
        setContact,
        setAddress,
        resetPostcard,
      }}
    >
      {children}
    </PostcardContext.Provider>
  );
}

export function usePostcard() {
  const context = useContext(PostcardContext);
  if (context === undefined) {
    throw new Error('usePostcard must be used within a PostcardProvider');
  }
  return context;
}
