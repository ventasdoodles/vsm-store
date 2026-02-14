import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

serve(async (req) => {
    try {
        const url = new URL(req.url)
        const topic = url.searchParams.get('topic') || url.searchParams.get('type')
        const id = url.searchParams.get('id') || url.searchParams.get('data.id')

        // Handling different webhook formats (query params vs body)
        let bodyId = null;
        let bodyType = null;
        try {
            const body = await req.json();
            if (body.type === 'payment') {
                bodyId = body.data.id;
                bodyType = body.type;
            }
        } catch (e) {
            // Body might be empty if query params are used
        }

        const paymentId = id || bodyId;
        const type = topic || bodyType;

        if (type !== 'payment' || !paymentId) {
            // Respond OK to other events to avoid retries
            return new Response('OK', { status: 200 })
        }

        // 1. Consultar detalle del pago
        const paymentClient = new mercadopago.Payment(client);
        const payment = await paymentClient.get({ id: paymentId });

        // 2. Extraer datos relevantes
        const orderId = payment.external_reference;
        const status = payment.status;

        if (!orderId) {
            console.error('No external_reference found in payment');
            return new Response('OK', { status: 200 });
        }

        // 3. Actualizar orden en Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        let paymentStatus = 'pending';
        let orderStatus = 'pending';

        if (status === 'approved') {
            paymentStatus = 'paid'
            orderStatus = 'processing'
        } else if (status === 'rejected' || status === 'cancelled') {
            paymentStatus = 'failed'
            orderStatus = 'cancelled'
        } else if (status === 'refunded') {
            paymentStatus = 'refunded'
            orderStatus = 'cancelled'
        }

        // Solo actualizar si el estado cambió o es la primera vez
        // Pero como es webhook, mejor hacer update directo.

        await supabase
            .from('orders')
            .update({
                payment_status: paymentStatus,
                status: orderStatus,
                mp_payment_id: paymentId,
                mp_payment_data: payment,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

        console.log(`Webhook processed for Order ${orderId}: Status ${status}`)

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response('OK', { status: 200 })
    }
})
