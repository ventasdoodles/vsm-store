import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import { isCesarinApproximateMatchStrategy } from './cesarin-stage1';

export type CesarinCommercialConversationMode =
  | 'DIRECT_RECOMMEND'
  | 'GUIDED_COMPARE'
  | 'SOFT_REASSURE'
  | 'EXPLORE_LIGHT'
  | 'READY_TO_CLOSE';

type CesarinVisibleProduct =
  | Pick<Product, 'id' | 'name' | 'slug' | 'section'>
  | Pick<InternalResolvedProduct, 'id' | 'name' | 'slug' | 'section'>;

interface BuildCesarinAdaptiveConversationViewInput<T extends CesarinVisibleProduct> {
  query: string;
  history?: Array<{ role: 'assistant' | 'user'; content: string }> | null;
  products: T[];
  baseMessage: string;
  preferenceSummary?: CesarinPreferenceSummary | null;
  matchStrategy?: InternalCapsuleContract['match_strategy'] | null;
  modeHint?: string | null;
}

export interface CesarinAdaptiveConversationView<T extends CesarinVisibleProduct> {
  mode: CesarinCommercialConversationMode;
  visibleProducts: T[];
  message: string;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hasStrongMemory(summary?: CesarinPreferenceSummary | null): boolean {
  if (!summary) return false;

  return Boolean(
    summary.confirmed_likes.length ||
    summary.explicit_likes.length ||
    summary.rejected_preferences.length ||
    summary.format_preferences.length ||
    summary.brand_affinity.length ||
    summary.budget_posture ||
    summary.intensity_posture ||
    summary.experience_posture,
  );
}

function isBroadExplorationQuery(query: string): boolean {
  return /(que tienes|que me recomiendas|recomiendame|algo|quiero ver|ando viendo|busco|opciones|cuales)/.test(query);
}

function isCompareQuery(query: string): boolean {
  return /(compar|entre|vs|cual conviene|cual sale mejor|de las dos|de esos|cual te irias)/.test(query);
}

function isReadyToCloseQuery(query: string): boolean {
  return /(me llevo|agregalo|agregame|lo quiero|me quedo con|pasame ese|dame ese|ya con ese|mandame ese)/.test(query);
}

function isHesitationQuery(query: string): boolean {
  return /(no se|no estoy seguro|me da cosa|me da miedo|me da pendiente|no me quiero equivocar|sera|convendra|tantita duda|duda)/.test(query);
}

function historyShowsComparison(history?: BuildCesarinAdaptiveConversationViewInput<CesarinVisibleProduct>['history']): boolean {
  return (history ?? [])
    .slice(-4)
    .some((entry) => /(compar|entre|vs|cual conviene|cual sale mejor)/.test(normalizeText(entry.content)));
}

function isValidMode(value?: string | null): value is CesarinCommercialConversationMode {
  return value === 'DIRECT_RECOMMEND'
    || value === 'GUIDED_COMPARE'
    || value === 'SOFT_REASSURE'
    || value === 'EXPLORE_LIGHT'
    || value === 'READY_TO_CLOSE';
}

function resolveMode<T extends CesarinVisibleProduct>(input: BuildCesarinAdaptiveConversationViewInput<T>): CesarinCommercialConversationMode {
  const normalizedQuery = normalizeText(input.query);
  const strongMemory = hasStrongMemory(input.preferenceSummary);
  const broadExploration = isBroadExplorationQuery(normalizedQuery);
  const compareRequested = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const readyToClose = isReadyToCloseQuery(normalizedQuery);
  const hesitation = isHesitationQuery(normalizedQuery);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);

  if (readyToClose && !approximate) return 'READY_TO_CLOSE';
  if (compareRequested && input.products.length >= 2) return 'GUIDED_COMPARE';
  if (hesitation && input.products.length > 0) return 'SOFT_REASSURE';

  if (isValidMode(input.modeHint)) {
    if (input.modeHint === 'READY_TO_CLOSE' && approximate) {
      return strongMemory ? 'DIRECT_RECOMMEND' : 'SOFT_REASSURE';
    }
    return input.modeHint;
  }

  if (strongMemory && broadExploration && input.products.length > 0) {
    return approximate ? 'GUIDED_COMPARE' : 'DIRECT_RECOMMEND';
  }

  if (broadExploration) return 'EXPLORE_LIGHT';
  if (input.products.length <= 2) return approximate ? 'GUIDED_COMPARE' : 'DIRECT_RECOMMEND';
  return 'EXPLORE_LIGHT';
}

function getVisibleProductLimit(mode: CesarinCommercialConversationMode, approximate: boolean, productCount: number): number {
  if (productCount <= 1) return productCount;

  switch (mode) {
    case 'READY_TO_CLOSE':
      return approximate ? Math.min(2, productCount) : 1;
    case 'DIRECT_RECOMMEND':
      return Math.min(2, productCount);
    case 'GUIDED_COMPARE':
      return Math.min(2, productCount);
    case 'SOFT_REASSURE':
      return Math.min(2, productCount);
    default:
      return Math.min(3, productCount);
  }
}

function appendAdaptiveTail<T extends CesarinVisibleProduct>(
  mode: CesarinCommercialConversationMode,
  baseMessage: string,
  visibleProducts: T[],
): string {
  const trimmedBaseMessage = baseMessage.trim();
  if (trimmedBaseMessage) return trimmedBaseMessage;

  const top = visibleProducts[0];
  const alt = visibleProducts[1];

  if (!top) return trimmedBaseMessage;

  return (() => {
    switch (mode) {
      case 'DIRECT_RECOMMEND':
        return alt
          ? `${top.name} va primero y ${alt.name} se queda cerca por si quieres comparar.`
          : `${top.name} va primero.`;
      case 'GUIDED_COMPARE':
        return alt
          ? `Compara primero ${top.name} con ${alt.name}.`
          : `Primero revisa ${top.name}.`;
      case 'SOFT_REASSURE':
        return alt
          ? `${top.name} es la referencia mas clara y ${alt.name} queda como respaldo.`
          : `${top.name} es la referencia mas clara.`;
      case 'READY_TO_CLOSE':
        return alt
          ? `${top.name} ya va al frente; ${alt.name} queda como segunda opcion.`
          : `${top.name} ya va al frente.`;
      default:
        return 'Te dejo esto para explorar sin forzarte un cierre.';
    }
  })();
}

export function buildCesarinAdaptiveConversationView<T extends CesarinVisibleProduct>(
  input: BuildCesarinAdaptiveConversationViewInput<T>,
): CesarinAdaptiveConversationView<T> {
  const mode = resolveMode(input);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const visibleProducts = input.products.slice(0, getVisibleProductLimit(mode, approximate, input.products.length));

  return {
    mode,
    visibleProducts,
    message: appendAdaptiveTail(mode, input.baseMessage, visibleProducts),
  };
}
