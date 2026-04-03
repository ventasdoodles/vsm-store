import { getProducts } from '@/services/products.service';
import { resolveStorefrontAttachmentOffers } from '@/services/storefront-attachments.service';
import type { Product } from '@/types/product';
import type { InternalKittingBasketContractType, KittingBasketToolArgs } from '@/types/ai-capsule';

type KittingKind = 'FULL_KIT' | 'PARTIAL_KIT' | 'NO_GROUNDED_KIT';
type KittingSetupFocus = 'starter_kit' | 'hardware_upgrade' | 'disposable_to_pod' | 'pod_setup' | 'liquid_setup' | 'mixed_setup';
type KittingPiece = 'base_device' | 'consumable' | 'liquid';

type ProductRef = {
  id: string;
  name: string;
  slug: string;
  section: 'vape' | '420';
};

type KittingSignals = Pick<
  KittingBasketToolArgs,
  'flavor_preference' | 'nicotine_preference' | 'format_preference' | 'upgrade_intent' | 'wants_device' | 'wants_consumable' | 'wants_liquid'
>;

const HARDWARE_HINTS = ['device', 'equipo', 'hardware', 'mod', 'pod', 'pods', 'kit', 'starter', 'setup', 'dispositivo', 'vaporizador'];
const CONSUMABLE_HINTS = ['pod', 'pods', 'cartucho', 'cartuchos', 'resistencia', 'resistencias', 'coil', 'coils'];
const LIQUID_HINTS = ['liquido', 'liquidos', 'liquid', 'juice', 'e-liquid', 'eliquid', 'salt', 'nicsalt', 'nic salt'];
const VAPE_HINTS = ['vape', 'vapeo', 'pod', 'pods', 'mod', 'desechable', 'desechables', 'liquido', 'cartucho', 'resistencia'];
const VAPE_420_HINTS = ['thc', 'cbd', 'herb', 'dry herb', 'vaporizador', 'vaporizer', 'hemp', '420'];
const DISPOSABLE_TO_POD_HINTS = ['desechable', 'desechables', 'pasar a pods', 'pasarme a pods', 'cambiar a pods', 'de desechables a pods'];

function normalizeText(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s%.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textForProduct(product: Product): string {
  const specs = product.specs && typeof product.specs === 'object'
    ? Object.entries(product.specs).flatMap(([key, value]) => [key, String(value ?? '')]).join(' ')
    : '';
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : '';
  const variantText = (product.variants ?? [])
    .flatMap((variant) => [
      variant.sku ?? '',
      ...(variant.options ?? []).flatMap((option) => [
        option.attribute_name ?? '',
        option.attribute_value?.value ?? '',
      ]),
    ])
    .join(' ');

  return normalizeText([
    product.name,
    product.description ?? '',
    product.short_description ?? '',
    product.ai_sales_note ?? '',
    tags,
    specs,
    variantText,
  ].join(' '));
}

function toProductRef(product: Product): ProductRef {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    section: product.section,
  };
}

function hasAnyHint(text: string, hints: readonly string[]): boolean {
  return hints.some((hint) => text.includes(normalizeText(hint)));
}

function deriveSetupFocus(query: string, signals: KittingSignals): KittingSetupFocus {
  const normalized = normalizeText(query);
  const disposableToPod = hasAnyHint(normalized, DISPOSABLE_TO_POD_HINTS);

  if (disposableToPod) return 'disposable_to_pod';
  if (signals.wants_liquid && !signals.wants_device && !signals.wants_consumable) return 'liquid_setup';
  if (signals.wants_device && signals.wants_consumable && signals.wants_liquid) return 'starter_kit';
  if (signals.upgrade_intent && signals.wants_device && signals.wants_consumable) return 'hardware_upgrade';
  if (signals.wants_device && signals.wants_consumable) return 'pod_setup';
  return signals.wants_device ? 'hardware_upgrade' : 'mixed_setup';
}

function derivePreferredSection(query: string): 'vape' | '420' | null {
  const normalized = normalizeText(query);
  if (hasAnyHint(normalized, VAPE_420_HINTS)) return '420';
  if (hasAnyHint(normalized, VAPE_HINTS)) return 'vape';
  return null;
}

function scoreProductForBase(product: Product, query: string, signals: KittingSignals): number {
  const normalizedQuery = normalizeText(query);
  const text = textForProduct(product);
  let score = 0;

  if (signals.wants_device && hasAnyHint(text, HARDWARE_HINTS)) score += 30;
  if (signals.wants_consumable && hasAnyHint(text, CONSUMABLE_HINTS)) score += 18;
  if (signals.wants_liquid && hasAnyHint(text, LIQUID_HINTS)) score += 18;
  if (signals.upgrade_intent && hasAnyHint(text, ['pod', 'pods', 'starter', 'kit', 'mod'])) score += 10;
  if (hasAnyHint(text, ['refillable', 'rechargeable', 'pod system', 'podsystem'])) score += 8;
  if (hasAnyHint(normalizedQuery, DISPOSABLE_TO_POD_HINTS) && hasAnyHint(text, ['pod', 'starter', 'refillable'])) score += 12;

  const preferredSection = derivePreferredSection(query);
  if (preferredSection && product.section === preferredSection) score += 20;

  if (signals.format_preference && text.includes(normalizeText(signals.format_preference))) score += 10;
  if (signals.flavor_preference && text.includes(normalizeText(signals.flavor_preference))) score += 4;
  if (signals.nicotine_preference && text.includes(normalizeText(signals.nicotine_preference))) score += 4;
  if (product.ai_is_featured) score += 4;
  score += Math.min(product.stock, 10);

  return score;
}

function scoreAttachmentProduct(product: Product, query: string, signals: KittingSignals, relationType: string): number {
  const normalizedQuery = normalizeText(query);
  const text = textForProduct(product);
  let score = 0;

  if (relationType === 'uses_pod' || relationType === 'uses_coil' || relationType === 'replaces') {
    score += 12;
  }
  if (relationType === 'uses_liquid' || relationType === 'recommended_for_liquid') {
    score += 12;
  }
  if (signals.wants_consumable && hasAnyHint(text, CONSUMABLE_HINTS)) score += 20;
  if (signals.wants_liquid && hasAnyHint(text, LIQUID_HINTS)) score += 20;
  if (signals.flavor_preference && text.includes(normalizeText(signals.flavor_preference))) score += 10;
  if (signals.nicotine_preference && text.includes(normalizeText(signals.nicotine_preference))) score += 10;
  if (signals.format_preference && text.includes(normalizeText(signals.format_preference))) score += 6;
  if (hasAnyHint(normalizedQuery, ['5%', '5 mg', '5mg']) && text.includes('5')) score += 4;
  if (product.ai_is_featured) score += 2;
  score += Math.min(product.stock, 8);

  return score;
}

function buildSignal(args: KittingSignals & { query: string }, kind: KittingKind, resolvedProducts: ProductRef[], base?: ProductRef | null, consumable?: ProductRef | null, liquid?: ProductRef | null, missingPiece?: KittingPiece | null): InternalKittingBasketContractType['kitting_signal'] {
  const setup_focus = deriveSetupFocus(args.query, args);
  const kitSize = resolvedProducts.length;
  return {
    kind,
    setup_focus,
    scope: kind === 'FULL_KIT' ? 'CATALOG_KIT' : kind === 'PARTIAL_KIT' ? 'CATALOG_PARTIAL' : 'NONE',
    base_product: base ?? null,
    consumable_product: consumable ?? null,
    liquid_product: liquid ?? null,
    missing_piece: missingPiece ?? null,
    flavor_preference: args.flavor_preference ?? null,
    nicotine_preference: args.nicotine_preference ?? null,
    format_preference: args.format_preference ?? null,
    upgrade_intent: args.upgrade_intent ?? false,
    wants_device: args.wants_device ?? false,
    wants_consumable: args.wants_consumable ?? false,
    wants_liquid: args.wants_liquid ?? false,
    kit_size: kitSize,
  };
}

function buildResponseDraft(kind: KittingKind, signal: InternalKittingBasketContractType['kitting_signal'], resolvedProducts: ProductRef[]): string {
  const names = resolvedProducts.map((product) => product.name);

  if (kind === 'FULL_KIT') {
    return `Te arme un kit compatible y en stock: ${names.join(' + ')}.`;
  }

  if (kind === 'PARTIAL_KIT') {
    const missingText = signal.missing_piece === 'base_device'
      ? 'me falta una base compatible'
      : signal.missing_piece === 'consumable'
        ? 'me falta un consumible compatible'
        : signal.missing_piece === 'liquid'
          ? 'me falta un liquido compatible'
          : 'me falta una pieza compatible';
    return names.length > 0
      ? `Pude armarte un inicio compatible con ${names.join(' + ')}, pero ${missingText}.`
      : `Pude recuperar una parte del armado, pero ${missingText}.`;
  }

  return 'No pude armar un kit compatible con el catalogo actual sin inventar compatibilidad. Si quieres, te doy la opcion mas cercana por separado.';
}

function normalizeArgs(args: KittingBasketToolArgs): KittingSignals & { query: string } {
  return {
    query: args.query,
    flavor_preference: args.flavor_preference ?? null,
    nicotine_preference: args.nicotine_preference ?? null,
    format_preference: args.format_preference ?? null,
    upgrade_intent: Boolean(args.upgrade_intent),
    wants_device: Boolean(args.wants_device),
    wants_consumable: Boolean(args.wants_consumable),
    wants_liquid: Boolean(args.wants_liquid),
  };
}

async function resolveKitPieces(input: KittingSignals & { query: string }): Promise<{
  kind: KittingKind;
  resolvedProducts: ProductRef[];
  base?: ProductRef | null;
  consumable?: ProductRef | null;
  liquid?: ProductRef | null;
  missingPiece?: KittingPiece | null;
  reasoning: string;
}> {
  const catalog = await getProducts({ limit: 200 });
  if (!catalog.length) {
    return {
      kind: 'NO_GROUNDED_KIT',
      resolvedProducts: [],
      missingPiece: 'base_device',
      reasoning: 'No se pudo cargar el catalogo activo para armar el kit.',
    };
  }

  const baseCandidates = catalog
    .map((product) => ({ product, score: scoreProductForBase(product, input.query, input) }))
    .filter((entry) => entry.score >= 18)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);

  const preferredSection = derivePreferredSection(input.query);

  for (const candidate of baseCandidates) {
    const attachmentOffers = await resolveStorefrontAttachmentOffers([candidate.product.id]).catch(() => []);
    const attachmentCandidates = attachmentOffers
      .map((offer) => {
        const product = catalog.find((entry) => entry.id === offer.attached_product.id);
        return product ? { offer, product, score: scoreAttachmentProduct(product, input.query, input, offer.relation_type) } : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((left, right) => right.score - left.score);

    const consumableCandidates = attachmentCandidates.filter((entry) =>
      entry.offer.relation_type === 'uses_pod'
      || entry.offer.relation_type === 'uses_coil'
      || entry.offer.relation_type === 'replaces'
      || entry.offer.relation_type === 'uses_battery'
    );
    const liquidCandidates = attachmentCandidates.filter((entry) =>
      entry.offer.relation_type === 'uses_liquid'
      || entry.offer.relation_type === 'recommended_for_liquid'
    );

    const baseRef = toProductRef(candidate.product);
    const consumableRef = consumableCandidates[0]?.product ? toProductRef(consumableCandidates[0].product) : null;
    const liquidRef = liquidCandidates[0]?.product ? toProductRef(liquidCandidates[0].product) : null;
    const resolvedProducts = [baseRef, consumableRef, liquidRef].filter((value): value is ProductRef => Boolean(value));

    const missingPiece: KittingPiece | null = !baseRef
      ? 'base_device'
      : !consumableRef && !liquidRef
        ? 'consumable'
        : !consumableRef
          ? 'consumable'
          : !liquidRef
            ? 'liquid'
            : null;

    if (resolvedProducts.length >= 2 || (baseRef && (consumableRef || liquidRef))) {
      const kind: KittingKind = consumableRef && liquidRef && baseRef ? 'FULL_KIT' : 'PARTIAL_KIT';
      return {
        kind,
        resolvedProducts,
        base: baseRef,
        consumable: consumableRef,
        liquid: liquidRef,
        missingPiece,
        reasoning: preferredSection
          ? `Kit grounded con preferencia de seccion ${preferredSection}.`
          : 'Kit grounded con compatibilidad existente en el catalogo.',
      };
    }
  }

  const fallbackBase = baseCandidates[0]?.product ? toProductRef(baseCandidates[0].product) : null;
  if (fallbackBase) {
    return {
      kind: 'PARTIAL_KIT',
      resolvedProducts: [fallbackBase],
      base: fallbackBase,
      consumable: null,
      liquid: null,
      missingPiece: input.wants_consumable ? 'consumable' : input.wants_liquid ? 'liquid' : 'consumable',
      reasoning: 'Se encontro una base plausible, pero no hubo piezas compatibles suficientes para cerrar el kit.',
    };
  }

  return {
    kind: 'NO_GROUNDED_KIT',
    resolvedProducts: [],
    missingPiece: 'base_device',
    reasoning: 'No se encontro una base compatible y en stock para iniciar el kit.',
  };
}

export async function resolveStorefrontKittingBasket(
  args: KittingBasketToolArgs,
): Promise<InternalKittingBasketContractType> {
  const startMs = Date.now();
  const input = normalizeArgs(args);

  try {
    const resolution = await resolveKitPieces(input);
    const signal = buildSignal(input, resolution.kind, resolution.resolvedProducts, resolution.base ?? null, resolution.consumable ?? null, resolution.liquid ?? null, resolution.missingPiece ?? null);

    return {
      capsule_name: 'storefront_kitting_basket',
      capsule_version: '1.0.0',
      execution_status: resolution.kind === 'FULL_KIT' ? 'SUCCESS' : 'DEGRADED',
      match_strategy: resolution.kind,
      customer_response_draft: buildResponseDraft(resolution.kind, signal, resolution.resolvedProducts),
      latency_ms: Date.now() - startMs,
      degraded_reason: undefined,
      kitting_signal: signal,
      resolved_products: resolution.resolvedProducts,
      retrieval_source: resolution.kind === 'NO_GROUNDED_KIT' ? 'NONE' : 'CATALOG_KITTING',
      capsule_reasoning: resolution.reasoning,
    };
  } catch (error) {
    return {
      capsule_name: 'storefront_kitting_basket',
      capsule_version: '1.0.0',
      execution_status: 'FAILED',
      match_strategy: 'NO_GROUNDED_KIT',
      customer_response_draft: 'No pude armar el kit compatible en este momento. Mejor lo revisamos con otra combinacion.',
      latency_ms: Date.now() - startMs,
      degraded_reason: 'SCHEMA_ERROR',
      kitting_signal: {
        kind: 'NO_GROUNDED_KIT',
        setup_focus: 'mixed_setup',
        scope: 'NONE',
        base_product: null,
        consumable_product: null,
        liquid_product: null,
        missing_piece: 'base_device',
        flavor_preference: input.flavor_preference ?? null,
        nicotine_preference: input.nicotine_preference ?? null,
        format_preference: input.format_preference ?? null,
        upgrade_intent: input.upgrade_intent ?? false,
        wants_device: input.wants_device ?? false,
        wants_consumable: input.wants_consumable ?? false,
        wants_liquid: input.wants_liquid ?? false,
        kit_size: 0,
      },
      resolved_products: [],
      retrieval_source: 'NONE',
      capsule_reasoning: error instanceof Error ? error.message : String(error),
    };
  }
}
