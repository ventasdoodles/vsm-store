import { z } from 'zod';

/**
 * Representa un artículo individual dentro de un pedido
 */
const OrderItemSchema = z.object({
    product_id: z.string().uuid({ message: "El ID del producto debe ser un UUID válido" }),
    variant_id: z.string().uuid().nullable().optional(),
    variant_name: z.string().nullable().optional(),
    name: z.string().min(1, { message: "El nombre del producto no puede estar vacío" }),
    price: z.number().min(0, { message: "El precio no puede ser negativo" }),
    quantity: z.number().int().min(1, { message: "La cantidad debe ser al menos 1" }),
    image: z.string().optional(),
    section: z.string().optional(),
});

/**
 * // ─── CONTRACT: Storefront Create Order ───
 * // Protege la base de datos de manipulación financiera en la creación de pedidos.
 * // Asegura que el total, subtotal y puntos sean valores matemáticamente lógicos.
 */
export const CreateOrderRequestSchema = z.object({
    customer_id: z.string().uuid({ message: "El customer_id debe ser un UUID válido" }),
    items: z.array(OrderItemSchema).min(1, { message: "El pedido debe contener al menos un artículo" }),
    subtotal: z.number().min(0, { message: "El subtotal no puede ser negativo" }),
    shipping_cost: z.number().min(0, { message: "El costo de envío no puede ser negativo" }).optional().default(0),
    discount: z.number().min(0, { message: "El descuento no puede ser negativo" }).optional().default(0),
    total: z.number().min(0, { message: "El total no puede ser negativo" }),
    payment_method: z.enum(['cash', 'transfer', 'card', 'mercadopago', 'whatsapp']),
    shipping_address_id: z.string().uuid().optional(),
    billing_address_id: z.string().uuid().optional(),
    tracking_notes: z.string().optional(),
    // Límite generoso pero seguro de puntos ganados por pedido (ej. 100,000 max)
    earned_points: z.number().min(0).max(100000, { message: "Los puntos ganados superan el umbral máximo de seguridad" }).optional(),
}).refine(data => {
    // Math guard (approximate due to floats, but close enough to catch massive tampering)
    // subtotal + shipping - discount = total
    const expectedTotal = (data.subtotal || 0) + (data.shipping_cost || 0) - (data.discount || 0);
    const difference = Math.abs(expectedTotal - data.total);
    // Permitir pequeña diferencia por redondeo de centavos
    return difference < 1.0;
}, {
    message: "El cálculo del total es inconsistente con el subtotal, envío y descuento",
    path: ["total"]
});

export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
