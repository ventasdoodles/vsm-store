import type { Section } from '@/types/constants';
import { getVape420SectionPresentationConfig } from './sectionPresentation';

export interface ProductSurfaceProductizationConfig {
    slug: Section;
    isVape: boolean;
    priceAccentTextClassName: string;
    badgeSurfaceClassName: string;
    productChipClassName: string;
    productTitleHoverClassName: string;
    categoryHoverShadowClassName: string;
    categoryIconContainerClassName: string;
    categoryIconGlowClassName: string;
    categoryDotClassName: string;
    quickViewSelectedVariantClassName: string;
    quickViewSelectedThumbnailClassName: string;
}

const getThemeClasses = (themeToken: string) => {
    if (themeToken === 'vape') {
        return {
            priceAccent: 'text-vape-400',
            badgeSurface: 'bg-vape-500/15 text-vape-400 border-vape-500/30',
            productChip: 'bg-vape-500/10 text-vape-400 border-vape-500/20',
            productTitleHover: 'group-hover:text-vape-400',
            categoryHoverShadow: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] glow-vape-hover',
            categoryIconContainer: 'bg-vape-500/10 text-vape-400 group-hover:bg-vape-500/20 group-hover:scale-110',
            categoryIconGlow: 'bg-vape-500',
            categoryDot: 'bg-vape-500/20 group-hover:bg-vape-400',
            quickViewSelectedVariant: 'border-vape-500 bg-vape-500/10 text-vape-400',
            quickViewSelectedThumbnail: 'border-vape-500 ring-4 ring-vape-500/20 shadow-lg shadow-vape-500/20',
        };
    } else if (themeToken === 'herbal' || themeToken === '420') {
        return {
            priceAccent: 'text-herbal-400',
            badgeSurface: 'bg-herbal-500/15 text-herbal-400 border-herbal-500/30',
            productChip: 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
            productTitleHover: 'group-hover:text-herbal-400',
            categoryHoverShadow: 'hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] glow-herbal-hover',
            categoryIconContainer: 'bg-herbal-500/10 text-herbal-400 group-hover:bg-herbal-500/20 group-hover:scale-110',
            categoryIconGlow: 'bg-herbal-500',
            categoryDot: 'bg-herbal-500/20 group-hover:bg-herbal-400',
            quickViewSelectedVariant: 'border-herbal-500 bg-herbal-500/10 text-herbal-400',
            quickViewSelectedThumbnail: 'border-herbal-500 ring-4 ring-herbal-500/20 shadow-lg shadow-herbal-500/20',
        };
    } else {
        return {
            priceAccent: 'text-indigo-400',
            badgeSurface: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
            productChip: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            productTitleHover: 'group-hover:text-indigo-400',
            categoryHoverShadow: 'hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] glow-indigo-hover',
            categoryIconContainer: 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110',
            categoryIconGlow: 'bg-indigo-500',
            categoryDot: 'bg-indigo-500/20 group-hover:bg-indigo-400',
            quickViewSelectedVariant: 'border-indigo-500 bg-indigo-500/10 text-indigo-400',
            quickViewSelectedThumbnail: 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/20',
        };
    }
};

export const getVape420ProductSurfacePresentationConfig = (
    slug: Section,
): ProductSurfaceProductizationConfig => {
    const section = getVape420SectionPresentationConfig(slug);
    const theme = getThemeClasses(section.themeToken);

    return {
        slug: section.slug,
        isVape: section.isVape,
        priceAccentTextClassName: theme.priceAccent,
        badgeSurfaceClassName: theme.badgeSurface,
        productChipClassName: theme.productChip,
        productTitleHoverClassName: theme.productTitleHover,
        categoryHoverShadowClassName: theme.categoryHoverShadow,
        categoryIconContainerClassName: theme.categoryIconContainer,
        categoryIconGlowClassName: theme.categoryIconGlow,
        categoryDotClassName: theme.categoryDot,
        quickViewSelectedVariantClassName: theme.quickViewSelectedVariant,
        quickViewSelectedThumbnailClassName: theme.quickViewSelectedThumbnail,
    };
};
