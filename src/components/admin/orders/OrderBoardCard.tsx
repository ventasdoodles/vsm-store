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
    return (
        <div className={`group relative rounded-xl border ${isDragging ? 'border-white/30 shadow-lg' : 'border-white/10'} bg-[#0F1115]/80 backdrop-blur-xl p-3 shadow-sm hover:border-white/20 transition-all cursor-grab active:cursor-grabbing`}>
            <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-white/50">#{order.id.slice(-6).toUpperCase()}</span>
                <span className="text-xs font-bold text-white/90">{formatPrice(order.total)}</span>
            </div>
            <div className="mb-2">
                <p className="text-xs font-medium text-white/80 truncate">{order.customer_name || 'Cliente sin nombre'}</p>
                <p className="text-xs text-white/40 truncate">{new Date(order.created_at).toLocaleString()}</p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                <div className="flex gap-1" title="Transferencia">
                    {order.payment_method === 'transfer' && <CreditCard className="h-3 w-3 text-amber-400" />}
                </div>

                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as AdminOrderStatus)}
                    className="max-w-[100px] rounded bg-white/5 border border-white/10 px-1 py-0.5 text-xs text-white/70 focus:outline-none cursor-pointer hover:bg-white/10"
                >
                    {ADMIN_ORDER_STATUSES_LIST.map(s => (
                        <option
                            key={s.value}
                            value={s.value}
                            disabled={order.status !== s.value && !canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus)}
                            className="bg-[#0F1115] text-white/80"
                        >
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
