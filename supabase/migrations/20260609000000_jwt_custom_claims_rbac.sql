-- ============================================
-- VSM Store - JWT Custom Claims RBAC Infra
-- ============================================

-- 1. Helper Function to set role in JWT app_metadata
CREATE OR REPLACE FUNCTION public.sync_admin_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Inyectar role en auth.users app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', NEW.role)
    WHERE id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remover role de auth.users app_metadata
    UPDATE auth.users
    SET raw_app_meta_data = 
      raw_app_meta_data - 'role'
    WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Trigger en admin_users
DROP TRIGGER IF EXISTS on_admin_users_change ON public.admin_users;
CREATE TRIGGER on_admin_users_change
  AFTER INSERT OR UPDATE OR DELETE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.sync_admin_role_to_jwt();

-- 3. Helper Function is_admin() para RLS Policies futuras
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
