/**
 * // ─── COMPONENTE: RecentOrders ───
 * // Arquitectura: Dumb Component (Visual Flex List)
 * // Proposito principal: Tabla preview de los ultimos pedidos procesados, sirviendo como puente a AdminOrders.
 * // Regla / Notas: Remueve anidacion y elimina etiquetas <table> anticuadas, favoreciendo tarjetas ligeras Flex (iguales a OrderListCard).
 */
import { useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Package, ArrowRight, ChevronRight } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    createColumnHelper,
    flexRender,
} from '@tanstack/react-table';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUSES, type AdminOrder } from '@/services/admin';

interface RecentOrdersProps {
    orders: AdminOrder[];
}

const columnHelper = createColumnHelper<AdminOrder>();

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
    const navigate = useNavigate();

    const columns = useMemo(() => [
        columnHelper.accessor('id', {
            header: 'ID / Status',
            cell: ({ row }) => {
                const order = row.original;
                const statusInfo = ORDER_STATUSES.find(s => s.value === order.status);
                return (
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-accent-primary/80 tracking-widest">
                            #{order.id?.slice(-6).toUpperCase()}
                        </span>
                        <span
                            className="inline-flex items-center rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-[0.15em] backdrop-blur-md shadow-lg transition-transform group-hover:scale-105"
                            style={{
                                backgroundColor: `${statusInfo?.color}22`,
                                color: statusInfo?.color,
                                border: `1px solid ${statusInfo?.color}44`,
                                boxShadow: `0 0 15px ${statusInfo?.color}15`
                            }}
                        >
                            <div
                                className="mr-1.5 h-1 w-1 rounded-full animate-pulse"
                                style={{ backgroundColor: statusInfo?.color }}
                            />
                            {statusInfo?.label ?? order.status}
                        </span>
                    </div>
                );
            }
        }),
        columnHelper.accessor('customer_name', {
            header: 'Cliente',
            cell: ({ getValue }) => (
                <p className="text-sm font-black text-white truncate drop-shadow-sm group-hover:text-accent-primary transition-colors">
                    {getValue() || 'Sin nombre'}
                </p>
            )
        }),
        columnHelper.accessor('total', {
            header: 'Total',
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="text-right shrink-0">
                        <p className="text-sm font-black text-white drop-shadow-sm">
                            {formatPrice(order.total ?? 0)}
                        </p>
                        <p className="text-[11px] font-medium text-theme-secondary mt-0.5">
                            {new Date(order.created_at).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: () => (
                <div className="shrink-0 flex items-center justify-center pl-2">
                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accent-primary/20 transition-colors">
                        <ChevronRight className="h-4 w-4 text-theme-secondary/50 group-hover:text-accent-primary transition-colors group-hover:translate-x-0.5" />
                    </div>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="w-full space-y-4 mt-8">
            {/* Header del Bloque (Flotante, desanidado) */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1.5 rounded-full bg-accent-primary" />
                    <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md">
                        Pedidos Recientes
                    </h2>
                </div>
                <Link
                    to={"/admin/orders" as any}
                    className="group flex items-center gap-2 text-xs font-bold text-accent-primary hover:text-white transition-colors bg-accent-primary/10 hover:bg-accent-primary/20 px-4 py-2 rounded-[1rem] hover:shadow-lg hover:shadow-accent-primary/5"
                >
                    Ver todos
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Listado de Pedidos en Formato Tarjeta usando TanStack Table */}
            {table.getRowModel().rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-[1.5rem] border border-white/5 bg-[#13141f]/70 backdrop-blur-md">
                    <Package className="h-12 w-12 text-theme-secondary/30 mb-4" />
                    <p className="text-sm font-medium text-theme-secondary">No hay pedidos recientes aun</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {table.getRowModel().rows.map(row => {
                        const order = row.original;
                        return (
                            <div
                                key={row.id}
                                onClick={() => navigate({ to: `/admin/orders?id=${order.id}` as any })}
                                className="group flex w-full items-center gap-4 px-6 py-5 text-left transition-all duration-300 rounded-[1.5rem] border border-white/5 bg-black/20 hover:border-white/10 hover:bg-black/40 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <div className="flex-1 min-w-0">
                                    {flexRender(
                                        row.getVisibleCells().find(c => c.column.id === 'id')?.column.columnDef.cell,
                                        row.getVisibleCells().find(c => c.column.id === 'id')!.getContext()
                                    )}
                                    {flexRender(
                                        row.getVisibleCells().find(c => c.column.id === 'customer_name')?.column.columnDef.cell,
                                        row.getVisibleCells().find(c => c.column.id === 'customer_name')!.getContext()
                                    )}
                                </div>
                                {flexRender(
                                    row.getVisibleCells().find(c => c.column.id === 'total')?.column.columnDef.cell,
                                    row.getVisibleCells().find(c => c.column.id === 'total')!.getContext()
                                )}
                                {flexRender(
                                    row.getVisibleCells().find(c => c.column.id === 'actions')?.column.columnDef.cell,
                                    row.getVisibleCells().find(c => c.column.id === 'actions')!.getContext()
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
