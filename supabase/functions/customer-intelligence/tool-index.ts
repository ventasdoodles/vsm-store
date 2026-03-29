export type CapabilityClass = 'MODEL_KNOWLEDGE' | 'NATIVE_PUBLIC' | 'OWN_FUNCTION';
export type CapabilityExecution = 'model_only' | 'native_public' | 'client_capsule' | 'edge_function';
export type CapabilityStatus = 'active' | 'reserved';

export type ModelKnowledgeCapabilityId =
  | 'model_turn_reasoning'
  | 'lightweight_memory_read'
  | 'response_synthesis';
export type NativePublicCapabilityId = 'audio_input' | 'public_web_search' | 'public_url_context';
export type PublicWebCapabilityId = 'public_web_search' | 'public_url_context';
export type ClientCapsuleCapabilityId =
  | 'product_search_integrity'
  | 'knowledge_rag_foundation'
  | 'cart_operator';
export type EdgeFunctionCapabilityId =
  | 'get_store_policy'
  | 'search_products'
  | 'track_order'
  | 'get_inventory_outlook'
  | 'check_compatibility';
export type ServerExecutableCapabilityId =
  | EdgeFunctionCapabilityId
  | 'public_web_search'
  | 'public_url_context';
export type OwnFunctionCapabilityId = ClientCapsuleCapabilityId | EdgeFunctionCapabilityId;
export type CapabilityId =
  | ModelKnowledgeCapabilityId
  | NativePublicCapabilityId
  | OwnFunctionCapabilityId;

export interface ToolCapabilityDefinition {
  id: CapabilityId;
  class: CapabilityClass;
  execution: CapabilityExecution;
  status: CapabilityStatus;
  does: string;
  doesNotDo: string;
  typicalUsage: string[];
  gatingConstraints?: string[];
}

export const UI_AFFORDANCES = [
  'approximate_recovery',
  'honest_whatsapp_escape',
  'storefront_actions',
] as const;

export const TOOL_INDEX: Record<CapabilityId, ToolCapabilityDefinition> = {
  model_turn_reasoning: {
    id: 'model_turn_reasoning',
    class: 'MODEL_KNOWLEDGE',
    execution: 'model_only',
    status: 'active',
    does: 'Interpreta el turno actual y decide si basta responder, aclarar o usar una capacidad.',
    doesNotDo: 'No impersona verdad privada, no muta estado real y no reabre catalogo por reflejo.',
    typicalUsage: ['small_talk', 'clarification', 'turn_interpretation', 'no_tool_needed'],
    gatingConstraints: ['Default lane when the current turn can be answered honestly without a capability.'],
  },
  lightweight_memory_read: {
    id: 'lightweight_memory_read',
    class: 'MODEL_KNOWLEDGE',
    execution: 'model_only',
    status: 'active',
    does: 'Usa memoria ligera autenticada para afinar continuidad del turno cuando de verdad ayuda.',
    doesNotDo: 'No crea persistencia falsa para invitados ni deja que la memoria mande sobre el turno actual.',
    typicalUsage: ['bounded_continuity', 'preference_recall', 'avoid_repeating_discards'],
    gatingConstraints: ['Only relevant when an authenticated preference summary already exists.'],
  },
  response_synthesis: {
    id: 'response_synthesis',
    class: 'MODEL_KNOWLEDGE',
    execution: 'model_only',
    status: 'active',
    does: 'Sintetiza la respuesta final con la disciplina anti-bloat ya aceptada.',
    doesNotDo: 'No duplica guidance del siguiente paso ni suplanta verdad privada.',
    typicalUsage: ['response_synthesis', 'short_answer', 'honest_escalation'],
    gatingConstraints: ['Always active as the final drafting layer.'],
  },
  audio_input: {
    id: 'audio_input',
    class: 'NATIVE_PUBLIC',
    execution: 'native_public',
    status: 'active',
    does: 'Lets the runtime accept audio input already supplied by the current request.',
    doesNotDo: 'Does not fetch new facts or act as public web intelligence.',
    typicalUsage: ['audio_turn_input'],
    gatingConstraints: ['Only meaningful when the incoming turn actually includes audio payloads.'],
  },
  public_web_search: {
    id: 'public_web_search',
    class: 'NATIVE_PUBLIC',
    execution: 'native_public',
    status: 'active',
    does: 'Busca contexto publico fresco cuando el turno realmente necesita verificacion o contexto externo actual.',
    doesNotDo: 'No sustituye verdad privada de la tienda, no muta estado real y no abre catalogo por reflejo.',
    typicalUsage: ['public_current_info', 'public_brand_model_clarification', 'launch_or_spec_context'],
    gatingConstraints: [
      'Use only when model knowledge is not enough and the turn materially needs fresh public information.',
      'Do not use for greetings, ambiguity-first turns, or store-private/action requests.',
      'Do not reopen catalog surfaces when the catalog gate is closed.',
    ],
  },
  public_url_context: {
    id: 'public_url_context',
    class: 'NATIVE_PUBLIC',
    execution: 'native_public',
    status: 'active',
    does: 'Lee una URL publica que el cliente ya dio para extraer contexto puntual de esa pagina.',
    doesNotDo: 'No navega sitios privados, no adivina contenido no accesible y no reemplaza funciones propias.',
    typicalUsage: ['explicit_url_summary', 'public_page_context', 'url_based_comparison'],
    gatingConstraints: [
      'Use only when the current turn provides a URL or clearly points to a specific public page.',
      'Do not use for bare ambiguous turns that still need a clarification first.',
      'Keep the result compact and page-bound, not as a broad search report.',
    ],
  },
  product_search_integrity: {
    id: 'product_search_integrity',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Runs the storefront product-search capsule for search-leading turns that genuinely justify product surfacing.',
    doesNotDo: 'Does not bypass catalog gating, clarification-first turns, or non-search primary turns.',
    typicalUsage: ['search_leading_product_help', 'product_examples_that_materially_help'],
    gatingConstraints: ['Only use when the current turn is search-leading and the catalog gate is open.'],
  },
  knowledge_rag_foundation: {
    id: 'knowledge_rag_foundation',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Runs the storefront knowledge capsule for policy or store-knowledge answers on the client side.',
    doesNotDo: 'Does not claim order status, mutate the cart, or stand in for public web search.',
    typicalUsage: ['policy_answer', 'store_rules_answer'],
    gatingConstraints: ['Use when store-owned policy or knowledge truth materially matters.'],
  },
  cart_operator: {
    id: 'cart_operator',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Handles cart action flows that need a real storefront mutation path.',
    doesNotDo: 'Does not decide purchases for the user or force a cart move on ambiguous turns.',
    typicalUsage: ['cart_add', 'cart_remove', 'cart_checkout_prep'],
    gatingConstraints: ['Use only when the current turn clearly asks for a cart action.'],
  },
  get_store_policy: {
    id: 'get_store_policy',
    class: 'OWN_FUNCTION',
    execution: 'edge_function',
    status: 'active',
    does: 'Fetches store policy truth from edge-side knowledge retrieval.',
    doesNotDo: 'Does not replace product search or impersonate live order tracking.',
    typicalUsage: ['policy_truth', 'shipping_payment_return_terms'],
    gatingConstraints: ['Use when policy truth is needed inside the edge response path.'],
  },
  search_products: {
    id: 'search_products',
    class: 'OWN_FUNCTION',
    execution: 'edge_function',
    status: 'active',
    does: 'Provides the legacy edge-side product retrieval fallback.',
    doesNotDo: 'Does not reopen reflex product surfacing or replace the primary client search capsule path.',
    typicalUsage: ['legacy_product_search_fallback'],
    gatingConstraints: ['Keep aligned with the catalog gate. Treat as bounded legacy support, not the main storefront search spine.'],
  },
  track_order: {
    id: 'track_order',
    class: 'OWN_FUNCTION',
    execution: 'edge_function',
    status: 'active',
    does: 'Fetches private post-sale order tracking truth.',
    doesNotDo: 'Does not guess order status from model knowledge.',
    typicalUsage: ['order_tracking', 'post_sale_status'],
    gatingConstraints: ['Use when the turn is actually about an order or tracking truth.'],
  },
  get_inventory_outlook: {
    id: 'get_inventory_outlook',
    class: 'OWN_FUNCTION',
    execution: 'edge_function',
    status: 'active',
    does: 'Fetches stock or inventory outlook truth for the storefront.',
    doesNotDo: 'Does not replace product recommendations or policy answers.',
    typicalUsage: ['inventory_outlook', 'stock_truth'],
    gatingConstraints: ['Use when the current turn materially needs inventory truth.'],
  },
  check_compatibility: {
    id: 'check_compatibility',
    class: 'OWN_FUNCTION',
    execution: 'edge_function',
    status: 'active',
    does: 'Checks compatibility truth for devices, coils, pods, or related fit questions.',
    doesNotDo: 'Does not act as a generic search tool or cart upsell.',
    typicalUsage: ['compatibility_check'],
    gatingConstraints: ['Use when the current turn is a fit or compatibility question.'],
  },
};

export function getCapabilityDefinition(id: string): ToolCapabilityDefinition | null {
  return TOOL_INDEX[id as CapabilityId] ?? null;
}

export function listCapabilityDefinitions(ids: string[]): ToolCapabilityDefinition[] {
  const seen = new Set<string>();
  const definitions: ToolCapabilityDefinition[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;
    const definition = getCapabilityDefinition(id);
    if (!definition) continue;
    seen.add(id);
    definitions.push(definition);
  }

  return definitions;
}

export function isClientCapsuleCapabilityId(id: string): id is ClientCapsuleCapabilityId {
  return getCapabilityDefinition(id)?.execution === 'client_capsule';
}

export function isEdgeFunctionCapabilityId(id: string): id is EdgeFunctionCapabilityId {
  return getCapabilityDefinition(id)?.execution === 'edge_function';
}

export function isNativePublicCapabilityId(id: string): id is NativePublicCapabilityId {
  return getCapabilityDefinition(id)?.class === 'NATIVE_PUBLIC';
}

export function isPublicWebCapabilityId(id: string): id is PublicWebCapabilityId {
  return id === 'public_web_search' || id === 'public_url_context';
}

export function isServerExecutableCapabilityId(id: string): id is ServerExecutableCapabilityId {
  return isEdgeFunctionCapabilityId(id) || isPublicWebCapabilityId(id);
}

export function isCatalogCapabilityId(id: string): id is 'product_search_integrity' | 'search_products' {
  return id === 'product_search_integrity' || id === 'search_products';
}

const INTENT_CAPABILITY_PRIORITY: Record<string, CapabilityId[]> = {
  CART_OPERATION: ['cart_operator'],
  POLICY_INQUIRY: ['knowledge_rag_foundation', 'get_store_policy'],
  PUBLIC_INFO: ['public_url_context', 'public_web_search'],
  PRODUCT_SEARCH: ['product_search_integrity', 'search_products'],
  ORDER_TRACKING: ['track_order'],
  INVENTORY_OUTLOOK: ['get_inventory_outlook'],
  COMPATIBILITY_CHECK: ['check_compatibility'],
  CHIT_CHAT: [],
};

export function getCapabilityIdsForIntent(intent: string): CapabilityId[] {
  return INTENT_CAPABILITY_PRIORITY[intent] ?? [];
}
