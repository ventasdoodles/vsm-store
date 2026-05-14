import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    from: vi.fn(),
    rpc: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: mocks.from,
        rpc: mocks.rpc,
    },
}));

import { cancelAdminOrder, updateOrderTracking } from '../admin-orders.service';

describe('updateOrderTracking canonicalization validation', () => {
    beforeEach(() => {
        mocks.from.mockReset();
        mocks.rpc.mockReset();
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

describe('cancelAdminOrder audited RPC switch', () => {
    beforeEach(() => {
        mocks.from.mockReset();
        mocks.rpc.mockReset();
    });

    it('calls the audited unpaid cancellation RPC with trimmed reason', async () => {
        mocks.rpc.mockResolvedValue({
            data: [{ id: 'order-1' }],
            error: null,
        });

        await expect(cancelAdminOrder('order-1', '  Valid cancellation reason  '))
            .resolves.toEqual({ id: 'order-1' });

        expect(mocks.rpc).toHaveBeenCalledWith('cancel_admin_unpaid_order_with_audit', {
            p_order_id: 'order-1',
            p_reason: 'Valid cancellation reason',
        });
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it('does not require or use current tracking notes', async () => {
        mocks.rpc.mockResolvedValue({
            data: [{ id: 'order-2' }],
            error: null,
        });

        await cancelAdminOrder('order-2', 'Reason without current notes');

        expect(mocks.rpc).toHaveBeenCalledWith('cancel_admin_unpaid_order_with_audit', {
            p_order_id: 'order-2',
            p_reason: 'Reason without current notes',
        });
        expect(JSON.stringify(mocks.rpc.mock.calls[0])).not.toContain('tracking_notes');
        expect(JSON.stringify(mocks.rpc.mock.calls[0])).not.toContain('currentNotes');
    });

    it('fails short reasons before calling RPC', async () => {
        await expect(cancelAdminOrder('order-1', 'no')).rejects.toThrow(
            'El motivo de cancelacion debe tener al menos 5 caracteres.'
        );

        expect(mocks.rpc).not.toHaveBeenCalled();
        expect(mocks.from).not.toHaveBeenCalled();
    });

    it('propagates RPC errors using the existing service error pattern', async () => {
        const error = {
            message: 'Order is no longer eligible for unpaid cancellation.',
            code: 'P0001',
        };
        mocks.rpc.mockResolvedValue({ data: null, error });

        await expect(cancelAdminOrder('order-1', 'Valid cancellation reason')).rejects.toEqual(error);
    });

    it('normalizes a single-row RPC response object', async () => {
        mocks.rpc.mockResolvedValue({
            data: { id: 'order-3' },
            error: null,
        });

        await expect(cancelAdminOrder('order-3', 'Valid cancellation reason'))
            .resolves.toEqual({ id: 'order-3' });
    });
});
