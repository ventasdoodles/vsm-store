-- RESCUE SCRIPT: ADMIN DATA VISIBILITY & SYSTEM PERFORMANCE
-- Run this in Supabase SQL Editor to verify admin status and fix RLS issues.

-- 1. Verify/Insert your ID as Admin
-- UID provided by user: d6dbfa10-f3ee-44b8-8b2c-5f729edd9f22

INSERT INTO public.admin_users (id, role)
VALUES ('d6dbfa10-f3ee-44b8-8b2c-5f729edd9f22', 'super_admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Explicitly grant permissions to the authenticated role
-- Sometimes security_invoker views need direct table access permissions
GRANT SELECT ON public.customer_profiles TO authenticated;
GRANT SELECT ON public.orders TO authenticated;

-- 3. Fix View Column Collision & Security
-- Redefines the CRM 360 view with clearer column mapping and strict security.
DROP VIEW IF EXISTS public.customer_intelligence_360 CASCADE;
DROP VIEW IF EXISTS public.customer_rfm_metrics CASCADE;

CREATE VIEW public.customer_rfm_metrics AS
WITH latest_orders AS (
    SELECT 
        customer_id,
        MAX(created_at) as last_order_date,
        COUNT(id) as ord_count,
        SUM(total) as ord_total
    FROM orders
    GROUP BY customer_id
)
SELECT 
    cp.*,
    EXTRACT(DAY FROM (NOW() - lo.last_order_date))::INTEGER as recency_days,
    COALESCE(lo.ord_count, 0) as frequency,
    COALESCE(lo.ord_total, 0) as monetary,
    lo.last_order_date
FROM public.customer_profiles cp
LEFT JOIN latest_orders lo ON cp.id = lo.customer_id;

ALTER VIEW public.customer_rfm_metrics SET (security_invoker = on);

CREATE VIEW public.customer_intelligence_360 AS
SELECT 
  *,
  CASE 
    WHEN recency_days <= 30 AND frequency >= 3 THEN 'loyal'
    WHEN recency_days <= 60 AND frequency >= 1 THEN 'regular'
    WHEN recency_days > 90 THEN 'churn_risk'
    ELSE 'new'
  END as segment,
  CASE
    WHEN recency_days < 15 THEN 'optimal'
    WHEN recency_days < 45 THEN 'warning'
    ELSE 'critical'
  END as health_status
FROM public.customer_rfm_metrics;

ALTER VIEW public.customer_intelligence_360 SET (security_invoker = on);

-- 4. Ensure Admin View Policy exists and is the only one blocking
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.customer_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.customer_profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()) OR (auth.uid() = id)
  );

-- 5. Force Refresh Schema Cache (Internal Supabase nudge)
NOTIFY pgrst, 'reload schema';
