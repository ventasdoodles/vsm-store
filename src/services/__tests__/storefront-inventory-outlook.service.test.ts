import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Product } from '@/types/product';

const queryState = vi.hoisted(() => ({
  phraseData: [] as Product[],
  tokenData: [] as Product[],
}));

const getStockPredictionMock = vi.hoisted(() => vi.fn<any>());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      const state = { mode: 'phrase' as 'phrase' | 'token' };
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        or: vi.fn((filter: string) => {
          state.mode = filter.includes('sku.ilike') && filter.includes('%') && filter.split(',').length > 3
            ? 'token'
            : 'phrase';
          return builder;
        }),
        limit: vi.fn(() => Promise.resolve({
          data: state.mode === 'phrase' ? queryState.phraseData : queryState.tokenData,
          error: null,
        })),
      };

      return builder;
    }),
  },
}));

vi.mock('@/services/inventory.service', () => ({
  inventoryService: {
    getStockPrediction: (...args: unknown[]) => (getStockPredictionMock as any)(...args),
  },
}));

import { resolveStorefrontInventoryOutlook } from '../storefront-inventory-outlook.service';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Caliburn G3',
    slug: 'caliburn-g3',
    description: 'Pod refillable',
    short_description: 'Pod refillable',
    price: 499,
    compare_at_price: null,
    stock: 12,
    sku: 'CAL-G3',
    section: 'vape',
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
  };
}

describe('resolveStorefrontInventoryOutlook', () => {
  beforeEach(() => {
    queryState.phraseData = [];
    queryState.tokenData = [];
    getStockPredictionMock.mockReset();
    getStockPredictionMock.mockResolvedValue(null);
  });

  it('returns grounded online stock and secondary outlook when the product is available online', async () => {
    queryState.phraseData = [makeProduct()];
    getStockPredictionMock.mockResolvedValue({
      daysUntilOut: 6,
      depletionDate: '2026-04-09',
      customerMessage: '',
      adminRecommendation: '',
      urgencyLevel: 'medium',
    });

    const resolution = await resolveStorefrontInventoryOutlook({
      query: 'todavia hay stock del caliburn g3?',
    });

    expect(resolution.kind).toBe('IN_STOCK_ONLINE');
    expect(resolution.retrievalSource).toBe('CATALOG_ONLINE_STOCK');
    expect(resolution.signal.current_stock).toBe(12);
    expect(resolution.signal.days_until_out).toBe(6);
    expect(resolution.message).toContain('disponible en linea');
    expect(resolution.message).toContain('6 dias');
  });

  it('surfaces bounded omnichannel truth only when explicit store availability exists in current product truth', async () => {
    queryState.phraseData = [makeProduct({
      stock: 0,
      specs: {
        pickup_available: 'true',
      },
    })];

    const resolution = await resolveStorefrontInventoryOutlook({
      query: 'hay en sucursal el caliburn g3?',
    });

    expect(resolution.kind).toBe('IN_STOCK_OMNICHANNEL');
    expect(resolution.retrievalSource).toBe('CATALOG_OMNICHANNEL_STOCK');
    expect(resolution.signal.stock_basis).toBe('store_only');
    expect(resolution.signal.omnichannel_label).toContain('pickup en tienda');
    expect(resolution.message).toContain('No lo veo con stock online');
    expect(resolution.message).toContain('disponibilidad omnicanal');
  });

  it('returns a bounded restock state only when a persisted ETA exists', async () => {
    queryState.phraseData = [makeProduct({
      stock: 0,
      specs: {
        restock_eta: '2026-04-10',
      },
    })];

    const resolution = await resolveStorefrontInventoryOutlook({
      query: 'cuando regresa el caliburn g3?',
    });

    expect(resolution.kind).toBe('RESTOCK_EXPECTED');
    expect(resolution.retrievalSource).toBe('CATALOG_RESTOCK_TRUTH');
    expect(resolution.signal.restock_eta).toBe('2026-04-10');
    expect(resolution.message).toContain('2026-04-10');
    expect(resolution.message).toContain('no como promesa exacta');
  });

  it('degrades honestly when it cannot resolve a current product from the query', async () => {
    queryState.phraseData = [];
    queryState.tokenData = [];

    const resolution = await resolveStorefrontInventoryOutlook({
      query: 'hay stock del modelo raro que no existe?',
    });

    expect(resolution.kind).toBe('PRODUCT_NOT_FOUND');
    expect(resolution.retrievalSource).toBe('NONE');
    expect(resolution.resolvedProducts).toEqual([]);
    expect(resolution.message).toContain('No pude ubicar un producto actual');
  });
});
