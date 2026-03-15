/**
 * // ─── COMPONENTE: FlashDealEditor ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Drawer glassmorphism para crear/editar una oferta flash.
 *    Incluye: Product picker con busqueda, precio flash, cantidad maxima,
 *    DURACIÓN por presets (1h/3h/6h/12h/24h/custom), y preview del descuento en vivo.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism. Tema naranja/red.
 */
import { useState, useEffect, useMemo } from 'react';
import {
    Zap, Save, Loader2, Package, Search, AlarmClock, TrendingDown, Sparkles,
    CalendarClock, CheckCircle
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { SideDrawer } from '@/components/ui/SideDrawer';
import type { FlashDeal, FlashDealFormData } from '@/services/admin';
import { suggestFlashDealMagic } from '@/services/admin';
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

/** Duration preset definition */
interface DurationPreset {
    label: string;
    hours: number | null; // null = custom
}

const DURATION_PRESETS: DurationPreset[] = [
    { label: '1h', hours: 1 },
    { label: '3h', hours: 3 },
    { label: '6h', hours: 6 },
    { label: '12h', hours: 12 },
    { label: '24h', hours: 24 },
    { label: 'Custom', hours: null },
];

function toLocalInput(iso: string): string {
    if (!iso) return '';
    // Convert UTC ISO to local datetime-local value
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
    if (!local) return '';
    return new Date(local).toISOString();
}

function addHours(date: Date, hours: number): string {
    const d = new Date(date.getTime() + hours * 3_600_000);
    return d.toISOString();
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
        ends_at: addHours(new Date(), 6),
        is_active: true,
        priority: 0,
    });

    const [selectedDuration, setSelectedDuration] = useState<number | null>(6); // hours, null = custom
    const [customEndsAt, setCustomEndsAt] = useState('');
    const [startMode, setStartMode] = useState<'now' | 'custom'>('now');
    const [customStartAt, setCustomStartAt] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [localNumbers, setLocalNumbers] = useState({ flash_price: '0', max_qty: '10' });

    useEffect(() => {
        if (!isOpen) return;

        if (deal) {
            // Edit mode: detect duration from deal
            const diffHours = (new Date(deal.ends_at).getTime() - new Date(deal.starts_at).getTime()) / 3_600_000;
            const knownPreset = DURATION_PRESETS.find(p => p.hours === diffHours);

            setSelectedDuration(knownPreset?.hours ?? null);
            setCustomEndsAt(toLocalInput(deal.ends_at));
            setStartMode('custom');
            setCustomStartAt(toLocalInput(deal.starts_at));

            setFormData({
                product_id: deal.product_id,
                flash_price: deal.flash_price,
                max_qty: deal.max_qty,
                starts_at: deal.starts_at,
                ends_at: deal.ends_at,
                is_active: deal.is_active,
                priority: deal.priority,
            });
            setLocalNumbers({
                flash_price: deal.flash_price.toString(),
                max_qty: deal.max_qty.toString(),
            });
        } else {
            // Create mode: defaults
            setSelectedDuration(6);
            setStartMode('now');
            setCustomStartAt('');
            setCustomEndsAt('');
            setFormData({
                product_id: '',
                flash_price: 0,
                max_qty: 10,
                starts_at: new Date().toISOString(),
                ends_at: addHours(new Date(), 6),
                is_active: true,
                priority: 0,
            });
            setLocalNumbers({ flash_price: '', max_qty: '10' });
        }
        setProductSearch('');
        setShowProductPicker(false);
    }, [deal, isOpen]);

    /** Recalculate ends_at whenever start or duration changes */
    useEffect(() => {
        if (selectedDuration === null) return; // Custom — user controls ends_at directly
        const start = startMode === 'now' ? new Date() : (customStartAt ? new Date(customStartAt) : new Date());
        const newEndsAt = addHours(start, selectedDuration);
        setFormData(prev => ({
            ...prev,
            starts_at: start.toISOString(),
            ends_at: newEndsAt,
        }));
    }, [selectedDuration, startMode, customStartAt]);

    const handleDurationSelect = (preset: DurationPreset) => {
        setSelectedDuration(preset.hours);
        if (preset.hours !== null) {
            const start = startMode === 'now' ? new Date() : (customStartAt ? new Date(customStartAt) : new Date());
            setFormData(prev => ({
                ...prev,
                starts_at: start.toISOString(),
                ends_at: addHours(start, preset.hours!),
            }));
        }
    };

    const handleLocalNumberChange = (field: keyof typeof localNumbers, value: string) => {
        let cleaned = value.replace(/[^0-9.]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
        setLocalNumbers(prev => ({ ...prev, [field]: cleaned }));
        const num = parseFloat(cleaned);
        setFormData(prev => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
    };

    const handleSuggestAI = async () => {
        if (!selectedProduct) return;
        setIsSuggesting(true);
        try {
            const suggestion = await suggestFlashDealMagic(
                selectedProduct.id,
                selectedProduct.price,
                selectedProduct.stock
            );
            setFormData(prev => ({ ...prev, flash_price: suggestion.flash_price, max_qty: suggestion.max_qty }));
            setLocalNumbers({ flash_price: suggestion.flash_price.toString(), max_qty: suggestion.max_qty.toString() });
        } finally {
            setIsSuggesting(false);
        }
    };

    const selectedProduct = useMemo(
        () => products.find(p => p.id === formData.product_id),
        [products, formData.product_id],
    );

    const filteredProducts = useMemo(() => {
        const q = productSearch.toLowerCase();
        if (!q) return products.slice(0, 20);
        return products.filter(p =>
            p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q),
        ).slice(0, 20);
    }, [products, productSearch]);

    const discountPercent = selectedProduct && selectedProduct.price > 0 && formData.flash_price > 0
        ? Math.round(((selectedProduct.price - formData.flash_price) / selectedProduct.price) * 100)
        : 0;

    /** Human-readable preview of the deal timing */
    const timingPreview = useMemo(() => {
        if (!formData.ends_at) return null;
        const end = new Date(formData.ends_at);
        const start = new Date(formData.starts_at);
        const diffMs = end.getTime() - start.getTime();
        const diffH = Math.round(diffMs / 3_600_000);
        const pad = (n: number) => String(n).padStart(2, '0');
        const endStr = `${end.getDate()}/${end.getMonth() + 1} a las ${pad(end.getHours())}:${pad(end.getMinutes())}`;
        if (startMode === 'now') {
            return `Empieza ahora · dura ${diffH}h · caduca el ${endStr}`;
        }
        const startStr = `${start.getDate()}/${start.getMonth() + 1} a las ${pad(start.getHours())}:${pad(start.getMinutes())}`;
        return `Inicia el ${startStr} · dura ${diffH}h · caduca el ${endStr}`;
    }, [formData.starts_at, formData.ends_at, startMode]);

    const handleSubmit = () => {
        if (!formData.product_id || formData.flash_price <= 0) return;
        onSave(formData);
    };

    const selectProduct = (product: Product) => {
        setFormData(prev => ({
            ...prev,
            product_id: product.id,
            flash_price: prev.flash_price || Math.round(product.price * 0.7 * 100) / 100,
        }));
        if (!localNumbers.flash_price) {
            const suggested = Math.round((products.find(p => p.id === product.id)?.price ?? 0) * 0.7 * 100) / 100;
            setLocalNumbers(prev => ({ ...prev, flash_price: suggested ? suggested.toString() : '' }));
        }
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
                        <SectionHeader icon={Package} label="Producto" color="orange" />
                        <div className="space-y-3 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                            {selectedProduct ? (
                                <div className="flex items-center gap-3 rounded-[0.75rem] border border-orange-500/20 bg-orange-500/5 p-3">
                                    <ProductThumb product={selectedProduct} size="lg" />
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

                            {showProductPicker && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Buscar por nombre o SKU..."
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
                                                    <ProductThumb product={p} size="sm" />
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
                        <SectionHeader icon={TrendingDown} label="Precio Flash" color="red" />
                        <div className="space-y-4 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">Precio flash ($)</label>
                                        {selectedProduct && (
                                            <button
                                                type="button"
                                                onClick={handleSuggestAI}
                                                disabled={isSuggesting}
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50"
                                            >
                                                {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                Sugerir IA
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={localNumbers.flash_price}
                                        onChange={(e) => handleLocalNumberChange('flash_price', e.target.value)}
                                        className={INPUT_CLS}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                        Cantidad máxima
                                    </label>
                                    <input
                                        type="text"
                                        value={localNumbers.max_qty}
                                        onChange={(e) => handleLocalNumberChange('max_qty', e.target.value)}
                                        className={INPUT_CLS}
                                        placeholder="10"
                                    />
                                </div>
                            </div>

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
                                            discountPercent > 0 ? 'bg-red-500/15 text-red-400' : 'bg-white/5 text-white/30',
                                        )}>
                                            {discountPercent > 0 ? `-${discountPercent}%` : '0%'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
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
                    </section>

                    {/* 3. Duration — the star of the show */}
                    <section className="space-y-3">
                        <SectionHeader icon={AlarmClock} label="Duración" color="blue" />
                        <div className="space-y-5 rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">

                            {/* Start mode */}
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">¿Cuándo empieza?</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setStartMode('now')}
                                        className={cn(
                                            'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                                            startMode === 'now'
                                                ? 'border-orange-500/40 bg-orange-500/10 text-orange-400'
                                                : 'border-white/10 bg-white/5 text-white/30 hover:border-white/20 hover:text-white/60',
                                        )}
                                    >
                                        {startMode === 'now' && <CheckCircle className="h-3.5 w-3.5" />}
                                        Ahora mismo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStartMode('custom');
                                            if (!customStartAt) {
                                                const now = new Date();
                                                now.setMinutes(now.getMinutes() + 30);
                                                setCustomStartAt(toLocalInput(now.toISOString()));
                                            }
                                        }}
                                        className={cn(
                                            'flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                                            startMode === 'custom'
                                                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                                                : 'border-white/10 bg-white/5 text-white/30 hover:border-white/20 hover:text-white/60',
                                        )}
                                    >
                                        {startMode === 'custom' && <CheckCircle className="h-3.5 w-3.5" />}
                                        Programar inicio
                                    </button>
                                </div>
                                {startMode === 'custom' && (
                                    <div className="mt-2">
                                        <input
                                            type="datetime-local"
                                            value={customStartAt}
                                            onChange={(e) => {
                                                setCustomStartAt(e.target.value);
                                                setFormData(prev => ({ ...prev, starts_at: fromLocalInput(e.target.value) }));
                                            }}
                                            className={INPUT_CLS}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Duration presets */}
                            <div>
                                <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">¿Cuánto dura?</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {DURATION_PRESETS.map((preset) => (
                                        <button
                                            key={preset.label}
                                            type="button"
                                            onClick={() => handleDurationSelect(preset)}
                                            className={cn(
                                                'flex items-center justify-center rounded-xl border py-2.5 text-xs font-black uppercase tracking-wider transition-all',
                                                selectedDuration === preset.hours
                                                    ? 'border-orange-500/50 bg-gradient-to-br from-orange-600/20 to-red-600/10 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                                                    : 'border-white/8 bg-white/[0.03] text-white/30 hover:border-white/20 hover:text-white/60',
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom end datetime */}
                                {selectedDuration === null && (
                                    <div className="mt-3">
                                        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">Fecha y hora de fin</label>
                                        <input
                                            type="datetime-local"
                                            value={customEndsAt || toLocalInput(formData.ends_at)}
                                            onChange={(e) => {
                                                setCustomEndsAt(e.target.value);
                                                setFormData(prev => ({ ...prev, ends_at: fromLocalInput(e.target.value) }));
                                            }}
                                            className={INPUT_CLS}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Timing summary pill */}
                            {timingPreview && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/15 bg-blue-500/5 px-4 py-3">
                                    <CalendarClock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-blue-300/70 leading-relaxed">{timingPreview}</p>
                                </div>
                            )}

                            {/* Priority */}
                            <div>
                                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
                                    Prioridad (orden de aparición)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                                    className={INPUT_CLS}
                                    min="0"
                                    placeholder="0 = normal"
                                />
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

/* ─── Sub-components ─── */

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    color: 'orange' | 'red' | 'blue';
}

const COLOR_MAP = {
    orange: { wrap: 'from-orange-500/20 to-red-500/10 border-orange-500/20', icon: 'text-orange-400' },
    red: { wrap: 'from-red-500/20 to-orange-500/10 border-red-500/20', icon: 'text-red-400' },
    blue: { wrap: 'from-blue-500/20 to-indigo-500/10 border-blue-500/20', icon: 'text-blue-400' },
};

function SectionHeader({ icon: Icon, label, color }: SectionHeaderProps) {
    const c = COLOR_MAP[color];
    return (
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/50">
            <div className={cn('rounded-lg bg-gradient-to-br p-1.5 border', c.wrap)}>
                <Icon className={cn('h-4 w-4', c.icon)} />
            </div>
            {label}
        </h3>
    );
}

interface ProductThumbProps {
    product: Product;
    size: 'sm' | 'lg';
}
function ProductThumb({ product, size }: ProductThumbProps) {
    const dim = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
    return (
        <div className={cn('flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5', dim)}>
            {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <Package className={cn('text-white/20', size === 'lg' ? 'h-5 w-5' : 'h-3 w-3')} />
                </div>
            )}
        </div>
    );
}
