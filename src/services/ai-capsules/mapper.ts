


import { InternalResolvedProduct } from '@/types/ai-capsule';

































import type { Product } from '@/types/product';
import { buildVariantTruth } from "./recovery";
import { ProductSearchRow } from "./types";

export function mapDbToInternal(dbProducts: ProductSearchRow[], query: string): InternalResolvedProduct[] {
  return dbProducts.map(p => {
    return mapSearchRowToInternal(p, query);
  });
}

export function mapSearchRowToInternal(p: ProductSearchRow, query: string): InternalResolvedProduct {
  let status: InternalResolvedProduct['status_signal'] = 'IN_STOCK';
  if (p.stock <= 0) status = 'OUT_OF_STOCK';
  else if (p.stock <= 5) status = 'LOW_STOCK';

  let flag: InternalResolvedProduct['commercial_flag'] = 'STANDARD';
  if (p.ai_is_featured) flag = 'FEATURED';

  return {
    id: p.id,
    slug: p.slug || p.name.toLowerCase().replace(/\s+/g, '-'),
    section: (p.section === 'vape' || p.section === '420') ? p.section : 'vape',
    name: p.name,
    display_price: `$${p.price}`,
    raw_stock: p.stock,
    status_signal: status,
    commercial_flag: flag,
    ai_sales_note: p.ai_sales_note ?? null,
    description: p.description ?? null,
    specs: p.specs ?? null,
    variant_truth: buildVariantTruth(query, p),
  };
}

export function mapStorefrontProductToInternal(product: Product, query: string): InternalResolvedProduct {
  const searchRow: ProductSearchRow = {
    id: product.id,
    slug: product.slug,
    section: product.section,
    name: product.name,
    price: product.price,
    stock: product.stock,
    ai_is_featured: product.ai_is_featured,
    ai_sales_note: product.ai_sales_note,
    description: product.description,
    specs: product.specs ?? null,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      product_id: variant.product_id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      is_active: variant.is_active,
      options: variant.options?.map((option) => ({
        variant_id: option.variant_id,
        attribute_value_id: option.attribute_value_id,
        attribute_value: {
          value: option.attribute_value?.value ?? null,
          attribute: {
            name: option.attribute_name ?? null,
          },
        },
      })) ?? null,
    })) ?? null,
  };

  return mapSearchRowToInternal(searchRow, query);
}
