
CREATE POLICY "user-uploads owner select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user-uploads owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user-uploads owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "user-uploads owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
