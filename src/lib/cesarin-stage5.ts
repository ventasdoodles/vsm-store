import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';
import type { ProductVariant } from '@/types/variant';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import type { CesarinCommercialConversationMode } from './cesarin-stage4';
import {
  historyShowsComparison,
  isCompareQuery,
  isHesitationQuery,
  isReadyToCloseQuery,
  isStrictExplorationQuery,
  resolveCesarinCommercialSupportLevel,
  resolveCesarinTurnCommercialJudgment,
  type CesarinCommercialMove,
  type CesarinCommercialSupportLevel,
} from './cesarin-commercial-judgment';
import { isCesarinApproximateMatchStrategy } from './cesarin-stage1';
import { isMeaningfullyDistinct, normalizeCompactText } from './cesarin-text-utils';

export type CesarinStorefrontNextStepFamily =
  | 'REVIEW_ONE'
  | 'COMPARE_TWO'
  | 'ADD_READY'
  | 'SELECTOR_NEEDED'
  | 'KEEP_EXPLORING';

type CesarinActionProduct =
  | Pick<Product, 'id' | 'name' | 'slug' | 'section'> & { variants?: ProductVariant[]; specs?: Record<string, string> | null }
  | Pick<InternalResolvedProduct, 'id' | 'name' | 'slug' | 'section' | 'specs' | 'variant_truth'>;

type CesarinActionProductRef = Pick<CesarinActionProduct, 'id' | 'name' | 'slug' | 'section'>;
type CesarinStorefrontAttachmentOffer = NonNullable<InternalCapsuleContract['attachment_offer']>;
type CesarinStorefrontReplenishmentSignal = NonNullable<InternalCapsuleContract['replenishment_signal']>;

export interface CesarinStorefrontActionButtonView {
  kind: 'OPEN_PDP' | 'ADD_TO_CART' | 'OPEN_CART';
  label: string;
  product: CesarinActionProductRef;
  quantity?: number;
  variantToken?: { id: string; name: string } | null;
}

export interface CesarinStorefrontAssistActionView {
  label: string;
  message: string;
}

export interface CesarinStorefrontNextStepView {
  family: CesarinStorefrontNextStepFamily;
  guidance: string;
  renderHint?: 'SHOW' | 'HIDE';
  surfaceKind?: 'CATALOG_HELP' | 'ACTIONABLE';
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
  turnAnalysis?: { current_turn_decision?: string | null; commercial_move?: CesarinCommercialMove | null } | null;
  commercialMove?: CesarinCommercialMove | null;
  capsuleTruthSignals?: InternalCapsuleContract['truth_signals'] | null;
  capsuleHelpContract?: InternalCapsuleContract['help_contract'] | null;
  capsuleAttachmentOffer?: InternalCapsuleContract['attachment_offer'] | null;
  capsuleReplenishmentSignal?: InternalCapsuleContract['replenishment_signal'] | null;
}

export interface CesarinActionableConversationView<T extends CesarinActionProduct> {
  family: CesarinStorefrontNextStepFamily;
  visibleProducts: T[];
  message: string;
  nextStep: CesarinStorefrontNextStepView;
  secondaryHelpSuppressed?: boolean;
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

function buildAttachmentLabel(relationType: CesarinStorefrontAttachmentOffer['relation_type']): string {
  switch (relationType) {
    case 'uses_pod':
      return 'pod compatible';
    case 'uses_coil':
      return 'resistencia compatible';
    case 'uses_battery':
      return 'bateria compatible';
    case 'uses_liquid':
      return 'liquido compatible';
    case 'recommended_for_liquid':
      return 'liquido recomendado';
    case 'replaces':
      return 'repuesto compatible';
    case 'has_connector':
      return 'accesorio compatible';
  }
}

function buildAttachmentGuidance(offer: CesarinStorefrontAttachmentOffer): string {
  const scopeLine = offer.scope === 'specific_model'
    ? 'compatibilidad confirmada para ese modelo'
    : 'compatibilidad confirmada a nivel de clase';

  return `Si tambien quieres dejarlo cubierto, revisa ${offer.attached_product.name} como ${buildAttachmentLabel(offer.relation_type)}; ${scopeLine}.`;
}

function getVariantTruth(product?: CesarinActionProduct | null): InternalResolvedProduct['variant_truth'] | null {
  if (!product || !('variant_truth' in product)) return null;
  return product.variant_truth ?? null;
}

function buildVariantTruthGuidance(product?: CesarinActionProduct | null): string | null {
  const variantTruth = getVariantTruth(product);
  if (!variantTruth?.requested_variant_intent) return null;

  const label = variantTruth.matched_variant_label?.trim() || variantTruth.requested_value?.trim() || null;

  switch (variantTruth.availability) {
    case 'available':
      return label
        ? `La variante pedida ${label} si esta disponible y con stock.`
        : 'La variante pedida si esta disponible y con stock.';
    case 'missing':
      return label
        ? `El producto existe, pero la variante pedida ${label} no esta disponible ahorita.`
        : 'El producto existe, pero la variante pedida no esta disponible ahorita.';
    case 'ambiguous':
      return 'La linea existe, pero la variante exacta todavia no queda confirmada; mejor abre la ficha para escoger una variante vigente.';
    case 'unsupported':
    default:
      return 'La linea existe, pero no veo confirmada esa variante exacta en el catalogo; mejor revisa la ficha antes de cerrar.';
  }
}

function getPrimaryReplenishmentSignal(
  signal: InternalCapsuleContract['replenishment_signal'] | null | undefined,
  primary?: CesarinActionProduct | null,
): CesarinStorefrontReplenishmentSignal | null {
  if (!signal || !primary || !signal.primary_product) return null;
  return signal.primary_product.id === primary.id ? signal : null;
}

function buildReplenishmentGuidance(signal: CesarinStorefrontReplenishmentSignal): string {
  const target = signal.variant_label?.trim()
    ? `${signal.primary_product?.name ?? 'ese articulo'} (${signal.variant_label.trim()})`
    : signal.primary_product?.name ?? 'ese articulo';
  const quantityLabel = signal.quantity && signal.quantity > 1
    ? ` x${signal.quantity}`
    : '';

  if (signal.action_mode === 'OPEN_PDP') {
    return signal.kind === 'PARTIAL'
      ? `De tu compra reciente, ${target} sigue siendo la referencia mas util, pero mejor abre la ficha y confirma la version vigente antes de repetirlo.`
      : `Si eso era lo de siempre, ${target} sigue vigente, pero mejor abre la ficha para confirmar la seleccion actual antes de repetirlo.`;
  }

  return signal.kind === 'PARTIAL'
    ? `De tu compra reciente, ${target} si sigue vigente para repetir${quantityLabel}; lo demas ya requiere revision manual.`
    : `Si eso era lo de siempre, ${target} si sigue vigente para repetir${quantityLabel} con el catalogo actual.`;
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

function shouldPreferCompare(input: {
  hasSecondary: boolean;
  currentTurnCompare: boolean;
  currentTurnReady: boolean;
  adaptiveMode: CesarinCommercialConversationMode;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
  compareSupportedByCapsule: boolean;
}): boolean {
  if (!input.hasSecondary) return false;
  if (input.currentTurnCompare) return true;
  if (input.compareSupportedByCapsule) return true;
  if (input.adaptiveMode === 'GUIDED_COMPARE' && input.supportLevel !== 'strong') return true;
  if (input.approximate) return true;
  if (input.currentTurnReady) return false;
  return false;
}

function shouldTriggerSelectorNeeded(input: {
  missingSelector: string | null;
  supportLevel: CesarinCommercialSupportLevel;
  hasSecondary: boolean;
  approximate: boolean;
  currentTurnCompare: boolean;
}): boolean {
  if (!input.missingSelector) return false;
  if (input.approximate) return false;
  if (input.supportLevel !== 'strong') return false;
  if (input.hasSecondary) return false;
  if (input.currentTurnCompare) return false;

  return true;
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
        ? `${primary.name} ya esta bastante claro; si ya te cerro, agregalo y listo.`
        : 'Si ya te cerro, agregalo y listo.';
    case 'SELECTOR_NEEDED':
      return primary && selectorLabel
        ? `${primary.name} se ve bien; solo faltaria elegir ${selectorLabel}.`
        : 'Solo faltaria elegir un dato clave.';
    case 'COMPARE_TWO':
      return primary && secondary
        ? `${primary.name} y ${secondary.name} son los dos que mas sentido traen; yo compararia esos antes de decidir.`
        : 'Aqui conviene comparar dos opciones viables.';
    case 'KEEP_EXPLORING':
      return supportLevel === 'weak'
        ? 'Todavia no veo una clara; mejor afinamos un poco mas y de ahi sale mejor.'
        : 'Ahorita lo mas util es seguir viendo opciones.';
    default:
      return primary
        ? supportLevel === 'weak'
          ? `${primary.name} pinta mejor por ahora; yo lo revisaria primero y si no te convence, le damos otra vuelta.`
          : `${primary.name} es el que mejor parado viene; revisalo y con eso decides mas aterrizado.`
        : 'Primero revisa la opcion mas prometedora.';
  }
}

function buildActionButtons(
  family: CesarinStorefrontNextStepFamily,
  primary: CesarinActionProductRef | undefined,
  secondary: CesarinActionProductRef | undefined,
  replenishmentSignal?: CesarinStorefrontReplenishmentSignal | null,
): Pick<CesarinStorefrontNextStepView, 'primaryAction' | 'secondaryAction'> {
  switch (family) {
    case 'ADD_READY':
      return primary
        ? {
            primaryAction: {
              kind: 'ADD_TO_CART',
              label: replenishmentSignal?.quantity && replenishmentSignal.quantity > 1
                ? `Agregar ${replenishmentSignal.quantity} x ${primary.name}`
                : `Agregar ${primary.name}`,
              product: primary,
              quantity: replenishmentSignal?.quantity,
              variantToken: replenishmentSignal?.variant_id
                ? {
                    id: replenishmentSignal.variant_id,
                    name: replenishmentSignal.variant_label?.trim() || 'Variante',
                  }
                : null,
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

function shouldSuppressSecondaryHelpForDirectAnswer(input: {
  directAnswerComplete: boolean;
  family: CesarinStorefrontNextStepFamily;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
  hasSecondary: boolean;
  missingSelector: string | null;
  currentTurnCompare: boolean;
  currentTurnReady: boolean;
  currentTurnExplore: boolean;
  hesitation: boolean;
}): boolean {
  if (!input.directAnswerComplete) return false;
  if (input.family === 'KEEP_EXPLORING' || input.family === 'COMPARE_TWO' || input.family === 'SELECTOR_NEEDED') return false;
  if (input.supportLevel !== 'strong') return false;
  if (input.approximate) return false;
  if (input.hasSecondary) return false;
  if (input.missingSelector) return false;
  if (input.currentTurnCompare || input.currentTurnReady || input.currentTurnExplore || input.hesitation) return false;

  return true;
}

function shouldKeepGuidanceVisible(input: {
  baseMessage: string;
  guidance: string;
  family: CesarinStorefrontNextStepFamily;
  missingSelector: string | null;
}): boolean {
  if (!input.guidance) return false;

  if (input.family === 'SELECTOR_NEEDED') {
    const normalizedMessage = normalizeCompactText(input.baseMessage);
    const normalizedSelector = normalizeCompactText(input.missingSelector ?? '');
    if (!normalizedSelector) {
      return isMeaningfullyDistinct(input.baseMessage, input.guidance);
    }

    return !normalizedMessage.includes(normalizedSelector);
  }

  return isMeaningfullyDistinct(input.baseMessage, input.guidance);
}

function shouldSurfaceAttachmentOffer(input: {
  offer?: CesarinStorefrontAttachmentOffer | null;
  primary?: CesarinActionProduct;
  family: CesarinStorefrontNextStepFamily;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
  currentTurnCompare: boolean;
  currentTurnExplore: boolean;
  directAnswerComplete: boolean;
}): input is {
  offer: CesarinStorefrontAttachmentOffer;
  primary: CesarinActionProduct;
  family: CesarinStorefrontNextStepFamily;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
  currentTurnCompare: boolean;
  currentTurnExplore: boolean;
  directAnswerComplete: boolean;
} {
  if (!input.offer || !input.primary) return false;
  if (input.offer.primary_product_id !== input.primary.id) return false;
  if (input.family !== 'REVIEW_ONE' && input.family !== 'ADD_READY') return false;
  if (input.supportLevel !== 'strong') return false;
  if (input.approximate || input.currentTurnCompare || input.currentTurnExplore) return false;
  if (input.directAnswerComplete) return false;

  return true;
}

export function buildCesarinActionableNextStepView<T extends CesarinActionProduct>(
  input: BuildCesarinActionableNextStepInput<T>,
): CesarinActionableConversationView<T> {
  const upstreamCommercialMove = input.commercialMove ?? input.turnAnalysis?.commercial_move ?? null;
  const hasUpstreamCommercialMove = Boolean(upstreamCommercialMove);
  const fallbackCommercialJudgment = upstreamCommercialMove
    ? null
    : resolveCesarinTurnCommercialJudgment({
        query: input.query,
        history: input.history,
        preferenceSummary: input.preferenceSummary,
        matchStrategy: input.matchStrategy,
        visibleProductCount: input.visibleProducts.length,
        turnAnalysis: input.turnAnalysis,
      });
  const commercialMove = upstreamCommercialMove ?? fallbackCommercialJudgment?.move ?? 'KEEP_EXPLORING';
  const normalizedQuery = normalizeText(input.query);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const currentTurnCompare = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const currentTurnExplore = isStrictExplorationQuery(normalizedQuery);
  const currentTurnReady = isReadyToCloseQuery(normalizedQuery);
  const hesitation = isHesitationQuery(normalizedQuery);
  const directAnswerComplete = input.capsuleTruthSignals?.direct_answer_complete === true;
  const compareSupportedByCapsule = input.capsuleHelpContract?.compare_supported === true;
  const primary = input.visibleProducts[0];
  const secondary = input.visibleProducts[1];
  const enrichedPrimary = primary ? input.enrichedProductsById?.[primary.id] : undefined;
  const replenishmentSignal = getPrimaryReplenishmentSignal(input.capsuleReplenishmentSignal ?? null, primary);
  const variantTruth = getVariantTruth(primary);
  const variantNeedsReview = Boolean(variantTruth?.requested_variant_intent && variantTruth.availability !== 'available');
  const missingSelector = primary ? getMissingSelectorLabel(primary, enrichedPrimary, input.query) : null;
  const replenishmentAllowsDirectAdd = replenishmentSignal?.action_mode === 'ADD_TO_CART';
  const variantNeedsSelector = !replenishmentAllowsDirectAdd && variantNeedsReview && Boolean(missingSelector);
  const supportLevel = resolveCesarinCommercialSupportLevel({
    matchStrategy: input.matchStrategy,
    visibleProductCount: input.visibleProducts.length,
    approximate,
  });
  const selectorNeeded = replenishmentAllowsDirectAdd
    ? false
    : shouldTriggerSelectorNeeded({
    missingSelector,
    supportLevel,
    hasSecondary: Boolean(secondary),
    approximate,
    currentTurnCompare,
  });
  const canAddReady = supportLevel === 'strong'
    && !secondary
    && (replenishmentAllowsDirectAdd || isAddReadyProduct(enrichedPrimary))
    && !approximate;
  const canAddReadyWithVariantTruth = canAddReady && (!variantNeedsReview || replenishmentAllowsDirectAdd);
  let family: CesarinStorefrontNextStepFamily;

  if (!primary) {
    family = 'KEEP_EXPLORING';
  } else if (replenishmentSignal && !currentTurnCompare && !currentTurnExplore) {
    family = replenishmentAllowsDirectAdd ? 'ADD_READY' : 'REVIEW_ONE';
  } else if (hasUpstreamCommercialMove) {
    if (commercialMove === 'KEEP_EXPLORING') {
      family = 'KEEP_EXPLORING';
    } else if (commercialMove === 'COMPARE_TWO') {
      family = secondary ? 'COMPARE_TWO' : 'KEEP_EXPLORING';
    } else if (commercialMove === 'ADD_READY') {
      family = selectorNeeded || variantNeedsSelector ? 'SELECTOR_NEEDED' : canAddReadyWithVariantTruth ? 'ADD_READY' : 'REVIEW_ONE';
    } else {
      family = selectorNeeded ? 'SELECTOR_NEEDED' : 'REVIEW_ONE';
    }
  } else if (
    (commercialMove === 'KEEP_EXPLORING' && !compareSupportedByCapsule)
    || (
      currentTurnExplore
      && !compareSupportedByCapsule
      && !currentTurnReady
      && !currentTurnCompare
    )
    || (input.adaptiveMode === 'EXPLORE_LIGHT' && commercialMove !== 'COMPARE_TWO')
    || (
      supportLevel === 'weak'
      && !compareSupportedByCapsule
      && !currentTurnReady
      && !currentTurnCompare
      && (secondary || input.adaptiveMode === 'GUIDED_COMPARE')
    )
  ) {
    family = 'KEEP_EXPLORING';
  } else if ((commercialMove === 'COMPARE_TWO' || compareSupportedByCapsule) && secondary) {
    family = 'COMPARE_TWO';
  } else if (shouldPreferCompare({
    hasSecondary: Boolean(secondary),
    currentTurnCompare,
    currentTurnReady,
    adaptiveMode: input.adaptiveMode,
    supportLevel,
    approximate,
    compareSupportedByCapsule,
  })) {
    family = 'COMPARE_TWO';
  } else if ((selectorNeeded || variantNeedsSelector) && (input.adaptiveMode === 'DIRECT_RECOMMEND' || input.adaptiveMode === 'READY_TO_CLOSE')) {
    family = 'SELECTOR_NEEDED';
  } else if (
    (commercialMove === 'ADD_READY' || input.adaptiveMode === 'READY_TO_CLOSE' || currentTurnReady)
    && canAddReadyWithVariantTruth
  ) {
    family = 'ADD_READY';
  } else if (
    commercialMove === 'REVIEW_ONE'
    || hesitation
    || input.adaptiveMode === 'SOFT_REASSURE'
    || input.adaptiveMode === 'DIRECT_RECOMMEND'
    || primary
  ) {
    family = 'REVIEW_ONE';
  } else {
    family = 'KEEP_EXPLORING';
  }

  const primaryRef = toProductRef(primary);
  const surfacedAttachmentOffer = !replenishmentSignal && shouldSurfaceAttachmentOffer({
    offer: input.capsuleAttachmentOffer ?? null,
    primary,
    family,
    supportLevel,
    approximate,
    currentTurnCompare,
    currentTurnExplore,
    directAnswerComplete,
  })
    ? input.capsuleAttachmentOffer
    : null;
  const secondaryRef = family === 'COMPARE_TWO'
    ? toProductRef(secondary)
    : surfacedAttachmentOffer?.attached_product;
  const baseGuidance = replenishmentSignal
    ? buildReplenishmentGuidance(replenishmentSignal)
    : buildStepMessage(family, primaryRef, family === 'COMPARE_TWO' ? secondaryRef : undefined, missingSelector, supportLevel);
  const variantGuidance = replenishmentSignal ? null : buildVariantTruthGuidance(primary);
  const guidance = surfacedAttachmentOffer
    ? `${baseGuidance} ${buildAttachmentGuidance(surfacedAttachmentOffer)}`.trim()
    : baseGuidance;
  const guidedWithVariantTruth = variantGuidance && !guidance.includes(variantGuidance)
    ? `${guidance} ${variantGuidance}`
    : guidance;
  const actions = buildActionButtons(family, primaryRef, secondaryRef, replenishmentSignal);
  if (surfacedAttachmentOffer && !actions.secondaryAction) {
    actions.secondaryAction = {
      kind: 'OPEN_PDP',
      label: `Revisar ${surfacedAttachmentOffer.attached_product.name}`,
      product: surfacedAttachmentOffer.attached_product,
    };
  }
  const assistAction = buildAssistAction({ family, supportLevel });
  const secondaryHelpSuppressed = shouldSuppressSecondaryHelpForDirectAnswer({
    directAnswerComplete,
    family,
    supportLevel,
    approximate,
    hasSecondary: Boolean(secondary),
    missingSelector,
    currentTurnCompare,
    currentTurnReady,
    currentTurnExplore,
    hesitation,
  });
  const guidanceShouldRender = shouldKeepGuidanceVisible({
    baseMessage: input.baseMessage,
    guidance,
    family,
    missingSelector,
  });
  const hasMaterialHelp = !secondaryHelpSuppressed && Boolean(
    guidanceShouldRender
    || actions.primaryAction
    || actions.secondaryAction
    || assistAction,
  );
  const surfaceKind = family === 'ADD_READY' && actions.primaryAction?.kind === 'ADD_TO_CART'
    ? 'ACTIONABLE'
    : 'CATALOG_HELP';

  return {
    family,
    visibleProducts: input.visibleProducts,
    message: input.baseMessage.trim() || guidance,
    secondaryHelpSuppressed,
    nextStep: {
      family,
      guidance: guidedWithVariantTruth,
      renderHint: hasMaterialHelp ? 'SHOW' : 'HIDE',
      surfaceKind,
      primaryProduct: primaryRef,
      secondaryProduct: secondaryRef,
      missingSelector,
      primaryAction: actions.primaryAction,
      secondaryAction: actions.secondaryAction,
      assistAction,
    },
  };
}
