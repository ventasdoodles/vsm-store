import { describe, it, expect } from 'vitest';
import {
    canTransitionTo,
    isTerminalStatus,
    canCustomerCancel,
    ORDER_STATUS_TRANSITIONS,
    STOREFRONT_ORDER_STATUS,
    ADMIN_ORDER_STATUS,
    ADMIN_ORDER_STATUSES_LIST,
} from '../orders';

describe('canTransitionTo', () => {
    it('allows pendiente → confirmado', () => {
        expect(canTransitionTo('pendiente', 'confirmado')).toBe(true);
    });

    it('allows pendiente → cancelado', () => {
        expect(canTransitionTo('pendiente', 'cancelado')).toBe(true);
    });

    it('disallows pendiente → entregado (skip)', () => {
        expect(canTransitionTo('pendiente', 'entregado')).toBe(false);
    });

    it('allows confirmado → preparando', () => {
        expect(canTransitionTo('confirmado', 'preparando')).toBe(true);
    });

    it('allows preparando → enviado', () => {
        expect(canTransitionTo('preparando', 'enviado')).toBe(true);
    });

    it('allows enviado → entregado', () => {
        expect(canTransitionTo('enviado', 'entregado')).toBe(true);
    });

    it('disallows entregado → anything', () => {
        expect(canTransitionTo('entregado', 'pendiente')).toBe(false);
        expect(canTransitionTo('entregado', 'cancelado')).toBe(false);
    });

    it('disallows cancelado → anything', () => {
        expect(canTransitionTo('cancelado', 'pendiente')).toBe(false);
        expect(canTransitionTo('cancelado', 'entregado')).toBe(false);
    });
});

describe('isTerminalStatus', () => {
    it('entregado is terminal', () => {
        expect(isTerminalStatus('entregado')).toBe(true);
    });

    it('cancelado is terminal', () => {
        expect(isTerminalStatus('cancelado')).toBe(true);
    });

    it('pendiente is NOT terminal', () => {
        expect(isTerminalStatus('pendiente')).toBe(false);
    });

    it('confirmado is NOT terminal', () => {
        expect(isTerminalStatus('confirmado')).toBe(false);
    });
});

describe('canCustomerCancel', () => {
    it('customer can cancel pendiente orders', () => {
        expect(canCustomerCancel('pendiente')).toBe(true);
    });

    it('customer can cancel confirmado orders', () => {
        expect(canCustomerCancel('confirmado')).toBe(true);
    });

    it('customer cannot cancel preparando orders', () => {
        expect(canCustomerCancel('preparando')).toBe(false);
    });

    it('customer cannot cancel enviado orders', () => {
        expect(canCustomerCancel('enviado')).toBe(false);
    });

    it('customer cannot cancel already cancelled orders', () => {
        expect(canCustomerCancel('cancelado')).toBe(false);
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
