// Gestión de Pedidos (Admin) - VSM Store
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ClipboardList,
    ChevronDown,
    ChevronUp,
    MapPin,
    Phone,
    User,
    Loader2,
    Search,
    KanbanSquare,
    List,
    Calendar,
    CreditCard
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import {
    getAllOrders,
    updateOrderStatus,
    ORDER_STATUSES,
    type OrderStatus,
    type AdminOrder,
    type OrderItem
} from '@/services/admin.service';
import { Pagination, paginateItems } from '@/components/admin/Pagination';


const PAGE_SIZE = 10;

export function AdminOrders() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Query: All Orders
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin', 'orders', statusFilter],
        queryFn: () => getAllOrders(statusFilter || undefined),
    });

    // Mutation: Update Status
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
            updateOrderStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }); // Refresh dashboard stats too
            queryClient.invalidateQueries({ queryKey: ['admin', 'recent-orders'] });
        },
        onError: (err) => {
            console.error('Error updating status:', err);
            alert('Error al actualizar el status');
        },
    });

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateStatusMutation.mutate({ id: orderId, status: newStatus });
    };

    const filtered = useMemo(() => {
        let res = orders;

        // Text Search
        if (search.trim()) {
            const q = search.toLowerCase();
            res = res.filter((o: AdminOrder) =>
                o.id?.toLowerCase().includes(q) ||
                o.customer_name?.toLowerCase().includes(q) ||
                o.customer_phone?.toLowerCase().includes(q)
            );
        }

        // Date Filter
        if (dateRange.start && dateRange.end) {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59);
            res = res.filter((o: AdminOrder) => {
                const d = new Date(o.created_at);
                return d >= start && d <= end;
            });
        }

        return res;
    }, [orders, search, dateRange]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Pedidos</h1>
                    <p className="text-sm text-primary-500">{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full rounded-xl border border-primary-800/50 bg-primary-900/60 py-2.5 pl-10 pr-4 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none"
                    />
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                <button
                    onClick={() => { setStatusFilter(''); setPage(1); }}
                    className={cn(
                        'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        !statusFilter ? 'bg-primary-700 text-primary-100' : 'text-primary-500 hover:text-primary-300'
                    )}
                >
                    Todos
                </button>
                {ORDER_STATUSES.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => { setStatusFilter(s.value); setPage(1); }}
                        className={cn(
                            'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                            statusFilter === s.value ? 'text-white' : 'text-primary-500 hover:text-primary-300'
                        )}
                        style={statusFilter === s.value ? { backgroundColor: `${s.color}25`, color: s.color } : undefined}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Filters & Toggle Tool bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Visual View Toggle */}
                <div className="flex items-center gap-1 rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            viewMode === 'list' ? 'bg-primary-700 text-white shadow-sm' : 'text-primary-500 hover:text-primary-300'
                        )}
                        title="Vista de Lista"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={cn(
                            'rounded-lg p-2 transition-colors',
                            viewMode === 'board' ? 'bg-primary-700 text-white shadow-sm' : 'text-primary-500 hover:text-primary-300'
                        )}
                        title="Vista de Tablero"
                    >
                        <KanbanSquare className="h-4 w-4" />
                    </button>
                </div>

                {/* Date Filter & Search (already displayed above, just consolidating logic if needed, but keeping layout) */}
                <div className="flex items-center gap-2 rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <Calendar className="h-3.5 w-3.5 text-primary-500" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-xs font-medium text-primary-200 focus:outline-none [color-scheme:dark]"
                        />
                        <span className="text-primary-600">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-xs font-medium text-primary-200 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                </div>
            </div>

            {/* Status Filter Tabs (Only show in List mode, Board splits by status) */}
            {viewMode === 'list' && (
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                    <button
                        onClick={() => { setStatusFilter(''); setPage(1); }}
                        className={cn(
                            'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                            !statusFilter ? 'bg-primary-700 text-primary-100' : 'text-primary-500 hover:text-primary-300'
                        )}
                    >
                        Todos
                    </button>
                    {ORDER_STATUSES.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => { setStatusFilter(s.value); setPage(1); }}
                            className={cn(
                                'whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                                statusFilter === s.value ? 'text-white' : 'text-primary-500 hover:text-primary-300'
                            )}
                            style={statusFilter === s.value ? { backgroundColor: `${s.color}25`, color: s.color } : undefined}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Switcher */}
            {viewMode === 'board' ? (
                <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
                    {ORDER_STATUSES.map((status) => {
                        const columnOrders = filtered.filter(o => o.status === status.value);
                        return (
                            <div key={status.value} className="flex h-full w-72 min-w-[18rem] flex-col rounded-2xl border border-primary-800/40 bg-primary-900/30">
                                {/* Column Header */}
                                <div className="flex items-center justify-between border-b border-primary-800/40 px-4 py-3 bg-primary-900/50 rounded-t-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                                        <h3 className="text-sm font-semibold text-primary-200">{status.label}</h3>
                                    </div>
                                    <span className="rounded-md bg-primary-800/50 px-2 py-0.5 text-xs font-medium text-primary-400">
                                        {columnOrders.length}
                                    </span>
                                </div>

                                {/* Draggable Area (Scrollable) */}
                                <div className="flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-primary-800 scrollbar-track-transparent">
                                    {columnOrders.map(order => (
                                        <div key={order.id} className="group relative rounded-xl border border-primary-800/50 bg-primary-900/80 p-3 shadow-sm hover:border-primary-700 hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-mono text-[10px] text-primary-500">#{order.id.slice(-6).toUpperCase()}</span>
                                                <span className="text-xs font-bold text-primary-100">{formatPrice(order.total)}</span>
                                            </div>
                                            <div className="mb-2">
                                                <p className="text-xs font-medium text-primary-200 truncate">{order.customer_name || 'Cliente sin nombre'}</p>
                                                <p className="text-[10px] text-primary-500 truncate">{new Date(order.created_at).toLocaleString()}</p>
                                            </div>

                                            {/* Quick Actions / Info */}
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary-800/30">
                                                <div className="flex gap-1">
                                                    {order.payment_method === 'transfer' && <CreditCard className="h-3 w-3 text-amber-400" />}
                                                </div>

                                                {/* Move to next status button (mini) */}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                    className="max-w-[100px] rounded bg-primary-800/50 px-1 py-0.5 text-[10px] text-primary-400 focus:outline-none cursor-pointer hover:bg-primary-700"
                                                >
                                                    {ORDER_STATUSES.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-primary-800/30" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <ClipboardList className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">
                        No hay pedidos{statusFilter ? ` con status "${statusFilter}"` : ''}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {paginated.map((order: AdminOrder) => {
                            const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
                            const isExpanded = expandedId === order.id;
                            const items = order.items ?? [];
                            const isUpdating = updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id;

                            return (
                                <div
                                    key={order.id}
                                    className="rounded-2xl border border-primary-800/40 bg-primary-900/60 overflow-hidden transition-all"
                                >
                                    {/* Order Header */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-primary-800/20 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-primary-500">
                                                    #{order.id?.slice(-6).toUpperCase()}
                                                </span>
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                                                    style={{ backgroundColor: `${statusInfo?.color}15`, color: statusInfo?.color }}
                                                >
                                                    {statusInfo?.label ?? order.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-primary-200 truncate">
                                                {order.customer_name || 'Sin nombre'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-primary-100">{formatPrice(order.total ?? 0)}</p>
                                            <p className="text-[11px] text-primary-500">
                                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-primary-500 shrink-0" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-primary-500 shrink-0" />
                                        )}
                                    </button>

                                    {/* Expanded Detail */}
                                    {isExpanded && (
                                        <div className="border-t border-primary-800/30 px-5 py-4 space-y-4">
                                            {/* Customer Info */}
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                <div className="flex items-center gap-2 text-sm text-primary-400">
                                                    <User className="h-3.5 w-3.5 text-primary-600" />
                                                    {order.customer_name || '—'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-primary-400">
                                                    <Phone className="h-3.5 w-3.5 text-primary-600" />
                                                    {order.customer_phone || '—'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-primary-400">
                                                    <MapPin className="h-3.5 w-3.5 text-primary-600" />
                                                    {order.delivery_address || 'Recoger en tienda'}
                                                </div>
                                            </div>

                                            {/* Items */}
                                            {items.length > 0 && (
                                                <div className="rounded-xl border border-primary-800/30 overflow-hidden">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="border-b border-primary-800/20 bg-primary-950/40">
                                                                <th className="px-3 py-2 text-left font-medium text-primary-500">Producto</th>
                                                                <th className="px-3 py-2 text-center font-medium text-primary-500">Cant.</th>
                                                                <th className="px-3 py-2 text-right font-medium text-primary-500">Precio</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-primary-800/15">
                                                            {items.map((item: OrderItem, i: number) => (
                                                                <tr key={i}>
                                                                    <td className="px-3 py-2 text-primary-300">
                                                                        {item.name || item.product_name || '—'}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-center text-primary-400">{item.quantity}</td>
                                                                    <td className="px-3 py-2 text-right text-primary-300">
                                                                        {formatPrice(item.price * item.quantity)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Status Updater */}
                                            <div className="flex items-center gap-3 pt-2 border-t border-primary-800/20">
                                                <span className="text-xs font-medium text-primary-500">Cambiar status:</span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                    disabled={isUpdating}
                                                    className="rounded-lg border border-primary-800/50 bg-primary-950/60 px-3 py-1.5 text-xs text-primary-200 focus:border-vape-500/50 focus:outline-none disabled:opacity-50"
                                                >
                                                    {ORDER_STATUSES.map((s) => (
                                                        <option key={s.value} value={s.value}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {isUpdating && (
                                                    <span className="flex items-center gap-1 text-[11px] text-vape-400">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Actualizando...
                                                    </span>
                                                )}
                                            </div>

                                            {/* Payment & Delivery Info */}
                                            <div className="flex flex-wrap gap-2 text-[11px]">
                                                {order.payment_method && (
                                                    <span className="rounded-full bg-primary-800/40 px-2.5 py-0.5 text-primary-400">
                                                        Pago: {order.payment_method}
                                                    </span>
                                                )}
                                                {order.delivery_method && (
                                                    <span className="rounded-full bg-primary-800/40 px-2.5 py-0.5 text-primary-400">
                                                        Envío: {order.delivery_method}
                                                    </span>
                                                )}
                                                {order.coupon_code && (
                                                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-amber-400">
                                                        Cupón: {order.coupon_code}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length > PAGE_SIZE && (
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={(p) => setPage(p)}
                            itemsLabel={`${startItem}–${endItem} de ${filtered.length}`}
                        />
                    )}
                </>
            )}
        </div>
    );
}
