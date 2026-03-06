/**
 * CompactSocialProof — Versión reducida de testimonios para vistas laterales o compactas.
 * 
 * @component
 */
import { Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types/testimonial';

interface CompactSocialProofProps {
    items: Testimonial[];
    avgRating: number;
    totalCount: number;
}

export function CompactSocialProof({
    items,
    avgRating,
    totalCount,
}: CompactSocialProofProps) {
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
