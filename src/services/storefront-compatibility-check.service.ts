import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart.store';
import type { CompatibilityCheckToolArgs, InternalCompatibilityCheckContractType } from '@/types/ai-capsule';

type CompatibilityCheckKind = NonNullable<InternalCompatibilityCheckContractType['match_strategy']>;
type ProductRef = NonNullable<InternalCompatibilityCheckContractType['resolved_products']>[number];

interface CompatibilityCheckLookupResponse {
  compatibility_check?: InternalCompatibilityCheckContractType | null;
}

export interface StorefrontCompatibilityCheckResolution {
  kind: CompatibilityCheckKind;
  message: string;
  matchStrategy: CompatibilityCheckKind;
  retrievalSource: InternalCompatibilityCheckContractType['retrieval_source'];
  resolvedProducts: ProductRef[];
  signal: InternalCompatibilityCheckContractType['compatibility_check_signal'];
}

const FIT_CONTEXT_CUES = [
  'compatibilidad',
  'compatible',
  'sirve para',
  'funciona con',
  'le queda',
  'me queda',
  'me funciona',
  'que coil',
  'que pod',
  'que bateria',
  'que liquido',
  'que resistencia',
  'con el que traigo',
  'con lo que traigo',
  'el que traigo',
  'el que tengo',
  'mi equipo',
  'mi pod',
  'mi bateria',
];

function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function shouldIncludeSafeCartContext(query: string): boolean {
  const normalized = normalizeText(query);
  return FIT_CONTEXT_CUES.some((cue) => normalized.includes(normalizeText(cue)));
}

function buildCartContextProductIds(query: string): string[] {
  if (!shouldIncludeSafeCartContext(query)) return [];

  const cartItems = useCartStore.getState().items ?? [];
  if (cartItems.length !== 1) return [];

  const cartProductId = cartItems[0]?.product?.id;
  return typeof cartProductId === 'string' && cartProductId.length > 0 ? [cartProductId] : [];
}

export async function resolveStorefrontCompatibilityCheck(
  args: CompatibilityCheckToolArgs,
): Promise<StorefrontCompatibilityCheckResolution> {
  const cartProductIds = buildCartContextProductIds(args.query);

  const { data, error } = await supabase.functions.invoke<CompatibilityCheckLookupResponse>('customer-intelligence', {
    body: {
      action: 'resolve_storefront_compatibility_check',
      query: args.query,
      cart_product_ids: cartProductIds,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.compatibility_check) {
    throw new Error('No se pudo resolver la verificacion de compatibilidad con la verdad actual.');
  }

  return {
    kind: data.compatibility_check.match_strategy,
    message: data.compatibility_check.customer_response_draft,
    matchStrategy: data.compatibility_check.match_strategy,
    retrievalSource: data.compatibility_check.retrieval_source,
    resolvedProducts: Array.isArray(data.compatibility_check.resolved_products)
      ? data.compatibility_check.resolved_products
      : [],
    signal: data.compatibility_check.compatibility_check_signal,
  };
}
