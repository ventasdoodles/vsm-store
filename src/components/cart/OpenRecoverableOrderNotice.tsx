import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard, Loader2, Package } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useStorefrontPaymentReentry } from '@/hooks/useStorefrontPaymentReentry';
import type { OrderRecord } from '@/hooks/useOrders';
import type { StorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';

interface OpenRecoverableOrderNoticeProps {
    order: OrderRecord;
    view: StorefrontOpenOrderRecoveryView;
    compact?: boolean;
}

export function OpenRecoverableOrderNotice({
    order,
    view,
    compact = false,
}: OpenRecoverableOrderNoticeProps) {
    const navigate = useNavigate();
    const { continuePayment, continuingOrderId } = useStorefrontPaymentReentry();

    if (!view.shouldRecover) {
        return null;
    }

    const continuingPayment = continuingOrderId === order.id;

    return (
        <div
            className={cn(
                'rounded-[1.75rem] border border-yellow-500/30 bg-yellow-500/10 text-white',
                compact ? 'p-4' : 'p-6',
            )}
        >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-yellow-500/30 bg-black/20 text-yellow-400">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                        Orden abierta recuperable
                    </p>
                    <p className={cn('mt-2 font-black uppercase italic text-white', compact ? 'text-sm' : 'text-lg')}>
                        {view.headline}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-wider leading-relaxed text-white/80">
                        {view.detail}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/70">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            <Package className="h-3.5 w-3.5 text-yellow-400" />
                            {order.order_number}
                        </span>
                        <span className="inline-flex rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            {formatPrice(order.total)}
                        </span>
                    </div>

                    <div className={cn('mt-4 flex gap-3', compact ? 'flex-col' : 'flex-col sm:flex-row')}>
                        <button
                            type="button"
                            onClick={() => void continuePayment(order)}
                            disabled={continuingPayment}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-yellow-600 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {continuingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                            {continuingPayment ? 'Abriendo Mercado Pago...' : view.primaryCtaLabel}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/10"
                        >
                            <Package className="h-4 w-4" />
                            {view.secondaryCtaLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
