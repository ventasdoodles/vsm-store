// Tarjeta de producto - VSM Store
import { Link } from 'react-router-dom';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    className?: string;
}

/**
 * Tarjeta visual de un producto con imagen, info y badges
 * Clickeable — navega a /{section}/{slug}
 */
export function ProductCard({ product, className }: ProductCardProps) {
    const isVape = product.section === 'vape';

    // Determinar badge principal (prioridad: nuevo > bestseller > featured)
    const badge = product.is_new
        ? 'Nuevo'
        : product.is_bestseller
            ? 'Best Seller'
            : product.is_featured
                ? 'Premium'
                : null;

    return (
        <Link
            to={`/${product.section}/${product.slug}`}
            className={cn(
                'group relative block overflow-hidden rounded-2xl border border-primary-800 bg-primary-900/50',
                'transition-all duration-300 cursor-pointer',
                'hover:border-primary-700 hover:shadow-xl hover:shadow-primary-950/50 hover:-translate-y-1',
                className
            )}
        >
            {/* Imagen */}
            <div
                className={cn(
                    'relative flex h-48 items-center justify-center overflow-hidden',
                    isVape
                        ? 'bg-gradient-to-br from-vape-500/10 to-vape-600/5'
                        : 'bg-gradient-to-br from-herbal-500/10 to-herbal-600/5'
                )}
            >
                {product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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

                {/* Badge */}
                {badge && (
                    <span
                        className={cn(
                            'absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm',
                            isVape
                                ? 'bg-vape-500/20 text-vape-300 border border-vape-500/20'
                                : 'bg-herbal-500/20 text-herbal-300 border border-herbal-500/20'
                        )}
                    >
                        {badge}
                    </span>
                )}
            </div>

            {/* Info del producto */}
            <div className="p-4">
                {/* Nombre */}
                <h3 className="mb-1 text-sm font-semibold text-primary-100 line-clamp-1 group-hover:text-white transition-colors">
                    {product.name}
                </h3>

                {/* Short description */}
                {product.short_description && (
                    <p className="mb-2 text-xs text-primary-500 line-clamp-2">
                        {product.short_description}
                    </p>
                )}

                {/* Precios */}
                <div className="flex items-center gap-2">
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
                    <div className="mt-2 flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md bg-primary-800/60 px-1.5 py-0.5 text-[10px] text-primary-500"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
