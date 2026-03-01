-- ============================================================================
-- Migration: Testimonials (Reseñas de Clientes)
-- Fecha: 2026-02-24
-- Descripción: Tabla para reseñas dinámicas, editables desde admin,
--              con soporte para contexto (sección/categoría) y compra verificada.
-- ============================================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Info del cliente
    customer_name TEXT NOT NULL,
    customer_location TEXT,                      -- "Xalapa, Ver."
    avatar_url TEXT,                             -- URL de avatar (opcional)

    -- Contenido
    rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    title TEXT,                                  -- Título corto opcional
    body TEXT NOT NULL,                          -- Texto de la reseña

    -- Contexto (para mostrar reseñas relevantes según lo que navega el cliente)
    section TEXT CHECK (section IN ('vape', '420')),   -- NULL = aplica a ambas
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,

    -- Metadatos
    verified_purchase BOOLEAN NOT NULL DEFAULT false,  -- Compra verificada
    is_featured BOOLEAN NOT NULL DEFAULT false,        -- Destacada (prioridad visual)
    is_active BOOLEAN NOT NULL DEFAULT true,           -- Visible en storefront
    sort_order INT NOT NULL DEFAULT 0,                 -- Orden manual (menor = primero)

    -- Timestamps
    review_date DATE DEFAULT CURRENT_DATE,             -- Fecha de la reseña
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_section ON testimonials (section) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials (is_featured) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_testimonials_category ON testimonials (category_id) WHERE is_active = true;

-- RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Lectura pública (solo activos)
CREATE POLICY "Testimonials: public read"
    ON testimonials FOR SELECT
    USING (is_active = true);

-- Admin: CRUD completo
CREATE POLICY "Testimonials: admin full access"
    ON testimonials FOR ALL
    USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
    );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();
