import { useState } from 'react';
import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import type { CheckoutFormData } from '@/types/cart';

export function useCheckoutValidation(isAuthenticated: boolean) {
    const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

    const validateStep = (
        step: number,
        formData: CheckoutFormData,
        useNewAddress: boolean,
        selectedAddressId: string
    ): boolean => {
        const dataToValidate = { ...formData };
        if (isAuthenticated && !useNewAddress && selectedAddressId && formData.deliveryType === 'delivery') {
            dataToValidate.address = 'saved-address';
        }

        const result = checkoutSchema.safeParse(dataToValidate);
        const zodErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as keyof CheckoutFormData;
                zodErrors[field] = issue.message;
            });
        }

        if (step === 1) {
            if (zodErrors.customerName || zodErrors.customerPhone) {
                setErrors(zodErrors);
                return false;
            }
        }

        if (step === 2 && formData.deliveryType === 'delivery') {
            if (isAuthenticated && !useNewAddress && !selectedAddressId) {
                setErrors({ address: 'Selecciona una dirección' });
                return false;
            }
            if (useNewAddress && !formData.address) {
                setErrors({ address: 'Ingresa tu dirección' });
                return false;
            }
            if (!isAuthenticated && !formData.address) {
                setErrors({ address: 'Ingresa tu dirección' });
                return false;
            }
        }

        setErrors({});
        return true;
    };

    return { errors, validateStep, setErrors };
}
