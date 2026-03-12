
INSERT INTO storage.buckets (id, name, public) VALUES ('postcard-images', 'postcard-images', true);

CREATE POLICY "Users can upload their own postcard images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'postcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view postcard images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'postcard-images');

CREATE POLICY "Users can delete their own postcard images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'postcard-images' AND (storage.foldername(name))[1] = auth.uid()::text);
