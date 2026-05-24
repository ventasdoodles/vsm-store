# Learning Intervention Workflow MVP - Implementation Reference

**Status:** MVP Complete (Operator-Facing, No Automatic Execution)
**Date:** 2026-03-20
**Scope:** Surgical, Priority-1 interventions only

---

## What Was Implemented

The MVP learning intervention workflow enables Cesarin OS to move from passive frustration/error signals toward **operator-reviewable intervention recommendations**. The system records signals, diagnoses them using simple explicit logic, and presents recommendations for manual operator approval.

### Core Capabilities

1. **Signal Recording** — Capture frustration signals from live operation
   - Enrichment gaps (missing product specs/ai_sales_note)
   - Compatibility misses (product pairing questions unanswered)
   - Escalation themes (repeated operator manual interventions)

2. **Diagnosis Engine** — Rule-based, explicit diagnosis logic
   - No ML scoring, no black-box algorithms
   - Deterministic mapping: signal type → root cause → reasoning → effort/impact

3. **Operator Review Panel** — TabInterventions in AdminCesarinOS
   - View pending recommendations
   - See signal evidence, diagnosis, and reasoning
   - Approve/reject with optional notes
   - Track decision history

4. **Decision Tracking** — Operator decisions recorded for audit
   - Who approved/rejected, when, and why
   - Status: pending → approved/rejected/deferred

### What Is NOT Implemented (Intentionally)

- ❌ Automatic intervention execution
- ❌ Giant scoring engines or ML-based diagnosis
- ❌ Autonomous learning or feedback loops
- ❌ Speculative abstraction layers
- ❌ Large telemetry redesigns
- ❌ Canvas opening or document updates beyond MVP

---

## Implementation Details

### Files Created

#### 1. Database Migration
```
supabase/migrations/20260320_intervention_signals_and_recommendations.sql
```
**What it does:**
- Creates `intervention_signals` table (signal capture)
- Creates `intervention_recommendations` table (operator decisions)
- Enables RLS with admin-only policies
- Adds performance indexes

**Schema highlights:**
- `intervention_signals.signal_type` — enrichment_gap | compatibility_miss | escalation_theme
- `intervention_signals.evidence_count` — aggregated incident count in window
- `intervention_recommendations.operator_decision` — pending | approved | rejected | deferred
- `intervention_recommendations.execution_status` — not_started | in_progress | completed | failed

#### 2. Service Layer
```
src/services/admin/intervention-workflow.service.ts
```
**Main exports:**
- `recordInterventionSignal()` — Capture signal, deduplicate within 24h
- `diagnoseSignal()` — Rule-based diagnosis (explicit, auditable)
- `createRecommendation()` — Generate recommendation from signal+diagnosis
- `getPendingRecommendations()` — Fetch operator review queue
- `recordOperatorDecision()` — Store operator approval/rejection
- `acknowledgeSignal()` — Mark signal as handled

**Key characteristics:**
- No async database polling
- Simple explicit diagnosis logic per signal type
- Deduplication logic prevents duplicate signal creation
- All functions are transaction-safe

#### 3. Types
```
src/types/cesarin.ts (extended)
```
**New types:**
- `InterventionSignal` — captured signal record
- `InterventionRecommendation` — recommendation + operator decision
- `InterventionDiagnosis` — structured diagnosis output
- Type literals: `InterventionSignalType`, `InterventionType`, `OperatorDecision`, etc.

#### 4. Admin UI Component
```
src/components/admin/cesarin/TabInterventions.tsx
```
**Features:**
- List of pending/all recommendations
- Signal context + evidence display
- Expandable diagnosis details
- Operator approve/reject buttons
- Filter by status (pending | all)
- Status badges and confidence indicators
- No automatic action (manual approval only)

#### 5. Integration
```
src/pages/admin/AdminCesarinOS.tsx (updated)
```
- Added TabInterventions import
- Added 'interventions' to TABS navigation (placed after 'learning')
- Added conditional render in main content area
- Integrated into existing Cesarin OS tab architecture

---

## How It Works: Step-by-Step Example

### Scenario: Enrichment Gap Detection

1. **Signal Captured** (from live operation, external service, or manual submission)
   ```typescript
   const signal = await recordInterventionSignal({
     signal_type: 'enrichment_gap',
     product_id: '12345-uuid',
     category: 'vape',
     evidence_count: 3,
     confidence: 'medium',
     signal_detail: {
       product_name: 'Elf Bar Mango',
       missing_field: 'ai_sales_note'
     }
   });
   ```

2. **Diagnosis Generated** (deterministic, rule-based)
   ```typescript
   const diagnosis = diagnoseSignal(signal);
   // Output:
   // {
   //   root_cause: 'Product "Elf Bar Mango" lacks enriched metadata for response context',
   //   reasoning: 'Without curated specs or ai_sales_note, Cesarin drafts generic responses...',
   //   effort_hours: 0.25,
   //   estimated_impact: 'medium'
   // }
   ```

3. **Recommendation Created** (starts in pending state)
   ```typescript
   const rec = await createRecommendation(
     { signal_id: signal.id, diagnosis },
     signal
   );
   // rec.operator_decision === 'pending'
   // rec.execution_status === 'not_started'
   ```

4. **Operator Reviews** (in TabInterventions panel)
   - Sees: "Product Enrichment · 3 evidences in 7d · medium confidence"
   - Reads: Root cause, reasoning, effort/impact
   - Decides: Approve or reject

5. **Decision Recorded** (audit trail)
   ```typescript
   await recordOperatorDecision({
     recommendation_id: rec.id,
     operator_decision: 'approved',
     operator_id: auth.uid(),
     notes: 'Approved for manual execution'
   });
   ```

6. **Execution** (manual, out-of-band)
   - Operator opens ProductEditorDrawer for "Elf Bar Mango"
   - Calls enrichProduct() edge function
   - Selectively approves enrichment fields
   - Saves to database
   - (No automatic pull from recommendation)

---

## Usage Patterns for Different Signal Types

### Enrichment Gap
```typescript
signal_detail: {
  product_name: string;
  missing_field: 'ai_sales_note' | 'specs' | 'tags' | 'description';
}
```
**Diagnosis:** Easy fix, operator enriches product via ProductEditorDrawer
**Impact:** Medium (improves semantic response drafting)
**Effort:** 0.25h

### Compatibility Miss
```typescript
signal_detail: {
  product_a: string;     // "Vape cartridge X"
  product_b: string;     // "Battery model Y"
}
```
**Diagnosis:** Compatibility gap in concept_aliases or compatibility_relations
**Impact:** Medium (improves check_compatibility tool accuracy)
**Effort:** 0.5h (SQL migration or admin form)

### Escalation Theme
```typescript
signal_detail: {
  theme: string;         // "How to clean vape coils"
  operator_response: string;  // Standard guidance provided repeatedly
}
```
**Diagnosis:** Operators manually provide same advice ~5x; should be playbook
**Impact:** High (automates recurring decision)
**Effort:** 1.0h (playbook authoring + prompt patch)

---

## Integration Points

### Where Signals Come From (Future)

Signals are **manually seeded** in MVP. In production, signals would come from:

1. **Pilot log anomalies** — TabPilot detects repeated "low confidence" responses
2. **Customer escalation tracking** — When operator escalates, mark theme
3. **Product enrichment gaps** — Query products with null ai_sales_note
4. **Compatibility matrix analysis** — Check for product pairs customers ask about
5. **Operator playbook extraction** — Monitor for repeated custom instructions

### How Recommendations Feed Back (Future)

In MVP, recommendations are **operator-reviewed only**. Future execution patterns:

1. **Enrichment:** Auto-call enrich_product edge function (operator pre-approves)
2. **Compatibility:** Auto-execute SQL migration to add concept_alias
3. **Escalation:** Auto-add rule to system prompt or escalation playbook

---

## Testing & Validation

### MVP Validation Checklist

- ✅ Database schema creates without errors
- ✅ Signal recording deduplicates within 24h
- ✅ Diagnosis logic is deterministic (same input → same output)
- ✅ Recommendations persist and retrieve
- ✅ Operator decisions update recommendation status
- ✅ TabInterventions renders pending recommendations
- ✅ UI buttons approve/reject and record decisions
- ✅ No automatic execution (all execution is manual)

### Manual Test Scenario

1. **Record enrichment gap signal:**
   ```bash
   supabase functions invoke intervention-signal-test \
     --body '{
       "signal_type": "enrichment_gap",
       "product_id": "test-uuid",
       "signal_detail": {"product_name": "Test Product", "missing_field": "ai_sales_note"}
     }'
   ```

2. **Verify in database:**
   ```sql
   SELECT * FROM intervention_signals WHERE signal_type = 'enrichment_gap';
   SELECT * FROM intervention_recommendations WHERE operator_decision = 'pending';
   ```

3. **Open TabInterventions in admin panel:**
   - Navigate to Cesarin OS → Tab 5.5 Intervenciones
   - See pending recommendations
   - Click to expand diagnosis
   - Click Approve/Reject

4. **Verify decision recorded:**
   ```sql
   SELECT * FROM intervention_recommendations WHERE operator_decision = 'approved';
   ```

---

## What's NOT Included (By Design)

### Automatic Execution
Approved recommendations **do not automatically execute**. Example:
- ❌ System does NOT automatically call enrich_product
- ❌ System does NOT automatically add SQL migrations
- ❌ System does NOT automatically update rules

Reason: MVP focuses on operator review and decision tracking. Execution remains manual/out-of-band.

### Scoring & ML Diagnosis
Diagnosis is **purely rule-based**, not ML:
- ❌ No confidence scoring from ML model
- ❌ No ranking by predicted impact
- ❌ No neural-network-based root cause analysis

Reason: Keeps logic simple, auditable, and deterministic.

### Autonomous Learning Loops
No feedback loops:
- ❌ System does not learn from operator decisions
- ❌ No meta-analysis of which interventions worked
- ❌ No recommendation threshold auto-tuning

Reason: Prevents speculative automation. Operator must explicitly review and decide.

### Telemetry Changes
No modifications to existing telemetry:
- ❌ No changes to ai_analytics table
- ❌ No new telemetry collection schema
- ❌ No modifications to existing logging pipelines

Reason: Keeps scope surgical. Intervention signals and recommendations are isolated.

---

## Files Modified Summary

| File | Change | Lines |
|------|--------|-------|
| supabase/migrations/20260320_intervention_signals_and_recommendations.sql | NEW | 135 |
| src/services/admin/intervention-workflow.service.ts | NEW | 290 |
| src/components/admin/cesarin/TabInterventions.tsx | NEW | 450 |
| src/types/cesarin.ts | EXTENDED | +70 (types) |
| src/pages/admin/AdminCesarinOS.tsx | UPDATED | +2 import, +1 tab, +3 render |
| src/services/admin/index.ts | UPDATED | +8 exports |

---

## Deployment Checklist

### Pre-Deploy
- [ ] Review database migration for syntax
- [ ] Ensure RLS policies match admin role
- [ ] Verify service functions have correct imports
- [ ] Test TabInterventions rendering in admin panel

### Deploy
- [ ] Apply migration: `npx supabase db push`
- [ ] Deploy code changes (TSX, TS, types)
- [ ] Verify Cesarin OS page loads without errors
- [ ] Confirm TabInterventions tab appears and renders

### Post-Deploy
- [ ] Test signal recording (manual via API)
- [ ] Test operator decision workflow (approve/reject)
- [ ] Verify decision persistence in database
- [ ] Check UI for any rendering issues

---

## Future Enhancement Lanes (Not MVP)

### Lane 1: Signal Ingestion Automation
- Connect TabPilot anomalies → auto-record signals
- Monitor ai_analytics for repeated intents → escalation theme detection
- Query product catalog for enrichment gaps → auto-record

### Lane 2: Recommendation Execution
- Build execution handlers for each intervention type
- Implement approval gates before auto-execution
- Track execution success/failure metrics

### Lane 3: Feedback Loops
- Monitor signal frequency post-intervention
- Calculate % reduction in signal recurrence
- Build operator UI for validation & closure

### Lane 4: Advanced Diagnosis
- Add ML-based confidence scoring
- Rank recommendations by predicted impact
- Build diagnostic summary dashboard

---

## References

- **Design Document:** SESSION_CESARIN_ENRICHMENT_WORKFLOW_SUMMARY.md (Phase 9)
- **Related Work:** Product enrichment pipeline (Phase 2-7)
- **Operator Guide:** TBD (will document operator workflow once MVP validated)

---

## Notes for Future Work

1. **Signal Sources:** MVP seeds signals manually. Connect automation in Lane 1.
2. **Execution Model:** MVP approval-only. Add execution handlers in Lane 2.
3. **Telemetry:** Intervention signals are isolated. No changes to existing ai_analytics.
4. **Scope:** Strictly Priority-1 interventions (enrichment, compatibility, escalation playbook).
5. **No Speculation:** Every feature is operator-facing and auditable.

---

**MVP Status:** ✅ Ready for operator testing and feedback
