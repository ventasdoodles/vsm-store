/**
 * // ─── HOOK: useAdminDashboard ─── [Wave 128 - Hook Unification]
 * // Propósito: Centralizar métricas, pulso del sistema e inteligencia predictiva.
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
    getPulseMetrics, 
    getDashboardStats, 
    getRecentOrders, 
    getDashboardPulse, 
    getOracleLowStockProducts,
    searchCommandPalette,
    adminNLPService,
    type DashboardStats
} from '@/services/admin';
import { inventoryService } from '@/services';

export function useAdminPulse() {
    return useQuery({
        queryKey: ['admin', 'pulse'],
        queryFn: getPulseMetrics,
        refetchInterval: 30000, // Cada 30 segs
    });
}

export function useAdminDashboardStats(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: ['admin', 'stats', startDate, endDate],
        queryFn: () => getDashboardStats(startDate, endDate),
        staleTime: 60000,
    });
}

export function useAdminRecentOrders(limit = 10) {
    return useQuery({
        queryKey: ['admin', 'recent-orders', limit],
        queryFn: () => getRecentOrders(limit),
    });
}

export function useAdminOracle() {
    return useQuery({
        queryKey: ['admin', 'oracle', 'low-stock'],
        queryFn: () => getOracleLowStockProducts(),
    });
}

export function useAdminOraclePrediction(productId: string, currentStock: number) {
    return useQuery({
        queryKey: ['admin', 'oracle', 'prediction', productId, currentStock],
        queryFn: () => inventoryService.getStockPrediction(productId, currentStock),
        enabled: !!productId
    });
}

export function useAdminAIInsights(stats: DashboardStats | undefined) {
    return useQuery({
        queryKey: ['admin', 'ai', 'pulse', stats?.todaySales], // Re-run if sales change
        queryFn: () => stats ? getDashboardPulse(stats) : null,
        enabled: !!stats,
        staleTime: 300000, // 5 min
    });
}

export function useAdminSearch() {
    const searchMutation = useMutation({
        mutationFn: (query: string) => searchCommandPalette(query),
    });

    return {
        results: searchMutation.data,
        isSearching: searchMutation.isPending,
        search: (query: string) => searchMutation.mutateAsync(query)
    };
}

export function useAdminNLP() {
    const nlpMutation = useMutation({
        mutationFn: (text: string) => adminNLPService.parseAdminIntent(text),
    });

    const supplierCopyMutation = useMutation({
        mutationFn: ({ name, stock, sku }: { name: string, stock: number, sku: string }) => 
            adminNLPService.generateSupplierOrderCopy(name, stock, sku),
    });

    return {
        parseIntent: (text: string) => nlpMutation.mutateAsync(text),
        generateSupplierCopy: (data: { name: string, stock: number, sku: string }) => supplierCopyMutation.mutateAsync(data),
        isParsing: nlpMutation.isPending,
        isGenerating: supplierCopyMutation.isPending
    };
}
