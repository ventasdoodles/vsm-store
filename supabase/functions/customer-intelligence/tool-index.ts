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
  | 'cart_operator'
  | 'storefront_compatibility_check'
  | 'storefront_budget_rescue'
  | 'storefront_checkout_readiness'
  | 'storefront_inventory_outlook'
  | 'storefront_kitting_basket'
  | 'authenticated_order_tracking'
  | 'authenticated_warranty_triage'
  | 'authenticated_loyalty_status';
export type EdgeFunctionCapabilityId =
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
  storefront_compatibility_check: {
    id: 'storefront_compatibility_check',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Verifies fit and compatibility truth for a device or product against grounded storefront concepts and relations.',
    doesNotDo: 'Does not guess compatibility, mutate the cart, or act as a generic search layer.',
    typicalUsage: ['compatibility_check', 'fit_verification', 'device_fit_truth', 'coil_pod_battery_match'],
    gatingConstraints: ['Use only when the current turn is explicitly about fit or compatibility between grounded storefront products or a device and its consumables.'],
  },
  storefront_budget_rescue: {
    id: 'storefront_budget_rescue',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Finds a bounded cheaper trade-down or confirms when the current option is already the closest grounded value.',
    doesNotDo: 'Does not invent discounts, mutate prices, promise savings checkout cannot honor, or reopen broad recommendations.',
    typicalUsage: ['budget_rescue', 'cheaper_alternative', 'price_friction_trade_down', 'late_stage_price_objection'],
    gatingConstraints: ['Use only when the current turn explicitly asks for a cheaper option, lower spend, or a bounded trade-down from a grounded current product.'],
  },
  storefront_checkout_readiness: {
    id: 'storefront_checkout_readiness',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Reads bounded storefront cart, checkout, payment-method, and open-order truth so the assistant can say if the purchase can close right now.',
    doesNotDo: 'Does not create orders, charge payments, invent shipping quotes, or redesign checkout.',
    typicalUsage: ['checkout_readiness', 'close_now_friction', 'payment_method_info', 'shipping_requirement_truth'],
    gatingConstraints: ['Use only when the current turn is truly about closing the current purchase, what is missing, payment methods, or bounded shipping-readiness truth.'],
  },
  storefront_inventory_outlook: {
    id: 'storefront_inventory_outlook',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Reads bounded storefront stock, restock, and omnichannel truth for a current product from grounded catalog and inventory sources.',
    doesNotDo: 'Does not invent ETA, branch stock, POS sync, or a logistics dashboard.',
    typicalUsage: ['inventory_outlook', 'online_stock_truth', 'bounded_omnichannel_availability', 'restock_truth'],
    gatingConstraints: ['Use only when the current turn is truly about stock, availability, restock, or omnichannel truth for a specific storefront product.'],
  },
  storefront_kitting_basket: {
    id: 'storefront_kitting_basket',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Assembles a bounded compatible in-stock kit for explicit starter-setup or hardware-upgrade requests.',
    doesNotDo: 'Does not invent broad bundles, loosen fit truth, or create a general recommender engine.',
    typicalUsage: ['starter_kit', 'hardware_upgrade', 'disposable_to_pod', 'pod_setup', 'liquid_setup'],
    gatingConstraints: ['Use only when the turn explicitly asks for a kit, setup, or hardware upgrade that benefits from grounded multi-item assembly.'],
  },
  authenticated_order_tracking: {
    id: 'authenticated_order_tracking',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Reads authenticated recent order truth so the storefront can answer post-purchase payment, status, or guia questions from persisted data.',
    doesNotDo: 'Does not invent guest access, scrape couriers, mutate orders, or promise tracking data that is not already persisted.',
    typicalUsage: ['authenticated_order_tracking', 'payment_confirmation_truth', 'post_purchase_status'],
    gatingConstraints: ['Use only when the current turn is truly about the authenticated customer\'s order/payment/tracking state.'],
  },
  authenticated_warranty_triage: {
    id: 'authenticated_warranty_triage',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Reads authenticated recent fulfilled-order truth so the storefront can triage defect or warranty-style turns against persisted post-purchase context.',
    doesNotDo: 'Does not create RMAs, promise refunds, mutate orders, or fake eligibility beyond the bounded recent-order context.',
    typicalUsage: ['authenticated_warranty_triage', 'defect_triage', 'post_purchase_support_context'],
    gatingConstraints: ['Use only when the current turn is a defect, warranty, or post-purchase support issue grounded in the authenticated customer\'s recent order history.'],
  },
  authenticated_loyalty_status: {
    id: 'authenticated_loyalty_status',
    class: 'OWN_FUNCTION',
    execution: 'client_capsule',
    status: 'active',
    does: 'Reads authenticated loyalty truth so the storefront can answer points, tier, VIP, or value questions from existing customer and store rules.',
    doesNotDo: 'Does not redeem points, mutate balances, invent discounts, or turn loyalty status into a CRM workflow.',
    typicalUsage: ['authenticated_loyalty_status', 'points_balance_truth', 'vip_tier_status'],
    gatingConstraints: ['Use only when the current turn is truly about the authenticated customer\'s points, tier, VIP status, or loyalty value.'],
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

export function buildCapabilityPromptSummary(ids: string[]): string {
  return listCapabilityDefinitions(ids)
    .map((definition) => {
      const gatingLine = definition.gatingConstraints?.[0]
        ? ` Regla: ${definition.gatingConstraints[0]}`
        : '';

      return `- ${definition.id}: ${definition.does} No hace: ${definition.doesNotDo}.${gatingLine}`;
    })
    .join('\n');
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

export function isCatalogCapabilityId(id: string): id is 'product_search_integrity' | 'search_products' | 'storefront_budget_rescue' {
  return id === 'product_search_integrity' || id === 'search_products' || id === 'storefront_budget_rescue';
}

const INTENT_CAPABILITY_PRIORITY: Record<string, CapabilityId[]> = {
  CART_OPERATION: ['cart_operator'],
  COMPATIBILITY_CHECK: ['storefront_compatibility_check'],
  BUDGET_RESCUE: ['storefront_budget_rescue'],
  CHECKOUT_READINESS: ['storefront_checkout_readiness'],
  WARRANTY_SUPPORT: ['authenticated_warranty_triage'],
  LOYALTY_SUPPORT: ['authenticated_loyalty_status'],
  POLICY_INQUIRY: ['knowledge_rag_foundation'],
  PUBLIC_INFO: ['public_url_context', 'public_web_search'],
  KIT_ASSEMBLY: ['storefront_kitting_basket'],
  PRODUCT_SEARCH: ['product_search_integrity', 'search_products'],
  ORDER_TRACKING: ['authenticated_order_tracking'],
  INVENTORY_OUTLOOK: ['storefront_inventory_outlook', 'get_inventory_outlook'],
  CHIT_CHAT: [],
};

export function getCapabilityIdsForIntent(intent: string): CapabilityId[] {
  return INTENT_CAPABILITY_PRIORITY[intent] ?? [];
}
