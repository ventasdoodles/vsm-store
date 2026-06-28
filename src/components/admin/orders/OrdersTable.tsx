import { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import { ChevronDown, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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

interface TableMetaType {
    updatingId?: string;
    handleStatusChange: (order: AdminOrder, newStatus: string) => void;
    onSelect: (id: string, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    allSelected: boolean;
    someSelected: boolean;
}

const columnHelper = createColumnHelper<AdminOrder>();

const columns = [
    columnHelper.display({
        id: 'select',
        header: ({ table }) => {
            const meta = table.options.meta as TableMetaType;
            return (
                <input
                    type="checkbox"
                    checked={meta.allSelected}
                    ref={el => { if (el) el.indeterminate = meta.someSelected; }}
                    onChange={e => meta.onSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-primary cursor-pointer"
                />
            );
        },
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMetaType;
            return (
                <div onClick={e => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={e => meta.onSelect(row.original.id, e.target.checked)}
                        className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent-primary cursor-pointer"
                    />
                </div>
            );
        }
    }),
    columnHelper.display({
        id: 'id',
        header: 'Pedido',
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold text-accent-primary/80">
                #{row.original.id.slice(-6).toUpperCase()}
            </span>
        )
    }),
    columnHelper.accessor('customer_name', {
        header: ({ column }) => (
            <button
                onClick={column.getToggleSortingHandler()}
                className="flex items-center gap-1 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
                Cliente
                {{
                    asc: <ArrowUp className="h-3 w-3" />,
                    desc: <ArrowDown className="h-3 w-3" />,
                }[column.getIsSorted() as string] ?? <ArrowUpDown className="h-3 w-3 opacity-50" />}
            </button>
        ),
        cell: ({ row }) => (
            <div>
                <p className="font-bold text-theme-primary text-xs truncate max-w-[140px]">
                    {row.original.customer_name || 'Sin nombre'}
                </p>
                {row.original.customer_phone && (
                    <p className="text-[10px] text-theme-secondary/50 mt-0.5 font-mono">
                        {row.original.customer_phone}
                    </p>
                )}
            </div>
        )
    }),
    columnHelper.accessor('payment_method', {
        header: 'Pago',
        cell: ({ row }) => (
            <span className={cn(
                'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold capitalize border',
                row.original.payment_status === 'paid'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
            )}>
                {row.original.payment_method === 'transfer' ? 'Trans.' : (row.original.payment_method || 'N/A')}
            </span>
        )
    }),
    columnHelper.accessor('total', {
        header: ({ column }) => (
            <button
                onClick={column.getToggleSortingHandler()}
                className="flex items-center gap-1 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
                Total
                {{
                    asc: <ArrowUp className="h-3 w-3" />,
                    desc: <ArrowDown className="h-3 w-3" />,
                }[column.getIsSorted() as string] ?? <ArrowUpDown className="h-3 w-3 opacity-50" />}
            </button>
        ),
        cell: ({ getValue }) => (
            <span className="font-black text-theme-primary text-sm">
                {formatPrice(getValue() ?? 0)}
            </span>
        )
    }),
    columnHelper.accessor('status', {
        header: 'Estado',
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMetaType;
            const statusInfo = ADMIN_ORDER_STATUSES_LIST.find(s => s.value === row.original.status);
            const isUpdating = meta.updatingId === row.original.id;

            return (
                <div onClick={e => e.stopPropagation()}>
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent-primary" />
                    ) : (
                        <div className="relative inline-flex items-center">
                            <div
                                className={cn("h-2 w-2 rounded-full shrink-0 absolute left-2.5 z-10 pointer-events-none", getSolidBackgroundClass(statusInfo?.color))}
                            />
                            <select
                                value={row.original.status}
                                onChange={e => meta.handleStatusChange(row.original, e.target.value)}
                                className={cn("appearance-none rounded-lg border border-white/10 bg-[#1a1c29] pl-7 pr-6 py-1.5 text-xs font-bold text-theme-primary focus:outline-none focus:border-accent-primary/40 cursor-pointer transition-colors hover:border-white/20 border-l-[2px]", getBorderHighlightClass(statusInfo?.color))}
                            >
                                {ADMIN_ORDER_STATUSES_LIST.map(s => {
                                    const isCurrent = s.value === row.original.status;
                                    const allowed = canTransitionTo(row.original.status as AdminOrderStatus, s.value as AdminOrderStatus);
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
                </div>
            );
        }
    }),
    columnHelper.accessor('created_at', {
        header: ({ column }) => (
            <button
                onClick={column.getToggleSortingHandler()}
                className="flex items-center gap-1 uppercase tracking-[0.2em] hover:text-white transition-colors"
            >
                Fecha
                {{
                    asc: <ArrowUp className="h-3 w-3" />,
                    desc: <ArrowDown className="h-3 w-3" />,
                }[column.getIsSorted() as string] ?? <ArrowUpDown className="h-3 w-3 opacity-50" />}
            </button>
        ),
        cell: ({ getValue }) => (
            <span className="text-[11px] text-theme-secondary/50 font-mono tabular-nums">
                {new Date(getValue() as string).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: '2-digit',
                })}
            </span>
        )
    }),
    columnHelper.display({
        id: 'actions',
        header: '',
        cell: () => (
            <ChevronDown className="h-4 w-4 -rotate-90 text-theme-secondary/20 group-hover:text-theme-secondary/60 transition-colors" />
        )
    })
];

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
    const [sorting, setSorting] = useState<SortingState>([]);
    const allSelected = orders.length > 0 && orders.every(o => selectedIds.includes(o.id));
    const someSelected = orders.some(o => selectedIds.includes(o.id)) && !allSelected;

    const rowSelection = useMemo(() => {
        const sel: Record<string, boolean> = {};
        orders.forEach((o) => {
            if (selectedIds.includes(o.id)) {
                sel[o.id] = true;
            }
        });
        return sel;
    }, [orders, selectedIds]);

    const handleStatusChange = (order: AdminOrder, newStatus: string) => {
        if (newStatus === order.status) return;
        if (!canTransitionTo(order.status as AdminOrderStatus, newStatus as AdminOrderStatus)) {
            notify.error('Transición inválida', `No se puede pasar de "${order.status}" a "${newStatus}".`);
            return;
        }
        onStatusChange(order.id, newStatus as OrderStatus);
    };

    const table = useReactTable({
        data: orders,
        columns,
        state: {
            sorting,
            rowSelection,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: row => row.id,
        meta: {
            updatingId,
            handleStatusChange,
            onSelect,
            onSelectAll,
            allSelected,
            someSelected,
        } as TableMetaType,
    });

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
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-white/5 bg-white/[0.02]">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className={cn(
                                            "px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-theme-secondary/50",
                                            header.column.id === 'select' && "w-10",
                                            header.column.id === 'payment_method' && "hidden lg:table-cell",
                                            header.column.id === 'created_at' && "hidden md:table-cell",
                                            header.column.id === 'actions' && "w-8"
                                        )}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                onClick={() => onOrderClick(row.original)}
                                className={cn(
                                    'group cursor-pointer transition-colors hover:bg-white/[0.03]',
                                    row.getIsSelected() && 'bg-accent-primary/5'
                                )}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td 
                                        key={cell.id} 
                                        className={cn(
                                            "px-4 py-3",
                                            cell.column.id === 'payment_method' && "hidden lg:table-cell",
                                            cell.column.id === 'created_at' && "hidden md:table-cell"
                                        )}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
