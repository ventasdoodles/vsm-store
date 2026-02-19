import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { cn, formatPrice, optimizeImage } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';
import { useHaptic } from '@/hooks/useHaptic';

interface StickyAddToCartProps {
    product: Product;
    isVisible: boolean;
}

export function StickyAddToCart({ product, isVisible }: StickyAddToCartProps) {
    const addItem = useCartStore((s) => s.addItem);
    const { trigger } = useHaptic();
    const [quantity, setQuantity] = useState(1);
    const isVape = product.section === 'vape';

    // Reset quantity when product changes
    useEffect(() => {
        // eslint-disable-next-line
        setQuantity(1);
    }, [product.id]);

    const handleAddToCart = () => {
        trigger('medium');
        // Add item quantity times
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
        setQuantity(1);
    };

    return (
        <div
            className={cn(
                'fixed bottom-16 left-0 right-0 z-40 transform border-t border-theme bg-theme-primary/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 md:hidden',
                isVisible ? 'translate-y-0' : 'translate-y-[150%]'
            )}
        >
            <div className="flex items-center gap-4">
                {/* Mini Thumbnail */}
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-theme-tertiary">
                    <img
                        src={optimizeImage(product.images[0], { width: 100, height: 100 })}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                </div>

                {/* Info & Price */}
                <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-theme-secondary">{product.name}</p>
                    <p className={cn("text-sm font-bold", isVape ? "text-vape-400" : "text-herbal-400")}>
                        {formatPrice(product.price)}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex bg-theme-secondary rounded-lg p-1 border border-theme">
                    <button
                        onClick={() => {
                            if (quantity > 1) {
                                trigger('light');
                                setQuantity(q => q - 1);
                            }
                        }}
                        className="p-1.5 text-theme-secondary hover:text-theme-primary"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-medium flex items-center justify-center text-theme-primary">
                        {quantity}
                    </span>
                    <button
                        onClick={() => {
                            trigger('light');
                            setQuantity(q => q + 1);
                        }}
                        className="p-1.5 text-theme-secondary hover:text-theme-primary"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={handleAddToCart}
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r text-white shadow-lg transition-all active:scale-95",
                        isVape ? "from-vape-500 to-vape-600 shadow-vape-500/20" : "from-herbal-500 to-herbal-600 shadow-herbal-500/20"
                    )}
                >
                    <ShoppingCart className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
