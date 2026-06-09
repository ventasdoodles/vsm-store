import type { VerticalPackConfig } from './types';
import { getStorefrontFallbackImageUrl } from './storefrontFallbacks';

export const getVape420CategoryShowcaseFallbackCategories = (config: VerticalPackConfig) =>
    config.marketing.categoryShowcase.fallbackCategories;

export const getVape420CategoryShowcaseFallbackImageUrl = getStorefrontFallbackImageUrl;
