import { z } from 'zod';

/**
 * // ─── CONTRACT: Admin Variants ───
 * // Protege los precios e inventarios de las variantes de productos.
 */
export const VariantInputSchema = z.object({
    sku: z.string().optional(),
    price: z.number().min(0, { message: "El precio de la variante no puede ser negativo" }),
    stock: z.number().int().min(0, { message: "El inventario de la variante no puede ser negativo" }),
    images: z.array(z.string()).optional(),
    optionValueIds: z.array(z.string().uuid()).optional(),
});

export const SyncVariantsRequestSchema = z.array(VariantInputSchema);

export type VariantInputRequest = z.infer<typeof VariantInputSchema>;
