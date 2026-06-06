import { activeVerticalPackConfig } from './active';
import { getStorefrontFallbackImageUrl } from './storefrontFallbacks';

export const getVape420CategoryShowcaseFallbackCategories = () =>
    activeVerticalPackConfig.marketing.categoryShowcase.fallbackCategories;

export const getVape420CategoryShowcaseFallbackImageUrl = getStorefrontFallbackImageUrl;
