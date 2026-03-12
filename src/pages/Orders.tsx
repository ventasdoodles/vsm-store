/**
 * // ─── PÁGINA: ORDERS ───
 * // Propósito: Historial cinemático de pedidos del usuario.
 * // Arquitectura: Orquestación de estados de pedidos y filtros dinámicos (§1.1).
 * // Estilo: High-End Premium Aesthetics (§2.1).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, Package, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerOrders, ORDER_STATUS } from '@/hooks/useOrders';
import { SEO } from '@/components/seo/SEO';
import type { OrderStatus, OrderRecord } from '@/hooks/useOrders';

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'processing', label: 'Procesando' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregados' },
    { value: 'cancelled', label: 'Cancelados' },
];

interface OrderStatusDisplay {
    label: string;
    color: string;
    bg: string;
    border: string;
}

function OrderCard({ order, status }: { order: OrderRecord; status: OrderStatusDisplay }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const itemCount = Array.isArray(order.items)
        ? order.items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity ?? 1), 0)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onMouseMove={handleMouseMove}
            className="group relative"
        >
            <Link
                to={`/orders/${order.id}`}
                className="relative block overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8 transition-all duration-700 hover:border-white/20 hover:bg-white/[0.04] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                {/* 🔦 Spotlight Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                350px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.08),
                                transparent 80%
                            )
                        `,
                    }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl border text-white shadow-2xl transition-all duration-700 group-hover:scale-110",
                            status.bg, status.border
                        )}>
                            <Package className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black tracking-tight text-white uppercase italic">{order.order_number}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary/60">
                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className={cn(
                            'inline-flex rounded-xl border px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-inner transition-all duration-700 group-hover:px-6',
                            status.color, status.bg, status.border
                        )}>
                            {status.label}
                        </span>
                    </div>
                </div>

                <div className="relative z-10 mt-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40 block mb-1">Artículos</span>
                        <span className="text-sm font-black text-white uppercase italic">{itemCount} objeto{itemCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-40 block mb-1">Total</span>
                        <span className="text-xl font-black text-vape-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Shimmer Effect on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-transparent via-accent-primary to-transparent transition-transform duration-1000 group-hover:scale-x-100" />
            </Link>
        </motion.div>
    );
}

export function Orders() {
    const { user } = useAuth();
    const { data: orders = [], isLoading, isError, error } = useCustomerOrders(user?.id);
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    if (isError) {
        return (
            <div className="container-vsm py-20 text-center animate-in fade-in zoom-in duration-700">
                <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <Package className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Error de Transmisión</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/60 max-w-sm mx-auto leading-relaxed">
                    {(error as Error)?.message || 'No se han podido recuperar tus bitácoras de compra. Por favor, reintenta.'}
                </p>
            </div>
        );
    }

    return (
        <div className="container-vsm py-12 space-y-12 min-h-screen">
            <SEO title="Mis pedidos" description="Historial de pedidos en VSM Store." />

            {/* Header Cinemático */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-accent-primary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-black border border-white/10 text-accent-primary shadow-2xl">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <Sparkles className="h-4 w-4 text-accent-primary animate-pulse" />
                             <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Mis Pedidos</h1>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary opacity-60 mt-1">Bitácora histórica de adquisiciones</p>
                    </div>
                </div>

                {/* Filtros Cinemáticos */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mask-fade-right">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                'flex-shrink-0 rounded-[1.5rem] border px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-500 active:scale-95',
                                filter === f.value
                                    ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary shadow-2xl shadow-accent-primary/20'
                                    : 'border-white/5 bg-white/[0.02] text-theme-tertiary hover:border-white/20 hover:text-white'
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Lista Cinemática */}
            <div className="relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-accent-primary opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary animate-pulse">Sincronizando archivos...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <AnimatePresence initial={false}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] py-32 text-center space-y-8 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/[0.02] to-transparent" />
                            <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-black/40 border border-white/5 shadow-2xl">
                                <Package className="h-10 w-10 text-theme-tertiary opacity-10" />
                            </div>
                            <div className="relative max-w-sm mx-auto space-y-4 px-6">
                                <h2 className="text-2xl font-black text-white uppercase italic">
                                    {filter === 'all' ? 'Sin Registros' : 'Búsqueda Estéril'}
                                </h2>
                                <p className="text-[10px] font-black text-theme-tertiary/60 leading-relaxed uppercase tracking-[0.2em]">
                                    {filter === 'all'
                                        ? 'Tu baúl de adquisiciones está esperando tu primer gran movimiento.'
                                        : 'No hemos encontrado bitácoras que coincidan con los filtros aplicados.'}
                                </p>
                                <div className="pt-6">
                                    <Link to="/" className="vsm-button-primary px-10">Explorar Catálogo</Link>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence initial={false}>
                            {filtered.map((order) => {
                                const status = ORDER_STATUS[order.status as OrderStatus] ?? ORDER_STATUS.pending;
                                return (
                                    <OrderCard key={order.id} order={order} status={status} />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
