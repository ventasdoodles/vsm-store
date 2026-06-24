import { z } from 'zod';

/**
 * // ─── CONTRACT: Admin Wheel Prizes ───
 * // Protege la configuración de la ruleta de recompensas desproporcionadas.
 */
export const WheelPrizeRequestSchema = z.object({
    label: z.string().min(2, { message: "La etiqueta debe tener al menos 2 caracteres" }),
    type: z.enum(['points', 'coupon', 'empty'], { message: "Tipo de premio inválido" }),
    value: z.object({
        amount: z.number().optional(),
        discount: z.number().optional(),
        code: z.string().optional(),
    }).default({}),
    probability: z.number()
        .min(0, { message: "La probabilidad no puede ser negativa" })
        .max(100, { message: "La probabilidad no puede superar el 100%" }),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, { message: "El color debe ser un hex válido (ej. #FF0000)" }),
    is_active: z.boolean(),
}).refine(data => {
    // Si el tipo es 'points', el monto no puede destruir la economía
    if (data.type === 'points') {
        const amount = data.value.amount;
        if (typeof amount !== 'number' || amount <= 0 || amount > 1000) {
            return false;
        }
    }
    return true;
}, {
    message: "Los premios de puntos deben tener un monto válido entre 1 y 1000 V-Coins",
    path: ["value.amount"]
});

export type WheelPrizeRequest = z.infer<typeof WheelPrizeRequestSchema>;
