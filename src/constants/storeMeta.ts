import { getNationalHomeHeroCopy } from '@/constants/homeHero';
import { vsmStoreTenantConfig } from '@/config/productization';
import type { VerticalPackConfig } from '@/config/productization/types';

export const getStoreMetaCopy = (config: VerticalPackConfig) => {
    const copy = getNationalHomeHeroCopy(config);
    const sharedHomeMetaDescription = `${copy.title} ${copy.subtitle}. ${copy.description}`;

    return {
        home: {
            hiddenHeading: `${vsmStoreTenantConfig.displayName} — ${copy.title.toLowerCase()} importados, enviados por DHL`,
            seoDescription: sharedHomeMetaDescription,
        },
        checkout: {
            seoDescription: sharedHomeMetaDescription,
        },
    } as const;
};
