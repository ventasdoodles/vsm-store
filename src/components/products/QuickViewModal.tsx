import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { X, ShoppingCart, ExternalLink, Heart, ZoomIn, Package } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useCartStore } from '@/stores/cart.store';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product';

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCartStore();

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(`${product.name} agregado al carrito`, {
            icon: '🛒',
            duration: 2000,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent asChild>
                <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto animate-fadeIn"
                        onClick={onClose}
                    >
                        <div
                            className="relative bg-theme-primary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
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
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-20 h-20 text-theme-secondary" />
                                            </div>
                                        )}

                                        {/* Zoom Indicator */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                            <div className="bg-white/90 rounded-full p-3">
                                                <ZoomIn className="w-6 h-6 text-gray-900" />
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
                                        {product.is_new && (
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-semibold rounded-full">
                                                NUEVO
                                            </span>
                                        )}
                                        {product.is_bestseller && (
                                            <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-semibold rounded-full">
                                                MÁS VENDIDO
                                            </span>
                                        )}
                                        {product.is_featured && (
                                            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-semibold rounded-full">
                                                DESTACADO
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <DialogTitle asChild>
                                        <h2 className="text-2xl font-bold text-theme-primary">
                                            {product.name}
                                        </h2>
                                    </DialogTitle>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-theme-primary">
                                            ${product.price}
                                        </span>
                                        {product.compare_at_price && (
                                            <>
                                                <span className="text-lg text-theme-secondary line-through">
                                                    ${product.compare_at_price}
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

                                    {/* Stock Status */}
                                    <div className="flex items-center gap-2">
                                        {product.stock > 10 ? (
                                            <>
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="text-sm text-green-500 font-medium">
                                                    En stock
                                                </span>
                                            </>
                                        ) : product.stock > 0 ? (
                                            <>
                                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                <span className="text-sm text-orange-500 font-medium">
                                                    Solo {product.stock} disponibles
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                <span className="text-sm text-red-500 font-medium">
                                                    Agotado
                                                </span>
                                            </>
                                        )}
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
                                            Agregar al Carrito
                                        </button>

                                        <button className="w-12 h-12 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors">
                                            <Heart className="w-5 h-5 text-theme-primary" />
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
                </div>
            </DialogContent>
        </Dialog>
    );
};
