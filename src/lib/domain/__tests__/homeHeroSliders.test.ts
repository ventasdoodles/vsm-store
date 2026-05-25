import { describe, expect, it } from 'vitest';
import { PREMIUM_GRADIENTS } from '@/constants/slider';
import type { HeroSlider } from '@/services';
import {
    buildNewHomeHeroSliderDraft,
    deleteHomeHeroSliderById,
    reorderHomeHeroSlider,
    sortHomeHeroSlidersByOrder,
    toggleHomeHeroSliderStatus,
    upsertHomeHeroSlider,
} from '../homeHeroSliders';

function makeSlider(overrides: Partial<HeroSlider> = {}): HeroSlider {
    return {
        id: 'slide-1',
        title: 'Slide 1',
        subtitle: 'Subtitle 1',
        description: '',
        image: '',
        tag: '',
        ctaText: 'Comprar',
        ctaLink: '/vape',
        bgGradient: 'from-violet-900 via-fuchsia-900 to-purple-900',
        bgGradientLight: 'cyberpunk',
        active: true,
        order: 0,
        ...overrides,
    };
}

describe('home hero slider editor logic', () => {
    it('builds the default new-slide draft from the current slider count', () => {
        const draft = buildNewHomeHeroSliderDraft(3);

        expect(draft).toEqual({
            id: '',
            title: '',
            subtitle: '',
            description: '',
            image: '',
            tag: '',
            ctaText: 'COMPRAR AHORA',
            ctaLink: '/',
            bgGradient: PREMIUM_GRADIENTS[0]!.bg,
            bgGradientLight: PREMIUM_GRADIENTS[0]!.id,
            active: true,
            order: 3,
        });
    });

    it('sorts sliders by order while preserving the current missing-order fallback', () => {
        const result = sortHomeHeroSlidersByOrder([
            makeSlider({ id: 'third', order: 3 }),
            makeSlider({ id: 'first', order: undefined }),
            makeSlider({ id: 'second', order: 2 }),
        ]);

        expect(result.map((slider) => slider.id)).toEqual(['first', 'second', 'third']);
    });

    it('deletes only the requested slide id', () => {
        const result = deleteHomeHeroSliderById([
            makeSlider({ id: 'keep' }),
            makeSlider({ id: 'remove' }),
            makeSlider({ id: 'also-keep' }),
        ], 'remove');

        expect(result.map((slider) => slider.id)).toEqual(['keep', 'also-keep']);
    });

    it('toggles only the requested slide active value', () => {
        const result = toggleHomeHeroSliderStatus([
            makeSlider({ id: 'first', active: true }),
            makeSlider({ id: 'second', active: false }),
        ], 'second');

        expect(result).toEqual([
            expect.objectContaining({ id: 'first', active: true }),
            expect.objectContaining({ id: 'second', active: true }),
        ]);
    });

    it('does not reorder when the requested move is outside the current bounds', () => {
        const sliders = [
            makeSlider({ id: 'first', order: 0 }),
            makeSlider({ id: 'second', order: 1 }),
        ];

        expect(reorderHomeHeroSlider(sliders, 'first', 'up')).toBe(sliders);
        expect(reorderHomeHeroSlider(sliders, 'second', 'down')).toBe(sliders);
        expect(reorderHomeHeroSlider(sliders, 'missing', 'up')).toBe(sliders);
    });

    it('swaps order values for valid up and down moves', () => {
        const sliders = [
            makeSlider({ id: 'first', order: 0 }),
            makeSlider({ id: 'second', order: 1 }),
            makeSlider({ id: 'third', order: 2 }),
        ];

        expect(reorderHomeHeroSlider(sliders, 'second', 'up').map((slider) => slider.id)).toEqual([
            'second',
            'first',
            'third',
        ]);
        expect(reorderHomeHeroSlider(sliders, 'second', 'down').map((slider) => slider.id)).toEqual([
            'first',
            'third',
            'second',
        ]);
    });

    it('updates existing slides and creates new slides with an injected id', () => {
        const existing = makeSlider({ id: 'existing', title: 'Old title' });
        const updated = makeSlider({ id: 'existing', title: 'New title' });
        const draft = buildNewHomeHeroSliderDraft(1);

        expect(upsertHomeHeroSlider([existing], updated)).toEqual([updated]);
        expect(upsertHomeHeroSlider([existing], draft, () => 'generated-id')).toEqual([
            existing,
            expect.objectContaining({ id: 'generated-id', order: 1 }),
        ]);
    });
});
