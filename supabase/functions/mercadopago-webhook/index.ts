import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'
import { extractMercadoPagoNotification, processMercadoPagoWebhook } from './webhook-contract.ts'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

serve(async (req) => {
    try {
        const url = new URL(req.url)

        let body = null;
        try {
            body = await req.json();
        } catch (e) {
            // Body might be empty if query params are used
        }

        const notification = extractMercadoPagoNotification(url, body);

        if (notification.type !== 'payment' || !notification.paymentId) {
            // Respond OK to other events to avoid retries
            return new Response('OK', { status: 200 })
        }

        const paymentClient = new mercadopago.Payment(client);
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        const result = await processMercadoPagoWebhook(notification, {
            getPayment: (paymentId) => paymentClient.get({ id: paymentId }),
            getOrderAttribution: async (orderId) => {
                const { data } = await supabase
                    .from('orders')
                    .select('id, cesarin_session_id, conversion_source, total, payment_status')
                    .eq('id', orderId)
                    .maybeSingle()
                return data
            },
            updateOrderPayment: async (orderId, update) => {
                await supabase
                    .from('orders')
                    .update(update)
                    .eq('id', orderId)
            },
            insertConversionEvent: async (event) => {
                await supabase
                    .from('conversation_conversion_events')
                    .insert(event)
            },
            now: () => new Date().toISOString(),
        })

        if (result.reason === 'missing_external_reference') {
            console.error('No external_reference found in payment');
            return new Response('OK', { status: 200 })
        }

        console.log(`Webhook processed for Order ${result.orderId}: Status ${result.paymentStatus}`)

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response('OK', { status: 200 })
    }
})
