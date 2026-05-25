import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MegaHero } from '../MegaHero';

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
    AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
    useMotionValue: () => ({ set: vi.fn() }),
    useSpring: (value: unknown) => value,
    useTransform: () => '',
}));

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => useStoreSettingsMock(),
}));

vi.mock('@/hooks/useNeuralHero', () => ({
    useNeuralHero: () => ({ personalizedSlide: null }),
}));

vi.mock('@/components/ui/MagneticButton', () => ({
    MagneticButton: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

function renderHero() {
    return render(
        <MemoryRouter>
            <MegaHero />
        </MemoryRouter>,
    );
}

describe('MegaHero national shipping copy', () => {
    beforeEach(() => {
        useStoreSettingsMock.mockReset();
    });

    it('normalizes stale city-specific settings copy in the visible Home hero', () => {
        useStoreSettingsMock.mockReturnValue({
            data: {
                hero_sliders: [
                    {
                        id: 'stale-city-slide',
                        title: 'Los Mejores Vapes',
                        subtitle: '20% OFF en tu primera compra + envío gratis en Xalapa',
                        description: 'Promos locales en Acapulco',
                        image: '',
                        ctaText: 'Compra Ahora',
                        ctaLink: '/vape',
                        bgGradientLight: 'from-violet-500 via-fuchsia-500 to-purple-600',
                        active: true,
                        order: 1,
                    },
                ],
            },
        });

        renderHero();

        expect(screen.getByText('Vapes y 420')).toBeInTheDocument();
        expect(screen.getByText('seleccionados')).toBeInTheDocument();
        expect(screen.getByText('Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.')).toBeInTheDocument();
        expect(screen.queryByText(/Xalapa|envío gratis en/i)).not.toBeInTheDocument();
    });

    it('uses the centralized storefront settings fallback for the local home hero', () => {
        useStoreSettingsMock.mockReturnValue({ data: null });

        renderHero();

        expect(screen.getByText('Vapes y 420')).toBeInTheDocument();
        expect(screen.getByText('seleccionados')).toBeInTheDocument();
        expect(screen.getByText('Envíos Nacionales')).toBeInTheDocument();
        expect(screen.queryByText(/Xalapa|envío gratis en/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Slide 2'));
        expect(screen.getByText('Productos Premium 420')).toBeInTheDocument();
        expect(screen.getByText('Explorar 420')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Slide 3'));
        expect(screen.getByText('Más de 50 Sabores')).toBeInTheDocument();
        expect(screen.getByText('Ver Líquidos')).toBeInTheDocument();
    });
});
