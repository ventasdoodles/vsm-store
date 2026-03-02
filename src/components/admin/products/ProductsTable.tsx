/**
 * // ─── COMPONENTE: ProductsTable ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Contenedor glassmorphism de tabla de productos con skeletons premium,
 *    empty state con orbe, cabeceras tipograficas tracking-wider, y paginacion integrada.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism puro.
 */
import { Package } from 'lucide-react';
import { ProductTableRow } from './ProductTableRow';
import { Pagination, paginateItems } from '@/components/admin/Pagination';
import type { Product } from '@/types/product';

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
}: ProductsTableProps) {
    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = paginateItems(products, safePage, pageSize);
    const startItem = (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, products.length);

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
                            <tr className="border-b border-white/5">
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-white/30 uppercase tracking-wider">Producto</th>
                                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-white/30 uppercase tracking-wider">Precio</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider hidden sm:table-cell">Flags</th>
                                <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Activo</th>
                                <th className="px-4 py-3.5 text-right text-[11px] font-bold text-white/30 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginated.map((product) => (
                                <ProductTableRow
                                    key={product.id}
                                    product={product}
                                    onToggle={onToggle}
                                    onDelete={onDelete}
                                    onQuickSave={onQuickSave}
                                    onEdit={onEdit}
                                    onDuplicate={onDuplicate}
                                    isTogglingId={togglingId}
                                    isDeletingId={deletingId}
                                    isSavingId={savingId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {products.length > pageSize && (
                <div className="mt-2">
                    <Pagination
                        currentPage={safePage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        itemsLabel={`${startItem}–${endItem} de ${products.length}`}
                    />
                </div>
            )}
        </>
    );
}
