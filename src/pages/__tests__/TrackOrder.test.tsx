import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackOrder } from '../TrackOrder';
import type { TrackingInfo } from '@/types/order';

const mutateMock = vi.hoisted(() => vi.fn());
const useOrderTrackingMock = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useOrders', () => ({
    useOrderTracking: () => useOrderTrackingMock(),
}));

function makeTrackingInfo(overrides: Partial<TrackingInfo> = {}): TrackingInfo {
    return {
        trackingNumber: overrides.trackingNumber ?? 'DHL1234567890',
        status: overrides.status ?? 'in_transit',
        statusText: overrides.statusText ?? 'En transito',
        estimatedDelivery: overrides.estimatedDelivery ?? '2026-05-28T12:00:00.000Z',
        carrier: overrides.carrier ?? 'DHL Express',
        events: overrides.events ?? [
            {
                id: 'event-1',
                date: '2026-05-24T16:30:00.000Z',
                status: 'Paquete en ruta',
                location: 'Centro DHL Mexico',
                isCompleted: true,
            },
            {
                id: 'event-2',
                date: '2026-05-23T09:15:00.000Z',
                status: 'Guia creada',
                location: 'VSM Store',
                isCompleted: true,
            },
        ],
        ...overrides,
    };
}

describe('TrackOrder visible states', () => {
    beforeEach(() => {
        mutateMock.mockReset();
        useOrderTrackingMock.mockReset();
        useOrderTrackingMock.mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            error: null,
            data: undefined,
        });
    });

    it('renders initial copy, guide input, disabled submit, and helper copy', () => {
        render(<TrackOrder />);

        expect(screen.getByRole('heading', { name: /Rastrea tu Pedido/i })).toBeInTheDocument();
        expect(screen.getByText(/Ingresa tu n.mero de gu.a/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ej. 1234567890')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Rastrear Env.o/i })).toBeDisabled();
        expect(screen.getByText(/Todos nuestros env.os se realizan/i)).toBeInTheDocument();
        expect(screen.getByText(/DHL Express/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /perfil/i })).toHaveAttribute('href', '/profile');
    });

    it('submits a trimmed tracking number into the tracking mutation', () => {
        render(<TrackOrder />);

        fireEvent.change(screen.getByPlaceholderText('Ej. 1234567890'), {
            target: { value: '  DHL-TRACK-001  ' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear Env.o/i }));

        expect(mutateMock).toHaveBeenCalledTimes(1);
        expect(mutateMock).toHaveBeenCalledWith('DHL-TRACK-001');
    });

    it('disables submit and shows loading copy while tracking is pending', () => {
        useOrderTrackingMock.mockReturnValue({
            mutate: mutateMock,
            isPending: true,
            error: null,
            data: undefined,
        });

        render(<TrackOrder />);

        fireEvent.change(screen.getByPlaceholderText('Ej. 1234567890'), {
            target: { value: 'DHL-TRACK-001' },
        });

        expect(screen.getByRole('button', { name: /Buscando/i })).toBeDisabled();
    });

    it('renders mutation error copy', () => {
        useOrderTrackingMock.mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            error: new Error('No encontramos esa guia'),
            data: undefined,
        });

        render(<TrackOrder />);

        expect(screen.getByText('No encontramos esa guia')).toBeInTheDocument();
    });

    it('renders populated tracking summary, estimated delivery, and event timeline', () => {
        useOrderTrackingMock.mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            error: null,
            data: makeTrackingInfo(),
        });

        render(<TrackOrder />);

        expect(screen.getAllByText('DHL Express')).toHaveLength(2);
        expect(screen.getByRole('heading', { name: 'DHL1234567890' })).toBeInTheDocument();
        expect(screen.getByText('En transito')).toBeInTheDocument();
        expect(screen.getByText('Entrega Estimada')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Historial del Env.o/i })).toBeInTheDocument();
        expect(screen.getByText('Paquete en ruta')).toBeInTheDocument();
        expect(screen.getByText('Centro DHL Mexico')).toBeInTheDocument();
        expect(screen.getByText('Guia creada')).toBeInTheDocument();
        expect(screen.getByText('VSM Store')).toBeInTheDocument();
    });

    it('renders demo banner when status text includes Demo', () => {
        useOrderTrackingMock.mockReturnValue({
            mutate: mutateMock,
            isPending: false,
            error: null,
            data: makeTrackingInfo({
                status: 'pending',
                statusText: 'Demo pendiente',
                estimatedDelivery: null,
            }),
        });

        render(<TrackOrder />);

        expect(screen.getByText(/Modo demostraci.n/i)).toBeInTheDocument();
        expect(screen.getByText(/Configura tu API Key de DHL/i)).toBeInTheDocument();
        expect(screen.getByText('docs/MANUAL_RASTREO_DHL.md')).toBeInTheDocument();
    });
});
