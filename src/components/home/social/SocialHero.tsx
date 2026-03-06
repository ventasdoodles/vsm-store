/**
 * SocialHero — Cabecera de la sección de prueba social.
 * 
 * @component
 */
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialHeroProps {
    avgRating: number;
    totalCount: number;
}

export function SocialHero({ avgRating, totalCount }: SocialHeroProps) {
    return (
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
                    de {totalCount} reseñas
                </span>
            </motion.div>
        </div>
    );
}
