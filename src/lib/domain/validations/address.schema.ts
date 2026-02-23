import { z } from 'zod';

/**
 * Esquema de validación para direcciones de usuario.
 * Asegura que los datos de envío/facturación sean correctos y completos.
 */
export const addressSchema = z.object({
    type: z.enum(['shipping', 'billing'], {
        required_error: 'El tipo de dirección es requerido',
    }),
    label: z.string().min(1, 'La etiqueta es requerida').max(50, 'La etiqueta es demasiado larga'),
    full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
    street: z.string().min(3, 'La calle es requerida').max(150, 'La calle es demasiado larga'),
    number: z.string().min(1, 'El número es requerido').max(20, 'El número es demasiado largo'),
    colony: z.string().min(3, 'La colonia es requerida').max(100, 'La colonia es demasiado larga'),
    city: z.string().min(2, 'La ciudad es requerida').max(100, 'La ciudad es demasiado larga'),
    state: z.string().min(2, 'El estado es requerido').max(100, 'El estado es demasiado largo'),
    zip_code: z.string().regex(/^\d{5}$/, 'El código postal debe tener exactamente 5 dígitos'),
    phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos').optional().or(z.literal('')),
    notes: z.string().max(500, 'Las notas son demasiado largas').optional().or(z.literal('')),
    is_default: z.boolean().default(false),
});

export type AddressFormData = z.infer<typeof addressSchema>;
