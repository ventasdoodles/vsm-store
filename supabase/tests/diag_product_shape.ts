/**
 * Debug probe — inspect the raw JSON shape returned by product search queries
 * to understand why product_card_count = 0 despite correct routing.
 */
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const URL   = process.env.VITE_SUPABASE_URL + '/functions/v1/customer-intelligence'
const AUTH  = process.env.VITE_SUPABASE_ANON_KEY || ''

const queries = [
    'tienes vapes de uva',
    'quiero algo barato y frutal',
]

for (const q of queries) {
    console.warn(`\n=== QUERY: "${q}" ===`)
    const r = await fetch(URL, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AUTH}` },
        body: JSON.stringify({ action: 'concierge_chat', query: q, history: [] })
    })
    const data = await r.json()
    
    // Print all top-level keys and their types/sizes
    for (const [k, v] of Object.entries(data)) {
        if (k === 'debug') continue // skip big debug object
        const val = Array.isArray(v) ? `Array(${(v as unknown[]).length})` : typeof v === 'string' ? `"${(v as string).slice(0, 80)}"` : JSON.stringify(v)?.slice(0, 120)
        console.warn(`  ${k}: ${val}`)
    }
    
    // Products specifically
    const prod = data.products || data.recommended_products || data.results || data.items
    console.warn(`  → products/variants found: ${prod ? JSON.stringify(prod).slice(0, 200) : 'NONE'}`)
    
    // Debug KPIs
    const d = data.debug
    console.warn(`  → debug.semantic_match_success: ${d?.semantic_match_success}`)
    console.warn(`  → debug.product_match_count: ${d?.product_match_count}`)
    console.warn(`  → debug.product_card_count: ${d?.product_card_count}`)
    console.warn(`  → debug.detected_intent: ${d?.detected_intent}`)
    console.warn(`  → debug.capsule: ${d?.sommelier_routed_capsule}`)

    await new Promise(r => setTimeout(r, 2000))
}
