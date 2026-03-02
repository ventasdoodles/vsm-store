/**
 * // ─── COMPONENTE: FlashDealEditor ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Drawer glassmorphism para crear/editar una oferta flash.
 *    Incluye: Product picker con busqueda, precio flash, cantidad maxima,
 *    fechas inicio/fin, prioridad, y preview del descuento calculado en vivo.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism. Tema naranja/red.
 */
import { useState, useEffect, useMemo } from 'react';
import {
    Zap, Save, Loader2, Package, Search, Calendar, Hash, TrendingDown,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { SideDrawer } from '@/components/ui/SideDrawer';
import type { FlashDeal, FlashDealFormData } from '@/services/admin/admin-flash-deals.service';
import type { Product } from '@/types/product';

interface FlashDealEditorProps {
    deal: FlashDeal | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FlashDealFormData) => void;
    isSaving: boolean;
    /** All products for the picker */
    products: Product[];
}

const INPUT_CLS = 'w-full rounded-[0.75rem] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-all focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/20 placeholder:text-white/20';

/** Default: starts now, ends in 24h */
function defaultEnds(): string {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d.toISOString();
}

function toLocalInput(iso: string): string {
    if (!iso) return '';
    return iso.slice(0, 16);
}

function fromLocalInput(local: string): string {
    if (!local) return '';
    return new Date(local).toISOString();
}

export function FlashDealEditor({
    deal,
    isOpen,
    onClose,
    onSave,
    isSaving,
    products,
}: FlashDealEditorProps) {
    const isEditMode = !!deal;

    const [formData, setFormData] = useState<FlashDealFormData>({
        product_id: '',
        flash_price: 0,
        max_qty: 10,
        starts_at: new Date().toISOString(),
        ends_at: defaultEnds(),
        is_active: true,
        priority: 0,
    });

    const [productSearch, setProductSearch] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);

    useEffect(() => {
        if (deal && isOpen) {
            setFormData({
                product_id: deal.product_id,
                flash_price: deal.flash_price,
                max_qty: deal.max_qty,
                starts_at: deal.starts_at,
                ends_at: deal.ends_at,
                is_active: deal.is_active,
                priority: deal.priority,
            });
            setProductSearch('');
            setShowProductPicker(false);
        } else if (!deal && isOpen) {
            setFormData({
                product_id: '',
                flash_price: 0,
                max_qty: 10,
                starts_at: new Date().toISOString(),
                ends_at: defaultEnds(),
                is_active: true,
                priority: 0,
            });
            setProductSearch('');
            setShowProductPicker(false);
        }
    }, [deal, isOpen]);

    const selectedProduct = useMemo(
        () => products.find(p => p.id === formData.product_id),
        [products, formData.product_id],
    );

    const filteredProducts = useMemo(() => {
        const q = productSearch.toLowerCase();
        if (!q) return products.slice(0, 20);
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q),
        ).slice(0, 20);
    }, [products, productSearch]);

    const discountPercent = selectedProduct && selectedProduct.price > 0 && formData.flash_price > 0
        ? Math.round(((selectedProduct.price - formData.flash_price) / selectedProduct.price) * 100)
        : 0;

    const handleSubmit = () => {
        if (!formData.product_id || formData.flash_price <= 0) return;
        onSave(formData);
    };

    const selectProduct = (product: Product) => {
        setFormData(prev => ({
            ...prev,
            product_id: product.id,
            // Suggest a 30% discount by default
            flash_price: prev.flash_price || Math.round(product.price * 0.7 * 100) / 100,
        }));
        setShowProductPicker(false);
        setProductSearch('');
    };

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Editar Oferta Flash' : 'Nueva Oferta Flash'}
            width="max-w-xl w-full"
        >
            <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto space-y-6 p-6">

                    {/* 1. Product Picker */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10 p-1.5 border border-orange-500/20">
                                <Package className="h-4 w-4 text-orange-400" />
                            </div>
                            Producto
                        </h3>
                        <div className="space-y-3 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                            {/* Selected product preview */}
                            {selectedProduct ? (
                                <div className="flex items-center gap-3 rounded-[0.75rem] border border-orange-500/20 bg-orange-500/5 p-3">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                        {selectedProduct.images?.[0] ? (
                                            <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-5 w-5 text-white/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-white truncate">{selectedProduct.name}</p>
                                        <p className="text-xs text-white/40">
                                            Precio actual: <span className="text-white/60 font-medium">{formatPrice(selectedProduct.price)}</span>
                                            {selectedProduct.compare_at_price && (
                                                <span className="ml-2 line-through text-white/25">{formatPrice(selectedProduct.compare_at_price)}</span>
                                            )}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowProductPicker(true)}
                                        className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setShowProductPicker(true)}
                                    className="w-full rounded-[0.75rem] border border-dashed border-white/15 bg-white/[0.02] p-6 text-center text-sm text-white/30 hover:border-orange-500/30 hover:text-orange-400/60 transition-all"
                                >
                                    Click para seleccionar producto
                                </button>
                            )}

                            {/* Product search dropdown */}
                            {showProductPicker && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Buscar producto por nombre o SKU..."
                                            className={cn(INPUT_CLS, 'pl-9')}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto rounded-[0.75rem] border border-white/5 bg-[#1a1a2e] divide-y divide-white/5">
                                        {filteredProducts.length === 0 ? (
                                            <p className="p-3 text-xs text-white/30 text-center">Sin resultados</p>
                                        ) : (
                                            filteredProducts.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => selectProduct(p)}
                                                    className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                                        {p.images?.[0] ? (
                                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center">
                                                                <Package className="h-3 w-3 text-white/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{p.name}</p>
                                                        <p className="text-[10px] text-white/30">{formatPrice(p.price)} · Stock: {p.stock}</p>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Pricing */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/10 p-1.5 border border-red-500/20">
                                <TrendingDown className="h-4 w-4 text-red-400" />
                            </div>
                            Precio Flash
                        </h3>
                        <div className="space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        Precio flash ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.flash_price || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, flash_price: Number(e.target.value) }))}
                                        className={INPUT_CLS}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        Cantidad máxima
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_qty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, max_qty: Number(e.target.value) }))}
                                        className={INPUT_CLS}
                                        min="1"
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            {/* Live preview */}
                            {selectedProduct && formData.flash_price > 0 && (
                                <div className="flex items-center justify-between rounded-[0.75rem] border border-orange-500/15 bg-orange-500/5 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-orange-400" />
                                        <span className="text-sm text-white/60">Descuento:</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-white/30 line-through">{formatPrice(selectedProduct.price)}</span>
                                        <span className="text-lg font-black text-orange-400">{formatPrice(formData.flash_price)}</span>
                                        <span className={cn(
                                            'rounded-full px-2 py-0.5 text-xs font-black',
                                            discountPercent > 0
                                                ? 'bg-red-500/15 text-red-400'
                                                : 'bg-white/5 text-white/30',
                                        )}>
                                            {discountPercent > 0 ? `-${discountPercent}%` : '0%'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 3. Schedule */}
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
                            <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/10 p-1.5 border border-blue-500/20">
                                <Calendar className="h-4 w-4 text-blue-400" />
                            </div>
                            Programación
                        </h3>
                        <div className="space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        Inicio
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={toLocalInput(formData.starts_at)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, starts_at: fromLocalInput(e.target.value) }))}
                                        className={INPUT_CLS}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        Fin
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={toLocalInput(formData.ends_at)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ends_at: fromLocalInput(e.target.value) }))}
                                        className={INPUT_CLS}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        <Hash className="h-3 w-3" />
                                        Prioridad (orden)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.priority}
                                        onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                                        className={INPUT_CLS}
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex items-end pb-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                            className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/30"
                                        />
                                        <span className="text-sm text-white/60 font-medium">Activa al guardar</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer — sticky */}
                <div className="sticky bottom-0 border-t border-white/5 bg-[#0d0d1a]/95 backdrop-blur-xl p-4">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.product_id || formData.flash_price <= 0}
                        className={cn(
                            'group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all',
                            'bg-gradient-to-r from-orange-600 to-red-600 shadow-orange-500/20 hover:shadow-orange-500/40',
                            'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        {isSaving ? (
                            <>
                                <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                                <span className="relative z-10">Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="relative z-10 h-4 w-4" />
                                <span className="relative z-10">{isEditMode ? 'Guardar Cambios' : 'Crear Oferta'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </SideDrawer>
    );
}
