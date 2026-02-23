-- ============================================================
-- VSM Store - Corrección de Constraints y Políticas RLS
-- Migración: 20260223_fix_db_constraints.sql
-- Fecha: 23 febrero 2026
-- ============================================================
-- Corrige los siguientes problemas:
--   1. CHECK de payment_method en orders (faltaban 'whatsapp' y 'mercadopago')
--   2. CHECK de payment_status en orders (faltaba 'failed')
--   3. RLS de app_logs referenciaba tabla 'profiles' inexistente
--   4. Trigger DB-level para auto-crear customer_profiles al registrarse
--   5. Política admin en store_settings usaba 'superadmin' en vez de 'super_admin'
-- ============================================================


-- ============================================================
-- FIX 1 & 2 — Constraints de orders.payment_method y payment_status
-- ============================================================
-- El migration 002 creó la columna con solo ('cash', 'transfer', 'card').
-- El migration 20240214 intentó re-crearla con IF NOT EXISTS (no hizo nada).
-- Resultado: 'whatsapp' y 'mercadopago' fallaban el CHECK en producción,
-- y 'failed' (necesario para webhooks de MP) también era rechazado.

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
    CHECK (payment_method IN ('whatsapp', 'mercadopago', 'cash', 'transfer', 'card'));

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));


-- ============================================================
-- FIX 3 — app_logs: crear tabla si no existe + RLS correcto
-- ============================================================
-- La tabla puede no haberse aplicado en producción.
-- La creamos aquí garantizando que exista antes de las políticas.

CREATE TABLE IF NOT EXISTS public.app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    url TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_logs_level      ON public.app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON public.app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_category   ON public.app_logs(category);

ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Política correcta: referencia admin_users (no la inexistente 'profiles')
DROP POLICY IF EXISTS "Admins can view all app logs" ON public.app_logs;

CREATE POLICY "Admins can view all app logs"
  ON public.app_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can insert app logs" ON public.app_logs;

CREATE POLICY "Anyone can insert app logs"
  ON public.app_logs
  FOR INSERT
  WITH CHECK (true);


-- ============================================================
-- FIX 4 — Trigger DB para auto-crear customer_profiles al registrarse
-- ============================================================
-- El frontend lo hace en auth.service.ts pero si falla (confirmación de
-- email pendiente, OAuth futuro, etc.) el usuario queda sin perfil.
-- Este trigger actúa como respaldo y usa ON CONFLICT DO NOTHING.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (
    id,
    full_name,
    phone,
    whatsapp,
    customer_tier,
    total_orders,
    total_spent
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone',
    'bronze',
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar si ya existía de versiones anteriores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================
-- FIX 5 — store_settings: política de admin usaba 'superadmin' (typo)
-- ============================================================
-- El rol real en admin_users es 'super_admin' (con guión bajo).
-- Ya está correcto en 20260216145500_create_store_settings.sql,
-- pero el script standalone create-store-settings.sql lo tiene mal.
-- Nos aseguramos de que las políticas en producción sean correctas.

DROP POLICY IF EXISTS "Admins update settings" ON public.store_settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.store_settings;

CREATE POLICY "Admins can update settings"
  ON public.store_settings
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Only admins can insert settings" ON public.store_settings;

CREATE POLICY "Admins can insert settings"
  ON public.store_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );


-- ============================================================
-- FIX 6 — RLS de admin_orders: los admins deben poder ver TODOS los pedidos
-- ============================================================
-- Sin esta política, el admin no puede listar pedidos de otros usuarios.

DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;

CREATE POLICY "Admins can read all orders"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );


-- ============================================================
-- FIX 7 — RLS de coupons: admins deben poder gestionar cupones
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

CREATE POLICY "Admins can manage coupons"
  ON public.coupons
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );


-- ============================================================
-- FIX 8 — RLS de loyalty_points: admins pueden insertar puntos
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage loyalty points" ON public.loyalty_points;

CREATE POLICY "Admins can manage loyalty points"
  ON public.loyalty_points
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );


-- ============================================================
-- FIX 9 — RLS de customer_profiles: admins pueden ver todos los perfiles
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.customer_profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.customer_profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.customer_profiles;

CREATE POLICY "Admins can update all profiles"
  ON public.customer_profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );


-- ============================================================
-- FIN DE MIGRACIÓN 20260223_fix_db_constraints.sql
-- ============================================================
