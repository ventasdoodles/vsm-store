-- ============================================
-- Atomic Stock Decrement for VSM Store
-- Prevents overselling via database-level guards
-- ============================================

-- 1. Add CHECK constraints to prevent negative stock
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);
ALTER TABLE product_variants ADD CONSTRAINT variants_stock_non_negative CHECK (stock >= 0);

-- 2. Atomic stock decrement function
-- Returns true if all items were successfully decremented, false if any item had insufficient stock.
-- Uses SELECT ... FOR UPDATE to prevent race conditions.
CREATE OR REPLACE FUNCTION decrement_stock_for_order(
  p_items JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  current_stock INTEGER;
BEGIN
  -- Process each item within this transaction
  FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    variant_id UUID,
    quantity INTEGER
  )
  LOOP
    IF item.variant_id IS NOT NULL THEN
      -- Lock and decrement variant stock
      SELECT stock INTO current_stock
      FROM product_variants
      WHERE id = item.variant_id
      FOR UPDATE;

      IF current_stock IS NULL OR current_stock < item.quantity THEN
        RAISE EXCEPTION 'Insufficient variant stock for %: have %, need %',
          item.variant_id, COALESCE(current_stock, 0), item.quantity;
      END IF;

      UPDATE product_variants
      SET stock = stock - item.quantity
      WHERE id = item.variant_id;
    ELSE
      -- Lock and decrement product stock
      SELECT stock INTO current_stock
      FROM products
      WHERE id = item.product_id
      FOR UPDATE;

      IF current_stock IS NULL OR current_stock < item.quantity THEN
        RAISE EXCEPTION 'Insufficient product stock for %: have %, need %',
          item.product_id, COALESCE(current_stock, 0), item.quantity;
      END IF;

      UPDATE products
      SET stock = stock - item.quantity
      WHERE id = item.product_id;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- 3. Grant execute to service_role only (edge functions use service_role)
GRANT EXECUTE ON FUNCTION decrement_stock_for_order(JSONB) TO service_role;
