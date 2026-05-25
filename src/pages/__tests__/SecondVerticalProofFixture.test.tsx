import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { secondVerticalProofConfig, secondVerticalProofProducts } from '@/config/productization/secondVerticalProof';
import { SecondVerticalProofFixture } from '../SecondVerticalProofFixture';

function renderFixture(pathname = '/__qa/second-vertical-proof') {
    return render(
        <MemoryRouter initialEntries={[pathname]}>
            <SecondVerticalProofFixture />
        </MemoryRouter>,
    );
}

describe('SecondVerticalProofFixture', () => {
    it('renders a local non-Vape/420 vertical proof from the selected preview pack', () => {
        renderFixture('/__qa/second-vertical-proof');

        expect(
            screen.getByRole('heading', {
                name: secondVerticalProofConfig.marketing.homeHero.primaryCopy.title,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText(secondVerticalProofConfig.marketing.homeHero.primaryCopy.description)).toBeInTheDocument();

        for (const section of secondVerticalProofConfig.sections) {
            expect(screen.getByRole('heading', { name: section.label })).toBeInTheDocument();
            expect(screen.getByText(section.description)).toBeInTheDocument();
            expect(screen.getByText(section.routePrefix)).toBeInTheDocument();
        }

        const packIdentity = screen.getByRole('region', { name: 'Pack identity' });
        const packTaxonomy = screen.getByRole('region', { name: 'Pack taxonomy' });
        const packRouteManifest = screen.getByRole('region', { name: 'Pack route manifest' });

        expect(packIdentity).toBeInTheDocument();
        expect(packTaxonomy).toBeInTheDocument();
        expect(packRouteManifest).toBeInTheDocument();
        expect(within(packIdentity).getByText('Second Vertical Proof')).toBeInTheDocument();
        expect(within(packIdentity).getByText('Demo Families')).toBeInTheDocument();
        expect(within(packIdentity).getByText('Modular Organizer')).toBeInTheDocument();
        expect(within(packTaxonomy).getByText('Category hint: Organizers / demo-home / organizers')).toBeInTheDocument();
        expect(
            within(packTaxonomy).getByText(
                'Attribute hint: demo-home / organizers: Material, Capacity, Finish',
            ),
        ).toBeInTheDocument();
        expect(within(packRouteManifest).getByText('Root: /__qa/second-vertical-proof/demo-home')).toBeInTheDocument();
        expect(within(packRouteManifest).getByText('Pattern: /__qa/second-vertical-proof/demo-home/:slug')).toBeInTheDocument();

        expect(screen.getByRole('region', { name: 'Proof categories' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Proof products' })).toBeInTheDocument();

        for (const product of secondVerticalProofProducts) {
            expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
            expect(screen.getByText(product.shortDescription)).toBeInTheDocument();
            expect(screen.getByText(product.priceLabel)).toBeInTheDocument();
        }
    });

    it('renders the same preview state for nested proof routes under the selected route prefix', () => {
        renderFixture('/__qa/second-vertical-proof/demo-home');

        expect(
            screen.getByRole('heading', {
                name: secondVerticalProofConfig.marketing.homeHero.primaryCopy.title,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('/__qa/second-vertical-proof/demo-home')).toBeInTheDocument();
    });
});
