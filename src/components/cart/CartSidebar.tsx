// Sidebar del carrito - VSM Store
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { cn, formatPrice, optimizeImage } from '@/lib/utils';
import { useCartStore, selectTotalItems, selectTotal } from '@/stores/cart.store';
import { useNavigate } from 'react-router-dom';


/**
 * Sidebar deslizable premium desde la derecha con los items del carrito
 */
export function CartSidebar() {
    const isOpen = useCartStore((s) => s.isOpen);
    const closeCart = useCartStore((s) => s.closeCart);
    const items = useCartStore((s) => s.items);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const cartTotal = useCartStore(selectTotal);
    const itemCount = useCartStore(selectTotalItems);
    const navigate = useNavigate();




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
                    'fixed top-0 right-0 z-50 flex h-full w-[85vw] max-w-[420px] flex-col',
                    'bg-primary-950/95 backdrop-blur-2xl border-l border-primary-800/50 shadow-2xl shadow-black/50',
                    'transition-transform duration-300 ease-out',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header del sidebar */}
                <div className="flex items-center justify-between border-b border-primary-800/50 px-5 py-4">
                    <h2 className="text-lg font-bold text-primary-100 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-vape-400" />
                        Carrito
                        {itemCount > 0 && (
                            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-vape-500/15 px-1.5 text-xs font-semibold text-vape-400 border border-vape-500/20">
                                {itemCount}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800/50 hover:text-primary-200 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido */}
                {items.length === 0 ? (
                    // Carrito vacío
                    <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
                        <div className="mb-4 rounded-2xl bg-primary-800/20 p-6">
                            <ShoppingBag className="h-16 w-16 text-primary-700" />
                        </div>
                        <p className="text-sm font-medium text-primary-400">Tu carrito está vacío</p>
                        <p className="mt-1 text-xs text-primary-600">Agrega productos para comenzar</p>
                        <button
                            onClick={closeCart}
                            className="mt-6 rounded-xl bg-primary-800/50 px-6 py-2.5 text-sm font-medium text-primary-300 border border-primary-700/30 transition-all hover:bg-primary-700/50 hover:text-primary-200"
                        >
                            Seguir comprando
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Lista de items con scroll */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
                            {items.map((item, index) => {
                                const isVape = item.product.section === 'vape';
                                const itemTotal = item.product.price * item.quantity;
                                return (
                                    <div
                                        key={item.product.id}
                                        className="flex gap-3 rounded-xl border border-primary-800/40 bg-primary-900/30 p-3 transition-all hover:bg-primary-900/50 animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                                    >
                                        {/* Imagen */}
                                        <div
                                            className={cn(
                                                'flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg',
                                                isVape ? 'bg-vape-500/8' : 'bg-herbal-500/8'
                                            )}
                                        >
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <img
                                                    src={optimizeImage(item.product.images[0], { width: 150, height: 150, quality: 80, format: 'webp' })}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.querySelector('.img-fallback')?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={cn(
                                                'img-fallback flex flex-col items-center justify-center',
                                                item.product.images && item.product.images.length > 0 ? 'hidden' : ''
                                            )}>
                                                <ShoppingBag className={cn(
                                                    'h-6 w-6',
                                                    isVape ? 'text-vape-500/50' : 'text-herbal-500/50'
                                                )} />
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-1 flex-col justify-between min-w-0">
                                            <div>
                                                <h3 className="text-sm font-medium text-primary-200 line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                <div className="flex items-baseline gap-1.5">
                                                    <span
                                                        className={cn(
                                                            'text-sm font-bold',
                                                            isVape ? 'text-vape-400' : 'text-herbal-400'
                                                        )}
                                                    >
                                                        {formatPrice(itemTotal)}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="text-[10px] text-primary-600">
                                                            ({formatPrice(item.product.price)} c/u)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Controles cantidad */}
                                            <div className="mt-1 flex items-center justify-between">
                                                <div className="flex items-center gap-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        className="rounded-md p-1 text-primary-500 hover:bg-primary-800/50 hover:text-primary-300 transition-colors"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-7 text-center text-sm font-semibold text-primary-300">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="rounded-md p-1 text-primary-500 hover:bg-primary-800/50 hover:text-primary-300 transition-colors"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.id)}
                                                    className="rounded-md p-1.5 text-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all"
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
                        <div className="border-t border-primary-800/50 px-5 py-4 space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary-500">Subtotal</span>
                                    <span className="text-sm text-primary-300">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-primary-500">Envío</span>
                                    <span className="text-sm text-herbal-400 font-medium">Gratis</span>
                                </div>
                                <hr className="border-primary-800/40" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary-300">Total</span>
                                    <span className="text-xl font-bold text-primary-100">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    closeCart();
                                    navigate('/checkout');
                                }}
                                className="group w-full rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 transition-all hover:shadow-vape-500/30 hover:-translate-y-0.5 active:translate-y-0 overflow-hidden relative"
                            >
                                <span className="relative z-10">Finalizar compra</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-vape-600 to-vape-500 opacity-0 transition-opacity group-hover:opacity-100" />
                            </button>
                        </div>
                    </>
                )
                }
            </aside>
        </>
    );
}
