import { z } from 'zod';

export const checkoutSchema = z.object({
    customerName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    customerPhone: z.string().refine(
        (v) => v.replace(/\D/g, '').length >= 10,
        'El teléfono debe tener al menos 10 dígitos'
    ),
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

// Nota: El tipo canónico CheckoutFormData vive en types/cart.ts.
// Este schema valida los mismos campos para el formulario de checkout.
