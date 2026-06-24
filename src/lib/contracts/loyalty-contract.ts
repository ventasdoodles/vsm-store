import { z } from 'zod';

// ==========================================
// Loyalty (V-Coins) RPC Contract
// ==========================================

export const LoyaltyTransactionTypeSchema = z.enum(['earned', 'spent', 'expired', 'adjustment']);

/**
 * Contract for what the Frontend is ALLOWED to send to the `process_loyalty_points` RPC.
 */
export const ProcessLoyaltyPointsRequestSchema = z.object({
  p_user_id: z.string().uuid("p_user_id must be a valid UUID"),
  p_amount: z.number().int("p_amount must be an integer"),
  p_type: LoyaltyTransactionTypeSchema,
  p_description: z.string().min(1, "Description cannot be empty"),
  p_order_id: z.string().uuid("p_order_id must be a UUID").nullable()
});

export type ProcessLoyaltyPointsRequest = z.infer<typeof ProcessLoyaltyPointsRequestSchema>;
