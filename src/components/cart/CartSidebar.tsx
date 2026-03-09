import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ChevronRight, Truck, Zap, Check } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCartStore, selectTotalItems, selectTotal } from '@/stores/cart.store';
import { useHaptic } from '@/hooks/useHaptic';
import { useNotification } from '@/hooks/useNotification';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { getSmartRecommendations } from '@/services/products.service';
import type { Product } from '@/types/product';
import toast from 'react-hot-toast';

/**
 * Componente interno para Smart Upselling en el carrito
 */
function CartUpsell({ product }: { product: Product }) {
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const addItem = useCartStore((s) => s.addItem);
    const { trigger: haptic } = useHaptic();
    const notify = useNotification();

    useEffect(() => {
        const load = async () => {
            const data = await getSmartRecommendations(product, 4);
            setRecommendations(data);
        };
        load();
    }, [product]);

    if (recommendations.length === 0) return null;

    return (
        <div className="mt-8 border-t border-white/5 pt-6">
            <div className="flex items-center gap-2 mb-4 px-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <Zap className="h-3.5 w-3.5 fill-current" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                    Sugerencias Premium
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory px-2">
                {recommendations.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="w-44 flex-shrink-0 snap-start bg-white/[0.03] backdrop-blur-3xl rounded-[1.5rem] p-4 border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all group"
                    >
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                            <OptimizedImage
                                src={item.images?.[0] || item.cover_image || ''}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="text-[11px] font-bold text-white/70 line-clamp-1 mb-2 pr-1 font-inter uppercase tracking-wide">
                            {item.name}
                        </h4>
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-black text-white">
                                {formatPrice(item.price)}
                            </span>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,1)', color: '#0f172a' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    addItem(item, 1);
                                    haptic('success');
                                    notify.success('Agregado', `${item.name} se añadió al carrito`);
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition-all border border-white/10 shadow-lg"
                            >
                                <Plus className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/**
 * Componente interno para cada item del carrito con Spotlight individual
 */
interface CartItemProps {
    item: {
        product: Product;
        quantity: number;
        variant_id?: string | null;
        variant_name?: string | null;
    };
    isVape: boolean;
    onUpdateQuantity: (id: string, q: number, vId?: string | null) => void;
    onRemove: (id: string, vId?: string | null) => void;
}

function CartItem({ item, isVape, onUpdateQuantity, onRemove }: CartItemProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const itemTotal = item.product.price * item.quantity;

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            layout="position"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="group relative flex gap-4 rounded-[1.5rem] border border-white/5 bg-white/[0.04] p-4 shadow-xl backdrop-blur-xl transition-all hover:bg-white/[0.08] hover:border-white/20 hover:shadow-black/60 overflow-hidden"
        >
            {/* Spotlight Reveal */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.08), transparent 80%)`
                }}
            />

            {/* Imagen */}
            <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 shadow-inner z-10">
                {item.product.images?.[0] ? (
                    <OptimizedImage
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <ShoppingBag className="h-8 w-8 text-white/10" />
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col min-w-0 justify-between py-0.5 z-10">
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 pr-6">
                            {item.product.name}
                        </h3>
                        <button
                            onClick={() => onRemove(item.product.id, item.variant_id)}
                            className="absolute top-4 right-4 p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    {item.variant_name && (
                        <div className="inline-block mt-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/70">
                                {item.variant_name}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-end justify-between">
                    <div className="flex flex-col">
                        <motion.span
                            key={itemTotal}
                            initial={{ opacity: 0.5, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                'text-base font-black tracking-tight',
                                isVape ? 'text-vape-400 drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]' : 'text-herbal-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                            )}
                        >
                            {formatPrice(itemTotal)}
                        </motion.span>
                        {item.quantity > 1 && (
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                {formatPrice(item.product.price)} c/u
                            </span>
                        )}
                    </div>

                    {/* Controles cantidad */}
                    <div className="flex items-center bg-black/50 rounded-lg border border-white/10 p-1 shadow-inner relative z-20">
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.variant_id)}
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </button>
                        <motion.span
                            key={item.quantity}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-8 text-center text-sm font-black text-white"
                        >
                            {item.quantity}
                        </motion.span>
                        <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.variant_id)}
                            disabled={item.quantity >= item.product.stock}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

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
    const cartTotal = useCartStore(selectTotal);
    const itemCount = useCartStore(selectTotalItems);
    const navigate = useNavigate();
    const { trigger: haptic } = useHaptic();
    const notify = useNotification();

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
            haptic('medium'); // Haptic feedback al abrir
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
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

    const handleUpdateQuantity = (id: string, quantity: number, variantId?: string | null) => {
        haptic('light');
        updateQuantity(id, quantity, variantId);
    };

    const handleRemoveItem = (id: string, variantId?: string | null) => {
        const removedItem = items.find(i => i.product.id === id && i.variant_id === variantId);
        if (!removedItem) return;
        haptic('heavy');
        removeItem(id, variantId);

        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

        toast((t) => (
            <div className="flex w-full items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">Eliminado del carrito</span>
                    <span className="text-xs text-white/60 line-clamp-1">{removedItem.product.name}</span>
                </div>
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        haptic('success');
                        addItem(removedItem.product, removedItem.quantity, removedItem.variant_id ? { id: removedItem.variant_id, name: removedItem.variant_name || '' } : null);
                        notify.success('Restaurado', 'El producto regresó al carrito');
                    }}
                    className="flex-shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-white border border-white/20 transition-colors hover:bg-white/10 active:scale-95"
                >
                    Deshacer
                </button>
            </div>
        ), {
            duration: 5000,
            position: 'bottom-right',
            style: {
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }
        });
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
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
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
                                <motion.span
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    key={`badge-${itemCount}`}
                                    className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-vape-500 text-sm font-black text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                                >
                                    {itemCount}
                                </motion.span>
                            )}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeCart}
                            aria-label="Cerrar carrito"
                            className="rounded-full p-2.5 text-white/50 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all shadow-inner"
                        >
                            <X className="h-5 w-5" />
                        </motion.button>
                    </div>

                    {/* Contenido */}
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-1 flex-col items-center justify-center px-10 text-center"
                        >
                            <div className="relative mb-8 group">
                                <div className="absolute inset-0 blur-3xl bg-vape-500/20 rounded-full group-hover:bg-vape-500/40 transition-colors duration-700" />
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative rounded-3xl bg-white/5 p-8 border border-white/10 backdrop-blur-xl shadow-2xl"
                                >
                                    <ShoppingBag className="h-20 w-20 text-white/20" />
                                </motion.div>
                            </div>
                            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-500">Tu carrito está vacío</p>
                            <p className="mt-3 text-sm text-gray-400/80 leading-relaxed font-medium">
                                Parece que aún no has agregado prendas premium a tu selección.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={closeCart}
                                className="mt-10 rounded-2xl bg-gradient-to-r from-vape-600 to-vape-500 p-[1px] shadow-[0_0_30px_rgba(234,88,12,0.3)] hover:shadow-[0_0_40px_rgba(234,88,12,0.5)] transition-shadow"
                            >
                                <div className="rounded-2xl px-8 py-3.5 bg-vape-500/90 text-sm font-black uppercase tracking-[0.15em] text-white flex items-center justify-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Descubrir Colección
                                </div>
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            {/* Lista de items con scroll */}
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                                {/* Progress Bar de Envío Gratis Premium */}
                                <div className="relative overflow-hidden rounded-[1.5rem] bg-white/[0.03] border border-white/10 p-5 mb-4 shadow-2xl group/progress">
                                    {/* Animated background glow rotation */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent,rgba(16,185,129,0.3),transparent)] animate-[spin_8s_linear_infinite]" />
                                    </div>

                                    <div className="flex justify-between items-center mb-3.5 relative z-10">
                                        <div className="flex flex-col gap-0.5">
                                            {cartTotal >= 500 ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-herbal-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                                        <Check className="h-3.5 w-3.5 text-white" />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-[0.1em] text-herbal-400">Envío Gratis Desbloqueado</span>
                                                </motion.div>
                                            ) : (
                                                <>
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Faltan para envío gratis</span>
                                                    <span className="text-sm font-black text-white tracking-tight">{formatPrice(500 - cartTotal)}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                            <Truck className={cn("h-5 w-5 transition-colors", cartTotal >= 500 ? "text-herbal-400" : "text-white/20")} />
                                        </div>
                                    </div>

                                    <div className="h-3 w-full bg-black/40 rounded-full shadow-inner border border-white/5 relative overflow-hidden z-10">
                                        <motion.div
                                            initial={{ width: `${Math.min((prevTotalRef.current / 500) * 100, 100)}%` }}
                                            animate={{ width: `${Math.min((cartTotal / 500) * 100, 100)}%` }}
                                            transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                                            className={cn(
                                                "h-full rounded-full relative",
                                                cartTotal >= 500
                                                    ? "bg-gradient-to-r from-herbal-600 to-herbal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                                    : "bg-gradient-to-r from-vape-600 to-vape-400 shadow-[0_0_20px_rgba(234,88,12,0.4)]"
                                            )}
                                        >
                                            {/* Sparkle effect on progress end */}
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-4 bg-white/40 blur-sm rounded-full" />
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                        </motion.div>
                                    </div>

                                    {/* Micro-label for progress */}
                                    <div className="mt-2.5 flex justify-between px-1">
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Incio</span>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Meta $500</span>
                                    </div>
                                </div>


                                <AnimatePresence initial={false}>
                                    {items.map((item) => (
                                        <CartItem
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
                                    <CartUpsell product={items[0].product} />
                                )}
                            </div>

                            {/* Footer Rediseñado */}
                            <div className="relative pt-6 px-6 pb-8 border-t border-white/10 bg-gradient-to-t from-theme-primary to-theme-primary/80 backdrop-blur-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-white/60">
                                        <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-black text-white/80">{formatPrice(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">Envío Escogido</span>
                                        {cartTotal >= 500 ? (
                                            <motion.div
                                                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                                                className="flex items-center gap-1.5 bg-herbal-500/20 text-herbal-400 font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-herbal-500/30"
                                            >
                                                <Truck className="h-3 w-3" />
                                                Gratis
                                            </motion.div>
                                        ) : (
                                            <span className="text-xs font-bold text-white/40">Checkout</span>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-end justify-between">
                                        <div>
                                            <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-1 block">Total a Pagar</span>
                                            <div className="text-xs font-medium text-white/50 flex items-center gap-1.5">
                                                Impuestos incluidos
                                            </div>
                                        </div>

                                        {/* Odometer Price Effect */}
                                        <motion.div
                                            key={cartTotal}
                                            initial={{ y: -10, opacity: 0, filter: 'blur(4px)' }}
                                            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        >
                                            {formatPrice(cartTotal)}
                                        </motion.div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        closeCart();
                                        navigate('/checkout');
                                    }}
                                    className="group relative flex w-full h-16 items-center justify-center overflow-hidden rounded-2xl bg-[#50E3C2] shadow-[0_20px_40px_rgba(80,227,194,0.25)] transition-all hover:shadow-[0_25px_50px_rgba(80,227,194,0.4)] border border-white/20"
                                >
                                    {/* Shimmer continuo en botón final */}
                                    <div className="absolute inset-0 -translate-x-full animate-shimmer-slow bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                                    <div className="relative z-10 flex items-center justify-center gap-3 w-full h-full text-slate-900 font-black">
                                        <span className="text-[14px] uppercase tracking-[0.25em]">Proceder al Pago</span>
                                        <div className="bg-slate-900/10 p-2 rounded-full transition-transform group-hover:translate-x-2">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </motion.button>


                                <div className="mt-5 flex items-center justify-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Checkout Seguro</div>
                                    <div className="w-px h-3 bg-white/10" />
                                    <div className="flex items-center gap-1.5">Pagos Encriptados <Zap className="h-3 w-3" /></div>
                                </div>
                            </div>
                        </>
                    )}
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
