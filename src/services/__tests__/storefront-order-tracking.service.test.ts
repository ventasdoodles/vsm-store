import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCustomerOrdersMock = vi.hoisted(() => vi.fn<any>());

vi.mock('@/services/orders.service', () => ({
  getCustomerOrders: (...args: unknown[]) => (getCustomerOrdersMock as any)(...args),
}));

import {
  getStorefrontOrderTrackingTrustView,
  resolveStorefrontAuthenticatedOrderTracking,
} from '../storefront-order-tracking.service';

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    order_number: 'VSM-321',
    customer_id: 'customer-1',
    items: [],
    subtotal: 100,
    shipping_cost: 0,
    discount: 0,
    total: 100,
    status: 'processing',
    payment_method: 'mercadopago',
    payment_status: 'paid',
    shipping_address_id: null,
    billing_address_id: null,
    tracking_number: 'TRACK-123',
    tracking_notes: 'https://carrier.example/track/TRACK-123',
    whatsapp_sent: false,
    whatsapp_sent_at: null,
    created_at: '2026-04-01T00:00:00.000Z',
    updated_at: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('resolveStorefrontAuthenticatedOrderTracking', () => {
  beforeEach(() => {
    getCustomerOrdersMock.mockReset();
  });

  it('requires authentication before exposing private order truth', async () => {
    const resolution = await resolveStorefrontAuthenticatedOrderTracking({
      customerId: null,
      query: 'ya paso mi pago?',
    });

    expect(resolution.kind).toBe('AUTH_REQUIRED');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.message).toContain('necesito que entres a tu cuenta');
  });

  it('returns bounded explicit-order not-found truth when the referenced order is not in the recent authenticated set', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({ order_number: 'VSM-321' }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedOrderTracking({
      customerId: 'customer-1',
      query: 'donde va mi pedido VSM-999?',
    });

    expect(resolution.kind).toBe('ORDER_NOT_FOUND');
    expect(resolution.matchStrategy).toBe('ORDER_NOT_FOUND');
    expect(resolution.message).toContain('VSM-999');
  });

  it('selects an authenticated active order and returns persisted payment truth', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({
        id: 'order-processing',
        order_number: 'VSM-321',
        status: 'processing',
        payment_status: 'paid',
      }),
      makeOrder({
        id: 'order-delivered',
        order_number: 'VSM-320',
        status: 'delivered',
        payment_status: 'paid',
        created_at: '2026-03-20T00:00:00.000Z',
      }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedOrderTracking({
      customerId: 'customer-1',
      query: 'ya paso mi pago?',
    });

    expect(resolution.kind).toBe('FOUND');
    expect(resolution.retrievalSource).toBe('AUTHENTICATED_ACTIVE_ORDER');
    expect(resolution.signal.order_number).toBe('VSM-321');
    expect(resolution.signal.payment_status).toBe('paid');
    expect(resolution.message).toContain('Pago confirmado');
  });

  it('answers tracking honestly when there is no persisted guide yet', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({
        status: 'confirmed',
        tracking_number: null,
        tracking_notes: null,
      }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedOrderTracking({
      customerId: 'customer-1',
      query: 'tengo numero de guia?',
    });

    expect(resolution.kind).toBe('FOUND');
    expect(resolution.signal.tracking_number).toBeNull();
    expect(resolution.message).toContain('Todavia no veo numero de guia persistido');
  });
});

describe('getStorefrontOrderTrackingTrustView', () => {
  it('frames processing orders without tracking as preparation, not shipped or delivered', () => {
    const view = getStorefrontOrderTrackingTrustView(makeOrder({
      status: 'processing',
      tracking_number: null,
      tracking_notes: null,
    }));

    expect(view.showPanel).toBe(true);
    expect(view.headline).toBe('Pedido en preparacion');
    expect(view.detail).toContain('aun no figura como enviado');
    expect(view.showTrackingNumber).toBe(false);
    expect(view.canCopyTrackingNumber).toBe(false);
  });

  it('exposes shipped orders with a persisted tracking number as a copyable guide reference', () => {
    const view = getStorefrontOrderTrackingTrustView(makeOrder({
      status: 'shipped',
      tracking_number: 'TRACK-123',
      tracking_notes: 'https://carrier.example/track/TRACK-123',
    }));

    expect(view.headline).toBe('Pedido enviado con guia registrada');
    expect(view.trackingNumber).toBe('TRACK-123');
    expect(view.showTrackingNumber).toBe(true);
    expect(view.canCopyTrackingNumber).toBe(true);
    expect(view.showTrackingNotes).toBe(true);
  });

  it('keeps shipped orders without tracking from showing fake tracking availability', () => {
    const view = getStorefrontOrderTrackingTrustView(makeOrder({
      status: 'shipped',
      tracking_number: null,
      tracking_notes: null,
    }));

    expect(view.subtitle).toBe('Guia pendiente');
    expect(view.headline).toBe('Pedido enviado sin guia visible');
    expect(view.detail).toContain('no hay una guia persistida visible');
    expect(view.showTrackingNumber).toBe(false);
    expect(view.canCopyTrackingNumber).toBe(false);
  });

  it('frames delivered orders as closed without requiring recovery actions', () => {
    const view = getStorefrontOrderTrackingTrustView(makeOrder({
      status: 'delivered',
      tracking_number: null,
      tracking_notes: null,
    }));

    expect(view.title).toBe('Seguimiento cerrado');
    expect(view.headline).toBe('Pedido marcado como entregado');
    expect(view.detail).toContain('figura como entregado');
    expect(view.canCopyTrackingNumber).toBe(false);
  });

  it('prevents cancelled orders from exposing stale shipment continuation', () => {
    const view = getStorefrontOrderTrackingTrustView(makeOrder({
      status: 'cancelled',
      tracking_number: 'STALE-123',
      tracking_notes: 'Old carrier note',
    }));

    expect(view.title).toBe('Seguimiento cerrado');
    expect(view.headline).toBe('Sin continuidad de envio');
    expect(view.trackingNumber).toBeNull();
    expect(view.trackingNotes).toBeNull();
    expect(view.showTrackingNumber).toBe(false);
    expect(view.showTrackingNotes).toBe(false);
  });
});
