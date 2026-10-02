-- ============================================================================
-- Migración: Cross-Validation de Monto de Pago (Tier 2 Remediation)
--
-- Objetivos:
--   Validar que el `transaction_amount` y `status` del objeto `p_mp_payment_data`
--   coincida con el `total` de la orden en la base de datos.
--   Esto previene el Payment Forgery (pagar $1 en una orden de $10,000)
--   que era factible si el atacante referenciaba el `external_reference`
--   de la orden costosa desde un checkout barato.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fulfill_order_payment(
    p_order_id UUID,
    p_payment_id TEXT,
    p_payment_status TEXT,
    p_order_status TEXT,
    p_mp_payment_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_prev_payment_status TEXT;
    v_session_id          TEXT;
    v_conversion_source   TEXT;
    v_total               NUMERIC;
    v_items               JSONB;
    v_conversion_event_id UUID;
    v_stock_decremented   BOOLEAN := FALSE;
    v_conversion_inserted BOOLEAN := FALSE;
    
    -- Variables para cross-validation
    v_mp_amount           NUMERIC;
    v_mp_status           TEXT;
BEGIN
    -- (a) Serialización: lock exclusivo de la fila de la orden.
    SELECT o.payment_status, o.cesarin_session_id, o.conversion_source, o.total
    INTO v_prev_payment_status, v_session_id, v_conversion_source, v_total
    FROM public.orders AS o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('action', 'reject', 'reason', 'order_not_found');
    END IF;

    -- (b1) Idempotencia
    IF v_prev_payment_status = 'paid' AND p_payment_status = 'paid' THEN
        RETURN jsonb_build_object(
            'action',              'skip',
            'reason',              'already_paid',
            'order_id',            p_order_id,
            'stock_decremented',   FALSE,
            'conversion_inserted', FALSE,
            'cesarin_session_id',  v_session_id,
            'conversion_source',   v_conversion_source,
            'total',               v_total
        );
    END IF;

    -- (b2) Guarda de no-regresión
    IF v_prev_payment_status IN ('paid', 'refunded') THEN
        RETURN jsonb_build_object(
            'action',              'skip',
            'reason',              'non_regression_guard',
            'order_id',            p_order_id,
            'stock_decremented',   FALSE,
            'conversion_inserted', FALSE,
            'cesarin_session_id',  v_session_id,
            'conversion_source',   v_conversion_source,
            'total',               v_total
        );
    END IF;

    -- (b3) TIER 2: Validación Cruzada de Monto (Payment Forgery Protection)
    -- Extraer transaction_amount de Mercado Pago data
    -- (Aplica primariamente cuando se está intentando marcar como 'paid')
    IF p_payment_status = 'paid' THEN
        v_mp_amount := (p_mp_payment_data->>'transaction_amount')::NUMERIC;
        v_mp_status := p_mp_payment_data->>'status';
        
        -- Si Mercado Pago dice que pagó menos que el total de la orden
        -- Se rechaza la transición a 'paid' (se marca como fraudulento/fallido).
        -- Consideramos un pequeño margen de error si hay decimales por tipo de cambio, 
        -- pero exigimos coincidencia exacta o superior (por si MP cobró comisión al usuario).
        -- Aquí asumimos que v_total es exacto.
        IF v_mp_amount IS NULL OR v_mp_amount < v_total THEN
            RETURN jsonb_build_object(
                'action',              'reject',
                'reason',              'amount_mismatch',
                'order_id',            p_order_id,
                'expected_total',      v_total,
                'received_amount',     v_mp_amount
            );
        END IF;
        
        -- El status interno dentro de p_mp_payment_data debe ser 'approved'
        IF v_mp_status IS NULL OR v_mp_status <> 'approved' THEN
             RETURN jsonb_build_object(
                'action',              'reject',
                'reason',              'status_mismatch',
                'order_id',            p_order_id,
                'received_status',     v_mp_status
            );
        END IF;
    END IF;

    -- (c) Update del pago
    UPDATE public.orders
    SET payment_status  = p_payment_status,
        status          = p_order_status,
        mp_payment_id   = p_payment_id,
        mp_payment_data = p_mp_payment_data,
        updated_at      = now()
    WHERE id = p_order_id;

    -- (d) Fulfillment solo en la transición hacia 'paid'
    IF p_payment_status = 'paid' AND v_prev_payment_status IS DISTINCT FROM 'paid' THEN
        SELECT jsonb_agg(jsonb_build_object(
                   'product_id', oi.product_id,
                   'variant_id', oi.variant_id,
                   'quantity',   oi.quantity
               ))
        INTO v_items
        FROM public.order_items AS oi
        WHERE oi.order_id = p_order_id;

        IF v_items IS NOT NULL THEN
            PERFORM public.decrement_stock_for_order(v_items);
            v_stock_decremented := TRUE;
        END IF;

        INSERT INTO public.conversation_conversion_events
            (session_id, event_type, metadata)
        VALUES (
            v_session_id,
            'payment_completed',
            jsonb_build_object(
                'source',   COALESCE(v_conversion_source, 'manual'),
                'order_id', p_order_id,
                'status',   p_payment_status,
                'total',    v_total
            )
        )
        ON CONFLICT ((metadata->>'order_id'), event_type) DO NOTHING
        RETURNING id INTO v_conversion_event_id;

        v_conversion_inserted := v_conversion_event_id IS NOT NULL;
    END IF;

    RETURN jsonb_build_object(
        'action',              'fulfilled',
        'order_id',            p_order_id,
        'stock_decremented',   v_stock_decremented,
        'conversion_inserted', v_conversion_inserted,
        'cesarin_session_id',  v_session_id,
        'conversion_source',   v_conversion_source,
        'total',               v_total
    );
END;
$$;
