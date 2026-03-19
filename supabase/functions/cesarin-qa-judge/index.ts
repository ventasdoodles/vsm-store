/**
 * cesarin-qa-judge — Supabase Edge Function
 * 
 * Separate boundary for semantic judging of Cesarin OS responses.
 * 
 * @model gemini-2.0-flash (v1 REST API)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const MODEL = 'gemini-2.5-pro'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, scenario, result } = await req.json()

        if (action === 'evaluate_scenario') {
            const prompt = `
                Eres un Experto Auditor de Calidad para "VSM Store".
                Debes evaluar semánticamente si la respuesta de la IA fue correcta.

                ESCENARIO:
                - Tipo: ${scenario.scenario_type}
                - Mensaje Usuario: "${scenario.user_message}"
                - Pistas de Validación: ${scenario.validation_hints?.join(', ') || 'N/A'}

                RESPUESTA OBTENIDA:
                - Texto: "${result.response}"
                - Intento Detectado: ${result.detected_intent}
                - Herramientas Usadas: ${result.tools_called?.join(', ') || 'Ninguna'}
                - Traza de Memoria: ${JSON.stringify(result.memory_trace || {})}

                INSTRUCCIONES DE EVALUACIÓN:
                1. RELEVANCIA DE MEMORIA: Si el mensaje es vago y hay memoria inyectada, ¿la respuesta se sesgó correctamente hacia los intereses históricos?
                2. DOMINIO DE INTENCIÓN: Si el mensaje es explícito, ¿la IA ignoró el sesgo de memoria para priorizar el deseo actual del usuario?
                3. VALORACIÓN: Penaliza si la IA es redundante con la memoria o si el sesgo impide cumplir la intención actual.

                RESPONDE ESTRICTAMENTE EN JSON:
                {
                    "tone_score": 1-10,
                    "grounding_score": 1-10,
                    "hallucination_detected": boolean,
                    "comment": "Breve explicación detallando el comportamiento de la memoria vs intención"
                }
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.1 }
                })
            });

            if (!response.ok) throw new Error('Gemini API Error');
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            
            return new Response(cleanJson, { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            });
        }

        return new Response(JSON.stringify({ error: 'Unsupported action' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
    }
})
