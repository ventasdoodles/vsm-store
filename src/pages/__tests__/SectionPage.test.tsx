import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionPage } from '../SectionPage';
import { getVape420SectionPageConfig } from '@/config/productization';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

const useProductsMock = vi.hoisted(() => vi.fn());
const useCategoriesMock = vi.hoisted(() => vi.fn());
const useSectionFromPathMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useProducts', () => ({
    useProducts: (...args: unknown[]) => useProductsMock(...args),
}));

vi.mock('@/hooks/useCategories', () => ({
    useCategories: (...args: unknown[]) => useCategoriesMock(...args),
}));

vi.mock('@/hooks/useSectionFromPath', () => ({
    useSectionFromPath: () => useSectionFromPathMock(),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({ title, description }: { title?: string; description?: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    ),
}));

vi.mock('@/components/products/ProductBreadcrumbs', () => ({
    ProductBreadcrumbs: ({ productName }: { productName: string }) => (
        <nav data-testid="breadcrumbs">{productName}</nav>
    ),
}));

vi.mock('@/components/categories/CategoryCard', () => ({
    CategoryCard: ({ category }: { category: Category }) => (
        <article data-testid="category-card">{category.name}</article>
    ),
}));

vi.mock('@/components/products/ProductGrid', () => ({
    ProductGrid: ({
        products,
        isLoading,
    }: {
        products: Product[];
        isLoading?: boolean;
    }) => (
        <div data-testid="product-grid" data-loading={String(!!isLoading)}>
            {products.map((product) => (
                <span key={product.id}>{product.name}</span>
            ))}
        </div>
    ),
}));

vi.mock('@/components/ui/BottomSheet', () => ({
    BottomSheet: ({ children, isOpen }: { children: ReactNode; isOpen: boolean }) => (
        isOpen ? <div data-testid="bottom-sheet">{children}</div> : null
    ),
}));

vi.mock('@/components/home/SocialProof', () => ({
    SocialProof: ({ section }: { section: Section }) => (
        <div data-testid="social-proof">{section}</div>
    ),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: overrides.id ?? 'product-1',
        name: overrides.name ?? 'Product',
        slug: overrides.slug ?? 'product',
        description: null,
        short_description: null,
        price: overrides.price ?? 100,
        compare_at_price: null,
        stock: overrides.stock ?? 5,
        sku: null,
        section: overrides.section ?? 'vape',
        category_id: overrides.category_id ?? 'category-1',
        tags: [],
        status: 'active',
        images: [],
        cover_image: null,
        is_featured: false,
        is_featured_until: null,
        is_new: false,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: true,
        created_at: '2026-04-29T00:00:00.000Z',
        updated_at: '2026-04-29T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
        ...overrides,
    };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
    return {
        id: overrides.id ?? 'category-1',
        name: overrides.name ?? 'Category',
        slug: overrides.slug ?? 'category',
        section: overrides.section ?? 'vape',
        parent_id: overrides.parent_id ?? null,
        description: null,
        image_url: null,
        is_popular: false,
        order_index: 0,
        is_active: true,
        created_at: '2026-04-29T00:00:00.000Z',
        ...overrides,
    };
}

describe('SectionPage visible states', () => {
    beforeEach(() => {
        useProductsMock.mockReset();
        useCategoriesMock.mockReset();
        useSectionFromPathMock.mockReset();
        useSectionFromPathMock.mockReturnValue('vape');
        useProductsMock.mockReturnValue({ data: [], isLoading: false });
        useCategoriesMock.mockReturnValue({ data: [], isLoading: false });
    });

    it('renders vape section title/copy and SEO metadata', () => {
        const productizedSection = getVape420SectionPageConfig('vape');

        render(<SectionPage />);

        expect(screen.getByRole('heading', { name: productizedSection.title })).toBeInTheDocument();
        expect(screen.getByText(productizedSection.subtitle)).toBeInTheDocument();
        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', productizedSection.title);
        expect(screen.getByTestId('seo')).toHaveAttribute('data-description', productizedSection.seoDescription);
        expect(useProductsMock).toHaveBeenCalledWith({ section: 'vape' });
        expect(useCategoriesMock).toHaveBeenCalledWith('vape');
    });

    it('wires loading product state into ProductGrid', () => {
        useProductsMock.mockReturnValue({ data: [], isLoading: true });

        render(<SectionPage />);

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'true');
    });

    it('renders category count, category chips, and category cards', () => {
        useCategoriesMock.mockReturnValue({
            data: [
                makeCategory({ id: 'category-a', name: 'Pods', slug: 'pods' }),
                makeCategory({ id: 'category-b', name: 'Liquidos', slug: 'liquidos' }),
                makeCategory({ id: 'child-category', name: 'Desechables', parent_id: 'category-a' }),
            ],
            isLoading: false,
        });

        render(<SectionPage />);

        expect(screen.getByText(/2\s+categor.as/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Pods' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Liquidos' })).toBeInTheDocument();
        expect(screen.getAllByTestId('category-card')).toHaveLength(2);
        expect(screen.queryByText('Desechables')).not.toBeInTheDocument();
    });

    it('renders populated product count and grid products', () => {
        useProductsMock.mockReturnValue({
            data: [
                makeProduct({ id: 'product-a', name: 'Alpha Pod' }),
                makeProduct({ id: 'product-b', name: 'Beta Pod' }),
            ],
            isLoading: false,
        });

        render(<SectionPage />);

        expect(screen.getByText('2 productos')).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Alpha Pod')).toBeInTheDocument();
        expect(screen.getByText('Beta Pod')).toBeInTheDocument();
    });

    it('renders empty product count and a non-loading grid when no products or categories exist', () => {
        render(<SectionPage />);

        expect(screen.getByText('0 productos')).toBeInTheDocument();
        expect(screen.getByText(/0\s+categor.as/)).toBeInTheDocument();
        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
    });

    it('renders 420 section copy and SEO metadata', () => {
        const productizedSection = getVape420SectionPageConfig('420');
        useSectionFromPathMock.mockReturnValue('420');
        useProductsMock.mockReturnValue({
            data: [makeProduct({ id: 'herbal-product', name: 'Herbal Kit', section: '420' })],
            isLoading: false,
        });

        render(<SectionPage />);

        expect(screen.getByRole('heading', { name: productizedSection.title })).toBeInTheDocument();
        expect(screen.getByText(productizedSection.subtitle)).toBeInTheDocument();
        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', productizedSection.title);
        expect(screen.getByTestId('seo')).toHaveAttribute('data-description', productizedSection.seoDescription);
        expect(screen.getByTestId('social-proof')).toHaveTextContent('420');
        expect(useProductsMock).toHaveBeenCalledWith({ section: '420' });
        expect(useCategoriesMock).toHaveBeenCalledWith('420');
    });
});
