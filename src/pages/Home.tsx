/**
 * // ─── PÁGINA: HOME ───
 * // Propósito: Fachada principal de la tienda. Orquestación de secciones de alto impacto.
 * // Arquitectura: Composición modular con aislamiento de errores (§1.1).
 * // Rendimiento: Carga perezosa de secciones pesadas y priorización del Above-The-Fold (§2.2).
 */
import { lazy, Suspense, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { MegaHero } from '@/components/home/MegaHero';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import { DeferredSection } from '@/components/ui/DeferredSection';
import { SEO } from '@/components/seo/SEO';
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd';
import { useAuth } from '@/hooks/useAuth';
import { useAuth } from '@/hooks/useAuth';
import { getStoreMetaCopy } from '@/constants/storeMeta';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';

// Lazy-load heavier components and below-the-fold sections
const SocialProof = lazy(() => import('@/components/home/SocialProof').then(m => ({ default: m.SocialProof })));
const ProductRail = lazy(() => import('@/components/home/ProductRail').then(m => ({ default: m.ProductRail })));
const PromoSection = lazy(() => import('@/components/home/PromoSection').then(m => ({ default: m.PromoSection })));
const CategoryShowcase = lazy(() => import('@/components/home/CategoryShowcase').then(m => ({ default: m.CategoryShowcase })));
const FlashDeals = lazy(() => import('@/components/home/FlashDeals').then(m => ({ default: m.FlashDeals })));
const BrandsCarousel = lazy(() => import('@/components/home/BrandsCarousel').then(m => ({ default: m.BrandsCarousel })));
const TrustBadges = lazy(() => import('@/components/home/TrustBadges').then(m => ({ default: m.TrustBadges })));
const WheelInvitation = lazy(() => import('@/components/home/WheelInvitation').then(m => ({ default: m.WheelInvitation })));
const SmartBanner = lazy(() => import('@/components/home/ai/SmartBanner').then(m => ({ default: m.SmartBanner })));

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
    const { config } = useActiveVerticalPack();
    const storeMetaCopy = config ? getStoreMetaCopy(config) : null;

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

    const renderSection = (id: SectionId) => {
        switch (id) {
            case 'smart-banner':
                return (
                    <SectionErrorBoundary key={id} name="SmartBanner">
                        <Suspense fallback={<div className="h-[60px] skeleton-shimmer rounded-xl" />}>
                            <SmartBanner />
                        </Suspense>
                    </SectionErrorBoundary>
                );
            case 'categories':
                return (
                    <SectionErrorBoundary key={id} name="CategoryShowcase">
                        <Suspense fallback={<div className="h-[200px] skeleton-shimmer rounded-2xl" />}>
                            <CategoryShowcase />
                        </Suspense>
                    </SectionErrorBoundary>
                );
            case 'brands':
                return (
                    <DeferredSection key={id} minHeight="160px">
                        <SectionErrorBoundary name="BrandsCarousel">
                            <Suspense fallback={<div className="h-[160px] skeleton-shimmer rounded-2xl" />}>
                                <BrandsCarousel />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'wheel':
                return (
                    <SectionErrorBoundary key={id} name="WheelInvitation">
                        <Suspense fallback={<div className="h-[300px] skeleton-shimmer rounded-2xl" />}>
                            <WheelInvitation />
                        </Suspense>
                    </SectionErrorBoundary>
                );
            case 'flash-deals':
                return (
                    <DeferredSection key={id} minHeight="300px">
                        <SectionErrorBoundary name="FlashDeals">
                            <Suspense fallback={<div className="h-[300px] skeleton-shimmer rounded-2xl" />}>
                                <FlashDeals />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'bestsellers':
                return (
                    <DeferredSection key={id} minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:bestseller">
                            <Suspense fallback={<div className="h-[320px] skeleton-shimmer rounded-2xl" />}>
                                <ProductRail type="bestseller" title="Los Más Vendidos" />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'promo':
                return (
                    <DeferredSection key={id} minHeight="200px">
                        <SectionErrorBoundary name="PromoSection">
                            <Suspense fallback={<div className="h-[200px] skeleton-shimmer rounded-2xl" />}>
                                <PromoSection />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            case 'new-arrivals':
                return (
                    <DeferredSection key={id} minHeight="320px">
                        <SectionErrorBoundary name="ProductRail:new">
                            <Suspense fallback={<div className="h-[320px] skeleton-shimmer rounded-2xl" />}>
                                <ProductRail type="new" title="Nuevos Lanzamientos" />
                            </Suspense>
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
                            <Suspense fallback={<div className="h-[120px] skeleton-shimmer rounded-2xl" />}>
                                <TrustBadges />
                            </Suspense>
                        </SectionErrorBoundary>
                    </DeferredSection>
                );
            default:
                return null;
        }
    };

    if (!config || !storeMetaCopy) return null;

    return (
        <div className="min-h-screen pb-20 pt-0 bg-theme-primary transition-colors duration-300">
            <SEO
                title="Inicio"
                description={storeMetaCopy.home.seoDescription}
            />
            <OrganizationJsonLd />

            <h1 className="sr-only">{storeMetaCopy.home.hiddenHeading}</h1>

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
