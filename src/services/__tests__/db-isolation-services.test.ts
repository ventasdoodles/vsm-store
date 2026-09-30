// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';

const fromMock = vi.hoisted(() => vi.fn());
const channelMock = vi.hoisted(() => vi.fn());
const removeChannelMock = vi.hoisted(() => vi.fn());
const functionsInvokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: fromMock,
        channel: channelMock,
        removeChannel: removeChannelMock,
        functions: {
            invoke: functionsInvokeMock,
        },
    },
}));

import { getAppliedReferral } from '@/services/loyalty.service';
import { subscribeToRealtimeOrders } from '@/services/orders.service';
import { checkBackendHealth } from '@/services/settings.service';
import { invokeVisualCompatibilityScanner } from '@/services/visual-scanner.service';

describe('Database isolation services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAppliedReferral', () => {
        it('queries referrals table for referred_id and returns the match', async () => {
            const maybeSingleMock = vi.fn().mockResolvedValue({
                data: { referrer_id: 'ref-1', status: 'completed' },
                error: null,
            });
            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await getAppliedReferral('customer-123');

            expect(fromMock).toHaveBeenCalledWith('referrals');
            expect(selectMock).toHaveBeenCalledWith('referrer_id, status');
            expect(eqMock).toHaveBeenCalledWith('referred_id', 'customer-123');
            expect(result).toEqual({ referrer_id: 'ref-1', status: 'completed' });
        });

        it('throws error if supabase query fails', async () => {
            const maybeSingleMock = vi.fn().mockResolvedValue({
                data: null,
                error: new Error('DB Error'),
            });
            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            await expect(getAppliedReferral('customer-123')).rejects.toThrow('DB Error');
        });
    });

    describe('checkBackendHealth', () => {
        it('performs a lightweight count query on categories', async () => {
            const limitMock = vi.fn().mockResolvedValue({ error: null });
            const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await checkBackendHealth();

            expect(fromMock).toHaveBeenCalledWith('categories');
            expect(selectMock).toHaveBeenCalledWith('id', { count: 'exact', head: true });
            expect(limitMock).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('throws if categories heartbeat returns an error', async () => {
            const limitMock = vi.fn().mockResolvedValue({ error: new Error('Connection refused') });
            const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
            fromMock.mockReturnValue({ select: selectMock });

            await expect(checkBackendHealth()).rejects.toThrow('Connection refused');
        });
    });

    describe('subscribeToRealtimeOrders', () => {
        it('registers a realtime channel and returns an unsubscribe function', () => {
            const channelInstance: any = {};
            channelInstance.on = vi.fn().mockReturnValue(channelInstance);
            channelInstance.subscribe = vi.fn().mockReturnValue(channelInstance);
            channelMock.mockReturnValue(channelInstance);

            const onNewOrder = vi.fn();
            const unsubscribe = subscribeToRealtimeOrders(onNewOrder);

            expect(channelMock).toHaveBeenCalledWith('public:orders_pulse');
            expect(channelInstance.on).toHaveBeenCalledWith(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                expect.any(Function)
            );
            expect(channelInstance.subscribe).toHaveBeenCalled();

            unsubscribe();
            expect(removeChannelMock).toHaveBeenCalledWith(channelInstance);
        });
    });

    describe('invokeVisualCompatibilityScanner', () => {
        it('invokes visual-compatibility edge function with base64 and mimeType', async () => {
            const mockResponse = {
                success: true,
                analysis: {
                    identified: true,
                    brand: 'Caliburn',
                    model: 'G3',
                    confidence: 'high' as const,
                    recommended_search_tags: ['caliburn', 'pod'],
                    reasoning: 'Matches G3 body',
                    is_vape_related: true,
                },
            };

            functionsInvokeMock.mockResolvedValue({
                data: mockResponse,
                error: null,
            });

            const result = await invokeVisualCompatibilityScanner('data:image/png;base64,abc', 'image/png');

            expect(functionsInvokeMock).toHaveBeenCalledWith('visual-compatibility', {
                body: {
                    imageBase64: 'data:image/png;base64,abc',
                    mimeType: 'image/png',
                },
            });
            expect(result).toEqual(mockResponse);
        });

        it('throws on edge function invocation error', async () => {
            functionsInvokeMock.mockResolvedValue({
                data: null,
                error: { message: 'Function timeout' },
            });

            await expect(
                invokeVisualCompatibilityScanner('data:image/png;base64,abc', 'image/png')
            ).rejects.toThrow('Function timeout');
        });
    });
});
