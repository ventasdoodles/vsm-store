/**
 * // ─── MERCADO PAGO SERVICE ───
 * // Proposito: Integracion con la pasarela de pagos Mercado Pago.
 * // Arquitectura: Payments Layer (§1.1) - Edge Function Invoker.
 * // Regla / Notas: Generacion de links de pago seguros.
 */
import { supabase } from '@/lib/supabase';

interface CreatePaymentResponse {
    init_point: string;
    preference_id: string;
}

export const mercadopagoService = {
    /**
     * Crea una preferencia de pago en Mercado Pago y retorna la URL de checkout.
     * @param orderId ID de la orden en Supabase.
     */
    async createPayment(orderId: string): Promise<CreatePaymentResponse> {
        const { data, error } = await supabase.functions.invoke<CreatePaymentResponse>('create-payment', {
            body: { order_id: orderId }
        });

        if (error || !data) {
            console.error('[Payments] Error creating payment:', error);
            throw new Error('No se pudo generar el link de pago. Intenta nuevamente.');
        }

        return data;
    }
};
