// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

const fromMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: fromMock,
    },
}));

import {
    getWishlist,
    addToWishlist,
    addItemsToWishlist,
    removeFromWishlist,
    clearWishlist,
} from '../wishlist.service';

describe('wishlist.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getWishlist', () => {
        it('queries customer_wishlists for customer_id and returns unwrapped products', async () => {
            const mockProducts = [
                { id: 'p-1', name: 'Product 1' },
                { id: 'p-2', name: 'Product 2' },
            ];
            const mockRows = [
                { product_id: 'p-1', customer_id: 'cust-1', products: mockProducts[0] },
                { product_id: 'p-2', customer_id: 'cust-1', products: mockProducts[1] },
                { product_id: 'p-3', customer_id: 'cust-1', products: null },
            ];

            const eqMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await getWishlist('cust-1');

            expect(fromMock).toHaveBeenCalledWith('customer_wishlists');
            expect(selectMock).toHaveBeenCalledWith('product_id, products (*)');
            expect(eqMock).toHaveBeenCalledWith('customer_id', 'cust-1');
            expect(result).toEqual(mockProducts);
        });

        it('returns empty array when query returns error', async () => {
            const eqMock = vi.fn().mockResolvedValue({
                data: null,
                error: new Error('DB connection failed'),
            });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const result = await getWishlist('cust-err');
            expect(result).toEqual([]);
        });
    });

    describe('addToWishlist', () => {
        it('upserts customer_id and product_id with onConflict resolution', async () => {
            const upsertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await addToWishlist('cust-1', 'p-1');

            expect(fromMock).toHaveBeenCalledWith('customer_wishlists');
            expect(upsertMock).toHaveBeenCalledWith(
                { customer_id: 'cust-1', product_id: 'p-1' },
                { onConflict: 'customer_id,product_id' }
            );
        });

        it('throws error when upsert fails', async () => {
            const dbError = new Error('Constraint violation');
            const upsertMock = vi.fn().mockResolvedValue({ error: dbError });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await expect(addToWishlist('cust-1', 'p-1')).rejects.toThrow('Constraint violation');
        });
    });

    describe('addItemsToWishlist (batch)', () => {
        it('does nothing when productIds array is empty', async () => {
            await addItemsToWishlist('cust-1', []);
            expect(fromMock).not.toHaveBeenCalled();
        });

        it('upserts multiple rows in a single DB round-trip', async () => {
            const upsertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await addItemsToWishlist('cust-1', ['p-1', 'p-2', 'p-3']);

            expect(fromMock).toHaveBeenCalledWith('customer_wishlists');
            expect(upsertMock).toHaveBeenCalledWith(
                [
                    { customer_id: 'cust-1', product_id: 'p-1' },
                    { customer_id: 'cust-1', product_id: 'p-2' },
                    { customer_id: 'cust-1', product_id: 'p-3' },
                ],
                { onConflict: 'customer_id,product_id' }
            );
        });

        it('throws error when batch upsert fails', async () => {
            const dbError = new Error('Batch insert error');
            const upsertMock = vi.fn().mockResolvedValue({ error: dbError });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await expect(addItemsToWishlist('cust-1', ['p-1'])).rejects.toThrow('Batch insert error');
        });
    });

    describe('removeFromWishlist', () => {
        it('deletes specific product for customer_id', async () => {
            const secondEqMock = vi.fn().mockResolvedValue({ error: null });
            const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock });
            const deleteMock = vi.fn().mockReturnValue({ eq: firstEqMock });
            fromMock.mockReturnValue({ delete: deleteMock });

            await removeFromWishlist('cust-1', 'p-1');

            expect(fromMock).toHaveBeenCalledWith('customer_wishlists');
            expect(deleteMock).toHaveBeenCalled();
            expect(firstEqMock).toHaveBeenCalledWith('customer_id', 'cust-1');
            expect(secondEqMock).toHaveBeenCalledWith('product_id', 'p-1');
        });

        it('throws error when delete fails', async () => {
            const secondEqMock = vi.fn().mockResolvedValue({ error: new Error('Delete failed') });
            const firstEqMock = vi.fn().mockReturnValue({ eq: secondEqMock });
            const deleteMock = vi.fn().mockReturnValue({ eq: firstEqMock });
            fromMock.mockReturnValue({ delete: deleteMock });

            await expect(removeFromWishlist('cust-1', 'p-1')).rejects.toThrow('Delete failed');
        });
    });

    describe('clearWishlist', () => {
        it('deletes all wishlist rows for customer_id', async () => {
            const eqMock = vi.fn().mockResolvedValue({ error: null });
            const deleteMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ delete: deleteMock });

            await clearWishlist('cust-1');

            expect(fromMock).toHaveBeenCalledWith('customer_wishlists');
            expect(deleteMock).toHaveBeenCalled();
            expect(eqMock).toHaveBeenCalledWith('customer_id', 'cust-1');
        });

        it('throws error when clear fails', async () => {
            const eqMock = vi.fn().mockResolvedValue({ error: new Error('Clear failed') });
            const deleteMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ delete: deleteMock });

            await expect(clearWishlist('cust-1')).rejects.toThrow('Clear failed');
        });
    });
});
