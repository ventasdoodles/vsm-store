/**
 * FlashDeals - Sección de ofertas flash con countdown y carrusel horizontal.
 *
 * @module FlashDeals
 * @independent Componente 100% independiente. Obtiene productos via useProducts().
 * @data Productos obtenidos del API, ofertas simuladas internamente.
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap, Clock, Package, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '@/hooks/useProducts';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import type { Product } from '@/types/product';

interface FlashDeal {
    product: Product;
    originalPrice: number;
    discountPercent: number;
    soldPercent: number;
    itemsLeft: number;
}

// Constantes movidas fuera del componente para evitar warnings de dependencias en hooks
const DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas
const LS_KEY = 'vsm-flash-deals-end';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const FlashDeals = () => {
    // Obtener productos para flash deals
    const { data: products = [] } = useProducts({ limit: 8 });
    const { data: settings } = useStoreSettings();

    const getEndTime = useCallback((): number => {
        // 1. Si el admin configuró una hora de fin en BD
        if (settings?.flash_deals_end) {
            const dbEnd = new Date(settings.flash_deals_end).getTime();
            if (dbEnd > Date.now()) return dbEnd;
        }
        // 2. Si hay una hora guardada en localStorage y aún no expiró
        const stored = localStorage.getItem(LS_KEY);
        if (stored) {
            const ts = Number(stored);
            if (ts > Date.now()) return ts;
        }
        // 3. Generar nueva ventana de 6h y guardarla
        const newEnd = Date.now() + DURATION_MS;
        localStorage.setItem(LS_KEY, String(newEnd));
        return newEnd;
    }, [settings?.flash_deals_end]);

    const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 0, seconds: 0 });

    useEffect(() => {
        const tick = () => {
            const end = getEndTime();
            const diff = Math.max(0, end - Date.now());
            if (diff === 0) {
                // Expiró ? generar nueva ventana
                const newEnd = Date.now() + DURATION_MS;
                localStorage.setItem(LS_KEY, String(newEnd));
            }
            const totalSec = Math.floor(diff / 1000);
            setTimeLeft({
                hours: Math.floor(totalSec / 3600),
                minutes: Math.floor((totalSec % 3600) / 60),
                seconds: totalSec % 60,
            });
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [getEndTime]);

    // Scroll container ref
    const scrollRef = useRef<HTMLDivElement>(null);

    // Crear flash deals con useMemo para evitar valores random inestables
    const flashDeals: FlashDeal[] = useMemo(() => {
        return products.slice(0, 6).map((product, idx) => {
            const discounts = [30, 40, 50, 35, 45, 40];
            const discountPercent = discounts[idx % discounts.length] ?? 30;
            const originalPrice = Math.round(product.price / (1 - discountPercent / 100));

            return {
                product,
                originalPrice,
                discountPercent,
                soldPercent: Math.floor(Math.random() * 30 + 50),
                itemsLeft: Math.floor(Math.random() * 5 + 3)
            };
        });
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 350;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (flashDeals.length === 0) return null;

    return (
        <section className="relative py-8">
            {/* Header con timer interactivo animado */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 uppercase italic tracking-tighter">
                            Ofertas Relámpago
                        </h2>
                        <p className="text-sm text-theme-secondary font-medium tracking-wide">
                            Descuentos exclusivos por tiempo limitado
                        </p>
                    </div>
                </div>

                {/* Glassmorphism Countdown Timer */}
                <div className="flex items-center gap-3 px-6 py-3 bg-red-950/20 backdrop-blur-xl border border-red-500/30 rounded-2xl shadow-xl">
                    <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                    <div className="flex gap-2 text-white font-mono font-bold text-lg">
                        <div className="flex flex-col items-center min-w-[3ch]">
                            <span className="text-red-400 drop-shadow-md">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-white/50 uppercase mt-0.5">Hs</span>
                        </div>
                        <span className="py-1 text-red-500/50">:</span>
                        <div className="flex flex-col items-center min-w-[3ch]">
                            <span className="text-red-400 drop-shadow-md">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-white/50 uppercase mt-0.5">Min</span>
                        </div>
                        <span className="py-1 text-red-500/50">:</span>
                        <div className="flex flex-col items-center min-w-[3ch]">
                            <motion.span 
                                key={timeLeft.seconds}
                                initial={{ opacity: 0, scale: 1.2 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                            >
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </motion.span>
                            <span className="text-[10px] text-red-400/80 uppercase mt-0.5">Seg</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Scroll Container */}
            <div className="relative group/scroll">
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/3 z-20 w-12 h-12 bg-theme-primary/80 backdrop-blur-lg border border-theme/20 hover:border-red-500/50 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover/scroll:opacity-100 transition-all hover:scale-110"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-6 h-6 text-theme-primary" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/3 z-20 w-12 h-12 bg-theme-primary/80 backdrop-blur-lg border border-theme/20 hover:border-red-500/50 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover/scroll:opacity-100 transition-all hover:scale-110"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-6 h-6 text-theme-primary" />
                </button>

                {/* Products Scroll */}
                <motion.div
                    ref={scrollRef}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-5%' }}
                    className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-full pb-8 pt-2"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {flashDeals.map(({ product, originalPrice, discountPercent, soldPercent, itemsLeft }) => (
                        <motion.div 
                            key={product.id}
                            variants={itemVariants}
                              className="flex-shrink-0 w-[240px] md:w-[280px] min-w-[240px] md:min-w-[280px] max-w-[240px] md:max-w-[280px] snap-start group/card relative"
                            whileHover={{ scale: 1.02, y: -5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <Link to={`/${product.section}/${product.slug}`} className="block h-full">
                                <div className="h-full bg-theme-secondary/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(239,68,68,0.2)] hover:border-red-500/30 transition-all duration-500 flex flex-col">
                                    
                                    {/* Flash Badge */}
                                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-black tracking-wider rounded-xl flex items-center gap-1 shadow-lg border border-red-400/30 backdrop-blur-md">
                                        <Zap className="w-3.5 h-3.5 fill-current" />
                                        -{discountPercent}%
                                    </div>

                                    {/* Image Container */}
                                    <div className="w-full h-[220px] shrink-0 bg-theme-tertiary/20 relative overflow-hidden p-6 flex items-center justify-center">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-contain group-hover/card:scale-110 drop-shadow-xl transition-transform duration-700 ease-out"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <Package className="w-16 h-16 text-theme-secondary/50" />
                                        )}
                                    </div>

                                    {/* Content (Glassmorphism bottom) */}
                                    <div className="p-5 flex-1 flex flex-col bg-gradient-to-t from-theme-primary/90 to-transparent">
                                        <h3 className="font-bold text-theme-primary mb-1 line-clamp-2 text-base group-hover/card:text-red-400 transition-colors">
                                            {product.name}
                                        </h3>

                                        <div className="flex items-baseline gap-2 mb-4 mt-auto">
                                            <span className="text-2xl font-black text-theme-primary">
                                                ${product.price}
                                            </span>
                                            <span className="text-sm text-theme-secondary line-through opacity-50">
                                                ${originalPrice}
                                            </span>
                                        </div>

                                        {/* Progress Bar (Glassmorphism Stock) */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span className="text-orange-400 flex items-center gap-1">
                                                    <Flame className="w-4 h-4" /> <span className="text-theme-primary">Quedan {itemsLeft}</span>
                                                </span>
                                            </div>
                                            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5 relative">
                                                <div
                                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                                                    style={{ width: `${soldPercent}%` }}
                                                />
                                                {/* Shimmer effect inside progress bar */}
                                                <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
