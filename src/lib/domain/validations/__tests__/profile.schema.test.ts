import { describe, it, expect } from 'vitest';
import { profileSchema } from '../profile.schema';

describe('Profile Schema Validation', () => {
    it('should validate a correct profile', () => {
        const validData = {
            full_name: 'Juan Perez',
            phone: '2281234567',
            whatsapp: '2281234567',
            birthdate: '1990-01-01',
        };
        const result = profileSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail if full_name is too short', () => {
        const invalidData = {
            full_name: 'Ju',
            whatsapp: '2281234567',
        };
        const result = profileSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('El nombre debe tener al menos 3 caracteres');
        }
    });

    it('should fail if whatsapp is not 10 digits', () => {
        const invalidData = {
            full_name: 'Juan Perez',
            whatsapp: '12345',
        };
        const result = profileSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('El WhatsApp debe tener exactamente 10 dígitos');
        }
    });

    it('should allow empty phone and birthdate', () => {
        const validData = {
            full_name: 'Juan Perez',
            whatsapp: '2281234567',
            phone: '',
            birthdate: '',
        };
        const result = profileSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});
