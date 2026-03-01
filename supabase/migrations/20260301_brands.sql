-- Módulo de Marcas (Brands)
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    logo_url text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Brands are viewable by everyone" 
    ON public.brands FOR SELECT 
    USING (true);

-- Escritura solo para admins
CREATE POLICY "Admins can insert brands" 
    ON public.brands FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update brands" 
    ON public.brands FOR UPDATE 
    USING (
         EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
         EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can delete brands" 
    ON public.brands FOR DELETE 
    USING (
         EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid()
        )
    );

-- Triggers
CREATE TRIGGER trigger_brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Crear bucket de storage para logos de marcas si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage bucket
CREATE POLICY "Public Access to brand-logos"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'brand-logos' );

CREATE POLICY "Admin Upload to brand-logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'brand-logos' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admin Update to brand-logos"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'brand-logos' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );

CREATE POLICY "Admin Delete from brand-logos"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'brand-logos' AND 
        EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    );
