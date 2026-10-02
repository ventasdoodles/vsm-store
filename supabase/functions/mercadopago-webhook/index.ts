import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'
import {
    authenticateMercadoPagoRequest,
    WebhookRequestError,
} from './signed-request.ts'
import { processMercadoPagoWebhook, isFulfillOrderPaymentResult } from './webhook-contract.ts'

serve(async (req) => {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const MERCADOPAGO_WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MERCADOPAGO_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return new Response(JSON.stringify({ error: 'Configuracion de servidor incompleta' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════════════
    // STEP 1: Authenticate the webhook request via HMAC signature
    // ═══════════════════════════════════════════════════════════════════
    // This MUST happen before ANY MP API call or database operation.
    // Rejects unsigned, expired, or tampered notifications.
    if (!MERCADOPAGO_WEBHOOK_SECRET) {
        console.error('MERCADOPAGO_WEBHOOK_SECRET is not configured');
        return new Response('Unavailable', { status: 503 });
    }

    let notification;
    try {
        notification = await authenticateMercadoPagoRequest(req, MERCADOPAGO_WEBHOOK_SECRET);
    } catch (error) {
        if (error instanceof WebhookRequestError) {
            return new Response(error.message, {
                status: error.status,
                headers: error.status === 405
                    ? { Allow: 'POST' }
                    : undefined,
            });
        }
        console.error('Webhook ingress failure', error);
        return new Response('Unavailable', { status: 503 });
    }

    // Non-payment events (merchant_order, etc.) → ack silently
    if (notification === null) return new Response('OK', { status: 200 });

    // ═══════════════════════════════════════════════════════════════════
    // STEP 2: Process the authenticated payment notification
    // ═══════════════════════════════════════════════════════════════════
    try {
        const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });
        const paymentClient = new mercadopago.Payment(client);
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

        const result = await processMercadoPagoWebhook(
            { type: 'payment', paymentId: notification.paymentId },
            {
                getPayment: (paymentId) => paymentClient.get({ id: paymentId }),
                getOrderAttribution: async (orderId) => {
                    const { data, error } = await supabase.from('orders')
                        .select('id, cesarin_session_id, conversion_source, total, payment_status')
                        .eq('id', orderId).maybeSingle()
                    if (error) throw error
                    return data
                },
                updateOrderPayment: async (orderId, update) => {
                    const { error } = await supabase.from('orders').update(update).eq('id', orderId)
                    if (error) throw error
                },
                updateOrderPaymentGuarded: async (orderId, update) => {
                    let query = supabase.from('orders').update(update).eq('id', orderId)
                    if (update.payment_status === 'refunded') {
                        query = query.not('payment_status', 'eq', 'refunded')
                    } else {
                        query = query.not('payment_status', 'in', '("paid","refunded")')
                    }
                    const { error } = await query
                    if (error) throw error
                },
                fulfillOrderPayment: async (orderId, paymentId, paymentStatus, orderStatus, mpPaymentData) => {
                    const { data, error } = await supabase.rpc('fulfill_order_payment', {
                        p_order_id: orderId,
                        p_payment_id: paymentId,
                        p_payment_status: paymentStatus,
                        p_order_status: orderStatus,
                        p_mp_payment_data: mpPaymentData,
                    })
                    if (error) throw error
                    const rpcResult: unknown = data
                    if (!isFulfillOrderPaymentResult(rpcResult)) {
                        throw new Error(`Respuesta inesperada de fulfill_order_payment para order ${orderId}`)
                    }
                    return rpcResult
                },
                insertConversionEvent: async (event) => {
                    const { error } = await supabase.from('conversation_conversion_events').insert(event)
                    if (error) throw error
                },
                getOrderItems: async (orderId) => {
                    const { data, error } = await supabase.from('order_items')
                        .select('product_id, variant_id, quantity').eq('order_id', orderId)
                    if (error) throw error
                    return (data ?? []).map(item => ({
                        product_id: item.product_id, variant_id: item.variant_id ?? null, quantity: item.quantity,
                    }))
                },
                decrementStock: async (items) => {
                    const { error } = await supabase.rpc('decrement_stock_for_order', { p_items: JSON.stringify(items) })
                    if (error) throw error
                },
                now: () => new Date().toISOString(),
            },
        );

        if (result.reason === 'missing_external_reference') {
            console.error('No external_reference found in payment');
            return new Response('OK', { status: 200 });
        }

        console.log(`Webhook processed for Order ${result.orderId}: Status ${result.paymentStatus}`);
        return new Response('OK', { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Webhook processing failed', { status: 500 });
    }
});
