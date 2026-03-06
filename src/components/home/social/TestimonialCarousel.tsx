/**
 * TestimonialCarousel — Carrusel interactivo para navegar entre testimonios.
 * 
 * @component
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestimonialCard } from './TestimonialCard';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialCarouselProps {
    items: Testimonial[];
}

export function TestimonialCarousel({ items }: TestimonialCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

        const cardWidth = el.firstElementChild
            ? (el.firstElementChild as HTMLElement).offsetWidth + 16
            : 300;
        const idx = Math.round(el.scrollLeft / cardWidth);
        setActiveIndex(idx);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', checkScroll, { passive: true });
        checkScroll();
        return () => el.removeEventListener('scroll', checkScroll);
    }, [checkScroll]);

    const scroll = useCallback((direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = el.firstElementChild
            ? (el.firstElementChild as HTMLElement).offsetWidth + 16
            : 300;
        const amount = direction === 'left' ? -cardWidth : cardWidth;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    }, []);

    const totalDots = useMemo(() => Math.min(items.length, 8), [items.length]);

    return (
        <div className="relative group">
            {/* Scroll Navigation Buttons */}
            <AnimatePresence>
                {canScrollLeft && (
                    <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onClick={() => scroll('left')}
                        className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-theme-secondary/90 hover:bg-theme-tertiary backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-xl shadow-black/20 transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5 text-theme-primary" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {canScrollRight && (
                    <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onClick={() => scroll('right')}
                        className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-theme-secondary/90 hover:bg-theme-tertiary backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-xl shadow-black/20 transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5 text-theme-primary" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Edge Fade Gradients */}
            {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-theme-primary to-transparent z-[1] pointer-events-none" />
            )}
            {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-theme-primary to-transparent z-[1] pointer-events-none" />
            )}

            {/* Scrollable Cards */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-1 px-1"
            >
                {items.map((testimonial, index) => (
                    <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        index={index}
                    />
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-6">
                {Array.from({ length: totalDots }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            const el = scrollRef.current;
                            if (!el) return;
                            const cardWidth = el.firstElementChild
                                ? (el.firstElementChild as HTMLElement).offsetWidth + 16
                                : 300;
                            el.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                        }}
                        className={cn(
                            'rounded-full transition-all duration-300',
                            activeIndex === i
                                ? 'w-6 h-2 bg-accent-primary shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : 'w-2 h-2 bg-white/20 hover:bg-white/40',
                        )}
                        aria-label={`Ir a reseña ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
