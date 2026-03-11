import { X, ShoppingCart, Heart, Package, Plus, Minus, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
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

    // Variantes
    const variations = useMemo(() => product.variants || [], [product.variants]);
    const hasVariations = variations.length > 0;
    const [selectedVariant, setSelectedVariant] = useState<typeof variations[0] | null>(null);

    // Sincronizar variante inicial
    useEffect(() => {
        if (hasVariations && !selectedVariant && variations.length > 0) {
            setSelectedVariant(variations[0] || null);
        }
    }, [variations, hasVariations, selectedVariant]);

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
        if (hasVariations && !selectedVariant) {
            notify.warning('Selecciona una opción', 'Por favor elige una variante.');
            return;
        }

        haptic('success');
        
        const variantToken = selectedVariant 
            ? { 
                id: selectedVariant.id, 
                name: (selectedVariant as any).options?.map((o: any) => o.attribute_value?.value).join(' / ') || 'Variante' 
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
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos'
        );
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* Modal Window */}
                    <motion.div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={product.name}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900/60 backdrop-blur-[40px] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col md:flex-row pointer-events-auto isolation-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Glows */}
                        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-vape-500/10 blur-[120px] rounded-full -z-10" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-herbal-500/10 blur-[120px] rounded-full -z-10" />

                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center transition-colors shadow-xl"
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.button>

                        {/* Left Side: Media Gallery */}
                        <div className="w-full md:w-[55%] p-6 md:p-10 flex flex-col gap-6">
                            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-black/40 border border-white/5 group shadow-inner">
                                <AnimatePresence exitBeforeEnter>
                                    <motion.div
                                        key={selectedImage}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full h-full"
                                    >
                                        {product.images?.[selectedImage] ? (
                                            <OptimizedImage
                                                src={product.images[selectedImage]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-24 h-24 text-white/5" />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                    {product.images.map((image, idx) => (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedImage(idx)}
                                            className={cn(
                                                "relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border transition-all duration-300",
                                                selectedImage === idx
                                                    ? "border-vape-500 ring-4 ring-vape-500/20 shadow-lg shadow-vape-500/20"
                                                    : "border-white/10 hover:border-white/30 grayscale hover:grayscale-0"
                                            )}
                                        >
                                            <OptimizedImage 
                                                src={image} 
                                                className="w-full h-full object-cover" 
                                                alt="" 
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Info & Actions */}
                        <div className="w-full md:w-[45%] p-6 md:p-10 bg-white/[0.02] border-l border-white/5 flex flex-col justify-between overflow-y-auto">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-3">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border",
                                            product.section === 'vape' ? "bg-vape-500/10 text-vape-400 border-vape-500/20" : "bg-herbal-500/10 text-herbal-400 border-herbal-500/20"
                                        )}>
                                            {product.section}
                                        </span>
                                        {product.is_new && (
                                            <span className="px-4 py-1.5 bg-white/5 text-white/60 text-[10px] font-black tracking-[0.2em] uppercase rounded-full border border-white/10">
                                                NUEVO
                                            </span>
                                        )}
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

                                {product.short_description && (
                                    <p className="text-white/60 leading-relaxed text-sm font-medium">
                                        {product.short_description}
                                    </p>
                                )}

                                <UrgencyIndicators stock={product.stock} />

                                {/* Selector de Variantes (Nuevo en QuickView) */}
                                {hasVariations && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                            Selecciona una opción
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {variations.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() => {
                                                        haptic('light');
                                                        setSelectedVariant(v);
                                                    }}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center rounded-xl py-3 px-4 border-2 transition-all text-center",
                                                        selectedVariant?.id === v.id
                                                            ? product.section === 'vape'
                                                                ? "border-vape-500 bg-vape-500/10 text-vape-400"
                                                                : "border-herbal-500 bg-herbal-500/10 text-herbal-400"
                                                            : "border-white/5 bg-white/[0.02] text-white/60 hover:border-white/10"
                                                    )}
                                                >
                                                    <span className="text-xs font-bold">
                                                        {(v as any).options?.map((opt: any) => opt.attribute_value?.value).join(' / ') || 'Opción'}
                                                    </span>
                                                    {v.price && v.price !== product.price && (
                                                        <span className="text-[9px] opacity-40 mt-0.5">
                                                            Ref: {formatPrice(v.price)}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity & Add to Cart */}
                                <div className="space-y-6 pt-4">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 shadow-inner">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1}
                                                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                                            >
                                                <Minus className="w-5 h-5" />
                                            </motion.button>
                                            <span className="w-10 text-center text-lg font-black text-white">
                                                {quantity}
                                            </span>
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                                disabled={quantity >= product.stock}
                                                className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-20 transition-colors"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleWishlist}
                                            className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg",
                                                isWishlisted
                                                    ? "bg-red-500 border-red-400 text-white"
                                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                            )}
                                        >
                                            <Heart className={cn("w-6 h-6", isWishlisted && "fill-current")} />
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="group relative w-full h-16 bg-white rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_30px_60px_rgba(255,255,255,0.15)] transition-all disabled:opacity-20 overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center gap-3">
                                            <ShoppingCart className="w-6 h-6 text-slate-900" />
                                            <span className="text-slate-900 font-black uppercase tracking-[0.2em] text-sm">Añadir al Carrito</span>
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-vape-400 to-herbal-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                                    </motion.button>
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
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Stock Verificado</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
};
