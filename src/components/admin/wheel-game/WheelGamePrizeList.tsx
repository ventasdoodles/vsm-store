/**
 * // ─── COMPONENTE: WheelGamePrizeList ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Tabla de segmentos de la ruleta con color swatch,
 *    tipo, probabilidad, toggle activo, y acciones editar/eliminar.
 *    Validación visual: aviso si probabilidades activas no suman 100%.
 * // Regla / Notas: Props tipadas. Sin `any`. Loading skeleton. cn() para clases.
 */
import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { Pencil, Trash2, Loader2, Dices } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WheelPrizeAdmin } from '@/services/admin';

/* ─── Helpers de presentación ─── */
const TYPE_LABEL: Record<WheelPrizeAdmin['type'], string> = {
    points: 'V-Coins',
    coupon: 'Cupón',
    empty:  'Sin premio',
};

const TYPE_BADGE: Record<WheelPrizeAdmin['type'], string> = {
    points: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
    coupon: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    empty:  'bg-white/8 text-white/40 border-white/10',
};

function formatPrizeValue(prize: WheelPrizeAdmin): string {
    if (prize.type === 'points') return `+${prize.value.amount ?? 0} V-Coins`;
    if (prize.type === 'coupon') return `${prize.value.discount ?? 0}% OFF`;
    return '—';
}

/* ─── Skeleton row ─── */
function SkeletonRow() {
    return (
        <tr>
            {[2, 4, 2, 2, 2, 1, 1].map((w, i) => (
                <td key={i} className="px-4 py-3">
                    <div className={`h-4 w-${w * 4} rounded-md bg-white/8 animate-pulse`} />
                </td>
            ))}
        </tr>
    );
}

/* ─── Props ─── */
interface WheelGamePrizeListProps {
    prizes: WheelPrizeAdmin[];
    isLoading: boolean;
    togglingId: string | undefined;
    deletingId: string | undefined;
    onEdit: (prize: WheelPrizeAdmin) => void;
    onToggle: (id: string, current: boolean) => void;
    onDelete: (id: string, label: string) => void;
}

interface TableMetaType {
    togglingId: string | undefined;
    deletingId: string | undefined;
    onEdit: (prize: WheelPrizeAdmin) => void;
    onToggle: (id: string, current: boolean) => void;
    onDelete: (id: string, label: string) => void;
}

const columnHelper = createColumnHelper<WheelPrizeAdmin>();

export function WheelGamePrizeList({
    prizes,
    isLoading,
    togglingId,
    deletingId,
    onEdit,
    onToggle,
    onDelete,
}: WheelGamePrizeListProps) {
    // Probabilidad total de premios activos (para mostrar en footer)
    const totalProb = prizes
        .filter(p => p.is_active)
        .reduce((sum, p) => sum + p.probability, 0);
    const probPct = (totalProb * 100).toFixed(1);
    const probOk = Math.abs(totalProb - 1) < 0.01 || prizes.filter(p => p.is_active).length === 0;

    const columns = useMemo(() => [
        columnHelper.display({
            id: 'color',
            header: 'Color',
            cell: ({ row }) => {
                const prize = row.original;
                return (
                    <div
                        className="w-8 h-8 rounded-xl border-2 border-white/10 shadow-md flex-shrink-0"
                        style={{ backgroundColor: prize.color, boxShadow: `0 0 8px ${prize.color}40` }}
                    />
                );
            }
        }),
        columnHelper.accessor('label', {
            header: 'Premio',
            cell: ({ getValue }) => <span className="font-bold text-white">{getValue()}</span>
        }),
        columnHelper.accessor('type', {
            header: 'Tipo',
            cell: ({ getValue }) => {
                const type = getValue();
                return (
                    <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border',
                        TYPE_BADGE[type],
                    )}>
                        {TYPE_LABEL[type]}
                    </span>
                );
            }
        }),
        columnHelper.display({
            id: 'value',
            header: 'Valor',
            cell: ({ row }) => (
                <span className="text-white/60 font-medium">
                    {formatPrizeValue(row.original)}
                </span>
            )
        }),
        columnHelper.accessor('probability', {
            header: 'Prob. %',
            cell: ({ getValue }) => (
                <span className="font-black text-white">
                    {(getValue() * 100).toFixed(1)}%
                </span>
            )
        }),
        columnHelper.display({
            id: 'active',
            header: 'Activo',
            cell: ({ row, table }) => {
                const prize = row.original;
                const meta = table.options.meta as TableMetaType;
                const isToggling = meta.togglingId === prize.id;
                
                return (
                    <div className="flex justify-center">
                        <button
                            aria-label={prize.is_active ? 'Desactivar' : 'Activar'}
                            onClick={() => meta.onToggle(prize.id, prize.is_active)}
                            disabled={isToggling}
                            className="relative flex-shrink-0"
                        >
                            {isToggling ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                            ) : (
                                <div className={cn(
                                    'w-10 h-5 rounded-full transition-all duration-300',
                                    prize.is_active
                                        ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                                        : 'bg-white/10',
                                )}>
                                    <div className={cn(
                                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300',
                                        prize.is_active ? 'left-[1.375rem]' : 'left-0.5',
                                    )} />
                                </div>
                            )}
                        </button>
                    </div>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Acciones',
            cell: ({ row, table }) => {
                const prize = row.original;
                const meta = table.options.meta as TableMetaType;
                const isDeleting = meta.deletingId === prize.id;

                return (
                    <div className="flex justify-end gap-1">
                        <button
                            aria-label="Editar"
                            onClick={() => meta.onEdit(prize)}
                            className="p-2 rounded-xl transition-colors hover:bg-indigo-500/20 text-white/40 hover:text-indigo-400"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            aria-label="Eliminar"
                            onClick={() => meta.onDelete(prize.id, prize.label)}
                            disabled={isDeleting}
                            className="p-2 rounded-xl transition-colors hover:bg-red-500/20 text-white/40 hover:text-red-400 disabled:opacity-40"
                        >
                            {isDeleting
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Trash2 className="h-4 w-4" />
                            }
                        </button>
                    </div>
                );
            }
        })
    ], []);

    const table = useReactTable({
        data: prizes,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            togglingId,
            deletingId,
            onEdit,
            onToggle,
            onDelete,
        } as TableMetaType,
    });

    return (
        <div className="rounded-[1.5rem] border border-white/5 bg-theme-primary/5 overflow-hidden backdrop-blur-sm">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-white/5">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className={cn(
                                            "px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30",
                                            (header.column.id === 'color' || header.column.id === 'label' || header.column.id === 'type' || header.column.id === 'value') && "text-left",
                                            (header.column.id === 'probability' || header.column.id === 'active') && "text-center",
                                            header.column.id === 'actions' && "text-right"
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
                    <tbody className="divide-y divide-white/[0.03]">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : prizes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center">
                                    <Dices className="mx-auto h-10 w-10 text-white/10 mb-3" />
                                    <p className="text-white/30 text-sm font-medium">Sin premios configurados</p>
                                    <p className="text-white/20 text-xs mt-1">Crea el primer segmento de la ruleta</p>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        'transition-colors hover:bg-white/[0.02]',
                                        !row.original.is_active && 'opacity-50',
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td 
                                            key={cell.id} 
                                            className={cn(
                                                "px-4 py-3",
                                                (cell.column.id === 'probability' || cell.column.id === 'active') && "text-center"
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: probability total */}
            {prizes.length > 0 && !isLoading && (
                <div className={cn(
                    'px-4 py-3 border-t flex items-center justify-between text-xs font-bold',
                    probOk
                        ? 'border-white/5 text-white/30'
                        : 'border-amber-500/20 bg-amber-500/5 text-amber-400',
                )}>
                    <span>Probabilidad acumulada (premios activos)</span>
                    <span className="font-black text-sm">{probPct}% / 100%</span>
                </div>
            )}
        </div>
    );
}
