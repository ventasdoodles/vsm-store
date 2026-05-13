-- Admin order audit trail substrate.
-- Append-only event log for order lifecycle actions performed or reviewed by admins.

CREATE TABLE IF NOT EXISTS public.order_admin_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL REFERENCES public.orders(id),

    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT,
    actor_label TEXT,

    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'admin_unpaid_order_cancelled',
            'paid_cancellation_review_opened',
            'paid_cancellation_review_rejected',
            'paid_cancellation_approved',
            'manual_refund_recorded',
            'payment_status_changed_manual',
            'provider_refund_requested',
            'provider_refund_succeeded',
            'provider_refund_failed',
            'provider_refund_not_applicable',
            'order_status_changed_manual',
            'customer_cancellation_request_received',
            'customer_cancellation_request_rejected',
            'customer_cancellation_request_approved'
        )
    ),
    source TEXT NOT NULL DEFAULT 'admin_ui' CHECK (
        source IN (
            'admin_ui',
            'admin_rpc',
            'system',
            'provider_webhook',
            'manual_backoffice'
        )
    ),
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (
        visibility IN ('internal', 'customer_safe')
    ),

    status_before TEXT,
    status_after TEXT,
    payment_status_before TEXT,
    payment_status_after TEXT,
    payment_method TEXT,

    reason_category TEXT,
    reason TEXT,
    internal_note TEXT,
    customer_note TEXT,

    provider_name TEXT,
    provider_action TEXT,
    provider_execution_status TEXT,
    provider_payment_id TEXT,
    provider_refund_id TEXT,
    provider_event_id TEXT,

    refund_amount NUMERIC(10,2) CHECK (refund_amount IS NULL OR refund_amount >= 0),
    refund_currency TEXT,

    idempotency_key TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_admin_events IS
    'Append-only admin audit trail for order lifecycle events. Does not execute refunds or provider actions.';

COMMENT ON COLUMN public.order_admin_events.visibility IS
    'internal rows are admin-only; customer_safe can support future customer-safe messaging without exposing internal notes.';

COMMENT ON COLUMN public.order_admin_events.idempotency_key IS
    'Optional dedupe key for transactional admin actions or future provider/webhook reconciliation.';

CREATE INDEX IF NOT EXISTS order_admin_events_order_created_idx
    ON public.order_admin_events (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS order_admin_events_type_created_idx
    ON public.order_admin_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS order_admin_events_actor_created_idx
    ON public.order_admin_events (actor_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS order_admin_events_created_idx
    ON public.order_admin_events (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS order_admin_events_idempotency_key_uidx
    ON public.order_admin_events (idempotency_key)
    WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.order_admin_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_admin_events_select_admin" ON public.order_admin_events;
CREATE POLICY "order_admin_events_select_admin"
    ON public.order_admin_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "order_admin_events_insert_admin" ON public.order_admin_events;
CREATE POLICY "order_admin_events_insert_admin"
    ON public.order_admin_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
        AND actor_user_id = auth.uid()
    );

-- No UPDATE or DELETE policies: corrections must be represented by new events.
