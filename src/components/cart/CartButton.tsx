// Botón del carrito para el header - VSM Store
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, selectTotalItems } from '@/stores/cart.store';
import { cn } from '@/lib/utils';

/**
 * Botón con icono de carrito + badge con cantidad de items
 * Evolución: Física de resortes (Spring Physics) con framer-motion para mayor "jugabilidad" premium.
 */
export function CartButton() {
    const toggleCart = useCartStore((s) => s.toggleCart);
    const count = useCartStore(selectTotalItems);

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleCart}
            className={cn(
                "relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border transition-colors duration-300",
                count > 0 
                    ? "bg-accent-primary/20 text-accent-primary shadow-[0_0_20px_rgba(59,130,246,0.25)] border-accent-primary/40" 
                    : "bg-white/5 text-theme-secondary hover:bg-white/10 hover:text-white border-white/5"
            )}
            aria-label={`Carrito (${count} items)`}
        >
            <motion.div
                key={count}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
                <ShoppingCart className={cn("h-5 w-5 sm:h-5 sm:w-5", count > 0 ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "")} />
            </motion.div>

            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        key="cart-badge"
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 600, damping: 20 }}
                        className="absolute -top-2 -right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gradient-to-tr from-accent-primary to-blue-400 px-1.5 text-[11px] font-black text-white shadow-lg shadow-accent-primary/40 border-2 border-theme-primary"
                    >
                        {count > 99 ? '99+' : count}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
