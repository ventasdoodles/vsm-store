import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { type AdminOrder } from '@/services/admin';
import { ADMIN_ORDER_STATUSES_LIST, canTransitionTo, type AdminOrderStatus } from '@/lib/domain/orders';

interface OrderBoardCardProps {
    order: AdminOrder;
    onStatusChange: (id: string, status: AdminOrderStatus) => void;
    isDragging?: boolean;
}

export function OrderBoardCard({ order, onStatusChange, isDragging }: OrderBoardCardProps) {
    const statusInfo = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === order.status);

    return (
        <div className={`rounded-xl border transition-all ${
            isDragging
                ? 'border-white/20 bg-white/[0.08] shadow-2xl scale-[1.02]'
                : 'border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]'
        } p-3 cursor-grab active:cursor-grabbing`}>
            <div className="flex justify-between items-start mb-2.5">
                <span className="font-mono text-[11px] font-bold text-theme-secondary/50">
                    #{order.id.slice(-6).toUpperCase()}
                </span>
                <span className="text-xs font-black text-theme-primary">{formatPrice(order.total)}</span>
            </div>

            <p className="text-xs font-bold text-theme-primary truncate mb-0.5">
                {order.customer_name || 'Sin nombre'}
            </p>
            <p className="text-[11px] text-theme-secondary/50 truncate mb-3">
                {new Date(order.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusInfo?.color }} />
                    {order.payment_method === 'transfer' && (
                        <CreditCard className="h-3 w-3 text-amber-400/70" />
                    )}
                </div>

                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as AdminOrderStatus)}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-[110px] rounded-lg border border-white/10 bg-[#1a1c29] px-1.5 py-1 text-[11px] font-medium text-theme-secondary hover:border-white/20 focus:outline-none cursor-pointer transition-colors"
                >
                    {ADMIN_ORDER_STATUSES_LIST.map(s => (
                        <option
                            key={s.value}
                            value={s.value}
                            disabled={order.status !== s.value && !canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus)}
                            className="bg-[#0d0e12] text-white"
                        >
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
