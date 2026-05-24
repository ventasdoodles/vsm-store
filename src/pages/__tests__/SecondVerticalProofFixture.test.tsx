import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { secondVerticalProofConfig, secondVerticalProofProducts } from '@/config/productization/secondVerticalProof';
import { SecondVerticalProofFixture } from '../SecondVerticalProofFixture';

describe('SecondVerticalProofFixture', () => {
    it('renders a local non-Vape/420 vertical proof from productization config', () => {
        render(<SecondVerticalProofFixture />);

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

        expect(screen.getByRole('region', { name: 'Proof categories' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Proof products' })).toBeInTheDocument();

        for (const product of secondVerticalProofProducts) {
            expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
            expect(screen.getByText(product.shortDescription)).toBeInTheDocument();
            expect(screen.getByText(product.priceLabel)).toBeInTheDocument();
        }
    });
});
