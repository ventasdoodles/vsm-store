import { X, ShoppingCart, ExternalLink, Heart, ZoomIn, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { cn, formatPrice } from '@/lib/utils';
import { UrgencyIndicators } from './UrgencyIndicators';
import { useNotification } from '@/hooks/useNotification';
import type { Product } from '@/types/product';
import { useHaptic } from '@/hooks/useHaptic';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const { trigger: haptic } = useHaptic();
    const notify = useNotification();
    const isWishlisted = isInWishlist(product.id);

    const modalRef = useRef<HTMLDivElement>(null);

    // Apply custom focus trap
    useFocusTrap(modalRef, isOpen);

    // Close on ESC key
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
        haptic('success');
        addItem(product, quantity);
        notify.success('Agregado', `${product.name} agregado al carrito`);
    };

    const handleWishlist = () => {
        haptic('light');
        toggleItem(product);
        notify.success(
            isWishlisted ? 'Eliminado' : 'Agregado',
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos'
        );
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={product.name}
                className="relative bg-theme-primary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5 text-theme-primary" />
                </button>

                {/* Content */}
                <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-theme-secondary rounded-xl overflow-hidden relative group">
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-20 h-20 text-theme-secondary" />
                                </div>
                            )}

                            {/* Zoom Indicator */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <div className="bg-white/90 rounded-full p-3">
                                    <ZoomIn className="w-6 h-6 text-theme-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {product.images.map((image, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-accent-primary ring-2 ring-accent-primary/50'
                                            : 'border-theme hover:border-theme-secondary'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-4">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            {product.is_new && (!product.is_new_until || new Date(product.is_new_until) > new Date()) && (
                                <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-xs font-semibold rounded-full">
                                    NUEVO
                                </span>
                            )}
                            {product.is_bestseller && (!product.is_bestseller_until || new Date(product.is_bestseller_until) > new Date()) && (
                                <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-semibold rounded-full">
                                    MÁS VENDIDO
                                </span>
                            )}
                            {product.is_featured && (!product.is_featured_until || new Date(product.is_featured_until) > new Date()) && (
                                <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary text-xs font-semibold rounded-full">
                                    DESTACADO
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-theme-primary">
                            {product.name}
                        </h2>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-theme-primary">
                                {formatPrice(product.price)}
                            </span>
                            {product.compare_at_price && (
                                <>
                                    <span className="text-lg text-theme-secondary line-through">
                                        {formatPrice(product.compare_at_price)}
                                    </span>
                                    <span className="px-2 py-1 bg-red-500/10 text-red-500 text-sm font-semibold rounded">
                                        {Math.round(
                                            ((product.compare_at_price - product.price) /
                                                product.compare_at_price) *
                                            100
                                        )}
                                        % OFF
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Description */}
                        {product.short_description && (
                            <p className="text-theme-secondary leading-relaxed">
                                {product.short_description}
                            </p>
                        )}

                        {/* Urgency & Stock Status */}
                        <div className="py-2">
                            <UrgencyIndicators stock={product.stock} />
                        </div>

                        {/* Quantity Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-theme-primary">
                                Cantidad
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span className="w-12 text-center font-semibold text-theme-primary">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        setQuantity(Math.min(product.stock, quantity + 1))
                                    }
                                    className="w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors"
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 h-12 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-theme-secondary disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Añadir
                            </button>

                            <button
                                onClick={handleWishlist}
                                className={cn(
                                    'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                                    isWishlisted
                                        ? 'bg-red-500/10 text-red-500'
                                        : 'bg-theme-secondary hover:bg-theme-tertiary text-theme-primary'
                                )}
                            >
                                <Heart className={cn('w-5 h-5', isWishlisted && 'fill-current')} />
                            </button>
                        </div>

                        {/* View Full Details */}
                        <Link
                            to={`/${product.section}/${product.slug}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 h-10 text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                        >
                            Ver detalles completos
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
