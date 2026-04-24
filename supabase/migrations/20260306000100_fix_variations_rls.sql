-- ============================================
-- VSM Store - FIX RLS MÃ³dulo de Variaciones
-- MigraciÃ³n: 20260306_fix_variations_rls.sql
-- ============================================

-- 1. Eliminar polÃ­ticas incorrectas basadas en email (que no existe en admin_users)
DO $$
BEGIN
  IF to_regclass('public.product_attributes') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins pueden gestionar atributos" ON public.product_attributes';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_attribute_values') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins pueden gestionar valores de atributos" ON public.product_attribute_values';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_variants') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins pueden gestionar variantes" ON public.product_variants';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_variant_options') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins pueden gestionar opciones de variantes" ON public.product_variant_options';
  END IF;
END
$$;

-- 2. Re-crear polÃ­ticas usando auth.uid() consistente con el resto del sistema
DO $$
BEGIN
  IF to_regclass('public.product_attributes') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Admins pueden gestionar atributos" ON public.product_attributes
      FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
      )';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_attribute_values') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Admins pueden gestionar valores de atributos" ON public.product_attribute_values
      FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
      )';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_variants') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Admins pueden gestionar variantes" ON public.product_variants
      FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
      )';
  END IF;
END
$$;

DO $$
BEGIN
  IF to_regclass('public.product_variant_options') IS NOT NULL THEN
    EXECUTE 'CREATE POLICY "Admins pueden gestionar opciones de variantes" ON public.product_variant_options
      FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
      )';
  END IF;
END
$$;

-- 3. Asegurar permisos de lectura para usuarios autenticados (necesario para el editor)
-- Ya existen polÃ­ticas de lectura pÃºblica, pero por si acaso reforzamos para variantes inactivas en admin
DO $$
BEGIN
  IF to_regclass('public.product_variants') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Variantes visibles pÃºblicamente" ON public.product_variants';
    EXECUTE 'CREATE POLICY "Lectura de variantes para admins y publico activo" ON public.product_variants
      FOR SELECT USING (
        is_active = true OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
      )';
  END IF;
END
$$;
