import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, PackageX, Minus, Plus, Check, Truck } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { ShareButton } from './ShareButton';
import { TrustBadges } from '@/components/products/TrustBadges';
import { StickyAddToCart } from '@/components/products/StickyAddToCart';
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

    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const { success } = useNotification();

    // Control de Sticky Bar
    const mainButtonRef = useRef<HTMLDivElement>(null);
    const [showSticky, setShowSticky] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;

                // Mostrar sticky solo cuando el botón principal NO es visible y estamos scrolleando hacia abajo (fuera de pantalla por arriba)
                // Pero simplifiquemos: si no es visible, mostrar sticky.
                // Ajuste: si el botón está arriba del viewport, mostrar.
                const isAbove = entry.boundingClientRect.top < 0;
                setShowSticky(!entry.isIntersecting && isAbove);
            },
            { threshold: 0 }
        );

        if (mainButtonRef.current) {
            observer.observe(mainButtonRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Badges activos y válidos (que no hayan expirado)
    const now = new Date();
    const isNewValid = product.is_new && (!product.is_new_until || new Date(product.is_new_until) > now);
    const isFeaturedValid = product.is_featured && (!product.is_featured_until || new Date(product.is_featured_until) > now);
    const isBestsellerValid = product.is_bestseller && (!product.is_bestseller_until || new Date(product.is_bestseller_until) > now);

    const badges: string[] = [];
    if (isNewValid) badges.push('Nuevo');
    if (isBestsellerValid) badges.push('Best Seller');
    if (isFeaturedValid) badges.push('Premium');

    // Agregar al carrito
    const handleAddToCart = () => {
        addItem(product, quantity);
        setJustAdded(true);
        success('¡Agregado!', `${product.name} agregado al carrito`);
        setTimeout(() => {
            setJustAdded(false);
            openCart();
        }, 600);
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
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-primary-600 line-through">
                            {formatPrice(product.compare_at_price)}
                        </span>
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-400 border border-red-500/20">
                            -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Envío gratis badge */}
            <div className="flex items-center gap-2 rounded-lg bg-herbal-500/5 border border-herbal-500/15 px-3 py-2">
                <Truck className="h-4 w-4 text-herbal-400" />
                <span className="text-xs font-medium text-herbal-400">Envío gratis en Xalapa</span>
            </div>

            {/* Separador */}
            <hr className="border-primary-800/40" />

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

            {/* Selector de cantidad + Botón agregar + Share */}
            {inStock && (
                <div className="space-y-6" ref={mainButtonRef}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex items-center gap-3 flex-1">
                            {/* Selector de cantidad */}
                            <div className="flex items-center rounded-xl border border-primary-800 bg-primary-900">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="rounded-l-xl px-3 py-2.5 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-semibold text-primary-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                    className="rounded-r-xl px-3 py-2.5 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Botón agregar */}
                            <button
                                onClick={handleAddToCart}
                                disabled={justAdded}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                                    justAdded
                                        ? 'bg-herbal-500 text-white'
                                        : isVape
                                            ? 'bg-vape-500 text-white shadow-lg shadow-vape-500/25 hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                            : 'bg-herbal-500 text-white shadow-lg shadow-herbal-500/25 hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5 active:translate-y-0'
                                )}
                            >
                                {justAdded ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        ¡Agregado!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-4 w-4" />
                                        Agregar al carrito
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Botón compartir */}
                        <ShareButton product={product} className="w-full sm:w-auto justify-center" />
                    </div>

                    {/* Trust Badges */}
                    <TrustBadges section={product.section} />
                </div>
            )}

            {/* Botón agotado */}
            {!inStock && (
                <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold cursor-not-allowed bg-primary-800/50 text-primary-600 border border-primary-800/30"
                >
                    <PackageX className="h-4 w-4" />
                    Agotado
                </button>
            )}

            {/* Sticky mobile cart bar */}
            {inStock && (
                <StickyAddToCart product={product} isVisible={showSticky} />
            )}
        </div>
    );
}

