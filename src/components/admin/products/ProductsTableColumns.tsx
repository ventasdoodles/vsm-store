import { createColumnHelper } from '@tanstack/react-table';
import { Eye, FileEdit, Save, X, Trash2, Pencil, Copy, Star, Sparkles, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { PRODUCT_FLAGS } from '@/constants/app';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { getAdminSectionCatalogEntry } from '@/config/productization';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';
import { useRowContext, type TableMetaType } from './ProductsTableContext';

const columnHelper = createColumnHelper<Product>();

const FLAG_CONFIG = [
    { flag: PRODUCT_FLAGS.IS_FEATURED, icon: Star, color: 'text-amber-400 bg-amber-500/15', label: 'Destacado', key: 'is_featured' },
    { flag: PRODUCT_FLAGS.IS_NEW, icon: Sparkles, color: 'text-blue-400 bg-blue-500/15', label: 'Nuevo', key: 'is_new' },
    { flag: PRODUCT_FLAGS.IS_BESTSELLER, icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/15', label: 'Bestseller', key: 'is_bestseller' },
] as const;

export const columns = [
    columnHelper.display({
        id: 'select',
        header: ({ table }) => (
            <input
                type="checkbox"
                checked={table.getIsAllPageRowsSelected()}
                onChange={table.getToggleAllPageRowsSelectedHandler()}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-vape-500 focus:ring-vape-500/20"
            />
        ),
        cell: ({ row }) => (
            <input
                type="checkbox"
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-vape-500 focus:ring-vape-500/20"
            />
        ),
    }),
    columnHelper.accessor('name', {
        header: 'Producto',
        cell: ({ row, getValue }) => {
            const product = row.original;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { config } = useActiveVerticalPack();
            const sectionCatalogEntry = config && product.section ? getAdminSectionCatalogEntry(product.section as any, config) : null;
            const sectionBadgeClassName = sectionCatalogEntry?.badgeClassName ?? 'bg-white/10 text-white/60 ring-white/20';
            const sectionBadgeLabel = sectionCatalogEntry?.shortLabel ?? product.section;

            return (
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
                        <p className="truncate font-semibold text-white max-w-[200px]">{getValue()}</p>
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                            <span className={cn(
                                'inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                                sectionBadgeClassName
                            )}>
                                {sectionBadgeLabel}
                            </span>
                            {product.sku && <span className="font-mono text-white/25">{product.sku}</span>}
                        </p>
                    </div>
                </div>
            );
        }
    }),
    columnHelper.accessor('price', {
        header: 'Precio',
        cell: ({ row, getValue }) => {
            const product = row.original;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { editing, editForm, setEditForm } = useRowContext();

            if (editing) {
                return (
                    <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="w-20 rounded-[0.75rem] border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-xs text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        min="0"
                    />
                );
            }
            return (
                <>
                    <p className="font-semibold text-white">{formatPrice(getValue())}</p>
                    {product.compare_at_price && (
                        <p className="text-xs text-white/30 line-through">{formatPrice(product.compare_at_price)}</p>
                    )}
                </>
            );
        }
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
        cell: ({ getValue }) => {
            const stock = getValue();
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { editing, editForm, setEditForm } = useRowContext();

            if (editing) {
                return (
                    <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                        className="w-16 rounded-[0.75rem] border border-violet-500/30 bg-violet-500/5 px-2 py-1 text-xs text-center text-white backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                        min="0"
                    />
                );
            }
            return (
                <div className="text-center">
                    <span className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset',
                        stock < 5 ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                            : stock < 15 ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                    )}>
                        {stock}
                    </span>
                </div>
            );
        }
    }),
    columnHelper.display({
        id: 'flags',
        header: 'Flags',
        cell: ({ row, table }) => {
            const product = row.original;
            const meta = table.options.meta as TableMetaType;
            const isToggling = meta?.isTogglingId === product.id;

            return (
                <div className="flex items-center justify-center gap-1 hidden sm:flex">
                    {FLAG_CONFIG.map(({ flag, icon: Icon, color, label, key }) => {
                        const active = product[key as keyof Product] as boolean;
                        return (
                            <button
                                key={flag}
                                onClick={() => meta.onToggle(product.id, flag as 'is_featured' | 'is_new' | 'is_bestseller', active)}
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
            );
        }
    }),
    columnHelper.accessor('is_active', {
        header: 'Activo',
        cell: ({ row, getValue, table }) => {
            const product = row.original;
            const isActive = getValue();
            const meta = table.options.meta as TableMetaType;
            const isToggling = meta?.isTogglingId === product.id;

            return (
                <div className="text-center">
                    <button
                        onClick={() => meta.onToggle(product.id, PRODUCT_FLAGS.IS_ACTIVE as 'is_active', isActive)}
                        disabled={isToggling}
                        className="transition-all disabled:opacity-50 inline-flex items-center justify-center"
                        title={isActive ? 'Desactivar' : 'Activar'}
                    >
                        {isActive ? (
                            <ToggleRight className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                        ) : (
                            <ToggleLeft className="h-5 w-5 text-white/20" />
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
            const product = row.original;
            const meta = table.options.meta as TableMetaType;
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { editing, setEditing, editForm, setEditForm } = useRowContext();
            
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { config } = useActiveVerticalPack();
            const sectionCatalogEntry = config && product.section ? getAdminSectionCatalogEntry(product.section as any, config) : null;
            const sectionHrefPrefix = sectionCatalogEntry?.routePrefix ?? `/${product.section}`;

            const handleSave = () => {
                meta.onQuickSave(product.id, editForm);
                setEditing(false);
            };

            return (
                <div className="flex items-center justify-end gap-0.5 sm:focus-within:opacity-100 transition-opacity">
                    <a
                        href={`${sectionHrefPrefix}/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2.5 text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
                        aria-label="Ver en tienda"
                        title="Ver en tienda"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </a>
                    <button
                        onClick={() => meta.onEdit(product)}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-violet-500/10 hover:text-violet-400 transition-all"
                        aria-label="Editar producto"
                        title="Editar completo"
                    >
                        <FileEdit className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => meta.onDuplicate(product)}
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
                                disabled={meta.isSavingId === product.id}
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
                        onClick={() => meta.onDelete(product.id, product.name)}
                        disabled={meta.isDeletingId === product.id}
                        className="rounded-lg p-2.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                        aria-label="Eliminar producto"
                        title="Desactivar"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            );
        }
    }),
];
