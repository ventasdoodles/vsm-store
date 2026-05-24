import { NATIONAL_HOME_HERO_COPY } from '@/constants/homeHero';

const sharedHomeMetaDescription = `${NATIONAL_HOME_HERO_COPY.title} ${NATIONAL_HOME_HERO_COPY.subtitle}. ${NATIONAL_HOME_HERO_COPY.description}`;

export const STORE_META_COPY = {
    home: {
        hiddenHeading: `VSM Store — ${NATIONAL_HOME_HERO_COPY.title.toLowerCase()} importados, enviados por DHL`,
        seoDescription: sharedHomeMetaDescription,
    },
    checkout: {
        seoDescription: sharedHomeMetaDescription,
    },
} as const;
