import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Category } from '@/types/category';
import { CategoryForm } from '../CategoryForm';
import { VerticalPackContext } from '@/contexts/VerticalPackContext';
import { vape420VerticalPackConfig } from '@/config/productization';

const baseCategory: Category = {
    id: 'root-420',
    name: 'Root 420',
    slug: 'root-420',
    section: '420',
    parent_id: null,
    description: null,
    image_url: null,
    is_popular: false,
    order_index: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
};

describe('CategoryForm', () => {
    it('derives its default section and select options from the shared section catalog', () => {
        const onSave = vi.fn();
        const onClose = vi.fn();

        render(
            <VerticalPackContext.Provider value={{ config: vape420VerticalPackConfig, isLoading: false }}>
                <CategoryForm
                    open
                    editing={null}
                    parentCategory={null}
                    allCategories={[]}
                    isSaving={false}
                    onSave={onSave}
                    onClose={onClose}
                />
            </VerticalPackContext.Provider>
        );

        const sectionSelect = screen.getAllByRole('combobox')[0]! as HTMLSelectElement;

        expect(sectionSelect.value).toBe('vape');
        expect(screen.getByRole('option', { name: 'Vape' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '420' })).toBeInTheDocument();
    });

    it('locks the child section to the parent section while keeping the shared options', () => {
        const onSave = vi.fn();
        const onClose = vi.fn();

        render(
            <VerticalPackContext.Provider value={{ config: vape420VerticalPackConfig, isLoading: false }}>
                <CategoryForm
                    open
                    editing={null}
                    parentCategory={baseCategory}
                    allCategories={[baseCategory]}
                    isSaving={false}
                    onSave={onSave}
                    onClose={onClose}
                />
            </VerticalPackContext.Provider>
        );

        const sectionSelect = screen.getAllByRole('combobox')[0]! as HTMLSelectElement;

        expect(sectionSelect).toBeDisabled();
        expect(sectionSelect.value).toBe('420');

        fireEvent.change(screen.getByPlaceholderText('Ej. Líquidos'), { target: { value: 'Nueva categoría' } });
        fireEvent.change(screen.getByPlaceholderText('liquidos'), { target: { value: 'nueva-categoria' } });
        fireEvent.click(screen.getByRole('button', { name: /Crear categoría/i }));

        expect(onSave).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Nueva categoría',
                slug: 'nueva-categoria',
                section: '420',
                parent_id: 'root-420',
            }),
        );
    });
});
