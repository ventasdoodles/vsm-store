import type { InternalCapsuleContract } from '@/types/ai-capsule';

import type { CesarinPreferenceSummary } from './cesarin-stage3';
import { isCesarinApproximateMatchStrategy } from './cesarin-stage1';

export type CesarinCommercialMove =
  | 'KEEP_EXPLORING'
  | 'COMPARE_TWO'
  | 'REVIEW_ONE'
  | 'ADD_READY';

export type CesarinCommercialSupportLevel = 'weak' | 'supported' | 'strong';

interface ResolveCesarinCommercialJudgmentInput {
  query: string;
  history?: Array<{ role: 'assistant' | 'user'; content: string }> | null;
  preferenceSummary?: CesarinPreferenceSummary | null;
  matchStrategy?: InternalCapsuleContract['match_strategy'] | null;
  visibleProductCount: number;
  turnAnalysis?: { current_turn_decision?: string | null } | null;
}

export interface CesarinCommercialJudgment {
  move: CesarinCommercialMove;
  supportLevel: CesarinCommercialSupportLevel;
  approximate: boolean;
  currentTurnCompare: boolean;
  currentTurnExplore: boolean;
  currentTurnReady: boolean;
  hesitation: boolean;
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

export function isBroadExplorationQuery(query: string): boolean {
  return /(que tienes|que me recomiendas|recomiendame|algo para|quiero ver|ando viendo|busco|opciones|cuales)/.test(query);
}

export function isStrictExplorationQuery(query: string): boolean {
  return /(que tienes|quiero ver|ando viendo|opciones|cuales)/.test(query);
}

export function isCompareQuery(query: string): boolean {
  return /(compar|entre|vs|cual conviene|cual sale mejor|de las dos|de esos|cual te irias)/.test(query);
}

export function isReadyToCloseQuery(query: string): boolean {
  return /(me llevo|agregalo|agregame|lo quiero|me quedo con|pasame ese|dame ese|ya con ese|mandame ese)/.test(query);
}

export function isHesitationQuery(query: string): boolean {
  return /(no se|no estoy seguro|me da cosa|me da miedo|me da pendiente|no me quiero equivocar|sera|convendra|tantita duda|duda)/.test(query);
}

export function historyShowsComparison(history?: ResolveCesarinCommercialJudgmentInput['history']): boolean {
  return (history ?? [])
    .slice(-4)
    .some((entry) => isCompareQuery(normalizeText(entry.content)));
}

export function resolveCesarinCommercialSupportLevel(input: {
  matchStrategy?: InternalCapsuleContract['match_strategy'] | null;
  visibleProductCount: number;
  approximate: boolean;
}): CesarinCommercialSupportLevel {
  const strategy = input.matchStrategy ?? null;

  if (input.visibleProductCount === 0) return 'weak';
  if (strategy === 'FEATURED_FALLBACK' || strategy === 'NO_MATCH') return 'weak';
  if (input.approximate || strategy === 'SEMANTIC') return 'weak';
  if (strategy === 'TOKEN_RECOVERY' || strategy === 'OUT_OF_STOCK_ALTERNATIVE') {
    return input.visibleProductCount === 1 ? 'strong' : 'supported';
  }
  if (strategy === 'EXACT') {
    return input.visibleProductCount === 1 ? 'strong' : 'supported';
  }

  return input.visibleProductCount === 1 ? 'supported' : 'weak';
}

export function resolveCesarinTurnCommercialJudgment(
  input: ResolveCesarinCommercialJudgmentInput,
): CesarinCommercialJudgment {
  const normalizedQuery = normalizeText(input.query);
  const approximate = isCesarinApproximateMatchStrategy(input.matchStrategy);
  const supportLevel = resolveCesarinCommercialSupportLevel({
    matchStrategy: input.matchStrategy,
    visibleProductCount: input.visibleProductCount,
    approximate,
  });
  const currentTurnCompare = isCompareQuery(normalizedQuery) || historyShowsComparison(input.history);
  const currentTurnExplore = isStrictExplorationQuery(normalizedQuery);
  const currentTurnReady = isReadyToCloseQuery(normalizedQuery);
  const hesitation = isHesitationQuery(normalizedQuery);
  const strongMemory = hasStrongMemory(input.preferenceSummary);
  const broadExploration = isBroadExplorationQuery(normalizedQuery);
  const similaritySearch = /(parecid|similar|algo asi|de ese estilo)/.test(normalizedQuery);
  const clarificationFirst = input.turnAnalysis?.current_turn_decision === 'ASK_CLARIFYING_QUESTION';

  let move: CesarinCommercialMove;

  if (input.visibleProductCount === 0) {
    move = 'KEEP_EXPLORING';
  } else if (currentTurnReady && !approximate && supportLevel === 'strong' && input.visibleProductCount === 1) {
    move = 'ADD_READY';
  } else if (currentTurnCompare && input.visibleProductCount >= 2) {
    move = 'COMPARE_TWO';
  } else if (supportLevel === 'weak' && (currentTurnExplore || similaritySearch || (broadExploration && !strongMemory))) {
    move = 'KEEP_EXPLORING';
  } else if (clarificationFirst && input.visibleProductCount === 1 && !currentTurnExplore && !currentTurnCompare) {
    move = 'REVIEW_ONE';
  } else if (input.visibleProductCount >= 2) {
    move = supportLevel === 'weak' && broadExploration ? 'KEEP_EXPLORING' : 'COMPARE_TWO';
  } else if (supportLevel === 'weak' && (currentTurnExplore || currentTurnCompare)) {
    move = 'KEEP_EXPLORING';
  } else if (hesitation && input.visibleProductCount > 0) {
    move = 'REVIEW_ONE';
  } else {
    move = 'REVIEW_ONE';
  }

  return {
    move,
    supportLevel,
    approximate,
    currentTurnCompare,
    currentTurnExplore,
    currentTurnReady,
    hesitation,
  };
}
