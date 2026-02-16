// Tarjeta de producto - VSM Store
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    className?: string;
    index?: number;
    compact?: boolean;
}

export function ProductCard({ product, className, index = 0, compact = false }: ProductCardProps) {
    const isVape = product.section === 'vape';
    const addItem = useCartStore((s) => s.addItem);

    // Determinar badge
    const badge = product.is_new ? 'Nuevo' : product.is_bestseller ? 'Best Seller' : product.is_featured ? 'Premium' : null;

    // Descuento
    const discount = product.compare_at_price && product.compare_at_price > product.price
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : null;

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    return (
        <Link
            to={`/${product.section}/${product.slug}`}
            className={cn(
                'group relative block overflow-hidden rounded-2xl border border-primary-800/60 bg-primary-900/40',
                'transition-all duration-500 cursor-pointer',
                compact ? 'hover:shadow-lg' : 'hover:shadow-2xl hover:-translate-y-1.5',
                isVape ? 'hover:shadow-vape-500/5 hover:border-vape-500/30' : 'hover:shadow-herbal-500/5 hover:border-herbal-500/30',
                className
            )}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
        >
            {/* Imagen */}
            <div
                className={cn(
                    'relative flex items-center justify-center overflow-hidden',
                    compact ? 'h-32 sm:h-40' : 'h-52',
                    isVape ? 'bg-gradient-to-br from-vape-500/8 via-primary-900/50 to-vape-600/5' : 'bg-gradient-to-br from-herbal-500/8 via-primary-900/50 to-herbal-600/5'
                )}
            >
                {product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110" loading="lazy" />
                ) : (
                    <div className={cn('font-bold opacity-10', compact ? 'text-2xl' : 'text-4xl', isVape ? 'text-vape-500' : 'text-herbal-500')}>VSM</div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badges (ocultar algunos en compact) */}
                {!compact && badge && (
                    <span className={cn('absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md', badge === 'Nuevo' && 'animate-pulse-glow', isVape ? 'bg-vape-500/20 text-vape-300' : 'bg-herbal-500/20 text-herbal-300')}>{badge}</span>
                )}

                {/* Descuento */}
                {discount && (
                    <span className={cn('absolute rounded-full bg-red-500/90 text-white font-bold shadow-lg shadow-red-500/20', compact ? 'top-2 right-2 px-1.5 py-0.5 text-[9px]' : 'top-3 right-3 px-2 py-0.5 text-[10px]')}>-{discount}%</span>
                )}

                {/* Quick Add Button */}
                <div className={cn(
                    'absolute right-3 flex gap-2 transition-all duration-300',
                    compact ? 'bottom-2' : 'bottom-3',
                    // Mobile: Always visible. Desktop (sm+): Hidden until hover
                    'translate-y-0 opacity-100 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'
                )}>
                    <button
                        onClick={handleQuickAdd}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl text-[11px] font-semibold text-white backdrop-blur-md transition-all active:scale-90',
                            compact ? 'p-2' : 'px-3 py-2',
                            isVape ? 'bg-vape-500/90 shadow-lg shadow-vape-500/20' : 'bg-herbal-500/90 shadow-lg shadow-herbal-500/20'
                        )}
                    >
                        <ShoppingCart className={cn(compact ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
                        {!compact && <span className="hidden xs:inline">Agregar</span>}
                    </button>
                    {!compact && (
                        <span className="flex items-center rounded-xl bg-primary-900/80 px-2.5 py-2 text-primary-300 backdrop-blur-md transition-all hover:bg-primary-800">
                            <Eye className="h-3.5 w-3.5" />
                        </span>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className={cn('space-y-1', compact ? 'p-3' : 'p-4')}>
                <h3 className={cn('font-semibold text-primary-100 line-clamp-1 group-hover:text-white transition-colors', compact ? 'text-xs' : 'text-sm')}>{product.name}</h3>

                {!compact && product.short_description && (
                    <p className="text-xs text-primary-500 line-clamp-2 leading-relaxed">{product.short_description}</p>
                )}

                <div className="flex items-baseline gap-2">
                    <span className={cn('font-bold', compact ? 'text-sm' : 'text-lg', isVape ? 'text-vape-400' : 'text-herbal-400')}>{formatPrice(product.price)}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[10px] text-primary-600 line-through">{formatPrice(product.compare_at_price)}</span>
                    )}
                </div>
            </div>

            {/* Accent Line */}
            <div className={cn('h-0.5 w-0 transition-all duration-500 group-hover:w-full', isVape ? 'bg-gradient-to-r from-vape-500 to-vape-400' : 'bg-gradient-to-r from-herbal-500 to-herbal-400')} />
        </Link>
    );
}
