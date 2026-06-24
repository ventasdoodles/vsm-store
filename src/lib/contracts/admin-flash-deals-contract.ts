import { z } from 'zod';

/**
 * // ─── CONTRACT: Admin Flash Deals ───
 * // Protege la base de datos de ofertas relámpago destructivas (ej. precio 0, inventario infinito)
 */
export const FlashDealRequestSchema = z.object({
    product_id: z.string().uuid({ message: "El product_id debe ser un UUID válido" }),
    flash_price: z.number().positive({ message: "El precio flash debe ser estrictamente positivo (mayor a 0)" }),
    max_qty: z.number().int().min(1, { message: "El límite de inventario de la oferta debe ser al menos 1" }),
    starts_at: z.string().datetime({ message: "La fecha de inicio debe ser formato ISO válido" }),
    ends_at: z.string().datetime({ message: "La fecha de fin debe ser formato ISO válido" }),
    is_active: z.boolean(),
    priority: z.number().int().min(0, { message: "La prioridad no puede ser negativa" }),
}).refine(data => {
    // Validar coherencia temporal
    const start = new Date(data.starts_at).getTime();
    const end = new Date(data.ends_at).getTime();
    return end > start;
}, {
    message: "La fecha de finalización debe ser estrictamente posterior a la de inicio",
    path: ["ends_at"]
});

export type FlashDealRequest = z.infer<typeof FlashDealRequestSchema>;
