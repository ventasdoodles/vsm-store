import { describe, expect, it } from 'vitest';

import { buildCesarinActionableNextStepView } from '@/lib/cesarin-stage5';
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

function buildResolvedProduct(overrides: Partial<InternalResolvedProduct> = {}): InternalResolvedProduct {
  return {
    id: overrides.id ?? '11111111-1111-1111-1111-111111111111',
    slug: overrides.slug ?? 'xros-4',
    section: overrides.section ?? 'vape',
    name: overrides.name ?? 'XROS 4',
    display_price: overrides.display_price ?? '$450',
    raw_stock: overrides.raw_stock ?? 9,
    status_signal: overrides.status_signal ?? 'IN_STOCK',
    commercial_flag: overrides.commercial_flag ?? 'STANDARD',
    ai_sales_note: overrides.ai_sales_note ?? 'compacto y facil de usar',
    description: overrides.description ?? null,
    specs: overrides.specs ?? null,
  };
}

function buildStorefrontProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: overrides.id ?? '11111111-1111-1111-1111-111111111111',
    name: overrides.name ?? 'XROS 4',
    slug: overrides.slug ?? 'xros-4',
    description: overrides.description ?? null,
    short_description: overrides.short_description ?? null,
    price: overrides.price ?? 450,
    compare_at_price: overrides.compare_at_price ?? null,
    stock: overrides.stock ?? 9,
    sku: overrides.sku ?? null,
    section: overrides.section ?? 'vape',
    category_id: overrides.category_id ?? 'cat-1',
    tags: overrides.tags ?? [],
    status: overrides.status ?? 'active',
    images: overrides.images ?? [],
    cover_image: overrides.cover_image ?? null,
    is_featured: overrides.is_featured ?? false,
    is_featured_until: overrides.is_featured_until ?? null,
    is_new: overrides.is_new ?? false,
    is_new_until: overrides.is_new_until ?? null,
    is_bestseller: overrides.is_bestseller ?? false,
    is_bestseller_until: overrides.is_bestseller_until ?? null,
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at ?? '2026-04-03T00:00:00.000Z',
    updated_at: overrides.updated_at ?? '2026-04-03T00:00:00.000Z',
    specs: overrides.specs ?? {},
    badges: overrides.badges ?? [],
    ai_is_featured: overrides.ai_is_featured ?? false,
    ai_sales_note: overrides.ai_sales_note ?? null,
    ai_exclude: overrides.ai_exclude ?? false,
    variants: overrides.variants ?? [],
  };
}

describe('buildCesarinActionableNextStepView', () => {
  it('surfaces one attachment move on a strong single-product turn', () => {
    const primary = buildResolvedProduct();

    const result = buildCesarinActionableNextStepView({
      query: 'me llevo el xros 4',
      adaptiveMode: 'READY_TO_CLOSE',
      visibleProducts: [primary],
      baseMessage: 'XROS 4 es el que mejor te cuadra para seguir.',
      matchStrategy: 'EXACT',
      commercialMove: 'ADD_READY',
      enrichedProductsById: {
        [primary.id]: buildStorefrontProduct({ id: primary.id, name: primary.name, slug: primary.slug, section: primary.section }),
      },
      capsuleAttachmentOffer: {
        primary_product_id: primary.id,
        relation_type: 'uses_pod',
        scope: 'specific_model',
        rationale: 'Pod XROS aparece como pod compatible. Compatibilidad confirmada para ese modelo.',
        attached_product: {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Pod XROS 0.8',
          slug: 'pod-xros-08',
          section: 'vape',
        },
      },
    });

    expect(result.family).toBe('ADD_READY');
    expect(result.nextStep.primaryAction?.kind).toBe('ADD_TO_CART');
    expect(result.nextStep.secondaryAction).toEqual({
      kind: 'OPEN_PDP',
      label: 'Revisar Pod XROS 0.8',
      product: {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Pod XROS 0.8',
        slug: 'pod-xros-08',
        section: 'vape',
      },
    });
    expect(result.nextStep.guidance).toContain('pod compatible');
    expect(result.nextStep.guidance).toContain('compatibilidad confirmada para ese modelo');
  });

  it('keeps attachments suppressed on direct fact turns', () => {
    const primary = buildResolvedProduct();

    const result = buildCesarinActionableNextStepView({
      query: 'cuanta nicotina trae xros 4',
      adaptiveMode: 'DIRECT_RECOMMEND',
      visibleProducts: [primary],
      baseMessage: 'XROS 4 viene con 20 mg de nicotina.',
      matchStrategy: 'EXACT',
      commercialMove: 'REVIEW_ONE',
      capsuleTruthSignals: {
        direct_answer_complete: true,
        direct_answer_kind: 'FACT',
        fact_family: 'Nicotina',
      },
      capsuleAttachmentOffer: {
        primary_product_id: primary.id,
        relation_type: 'uses_pod',
        scope: 'specific_model',
        rationale: 'Pod XROS aparece como pod compatible. Compatibilidad confirmada para ese modelo.',
        attached_product: {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Pod XROS 0.8',
          slug: 'pod-xros-08',
          section: 'vape',
        },
      },
    });

    expect(result.family).toBe('REVIEW_ONE');
    expect(result.nextStep.secondaryAction).toBeNull();
    expect(result.nextStep.guidance).not.toContain('pod compatible');
  });
});
