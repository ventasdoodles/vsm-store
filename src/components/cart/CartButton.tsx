// Botón del carrito para el header - VSM Store
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';

/**
 * Botón con icono de carrito + badge con cantidad de items
 */
export function CartButton() {
    const toggleCart = useCartStore((s) => s.toggleCart);
    const totalItems = useCartStore((s) => s.totalItems);
    const count = totalItems();

    return (
        <button
            onClick={toggleCart}
            className="relative rounded-lg p-2 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
            aria-label={`Carrito (${count} items)`}
        >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm shadow-red-500/40">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}
