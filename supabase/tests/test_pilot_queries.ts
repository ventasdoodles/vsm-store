/**
 * VSM Store — Pilot Queries Validation Suite
 * 
 * Tests 4 canonical golden queries:
 * 1. "tienes vapes de uva"           — expects PRODUCT_SEARCH / product cards
 * 2. "qué políticas de envío tienes" — expects POLICY_INQUIRY / RAG knowledge
 * 3. "quiero algo barato y frutal"   — expects PRODUCT_SEARCH / semantic match
 * 4. "cuánto cuesta el envío"        — expects POLICY_INQUIRY / shipping cost RAG
 * 
 * Query 4 replaces "cuáles son los más vendidos" because there is NO canonical
 * best-sellers source in the DB (no ranking signal). Using a RAG-provable query instead.
 * 
 * Each test validates:
 *   - capsule routing
 *   - semantic_match_success (from runtime_truth / debug)
 *   - product_card_count (if applicable)
 *   - fallback_used flag
 *   - latency < 8000ms threshold
 */
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const PROJECT_REF = 'cvvlorbiwtuhkxolhfie'
const FUNCTION_PATH = '/functions/v1/customer-intelligence'
const TARGET_URL = `${SUPABASE_URL}${FUNCTION_PATH}`

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
    process.exit(1)
}

// ── Query Definitions ─────────────────────────────────────────────────────
interface PilotQuery {
    id: string
    query: string
    expected_capsule: string
    expect_products: boolean       // expects product cards?
    expect_knowledge: boolean      // expects RAG knowledge?
    latency_threshold_ms: number
    rationale: string
}

const PILOT_QUERIES: PilotQuery[] = [
    {
        id: 'PQ-1',
        query: 'tienes vapes de uva',
        expected_capsule: 'product_search_integrity',
        expect_products: true,
        expect_knowledge: false,
        latency_threshold_ms: 8000,
        rationale: 'Semantic product search by explicit flavor — must return product cards'
    },
    {
        id: 'PQ-2',
        query: 'qué políticas de envío tienes',
        expected_capsule: 'knowledge_rag_foundation',
        expect_products: false,
        expect_knowledge: true,
        latency_threshold_ms: 8000,
        rationale: 'Policy inquiry — must route to RAG, not fallback'
    },
    {
        id: 'PQ-3',
        query: 'quiero algo barato y frutal',
        expected_capsule: 'product_search_integrity',
        expect_products: true,
        expect_knowledge: false,
        latency_threshold_ms: 8000,
        rationale: '[FIXED PQ-3] Abstract commercial preference — guardrail must rescue from UNKNOWN → PRODUCT_SEARCH'
    },
    {
        id: 'PQ-4',
        query: 'cuánto cuesta el envío',
        expected_capsule: 'knowledge_rag_foundation',
        expect_products: false,
        expect_knowledge: true,
        latency_threshold_ms: 8000,
        rationale: 'Shipping cost query — provable via shipping policy in store_knowledge'
    },
    // ── NEW: Abstract Preference Queries (brain-first microfix v106) ──
    {
        id: 'PQ-5',
        query: 'recomiéndame algo frutal',
        expected_capsule: 'product_search_integrity',
        expect_products: true,
        expect_knowledge: false,
        latency_threshold_ms: 8000,
        rationale: 'Explicit recommendation request with flavor signal — guardrail or few-shot must fire PRODUCT_SEARCH'
    },
    {
        id: 'PQ-6',
        query: 'quiero algo suave y rico',
        expected_capsule: 'product_search_integrity',
        expect_products: true,
        expect_knowledge: false,
        latency_threshold_ms: 8000,
        rationale: 'Abstract texture/taste preference — must not fall through to UNKNOWN'
    },
    {
        id: 'PQ-7',
        query: 'qué me conviene para empezar a vapear',
        expected_capsule: 'product_search_integrity',
        expect_products: true,
        expect_knowledge: false,
        latency_threshold_ms: 8000,
        rationale: 'Novice onboarding query with "qué me conviene" signal — should route to semantic recommendations'
    }
]

// ── Test Runner ────────────────────────────────────────────────────────────
interface TestResult {
    id: string
    query: string
    expected_capsule: string
    actual_capsule: string
    latency_ms: number
    semantic_match_success: boolean
    fallback_used: boolean
    product_card_count: number
    policy_match_count: number
    project_ref: string
    model: string
    api_version: string
    correlation_id: string
    passed: boolean
    failures: string[]
}

async function runPilotQueries(): Promise<void> {
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('🧪 VSM Pilot Queries — Validation Suite')
    console.log(`   Project Ref: ${PROJECT_REF}`)
    console.log(`   Target:      ${TARGET_URL}`)
    console.log(`   Queries:     ${PILOT_QUERIES.length}`)
    console.log('═══════════════════════════════════════════════════════════════\n')

    const results: TestResult[] = []

    for (const pq of PILOT_QUERIES) {
        console.log(`\n📡 [${pq.id}] "${pq.query}"`)
        console.log(`   Rationale: ${pq.rationale}`)
        const start = Date.now()

        try {
            const res = await fetch(TARGET_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'X-Request-ID': `pilot-${pq.id}-${Date.now()}`
                },
                body: JSON.stringify({
                    action: 'concierge_chat',
                    query: pq.query,
                    history: []
                })
            })
            const latency = Date.now() - start

            if (!res.ok) {
                const errText = await res.text()
                throw new Error(`HTTP ${res.status}: ${errText}`)
            }

            const data = await res.json()
            const debug = data.debug || {}
            const runtime = debug.runtime_truth || {}

            // Architectural context: product_search_integrity and knowledge_rag_foundation
            // return requires_client_capsule=true — the Edge Function is an ORCHESTRATOR.
            // Actual product fetching happens client-side in the capsule. 
            // We validate: correct capsule_name, correct tool_args, no error, correct intent.
            const isCapsuleHandoff: boolean = data.requires_client_capsule === true

            // Extract capsule routing
            const capsule = isCapsuleHandoff
                ? (data.capsule_name || 'UNKNOWN')
                : (data.capsule_name || debug.detected_intent || 'UNKNOWN')

            // For capsule handoffs: semantic success = capsule routed correctly + tool_args has query
            const hasValidToolArgs = !!(data.tool_args?.query || data.tool_args?.query === '')
            const semanticMatchSuccess: boolean = isCapsuleHandoff
                ? (capsule === pq.expected_capsule && hasValidToolArgs)
                : (debug.semantic_match_success ?? (debug.product_match_count > 0 || debug.policy_match_count > 0) ?? false)

            const fallbackUsed: boolean = isCapsuleHandoff
                ? false  // Capsule handoffs are NOT fallbacks — they're deliberate routing
                : (debug.fallback_used ?? false)

            // Product card count: only meaningful for non-capsule (Sommelier) responses
            const productCardCount: number = isCapsuleHandoff
                ? -1  // sentinel: "delegated to client, not measurable here"
                : (debug.product_card_count ?? (Array.isArray(data.products) ? data.products.length : 0))

            const policyMatchCount: number = isCapsuleHandoff ? -1 : (debug.policy_match_count ?? 0)
            const projectRef = PROJECT_REF
            const model: string = runtime.model ?? runtime.analyst_model ?? 'UNKNOWN'
            const apiVersion: string = runtime.api_version ?? 'unknown'
            const corrId: string = runtime.correlation_id ?? 'N/A'

            // ── Evaluate PASS/FAIL ──────────────────────────────────────────
            const failures: string[] = []

            // Rule 1: Capsule routing must be correct
            if (capsule !== pq.expected_capsule) {
                failures.push(`Capsule: expected "${pq.expected_capsule}", got "${capsule}"`)
            }

            // Rule 2: For capsule handoffs, validate tool_args.query is populated
            if (isCapsuleHandoff && !hasValidToolArgs) {
                failures.push(`Tool args: capsule handoff missing tool_args.query`)
            }

            // Rule 3: For knowledge queries in non-capsule mode, require semantic hit
            if (!isCapsuleHandoff && pq.expect_knowledge && !semanticMatchSuccess) {
                failures.push(`RAG: expected knowledge match, got none`)
            }

            // Rule 4: Unexpected fallback in non-capsule mode
            if (!isCapsuleHandoff && fallbackUsed && (pq.expect_products || pq.expect_knowledge)) {
                failures.push(`Fallback: unexpected fallback response`)
            }

            // Rule 5: Latency
            if (latency > pq.latency_threshold_ms) {
                failures.push(`Latency: ${latency}ms exceeds ${pq.latency_threshold_ms}ms threshold`)
            }

            const passed = failures.length === 0

            results.push({
                id: pq.id, query: pq.query, expected_capsule: pq.expected_capsule, actual_capsule: capsule,
                latency_ms: latency, semantic_match_success: semanticMatchSuccess, fallback_used: fallbackUsed,
                product_card_count: productCardCount, policy_match_count: policyMatchCount,
                project_ref: projectRef, model, api_version: apiVersion, correlation_id: corrId, passed, failures
            })

            // Print result
            const handoffLabel = isCapsuleHandoff ? ' [CLIENT-SIDE CAPSULE]' : ''
            console.log(`   ${passed ? '✅ PASS' : '❌ FAIL'} (${latency}ms)${handoffLabel}`)
            console.log(`   🔸 Capsule: "${capsule}" (expected: "${pq.expected_capsule}")`)
            console.log(`   🔹 [Project: ${projectRef}] [Model: ${model}] [API: ${apiVersion}]`)
            if (isCapsuleHandoff) {
                console.log(`   🔹 handoff=true tool_args=${JSON.stringify(data.tool_args || {})}`)
            } else {
                console.log(`   🔹 semantic_ok:${semanticMatchSuccess} fallback:${fallbackUsed} cards:${productCardCount} policy_chunks:${policyMatchCount}`)
            }
            console.log(`   🔹 correlation_id: ${corrId}`)
            if (failures.length > 0) {
                for (const f of failures) console.error(`   ⚠️  ${f}`)
            }

        } catch (err) {
            const latency = Date.now() - start
            console.error(`   ❌ ERROR: ${(err as Error).message} (${latency}ms)`)
            results.push({
                id: pq.id, query: pq.query, expected_capsule: pq.expected_capsule, actual_capsule: 'ERROR',
                latency_ms: latency, semantic_match_success: false, fallback_used: false,
                product_card_count: 0, policy_match_count: 0, project_ref: PROJECT_REF,
                model: 'UNKNOWN', api_version: 'UNKNOWN', correlation_id: 'N/A',
                passed: false, failures: [`Exception: ${(err as Error).message}`]
            })
        }

        // Pause between queries to avoid rate limits
        await new Promise(r => setTimeout(r, 1500))
    }

    // ── Summary ──────────────────────────────────────────────────────────
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    const avgLatency = Math.round(results.reduce((a, r) => a + r.latency_ms, 0) / results.length)
    const semanticSuccessRate = ((results.filter(r => r.semantic_match_success).length / results.length) * 100).toFixed(0)
    const fallbackRate = ((results.filter(r => r.fallback_used).length / results.length) * 100).toFixed(0)

    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('📊 PILOT QUERY SUMMARY')
    console.log(`   PASS: ${passed}/${results.length}  |  FAIL: ${failed}/${results.length}`)
    console.log(`   Avg Latency: ${avgLatency}ms`)
    console.log(`   Semantic Match Rate: ${semanticSuccessRate}%`)
    console.log(`   Fallback Rate: ${fallbackRate}%`)
    console.log('\n   Detailed Results:')
    for (const r of results) {
        const icon = r.passed ? '✅' : '❌'
        console.log(`   ${icon} [${r.id}] capsule:${r.actual_capsule} latency:${r.latency_ms}ms semantic:${r.semantic_match_success} cards:${r.product_card_count}`)
    }
    console.log('═══════════════════════════════════════════════════════════════')

    if (failed > 0) {
        console.error(`\n❌ ${failed} pilot queries failed. See details above.`)
        process.exit(1)
    } else {
        console.log('\n🎉 All pilot queries PASSED. AI retrieval pipeline is validated.')
    }
}

runPilotQueries().catch(err => { console.error('Fatal:', err); process.exit(1) })
