import { z } from 'zod';

// ==========================================
// Payments (Mercado Pago) Contract
// ==========================================

/**
 * Contract for what the Frontend is ALLOWED to send to the `create-payment` Edge Function.
 */
export const CreatePaymentRequestSchema = z.object({
  body: z.object({
    order_id: z.string().uuid("order_id must be a valid UUID")
  })
});

export type CreatePaymentRequest = z.infer<typeof CreatePaymentRequestSchema>;
