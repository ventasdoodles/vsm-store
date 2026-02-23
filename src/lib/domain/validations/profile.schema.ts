import { z } from 'zod';

/**
 * Esquema de validación para el perfil de usuario.
 * Asegura que los datos ingresados sean correctos y completos.
 */
export const profileSchema = z.object({
    full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
    phone: z.string().regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos').optional().or(z.literal('')),
    whatsapp: z.string().regex(/^\d{10}$/, 'El WhatsApp debe tener exactamente 10 dígitos'),
    birthdate: z.string().optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
