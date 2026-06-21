import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ChevronRight, Truck, Zap } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, selectTotalItems, selectTotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { getStorefrontCheckoutTransitionView } from '@/lib/domain/cart';
import { getStorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';
import { CheckoutTransitionStatus } from './CheckoutTransitionStatus';
import { OpenRecoverableOrderNotice } from './OpenRecoverableOrderNotice';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useOpenRecoverableOrder } from '@/hooks/useOrders';
import { useStorefrontCartDependencyOffer } from '@/hooks/useStorefrontCartDependencyOffer';
import { CartSmartUpsell } from './CartSmartUpsell';
import { CartItemCard } from './CartItemCard';
import { ProactiveAISuggestions } from '@/components/ui/ProactiveAISuggestions';
/**
 * Sidebar deslizable premium con físicas realistas de Framer Motion
 * REDISEÑO VISUAL: App Feel v2.0 (Glassmorphism & Micro-animaciones)
 */
export function CartSidebar() {
    const isOpen = useCartStore((s) => s.isOpen);
    const closeCart = useCartStore((s) => s.closeCart);
    const items = useCartStore((s) => s.items);
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
    const addItem = useCartStore((s) => s.addItem);
    const lastValidationResult = useCartStore((s) => s.lastValidationResult);
    const cartTotal = useCartStore(selectTotal);
    const itemCount = useCartStore(selectTotalItems);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { data: openRecoverableOrder } = useOpenRecoverableOrder(isAuthenticated ? user?.id : undefined);
    const { data: cartDependencyOffer } = useStorefrontCartDependencyOffer(items);
    const { playClick, playSuccess, playTick, playError, triggerHaptic } = useTacticalUI();
    const notify = useNotification();
    const { runValidation, isValidating } = useCartValidator();
    const transitionView = getStorefrontCheckoutTransitionView(items, lastValidationResult, cartDependencyOffer ?? null);
    const openOrderRecoveryView = openRecoverableOrder
        ? getStorefrontOpenOrderRecoveryView(openRecoverableOrder)
        : null;

    const sidebarRef = useRef<HTMLElement>(null);
    const undoTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
    const prevTotalRef = useRef(cartTotal);

    useEffect(() => {
        prevTotalRef.current = cartTotal;
    }, [cartTotal]);

    // Bloquear scroll del body al abrir el drawer
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            playClick();
            triggerHaptic(40); // Haptic feedback al abrir
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, playClick, triggerHaptic]);

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

    const handleUpdateQuantity = (id: string, quantity: number, variantId?: string | null) => {
        playTick();
        triggerHaptic(10);
        updateQuantity(id, quantity, variantId);
    };

    const handleRemoveItem = (id: string, variantId?: string | null) => {
        const removedItem = items.find(i => i.product.id === id && i.variant_id === variantId);
        if (!removedItem) return;
        playError();
        triggerHaptic(80);
        removeItem(id, variantId);

        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        notify.info('Eliminado del carrito', removedItem.product.name, {
            actionLabel: 'Deshacer',
            actionCallback: () => {
                playSuccess();
                triggerHaptic([10, 30, 10]);
                addItem(
                    removedItem.product,
                    removedItem.quantity,
                    removedItem.variant_id ? { id: removedItem.variant_id, name: removedItem.variant_name || '' } : null
                );
                notify.success('Restaurado', 'El producto regresó al carrito');
            }
        });
    };

    const handleProceedToCheckout = async () => {
        if (isValidating) return;

        playClick();
        triggerHaptic(20);

        if (openRecoverableOrder && openOrderRecoveryView?.shouldRecover) {
            notify.warning('Ya existe una orden pendiente', openOrderRecoveryView.detail);
            closeCart();
            navigate(`/orders/${openRecoverableOrder.id}`);
            return;
        }

        const result = await runValidation();
        const correctedItems = useCartStore.getState().items;
        const correctedTransitionView = getStorefrontCheckoutTransitionView(correctedItems, result, cartDependencyOffer ?? null);

        if (!correctedTransitionView.canProceedToCheckout) {
            playError();
            triggerHaptic(80);
            notify.warning('Revisa tu carrito', correctedTransitionView.detail);
            return;
        }

        closeCart();
        navigate('/checkout');
    };

    const handleOpenDependencyProduct = (missingProduct: NonNullable<typeof transitionView.dependencyGuidance>['missingProduct']) => {
        closeCart();
        navigate(`/${missingProduct.section}/${missingProduct.slug}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    key="overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
                    onClick={closeCart}
                />
            )}
            {isOpen && (
                <m.aside
                    key="sidebar"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{
                        type: 'spring',
                        damping: 20,
                        stiffness: 150,
                        mass: 0.8
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
                    style={{ willChange: 'transform' }}
                    className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[85vw] sm:max-w-[420px] flex-col bg-slate-900/60 backdrop-blur-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] touch-pan-y border-l border-white/10"
                >
                    {/* Background Glows for Glassmorphism Depth */}
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-vape-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-herbal-500/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

                    {/* Header del sidebar */}
                    <div className="flex items-center justify-between px-6 py-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
                        <h2 id="cart-title" className="text-2xl font-black text-white flex items-center gap-3 tracking-tight drop-shadow-md">
                            Carrito
                            {itemCount > 0 && (
                                <m.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    key={`badge-${itemCount}`}
                                    className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-vape-500 text-sm font-black text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                                >
                                    {itemCount}
                                </m.span>
                            )}
                        </h2>
                        <m.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeCart}
                            aria-label="Cerrar carrito"
                            className="rounded-full p-2.5 text-white/50 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all shadow-inner"
                        >
                            <X className="h-5 w-5" />
                        </m.button>
                    </div>
                    {/* Contenido Vacío Transcendental */}
                    {items.length === 0 ? (
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-1 flex-col items-center justify-center px-10 text-center relative overflow-hidden"
                        >
                            {/* Cosmic Depth Background */}
                            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
                            
                            <div className="relative mb-12 group">
                                {/* Floating Orbs */}
                                <m.div 
                                    animate={{ 
                                        y: [0, -15, 0],
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-6 -left-6 w-12 h-12 bg-vape-500/20 blur-xl rounded-full"
                                />
                                <m.div 
                                    animate={{ 
                                        y: [0, 15, 0],
                                        rotate: [0, -5, 5, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    className="absolute -bottom-6 -right-6 w-16 h-16 bg-herbal-500/20 blur-xl rounded-full"
                                />

                                <div className="absolute inset-0 blur-[60px] bg-gradient-to-tr from-vape-500/30 to-herbal-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                
                                <m.div
                                    whileHover={{ scale: 1.05, rotateY: 10 }}
                                    className="relative rounded-[2.5rem] bg-white/[0.03] p-10 border border-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] preserve-3d"
                                >
                                    <ShoppingBag className="h-24 w-24 text-white/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" strokeWidth={1} />
                                    
                                    {/* Liquid Glow Ring */}
                                    <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                                </m.div>
                            </div>

                            <m.h3 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 tracking-tighter"
                            >
                                Espacio de Lujo Vacío
                            </m.h3>
                            
                            <m.p 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 text-sm text-gray-400 font-medium leading-relaxed max-w-[280px]"
                            >
                                Tu selección premium aguarda. Inicia tu viaje visual explorando nuestra curaduría exclusiva.
                            </m.p>

                            <m.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={closeCart}
                                className="mt-8 group relative"
                            >
                                <div className="absolute inset-0 bg-vape-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative rounded-2xl px-10 py-4 bg-white text-slate-900 text-xs font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-2xl">
                                    Explorar Catálogo
                                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </m.button>

                            <ProactiveAISuggestions />
                        </m.div>
                    ) : (
                        <>
                            {/* Lista de items con scroll */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                                {/* Shipping expectation */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white/[0.03] border border-white/10 p-5 mb-4 shadow-2xl group/progress">
                                    {/* Animated background glow rotation */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.3),transparent)] animate-[spin_8s_linear_infinite]" />
                                    </div>

                                    <div className="flex justify-between items-center mb-3.5 relative z-10">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Envío revisado en checkout</span>
                                            <span className="text-sm font-black text-white tracking-tight">Costo final confirmado antes de cerrar</span>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                            <Truck className="h-5 w-5 text-herbal-400 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="h-3 w-full bg-black/40 rounded-full shadow-inner border border-white/5 relative overflow-hidden z-10">
                                        <m.div
                                            initial={{ width: `${items.length > 0 ? 100 : 0}%` }}
                                            animate={{ width: `${items.length > 0 ? 100 : 0}%` }}
                                            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                                            className="h-full rounded-full relative bg-gradient-to-r from-herbal-600 to-herbal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                        >
                                            {/* Sparkle effect on progress end */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-4 bg-white/40 blur-sm rounded-full" />
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                        </m.div>
                                    </div>

                                    {/* Micro-label for progress */}
                                    <div className="mt-2.5 flex justify-between px-1">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Carrito</span>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Confirmacion</span>
                                    </div>
                                </div>


                                <AnimatePresence mode="wait">
                                    {items.map((item) => (
                                        <CartItemCard
                                            key={`${item.product.id}-${item.variant_id || 'base'}`}
                                            item={item}
                                            isVape={item.product.section === 'vape'}
                                            onUpdateQuantity={handleUpdateQuantity}
                                            onRemove={handleRemoveItem}
                                        />
                                    ))}
                                </AnimatePresence>

                                {/* Smart Upselling Section */}
                                {items.length > 0 && items[0] && (
                                    <CartSmartUpsell product={items[0].product} />
                                )}
                            </div>

                            {/* Footer Rediseñado */}
                            <div className="relative pt-6 px-6 pb-8 border-t border-white/10 bg-gradient-to-t from-theme-primary to-theme-primary/80 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                                {openRecoverableOrder && openOrderRecoveryView?.shouldRecover && (
                                    <div className="mb-5">
                                        <OpenRecoverableOrderNotice
                                            order={openRecoverableOrder}
                                            view={openOrderRecoveryView}
                                            compact
                                        />
                                    </div>
                                )}
                                <div className="mb-5">
                                    <CheckoutTransitionStatus
                                        view={transitionView}
                                        compact
                                        onDependencyAction={handleOpenDependencyProduct}
                                    />
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-white/60">
                                        <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-black text-white/80">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Envío</span>
                                        <span className="text-xs font-bold text-white/40">Calculado al confirmar</span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                                        <div>
                                            <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1 block">Total a Pagar</span>
                                            <div className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                                Impuestos incluidos
                                            </div>
                                        </div>

                                        {/* Odometer Price Effect */}
                                        <m.div
                                            key={cartTotal}
                                            initial={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        >
                                            {formatPrice(cartTotal)}
                                        </m.div>
                                    </div>
                                </div>

                                <m.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleProceedToCheckout}
                                    disabled={isValidating || (!openOrderRecoveryView?.shouldRecover && !transitionView.canProceedToCheckout)}
                                    className={cn(
                                        "group relative flex w-full h-16 items-center justify-center overflow-hidden rounded-2xl bg-[#50E3C2] shadow-[0_20px_40px_rgba(80,227,194,0.25)] transition-all hover:shadow-[0_25px_50px_rgba(80,227,194,0.4)] border border-white/20",
                                        (isValidating || (!openOrderRecoveryView?.shouldRecover && !transitionView.canProceedToCheckout)) && "cursor-not-allowed opacity-60 grayscale"
                                    )}
                                >
                                    {/* Shimmer continuo en botón final */}
                                    <div className="absolute inset-0 -translate-x-full animate-shimmer-slow bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                                    <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full text-slate-900 font-black">
                                        <span className="text-[14px] uppercase tracking-[0.25em]">
                                            {openOrderRecoveryView?.shouldRecover
                                                ? openOrderRecoveryView.sidebarActionLabel
                                                : transitionView.status === 'blocked'
                                                    ? 'Carrito no listo'
                                                    : transitionView.status === 'review'
                                                        ? 'Revisar checkout'
                                                        : 'Proceder al Pago'}
                                        </span>
                                        <div className="bg-slate-900/10 p-2 rounded-full transition-transform group-hover:translate-x-2">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </m.button>


                                <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Revisión previa al pago</div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-1.5">Pagos Encriptados <Zap className="h-3 w-3" /></div>
                                </div>
                            </div>
                        </>
                    )}
                </m.aside>
            )}
        </AnimatePresence>
    );
}
