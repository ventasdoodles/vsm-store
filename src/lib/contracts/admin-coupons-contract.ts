import { z } from 'zod';

/**
 * // ─── CONTRACT: Admin Create/Update Coupon ───
 * // Protege la base de datos de cupones erróneos o maliciosos que puedan causar pérdidas financieras.
 */
export const AdminCouponRequestSchema = z.object({
    code: z.string()
        .min(3, { message: "El código debe tener al menos 3 caracteres" })
        .max(30, { message: "El código es demasiado largo" })
        .regex(/^[A-Z0-9_-]+$/, { message: "El código solo puede contener mayúsculas, números, guiones y guiones bajos" }),
    description: z.string().optional().nullable(),
    discount_type: z.enum(['percentage', 'fixed'], { message: "Tipo de descuento inválido" }),
    discount_value: z.number().min(1, { message: "El descuento debe ser mayor a 0" }),
    min_purchase: z.number().min(0, { message: "La compra mínima no puede ser negativa" }),
    max_uses: z.number().int().min(1, { message: "El máximo de usos debe ser al menos 1" }).nullable().optional(),
    is_active: z.boolean().default(true),
    valid_from: z.string().nullable().optional(),
    valid_until: z.string().nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
}).refine(data => {
    // Math guard: if percentage, it cannot exceed 100
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
        return false;
    }
    return true;
}, {
    message: "El descuento por porcentaje no puede exceder el 100%",
    path: ["discount_value"]
});

export type AdminCouponRequest = z.infer<typeof AdminCouponRequestSchema>;
