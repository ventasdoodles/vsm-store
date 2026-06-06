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

const getThemeClasses = (themeToken: string) => {
    if (themeToken === 'vape') {
        return {
            breadcrumbLinkHover: 'hover:text-vape-400',
            actionPrimaryButton: 'bg-gradient-to-r from-vape-600 to-vape-500 text-white shadow-xl shadow-vape-500/30 ring-1 ring-vape-400/50',
            stickyActionButtonGradient: 'from-vape-500 to-vape-600 shadow-vape-500/20',
            frequentlyBoughtTogetherAccent: 'bg-vape-500',
            productInfoTagHover: 'hover:text-vape-400 hover:border-vape-400/50',
        };
    } else if (themeToken === 'herbal' || themeToken === '420') {
        return {
            breadcrumbLinkHover: 'hover:text-herbal-400',
            actionPrimaryButton: 'bg-gradient-to-r from-herbal-600 to-herbal-500 text-white shadow-xl shadow-herbal-500/30 ring-1 ring-herbal-400/50',
            stickyActionButtonGradient: 'from-herbal-500 to-herbal-600 shadow-herbal-500/20',
            frequentlyBoughtTogetherAccent: 'bg-herbal-500',
            productInfoTagHover: 'hover:text-herbal-400 hover:border-herbal-400/50',
        };
    } else {
        return {
            breadcrumbLinkHover: 'hover:text-indigo-400',
            actionPrimaryButton: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/30 ring-1 ring-indigo-400/50',
            stickyActionButtonGradient: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
            frequentlyBoughtTogetherAccent: 'bg-indigo-500',
            productInfoTagHover: 'hover:text-indigo-400 hover:border-indigo-400/50',
        };
    }
};

export const getVape420ProductDetailPresentationConfig = (
    slug: Section,
): ProductDetailProductizationConfig => {
    const section = getVape420SectionPresentationConfig(slug);
    const productSurface = getVape420ProductSurfacePresentationConfig(slug);
    const theme = getThemeClasses(section.themeToken);

    return {
        slug: section.slug,
        isVape: section.isVape,
        breadcrumbLinkHoverClassName: theme.breadcrumbLinkHover,
        actionSelectedVariantClassName: productSurface.quickViewSelectedVariantClassName,
        actionPrimaryButtonClassName: theme.actionPrimaryButton,
        stickyPriceAccentTextClassName: productSurface.priceAccentTextClassName,
        stickyActionButtonGradientClassName: theme.stickyActionButtonGradient,
        frequentlyBoughtTogetherAccentClassName: theme.frequentlyBoughtTogetherAccent,
        productInfoTagHoverClassName: theme.productInfoTagHover,
        quickViewSelectedVariantClassName: productSurface.quickViewSelectedVariantClassName,
        quickViewSelectedThumbnailClassName: productSurface.quickViewSelectedThumbnailClassName,
    };
};
