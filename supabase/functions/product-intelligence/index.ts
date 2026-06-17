/**
 * product-intelligence — Supabase Edge Function
 *
 * AI-powered product description, copy generation, and structured enrichment.
 * Creates compelling, SEO-friendly product descriptions and marketing copy in Spanish.
 *
 * @model gemini-2.5-flash-lite (via v1 REST API)
 * @requires GEMINI_API_KEY
 *
 * MIGRATION LOG:
 * - 2026-03-15: v1beta → v1 endpoint (v1beta deprecated)
 * - 2026-03-15: gemini-1.5-flash → gemini-2.0-flash (1.5 retired)
 * - 2026-03-15: Removed unsupported responseMimeType from generationConfig
 * - 2026-03-20: Applied v1 endpoint + removed responseMimeType (payload drift fix)
 * - 2026-03-20: Added enrich_product action with category-aware spec generation
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
if (!GEMINI_API_KEY) {
    console.error('[product-intelligence] FATAL: GEMINI_API_KEY is not set in environment secrets.')
}
const MODEL = 'gemini-2.5-flash-lite'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// ─── Product Ontology (mirrors src/constants/specs.constants.ts) ─────────────
// Inlined here because edge functions cannot import from src/. Keep in sync.
const SUGGESTED_SPECS: Record<string, string[]> = {
    // Vape
    'disposables':      ['Puffs', 'Capacidad', 'Batería', 'Nicotina', 'Puerto de Carga'],
    'vape-kits':        ['Watts', 'Batería', 'Capacidad', 'Resistencia Incluida', 'Puerto de Carga'],
    'pods':             ['Resistencia', 'Capacidad', 'Compatibilidad'],
    'liquidos':         ['Nicotina', 'VG/PG', 'Volumen'],
    'accesorios-vape':  ['Compatibilidad', 'Material'],
    // 420
    'flores':           ['THC%', 'CBD%', 'Genética', 'Efecto', 'Terpenos'],
    'extractos':        ['Concentración', 'Método de Extracción', 'Tipo', 'THC%'],
    'comestibles':      ['Dosis por Porción', 'Total Cannabinoides', 'Sabor'],
    'vapes-420':        ['Capacidad', 'Voltaje Variable', 'Batería', 'THC%'],
    'parafernalia':     ['Material', 'Tamaño', 'Compatibilidad'],
}

const SECTION_DEFAULT_SPECS: Record<string, string[]> = {
    'vape': ['Marca', 'Modelo', 'Color'],
    '420':  ['Marca', 'Tipo', 'Efecto'],
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    console.log(`[product-intelligence] Request received: ${req.method}`)

    try {
        const body = await req.json()
        const { name, description: currentDesc, action } = body
        console.log(`[product-intelligence] Action: ${action}, Name: ${name}`)

        if (action === 'generate_copy') {
            if (!name) throw new Error('Product name is required')

            const prompt = `
                Eres un experto en Copywriting y Marketing para "VSM Store", una tienda premium de vapes y accesorios.
                Tu tarea es generar contenido persuasivo para un producto.

                PRODUCTO: ${name}
                DESCRIPCIÓN ACTUAL (si existe): ${currentDesc || 'Ninguna'}

                INSTRUCCIONES:
                - Genera una "description" larga y detallada (mínimo 3 párrafos), profesional y enfocada al estilo de vida.
                - Genera una "short_description" de máximo 20 palabras.
                - Sugiere 5 "tags" relevantes.
                - Responde estrictamente en JSON.

                FORMATO JSON DE RESPUESTA:
                {
                    "description": "string",
                    "short_description": "string",
                    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
                }
            `

            console.log('[product-intelligence] Consulting Gemini (generate_copy)...')
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2 }
                })
            })

            if (!response.ok) {
                const errorDetail = await response.text();
                throw new Error(`Gemini API Error: ${response.status} ${errorDetail}`);
            }

            const result = await response.json()
            const aiResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const cleanText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim()
            const aiData = JSON.parse(cleanText);

            return new Response(JSON.stringify(aiData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (action === 'enrich_product') {
            if (!name) throw new Error('Product name is required for enrich_product')

            const { section, category_slug, current_specs } = body
            const currentSpecsObj: Record<string, string> = current_specs ?? {}

            // Resolve canonical spec keys for this category/section
            const categoryKeys: string[] = SUGGESTED_SPECS[category_slug] ?? []
            const sectionKeys: string[] = SECTION_DEFAULT_SPECS[section] ?? []
            const allTargetKeys = Array.from(new Set([...categoryKeys, ...sectionKeys]))

            // Skip keys that are already filled in by the operator
            const missingKeys = allTargetKeys.filter(k => !currentSpecsObj[k] || currentSpecsObj[k].trim() === '')
            const targetSpecsStr = missingKeys.length > 0 ? missingKeys.join(', ') : 'Marca, Modelo'

            const alreadyFilledStr = Object.keys(currentSpecsObj).length > 0
                ? Object.entries(currentSpecsObj).map(([k, v]) => `${k}: ${v}`).join(', ')
                : 'Ninguna'

            const sectionLabel = section === '420'
                ? 'Cannabis / CBD / THC (mercado 420)'
                : 'Vapeo — nicotina, hardware y accesorios'

            const prompt = `
Eres un especialista en productos de vapeo y cannabis para "VSM Store" (Colombia).

PRODUCTO:
- Nombre: ${name}
- Sección: ${sectionLabel}
- Categoría: ${category_slug || 'general'}
- Descripción actual: ${currentDesc || 'Ninguna'}
- Specs ya ingresadas por el operador: ${alreadyFilledStr}

TAREA:
Genera un paquete de enriquecimiento completo para este producto. Debes:

1. "description": texto de marketing largo (mínimo 3 párrafos), profesional, en español, enfocado en estilo de vida y beneficios concretos del producto.

2. "short_description": máximo 20 palabras. Resumen para tarjeta de producto en tienda.

3. "ai_sales_note": 1-2 oraciones sobre el ángulo de venta y el buyer persona ideal.

4. "specs": objeto con ÚNICAMENTE las siguientes llaves: ${targetSpecsStr}
   - Propón solo las que puedas inferir razonablemente del nombre del producto.
   - REGLA CRÍTICA: OMITE la llave "Compatibilidad" si el nombre del producto no hace explícita la compatibilidad con otro hardware. Si la omites, agrégala a "warnings".
   - No inventes llaves que no están en la lista anterior.
   - Si no puedes inferir un valor con razonable certeza, omite esa llave del objeto.

5. "tags": 5-8 etiquetas semánticas en español específicas del dominio (ej: "dtl", "mtl", "nic-sal", "recargable", "indica", "sativa", "full-spectrum"). No usar nombres de marca como tags.

6. "confidence": "high" si el nombre del producto permite inferir la mayoría de specs con seguridad, "medium" si hay inferencias razonables pero no certeras, "low" si el nombre es muy genérico o ambiguo.

7. "warnings": array de advertencias para el operador sobre campos inciertos o que requieren verificación manual. Incluir siempre si "Compatibilidad" fue omitido de specs.

Responde ÚNICAMENTE con JSON válido. Sin texto adicional. Sin bloques markdown.

FORMATO:
{
  "description": "...",
  "short_description": "...",
  "ai_sales_note": "...",
  "specs": { "Llave": "Valor" },
  "tags": ["tag1", "tag2"],
  "confidence": "high|medium|low",
  "warnings": ["advertencia1"]
}
            `

            console.log(`[product-intelligence] Consulting Gemini (enrich_product) for: ${name} [${category_slug}/${section}]`)
            const enrichResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3 }
                })
            })

            if (!enrichResponse.ok) {
                const errorDetail = await enrichResponse.text()
                throw new Error(`Gemini API Error: ${enrichResponse.status} ${errorDetail}`)
            }

            const enrichResult = await enrichResponse.json()
            const rawText = enrichResult.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            const cleanEnrichText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
            const enrichData = JSON.parse(cleanEnrichText)

            // Safety: strip any spec keys not in the approved target list to prevent ontology pollution
            const approvedSpecKeys = new Set(allTargetKeys)
            if (enrichData.specs && typeof enrichData.specs === 'object') {
                const safeSpecs: Record<string, string> = {}
                for (const [k, v] of Object.entries(enrichData.specs)) {
                    if (approvedSpecKeys.has(k) && typeof v === 'string' && v.trim() !== '') {
                        safeSpecs[k] = v as string
                    }
                }
                enrichData.specs = safeSpecs
            }

            // Ensure required fields have safe defaults if Gemini omits them
            if (!Array.isArray(enrichData.warnings)) enrichData.warnings = []
            if (!Array.isArray(enrichData.tags)) enrichData.tags = []
            if (!enrichData.confidence) enrichData.confidence = 'medium'
            if (!enrichData.specs || typeof enrichData.specs !== 'object') enrichData.specs = {}

            console.log(`[product-intelligence] enrich_product OK — confidence: ${enrichData.confidence}, specs keys: ${Object.keys(enrichData.specs).join(', ')}, warnings: ${enrichData.warnings.length}`)

            return new Response(JSON.stringify(enrichData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error: unknown) {
        const errObj = error instanceof Error ? error : new Error(String(error));
        const errorMsg = `[Product-Intelligence] Error: ${errObj.message} | Gemini Status: ${GEMINI_API_KEY ? 'Set' : 'Missing'}`;
        console.error(errorMsg);
        return new Response(JSON.stringify({ 
            error: errObj.message,
            context: 'product-intelligence',
            gemini_key_present: !!GEMINI_API_KEY,
            full_error: errObj.stack
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
