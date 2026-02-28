// ProductsTable — Tabla de productos con estado de carga y vacío
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
    togglingId,
    deletingId,
    savingId,
}: ProductsTableProps) {
    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = paginateItems(products, safePage, pageSize);
    const startItem = (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, products.length);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-theme-secondary/30" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-theme bg-theme-primary/60 py-16">
                <Package className="h-12 w-12 text-theme-tertiary mb-3" />
                <p className="text-sm text-theme-secondary">No se encontraron productos</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-theme bg-theme-primary/60">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-theme">
                                <th className="px-4 py-3 text-left text-xs font-medium text-theme-tertiary uppercase tracking-wider">Producto</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-theme-tertiary uppercase tracking-wider">Precio</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-theme-tertiary uppercase tracking-wider">Stock</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-theme-tertiary uppercase tracking-wider hidden sm:table-cell">Flags</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-theme-tertiary uppercase tracking-wider">Activo</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-theme-tertiary uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {paginated.map((product) => (
                                <ProductTableRow
                                    key={product.id}
                                    product={product}
                                    onToggle={onToggle}
                                    onDelete={onDelete}
                                    onQuickSave={onQuickSave}
                                    onEdit={onEdit}
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
