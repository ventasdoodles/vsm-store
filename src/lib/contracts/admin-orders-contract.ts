import { z } from 'zod';

// ==========================================
// Admin Orders Contract
// ==========================================

export const CancelAdminUnpaidOrderRequestSchema = z.object({
  p_order_id: z.string().uuid("Order ID must be a valid UUID"),
  p_reason: z.string().min(5, "El motivo de cancelacion debe tener al menos 5 caracteres.")
});

export type CancelAdminUnpaidOrderRequest = z.infer<typeof CancelAdminUnpaidOrderRequestSchema>;
