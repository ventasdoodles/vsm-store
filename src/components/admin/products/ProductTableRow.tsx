/**
 * // ─── COMPONENTE: ProductTableRow ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Fila de producto premium con thumbnail glow, quick-edit glassmorphism,
 *    flag toggles con color semantico, stock badges con gradiente, y acciones con hover glow.
 * // Regla / Notas: Props tipadas. Sin `any`. Sin cadenas magicas.
 */
import { useState } from 'react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import {
    Eye, FileEdit, Save, X, Trash2, Pencil, Copy,
    Star, Sparkles, TrendingUp, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { SECTIONS, PRODUCT_FLAGS } from '@/constants/app';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface ProductTableRowProps {
    product: Product;
    onToggle: (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => void;
    onDelete: (id: string, name: string) => void;
    onQuickSave: (id: string, data: { price: number; stock: number }) => void;
    onEdit: (product: Product) => void;
    onDuplicate: (product: Product) => void;
    isTogglingId?: string;
    isDeletingId?: string;
    isSavingId?: string;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
}

/** Flag definitions for the toggle buttons */
const FLAG_CONFIG = [
    { flag: PRODUCT_FLAGS.IS_FEATURED, icon: Star, color: 'text-amber-400 bg-amber-500/15', label: 'Destacado', key: 'is_featured' },
    { flag: PRODUCT_FLAGS.IS_NEW, icon: Sparkles, color: 'text-blue-400 bg-blue-500/15', label: 'Nuevo', key: 'is_new' },
    { flag: PRODUCT_FLAGS.IS_BESTSELLER, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/15', label: 'Bestseller', key: 'is_bestseller' },
] as const;

export function ProductTableRow({
    product,
    onToggle,
    onDelete,
    onQuickSave,
    onEdit,
    onDuplicate,
    isTogglingId,
    isDeletingId,
    isSavingId,
    isSelected,
    onSelect,
}: ProductTableRowProps) {
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ price: product.price, stock: product.stock });

    const isToggling = isTogglingId === product.id;
    const isDeleting = isDeletingId === product.id;
    const isSaving = isSavingId === product.id;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    const handleSave = () => {
        onQuickSave(product.id, editForm);
        setEditing(false);
    };

    return (
        <motion.tr
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                'group relative transition-colors overflow-hidden',
                isSelected ? 'bg-vape-500/10' : 'hover:bg-white/[0.02]',
                !product.is_active && 'opacity-40'
            )}
            style={{
                backgroundImage: useMotionTemplate`
                    radial-gradient(
                        150px circle at ${mouseX}px ${mouseY}px,
                        rgba(168, 85, 247, 0.08),
                        transparent 80%
                    )
                `,
            } as any}
        >
            {/* Selection Checkbox */}
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-vape-500 focus:ring-vape-500/20"
                />
            </td>
            {/* Thumbnail + Name */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[0.75rem] border border-white/10 bg-white/5 shadow-inner">
                        <OptimizedImage
                            src={product.images?.[0] || product.cover_image || ''}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            width={100}
                            height={100}
                            quality={80}
                            format="webp"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-white max-w-[200px]">{product.name}</p>
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                            <span className={cn(
                                'inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                product.section === SECTIONS.VAPE
                                    ? 'bg-violet-500/15 text-violet-400'
                                    : 'bg-emerald-500/15 text-emerald-400'
                            )}>
                                {product.section}
                            </span>
                            {product.sku && <span className="font-mono text-white/25">{product.sku}</span>}
                        </p>
                    </div>
                </div>
            </td>

            {/* Price (editable) */}
            <td className="px-4 py-3">
                {editing ? (
                    <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="w-20 rounded-[0.75rem] border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-xs text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        min="0"
                    />
                ) : (
                    <>
                        <p className="font-semibold text-white">{formatPrice(product.price)}</p>
                        {product.compare_at_price && (
                            <p className="text-xs text-white/30 line-through">{formatPrice(product.compare_at_price)}</p>
                        )}
                    </>
                )}
            </td>

            {/* Stock (editable) */}
            <td className="px-4 py-3 text-center">
                {editing ? (
                    <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                        className="w-16 rounded-[0.75rem] border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-xs text-center text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        min="0"
                    />
                ) : (
                    <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset',
                        product.stock < 5 ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                            : product.stock < 15 ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                    )}>
                        {product.stock}
                    </span>
                )}
            </td>

            {/* Flags (hidden on mobile) */}
            <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center justify-center gap-1">
                    {FLAG_CONFIG.map(({ flag, icon: Icon, color, label, key }) => {
                        const active = product[key];
                        return (
                            <button
                                key={flag}
                                onClick={() => onToggle(product.id, flag as 'is_featured' | 'is_new' | 'is_bestseller', active)}
                                title={label}
                                disabled={isToggling}
                                className={cn(
                                    'rounded-lg p-1.5 transition-all disabled:opacity-50',
                                    active ? color : 'text-white/15 hover:text-white/30'
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </button>
                        );
                    })}
                </div>
            </td>

            {/* Active toggle */}
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() => onToggle(product.id, PRODUCT_FLAGS.IS_ACTIVE as 'is_active', product.is_active)}
                    disabled={isToggling}
                    className="transition-all disabled:opacity-50"
                    title={product.is_active ? 'Desactivar' : 'Activar'}
                >
                    {product.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                    ) : (
                        <ToggleLeft className="h-5 w-5 text-white/20" />
                    )}
                </button>
            </td>

            {/* Actions — hover on desktop, always visible on mobile */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-0.5 sm:focus-within:opacity-100 transition-opacity">
                    <a
                        href={`/${product.section}/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2.5 text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
                        aria-label="Ver en tienda"
                        title="Ver en tienda"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </a>
                    <button
                        onClick={() => onEdit(product)}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-violet-500/10 hover:text-violet-400 transition-all"
                        aria-label="Editar producto"
                        title="Editar completo"
                    >
                        <FileEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => onDuplicate(product)}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
                        aria-label="Duplicar producto"
                        title="Duplicar producto"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>

                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-lg p-2.5 text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                                aria-label="Guardar cambios"
                                title="Guardar"
                            >
                                <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => { setEditing(false); setEditForm({ price: product.price, stock: product.stock }); }}
                                className="rounded-lg p-2.5 text-red-400 hover:bg-red-500/10 transition-all"
                                aria-label="Cancelar edición"
                                title="Cancelar"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="rounded-lg p-2.5 text-white/40 hover:bg-amber-500/10 hover:text-amber-400 transition-all"
                            aria-label="Edición rápida de precio y stock"
                            title="Edicion Rapida (precio y stock)"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(product.id, product.name)}
                        disabled={isDeleting}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                        aria-label="Eliminar producto"
                        title="Desactivar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
}
