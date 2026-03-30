import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import type { CesarinCommercialConversationMode } from './cesarin-stage4';
import {
  isCompareQuery,
  isReadyToCloseQuery,
  isStrictExplorationQuery,
} from './cesarin-stage4';
import { isCesarinApproximateMatchStrategy } from './cesarin-stage1';

export type CesarinStorefrontNextStepFamily =
  | 'REVIEW_ONE'
  | 'COMPARE_TWO'
  | 'ADD_READY'
  | 'SELECTOR_NEEDED'
  | 'KEEP_EXPLORING';

type CesarinCommercialSupportLevel = 'weak' | 'supported' | 'strong';

type CesarinActionProduct =
  | Pick<Product, 'id' | 'name' | 'slug' | 'section'> & { variants?: ProductVariant[]; specs?: Record<string, string> | null }
  | Pick<InternalResolvedProduct, 'id' | 'name' | 'slug' | 'section' | 'specs'>;

type CesarinActionProductRef = Pick<CesarinActionProduct, 'id' | 'name' | 'slug' | 'section'>;

export interface CesarinStorefrontActionButtonView {
  kind: 'OPEN_PDP' | 'ADD_TO_CART';
  label: string;
  product: CesarinActionProductRef;
}

export interface CesarinStorefrontAssistActionView {
  label: string;
  message: string;
}

export interface CesarinStorefrontNextStepView {
  family: CesarinStorefrontNextStepFamily;
  guidance: string;
  primaryProduct?: CesarinActionProductRef;
  secondaryProduct?: CesarinActionProductRef;
  missingSelector?: string | null;
  primaryAction?: CesarinStorefrontActionButtonView | null;
  secondaryAction?: CesarinStorefrontActionButtonView | null;
  assistAction?: CesarinStorefrontAssistActionView | null;
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

function historyShowsComparison(history?: BuildCesarinActionableNextStepInput<CesarinActionProduct>['history']): boolean {
  return (history ?? [])
    .slice(-4)
    .some((entry) => isCompareQuery(normalizeText(entry.content)));
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

function resolveSupportLevel(input: {
  matchStrategy?: InternalCapsuleContract['match_strategy'] | null;
  visibleProductCount: number;
  approximate: boolean;
}): CesarinCommercialSupportLevel {
  const strategy = input.matchStrategy ?? null;

  if (input.visibleProductCount === 0) return 'weak';
  if (strategy === 'FEATURED_FALLBACK' || strategy === 'NO_MATCH') return 'weak';
  if (input.approximate || strategy === 'SEMANTIC') {
    return 'weak';
  }
  if (strategy === 'TOKEN_RECOVERY' || strategy === 'OUT_OF_STOCK_ALTERNATIVE') {
    return input.visibleProductCount === 1 ? 'strong' : 'supported';
  }
  if (strategy === 'EXACT') {
    return input.visibleProductCount === 1 ? 'strong' : 'supported';
  }

  return input.visibleProductCount === 1 ? 'supported' : 'weak';
}

function shouldPreferCompare(input: {
  hasSecondary: boolean;
  currentTurnCompare: boolean;
  currentTurnReady: boolean;
  adaptiveMode: CesarinCommercialConversationMode;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
}): boolean {
  if (!input.hasSecondary) return false;
  if (input.currentTurnCompare) return true;
  if (input.adaptiveMode === 'GUIDED_COMPARE') return true;
  if (input.approximate) return true;
  if (input.currentTurnReady) return false;
  return input.supportLevel !== 'strong';
}

function buildStepMessage(
  family: CesarinStorefrontNextStepFamily,
  primary: CesarinActionProductRef | undefined,
  secondary: CesarinActionProductRef | undefined,
  selectorLabel: string | null,
  supportLevel: CesarinCommercialSupportLevel,
): string {
  switch (family) {
    case 'ADD_READY':
      return primary
        ? `${primary.name} ya viene bien amarrado; si ya te cerro, agregarlo es el paso natural.`
        : 'Si ya te cerro, el paso mas claro es agregarlo.';
    case 'SELECTOR_NEEDED':
      return primary && selectorLabel
        ? `${primary.name} ya va bien encaminado; antes de moverlo solo falta definir ${selectorLabel}.`
        : 'Solo falta cerrar un selector material.';
    case 'COMPARE_TWO':
      return primary && secondary
        ? `${primary.name} y ${secondary.name} traen buen caso; comparalos antes de decidir.`
        : 'Aqui conviene comparar dos opciones viables.';
    case 'KEEP_EXPLORING':
      return supportLevel === 'weak'
        ? 'Todavia no hay una ganadora clara; aqui conviene afinar un poco mas.'
        : 'Ahorita lo mas util es seguir viendo opciones.';
    default:
      return primary
        ? supportLevel === 'weak'
          ? `${primary.name} es la mejor pista por ahora; revisalo primero y si no te convence seguimos.`
          : `${primary.name} es la ruta mas clara; revisalo primero y con eso decides mejor.`
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
              label: `Agregar ${primary.name}`,
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
              label: `Revisar ${primary.name}`,
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
              label: `Revisar ${primary.name}`,
              product: primary,
            }
          : null,
        secondaryAction: secondary
          ? {
              kind: 'OPEN_PDP',
              label: `Revisar ${secondary.name}`,
              product: secondary,
            }
          : null,
      };
    default:
      return { primaryAction: null, secondaryAction: null };
  }
}

function buildAssistAction(input: {
  family: CesarinStorefrontNextStepFamily;
  supportLevel: CesarinCommercialSupportLevel;
}): CesarinStorefrontAssistActionView | null {
  if (input.family === 'REVIEW_ONE' && input.supportLevel === 'weak') {
    return {
      label: 'Seguimos viendo',
      message: 'Seguimos viendo',
    };
  }

  return null;
}

export function buildCesarinActionableNextStepView<T extends CesarinActionProduct>(
  input: BuildCesarinActionableNextStepInput<T>,
): CesarinActionableConversationView<T> {
  const normalizedQuery = normalizeText(input.query);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const currentTurnCompare = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const currentTurnExplore = isStrictExplorationQuery(normalizedQuery);
  const currentTurnReady = isReadyToCloseQuery(normalizedQuery);
  const primary = input.visibleProducts[0];
  const secondary = input.visibleProducts[1];
  const enrichedPrimary = primary ? input.enrichedProductsById?.[primary.id] : undefined;
  const missingSelector = primary ? getMissingSelectorLabel(primary, enrichedPrimary, input.query) : null;
  const supportLevel = resolveSupportLevel({
    matchStrategy: input.matchStrategy,
    visibleProductCount: input.visibleProducts.length,
    approximate,
  });
  let family: CesarinStorefrontNextStepFamily;

  if (!primary) {
    family = 'KEEP_EXPLORING';
  } else if (input.adaptiveMode === 'EXPLORE_LIGHT' || (currentTurnExplore && !currentTurnReady && !currentTurnCompare)) {
    family = 'KEEP_EXPLORING';
  } else if (
    supportLevel === 'weak'
    && !currentTurnReady
    && (secondary || input.adaptiveMode === 'GUIDED_COMPARE')
  ) {
    family = 'KEEP_EXPLORING';
  } else if (missingSelector && !approximate) {
    family = 'SELECTOR_NEEDED';
  } else if (
    (input.adaptiveMode === 'READY_TO_CLOSE' || currentTurnReady)
    && supportLevel === 'strong'
    && !secondary
    && isAddReadyProduct(enrichedPrimary)
    && !approximate
  ) {
    family = 'ADD_READY';
  } else if (shouldPreferCompare({
    hasSecondary: Boolean(secondary),
    currentTurnCompare,
    currentTurnReady,
    adaptiveMode: input.adaptiveMode,
    supportLevel,
    approximate,
  })) {
    family = 'COMPARE_TWO';
  } else if (input.adaptiveMode === 'SOFT_REASSURE' || input.adaptiveMode === 'DIRECT_RECOMMEND' || primary) {
    family = 'REVIEW_ONE';
  } else {
    family = 'KEEP_EXPLORING';
  }

  const primaryRef = toProductRef(primary);
  const secondaryRef = family === 'COMPARE_TWO' ? toProductRef(secondary) : undefined;
  const guidance = buildStepMessage(family, primaryRef, secondaryRef, missingSelector, supportLevel);
  const actions = buildActionButtons(family, primaryRef, secondaryRef);
  const assistAction = buildAssistAction({ family, supportLevel });

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
      assistAction,
    },
  };
}
