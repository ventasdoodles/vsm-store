// ProductTableRow — Fila de producto con Quick Edit inline y toggles de flags
import { useState } from 'react';
import {
    Eye, FileEdit, Save, X, Trash2, Pencil,
    Star, Sparkles, TrendingUp, ToggleLeft, ToggleRight, Package,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { SECTIONS, PRODUCT_FLAGS } from '@/constants/app';
import type { Product } from '@/types/product';

interface ProductTableRowProps {
    product: Product;
    onToggle: (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => void;
    onDelete: (id: string, name: string) => void;
    onQuickSave: (id: string, data: { price: number; stock: number }) => void;
    onEdit: (product: Product) => void;
    isTogglingId?: string;
    isDeletingId?: string;
    isSavingId?: string;
}

export function ProductTableRow({
    product,
    onToggle,
    onDelete,
    onQuickSave,
    onEdit,
    isTogglingId,
    isDeletingId,
    isSavingId,
}: ProductTableRowProps) {
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ price: product.price, stock: product.stock });

    const isToggling = isTogglingId === product.id;
    const isDeleting = isDeletingId === product.id;
    const isSaving = isSavingId === product.id;

    const handleSave = () => {
        onQuickSave(product.id, editForm);
        setEditing(false);
    };

    return (
        <tr className={cn('hover:bg-theme-secondary/20 transition-colors', !product.is_active && 'opacity-50')}>
            {/* Imagen + Nombre */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-theme-secondary/60 overflow-hidden">
                        {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-4 w-4 text-theme-tertiary" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium text-theme-primary max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-theme-tertiary flex items-center gap-1.5">
                            <span className={cn(
                                'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                                product.section === SECTIONS.VAPE
                                    ? 'bg-vape-500/10 text-vape-400'
                                    : 'bg-herbal-500/10 text-herbal-400'
                            )}>
                                {product.section}
                            </span>
                            {product.sku && <span className="font-mono">{product.sku}</span>}
                        </p>
                    </div>
                </div>
            </td>

            {/* Precio (editable) */}
            <td className="px-4 py-3">
                {editing ? (
                    <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="w-20 rounded-lg border border-theme bg-theme-primary px-2 py-1 text-xs"
                        min="0"
                    />
                ) : (
                    <>
                        <p className="font-medium text-theme-primary">{formatPrice(product.price)}</p>
                        {product.compare_at_price && (
                            <p className="text-xs text-theme-tertiary line-through">{formatPrice(product.compare_at_price)}</p>
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
                        className="w-16 rounded-lg border border-theme bg-theme-primary px-2 py-1 text-xs text-center"
                        min="0"
                    />
                ) : (
                    <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                        product.stock < 5 ? 'bg-red-500/10 text-red-400'
                            : product.stock < 15 ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                    )}>
                        {product.stock}
                    </span>
                )}
            </td>

            {/* Flags (hidden on mobile) */}
            <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center justify-center gap-1">
                    {([
                        { flag: PRODUCT_FLAGS.IS_FEATURED as 'is_featured', icon: <Star className="h-3.5 w-3.5" />, active: product.is_featured, color: 'bg-amber-500/15 text-amber-400', label: 'Destacado' },
                        { flag: PRODUCT_FLAGS.IS_NEW as 'is_new', icon: <Sparkles className="h-3.5 w-3.5" />, active: product.is_new, color: 'bg-blue-500/15 text-blue-400', label: 'Nuevo' },
                        { flag: PRODUCT_FLAGS.IS_BESTSELLER as 'is_bestseller', icon: <TrendingUp className="h-3.5 w-3.5" />, active: product.is_bestseller, color: 'bg-emerald-500/15 text-emerald-400', label: 'Bestseller' },
                    ] as const).map(({ flag, icon, active, color, label }) => (
                        <button
                            key={flag}
                            onClick={() => onToggle(product.id, flag, active)}
                            title={label}
                            disabled={isToggling}
                            className={cn(
                                'rounded-md p-1 transition-colors disabled:opacity-50',
                                active ? color : 'text-theme-tertiary hover:text-theme-secondary'
                            )}
                        >
                            {icon}
                        </button>
                    ))}
                </div>
            </td>

            {/* Activo toggle */}
            <td className="px-4 py-3 text-center">
                <button
                    onClick={() => onToggle(product.id, PRODUCT_FLAGS.IS_ACTIVE as 'is_active', product.is_active)}
                    disabled={isToggling}
                    className="transition-colors disabled:opacity-50"
                    title={product.is_active ? 'Desactivar' : 'Activar'}
                >
                    {product.is_active ? (
                        <ToggleRight className="h-5 w-5 text-emerald-400" />
                    ) : (
                        <ToggleLeft className="h-5 w-5 text-theme-tertiary" />
                    )}
                </button>
            </td>

            {/* Acciones */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <a
                        href={`/${product.section}/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-theme-tertiary hover:bg-theme-secondary/20 hover:text-theme-secondary transition-colors"
                        title="Ver en tienda"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </a>
                    <button
                        onClick={() => onEdit(product)}
                        className="rounded-lg p-1.5 text-theme-tertiary hover:bg-theme-secondary/20 hover:text-theme-secondary transition-colors"
                        title="Editar completo"
                    >
                        <FileEdit className="h-3.5 w-3.5" />
                    </button>

                    {editing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                                title="Guardar"
                            >
                                <Save className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => { setEditing(false); setEditForm({ price: product.price, stock: product.stock }); }}
                                className="rounded-lg p-1.5 text-red-500 hover:bg-red-500/10 transition-colors"
                                title="Cancelar"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="rounded-lg p-1.5 text-theme-tertiary hover:bg-theme-secondary/20 hover:text-theme-secondary transition-colors"
                            title="Edición Rápida (precio y stock)"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(product.id, product.name)}
                        disabled={isDeleting}
                        className="rounded-lg p-1.5 text-theme-tertiary hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Desactivar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
