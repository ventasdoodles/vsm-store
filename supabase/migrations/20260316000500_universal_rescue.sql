-- UNIVERSAL ADMIN & CRM RESCUE (V7 - PL/pgSQL SYNTAX FIX)
-- 
-- 1. ADMIn RECOVERY: Force Register Admin
-- 2. AUTH SEEDING: satisfy Foreign Key constraints
-- 3. DATA SEEDING: Profiles, Orders, AI Context
-- 4. VIEW SECURITY: Fixed visibility for auth.users schema
-- 5. RLS PATCH: Absolute Admin access (CRUD) for all core tables

-- 1. ADMIN RECOVERY
INSERT INTO public.admin_users (id, role)
VALUES ('d6dbfa10-f3ee-44b8-8b2c-5f729edd9f22', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- 2. AUTH SEEDING
INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, encrypted_password)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'juan@vsm.store', 'authenticated', 'authenticated', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Juan Pérez"}', NOW(), NOW(), ''),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'maria@vsm.store', 'authenticated', 'authenticated', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"María García"}', NOW(), NOW(), ''),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', 'carlos@vsm.store', 'authenticated', 'authenticated', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlos Rodríguez"}', NOW(), NOW(), ''),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3456789012de', 'samantha@vsm.store', 'authenticated', 'authenticated', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Samantha Flow"}', NOW(), NOW(), ''),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4567890123ef', 'roberto@vsm.store', 'authenticated', 'authenticated', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Roberto Green"}', NOW(), NOW(), '')
ON CONFLICT (id) DO NOTHING;

-- 3. DATA SEEDING
INSERT INTO public.customer_profiles (id, full_name, phone, whatsapp, customer_tier, total_orders, total_spent, ia_context, ai_preferences, created_at)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'Juan Pérez', '5512345678', '5512345678', 'gold', 1, 1200.50, '{"last_intent": "vape_premium", "visual_theme_hint": "vape"}'::jsonb, '{"interests": ["mentolados", "sales"]}'::jsonb, NOW() - INTERVAL '60 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'María García', '5587654321', '5587654321', 'platinum', 3, 3270.00, '{"last_intent": "wellness", "visual_theme_hint": "herbal"}'::jsonb, '{"interests": ["cbd", "herbal"]}'::jsonb, NOW() - INTERVAL '15 days'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', 'Carlos Rodríguez', '5555555555', '5555555555', 'bronze', 1, 2300.00, '{"last_intent": "new_user", "visual_theme_hint": "neutral"}'::jsonb, '{"interests": ["kit_inicio"]}'::jsonb, NOW() - INTERVAL '2 days'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3456789012de', 'Samantha Flow', '5566778899', '5566778899', 'silver', 2, 4500.00, '{"last_intent": "tech_vape", "visual_theme_hint": "vape"}'::jsonb, '{"interests": ["mods", "coils"]}'::jsonb, NOW() - INTERVAL '5 days'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4567890123ef', 'Roberto Green', '5599887766', '5599887766', 'gold', 5, 12500.00, '{"last_intent": "organic", "visual_theme_hint": "herbal"}'::jsonb, '{"interests": ["terpenos", "vapes_herbal"]}'::jsonb, NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    ia_context = EXCLUDED.ia_context,
    ai_preferences = EXCLUDED.ai_preferences;

INSERT INTO public.orders (customer_id, order_number, subtotal, total, items, status, created_at)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'VSM-R001', 1200.50, 1200.50, '[]'::jsonb, 'delivered', NOW() - INTERVAL '60 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'VSM-R002', 850.00, 850.00, '[]'::jsonb, 'delivered', NOW() - INTERVAL '15 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'VSM-R003', 920.00, 920.00, '[]'::jsonb, 'delivered', NOW() - INTERVAL '8 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'VSM-R004', 1500.00, 1500.00, '[]'::jsonb, 'delivered', NOW() - INTERVAL '2 days'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', 'VSM-R005', 2300.00, 2300.00, '[]'::jsonb, 'processing', NOW() - INTERVAL '1 hour'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3456789012de', 'VSM-R006', 2250.00, 2250.00, '[]'::jsonb, 'delivered', NOW() - INTERVAL '5 days'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3456789012de', 'VSM-R007', 2250.00, 2250.00, '[]'::jsonb, 'delivered', NOW() - INTERVAL '10 days'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4567890123ef', 'VSM-R008', 2500.00, 2500.00, '[]'::jsonb, 'shipped', NOW() - INTERVAL '1 day')
ON CONFLICT (order_number) DO NOTHING;

-- 4. VIEW SECURITY FIXES (Explicit columns to avoid duplicates)
DROP VIEW IF EXISTS public.customer_intelligence_360 CASCADE;
DROP VIEW IF EXISTS public.customer_rfm_metrics CASCADE;

CREATE OR REPLACE VIEW public.customer_rfm_metrics AS
WITH latest_orders AS (
    SELECT 
        customer_id,
        MAX(created_at) as last_order_date,
        COUNT(id) as ord_count,
        SUM(total) as ord_total
    FROM public.orders
    WHERE status != 'cancelled'
    GROUP BY customer_id
)
SELECT 
    cp.id as customer_id,
    cp.id,
    cp.full_name,
    cp.phone as customer_phone,
    cp.phone,
    cp.whatsapp,
    cp.birthdate,
    cp.customer_tier,
    cp.total_orders,
    cp.total_spent,
    cp.favorite_category_id,
    cp.created_at,
    cp.updated_at,
    cp.ia_context,
    cp.ai_preferences,
    cp.account_status,
    cp.suspension_end,
    COALESCE(u.email, 'Sin Email') as email,
    COALESCE((u.raw_user_meta_data->>'avatar_url')::text, cp.avatar_url) as avatar_url,
    COALESCE(EXTRACT(DAY FROM (NOW() - lo.last_order_date))::INTEGER, 365) as recency_days,
    COALESCE(lo.ord_count, 0) as frequency,
    COALESCE(lo.ord_total, 0) as monetary,
    lo.last_order_date
FROM public.customer_profiles cp
LEFT JOIN auth.users u ON cp.id = u.id
LEFT JOIN latest_orders lo ON cp.id = lo.customer_id
WHERE (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
    OR
    (auth.uid() = cp.id)
);

ALTER VIEW public.customer_rfm_metrics SET (security_invoker = off);

CREATE OR REPLACE VIEW public.customer_intelligence_360 AS
SELECT 
  *,
  CASE 
    WHEN recency_days <= 15 AND frequency >= 3 THEN 'Campeón'
    WHEN recency_days <= 30 AND frequency >= 2 THEN 'Leal'
    WHEN recency_days > 45 THEN 'En Riesgo'
    WHEN recency_days IS NULL THEN 'Prospecto'
    ELSE 'Regular'
  END as segment,
  CASE
    WHEN recency_days <= 7 THEN 'Saludable'
    WHEN recency_days <= 30 THEN 'Estable'
    WHEN recency_days > 30 THEN 'Requiere Atención'
    ELSE 'Sin Actividad'
  END as health_status
FROM public.customer_rfm_metrics;

ALTER VIEW public.customer_intelligence_360 SET (security_invoker = off);

-- 5. RLS PATCH (RESTORE FULL CRUD FOR ADMINS - CORRECT SYNTAX)
DO $$ 
DECLARE
    t text;
    tables_to_fix text[] := ARRAY['customer_profiles', 'orders', 'customer_wishlists', 'addresses', 'admin_customer_notes', 'products', 'product_variants', 'coupons'];
BEGIN
    FOREACH t IN ARRAY tables_to_fix LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop old admin policies (Using %I for identifiers/policy names)
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins can manage ' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins can read all ' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins have full access on ' || t, t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admins manage ' || t, t);
        
        -- Create new absolute policy
        EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))', 'Admins have full access on ' || t, t);
    END LOOP;
END $$;

-- Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Force Cache Refresh
NOTIFY pgrst, 'reload schema';
