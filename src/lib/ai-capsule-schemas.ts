import { z } from 'zod';

// ==========================================
// 1. TOOL SCHEMA (INPUT CONTRACT)
// ==========================================
export const productSearchToolSchema = z.object({
  query: z.string().describe("El término, marca o sabor específico que el usuario busca."),
  is_ambiguous: z.boolean().default(false).describe("True si la intención es vaga (ej. 'algo dulce', 'un vape') sin producto específico."),
  requires_semantic_expansion: z.boolean().describe("True si el término es un concepto en lugar de un nombre de producto.")
});

export const knowledgeToolSchema = z.object({
  query: z.string().describe("La pregunta, concepto o política oficial que el usuario desea consultar."),
  is_ambiguous: z.boolean().default(false).describe("True si la intención de búsqueda es genérica o poco específica (ej. 'ayuda', 'envíos').")
});

export const cartOperatorToolSchema = z.object({
  action: z.enum(['ADD', 'REMOVE', 'UPDATE_QTY']).describe("La operación exacta que el usuario desea realizar sobre el carrito."),
  product_ref: z.string().describe("El producto, sabor o variante tal y como lo menciona el usuario."),
  quantity: z.number().int().positive().describe("La cantidad deseada. Default 1 si no es especificada."),
  variant_ref: z.string().nullable().optional().describe("Si el usuario especifica una variante concreta, como 'rojo', '120ml'.")
});

export const orderTrackingToolSchema = z.object({
  query: z.string().describe("La pregunta post-compra autenticada del cliente sobre pago, estado o guia de su pedido."),
});

export const warrantyTriageToolSchema = z.object({
  query: z.string().describe("La consulta autenticada del cliente sobre una falla, garantia o defecto post-compra."),
});

export const loyaltyStatusToolSchema = z.object({
  query: z.string().describe("La pregunta autenticada del cliente sobre puntos, nivel, valor o estatus VIP de lealtad."),
});

export const storefrontKittingToolSchema = z.object({
  query: z.string().describe("La solicitud de armado de kit, setup o upgrade del cliente con señales concretas del turno."),
  flavor_preference: z.string().nullable().optional().describe("Preferencia de sabor grounded en el turno, si existe."),
  nicotine_preference: z.string().nullable().optional().describe("Preferencia de nicotina grounded en el turno, si existe."),
  format_preference: z.string().nullable().optional().describe("Preferencia de formato grounded en el turno, si existe."),
  upgrade_intent: z.boolean().default(false).describe("True cuando el turno pide cambio de desechables, pods o hardware similar."),
  wants_device: z.boolean().default(false).describe("True cuando el turno pide equipo, base o hardware."),
  wants_consumable: z.boolean().default(false).describe("True cuando el turno pide pod, cartucho, resistencia u otro consumible."),
  wants_liquid: z.boolean().default(false).describe("True cuando el turno pide liquido o una formulacion equivalente grounded."),
});

// ==========================================
// 2. INTERNAL & PUBLIC DATA SCHEMAS
// ==========================================

export const internalResolvedProductSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  // section is the canonical storefront route prefix — required for PDP navigation.
  // Optional for backward compat with edge-function fallback paths that may not supply it.
  section: z.enum(['vape', '420']).optional(),
  name: z.string(),
  display_price: z.string(),
  sku: z.string().optional(),
  raw_stock: z.number(),
  status_signal: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'COMING_SOON']),
  commercial_flag: z.enum(['STANDARD', 'FEATURED', 'CLEARANCE', 'NEW']),
  cost_price: z.number().optional(), // Internal only, never exposed
  ai_sales_note: z.string().nullable().optional(),
  description: z.string().nullable().optional(), // Semantic retrieval context
  specs: z.any().nullable().optional(), // JSONB specs for response drafting — any shape allowed
  variant_truth: z.object({
    requested_variant_intent: z.boolean(),
    requested_attribute: z.enum([
      'color',
      'resistance',
      'nicotine',
      'flavor',
      'model',
      'size',
      'presentation',
    ]).nullable().optional(),
    requested_value: z.string().nullable().optional(),
    availability: z.enum(['available', 'missing', 'ambiguous', 'unsupported']),
    matched_variant_id: z.string().uuid().nullable().optional(),
    matched_variant_label: z.string().nullable().optional(),
    active_variant_count: z.number().int().nonnegative().optional(),
    available_variant_count: z.number().int().nonnegative().optional(),
  }).optional()
});

export const publicAttachmentSchema = z.object({
  public_id: z.string(),
  title: z.string(),
  display_price: z.string(),
  image_url: z.string().url().optional(),
  availability_label: z.string(),
  ai_sales_note: z.string().nullable().optional(),
  description: z.string().nullable().optional() // Semantic context for downstream
});

export const storefrontAttachmentProductRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  section: z.enum(['vape', '420']),
});

export const storefrontAttachmentOfferSchema = z.object({
  primary_product_id: z.string().uuid(),
  relation_type: z.enum([
    'uses_coil',
    'uses_pod',
    'uses_battery',
    'uses_liquid',
    'recommended_for_liquid',
    'has_connector',
    'replaces',
  ]),
  scope: z.enum(['specific_model', 'class_generalization']),
  rationale: z.string(),
  attached_product: storefrontAttachmentProductRefSchema,
});

export const storefrontPromotionSignalSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('FLASH_DEAL'),
    product_id: z.string().uuid(),
    product_name: z.string(),
    flash_price: z.number().positive(),
    original_price: z.number().positive(),
    savings_amount: z.number().nonnegative(),
    ends_at: z.string(),
    informational_only: z.boolean(),
  }),
  z.object({
    kind: z.literal('COUPON'),
    code: z.string(),
    description: z.string().nullable().optional(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    min_purchase: z.number().nonnegative(),
    valid_until: z.string().nullable().optional(),
    informational_only: z.boolean(),
    eligibility_note: z.string().nullable().optional(),
  }),
]);

export const storefrontReplenishmentSignalSchema = z.object({
  kind: z.enum(['READY', 'PARTIAL', 'UNAVAILABLE']),
  source_order_id: z.string().uuid(),
  source_order_created_at: z.string(),
  source_phrase: z.enum([
    'LO_DE_SIEMPRE',
    'LO_MISMO',
    'MIS_PODS',
    'QUIERO_REPETIR',
    'REPLENISHMENT',
  ]),
  primary_product: storefrontAttachmentProductRefSchema.optional(),
  variant_id: z.string().uuid().nullable().optional(),
  variant_label: z.string().nullable().optional(),
  quantity: z.number().int().positive().optional(),
  requested_quantity: z.number().int().positive().optional(),
  blocked_item_count: z.number().int().nonnegative(),
  partial_quantity: z.boolean().optional(),
  action_mode: z.enum(['ADD_TO_CART', 'OPEN_PDP', 'NONE']),
  blocked_reason_detail: z.string().nullable().optional(),
});

export const storefrontOrderTrackingSignalSchema = z.object({
  kind: z.enum(['FOUND', 'NO_RELEVANT_ORDER', 'ORDER_NOT_FOUND', 'AUTH_REQUIRED']),
  focus: z.enum(['payment_status', 'tracking', 'shipping_status', 'order_status', 'overview']),
  scope: z.enum(['RECENT_ACTIVE_ORDERS', 'EXPLICIT_ORDER_LOOKUP', 'AUTH_REQUIRED', 'NONE']),
  order_id: z.string().uuid().nullable().optional(),
  order_number: z.string().nullable().optional(),
  order_status: z.string().nullable().optional(),
  payment_status: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  tracking_number: z.string().nullable().optional(),
  tracking_link: z.string().url().nullable().optional(),
  matched_by: z.enum(['explicit_order_number', 'recent_active_order', 'recent_order', 'none']).optional(),
});

export const storefrontWarrantyTriageSignalSchema = z.object({
  kind: z.enum(['LIKELY_ELIGIBLE', 'OUT_OF_POLICY', 'CANNOT_IDENTIFY_PRODUCT', 'NO_RELEVANT_ORDER', 'AUTH_REQUIRED']),
  defect_type: z.enum(['burnt_taste', 'broken_on_arrival', 'leaking', 'not_powering_on', 'not_working', 'warranty_request', 'return_request', 'general_defect']),
  scope: z.enum(['RECENT_FULFILLED_ORDERS', 'EXPLICIT_ORDER_LOOKUP', 'AUTH_REQUIRED', 'NONE']),
  order_id: z.string().uuid().nullable().optional(),
  order_number: z.string().nullable().optional(),
  order_status: z.string().nullable().optional(),
  matched_item_name: z.string().nullable().optional(),
  matched_product_id: z.string().nullable().optional(),
  matched_variant_id: z.string().nullable().optional(),
  days_since_order: z.number().int().nonnegative().nullable().optional(),
  policy_window_days: z.number().int().positive().nullable().optional(),
  matched_by: z.enum(['explicit_order_number', 'single_item_order', 'item_name_match', 'variant_name_match', 'recent_order', 'none']).optional(),
});

export const storefrontLoyaltyStatusSignalSchema = z.object({
  kind: z.enum(['POINTS_BALANCE', 'TIER_INFO', 'AUTH_REQUIRED', 'NO_LOYALTY_DATA']),
  focus: z.enum(['points', 'tier', 'value', 'overview']),
  scope: z.enum(['AUTHENTICATED_LOYALTY_PROFILE', 'AUTH_REQUIRED', 'NONE']),
  customer_id: z.string().uuid().nullable().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).nullable().optional(),
  tier_label: z.string().nullable().optional(),
  points_balance: z.number().int().nonnegative().nullable().optional(),
  monetary_value: z.number().nonnegative().nullable().optional(),
  currency_per_point: z.number().nonnegative().nullable().optional(),
  total_spent: z.number().nonnegative().nullable().optional(),
  next_tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).nullable().optional(),
  next_tier_label: z.string().nullable().optional(),
  amount_to_next_tier: z.number().nonnegative().nullable().optional(),
  tier_progress: z.number().int().min(0).max(100).nullable().optional(),
  loyalty_enabled: z.boolean().nullable().optional(),
});

export const storefrontKittingSignalSchema = z.object({
  kind: z.enum(['FULL_KIT', 'PARTIAL_KIT', 'NO_GROUNDED_KIT']),
  setup_focus: z.enum(['starter_kit', 'hardware_upgrade', 'disposable_to_pod', 'pod_setup', 'liquid_setup', 'mixed_setup']),
  scope: z.enum(['CATALOG_KIT', 'CATALOG_PARTIAL', 'NONE']),
  base_product: storefrontAttachmentProductRefSchema.nullable().optional(),
  consumable_product: storefrontAttachmentProductRefSchema.nullable().optional(),
  liquid_product: storefrontAttachmentProductRefSchema.nullable().optional(),
  missing_piece: z.enum(['base_device', 'consumable', 'liquid']).nullable().optional(),
  flavor_preference: z.string().nullable().optional(),
  nicotine_preference: z.string().nullable().optional(),
  format_preference: z.string().nullable().optional(),
  upgrade_intent: z.boolean().nullable().optional(),
  wants_device: z.boolean().nullable().optional(),
  wants_consumable: z.boolean().nullable().optional(),
  wants_liquid: z.boolean().nullable().optional(),
  kit_size: z.number().int().nonnegative(),
});

export const frontendResponseSchema = z.object({
  message: z.string(),
  // ui_intent describes visual/layout intent, not business outcome
  ui_intent: z.enum(['CHAT_ONLY', 'PRODUCT_DISPLAY', 'SYSTEM_ERROR']),
  // response_state describes operational severity/state (health of the capsule)
  response_state: z.enum(['OPTIMAL', 'DEGRADED', 'FATAL']),
  attachments: z.array(publicAttachmentSchema).optional()
});

export const internalCapsuleContractSchema = z.object({
  capsule_name: z.literal('product_search_integrity'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum(['EXACT', 'SEMANTIC', 'TOKEN_RECOVERY', 'FEATURED_FALLBACK', 'OUT_OF_STOCK_ALTERNATIVE', 'NO_MATCH']),
  customer_response_draft: z.string(),
  
  // search_confidence is a soft heuristic signal (0 to 1), not a hard probabilistic truth
  search_confidence: z.number().min(0).max(1),
  latency_ms: z.number(),
  
  degraded_reason: z.enum([
    'VECTOR_TIMEOUT', 
    'ORACLE_TIMEOUT', 
    'DB_LATENCY', 
    'QUOTA_LIMIT',
    'SCHEMA_ERROR'
  ]).optional(),

  truth_signals: z.object({
    direct_answer_complete: z.boolean().optional(),
    direct_answer_kind: z.enum(['FACT', 'HONEST_MISSING_FACT']).optional(),
    fact_family: z.enum(['Puffs', 'Nicotina', 'Sabor', 'Modelo', 'Compatibilidad']).nullable().optional(),
  }).optional(),

  help_contract: z.object({
    compare_supported: z.boolean().optional(),
    preferred_product_id: z.string().uuid().nullable().optional(),
    secondary_product_id: z.string().uuid().nullable().optional(),
    action_strength: z.enum(['review_only', 'review_then_cart']).optional(),
  }).optional(),
  attachment_offer: storefrontAttachmentOfferSchema.optional(),
  promotion_signal: storefrontPromotionSignalSchema.optional(),
  replenishment_signal: storefrontReplenishmentSignalSchema.optional(),
  
  resolved_products: z.array(internalResolvedProductSchema).optional(),
  exhausted_exact_matches: z.array(internalResolvedProductSchema).optional(),
  retrieval_source: z.enum(['DIRECT_EXACT', 'EMBEDDING_SEMANTIC', 'TOKEN_RECOVERY', 'AUTHENTICATED_REORDER', 'NONE']).optional(),
  
  // capsule_reasoning is optional, strictly for debug/QA logging only
  capsule_reasoning: z.string().optional()
});

export const internalKnowledgeChunkSchema = z.object({
  id: z.string(),
  category: z.string(),
  title: z.string(),
  content: z.string(),
  similarity_score: z.number().optional()
});

export const internalKnowledgeContractSchema = z.object({
  capsule_name: z.literal('knowledge_rag_foundation'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum(['HIGH_CONFIDENCE_POLICY_MATCH', 'MODERATE_CONFIDENCE_MULTI_SOURCE', 'LOW_CONFIDENCE_FALLBACK', 'NO_MATCH', 'DEGRADED']),
  ui_render_hint: z.string(),
  
  search_confidence: z.number().min(0).max(1),
  latency_ms: z.number(),
  
  degraded_reason: z.enum([
    'VECTOR_TIMEOUT', 
    'DB_LATENCY', 
    'QUOTA_LIMIT',
    'SCHEMA_ERROR'
  ]).optional(),
  
  resolved_chunks: z.array(internalKnowledgeChunkSchema).optional(),
  capsule_reasoning: z.string().optional()
});

export const internalCartOperatorContractSchema = z.object({
  capsule_name: z.literal('cart_operator'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum(['EXACT_MUTATION_PROPOSED', 'AMBIGUOUS_MUTATION', 'UNSAFE_MUTATION', 'NO_OP']),
  
  mutation_proposal: z.object({
    type: z.enum(['ADD', 'REMOVE', 'UPDATE_QTY']),
    product_ref: z.string(),
    resolved_product_id: z.string().nullable(),
    resolved_variant_id: z.string().nullable(),
    quantity: z.number()
  }).optional(),

  ui_render_mode: z.enum(['ACTION_READY', 'CLARIFICATION_REQUIRED', 'ACTION_BLOCKED', 'SILENT']),
  
  latency_ms: z.number(),
  degraded_reason: z.enum([
    'QUOTA_LIMIT',
    'SCHEMA_ERROR',
    'CATALOG_LATENCY'
  ]).optional(),
});

export const internalOrderTrackingContractSchema = z.object({
  capsule_name: z.literal('authenticated_order_tracking'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum(['AUTHENTICATED_ACTIVE_ORDER', 'AUTHENTICATED_RECENT_ORDER', 'EXPLICIT_ORDER_MATCH', 'NO_RELEVANT_ORDER', 'ORDER_NOT_FOUND', 'AUTH_REQUIRED']),
  customer_response_draft: z.string(),
  latency_ms: z.number(),
  degraded_reason: z.enum([
    'AUTH_REQUIRED',
    'ORDER_NOT_FOUND',
    'NO_RELEVANT_ORDER',
    'DB_LATENCY',
    'SCHEMA_ERROR',
  ]).optional(),
  order_tracking_signal: storefrontOrderTrackingSignalSchema,
  retrieval_source: z.enum(['AUTHENTICATED_ACTIVE_ORDER', 'AUTHENTICATED_RECENT_ORDER', 'EXPLICIT_ORDER_LOOKUP', 'NONE']),
  capsule_reasoning: z.string().optional(),
});

export const internalWarrantyTriageContractSchema = z.object({
  capsule_name: z.literal('authenticated_warranty_triage'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum([
    'AUTHENTICATED_ITEM_MATCH',
    'AUTHENTICATED_SINGLE_ITEM_ORDER',
    'EXPLICIT_ORDER_MATCH',
    'OUT_OF_POLICY',
    'CANNOT_IDENTIFY_PRODUCT',
    'NO_RELEVANT_ORDER',
    'AUTH_REQUIRED',
  ]),
  customer_response_draft: z.string(),
  latency_ms: z.number(),
  degraded_reason: z.enum([
    'AUTH_REQUIRED',
    'CANNOT_IDENTIFY_PRODUCT',
    'NO_RELEVANT_ORDER',
    'DB_LATENCY',
    'SCHEMA_ERROR',
  ]).optional(),
  warranty_triage_signal: storefrontWarrantyTriageSignalSchema,
  retrieval_source: z.enum(['AUTHENTICATED_RECENT_ORDER', 'EXPLICIT_ORDER_LOOKUP', 'NONE']),
  capsule_reasoning: z.string().optional(),
});

export const internalLoyaltyStatusContractSchema = z.object({
  capsule_name: z.literal('authenticated_loyalty_status'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum([
    'AUTHENTICATED_POINTS_BALANCE',
    'AUTHENTICATED_TIER_INFO',
    'AUTH_REQUIRED',
    'NO_LOYALTY_DATA',
  ]),
  customer_response_draft: z.string(),
  latency_ms: z.number(),
  degraded_reason: z.enum([
    'AUTH_REQUIRED',
    'NO_LOYALTY_DATA',
    'DB_LATENCY',
    'SCHEMA_ERROR',
  ]).optional(),
  loyalty_status_signal: storefrontLoyaltyStatusSignalSchema,
  retrieval_source: z.enum(['AUTHENTICATED_CUSTOMER_PROFILE', 'NONE']),
  capsule_reasoning: z.string().optional(),
});

export const internalKittingBasketContractSchema = z.object({
  capsule_name: z.literal('storefront_kitting_basket'),
  capsule_version: z.string(),
  execution_status: z.enum(['SUCCESS', 'DEGRADED', 'FAILED']),
  match_strategy: z.enum(['FULL_KIT', 'PARTIAL_KIT', 'NO_GROUNDED_KIT']),
  customer_response_draft: z.string(),
  latency_ms: z.number(),
  degraded_reason: z.enum([
    'DB_LATENCY',
    'SCHEMA_ERROR',
  ]).optional(),
  kitting_signal: storefrontKittingSignalSchema,
  resolved_products: z.array(storefrontAttachmentProductRefSchema).optional(),
  retrieval_source: z.enum(['CATALOG_KITTING', 'NONE']),
  capsule_reasoning: z.string().optional(),
});
 
// ==========================================
// 3. INFERRED TYPES FOR ORCHESTRATION
// ==========================================
export type InternalCapsuleContract = z.infer<typeof internalCapsuleContractSchema>;
export type InternalKnowledgeContract = z.infer<typeof internalKnowledgeContractSchema>;
export type InternalCartOperatorContract = z.infer<typeof internalCartOperatorContractSchema>;
export type InternalOrderTrackingContract = z.infer<typeof internalOrderTrackingContractSchema>;
export type InternalWarrantyTriageContract = z.infer<typeof internalWarrantyTriageContractSchema>;
export type InternalLoyaltyStatusContract = z.infer<typeof internalLoyaltyStatusContractSchema>;
export type InternalKittingBasketContract = z.infer<typeof internalKittingBasketContractSchema>;
export type InternalResolvedProduct = z.infer<typeof internalResolvedProductSchema>;
export type InternalKnowledgeChunk = z.infer<typeof internalKnowledgeChunkSchema>;
export type PublicAttachment = z.infer<typeof publicAttachmentSchema>;
export type FrontendResponseContract = z.infer<typeof frontendResponseSchema>;
