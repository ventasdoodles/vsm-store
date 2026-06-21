import { useRef, memo } from 'react';
import { m, useMotionValue, useMotionTemplate } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { Product } from '@/types/product';
import { getStorefrontProductPurchaseability } from '@/lib/domain/products';

export interface CartItemProps {
    item: {
        product: Product;
        quantity: number;
        variant_id?: string | null;
        variant_name?: string | null;
    };
    isVape: boolean;
    onUpdateQuantity: (id: string, q: number, vId?: string | null) => void;
    onRemove: (id: string, vId?: string | null) => void;
}

/**
 * Componente interno para cada item del carrito con Spotlight individual
 */
export const CartItemCard = memo(({ item, isVape, onUpdateQuantity, onRemove }: CartItemProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const itemTotal = item.product.price * item.quantity;
    const purchaseability = getStorefrontProductPurchaseability(item.product, {
        selectedVariantId: item.variant_id ?? null,
    });
    const maxQuantity = purchaseability.maxQuantity > 0 ? purchaseability.maxQuantity : item.product.stock;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <m.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            layout="position"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="group relative flex gap-4 rounded-[1.5rem] border border-white/5 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:border-white/20 hover:shadow-black/60 overflow-hidden"
        >
            {/* Spotlight Reveal */}
            <m.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.08), transparent 80%)`
                }}
            />

            {/* Imagen */}
            <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 shadow-inner z-10">
                {item.product.images?.[0] ? (
                    <OptimizedImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <ShoppingBag className="h-8 w-8 text-white/10" />
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col min-w-0 justify-between py-0.5 z-10">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 pr-6">
                            {item.product.name}
                        </h3>
                        <button
                            onClick={() => onRemove(item.product.id, item.variant_id)}
                            className="absolute top-4 right-4 p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors z-30"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    {item.variant_name && (
                        <div className="inline-block mt-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/70">
                                {item.variant_name}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-end justify-between">
                    <div className="flex flex-col">
                        <m.span
                            key={itemTotal}
                            initial={{ opacity: 0.5, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'text-base font-black tracking-tight',
                                isVape ? 'text-vape-400 drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]' : 'text-herbal-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                            )}
                        >
                            {formatPrice(itemTotal)}
                        </m.span>
                        {item.quantity > 1 && (
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {formatPrice(item.product.price)} c/u
                            </span>
                        )}
                    </div>

                    {/* Controles cantidad */}
                    <div className="flex items-center bg-black/50 rounded-lg border border-white/10 p-1 shadow-inner relative z-30">
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.variant_id)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <m.span
                            key={item.quantity}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-8 text-center text-sm font-black text-white"
                        >
                            {item.quantity}
                        </m.span>
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.variant_id)}
                            disabled={!purchaseability.canAddToCart || item.quantity >= maxQuantity}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </m.div>
    );
});
