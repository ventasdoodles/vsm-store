-- FINAL CRM 360 & WISHLIST STABILITY FIX (V4 - LOCAL COMPATIBILITY)
-- 
-- 1. Ensure all columns documented in AI_CONTEXT.md exist in customer_profiles
-- 2. Fix CRM View: LEFT JOIN with auth.users to ensure visibility even without auth records
-- 3. Fix Wishlist RLS: Add Missing INSERT policy for Admins

-- SELF-HEALING: Ensure columns exist before creating views
DO $$ 
BEGIN 
    -- ia_context (Wave 110/120)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='customer_profiles' AND column_name='ia_context') THEN
        ALTER TABLE public.customer_profiles ADD COLUMN ia_context JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- ai_preferences (Wave 120)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='customer_profiles' AND column_name='ai_preferences') THEN
        ALTER TABLE public.customer_profiles ADD COLUMN ai_preferences JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- avatar_url (Testimonials/Profile overlap)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='customer_profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.customer_profiles ADD COLUMN avatar_url TEXT;
    END IF;

    -- account_status (God Mode)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='customer_profiles' AND column_name='account_status') THEN
        ALTER TABLE public.customer_profiles ADD COLUMN account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'banned'));
    END IF;

    -- suspension_end (God Mode)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='customer_profiles' AND column_name='suspension_end') THEN
        ALTER TABLE public.customer_profiles ADD COLUMN suspension_end TIMESTAMPTZ;
    END IF;
END $$;

-- Drop views to allow schema changes
DROP VIEW IF EXISTS public.customer_intelligence_360 CASCADE;
DROP VIEW IF EXISTS public.customer_rfm_metrics CASCADE;

-- Recreate RFM metrics with auth LEFT JOIN for maximum visibility
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
    cp.id as id,
    cp.full_name,
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
    -- Select data from Auth IF it exists, otherwise fall back to profile
    COALESCE(u.email, 'Sin Email') as email,
    COALESCE((u.raw_user_meta_data->>'avatar_url')::text, cp.avatar_url) as avatar_url,
    -- RFM metrics
    EXTRACT(DAY FROM (NOW() - lo.last_order_date))::INTEGER as recency_days,
    COALESCE(lo.ord_count, 0) as frequency,
    COALESCE(lo.ord_total, 0) as monetary,
    lo.last_order_date
FROM public.customer_profiles cp
LEFT JOIN auth.users u ON cp.id = u.id
LEFT JOIN latest_orders lo ON cp.id = lo.customer_id;

-- Ensure the view is accessible
ALTER VIEW public.customer_rfm_metrics SET (security_invoker = on);

-- Recreate Intelligence View
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

ALTER VIEW public.customer_intelligence_360 SET (security_invoker = on);

-- FIX WISHLIST RLS: Add missing INSERT for Admins
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert any wishlist') THEN
        CREATE POLICY "Admins can insert any wishlist"
            ON public.customer_wishlists FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
                )
            );
    END IF;
END $$;

-- Force reload of schema cache
NOTIFY pgrst, 'reload schema';
