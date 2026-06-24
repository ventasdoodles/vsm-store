/**
 * ProductCard Component — VSM Store
 *
 * Componente core para la visualización de productos en rejillas y rieles.
 * Incluye acciones rápidas, animaciones premium y soporte para estados de carga.
 *
 * @author VSM Store
 * @version 1.1.0
 */
import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Package, Plus, Check, MessageCircle, PackageX } from 'lucide-react';
import { m } from 'framer-motion';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useNotification } from '@/hooks/useNotification';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useQueryClient } from '@tanstack/react-query';
import { getProductBySlug } from '@/services';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { useSafety } from '@/contexts/SafetyContext';
import { getStorefrontProductPurchaseability } from '@/lib/domain/products';
import { getVape420ProductSurfacePresentationConfig } from '@/config/productization';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';
import { SITE_CONFIG } from '@/config/site';

import { ProductBadgeGroup } from './ProductBadgeGroup';

// Lazy-load: QuickViewModal solo se descarga al abrir "Vista Rápida"
const QuickViewModal = lazy(() => import('./QuickViewModal').then(m => ({ default: m.QuickViewModal })));

interface ProductCardProps {
    product: Product;
    className?: string;
    compact?: boolean;
    priority?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, className, compact = false, priority = false }: ProductCardProps) {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);
    const spotlightBoundsRef = useRef<DOMRect | null>(null);
    const spotlightFrameRef = useRef<number | null>(null);
    const spotlightPointRef = useRef({ x: 0, y: 0 });
    const addItem = useCartStore((s) => s.addItem);
    const toggleItem = useWishlistStore((s) => s.toggleItem);
    const isWishlisted = useWishlistStore((s) => s.isInWishlist(product.id));
    const { playClick, playSuccess, triggerHaptic } = useTacticalUI();
    const { isEmergency } = useSafety();
    const notify = useNotification();
    const queryClient = useQueryClient();

    const spotlightEnabled = useMemo(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(hover: hover) and (pointer: fine)').matches && !('ontouchstart' in window);
    }, []);

    useEffect(() => {
        return () => {
            if (spotlightFrameRef.current !== null) {
                cancelAnimationFrame(spotlightFrameRef.current);
            }
        };
    }, []);

    const productHref = useMemo(() => `/${product.section}/${product.slug}`, [product.section, product.slug]);
    const purchaseability = useMemo(() => getStorefrontProductPurchaseability(product), [product]);
    const { config } = useActiveVerticalPack();
    const productSurfaceConfig = useMemo(
        () => config ? getVape420ProductSurfacePresentationConfig(config, product.section) : null,
        [config, product.section],
    );
    const requiresOptionSelection = purchaseability.requiresVariantSelection;
    const shouldShowImageDots = product.images?.length > 1;
    const showLowStockBadge = !compact && purchaseability.canAddToCart && purchaseability.maxQuantity <= 5 && purchaseability.maxQuantity > 0;
    const whatsappUrl = useMemo(
        () => `https://wa.me/${SITE_CONFIG.whatsapp.number}?text=Hola, me interesa ${product.name}`,
        [product.name]
    );

    const handleQuickAdd = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (requiresOptionSelection) {
            playClick();
            setIsQuickViewOpen(true);
            return;
        }
        if (!purchaseability.canAddToCart) {
            return;
        }
        playSuccess();
        triggerHaptic([10, 30, 10]);
        addItem(product, 1);
        notify.success('Agregado', `${product.name} agregado al carrito`);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    }, [addItem, notify, playClick, playSuccess, product, purchaseability.canAddToCart, requiresOptionSelection, triggerHaptic]);

    const handleWishlist = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        triggerHaptic(10);
        toggleItem(product);
        notify.success(
            isWishlisted ? 'Eliminado' : 'Agregado',
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos'
        );
    }, [isWishlisted, notify, playClick, product, toggleItem, triggerHaptic]);

    const handleQuickView = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        setIsQuickViewOpen(true);
    }, [playClick]);

    const handlePrefetch = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: ['products', 'detail', product.section, product.slug],
            queryFn: () => getProductBySlug(product.slug, product.section),
            staleTime: 1000 * 60,
        });
    }, [product.section, product.slug, queryClient]);

    const handleSpotlightEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!spotlightEnabled) {
            return;
        }

        spotlightBoundsRef.current = e.currentTarget.getBoundingClientRect();
    }, [spotlightEnabled]);

    const handleLinkMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        handlePrefetch();
        handleSpotlightEnter(e);
    }, [handlePrefetch, handleSpotlightEnter]);

    const handleSpotlightMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!spotlightEnabled) {
            return;
        }

        const bounds = spotlightBoundsRef.current;
        if (!bounds) {
            return;
        }

        spotlightPointRef.current = {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };

        if (spotlightFrameRef.current !== null) {
            return;
        }

        const target = e.currentTarget;
        spotlightFrameRef.current = requestAnimationFrame(() => {
            spotlightFrameRef.current = null;
            target.style.setProperty('--mouse-x', `${spotlightPointRef.current.x}px`);
            target.style.setProperty('--mouse-y', `${spotlightPointRef.current.y}px`);
        });
    }, [spotlightEnabled]);

    const handleSpotlightLeave = useCallback(() => {
        spotlightBoundsRef.current = null;

        if (spotlightFrameRef.current !== null) {
            cancelAnimationFrame(spotlightFrameRef.current);
            spotlightFrameRef.current = null;
        }
    }, []);

    const handleImageMouseEnter = useCallback(() => {
        if (product.images?.length > 1) {
            setCurrentImage(1);
        }
    }, [product.images]);

    const handleImageMouseLeave = useCallback(() => {
        setCurrentImage(0);
    }, []);

    const handleQuickViewClose = useCallback(() => {
        setIsQuickViewOpen(false);
    }, []);

    const handlePrimaryAction = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (isEmergency) {
            e.preventDefault();
            window.open(whatsappUrl, '_blank');
            return;
        }

        handleQuickAdd(e);
    }, [handleQuickAdd, isEmergency, whatsappUrl]);

    return (
        <>
            <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn('block h-full group', className)}
            >
                <Link
                    to={productHref}
                    className="block h-full relative"
                    onMouseEnter={handleLinkMouseEnter}
                    onMouseMove={spotlightEnabled ? handleSpotlightMove : undefined}
                    onMouseLeave={spotlightEnabled ? handleSpotlightLeave : undefined}
                >
                    <div
                        className="relative glass-premium rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full flex flex-col isolation-auto border border-white/5"
                    >
                        {/* Spotlight Effect Layer */}
                        {spotlightEnabled && (
                            <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                                style={{
                                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)`
                                }}
                            />
                        )}

                        {/* Image Container */}
                        <div
                            className="relative aspect-square overflow-hidden bg-slate-900/40"
                            onMouseEnter={handleImageMouseEnter}
                            onMouseLeave={handleImageMouseLeave}
                        >
                            <m.div
                                className="h-full w-full"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <OptimizedImage
                                    src={product.images?.[currentImage] || product.cover_image || ''}
                                    alt={product.name}
                                    priority={priority}
                                    width={400}
                                    height={400}
                                    containerClassName="h-full w-full"
                                    className="object-cover"
                                    fallbackIcon={<Package className="w-16 h-16 text-white/10" />}
                                />
                            </m.div>

                            {/* Hover Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Image dots indicator */}
                            {shouldShowImageDots && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {product.images.slice(0, 4).map((_, idx) => (
                                        <m.span
                                            key={idx}
                                            animate={{
                                                width: currentImage === idx ? 16 : 6,
                                                backgroundColor: currentImage === idx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)'
                                            }}
                                            className="h-1.5 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Badges (Top-left) — Single source of truth */}
                            <div className="absolute top-4 left-4 z-10">
                                <ProductBadgeGroup product={product} />
                            </div>

                            {/* Wishlist Button (Top-right) */}
                            {!compact && (
                                <m.button
                                    onClick={handleWishlist}
                                    initial={{ x: 20, opacity: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    animate={{
                                        x: 0,
                                        opacity: 1,
                                    }}
                                    className={cn(
                                        "absolute top-4 right-4 z-10 w-10 h-10 backdrop-blur-xl rounded-full flex items-center justify-center transition-all shadow-xl border border-white/10",
                                        isWishlisted
                                            ? "bg-red-500 text-white border-red-400"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4 transition-all", isWishlisted && "fill-current")} />
                                </m.button>
                            )}

                            {/* Quick actions desktop */}
                            {config && productSurfaceConfig && (
                                <div className="absolute top-2 right-2 flex flex-col gap-2 translate-x-4 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100 hidden md:flex z-10">
                                    <button
                                        onClick={handleQuickView}
                                        className="flex-1 h-12 bg-white text-slate-900 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-[10px] tracking-widest shadow-xl active:scale-95"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleQuickAdd}
                                        disabled={!purchaseability.canAddToCart && !requiresOptionSelection}
                                        className={cn(
                                            "h-12 bg-slate-900/90 backdrop-blur-xl hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all shadow-xl border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                            (!purchaseability.canAddToCart || requiresOptionSelection) ? "px-4 w-auto" : "w-12",
                                            isEmergency && "bg-green-600 hover:bg-green-500 border-green-400"
                                        )}
                                    >
                                        {isEmergency ? (
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        ) : (
                                            requiresOptionSelection ? <span className="text-[10px] font-black tracking-widest uppercase">VER OPCIONES</span> : (
                                                !purchaseability.canAddToCart ? <span className="text-[10px] font-black tracking-widest uppercase">{purchaseability.ctaLabel}</span> : (
                                                    isAdded ? <Check className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : <ShoppingCart className="w-5 h-5 transition-transform hover:scale-110" />
                                                )
                                            )
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="p-6 flex-1 flex flex-col relative justify-between bg-gradient-to-b from-transparent to-black/30">
                            {/* Contenido principal */}
                            <Link to={productHref} className="p-4 flex flex-col flex-1 relative z-10">
                                {/* Brand / Section - Usando la configuración inyectada */}
                                <div className="mb-2">
                                    {config && productSurfaceConfig ? (
                                        <span className={cn(
                                            'text-[10px] font-black uppercase tracking-widest',
                                            productSurfaceConfig.productChipClassName,
                                        )}>
                                            {productSurfaceConfig.isVape ? 'Vape' : '420'}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                                            {' '}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border",
                                        productSurfaceConfig?.productChipClassName
                                    )}>
                                        {product.section}
                                    </span>
                                    {/* Stock Pulse Indicator */}
                                    {showLowStockBadge && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                                {purchaseability.maxQuantity <= 3
                                                    ? `Stock limitado: ${purchaseability.maxQuantity} unidades`
                                                    : `Disponibilidad limitada: ${purchaseability.maxQuantity} unidades`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <h3 className={cn(
                                    "font-black text-white leading-tight transition-colors line-clamp-2 tracking-tight",
                                    productSurfaceConfig?.productTitleHoverClassName,
                                    compact ? "text-base" : "text-xl"
                                )}>
                                    {product.name}
                                </h3>
                            </div>

                            <div className="mt-6 flex items-end justify-between">
                                <div className="flex flex-col">
                                    {/* Precios */}
                                    <div className="mt-auto pt-3 flex items-baseline gap-2">
                                        {config && productSurfaceConfig ? (
                                            <span className={cn(
                                                'text-lg font-bold',
                                                productSurfaceConfig.priceAccentTextClassName,
                                            )}>
                                                {formatPrice(product.price)}
                                            </span>
                                        ) : (
                                            <span className="text-lg font-bold text-theme-primary">
                                                {formatPrice(product.price)}
                                            </span>
                                        )}
                                        {product.compare_at_price && product.compare_at_price > product.price && (
                                            <span className="text-sm text-theme-tertiary line-through">
                                                {formatPrice(product.compare_at_price)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <m.button
                                    whileHover={{ scale: 1.1, rotate: 8 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handlePrimaryAction}
                                    disabled={!purchaseability.canAddToCart && !requiresOptionSelection}
                                    className={cn(
                                        "flex h-12 rounded-2xl border items-center justify-center transition-all shadow-inner disabled:opacity-20",
                                        isAdded 
                                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                                            : "bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-900",
                                        (!purchaseability.canAddToCart || requiresOptionSelection) ? "px-4 w-auto" : "w-12",
                                        isEmergency && !isAdded && "bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600 hover:text-white"
                                    )}
                                >
                                    {isEmergency ? (
                                        <MessageCircle className="w-6 h-6" />
                                    ) : (
                                        requiresOptionSelection ? <Eye className="w-6 h-6" /> : (
                                            !purchaseability.canAddToCart ? <PackageX className="w-6 h-6" /> : (
                                                isAdded ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />
                                            )
                                        )
                                    )}
                                </m.button>
                            </div>
                        </div>
                    </div>
                </Link>
            </m.div>

            {/* Quick View Modal — lazy-loaded, solo se descarga al abrir */}
            {isQuickViewOpen && (
                <Suspense fallback={null}>
                    <QuickViewModal
                        product={product}
                        isOpen={isQuickViewOpen}
                        onClose={handleQuickViewClose}
                    />
                </Suspense>
            )}
        </>
    );
});
