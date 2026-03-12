import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { stats, action } = await req.json()

        if (action !== 'get_pulse' || !stats) {
            throw new Error('Invalid request payload')
        }

        // Generar prompt estratégico enfocado en retail de vapeo/420
        const prompt = `
            Eres un Oráculo IA de Inteligencia de Negocios (C-Level Executive) para "VSM Store", una tienda premium de vapeo y estilo de vida 420.
            Tu objetivo es analizar los datos operativos actuales y entregar un Veredicto Ejecutivo Relámpago (Pulse Tracker) sobre la salud del negocio.

            DASHBOARD DATA (Hoy y Últimos 7 Días):
            - Ventas de Hoy: $${stats.salesToday}
            - Pedidos Pendientes: ${stats.pendingOrders}
            - Productos con Bajo Stock (<5 uds): ${stats.lowStockProducts}
            - Clientes Activos: ${stats.totalCustomers}
            - Catálogo: ${stats.totalProducts} productos activos.
            - Total Pedidos Históricos: ${stats.totalOrders}
            - Productos Top Vendidos (7D): ${stats.topProducts.map((p: { name: string, revenue: number }) => `${p.name} ($${p.revenue})`).join(', ')}

            INSTRUCCIONES DE SALIDA:
            Debes retornar estrictamente un JSON válido con la siguiente estructura exacta:
            {
                "narrative": "Tu narrativa ejecutiva aquí (máximo 40 palabras, tono urgente pero sofisticado, estilo cyberpunk corporativo).",
                "anomalies": ["Anomalía importante 1 (max 8 palabras)", "Anomalía o sugerencia 2 (max 10 palabras)"],
                "health_score": un_numero_del_0_al_100_evaluando_la_operacion
            }

            EJEMPLO:
            {
                "narrative": "El flujo de ingresos es óptimo, impulsado por extractos premium. Sin embargo, presenciamos un cuello de botella grave en cumplimiento con 15 órdenes varadas.",
                "anomalies": ["Alto volumen de despachos pendientes", "3 productos críticos a punto de agotarse"],
                "health_score": 75
            }

            CALCULO HEALTH SCORE (Guía):
            - Si hay muchos pedidos pendientes (>5): Resta puntos (Riesgo operativo).
            - Si ventas totales hoy = 0: Escenario de riesgo alto.
            - Si bajo stock es alto (>3): Riesgo logístico.
            
            RESPONDER ÚNICA Y EXCLUSIVAMENTE CON EL TEXTO JSON COMPATIBLE. NO ENVUELVAS EN BLOQUES DE CÓDIGO NI USES MARKDOWN.
        `

        // Llamar a Gemini 1.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 250,
                    temperature: 0.7,
                    responseMimeType: "application/json" // Fuerza output de JSON puro
                }
            })
        })

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`)
        }

        const result = await response.json()
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!rawText) {
            throw new Error('Gemini returned an empty response')
        }

        const aiData = JSON.parse(rawText)

        return new Response(JSON.stringify(aiData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error('[Dashboard-Intelligence Edge Function Error]', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
