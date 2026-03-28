import type { CustomerPreferenceSummary } from './memory.ts';

export type CesarinCommercialConversationMode =
  | 'DIRECT_RECOMMEND'
  | 'GUIDED_COMPARE'
  | 'SOFT_REASSURE'
  | 'EXPLORE_LIGHT'
  | 'READY_TO_CLOSE';

interface ResolveCesarinConversationModeInput {
  query: string;
  history?: Array<{ role?: string; content?: string | null } | null> | null;
  preferenceSummary?: CustomerPreferenceSummary | null;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hasStrongMemory(summary?: CustomerPreferenceSummary | null): boolean {
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

function hasWeakOnlyMemory(summary?: CustomerPreferenceSummary | null): boolean {
  if (!summary) return false;
  if (hasStrongMemory(summary)) return false;
  return summary.weak_tendencies.length > 0;
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

function recentHistoryShowsComparison(history?: ResolveCesarinConversationModeInput['history']): boolean {
  const normalizedHistory = (history ?? [])
    .slice(-4)
    .map((entry) => normalizeText(entry?.content ?? ''))
    .filter(Boolean);

  return normalizedHistory.some((text) => /(compar|entre|vs|cual conviene|cual sale mejor)/.test(text));
}

export function resolveCesarinCommercialConversationMode(
  input: ResolveCesarinConversationModeInput,
): CesarinCommercialConversationMode {
  const normalizedQuery = normalizeText(input.query);
  const strongMemory = hasStrongMemory(input.preferenceSummary);
  const weakOnlyMemory = hasWeakOnlyMemory(input.preferenceSummary);
  const compareRequested = isCompareQuery(normalizedQuery) || recentHistoryShowsComparison(input.history);
  const readyToClose = isReadyToCloseQuery(normalizedQuery);
  const hesitation = isHesitationQuery(normalizedQuery);
  const broadExploration = isBroadExplorationQuery(normalizedQuery);

  if (readyToClose) return 'READY_TO_CLOSE';
  if (compareRequested) return 'GUIDED_COMPARE';
  if (hesitation) return 'SOFT_REASSURE';
  if (strongMemory && broadExploration) return 'DIRECT_RECOMMEND';
  if (broadExploration && !strongMemory && !weakOnlyMemory) return 'EXPLORE_LIGHT';
  if (weakOnlyMemory && broadExploration) return 'EXPLORE_LIGHT';
  return 'DIRECT_RECOMMEND';
}

export function buildCesarinConversationModePromptGuidance(input: ResolveCesarinConversationModeInput): {
  mode: CesarinCommercialConversationMode;
  guidance: string;
} {
  const mode = resolveCesarinCommercialConversationMode(input);

  switch (mode) {
    case 'DIRECT_RECOMMEND':
      return {
        mode,
        guidance: 'Modo DIRECT_RECOMMEND: si ya hay senal suficiente, da una recomendacion mas corta y util. Reduce preguntas redundantes, abre con la opcion mas prometedora y deja solo una alternativa cercana si de verdad ayuda.',
      };
    case 'GUIDED_COMPARE':
      return {
        mode,
        guidance: 'Modo GUIDED_COMPARE: si hay dos o tres opciones viables, ordena la respuesta como comparacion guiada. Contrasta sin inventar diferencias y evita aventar una lista larga.',
      };
    case 'SOFT_REASSURE':
      return {
        mode,
        guidance: 'Modo SOFT_REASSURE: si el cliente viene con duda o miedo a equivocarse, no resetees la conversacion. Reasegura con una opcion principal bien sustentada y una salida cercana sin empujar de mas.',
      };
    case 'READY_TO_CLOSE':
      return {
        mode,
        guidance: 'Modo READY_TO_CLOSE: si el cliente ya viene casi decidido, simplifica la siguiente jugada. Ve por la mejor opcion primero, evita ramificar de mas y no metas preguntas extra innecesarias.',
      };
    default:
      return {
        mode,
        guidance: 'Modo EXPLORE_LIGHT: si la consulta sigue amplia o la memoria no alcanza, manten la exploracion ligera. No cierres demasiado pronto ni vendas aproximaciones como certeza.',
      };
  }
}
