export interface SoftContinuityHistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface SoftContinuityCustomerContext {
  ia_context?: {
    last_query?: string | null;
    last_intent?: string | null;
    updated_at?: string | null;
    last_update?: string | null;
  } | null;
}

export interface SoftContinuityMemoryContext {
  last_interaction_at?: string | null;
}

export interface SoftContinuityContext {
  source: 'recent_history' | 'authenticated_context' | 'none';
  recent_topic: string | null;
  previous_lane: string | null;
  current_lane: string;
  topic_shift: boolean;
  should_offer_soft_reopen: boolean;
  prompt_block: string | null;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function compactTopic(value: string, maxLength = 72): string {
  const compacted = value.replace(/\s+/g, ' ').trim().replace(/^["'`]+|["'`]+$/g, '');
  if (compacted.length <= maxLength) return compacted;
  return `${compacted.slice(0, maxLength - 3).trim()}...`;
}

function inferLaneFromText(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) return 'UNKNOWN';

  if (/(hola|buenas|que onda|como estas|gracias|sale|arre)\b/.test(normalized)) return 'CHIT_CHAT';
  if (/(tracking|rastreo|rastrear|guia|pedido|orden|vsm-\d+)/.test(normalized)) return 'ORDER_TRACKING';
  if (/(envio|envios|politica|politicas|garantia|reembolso|devolucion|devoluciones|pago|pagos|deposito|transferencia|dhl)/.test(normalized)) return 'POLICY_INQUIRY';
  if (/(compatible|compatibilidad|coil|resistencia|rosca|equipo|sirve para|le queda)/.test(normalized)) return 'COMPATIBILITY_CHECK';
  if (/(carrito|agrega|anade|quitar|quita|sumale|mandalo al carrito)/.test(normalized)) return 'CART_OPERATION';
  if (/https?:\/\/|pagina|sitio|web|oficial|busca en web|resumeme esta url/.test(normalized)) return 'PUBLIC_INFO';
  if (/(lo de siempre|lo mismo|quiero lo mismo|mis pods|quiero repetir|repetir|volver a pedir|vape|pod|liquido|cartucho|desechable|kit|modelo|modelos|sabor|sabores|recomiend|opciones|producto|productos|busco|quiero algo)/.test(normalized)) return 'PRODUCT_SEARCH';
  return 'UNKNOWN';
}

function inferLane(value: string | null | undefined): string | null {
  if (!value) return null;

  const normalized = normalizeText(value);
  if (!normalized) return null;

  switch (normalized.toUpperCase()) {
    case 'PRODUCT_SEARCH':
    case 'POLICY_INQUIRY':
    case 'ORDER_TRACKING':
    case 'COMPATIBILITY_CHECK':
    case 'CART_OPERATION':
    case 'PUBLIC_INFO':
    case 'CHIT_CHAT':
    case 'OUT_OF_DOMAIN':
    case 'UNKNOWN':
      return normalized.toUpperCase();
    default:
      return inferLaneFromText(value);
  }
}

function findPreviousUserTurn(
  history: SoftContinuityHistoryTurn[],
  currentQuery: string,
): string | null {
  const normalizedCurrent = normalizeText(currentQuery);

  for (let index = history.length - 1; index >= 0; index -= 1) {
    const turn = history[index];
    if (turn?.role !== 'user' || typeof turn.content !== 'string') continue;

    const normalizedTurn = normalizeText(turn.content);
    if (!normalizedTurn) continue;
    if (normalizedTurn === normalizedCurrent) continue;

    return turn.content.trim();
  }

  return null;
}

function looksBroadFollowUp(query: string): boolean {
  const normalized = normalizeText(query);
  if (!normalized) return false;

  return normalized.length <= 60
    && /(y\b|y de eso|y de esos|y en eso|entonces|ok|va|de lo mismo|algo asi|algo de eso|cual me conviene|cual te late|cual seria|y ahora|otra opcion|otra cosa)/.test(normalized);
}

function buildPromptBlock(input: {
  source: SoftContinuityContext['source'];
  recentTopic: string | null;
  previousLane: string | null;
  currentLane: string;
  topicShift: boolean;
  shouldOfferSoftReopen: boolean;
  lastInteractionAt?: string | null;
}): string | null {
  if (input.source === 'none' || !input.recentTopic) return null;

  const label = input.source === 'recent_history'
    ? 'CONTINUIDAD RECIENTE DE SESION'
    : 'CONTINUIDAD AUTENTICADA LIGERA';

  const lines = [
    `--- ${label} ---`,
    `TEMA PREVIO UTIL: ${input.recentTopic}`,
    `CARRIL PREVIO: ${input.previousLane || 'UNKNOWN'}`,
    `CARRIL ACTUAL ESTIMADO: ${input.currentLane}`,
  ];

  if (input.lastInteractionAt) {
    lines.push(`ULTIMA INTERACCION REGISTRADA: ${input.lastInteractionAt}`);
  }

  if (input.topicShift) {
    lines.push('REGLA: el turno actual manda. Si mencionas el contexto previo, que sea solo para reabrir suave y sin arrastrar el carril viejo.');
  } else if (input.shouldOfferSoftReopen) {
    lines.push('REGLA: si ayuda a evitar repeticion, puedes abrir con una sola frase corta y humilde para retomar el contexto sin asumir que sigue exactamente en eso.');
  } else {
    lines.push('REGLA: usa este contexto solo si ahorra repeticion real. Si no aporta, mejor no lo menciones.');
  }

  lines.push('No repitas toda la historia, no suenes como transcript andante y no abras catalogo solo por continuidad.');

  return lines.join(' ');
}

export function buildSoftContinuityContext(input: {
  query: string;
  history?: SoftContinuityHistoryTurn[] | null;
  customerContext?: SoftContinuityCustomerContext | null;
  customerMemory?: SoftContinuityMemoryContext | null;
}): SoftContinuityContext {
  const history = Array.isArray(input.history) ? input.history : [];
  const previousHistoryTopic = findPreviousUserTurn(history, input.query);
  const authenticatedTopic = typeof input.customerContext?.ia_context?.last_query === 'string'
    && normalizeText(input.customerContext.ia_context.last_query).length > 0
    && normalizeText(input.customerContext.ia_context.last_query) !== normalizeText(input.query)
      ? input.customerContext.ia_context.last_query.trim()
      : null;

  const source: SoftContinuityContext['source'] = previousHistoryTopic
    ? 'recent_history'
    : authenticatedTopic
      ? 'authenticated_context'
      : 'none';

  const recentTopic = compactTopic(previousHistoryTopic || authenticatedTopic || '');
  const currentLane = inferLaneFromText(input.query);
  const previousLane = source === 'recent_history'
    ? inferLane(previousHistoryTopic)
    : inferLane(input.customerContext?.ia_context?.last_intent || authenticatedTopic);
  const topicShift = Boolean(
    previousLane
    && previousLane !== 'UNKNOWN'
    && currentLane !== 'UNKNOWN'
    && previousLane !== currentLane,
  );
  const shouldOfferSoftReopen = Boolean(
    source !== 'none'
    && recentTopic
    && !topicShift
    && (looksBroadFollowUp(input.query) || previousLane === currentLane || currentLane === 'UNKNOWN'),
  );

  return {
    source,
    recent_topic: recentTopic || null,
    previous_lane: previousLane || null,
    current_lane: currentLane,
    topic_shift: topicShift,
    should_offer_soft_reopen: shouldOfferSoftReopen,
    prompt_block: buildPromptBlock({
      source,
      recentTopic: recentTopic || null,
      previousLane: previousLane || null,
      currentLane,
      topicShift,
      shouldOfferSoftReopen,
      lastInteractionAt: input.customerMemory?.last_interaction_at ?? null,
    }),
  };
}
