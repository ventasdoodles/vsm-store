/**
 * FlashDeals Service — Gestión de ofertas relámpago.
 * 
 * @module flash-deals-service
 */
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

export interface FlashDeal {
    id: string;
    product_id: string;
    flash_price: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    sold_count: number;
    max_qty: number;
    product?: Product;
}

export const flashDealsService = {
    /**
     * Obtiene las ofertas relámpago activas con su información de producto.
     */
    async getActiveDeals(): Promise<FlashDeal[]> {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from('flash_deals')
            .select(`
                id, product_id, flash_price, starts_at, ends_at, is_active, sold_count, max_qty,
                product:products (
                    id, name, slug, description, short_description, price, compare_at_price, 
                    stock, sku, section, category_id, tags, status, images, cover_image, 
                    is_featured, is_featured_until, is_new, is_new_until, is_bestseller, 
                    is_bestseller_until, is_active, created_at, updated_at
                )
            `)
            .eq('is_active', true)
            .lte('starts_at', now)
            .gte('ends_at', now)
            .order('ends_at', { ascending: true });

        if (error) {
            console.error('Error fetching flash deals:', error);
            return [];
        }

        return data as unknown as FlashDeal[];
    }
};
