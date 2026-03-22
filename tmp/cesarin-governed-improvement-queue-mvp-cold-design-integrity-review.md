# 1. WHAT MUST BE REUSED VS WHAT MUST NOT BE DUPLICATED

- Reuse `ai_analytics` + Pilot Ops as the canonical evidence origin. The queue must start from real reviewed live turns, not from copied ticket text.
- Reuse `ai_evaluations` as the canonical operator judgment record for a turn. The queue must not duplicate score, primary tag, secondary tags, severity, expected outcome, or evaluator commentary as a second editable truth.
- Reuse the existing Review Drawer as the evaluation entrypoint. The queue should consume its output, not create a parallel “review” form elsewhere.
- Reuse `intervention_signals` / `intervention_recommendations` if the MVP needs queue-like workflow state. Creating a second pending-work table beside interventions would be the highest-risk duplication in the lane.
- Reuse `TabInterventions` or turn it into the governed queue surface. Do not keep one list for “recommendations” and another list for “improvement items” if both mean operator work.
- Reuse `TabRules`, `TabKnowledge`, and `TabConcepts` as execution surfaces. The queue should route into them; it should not reimplement rule editing, knowledge editing, or compatibility editing.
- Reuse existing downstream entities as execution artifacts.
  Rules work should resolve to an `ai_rules` record.
  Knowledge work should resolve to a `store_knowledge` chunk or product-enrichment update.
  Compatibility work should resolve to `concept_aliases` / `compatibility_relations`.
- `TabLearning` must not remain a parallel intake path once the queue exists. Today it is only a convenience jump into Rules; if the new MVP lands, that surface should not compete as a second unofficial backlog.
- The queue must not duplicate observability state already present in Pilot Ops. Route/capsule/fallback/semantic/card context can be referenced or snapshotted for convenience, but Pilot Ops remains the telemetry truth.

# 2. MINIMUM TRACEABILITY REQUIREMENTS

- Every improvement item must preserve the source interaction reference: `ai_analytics.id`.
- Every improvement item must preserve the source evaluation reference: `ai_evaluations.analytics_id` or equivalent direct link to the 1:1 evaluation row.
- Every improvement item must preserve immutable evidence context sufficient for review:
  user query,
  Cesarin response text,
  reviewed-at timestamp,
  detected intent,
  routed capsule,
  fallback/rescue/semantic/card context.
- Every improvement item must preserve the operator judgment that caused routing:
  primary tag,
  severity,
  expected outcome,
  evaluator identity,
  decision timestamp.
- Every improvement item must preserve a single declared target lane:
  `rule`,
  `knowledge`,
  `compatibility/concepts`,
  `commerce` only when directly relevant,
  or `defer/no_action` if intentionally not routed.
- Every improvement item must preserve ownership and lifecycle state:
  who accepted it,
  current status,
  when it moved,
  and whether it is still pending, in execution, completed, or validated.
- Every improvement item must preserve the downstream execution artifact reference. “Fixed manually” is not enough.
  A rule item should link to the rule id.
  A knowledge item should link to the chunk/product artifact updated.
  A compatibility item should link to the relation/alias/concept artifact changed.
- Every improvement item must preserve post-fix validation evidence. Closing the item should require a validation pointer, not only a human note.
- Every improvement item must preserve explicit governance language: operator-reviewed, operator-approved, no autonomous learning implied.

# 3. WHAT WOULD MAKE THE QUEUE MVP ACTUALLY USEFUL

- It must become the single canonical inbox for governed follow-up work from reviewed live evidence.
- It must collapse review output into a next action, not merely store a diagnosis. The operator should be able to see “why this exists” and “where it goes next” immediately.
- It must be lane-aware. A `knowledge_gap` should route to knowledge work, a `compatibility_gap` to concepts/compatibility, and a behavioral failure like `false_certainty` or `missing_followup` to rules/playbook work.
- It must avoid one-ticket-per-turn spam. Useful queue behavior requires clustering or deduping repeated reviewed failures into manageable items, or the MVP will become noise.
- It must deep-link or pre-scope the downstream action surface. If the queue item still forces the operator to manually re-search the target in another tab, the closure gain is weak.
- It must keep queue state and execution state together. “Approved” without “artifact created/updated” is not useful closure.
- It must make validation visible. A useful queue shows whether the fix is merely proposed, actually applied, and then validated against later evidence.

Signals that would prove the MVP is closing the loop instead of storing tickets:

- reviewed evaluations are actually producing queue items tied to real live evidence;
- queue items are being resolved into real runtime artifacts, not only notes;
- closed items have linked execution artifacts plus validation records;
- the same reviewed failure pattern appears less often after closure;
- operators stop using ad hoc manual jumps as the main way to translate evaluation into change.

# 4. MAIN STRUCTURAL RISKS / FRAGMENTATION RISKS

- Highest duplication risk: creating a new improvement-item entity while keeping `intervention_recommendations` active as a separate pending list.
- Second-highest duplication risk: copying evaluation fields into queue rows and letting them diverge from `ai_evaluations`.
- Third-highest duplication risk: leaving `TabLearning` alive as an unofficial backlog while the new queue also routes rule work.
- A major governance risk is allowing items to be closed at “acknowledged” or “approved” without a linked runtime artifact.
- Another major governance risk is allowing downstream edits to happen with no backlink to the originating evaluation. That would break auditability and make the queue ceremonial.
- There is a real risk of routing ambiguity. Some tags can map to more than one lane, but the MVP must force one accountable next lane instead of spreading one issue across multiple lists.
- There is a real risk of admin-shell bloat. If the MVP ships as one more passive list, the operator will still bounce among Pilot, Review, Learning, Interventions, Rules, Knowledge, and Concepts with no single canonical workflow.
- There is a real risk of false “learning” claims. If the MVP stores tickets but the actual system behavior changes only after a human edits rules/knowledge/concepts, the language and statuses must reflect supervised improvement, not autonomous adaptation.
- There is a real risk of unbounded queue growth if every low-severity evaluation becomes an item. The MVP needs triage discipline or it will become another archive.

# 5. A COLD-REVIEW CHECKLIST FOR ANTIGRAVITY’S UPCOMING IMPLEMENTATION

- Does the queue originate from reviewed live evidence and `ai_evaluations`, not from a separate manual intake?
- Is `ai_evaluations` still the only editable source of score/tags/severity/expected outcome?
- Is there only one canonical pending-work surface after the MVP lands, rather than parallel queue + interventions + learning lists?
- Does each item carry both `ai_analytics.id` and evaluation linkage?
- Does each item declare exactly one target lane and one accountable next action?
- Does each item deep-link or pre-scope the downstream execution surface?
- Does the design avoid duplicating rule editors, knowledge editors, and compatibility editors?
- Does the item stay open until a real downstream artifact id is attached?
- Does the item require validation evidence before final closure?
- Can an operator audit, from any closed item, which live turn caused it, who reviewed it, what artifact changed, and how closure was validated?
- Are repeated reviewed failures deduped or clustered so the queue remains operationally usable?
- Are statuses worded in a governance-safe way that does not imply autonomous learning?
- If `TabInterventions` remains, is it clearly the same queue or a subordinate view of the same records, not a competing workflow?
- If `TabLearning` remains, is it demoted to helper UX rather than a second backlog?
- Would an operator using the MVP need fewer cross-tab manual jumps than today? If not, the implementation is not structurally worthwhile.

# 6. FILES INSPECTED

- [src/components/admin/cesarin/ReviewDrawer.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/ReviewDrawer.tsx)
- [src/components/admin/cesarin/PilotTelemetry.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx)
- [src/components/admin/cesarin/TabPilot.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabPilot.tsx)
- [src/components/admin/cesarin/TabInterventions.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabInterventions.tsx)
- [src/components/admin/cesarin/TabLearning.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabLearning.tsx)
- [src/components/admin/cesarin/TabRules.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabRules.tsx)
- [src/components/admin/cesarin/TabKnowledge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabKnowledge.tsx)
- [src/components/admin/cesarin/TabConcepts.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabConcepts.tsx)
- [src/pages/admin/AdminCesarinOS.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/admin/AdminCesarinOS.tsx)
- [src/services/admin/admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts)
- [src/services/admin/admin-eval.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-eval.service.ts)
- [src/services/admin/intervention-workflow.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/intervention-workflow.service.ts)
- [src/services/admin-knowledge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin-knowledge.service.ts)
- [src/services/admin-compatibility.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin-compatibility.service.ts)
- [supabase/migrations/20260319_human_evaluation_loop.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260319_human_evaluation_loop.sql)
- [supabase/migrations/20260320_intervention_signals_and_recommendations.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_intervention_signals_and_recommendations.sql)
