import { z } from 'zod';

export const checkoutSchema = z.object({
    customerName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    customerPhone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos'),
    deliveryType: z.enum(['pickup', 'delivery']),
    address: z.string().optional(),
    paymentMethod: z.enum(['transfer', 'mercadopago', 'cash']),
}).superRefine((data, ctx) => {
    if (data.deliveryType === 'delivery' && (!data.address || data.address.trim().length < 5)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La dirección es requerida para envíos a domicilio',
            path: ['address'],
        });
    }
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
