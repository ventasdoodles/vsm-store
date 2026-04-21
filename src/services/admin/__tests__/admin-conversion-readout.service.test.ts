import { describe, expect, it } from 'vitest';
import {
    buildConversionFunnelReadout,
    type ConversionEventRow,
    type ConversionOrderRow,
} from '../admin-conversion-readout.service';

const baseEvents: ConversionEventRow[] = [
    {
        id: 'evt-1',
        session_id: 'session-cesarin',
        event_type: 'ai_cta_rendered',
        timestamp: '2026-04-20T10:00:00.000Z',
        metadata: {
            source: 'cesarin',
            cta_kind: 'ADD_TO_CART',
            label: 'Agregar Waka',
            product_id: 'prod-1',
        },
    },
    {
        id: 'evt-2',
        session_id: 'session-cesarin',
        event_type: 'ai_cta_clicked',
        timestamp: '2026-04-20T10:01:00.000Z',
        metadata: {
            source: 'cesarin',
            cta_kind: 'ADD_TO_CART',
            label: 'Agregar Waka',
            product_id: 'prod-1',
        },
    },
    {
        id: 'evt-3',
        session_id: 'session-cesarin',
        event_type: 'cart_mutation_result',
        timestamp: '2026-04-20T10:02:00.000Z',
        metadata: {
            source: 'cesarin',
            product_id: 'prod-1',
            result: 'added',
            quantity_added: 1,
        },
    },
    {
        id: 'evt-4',
        session_id: 'session-cesarin',
        event_type: 'checkout_started',
        timestamp: '2026-04-20T10:03:00.000Z',
        metadata: {
            source: 'cesarin',
            cart_value: 250,
            item_count: 1,
        },
    },
    {
        id: 'evt-5',
        session_id: 'session-cesarin',
        event_type: 'order_created',
        timestamp: '2026-04-20T10:04:00.000Z',
        metadata: {
            source: 'cesarin',
            order_id: 'order-1',
        },
    },
    {
        id: 'evt-6',
        session_id: 'session-cesarin',
        event_type: 'payment_completed',
        timestamp: '2026-04-20T10:05:00.000Z',
        metadata: {
            source: 'cesarin',
            order_id: 'order-1',
            total: 250,
        },
    },
    {
        id: 'evt-7',
        session_id: null,
        event_type: 'checkout_started',
        timestamp: '2026-04-20T11:00:00.000Z',
        metadata: {
            source: 'manual',
            cart_value: 120,
        },
    },
];

const baseOrders: ConversionOrderRow[] = [
    {
        id: 'order-1',
        cesarin_session_id: 'session-cesarin',
        conversion_source: 'cesarin',
        total: 250,
        status: 'confirmed',
        payment_status: 'paid',
        created_at: '2026-04-20T10:04:00.000Z',
    },
    {
        id: 'order-2',
        cesarin_session_id: null,
        conversion_source: 'manual',
        total: 120,
        status: 'pending',
        payment_status: 'pending',
        created_at: '2026-04-20T11:02:00.000Z',
    },
];

describe('admin conversion readout service', () => {
    it('aggregates Cesarín and manual funnel paths without mixing attribution', () => {
        const readout = buildConversionFunnelReadout({
            events: baseEvents,
            orders: baseOrders,
            products: [{ id: 'prod-1', name: 'Waka SoMatch' }],
            generatedAt: '2026-04-20T12:00:00.000Z',
        });

        expect(readout.totalEvents).toBe(7);
        expect(readout.sourceCounts).toEqual({ cesarin: 1, manual: 2, unknown: 0 });
        expect(readout.eventTypeCounts.ai_cta_rendered).toBe(1);
        expect(readout.eventTypeCounts.payment_completed).toBe(1);
        expect(readout.ctaKindCounts.ADD_TO_CART).toBe(2);
        expect(readout.cartMutationResultCounts.added).toBe(1);
        expect(readout.dropOffCounts.payment_completed).toBe(1);
        expect(readout.dropOffCounts.checkout_no_order).toBe(1);
        expect(readout.dropOffCounts.order_pending_payment).toBe(1);
        expect(readout.funnelStages.find(stage => stage.key === 'payment_completed')?.count).toBe(1);
        expect(readout.productSummaries[0]).toMatchObject({
            productId: 'prod-1',
            productName: 'Waka SoMatch',
            renderedCount: 1,
            clickedCount: 1,
            cartMutationCount: 1,
        });
    });

    it('returns an honest empty readout when there are no events or orders', () => {
        const readout = buildConversionFunnelReadout({
            events: [],
            orders: [],
            generatedAt: '2026-04-20T12:00:00.000Z',
        });

        expect(readout.totalEvents).toBe(0);
        expect(readout.totalSessions).toBe(0);
        expect(readout.sourceCounts).toEqual({ cesarin: 0, manual: 0, unknown: 0 });
        expect(readout.sessions).toEqual([]);
        expect(readout.productSummaries).toEqual([]);
        expect(readout.funnelStages.every(stage => stage.count === 0 && stage.rateFromSessions === 0)).toBe(true);
    });

    it('does not mutate input event or order rows while reconstructing sessions', () => {
        const events = structuredClone(baseEvents);
        const orders = structuredClone(baseOrders);
        const eventsBefore = JSON.stringify(events);
        const ordersBefore = JSON.stringify(orders);

        buildConversionFunnelReadout({
            events,
            orders,
            products: [{ id: 'prod-1', name: 'Waka SoMatch' }],
            generatedAt: '2026-04-20T12:00:00.000Z',
        });

        expect(JSON.stringify(events)).toBe(eventsBefore);
        expect(JSON.stringify(orders)).toBe(ordersBefore);
    });
});
