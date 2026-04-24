-- ============================================
-- VSM Store - Módulo de Variaciones (UNIFICADO)
-- Migración: 20260306_unified_product_variations.sql
-- Descripción: Creación de tablas, RLS y Seed en un solo script.
-- ============================================

-- 1. TABLAS (IF NOT EXISTS para ejecución segura)
-- ============================================================================
-- MIGRACIÓN UNIFICADA: VARIACIONES DE PRODUCTO
-- Descripción: Crea tablas para atributos globales y variantes de producto
-- con soporte para precios y stock independientes por opción.
-- ============================================================================

-- 1. TABLA DE ATRIBUTOS (Ej: Color, Talla, Concentración)
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- 2. TABLA DE VALORES DE ATRIBUTOS (Ej: Rojo, Azul, 6mg, 3mg)
CREATE TABLE IF NOT EXISTS product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attribute_id, value)
);

-- 3. TABLA DE VARIANTES DE PRODUCTO (Combinaciones finales)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE RELACIÓN VARIANTE-VALOR (Matriz de opciones)
CREATE TABLE IF NOT EXISTS product_variant_options (
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id UUID REFERENCES product_attribute_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, attribute_value_id)
);

-- 2. RLS (Habilitar)
-- 5. SEGURIDAD (Row Level Security - RLS)
-- Se utiliza la validación estándar basada en la tabla admin_users para asegurar
-- que solo administradores autenticados puedan modificar estos datos.
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS (Limpiar y Re-crear para asegurar correctitud)
-- Atributos
DROP POLICY IF EXISTS "Atributos visibles públicamente" ON product_attributes;
DROP POLICY IF EXISTS "Admins pueden gestionar atributos" ON product_attributes;
CREATE POLICY "Atributos visibles públicamente" ON product_attributes FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar atributos" ON product_attributes 
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Valores
DROP POLICY IF EXISTS "Valores de atributos visibles públicamente" ON product_attribute_values;
DROP POLICY IF EXISTS "Admins pueden gestionar valores de atributos" ON product_attribute_values;
CREATE POLICY "Valores de atributos visibles públicamente" ON product_attribute_values FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar valores de atributos" ON product_attribute_values
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Variantes
DROP POLICY IF EXISTS "Variantes visibles públicamente" ON product_variants;
DROP POLICY IF EXISTS "Admins pueden gestionar variantes" ON product_variants;
DROP POLICY IF EXISTS "Lectura de variantes para admins y publico activo" ON product_variants;
CREATE POLICY "Lectura de variantes para admins y publico activo" ON product_variants
  FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
CREATE POLICY "Admins pueden gestionar variantes" ON product_variants
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Opciones
DROP POLICY IF EXISTS "Opciones de variantes visibles públicamente" ON product_variant_options;
DROP POLICY IF EXISTS "Admins pueden gestionar opciones de variantes" ON product_variant_options;
CREATE POLICY "Opciones de variantes visibles públicamente" ON product_variant_options FOR SELECT USING (true);
CREATE POLICY "Admins pueden gestionar opciones de variantes" ON product_variant_options
  FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- 4. SEED INICIAL
INSERT INTO product_attributes (name) VALUES 
  ('Concentración'), ('Color'), ('Capacidad'), ('Sabor')
ON CONFLICT (name) DO NOTHING;
