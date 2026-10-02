-- ============================================================================
-- IMPROVED STOCK DECREMENT — VSM Store
-- ============================================================================
-- Source: Sol Pro audit recommendation, verified by meta-audit.
-- Replaces: 20260902190000_atomic_stock_decrement.sql function
--
-- Improvements over the original:
--   1. Validates input (non-empty array, positive integers only)
--   2. Aggregates duplicate SKUs before processing
--   3. Deterministic lock order (ORDER BY product_id, variant_id) prevents deadlocks
--   4. Verifies variant belongs to the specified product
--   5. Rejects negative/zero quantities (prevents stock inflation)
--   6. Sets safe search_path to prevent hijacking
--   7. Explicitly REVOKEs PUBLIC + GRANTs only to service_role
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_items jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    r record;
    v_changed integer;
BEGIN
    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Nonempty item array required'
            USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_items) AS e(value)
        WHERE jsonb_typeof(e.value) <> 'object'
           OR jsonb_typeof(e.value->'product_id') <> 'string'
           OR jsonb_typeof(e.value->'quantity') <> 'number'
           OR (e.value->>'quantity') !~ '^[1-9][0-9]*$'
           OR ((e.value->>'quantity')::numeric > 2147483647)
           OR (e.value ? 'variant_id'
               AND e.value->'variant_id' <> 'null'::jsonb
               AND jsonb_typeof(e.value->'variant_id') <> 'string')
    ) THEN
        RAISE EXCEPTION 'Invalid stock item'
            USING ERRCODE = '22023';
    END IF;

    -- Validate casts, aggregate duplicate targets, then lock/update in
    -- one stable global order. Invalid UUIDs fail the transaction.
    FOR r IN
        SELECT x.product_id, x.variant_id, sum(x.quantity)::bigint AS qty
        FROM jsonb_to_recordset(p_items)
             AS x(product_id uuid, variant_id uuid, quantity integer)
        GROUP BY x.product_id, x.variant_id
        ORDER BY x.product_id, x.variant_id NULLS FIRST
    LOOP
        IF r.product_id IS NULL OR r.qty < 1 OR r.qty > 2147483647 THEN
            RAISE EXCEPTION 'Invalid item quantity or product'
                USING ERRCODE = '22023';
        END IF;

        IF r.variant_id IS NULL THEN
            UPDATE public.products AS p
               SET stock = p.stock - r.qty::integer
             WHERE p.id = r.product_id
               AND p.stock IS NOT NULL
               AND p.stock >= r.qty;
        ELSE
            UPDATE public.product_variants AS v
               SET stock = v.stock - r.qty::integer
             WHERE v.id = r.variant_id
               AND v.product_id = r.product_id
               AND v.stock IS NOT NULL
               AND v.stock >= r.qty;
        END IF;

        GET DIAGNOSTICS v_changed = ROW_COUNT;
        IF v_changed <> 1 THEN
            RAISE EXCEPTION
                'Missing SKU, mismatched variant, or insufficient stock'
                USING ERRCODE = '23514';
        END IF;
    END LOOP;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock_for_order(jsonb)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(jsonb)
    TO service_role;

COMMIT;
