import { createElement, forwardRef, type PropsWithChildren, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getAdminSectionCatalogEntry, vape420VerticalPackConfig } from '@/config/productization';
import { VerticalPackContext } from '@/contexts/VerticalPackContext';
import type { Product } from '@/types/product';
import { ProductTableRow } from '../ProductTableRow';

vi.mock('framer-motion', () => {
    const MotionElement =
        (Tag: keyof JSX.IntrinsicElements) =>
            forwardRef<HTMLElement, PropsWithChildren<Record<string, unknown>>>(({
                children,
                initial: _initial,
                animate: _animate,
                exit: _exit,
                transition: _transition,
                whileHover: _whileHover,
                whileTap: _whileTap,
                ...props
            }, ref) => createElement(Tag, { ...props, ref }, children as ReactNode));

    return {
        motion: new Proxy({}, {
            get: (_target, tag: string) => MotionElement(tag as keyof JSX.IntrinsicElements),
        }),
        useMotionValue: () => ({ set: vi.fn() }),
        useMotionTemplate: () => '',
    };
});

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt = '', className = '' }: { alt?: string; className?: string }) => (
        <img alt={alt} className={className} src="/stub-image.webp" />
    ),
}));

function makeProduct(section: Product['section']): Product {
    return {
        id: `${section}-product`,
        name: `${section.toUpperCase()} Product`,
        slug: `${section}-product`,
        description: null,
        short_description: null,
        price: 1200,
        compare_at_price: null,
        stock: 8,
        sku: `${section}-sku`,
        section,
        category_id: 'category-1',
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
        created_at: '2026-05-25T00:00:00.000Z',
        updated_at: '2026-05-25T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
    };
}

describe('ProductTableRow', () => {
    it.each([
        ['vape' as const],
        ['420' as const],
    ])('uses the shared catalog metadata for section %s', (section) => {
        const product = makeProduct(section);
        const catalogEntry = getAdminSectionCatalogEntry(section, vape420VerticalPackConfig);

        render(
            <VerticalPackContext.Provider value={{ config: vape420VerticalPackConfig, isLoading: false }}>
                <table>
                    <tbody>
                    <ProductTableRow
                        product={product}
                        onToggle={vi.fn()}
                        onDelete={vi.fn()}
                        onQuickSave={vi.fn()}
                        onEdit={vi.fn()}
                        onDuplicate={vi.fn()}
                        isSelected={false}
                        onSelect={vi.fn()}
                    />
                    </tbody>
                </table>
            </VerticalPackContext.Provider>,
        );

        expect(screen.getByText(catalogEntry?.shortLabel ?? section)).toHaveClass(
            catalogEntry?.badgeClassName ?? '',
        );
        expect(screen.getByRole('link', { name: 'Ver en tienda' })).toHaveAttribute(
            'href',
            `${catalogEntry?.routePrefix ?? `/${section}`}/${product.slug}`,
        );
    });
});
