import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'
import { handleMercadoPagoWebhookRequest, processMercadoPagoWebhook } from './webhook-contract.ts'

serve((req) => {
    const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!MERCADOPAGO_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        return new Response(
            JSON.stringify({ error: 'Configuracion de servidor incompleta' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

    return handleMercadoPagoWebhookRequest(req, {
    processWebhook: async (notification) => {
        const paymentClient = new mercadopago.Payment(client);
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        return processMercadoPagoWebhook(notification, {
            getPayment: (paymentId) => paymentClient.get({ id: paymentId }),
            getOrderAttribution: async (orderId) => {
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, cesarin_session_id, conversion_source, total, payment_status')
                    .eq('id', orderId)
                    .maybeSingle()
                if (error) {
                    throw error
                }
                return data
            },
            updateOrderPayment: async (orderId, update) => {
                const { error } = await supabase
                    .from('orders')
                    .update(update)
                    .eq('id', orderId)
                if (error) {
                    throw error
                }
            },
            insertConversionEvent: async (event) => {
                const { error } = await supabase
                    .from('conversation_conversion_events')
                    .insert(event)
                if (error) {
                    throw error
                }
            },
            getOrderItems: async (orderId) => {
                const { data, error } = await supabase
                    .from('order_items')
                    .select('product_id, variant_id, quantity')
                    .eq('order_id', orderId)
                if (error) throw error
                return (data ?? []).map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id ?? null,
                    quantity: item.quantity,
                }))
            },
            decrementStock: async (items) => {
                const { error } = await supabase.rpc('decrement_stock_for_order', {
                    p_items: JSON.stringify(items),
                })
                if (error) throw error
            },
            now: () => new Date().toISOString(),
        });
    },
    });
});
