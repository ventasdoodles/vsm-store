import { CreditCard } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from '@/services/admin';

interface OrderBoardCardProps {
    order: AdminOrder;
    onStatusChange: (id: string, status: OrderStatus) => void;
    isDragging?: boolean;
}

export function OrderBoardCard({ order, onStatusChange, isDragging }: OrderBoardCardProps) {
    return (
        <div className={`group relative rounded-xl border ${isDragging ? 'border-theme-strong shadow-lg' : 'border-theme'} bg-theme-primary/80 p-3 shadow-sm hover:border-theme-strong hover:shadow-md transition-all cursor-grab active:cursor-grabbing`}>
            <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-theme-secondary">#{order.id.slice(-6).toUpperCase()}</span>
                <span className="text-xs font-bold text-theme-primary">{formatPrice(order.total)}</span>
            </div>
            <div className="mb-2">
                <p className="text-xs font-medium text-theme-primary truncate">{order.customer_name || 'Cliente sin nombre'}</p>
                <p className="text-xs text-theme-secondary truncate">{new Date(order.created_at).toLocaleString()}</p>
            </div>

            {/* Quick Actions / Info */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-theme">
                <div className="flex gap-1" title="Transferencia">
                    {order.payment_method === 'transfer' && <CreditCard className="h-3 w-3 text-amber-400" />}
                </div>

                {/* Move to next status button (mini) */}
                <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className="max-w-[100px] rounded bg-theme-secondary/50 px-1 py-0.5 text-xs text-theme-secondary focus:outline-none cursor-pointer hover:bg-theme-secondary"
                >
                    {ORDER_STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
