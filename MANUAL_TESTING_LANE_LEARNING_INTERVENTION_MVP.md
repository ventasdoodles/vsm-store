# MANUAL TESTING LANE — Learning Intervention Workflow MVP

**Objective:** Validate operator-facing intervention recommendation system (read/approve/reject workflow only)
**Scope:** Admin-only TabInterventions component + service layer read/update operations
**Date:** 2026-03-20
**Status:** Ready for manual operator trial
**Testable Scope:** MVP UI flow only (signal seeding manual; INSERT functions out of scope)

---

## 1. WHAT SHOULD BE TESTED

### In Scope (MVP Testing)
- ✅ Tab navigation and visibility in AdminCesarinOS
- ✅ Empty state rendering (no recommendations)
- ✅ Pending recommendations list display
- ✅ Full recommendations list display
- ✅ Status badges and signal-type coloring
- ✅ Confidence indicators (high/medium/low)
- ✅ Expandable diagnosis card details
- ✅ Operator decision buttons (Approve / Reject)
- ✅ Operator notes input and persistence
- ✅ Toast notifications (success on save, error on failure)
- ✅ Null-guard error handling (failed mutations show error toast, not false success)
- ✅ Filter switching: Pending ↔ All Recommendations
- ✅ Data persistence after page refresh
- ✅ Network error / mutation failure behavior

### Out of Scope (Not MVP)
- ❌ Signal ingestion from live operation (manual seeding only)
- ❌ INSERT operations (recordInterventionSignal, createRecommendation)
- ❌ Autonomous signal producers or backend integration
- ❌ Recommendation execution / out-of-band manual execution workflows
- ❌ Performance at >1000 row scale
- ❌ Production deployment readiness

---

## 2. TEST PREREQUISITES

### Environment Setup
- [ ] Code deployed to staging environment (commit a28ec1e)
- [ ] Supabase migration `20260320_intervention_signals_and_recommendations.sql` applied to staging DB
- [ ] Operator has admin-level access to Cesarin OS
- [ ] Browser console available for debugging (optional)

### Seed Data Requirements
**Manually insert test rows into staging DB (via SQL or admin panel if available):**

```sql
-- Test Signal #1: enrichment_gap
INSERT INTO intervention_signals
  (id, signal_type, product_id, category, evidence_count, evidence_window_days, confidence, signal_detail, status, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'enrichment_gap', 'product-uuid-1', 'metadata', 3, 7, 'high',
   '{"product_name": "Elf Bar Mango", "missing_field": "ai_sales_note"}', 'pending', now());

-- Test Signal #2: compatibility_miss
INSERT INTO intervention_signals
  (id, signal_type, product_id, category, evidence_count, evidence_window_days, confidence, signal_detail, status, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'compatibility_miss', NULL, 'product_link', 5, 14, 'medium',
   '{"question": "Can I use cartridge X with battery Y?", "products_involved": ["cartridge-X", "battery-Y"]}', 'pending', now());

-- Test Signal #3: escalation_theme
INSERT INTO intervention_signals
  (id, signal_type, product_id, category, evidence_count, evidence_window_days, confidence, signal_detail, status, created_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'escalation_theme', NULL, 'operator_guidance', 5, 30, 'high',
   '{"theme": "coil cleaning instructions", "escalation_count": 5}', 'pending', now());

-- Create matching recommendations
INSERT INTO intervention_recommendations
  (id, signal_id, intervention_type, rank, diagnosis, operator_decision, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'enrichment', 1,
   '{"root_cause": "Product lacks enriched metadata", "reasoning": "Without specs/ai_sales_note, responses are generic", "effort_hours": 0.25, "estimated_impact": "medium"}',
   'pending', now());

INSERT INTO intervention_recommendations
  (id, signal_id, intervention_type, rank, diagnosis, operator_decision, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'compatibility', 1,
   '{"root_cause": "Products not linked in compatibility graph", "reasoning": "check_compatibility tool finds no relation", "effort_hours": 0.5, "estimated_impact": "medium"}',
   'pending', now());

INSERT INTO intervention_recommendations
  (id, signal_id, intervention_type, rank, diagnosis, operator_decision, created_at)
VALUES
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'escalation_playbook', 1,
   '{"root_cause": "Repeated escalation pattern: coil cleaning", "reasoning": "5 instances of operator creating same guidance", "effort_hours": 1.0, "estimated_impact": "high"}',
   'pending', now());
```

**After seeding:** Operator should be ready to access TabInterventions and see 3 pending recommendations.

---

## 3. EXACT TEST CASES

### A. TAB VISIBILITY & NAVIGATION

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **A.1: Tab appears in nav** | 1. Open AdminCesarinOS<br>2. Look for "5.5 Intervenciones" tab<br>3. Verify Zap icon present | Tab visible, correctly labeled, no render errors |
| **A.2: Tab switch (from other tab)** | 1. Open AdminCesarinOS<br>2. Click any other tab (Analytics, etc.)<br>3. Click "Intervenciones" tab | TabInterventions renders without layout shift, no console errors, content loads |
| **A.3: Tab switch (back and forth)** | 1. Click "Intervenciones"<br>2. Click another tab<br>3. Click "Intervenciones" again | Data still present, no duplicate renders, state consistent |

---

### B. EMPTY STATE BEHAVIOR

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **B.1: Empty pending list** | 1. Delete all pending rows from DB (UPDATE set status='closed')<br>2. Open TabInterventions<br>3. Leave filter on "Pendientes" | Empty state message displayed (e.g., "No pending recommendations"), no spinner loop, no error toast |
| **B.2: Empty all list** | 1. Delete all intervention_recommendations rows<br>2. Switch to "Todas" filter | Empty state message displayed, not a false "all recommendations" fallback |

---

### C. LIST RENDERING WITH SEEDED DATA

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **C.1: Pending list displays 3 rows** | 1. Seed 3 recommendations (all status='pending')<br>2. Open TabInterventions<br>3. Filter set to "Pendientes (3)" | Exactly 3 rows visible, no duplicates, correct order (newest first or per DB ordering) |
| **C.2: Signal type badges** | 1. View seeded recommendations<br>2. Check visual badges | enrichment_gap → violet, compatibility_miss → blue, escalation_theme → pink (or per design) |
| **C.3: Confidence indicators** | 1. View seeded recommendations (2x high, 1x medium)<br>2. Check confidence badge color | high → green, medium → amber, low → orange (or per design); all 3 visible correctly |
| **C.4: Status badge** | 1. View each recommendation row<br>2. Check status display | Status shows "pending" (amber), correct for all rows |
| **C.5: Expandable diagnosis card** | 1. Click first recommendation row<br>2. Verify expansion<br>3. Check diagnosis fields | Card expands smoothly, shows root_cause, reasoning, effort_hours, estimated_impact; no missing fields |
| **C.6: All recommendations list** | 1. Filter set to "Todas"<br>2. View list | All 3 rows visible (same as pending for now), count correct |

---

### D. FILTERING BEHAVIOR

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **D.1: Switch Pending → All** | 1. Start on "Pendientes (3)"<br>2. Click "Todas" button | List updates, still shows 3 rows, no spinner stall |
| **D.2: Switch All → Pending** | 1. View "Todas" (3 rows)<br>2. Click "Pendientes (3)" | List updates to pending only, no data loss |
| **D.3: Filter persists after action** | 1. Set filter to "Todas"<br>2. Approve a recommendation<br>3. Check filter state | Filter stays on "Todas", recommendation now shows "approved" status (if visible) |
| **D.4: Empty result stays empty** | 1. Create 2 recommendations with signal_type='enrichment_gap'<br>2. Create 1 with 'compatibility_miss'<br>3. If signal_type filter exists, filter by 'escalation_theme'<br>4. Result should be empty | Returns 0 rows, NOT all 3 recommendations (regression test for cold-review Issue #3) |

---

### E. DECISION WORKFLOW

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **E.1: Approve without notes** | 1. Open expanded recommendation<br>2. Click "Approve" button<br>3. Leave notes empty | Success toast appears: "Recommendation approved. Manual execution required." (or per message)<br>DB updated: operator_decision='approved', operator_id set, operator_decision_at timestamp set<br>Status badge changes to green/checked |
| **E.2: Approve with notes** | 1. Open expanded recommendation<br>2. Enter notes: "Enrich product metadata in ProductEditor"<br>3. Click "Approve" | Success toast appears<br>DB updated: operator_notes saved correctly<br>Notes visible in row after approval (if UI supports) |
| **E.3: Reject without notes** | 1. Open recommendation<br>2. Click "Reject" button<br>3. Leave notes empty | Success toast: "Recommendation rejected"<br>DB updated: operator_decision='rejected', operator_id set, operator_decision_at timestamp<br>Status badge changes to red/X |
| **E.4: Reject with notes** | 1. Open recommendation<br>2. Enter notes: "Already fixed in v114"<br>3. Click "Reject" | Success toast appears<br>DB updated: operator_notes saved<br>Rejection persists after refresh |
| **E.5: Deferred (if supported)** | 1. Open recommendation<br>2. Look for "Defer" or similar button | If button exists: test like E.1; if not, skip this case |
| **E.6: Decision persists after refresh** | 1. Approve a recommendation<br>2. Refresh page (F5)<br>3. Check same recommendation row | Status still shows "approved", notes still visible, no revert to "pending" |

---

### F. ERROR HANDLING (Null Guards)

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **F.1: Simulate failed mutation** | 1. Open recommendation<br>2. Click "Approve"<br>3. Intercept network request or simulate 500 error | Error toast appears: "Failed to save operator decision" (or similar)<br>Page does NOT show success toast<br>DB not updated (decision still 'pending')<br>Row status does not change |
| **F.2: Service returns null** | 1. (Manual in code review if possible)<br>2. Call recordOperatorDecision() with invalid data<br>3. Observe handler response | Handler checks null result, shows error toast, returns early (does not call acknowledgeSignal) |
| **F.3: Multiple rapid clicks** | 1. Click "Approve" twice rapidly<br>2. Observe | Either: request deduplicated, or second request fails gracefully with error (no duplicate DB entries) |

---

### G. DATA INTEGRITY CHECKS

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **G.1: Operator ID persists** | 1. Logged-in operator approves recommendation<br>2. Query DB: SELECT operator_id FROM intervention_recommendations<br>3. Verify correct admin user ID | operator_id matches authenticated user UUID, not NULL, consistent across rows |
| **G.2: Timestamps coherent** | 1. Approve recommendation at time T1<br>2. Query DB: SELECT created_at, operator_decision_at<br>3. Verify operator_decision_at ≥ created_at | operator_decision_at set to current timestamp, later than or equal to created_at |
| **G.3: Notes not truncated** | 1. Approve with long notes (>200 chars)<br>2. Refresh page<br>3. Check notes in UI | Full notes text visible, not truncated or clipped |
| **G.4: Status transition coherent** | 1. Start: operator_decision='pending'<br>2. Approve<br>3. Check: operator_decision='approved' | Only one transition, no intermediate states visible, execution_status remains 'not_started' |

---

### H. NEGATIVE TESTS

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| **H.1: Network timeout** | 1. Slow network (DevTools throttle)<br>2. Click "Approve"<br>3. Wait for timeout | Loading spinner shows, then error toast (not infinite spinner, not silent fail) |
| **H.2: Malformed diagnosis JSON** | 1. Seed recommendation with broken diagnosis JSON<br>2. Open TabInterventions<br>3. Try to expand card | Graceful fallback: "Unable to load diagnosis details" or similar (does not crash UI) |
| **H.3: Missing operator notes field** | 1. Seed recommendation without operator_notes column populated (NULL)<br>2. Approve from UI<br>3. Leave notes empty | Saves successfully, operator_notes remains NULL, no constraint error |
| **H.4: Null signal reference** | 1. Seed recommendation with invalid signal_id (orphaned)<br>2. Open TabInterventions | Either: recommendation still displays (with signal details hidden), or gracefully excluded (not crash) |

---

## 4. EXPECTED RESULTS SUMMARY

### Go Conditions (All Must Pass)
- [ ] Tab renders without errors
- [ ] Empty state shows message (not spinner loop)
- [ ] All 3 seeded recommendations appear in pending list
- [ ] Status badges render with correct colors
- [ ] Expanding cards shows full diagnosis details
- [ ] Approve button saves decision to DB (operator_decision='approved')
- [ ] Reject button saves decision to DB (operator_decision='rejected')
- [ ] Success toast only appears on successful DB update (null-guarded)
- [ ] Error toast appears when mutation fails (no false success)
- [ ] Filter toggle (Pending ↔ All) works without data loss
- [ ] Data persists after page refresh
- [ ] Operator ID and timestamp correctly recorded on decision
- [ ] Notes (if provided) saved and visible after save

### No-Go Conditions (Any Fail = Stop)
- [ ] ❌ Console errors blocking tab render
- [ ] ❌ Success toast shown even when DB mutation failed (false positive)
- [ ] ❌ Filter returning all recommendations when filter should return empty
- [ ] ❌ Data not persisting after refresh
- [ ] ❌ Network errors causing silent failure (no error toast shown)
- [ ] ❌ Null values crashing card expansion
- [ ] ❌ Tab navigation to/from Intervenciones causes other tabs to break

---

## 5. FAIL CONDITIONS & RED FLAGS

| Flag | Impact | Severity | Action |
|------|--------|----------|--------|
| **False success toast on failed mutation** | Operator thinks decision saved; DB not updated | 🔴 HIGH | Stop testing, revert to code review, check null-guard logic |
| **Filter returns all records instead of empty** | Data corruption in operator view, wrong decisions | 🔴 HIGH | Stop testing, cold-review Issue #3 not properly fixed |
| **Data not persisting after refresh** | Operator decisions lost, audit trail broken | 🔴 HIGH | Stop testing, database or service layer issue |
| **Console TypeError/ReferenceError on tab switch** | Component crash, user blocked from feature | 🔴 HIGH | Stop testing, investigate component mount/unmount |
| **Null signal crashes card expansion** | Card won't expand, diagnosis inaccessible | 🟡 MEDIUM | Log issue, test with non-null signals, report in feedback |
| **Spinner infinite loop on empty state** | UX hang, operator stuck | 🟡 MEDIUM | Investigate loading state, may indicate service error |
| **Notes truncated or corrupted** | Audit trail inaccuracy, loss of operator context | 🟡 MEDIUM | Check DB column width, test with different note lengths |
| **Operator ID NULL in DB** | Audit trail incomplete, decision not attributed | 🟡 MEDIUM | Verify auth context available to service, check user session |
| **Timestamp not set on decision** | Audit trail missing, timeline unclear | 🟡 MEDIUM | Check server clock sync, verify NOW() function in mutation |

---

## 6. GO/NO-GO CRITERIA FOR OPERATOR TRIAL USE

### Go (Approved for Trial)
**All conditions met:**
- [ ] Tab renders and navigates without errors
- [ ] All seeded recommendations appear with correct data
- [ ] Operator can approve/reject with notes
- [ ] Decisions persist after page refresh
- [ ] Error handling shows error toast (not silent fail, not false success)
- [ ] Operator ID and timestamp recorded for audit trail
- [ ] Empty state handled gracefully
- [ ] Filter behavior correct (no regression on Issue #3)
- [ ] No console errors blocking workflow

**Operator can proceed to:**
1. Deploy code to staging with live data (if needed)
2. Test with real seeded signals (manually inserted)
3. Gather workflow feedback
4. Iterate on UI/UX if needed
5. Report any bugs found during trial

**Next gates:** Operator acceptance → stakeholder sign-off → decision on production deployment

---

### No-Go (Block Trial)
**Any of these present:**
- [ ] ❌ False success toast (Issue #2 regression)
- [ ] ❌ Filter returning all records (Issue #3 regression)
- [ ] ❌ Data not persisting (DB/service layer failure)
- [ ] ❌ Tab crash or console errors
- [ ] ❌ Null handling crash (audit trail corruption risk)

**Required action:**
1. Revert to code review phase
2. Identify root cause
3. Return to cold-review remediation
4. Re-test when fixes applied
5. Do not proceed to trial until all no-go flags cleared

---

## 7. TEST EXECUTION NOTES

### Tester Role
- **Who:** Operator (admin-level Cesarin OS access)
- **Skill Required:** Familiarity with Cesarin OS UI, basic SQL for seeding (or admin provides seed data)
- **Time Estimate:** ~30–45 minutes to execute full protocol
- **Tools Needed:** Admin panel, DB admin access or SQL script, browser DevTools (optional)

### Seed Data Cleanup (Post-Testing)
- [ ] Delete test seed rows from DB (unless keeping for regression testing)
- [ ] Document any bugs found in separate issue tracker
- [ ] Note any UX feedback for future lanes (not in MVP scope)

### Future Lanes (Out of MVP Scope)
- **Lane 1: Automated Signal Ingestion** — Replace manual seeding; backend connects to live operation
- **Lane 2: Intervention Execution** — Operationalize manual out-of-band approval into automated workflows
- **Lane 3: Feedback Validation** — Post-intervention monitoring to track signal reduction and effectiveness

### Documentation of Results
- [ ] All test case results logged
- [ ] Screenshots of key states (optional but recommended)
- [ ] Any bugs documented with reproduction steps
- [ ] Final decision (Go/No-Go) signed off by operator and stakeholder

---

**Manual Testing Protocol Complete**
**Status:** Ready for operator trial use (post-MVP validation)
**Next Step:** Execute test cases per section 3; report results per section 6 go/no-go criteria.
