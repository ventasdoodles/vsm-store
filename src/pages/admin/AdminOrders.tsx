/**
 * // ─── COMPONENTE: AdminOrders ─── [Wave 90 - Thin Component Refactor]
 */
import { useAdminOrders } from '@/hooks/admin/useAdminOrders';
import { OrdersHeader } from '@/components/admin/orders/OrdersHeader';
import { OrdersFilter } from '@/components/admin/orders/OrdersFilter';
import { OrderListCard } from '@/components/admin/orders/OrderListCard';
import { OrdersKanbanBoard } from '@/components/admin/orders/OrdersKanbanBoard';
import { OrderDetailDrawer } from '@/components/admin/orders/OrderDetailDrawer';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import { ClipboardList } from 'lucide-react';
import type { OrderStatus, AdminOrder } from '@/services/admin';

const PAGE_SIZE = 10;

export function AdminOrders() {
    const admin = useAdminOrders();
    
    // Pagination logic
    const totalPages = Math.max(1, Math.ceil(admin.orders.length / PAGE_SIZE));
    const safePage = Math.min(admin.page, totalPages);
    const paginated = paginateItems(admin.orders, safePage, PAGE_SIZE);
    const startItem = (safePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(safePage * PAGE_SIZE, admin.orders.length);

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-6">
            <OrdersHeader
                totalOrders={admin.orders.length}
                search={admin.search}
                setSearch={(val) => { admin.setSearch(val); admin.setPage(1); }}
                dateRange={admin.dateRange}
                setDateRange={admin.setDateRange}
                viewMode={admin.viewMode}
                setViewMode={admin.setViewMode}
                onExport={admin.handleExport}
            />

            <div className="space-y-6 sm:space-y-8">
                {admin.viewMode === 'list' && (
                    <OrdersFilter
                        statusFilter={admin.statusFilter}
                        setStatusFilter={(val) => { admin.setStatusFilter(val); admin.setPage(1); }}
                    />
                )}

                {admin.viewMode === 'board' ? (
                    <OrdersKanbanBoard
                        orders={admin.orders}
                        onStatusChange={admin.handleStatusChange}
                        onOrderClick={(order) => admin.setSelectedOrderId(order.id)}
                    />
                ) : admin.isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-20 animate-pulse rounded-2xl bg-theme-secondary/30" />
                        ))}
                    </div>
                ) : admin.orders.length === 0 ? (
                    <AdminEmptyState
                        icon={ClipboardList}
                        title="No hay pedidos"
                        description={admin.statusFilter ? `No resultados con status "${admin.statusFilter}"` : 'No hay pedidos registrados.'}
                    />
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginated.map((order: AdminOrder) => (
                                <OrderListCard
                                    key={order.id}
                                    order={order}
                                    isSelected={admin.selectedIds.includes(order.id)}
                                    onSelect={(id, sel) => admin.setSelectedIds(prev => sel ? [...prev, id] : prev.filter(x => x !== id))}
                                    isUpdating={admin.updatingId === order.id}
                                    onStatusChange={admin.handleStatusChange}
                                    onTrackingChange={admin.handleTrackingChange}
                                    onOrderClick={() => admin.setSelectedOrderId(order.id)}
                                />
                            ))}
                        </div>
                        {admin.orders.length > PAGE_SIZE && (
                            <Pagination
                                currentPage={safePage}
                                totalPages={totalPages}
                                onPageChange={admin.setPage}
                                itemsLabel={`${startItem}-${endItem} de ${admin.orders.length}`}
                            />
                        )}
                    </>
                )}
            </div>

            <OrderDetailDrawer
                order={admin.rawOrders.find((o) => o.id === admin.selectedOrderId) || null}
                isOpen={!!admin.selectedOrderId}
                onClose={() => admin.setSelectedOrderId(null)}
                onStatusChange={admin.handleStatusChange}
                onPaymentStatusChange={admin.handlePaymentStatusChange}
                onTrackingUpdate={admin.handleTrackingChange}

            />

            {admin.selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-4 rounded-[2rem] border border-accent-primary/30 bg-[#13141f]/90 px-6 py-3 backdrop-blur-xl shadow-2xl">
                        <span className="text-xs font-bold text-white/70 pr-4 border-r border-white/10">{admin.selectedIds.length} Seleccionados</span>
                        <div className="flex items-center gap-2 overflow-x-auto max-w-[50vw] no-scrollbar">
                            {['pending', 'processing', 'shipped', 'delivered'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => admin.bulkUpdateStatus(st as OrderStatus)}
                                    disabled={admin.isBulkUpdating}
                                    className="btn-vsm-bulk text-white hover:text-accent-primary"
                                >
                                    {st}
                                </button>
                            ))}
                            <button onClick={() => admin.setSelectedIds([])} className="ml-2 text-xs font-bold text-white/30 hover:text-white/60 px-2 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
