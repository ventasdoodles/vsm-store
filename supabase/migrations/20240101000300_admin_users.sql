-- ============================================
-- VSM Store - Admin Users + RLS para Admin
-- Migración: 003_admin_users.sql
-- ============================================

-- 1. TABLA: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver la tabla de admins
CREATE POLICY "Admins can read admin_users" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- ============================================
-- 2. RLS: Admins tienen acceso completo a products
-- ============================================

-- Admin puede INSERT productos
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin puede UPDATE productos
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin puede DELETE productos
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin puede ver TODOS los productos (incluyendo inactivos)
CREATE POLICY "Admins can read all products" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- 3. RLS: Admins tienen acceso completo a categories
-- ============================================

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can read all categories" ON categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- 4. RLS: Admins pueden ver y actualizar TODOS los pedidos
-- ============================================

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- 5. RLS: Admins pueden ver todos los perfiles de clientes
-- ============================================

CREATE POLICY "Admins can read all profiles" ON customer_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- 6. RLS: Admins acceso completo a coupons
-- ============================================

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- INSTRUCCIONES:
-- 1. Ejecutar este SQL en Supabase Dashboard > SQL Editor
-- 2. Luego agregar tu usuario como admin:
--    INSERT INTO admin_users (id, role) VALUES ('TU-USER-UUID', 'super_admin');
-- ============================================
