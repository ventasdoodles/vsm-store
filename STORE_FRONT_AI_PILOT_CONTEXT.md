# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Cesarin AI assistant.

## Current Phase & Reliability
- **Phase:** 3.2C CLOSED - Pilot Readiness Gate: **PASS (unrestricted, March 2026)**
- **Status:** **FULLY OPERATIONAL - Cleared for Unrestricted Pilot**
- **Base Build:** v113 (Wave 193 - Marketing AI Reality Repair)
- **Model Stack (canonical):**
  - Analyst / Sommelier: `gemini-2.5-pro` via Gemini API `v1`
  - Auxiliary/admin-style paths where still applicable: `gemini-2.5-flash` via Gemini API `v1`
  - Embeddings: `gemini-embedding-001` via Gemini API `v1beta` + `outputDimensionality: 3072`
  - Note: `v1` returns `404/405` for `gemini-embedding-001`; `v1beta` is the correct stable route.
- **Retrieval Quality:** High. `7/7` pilot queries routed correctly. Telemetry persisted to `ai_analytics`.
- **Sales Recovery Behavior:** Exact-product misses can recover through bounded token-based catalog matching when semantic expansion is not required. Token recovery remains useful, but it is now surfaced separately from embedding-based semantic suggestions in drafting, telemetry, and the storefront label surface.
- **Clarification-to-Conversion Behavior:** For exploratory product-seeking turns, the storefront response now tries to narrow on one useful axis first and frame the shown options as a choice only when the comparative evidence is actually supported. When product differences are weak, the storefront stays neutral instead of inventing a start-here hierarchy. This does not change retrieval architecture or S94 honesty boundaries.
- **Choice-to-Confidence Behavior:** Once the storefront already has a likely choice, the assistant may reinforce that option with short, modest confidence language only when the support is real. Weak-support cases must stay neutral, and multi-exact exact-match cases must not imply that one clear option already won unless there is truly only one exact in-stock match.
- **Confidence-to-Cart Behavior:** Storefront handoff strength must now match branch support honestly. Weak-support fallback cases should stay at review/PDP level, while stronger exact or support-backed paths may progress naturally into review-then-cart wording. Cart-adjacent language must not appear just because only one fallback product survived.
- **Objection-to-Recovery Behavior:** Late-stage objections should now recover locally inside the already narrowed branch instead of resetting the funnel. `cheaper`, `worth_it`, hesitation, and nearby-alternative handling must stay grounded in current branch support, only one nearby alternative should appear when justified, and objection paths should stay persuasive but conservative on action strength.
- **Recovery-to-Commitment Behavior:** After a grounded objection recovery already exists inside a narrowed branch, the storefront may now add a stronger commitment-ready close only when that recovery is support-backed. Weak-support recovery must remain conservative, and two-option recovery must stay focused on the current pair instead of reopening broader browsing.
- **Commitment-to-Checkout-Readiness Behavior:** After commitment already exists, the storefront may now add a bounded checkout-readiness step only when the readiness check itself is explicitly support-backed. This is not checkout execution or payment flow; weak and multi-option paths must stay conservative, and ordinary selectorless single-product paths must not sound checkout-ready.
- **Checkout-Readiness-to-Cart-Precision Behavior:** After checkout-readiness already exists, the storefront may now add a bounded selector-backed cart-precision step only when a materially purchase-defining selector is actually supported. This is not cart execution, checkout execution, or payment flow; selectorless strong paths must stay at readiness, and weak or multi-option paths must remain non-precise.
- **Cesarin Stage 1 Behavior:** The storefront assistant now speaks in a shorter, more oral, more honest style under uncertainty, can admit when a product/query still catches him off guard, offers a visible approximate-recovery loop (`Esta se parece mas` / `Ninguna`) when nearby products are all that can be shown truthfully, and escalates honestly to the real WhatsApp path when rescue is clearly failing. This does not add deep customer memory, autonomous learning, or fake human-support promises.
- **Cesarin Stage 2 Behavior:** Authenticated returning customers may now receive sharper recommendation continuity through lightweight taste memory over `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`. Memory use is compact and humble: current turn always overrides prior memory, weak signals stay soft, explicit rejection stays conservative, and guests still do not get fake durable memory. Historical interests no longer gain fake recency/hits just because they survived merge.
- **Cesarin Stage 3 Behavior:** The storefront now converts that same bounded taste memory into real commercial judgment for authenticated returning customers. Relevant liked profiles can lift stronger options, rejected/disliked paths can move downward, budget posture can nudge ordering conservatively, and approximate recovery inherits better top suggestions because reranking happens before the existing recovery loop. Current turn still overrides prior memory, and this remains bounded storefront behavior rather than a giant ranking engine or CRM layer.
- **Cesarin Core Refactor - Wave 1 (accepted):** The storefront/customer-intelligence core is now materially less rail-driven. Cesarin identity is slimmer and less seller-scripted, runtime separation is clearer between model reasoning, native capabilities, own functions, and UI affordances, the old main-path `UNKNOWN -> PRODUCT_SEARCH` coercion is gone, forced product-search injection is gone from the main path, and degraded Analyst fallback no longer coerces product search. This remains Wave 1 only: not Wave 2, not a catalog-gate redesign, not an anti-bloat rewrite, and not removal of all Stage 4 / Stage 5 infrastructure.
- **Cesarin Core Refactor - Wave 3 (accepted):** The storefront/customer-intelligence core is now materially catalog-gated at runtime/storefront level. An explicit catalog gate now exists in the real path, products no longer appear by reflex, clarification-first and non-catalog turns stay product-suppressed, stale product/recovery/next-step product surfaces now suppress themselves when the gate closes, and legitimate search-leading turns still keep products plus approximate recovery when justified. This remains Wave 3 only: not Wave 4 anti-bloat, not live/voice, not a giant planner/orchestrator, and not a claim that the final small persona patch alone created the whole lane.
- **Cesarin Core Refactor - Wave 4 (accepted):** The storefront/customer-intelligence core is now materially less bloated in runtime/storefront output. Explicit anti-bloat response discipline now exists in the real runtime/storefront path through `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)`; Stage 4 no longer appends an extra commercial tail when the useful move is already present; Stage 5 now keeps actionable guidance in `next_step_view` instead of reinjecting it into the main assistant text; and storefront/hook/UI now avoid redundant recovery and next-step duplication. Useful surfaces remain preserved when justified: approximate recovery, next-step help, honest WhatsApp fallback, and truthful business/action boundaries. This remains Wave 4 only: not Wave 5 tool-index work, not web-intelligence, not a planner/orchestrator redesign, not a new mode system, not a new funnel/CTA layer, and not live/voice.
- **Cesarin Core Refactor - Wave 5 (accepted):** The storefront/customer-intelligence core now has a real explicit capability box and bounded runtime capability plan. The accepted Wave 5 implementation introduced an explicit split between `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`; runtime now builds and uses `capabilityPlan`; edge execution now uses `capabilityPlan.serverToolCalls`; and intent filtering is centralized through the capability index / capability-id mapping rather than a separate hidden guardrail routing table. `public_web_search` and `public_url_context` now exist as honest reserved slots only. This remains Wave 5 only: not active Wave 6 web intelligence, not a planner/orchestrator redesign, not a storefront UI redesign, and not admin / Cesarin OS work.
- **Cesarin Core Refactor - Wave 6 Web Intelligence (Pass 1) (accepted):** The storefront/customer-intelligence core now has bounded active public-web intelligence inside the accepted capability box. `public_web_search` and `public_url_context` are now real active `NATIVE_PUBLIC` capabilities; `MODEL_KNOWLEDGE` remains the default when external lookup is unnecessary; `OWN_FUNCTION` still wins for private truth, internal state, and real action; `PUBLIC_INFO` is non-catalog; and public-web execution stays bounded through `capabilityPlan.serverToolCalls` rather than a new planner/orchestrator. Public-web use remains compact, policy-gated, and non-reflexive. This remains Wave 6 Pass 1 only: not full web-intelligence completion, not a storefront UI redesign, and not admin / Cesarin OS work.
- **Cesarin Core Refactor - Wave 6 Web Intelligence (Pass 2) (accepted):** The storefront/customer-intelligence core now includes one accepted honesty/visibility micro-pass over Wave 6 Pass 1. Successful `public_web_search` / `public_url_context` executions may now surface compact `source_context` in bounded form: small public-context indicator, optional brief, and up to 2 normalized public sources. That provenance appears only when public web actually ran successfully, `PUBLIC_INFO` remains non-catalog, product/recovery/next-step product surfaces remain suppressed on the relevant storefront path, the storefront contract stays materially intact with only a narrow extension, and legacy public-web helpers remain deprecated compatibility-only rather than the active primary path. This is Pass 2 only: not a citation framework, not a storefront UI redesign, and not full Wave 6 completion.
- **Cesarin Core Refactor - Wave 6 Web Intelligence (Final Micro-Pass) (accepted):** The storefront/customer-intelligence core now includes the final accepted Wave 6 hygiene closure. Explicit negative-path proof now exists that ordinary non-public-web turns do not surface `source_context`, dead legacy `public_web_search_legacy` / `public_url_context_legacy` plus their legacy-only shim path are removed, compact public-context provenance still appears only when public web actually ran successfully, `PUBLIC_INFO` remains non-catalog, and the active public-web path remains the bounded primary runtime path only. This is final Wave 6 hygiene only: not a new architecture lane, not a citation framework, not a storefront UI redesign, and not full Wave 6 expansion.
- **Cesarin Core Refactor - Wave 7 Memoria y Contexto Blando (accepted):** The storefront/customer-intelligence core now has bounded soft continuity. Runtime can now reuse recent session context, authenticated `ia_context`, and lightweight existing memory context more usefully, but continuity remains soft, compact, humble, and optional; topic/lane shift suppresses stale continuity push; the current turn stays sovereign; continuity does not reopen catalog by itself; guests still do not get fake durable memory; and authenticated continuity remains lightweight rather than deep transcript memory or a CRM-style layer. This remains Wave 7 only: not a storefront UI redesign, not a planner/orchestrator redesign, and not deep memory infrastructure.
- **Cesarin Core Refactor - Post-Refactor Convergence / Hardening Wave (accepted):** The storefront/customer-intelligence core now runs on a cleaner converged concierge baseline. Analyst / Sommelier are explicitly aligned to `gemini-2.5-pro`, auxiliary/admin-style paths may still stay on auxiliary Flash where applicable, the capability box is now the clearer primary routing authority in Analyst prompting, final-answer ownership is cleaner, and stale conversational prefix is explicitly suppressed through shared runtime logic on `ASK_CLARIFYING_QUESTION`, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap. This remains convergence/hardening only: not a new architecture lane, not a storefront UI redesign, not a new commercial UX lane, not live/voice, and not admin / Cesarin OS work.
- **Césarín Storefront - Commercial Visibility / UX Effectiveness Wave (accepted):** The storefront assistant now expresses customer-facing help more clearly without reopening core rails or redesigning the storefront from zero. Visible help differentiation is now active through only four compact truthful labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`; `Siguiente paso` is clearer when support is real; Stage 5 copy is more customer-facing without becoming pushy; product help remains catalog-gated; public context remains bounded to real public-web support; actionable help remains distinct from product pressure; and suppressed/non-catalog turns do not get mislabeled as product help. This remains a bounded visible storefront pass only: not measured conversion uplift, not a storefront redesign, and not a funnel engine.
- **Césarín Storefront - Commercial Outcome Hardening Wave (accepted):** The storefront assistant now also hardens commercial outcome choice itself rather than only making it more visible. Stage 5 now explicitly grades support as `weak`, `supported`, or `strong`; weak or approximate cases stay humbler and more exploratory/review-first; `ADD_READY` is tightly restricted to genuinely strong single-product support; two viable products stay compare-worthy more often; weak single-product support stays review-first instead of action-ready; and true add-ready help may now surface more clearly as `Paso accionable` while ordinary catalog-open product help still remains `Ayuda de producto`. This remains a bounded storefront/customer-facing improvement lane only: not measured conversion uplift, not a ranking engine, not a funnel engine, and not a storefront redesign from zero.
- **Césarín Storefront - Trust & Transparency Hardening Wave (accepted):** The storefront assistant now also makes recommendation posture easier to read through compact visible trust signaling. Stage 5 guidance now uses clearer human trust-language, and the UI now helps users read the difference between weak exploratory help, compare-worthy help, prudent review-first help, and clearer add-ready help through subtle notes such as `Todavia estamos afinando`, `Las dos traen buen caso`, `Es la mejor pista por ahora`, `Es la ruta mas clara`, `Ya va bien encaminado`, and `Ya viene bien amarrado`. Public-context turns remain isolated from product-confidence language, catalog-closed lanes remain closed, and this remains a bounded trust/clarity pass only: not a confidence score system, not a confidence meter, not a badge zoo, not a debug taxonomy surface, and not measured trust/conversion uplift.
- **CÃ©sarÃ­n Storefront - Decision Flow Naturalization Wave (accepted):** The storefront decision flow now follows upstream posture more naturally instead of leaning on older storefront forcing. `turnAnalysis` now materially informs storefront stage shaping, Stage 4 follows upstream model posture more closely, the storefront service no longer forces the old `EXPLORE_LIGHT` fallback through `modeHint`, regex/helper duplication between Stage 4 and Stage 5 is materially reduced, and the accepted weak-support semantic/approximate single-candidate regression is now closed so humble `KEEP_EXPLORING` is preserved when upstream posture still remains `GUIDED_COMPARE`. This remains a bounded storefront naturalization lane only: not full heuristic removal, not full model-pure family resolution, not a planner/orchestrator redesign, and not a storefront redesign from zero.
- **Coverage:** products `44/44 (100%)` and `store_knowledge 23/23 (100%)` - all `3072d` vectors.
- **Cesarin Stage 4 Behavior:** The storefront still adapts the main commercial/product-search conversation shape through bounded modes `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE`, but storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime dependency. Strong-signal turns can still get shorter/cleaner recommendations, compare turns stay grounded, hesitation gets reassurance instead of reset, and broad weak-memory turns stay exploratory. This remains bounded primarily to the main commercial/product-search lane, not all Cesarin behavior.
- **Cesarin Stage 5 Behavior:** The storefront now also resolves one bounded next actionable storefront step after recommendation through `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`. Stage 5 runs after Stage 3 reranking and Stage 4 posture shaping, hydrates real product data before deciding the next move, attaches `next_step_view` to the capsule contract, and renders a real `Siguiente paso` block in the UI using existing `OPEN_PDP` and `ADD_TO_CART` storefront actions only when support is real. Compare/exploration remain honest when close is not justified, selector-needed stays grounded in real product/variant evidence, and current-turn intent can still block stale memory/posture from forcing action confidence.

## Wave 2 Operating Truth
- Cesarin is now materially turn-first at the runtime/storefront behavior level.
- Runtime computes a bounded current-turn profile with `primary_intent`, `secondary_intents`, `turn_priority`, `current_turn_decision`, `turn_focus`, `primary_tool_calls`, and `queued_tool_calls`.
- Runtime acts from `primary_intent` and filters tool calls to the primary lane.
- Mixed-intent turns are handled in a bounded truthful way: one primary need is resolved first while secondaries remain queued context.
- Current-turn needs can override stale prior-lane momentum.
- Storefront search/product/recovery/next-step product surfaces suppress themselves when the current turn is no longer search-first.
- Wave 1 gains remain preserved: lightweight memory, approximate recovery, honest WhatsApp fallback, truthful business/action boundaries, and honest guest non-persistence.
- Non-claims remain explicit: no Wave 4 anti-bloat, no new mode system, no giant planner/orchestrator, and no live/voice work.

## Wave 3 Operating Truth
- Cesarin is now materially catalog-gated at the runtime/storefront behavior level.
- `resolveCatalogGate(...)` exists in `supabase/functions/customer-intelligence/intent-guardrails.ts`, runtime consumes it in `supabase/functions/customer-intelligence/index.ts`, storefront normalizes/applies it in `src/services/concierge.service.ts`, the hook carries/respects it in `src/hooks/useAIConcierge.ts`, and the UI suppresses product surfaces from it in `src/components/ui/ai/AIConcierge.tsx`.
- Clarification-first behavior is real: `ASK_CLARIFYING_QUESTION` and `UNKNOWN` close the gate, and search tools are stripped from the capability plan when the gate is closed.
- When the gate is closed, products are cleared, `resolved_products` are cleared, `next_step_view` is nulled, and stale product/recovery/next-step product surfaces are suppressed.
- Legitimate search-leading turns still surface products and approximate recovery when the current turn is clear enough and product help is materially justified.
- Wave 1 and Wave 2 gains remain preserved underneath the gate.
- Non-claims remain explicit: no Wave 4 anti-bloat, no live/voice, no giant planner/orchestrator, no admin / Cesarin OS drift, no total removal of all prior helper shaping, and no claim that the final tiny persona patch alone implemented the whole lane.

## Wave 4 Operating Truth
- Cesarin is now materially less bloated at the runtime/storefront behavior level.
- Explicit anti-bloat structure now exists in the real path through `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)`.
- Césarín now tends toward one useful move, less duplicated guidance, and fewer robotic commercial tails.
- Stage 4 no longer appends an extra commercial tail when the useful move is already present.
- Stage 5 keeps actionable guidance in `next_step_view` instead of duplicating the same move in main text.
- Storefront rendering no longer re-bloats runtime output with redundant recovery and next-step echo.
- Useful surfaces remain preserved when justified: approximate recovery, next-step help, honest WhatsApp fallback, and truthful business/action boundaries.
- Non-claims remain explicit: no Wave 5 tool-index work, no web-intelligence, no planner/orchestrator redesign, no new mode system, no new funnel/CTA layer, no live/voice, and no admin / Cesarin OS drift.

## Wave 5 Operating Truth
- Cesarin now has a real explicit capability/tool index at the storefront/customer-intelligence core layer.
- The accepted split is now explicit and real: `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
- Runtime now builds and uses a bounded `capabilityPlan`.
- Edge execution now uses `capabilityPlan.serverToolCalls`.
- Intent filtering is now centralized through the capability index / capability-id mapping rather than a separate hidden guardrail routing table.
- Wave 5 established `public_web_search` and `public_url_context` as explicit public capability slots; Wave 6 Pass 1 now activates those slots in bounded form.
- Wave 2 turn-first behavior, Wave 3 catalog gate, and Wave 4 anti-bloat remain preserved under the new capability plan.
- Storefront contract remained stable; no storefront UI redesign was required for Wave 5.
- Non-claims remain explicit: no Wave 6 web intelligence completion, no planner/orchestrator redesign, no live/voice, no admin / Cesarin OS drift, and no storefront UI redesign.

## Wave 6 Operating Truth
- Cesarin now has bounded active public-web intelligence at the storefront/customer-intelligence core layer.
- `public_web_search` and `public_url_context` are now real active `NATIVE_PUBLIC` capabilities inside the existing capability box.
- Public web remains policy-gated and non-reflexive: `MODEL_KNOWLEDGE` stays the default when stable reasoning is enough, and `OWN_FUNCTION` still wins for private truth, internal state, and real action.
- `public_url_context` is limited to explicit URL/page-context turns, and `public_web_search` is limited to genuine public/fresh/external-info turns.
- Clarify-first turns suppress public web, and `PUBLIC_INFO` is explicitly non-catalog, so public web does not reopen product surfaces when the catalog gate is closed.
- Runtime execution remains bounded through `capabilityPlan.serverToolCalls`, and public-web synthesis remains compact and explicitly external rather than impersonating private/internal truth.
- Successful public-web turns may now surface compact truthful `source_context`: a small public-context indicator, optional brief, and up to 2 normalized public sources.
- Explicit negative-path proof now exists that ordinary non-public-web turns do not show compact public-context provenance.
- That provenance remains bounded and optional; it is not a citation wall or source dashboard.
- Storefront contract remained materially intact; only a narrow contract extension was added for Pass 2.
- Legacy `public_web_search_legacy` / `public_url_context_legacy` are removed.
- The active public-web path is the bounded primary runtime path only.
- Wave 2 turn-first behavior, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 5 capability-box structure, and neutral degraded Analyst fallback remain preserved.
- Storefront contract remained materially stable; no storefront UI redesign was required for Wave 6 Pass 1 or Pass 2.
- Non-claims remain explicit: this is Wave 6 Pass 1 plus Pass 2 plus final hygiene only, not full web-intelligence completion, not a citation framework, not a planner/orchestrator redesign, not live/voice, and not admin / Cesarin OS drift.

## Wave 7 Operating Truth
- Cesarin now has bounded soft continuity at the runtime/storefront behavior level.
- Runtime can reuse recent session context, authenticated `ia_context`, and lightweight existing memory context.
- Continuity remains soft, compact, humble, and optional rather than rigid or transcript-like.
- The current turn remains sovereign; continuity may inform, but it does not hijack the turn.
- Topic/lane shift suppresses stale continuity push.
- Continuity does not reopen catalog by itself.
- Guest non-persistence remains honest.
- Authenticated continuity remains lightweight rather than deep transcript memory or a CRM-style memory layer.
- Wave 2 through Wave 6 foundations remain preserved.
- Non-claims remain explicit: no deep memory platform, no storefront UI redesign, and no planner/orchestrator redesign.

## Post-Refactor Convergence / Hardening Operating Truth
- The storefront concierge baseline is now explicitly `gemini-2.5-pro` for Analyst and Sommelier.
- Auxiliary/admin-style paths may still remain on auxiliary Flash where applicable.
- The capability box is now the clearer primary routing authority in Analyst prompting.
- Final-answer ownership is cleaner across bounded public web, soft continuity, and storefront shaping.
- Shared runtime logic now suppresses stale conversational prefix on `ASK_CLARIFYING_QUESTION`, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
- Soft continuity no longer stacks on clarify-first or grounded public-web turns.
- `PUBLIC_INFO` remains non-catalog.
- Wave 2 turn-first behavior, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 5 capability-box boundedness, Wave 6 bounded public web, Wave 7 soft continuity, own-function priority, and neutral degraded fallback remain preserved.
- Non-claims remain explicit: no storefront UI redesign, no new commercial UX lane, no voice/live work, no admin / Cesarin OS drift, and no total rail removal claim everywhere.

## Storefront Commercial Visibility / UX Effectiveness Operating Truth
- Visible help differentiation is now active in the storefront assistant UI.
- Customers can now more clearly tell what kind of help they are getting through only four compact labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
- Those labels remain bounded and subtle rather than becoming a badge zoo.
- `Contexto publico` appears only when public web actually produced real `source_context`.
- `Ayuda de producto` remains catalog-gated and only appears when catalog/product surfaces are truly open.
- `Paso accionable` remains distinct from product pressure and only appears for real action-oriented help.
- Suppressed/non-catalog turns do not get mislabeled as product help.
- `Siguiente paso` is now more customer-clear when support is real, but remains truthfully gated rather than becoming a reflexive pressure block.
- Stage 5 copy is clearer and more customer-facing without becoming pushy.
- Wave 2 turn-first behavior, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 6 bounded public web, Wave 7 soft continuity, and truthful private/action boundaries remain preserved.
- Non-claims remain explicit: no measured conversion uplift, no storefront redesign from zero, no funnel-engine creation, and no broader storefront redesign claim.

## Storefront Commercial Outcome Hardening Operating Truth
- Commercial outcome selection is now stronger and more truthful in the live storefront path.
- Explore / compare / review / add-ready states are now more clearly distinguished by real support strength instead of collapsing too early into action-ready framing.
- Stage 5 now explicitly grades support as `weak`, `supported`, or `strong`.
- Weak or approximate support remains humble and exploratory/review-first.
- `ADD_READY` now appears only when support is genuinely strong, single-product, and materially action-ready.
- Compare-worthy turns stay compare-worthy more often instead of being prematurely collapsed into action-ready help.
- Weak single-product support remains review-first rather than sounding cart-ready.
- True add-ready help may now surface more clearly as `Paso accionable`, while ordinary catalog-open product help still remains `Ayuda de producto`.
- Product pressure is not reopened on closed lanes.
- Non-claims remain explicit: no measured conversion uplift, no ranking engine, no funnel automation, and no storefront redesign from zero.

## Storefront Trust & Transparency Hardening Operating Truth
- Visible trust signaling is now active in the storefront assistant UI.
- Users can now better read the posture behind compare / review / add-ready guidance.
- Trust signals remain subtle and compact rather than becoming a debug or scoring surface.
- Weak-support states now read more humbly rather than merely sounding uncertain.
- Compare-worthy states now read more intentionally compare-worthy.
- Review-first states now read more prudent and useful rather than timid.
- Strong add-ready states now read clearer without becoming pushy.
- Public-context turns remain isolated from product-confidence signaling.
- Catalog-closed lanes remain closed.
- Non-claims remain explicit: no measured trust uplift, no measured conversion uplift, no confidence score/dashboard claim, and no storefront redesign from zero.

## Storefront Decision Flow Naturalization Operating Truth
- Decision flow now feels materially more natural in the accepted storefront baseline.
- `turnAnalysis` now materially informs storefront stage shaping.
- Stage 4 follows upstream model posture more closely instead of leaning on older storefront forcing.
- The storefront service no longer forces the old `EXPLORE_LIGHT` fallback through `modeHint`.
- Weak-support semantic/approximate single-candidate paths now preserve humble `KEEP_EXPLORING` when upstream posture remains `GUIDED_COMPARE`.
- Regex/helper duplication between Stage 4 and Stage 5 was materially reduced.
- Catalog gate, anti-bloat, bounded public web, bounded soft continuity, visible help differentiation, commercial outcome hardening, trust signaling, and truthful private/action boundaries remain preserved.
- Non-claims remain explicit: no full heuristic removal, no full model-pure family resolution, no planner/orchestrator redesign, and no storefront redesign from zero.

## Visibility Rules (Dual Gate)
The assistant appears in the storefront IFF BOTH are true:
1. **Global Kill Switch:** Enabled in Admin (Cesarin OS Header).
2. **Pilot Session Gate:** Activated per browser via URL param.

## Pilot Activation Methods
To enable the assistant for testing or a specific pilot user:

### A. URL Parameter (Browser-Only)
1. Open the storefront URL.
2. Append `?pilot=cesarin` to the path.
3. Access is persisted in `sessionStorage` for the duration of the session.

### B. Admin Launcher (PWA-Optimized)
1. Login with an admin account.
2. Open the **User Profile Menu** (Desktop) or **Mobile Sidebar Menu**.
3. Select **"Ir a Admin (Cesarin OS)"**.
4. Inside Admin, go to **8. Piloto Operativo** and click **"Enable Pilot Session"**.
5. Return to the storefront to see the active pilot badge.

## Recommended Manual Pilot Flow
1. **Activate:** Use the pilot URL param.
2. **Interact:** Test commercial inquiries (vapes, extracts, stock, shipping).
3. **Verify:** Check if the assistant follows the Sommelier persona rules, resolves the current turn first, handles one primary need before leaving secondary context queued naturally, only opens catalog/product surfacing when the current turn actually justifies it, and now keeps the final answer materially compact. Clarification-first turns should stay clarification-first instead of showing premature products; policy, logistics, compatibility, tracking, post-sale, greeting, and other non-search-primary turns should stay product-suppressed; search-leading turns that are already clear enough may still show useful products and approximate recovery; and when the turn changes away from search-first, stale search/product/recovery/next-step product surfaces should suppress themselves instead of dragging the conversation back. Capability use should now also look explicit and bounded: small-talk/clarification/model-only turns should not activate unnecessary tools, private-truth lanes should stay explicit, explicit URL/page-context turns may use bounded `public_url_context`, genuine public/fresh/external-info turns may use bounded `public_web_search`, and public web must stay compact, non-reflexive, and non-catalog. When public web actually ran successfully, the storefront may now show compact public-context provenance, but it should remain small, bounded, and optional rather than turning into a source wall; ordinary non-public-web turns should not show that provenance at all. Soft continuity should now also feel useful but humble: recent session context or lightweight authenticated context may be reused to avoid repetition, but topic/lane shift should suppress stale continuity push, the current turn must stay sovereign, and continuity must not reopen catalog by itself or sound like deep CRM memory. Convergence hardening should also now be visible: Analyst / Sommelier should behave like the Gemini 2.5 Pro concierge baseline, the capability box should read as the primary routing authority rather than a hidden manual rail, and stale continuity prefix should not stack on clarify-first turns or grounded public-web turns that already carry `source_context`. This visible storefront pass should now also be easy to feel in the UI: customers should be able to tell, in a light-touch way, whether they are getting `Guia directa`, bounded `Contexto publico`, catalog-gated `Ayuda de producto`, or real `Paso accionable`; those labels must stay subtle and truthful rather than becoming a badge zoo; `Siguiente paso` should read more clearly when support is real; suppressed/non-catalog turns must not get mislabeled as product help; and none of this should imply measured conversion uplift or a storefront redesign. Main answer text should still avoid repeating the same move as response plus `Siguiente paso` plus closing tail; Stage 4 should not append an extra seller tail when the useful move is already there; Stage 5 guidance should stay primarily in `next_step_view`; weak fallback cases should stay at review/PDP level; stronger exact or support-backed cases may move naturally toward cart; multi-exact cases must not imply that one clear option already won; objection paths should stay grounded, narrow, and conservative on action strength; once a grounded objection recovery exists, only strong-support recovery may tighten into a more commitment-ready close, while weak-support and two-option recovery must stay conservative and non-browsing; checkout-readiness may appear only when the final readiness check is explicitly support-backed, and it must never imply checkout execution or payment flow; cart precision may appear only when a materially purchase-defining selector is actually supported, and it must never imply cart execution, checkout execution, or payment flow.
   Commercial outcome hardening should now also be visible in the real flow: weak or approximate support should stay humble, review-first, or exploratory; two viable products should stay compare-worthy more often instead of collapsing prematurely into action-ready framing; weak single-product support should still read as review-first rather than cart-ready; and true add-ready help should appear only when support is genuinely strong and single-product.
   Trust and transparency hardening should now also be visible in the real flow: users should be able to read why help still feels exploratory, why two options are worth comparing, why review-first is prudent, and why add-ready support feels steadier when it is real; those signals must stay compact, human-facing, and subtle, must not appear as a confidence score or debug taxonomy, and public-context turns must stay isolated from product-confidence language.
   Decision-flow naturalization should now also be visible in the real flow: posture wiring should follow upstream turn truth more closely, the old forced storefront exploration fallback should no longer appear by reflex, and weak-support semantic/approximate single-candidate paths should stay humbly in `KEEP_EXPLORING` when the accepted upstream posture is still compare-leaning rather than collapsing prematurely into review confidence.
4. **Audit:** Go to Admin > Cesarin OS > Piloto Operativo and log the pass/fail result.
5. **Monitor:** Review `ai_analytics` for `capsule_match_strategy`, `capsule_retrieval_source`, `semantic_match_success`, `fallback_used`, and `product_card_count` so token recovery, semantic recovery, and fallback behavior are not conflated.
6. **Troubleshoot:** Use the **Runtime Parity Hygiene** dashboard in the admin panel to verify build fingerprints and PWA vs Browser state. Use **"Enable Pilot Session"** to jumpstart the pilot gate without editing the URL (ideal for installed PWAs). Use **"Clear Pilot Session"** if activation flags get stuck.

## Known Constraints
- **Quota/Latency:** Free tier Gemini API may experience `429` errors or latency spikes.
- **Memory:** Conversation history is still session-scoped, but the storefront/customer-intelligence core now also has bounded soft continuity over recent session context plus lightweight authenticated context. Authenticated storefront customers still have compact persistent taste memory/preference context that can influence continuity and recommendation order in a bounded way. Guests still reset fully with session loss and do not have durable cross-session memory.
- **Deployment Drift (Resolved):** Previous appearances of regression (`404` errors) during the Wave 191 cycle were purely deployment drift caused by testing slim Edge Functions with the deprecated `gemini-1.5-flash` model. Resolved at Wave 191 closure. The current accepted concierge baseline is now `gemini-2.5-pro` for Analyst / Sommelier, while auxiliary/admin-style paths may still remain on auxiliary Flash where applicable.
- **Analyst Refinement Success (Wave 189/191):** Abstract queries (price+flavor combos) now show significantly improved direct classification by the Analyst. `PASS_WITH_WARNING` events are non-blocking and represent minor intent edge cases (for example inventory phrasing `queda stock` overlapping with `COMPATIBILITY_CHECK`), not functional failures. Intent precedence may need later tuning.
- **Cart Completion Rate:** Currently `0%` via concierge - checkout-via-concierge not yet wired to payment flow.

## Non-Negotiable Rules
- **DO NOT** disable the pilot gate for all users without high-level approval.
- **DO NOT** hardcode the pilot bypass in `App.tsx`.
- **DO NOT** leak raw technical error messages to the customer.
- **Brain-First Capsule Rule (v106 canon, Stage 1 adjusted):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. Weak storefront turns should still be rescued when real product, inventory, policy, or greeting signals exist, but `UNKNOWN` may remain honestly unresolved when no real rescue signal is present.

## Brain-First Guardrail State (Wave 3 reconciled - 29 mar 2026)
The deterministic storefront edge layer is still allowed to preserve truthful boundary behavior, but product-search coercion is no longer the fallback spine of the system:
- Main-path weak-intent `UNKNOWN -> PRODUCT_SEARCH` coercion is removed.
- Forced product-search injection is removed from the main path.
- Real edge rescue remains allowed for truthful boundary lanes such as policy, inventory, and greeting signals.
- Real product guidance can still happen when the model actually asks for capability help or when truthful storefront evidence materially supports it.
- If no real rescue signal exists, the turn may remain honestly unresolved instead of being pushed into catalog guidance by reflex.
- If the Analyst degrades, the accepted neutral fallback now returns `intent: 'UNKNOWN'`, `turn_decision: 'ASK_CLARIFYING_QUESTION'`, `tool_calls: []`, and `fallback_reason: 'ANALYST_DEGRADED'`.

### Wave 2 Guardrail Addendum
- Runtime/storefront behavior is now materially turn-first.
- Runtime computes a bounded current-turn profile and acts from `primary_intent`.
- Secondary intents remain bounded queued context; they are not deep parallel execution.
- Tool calls are filtered to the primary lane.
- Current-turn needs can override stale prior-lane momentum.

### Wave 3 Guardrail Addendum
- Runtime/storefront behavior is now materially catalog-gated.
- `ASK_CLARIFYING_QUESTION` and `UNKNOWN` close the catalog gate.
- When the gate is closed, search tools are stripped from the capability plan.
- When the gate is closed, products are cleared, `resolved_products` are cleared, `next_step_view` is nulled, and stale product/recovery/next-step product surfaces are suppressed.
- Legitimate search-leading turns may still surface products and approximate recovery when the current turn materially justifies that help.

### Wave 4 Guardrail Addendum
- Runtime/storefront behavior is now materially less bloated.
- Explicit anti-bloat shaping now exists through `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)`.
- The same move should no longer be duplicated across main text, next-step guidance, and closing tails.
- Stage 4 no longer adds an extra commercial tail when the useful move is already present.
- Stage 5 keeps the actionable move in `next_step_view` instead of repeating it in the main assistant text.
- Useful help remains preserved when justified: approximate recovery, next-step help, and honest WhatsApp fallback.

### Wave 5 Guardrail Addendum
- Runtime/storefront behavior now includes an explicit consultable capability box.
- Intent filtering now routes through the capability index / capability-id mapping instead of a separate hidden guardrail routing table.
- Guardrails remain border policy and do not reintroduce product-search coercion.
- Wave 5 made the public-web slots explicit; Wave 6 Pass 1 activates them in bounded form through the existing capability path.
- Storefront contract remained stable; no user-visible UI redesign was required for this lane.

### Wave 6 Guardrail Addendum
- Runtime/storefront behavior now includes bounded active public-web intelligence.
- Public web remains policy-gated and non-reflexive; guardrails do not force it for greeting, ambiguity, or clarify-first turns.
- `OWN_FUNCTION` still wins for private truth, internal state, and real action.
- `PUBLIC_INFO` is non-catalog, so public web does not reopen product surfaces when the catalog gate is closed.
- Public-web execution stays bounded through `capabilityPlan.serverToolCalls`; this is not a planner/orchestrator layer.
- Successful public-web turns may surface compact truthful `source_context`, but only when public web actually ran successfully.
- Ordinary non-public-web turns do not surface `source_context`.
- That provenance remains bounded and optional rather than a citation framework or source wall.
- Legacy public-web helpers are removed; the active public-web path is the bounded primary runtime path only.

### Wave 7 Guardrail Addendum
- Runtime/storefront behavior now includes bounded soft continuity.
- Soft continuity may reuse recent session context, authenticated `ia_context`, and lightweight existing memory context.
- The current turn remains sovereign; continuity may inform, but it does not hijack the turn.
- Topic/lane shift suppresses stale continuity push.
- Continuity does not reopen catalog by itself and does not override own-function priority or bounded public-web policy.
- Guests still do not get fake durable memory.
- Authenticated continuity remains lightweight rather than deep transcript memory or a CRM-style layer.

### Post-Refactor Convergence / Hardening Guardrail Addendum
- The storefront concierge baseline is now explicitly Gemini 2.5 Pro for Analyst and Sommelier.
- The capability box is now the clearer primary routing authority in Analyst prompting; this did not create a new planner or hidden routing tree.
- Shared runtime suppression now blocks stale conversational prefix on clarify-first turns, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
- Soft continuity therefore remains helpful without stacking on top of the current turn.
- `PUBLIC_INFO` remains non-catalog, bounded public web remains non-reflexive, and own-function priority still wins for private truth or real action.

### Storefront Commercial Visibility / UX Effectiveness Guardrail Addendum
- Visible help differentiation is now part of the accepted storefront truth, but it remains bounded to four subtle labels only: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
- `Contexto publico` appears only when real bounded public-web support produced `source_context`.
- `Ayuda de producto` remains catalog-gated; suppressed/non-catalog turns do not get mislabeled as product help.
- `Paso accionable` remains distinct from product pressure and only appears for real action-oriented support.
- `Siguiente paso` is clearer when support is real, but it remains truthfully gated rather than becoming a reflexive pressure block.
- This storefront pass does not claim measured uplift, does not create a funnel engine, and does not redesign the storefront from zero.

### Storefront Commercial Outcome Hardening Guardrail Addendum
- Commercial outcome selection is now stricter and more truthful in the storefront path.
- Weak or approximate support must stay humble rather than sounding action-ready.
- Two viable products should remain compare-worthy more often instead of collapsing prematurely into one winner.
- `ADD_READY` only appears when support is genuinely strong, single-product, and materially action-ready.
- Weak single-product support stays review-first rather than cart-ready.
- `Paso accionable` therefore remains action-ready help, not generic product pressure.
- Product pressure is not reopened on closed lanes.
- This storefront wave does not claim measured conversion uplift, does not create a ranking engine, and does not create funnel automation.

### Storefront Trust & Transparency Hardening Guardrail Addendum
- Visible trust signaling is now part of accepted storefront truth, but it remains subtle and customer-facing.
- Stage 5 guidance now communicates posture more clearly in human trust-language rather than internal jargon.
- Trust/posture notes must not become a confidence score, confidence meter, citation wall, debug panel, or badge zoo.
- Weak exploratory states should feel humble rather than confused.
- Compare-worthy states should feel intentionally compare-worthy rather than accidentally indecisive.
- Review-first states should feel prudent and useful rather than timid.
- Public-context turns must stay isolated from product-confidence signaling.
- Catalog-closed lanes remain closed.

### Storefront Decision Flow Naturalization Guardrail Addendum
- `turnAnalysis` now materially informs storefront stage shaping.
- Stage 4 should preserve upstream posture more faithfully instead of forcing older storefront exploration behavior by reflex.
- The old storefront `EXPLORE_LIGHT` fallback through `modeHint` is no longer part of the accepted live baseline.
- Weak-support semantic/approximate single-candidate paths must stay humble in `KEEP_EXPLORING` when upstream posture still remains `GUIDED_COMPARE`.
- Regex/helper duplication should stay reduced rather than drifting back upward between Stage 4 and Stage 5.
- Catalog gate, anti-bloat, bounded public web, bounded soft continuity, visible help differentiation, commercial outcome hardening, trust signaling, and truthful private/action boundaries remain preserved.
- This lane does not claim full heuristic removal or full model-pure family resolution.

## Capability Capsules (All Materialized)
- **Product Search Integrity Capsule** - Read-Only Blueprint
- **Knowledge & RAG Foundation Capsule** - Context/Memory Blueprint
- **Cart Operator Capsule** - Safe Mutator Blueprint
All three are fully materialized and E2E validated. The Edge Function returns `requires_client_capsule: true` for product/knowledge queries - actual DB retrieval and product card rendering happens client-side.

## Next Steps After Pilot Launch
1. Monitor `ai_analytics` weekly: `semantic_match_success`, `fallback_used`, `product_card_count`
2. Enrich `store_knowledge` with any unanswered queries observed in telemetry
3. Enable for all users (`is_ai_assistant_enabled = true`) when pilot metrics are satisfactory
4. Future: wire checkout-via-concierge to payment flow (unlocks `cart_action_detected` KPI)
