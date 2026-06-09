import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { buildAdminSectionCatalog } from '@/config/productization';
import { TestimonialsStats } from '../TestimonialsStats';

import { getStorefrontSettingsFallback } from '@/config/storefrontSettingsFallback';

describe('TestimonialsStats', () => {
    it('renders section metrics from the shared admin section catalog', () => {
        const catalog = buildAdminSectionCatalog(getStorefrontSettingsFallback().vertical_pack_config!);
        const sectionCounts = {
            vape: 11,
            '420': 7,
        };

        render(
            <TestimonialsStats
                stats={{
                    total: 30,
                    active: 22,
                    featured: 9,
                    avgRating: '4.8',
                }}
                sectionCounts={sectionCounts}
            />,
        );

        expect(screen.getByText('Total')).toBeInTheDocument();
        expect(screen.getByText(catalog.sections[0]?.displayLabel ?? 'Vape')).toBeInTheDocument();
        expect(screen.getByText(catalog.sections[1]?.displayLabel ?? '420')).toBeInTheDocument();
        expect(screen.getByText('11')).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });
});
