import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileInfo } from '../ProfileInfo';
import { ProfileQuickLinks } from '../ProfileQuickLinks';

const useAuthMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => useAuthMock(),
}));

describe('Profile account trust copy', () => {
    it('uses calm account navigation wording in quick links', () => {
        render(
            <MemoryRouter>
                <ProfileQuickLinks />
            </MemoryRouter>,
        );

        expect(screen.getByText('Accesos de cuenta')).toBeInTheDocument();
        expect(screen.getByText('Productos guardados')).toBeInTheDocument();
        expect(screen.getByText('Historial y estado')).toBeInTheDocument();
        expect(screen.getByText('Direcciones de entrega')).toBeInTheDocument();
        expect(screen.getByText('Puntos y beneficios')).toBeInTheDocument();
        expect(screen.getByText('Resumen de cuenta')).toBeInTheDocument();
        expect(screen.getByText('Notificaciones de cuenta')).toBeInTheDocument();

        expect(screen.queryByText(/Accesos Cr.ticos/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Objetos de deseo')).not.toBeInTheDocument();
        expect(screen.queryByText(/Historial y bit.cora/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Notificaciones cr.ticas/i)).not.toBeInTheDocument();
    });

    it('uses plain contact labels in profile info', () => {
        useAuthMock.mockReturnValue({
            user: { email: 'cliente@vsm.test' },
            profile: {
                phone: '2281234567',
                whatsapp: '2287654321',
                created_at: '2026-05-01T00:00:00.000Z',
            },
        });

        render(<ProfileInfo />);

        expect(screen.getByText('Información de contacto')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Teléfono')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp')).toBeInTheDocument();
        expect(screen.getByText('cliente@vsm.test')).toBeInTheDocument();

        expect(screen.queryByText(/Bit.cora de Identidad/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Email Codificado')).not.toBeInTheDocument();
        expect(screen.queryByText(/L.nea de Voz/i)).not.toBeInTheDocument();
        expect(screen.queryByText('Protocolo WhatsApp')).not.toBeInTheDocument();
    });
});
