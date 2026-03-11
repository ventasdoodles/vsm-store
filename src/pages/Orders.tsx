/**
 * // ─── COMPONENTE: Orders ───
 * // Arquitectura: Page Component (storefront)
 * // Proposito principal: Historial de pedidos del usuario autenticado.
 *    Muestra tarjetas con estado, total, y fecha. Filtro por status.
 * // Regla / Notas: Sin `any`. Tipado con Order de useOrders. Spotlight effect framer-motion.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Loader2, Package } from 'lucide-react';
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
                className="relative block overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/40 backdrop-blur-2xl p-6 transition-all duration-500 hover:border-white/20 hover:bg-[#13141f]/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
                {/* 🔦 Spotlight Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                250px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.08),
                                transparent 80%
                            )
                        `,
                    }}
                />

                <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-base font-black tracking-tight text-white uppercase italic">{order.order_number}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary/60">
                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <span className={cn(
                        'inline-flex rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-inner',
                        status.color, status.bg, status.border
                    )}>
                        {status.label}
                    </span>
                </div>

                <div className="relative z-10 mt-6 flex items-end justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary/40 block mb-1">Items</span>
                        <span className="text-sm font-bold text-theme-secondary">{itemCount} artículo{itemCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary/40 block mb-1">Total</span>
                        <span className="text-xl font-black text-vape-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Shimmer Effect on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-transparent via-vape-500 to-transparent transition-transform duration-700 group-hover:scale-x-100" />
            </Link>
        </motion.div>
    );
}

export function Orders() {
    const { user } = useAuth();
    const { data: orders = [], isLoading } = useCustomerOrders(user?.id);
    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

    return (
        <div className="container-vsm py-12 space-y-8">
            <SEO title="Mis pedidos" description="Historial de pedidos en VSM Store." />

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-vape-500/10 border border-vape-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <ShoppingBag className="h-6 w-6 text-vape-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Mis pedidos</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-secondary/40">Historial de compras</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={cn(
                            'flex-shrink-0 rounded-xl border px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                            filter === f.value
                                ? 'border-vape-500/40 bg-vape-500/10 text-vape-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                                : 'border-white/5 bg-white/[0.02] text-theme-secondary hover:border-white/10 hover:bg-white/[0.05]'
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-vape-500" />
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] py-20 text-center space-y-6"
                >
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-theme-secondary/5 border border-white/5">
                        <Package className="h-10 w-10 text-theme-secondary/40" />
                    </div>
                    <div className="max-w-xs mx-auto space-y-2">
                        <p className="text-xl font-black text-white uppercase italic">
                            {filter === 'all' ? 'Sin historial' : 'Sin coincidencias'}
                        </p>
                        <p className="text-[11px] font-bold text-theme-secondary/60 leading-relaxed uppercase tracking-wider">
                            {filter === 'all'
                                ? 'Tu baúl de pedidos está vacío por ahora.'
                                : 'No hay pedidos con este estado en tus registros.'}
                        </p>
                    </div>
                </motion.div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
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
    );
}
