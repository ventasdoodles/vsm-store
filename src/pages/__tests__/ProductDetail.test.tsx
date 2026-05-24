import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductDetail } from '../ProductDetail';
import type { Product } from '@/types/product';
import type { Section } from '@/types/constants';

const useProductBySlugMock = vi.hoisted(() => vi.fn());
const useSectionFromPathMock = vi.hoisted(() => vi.fn());
const trackViewItemMock = vi.hoisted(() => vi.fn());

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
    useProductBySlug: (...args: unknown[]) => useProductBySlugMock(...args),
}));

vi.mock('@/hooks/useSectionFromPath', () => ({
    useSectionFromPath: () => useSectionFromPathMock(),
}));

vi.mock('@/lib/analytics', () => ({
    trackViewItem: (...args: unknown[]) => trackViewItemMock(...args),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({
        title,
        description,
        image,
        type,
    }: {
        title?: string;
        description?: string;
        image?: string;
        type?: string;
    }) => (
        <div
            data-testid="seo"
            data-title={title}
            data-description={description}
            data-image={image}
            data-type={type}
        />
    ),
}));

vi.mock('@/components/seo/ProductJsonLd', () => ({
    ProductJsonLd: ({ product }: { product: Product }) => (
        <script data-testid="product-json-ld" data-product-name={product.name} />
    ),
}));

vi.mock('@/components/ui/SectionErrorBoundary', () => ({
    SectionErrorBoundary: ({
        children,
        name,
        resetKey,
    }: {
        children: ReactNode;
        name: string;
        resetKey?: string;
    }) => (
        <section data-testid={`boundary-${name}`} data-reset-key={resetKey}>
            {children}
        </section>
    ),
}));

vi.mock('@/components/products/ProductSkeleton', () => ({
    ProductSkeleton: () => <div data-testid="product-skeleton">Loading product</div>,
}));

vi.mock('@/components/products/ProductBreadcrumbs', () => ({
    ProductBreadcrumbs: ({
        section,
        productName,
        productSlug,
        categoryId,
    }: {
        section: Section;
        productName: string;
        productSlug: string;
        categoryId: string | null;
    }) => (
        <nav
            data-testid="product-breadcrumbs"
            data-section={section}
            data-product-slug={productSlug}
            data-category-id={categoryId ?? ''}
        >
            {productName}
        </nav>
    ),
}));

vi.mock('@/components/products/ProductImages', () => ({
    ProductImages: ({
        images,
        coverImage,
        productName,
    }: {
        images: string[];
        coverImage: string | null;
        productName: string;
    }) => (
        <div data-testid="product-images" data-cover-image={coverImage ?? ''}>
            {productName}:{images.join(',')}
        </div>
    ),
}));

vi.mock('@/components/products/ProductInfo', () => ({
    ProductInfo: ({ product }: { product: Product }) => (
        <article data-testid="product-info">{product.name}</article>
    ),
}));

vi.mock('@/components/home/TrustBadges', () => ({
    TrustBadges: () => <div data-testid="trust-badges" />,
}));

vi.mock('@/components/home/SocialProof', () => ({
    SocialProof: ({
        section,
        productId,
        variant,
        limit,
    }: {
        section: Section;
        productId: string;
        variant: string;
        limit: number;
    }) => (
        <div
            data-testid="social-proof"
            data-section={section}
            data-product-id={productId}
            data-variant={variant}
            data-limit={String(limit)}
        />
    ),
}));

vi.mock('@/components/products/FrequentlyBoughtTogether', () => ({
    FrequentlyBoughtTogether: ({ currentProduct }: { currentProduct: Product }) => (
        <div data-testid="frequently-bought-together">{currentProduct.slug}</div>
    ),
}));

vi.mock('@/components/products/RelatedProducts', () => ({
    RelatedProducts: ({ product }: { product: Product }) => (
        <div data-testid="related-products">{product.slug}</div>
    ),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: overrides.id ?? 'product-1',
        name: overrides.name ?? 'Alpha Pod',
        slug: overrides.slug ?? 'alpha-pod',
        description: overrides.description ?? 'Descripcion completa de Alpha Pod.',
        short_description: overrides.short_description ?? 'Resumen de Alpha Pod.',
        price: overrides.price ?? 850,
        compare_at_price: overrides.compare_at_price ?? 1000,
        stock: overrides.stock ?? 6,
        sku: overrides.sku ?? 'ALPHA-POD',
        section: overrides.section ?? 'vape',
        category_id: overrides.category_id ?? 'category-1',
        tags: overrides.tags ?? ['pods'],
        status: overrides.status ?? 'active',
        images: overrides.images ?? ['/alpha-1.webp', '/alpha-2.webp'],
        cover_image: overrides.cover_image ?? '/alpha-cover.webp',
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

function renderProductDetail(path = '/vape/alpha-pod') {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/:section/:slug" element={<ProductDetail />} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('ProductDetail visible states', () => {
    beforeEach(() => {
        useProductBySlugMock.mockReset();
        useSectionFromPathMock.mockReset();
        trackViewItemMock.mockReset();
        useSectionFromPathMock.mockReturnValue('vape');
        useProductBySlugMock.mockReturnValue({
            data: makeProduct(),
            isLoading: false,
            error: null,
        });
    });

    it('passes route slug and section into useProductBySlug', () => {
        useSectionFromPathMock.mockReturnValue('420');

        renderProductDetail('/420/herbal-flower');

        expect(useProductBySlugMock).toHaveBeenCalledWith('herbal-flower', '420');
    });

    it('wires loading state to ProductSkeleton', () => {
        useProductBySlugMock.mockReturnValue({ data: null, isLoading: true, error: null });

        renderProductDetail();

        expect(screen.getByTestId('product-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId('seo')).not.toBeInTheDocument();
    });

    it('renders not-found copy and home link when no product is returned', () => {
        useProductBySlugMock.mockReturnValue({ data: null, isLoading: false, error: null });

        renderProductDetail();

        expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument();
        expect(screen.getByText('El producto que buscas no existe o ya no está disponible.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Volver al inicio/ })).toHaveAttribute('href', '/');
    });

    it('renders error copy and home link when product loading fails', () => {
        useProductBySlugMock.mockReturnValue({ data: null, isLoading: false, error: new Error('boom') });

        renderProductDetail();

        expect(screen.getByRole('heading', { name: 'Error al cargar producto' })).toBeInTheDocument();
        expect(screen.getByText('Hubo un problema al obtener la información del producto.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Volver al inicio/ })).toHaveAttribute('href', '/');
    });

    it('wires populated product SEO and structured data', () => {
        renderProductDetail();

        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', 'Alpha Pod');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-description', 'Resumen de Alpha Pod.');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-image', '/alpha-cover.webp');
        expect(screen.getByTestId('seo')).toHaveAttribute('data-type', 'product');
        expect(screen.getByTestId('product-json-ld')).toHaveAttribute('data-product-name', 'Alpha Pod');
    });

    it('wires populated product into detail child components', () => {
        renderProductDetail();

        expect(screen.getByTestId('product-breadcrumbs')).toHaveAttribute('data-section', 'vape');
        expect(screen.getByTestId('product-breadcrumbs')).toHaveAttribute('data-product-slug', 'alpha-pod');
        expect(screen.getByTestId('product-breadcrumbs')).toHaveAttribute('data-category-id', 'category-1');
        expect(screen.getByTestId('product-images')).toHaveAttribute('data-cover-image', '/alpha-cover.webp');
        expect(screen.getByTestId('product-images')).toHaveTextContent('Alpha Pod:/alpha-1.webp,/alpha-2.webp');
        expect(screen.getByTestId('product-info')).toHaveTextContent('Alpha Pod');
        expect(screen.getByTestId('trust-badges')).toBeInTheDocument();
        expect(screen.getByTestId('social-proof')).toHaveAttribute('data-section', 'vape');
        expect(screen.getByTestId('social-proof')).toHaveAttribute('data-product-id', 'product-1');
        expect(screen.getByTestId('social-proof')).toHaveAttribute('data-variant', 'compact');
        expect(screen.getByTestId('social-proof')).toHaveAttribute('data-limit', '3');
        expect(screen.getByTestId('frequently-bought-together')).toHaveTextContent('alpha-pod');
        expect(screen.getByTestId('related-products')).toHaveTextContent('alpha-pod');
    });
});
