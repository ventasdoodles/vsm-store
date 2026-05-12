/**
 * // ─── HOOK: useAdminOrders ─── [Wave 90 - Admin Refactoring]
 * // Propósito: Centralizar gestión logística de pedidos.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllOrders, 
    updateOrderStatus, 
    updateOrderPaymentStatus,
    updateOrderTracking, 
    exportOrdersToCSV,
    cancelAdminOrder,

    type OrderStatus,
    type AdminOrder 
} from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import { useAdminTactical } from './useAdminTactical';

export function useAdminOrders() {
    const queryClient = useQueryClient();
    const notify = useNotification();
    const { triggerSensory } = useAdminTactical();
    
    const [viewMode, setViewMode] = useState<'list' | 'board' | 'table'>('list');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['admin', 'orders', statusFilter],
        queryFn: () => getAllOrders(statusFilter || undefined),
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'recent-orders'] });
    };

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
        onSuccess: () => {
            invalidate();
            notify.success('Actualizado', 'Estado del pedido actualizado');
            triggerSensory('click-subtle');
        }
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => updateOrderPaymentStatus(id, status),
        onSuccess: () => {
            invalidate();
            notify.success('Caja Sincronizada', 'Estado de pago actualizado');
            triggerSensory('click-heavy');
        }
    });

    const updateTrackingMutation = useMutation({
        mutationFn: ({ id, tracking }: { id: string; tracking: string }) => updateOrderTracking(id, tracking),
        onSuccess: () => {
            invalidate();
            notify.success('Guardado', 'Número de guía actualizado');
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: ({ id, reason, currentNotes }: { id: string; reason: string; currentNotes: string | null }) => cancelAdminOrder(id, reason, currentNotes),
        onSuccess: () => {
            invalidate();
            notify.success('Pedido Cancelado', 'El pedido y sus beneficios fueron revertidos.');
            triggerSensory('click-heavy');
        },
        onError: (err: Error) => {
            notify.error('Error al cancelar', err.message);
        }
    });

    const bulkUpdateStatusMutation = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
            Promise.all(ids.map(id => updateOrderStatus(id, status))),
        onSuccess: () => {
            invalidate();
            notify.success('Actualizado', `${selectedIds.length} pedidos actualizados`);
            setSelectedIds([]);
        }
    });

    const filtered = useMemo(() => {
        let res = orders;
        if (search.trim()) {
            const q = search.toLowerCase();
            res = res.filter((o: AdminOrder) =>
                o.id?.toLowerCase().includes(q) ||
                o.customer_name?.toLowerCase().includes(q) ||
                o.customer_phone?.toLowerCase().includes(q)
            );
        }
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

    return {
        orders: filtered,
        rawOrders: orders,
        isLoading,
        viewMode,
        statusFilter,
        search,
        page,
        dateRange,
        selectedIds,
        selectedOrderId,

        setViewMode,
        setStatusFilter,
        setSearch,
        setPage,
        setDateRange,
        setSelectedIds,
        setSelectedOrderId,

        handleStatusChange: (id: string, status: OrderStatus) => updateStatusMutation.mutate({ id, status }),
        handlePaymentStatusChange: (id: string, status: string) => updatePaymentStatusMutation.mutate({ id, status }),
        handleTrackingChange: (id: string, tracking: string) => updateTrackingMutation.mutate({ id, tracking }),
        handleCancelOrder: (id: string, reason: string, currentNotes: string | null) => cancelOrderMutation.mutate({ id, reason, currentNotes }),
        bulkUpdateStatus: (status: OrderStatus) => bulkUpdateStatusMutation.mutate({ ids: selectedIds, status }),
        handleExport: () => exportOrdersToCSV(filtered),

        isUpdatingStatus: updateStatusMutation.isPending,
        isUpdatingTracking: updateTrackingMutation.isPending,
        isBulkUpdating: bulkUpdateStatusMutation.isPending,
        isCancelling: cancelOrderMutation.isPending,
        updatingId: updateStatusMutation.variables?.id
    };
}
