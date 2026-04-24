-- ============================================================
-- VSM Store — Categorías de Respaldo ("Sin Categoría")
-- Fecha: 2026-03-02
-- ============================================================
-- 
-- PROBLEMA:
--   Al borrar una categoría, los productos y categorías hijas
--   quedaban bloqueados por FK RESTRICT. No se podía borrar nada.
--
-- SOLUCIÓN:
--   1. Dos categorías ocultas permanentes:
--      - "Sin Categoría" (vape)   → is_active = false
--      - "Sin Categoría" (420)    → is_active = false
--   
--   2. Trigger BEFORE DELETE en categories que:
--      a) Mueve los productos de la categoría eliminada → fallback
--      b) Re-parentea las categorías hijas al abuelo (o raíz)
--      c) Permite que el DELETE proceda sin error de FK
--
-- COMPORTAMIENTO:
--   ┌─────────────────────────────────────────────────────────┐
--   │ Acción                         │ Resultado              │
--   ├─────────────────────────────────────────────────────────┤
--   │ Borrar categoría con productos │ Productos → fallback   │
--   │ Borrar categoría con hijos     │ Hijos suben al abuelo  │
--   │ Borrar categoría padre + hijos │ Todo se reacomoda      │
--   │ Borrar fallback                │ BLOQUEADO (protegida)  │
--   └─────────────────────────────────────────────────────────┘
--
--   El front NUNCA muestra las categorías fallback (is_active=false).
--   El admin SÍ las ve → fácil reubicar productos huérfanos.
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. Crear categorías de respaldo (idempotente)
-- ─────────────────────────────────────────────

INSERT INTO categories (name, slug, section, parent_id, description, order_index, is_active)
VALUES (
  'Sin Categoría',
  'sin-categoria',
  'vape',
  NULL,
  'Categoría de respaldo para productos huérfanos de la sección Vape. Oculta en el front.',
  9999,
  false
)
ON CONFLICT (slug, section) DO NOTHING;

INSERT INTO categories (name, slug, section, parent_id, description, order_index, is_active)
VALUES (
  'Sin Categoría',
  'sin-categoria',
  '420',
  NULL,
  'Categoría de respaldo para productos huérfanos de la sección 420. Oculta en el front.',
  9999,
  false
)
ON CONFLICT (slug, section) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. Función trigger: proteger y reubicar
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_category_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  fallback_id UUID;
  deleted_section section_type;
BEGIN
  deleted_section := OLD.section;

  -- ═══ Proteger las categorías fallback ═══
  IF OLD.slug = 'sin-categoria' THEN
    RAISE EXCEPTION 'No se puede eliminar la categoría de respaldo "Sin Categoría" (%). Es una categoría protegida del sistema.', deleted_section;
  END IF;

  -- ═══ Obtener la categoría fallback de la misma sección ═══
  SELECT id INTO fallback_id
  FROM categories
  WHERE slug = 'sin-categoria' AND section = deleted_section
  LIMIT 1;

  -- Si no existe la fallback (caso extremo), crearla al vuelo
  IF fallback_id IS NULL THEN
    INSERT INTO categories (name, slug, section, parent_id, description, order_index, is_active)
    VALUES ('Sin Categoría', 'sin-categoria', deleted_section, NULL,
            'Categoría de respaldo automática', 9999, false)
    RETURNING id INTO fallback_id;
  END IF;

  -- ═══ Mover productos huérfanos al fallback ═══
  UPDATE products
  SET category_id = fallback_id,
      updated_at = NOW()
  WHERE category_id = OLD.id;

  -- ═══ Re-parentear categorías hijas ═══
  -- Los hijos suben al nivel del padre eliminado (abuelo).
  -- Si el padre era raíz (parent_id = NULL), los hijos se vuelven raíz.
  UPDATE categories
  SET parent_id = OLD.parent_id
  WHERE parent_id = OLD.id;

  -- ═══ Log para auditoría ═══
  RAISE NOTICE 'Categoría "%" (%) eliminada. Productos movidos a "Sin Categoría", hijos re-parenteados.', OLD.name, OLD.id;

  RETURN OLD;
END;
$$;

-- ─────────────────────────────────────────────
-- 3. Trigger BEFORE DELETE
-- ─────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_category_delete_protect ON categories;

CREATE TRIGGER trg_category_delete_protect
  BEFORE DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION handle_category_delete();

-- ─────────────────────────────────────────────
-- 4. Verificación
-- ─────────────────────────────────────────────

DO $$
DECLARE
  vape_fallback UUID;
  four20_fallback UUID;
BEGIN
  SELECT id INTO vape_fallback FROM categories WHERE slug = 'sin-categoria' AND section = 'vape';
  SELECT id INTO four20_fallback FROM categories WHERE slug = 'sin-categoria' AND section = '420';

  IF vape_fallback IS NULL OR four20_fallback IS NULL THEN
    RAISE EXCEPTION 'Error: No se pudieron crear las categorías de respaldo.';
  END IF;

  RAISE NOTICE '✅ Categoría fallback Vape: %', vape_fallback;
  RAISE NOTICE '✅ Categoría fallback 420: %', four20_fallback;
  RAISE NOTICE '✅ Trigger trg_category_delete_protect instalado correctamente.';
END $$;
