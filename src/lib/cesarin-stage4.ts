import type { InternalCapsuleContract, InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import {
  historyShowsComparison,
  isBroadExplorationQuery,
  isCompareQuery,
  isHesitationQuery,
  resolveCesarinCommercialSupportLevel,
  resolveCesarinTurnCommercialJudgment,
  type CesarinCommercialMove,
} from './cesarin-commercial-judgment';
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
  turnAnalysis?: { primary_intent?: string | null; current_turn_decision?: string | null; commercial_move?: CesarinCommercialMove | null } | null;
}

export interface CesarinAdaptiveConversationView<T extends CesarinVisibleProduct> {
  mode: CesarinCommercialConversationMode;
  visibleProducts: T[];
  message: string;
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

function resolveMode<T extends CesarinVisibleProduct>(input: BuildCesarinAdaptiveConversationViewInput<T>): CesarinCommercialConversationMode {
  const normalizedQuery = input.query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const upstreamCommercialMove = input.turnAnalysis?.commercial_move ?? null;
  const commercialMove = upstreamCommercialMove
    ?? resolveCesarinTurnCommercialJudgment({
      query: input.query,
      history: input.history,
      preferenceSummary: input.preferenceSummary,
      matchStrategy: input.matchStrategy,
      visibleProductCount: input.products.length,
      turnAnalysis: input.turnAnalysis,
    }).move;
  const broadExploration = isBroadExplorationQuery(normalizedQuery);
  const hesitation = isHesitationQuery(normalizedQuery);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const currentTurnCompare = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const supportLevel = resolveCesarinCommercialSupportLevel({
    matchStrategy: input.matchStrategy,
    visibleProductCount: input.products.length,
    approximate,
  });
  const strongMemory = hasStrongMemory(input.preferenceSummary);

  // Model-first: use turn_analysis as primary signal when available
  const modelDecision = input.turnAnalysis?.current_turn_decision ?? null;
  if (modelDecision === 'ASK_CLARIFYING_QUESTION' && input.products.length > 0) return 'SOFT_REASSURE';
  if (modelDecision === 'ASK_CLARIFYING_QUESTION') return 'EXPLORE_LIGHT';
  if (hesitation && input.products.length > 0) return 'SOFT_REASSURE';

  if (commercialMove === 'ADD_READY') return 'READY_TO_CLOSE';
  if (
    commercialMove === 'COMPARE_TWO'
    && (currentTurnCompare || input.products.length <= 2 || supportLevel === 'weak')
  ) {
    return 'GUIDED_COMPARE';
  }
  if (commercialMove === 'REVIEW_ONE' && (supportLevel === 'weak' || hesitation)) {
    return 'SOFT_REASSURE';
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
          ? `${top.name} me cuadra primero y ${alt.name} se queda cerca si quieres compararlos bien.`
          : `${top.name} me cuadra primero.`;
      case 'GUIDED_COMPARE':
        return alt
          ? `Yo pondria primero ${top.name} contra ${alt.name}; ahi se aclara mas facil.`
          : `Yo revisaria primero ${top.name}.`;
      case 'SOFT_REASSURE':
        return alt
          ? `${top.name} pinta mas claro y ${alt.name} te queda de respaldo si quieres contrastar.`
          : `${top.name} pinta mas claro.`;
      case 'READY_TO_CLOSE':
        return alt
          ? `${top.name} ya viene adelante; ${alt.name} te queda como plan B si algo no te cierra.`
          : `${top.name} ya viene adelante.`;
      default:
        return 'Te dejo esto para que lo veas con calma, sin forzarte un cierre.';
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
