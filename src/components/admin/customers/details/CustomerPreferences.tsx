/**
 * CustomerPreferences — Algoritmo de Consumo
 * 
 * Analiza el historial de pedidos del cliente para proyectar:
 * - Top categorías más compradas
 * - Productos de reposición frecuente
 * Los datos se calculan dinámicamente desde order_items vía React Query.
 * 
 * @module admin/customers/details
 */
import { useQuery } from '@tanstack/react-query';
import { getCustomerPreferences } from '@/services/admin';
import { PieChart, ShoppingBag, Loader2, Sparkles, Target } from 'lucide-react';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerPreferences({ customer }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'customer', customer.id, 'preferences'],
        queryFn: () => getCustomerPreferences(customer.id),
        enabled: !!customer.id,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#13141f]/50 border border-white/5 rounded-[2rem] min-h-[150px]">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
                <p className="text-xs text-theme-secondary">Mapeando preferencias de consumo...</p>
            </div>
        );
    }

    if (!data || (data.topProducts.length === 0 && data.topCategories.length === 0)) {
        return (
            <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/50 p-6 flex items-center justify-center min-h-[120px] shadow-inner">
                 <div className="text-center">
                    <Target className="w-6 h-6 text-theme-secondary/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white mb-0.5">Sin huella de consumo</p>
                    <p className="text-[10px] text-theme-secondary">El motor analítico requiere más datos.</p>
                </div>
            </div>
        ); 
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/5 border border-purple-500/20 shadow-inner">
                    <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Algoritmo de Consumo</h3>
                    <p className="text-xs text-theme-secondary/70">Intereses y recurrencia mapeada</p>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Top Categorías */}
                {data.topCategories.length > 0 && (
                    <div>
                        <h4 className="text-[10px] text-theme-secondary/80 mb-3 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <Sparkles className="h-3 w-3 text-purple-400" /> Categorías Top
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {data.topCategories.map((cat: { name: string; count: number }, i: number) => {
                                // Progress bar effect based on index to simulate volume
                                const intensity = 100 - (i * 20);
                                return (
                                    <div key={i} className="group flex items-center gap-2 bg-[#1a1c29]/80 border border-white/5 px-3 py-1.5 rounded-lg hover:border-purple-500/30 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" style={{ opacity: intensity / 100 }} />
                                        <span className="text-xs text-white font-medium">{cat.name}</span>
                                        <span className="text-[10px] font-bold text-theme-secondary/50 bg-white/5 px-1.5 py-0.5 rounded-md">
                                            x{cat.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Top Productos */}
                {data.topProducts.length > 0 && (
                    <div>
                        <h4 className="text-[10px] text-theme-secondary/80 mb-3 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <ShoppingBag className="h-3 w-3 text-fuchsia-400" /> Reposición Frecuente
                        </h4>
                        <div className="space-y-2">
                            {data.topProducts.map((prod: { name: string; count: number }, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-gradient-to-r hover:from-white/5 hover:to-transparent p-2.5 rounded-xl border border-transparent hover:border-white/5 transition-all group">
                                    <div className="flex flex-col min-w-0 pr-4">
                                        <span className="text-xs text-white/90 font-medium truncate group-hover:text-white transition-colors">{prod.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-fuchsia-400 bg-fuchsia-400/10 border border-fuchsia-400/20 px-2.5 py-1 rounded-md whitespace-nowrap flex items-center gap-1 shadow-sm">
                                        <ShoppingBag className="w-3 h-3" />
                                        {prod.count} uds
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
