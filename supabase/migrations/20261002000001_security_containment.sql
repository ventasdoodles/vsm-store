-- ============================================================================
-- SECURITY CONTAINMENT MIGRATION — VSM Store
-- ============================================================================
-- Source: Meta-Audit 2026-10-02 (Sol Pro findings, verified by Claude Opus 4.6)
-- Purpose: Emergency lockdown of exploitable RLS gaps, SECURITY DEFINER
--          function grants, and overly permissive DEFAULT PRIVILEGES.
-- 
-- ⚠️  THIS DISABLES client-side order/coupon/loyalty writes.
--     Deploy server-authoritative checkout before restoring checkout flow.
-- ============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. CRITICAL: admin_users — Enable RLS + restrict access
-- ═══════════════════════════════════════════════════════════════════════════
-- RLS was NEVER enabled on admin_users. All policies were decorative.
-- GRANT ALL to authenticated meant any user could INSERT themselves as super_admin.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated to read admin_users"
    ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users"
    ON public.admin_users;

-- Admins can only read their own row (to check their own role)
CREATE POLICY admin_users_read_self ON public.admin_users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, role) ON public.admin_users TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CRITICAL: Remove client-side order/item/coupon/loyalty writes
-- ═══════════════════════════════════════════════════════════════════════════
-- Clients must NOT be able to insert orders with arbitrary totals/statuses.
-- All order creation must go through the checkout Edge Function (service_role).

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own coupon usage"
    ON public.customer_coupons;
DROP POLICY IF EXISTS "Users can insert their own attempts"
    ON public.wheel_attempts;
DROP POLICY IF EXISTS "Users can update (claim) their own propositions"
    ON public.smart_loyalty_propositions;

REVOKE INSERT, UPDATE, DELETE ON public.orders, public.order_items,
    public.customer_coupons, public.wheel_attempts,
    public.smart_loyalty_propositions
    FROM anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. HIGH: customer_profiles — column-level allowlist
-- ═══════════════════════════════════════════════════════════════════════════
-- Users could overwrite total_spent, customer_tier, account_status, etc.
-- Now only safe profile fields are editable.

REVOKE INSERT, UPDATE, DELETE ON public.customer_profiles
    FROM anon, authenticated;
GRANT UPDATE (full_name, phone, whatsapp, birthdate,
              favorite_category_id, avatar_url, ai_preferences)
    ON public.customer_profiles TO authenticated;
DROP POLICY IF EXISTS "Users can insert own profile"
    ON public.customer_profiles;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. HIGH: user_notifications — only allow marking as read
-- ═══════════════════════════════════════════════════════════════════════════

REVOKE UPDATE ON public.user_notifications FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.user_notifications TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. CRITICAL: Revoke public EXECUTE on SECURITY DEFINER functions
-- ═══════════════════════════════════════════════════════════════════════════
-- PostgreSQL grants EXECUTE to PUBLIC by default. An explicit GRANT to
-- service_role does NOT revoke the PUBLIC default.

REVOKE ALL ON FUNCTION public.process_loyalty_points
    (uuid, integer, character varying, text, uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_coupon_uses(text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rename_product_tag(text, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_loyalty_stats()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_user_spin(uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_order_number()
    FROM PUBLIC, anon, authenticated;

-- Functions from migrations (may not exist in all environments)
DO $$
BEGIN
  IF to_regprocedure('public.decrement_stock_for_order(jsonb)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.decrement_stock_for_order(jsonb)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure('public.apply_wheel_prize_points(uuid,integer,text)')
     IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.apply_wheel_prize_points(uuid,integer,text)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure('public.process_referral_reversal(uuid,uuid)')
     IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.process_referral_reversal(uuid,uuid)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure(
       'public.admin_generate_dedicated_coupon(uuid,numeric,text,numeric,integer)'
     ) IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.admin_generate_dedicated_coupon
             (uuid,numeric,text,numeric,integer)
             FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. HIGH: Stop public reads of operational/private data
-- ═══════════════════════════════════════════════════════════════════════════

-- store_settings leaks bank_account_info to anon
DROP POLICY IF EXISTS "Public settings are visible to everyone"
    ON public.store_settings;
REVOKE SELECT ON public.store_settings FROM anon, authenticated;

-- Cesarín internal data was readable/writable by any authenticated user
DROP POLICY IF EXISTS "Admins can view all pilot feedback"
    ON public.cesarin_pilot_feedback;
DROP POLICY IF EXISTS "Admins can insert pilot feedback"
    ON public.cesarin_pilot_feedback;
DROP POLICY IF EXISTS "Enable insert for service role"
    ON public.ai_simulation_reports;
DROP POLICY IF EXISTS "Enable read access for authenticated users"
    ON public.ai_simulation_reports;
DROP POLICY IF EXISTS "operator_actions_insert_auth"
    ON public.cesarin_operator_actions;
DROP POLICY IF EXISTS "operator_actions_select_auth"
    ON public.cesarin_operator_actions;
DROP POLICY IF EXISTS "signal_states_insert_auth"
    ON public.cesarin_signal_states;
DROP POLICY IF EXISTS "signal_states_select_auth"
    ON public.cesarin_signal_states;
DROP POLICY IF EXISTS "signal_states_update_auth"
    ON public.cesarin_signal_states;

REVOKE ALL ON public.cesarin_pilot_feedback,
    public.ai_simulation_reports, public.cesarin_operator_actions,
    public.cesarin_signal_states
    FROM anon, authenticated;

-- Prevent public event poisoning; conversion events must be server-written
DROP POLICY IF EXISTS "conversation_conversion_events_insert_anon"
    ON public.conversation_conversion_events;
DROP POLICY IF EXISTS "conversation_conversion_events_insert_authenticated"
    ON public.conversation_conversion_events;
REVOKE INSERT ON public.conversation_conversion_events
    FROM anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. MEDIUM: Stop auto-publishing new API objects
-- ═══════════════════════════════════════════════════════════════════════════

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon, authenticated;

COMMIT;
