import { describe, expect, it } from 'vitest';
import type { FeaturedCategory } from '@/services';
import type { Category } from '@/types/category';
import {
    applyHomeFeaturedCategorySelection,
    buildHomeFeaturedCategories,
    findMatchingHomeFeaturedCategoryId,
    updateHomeFeaturedCategorySlot,
} from '../homeFeaturedCategories';

const createCategory = (overrides: Partial<FeaturedCategory> = {}): FeaturedCategory => ({
    id: 'slot-1',
    name: 'Líquidos',
    slug: 'liquidos',
    section: 'vape',
    iconName: 'Flame',
    image: 'https://example.com/liquidos.jpg',
    presetId: 'orange-red',
    ...overrides,
});

const createStoreCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 'cat-1',
    name: 'Pods & Mods',
    slug: 'pods-mods',
    section: 'vape',
    parent_id: null,
    description: null,
    image_url: 'https://example.com/pods.jpg',
    is_popular: false,
    order_index: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
});

describe('homeFeaturedCategories', () => {
    it('builds four slots from saved categories and falls back for missing entries', () => {
        const saved = [
            createCategory({ id: 'saved-1' }),
            createCategory({ id: 'saved-2', name: '', slug: '' }),
        ];

        const categories = buildHomeFeaturedCategories(saved);

        expect(categories).toHaveLength(4);
        expect(categories[0]).toBe(saved[0]);
        expect(categories[1]).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            slug: expect.any(String),
        });
        expect(categories[1]).not.toBe(saved[1]);
        expect(categories[1]).not.toEqual(saved[1]);
        expect(categories[2]).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            slug: expect.any(String),
        });
        expect(categories[3]).toMatchObject({
            id: expect.any(String),
            name: expect.any(String),
            slug: expect.any(String),
        });
    });

    it('updates a slot immutably and only changes the targeted field', () => {
        const categories = [createCategory(), createCategory({ id: 'slot-2' })];

        const updated = updateHomeFeaturedCategorySlot(categories, 1, 'name', 'Accesorios');

        expect(updated).not.toBe(categories);
        expect(updated[0]).toBe(categories[0]);
        expect(updated[1]).toMatchObject({
            id: 'slot-2',
            name: 'Accesorios',
            slug: 'liquidos',
        });
        expect(categories[1]).toMatchObject({
            id: 'slot-2',
            name: 'Líquidos',
            slug: 'liquidos',
        });
    });

    it('applies a selected store category, copying slug, name, image_url, and only allowed sections', () => {
        const categories = [createCategory({ section: '420', image: 'https://example.com/keep.jpg' })];
        const selected = createStoreCategory({
            name: 'Cannabis Premium',
            slug: 'cannabis-premium',
            section: '420',
            image_url: 'https://example.com/cannabis.jpg',
        });

        const updated = applyHomeFeaturedCategorySelection(categories, 0, selected);

        expect(updated[0]).toMatchObject({
            name: 'Cannabis Premium',
            slug: 'cannabis-premium',
            section: '420',
            image: 'https://example.com/cannabis.jpg',
        });
        expect(categories[0]).toMatchObject({
            name: 'Líquidos',
            slug: 'liquidos',
            section: '420',
            image: 'https://example.com/keep.jpg',
        });
    });

    it('keeps the current section when the selected category section is outside the allowed home editor set', () => {
        const categories = [createCategory({ section: 'vape' })];
        const unsafeSelection = {
            ...createStoreCategory({
                section: 'vape',
                image_url: null,
            }),
            section: 'legacy' as unknown as Category['section'],
        } as Category;

        const updated = applyHomeFeaturedCategorySelection(categories, 0, unsafeSelection);

        expect(updated[0]?.section).toBe('vape');
    });

    it('finds the matching category id by slug and section', () => {
        const categories = [
            createStoreCategory({ id: 'cat-1', slug: 'liquidos', section: 'vape' }),
            createStoreCategory({ id: 'cat-2', slug: 'liquidos', section: '420' }),
        ];

        expect(findMatchingHomeFeaturedCategoryId(createCategory(), categories)).toBe('cat-1');
        expect(findMatchingHomeFeaturedCategoryId(createCategory({ section: '420' }), categories)).toBe('cat-2');
        expect(findMatchingHomeFeaturedCategoryId(createCategory({ slug: 'missing' }), categories)).toBe('');
    });
});
