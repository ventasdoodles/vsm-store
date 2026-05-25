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

export const getVape420ProductSurfacePresentationConfig = (
    slug: Section,
): ProductSurfaceProductizationConfig => {
    const section = getVape420SectionPresentationConfig(slug);
    const isVape = section.isVape;

    return {
        slug: section.slug,
        isVape,
        priceAccentTextClassName: isVape ? 'text-vape-400' : 'text-herbal-400',
        badgeSurfaceClassName: isVape
            ? 'bg-vape-500/15 text-vape-400 border-vape-500/30'
            : 'bg-herbal-500/15 text-herbal-400 border-herbal-500/30',
        productChipClassName: isVape
            ? 'bg-vape-500/10 text-vape-400 border-vape-500/20'
            : 'bg-herbal-500/10 text-herbal-400 border-herbal-500/20',
        productTitleHoverClassName: isVape ? 'group-hover:text-vape-400' : 'group-hover:text-herbal-400',
        categoryHoverShadowClassName: isVape
            ? 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] glow-vape-hover'
            : 'hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] glow-herbal-hover',
        categoryIconContainerClassName: isVape
            ? 'bg-vape-500/10 text-vape-400 group-hover:bg-vape-500/20 group-hover:scale-110'
            : 'bg-herbal-500/10 text-herbal-400 group-hover:bg-herbal-500/20 group-hover:scale-110',
        categoryIconGlowClassName: isVape ? 'bg-vape-500' : 'bg-herbal-500',
        categoryDotClassName: isVape ? 'bg-vape-500/20 group-hover:bg-vape-400' : 'bg-herbal-500/20 group-hover:bg-herbal-400',
        quickViewSelectedVariantClassName: isVape
            ? 'border-vape-500 bg-vape-500/10 text-vape-400'
            : 'border-herbal-500 bg-herbal-500/10 text-herbal-400',
        quickViewSelectedThumbnailClassName: isVape
            ? 'border-vape-500 ring-4 ring-vape-500/20 shadow-lg shadow-vape-500/20'
            : 'border-herbal-500 ring-4 ring-herbal-500/20 shadow-lg shadow-herbal-500/20',
    };
};
