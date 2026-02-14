// Tarjeta de producto - VSM Store
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    className?: string;
    index?: number; // Para stagger animation
}

/**
 * Tarjeta visual premium de un producto con imagen, info, badges y quick-add
 * Clickeable — navega a /{section}/{slug}
 */
export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
    const isVape = product.section === 'vape';
    const addItem = useCartStore((s) => s.addItem);

    // Determinar badge principal (prioridad: nuevo > bestseller > featured)
    const badge = product.is_new
        ? 'Nuevo'
        : product.is_bestseller
            ? 'Best Seller'
            : product.is_featured
                ? 'Premium'
                : null;

    // Calcular descuento
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
                'hover:border-primary-700/80 hover:shadow-2xl hover:-translate-y-1.5',
                isVape ? 'hover:shadow-vape-500/5' : 'hover:shadow-herbal-500/5',
                className
            )}
            style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'both',
            }}
        >
            {/* Imagen */}
            <div
                className={cn(
                    'relative flex h-52 items-center justify-center overflow-hidden',
                    isVape
                        ? 'bg-gradient-to-br from-vape-500/8 via-primary-900/50 to-vape-600/5'
                        : 'bg-gradient-to-br from-herbal-500/8 via-primary-900/50 to-herbal-600/5'
                )}
            >
                {product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className={cn(
                            'text-4xl font-bold opacity-10',
                            isVape ? 'text-vape-500' : 'text-herbal-500'
                        )}
                    >
                        VSM
                    </div>
                )}

                {/* Overlay en hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Badge principal */}
                {badge && (
                    <span
                        className={cn(
                            'absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md',
                            badge === 'Nuevo' && 'animate-pulse-glow',
                            isVape
                                ? 'bg-vape-500/20 text-vape-300 border border-vape-400/20 shadow-lg shadow-vape-500/10'
                                : 'bg-herbal-500/20 text-herbal-300 border border-herbal-400/20 shadow-lg shadow-herbal-500/10'
                        )}
                    >
                        {badge}
                    </span>
                )}

                {/* Badge de descuento */}
                {discount && (
                    <span className="absolute top-3 right-3 rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-red-500/20">
                        -{discount}%
                    </span>
                )}

                {/* Quick actions en hover */}
                <div className="absolute bottom-3 right-3 flex gap-2 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                        onClick={handleQuickAdd}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md transition-all hover:scale-105 active:scale-95',
                            isVape
                                ? 'bg-vape-500/80 hover:bg-vape-500 shadow-lg shadow-vape-500/25'
                                : 'bg-herbal-500/80 hover:bg-herbal-500 shadow-lg shadow-herbal-500/25'
                        )}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Agregar
                    </button>
                    <span
                        className="flex items-center rounded-xl bg-primary-900/80 px-2.5 py-2 text-primary-300 backdrop-blur-md transition-all hover:bg-primary-800"
                    >
                        <Eye className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>

            {/* Info del producto */}
            <div className="p-4 space-y-2">
                {/* Nombre */}
                <h3 className="text-sm font-semibold text-primary-100 line-clamp-1 group-hover:text-white transition-colors duration-300">
                    {product.name}
                </h3>

                {/* Short description */}
                {product.short_description && (
                    <p className="text-xs text-primary-500 line-clamp-2 leading-relaxed">
                        {product.short_description}
                    </p>
                )}

                {/* Precios */}
                <div className="flex items-baseline gap-2 pt-1">
                    <span
                        className={cn(
                            'text-lg font-bold',
                            isVape ? 'text-vape-400' : 'text-herbal-400'
                        )}
                    >
                        {formatPrice(product.price)}
                    </span>

                    {/* Precio anterior tachado */}
                    {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-xs text-primary-600 line-through">
                            {formatPrice(product.compare_at_price)}
                        </span>
                    )}
                </div>

                {/* Tags (máximo 3) */}
                {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                        {product.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md bg-primary-800/40 px-1.5 py-0.5 text-[10px] text-primary-500 border border-primary-800/30"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom accent line */}
            <div className={cn(
                'h-0.5 w-0 transition-all duration-500 group-hover:w-full',
                isVape
                    ? 'bg-gradient-to-r from-vape-500 to-vape-400'
                    : 'bg-gradient-to-r from-herbal-500 to-herbal-400'
            )} />
        </Link>
    );
}
