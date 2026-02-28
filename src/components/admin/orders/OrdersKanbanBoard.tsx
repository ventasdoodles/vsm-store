import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from '@/services/admin';
import { OrderBoardCard } from './OrderBoardCard';

// Wrapper sortable item para la tarjeta del pedido
interface SortableOrderCardProps {
    order: AdminOrder;
    onStatusChange: (id: string, status: OrderStatus) => void;
    onClick?: (order: AdminOrder) => void;
}

function SortableOrderCard({ order, onStatusChange, onClick }: SortableOrderCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: order.id, data: { ...order } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onClick?.(order)}>
            <OrderBoardCard order={order} onStatusChange={onStatusChange} isDragging={isDragging} />
        </div>
    );
}

// Wrapper para la columna del kanban
interface KanbanColumnProps {
    status: typeof ORDER_STATUSES[0];
    orders: AdminOrder[];
    onStatusChange: (id: string, status: OrderStatus) => void;
    onOrderClick?: (order: AdminOrder) => void;
}

function KanbanColumn({ status, orders, onStatusChange, onOrderClick }: KanbanColumnProps) {
    const orderIds = useMemo(() => orders.map(o => o.id), [orders]);

    return (
        <div className="flex h-full w-72 min-w-[18rem] flex-col rounded-2xl border border-theme/40 bg-theme-primary/30">
            {/* Header de columna */}
            <div className="flex items-center justify-between border-b border-theme/40 px-4 py-3 bg-theme-primary/50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <h3 className="text-sm font-semibold text-theme-primary">{status.label}</h3>
                </div>
                <span className="rounded-md bg-theme-secondary/50 px-2 py-0.5 text-xs font-medium text-theme-secondary">
                    {orders.length}
                </span>
            </div>

            {/* Ãrea arrastrable SortableContext */}
            <SortableContext id={status.value} items={orderIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-3 p-3 overflow-y-auto min-h-[150px] scrollbar-thin scrollbar-thumb-primary-800 scrollbar-track-transparent">
                    {orders.map(order => (
                        <SortableOrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={onStatusChange}
                            onClick={onOrderClick}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

interface OrdersKanbanBoardProps {
    orders: AdminOrder[];
    onStatusChange: (id: string, status: OrderStatus) => void;
    onOrderClick?: (order: AdminOrder) => void;
}

export function OrdersKanbanBoard({ orders: initialOrders, onStatusChange, onOrderClick }: OrdersKanbanBoardProps) {
    // Usamos el estado local para fluidez visual (Optimistic Update en UI)
    const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requiere mover 5px para iniciar el drag (permite clics)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const o = initialOrders.find((ord) => ord.id === active.id);
        if (o) setActiveOrder(o);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveOrder(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Encontrar que elemento se moviÃ³ sobre quÃ© elemento / columna
        const activeOrderData = active.data.current as AdminOrder;
        
        // El destino ("over") puede ser otra tarjeta (entonces tomamos su status) 
        // o directamente el contenedor de la columna (entonces es el id de la columna)
        let newStatus = activeOrderData.status;

        // Si es una columna:
        if (ORDER_STATUSES.some(s => s.value === overId)) {
            newStatus = overId as OrderStatus;
        } else {
            // Si es un item, buscamos su status
            const overOrder = initialOrders.find(o => o.id === overId);
            if (overOrder) {
                newStatus = overOrder.status;
            }
        }

        if (activeOrderData.status !== newStatus) {
            onStatusChange(activeId, newStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-280px)] gap-4 overflow-x-auto pb-4">
                {ORDER_STATUSES.map((status) => {
                    const columnOrders = initialOrders.filter(o => o.status === status.value);
                    return (
                        <KanbanColumn
                            key={status.value}
                            status={status}
                            orders={columnOrders}
                            onStatusChange={onStatusChange}
                            onOrderClick={onOrderClick}
                        />
                    );
                })}
            </div>

            {/* Overlay al arrastrar */}
            <DragOverlay>
                {activeOrder ? (
                    <div className="rotate-2 scale-105 shadow-xl transition-transform cursor-grabbing opacity-90">
                        <OrderBoardCard 
                            order={activeOrder} 
                            onStatusChange={onStatusChange} 
                            isDragging={true}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
