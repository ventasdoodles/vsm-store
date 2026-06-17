import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'
import { handleMercadoPagoWebhookRequest, processMercadoPagoWebhook } from './webhook-contract.ts'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

serve((req) => handleMercadoPagoWebhookRequest(req, {
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
            now: () => new Date().toISOString(),
        })
    },
}))
