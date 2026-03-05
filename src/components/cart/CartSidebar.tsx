// Sidebar del carrito - VSM Store (Ultra Fluid Edition)
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight, Truck } from 'lucide-react';
import { cn, formatPrice, optimizeImage } from '@/lib/utils';
import { useCartStore, selectTotalItems, selectTotal } from '@/stores/cart.store';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotification } from '@/hooks/useNotification';

/**
 * Sidebar deslizable premium con físicas realistas de Framer Motion
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
    const { trigger: haptic } = useHaptic();
    const notify = useNotification();

    const sidebarRef = useRef<HTMLElement>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Bloquear scroll del body al abrir el drawer
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            haptic('medium'); // Haptic feedback al abrir

        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, haptic]);

    // Focus trap — cycle Tab within the sidebar
    const handleFocusTrap = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Tab' && sidebarRef.current) {
            const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0]!;
            const last = focusable[focusable.length - 1]!;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
        if (e.key === 'Escape') closeCart();
    }, [closeCart]);

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleFocusTrap);
        const timer = setTimeout(() => {
            sidebarRef.current?.querySelector<HTMLElement>('button')?.focus();
        }, 100);
        return () => {
            document.removeEventListener('keydown', handleFocusTrap);
            clearTimeout(timer);
        };
    }, [isOpen, handleFocusTrap]);

    const handleUpdateQuantity = (id: string, quantity: number) => {
        haptic('light');
        updateQuantity(id, quantity);
    };

    const handleRemoveItem = (id: string) => {
        const removedItem = items.find(i => i.product.id === id);
        if (!removedItem) return;
        haptic('heavy');
        removeItem(id);

        // Clear any pending undo timer
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        notify.info(
            'Producto eliminado',
            `${removedItem.product.name} fue removido del carrito.`,
        );

        // Re-add on undo (within 4s window — simplified via notification system)
        // The notification already auto-dismisses
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={closeCart}
                />
            )}
            {isOpen && (
                <motion.aside
                    key="sidebar"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{
                        type: 'spring',
                        damping: 25,
                        stiffness: 200,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(_, info) => {
                        if (info.offset.x > 100 || info.velocity.x > 500) {
                            closeCart();
                        }
                    }}
                    ref={sidebarRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cart-title"
                    className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[85vw] sm:max-w-[420px] flex-col glass-premium shadow-2xl shadow-black/60 touch-pan-y border-l border-theme"
                >
                    {/* Header del sidebar */}
                    <div className="flex items-center justify-between border-b border-theme px-6 py-5">
                        <h2 id="cart-title" className="text-xl font-black text-theme-primary flex items-center gap-2 tracking-tight">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vape-500/10 text-vape-400">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            Carrito
                            {itemCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    key={itemCount} // re-animate when changes
                                    className="ml-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-vape-500 text-xs font-black text-white shadow-lg shadow-vape-500/30"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeCart}
                            aria-label="Cerrar carrito"
                            className="rounded-full p-2 text-theme-primary transition-colors hover:bg-white/10"
                        >
                            <X className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Contenido */}
                    {items.length === 0 ? (
                        // Carrito vacío con animación
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-1 flex-col items-center justify-center px-10 text-center"
                        >
                            <div className="relative mb-6 group">
                                <div className="absolute inset-0 blur-2xl bg-vape-500/20 rounded-full group-hover:bg-vape-500/30 transition-colors" />
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="relative rounded-3xl bg-theme-secondary/30 p-8 vsm-border-subtle"
                                >
                                    <ShoppingBag className="h-16 w-16 text-theme-tertiary opacity-40" />
                                </motion.div>
                            </div>
                            <p className="text-lg font-bold text-theme-primary">Tu carrito está vacío</p>
                            <p className="mt-2 text-sm text-theme-secondary leading-relaxed">
                                Parece que aún no has agregado productos premium a tu selección.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={closeCart}
                                className="mt-8 rounded-xl bg-vape-500 px-8 py-3 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-vape-500/25 transition-colors hover:bg-vape-600 hover:shadow-vape-500/40"
                            >
                                Explorar Tienda
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Lista de items con scroll */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-none">
                                <div className="rounded-xl bg-herbal-500/5 vsm-border-subtle p-4 mb-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-herbal-400 uppercase tracking-wider">¡Envío Seguro! *</span>
                                        <span className="text-xs font-bold text-herbal-400">100%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-herbal-500/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-herbal-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {items.map((item, index) => {
                                        const isVape = item.product.section === 'vape';
                                        const itemTotal = item.product.price * item.quantity;
                                        return (
                                            <motion.div
                                                key={item.product.id}
                                                layout
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group flex gap-4 rounded-2xl vsm-border-subtle bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                                            >
                                                {/* Imagen */}
                                                <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-theme-secondary/40 vsm-border">
                                                    {item.product.images?.[0] ? (
                                                        <motion.img
                                                            whileHover={{ scale: 1.1 }}
                                                            src={optimizeImage(item.product.images[0], { width: 160, height: 160, quality: 80, format: 'webp' })}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            onClick={() => handleRemoveItem(item.product.id)}
                                                            className="p-1.5 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>

                                                    <div className="mt-1 flex items-baseline gap-1.5">
                                                        <span className={cn(
                                                            'text-sm font-black',
                                                            isVape ? 'text-vape-400' : 'text-herbal-400'
                                                        )}>
                                                            {formatPrice(itemTotal)}
                                                        </span>
                                                        {item.quantity > 1 && (
                                                            <span className="text-xs text-theme-secondary font-medium uppercase tracking-tight opacity-60">
                                                                ({formatPrice(item.product.price)} c/u)
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Controles cantidad */}
                                                    <div className="mt-auto pt-2 flex items-center">
                                                        <div className="flex items-center bg-theme-primary/40 rounded-lg vsm-border p-0.5">
                                                            <motion.button
                                                                whileTap={{ scale: 0.8 }}
                                                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                                                                disabled={item.quantity <= 1}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-theme-secondary hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </motion.button>
                                                            <span className="w-8 text-center text-xs font-black text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <motion.button
                                                                whileTap={{ scale: 0.8 }}
                                                                onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                                                                disabled={item.quantity >= item.product.stock}
                                                                className="flex h-7 w-7 items-center justify-center rounded-md text-theme-secondary hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Footer con desglose y botón */}
                            <div className="vsm-divider glass-premium px-8 py-8 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-bold text-theme-primary">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-theme-secondary uppercase tracking-widest">Envío</span>
                                        {cartTotal >= 500 ? (
                                            <div className="flex items-center gap-1.5 text-herbal-400 font-bold text-xs uppercase tracking-widest">
                                                <Truck className="h-3 w-3" />
                                                <span>Gratis</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-medium text-theme-tertiary">Se calcula al checkout</span>
                                        )}
                                    </div>
                                    {cartTotal < 500 && (
                                        <div className="mt-2 space-y-1.5">
                                            <div className="flex justify-between text-[10px] text-theme-tertiary">
                                                <span>Te faltan <strong className="text-vape-400">{formatPrice(500 - cartTotal)}</strong> para envío gratis</span>
                                            </div>
                                            <div className="h-1 w-full bg-theme-tertiary/20 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-vape-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min((cartTotal / 500) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-black text-theme-primary tracking-tight">Total Selección</span>
                                            <span className="text-2xl font-black text-theme-primary tracking-tighter">
                                                {formatPrice(cartTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        closeCart();
                                        navigate('/checkout');
                                    }}
                                    className="group relative flex w-full h-14 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-vape-500 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-vape-500/25 transition-shadow hover:shadow-vape-500/50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-vape-600 via-vape-500 to-vape-600 opacity-0 transition-opacity group-hover:opacity-100 group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                    <span className="relative z-10">Checkout Seguro</span>
                                    <ChevronRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </motion.button>

                                <p className="text-center text-xs text-theme-tertiary uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Truck className="h-3 w-3" />
                                    Despacho en tiempo récord
                                </p>
                            </div>
                        </>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
