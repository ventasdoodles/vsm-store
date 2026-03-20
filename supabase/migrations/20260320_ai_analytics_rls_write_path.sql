-- AI_ANALYTICS — RLS WRITE-PATH GATE (Wave 193 Telemetry Baseline)
--
-- Context:
--   ai_analytics was created in 20260315_cesarin_os.sql with NO RLS.
--   GRANT ALL ON ALL TABLES TO authenticated (20260316_universal_rescue.sql:141)
--   covers authenticated inserts, but anon role has no INSERT grant.
--   Anonymous pilot traffic (sessionStorage gate, no Supabase session) cannot insert.
--
-- Fix:
--   Enable RLS. Grant INSERT to anon. Add permissive INSERT policies for both roles.
--   Add admin SELECT policy to preserve reader compatibility (admin-pilot-ops.service).
--   service_role (edge functions) bypasses RLS automatically — unaffected.

ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- anon role has no blanket GRANT — grant INSERT explicitly
GRANT INSERT ON public.ai_analytics TO anon;

-- INSERT: allow telemetry writes from anonymous pilot traffic
CREATE POLICY "ai_analytics_insert_anon"
ON public.ai_analytics
FOR INSERT
TO anon
WITH CHECK (true);

-- INSERT: allow telemetry writes from authenticated pilot users
CREATE POLICY "ai_analytics_insert_authenticated"
ON public.ai_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- SELECT: admin-only read — preserves admin-pilot-ops.service.ts reader compatibility
CREATE POLICY "ai_analytics_select_admin"
ON public.ai_analytics
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
