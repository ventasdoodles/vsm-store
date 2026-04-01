# VSM STORE — AUDIT LOG

> Registro histórico de todas las auditorías ejecutadas. Mover aquí al actualizar AI_CONTEXT.md.
> Referencia: AI_CONTEXT.md §9

---

## Auditorías Completadas (§9.10 → §9.30)

### Césarín Storefront — Trust & Transparency Hardening Wave - 29 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / customer-facing experience only.
**Problem Identified:**
The accepted storefront commercial outcome hardening wave had already made Césarín more honest about when to explore, compare, review, or become add-ready, but the visible customer-facing trust signal behind those states was still thinner than it should be. Users could see clearer labels and a better next step, yet the storefront still needed a bounded visible layer that helps them understand why the assistant is still exploring, why two options are worth comparing, why review-first is prudent, and why an add-ready state is now legitimately steadier. The next accepted lane therefore had to improve customer trust and transparency through subtle human-facing posture signaling, not through debug instrumentation or scoring.
**Implementation / Audit Sequence:**
1. **Accepted Stage 5 trust-language landed** - commit `edc978d7aaaacd7f59e9f60bfa6d32e2cef244f9` (`feat cesarin storefront trust transparency`) updated `src/lib/cesarin-stage5.ts` so guidance now communicates posture more clearly in human-facing language. Weak/supportive/strong storefront states now read more naturally as “still refining”, “good case to compare”, “best lead for now”, “clearest route”, “well underway”, or “well anchored” instead of relying only on the action family itself.
2. **Accepted visible trust notes landed** - the same accepted commit updated `src/components/ui/ai/AIConcierge.tsx` so the storefront UI now surfaces compact trust/posture notes that help users understand the posture behind the current help without turning the interface into a badge zoo, a confidence meter, or a debug surface.
3. **Accepted public-context isolation remained intact** - the same accepted commit kept public-context help isolated from product-confidence language so `Contexto publico` turns do not get mixed with product-pressure or add-ready style trust language.
4. **Accepted closed-lane truth remained intact** - catalog-closed and non-product lanes still do not reopen product pressure, and the trust/transparency pass did not weaken catalog gate authority, anti-bloat, bounded public web, soft continuity, own-function priority, or degraded honesty.
5. **Accepted storefront scope stayed subtle and customer-facing** - this wave improves visible trust and clarity only. It does not claim a confidence-score system, a confidence meter, a debug taxonomy surface, a badge explosion, or measured trust/conversion uplift.
**Accepted Final Discipline:**
- This is an accepted real storefront trust/clarity improvement wave, not debug instrumentation.
- Stage 5 guidance now communicates posture more clearly in human-facing language.
- Compare / review / add-ready states are now easier for the user to read.
- Trust notes remain compact and subtle.
- Public-context help remains isolated from product-confidence language.
- Non-product/public turns do not receive misleading product-confidence signaling.
- Closed catalog lanes remain closed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a confidence-score system.
- This log does not claim a confidence meter.
- This log does not claim a debug taxonomy surface.
- This log does not claim a badge zoo.
- This log does not claim measured trust uplift or conversion uplift.
- This log does not claim storefront redesign from zero.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No reopening of convergence/hardening or later storefront lanes as new architecture projects.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No confidence-score or debug panel system.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Trust & Transparency Hardening Wave is now formally closed as accepted in canon. The storefront assistant now makes its visible posture easier to understand through compact human trust-signaling around exploratory, compare-worthy, review-first, and add-ready states, while keeping public-context help isolated from product-confidence language and preserving current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, commercial outcome hardening, and degraded honesty.
---

### Césarín Storefront — Commercial Outcome Hardening Wave - 29 de marzo de 2026
**Scope:** `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage4.test.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / customer-facing experience only.
**Problem Identified:**
The accepted storefront visibility wave had already made Césarín easier to read in the customer-facing UI, but visible clarity alone did not yet harden the quality of the underlying commercial outcome choice. The storefront still needed a stricter truthful distinction between exploratory help, compare-worthy help, review-first help, and real add-ready help so that weak support stays humble, two viable options do not collapse too early, and action-ready language only appears when the real support is strong enough. The next accepted lane therefore had to improve commercial outcome selection itself rather than merely polishing labels or copy.
**Implementation / Audit Sequence:**
1. **Accepted commercial support grading landed** - commit `61661f8263fb209b577d12320bb3732e73d24168` (`feat cesarin storefront outcome hardening`) updated `src/lib/cesarin-stage5.ts` so Stage 5 now explicitly grades support as `weak`, `supported`, or `strong` instead of treating all surviving storefront support as equally action-ready.
2. **Accepted weak-support honesty tightened** - the same accepted commit keeps approximate / semantic / weak fallback cases more humble. Weak or approximate cases now remain exploratory or review-first instead of sounding add-ready simply because a single fallback item survived.
3. **Accepted compare-worthiness strengthened** - the same accepted commit makes two viable products stay compare-worthy more often instead of collapsing prematurely into action-ready. Explicit compare, guided compare, approximate support, and non-strong multi-option support now keep the storefront in a more honest compare-first posture.
4. **Accepted add-ready threshold became materially stricter** - `ADD_READY` now requires genuinely strong single-product support, a ready-to-close turn, a real add-ready product, and non-approximate support. Weak single-product support remains review-first instead of action-ready.
5. **Accepted storefront expression stayed narrow and truthful** - `src/components/ui/ai/AIConcierge.tsx` now expresses true add-ready help more clearly as `Paso accionable`, while ordinary catalog-open product help still remains `Ayuda de producto`. Closed lanes do not reopen product pressure, and this pass does not create a funnel engine or claim measured KPI uplift.
**Accepted Final Discipline:**
- This is an accepted real storefront commercial-improvement lane, not just wording polish.
- Commercial outcome selection is now materially harder and more truthful.
- Support is now explicitly graded as `weak`, `supported`, or `strong`.
- Weak or approximate cases stay humbler and more exploratory/review-first.
- `ADD_READY` is now tightly restricted to genuinely strong single-product support.
- Two viable products stay compare-worthy more often instead of collapsing prematurely into action-ready.
- Weak single-product support stays review-first instead of action-ready.
- Storefront expression of true action-ready help is clearer while remaining truthful.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim measured KPI or conversion uplift.
- This log does not claim a ranking engine.
- This log does not claim a funnel engine or funnel automation layer.
- This log does not claim storefront redesign from zero.
- This log does not claim core architecture reopening.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No soft-continuity expansion into a deeper memory system.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Commercial Outcome Hardening Wave is now formally closed as accepted in canon. The storefront assistant now distinguishes exploratory, compare-worthy, review-first, and truly add-ready states more honestly, keeps weak support humble, keeps two viable products compare-worthy more often, and expresses real action readiness more clearly in the customer-facing UI, while preserving current-turn sovereignty, catalog gate discipline, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, and degraded honesty.
---

### Césarín Storefront — Commercial Visibility / UX Effectiveness Wave - 29 de marzo de 2026
**Scope:** `src/components/ui/ai/AIConcierge.tsx`, `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / customer-facing experience only.
**Problem Identified:**
By the time Waves 1–7 plus convergence/hardening were already accepted, Césarín had a materially cleaner model-first core, but the customer-facing storefront still under-expressed that strength. The assistant could already route turns truthfully, gate catalog help, keep public web bounded, and stay less bloated, yet customers still had too little visible clarity about what kind of help they were receiving and what the next real step was when support was strong. The accepted next lane needed a bounded visible storefront pass that improves clarity and commercial usefulness without reopening catalog pressure, funnel logic, or a redesign from zero.
**Implementation / Audit Sequence:**
1. **Accepted visible help differentiation landed** - commit `83c5591c49b48b5a9259078fcfc29486d04b0eea` (`feat cesarin storefront visibility hardening`) updated `src/components/ui/ai/AIConcierge.tsx` so the customer-facing assistant UI now exposes only four compact truthful help-surface labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
2. **Accepted labels stayed bounded and safely gated** - the same accepted commit kept `Contexto publico` limited to turns that actually carry `source_context`, kept `Ayuda de producto` limited to turns where catalog/product surfaces are truly open, kept `Paso accionable` limited to real action-oriented help, and prevented suppressed/non-catalog product turns from being mislabeled as product help.
3. **Accepted next-step visibility became clearer without becoming pushy** - the same accepted commit updated `src/lib/cesarin-stage5.ts` so Stage 5 copy is clearer and more customer-facing, while `Siguiente paso` remains truthfully gated behind legitimate catalog-open product help instead of appearing as a generic pressure tail.
4. **Accepted storefront scope stayed narrow and customer-facing** - the accepted pass improved visible customer understanding and clarity rather than hidden copy churn. It did not claim measured business uplift, did not redesign the storefront from zero, did not create a funnel engine, and did not reopen the accepted core architecture lanes.
5. **Accepted foundations remained preserved** - current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, and own-function priority all remained materially intact.
**Accepted Final Discipline:**
- This is an accepted real customer-facing storefront visibility pass, not hidden copy churn.
- Visible help differentiation is now present in the storefront assistant UI.
- The current truth includes only four compact labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
- `Siguiente paso` is now more customer-clear, but remains truthfully gated.
- Stage 5 copy is clearer and more customer-facing without becoming pushy.
- Product help still appears only when catalog/product surfaces are actually open.
- Suppressed/non-catalog turns do not get mislabeled as product help.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim measured business uplift.
- This log does not claim a storefront redesign from zero.
- This log does not claim a new funnel / CTA engine.
- This log does not claim a new architecture lane.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim catalog reopening.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No planner/orchestrator layer.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Commercial Visibility / UX Effectiveness Wave is now formally closed as accepted in canon. The storefront assistant now makes the accepted core more visible to real customers through compact truthful help differentiation, clearer next-step visibility when support is real, and clearer Stage 5 copy, while preserving current-turn sovereignty, catalog gate discipline, anti-bloat, bounded public web, soft continuity, and own-function priority.
---

### Césarín Core Refactor — Post-Refactor Convergence / Hardening Wave - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `src/services/concierge.service.ts`, `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, `supabase/functions/customer-intelligence/response-shaping.ts`, and `src/lib/__tests__/customer-intelligence-web-tools.test.ts`. Storefront / customer-intelligence core only.
**Problem Identified:**
By the end of Waves 1–7, Césarín already had turn-first routing, catalog gating, anti-bloat shaping, a bounded capability box, bounded public web, and soft continuity, but the accepted runtime still behaved too much like layered additions in a few load-bearing places. The concierge baseline had not yet been explicitly converged onto Gemini 2.5 Pro for the real Analyst/Sommelier path, the Analyst prompt still carried duplicated manual routing guidance alongside the accepted capability box, and stale conversational-prefix behavior still needed one final shared-runtime cleanup on clarify-first and grounded public-web turns.
**Implementation / Audit Sequence:**
1. **Accepted convergence baseline landed** - commit `d78576bb51b08a909e1e9106e29ec3726046aa3a` (`refactor cesarin post-refactor convergence hardening`) explicitly moved the storefront concierge Analyst/Sommelier path onto Gemini 2.5 Pro while leaving auxiliary/admin-style paths on auxiliary Flash where still applicable.
2. **Accepted capability-box authority was tightened** - the same accepted commit reduced duplicated manual routing prose in `supabase/functions/customer-intelligence/index.ts` and generated a compact capability summary from `supabase/functions/customer-intelligence/tool-index.ts`, making the real capability box the clearer primary routing authority instead of another broad hand-written table.
3. **Accepted final-answer ownership was cleaned up** - the same accepted commit plus follow-up commit `4dbd867915f95e5f11a50024ad891d08e1129dc5` (`patch cesarin convergence residual cleanup`) made stale conversational-prefix suppression an explicit shared runtime rule through `shouldSuppressCesarinConversationalPrefix(...)`, covering `ASK_CLARIFYING_QUESTION`, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
4. **Accepted focused residual proof landed** - the micro-pass added focused regression proof that a grounded `PUBLIC_INFO` turn with `source_context` and stale continuity input suppresses the stale prefix instead of stacking it into the final answer path.
5. **Accepted foundations remained intact** - Wave 2 turn-first sovereignty, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 5 capability-box boundedness, Wave 6 bounded public web, Wave 7 soft continuity, own-function priority, and neutral degraded fallback all remained materially preserved.
**Accepted Final Discipline:**
- This is an accepted convergence/hardening wave over the existing Césarín storefront/customer-intelligence core, not a new architecture lane.
- The storefront concierge baseline is now explicitly Gemini 2.5 Pro for Analyst and Sommelier.
- Auxiliary/admin-style paths may still remain on auxiliary Flash where applicable.
- The capability box is now the clearer primary routing authority in Analyst prompting.
- Final-answer ownership is cleaner.
- Stale conversational prefix is now explicitly suppressed in shared runtime logic for clarify-first turns, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
- Current-turn sovereignty remains load-bearing.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a redesign from zero.
- This log does not claim a new architecture lane after Wave 7.
- This log does not claim storefront UI redesign.
- This log does not claim a new commercial UX lane.
- This log does not claim voice/live work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim total rail removal everywhere.
- This log does not claim a planner/orchestrator redesign.
**What Did Not Change:**
- No reopening of Waves 1–7 as separate projects.
- No catalog-gate semantic change.
- No public-web boundedness expansion.
- No own-function priority downgrade.
- No anti-bloat rollback.
- No fake continuity or fake memory expansion.
**Outcome:**
The Césarín Core Refactor — Post-Refactor Convergence / Hardening Wave is now formally closed as accepted in canon. The storefront/customer-intelligence core now operates more coherently as one model-first Gemini 2.5 Pro concierge system, with the capability box acting as the clearer routing authority, shared stale-prefix suppression in the runtime, and preserved boundedness across turn-first routing, catalog gate, anti-bloat, public web, soft continuity, own-function priority, and degraded honesty.
---

### Césarín Core Refactor — Wave 7 Memoria y Contexto Blando - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/soft-continuity.ts`, `src/services/concierge.service.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/lib/__tests__/customer-intelligence-soft-continuity.test.ts`. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 had already left Césarín turn-first, catalog-gated, anti-bloat, capability-indexed, and web-bounded, but continuity still leaned too hard on raw recent history injection and lightweight authenticated memory without any explicit soft-continuity discipline. The accepted next lane needed bounded continuity that can avoid needless repetition and reuse recent context usefully, while keeping the current turn sovereign, keeping continuity humble, and avoiding fake durable guest memory, transcript obsession, catalog reopening, or CRM-style creepiness.
**Implementation / Audit Sequence:**
1. **Accepted soft-continuity helper landed** - commit `5e5e4db18015665c2d6ef1dcce1803bc0e4688f1` (`refactor cesarin wave 7 soft continuity`) added `supabase/functions/customer-intelligence/soft-continuity.ts` with a bounded `buildSoftContinuityContext(...)` helper. The helper derives continuity from recent session history, authenticated `ia_context`, and existing lightweight memory context; detects prior-vs-current lane shift; decides whether soft reopen is appropriate; and produces a compact prompt block for runtime use.
2. **Accepted runtime now uses soft continuity explicitly** - the same accepted commit wires soft continuity into `supabase/functions/customer-intelligence/index.ts`, adds continuity telemetry to `memoryTrace`, and injects soft-continuity rules into Analyst and Sommelier prompting so continuity stays soft, current-turn sovereignty stays load-bearing, and catalog/cart/policy behavior is not reopened by old momentum alone.
3. **Accepted storefront contract stayed materially intact** - `src/services/concierge.service.ts` now forwards bounded authenticated `ia_context` to the edge path and can merge a compact `conversational_prefix` into search, knowledge, cart, and generic replies with anti-bloat dedupe. This improved continuity reuse without reopening product surfaces on non-catalog turns and without redesigning storefront UI.
4. **Accepted continuity remained bounded and honest** - guests still do not get fake durable memory, authenticated continuity remains lightweight and field-based (`ia_context.last_query`, `last_intent`, related existing context), no deep transcript memory or CRM-style persistence layer was introduced, and anti-bloat, catalog gate, Wave 6 bounded public web, and own-function priority remained preserved.
**Accepted Final Discipline:**
- Wave 7 is accepted as a bounded soft-continuity lane over the existing storefront/customer-intelligence core.
- Soft continuity is now materially real in code.
- Continuity derives from recent session history, authenticated `ia_context`, and lightweight existing memory context.
- Continuity remains soft, compact, humble, and optional.
- Current-turn sovereignty remains intact.
- Topic/lane shift suppresses stale continuity push.
- Continuity does not reopen catalog by itself.
- Guests still do not get fake durable memory.
- Authenticated continuity is more useful, but remains lightweight rather than deep transcript memory.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim deep transcript memory.
- This log does not claim a CRM-style persistence layer.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim storefront UI redesign.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No redesign from zero.
- No reopening of Waves 1–6.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No own-function priority change.
- No public-web boundedness expansion.
- No fake durable guest memory.
**Outcome:**
The Césarín Core Refactor — Wave 7 Memoria y Contexto Blando is now formally closed as accepted in canon. The storefront/customer-intelligence core now carries recent context and lightweight authenticated continuity more usefully through a bounded soft-continuity layer, while keeping the current turn sovereign, keeping catalog/product behavior gated, keeping anti-bloat intact, and staying truthful about what still does not exist: no deep memory platform, no CRM layer, and no storefront UI redesign.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Final Micro-Pass) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tools.ts`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, and the narrow audit truth needed to close final Wave 6 storefront/customer-intelligence hygiene. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 Pass 1 plus Pass 2 had already activated bounded public-web intelligence and compact truthful `source_context`, but two small hygiene gaps remained. First, there was still no explicit negative-path proof that ordinary non-public-web turns do not surface `source_context` in storefront behavior. Second, `public_web_search_legacy` and `public_url_context_legacy` were still present in `supabase/functions/customer-intelligence/tools.ts`, leaving a stale legacy-vs-active-path ambiguity even though the accepted runtime no longer referenced those helpers.
**Implementation / Audit Sequence:**
1. **Accepted negative-path storefront proof landed** - commit `2b82970c85e691a48409a4bc056b0a4facd4ff60` (`patch cesarin wave 6 final web hygiene`) added one focused storefront regression proving an ordinary non-public-web turn does not surface `source_context`, does not render the public-context chip, and does not render fake source links.
2. **Accepted legacy helper cleanup landed** - the same accepted commit removed `public_web_search_legacy`, `public_url_context_legacy`, and their associated legacy-only helper/shim block from `supabase/functions/customer-intelligence/tools.ts` after confirming they were dead and unreferenced in the active storefront/customer-intelligence path.
3. **Accepted boundedness remained unchanged** - no selection policy changed, no catalog-gate semantics changed, no storefront UI redesign landed, no planner/orchestrator behavior was introduced, and Waves 1–6 foundations remained materially intact.
**Accepted Final Discipline:**
- This final Wave 6 micro-pass is accepted as hygiene over Wave 6 Pass 1 + Pass 2, not as a new architecture lane.
- Explicit proof now exists that non-public-web turns do not surface `source_context`.
- `source_context` remains absent on ordinary non-public-web turns.
- Dead legacy public-web helpers are removed from `supabase/functions/customer-intelligence/tools.ts`.
- The active public-web path remains the bounded primary runtime path only.
- Successful public-web turns may still surface compact truthful `source_context`, and `PUBLIC_INFO` remains explicitly non-catalog.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a new Wave 6 architecture phase.
- This log does not claim a citation framework or source dashboard.
- This log does not claim storefront UI redesign.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
**What Did Not Change:**
- No implementation redesign from zero.
- No reopening of Waves 1–5.
- No selection-policy rewrite.
- No catalog-gate semantic change.
- No own-function priority change.
- No storefront UI redesign.
- No planner/orchestrator layer.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Final Micro-Pass) is now formally closed as accepted in canon. Final Wave 6 storefront/customer-intelligence truth now includes explicit negative-path proof that non-public-web turns do not surface `source_context`, removal of dead legacy public-web helpers, and continued preservation of the bounded active public-web path without inflating Wave 6 into a new architecture phase.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Pass 2) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tools.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused storefront/runtime regression coverage tied to the accepted Wave 6 Pass 2 micro-pass. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 Pass 1 had already activated bounded public-web intelligence inside the existing capability box, but the accepted runtime/storefront path still lacked one narrow honesty improvement: when public web actually ran successfully, the final answer could remain externally grounded without any visible compact provenance/context in the storefront flow. A second narrow truth gap also remained: there was no dedicated storefront-facing regression proving that a real `PUBLIC_INFO` response stays non-catalog all the way through the edge/service/hook/UI composition path. Legacy `public_web_search_legacy` and `public_url_context_legacy` exports also still existed in `tools.ts` without explicit accepted-path containment language.
**Implementation / Audit Sequence:**
1. **Accepted compact provenance micro-pass landed** - commit `3b97ceeba6f4c3c56e3423dd1f122da34b249428` (`patch cesarin wave 6 pass 2 public source honesty`) added a bounded `source_context` path on top of accepted Wave 6 Pass 1. Successful `public_web_search` / `public_url_context` executions may now emit compact public provenance instead of leaving public-web answers visually indistinguishable from model-only synthesis.
2. **Accepted provenance stayed compact and optional** - the accepted shape remains intentionally narrow: a small public-context indicator, an optional brief, and up to 2 normalized public sources. `source_context` appears only when public web was actually used successfully. This did not introduce a citation dashboard, raw URL wall, or storefront UI redesign.
3. **Accepted storefront non-catalog truth was explicitly regression-covered** - the accepted focused regression now proves a `PUBLIC_INFO` turn remains non-catalog through the storefront path, with product / recovery / next-step product surfaces still suppressed even when compact public provenance is present.
4. **Accepted legacy cleanup stayed bounded** - `public_web_search_legacy` and `public_url_context_legacy` were not removed in this micro-pass, but they are now explicitly marked deprecated / compatibility-only so the active runtime truth is cleaner without widening the tool architecture.
5. **Accepted foundations remained intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, Wave 5 capability-box structure remains preserved, Wave 6 Pass 1 public-web boundedness remains preserved, and storefront contract stayed materially intact with only a narrow contract extension.
**Accepted Final Discipline:**
- Wave 6 Web Intelligence (Pass 2) is an accepted micro-pass over Wave 6 Pass 1 for storefront/customer-intelligence only.
- Successful `public_web_search` / `public_url_context` executions can now emit compact truthful `source_context`.
- Surfaced provenance remains bounded and optional: compact public-context indicator, optional brief, and up to 2 normalized public sources.
- `source_context` appears only when public web was actually used successfully.
- `PUBLIC_INFO` remains explicitly non-catalog.
- Product / recovery / next-step product surfaces remain suppressed on the relevant `PUBLIC_INFO` storefront path.
- Storefront contract remained materially intact; only a narrow contract extension was added.
- Legacy `public_web_search_legacy` / `public_url_context_legacy` remain compatibility-only and are not the active primary path.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log records a bounded micro-pass over Wave 6 Pass 1, not a new architecture lane.
- This log does not claim a citation framework or source dashboard.
- This log does not claim full Wave 6 completion beyond Pass 1 + Pass 2.
- This log does not claim storefront UI redesign.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
**What Did Not Change:**
- No implementation redesign from zero.
- No reopening of Waves 1–5.
- No storefront UI redesign.
- No catalog-gate semantic change.
- No own-function priority change.
- No planner/orchestrator layer.
- No doc/canon drift inside implementation files.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Pass 2) is now formally closed as accepted in canon. The accepted Wave 6 public-web lane now includes compact truthful provenance when public web actually ran, retains explicitly non-catalog `PUBLIC_INFO` storefront behavior, keeps legacy web helpers contained as compatibility-only, and preserves the bounded Wave 6 Pass 1 architecture without overstating citation, UI, or planner scope.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Pass 1) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/tools.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, and the focused runtime/storefront regression coverage tied to the accepted Wave 6 Pass 1 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 5 had already created a real explicit capability box, but the public-web side still existed only as honest reserved slots. The accepted next lane needed bounded real web intelligence so Césarín can use public external context when it is materially useful, without turning web lookup into a reflex, without bypassing own/private truth functions, and without reopening catalog coercion, planner behavior, or storefront/UI redesign.
**Implementation / Audit Sequence:**
1. **Accepted public-web capability activation landed** - commit `b3430ebdc21eeca8a7b215c6d192066f19664f91` (`refactor cesarin wave 6 web intelligence pass 1`) activated `public_web_search` and `public_url_context` as real `NATIVE_PUBLIC` capabilities inside the existing capability box rather than as reserved placeholders only.
2. **Accepted bounded selection discipline landed** - the runtime now keeps `MODEL_KNOWLEDGE` as the default when external lookup is unnecessary, keeps `OWN_FUNCTION` authoritative for private truth / internal state / real action, limits `public_url_context` to explicit URL or page-context turns, limits `public_web_search` to genuine public/fresh/external-info turns, and suppresses public web on greeting or clarify-first turns.
3. **Accepted bounded runtime execution stayed on the existing path** - public web executes only through the existing bounded `capabilityPlan.serverToolCalls` surface; this lane did not introduce a new planner, orchestrator, or parallel agent layer.
4. **Accepted storefront/runtime truth stayed compact** - `PUBLIC_INFO` is explicitly non-catalog, catalog gate authority remains preserved, public-web synthesis stays compact and explicitly external rather than impersonating private/internal truth, and anti-bloat discipline remains preserved instead of turning responses into search reports.
5. **Accepted architecture preservation remained intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, Wave 5 capability-box structure remains preserved, degraded Analyst fallback remains neutral, and storefront-service alignment stayed minimal with no storefront UI redesign.
**Accepted Final Discipline:**
- Wave 6 Web Intelligence (Pass 1) is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- `public_web_search` and `public_url_context` are now real active bounded `NATIVE_PUBLIC` capabilities.
- Public web is selected only through the bounded capability-plan path and is not reflexive.
- `MODEL_KNOWLEDGE` remains the default when external lookup is unnecessary.
- `OWN_FUNCTION` remains the winning lane for private truth, internal state, and real action.
- `PUBLIC_INFO` is explicitly non-catalog.
- Runtime execution remains bounded through `capabilityPlan.serverToolCalls`.
- Storefront contract remained stable; no storefront UI redesign was required for this lane.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log records Wave 6 Pass 1 only, not full web-intelligence completion.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim storefront UI redesign.
- This log does not claim that public web replaces own internal/private truth functions.
- This log does not claim a giant public-web platform beyond the bounded active capabilities.
**What Did Not Change:**
- No redesign from zero.
- No reopening of Waves 1–5.
- No new mode system.
- No new funnel / CTA layer.
- No admin / Cesarin OS work.
- No live/voice work.
- No full Wave 6 completion claim beyond Pass 1.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Pass 1) is now formally closed as accepted in canon. The storefront/customer-intelligence core now has bounded active public-web capabilities inside the existing capability box, policy-gated through the existing capability-plan path, while preserving turn-first behavior, catalog gate discipline, anti-bloat shaping, neutral degraded fallback, and the stable storefront contract without overstating full web-intelligence completion.
---

### Césarín Core Refactor — Wave 5 Tool Index Real - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, and the focused runtime/storefront regression coverage tied to the accepted Wave 5 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 4 had already made Césarín turn-first, catalog-gated, and less bloated, but the runtime still carried too much hidden capability routing inside `index.ts` and a separate guardrail-owned intent-to-tool table. The accepted lane needed a real explicit capability box so model knowledge, native/public capability slots, and own/private/action functions are consultable in code rather than inferred from scattered `if A then force B` assumptions.
**Implementation / Audit Sequence:**
1. **Accepted explicit capability index landed** - commit `124e46730602eef4112eae6ca2e282867a9c8ae4` (`refactor cesarin wave 5 tool index real`) added `supabase/functions/customer-intelligence/tool-index.ts` and `supabase/functions/customer-intelligence/tool-selection.ts`, making the Wave 5 split explicit and real through `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
2. **Accepted runtime now consumes an explicit capability plan** - runtime in `supabase/functions/customer-intelligence/index.ts` now builds and uses a bounded `capabilityPlan`, and edge execution now routes through `capabilityPlan.serverToolCalls` instead of another scattered hardcoded server-tool list.
3. **Accepted public-web truth stayed honest** - `public_web_search` and `public_url_context` now exist as explicit reserved capability slots in the capability box, but they remain classification-only at this stage and are not claimed as active Wave 6 web intelligence or as a live public-web execution path.
4. **Accepted border-policy cleanup landed** - follow-up commit `4ff767b7df249f55d5087bf918d0780f16c4fa60` (`patch align wave 5 tool index guardrails`) centralized intent filtering through the capability-id mapping in the tool index so guardrails no longer keep a separate hidden routing table. Guardrails remain border policy and do not reopen product-search coercion.
5. **Accepted boundedness stayed intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, persona stays slim instead of becoming a routing manual, degraded Analyst fallback remains neutral, and storefront contract/UI did not require redesign for this lane.
**Accepted Final Discipline:**
- Wave 5 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- A real explicit capability/tool index now exists in the storefront/customer-intelligence core.
- The Wave 5 split is now explicit and real: `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
- Runtime now builds and uses an explicit bounded `capabilityPlan`.
- Edge execution now uses `capabilityPlan.serverToolCalls`.
- Intent filtering is now centralized through the capability index / capability-id mapping rather than a separate hidden guardrail routing table.
- Guardrails remain border policy and do not reintroduce product-search coercion.
- Storefront contract remained stable; no storefront UI redesign was required for Wave 5.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 6 web intelligence is active.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim storefront UI redesign.
- This log does not claim that all Analyst prompt references disappeared.
- This log does not claim public-web execution is active; the public-web slots remain reserved classification only.
**What Did Not Change:**
- No doc/canon drift inside implementation files.
- No new mode system.
- No new funnel / CTA layer.
- No live/voice work.
- No admin / Cesarin OS work.
- No web-intelligence completion.
**Outcome:**
The Césarín Core Refactor — Wave 5 is now formally closed as accepted in canon. The storefront/customer-intelligence core now has a real explicit capability box and a bounded runtime capability plan, while preserving Waves 1–4 gains and staying truthful about what still is not active: no Wave 6 public-web execution, no planner redesign, and no storefront/UI redesign.
---

### Césarín Core Refactor — Wave 4 Anti-Bloat / Respuesta Desinflada - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/response-shaping.ts`, `src/lib/cesarin-stage1.ts`, `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 4 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 3 had already made Césarín turn-first and catalog-gated, but the accepted runtime/storefront path could still bloat the final answer shape through stacked response layers: runtime text, adaptive Stage 4 tails, Stage 5 next-step reinjection into main text, and storefront copy that could still echo the same move more than once. The accepted lane needed a bounded anti-bloat discipline so Césarín tends toward one useful move, fewer robotic commercial closers, and less duplicated guidance without erasing approximate recovery, next-step help, or honest WhatsApp fallback.
**Implementation / Audit Sequence:**
1. **Accepted runtime anti-bloat discipline landed** - commit `88b3a439222ed7ae6eeab7e25778b5504b859aa6` (`refactor cesarin wave 4 anti-bloat responses`) added explicit anti-bloat rules in `supabase/functions/customer-intelligence/persona.ts`, introduced `RESPONSE_SHAPE_RULES`, and kept the scope narrowly on response-shape hardening rather than opening a new orchestrator, tool-index, or web-intelligence lane.
2. **Accepted runtime shaping now exists in real code** - `compactCesarinResponseText(...)` in `persona.ts` and `shapeCesarinResponseText(...)` in `supabase/functions/customer-intelligence/response-shaping.ts` now compact runtime/storefront output by deduping repeated sentences, trimming soft closers, bounding questions, and reducing reflexive closing tails. `supabase/functions/customer-intelligence/index.ts` now applies that shaping to parsed/fallback runtime text and to the product-capsule conversational prefix before returning the final answer.
3. **Accepted Stage 4/Stage 5 de-duplication landed** - `src/lib/cesarin-stage4.ts` no longer appends an extra commercial tail when `baseMessage` already carries the useful move, and `src/lib/cesarin-stage5.ts` now keeps actionable guidance inside `next_step_view` instead of reinjecting that same move into the main assistant text.
4. **Accepted storefront anti-reinflation landed** - storefront-side search-path copy is now compacted in `src/services/concierge.service.ts`, while `src/hooks/useAIConcierge.ts` and `src/components/ui/ai/AIConcierge.tsx` avoid re-bloating the answer with reflexive helper copy or duplicated recovery/next-step framing.
5. **Useful surfaces stayed preserved** - approximate recovery still remains available when justified, next-step help still remains available when justified, honest WhatsApp fallback remains real, truthful business/action boundaries remain preserved, and Wave 1 / Wave 2 / Wave 3 gains remain intact underneath the new shaping discipline.
**Accepted Final Discipline:**
- Wave 4 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially less bloated in runtime/storefront output.
- Runtime/storefront now tends toward one useful move, fewer duplicated phrases, and fewer robotic commercial tails.
- Stage 4 and Stage 5 no longer duplicate the same move across main text and next-step guidance.
- Storefront no longer re-bloats what runtime already said on the main search/product path.
- Useful help remains intact when justified: approximate recovery, next-step help, honest WhatsApp fallback, and truthful business/action boundaries.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 5 tool-index work.
- This log does not claim web-intelligence work.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim a new mode system.
- This log does not claim a new CTA or funnel layer.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim semantic perfection; Wave 4 remains heuristic anti-bloat shaping.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No Wave 5 tool-index implementation.
- No web-intelligence implementation.
- No live/voice work.
- No new mode system.
- No new funnel / CTA orchestration layer.
- No product-search lane rewrite from zero.
**Outcome:**
The Césarín Core Refactor — Wave 4 is now formally closed as accepted in canon. Césarín storefront/runtime output is materially less bloated, duplicate guidance across message and next-step was reduced, robotic commercial tails were reduced, useful help remains intact when justified, and the accepted Wave 1 / Wave 2 / Wave 3 foundations remain preserved without overstating tool-index, web-intelligence, or planner completion.
---

### Césarín Core Refactor — Wave 3 Catalog Gate - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 3 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 2 had already made Césarín materially turn-first, but catalog/product surfacing could still appear too reflexively whenever product search was possible. The accepted branch reality needed an explicit catalog gate so products, recovery cards, and product-oriented next-step surfaces only appear when the current turn actually justifies them. Canon also needed to stay truthful about implementation provenance: the current branch already contained the main Wave 3 runtime/storefront gate in `HEAD`, while the last small patch only aligned persona wording with that accepted branch reality.
**Implementation / Audit Sequence:**
1. **Main Wave 3 catalog-gate implementation accepted in branch reality** - commits `8fa0adf3343c5417c006bbfea3f69ffbde37d227` and `c9c0178726d3d934b679982760a47edfe5b551fa` (both `refactor cesarin wave 3 catalog gate`) together established the accepted current branch state: `resolveCatalogGate(...)` now exists in `supabase/functions/customer-intelligence/intent-guardrails.ts`, runtime consumes the gate in `supabase/functions/customer-intelligence/index.ts`, storefront normalizes/applies it in `src/services/concierge.service.ts`, the hook carries/respects it in `src/hooks/useAIConcierge.ts`, and the UI suppresses product surfaces from it in `src/components/ui/ai/AIConcierge.tsx`.
2. **Clarification-first catalog suppression accepted** - when the current turn remains materially unresolved, `ASK_CLARIFYING_QUESTION` and `UNKNOWN` keep the gate closed, search tools are stripped from the runtime capability plan, and product/card/catalog surfacing is not allowed to reopen through a hidden fallback path.
3. **Closed-gate storefront suppression accepted** - when the gate is closed, products are cleared, `resolved_products` are cleared, `next_step_view` is nulled, and stale product/recovery/next-step product surfaces are suppressed instead of lingering after the conversation has changed lanes.
4. **Legitimate search-leading value preserved** - when the current turn is genuinely search-leading and clear enough, product surfacing remains allowed, approximate recovery remains preserved, and Wave 1 / Wave 2 gains remain intact underneath the gate.
5. **Final persona alignment patch accepted narrowly** - commit `7f726194fe21f795b2c2641b06f0a31c14700241` (`patch align cesarin catalog gate persona`) only made the no-reflex-catalog discipline explicit in `persona.ts`; it did not create the whole Wave 3 lane by itself.
**Accepted Final Discipline:**
- Wave 3 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially catalog-gated at the runtime/storefront behavior level.
- Catalog/product surfaces now appear when the current turn justifies them, not by reflex.
- Clarification-first and non-catalog lanes stay product-suppressed.
- When the gate closes, stale product/recovery/next-step product surfaces suppress themselves instead of hanging across the lane change.
- Legitimate search-leading turns can still surface products and approximate recovery when the current turn actually supports that help.
- Wave 1 and Wave 2 gains remain preserved: lighter core identity, explicit capability boundaries, turn-first routing, lightweight memory, honest WhatsApp fallback, truthful business/action boundaries, and honest guest non-persistence.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 4 anti-bloat.
- This log does not claim live/voice work.
- This log does not claim a giant planner/orchestrator.
- This log does not claim admin / Cesarin OS work.
- This log does not claim total removal of all prior helper shaping.
- This log does not claim the final tiny persona patch alone implemented the whole lane.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No new mode system.
- No new CTA or funnel orchestration layer.
- No anti-bloat rewrite.
- No live/voice work.
- No full retrieval/ranking redesign from zero.
**Outcome:**
The Césarín Core Refactor — Wave 3 is now formally closed as accepted in canon. Catalog/product surfaces are now governed by an explicit runtime/storefront gate, clarification-first and non-catalog turns stay product-suppressed, stale product surfaces no longer linger after a lane change, legitimate search-leading turns still keep useful product help and approximate recovery when justified, and the accepted Wave 1 / Wave 2 foundations remain intact without overstating the final small persona patch or later waves.
---

### Césarín Core Refactor — Wave 2 Turn-First Engine - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/analyst-fallback.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 2 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 1 had already made Césarín materially less rail-driven, but the runtime could still inherit stale prior-lane posture too easily. The system was no longer forcing main-path product search, yet it still lacked an explicit current-turn structure that could decide what the current message needed first, keep mixed-intent turns bounded, and stop stale search/product/recovery surfaces from dominating when the conversation naturally changed lanes.
**Implementation / Audit Sequence:**
1. **Storefront turn-first contract accepted** - commit `3752ce26b992cf9ac50e4d24096fea73abfd64ec` (`refactor cesarin wave 2 turn-first storefront`) updated the storefront contract so turn analysis is carried explicitly, stale search-specific humanization no longer dominates non-search turns, approximate recovery stays bounded to search-leading turns, and product/recovery/next-step product surfaces suppress themselves when the current turn is no longer search-first.
2. **Runtime turn-first engine accepted** - commit `aa6b276fc489bcd0918ecff8fb73e88da1513381` (`refactor cesarin wave 2 turn-first engine`) added the bounded turn-first profile `primary_intent`, `secondary_intents`, `turn_priority`, `current_turn_decision`, `turn_focus`, `primary_tool_calls`, and `queued_tool_calls`; made runtime execution act from `primary_intent`; filtered tool calls to the primary lane; and kept secondary intents as bounded queued context instead of pretending deep parallel planning.
3. **Current turn now overrides stale prior-path momentum** - the accepted runtime now lets shopping, doubt, policy, compatibility, tracking, and other materially different current-turn needs supersede stale commercial posture, prior narrowing, or memory momentum when the new turn genuinely changes lane.
4. **Wave 1 gains stayed preserved** - lightweight memory remained conservative, approximate recovery remained available, honest WhatsApp fallback remained real, business/action truth stayed load-bearing, guests still did not gain fake durable memory, and this wave did not reopen Wave 3 catalog gating, Wave 4 anti-bloat, or live/voice work.
**Accepted Final Discipline:**
- Wave 2 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially turn-first at the runtime/storefront behavior level.
- One primary intent is handled first; secondary intents may remain as bounded queued context.
- Runtime now acts from `primary_intent` and filters tool calls to the primary lane.
- Current turn can override stale prior-lane momentum instead of inheriting fixed funnel continuity.
- Storefront search/product/recovery/next-step product affordances no longer dominate turns that have naturally changed away from search-first behavior.
- Wave 1 gains remain preserved: lightweight memory, approximate recovery, honest WhatsApp fallback, truthful business boundaries, and honest guest non-persistence.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 3 catalog gating.
- This log does not claim Wave 4 anti-bloat.
- This log does not claim a new mode system.
- This log does not claim a giant planner/orchestrator.
- This log does not claim live/voice work.
- This log does not claim total removal of all Stage-era shaping infrastructure.
- This log does not claim deep parallel execution of secondary intents; they remain bounded queued context only.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No doc-driven reopening of Stage 4 / Stage 5 as separate implementation lanes.
- No new CTA or funnel orchestration layer.
- No catalog-gate redesign.
- No anti-bloat rewrite.
- No live/voice work.
**Outcome:**
The Césarín Core Refactor — Wave 2 is now formally closed as accepted in canon. Césarín storefront/runtime behavior is materially turn-first, the current turn now takes precedence over stale prior-path momentum, mixed-intent turns stay bounded and truthful, storefront product-search affordances no longer dominate turns that changed lanes, and Wave 1 load-bearing value remains intact without overstating later waves or planner intelligence.
---

### Césarín Core Refactor — Wave 1 + Corrective Micro-Pass - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `src/services/concierge.service.ts`, and the narrow regression coverage tied to the accepted corrective micro-pass. Storefront / customer-intelligence core only.
**Problem Identified:**
The accepted storefront pilot still carried too much old Césarín core coercion in its primary runtime path. Persona had accumulated seller-scripted cadence, runtime behavior still mixed model reasoning with capabilities and UI affordances, product-search pressure still existed through hard rails, and storefront shaping still carried historical dependency assumptions around edge-provided `conversation_mode_hint`. After the main Wave 1 acceptance, one residual truth gap remained: the degraded Analyst fallback still defaulted to `PRODUCT_SEARCH` and forced `product_search_integrity`, which kept a product-search coercion tail alive outside the primary path.
**Implementation / Audit Sequence:**
1. **Wave 1 core refactor accepted** - commit `d97a08eae456c334ba2dc616542111a45f32b67e` (`refactor cesarin storefront wave 1 core`) slimmed `persona.ts`, made the runtime split clearer between model reasoning, native capabilities, own functions, and UI affordances, and removed the hardest coercive rails from the primary path without reopening the storefront pilot as a new architecture program.
2. **Primary-path product-search coercion removed** - the old weak-intent `UNKNOWN -> PRODUCT_SEARCH` coercion was removed from the main path, forced product-search injection was removed from the main path, and storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime contract.
3. **Load-bearing storefront value preserved** - lightweight authenticated memory remained conservative, approximate recovery remained visible, honest WhatsApp fallback remained real, business truth stayed load-bearing, guests still did not gain fake durable memory, and Stage 4 / Stage 5 storefront shaping infrastructure was not falsely claimed as removed wholesale.
4. **Corrective micro-pass accepted** - commit `dc3cde88026445fc607e07e49d0900b25a4a91a8` (`patch neutralize analyst degradation fallback`) closed the residual degraded-path truth gap by replacing the old degraded Analyst fallback with a neutral fallback returning `intent: 'UNKNOWN'`, `turn_decision: 'ASK_CLARIFYING_QUESTION'`, `tool_calls: []`, and `fallback_reason: 'ANALYST_DEGRADED'`.
**Accepted Final Discipline:**
- Wave 1 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín core is now materially less rail-driven, and `persona.ts` is slimmer and less seller-scripted.
- Runtime separation is clearer between model reasoning, native Gemini capabilities, own functions, and UI affordances.
- Product-search coercion is no longer present in the main weak-intent path nor in the degraded Analyst fallback.
- Storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime dependency.
- Lightweight memory, approximate recovery, honest WhatsApp fallback, and business truth remain preserved.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 2 or a fully realized turn-first engine.
- This log does not claim a catalog-gate redesign, anti-bloat wave, or live/voice wave.
- This log does not claim total deletion of all legacy Stage-era code.
- This log does not claim Stage 4 / Stage 5 infrastructure was removed end-to-end.
- This log does not claim broad live degraded-runtime proof beyond the accepted corrective fallback contract.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No new conversation-mode layer.
- No new CTA or funnel orchestration layer.
- No catalog-gate redesign.
- No anti-bloat rewrite.
- No live/voice work.
**Outcome:**
The Césarín Core Refactor — Wave 1 is now formally closed as accepted in canon. Césarín storefront core is materially less rail-driven, core identity is slimmer, capability boundaries are clearer, product-search coercion is removed from both the main path and degraded Analyst fallback, and accepted storefront value remains intact without overstating Wave 2 or broader architectural completion.
---

### Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention - 26 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/services/orders.service.ts`, `src/hooks/useOrders.ts`, `src/hooks/useCheckout.ts`, `src/actions/checkout.ts`, `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, `src/components/cart/OpenRecoverableOrderNotice.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/hooks/__tests__/useCheckout.test.tsx`, `src/pages/__tests__/Checkout.test.tsx`, and `src/components/cart/__tests__/CartSidebar.test.tsx` only.
**Problem Identified:**
Authenticated storefront checkout already had bounded duplicate-submit hardening once `submitCheckout(...)` executed, but cart and checkout-entry surfaces still remained visually and behaviorally blind to an existing persisted genuinely payable order already in flight. That gap left room for duplicate intent and ambiguous “start checkout again” behavior instead of truthfully recovering the current persisted order.
**Implementation / Audit Sequence:**
1. **Shared recoverable-order truth landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOpenOrderRecoveryView(...)` as the shared storefront-only interpretation of when an authenticated persisted order is genuinely recoverable. Recovery stays bounded to persisted order/payment truth; it does not invent new lifecycle states or rely on route semantics.
2. **Bounded storefront fetch now exists for authenticated open recoverable orders** - `src/services/orders.service.ts` now provides `getCustomerOpenRecoverableOrder(...)`, and `src/hooks/useOrders.ts` now exposes the shared data hook used by storefront cart/checkout surfaces. The fetch remains narrow to the class of orders the storefront is allowed to resume under the already accepted continuation model.
3. **Real pre-submit duplicate-checkout prevention now happens before `submitCheckout(...)`** - `src/hooks/useCheckout.ts` now checks for an authenticated persisted recoverable order before calling `submitCheckout(...)`. This is real prevention rather than cosmetic UI: when a recoverable order already exists, checkout initiation is stopped and the user is redirected toward the persisted order instead of starting a competing checkout attempt.
4. **Recovery-priority storefront UI now exists across cart/checkout surfaces** - `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` now surface bounded recovery guidance for authenticated users, including truthful “order already in progress” framing and bounded CTAs to continue payment or review the persisted order. This remains storefront-only UI hardening, not a broader recovery platform.
5. **Accepted invariants stayed intact** - `src/actions/checkout.ts` kept the accepted `submitCheckout` contract unchanged; `supabase/functions/create-payment/index.ts` kept server-side session, ownership, and valid payable-state enforcement unchanged; no guest persisted order/payment flow was introduced; no paid inference from route semantics was reintroduced; paid-only cart clear remained preserved; paid-only confetti remained preserved; and bounded continuation/recheck behavior was not reopened.
6. **Validation outcome** - Focused cold audit accepted, relevant tests passed `56/56`, `typecheck` passed, and `build` passed. This log does not claim live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only authenticated open-order recovery and duplicate checkout prevention.
- Shared recovery truth now exists in `src/lib/domain/orders.ts` through `getStorefrontOpenOrderRecoveryView(...)`.
- Bounded authenticated recoverable-order fetch now exists in `src/services/orders.service.ts` through `getCustomerOpenRecoverableOrder(...)`, with shared consumption through `src/hooks/useOrders.ts`.
- `src/hooks/useCheckout.ts` now performs real pre-submit duplicate-checkout prevention before `submitCheckout(...)`.
- `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` now prioritize recovery UI over duplicate-initiation ambiguity.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim guest persisted payment/order flow.
- This log does not claim order-management platform expansion.
- This log does not claim shipping, tracking, returns, invoicing, or support-platform expansion.
- This log does not claim payment rewrite or broad payment-recovery rewrite.
- This log does not claim live-browser proof or broader auth/RLS/browser proof beyond the accepted focused cold audit and validation set.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No order-management platform expansion.
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention lane is now formally closed as accepted. Authenticated storefront cart and checkout surfaces now recover toward the persisted genuinely payable order already in flight, pre-submit duplicate initiation is blocked before `submitCheckout(...)`, and previously accepted payment/order invariants remain intact.
---

### Storefront Post-Purchase Confidence & Receipt Surface Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/components/order/PostPurchaseReceiptCard.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, `src/hooks/useOrders.ts`, `src/services/orders.service.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, `src/pages/__tests__/PaymentFailure.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only.
**Problem Identified:**
The storefront already had stronger checkout persistence, bounded payment continuation, lifecycle coherence, and orders-index actionability, but the immediate post-purchase surfaces still under-communicated certainty and revisit value. `PaymentSuccess.tsx` carried the strongest confirmation treatment, while `PaymentPending.tsx` and `PaymentFailure.tsx` remained technically truthful but too thin to feel like reliable post-purchase receipt/confirmation surfaces. The remaining gap was information hierarchy and revisit confidence, not payment architecture or guest-flow behavior.
**Implementation / Audit Sequence:**
1. **Shared post-purchase confidence derivation landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontPostPurchaseConfidenceView(...)` as a persisted-truth-first post-purchase interpretation over registered order identity, immediate next-step framing, and revisit guidance.
2. **A shared receipt/confidence surface was introduced for payment-return pages** - `src/components/order/PostPurchaseReceiptCard.tsx` now acts as the shared storefront receipt/revisit surface. `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now consume that same shared surface so authenticated users can scan order identity, registered purchase summary, persisted state framing, and clear return paths to order detail and orders history without relying on route semantics.
3. **Order detail received bounded reinforcement only** - `src/pages/OrderDetail.tsx` gained only bounded post-purchase visibility / next-step hardening. The persisted-order-first read path through `src/hooks/useOrders.ts` and `src/services/orders.service.ts` remained intact; this lane did not redesign payment reads, persistence, or checkout architecture.
4. **Accepted invariants stayed intact** - no paid inference from route semantics was reintroduced, paid-only cart clear remained preserved, paid-only confetti remained preserved, bounded continuation stayed limited to authenticated persisted genuinely payable orders, bounded manual refresh/recheck behavior stayed preserved, and no guest persisted order/payment flow was introduced.
5. **Validation outcome** - Focused cold audit accepted, relevant tests passed `57/57`, `typecheck` passed, and `build` passed. This log does not claim live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only post-purchase confidence and receipt-surface hardening.
- Shared post-purchase confidence derivation now exists in `src/lib/domain/orders.ts` through `getStorefrontPostPurchaseConfidenceView(...)`.
- Shared receipt/confidence rendering now exists in `src/components/order/PostPurchaseReceiptCard.tsx` and is used by `PaymentSuccess.tsx`, `PaymentPending.tsx`, and `PaymentFailure.tsx`.
- `OrderDetail.tsx` received only bounded payment visibility / next-step hardening.
- Persisted-truth-first reads remain anchored on `src/hooks/useOrders.ts` and `src/services/orders.service.ts`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim shipping, tracking, returns, invoicing, or support-platform expansion.
- This log does not claim guest persisted payment/order flow.
- This log does not claim payment architecture rewrite or payment recovery platform behavior.
- This log does not claim live-browser validation or broader auth/RLS/browser proof beyond the accepted cold audit and focused validation set.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Post-Purchase Confidence & Receipt Surface Hardening lane is now formally closed as accepted. Payment-return pages now share a persisted-truth-first receipt/confidence surface, order identity and revisit paths are clearer at the point of post-purchase exit, `OrderDetail.tsx` remains the durable persisted-order reference, and previously accepted paid-only and continuation invariants remain intact.
---

### Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/cart.ts`, `src/components/cart/CheckoutTransitionStatus.tsx`, `src/components/cart/CartSidebar.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/pages/Checkout.tsx`, `src/hooks/useCartValidator.ts`, `src/hooks/useCheckout.ts`, `src/stores/cart.store.ts`, `src/lib/domain/__tests__/cart.test.ts`, `src/components/cart/__tests__/CartSidebar.test.tsx`, `src/pages/__tests__/Checkout.test.tsx`, and `src/stores/__tests__/cart.store.test.ts` only.
**Problem Identified:**
The storefront already had stronger purchaseability truth and corrected-cart behavior, but the transition from cart into checkout still derived readiness too locally. `CartSidebar`, `Checkout`, and `CheckoutForm` did not all read the same transition truth, automatic corrections were mostly surfaced as transient notifications instead of a shared pre-commit state, and cart-to-checkout navigation could still feel opaque about whether the user was ready, blocked, or required to review corrected cart state first.
**Implementation / Audit Sequence:**
1. **Shared cart-to-checkout transition truth landed in domain logic** - `src/lib/domain/cart.ts` now provides `getStorefrontCheckoutTransitionView(...)`, which centralizes storefront transition interpretation into shared `ready`, `review`, and `blocked` states plus user-readable next-step messaging.
2. **Main cart/checkout surfaces now consume that shared interpretation** - `src/components/cart/CartSidebar.tsx`, `src/pages/Checkout.tsx`, and `src/components/cart/CheckoutForm.tsx` now consume the same transition reading through `src/components/cart/CheckoutTransitionStatus.tsx` instead of deriving readiness independently per surface.
3. **Runtime cross-surface validation state is now shared** - `src/stores/cart.store.ts` now carries `lastValidationResult` as shared runtime state across storefront cart/checkout surfaces, and cart mutations clear stale validation state after the user edits the cart. This log does not claim persisted-storage durability for that field.
4. **CartSidebar now validates before navigation** - `src/components/cart/CartSidebar.tsx` now runs validation before navigating to `/checkout` and blocks checkout entry when corrected cart truth leaves no purchasable items.
5. **Validation outcome** - Focused domain/store/hook/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- This lane is storefront-only cart-to-checkout transition clarity and commitment hardening.
- Cart-to-checkout readiness now centralizes through `getStorefrontCheckoutTransitionView(...)`, including shared `ready` / `review` / `blocked` runtime truth and user-readable next-step messaging.
- `CartSidebar.tsx`, `Checkout.tsx`, and `CheckoutForm.tsx` now consume the same shared runtime transition interpretation.
- `CartSidebar.tsx` validates before navigation and blocks checkout entry when corrected cart truth leaves no purchasable items.
- `cart.store.ts` now shares `lastValidationResult` across storefront surfaces as runtime state, and cart mutations clear stale validation state after cart edits.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim persisted-storage durability for `lastValidationResult`; it is recorded only as shared runtime state.
- This log does not claim advanced checkout work.
- This log does not claim guest expansion.
- This log does not claim shipping, stock-reservation, or payment-platform redesign.
- This log does not convert focused tests into broad live-browser proof.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No advanced checkout.
- No shipping, stock-reservation, or inventory-platform work.
- No payment platform rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening lane is now formally closed as accepted with minor truth adjustments. Storefront cart, checkout entry, and final checkout commitment now read the same runtime readiness truth, automatic corrections are surfaced as a shared pre-commit state instead of only transient notifications, and cart-to-checkout navigation now blocks when corrected cart truth leaves no purchasable items.
---

### Storefront Purchaseability Truth & Cart Integrity Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/products.ts`, `src/components/products/ProductActions.tsx`, `src/components/products/StickyAddToCart.tsx`, `src/components/products/QuickViewModal.tsx`, `src/components/products/ProductCard.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/pages/Checkout.tsx`, `src/stores/cart.store.ts`, `src/hooks/useCheckout.ts`, `src/lib/domain/__tests__/products.test.ts`, `src/stores/__tests__/cart.store.test.ts`, `src/hooks/__tests__/useCheckout.test.tsx`, and `src/pages/__tests__/Checkout.test.tsx` only.
**Problem Identified:**
The storefront already had stronger authenticated checkout/order/payment truth, but purchaseability still drifted earlier in the funnel. Listing, PDP, quick-view, cart, and checkout-entry surfaces did not all resolve purchaseability from the same storefront truth, variant-bearing products could still be quick-added too blindly from the card surface, and checkout submission could still rely on stale pre-validation cart state instead of the corrected post-validation cart.
**Implementation / Audit Sequence:**
1. **Shared purchaseability truth landed in domain logic** - `src/lib/domain/products.ts` now provides `getStorefrontProductPurchaseability(...)` as the shared storefront interpretation for current product/variant purchaseability, including inactive/discontinued blocking, out-of-stock blocking, variant-required state, selected-variant availability, and selected-variant quantity limits.
2. **Storefront product-entry surfaces now consume that shared truth** - `src/components/products/ProductActions.tsx`, `src/components/products/StickyAddToCart.tsx`, and `src/components/products/QuickViewModal.tsx` now gate quantity and add-to-cart behavior from the shared purchaseability view. `src/components/products/ProductCard.tsx` no longer blindly quick-adds variant-bearing products; when variants materially matter, the card surface now routes the user into option-selection behavior instead.
3. **Cart integrity is now variant-aware** - `src/stores/cart.store.ts` now validates and corrects cart lines against current catalog and selected variant truth, preserves/corrects `variant_id` and `variant_name`, removes invalid variant lines through `variant_removed`, clamps valid variant lines through `variant_stock_adjusted`, and no longer preserves invalid variant lines through permissive base-stock fallback in `updateQuantity(...)`.
4. **Checkout entry and final submit now use corrected cart truth** - `src/components/cart/CheckoutForm.tsx` now gates final submit from purchasable-cart truth instead of raw item count, `src/pages/Checkout.tsx` no longer keeps showing stale checkout summary after the live cart has been corrected away, and `src/hooks/useCheckout.ts` now re-reads corrected post-validation cart state before building the submit payload. Final checkout progression now blocks when corrected cart truth leaves zero purchasable items or critical removal issues such as `variant_removed`.
5. **Validation outcome** - Focused domain/store/hook/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only purchaseability truth and cart-integrity hardening.
- Storefront purchaseability now centralizes through `getStorefrontProductPurchaseability(...)`.
- Product-entry surfaces, sticky add-to-cart, quick view, cart correction, and checkout-entry/final-submit gating now read from that shared storefront purchaseability truth.
- Variant-bearing products are no longer blindly quick-added from `ProductCard.tsx`.
- Checkout submission now uses corrected post-validation cart truth, and final progression blocks when corrected cart truth leaves zero purchasable items or critical removal issues such as `variant_removed`.
**Residual Truth Safeguards / Wording Guardrails:**
- This log does not claim stock reservation or inventory guarantees.
- This log does not claim guest order/payment expansion.
- This log does not claim payment architecture rewrite.
- This log does not claim broad live-browser proof.
- Some PDP and Quick View flows still auto-select the first currently purchasable variant; this log does not claim explicit manual variant selection on every path.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest reorder.
- No shipping, stock-reservation, inventory-platform, tracking, returns, or cancellations work.
- No payment platform rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Purchaseability Truth & Cart Integrity Hardening lane is now formally closed as accepted. Storefront purchaseability truth now converges earlier from PDP/card surfaces into cart and checkout entry, cart correction remains variant-aware and honest, and final checkout submission now uses corrected post-validation cart truth instead of stale pre-validation cart state.
---

### Storefront Authenticated Orders Index & Actionability Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/pages/Orders.tsx`, `src/lib/domain/__tests__/orders.test.ts`, and `src/pages/__tests__/Orders.test.tsx` only, with supporting inspection of `src/pages/OrderDetail.tsx`, `src/pages/__tests__/OrderDetail.test.tsx`, `src/hooks/useOrders.ts`, `src/hooks/useAuthenticatedOrderReorder.ts`, `src/hooks/useCheckout.ts`, `src/actions/checkout.ts`, and `src/services/orders.service.ts` to confirm that the accepted lifecycle, reorder, and checkout boundaries remained intact.
**Problem Identified:**
The storefront already had authenticated persisted orders, bounded payment continuation, lifecycle coherence, and authenticated reorder hardening, but `/orders` still behaved more like a raw history list than a decision surface. Action sets remained too noisy or too generic per card: reorder still surfaced too broadly from the index, the “real action” reading was underpowered, and the index could lag behind the stronger lifecycle/actionability discipline already present in `OrderDetail.tsx`.
**Implementation / Audit Sequence:**
1. **Shared orders-index actionability landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOrdersIndexActionView(...)`, derived from persisted lifecycle/payment truth rather than ad hoc card-level heuristics.
2. **Orders index now consumes one shared actionability reading** - `src/pages/Orders.tsx` now uses that shared reading for action headline/detail, detail label, continue-payment visibility, and reorder visibility. This keeps the index grounded in persisted truth and makes each order card read more like a bounded next-step surface.
3. **Continuation and reorder stayed narrowly bounded** - Continue-payment remains limited to authenticated persisted truly payable Mercado Pago orders only. Reorder is now suppressed on the index for active payment or validation trajectories where immediate repeat-purchase would be noisy or misleading. This improves index/detail coherence, but does not claim perfect symmetry: `OrderDetail.tsx` still retains a broader secondary reorder affordance.
4. **Validation outcome** - Focused domain/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane is storefront-only and authenticated-orders-index only.
- Orders-index actionability is now centralized in shared domain logic through `getStorefrontOrdersIndexActionView(...)`.
- `Orders.tsx` now consumes that shared reading for action headline/detail, detail label, continue-payment visibility, and reorder visibility.
- Continue-payment remains bounded to authenticated persisted truly payable Mercado Pago orders only.
- Index/detail coherence is improved, but this log does not claim perfect action symmetry across both surfaces.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim a fully centralized domain bucket model for all orders-index summary counters.
- This log does not claim perfect index/detail action symmetry.
- Focused tests, `typecheck`, and `build` are recorded as focused validation only, not as live-browser proof.
- This log does not claim that auth/RLS ownership proof was re-run in-browser as part of this lane.
**What Did Not Change:**
- No guest order history or guest reorder expansion.
- No shipping, tracking, returns, or cancellations platform work.
- No admin/Cesarin work.
- No payment architecture redesign and no payment platform rewrite.
- No product-search work.
**Outcome:**
The Storefront Authenticated Orders Index & Actionability Hardening lane is now formally closed as accepted with minor truth adjustments. The authenticated orders index now behaves more clearly as a persisted-truth decision surface, while preserving accepted continuation boundaries and keeping reorder quieter on index cards that are still inside an active payment or validation trajectory.
---

### Storefront Payment State Convergence & Order Lifecycle Coherence - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, `src/pages/__tests__/PaymentFailure.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only, with supporting inspection of `src/hooks/useOrders.ts`, `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, and `supabase/functions/create-payment/index.ts` to confirm that the existing storefront continuation boundaries remained intact.
**Problem Identified:**
The storefront already had persisted authenticated orders, bounded Mercado Pago continuation, paid-only cart clear/confetti protections, and bounded refresh behavior. The remaining gap was lifecycle interpretation drift: payment-return pages and order detail still derived parts of their messaging, refresh labels, or CTA behavior from page-local route context instead of one shared persisted-truth interpretation, leaving room for the same order to read differently depending on the surface.
**Implementation / Audit Sequence:**
1. **Shared lifecycle interpretation landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOrderLifecycleView(...)`, which centralizes storefront payment/order lifecycle interpretation from persisted truth only. The shared view composes the already accepted payment, continuation, and visibility truth into one storefront lifecycle object with status eyebrow, continuity note, order CTA label, refresh label, and bounded refresh flags.
2. **Main storefront lifecycle surfaces were aligned** - `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` now consume that same persisted-truth-first lifecycle view instead of each reinterpreting lifecycle state locally. This keeps order detail and payment-return pages aligned on payable, pending, paid, and non-payable messaging/CTA behavior.
3. **Accepted continuation and safeguard boundaries stayed intact** - Mercado Pago continuation remains limited to authenticated persisted payable orders only, `PaymentSuccess.tsx` still does not infer paid state from route semantics, cart clear remains paid-only, confetti remains paid-only, and the accepted bounded recheck/manual refresh model remains preserved.
4. **Validation outcome** - Focused domain/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- This lane is storefront-only and applies to authenticated persisted-order lifecycle rendering only.
- Lifecycle interpretation is now shared in domain logic and derived from persisted truth rather than route-local semantics.
- Payment return pages and order detail now converge on the same persisted-truth-first interpretation and CTA discipline.
- Continuation remains bounded to authenticated persisted payable Mercado Pago orders only.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not describe a payment architecture redesign.
- This log does not describe a payment recovery platform or generalized order-management capability.
- Focused tests, `typecheck`, and `build` are recorded as focused validation only, not as exhaustive live-browser proof.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No shipping, stock reservation, tracking, or returns platform work.
- No payment platform rewrite or webhook redesign.
- No admin/Cesarin scope and no product-search work.
**Outcome:**
The Storefront Payment State Convergence & Order Lifecycle Coherence lane is now formally closed as accepted with minor truth adjustments. Storefront payment-return pages and order detail now resolve one coherent lifecycle interpretation from persisted order/payment truth while preserving the previously accepted continuation and paid-only safety boundaries.
---

### Storefront Auth Session Persistence & Bootstrap Failure - 25 de marzo de 2026
**Scope:** `src/contexts/AuthContext.tsx` and `src/contexts/__tests__/AuthContext.test.tsx` only, with inspection of `src/main.tsx`, `src/hooks/useAuth.ts`, `src/components/auth/ProtectedRoute.tsx`, `src/components/admin/AdminGuard.tsx`, and `src/services/auth.service.ts` to confirm the existing storefront auth/bootstrap path.
**Problem Identified:**
The real storefront auth blocker was not checkout, not guest flow, and not a second auth architecture. The visible symptom was a successful login UI flow followed by an app shell that still behaved as if the session were null after refresh or route change. The verified structural root cause was inside `src/contexts/AuthContext.tsx`: the mounted-ref lifecycle could suppress legitimate auth updates under `React.StrictMode`, causing `getSession()`, `onAuthStateChange(...)`, or immediate sign-in hydration to bail as if the provider were already unmounted.
**Implementation / Audit Sequence:**
1. **StrictMode bootstrap guard was corrected** - `src/contexts/AuthContext.tsx` now restores `isMountedRef.current = true` on effect setup before cleanup registration, instead of allowing the StrictMode cleanup cycle to leave the provider permanently flagged as unmounted.
2. **Existing auth architecture stayed intact** - `AuthContext` remains the storefront auth source of truth, `isAuthenticated` still derives from `!!user`, and bootstrap still uses `supabase.auth.getSession()` plus `supabase.auth.onAuthStateChange(...)`. No auth redesign, no server auth policy change, and no checkout/admin scope expansion were introduced.
3. **Focused verification landed around the proven root cause** - `src/contexts/__tests__/AuthContext.test.tsx` now proves StrictMode session restore and immediate sign-in hydration against the real provider path.
4. **Validation outcome** - Focused StrictMode tests passed, `typecheck` passed, and `build` passed. Guest browser smoke verified clean redirects for protected storefront/admin routes when unauthenticated. Automated authenticated browser verification was not available in this pass because no safe local credentials were discoverable. Product-owner manual verification reported that the visible storefront login/session failure symptom appears resolved in real use. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane remains storefront-auth/bootstrap only.
- The verified defect was a mounted-ref lifecycle bug under `React.StrictMode`, not a new checkout issue and not a separate admin feature lane.
- The fix preserves the existing Supabase session/bootstrap model rather than inventing a new auth system.
- Guest route behavior remains explicit and correct through the existing protected-route and admin-guard surfaces.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim fully automated authenticated runtime proof.
- This log does not claim installed PWA parity for this lane.
- Manual product-owner verification is recorded as manual verification, not as automated browser proof.
**What Did Not Change:**
- No auth architecture redesign.
- No checkout or payment lane reopening.
- No guest expansion.
- No admin/Cesarin feature expansion.
- No server-side auth policy loosening.
**Outcome:**
The Storefront Auth Session Persistence & Bootstrap Failure lane is now formally closed as accepted with minor truth adjustments. The structural StrictMode bootstrap defect in `AuthContext` has been corrected, the storefront auth source of truth remains unchanged, and canon records the distinction between focused structural validation, guest route smoke, and the absence of automated authenticated runtime proof in this pass.
---

### Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening - 25 de marzo de 2026
**Scope:** `supabase/functions/checkout-submit/index.ts`, `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `src/actions/__tests__/checkout.test.ts`, and `src/hooks/__tests__/useCheckout.test.tsx` only.
**Problem Identified:**
Authenticated storefront checkout still relied on client-side `sending` guards for duplicate resistance, but the real order-creation path in `checkout-submit` still inserted a fresh persisted pending order on each repeated authenticated retry. That left duplicate-submit risk on refresh, re-entry, or rapid repeat attempts even when a truthful equivalent pending order already existed.
**Implementation / Audit Sequence:**
1. **Bounded pending-order reuse landed server-side** - `supabase/functions/checkout-submit/index.ts` now resolves shipping identity first and checks for an equivalent authenticated pending order before inserting a new one.
2. **Matching stayed storefront-bounded and conservative** - Reuse now applies only when the same authenticated customer already has an order in the same `pending` / `pending` state with the same payment method, the same delivery type, the same normalized customer identity fields used by the implementation, the same normalized item signature, the same normalized shipping signature, and the same normalized coupon code.
3. **Checkout action contract was extended without redefining payment continuation** - `src/actions/checkout.ts` now exposes `reusedPendingOrder` while preserving the accepted continuation contract `not_requested | ready | unavailable`.
4. **Client flow now routes reused orders toward persisted truth instead of treating them as new** - `src/hooks/useCheckout.ts` now sends reused authenticated non-Mercado Pago orders to `/orders/:orderId` instead of the new-order / WhatsApp success path. Reused Mercado Pago orders stay inside the existing bounded continuation model: `ready` still continues to Mercado Pago, and a persisted `orderId` without ready continuation routes to `/orders/:orderId`.
5. **Verification outcome** - Focused tests were added or updated for reused pending non-Mercado Pago contract handling, reused pending Mercado Pago staying on the accepted continuation path, authenticated duplicate non-Mercado Pago redirect behavior, and guest-path non-regression. `typecheck` and `build` both passed. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane remains storefront-only and authenticated-only.
- Authenticated duplicate-submission hardening now prefers reuse of an equivalent persisted pending order instead of silently creating a parallel one.
- `reusedPendingOrder` is now part of the storefront checkout action contract, but payment continuation remains bounded to the previously accepted `not_requested`, `ready`, and `unavailable` states.
- Guest checkout remains WhatsApp handoff only with no guest persisted order/payment flow and no guest reorder.
**Residual Truth Adjustments / Wording Guardrails:**
- This is not strong locking-based idempotency or transactional uniqueness enforcement.
- This is not a broad payment recovery system or an order-management platform.
- Coupon-backed duplicate retry reuse is structurally supported by the matching logic, but this log does not claim a dedicated direct test for that specific branch.
- Reused Mercado Pago `unavailable` routing is supported by the hook logic, but this log does not claim a dedicated direct hook test for that exact branch.
**What Did Not Change:**
- `create-payment` still requires session, ownership, and valid payable state.
- Payment pages and order detail still derive from persisted truth.
- `PaymentSuccess.tsx` still must not infer paid from route semantics.
- Cart clear remains paid-only and confetti remains paid-only.
- No guest persisted checkout or guest payment continuation.
- No shipping engine, no stock reservation, no tracking/returns platform, and no advanced checkout capability.
- No auth redesign, no admin/Cesarin drift, and no storefront drafting/search work.
**Outcome:**
The Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening lane is now formally closed as accepted with minor truth adjustments. Authenticated storefront checkout now reuses an equivalent persisted pending order when the current checkout intent matches that existing pending object, while leaving guest flow, payment continuation boundaries, and the persisted-truth storefront model intact.
---

### Storefront Authenticated Reorder & Catalog Drift Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/hooks/useAuthenticatedOrderReorder.ts`, `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/hooks/__tests__/useAuthenticatedOrderReorder.test.tsx`, `src/pages/__tests__/Orders.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only.
**Problem Identified:**
Authenticated storefront reorder still reconstructed fake historical `Product` objects from persisted order data instead of rehydrating against the current catalog. That bypassed real catalog truth, could resurrect inactive or missing items, and overstated how faithfully an older order could be rebuilt.
**Implementation / Audit Sequence:**
1. **Shared reorder truth landed** - `src/lib/domain/orders.ts` now provides bounded storefront reorder planning against persisted `order_items`, current catalog truth, current stock, current cart occupancy, and conservative variant remapping rules.
2. **Authenticated reorder path was centralized** - `src/hooks/useAuthenticatedOrderReorder.ts` now loads current products with `getProductsByIds(...)`, derives a reorder plan from persisted order items, adds only safe items through the normal cart `addItem(...)` path, and emits honest storefront feedback for full, partial, blocked, or manual-review outcomes.
3. **Fake historical product reconstruction was removed from storefront surfaces** - `src/pages/OrderDetail.tsx` no longer fabricates `Product` objects locally to re-add old items. Both `src/pages/OrderDetail.tsx` and `src/pages/Orders.tsx` now reuse the same authenticated reorder hook and current-catalog-first rules.
4. **Catalog drift stays explicit and bounded** - Reorder now supports mixed outcomes truthfully: full add, partial add, blocked/unavailable items, and manual-review cases when a prior variant no longer maps cleanly. Variant handling remains conservative and non-guessing.
5. **Verification outcome** - Focused tests were added or updated for domain reorder truth, authenticated reorder happy path, partial reorder, missing/unavailable item behavior, and guest-surface non-drift on the orders list. `typecheck` and `build` both passed. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Reorder now derives from persisted `order_items` and current catalog truth instead of UI assumptions or fabricated product objects.
- Only safe items are added through the normal storefront cart path.
- Current catalog/cart pricing remains authoritative; no historical pricing is resurrected.
- Reorder stays bounded to authenticated persisted storefront orders only.
- Payment continuation remains separate and untouched.
**What Did Not Change:**
- No guest reorder and no guest persisted order/payment flow.
- No automatic order recreation and no automatic payment creation.
- No shipping engine, no stock reservation, no tracking or returns platform, and no advanced checkout capability.
- No auth redesign, no backend payment redesign, no admin/Cesarin drift, and no storefront drafting/search work.
**Outcome:**
The Storefront Authenticated Reorder & Catalog Drift Hardening pass is now formally closed as accepted. Authenticated reorder now reconstructs prior purchase intent from persisted `order_items` against the current catalog safely, supports partial/degraded outcomes honestly, and stays inside the existing storefront cart/order/payment truth boundaries.
---

### Checkout. Storefront Checkout Recovery & Completion Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/__tests__/OrderDetail.test.tsx`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, and `src/pages/__tests__/PaymentFailure.test.tsx` only.
**Problem Identified:**
The accepted checkout/payment baseline already persisted real authenticated orders, normalized post-payment storefront truth, protected paid-only side effects, and exposed bounded recheck plus direct continuation from order detail. The remaining gap was broader storefront continuity: payable versus non-payable Mercado Pago states were still not expressed through one shared continuation model across the main persisted-order and post-payment surfaces.
**Implementation / Audit Sequence:**
1. **Shared continuation-truth helper landed** - `src/lib/domain/orders.ts` now provides `getStorefrontPaymentContinuationView(...)` as a bounded storefront helper over persisted `payment_method`, normalized `payment_status`, and `status`.
2. **Storefront payment surfaces aligned** - `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now read the same persisted-truth-first continuation model instead of diverging on payable versus non-payable messaging.
3. **Direct continuation stayed bounded** - Direct Mercado Pago continuation now appears only when persisted truth says the order is still payable: `payment_method === 'mercadopago'`, normalized payment status is `pending`, and the order is not cancelled. Non-payable states now use clearer continuity messaging instead of fake retry semantics.
4. **Accepted protections preserved** - `PaymentSuccess.tsx` still does not infer paid state from route semantics, cart clear remains paid-only, confetti remains paid-only, and the previously accepted bounded refresh/manual refresh patterns remain in place.
5. **Verification outcome** - Focused domain and storefront tests were added or updated around continuity truth, order-detail continuation, payment-success continuation vs paid behavior, payment-pending continuation, and payment-failure continuation vs non-payable hidden continuation. Acceptance audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Storefront checkout/payment continuity now uses one shared persisted-truth-first continuation model across order detail and the main post-payment surfaces.
- Direct continuation is exposed only for authenticated persisted Mercado Pago orders that are still truly payable.
- Non-payable states remain storefront-visible and clearer, but do not invent broader retry or recovery capabilities.
- Existing accepted checkout/payment truth protections remain the baseline.
**Residual Risk:**
- The continuation error-notification path is still not deeply asserted across all four storefront surfaces.
**What Did Not Change:**
- No guest persisted order/payment flow.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No backend payment redesign and no webhook redesign.
- No admin, Cesarin, storefront drafting, or product-search scope drift.
- No broader payment recovery system or order-management expansion was introduced.
**Outcome:**
The Storefront Checkout Recovery & Completion Hardening pass is now formally closed as accepted with minor residual risk. Storefront checkout/payment continuity is materially tighter around persisted truth and bounded continuation without widening scope beyond the accepted authenticated storefront checkout/payment surface.
---

### Checkout. Order Detail Payment Continuation CTA - 25 de marzo de 2026
**Scope:** `src/pages/OrderDetail.tsx` and `src/pages/__tests__/OrderDetail.test.tsx` only. Existing continuation primitives were reused through `src/services/payments/mercadopago.service.ts` and `supabase/functions/create-payment/index.ts`; no backend payment architecture or checkout contract files were changed for this pass.
**Problem Identified:**
The accepted checkout/payment continuity baseline already told authenticated customers that a persisted order could be resumed from order detail, but the storefront still lacked a real continuation CTA on that persisted order surface. The remaining gap was not payment architecture or messaging normalization; it was the absence of a truthful continue-payment action for existing payable Mercado Pago orders.
**Implementation / Audit Sequence:**
1. **Bounded storefront continuation CTA landed** - `src/pages/OrderDetail.tsx` now exposes the real CTA `Continuar pago en Mercado Pago` for authenticated persisted orders only when persisted truth supports it.
2. **Persisted-truth gating stayed explicit** - The CTA appears only when `payment_method === 'mercadopago'`, `payment_status === 'pending'`, and `status !== 'cancelled'`. This preserves the accepted rule that route semantics do not imply paid state or payable state by themselves.
3. **Existing continuation infrastructure was reused, not redesigned** - The CTA continues payment through the already accepted storefront payment path via `src/services/payments/mercadopago.service.ts` and the existing `supabase/functions/create-payment/index.ts` payable-order contract.
4. **Verification outcome** - The pass was accepted with **ACCEPT WITH MINOR RESIDUAL RISK**. Residual risk remained test-shaped only: there is still no direct test proving that a cancelled Mercado Pago order hides the CTA, and no direct test for the continuation-failure toast path.
**Accepted Final Discipline:**
- `OrderDetail.tsx` now exposes a real bounded Mercado Pago continuation CTA for authenticated persisted payable orders.
- Continuation remains gated by persisted truth, not by route semantics.
- The accepted persisted-order/payment-truth baseline remains the source of authority.
- Guest checkout remains outside persisted order/payment continuation.
**Residual Risk:**
- No direct test yet proves that cancelled Mercado Pago orders hide the CTA.
- No direct test yet covers the continuation-failure toast path.
**What Did Not Change:**
- No guest persisted order/payment flow.
- No backend payment redesign and no webhook redesign.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No auth change, no storefront drafting/search change, and no admin or Cesarin OS scope drift.
**Outcome:**
The Order Detail payment continuation CTA pass is now formally closed as accepted with minor residual risk. Storefront checkout now exposes a real, bounded Mercado Pago continuation action from the persisted order detail surface without inventing new payment capability or widening scope beyond the accepted storefront checkout/payment continuity surface.
---

### Checkout. Payment UX Mini-Block (Patch Pair 2 of 2) - 25 de marzo de 2026
**Scope:** `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, and `src/pages/__tests__/PaymentSuccess.test.tsx` (tests inspected and updated only where materially relevant). Support inspection remained limited to `src/hooks/useOrders.ts` and `src/lib/domain/orders.ts`.
**Problem Identified:**
The accepted payment-truth model, post-payment normalization, cart-clear guard, and patch pair 1 already made storefront checkout/payment behavior structurally honest. The remaining gap was continuity and CTA clarity across the existing payment/result/order surfaces: the UI still varied too much in how it expressed order existence versus payment confirmation, and some next-step actions were too vague about where the customer should continue from persisted truth.
**Implementation / Audit Sequence:**
1. **Bounded storefront UX continuity patch landed** - Patch Pair 2 stayed inside the existing storefront checkout/payment surfaces only. No backend, auth, webhook, guest, shipping, stock, or advanced-checkout architecture was touched.
2. **Cross-surface truth semantics tightened** - `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now separate order existence from payment confirmation more explicitly and use clearer truthful CTAs pointing back to the persisted order state. `src/pages/OrderDetail.tsx` now labels the payment section as `Estado de pago` and adds a compact `Siguiente paso real` block derived from persisted truth.
3. **Accepted protections preserved** - Bounded recheck/manual refresh from patch pair 1 remained intact. No fake paid inference from route semantics was introduced. No premature cart-clear regression was introduced. No backend/auth/guest/shipping/stock/advanced-checkout/admin/drafting drift occurred.
4. **Verification outcome** - `npm run -s test -- src/pages/__tests__/PaymentSuccess.test.tsx` passed, `npm run -s typecheck` passed, and `npm run -s build` passed. Acceptance audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Storefront checkout/payment surfaces now speak with more consistent truth semantics after return or re-entry.
- Order existence is no longer blurred with payment completion as much as before.
- Next-step CTAs now more clearly direct the customer toward the persisted order state and the real next action.
- The accepted persisted-truth model and bounded refresh behavior from prior checkout/payment passes remain the baseline.
**Residual Risk:**
- Residual risk is coverage-only, not product-drift.
- There are still no direct tests for the new `PaymentPending.tsx` copy/CTA branches.
- There are still no direct tests for the new `PaymentFailure.tsx` copy/CTA branches.
- There are still no direct tests for `OrderDetail.tsx` `Siguiente paso real`.
**What Did Not Change:**
- No payment backend redesign.
- No webhook redesign.
- No auth change.
- No guest persisted payment flow.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No storefront drafting/search work, and no admin or Cesarin OS scope drift.
**Outcome:**
The Payment UX Mini-Block (Patch Pair 2 of 2) is now formally closed as accepted with minor residual risk. Storefront checkout/payment surfaces now provide clearer continuity and next-step guidance from persisted truth without changing backend architecture, inventing paid state, or widening scope beyond the accepted storefront checkout/payment UX surface.
---

### Storefront Auth Convergence + Hardening - 25 de marzo de 2026
**Scope:** `src/contexts/AuthContext.tsx` only.
**Problem Identified:**
Storefront login could succeed against real Supabase auth while the app shell still behaved as if the customer were logged out. The real gap was not fake login success or a broken Supabase client; it was post-login convergence timing inside the storefront auth provider. `LoginForm.tsx` awaited `signIn()` and then resumed UI success/navigate behavior immediately, while `user` still depended on later `getSession()` or `onAuthStateChange(...)` updates. That left a post-login window where guest UI and guest redirects could still win before auth state converged.
**Implementation / Audit Sequence:**
1. **Convergence fix landed** - Commit `968cfcb` tightened `src/contexts/AuthContext.tsx` only. `handleSignIn` now reads the resolved Supabase sign-in result directly and hydrates `user` immediately from `authData.user ?? authData.session?.user ?? null` before returning control to the caller.
2. **Immediate post-login state alignment restored** - `handleSignIn` now also clears `loading` immediately after successful sign-in state is set, so `isAuthenticated` can converge from the same provider instance before post-login navigation resumes. `isAuthenticated` still derives from `!!user`; no fake success path was added.
3. **Critical-path latency reduced without redesign** - `loadProfile(currentUser.id)` still runs, but it no longer blocks login completion. Long-lived auth consistency remains with the provider bootstrap through `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange(...)`, and `React.StrictMode` remains in place.
4. **Verification outcome** - `npm run -s typecheck` passed. Cold acceptance verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Login still depends on real Supabase auth and the real returned sign-in payload.
- `user` now converges before the post-login navigation callback resumes.
- Profile hydration no longer blocks immediate login completion.
- The accepted scope remained limited to `src/contexts/AuthContext.tsx`; `auth.service.ts`, `LoginForm.tsx`, `Login.tsx`, `ProtectedRoute.tsx`, header/menu components, and the Supabase client were not changed for this pass.
**Residual Risk:**
- Residual risk is minor and latency-shaped, not a convergence failure.
- `loadProfile(...)` is intentionally asynchronous relative to login completion, so profile-specific UI may briefly trail raw auth convergence.
- Some duplicate profile fetch work may still occur across immediate sign-in and later bootstrap/listener flows.
**What Did Not Change:**
- No auth architecture redesign.
- No checkout or payment expansion.
- No guest-flow expansion.
- No shipping, stock reservation, admin, or Cesarin OS scope drift.
**Outcome:**
The Storefront Auth Convergence + Hardening pass is now formally closed as accepted with minor residual risk. Storefront login now converges on real authenticated UI state before post-login navigation resumes, while keeping long-lived session synchronization on the existing provider bootstrap and auth-listener path. Commit: `968cfcb`.
---

### Checkout. Payment UX Mini-Block (Patch Pair 1 of 2) - 25 de marzo de 2026
**Scope:** `src/hooks/useOrders.ts`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, and `src/pages/__tests__/PaymentSuccess.test.tsx`.
**Problem Identified:**
The accepted post-payment normalization and cart-clear guard passes had already made storefront payment messaging truthful, but the next UX gap remained in convergence speed after Mercado Pago return. Persisted order truth could still lag webhook settlement for a short window, and the storefront offered no explicit recheck action on the main non-confirmed payment surfaces.
**Implementation / Audit Sequence:**
1. **Mini-block landed** - Commit `6de61069c6d55d0ba42b9ed226eb92464d4d05b6` added a bounded post-return payment-status recheck on the existing persisted order read path through `useBoundedOrderStatusRefresh(...)` in `src/hooks/useOrders.ts`. This did not introduce a new payment source or redefine `src/lib/domain/orders.ts`; the accepted truth mapper remained the baseline.
2. **Return-surface refresh behavior tightened** - `src/pages/PaymentSuccess.tsx` now uses bounded recheck only while persisted truth is unresolved or pending and adds a manual `Revisar estado de pago` action when the order is not yet paid. `src/pages/PaymentPending.tsx` adds the same bounded recheck plus the same manual refresh. `src/pages/PaymentFailure.tsx` adds manual persisted-status refresh only. `src/pages/OrderDetail.tsx` adds `Revisar estado de pago` only for unpaid `mercadopago` orders.
3. **Truthfulness boundaries preserved** - Persisted order/payment truth remains authoritative; no paid-state invention was introduced; no premature cart clear was reintroduced; guest checkout remains outside persisted payment flow; and no shipping, stock reservation, advanced checkout, admin, or Cesarin OS scope drift occurred.
4. **Verification outcome** - `npm run test:run -- src/pages/__tests__/PaymentSuccess.test.tsx src/lib/domain/__tests__/orders.test.ts` passed `26/26`, `npm run typecheck` passed, and `npm run build` passed. Cold audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Payment return surfaces now converge faster toward persisted order/payment truth after Mercado Pago return through a short bounded recheck, not through invented payment completion.
- Customers now have a manual persisted-status refresh action on the relevant non-confirmed surfaces.
- `src/lib/domain/orders.ts` remains the truth-mapper baseline and was not redefined by this patch pair.
- Paid-only behaviors remain intact, including the previously accepted cart-clear guard and paid-only celebratory behavior on `PaymentSuccess.tsx`.
**Residual Risk:**
- Page-level automated coverage remains thinner on `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` than on `src/pages/PaymentSuccess.tsx`.
- The bounded recheck window is intentionally short; if persistence settles later, the storefront remains truthful, but the customer may still need the manual recheck action to see the updated persisted state.
**What Did Not Change:**
- No payment completion guarantee was added.
- No webhook redesign, no guest persisted payment flow, no shipping engine, no stock reservation, and no advanced checkout capability were introduced.
- No admin or Cesarin OS scope drift occurred.
- No prior checkout lanes or storefront drafting work were reopened.
**Outcome:**
The Payment UX mini-block (patch pair 1 of 2) is now formally closed as accepted with minor residual risk. Storefront payment-return surfaces now offer a bounded post-return recheck and a manual persisted-status refresh path without inventing paid state or expanding scope beyond the accepted checkout/payment UX surface. Commit: `6de61069c6d55d0ba42b9ed226eb92464d4d05b6`.
---

### Checkout. Payment Success Cart-Clear Guard Patch - 25 de marzo de 2026
**Scope:** `src/pages/PaymentSuccess.tsx` and `src/pages/__tests__/PaymentSuccess.test.tsx`.
**Problem Identified:**
The accepted post-payment normalization pass had already corrected storefront messaging, but one residual watchpoint remained: `PaymentSuccess.tsx` still cleared the cart on first render even when persisted order truth did not yet support a paid outcome. The remaining need was a narrow guard patch, not a new checkout lane.
**Implementation / Audit Sequence:**
1. **Guard patch landed** - Commit `a2b3194` tightened the cart-clear effect in `src/pages/PaymentSuccess.tsx`. The page previously cleared the cart unconditionally on route entry; the accepted patch now gates that side effect on persisted paid truth only.
2. **Paid-only clear discipline restored** - Cart clear now occurs only when the loaded persisted order view resolves to `paymentStatus === 'paid'` through the existing order-loading and order-view path already used in storefront checkout. `processed.current` continues to prevent repeated clears once a paid order has triggered the effect.
3. **Verification outcome** - `npm run -s test -- src/pages/__tests__/PaymentSuccess.test.tsx` passed, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- `PaymentSuccess.tsx` no longer clears the cart merely because the customer landed on the success route.
- Cart clearing is now bounded to persisted paid truth only.
- Accepted post-payment messaging behavior remains intact.
- Confetti remains paid-only.
**What Did Not Change:**
- No payment completion semantics changed beyond the cart-clear guard itself.
- No guest checkout inflation, no shipping engine, no stock reservation, and no admin or Cesarin OS scope drift were introduced.
- No new checkout lane was created, and the broader post-payment normalization pass was not reopened.
**Outcome:**
The Payment Success cart-clear guard patch is now formally closed as accepted. Storefront checkout no longer clears the cart prematurely from the payment success route, and the side effect now occurs only when persisted paid truth actually supports it. Commit: `a2b3194`.
---

### Checkout. Post-Payment Order Status Normalization Pass - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx`.
**Problem Identified:**
The authenticated checkout bridge and payment-continuation path were already accepted, but the next storefront checkout truth gap remained in post-payment visibility. Order-detail and payment-return surfaces still derived too much meaning from route semantics and generic UI wording, which could imply successful payment or forward progress before the persisted order state actually confirmed it.
**Implementation / Audit Sequence:**
1. **Post-payment normalization pass landed** - Commit `122cd611bc3410f6f41508ee94797e611024c33e` added a bounded storefront normalization layer in `src/lib/domain/orders.ts` through `normalizePaymentStatus()` and `getStorefrontOrderPaymentView()`, so post-payment messaging now derives from persisted `payment_status`, `payment_method`, and `status` instead of route semantics alone.
2. **Order detail surface aligned to persisted truth** - `src/pages/OrderDetail.tsx` now distinguishes meaningful storefront payment states including `paid`, `pending`, `failed`, and `refunded`, and uses the normalized view for banner and payment-status copy instead of flattening non-paid cases into generic in-progress messaging.
3. **Payment return surfaces normalized** - `src/pages/PaymentSuccess.tsx` no longer makes fake success claims unless persisted payment truth is actually `paid`; `src/pages/PaymentPending.tsx` and `src/pages/PaymentFailure.tsx` now load the order and align copy to persisted truth when order data is available.
4. **Verification outcome** - `npm run -s test -- src/lib/domain/__tests__/orders.test.ts` passed, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Storefront post-payment messaging now derives from persisted order truth, not route semantics alone.
- The normalization layer is bounded to storefront `payment_status`, `payment_method`, and `status`.
- `PaymentSuccess.tsx` no longer implies payment completion unless persisted truth is actually `paid`.
- `PaymentPending.tsx` and `PaymentFailure.tsx` now behave as truthful re-entry/status surfaces when `order_id` is available.
**Non-Blocking Residual Watchpoint:**
- Page-level tests remain thinner than mapper coverage, and `PaymentSuccess.tsx` still clears the cart on first render even when persisted truth is not `paid`; messaging is now honest, but that side effect remains route-triggered.
**What Did Not Change:**
- No payment completion was invented.
- No advanced checkout capability, no shipping engine, and no stock reservation or inventory hold semantics were introduced.
- No guest checkout inflation occurred.
- No admin or Cesarin OS scope drift occurred.
- No prior storefront drafting lanes S93-S102 or prior checkout foundation/payment-continuation lanes were reopened.
**Outcome:**
The post-payment order status normalization pass is now formally closed as accepted. Storefront order-detail and payment-return surfaces now reflect persisted post-payment truth more consistently, without claiming completed payment when the order still shows `pending` or `failed`, and without expanding scope into advanced checkout, shipping, stock reservation, guest persistence, or admin/Cesarin OS work. Commit: `122cd611bc3410f6f41508ee94797e611024c33e`.
---

### Checkout. Authenticated Payment Continuation Pass - 25 de marzo de 2026
**Scope:** `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `supabase/functions/create-payment/index.ts`, `src/actions/__tests__/checkout.test.ts`, and `src/lib/domain/validations/__tests__/checkout.schema.test.ts`.
**Problem Identified:**
The Secure Submission Bridge MVP already persisted authenticated orders truthfully, but the next real bottleneck remained payment continuation into the pre-existing Mercado Pago surface. The active authenticated path still depended on a fragmented client-side payment initiation step, did not expose a bounded continuation contract after persistence, and left `create-payment` too loose on session and ownership enforcement for a persisted order handoff.
**Implementation / Audit Sequence:**
1. **Authenticated payment-continuation pass landed** - Commit `4d525d19c63dfc373296ba4f4bdc2c72db3b73df` kept the accepted secure submission bridge intact and added the next bounded layer only: `src/actions/checkout.ts` now returns a continuation contract (`not_requested`, `ready`, `unavailable`), requests Mercado Pago continuation only after `checkout-submit` succeeds with a real `orderId`, and returns an honest persisted-order-but-payment-unavailable state when preference creation cannot be started.
2. **Hook path aligned to the accepted continuation contract** - `src/hooks/useCheckout.ts` now consumes the continuation result from `submitCheckout`; the old fragmented direct client-side payment initiation flow is no longer the active authenticated checkout path. Authenticated Mercado Pago orders now either redirect on `ready`, or surface a bounded error and move to the persisted order detail when continuation is unavailable. Guest checkout remains the existing honest WhatsApp-only handoff.
3. **Payment edge hardening completed** - `supabase/functions/create-payment/index.ts` now enforces bearer-token auth, resolves the user via `supabase.auth.getUser()`, scopes order lookup to `customer_id = user.id`, rejects non-Mercado Pago orders, rejects non-payable states, rejects empty order items, and maps the payer fields from the current persisted snake_case order columns `customer_name` and `customer_phone`.
4. **Verification outcome** - Targeted tests passed `8/8`, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Authenticated checkout now persists the real order first and then continues into Mercado Pago through a bounded, truthful continuation contract.
- `src/actions/checkout.ts` is now the active continuation boundary for authenticated checkout: `not_requested`, `ready`, and `unavailable` are explicit outcome states.
- Payment continuation is requested only after `checkout-submit` succeeds and yields a real persisted `orderId`.
- Persisted-order-but-payment-unavailable cases remain truthful: the order exists, but payment is not claimed as initiated or completed.
- Guest checkout remains an honest WhatsApp handoff and is not converted into persisted payment checkout.
**What Did Not Change:**
- No payment completion claim was introduced; this pass continues into the pre-existing Mercado Pago surface only.
- No advanced checkout flow, no shipping engine, and no stock reservation or inventory lock semantics were introduced.
- No admin or Cesarin OS scope drift occurred.
- No storefront drafting lanes S93-S102 were reopened.
**Outcome:**
The authenticated payment continuation pass is now formally closed as accepted. Persisted authenticated orders can continue into the existing Mercado Pago surface through a bounded, session-verified path; `ready` versus `unavailable` is explicit and truthful, guest checkout remains non-persisted WhatsApp handoff, and no advanced checkout, payment completion, shipping, or stock-reservation capability is implied. Commit: `4d525d19c63dfc373296ba4f4bdc2c72db3b73df`.
---

### Checkout Foundation. Secure Submission Bridge MVP - 25 de marzo de 2026
**Scope:** `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `src/components/cart/CheckoutForm.tsx`, `supabase/functions/checkout-submit/index.ts`, and `supabase/migrations/20260325_checkout_order_items.sql`.
**Problem Identified:**
Storefront checkout still depended on client-side order construction and did not have a narrow server-side bridge that could validate the authenticated user, reload authoritative product pricing from Supabase, persist a real order flow, and keep the guest WhatsApp path honest. The smallest truthful next step was a secure submission bridge, not payment flow, not advanced checkout, and not full stock reservation.
**Implementation / Audit Sequence:**
1. **Initial implementation landed** - Commit `2a8ceb2` added the Secure Submission Bridge MVP through `src/actions/checkout.ts` plus `supabase/functions/checkout-submit/index.ts`, wired the real checkout form into that path, added minimal `orders`/`order_items` persistence support, and moved authoritative pricing back to the server by loading current `products` and `product_variants` rows before calculating totals.
2. **Corrective micro-fix applied** - Commit `d1aeb03` tightened two honesty gaps before acceptance: guest checkout no longer presents WhatsApp-only completion as if a persisted order had been created, and coupon discounts are no longer accepted if coupon usage persistence cannot be recorded consistently.
3. **Final acceptance after repair verification** - Acceptance was finalized only after the subsequent mechanical parse/typecheck repair restored `src/hooks/useCheckout.ts` to valid TypeScript without changing the accepted behavior of the bridge.
**Accepted Final Discipline:**
- Authenticated checkout now persists one real `orders` row plus corresponding `order_items` rows through the storefront action bridge and the Supabase Edge Function.
- Pricing is server-authoritative: client-submitted prices are not trusted, and totals are recalculated from current DB product/variant data.
- Guest checkout remains an honest WhatsApp-only handoff and does not claim persisted order creation.
- Coupon application remains consistent: discounted acceptance requires coupon tracking persistence to succeed.
**What Did Not Change:**
- No payment gateway expansion beyond the pre-existing Mercado Pago surfaces.
- No advanced checkout flow, no shipping engine, and no checkout execution automation.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, and no invented infrastructure.
- No full stock reservation or inventory lock semantics were introduced.
**Outcome:**
The Secure Submission Bridge MVP is now formally closed as the accepted checkout foundation layer. Storefront checkout can persist authenticated orders through a real server-side bridge with authoritative pricing and explicit `order_items`, while guest fallback remains truthfully non-persisted and coupon tracking cannot silently drift out of sync. Commits: `2a8ceb2`, `d1aeb03`.
---

### S102. Storefront Checkout-Readiness-to-Cart-Precision Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S101, strong single-product readiness cases could stop at general readiness language even when the current product data already supported a more exact last-step selector. The lane objective was to make the handoff more precise about what should actually go into the cart, without inventing selectors, without collapsing compare paths, and without turning the lane into cart execution or checkout execution.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S102 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a bounded selector-backed cart-precision layer after checkout-readiness already existed, keep selectorless strong paths at S101 readiness, and leave weak or unresolved paths conservative.
2. **Cold audit outcome** - Final cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- S100 recovery-to-commitment discipline remains preserved.
- S101 checkout-readiness gating remains preserved.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, no backend lane, and no cart execution or checkout execution were introduced.
**Audit Watchpoint:**
- Tipo remains the broadest selector and should be watched for future over-precision drift, but this was non-blocking in the accepted lane.
**Outcome:**
S102 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds selector-backed cart precision only when a materially purchase-defining selector exists in the active product context. Single-path survival alone is not enough, selectorless strong paths stay at S101 readiness, weak-support fallback/semantic/OOS survivors remain conservative, and compare/multi-option paths remain non-precise. Commit: 383028e.
---
### S101. Storefront Commitment-to-Checkout-Readiness Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S100, storefront commitment-ready closes were stronger, but checkout-readiness gating was still too broad. The lane objective was to add a bounded checkout-readiness drafting layer only for explicitly support-backed cases, keep weak and multi-option paths conservative, and avoid inflating ordinary single-path survival into fake readiness.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S101 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a bounded checkout-readiness layer after commitment already existed, using only existing branch support and without turning the lane into checkout execution, payment flow, or conversational checkout.
2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but acceptance was blocked because checkout-readiness gating remained too broad before reconciliation.
3. **Corrective micro-fix applied** - Commit 995cf91dc7a6986e40890e1ef160007a4ef4f5e7 narrowed readiness gating in three bounded ways:
   - remove generic readiness fallback when no supported selector/spec exists
   - require explicit support for the readiness check itself, or an explicitly support-backed recovery state already established in the branch
   - preserve conservative behavior for weak-support and multi-option paths
4. **Final cold audit outcome** - Final cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- S100 recovery-to-commitment discipline remains preserved.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, no backend lane, and no checkout execution were introduced.
**Outcome:**
S101 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds a bounded commitment-to-checkout-readiness step only when the readiness check is explicitly support-backed. Single-path survival alone no longer creates generic readiness, ordinary selectorless single-product paths no longer emit generic checkout-readiness language, weak-support fallback/semantic/OOS survivors remain conservative, compare/multi-option paths remain non-readiness, and a narrower recovery-only fallback remains allowed only for explicitly support-backed recovery states. Commits: `903fc65`, `995cf91`.
---
### S100. Storefront Recovery-to-Commitment Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S99, storefront objection recovery was locally grounded and commercially useful, but strong-support recovery could still stop one step too early. The remaining lane objective was to harden the post-recovery close inside already narrowed branches so supported recovery could move into a more commitment-ready next step without reopening broad browsing, inflating certainty, or weakening conservative behavior when support stayed weak.
**Implementation / Validation Sequence:**
1. **Initial storefront-only implementation existed** - S100 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a post-recovery commitment layer after objection recovery, keep that layer inside already narrowed branches, and allow stronger supported recovery to close more naturally while weak-support recovery stayed conservative.
2. **Validation outcome** - S100 was validated and closed as implemented. No additional lane expansion was introduced during reconciliation.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.
**Outcome:**
S100 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds a post-recovery commitment layer inside already narrowed branches: stronger recovery cases can land on a more commitment-ready close, weak-support recovery remains conservative, and two-option recovery stays focused and non-browsing instead of reopening the tree. No orchestrator redesign, retrieval redesign, or broader lane closure is claimed. Commit: `2eb233f`.
---
### S99. Storefront Objection-to-Recovery Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S98, storefront handoff behavior was commercially sharper, but a remaining late-stage bottleneck persisted when the customer raised a mild or medium objection after the field was already narrowed. The lane objective was to improve objection recovery without losing commercial momentum: keep recovery local to the already narrowed branch, allow one narrowly justified nearby alternative when appropriate, and stay persuasive without inventing value claims, fake savings, or pressure tactics.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S99 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve late-stage objection recovery without losing commercial momentum, keep recovery local to the already narrowed branch, allow one narrowly justified nearby alternative when appropriate, and stay persuasive without inventing value claims, fake savings, or pressure tactics.
2. **Cold audit outcome** - Cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.
**Outcome:**
S99 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at recovering late-stage objections inside the already narrowed branch, cheaper now uses visible candidate-set price data honestly, worth_it remains grounded in supported signals, nearby alternatives stay narrow, and objection handoff stays at review/PDP level instead of drifting into pressure. S93/S94/S95/S96/S97/S98 boundaries were preserved without reopening retrieval or expanding scope. Commit: 12bedcc ('feat(storefront): harden objection-to-recovery drafting').
---
### S98. Storefront Confidence-to-Cart Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S97, storefront confidence language was sharper, but the remaining commercial bottleneck was the final transition from supported confidence into a concrete storefront next step. The lane objective was to improve that handoff honestly: distinguish review-only versus review-then-cart handoff by real branch support, keep weak-support cases conservative, and avoid pressure tactics or inflated purchase steering.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S98 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve the transition from supported confidence into a concrete storefront next step, distinguish review-only versus review-then-cart handoff honestly, keep weak-support cases conservative, and avoid pressure tactics or inflated purchase steering.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was blocked on one corrective micro-fix before formal closure.

3. **Corrective micro-fix applied** - Commit `4c7a46cd78e965987f4e11e1fc04b72b34906611` tightened fallback cart-promotion honesty in three bounded ways:
   - remove cart-adjacent promotion from single fallback OOS/semantic paths when mere singularity was the only support
   - require supported comparison or single surviving option plus explicit support (`specs` or `ai_sales_note`) before `review_then_cart`
   - preserve stronger exact/support-backed paths

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S98 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at turning supported confidence into a concrete next storefront action, with review-only versus review-then-cart handoff now matched more honestly to branch strength. Weak-support fallback cases remain conservative, while stronger exact/support-backed cases can progress naturally without inflated purchase steering. S93/S94/S95/S96/S97 boundaries were preserved without reopening retrieval or expanding scope. Commits: 8322b45 (`feat(storefront): harden confidence-to-cart handoff`), 4c7a46c (`fix(storefront): tighten single fallback cart gating`).

---

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

### Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening — 26 de marzo de 2026

**Why this lane was opened:**

Payment continuation from the storefront (orders index, order detail, payment-return pages, cart, and checkout surfaces) lacked a shared persisted-truth-first gate for deciding whether re-entry into a Mercado Pago preference was safe and appropriate. Each surface derived re-entry eligibility independently, creating a risk of stale or non-actionable payment continuation being surfaced and of duplicate payment attempts being initiated from uncoordinated surfaces.

**Implementation scope:**

- `src/lib/domain/orders.ts` — `getStorefrontPaymentReentryView(...)` added as the shared persisted-truth-first re-entry eligibility derivation for all storefront re-entry surfaces.
- `src/hooks/useStorefrontPaymentReentry.ts` — shared guarded continuation hook introduced, consuming `getStorefrontPaymentReentryView(...)`. Performs a fresh persisted recheck before opening Mercado Pago. Bounded patch applied in second pass: `continuingOrderId` is now explicitly cleared on all non-success exits after the fresh persisted recheck, preventing the UI from being left stuck in a continuing/loading state when continuation is blocked.
- `src/hooks/useOrders.ts` — shared order data consumption path remained intact; no structural changes to the persisted-order read path.
- `src/services/orders.service.ts` — supporting order fetch used by the fresh recheck; no new service contract introduced.
- `src/pages/Orders.tsx` — now consumes the shared re-entry hook for authenticated payable-order continuation from the orders index.
- `src/pages/OrderDetail.tsx` — now consumes the shared re-entry hook for in-detail continuation CTA.
- `src/pages/Checkout.tsx` — re-entry eligibility surfaces aligned to shared derivation.
- `src/pages/PaymentSuccess.tsx` — re-entry suppressed; surface remains bounded post-purchase only.
- `src/pages/PaymentPending.tsx` — re-entry eligibility now driven by shared persisted truth, not route semantics.
- `src/pages/PaymentFailure.tsx` — re-entry eligibility now driven by shared persisted truth, not route semantics.
- `src/components/cart/CheckoutForm.tsx` — re-entry derivation aligned to shared hook.
- `src/components/cart/CartSidebar.tsx` — re-entry derivation aligned to shared hook.
- `src/components/cart/OpenRecoverableOrderNotice.tsx` — re-entry derivation aligned to shared hook.
- `supabase/functions/create-payment/index.ts` — session enforcement, ownership validation, and payable-state enforcement preserved within bounded storefront re-entry hardening scope. No payment architecture redesign.
- Relevant tests: `src/hooks/__tests__/useStorefrontPaymentReentry.test.tsx` — focused regression tests added covering fresh-recheck blocking, `continuingOrderId` clearing on both non-success exit paths, and successful re-entry path.

**What was hardened:**

1. Persisted-truth-first payment re-entry eligibility derivation via shared domain logic, replacing per-surface ad hoc derivation.
2. Shared guarded continuation path across all authenticated storefront re-entry surfaces, so continuation only opens Mercado Pago after a fresh persisted recheck confirms the order remains genuinely payable.
3. Stale or non-actionable re-entry suppression: surfaces that previously could show continuation for already-paid or non-payable orders are now gated by the same shared eligibility gate.
4. Duplicate payment-attempt hardening: the shared hook guards against concurrent continuation attempts for the same order ID via the `continuingOrderId` state guard.
5. **Bounded patch (second pass):** `continuingOrderId` is now cleared on both non-success exits after the fresh persisted recheck — when the fresh order is not found, and when the fresh persisted truth no longer permits re-entry. This closes the previously rejected stuck-UI defect.
6. Preservation of all accepted checkout/payment invariants: unchanged `submitCheckout` contract, unchanged `useCheckout` duplicate-checkout prevention lane, no guest persisted expansion, no paid inference from route semantics, paid-only cart clear preserved, paid-only confetti preserved, no order-management expansion, no payment architecture rewrite.

**Audit and validation history:**

- Initial cold acceptance audit: **REJECT** — `continuingOrderId` was set before the fresh persisted recheck, and certain non-success exits after the recheck returned without clearing it, leaving the UI stuck in a loading state (e.g., "Abriendo Mercado Pago...") even when continuation was blocked.
- Bounded patch applied: `continuingOrderId` clearing added to both non-success exit paths after the fresh persisted recheck.
- Re-verify: **ACCEPT** — relevant storefront suite `28/28` passed, focused hook tests passed, `typecheck` passed, `build` passed.

**Explicit non-claims:**

- No guest persisted payment or order flow introduced or claimed.
- No order-management platform expansion (no cancellations, returns, tracking, invoicing, or support-platform work).
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment architecture rewrite claimed.
- No live-browser proof claimed; validation was focused automated tests, typecheck, and build.
- No direct server-side branch proof beyond the accepted audit scope: `supabase/functions/create-payment/index.ts` was reviewed for boundary preservation, not independently E2E re-tested in this lane.
- No admin, Cesarin, or GraQle work performed or claimed.

**Outcome:** The Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening lane is now formally closed as accepted. All authenticated storefront re-entry surfaces now share a single persisted-truth-first continuation gate, the stuck-UI defect from the initial cold audit is closed by the bounded patch, and all previously accepted payment and checkout invariants remain intact.

---

### Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification — 27 de marzo de 2026

**Why this lane was opened:**

Recent accepted storefront lanes had already hardened open-order recovery, payment re-entry, return-to-catalog truth, and post-payment resolution clarity, but major storefront purchase surfaces could still make their primary visible CTA decisions independently. That fragmentation left room for the same persisted storefront truth to surface different next-step families depending on whether the customer was on orders, order detail, payment-return pages, cart, or checkout. This lane closed that gap by making one canonical storefront purchase-journey family the material owner of the primary visible CTA branch across those audited surfaces.

**Implementation scope:**

- `src/lib/domain/orders.ts` — `StorefrontPurchaseJourneyActionFamily` and `getStorefrontPurchaseJourneyView(...)` now exist as the canonical composition-based storefront purchase-journey helper.
- `src/pages/Orders.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/OrderDetail.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentSuccess.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentPending.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentFailure.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/components/cart/CartSidebar.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/components/cart/CheckoutForm.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/Checkout.tsx` — canonical helper output now materially governs the top-level purchase-journey next-step branch.
- Relevant tests:
  - `src/lib/domain/__tests__/orders.test.ts`
  - `src/pages/__tests__/Orders.test.tsx`
  - `src/pages/__tests__/OrderDetail.test.tsx`
  - `src/pages/__tests__/PaymentSuccess.test.tsx`
  - `src/pages/__tests__/PaymentPending.test.tsx`
  - `src/pages/__tests__/PaymentFailure.test.tsx`
  - `src/pages/__tests__/Checkout.test.tsx`
  - `src/components/cart/__tests__/CartSidebar.test.tsx`
  - `src/components/cart/__tests__/CheckoutForm.test.tsx`

**What was hardened:**

1. One canonical storefront purchase-journey family contract now exists and is real: `CONTINUE_PAYMENT`, `WAIT_FOR_RESOLUTION`, `REVIEW_CURRENT_ORDER`, `RETURN_TO_CATALOG`, `START_NEW_PURCHASE`.
2. The canonical helper is composition-based, not a new business engine: it composes accepted persisted-truth storefront helpers rather than replacing their underlying meaning.
3. Real precedence is now explicit and shared across audited surfaces: `CONTINUE_PAYMENT` first, then `WAIT_FOR_RESOLUTION`, then `REVIEW_CURRENT_ORDER`, then `RETURN_TO_CATALOG`, then `START_NEW_PURCHASE`.
4. The helper now returns materially usable `actionFamily`, `actionTarget`, and `actionLabel` outputs for all five families, including non-continuation families.
5. Non-continuation family behavior is now helper-owned and actionable: `REVIEW_CURRENT_ORDER` and `WAIT_FOR_RESOLUTION` target the persisted order route; `RETURN_TO_CATALOG` and `START_NEW_PURCHASE` resolve to `/` in the helper; cart and checkout surfaces may truthfully reinterpret those latter families as new-purchase flow where appropriate for visible CTA behavior.
6. `data-storefront-action-family` is now sourced from the canonical helper across the audited storefront surfaces, and cross-surface convergence is materially real rather than classification-only tagging.
7. Previously accepted invariants remain preserved: storefront-only scope, no guest persisted order/payment flow, no guest reorder expansion, no advanced checkout, no shipping engine, no stock reservation, no order-management platform, unchanged `submitCheckout` contract, unchanged `useCheckout` contract path, persisted-truth ownership for `/orders/:orderId` and payment pages, paid-only cart clear, paid-only confetti, and bounded refresh/recheck behavior.

**Audit and validation history:**

- Cold acceptance gap identified: the canonical family helper existed, but it was not yet the authoritative owner of primary visible CTA behavior across all audited surfaces, non-continuation families were not yet materially helper-owned everywhere, and convergence coverage still under-proved review-family parity.
- Final acceptance patch applied locally on the accepted worktree: primary visible CTA ownership moved onto the canonical helper across the audited surfaces, non-continuation family targets became materially actionable from the helper, forbidden doc/canon worktree drift was removed before acceptance, and focused convergence coverage was added.
- Focused local validation passed: `9/9` files, `102/102` tests, and local `typecheck` passed.

**Explicit non-claims:**

- No guest persisted payment or order flow introduced or claimed.
- No guest reorder expansion introduced or claimed.
- No advanced checkout, shipping, stock reservation, or order-management platform expansion introduced or claimed.
- No payment rewrite or broader commerce platform redesign claimed.
- No live-browser proof claimed; validation was focused local automated coverage plus `typecheck`.
- No admin, Cesarin, or GraQle work performed or claimed.
- No safely attributable commit ID is recorded for this accepted lane; canon reflects accepted local-worktree reality rather than a specific commit SHA.

**Outcome:** The Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification lane is now formally closed as accepted. Canonical purchase-journey family ownership of the primary visible CTA branch is now real across the audited storefront purchase surfaces, remains bounded to storefront-only composition over accepted persisted-truth helpers, and does not represent a broader commerce platform expansion.

---

### Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Raw decision evidence already existed in persisted logic-debug fields and runtime telemetry, but Cesarin operators still had to reconstruct the causal story manually across fragmented admin surfaces. The gap was operator trust and explainability, not storefront behavior, not routing redesign, and not missing backend infrastructure. The accepted fix was to align and expose existing truth so the operator could answer “why did Cesarin do this?” from one coherent reading surface.

**Implementation scope:**

- `src/services/admin/admin-decision-trace.service.ts` — canonical admin decision-trace read model over already-persisted runtime/simulation evidence.
- `src/services/admin/admin-pilot-ops.service.ts` — pilot rows now carry the canonical trace read model instead of forcing local UI reconstruction.
- `src/components/admin/cesarin/CesarinDecisionTracePanel.tsx` — shared causal panel for operator explainability.
- `src/components/admin/cesarin/ReviewDrawer.tsx` — now materially renders the shared causal panel.
- `src/components/admin/cesarin/PilotTelemetry.tsx` — now materially exposes canonical trust labeling in the operator review entry path.
- `src/pages/admin/AdminCesarinOS.tsx` — simulator-triggered review now reconstructs/preserves persisted trace context before opening review.
- `src/components/admin/cesarin/TabQuality.tsx` — reuses the same trace model and labels simulation honestly in QA detail.
- Relevant tests:
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`

**What materially changed:**

1. One canonical admin decision-trace read model now exists and is real. It aligns already-persisted evidence into one coherent causal story covering analyst intent, final routed intent, routing path, capsule vs non-capsule execution, guardrail overrides, injected tools, execution status, degraded/fallback reason, retrieval source/match strategy where applicable, and response text.
2. One shared causal panel now exists and is materially reused across the operator reading flow instead of leaving each surface to reconstruct trust context independently.
3. Trust labeling is now explicit and honest at the read-model level: evidence is labeled as `authoritative_runtime`, `partial_runtime`, or `simulated` rather than being implied or flattened.
4. `ReviewDrawer` now materially uses the canonical trace model as the operator-facing explanation surface.
5. `PilotTelemetry` now materially exposes canonical trust labeling from that same model in the review entry path.
6. Simulator-triggered review now preserves/reconstructs persisted trace context instead of reopening a stripped response row with missing causal explanation.
7. `TabQuality` now reuses the same trace model and labels simulation honestly instead of drifting onto a separate implicit trust model.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
- Focused result: `2` files, `4` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No routing redesign, guardrail architecture rewrite, capsule architecture rewrite, analytics-platform rewrite, or broad observability-platform rewrite was introduced or claimed.
- No new runtime truth was invented; the read model aligns existing persisted/runtime evidence only.
- No GraQle work was performed or claimed.
- No live operator walkthrough or live-browser proof is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to narrow focused test depth and historical rows that can only surface `partial_runtime` when persistence is incomplete.
- Simulator review truth is materially improved, but when direct persisted linkage is absent the fallback path remains weaker than explicit interaction-ID resolution.

**Outcome:**

The Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening lane is now formally closed as accepted. Cesarin operator review surfaces now share one coherent, truthful decision-trace read model with explicit trust labeling, simulator-triggered review no longer drops back to a stripped causal context, and the lane remains bounded to admin/operator explainability rather than broader AI architecture or analytics expansion. Commit: `430247e`.

---

### Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Simulation, QA, review, intervention, and improvement tooling already existed in parts, but the operator loop from finding to improvement closure still drifted across disconnected admin surfaces. Evidence and lifecycle state were not surfaced as one coherent actionable workflow, making it hard to answer whether a simulation finding had actually become a tracked, validated improvement. The gap was admin/Cesarin operator workflow closure, not storefront behavior, not analytics-platform redesign, and not a missing project-management platform.

**Implementation scope:**

- `src/services/admin/admin-improvement-workflow.service.ts` — canonical admin workflow read model for simulation/review/intervention/improvement lifecycle truth over existing persisted entities and services.
- `src/services/admin/admin-improvement.service.ts` — targeted hydration by `analytics_id` for improvement workflow lookup without loading unrelated queue state.
- `src/services/admin/admin-case-drafts.service.ts` — targeted hydration by source refs / interaction IDs so review and QA surfaces can expose persisted draft evidence coherently.
- `src/components/admin/cesarin/CesarinImprovementWorkflowPanel.tsx` — shared lifecycle/evidence panel for operator workflow reading.
- `src/components/admin/cesarin/ReviewDrawer.tsx` — now materially renders the shared workflow truth inside the review flow.
- `src/components/admin/cesarin/TabQuality.tsx` — now materially shares the same workflow truth in QA detail.
- `src/components/admin/cesarin/TabInterventions.tsx` — now materially shares the same workflow truth in intervention/recommendation detail.
- `src/components/admin/cesarin/TabImprovements.tsx` — now materially shares the same workflow truth in improvement-item detail.
- `src/components/admin/cesarin/PilotTelemetry.tsx` — now materially surfaces workflow status in the telemetry/review entry path.
- Relevant tests:
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabInterventions.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabImprovements.test.tsx`

**What materially changed:**

1. One canonical admin workflow read model now exists and is real for simulation/review/intervention/improvement lifecycle truth.
2. One shared lifecycle/evidence panel now exists and is materially reused across the operator workflow instead of leaving each surface to interpret status and evidence independently.
3. Lifecycle truth is now exposed honestly across `detected`, `triaged`, `approved`, `rejected`, `implemented`, `validated`, and `closed`.
4. Evidence truth is now exposed honestly across `authoritative`, `partial`, `simulated`, and `missing`.
5. `ReviewDrawer`, `TabQuality`, `TabInterventions`, `TabImprovements`, and `PilotTelemetry` now materially share the same workflow truth instead of drifting across fragmented handoffs.
6. Targeted hydration by analytics/source refs is real and bounded; the lane reuses existing persisted entities and services rather than inventing new workflow infrastructure.
7. Missing direct linkage between `intervention_recommendations` and `cesarin_improvement_items` remains explicit as partial/missing evidence rather than being fabricated into a false closure chain.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabInterventions.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabImprovements.test.tsx`
- Focused result: `4` files, `7` tests passed.
- `npm run typecheck` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No analytics-platform rewrite, fake PM/ticketing platform, or broader architecture redesign was introduced or claimed.
- No invented signals or invented lifecycle links were introduced or claimed.
- No fabricated direct FK/linkage was introduced between `intervention_recommendations` and `cesarin_improvement_items`.
- No GraQle work was performed or claimed.
- No live operator walkthrough or live-browser proof is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to selective test depth and a thinner `PilotTelemetry` presentation than the deeper review/intervention/improvement surfaces.
- Historical rows with incomplete persisted linkage or evidence still surface as partial/missing by design rather than being over-resolved.

**Outcome:**

The Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening lane is now formally closed as accepted. Cesarin operators can now read one coherent workflow/evidence story from finding through intervention/improvement lifecycle state, missing direct linkage remains explicit instead of fabricated, and the lane remains bounded to admin/operator workflow hardening rather than storefront or platform expansion. Commit: `5bbb2b3`.

---

### Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Cesarin already had simulation, review, traceability, and improvement tooling in parts, but the simulator itself still behaved more like a one-shot prompt sandbox than a materially useful operator conversation lab. Operators could not yet rely on one coherent place to talk to Cesarin across multiple turns, inspect what happened on a selected turn, and hand that finding into the existing review/improvement flow without reconstructing context manually. The gap was admin/Cesarin simulation usability and continuity, not storefront behavior, not architecture redesign, and not a missing multichannel/chat platform.

**Implementation scope:**

- `src/types/cesarin.ts` — structured simulation turn/session types now exist for persisted conversation-lab session truth.
- `src/services/admin/admin-simulation-lab.service.ts` — canonical admin simulation-lab read model over persisted session truth, legacy-session fallback reconstruction, selected-turn trace hydration, and selected-turn workflow hydration.
- `src/pages/admin/AdminCesarinOS.tsx` — simulator runtime now persists structured turn records and session metadata for simulated conversations and opens review from the selected persisted turn.
- `src/components/admin/cesarin/TabSimulator.tsx` — now materially renders the conversation lab UX over the canonical read model.
- Relevant tests:
  - `src/services/admin/__tests__/admin-simulation-lab.service.test.ts`
  - `src/components/admin/cesarin/__tests__/TabSimulator.test.tsx`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`

**What materially changed:**

1. One canonical admin simulation-lab read model now exists and is real. It derives conversation-lab truth from persisted simulation session data instead of leaving transcript/session meaning fragmented across page-local state.
2. Simulator now supports materially useful multi-turn conversation flow: send message, receive real Cesarin response, preserve bounded conversation state inside the current persisted simulation session, display the transcript clearly, and start a clean new simulation session.
3. `AdminCesarinOS.tsx` now persists structured simulated turn records and session metadata rather than relying only on raw history plus last-turn debug.
4. `TabSimulator.tsx` now materially renders a multi-turn transcript, selected-turn inspector, lifecycle state, honest error/runtime labeling, and per-turn review handoff.
5. The selected simulated turn now hydrates existing decision-trace and improvement-workflow evidence instead of forcing the operator to leave the lab and reconstruct context from disconnected surfaces.
6. The simulator remains integrated with the existing review, traceability, and improvement systems instead of becoming a second assistant product or a separate chat platform.
7. Session continuity remains explicitly bounded to persisted simulation-session truth and the accepted runtime context window only; the lane does not invent cross-session memory.
8. Legacy sessions that do not yet have structured persisted turn records now fall back to truthful reconstruction from `history`, so older sessions remain inspectable without fabricating continuity they never stored.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-simulation-lab.service.test.ts`
  - `src/components/admin/cesarin/__tests__/TabSimulator.test.tsx`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
- Focused result: `5` files, `11` tests passed.
- `npm run typecheck` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No architecture rewrite, new channel platform, fake multichannel/chat platform, or fake multi-agent system was introduced or claimed.
- No invented cross-session memory was introduced or claimed.
- No production-equivalence claim beyond accepted simulator scope was introduced or claimed.
- No GraQle work was performed or claimed.
- No live browser/operator walkthrough is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to missing dedicated end-to-end handler tests around the simulator runtime/controller path and thinner legacy-session evidence when older sessions require fallback reconstruction from `history`.
- Those residuals do not invalidate the lane; they only bound the remaining acceptance surface.

**Outcome:**

The Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening lane is now formally closed as accepted. Cesarin operators can now run materially useful bounded multi-turn simulated conversations, inspect selected-turn trace/workflow evidence from the same lab, and hand findings into the existing review/improvement flow without fragmenting context. Commit: `05e5a0d`.

---

### Césarín Stage 1 — Voz Humana, Approximate Recovery & Escalación Honesta — 27 de marzo de 2026

**Why this lane was opened:**

Storefront Césarín had become commercially useful in places, but he still risked sounding too rigid, over-structured, and mechanically certain when product search got fuzzy. Uncertain turns could still collapse into robotic fallback or be pressured into fake product certainty, and the storefront lacked a bounded collaborative recovery loop that kept the character alive while staying honest. This lane closed that Stage 1 gap by making Césarín more human, more honest inside the fantasy, and more recoverable without expanding beyond storefront behavior.

**Implementation scope:**

- `src/lib/cesarin-stage1.ts` — bounded Stage 1 helper layer for humanized uncertainty, approximate recovery prompting, honest escalation, and the corrective cart-operator visible voice mapping.
- `src/hooks/useAIConcierge.ts` — active recovery state, visible refinement loop wiring, honest WhatsApp escalation path, and Stage 1-aligned cart-operator visible copy.
- `src/components/ui/ai/AIConcierge.tsx` — visible `Esta se parece más` / `Ninguna` refinement controls and collaborative recovery UX.
- `src/services/concierge.service.ts` — humanized storefront search-message wrapping over existing product-search truth.
- `supabase/functions/customer-intelligence/persona.ts` — shorter, more oral, more honest storefront Césarín voice rules.
- `supabase/functions/customer-intelligence/index.ts` — corrected weak-intent rescue and removal of unconditional `UNKNOWN -> PRODUCT_SEARCH` terminal recovery; honest WhatsApp action preservation remained bounded to real existing paths.
- Relevant tests:
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`
  - `src/lib/__tests__/customer-intelligence-guardrails.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit: `a46dadb` — `feat(storefront-cesarin): harden human recovery and honest escalation`
- Cold audit verdict after the initial implementation: `ACCEPT WITH CORRECTIVE MICRO-PASS`
- Corrective micro-pass commit: `bf28d23` — `fix(storefront-cesarin): remove forced certainty tail`
- Short re-verify verdict after the micro-pass: `ACCEPT`

**What materially changed:**

1. Storefront Césarín now speaks with a more human, shorter, more oral Stage 1 storefront voice instead of defaulting to rigid/corporate fallback under uncertainty.
2. Humanized uncertainty is now real: Césarín can admit he does not fully recognize a product or query without collapsing into dead-end robotic copy or fake certainty.
3. Approximate recovery is now collaborative and visible inside the storefront chat surface: nearby products can be shown as approximate, the customer can say `Esta se parece más` or `Ninguna`, and the next turn uses that real signal.
4. Honest escalation is now real and bounded: when recovery is clearly failing, the storefront exits toward the existing WhatsApp path instead of promising a fake human callback.
5. The corrective micro-pass removed the last unconditional `UNKNOWN -> PRODUCT_SEARCH` forced recovery tail in the storefront runtime, so unresolved turns can now remain honestly unresolved unless real storefront signals justify rescue.
6. Weak-intent rescue still remains useful and bounded: real product, inventory, policy, or greeting signals still rescue weak turns where the storefront can help truthfully.
7. Visible `cart_operator` copy now follows the Stage 1 voice discipline instead of older fixed robotic rewrites, without changing real cart action semantics.

**Focused validation truth:**

- Initial Stage 1 focused validation passed: `3/3` files, `9/9` tests, `typecheck`, and `build`.
- Corrective micro-pass focused validation passed: `2/2` files, `4/4` tests, `typecheck`, and `build`.
- Final short re-verify verdict after the corrective micro-pass: `ACCEPT`.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No deep memory per customer was introduced or claimed.
- No autonomous learning was introduced or claimed.
- No admin/Cesarin OS tooling expansion was introduced or claimed.
- No giant architecture redesign, no broad retrieval redesign, and no new agent/memory platform were introduced or claimed.
- No fake human-handoff capability was introduced; escalation remains bounded to the real existing WhatsApp path.
- No checkout redesign, auth redesign, analytics overhaul, or broader storefront UI redesign was introduced or claimed.
- No Stage 2 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 1 is now formally closed as accepted. The storefront assistant is materially more human and less robotic, uncertainty no longer collapses into dead robotic fallback or terminal fake product certainty, approximate recovery is collaboratively usable, and honest escalation now protects the customer from wasted turns without inventing support capabilities that do not exist.

---

### Césarín Stage 2 — Gustos, Memoria Ligera y Continuidad Personal — 28 de marzo de 2026

**Why this lane was opened:**

Stage 1 had already made storefront Césarín more human and more honest under uncertainty, but returning authenticated customers still felt mostly stateless. Recommendations could improve within a turn, yet Césarín still lacked a bounded, commercially useful way to remember taste signals across sessions and sharpen later recommendation quality without becoming creepy, invasive, or overconfident. This lane closed that Stage 2 gap by adding lightweight preference continuity while keeping memory small, honest, and storefront-only.

**Implementation scope:**

- `supabase/functions/customer-intelligence/memory.ts` — lightweight authenticated taste-memory model, bounded preference categories, conservative evidence tiers, compact summary building, and the corrective recency/honesty fix for `interests_metadata`.
- `supabase/functions/customer-intelligence/index.ts` — authenticated read path for compact preference memory, compact prompt-summary injection into Analyst/Sommelier, and truthful persistence before storefront capsule early returns.
- `supabase/functions/customer-intelligence/persona.ts` — humble/non-creepy memory-use rules where current turn overrides prior memory.
- `supabase/migrations/20260327_cesarin_stage2_taste_memory.sql` — minimal schema support for `interests_metadata`, `preference_signals`, and `preference_summary` on `ai_customer_memory`.
- Relevant tests:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `b1246d3ab5e63185dac6c343b4c8300afd74ea7c`
  - `feat(storefront-cesarin): add lightweight taste memory`
- Cold audit verdict after the initial implementation:
  - `ACCEPT WITH CORRECTIVE MICRO-PASS`
- Corrective micro-pass commit:
  - `159096db9fdc357b13c41be24a76d4ab5188ae97`
  - `fix(storefront-cesarin): keep interest recency honest`
- Short re-verify verdict after the micro-pass:
  - `ACCEPT`

**What materially changed:**

1. Storefront Césarín now has lightweight authenticated taste memory that can sharpen later recommendations for returning customers without pretending deep memory.
2. Preference memory is explicitly bounded to commercially useful storefront categories only: `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`.
3. Evidence tiers are explicitly bounded and conservative: `inferred`, `explicit`, `confirmed`, and `rejected`.
4. Runtime prompt injection is now compact and preference-summary based, not a raw-history dump.
5. Memory use is explicitly humble and bounded: prior memory is only a useful bias, and the current turn always overrides what was stored before.
6. Guest users still do not receive fake durable continuity; persistent cross-session memory remains authenticated-only.
7. The corrective micro-pass fixed `interests_metadata` honesty so historical interests no longer gain fake `hits` or fresh `last_at` just because they survived merge. Interest reinforcement now only happens when that interest was actually re-observed in the current turn.

**Focused validation truth:**

- Initial Stage 2 focused validation passed:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`
- Initial focused result: `3` files, `13` tests passed.
- Corrective micro-pass focused validation passed:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
- Corrective focused result: `1` file, `6` tests passed.
- `npm run typecheck` passed for both the initial implementation and the corrective micro-pass.
- `npm run build` passed for both the initial implementation and the corrective micro-pass.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant CRM was introduced or claimed.
- No deep transcript memory was introduced or claimed.
- No autonomous learning platform was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No creepy personalization was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No fake persistence for guests was introduced or claimed.
- No Stage 3 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 2 is now formally closed as accepted. Authenticated returning customers can now receive materially sharper storefront recommendations through lightweight, conservative taste memory; current-turn intent still overrides stored memory; guests still do not appear durably remembered; and the corrective micro-pass closed the last honesty issue so historical interests no longer gain fake reinforcement from merge survival alone.

---

### Césarín Stage 3 — Colmillo Comercial con Memoria — 28 de marzo de 2026

**Why this lane was opened:**

Stage 2 had already given storefront Césarín lightweight authenticated taste memory, but that memory still behaved mostly like passive continuity. Returning customers could be remembered in a bounded, honest way, yet recommendation order, narrowing strategy, and approximate recovery quality still did not materially capitalize on remembered likes, dislikes, rejections, or budget posture. This lane closed that Stage 3 gap by converting existing taste memory into real storefront commercial judgment without opening a new platform, CRM, or ranking engine.

**Implementation scope:**

- `supabase/functions/customer-intelligence/commercial-memory.ts` — bounded commercial-guidance helper built over existing preference summary.
- `supabase/functions/customer-intelligence/index.ts` — edge/runtime prompt injection of memory-aware commercial guidance plus compact `memory_context.preference_summary` handoff for pre-routed product search.
- `src/lib/cesarin-stage3.ts` — deterministic storefront reranking over existing product suggestions using compact taste memory and current-turn override rules.
- `src/services/concierge.service.ts` — product-search result reranking before telemetry, rendering, and the existing approximate recovery loop.
- Relevant focused tests:
  - `src/lib/__tests__/customer-intelligence-commercial-guidance.test.ts`
  - `src/lib/__tests__/cesarin-stage3.test.ts`
  - `src/services/__tests__/concierge.service.stage3.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `0d964134752dcd274bef0651d082a89795c83271`
  - `feat(storefront-cesarin): add commercial judgment from taste memory`
- Cold audit verdict after implementation:
  - `ACCEPT`

**What materially changed:**

1. Existing lightweight taste memory now influences real storefront commercial judgment instead of sitting only as passive prompt context.
2. Edge/runtime guidance now explicitly tells Analyst/Sommelier to use remembered likes, dislikes, rejections, and budget posture to narrow more efficiently, avoid repeated dead ends, and keep current-turn intent above memory when the two conflict.
3. Storefront product-search results are now reranked deterministically for authenticated returning customers using the existing compact taste-memory summary.
4. Relevant liked profiles can move stronger options upward in the shown result order.
5. Rejected or disliked paths can move stale bad suggestions downward instead of being resurfaced repeatedly.
6. Budget posture now influences ordering conservatively when the current turn does not already set price direction.
7. Approximate recovery quality also improves because reranking happens before the existing `Esta se parece más` / `Ninguna` loop chooses the top suggestions to show.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/customer-intelligence-commercial-guidance.test.ts`
  - `src/lib/__tests__/cesarin-stage3.test.ts`
  - `src/services/__tests__/concierge.service.stage3.test.ts`
- Focused result: `3` files, `8` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant ranking engine was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No autonomous learning platform was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No broad deep-commercial-intelligence platform was introduced or claimed beyond bounded prompt guidance plus deterministic storefront reranking.
- No Stage 4 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 3 is now formally closed as accepted. Returning authenticated customers can now receive materially sharper, more fitted storefront recommendation order because existing taste memory is used as bounded commercial judgment; current-turn intent still overrides prior memory when it conflicts; approximate recovery inherits better top suggestions; and the result remains non-creepy, non-pushy, and storefront-only.

---

### Césarín Stage 4 — Conversación Comercial Adaptativa — 28 de marzo de 2026

**Why this lane was opened:**

Stage 3 had already turned lightweight taste memory into bounded commercial judgment, but storefront Césarín could still sound too flat in timing. Strong-signal users, compare users, hesitant users, and broad exploratory users were still at risk of being funneled through one similar seller cadence. This lane closed that Stage 4 gap by making the main commercial/product-search flow adapt its next move more intelligently without opening a giant behavioral engine, CRM, or admin lane.

**Implementation scope:**

- `supabase/functions/customer-intelligence/conversation-modes.ts` — canonical bounded conversation-mode resolver and runtime guidance builder for `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE`.
- `supabase/functions/customer-intelligence/index.ts` — edge/runtime injection of adaptive conversation guidance into Analyst and Sommelier prompts plus `conversation_mode_hint` handoff on pre-routed storefront product search.
- `src/lib/cesarin-stage4.ts` — storefront-side adaptive shaping over visible option count and next-step message flow, using query posture, history, memory strength, and match strength while keeping current-turn override.
- `src/services/concierge.service.ts` — Stage 3 reranking remains first; Stage 4 now adapts final visible suggestions and response shape before the existing recovery loop sees them.
- Relevant focused tests:
  - `src/lib/__tests__/customer-intelligence-conversation-modes.test.ts`
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `5d48c46f124b0ce9323f1c9d102e459b8c6e0e66`
  - `feat(storefront-cesarin): add adaptive commercial conversation`
- Cold audit verdict after implementation:
  - `ACCEPT`
- No corrective micro-pass was required.

**What materially changed:**

1. Storefront Césarín now has a bounded conversation-mode layer instead of one flat commercial cadence.
2. Strong-signal turns can now resolve into shorter cleaner recommendation paths.
3. Compare turns now stay narrowed and grounded instead of drifting toward list dumping.
4. Hesitation now gets reassurance without hard-resetting the conversation.
5. Broad weak-memory turns remain exploratory instead of being overclosed.
6. Ready-to-close turns can simplify the next move when real support exists.
7. Current-turn posture still overrides stale assumptions, and approximate recovery benefits because visible suggestions are already adapted before entering the existing `Esta se parece más` / `Ninguna` loop.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/customer-intelligence-conversation-modes.test.ts`
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
- Focused result: `3` files, `7` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant behavioral-intelligence engine was introduced or claimed.
- No deep conversation-planning system was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No claim that all Césarín behavior is now mode-driven; this remains bounded primarily to the main commercial/product-search lane.
- No Stage 5 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 4 is now formally closed as accepted. The storefront assistant can now adapt his commercial timing more intelligently across strong-signal, compare, hesitation, exploratory, and ready-to-close turns while preserving Stage 1, Stage 2, and Stage 3 honesty/memory safeguards and staying bounded to the storefront commercial lane.

---

### Césarín Stage 5 — Conversión Asistida y Cierre Accionable — 28 de marzo de 2026

**Why this lane was opened:**

Stage 4 had already made storefront Césarín more adaptive in timing, but the assistant could still leave too many good recommendation branches on a generic handoff. Strong-fit paths, compare paths, selector-sensitive paths, and exploratory paths still lacked one bounded layer that decides the next best storefront action more concretely without faking checkout-readiness, pressure, or hidden workflow support. This lane closed that Stage 5 gap by making Césarín choose a more truthful actionable next step after recommendation while staying grounded in existing storefront surfaces only.

**Implementation scope:**

- `src/lib/cesarin-stage5.ts` — canonical next-step resolver over bounded action families `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`.
- `src/services/concierge.service.ts` — Stage 5 execution after Stage 3 reranking and Stage 4 shaping, including real product hydration before next-step resolution and `next_step_view` attachment to the capsule contract.
- `src/components/ui/ai/AIConcierge.tsx` — real `Siguiente paso` UI block rendering storefront-backed actions from `next_step_view`.
- Relevant focused tests:
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `9b015eb`
  - `feat(storefront-cesarin): add actionable conversion flow`
- Cold audit verdict after implementation:
  - `ACCEPT`
- No corrective micro-pass was required.

**What materially changed:**

1. Storefront Césarín now resolves a bounded next actionable storefront step after recommendation instead of leaving every good branch on one generic close.
2. Stage 5 now runs after Stage 3 reranking and Stage 4 conversation/posture shaping.
3. The storefront now hydrates real product data before deciding the next actionable step.
4. The capsule contract now carries `next_step_view` as the bounded next-step handoff.
5. The chat UI now renders a real `Siguiente paso` block with actual storefront actions instead of only narrative copy.
6. `OPEN_PDP` and `ADD_TO_CART` stay grounded in existing storefront flows only; no new checkout or hidden human workflow is implied.
7. Selector-needed behavior now stays narrowly tied to real product/variant evidence instead of reopening the whole conversation.
8. Compare and exploration remain honest when a stronger close is not justified.
9. Current-turn intent can still block stale memory/posture from forcing action confidence.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`
- Focused result: `3` files, `9` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No checkout/platform redesign was introduced or claimed.
- No hidden human workflow was introduced or claimed.
- No giant conversion engine was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No deep autonomous conversion-intelligence platform was introduced or claimed beyond bounded storefront next-step shaping.
- No Stage 6 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 5 is now formally closed as accepted. The storefront assistant can now move more cleanly from recommendation into the next truthful storefront action: one-product review when one fit is strongest, two-option compare when compare is still honest, one missing selector when only that material choice remains, cart-adjacent action only when support is real, and continued exploration when the branch is still too broad to close.

---

### Césarín Storefront — Decision Flow Naturalization Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted storefront visibility, outcome, and trust passes, Césarín could already express help posture more clearly, but the visible decision flow still felt somewhat mechanical in specific transitions. Explore / compare / review / advance were more truthful than before, yet storefront shaping still carried residual forcing that could drift away from upstream turn truth, especially once `turnAnalysis` started flowing into the storefront path. This lane was opened to make that decision flow feel more natural without reopening catalog policy, anti-bloat, or core architecture.

**Implementation scope:**

- `src/lib/cesarin-stage4.ts` — storefront posture shaping aligned more directly with upstream `turnAnalysis`.
- `src/lib/cesarin-stage5.ts` — storefront family/outcome resolution cleanup plus the later weak-support humility correction.
- `src/services/concierge.service.ts` — removal of the old storefront-side forced exploration fallback via `modeHint`.
- Focused tests:
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `b28b79f0190cf6146d890fbc11584f336402196c`
  - `refactor(cesarin): naturalize decision flow — propagate turn_analysis to storefront stages`
- Corrective micro-pass:
  - `d81ea2bae78ea82264750c6efcb7991fe0f34ece`
  - `fix cesarin weak support humility regression`
- Accepted final audit status:
  - `ACCEPT`

**What materially changed:**

1. `turnAnalysis` now materially informs storefront stage shaping.
2. Stage 4 follows upstream model posture more directly, especially around clarify-first handling and other current-turn posture signals.
3. The old forced storefront `EXPLORE_LIGHT` fallback through `modeHint` is gone from the live service path.
4. Regex/helper duplication between Stage 4 and Stage 5 was materially reduced instead of being expanded.
5. `isStrictExplorationQuery(...)` now narrows older exploration forcing rather than letting it spread broadly.
6. Decision-flow transitions now feel more natural because storefront stages preserve upstream posture more faithfully.
7. The accepted weak-support / approximate single-candidate regression is now closed: when upstream posture remains `GUIDED_COMPARE`, the humble storefront outcome remains `KEEP_EXPLORING` instead of collapsing prematurely into `REVIEW_ONE`.

**Focused validation truth:**

- The initial wave shipped with focused storefront validation and was later cold-audited.
- The corrective micro-pass then revalidated the exact weak-support regression path in focused form.
- Accepted micro-pass results:
  - `2` files, `17` tests passed
  - `npm run typecheck` passed
  - `npm run build` passed

**Accepted final discipline / explicit non-claims:**

- This was a bounded storefront naturalization lane only.
- No catalog-gate reopening was introduced or claimed.
- No anti-bloat rollback was introduced or claimed.
- No recovery/action button redesign was introduced or claimed.
- No planner/orchestrator layer was introduced or claimed.
- No admin / Cesarin OS drift was introduced or claimed.
- No storefront redesign from zero was introduced or claimed.
- No claim is made that Stage 5 is now fully non-heuristic or fully model-pure.

**Residual bounded risk:**

- Stage 5 remains partially heuristic, so future posture modes or support patterns still require focused regression coverage when they materially affect family/outcome resolution.

**Outcome:**

The accepted storefront baseline now follows upstream posture more naturally. `turnAnalysis` materially reaches the storefront stages, the old forced exploration fallback is gone, helper duplication is reduced, and the weak-support humility regression was closed without undoing the model-first gain in posture wiring.

---

### Césarín Assistant Runtime — Technical Cleanup & Coherence Wave — 30 de marzo de 2026

**Why this lane was opened:**

After multiple accepted storefront and runtime waves, the Césarín assistant runtime was already materially stronger, but it still carried technical residue that made the live path harder to reason about than necessary. Stage 4 still exposed a dead `modeHint` contract even though the accepted storefront baseline no longer depended on it, and fallback turn-decision reconstruction could still leak legacy `conversation_mode_hint` semantics instead of staying canonical. This lane was opened to improve runtime coherence and boundary cleanliness without reopening product behavior lanes, storefront UI work, or architecture rewrites.

**Exact scoped files:**

- `src/lib/cesarin-stage4.ts`
- `src/services/concierge.service.ts`
- `src/hooks/useAIConcierge.ts`
- `src/lib/__tests__/cesarin-stage4.test.ts`
- `src/services/__tests__/concierge.service.stage4.test.ts`
- `src/hooks/__tests__/useAIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Inspected the real runtime/storefront fallback path instead of assuming that legacy contract cleanup still needed broad architectural work.
2. Confirmed that `modeHint` was already dead in the accepted runtime baseline and removed that dead Stage 4 contract instead of preserving it for conceptual symmetry.
3. Canonicalized fallback `current_turn_decision` through a shared resolver so service-side and hook-side fallback posture no longer drift on legacy hint strings.
4. Removed legacy `conversation_mode_hint` contamination from fallback turn-decision reconstruction without reopening storefront behavior lanes.
5. Added only the focused regression coverage needed to prove the canonical fallback path and preserve the accepted pilot baseline.

**Accepted final discipline:**

This was a bounded runtime-coherence cleanup only. It did not reopen catalog gate policy, commercial outcome logic, trust signaling, storefront UI, or any planner/orchestrator lane. The accepted implementation simplified a dead contract and cleaned fallback truth boundaries without inflating scope into a full runtime rewrite.

**Accepted commit:**

- `0628133a2552c946477e8e0f8f0d0048121e4497`
- `refactor cesarin runtime coherence cleanup`

**Accepted runtime truth after implementation:**

- Dead `modeHint` contract is removed from Stage 4.
- Fallback `current_turn_decision` is now canonicalized through a shared resolver.
- Service fallback no longer leaks legacy `conversation_mode_hint`.
- Hook and service are materially aligned on fallback `current_turn_decision`.
- Stage 4 boundary is now cleaner between upstream model / upstream turn-analysis truth and technical fallback when that signal is missing.

**Explicit non-claims:**

- This is not a full runtime rewrite.
- This does not claim that all fallback logic is now fully centralized.
- This does not introduce a new planner/orchestrator.
- This does not add new commercial rails.
- This does not redesign storefront UI.
- This does not reopen prior accepted waves as separate projects.

**Residual non-blocking risk:**

Some duplication still exists for `primary_intent` fallback between service and hook, and this wave did not attempt to fully centralize every fallback field. That remaining residue is bounded and non-blocking under the accepted pilot baseline.

---

### Césarín Storefront — Recovery & Friction Handling Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted visibility, outcome, trust, and naturalization passes, the storefront decision flow was materially better, but one visible friction point remained inside weak `REVIEW_ONE`. Users could reach a prudent review-first state without a clean low-pressure reentry path back into the normal conversation loop, leaving the storefront with unnecessary hesitation cost even when product pressure should stay low. This lane was opened to reduce that friction inside the existing next-step surface without creating a new route, executor path, or recovery engine.

**Exact scoped files:**

- `src/lib/cesarin-stage5.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/lib/__tests__/cesarin-stage5.test.ts`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Inspected the real weak `REVIEW_ONE` path and confirmed that the visible friction was a reentry gap rather than a Stage 4/runtime/planner problem.
2. Added a bounded `assistAction` only for weak `REVIEW_ONE` inside Stage 5 rather than opening a new decision path.
3. Reused the existing gated next-step surface so the storefront could expose a subtle reentry affordance without changing service shaping or hook/runtime flow.
4. Kept the user inside the normal conversation loop through ordinary `sendMessage(...)` instead of introducing a special executor path.
5. Added only the focused coverage needed to prove the weak-review reentry affordance and preserve the accepted storefront baseline.

**Accepted final discipline:**

This was a bounded storefront friction-reduction wave only. It did not reopen catalog pressure, did not change Stage 4 runtime posture wiring, did not add a new route, did not add a planner/orchestrator, and did not widen into a larger recovery engine. The accepted implementation reduced visible friction inside the existing truthful next-step surface only.

**Accepted commit:**

- `2aec9dfe714d08a44ee3e4c7fc0955ca21fb1627`
- `feat(cesarin): improve recovery and friction handling`

**Accepted runtime / storefront truth after implementation:**

- Weak `REVIEW_ONE` now has a subtle reentry affordance through `next_step_view.assistAction`.
- That affordance appears only when `family === 'REVIEW_ONE'` and `supportLevel === 'weak'`.
- The accepted visible copy is `Seguimos viendo`.
- Clicking it returns the user to the normal conversation loop through ordinary `sendMessage(...)`.
- No Stage 4 runtime change was introduced.
- No service-shaping change was introduced.
- No hook-runtime behavior change was introduced beyond consuming the normal message flow.

**Explicit non-claims:**

- This is not a new route.
- This is not a planner/orchestrator path.
- This is not a funnel engine or broader recovery engine.
- This does not claim measured conversion uplift.
- This does not claim that all storefront friction handling is now solved globally.
- This does not reopen prior accepted waves as separate projects.

**Residual non-blocking risk:**

This wave closes the weak `REVIEW_ONE` reentry gap only. Other friction points may still exist in different storefront families, but they were not widened or misrepresented by this bounded implementation.

---

### Césarín Storefront / Assistant — Shaping Spine Consolidation Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted runtime coherence cleanup and the storefront friction-reduction pass, the assistant spine was materially more coherent, but the codebase still had one subtle auditability residue: the UI had already moved onto shared text utilities, yet the audit trail had not fully distinguished consolidation truth from an outdated impression of local duplication. This lane was opened to canonize the real consolidation state without reopening runtime, stage, catalog, or commercial behavior.

**Exact scoped files:**

- `src/lib/cesarin-text-utils.ts`
- `src/services/concierge.service.ts`
- `src/hooks/useAIConcierge.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Confirmed that shared text-shaping utilities had already been consolidated in `cesarin-text-utils.ts`.
2. Verified that `concierge.service.ts` and `useAIConcierge.ts` depend more directly on shared/server truth and less on older local reinterpretation.
3. Verified that `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
4. Confirmed that `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`.
5. Added focused UI regressions in `src/components/ui/ai/__tests__/AIConcierge.test.tsx` to explicitly guard that shared-util contract and close the auditability-only gap.

**Accepted final discipline:**

This was a documentation / auditability-close wave in practice, not a product rewrite. The accepted micro-fix reinforced the spine with tests, but it did not change runtime, stages, catalog behavior, or commercial behavior. The spine is cleaner because the shared utilities are already real and now explicitly guarded.

**Accepted commits:**

- `0628133a2552c946477e8e0f8f0d0048121e4497`
- `refactor cesarin runtime coherence cleanup`
- `ba0c21dfcd84dbb55b7b719258627adaafbede82`
- `test cesarin shaping spine ui dedupe guard`

**Accepted runtime truth after implementation:**

- Shared text-shaping utilities are centralized in `cesarin-text-utils.ts`.
- Service and hook rely more directly on shared/server truth and less on local reinterpretation.
- `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
- The prior UI residual was auditability-only, not an active product duplication.
- `AIConcierge.tsx` already consumed shared text utils, and that contract is now explicitly guarded by tests.

**Explicit non-claims:**

- This is not a full assistant rewrite.
- This does not claim perfect centralization across every layer.
- This does not claim all legacy residues everywhere are gone.
- This does not reopen runtime, stages, catalog, or commercial behavior.
- This does not add a new planner/orchestrator or any commercial rail.

**Residual non-blocking risk:**

The spine is more coherent, but not every storefront/service/UI responsibility is perfectly centralized. That bounded residue is accepted and is now guarded more explicitly rather than being silently assumed.

---

### Césarín Storefront — Visible Guidance Compression / Anti-Redundancy Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted trust, decision-flow, recovery, and spine cleanup passes, the storefront still had one visible repetition residue: the same posture could echo across the help chip, the trust note, and `Siguiente paso`. The underlying decision was already correct, but the visible surfaces could still feel more mechanical than necessary. This lane was opened to compress that visible redundancy without touching runtime intelligence or reopening commercial behavior.

**Exact scoped files:**

- `src/components/ui/ai/AIConcierge.tsx`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**
1. **Accepted visible compression landed** - commit `4e69c198134ccdc12d2a0306f440860db22166cb` (`refactor cesarin visible guidance compression`) made the chip more categorical when `next_step_view` already exists, kept `Siguiente paso` as the clearer source of direction, and suppressed redundant trust-note echoes when guidance already carries the same meaning.
2. **Accepted boundary stayed UI-only** - the change stayed inside the storefront renderer boundary. No Stage 4, Stage 5, service, hook, catalog, or runtime-intelligence behavior was changed.
3. **Accepted auditability guard landed** - the focused UI regression coverage now freezes the separation so the chip remains bounded and `Siguiente paso` remains the primary place for useful direction when present.

**Accepted final discipline:**

- This is a bounded visible-guidance compression lane only.
- Chips are more categorical when `next_step_view` exists.
- `Siguiente paso` carries the useful directional guidance more cleanly.
- Trust-note echoes are suppressed when equivalent guidance is already visible.
- No runtime intelligence changed.
- No new copy-compression engine or global text framework was introduced.
- No measured UX or conversion uplift is claimed.

**Residual Truth Safeguards / Explicit Non-Claims:**

- No Stage 4 / Stage 5 / service / hook behavior change.
- No new planner/orchestrator layer.
- No storefront redesign from zero.
- No global text-compression claim across every surface.
- No product-behavior inflation beyond the visible renderer cleanup.

**Residual non-blocking risk:**

The compression is intentionally renderer-scoped. If future visible surfaces reuse the same posture language without the same boundary discipline, the same kind of echo could reappear there. That risk is bounded and now more visible through the UI tests.

---

### Césarín Storefront — Sales / Persona Hardening Wave — 30 de marzo de 2026

**Why this lane was opened:**

The storefront and assistant were already materially functional, but the visible commercial voice still felt too disciplined and too system-shaped in some turns. The lane was opened to strengthen Césarín’s sales presence, warmth, tact, and natural persuasive rhythm without adding new rails, modes, labels, or architecture.

**Exact scoped files:**

- `supabase/functions/customer-intelligence/persona.ts`
- `supabase/functions/customer-intelligence/index.ts`
- `src/lib/cesarin-stage4.ts`
- `src/lib/cesarin-stage5.ts`
- `src/lib/__tests__/cesarin-stage5.test.ts`
- `src/services/__tests__/concierge.service.stage4.test.ts`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**
1. **Voice base hardened** - `persona.ts` now describes Césarín as a trusted seller with calm confidence, warmth, and light natural wit when it fits.
2. **Sommelier prompt strengthened** - `index.ts` now carries a compact presence-commercial block so runtime answers can sound more human, sharper, and less like a disciplined state machine.
3. **Storefront wording softened** - `cesarin-stage4.ts` and `cesarin-stage5.ts` now use less mechanical commercial tails and next-step wording while preserving support truth, compare-first honesty, weak-support humility, and add-ready truthfulness.
4. **Focused regressions updated** - tests were adjusted to lock the new voice and wording without reopening catalog, recovery, or commercial gating behavior.

**Accepted final discipline:**

This is a bounded storefront/customer-intelligence lane. It materially improves commercial voice and presence, but it does not add new behavior rails, modes, labels, or a new planner. It does not redesign runtime architecture or storefront UI from zero. It does not claim measured conversion uplift. It does not claim full removal of deterministic Stage 4/5 commercial scaffolding.

**Accepted commit:**

- `18d6870c2e603b82ac28e726569593efa3b4986b`
- `feat cesarin sales persona hardening`

**Explicit non-claims:**

- No new modes, trees, labels, or hidden rails were introduced.
- No new admin / Cesarin OS work was added.
- No storefront UI redesign from zero was attempted.
- No funnel-engine or planner/orchestrator layer was added.
- No measured sales uplift is claimed.
- No full removal of deterministic Stage 4/5 commercial scaffolding is claimed.

**Residual non-blocking risk:**

The visible commercial feel still leans partly on deterministic Stage 4/5 scaffolding and wording-locked tests. That is an accepted residual, not a hidden failure: the voice is materially better, but not yet fully free of shaping from the surrounding posture machinery.

---

---

### Césarín Storefront — Stage 4 / Stage 5 De-Scaffolding Lane — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted storefront visibility, outcome, trust, recovery, spine, guidance compression, and sales/persona passes, the visible response path still carried some stage-era residue. The customer-facing result was correct, but the answer flow could still feel like separate layers: main answer, helper note, and next-step block. This lane was opened to thin that scaffolding at the storefront boundary without redesigning Stage 4 / Stage 5 or changing runtime intelligence.

**Exact scoped files:**

- `src/services/concierge.service.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/services/__tests__/concierge.service.stage4.test.ts`

**Accepted implementation / audit sequence:**

1. `concierge.service.ts` now drops redundant `next_step_view` guidance when it does not add distinct value beyond the main response.
2. `AIConcierge.tsx` now narrows the visible trust-note surface so it only survives in genuine `KEEP_EXPLORING` flows and only when it is distinct from both the guidance and the main message.
3. Focused regressions now prove the accepted contract: redundant `KEEP_EXPLORING` scaffolding is removed, while distinct action value still preserves `next_step_view`.

**Accepted final discipline:**

- This is a bounded storefront de-scaffolding improvement only.
- `next_step_view` survives only when it adds distinct guidance or real action value via `primaryAction`, `secondaryAction`, or `assistAction`.
- Redundant `KEEP_EXPLORING` next-step scaffolding is dropped when the main response already carries the same move.
- Trust-note narrowing is real and limited to `KEEP_EXPLORING`.
- No runtime/product-intelligence redesign happened.
- No new mode, rail, planner, or mini-framework was introduced.
- No measured conversion uplift is claimed.

**Accepted commit:**

- `bd00a2e68e33a211d62ffa5111407eecc849dd76`
- `refactor cesarin storefront de-scaffold next steps`

**Explicit non-claims:**

- This does not remove Stage 4 / Stage 5.
- This does not claim stage structure is no longer materially important.
- This does not redesign runtime architecture or storefront UI from zero.
- This does not add a new planner/orchestrator or a new mode system.
- This does not widen product pressure or reopen closed lanes.

**Residual non-blocking risk:**

The accepted residual is the honest remaining stage structure plus a small auditability gap on the positive `KEEP_EXPLORING` trust-note survival case. That residue is bounded and does not block acceptance.

*Last updated: 30 de marzo de 2026 (Césarín Storefront — Stage 4 / Stage 5 De-Scaffolding Lane — ACCEPT)*

### Césarín Storefront — Turn-Level Commercial Judgment Tightening — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, and `src/lib/__tests__/cesarin-stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
The accepted turn-level commercial judgment lane already introduced a compact bounded `commercial_move` for the product-search storefront path, but the downstream realization layers were still treating that move as if it needed to be recomputed again after service-level normalization. That weakened the accepted truth that current-turn commercial judgment should be computed once upstream when present, then followed downstream without redundant reinterpretation. The acceptance gap was narrow: Stage 4 and Stage 5 were already materially cleaner, but the upstream `commercial_move` still needed to be treated as primary truth instead of a second-pass suggestion.
**Implementation / Audit Sequence:**
1. **Accepted upstream truth priority landed** - commit `a43b49e4cf87ddf92d75886603c08840245720d6` (`fix cesarin upstream commercial move priority`) updated Stage 4 and Stage 5 so an upstream `commercial_move` is now treated as primary truth whenever present.
2. **Accepted fallback-only recomputation stayed bounded** - the same accepted commit keeps the shared commercial-judgment resolver only as a fallback when upstream `commercial_move` is absent, rather than recomputing the move redundantly on the happy path.
3. **Accepted Stage 4 contract proof landed** - the focused regression in `src/lib/__tests__/cesarin-stage4.test.ts` now proves that an upstream `turnAnalysis.commercial_move` is honored directly and still yields the expected Stage 4 posture.
4. **Accepted load-bearing storefront boundaries remained intact** - the corrective micro-fix stayed local to Stage 4 / Stage 5 realization and did not reopen catalog-gate authority, anti-bloat, degraded honesty, public-web scope, or admin / Cesarin OS behavior.
**Accepted Final Discipline:**
- This is a bounded storefront micro-lane, not a new planner/orchestrator contract.
- `commercial_move` is compact and bounded, not a global interpretation engine.
- The accepted move vocabulary remains bounded to `KEEP_EXPLORING`, `COMPARE_TWO`, `REVIEW_ONE`, and `ADD_READY`.
- Stage 4 now treats upstream `commercial_move` as primary truth when present.
- Stage 5 now follows upstream `commercial_move` as primary truth when present and only recomputes through the shared resolver as fallback when absent.
- Stage 4 and Stage 5 remain real and load-bearing realization layers.
- This lane improves turn-level commercial judgment propagation; it does not claim total elimination of all downstream deterministic shaping.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a planner/orchestrator redesign.
- This log does not claim Stage 4 / Stage 5 removal.
- This log does not claim measured conversion uplift.
- This log does not claim total commercial interpretation centralization everywhere.
- This log does not claim a new mode system.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**Residual non-blocking risk:**
- Stage 4 / Stage 5 remain deterministic realization layers around the compact commercial truth, so some downstream shaping still exists by design.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Turn-Level Commercial Judgment Tightening — ACCEPT)*

### Césarín Storefront — Selector-Needed Trigger Tightening / De-Scripted Surface — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / assistant only.
**Problem Identified:**
The storefront selector-needed edge still had too much local override pressure and too much generic visible scaffolding. In practice, `SELECTOR_NEEDED` could win too early relative to compare/review posture, and the UI still dressed it with generic family-chip and trust-note surfaces that made the edge feel more scripted than necessary. The lane was opened to tighten that trigger, keep the missing-selector ask only where it is materially purchase-defining, and de-script the visible selector-needed surface without widening upstream commercial judgment or reopening the stage architecture.
**Implementation / Audit Sequence:**
1. **Selector-needed override was tightened** - `src/lib/cesarin-stage5.ts` now bounds `SELECTOR_NEEDED` to stronger single-product, non-approximate, non-compare cases where the missing selector is truly required for the current move.
2. **Compare/review ordering stayed intact** - compare-worthy turns and weaker review-first turns no longer lose the field to selector-needed just because a variant selector exists.
3. **Visible scaffolding was reduced** - `src/components/ui/ai/AIConcierge.tsx` no longer renders generic selector-needed family-chip or trust-note scaffolding, while still allowing the minimal missing-selector guidance when it adds value.
4. **Focused regressions were updated** - tests now lock the accepted contract for selector-needed ordering and the de-scripted storefront surface.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-lane.
- `SELECTOR_NEEDED` remains a local Stage 5 family by design; it is not promoted upstream into `commercial_move`.
- The lane does not add a selector taxonomy, a planner/orchestrator, a funnel engine, or a new behavior tree.
- The lane does not claim full natural-language freedom.
- The lane does not claim upstream `commercial_move` expansion.
- The lane does not claim measured conversion uplift.
- The lane does not reopen closed storefront lanes.
**Residual Truth Safeguards / Explicit Non-Claims:**
- No admin / Cesarin OS work was added.
- No Stage 4 / Stage 5 redesign from zero was attempted.
- No broader compare/review lane was reopened.
- No trust-note expansion was introduced.
- No canned phrase pack replaced another canned phrase pack.
**Residual non-blocking risk:**
- Selector-needed still depends on deterministic Stage 5 realization for the minimal missing-selector ask, so some visible shaping remains by design.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Selector-Needed Trigger Tightening / De-Scripted Surface — ACCEPT)*

### Césarín Storefront — Tool-Selection / Intent-Guardrails De-Scripting — 31 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/__tests__/customer-intelligence-turn-first.test.ts`, and `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`. Storefront / assistant only.
**Problem Identified:**
The storefront/runtime path was already broadly model-first, but `intent-guardrails.ts`, `tool-selection.ts`, and one runtime branch in `index.ts` still applied too much early local choreography. Regex-inferred semantic cues could still overtake non-`UNKNOWN` analyst intent too easily, fallback capability injection could still survive when the resolved turn profile no longer required capability use, public-web admission still carried too much regex-led routing flavor, and `index.ts` still contained an early compatibility force-correction before turn-profile resolution. The lane was opened to reduce that early coercion without removing legitimate hard-boundary controls.
**Implementation / Audit Sequence:**
1. **Regex pressure was subordinated** - commit `280d2c48f89286f69b90e7dcd84ffc52d963f576` (`refactor cesarin tool guardrail descripting`) updated `intent-guardrails.ts` so regex-inferred intents are now subordinated more often instead of overtaking non-`UNKNOWN` analyst intent by default.
2. **Fallback capability injection was narrowed** - the same accepted commit updated `tool-selection.ts` so fallback own-function injection only survives when the resolved turn profile still says capability use is needed and the primary intent still matches.
3. **Public-web admission became more purely boundary-gated** - the same accepted commit kept public-web admission behind resolved `PUBLIC_INFO` instead of allowing web-like wording to self-route the turn too early.
4. **Early compatibility force-correction was removed** - the same accepted commit removed the runtime pre-correction in `index.ts`, so turn-profile resolution now settles the lane before compatibility can become primary truth.
5. **Focused regressions proved the bounded contract** - the accepted test updates now prove that web-like wording no longer overtakes a resolved product-search turn by itself, public web does not reopen reflexively, and own-function fallback is not injected when the turn profile did not ask for capability use.
**Accepted Final Discipline:**
- This is a bounded storefront-only model-first lane.
- `intent-guardrails.ts` now subordinates regex-inferred intents more often instead of letting them overtake non-`UNKNOWN` analyst intent by default.
- `tool-selection.ts` now narrows fallback capability injection so it survives only when the resolved turn profile still requires capability use and the primary intent matches.
- Public-web admission is now boundary-gated behind resolved `PUBLIC_INFO` instead of regex-led semantic self-routing.
- `index.ts` no longer applies the early compatibility force-correction before turn-profile resolution.
- Legitimate deterministic boundary controls remain intact: catalog-closed pruning, clarify-first suppression, own-function fallback for true private/action lanes, and public-web restraint.
- This lane reduced early local choreography without planner/orchestrator drift, without widening `commercial_move`, and without reopening Stage 4 / Stage 5.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim regex elimination.
- This log does not claim full model-pure behavior.
- This log does not claim planner/orchestrator behavior.
- This log does not claim widened `commercial_move`.
- This log does not claim Stage 4 / Stage 5 redesign.
- This log does not claim measured conversion uplift.
- This log does not claim admin / Cesarin OS work.
**Residual non-blocking risk:**
- The residual is auditability-only and non-blocking: there is still no one focused regression pinning the removed compatibility pre-correction in `index.ts`. This is not a product defect and did not block acceptance.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Tool-Selection / Intent-Guardrails De-Scripting — ACCEPT WITH MINOR RESIDUAL)*

### Césarín Storefront — Stage 5 Family-Resolution Thinning / Upstream Truth Obedience — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
Upstream `commercial_move` was already primary truth on the accepted storefront path, and Stage 5 had already stopped hard-recomputing that move on the happy path. The remaining residual smell was narrower: Stage 5 still owned too much local family arbitration after upstream truth already existed, especially around compare/review/add-ready shaping and selector-needed degradation. The lane was opened to make Stage 5 obey upstream `commercial_move` more directly, own less local family switching, and preserve selector-needed as a real safety family without widening upstream vocabulary or reopening broader architecture.
**Implementation / Audit Sequence:**
1. **Accepted production thinning landed** - commit `04a0c3faa301c7ed4809881faf10672b353d84fb` (`refactor cesarin stage5 upstream move obedience`) updated `src/lib/cesarin-stage5.ts` so upstream `commercial_move` now drives Stage 5 more directly, with local heuristics reduced to bounded guardrails rather than late commercial arbitration.
2. **Accepted Stage 5 regressions landed** - the same accepted production commit added focused regressions in `src/lib/__tests__/cesarin-stage5.test.ts` proving that upstream `REVIEW_ONE` is no longer re-promoted into compare mode by local fallback heuristics and that upstream `ADD_READY` only degrades to `SELECTOR_NEEDED` when a purchase-defining selector is still missing.
3. **Accepted auditability closure landed** - commit `05334e4383d60ae5f399f05038f7adecdf662bbd` (`test cesarin stage5 upstream truth runtime evidence`) added one narrow runtime regression in `src/services/__tests__/concierge.service.stage4.test.ts` proving the real service path now carries an upstream `ADD_READY` move into Stage 5 and only downgrades it to `SELECTOR_NEEDED` when selector evidence actually requires that safety guardrail.
4. **Accepted boundary stayed narrow** - the evidence-hardening follow-up was test-only. No later production behavior change was needed after the Stage 5 implementation commit.
**Accepted Final Discipline:**
- This is a bounded storefront-only Stage 5 thinning lane.
- Stage 5 now obeys upstream `commercial_move` more directly.
- Stage 5 owns materially less local family arbitration after upstream truth already exists.
- `SELECTOR_NEEDED` remains a real safety family for materially purchase-defining missing selector evidence.
- The evidence-hardening follow-up closed the only remaining auditability gap through a focused runtime regression.
- This lane does not widen `commercial_move`, does not redesign Stage 4, and does not reopen tool-selection / intent-guardrails.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full Stage 5 removal.
- This log does not claim full model-pure rendering.
- This log does not claim widened `commercial_move`.
- This log does not claim Stage 4 rewrite.
- This log does not claim planner/orchestrator work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- No lane-specific blocking residual remains after the runtime evidence hardening.
- Stage 5 still remains a real bounded realization layer with deterministic family/guidance behavior by design; that is accepted system truth, not a defect reopened by this lane.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Stage 5 Family-Resolution Thinning / Upstream Truth Obedience — ACCEPT)*

### Césarín Storefront — Availability Truth Alignment — 1 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tools.ts`, `src/lib/product-search-capsule.ts`, `src/lib/__tests__/customer-intelligence-web-tools.test.ts`, and `src/lib/__tests__/product-search-capsule.test.ts`; final runtime/storefront proof closed via `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
`INVENTORY_OUTLOOK` turns could still blur current availability with outlook, and active OOS wording still carried an unsupported future-return implication through phrasing like `temporalmente agotado`. The lane was opened to make current availability explicit first, keep projection secondary, remove unsupported return/restock implication from active OOS wording, and prove the final synthesized assistant output through the real storefront runtime path without reopening routing architecture.
**Implementation / Audit Sequence:**
1. **Prompt truth was tightened** - `persona.ts` and the Sommelier `index.ts` prompt now instruct availability turns to state current status first, keep outlook secondary, and avoid unsupported return/restock implication unless the report confirms it.
2. **Inventory truth output was separated** - `tools.ts` now emits explicit current availability and outlook fields so the runtime can preserve present truth before projection.
3. **Active OOS wording was corrected** - `src/lib/product-search-capsule.ts` removed unsupported `temporalmente agotado` implication from storefront recovery copy.
4. **Focused regressions were added** - `src/lib/__tests__/customer-intelligence-web-tools.test.ts` and `src/lib/__tests__/product-search-capsule.test.ts` now lock the availability-first / outlook-secondary / no-unsupported-return contract.
5. **Runtime storefront evidence was closed** - `src/services/__tests__/concierge.service.stage4.test.ts` now proves final synthesized assistant output for an `INVENTORY_OUTLOOK` turn preserves the accepted customer-facing truth at the service boundary.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-lane.
- Availability/outlook turns now express current availability first.
- Outlook/projection is explicitly secondary.
- Unsupported future-return implication was removed from active OOS wording.
- Runtime/storefront proof now exists through a focused regression on final `conciergeService.chat(...)` output for `INVENTORY_OUTLOOK`.
- The lane does not reopen routing architecture, Stage 4 / Stage 5 family-resolution work, storefront UI, planner/orchestrator behavior, or admin / Cesarin OS surfaces.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim Stage 4 / Stage 5 reopening.
- This log does not claim storefront UI redesign.
- This log does not claim planner/orchestrator work.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- Availability truth still depends on bounded model-led wording over the now-separated current status / outlook contract; that is accepted system truth, not a reopened defect.

*Last updated: 1 de abril de 2026 (Césarín Storefront — Availability Truth Alignment — ACCEPT)*

## Issues Diferidos Vigentes

> Estos issues estÃ¡n abiertos. Ver AI_CONTEXT.md Â§10 para la lista actual.

*Ãšltima actualizaciÃ³n: 1 de abril de 2026 (Césarín Storefront — Availability Truth Alignment — ACCEPT)*
