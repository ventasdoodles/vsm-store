-- ============================================================
-- VSM Store - Mejoras al módulo de categorías
-- Migración: 20260223_enhance_categories.sql
-- Fecha: 23 febrero 2026
-- ============================================================

-- Imagen de portada de la categoría (banner/thumbnail en menú)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Bandera "Popular / Trending" (muestra ícono de llama en UI)
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.categories.image_url  IS 'URL de imagen representativa de la categoría (opcional, para menus y banners)';
COMMENT ON COLUMN public.categories.is_popular IS 'Marca la categoría como popular/trending (muestra badge de llama en tienda)';
