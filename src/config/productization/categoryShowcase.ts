import { vape420VerticalPackConfig } from './vape420VerticalPack';
import { getStorefrontFallbackImageUrl } from './storefrontFallbacks';

export const getVape420CategoryShowcaseFallbackCategories = () =>
    vape420VerticalPackConfig.marketing.categoryShowcase.fallbackCategories;

export const getVape420CategoryShowcaseFallbackImageUrl = getStorefrontFallbackImageUrl;
