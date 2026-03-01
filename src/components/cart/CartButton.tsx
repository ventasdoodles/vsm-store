// Botón del carrito para el header - VSM Store
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, selectTotalItems } from '@/stores/cart.store';

/**
 * Botón con icono de carrito + badge con cantidad de items
 */
export function CartButton() {
    const toggleCart = useCartStore((s) => s.toggleCart);
    const count = useCartStore(selectTotalItems);

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleCart}
            className={`relative rounded-full p-2.5 transition-all duration-300 ${count > 0 ? 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20' : 'text-theme-secondary hover:bg-white/10 hover:text-white'}`}
            aria-label={`Carrito (${count} items)`}
        >
            <ShoppingCart className={`h-5 w-5 ${count > 0 ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`} />
            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        key={count} // re-animates on count change
                        initial={{ scale: 0.5, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-1.5 -right-1.5 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-accent-primary px-1.5 text-[10px] font-black text-white shadow-lg shadow-accent-primary/50 border border-white/20"
                    >
                        {count > 99 ? '99+' : count}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
