/**
 * inventory.service - VSM Store
 * 
 * Servicio para la lógica y gestión de inventory vía Edge Functions.
 * @module services/inventory.service
 */

import { supabase } from '@/lib/supabase';

export interface OraclePrediction {
    daysUntilOut: number;
    depletionDate: string;
    customerMessage: string;
    adminRecommendation: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Obtiene una predicción de stock para un producto específico vía Edge Function
 */
export async function getStockPrediction(productId: string, currentStock: number): Promise<OraclePrediction | null> {
    try {
        const { data, error } = await supabase.functions.invoke('inventory-oracle', {
            body: { productId, currentStock },
        });

        if (error) {
            if (import.meta.env.DEV) {
                console.error('[inventoryService] Oracle Error:', error);
            }
            return null;
        }

        return data as OraclePrediction;
    } catch (error: unknown) {
        if (import.meta.env.DEV) {
            console.error('[inventoryService] Oracle Error:', error);
        }
        return null;
    }
}

/**
 * Servicio para consultar el Oráculo de Inventario (IA)
 */
export const inventoryService = {
    getStockPrediction,
};
