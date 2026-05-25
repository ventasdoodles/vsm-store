import { render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryShowcase } from '../CategoryShowcase';

const useStoreSettingsMock = vi.hoisted(() => vi.fn());

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
    useMotionValue: () => ({ set: vi.fn() }),
    useMotionTemplate: () => '',
}));

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => useStoreSettingsMock(),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

function renderShowcase() {
    return render(
        <MemoryRouter>
            <CategoryShowcase />
        </MemoryRouter>,
    );
}

describe('CategoryShowcase storefront fallback alignment', () => {
    beforeEach(() => {
        useStoreSettingsMock.mockReset();
    });

    it('renders the centralized storefront category fallback when settings are empty', () => {
        useStoreSettingsMock.mockReturnValue({ data: null });

        renderShowcase();

        expect(screen.getByText('Explora Categorías')).toBeInTheDocument();
        expect(screen.getByText('Líquidos')).toBeInTheDocument();
        expect(screen.getByText('Pods & Mods')).toBeInTheDocument();
        expect(screen.getByText('Cannabis Premium')).toBeInTheDocument();
        expect(screen.getByText('Accesorios')).toBeInTheDocument();
    });

    it('prefers saved featured categories from store settings over the fallback', () => {
        useStoreSettingsMock.mockReturnValue({
            data: {
                featured_categories: [
                    {
                        id: 'custom-1',
                        name: 'Custom Vape',
                        slug: 'custom-vape',
                        section: 'vape',
                        iconName: 'Flame',
                        image: '',
                        presetId: 'orange-red',
                    },
                    {
                        id: 'custom-2',
                        name: 'Custom 420',
                        slug: 'custom-420',
                        section: '420',
                        iconName: 'Leaf',
                        image: '',
                        presetId: 'green-emerald',
                    },
                    {
                        id: 'custom-3',
                        name: 'Custom One',
                        slug: 'custom-one',
                        section: 'vape',
                        iconName: 'Box',
                        image: '',
                        presetId: 'blue-purple',
                    },
                    {
                        id: 'custom-4',
                        name: 'Custom Two',
                        slug: 'custom-two',
                        section: '420',
                        iconName: 'Zap',
                        image: '',
                        presetId: 'yellow-orange',
                    },
                ],
            },
        });

        renderShowcase();

        expect(screen.getByText('Custom Vape')).toBeInTheDocument();
        expect(screen.getByText('Custom 420')).toBeInTheDocument();
        expect(screen.getByText('Custom One')).toBeInTheDocument();
        expect(screen.getByText('Custom Two')).toBeInTheDocument();
        expect(screen.queryByText('Líquidos')).not.toBeInTheDocument();
        expect(screen.queryByText('Pods & Mods')).not.toBeInTheDocument();
    });
});
