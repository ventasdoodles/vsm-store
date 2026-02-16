-- ============================================
-- FIX: Admin Access - Ejecutar TODO junto
-- ============================================

-- 1. Desactivar RLS en admin_users para que las policies
--    de las demás tablas puedan hacer el EXISTS check
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que el usuario admin existe
INSERT INTO public.admin_users (id, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'phixelhd@gmail.com'),
    'super_admin'
)
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- 3. Asegurar que tiene perfil de cliente
INSERT INTO public.customer_profiles (id, full_name, customer_tier, total_orders, total_spent)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'phixelhd@gmail.com'),
    'PhixelHD',
    'platinum',
    0,
    0
)
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar que todo quedó bien
SELECT 'admin_users' AS tabla, id, role FROM public.admin_users
WHERE id = (SELECT id FROM auth.users WHERE email = 'phixelhd@gmail.com')
UNION ALL
SELECT 'customer_profiles', id, full_name FROM public.customer_profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'phixelhd@gmail.com');
