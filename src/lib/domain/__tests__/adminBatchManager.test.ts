import { describe, expect, it } from 'vitest';
import type { ProductFormData } from '@/services/admin';
import {
    applyBatchProductFieldChange,
    buildBatchProductRows,
    buildBatchProductUpdatePayload,
    countModifiedBatchRows,
    resetBatchProductRows,
} from '../adminBatchManager';

describe('adminBatchManager', () => {
    const products: Array<Partial<ProductFormData> & { id: string }> = [
        { id: 'a', name: 'Alpha', sku: 'A-1', price: 10, stock: 5, is_active: true },
        { id: 'b', name: 'Beta', sku: 'B-1', price: 20, stock: 0, is_active: false },
    ];

    it('builds clean batch rows and resets from the source list', () => {
        const rows = buildBatchProductRows(products);
        const reset = resetBatchProductRows(products);

        expect(rows).toEqual([
            { ...products[0], isModified: false },
            { ...products[1], isModified: false },
        ]);
        expect(reset).toEqual(rows);
        expect(rows[0]!).not.toBe(products[0]);
    });

    it('applies row changes immutably and tracks modified counts', () => {
        const base = buildBatchProductRows(products);
        const updated = applyBatchProductFieldChange(base, 'a', 'price', '12');
        const toggled = applyBatchProductFieldChange(updated, 'b', 'is_active', true);

        expect(base[0]!.isModified).toBe(false);
        expect(updated[0]!).toMatchObject({ price: '12', isModified: true });
        expect(toggled[1]!).toMatchObject({ is_active: true, isModified: true });
        expect(countModifiedBatchRows(toggled)).toBe(2);
    });

    it('builds the bulk update payload for modified rows only', () => {
        const rows = applyBatchProductFieldChange(
            applyBatchProductFieldChange(buildBatchProductRows(products), 'a', 'price', '14'),
            'a',
            'stock',
            '7',
        );
        const payload = buildBatchProductUpdatePayload(rows);

        expect(payload).toEqual([
            {
                id: 'a',
                updates: {
                    price: 14,
                    stock: 7,
                    is_active: true,
                },
            },
        ]);
    });
});
