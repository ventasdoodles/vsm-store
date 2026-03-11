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
            return null;
        }

        return data as SmartBundleOffer;
    } catch (err) {
        // Catch any network or unexpected parsing errors to prevent global crash
        console.error('[bundle.service] Unexpected exception:', err);
        return null;
    }
}
