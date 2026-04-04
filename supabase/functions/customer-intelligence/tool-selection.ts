import type { CatalogGateDecision, TurnFirstIntentProfile } from './intent-guardrails.ts';
import {
  UI_AFFORDANCES,
  getCapabilityDefinition,
  getCapabilityIdsForIntent,
  isCatalogCapabilityId,
  isClientCapsuleCapabilityId,
  isNativePublicCapabilityId,
  isServerExecutableCapabilityId,
  listCapabilityDefinitions,
  type CapabilityId,
  type NativePublicCapabilityId,
  type OwnFunctionCapabilityId,
  type ToolCapabilityDefinition,
} from './tool-index.ts';
import type { ToolCall } from './tools.ts';

export interface RuntimePrimaryCapability {
  kind: 'client_capsule' | 'own_function' | 'native_public' | 'model_knowledge' | 'none';
  name: CapabilityId | null;
  call: ToolCall | null;
  source: 'analyst' | 'edge_truth' | 'model_only' | 'none';
  capabilityClass: ToolCapabilityDefinition['class'] | null;
  execution: ToolCapabilityDefinition['execution'] | null;
}

export interface RuntimeCapabilityPlan {
  toolCalls: ToolCall[];
  serverToolCalls: ToolCall[];
  turnProfile: TurnFirstIntentProfile;
  catalogGate: CatalogGateDecision;
  primaryCapability: RuntimePrimaryCapability;
  capabilityBox: {
    modelKnowledge: ToolCapabilityDefinition[];
    nativePublic: ToolCapabilityDefinition[];
    ownFunctions: ToolCapabilityDefinition[];
    uiAffordances: readonly string[];
  };
  forcedCapability: OwnFunctionCapabilityId | null;
}

function dedupeToolCalls(toolCalls: ToolCall[]): ToolCall[] {
  const seen = new Set<string>();
  const deduped: ToolCall[] = [];

  for (const toolCall of toolCalls) {
    const key = `${toolCall.name}:${JSON.stringify(toolCall.args ?? {})}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(toolCall);
  }

  return deduped;
}

function findFirstToolCall(toolCalls: ToolCall[], names: string[]): ToolCall | null {
  for (const name of names) {
    const match = toolCalls.find((toolCall) => toolCall.name === name);
    if (match) return match;
  }

  return null;
}

function matchesCapabilityFamily(toolName: string, capabilityId: OwnFunctionCapabilityId): boolean {
  if (capabilityId === 'knowledge_rag_foundation') {
    return toolName === 'knowledge_rag_foundation' || toolName === 'get_store_policy';
  }

  if (capabilityId === 'product_search_integrity') {
    return toolName === 'product_search_integrity' || toolName === 'search_products';
  }

  if (capabilityId === 'storefront_inventory_outlook') {
    return toolName === 'storefront_inventory_outlook';
  }

  if (capabilityId === 'storefront_kitting_basket') {
    return toolName === 'storefront_kitting_basket';
  }

  if (capabilityId === 'storefront_checkout_readiness') {
    return toolName === 'storefront_checkout_readiness';
  }

  return toolName === capabilityId;
}

function buildKittingArgs(query: string): Record<string, unknown> {
  const normalized = normalizeCapabilityQuery(query);
  const flavorMatch = normalized.match(/\b(mango|fresa|sandia|melon|uva|mora|cereza|menta|hielo|ice|tabaco|caramelo|frutal|dulce|suave|fresco|intenso|cremoso|tropical|acido)\b/);
  const nicotineMatch = normalized.match(/\b(\d+(?:\.\d+)?\s*mg|\d+(?:\.\d+)?\s*%|sal|freebase|3mg|5mg|6mg|12mg|20mg)\b/);
  const formatMatch = normalized.match(/\b(pod|pods|cartucho|cartuchos|coil|coils|resistencia|resistencias|mod|kit|desechable|desechables|liquido|liquidos)\b/);

  return {
    query,
    flavor_preference: flavorMatch?.[0] ?? null,
    nicotine_preference: nicotineMatch?.[0] ?? null,
    format_preference: formatMatch?.[0] ?? null,
    upgrade_intent: /cambiar a pods|pasar a pods|pasarme a pods|de desechables a pods|upgrade|mejorar|renovar|kit|setup|equipo completo/.test(normalized),
    wants_device: /\b(device|equipo|hardware|mod|pod|pods|kit|starter|setup|dispositivo|vaporizador)\b/.test(normalized),
    wants_consumable: /\b(pod|pods|cartucho|cartuchos|resistencia|resistencias|coil|coils)\b/.test(normalized),
    wants_liquid: /\b(liquido|liquido al|líquido|jugo|juice)\b/.test(normalized),
  };
}

function buildBorderCapabilityFallback(input: {
  intent: string;
  query: string;
  turnProfile: TurnFirstIntentProfile;
}): { id: OwnFunctionCapabilityId; args: Record<string, unknown> } | null {
  if (input.turnProfile.current_turn_decision !== 'USE_CAPABILITY') {
    return null;
  }

  if (input.turnProfile.primary_intent !== input.intent) {
    return null;
  }

  if (input.intent === 'POLICY_INQUIRY') {
    return {
      id: 'knowledge_rag_foundation',
      args: { query: input.query, is_ambiguous: true },
    };
  }

  if (input.intent === 'KIT_ASSEMBLY') {
    return {
      id: 'storefront_kitting_basket',
      args: buildKittingArgs(input.query),
    };
  }

  if (input.intent === 'WARRANTY_SUPPORT') {
    return {
      id: 'authenticated_warranty_triage',
      args: { query: input.query },
    };
  }

  if (input.intent === 'LOYALTY_SUPPORT') {
    return {
      id: 'authenticated_loyalty_status',
      args: { query: input.query },
    };
  }

  if (input.intent === 'CHECKOUT_READINESS') {
    return {
      id: 'storefront_checkout_readiness',
      args: { query: input.query },
    };
  }

  if (input.intent === 'ORDER_TRACKING') {
    return {
      id: 'authenticated_order_tracking',
      args: { query: input.query },
    };
  }

  if (input.intent === 'INVENTORY_OUTLOOK') {
    return {
      id: 'storefront_inventory_outlook',
      args: { query: input.query },
    };
  }

  if (input.intent === 'COMPATIBILITY_CHECK') {
    return {
      id: 'check_compatibility',
      args: { query: input.query },
    };
  }

  if (input.intent === 'CART_OPERATION') {
    return {
      id: 'cart_operator',
      args: { action: 'ADD', product_ref: input.query, quantity: 1 },
    };
  }

  if (input.intent === 'PRODUCT_SEARCH' && /\b(lo de siempre|lo mismo|quiero lo mismo|mis pods|quiero repetir|repetir|volver a pedir)\b/.test(normalizeCapabilityQuery(input.query))) {
    return {
      id: 'product_search_integrity',
      args: {
        query: input.query,
        is_ambiguous: false,
        requires_semantic_expansion: false,
      },
    };
  }

  return null;
}

function normalizeCapabilityQuery(query: string): string {
  return (query || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function extractPublicUrls(query: string): string[] {
  const matches = query.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  const urls = matches
    .map((url) => url.replace(/[),.;!?]+$/g, ''))
    .filter(Boolean);

  return Array.from(new Set(urls)).slice(0, 3);
}

function stripUrls(query: string): string {
  return query.replace(/https?:\/\/[^\s<>"')\]]+/gi, ' ').replace(/\s+/g, ' ').trim();
}

function shouldUsePublicUrlContext(query: string, turnProfile: TurnFirstIntentProfile, hasOwnFunctionPlan: boolean): boolean {
  if (hasOwnFunctionPlan) return false;
  if (turnProfile.primary_intent !== 'PUBLIC_INFO') return false;
  if (turnProfile.current_turn_decision === 'ASK_CLARIFYING_QUESTION') return false;

  const urls = extractPublicUrls(query);
  return urls.length > 0;
}

function shouldUsePublicWebSearch(
  query: string,
  turnProfile: TurnFirstIntentProfile,
  hasOwnFunctionPlan: boolean,
): boolean {
  if (hasOwnFunctionPlan) return false;
  if (turnProfile.primary_intent !== 'PUBLIC_INFO') return false;
  if (turnProfile.current_turn_decision === 'ASK_CLARIFYING_QUESTION') return false;

  const normalizedQuery = normalizeCapabilityQuery(query);
  if (!normalizedQuery) return false;
  if (extractPublicUrls(query).length > 0) return false;

  const explicitWebRequest = /web|internet|google|busca|buscame|investiga|verifica|verificalo|oficial|pagina oficial|sitio oficial|fuente publica|fuente oficial/.test(normalizedQuery);
  const freshnessCue = /actual|actualmente|hoy|reciente|nuevo|nueva|ultimo|ultima|lanz|salio|sale|release|202[4-9]|202\d/.test(normalizedQuery);
  const publicInfoCue = /marca|modelo|nombre oficial|especific|spec|ficha tecnica|disponible afuera|availability|version|edicion|review|reseña/.test(normalizedQuery);

  if (!(explicitWebRequest || freshnessCue || publicInfoCue)) return false;

  return true;
}

function buildNativePublicCapabilityCall(input: {
  query: string;
  toolCalls: ToolCall[];
  turnProfile: TurnFirstIntentProfile;
  catalogGate: CatalogGateDecision;
  hasOwnFunctionPlan: boolean;
}): ToolCall | null {
  const requestedUrlContext = input.toolCalls.find((toolCall) => toolCall.name === 'public_url_context') ?? null;
  if (requestedUrlContext && shouldUsePublicUrlContext(input.query, input.turnProfile, input.hasOwnFunctionPlan)) {
    return {
      name: 'public_url_context',
      args: {
        query: String(requestedUrlContext.args?.query ?? stripUrls(input.query) ?? '').trim() || input.query,
        urls: Array.isArray(requestedUrlContext.args?.urls)
          ? requestedUrlContext.args.urls
          : extractPublicUrls(String(requestedUrlContext.args?.url ?? input.query)),
      },
    };
  }

  if (shouldUsePublicUrlContext(input.query, input.turnProfile, input.hasOwnFunctionPlan)) {
    return {
      name: 'public_url_context',
      args: {
        query: stripUrls(input.query) || input.query,
        urls: extractPublicUrls(input.query),
      },
    };
  }

  const requestedWebSearch = input.toolCalls.find((toolCall) => toolCall.name === 'public_web_search') ?? null;
  if (requestedWebSearch && shouldUsePublicWebSearch(input.query, input.turnProfile, input.hasOwnFunctionPlan)) {
    return {
      name: 'public_web_search',
      args: { query: String(requestedWebSearch.args?.query ?? input.query).trim() || input.query },
    };
  }

  return null;
}

function buildPrimaryCapability(
  toolCalls: ToolCall[],
  intent: string,
  forcedCapability: OwnFunctionCapabilityId | null,
): RuntimePrimaryCapability {
  const intentCapabilityIds = getCapabilityIdsForIntent(intent);
  const primaryToolCall = findFirstToolCall(toolCalls, intentCapabilityIds)
    ?? toolCalls.find((toolCall) => getCapabilityDefinition(toolCall.name)?.class === 'OWN_FUNCTION')
    ?? toolCalls.find((toolCall) => getCapabilityDefinition(toolCall.name)?.class === 'NATIVE_PUBLIC')
    ?? null;

  if (!primaryToolCall) {
    const modelCapability = getCapabilityDefinition('model_turn_reasoning');
    return {
      kind: modelCapability ? 'model_knowledge' : 'none',
      name: modelCapability?.id ?? null,
      call: null,
      source: modelCapability ? 'model_only' : 'none',
      capabilityClass: modelCapability?.class ?? null,
      execution: modelCapability?.execution ?? null,
    };
  }

  const definition = getCapabilityDefinition(primaryToolCall.name);
  if (!definition) {
    return {
      kind: 'none',
      name: null,
      call: primaryToolCall,
      source: 'none',
      capabilityClass: null,
      execution: null,
    };
  }

  return {
    kind: isClientCapsuleCapabilityId(definition.id)
      ? 'client_capsule'
      : definition.class === 'OWN_FUNCTION'
        ? 'own_function'
        : definition.class === 'NATIVE_PUBLIC'
          ? 'native_public'
          : 'none',
    name: definition.id,
    call: primaryToolCall,
    source: forcedCapability === definition.id ? 'edge_truth' : 'analyst',
    capabilityClass: definition.class,
    execution: definition.execution,
  };
}

export function buildRuntimeCapabilityPlan(input: {
  intent: string;
  query: string;
  toolCalls: ToolCall[];
  hasAudio: boolean;
  hasMemorySummary?: boolean;
  turnProfile: TurnFirstIntentProfile;
  catalogGate: CatalogGateDecision;
}): RuntimeCapabilityPlan {
  const filteredToolCalls = dedupeToolCalls(
    input.catalogGate.is_open
      ? input.toolCalls
      : input.toolCalls.filter((toolCall) => !isCatalogCapabilityId(toolCall.name)),
  );
  const requestedNativePublicCalls = filteredToolCalls.filter((toolCall) => isNativePublicCapabilityId(toolCall.name));
  const toolCalls = filteredToolCalls.filter((toolCall) => !isNativePublicCapabilityId(toolCall.name));
  let forcedCapability: OwnFunctionCapabilityId | null = null;

  const borderFallback = buildBorderCapabilityFallback({
    intent: input.intent,
    query: input.query,
    turnProfile: input.turnProfile,
  });
  if (borderFallback && !toolCalls.some((toolCall) => matchesCapabilityFamily(toolCall.name, borderFallback.id))) {
    forcedCapability = borderFallback.id;
    toolCalls.push({
      name: borderFallback.id,
      args: borderFallback.args,
    });
  }

  const hasOwnFunctionPlan = toolCalls.some((toolCall) => getCapabilityDefinition(toolCall.name)?.class === 'OWN_FUNCTION');
  const nativePublicCall = buildNativePublicCapabilityCall({
    query: input.query,
    toolCalls: requestedNativePublicCalls,
    turnProfile: input.turnProfile,
    catalogGate: input.catalogGate,
    hasOwnFunctionPlan,
  });

  if (nativePublicCall && !toolCalls.some((toolCall) => toolCall.name === nativePublicCall.name)) {
    toolCalls.push(nativePublicCall);
  }

  const ownFunctionIds = toolCalls
    .map((toolCall) => toolCall.name)
    .filter((toolName): toolName is OwnFunctionCapabilityId => Boolean(getCapabilityDefinition(toolName)?.class === 'OWN_FUNCTION'));
  const nativePublicIds: NativePublicCapabilityId[] = input.hasAudio
    ? ['audio_input', 'public_web_search', 'public_url_context']
    : ['public_web_search', 'public_url_context'];
  const modelKnowledgeIds = input.hasMemorySummary
    ? ['model_turn_reasoning', 'lightweight_memory_read', 'response_synthesis']
    : ['model_turn_reasoning', 'response_synthesis'];

  return {
    toolCalls,
    serverToolCalls: toolCalls.filter((toolCall) => isServerExecutableCapabilityId(toolCall.name)),
    turnProfile: input.turnProfile,
    catalogGate: input.catalogGate,
    primaryCapability: buildPrimaryCapability(toolCalls, input.intent, forcedCapability),
    capabilityBox: {
      modelKnowledge: listCapabilityDefinitions(modelKnowledgeIds),
      nativePublic: listCapabilityDefinitions(nativePublicIds),
      ownFunctions: listCapabilityDefinitions(ownFunctionIds),
      uiAffordances: UI_AFFORDANCES,
    },
    forcedCapability,
  };
}
