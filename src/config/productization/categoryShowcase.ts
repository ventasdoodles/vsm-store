import { vape420VerticalPackConfig } from './vape420VerticalPack';

export const getVape420CategoryShowcaseFallbackCategories = () =>
    vape420VerticalPackConfig.marketing.categoryShowcase.fallbackCategories;

export const getVape420CategoryShowcaseFallbackImageUrl = (path: string) =>
    typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();
