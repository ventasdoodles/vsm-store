import { CreditCard, Loader2, MessageCircle, RotateCcw, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { OrderItem } from '@/hooks/useOrders';

interface OrderSummaryCardProps {
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paymentView: {
        paymentLabel: string;
        paymentTone: string;
    };
    continuationView: {
        nextActionText: string;
    };
    canContinuePayment: boolean;
    continuingPayment: boolean;
    canReorder: boolean;
    reorderingOrderId: string | null;
    orderId: string;
    onContinuePayment: () => void;
    onReorder: () => void;
    onWhatsApp: () => void;
}

export function OrderSummaryCard({
    orderNumber,
    items,
    subtotal,
    shippingCost,
    discount,
    total,
    paymentMethod,
    paymentView,
    continuationView,
    canContinuePayment,
    continuingPayment,
    canReorder,
    reorderingOrderId,
    orderId,
    onContinuePayment,
    onReorder,
    onWhatsApp,
}: OrderSummaryCardProps) {
    const isReordering = reorderingOrderId === orderId;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* RECIBO CINEMÁTICO */}
            <div className="lg:col-span-2 relative group/receipt">
                <div className="absolute -inset-1 bg-gradient-to-b from-accent-primary/20 via-transparent to-accent-primary/10 rounded-[3rem] blur-xl opacity-40 group-hover/receipt:opacity-70 transition-opacity duration-1000" />

                <div className="relative rounded-[2.5rem] border border-white/10 bg-zinc-950 p-8 sm:p-10 space-y-8 backdrop-blur-3xl shadow-2xl overflow-hidden">
                    {/* Header Recibo */}
                    <div className="text-center space-y-4 mb-10">
                        <div className="mx-auto w-24 h-24 rounded-[2rem] bg-black border border-white/5 flex items-center justify-center shadow-inner relative group">
                            <ShoppingBag className="h-10 w-10 text-theme-tertiary opacity-20 transition-opacity group-hover:opacity-40" />
                            <div className="absolute -inset-2 bg-accent-primary/5 rounded-full blur-xl animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-[0.2em]">Resumen del pedido</h2>
                        <div className="flex flex-col items-center gap-1 opacity-60">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary">Cod. Reg: {orderNumber}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary">Estado persistido del pedido</p>
                        </div>
                    </div>

                    {/* Items Loop */}
                    <div className="space-y-6 pb-10">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.3em] text-theme-tertiary border-b border-white/5 pb-2">
                            <span>Concepto</span>
                            <span>Total Parcial</span>
                        </div>
                        {items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group/item">
                                <div className="flex gap-4 items-center">
                                    <div className="h-12 w-12 rounded-xl bg-black border border-white/5 overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} className="w-full h-full object-cover grayscale group-hover/item:grayscale-0 transition-all duration-500" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-theme-tertiary opacity-30">📦</div>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-white uppercase truncate max-w-[150px]">{item.name}</p>
                                        <p className="text-[9px] font-black text-accent-primary uppercase tracking-widest">{item.quantity} Uni. × {formatPrice(item.price)}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-white italic">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Totales */}
                    <div className="border-t border-dashed border-white/10 pt-8 space-y-4">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                            <span>Subtotal</span>
                            <span className="text-white opacity-80">{formatPrice(subtotal)}</span>
                        </div>
                        {shippingCost > 0 && (
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                                <span>Envío registrado</span>
                                <span className="text-white opacity-80">{formatPrice(shippingCost)}</span>
                            </div>
                        )}
                        {discount > 0 && (
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-herbal-500">
                                <span>Bonificación Digital</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-6 border-t border-white/5">
                            <span className="text-sm font-black text-white uppercase italic tracking-[0.2em]">Total registrado</span>
                            <span className="text-2xl font-black text-accent-primary italic drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="mt-12 text-center opacity-30">
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-theme-tertiary">Referencia persistida para seguimiento</p>
                    </div>
                </div>
            </div>

            {/* PANEL DE ACCIONES */}
            <div className="space-y-8">
                <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-theme-secondary shadow-xl">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Pago</h3>
                            <p className="text-[10px] text-theme-tertiary font-bold uppercase opacity-60">Estado persistido</p>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40">Método de pago</span>
                            <span className="text-xs font-black text-white uppercase italic">
                                {{ cash: 'Efectivo', transfer: 'Transferencia', mercadopago: 'Mercado Pago', card: 'Tarjeta', whatsapp: 'WhatsApp' }[paymentMethod] ?? paymentMethod}
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.01] border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary opacity-40">Estado de pago</span>
                            <span className={cn(
                                'text-xs font-black uppercase italic tracking-widest',
                                paymentView.paymentTone === 'success'
                                    ? 'text-herbal-500'
                                    : paymentView.paymentTone === 'danger'
                                        ? 'text-red-400'
                                        : paymentView.paymentTone === 'neutral'
                                            ? 'text-accent-primary'
                                            : 'text-yellow-500'
                            )}>
                                {paymentView.paymentLabel}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-tertiary opacity-60">
                            Siguiente paso real
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-theme-secondary/80 leading-relaxed">
                            {continuationView.nextActionText}
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        {canContinuePayment && (
                            <button
                                onClick={onContinuePayment}
                                disabled={continuingPayment}
                                className="w-full h-14 bg-gradient-to-r from-accent-primary to-accent-primary/80 hover:brightness-110 text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent-primary/20 disabled:opacity-50"
                            >
                                {continuingPayment ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Iniciando pasarela real...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard size={18} />
                                        Continuar pago en Mercado Pago
                                    </>
                                )}
                            </button>
                        )}

                        {canReorder && (
                            <button
                                onClick={onReorder}
                                disabled={isReordering}
                                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/10 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                            >
                                {isReordering ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
                                        Reordenando...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw size={18} />
                                        Reordenar con catálogo actual
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={onWhatsApp}
                            className="w-full h-14 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-xs rounded-2xl border border-emerald-500/20 flex items-center justify-center gap-3 transition-all"
                        >
                            <MessageCircle size={18} />
                            Soporte por WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
