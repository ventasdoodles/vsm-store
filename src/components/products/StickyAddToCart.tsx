import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Package, PackageX } from 'lucide-react';
import { cn, formatPrice, optimizeImage } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';
import type { StorefrontProductPurchaseabilityView } from '@/lib/domain/products';
import { getVariantDisplayName } from '@/lib/domain/products';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotification } from '@/hooks/useNotification';
import { getVape420ProductDetailPresentationConfig } from '@/config/productization';

interface StickyAddToCartProps {
    product: Product;
    isVisible: boolean;
    selectedVariant: ProductVariant | null;
    purchaseability: StorefrontProductPurchaseabilityView;
}

import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

export function StickyAddToCart({
    product,
    isVisible,
    selectedVariant,
    purchaseability,
}: StickyAddToCartProps) {
    const { config } = useActiveVerticalPack();

    const addItem = useCartStore((s) => s.addItem);
    const { trigger } = useHaptic();
    const { warning } = useNotification();
    const [quantity, setQuantity] = useState(1);
    const productDetailConfig = config ? getVape420ProductDetailPresentationConfig(config, product.section) : null;
    const maxQuantity = purchaseability.maxQuantity > 0 ? purchaseability.maxQuantity : 1;

    useEffect(() => {
        setQuantity(1);
    }, [product.id, selectedVariant?.id]);

    useEffect(() => {
        setQuantity((current) => Math.min(Math.max(1, current), maxQuantity));
    }, [maxQuantity]);

    const handleAddToCart = () => {
        if (!purchaseability.canAddToCart) {
            warning('Compra no disponible', purchaseability.detail);
            return;
        }

        trigger('medium');
        addItem(
            product,
            quantity,
            selectedVariant ? { id: selectedVariant.id, name: getVariantDisplayName(selectedVariant) } : null,
        );
        setQuantity(1);
    };

    if (!config || !productDetailConfig) return null;

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                'fixed bottom-16 left-0 right-0 z-40 transform border-t border-theme bg-theme-primary/95 px-4 py-3 backdrop-blur-lg transition-transform duration-300 md:hidden',
                isVisible ? 'translate-y-0' : 'translate-y-[150%]',
            )}
        >
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-theme-tertiary">
                    {product.images?.[0] ? (
                        <img
                            src={optimizeImage(product.images[0], { width: 100, height: 100 })}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-theme-secondary/40">
                            <Package className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="truncate text-xs text-theme-secondary">{product.name}</p>
                    {selectedVariant && (
                        <p className="truncate text-[10px] font-black uppercase tracking-widest text-theme-tertiary">
                            {getVariantDisplayName(selectedVariant)}
                        </p>
                    )}
                    <p className={cn('text-sm font-bold', productDetailConfig.stickyPriceAccentTextClassName)}>
                        {formatPrice(product.price)}
                    </p>
                </div>

                <div className="flex bg-theme-secondary rounded-lg p-1 border border-theme">
                    <button
                        onClick={() => {
                            if (quantity > 1) {
                                trigger('light');
                                setQuantity((q) => q - 1);
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
                            setQuantity((q) => Math.min(maxQuantity, q + 1));
                        }}
                        disabled={!purchaseability.canAddToCart || quantity >= maxQuantity}
                        className="p-1.5 text-theme-secondary hover:text-theme-primary disabled:opacity-30"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={!purchaseability.canAddToCart}
                    className={cn(
                        'flex h-10 min-w-[40px] items-center justify-center rounded-xl border transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
                        purchaseability.canAddToCart
                            ? cn(
                                'bg-gradient-to-r text-white shadow-lg',
                                productDetailConfig.stickyActionButtonGradientClassName,
                            )
                            : 'bg-theme-tertiary/20 text-theme-secondary border-theme-subtle',
                    )}
                    aria-label={purchaseability.canAddToCart ? 'Añadir al carrito' : purchaseability.ctaLabel}
                >
                    {purchaseability.canAddToCart ? (
                        <ShoppingCart className="h-5 w-5" />
                    ) : (
                        <PackageX className="h-5 w-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
