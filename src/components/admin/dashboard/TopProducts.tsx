import { Trophy, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { DashboardStats } from '@/services/admin';

interface TopProductsProps {
    products: DashboardStats['topProducts'];
}

export function TopProducts({ products = [] }: TopProductsProps) {
    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/60 p-5">
            <div className="flex items-center gap-2 mb-5">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-theme-primary">Top productos</h2>
            </div>
            {(!products || products.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Package className="h-8 w-8 text-accent-primary mb-2" />
                    <p className="text-xs text-theme-primary0">Aún no hay datos de ventas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((product, i) => {
                        const maxRev = products[0]?.revenue || 1;
                        const barWidth = (product.revenue / maxRev) * 100;
                        return (
                            <div key={product.name} className="group">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-theme-secondary/60 text-xs font-bold text-theme-secondary shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-theme-secondary truncate max-w-[180px]" title={product.name}>
                                            {product.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[11px] text-theme-primary0">
                                            {product.sold} uds
                                        </span>
                                        <span className="text-xs font-semibold text-theme-primary">
                                            {formatPrice(product.revenue)}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full bg-theme-secondary/40 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/80 transition-all group-hover:from-amber-400 group-hover:to-amber-300"
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
