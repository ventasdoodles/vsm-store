-- ============================================
-- VSM Store - Módulo de Variaciones de Productos
-- Migración: 20260306_product_variations.sql
-- Fecha: 2026-03-06
-- ============================================

-- 1. TABLA: product_attributes (Atributos Globales)
-- Ej: "Color", "Concentración", "Capacidad"
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- 2. TABLA: product_attribute_values (Valores de Atributos)
-- Ej: "Rojo", "6mg", "60ml"
CREATE TABLE product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attribute_id, value)
);

-- 3. TABLA: product_variants (Instancias de Producto con Stock/Precio)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  price DECIMAL(10,2), -- Si es NULL, se usa el precio base del producto
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: product_variant_options (Relación Variante <-> Valores)
CREATE TABLE product_variant_options (
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id UUID REFERENCES product_attribute_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, attribute_value_id)
);

-- 5. TRIGGER: updated_at para variantes
CREATE TRIGGER trigger_product_variants_updated_at
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. ÍNDICES
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variant_options_value ON product_variant_options(attribute_value_id);

-- 7. RLS (Row Level Security)
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_options ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Atributos visibles públicamente" ON product_attributes FOR SELECT USING (true);
CREATE POLICY "Valores de atributos visibles públicamente" ON product_attribute_values FOR SELECT USING (true);
CREATE POLICY "Variantes visibles públicamente" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Opciones de variantes visibles públicamente" ON product_variant_options FOR SELECT USING (true);

-- Políticas de escritura para administradores (basadas en el rol de la tabla profiles o admin_users)
-- Asumimos que existe una función check_is_admin() o similar basada en los perfiles
CREATE POLICY "Admins pueden gestionar atributos" ON product_attributes
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Admins pueden gestionar valores de atributos" ON product_attribute_values
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Admins pueden gestionar variantes" ON product_variants
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

CREATE POLICY "Admins pueden gestionar opciones de variantes" ON product_variant_options
  FOR ALL TO authenticated USING (auth.jwt() ->> 'email' IN (SELECT email FROM admin_users));

-- 8. SEED INICIAL: Atributos comunes
INSERT INTO product_attributes (name) VALUES 
  ('Concentración'),
  ('Color'),
  ('Capacidad'),
  ('Sabor');
