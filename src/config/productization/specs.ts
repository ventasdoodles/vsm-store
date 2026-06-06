import type { Section } from '@/types/product';
import { activeVerticalPackConfig } from './active';

export const getVape420SuggestedSpecs = (): Record<string, string[]> =>
    activeVerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug;

export const getVape420SectionDefaultSpecs = (): Record<Section, string[]> =>
    activeVerticalPackConfig.attributeSchema.defaultSpecsBySectionSlug as Record<Section, string[]>;

export const getVape420SpecKeyNormalization = (): Record<string, string> =>
    activeVerticalPackConfig.attributeSchema.specKeyNormalization;

export const normalizeVape420SpecKey = (key: string): string => {
    const cleanKey = key.toLowerCase().trim().replace(/[:=]$/, '');
    return getVape420SpecKeyNormalization()[cleanKey] || (key.charAt(0).toUpperCase() + key.slice(1).trim());
};
