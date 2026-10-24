// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

const invokeMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        functions: {
            invoke: invokeMock,
        },
    },
}));

import { getStockPrediction, inventoryService, type OraclePrediction } from '../inventory.service';

describe('inventory.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('invokes inventory-oracle edge function and returns prediction data', async () => {
        const mockPrediction: OraclePrediction = {
            daysUntilOut: 14,
            depletionDate: '2026-11-07',
            customerMessage: 'Quedan pocas unidades.',
            adminRecommendation: 'Reordenar pronto.',
            urgencyLevel: 'medium',
        };

        invokeMock.mockResolvedValue({
            data: mockPrediction,
            error: null,
        });

        const result = await getStockPrediction('prod-oracle-1', 5);

        expect(invokeMock).toHaveBeenCalledWith('inventory-oracle', {
            body: { productId: 'prod-oracle-1', currentStock: 5 },
        });
        expect(result).toEqual(mockPrediction);
    });

    it('returns null and handles error gracefully when edge function fails', async () => {
        invokeMock.mockResolvedValue({
            data: null,
            error: new Error('Oracle timeout'),
        });

        const result = await getStockPrediction('prod-oracle-err', 1);

        expect(result).toBeNull();
    });

    it('returns null when invocation rejects with unexpected error', async () => {
        invokeMock.mockRejectedValue(new Error('Network offline'));

        const result = await getStockPrediction('prod-oracle-rej', 0);

        expect(result).toBeNull();
    });

    it('inventoryService object delegates to getStockPrediction correctly', async () => {
        const mockPrediction: OraclePrediction = {
            daysUntilOut: 3,
            depletionDate: '2026-10-27',
            customerMessage: '¡Casi agotado!',
            adminRecommendation: 'Urgente reordenar.',
            urgencyLevel: 'critical',
        };

        invokeMock.mockResolvedValue({
            data: mockPrediction,
            error: null,
        });

        const result = await inventoryService.getStockPrediction('prod-oracle-obj', 2);
        expect(result).toEqual(mockPrediction);
    });
});
