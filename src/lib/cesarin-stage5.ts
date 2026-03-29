import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import type { CesarinCommercialConversationMode } from './cesarin-stage4';
import { isCesarinApproximateMatchStrategy } from './cesarin-stage1';

export type CesarinStorefrontNextStepFamily =
  | 'REVIEW_ONE'
  | 'COMPARE_TWO'
  | 'ADD_READY'
  | 'SELECTOR_NEEDED'
  | 'KEEP_EXPLORING';

type CesarinActionProduct =
  | Pick<Product, 'id' | 'name' | 'slug' | 'section'> & { variants?: ProductVariant[]; specs?: Record<string, string> | null }
  | Pick<InternalResolvedProduct, 'id' | 'name' | 'slug' | 'section' | 'specs'>;

type CesarinActionProductRef = Pick<CesarinActionProduct, 'id' | 'name' | 'slug' | 'section'>;

export interface CesarinStorefrontActionButtonView {
  kind: 'OPEN_PDP' | 'ADD_TO_CART';
  label: string;
  product: CesarinActionProductRef;
}

export interface CesarinStorefrontNextStepView {
  family: CesarinStorefrontNextStepFamily;
  guidance: string;
  primaryProduct?: CesarinActionProductRef;
  secondaryProduct?: CesarinActionProductRef;
  missingSelector?: string | null;
  primaryAction?: CesarinStorefrontActionButtonView | null;
  secondaryAction?: CesarinStorefrontActionButtonView | null;
}

interface BuildCesarinActionableNextStepInput<T extends CesarinActionProduct> {
  query: string;
  history?: Array<{ role: 'assistant' | 'user'; content: string }> | null;
  preferenceSummary?: CesarinPreferenceSummary | null;
  matchStrategy?: InternalCapsuleContract['match_strategy'] | null;
  adaptiveMode: CesarinCommercialConversationMode;
  visibleProducts: T[];
  enrichedProductsById?: Record<string, Product | undefined>;
  baseMessage: string;
}

export interface CesarinActionableConversationView<T extends CesarinActionProduct> {
  family: CesarinStorefrontNextStepFamily;
  visibleProducts: T[];
  message: string;
  nextStep: CesarinStorefrontNextStepView;
}

const MATERIAL_SELECTOR_PRIORITY = ['sabor', 'flavor', 'nicotina', 'nicotine', 'resistencia', 'ohm', 'tamano', 'tamaño', 'ml', 'size', 'color'];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function toProductRef(product?: CesarinActionProduct | null): CesarinActionProductRef | undefined {
  if (!product) return undefined;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    section: product.section,
  };
}

function isBroadExplorationQuery(query: string): boolean {
  return /(que tienes|quiero ver|ando viendo|busco|opciones|cuales|algo para ver)/.test(query);
}

function isCompareQuery(query: string): boolean {
  return /(compar|entre|vs|cual conviene|cual sale mejor|de las dos|de esos|cual te irias)/.test(query);
}

function isReadyToCloseQuery(query: string): boolean {
  return /(me llevo|agregalo|agregame|lo quiero|me quedo con|pasame ese|dame ese|ya con ese|mandame ese)/.test(query);
}

function historyShowsComparison(history?: BuildCesarinActionableNextStepInput<CesarinActionProduct>['history']): boolean {
  return (history ?? [])
    .slice(-4)
    .some((entry) => /(compar|entre|vs|cual conviene|cual sale mejor)/.test(normalizeText(entry.content)));
}

function collectVariantSelectorMap(product?: Product): Map<string, Set<string>> {
  const selectorMap = new Map<string, Set<string>>();

  for (const variant of product?.variants ?? []) {
    if (!variant.is_active) continue;
    for (const option of variant.options ?? []) {
      const attributeName = normalizeText(option.attribute_name ?? '');
      const value = normalizeText(option.attribute_value?.value ?? '');
      if (!attributeName || !value) continue;

      const bucket = selectorMap.get(attributeName) ?? new Set<string>();
      bucket.add(value);
      selectorMap.set(attributeName, bucket);
    }
  }

  return selectorMap;
}

function queryMentionsAny(query: string, values: Iterable<string>): boolean {
  const normalizedQuery = normalizeText(query);
  return Array.from(values).some((value) => normalizedQuery.includes(normalizeText(value)));
}

function getMissingSelectorLabel(_product: CesarinActionProduct, enriched?: Product, query?: string): string | null {
  const selectorMap = collectVariantSelectorMap(enriched);
  if (selectorMap.size === 0) return null;

  const materialSelectors = Array.from(selectorMap.entries())
    .filter(([, values]) => values.size > 1)
    .sort((left, right) => {
      const leftIndex = MATERIAL_SELECTOR_PRIORITY.findIndex((term) => left[0].includes(term));
      const rightIndex = MATERIAL_SELECTOR_PRIORITY.findIndex((term) => right[0].includes(term));
      return (leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex);
    });

  const [selectorName, selectorValues] = materialSelectors[0] ?? [];
  if (!selectorName || !selectorValues) return null;
  if (materialSelectors.length > 1) return null;
  if (query && queryMentionsAny(query, selectorValues)) return null;

  return selectorName;
}

function isAddReadyProduct(product?: Product): boolean {
  if (!product) return false;

  const activeVariants = (product.variants ?? []).filter((variant) => variant.is_active);
  return activeVariants.length <= 1;
}

function buildStepMessage(
  family: CesarinStorefrontNextStepFamily,
  primary: CesarinActionProductRef | undefined,
  secondary: CesarinActionProductRef | undefined,
  selectorLabel: string | null,
): string {
  switch (family) {
    case 'ADD_READY':
      return primary
        ? `El paso directo es ${primary.name}.`
        : 'El paso directo es cerrarlo sin mas rodeos.';
    case 'SELECTOR_NEEDED':
      return primary && selectorLabel
        ? `Vas bien por ${primary.name}; solo falta definir ${selectorLabel}.`
        : 'Solo falta cerrar un selector material.';
    case 'COMPARE_TWO':
      return primary && secondary
        ? `Aqui conviene comparar ${primary.name} con ${secondary.name}.`
        : 'Aqui conviene comparar dos opciones viables.';
    case 'KEEP_EXPLORING':
      return 'Ahorita conviene seguir explorando.';
    default:
      return primary
        ? `Primero revisa ${primary.name}.`
        : 'Primero revisa la opcion mas prometedora.';
  }
}

function buildActionButtons(
  family: CesarinStorefrontNextStepFamily,
  primary: CesarinActionProductRef | undefined,
  secondary: CesarinActionProductRef | undefined,
): Pick<CesarinStorefrontNextStepView, 'primaryAction' | 'secondaryAction'> {
  switch (family) {
    case 'ADD_READY':
      return primary
        ? {
            primaryAction: {
              kind: 'ADD_TO_CART',
              label: `Llevarme ${primary.name}`,
              product: primary,
            },
            secondaryAction: null,
          }
        : { primaryAction: null, secondaryAction: null };
    case 'REVIEW_ONE':
    case 'SELECTOR_NEEDED':
      return primary
        ? {
            primaryAction: {
              kind: 'OPEN_PDP',
              label: `Abrir ${primary.name}`,
              product: primary,
            },
            secondaryAction: null,
          }
        : { primaryAction: null, secondaryAction: null };
    case 'COMPARE_TWO':
      return {
        primaryAction: primary
          ? {
              kind: 'OPEN_PDP',
              label: `Ver ${primary.name}`,
              product: primary,
            }
          : null,
        secondaryAction: secondary
          ? {
              kind: 'OPEN_PDP',
              label: `Ver ${secondary.name}`,
              product: secondary,
            }
          : null,
      };
    default:
      return { primaryAction: null, secondaryAction: null };
  }
}

export function buildCesarinActionableNextStepView<T extends CesarinActionProduct>(
  input: BuildCesarinActionableNextStepInput<T>,
): CesarinActionableConversationView<T> {
  const normalizedQuery = normalizeText(input.query);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const currentTurnCompare = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const currentTurnExplore = isBroadExplorationQuery(normalizedQuery);
  const currentTurnReady = isReadyToCloseQuery(normalizedQuery);
  const primary = input.visibleProducts[0];
  const secondary = input.visibleProducts[1];
  const enrichedPrimary = primary ? input.enrichedProductsById?.[primary.id] : undefined;
  const missingSelector = primary ? getMissingSelectorLabel(primary, enrichedPrimary, input.query) : null;
  let family: CesarinStorefrontNextStepFamily;

  if (!primary) {
    family = 'KEEP_EXPLORING';
  } else if (currentTurnCompare && secondary) {
    family = 'COMPARE_TWO';
  } else if (input.adaptiveMode === 'EXPLORE_LIGHT' || (currentTurnExplore && !currentTurnReady && !currentTurnCompare)) {
    family = 'KEEP_EXPLORING';
  } else if (missingSelector && !approximate) {
    family = 'SELECTOR_NEEDED';
  } else if ((input.adaptiveMode === 'READY_TO_CLOSE' || currentTurnReady) && isAddReadyProduct(enrichedPrimary) && !approximate) {
    family = 'ADD_READY';
  } else if (input.adaptiveMode === 'GUIDED_COMPARE' && secondary) {
    family = 'COMPARE_TWO';
  } else if (input.adaptiveMode === 'DIRECT_RECOMMEND' && secondary && approximate) {
    family = 'COMPARE_TWO';
  } else if (input.adaptiveMode === 'SOFT_REASSURE' || input.adaptiveMode === 'DIRECT_RECOMMEND' || primary) {
    family = 'REVIEW_ONE';
  } else {
    family = 'KEEP_EXPLORING';
  }

  const primaryRef = toProductRef(primary);
  const secondaryRef = family === 'COMPARE_TWO' ? toProductRef(secondary) : undefined;
  const guidance = buildStepMessage(family, primaryRef, secondaryRef, missingSelector);
  const actions = buildActionButtons(family, primaryRef, secondaryRef);

  return {
    family,
    visibleProducts: input.visibleProducts,
    message: input.baseMessage.trim() || guidance,
    nextStep: {
      family,
      guidance,
      primaryProduct: primaryRef,
      secondaryProduct: secondaryRef,
      missingSelector,
      primaryAction: actions.primaryAction,
      secondaryAction: actions.secondaryAction,
    },
  };
}
