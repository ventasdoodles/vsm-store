import { FALLBACK_CATEGORIES } from '@/constants/category-showcase';
import type { FeaturedCategory } from '@/services';
import type { Category } from '@/types/category';

export const HOME_FEATURED_CATEGORY_SLOTS = 4;

function getFallbackHomeFeaturedCategory(index: number): FeaturedCategory {
    return { ...FALLBACK_CATEGORIES[index]! };
}

export function buildHomeFeaturedCategories(
    dbCategories: FeaturedCategory[] | null | undefined,
): FeaturedCategory[] {
    return Array.from({ length: HOME_FEATURED_CATEGORY_SLOTS }, (_, index) => {
        const saved = dbCategories?.[index];
        if (saved && saved.slug && saved.name) return saved;
        return getFallbackHomeFeaturedCategory(index);
    });
}

export function updateHomeFeaturedCategorySlot(
    categories: FeaturedCategory[],
    index: number,
    field: keyof FeaturedCategory,
    value: string,
): FeaturedCategory[] {
    if (!categories[index]) return categories;

    const updated = [...categories];
    updated[index] = { ...updated[index]!, [field]: value };
    return updated;
}

export function applyHomeFeaturedCategorySelection(
    categories: FeaturedCategory[],
    index: number,
    category: Category | undefined,
): FeaturedCategory[] {
    if (!category || !categories[index]) return categories;

    const current = categories[index]!;
    const nextSection = category.section === 'vape' || category.section === '420'
        ? category.section
        : current.section;

    const updated = [...categories];
    updated[index] = {
        ...current,
        slug: category.slug,
        name: category.name,
        section: nextSection,
        ...(category.image_url ? { image: category.image_url } : {}),
    };
    return updated;
}

export function findMatchingHomeFeaturedCategoryId(
    slot: FeaturedCategory,
    storeCategories: Category[],
): string {
    const match = storeCategories.find(
        (category) => category.slug === slot.slug && category.section === slot.section,
    );
    return match?.id ?? '';
}
