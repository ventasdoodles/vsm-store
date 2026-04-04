import type { ToolCall } from './tools.ts';
import { getCapabilityIdsForIntent } from './tool-index.ts';

export type StorefrontResolvedIntent =
    | 'CART_OPERATION'
    | 'KIT_ASSEMBLY'
    | 'WARRANTY_SUPPORT'
    | 'LOYALTY_SUPPORT'
    | 'POLICY_INQUIRY'
    | 'PUBLIC_INFO'
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
    isKittingMatch: boolean;
    isReplenishmentMatch: boolean;
    isGreeting: boolean;
    isTrackingMatch: boolean;
    isWarrantyMatch?: boolean;
    isLoyaltyMatch?: boolean;
    isCartMatch: boolean;
    isTimeContext: boolean;
    hasExplicitUrl: boolean;
    needsPublicWebContext: boolean;
}

export interface TurnFirstIntentProfile {
    primary_intent: StorefrontResolvedIntent;
    secondary_intents: StorefrontResolvedIntent[];
    turn_priority: StorefrontResolvedIntent[];
    current_turn_decision: TurnDecision;
    turn_focus:
        | 'compatibility'
        | 'tracking'
        | 'warranty'
        | 'loyalty'
        | 'policy'
        | 'inventory'
        | 'kitting'
        | 'cart'
        | 'public_info'
        | 'product'
        | 'conversation'
        | 'out_of_domain'
        | 'unknown';
    primary_tool_calls: ToolCall[];
    queued_tool_calls: ToolCall[];
}

export type CatalogGateReason =
    | 'search_leading'
    | 'explicit_product_request'
    | 'clarification_first'
    | 'non_catalog_lane'
    | 'out_of_domain';

export interface CatalogGateDecision {
    is_open: boolean;
    reason: CatalogGateReason;
    primary_intent: StorefrontResolvedIntent | null;
    explicit_product_request: boolean;
    search_leading: boolean;
    needs_clarification: boolean;
    materially_helpful: boolean;
    clarification_required: boolean;
}

const INTENT_PRIORITY: Record<StorefrontResolvedIntent, number> = {
    OUT_OF_DOMAIN: 0,
    COMPATIBILITY_CHECK: 1,
    WARRANTY_SUPPORT: 2,
    ORDER_TRACKING: 3,
    LOYALTY_SUPPORT: 4,
    POLICY_INQUIRY: 5,
    INVENTORY_OUTLOOK: 6,
    CART_OPERATION: 7,
    KIT_ASSEMBLY: 8,
    PUBLIC_INFO: 9,
    PRODUCT_SEARCH: 10,
    CHIT_CHAT: 11,
    UNKNOWN: 12,
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

function detectExplicitUrl(normalizedQuery: string): boolean {
    return /https?:\/\/\S+|www\.\S+/.test(normalizedQuery);
}

function detectUrlContextNeed(normalizedQuery: string): boolean {
    return /resum|resume|revis|analiza|checa|compar|pagina|sitio|link|enlace|url|que dice|que trae|segun|basado en|lee esta|lee este/.test(normalizedQuery);
}

function detectPublicWebNeed(normalizedQuery: string): boolean {
    return /(actual|actualmente|hoy|ultimo|ultima|reciente|nuevo|nueva|salio|lanzamiento|release|oficial|pagina oficial|sitio oficial|verifica|confirm|fuente|en internet|busca en web|busca en internet|specs?|especificaciones|disponibilidad global|publicamente)/.test(normalizedQuery);
}

function detectPolicyMatch(normalizedQuery: string): boolean {
    return /politica|envio|pago|reembolso|devolucion|garantia|entrega|costo|tarifa|aceptan|horario|horarios|(?:a\s+)?que hora abren|(?:a\s+)?que hora cierran|cuando abren|cuando cierran|abren hoy|cierran hoy|abierto hoy|abiertos hoy|hora de apertura|hora de cierre/.test(normalizedQuery);
}

function detectKittingMatch(normalizedQuery: string): boolean {
    return /\b(kit|kitting|starter kit|setup|set up|armame|arme|armar|equipo completo|equipo entero|quiero cambiar de desechables|cambiar a pods|pasarme a pods|pasar a pods|de desechables a pods|upgrade de hardware|upgrade a pods|arma me un kit|armame un equipo|armame un setup|equipo con liquido|equipo con líquido)\b/.test(normalizedQuery);
}

function detectWarrantyMatch(normalizedQuery: string): boolean {
    const defectSymptomMatch = /\b(sabe a quemado|huele a quemado|olor a quemado|llego roto|llego quebrado|llego danado|llego chorreado|chorreado|se chorrea|viene chorreado|fuga|fugando|derram|no prende|no enciende|no sirve|no funciona|vino fallado|vino fallada|falla|fallado|fallada|defecto)\b/.test(normalizedQuery);
    const postPurchaseSupportRequest = /\b(garantia|devolucion|rma)\b/.test(normalizedQuery)
        && /\b(mi|me|llego|vino|pedido|orden|compra|producto|equipo|vape|pod|cartucho|dispositivo|falla|roto|chorreado|prende|sirve|funciona)\b/.test(normalizedQuery);

    return defectSymptomMatch || postPurchaseSupportRequest;
}

function detectLoyaltyMatch(normalizedQuery: string): boolean {
    const balanceMatch = /\b(cuantos puntos tengo|mis puntos|puntos|vcoins|v coins|v-coins|cuanto valen mis puntos|valor de mis puntos|equivalen mis puntos|descuento por puntos|me alcanza con mis puntos|me alcanza para algo con mis puntos)\b/.test(normalizedQuery);
    const tierMatch = /\b(que nivel soy|mi nivel|soy vip|estatus vip|status vip|que tier soy|mi tier|nivel vip)\b/.test(normalizedQuery);

    return balanceMatch || tierMatch;
}

function shouldPromoteRegexInferredIntent(input: {
    analystIntent: StorefrontResolvedIntent;
    candidate: StorefrontResolvedIntent;
}): boolean {
    if (input.analystIntent === 'UNKNOWN') return true;
    if (input.analystIntent === input.candidate) return true;

    // Keep hard-boundary or private-truth lanes able to outrank softer analyst drift.
    return input.candidate === 'COMPATIBILITY_CHECK'
        || input.candidate === 'WARRANTY_SUPPORT'
        || input.candidate === 'ORDER_TRACKING'
        || input.candidate === 'LOYALTY_SUPPORT'
        || input.candidate === 'KIT_ASSEMBLY'
        || input.candidate === 'POLICY_INQUIRY'
        || input.candidate === 'INVENTORY_OUTLOOK'
        || input.candidate === 'CART_OPERATION';
}

export function detectStorefrontTurnSignals(query: string): StorefrontTurnSignals {
    const normalizedQuery = normalizeTurnQuery(query || '');
    const queryWithoutUrls = normalizedQuery.replace(/https?:\/\/\S+|www\.\S+/g, ' ').replace(/\s+/g, ' ').trim();

    const isCompatibilityMatch = /compatible|compatibilidad|(me|te|le|nos|os|les)\s*(queda|quedan)|sirve para|funciona con|(me|te|le|nos|os|les)\s*(cabe|caben)|que coil|que pod|que bateria|que liquido|que resistencia|usa mi|(me|te|le|nos|os|les)\s*(sirve|sirven)/.test(normalizedQuery);
    const isInventoryMatch = /stock|inventario|disponible|disponibilidad|queda|agotara|agota|agotarse|agotado|durara/.test(normalizedQuery);
    const isPolicyMatch = detectPolicyMatch(normalizedQuery);
    const isKittingMatch = detectKittingMatch(normalizedQuery);
    const isReplenishmentMatch = /\b(lo de siempre|lo mismo|quiero lo mismo|mis pods|quiero repetir|repetir|volver a pedir)\b/.test(normalizedQuery);
    const isProductMatch = isReplenishmentMatch || isKittingMatch || /quiero|busco|buscas|tienen|tienes|hay|tengo|frutal|dulce|suave|fuerte|fresco|mentol|rico|intenso|cremoso|tropical|acido|uva|mango|fresa|sandia|melon|mora|cereza|menta|hielo|ice|tabaco|caramelo|barato|economico|precio|oferta|descuento|recomienda|conviene|guste|probar|comprar|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador/.test(normalizedQuery);
    const isGreeting = /hola|buenos dias|buenas tardes|que tal|buenas|quien eres|quien soy|quien es|quien eres tu/.test(normalizedQuery);
    const isTrackingMatch = /\b((mi|el)\s+(pedido|orden)\b|rastreo|tracking|seguimiento|guia|numero de guia|numero de pedido|order number|donde va mi pedido|donde va mi orden|ya lo enviaron|ya enviaron mi pedido|ya enviaron mi orden|ya paso mi pago|mi pago ya paso|mi pago se confirmo|se confirmo mi pago|ya quedo mi pago|ya salio mi pedido)\b/.test(normalizedQuery);
    const isWarrantyMatch = detectWarrantyMatch(normalizedQuery);
    const isLoyaltyMatch = detectLoyaltyMatch(normalizedQuery);
    const isCartMatch = /carrito|agrega|agregar|meter|sumar|anade|anadir|quitar|sacar|checkout|comprar ahora/.test(normalizedQuery);
    const isTimeContext = /cuanto tiempo|cuando|cuantos dias|cuantos minutos|cuantas horas|se agota|se agotan/.test(normalizedQuery);
    const hasExplicitUrl = detectExplicitUrl(normalizedQuery);
    const needsPublicWebContext = (hasExplicitUrl && detectUrlContextNeed(queryWithoutUrls)) || detectPublicWebNeed(queryWithoutUrls);

    return {
        normalizedQuery,
        isCompatibilityMatch,
        isInventoryMatch,
        isPolicyMatch,
        isProductMatch,
        isKittingMatch,
        isReplenishmentMatch,
        isGreeting,
        isTrackingMatch,
        isWarrantyMatch,
        isLoyaltyMatch,
        isCartMatch,
        isTimeContext,
        hasExplicitUrl,
        needsPublicWebContext,
    };
}

function detectExplicitProductRequest(normalizedQuery: string): boolean {
    return /recomiend|recomend|muestr|ensename|enseñame|quiero ver|que opciones|que productos|que me sugieres|que me recomiendas|que sabores|dame opciones|busco algo|quiero algo|quiero un|quiero una|tienes algo/.test(normalizedQuery);
}

function detectInventorySpecificProductReference(normalizedQuery: string): boolean {
    return /\b(stock|inventario|disponibilidad|agotado|agotada|restock|regresa|regreso|vuelve|queda|hay)\b.*\b(del|de la|de los|de las|el|la|los|las)\b\s+[a-z0-9][a-z0-9\s-]{2,}/.test(normalizedQuery);
}

export function getTurnFirstIntentPriority(intent: StorefrontResolvedIntent): number {
    return INTENT_PRIORITY[intent];
}

export function filterToolCallsForIntent(toolCalls: ToolCall[], intent: StorefrontResolvedIntent): ToolCall[] {
    const allowedTools = getCapabilityIdsForIntent(intent);
    if (allowedTools.length === 0) return [];
    return toolCalls.filter((toolCall) => allowedTools.some((allowedTool) => allowedTool === toolCall.name));
}

export function resolveTurnFirstIntent(input: {
    analystIntent: StorefrontResolvedIntent;
    analystDecision?: TurnDecision | null;
    query: string;
    toolCalls: ToolCall[];
}): TurnFirstIntentProfile {
    const signals = detectStorefrontTurnSignals(input.query);
    const candidateIntents: StorefrontResolvedIntent[] = [];

    if (signals.isCompatibilityMatch && !signals.isTimeContext && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'COMPATIBILITY_CHECK' })) {
        pushCandidate(candidateIntents, 'COMPATIBILITY_CHECK');
    }
    if (signals.isWarrantyMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'WARRANTY_SUPPORT' })) {
        pushCandidate(candidateIntents, 'WARRANTY_SUPPORT');
    }
    if (signals.isTrackingMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'ORDER_TRACKING' })) {
        pushCandidate(candidateIntents, 'ORDER_TRACKING');
    }
    if (signals.isLoyaltyMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'LOYALTY_SUPPORT' })) {
        pushCandidate(candidateIntents, 'LOYALTY_SUPPORT');
    }
    if (signals.isPolicyMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'POLICY_INQUIRY' })) {
        pushCandidate(candidateIntents, 'POLICY_INQUIRY');
    }
    if (signals.isKittingMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'KIT_ASSEMBLY' })) {
        pushCandidate(candidateIntents, 'KIT_ASSEMBLY');
    }
    if (signals.isInventoryMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'INVENTORY_OUTLOOK' })) {
        pushCandidate(candidateIntents, 'INVENTORY_OUTLOOK');
    }
    if (signals.isCartMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'CART_OPERATION' })) {
        pushCandidate(candidateIntents, 'CART_OPERATION');
    }
    if (signals.needsPublicWebContext && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'PUBLIC_INFO' })) {
        pushCandidate(candidateIntents, 'PUBLIC_INFO');
    }
    if (signals.isProductMatch && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'PRODUCT_SEARCH' })) {
        pushCandidate(candidateIntents, 'PRODUCT_SEARCH');
    }
    if (signals.isGreeting && shouldPromoteRegexInferredIntent({ analystIntent: input.analystIntent, candidate: 'CHIT_CHAT' })) {
        pushCandidate(candidateIntents, 'CHIT_CHAT');
    }

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
            : primary_intent === 'PRODUCT_SEARCH' && signals.isReplenishmentMatch
                ? 'USE_CAPABILITY'
            : input.analystDecision === 'ASK_CLARIFYING_QUESTION'
                ? 'ASK_CLARIFYING_QUESTION'
                : input.analystDecision === 'DIRECT_ANSWER'
                    ? 'DIRECT_ANSWER'
                    : 'USE_CAPABILITY';

    const turn_focus = primary_intent === 'COMPATIBILITY_CHECK'
        ? 'compatibility'
        : primary_intent === 'WARRANTY_SUPPORT'
            ? 'warranty'
        : primary_intent === 'ORDER_TRACKING'
        ? 'tracking'
        : primary_intent === 'LOYALTY_SUPPORT'
            ? 'loyalty'
            : primary_intent === 'POLICY_INQUIRY'
                ? 'policy'
                : primary_intent === 'KIT_ASSEMBLY'
                    ? 'kitting'
                : primary_intent === 'INVENTORY_OUTLOOK'
                    ? 'inventory'
                    : primary_intent === 'CART_OPERATION'
                        ? 'cart'
                        : primary_intent === 'PUBLIC_INFO'
                            ? 'public_info'
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

export function resolveCatalogGate(input: {
    turnProfile: TurnFirstIntentProfile;
    turnSignals: StorefrontTurnSignals;
    intent?: StorefrontResolvedIntent;
}): CatalogGateDecision {
    const primaryIntent = input.turnProfile.primary_intent ?? input.intent ?? 'UNKNOWN';
    const explicitProductRequest = detectExplicitProductRequest(input.turnSignals.normalizedQuery);
    const inventorySpecificProductReference = detectInventorySpecificProductReference(input.turnSignals.normalizedQuery);
    const searchLeading = primaryIntent === 'PRODUCT_SEARCH' || primaryIntent === 'KIT_ASSEMBLY';
    const clarificationRequired = input.turnProfile.current_turn_decision === 'ASK_CLARIFYING_QUESTION' || primaryIntent === 'UNKNOWN';
    const materiallyHelpful = searchLeading || explicitProductRequest;
    const hardNoCatalogLane =
        primaryIntent === 'WARRANTY_SUPPORT'
        || primaryIntent === 'LOYALTY_SUPPORT'
        || primaryIntent === 'POLICY_INQUIRY'
        || primaryIntent === 'INVENTORY_OUTLOOK'
        || primaryIntent === 'ORDER_TRACKING'
        || primaryIntent === 'COMPATIBILITY_CHECK'
        || primaryIntent === 'CART_OPERATION'
        || primaryIntent === 'PUBLIC_INFO'
        || primaryIntent === 'CHIT_CHAT'
        || primaryIntent === 'OUT_OF_DOMAIN';

    if (primaryIntent === 'OUT_OF_DOMAIN') {
        return {
            is_open: false,
            reason: 'out_of_domain',
            primary_intent: primaryIntent,
            explicit_product_request: explicitProductRequest,
            search_leading: false,
            needs_clarification: false,
            materially_helpful: false,
            clarification_required: false,
        };
    }

    if (
        primaryIntent === 'INVENTORY_OUTLOOK'
        && input.turnProfile.current_turn_decision === 'USE_CAPABILITY'
        && inventorySpecificProductReference
        && !clarificationRequired
    ) {
        return {
            is_open: true,
            reason: 'explicit_product_request',
            primary_intent: primaryIntent,
            search_leading: false,
            explicit_product_request: true,
            needs_clarification: false,
            materially_helpful: true,
            clarification_required: false,
        };
    }

    if (clarificationRequired) {
        return {
            is_open: false,
            reason: 'clarification_first',
            primary_intent: primaryIntent,
            search_leading: searchLeading,
            explicit_product_request: explicitProductRequest,
            needs_clarification: true,
            materially_helpful: materiallyHelpful,
            clarification_required: true,
        };
    }

    if (hardNoCatalogLane) {
        return {
            is_open: false,
            reason: 'non_catalog_lane',
            primary_intent: primaryIntent,
            search_leading: searchLeading,
            explicit_product_request: explicitProductRequest,
            needs_clarification: clarificationRequired,
            materially_helpful: materiallyHelpful,
            clarification_required: clarificationRequired,
        };
    }

    if (searchLeading) {
        return {
            is_open: true,
            reason: explicitProductRequest ? 'explicit_product_request' : 'search_leading',
            primary_intent: primaryIntent,
            search_leading: true,
            explicit_product_request: explicitProductRequest,
            needs_clarification: false,
            materially_helpful: true,
            clarification_required: false,
        };
    }

    if (explicitProductRequest) {
        return {
            is_open: true,
            reason: 'explicit_product_request',
            primary_intent: primaryIntent,
            search_leading: searchLeading,
            explicit_product_request: true,
            needs_clarification: false,
            materially_helpful: true,
            clarification_required: false,
        };
    }

    return {
        is_open: false,
        reason: 'non_catalog_lane',
        primary_intent: primaryIntent,
        search_leading: false,
        explicit_product_request: explicitProductRequest,
        needs_clarification: false,
        materially_helpful: materiallyHelpful,
        clarification_required: false,
    };
}

export interface StorefrontWeakIntentGuardrailInput {
    intent: StorefrontResolvedIntent;
    isInventoryMatch: boolean;
    isPolicyMatch: boolean;
    isProductMatch: boolean;
    isKittingMatch?: boolean;
    isGreeting: boolean;
    isTrackingMatch?: boolean;
    isWarrantyMatch?: boolean;
    isLoyaltyMatch?: boolean;
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
        if (input.isWarrantyMatch) {
            nextIntent = 'WARRANTY_SUPPORT';
            guardrailOverrides.push('UNKNOWN_RESOLVE_WARRANTY');
        } else if (input.isTrackingMatch) {
            nextIntent = 'ORDER_TRACKING';
            guardrailOverrides.push('UNKNOWN_RESOLVE_TRACKING');
        } else if (input.isLoyaltyMatch) {
            nextIntent = 'LOYALTY_SUPPORT';
            guardrailOverrides.push('UNKNOWN_RESOLVE_LOYALTY');
        } else if (input.isKittingMatch) {
            nextIntent = 'KIT_ASSEMBLY';
            guardrailOverrides.push('UNKNOWN_RESOLVE_KITTING');
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
