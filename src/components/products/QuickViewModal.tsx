import { X, ShoppingCart, Heart, Package, Plus, Minus, ChevronRight, PackageX, Truck } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { cn, formatPrice } from '@/lib/utils';
import { UrgencyIndicators } from './UrgencyIndicators';
import { useInventoryOracle } from '@/hooks/useInventoryOracle';
import { StockOracleBadge } from './StockOracleBadge';
import { useNotification } from '@/hooks/useNotification';
import type { Product } from '@/types/product';
import { useHaptic } from '@/hooks/useHaptic';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { ProductBadgeGroup } from './ProductBadgeGroup';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '@/lib/domain/products';
import { getVape420ProductDetailPresentationConfig } from '@/config/productization';

import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const { config } = useActiveVerticalPack();
    const { prediction, isLoading: isOracleLoading } = useInventoryOracle(product.id, product.stock);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const selectedImageSrc = product.images?.[selectedImage] || product.cover_image || '';
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const { trigger: haptic } = useHaptic();
    const notify = useNotification();
    const isWishlisted = isInWishlist(product.id);

    const variations = useMemo(() => product.variants || [], [product.variants]);
    const hasVariations = variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<typeof variations[0] | null>(null);
    const purchaseability = useMemo(
        () => getStorefrontProductPurchaseability(product, { selectedVariant }),
        [product, selectedVariant],
    );
    const productDetailConfig = useMemo(
        () => config ? getVape420ProductDetailPresentationConfig(config, product.section) : null,
        [config, product.section],
    );
    const maxQuantity = purchaseability.maxQuantity > 0 ? purchaseability.maxQuantity : 1;

    useEffect(() => {
        if (hasVariations && !selectedVariant && variations.length > 0) {
            const firstVariant = variations.find((variant) =>
                getStorefrontProductPurchaseability(product, { selectedVariant: variant }).canAddToCart,
            ) ?? variations[0];

            setSelectedVariant(firstVariant ?? null);
        }
    }, [product, variations, hasVariations, selectedVariant]);



    useEffect(() => {
        setQuantity((current) => Math.min(Math.max(1, current), maxQuantity));
    }, [maxQuantity]);

    const modalRef = useRef<HTMLDivElement>(null);

    useFocusTrap(modalRef, isOpen);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleAddToCart = () => {
        if (!purchaseability.canAddToCart) {
            notify.warning('Compra no disponible', purchaseability.detail);
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
        notify.success('Agregado', `${product.name} ${variantToken ? `(${variantToken.name})` : ''} agregado al carrito`);
    };

    const handleWishlist = () => {
        haptic('light');
        toggleItem(product);
        notify.success(
            isWishlisted ? 'Eliminado' : 'Agregado',
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos',
        );
    };

    if (!config || !productDetailConfig) return null;
    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />

                    <m.div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={product.name}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900/60 backdrop-blur-[40px] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col md:flex-row pointer-events-auto isolation-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-vape-500/10 blur-[120px] rounded-full -z-10" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-herbal-500/10 blur-[120px] rounded-full -z-10" />

                        <m.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center transition-colors shadow-xl"
                        >
                            <X className="w-6 h-6 text-white" />
                        </m.button>

                        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col gap-6">
                            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/40 border border-white/5 group shadow-inner">
                                <AnimatePresence mode="wait">
                                    <m.div
                                        key={selectedImage}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full h-full"
                                    >
                                        {selectedImageSrc ? (
                                            <OptimizedImage
                                                src={selectedImageSrc}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-24 h-24 text-white/5" />
                                            </div>
                                        )}
                                    </m.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                    {product.images.map((image, idx) => (
                                        <m.button
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedImage(idx)}
                                                    className={cn(
                                                        'relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border transition-all duration-300',
                                                    selectedImage === idx
                                                        ? productDetailConfig.quickViewSelectedThumbnailClassName
                                                        : 'border-white/10 hover:border-white/30 grayscale hover:grayscale-0',
                                                )}
                                        >
                                            <OptimizedImage
                                                src={image}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        </m.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-[45%] p-6 md:p-10 bg-white/[0.02] border-l border-white/5 flex flex-col justify-between overflow-y-auto">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <ProductBadgeGroup product={product} />
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tighter">
                                        {product.name}
                                    </h2>
                                </div>

                                <div className="flex items-baseline gap-4">
                                    <span className="text-5xl font-black text-white tracking-tighter">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.compare_at_price && (
                                        <div className="flex flex-col">
                                            <span className="text-xl text-white/30 line-through font-bold">
                                                {formatPrice(product.compare_at_price)}
                                            </span>
                                            <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">
                                                -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Badge de Envío DHL */}
                                <div className="vsm-status w-fit bg-emerald-500/10 border-emerald-500/20 text-emerald-500 mt-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                                        <Truck className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Envío por DHL</span>
                                        <span className="text-xs text-emerald-400/70">Cobertura por confirmar</span>
                                    </div>
                                </div>

                                {product.short_description && (
                                    <p className="text-white/60 leading-relaxed text-sm font-medium">
                                        {product.short_description}
                                    </p>
                                )}

                                <div className="space-y-4">
                                    <StockOracleBadge prediction={prediction} isLoading={isOracleLoading} />
                                    <UrgencyIndicators stock={purchaseability.canAddToCart ? maxQuantity : product.stock} />
                                </div>

                                {hasVariations && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            Selecciona una opción
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {variations.map((variant) => {
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
                                                                ? productDetailConfig.quickViewSelectedVariantClassName
                                                                : variantUnavailable
                                                                    ? 'border-white/5 bg-white/[0.01] text-white/25 cursor-not-allowed'
                                                                    : 'border-white/5 bg-white/[0.02] text-white/60 hover:border-white/10',
                                                        )}
                                                    >
                                                        <span className="text-xs font-bold">
                                                            {getVariantDisplayName(variant)}
                                                        </span>
                                                        {variant.price && variant.price !== product.price && (
                                                            <span className="text-[9px] opacity-40 mt-0.5">
                                                                Ref: {formatPrice(variant.price)}
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] opacity-40 mt-1">
                                                            {variantUnavailable ? 'No disponible' : `${variant.stock} disponible(s)`}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {!purchaseability.canAddToCart && (
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-xs font-medium text-white/70">
                                            {purchaseability.detail}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 shadow-inner">
                                            <m.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1}
                                                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </m.button>
                                            <span className="w-10 text-center text-lg font-black text-white">
                                                {quantity}
                                            </span>
                                            <m.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                                                disabled={!purchaseability.canAddToCart || quantity >= maxQuantity}
                                                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </m.button>
                                        </div>

                                        <m.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleWishlist}
                                            className={cn(
                                                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg',
                                                isWishlisted
                                                    ? 'bg-red-500 border-red-400 text-white'
                                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10',
                                            )}
                                        >
                                            <Heart className={cn('w-6 h-6', isWishlisted && 'fill-current')} />
                                        </m.button>
                                    </div>

                                    <m.button
                                        whileHover={{ scale: purchaseability.canAddToCart ? 1.02 : 1, y: purchaseability.canAddToCart ? -4 : 0 }}
                                        whileTap={{ scale: purchaseability.canAddToCart ? 0.98 : 1 }}
                                        onClick={handleAddToCart}
                                        disabled={!purchaseability.canAddToCart}
                                        className="group relative w-full h-16 bg-white rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_30px_60px_rgba(255,255,255,0.15)] transition-all disabled:opacity-20 disabled:cursor-not-allowed overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center gap-3">
                                            {purchaseability.canAddToCart ? (
                                                <ShoppingCart className="w-6 h-6 text-slate-900" />
                                            ) : (
                                                <PackageX className="w-6 h-6 text-slate-900" />
                                            )}
                                            <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">
                                                {purchaseability.canAddToCart ? 'Añadir al Carrito' : purchaseability.ctaLabel}
                                            </span>
                                        </div>
                                        {purchaseability.canAddToCart && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-vape-400 to-herbal-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                                        )}
                                    </m.button>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                <Link
                                    to={`/${product.section}/${product.slug}`}
                                    onClick={onClose}
                                    className="group flex items-center gap-2 text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
                                >
                                    Ver detalles completos
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <div className="flex items-center gap-2 opacity-30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Catálogo actual</span>
                                </div>
                            </div>
                        </div>
                    </m.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
