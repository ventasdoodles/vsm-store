// ─── COMPONENTE: TABLERO KANBAN DE PEDIDOS ──────────────────────────────────────────
// Representación visual estilo Trello para la gestión del flujo de preparación.
// Interfaz Drag & Drop implementada con @dnd-kit/core.
// Valida soltados ilegales usando las reglas de dominio (canTransitionTo) para 
// evitar brincos no lógicos (ej: de Pendiente a Entregado directamente).
// Mantiene estética premium mediante transparencias en la tarjeta (backdrop-blur).
// ───────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type AdminOrder, type OrderStatus } from '@/services/admin';
import { ADMIN_ORDER_STATUSES_LIST, canTransitionTo, type AdminOrderStatus } from '@/lib/domain/orders';
import { OrderBoardCard } from './OrderBoardCard';
import { useNotification } from '@/hooks/useNotification';

// ─── Sortable wrapper ────────────────────────────────────────────────────────
interface SortableOrderCardProps {
    order: AdminOrder;
    onStatusChange: (id: string, status: AdminOrderStatus) => void;
    onClick?: (order: AdminOrder) => void;
}

function SortableOrderCard({ order, onStatusChange, onClick }: SortableOrderCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: order.id,
        data: { ...order },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(order)}
        >
            <OrderBoardCard order={order} onStatusChange={onStatusChange} isDragging={isDragging} />
        </div>
    );
}

// ─── Kanban Column ───────────────────────────────────────────────────────────
interface KanbanColumnProps {
    status: typeof ADMIN_ORDER_STATUSES_LIST[0];
    orders: AdminOrder[];
    onStatusChange: (id: string, status: AdminOrderStatus) => void;
    onOrderClick?: (order: AdminOrder) => void;
}

function KanbanColumn({ status, orders, onStatusChange, onOrderClick }: KanbanColumnProps) {
    const orderIds = useMemo(() => orders.map(o => o.id), [orders]);

    return (
        <div className="flex h-full w-72 min-w-[18rem] flex-col rounded-[1.5rem] border border-white/5 bg-[#181825]/40 backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-5 py-4 rounded-t-[1.5rem] relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: status.color, boxShadow: `0 0 10px ${status.color}80` }} />
                    <h3 className="text-sm font-black text-theme-primary tracking-wide">{status.label}</h3>
                </div>
                <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2 py-0.5 text-xs font-bold text-theme-secondary/60">
                    {orders.length}
                </span>
            </div>

            {/* Sortable area */}
            <SortableContext id={status.value} items={orderIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2 p-3 overflow-y-auto min-h-[150px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {orders.map(order => (
                        <SortableOrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={onStatusChange}
                            onClick={onOrderClick}
                        />
                    ))}
                    {orders.length === 0 && (
                        <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-white/[0.06] text-[11px] text-theme-secondary/30 font-medium">
                            Sin pedidos
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

// ─── Main Board ──────────────────────────────────────────────────────────────
interface OrdersKanbanBoardProps {
    orders: AdminOrder[];
    onStatusChange: (id: string, status: OrderStatus) => void;
    onOrderClick?: (order: AdminOrder) => void;
}

export function OrdersKanbanBoard({ orders, onStatusChange, onOrderClick }: OrdersKanbanBoardProps) {
    const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);
    const notify = useNotification();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const o = orders.find(ord => ord.id === event.active.id);
        if (o) setActiveOrder(o);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveOrder(null);
        if (!over) return;

        const activeData = active.data.current as AdminOrder;
        let newStatus = activeData.status as AdminOrderStatus;

        if (ADMIN_ORDER_STATUSES_LIST.some(s => s.value === over.id)) {
            newStatus = over.id as AdminOrderStatus;
        } else {
            const overOrder = orders.find(o => o.id === over.id);
            if (overOrder) newStatus = overOrder.status as AdminOrderStatus;
        }

        if (activeData.status === newStatus) return;

        if (!canTransitionTo(activeData.status as AdminOrderStatus, newStatus)) {
            notify.error('Transición no permitida', `No se puede mover de "${activeData.status}" a "${newStatus}" directamente.`);
            return;
        }

        onStatusChange(active.id as string, newStatus as OrderStatus);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
                {ADMIN_ORDER_STATUSES_LIST.map(status => (
                    <KanbanColumn
                        key={status.value}
                        status={status}
                        orders={orders.filter(o => o.status === status.value)}
                        onStatusChange={onStatusChange as (id: string, status: AdminOrderStatus) => void}
                        onOrderClick={onOrderClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeOrder ? (
                    <div className="rotate-1 scale-105 cursor-grabbing opacity-90">
                        <OrderBoardCard
                            order={activeOrder}
                            onStatusChange={onStatusChange as (id: string, status: AdminOrderStatus) => void}
                            isDragging
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
