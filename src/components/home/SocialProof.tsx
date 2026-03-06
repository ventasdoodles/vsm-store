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
import type { Testimonial } from '@/types/testimonial';
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
        review_date: '2026-02-15',
        created_at: '2026-02-15T10:00:00Z',
        updated_at: '2026-02-15T10:00:00Z',
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
        review_date: '2026-02-10',
        created_at: '2026-02-10T14:30:00Z',
        updated_at: '2026-02-10T14:30:00Z',
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
        review_date: '2026-02-05',
        created_at: '2026-02-05T09:15:00Z',
        updated_at: '2026-02-05T09:15:00Z',
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

