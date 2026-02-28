/**
 * FlashDeals — Sección de ofertas flash con countdown y carrusel horizontal.
 *
 * @module FlashDeals
 * @independent Componente 100% independiente. Obtiene productos via useProducts().
 * @data Productos obtenidos del API, ofertas simuladas internamente.
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Zap, Clock, Package } from 'lucide-react';
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

export const FlashDeals = () => {
    // Obtener productos para flash deals
    const { data: products = [] } = useProducts({ limit: 8 });
    const { data: settings } = useStoreSettings();

    // ─── Countdown persistente ────────────────────────────
    // Prioridad: store_settings.flash_deals_end > localStorage > 6h desde ahora
    const DURATION_MS = 6 * 60 * 60 * 1000; // 6 horas
    const LS_KEY = 'vsm-flash-deals-end';

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
                // Expiró → generar nueva ventana
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
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (flashDeals.length === 0) return null;

    return (
        <section className="relative py-8">
            <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent pointer-events-none" />

            {/* Header con timer */}
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse-glow">
                        <Zap className="w-6 h-6 text-white drop-shadow" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                            Ofertas Relámpago
                        </h2>
                        <p className="text-sm text-red-300/80 font-medium tracking-wide">
                            Descuentos exclusivos por tiempo limitado
                        </p>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-3 px-6 py-3 bg-red-950/30 backdrop-blur-md border border-red-500/20 rounded-xl shadow-inner">
                    <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                    <div className="flex gap-2 text-white font-mono font-bold text-lg">
                        <div className="flex flex-col items-center">
                            <span className="bg-red-500/10 px-2 py-1 rounded border border-red-500/10 min-w-[3ch] text-center">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-red-400/60 uppercase mt-0.5">Hs</span>
                        </div>
                        <span className="py-1">:</span>
                        <div className="flex flex-col items-center">
                            <span className="bg-red-500/10 px-2 py-1 rounded border border-red-500/10 min-w-[3ch] text-center">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-red-400/60 uppercase mt-0.5">Min</span>
                        </div>
                        <span className="py-1">:</span>
                        <div className="flex flex-col items-center">
                            <span className="bg-red-500/10 px-2 py-1 rounded border border-red-500/10 min-w-[3ch] text-center text-red-400">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] text-red-400/60 uppercase mt-0.5">Seg</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Container */}
            <div className="relative group">
                {/* Navigation Arrows */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-bg-secondary/80 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-bg-secondary/80 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Products Scroll */}
                <div
                    ref={scrollRef}
                    className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-full pb-8 pt-2"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {flashDeals.map(({ product, originalPrice, discountPercent, soldPercent, itemsLeft }) => (
                        <motion.div 
                            key={product.id}
                            className="flex-shrink-0 w-72 snap-start group/card relative"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <Link
                                to={`/${product.section}/${product.slug}`}
                                className="block h-full"
                            >
                                <div className="h-full bg-theme-secondary/30 backdrop-blur-md border border-theme/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col">
                                {/* Flash Badge */}
                                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg border border-red-400/20">
                                    <Zap className="w-3 h-3 fill-current" />
                                    -{discountPercent}% OFF
                                </div>

                                {/* Image */}
                                <div className="aspect-square bg-theme-tertiary/30 relative overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-16 h-16 text-theme-secondary/50" />
                                        </div>
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent opacity-60" />
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Product Name */}
                                    <h3 className="font-medium text-text-primary mb-1 line-clamp-2 text-base group-hover/card:text-red-400 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Prices */}
                                    <div className="flex items-baseline gap-2 mb-4 mt-auto">
                                        <span className="text-2xl font-bold text-white">
                                            ${product.price}
                                        </span>
                                        <span className="text-sm text-text-tertiary line-through decoration-red-500/50">
                                            ${originalPrice}
                                        </span>
                                    </div>

                                    {/* Progress Bar (fake stock indicator) */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-text-secondary flex items-center gap-1">
                                                🔥 <span className="text-orange-400">{itemsLeft} disponibles</span>
                                            </span>
                                            <span className="text-text-tertiary">{soldPercent}% vendido</span>
                                        </div>
                                        <div className="h-2 bg-theme-tertiary/50 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000"
                                                style={{ width: `${soldPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
