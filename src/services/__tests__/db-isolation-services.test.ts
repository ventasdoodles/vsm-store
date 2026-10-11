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
        removeChannelMock.mockResolvedValue('ok');
    });

    describe('Architectural Hook Isolation Guard', () => {
        it('ensures zero hooks in src/hooks/** directly import @/lib/supabase or runtime @supabase/supabase-js', () => {
            const hooksRoot = path.resolve(process.cwd(), 'src/hooks');

            function getHookFiles(dir: string): string[] {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                const files: string[] = [];
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (entry.name !== '__tests__') {
                            files.push(...getHookFiles(fullPath));
                        }
                    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
                        files.push(fullPath);
                    }
                }
                return files;
            }

            const hookFiles = getHookFiles(hooksRoot);
            expect(hookFiles.length).toBeGreaterThan(5);

            for (const filePath of hookFiles) {
                const content = fs.readFileSync(filePath, 'utf8');
                // Prohibit static or dynamic imports from supabase lib
                expect(content).not.toMatch(/from\s+['"].*\/lib\/supabase['"]/);
                expect(content).not.toMatch(/import\s*\(\s*['"].*\/lib\/supabase['"]\s*\)/);
                expect(content).not.toMatch(/require\s*\(\s*['"].*\/lib\/supabase['"]\s*\)/);
                // Prohibit runtime imports from @supabase/supabase-js (only import type allowed)
                const runtimeSupabaseJsImport = /import\s+(?!type\b)[^'"]*from\s+['"]@supabase\/supabase-js['"]/;
                expect(content).not.toMatch(runtimeSupabaseJsImport);
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

        it('generates unique channel topics across two concurrent subscriptions', () => {
            const channelInstance: any = {
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn().mockReturnThis(),
            };
            channelMock.mockReturnValue(channelInstance);

            const unsub1 = subscribeToRealtimeOrders(vi.fn());
            const unsub2 = subscribeToRealtimeOrders(vi.fn());

            const topic1 = channelMock.mock.calls[0]?.[0];
            const topic2 = channelMock.mock.calls[1]?.[0];

            expect(topic1).toMatch(/^orders_pulse_/);
            expect(topic2).toMatch(/^orders_pulse_/);
            expect(topic1).not.toBe(topic2);

            unsub1();
            unsub2();
        });

        it('handles postgres_changes event, ignores events after disposed is true', async () => {
            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
            const channelInstance: any = {
                on: vi.fn().mockImplementation((_event, _filter, callback) => {
                    changeHandler = callback;
                    return channelInstance;
                }),
                subscribe: vi.fn().mockReturnThis(),
            };
            channelMock.mockReturnValue(channelInstance);
            removeChannelMock.mockResolvedValue('ok');

            const singleMock = vi.fn().mockResolvedValue({
                data: {
                    id: 'ord-123',
                    items: [{ name: 'Vape Kit', image: 'img.png' }],
                    customer_profiles: { full_name: 'Juan Perez' },
                    shipping_address: { city: 'Guadalajara' },
                },
                error: null,
            });
            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const onNewOrder = vi.fn();
            const unsubscribe = subscribeToRealtimeOrders(onNewOrder);

            // Trigger event while active
            await changeHandler({ new: { id: 'ord-123' } });
            expect(onNewOrder).toHaveBeenCalledWith({
                id: 'ord-123',
                customer_name: 'Juan Perez',
                city: 'Guadalajara',
                product_name: 'Vape Kit',
                product_image: 'img.png',
            });

            // Now unsubscribe
            unsubscribe();
            onNewOrder.mockClear();

            // Trigger event after disposed
            await changeHandler({ new: { id: 'ord-123' } });
            expect(onNewOrder).not.toHaveBeenCalled();
        });

        it('catches async rejections from onNewOrder and routes to onError without unhandled rejection', async () => {
            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
            const channelInstance: any = {
                on: vi.fn().mockImplementation((_event, _filter, callback) => {
                    changeHandler = callback;
                    return channelInstance;
                }),
                subscribe: vi.fn().mockReturnThis(),
            };
            channelMock.mockReturnValue(channelInstance);

            const singleMock = vi.fn().mockResolvedValue({
                data: {
                    id: 'ord-123',
                    items: [{ name: 'Vape Kit', image: 'img.png' }],
                    customer_profiles: { full_name: 'Juan' },
                    shipping_address: { city: 'CDMX' },
                },
                error: null,
            });
            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const asyncError = new Error('Async consumer failed');
            const onNewOrder = vi.fn().mockRejectedValue(asyncError);
            const onError = vi.fn();

            subscribeToRealtimeOrders(onNewOrder, onError);

            await changeHandler({ new: { id: 'ord-123' } });

            expect(onError).toHaveBeenCalledWith(asyncError);
        });

        it('catches errors inside onError without throwing unhandled exceptions', async () => {
            let changeHandler: (payload: any) => Promise<void> = () => Promise.resolve();
            const channelInstance: any = {
                on: vi.fn().mockImplementation((_event, _filter, callback) => {
                    changeHandler = callback;
                    return channelInstance;
                }),
                subscribe: vi.fn().mockReturnThis(),
            };
            channelMock.mockReturnValue(channelInstance);

            const singleMock = vi.fn().mockResolvedValue({
                data: null,
                error: new Error('DB fetch error'),
            });
            const eqMock = vi.fn().mockReturnValue({ single: singleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const throwingOnError = vi.fn().mockImplementation(() => {
                throw new Error('Crash in onError');
            });

            subscribeToRealtimeOrders(vi.fn(), throwingOnError);

            await expect(changeHandler({ new: { id: 'ord-123' } })).resolves.not.toThrow();
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
