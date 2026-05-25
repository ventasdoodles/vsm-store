import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';
import { CategoriesHeader } from '../CategoriesHeader';

const categories: Category[] = [
    {
        id: 'root-vape',
        name: 'Root Vape',
        slug: 'root-vape',
        section: 'vape',
        parent_id: null,
        description: null,
        image_url: null,
        is_popular: false,
        order_index: 0,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'child-vape',
        name: 'Child Vape',
        slug: 'child-vape',
        section: 'vape',
        parent_id: 'root-vape',
        description: null,
        image_url: null,
        is_popular: true,
        order_index: 1,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'root-420',
        name: 'Root 420',
        slug: 'root-420',
        section: '420',
        parent_id: null,
        description: null,
        image_url: null,
        is_popular: false,
        order_index: 2,
        is_active: true,
        created_at: '2026-01-01T00:00:00.000Z',
    },
];

describe('CategoriesHeader', () => {
    it('renders section tabs from the shared admin section catalog', () => {
        const onSectionChange = vi.fn();
        const onNew = vi.fn();

        render(
            <CategoriesHeader
                categories={categories}
                sectionFilter="vape"
                onSectionChange={onSectionChange}
                onNew={onNew}
            />,
        );

        expect(screen.getByRole('button', { name: 'Vape' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '420' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '420' }));
        expect(onSectionChange).toHaveBeenCalledWith('420');

        fireEvent.click(screen.getByRole('button', { name: 'Nueva' }));
        expect(onNew).toHaveBeenCalled();
    });
});
