import { beforeEach, describe, expect, it, vi } from 'vitest';

const cartStateMock = vi.hoisted(() => ({
  items: [] as any[],
}));

const getProductsBySearchMock = vi.hoisted(() => vi.fn(async () => []) as any);
const getProductsMock = vi.hoisted(() => vi.fn(async () => []) as any);
const getProductsByIdsMock = vi.hoisted(() => vi.fn(async () => []) as any);
const resolveStorefrontPromotionSignalMock = vi.hoisted(() => vi.fn(async () => null) as any);

vi.mock('@/stores/cart.store', () => ({
  useCartStore: {
    getState: () => cartStateMock,
  },
}));

vi.mock('@/services/products.service', () => ({
  getProductsBySearch: (...args: any[]) => getProductsBySearchMock(...args),
  getProducts: (...args: any[]) => getProductsMock(...args),
  getProductsByIds: (...args: any[]) => getProductsByIdsMock(...args),
}));

vi.mock('@/services/storefront-promotions.service', () => ({
  resolveStorefrontPromotionSignal: (...args: any[]) => resolveStorefrontPromotionSignalMock(...args),
}));

import { resolveStorefrontBudgetRescue } from '../storefront-budget-rescue.service';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    slug: 'caliburn-g3',
    section: 'vape',
    name: 'Caliburn G3',
    description: 'Pod refillable',
    short_description: 'Pod refillable',
    price: 499,
    compare_at_price: null,
    stock: 12,
    sku: null,
    category_id: 'cat-1',
    tags: ['pod', 'caliburn'],
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
    ai_sales_note: 'pod refillable',
    ai_exclude: false,
    variants: [],
    ...overrides,
  } as any;
}

describe('resolveStorefrontBudgetRescue', () => {
  beforeEach(() => {
    cartStateMock.items = [];
    getProductsBySearchMock.mockReset();
    getProductsMock.mockReset();
    getProductsByIdsMock.mockReset();
    resolveStorefrontPromotionSignalMock.mockReset();
    resolveStorefrontPromotionSignalMock.mockResolvedValue(null);
  });

  it('returns grounded cheaper alternatives when the current anchor has real trade-downs in stock', async () => {
    const anchor = makeProduct();
    const cheaper = makeProduct({
      id: 'product-2',
      slug: 'caliburn-ak3',
      name: 'Caliburn AK3',
      price: 399,
      stock: 8,
    });
    const secondCheaper = makeProduct({
      id: 'product-3',
      slug: 'caliburn-a2s',
      name: 'Caliburn A2S',
      price: 359,
      stock: 10,
    });

    getProductsBySearchMock.mockResolvedValue([anchor]);
    getProductsMock.mockResolvedValue([anchor, cheaper, secondCheaper]);

    const resolution = await resolveStorefrontBudgetRescue({
      query: 'algo parecido pero mas barato al caliburn g3',
    });

    expect(resolution.kind).toBe('CHEAPER_ALTERNATIVE_FOUND');
    expect(resolution.retrievalSource).toBe('CATALOG_ANCHORED_PRODUCT');
    expect(resolution.signal.anchor_product?.slug).toBe('caliburn-g3');
    expect(resolution.signal.cheaper_product?.slug).toBe('caliburn-ak3');
    expect(resolution.resolvedProducts).toHaveLength(2);
    expect(resolution.message).toContain('bajar gasto');
  });

  it('surfaces promo-already-best-value when the current option already has grounded value truth', async () => {
    const anchor = makeProduct({
      compare_at_price: 599,
    });

    getProductsBySearchMock.mockResolvedValue([anchor]);
    getProductsMock.mockResolvedValue([anchor]);

    const resolution = await resolveStorefrontBudgetRescue({
      query: 'otra opcion mas barata que el caliburn g3',
    });

    expect(resolution.kind).toBe('PROMO_ALREADY_BEST_VALUE');
    expect(resolution.resolvedProducts[0]?.slug).toBe('caliburn-g3');
    expect(resolution.message).toContain('valor real');
  });

  it('uses single-cart-item context when the user asks generically to spend less', async () => {
    const anchor = makeProduct();
    const cheaper = makeProduct({
      id: 'product-2',
      slug: 'caliburn-ak3',
      name: 'Caliburn AK3',
      price: 399,
      stock: 8,
    });

    cartStateMock.items = [
      {
        product: anchor,
        quantity: 1,
        variant_id: null,
        variant_name: null,
      },
    ];
    getProductsByIdsMock.mockResolvedValue([anchor]);
    getProductsMock.mockResolvedValue([anchor, cheaper]);

    const resolution = await resolveStorefrontBudgetRescue({
      query: 'algo mas barato',
    });

    expect(resolution.kind).toBe('CHEAPER_ALTERNATIVE_FOUND');
    expect(resolution.retrievalSource).toBe('CART_CONTEXT');
    expect(resolution.signal.used_cart_context).toBe(true);
  });

  it('degrades to review-current-option when the turn has no safe anchor and the cart has multiple items', async () => {
    cartStateMock.items = [
      { product: makeProduct(), quantity: 1, variant_id: null, variant_name: null },
      { product: makeProduct({ id: 'product-9', slug: 'nova-pro', name: 'Nova Pro' }), quantity: 1, variant_id: null, variant_name: null },
    ];

    const resolution = await resolveStorefrontBudgetRescue({
      query: 'algo mas barato',
    });

    expect(resolution.kind).toBe('REVIEW_CURRENT_OPTION');
    expect(resolution.retrievalSource).toBe('COMPARE_CONTEXT');
    expect(resolution.resolvedProducts).toEqual([]);
    expect(resolution.message).toContain('carrito');
  });

  it('returns no-good-trade-down when the anchor is real but no cheaper grounded substitute exists', async () => {
    const anchor = makeProduct();

    getProductsBySearchMock.mockResolvedValue([anchor]);
    getProductsMock.mockResolvedValue([anchor]);

    const resolution = await resolveStorefrontBudgetRescue({
      query: 'algo parecido pero mas barato al caliburn g3',
    });

    expect(resolution.kind).toBe('NO_GOOD_TRADE_DOWN');
    expect(resolution.retrievalSource).toBe('CATALOG_ANCHORED_PRODUCT');
    expect(resolution.signal.anchor_product?.slug).toBe('caliburn-g3');
    expect(resolution.resolvedProducts).toEqual([]);
    expect(resolution.message).toContain('sin forzar equivalencias');
  });
});
