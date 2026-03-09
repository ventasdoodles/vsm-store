/**
 * SocialProof — Módulo premium de testimonios dinámicos.
 *
 * @module SocialProof
 * @data Dinámico: Supabase testimonials table via useTestimonials hook.
 * @context Aware: muestra reseñas relevantes según sección/categoría/producto.
 * @fallback Data estática si Supabase no retorna datos.
 * @admin Editable desde /admin/testimonials
 */
import { useTestimonials, useTestimonialsStats } from '@/hooks/useTestimonials';
import type { Section } from '@/types/constants';

// Importar componentes atómicos refactorizados
import { SocialHero } from './social/SocialHero';
import { TrustSection } from './social/TrustSection';
import { TestimonialCarousel } from './social/TestimonialCarousel';
import { CompactSocialProof } from './social/CompactSocialProof';
import { SocialSkeleton } from './social/SocialSkeleton';

// --- Props ---

interface SocialProofProps {
    section?: Section | null;
    categoryId?: string | null;
    productId?: string | null;
    limit?: number;
    variant?: 'default' | 'compact' | 'hero';
}

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

    const items = testimonials || [];
    const avgRating = stats?.avgRating ?? 5.0;
    const totalCount = stats?.count ?? 0;

    // Zero Fakes Policy: Si no hay testimonios reales, ocultar la sección elegantemente
    if (!isLoading && items.length === 0) {
        return null;
    }

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
                <SocialHero avgRating={avgRating} totalCount={totalCount} />
                <TrustSection avgRating={avgRating} totalCount={totalCount} />

                {isLoading ? (
                    <SocialSkeleton />
                ) : (
                    <TestimonialCarousel items={items} />
                )}
            </div>
        </section>
    );
}

