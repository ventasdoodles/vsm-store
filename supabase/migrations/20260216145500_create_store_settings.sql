-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id bigint PRIMARY KEY DEFAULT 1,
    site_name text,
    description text,
    logo_url text,
    whatsapp_number text,
    whatsapp_default_message text,
    social_links jsonb DEFAULT '{}'::jsonb,
    location_address text,
    location_city text,
    location_map_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public settings are visible to everyone" 
ON public.store_settings FOR SELECT 
USING (true);

CREATE POLICY "Only admins can update settings" 
ON public.store_settings FOR UPDATE 
USING (
    exists (
        select 1 from public.admin_users 
        where id = auth.uid()
    )
);

CREATE POLICY "Only admins can insert settings" 
ON public.store_settings FOR INSERT 
WITH CHECK (
    exists (
        select 1 from public.admin_users 
        where id = auth.uid()
    )
);

-- Insert default row if not exists
INSERT INTO public.store_settings (id, site_name, description, whatsapp_number)
VALUES (1, 'VSM Store', 'Tu tienda de vape y productos 420', '5212281234567')
ON CONFLICT (id) DO NOTHING;
