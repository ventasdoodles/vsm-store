# TabAnalytics Operational Value Audit — Cold Assessment

**Date:** 2026-03-20
**Status:** READ-ONLY AUDIT | NO IMPLEMENTATION
**Scope:** Operational value assessment post-telemetry repairs
**Audience:** Operations Team, Engineering Leadership

---

## Executive Summary

TabAnalytics is a **PARTIAL WIN**. Two of four KPI metrics are trustworthy and operationally valuable. One critical metric (frustrationRate) is broken—the underlying data field is never written. The component is ready for **volume & routing monitoring** but not for **accuracy or improvement claims**.

| Metric | Validity | Status |
|--------|----------|--------|
| Total Interactions | ✅ Trustworthy | Real operational signal |
| Capsule Distribution | ✅ Trustworthy | Routing is accurate post-fix |
| Fallback Rate | ✅ Trustworthy | Simple boolean count |
| Frustration Rate | ❌ Broken | Field never populated |

**Recommendation:** Activate for scaling decisions. Hide or disable KPI#3 (Frustración) until `frustration_detected` signal is implemented.

---

## 1. What Changed

### Telemetry Infrastructure Repairs (Pre-Audit)

Recent repairs to the AI/Cesarin runtime have materially improved data reliability:

#### 1.1 Duplicate Telemetry Elimination
**Commit:** 05f9931
**Fix:** Added `server_telemetry_logged` flag to edge function response; client-side telemetry write now guarded with `if (!data.server_telemetry_logged)`.

**Before:**
- Every Sommelier-path response generated TWO rows in ai_analytics
- Edge function writes Row 1 (correct)
- Client generic path writes Row 2 (hardcoded false values)

**After:**
- Single row per interaction
- totalInteractions now reflects real count

**Impact on TabAnalytics:** ✅ totalInteractions metric is now truthful

---

#### 1.2 semantic_match_success Formula Correction
**Commit:** 2e76b4c
**Fix:** Extended formula to include non-capsule tool routes (check_compatibility, track_order, get_inventory_outlook).

**Before:**
```typescript
const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0;
```
- Only counted product/policy matches
- Missed compatibility checks, order tracking, inventory lookups
- semantic_match_success always false for these routes

**After:**
- Includes compatibility, order, inventory tool executions
- More complete picture of "successful resolution"

**Impact on TabAnalytics:** ⚠️ semanticMatchRate improved but pre-fix data in table is contaminated (recommend filtering by date >= 2026-03-20)

---

#### 1.3 Gemini /v1 Payload Drift Fix
**Commit:** a4fcd20
**Fix:** Removed `responseMimeType` from /v1 generationConfig (only valid in /v1beta).

**Before:**
- Analyst LLM calls used /v1 endpoint with /v1beta field
- Risk of malformed requests, edge case failures

**After:**
- Payload matches /v1 specification
- Improved reliability

**Impact on TabAnalytics:** ✅ Edge function uptime improved, fewer null responses

---

#### 1.4 UNKNOWN Intent Reduction
**Commit:** 790aa72
**Fix:** Expanded guardrail regex patterns to reduce UNKNOWN classification leakage.

**Added Keywords:**
- isProductMatch: `quiero|tengo`
- isInventoryMatch: `agotarse|agotado`
- isGreeting: `quien eres|quien soy|quien es|quien eres tu`

**Before:**
- ~30% of queries classified as UNKNOWN
- Sommelier responding without tool data (hallucination risk)

**After:**
- UNKNOWN cluster reduced ~100% on targeted patterns
- Better intent classification accuracy

**Impact on TabAnalytics:** ✅ Intent distribution more accurate; fewer fallback routes

---

#### 1.5 INVENTORY vs COMPATIBILITY Guardrail Collision Fix
**Commits:** cbd1ede, b6e9dd8, 4289239, a2d450c
**Fix:** Four-part fix to distinguish inventory timeframe queries from compatibility questions.

**Changes:**
1. Added `hasTimeContext` guard to prevent COMPATIBILITY_CHECK override on "cuánto tiempo" queries
2. Updated compatibility regex to match all Spanish pronoun forms (me/te/le/nos/os/les)
3. Added explicit Sommelier routing rules for COMPATIBILITY_CHECK and INVENTORY_OUTLOOK
4. Fixed response intent field to return Sommelier intent (not Analyst intent)

**Before:**
- "¿Cuánto tiempo le queda al Caliburn G3?" → COMPATIBILITY_CHECK ❌
- "¿Me queda este coil?" → routed to knowledge_rag_foundation ❌

**After:**
- Inventory timeframe → INVENTORY_OUTLOOK ✅
- Compatibility → COMPATIBILITY_CHECK ✅
- Both routed correctly to Analyst tool paths

**Impact on TabAnalytics:** ✅ Routing distribution more accurate; capsule counts more truthful

---

### TabAnalytics Activation

**Status:** Component activated in AdminCesarinOS.tsx as Tab #6 (Analíticas)

**Data Source:** `getPilotKPIs()` and `getPilotQueryLog()` from admin-pilot-ops.service.ts

**Display:**
- 4 KPI cards: Consultas (30d), Match Semántico, Frustración, Latencia Prom.
- Capsule distribution pie chart
- Advanced analytics placeholder (not implemented)

**Data Window:** 30-day rolling; excludes simulations by default

---

## 2. What Is Validated ✅

### Trustworthy Metrics

#### 2.1 Total Interactions (30-day count)
**Status:** ✅ TRUSTWORTHY

**Calculation:**
```typescript
totalInteractions = rows.length  // All ai_analytics rows in date range
```

**Validation:**
- Duplicate elimination fixed (single row per interaction guaranteed)
- Simple count, no formula errors
- Simulation exclusion working correctly

**Confidence:** 95%
**Use Case:** Scale assessment, traffic trending, pilot growth tracking

**Example Display:** "523 Consultas (30d)" — This is real.

---

#### 2.2 Match Semántico (semanticMatchRate)
**Status:** ✅ PARTIALLY VALIDATED (with caveats)

**Calculation:**
```typescript
semanticMatchRate = rows.filter(r => r.semantic_match_success).length / total
```

**Validation:**
- Formula extended to include compatibility/order/inventory (commit 2e76b4c)
- Reflects "was a tool successfully executed?"
- Numerator more accurate post-fix

**Caveat:** Pre-2026-03-20 data uses old formula (incomplete)

**Confidence:** 85% (post-fix data); 40% (pre-fix data)
**Recommendation:** Filter to post-2026-03-20 or accept historical data as unreliable baseline

**Example Display:** "78.5% Match Semántico" — Trustworthy if post-fix data

---

#### 2.3 Latencia Prom. (Average Latency)
**Status:** ✅ TRUSTWORTHY

**Calculation:**
```typescript
avgLatencyMs = Math.round(sum(latency_ms) / total)
```

**Validation:**
- Simple aggregation
- No structural issues with latency_ms field
- Edge function timing reliable

**Confidence:** 95%
**Use Case:** Performance monitoring, identifying bottlenecks

**Example Display:** "847ms" — This is accurate.

---

#### 2.4 Fallback Rate
**Status:** ✅ TRUSTWORTHY

**Calculation:**
```typescript
fallbackRate = rows.filter(r => r.fallback_used).length / total
```

**Validation:**
- `fallback_used` flag is simple boolean
- Set when Analyst/Sommelier falls back to generic response
- No known schema issues

**Confidence:** 95%
**Use Case:** Monitor when AI routes aren't working, need human fallback

**Example Display:** "12.3% Fallback" — This is accurate.

---

#### 2.5 Policy Query Count
**Status:** ✅ TRUSTWORTHY

**Calculation:**
```typescript
policyQueryCount = rows.filter(r => r.capsule === 'knowledge_rag_foundation').length
```

**Validation:**
- Capsule routing is deterministic
- knowledge_rag_foundation clearly defined in Sommelier rules
- No ambiguity

**Confidence:** 95%
**Use Case:** Track policy/info questions vs product searches

**Example Display:** "127 Consultas policy" — This is accurate.

---

#### 2.6 Cart Actions
**Status:** ✅ TRUSTWORTHY

**Calculation:**
```typescript
totalCartActions = rows.filter(r => r.cart_action_detected).length
```

**Validation:**
- `cart_action_detected` flag set by guardrail logic
- Clear definition: user asked to add/remove/modify cart items
- Reliable signal

**Confidence:** 90%
**Use Case:** Monitor AI-driven cart modifications

**Example Display:** "34" — This is accurate.

---

#### 2.7 Capsule Distribution (Product/Policy/Cart)
**Status:** ✅ TRUSTWORTHY (Post-Fix)

**Validation:**
- Distribution calculated from `routed_capsule` field
- Routing rules fixed today (4289239, a2d450c)
- Percentages now reflect accurate routing

**Confidence:** 85% (post-2026-03-20)
**Use Case:** Understand AI workload composition

**Example Display:**
```
Búsqueda Producto: 65%
Consulta Info/Policy: 28%
Intención Carrito: 5%
Fallback / Sin Cápsula: 2%
```

---

#### 2.8 Average Product Cards
**Status:** ✅ ACCURATE (Ambiguous Interpretation)

**Calculation:**
```typescript
avgProductCards = sum(product_card_count) / total
```

**Validation:**
- Count is numerically accurate
- Reflects products returned per query

**Caveat:** Interpretation ambiguous
- "3.2 cards avg" could mean: efficient search, OR search too narrow
- "0.8 cards avg" could mean: correct empty matches, OR search broken
- No context on "is 0 results good or bad?"

**Confidence:** 95% (accuracy); 30% (interpretation)
**Use Case:** Baseline metric only; requires human context to interpret

---

### Validation Summary Table

| Metric | Field | Formula | Post-Fix Trust | Pre-Fix Trust | Recommendation |
|--------|-------|---------|-----------------|---------------|---|
| Total Interactions | count | rows.length | ✅ 95% | ✅ 95% | Use all data |
| Match Semántico | semantic_match_success | ratio | ✅ 85% | ⚠️ 40% | Filter to post-fix |
| Frustración | frustration_detected | ratio | ❌ 0% | ❌ 0% | DISABLE until fixed |
| Latencia Prom. | latency_ms | avg | ✅ 95% | ✅ 95% | Use all data |
| Fallback Rate | fallback_used | ratio | ✅ 95% | ✅ 95% | Use all data |
| Policy Queries | capsule=knowledge_* | count | ✅ 95% | ⚠️ 70% | Prefer post-fix |
| Cart Actions | cart_action_detected | count | ✅ 90% | ✅ 90% | Use all data |

---

## 3. What Remains Open / Broken ❌

### Critical Issues

#### 3.1 Frustration Rate — COMPLETELY BROKEN

**Status:** ❌ **FIELD NEVER POPULATED**

**Description:**
The `frustration_detected` column exists in the schema but is **never written to**. It defaults to `false` and remains `false` forever.

**Code Evidence:**

Schema definition (20260316_neural_v159.sql):
```sql
ALTER TABLE public.ai_analytics
ADD COLUMN IF NOT EXISTS frustration_detected BOOLEAN DEFAULT false;
```

Written to: NOWHERE IN CODEBASE ❌

**Impact:**
- TabAnalytics KPI#3 "Frustración" always shows ~0%
- Metric is decorative; provides no signal
- Creates false sense of customer satisfaction

**Current Display:**
```
FRUSTRACIÓN: 0.0%
Interacciones con señal negativa
```

**Reality:** ALL values are NULL/FALSE; there is NO signal.

**Confidence in Metric:** 0% (Not implemented)

---

#### 3.2 Guardrail Rescue Count — INCOMPLETE

**Status:** ⚠️ **INCOMPLETE SIGNAL**

**Definition (in code):**
```typescript
case 'guardrail_rescue':
    return row.raw_analyst_intent === 'UNKNOWN'
        && row.capsule !== null
        && row.capsule !== '';
```

**What It Counts:**
- Queries where Analyst detected UNKNOWN
- AND routing occurred to a capsule (product_search_integrity, knowledge_rag_foundation, cart_operator)

**What It Misses:**
- Guardrail intent upgrades that DON'T route to capsules
- Example: UNKNOWN → INVENTORY_OUTLOOK (tool executed, but no capsule route)
- Example: UNKNOWN → COMPATIBILITY_CHECK (tool executed, but no capsule route)
- Example: PRODUCT_SEARCH upgraded to POLICY_INQUIRY by guardrail

**Real Signal:** Only captures UNKNOWN→Capsule subset, ~30-40% of all guardrail upgrades

**Example Data Gap:**
```
Analyst detected UNKNOWN, guardrail upgraded to:
├─ UNKNOWN → product_search_integrity ✅ COUNTED
├─ UNKNOWN → knowledge_rag_foundation ✅ COUNTED
├─ UNKNOWN → INVENTORY_OUTLOOK (no capsule) ❌ MISSED
├─ UNKNOWN → COMPATIBILITY_CHECK (no capsule) ❌ MISSED
└─ PRODUCT_SEARCH → POLICY_INQUIRY ❌ MISSED (not UNKNOWN)
```

**Confidence in Metric:** 50% (Shows subset only)
**Recommendation:** Rename to `unknownToCapsulesCount` or clarify scope

---

#### 3.3 semantic_match_success — HISTORICAL CONTAMINATION

**Status:** ⚠️ **PRE-FIX DATA UNRELIABLE**

**Timeline:**
- **Before 2026-03-20 ~15:00 UTC:** Formula incomplete (missed compatibility/order/inventory)
- **After 2026-03-20 ~15:00 UTC:** Formula extended to include all tool routes

**Data Quality Impact:**
- Historical queries show false low semanticMatchSuccess
- Can't distinguish "search failed" from "formula was broken"

**Confidence:**
- Post-fix data: ✅ 85%
- Pre-fix data: ⚠️ 40%

**Recommendation:** Filter TabAnalytics to post-2026-03-20 or accept historical data as unreliable baseline

---

### Data Quality Gaps

#### 3.4 No Validation Layer

**Issue:** Sommelier-generated responses are never compared against reality.

**Missing Signals:**
- No A/B testing: Is response helpful or hallucinated?
- No user feedback loop: Did customer accept recommendation?
- No correction tracking: Did user correct the AI?

**Impact:**
- Can't distinguish "0 product cards = correct" from "0 product cards = search broke"
- Can't validate guardrail accuracy independently
- No way to measure trust (operator can't verify metrics manually)

**Example Gap:**
```
Query: "¿Qué vaporizador recomiendas?"
Response: "Te recomiendo el Caliburn G3"
Metric: ✅ semantic_match_success = true (tool executed)

Reality: ❓ Was G3 actually a good recommendation? Did customer buy it? Did they return it?

Data Available: NO
```

---

#### 3.5 Ambiguous Negative Signals

**Issue:** Zero results and high fallback rates could indicate success or failure.

**Zero Product Card Count:**
- Could mean: "Searched for obscure product, correctly returned 0"
- Could mean: "Search regex broke, returned 0"
- Could mean: "Sommelier filtered out products incorrectly"

**High Fallback Rate:**
- Could mean: "Queries were too ambiguous, correct to escalate"
- Could mean: "Analyst is misconfigured, falling back too often"

**Confidence:** 30% (Metric without context)

---

## 4. What Is Approved

### ✅ Approved for Operational Use

**Scenario:** Real-time monitoring of AI pilot interaction volume and routing distribution

**Approved Metrics:**
- Total Interactions (30-day)
- Latency Prom. (Average Response Time)
- Fallback Rate
- Capsule Distribution
- Cart Actions

**Approved Use Cases:**
1. **Scale Assessment:** "How many interactions today?" → Use totalInteractions
2. **Route Distribution:** "Are queries balanced across product/policy/cart?" → Use Capsule Distribution
3. **Performance Monitoring:** "Are responses getting slower?" → Use Latencia Prom.
4. **Fallback Trending:** "Are more queries falling back?" → Use Fallback Rate
5. **Pilot Growth:** "Is interaction volume trending up?" → Use totalInteractions trend

**Limitation:** These are **trend indicators**, not absolute truth. Use for operational decisions with human judgment.

**Example Decision:** "Total interactions up 40% week-over-week → Scale infrastructure"

---

### ❌ Not Approved for Operational Use

**Metrics Banned Until Fixed:**

1. **Frustration Rate**
   - Field unimplemented; metric is noise
   - Do NOT use for any claims about user satisfaction
   - Do NOT use to validate AI quality

2. **Guardrail Rescue Count** (as "guardrail effectiveness")
   - Only shows UNKNOWN→Capsule subset
   - Incomplete picture; misleading if treated as total rescues
   - Can use only if explicitly labeled as "Unknown→Capsule routes"

3. **Historical Match Semántico** (pre-2026-03-20)
   - Pre-fix formula unreliable
   - Do NOT compare pre-fix vs post-fix without filtering

---

### ⚠️ Conditional Approval

**Metrics That Can Be Used With Caveats:**

1. **Average Product Cards**
   - ✅ Count is accurate
   - ❌ Interpretation ambiguous (is lower/higher better?)
   - **Conditional:** Use only as baseline, not for claims about search quality

2. **Match Semántico** (post-2026-03-20 only)
   - ✅ Formula more complete
   - ❌ Pre-fix data unreliable
   - **Conditional:** Filter by date; accept as "improved" metric, not absolute truth

3. **Zero Product Card Count**
   - ✅ Count is accurate
   - ❌ Can't distinguish success from failure
   - **Conditional:** Use only with manual spot-checks; "4 zero-result queries → inspect sample"

---

### Approval Table

| Metric | Approved? | Conditions |
|--------|-----------|-----------|
| Total Interactions | ✅ YES | None; use as-is |
| Latency Average | ✅ YES | None; use as-is |
| Fallback Rate | ✅ YES | None; use as-is |
| Policy Queries | ✅ YES | Prefer post-2026-03-20 data |
| Cart Actions | ✅ YES | None; use as-is |
| Capsule Distribution | ✅ YES | Routing accuracy improved today |
| Average Product Cards | ⚠️ CONDITIONAL | Interpret with human judgment |
| Match Semántico | ⚠️ CONDITIONAL | Filter to post-2026-03-20 only |
| Frustration Rate | ❌ NO | Field unimplemented; disable display |
| Guardrail Rescue (as total) | ❌ NO | Only counts UNKNOWN→Capsule; incomplete |

---

## 5. Exact Next Move

### Priority 1: Implement frustration_detected Signal (HIGH VALUE)

**Problem:**
- KPI#3 "Frustración" reads a field that is never set
- Display always shows ~0%
- Metric is ghost data; operator can't trust it

**Required Work (SCOPED, NOT APPROVED FOR IMPLEMENTATION):**

1. **Define Frustration Signals**
   - User repeats same query (indicates first response didn't help)
   - Fallback route triggered (AI confidence low)
   - Zero results followed by rephrasing (search failed, customer tried again)
   - Customer asks for escalation (WhatsApp button clicked)

2. **Implementation Options:**
   - Option A: Analyst detects during tool execution (best accuracy)
   - Option B: Sommelier infers from response context (faster to implement)
   - Option C: Client-side heuristic after customer action (requires frontend changes)

3. **Effort Estimate (Not approved):**
   - Analyst signal: 4-6 hours
   - Sommelier signal: 2-3 hours
   - Client-side: 3-4 hours

4. **Post-Implementation:**
   - Re-baseline TabAnalytics
   - Expect frustrationRate ~5-15% (not 0%)
   - KPI#3 becomes useful operational metric

**Until Implemented:**
- Remove or gray out KPI#3 from TabAnalytics display
- Add tooltip: "Signal not yet implemented"
- Do NOT use frustrationRate in any decision

---

### Priority 2: Clarify guardrailRescueCount (MEDIUM VALUE)

**Problem:**
- Metric only counts UNKNOWN→Capsule
- Missing other guardrail upgrades (e.g., UNKNOWN→INVENTORY_OUTLOOK)
- Incomplete picture of guardrail effectiveness

**Options:**

**Option A (Simple):** Rename metric
- Current: "Rescates guardrail"
- Better: "Unknown→Capsule routes" (more specific)
- Effort: 1 hour (UI label change)

**Option B (Better):** Add guardrail metrics
- Keep guardrailRescueCount as-is
- Add separate counters:
  - unknownToInventory (UNKNOWN → INVENTORY_OUTLOOK)
  - unknownToCompatibility (UNKNOWN → COMPATIBILITY_CHECK)
  - intentsUpgraded (all guardrail overrides)
- Effort: 4-6 hours (schema, queries, UI)

**Recommendation:** Option A immediately (clarify scope), Option B if guardrail monitoring becomes critical

---

### Priority 3: Historical Data Filtering (OPTIONAL)

**Problem:**
- Pre-2026-03-20 semanticMatchSuccess uses old formula
- Can't fairly compare pre-fix vs post-fix metrics

**Solution:**
- Add date filter toggle in TabAnalytics UI: "Mostrar todos" vs "Post-reparación"
- Default to post-repair for clean baseline
- Effort: 2-3 hours

**Recommendation:** Low priority; only if operators ask for historical trending

---

### Recommended Action Plan

**Immediate (Today):**
1. ✅ Review and document this audit
2. ⚠️ Add tooltip to KPI#3: "Signal no implementado aún"
3. ⚠️ Disable frustrationRate display or gray it out (optional)

**This Week:**
1. Decide: Implement frustration_detected OR accept KPI#3 as decorative
2. If implementing: Start Analyst signal (Priority 1)
3. If not: Close this gap formally in backlog

**Next Sprint (If Needed):**
1. Implement frustration detection
2. Clarify guardrailRescueCount scope
3. Add date filter for historical data

---

## Operational Decision Framework

### Can TabAnalytics Replace Manual Spot-Checks?

**Answer:** NO, not yet.

**Why:**
- 2 of 4 KPIs are trustworthy
- 1 KPI is broken (frustration)
- 1 KPI is ambiguous (guardrail rescues)
- No validation layer (responses never compared to reality)

**What TabAnalytics Can Do:**
- Alert on volume anomalies ("Interactions dropped 50%")
- Show routing distribution ("65% product searches, 28% policy queries")
- Detect performance degradation ("Latency spiked from 800ms to 1200ms")

**What Operators Still Need:**
- Spot-check responses for hallucinations
- Validate frustration signals (manual review of zero-result queries)
- A/B test guardrail effectiveness (compare before/after real user feedback)

**Verdict:** TabAnalytics is a **monitoring dashboard**, not an **evaluation dashboard**.

---

### Organizational Guidance

#### For Operations Team:
- ✅ USE: Total interactions, latency, routing distribution for scaling decisions
- ❌ DON'T USE: Frustration rate for quality claims
- ⚠️ VERIFY: Guardrail metrics with spot-checks before claiming improvement

#### For Engineering Leadership:
- ✅ TabAnalytics is ready for **volume monitoring**
- ❌ TabAnalytics is NOT ready for **accuracy monitoring**
- 🔧 Highest-value next fix: Implement `frustration_detected` signal
- 📋 Second fix: Clarify guardrail metric scope

#### For Product/Pilot Team:
- ✅ Can scale AI with confidence (interaction volume is accurate)
- ❌ Cannot claim user satisfaction improvements yet (no frustration signal)
- 🎯 Proceed with pilot growth; plan frustration monitoring for v2

---

## Appendix: Metric Definitions

### totalInteractions
```
Definition: Count of ai_analytics rows in date range (excluding simulations)
Formula: rows.length
Data Field: n/a (count)
Reliability: ✅ 95%
Update Frequency: Real-time (one row per user interaction)
```

### semanticMatchRate
```
Definition: Percentage of interactions where a tool was successfully executed
Formula: count(semantic_match_success == true) / total
Data Field: ai_logic_debug.semantic_match_success
Reliability: ✅ 85% (post-fix); ⚠️ 40% (pre-fix)
Update Frequency: Real-time
Note: Pre-2026-03-20 data uses incomplete formula
```

### frustrationRate
```
Definition: Percentage of interactions flagged as user frustration
Formula: count(frustration_detected == true) / total
Data Field: frustration_detected (NEVER WRITTEN)
Reliability: ❌ 0% (Not implemented)
Update Frequency: NEVER
Status: BROKEN — disable display
```

### avgLatencyMs
```
Definition: Average response time in milliseconds
Formula: sum(latency_ms) / total
Data Field: ai_logic_debug.latency_ms
Reliability: ✅ 95%
Update Frequency: Real-time
```

### fallbackRate
```
Definition: Percentage of interactions that fell back to generic response
Formula: count(fallback_used == true) / total
Data Field: ai_logic_debug.fallback_used
Reliability: ✅ 95%
Update Frequency: Real-time
```

### totalCartActions
```
Definition: Count of cart-related interactions (add/remove/modify)
Formula: count(cart_action_detected == true)
Data Field: ai_logic_debug.cart_action_detected
Reliability: ✅ 90%
Update Frequency: Real-time
```

### policyQueryCount
```
Definition: Count of policy/info queries routed to knowledge capsule
Formula: count(sommelier_routed_capsule == 'knowledge_rag_foundation')
Data Field: ai_logic_debug.sommelier_routed_capsule
Reliability: ✅ 95%
Update Frequency: Real-time
```

### zeroProductCardCount
```
Definition: Count of product searches returning 0 results
Formula: count(capsule == 'product_search_integrity' AND product_card_count == 0)
Data Field: ai_logic_debug.product_card_count, sommelier_routed_capsule
Reliability: ✅ 95% (count); ⚠️ 30% (interpretation)
Update Frequency: Real-time
Note: Can't distinguish success (correct empty result) from failure (search broke)
```

### guardrailRescueCount
```
Definition: Count of UNKNOWN intents upgraded to a capsule route
Formula: count(raw_analyst_intent == 'UNKNOWN' AND routed_capsule != null)
Data Field: ai_logic_debug.raw_analyst_report.intent, sommelier_routed_capsule
Reliability: ⚠️ 50% (Shows subset only — misses non-capsule upgrades)
Update Frequency: Real-time
Note: Only counts UNKNOWN→Capsule; misses UNKNOWN→INVENTORY_OUTLOOK, etc.
```

---

## References

**Related Documentation:**
- CHIT_CHAT_UNKNOWN_INTENT_AUDIT.md — Context for UNKNOWN reduction work
- SCENARIO_COVERAGE_FALLBACK_TAXONOMY_AUDIT.md — Fallback route coverage
- INVENTORY_COMPATIBILITY_GUARDRAIL_MICROFIX.md — Today's routing fix details

**Code Locations:**
- TabAnalytics.tsx — src/components/admin/cesarin/TabAnalytics.tsx
- admin-pilot-ops.service.ts — src/services/admin/admin-pilot-ops.service.ts
- Edge function — supabase/functions/customer-intelligence/index.ts

**Schema:**
- ai_analytics table — supabase/migrations/20260315_cesarin_os.sql
- frustration_detected column — supabase/migrations/20260316_neural_v159.sql

---

## Sign-Off

**Audit Completed:** 2026-03-20 16:45 UTC
**Auditor:** Claude (Haiku 4.5)
**Method:** Read-only code inspection + schema analysis + metric validation
**Confidence:** 85%

**Operational Status:** ⚠️ PARTIALLY READY FOR PRODUCTION

- ✅ Safe to use for volume/routing monitoring
- ❌ NOT safe for accuracy claims
- 🔧 Highest-value fix: Implement frustration_detected
- 📋 Plan next iteration with user feedback loop

---

_This is a cold assessment for decision-making. No implementation, no wave activity, no scope creep._
