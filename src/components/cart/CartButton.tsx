// Botón del carrito para el header - VSM Store
import { ShoppingCart } from 'lucide-react';
import { useCartStore, selectTotalItems } from '@/stores/cart.store';
import { cn } from '@/lib/utils';

/**
 * Botón con icono de carrito + badge con cantidad de items
 * Usa CSS transitions en vez de framer-motion para no inflar el main chunk
 */
export function CartButton() {
    const toggleCart = useCartStore((s) => s.toggleCart);
    const count = useCartStore(selectTotalItems);

    return (
        <button
            onClick={toggleCart}
            className={cn(
                "relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 hover:scale-105 active:scale-90",
                count > 0 
                    ? "bg-accent-primary/20 text-accent-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-accent-primary/50" 
                    : "bg-white/5 text-theme-secondary hover:bg-white/10 hover:text-white border border-white/5"
            )}
            aria-label={`Carrito (${count} items)`}
        >
            <ShoppingCart className={cn("h-5 w-5 sm:h-5 sm:w-5", count > 0 ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "")} />
            {count > 0 && (
                <span
                    className="absolute -top-2 -right-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gradient-to-tr from-accent-primary to-blue-400 px-1.5 text-[11px] font-black text-white shadow-lg shadow-accent-primary/50 border-2 border-theme-primary animate-in zoom-in-50 duration-200"
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}
