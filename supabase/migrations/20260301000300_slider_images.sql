-- Crear bucket de storage para hero slides si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('slider-images', 'slider-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage bucket
CREATE POLICY "Public Access to slider-images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'slider-images' );

CREATE POLICY "Admin Upload to slider-images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'slider-images' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admin Update to slider-images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'slider-images' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admin Delete from slider-images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'slider-images' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );
