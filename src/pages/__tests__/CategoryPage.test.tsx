import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TestRouter } from '@/lib/test-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryPage } from '../CategoryPage';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

const useProductsMock = vi.hoisted(() => vi.fn());
const useCategoryBySlugMock = vi.hoisted(() => vi.fn());
const useCategoriesMock = vi.hoisted(() => vi.fn());
const useSectionFromPathMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, ...props }: { children?: ReactNode }) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
}));

vi.mock('@/hooks/useProducts', () => ({
    useProducts: (...args: unknown[]) => useProductsMock(...args),
}));

vi.mock('@/hooks/useCategories', () => ({
    useCategoryBySlug: (...args: unknown[]) => useCategoryBySlugMock(...args),
    useCategories: (...args: unknown[]) => useCategoriesMock(...args),
}));

vi.mock('@/hooks/useSectionFromPath', () => ({
    useSectionFromPath: () => useSectionFromPathMock(),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({ title, description, type }: { title?: string; description?: string; type?: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} data-type={type} />
    ),
}));

vi.mock('@/components/products/ProductBreadcrumbs', () => ({
    ProductBreadcrumbs: ({ section, productName }: { section: Section; productName: string }) => (
        <nav data-testid="breadcrumbs" data-section={section}>
            {productName}
        </nav>
    ),
}));

vi.mock('@/components/categories/CategoryCard', () => ({
    CategoryCard: ({ category, section }: { category: Category; section: Section }) => (
        <article data-testid="category-card" data-section={section}>
            {category.name}
        </article>
    ),
}));

vi.mock('@/components/products/ProductGrid', () => ({
    ProductGrid: ({
        products,
        isLoading,
        emptyStateSubtext,
        onClearFilter,
    }: {
        products: Product[];
        isLoading?: boolean;
        emptyStateSubtext?: string;
        onClearFilter?: () => void;
    }) => (
        <div
            data-testid="product-grid"
            data-loading={String(!!isLoading)}
            data-can-clear={String(!!onClearFilter)}
        >
            {products.length === 0 && !isLoading && <p>{emptyStateSubtext}</p>}
            {products.map((product) => (
                <span key={product.id}>{product.name}</span>
            ))}
        </div>
    ),
}));

vi.mock('@/components/ui/BottomSheet', () => ({
    BottomSheet: ({ children, isOpen, title }: { children: ReactNode; isOpen: boolean; title: string }) => (
        isOpen ? (
            <section data-testid="bottom-sheet" aria-label={title}>
                {children}
            </section>
        ) : null
    ),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt, src }: { alt: string; src: string }) => (
        <img alt={alt} src={src} />
    ),
}));

vi.mock('@/components/products/FilterSidebar', () => ({
    FilterSidebar: ({ products, section }: { products: Product[]; section: Section }) => (
        <aside data-testid="filter-sidebar" data-section={section}>
            {products.length} filter products
        </aside>
    ),
}));

function makeCategory(overrides: Partial<Category> = {}): Category {
    return {
        id: overrides.id ?? 'category-1',
        name: overrides.name ?? 'Pods',
        slug: overrides.slug ?? 'pods',
        section: overrides.section ?? 'vape',
        parent_id: overrides.parent_id ?? null,
        description: overrides.description ?? 'Pods destacados para VSM Store.',
        image_url: overrides.image_url ?? null,
        is_popular: false,
        order_index: 0,
        is_active: true,
        created_at: '2026-04-29T00:00:00.000Z',
        ...overrides,
    };
}

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

function renderCategoryPage(path = '/vape/categoria/pods') {
    return render(
        <TestRouter initialEntries={[path]} path="/:section/categoria/:slug"><CategoryPage /></TestRouter>,
    );
}

describe('CategoryPage visible states', () => {
    beforeEach(() => {
        useProductsMock.mockReset();
        useCategoryBySlugMock.mockReset();
        useCategoriesMock.mockReset();
        useSectionFromPathMock.mockReset();
        useSectionFromPathMock.mockReturnValue('vape');
        useCategoryBySlugMock.mockReturnValue({
            data: makeCategory(),
            isLoading: false,
            error: null,
        });
        useCategoriesMock.mockReturnValue({ data: [], isLoading: false });
        useProductsMock.mockReturnValue({ data: [], isLoading: false });
    });

    it('renders category copy, SEO, breadcrumbs, and hook arguments from the route', () => {
        renderCategoryPage();

        expect(screen.getByRole('heading', { name: 'Pods' })).toBeInTheDocument();
        expect(screen.getByText('Pods destacados para VSM Store.')).toBeInTheDocument();
        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', 'Pods');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-description', 'Pods destacados para VSM Store.');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-type', 'website');
        expect(screen.getByTestId('breadcrumbs')).toHaveAttribute('data-section', 'vape');
        expect(useCategoryBySlugMock).toHaveBeenCalledWith('pods', 'vape');
        expect(useCategoriesMock).toHaveBeenCalledWith('vape');
        expect(useProductsMock).toHaveBeenCalledWith({ section: 'vape', categoryId: 'category-1' });
    });

    it('wires loading state into ProductGrid for a leaf category', () => {
        useProductsMock.mockReturnValue({ data: [], isLoading: true });

        renderCategoryPage();

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'true');
        expect(screen.getByTestId('filter-sidebar')).toHaveTextContent('0 filter products');
    });

    it('wires empty leaf category state into ProductGrid copy', () => {
        renderCategoryPage();

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Intenta ajustando o limpiando los filtros')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /ordenar/i })).not.toBeInTheDocument();
    });

    it('renders populated leaf category products and sort controls', () => {
        useProductsMock.mockReturnValue({
            data: [
                makeProduct({ id: 'product-a', name: 'Alpha Pod', price: 200 }),
                makeProduct({ id: 'product-b', name: 'Beta Pod', price: 100 }),
            ],
            isLoading: false,
        });

        renderCategoryPage();

        expect(screen.getByTestId('product-grid')).toHaveAttribute('data-loading', 'false');
        expect(screen.getByText('Alpha Pod')).toBeInTheDocument();
        expect(screen.getByText('Beta Pod')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ordenar/i })).toBeInTheDocument();
        expect(screen.getByTestId('filter-sidebar')).toHaveTextContent('2 filter products');
    });

    it('renders child category cards instead of ProductGrid when category has children', () => {
        useCategoriesMock.mockReturnValue({
            data: [
                makeCategory({ id: 'category-1', name: 'Pods' }),
                makeCategory({ id: 'child-a', name: 'Desechables', parent_id: 'category-1' }),
                makeCategory({ id: 'child-b', name: 'Recargables', parent_id: 'category-1' }),
            ],
            isLoading: false,
        });

        renderCategoryPage();

        expect(screen.getAllByTestId('category-card')).toHaveLength(2);
        expect(screen.getByText('Desechables')).toBeInTheDocument();
        expect(screen.getByText('Recargables')).toBeInTheDocument();
        expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument();
        expect(useProductsMock).toHaveBeenCalledWith({ section: 'vape', categoryId: undefined });
    });

    it('renders the not-found visible state after category loading completes without data', () => {
        useCategoryBySlugMock.mockReturnValue({
            data: null,
            isLoading: false,
            error: null,
        });

        renderCategoryPage('/420/categoria/herbal');

        expect(screen.getByRole('heading', { name: 'Categoría no encontrada' })).toBeInTheDocument();
        expect(screen.getByText(/La categor.a "herbal" no existe/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ir al inicio/ })).toHaveAttribute('href', '/');
    });
});
