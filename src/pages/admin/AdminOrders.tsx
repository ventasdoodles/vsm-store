// Gestión de Pedidos (Admin) - VSM Store
// Arquitectura de Legos + Superpoderes (Exportación, Kanban)
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList } from 'lucide-react';
import {
    getAllOrders,
    updateOrderStatus,
    updateOrderTracking,
    type OrderStatus,
    type AdminOrder,
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import { Pagination, paginateItems } from '@/components/admin/Pagination';

// Importar Legos
import { OrdersHeader } from '@/components/admin/orders/OrdersHeader';
import { OrdersFilter } from '@/components/admin/orders/OrdersFilter';
import { OrderListCard } from '@/components/admin/orders/OrderListCard';
import { OrdersKanbanBoard } from '@/components/admin/orders/OrdersKanbanBoard';
import { OrderDetailDrawer } from '@/components/admin/orders/OrderDetailDrawer';

const PAGE_SIZE = 10;

export function AdminOrders() {
    const queryClient = useQueryClient();
    const notify = useNotification();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    
    // Estado para el Drawer
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
            notify.error('Error', 'No se pudo actualizar el status del pedido.');
        },
    });

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        updateStatusMutation.mutate({ id: orderId, status: newStatus });
    };

    // Mutation: Update Tracking
    const updateTrackingMutation = useMutation({
        mutationFn: ({ id, tracking }: { id: string; tracking: string }) =>
            updateOrderTracking(id, tracking),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        },
        onError: (err) => {
            console.error('Error updating tracking:', err);
            notify.error('Error', 'No se pudo guardar el número de guía.');
        },
    });

    const handleTrackingChange = (orderId: string, tracking: string) => {
        updateTrackingMutation.mutate({ id: orderId, tracking });
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

    // Superpoder: Exportar a CSV
    const handleExport = () => {
        if (!filtered.length) return;
        
        const csvContent = [
            ['ID Pedido', 'Cliente', 'Telefono', 'Total', 'Status', 'Fecha', 'Metodo Pago', 'Metodo Envio'],
            ...filtered.map((o: AdminOrder) => [
                o.id,
                o.customer_name || 'Sin nombre',
                o.customer_phone || 'Sin telefono',
                o.total,
                o.status,
                new Date(o.created_at).toLocaleString(),
                o.payment_method || '',
                o.delivery_method || ''
            ]),
        ].map(e => e.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `vsm_pedidos_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-5 pb-20">
            {/* Lego: Header con Buscador, Filtros y Exportación */}
            <OrdersHeader 
                totalOrders={filtered.length}
                search={search}
                setSearch={(val) => { setSearch(val); setPage(1); }}
                dateRange={dateRange}
                setDateRange={setDateRange}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onExport={handleExport}
            />

            {/* Lego: Filtro de Status (Solo en vista de lista) */}
            {viewMode === 'list' && (
                <OrdersFilter 
                    statusFilter={statusFilter}
                    setStatusFilter={(val) => { setStatusFilter(val); setPage(1); }}
                />
            )}

            {/* Content Switcher */}
            {viewMode === 'board' ? (
                <OrdersKanbanBoard 
                    orders={filtered} 
                    onStatusChange={handleStatusChange} 
                    onOrderClick={(order) => setSelectedOrderId(order.id)}
                />
            ) : isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-theme-secondary/30" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-16">
                    <ClipboardList className="h-12 w-12 text-theme-secondary/30 mb-3" />
                    <p className="text-sm font-bold text-theme-secondary/50">
                        No hay pedidos{statusFilter ? ` con status "${statusFilter}"` : ''}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {paginated.map((order: AdminOrder) => (
                            <OrderListCard
                                key={order.id}
                                order={order}
                                isUpdating={updateStatusMutation.isPending && updateStatusMutation.variables?.id === order.id}
                                onStatusChange={handleStatusChange}
                                onTrackingChange={handleTrackingChange}
                                onOrderClick={() => setSelectedOrderId(order.id)}
                            />
                        ))}
                    </div>
                    {filtered.length > PAGE_SIZE && (
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={(p) => setPage(p)}
                            itemsLabel={`${startItem}-${endItem} de ${filtered.length}`}
                        />
                    )}
                </>
            )}

            {/* Modal/Drawer de Detalles de la Orden */}
            <OrderDetailDrawer
                order={orders.find((o: AdminOrder) => o.id === selectedOrderId) || null}
                isOpen={!!selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onStatusChange={handleStatusChange}
                onTrackingUpdate={handleTrackingChange}
            />
        </div>
    );
}
