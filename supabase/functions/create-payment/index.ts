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

async function getExistingPreferenceInitPoint(preferenceId: string): Promise<string | null> {
    const response = await fetch(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
        headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json() as { init_point?: string | null }
    return typeof data.init_point === 'string' && data.init_point.length > 0
        ? data.init_point
        : null
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
        const authHeader = req.headers.get('Authorization') || ''
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

        if (!bearerToken) {
            return new Response(
                JSON.stringify({ error: 'Sesion requerida' }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        const { order_id } = await req.json() as CreatePaymentRequest

        // 1. Obtener orden de Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken)
        const user = authData?.user

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Sesion requerida' }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('id, order_number, customer_id, customer_name, customer_phone, items, status, payment_method, payment_status, mp_preference_id')
            .eq('id', order_id)
            .eq('customer_id', user.id)
            .single()

        if (error) {
            console.error('Supabase raw error:', error)
            throw new Error(`DB Error: ${error.message}`)
        }

        if (!order) {
            throw new Error(`Order not found: ${order_id}`)
        }

        if (order.payment_method !== 'mercadopago') {
            return new Response(
                JSON.stringify({ error: 'Este pedido no usa Mercado Pago' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        if (order.status === 'cancelled' || order.payment_status !== 'pending') {
            return new Response(
                JSON.stringify({ error: 'Este pedido ya no puede iniciar pago' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        if (!Array.isArray(order.items) || order.items.length === 0) {
            return new Response(
                JSON.stringify({ error: 'Pedido sin items pagables' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                }
            )
        }

        if (typeof order.mp_preference_id === 'string' && order.mp_preference_id.length > 0) {
            const existingInitPoint = await getExistingPreferenceInitPoint(order.mp_preference_id)

            if (existingInitPoint) {
                return new Response(
                    JSON.stringify({
                        init_point: existingInitPoint,
                        preference_id: order.mp_preference_id
                    }),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        }
                    }
                )
            }
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
                    name: order.customer_name || 'Cliente',
                    phone: {
                        area_code: '',
                        number: order.customer_phone || ''
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
