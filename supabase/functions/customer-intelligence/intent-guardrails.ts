import type { ToolCall } from './tools.ts';

export type StorefrontResolvedIntent =
    | 'CART_OPERATION'
    | 'POLICY_INQUIRY'
    | 'PRODUCT_SEARCH'
    | 'ORDER_TRACKING'
    | 'INVENTORY_OUTLOOK'
    | 'COMPATIBILITY_CHECK'
    | 'CHIT_CHAT'
    | 'UNKNOWN'
    | 'OUT_OF_DOMAIN';

export type TurnDecision = 'DIRECT_ANSWER' | 'ASK_CLARIFYING_QUESTION' | 'USE_CAPABILITY';

export interface StorefrontTurnSignals {
    normalizedQuery: string;
    isCompatibilityMatch: boolean;
    isInventoryMatch: boolean;
    isPolicyMatch: boolean;
    isProductMatch: boolean;
    isGreeting: boolean;
    isTrackingMatch: boolean;
    isCartMatch: boolean;
    isTimeContext: boolean;
}

export interface TurnFirstIntentProfile {
    primary_intent: StorefrontResolvedIntent;
    secondary_intents: StorefrontResolvedIntent[];
    turn_priority: StorefrontResolvedIntent[];
    current_turn_decision: TurnDecision;
    turn_focus:
        | 'compatibility'
        | 'tracking'
        | 'policy'
        | 'inventory'
        | 'cart'
        | 'product'
        | 'conversation'
        | 'out_of_domain'
        | 'unknown';
    primary_tool_calls: ToolCall[];
    queued_tool_calls: ToolCall[];
}

const INTENT_PRIORITY: Record<StorefrontResolvedIntent, number> = {
    OUT_OF_DOMAIN: 0,
    COMPATIBILITY_CHECK: 1,
    ORDER_TRACKING: 2,
    POLICY_INQUIRY: 3,
    INVENTORY_OUTLOOK: 4,
    CART_OPERATION: 5,
    PRODUCT_SEARCH: 6,
    CHIT_CHAT: 7,
    UNKNOWN: 8,
};

const INTENT_TOOL_NAMES: Record<Exclude<StorefrontResolvedIntent, 'UNKNOWN' | 'OUT_OF_DOMAIN'>, string[]> = {
    CART_OPERATION: ['cart_operator'],
    POLICY_INQUIRY: ['knowledge_rag_foundation', 'get_store_policy'],
    PRODUCT_SEARCH: ['product_search_integrity', 'search_products'],
    ORDER_TRACKING: ['track_order'],
    INVENTORY_OUTLOOK: ['get_inventory_outlook'],
    COMPATIBILITY_CHECK: ['check_compatibility'],
    CHIT_CHAT: [],
};

function normalizeTurnQuery(query: string): string {
    return query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[¿?¡!]/g, ' ')
        .trim();
}

function pushCandidate(candidateList: StorefrontResolvedIntent[], candidate: StorefrontResolvedIntent) {
    if (!candidateList.includes(candidate)) {
        candidateList.push(candidate);
    }
}

function compareIntentPriority(left: StorefrontResolvedIntent, right: StorefrontResolvedIntent): number {
    return INTENT_PRIORITY[left] - INTENT_PRIORITY[right];
}

export function detectStorefrontTurnSignals(query: string): StorefrontTurnSignals {
    const normalizedQuery = normalizeTurnQuery(query || '');

    const isCompatibilityMatch = /compatible|compatibilidad|(me|te|le|nos|os|les)\s*(queda|quedan)|sirve para|funciona con|(me|te|le|nos|os|les)\s*(cabe|caben)|que coil|que pod|que bateria|que liquido|que resistencia|usa mi|(me|te|le|nos|os|les)\s*(sirve|sirven)/.test(normalizedQuery);
    const isInventoryMatch = /stock|inventario|disponible|disponibilidad|queda|agotara|agota|agotarse|agotado|durara/.test(normalizedQuery);
    const isPolicyMatch = /politica|envio|pago|reembolso|devolucion|garantia|entrega|costo|tarifa|aceptan/.test(normalizedQuery);
    const isProductMatch = /quiero|busco|buscas|tienen|tienes|hay|tengo|frutal|dulce|suave|fuerte|fresco|mentol|rico|intenso|cremoso|tropical|acido|uva|mango|fresa|sandia|melon|mora|cereza|menta|hielo|ice|tabaco|caramelo|barato|economico|precio|oferta|descuento|recomienda|conviene|guste|probar|comprar|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador/.test(normalizedQuery);
    const isGreeting = /hola|buenos dias|buenas tardes|que tal|buenas|quien eres|quien soy|quien es|quien eres tu/.test(normalizedQuery);
    const isTrackingMatch = /pedido|rastreo|tracking|seguimiento|guia|numero de pedido|orden|order number/.test(normalizedQuery);
    const isCartMatch = /carrito|agrega|agregar|meter|sumar|anade|anadir|quitar|sacar|checkout|comprar ahora/.test(normalizedQuery);
    const isTimeContext = /cuanto tiempo|cuando|cuantos dias|cuantos minutos|cuantas horas|se agota|se agotan/.test(normalizedQuery);

    return {
        normalizedQuery,
        isCompatibilityMatch,
        isInventoryMatch,
        isPolicyMatch,
        isProductMatch,
        isGreeting,
        isTrackingMatch,
        isCartMatch,
        isTimeContext,
    };
}

export function getTurnFirstIntentPriority(intent: StorefrontResolvedIntent): number {
    return INTENT_PRIORITY[intent];
}

export function filterToolCallsForIntent(toolCalls: ToolCall[], intent: StorefrontResolvedIntent): ToolCall[] {
    const allowedTools = INTENT_TOOL_NAMES[intent as Exclude<StorefrontResolvedIntent, 'UNKNOWN' | 'OUT_OF_DOMAIN'>] ?? [];
    if (allowedTools.length === 0) return [];
    return toolCalls.filter((toolCall) => allowedTools.includes(toolCall.name));
}

export function resolveTurnFirstIntent(input: {
    analystIntent: StorefrontResolvedIntent;
    query: string;
    toolCalls: ToolCall[];
}): TurnFirstIntentProfile {
    const signals = detectStorefrontTurnSignals(input.query);
    const candidateIntents: StorefrontResolvedIntent[] = [];

    if (signals.isCompatibilityMatch && !signals.isTimeContext) pushCandidate(candidateIntents, 'COMPATIBILITY_CHECK');
    if (signals.isTrackingMatch) pushCandidate(candidateIntents, 'ORDER_TRACKING');
    if (signals.isPolicyMatch) pushCandidate(candidateIntents, 'POLICY_INQUIRY');
    if (signals.isInventoryMatch) pushCandidate(candidateIntents, 'INVENTORY_OUTLOOK');
    if (signals.isCartMatch) pushCandidate(candidateIntents, 'CART_OPERATION');
    if (signals.isProductMatch) pushCandidate(candidateIntents, 'PRODUCT_SEARCH');
    if (signals.isGreeting) pushCandidate(candidateIntents, 'CHIT_CHAT');

    if (input.analystIntent !== 'UNKNOWN' || candidateIntents.length === 0) {
        pushCandidate(candidateIntents, input.analystIntent);
    }

    const turn_priority = [...candidateIntents].sort(compareIntentPriority);
    const primary_intent = turn_priority[0] ?? 'UNKNOWN';
    const secondary_intents = turn_priority.slice(1, 3);
    const primary_tool_calls = filterToolCallsForIntent(input.toolCalls, primary_intent);
    const queued_tool_calls = input.toolCalls.filter((toolCall) =>
        !primary_tool_calls.some((primaryToolCall) => primaryToolCall.name === toolCall.name)
    );

    const current_turn_decision: TurnDecision = primary_intent === 'UNKNOWN'
        ? 'ASK_CLARIFYING_QUESTION'
        : primary_intent === 'CHIT_CHAT' || primary_intent === 'OUT_OF_DOMAIN'
            ? 'DIRECT_ANSWER'
            : 'USE_CAPABILITY';

    const turn_focus = primary_intent === 'COMPATIBILITY_CHECK'
        ? 'compatibility'
        : primary_intent === 'ORDER_TRACKING'
            ? 'tracking'
            : primary_intent === 'POLICY_INQUIRY'
                ? 'policy'
                : primary_intent === 'INVENTORY_OUTLOOK'
                    ? 'inventory'
                    : primary_intent === 'CART_OPERATION'
                        ? 'cart'
                        : primary_intent === 'PRODUCT_SEARCH'
                            ? 'product'
                            : primary_intent === 'CHIT_CHAT'
                                ? 'conversation'
                                : primary_intent === 'OUT_OF_DOMAIN'
                                    ? 'out_of_domain'
                                    : 'unknown';

    return {
        primary_intent,
        secondary_intents,
        turn_priority,
        current_turn_decision,
        turn_focus,
        primary_tool_calls,
        queued_tool_calls,
    };
}

export interface StorefrontWeakIntentGuardrailInput {
    intent: StorefrontResolvedIntent;
    isInventoryMatch: boolean;
    isPolicyMatch: boolean;
    isProductMatch: boolean;
    isGreeting: boolean;
    isTrackingMatch?: boolean;
    isCartMatch?: boolean;
}

export interface StorefrontWeakIntentGuardrailResult {
    intent: StorefrontResolvedIntent;
    guardrailOverrides: string[];
}

export function resolveStorefrontWeakIntent(
    input: StorefrontWeakIntentGuardrailInput,
): StorefrontWeakIntentGuardrailResult {
    let nextIntent = input.intent;
    const guardrailOverrides: string[] = [];

    if (nextIntent === 'UNKNOWN') {
        if (input.isTrackingMatch) {
            nextIntent = 'ORDER_TRACKING';
            guardrailOverrides.push('UNKNOWN_RESOLVE_TRACKING');
        } else if (input.isCartMatch) {
            nextIntent = 'CART_OPERATION';
            guardrailOverrides.push('UNKNOWN_RESOLVE_CART');
        } else if (input.isInventoryMatch) {
            nextIntent = 'INVENTORY_OUTLOOK';
            guardrailOverrides.push('UNKNOWN_RESOLVE_INVENTORY');
        } else if (input.isPolicyMatch) {
            nextIntent = 'POLICY_INQUIRY';
            guardrailOverrides.push('UNKNOWN_RESOLVE_POLICY');
        } else if (input.isGreeting) {
            nextIntent = 'CHIT_CHAT';
            guardrailOverrides.push('UNKNOWN_RESOLVE_CHIT_CHAT');
        }
    }

    return {
        intent: nextIntent,
        guardrailOverrides,
    };
}
