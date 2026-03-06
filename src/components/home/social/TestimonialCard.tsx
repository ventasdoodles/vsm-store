/**
 * TestimonialCard — Tarjeta individual de testimonio con avatar e indicadores de confianza.
 * 
 * @component
 */
import { motion } from 'framer-motion';
import { Star, ShieldCheck, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types/testimonial';

interface TestimonialCardProps {
    testimonial: Testimonial;
    index: number;
}

export function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
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
            {testimonial.is_featured && (
                <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent" />
            )}

            <Quote className="absolute top-4 right-4 w-8 h-8 text-white/[0.03]" />

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

            {testimonial.title && (
                <h3 className="text-sm font-semibold text-theme-primary mb-2">
                    {testimonial.title}
                </h3>
            )}

            <p className="text-sm text-theme-secondary leading-relaxed line-clamp-4">
                {'\u201C'}{testimonial.body}{'\u201D'}
            </p>

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
