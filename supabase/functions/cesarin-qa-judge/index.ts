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
        const { action, scenario, result, analytics_id, turn_data } = await req.json()
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        )

        if (action === 'evaluate_turn') {
            // ═══ HARDENING 3: EVALUATE_TURN ACTION + AI_EVALUATIONS PERSISTENCE ═══
            // Evaluate a single conversation turn (question + response) for quality signals.
            // Triggered on frustration or zero-results scenarios.
            // Persists evaluation output to ai_evaluations table (server-trusted path).

            if (!analytics_id || !turn_data) {
                return new Response(JSON.stringify({ error: 'analytics_id and turn_data required' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            const { query, response_text, intent, frustration_detected, zero_results, product_count } = turn_data;

            const prompt = `
Eres un Auditor de Calidad especializado en evaluaciones de conversación para "VSM Store" (tienda de vapes y accesorios).
Evalúa esta interacción cliente-IA para detectar problemas de confianza, relevancia y hallucinations.

TURNO DE CONVERSACIÓN:
- Pregunta del cliente: "${query}"
- Respuesta de Cesarin: "${response_text}"
- Intención detectada: ${intent}
- Frustracion del cliente: ${frustration_detected}
- Búsqueda sin resultados: ${zero_results}
- Productos ofrecidos: ${product_count}

INSTRUCCIONES:
1. RELEVANCIA: ¿La respuesta abordan realmente lo que pidió el cliente?
2. HALLUCINATION: ¿Hay inventos, datos falsos o suposiciones injustificadas?
3. TONO: ¿Mantiene la marca (carnal, desenfadado) sin ser inapropiado?
4. ESCALATION: Si hay frustracion o cero resultados, ¿fue comunicado claramente? ¿se ofrció soporte humano?

RESPONDE ESTRICTAMENTE EN JSON:
{
    "relevance_score": 1-10,
    "hallucination_detected": boolean,
    "tone_score": 1-10,
    "escalation_offered": boolean,
    "issues": ["lista de problemas identificados"],
    "recommendation": "breve recomendación accionable"
}
            `;

            try {
                const geminiRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { temperature: 0.1 }
                        })
                    }
                );

                if (!geminiRes.ok) {
                    throw new Error(`Gemini API error: ${geminiRes.status}`);
                }

                const geminiData = await geminiRes.json();
                const rawEvalText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
                const cleanJson = rawEvalText.replace(/```json/g, '').replace(/```/g, '').trim();
                const evaluation = JSON.parse(cleanJson);

                // Persist evaluation to ai_evaluations table
                const { error: insertErr } = await supabase
                    .from('ai_evaluations')
                    .insert({
                        analytics_id: analytics_id,
                        evaluation_type: 'turn_quality',
                        query: query,
                        response_text: response_text,
                        detected_intent: intent,
                        frustration_detected: frustration_detected,
                        zero_results: zero_results,
                        product_count: product_count,
                        relevance_score: evaluation.relevance_score,
                        hallucination_detected: evaluation.hallucination_detected,
                        tone_score: evaluation.tone_score,
                        escalation_offered: evaluation.escalation_offered,
                        issues: evaluation.issues,
                        recommendation: evaluation.recommendation,
                        evaluated_at: new Date().toISOString()
                    });

                if (insertErr) {
                    console.error(`[AI_EVALUATIONS] Insert failed: ${insertErr.message}`);
                    // Don't throw — evaluation happened, just persistence failed (log only)
                } else {
                    console.warn('[AI_EVALUATIONS] Turn evaluation persisted');
                }

                return new Response(JSON.stringify({
                    status: 'success',
                    evaluation_id: analytics_id,
                    evaluation: evaluation
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });

            } catch (e: any) {
                console.error(`[EVALUATE_TURN] Gemini or persistence error: ${e.message}`);
                // Best-effort: evaluation failed, return error but don't fail the request
                return new Response(JSON.stringify({
                    status: 'error',
                    analytics_id: analytics_id,
                    error: e.message
                }), {
                    status: 200, // Return 200 to signal non-critical error (caller is non-blocking anyway)
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

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
