import { Link } from '@tanstack/react-router';
import { Calendar, Package, ReceiptText, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { OrderItem, OrderRecord } from '@/hooks/useOrders';
import type {
    StorefrontOrderLifecycleView,
    StorefrontPostPurchaseConfidenceView,
} from '@/lib/domain/orders';

type ReceiptOrder = Pick<OrderRecord, 'id' | 'order_number' | 'created_at' | 'total'> & {
    items?: OrderItem[] | null;
};

interface PostPurchaseReceiptCardProps {
    order: ReceiptOrder;
    lifecycleView: StorefrontOrderLifecycleView;
    confidenceView: StorefrontPostPurchaseConfidenceView;
}

export function PostPurchaseReceiptCard({
    order,
    lifecycleView,
    confidenceView,
}: PostPurchaseReceiptCardProps) {
    const previewItems = (Array.isArray(order.items) ? order.items : []).slice(0, 3);

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        <ReceiptText className="h-3.5 w-3.5" />
                        Resumen persistido
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/35">Pedido</p>
                        <h2 className="text-xl font-black uppercase italic tracking-tight text-white">
                            {order.order_number}
                        </h2>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Total registrado</p>
                    <p className="mt-1 text-lg font-black text-vape-400">{formatPrice(order.total)}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                    <Calendar className="mt-0.5 h-4 w-4 text-white/45" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Fecha registrada</p>
                        <p className="mt-1 text-sm font-bold text-white/85">
                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                    <Package className="mt-0.5 h-4 w-4 text-white/45" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Compra registrada</p>
                        <p className="mt-1 text-sm font-bold text-white/85">{confidenceView.itemsLabel}</p>
                    </div>
                </div>
            </div>

            {previewItems.length > 0 && (
                <div className="mt-5 rounded-[1.5rem] border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Lo que ya quedo registrado</p>
                    <div className="mt-3 space-y-2">
                        {previewItems.map((item, index) => (
                            <div
                                key={`${item.product_id}-${item.variant_id ?? 'base'}-${index}`}
                                className="flex items-center justify-between gap-4 text-sm text-white/85"
                            >
                                <span className="truncate font-bold">
                                    {item.quantity} x {item.name}
                                    {item.variant_name ? ` - ${item.variant_name}` : ''}
                                </span>
                                <span className="shrink-0 text-xs font-black uppercase tracking-[0.14em] text-white/45">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                        {Array.isArray(order.items) && order.items.length > previewItems.length && (
                            <p className="pt-1 text-[11px] font-bold text-white/45">
                                +{order.items.length - previewItems.length} articulo(s) adicional(es) en el pedido
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Que sigue ahora</p>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.16em] text-white">
                    {confidenceView.receiptTitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{confidenceView.receiptDetail}</p>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    {confidenceView.revisitTitle}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{confidenceView.revisitDetail}</p>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                    to={`/orders/${order.id}` as any}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-vape-600 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-vape-500"
                >
                    <ShoppingBag className="h-4 w-4" />
                    {lifecycleView.orderCtaLabel}
                </Link>
                <Link
                    to={"/orders" as any}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <Package className="h-4 w-4" />
                    Ver historial de pedidos
                </Link>
            </div>
        </section>
    );
}
