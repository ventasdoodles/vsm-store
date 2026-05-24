import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Contact } from '../Contact';
import { SITE_CONFIG } from '@/config/site';

const notifySuccessMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: notifySuccessMock,
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn(),
    }),
}));

vi.mock('@/components/seo/SEO', () => ({
    SEO: ({ title, description }: { title?: string; description?: string }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    ),
}));

const openMock = vi.fn();

describe('Contact page visible states', () => {
    beforeEach(() => {
        notifySuccessMock.mockReset();
        openMock.mockReset();
        vi.stubGlobal('open', openMock);
    });

    it('renders the contact heading, support copy, info cards, and form fields', () => {
        render(<Contact />);

        expect(screen.getByRole('heading', { name: /Cont.ctanos/i })).toBeInTheDocument();
        expect(screen.getByText(/Tienes alguna pregunta/i)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'WhatsApp' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Ubicaci.n/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Horario' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Env.anos un Mensaje/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Tel.fono/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Tu consulta/i)).toBeInTheDocument();
    });

    it('wires SEO metadata from SITE_CONFIG', () => {
        render(<Contact />);

        expect(screen.getByTestId('seo')).toHaveAttribute('data-title', `Contacto | ${SITE_CONFIG.name}`);
        expect(screen.getByTestId('seo')).toHaveAttribute(
            'data-description',
            expect.stringContaining(SITE_CONFIG.location.city),
        );
    });

    it('renders WhatsApp and location links with the expected hrefs', () => {
        render(<Contact />);

        expect(screen.getByRole('link', { name: /Conectar ahora/i })).toHaveAttribute(
            'href',
            `https://wa.me/${SITE_CONFIG.whatsapp.number}`,
        );
        expect(screen.getByRole('link', { name: /Ver en Google Maps/i })).toHaveAttribute(
            'href',
            SITE_CONFIG.location.googleMapsUrl,
        );
    });

    it('submits a valid form through a WhatsApp URL and shows success notification', async () => {
        render(<Contact />);

        fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
            target: { value: 'Cliente VSM' },
        });
        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'cliente@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Tel.fono/i), {
            target: { value: '2281234567' },
        });
        fireEvent.change(screen.getByLabelText(/Tu consulta/i), {
            target: { value: 'Quiero revisar disponibilidad de productos.' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Enviar mensaje por WhatsApp/i }));

        await waitFor(() => {
            expect(openMock).toHaveBeenCalledTimes(1);
        });

        const [url, target, features] = openMock.mock.calls[0]!;
        expect(url).toContain(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=`);
        expect(url).toContain(encodeURIComponent('Cliente VSM'));
        expect(url).toContain(encodeURIComponent('cliente@example.com'));
        expect(url).toContain(encodeURIComponent('2281234567'));
        expect(url).toContain(encodeURIComponent('Quiero revisar disponibilidad de productos.'));
        expect(target).toBe('_blank');
        expect(features).toBe('noopener,noreferrer');
        expect(notifySuccessMock).toHaveBeenCalledWith('Redirigiendo', 'Abriendo WhatsApp...');
    });

    it('prevents empty submission and does not open WhatsApp', async () => {
        render(<Contact />);

        fireEvent.click(screen.getByRole('button', { name: /Enviar mensaje por WhatsApp/i }));

        await waitFor(() => {
            expect(screen.getByText(/El nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
        });
        expect(openMock).not.toHaveBeenCalled();
        expect(notifySuccessMock).not.toHaveBeenCalled();
    });
});
