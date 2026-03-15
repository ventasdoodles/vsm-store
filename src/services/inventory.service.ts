/**
 * inventory.service - VSM Store
 * 
 * Servicio para la lógica y gestión de inventory.
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
 * Servicio para consultar el Oráculo de Inventario (IA)
 */
export const inventoryService = {
    /**
     * Obtiene una predicción de stock para un producto específico
     */
    async getStockPrediction(productId: string, currentStock: number): Promise<OraclePrediction | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inventory-oracle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ productId, currentStock })
            });

            if (!response.ok) {
                const errorBody = await response.json();
                console.error('DIAGNOSTIC - Inventory Oracle Error:', JSON.stringify(errorBody, null, 2));
                throw new Error(errorBody.error || 'Inventory Oracle Error');
            }

            const data = await response.json();
            return data as OraclePrediction;
        } catch (error: any) {
            if (import.meta.env.DEV) {
                console.error('[inventoryService] Oracle Error:', error);
            }
            return null;
        }
    }
};
