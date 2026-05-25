import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { vape420VerticalPackConfig } from '@/config/productization';
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
            expect(screen.getAllByRole('heading', { name: section.label }).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(section.description).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(section.routePrefix).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(`${section.routePrefix}/:slug`).length).toBeGreaterThanOrEqual(1);
        }
        expect(screen.getAllByText('Local products available')).toHaveLength(secondVerticalProofConfig.sections.length);

        const packIdentity = screen.getByRole('region', { name: 'Pack identity' });
        const packTaxonomy = screen.getByRole('region', { name: 'Pack taxonomy' });
        const packRouteManifest = screen.getByRole('region', { name: 'Pack route manifest' });
        const sectionSimulation = screen.getByRole('region', { name: 'Local section route simulation' });

        expect(packIdentity).toBeInTheDocument();
        expect(packTaxonomy).toBeInTheDocument();
        expect(packRouteManifest).toBeInTheDocument();
        expect(sectionSimulation).toBeInTheDocument();
        expect(within(packIdentity).getByText('Second Vertical Proof')).toBeInTheDocument();
        expect(within(packIdentity).getByText('Demo Families')).toBeInTheDocument();
        expect(within(packIdentity).getByText('Modular Organizer')).toBeInTheDocument();
        expect(within(packTaxonomy).getByText('Category hint: Organizers / demo-home / organizers')).toBeInTheDocument();
        expect(
            within(packTaxonomy).getByText(
                'Attribute hint: demo-home / organizers: Material, Capacity, Finish',
            ),
        ).toBeInTheDocument();
        expect(within(sectionSimulation).getByRole('heading', { name: 'Demo Home' })).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Section slug: demo-home')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Local products: 1')).toBeInTheDocument();
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

    it('shows diagnostics for what the selected preview proves and does not prove', () => {
        renderFixture('/__qa/second-vertical-proof');

        const diagnostics = screen.getByRole('region', { name: 'Preview diagnostics' });

        expect(diagnostics).toBeInTheDocument();
        expect(screen.getByText('What this proves')).toBeInTheDocument();
        expect(screen.getByText('What this does not prove')).toBeInTheDocument();
        expect(
            within(diagnostics).getByText('Local preview selection from the dev-only QA surface'),
        ).toBeInTheDocument();
        expect(
            within(diagnostics).getByText(
                'Production routing or generalized vertical switching',
            ),
        ).toBeInTheDocument();
    });

    it('switches to the Vape/420 preview pack via a local query param', () => {
        renderFixture('/__qa/second-vertical-proof?preview=vape-420-preview');

        expect(
            screen.getByRole('heading', {
                name: vape420VerticalPackConfig.marketing.homeHero.primaryCopy.title,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText(vape420VerticalPackConfig.marketing.homeHero.primaryCopy.description)).toBeInTheDocument();
        expect(screen.getByText('Selected preview: Vape/420 Preview')).toBeInTheDocument();

        for (const section of vape420VerticalPackConfig.sections) {
            expect(screen.getAllByRole('heading', { name: section.label }).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(section.description).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(section.routePrefix).length).toBeGreaterThanOrEqual(1);
            expect(screen.getAllByText(`${section.routePrefix}/:slug`).length).toBeGreaterThanOrEqual(1);
        }
        expect(screen.getAllByText('No local products available')).toHaveLength(
            vape420VerticalPackConfig.sections.length,
        );

        const packRouteManifest = screen.getByRole('region', { name: 'Pack route manifest' });
        expect(within(packRouteManifest).getByText('Root: /vape')).toBeInTheDocument();
        expect(within(packRouteManifest).getByText('Pattern: /vape/:slug')).toBeInTheDocument();
        expect(within(packRouteManifest).getByText('Root: /420')).toBeInTheDocument();
        expect(within(packRouteManifest).getByText('Pattern: /420/:slug')).toBeInTheDocument();

        expect(screen.getByText('No local product list available for this preview.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Second vertical proof' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Vape/420 preview' })).toBeInTheDocument();
    });

    it('simulates selected section routes from the selected preview model', () => {
        renderFixture('/__qa/second-vertical-proof?section=demo-studio');

        const sectionSimulation = screen.getByRole('region', { name: 'Local section route simulation' });

        expect(within(sectionSimulation).getByRole('heading', { name: 'Demo Studio' })).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Section slug: demo-studio')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Root route: /__qa/second-vertical-proof/demo-studio')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Slug route: /__qa/second-vertical-proof/demo-studio/:slug')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Local products: 1')).toBeInTheDocument();
    });

    it('simulates section routes for the Vape/420 preview without local products', () => {
        renderFixture('/__qa/second-vertical-proof?preview=vape-420-preview&section=420');

        const sectionSimulation = screen.getByRole('region', { name: 'Local section route simulation' });

        expect(within(sectionSimulation).getByRole('heading', { name: '420 Zone' })).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Section slug: 420')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Root route: /420')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Slug route: /420/:slug')).toBeInTheDocument();
        expect(within(sectionSimulation).getByText('Local products: 0')).toBeInTheDocument();
        expect(screen.getByText('No local product list available for this preview.')).toBeInTheDocument();
    });

    it('falls back to the default second vertical proof preview when the query is invalid', () => {
        renderFixture('/__qa/second-vertical-proof?preview=unknown-preview');

        expect(
            screen.getByRole('heading', {
                name: secondVerticalProofConfig.marketing.homeHero.primaryCopy.title,
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('Selected preview: Second Vertical Proof')).toBeInTheDocument();
        expect(
            screen.getByText('Local preview selection from the dev-only QA surface'),
        ).toBeInTheDocument();
        expect(screen.getAllByText('Local products available')).toHaveLength(
            secondVerticalProofConfig.sections.length,
        );
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
