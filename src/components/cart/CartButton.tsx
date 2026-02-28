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
            className="relative rounded-lg p-2 text-theme-secondary hover:bg-theme-secondary/20 hover:text-theme-primary transition-colors"
            aria-label={`Carrito (${count} items)`}
        >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
                {count > 0 && (
                    <motion.span
                        key={count} // re-animates on count change
                        initial={{ scale: 0.5, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-vape-500 px-1 text-[10px] font-bold text-white shadow-sm shadow-vape-500/40"
                    >
                        {count > 99 ? '99+' : count}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
