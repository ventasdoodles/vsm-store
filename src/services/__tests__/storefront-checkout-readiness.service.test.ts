import { beforeEach, describe, expect, it, vi } from 'vitest';

const cartStateMock = vi.hoisted(() => ({
  items: [] as any[],
}));

const getProductsByIdsMock = vi.hoisted(() => vi.fn(async () => []) as any);
const getStoreSettingsMock = vi.hoisted(() => vi.fn(async () => null) as any);
const getAddressesMock = vi.hoisted(() => vi.fn(async () => []) as any);
const getCustomerOpenRecoverableOrderMock = vi.hoisted(() => vi.fn(async () => null) as any);
const validateCouponMock = vi.hoisted(() => vi.fn(async () => ({ valid: false, discount: 0, message: 'noop' })) as any);

vi.mock('@/stores/cart.store', () => ({
  useCartStore: {
    getState: () => cartStateMock,
  },
}));

vi.mock('@/services/products.service', () => ({
  getProductsByIds: (...args: any[]) => getProductsByIdsMock(...args),
}));

vi.mock('@/services/settings.service', () => ({
  getStoreSettings: (...args: any[]) => getStoreSettingsMock(...args),
}));

vi.mock('@/services/addresses.service', () => ({
  getAddresses: (...args: any[]) => getAddressesMock(...args),
}));

vi.mock('@/services/orders.service', () => ({
  getCustomerOpenRecoverableOrder: (...args: any[]) => getCustomerOpenRecoverableOrderMock(...args),
}));

vi.mock('@/services/coupons.service', () => ({
  validateCoupon: (...args: any[]) => validateCouponMock(...args),
}));

import { resolveStorefrontCheckoutReadiness } from '../storefront-checkout-readiness.service';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    slug: 'nova-pod',
    section: 'vape',
    name: 'Nova Pod',
    description: null,
    short_description: null,
    price: 299,
    compare_at_price: null,
    stock: 8,
    sku: null,
    category_id: 'cat-1',
    tags: [],
    status: 'active',
    images: [],
    cover_image: null,
    is_featured: false,
    is_featured_until: null,
    is_new: false,
    is_new_until: null,
    is_bestseller: false,
    is_bestseller_until: null,
    is_active: true,
    created_at: '2026-04-01T00:00:00.000Z',
    updated_at: '2026-04-01T00:00:00.000Z',
    specs: {},
    badges: [],
    ai_is_featured: false,
    ai_sales_note: null,
    ai_exclude: false,
    variants: [],
    ...overrides,
  } as any;
}

describe('resolveStorefrontCheckoutReadiness', () => {
  beforeEach(() => {
    cartStateMock.items = [];
    getProductsByIdsMock.mockReset();
    getStoreSettingsMock.mockReset();
    getAddressesMock.mockReset();
    getCustomerOpenRecoverableOrderMock.mockReset();
    validateCouponMock.mockReset();

    getProductsByIdsMock.mockResolvedValue([]);
    getStoreSettingsMock.mockResolvedValue({
      payment_methods: {
        transfer: true,
        mercadopago: true,
        cash: true,
      },
    });
    getAddressesMock.mockResolvedValue([]);
    getCustomerOpenRecoverableOrderMock.mockResolvedValue(null);
    validateCouponMock.mockResolvedValue({
      valid: false,
      discount: 0,
      message: 'noop',
    });
    window.sessionStorage.clear();
  });

  it('returns READY_TO_CHECKOUT when the cart and checkout draft are already grounded and ready', async () => {
    const product = makeProduct();
    cartStateMock.items = [
      {
        product,
        quantity: 2,
        variant_id: null,
        variant_name: null,
      },
    ];
    getProductsByIdsMock.mockResolvedValue([product]);
    window.sessionStorage.setItem('vsm_checkout_form', JSON.stringify({
      customerName: 'Juan Perez',
      customerPhone: '7441234567',
      deliveryType: 'pickup',
      address: '',
      paymentMethod: 'transfer',
    }));

    const resolution = await resolveStorefrontCheckoutReadiness({
      customerId: 'customer-1',
      query: 'ya puedo pagar?',
    });

    expect(resolution.kind).toBe('READY_TO_CHECKOUT');
    expect(resolution.matchStrategy).toBe('READY_TO_CHECKOUT');
    expect(resolution.retrievalSource).toBe('CART_VALIDATION');
    expect(resolution.signal.can_submit_checkout).toBe(true);
    expect(resolution.signal.checkout_status).toBe('ready');
    expect(resolution.message).toContain('listo para pasar a checkout');
  });

  it('returns CART_BLOCKER when an authenticated open Mercado Pago order should be recovered first', async () => {
    const product = makeProduct();
    cartStateMock.items = [
      {
        product,
        quantity: 1,
        variant_id: null,
        variant_name: null,
      },
    ];
    getProductsByIdsMock.mockResolvedValue([product]);
    window.sessionStorage.setItem('vsm_checkout_form', JSON.stringify({
      customerName: 'Juan Perez',
      customerPhone: '7441234567',
      deliveryType: 'pickup',
      address: '',
      paymentMethod: 'mercadopago',
    }));
    getCustomerOpenRecoverableOrderMock.mockResolvedValue({
      id: 'order-1',
      order_number: 'VSM-123',
      customer_id: 'customer-1',
      items: [{ product_id: 'product-1', name: 'Nova Pod', price: 299, quantity: 1 }],
      subtotal: 299,
      shipping_cost: 0,
      discount: 0,
      total: 299,
      status: 'pending',
      payment_method: 'mercadopago',
      payment_status: 'pending',
      shipping_address_id: null,
      billing_address_id: null,
      tracking_notes: null,
      whatsapp_sent: false,
      whatsapp_sent_at: null,
      created_at: '2026-04-02T00:00:00.000Z',
      updated_at: '2026-04-02T00:00:00.000Z',
    });

    const resolution = await resolveStorefrontCheckoutReadiness({
      customerId: 'customer-1',
      query: 'ya puedo pagar?',
    });

    expect(resolution.kind).toBe('CART_BLOCKER');
    expect(resolution.retrievalSource).toBe('AUTHENTICATED_ORDER_RECOVERY');
    expect(resolution.signal.blocker_reason).toBe('open_recoverable_order');
    expect(resolution.signal.open_order_number).toBe('VSM-123');
    expect(resolution.message).toContain('Ya existe una orden pendiente');
  });

  it('returns PAYMENT_METHOD_INFO for payment questions without opening a cart blocker path', async () => {
    getStoreSettingsMock.mockResolvedValue({
      payment_methods: {
        transfer: true,
        mercadopago: true,
        cash: false,
      },
    });

    const resolution = await resolveStorefrontCheckoutReadiness({
      customerId: null,
      query: 'aceptan tarjeta?',
    });

    expect(resolution.kind).toBe('PAYMENT_METHOD_INFO');
    expect(resolution.retrievalSource).toBe('STORE_PAYMENT_SETTINGS');
    expect(resolution.signal.enabled_payment_methods).toEqual(['transfer', 'mercadopago']);
    expect(resolution.message).toContain('Mercado Pago');
    expect(resolution.message).toContain('entrando a tu cuenta');
  });

  it('returns SHIPPING_INFO_PARTIAL when only delivery requirements are grounded but no shipping quote exists', async () => {
    window.sessionStorage.setItem('vsm_checkout_form', JSON.stringify({
      customerName: 'Juan Perez',
      customerPhone: '7441234567',
      deliveryType: 'delivery',
      address: 'Av Costera 123',
      paymentMethod: 'transfer',
    }));

    const resolution = await resolveStorefrontCheckoutReadiness({
      customerId: 'customer-1',
      query: 'cuanto sale el envio?',
    });

    expect(resolution.kind).toBe('SHIPPING_INFO_PARTIAL');
    expect(resolution.signal.shipping_quote_available).toBe(false);
    expect(resolution.message).toContain('No te voy a inventar una tarifa exacta');
  });
});
