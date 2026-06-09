import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAdminSectionCatalog, getAdminDefaultSectionSlug } from '@/config/productization';
import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

const warningMock = vi.fn();
const successMock = vi.fn();
const errorMock = vi.fn();
const infoMock = vi.fn();
const enrichProductMock = vi.fn((..._args: any[]) => Promise.resolve(null));
const useAdminProductDetailMock = vi.fn((id: string | null) => ({ data: null, id }));
const isTechnicalTagMock = vi.fn((tag: string) => tag.startsWith('tech'));

vi.mock('@/hooks/admin/useAdminProducts', () => ({
    useAdminProductDetail: (id: string | null) => useAdminProductDetailMock(id),
    uploadProductImage: vi.fn(),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        warning: warningMock,
        success: successMock,
        error: errorMock,
        info: infoMock,
    }),
}));

vi.mock('@/services/admin', () => ({
    enrichProduct: (...args: any[]) => enrichProductMock(...args),
}));

vi.mock('@/services/admin/admin-tags.service', () => ({
    isTechnicalTag: (tag: string) => isTechnicalTagMock(tag),
}));

vi.mock('@/components/ui/SideDrawer', () => ({
    SideDrawer: ({ children, isOpen, title }: { children: ReactNode; isOpen: boolean; title: string }) =>
        isOpen ? (
            <section data-testid="side-drawer">
                <h1>{title}</h1>
                {children}
            </section>
        ) : null,
}));

vi.mock('../ImageUploader', () => ({
    ImageUploader: () => <div data-testid="image-uploader" />,
}));

vi.mock('../CategoryCascader', () => ({
    CategoryCascader: ({
        section,
        value,
        onChange,
    }: {
        section: string;
        value: string;
        onChange: (categoryId: string) => void;
    }) => (
        <div data-testid="category-cascader" data-section={section} data-value={value}>
            <button type="button" onClick={() => onChange('cat-1')}>
                Set category
            </button>
        </div>
    ),
}));

vi.mock('../ProductVariantsEditor', () => ({
    ProductVariantsEditor: ({
        section,
        categoryId,
    }: {
        section: string;
        categoryId: string;
    }) => <div data-testid="product-variants" data-section={section} data-category-id={categoryId} />,
}));

import { ProductEditorDrawer } from '../ProductEditorDrawer';

describe('ProductEditorDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isTechnicalTagMock.mockReturnValue(false);
    });

    it('derives section defaults, select options, and child props from the shared admin section catalog', () => {
        render(
            <ProductEditorDrawer
                product={null}
                isOpen
                onClose={vi.fn()}
                onSave={vi.fn()}
                isSaving={false}
                categories={[]}
                tagNames={[]}
            />,
        );

        const config = getStorefrontSettingsFallback().vertical_pack_config!;
        const catalog = buildAdminSectionCatalog(config);
        const defaultSection = getAdminDefaultSectionSlug(config);

        fireEvent.click(screen.getByRole('button', { name: /Clasificaci/i }));

        const sectionSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;

        expect(sectionSelect.value).toBe(defaultSection);
        expect(screen.getByRole('option', { name: catalog.sections[0]?.displayLabel ?? '💨 Vape' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: catalog.sections[1]?.displayLabel ?? '🌿 420' })).toBeInTheDocument();
        expect(screen.getByTestId('category-cascader')).toHaveAttribute('data-section', defaultSection);

        fireEvent.click(screen.getByRole('button', { name: /Configuraci/i }));
        expect(screen.getByTestId('product-variants')).toHaveAttribute('data-section', defaultSection);
    });

    it('keeps the shared section labels in the validation copy', () => {
        render(
            <ProductEditorDrawer
                product={null}
                isOpen
                onClose={vi.fn()}
                onSave={vi.fn()}
                isSaving={false}
                categories={[]}
                tagNames={[]}
            />,
        );

        fireEvent.change(screen.getAllByRole('textbox')[0]!, {
            target: { value: 'Producto demo' },
        });

        const spinbuttons = screen.getAllByRole('spinbutton');
        fireEvent.change(spinbuttons[0]!, { target: { value: '12' } });
        fireEvent.change(spinbuttons[1]!, { target: { value: '1500' } });

        fireEvent.click(screen.getByRole('button', { name: /Clasificaci/i }));
        const sectionSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
        fireEvent.change(sectionSelect, { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: 'Set category' }));
        fireEvent.click(screen.getByRole('button', { name: /Crear Producto/i }));

        const config = getStorefrontSettingsFallback().vertical_pack_config!;
        const label = buildAdminSectionCatalog(config).sections.map((section) => section.shortLabel).join(' o ');
        expect(warningMock).toHaveBeenCalledWith('Revisar datos requeridos', `Debes seleccionar una sección (${label}).`);
    });
});
