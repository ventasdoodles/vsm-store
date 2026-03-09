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
    discount_price: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'scheduled' | 'expired';
    sold_count: number;
    limit_count: number;
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
                id, product_id, discount_price, start_date, end_date, status, sold_count, limit_count,
                product:products (
                    id, name, slug, description, short_description, price, compare_at_price, 
                    stock, sku, section, category_id, tags, status, images, cover_image, 
                    is_featured, is_featured_until, is_new, is_new_until, is_bestseller, 
                    is_bestseller_until, is_active, created_at, updated_at
                )
            `)
            .eq('status', 'active')
            .lte('start_date', now)
            .gte('end_date', now)
            .order('end_date', { ascending: true });

        if (error) {
            console.error('Error fetching flash deals:', error);
            return [];
        }

        return data as unknown as FlashDeal[];
    }
};
