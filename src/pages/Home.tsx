/**
 * // ─── PÁGINA: HOME ───
 * // Propósito: Fachada principal de la tienda. Orquestación de secciones de alto impacto.
 * // Arquitectura: Composición modular con aislamiento de errores (§1.1).
 * // Rendimiento: Carga perezosa de secciones pesadas y priorización del Above-The-Fold (§2.2).
 */
import { lazy, Suspense, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { FlashDeals } from '@/components/home/FlashDeals';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import { TrustBadges } from '@/components/home/TrustBadges';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { DeferredSection } from '@/components/ui/DeferredSection';
import { SEO } from '@/components/seo/SEO';
import { WheelInvitation } from '@/components/home/WheelInvitation';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import { SmartBanner } from '@/components/home/ai/SmartBanner';
import { useAuth } from '@/hooks/useAuth';

// Lazy-load heavier components
const SocialProof = lazy(() => import('@/components/home/SocialProof').then(m => ({ default: m.SocialProof })));

type SectionId = 
    | 'smart-banner' 
    | 'categories' 
    | 'brands' 
    | 'wheel' 
    | 'flash-deals' 
    | 'bestsellers' 
    | 'promo' 
    | 'new-arrivals' 
    | 'social-proof' 
    | 'trust-badges';

export function Home() {
    const { profile } = useAuth();

    // 1. Define section priority based on IA Context [Wave 120]
    const sectionOrder = useMemo(() => {
        const defaultOrder: SectionId[] = [
            'smart-banner',
            'categories',
            'brands',
            'wheel',
            'flash-deals',
            'bestsellers',
            'promo',
            'new-arrivals',
            'social-proof',
            'trust-badges'
        ];

        if (!profile) return defaultOrder;

        let activeOrder = [...defaultOrder];
        const segment = profile.segment;
        const interests = profile.ai_preferences?.interests || [];

        // Strategy: Recovery mode (En Riesgo or Casi Perdido)
        if (segment === 'En Riesgo' || segment === 'Casi Perdido') {
            // Move Promos and Flash Deals to the top to capture attention
            activeOrder = activeOrder.filter(s => s !== 'promo' && s !== 'flash-deals');
            activeOrder.splice(1, 0, 'promo', 'flash-deals');
        }

        // Strategy: Newcomer / Exploratory
        if (segment === 'Nuevo') {
            // Keep Categories and Brands high to establish authority
        }

        // Strategy: Targeted Interests
        if (interests.some(i => i.toLowerCase().includes('420') || i.toLowerCase().includes('herbal'))) {
            // If interested in 420, maybe move trust badges or specific sections related to it (rails handle their own filtering based on types)
        }

        return activeOrder;
    }, [profile]);

    // 2. Section Map
    const renderSection = (id: SectionId) => {
        switch (id) {
            case 'smart-banner':
                return (
                    <SectionErrorBoundary key={id} name="SmartBanner">
                        <SmartBanner />
                    </SectionErrorBoundary>
                );
            case 'categories':
                return (
                    <SectionErrorBoundary key={id} name="CategoryShowcase">
                        <CategoryShowcase />
                    </SectionErrorBoundary>
                );
            case 'brands':
                return (
                    <DeferredSection key={id} minHeight="160px">
                        <SectionErrorBoundary name="BrandsCarousel">
                            <BrandsCarousel />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'wheel':
                return (
                    <SectionErrorBoundary key={id} name="WheelInvitation">
                        <WheelInvitation />
                    </SectionErrorBoundary>
                );
            case 'flash-deals':
                return (
                    <DeferredSection key={id} minHeight="300px">
                        <SectionErrorBoundary name="FlashDeals">
                            <FlashDeals />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'bestsellers':
                return (
                    <DeferredSection key={id} minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:bestseller">
                            <ProductRail type="bestseller" title="Los Más Vendidos" />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'promo':
                return (
                    <DeferredSection key={id} minHeight="200px">
                        <SectionErrorBoundary name="PromoSection">
                            <PromoSection />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'new-arrivals':
                return (
                    <DeferredSection key={id} minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:new">
                            <ProductRail type="new" title="Nuevos Lanzamientos" />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'social-proof':
                return (
                    <DeferredSection key={id} minHeight="400px">
                        <SectionErrorBoundary name="SocialProof">
                            <Suspense fallback={<div className="h-[400px] skeleton-shimmer rounded-2xl" />}>
                                <SocialProof limit={6} />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'trust-badges':
                return (
                    <DeferredSection key={id} minHeight="120px">
                        <SectionErrorBoundary name="TrustBadges">
                            <TrustBadges />
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen pb-20 pt-0 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />
            <OrganizationJsonLd />

            <h1 className="sr-only">VSM Store — Tu tienda de vapeo y productos 420 en Xalapa</h1>

            <div className="space-y-12 md:space-y-16">
                <SectionErrorBoundary name="MegaHero">
                    <MegaHero />
                </SectionErrorBoundary>

                <div className="container-vsm space-y-12 md:space-y-16">
                    <Reorder.Group 
                        axis="y" 
                        values={sectionOrder} 
                        onReorder={() => {}} // Read-only reordering based on IA
                        className="space-y-12 md:space-y-16"
                    >
                        {sectionOrder.map((sectionId) => (
                            <Reorder.Item 
                                key={sectionId} 
                                value={sectionId}
                                initial={false}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                drag={false} // Only manual reorder if we allowed it, here it's IA-driven
                            >
                                {renderSection(sectionId)}
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>
        </div>
    );
}
