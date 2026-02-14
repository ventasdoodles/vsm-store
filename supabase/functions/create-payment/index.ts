import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import mercadopago from 'npm:mercadopago@2.0.8'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://vsm-store.pages.dev'

const client = new mercadopago.MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN });

interface CreatePaymentRequest {
    order_id: string
}

serve(async (req) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        })
    }

    try {
        const { order_id } = await req.json() as CreatePaymentRequest

        // 1. Obtener orden de Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, customer:profiles(*)') // Asumiendo relación con profiles
            .eq('id', order_id)
            .single()

        if (error || !order) {
            throw new Error(`Order not found: ${order_id}`)
        }

        // 2. Construir items para Mercado Pago
        // Asegurar que prices sean números y titles strings
        const items = order.items.map((item: any) => ({
            title: item.name || 'Producto VSM',
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            currency_id: 'MXN'
        }))

        // 3. Crear preferencia en Mercado Pago
        const preference = new mercadopago.Preference(client);
        const result = await preference.create({
            body: {
                items,
                back_urls: {
                    success: `${FRONTEND_URL}/payment/success?order_id=${order_id}`,
                    failure: `${FRONTEND_URL}/payment/failure?order_id=${order_id}`,
                    pending: `${FRONTEND_URL}/payment/pending?order_id=${order_id}`
                },
                auto_return: 'approved',
                external_reference: order_id,
                notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
                statement_descriptor: 'VSM STORE',
                metadata: {
                    order_number: order.order_number
                },
                payer: {
                    name: order.customerName || (order.customer ? order.customer.full_name : 'Cliente'),
                    phone: {
                        area_code: '',
                        number: order.customerPhone || (order.customer ? order.customer.phone : '')
                    }
                }
            }
        })

        // 4. Guardar preference_id en orden
        await supabase
            .from('orders')
            .update({
                mp_preference_id: result.id,
                payment_method: 'mercadopago'
            })
            .eq('id', order_id)

        // 5. Retornar URL de pago
        return new Response(
            JSON.stringify({
                init_point: result.init_point,
                preference_id: result.id
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Error creating payment:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )
    }
})
