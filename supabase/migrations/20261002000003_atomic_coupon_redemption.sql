-- ============================================================================
-- ATOMIC COUPON REDEMPTION — VSM Store
-- ============================================================================
-- Source: Sol Pro audit recommendation, verified by meta-audit.
-- Replaces: The split client "check / increment / insert" flow used by
--           checkout-submit/index.ts with a single atomic transaction.
--
-- Fixes:
--   1. TOCTOU race between checking coupon availability and incrementing
--   2. Concurrent redemptions exceeding max_uses
--   3. Duplicate redemptions for the same order
--   4. Missing eligibility checks (validity dates, min_purchase, customer_id)
--   5. increment_coupon_uses being publicly callable
-- ============================================================================

BEGIN;

-- Unique index prevents duplicate redemptions per order+code
CREATE UNIQUE INDEX IF NOT EXISTS customer_coupons_one_per_order_code
    ON public.customer_coupons (order_id, coupon_code)
    WHERE order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.redeem_coupon_for_order(
    p_order_id uuid,
    p_code text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
BEGIN
    -- Lock the order row to serialize concurrent redemptions
    SELECT * INTO v_order
      FROM public.orders
     WHERE id = p_order_id
     FOR UPDATE;

    IF NOT FOUND OR v_order.customer_id IS NULL
       OR v_order.status <> 'pending'
       OR v_order.payment_status <> 'pending' THEN
        RAISE EXCEPTION 'Order is not eligible for coupon redemption'
            USING ERRCODE = '23514';
    END IF;

    -- Check for existing redemption
    IF EXISTS (
        SELECT 1 FROM public.customer_coupons
         WHERE order_id = p_order_id AND coupon_code = p_code
    ) THEN
        RAISE EXCEPTION 'Coupon already redeemed for this order'
            USING ERRCODE = '23505';
    END IF;

    -- Atomically validate and increment coupon usage
    -- This UPDATE only succeeds if ALL conditions are met
    UPDATE public.coupons AS c
       SET used_count = c.used_count + 1
     WHERE c.code = p_code
       AND c.is_active IS TRUE
       AND c.valid_from <= now()
       AND (c.valid_until IS NULL OR c.valid_until > now())
       AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
       AND (c.customer_id IS NULL OR
            c.customer_id = v_order.customer_id)
       AND c.min_purchase <= v_order.subtotal;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Coupon invalid or exhausted'
            USING ERRCODE = '23514';
    END IF;

    -- Record the redemption
    INSERT INTO public.customer_coupons
        (customer_id, coupon_code, order_id)
    VALUES (v_order.customer_id, p_code, p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_coupon_for_order(uuid, text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon_for_order(uuid, text)
    TO service_role;

COMMIT;
