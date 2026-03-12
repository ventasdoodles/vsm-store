/**
 * // ─── PÁGINA: STATS ───
 * // Propósito: Dashboard analítico del comportamiento del usuario.
 * // Arquitectura: Orquestación de datos transaccionales y preferencias (§1.3).
 * // Estilo: High-End Analytics Dashboard (§2.1).
 */
import { useEffect } from 'react';
import { BarChart3, Loader2, ShoppingBag, TrendingUp, Flame, Leaf, Sparkles, Target, Zap, CreditCard, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerStats, useTopProducts, useSpendingHistory } from '@/hooks/useStats';
import { SEO } from '@/components/seo/SEO';

export function Stats() {
    const { user } = useAuth();
    const { data: stats, isLoading: loadingStats } = useCustomerStats(user?.id);
    const { data: topProducts = [], isLoading: loadingTop } = useTopProducts(user?.id);
    const { data: spending = [], isLoading: loadingSpending } = useSpendingHistory(user?.id);

    useEffect(() => {
        document.title = 'Mis Estadísticas | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const isLoading = loadingStats || loadingTop || loadingSpending;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
                <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-[0.3em] animate-pulse">Procesando Múltiples KPIs...</p>
            </div>
        );
    }

    if (!stats || stats.totalOrders === 0) {
        return (
            <div className="container-vsm py-32 text-center max-w-lg">
                <div className="mx-auto w-24 h-24 rounded-[2.5rem] bg-accent-primary/5 border border-white/5 flex items-center justify-center mb-10 shadow-inner">
                    <BarChart3 size={40} className="text-theme-tertiary opacity-20" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight mb-4">Universo Paralelo de Datos</h2>
                <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-widest leading-relaxed opacity-60">
                    Tu dimensión analítica está virgen. Inicia tu primera transacción para comenzar a trazar tu trayectoria de consumo.
                </p>
                <div className="pt-10">
                    <button className="vsm-button-primary px-10" onClick={() => window.location.href = '/'}>Poblar Estadísticas</button>
                </div>
            </div>
        );
    }

    const maxSpending = Math.max(...spending.map((s) => s.total), 1);

    return (
        <div className="container-vsm py-12 space-y-12 animate-in fade-in duration-1000">
            <SEO title="Mis Estadísticas" description="Analítica premium de tu comportamiento en VSM." />

            {/* Header Cinemático Dashboard */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-accent-primary/20 rounded-[2rem] blur-xl animate-pulse" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-[2rem] bg-black border border-white/5 text-accent-primary shadow-2xl">
                            <BarChart3 className="h-8 w-8" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                             <Sparkles className="h-4 w-4 text-accent-primary animate-bounce-slow" />
                             <h1 className="text-4xl font-black text-white uppercase italic tracking-tight">Vanguardia Analítica</h1>
                        </div>
                        <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-[0.3em] opacity-60 mt-1">Trayectoria transaccional y KPIs de consumo</p>
                    </div>
                </div>
            </header>

            {/* Grid de KPIs Premium */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Asset Invertido', value: formatPrice(stats.totalSpent), color: 'text-vape-400', icon: <TrendingUp size={14} />, gradient: 'bg-vape-500/10 border-vape-500/20' },
                    { label: 'Cuota de Pedidos', value: stats.totalOrders.toString(), color: 'text-herbal-400', icon: <ShoppingBag size={14} />, gradient: 'bg-herbal-500/10 border-herbal-500/20' },
                    { label: 'Ticket Óptimo', value: formatPrice(stats.averageTicket), color: 'text-yellow-400', icon: <Target size={14} />, gradient: 'bg-yellow-500/10 border-yellow-500/20' },
                    { label: 'Sección Predominante', value: stats.favoriteSection === '420' ? 'Herbal' : 'Vape', color: 'text-accent-primary', icon: <Zap size={14} />, gradient: 'bg-accent-primary/10 border-accent-primary/20' },
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label} 
                        className={cn("relative overflow-hidden group rounded-[2.5rem] border p-8 backdrop-blur-3xl shadow-2xl transition-all duration-700 hover:scale-105", item.gradient)}
                    >
                        <div className="flex justify-between items-start mb-6">
                             <div className={cn("p-3 rounded-2xl bg-black border border-white/5 shadow-inner", item.color)}>
                                {item.icon}
                             </div>
                             <div className="h-1.5 w-1.5 rounded-full bg-white opacity-20" />
                        </div>
                        <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.3em] mb-1.5 opacity-50">{item.label}</p>
                        <p className={cn('text-2xl font-black italic tracking-tighter uppercase drop-shadow-sm', item.color)}>{item.value}</p>
                        
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Visualización de Gasto (Barras Cinemáticas) */}
                <section className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-10 space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <header className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-herbal-400" /> Fluctuación Mensual
                            </h3>
                            <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40">Gasto consolidado por periodo</p>
                        </div>
                    </header>

                    <div className="flex items-end gap-3 sm:gap-6 h-56 pt-10">
                        {spending.map((s, i) => {
                            const height = s.total > 0 ? Math.max(10, (s.total / maxSpending) * 100) : 5;
                            return (
                                <div key={s.month} className="flex flex-1 flex-col items-center group/bar h-full justify-end gap-4">
                                    <AnimatePresence initial={false}>
                                        {s.total > 0 && (
                                            <motion.span 
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="text-[8px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black border border-white/5 px-2 py-1 rounded-md"
                                            >
                                                {formatPrice(s.total)}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className={cn(
                                            'w-full rounded-[1.5rem] transition-all duration-700 relative shadow-2xl overflow-hidden',
                                            s.total > 0 ? 'bg-gradient-to-t from-accent-primary to-accent-secondary' : 'bg-white/5'
                                        )}
                                    >
                                         <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/20 to-transparent" />
                                    </motion.div>
                                    <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest">{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Inventario de Top Productos */}
                <section className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-10 space-y-10 relative overflow-hidden group">
                     <div className="absolute bottom-0 left-0 w-64 h-64 bg-vape-500/5 rounded-full blur-[100px] pointer-events-none" />
                     
                     <header className="space-y-1">
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                            <ShoppingBag className="h-5 w-5 text-vape-400" /> Curación de Favoritos
                        </h3>
                        <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.2em] opacity-40">Artículos con mayor tasa de adquisición</p>
                     </header>

                     <div className="space-y-4">
                        {topProducts.map((p, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={p.product_id} 
                                className="flex items-center gap-6 p-4 rounded-[2rem] bg-white/[0.01] border border-white/5 transition-all duration-500 hover:bg-white/[0.03] group/item"
                            >
                                <div className="relative">
                                     <span className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/10 text-[10px] font-black text-white italic z-20 shadow-2xl">
                                        #{i + 1}
                                     </span>
                                     <div className="h-16 w-16 rounded-2xl bg-black border border-white/5 overflow-hidden shadow-inner flex-shrink-0 relative">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-accent-primary text-xl">📦</div>
                                        )}
                                     </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white uppercase italic truncate">{p.name}</p>
                                    <div className="flex gap-4 mt-1">
                                        <p className="text-[9px] font-black text-accent-primary uppercase tracking-[0.1em]">
                                            Frecuencia: {p.timesBought} Unid.
                                        </p>
                                        <div className="h-3 w-[1px] bg-white/10" />
                                        <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.1em] opacity-60">
                                            Valor: {formatPrice(p.totalSpent)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                     </div>
                </section>
            </div>
            
            {/* Preferencias de Dimensión Periférica */}
            <div className="rounded-[3rem] border border-white/5 bg-white/[0.02] p-10 space-y-8">
                <h3 className="text-sm font-black text-theme-tertiary uppercase tracking-[0.3em] opacity-40">Parámetros Ambientales</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                         { icon: stats.favoriteSection === '420' ? <Leaf className="h-5 w-5 text-herbal-400" /> : <Flame className="h-5 w-5 text-vape-400" />, label: 'Ecosistema Favorito', value: stats.favoriteSection === '420' ? 'Herbal 420' : 'Vape' },
                         { icon: <CreditCard className="h-5 w-5 text-accent-primary" />, label: 'Método Digital Preferente', value: stats.preferredPayment === 'cash' ? 'Efectivo' : stats.preferredPayment === 'transfer' ? 'Transferencia' : stats.preferredPayment ?? 'WhatsApp' },
                         { icon: <Package className="h-5 w-5 text-white/40" />, label: 'Volumen Acumulado', value: `${stats.totalOrders} Adquisiciones` },
                    ].map((pref, i) => (
                        <div key={i} className="flex items-center gap-6 rounded-[2rem] bg-black/40 border border-white/5 p-6 shadow-inner hover:border-white/10 transition-colors">
                            <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                                {pref.icon}
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-theme-tertiary uppercase tracking-[0.2em] mb-0.5 opacity-40">{pref.label}</p>
                                <p className="text-xs font-black text-white uppercase italic tracking-tight">{pref.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
