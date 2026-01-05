import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PostcardData, PostcardImage, ImageFilter } from '@/types/postcard';

interface PostcardContextType {
  postcard: PostcardData;
  setImage: (image: PostcardImage | null) => void;
  setFilter: (filter: ImageFilter) => void;
  setMessage: (message: string) => void;
  setAddress: (address: Partial<PostcardData>) => void;
  resetPostcard: () => void;
}

const initialPostcard: PostcardData = {
  image: null,
  message: '',
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
