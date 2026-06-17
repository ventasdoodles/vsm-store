import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';

vi.mock('@/components/admin/ui/AdminEmptyState', () => ({
    AdminEmptyState: ({ title, description }: { title: string; description: string }) => (
        <div>
            <div>{title}</div>
            <div>{description}</div>
        </div>
    ),
}));

import { CategoryTreeContainer } from '../CategoryTreeContainer';

describe('CategoryTreeContainer', () => {
    it('uses the shared section catalog label in the filtered empty state', () => {
        render(
            <CategoryTreeContainer
                roots={[]}
                childrenMap={{}}
                allCategories={[] as Category[]}
                sectionFilter="vape"
                isLoading={false}
                onEdit={vi.fn()}
                onAddChild={vi.fn()}
                onDelete={vi.fn()}
                onToggleActive={vi.fn()}
                isToggling={false}
            />,
        );

        expect(screen.getByText(/No hay categor/i)).toBeInTheDocument();
        expect(
            screen.getByText('No se encontraron categorías en la sección Vape'),
        ).toBeInTheDocument();
    });
});
