// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeMock = vi.hoisted(() => vi.fn());
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        functions: {
            invoke: invokeMock,
        },
        from: fromMock,
    },
}));

import {
    getTrackingInfo,
    insertConversationConversionEvent,
} from '../tracking.service';

describe('tracking.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getTrackingInfo', () => {
        it('invokes track-shipment edge function with trimmed tracking number', async () => {
            const mockTrackingData = {
                trackingNumber: 'VSM-TRK-1001',
                carrier: 'DHL Express',
                status: 'in_transit' as const,
                statusText: 'En Camino',
                estimatedDelivery: '2026-10-25T12:00:00Z',
                events: [],
            };

            invokeMock.mockResolvedValue({
                data: mockTrackingData,
                error: null,
            });

            const result = await getTrackingInfo('  VSM-TRK-1001  ');

            expect(invokeMock).toHaveBeenCalledWith('track-shipment', {
                body: { trackingNumber: 'VSM-TRK-1001' },
            });
            expect(result).toEqual(mockTrackingData);
        });

        it('returns demo data when edge function reports NOT_CONFIGURED code', async () => {
            invokeMock.mockResolvedValue({
                data: { error: 'Carrier not set', code: 'NOT_CONFIGURED' },
                error: null,
            });

            const result = await getTrackingInfo('DEMO-TRK-123');

            expect(result.trackingNumber).toBe('DEMO-TRK-123');
            expect(result.carrier).toBe('DHL Express');
            expect(result.statusText).toBe('En Tránsito (Demo)');
            expect(result.events.length).toBeGreaterThan(0);
        });

        it('throws descriptive error on edge function error', async () => {
            invokeMock.mockResolvedValue({
                data: null,
                error: new Error('Network failure'),
            });

            await expect(getTrackingInfo('TRK-ERR')).rejects.toThrow(
                'No se pudo conectar con el servicio de rastreo. Intenta de nuevo.'
            );
        });

        it('throws specific error message returned in payload', async () => {
            invokeMock.mockResolvedValue({
                data: { error: 'Guia no encontrada en DHL' },
                error: null,
            });

            await expect(getTrackingInfo('TRK-404')).rejects.toThrow('Guia no encontrada en DHL');
        });
    });

    describe('insertConversationConversionEvent', () => {
        it('inserts conversion event into conversation_conversion_events table', async () => {
            const insertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ insert: insertMock });

            await insertConversationConversionEvent({
                sessionId: 'ses-conv-1',
                eventType: 'order_created',
                metadata: { order_id: 'ord-123', total: 500 },
            });

            expect(fromMock).toHaveBeenCalledWith('conversation_conversion_events');
            expect(insertMock).toHaveBeenCalledWith({
                session_id: 'ses-conv-1',
                event_type: 'order_created',
                metadata: { order_id: 'ord-123', total: 500 },
            });
        });

        it('defaults metadata to empty object and session_id to null when omitted', async () => {
            const insertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ insert: insertMock });

            await insertConversationConversionEvent({
                eventType: 'cart_opened',
            });

            expect(insertMock).toHaveBeenCalledWith({
                session_id: null,
                event_type: 'cart_opened',
                metadata: {},
            });
        });

        it('swallows errors silently so telemetry never breaks application flow', async () => {
            const insertMock = vi.fn().mockRejectedValue(new Error('DB offline'));
            fromMock.mockReturnValue({ insert: insertMock });

            await expect(
                insertConversationConversionEvent({
                    eventType: 'checkout_started',
                })
            ).resolves.not.toThrow();
        });
    });
});
