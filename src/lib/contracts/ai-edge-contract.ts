import { z } from 'zod';

// ==========================================
// AI Edge Function (customer-intelligence) Contract
// ==========================================

export const ChatHistoryRoleSchema = z.enum(['user', 'assistant', 'model', 'system']);

export const ChatHistoryStandardItemSchema = z.object({
  role: ChatHistoryRoleSchema,
  content: z.string(),
});

export const ChatHistoryGeminiItemSchema = z.object({
  role: ChatHistoryRoleSchema,
  parts: z.array(z.object({ text: z.string() })).min(1),
});

export const ChatHistoryItemSchema = z.union([
  ChatHistoryStandardItemSchema,
  ChatHistoryGeminiItemSchema,
]);

/**
 * Contract for what the Frontend is ALLOWED to send to `customer-intelligence`
 * when invoking the concierge.
 */
export const CustomerIntelligenceRequestSchema = z.object({
  action: z.literal('concierge_chat'),
  query: z.string(),
  history: z.array(ChatHistoryItemSchema).optional().default([]),
  stream: z.boolean().optional().default(true),
  visitorId: z.string().optional(),
  cesarin_session_id: z.string().nullable().optional(),
  cartContext: z.any().optional(), // Can be strictly typed later
  customerId: z.string().uuid().optional(),
  customerContext: z.any().optional(),
  isTest: z.boolean().optional(),
  is_pilot: z.boolean().optional(),
  audio: z.string().optional(),
  mimeType: z.string().optional(),
}).passthrough();

export type CustomerIntelligenceRequest = z.infer<typeof CustomerIntelligenceRequestSchema>;

/**
 * Contract for what the Backend is REQUIRED to return 
 * when `stream` is false.
 */
export const CustomerIntelligenceResponseSchema = z.object({
  response: z.string().optional(),
  text: z.string().optional(),
  message: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  error: z.string().optional()
}).passthrough();

export type CustomerIntelligenceResponse = z.infer<typeof CustomerIntelligenceResponseSchema>;
