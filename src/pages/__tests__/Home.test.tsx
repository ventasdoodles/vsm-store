import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { TestRouter } from '@/lib/test-router';
import { describe, expect, it, vi } from 'vitest';
import { Home } from '../Home';
import { getStoreMetaCopy } from '@/constants/storeMeta';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

const STORE_META_COPY = getStoreMetaCopy(getStorefrontSettingsFallback().vertical_pack_config!);


vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({ profile: null }),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({ title, description }: { title: string; description: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    ),
}));

vi.mock('@/components/seo/OrganizationJsonLd', () => ({
    OrganizationJsonLd: () => null,
}));

vi.mock('@/components/ui/SectionErrorBoundary', () => ({
    SectionErrorBoundary: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/components/ui/DeferredSection', () => ({
    DeferredSection: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/components/home/MegaHero', () => ({
    MegaHero: () => <div>mega-hero</div>,
}));

vi.mock('@/components/home/ai/SmartBanner', () => ({
    SmartBanner: () => <div>smart-banner</div>,
}));

vi.mock('@/components/home/CategoryShowcase', () => ({
    CategoryShowcase: () => <div>category-showcase</div>,
}));

vi.mock('@/components/home/BrandsCarousel', () => ({
    BrandsCarousel: () => <div>brands-carousel</div>,
}));

vi.mock('@/components/home/WheelInvitation', () => ({
    WheelInvitation: () => <div>wheel-invitation</div>,
}));

vi.mock('@/components/home/FlashDeals', () => ({
    FlashDeals: () => <div>flash-deals</div>,
}));

vi.mock('@/components/home/ProductRail', () => ({
    ProductRail: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/home/PromoSection', () => ({
    PromoSection: () => <div>promo-section</div>,
}));

vi.mock('@/components/home/TrustBadges', () => ({
    TrustBadges: () => <div>trust-badges</div>,
}));

vi.mock('@/components/home/SocialProof', () => ({
    SocialProof: () => <div>social-proof</div>,
}));

describe('Home store metadata', () => {
    it('uses the shared storefront metadata in the visible Home shell', () => {
        render(
            <TestRouter>
                <Home />
            </TestRouter>,
        );

        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', 'Inicio');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-description', STORE_META_COPY.home.seoDescription);
        expect(screen.getByText(STORE_META_COPY.home.hiddenHeading)).toBeInTheDocument();
    });
});
