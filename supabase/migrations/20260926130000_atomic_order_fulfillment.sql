-- ============================================================================
-- Migración: fulfillment atómico de pagos Mercado Pago
--
-- Objetivos:
--   1. Deduplicar `conversation_conversion_events` y agregar un índice único
--      funcional por ((metadata->>'order_id'), event_type) para eliminar
--      duplicados bajo concurrencia (Bug 3).
--   2. Crear `fulfill_order_payment(...)`: fulfillment atómico e idempotente
--      en una sola transacción PL/pgSQL. Serializa webhooks concurrentes con
--      SELECT ... FOR UPDATE sobre la fila de `orders` (Bug 1), hace
--      imposible la falla parcial irrecuperable (Bug 2) y aplica guardas de
--      no-regresión de estado (Bug 4).
--
-- Requiere: `decrement_stock_for_order(p_items JSONB)` (migración previa, NO
-- se modifica; se reutiliza tal cual).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Deduplicación + índice único para conversation_conversion_events
--
-- Los webhooks duplicados de MP (2-5 por transición) ya insertaron filas
-- repetidas en producción. Antes de crear el índice único se deduplica
-- conservando el evento más antiguo (primera conversión registrada).
-- Solo se deduplican filas con order_id en metadata: el índice único trata
-- los NULL como distintos, por lo que eventos de otros flujos (sin order_id
-- en metadata) no se ven afectados.
-- ----------------------------------------------------------------------------

DELETE FROM public.conversation_conversion_events AS a
USING public.conversation_conversion_events AS b
WHERE a.id <> b.id
  AND a.event_type = b.event_type
  AND a.metadata->>'order_id' IS NOT NULL
  AND a.metadata->>'order_id' = b.metadata->>'order_id'
  AND (a.timestamp, a.id) > (b.timestamp, b.id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_conversion_events_order_id_event_type
    ON public.conversation_conversion_events ((metadata->>'order_id'), event_type);

-- ----------------------------------------------------------------------------
-- 2) fulfill_order_payment: fulfillment atómico e idempotente
--
-- Ejecuta en UNA sola transacción:
--   a. SELECT ... FOR UPDATE sobre `orders` → serializa webhooks concurrentes
--      del mismo pedido: el 2° bloquea hasta que el 1° commitea y entonces
--      lee el estado ya commiteado (READ COMMITTED re-evalúa la fila).
--   b. Guardas de idempotencia y no-regresión.
--   c. UPDATE del pago en la orden.
--   d. Solo en la transición hacia 'paid': decremento de stock (reutiliza
--      `decrement_stock_for_order`, que bloquea cada fila de inventario con
--      FOR UPDATE) e INSERT del evento de conversión con ON CONFLICT DO
--      NOTHING contra el índice único recién creado.
--
-- Si cualquier paso falla (p.ej. stock insuficiente), la transacción completa
-- se revierte: la orden NO queda en 'paid' sin stock decrementado, por lo que
-- el reintento de MP SÍ puede completar el fulfillment (corrige Bug 2).
-- ----------------------------------------------------------------------------

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
BEGIN
    -- (a) Serialización: lock exclusivo de la fila de la orden. Los webhooks
    -- concurrentes para el mismo pedido se encolan aquí.
    SELECT o.payment_status, o.cesarin_session_id, o.conversion_source, o.total
    INTO v_prev_payment_status, v_session_id, v_conversion_source, v_total
    FROM public.orders AS o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('action', 'reject', 'reason', 'order_not_found');
    END IF;

    -- (b1) Idempotencia: duplicado 'paid' (MP reenvía 2-5 veces) → skip.
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

    -- (b2) Guarda de no-regresión: desde un estado terminal/fulfilled
    -- ('paid'/'refunded') no se permite ningún cambio de estado. Cubre el
    -- caso del enunciado ('pending' tardío sobre 'paid', Bug 4) y además
    -- 'paid' → 'failed' y 'refunded' → 'paid' (evita re-fulfillment y un
    -- segundo decremento de stock tras un reembolso).
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

    -- (c) Update del pago (mismos campos que OrderPaymentUpdate).
    UPDATE public.orders
    SET payment_status  = p_payment_status,
        status          = p_order_status,
        mp_payment_id   = p_payment_id,
        mp_payment_data = p_mp_payment_data,
        updated_at      = now()
    WHERE id = p_order_id;

    -- (d) Fulfillment solo en la transición hacia 'paid'.
    -- IS DISTINCT FROM trata payment_status NULL como "no pagado"
    -- (misma semántica que el chequeo previo `!== 'paid'` en el webhook).
    IF p_payment_status = 'paid' AND v_prev_payment_status IS DISTINCT FROM 'paid' THEN
        SELECT jsonb_agg(jsonb_build_object(
                   'product_id', oi.product_id,
                   'variant_id', oi.variant_id,
                   'quantity',   oi.quantity
               ))
        INTO v_items
        FROM public.order_items AS oi
        WHERE oi.order_id = p_order_id;

        -- Sin items no hay stock que decrementar (misma semántica que el
        -- chequeo `orderItems.length > 0` previo en el webhook).
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

-- ----------------------------------------------------------------------------
-- 3) Permisos: solo service_role (la Edge Function usa la service key).
--    Se revoca EXECUTE a PUBLIC porque la función es SECURITY DEFINER:
--    permitir su ejecución anónima permitiría marcar órdenes arbitrarias
--    como pagadas y decrementar inventario.
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.fulfill_order_payment(UUID, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fulfill_order_payment(UUID, TEXT, TEXT, TEXT, JSONB) TO service_role;
