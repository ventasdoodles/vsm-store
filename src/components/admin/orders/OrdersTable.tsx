// ─── COMPONENTE: TABLA COMPACTA DE PEDIDOS ───────────────────────────────────────────
// Vista de tabla HTML densa para gestión logística rápida.
// Permite ver muchos pedidos a la vez con acciones inline de status.
// Clic en fila abre el OrderDetailDrawer para el detalle completo.
// ───────────────────────────────────────────────────────────────────────────────────

import { ChevronDown, Loader2 } from 'lucide-react';
import { getSolidBackgroundClass, getBorderHighlightClass } from '@/utils/theme-mapper';
import { cn, formatPrice } from '@/lib/utils';
import { type AdminOrder, type OrderStatus } from '@/services/admin';
import { ADMIN_ORDER_STATUSES_LIST, canTransitionTo, type AdminOrderStatus } from '@/lib/domain/orders';
import { useNotification } from '@/hooks/useNotification';

interface OrdersTableProps {
    orders: AdminOrder[];
    selectedIds: string[];
    onSelect: (id: string, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onStatusChange: (id: string, status: OrderStatus) => void;
    onOrderClick: (order: AdminOrder) => void;
    updatingId?: string;
}

export function OrdersTable({
    orders,
    selectedIds,
    onSelect,
    onSelectAll,
    onStatusChange,
    onOrderClick,
    updatingId,
}: OrdersTableProps) {
    const notify = useNotification();
    const allSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id));
    const someSelected = orders.some(o => selectedIds.includes(o.id)) && !allSelected;

    const handleStatusChange = (order: AdminOrder, newStatus: string) => {
        if (newStatus === order.status) return;
        if (!canTransitionTo(order.status as AdminOrderStatus, newStatus as AdminOrderStatus)) {
            notify.error('Transición inválida', `No se puede pasar de "${order.status}" a "${newStatus}".`);
            return;
        }
        onStatusChange(order.id, newStatus as OrderStatus);
    };

    if (orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 rounded-2xl border border-dashed border-white/10 text-sm text-theme-secondary/40 font-medium">
                No hay pedidos que mostrar
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-[#13141f]/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="w-10 px-4 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={el => { if (el) el.indeterminate = someSelected; }}
                                    onChange={e => onSelectAll(e.target.checked)}
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-primary cursor-pointer"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50">
                                Pedido
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50">
                                Cliente
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50 hidden lg:table-cell">
                                Pago
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50">
                                Total
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50 hidden md:table-cell">
                                Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50 w-8">
                                &nbsp;
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {orders.map(order => {
                            const statusInfo = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === order.status);
                            const isUpdating = updatingId === order.id;
                            const isSelected = selectedIds.includes(order.id);

                            return (
                                <tr
                                    key={order.id}
                                    onClick={() => onOrderClick(order)}
                                    className={cn(
                                        'group cursor-pointer transition-colors hover:bg-white/[0.03]',
                                        isSelected && 'bg-accent-primary/5'
                                    )}
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={e => onSelect(order.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-primary cursor-pointer"
                                        />
                                    </td>

                                    {/* ID */}
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-bold text-accent-primary/80">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </span>
                                    </td>

                                    {/* Cliente */}
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-bold text-theme-primary text-xs truncate max-w-[140px]">
                                                {order.customer_name || 'Sin nombre'}
                                            </p>
                                            {order.customer_phone && (
                                                <p className="text-[10px] text-theme-secondary/50 mt-0.5 font-mono">
                                                    {order.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    {/* Método de pago */}
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className={cn(
                                            'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize border',
                                            order.payment_status === 'paid'
                                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                                : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                                        )}>
                                            {order.payment_method === 'transfer' ? 'Trans.' : (order.payment_method || 'N/A')}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="px-4 py-3">
                                        <span className="font-black text-theme-primary text-sm">
                                            {formatPrice(order.total)}
                                        </span>
                                    </td>

                                    {/* Status selector */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        {isUpdating ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
                                        ) : (
                                            <div className="relative inline-flex items-center">
                                                <div
                                                    className={cn("h-2 w-2 rounded-full shrink-0 absolute left-2.5 z-10 pointer-events-none", getSolidBackgroundClass(statusInfo?.color))}
                                                />
                                                <select
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order, e.target.value)}
                                                    className={cn("appearance-none rounded-lg border border-white/10 bg-[#1a1c29] pl-7 pr-6 py-1.5 text-xs font-bold text-theme-primary focus:outline-none focus:border-accent-primary/40 cursor-pointer transition-colors hover:border-white/20 border-l-[2px]", getBorderHighlightClass(statusInfo?.color))}
                                                >
                                                    {ADMIN_ORDER_STATUSES_LIST.map(s => {
                                                        const isCurrent = s.value === order.status;
                                                        const allowed = canTransitionTo(order.status as AdminOrderStatus, s.value as AdminOrderStatus);
                                                        return (
                                                            <option
                                                                key={s.value}
                                                                value={s.value}
                                                                disabled={!isCurrent && !allowed}
                                                                className="bg-[#0d0e12] text-white"
                                                            >
                                                                {s.label}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-theme-secondary/40 pointer-events-none" />
                                            </div>
                                        )}
                                    </td>

                                    {/* Fecha */}
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-[11px] text-theme-secondary/50 font-mono tabular-nums">
                                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: '2-digit',
                                            })}
                                        </span>
                                    </td>

                                    {/* Ver detalles chevron */}
                                    <td className="px-4 py-3">
                                        <ChevronDown className="h-4 w-4 -rotate-90 text-theme-secondary/20 group-hover:text-theme-secondary/60 transition-colors" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
