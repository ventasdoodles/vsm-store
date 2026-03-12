/**
 * // ─── PÁGINA: WISHLIST ───
 * // Propósito: Gestión de productos favoritos del usuario.
 * // Arquitectura: Pure presentation with Zustand store integration (§1.1).
 * // Estilo: High-End Premium Aesthetics & Cinematic Empty States (§2.1).
 */
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SEO } from '@/components/seo/SEO';

export function Wishlist() {
    const items = useWishlistStore((s) => s.items);
    const clearWishlist = useWishlistStore((s) => s.clearWishlist);
    const addToCart = useCartStore((s) => s.addItem);
    const notify = useNotification();

    const handleAddAllToCart = () => {
        const inStock = items.filter(p => p.stock > 0);
        if (inStock.length === 0) {
            notify.warning('Sin stock', 'Ninguno de tus favoritos está disponible.');
            return;
        }
        inStock.forEach(product => addToCart(product));
        notify.success(
            '¡Agregados al carrito!',
            `${inStock.length} producto${inStock.length > 1 ? 's' : ''} agregado${inStock.length > 1 ? 's' : ''}.`
        );
    };

    return (
        <div className="container-vsm py-12 min-h-[70vh] space-y-10">
            <SEO title="Mis Favoritos" description="Tus productos favoritos guardados para después." />

            {/* Header Cinemático */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-red-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse-slow" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-black border border-white/10 text-red-500 shadow-2xl">
                            <Heart className="h-8 w-8 fill-current" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-accent-primary animate-bounce-slow" />
                            <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">Mis Favoritos</h1>
                        </div>
                        <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-[0.2em] opacity-60 mt-1">
                            {items.length} {items.length === 1 ? 'objeto de deseo' : 'objetos de deseo'} guardados
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddAllToCart}
                            className="group relative flex items-center gap-3 rounded-[2rem] bg-accent-primary px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-accent-primary/30 transition-all hover:bg-accent-secondary hover:-translate-y-1 active:scale-95"
                        >
                            <ShoppingCart className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                            Llevar Todo al Carrito
                            <div className="absolute inset-0 rounded-[2rem] bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-10" />
                        </button>
                        <button
                            onClick={clearWishlist}
                            className="flex h-14 w-14 items-center justify-center rounded-[2rem] bg-white/5 border border-white/5 text-theme-secondary hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-500 shadow-xl"
                            title="Limpiar Favoritos"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </header>

            <AnimatePresence initial={false}>
                {items.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/5 relative overflow-hidden group"
                    >
                        {/* Background decorativo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[100px] group-hover:bg-red-500/10 transition-colors duration-1000" />
                        
                        <div className="relative mb-8">
                             <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl animate-pulse-slow" />
                             <div className="relative rounded-[2.5rem] bg-black/40 p-10 border border-white/10 shadow-2xl">
                                <Heart className="h-20 w-20 text-theme-tertiary opacity-20" />
                             </div>
                        </div>

                        <div className="relative space-y-4 max-w-sm px-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Tu Bitácora de Deseos está Vacía</h2>
                            <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest leading-relaxed opacity-60">
                                No dejes que tus favoritos se escapen. Explora nuestra curación exclusiva y guarda lo que te inspire.
                            </p>
                            <div className="pt-6">
                                <Link
                                    to="/"
                                    className="vsm-button-primary inline-flex gap-4 px-10"
                                >
                                    <ShoppingBag className="h-4 w-4" />
                                    Descubrir Vanguardia
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="animate-in fade-in duration-1000"
                    >
                        <ProductGrid products={items} isLoading={false} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
