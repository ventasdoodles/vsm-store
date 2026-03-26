import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenRecoverableOrderNotice } from '../OpenRecoverableOrderNotice';

const continuePaymentMock = vi.fn();
const navigateMock = vi.fn();
const useStorefrontPaymentReentryMock = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/hooks/useStorefrontPaymentReentry', () => ({
    useStorefrontPaymentReentry: () => useStorefrontPaymentReentryMock(),
}));

describe('OpenRecoverableOrderNotice', () => {
    const order = {
        id: 'order-open-1',
        order_number: 'VSM-OPEN-1',
        total: 250,
    };

    const view = {
        shouldRecover: true,
        headline: 'Ya existe una orden en progreso',
        detail: 'Tu pedido sigue pagable en Mercado Pago.',
        primaryCtaLabel: 'Continuar pago en Mercado Pago',
        secondaryCtaLabel: 'Ver pedido y revisar pago',
        sidebarActionLabel: 'Retomar orden abierta',
        submitBlockedDetail: 'Ya existe una orden pendiente y pagable para esta cuenta.',
    };

    beforeEach(() => {
        continuePaymentMock.mockReset();
        navigateMock.mockReset();
        useStorefrontPaymentReentryMock.mockReset();
        useStorefrontPaymentReentryMock.mockReturnValue({
            continuePayment: continuePaymentMock,
            continuingOrderId: null,
        });
    });

    it('renders bounded recovery CTAs and delegates continuation through the shared handler', () => {
        render(
            <MemoryRouter>
                <OpenRecoverableOrderNotice order={order as never} view={view} />
            </MemoryRouter>,
        );

        fireEvent.click(screen.getByRole('button', { name: /Continuar pago en Mercado Pago/i }));
        fireEvent.click(screen.getByRole('button', { name: /Ver pedido y revisar pago/i }));

        expect(continuePaymentMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'order-open-1' }));
        expect(navigateMock).toHaveBeenCalledWith('/orders/order-open-1');
    });

    it('shows loading copy while the shared handler is continuing the same order', () => {
        useStorefrontPaymentReentryMock.mockReturnValue({
            continuePayment: continuePaymentMock,
            continuingOrderId: 'order-open-1',
        });

        render(
            <MemoryRouter>
                <OpenRecoverableOrderNotice order={order as never} view={view} />
            </MemoryRouter>,
        );

        expect(screen.getByRole('button', { name: /Abriendo Mercado Pago/i })).toBeDisabled();
    });
});
