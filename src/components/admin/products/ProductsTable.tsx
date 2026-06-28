/**
 * // ─── COMPONENTE: ProductsTable ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Contenedor glassmorphism de tabla de productos con skeletons premium.
 * // Refactor TanStack Table: Integracion completa headless UI.
 */
import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ProductTableRow } from './ProductTableRow';
import { Pagination } from '@/components/admin/Pagination';
import type { Product } from '@/types/product';
import { columns } from './ProductsTableColumns';
import type { TableMetaType } from './ProductsTableContext';

interface ProductsTableProps {
    products: Product[];
    isLoading: boolean;
    currentPage: number;
    pageSize: number;
    onPageChange: (p: number) => void;
    onToggle: (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => void;
    onDelete: (id: string, name: string) => void;
    onQuickSave: (id: string, data: { price: number; stock: number }) => void;
    onEdit: (product: Product) => void;
    onDuplicate: (product: Product) => void;
    togglingId?: string;
    deletingId?: string;
    savingId?: string;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function ProductsTable({
    products,
    isLoading,
    currentPage,
    pageSize,
    onPageChange,
    onToggle,
    onDelete,
    onQuickSave,
    onEdit,
    onDuplicate,
    togglingId,
    deletingId,
    savingId,
    selectedIds,
    onSelectionChange,
}: ProductsTableProps) {
    
    // We synchronize TanStack selection with external selection state
    const rowSelection = useMemo(() => {
        const sel: Record<string, boolean> = {};
        products.forEach((p) => {
            if (selectedIds.includes(p.id)) {
                // TanStack uses row index or id for selection. By default getRowId is index unless specified
                // Let's specify getRowId in useReactTable so it matches our product.id
                sel[p.id] = true;
            }
        });
        return sel;
    }, [products, selectedIds]);

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getRowId: row => row.id,
        state: {
            pagination: {
                pageIndex: currentPage - 1,
                pageSize,
            },
            rowSelection,
        },
        onRowSelectionChange: (updaterOrValue) => {
            // Convert back to external state
            const newSelection = typeof updaterOrValue === 'function' 
                ? updaterOrValue(rowSelection) 
                : updaterOrValue;
            onSelectionChange(Object.keys(newSelection));
        },
        // We handle pagination change via onPageChange
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: currentPage - 1, pageSize });
                onPageChange(newState.pageIndex + 1);
            } else {
                onPageChange(updater.pageIndex + 1);
            }
        },
        meta: {
            onToggle,
            onDelete,
            onQuickSave,
            onEdit,
            onDuplicate,
            isTogglingId: togglingId,
            isDeletingId: deletingId,
            isSavingId: savingId,
        } as TableMetaType,
    });

    /* ── Loading Skeletons ── */
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-[1.25rem] bg-white/5 border border-white/5" />
                ))}
            </div>
        );
    }

    /* ── Empty State ── */
    if (products.length === 0) {
        return (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 py-20 backdrop-blur-md">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[80px]" />
                <Package className="relative z-10 mb-4 h-14 w-14 text-white/10" />
                <p className="relative z-10 text-sm font-medium text-white/40">No se encontraron productos</p>
            </div>
        );
    }

    /* ── Table ── */
    return (
        <>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="border-b border-white/5">
                                    {headerGroup.headers.map(header => (
                                        <th 
                                            key={header.id} 
                                            className="px-4 py-3.5 text-left text-[11px] font-bold text-white/30 uppercase tracking-wider"
                                            style={{
                                                width: header.column.id === 'select' ? '40px' : 'auto',
                                                textAlign: ['stock', 'is_active', 'flags'].includes(header.column.id) ? 'center' : 
                                                           header.column.id === 'actions' ? 'right' : 'left'
                                            }}
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
                        <m.tbody
                            className="divide-y divide-white/5"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            <AnimatePresence initial={false}>
                                {table.getRowModel().rows.map((row) => (
                                    <ProductTableRow
                                        key={row.id}
                                        row={row}
                                    />
                                ))}
                            </AnimatePresence>
                        </m.tbody>
                    </table>
                </div>
            </div>

            {table.getPageCount() > 1 && (
                <div className="mt-2">
                    <Pagination
                        currentPage={table.getState().pagination.pageIndex + 1}
                        totalPages={table.getPageCount()}
                        onPageChange={onPageChange}
                        itemsLabel={`${table.getState().pagination.pageIndex * pageSize + 1}–${Math.min((table.getState().pagination.pageIndex + 1) * pageSize, products.length)} de ${products.length}`}
                    />
                </div>
            )}
        </>
    );
}
