/**
 * SocialProof — Módulo premium de testimonios dinámicos.
 *
 * @module SocialProof
 * @data Dinámico: Supabase testimonials table via useTestimonials hook.
 * @context Aware: muestra reseñas relevantes según sección/categoría/producto.
 * @fallback Data estática si Supabase no retorna datos.
 * @admin Editable desde /admin/testimonials
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Quote,
    Sparkles,
    TrendingUp,
    Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTestimonials, useTestimonialsStats } from '@/hooks/useTestimonials';
import type { Testimonial } from '@/types/testimonial';
import type { Section } from '@/types/constants';

// --- Props ---

interface SocialProofProps {
    section?: Section | null;
    categoryId?: string | null;
    productId?: string | null;
    limit?: number;
    variant?: 'default' | 'compact' | 'hero';
}

// --- Fallback estático ---

const FALLBACK_TESTIMONIALS: Testimonial[] = [
    {
        id: 'fb-1',
        customer_name: 'María G.',
        customer_location: 'Xalapa, Ver.',
        avatar_url: null,
        rating: 5,
        title: null,
        body: 'Excelente servicio, llegó en 2 días. Los líquidos son auténticos y el sabor increíble. 100% recomendado!',
        section: 'vape',
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: true,
        is_active: true,
        sort_order: 0,
        review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'fb-2',
        customer_name: 'Carlos R.',
        customer_location: 'Veracruz, Ver.',
        avatar_url: null,
        rating: 5,
        title: null,
        body: 'La mejor tienda de vapes en la zona. Precios justos y atención personalizada por WhatsApp.',
        section: 'vape',
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: false,
        is_active: true,
        sort_order: 1,
        review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'fb-3',
        customer_name: 'Ana L.',
        customer_location: 'Coatepec, Ver.',
        avatar_url: null,
        rating: 5,
        title: null,
        body: 'Pedí un pod y llegó súper rápido. El empaque perfecto y el producto original. Volveré a comprar!',
        section: null,
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: true,
        is_active: true,
        sort_order: 2,
        review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'fb-4',
        customer_name: 'Luis M.',
        customer_location: 'Xalapa, Ver.',
        avatar_url: null,
        rating: 4,
        title: null,
        body: 'Muy buena variedad de productos. Solo me gustaría que tuvieran más opciones de pago.',
        section: null,
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: false,
        is_active: true,
        sort_order: 3,
        review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'fb-5',
        customer_name: 'Sofía P.',
        customer_location: 'Banderilla, Ver.',
        avatar_url: null,
        rating: 5,
        title: null,
        body: 'Primera vez comprando en línea y todo perfecto. Me ayudaron por WhatsApp con todas mis dudas.',
        section: '420',
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: false,
        is_active: true,
        sort_order: 4,
        review_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
];

// --- Componente Principal ---

export function SocialProof({
    section,
    categoryId,
    productId,
    limit = 12,
    variant = 'default',
}: SocialProofProps) {
    const { data: testimonials, isLoading } = useTestimonials({
        section,
        categoryId,
        productId,
        limit,
    });
    const { data: stats } = useTestimonialsStats();

    const items = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
    const avgRating = stats?.avgRating ?? 4.9;
    const totalCount = stats?.count ?? items.length;

    if (variant === 'compact') {
        return <CompactSocialProof items={items} avgRating={avgRating} totalCount={totalCount} />;
    }

    return (
        <section className="relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative space-y-8">
                {/* Header Premium */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            Clientes Verificados
                        </div>

                        <h2 className="text-2xl md:text-4xl font-bold text-theme-primary">
                            Lo Que Dicen Nuestros Clientes
                        </h2>
                    </motion.div>

                    {/* Rating Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-theme-secondary/60 backdrop-blur-md border border-white/10 shadow-lg shadow-black/10"
                    >
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'w-5 h-5',
                                        i < Math.round(avgRating)
                                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]'
                                            : 'text-zinc-600',
                                    )}
                                />
                            ))}
                        </div>
                        <div className="h-5 w-px bg-white/10" />
                        <span className="text-lg font-bold text-theme-primary tabular-nums">
                            {avgRating}
                        </span>
                        <span className="text-sm text-theme-secondary">
                            de {totalCount} resenas
                        </span>
                    </motion.div>

                    {/* Trust Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                        className="flex items-center justify-center gap-6 text-xs text-theme-secondary"
                    >
                        <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Compras verificadas
                        </span>
                        <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                            98% satisfacción
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-accent-primary" />
                            +500 clientes
                        </span>
                    </motion.div>
                </div>

                {/* Carousel */}
                {isLoading ? <SkeletonCards /> : <TestimonialCarousel items={items} />}
            </div>
        </section>
    );
}

// --- Carousel Component ---

function TestimonialCarousel({ items }: { items: Testimonial[] }) {
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

// --- Testimonial Card ---

function TestimonialCard({
    testimonial,
    index,
}: {
    testimonial: Testimonial;
    index: number;
}) {
    const initials = testimonial.customer_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const avatarColors = [
        'from-violet-500 to-purple-600 shadow-violet-500/30',
        'from-blue-500 to-cyan-600 shadow-blue-500/30',
        'from-emerald-500 to-teal-600 shadow-emerald-500/30',
        'from-amber-500 to-orange-600 shadow-amber-500/30',
        'from-rose-500 to-pink-600 shadow-rose-500/30',
    ];
    const avatarColor = avatarColors[index % avatarColors.length];

    const timeAgo = getTimeAgo(testimonial.review_date);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4) }}
            className={cn(
                'flex-shrink-0 w-[85vw] sm:w-[340px] md:w-[360px] snap-start',
                'relative p-6 rounded-2xl',
                'bg-theme-secondary/40 backdrop-blur-md',
                'border border-white/[0.08]',
                'hover:border-white/[0.15] hover:bg-theme-secondary/60',
                'transition-all duration-300',
                'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
                'hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)]',
                testimonial.is_featured && 'ring-1 ring-accent-primary/30 shadow-[0_0_24px_rgba(168,85,247,0.08)]',
            )}
        >
            {/* Featured Indicator */}
            {testimonial.is_featured && (
                <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
            )}

            {/* Quote Icon Background */}
            <Quote className="absolute top-4 right-4 w-8 h-8 text-white/[0.03]" />

            {/* Header: Avatar + Info */}
            <div className="flex items-center gap-3 mb-4">
                {testimonial.avatar_url ? (
                    <img
                        src={testimonial.avatar_url}
                        alt={testimonial.customer_name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10"
                    />
                ) : (
                    <div
                        className={cn(
                            'w-11 h-11 rounded-full bg-gradient-to-br flex items-center justify-center',
                            'text-white text-sm font-bold shadow-lg',
                            avatarColor,
                        )}
                    >
                        {initials}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-theme-primary text-sm truncate">
                        {testimonial.customer_name}
                    </p>
                    {testimonial.customer_location && (
                        <p className="text-xs text-theme-secondary truncate">
                            {testimonial.customer_location}
                        </p>
                    )}
                </div>

                {testimonial.verified_purchase && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                            Verificada
                        </span>
                    </div>
                )}
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'w-3.5 h-3.5',
                                i < testimonial.rating
                                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.3)]'
                                    : 'text-zinc-700',
                            )}
                        />
                    ))}
                </div>
                <span className="text-xs text-theme-secondary">{timeAgo}</span>
            </div>

            {/* Title */}
            {testimonial.title && (
                <h3 className="text-sm font-semibold text-theme-primary mb-2">
                    {testimonial.title}
                </h3>
            )}

            {/* Body */}
            <p className="text-sm text-theme-secondary leading-relaxed line-clamp-4">
                {'\u201C'}{testimonial.body}{'\u201D'}
            </p>

            {/* Section Tag */}
            {testimonial.section && (
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider',
                            testimonial.section === 'vape'
                                ? 'bg-vape-500/10 text-vape-400 border border-vape-500/20'
                                : 'bg-herbal-500/10 text-herbal-400 border border-herbal-500/20',
                        )}
                    >
                        {testimonial.section === 'vape' ? 'Vape' : '420'}
                    </span>
                </div>
            )}
        </motion.article>
    );
}

// --- Compact Variant ---

function CompactSocialProof({
    items,
    avgRating,
    totalCount,
}: {
    items: Testimonial[];
    avgRating: number;
    totalCount: number;
}) {
    const top = items.slice(0, 3);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'w-4 h-4',
                                i < Math.round(avgRating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-700',
                            )}
                        />
                    ))}
                </div>
                <span className="text-sm font-semibold text-theme-primary">{avgRating}</span>
                <span className="text-xs text-theme-secondary">({totalCount} reseñas)</span>
            </div>

            <div className="space-y-3">
                {top.map((t) => (
                    <div
                        key={t.id}
                        className="flex items-start gap-3 p-3 rounded-xl bg-theme-secondary/30 border border-white/[0.06]"
                    >
                        <div className="flex gap-0.5 mt-0.5 flex-shrink-0">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'w-3 h-3',
                                        i < t.rating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-zinc-700',
                                    )}
                                />
                            ))}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-theme-secondary line-clamp-2">
                                {'\u201C'}{t.body}{'\u201D'}
                            </p>
                            <p className="text-[10px] text-theme-secondary mt-1 font-medium">
                                {'\u2014'} {t.customer_name}
                                {t.verified_purchase && (
                                    <ShieldCheck className="inline w-3 h-3 ml-1 text-emerald-400" />
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Skeleton Loading ---

function SkeletonCards() {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className="flex-shrink-0 w-[85vw] sm:w-[340px] md:w-[360px] p-6 rounded-2xl bg-theme-secondary/30 animate-pulse"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-full bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <div className="h-3 w-24 bg-white/10 rounded" />
                            <div className="h-2 w-16 bg-white/10 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-1 mb-3">
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className="w-3.5 h-3.5 rounded bg-white/10" />
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-white/10 rounded" />
                        <div className="h-3 w-4/5 bg-white/10 rounded" />
                        <div className="h-3 w-3/5 bg-white/10 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// --- Helpers ---

function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 14) return 'Hace 1 semana';
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 60) return 'Hace 1 mes';
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}
