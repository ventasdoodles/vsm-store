// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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
        vi.resetAllMocks();
    });

    describe('Architectural Hook Isolation Guard', () => {
        it('ensures zero hooks in src/hooks directly import @/lib/supabase', () => {
            const hooksDir = path.resolve(process.cwd(), 'src/hooks');
            const hookFiles = fs.readdirSync(hooksDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

            for (const file of hookFiles) {
                const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
                expect(content).not.toMatch(/from ['"]@\/lib\/supabase['"]/);
                expect(content).not.toMatch(/from ['"]@supabase\/supabase-js['"]/);
            }
        });
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

        it('returns null when no referral exists', async () => {
            const maybeSingleMock = vi.fn().mockResolvedValue({
                data: null,
                error: null,
            });
            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await getAppliedReferral('customer-non-existent');
            expect(result).toBeNull();
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
        it('performs a lightweight ping query on categories with abortSignal', async () => {
            const abortSignalMock = vi.fn().mockResolvedValue({ error: null });
            const limitMock = vi.fn().mockReturnValue({ abortSignal: abortSignalMock });
            const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await checkBackendHealth();

            expect(fromMock).toHaveBeenCalledWith('categories');
            expect(selectMock).toHaveBeenCalledWith('id');
            expect(limitMock).toHaveBeenCalledWith(1);
            expect(result).toBe(true);
        });

        it('throws if categories heartbeat returns an error', async () => {
            const abortSignalMock = vi.fn().mockResolvedValue({ error: new Error('Connection refused') });
            const limitMock = vi.fn().mockReturnValue({ abortSignal: abortSignalMock });
            const selectMock = vi.fn().mockReturnValue({ limit: limitMock });
            fromMock.mockReturnValue({ select: selectMock });

            await expect(checkBackendHealth()).rejects.toThrow('Connection refused');
        });
    });

    describe('subscribeToRealtimeOrders', () => {
        it('registers a unique realtime channel and returns an unsubscribe function that sets disposed flag', () => {
            const channelInstance: any = {};
            channelInstance.on = vi.fn().mockReturnValue(channelInstance);
            channelInstance.subscribe = vi.fn().mockReturnValue(channelInstance);
            channelMock.mockReturnValue(channelInstance);
            removeChannelMock.mockResolvedValue('ok');

            const onNewOrder = vi.fn();
            const unsubscribe = subscribeToRealtimeOrders(onNewOrder);

            expect(channelMock).toHaveBeenCalledWith(expect.stringMatching(/^orders_pulse_/));
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

        it('throws with preserved cause on edge function invocation error', async () => {
            const invokeErr = { message: 'Function timeout', status: 504 };
            functionsInvokeMock.mockResolvedValue({
                data: null,
                error: invokeErr,
            });

            try {
                await invokeVisualCompatibilityScanner('data:image/png;base64,abc', 'image/png');
                expect.fail('Should have thrown');
            } catch (err: any) {
                expect(err.message).toBe('Function timeout');
                expect(err.cause).toBe(invokeErr);
            }
        });
    });
});
