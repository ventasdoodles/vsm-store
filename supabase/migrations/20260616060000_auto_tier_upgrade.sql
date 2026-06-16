-- ============================================================================
-- VSM Store: Auto Tier Upgrade & Wheel Prize Points
-- Migration: 20260616060000_auto_tier_upgrade.sql
--
-- 1. recalculate_customer_tier(UUID)  – re-evaluates tier from total_spent
-- 2. trigger_recalc_tier_on_order()   – trigger fn for orders AFTER UPDATE
-- 3. tr_auto_tier_on_order_update     – the trigger itself
-- 4. apply_wheel_prize_points(UUID, INT, TEXT) – awards wheel points via RPC
-- ============================================================================

-- ============================================================
-- 1. FUNCTION: recalculate_customer_tier
--    Reads total_spent from customer_profiles, compares against
--    loyalty_tiers_config (store_settings id=1) or hardcoded
--    thresholds, and updates the tier when it differs.
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_customer_tier(p_customer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total_spent  NUMERIC;
    v_current_tier TEXT;
    v_new_tier     TEXT := 'bronze';  -- default lowest tier
    v_tiers_cfg    JSONB;
    v_tier         JSONB;
BEGIN
    -- Fetch the customer's current state
    SELECT total_spent, customer_tier
      INTO v_total_spent, v_current_tier
      FROM customer_profiles
     WHERE id = p_customer_id;

    -- Guard: customer not found
    IF v_total_spent IS NULL THEN
        RETURN;
    END IF;

    -- Fetch dynamic tiers config from store_settings (id = 1)
    SELECT loyalty_tiers_config
      INTO v_tiers_cfg
      FROM store_settings
     WHERE id = 1;

    -- Determine tier: use config if available, otherwise hardcoded thresholds
    IF v_tiers_cfg IS NOT NULL AND jsonb_array_length(v_tiers_cfg) > 0 THEN
        -- Iterate the config array; highest matching threshold wins
        FOR v_tier IN SELECT value FROM jsonb_array_elements(v_tiers_cfg) AS value
        LOOP
            IF v_total_spent >= (v_tier ->> 'threshold')::NUMERIC THEN
                v_new_tier := v_tier ->> 'id';
            END IF;
        END LOOP;
    ELSE
        -- Hardcoded fallback (mirrors seeded config values)
        IF v_total_spent >= 50000 THEN
            v_new_tier := 'platinum';
        ELSIF v_total_spent >= 20000 THEN
            v_new_tier := 'gold';
        ELSIF v_total_spent >= 5000 THEN
            v_new_tier := 'silver';
        ELSE
            v_new_tier := 'bronze';
        END IF;
    END IF;

    -- Only touch the row when the tier actually changes
    IF v_new_tier IS DISTINCT FROM v_current_tier THEN
        UPDATE customer_profiles
           SET customer_tier = v_new_tier
         WHERE id = p_customer_id;
    END IF;
END;
$$;

-- Ownership to postgres for SECURITY DEFINER safety
ALTER FUNCTION recalculate_customer_tier(UUID) OWNER TO postgres;

COMMENT ON FUNCTION recalculate_customer_tier(UUID)
    IS 'Re-evaluates and updates a customer tier based on total_spent vs loyalty_tiers_config thresholds.';

-- ============================================================
-- 2. TRIGGER FUNCTION: trigger_recalc_tier_on_order
--    Fires AFTER UPDATE on orders. Only acts on meaningful
--    status transitions (payment_status → paid, status → delivered).
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_recalc_tier_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Skip rows without a customer
    IF NEW.customer_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Only recalculate on relevant transitions
    IF (
        -- payment just changed to 'paid'
        (OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid')
        OR
        -- order just changed to 'delivered'
        (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'delivered')
    ) THEN
        PERFORM recalculate_customer_tier(NEW.customer_id);
    END IF;

    RETURN NEW;
END;
$$;

ALTER FUNCTION trigger_recalc_tier_on_order() OWNER TO postgres;

COMMENT ON FUNCTION trigger_recalc_tier_on_order()
    IS 'Trigger fn: recalculates customer tier when an order is paid or delivered.';

-- ============================================================
-- 3. TRIGGER: tr_auto_tier_on_order_update
-- ============================================================
DROP TRIGGER IF EXISTS tr_auto_tier_on_order_update ON orders;

CREATE TRIGGER tr_auto_tier_on_order_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_recalc_tier_on_order();

COMMENT ON TRIGGER tr_auto_tier_on_order_update ON orders
    IS 'Auto-recalculates customer loyalty tier after order status/payment changes.';

-- ============================================================
-- 4. FUNCTION: apply_wheel_prize_points
--    Convenience wrapper that delegates to the existing
--    process_loyalty_points RPC for wheel (ruleta) prizes.
-- ============================================================
CREATE OR REPLACE FUNCTION apply_wheel_prize_points(
    p_customer_id UUID,
    p_points      INTEGER,
    p_prize_label  TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delegate to the canonical loyalty-points RPC
    PERFORM process_loyalty_points(
        p_customer_id,
        p_points,
        'earned'::VARCHAR,
        ('Ruleta: ' || p_prize_label)::TEXT,
        NULL::UUID   -- no order_id for wheel prizes
    );
END;
$$;

ALTER FUNCTION apply_wheel_prize_points(UUID, INTEGER, TEXT) OWNER TO postgres;

GRANT EXECUTE ON FUNCTION apply_wheel_prize_points(UUID, INTEGER, TEXT) TO authenticated;

COMMENT ON FUNCTION apply_wheel_prize_points(UUID, INTEGER, TEXT)
    IS 'Awards loyalty points from the prize wheel (Ruleta). Wraps process_loyalty_points with a descriptive label.';
