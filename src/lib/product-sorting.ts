/**
 * Product sorting utilities — shared between SectionPage and CategoryPage.
 *
 * @module lib/product-sorting
 */
import type { Product } from '@/types/product';

export type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'name_az' | 'newest';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'relevance',  label: 'Relevancia' },
    { value: 'price_asc',  label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
    { value: 'name_az',    label: 'Nombre A–Z' },
    { value: 'newest',     label: 'Más recientes' },
];

export function sortProducts(products: Product[], sort: SortKey): Product[] {
    const arr = [...products];
    switch (sort) {
        case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
        case 'price_desc': return arr.sort((a, b) => b.price - a.price);
        case 'name_az':    return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        case 'newest':     return arr.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
        default:           return arr;
    }
}
