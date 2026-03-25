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
} from '../orders';

describe('canTransitionTo', () => {
    it('allows pendiente → confirmado', () => {
        expect(canTransitionTo('pending', 'confirmed')).toBe(true);
    });

    it('allows pendiente → cancelado', () => {
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
