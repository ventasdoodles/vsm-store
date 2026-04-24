-- Agregar columna featured_categories si no existe
ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS featured_categories JSONB DEFAULT '[]'::jsonb;

-- Podemos inicializarla con las categorias por defecto pero el app manda los fallbacks si está vacío
