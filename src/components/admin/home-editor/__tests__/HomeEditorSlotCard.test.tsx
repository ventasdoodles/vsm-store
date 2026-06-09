import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { buildAdminSectionCatalog } from '@/config/productization';
import type { FeaturedCategory } from '@/services';
import type { Category } from '@/types/category';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

vi.mock('@/components/admin/products/ImageUploader', () => ({
    ImageUploader: () => <div data-testid="image-uploader" />,
}));

vi.mock('@/services', () => ({
    uploadSliderImage: vi.fn(),
}));

import { HomeEditorSlotCard } from '../HomeEditorSlotCard';

const config = getStorefrontSettingsFallback().vertical_pack_config!;
const catalog = buildAdminSectionCatalog(config);
const defaultSection = (catalog.sections[0]?.slug ?? 'vape') as FeaturedCategory['section'];
const vapeSection = catalog.sections[0]!;
const herbalSection = catalog.sections[1]!;

const baseSlot: FeaturedCategory = {
    id: 'slot-1',
    name: 'Featured slot',
    slug: 'featured-slot',
    section: defaultSection,
    image: '',
    iconName: 'Box',
    presetId: 'vape',
};

const categories: Category[] = [
    {
        id: 'cat-vape',
        name: 'Líquidos',
        slug: 'liquidos',
        section: defaultSection,
        parent_id: null,
        description: null,
        image_url: 'https://example.com/liquidos.jpg',
        is_popular: true,
        order_index: 1,
        is_active: true,
        created_at: '2026-05-25T00:00:00.000Z',
    },
    {
        id: 'cat-420',
        name: 'Concentrados',
        slug: 'concentrados',
        section: (catalog.sections[1]?.slug ?? '420') as Category['section'],
        parent_id: null,
        description: null,
        image_url: null,
        is_popular: false,
        order_index: 2,
        is_active: true,
        created_at: '2026-05-25T00:00:00.000Z',
    },
];

const vapeCategory = categories[0]!;
const herbalCategory = categories[1]!;

describe('HomeEditorSlotCard', () => {
    it('renders section options and category labels from the shared admin section catalog', () => {
        render(
            <HomeEditorSlotCard
                slot={baseSlot}
                index={0}
                storeCategories={categories}
                selectedCategoryId="cat-vape"
                onUpdateSlot={vi.fn()}
                onCategorySelect={vi.fn()}
            />,
        );

        for (const section of catalog.sections) {
            expect(screen.getByRole('option', { name: section.shortLabel })).toBeInTheDocument();
        }

        expect(
            screen.getByRole('option', {
                name: new RegExp(`${vapeCategory.name} \\(${vapeSection.shortLabel}\\)`),
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('option', {
                name: `${herbalCategory.name} (${herbalSection.shortLabel})`,
            }),
        ).toBeInTheDocument();
    });

    it('keeps the section select wired to the shared catalog slug values', () => {
        const onUpdateSlot = vi.fn();

        render(
            <HomeEditorSlotCard
                slot={baseSlot}
                index={0}
                storeCategories={categories}
                selectedCategoryId="cat-vape"
                onUpdateSlot={onUpdateSlot}
                onCategorySelect={vi.fn()}
            />,
        );

        const sectionSelect = screen.getAllByRole('combobox')[2] as HTMLSelectElement;

        fireEvent.change(sectionSelect, { target: { value: herbalSection.slug } });

        expect(onUpdateSlot).toHaveBeenCalledWith(0, 'section', herbalSection.slug);
    });
});
