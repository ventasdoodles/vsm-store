import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { buildAdminSectionCatalog } from '@/config/productization';
import type { Testimonial } from '@/types/testimonial';
import { TestimonialAdminCard } from '../TestimonialAdminCard';

const catalog = buildAdminSectionCatalog();

function makeTestimonial(section: Testimonial['section']): Testimonial {
    return {
        id: `${section ?? 'general'}-testimonial`,
        customer_name: 'Persona de prueba',
        customer_location: 'CDMX',
        avatar_url: null,
        rating: 5,
        title: 'Muy bueno',
        body: 'Texto de prueba',
        section,
        category_id: null,
        product_id: null,
        verified_purchase: true,
        is_featured: false,
        is_active: true,
        sort_order: 1,
        review_date: '2026-05-25T00:00:00.000Z',
        created_at: '2026-05-25T00:00:00.000Z',
        updated_at: '2026-05-25T00:00:00.000Z',
    };
}

describe('TestimonialAdminCard', () => {
    it.each([
        ['vape' as const],
        ['420' as const],
    ])('renders the shared catalog badge for section %s', (section) => {
        const testimonial = makeTestimonial(section);
        const catalogEntry = catalog.bySlug[section];

        render(
            <TestimonialAdminCard
                testimonial={testimonial}
                onEdit={() => {}}
                onDuplicate={() => {}}
                onDelete={() => {}}
                onToggleFeatured={() => {}}
                onToggleActive={() => {}}
            />,
        );

        expect(screen.getByText(catalogEntry.shortLabel)).toHaveClass(catalogEntry.badgeClassName);
    });
});
