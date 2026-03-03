import { describe, it, expect } from 'vitest';
import {
    canTransitionTo,
    isTerminalStatus,
    ORDER_STATUS_TRANSITIONS,
    STOREFRONT_ORDER_STATUS,
    ADMIN_ORDER_STATUS,
    ADMIN_ORDER_STATUSES_LIST,
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
