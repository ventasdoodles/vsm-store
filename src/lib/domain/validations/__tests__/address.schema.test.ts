import { describe, it, expect } from 'vitest';
import { addressSchema } from '../address.schema';

describe('Address Schema Validation', () => {
    const validAddress = {
        type: 'shipping' as const,
        label: 'Casa',
        full_name: 'Juan Perez',
        street: 'Av. Lázaro Cárdenas',
        number: '123',
        colony: 'Centro',
        city: 'Xalapa',
        state: 'Veracruz',
        zip_code: '91000',
        phone: '2281234567',
        notes: 'Dejar en recepción',
        is_default: true,
    };

    it('should validate a correct address', () => {
        const result = addressSchema.safeParse(validAddress);
        expect(result.success).toBe(true);
    });

    it('should fail if zip_code is not 5 digits', () => {
        const invalidData = { ...validAddress, zip_code: '9100' };
        const result = addressSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('El código postal debe tener exactamente 5 dígitos');
        }
    });

    it('should fail if required fields are missing', () => {
        const invalidData = { ...validAddress, street: '' };
        const result = addressSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('La calle es requerida');
        }
    });

    it('should allow empty phone and notes', () => {
        const validData = { ...validAddress, phone: '', notes: '' };
        const result = addressSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });
});
