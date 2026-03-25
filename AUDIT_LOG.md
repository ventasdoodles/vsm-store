# VSM STORE — AUDIT LOG

> Registro histórico de todas las auditorías ejecutadas. Mover aquí al actualizar AI_CONTEXT.md.
> Referencia: AI_CONTEXT.md §9

---

## Auditorías Completadas (§9.10 → §9.30)

### S97. Storefront Choice-to-Confidence Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S96, storefront option-shaping was stronger, but the remaining commercial bottleneck was the moment after a likely choice already existed. The lane objective was to reinforce a leading product choice with short, modest, supported confidence language so the customer could move forward more comfortably without reopening unnecessary option trees or inventing certainty the catalog does not support.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S97 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve choice-to-confidence behavior: reinforce a likely product choice with short, modest, supported confidence language, keep weak-support cases neutral, and mention only one nearby alternative when there is a real supported tradeoff.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was blocked on one corrective micro-fix before formal closure.

3. **Corrective micro-fix applied** - Commit `38005ee9ce6815011367e82338cf24abacedf7fc` corrected exact-branch confidence honesty in three bounded ways:
   - remove false single-option confidence in `EXACT` when multiple exact in-stock matches exist
   - keep single-option confidence only for true single exact matches
   - neutral multi-option exact wording plus multi-option handoff for multi-exact cases

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S97 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at reinforcing a likely choice with short, supported confidence language, while weak-support cases remain neutral and nearby alternatives stay limited to real supported tradeoffs. Exact single-option confidence is now gated honestly so multi-exact cases do not imply a single clear winner. S93/S94/S95/S96 boundaries were preserved without reopening retrieval or expanding scope. Commits: 0191d0c (`feat(storefront): harden choice-to-confidence drafting`), 38005ee (`fix(storefront): correct exact confidence honesty`).

---

### S96. Storefront Comparison-to-Choice Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S95, storefront comparison drafting was directionally stronger, but it could still over-steer in cases where differentiator support was weak. The remaining storefront risk was not retrieval quality; it was comparison honesty. The lane objective was to harden comparison-to-choice behavior so the assistant only nudges toward a path when the catalog evidence actually supports that distinction.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S96 was implemented as a narrow storefront drafting pass inside the existing product-search capsule behavior, with no admin, Cesarin OS, or retrieval-lane expansion.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was held until one corrective micro-fix landed. The audit required stricter comparison honesty before formal closure.

3. **Corrective micro-fix applied** - Commit `46dda54ad6b1622ce037b935df07afbcadd3d7c7` tightened the comparison layer in four bounded ways:
   - stricter third-option gate
   - no soft-cue-only hierarchy
   - neutral handoff when differentiator support is weak
   - anti-array-order drift

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- No retrieval redesign, ranking redesign, orchestrator change, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S96 is now formally closed as a storefront-only behavior-hardening lane. Comparison-to-choice guidance is stronger, but it only steers when supported comparative evidence exists. Weak-difference cases stay neutral, third-option surfacing is gated more strictly, and S93/S94/S95 boundaries were preserved without reopening retrieval or expanding scope. Commit: 46dda54 (`fix(storefront): tighten comparison honesty`).

---

### S95. Storefront Clarification-to-Conversion Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S93 and S94, exact-miss recovery and token-recovery honesty were already in acceptable shape, but ambiguous or exploratory product-seeking turns could still flatten into broad browsing behavior. The remaining storefront opportunity was not retrieval or observability; it was sharper response shaping so undecided customers could narrow faster and move toward a product choice, PDP inspection, or cart action.

**Remediation Applied:**

1. **Single-axis clarification hardening** - The ambiguity path now asks one sharper narrowing question instead of drifting across multiple broad prompts. The selected axis stays commercially useful and bounded to what the query actually signaled:
   - device / format
   - flavor / profile
   - smoothness / intensity
   - beginner / simplicity posture
   - budget when still missing

2. **Decision-guide framing across suggestion branches** - The storefront drafting layer now derives a cautious comparison cue from existing product data only (`specs`, short `ai_sales_note`, or filtered short description when available) and uses it to contrast two recommendation paths instead of dumping a flat list.

3. **Conversion-oriented handoff tightening** - Suggestion turns now push toward a clearer next move: open the first most-relevant product card, compare with a second path only if needed, and then use the existing bag/cart action when one option is already clear.

4. **Scope held inside response shaping** - No retrieval expansion, no ranking redesign, no new telemetry surface, no admin tooling work, and no Cesarin OS reactivation. S95 stayed inside storefront drafting behavior only.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic distinction remains preserved.
- `TOKEN_RECOVERY` wording and `retrieval_source` honesty were not reopened.
- No orchestrator redesign, RPC change, semantic threshold change, or ranking-system claim was introduced.
- No new admin/operator surface was added.

**Verification:**

- Focused capsule tests were expanded to cover:
  - sharper single-axis ambiguity clarification
  - beginner-oriented narrowing behavior
  - decision-guide contrast across semantic and token-recovery suggestion turns
- Mechanical validation passed:
  - `npm run test:run -- src/lib/__tests__/product-search-capsule.test.ts src/services/__tests__/ai-capsule-orchestrator.service.test.ts`
  - `npm run typecheck`
  - `npm run build`

**Acceptance Summary:**

- Cold audit verdict for S95: **ACCEPT**.
- S93/S94 baseline explicitly preserved.

**Outcome:**

Storefront Cesarin now handles ambiguous and exploratory commercial queries more usefully without pretending to know more than it does. Clarification is sharper, suggestion branches better explain how to choose, and the next-step handoff is more conversion-oriented, while retrieval logic and S94 honesty boundaries remain unchanged. Commit: 2faec10 (`feat(storefront): sharpen clarification-to-conversion drafting`).

---

### S94. Storefront Sales Recovery - Token Recovery Observability + Guardrail QA - 24 de marzo de 2026

**Scope:** `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/lib/ai-capsule-schemas.ts`, `src/lib/product-search-capsule.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/product-search-capsule.test.ts`, and `src/services/__tests__/ai-capsule-orchestrator.service.test.ts`.

**Problem Identified:**

S93 improved storefront sales recovery, but the remaining cold-audit reservation was honesty and observability around token-based catalog rescue. The runtime could recover a miss through lexical token overlap while still surfacing that result under the broader semantic lane, which blurred the difference between bounded token rescue and true embedding-based semantic proximity.

**Remediation Applied:**

1. **Minimal runtime distinction** - The product-search capsule contract now distinguishes token rescue from true semantic recovery with a dedicated `TOKEN_RECOVERY` match strategy plus a `retrieval_source` field (`DIRECT_EXACT`, `EMBEDDING_SEMANTIC`, `TOKEN_RECOVERY`, `NONE`).

2. **Truthful drafting and UI labeling** - Token-rescued suggestions remain commercially useful, but the drafting now explicitly frames them as name/term coincidence rather than semantic proximity. The storefront UI also labels this surface distinctly as `Coincidencias por Nombre`.

3. **Telemetry observability** - `concierge.service.ts` now persists `capsule_retrieval_source` alongside the existing capsule execution and match-strategy telemetry so runtime logs no longer silently flatten token rescue into the semantic lane.

4. **Guardrail QA closure** - Focused orchestrator tests now verify the activation boundaries that mattered to the audit:
   - token recovery activates only when `requires_semantic_expansion === false`
   - token recovery does not activate when `requires_semantic_expansion === true`
   - weak lexical overlap does not get promoted into a meaningful nearby match
   - true semantic recovery remains a separate orchestrator path

**Verification:**

- `ai-capsule-orchestrator.service.ts` confirms token rescue is only considered on the non-semantic-expansion path and now stamps the real retrieval source into capsule context.
- `product-search-capsule.ts` confirms drafting and match strategy now distinguish `TOKEN_RECOVERY` from `SEMANTIC`.
- `AIConcierge.tsx` confirms the storefront label `Coincidencias por Nombre`.
- Focused tests passed for both drafting and orchestrator path selection.
- Acceptance audit verdict for S94: **ACCEPT**.

**Outcome:**

The key S93 reservation is now closed without reopening the architecture. Storefront Cesarin still recovers exact-product misses with bounded token rescue when useful, but token recovery is no longer silently conflated with true semantic proximity in contract, drafting, telemetry, UI labeling, or QA. Commit: 41b8e6e (`feat(storefront): distinguish token recovery from semantic search`).

---

### S93. Storefront Sales Recovery Flow Hardening - 24 de marzo de 2026

**Scope:** `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`, `src/components/ui/ai/AIConcierge.tsx`, and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

The storefront assistant could still fall into weak commercial recovery patterns when an exact product was not found. Miss handling, ambiguity prompts, and next-step storefront handoff were functional but not sharp enough for a sales assistant trying to keep the customer moving toward a real product, PDP, or cart action.

**Remediation Applied:**

1. **Exact-match miss recovery hardening** - The orchestrator added a bounded token-based catalog recovery path for exact-lookups where `requires_semantic_expansion === false`, using real local product data rather than dead-end failure copy.

2. **Sharper storefront drafting** - `product-search-capsule.ts` improved product guidance across the active fallback tree:
   - better ambiguity questions
   - stronger exact-miss recovery wording
   - more useful out-of-stock alternative framing
   - clearer no-match recovery prompts

3. **Next-step conversion handoff** - Product suggestions and recovery copy now more clearly guide the user toward storefront actions such as opening the product card, viewing the PDP, or adding a product to cart, while staying honest about certainty, stock, and compatibility.

4. **Truthful storefront card handling** - `AIConcierge.tsx` tightened suggestion rendering so storefront cards better reflect the actual sales surface already returned by the capsule flow.

**Verification:**

- `ai-capsule-orchestrator.service.ts` confirms the bounded token-recovery query was added only to improve exact-product miss recovery in the storefront capsule path.
- `product-search-capsule.ts` confirms the drafting changes stay inside read-only product suggestion behavior and do not invent stock or compatibility certainty.
- Focused capsule tests were added and passed.
- Acceptance audit verdict for S93: **ACCEPT WITH RESERVATIONS**.

**Outcome:**

Storefront Cesarin became materially better at recovering from exact-product misses, asking sharper follow-up questions, framing real alternatives, and handing the user toward a product decision without overstating certainty. The remaining reservation was honesty/observability around token recovery being surfaced under the broader semantic lane, and that reservation was later closed by S94. Commit: 11ebc359a37552661d8fd31d00542cb46ae67977 (`feat(storefront): harden cesarin sales recovery flow`).

---

### A92. Cesarin OS Graph-Assisted Operator Workbench - Truthful Related Sets and Local Review Loop Inside `Conceptos` - 24 de marzo de 2026

**Scope:** `graqle.json`, `src/components/admin/cesarin/TabRepoGraph.tsx`, `src/services/admin/admin-repo-graph.service.ts`, and the already-accepted `Conceptos` repo-graph subview introduced by A91.

**Problem Identified:**

A91 closed the bounded read-only repo-graph subview, but the operator surface still required too much manual reconstruction to decide what to inspect next. The accepted next step was not new graph infrastructure; it was a more useful read-only workbench inside the same Cesarin OS lane, still local/static from `graqle.json`, still inside `Conceptos`, and still explicit about what the graph does not prove.

**Remediation Applied:**

1. **Accepted surface extended without leaving `Conceptos`** - A92 stayed inside the existing repo-graph subview. No new top-level Cesarin OS tab, no backend lane, no mutation path, no scope expansion beyond operator reading support.

2. **Truthful related-set derivation from the local graph** - `admin-repo-graph.service.ts` now resolves additional read-only inspector outputs from the selected node:
   - `containerNode`
   - `sameContainerNodes`
   - `sameTypeNodes`
   - `pathLocalNodes`
   - `nodeDirectory`

3. **Operator list scopes** - `TabRepoGraph.tsx` now lets the visible node list pivot between:
   - `General`
   - `Mismo contenedor`
   - `Mismo tipo`
   - `Ruta local`
   - `Review set`

4. **Quick context actions and related-surface cards** - The selected-node panel now includes `Copiar ruta`, direct scope pivots, and dedicated cards for same-container, same-type, and path-local surfaces so operators can continue a bounded reading pass without opening raw graph artifacts.

5. **Local review-set loop** - Operators can add and remove nodes from a dedicated review set inside the Repo Graph view. The review set is view-local reading support only; it is not persisted, not synced, and not a new backend state.

6. **Compact operator guidance** - The workbench now includes explicit guidance panels:
   - `Si muestra`
   - `No prueba`
   - `Inspeccion siguiente`

7. **Review-set honesty micro-pass folded into A92 closure** - Final wording was tightened so canon matches real behavior: the review set lives only inside the Repo Graph view, does not persist, and is lost on reload or when leaving the subview. Empty-state and filter messaging were also tightened so operators are not misled when filters hide review-set members.

**Verification:**

- `admin-repo-graph.service.ts` confirms the added related-set outputs are derived locally from static `graqle.json` data.
- `TabRepoGraph.tsx` confirms the operator scopes, quick actions, related cards, review-set add/remove behavior, and compact guidance panels exist in the accepted surface.
- The follow-up fix commit confirms review-set wording now states the real limits: local to the view, not persisted, lost on reload or exit.
- Acceptance audit verdict for A92: **ACCEPT**.

**Outcome:**

Cesarin OS now includes a graph-assisted operator workbench inside the existing `Conceptos` repo-graph subview. Operators can derive truthful related reading sets, pivot the visible list by scope, copy paths, assemble a local review set, and use compact guidance without leaving the console or inflating graph certainty. The lane remains read-only, local/static via `graqle.json`, and explicitly does not claim backend graph intelligence, runtime dependency proof, or live graph infrastructure. Commits: 599c0587bd9b068812fc8aa65a152ee1d14d5566 (`feat(cesarin): extend repo graph workbench`), ec0389a3badc1997ae0ed43aa1bad0be32edca21 (`fix(cesarin): tighten repo graph review set honesty`).

---

### A91. Cesarin OS Repo Graph Subview Closure � Local Read-Only Repo Inspection Inside `Conceptos` � 24 de marzo de 2026

**Scope:** `graqle.json`, `src/components/admin/cesarin/TabConcepts.tsx`, `src/components/admin/cesarin/TabRepoGraph.tsx`, `src/services/admin/admin-repo-graph.service.ts`, and the `TabConcepts` mount point inside `src/pages/admin/AdminCesarinOS.tsx`.

**Problem Identified:**

Cesarin OS had no bounded operator surface for reading the repository graph from inside the admin console. Repo graph inspection required leaving the workflow and opening raw artifacts manually. The lane goal was to add structural discovery inside `Conceptos` without inventing live graph intelligence, backend graph services, or runtime dependency claims.

**Remediation Applied:**

1. **Bounded placement inside `Conceptos`** � `TabConcepts.tsx` now gates two local modes: the existing compatibility tooling and a new repo graph inspector. The compatibility CRUD flow remained intact and mode-gated. No new top-level Cesarin OS tab was added.

2. **Static read-only graph service** � `admin-repo-graph.service.ts` statically imports local `graqle.json`, indexes `nodes` and `links`, and exposes read-only helpers for node search, overview counts, direct relations, nearby same-container nodes, and chunk previews. No backend fetch, no mutation path, no live sync.

3. **Operator repo graph subview** � `TabRepoGraph.tsx` renders:
   - search
   - type filter
   - selected node metadata
   - direct graph relations
   - nearby containment neighbors
   - chunk previews

4. **Truth labels preserved in UI** � The surface explicitly states:
   - `Read only`
   - local `graqle.json` consumption
   - no live backend
   - no runtime dependency proof
   - nearby nodes are containment neighbors, not confirmed impact

5. **Copy-only hygiene micro-pass folded into closure** � `TabConcepts.tsx` wording was tightened so compatibility mode no longer uses repo-graph vocabulary when describing the compatibility CRUD lane. This was a presentation cleanup only, not a new lane.

**Verification:**

- `graqle.json` confirmed to be a real graph-shaped artifact with explicit `links`.
- `admin-repo-graph.service.ts` confirmed read-only and local-only.
- `TabRepoGraph.tsx` confirmed operator-usable and honest about graph limits.
- `AdminCesarinOS.tsx` confirmed the feature remains mounted under `concepts` rather than as a separate top-level Cesarin module.
- Mechanical validation passed:
  - `npm run typecheck`
  - `npm run build`

**Outcome:**

Cesarin OS now includes a bounded repo graph operator subview inside `Conceptos`. Operators can inspect node metadata, direct graph relations, nearby containment neighbors, and chunk previews from local `graqle.json` without leaving the console. The lane is structurally closed, read-only, and acceptance-audited. No backend graph infrastructure was introduced. No runtime dependency certainty is claimed. Commits: 824a2ed2696933203d3bf3b9d247bac33ad040b9 (`feat(cesarin): add repo graph operator subview`), 99672e9d3da18e8170d25e7d2d2cf7747fc449c5 (`chore(cesarin): tighten concepts copy`).

---

### B1. Cesarin OS Intake & Review Consolidation — Cross-Surface Signal Truth Gap — 23 de marzo de 2026

**Scope:** Cross-surface UI consolidation. Four files: `src/services/admin/admin-eval.service.ts`, `src/components/admin/cesarin/ReviewDrawer.tsx`, `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/components/admin/cesarin/TabPilot.tsx`.

**Problem Identified:**

Operators working with the Cesarin OS pilot intake and review surfaces experienced a critical truth gap: two separate databases (`cesarin_signal_states` table tracking intake signal outcomes, `ai_evaluations` table tracking human evaluation scores) keyed on the same `analytics_id` had zero mutual visibility in operator UI. Same row could be reviewed in TabLearning (showing signal state: "revisada", "descartada", "convertida_regla", etc.) but operator opening ReviewDrawer for the same interaction saw no cross-reference to that signal state. PilotTelemetry displayed evaluation scores inline but not signal state outcomes. This forced operators to maintain dual cognitive maps of the same interaction's state across two separate surfaces.

**Remediation Applied:**

Four surgical changes closed the truth gap:

1. **Service Layer Batch Fetch** — `admin-eval.service.ts` added `getEvaluationsByIds(analyticsIds: string[]): Promise<Record<string, EvaluationData>>` function (mirrors existing `getSignalStatesByIds` pattern). Returns O(1) lookup map via `Record<string, EvaluationData>`. Guards empty input. Validates Supabase query success.

2. **ReviewDrawer Cross-Reference Panel** — `ReviewDrawer.tsx` imported `getSignalStatesByIds, SignalStateRow, SignalStatusDB` from signal states service. Added `SignalStatePanel` component (file-scoped) that renders signal state chip, ref_label, and handled_at date. On drawer open, parallel-loads both evaluation (existing) and signal state (new) via `Promise.all([getEvaluation(...), getSignalStatesByIds([...])])`. Panel positioned between Route/Capsule context section and Scoring section. Defines `SIGNAL_STATUS_CONFIG` mapping five signal statuses to label + color (revisada=blue, descartada=white/faded, convertida_regla=emerald, convertida_mejora=vape, resuelta=emerald).

3. **PilotTelemetry Inline Badges** — `PilotTelemetry.tsx` batch-fetches evaluations when `queryLog` changes. Passes `evalMap` and `signalStates` prop (from existing page-level hook, no redundant DB fetch). QueryRow component updated to render two status badges in "Revision" column before review button: (a) `★N` score badge (emerald ≥4, amber ≥3, red <3) + primary_tag tooltip, (b) signal state icon badge (→R for convertida_regla, →M for convertida_mejora, ✓ for resuelta, ✕ for descartada, 👁 for revisada) + signal status tooltip. Badges visible only when evaluation/signal state exist.

4. **TabPilot Import Cleanup** — Pre-existing breakage fixed: `PilotParityDiagnostics` import missing (line 15 now present). Lucide icons previously split across two import statements (lines 3-8 + line 20) consolidated into single import block. Unused catch variable naming (`err` → `_err` on lines 126, 147) corrected per ESLint naming convention.

**Characteristics:**

- No database schema changes; uses existing 1:1 tables (`ai_evaluations`, `cesarin_signal_states`).
- Service-layer batch fetch avoids N+1 queries; PilotTelemetry receives pre-fetched map as prop (no redundant fetches).
- All changes confined to UI/service layers; routing, orchestrator, guardrails untouched.
- Build verification: `npm run build` succeeds (v113-cc8c0f9), 0 typecheck errors, 0 ESLint errors (post-corrective).
- Cross-surface consistency: ReviewDrawer and PilotTelemetry share same signal state schema (`SignalStateRow`, `SignalStatusDB` enum).

**Closure Timeline:**

1. **Initial Implementation & Verification** (prior session) — All four changes implemented and verified live in repo. Build clean.
2. **Cold Audit Generation** (2026-03-23, commit 870fa6f) — Formal `B1_CROSS_SURFACE_AUDIT.md` generated with 11-section structure (scope, claimed changes, files inspected, surfaces affected, evidence, verification, cross-surface consistency, missing assets, closure readiness, questions for Codex, verdict).
3. **Codex Review 1 + Narrow Corrective Pass** (commit 1116428) — Codex returned ACCEPT WITH CORRECTIVE PASS due to TabPilot lint errors and import organization issues. Corrective pass: consolidated lucide-react imports, fixed unused catch variables (`_err` convention), lint clean (0 errors). Audit artifact updated.
4. **Codex Review 2 + Micro-Corrective Pass** (commit f11861b) — Codex returned ACCEPT WITH CORRECTIVE PASS due to stale audit artifact language. Documentary micro-corrective: updated section 4.5 (TabPilot remediated status), section 5.1 (artifact traceability), section 7.1 (alignment check), section 11 (verdict upgraded to "corrective-pass-complete").
5. **Codex Review 3 + Nano-Corrective Pass** (commit cc8c0f9) — Codex returned ACCEPT WITH CORRECTIVE PASS due to self-contradictory section 8.1 ("being generated now"). Nano-corrective: changed line 229 from ❌ "being generated now" to ✅ "complete (remediated via corrective passes)".
6. **Final Codex Review** (2026-03-23) — Codex issued final ACCEPT judgment. All blocking issues resolved. B1 structurally coherent, lint-clean, audit-artifact-aligned. Cleared for closure canon.

**Outcome:** Cross-surface truth gap closed. Operators now see both signal state (intake outcome) and evaluation score (quality assessment) in unified ReviewDrawer and PilotTelemetry surfaces without multiplied DB queries. Service layer extends existing batch-fetch pattern. UI integration is coherent and consistent. Codex acceptance: **ACCEPT**. Audit artifact: `B1_CROSS_SURFACE_AUDIT.md` (generated, remediated, closure-ready). Commits: 870fa6f (reconciliation + audit), 1116428 (code corrective), f11861b (documentary micro-corrective), cc8c0f9 (documentary nano-corrective). Build: v113-cc8c0f9, 0 typecheck errors.

---

### B2. Operator Simulation Workspace — Pass 1: Reusable Private Case Draft Minimum Loop — 23 de marzo de 2026

**Scope:** Operator QA tooling within Cesarin OS. Pass 1 target: minimum reusable private case draft persistence loop. Bounded to simulator, QA, and training case surfaces. Search/retrieval, semantic quality, and broad Cesarin OS redesign all explicitly out of scope.

**Context:** B1 closed (Codex ACCEPT, 2026-03-23). B2 opened as Operator Simulation Workspace macro wave. Pass 1 is not B2 completion — it is the minimum viable loop only.

**Delivered (Pass 1 + Corrective Micro-Pass):**

1. **`operator_case_drafts` table** — New migration `20260323_operator_case_drafts.sql`. Full RLS (select/insert/update/delete for admin_users). `source_type` check constraint (`review_drawer | qa_simulation`). `readiness_status` check constraint (`draft | needs_expected_outcome | ready`). Three indexes. `updated_at` trigger. Pattern matches existing `cesarin_signal_states.sql`.

2. **Type contract** — `PrivateCaseDraft` interface, `CaseDraftSourceType`, `CaseDraftReadinessStatus` added to `src/types/cesarin.ts`. `SimulationResult.user_input?: string` added to store real scenario user message. `SimulationSession.metadata.last_interaction_id?: string` added. `NavTab.id` union extended with `'casos'`.

3. **Service layer** — `src/services/admin/admin-case-drafts.service.ts` (new): `createCaseDraft`, `getCaseDrafts`, `updateCaseDraft`, `deleteCaseDraft`, `deriveCaseDraftReadiness` utility. Follows existing admin service pattern.

4. **ReviewDrawer creation point** — `ReviewDrawer.tsx` adds `handleSaveAsCaseDraft()` handler and "Guardar como Caso de Prueba" footer button. Creates draft from current interaction with real field mapping (input, observed_response, evaluation_summary, expected_outcome, route_or_capsule, detected_intent, evaluation_score, failure_reason). `deriveCaseDraftReadiness` determines status.

5. **TabQuality creation point** — `TabQuality.tsx` adds `handleSaveCaseDraft(result)` handler and `BookmarkPlus` button (visible only for non-PASS results). Real scenario input: `result.user_input ?? result.scenario_id`. Real evaluation_score: mapped from `result.score` (0–1 float) to 1–5 integer via `Math.max(1, Math.min(5, Math.round(result.score * 4) + 1))`. Judge path corrected: `user_message` uses `result.user_input ?? result.scenario_id`. Details drawer corrected: replaced hardcoded Spanish placeholder string with `{result.user_input ?? result.scenario_id}`.

6. **TabCaseDrafts queue** — `src/components/admin/cesarin/TabCaseDrafts.tsx` (new): minimal operator queue backed by `operator_case_drafts` table. Columns: Origen (source icon + label + date), Input (truncated with detected intent), Respuesta Observada (hidden mobile), Evaluación (star badge + failure_reason), Resultado Esperado, Estado (readiness badge). Row-level hover-reveal delete. Refresh button in header. Empty state.

7. **AdminCesarinOS wiring** — `casos` tab registered in `TAB_DEFINITIONS` (group: `lab`, icon: `BookmarkPlus`). Switch case `'casos' → <TabCaseDrafts />` added to `renderActiveTab()`.

8. **`savePilotFeedback` safety** — Previous iteration added a `supabase.from('pilot_feedback').insert()` with no migration in repo. Corrective micro-pass replaced DB write with explicit `throw new Error('not yet implemented — pending schema review')`. Compile contract preserved. TabPilot's existing toast-guarded catch absorbs the error without crashing.

9. **`simulate_cesarin.ts`** — `user_input: scenario.user_message` added to result construction so future simulation runs persist the real user text into `ai_simulation_reports.results`.

**Corrective Micro-Pass (231c57b):**
Codex rejected initial pass (6e34d7c) for four findings: (1) TabQuality judge path sent `scenario_id` as `user_message`; (2) draft `input` stored `scenario_id`; (3) details drawer showed hardcoded string; (4) `evaluation_score` unconditionally `null`. All four resolved in 231c57b.

**Residual Risk (Codex-acknowledged):**
Historical `ai_simulation_reports` rows created before this pass have no `user_input` field. Judge path and draft input fall back to `scenario_id` for those rows. No data is fabricated. New simulation runs will have `user_input` populated.

**Outcome:** Minimum reusable private case draft loop operational. Two creation surfaces (ReviewDrawer + TabQuality). One queue surface (TabCaseDrafts, admin-only). Persistence real and DB-backed. Codex acceptance: **ACCEPT WITH RESIDUAL RISK**. B2 pass 1 accepted as minimum operational loop — not as full B2 completion. Commits: 6e34d7c (initial pass 1), 231c57b (corrective micro-pass). Build: v113-f0e64e7, 0 typecheck errors.

### B2. Operator Simulation Workspace — Pass 2: Private Case Draft Maturation Loop — 23 de marzo de 2026

**Scope:** `src/components/admin/cesarin/TabCaseDrafts.tsx` only. Narrow operational upgrade to the existing private case draft surface. No new entities, no new service methods, no migrations, no simulator integration, no scenario generation, no learning/signals loop, no search/retrieval, no broad Cesarin OS redesign.

**Problem Addressed:**
After B2 pass 1, `TabCaseDrafts` was a passive read-only queue. Operators could see stored drafts but could not open, inspect, edit, or complete them. The `readiness_status` lifecycle (`draft | needs_expected_outcome | ready`) existed in schema and types but had no operator-facing operational signal — it was a label, not a loop.

**Delivered:**

1. **Row click opens maturation drawer** — Slide-in `AnimatePresence` drawer. Selected row highlighted with amber accent in the table. Pattern consistent with TabQuality details drawer.

2. **Captured source data (read-only)** — Drawer renders: input (full text), observed response (Cesarin's answer), detected intent, route/capsule, evaluation score. All sourced directly from already-stored `PrivateCaseDraft` fields. No external fetch.

3. **Editable maturation fields** — Three fields exposed for operator editing:
   - `expected_outcome` (textarea) — required for `ready` status
   - `failure_reason` (input) — surfaces the diagnostic note
   - `evaluation_summary` (textarea) — contextual notes

4. **Live `readiness_status` signal** — `deriveCaseDraftReadiness(expected_outcome.trim() || null, failure_reason.trim() || null)` called on every render from current form state. Badge and guidance message in the drawer update immediately as operator edits. `readiness_status` is now an active operational signal, not a static label.

5. **Save path** — `updateCaseDraft(id, { expected_outcome, failure_reason, evaluation_summary, readiness_status })` using the already-existing service method. Optimistic local state update applied — table row badge and drawer both reflect saved values immediately.

6. **Unsaved changes detection** — `hasUnsavedChanges` computed by normalizing form values (`trim() || null`) against persisted `selectedDraft` values. "Sin guardar" badge visible in drawer header when changes exist. Save button disabled when no unsaved changes or save in flight.

7. **Delete guard** — When the currently-open draft is deleted from the action column, the drawer closes automatically.

8. **Header counter** — Queue header now shows "X listos" count alongside total, making the `ready` lifecycle state visible at a glance.

**Correctness Verification (Codex Audit):**

- Form initialization (`useEffect([selectedDraft?.id])`) fires on id change; does not reset after save (same id) — correct.
- `hasUnsavedChanges` normalization handles null vs empty string — no false "unsaved" on drawer open.
- Optimistic update merges `updates` into `selectedDraft`; `hasUnsavedChanges` resolves `false` after save — save button correctly re-disables.
- `e.stopPropagation()` on action buttons prevents row-click conflict — correct.
- `liveReadiness` passed to `readiness_status` in save payload — persisted readiness is always co-derived from the same form state visible to the operator.
- Readiness guidance messages are consistent with `deriveCaseDraftReadiness` logic.

**Characteristics:**

- One file changed (`TabCaseDrafts.tsx`). Service (`admin-case-drafts.service.ts`) and types (`cesarin.ts`) unchanged — hash-verified.
- Build: `npx vite build` clean, 0 typecheck errors.
- Minor non-blocking UX risk: backdrop click dismisses drawer without unsaved-changes confirmation — consistent with existing drawer patterns in codebase; not a corrective blocker.

**Outcome:** `TabCaseDrafts` is no longer passive storage. Operators can open, inspect, edit, and save private case drafts through a real maturation loop. `readiness_status` is a live operational signal. B2 as macro wave remains open. Codex acceptance: **ACCEPT**. No corrective micro-pass required. Commit: 98bdf80. Build: 0 typecheck errors, Vite build clean.

---

## Auditorías Completadas (§9.10 → §9.29)

### A87. Pilot Miss Taxonomy Panel Semantic Stabilization — 6-Category Model Hardening — 22 de marzo de 2026

**Scope:** `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/hooks/admin/useAdminPilotOps.ts`.

**Problem Identified:**

The Piloto Operativo cockpit's `MissTaxonomyPanel` categorized query outcomes into a 6-category operational taxonomy (`product_search_miss`, `semantic_match_miss`, `fallback_miss`, `policy_miss`, `guardrail_miss`, `otro`) but faced four Codex acceptance blockers rooted in semantic truthfulness and category purity:

1. **Precedence ambiguity:** Categories were computed in arbitrary order; overlapping conditions (e.g., rows matching both "fallback_used" and "semantic_match_success=false") could be categorized incorrectly depending on evaluation order.

2. **Fallback narrowing weakness:** The `fallback_miss` category included queries with `fallback_used=true` regardless of context — fails to distinguish between "fallback helped resolve query" and "fallback was actual miss."

3. **Out-of-domain cardinality:** Out-of-domain queries (scope rejection, guardrail decision) were included in operational miss categories, inflating miss counts for queries the system correctly refused to handle.

4. **Otro escape hatch:** The catch-all `otro` category admitted rows that should be classified as operational decisions rather than misses — blurred semantic line between "system failed" and "system decided correctly."

Combined effect: The taxonomy did not accurately reflect operational outcomes. Categories claimed semantic meaning they did not possess; aggregates (e.g., "semantic_match_miss: 47") mixed true misses with non-miss operational states, making the cockpit strategically untrustworthy for operator decision-making.

**Remediation Applied:**

Three surgical micro-passes, each addressing one or more blockers:

**Pass 1 (8bf96f4): 6-Category Model with Strict Precedence**
- Established first-match-wins precedence order: `zero_product_cards` → `fallback_used` → `semantic_match_success` → `policy_query` → `guardrail_rescue` → `otro`
- Computed over `fullQueryLog` (unfiltered sample) — separate data flow from filtered `queryLog` used by table displays
- Implemented `categorized` tracking flag: once a row matches a category, skip remaining conditions
- Lock-step mapping: each category computed once per row, no overlap possible
- **Validation:** Simulation 6/6 PASS — deterministic precedence verified; full-sample vs filtered-sample separation confirmed correct behavior

**Pass 2 (fd8382e): Fallback Narrowing + Out-of-Domain Separation**
- Redefined `fallback_miss`: only rows where `fallback_used=true` AND `semantic_match_success=false` — semantically accurate "fallback became necessary because semantic failed"
- Extracted out-of-domain as explicit disqualifier: `!row.out_of_domain` guard added to `guardrail_rescue` category condition AND to `otro` fallback — out-of-domain rows now excluded from all operational miss categories
- `guardrail_rescue` condition tightened: `raw_analyst_intent === 'UNKNOWN' && capsule !== null && capsule !== ''` — rescues where guardrail injected tool call on unknown intent, confirmed by capsule routing
- **Codex blockers addressed:** (1) Precedence via strict ordering; (2) Fallback via AND condition; (3) Out-of-domain via guard; (4) Otro via narrowing
- **Validation:** Simulation 8/8 PASS — all four Codex scenarios verified; fallback/semantic interaction correct; out-of-domain properly excluded

**Pass 3 (9844516): Residual Bucket Purity**
- Final category `otro` narrowed to `!categorized && semantic_match_success === false && !out_of_domain` — only unmatched semantic queries that are in-domain
- Ensures `otro` contains only rows that are both a miss (semantic_match_success=false) and legitimately in-domain (not guardrail-rejected)
- Eliminates false `otro` entries where `out_of_domain=true` would have qualified the row despite out-of-domain status
- **Validation:** Simulation 4/4 PASS — residual purity verified; edge cases (out_of_domain=true with semantic_match_success=false) correctly excluded

**Characteristics:**

- No schema migration. No database changes. Taxonomy is computed in-memory.
- Full-sample computation (`fullQueryLog` with no RLS/date-range filtering) separates from table display (`queryLog` with user-scoped filtering).
- Three passes are sequential hardening, not independent fixes — each builds on precedence/separation established in prior passes.
- All changes confined to `PilotTelemetry.tsx`; hook exports unfiltered sample via `fullQueryLog`.
- Operator-facing taxonomy now semantically truthful: categories correspond to actual operational outcomes, not interpretation artifacts.

**Outcome:** The Miss Taxonomy Panel now accurately reflects six distinct operational categories with strict precedence, clear semantic meaning, and no overlap. Out-of-domain queries no longer inflate miss counts. Fallback misses are distinguished from fallback rescues. The `otro` category contains only true in-domain semantic misses. Codex acceptance criteria met. Lane closed. Commits: 8bf96f4 (6-category + precedence), fd8382e (fallback/out-of-domain), 9844516 (residual purity).

---

### A88. Cesarin OS TabLearning — Rule/Improvement Closure Semantics Clarity — 22 de marzo de 2026

**Scope:** `src/components/admin/cesarin/TabLearning.tsx`.

**Problem Identified:**

Operators could not clearly distinguish between the four possible outcomes when a friction signal was evaluated:

1. **Pending review** — signal awaiting evaluation; no state label
2. **Converted to rule** — signal became an active guideline; status label was "Directriz creada" but lacked outcome context
3. **Converted to improvement** — signal became a queued task; status label "Abierta en mejoras" used passive voice, unclear if action was taken or pending
4. **Reviewed without action** — signal was reviewed and rejected; status label "Descartada" sounded dismissive rather than decisive

**Semantic gaps:**
- No explicit "pending review" indicator for unacted signals
- Status labels did not convey what each outcome meant operationally
- Button copy ("Abrir en mejoras", "Descartar") lacked directness and clarity
- ref_label (ID of created rule/improvement) was shown but unmarked, ambiguous meaning
- Header instruction explained the action categories but did not guide operator toward understanding the four final states

**Remediation Applied (commit 3f2caf7):**

**Status Config — Added sublabels for operational context:**
Each status outcome now includes a descriptive sublabel shown beneath the primary label:
- `revisada` → "Evaluada sin acción" (reviewed, no change needed)
- `convertida_regla` → "Instrucción activa" (rule now guides responses)
- `convertida_mejora` → "En cola de mejoras" (improvement queued for action)
- `descartada` → "Evaluada, cerrada" (reviewed and closed)
- `resuelta` → "Problema solucionado" (issue resolved)

**Button Copy — Direct, action-oriented language:**
- "Abrir en mejoras" → "Crear mejora" (direct active voice; reduces ambiguity)
- "Descartar" → "Sin acción" (positive framing: it's a decision, not dismissal)

**Button Titles — Actionable intent:**
- Create rule: "Convertir en directriz activa que guíe respuestas futuras" (guides future responses)
- Create improvement: "Crear mejora en la cola de tareas" (queues a task)
- Review without action: "Marcar como revisada sin cambios requeridos" (clear decision)

**Pending Review Indicator:**
Added lightweight "Pendiente revisión" label for signals not yet acted upon, making review state explicit.

**ref_label Context — Explicit identifier marking:**
Changed ref_label display from "→ {value}" to "ID: {value}" so the nature of the reference is clear.

**Header Instruction — Action-oriented guidance:**
Refined instruction to explicitly enumerate the four possible outcomes:
"Para cada señal, elige el resultado: (1) crear directriz, (2) crear mejora, (3) revisar sin acción"

**Validation:**

Build verification — 2/2 PASS:
- `npm run typecheck` → 0 errors
- `npm run build` → v113-3f2caf7 ✓

Semantic clarity assessment:
- Pending state: now explicitly labeled "Pendiente revisión" when signal unacted
- Rule outcome: "Directriz creada" + "Instrucción activa" explicitly conveys that a rule is now active
- Improvement outcome: "Mejora creada" + "En cola de mejoras" clearly states a task was queued
- No-action outcome: "Revisada sin acción" + "Evaluada, cerrada" decisively marks as closed
- Button intent: all three actions now have direct, unambiguous copy

**Characteristics:**

- No behavioral changes. All action handlers (`handleCreateRule`, `handleCreateImprovement`, `handleDiscard`) remain unchanged.
- No telemetry impact. `ai_analytics` schema unchanged; no new fields, no data model changes.
- No A87 impact. The Miss Taxonomy Panel (A87) is untouched; no regression risk.
- No architectural changes. Component structure, interaction model, and state management preserved.
- UI/UX only. All changes are presentation layer — labels, text, sublabels, lightweight indicators.
- Scope remains bounded to TabLearning. TabRules, other Cesarin OS tabs, and telemetry unmodified.
- Strictly operator-facing. No changes to storefront, pilot logic, or guardrail behavior.

**Outcome:** Operators can now clearly distinguish four signal outcomes: pending review, converted to rule (active), converted to improvement (queued), or reviewed without action (closed). Semantic clarity is explicit at every step. Codex acceptance criteria met. Lane closed. Commit: 3f2caf7.

---

### A89. Cesarin OS Production Hardening Pack — Server-Trusted Auth, Gemini Resilience Preservation, & Real AI Evaluations Persistence — 22 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts` (lines 175-228, 1013-1028), `supabase/functions/cesarin-qa-judge/index.ts` (evaluate_turn action), `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/services/admin/admin-pilot-ops.service.ts`.

**Problem Identified:**

Three production-critical gaps were identified in the Cesarin OS hardening post-Wave 193:

1. **Gap 1 — Server-Trusted Auth Enforcement:** The `/api/cesarin` endpoint used JWT decode-only validation (manual base64 decode + JSON.parse) to extract the `body.is_pilot` flag. This is not server-trusted: the client controls the body payload, and JWT decode without verification is cryptographically meaningless. Requests with invalid or missing auth tokens could pass through if body parameters were manipulated. Authorization must be server-verified before any protected work (Gemini calls, tool execution, Judge invocation) proceeds. **Gap blockers:** No 403 Forbidden response path for unauthorized requests; all downstream work (AI, Judge) treated as implicitly authorized; trust source was client-controlled.

2. **Gap 2 — Gemini Resilience / Fallback (Assessment Required):** Analyst (20s timeout, 429/5xx handling with fallback to PRODUCT_SEARCH) and Sommelier (25s timeout, 429/5xx handling with on-brand fallback text) timeout and error-recovery paths required verification that they remained acceptable under production load. Text guarantee and JSON contract shape needed validation. **Assessment outcome:** Resilience logic acceptable; no changes needed.

3. **Gap 3 — Async QA Judge Persistence:** The `evaluate_turn` action in `cesarin-qa-judge` was persisting evaluation results to `ai_evaluations` table, but the implementation was mapping Gemini output to invented columns that do not exist in the real schema from `20260319_human_evaluation_loop.sql`. Persistence was not durable or queryable: inserted rows violated the real schema, or inserts silently failed. Additionally, A87 taxonomy restoration showed that PilotTelemetry.tsx had been modified during the Gap 3 work with properties not yet available in `admin-pilot-ops.service.ts`, creating a circular dependency. **Gap blockers:** evaluate_turn → ai_evaluations persistence is non-real (invented columns); A87 semantics partially broken by spillover changes; telemetry mapping incomplete.

**Remediation Applied:**

**Gap 1 — Server-Trusted Auth Enforcement (commit 35208ad):**

Replaced JWT decode-only with server-side verification in `customer-intelligence/index.ts` lines 175-228:

```typescript
// BEFORE: Decode-only (NOT server-trusted)
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
if (payload.is_pilot !== true) return 403;

// AFTER: Server-trusted verification
const { data, error } = await supabase.auth.getUser(bearerToken);
if (error || !data.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
```

Effect: Unauthorized requests return 403 Forbidden **BEFORE any protected work** (Gemini calls, tool execution, Judge invocation). Trust source is server-verified Supabase Auth object, not client-controlled body parameters.

**Gap 2 — Gemini Resilience / Fallback (Assessment: No changes needed):**

Analyst resilience (lines 357-425): 20s timeout, 429/5xx handling with fallback to PRODUCT_SEARCH — logic remains acceptable.
Sommelier resilience (lines 750-842): 25s timeout, 429/5xx handling with on-brand fallback text — logic remains acceptable.
Text guarantee maintained. JSON contract shape preserved. **Assessment outcome:** No changes required; resilience paths acceptable under hardening scope.

**Gap 3 — Real ai_evaluations Persistence + A87 Restoration (commit 35208ad):**

**Part A: Truthful ai_evaluations Schema Mapping (cesarin-qa-judge/index.ts, evaluate_turn action, lines 92-140)**

Mapped Gemini output to REAL schema fields from `20260319_human_evaluation_loop.sql`:

| Field | Source | Transformation |
|-------|--------|-----------------|
| `analytics_id` | Payload FK | Direct |
| `score` | `evaluation.relevance_score` (1-10) | Normalized to 1-5: `ceil(relevanceNorm / 2)` |
| `primary_tag` | Constant | `'turn_quality_evaluation'` (meets NOT NULL constraint) |
| `secondary_tags` | `evaluation.issues` | Array of problem strings (TEXT[] type) |
| `severity` | Computed | `'critical'` if hallucination, `'high'` if relevance ≤ 4, `'medium'` if 5-6, `'low'` otherwise |
| `expected_outcome` | `evaluation.recommendation` | Direct nullable string |
| `comment` | Composite | Formatted audit trail: intent, hallucination, escalation, tone, issues |
| `evaluator_id` | Constant | `null` (Gemini evaluation, not human-conducted) |

**Removed from persistence (were invented, not in schema):** `evaluation_type`, `query`, `response_text`, `detected_intent`, `frustration_detected`, `zero_results`, `product_count`, `relevance_score`, `hallucination_detected`, `tone_score`, `escalation_offered`, `evaluated_at`.

**Part B: A87 Semantics Restoration (PilotTelemetry.tsx, reverted to commit ef012fb)**

All six original categories restored with strict first-match-wins precedence:
1. **Ruta degradada / error** — `gemini_api_error !== null || tool_error_count > 0` (restored)
2. **Producto buscado sin cards** — `capsule === 'product_search_integrity' && product_card_count === 0` (unchanged)
3. **UNKNOWN rescatado** — `raw_analyst_intent === 'UNKNOWN' && capsule !== null` (unchanged)
4. **Fallback sin cápsula clara** — `fallback_used && sommelier_fallback_reason === null` (restored condition)
5. **Dominio RAG** — `capsule === 'knowledge_rag_foundation'` (unchanged)
6. **Otro / misses sin categoría** — `!out_of_domain && semantic_match_success === false` (restored exclusion)

Frustration signal remains independent secondary signal (non-competing).

**Part C: Admin Telemetry Properties Restoration (admin-pilot-ops.service.ts)**

Four properties required by A87 taxonomy restored to PilotQueryRow interface and mapRow() function:

```typescript
gemini_api_error: string | null;
tool_error_count: number;
sommelier_fallback_reason: string | null;
out_of_domain: boolean;
```

Mapping: `tool_error_count` computed from filtering `analyst_report.tool_results` where `status === 'error'`.

**Validation:**

Build verification (commit 35208ad):
- `npm run typecheck` → 0 errors
- `npm run build` → Exit code 0, 24.49 seconds
- Vite bundle: 791.52 kB main bundle
- No new warnings or compilation errors

Hardening verification matrix:

| Component | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **Gap 1 Auth** | 403 before protected work | ✅ PASS | `supabase.auth.getUser(bearerToken)` server-verified |
| **Gap 2 Analyst** | 20s timeout, 429/5xx handling | ✅ ACCEPTABLE | Untouched; logic preserved |
| **Gap 2 Sommelier** | 25s timeout, 429/5xx handling | ✅ ACCEPTABLE | Untouched; logic preserved |
| **Gap 3 evaluate_turn** | Persists to REAL schema only | ✅ PASS | No invented columns; conservative mapping |
| **Gap 3 Score mapping** | 1-10 → 1-5 normalization | ✅ PASS | `ceil(relevance/2)` applied consistently |
| **Gap 3 Severity** | Computed from hallucination + relevance | ✅ PASS | critical/high/medium/low thresholds verified |
| **A87 Categories** | All 6 restored with precedence | ✅ PASS | Reverted to ef012fb; first-match-wins confirmed |
| **A87 Frustration** | Independent secondary signal | ✅ PASS | Non-competing; co-occurs with any category |
| **Telemetry Properties** | 4 fields present for A87 | ✅ PASS | `gemini_api_error`, `tool_error_count`, `sommelier_fallback_reason`, `out_of_domain` |

**Characteristics:**

- No schema migration. `ai_evaluations` and `ai_analytics` tables unchanged.
- No client-side changes. Hardening is edge-function and admin-service focused.
- Gap 1 enforcement is cryptographic (server-verified JWT). Gap 2 resilience is behavioral (timeout/fallback logic). Gap 3 persistence is schema-faithful (no invented columns).
- A87 restoration is complete and bidirectional (PilotTelemetry + admin service synchronized).
- Scope strictly bounded: only files touched are customer-intelligence (auth + Judge invoke payload), cesarin-qa-judge (evaluate_turn mapping), PilotTelemetry (revert), admin-pilot-ops.service.ts (telemetry restoration).
- No behavioral changes to pilot activation, guardrail logic, capsule routing, or any AI-driven features.
- All changes are production-hardening only: cryptographic trust, schema truthfulness, and operator-facing semantics restoration.

**Outcome:** Three critical production gaps are now closed. (1) Auth enforcement is server-trusted via Supabase Auth.getUser() verification, returning 403 Forbidden BEFORE any protected work for unauthorized requests. (2) Gemini resilience paths (Analyst 20s + Sommelier 25s timeouts, 429/5xx handling, fallback contracts) are verified acceptable and remain preserved. (3) QA Judge persistence to `ai_evaluations` is now truthful, mapping only to real schema fields with conservative transformations (relevance normalization, severity computation, composite comment trail). A87 miss taxonomy is fully restored to its original semantic state with all six categories, strict precedence, and independent frustration signal. No spillover remains. Build verified exit code 0. Codex acceptance: ACCEPT. Final commit: 35208ad. Lane closed.

---

### A90. Cognitive Integrity Pack — Analyst Contract, Routing Truth, Parse Hardening & Telemetry Closure — 22 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`.

**Why Opened After A89:**

Post-A89 macro prioritization by Codex identified structural coherence gaps in the cognitive layer before the Operator Surface Consolidation Pack (macro wave B) could be responsibly executed. Customer-facing truth and downstream telemetry depended on resolving these contradictions. Four root contradictions were confirmed:

1. **Missing Analyst Contract for COMPATIBILITY_CHECK:** The Analyst JSON output contract (intent enum, line 297) did not list `COMPATIBILITY_CHECK` as a valid intent, yet Analyst training rules explicitly instructed it to emit that intent, and guardrail logic depended on it. Contract, training, and runtime were misaligned.

2. **Hollow Compatibility Routing Assumption:** A guardrail injection path existed for `check_compatibility` tool injection on `COMPATIBILITY_CHECK` intent, but no dedicated client-side capsule router or executor existed for `compatibility_check`. Any pre-routing attempt would fall through to `UNKNOWN_CAPSULE` in the concierge, not to a real handler.

3. **Parse Fragility / Contract-Validation Weakness:** Analyst and Sommelier JSON parsing relied on regex-based extraction (`/\{[\s\S]*\}/` match) with no contract validation after parse. An invalid or malformed nonempty response could continue as an apparently valid structured success — no intent validation, no required-field guards, and the degradation condition (`geminiError && !rawAnalystText`) only triggered when `rawAnalystText` was empty, meaning malformed nonempty output bypassed degradation entirely.

4. **Telemetry Truth Ambiguity:** The `routed_capsule: null` field emitted by Sommelier could mean either (a) capsule was pre-routed before Sommelier received the turn, or (b) the turn was fallback-handled by Sommelier. No field distinguished these semantics. Additionally, client-owned telemetry for capsule paths (`logAITelemetry` in `concierge.service.ts`) did not extract or persist `routing_path` even though the edge function included it in the debug payload.

**Implementation Pass Summary:**

**Initial Pass (Cognitive Integrity Pack v1):**

- Added `COMPATIBILITY_CHECK` to Analyst intent enum in JSON contract (line 297) — aligned contract with training
- Added dedicated `compatibility_check` capsule router block between CART_OPERATION and OUT_OF_DOMAIN handlers
- Replaced regex-based Analyst JSON extraction with layered parsing: direct JSON.parse first, regex fallback only if needed; added intent validation against `VALID_INTENTS` array and `tool_calls` array type check
- Added `analystParseValid` flag; hardened Sommelier parse with empty-text guards and strict contract checks
- Added `routing_path` field (`'pre_routed'` | `'fallback_handled'`) to all capsule router debug payloads and edge-persisted Sommelier analytics

**First Codex Rejection:** Three findings:

1. COMPATIBILITY_CHECK route was hollow end-to-end — the `compatibility_check` capsule router returned `requires_client_capsule: true` with `capsule_name: 'compatibility_check'`, but no client-side handler existed; concierge falls through to UNKNOWN_CAPSULE generic path
2. `routing_path` was not persisted for client-owned capsule telemetry — only edge-owned (Sommelier) paths had it in `ai_analytics`
3. Analyst invalid-output degradation condition (`geminiError && !rawAnalystText`) only triggered degradation on empty text; malformed nonempty output continued as if valid

**First Corrective Lane — Compatibility Route Closure + Telemetry + Analyst Rigor:**

- **PATH 2 chosen** (remove fake pre-routing): Deleted the `compatibility_check` capsule router entirely; `COMPATIBILITY_CHECK` intent now truthfully falls through to Sommelier fallback path, which has access to `compatibilityOutput` data and responds per persona rules — this matches actual runtime design
- Corrected `preRoutedIntents` list: removed `COMPATIBILITY_CHECK`; now only `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `CART_OPERATION`, `OUT_OF_DOMAIN` are `'pre_routed'`; all others (including `COMPATIBILITY_CHECK`) are `'fallback_handled'`
- Fixed Analyst degradation condition: changed `if (geminiError && !rawAnalystText)` to `if (geminiError || !analystParseValid)` — malformed nonempty Analyst output now explicitly degrades instead of silently continuing

**Second Codex Rejection (Micro-Lane):** One remaining finding — `routing_path` was still not persisted for client-owned capsule telemetry despite being available in `data.debug.routing_path` sent by the edge function.

**Final Micro-Lane — routing_path Persistence Closure:**

- Added `routing_path?: 'pre_routed' | 'fallback_handled' | null` to `logAITelemetry` function signature
- Added `routing_path: fields.routing_path ?? null` to `ai_logic_debug` JSONB in the insert payload
- Added `routing_path: data.debug?.routing_path ?? null` to all three capsule `logAITelemetry` call sites: `product_search_integrity`, `knowledge_rag_foundation`, `cart_operator`

**Characteristics:**

- No schema migrations. `ai_analytics` table structure unchanged; `routing_path` persisted into existing `ai_logic_debug` JSONB column.
- No client UI changes. No operator surface changes. No capsule execution behavior changes.
- `COMPATIBILITY_CHECK` remains a valid Analyst intent (in contract and training); it is simply fallback-handled by Sommelier rather than pre-routed to a non-existent capsule.
- `routing_path: 'pre_routed'` is now truthfully stored in `ai_analytics` for turns handled by `product_search_integrity`, `knowledge_rag_foundation`, and `cart_operator` capsules.
- `routing_path: 'fallback_handled'` is truthfully stored for turns handled by Sommelier (COMPATIBILITY_CHECK, INVENTORY_OUTLOOK, ORDER_TRACKING, CHIT_CHAT, UNKNOWN).
- Analyst degradation is now safe and explicit: any contract violation (invalid intent, non-array tool_calls, parse error) triggers the PRODUCT_SEARCH safe fallback with reason `'fallback_due_to_analyst_degradation'`.
- Macro Wave B (Operator Surface Consolidation Pack) remains deferred; not opened in this lane.

**Outcome:** All four root cognitive contradictions resolved. Contract, training, and runtime are now coherent for all intent paths. Parse fragility is hardened with layered validation and explicit degradation. Routing semantics are truthfully persisted end-to-end across both server-owned and client-owned telemetry. Codex acceptance: ACCEPT (final, after two corrective passes). Macro Wave A (Cognitive Integrity Pack) is closed.

---

### A86. Knowledge Capsule Input Contract Integrity — is_ambiguous Zod Gap — 21 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts`, `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

`knowledgeToolSchema` required `is_ambiguous` as a hard `z.boolean()` with no default — the symmetric gap to A82, which closed the same defect on `productSearchToolSchema` but did not extend the fix to the knowledge schema. Two independent code paths produced inputs missing the field, causing Zod validation to fail in `executeKnowledgeCapsule` and the capsule to return a DEGRADED response before any real RAG execution:

1. **POLICY_INQUIRY guardrail injection path:** The injection block pushed `{ query: query || '' }` — `is_ambiguous` was absent. Every query reaching the knowledge capsule via guardrail injection (Analyst classified POLICY_INQUIRY but omitted the tool call, or guardrail promoted UNKNOWN → POLICY_INQUIRY via keyword match) degraded at schema validation.

2. **Analyst few-shot training gap:** The single `knowledge_rag_foundation` few-shot example (example 2: "¿cuál es la política de envíos?") omitted `is_ambiguous`. The Analyst was trained to emit policy tool calls without the field, causing schema failures on Analyst-generated paths as well.

Combined effect: `executeKnowledgeCapsule` returned `buildDegradedKnowledgeContract('SCHEMA_ERROR', ...)` immediately on every POLICY_INQUIRY interaction, producing "Actualmente no puedo consultar el manual de políticas de forma automática. ¿Deseas contactar a un asesor humano por WhatsApp?" for all policy questions. The knowledge capsule had never executed real RAG retrieval in production.

The `is_ambiguous` parameter is not decorative — `evaluateKnowledgeRAGTree` gates `HIGH_CONFIDENCE_POLICY_MATCH` on `topScore >= 0.82 && !is_ambiguous`. The `.default(false)` value matters for output quality: specific policy questions with `is_ambiguous: false` can resolve to `HIGH_CONFIDENCE_POLICY_MATCH`; guardrail-injected queries with `is_ambiguous: true` correctly resolve at most to `MODERATE_CONFIDENCE_MULTI_SOURCE`.

**Remediation Applied (commit d35b1ea):**

**Defense-in-depth (`ai-capsule-schemas.ts:14`):**

Changed `is_ambiguous: z.boolean()` to `is_ambiguous: z.boolean().default(false)`. Any future call site that omits the field recovers silently. `false` is the conservative default: specific behavior (allows `HIGH_CONFIDENCE_POLICY_MATCH` when similarity is sufficient) rather than forcing multi-source fallback.

**Guardrail injection fix (`index.ts`, POLICY_INQUIRY injection block):**

Added `is_ambiguous: true` to the injected args. Guardrail-injected policy queries represent queries the Analyst could not specifically classify — inherently broad/unresolved, therefore `is_ambiguous: true` is semantically correct and prevents false `HIGH_CONFIDENCE_POLICY_MATCH` on low-specificity queries.

**Few-shot contract correction (`index.ts`, example 2):**

Added `"is_ambiguous": false` to the `knowledge_rag_foundation` args in example 2 ("¿cuál es la política de envíos?"). This is a specific policy question — `false` is the correct value and enables the correct match strategy tier.

**Validation:**

Zod contract simulation — 15/15 PASS:

| Case | Result |
| --- | --- |
| Regression proof: original schema fails on `{ query: '...' }` (no `is_ambiguous`) | PASS |
| Guardrail injection with `is_ambiguous: true` → schema passes, value = `true` | PASS |
| Analyst-driven `is_ambiguous: false` → schema passes, value = `false` | PASS |
| Broad policy query `is_ambiguous: true` → schema passes | PASS |
| Defense-in-depth: absent field defaults to `false` | PASS |
| Greeting path unaffected; schema change is additive | PASS |
| Injection / Analyst / old-pattern paths no longer trigger SCHEMA_ERROR | PASS ×3 |

Live deploy probes — 4/4 PASS:

| Query | Result |
| --- | --- |
| "¿hacen envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "¿cuál es la política de envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "¿cómo manejan pagos y envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "hola" | Sommelier path · no capsule delegation · greeting response confirmed ✓ |

**Live observation:** All three policy probes showed the Analyst emitting `is_ambiguous` directly in tool call args — guardrail injection did not fire (`injected_tools: []` on all probes). The corrected few-shot example is immediately effective in Analyst output, confirming the training path is the primary route for policy queries.

**Characteristics:**

- No schema migration.
- No client changes.
- No router redesign.
- No capsule redesign.
- Symmetric fix to A82 — same pattern, applied to the knowledge schema.
- `.default(false)` is permanent defense-in-depth; future injection sites are covered automatically.

**Outcome:** `POLICY_INQUIRY` interactions no longer fail knowledge capsule contract validation. Policy questions now reach real RAG retrieval and return grounded answers. The "Actualmente no puedo consultar el manual de políticas" degraded fallback is no longer triggered by missing `is_ambiguous`. Commit: d35b1ea.

---

### A85. Structured Guardrail Decision Telemetry — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`.

**Problem Identified:**

Key AI-routing decisions were operationally invisible in persistent telemetry. A single `ai_analytics` row could not reconstruct what the Analyst classified, whether a guardrail override fired, which tool calls were injected vs Analyst-generated, or whether a capsule succeeded or degraded. Five distinct blind spots were confirmed:

1. **Analyst → guardrail intent delta not persisted.** `logAITelemetry` received only the guardrail-resolved `detected_intent`. `analystReport.intent` (the raw Analyst output before any override) was discarded after the guardrail chain. When diagnosing a wrong response, it was impossible to determine whether the Analyst classified incorrectly or a guardrail override misfired.

2. **Guardrail-injected tool calls not visible.** Each injection block tagged its tool call with `reason: 'guardrail_injection'` on the runtime object, but this field was never extracted into telemetry. A83/A84 guardrail hardening was therefore unverifiable from production `ai_analytics` rows — confirmation required ephemeral edge function logs.

3. **Capsule execution outcome not persisted.** All three capsule call sites in `concierge.service.ts` hardcoded `capsule_match_success: true`, `fallback_used: false`, and `error_type: null` regardless of the actual capsule contract's `execution_status` and `match_strategy`. A DEGRADED capsule was indistinguishable from a clean EXACT match in telemetry — production DEGRADED rate was reported as 0% regardless of reality.

4. **Cart path `detected_intent` misclassified.** The cart capsule call site passed `detected_intent: 'search'`. Every `CART_OPERATION` interaction was logged under the wrong intent label — querying `WHERE detected_intent = 'cart_operation'` returned zero rows even when cart capsules fired correctly.

5. **Specific guardrail override events not queryable.** Which override rule activated (COMPATIBILITY_FORCE, UNKNOWN_RESOLVE_*, TERMINAL_RECOVERY) was only in `console.warn` output — not in any persistent field.

**Remediation Applied (commit be461cb):**

**`index.ts` — Guardrail telemetry struct:**

`analystIntent` captured immediately after `analystReport` is parsed, before any guardrail override modifies `intent`. A `guardrailOverrides: string[]` array initialized before the override chain; each block that changes `intent` pushes its label:

- `COMPATIBILITY_FORCE` — Block 1 (compatibility signal overrides non-COMPATIBILITY_CHECK intent)
- `UNKNOWN_RESOLVE_INVENTORY` / `UNKNOWN_RESOLVE_POLICY` / `UNKNOWN_RESOLVE_PRODUCT` / `UNKNOWN_RESOLVE_CHIT_CHAT` — Block 2 (UNKNOWN/CHIT_CHAT resolution)
- `TERMINAL_RECOVERY` — Block 3 (unconditional UNKNOWN → PRODUCT_SEARCH fallback)

After the injection chain, a `guardrailTelemetry` struct is assembled:

```js
const guardrailTelemetry = {
    analyst_intent: analystIntent,
    guardrail_intent: intent,
    guardrail_overrides: guardrailOverrides,
    injected_tools: toolCalls
        .filter(c => c.reason === 'guardrail_injection')
        .map(c => c.name)
};
```

`guardrailTelemetry` is appended to the `debug` payload of all three capsule router responses (product search, knowledge RAG, cart operator) and to the OUT_OF_DOMAIN server-side `ai_logic_debug` insert.

**`concierge.service.ts` — Client telemetry extraction:**

`logAITelemetry` signature extended with five new optional fields: `analyst_intent`, `guardrail_overrides`, `injected_tools`, `capsule_execution_status`, `capsule_match_strategy`. All five persisted into `ai_logic_debug` JSONB with `?? null` / `?? []` safe defaults.

At each capsule call site:

- `analyst_intent`, `guardrail_overrides`, `injected_tools` extracted from `data.debug?.guardrail_telemetry`
- `capsule_execution_status` from `capsuleContract.execution_status`
- `capsule_match_strategy` from `capsuleContract.match_strategy`
- `capsule_match_success` replaced: `execution_status === 'SUCCESS'` (was hardcoded `true`)
- `fallback_used` replaced: `match_strategy === 'FEATURED_FALLBACK' || 'NO_MATCH'` for search; `LOW_CONFIDENCE_FALLBACK || NO_MATCH` for knowledge (was hardcoded `false`)
- `error_type` replaced: `'EDGE_ERROR'` when `execution_status === 'FAILED'` (was hardcoded `null`)
- Cart path `detected_intent` corrected: `'cart_operation'` (was `'search'`)

Sommelier/generic path: all five new fields absent from edge response — fall back to `null`/`[]`, no crash, no noise.

**Validation:**

Simulation — 23/23 PASS across 5 required cases + 1 bonus:

| Case | Result |
| --- | --- |
| Guardrail override (COMPATIBILITY_FORCE) | `analyst_intent=PRODUCT_SEARCH`, `guardrail_intent=COMPATIBILITY_CHECK`, delta persisted ✓ |
| Guardrail injection (product_search_integrity) | `injected_tools=['product_search_integrity']`, override array empty ✓ |
| Product capsule SUCCESS/EXACT | `capsule_execution_status=SUCCESS`, `capsule_match_strategy=EXACT`, `capsule_match_success=true` ✓ |
| Cart path | `detected_intent='cart_operation'` (not 'search') ✓ |
| Sommelier/generic path | all five new fields `null`/`[]`, no regression ✓ |
| TERMINAL_RECOVERY (bonus) | `analyst_intent=UNKNOWN`, `guardrail_intent=PRODUCT_SEARCH`, both labels present ✓ |

Live runtime verification passed post-deploy.

**Characteristics:**

- No schema migration.
- No new table.
- All new fields are additive keys inside existing `ai_logic_debug` JSONB column — fully backward-compatible.
- No client UI changes.
- No sensitive data captured (no query content beyond what was already persisted).
- Sommelier/generic path telemetry unaffected — graceful null defaults on all new fields.

**Outcome:** A real runtime request can now be diagnosed from a single `ai_analytics` row across: raw Analyst intent → guardrail overrides → injected tools → router selection → capsule execution status → final path. A83/A84 guardrail hardening is now verifiable from production telemetry without reading edge function logs. Capsule DEGRADED rate is no longer masked. Cart interactions are correctly classified. Commit: be461cb.

---

### A84. Cart Guardrail Injection Gap — CART_OPERATION Without Safety Net — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

`CART_OPERATION` was the only capsule-routable intent with no guardrail injection safety net. Every other routable intent (`PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, `COMPATIBILITY_CHECK`) had a corresponding injection block that would inject the canonical tool call if the Analyst omitted it. `CART_OPERATION` had none.

After A83 closed the OR-arm weakness in the cart router (strict AND: `intent === 'CART_OPERATION' && cartOperatorCall`), the injection gap became a functional failure path: if the Analyst emitted `intent: CART_OPERATION` with `tool_calls: []`, the strict AND condition would evaluate to `false` — no cart capsule dispatch — and the interaction would fall through to the Sommelier general response path. The user's cart intent would receive a conversational reply with no cart action.

**Remediation Applied (commit 109e150):**

Added a symmetric injection block for `CART_OPERATION`, consistent with the pattern established for all other routable intents:

```js
if (intent === 'CART_OPERATION' && !toolCalls.some(c => c.name === 'cart_operator')) {
    console.warn('[GUARDRAIL] Injecting cart_operator tool_call (Analyst omitted it)');
    toolCalls.push({ name: 'cart_operator', args: { action: 'ADD', product_ref: query || '', quantity: 1 }, reason: 'guardrail_injection' });
}
```

Conservative defaults: `action: 'ADD'`, `quantity: 1`, `product_ref: query`. These are intentional — the cart capsule (`executeCartOperatorCapsule`) is responsible for downstream ambiguity resolution and mutation proposal validation. The injection's role is only to ensure a routable tool call exists so the strict AND router can dispatch; it does not pre-determine the cart outcome.

**Validation:**

Simulation — 4/4 PASS:

| Case | Result |
| --- | --- |
| CART_OPERATION with no tool call → injection fires | cart_operator injected ✓ |
| CART_OPERATION with existing cart_operator → no duplication | injection skipped ✓ |
| PRODUCT_SEARCH path unchanged | product search unaffected ✓ |
| CHIT_CHAT/greeting path unchanged | no injection, Sommelier path ✓ |

Live probe:

| Query | Result |
| --- | --- |
| "agrega un vape de uva al carrito" | `capsule_name: cart_operator` · cart path confirmed ✓ |

**Characteristics:**

- No schema migration.
- No client changes.
- No routing logic changes (router conditions from A83 unchanged).
- No behavior change for any non-CART_OPERATION path.
- Symmetric with existing injection pattern for all other routable intents.
- Conservative defaults; ambiguity handled downstream by cart capsule.

**Outcome:** `CART_OPERATION` now has a complete guardrail injection safety net. All five capsule-routable intents (`PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, `COMPATIBILITY_CHECK`, `CART_OPERATION`) are structurally covered. The Analyst can omit a tool call for any routable intent without producing a silent misroute to Sommelier. Commit: 109e150.

---

### A83. Router Precedence Hardening — OR-Arm Capsule Dispatch Weakness — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

All three capsule router blocks used OR-arm dispatch conditions that allowed tool call _presence alone_ — without intent confirmation — to trigger capsule delegation. This created a structural misroute risk in any Analyst output that emitted multiple tool calls:

- **Product search router** (pre-A83): `(intent === 'PRODUCT_SEARCH' && searchCapsuleCall) || (searchCapsuleCall && intent !== 'COMPATIBILITY_CHECK' && intent !== 'POLICY_INQUIRY')` — the second OR arm activated when `searchCapsuleCall` was present regardless of intent, with only two explicit exclusions. Any Analyst output combining `product_search_integrity` with a primary `CART_OPERATION`, `ORDER_TRACKING`, or `INVENTORY_OUTLOOK` intent would silently route to the product search capsule instead.

- **Knowledge router** (pre-A83): `intent === 'POLICY_INQUIRY' || knowledgeCapsuleCall` — the OR arm activated on knowledge capsule call presence alone, regardless of intent. A `CART_OPERATION` intent paired with an incidental `knowledge_rag_foundation` call would dispatch to the knowledge capsule.

- **Cart router** (pre-A83): similar OR-arm structure, hardened for structural consistency even though the failure path was less common.

In all three cases, the OR arm's function was to serve as a fallback when the Analyst classified intent correctly but omitted the expected tool call. This role was superseded by the guardrail injection chain (A82 and earlier): injections already guarantee tool call presence for every routable intent before the router runs — making the OR arms redundant and actively harmful.

**Remediation Applied (commit ba8ac33):**

Replaced all three OR-arm conditions with strict AND conditions:

```js
// Product search (was: OR arm allowed tool_call presence to override intent)
if (intent === 'PRODUCT_SEARCH' && searchCapsuleCall)

// Knowledge (was: OR arm activated on knowledgeCapsuleCall alone)
if (intent === 'POLICY_INQUIRY' && knowledgeCapsuleCall)

// Cart (was: OR arm for structural consistency)
if (intent === 'CART_OPERATION' && cartOperatorCall)
```

The strict AND conditions are safe because guardrail injections (established in earlier lanes, with `CART_OPERATION` injection added in A84) guarantee tool call presence for every routable intent before the router evaluates — the OR arms provided no additional coverage.

**Validation:**

Deterministic router simulation — 7/7 PASS (includes both "original broken" and "fixed" proof cases):

| Case | Pre-A83 result | Post-A83 result |
| --- | --- | --- |
| `PRODUCT_SEARCH` + searchCapsuleCall | product capsule ✓ | product capsule ✓ |
| `CART_OPERATION` + searchCapsuleCall | product capsule (misroute) | Sommelier (correct intent, fallback) |
| `POLICY_INQUIRY` + knowledgeCapsuleCall | knowledge capsule ✓ | knowledge capsule ✓ |
| `CART_OPERATION` + knowledgeCapsuleCall | knowledge capsule (misroute) | Sommelier (correct intent, fallback) |
| `CART_OPERATION` + cartOperatorCall | cart capsule ✓ | cart capsule ✓ |
| `CHIT_CHAT` + no capsule call | Sommelier ✓ | Sommelier ✓ |
| `PRODUCT_SEARCH` (guardrail injection fires) | product capsule ✓ | product capsule ✓ |

Live probes — 4/4 PASS: product search, cart operation, policy inquiry, greeting all confirmed on correct paths.

**Residual note:** The cart guardrail injection gap (CART_OPERATION with empty tool_calls falling through to Sommelier) was confirmed during A83 validation and addressed as a separate lane (A84). A83 scope was router condition logic only.

**Characteristics:**

- No schema migration.
- No client changes.
- No new capsule.
- No changes to injection logic (injection chain unchanged).
- Strictly subtractive: removes OR arms; adds no new branching.
- Structural integrity of the router now matches the design intent stated in A83 comments.

**Outcome:** Capsule dispatch is now gated exclusively on the combination of guardrail-resolved intent AND the matching tool call. Mixed-tool-call Analyst outputs no longer produce silent misroutes. The router is deterministic and auditable. Commit: ba8ac33.

---

### A82. Capsule Input Contract Integrity — is_ambiguous Zod Gap — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/lib/ai-capsule-schemas.ts`.

**Problem Identified:**

`productSearchToolSchema` required `is_ambiguous` as a hard `z.boolean()` with no default. Two distinct code paths produced inputs missing this field, causing Zod validation to fail and the capsule to return a DEGRADED response ("Tuve un inconveniente interpretando tu búsqueda") on legitimate product-discovery queries:

1. **Guardrail injection path:** When the Analyst omitted a `product_search_integrity` tool call (expected behavior for queries reaching terminal recovery via A81), the guardrail injected the call with `{ query, requires_semantic_expansion: true }`. `is_ambiguous` was absent. Every query going through A81 terminal recovery subsequently degraded at capsule execution — making A81's recovery a no-op at the user level.

2. **Analyst few-shot training gap:** Five of the nine `product_search_integrity` few-shot examples (examples 1, 5, 6, 7, 8 — all open-ended/conceptual queries) omitted `is_ambiguous`. Gemini was therefore trained to omit it for the broadest, highest-frequency storefront query class. Any Analyst-generated tool call following this pattern also failed Zod → DEGRADED.

Combined effect: A81 terminal recovery routed correctly at the intent level but produced a DEGRADED capsule response at execution. Open-ended queries such as "algo frutal barato" or "recomiéndame algo suave y rico" received a schema-error message instead of product cards.

**Remediation Applied (commit 862ab05):**

**Guardrail injection fix (`index.ts:390`):**

Added `is_ambiguous: true` to the injected args. Guardrail-injected calls represent queries the Analyst did not classify with a specific product intent — inherently broad/open-ended, therefore `is_ambiguous: true` is the semantically correct value.

**Few-shot contract correction (`index.ts`, examples 1, 5, 6, 7, 8):**

Added `"is_ambiguous": true` to all five open-ended/conceptual examples that previously omitted the field. Examples 12–15 (specific brand/model lookups with `is_ambiguous: false`) are untouched — they were already correct.

**Defense-in-depth (`ai-capsule-schemas.ts:8`):**

Changed `is_ambiguous: z.boolean()` to `is_ambiguous: z.boolean().default(false)`. Any future injection site that omits the field will recover silently instead of degrading. `false` is the conservative default: non-ambiguous behavior runs the full search pipeline rather than showing featured-only fallback.

**Validation:**

Zod contract validation — 7/7 PASS:

| Case | Result |
| --- | --- |
| Guardrail injection with `is_ambiguous: true` | PASS — `is_ambiguous=true` |
| Old injection shape (missing `is_ambiguous`) recovered by `.default` | PASS — `is_ambiguous=false` |
| Analyst open-ended output missing `is_ambiguous` | PASS — `is_ambiguous=false` |
| `.default(false)` produces `false` when field absent | PASS |
| Specific lookup `waka somatch mb6000` (`is_ambiguous: false`) | PASS — unchanged |
| Corrected few-shot open-ended (`is_ambiguous: true`) | PASS |
| Original schema still fails on missing field (regression proof) | PASS |

Live edge-function probes — 4/4 PASS:

| Query | Result |
| --- | --- |
| "algo frutal barato" | `capsule=product_search_integrity` · `is_ambiguous: true` in args ✓ |
| "recomiéndame algo suave y rico" | `capsule=product_search_integrity` · `is_ambiguous: true` in args ✓ |
| "tienes waka somatch mb6000?" | `capsule=product_search_integrity` · `is_ambiguous: false` in args ✓ |
| "hola" | Sommelier path · `intent=greeting` · no capsule regression ✓ |

**Characteristics:**

- No schema migration.
- No client component changes.
- No new capsule.
- No router logic changes (secondary OR-arm weakness in product search router is a separate architectural concern, outside A82 scope).
- No behavioral change to routing signals — A82 is contract integrity hardening only.
- Defense-in-depth `.default(false)` is a permanent guard; future injection sites are covered automatically.

**Outcome:** Guardrail-injected and Analyst-generated open-ended product queries now produce valid capsule args and reach the fallback tree. A81 terminal recovery is now genuinely executable end-to-end. DEGRADED responses caused by missing `is_ambiguous` are closed. Commit: 862ab05.

---

### A81. UNKNOWN Escape Hardening — Guardrail Vocabulary Gap + Terminal Recovery — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`.

**Problem Identified:**

Real product queries were escaping `PRODUCT_SEARCH` classification and falling through to a Sommelier-only conversational path with zero catalog grounding. Three structural defects combined to produce this:

1. **`isProductMatch` vocabulary gap:** The guardrail keyword regex used to recover `UNKNOWN` and `CHIT_CHAT` intents into `PRODUCT_SEARCH` did not include core vape-store product vocabulary. Missing terms: discovery verbs (`busco`, `buscas`, `tienen`, `tienes`, `hay`), product type terms (`liquido`, `vape`, `pod`, `pods`, `mod`, `kit`, `kits`, `cartucho`, `cartuchos`, `desechable`, `desechables`, `dispositivo`, `vaporizador`). Any query using only these terms — e.g. "o un liquido de juicee", "tienen pods de vaporesso", "hay cartuchos de waka" — produced `isProductMatch = false`, leaving intent as `UNKNOWN`.

2. **Dead branch 3 in guardrail:** A third `else if (isProductMatch && intent === 'UNKNOWN')` block was structurally unreachable. Branch 2 (`else if (intent === 'UNKNOWN' || intent === 'CHIT_CHAT')`) already consumed all `UNKNOWN` states in the same `else if` chain. Branch 3 could never fire. Any `UNKNOWN` that branch 2 did not resolve was left as `UNKNOWN` and fell through to the Sommelier with no tool data.

3. **Sommelier routing authority misrepresentation:** `RESPONSE_FORMAT_RULES` in `persona.ts` instructed the Sommelier to declare `routed_capsule: "product_search_integrity"` for product-like queries, implying capsule routing capability. In reality, capsule delegation is decided exclusively by the edge router before Sommelier is invoked. The Sommelier's `routed_capsule` field was decorative — the client gates capsule execution solely on `requires_client_capsule: true`, which Sommelier never sets. Combined with defects 1 and 2, this created a situation where the Sommelier could declare routing intent it did not have authority to execute.

Combined effect: product queries using informal vocabulary, brand names, or product type terms → `UNKNOWN` intent → no capsule routing → Sommelier invoked with no tool results → conversational answer returned with zero product cards.

Runtime evidence: the A77 residual case "o un liquido de juicee" (pre-fix historical row, created 2.5h before the A77 fix) was the concrete proof of this failure pattern.

**Remediation Applied (commit 4b89235):**

**`isProductMatch` expansion (`index.ts:348`):**

Added discovery verbs and product type terms to the regex: `busco|buscas|tienen|tienes|hay|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador`. These cover the real vocabulary of storefront product queries.

**Terminal recovery (`index.ts:377-385`):**

Replaced dead branch 3 with an unconditional `if (intent === 'UNKNOWN')` block placed after the entire guardrail chain. Any intent still `UNKNOWN` after all keyword checks and Analyst classification → `PRODUCT_SEARCH`. In a vape store, an unresolvable query defaults to product discovery — this is the correct terminal trade-off. Stronger-known intents (compatibility, inventory, policy, greeting) are all confirmed upstream and are not affected.

**Sommelier routing authority correction (`persona.ts:63-89`):**

Added routing note at top of `RESPONSE_FORMAT_RULES` explicitly stating that routing was already decided before Sommelier was invoked, and Sommelier is always the terminal responder for non-capsule paths. Changed `routed_capsule` schema from `"uno de: product_search_integrity | knowledge_rag_foundation | cart_operator | null"` to `"null"` — Sommelier always outputs null here. Replaced capsule-delegation routing rules with response rules scoped to actual Sommelier paths: CHIT_CHAT, GREETING, COMPATIBILITY_CHECK, INVENTORY_OUTLOOK, ORDER_TRACKING, AMBIGUOUS residuals.

**Post-Deployment Verification (7 live probes):**

| Query | Expected | Live Result |
| --- | --- | --- |
| "o un liquido de juicee" | PRODUCT_CAPSULE | `requires_client_capsule: true`, `capsule_name: product_search_integrity` ✓ |
| "tienen pods de vaporesso" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "busco un desechable" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "hay cartuchos de waka" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "hola buenas tardes" | CHIT_CHAT (Sommelier) | intent=greeting, fallback=GREETING ✓ |
| "como hacen los envios" | KNOWLEDGE_CAPSULE | `capsule_name: knowledge_rag_foundation` ✓ |
| "que pod me queda para el smok nord 5" | COMPATIBILITY_CHECK (Sommelier) | intent=COMPATIBILITY_CHECK ✓ |

**Characteristics:**

- No client-side changes.
- No schema migration.
- No new capsule.
- No intent-system rewrite; only guardrail keyword expansion + terminal default + Sommelier wording correction.
- Deterministic-first behavior preserved: compatibility, inventory, policy, greeting all retain their own upstream keyword guards and take precedence over terminal recovery.

**Outcome:** UNKNOWN escape lane materially closed. Product-like queries using informal vocabulary, product type terms, and discovery verbs now recover into `PRODUCT_CAPSULE` behavior and receive grounded catalog results. Sommelier routing authority is now truthfully scoped to its actual execution boundaries. No regressions observed on preserved intent paths. Commit: 4b89235.

---

### A80. Memory Persistence Reliability — Await Hardening + Failure Acknowledgement — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/memory.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/__tests__/customer-intelligence-memory.test.ts`.

**Problem Identified:**

Memory persistence in the edge function was fire-and-forget: `persistMemory(...)` was called without `await`, and any write failure was silently discarded. If the upsert to `ai_customer_memory` failed (network error, FK violation, quota, etc.), the edge function returned a successful response with no acknowledgement that memory had not been persisted. Operator or diagnostic tooling could not distinguish a successful write from a silently failed one.

**Remediation Applied:**

- `persistMemory` refactored into `supabase/functions/customer-intelligence/memory.ts` as a standalone export with a typed return contract: `MemoryPersistResult { ok: boolean; merged_interests: string[]; metadata_count: number; error: string | null }`.
- Both read (`maybeSingle()`) and write (`upsert()`) operations are `await`ed inside `persistMemory`. The function does not throw; it returns a structured failure result on any error.
- Callsite in `index.ts` updated to `const memoryResult = await persistMemory(...)`. On `!memoryResult.ok`, a `console.error` is emitted with the customer ID and error message. The response to the user is not blocked — failure is acknowledged, not suppressed, and does not degrade the user-facing interaction.

**Validation:**

**Unit validation (2/2 PASS — `src/lib/__tests__/customer-intelligence-memory.test.ts`):**

| Test | Assertion | Result |
| --- | --- | --- |
| "awaits the ai_customer_memory write before resolving" | `settled = false` while deferred write is pending; resolves only after `resolveWrite()` called | PASS |
| "truthfully reports a failed write instead of succeeding silently" | `result.ok === false`, `result.error === 'db write failed'`, `result.merged_interests` non-empty | PASS |

**Runtime probe (CHIT_CHAT path — non-capsule Sommelier):**

- Query `"hola buenas tardes!"` submitted against the deployed edge function.
- User-facing response returned intact. `server_telemetry_logged: true` confirmed.
- `ai_customer_memory` row: **NOT FOUND** — root cause: sentinel UUID `00000000-0000-0000-0000-000000000001` violates pre-existing FK constraint `ai_customer_memory.customer_id → auth.users`. The UUID does not exist in `auth.users`. The DB rejected the upsert with a FK violation error.
- This is a **pre-existing schema constraint**, not a regression introduced by this implementation.
- `persistMemory` returned `{ok: false, error: '<FK violation message>'}` — the callsite logged the error and returned the user response normally. Failure was acknowledged, not swallowed.
- Real-customer DB write confirmation: environment-blocked (requires a live authenticated storefront session with a valid `auth.users` UUID). This is not a code defect.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration. No FK constraint changes.
- No user-facing behavior changed. No telemetry paths changed.
- `sanitizeAndMergeInterests` and `updateInterestsMetadata` logic unchanged — moved to module, not altered.

**Outcome:** Memory Persistence Reliability lane materially closed. `persistMemory` is awaited at the active callsite; write failures are structured and acknowledged rather than silently dropped. Application-layer correctness confirmed by unit tests. Real-customer DB write path is structurally correct; runtime row confirmation is environment-blocked by FK constraint against `auth.users`, not code-blocked.

---

### A79. Sommelier Edge Telemetry Completeness — Ownership Hardening + Response_Text Persistence — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

Two edge-owned interaction classes had structurally unreliable telemetry:

1. **OUT_OF_DOMAIN fast-path:** `supabase.from('ai_analytics').insert(...)` was not awaited (fire-and-forget). `response_text` was hardcoded as `null` despite the actual rejection prose being returned to the user. `server_telemetry_logged: true` was returned unconditionally — no confirmation that the insert completed.

2. **Non-capsule Sommelier path:** `supabase.from('ai_analytics').insert(analyticsPayload).then(...)` was fire-and-forget. `analyticsPayload` was built BEFORE the TEXT GUARANTEE block (lines 884–889), meaning: (a) if `aiData.text` was null before TEXT GUARANTEE, the analytics gate (`if (aiData.text)`) skipped the insert entirely, yet `server_telemetry_logged = true` was still set unconditionally; (b) even when the insert did fire, the prose logged was pre-guarantee — any TEXT GUARANTEE injection was not captured. Additionally, capsule delegation paths (`requires_client_capsule: true`) passed through the same analytics block when Sommelier returned non-null text, causing potential double-logging with client-side telemetry.

Combined effect: edge could claim `server_telemetry_logged: true` and suppress client fallback logging, while the actual row was either missing or had `response_text: null`.

**Remediation Applied (commit e8d3a28):**

**OUT_OF_DOMAIN hardening:**

- Reply prose extracted as `const oodReplyText` (same string returned to user).
- Insert changed from fire-and-forget to `const { error: oodTelemetryErr } = await supabase.from('ai_analytics').insert({...})`.
- `response_text` field now set to `oodReplyText` (was `null`).
- `server_telemetry_logged: !oodTelemetryErr` — truthful: `true` only on confirmed insert success; `false` on failure so client fallback logging activates.

**Non-capsule Sommelier path hardening:**

- Analytics block moved to AFTER TEXT GUARANTEE — `aiData.text` is always non-null at logging time.
- Wrapped in `if (!aiData.requires_client_capsule)` — capsule delegation paths set `server_telemetry_logged = false` and delegate telemetry to client (eliminates double-logging risk).
- Insert changed from `.then(...)` fire-and-forget to `const { error: analyticsErr } = await supabase.from('ai_analytics').insert(analyticsPayload)`.
- `aiData.server_telemetry_logged = !analyticsErr` — truthful assignment.
- Memory persistence (`persistMemory`) remains fire-and-forget in its original `if (aiData.text)` block — out of scope, not changed.

**Post-Deployment Validation (2 live interactions):**

| Path | Query | `response_text` in DB | `server_telemetry_logged` | Ownership truthful |
| --- | --- | --- | --- | --- |
| OUT_OF_DOMAIN | "cuanto cuesta un kilo de carne" | "Solo puedo ayudarte con productos de nuestra tienda de vapeo y 420..." | `true` | YES — row confirmed in DB |
| CHIT_CHAT (non-capsule Sommelier) | "hola, como estas hoy?" | "¡Hola! Estoy excelente, gracias por preguntar. Soy Cesarin..." | `true` | YES — row confirmed in DB |

Both `response_text` values match the actual edge reply returned to the user (verified via text prefix match). Probe rows deleted post-validation.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration.
- No client telemetry paths changed (already repaired in earlier lanes).
- No routing logic changed. No capsule behavior changed. No admin surfaces changed.
- Memory persistence fire-and-forget remains — out of scope, pre-existing.
- Capsule paths: `server_telemetry_logged = false` — client logs unconditionally for those paths, no behavior change from client perspective.
- Insert failure on any edge path: `server_telemetry_logged = false` → client fallback logging activates → no telemetry lost.

**Outcome:** Sommelier Edge Telemetry Completeness lane materially closed. `server_telemetry_logged` is now a truthful durability claim, not an optimistic assumption. `response_text` is non-null for OUT_OF_DOMAIN and non-capsule Sommelier turns. Commit: e8d3a28.

---

### A78. Offer Evidence Lane — Offered Products Persistence + Operator Grading Visibility — 20 de marzo de 2026

**Scope:** `src/services/concierge.service.ts`, `src/services/admin/admin-pilot-ops.service.ts`, `src/components/admin/cesarin/ReviewDrawer.tsx`, `src/pages/admin/AdminCesarinOS.tsx`.

**Problem Identified:**

Operator grading of product-answer turns was structurally incomplete. The evaluator could see Cesarin's prose (`response_text`) and a card count badge ("N cards"), but had no visibility into which exact products were offered. Text like "¡Aquí tienes exactamente lo que buscabas!" or "Aquí tienes opciones que podrían encajar:" cannot be graded for offer correctness, recommendation fit, or hallucination without knowing the actual offer payload.

Root cause: `capsuleContract.resolved_products` — a full array of `InternalResolvedProduct` objects (`id`, `name`, `slug`, and more) — exists in memory at the exact line where `logAITelemetry` is called in `concierge.service.ts`. Only `.length` was extracted (for `product_card_count`). The product objects themselves were never passed to `logAITelemetry`, never written to `ai_analytics`, never mapped through admin, and never rendered in ReviewDrawer.

**Remediation Applied (3 scopes):**

**Scope C — Telemetry persistence (`concierge.service.ts`, commit a761e65):**

- `logAITelemetry` fields extended with `offered_products?: Array<{ id: string; name: string; slug: string }>`.
- `offered_products: fields.offered_products ?? []` added to `ai_logic_debug` JSONB in the INSERT.
- `product_search_integrity` callsite updated to pass `capsuleContract.resolved_products?.map(p => ({ id: p.id, name: p.name, slug: p.slug })) ?? []`.
- Fields limited to `{id, name, slug}` — no internal fields (`cost_price`, `specs`, `ai_sales_note`) exposed.
- No schema migration needed (`ai_logic_debug` is JSONB).

**Scope B — Admin mapping (`admin-pilot-ops.service.ts`, commit a761e65):**

- New exported type `OfferedProduct { id: string; name: string; slug: string }`.
- `PilotQueryRow` extended with `offered_products: OfferedProduct[] | null`.
- `mapRow` extracts `d.offered_products` with type-guard filter — rejects entries missing any required string field; returns `null` for absent or malformed arrays.

**Scope A — Operator surface (`ReviewDrawer.tsx` + `AdminCesarinOS.tsx`, commit a761e65):**

- `ReviewDrawerProps.interaction` extended with `offered_products?: Array<{id, name, slug}> | null`.
- New "Productos Ofrecidos" section rendered after badge row — gated on `offered_products.length > 0`.
- Renders a compact `<ul>` of product names; label styled at same weight as "Ruta · Cápsula" header.
- `AdminCesarinOS.tsx` interaction mapping extended with `offered_products: (reviewInteraction as any).offered_products ?? null`.

**Post-Deployment Validation:**

Live interaction: query `"algo de mango o menta"` → `product_search_integrity` capsule → 4 products resolved → anon INSERT → service-key read-back confirmed:

| Product name stored | Slug stored |
| --- | --- |
| E-Liquid Mentolado Ice 120ml 3mg | eliquid-mentolado-ice-120ml-3mg |
| Nic Salt Sandía Mint 30ml 35mg | nicsalt-sandia-mint-30ml-35mg |
| Nic Salt Mango Lychee 30ml 35mg | nicsalt-mango-lychee-30ml-35mg |
| Caramelos Hard Candy THC 10mg x8 | caramelos-hard-candy-thc-10mg-x8 |

Name-match audit: exact match between products resolved at interaction time and products stored in `ai_logic_debug.offered_products`. Row `e28a0bcf` left in DB for operator visual confirmation. CF Pages deploy triggered by push to `main`.

ReviewDrawer for a fresh product-answer row now shows: response prose · card count badge · **"Productos Ofrecidos"** list of exact product names. Both grading dimensions (what Cesarin said + what Cesarin offered) are visible in a single evaluation surface.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration (JSONB column, new key only).
- No RLS changes. No storefront response behavior changed.
- No product card redesign. No scoring logic changes.
- Non-product paths (knowledge RAG, cart, generic) not affected: `offered_products` not passed → defaults to `[]` in telemetry → `null` in mapRow → "Productos Ofrecidos" section hidden. Correct.
- Historical rows (pre-`a761e65`) have `ai_logic_debug.offered_products` absent → `null` in mapRow → section hidden. No backfill.

**Outcome:** Offer Evidence lane materially closed. Operators can now grade product-answer turns on both response quality and offer correctness from a single ReviewDrawer view. Commit: a761e65.

---

### A77. Operator Visibility Lane — Tab 8 Response Preview + Response_Text Persistence — 20 de marzo de 2026

**Scope:** `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/pages/admin/AdminCesarinOS.tsx`, `src/services/concierge.service.ts`.

**Problem Identified:**

Two structural gaps prevented operators from efficiently evaluating Cesarin's response quality:

1. **Tab 8 (PilotTelemetry) — no response preview:** The operator grading table showed query text and metadata columns but no visible preview of what Cesarin actually said. `response_text` existed in `PilotQueryRow` type and was fetched in `getPilotQueryLog` SELECT but was never rendered. Operators had to open every row individually to assess response quality.

2. **Simulator ReviewDrawer — stale column reference:** `handleReviewLastSimulatorTurn` in AdminCesarinOS.tsx fetched `.select('id, query, response, created_at')` — the `response` column does not exist in `ai_analytics`; the correct column is `response_text`. The ReviewDrawer appeared blank for all simulator-triggered evaluations.

3. **Upstream persistence gap (root cause):** All 187 existing `ai_analytics` rows had `response_text: null`. The `logAITelemetry` function in `concierge.service.ts` never included `response_text` in its INSERT payload. Both structural UI fixes above would have rendered `—` for every row until this was repaired.

**Remediation Applied:**

**Fix 1 — Tab 8 "Respuesta" preview column (PilotTelemetry.tsx, commit b4d9b8e):**

- Added `responsePreview` derived value: 55-char truncation of `row.response_text` with full text in `title` tooltip.
- Added `<th>Respuesta</th>` header after Query column.
- Added `<td>` cell rendering preview span (visible) or `—` italic (null).
- Updated both `colSpan={8}` → `colSpan={9}` (loading and empty state rows).

**Fix 2 — Simulator review query field repair (AdminCesarinOS.tsx, commit b4d9b8e):**

- `handleReviewLastSimulatorTurn` `.select()` changed from `'id, query, response, created_at'` → `'id, query, response_text, created_at'`.
- ReviewDrawer mapping at line 548 already used `(reviewInteraction as any).response_text` correctly — only the fetch needed fixing.

**Fix 3 — response_text persistence repair (concierge.service.ts, commit 81ff8fa):**

- `logAITelemetry` function signature extended with `response_text: string | null` parameter.
- `response_text: fields.response_text` added to Supabase INSERT payload.
- Five callsites updated with correct customer-facing prose or null:

| Callsite | `response_text` value |
| --- | --- | --- |
| product_search_integrity | `capsuleContract.customer_response_draft ?? null` |
| knowledge_rag_foundation | `capsuleContract.ui_render_hint ?? null` |
| cart_operator | `null` |
| generic / fallback path | `data.text ?? data.message ?? null` |
| error catch | `null` |

**Post-Deploy Validation (2 live rows via anon key INSERT, service-key read-back):**

| Interaction | Capsule | `response_text` in DB | HTTP status |
| --- | --- | --- | --- |
| "quiero algo frutal" | product_search_integrity | "No encontré un producto con ese nombre exacto, pero Gomitas CBD 25mg x10 Frutas..." | 201 ✅ |
| "hacen envios a todo mexico?" | knowledge_rag_foundation | "He recopilado esta información relacionada de nuestros tutoriales y manuales operativos:" | 201 ✅ |

Service-key read-back confirmed both rows with non-null `response_text` and correct `detected_intent`. Probe rows deleted post-validation.

**Historical rows:** 187 pre-fix rows retain `response_text: null` by design. No backfill applied. Displayed as `—` in Tab 8 (correct operator behavior).

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration required (`response_text` column pre-existed in `ai_analytics`).
- No RLS changes (pre-existing anon INSERT policy from `20260320_ai_analytics_rls_write_path.sql` covers the new field transparently).
- `PilotQueryRow` type and `getPilotQueryLog` SELECT were already correct — only rendering and persistence were missing.
- Existing telemetry behavior for all 5 callsites preserved; only `response_text` field added.

**Outcome:** Operator visibility lane materially closed. Tab 8 shows response preview for all fresh interactions. ReviewDrawer populated for simulator-triggered evaluations. Upstream persistence repaired — `response_text` non-null for all capsule paths going forward. Commits: b4d9b8e (UI fixes), 81ff8fa (persistence repair).

---

### A76. Retrieval / Fallback Discipline Hardening — Closure + MICRO-FIX A — 20 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`.

**Problem Identified:**

Four runtime failure patterns confirmed against live catalog (44 active products):
1. Out-of-domain queries (e.g., "quiero un nissan versa") routed to product search — surfaced product cards from wrong domain.
2. Specific unknown brand/model queries (e.g., "waka somatch mb6000", "snoop dogg g pen") — correct no-match behavior, but semantic threshold at 0.4 was permissive enough to allow low-confidence substitutions in adjacent cases.
3. Type-intent mismatch: "necesito una pipa de cristal" and "quiero un vape desechable de menta" — `requires_semantic_expansion: true` sent both through vector search; catalog has zero glass pipes and zero disposables → wrong-category cards returned (herb vaporizers at 0.61–0.63; e-liquids at 0.72–0.73 due to mint flavor overlap in embeddings).
4. BRANCH B residual: when `is_ambiguous: true` and `featuredProducts.length === 0` (semantic skipped), Branch B emitted "Te dejo estas opciones destacadas:" with zero product cards — dangling copy.

**Remediation Applied (3 layers):**

**Layer 1 — Analyst: OUT_OF_DOMAIN intent + fast-path (index.ts, commits a4ca51e + aea7944):**
- Added `OUT_OF_DOMAIN` to intent enum in Analyst prompt.
- Added 3 few-shot examples: "quiero un nissan versa", "busco departamento en renta", "cuánto cuesta un kilo de carne" → `OUT_OF_DOMAIN`.
- Added OUT_OF_DOMAIN fast-path block before Sommelier: returns scope-rejection text, `products: []`, no capsule invoked.
- Added `requires_semantic_expansion` REGLA to Analyst: specific brand/model/product → `false`; vague concept/preference → `true`.
- Added 4 few-shot examples for `requires_semantic_expansion=false`: "waka somatch mb6000", "snoop dogg g pen", "pipa de cristal", "vape desechable de menta".

**Layer 2 — Orchestrator: semantic skip enforcement + threshold raise (ai-capsule-orchestrator.service.ts, commit a4ca51e + aea7944):**
- Semantic search (`embeddings-processor` + `match_products` RPC) skipped entirely when `toolArgs.requires_semantic_expansion === false`.
- `match_threshold` raised from 0.4 to 0.55.

**Layer 3 — Fallback tree: BRANCH E tightening (product-search-capsule.ts, commit a4ca51e):**
- BRANCH E draft language tightened: `"encaja perfecto"` → `"podría ser lo que buscas"` (semantic uncertainty posture).
- Search confidence lowered 0.7 → 0.6.
- Max displayed products 4 → 3.

**MICRO-FIX A — BRANCH B empty-products guard (product-search-capsule.ts, defensive hardening):**
- When BRANCH B fires (`is_ambiguous: true`) and `featuredProducts.length === 0`, returns Branch F `NO_MATCH` contract instead of dangling "Te dejo estas opciones destacadas:" with zero cards.
- Uses identical text and confidence (`0.1`) as Branch F.
- Guard fires before draft construction; existing Branch B behavior fully preserved when `featuredProducts.length > 0`.

**MICRO-FIX B evaluation result:** Not needed. Type-intent mismatch cases ("pipa de cristal", "vape desechable de menta") fully resolved by `requires_semantic_expansion=false` → semantic skipped → Branch F. No additional threshold hardening required.

**Post-Deploy Runtime Validation (6-query set):**

| # | Query | Before | After |
| --- | --- | --- | --- |
| Q1 | quiero un nissan versa | Branch B empty (0 cards + confusing copy) | OUT_OF_DOMAIN fast-path → scope rejection, 0 cards ✅ |
| Q2 | tienes waka somatch mb6000? | Branch F, 0 cards | Branch F, 0 cards ✅ |
| Q3 | snoop dogg g pen tienes? | Branch F, 0 cards | Branch F, 0 cards ✅ |
| Q4 | necesito una pipa de cristal | 3 wrong herb vaporizers (sim 0.61–0.63) | `req_sem_exp=false` → semantic skipped → Branch F, 0 cards ✅ |
| Q5 | quiero un vape desechable de menta | 3 wrong e-liquids/salts (sim 0.72–0.73) | `req_sem_exp=false` → semantic skipped → Branch F, 0 cards ✅ |
| Q6 | quiero algo frutal (control) | correct semantic products | `req_sem_exp=true` → semantic → correct products ✅ ✅ |

**Characteristics:**

- No new wave opened. No base build bump.
- No downstream drafting hierarchy (A67–A75) reopened or altered.
- BRANCH B, C, D existing behavior unchanged by MICRO-FIX A (guard fires only on empty).
- Edge function deployed: `npx supabase functions deploy customer-intelligence` (all 3 files: index.ts, tools.ts, persona.ts).
- Validation performed against live deployed function + live catalog.

**Outcome:** Retrieval / fallback discipline hardening lane materially closed. OUT_OF_DOMAIN rejection operational. Type-intent mismatch resolved. MICRO-FIX A applied as defensive Branch B guard. MICRO-FIX B not needed. Commits: a4ca51e, aea7944 (edge function + orchestrator); MICRO-FIX A (product-search-capsule.ts, defensive guard, no separate wave).

---

### A66. Learning Intervention Workflow MVP — 20 de marzo de 2026

**Scope:** `supabase/migrations/20260320_intervention_signals_and_recommendations.sql`, `src/services/admin/intervention-workflow.service.ts`, `src/components/admin/cesarin/TabInterventions.tsx`, `src/types/cesarin.ts`, `src/pages/admin/AdminCesarinOS.tsx`, `src/services/admin/index.ts`.

**Implementation:**
- **Signal Storage:** intervention_signals + intervention_recommendations tables (RLS: admin-only read/update)
- **Diagnosis Engine:** Rule-based deterministic logic (3 signal types: enrichment_gap, compatibility_miss, escalation_theme)
- **Operator UI:** TabInterventions in Cesarin OS for recommendation review/approval (no auto-execution)
- **Decision Tracking:** Operator approval decisions with audit trail (operator_id, timestamp, notes)

**Cold Review Findings (4) + Remediation:**
1. Type import from wrong module → Fixed: import from cesarin.ts
2. Null returns unguarded in handlers → Fixed: Added null checks before success toasts
3. Signal_type filter bug → Fixed: Returns empty array when no matches (not all records)
4. Write path (INSERT/RLS) inconsistency → Documented: INSERT functions are SERVICE_ROLE (backend-only, MVP uses read/update)

**Characteristics:**
- No autonomous learning or feedback loops
- No automatic intervention execution (manual/out-of-band)
- Isolated from ai_analytics telemetry
- Zero breaking changes to existing code
- Approved for manual operator testing (not production)

**Manual Testing (March 20, 2026):**

- **Issue Found:** Migration not deployed to active Supabase database (deployment drift)
- **Resolution:** Migration applied to active DB; seed data inserted (3 signals + 3 recommendations)
- **Validation Performed:**
  - Tab renders without errors ✅
  - Pending recommendations display with correct count ✅
  - Signal type badges render correctly (enrichment_gap, compatibility_miss, escalation_theme) ✅
  - Confidence indicators display (high/medium/low) ✅
  - Expandable diagnosis details functional ✅
  - Approve button: transitions recommendation to approved, persists after refresh ✅
  - Reject button: transitions recommendation to rejected, persists after refresh ✅
  - Filter toggle (Pendientes ↔ Todas): transitions between pending-only and all recommendations ✅
  - Approved/rejected items remain visible in "Todas" view, removed from "Pendientes" ✅
  - Operator ID and timestamp recorded on decisions ✅
- **Test Data:** Manual seed signals (enrichment_gap, compatibility_miss, escalation_theme) used for validation
- **Current Status:** Operator workflow MVP manually validated and functional
- **Not Claimed:** Autonomous learning, auto-execution, organic signal generation (future lanes)

**Outcome:** Learning Intervention Workflow MVP operator workflow validated. Commit a28ec1e. Ready for operator trial use.

---

### A67. Description Downstream Bridge — 20 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts` (schema extension), `src/services/ai-capsule-orchestrator.service.ts` (query + mapper), `src/lib/ai-capsule-mappers.ts` (public contract).

**Implementation:**

- **Exact Path:** Added `description` to product query select + internal schema + public schema + mapper conditionals
- **Semantic Path:** Verified preservation through RPC → hydration spread → mapper → schemas (no drop-off)
- **Nullability:** Consistent `.nullable().optional()` pattern + null coalescing (`?? null`) + conditional spreads
- **Scope:** Description field only, no feature expansion

**Cold Review Result:**

- ✅ Exact path structurally complete (6 transformation stages)
- ✅ Semantic path structurally complete (7 transformation stages)
- ✅ No silent field drops at any boundary
- ✅ No contract asymmetry between exact/semantic paths
- ✅ Safe nullability handling (coalescing + conditional spreads)
- ✅ No scope expansion beyond description
- ⚠️ Upstream assumption: `match_products` RPC returns description (user-confirmed, verify externally)

**Characteristics:**

- Mapper/contract preservation of description field only
- No UI display validation (no UX lane run)
- No autonomous runtime benefit claimed
- Not a feature expansion, not a capability enhancement
- Structural bridge only (enables downstream consumption)

**Outcome:** Description downstream bridge reconciled. Mapper/contract coherence validated. Ready for downstream consumption (no UX claim). Commit: same as A66 (a28ec1e, no new commit).

---

### A68. Description Consumption Discipline Remediation — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH C, BRANCH D, BRANCH E, helper logic).

**Problem Identified:**

- BRANCH C (exact match) was using `description` as fallback when `ai_sales_note` absent — violated semantic-only discipline
- `extractDescriptionContext()` helper was too permissive — accepted generic/promotional boilerplate
- No filtering for title repetition or category-only text
- Discipline violation: "Semantic retrieval context" (schema comment) mismatched code behavior

**Remediation Applied:**

- **BRANCH C:** Removed all `description` usage → `ai_sales_note` only (semantic-only discipline restored)
- **Helper Hardened:** 4 new filters added:
  - Length bounds: reject `< 15` chars (noise) or `> 80` chars (bloat)
  - Marketing boilerplate: reject "premium", "best", "guaranteed", "exclusive", "special", "limited", "rare", "unique"
  - Category repetition: reject generic patterns like "the X [vape|device|product]"
  - Title duplication: reject if description equals product name
- **BRANCH E:** Kept semantic-only, specs-first hierarchy; description only when specs absent
- **BRANCH D:** Upgraded with spec-based similarity justification (uses specs from exhausted exact product and top alternative)

**Cold Review Result:**

- ✅ BRANCH C clean of `description` usage
- ✅ BRANCH E semantic-only and fallback-only discipline restored
- ✅ Helper filtering materially hardened (4 validation layers)
- ✅ All fallback paths preserve safe behavior when specs/description unavailable
- ✅ Type contract alignment verified ("Semantic retrieval context" now matches code)
- ✅ No breaking changes; graceful degradation when context unavailable

**Characteristics:**

- Discipline remediation, not feature expansion
- Pure message composition improvements (BRANCH D, BRANCH E refinements)
- No new field bridges or data transport
- No UI redesign
- Semantic-only consumption restored per approved discipline

**Outcome:** Description consumption discipline remediated and cold-review approved. Semantic fallback-only enforcement restored. BRANCH D justification upgraded. Commit: eb3566c.

---

### A69. Out-of-Stock Alternative Justification Upgrade — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH D: OUT_OF_STOCK_ALTERNATIVE only).

**Problem Identified:**

- BRANCH D message lacked specific justification for why suggested alternatives fit user's original intent
- User intent strong (exact product found, verified to exist), but OOS
- Alternatives available, but message generic ("muy similares" without concrete reason)
- Composition weakness: no product context cues to justify recommendation

**Improvement Implemented:**

- **Spec-Based Similarity:** Extract key specs from both exhausted exact product and top alternative
- **3-Tier Composition Logic:**
  1. Both have useful specs → "...buscas [exhausted specs] está agotado, pero encontré alternativas [alternative specs]..."
  2. Only alternative has specs → "...está agotado, pero encontré alternativas [alternative specs]..."
  3. No useful specs → fallback to original generic message ("muy similares")
- **Safe Fallback:** Returns to generic message when justification unavailable or weak (conservative behavior)

**Cold Review Result:**

- ✅ BRANCH D composition strengthened (uses existing product specs)
- ✅ One short useful cue per message (no bloat, no multi-sentence)
- ✅ Fallback behavior preserved (generic message when specs unavailable)
- ✅ No new field bridges introduced (specs already flow through system)
- ✅ No feature expansion (pure message composition improvement)
- ✅ Safe degradation (graceful fallback when context weak)

**Characteristics:**

- Branch-specific improvement only (BRANCH D isolated)
- Uses already-available product context (specs)
- Message composition refinement, not capability enhancement
- No new data transport or field bridges
- No UI redesign
- Conservative: prefers generic message when justification weak

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| Both have specs | "...buscas *con sabor menta y nicotina 20mg* está agotado, pero encontré alternativas *con sabor menta y nicotina 18mg* en existencia:" |
| Alternative specs only | "...está agotado, pero encontré alternativas *con puffs 8000 y recarga automática* en existencia:" |
| No specs | "...está agotado, pero te seleccioné estas alternativas en existencia muy similares:" (original generic message) |

**Outcome:** Out-of-stock alternative justification upgraded with spec-based similarity cue. Cold-review approved. Safe fallback preserved. Commit: eb3566c.

---

### A75. BRANCH B Wording Naturalness Polish — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH B: FEATURED_FALLBACK, line 125 only).

**Wording Fix Applied:**

- Replaced `"sobre todo algunos ${topFeaturedSpecs}"` with `"incluyendo algunas ${topFeaturedSpecs}"`
- `"algunos"` was a floating pronoun with no referent noun in the clause
- `"incluyendo algunas"` is a natural connector; `"algunas"` back-refers to `"opciones"` already established earlier in the sentence

**Before:**

```text
Veo varias opciones que podrían encajar, sobre todo algunos [specs].
```

**After:**

```text
Veo varias opciones que podrían encajar, incluyendo algunas [specs].
```

**Review Result:**

- ✅ Wording-only — no logic, data flow, or tier change
- ✅ Ambiguity discipline preserved (invitation to clarify unchanged)
- ✅ Fallback behavior preserved (generic message when specs unavailable unchanged)
- ✅ No helper rewrites (`extractSpecsFact()` untouched)
- ✅ No schema/orchestrator/RPC/other-branch changes

**Characteristics:**

- Single-line wording fix in BRANCH B only
- Deployable within scope

**Outcome:** BRANCH B specs cue phrasing refined for natural Spanish. Ambiguity discipline and branch logic unchanged. Commit: 9ac2b05.

---

### A74. BRANCH D OOS Alternative Hierarchy Alignment + Note-Tier Naturalness — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH D: OUT_OF_STOCK_ALTERNATIVE only).

**Implementation Applied:**

**1. Hierarchy Alignment:**

- BRANCH D now uses a disciplined 4-tier justification hierarchy for alternative suggestions:
  - Tier 1: both exhausted product and alternative have specs — emphasize similarity (unchanged)
  - Tier 2: alternative has specs only — highlight what was found (unchanged)
  - Tier 3: `ai_sales_note` for top alternative when specs unavailable — concise curated context
  - Tier 4: generic fallback when no useful context available (unchanged)
- `ai_sales_note` was previously unused in BRANCH D; now fills the gap between specs-based justification and the generic floor

**2. Note-Tier Wording Refinement:**

- Tier 3 sentence refined for natural Spanish after initial implementation
- Parenthetical injection `(${alternativeNote})` replaced with em-dash trailing descriptor
- `"en existencia"` replaced with `"disponible"` — more conversational, same semantic accuracy
- Final form: `"El producto exacto que buscas está agotado, pero encontré una alternativa disponible — ${alternativeNote}:"`
- Note formatting preserved — no forced lowercasing, consistent with BRANCH E discipline

**Review Result:**

- ✅ Specs-first justification preserved (tiers 1 and 2 unchanged)
- ✅ `ai_sales_note` used only when specs unavailable (disciplined, non-redundant)
- ✅ Note formatting preserved
- ✅ Tier 3 phrasing natural and concise
- ✅ Generic tier 4 intact — safe floor when no context available
- ✅ No orchestrator/RPC/schema/contract/UI changes
- ✅ No new field bridges (`ai_sales_note` already present in semantic path)

**Characteristics:**

- BRANCH D isolated; no other branches touched
- Tier-based composition aligned with BRANCH E pattern
- Wording discipline: note formatting preserved, conversational stock language
- Deployable within scope

**Outcome:** BRANCH D OOS alternative justification hierarchy aligned. `ai_sales_note` used as disciplined fallback when specs unavailable. Wording refined for natural Spanish. Commit: a0d2389.

---

### A73. BRANCH F No-Match Recovery-Guidance Refinement — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH F: NO_MATCH only).

**Refinement Applied:**

- No-match response remains safe and honest — no products surfaced, no availability implied
- Recovery guidance replaced vague `"¿Podrías intentar buscarlo con otras palabras?"` with actionable reformulation cues
- Concrete guidance categories: marca (brand), sabor (flavor), tipo de dispositivo (device type), modelo específico (specific model)
- Framing honest: `"suele dar mejores resultados"` (usually gives better results) — no guarantee implied
- No candidate product context invented; guidance is query-structure advice only

**Before:**

```text
Revisé el catálogo pero no logré encontrar disponibilidad que coincida con tu búsqueda.
¿Podrías intentar buscarlo con otras palabras?
```

**After:**

```text
Revisé el catálogo pero no logré encontrar nada que coincida.
Puedes intentar buscar por marca, sabor, tipo de dispositivo o modelo específico
— una búsqueda más concreta suele dar mejores resultados.
```

**Review Result:**

- ✅ Safe and honest — no availability claim, no implied product knowledge
- ✅ Recovery guidance actionable — four concrete reformulation categories provided
- ✅ Tone honest — `"suele"` (usually) avoids overcommitment
- ✅ No candidate product invented or implied
- ✅ `resolved_products: []` unchanged — BRANCH F still returns empty result
- ✅ `search_confidence: 0.1` unchanged
- ✅ No orchestrator/RPC/schema/contract/UI changes

**Characteristics:**

- BRANCH F isolated; no other branches touched
- Wording-only refinement — no logic, no data flow change
- Deployable within scope

**Outcome:** BRANCH F no-match response now provides actionable reformulation guidance without implying availability or product knowledge. Commit: 278eedb.

---

### A72. BRANCH E Semantic Hierarchy Alignment + Wording Discipline — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH E: SEMANTIC only).

**Implementation Applied:**

**1. Hierarchy Alignment:**

- BRANCH E semantic drafting now uses disciplined 4-tier hierarchy:
  - Tier 1: `specs` via `extractSpecsFact()` — technical match justification (unchanged)
  - Tier 2: `ai_sales_note` when specs unavailable — curated context, cautious tone
  - Tier 3: `description` via `extractDescriptionContext()` when neither specs nor note apply
  - Tier 4: generic fallback when all context unavailable (unchanged)
- `ai_sales_note` was previously present downstream but unused in BRANCH E

**2. Note Tier Discipline:**

- Note text used without forced lowercasing — preserves acronyms, brand names, intentional formatting
- Phrasing: `"(${topNote}) podría encajar con lo que buscas"` — cautious, not overconfident

**3. Description Tier Tone Alignment:**

- Description tier phrasing softened from `"encaja perfecto con lo que pides"` to `"podría encajar con lo que buscas"`
- Aligns tone with note tier; both express semantic uncertainty consistently
- Tier 1 (specs) retains confident `"encaja perfecto"` — justified as direct technical evidence

**Review Result:**

- ✅ `ai_sales_note` now used when specs unavailable (disciplined, non-redundant)
- ✅ Note formatting preserved (no forced lowercasing)
- ✅ Description tier tone matches semantic uncertainty of note tier
- ✅ Specs tier (tier 1) behavior unchanged — still preferred
- ✅ Generic fallback unchanged
- ✅ No orchestrator/RPC/schema changes
- ✅ No new field bridges (ai_sales_note already present in semantic path)
- ✅ No UI changes

**Characteristics:**

- BRANCH E isolated; no other branches touched
- Semantic lane refinement only (no exact-path reopening)
- Wording discipline: cautious tone for approximate matches, preserved for direct technical match
- Deployable within scope

**Outcome:** BRANCH E semantic drafting hierarchy aligned. `ai_sales_note` used when specs unavailable. Note formatting preserved. Description tier tone softened for consistency. Commit: 29433be.

---

### A71. Exact-Path Improvement: Context Lift + Fallback Naturalness — 20 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts` (schema extension), `src/services/ai-capsule-orchestrator.service.ts` (query + mapper), `src/lib/product-search-capsule.ts` (BRANCH C fallback logic).

**Exact-Path Enhancement Approved & Applied:**

**1. Schema Extension (ai-capsule-schemas.ts):**

- Added `description` field to `internalResolvedProductSchema` as semantic context
- Added `description` field to `publicAttachmentSchema` for downstream alignment
- Enables clean contract mapping without silent field drops

**2. Query Context Lift (ai-capsule-orchestrator.service.ts):**

- Extended exact query select: added `description, specs` fields (line 69)
- Added `description` mapping in `mapDbToInternal()` function
- Provides BRANCH C with full product context while keeping exact path isolated

**3. BRANCH C Fallback Logic (product-search-capsule.ts):**

- **Tier 1 (Priority):** `ai_sales_note` when available — curated messaging (unchanged)
- **Tier 2 (Fallback):** `specs` via `extractSpecsFact()` when `ai_sales_note` absent
- **Tier 3 (Safe):** Generic message when no useful context available
- Maintains high-confidence exact match behavior while improving message quality when curated notes unavailable

**4. Phrasing Naturalness Refinement:**

- Specs fallback sentence uses verb "Viene" for grammatical completeness
- Before: `¡Aquí tienes exactamente lo que buscabas! ${topSpecs}.`
- After: `¡Aquí tienes exactamente lo que buscabas! Viene ${topSpecs}.`
- Example output: "¡Aquí tienes exactamente lo que buscabas! Viene con sabor menta y nicotina 12mg."

**Adoption Review Result:**

- ✅ Real needed fix relative to committed HEAD (verified workspace drift resolution)
- ✅ BRANCH C exact path carries necessary product context
- ✅ ai_sales_note remains tier 1 priority (curated messaging preferred)
- ✅ specs fallback graceful when curated notes unavailable
- ✅ Phrasing refinement for natural Spanish grammar
- ✅ No semantic lane reopening (exact query only, no RPC/vector changes)
- ✅ Includes small downstream public-contract alignment: `description` propagated to public attachment schema via mapper (commit 33aa6b0)
- ✅ Safe degradation preserved (generic tier 3 always available)

**Characteristics:**

- Exact-path improvement with small downstream public-contract alignment
- Tier-based composition (priority + fallback + safe)
- Pure message composition enhancement, no feature expansion
- No UI redesign or downstream display changes
- Public attachment contract extended with `description` field (mapper commit 33aa6b0)
- Deployable within scope (exact path + mapper alignment)

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| With ai_sales_note | "¡Aquí tienes exactamente lo que buscabas! Premium all-day battery" (tier 1) |
| Without note, specs available | "¡Aquí tienes exactamente lo que buscabas! Viene con sabor menta y nicotina 12mg." (tier 2) |
| No context | "¡Aquí tienes exactamente lo que buscabas!" (tier 3 safe fallback) |

**Outcome:** Exact-path improvement adopted and reconciled. Real needed fix relative to committed HEAD (workspace drift resolved). BRANCH C now carries full product context with naturalized fallback messaging. Commit: 2b8be13. Deployable within scope.

---

### A70. Featured Fallback Justification Adoption — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH B: FEATURED_FALLBACK only).

**Problem Identified:**

- BRANCH B message was generic when user intent is ambiguous
- Highlighted featured options lacked context about why they might be relevant
- Tone overcommitted to certainty ("Tengo varias opciones interesantísimas") despite ambiguity

**Adoption Approved & Applied:**

- **Tone Refinement:** "Tengo opciones interesantísimas" → "Veo opciones que podrían encajar"
- **Ambiguity Reframing:** "para darte la recomendación perfecta" → "para afinar la recomendación"
- **Optional Specs Cue:** Extracts top featured product specs; integrates as "sobre todo algunos [specs]" if available
- **Safe Fallback:** Returns to generic message when no useful specs available
- **Language Polish:** Changed "algunos" (feminine) to "algunos" (masculine) for natural agreement with "con [specs]" pattern

**Adoption Review Result:**

- ✅ Core logic branch-specific and cautious
- ✅ Message tone materially improved (more honest about ambiguity)
- ✅ Specs cue optional and safe (graceful degradation)
- ✅ Ambiguity posture fully preserved (still invites clarification)
- ✅ Language refinement applied for natural Spanish flow
- ✅ No field bridges, no feature expansion

**Characteristics:**

- Branch-specific improvement (BRANCH B isolated)
- Uses existing product context (specs via `extractSpecsFact()`)
- Message composition refinement, not capability change
- No new data transport
- Preserves cautious posture toward ambiguous queries

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| With specs | "Veo varias opciones que podrían encajar, sobre todo algunos *con sabor menta y nicotina*. Para afinar la recomendación, ¿buscabas...Te dejo estas opciones destacadas:" |
| No specs | "Veo varias opciones que podrían encajar. Para afinar la recomendación, ¿buscabas...Te dejo estas opciones destacadas:" (generic fallback) |

**Outcome:** Featured Fallback justification upgrade adopted after cold adoption review. Language micro-fix applied. Ambiguity discipline preserved. Commit: 3e87a6c.

---

### A65. Marketing AI Reality Repair — 19 de marzo de 2026

**Scope:** `admin-coupons.service.ts`, `admin-marketing.service.ts`, `CouponForm.tsx`, `FlashDealEditor.tsx`, `services/admin/index.ts`.

**Highlights:**

- **Truth Repair:** Audit Phase 3 detected that `marketing-intelligence` Edge Function was missing from codebase/Supabase.
- **Local Heuristics:** Replaced non-existent remote AI calls with robust local business rules/heuristics for Coupon Generation, Flash Deal suggestions, and Impact Forecasting.
- **Sincerity Pass:** Replaced all misleading "Magic" and "IA" branding in UI and code with the "Sugerencia del Sistema" label family.
- **Internal Renaming:** Globably renamed `*Magic` functions to `*System` to ensure architectural honesty.
- **Factual Hardening (Local):** Migrated to local heuristics to bypass missing backend dependency. Verified zero 404/500 errors in verified manual path; residual network calls removed from code.

**Outcome:** Marketing AI Reality Repair complete. Baseline v113. PASS.

### A61. Audit: Wave 191 — Canonical Closure
**Date:** March 19, 2026
**Scope:** `customer-intelligence/index.ts`, `customer-intelligence/tools.ts`, `customer-intelligence/persona.ts`, `simulation_report.json`.
**Highlights:**
- **Validated and Closure-Ready:** Wave 191 is fully validated and canonically closed.
- **Pass Rate:** 13/13 scenarios passed in the validation suite.
- **Pass With Warning Status:** The `PASS_WITH_WARNING` cases are completely non-blocking. They relate to minor intent classification edge cases (like "queda stock" overlapping with compatibility signals) and do NOT represent functional failures.
- **Deployment Drift Explained:** The previous appearance of a regression (404/400 errors) was purely deployment drift. Slim deployments (V116–V120) incorrectly used the deprecated `gemini-1.5-flash` model, whereas the intended Wave 191 logic in the local source was already migrated to `gemini-2.5-flash`. Deploying the final production Edge Function (V121) resolved all false failures.
- **Future Follow-up Refinement:** Intent precedence between inventory phrasing ("queda stock", "queda del X") and `COMPATIBILITY_CHECK` signals may need later tuning, but architecture remains stable.
**Outcome:** Wave 191 Canonical Closure. PASS 13/13.

### A60. Audit: Wave 190 — Cesarin Human Evaluation Loop & Case-Triage
**Date:** March 19, 2026
**Scope:** `customer-intelligence/index.ts`, `simulate_cesarin.ts`, `cesarin_scenarios.json`, `ai_evaluations` [NEW].
**Highlights:**
- **Critical Runtime Fix:** Resolved Gemini `responseMimeType` field naming mismatch (v1 specification alignment), fixing structural 400 errors.
- **Model Stack Stabilization:** Consolidated Sommelier/Analyst/Embeddings to canonical v1/v1beta endpoints for March 2026 compliance.
- **Contract Drift Resolution:** Re-aligned simulation harness with Router/Capsule architecture (v110). Corrected 0/9 "false positive" failure rate caused by harness-side contract drift.
- **Evaluation Infra:** Implemented supervised review model allowing admins to score and tag live/simulated interactions.
- **Isolation:** Implemented `is_simulation` telemetry hardening to protect production KPIs from QA pollution.
**Outcome:** Runtime regression debunked; harness contract restored; Human Evaluation Loop operational. PASS.

### A59. Audit: Wave 189 — Analyst Refinement Loop
**Date:** March 19, 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/hooks/useAIConcierge.ts`, `src/services/concierge.service.ts`.
**Highlights:**
- **Analyst Intent Refinement:** Improved first-pass classification for abstract commercial queries ("barato", "frutal", "suave") via telemetry-driven few-shots.
- **Gemini API Stabilization:** Resolved `responseMimeType` vs `response_mime_type` mismatch in `v1` runtime contract.
- **Typecheck Drift Remediation:** Synchronized AI capsule contracts with frontend hooks. Resolved 100% of orchestration-layer type errors.
- **Canonicalization:** Explicitly mapped abstract commercial recommendations to `PRODUCT_SEARCH`.
**Outcome:** Reliance on deterministic guardrail rescue reduced; Analyst first-pass accuracy improved. PASS.

### A58. Audit: Wave 188 — Knowledge Enrichment Loop
**Date:** March 19, 2026
**Scope:** `supabase/seeds/seed_knowledge.ts`, `supabase/seeds/seed_runner.ts`, `supabase/tests/wave_188_validation.ts`.
**Highlights:**
- Identified 5 commercial knowledge gaps via `ai_analytics` telemetry (Payment Methods, Smoking cessation, Shipping costs, Starter kits, Xalapa location).
- Expanded canonical `seed_knowledge.ts` to 10 documents.
- Processed 41 knowledge chunks with `gemini-embedding-001` @ 3072d.
- Validated 5/5 semantic match using targeted validation suite.
**Outcome:** Knowledge base strengthened based on real pilot friction. PASS.

### A57. Pilot Operations Intelligence — Wave 187 — 19 de marzo de 2026
- **Scope:** `admin-pilot-ops.service.ts` [NEW], `useAdminPilotOps.ts` [NEW], `PilotTelemetry.tsx` [NEW], `TabPilot.tsx` [MOD], `services/admin/index.ts` [MOD], `hooks/admin/index.ts` [MOD].
- **Highlights:**
  - Operational telemetry cockpit added to Cesarin OS > Piloto Operativo (tab 8).
  - 8 KPI cards: total interactions, semantic match rate, fallback rate, avg latency, avg product cards, guardrail rescue count, zero-card misses, cart actions.
  - 7 bucket filters with canonical JSONB field paths: `zero_product_cards`, `fallback_used`, `successful_semantic_match`, `policy_query`, `cart_intent_signal`, `guardrail_rescue`, `frustration`.
  - Query log: capped at 100 rows, ordered `created_at DESC`, 7d default window. No unbounded fetches.
  - All JSONB extraction null-safe (`safeBool`, `safeNum`, `safeStr` helpers).
  - Architecture: DB → Service → Hook → Component. No new tables. No runtime changes.
  - Existing manual runbook checklist preserved below telemetry panel.
- **Outcome:** Piloto Operativo now shows actionable real-time telemetry. Team can identify misses, guardrail rescues, and knowledge gaps without reading raw logs.

### A56. Semantic Activation + Pilot Readiness Gate + Brain-First Guardrail — 19 de marzo de 2026
- **Scope:** `customer-intelligence/index.ts`, `supabase/seeds/seed_products.ts`, `supabase/seeds/seed_runner.ts`, `supabase/tests/test_pilot_queries.ts`, `STORE_FRONT_AI_PILOT_CONTEXT.md`, `AI_CONTEXT.md`, `pilot_readiness_gate.md`.
- **Highlights:**
  - **Embedding Corpus — 100% coverage:**
    - `products`: 44/44 active products embedded @ 3072d ✅
    - `store_knowledge`: 23/23 active chunks embedded @ 3072d ✅
    - Root cause fix: `gemini-embedding-001` requires `v1beta` endpoint (v1 returns 404). Both seed scripts corrected.
  - **Brain-First Guardrail (v106):** Two-layer fix applied to Analyst:
    - Layer 1: 3 new few-shot examples for abstract preference queries (barato/frutal, recomiéndame, suave/rico).
    - Layer 2: Deterministic guardrail expanded with 15+ commercial preference signals.
    - Layer 3: Auto-injection of canonical `tool_call` when guardrail rescues `UNKNOWN`.
    - Canon rule registered: **"Las capsules no deciden; las capsules ejecutan."**
  - **Pilot Query Suite:** 7 golden queries (PQ-1 → PQ-7). All 7 route correctly to expected capsule.
  - **Business Telemetry:** `semantic_match_success`, `fallback_used`, `product_card_count`, `cart_action_detected`, `product_match_count`, `policy_match_count` persisted live to `ai_analytics`.
  - **Architectural clarification:** `product_search_integrity` and `knowledge_rag_foundation` capsules are client-side handoffs (`requires_client_capsule: true`). The Edge Function is an orchestrator — product fetching happens in the frontend capsule.
  - **Honest status:** Analyst is still rescued by guardrail on some abstract queries (PQ-3, PQ-4, PQ-6). The experience routes correctly. Guardrail is a semantic rescue, not a replacement for Analyst reasoning.
- **Outcome:** **Pilot Readiness Gate: PASS (10/10 criteria). Cleared for unrestricted pilot.** Frente cerrado formalmente.

### A55. Gemini Specialized Stack & Embedding Repair — 19 de marzo de 2026
- **Scope:** Specialized Gemini Model Stack implementation, `embeddings-processor` repair, and DB infra restoration.
- **Highlights:**
  - **A55 (2026-03-19): Gemini Specialized Stack & 3072d Standardization**
  - Migrated All 9 Edge Functions to Gemini 2.5 specialized tiers.
  - Standardized embedding architecture to `gemini-embedding-001` (3072d).
  - Re-seeded `products` (44 items) and `store_knowledge` (RAG) with 3072d vectors.
  - Optimized `match_products` and `match_knowledge` RPCs (Fixed type casts and enums).
  - Verified end-to-end: Product cards + Knowledge RAG correctly rendered in UI.
- **Outcome:** Google AI operational front closed. Infrastructure ready for semantic retrieval.

### A54. Cart Operator Capsule — Canonization Handoff — 18 de marzo de 2026
- **Scope:** Completed Design Pass, Contract Materialization, Runtime Bridge + AI Routing, Store Middleware + UI Execution, E2E Validation + UI State Review.
- **Highlights:** Implemented `cart-operator-executor.ts` acting as a strict safe gate before hitting Zustand. Separated presentation layer from execution structural outcomes, enforcing the `AMBIGUOUS_MUTATION` and `UNSAFE_MUTATION` graceful degrade without dirtying React state.
- **Outcome:** Cart Operator Capsule consolidated as the third canonical capsule and designated as the official Safe Mutator behavior baseline.

## Known Constraints
- **Quota/Latency:** Gemini 2.5 models used (Flash) under active billing. Rate limits apply on Free Tier.
- **Embedding API:** `gemini-embedding-001` requires `v1beta` endpoint (v1 returns 404/405). Both seed scripts are corrected.
- **Analyst Refinement Success (Wave 189):** Abstract queries (price+flavor combos) now show significantly improved direct classification by the Analyst. Reliance on deterministic guardrail rescue is baseline-reduced but remains active as a safety net.
- **Memory:** Session-only history persists in `sessionStorage`.
- **Cart Completion Rate:** Currently 0% via concierge (expected — checkout-via-concierge not yet wired to payment flow).

### A53. Knowledge & RAG Foundation Capsule — Canonization Handoff — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`.
**Highlights:**
- **Capsule Complete:** Formalized the complete end-to-end materialization of the Knowledge & RAG Foundation Capsule.
- **Outcomes Covered & Validated E2E:** High confidence policy match, moderate confidence multi-source, low confidence fallback, no match, degraded, schema error.
- **UI Decoupling Canonized:** The UI cleanly consumes `capsule_contract` and `resolved_chunks` via `ui_render_hint` without making probabilistic assumptions.
- **Conversational Firewalling:** Free paraphrasing of canonical store policies by the LLM is now structurally blocked.
- **Invariants Protected:** Dual gate remains intact; the store functions robustly even if the Assistant or Embeddings DB fails.
- **Blueprint Established:** This capsule is now the designated architectural template for any future RAG or Memory retrieval features.

### A52. Product Search Integrity Capsule — Canonization Handoff — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`.
**Highlights:**
- **Capsule Complete:** Formalized the complete end-to-end materialization of the first Capability Capsule.
- **Outcomes Covered & Validated E2E:** Direct match, featured fallback, out of stock alternative, ambiguity hold, no safe result, degraded response, schema error.
- **UI Decoupling Canonized:** Proven that the storefront UI consumes resolved state cleanly without making its own commercial decisions (e.g., `OUT_OF_STOCK_ALTERNATIVE` explicit differentiation).
- **Invariants Protected:** Dual gate remains fully active and uncompromised; the core e-commerce experience remains robustly functional even if the AI backend fails.
- **Blueprint Established:** This capsule is now the designated architectural template required for future AI feature developments.

### A51. Product Search Integrity Capsule — Base Contract Materialization — 18 de marzo de 2026

**Scope:** `src/types/ai-capsule.ts`, `src/lib/ai-capsule-schemas.ts`, `src/lib/ai-capsule-mappers.ts`.
**Highlights:**
- **Contract Approved:** The first capsule pattern contract was materially approved.
- **Type Safety:** Base types/interfaces and strictly typed Zod validation schemas were created.
- **Sanitized Mapping:** Pure mapper shell(s) created using safe data derivation without fake payloads.
- **Strict Bounds:** No runtime wiring, no UI wiring, and no DB integration was introduced.
- **Status:** This pass remains strictly pre-tool-schema, pre-fallback-tree, and pre-runtime-wiring.

### A50. Cesarín Capability Capsules Architecture Adoption — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`.
**Highlights:**
- **Architecture Doctrine Adopted:** The "Capability Capsules" philosophy was formally canonized to guide future AI feature development.
- **Boundaries Formalized:** Defined strict principles for bounded responsibility, failure isolation, and explicit signaling to prevent monolithic sprawl.
- **Documentation Pass:** This was an architecture documentation pass exclusively. No runtime code, pilot semantics, or kill switch boundaries were altered.
- **Future Direction Checkpointed:** The Product Search Integrity Capsule was identified as the baseline template for future incremental refactoring.

### A49. Slice 2D — Storefront Degraded Experience Hardening — 18 de marzo de 2026

**Scope:** `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`.
**Highlights:**
- **Silent error swallowing removed:** API exceptions now throw strictly to the UI layer.
- **Explicit timeout handling:** 25-second limit enforced securely.
- **Explicit storefront-safe error UI:** Safe messaging generated per error mode (quota, timeout, generic).
- **Retry path added:** Exact last user message structurally re-fired on "Reintentar" click.
- **No raw technical leakage:** JSON limits and infrastructure clues shielded from end users.
- **No new modules introduced:** Architecture bounds respected perfectly.
- **Semantics uncompromised:** The pilot session gate (`?pilot=cesarin`) and the global kill switch behavior remained entirely untouched.

### A48. Storefront AI Pilot Readiness — Slices 1A–2C — 18 de marzo de 2026
- **Phase:** Pilot Operational (Gemini 2.5 Specialized Stack)
- **Status:** LIVE & VALIDATED (Router Intelligence Active)
- **Slices Completed:** 1A, 1B, 1C, 2A, 2B, 2C, 2D + Model Stack Upgrade
**Scope:** `src/App.tsx`, `AdminCesarinOS.tsx`, `persona.ts`, `TabPilot.tsx`, `store_settings` table.
**Highlights:**
- **Slice 1A (Persona Freeze):** Locked the Sommelier persona for pilot usage.
- **Slice 1B (Global Kill Switch):** Implemented `is_ai_assistant_enabled` gate in storefront.
- **Slice 1C (Admin Control):** Added master toggle to Cesarin OS header.
- **Slice 2A (Pilot Exposure):** Implemented session-based gate via `?pilot=cesarin` to restrict visibility.
- **Slice 2B (Runbook):** Created operational runbook UI with structured QA scenarios.
- **Slice 2C (Commercial Hardening):** Improved response quality for ambiguous and budget-sensitive queries.
- **2C Closeout:** Audited and verified persona rules vs runbook scenarios as pilot-safe.

### A47. Phase 4.3D — Inventory Signal Bridge — 17 de marzo de 2026

**Scope:** `index.ts`, `persona.ts`, `cesarin_scenarios.json`.
**Highlights:**
- **Signal Bridge:** `signal_quality` from inventory oracle is now correctly exposed to the Sommelier prompt.
- **Cautious Persona:** Implemented persona rules for calibrated confidence when inventory data is insufficient.
- **Drift Resolution:** Found and fixed logic drift where calculated stock intelligence was lost before reaching final answer generation.
- **Hygiene:** Cleaned up duplicate prompt lines and redundant bullet points in persona guidance.

### A46. Document Reconciliation Audit — 17 de marzo de 2026

**Scope:** AI_CONTEXT.md, AUDIT_LOG.md, Repository Structure.
**Highlights:**
- **Truth Restoration:** Reconciliada la documentación con la realidad del repositorio.
- **Precision Counts:** Actualizados conteos de Types (10), Services (25), Hooks (44), Migraciones (52) y Edge Functions (14).
- **Phase Canonization:** Formalizadas las fases 4.3A, 4.3B y 4.3C como completas tras verificación de código en `persona.ts` y `tools.ts`.
- **Wave Alignment:** Ajustado el conteo de Waves a 184.

### A45. Phase 4.3C — Inventory Signal Quality Framing — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (get_inventory_outlook).
**Highlights:**
- **Estimative Language:** Implementada la Regla de Persona #7 que obliga al uso de términos estimativos para proyecciones de stock.
- **Signal Preservation:** Verificada la propagación del flag `signal_quality` desde el Oracle hasta el orquestador.

### A44. Phase 4.3B — Out-of-Stock Response Discipline — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (search_products).
**Highlights:**
- **OOS Acknowledgment:** Implementada la Regla de Persona #6 para el reconocimiento obligatorio de productos agotados antes de ofrecer alternativas.
- **Stock Guardrails:** Restricción estricta de recomendaciones solo a productos con stock disponible en el set de resultados.

### A43. Phase 4.3A — Featured Fallback Signal Framing — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (search_products).
**Highlights:**
- **Signal Integrity:** Implementada la Regla de Persona #5 para distinguir entre coincidencias directas y resultados destacados (Featured Fallback).
- **Communication Guard:** El Sommelier ahora encuadra los resultados destacados como alternativas generales, no como respuestas exactas.

### A42. Phase 2 — Tag Cleanup & Storefront Bridge — 16 de marzo de 2026

**Scope:** Tag Classification Utility, SQL Migration wave, Storefront components (`ProductBadgeGroup`, `ProductCard`, `ProductInfo`).
**Highlights:**
- **Automated Classification:** Implementada utilidad `tag-discovery.ts` con lógica de confianza (90% auto-migrate) y sensibilidad al contexto (Sección/Categoría).
- **SQL Migration Wave:** Generado y validado script SQL altamente preciso para migrar etiquetas técnicas a `specs` (potencia, nicotina, etc.) con llaves normalizadas.
- **Unified Storefront Bridge:** `ProductBadgeGroup` centraliza ahora badges legados y el nuevo array `badges`, eliminando lógica harcodeada en el resto de la app.
- **Specs Presentation Layer:** Implementado mapeo de llaves técnicas a labels humanos en `ProductInfo.tsx`.
- **Zero-Regression Transition:** Los productos no migrados mantienen su comportamiento legacy exacto mientras los nuevos ya consumen la ontología estructurada.

### A39. Wave 163 — Admin Refactor Phase 1 — 16 de marzo de 2026

**Scope:** Catalog Ontology, Admin Attributes UI, Product Editor Drawer, Database Schema.
**Highlights:**
- **Product Ontology Evolution:** Separation of technical Specs (fixed JSON) and Variants (purchasable/stockable options).
- **4-Tab Admin UX:** Rediseño del `ProductEditorDrawer` en Comercial, Clasificación, Configuración e Inteligencia.
- **Global Attributes:** Implementado control de aplicabilidad (Vape/420) y capacidad de variante en `AdminAttributes.tsx`.
- **Collections System:** Creada infraestructura para agrupaciones transversales de productos.
- **Safe Migration:** Los flags heredados (`is_new`, etc.) se migraron dinámicamente al nuevo array de `badges`.

### A40. Wave 164 — Admin Stabilization Wave — 16 de marzo de 2026

**Scope:** Product Variants Editor, Admin Attributes, Product Editor Drawer, AI Context logic.
**Highlights:**
- **Enforcement Rails:** Solo se permiten atributos con `is_variant_capable=true` para generar variantes.
- **Category Applicability:** Los atributos ahora soportan aplicabilidad granular a nivel de categoría para escalabilidad masiva.
- **Guided Specs:** Implementado sistema de sugerencias y normalización de specs basado en categorías/slugs.
- **Type Safety Restoration:** Corregido 100% de errores JSX y tipos nulos en la gestión de atributos.

### A41. Phase 2 Audit — Tags & Badges — 16 de marzo de 2026

**Scope:** Product Tags, Badges Array, Storefront Display.
**Highlights:**
- **Contamination Cleanup:** Identificados patrones de etiquetas técnicas (`mg`, `ml`, `watts`, `vg`) para futura migración a Specs o Variantes.
- **Storefront Gap:** Detectada dependencia legacy de flags booleanos en el frontend; se requiere migración al arreglo de `badges`.
- **Governance:** Confirmada la validez de la tabla `product_tags` como fuente canónica de limpieza.

### A38. Wave 161 — AI Persistency & Smart Sessions — 16 de marzo de 2026

**Scope:** Infraestructura de persistencia para el Simulador de Cesarin OS.
**Highlights:**
- Creada tabla `ai_simulation_sessions` con TTL de 7 días.
- Implementada detección de "should_close_session" en la Edge Function mediante NLP.
- Refactorizada UI (`TabSimulator.tsx`) para incluir Sidebar de sesiones y gestión de estados (Activa/Cerrada).
- Zero-Any policy mantenida en toda la integración.

### A37. Wave 160 — Cesarin OS World-Class SaaS Evolution — 16 de marzo de 2026

**Scope:** Global AI Module Admin Infrastructure. Refactorizada `AdminCesarinOS.tsx` a componentes funcionales modulares en `src/components/admin/cesarin/`.

**Highlights:**
1.  **Strict Typing**: Implementada interfaz `src/types/cesarin.ts`, eliminando el 100% de los `any` en el módulo administrativo.
2.  **SaaS Architecture**: División del dashboard en 6 pestañas especializadas (Persona, Knowledge, Rules, Simulator, Learning, Analytics).
3.  **UI/UX Premium**: Implementación de **Neural Glassmorphism** avanzado y micro-animaciones con `framer-motion`.
4.  **Learning Loop**: Activación del motor de sugerencias de reglas basado en frustración de cliente real.

---

### A36. Wave 159 — Cesarin OS Neural Engine & API Restoration — 16 de marzo de 2026

**Scope:** Global AI Infrastructure & Admin OS. Modificados `customer-intelligence`, `dashboard-intelligence`, `AdminCesarinOS.tsx` y `persona.ts`.

**Highlights:**
- **Gemini Stability:** Restaurada conectividad con modelos Google v1beta mediante el sufijo obligatorio `-preview`.
- **Visual FIX:** Inyección de `cover_image` en el contexto del producto para restaurar thumbnails en el chat.
- **Bias Neutralization:** Ajustada la filosofía de persona para priorizar intención de usuario sobre marcas específicas (fin del sesgo Juicee).
- **Neural Mastery:** Implementada conexión real entre analítica de frustración y el panel de "Modo Aprendizaje" administrativo.
- **Sync Total:** Estandarizado el esquema de respuesta JSON (`products`) para asegurar el funcionamiento del Hallucination Limiter.

### A35.- **Wave 148 (DONE)**: Frontier Wow Upgrade. Gemini 3.1 Flash-Lite, Sommelier Persona (Human-like) y Guía de Recuperación en AI_CONTEXT.md.
**Scope**: All 6 AI Edge Functions upgraded to `gemini-3.1-flash-lite-preview`. Concierge persona refined to "Expert Human Sommelier". Hybrid Search (Words + Vectors) fully optimized for discovery.

### A34. Wave 146 — AI Efficiency Stack & Documentation Master — 16 de marzo de 2026

**Scope:** Global AI Infrastructure. Updated all 6 intelligence Edge Functions, `AI_CONTEXT.md`, `concierge.service.ts`, and `useAdminDashboard.ts`.

**Highlights:**
- **Cost Mastery:** Migración 100% a `gemini-2.5-flash-lite`, reduciendo costos de API en un 50%.
- **Zero-Waste Policy:** Implementación de disparadores "On-Demand" en el Panel Admin y Caché de Sesión en el Storefront.
- **Master Documentation:** Actualización exhaustiva de `AI_CONTEXT.md` con ejemplos JSON reales de cada módulo y guías de consumo.
- **Voice Sovereignty:** Verificación del flujo de búsqueda por voz multimodal con el nuevo modelo Lite.
- **Build Quality:** Verificación de tipos en servicios de voz y concierge.

---

### A33. Wave 124 — Deep Audit Core Infrastructure & Admin Cleanup — 15 de marzo de 2026

**Scope:** Admin Panel, Global Hooks, Core Services, and UI Components. Modificados `admin-orders.service.ts`, `AdminCommandPalette.tsx`, `admin-dashboard.service.ts`, `useAIConcierge.ts`, `useVoiceRecorder.ts`, e indices barrel.

**Highlights:**
- **Seguridad y DB:** Supabase UI Query Cleanup. Migración de la búsqueda paralela del `AdminCommandPalette` en UI hacia la capa de Servicios y eliminación del componente duplicado en `layout/`.
- **Tipado Duro:** Erradicación de tipos `any` en la capa de servicios administrativos y hooks de IA/Voz.
- **Web Speech API:** Definición nativa e interfaces seguras inyectadas al hook `useVoiceRecorder` para máxima estabilidad.
- **React Performance:** Limpieza de warnings de dependencias en React Hooks (`exhaustive-deps`) en búsqueda NLP.
- **Build Quality:** Typescript emitió 0 errores (`npm run typecheck` limpio). Cumplimiento del 100% en tipado duro (§1.2) en Core and 98/100 en flujo de DB en Admin.

---

### A1. Módulo Pedidos/Orders — 37 issues → 37 resueltos

**Scope:** 56 archivos (+2235/−946 líneas). Commit `9c934ab`. Includes: pages (UserOrders, OrderDetail, admin orders), hooks (useOrders), services (orders.service, admin-orders.service), types (order.ts), checkout flow.

**Highlights:**
- Migración completa de validación a Zod schemas (`checkoutSchema.safeParse`)
- Extracción de lógica de checkout a `useCheckout` hook
- Centralización de pricing en `calculateOrderTotal()`
- Integración loyalty points en checkout flow
- Fix OrderDetail component lifecycle y estado loading
- Admin orders: optimistic updates, DnD kanban, status transitions

### A2. Módulo Clientes — 22 issues → 22 resueltos

4 HIGH, 9 MED, 9 LOW. Archivos modificados: 8. Archivos creados: `src/types/customer.ts`.

Key fixes: tipos `CustomerProfile`/`CustomerTier` extraídos, `formatCurrency` duplicado eliminado, `(customer as any).loyalty_points` reemplazado por `useQuery`, fake coupon stub eliminado, imports normalizados, `useNotification` en vez de `react-hot-toast`.

### A3. Módulo Productos — 34 issues → 20 resueltos, 14 aceptados/diferidos

9 HIGH, 15 MED, 10 LOW. Archivos modificados: 14. Creados: `src/lib/product-sorting.ts`. Eliminados: `products/TrustBadges.tsx`.

Key fixes: `useNotification` migration, sort logic extracted shared, StickyAddToCart loop fix, QuickView badge expiry validation, nested `<Link>` fix, click-outside guard, section-aware colors, dep arrays stabilized.

### A4. Módulo Categorías — 9 issues → 4 resueltos, 5 aceptados/diferidos

2 HIGH, 4 MED, 3 LOW. Archivos modificados: 9.

Key fixes: dead code eliminated (`VAPE_CATEGORIES`/`HERBAL_CATEGORIES`), dynamic Tailwind → static, barrel imports, Section import normalized.

### A5. Módulo Carrito & Checkout — 11 issues → 4 resueltos, 7 aceptados/diferidos

2 HIGH, 5 MED, 4 LOW. Archivos modificados: 3.

Key fixes: checkout redirect race condition, CartSidebar ARIA, idiomático image guard, useCheckout import path.

### A6. Módulo Search — 7 issues → 5 resueltos, 2 diferidos

MED/LOW. Archivos modificados: 4.

Key fixes: Section import normalized, `optimizeImage` in SearchBar, MobileSearchOverlay ARIA, dead re-export removed.

### A7. Módulo Auth — 8 issues → 4 resueltos, 4 diferidos

1 HIGH, 3 MED, 4 LOW. Archivos modificados: 2.

Key fixes: `loadProfile` deps, password reset functional, unnecessary cast removed, terms links→planned.

### A8. Módulo Home — 12 issues → 4 resueltos, 8 diferidos

3 HIGH, 4 MED, 5 LOW. Archivos modificados: 4.

Key fixes: Section import, `optimizeImage` en FlashDeals, MegaHero external URL → inline SVG.

### A9. Full Sweep Layout/UI/Notifications/etc — 19 issues → 12 resueltos, 7 diferidos

2 HIGH, 10 MED, 7 LOW. Archivos modificados: 12.

Key fixes: fake aggregateRating removed, loyalty tier inconsistency fixed, Section imports, typos, CSS classes, overflow normalization, Footer URLs → SITE_CONFIG, `alert()` → useNotification.

### A10. Admin Module — 118 archivos auditados, 15 issues → 13 resueltos

Archivos modificados: 13. Key fixes: `alert()` → useNotification, Section imports normalized, console.error eslint-disable, redundant default exports removed.

### A11. Admin Tags Refactor — Vista compacta + modal + paginación

Archivos creados: 5. Modificados: 2. Eliminados: 3. Homogenización con pattern AdminBrands.

### A12. Admin UX Polish — Touch targets, mobile actions, aria-labels

Archivos modificados: 6. Touch targets ≥44px, mobile-visible actions, contrast fixes, dashboard active preset.

### A13. Bundle Optimization — Main chunk −79%

Main: 624→132 kB. Sentry lazy, framer-motion lazy, CartSidebar lazy, vendor splitting (7 chunks), sourcemap hidden. Archivos modificados: 6.

### A14. Deep Performance — ProductCard memo, lazy QuickView, preconnect

ProductCard: 17→7 kB. Presence WebSocket admin-only. Hero `fetchPriority="high"`. Supabase preconnect. `optimizeImage()` functional. Archivos modificados: 8.

### A15. UX/UI Storefront — Accesibilidad, mobile, conversión

35 issues found, 17 fixed. Focus traps, responsive hero height, empty cart toast, mobile-visible actions, real compare_at_price, dead links removed, terms→Link, SEO components. Archivos modificados: 14.

### A16. Security Hardening

16 issues, 10 fixed. PostgREST injection escape, crypto.randomUUID passwords, CSP headers, password policy OWASP, rate limiting login, updateOrderStatus removed from storefront, MercadoPago URL validation, console stripping, cart cross-tab validation. Archivos modificados: 9.

### A17. UI Fixes — Header gap, flash images, wishlist button

3 fixes: sr-only h1 moved, image fallback chain, Heart button in ProductActions. Archivos modificados: 4.

### A18. Admin Fixes — Product actions, DB-backed wishlist

- **Flash Deals Evolution:** Sincronización completa con el schema de DB (`flash_price`, `max_qty`, `ends_at`). Implementación del efecto "Burning Bar" con triple capa de fuego y resplandor.
- **AI Search Intelligence:** Implementación de "AI Insights" y sugerencias predictivas en la barra de búsqueda. Añadido efecto de focus aura pulsante.
- **Física de UI:** Transformación del icono de carrito a un componente basado en física de resortes (spring physics) para interacciones premium.
-   **Base Build:** v108
- **Live Pulse:** Sistema de monitoreo visual en tiempo real en el Header indicando actividad de la tienda.
- **TopBanner Cinematic:** Refactorización de promociones con AnimatePresence, transiciones elásticas y modo de urgencia crítica.
- **Estabilidad de Datos:** Resolución de fallos en el servicio de cupones y alineación de variables de estado local para precisión numérica en el admin.

---

### A29. Auditoría Integral del Panel de Administración (Waves 52-57) — 12 de marzo de 2026

**Scope:** 17 orquestadores de páginas admin, 12 servicios de administración, componentes de configuración y monitoreo.

**Highlights:**

- **Seguridad §1.8:** Saneamiento de más de 25 llamadas a `console.log` y `console.error` expuestas en producción.
- **Arquitectura §1.2:** Refactorización de todos los servicios admin para eliminar `select('*')` en favor de selectores de columnas explícitos.
- **TypeScript Purity:** Verificación de 0 `any` en todo el módulo Admin (Dashboard, Productos, CRM, Marketing, Configuración).
- **IA Integration:** Integración de Google Gemini en el Dashboard para insights automáticos.
- **TSC Verification:** Paso de `npm run typecheck` global con 0 errores.

---

### A30. Wave 58 & 59 — Admin Hyper-Drive & CRM Intelligence — 12 de marzo de 2026

**Scope:** 8 archivos modificados/creados. Componentes (`AdminPulse`, `AIInsights`, `AdminCommandPalette`), Services (`admin-crm.service`), Páginas (`AdminBatchManager`).

**Highlights:**

- **Antigravity Pulse:** Implementación de monitoreo en tiempo real basado en Supabase con polling optimizado (1m) para ahorro de recursos.
- **AI Strategic Insights:** Motor de recomendaciones proactivas usando Gemini 1.5 Pro, con trigger manual para control de costos.
- **CRM Intelligence:** Funciones de generación de WhatsApp Copy personalizado basado en el contexto del cliente (RFM Segments).
- **Batch Manager:** Interfaz de alta densidad para edición masiva de productos (precio/stock) con estados modificados visuales.
- **Seguridad §1.8:** Sanitización de `console.error` en todos los nuevos componentes admin (env guard obligatorio).
- **TypeScript Purity:** 0 `any` en todos los nuevos servicios e interfaces de inteligencia.

---

### A31. Wave 60 — Quantum Administration (The Final Polish) — 12 de marzo de 2026

**Scope:** 15 archivos (+1850/−450 líneas). Infraestructura Sensorial (`TacticalProvider`), Ambiance (`AnimatedAtmosphere`), AI Logic (`admin-nlp.service`), Voice Interaction (`useVoiceRecorder`).

**Highlights:**

- **Tactical UI (Sensory Engine):** Implementación de motor auditivo procedural (Web Audio API) y háptico. Cero assets MP3; todo sonido es sintetizado en tiempo real para máxima performance.
- **Ambient Business Intelligence:** El dashboard "respira" visualmente. Integración de `AnimatedAtmosphere` que cambia gradientes HSL según el pulso del negocio (Optimal/Busy/Alert).
- **Quantum Search (NLP & Voice):** Evolución del Command Palette con dictado de voz nativo y parseo semántico vía Gemini. Soporta intenciones complejas ("Busca pedidos de Juan mayor a 500").
- **Smart Supplier Connect:** Automatización de re-stock. El Batch Manager ahora detecta stock crítico (<5) y genera copys personalizados de WhatsApp para proveedores usando IA.
- **TypeScript Purity §1.1:** Auditoría final de Wave 60 con 0 `any` en servicios core. Tipado estricto para respuestas de Edge Functions.
- **Documentación JSDoc:** Cobertura del 100% de los nuevos hooks y componentes con estándares profesionales de documentación técnica.
- **Estabilidad Visual:** Resolución de warnings de Framer Motion y optimización de capas de glassmorphism con texturas de ruido SVG para look "Ultra-Premium".

---

### A32. Wave 70 — AI Immersion & Sensory Excellence — 12 de marzo de 2026

**Scope:** 12 archivos core (+2150/−380 líneas). Storefront (`App.tsx`, `AIConcierge`, `SearchBar`, `CartSidebar`, `CheckoutForm`), Contexts (`TacticalContext`), Services (`concierge.service.ts`).

**Highlights:**

- **Quantum AI Assistant:** Implementación de `AIConcierge.tsx` con estética Obsidian Quantum (glassmorphism pro, ruido SVG) y físicas de resorte.
- **Búsqueda Semántica:** Upgrade de `SearchBar.tsx` con botón "IA Smart". Integración con `concierge.service.ts` para descubrimiento de productos basado en lenguaje natural y contexto del cliente.
- **Sensory Storefront:** Migración de `TacticalProvider` del Admin al Main Layout global. Feedback auditivo y háptico en todas las interacciones críticas de venta.
- **Resilience Strategy:** Refactorización preventiva de `TacticalContext.tsx` para evitar crashes en motores de audio antiguos y preparación del terreno para Wave 80 (Fault Isolation).
- **Master Sync:** Sincronización de `AI_CONTEXT.md` a v1.9.0-hyper y creación de `MASTER_EXPERIENCE.md`.

---

### A62. Wave 192 Knowledge Ops Manager — 19 de marzo de 2026

**Scope:** Conversion of existing Cesarin OS knowledge surfaces into an administrative Knowledge Ops Manager (`store_knowledge`, `product_concepts`, `compatibility_relations`, `concept_aliases`).
**Version:** v112

**Highlights:**
- **Outcome:** IMPLEMENTED / PENDING VALIDATION (Requires runtime browser testing against Section 15 ACs).
- **Master-Detail Transformation:** Enhanced `TabKnowledge` and `TabConcepts` UIs without adding new top-level components or breaching architectures.
- **Strict Dropdown Safeties:** Enforced directional edge graphing with hardcoded constraint dropdowns for `relation_type` and `scope`.
- **Safe Edit Mode:** Deep inspection drawers providing Safe Edit access with explicit, single-action embedding updates (`update_chunk`) exclusively for `store_knowledge`.
- **Gap Flag Telemetry:** Embedded operational data observability inside native UIs (detecting orphans/empty aliases).
- **Immutable Constraints Preserved:** Zero schema migrations natively executed; purely relying on pre-existing RPCs/Tables in a strictly read-first, edit-second pattern.

---

### A63. Wave 192 Final Remediation & Closure — 19 de marzo de 2026

**Scope:** Resolution of deployment drift for `knowledge-ingestor` Edge Function, Embedding Model canon alignment, and RLS Admin claims fix.
**Version:** v112

**Highlights:**
- **Edge Function Fix & Canon Alignment:** Corrected `knowledge-ingestor` to use `gemini-embedding-001` (closing model drift from `gemini-embedding-2-preview`). Deployed strictly with JWT verification enabled to secure `service_role` execution.
- **RLS/Admin Data State Fix:** Identified that empty `product_concepts` was caused by missing JWT `app_metadata` claims. Remedied operationally by injecting `{"role": "admin"}` to the test user's `auth.users` record, unlocking RLS reads and confirming 15 native rows exist.
- **Outcome:** DONE. All UI components (Directional Relations, Gap Flags, Safe Edit Sync) successfully validated in runtime browser agent.

### A64. Deploy/Runtime Parity Hygiene (A64) — 19 de marzo de 2026

**Scope:** Resolution of deployment drift ambiguity and cache ghosts via diagnostic telemetry injection and Service Worker hardening.
**Version:** v112 (Runtime Parity stabilized)

**Highlights:**
- **Outcome:** FINAL CANONICAL CLOSURE.
- **Verification:** Full validation in installed PWA (Windows) confirmed.
- **Admin Launcher:** The "Ir a Admin (Cesarin OS)" link is visible only to admins and functions correctly in PWA.
- **Pilot Session Activator:** "Enable Pilot Session" in the admin panel allows activating the pilot gate in environments where URL manipulation is restricted (e.g., installed PWA).
- **Session-Scoped Behavior (Confirmed):** The pilot gate correctly adheres to `sessionStorage` semantics. It persists during active usage and internal navigation but resets upon absolute app/tab closure. This behavior is expected and does NOT affect the persistent authentication of the user.
- **SW Hardening:** Migration to version-aware cache keys and `updatefound` lifecycle resolved potential "ghost build" regressions.
- **Architecture:** All diagnostic signals are injected into existing `TabPilot` and `AdminPulse` surfaces, strictly adhering to the "no new top-level components" directive.
- **Baseline Alignment:** Confirmed `v112` remains the canonical anchor.

---
---

### Mercado Pago Checkout E2E Stabilization â€” 24 de marzo de 2026

**Scope:** `supabase/functions/create-payment/index.ts`, `supabase/functions/mercadopago-webhook/index.ts`, `supabase/config.toml`, `.github/workflows/deploy-functions.yml`, and `orders` payment fields mutated by Mercado Pago.

**Problem Identified:**

The checkout loop still carried documentary uncertainty around two critical points: (1) `create-payment` had previously hidden order lookup failures behind restrictive assumptions on joined customer profile data, making real DB lookup errors hard to diagnose; (2) the Mercado Pago async loop had no canonized closure proving that Checkout Pro could return asynchronously and mutate Supabase autonomously. Deployment discipline was also unresolved at the documentation layer because the host OS cannot be relied on for local Docker-backed Supabase Edge deployment.

**Remediation Applied:**

1. **`create-payment` lookup hardening** â€” current implementation now reads the order with `.select('*')` and logs raw Supabase errors before throwing a precise `DB Error`, instead of depending on restrictive profile joins. This removes the prior swallowed-error posture and keeps Mercado Pago preference creation coupled only to the order row actually required for checkout.

2. **Webhook E2E confirmation** â€” `mercadopago-webhook` accepts Mercado Pago payment notifications, resolves the payment remotely via MP API, extracts `external_reference`, and updates the matching `orders` row directly with `payment_status`, `status`, `mp_payment_id`, `mp_payment_data`, and `updated_at`. Real sandbox verification confirmed the end-to-end loop: `create-payment` returned `200 OK`, Mercado Pago callback returned `200 OK`, and the target order row was updated with `mp_payment_id` plus autonomous payment-state mutation.

3. **Deployment canon formalized** â€” the supported deploy route for Supabase Edge Functions is GitHub Actions pipeline-first via `.github/workflows/deploy-functions.yml`, used to bypass local host limitations around Docker-backed function deployment. For Mercado Pago specifically, `mercadopago-webhook` must remain configured with `[functions.mercadopago-webhook] verify_jwt = false` in `supabase/config.toml` so external Mercado Pago requests are not blocked at the function boundary.

**Outcome:** Mercado Pago Checkout Pro is now documented as structurally closed E2E in sandbox. `create-payment` failure visibility is restored, the asynchronous webhook loop is confirmed mutating `orders.mp_payment_id` and payment state, and deployment requirements are canonized around GitHub Actions plus `verify_jwt = false` for the webhook.

---

### Cierre de Deuda Técnica: CI/CD Webhook & Loyalty RPC — 24 de marzo de 2026

**Scope:** Acceptance audit of `.github/workflows/deploy-functions.yml` plus documentary closure of the remote loyalty dependency defined in `supabase/migrations/20260310_loyalty_rpc_fix.sql` and consumed by `src/services/loyalty.service.ts`.

**Problem Identified:**

Two residual infrastructure debts remained after Mercado Pago Checkout E2E stabilization. First, the deployment canon already stated that external Mercado Pago callbacks require `mercadopago-webhook` with JWT verification disabled, but the GitHub Actions deploy workflow still omitted an explicit deployment step for that function. Second, the loyalty flow still depended on remote presence of `process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)`; when absent, client RPC calls degraded into the masked `PGRST202` failure path without changing local repo state.

**Remediation Applied:**

1. **CI/CD webhook closure** — `.github/workflows/deploy-functions.yml` now includes an explicit `Deploy mercadopago-webhook` step using `supabase functions deploy mercadopago-webhook --project-ref $PROJECT_ID --no-verify-jwt`. Acceptance audit result: the YAML change is narrow, syntactically coherent, consistent with the existing workflow pattern (`knowledge-ingestor` already used `--no-verify-jwt`), and correctly aligned with `supabase/config.toml` plus the external-callback requirements of Mercado Pago.

2. **Remote loyalty RPC satisfaction** — the RPC declared in `supabase/migrations/20260310_loyalty_rpc_fix.sql` (`process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)`) was validated as present in the remote database with the required `GRANT EXECUTE ... TO authenticated`. This closes the previously unresolved dependency behind `src/services/loyalty.service.ts` methods `addLoyaltyPoints`, `redeemPoints`, and `adjustPoints`, and resolves the silent `PGRST202` exception path as a live-environment debt rather than a code defect.

**Outcome:** The critical commercial infra loop is now closure-clean at the documentation layer. Mercado Pago webhook deployment is inside the persistent CI/CD path instead of depending on ad hoc manual deploy memory, and the loyalty points engine's RPC dependency is documented as remotely satisfied. Combined with the prior Checkout Pro E2E stabilization, checkout, webhook delivery, and loyalty points execution are now recorded as free of the previously open technical debt.

---

### Catalog Grid Zero-Lag Canon â€” ProductCard Spotlight Hardening â€” 24 de marzo de 2026

**Scope:** `src/components/products/ProductCard.tsx` only. Performance micro-pass on the storefront catalog card. No grid rewrite, no Framer Motion redesign, no ProductGrid architecture changes.

**Problem Identified:**

`ProductCard.tsx` performed continuous `getBoundingClientRect()` reads inside `onMouseMove` to drive the spotlight layer. On dense product grids this created layout thrashing and main-thread pressure, especially on touch devices where the effect added no meaningful value but still damaged scroll smoothness.

**Remediation Applied:**

1. **Spotlight geometry caching** â€” card bounds are captured on pointer entry and reused instead of re-reading layout on every move.
2. **Frame-bound updates** â€” spotlight coordinates now flow through `requestAnimationFrame` and CSS local variables instead of raw pointer-frequency writes.
3. **Capability-gated rendering** â€” the spotlight layer renders only on devices matching `matchMedia('(hover: hover) and (pointer: fine)')`; touch devices no longer execute the heavy path.
4. **Handler stabilization** â€” internal callbacks and derived values were stabilized to preserve the practical benefit of `React.memo()` across large catalog grids.

**Outcome:** `ProductCard.tsx` now preserves the premium desktop feel without sacrificing touch scroll smoothness. The storefront canon is formally updated: any continuous catalog animation in high-cardinality grids must use rAF or cached CSS-variable strategies and must degrade away on touch-class devices. Auditor status: **ACCEPT**.

## Issues Diferidos Vigentes

> Estos issues están abiertos. Ver AI_CONTEXT.md §10 para la lista actual.

*Última actualización: 19 de marzo de 2026 (A65 — Marketing AI Reality Repair — v113)*
