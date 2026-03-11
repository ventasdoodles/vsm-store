/**
 * ProductActions — Selector de cantidad, botón de agregar y compartir.
 * 
 * @module ProductActions
 * @independent Maneja su propio estado de cantidad e interacción con el carrito.
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
import type { ProductVariant, ProductVariantOption } from '@/types/variant';
import { motion, AnimatePresence } from 'framer-motion';


interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const isVape = product.section === 'vape';
    const inStock = product.stock > 0;

    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);
    const { toggleItem, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);

    // Variaciones (desde la prop product inyectada por el service)
    const variations = useMemo(() => product.variants || [], [product.variants]);
    const hasVariations = variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<typeof variations[0] | null>(null);

    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const { success, warning } = useNotification();
    const { trigger: haptic } = useHaptic();

    // Select first variant by default if exists
    useEffect(() => {
        if (hasVariations && !selectedVariant && variations.length > 0) {
            const firstVariant = variations[0];
            if (firstVariant) {
                setSelectedVariant(firstVariant);
            }
        }
    }, [variations, hasVariations, selectedVariant]);

    // Control de Sticky Bar
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
            { threshold: 0 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleAddToCart = () => {
        if (hasVariations && !selectedVariant) {
            warning('Selecciona una opción', 'Por favor elige una variante antes de añadir al carrito.');
            return;
        }

        haptic('success');
        const variantToken = selectedVariant 
            ? { 
                id: selectedVariant.id, 
                name: selectedVariant.options?.map((o: ProductVariantOption) => o.attribute_value?.value).join(' / ') || 'Variante' 
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

    if (!inStock) {
        return (
            <button
                disabled
                className="vsm-btn flex w-full items-center justify-center gap-2 py-4 text-sm cursor-not-allowed bg-theme-tertiary/20 text-theme-secondary border border-theme-subtle"
            >
                <PackageX className="h-4 w-4" />
                Agotado
            </button>
        );
    }

    return (
        <div className="space-y-6" ref={containerRef}>
            {/* Selector de Variantes */}
            {hasVariations && (
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-theme-secondary/60">
                        Selecciona una opción
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {variations.map((v: ProductVariant) => (
                            <button
                                key={v.id}
                                onClick={() => {
                                    haptic('light');
                                    setSelectedVariant(v);
                                }}
                                className={cn(
                                    "flex flex-col items-center justify-center rounded-xl py-3 px-4 border-2 transition-all text-center",
                                    selectedVariant?.id === v.id
                                        ? isVape
                                            ? "border-vape-500 bg-vape-500/10 text-vape-400"
                                            : "border-herbal-500 bg-herbal-500/10 text-herbal-400"
                                        : "border-white/5 bg-white/[0.02] text-theme-secondary hover:border-white/10"
                                )}
                            >
                                <span className="text-sm font-bold">
                                    {v.options?.map((opt: ProductVariantOption) => opt.attribute_value?.value).join(' / ') || 'Opción'}
                                </span>
                                {v.price && v.price !== product.price && (
                                    <span className="text-[10px] opacity-60 mt-0.5">
                                        Ref: {formatPrice(v.price)}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-3">
                {/* Quantity + Add to Cart Row */}
                <div className="col-span-12 flex items-center gap-3">
                    {/* Selector de cantidad */}
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
                            <AnimatePresence exitBeforeEnter>
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
                                setQuantity((q) => Math.min(product.stock, q + 1));
                            }}
                            className="vsm-btn-icon text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
                        >
                            <Plus className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Botón agregar */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={cn(
                            'vsm-btn h-14 px-6 group relative flex-1 flex items-center justify-center gap-3 overflow-hidden rounded-2xl transition-all',
                            justAdded
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                : isVape
                                    ? 'bg-gradient-to-r from-vape-600 to-vape-500 text-white shadow-xl shadow-vape-500/30 ring-1 ring-vape-400/50'
                                    : 'bg-gradient-to-r from-herbal-600 to-herbal-500 text-white shadow-xl shadow-herbal-500/30 ring-1 ring-herbal-400/50'
                        )}
                    >
                        <AnimatePresence exitBeforeEnter>
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
                                    <ShoppingCart className="h-5 w-5 group-hover:rotate-12 transition-transform shrink-0" />
                                    <span className="font-black uppercase tracking-wider text-sm whitespace-nowrap">Añadir al Carrito</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Shimmer effect */}
                        {!justAdded && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                        )}
                    </motion.button>
                </div>

                {/* Wishlist + Share Row / Col */}
                <div className="col-span-12 sm:col-span-12 flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            haptic('light');
                            toggleItem(product);
                            success(
                                isWishlisted ? 'Eliminado' : 'Agregado',
                                isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos'
                            );
                        }}
                        className={cn(
                            'h-14 flex-1 flex items-center justify-center gap-2 rounded-2xl transition-all vsm-border',
                            isWishlisted
                                ? 'bg-red-500/15 border-red-500/30 text-red-500'
                                : 'glass-premium text-theme-secondary hover:text-red-500 hover:border-red-500/30'
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

            {/* Sticky mobile cart bar */}
            <StickyAddToCart product={product} isVisible={showSticky} />
        </div>
    );
}
