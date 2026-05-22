import { describe, it, expect } from 'vitest';
import {
    canTransitionTo,
    isTerminalStatus,
    ORDER_STATUS_TRANSITIONS,
    STOREFRONT_ORDER_STATUS,
    ADMIN_ORDER_STATUS,
    ADMIN_ORDER_STATUSES_LIST,
    normalizePaymentStatus,
    getStorefrontOrderPaymentView,
    getStorefrontPaymentContinuationView,
    getStorefrontOrderVisibilityView,
    getStorefrontOrderLifecycleView,
    getStorefrontPaymentReentryView,
    getStorefrontPostPurchaseConfidenceView,
    getStorefrontOrdersIndexActionView,
    getStorefrontOpenOrderRecoveryView,
    getStorefrontOrderFreshnessView,
    isStorefrontPaymentContinuationAvailable,
    buildStorefrontOrderReorderPlan,
    getStorefrontOrderReorderFeedback,
} from '../orders';
import type { CartItem } from '@/types/cart';
import type { OrderItem } from '@/types/order';
import type { Product } from '@/types/product';

describe('canTransitionTo', () => {
    it('allows pendiente -> confirmado', () => {
        expect(canTransitionTo('pending', 'confirmed')).toBe(true);
    });

    it('allows pendiente -> cancelado', () => {
        expect(canTransitionTo('pending', 'cancelled')).toBe(true);
    });

    it('disallows pendiente → entregado (skip)', () => {
        expect(canTransitionTo('pending', 'delivered')).toBe(false);
    });

    it('allows confirmado → preparando', () => {
        expect(canTransitionTo('confirmed', 'processing')).toBe(true);
    });

    it('allows preparando → enviado', () => {
        expect(canTransitionTo('processing', 'shipped')).toBe(true);
    });

    it('allows enviado → entregado', () => {
        expect(canTransitionTo('shipped', 'delivered')).toBe(true);
    });

    it('disallows entregado → anything', () => {
        expect(canTransitionTo('delivered', 'pending')).toBe(false);
        expect(canTransitionTo('delivered', 'cancelled')).toBe(false);
    });

    it('disallows cancelado → anything', () => {
        expect(canTransitionTo('cancelled', 'pending')).toBe(false);
        expect(canTransitionTo('cancelled', 'delivered')).toBe(false);
    });
});

describe('isTerminalStatus', () => {
    it('entregado is terminal', () => {
        expect(isTerminalStatus('delivered')).toBe(true);
    });

    it('cancelado is terminal', () => {
        expect(isTerminalStatus('cancelled')).toBe(true);
    });

    it('pendiente is NOT terminal', () => {
        expect(isTerminalStatus('pending')).toBe(false);
    });

    it('confirmado is NOT terminal', () => {
        expect(isTerminalStatus('confirmed')).toBe(false);
    });
});

describe('status constants consistency', () => {
    it('ADMIN_ORDER_STATUSES_LIST has all 6 statuses', () => {
        expect(ADMIN_ORDER_STATUSES_LIST).toHaveLength(6);
    });

    it('all admin statuses have labels and colors', () => {
        for (const status of ADMIN_ORDER_STATUSES_LIST) {
            expect(status.label).toBeTruthy();
            expect(status.color).toMatch(/^#[0-9a-f]{6}$/);
        }
    });

    it('STOREFRONT_ORDER_STATUS has all 6 statuses', () => {
        expect(Object.keys(STOREFRONT_ORDER_STATUS)).toHaveLength(6);
    });

    it('ADMIN_ORDER_STATUS has all 6 statuses', () => {
        expect(Object.keys(ADMIN_ORDER_STATUS)).toHaveLength(6);
    });

    it('transition map covers all admin statuses', () => {
        const adminStatuses = Object.keys(ADMIN_ORDER_STATUS);
        const transitionStatuses = Object.keys(ORDER_STATUS_TRANSITIONS);
        expect(transitionStatuses.sort()).toEqual(adminStatuses.sort());
    });
});

describe('normalizePaymentStatus', () => {
    it('keeps known payment statuses', () => {
        expect(normalizePaymentStatus('paid')).toBe('paid');
        expect(normalizePaymentStatus('failed')).toBe('failed');
        expect(normalizePaymentStatus('refunded')).toBe('refunded');
    });

    it('maps provider rejected or cancelled payment states to failed storefront truth', () => {
        expect(normalizePaymentStatus('rejected')).toBe('failed');
        expect(normalizePaymentStatus('cancelled')).toBe('failed');
    });

    it('falls back to pending for unknown or missing statuses', () => {
        expect(normalizePaymentStatus('approved')).toBe('pending');
        expect(normalizePaymentStatus(undefined)).toBe('pending');
    });
});

describe('getStorefrontOrderPaymentView', () => {
    it('shows a confirmed-payment message only for paid orders', () => {
        const view = getStorefrontOrderPaymentView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.paymentLabel).toBe('Liquidado');
        expect(view.paymentTone).toBe('success');
        expect(view.headline).toContain('Pago confirmado');
    });

    it('keeps mercadopago pending orders out of fake success', () => {
        const view = getStorefrontOrderPaymentView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.paymentTone).toBe('warning');
        expect(view.headline).toContain('pendiente de confirmacion');
        expect(view.detail).toContain('Mercado Pago');
    });

    it('treats failed mercadopago orders as not confirmed', () => {
        const view = getStorefrontOrderPaymentView({
            status: 'cancelled',
            payment_status: 'failed',
            payment_method: 'mercadopago',
        });

        expect(view.paymentLabel).toBe('No aprobado');
        expect(view.paymentTone).toBe('danger');
        expect(view.headline).toContain('Pago no confirmado');
    });

    it('treats rejected or cancelled payment statuses as not confirmed even when order status is still pending', () => {
        for (const paymentStatus of ['rejected', 'cancelled']) {
            const view = getStorefrontOrderPaymentView({
                status: 'pending',
                payment_status: paymentStatus,
                payment_method: 'mercadopago',
            });

            expect(view.paymentLabel).toBe('No aprobado');
            expect(view.paymentTone).toBe('danger');
            expect(view.headline).toBe('Pago no confirmado');
        }
    });

    it('keeps transfer orders in validation instead of fake payment success', () => {
        const view = getStorefrontOrderPaymentView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'transfer',
        });

        expect(view.paymentLabel).toBe('Pendiente por validar');
        expect(view.headline).toContain('pago pendiente de validacion');
    });
});

describe('getStorefrontPaymentContinuationView', () => {
    it('marks pending mercadopago orders as continuable', () => {
        const view = getStorefrontPaymentContinuationView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.canContinue).toBe(true);
        expect(view.detail).toContain('sigue pagable');
    });

    it('blocks continuation for cancelled mercadopago orders', () => {
        const view = getStorefrontPaymentContinuationView({
            status: 'cancelled',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.canContinue).toBe(false);
        expect(view.detail).toContain('ya no figura como pagable');
    });

    it('blocks continuation for already paid mercadopago orders', () => {
        const view = getStorefrontPaymentContinuationView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.canContinue).toBe(false);
        expect(view.detail).toContain('ya figura confirmado');
    });

    it('keeps non-mercadopago orders out of continuation', () => {
        const view = getStorefrontPaymentContinuationView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'transfer',
        });

        expect(view.canContinue).toBe(false);
        expect(view.detail).toContain('no usa una continuidad activa en Mercado Pago');
    });
});

describe('getStorefrontOrderVisibilityView', () => {
    it('marks payable mercadopago orders as payment to resume', () => {
        const view = getStorefrontOrderVisibilityView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.headline).toBe('Pedido registrado, pago por retomar');
        expect(view.detail).toContain('sigue pagable');
    });

    it('marks paid orders as liquidated without reopening payment', () => {
        const view = getStorefrontOrderVisibilityView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.headline).toBe('Pedido liquidado y en curso');
        expect(view.detail).toContain('pago ya esta confirmado');
    });

    it('marks cancelled orders as non-actionable continuity', () => {
        const view = getStorefrontOrderVisibilityView({
            status: 'cancelled',
            payment_status: 'failed',
            payment_method: 'mercadopago',
        });

        expect(view.headline).toBe('Pedido cancelado o sin continuidad activa');
        expect(view.detail).toContain('ya no figura como pagable');
    });
});

describe('getStorefrontOrderLifecycleView', () => {
    it('keeps continuable pending orders aligned around one storefront lifecycle state', () => {
        const view = getStorefrontOrderLifecycleView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.statusEyebrow).toBe('Pedido existente, pago por retomar');
        expect(view.orderCtaLabel).toBe('Ver pedido y revisar pago');
        expect(view.refreshLabel).toBe('Revisar estado de pago');
        expect(view.canRefresh).toBe(true);
        expect(view.shouldAutoRefresh).toBe(true);
    });

    it('keeps paid orders out of stale pending or danger actions', () => {
        const view = getStorefrontOrderLifecycleView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.statusEyebrow).toBe('Pedido existente y pago confirmado');
        expect(view.orderCtaLabel).toBe('Ver pedido y seguimiento');
        expect(view.canRefresh).toBe(false);
        expect(view.shouldAutoRefresh).toBe(false);
    });

    it('keeps danger review copy only for non-payable persisted orders', () => {
        const view = getStorefrontOrderLifecycleView({
            status: 'cancelled',
            payment_status: 'failed',
            payment_method: 'mercadopago',
        });

        expect(view.statusEyebrow).toBe('Pedido existente, pago no confirmado');
        expect(view.orderCtaLabel).toBe('Ver pedido y revisar pago');
        expect(view.refreshLabel).toBe('Revisar si el pago cambio');
    });
});

describe('payment re-entry truth', () => {
    it('uses exact persisted pending status for continuation instead of normalized fallback', () => {
        expect(isStorefrontPaymentContinuationAvailable({
            status: 'pending',
            payment_status: undefined,
            payment_method: 'mercadopago',
        })).toBe(false);
    });

    it('marks persisted pending mercadopago orders as available for payment re-entry', () => {
        const view = getStorefrontPaymentReentryView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.state).toBe('available');
        expect(view.canReenter).toBe(true);
        expect(view.actionHeadline).toBe('Retomar pago pendiente');
    });

    it('marks paid orders as resolved and non-reenterable', () => {
        const view = getStorefrontPaymentReentryView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.state).toBe('resolved');
        expect(view.canReenter).toBe(false);
        expect(view.blockedAttemptDetail).toContain('ya figura confirmado');
    });
});

describe('getStorefrontOrdersIndexActionView', () => {
    it('keeps payable mercadopago orders focused on payment continuation instead of reorder noise', () => {
        const view = getStorefrontOrdersIndexActionView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.actionHeadline).toBe('Retomar pago pendiente');
        expect(view.showContinuePayment).toBe(true);
        expect(view.showReorder).toBe(false);
        expect(view.detailLabel).toBe('Ver pedido y revisar pago');
    });

    it('surfaces reorder only once the order is already paid and stable', () => {
        const view = getStorefrontOrdersIndexActionView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.actionHeadline).toBe('Seguir pedido liquidado');
        expect(view.showContinuePayment).toBe(false);
        expect(view.showReorder).toBe(true);
        expect(view.detailLabel).toBe('Ver pedido y seguimiento');
    });

    it('keeps pending transfer orders focused on review instead of reorder', () => {
        const view = getStorefrontOrdersIndexActionView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'transfer',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.actionHeadline).toBe('Esperar validacion');
        expect(view.showContinuePayment).toBe(false);
        expect(view.showReorder).toBe(false);
    });

    it('does not show continue payment or confirmed-order actions for rejected mercadopago payment truth', () => {
        const view = getStorefrontOrdersIndexActionView({
            status: 'pending',
            payment_status: 'rejected',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.actionHeadline).toBe('Revisar antes de actuar');
        expect(view.showContinuePayment).toBe(false);
        expect(view.showReorder).toBe(true);
        expect(view.detailLabel).toBe('Ver pedido y revisar pago');
    });
});

describe('getStorefrontPostPurchaseConfidenceView', () => {
    it('describes paid orders as confirmed receipt state', () => {
        const view = getStorefrontPostPurchaseConfidenceView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 2 }],
        });

        expect(view.receiptTitle).toBe('Pedido y pago confirmados');
        expect(view.receiptDetail).toContain('pago aparece confirmado');
        expect(view.revisitDetail).toContain('detalle del pedido o a tu historial');
        expect(view.itemsLabel).toBe('1 articulo registrado');
    });

    it('keeps payable mercadopago orders framed as persisted purchase pending completion', () => {
        const view = getStorefrontPostPurchaseConfidenceView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
            items: [
                { product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 },
                { product_id: 'prod-2', name: 'Producto 2', price: 120, quantity: 1 },
            ],
        });

        expect(view.receiptTitle).toBe('Pedido registrado, cobro todavia por completar');
        expect(view.receiptDetail).toContain('pedido persistido');
        expect(view.revisitTitle).toBe('Tu referencia persistida ya esta disponible');
        expect(view.itemsLabel).toBe('2 articulo(s) registrados');
    });

    it('keeps failed or non-continuable orders honest without fake recovery claims', () => {
        const view = getStorefrontPostPurchaseConfidenceView({
            status: 'cancelled',
            payment_status: 'failed',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.receiptTitle).toBe('Pedido registrado, pago no confirmado');
        expect(view.receiptDetail).toContain('pago no aparece como completado');
        expect(view.revisitDetail).toContain('confirmar el estado real');
    });
});

describe('getStorefrontOpenOrderRecoveryView', () => {
    it('flags genuinely payable mercadopago orders for recovery instead of new checkout', () => {
        const view = getStorefrontOpenOrderRecoveryView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.shouldRecover).toBe(true);
        expect(view.headline).toBe('Ya existe una orden en progreso');
        expect(view.primaryCtaLabel).toBe('Continuar pago en Mercado Pago');
        expect(view.secondaryCtaLabel).toBe('Ver pedido y revisar pago');
    });

    it('keeps non-payable persisted orders out of fake recovery guidance', () => {
        const view = getStorefrontOpenOrderRecoveryView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
            items: [{ product_id: 'prod-1', name: 'Producto', price: 100, quantity: 1 }],
        });

        expect(view.shouldRecover).toBe(false);
    });
});

describe('buildStorefrontOrderReorderPlan', () => {
    const baseProduct: Product = {
        id: 'prod-1',
        name: 'Producto vigente',
        slug: 'producto-vigente',
        description: null,
        short_description: null,
        price: 320,
        compare_at_price: null,
        stock: 4,
        sku: null,
        section: 'vape',
        category_id: 'cat-1',
        tags: [],
        status: 'active',
        images: [],
        cover_image: null,
        is_featured: false,
        is_featured_until: null,
        is_new: false,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: true,
        created_at: '2026-03-25T00:00:00.000Z',
        updated_at: '2026-03-25T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
    };

    it('adds current catalog products when the persisted line still maps cleanly', () => {
        const orderItems: OrderItem[] = [
            { product_id: 'prod-1', name: 'Producto vigente', price: 250, quantity: 2 },
        ];

        const plan = buildStorefrontOrderReorderPlan(orderItems, [baseProduct], []);

        expect(plan.addedLineCount).toBe(1);
        expect(plan.blockedLineCount).toBe(0);
        expect(plan.partialLineCount).toBe(0);
        expect(plan.addableItems[0]?.quantityToAdd).toBe(2);
    });

    it('keeps partial reorder honest when current cart and stock reduce what can be re-added', () => {
        const orderItems: OrderItem[] = [
            { product_id: 'prod-1', name: 'Producto vigente', price: 250, quantity: 3 },
            { product_id: 'prod-missing', name: 'Desaparecido', price: 90, quantity: 1 },
        ];
        const cartItems: CartItem[] = [
            { product: baseProduct, quantity: 2, variant_id: null, variant_name: null },
        ];

        const plan = buildStorefrontOrderReorderPlan(orderItems, [baseProduct], cartItems);
        const feedback = getStorefrontOrderReorderFeedback(plan);

        expect(plan.addedLineCount).toBe(1);
        expect(plan.partialLineCount).toBe(1);
        expect(plan.blockedLineCount).toBe(1);
        expect(plan.addableItems[0]?.quantityToAdd).toBe(2);
        expect(plan.addableItems[0]?.skippedQuantity).toBe(1);
        expect(feedback.type).toBe('warning');
    });

    it('blocks items that no longer map safely to the current catalog variant truth', () => {
        const orderItems: OrderItem[] = [
            {
                product_id: 'prod-1',
                variant_id: 'variant-1',
                variant_name: 'Rojo / XL',
                name: 'Producto vigente',
                price: 250,
                quantity: 1,
            },
        ];

        const plan = buildStorefrontOrderReorderPlan(orderItems, [baseProduct], []);
        const feedback = getStorefrontOrderReorderFeedback(plan);

        expect(plan.addedLineCount).toBe(0);
        expect(plan.blockedLineCount).toBe(1);
        expect(plan.blockedItems[0]?.reason).toBe('variant_mapping_changed');
        expect(feedback.type).toBe('error');
    });
});

describe('getStorefrontOrderFreshnessView', () => {
    it('marks paid orders as not freshness-sensitive', () => {
        const view = getStorefrontOrderFreshnessView({
            status: 'processing',
            payment_status: 'paid',
            payment_method: 'mercadopago',
        });

        expect(view.isFreshnessSensitive).toBe(false);
        expect(view.shouldAutoReconcile).toBe(false);
        expect(view.freshnessNote).toContain('confirmado');
    });

    it('marks pending mercadopago orders with active continuation as freshness-sensitive', () => {
        const view = getStorefrontOrderFreshnessView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'mercadopago',
        });

        expect(view.isFreshnessSensitive).toBe(true);
        expect(view.shouldAutoReconcile).toBe(true);
        expect(view.freshnessNote).toContain('Mercado Pago');
        expect(view.reconciliationHint).toContain('revisa');
    });

    it('marks cancelled orders as not freshness-sensitive', () => {
        const view = getStorefrontOrderFreshnessView({
            status: 'cancelled',
            payment_status: 'failed',
            payment_method: 'mercadopago',
        });

        expect(view.isFreshnessSensitive).toBe(false);
        expect(view.shouldAutoReconcile).toBe(false);
    });

    it('marks danger-tone orders as freshness-sensitive but without auto-reconcile', () => {
        const view = getStorefrontOrderFreshnessView({
            status: 'pending',
            payment_status: 'failed',
            payment_method: 'mercadopago',
        });

        expect(view.isFreshnessSensitive).toBe(true);
        expect(view.shouldAutoReconcile).toBe(false);
        expect(view.freshnessNote).toContain('no aparece como confirmado');
    });

    it('marks transfer pending orders as not freshness-sensitive', () => {
        const view = getStorefrontOrderFreshnessView({
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'transfer',
        });

        expect(view.isFreshnessSensitive).toBe(false);
        expect(view.shouldAutoReconcile).toBe(false);
    });
});
