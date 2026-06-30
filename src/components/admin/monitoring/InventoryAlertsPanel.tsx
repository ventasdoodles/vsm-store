import { useQuery } from '@tanstack/react-query';
import { Package, AlertTriangle, ExternalLink } from 'lucide-react';
import { getOracleLowStockProducts } from '@/services/admin';
import { Link } from '@tanstack/react-router';

export function InventoryAlertsPanel() {
    const { data: lowStockProducts = [], isLoading } = useQuery({
        queryKey: ['admin', 'monitoring-inventory'],
        queryFn: () => getOracleLowStockProducts(5),
        refetchInterval: 30000, // Cada 30s
    });

    return (
        <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 px-1">
                <div className="h-5 w-1.5 rounded-full bg-amber-500" />
                <h2 className="text-lg font-black text-white tracking-tight">
                    Alertas de Inventario
                </h2>
            </div>
            
            <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl overflow-hidden p-5 shadow-2xl">
                {isLoading ? (
                    <div className="h-32 flex items-center justify-center text-theme-secondary">
                        <span className="animate-pulse">Cargando alertas...</span>
                    </div>
                ) : lowStockProducts.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-theme-secondary/70">
                        <Package className="h-8 w-8 mb-2 opacity-50" />
                        <span className="text-sm">Inventario óptimo.</span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lowStockProducts.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-amber-500/10 hover:bg-amber-500/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white line-clamp-1">{p.name}</p>
                                        <p className="text-xs text-theme-secondary">Quedan: {p.stock} uds.</p>
                                    </div>
                                </div>
                                <Link 
                                    to={`/admin/products` as any}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-theme-secondary hover:text-white"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
