// Sidebar del carrito - VSM Store
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useState } from 'react';
import { CheckoutForm } from './CheckoutForm';

/**
 * Sidebar deslizable desde la derecha con los items del carrito
 */
export function CartSidebar() {
    const isOpen = useCartStore((s) => s.isOpen);
    const closeCart = useCartStore((s) => s.closeCart);
    const items = useCartStore((s) => s.items);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const total = useCartStore((s) => s.total);
    const totalItems = useCartStore((s) => s.totalItems);

    const [showCheckout, setShowCheckout] = useState(false);

    const handleCheckoutSuccess = () => {
        setShowCheckout(false);
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 right-0 z-50 flex h-full w-[85vw] max-w-[400px] flex-col bg-primary-950 border-l border-primary-800 shadow-2xl',
                    'transition-transform duration-300 ease-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header del sidebar */}
                <div className="flex items-center justify-between border-b border-primary-800 px-5 py-4">
                    <h2 className="text-lg font-bold text-primary-100">
                        Carrito
                        {totalItems() > 0 && (
                            <span className="ml-2 text-sm font-normal text-primary-500">
                                ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido */}
                {items.length === 0 ? (
                    // Carrito vacío
                    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
                        <ShoppingBag className="mb-3 h-16 w-16 text-primary-800" />
                        <p className="text-sm font-medium text-primary-500">Tu carrito está vacío</p>
                        <p className="mt-1 text-xs text-primary-600">Agrega productos para comenzar</p>
                        <button
                            onClick={closeCart}
                            className="mt-6 rounded-xl bg-primary-800 px-6 py-2.5 text-sm font-medium text-primary-300 transition-all hover:bg-primary-700"
                        >
                            Seguir comprando
                        </button>
                    </div>
                ) : showCheckout ? (
                    // Formulario de checkout
                    <CheckoutForm onSuccess={handleCheckoutSuccess} onBack={() => setShowCheckout(false)} />
                ) : (
                    <>
                        {/* Lista de items con scroll */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
                            {items.map((item) => {
                                const isVape = item.product.section === 'vape';
                                return (
                                    <div
                                        key={item.product.id}
                                        className="flex gap-3 rounded-xl border border-primary-800 bg-primary-900/50 p-3"
                                    >
                                        {/* Imagen */}
                                        <div
                                            className={cn(
                                                'flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg',
                                                isVape ? 'bg-vape-500/10' : 'bg-herbal-500/10'
                                            )}
                                        >
                                            {item.product.images.length > 0 ? (
                                                <img
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span
                                                    className={cn(
                                                        'text-xs font-bold opacity-30',
                                                        isVape ? 'text-vape-500' : 'text-herbal-500'
                                                    )}
                                                >
                                                    VSM
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-1 flex-col justify-between min-w-0">
                                            <div>
                                                <h3 className="text-sm font-medium text-primary-200 line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                <span
                                                    className={cn(
                                                        'text-sm font-bold',
                                                        isVape ? 'text-vape-400' : 'text-herbal-400'
                                                    )}
                                                >
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </span>
                                            </div>

                                            {/* Controles cantidad */}
                                            <div className="mt-1 flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        className="rounded-md p-1 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-medium text-primary-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="rounded-md p-1 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.id)}
                                                    className="rounded-md p-1 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer con desglose y botón */}
                        <div className="border-t border-primary-800 px-5 py-4 space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary-500">Subtotal</span>
                                    <span className="text-sm text-primary-300">
                                        {formatPrice(total())}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary-500">Envío</span>
                                    <span className="text-sm text-herbal-400 font-medium">Gratis</span>
                                </div>
                                <hr className="border-primary-800" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary-300">Total</span>
                                    <span className="text-xl font-bold text-primary-100">
                                        {formatPrice(total())}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCheckout(true)}
                                className="w-full rounded-xl bg-vape-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Finalizar compra
                            </button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
