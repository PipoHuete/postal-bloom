import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a postcard image (blob/data URL or remote URL) to Supabase Storage
 * and returns the public URL. If the image is already a public URL (not blob/data), returns it as-is.
 */
export async function uploadPostcardImage(imageUrl: string): Promise<string> {
  // If it's already a remote URL (not blob or data), return as-is
  if (!imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch the blob
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const ext = blob.type.includes('png') ? 'png' : 'jpg';
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('postcard-images')
    .upload(fileName, blob, {
      contentType: blob.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('postcard-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
