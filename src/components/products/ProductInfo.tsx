// Info detallada de producto - VSM Store
import { ShoppingCart, PackageX } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductInfoProps {
    product: Product;
}

/**
 * Información completa del producto: nombre, badges, precios, descripción, tags, stock, botón
 */
export function ProductInfo({ product }: ProductInfoProps) {
    const isVape = product.section === 'vape';
    const inStock = product.stock > 0;

    // Badges activos
    const badges: string[] = [];
    if (product.is_new) badges.push('Nuevo');
    if (product.is_bestseller) badges.push('Best Seller');
    if (product.is_featured) badges.push('Premium');

    // Agregar al carrito (placeholder)
    const handleAddToCart = () => {
        // TODO: implementar lógica de carrito
        console.log('Agregar al carrito:', product.id, product.name);
        alert(`"${product.name}" agregado al carrito`);
    };

    return (
        <div className="space-y-5">
            {/* Badges */}
            {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                        <span
                            key={badge}
                            className={cn(
                                'rounded-full px-3 py-1 text-xs font-semibold',
                                isVape
                                    ? 'bg-vape-500/15 text-vape-400 border border-vape-500/20'
                                    : 'bg-herbal-500/15 text-herbal-400 border border-herbal-500/20'
                            )}
                        >
                            {badge}
                        </span>
                    ))}
                </div>
            )}

            {/* Nombre */}
            <h1 className="text-2xl font-bold text-primary-100 sm:text-3xl">
                {product.name}
            </h1>

            {/* Short description */}
            {product.short_description && (
                <p className="text-sm text-primary-400 leading-relaxed sm:text-base">
                    {product.short_description}
                </p>
            )}

            {/* Precios */}
            <div className="flex items-baseline gap-3">
                <span
                    className={cn(
                        'text-3xl font-extrabold',
                        isVape ? 'text-vape-400' : 'text-herbal-400'
                    )}
                >
                    {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                    <div className="flex flex-col">
                        <span className="text-sm text-primary-600 line-through">
                            {formatPrice(product.compare_at_price)}
                        </span>
                        <span className="text-xs font-medium text-green-500">
                            -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Separador */}
            <hr className="border-primary-800" />

            {/* Descripción completa */}
            {product.description && (
                <div>
                    <h2 className="mb-2 text-sm font-semibold text-primary-300 uppercase tracking-wider">
                        Descripción
                    </h2>
                    <p className="text-sm text-primary-400 leading-relaxed whitespace-pre-line">
                        {product.description}
                    </p>
                </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
                <div>
                    <h2 className="mb-2 text-sm font-semibold text-primary-300 uppercase tracking-wider">
                        Etiquetas
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                        {product.tags.map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'rounded-lg px-2.5 py-1 text-xs',
                                    isVape
                                        ? 'bg-vape-500/10 text-vape-400/80'
                                        : 'bg-herbal-500/10 text-herbal-400/80'
                                )}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* SKU */}
            {product.sku && (
                <p className="text-xs text-primary-600">
                    SKU: {product.sku}
                </p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
                <div
                    className={cn(
                        'h-2 w-2 rounded-full',
                        inStock ? 'bg-green-500' : 'bg-red-500'
                    )}
                />
                <span className={cn('text-sm', inStock ? 'text-primary-400' : 'text-red-400')}>
                    {inStock ? `${product.stock} unidades disponibles` : 'Agotado'}
                </span>
            </div>

            {/* Botón agregar al carrito */}
            <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all',
                    inStock
                        ? isVape
                            ? 'bg-vape-500 text-white shadow-lg shadow-vape-500/25 hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0'
                            : 'bg-herbal-500 text-white shadow-lg shadow-herbal-500/25 hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0'
                        : 'cursor-not-allowed bg-primary-800 text-primary-600'
                )}
            >
                {inStock ? (
                    <>
                        <ShoppingCart className="h-4 w-4" />
                        Agregar al carrito
                    </>
                ) : (
                    <>
                        <PackageX className="h-4 w-4" />
                        Agotado
                    </>
                )}
            </button>
        </div>
    );
}
