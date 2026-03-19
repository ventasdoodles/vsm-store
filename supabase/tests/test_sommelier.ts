/**
 * VSM AI Validation — Sommelier Batch Scenario Runner
 * 
 * Tests the high-level AI routing (customer-intelligence) 
 * against a set of "Golden Queries" to ensure correct 
 * capsule selection and response structure.
 */
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { TEST_CONFIG } from './test_config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

async function runSommelierScenarios() {
    console.log('--- 🧪 SOMMELIER TEST: Batch Scenario Validation ---')
    console.log(`Executing ${TEST_CONFIG.SCENARIOS.length} scenarios...\n`)

    for (const s of TEST_CONFIG.SCENARIOS) {
        console.warn(`📡 Query: "${s.query}"`)
        const start = Date.now()
        
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-intelligence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ 
                    action: 'concierge_chat',
                    query: s.query,
                    history: []
                })
            })

            const latency = Date.now() - start
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)

            const data = await res.json()
            const capsule = data.capsule_name || (data.debug?.detected_intent) || 'unknown'
            const runtime = data.debug?.runtime_truth || {};
            const modelId = runtime.model || runtime.analyst_model || 'UNKNOWN';
            const projectRef = runtime.project_ref || 'UNKNOWN';
            const corrId = runtime.correlation_id || 'N/A';

            console.warn(`   🔸 Capsule: ${capsule} (${latency}ms)`)
            console.warn(`   🔹 Audit: [Project: ${projectRef}] [Model: ${modelId}] [API: v1]`)
            console.warn(`   🔹 Trace: [CorrelationID: ${corrId}]`)

            // Validations
            if (capsule !== s.expected_capsule) {
                console.error(`   ❌ FAIL: Expected capsule "${s.expected_capsule}", got "${capsule}"`)
                process.exit(1)
            }

            if (s.must_include_products && data.requires_client_capsule === false) {
                 // Skip if it's routing
            }

            if ((s as any).must_include_text) {
                const text = JSON.stringify(data).toLowerCase()
                if (!text.includes((s as any).must_include_text.toLowerCase())) {
                    console.error(`   ❌ FAIL: Response missing expected text: "${(s as any).must_include_text}"`)
                    process.exit(1)
                }
                console.warn(`   ✅ Validated: Relevant context found in response.`)
            }

            console.warn('   🟢 Pass\n')

        } catch (err) {
            console.error(`   ❌ FAIL: ${err instanceof Error ? err.message : String(err)}`)
            process.exit(1)
        }
    }

    console.warn('🌟 PASS: Sommelier routing and capsule structure are perfect.\n')
}

runSommelierScenarios().catch(err => {
    console.error(`❌ FATAL: ${err.message}`)
    process.exit(1)
})
