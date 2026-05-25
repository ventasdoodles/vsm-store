import { PREMIUM_GRADIENTS } from '@/constants/slider';
import type { HeroSlider } from '@/services';

export type HomeHeroSliderMoveDirection = 'up' | 'down';

const DEFAULT_GRADIENT = PREMIUM_GRADIENTS[0] ?? { id: 'default', bg: 'from-gray-900 to-black' };

export function sortHomeHeroSlidersByOrder(sliders: HeroSlider[]): HeroSlider[] {
    return [...sliders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function buildNewHomeHeroSliderDraft(sliderCount: number): HeroSlider {
    return {
        id: '',
        title: '',
        subtitle: '',
        description: '',
        image: '',
        tag: '',
        ctaText: 'COMPRAR AHORA',
        ctaLink: '/',
        bgGradient: DEFAULT_GRADIENT.bg,
        bgGradientLight: DEFAULT_GRADIENT.id,
        active: true,
        order: sliderCount,
    };
}

export function deleteHomeHeroSliderById(sliders: HeroSlider[], id: string): HeroSlider[] {
    return sliders.filter((slider) => slider.id !== id);
}

export function toggleHomeHeroSliderStatus(sliders: HeroSlider[], id: string): HeroSlider[] {
    return sliders.map((slider) =>
        slider.id === id ? { ...slider, active: !slider.active } : slider,
    );
}

export function reorderHomeHeroSlider(
    sliders: HeroSlider[],
    id: string,
    direction: HomeHeroSliderMoveDirection,
): HeroSlider[] {
    const index = sliders.findIndex((slider) => slider.id === id);
    if (index === -1) return sliders;
    if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === sliders.length - 1)
    ) {
        return sliders;
    }

    const nextSliders = [...sliders];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const current = nextSliders[index]!;
    const swap = nextSliders[swapIndex]!;

    const currentOrder = current.order ?? index;
    const swapOrder = swap.order ?? swapIndex;
    nextSliders[index] = { ...current, order: swapOrder };
    nextSliders[swapIndex] = { ...swap, order: currentOrder };

    return sortHomeHeroSlidersByOrder(nextSliders);
}

export function upsertHomeHeroSlider(
    sliders: HeroSlider[],
    slide: HeroSlider,
    generateId: () => string = () => Date.now().toString(),
): HeroSlider[] {
    if (slide.id) {
        return sliders.map((slider) => (slider.id === slide.id ? slide : slider));
    }

    return [...sliders, { ...slide, id: generateId() }];
}
