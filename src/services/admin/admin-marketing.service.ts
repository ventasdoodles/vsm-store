/**
 * // ─── SERVICIO: admin-marketing.service ───
 * // Proposito: Centralizar la inteligencia de marketing y IA.
 * // Superpoderes: Sugerencias de ofertas flash, proyecciones de impacto, etc.
 */
import { supabase } from '@/lib/supabase';

export interface FlashDealSuggestion {
    flash_price: number;
    max_qty: number;
    reasoning: string;
}

/**
 * Sugiere el precio y cantidad optima para una oferta flash
 * Basado en el precio actual y stock (Placeholder para Edge Function)
 */
export async function suggestFlashDealMagic(
    productId: string,
    currentPrice: number,
    stock: number
): Promise<FlashDealSuggestion> {
    try {
        const { data, error } = await supabase.functions.invoke('marketing-intelligence', {
            body: { 
                action: 'suggest_flash_deal',
                product_id: productId,
                price: currentPrice,
                stock: stock
            }
        });

        if (error) throw error;
        return data as FlashDealSuggestion;
    } catch (err) {
        if (import.meta.env.DEV) {
            console.error('AI Suggestion Fallback:', err);
        }
        // Fallback robusto si la Edge Function no responde o falta
        return {
            flash_price: Math.round(currentPrice * 0.75 * 100) / 100, // 25% off
            max_qty: Math.min(Math.round(stock * 0.3), 50) || 10,
            reasoning: "Sugerencia basada en stock actual y descuentos estándar de alta conversion."
        };
    }
}
