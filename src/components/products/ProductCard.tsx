/**
 * ProductCard Component — VSM Store
 *
 * Componente core para la visualización de productos en rejillas y rieles.
 * Incluye acciones rápidas, animaciones premium y soporte para estados de carga.
 *
 * @author VSM Store
 * @version 1.1.0
 */
import { lazy, memo, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Package, Plus, Check, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useNotification } from '@/hooks/useNotification';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useQueryClient } from '@tanstack/react-query';
import { getProductBySlug } from '@/services';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { useSafety } from '@/contexts/SafetyContext';

// Lazy-load: QuickViewModal solo se descarga al abrir "Vista Rápida"
const QuickViewModal = lazy(() => import('./QuickViewModal').then(m => ({ default: m.QuickViewModal })));

interface ProductCardProps {
    product: Product;
    className?: string;
    compact?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, className, compact = false }: ProductCardProps) {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const toggleItem = useWishlistStore((s) => s.toggleItem);
    const isWishlisted = useWishlistStore((s) => s.isInWishlist(product.id));
    const { playClick, playSuccess, triggerHaptic } = useTacticalUI();
    const { isEmergency } = useSafety();
    const notify = useNotification();
    const queryClient = useQueryClient();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playSuccess();
        triggerHaptic([10, 30, 10]);
        addItem(product, 1);
        notify.success('Agregado', `${product.name} agregado al carrito`);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        triggerHaptic(10);
        toggleItem(product);
        notify.success(
            isWishlisted ? 'Eliminado' : 'Agregado',
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos'
        );
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        playClick();
        setIsQuickViewOpen(true);
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={cn('block h-full group', className)}
            >
                <Link
                    to={`/${product.section}/${product.slug}`}
                    className="block h-full relative"
                    onMouseEnter={() => {
                        // Anticipatory UX: Prefetch product details when user hovers
                        queryClient.prefetchQuery({
                            queryKey: ['products', 'detail', product.section, product.slug],
                            queryFn: () => getProductBySlug(product.slug, product.section),
                            staleTime: 1000 * 60, // 1 min
                        });
                    }}
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                    }}
                >
                    <div
                        className="relative glass-premium rounded-[2rem] overflow-hidden transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full flex flex-col isolation-auto border border-white/5"
                    >
                        {/* Spotlight Effect Layer */}
                        <div className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                            style={{
                                background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.06), transparent 40%)`
                            }}
                        />

                        {/* Image Container */}
                        <div
                            className="relative aspect-square overflow-hidden bg-slate-900/40"
                            onMouseEnter={() => {
                                if (product.images?.length > 1) setCurrentImage(1);
                            }}
                            onMouseLeave={() => setCurrentImage(0)}
                        >
                            {/* Image */}
                            <motion.div
                                className="h-full w-full"
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <OptimizedImage
                                    src={product.images?.[currentImage] || ''}
                                    alt={product.name}
                                    width={400}
                                    height={400}
                                    containerClassName="h-full w-full"
                                    className="object-cover"
                                    fallbackIcon={<Package className="w-16 h-16 text-white/10" />}
                                />
                            </motion.div>

                            {/* Hover Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Image dots indicator */}
                            {product.images?.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {product.images.slice(0, 4).map((_, idx) => (
                                        <motion.span
                                            key={idx}
                                            animate={{
                                                width: currentImage === idx ? 16 : 6,
                                                backgroundColor: currentImage === idx ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)'
                                            }}
                                            className="h-1.5 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Badges (Top-left) */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                <AnimatePresence>
                                    {product.is_new && (
                                        <motion.span
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="px-3 py-1 bg-vape-500 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg shadow-vape-500/30"
                                        >
                                            NUEVO
                                        </motion.span>
                                    )}
                                    {product.is_bestseller && (
                                        <motion.span
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="px-3 py-1 bg-herbal-500 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg shadow-herbal-500/30"
                                        >
                                            HOT
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Wishlist Button (Top-right) */}
                            {!compact && (
                                <motion.button
                                    onClick={handleWishlist}
                                    initial={{ x: 20, opacity: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    animate={{
                                        x: 0,
                                        opacity: 1,
                                    }}
                                    className={cn(
                                        "absolute top-4 right-4 z-10 w-10 h-10 backdrop-blur-xl rounded-full flex items-center justify-center transition-all shadow-xl border border-white/10",
                                        isWishlisted
                                            ? "bg-red-500 text-white border-red-400"
                                            : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4 transition-all", isWishlisted && "fill-current")} />
                                </motion.button>
                            )}

                            {/* Quick Actions (Bottom) */}
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-[0.22, 1, 0.36, 1]">
                                <button
                                    onClick={handleQuickView}
                                    className="flex-1 h-12 bg-white text-slate-900 font-black rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-[10px] tracking-widest shadow-xl active:scale-95"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className={compact ? 'hidden' : 'inline'}>VISTA RÁPIDA</span>
                                </button>
                                <button
                                    onClick={handleQuickAdd}
                                    disabled={product.stock === 0}
                                    className={cn(
                                        "h-12 bg-slate-900/90 backdrop-blur-xl hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition-all shadow-xl border border-white/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                                        product.stock === 0 ? "px-4 w-auto" : "w-12",
                                        isEmergency && "bg-green-600 hover:bg-green-500 border-green-400"
                                    )}
                                >
                                    {isEmergency ? (
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    ) : (
                                        product.stock === 0 ? <span className="text-[10px] font-black tracking-widest uppercase">AGOTADO</span> : (
                                            isAdded ? <Check className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> : <ShoppingCart className="w-5 h-5 transition-transform hover:scale-110" />
                                        )
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-6 flex-1 flex flex-col relative justify-between bg-gradient-to-b from-transparent to-black/30">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full border",
                                        product.section === 'vape' ? "bg-vape-500/10 text-vape-400 border-vape-500/20" : "bg-herbal-500/10 text-herbal-400 border-herbal-500/20"
                                    )}>
                                        {product.section}
                                    </span>
                                    {/* Stock Pulse Indicator */}
                                    {!compact && product.stock <= 5 && product.stock > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                            <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                                Últimas {product.stock}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <h3 className={cn(
                                    "font-black text-white leading-tight group-hover:text-vape-400 transition-colors line-clamp-2 tracking-tight",
                                    compact ? "text-base" : "text-xl"
                                )}>
                                    {product.name}
                                </h3>
                            </div>

                            <div className="mt-6 flex items-end justify-between">
                                <div className="flex flex-col">
                                    {product.compare_at_price && product.compare_at_price > product.price && (
                                        <span className="text-xs text-white/30 line-through font-bold mb-0.5">
                                            {formatPrice(product.compare_at_price)}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "font-black tracking-tighter text-white",
                                        compact ? "text-xl" : "text-3xl"
                                    )}>
                                        {formatPrice(product.price)}
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 8 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={isEmergency ? () => window.open(`https://wa.me/521234567890?text=Hola, me interesa ${product.name}`, '_blank') : handleQuickAdd}
                                    disabled={product.stock === 0}
                                    className={cn(
                                        "flex h-12 rounded-2xl border items-center justify-center transition-all shadow-inner disabled:opacity-20",
                                        isAdded 
                                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                                            : "bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-900",
                                        product.stock === 0 ? "px-4 w-auto" : "w-12",
                                        isEmergency && !isAdded && "bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600 hover:text-white"
                                    )}
                                >
                                    {isEmergency ? (
                                        <MessageCircle className="w-6 h-6" />
                                    ) : (
                                        product.stock === 0 ? <span className="text-[10px] font-black uppercase tracking-widest">X</span> : (
                                            isAdded ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />
                                        )
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* Quick View Modal — lazy-loaded, solo se descarga al abrir */}
            {isQuickViewOpen && (
                <Suspense fallback={null}>
                    <QuickViewModal
                        product={product}
                        isOpen={isQuickViewOpen}
                        onClose={() => setIsQuickViewOpen(false)}
                    />
                </Suspense>
            )}
        </>
    );
});
