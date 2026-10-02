-- ============================================================================
-- Migración: Checkout Atomization & Order Number Sequence (Tier 2)
--
-- Objetivos:
--   1. Reemplazar la generación de `order_number` basada en `MAX() + 1` con
--      una `SEQUENCE` nativa de PostgreSQL para evitar condiciones de carrera
--      y deadlocks en alto tráfico.
--   2. Crear el RPC `create_checkout_order` para envolver la creación de la
--      orden, sus items y la redención de cupones en una SÓLA transacción
--      atómica en la Base de Datos.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. ORDER NUMBER SEQUENCE FIX
-- ----------------------------------------------------------------------------
-- Obtener el valor máximo actual de la tabla e inicializar la secuencia
DO $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CASE 
            WHEN substring(order_number FROM 5) ~ '^[0-9]+$' 
            THEN CAST(substring(order_number FROM 5) AS INTEGER)
            ELSE 0 
        END
    ), 0) + 1
    INTO next_num
    FROM public.orders;

    EXECUTE 'CREATE SEQUENCE IF NOT EXISTS public.vsm_order_number_seq START WITH ' || next_num;
END $$;

-- Actualizar la función para usar nextval() de la secuencia de forma atómica
CREATE OR REPLACE FUNCTION public.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $$
DECLARE
    next_num INTEGER;
BEGIN
    next_num := nextval('public.vsm_order_number_seq');
    RETURN 'VSM-' || to_char(next_num, 'FM0000');
END;
$$;

-- Asegurar que los permisos son correctos (se revocaron en Tier 0, los reafirmamos)
REVOKE ALL ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;


-- ----------------------------------------------------------------------------
-- 2. CHECKOUT ATOMIZATION RPC
-- ----------------------------------------------------------------------------
-- Envuelve la inserción de orders, order_items y la redención del cupón
-- Si cualquier paso falla, la base de datos hace ROLLBACK completo automáticamente.

CREATE OR REPLACE FUNCTION public.create_checkout_order(
    p_order JSONB,
    p_order_items JSONB,
    p_coupon_code TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_order_id UUID;
BEGIN
    -- 1. Insertar orden (el trigger trg_set_order_number generará el número de orden)
    INSERT INTO public.orders (
        customer_id, customer_name, customer_phone, delivery_type,
        items, subtotal, shipping_cost, discount, total,
        status, payment_method, payment_status,
        shipping_address_id, shipping_address_snapshot,
        cesarin_session_id, conversion_source
    )
    SELECT
        (p_order->>'customer_id')::UUID,
        p_order->>'customer_name',
        p_order->>'customer_phone',
        p_order->>'delivery_type',
        p_order->'items',
        (p_order->>'subtotal')::NUMERIC,
        COALESCE((p_order->>'shipping_cost')::NUMERIC, 0),
        (p_order->>'discount')::NUMERIC,
        (p_order->>'total')::NUMERIC,
        p_order->>'status',
        p_order->>'payment_method',
        p_order->>'payment_status',
        NULLIF(p_order->>'shipping_address_id', '')::UUID,
        p_order->'shipping_address_snapshot',
        p_order->>'cesarin_session_id',
        p_order->>'conversion_source'
    RETURNING id INTO v_order_id;

    -- 2. Insertar items inyectando el order_id generado
    INSERT INTO public.order_items (
        order_id, product_id, variant_id, variant_name,
        name, price, quantity, image, section
    )
    SELECT
        v_order_id,
        (item->>'product_id')::UUID,
        NULLIF(item->>'variant_id', '')::UUID,
        item->>'variant_name',
        item->>'name',
        (item->>'price')::NUMERIC,
        (item->>'quantity')::INTEGER,
        item->>'image',
        item->>'section'
    FROM jsonb_array_elements(p_order_items) AS item;

    -- 3. Redimir cupón de forma atómica (si aplica)
    -- Si el cupón ya no es válido o se agotó concurrentemente,
    -- redeem_coupon_for_order lanza EXCEPTION y deshace toda la orden.
    IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
        PERFORM public.redeem_coupon_for_order(v_order_id, p_coupon_code);
    END IF;

    -- 4. Retornar el ID si todo tuvo éxito
    RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_checkout_order(JSONB, JSONB, TEXT) TO service_role;

COMMIT;
