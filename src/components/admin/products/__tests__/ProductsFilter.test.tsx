import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { vape420VerticalPackConfig } from '@/config/productization';
import { buildAdminSectionCatalog } from '@/config/productization';
import { ProductsFilter } from '../ProductsFilter';

describe('ProductsFilter', () => {
    it('renders shared section tabs from the admin section catalog', () => {
        const onSectionChange = vi.fn();
        const catalog = buildAdminSectionCatalog(vape420VerticalPackConfig);

        const { rerender } = render(
            <ProductsFilter
                search=""
                sectionFilter=""
                showInactive={false}
                quickFilter=""
                onSearchChange={vi.fn()}
                onSectionChange={onSectionChange}
                onToggleInactive={vi.fn()}
                onQuickFilterChange={vi.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();

        for (const section of catalog.sections) {
            expect(screen.getByRole('button', { name: section.shortLabel })).toBeInTheDocument();
        }

        fireEvent.click(screen.getByRole('button', { name: catalog.sections[1]?.shortLabel ?? '420' }));
        expect(onSectionChange).toHaveBeenCalledWith(catalog.sections[1]?.slug ?? '420');

        rerender(
            <ProductsFilter
                search=""
                sectionFilter={catalog.sections[1]?.slug ?? '420'}
                showInactive={false}
                quickFilter=""
                onSearchChange={vi.fn()}
                onSectionChange={onSectionChange}
                onToggleInactive={vi.fn()}
                onQuickFilterChange={vi.fn()}
            />,
        );

        expect(screen.getByRole('button', { name: catalog.sections[1]?.shortLabel ?? '420' })).toHaveClass(
            'bg-white/10',
            'text-white',
            'ring-1',
            'ring-white/10',
        );
    });
});
