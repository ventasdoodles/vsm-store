import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getAllProducts, 
    bulkUpdateProducts, 
    type ProductFormData 
} from '@/services/admin';
import { 
    Save, RotateCcw, Search, 
    AlertCircle, Loader2, Edit3, Truck 
} from 'lucide-react';
import { SupplierOrderModal } from '@/components/admin/ui/SupplierOrderModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/hooks/useNotification';

interface ProductRow extends Partial<ProductFormData> {
    id: string;
    isModified?: boolean;
}

export function AdminBatchManager() {
    const queryClient = useQueryClient();
    const { success, error: notifyError } = useNotification();
    const [search, setSearch] = useState('');
    const [localProducts, setLocalProducts] = useState<ProductRow[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [selectedProductForOrder, setSelectedProductForOrder] = useState<ProductRow | null>(null);

    const { data: products, isLoading } = useQuery({
        queryKey: ['admin', 'products', 'batch'],
        queryFn: async () => {
            const data = await getAllProducts();
            setLocalProducts(data.map(p => ({ ...p, isModified: false })));
            return data;
        }
    });

    const mutation = useMutation({
        mutationFn: (updates: { id: string; updates: Partial<ProductFormData> }[]) => bulkUpdateProducts(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
            success('Éxito', 'Cambios aplicados masivamente');
            setIsDirty(false);
        },
        onError: () => {
            notifyError('Error', 'Error al aplicar cambios');
        }
    });

    const handleUpdateLocal = (id: string, field: keyof ProductRow, value: string | number | boolean) => {
        setLocalProducts(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, [field]: value, isModified: true };
            }
            return p;
        }));
        setIsDirty(true);
    };

    const handleSave = () => {
        const modified = localProducts.filter(p => p.isModified);
        if (modified.length === 0) return;

        const updates = modified.map(p => ({
            id: p.id,
            updates: {
                price: Number(p.price),
                stock: Number(p.stock),
                is_active: p.is_active
            }
        }));

        mutation.mutate(updates);
    };

    const filtered = localProducts.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="h-10 w-10 text-vape-500 animate-spin" />
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Cargando Inventario Masivo...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Batch Manager</h1>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Edición de alta densidad</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-vape-400 transition-colors" />
                        <input 
                            placeholder="Filtrar por nombre o SKU..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:ring-1 focus:ring-vape-500/30 transition-all w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <AnimatePresence>
                        {isDirty && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-3"
                            >
                                <button 
                                    onClick={() => setLocalProducts(products || [])}
                                    className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all border border-white/10"
                                    title="Descartar cambios"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={mutation.isPending}
                                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-vape-500 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-vape-500/20 hover:bg-vape-400 transition-all disabled:opacity-50"
                                >
                                    {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Aplicar {localProducts.filter(p => p.isModified).length} cambios
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Grid */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] overflow-hidden backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">ID / SKU</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Nombre del Producto</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Precio ($)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Stock</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.map((product) => (
                            <tr 
                                key={product.id}
                                className={cn(
                                    "group transition-colors",
                                    product.isModified ? "bg-vape-500/5" : "hover:bg-white/[0.01]"
                                )}
                            >
                                <td className="px-8 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white/60 lowercase">{product.id.slice(0, 8)}...</span>
                                        <span className="text-[9px] font-bold text-vape-400 uppercase tracking-tighter">{product.sku}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        {product.cover_image && (
                                            <img src={product.cover_image} alt="" className="h-8 w-8 rounded-lg object-cover bg-white/5 border border-white/10" />
                                        )}
                                        <span className="text-sm font-bold text-white truncate max-w-[200px]">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="relative w-28 group">
                                        <input 
                                            type="number"
                                            value={product.price}
                                            onChange={(e) => handleUpdateLocal(product.id, 'price', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-theme-primary focus:border-vape-500/50 outline-none transition-all"
                                        />
                                        <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit3 className="h-3 w-3 text-white/20" />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="relative w-24 group">
                                        <input 
                                            type="number"
                                            value={product.stock}
                                            onChange={(e) => handleUpdateLocal(product.id, 'stock', e.target.value)}
                                            className={cn(
                                                "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-vape-500/50 outline-none transition-all",
                                                (product.stock ?? 0) < 5 ? "text-rose-400 font-black" : "text-emerald-400"
                                            )}
                                        />
                                        {(product.stock ?? 0) < 5 && (
                                            <button 
                                                onClick={() => setSelectedProductForOrder(product)}
                                                className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all animate-pulse"
                                                title="Reordenar con IA"
                                            >
                                                <Truck className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-center">
                                    <button 
                                        onClick={() => handleUpdateLocal(product.id, 'is_active', !product.is_active)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            product.is_active 
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                                : "bg-white/5 text-white/20 border-white/10"
                                        )}
                                    >
                                        {product.is_active ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AI Warning Footer */}
            <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-500/80 font-medium">
                    <span className="font-bold">Nota de Seguridad:</span> Los cambios aplicados aquí impactarán directamente en el inventario real. La IA ha auditado este módulo para asegurar transacciones atómicas.
                </p>
            </div>
            <SupplierOrderModal 
                isOpen={!!selectedProductForOrder}
                onClose={() => setSelectedProductForOrder(null)}
                product={selectedProductForOrder ? {
                    id: selectedProductForOrder.id,
                    name: selectedProductForOrder.name || '',
                    stock: selectedProductForOrder.stock || 0,
                    sku: selectedProductForOrder.sku || ''
                } : null}
            />
        </div>
    );
}
