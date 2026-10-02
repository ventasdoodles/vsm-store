-- ============================================================================
-- FINANCIAL INTEGRITY CHECK CONSTRAINTS — VSM Store
-- ============================================================================
-- Source: Sol Pro audit recommendation, verified by meta-audit.
--
-- These constraints reject many invalid values at the database level.
-- They do NOT by themselves establish that a customer paid the right amount.
--
-- ⚠️  Before applying: identify and clean violating legacy data.
--     Run each constraint with NOT VALID first if you need to skip existing
--     rows, then VALIDATE CONSTRAINT later after data cleanup.
-- ============================================================================

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- Orders: financial fields must be consistent
-- ═══════════════════════════════════════════════════════════════════════════
-- Using NOT VALID so the migration succeeds even with legacy bad data.
-- Run ALTER TABLE ... VALIDATE CONSTRAINT ... after data cleanup.

ALTER TABLE public.orders
    ADD CONSTRAINT orders_money_valid CHECK (
        subtotal >= 0
        AND shipping_cost IS NOT NULL AND shipping_cost >= 0
        AND discount IS NOT NULL AND discount >= 0
        AND total >= 0
        AND total = subtotal + shipping_cost - discount
    ) NOT VALID;

ALTER TABLE public.orders
    ADD CONSTRAINT orders_items_array CHECK (
        jsonb_typeof(items) = 'array'
        AND jsonb_array_length(items) > 0
    ) NOT VALID;

-- ═══════════════════════════════════════════════════════════════════════════
-- Order Items: prices must be non-negative
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_price_nonnegative CHECK (price >= 0)
    NOT VALID;

-- ═══════════════════════════════════════════════════════════════════════════
-- Loyalty Points: must be positive
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.loyalty_points
    ADD CONSTRAINT loyalty_points_positive CHECK (points > 0)
    NOT VALID;

-- ═══════════════════════════════════════════════════════════════════════════
-- Products: price and stock validation
-- ═══════════════════════════════════════════════════════════════════════════
-- Note: products already has products_stock_non_negative from the
-- 20260902190000 migration. We add price validation.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_price_nonnegative'
          AND conrelid = 'public.products'::regclass
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0)
            NOT VALID;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Product Variants: price validation
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'variants_price_nonnegative'
          AND conrelid = 'public.product_variants'::regclass
    ) THEN
        ALTER TABLE public.product_variants
            ADD CONSTRAINT variants_price_nonnegative
            CHECK (price IS NULL OR price >= 0)
            NOT VALID;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Coupons: comprehensive validation
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.coupons
    ADD CONSTRAINT coupons_values_valid CHECK (
        discount_value > 0
        AND (discount_type <> 'percentage' OR discount_value <= 100)
        AND min_purchase IS NOT NULL AND min_purchase >= 0
        AND used_count IS NOT NULL AND used_count >= 0
        AND (max_uses IS NULL OR
             (max_uses > 0 AND used_count <= max_uses))
        AND (valid_until IS NULL OR valid_from < valid_until)
    ) NOT VALID;

-- ═══════════════════════════════════════════════════════════════════════════
-- Flash Deals: sold count bounds
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.flash_deals
    ADD CONSTRAINT flash_deals_sold_count_valid CHECK (
        sold_count >= 0 AND sold_count <= max_qty
    ) NOT VALID;

COMMIT;
