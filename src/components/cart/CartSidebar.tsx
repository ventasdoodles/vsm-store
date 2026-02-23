// Sidebar del carrito - VSM Store
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight, Truck } from 'lucide-react';
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
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-title"
                className={cn(
                    'fixed top-0 right-0 z-50 flex h-full w-full max-w-[85vw] sm:max-w-[420px] flex-col',
                    'glass-premium shadow-2xl shadow-black/60',
                    'transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header del sidebar */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                    <h2 id="cart-title" className="text-xl font-black text-theme-primary flex items-center gap-2 tracking-tight">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vape-500/10 text-vape-400">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        Carrito
                        {itemCount > 0 && (
                            <span className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-vape-500 text-[10px] font-black text-white shadow-lg shadow-vape-500/30">
                                {itemCount}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        aria-label="Cerrar carrito"
                        className="rounded-full p-2 text-theme-secondary hover:bg-white/5 hover:text-theme-primary transition-all active:scale-90"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido */}
                {items.length === 0 ? (
                    // Carrito vacío
                    <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 blur-2xl bg-vape-500/20 rounded-full" />
                            <div className="relative rounded-3xl bg-theme-secondary/30 p-8 border border-white/5">
                                <ShoppingBag className="h-16 w-16 text-theme-tertiary opacity-40" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-theme-primary">Tu carrito está vacío</p>
                        <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                            Parece que aún no has agregado productos premium a tu selección.
                        </p>
                        <button
                            onClick={closeCart}
                            className="mt-8 rounded-xl bg-vape-500 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40"
                        >
                            Explorar Tienda
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Lista de items con scroll */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-none">
                            {/* Promo Progress (Visual Polishing) */}
                            <div className="rounded-xl bg-herbal-500/5 border border-herbal-500/15 p-4 mb-2">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-herbal-400 uppercase tracking-wider">¡Envío Premium Gratis!</span>
                                    <span className="text-[10px] font-bold text-herbal-400">100%</span>
                                </div>
                                <div className="h-1.5 w-full bg-herbal-500/10 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-herbal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                </div>
                            </div>

                            {items.map((item, index) => {
                                const isVape = item.product.section === 'vape';
                                const itemTotal = item.product.price * item.quantity;
                                return (
                                    <div
                                        key={item.product.id}
                                        className="group flex gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05] hover:border-white/10"
                                        style={{
                                            animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
                                        }}
                                    >
                                        {/* Imagen */}
                                        <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-theme-secondary/40 border border-white/10 group-hover:scale-105 transition-transform duration-300">
                                            {item.product.images && item.product.images.length > 0 ? (
                                                <img
                                                    src={optimizeImage(item.product.images[0], { width: 160, height: 160, quality: 80, format: 'webp' })}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag className="h-8 w-8 text-theme-tertiary/20" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-1 flex-col min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-sm font-bold text-theme-primary leading-tight line-clamp-2 pr-2">
                                                    {item.product.name}
                                                </h3>
                                                <button
                                                    onClick={() => removeItem(item.product.id)}
                                                    className="p-1.5 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="mt-1 flex items-baseline gap-1.5">
                                                <span className={cn(
                                                    'text-sm font-black',
                                                    isVape ? 'text-vape-400' : 'text-herbal-400'
                                                )}>
                                                    {formatPrice(itemTotal)}
                                                </span>
                                                {item.quantity > 1 && (
                                                    <span className="text-[10px] text-theme-secondary font-medium uppercase tracking-tight opacity-60">
                                                        ({formatPrice(item.product.price)} c/u)
                                                    </span>
                                                )}
                                            </div>

                                            {/* Controles cantidad */}
                                            <div className="mt-auto pt-2 flex items-center">
                                                <div className="flex items-center bg-theme-primary/40 rounded-lg border border-white/10 p-0.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-theme-secondary hover:text-white hover:bg-white/5 transition-all active:scale-90"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-black text-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                        className="flex h-7 w-7 items-center justify-center rounded-md text-theme-secondary hover:text-white hover:bg-white/5 transition-all active:scale-90"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer con desglose y botón */}
                        <div className="border-t border-white/10 glass-premium px-8 py-8 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-bold text-theme-primary">{formatPrice(cartTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Envío</span>
                                    <div className="flex items-center gap-1.5 text-herbal-400 font-bold text-xs uppercase tracking-widest">
                                        <Truck className="h-3 w-3" />
                                        <span>Gratis</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-theme-primary tracking-tight">Total Selección</span>
                                        <span className="text-2xl font-black text-theme-primary tracking-tighter">
                                            {formatPrice(cartTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    closeCart();
                                    navigate('/checkout');
                                }}
                                className="group relative w-full h-14 rounded-2xl bg-vape-500 shadow-2xl shadow-vape-500/25 transition-all hover:shadow-vape-500/50 hover:-translate-y-1 active:translate-y-0 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-vape-600 via-vape-500 to-vape-600 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                <div className="relative flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-white">
                                    <span>Checkout Premium</span>
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>

                            <button
                                onClick={closeCart}
                                className="w-full rounded-xl border border-white/10 py-2.5 text-xs font-semibold uppercase tracking-widest text-theme-secondary transition-all hover:border-white/20 hover:text-theme-primary hover:bg-white/5"
                            >
                                Seguir comprando
                            </button>

                            <p className="text-center text-[10px] font-bold text-theme-tertiary uppercase tracking-widest opacity-40">
                                Transacción Segura • VSM Store
                            </p>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
