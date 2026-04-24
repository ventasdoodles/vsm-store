-- ============================================================
-- VSM Store - Tabla de Tags Centralizados
-- Migración: 20260223_product_tags.sql
-- Fecha: 23 febrero 2026
-- ============================================================
-- Crea una tabla de referencia para los tags del catálogo.
-- Los tags siguen almacenados en products.tags (TEXT[]) para
-- velocidad, pero ahora hay una fuente canónica que permite:
--   - Autocompletar en el formulario de productos
--   - Renombrar un tag en TODOS los productos de golpe
--   - Evitar duplicados y estandarizar naming

CREATE TABLE IF NOT EXISTS public.product_tags (
    name        TEXT PRIMARY KEY,          -- El tag en sí (lowercase, sin espacios)
    label       TEXT NOT NULL,             -- Nombre de display (puede tener mayúsculas)
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.product_tags IS 'Catálogo canónico de tags. Los productos los usan via TEXT[] pero este registro permite gestión centralizada.';

-- RLS
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para autocompletado en tienda si se necesitara)
CREATE POLICY "Anyone can read tags"
  ON public.product_tags FOR SELECT
  USING (true);

-- Solo admins pueden crear/editar/borrar
CREATE POLICY "Admins can manage tags"
  ON public.product_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- ── Función: renombrar un tag en TODOS los productos ────────
-- Actualiza el TEXT[] en products y renombra el registro en product_tags
CREATE OR REPLACE FUNCTION public.rename_product_tag(old_name TEXT, new_name TEXT, new_label TEXT)
RETURNS void AS $$
BEGIN
  -- Actualizar todos los productos que tienen el tag viejo
  UPDATE public.products
  SET tags = array_replace(tags, old_name, new_name)
  WHERE old_name = ANY(tags);

  -- Renombrar en la tabla de referencia (borrar viejo + insertar nuevo)
  DELETE FROM public.product_tags WHERE name = old_name;
  INSERT INTO public.product_tags (name, label)
  VALUES (new_name, new_label)
  ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Seed: poblar desde los tags que ya existen en products ──
-- Inserta todos los tags únicos que ya están en el catálogo
INSERT INTO public.product_tags (name, label)
SELECT DISTINCT
    lower(trim(tag)) AS name,
    trim(tag)        AS label
FROM public.products, unnest(tags) AS tag
WHERE trim(tag) <> ''
ON CONFLICT (name) DO NOTHING;
