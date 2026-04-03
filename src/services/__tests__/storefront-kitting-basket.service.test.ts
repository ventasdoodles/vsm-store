import { beforeEach, describe, expect, it, vi } from 'vitest';

const getProductsMock = vi.fn<any>();
const resolveStorefrontAttachmentOffersMock = vi.fn<any>();

vi.mock('@/services/products.service', () => ({
  getProducts: (...args: unknown[]) => (getProductsMock as any)(args[0]),
}));

vi.mock('@/services/storefront-attachments.service', () => ({
  resolveStorefrontAttachmentOffers: (...args: unknown[]) => (resolveStorefrontAttachmentOffersMock as any)(args[0]),
}));

import { resolveStorefrontKittingBasket } from '../storefront-kitting-basket.service';

function makeProduct(overrides: Record<string, unknown>) {
  return {
    id: 'product-1',
    name: 'Nova Pod Kit',
    slug: 'nova-pod-kit',
    description: null,
    short_description: null,
    price: 599,
    compare_at_price: null,
    stock: 10,
    sku: null,
    section: 'vape',
    category_id: 'cat-1',
    tags: ['kit'],
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
    created_at: '2026-03-01T00:00:00.000Z',
    updated_at: '2026-03-01T00:00:00.000Z',
    specs: {},
    badges: [],
    ai_is_featured: false,
    ai_sales_note: null,
    ai_exclude: false,
    variants: [],
    ...overrides,
  } as any;
}

describe('storefront kitting basket service', () => {
  beforeEach(() => {
    getProductsMock.mockReset();
    resolveStorefrontAttachmentOffersMock.mockReset();
  });

  it('assembles a full bounded kit when compatible in-stock base, consumable, and liquid all exist', async () => {
    const base = makeProduct({ id: 'base-1', name: 'Nova Pod Kit', slug: 'nova-pod-kit', tags: ['kit', 'pod'] });
    const pod = makeProduct({ id: 'pod-1', name: 'Nova Pod', slug: 'nova-pod', price: 199, tags: ['pod'] });
    const liquid = makeProduct({ id: 'liquid-1', name: 'Mango Ice 5%', slug: 'mango-ice-5', price: 169, tags: ['liquid'] });

    getProductsMock.mockResolvedValue([base, pod, liquid]);
    resolveStorefrontAttachmentOffersMock.mockResolvedValue([
      {
        primary_product_id: 'base-1',
        relation_type: 'uses_pod',
        scope: 'specific_model',
        rationale: 'pod compatible',
        attached_product: { id: 'pod-1', name: 'Nova Pod', slug: 'nova-pod', section: 'vape' },
      },
      {
        primary_product_id: 'base-1',
        relation_type: 'uses_liquid',
        scope: 'specific_model',
        rationale: 'liquido compatible',
        attached_product: { id: 'liquid-1', name: 'Mango Ice 5%', slug: 'mango-ice-5', section: 'vape' },
      },
    ]);

    const result = await resolveStorefrontKittingBasket({
      query: 'armame un kit con pods y liquido al 5%',
      flavor_preference: 'mango',
      nicotine_preference: '5%',
      format_preference: 'pods',
      upgrade_intent: true,
      wants_device: true,
      wants_consumable: true,
      wants_liquid: true,
    });

    expect(result.execution_status).toBe('SUCCESS');
    expect(result.match_strategy).toBe('FULL_KIT');
    expect(result.resolved_products?.map((product) => product.id)).toEqual(['base-1', 'pod-1', 'liquid-1']);
    expect(result.kitting_signal.kind).toBe('FULL_KIT');
    expect(result.kitting_signal.kit_size).toBe(3);
    expect(result.kitting_signal.base_product?.id).toBe('base-1');
    expect(result.kitting_signal.consumable_product?.id).toBe('pod-1');
    expect(result.kitting_signal.liquid_product?.id).toBe('liquid-1');
  });

  it('degrades honestly to a partial kit when the liquid piece is the only missing grounded component', async () => {
    const base = makeProduct({ id: 'base-2', name: 'Nova Pod Kit', slug: 'nova-pod-kit', tags: ['kit', 'pod'] });
    const pod = makeProduct({ id: 'pod-2', name: 'Nova Pod', slug: 'nova-pod', price: 199, tags: ['pod'] });

    getProductsMock.mockResolvedValue([base, pod]);
    resolveStorefrontAttachmentOffersMock.mockResolvedValue([
      {
        primary_product_id: 'base-2',
        relation_type: 'uses_pod',
        scope: 'specific_model',
        rationale: 'pod compatible',
        attached_product: { id: 'pod-2', name: 'Nova Pod', slug: 'nova-pod', section: 'vape' },
      },
    ]);

    const result = await resolveStorefrontKittingBasket({
      query: 'quiero cambiar a pods',
      flavor_preference: null,
      nicotine_preference: null,
      format_preference: 'pods',
      upgrade_intent: true,
      wants_device: true,
      wants_consumable: true,
      wants_liquid: false,
    });

    expect(result.execution_status).toBe('DEGRADED');
    expect(result.match_strategy).toBe('PARTIAL_KIT');
    expect(result.resolved_products?.map((product) => product.id)).toEqual(['base-2', 'pod-2']);
    expect(result.kitting_signal.kind).toBe('PARTIAL_KIT');
    expect(result.kitting_signal.missing_piece).toBe('liquid');
  });

  it('degrades honestly when no grounded kit can be assembled', async () => {
    getProductsMock.mockResolvedValue([
      makeProduct({ id: 'misc-1', name: 'Generic Disposable', slug: 'generic-disposable', tags: ['disposable'], price: 149 }),
    ]);
    resolveStorefrontAttachmentOffersMock.mockResolvedValue([]);

    const result = await resolveStorefrontKittingBasket({
      query: 'armame un kit',
      flavor_preference: null,
      nicotine_preference: null,
      format_preference: null,
      upgrade_intent: true,
      wants_device: true,
      wants_consumable: true,
      wants_liquid: true,
    });

    expect(result.execution_status).toBe('DEGRADED');
    expect(result.match_strategy).toBe('NO_GROUNDED_KIT');
    expect(result.resolved_products).toEqual([]);
    expect(result.kitting_signal.kind).toBe('NO_GROUNDED_KIT');
    expect(result.kitting_signal.kit_size).toBe(0);
  });
});
