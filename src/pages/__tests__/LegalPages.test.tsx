import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { TestRouter } from '@/lib/test-router';
import { describe, expect, it, vi } from 'vitest';
import { Privacy } from '../legal/Privacy';
import { Terms } from '../legal/Terms';

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({ title, description }: { title?: string; description?: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    ),
}));

function renderWithRouter(ui: ReactElement) {
    return render(<TestRouter>{ui}</TestRouter>);
}

describe('Legal pages visible states', () => {
    it('wires Privacy SEO and renders primary visible sections', () => {
        renderWithRouter(<Privacy />);

        expect(screen.getByTestId('seo').getAttribute('data-title')).toMatch(/Privacidad/);
        expect(screen.getByTestId('seo').getAttribute('data-description')).toMatch(/VSM Store/);
        expect(screen.getByRole('heading', { name: /Privacidad/, level: 1 })).toBeInTheDocument();
        expect(screen.getByText(/Febrero 2026/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '1. Responsable del Tratamiento de Datos' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '6. Derechos ARCO' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '12. Contacto' })).toBeInTheDocument();
    });

    it('renders Privacy internal navigation links', () => {
        renderWithRouter(<Privacy />);

        expect(screen.getByRole('link', { name: /Volver al inicio/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: 'Mi Cuenta' })).toHaveAttribute('href', '/profile');
        expect(screen.getAllByRole('link', { name: /contacto/i }).map((link) => link.getAttribute('href'))).toEqual([
            '/contact',
            '/contact',
        ]);
    });

    it('wires Terms SEO and renders primary visible sections', () => {
        renderWithRouter(<Terms />);

        expect(screen.getByTestId('seo').getAttribute('data-title')).toMatch(/Condiciones/);
        expect(screen.getByTestId('seo').getAttribute('data-description')).toMatch(/VSM Store/);
        expect(screen.getByRole('heading', { name: /Condiciones/, level: 1 })).toBeInTheDocument();
        expect(screen.getByText(/Febrero 2026/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /1\. Aceptaci.n de T.rminos/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '11. Privacidad' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '14. Contacto' })).toBeInTheDocument();
    });

    it('renders Terms internal navigation links', () => {
        renderWithRouter(<Terms />);

        expect(screen.getByRole('link', { name: /Volver al inicio/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('link', { name: /Privacidad/ })).toHaveAttribute(
            'href',
            '/legal/privacy',
        );
        expect(screen.getByRole('link', { name: /Formulario de contacto/i })).toHaveAttribute('href', '/contact');
    });
});
