import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Zap, Clock, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
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

    // Timer state (countdown de 6 horas)
    const [timeLeft, setTimeLeft] = useState({
        hours: 6,
        minutes: 0,
        seconds: 0,
    });

    // Scroll container ref
    const scrollRef = useRef<HTMLDivElement>(null);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    // Reset cuando llega a 0
                    return { hours: 6, minutes: 0, seconds: 0 };
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
        <section className="relative">
            {/* Header con timer */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-theme-primary">
                            ⚡ Ofertas Flash
                        </h2>
                        <p className="text-sm text-theme-secondary">
                            Descuentos por tiempo limitado
                        </p>
                    </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <Clock className="w-5 h-5 text-red-500" />
                    <div className="flex gap-1 text-red-500 font-mono font-bold">
                        <span className="bg-red-500/20 px-2 py-1 rounded">
                            {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span>:</span>
                        <span className="bg-red-500/20 px-2 py-1 rounded">
                            {String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span>:</span>
                        <span className="bg-red-500/20 px-2 py-1 rounded">
                            {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Scroll Container */}
            <div className="relative group">
                {/* Navigation Arrows */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Anterior"
                >
                    <ChevronLeft className="w-5 h-5 text-theme-primary" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Siguiente"
                >
                    <ChevronRight className="w-5 h-5 text-theme-primary" />
                </button>

                {/* Products Scroll */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {flashDeals.map(({ product, originalPrice, discountPercent, soldPercent, itemsLeft }) => (
                        <Link
                            key={product.id}
                            to={`/${product.section}/${product.slug}`}
                            className="flex-shrink-0 w-64 snap-start group/card"
                        >
                            <div className="relative bg-theme-secondary rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                {/* Flash Badge */}
                                <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full flex items-center gap-1 animate-pulse-glow">
                                    <Zap className="w-4 h-4" />
                                    -{discountPercent}%
                                </div>

                                {/* Image */}
                                <div className="aspect-square bg-theme-tertiary">
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-16 h-16 text-primary-600" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* Product Name */}
                                    <h3 className="font-semibold text-theme-primary mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>

                                    {/* Prices */}
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-2xl font-bold text-red-500">
                                            ${product.price}
                                        </span>
                                        <span className="text-sm text-theme-secondary line-through">
                                            ${originalPrice}
                                        </span>
                                    </div>

                                    {/* Progress Bar (fake stock indicator) */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-theme-secondary">
                                            <span>Vendidos: {soldPercent}%</span>
                                            <span className="text-orange-500 font-semibold">
                                                ¡{itemsLeft} quedan!
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-theme-tertiary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                                style={{ width: `${soldPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
