-- ============================================================
-- VSM Store - Configuración Dinámica de Tienda
-- Fecha: 11 febrero 2026
-- ============================================================

-- Tabla Singleton para configuraciones (solo 1 fila permitida)
CREATE TABLE IF NOT EXISTS store_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    site_name TEXT NOT NULL DEFAULT 'VSM Store',
    description TEXT,
    logo_url TEXT,
    
    -- WhatsApp para Checkout
    whatsapp_number TEXT NOT NULL DEFAULT '5212281234567',
    whatsapp_default_message TEXT DEFAULT 'Hola, vengo de VSM Store y quiero hacer un pedido',
    
    -- Redes Sociales (JSONB para flexibilidad)
    social_links JSONB DEFAULT '{"facebook": "", "instagram": "", "youtube": "", "tiktok": ""}',
    
    -- Ubicación / Mapa
    location_address TEXT,
    location_city TEXT DEFAULT 'Xalapa',
    location_map_url TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE store_settings IS 'Configuración global de la tienda (Logo, WhatsApp, Redes)';

-- Insertar fila inicial (Singleton)
INSERT INTO store_settings (id, site_name, whatsapp_number, social_links)
VALUES (
    1, 
    'VSM Store', 
    '5212281234567', 
    '{"facebook": "https://www.facebook.com/vsmstore", "instagram": "https://www.instagram.com/vsmstore"}'
) ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para que el frontend cargue logo/teléfono)
CREATE POLICY "Public read settings"
    ON store_settings FOR SELECT
    USING (true);

-- Escritura solo Admins
CREATE POLICY "Admins update settings"
    ON store_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );
