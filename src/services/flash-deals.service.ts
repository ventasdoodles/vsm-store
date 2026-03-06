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
                *,
                product:products (*)
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
