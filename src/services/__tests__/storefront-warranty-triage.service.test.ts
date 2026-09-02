import { beforeEach, describe, expect, it, vi } from 'vitest';

const getCustomerOrdersMock = vi.hoisted(() => vi.fn<any>());

vi.mock('@/services/orders.service', () => ({
  getCustomerOrders: (...args: unknown[]) => (getCustomerOrdersMock as any)(...args),
}));

import { resolveStorefrontAuthenticatedWarrantyTriage } from '../storefront-warranty-triage.service';

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'order-1',
    order_number: 'VSM-321',
    customer_id: 'customer-1',
    items: [
      {
        product_id: 'product-1',
        variant_id: 'variant-1',
        variant_name: 'Blue Mint',
        name: 'Vaporesso XROS 4',
        price: 100,
        quantity: 1,
        image: null,
        section: 'vape',
      },
    ],
    subtotal: 100,
    shipping_cost: 0,
    discount: 0,
    total: 100,
    status: 'delivered',
    payment_method: 'mercadopago',
    payment_status: 'paid',
    shipping_address_id: null,
    billing_address_id: null,
    tracking_number: null,
    tracking_notes: null,
    whatsapp_sent: false,
    whatsapp_sent_at: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    ...overrides,
  };
}

describe('resolveStorefrontAuthenticatedWarrantyTriage', () => {
  beforeEach(() => {
    getCustomerOrdersMock.mockReset();
  });

  it('requires authentication before exposing contextual warranty triage', async () => {
    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: null,
      query: 'mi vape no prende',
    });

    expect(resolution.kind).toBe('AUTH_REQUIRED');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.message).toContain('necesito que entres a tu cuenta');
  });

  it('binds a recent delivered single-item order to a likely eligible defect triage response', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder(),
    ]);

    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: 'customer-1',
      query: 'mi vaporesso no prende',
    });

    expect(resolution.kind).toBe('LIKELY_ELIGIBLE');
    expect(resolution.retrievalSource).toBe('AUTHENTICATED_RECENT_ORDER');
    expect(resolution.signal.matched_item_name).toBe('Vaporesso XROS 4');
    expect(resolution.message).toContain('Vaporesso XROS 4');
  });

  it('marks an identified old fulfilled order as out of policy for bounded triage', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({
        created_at: '2025-11-01T00:00:00.000Z',
        updated_at: '2025-11-01T00:00:00.000Z',
      }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: 'customer-1',
      query: 'mi vaporesso no sirve',
    });

    expect(resolution.kind).toBe('OUT_OF_POLICY');
    expect(resolution.signal.policy_window_days).toBe(90);
    expect(resolution.message).toContain('ventana reciente');
  });

  it('degrades honestly when it cannot identify the complained product inside a multi-item recent order', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({
        items: [
          {
            product_id: 'product-1',
            variant_id: 'variant-1',
            variant_name: 'Blue Mint',
            name: 'Vaporesso XROS 4',
            price: 100,
            quantity: 1,
            image: null,
            section: 'vape',
          },
          {
            product_id: 'product-2',
            variant_id: 'variant-2',
            variant_name: 'Strawberry Ice',
            name: 'OXBAR Pod',
            price: 90,
            quantity: 1,
            image: null,
            section: 'vape',
          },
        ],
      }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: 'customer-1',
      query: 'me llego roto',
    });

    expect(resolution.kind).toBe('CANNOT_IDENTIFY_PRODUCT');
    expect(resolution.message).toContain('no puedo asegurar cual articulo es');
  });

  it('degrades honestly when there is no relevant recent fulfilled order to bind', async () => {
    getCustomerOrdersMock.mockResolvedValue([
      makeOrder({
        status: 'processing',
      }),
    ]);

    const resolution = await resolveStorefrontAuthenticatedWarrantyTriage({
      customerId: 'customer-1',
      query: 'mi vape no sirve',
    });

    expect(resolution.kind).toBe('NO_RELEVANT_ORDER');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.message).toContain('No veo pedidos recientes');
  });
});
