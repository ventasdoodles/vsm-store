import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Package } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useHaptic } from '@/hooks/useHaptic';

interface ProductCardProps {
    product: Product;
    className?: string;
    index?: number;
    compact?: boolean;
}

export const ProductCard = ({ product, className, compact = false }: ProductCardProps) => {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const { addItem } = useCartStore();
    const { toggleItem, isInWishlist } = useWishlistStore();
    const isWishlisted = isInWishlist(product.id);
    const { trigger: haptic } = useHaptic();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        haptic('success');
        addItem(product, 1);
        toast.success(`${product.name} agregado al carrito`, {
            icon: '🛒',
            duration: 2000,
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        haptic('light');
        toggleItem(product);
        toast.success(
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos',
            {
                icon: isWishlisted ? '💔' : '❤️',
                duration: 2000,
            }
        );
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickViewOpen(true);
    };

    return (
        <>
            <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn('block h-full', className)}
            >
                <Link to={`/${product.section}/${product.slug}`} className="block h-full">
                    <div
                        className="group relative glass-premium rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 h-full flex flex-col spotlight-container"
                    >
                    {/* Image Container */}
                    <div
                        className="relative aspect-square bg-theme-secondary/20 overflow-hidden"
                        onMouseEnter={() => {
                            if (product.images?.length > 1) setCurrentImage(1);
                        }}
                        onMouseLeave={() => setCurrentImage(0)}
                    >
                        {/* Image */}
                        <OptimizedImage
                            src={product.images?.[currentImage] || ''}
                            alt={product.name}
                            width={500}
                            containerClassName="h-full w-full"
                            className="transition-transform duration-700 group-hover:scale-110"
                            fallbackIcon={<Package className="w-16 h-16 text-theme-secondary/20" />}
                        />

                        {/* Hover Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges (Top-left) */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {product.is_new && (
                                <span
                                    className="px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg border border-blue-400/20"
                                >
                                    NUEVO
                                </span>
                            )}
                            {product.is_bestseller && (
                                <span
                                    className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg border border-amber-400/20"
                                >
                                    HOT
                                </span>
                            )}
                            {product.compare_at_price && product.compare_at_price > product.price && (
                                <span
                                    className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg border border-red-400/20"
                                >
                                    -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                </span>
                            )}
                        </div>

                        {/* Wishlist Button (Top-right) */}
                        {!compact && (
                            <button
                                onClick={handleWishlist}
                                className="absolute top-3 right-3 z-10 w-9 h-9 bg-theme-primary/80 backdrop-blur-xl hover:bg-theme-secondary text-theme-primary hover:text-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300 shadow-lg border border-theme/10"
                            >
                                <Heart
                                    className={`w-4 h-4 transition-all ${isWishlisted
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-current'
                                        }`}
                                />
                            </button>
                        )}

                        {/* Quick Actions (Bottom) */}
                        <div
                            className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
                        >
                            <button
                                onClick={handleQuickView}
                                className="flex-1 h-10 bg-white/95 backdrop-blur text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all text-xs tracking-wide shadow-lg cursor-pointer active:scale-95"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span className={compact ? 'hidden' : 'inline'}>VISTA RÁPIDA</span>
                            </button>
                            <button
                                onClick={handleQuickAdd}
                                disabled={product.stock === 0}
                                className="h-10 w-10 bg-black/80 backdrop-blur-xl hover:bg-black text-white rounded-xl flex items-center justify-center transition-all shadow-lg border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="p-6 flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-black/20">
                        <div className="space-y-2">
                            {/* Product Name */}
                            <h3 className={cn(
                                "font-black text-theme-primary leading-tight group-hover:text-vape-400 transition-colors line-clamp-2 tracking-tight",
                                compact ? "text-sm" : "text-lg"
                            )}>
                                {product.name}
                            </h3>

                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                    product.section === 'vape' ? "bg-vape-500/10 text-vape-400" : "bg-herbal-500/10 text-herbal-400"
                                )}>
                                    {product.section}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            {/* Price */}
                            <div className="flex flex-col">
                                {product.compare_at_price && product.compare_at_price > product.price && (
                                    <span className="text-[10px] text-theme-tertiary line-through font-bold opacity-60">
                                        {formatPrice(product.compare_at_price)}
                                    </span>
                                )}
                                <span className={cn(
                                    "font-black tracking-tighter text-theme-primary",
                                    compact ? "text-lg" : "text-2xl"
                                )}>
                                    {formatPrice(product.price)}
                                </span>
                            </div>

                            {/* Mini Cart Button for compact or as secondary action */}
                            <button
                                onClick={handleQuickAdd}
                                disabled={product.stock === 0}
                                className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-theme-primary hover:bg-vape-500 hover:border-vape-500 hover:text-white transition-all active:scale-95 disabled:opacity-30"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Stock Status for non-compact */}
                        {!compact && product.stock <= 5 && product.stock > 0 && (
                            <div className="mt-4 flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 w-fit animate-pulse-slow">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                                    ¡Solo {product.stock} en stock!
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
            </motion.div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </>
    );
};
