/**
 * useInventoryOracle - VSM Store
 * 
 * Custom hook para la lógica y gestión de InventoryOracle.
 * @module hooks/useInventoryOracle
 */

import { useState, useEffect } from 'react';
import { inventoryService, OraclePrediction } from '@/services/inventory.service';

/**
 * Hook para gestionar las predicciones del Oráculo de Inventario
 */
export function useInventoryOracle(productId: string, currentStock: number) {
    const [prediction, setPrediction] = useState<OraclePrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!productId || currentStock === undefined) return;

        // Solo pedimos predicción si el stock es bajo (ej: < 15) para ahorrar tokens y mejorar relevancia
        if (currentStock > 15) {
            setPrediction(null);
            return;
        }

        async function fetchPrediction() {
            setIsLoading(true);
            const data = await inventoryService.getStockPrediction(productId, currentStock);
            setPrediction(data);
            setIsLoading(false);
        }

        fetchPrediction();
    }, [productId, currentStock]);

    return { prediction, isLoading };
}
