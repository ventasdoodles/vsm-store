-- Transactional unpaid admin cancellation RPC with structured audit event.
-- Defines the database substrate only; frontend behavior is intentionally unchanged.

DROP FUNCTION IF EXISTS public.cancel_admin_unpaid_order_with_audit(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.cancel_admin_unpaid_order_with_audit(
    p_order_id UUID,
    p_reason TEXT
)
RETURNS TABLE(id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_actor_user_id UUID;
    v_actor_role TEXT;
    v_actor_label TEXT;
    v_reason TEXT;
    v_stamp TIMESTAMPTZ;
    v_stamp_label TEXT;
    v_internal_note TEXT;
    v_new_tracking_notes TEXT;
    v_order RECORD;
    v_updated_order_id UUID;
BEGIN
    v_actor_user_id := auth.uid();
    IF v_actor_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    SELECT au.role
    INTO v_actor_role
    FROM public.admin_users au
    WHERE au.id = v_actor_user_id;

    IF v_actor_role IS NULL THEN
        RAISE EXCEPTION 'Admin privileges required.'
            USING ERRCODE = '42501';
    END IF;

    v_reason := btrim(COALESCE(p_reason, ''));
    IF char_length(v_reason) < 5 THEN
        RAISE EXCEPTION 'Cancellation reason must have at least 5 characters.'
            USING ERRCODE = '22023';
    END IF;

    SELECT
        o.id,
        o.status,
        o.payment_status,
        o.payment_method,
        o.tracking_notes
    INTO v_order
    FROM public.orders o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found.', p_order_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_order.status NOT IN ('pending', 'confirmed', 'processing') THEN
        RAISE EXCEPTION 'Order is no longer eligible for unpaid cancellation.'
            USING ERRCODE = 'P0001';
    END IF;

    IF v_order.payment_status = 'paid' THEN
        RAISE EXCEPTION 'Paid orders cannot be cancelled by this RPC.'
            USING ERRCODE = 'P0001';
    END IF;

    v_stamp := now();
    v_stamp_label := to_char(
        v_stamp AT TIME ZONE 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    );
    v_internal_note := '[Cancelado ' || v_stamp_label || ']: ' || v_reason;

    v_new_tracking_notes := CASE
        WHEN NULLIF(btrim(COALESCE(v_order.tracking_notes, '')), '') IS NULL
            THEN v_internal_note
        ELSE v_order.tracking_notes || E'\n\n' || v_internal_note
    END;

    UPDATE public.orders
    SET
        status = 'cancelled',
        tracking_notes = v_new_tracking_notes,
        updated_at = v_stamp
    WHERE orders.id = p_order_id
    RETURNING orders.id INTO v_updated_order_id;

    v_actor_label := NULLIF(auth.jwt() ->> 'email', '');

    INSERT INTO public.order_admin_events (
        order_id,
        actor_user_id,
        actor_role,
        actor_label,
        event_type,
        source,
        visibility,
        status_before,
        status_after,
        payment_status_before,
        payment_status_after,
        payment_method,
        reason,
        internal_note,
        customer_note,
        provider_name,
        provider_action,
        provider_execution_status,
        provider_payment_id,
        provider_refund_id,
        provider_event_id,
        refund_amount,
        refund_currency,
        idempotency_key,
        metadata,
        created_at
    )
    VALUES (
        p_order_id,
        v_actor_user_id,
        v_actor_role,
        v_actor_label,
        'admin_unpaid_order_cancelled',
        'admin_rpc',
        'internal',
        v_order.status,
        'cancelled',
        v_order.payment_status,
        v_order.payment_status,
        v_order.payment_method,
        v_reason,
        v_internal_note,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'admin_unpaid_order_cancelled:' || p_order_id::TEXT,
        jsonb_build_object(
            'rpc_version', 'cancel_admin_unpaid_order_with_audit:v1',
            'tracking_notes_source', 'latest_db_value',
            'had_tracking_notes_before', NULLIF(btrim(COALESCE(v_order.tracking_notes, '')), '') IS NOT NULL
        ),
        v_stamp
    );

    RETURN QUERY SELECT v_updated_order_id;
END;
$$;

COMMENT ON FUNCTION public.cancel_admin_unpaid_order_with_audit(UUID, TEXT) IS
    'Atomically cancels an eligible unpaid order, preserves tracking_notes behavior, and appends one internal order_admin_events audit row. Does not execute refunds or provider calls.';

REVOKE ALL ON FUNCTION public.cancel_admin_unpaid_order_with_audit(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_admin_unpaid_order_with_audit(UUID, TEXT) TO authenticated;
