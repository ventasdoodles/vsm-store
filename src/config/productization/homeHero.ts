import { activeVerticalPackConfig } from './active';
import { getStorefrontFallbackImageUrl } from './storefrontFallbacks';

export interface HomeHeroSliderFallbackConfig {
    id: string;
    title: string;
    subtitle: string;
    description?: string;
    tag?: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    bgGradient: string;
    bgGradientLight: string;
    active: boolean;
    order: number;
}

const VAPE420_HOME_HERO_SLIDER_FALLBACKS: HomeHeroSliderFallbackConfig[] = [
    {
        id: '1',
        title: 'Vapes y 420',
        subtitle: 'seleccionados',
        description: 'Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.',
        tag: 'Envíos Nacionales',
        image: '/images/storefront-fallbacks/hero-vape.svg',
        ctaText: 'Compra Ahora',
        ctaLink: '/vape',
        bgGradient: 'from-violet-900 via-fuchsia-900 to-purple-900',
        bgGradientLight: 'from-violet-500 via-fuchsia-500 to-purple-600',
        active: true,
        order: 1,
    },
    {
        id: '2',
        title: 'Productos Premium 420',
        subtitle: 'La mejor selección de productos importados directamente para ti',
        image: '/images/storefront-fallbacks/hero-extracts.svg',
        ctaText: 'Explorar 420',
        ctaLink: '/420',
        bgGradient: 'from-emerald-900 via-green-900 to-teal-900',
        bgGradientLight: 'from-emerald-500 via-green-500 to-teal-600',
        active: true,
        order: 2,
    },
    {
        id: '3',
        title: 'Más de 50 Sabores',
        subtitle: 'Encuentra tu favorito entre nuestra amplia variedad de líquidos',
        image: '/images/storefront-fallbacks/hero-generic.svg',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        bgGradient: 'from-blue-900 via-indigo-900 to-slate-900',
        bgGradientLight: 'from-blue-500 via-indigo-500 to-slate-600',
        active: true,
        order: 3,
    },
];

export const getVape420HomeHeroPrimaryCopy = () =>
    activeVerticalPackConfig.marketing.homeHero.primaryCopy;

export const getVape420HomeHeroSliderFallbacks = (): HomeHeroSliderFallbackConfig[] => {
    if (activeVerticalPackConfig.id === 'vape-420') {
        return VAPE420_HOME_HERO_SLIDER_FALLBACKS;
    }

    return activeVerticalPackConfig.sections.map((section, idx) => {
        const themeToken = section.themeToken;
        let bgGradient = 'from-indigo-900 via-sky-900 to-slate-900';
        let bgGradientLight = 'from-indigo-500 via-sky-500 to-slate-600';
        let image = '/images/storefront-fallbacks/hero-generic.svg';

        if (themeToken === 'proof' || themeToken === 'proof-alt') {
            bgGradient = 'from-blue-900 via-indigo-900 to-slate-900';
            bgGradientLight = 'from-blue-500 via-indigo-500 to-slate-600';
            image = '/images/storefront-fallbacks/hero-generic.svg';
        }

        return {
            id: String(idx + 1),
            title: activeVerticalPackConfig.marketing.homeHero.primaryCopy.title,
            subtitle: activeVerticalPackConfig.marketing.homeHero.primaryCopy.subtitle,
            description: activeVerticalPackConfig.marketing.homeHero.primaryCopy.description,
            tag: activeVerticalPackConfig.marketing.homeHero.primaryCopy.tag,
            image,
            ctaText: 'Ver Más',
            ctaLink: section.routePrefix,
            bgGradient,
            bgGradientLight,
            active: true,
            order: idx + 1,
        };
    });
};

export const getVape420HomeHeroFallbackImageUrl = getStorefrontFallbackImageUrl;
