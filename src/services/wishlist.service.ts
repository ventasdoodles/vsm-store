/**
 * // ─── SERVICIO: wishlist.service ───
 * // Arquitectura: Service Layer (Database → Services → Hooks → Components)
 * // Propósito: CRUD de productos favoritos sincronizados con la base de datos.
 * // Regla / Notas: Aislamiento absoluto de Supabase (§1.1). Named exports.
 */

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

export interface WishlistRow {
    product_id: string;
    customer_id: string;
    products?: Product;
}

/**
 * Obtiene los productos favoritos de un cliente desde la DB.
 */
export async function getWishlist(customerId: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('customer_wishlists')
        .select('product_id, products (*)')
        .eq('customer_id', customerId);

    if (error) {
        console.error('[Wishlist] Error fetching wishlist:', error);
        return [];
    }

    return (data ?? [])
        .map((row: unknown) => (row as WishlistRow).products as Product | null)
        .filter((p): p is Product => p !== null);
}

/**
 * Agrega un producto a la lista de deseos en la DB.
 */
export async function addToWishlist(customerId: string, productId: string): Promise<void> {
    const { error } = await supabase
        .from('customer_wishlists')
        .upsert(
            { customer_id: customerId, product_id: productId },
            { onConflict: 'customer_id,product_id' }
        );

    if (error) {
        console.error('[Wishlist] Error adding item:', error);
        throw error;
    }
}

/**
 * Agrega múltiples productos a la lista de deseos en la DB en un único lote atómico.
 */
export async function addItemsToWishlist(customerId: string, productIds: string[]): Promise<void> {
    if (!productIds || productIds.length === 0) return;
    const rows = productIds.map((productId) => ({
        customer_id: customerId,
        product_id: productId,
    }));

    const { error } = await supabase
        .from('customer_wishlists')
        .upsert(rows, { onConflict: 'customer_id,product_id' });

    if (error) {
        console.error('[Wishlist] Error batch adding items:', error);
        throw error;
    }
}

/**
 * Elimina un producto de la lista de deseos en la DB.
 */
export async function removeFromWishlist(customerId: string, productId: string): Promise<void> {
    const { error } = await supabase
        .from('customer_wishlists')
        .delete()
        .eq('customer_id', customerId)
        .eq('product_id', productId);

    if (error) {
        console.error('[Wishlist] Error removing item:', error);
        throw error;
    }
}

/**
 * Limpia toda la lista de deseos del usuario en la DB.
 */
export async function clearWishlist(customerId: string): Promise<void> {
    const { error } = await supabase
        .from('customer_wishlists')
        .delete()
        .eq('customer_id', customerId);

    if (error) {
        console.error('[Wishlist] Error clearing wishlist:', error);
        throw error;
    }
}
