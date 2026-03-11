/**
 * bundle.service - VSM Store
 * 
 * Servicio para la lógica y gestión de bundle.
 * @module services/bundle.service
 */

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

export interface SmartBundleOffer {
    bundleName: string;
    suggestedProduct: Partial<Product>;
    couponCode: string;
    discountPercentage: number;
}

/**
 * Solicita una oferta de bundle dinámico a la IA
 */
export async function getSmartBundleOffer(product: Product, cartTotal: number): Promise<SmartBundleOffer | null> {
    try {
        const { data, error } = await supabase.functions.invoke('bundle-intelligence', {
            body: { product, cartTotal }
        });

        if (error) {
            // Log as warning since this is non-critical AI feature
            console.warn('[bundle.service] AI Suggestion unavailable:', error.message || error);
            return null;
        }

        if (!data || data.error) {
            return getFallbackBundle(product);
        }

        return data as SmartBundleOffer;
    } catch (err) {
        // Catch any network or unexpected parsing errors to prevent global crash
        console.error('[bundle.service] Unexpected exception, using fallback:', err);
        return getFallbackBundle(product);
    }
}

/**
 * Fallback local ultra-rápido en caso de que la IA no esté disponible.
 * Preserva la experiencia de usuario (Smart Upselling) offline o sin cloud functions.
 */
async function getFallbackBundle(product: Product): Promise<SmartBundleOffer | null> {
    try {
        // Obtenemos un producto de la misma categoría que sea más barato (ideal para cross-sell)
        const { data: related } = await supabase
            .from('products')
            .select('id, name, slug, price, images, cover_image, stock, category_id, is_active')
            .eq('is_active', true)
            .eq('category_id', product.category_id)
            .neq('id', product.id)
            .lt('price', product.price || 1000)
            .gt('stock', 0)
            .limit(1)
            .single();

        if (!related) return null;

        return {
            bundleName: 'Combo Sugerido',
            suggestedProduct: related as Partial<Product>,
            couponCode: 'BUNDLE-PROMO',
            discountPercentage: 15
        };
    } catch (e) {
        console.warn('Fallback bundle failed:', e);
        return null; // Silent degrade si falla incluso la BD
    }
}
