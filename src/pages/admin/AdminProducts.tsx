/**
 * // ─── COMPONENTE: AdminProducts ─── [Wave 90 - Thin Component Refactor]
 * // Arquitectura: Page Orchestrator (Thin Component)
 * // Proposito principal: Orquestar legos usando el hook unificado useAdminProducts.
 */
import { useState } from 'react';
import { useAdminProducts } from '@/hooks/admin/useAdminProducts';
import type { Product } from '@/types/product';
import { ProductsHeader } from '@/components/admin/products/ProductsHeader';
import { ProductsFilter } from '@/components/admin/products/ProductsFilter';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { ProductEditorDrawer } from '@/components/admin/products/ProductEditorDrawer';
import { Loader2, Sparkles } from 'lucide-react';

const PAGE_SIZE = 15;

export function AdminProducts() {
    const admin = useAdminProducts();
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    /** Duplicar: abre el editor con los datos del producto original pero sin id */
    const handleDuplicate = (product: Product) => {
        const clone: Product = {
            ...product,
            id: '',
            name: `${product.name} (Copia)`,
            slug: `${product.slug}-copia`,
        };
        setEditingProduct(clone);
        setIsEditorOpen(true);
    };

    const handleExportCSV = () => {
        const headers = ['Nombre', 'SKU', 'Seccion', 'Precio', 'Stock', 'Activo'];
        const csvContent = [headers, ...admin.products.map(p => [p.name, p.sku ?? '', p.section, p.price, p.stock, p.is_active ? 'Si' : 'No'])]
            .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productos_vsm_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-5">
            <ProductsHeader
                products={admin.products}
                onExportCSV={handleExportCSV}
                onAddProduct={() => {
                    setEditingProduct(null);
                    setIsEditorOpen(true);
                }}
            />

            <ProductsFilter
                search={admin.search}
                sectionFilter={admin.sectionFilter}
                showInactive={admin.showInactive}
                quickFilter={admin.quickFilter}
                onSearchChange={(v) => { admin.setSearch(v); admin.setPage(1); }}
                onSectionChange={(v) => { admin.setSectionFilter(v); admin.setPage(1); }}
                onToggleInactive={() => { admin.setShowInactive(!admin.showInactive); admin.setPage(1); }}
                onQuickFilterChange={(f) => { admin.setQuickFilter(f); admin.setPage(1); }}
            />

            <ProductsTable
                products={admin.products}
                isLoading={admin.isLoading}
                selectedIds={admin.selectedIds}
                onSelectionChange={admin.setSelectedIds}
                currentPage={admin.page}
                pageSize={PAGE_SIZE}
                onPageChange={admin.setPage}
                onToggle={admin.handleToggle}
                onDelete={admin.handleDelete}
                onQuickSave={admin.handleQuickSave}
                onEdit={(p) => {
                    setEditingProduct(p);
                    setIsEditorOpen(true);
                }}
                onDuplicate={handleDuplicate}
                togglingId={admin.togglingId}
                deletingId={admin.deletingId}
            />

            {admin.selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex items-center gap-4 rounded-[2rem] border border-vape-500/30 bg-[#13141f]/90 px-6 py-3 backdrop-blur-xl shadow-2xl">
                        <span className="text-xs font-bold text-white/70 pr-4 border-r border-white/10">
                            {admin.selectedIds.length} Seleccionados
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => admin.bulkToggle(true)} disabled={admin.isBulkToggling} className="btn-vsm-bulk text-emerald-400">Activar</button>
                            <button onClick={() => admin.bulkToggle(false)} disabled={admin.isBulkToggling} className="btn-vsm-bulk text-amber-400">Desactivar</button>
                            <button onClick={admin.bulkAISync} disabled={admin.isBulkAISyncing} className="btn-vsm-bulk text-violet-400">
                                {admin.isBulkAISyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                Magic Sync (IA)
                            </button>
                            <button onClick={() => admin.setSelectedIds([])} className="text-xs font-bold text-white/30 hover:text-white/60 px-2 transition-colors">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            <ProductEditorDrawer
                isOpen={isEditorOpen}
                onClose={() => {
                    setIsEditorOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
                onSave={async (data) => {
                    await admin.saveProduct(data, editingProduct?.id);
                    setIsEditorOpen(false);
                }}
                categories={admin.categories}
                tagNames={admin.tagNames}
                isSaving={admin.isSaving}
            />
        </div>
    );
}
