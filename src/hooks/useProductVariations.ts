import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProductVariation {
    id: string;
    product_id: string;
    name: string;
    sku: string | null;
    price_override: number | null;
    stock: number;
    is_active: boolean;
}

export function useProductVariations(productId: string) {
    return useQuery({
        queryKey: ['product-variations', productId],
        queryFn: async () => {
            if (!productId) return [];

            const { data, error } = await supabase
                .from('product_variations')
                .select('*')
                .eq('product_id', productId)
                .eq('is_active', true)
                .order('name', { ascending: true });

            if (error) throw error;
            return data as ProductVariation[];
        },
        enabled: !!productId,
    });
}
