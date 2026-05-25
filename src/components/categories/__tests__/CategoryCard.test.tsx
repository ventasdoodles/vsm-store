import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CategoryCard } from '../CategoryCard';
import type { Category } from '@/types/category';

function makeCategory(overrides: Partial<Category> = {}): Category {
    return {
        id: overrides.id ?? 'category-1',
        name: overrides.name ?? 'Pods',
        slug: overrides.slug ?? 'pods',
        section: overrides.section ?? 'vape',
        parent_id: overrides.parent_id ?? null,
        description: overrides.description ?? null,
        image_url: overrides.image_url ?? null,
        is_popular: false,
        order_index: 0,
        is_active: true,
        created_at: '2026-04-29T00:00:00.000Z',
        ...overrides,
    };
}

describe('CategoryCard', () => {
    it('applies vape presentation classes from shared product surface config', () => {
        render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <CategoryCard category={makeCategory()} section="vape" />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: 'Pods' });
        expect(link).toHaveAttribute('href', '/vape/pods');
        expect(link).toHaveClass('glow-vape-hover');
        expect(link.querySelector('div.bg-vape-500\\/10')).toBeTruthy();
        expect(link.querySelector('div.bg-vape-500\\/20')).toBeTruthy();
        expect(link.querySelector('div.bg-vape-500\\/20.group-hover\\:bg-vape-400')).toBeTruthy();
    });

    it('applies herbal presentation classes from shared product surface config', () => {
        render(
            <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <CategoryCard category={makeCategory({ section: '420', slug: 'flores' })} section="420" />
            </MemoryRouter>,
        );

        const link = screen.getByRole('link', { name: 'Pods' });
        expect(link).toHaveAttribute('href', '/420/flores');
        expect(link).toHaveClass('glow-herbal-hover');
        expect(link.querySelector('div.bg-herbal-500\\/10')).toBeTruthy();
        expect(link.querySelector('div.bg-herbal-500\\/20')).toBeTruthy();
        expect(link.querySelector('div.bg-herbal-500\\/20.group-hover\\:bg-herbal-400')).toBeTruthy();
    });
});
