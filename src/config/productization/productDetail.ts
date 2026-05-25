import type { Section } from '@/types/constants';
import { getVape420SectionPresentationConfig } from './sectionPresentation';
import { getVape420ProductSurfacePresentationConfig } from './productSurface';

export interface ProductDetailProductizationConfig {
    slug: Section;
    isVape: boolean;
    breadcrumbLinkHoverClassName: string;
    actionSelectedVariantClassName: string;
    actionPrimaryButtonClassName: string;
    stickyPriceAccentTextClassName: string;
    stickyActionButtonGradientClassName: string;
    frequentlyBoughtTogetherAccentClassName: string;
    productInfoTagHoverClassName: string;
    quickViewSelectedVariantClassName: string;
    quickViewSelectedThumbnailClassName: string;
}

export const getVape420ProductDetailPresentationConfig = (
    slug: Section,
): ProductDetailProductizationConfig => {
    const section = getVape420SectionPresentationConfig(slug);
    const productSurface = getVape420ProductSurfacePresentationConfig(slug);

    return {
        slug: section.slug,
        isVape: section.isVape,
        breadcrumbLinkHoverClassName: section.isVape ? 'hover:text-vape-400' : 'hover:text-herbal-400',
        actionSelectedVariantClassName: productSurface.quickViewSelectedVariantClassName,
        actionPrimaryButtonClassName: section.isVape
            ? 'bg-gradient-to-r from-vape-600 to-vape-500 text-white shadow-xl shadow-vape-500/30 ring-1 ring-vape-400/50'
            : 'bg-gradient-to-r from-herbal-600 to-herbal-500 text-white shadow-xl shadow-herbal-500/30 ring-1 ring-herbal-400/50',
        stickyPriceAccentTextClassName: productSurface.priceAccentTextClassName,
        stickyActionButtonGradientClassName: section.isVape
            ? 'from-vape-500 to-vape-600 shadow-vape-500/20'
            : 'from-herbal-500 to-herbal-600 shadow-herbal-500/20',
        frequentlyBoughtTogetherAccentClassName: section.isVape ? 'bg-vape-500' : 'bg-herbal-500',
        productInfoTagHoverClassName: section.isVape
            ? 'hover:text-vape-400 hover:border-vape-400/50'
            : 'hover:text-herbal-400 hover:border-herbal-400/50',
        quickViewSelectedVariantClassName: productSurface.quickViewSelectedVariantClassName,
        quickViewSelectedThumbnailClassName: productSurface.quickViewSelectedThumbnailClassName,
    };
};
