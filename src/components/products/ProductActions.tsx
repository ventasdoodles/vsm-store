/**
 * ProductActions — Selector de cantidad, botón de agregar y compartir.
 * 
 * @module ProductActions
 * @independent Maneja su propio estado de cantidad e interacción con el carrito.
 */
import { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, Check, PackageX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { ShareButton } from './ShareButton';
import { StickyAddToCart } from './StickyAddToCart';
import type { Product } from '@/types/product';

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const isVape = product.section === 'vape';
    const inStock = product.stock > 0;

    const addItem = useCartStore((s) => s.addItem);
    const openCart = useCartStore((s) => s.openCart);
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const { success } = useNotification();

    // Control de Sticky Bar
    const containerRef = useRef<HTMLDivElement>(null);
    const [showSticky, setShowSticky] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry) return;
                const isAbove = entry.boundingClientRect.top < 0;
                setShowSticky(!entry.isIntersecting && isAbove);
            },
            { threshold: 0 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleAddToCart = () => {
        addItem(product, quantity);
        setJustAdded(true);
        success('¡Agregado!', `${product.name} agregado al carrito`);
        setTimeout(() => {
            setJustAdded(false);
            openCart();
        }, 600);
    };

    if (!inStock) {
        return (
            <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-black uppercase tracking-widest cursor-not-allowed bg-theme-tertiary/20 text-theme-secondary border border-theme/30"
            >
                <PackageX className="h-4 w-4" />
                Agotado
            </button>
        );
    }

    return (
        <div className="space-y-6" ref={containerRef}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Selector de cantidad */}
                    <div className="flex items-center rounded-xl border border-theme bg-theme-secondary/40 backdrop-blur-sm p-1">
                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all active:scale-90"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-theme-primary">
                            {quantity}
                        </span>
                        <button
                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all active:scale-90"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Botón agregar */}
                    <button
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={cn(
                            'group relative flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-black uppercase tracking-widest overflow-hidden transition-all active:scale-[0.98]',
                            justAdded
                                ? 'bg-green-500 text-white'
                                : isVape
                                    ? 'bg-vape-500 text-white shadow-xl shadow-vape-500/20 hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5'
                                    : 'bg-herbal-500 text-white shadow-xl shadow-herbal-500/20 hover:bg-herbal-600 hover:shadow-herbal-500/40 hover:-translate-y-0.5'
                        )}
                    >
                        {justAdded ? (
                            <>
                                <Check className="h-5 w-5 animate-in zoom-in-50 duration-300" />
                                <span>¡Listo!</span>
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span>Agregar</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Botón compartir */}
                <ShareButton product={product} className="w-full sm:w-auto h-12 justify-center glass-premium border-theme/30" />
            </div>

            {/* Sticky mobile cart bar */}
            <StickyAddToCart product={product} isVisible={showSticky} />
        </div>
    );
}
