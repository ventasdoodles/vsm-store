// ─── GESTIÓN LOGÍSTICA (ADMIN) ──────────────────────────────────────────────────────────
// Orquestador principal del módulo de pedidos.
// Implementa arquitectura de legos, delegando UI a subcomponentes:
// 1. OrdersHeader: Cabecera con controles globales y exportación.
// 2. OrdersFilter: Botonera de filtrado rápido por status.
// 3. OrdersKanbanBoard: Vista visual drag-and-drop / tableros.
// 4. OrderListCard: Vista compacta de tarjeta expandible.
// 5. OrderDetailDrawer: Panel lateral con info completa (God Mode).
//
// Superpoderes incluidos:
// - Búsqueda en tiempo real (ID, teléfono, nombre)
// - Filtrado por rango de fechas y status
// - Exportación a CSV formateada
// - Modo de vista Dual (Lista / Kanban)
// ────────────────────────────────────────────────────────────────────────────────────────

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
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';

const PAGE_SIZE = 10;

export function AdminOrders() {
    const queryClient = useQueryClient();
    const notify = useNotification();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

    const handleSelect = (id: string, selected: boolean) => {
        setSelectedIds(prev =>
            selected ? [...prev, id] : prev.filter(x => x !== id)
        );
    };

    const bulkUpdateStatusMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
            Promise.all(ids.map(id => updateOrderStatus(id, status))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
            notify.success('Actualizado', `${selectedIds.length} pedidos actualizados`);
            setSelectedIds([]);
        },
        onError: () => notify.error('Error', 'No se pudieron actualizar los pedidos'),
    });

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
        link.setAttribute('download', `vsm_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-6">
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

            <div className="space-y-6 sm:space-y-8">
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
                    <AdminEmptyState
                        icon={ClipboardList}
                        title="No hay pedidos"
                        description={statusFilter ? `No se encontraron resultados con status "${statusFilter}"` : 'Todavía no hay pedidos registrados en el sistema.'}
                    />
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginated.map((order: AdminOrder) => (
                                <OrderListCard
                                    key={order.id}
                                    order={order}
                                    isSelected={selectedIds.includes(order.id)}
                                    onSelect={handleSelect}
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
            </div>

            {/* Modal/Drawer de Detalles de la Orden */}
            <OrderDetailDrawer
                order={orders.find((o: AdminOrder) => o.id === selectedOrderId) || null}
                isOpen={!!selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
                onStatusChange={handleStatusChange}
                onTrackingUpdate={handleTrackingChange}
            />

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-4 rounded-[2rem] border border-accent-primary/30 bg-[#13141f]/90 px-6 py-3 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.15)]">
                        <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-[10px] font-black text-white">
                                {selectedIds.length}
                            </div>
                            <span className="text-xs font-bold text-white/70">Pedidos</span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto max-w-[50vw] no-scrollbar">
                            {['pending', 'processing', 'shipped', 'delivered'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => bulkUpdateStatusMutation.mutate({ ids: selectedIds, status: st as OrderStatus })}
                                    disabled={bulkUpdateStatusMutation.isPending}
                                    className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-accent-primary/20 hover:text-accent-primary transition-all whitespace-nowrap"
                                >
                                    {st === 'pending' ? 'Pendiente' : 
                                     st === 'processing' ? 'Preparando' : 
                                     st === 'shipped' ? 'Enviado' : 'Entregado'}
                                </button>
                            ))}
                            <button
                                onClick={() => setSelectedIds([])}
                                className="ml-2 text-xs font-bold text-white/30 hover:text-white/60 transition-colors px-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
