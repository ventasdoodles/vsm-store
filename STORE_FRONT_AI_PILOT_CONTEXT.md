# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Cesarin AI assistant.

## Current Phase & Reliability
- **Phase:** 3.2C CLOSED - Pilot Readiness Gate: **PASS (unrestricted, March 2026)**
- **Status:** **OPERATIONAL - PRODUCT_SEARCH Hold-Lift Achieved; AI Reliability / Evals / Operational Excellence Phase 1 accepted under the frozen harness.**
- **Current Freeze Truth:** Storefront and Cesarin OS/admin coding fronts remain closed under current scope. The accepted Phase 1 reliability lane is now closed for its defined scope as well: the authenticated harness remains the standing regression gate, and no new storefront/admin/provider implementation front is opened by this note.
- **Base Build:** v113 (Wave 193 - Marketing AI Reality Repair)
- **Model Stack (canonical for the audited storefront/customer-intelligence core path):**
  - Analyst / Sommelier: `gemini-2.5-pro` via the shared Gemini helper on Gemini API `v1beta`
  - Auxiliary/admin-style paths where still applicable: `gemini-2.5-flash`; this pilot note does not restate repo-wide API-version uniformity outside the audited core path
  - Embeddings in the audited core path: `gemini-embedding-001` via Gemini API `v1beta` + `outputDimensionality: 768`
  - Note: this `v1beta` convergence is the accepted truth for the audited `customer-intelligence` core path in this lane; it does not claim that every Gemini-consuming edge function in the repo is already converged.
- **Retrieval Quality:** Live semantic retrieval is operational again after provider access recovery, embedding repopulation completion, and the accepted downstream search-quality micro-fixes. Current accepted residual truth remains explicit: broad-query purity is not perfect and some exploratory product turns remain commercially loose, but these are no longer operational blockers.
- **Telemetry Ownership:** The storefront edge/client telemetry handshake now includes explicit `telemetry_contract` ownership signaling that reduces future drift between edge-owned and client-owned logging. Legacy signals still coexist for compatibility; this is not documented as total telemetry unification.
- **Reliability Gate:** The accepted Phase 1 authenticated harness now remains the standing regression gate for the defined runtime-quality suite. The final accepted frozen baseline is `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`. This is closure for the defined Phase 1 gate only, not a claim of permanent immunity from future drift.
- **Sales Recovery Behavior:** Exact-product misses can recover through bounded token-based catalog matching when semantic expansion is not required. Token recovery remains useful, but it is now surfaced separately from embedding-based semantic suggestions in drafting, telemetry, and the storefront label surface.
- **Current PRODUCT_SEARCH Truth:** The explicit operational hold is lifted. Live public query embeddings are aligned to `768d`, repopulation is complete, exact grounded hits no longer lose to ambiguity fallback, and weak/noisy product turns now degrade honestly to `NO_MATCH`. Residual broad-query looseness remains accepted as non-blocking follow-on tuning, not as an active hold condition.
- **Clarification-to-Conversion Behavior:** For exploratory product-seeking turns, the storefront response now tries to narrow on one useful axis first and frame the shown options as a choice only when the comparative evidence is actually supported. When product differences are weak, the storefront stays neutral instead of inventing a start-here hierarchy. This does not change retrieval architecture or S94 honesty boundaries.
- **Choice-to-Confidence Behavior:** Once the storefront already has a likely choice, the assistant may reinforce that option with short, modest confidence language only when the support is real. Weak-support cases must stay neutral, and multi-exact exact-match cases must not imply that one clear option already won unless there is truly only one exact in-stock match.
- **Confidence-to-Cart Behavior:** Storefront handoff strength must now match branch support honestly. Weak-support fallback cases should stay at review/PDP level, while stronger exact or support-backed paths may progress naturally into review-then-cart wording. Cart-adjacent language must not appear just because only one fallback product survived.
- **Variant-Level Precision / Disambiguation Behavior:** When a turn materially asks for a concrete variant-bearing attribute, the storefront now carries bounded `variant_truth` through retrieval and drafting so it can distinguish `available`, `missing`, `ambiguous`, and `unsupported` truth. This is catalog-grounded only: missing or ambiguous variant truth must downgrade confidence/readiness to PDP review or selector-needed posture, while confirmed in-stock variant truth may be surfaced more explicitly when grounded. This does not make the storefront a broad variant engine or stock oracle, and unusual phrasing still falls back to bounded catalog truth rather than invention.
- **Promotion-Awareness / Incentive Yielding Behavior:** When real active promotion truth exists, the storefront may now surface one bounded `promotion_signal` through the existing product-search message path. The accepted states are `FLASH_DEAL` and `COUPON`; flash deals are product-matched and active, while coupons are structurally valid public coupons filtered by active flag, valid date window, positive discount, max-uses not exhausted, and prior customer use when customer identity is available. This is informational only, checkout remains the final eligibility truth, no discount is auto-applied, and missing or unavailable exact variant truth still suppresses promotion pressure rather than inventing urgency.
- **Authenticated Routine Replenishment / Conversational Reorder Behavior:** When an authenticated customer expresses explicit reorder intent, the storefront may now resolve one bounded `replenishment_signal` from real authenticated order / order-item history and current catalog truth. Replenishment candidates are revalidated against current catalog reality before surfacing, `retrieval_source` may be `AUTHENTICATED_REORDER` on this path, inactive / discontinued / invalid-variant / unavailable historical items do not return as ready-to-repeat, and Stage 5 may surface `ADD_READY` only when current catalog truth still supports direct add with grounded quantity and variant intact; otherwise the path stays `REVIEW_ONE` through the existing storefront message / next-step / add-to-cart surfaces only. This remains bounded authenticated reorder help, not guest reorder memory, not a purchase-history browser, not subscriptions or predictive auto-reorder, not CRM expansion, and not checkout/payment redesign.
- **Authenticated Order Tracking / Post-Purchase Resolution Behavior:** When an authenticated customer asks post-purchase questions such as payment confirmation, order status, shipping state, or persisted guide availability, the storefront may now resolve one bounded `authenticated_order_tracking` path with `order_tracking_signal` grounded only in authenticated persisted order data. Hydration stays bounded to recent relevant orders and may support explicit order-number lookup only inside that bounded set; payment/order/tracking summaries reuse canonical storefront order/payment truth; `ORDER_TRACKING` now prefers this authenticated capsule path instead of generic fallback/policy behavior; responses stay message-only with no catalog/product help; and guest / no-order / no-tracking cases degrade honestly. This remains read-only storefront assistance only, not guest order access, not refunds/cancellations/order edits, not courier scraping, not a full order-history browser or CRM panel in chat, and not checkout/payment redesign.
- **Compatibility-to-Attachment Behavior:** When a single in-stock primary product already has strong support and the compatibility/concepts graph confirms an attachable relation, the storefront may surface one bounded compatible attachment through existing `next_step_view` / `secondaryAction` surfaces only. The attachment path is graph-backed, stays suppressed on compare / exploratory / approximate / direct factual turns, and improves basket-building without opening a second funnel. Products without graph grounding may produce no attachment offer.
- **Compatibility / Fit Verification Behavior:** When a customer explicitly asks whether one product fits another device or accessory, the storefront may now resolve one bounded `storefront_compatibility_check` path through the existing compatibility/concepts truth and only safe unambiguous cart context. The accepted states are `COMPATIBLE`, `INCOMPATIBLE`, `NEEDS_MORE_CONTEXT`, `NO_GROUNDED_MATCH`, and `REVIEW_PRODUCT`. The lane stays read-only, message-only, and surface-limited; it does not invent fit, mutate the cart, or auto-act on the answer.
- **Objection-to-Recovery Behavior:** Late-stage objections should now recover locally inside the already narrowed branch instead of resetting the funnel. `cheaper`, `worth_it`, hesitation, and nearby-alternative handling must stay grounded in current branch support, only one nearby alternative should appear when justified, and objection paths should stay persuasive but conservative on action strength.
- **Recovery-to-Commitment Behavior:** After a grounded objection recovery already exists inside a narrowed branch, the storefront may now add a stronger commitment-ready close only when that recovery is support-backed. Weak-support recovery must remain conservative, and two-option recovery must stay focused on the current pair instead of reopening broader browsing.
- **Commitment-to-Checkout-Readiness Behavior:** After commitment already exists, the storefront may now add a bounded checkout-readiness step only when the readiness check itself is explicitly support-backed. This is not checkout execution or payment flow; weak and multi-option paths must stay conservative, and ordinary selectorless single-product paths must not sound checkout-ready.
- **Checkout-Readiness-to-Cart-Precision Behavior:** After checkout-readiness already exists, the storefront may now add a bounded selector-backed cart-precision step only when a materially purchase-defining selector is actually supported. This is not cart execution, checkout execution, or payment flow; selectorless strong paths must stay at readiness, and weak or multi-option paths must remain non-precise.
- **Cart Dependency Audit Behavior:** In cart/checkout-readiness contexts, the storefront may now audit the active cart for one graph-backed missing dependency using the existing compatibility/concepts substrate. The guidance is advisory only, limited to strict dependency relations, filtered to active in-stock dependent products, suppressed when the cart already satisfies the dependency or is already blocked / in a stronger-correction state, and rendered through existing readiness surfaces only. This is not bundle mode, not multiple warnings, not variant-level or quantity-level reasoning, and not guaranteed for graphless products.
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
- **CÃ©sarÃ­n Storefront - Commercial Visibility / UX Effectiveness Wave (accepted):** The storefront assistant now expresses customer-facing help more clearly without reopening core rails or redesigning the storefront from zero. Visible help differentiation is now active through only four compact truthful labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`; `Siguiente paso` is clearer when support is real; Stage 5 copy is more customer-facing without becoming pushy; product help remains catalog-gated; public context remains bounded to real public-web support; actionable help remains distinct from product pressure; and suppressed/non-catalog turns do not get mislabeled as product help. This remains a bounded visible storefront pass only: not measured conversion uplift, not a storefront redesign, and not a funnel engine.
- **CÃ©sarÃ­n Storefront - Commercial Outcome Hardening Wave (accepted):** The storefront assistant now also hardens commercial outcome choice itself rather than only making it more visible. Stage 5 now explicitly grades support as `weak`, `supported`, or `strong`; weak or approximate cases stay humbler and more exploratory/review-first; `ADD_READY` is tightly restricted to genuinely strong single-product support; two viable products stay compare-worthy more often; weak single-product support stays review-first instead of action-ready; and true add-ready help may now surface more clearly as `Paso accionable` while ordinary catalog-open product help still remains `Ayuda de producto`. This remains a bounded storefront/customer-facing improvement lane only: not measured conversion uplift, not a ranking engine, not a funnel engine, and not a storefront redesign from zero.
- **CÃ©sarÃ­n Storefront - Trust & Transparency Hardening Wave (accepted):** The storefront assistant now also makes recommendation posture easier to read through compact visible trust signaling. Stage 5 guidance now uses clearer human trust-language, and the UI now helps users read the difference between weak exploratory help, compare-worthy help, prudent review-first help, and clearer add-ready help through subtle notes such as `Todavia estamos afinando`, `Las dos traen buen caso`, `Es la mejor pista por ahora`, `Es la ruta mas clara`, `Ya va bien encaminado`, and `Ya viene bien amarrado`. Public-context turns remain isolated from product-confidence language, catalog-closed lanes remain closed, and this remains a bounded trust/clarity pass only: not a confidence score system, not a confidence meter, not a badge zoo, not a debug taxonomy surface, and not measured trust/conversion uplift.
- **CÃƒÂ©sarÃƒÂ­n Storefront - Decision Flow Naturalization Wave (accepted):** The storefront decision flow now follows upstream posture more naturally instead of leaning on older storefront forcing. `turnAnalysis` now materially informs storefront stage shaping, Stage 4 follows upstream model posture more closely, the storefront service no longer forces the old `EXPLORE_LIGHT` fallback through `modeHint`, regex/helper duplication between Stage 4 and Stage 5 is materially reduced, and the accepted weak-support semantic/approximate single-candidate regression is now closed so humble `KEEP_EXPLORING` is preserved when upstream posture still remains `GUIDED_COMPARE`. This remains a bounded storefront naturalization lane only: not full heuristic removal, not full model-pure family resolution, not a planner/orchestrator redesign, and not a storefront redesign from zero.
- **CÃ©sarÃ­n Assistant Runtime â€” Technical Cleanup & Coherence Wave (accepted):** The storefront/runtime baseline now also includes a bounded coherence cleanup. Stage 4 no longer carries the dead `modeHint` contract, fallback `current_turn_decision` is now canonicalized through a shared resolver, service and hook are materially aligned on fallback decision truth, and legacy `conversation_mode_hint` no longer influences fallback decision posture. This remains a bounded runtime cleanup only: not a full runtime rewrite, not total fallback unification, not a planner/orchestrator lane, and not a new product behavior pass.
- **AI Platform Integrity & Runtime Convergence (accepted with minor residual risk):** The audited storefront/customer-intelligence core path now has one bounded runtime integrity/convergence pass on top of the accepted baseline. Gemini calls inside that audited core path now converge through one shared `v1beta` helper policy instead of accidental internal `v1` / `v1beta` drift, and the storefront edge/client telemetry handshake now includes explicit `telemetry_contract` ownership signaling that materially reduces future ownership drift. This pilot note keeps the residual truth explicit: the Gemini convergence here is only for the audited core path, `telemetry_contract` still coexists with legacy signals for compatibility, and the broader `knowledge-ingestor` hardening from the same lane was accepted by code inspection rather than storefront end-to-end pilot proof.
- **CÃ©sarÃ­n Storefront â€” Recovery & Friction Handling Wave (accepted):** The storefront baseline now also includes one bounded friction-reduction improvement. Weak `REVIEW_ONE` may now expose a subtle `Seguimos viendo` reentry affordance through `next_step_view.assistAction`, but only for weak-support review-first states; it stays inside the existing gated next-step surface, returns the user to the normal conversation flow through ordinary `sendMessage(...)`, and does not create a new route, parallel executor, or product-pressure lane. This remains a bounded recovery/friction pass only: not a funnel engine, not a planner/orchestrator path, not measured conversion uplift, and not full friction elimination.
- **CÃ©sarÃ­n Storefront / Assistant â€” Shaping Spine Consolidation Wave (accepted):** The storefront/runtime baseline now also includes a more coherent shaping spine. Shared text-shaping utilities are centralized in `src/lib/cesarin-text-utils.ts`; service and hook rely more directly on shared/server truth and less on local reinterpretation; `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly; and `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`. The auditability micro-fix then added focused UI regressions to explicitly guard that contract, so the prior residual is understood as auditability-only rather than active product duplication. This remains a bounded spine-consolidation lane only: not a full assistant rewrite, not perfect centralization everywhere, and not a new commercial behavior pass.
- **Current Embedding Coverage:** live embedding canon is now aligned to `768d`, and active `products` plus active `store_knowledge` are fully repopulated with no null embeddings remaining. This is current recovered runtime truth, not the earlier hold-era repopulation failure state.
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
- CÃ©sarÃ­n now tends toward one useful move, less duplicated guidance, and fewer robotic commercial tails.
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

## Storefront Technical Cleanup & Coherence Operating Truth
- The storefront/runtime baseline now uses a cleaner canonical fallback decision path.
- Stage 4 no longer depends on the old dead `modeHint` legacy contract.
- Fallback `current_turn_decision` is now canonicalized through a shared resolver.
- Service and hook are materially aligned on fallback decision truth.
- Legacy `conversation_mode_hint` no longer influences fallback decision posture.
- The pilot baseline remains preserved.
- Non-claims remain explicit: no full runtime rewrite, no total fallback unification, no new commercial rails, and no planner/orchestrator lane.

## AI Platform Integrity & Runtime Convergence Operating Truth
- The audited `customer-intelligence` core path now uses one explicit shared Gemini API helper policy.
- The truthful Gemini API version for that audited core path is now `v1beta` for generation and embeddings in this lane.
- The storefront edge/client telemetry handshake now includes explicit `telemetry_contract` ownership signaling.
- On the generic storefront service path, ownership now resolves from `telemetry_contract` first and keeps backward compatibility with older signals.
- Legacy telemetry ownership signals still exist; this is drift reduction, not total telemetry unification.
- The same accepted lane also hardened `knowledge-ingestor` in the broader IA platform, but this pilot note records that continuity of admin/service-role writes was validated by code inspection rather than storefront end-to-end pilot proof.
- No storefront UX semantics, pilot gating behavior, or commercial-behavior lane changed in this pass.
- Non-claims remain explicit: no repo-wide Gemini convergence claim and no legacy telemetry-replacement claim everywhere.

## Storefront Recovery & Friction Handling Operating Truth
- Weak review-first now has a subtle reentry path in the accepted storefront baseline.
- That reentry appears through `next_step_view.assistAction` only when `family === 'REVIEW_ONE'` and support is weak.
- The accepted visible affordance is `Seguimos viendo`.
- The reentry remains voluntary and non-pushy.
- It stays inside the existing gated next-step surface and returns to the normal conversation loop through ordinary `sendMessage(...)`.
- It does not reopen product pressure or create a parallel decision path.
- Non-claims remain explicit: no broader funnel automation, no planner/orchestrator path, no measured conversion uplift, and no claim of full friction elimination.

## Storefront Shaping Spine Consolidation Operating Truth
- Shared text-shaping utilities are now centralized in `src/lib/cesarin-text-utils.ts`.
- Service and hook rely more directly on shared/server truth and less on local reinterpretation.
- `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
  - `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`.
  - The prior UI residual was auditability-only, not active product duplication.
  - The spine is more coherent, but no claim is made that every layer is perfectly centralized.

> ## Storefront Visible Guidance Compression Operating Truth
  - Visible guidance is less repetitive in the storefront baseline.
  - Chips are now more categorical when `next_step_view` already exists.
  - `Siguiente paso` is now the primary place for useful direction when present.
  - Trust-note echoes are suppressed when equivalent guidance is already visible.
  - Weak, compare, and add-ready visible surfaces feel less mechanically explanatory as a result.
  - No global text-compression claim is made across every surface, and no product-behavior inflation comes from this UI-only cleanup.
  
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
3. **Verify:** Check if the assistant follows the Sommelier persona rules, resolves the current turn first, handles one primary need before leaving secondary context queued naturally, only opens catalog/product surfacing when the current turn actually justifies it, and now keeps the final answer materially compact. Clarification-first turns should stay clarification-first instead of showing premature products; policy, logistics, compatibility, tracking, post-sale, greeting, and other non-search-primary turns should stay product-suppressed; explicit fit questions should now resolve through the bounded compatibility check path when the fit anchor is grounded enough; search-leading turns that are already clear enough may still show useful products and approximate recovery; and when the turn changes away from search-first, stale search/product/recovery/next-step product surfaces should suppress themselves instead of dragging the conversation back. Capability use should now also look explicit and bounded: small-talk/clarification/model-only turns should not activate unnecessary tools, private-truth lanes should stay explicit, explicit URL/page-context turns may use bounded `public_url_context`, genuine public/fresh/external-info turns may use bounded `public_web_search`, and public web must stay compact, non-reflexive, and non-catalog. When public web actually ran successfully, the storefront may now show compact public-context provenance, but it should remain small, bounded, and optional rather than turning into a source wall; ordinary non-public-web turns should not show that provenance at all. Soft continuity should now also feel useful but humble: recent session context or lightweight authenticated context may be reused to avoid repetition, but topic/lane shift should suppress stale continuity push, the current turn must stay sovereign, and continuity must not reopen catalog by itself or sound like deep CRM memory. Convergence hardening should also now be visible: Analyst / Sommelier should behave like the Gemini 2.5 Pro concierge baseline, the capability box should read as the primary routing authority rather than a hidden manual rail, and stale continuity prefix should not stack on clarify-first turns or grounded public-web turns that already carry `source_context`. This visible storefront pass should now also be easy to feel in the UI: customers should be able to tell, in a light-touch way, whether they are getting `Guia directa`, bounded `Contexto publico`, catalog-gated `Ayuda de producto`, or real `Paso accionable`; those labels must stay subtle and truthful rather than becoming a badge zoo; `Siguiente paso` should read more clearly when support is real; suppressed/non-catalog turns must not get mislabeled as product help; and none of this should imply measured conversion uplift or a storefront redesign. Main answer text should still avoid repeating the same move as response plus `Siguiente paso` plus closing tail; Stage 4 should not append an extra seller tail when the useful move is already there; Stage 5 guidance should stay primarily in `next_step_view`; weak fallback cases should stay at review/PDP level; stronger exact or support-backed cases may move naturally toward cart; multi-exact cases must not imply that one clear option already won; objection paths should stay grounded, narrow, and conservative on action strength; once a grounded objection recovery exists, only strong-support recovery may tighten into a more commitment-ready close, while weak-support and two-option recovery must stay conservative and non-browsing; checkout-readiness may appear only when the final readiness check is explicitly support-backed, and it must never imply checkout execution or payment flow; cart precision may appear only when a materially purchase-defining selector is actually supported, and it must never imply cart execution, checkout execution, or payment flow.
   Commercial outcome hardening should now also be visible in the real flow: weak or approximate support should stay humble, review-first, or exploratory; two viable products should stay compare-worthy more often instead of collapsing prematurely into action-ready framing; weak single-product support should still read as review-first rather than cart-ready; and true add-ready help should appear only when support is genuinely strong and single-product.
   Trust and transparency hardening should now also be visible in the real flow: users should be able to read why help still feels exploratory, why two options are worth comparing, why review-first is prudent, and why add-ready support feels steadier when it is real; those signals must stay compact, human-facing, and subtle, must not appear as a confidence score or debug taxonomy, and public-context turns must stay isolated from product-confidence language.
   Decision-flow naturalization should now also be visible in the real flow: posture wiring should follow upstream turn truth more closely, the old forced storefront exploration fallback should no longer appear by reflex, and weak-support semantic/approximate single-candidate paths should stay humbly in `KEEP_EXPLORING` when the accepted upstream posture is still compare-leaning rather than collapsing prematurely into review confidence.
   Technical cleanup and coherence should now also be visible in the real baseline: Stage 4 should no longer depend on the old `modeHint` contract, fallback turn decision should stay canonical instead of leaking legacy hint strings, and `conversation_mode_hint` should no longer influence fallback decision posture when upstream turn analysis is missing.
   Recovery and friction handling should now also be visible in the real baseline: weak review-first should expose a subtle voluntary reentry path through `Seguimos viendo`, that reentry should stay inside the existing gated next-step surface, and it should return the user to the ordinary conversation loop without creating product pressure or a parallel decision path.
   Shaping spine consolidation should now also be visible in the real baseline: shared text-shaping utilities should stay centralized in `cesarin-text-utils.ts`, service/hook should rely on shared/server truth more directly, `buildConciergeCatalogGate(...)` should stay thinner, and the UI shared-util contract should remain guarded by tests rather than silently re-duplicated.
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

### Storefront Technical Cleanup & Coherence Guardrail Addendum
- Stage 4 no longer carries the dead `modeHint` contract.
- Fallback `current_turn_decision` now stays canonical through a shared resolver rather than leaking legacy hint strings.
- Legacy `conversation_mode_hint` no longer influences fallback decision posture.
- Service and hook should stay aligned on fallback decision truth under the accepted pilot baseline.
- This lane does not claim total fallback unification or a full runtime rewrite.

### Storefront Recovery & Friction Handling Guardrail Addendum
- Weak `REVIEW_ONE` may now expose a subtle `Seguimos viendo` reentry affordance.
- That affordance remains voluntary, non-pushy, and bounded to weak-support review-first states only.
- It stays inside the existing gated next-step surface and returns through ordinary `sendMessage(...)`.
- It does not create a new route, planner/orchestrator path, or product-pressure lane.
- This lane does not claim broader funnel automation or full friction elimination.

### Storefront Shaping Spine Consolidation Guardrail Addendum
- Shared text-shaping utilities are now centralized in `src/lib/cesarin-text-utils.ts`.
- Service and hook should rely more directly on shared/server truth and less on local reinterpretation.
- `buildConciergeCatalogGate(...)` should stay thinner and trust server truth more cleanly.
- `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`.
- The prior UI residual was auditability-only, not active product duplication.
- This lane does not claim perfect centralization everywhere or a full assistant rewrite.

## Storefront Sales / Persona Hardening Operating Truth
- Cesarin's visible commercial voice is now materially warmer, sharper, and more commercially natural.
- The assistant feels more like a confident helpful seller and less like a disciplined system that is only organizing states.
- The change came from voice/prompting/bounded wording hardening, not from new rails or a new behavior tree.
- Existing safeguards remain intact: current-turn sovereignty, catalog gate, anti-bloat, degraded honesty, weak-support humility, compare-first honesty, add-ready truthfulness, and public-info non-catalog behavior.
- The visible commercial feel still depends partly on deterministic Stage 4/5 scaffolding, so this is not a claim of fully free-form sales personality.
- No measured conversion uplift is claimed.

### Storefront Sales / Persona Hardening Guardrail Addendum
- `supabase/functions/customer-intelligence/persona.ts` now frames Cesarin as a trusted seller with calm confidence, warmth, and light natural wit when it fits.
- `supabase/functions/customer-intelligence/index.ts` now carries a compact presence-commercial block in the Sommelier prompt so runtime answers can sound more human, sharper, and less like a disciplined state machine.
- `src/lib/cesarin-stage4.ts` and `src/lib/cesarin-stage5.ts` now sound less mechanical while preserving support thresholds and gate behavior.
- The accepted tests lock the new voice and wording, but they also preserve the residual truth that deterministic scaffolding still shapes part of the visible commercial feel.
- This remains a bounded storefront/customer-intelligence lane, not an architecture wave, not a planner, and not a funnel engine.
### Storefront Stage 4 / Stage 5 De-Scaffolding Operating Truth
- The accepted storefront response path now feels less stage-assembled and more like one integrated conversational/commercial move.
- `next_step_view` remains only when it adds distinct guidance or real action value.
- Redundant `KEEP_EXPLORING` scaffolding no longer needs to survive when the main response already carries the same move.
- Trust-note visibility is narrower and stays limited to the exploratory edge where it still helps.
- The remaining Stage 4 / Stage 5 structure is still real and load-bearing; this lane did not remove it or claim it was removed.
- No measured conversion uplift or global text-compression claim is made.

### Storefront Stage 4 / Stage 5 De-Scaffolding Guardrail Addendum
- Visible storefront guidance is less repetitive when the main answer already communicates the move.
- Chips and trust notes remain bounded; they do not become a new copy engine or a new pressure surface.
- The accepted baseline still preserves current-turn sovereignty, catalog gate, anti-bloat, degraded honesty, and truthful support thresholds.
- This lane is a bounded storefront de-scaffolding improvement, not a redesign or a planner/orchestrator layer.
### Storefront Turn-Level Commercial Judgment Tightening Operating Truth
- A compact bounded `commercial_move` now carries turn-level commercial truth for the product-search storefront path.
- Upstream `commercial_move` is primary truth when present; Stage 4 and Stage 5 only recompute through the shared resolver as fallback when it is absent.
- The accepted move vocabulary remains bounded to `KEEP_EXPLORING`, `COMPARE_TWO`, `REVIEW_ONE`, and `ADD_READY`.
- Stage 4 remains bounded and coherent.
- Stage 5 follows the turn-level commercial judgment more directly while preserving selector-needed behavior, weak/support/strong honesty, compare-worthiness, review-first truth, and strict add-ready gating.
- This lane improves turn-level commercial judgment propagation; it does not claim total commercial interpretation centralization everywhere or a planner/orchestrator redesign.

### Storefront Turn-Level Commercial Judgment Tightening Guardrail Addendum
- Upstream `commercial_move` is primary truth when present.
- Fallback recomputation only happens when upstream `commercial_move` is absent.
- Stage 4 and Stage 5 remain real and load-bearing realization layers.
- The accepted move vocabulary stays bounded and does not expand into a mode system or planner layer.
- This lane does not claim total downstream deterministic shaping removal.
### Storefront Selector-Needed Trigger Tightening / De-Scripted Surface Operating Truth
- `SELECTOR_NEEDED` remains a local Stage 5 family by design; it is not promoted upstream into `commercial_move`.
- The selector-needed trigger is now tighter and no longer wins early just because a variant selector exists.
- Selector-needed is bounded to stronger single-product, non-approximate, non-compare cases where the missing selector is materially purchase-defining.
- Compare-worthy turns and weaker review-first turns are no longer stolen by selector-needed.
- The generic selector-needed family chip and trust-note scaffolding were removed from the storefront UI.
- Minimal missing-selector guidance remains only where it still adds value.
- The storefront baseline is now less scripted on this edge without expanding upstream judgment or reopening closed lanes.

### Storefront Selector-Needed Trigger Tightening / De-Scripted Surface Guardrail Addendum
- Selector-needed now behaves more like a bounded commercial ask and less like a scripted edge.
- The accepted storefront baseline still preserves current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.
- This lane does not claim selector-needed removal, upstream move expansion, a planner layer, or full natural-language freedom.

### Storefront Tool-Selection / Intent-Guardrails De-Scripting Operating Truth
- The storefront runtime now gives resolved turn-profile truth more primacy before local regex/fallback guardrails can override it.
- Regex-inferred intents are now subordinated more often instead of overtaking non-`UNKNOWN` analyst intent by default.
- Fallback capability injection now survives only when the resolved turn profile still requires capability use and the primary intent still matches.
- Public-web admission is now boundary-gated behind resolved `PUBLIC_INFO` instead of behaving like regex-led semantic self-routing.
- The early compatibility force-correction is no longer part of the accepted runtime path.
- Legitimate deterministic boundary controls remain intact: catalog closure, clarify-first suppression, own-function fallback for true private/action lanes, and public-web restraint.

### Storefront Tool-Selection / Intent-Guardrails De-Scripting Guardrail Addendum
- This remains a bounded storefront/customer-intelligence lane, not a planner/orchestrator, not `commercial_move` expansion, and not a Stage 4 / Stage 5 redesign.
- This lane does not claim regex elimination, full model-pure behavior, or measured conversion uplift.
- The accepted residual is auditability-only and non-blocking: there is still no single focused regression pinning the removed compatibility pre-correction in `index.ts`.

### Storefront Stage 5 Family-Resolution Thinning / Upstream Truth Obedience Operating Truth
- Stage 5 now follows upstream `commercial_move` more directly on the accepted storefront product-search path.
- The visible next-step family now depends less on local Stage 5 arbitration once upstream truth already exists.
- Upstream `REVIEW_ONE` is no longer re-promoted into compare mode by local fallback heuristics.
- Upstream `ADD_READY` now degrades only through real Stage 5 selector-safety guardrails when a materially purchase-defining selector is still missing.
- `SELECTOR_NEEDED` remains preserved as a real local Stage 5 safety family.
- The final auditability closure was test-only and came from a focused service/runtime regression, not from a second production behavior change.

### Storefront Stage 5 Family-Resolution Thinning / Upstream Truth Obedience Guardrail Addendum
- This remains a bounded storefront-only Stage 5 thinning lane.
- This lane does not claim full Stage 5 removal, full model-pure rendering, widened `commercial_move`, Stage 4 rewrite, planner/orchestrator work, admin / Cesarin OS work, or measured business uplift.
- The accepted baseline keeps current-turn sovereignty, catalog gate, anti-bloat, degraded honesty, compare/review/add-ready honesty, and real selector-needed safety intact.

### Storefront Availability Truth Alignment Operating Truth
- Availability and outlook turns now state current availability first.
- Outlook/projection is explicitly secondary and separated from the present stock truth.
- Unsupported future-return implication was removed from active OOS wording.
- Inventory truth output was tightened without reopening routing architecture.
- Final runtime/storefront proof now exists through the accepted `conciergeService.chat(...)` regression for `INVENTORY_OUTLOOK`.

### Storefront Availability Truth Alignment Guardrail Addendum
- This remains a bounded storefront-only availability micro-lane.
- Accepted implementation chain: `d0726ddf6c7ef3c4d89656600292403bbe6e323a` and `732e5ac46fb657acdf183f32ad72ce0e6329282d`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 reopening, storefront UI redesign, planner/orchestrator work, admin / Cesarin OS expansion, or measured business uplift.
- The accepted baseline still preserves model-first discipline, catalog gate, anti-bloat, and degraded honesty.
### Storefront Text-Only Chat + Copy De-Robotization Operating Truth
- The active storefront assistant path no longer uses opaque `amarrada`-style phrasing.
- Uncertainty / weak-match wording is now clearer and more direct.
- Storefront chat now behaves as text-only because the active assistant hook path no longer auto-triggers `speak(...)` for assistant replies.
- This lane changed the active storefront chat behavior without reopening routing, stage architecture, or storefront UI structure.
- Broader speech infrastructure still exists outside the active storefront hook path by design.

### Storefront Text-Only Chat + Copy De-Robotization Guardrail Addendum
- This remains a bounded storefront-only micro-pass.
- Accepted implementation commit: `6bc159d01e92bbb23e219c88595cf9dd11aeea0b`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 reopening, storefront redesign, planner/orchestrator work, voice/live platform redesign, admin / Cesarin OS expansion, or measured business uplift.
- The accepted pilot baseline still preserves model-first discipline, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.
### Storefront Direct-Answer Preservation / Stage 5 Restraint Operating Truth
- Resolved concrete single-product fact turns now answer directly and stop.
- Secondary Stage 5/storefront help is suppressed only for the narrow intended case after the main answer is already sufficient.
- Compare, selector-needed, weak review-first, and genuine follow-through cases remain preserved.
- This lane changed the active storefront post-answer behavior without reopening routing, tool-selection, or stage philosophy.

### Storefront Direct-Answer Preservation / Stage 5 Restraint Guardrail Addendum
- This remains a bounded storefront-only micro-lane.
- Accepted implementation commit: `74014a18813e6484bea05b3c2d88eb20cfcaa3db`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 philosophy reopening, planner/orchestrator work, memory/preference work, storefront redesign, admin / Cesarin OS expansion, or measured business uplift.
- The accepted pilot baseline still preserves model-first discipline, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.

### Storefront Attribute Precision / Fact Consistency Operating Truth
- Concrete product fact answers are now materially more precise and more consistent across supported factual families in the active storefront path.
- Supported factual families now include stronger direct-answer handling for `puffs / caladas`, `nicotina`, `sabor`, `modelo / versiÃ³n`, and compatibility-style facts already present in the current data shape.
- Missing supported facts now stay explicit and honest instead of falling through to generic exact-match reinforcement or fabricated claims.
- Final runtime/storefront proof now exists beyond `caladas`, including flavor, compatibility-style facts, and compatibility-missing honesty.

### Storefront Attribute Precision / Fact Consistency Guardrail Addendum
- Accepted implementation chain: `ffb4a389cc1d5d2bff435363e7a3ccb92bebf8de` and `814bb3e247752ab6adfab1e1751f23a05c9041ed`.
- The compatibility inclusion in the direct-fact suppression detector remained narrow and did not reopen broader Stage philosophy.
- This lane does not claim routing redesign, prompt-heavy redesign, Stage 4 / Stage 5 philosophy reopening, planner/orchestrator work, memory/preference work, storefront redesign, admin / Cesarin OS expansion, or measured uplift.
- The accepted pilot baseline still preserves model-first discipline, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.
### Storefront Truth Spine Consolidation Wave Operating Truth
- Capsule/truth-layer outputs now carry more of the active storefront truth/help contract directly.
- `truth_signals` and `help_contract` now exist as explicit upstream capsule outputs on dominant storefront paths.
- Stage 5 now depends less on local detectors/suppressions and more on capsule truth/help when resolving next-step posture.
- Service now behaves more like a literal composer of upstream turn truth, capsule truth/help, and Stage 5 render intent.
- UI now consumes a more explicit upstream help/render contract with bounded backward compatibility instead of deriving as much business meaning locally.
- Dominant factual/help/compare storefront behavior remained preserved under the consolidated truth spine.

### Storefront Truth Spine Consolidation Wave Guardrail Addendum
- This remains a bounded storefront-only consolidation wave.
- Upstream turn analysis and catalog gate stayed primary throughout the accepted wave.
- This wave does not claim routing redesign, planner/orchestrator work, storefront redesign, Stage philosophy rewrite from zero, admin / Cesarin OS expansion, or measured uplift.
- Residual non-blocking structural limits remain accepted: Stage 5 is still a bounded realization layer, `help_contract` is intentionally narrow, and UI retains bounded backward-compatibility fallback where explicit render truth is absent.
### Storefront Runtime Telemetry Truth Hardening (MVL) Operating Truth
- The active storefront/customer-intelligence telemetry path now persists a more useful bounded runtime-truth set into `ai_analytics`.
- That runtime-truth set now includes compact fields such as `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
- These fields are derived from already-existing runtime truth and improve pilot operability for reading real storefront behavior without opening a new behavior lane.
- The accepted lane does not change recommendation posture, catalog gate semantics, Stage 5 family semantics, routing behavior, or public-web selection behavior.

### Storefront Runtime Telemetry Truth Hardening (MVL) Guardrail Addendum
- This remains a bounded storefront-only observability lane.
- Accepted implementation commit: `f7f0a5b86731d09d5ecafb4d6a54dc7fd940b9a3`.
- This lane does not claim a dashboard build, analytics platform build, planner/orchestrator work, storefront redesign, admin / Cesarin OS expansion, or measured uplift.
- The accepted truth is structurally implemented and acceptance-audited; this pilot note does not over-claim exhaustive live production proof for every telemetry field combination.

### Storefront AI_Analytics Telemetry Readiness Micro-Fix Operating Truth
- The accepted MVL telemetry model is now structurally aligned with the real `ai_analytics` schema and real read/write paths.
- The real edge and storefront service write paths now persist the bounded top-level telemetry fields `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
- The existing admin inspection path now prefers those top-level columns and falls back to historical `ai_logic_debug` rows when needed.
- This improves pilot operability and telemetry inspection readiness only; it does not open a new behavior lane or change storefront behavior semantics.

### Storefront AI_Analytics Telemetry Readiness Micro-Fix Guardrail Addendum
- This remains a bounded readiness micro-fix, not dashboard/platform/planner work.
- Accepted implementation commit: `39732a405230107a1294b489eb24a2203db4256e`.
- Security/RLS was not loosened in this pass.
- This note does not over-claim direct live verification that the migration is already applied or that live production rows were directly verified in this pass.

### Storefront Search-Leading Product Grounding & Recovery Hardening Operating Truth
- The active storefront search-leading path now grounds and recovers more usefully before falling into generic no-match behavior.
- Broad entity-led product search, attribute-led narrowing, near-exact missing-product recovery, and mixed-need product recovery now depend less on dead-end fallback when the real active catalog still offers grounded help.
- The accepted lane materially reduces the repeated dead-zone pattern where useful search-leading turns were collapsing into `NO_MATCH`, `KEEP_EXPLORING`, `retrieval_source = NONE`, and `product_card_count = 0`.
- Honesty remains intact: the storefront may recover with useful alternatives, but it still does not invent fake exact matches or force catalog pressure when useful grounding is absent.
- The final acceptance-clean status includes later runtime/service evidence for the exact fresh failure-family turns `de menta y no muy caro`, `quiero algo frutal para diario`, and `no encuentro el waka somatch mb6000`.
- The lane is now live-proven on a strict non-degraded window.
- The strict clean live window was `2026-04-03T03:14:33Z` to `2026-04-03T03:14:53Z`.
- The old dead-end signature stayed absent in that clean window: `retrieval_source = NONE`, `capsule_match_strategy = NO_MATCH`, `product_card_count = 0`, and `next_step_family = KEEP_EXPLORING` did not reappear as the zero-card dead-end combination.
- Five audited prompts recovered via `TOKEN_RECOVERY` with cards present and `next_step_family = COMPARE_TWO`; `busco un waka pero no se cual` recovered via `TOKEN_RECOVERY` with `product_card_count = 1` and `next_step_family = KEEP_EXPLORING`, but no longer as a zero-card dead-end.

### Storefront Search-Leading Product Grounding & Recovery Hardening Guardrail Addendum
- This remains a bounded retrieval/recovery lane inside the existing search-leading capsule bridge.
- Accepted implementation chain: `f79b222b857d73946e952efb2bf7162677a8c557` and `d2bce5fdd51faa8bb45eeefd047684d1a77ca36f`.
- This lane does not claim planner/orchestrator redesign, Stage 5/commercial-handoff redesign, standalone mixed-intent expansion, broad catalog rewrite from zero, admin / Cesarin OS expansion, or measured uplift.
- The later test-only patch closed an auditability residual; it did not create a new behavior lane.
- Live-proof scope was exactly the same 6 prompts listed in the accepted lane entry.
- The proof window was explicitly non-degraded, with no `GEMINI_DEGRADED` and no `429`.
- Ambient `429` remains a separate watchpoint and is not a blocker for this lane's closure.
- Preserve the existing non-claims about no planner/orchestrator redesign, no Stage 5 redesign, no broad retrieval rewrite, no admin / Cesarin OS expansion, and no measured uplift.

### Storefront Store-Hours Misrouting Micro-Fix Operating Truth
- Store-hours/opening-hours style informational turns now stay on the non-catalog informational/policy family instead of misrouting into `PRODUCT_SEARCH`.
- The catalog gate stays closed for those turns and the active storefront path no longer opens product recovery for them.
- Product capsule recovery and product-card behavior are no longer part of the accepted store-hours path.
- The already-correct non-catalog behavior for shipping/policy turns such as `hacen envios a todo mexico?` remains intact.

### Storefront Store-Hours Misrouting Micro-Fix Guardrail Addendum
- This remains a bounded storefront micro-fix, not a broad informational-routing rewrite.
- Accepted implementation commit: `363cecf78e02129b70fb388f6028a86807716af0`.
- This lane does not claim planner/orchestrator redesign, Stage 5/commercial-handoff change, search-recovery redesign, admin / Cesarin OS expansion, or measured uplift.
- This note records structural fix plus acceptance audit; it does not separately claim fresh live telemetry re-verification for this micro-fix in this pass.

### Storefront Degraded Policy Fallback Micro-Fix Operating Truth
- Under degraded `429 / GEMINI_DEGRADED` conditions, non-catalog `POLICY_INQUIRY` turns for store-hours, shipping, and payment no longer fall back to the old generic degraded line.
- The active storefront path keeps those turns non-catalog with a closed catalog gate and no product capsule.
- Live verified bounded degraded replies now include:
  - `Ahorita no traigo el horario exacto confirmado en sistema.`
  - `Manejamos envios por DHL Express a sucursal.`
  - `Por ahora manejamos solo transferencia o deposito bancario.`
- Store-hours remains intentionally honest and non-inventive under degradation.

### Storefront Degraded Policy Fallback Micro-Fix Guardrail Addendum
- This remains a bounded degraded-fallback-quality micro-fix, not a broad resilience framework or generic 429 platform fix.
- Accepted implementation commit: `ea3ca63755914f3a7f9d2330de8e2b4c5ce8a5c5`.
- This lane is acceptance-audited and live-verified on the authenticated storefront path.
- This lane does not claim planner/orchestrator redesign, search-recovery redesign, a new policy lane, admin / Cesarin OS expansion, or measured uplift.
- Residual truth stays explicit: upstream `429` rate limiting still exists live; this micro-fix improved degraded fallback quality, not 429 frequency.

### Storefront Authenticated Routine Replenishment / Conversational Reorder Operating Truth
- The active authenticated storefront path can now resolve one bounded `replenishment_signal` from explicit reorder intent plus real reorderable order / order-item history.
- Replenishment truth is revalidated against current catalog truth before surfacing.
- `retrieval_source` may now be `AUTHENTICATED_REORDER` on this path.
- Historical items that are inactive, discontinued, invalid-variant, or otherwise unavailable do not surface as ready-to-repeat.
- Stage 5 may surface `ADD_READY` only when current catalog truth still supports direct add with grounded quantity and variant intact.
- When direct add is not currently supported but a grounded historical target still exists, the storefront stays at `REVIEW_ONE` and uses the existing message / next-step / add-to-cart surfaces only.
- This lane stays bounded to explicit authenticated reorder intent and existing storefront surfaces only.

### Storefront Authenticated Routine Replenishment / Conversational Reorder Guardrail Addendum
- This remains a bounded authenticated storefront replenishment lane, not a history-browser, subscription, or CRM lane.
- Accepted implementation commit: `ba544bc82346ab856a97de0124bb9872f00adb54`.
- This lane consumes real authenticated order history plus current catalog truth; it does not reopen the accepted `Storefront Authenticated Reorder & Catalog Drift Hardening` lane.
- This lane does not claim guest reorder memory, a full purchase-history browser, subscription logic, auto-billing, predictive reorder, CRM expansion, checkout/payment redesign, or guaranteed reorder for historical items that no longer validate.

### Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution Operating Truth
- The active authenticated storefront path can now resolve one bounded `authenticated_order_tracking` path with `order_tracking_signal`.
- Order-tracking truth is grounded only in authenticated persisted order data.
- Hydration is bounded to recent relevant orders and may support explicit order-number lookup only inside that bounded set.
- Payment, order-status, and tracking summaries reuse canonical storefront order/payment truth rather than inventing a parallel lifecycle model.
- `ORDER_TRACKING` storefront routing now prefers the authenticated capsule path instead of generic fallback/policy behavior.
- Post-purchase assistant responses on this lane remain message-only and do not surface catalog/product help.
- Guest, no-order, and no-tracking cases degrade honestly.

### Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution Guardrail Addendum
- This remains a bounded authenticated read-only storefront assistance lane, not an order-management or CRM lane.
- Accepted implementation commit: `24b1afd027ae96d04cf6ca579b19795fbc83a123`.
- This lane does not claim guest access to order truth, refunds, cancellations, order edits, external courier scraping, admin / Cesarin OS expansion, checkout/payment redesign, or a full order-history browser / CRM panel in chat.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) Operating Truth
- The active authenticated storefront path can now resolve one bounded `authenticated_warranty_triage` path for defect/warranty-style support turns.
- `WARRANTY_SUPPORT` now exists as a bounded non-catalog storefront support intent.
- Warranty-triage truth is grounded only in authenticated persisted recent fulfilled-order and order-item data.
- Explicit order-number lookup is bounded to that same authenticated recent-order set.
- The resolver classifies this lane into bounded states such as `LIKELY_ELIGIBLE`, `OUT_OF_POLICY`, `CANNOT_IDENTIFY_PRODUCT`, `NO_RELEVANT_ORDER`, and `AUTH_REQUIRED`.
- The lane remains strict read-only and message-only.
- Generic warranty-policy questions may still remain `POLICY_INQUIRY` when contextual authenticated triage is not the right lane.
- Catalog/product sales surfaces stay suppressed on these support turns.

### Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) Guardrail Addendum
- This remains a bounded authenticated storefront support-triage lane, not a full RMA or support-desk platform.
- Accepted implementation commit: `0d3b0725967022803ab2b42d08ef21d5dbbc487c`.
- This lane does not claim guest warranty access, RMA ticket creation, refunds, cancellations, order edits, admin / Cesarin OS expansion, checkout/payment redesign, or a full CRM / ticketing platform.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Authenticated Loyalty & VIP Yielding Operating Truth
- The active authenticated storefront path can now resolve one bounded `authenticated_loyalty_status` path for loyalty / VIP questions.
- `LOYALTY_SUPPORT` now exists as a bounded non-catalog storefront intent.
- Loyalty truth is grounded only in existing authenticated storefront loyalty/customer sources already present in the system.
- Points balance, tier/status, monetary equivalent, and next-tier distance are surfaced only when grounded by existing store rules/configuration.
- The lane remains strict read-only and message-only.
- Guest/unauthenticated users do not get fake loyalty access.
- Zero-point and no-loyalty-data states degrade honestly.
- Catalog/product sales surfaces stay suppressed on loyalty turns.

### Storefront Authenticated Loyalty & VIP Yielding Guardrail Addendum
- This remains a bounded authenticated storefront loyalty/status assistance lane, not a rewards dashboard or loyalty-admin platform.
- Accepted implementation commit: `e495a9d0c8a59ceeb832f6545e81d144e1af2c20`.
- This lane does not claim point redemption, point mutation, automatic discount application, admin / Cesarin OS expansion, checkout/payment redesign, a rewards dashboard, a gamification engine, or CRM expansion.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Contextual Out-of-Stock Pivot & Alternative Yielding Operating Truth
- The active authenticated storefront path can now recover one bounded out-of-stock pivot path through the existing product-search capsule and Stage 5 storefront flow.
- Pivoting only occurs when the requested item or requested variant is genuinely unavailable or out of stock.
- Suggested substitutes are grounded in existing catalog truth and currently purchasable in stock.
- Ranking stays bounded to close sibling signals already grounded in current metadata such as brand, flavor, model, type, section, and token overlap.
- Missing-variant cases may route into `OUT_OF_STOCK_ALTERNATIVE` when grounded substitutes exist.
- If no sufficiently grounded substitute exists, the lane degrades honestly to `NO_MATCH`.
- Existing in-stock paths and variant-truth discipline remain preserved.
- Stage 5 surfaces the pivot through existing storefront message / next-step structures only.

### Storefront Contextual Out-of-Stock Pivot & Alternative Yielding Guardrail Addendum
- This remains a bounded authenticated storefront recovery lane, not a waitlist, notify-me, or recommendation-platform lane.
- Accepted implementation commit: `537856a144854604c0b2170f99bc08cd37a47d12`.
- This lane does not claim waitlist capture, notify-me flow, admin / Cesarin OS expansion, checkout/payment redesign, a broad recommendation-engine rewrite, guaranteed substitute availability beyond current in-stock catalog truth, or semantic equivalence when only approximate similarity exists.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Conversational Basket Kitting & Hardware Upgrades Operating Truth
- The active authenticated storefront path can now resolve one bounded `storefront_kitting_basket` path for explicit kit, setup, switch-from-disposables, and hardware-upgrade turns.
- `KIT_ASSEMBLY` now exists as a bounded storefront intent.
- Kitting truth is grounded only in active in-stock catalog truth plus existing compatibility/attachment truth already present in the system.
- The resolver classifies this lane into bounded states such as `FULL_KIT`, `PARTIAL_KIT`, and `NO_GROUNDED_KIT`.
- Hardware, consumable, and liquid compatibility stay grounded rather than semantic-only.
- The lane degrades honestly when one component cannot be grounded or stocked.
- The visible storefront outcome stays inside existing assistant message, next-step, and resolved-product surfaces only.

### Storefront Conversational Basket Kitting & Hardware Upgrades Guardrail Addendum
- This remains a bounded authenticated storefront kitting lane, not a bundle platform or generic setup-builder lane.
- Accepted implementation commit: `a8e097118a1f97d95458840edec935255972dc7c`.
- This lane does not claim a new bundle/cart entity, bundle UI, admin / Cesarin OS expansion, schema migrations, checkout/payment redesign, CRM/profile expansion, broad "build anything" orchestration, or guaranteed full-kit availability when catalog truth cannot support it.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Conversational Checkout Readiness & Friction Resolution Operating Truth
- The active storefront path can now resolve one bounded `storefront_checkout_readiness` path for checkout-readiness, close-now friction, payment-method truth, and bounded shipping-readiness turns.
- `CHECKOUT_READINESS` now exists as a bounded non-catalog storefront intent.
- The resolver is strict read-only and reuses existing storefront truth only:
  - cart truth
  - checkout draft truth
  - payment settings truth
  - address truth
  - coupon validation truth
  - authenticated open-order recovery truth
- The lane classifies into bounded states such as `READY_TO_CHECKOUT`, `MISSING_REQUIRED_INFO`, `CART_BLOCKER`, `PAYMENT_METHOD_INFO`, `SHIPPING_INFO_AVAILABLE`, `SHIPPING_INFO_PARTIAL`, and `AUTH_REQUIRED`.
- Responses stay message-only and non-catalog.
- Shipping-cost guidance remains bounded: the storefront may confirm requirements or partial readiness truth, but it does not invent an exact quote where current storefront truth does not expose one.

### Storefront Conversational Checkout Readiness & Friction Resolution Guardrail Addendum
- This remains a bounded storefront readiness/clarity lane, not checkout execution or payment execution.
- Accepted implementation commit: `f1b9bb0ec08fa7cae189dfd058b1e685348cf878`.
- This lane does not claim order creation, payment mutation, checkout execution, payment execution, invented exact shipping quotes, admin / Cesarin OS expansion, or architecture reopening.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Storefront Contextual Budget Rescue & Trade-Down Yielding Operating Truth
- The active storefront path can now resolve one bounded `storefront_budget_rescue` path for explicit price-friction and cheaper-alternative turns.
- `BUDGET_RESCUE` now exists as a bounded storefront intent.
- Trade-down truth is grounded only in current catalog truth, stock truth, promo truth, and optional safe single-cart-item context.
- The resolver classifies this lane into bounded states such as `CHEAPER_ALTERNATIVE_FOUND`, `PROMO_ALREADY_BEST_VALUE`, `NO_GOOD_TRADE_DOWN`, and `REVIEW_CURRENT_OPTION`.
- The lane remains strict read-only.
- Responses remain message-only and use existing assistant message, product-card, and next-step surfaces only.
- The lane does not invent discounts, price mutation, or savings claims.

### Storefront Contextual Budget Rescue & Trade-Down Yielding Guardrail Addendum
- This remains a bounded storefront trade-down lane, not a pricing-engine platform or recommender rewrite.
- Accepted implementation commit: `ae2f5f7`.
- This lane does not claim fake discounting, price mutation, invented savings, admin / Cesarin OS expansion, checkout/payment redesign, dynamic discounting, or a broad recommender rewrite.
- This lane reuses existing storefront assistant message surfaces only and preserves prior storefront/core lanes as authoritative and non-reopened.

### Bulk Operational Data Hydration & Telemetry Triage Pilot Truth
- A non-coding operational data hydration pass was accepted with minor residual on 6 de abril de 2026.
- This pass materially affects pilot data reality, not pilot application behavior.
- Live `product_variants` increased by `+37`, bringing active product variant coverage to `44/44`.
- Live compatibility graph data improved narrowly with `+2` `product_concepts`, `+4` `concept_aliases`, and `+2` `compatibility_relations`.
- The two new compatibility relations are bounded `has_connector` relations to the existing `510 Connector`, grounded only in explicit `products.specs.conector` values.
- Live `cesarin_improvement_items` increased by `+3` from high-signal telemetry triage: store-hours knowledge gap, shipping-policy retrieval gap, and payment-method policy retrieval gap.
- No `store_knowledge` facts were inserted in this pass because no new authoritative facts were found in inspected sources.
- Compatibility coverage remains sparse, so compatibility/kitting-style pilot behavior must still expect honest degradation where graph truth is missing.
- Historical note: at the time of this hydration pass, `PRODUCT_SEARCH` still remained on operational hold because embeddings were empty and Gemini provider quota was still blocking repopulation. Current canon supersedes that hold-era state: the hold is lifted after provider recovery, full repopulation, and downstream search-quality fixes.

### Compatibility Graph Hydration Batch 2 Pilot Truth
- A second non-coding compatibility graph hydration pass was accepted with minor residual on 8 de abril de 2026.
- This pass was telemetry-prioritized and materially affects pilot data reality, not pilot application behavior.
- Live compatibility graph data increased by `+3` `product_concepts`, `+6` `concept_aliases`, and `+9` `compatibility_relations`.
- The inserted relation families were bounded to `uses_battery = 5`, `uses_pod = 3`, and `has_connector = 1`.
- The added truth is grounded only in explicit live product evidence for seeded items such as `batería 18650`, `batería integrada`, `cartuchos`, `pods propietarios`, and `conexión 510 híbrida`.
- Visible storefront pilot reality is therefore somewhat stronger on those seeded compatibility / kitting items, but the graph still remains sparse overall.
- Compatibility / fit / kitting pilot behavior must still expect honest degradation on unseeded items, including many exact coil and third-party fit questions.
- Historical note: at the time of this hydration pass, `PRODUCT_SEARCH` still remained on operational hold because embeddings were empty and Gemini provider quota was still blocking repopulation. Current canon supersedes that hold-era state: the hold is lifted after provider recovery, full repopulation, and downstream search-quality fixes.

### Compatibility Graph Hydration Batch 3 Pilot Truth
- A third non-coding compatibility graph hydration pass was accepted with minor residual on 8 de abril de 2026.
- This pass was telemetry-prioritized and materially affects pilot data reality, not pilot application behavior.
- Live compatibility graph data increased by `+4` `product_concepts`, `+8` `concept_aliases`, and `+4` `compatibility_relations`.
- The inserted relation family was bounded to `recommended_for_liquid = 4`.
- The added truth is grounded only in explicit live device/liquid evidence: the source device already had confirmed `Nic Salts` or `Freebase` compatibility, and the target liquid product explicitly declared that same liquid type in tags and/or description.
- Visible storefront pilot reality is therefore somewhat stronger on seeded device-to-liquid compatibility / kitting cases, especially where a device can now point to concrete nic-salt or freebase products.
- Compatibility / fit / kitting pilot behavior must still expect honest degradation on unseeded items, including many exact coil and third-party fit questions.
- Historical note: at the time of this hydration pass, `PRODUCT_SEARCH` still remained on operational hold because embeddings were empty and Gemini provider quota was still blocking repopulation. Current canon supersedes that hold-era state: the hold is lifted after provider recovery, full repopulation, and downstream search-quality fixes.

### Phase Completion / Quota Waiting Pilot Truth
- Historical note: this section records the accepted 8 de abril waiting-state truth only. It is no longer the current live project state.
- Compatibility hydration fronts Batch 1-3 materially improved live graph truth and are now paused due signal exhaustion, not neglect.
- Policy / `store_knowledge` textual coverage was already effectively saturated at that point, but semantic retrieval was still frozen because embeddings were empty.
- That waiting-state truth has now been superseded by later provider recovery, embedding repopulation completion, PRODUCT_SEARCH hold-lift, and the accepted Phase 1 reliability closure under the frozen harness.
- Current live pilot truth is the one recorded at the top of this file: operational storefront, lifted PRODUCT_SEARCH hold, and accepted Phase 1 reliability gate.

### Bulk Operational Data Hydration & Telemetry Triage Guardrail Addendum
- This was data hydration only, not a new storefront lane.
- This pass did not modify storefront UI, routing, `customer-intelligence` logic, stage shaping, application code, docs/canon during the data pass, or embeddings/search infrastructure.
- This pass does not claim full compatibility completion, full kitting readiness, semantic retrieval quality, `PRODUCT_SEARCH` readiness, Cesarin OS/admin implementation expansion, or architecture reopening.

### Compatibility Graph Hydration Batch 2 Guardrail Addendum
- This was data hydration only, not a new storefront lane.
- This pass did not modify storefront UI, routing, `customer-intelligence` logic, stage shaping, application code, docs/canon during the data pass, or embeddings/search infrastructure.
- This pass does not claim full compatibility completion, exact coil truth where the catalog still lacks safe grounding, third-party fit completion, semantic retrieval quality, `PRODUCT_SEARCH` readiness, Cesarin OS/admin implementation expansion, or architecture reopening.

### Compatibility Graph Hydration Batch 3 Guardrail Addendum
- This was data hydration only, not a new storefront lane.
- This pass did not modify storefront UI, routing, `customer-intelligence` logic, stage shaping, application code, docs/canon during the data pass, or embeddings/search infrastructure.
- This pass does not claim full compatibility completion, exact coil truth where the catalog still lacks safe grounding, third-party fit completion, broad liquid-family completion beyond the seeded items, semantic retrieval quality, `PRODUCT_SEARCH` readiness, Cesarin OS/admin implementation expansion, or architecture reopening.

## Capability Capsules (All Materialized)
- **Product Search Integrity Capsule** - Read-Only Blueprint
- **Knowledge & RAG Foundation Capsule** - Context/Memory Blueprint
- **Cart Operator Capsule** - Safe Mutator Blueprint
All three are fully materialized and E2E validated. The Edge Function returns `requires_client_capsule: true` for product/knowledge queries - actual DB retrieval and product card rendering happens client-side.

## Next Steps After Pilot Launch
1. Monitor `ai_analytics` weekly: `semantic_match_success`, `fallback_used`, `product_card_count`, plus the bounded runtime-truth fields `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source` once the accepted readiness migration is applied in the real environment
2. Enrich `store_knowledge` with any unanswered queries observed in telemetry
3. Enable for all users (`is_ai_assistant_enabled = true`) when pilot metrics are satisfactory
4. Future: wire checkout-via-concierge to payment flow (unlocks `cart_action_detected` KPI)



*Actualizado: 3 de abril de 2026 (Cesarin Storefront - Search-Leading Product Grounding & Recovery Hardening - ACCEPT, LIVE PROVEN).*

*Actualizado: 3 de abril de 2026 (Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder) - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Authenticated Loyalty & VIP Yielding - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Contextual Out-of-Stock Pivot & Alternative Yielding - ACCEPT).*

*Actualizado: 4 de abril de 2026 (Storefront Conversational Checkout Readiness & Friction Resolution - ACCEPT).*
*Actualizado: 4 de abril de 2026 (Storefront Contextual Budget Rescue & Trade-Down Yielding - ACCEPT).*
*Actualizado: 4 de abril de 2026 (Storefront Conversational Compatibility & Fit Verification - ACCEPT).*
*Actualizado: 5 de abril de 2026 (PRODUCT_SEARCH - HOLD LIFTED after completed 768d migration, recovered Gemini account access, and downstream fallback micro-patch).*
*Actualizado: 6 de abril de 2026 (Bulk Operational Data Hydration & Telemetry Triage - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Phase Completion & Quota Escalation Waiting State - RECONCILED).*
*Actualizado: 13 de abril de 2026 (AI Reliability / Evals / Operational Excellence — Phase 1 - ACCEPT WITH EXPLICIT RESIDUAL RISK).*
