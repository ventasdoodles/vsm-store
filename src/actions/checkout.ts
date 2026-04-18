import { checkoutSchema } from '@/lib/domain/validations/checkout.schema';
import { supabase } from '@/lib/supabase';
import { emitConversationConversionEvent, type ConversionSource } from '@/lib/conversion-measurement';
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
    cesarinSessionId?: string | null;
    conversionSource?: ConversionSource;
}

export interface CheckoutActionResult {
    ok: boolean;
    orderId?: string;
    message?: string;
    reusedPendingOrder?: boolean;
    paymentContinuation?: 'not_requested' | 'ready' | 'unavailable';
    paymentInitPoint?: string;
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

    const checkoutResult = data as CheckoutActionResult;

    if (!checkoutResult.ok) {
        return checkoutResult;
    }

    if (checkoutResult.orderId && !checkoutResult.reusedPendingOrder) {
        const sessionId = input.cesarinSessionId ?? null;
        emitConversationConversionEvent({
            sessionId,
            eventType: 'order_created',
            metadata: {
                source: input.conversionSource ?? (sessionId ? 'cesarin' : 'manual'),
                order_id: checkoutResult.orderId,
                payment_method: input.form.paymentMethod,
            },
        });
    }

    if (input.form.paymentMethod !== 'mercadopago') {
        return {
            ...checkoutResult,
            paymentContinuation: 'not_requested',
        };
    }

    if (!checkoutResult.orderId) {
        return { ok: false, message: 'Respuesta invalida del servidor.' };
    }

    const { data: paymentData, error: paymentError } = await supabase.functions.invoke<{
        init_point?: string;
        preference_id?: string;
    }>('create-payment', {
        body: { order_id: checkoutResult.orderId },
    });

    if (paymentError || !paymentData?.init_point) {
        return {
            ok: true,
            orderId: checkoutResult.orderId,
            reusedPendingOrder: checkoutResult.reusedPendingOrder,
            paymentContinuation: 'unavailable',
            message: checkoutResult.message || 'Tu pedido fue creado, pero no se pudo iniciar Mercado Pago. Puedes retomarlo desde el detalle del pedido.',
        };
    }

    return {
        ok: true,
        orderId: checkoutResult.orderId,
        reusedPendingOrder: checkoutResult.reusedPendingOrder,
        paymentContinuation: 'ready',
        paymentInitPoint: paymentData.init_point,
    };
}
