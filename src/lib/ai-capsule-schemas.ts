import { z } from 'zod';

// ==========================================
// 1. TOOL SCHEMA (INPUT CONTRACT)
// ==========================================
export const productSearchToolSchema = z.object({
  query: z.string().describe("El término, marca o sabor específico que el usuario busca."),
  is_ambiguous: z.boolean().describe("True si la intención es vaga (ej. 'algo dulce', 'un vape') sin producto específico."),
  requires_semantic_expansion: z.boolean().describe("True si el término es un concepto en lugar de un nombre de producto.")
});

export const knowledgeToolSchema = z.object({
  query: z.string().describe("La pregunta, concepto o política oficial que el usuario desea consultar."),
  is_ambiguous: z.boolean().describe("True si la intención de búsqueda es genérica o poco específica (ej. 'ayuda', 'envíos').")
});

export const cartOperatorToolSchema = z.object({
  action: z.enum(['ADD', 'REMOVE', 'UPDATE_QTY']).describe("La operación exacta que el usuario desea realizar sobre el carrito."),
  product_ref: z.string().describe("El producto, sabor o variante tal y como lo menciona el usuario."),
  quantity: z.number().int().positive().describe("La cantidad deseada. Default 1 si no es especificada."),
  variant_ref: z.string().nullable().optional().describe("Si el usuario especifica una variante concreta, como 'rojo', '120ml'.")
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
  specs: z.any().nullable().optional() // JSONB specs for response drafting — any shape allowed
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
  match_strategy: z.enum(['EXACT', 'SEMANTIC', 'FEATURED_FALLBACK', 'OUT_OF_STOCK_ALTERNATIVE', 'NO_MATCH']),
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
  
  resolved_products: z.array(internalResolvedProductSchema).optional(),
  exhausted_exact_matches: z.array(internalResolvedProductSchema).optional(),
  
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
 
// ==========================================
// 3. INFERRED TYPES FOR ORCHESTRATION
// ==========================================
export type InternalCapsuleContract = z.infer<typeof internalCapsuleContractSchema>;
export type InternalKnowledgeContract = z.infer<typeof internalKnowledgeContractSchema>;
export type InternalCartOperatorContract = z.infer<typeof internalCartOperatorContractSchema>;
export type InternalResolvedProduct = z.infer<typeof internalResolvedProductSchema>;
export type InternalKnowledgeChunk = z.infer<typeof internalKnowledgeChunkSchema>;
export type PublicAttachment = z.infer<typeof publicAttachmentSchema>;
export type FrontendResponseContract = z.infer<typeof frontendResponseSchema>;
