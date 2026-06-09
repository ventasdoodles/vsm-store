/**
 * ProductActions — Selector de cantidad, boton de agregar y compartir.
 *
 * @module ProductActions
 * @independent Maneja su propio estado de cantidad e interaccion con el carrito.
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { ShoppingCart, Minus, Plus, Check, PackageX, Heart } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useNotification } from '@/hooks/useNotification';
import { useHaptic } from '@/hooks/useHaptic';
import { ShareButton } from './ShareButton';
import { StickyAddToCart } from './StickyAddToCart';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';
import { motion, AnimatePresence } from 'framer-motion';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '@/lib/domain/products';
import { getVape420ProductDetailPresentationConfig } from '@/config/productization';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const { config } = useActiveVerticalPack();
    const productDetailConfig = useMemo(
        () => config ? getVape420ProductDetailPresentationConfig(config, product.section) : null,
        [config, product.section],
    );

    if (!config || !productDetailConfig) return null;

    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);
    const { toggleItem, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);

    const variations = useMemo(() => product.variants || [], [product.variants]);
    const hasVariations = variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<typeof variations[0] | null>(null);

    const purchaseability = useMemo(
        () => getStorefrontProductPurchaseability(product, { selectedVariant }),
        [product, selectedVariant],
    );
    const maxQuantity = purchaseability.maxQuantity > 0 ? purchaseability.maxQuantity : 1;

    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const { success, warning } = useNotification();
    const { trigger: haptic } = useHaptic();

    useEffect(() => {
        if (hasVariations && !selectedVariant && variations.length > 0) {
            const firstVariant = variations.find((variant) =>
                getStorefrontProductPurchaseability(product, { selectedVariant: variant }).canAddToCart,
            ) ?? variations[0];

            if (firstVariant) {
                setSelectedVariant(firstVariant);
            }
        }
    }, [variations, hasVariations, product, selectedVariant]);

    useEffect(() => {
        setQuantity((current) => Math.min(Math.max(1, current), maxQuantity));
    }, [maxQuantity]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [showSticky, setShowSticky] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                const isAbove = entry.boundingClientRect.top < 0;
                setShowSticky(!entry.isIntersecting && isAbove);
            },
            { threshold: 0 },
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleAddToCart = () => {
        if (!purchaseability.canAddToCart) {
            warning('Compra no disponible', purchaseability.detail);
            return;
        }

        haptic('success');
        const variantToken = selectedVariant
            ? {
                id: selectedVariant.id,
                name: getVariantDisplayName(selectedVariant),
            }
            : null;

        addItem(product, quantity, variantToken);
        setJustAdded(true);
        success('¡Agregado!', `${product.name} ${variantToken ? `(${variantToken.name})` : ''} agregado al carrito`);
        setTimeout(() => {
            setJustAdded(false);
            openCart();
        }, 600);
    };

    return (
        <div className="space-y-6" ref={containerRef}>
            {hasVariations && (
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-theme-secondary/60">
                        Selecciona una opción
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {variations.map((variant: ProductVariant) => {
                            const variantPurchaseability = getStorefrontProductPurchaseability(product, {
                                selectedVariant: variant,
                            });
                            const variantUnavailable = !variantPurchaseability.canAddToCart;

                            return (
                                <button
                                    key={variant.id}
                                    onClick={() => {
                                        if (variantUnavailable) return;
                                        haptic('light');
                                        setSelectedVariant(variant);
                                    }}
                                    disabled={variantUnavailable}
                                        className={cn(
                                            'flex flex-col items-center justify-center rounded-xl py-3 px-4 border-2 transition-all text-center',
                                            selectedVariant?.id === variant.id
                                            ? productDetailConfig.actionSelectedVariantClassName
                                            : variantUnavailable
                                                ? 'border-white/5 bg-white/[0.01] text-theme-secondary/35 cursor-not-allowed'
                                                : 'border-white/5 bg-white/[0.02] text-theme-secondary hover:border-white/10',
                                    )}
                                >
                                    {variant.options?.[0]?.attribute_name && (
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-0.5">
                                            {variant.options[0].attribute_name}
                                        </span>
                                    )}
                                    <span className="text-sm font-bold">
                                        {getVariantDisplayName(variant)}
                                    </span>
                                    {variant.price && variant.price !== product.price && (
                                        <span className="text-[10px] opacity-60 mt-0.5">
                                            Ref: {formatPrice(variant.price)}
                                        </span>
                                    )}
                                    <span className="text-[10px] opacity-60 mt-1">
                                        {variantUnavailable ? 'No disponible' : `${variant.stock} disponible(s)`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {!purchaseability.canAddToCart && (
                <div className="rounded-2xl border border-theme-subtle bg-theme-tertiary/10 px-4 py-3">
                    <p className="text-sm font-medium text-theme-secondary">
                        {purchaseability.detail}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 flex items-center gap-3">
                    <div className="vsm-input-group shrink-0 h-14 px-2">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                haptic('light');
                                setQuantity((q) => Math.max(1, q - 1));
                            }}
                            className="vsm-btn-icon text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
                        >
                            <Minus className="h-5 w-5" />
                        </motion.button>
                        <span className="w-10 text-center text-lg font-black text-theme-primary">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={quantity}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.15 }}
                                    className="inline-block"
                                >
                                    {quantity}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                haptic('light');
                                setQuantity((q) => Math.min(maxQuantity, q + 1));
                            }}
                            disabled={!purchaseability.canAddToCart || quantity >= maxQuantity}
                            className="vsm-btn-icon text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-5 w-5" />
                        </motion.button>
                    </div>

                    <motion.button
                        whileHover={{ scale: purchaseability.canAddToCart ? 1.02 : 1 }}
                        whileTap={{ scale: purchaseability.canAddToCart ? 0.95 : 1 }}
                        onClick={handleAddToCart}
                        disabled={justAdded || !purchaseability.canAddToCart}
                        className={cn(
                            'vsm-btn h-14 px-6 group relative flex-1 flex items-center justify-center gap-3 overflow-hidden rounded-2xl transition-all',
                            justAdded
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                : !purchaseability.canAddToCart
                                    ? 'cursor-not-allowed bg-theme-tertiary/20 text-theme-secondary border border-theme-subtle'
                                    : productDetailConfig.actionPrimaryButtonClassName,
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {justAdded ? (
                                <motion.div
                                    key="added"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="flex items-center gap-2"
                                >
                                    <Check className="h-6 w-6 shrink-0" />
                                    <span className="font-black uppercase tracking-wider text-sm">¡Agregado!</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="add"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    {purchaseability.canAddToCart ? (
                                        <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform shrink-0" />
                                    ) : (
                                        <PackageX className="h-5 w-5 shrink-0" />
                                    )}
                                    <span className="font-black uppercase tracking-wider text-sm whitespace-nowrap">
                                        {purchaseability.canAddToCart ? 'Añadir al Carrito' : purchaseability.ctaLabel}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!justAdded && purchaseability.canAddToCart && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                        )}
                    </motion.button>
                </div>

                <div className="col-span-12 sm:col-span-12 flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            haptic('light');
                            toggleItem(product);
                            success(
                                isWishlisted ? 'Eliminado' : 'Agregado',
                                isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos',
                            );
                        }}
                        className={cn(
                            'h-14 flex-1 flex items-center justify-center gap-2 rounded-2xl transition-all vsm-border',
                            isWishlisted
                                ? 'bg-red-500/15 border-red-500/30 text-red-500'
                                : 'glass-premium text-theme-secondary hover:text-red-500 hover:border-red-500/30',
                        )}
                        aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                        <Heart className={cn('w-5 h-5 transition-all', isWishlisted && 'fill-red-500')} />
                        <span className="text-xs font-bold uppercase tracking-widest leading-none">
                            {isWishlisted ? 'Guardado' : 'Favoritos'}
                        </span>
                    </motion.button>

                    <ShareButton
                        product={product}
                        className="flex-1 h-14 rounded-2xl glass-premium border-theme flex items-center justify-center gap-2 text-theme-secondary hover:text-theme-primary transition-all"
                    />
                </div>
            </div>

            <StickyAddToCart
                product={product}
                isVisible={showSticky}
                selectedVariant={selectedVariant}
                purchaseability={purchaseability}
            />
        </div>
    );
}

