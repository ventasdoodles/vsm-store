import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import { supabase } from '@/lib/supabase';
import type { CheckoutFormData } from '@/types/cart';

export interface CheckoutActionItem {
    product_id: string;
    quantity: number;
    variant_id?: string | null;
    variant_name?: string | null;
}

export interface CheckoutActionInput {
    form: CheckoutFormData;
    items: CheckoutActionItem[];
    shippingAddressId?: string | null;
    shippingAddressText?: string | null;
    couponCode?: string | null;
}

export interface CheckoutActionResult {
    ok: boolean;
    orderId?: string;
    message?: string;
}

export async function submitCheckout(input: CheckoutActionInput): Promise<CheckoutActionResult> {
    const parsed = checkoutSchema.safeParse(input.form);
    if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];
        return { ok: false, message: firstIssue?.message || 'Datos de checkout invalidos.' };
    }

    if (!Array.isArray(input.items) || input.items.length === 0) {
        return { ok: false, message: 'El carrito esta vacio.' };
    }

    const { data, error } = await supabase.functions.invoke('checkout-submit', {
        body: input,
    });

    if (error) {
        return { ok: false, message: 'No se pudo crear el pedido. Intenta de nuevo.' };
    }

    if (!data || typeof data !== 'object') {
        return { ok: false, message: 'Respuesta invalida del servidor.' };
    }

    return data as CheckoutActionResult;
}
