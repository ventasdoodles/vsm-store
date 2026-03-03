import { useState, useMemo } from 'react';
import { Plus, ShoppingCart, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cart.store';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotification } from '@/hooks/useNotification';
import { formatPrice, optimizeImage } from '@/lib/utils';
import type { Product } from '@/types/product';

interface FrequentlyBoughtTogetherProps {
    currentProduct: Product;
}

export function FrequentlyBoughtTogether({ currentProduct }: FrequentlyBoughtTogetherProps) {
    const { data: products = [], isLoading } = useProducts({
        section: currentProduct.section,
        categoryId: currentProduct.category_id,
    });
    const { addItem } = useCartStore();
    const { trigger: haptic } = useHaptic();
    const { success } = useNotification();
    const [isAdding, setIsAdding] = useState(false);

    // Seleccionar 2 productos aleatorios de la misma categoría que no sean el actual
    const relatedProducts = useMemo(() => {
        const filtered = products.filter(p => p.id !== currentProduct.id && p.stock > 0);
        // Fisher-Yates shuffle (unbiased)
        const arr = [...filtered];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j]!, arr[i]!];
        }
        return arr.slice(0, 2);
    }, [products, currentProduct.id]);

    if (isLoading || relatedProducts.length === 0) return null;

    const bundleProducts = [currentProduct, ...relatedProducts];
    const bundleTotal = bundleProducts.reduce((sum, p) => sum + p.price, 0);
    const bundleCompareTotal = bundleProducts.reduce((sum, p) => sum + (p.compare_at_price || p.price), 0);
    const hasDiscount = bundleCompareTotal > bundleTotal;

    const handleAddBundle = () => {
        setIsAdding(true);
        haptic('success');
        
        bundleProducts.forEach(product => {
            addItem(product, 1);
        });

        success('¡Paquete agregado!', 'Se han agregado los productos al carrito');
        
        setTimeout(() => {
            setIsAdding(false);
        }, 1000);
    };

    return (
        <div className="mt-4 rounded-3xl border border-theme bg-theme-secondary/5 p-6 sm:p-8">
            

            <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Productos */}
                <div className="flex flex-wrap items-center justify-center gap-4 flex-1">
                    {bundleProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4">
                            {index > 0 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-theme-secondary/20 text-theme-secondary">
                                    <Plus className="h-4 w-4" />
                                </div>
                            )}
                            <div className="group relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-theme-secondary/20 vsm-border-subtle">
                                {product.images?.[0] ? (
                                    <img
                                        src={optimizeImage(product.images[0], { width: 150, height: 150, quality: 80, format: 'webp' })}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <Package className="h-8 w-8 text-theme-tertiary/20" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resumen y CTA */}
                <div className="flex flex-col items-center lg:items-end min-w-[200px] bg-theme-primary/40 p-6 rounded-2xl vsm-border-subtle">
                    <div className="text-sm text-theme-secondary mb-1">Precio del paquete:</div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-black text-theme-primary">
                            {formatPrice(bundleTotal)}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm font-bold text-theme-tertiary line-through opacity-60">
                                {formatPrice(bundleCompareTotal)}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={handleAddBundle}
                        disabled={isAdding}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-accent-primary/80 active:scale-95 disabled:opacity-50"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {isAdding ? 'Agregando...' : 'Agregar Paquete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
