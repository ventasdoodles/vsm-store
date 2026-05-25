import type { ProductFormData } from '@/services/admin';

export interface ProductBatchRow extends Partial<ProductFormData> {
    id: string;
    isModified?: boolean;
}

export function buildBatchProductRows(products: Array<Partial<ProductFormData> & { id: string }>): ProductBatchRow[] {
    return products.map((product) => ({ ...product, isModified: false }));
}

export function applyBatchProductFieldChange(
    rows: ProductBatchRow[],
    id: string,
    field: keyof ProductBatchRow,
    value: string | number | boolean,
): ProductBatchRow[] {
    return rows.map((row) => {
        if (row.id !== id) return row;

        return {
            ...row,
            [field]: value,
            isModified: true,
        };
    });
}

export function countModifiedBatchRows(rows: ProductBatchRow[]): number {
    return rows.filter((row) => row.isModified).length;
}

export function buildBatchProductUpdatePayload(rows: ProductBatchRow[]): { id: string; updates: Partial<ProductFormData> }[] {
    return rows
        .filter((row) => row.isModified)
        .map((row) => ({
            id: row.id,
            updates: {
                price: Number(row.price),
                stock: Number(row.stock),
                is_active: row.is_active,
            },
        }));
}

export function resetBatchProductRows(products: Array<Partial<ProductFormData> & { id: string }>): ProductBatchRow[] {
    return buildBatchProductRows(products);
}
