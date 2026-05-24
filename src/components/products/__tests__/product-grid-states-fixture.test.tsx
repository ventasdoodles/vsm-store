import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProductGridStatesFixture } from '@/pages/ProductGridStatesFixture';
import {
    makeProductGridStateFixture,
    makeProductGridStateFixtures,
} from '../productGridStatesFixture';

vi.mock('@/components/products/ProductCard', () => ({
    ProductCard: ({ product }: { product: { name: string; slug: string; section: string } }) => (
        <article>
            <a href={`/${product.section}/${product.slug}`}>{product.name}</a>
        </article>
    ),
}));

vi.mock('@/contexts/TacticalContext', () => ({
    TacticalProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderFixture() {
    return render(
        <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
            <ProductGridStatesFixture />
        </MemoryRouter>,
    );
}

describe('ProductGrid states visual fixture', () => {
    it('builds deterministic local ProductGrid fixture products', () => {
        expect(makeProductGridStateFixture()).toMatchObject({
            id: 'grid-fixture-product-1',
            name: 'Producto grid fixture',
            section: 'vape',
            slug: 'producto-grid-fixture',
        });
        expect(makeProductGridStateFixtures()).toHaveLength(3);
    });

    it('renders loading, empty, and populated ProductGrid states for local visual QA', () => {
        const { container } = renderFixture();

        expect(screen.getByRole('heading', { name: 'ProductGrid states fixture' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Loading state' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Empty state' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Populated state' })).toBeInTheDocument();

        expect(
            screen.getByTestId('product-grid-loading-state').querySelectorAll('.skeleton-shimmer'),
        ).toHaveLength(32);
        expect(screen.getByRole('status')).toHaveTextContent('Catalogo en rotacion');
        expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/buscar');

        expect(screen.getByRole('link', { name: 'Producto grid fixture' })).toHaveAttribute(
            'href',
            '/vape/producto-grid-fixture',
        );
        expect(screen.getByRole('link', { name: 'Producto grid herbal' })).toHaveAttribute(
            'href',
            '/420/producto-grid-herbal',
        );
        expect(screen.getByRole('link', { name: 'Producto grid premium' })).toBeInTheDocument();
        expect(container).toHaveTextContent('Fixture local para validar el panel sin productos.');
    });
});
