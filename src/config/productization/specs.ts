import type { Section } from '@/types/product';
import type { VerticalPackConfig } from './types';

export const getVape420SuggestedSpecs = (config: VerticalPackConfig): Record<string, string[]> =>
    config.attributeSchema.suggestedSpecsByCategorySlug;

export const getVape420SectionDefaultSpecs = (config: VerticalPackConfig): Record<Section, string[]> =>
    config.attributeSchema.defaultSpecsBySectionSlug as Record<Section, string[]>;

export const getVape420SpecKeyNormalization = (config: VerticalPackConfig): Record<string, string> =>
    config.attributeSchema.specKeyNormalization;

export const normalizeVape420SpecKey = (key: string, config: VerticalPackConfig): string => {
    const cleanKey = key.toLowerCase().trim().replace(/[:=]$/, '');
    return getVape420SpecKeyNormalization(config)[cleanKey] || (key.charAt(0).toUpperCase() + key.slice(1).trim());
};
