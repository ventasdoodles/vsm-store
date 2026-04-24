-- ============================================
-- VSM Store - FIX RLS Módulo de Variaciones
-- Migración: 20260306_fix_variations_rls.sql
-- ============================================

-- 1. Eliminar políticas incorrectas basadas en email (que no existe en admin_users)
DROP POLICY IF EXISTS "Admins pueden gestionar atributos" ON product_attributes;
DROP POLICY IF EXISTS "Admins pueden gestionar valores de atributos" ON product_attribute_values;
DROP POLICY IF EXISTS "Admins pueden gestionar variantes" ON product_variants;
DROP POLICY IF EXISTS "Admins pueden gestionar opciones de variantes" ON product_variant_options;

-- 2. Re-crear políticas usando auth.uid() consistente con el resto del sistema
CREATE POLICY "Admins pueden gestionar atributos" ON product_attributes
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden gestionar valores de atributos" ON product_attribute_values
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden gestionar variantes" ON product_variants
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins pueden gestionar opciones de variantes" ON product_variant_options
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- 3. Asegurar permisos de lectura para usuarios autenticados (necesario para el editor)
-- Ya existen políticas de lectura pública, pero por si acaso reforzamos para variantes inactivas en admin
DROP POLICY IF EXISTS "Variantes visibles públicamente" ON product_variants;
CREATE POLICY "Lectura de variantes para admins y publico activo" ON product_variants
  FOR SELECT USING (
    is_active = true OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );
