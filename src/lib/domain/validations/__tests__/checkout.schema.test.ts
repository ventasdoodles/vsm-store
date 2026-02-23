import { describe, it, expect } from 'vitest';
import { checkoutSchema } from '../checkout.schema';

describe('Checkout Schema Validation', () => {
    it('should validate a correct pickup order', () => {
        const validData = {
            customerName: 'Juan Perez',
            customerPhone: '1234567890',
            deliveryType: 'pickup' as const,
            paymentMethod: 'transfer' as const,
        };
        const result = checkoutSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should validate a correct delivery order', () => {
        const validData = {
            customerName: 'Juan Perez',
            customerPhone: '1234567890',
            deliveryType: 'delivery' as const,
            address: 'Calle Falsa 123, Colonia Centro',
            paymentMethod: 'mercadopago' as const,
        };
        const result = checkoutSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('should fail if delivery is selected but no address is provided', () => {
        const invalidData = {
            customerName: 'Juan Perez',
            customerPhone: '1234567890',
            deliveryType: 'delivery' as const,
            paymentMethod: 'transfer' as const,
        };
        const result = checkoutSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.path).toContain('address');
        }
    });

    it('should fail if phone is not 10 digits', () => {
        const invalidData = {
            customerName: 'Juan Perez',
            customerPhone: '12345',
            deliveryType: 'pickup' as const,
            paymentMethod: 'transfer' as const,
        };
        const result = checkoutSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.path).toContain('customerPhone');
        }
    });
});
