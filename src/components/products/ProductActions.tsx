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
import { useHaptic } from '@/hooks/useHaptic';
import { ShareButton } from './ShareButton';
import { StickyAddToCart } from './StickyAddToCart';
import type { Product } from '@/types/product';
import { motion, AnimatePresence } from 'framer-motion';

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
    const { trigger: haptic } = useHaptic();

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
        haptic('success');
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
                className="vsm-btn flex w-full items-center justify-center gap-2 py-4 text-sm cursor-not-allowed bg-theme-tertiary/20 text-theme-secondary border border-theme-subtle"
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
                    <div className="vsm-input-group">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                haptic('light');
                                setQuantity((q) => Math.max(1, q - 1));
                            }}
                            className="vsm-btn-icon text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
                        >
                            <Minus className="h-5 w-5" />
                        </motion.button>
                        <span className="w-12 text-center text-lg font-black text-theme-primary">
                            <AnimatePresence exitBeforeEnter>
                                <motion.span
                                    key={quantity}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.15 }}
                                    className="inline-block"
                                >
                                    {quantity}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                haptic('light');
                                setQuantity((q) => Math.min(product.stock, q + 1));
                            }}
                            className="vsm-btn-icon text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary"
                        >
                            <Plus className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Botón agregar */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddToCart}
                        disabled={justAdded}
                        className={cn(
                            'vsm-btn vsm-btn-lg group relative flex-1 flex items-center justify-center gap-3 overflow-hidden',
                            justAdded
                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                                : isVape
                                    ? 'bg-gradient-to-r from-vape-600 to-vape-500 text-white shadow-xl shadow-vape-500/30 ring-1 ring-vape-400/50'
                                    : 'bg-gradient-to-r from-herbal-600 to-herbal-500 text-white shadow-xl shadow-herbal-500/30 ring-1 ring-herbal-400/50'
                        )}
                    >
                        {justAdded ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2"
                            >
                                <Check className="h-6 w-6" />
                                <span>¡Agregado!</span>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="flex items-center gap-2"
                                animate={{ y: [0, -2, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                                <ShoppingCart className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                                <span>Añadir</span>
                            </motion.div>
                        )}
                        
                        {/* Shimmer effect */}
                        {!justAdded && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                        )}
                    </motion.button>
                </div>

                {/* Botón compartir */}
                <ShareButton product={product} className="w-full sm:w-auto h-12 justify-center glass-premium border-theme" />
            </div>

            {/* Sticky mobile cart bar */}
            <StickyAddToCart product={product} isVisible={showSticky} />
        </div>
    );
}
