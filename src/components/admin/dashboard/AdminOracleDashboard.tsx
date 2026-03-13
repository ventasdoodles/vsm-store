import { motion } from 'framer-motion';
import { Sparkles, ShoppingCart, Power } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { getOracleLowStockProducts } from '@/services/admin';
 
 /**
  * AdminOracleDashboard - Insights proactivos del Oráculo (IA)
  * Muestra alertas inteligentes basadas en predicciones de Gemini.
  */
 export function AdminOracleDashboard() {
     // Buscamos productos con stock bajo para pedir predicciones
     const { data: lowStockProducts, isLoading } = useQuery({
         queryKey: ['admin', 'oracle-low-stock'],
         queryFn: () => getOracleLowStockProducts(3)
     });

    if (isLoading || !lowStockProducts || lowStockProducts.length === 0) return null;

    return (
        <div className="vsm-stack gap-4">
            <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white italic">
                    Insights del Oráculo VSM AI
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                    <OracleInsightCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

function OracleInsightCard({ product }: { product: { id: string; name: string; stock: number; section?: string; slug?: string } }) {
    const { data: prediction, isLoading } = useQuery({
        queryKey: ['admin', 'oracle-prediction', product.id],
        queryFn: () => inventoryService.getStockPrediction(product.id, product.stock),
        staleTime: 1000 * 60 * 30 // 30 mins
    });

    if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-white/5 border border-white/5" />;
    if (!prediction) return null;

    const isCritical = prediction.urgencyLevel === 'critical';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "glass-premium p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:scale-[1.02]",
                isCritical ? "border-red-500/30 bg-red-500/5 shadow-red-500/5" : "border-accent-primary/30 bg-accent-primary/5 shadow-accent-primary/5"
            )}
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        isCritical ? "bg-red-500 text-white" : "bg-accent-primary text-white"
                    )}>
                        {isCritical ? 'Estado Crítico' : 'Insight IA'}
                    </span>
                    <span className="text-xs font-bold text-white/40 italic">
                        Stock: {product.stock}
                    </span>
                </div>

                <h4 className="text-sm font-black text-theme-primary">
                    {product.name}
                </h4>

                <p className="text-xs text-theme-secondary leading-relaxed opacity-80">
                    {prediction.adminRecommendation}
                </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <Link
                    to={`/admin/products?search=${product.name}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                    <ShoppingCart className="w-3 h-3" />
                    Reabastecer
                </Link>
                <button className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                    <Power className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}
