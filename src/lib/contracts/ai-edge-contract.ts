import { z } from 'zod';

// ==========================================
// AI Edge Function (customer-intelligence) Contract
// ==========================================

export const ChatHistoryRoleSchema = z.enum(['user', 'model']);

export const ChatHistoryPartSchema = z.object({
  text: z.string()
});

export const ChatHistoryItemSchema = z.object({
  role: ChatHistoryRoleSchema,
  parts: z.array(ChatHistoryPartSchema).min(1)
});

/**
 * Contract for what the Frontend is ALLOWED to send to `customer-intelligence`
 * when invoking the concierge.
 */
export const CustomerIntelligenceRequestSchema = z.object({
  action: z.literal('concierge_chat'),
  message: z.string().min(1, "El mensaje no puede estar vacío"),
  history: z.array(ChatHistoryItemSchema).optional().default([]),
  stream: z.boolean().optional().default(true),
  visitorId: z.string().optional(),
  cartContext: z.any().optional(), // Can be strictly typed later
  customerId: z.string().uuid().optional(),
  isTest: z.boolean().optional(),
}).passthrough();

export type CustomerIntelligenceRequest = z.infer<typeof CustomerIntelligenceRequestSchema>;

/**
 * Contract for what the Backend is REQUIRED to return 
 * when `stream` is false.
 */
export const CustomerIntelligenceResponseSchema = z.object({
  response: z.string(),
  metadata: z.record(z.any()).optional(),
  error: z.string().optional()
});

export type CustomerIntelligenceResponse = z.infer<typeof CustomerIntelligenceResponseSchema>;
