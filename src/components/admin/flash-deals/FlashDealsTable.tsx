/**
 * // ─── COMPONENTE: FlashDealsTable ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Tabla glassmorphism de ofertas flash con thumbnail, precios,
 *    descuento %, barra de stock, status badge, tiempo restante y acciones (edit, toggle, delete).
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo.
 */
import { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Zap, Package, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { FlashDeal } from '@/services/admin';

interface FlashDealsTableProps {
    deals: FlashDeal[];
    isLoading: boolean;
    onEdit: (deal: FlashDeal) => void;
    onToggle: (id: string, currentActive: boolean) => void;
    onDelete: (id: string, name: string) => void;
    togglingId?: string;
    deletingId?: string;
}

interface TableMetaType {
    onEdit: (deal: FlashDeal) => void;
    onToggle: (id: string, currentActive: boolean) => void;
    onDelete: (id: string, name: string) => void;
    togglingId?: string;
    deletingId?: string;
    tick: number; // to force re-render for time-left
}

/** Status helper */
function getDealStatus(deal: FlashDeal): { label: string; cls: string } {
    const now = Date.now();
    const start = new Date(deal.starts_at).getTime();
    const end = new Date(deal.ends_at).getTime();

    if (!deal.is_active) return { label: 'Inactiva', cls: 'bg-white/5 text-white/30 ring-white/10' };
    if (now < start) return { label: 'Programada', cls: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' };
    if (now > end) return { label: 'Expirada', cls: 'bg-red-500/10 text-red-400 ring-red-500/20' };
    if (deal.sold_count >= deal.max_qty) return { label: 'Agotada', cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' };
    return { label: 'En vivo', cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' };
}

const columnHelper = createColumnHelper<FlashDeal>();

const columns = [
    columnHelper.accessor('product', {
        header: 'Producto',
        cell: ({ getValue }) => {
            const product = getValue();
            return (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[0.75rem] border border-white/10 bg-white/5 shadow-inner">
                        {product?.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-white/20" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white max-w-[180px]">{product?.name ?? '—'}</p>
                        <p className="text-xs text-white/30">{product?.section?.toUpperCase()}</p>
                    </div>
                </div>
            );
        }
    }),
    columnHelper.accessor(row => row.product?.price ?? 0, {
        id: 'originalPrice',
        header: 'Original',
        cell: ({ getValue }) => (
            <span className="text-white/40 line-through text-xs">{formatPrice(getValue())}</span>
        )
    }),
    columnHelper.accessor('flash_price', {
        header: 'Flash',
        cell: ({ getValue }) => (
            <span className="font-bold text-orange-400">{formatPrice(getValue())}</span>
        )
    }),
    columnHelper.display({
        id: 'discount',
        header: 'Dcto',
        cell: ({ row }) => {
            const deal = row.original;
            const originalPrice = deal.product?.price ?? 0;
            const discountPercent = originalPrice > 0
                ? Math.round(((originalPrice - deal.flash_price) / originalPrice) * 100)
                : 0;
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-black text-red-400 ring-1 ring-inset ring-red-500/20">
                    <Zap className="h-3 w-3" />
                    -{discountPercent}%
                </span>
            );
        }
    }),
    columnHelper.display({
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
            const deal = row.original;
            const soldPercent = deal.max_qty > 0
                ? Math.round((deal.sold_count / deal.max_qty) * 100)
                : 0;
            return (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-white/50">{deal.sold_count}/{deal.max_qty}</span>
                    <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                soldPercent >= 80 ? 'bg-red-500' : soldPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500',
                            )}
                            style={{ width: `${Math.min(soldPercent, 100)}%` }}
                        />
                    </div>
                </div>
            );
        }
    }),
    columnHelper.display({
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = getDealStatus(row.original);
            return (
                <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                    status.cls,
                )}>
                    {status.label}
                </span>
            );
        }
    }),
    columnHelper.display({
        id: 'time',
        header: 'Tiempo',
        cell: ({ row, table }) => {
            const meta = table.options.meta as TableMetaType;
            // meta.tick ensures re-render every 30s
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            meta.tick;
            return <TimeLeftCell deal={row.original} />;
        }
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row, table }) => {
            const deal = row.original;
            const meta = table.options.meta as TableMetaType;
            const isToggling = meta.togglingId === deal.id;
            const isDeleting = meta.deletingId === deal.id;

            return (
                <div className="flex items-center justify-end gap-0.5">
                    <button
                        onClick={() => meta.onEdit(deal)}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-orange-500/10 hover:text-orange-400 transition-all"
                        aria-label="Editar oferta"
                        title="Editar"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => meta.onToggle(deal.id, deal.is_active)}
                        disabled={isToggling}
                        className="rounded-lg p-2.5 transition-all disabled:opacity-50"
                        aria-label={deal.is_active ? 'Desactivar oferta' : 'Activar oferta'}
                        title={deal.is_active ? 'Desactivar' : 'Activar'}
                    >
                        {deal.is_active ? (
                            <ToggleRight className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                        ) : (
                            <ToggleLeft className="h-5 w-5 text-white/40" />
                        )}
                    </button>
                    <button
                        onClick={() => meta.onDelete(deal.id, deal.product?.name ?? 'Oferta')}
                        disabled={isDeleting}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                        aria-label="Eliminar oferta"
                        title="Eliminar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            );
        }
    })
];


export function FlashDealsTable({
    deals,
    isLoading,
    onEdit,
    onToggle,
    onDelete,
    togglingId,
    deletingId,
}: FlashDealsTableProps) {
    // Re-render every 30s to keep time-left fresh
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    const table = useReactTable({
        data: deals,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            onEdit,
            onToggle,
            onDelete,
            togglingId,
            deletingId,
            tick,
        } as TableMetaType,
    });

    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-[1.25rem] bg-white/5 border border-white/5" />
                ))}
            </div>
        );
    }

    /* ── Empty ── */
    if (deals.length === 0) {
        return (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 py-16 backdrop-blur-md">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[80px]" />
                <Zap className="relative z-10 mb-4 h-14 w-14 text-orange-500/20" />
                <p className="relative z-10 text-sm font-medium text-white/40">No hay ofertas flash creadas</p>
                <p className="relative z-10 mt-1 text-xs text-white/20">Crea tu primera oferta con el botón "Nueva Oferta"</p>
            </div>
        );
    }

    /* ── Table ── */
    return (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-white/5">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className={cn(
                                            "px-4 py-3.5 text-[11px] font-bold text-white/30 uppercase tracking-wider",
                                            header.column.id === 'product' && "text-left",
                                            (header.column.id === 'originalPrice' || header.column.id === 'flash_price' || header.column.id === 'actions') && "text-right",
                                            (header.column.id === 'discount' || header.column.id === 'stock' || header.column.id === 'status' || header.column.id === 'time') && "text-center"
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
                    <tbody className="divide-y divide-white/5">
                        {table.getRowModel().rows.map(row => (
                            <tr 
                                key={row.id} 
                                className={cn(
                                    'transition-colors hover:bg-white/[0.03]',
                                    !row.original.is_active && 'opacity-40',
                                )}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td 
                                        key={cell.id} 
                                        className={cn(
                                            "px-4 py-3",
                                            cell.column.id === 'product' && "text-left",
                                            (cell.column.id === 'originalPrice' || cell.column.id === 'flash_price') && "text-right",
                                            (cell.column.id === 'discount' || cell.column.id === 'status' || cell.column.id === 'time') && "text-center"
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

            {/* Warning if none active */}
            {deals.length > 0 && deals.every(d => !d.is_active || new Date(d.ends_at).getTime() <= Date.now()) && (
                <div className="flex items-center gap-2 border-t border-white/5 px-4 py-3 text-xs text-amber-400/70">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Ninguna oferta está activa actualmente. La sección no se mostrará en el storefront.
                </div>
            )}
        </div>
    );
}

/* ─── TimeLeftCell ─── */
const URGENCY_CLS = {
    ok: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warn: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse',
    expired: 'text-white/25 bg-white/5 border-white/10',
};

function TimeLeftCell({ deal }: { deal: FlashDeal }) {
    const now = Date.now();
    const status = getDealStatus(deal);

    if (!deal.is_active || status.label === 'Inactiva') {
        return <span className="text-[10px] text-white/20">—</span>;
    }
    if (status.label === 'Agotada') {
        return <span className="text-[10px] text-amber-400/60">Agotada</span>;
    }
    if (status.label === 'Programada') {
        const diff = new Date(deal.starts_at).getTime() - now;
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        return (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 border-blue-500/20">
                En {h > 0 ? `${h}h ` : ''}{m}m
            </span>
        );
    }

    // Live deal — compute time left
    const diff = Math.max(0, new Date(deal.ends_at).getTime() - now);
    const totalMin = Math.floor(diff / 60_000);
    let label: string;
    let urgency: 'ok' | 'warn' | 'critical' | 'expired';
    if (diff <= 0) {
        label = 'Expirada'; urgency = 'expired';
    } else if (totalMin < 60) {
        label = `${totalMin}m`; urgency = 'critical';
    } else {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        label = m > 0 ? `${h}h ${m}m` : `${h}h`;
        urgency = h < 2 ? 'warn' : 'ok';
    }

    return (
        <span className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold',
            URGENCY_CLS[urgency],
        )}>
            <Zap className="h-2.5 w-2.5" />
            {label}
        </span>
    );
}
