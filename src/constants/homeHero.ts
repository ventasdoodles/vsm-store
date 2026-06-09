import {
    getVape420HomeHeroFallbackImageUrl,
    getVape420HomeHeroPrimaryCopy,
    getVape420HomeHeroSliderFallbacks,
} from '@/config/productization/homeHero';
import type { HomeHeroMarketingCopy, VerticalPackConfig } from '@/config/productization/types';

export interface HomeHeroCopy extends HomeHeroMarketingCopy {
    title: string;
    subtitle: string;
    description: string;
    tag: string;
}

export const getNationalHomeHeroCopy = (config: VerticalPackConfig): HomeHeroCopy => getVape420HomeHeroPrimaryCopy(config);
export const getHomeHeroSliderFallbacks = getVape420HomeHeroSliderFallbacks;
export const getHomeHeroFallbackImageUrl = getVape420HomeHeroFallbackImageUrl;

type HomeHeroSlideLike = Pick<HomeHeroCopy, 'title' | 'subtitle' | 'description' | 'tag'>;

const normalizeCopy = (value?: string | null) =>
    (value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

export const hasStaleCityHeroCopy = (slide: HomeHeroSlideLike) => {
    const copy = normalizeCopy(`${slide.title} ${slide.subtitle} ${slide.description} ${slide.tag}`);
    return (
        copy.includes('xalapa') ||
        copy.includes('envio gratis en') ||
        copy.includes('entregas personales') ||
        copy.includes('hechos en') ||
        copy.includes('fabricados') ||
        (copy.includes('acapulco') && !copy.includes('dhl'))
    );
};

export const normalizeHomeHeroSlide = <T extends HomeHeroSlideLike>(slide: T, config: VerticalPackConfig): T => {
    if (!hasStaleCityHeroCopy(slide)) return slide;

    return {
        ...slide,
        ...getNationalHomeHeroCopy(config),
    };
};
