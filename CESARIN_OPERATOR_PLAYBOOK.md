# Cesarin AI Pilot — Operator Playbook

**Audience:** Internal admins and operators with access to the Cesarin OS admin panel
**Scope:** Gated pilot only. This document covers the current operational state — signal interpretation, action thresholds, and known limitations.
**Status:** Active (2026-03-20). Review before acting on signals that pre-date this document.

---

## 1. Purpose of the Pilot Surface

Cesarin is an AI assistant embedded in the storefront. It handles natural language queries from real users: product searches, policy questions, compatibility checks, inventory timeframes, and cart add-to-basket flows.

The **TabAnalytics** panel in the admin panel is the current observability surface. It shows 30-day KPIs drawn from the `ai_analytics` table, which is written by the `customer-intelligence` edge function on each user interaction.

The pilot is **gated**: active for internal and early users only. Metrics reflect this — low interaction volume is expected and normal at this stage.

---

## 2. Trustworthy Signals Today

The following signals are reliable and directly actionable. You can trust these at face value:

| Signal | Where | What It Measures | Reliability |
|---|---|---|---|
| **Total Interactions (30d)** | KPI card | Total user queries handled | ✅ Reliable — single row per query, no duplicates |
| **Avg Latency (ms)** | KPI card | Mean edge function response time | ✅ Reliable — captured at response time, consistent measurement |
| **Fallback Rate (%)** | KPI sub-label | % of queries handled via fallback (low-confidence) | ✅ Reliable — clean boolean flag per query |
| **Cart Intent Signals** | KPI sub-label | # of queries where cart add-to-basket intent detected | ✅ Reliable — explicit boolean flag from Analyst tool |
| **Capsule Distribution** | Bar chart | % of queries routed to each capsule (product search / policy / cart / fallback) | ✅ Reliable — computed from capsule field per row |
| **Zero Product Card Count** | Sub-metric | # of product searches that returned no results | ✅ Reliable — product_card_count === 0 on product_search_integrity capsule |
| **Policy Query Count** | Sub-metric | # of queries routed to knowledge_rag_foundation (policy/shipping/FAQ) | ✅ Reliable — capsule field directly |

---

## 3. Immature Signals — Do Not Over-Trust

These signals exist and display correctly, but are **early-stage**. Treat them as directional, not definitive, until a 48-hour production baseline is established.

### 3a. Frustration Rate (%)

**Status:** Newly implemented (2026-03-20). Signal logic is correct and verified. No production baseline yet.

**What it is:** % of interactions where at least one frustration heuristic fired (escalation request, zero-results persistence across turns, or fallback with empty results on a non-conversational query).

**What to do:** Read it directionally. Don't set alert thresholds until you have 48+ hours of real-user data. Current safe reference: if it reads >15% consistently (the visual alert threshold), investigate.

**Known false positive risk:** Low, but not zero. Greetings and chit-chat are excluded by design. Residual false positives may exist for unusual conversational patterns not yet observed.

---

### 3b. Match Semántico (%)

**Status:** Technically reliable post-2026-03-20, but historical data is ambiguous.

**What it is:** % of interactions where `semantic_match_success` was true — a signal that the Analyst resolved the query through a known capsule path.

**What to do:** Only compare data from 2026-03-20 onward. Data from prior dates reflects a different instrumentation baseline and may understate success rates.

**Known gap:** This measures whether the Analyst *decided* to route to a capsule — it does not measure whether the response was actually useful to the user.

---

### 3c. Average Product Cards

**Status:** Ambiguous metric. Displayed but not recommended for critical decisions.

**What it is:** Mean number of product cards shown per interaction (across all query types, including non-product queries).

**Why it's ambiguous:** Chit-chat, policy queries, and greetings contribute 0-card rows, pulling the mean down. The denominator includes non-product intents.

**What to use instead:** Use `Zero Product Card Count` (shown in the secondary panel) filtered to product search rows only for product discovery health.

---

### 3d. Guardrail Rescue Count

**Status:** Technically correct but low operational value.

**What it is:** # of interactions where Analyst returned UNKNOWN intent but Sommelier successfully routed to a capsule anyway.

**Operational note:** A high guardrail rescue count signals Analyst classification gaps. Monitor for spikes, but do not act on daily fluctuations — this is internal system behavior, not user-facing failure.

---

## 4. Signal Interpretation Guide

### 4a. Fallback Spikes

**What you see:** Fallback Rate climbs noticeably (e.g., from 15% to 40%+ over a session).

**What it might mean:**
- Users are asking questions the Analyst doesn't recognize (intent gap — likely new query patterns)
- Edge function is returning errors and falling back gracefully
- Unusual query volume from atypical user segments (testing, admin queries)

**What to do:**
1. Filter query log by bucket `fallback_used` and review the actual queries
2. Look for patterns: Are they product queries? Policy questions? Unusual phrasing?
3. If queries look legitimate but unhandled → catalog for Analyst training consideration
4. If queries look like testing → check if `is_simulation` filter is excluding them (it should by default)
5. No immediate action required if fallback rate drops back to baseline within 24 hours

**Normal baseline:** No established baseline yet (gated pilot). Expect 20–40% fallback rate until query volume is sufficient to assess.

---

### 4b. Frustration_Detected

**How it fires:** Three independent signals, any one sufficient:

| Signal | What It Indicates | How to Read |
|---|---|---|
| `escalation` | User explicitly asked for a human / WhatsApp contact | High confidence — user is frustrated NOW |
| `zero_results_persistence` | User is searching and finding nothing, across multiple turns | Medium confidence — depends on history text scan accuracy |
| `fallback_empty` | Low-confidence response + no products shown, non-conversational query | Lower confidence — could be a gap query rather than user frustration |

**Drill-down path:** Open the query log, filter by bucket `frustration`, read the actual query text and the `ai_logic_debug.frustration_signals` breakdown in raw row data.

**What to do — see Section 5.**

---

### 4c. Latency Anomalies

**Baseline to establish:** Not yet established for gated pilot. The metric is reliable; the reference range is not yet known.

**Rough expectation for edge function:** 1000–4000ms depending on Gemini API response time and whether tool calls are made.

**What you see:** `avgLatencyMs` jumps significantly (e.g., >6000ms consistently).

**What it might mean:**
- Gemini API experiencing latency on their end
- Analyst calling multiple tools (compatibility + search in same query)
- Network issues between Supabase edge and Gemini endpoint

**What to do:**
1. Check if spike is isolated to one time window or ongoing
2. Check Supabase edge function logs for timeout or error patterns
3. Latency spikes alone don't require user intervention — investigate if users are also showing frustration_detected correlation
4. If sustained >6000ms average for >2 hours, flag to technical team

---

### 4d. Routing Distribution Shifts

**What you see:** Capsule Distribution chart shows one bucket growing unusually large or small.

**Examples and what they mean:**

| Pattern | Likely Cause | Action |
|---|---|---|
| "Búsqueda Producto" drops sharply | Product queries going to fallback instead | Check if isCompatibilityMatch or INVENTORY_OUTLOOK guard is misfiring |
| "Fallback / Sin Cápsula" >50% | Analyst classification degrading or new query types | Review fallback bucket for query patterns |
| "Consulta Info/Policy" spike | User confusion about store policies, or a shipping event | Informational — could mean legitimate policy question uptick |
| "Intención Carrito" spikes | Positive signal — users adding to cart via AI | Celebrate and note |

---

## 5. Frustration Response Playbook

### 5a. Single Isolated frustration_detected Event

**Threshold:** 1–2 events in 24 hours on overall low volume

**Interpretation:** Within normal range. False positives exist. Do not act unless the query clearly shows a real user stuck.

**Action:**
1. Read the query text
2. If query was a genuine product search with zero results → verify product catalog
3. If query was unclear or conversational → likely false positive, log and monitor
4. No user-facing intervention needed for isolated events

---

### 5b. Repeated frustration_detected Events (Same or Similar Queries)

**Threshold:** 3+ events in a 48-hour window with similar query text or pattern

**Interpretation:** Real signal. Users are encountering a consistent gap.

**Action:**
1. Identify the pattern (what are users asking?)
2. If it's a product gap: verify that SKU/category exists in catalog with correct metadata
3. If it's a policy question going unresolved: review if `knowledge_rag_foundation` has the relevant content
4. If it's a compatibility question (coil/battery/pod fit): check if product compatibility data is populated
5. Flag the pattern to the product or content team
6. No code changes from operator level — escalate to technical if the gap is in the AI path

---

### 5c. Escalation-Shaped Events (Signal: escalation = true)

**Threshold:** Any event where `escalation_requested = true` (user asked for human/WhatsApp)

**Interpretation:** User is explicitly signaling they could not get their answer from AI. Highest confidence frustration signal.

**Action (immediate):**
1. Read the conversation context (query text + detected intent)
2. If user asked for WhatsApp: verify WhatsApp contact info is correct and reachable
3. If user was searching for a specific product: flag for manual follow-up if you can identify the user from session context
4. Record the query as a gap example — these are your highest-value training cases

**Action (24-hour):**
1. If escalation events cluster around a specific product type or query category, escalate to technical for Analyst training consideration
2. If frequency >3 escalation events/day, consider proactive outreach mechanism (WhatsApp broadcast, etc.)

---

### 5d. Frustration Rate Visual Alert (>15% threshold)

**What you see:** Frustración card turns red/rose in the dashboard.

**Context:** The 15% threshold was set at implementation. No production baseline exists yet — this threshold may need recalibration after 48h of real data.

**Action:**
1. Do not panic — this may reflect early calibration issues or low-volume noise
2. Open query log, filter by `frustration` bucket, read last 20 events
3. Determine signal breakdown: mostly escalation (real)? mostly fallback_empty (ambiguous)?
4. If majority are escalation events: treat as real, see 5c
5. If majority are fallback_empty: investigate what queries are hitting this path — may need catalog or response quality fix
6. After 48h of baseline: recalibrate threshold expectation based on observed true positive rate

---

## 6. Known Blind Spots and Caveats

### 6a. Gated Pilot Model

All data reflects internal and early users only. Volume is low. Percentages derived from small sample sizes will swing significantly between days. Establish a minimum interaction volume (suggest: 50+ interactions) before treating rates as stable.

### 6b. Partial Client-Capsule Visibility

When users trigger **early-return paths** (product_search_integrity, knowledge_rag_foundation, cart_operator) from the client side, telemetry is computed differently (via `logAITelemetry` in concierge.service) rather than by the edge function.

**Implication:** The frustration_detected signal is only computed for edge function path interactions. Client-capsule early-return interactions may have incomplete frustration signal coverage. If a user is frustrated during a product search that resolves client-side, that frustration may not appear in the dashboard.

**How to recognize:** If routing distribution shows high product_search_integrity % but frustration rate seems low, the gap may be visibility, not absence of friction.

### 6c. Early-Stage Frustration Baseline

The frustration_detected MVP was deployed on 2026-03-20. No production baseline exists.

**Do not use frustration rate as a benchmark against anything before 2026-03-20.** Pre-existing rows may have `frustration_detected: null` or `false` because the column wasn't written.

**Recommended baseline window:** 48 hours of real-user traffic before drawing any rate conclusions.

### 6d. Historical Telemetry Date-Range Caveat

The TabAnalytics dashboard currently shows **30-day rolling data** with no date filter. This means:

- Older rows (pre-2026-03-20) are included in current KPI calculations
- Semantic match success rate may appear lower than current reality due to pre-repair data
- Zero-product-card counts may include resolution failures that are now fixed

**Operator workaround:** When reviewing data manually via the query log, look at `created_at` on individual rows. Treat pre-2026-03-20 data as historical context only.

### 6e. History Text-Scan Dependency (Zero-Results Persistence)

The `zero_results_persistence` frustration signal works by scanning prior assistant message text for phrases like "no encontré", "no tenemos", "agotado". This is a text heuristic, not a structured signal.

**Risk:** If the AI responds with a different phrasing not in the keyword list, prior zero-results may go undetected. Zero-results persistence signal may **underfire** (miss some true positives), not overfire.

**Practical effect:** When this signal fires, it's reliable. When it doesn't fire, you can't assume the user wasn't experiencing zero-results persistence.

### 6f. No User Satisfaction Validation

All current signals are internal system proxies. There is no mechanism today that connects AI quality to actual user satisfaction or purchase behavior.

**Implication:** A low frustration rate does not mean users are satisfied. An adequate semantic match rate does not mean responses are useful. These gaps will remain until an explicit user feedback mechanism is designed.

---

## 7. Operator Response Reference

### Quick-Reference Triage Matrix

| Signal | Threshold | Operator Action | Escalate to Technical? |
|---|---|---|---|
| Single frustration event | 1–2 / 24h | Read query, log if genuine gap | No |
| Repeated frustration pattern | 3+ similar / 48h | Catalog queries, flag to product/content team | If AI path gap |
| Escalation event (escalation=true) | Any | Read context, verify WhatsApp, flag as training case | If repeated |
| Fallback rate spike | >50% sustained 2h | Review fallback bucket queries, check for patterns | If legitimate queries failing |
| Latency spike | >6000ms avg, sustained 2h | Check edge function logs | Yes |
| Zero product cards cluster | 5+ in same product category | Verify catalog metadata for that category | If catalog is correct but results still empty |
| Capsule distribution shift | >20% change in 24h | Understand query pattern behind shift | If shift is unexpected |

### SQL Forensics Queries (for technical escalation support)

**Recent frustration events with signal breakdown:**
```sql
SELECT
    created_at,
    query,
    detected_intent,
    ai_logic_debug->>'frustration_signals' AS signals
FROM ai_analytics
WHERE frustration_detected = true
    AND created_at > '2026-03-20'
ORDER BY created_at DESC
LIMIT 20;
```

**Escalation-only events:**
```sql
SELECT created_at, query, detected_intent
FROM ai_analytics
WHERE (ai_logic_debug->>'frustration_signals')::jsonb->>'escalation' = 'true'
    AND created_at > '2026-03-20'
ORDER BY created_at DESC;
```

**Zero-results product searches:**
```sql
SELECT created_at, query
FROM ai_analytics
WHERE (ai_logic_debug->>'product_card_count')::int = 0
    AND (ai_logic_debug->>'sommelier_routed_capsule') = 'product_search_integrity'
    AND created_at > '2026-03-20'
ORDER BY created_at DESC
LIMIT 20;
```

**Fallback rate by day (post-repair):**
```sql
SELECT
    DATE(created_at) AS day,
    COUNT(*) AS total,
    SUM(CASE WHEN (ai_logic_debug->>'fallback_used')::boolean THEN 1 ELSE 0 END) AS fallbacks,
    ROUND(100.0 * SUM(CASE WHEN (ai_logic_debug->>'fallback_used')::boolean THEN 1 ELSE 0 END) / COUNT(*), 1) AS fallback_pct
FROM ai_analytics
WHERE created_at > '2026-03-20'
    AND (ai_logic_debug->>'is_simulation' IS NULL OR ai_logic_debug->>'is_simulation' = 'false')
GROUP BY DATE(created_at)
ORDER BY day DESC;
```

---

## 8. Recommended Review Cadence

### Daily (5 minutes)

Look at TabAnalytics dashboard:
- Is frustration rate above 15%? If yes, filter query log by frustration bucket and read last 10 events.
- Are there any escalation-flagged events today? Read and catalog.
- Is latency average normal (under ~5000ms)?
- Is fallback rate stable vs prior days?

If all clear: no action needed. Move on.

### 48-Hour Check (post-launch baseline)

During the first 48 hours after any expanded pilot cohort:
- Export frustration rate breakdown by signal type (escalation / zero-results / fallback-empty)
- Note: What % of frustration events are escalation vs fallback_empty?
- Note: Is there a product category or query type appearing repeatedly in fallback or frustration buckets?
- Use this window to calibrate whether the 15% frustration alert threshold is appropriate for your actual user base

### Weekly (15 minutes)

- Review intent distribution trend: Is product search % stable? Is fallback growing?
- Are policy queries increasing? (May indicate user confusion or shipping/policy changes)
- Are zero-product-card counts stable or growing? (Catalog coverage health proxy)
- Review any repeated frustration patterns from the week — catalog them as training candidates
- Note any latency trends (gradual increase may indicate upstream Gemini changes)

### Trigger-Based (as-needed)

Act immediately when:
- Escalation events appear (any occurrence)
- Frustration rate jumps >20% in a single day on any meaningful interaction volume
- Fallback rate exceeds 60% for >2 hours
- Latency average exceeds 8000ms for >1 hour
- A product category shows multiple zero-result events in the same hour

---

## Appendix: Signal Field Reference

| Field | Type | Location | Source | Meaning |
|---|---|---|---|---|
| `frustration_detected` | boolean | Top-level column | Edge function | Any frustration signal fired |
| `ai_logic_debug.frustration_signals.escalation` | boolean | JSONB | Edge function | User asked for human/WhatsApp |
| `ai_logic_debug.frustration_signals.zero_results_persistence` | boolean | JSONB | Edge function | Multi-turn zero-results detected |
| `ai_logic_debug.frustration_signals.fallback_empty` | boolean | JSONB | Edge function | Fallback + no products, non-conversational |
| `ai_logic_debug.fallback_used` | boolean | JSONB | Edge function | Query handled via fallback path |
| `ai_logic_debug.product_card_count` | integer | JSONB | Edge function | # product cards in response |
| `ai_logic_debug.semantic_match_success` | boolean | JSONB | Edge function | Analyst routed to a known capsule |
| `ai_logic_debug.sommelier_routed_capsule` | string | JSONB | Edge function | Which capsule Sommelier selected |
| `ai_logic_debug.latency_ms` | integer | JSONB | Edge function | Total edge function wall-clock time |
| `ai_logic_debug.cart_action_detected` | boolean | JSONB | Edge function | Cart add-to-basket intent detected |
| `detected_intent` | string | Top-level column | Analyst | Analyst's internal intent classification |

---

_Playbook written for gated pilot operations. Revisit thresholds and signal maturity assessments after 48-hour baseline capture under real-user traffic. Escalate technical findings to engineering; escalate content/catalog gaps to product team._
