/**
 * // ─── COMPONENTE: TopProducts ───
 * // Arquitectura: Dumb Component (Visual List)
 * // Propósito principal: Listado de los productos más vendidos con barras de proporción de ingresos.
 * // Regla / Notas: Mantiene consistencia visual con SalesChart en términos de contenedores y blur.
 */
import { Trophy, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats } from '@/services/admin';

interface TopProductsProps {
    products: DashboardStats['topProducts'];
}

export function TopProducts({ products = [] }: TopProductsProps) {
    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-[#13141f]/70 backdrop-blur-md p-6 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-accent-primary/5 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-[0.75rem] bg-amber-500/10">
                    <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-wide">Top Productos</h2>
            </div>
            
            {(!products || products.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 flex-1 text-center bg-white/5 rounded-[1rem] border border-white/5 border-dashed">
                    <Package className="h-10 w-10 text-theme-secondary/50 mb-3" />
                    <p className="text-xs font-medium text-theme-secondary">Aún no hay datos de ventas</p>
                </div>
            ) : (
                <div className="space-y-4 flex-1">
                    {products.map((product, i) => {
                        const maxRev = products[0]?.revenue || 1;
                        const barWidth = (product.revenue / maxRev) * 100;
                        return (
                            <div key={product.name} className="group relative">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 min-w-0 pr-4">
                                        <span className={`flex h-6 w-6 items-center justify-center rounded-[0.5rem] text-[10px] font-bold shrink-0 transition-colors ${
                                            i === 0 ? 'bg-amber-500/20 text-amber-500 shadow-inner' : 
                                            i === 1 ? 'bg-slate-300/20 text-slate-300' : 
                                            i === 2 ? 'bg-amber-700/20 text-amber-600' : 
                                            'bg-white/5 text-theme-secondary'
                                        }`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-white truncate max-w-[160px] group-hover:text-accent-primary transition-colors" title={product.name}>
                                            {product.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-xs font-black text-white">
                                            {formatPrice(product.revenue)}
                                        </span>
                                        <span className="text-[10px] font-medium text-theme-secondary">
                                            {product.sold} uds
                                        </span>
                                    </div>
                                </div>
                                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400 transition-all duration-1000 ease-out relative"
                                        style={{ width: `${barWidth}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 blur-[2px] w-full" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
