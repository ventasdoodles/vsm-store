import { Package, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/hooks/useOrders';

interface OrderStatusBannerProps {
    currentStatus: OrderStatus;
    statusConfig: {
        label: string;
        color: string;
        bg: string;
        border: string;
    };
    statusIcons: Record<OrderStatus, LucideIcon>;
    paymentView: {
        headline: string;
        detail: string;
        paymentTone: string;
    };
    freshnessView: {
        isFreshnessSensitive: boolean;
        freshnessNote: string;
    };
}

export function OrderStatusBanner({
    currentStatus,
    statusConfig,
    statusIcons,
    paymentView,
    freshnessView,
}: OrderStatusBannerProps) {
    const StatusIcon = statusIcons[currentStatus] || Package;

    return (
        <div className={cn(
            "rounded-[2.5rem] border p-8 space-y-4 mb-8 relative overflow-hidden group/banner",
            statusConfig.bg, statusConfig.border
        )}>
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 transition-transform duration-1000 group-hover/banner:scale-110 group-hover/banner:rotate-0">
                <StatusIcon size={120} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <StatusIcon className={cn("h-5 w-5", statusConfig.color)} />
                    <h2 className={cn("text-xs font-black uppercase tracking-[0.2em]", statusConfig.color)}>
                        Estado del Pedido: {statusConfig.label}
                    </h2>
                </div>
            </div>

            <p className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                {paymentView.headline}
            </p>

            <div className="relative z-10 p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
                <p className={cn(
                    'text-[10px] font-bold leading-relaxed uppercase tracking-wider',
                    paymentView.paymentTone === 'success'
                        ? 'text-herbal-500'
                        : paymentView.paymentTone === 'danger'
                            ? 'text-red-400'
                            : paymentView.paymentTone === 'neutral'
                                ? 'text-accent-primary'
                                : 'text-yellow-400',
                )}>
                    Estado de pago:
                </p>
                <p className="mt-2 text-[10px] font-bold text-theme-tertiary leading-relaxed uppercase tracking-wider">
                    {paymentView.detail}
                </p>
                {freshnessView.isFreshnessSensitive && (
                    <p className="mt-3 text-[10px] font-bold text-yellow-400/70 leading-relaxed uppercase tracking-wider italic">
                        {freshnessView.freshnessNote}
                    </p>
                )}
            </div>
        </div>
    );
}
