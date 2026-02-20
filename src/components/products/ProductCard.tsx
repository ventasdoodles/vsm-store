import { useState } from 'react';
import { Link } from 'react-router-dom';

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

export const ProductCard = ({ product, className, compact = false }: ProductCardProps) => {
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
                        {product.images?.[currentImage] ? (
                            <img
                                key={currentImage}
                                src={optimizeImage(product.images[currentImage], { width: 500 })}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/500x500/0a0a0a/404040?text=VSM';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-theme-secondary/20" />
                            </div>
                        )}

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
                    <div className="p-5 flex-1 flex flex-col justify-between relative">

                        <div>
                            {/* Product Name */}
                            <h3 className={cn("font-medium text-theme-primary leading-tight group-hover:text-blue-500 transition-colors line-clamp-2", compact ? "text-sm" : "text-base")}>
                                {product.name}
                            </h3>

                            <p className="text-xs text-theme-secondary mt-1.5 capitalize font-medium tracking-wide">
                                {product.section}
                            </p>
                        </div>


                        {/* Price */}
                        <div className="flex items-end gap-2 mt-4">
                            <span className="text-xl font-bold text-theme-primary tracking-tight">
                                ${product.price}
                            </span>
                            {product.compare_at_price && product.compare_at_price > product.price && (
                                <span className="text-xs text-theme-tertiary line-through mb-1">
                                    ${product.compare_at_price}
                                </span>
                            )}
                        </div>

                        {/* Stock Status for non-compact */}
                        {!compact && product.stock <= 5 && product.stock > 0 && (
                            <p className="text-[10px] text-orange-500 font-medium mt-2 flex items-center gap-1.5 bg-orange-500/10 px-2 py-0.5 rounded-full w-fit border border-orange-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                Solo {product.stock} disponibles
                            </p>
                        )}
                    </div>
                </div>
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
