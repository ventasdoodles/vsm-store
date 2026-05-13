/**
 * Admin order audit event contract.
 *
 * Phase 1 defines the append-only substrate only. It does not change order
 * cancellation behavior, execute refunds, or call provider APIs.
 */

export const ORDER_ADMIN_EVENT_TYPES = [
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
    'customer_cancellation_request_approved',
] as const;

export type OrderAdminEventType = typeof ORDER_ADMIN_EVENT_TYPES[number];

export const ORDER_ADMIN_EVENT_SOURCES = [
    'admin_ui',
    'admin_rpc',
    'system',
    'provider_webhook',
    'manual_backoffice',
] as const;

export type OrderAdminEventSource = typeof ORDER_ADMIN_EVENT_SOURCES[number];

export const ORDER_ADMIN_EVENT_VISIBILITIES = [
    'internal',
    'customer_safe',
] as const;

export type OrderAdminEventVisibility = typeof ORDER_ADMIN_EVENT_VISIBILITIES[number];

export interface OrderAdminEventRecord {
    id: string;
    order_id: string;
    actor_user_id: string | null;
    actor_role: string | null;
    actor_label: string | null;
    event_type: OrderAdminEventType;
    source: OrderAdminEventSource;
    visibility: OrderAdminEventVisibility;
    status_before: string | null;
    status_after: string | null;
    payment_status_before: string | null;
    payment_status_after: string | null;
    payment_method: string | null;
    reason_category: string | null;
    reason: string | null;
    internal_note: string | null;
    customer_note: string | null;
    provider_name: string | null;
    provider_action: string | null;
    provider_execution_status: string | null;
    provider_payment_id: string | null;
    provider_refund_id: string | null;
    provider_event_id: string | null;
    refund_amount: number | null;
    refund_currency: string | null;
    idempotency_key: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

export type CreateOrderAdminEventInput = Omit<OrderAdminEventRecord, 'id' | 'created_at'>;
