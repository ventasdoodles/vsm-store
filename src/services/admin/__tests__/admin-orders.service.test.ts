import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: mocks.from,
    },
}));

import { updateOrderTracking } from '../admin-orders.service';

describe('updateOrderTracking canonicalization validation', () => {
    beforeEach(() => {
        mocks.from.mockReset();
    });

    it('patches tracking_number and updated_at, and explicitly excludes tracking_notes', async () => {
        const updateSpy = vi.fn();
        const eqSpy = vi.fn();
        const selectSpy = vi.fn();
        const singleSpy = vi.fn();

        // Build the chain: from().update().eq().select().single()
        mocks.from.mockReturnValue({
            update: updateSpy.mockReturnValue({
                eq: eqSpy.mockReturnValue({
                    select: selectSpy.mockReturnValue({
                        single: singleSpy.mockResolvedValue({ data: { id: 'order-1' }, error: null })
                    })
                })
            })
        });

        const orderId = 'order-1';
        const trackingNumber = 'TRACK-123';

        await updateOrderTracking(orderId, trackingNumber);

        // 1. Verify table target
        expect(mocks.from).toHaveBeenCalledWith('orders');

        // 2. Verify patch content
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            tracking_number: trackingNumber,
            updated_at: expect.any(String)
        }));

        // 3. Verify strictness (no tracking_notes or other fields)
        expect(updateSpy).toHaveBeenCalled();
        const firstCall = updateSpy.mock.calls[0];
        expect(firstCall).toBeDefined();
        const patch = firstCall![0];
        const patchKeys = Object.keys(patch);
        expect(patchKeys).toContain('tracking_number');
        expect(patchKeys).toContain('updated_at');
        expect(patchKeys.length).toBe(2);
        expect(patchKeys).not.toContain('tracking_notes');
        expect(patchKeys).not.toContain('status');
        expect(patchKeys).not.toContain('payment_status');

        // 4. Verify filters and selectors
        expect(eqSpy).toHaveBeenCalledWith('id', orderId);
        expect(selectSpy).toHaveBeenCalledWith('id');
    });

    it('throws error when supabase returns an error', async () => {
        const error = { message: 'Database error', code: '500' };
        
        mocks.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({ data: null, error })
                    })
                })
            })
        });

        await expect(updateOrderTracking('id', 'guide')).rejects.toEqual(error);
    });
});
