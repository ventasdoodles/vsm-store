import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Zap, Clock, Package, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFlashDeals } from '@/hooks/useFlashDeals';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useHaptic } from '@/hooks/useHaptic';

interface FlashDeal {
    product: Product;
    originalPrice: number;
    discountPercent: number;
    soldPercent: number;
    itemsLeft: number;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export const FlashDeals = () => {
    const { data: flashDealsData = [], isLoading } = useFlashDeals();
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const { trigger: haptic } = useHaptic();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (flashDealsData.length === 0) return;
        const tick = () => {
            const earliestEnd = Math.min(...flashDealsData.map(d => new Date(d.end_date).getTime()));
            const diff = Math.max(0, earliestEnd - Date.now());
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
    }, [flashDealsData]);

    const flashDeals = useMemo(() => {
        return flashDealsData.map((deal) => {
            const product = deal.product;
            if (!product) return null;
            const originalPrice = product.compare_at_price || Math.round(deal.discount_price / 0.8);
            const discountPercent = Math.round(((originalPrice - deal.discount_price) / originalPrice) * 100);
            const soldPercent = Math.min(100, Math.round((deal.sold_count / deal.limit_count) * 100));
            const itemsLeft = Math.max(0, deal.limit_count - deal.sold_count);
            return {
                product: { ...product, price: deal.discount_price },
                originalPrice,
                discountPercent,
                soldPercent,
                itemsLeft
            };
        }).filter(Boolean) as FlashDeal[];
    }, [flashDealsData]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            haptic('light');
        }
    };

    if (isLoading || flashDeals.length === 0) return null;

    return (
        <section className="relative py-20 px-4 md:px-0">
            {/* Header with Luxury Timer */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col lg:flex-row items-end justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20">
                        <Zap className="w-4 h-4 text-red-500 fill-current" />
                        <span className="text-red-500 font-black text-xs uppercase tracking-[0.2em]">Live Now</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none uppercase italic">
                        Ofertas <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Relámpago</span>
                    </h2>
                </motion.div>

                {timeLeft && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Clock className="w-8 h-8 text-red-500 animate-pulse hidden sm:block" />

                        <div className="flex gap-6">
                            {[
                                { val: timeLeft.hours, label: 'Hrs' },
                                { val: timeLeft.minutes, label: 'Min' },
                                { val: timeLeft.seconds, label: 'Sec', active: true }
                            ].map((t, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="flex gap-1">
                                        {String(t.val).padStart(2, '0').split('').map((digit, idx) => (
                                            <motion.div
                                                key={`${idx}-${digit}`}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className={cn(
                                                    "w-10 h-14 rounded-xl flex items-center justify-center text-3xl font-black border border-white/10 shadow-inner",
                                                    t.active ? "bg-red-500 text-white border-red-400" : "bg-white/5 text-white/80"
                                                )}
                                            >
                                                {digit}
                                            </motion.div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-white/30">{t.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Carousel Container */}
            <div className="relative group/carousel max-w-7xl mx-auto">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
                    <motion.button
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => scroll('left')}
                        className="w-16 h-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </motion.button>
                </div>

                <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:block">
                    <motion.button
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => scroll('right')}
                        className="w-16 h-16 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </motion.button>
                </div>

                <motion.div
                    ref={scrollRef}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="flex gap-8 overflow-x-auto scrollbar-hide pb-12 pt-4 px-4 -mx-4 scroll-smooth"
                >
                    {flashDeals.map(({ product, originalPrice, discountPercent, soldPercent, itemsLeft }) => (
                        <motion.div
                            key={product.id}
                            variants={itemVariants}
                            className="flex-shrink-0 w-[300px] md:w-[340px] group/card relative"
                        >
                            <Link to={`/${product.section}/${product.slug}`} className="block h-full cursor-none lg:cursor-default">
                                <div className="relative h-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(239,68,68,0.3)] flex flex-col group/inner spotlight-container">
                                    {/* Spotlight logic - managed by global class if available, else local CSS is enough */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(239,68,68,0.15)_0%,transparent_50%)] opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />

                                    {/* Image Section */}
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <div className="absolute top-6 left-6 z-20 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl flex items-center gap-2">
                                            <Flame className="w-3.5 h-3.5 fill-current" />
                                            -{discountPercent}% OFF
                                        </div>

                                        <OptimizedImage
                                            src={product.images?.[0] || ''}
                                            alt={product.name}
                                            width={400}
                                            containerClassName="w-full h-full"
                                            className="object-cover transition-transform duration-1000 group-hover/card:scale-110"
                                            fallbackIcon={<Package className="w-16 h-16 text-white/10" />}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 flex flex-col flex-1 relative">
                                        <h3 className="text-xl font-black text-white mb-2 line-clamp-1 group-hover/card:text-red-400 transition-colors tracking-tight">
                                            {product.name}
                                        </h3>

                                        <div className="flex items-baseline gap-3 mb-8">
                                            <span className="text-4xl font-black text-white tracking-tighter">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="text-lg text-white/30 line-through font-bold">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        </div>

                                        {/* Stock Progress with Breathing Animation */}
                                        <div className="space-y-3 mt-auto">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                                                <span className="text-white/40">Inventario</span>
                                                <span className={cn(
                                                    "transition-colors",
                                                    soldPercent > 80 ? "text-red-500 animate-pulse" : "text-orange-400"
                                                )}>
                                                    Quedan {itemsLeft}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${soldPercent}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className={cn(
                                                        "h-full rounded-full relative",
                                                        soldPercent > 80 ? "bg-gradient-to-r from-orange-500 to-red-600" : "bg-gradient-to-r from-vape-500 to-herbal-500"
                                                    )}
                                                >
                                                    <div className="absolute inset-0 bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                                </motion.div>
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
