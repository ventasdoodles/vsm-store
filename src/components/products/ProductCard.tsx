import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingCart, Package } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';
import { cn, optimizeImage } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductCardProps {
    product: Product;
    className?: string;
    index?: number;
    compact?: boolean;
}

export const ProductCard = ({ product, className, index = 0, compact = false }: ProductCardProps) => {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const { addItem } = useCartStore();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        toast.success(`${product.name} agregado al carrito`, {
            icon: '🛒',
            duration: 2000,
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
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
            <Link to={`/${product.section}/${product.slug}`} className={cn('block h-full', className)}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group relative bg-theme-secondary rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl h-full flex flex-col"
                >
                    {/* Image Container */}
                    <div
                        className="relative aspect-square bg-theme-tertiary overflow-hidden"
                        onMouseEnter={() => {
                            if (product.images?.length > 1) setCurrentImage(1);
                        }}
                        onMouseLeave={() => setCurrentImage(0)}
                    >
                        {/* Image */}
                        {product.images?.[currentImage] ? (
                            <motion.img
                                key={currentImage}
                                src={optimizeImage(product.images[currentImage], { width: 500 })}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/500x500/0a0a0a/404040?text=VSM';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-theme-secondary" />
                            </div>
                        )}

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Badges (Top-left) */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {product.is_new && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    NUEVO
                                </motion.span>
                            )}
                            {product.is_bestseller && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    🔥 HOT
                                </motion.span>
                            )}
                            {product.compare_at_price && product.compare_at_price > product.price && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                </motion.span>
                            )}
                        </div>

                        {/* Wishlist Button (Top-right) */}
                        {!compact && (
                            <motion.button
                                onClick={handleWishlist}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                            >
                                <Heart
                                    className={`w-5 h-5 transition-all ${isWishlisted
                                            ? 'fill-red-500 text-red-500'
                                            : 'text-gray-700'
                                        }`}
                                />
                            </motion.button>
                        )}

                        {/* Quick Actions (Bottom) */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileHover={{ y: 0, opacity: 1 }}
                            className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <button
                                onClick={handleQuickView}
                                className="flex-1 h-10 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg text-xs sm:text-sm"
                            >
                                <Eye className="w-4 h-4" />
                                <span className={compact ? 'hidden' : 'inline'}>Vista Rápida</span>
                            </button>
                            <button
                                onClick={handleQuickAdd}
                                disabled={product.stock === 0}
                                className="h-10 px-4 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center transition-all shadow-lg"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Info Section */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                            {/* Product Name */}
                            <h3 className={cn("font-semibold text-theme-primary line-clamp-2 group-hover:text-accent-primary transition-colors", compact ? "text-sm" : "text-base")}>
                                {product.name}
                            </h3>

                            {/* Sabor/Color if available in short description (optional hack, but lets keep clean) */}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-xl font-bold text-theme-primary">
                                ${product.price}
                            </span>
                            {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-sm text-theme-secondary line-through">
                                    ${product.compare_at_price}
                                </span>
                            )}
                        </div>

                        {/* Stock Status for non-compact */}
                        {!compact && product.stock <= 5 && product.stock > 0 && (
                            <p className="text-xs text-orange-500 font-medium">
                                Solo {product.stock} disponibles
                            </p>
                        )}
                    </div>
                </motion.div>
            </Link>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </>
    );
};
