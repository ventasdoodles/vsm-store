/**
 * dashboard-intelligence â€” Supabase Edge Function
 * 
 * AI-powered dashboard insights for the admin panel. Analyzes sales data,
 * order trends, and customer metrics to generate actionable business intelligence.
 * 
 * @model gemini-2.0-flash (via v1 REST API)
 * @requires GEMINI_API_KEY
 * 
 * MIGRATION LOG:
 * - 2026-03-15: v1beta â†’ v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-2.5-flash â†’ gemini-2.0-flash (1.5 retired)
 * - 2026-03-15: Removed unsupported responseMimeType from generationConfig
 */
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
        const body = await req.json()
        const { stats, action } = body
        console.log(`[dashboard-intelligence] Action: ${action}`)

        if (action !== 'get_pulse' || !stats) {
            console.error('[dashboard-intelligence] Invalid Payload:', body)
            throw new Error('Invalid request payload')
        }

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set')
        }

        // Generar prompt estratÃ©gico enfocado en retail de vapeo/420
        const prompt = `
            Eres un OrÃ¡culo IA de Inteligencia de Negocios (C-Level Executive) para "VSM Store", una tienda premium de vapeo y estilo de vida 420.
            Tu objetivo es analizar los datos operativos actuales y entregar un Veredicto Ejecutivo RelÃ¡mpago (Pulse Tracker) sobre la salud del negocio.

            DASHBOARD DATA (Hoy y Ãšltimos 7 DÃ­as):
            - Ventas de Hoy: $${stats.todaySales || 0}
            - Pedidos Pendientes: ${stats.pendingOrders || 0}
            - Productos con Bajo Stock (<5 uds): ${stats.lowStockProducts || 0}
            - Clientes Activos: ${stats.totalCustomers || 0}
            - CatÃ¡logo: ${stats.totalProducts || 0} productos activos.
            - Total Pedidos HistÃ³ricos: ${stats.totalOrders || 0}
            - Productos Top Vendidos (7D): ${(stats.topProducts || []).map((p: { name: string, revenue: number }) => `${p.name} ($${p.revenue})`).join(', ')}

            INSTRUCCIONES DE SALIDA:
            Debes retornar estrictamente un JSON vÃ¡lido con la siguiente estructura exacta:
            {
                "narrative": "Tu narrativa ejecutiva aquÃ­ (mÃ¡ximo 40 palabras, tono urgente pero sofisticado, estilo cyberpunk corporativo).",
                "anomalies": ["AnomalÃ­a importante 1 (max 8 palabras)", "AnomalÃ­a o sugerencia 2 (max 10 palabras)"],
                "health_score": un_numero_del_0_al_100_evaluando_la_operacion
            }

            EJEMPLO:
            {
                "narrative": "El flujo de ingresos es Ã³ptimo, impulsado por extractos premium. Sin embargo, presenciamos un cuello de botella grave en cumplimiento con 15 Ã³rdenes varadas.",
                "anomalies": ["Alto volumen de despachos pendientes", "3 productos crÃ­ticos a punto de agotarse"],
                "health_score": 75
            }

            CALCULO HEALTH SCORE (GuÃ­a):
            - Si hay muchos pedidos pendientes (>5): Resta puntos (Riesgo operativo).
            - Si ventas totales hoy = 0: Escenario de riesgo alto.
            - Si bajo stock es alto (>3): Riesgo logÃ­stico.
            
            RESPONDER ÃšNICA Y EXCLUSIVAMENTE CON EL TEXTO JSON COMPATIBLE. NO ENVUELVAS EN BLOQUES DE CÃ“DIGO NI USES MARKDOWN.
        `

        // Llamar a Gemini 3.1 Flash Lite
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: 250,
                    temperature: 0.7
                }
            })
        })

        if (!response.ok) {
            const errorDetail = await response.text();
            throw new Error(`Gemini API Error: ${response.status} ${errorDetail}`);
        }

        const result = await response.json()
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

        if (!rawText) {
            return new Response(JSON.stringify({ 
                narrative: "OperaciÃ³n estable. Monitoreo en curso.",
                anomalies: [],
                health_score: 100
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // Cleanup potential markdown blocks and parse
        const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(jsonText);

        return new Response(JSON.stringify(aiData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: unknown) {
        const errObj = error instanceof Error ? error : new Error(String(error));
        const errorMsg = `[Dashboard-Intelligence] Error: ${errObj.message} | Gemini Status: ${GEMINI_API_KEY ? 'Set' : 'Missing'}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            error: errObj.message,
            context: 'dashboard-intelligence',
            gemini_key_present: !!GEMINI_API_KEY,
            full_error: errObj.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
