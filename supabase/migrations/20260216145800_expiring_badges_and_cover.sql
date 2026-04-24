-- ============================================
-- VSM Store - Expiring Badges and Cover Images
-- ============================================

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS is_featured_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_new_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_bestseller_until TIMESTAMPTZ;

-- Comment for clarity
COMMENT ON COLUMN products.cover_image IS 'Imagen principal de portada, puede ser externa a la galería';
COMMENT ON COLUMN products.is_featured_until IS 'Fecha de expiración para el badge de Destacado';
COMMENT ON COLUMN products.is_new_until IS 'Fecha de expiración para el badge de Nuevo';
COMMENT ON COLUMN products.is_bestseller_until IS 'Fecha de expiración para el badge de Bestseller';
