# VSM STORE â€” DOCUMENTO MAESTRO TÃ‰CNICO

> **FUENTE DE VERDAD ABSOLUTA.** Foto tÃ©cnica real del sistema.
> NO es un plan. Es lo que EXISTE. Leer COMPLETO antes de tocar cualquier archivo.
> Cualquier IA o desarrollador que trabaje en este proyecto DEBE obedecer este documento.
> **Tras cada cambio al cÃ³digo, ACTUALIZAR este documento (ver Â§1.10).** Sin excepciÃ³n.
> Historial de auditorÃ­as detallado en `AUDIT_LOG.md`.

## ðŸ›°ï¸ Project Status

- **Gemini Runtime Modernization — Wave 1 (DONE, ACCEPTED)**:
  The `gemini-api.ts` shared transport was modernized to survive HTTP 429 RESOURCE_EXHAUSTED and 50x errors directly using a custom exponential backoff (`fetchWithRetry`). We intentionally preserved the raw `fetch` architecture instead of migrating to the `@google/genai` SDK, to eliminate edge-runtime incompatibility risks and prevent semantic drift in the `customer-intelligence` function. The backoff sleep mechanism (`sleepAbortAware`) respects existing `AbortSignal` cancellations, ensuring fail-fast behavior is only triggered appropriately. This bounded wave was strictly backend infrastructure hardening: it explicitly did not implement structured outputs, it did not move instructions to `systemInstruction`, and it did not reopen storefront behavior, catalog behavior or any UI.
- **CÃ©sarÃ­n Core Refactor â€” Wave 1 (DONE, ACCEPTED)**: Storefront/customer-intelligence core is now materially less rail-driven without becoming a total rewrite. The accepted Wave 1 implementation (`d97a08eae456c334ba2dc616542111a45f32b67e`) slimmed `persona.ts`, clarified the runtime split between model reasoning, native capabilities, own functions, and UI affordances, removed the main weak-intent `UNKNOWN -> PRODUCT_SEARCH` coercion and the main forced product-search injection path, and made storefront shaping stop depending on edge `conversation_mode_hint` as a required runtime contract. The accepted corrective micro-pass (`dc3cde88026445fc607e07e49d0900b25a4a91a8`) then neutralized the degraded Analyst fallback so it now returns `intent: 'UNKNOWN'`, `turn_decision: 'ASK_CLARIFYING_QUESTION'`, `tool_calls: []`, and `fallback_reason: 'ANALYST_DEGRADED'` instead of coercing toward product search. Load-bearing storefront value remains preserved: lightweight memory, approximate recovery, honest WhatsApp fallback, business truth, and honest guest non-persistence. This is Wave 1 only: not Wave 2, not a catalog-gate redesign, not an anti-bloat rewrite, not live/voice, and not total deletion of all Stage-era infrastructure.
- **CÃ©sarÃ­n Core Refactor â€” Wave 2 (DONE, ACCEPTED)**: Storefront/customer-intelligence core is now materially turn-first at the runtime/storefront behavior level without becoming a giant planner rewrite. The accepted storefront commit (`3752ce26b992cf9ac50e4d24096fea73abfd64ec`) aligned the client contract around turn analysis and stopped stale search/product/recovery/next-step product surfaces from dominating when the current turn is no longer search-first. The accepted engine commit (`aa6b276fc489bcd0918ecff8fb73e88da1513381`) added the bounded turn-first profile `primary_intent`, `secondary_intents`, `turn_priority`, `current_turn_decision`, `turn_focus`, `primary_tool_calls`, and `queued_tool_calls`; made runtime execution act from `primary_intent`; filtered tool calls to the primary lane; and kept secondary intents as bounded queued context instead of pretending deep parallel planning. Current-turn needs can now override stale prior-lane momentum. Wave 1 gains remain preserved: lightweight memory, approximate recovery, honest WhatsApp fallback, truthful business/action boundaries, and honest guest non-persistence. This is Wave 2 only: not Wave 3 catalog gating, not Wave 4 anti-bloat, not a new mode system, not a giant planner/orchestrator, not live/voice, and not removal of all Stage-era shaping.
- **CÃƒÂ©sarÃƒÂ­n Core Refactor Ã¢â‚¬â€ Wave 3 (DONE, ACCEPTED)**: Storefront/customer-intelligence core is now materially catalog-gated at the runtime/storefront behavior level. The accepted current branch reality already contained the main Wave 3 lane in `HEAD`: commits `8fa0adf3343c5417c006bbfea3f69ffbde37d227` and `c9c0178726d3d934b679982760a47edfe5b551fa` (both `refactor cesarin wave 3 catalog gate`) established an explicit catalog gate through `resolveCatalogGate(...)` on the edge/runtime side, runtime consumption of that gate in `customer-intelligence/index.ts`, storefront normalization/application in `src/services/concierge.service.ts`, hook-level respect in `src/hooks/useAIConcierge.ts`, and UI suppression in `src/components/ui/ai/AIConcierge.tsx`. Clarification-first and non-catalog turns now stay product-suppressed, search tools are stripped when the gate is closed, products / `resolved_products` / `next_step_view` are cleared when the gate closes, and stale product/recovery/next-step product surfaces no longer linger after a lane change. Legitimate search-leading turns can still surface products and approximate recovery when justified. The final alignment patch (`7f726194fe21f795b2c2641b06f0a31c14700241`) only made the no-reflex-catalog discipline explicit in `persona.ts`; it did not create the whole lane by itself. Wave 1 and Wave 2 gains remain preserved. This is Wave 3 only: not Wave 4 anti-bloat, not live/voice, not a giant planner/orchestrator, and not total removal of all prior helper shaping.
- **CÃ©sarÃ­n Core Refactor â€” Wave 4 (DONE, ACCEPTED)**: Storefront/customer-intelligence core is now materially less bloated in runtime/storefront output. The accepted commit (`88b3a439222ed7ae6eeab7e25778b5504b859aa6`) added explicit anti-bloat response discipline through `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)`; applied shaping in `supabase/functions/customer-intelligence/index.ts`; kept Stage 4 from appending an extra commercial tail when `baseMessage` already carries the useful move; kept Stage 5 guidance in `next_step_view` instead of reinjecting it into main assistant text; and made storefront/hook/UI stop re-bloating search-path output with redundant recovery and next-step duplication. CÃ©sarÃ­n now tends toward one useful move, less duplication, and fewer robotic commercial tails while preserving approximate recovery, next-step help, honest WhatsApp fallback, truthful business/action boundaries, and the accepted Wave 1 / Wave 2 / Wave 3 gains. This is Wave 4 only: not Wave 5 tool-index work, not web-intelligence, not a planner/orchestrator redesign, not a new mode system, not a new funnel/CTA layer, and not live/voice.
- **CÃ©sarÃ­n Core Refactor â€” Wave 5 (DONE, ACCEPTED)**: Storefront/customer-intelligence core now has a real explicit capability/tool index and a bounded runtime capability plan. The accepted main commit (`124e46730602eef4112eae6ca2e282867a9c8ae4`) introduced an explicit capability box through `supabase/functions/customer-intelligence/tool-index.ts` and `supabase/functions/customer-intelligence/tool-selection.ts`, making the split between `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION` real in code; moved runtime routing onto an explicit `capabilityPlan`; and made edge execution use `capabilityPlan.serverToolCalls`. The accepted follow-up commit (`4ff767b7df249f55d5087bf918d0780f16c4fa60`) centralized intent filtering through the capability-id mapping so guardrails no longer keep a separate hidden routing table. `public_web_search` and `public_url_context` now exist as honest reserved capability slots only; this is not an active Wave 6 public-web execution path. Wave 2 turn-first, Wave 3 catalog gate, Wave 4 anti-bloat, lightweight memory, approximate recovery, honest WhatsApp fallback, truthful business/action boundaries, and honest guest non-persistence remain preserved. This is Wave 5 only: not Wave 6 web intelligence, not a planner/orchestrator redesign, not live/voice, not admin / Cesarin OS work, and not a storefront UI redesign.
- **CÃ©sarÃ­n Core Refactor â€” Wave 6 Web Intelligence (Pass 1) (DONE, ACCEPTED)**: Storefront/customer-intelligence core now has bounded active public-web intelligence inside the existing capability box. The accepted commit (`b3430ebdc21eeca8a7b215c6d192066f19664f91`) activated `public_web_search` and `public_url_context` as real `NATIVE_PUBLIC` capabilities; kept `MODEL_KNOWLEDGE` as the default when external lookup is unnecessary; kept `OWN_FUNCTION` authoritative for private truth, internal state, and real action; limited `public_url_context` to explicit URL/page-context turns; limited `public_web_search` to genuine public/fresh/external-info turns; kept clarify-first turns suppressing public web; made `PUBLIC_INFO` explicitly non-catalog; and kept execution bounded through `capabilityPlan.serverToolCalls` rather than a planner/orchestrator redesign. Public-web synthesis now stays compact and explicitly external rather than impersonating private/internal truth. Wave 2 turn-first, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 5 capability-box structure, neutral degraded Analyst fallback, and the stable storefront contract remain preserved. This is Wave 6 Pass 1 only: not full web-intelligence completion, not a giant public-web platform, not live/voice, not admin / Cesarin OS work, and not a storefront UI redesign.
- **CÃƒÂ©sarÃƒÂ­n Core Refactor Ã¢â‚¬â€ Wave 6 Web Intelligence (Pass 2) (DONE, ACCEPTED)**: Storefront/customer-intelligence core now includes one accepted bounded honesty micro-pass on top of Wave 6 Pass 1. The accepted commit (`3b97ceeba6f4c3c56e3423dd1f122da34b249428`) allows successful `public_web_search` / `public_url_context` executions to emit compact truthful `source_context`; keeps that provenance optional and bounded to a small public-context indicator, optional brief, and up to 2 normalized public sources; keeps `source_context` absent when public web did not actually run successfully; preserves `PUBLIC_INFO` as non-catalog so product/recovery/next-step product surfaces stay suppressed on the relevant storefront path; and leaves the storefront contract materially intact with only a narrow contract extension. This is a micro-pass over Wave 6 Pass 1 only: not full Wave 6 completion, not a citation framework, not a storefront UI redesign, not a planner/orchestrator redesign, and not admin / Cesarin OS work.
- **C?sar?n Core Refactor ? Wave 6 Web Intelligence (Final Micro-Pass) (DONE, ACCEPTED)**: Storefront/customer-intelligence core now includes the final accepted Wave 6 hygiene closure. The accepted commit (`2b82970c85e691a48409a4bc056b0a4facd4ff60`) adds explicit negative-path proof that ordinary non-public-web turns do not surface `source_context`; keeps compact public-context provenance absent on those ordinary non-public-web turns; removes dead `public_web_search_legacy` / `public_url_context_legacy` plus their associated legacy-only helper/shim path from `supabase/functions/customer-intelligence/tools.ts`; and preserves the active public-web path as the bounded primary runtime path only. Compact `source_context` still remains optional and only for successful public-web turns, `PUBLIC_INFO` remains non-catalog, and no selection policy, catalog-gate semantics, storefront UI design, or planner/orchestrator behavior changed. This is final hygiene over accepted Wave 6 Pass 1 + Pass 2 only: not a new architecture lane, not a citation framework, not a storefront UI redesign, and not full Wave 6 expansion.
- **CÃ©sarÃ­n Core Refactor â€” Wave 7 Memoria y Contexto Blando (DONE, ACCEPTED)**: Storefront/customer-intelligence core now includes a bounded soft-continuity layer. The accepted commit (`5e5e4db18015665c2d6ef1dcce1803bc0e4688f1`) added `supabase/functions/customer-intelligence/soft-continuity.ts`, made runtime derive continuity from recent session history, authenticated `ia_context`, and lightweight existing memory context, and wired that continuity into Analyst/Sommelier prompting plus storefront message shaping through a compact `conversational_prefix`. Continuity is now materially more useful without becoming rigid: it remains soft, humble, compact, and optional; topic/lane shift suppresses stale continuity push; the current turn remains sovereign; continuity does not reopen catalog by itself; guests still do not get fake durable memory; authenticated continuity remains lightweight and field-based rather than deep transcript memory; and storefront contract/UI did not require redesign. Wave 2 turn-first behavior, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 6 bounded public web, and own-function priority remain preserved. This is Wave 7 only: not a deep memory platform, not a CRM-style persistence layer, not a planner/orchestrator redesign, and not a storefront UI redesign.
- **CÃ©sarÃ­n Core Refactor â€” Post-Refactor Convergence / Hardening Wave (DONE, ACCEPTED)**: Storefront/customer-intelligence core now runs as a cleaner converged model-first Gemini 2.5 Pro concierge baseline without opening a new architecture lane. The accepted main commit (`d78576bb51b08a909e1e9106e29ec3726046aa3a`) explicitly aligned Analyst/Sommelier to Gemini 2.5 Pro, kept auxiliary/admin-style paths on auxiliary Flash where applicable, reduced duplicated manual routing prose in `supabase/functions/customer-intelligence/index.ts`, and made the real capability box the clearer primary routing authority in Analyst prompting. The accepted cleanup micro-pass (`4dbd867915f95e5f11a50024ad891d08e1129dc5`) then moved stale conversational-prefix suppression into explicit shared runtime truth through `shouldSuppressCesarinConversationalPrefix(...)`, covering `ASK_CLARIFYING_QUESTION`, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap. Final-answer ownership is now cleaner while current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, and degraded honesty remain preserved. This is convergence/hardening only: not a redesign from zero, not a new commercial UX lane, not live/voice, not admin / Cesarin OS work, and not a planner/orchestrator redesign.
- **CÃ©sarÃ­n Storefront â€” Commercial Visibility / UX Effectiveness Wave (DONE, ACCEPTED)**: The storefront assistant now expresses the converged core more clearly in the customer-facing UI without reopening rails or redesigning the storefront from zero. The accepted commit (`83c5591c49b48b5a9259078fcfc29486d04b0eea`) added bounded visible help differentiation in `src/components/ui/ai/AIConcierge.tsx` through only four compact truthful labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`; kept those labels safely gated so public context only appears when `source_context` exists, product help only appears when catalog/product surfaces are actually open, actionable help only appears for real action-oriented help, and suppressed/non-catalog turns do not get mislabeled as product help; and made Stage 5 copy plus `Siguiente paso` clearer and more customer-facing without becoming pushy. This wave improves visible clarity and customer understanding, not measured business uplift; it does not claim a storefront redesign, funnel-engine creation, or any weakening of current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, or own-function priority.
- **CÃ©sarÃ­n Storefront â€” Commercial Outcome Hardening Wave (DONE, ACCEPTED)**: The storefront assistant now chooses customer-facing commercial outcomes more truthfully instead of leaning too quickly into action-ready framing. The accepted commit (`61661f8263fb209b577d12320bb3732e73d24168`) hardened `src/lib/cesarin-stage5.ts` with explicit support grading `weak | supported | strong`, kept weak/approximate cases humbler and more exploratory/review-first, tightened `ADD_READY` so it only appears on genuinely strong single-product support, and kept two viable products compare-worthy more often instead of collapsing them prematurely into action-ready. The same accepted commit also made `src/components/ui/ai/AIConcierge.tsx` express true add-ready help more clearly as `Paso accionable` while ordinary catalog-open product help still remains `Ayuda de producto`. This is a bounded storefront commercial-improvement lane only: not measured business uplift, not a ranking engine, not a funnel engine, not a storefront redesign from zero, and not a reopening of the accepted core architecture lanes.
- **CÃ©sarÃ­n Storefront â€” Trust & Transparency Hardening Wave (DONE, ACCEPTED)**: The storefront assistant now makes its visible recommendation posture easier to understand through compact human trust-signaling rather than debug instrumentation. The accepted commit (`edc978d7aaaacd7f59e9f60bfa6d32e2cef244f9`) updated `src/lib/cesarin-stage5.ts` with clearer human-facing trust language and updated `src/components/ui/ai/AIConcierge.tsx` so users can more easily read weak exploratory help, compare-worthy help, prudent review-first help, and clearer add-ready help through compact posture notes such as `Todavia estamos afinando`, `Las dos traen buen caso`, `Es la mejor pista por ahora`, `Es la ruta mas clara`, `Ya va bien encaminado`, and `Ya viene bien amarrado`. Public-context help remains isolated from product-confidence language, closed catalog lanes remain closed, and this remains a bounded storefront trust/clarity lane only: not a confidence-score system, not a confidence meter, not a debug taxonomy surface, not measured business uplift, and not a storefront redesign from zero.
- **CÃƒÂ©sarÃƒÂ­n Storefront Ã¢â‚¬â€ Decision Flow Naturalization Wave (DONE, ACCEPTED)**: The storefront assistant now follows upstream decision posture more naturally instead of leaning on older storefront forcing. The accepted initial commit (`b28b79f0190cf6146d890fbc11584f336402196c`) materially propagated `turnAnalysis` into storefront stage shaping, made Stage 4 preserve upstream model posture more faithfully, removed the old forced storefront `EXPLORE_LIGHT` fallback path through `modeHint`, and reduced regex/helper duplication between Stage 4 and Stage 5 while narrowing older exploration forcing through `isStrictExplorationQuery(...)`. The accepted corrective micro-pass (`d81ea2bae78ea82264750c6efcb7991fe0f34ece`) then closed the weak-support humility regression so weak/approximate single-candidate cases now preserve humble `KEEP_EXPLORING` when upstream posture still remains `GUIDED_COMPARE`. This remains a bounded storefront naturalization lane only: not full heuristic removal, not full model-pure family resolution, not a planner/orchestrator redesign, not a storefront redesign from zero, and not an admin / Cesarin OS expansion.
- **CÃ©sarÃ­n Assistant Runtime â€” Technical Cleanup & Coherence Wave (DONE, ACCEPTED)**: The assistant runtime is now more coherent in the accepted live baseline without reopening architecture or product behavior lanes. The accepted commit (`0628133a2552c946477e8e0f8f0d0048121e4497`) removed the dead Stage 4 `modeHint` contract, canonicalized fallback `current_turn_decision` through a shared resolver, stopped service fallback from leaking legacy `conversation_mode_hint`, and materially aligned hook/service fallback decision truth. This remains a bounded runtime cleanup only: not a full runtime rewrite, not total fallback centralization, not a planner/orchestrator lane, and not a new commercial behavior pass.
- **Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass (DONE, ACCEPTED)**: One bounded runtime hygiene pass is now accepted without creating a new storefront lane. The accepted cleanup commit (`571da0ec7c9b2bbf0bfafa03d7b9fe31a6168de8`) removed obsolete `get_store_policy` residue from active capability, routing, telemetry, and dispatch surfaces so policy handling now relies on the canonical surviving paths rather than the legacy route. The accepted micro-fix commit (`8ee9d4ce8e5b145dc42a0f238ffd300c2a9b0c42`) then removed the dead orphaned `get_store_policy` helper body from `supabase/functions/customer-intelligence/tools.ts`. `src/services/storefront-cart-audit.service.ts` was intentionally preserved because deleting or merging it was not behavior-safe in this bounded pass. This is cleanup/deprecation only: not a new commercial capability, not a storefront behavior expansion, not a `PRODUCT_SEARCH` change, not a promotions/replenishment change, and not an architecture reopening.
- **Vector Pipeline 768d Alignment & PRODUCT_SEARCH Operational Hold (DONE, ACCEPTED WITH OPERATIONAL HOLD)**: The upstream vector/search substrate is no longer architecturally blocked. The accepted commit (`c1136f156e292f35e585534a74a151bcbabfb470`, `fix down migrate vector pipeline to 768d`) corrected provider truth, replayable schema truth, RPC signatures, and the forward migration path to one executable `768d` reality. The live target environment was then actually migrated to `768d` schema/RPC truth through the accepted live migration file `supabase/migrations/20260404_vector_pipeline_down_migrate_to_768.sql`, so `products.embedding` and `store_knowledge.embedding` are now `vector(768)` and `match_products` / `match_knowledge` no longer fail on dimension mismatch. Repopulation did not complete: the canonical Gemini repopulation path hit `429 RESOURCE_EXHAUSTED`, leaving live embeddings empty (`products: 44 active / 0 embedded`, `store_knowledge: 41 active / 0 embedded`). Current truth is therefore explicit operational hold, not architectural failure and not storefront-lane regression: `PRODUCT_SEARCH` remains unvalidated and operationally blocked until provider quota becomes available and live embeddings are repopulated. This is infra/data truth only: not a reopened storefront lane, not a storefront behavior change, not a UI/routing change, and not live retrieval closure.
- **Phase Completion & Quota Escalation Waiting State (RECONCILED, 8 de abril de 2026)**: Under current truthful scope, no honest storefront or Cesarin OS/admin coding lane remains open. The accepted vector correction and live `768d` migration removed the architectural blocker, but canonical Gemini repopulation is still blocked by `429 RESOURCE_EXHAUSTED`, leaving `PRODUCT_SEARCH` on explicit operational hold. Non-coding follow-on fronts were exhausted legitimately: compatibility hydration advanced through Batch 1-3, telemetry triage produced the remaining grounded improvement items, and policy / `store_knowledge` textual coverage is effectively saturated while semantic activation remains blocked by missing embeddings. Current project state is therefore phase-complete under current constraints, not project closure: the next correct move requires provider quota recovery, tier upgrade, or an explicit strategic pivot outside this current front.
- **Gemini Provider Access Denial / Retrieval Unblock (ESCALATED, 10 de abril de 2026)**: Paced local admin repopulation script (`scripts/admin/repopulate-vectors.ts`) was executed to bypass the previous 429 quota exhaustion. The execution definitively confirmed that the active blocker shifted: 85/85 attempts failed with the explicit provider message "Your project has been denied access. Please contact support." Architecture, schema, DB write paths, and pacing mechanisms (4.5s/req) are now fully ruled out. The issue is strictly an upstream Gemini provider account/project access denial. `PRODUCT_SEARCH` remains on strict operational hold until provider access is restored. No further technical execution, code refactoring, or script retries are authorized on this front.
- **PRODUCT_SEARCH Hold-Lift Achieved (12 de abril de 2026)**: The explicit operational hold on PRODUCT_SEARCH is officially lifted. Following upstream provider access recovery, the vector substrate was fully repopulated (0 null embeddings) and live public query paths were confirmed aligned to 768d (resolving the 3072d mismatch). Downstream product-search quality micro-fixes successfully ensured exact grounded hits win before ambiguity fallback and weak/noisy queries degrade honestly (NO_MATCH) without faking confidence. Residual truth remains: multi-class broad query purity is not perfectly solved and some non-grounded exploratory queries retain commercial looseness, but live-proof re-audit confirmed the retrieval substrate is now commercially useful. This lifts the operational blockade without opening a new storefront feature lane.
- **CÃ©sarÃ­n Storefront â€” Recovery & Friction Handling Wave (DONE, ACCEPTED)**: The storefront now reduces one real review-first friction gap without widening architecture or product pressure. The accepted commit (`2aec9dfe714d08a44ee3e4c7fc0955ca21fb1627`) added `next_step_view.assistAction` only for weak `REVIEW_ONE`, surfaced the accepted subtle affordance `Seguimos viendo` inside the existing gated next-step surface, and kept that reentry inside the normal conversation loop through ordinary `sendMessage(...)`. This remains a bounded storefront friction-reduction lane only: not a new route, not a planner/orchestrator path, not a funnel engine, not measured conversion uplift, and not a claim that all friction handling is solved globally.
- **CÃ©sarÃ­n Storefront / Assistant â€” Shaping Spine Consolidation Wave (DONE, ACCEPTED)**: The assistant/storefront spine is now materially more coherent in the accepted live baseline without claiming perfect centralization everywhere. Shared text-shaping utilities are consolidated in `src/lib/cesarin-text-utils.ts`; `src/services/concierge.service.ts` and `src/hooks/useAIConcierge.ts` rely more directly on shared/server truth and less on local reinterpretation; `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly; and `src/components/ui/ai/AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`. The accepted auditability micro-fix (`ba0c21dfcd84dbb55b7b719258627adaafbede82`) then added focused UI regressions to explicitly guard that shared-util contract, showing that the earlier residual was auditability-only rather than active product duplication. This remains a bounded shaping-spine consolidation lane only: not a full assistant rewrite, not perfect centralization across every layer, not a planner/orchestrator lane, and not a new commercial behavior pass.
- **AI Platform Integrity & Runtime Convergence (DONE, ACCEPTED WITH MINOR RESIDUAL RISK)**: One bounded IA-stack integrity lane is now accepted without reopening storefront UX, Cesarin OS surfaces, or architecture from zero. The accepted commit (`3d85aefca1b07730de1f95560fee0aeb5c8b2c1b`) hardened `knowledge-ingestor` in config, deploy, and runtime auth by restoring JWT verification, removing workflow `--no-verify-jwt`, and requiring either `service_role` or authenticated `admin_users` roles (`admin` / `super_admin`) for write actions. The same accepted lane also converged the audited `customer-intelligence` core path onto one explicit shared Gemini API policy through `_shared/gemini-api.ts`, removing accidental internal `v1` / `v1beta` drift inside that core path, and added explicit `telemetry_contract` ownership signaling so edge/client telemetry coordination is harder to drift accidentally. Acceptance audit classified the lane as `ACCEPT WITH MINOR RESIDUAL RISK`: admin/service-role continuity was validated by inspected code rather than end-to-end proof, `telemetry_contract` reduces drift but still coexists with legacy signals/mechanisms, and Gemini convergence here applies to the audited core path rather than every Gemini-consuming edge function in the repo. This is runtime integrity/convergence only: not a storefront redesign, not a new commercial behavior lane, not a full telemetry unification claim, and not a repo-wide Gemini closure claim.
- **Cesarin OS â€” Operational Truth Convergence (DONE, ACCEPTED)**: Cesarin OS operator surfaces now reflect one more truthful bounded state across the pilot, knowledge, and concepts workbenches. The accepted main lane (`1dc927d9ef5fb53c79ace78837c031f5cd3893a0`, `feat cesarin os operational truth convergence`) moved the pilot quick-probe surface onto the same real lab/runtime/session spine already used by Conversation Lab, made knowledge post-write state rehydrate authoritative persisted truth instead of synthetic client truth, and exposed persisted concept creation plus alias add/remove inside the existing concepts workbench. The accepted residual micro-fix (`4bca1373c77e31566b84379b742128f155a7064a`, `fix cesarin os truth alignment residuals`) then closed the remaining truth-alignment residuals by making `TabPilot` explicitly distinguish a selected historical turn from the latest real turn and by making concept summary relation truth count total incoming + outgoing persisted edges while keeping the detailed relations view explicitly directional. This improves operational truth/coherence across these targeted Cesarin OS surfaces only: not a broader admin architecture rewrite, not full Cesarin OS completion, not concept deletion support inside this workbench, not resolution of the environment-specific hanging `TabPilot.test.tsx` harness, and not a storefront-lane expansion.
- **Wave 193 (DONE)**: Marketing AI Reality Repair. Removed non-existent `marketing-intelligence` dependency. Implemented robust local heuristics for Coupons and Flash Deals. Renamed `Magic` branding to `System` for architectural sincerity. Cleaned `useAdminMarketing.ts` to use `suggestFlashDealSystem`. Base Build v113.
- **Catalog Grid Zero-Lag Canon (DONE)**: `src/components/products/ProductCard.tsx` no longer performs continuous `getBoundingClientRect()` reads during pointer motion. The spotlight effect now caches geometry, updates CSS local variables through `requestAnimationFrame`, and renders only on devices matching `matchMedia('(hover: hover) and (pointer: fine)')`. This closes the catalog layout-thrashing path that degraded scroll performance on touch devices and formalizes the permanent storefront rule that high-cardinality catalog animations must degrade by device capability instead of taxing the main thread.
- **Mercado Pago Checkout E2E Stabilization (DONE)**: Checkout Pro sandbox loop validated end-to-end. `create-payment` no longer hides order lookup failures behind restrictive profile assumptions: current implementation reads the order with `.select('*')`, surfaces raw DB errors, creates Mercado Pago preferences, and persists `mp_preference_id`. `mercadopago-webhook` is confirmed mutating `orders.mp_payment_id`, `orders.mp_payment_data`, `orders.payment_status`, and `orders.status` from asynchronous MP callbacks. Deployment canon for Supabase Edge Functions is GitHub Actions pipeline-first via `.github/workflows/deploy-functions.yml` because the host OS lacks reliable local Docker support for function deployment. `mercadopago-webhook` requires `[functions.mercadopago-webhook] verify_jwt = false` in `supabase/config.toml` to accept external Mercado Pago requests.
- **Technical Debt Closure â€” CI/CD Webhook & Loyalty RPC (DONE)**: The deploy canon is now materially aligned with workflow reality: `.github/workflows/deploy-functions.yml` explicitly deploys `mercadopago-webhook` with `--no-verify-jwt`, closing the last CI/CD gap for the Mercado Pago async payment loop. The loyalty dependency `process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)` from `supabase/migrations/20260310_loyalty_rpc_fix.sql` has been validated as present in the remote database with `EXECUTE` granted to `authenticated`, resolving the previously masked `PGRST202` failure path from `src/services/loyalty.service.ts`. Critical commercial infra is now documented as structurally satisfied across checkout webhook delivery and loyalty points RPC execution.
- **CÃ©sarÃ­n Stage 1 â€” Human Voice, Approximate Recovery & Honest Escalation (DONE)**: Storefront CÃ©sarÃ­n now behaves more like a bounded human sales assistant and less like a rigid responder. The accepted implementation (`a46dadb`) humanized storefront uncertainty, added the visible approximate recovery loop (`Esta se parece mÃ¡s` / `Ninguna`), and made the real WhatsApp exit honest. The corrective micro-pass (`bf28d23`) then removed the last unconditional `UNKNOWN -> PRODUCT_SEARCH` forced recovery tail and aligned visible `cart_operator` copy with the new oral/honest Stage 1 voice. Weak-intent rescue remains useful but bounded to real storefront signals; unresolved turns may now remain honestly unresolved when there is no real product, policy, inventory, or greeting signal to rescue. This lane remains storefront-only: no deep per-customer memory, no autonomous learning, no admin/Cesarin OS expansion, no giant architecture redesign, and no fake human handoff beyond real existing WhatsApp paths.
- **CÃ©sarÃ­n Stage 2 â€” Taste Memory, Lightweight Continuity & Honest Preference Use (DONE)**: Storefront CÃ©sarÃ­n now has bounded authenticated taste memory that sharpens returning-customer recommendations without becoming creepy or pretending deep memory. The accepted implementation (`b1246d3`) added lightweight preference persistence over `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`, with conservative evidence tiers `inferred`, `explicit`, `confirmed`, and `rejected`; compact preference-summary prompt injection; humble memory-use rules where the current turn always overrides prior memory; and honest guest non-persistence. The corrective micro-pass (`159096d`) then fixed `interests_metadata` honesty so historical interests no longer gain fake `hits` or fresh `last_at` just for surviving merge. This lane remains storefront-only: no giant CRM, no deep transcript memory, no autonomous learning platform, no admin/Cesarin OS expansion, no creepy personalization, and no giant architecture redesign.
- **CÃ©sarÃ­n Stage 3 â€” Commercial Judgment From Taste Memory (DONE)**: Storefront CÃ©sarÃ­n now converts existing lightweight taste memory into bounded commercial judgment for authenticated returning customers. The accepted implementation (`0d96413`) added memory-aware commercial guidance on the edge/runtime side plus deterministic storefront-side reranking over existing product suggestions, so remembered likes can move relevant options upward, rejected or disliked paths can move downward, budget posture can influence ordering conservatively, and approximate recovery now benefits because top suggestions are reranked before entering the existing `Esta se parece mÃ¡s` / `Ninguna` loop. Current-turn intent still overrides prior memory when the two conflict, and this lane remained tightly bounded: no giant ranking engine, no CRM expansion, no admin/Cesarin OS expansion, no fake guest persistence, no autonomous learning platform, and no giant architecture redesign.
- **CÃ©sarÃ­n Stage 4 â€” Adaptive Commercial Conversation (DONE)**: Storefront CÃ©sarÃ­n now adapts the main commercial/product-search conversation shape in a bounded way instead of pushing one flat seller cadence through every turn. The accepted implementation (`5d48c46`) added the canonical mode layer `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE`; edge/runtime conversation-mode guidance plus `conversation_mode_hint`; and storefront-side adaptive shaping over visible option count and next-step message flow. Strong-signal turns now get cleaner shorter recommendation paths, compare turns stay narrowed and grounded, hesitation gets reassurance instead of hard reset, broad weak-memory turns remain exploratory, current-turn posture overrides stale assumptions, and the existing recovery loop benefits because visible suggestions are already adapted before entering it. This lane remained storefront-only and bounded: no giant behavioral-intelligence engine, no deep conversation-planning system, no admin/Cesarin OS expansion, no CRM expansion, no fake guest persistence, and no giant architecture redesign.
- **CÃƒÂ©sarÃƒÂ­n Stage 5 Ã¢â‚¬â€ Assisted Conversion & Actionable Closing (DONE)**: Storefront CÃƒÂ©sarÃƒÂ­n now resolves one bounded next actionable storefront step after recommendation instead of leaving every good branch on the same generic handoff. The accepted implementation (`9b015eb`) added the canonical action families `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`; made Stage 5 run after Stage 3 reranking and Stage 4 posture shaping; hydrates real product data before deciding the next step; attaches `next_step_view` to the capsule contract; and renders a real `Siguiente paso` block in the storefront UI using existing `OPEN_PDP` and `ADD_TO_CART` flows only when support is real. Selector-needed behavior stays grounded in real product/variant evidence, compare and exploration remain honest when close is not justified, and current-turn intent still blocks stale memory/posture from forcing action confidence. This lane remained storefront-only and bounded: no checkout/platform redesign, no hidden human workflow invention, no giant conversion engine, no admin/Cesarin OS expansion, no CRM expansion, no fake guest persistence, and no giant architecture redesign.
- **Storefront Sales Recovery Closure (DONE)**: S93 hardened the product-search capsule as a sales assistant inside the storefront only: exact-product misses now recover more usefully, ambiguity questions are sharper, no-match and out-of-stock branches avoid dead-end phrasing, and next-step copy points more clearly toward real product cards, PDP review, or cart action. S94 then closed the remaining honesty reservation without reopening the architecture: token-based catalog rescue is now explicitly distinct from embedding-based semantic recovery in the capsule contract, drafting, telemetry, and storefront labeling (`TOKEN_RECOVERY`, `retrieval_source`, `Coincidencias por Nombre`). This remains read-only product guidance over existing catalog data, not a new backend intelligence lane. Commits: 11ebc35, 41b8e6e.
- **Storefront Clarification-to-Conversion Hardening (DONE)**: S95 stayed storefront-only and tightened response shaping for ambiguous or exploratory product-seeking turns. The product-search capsule now prefers one sharper narrowing question, adds clearer choose-between-paths framing when multiple options are viable, and pushes the user toward a clearer next move such as PDP inspection or cart action. S93/S94 retrieval and honesty boundaries remain preserved: no retrieval redesign, no ranking claim, and no token-vs-semantic rollback. Commit: 2faec10.
- **Storefront Comparison-to-Choice Hardening (DONE)**: S96 stayed storefront-only and hardened comparison honesty inside the existing product-search capsule drafting. The assistant now steers toward one option only when supported comparative evidence exists, keeps weak-difference cases neutral instead of manufacturing a hierarchy, and surfaces a third option only when it opens a genuinely distinct supported path. No retrieval redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95 boundaries. Commit: 46dda54.
- **Storefront Choice-to-Confidence Hardening (DONE)**: S97 stayed storefront-only and hardened the moment after a likely product choice already exists. The product-search capsule now reinforces a leading option with short, modest, supported confidence language, keeps weak-support cases neutral, and mentions only one nearby alternative when there is a real supported tradeoff. Exact single-option confidence is now gated honestly: it applies only to true single exact matches, while multi-exact cases stay neutral and use multi-option handoff. No retrieval redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96 boundaries. Commits: 0191d0c, 38005ee.
- **Storefront Confidence-to-Cart Hardening (DONE)**: S98 stayed storefront-only and hardened the final storefront handoff after supported confidence already exists. The product-search capsule now distinguishes review-only versus review-then-cart more honestly, keeps weak-support fallback cases conservative, and lets stronger exact or support-backed branches progress naturally toward cart without pressure tactics or inflated purchase steering. No retrieval redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96/S97 boundaries. Commits: 8322b45, 4c7a46c.
- **Storefront Objection-to-Recovery Hardening (DONE)**: S99 stayed storefront-only and hardened late-stage objection recovery inside the existing narrowed branch. The product-search capsule now keeps objection handling local instead of resetting the funnel, uses visible candidate-set price data honestly for cheaper, keeps worth_it grounded in supported signals, limits nearby alternatives to one narrowly justified option, and keeps objection handoff at review/PDP level rather than drifting into pressure. No retrieval redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96/S97/S98 boundaries. Commit: 12bedcc.
- **Storefront Recovery-to-Commitment Hardening (DONE)**: S100 stayed storefront-only and hardened the close that happens after a grounded objection recovery already exists inside a narrowed branch. The product-search capsule now adds a post-recovery commitment layer so stronger support-backed recovery can land on a more commitment-ready next step, while weak-support recovery remains conservative and two-option recovery stays focused without reopening browsing. No retrieval redesign, no orchestrator redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96/S97/S98/S99 boundaries. Commit: 2eb233f.
- **Storefront Commitment-to-Checkout-Readiness Hardening (DONE)**: S101 stayed storefront-only and added a bounded checkout-readiness drafting layer after commitment already exists. Checkout-readiness now appears only when the readiness step itself is explicitly support-backed; single-path survival alone is not enough, weak-support and multi-option paths remain conservative, and selectorless ordinary single-product paths no longer emit generic readiness language. No retrieval redesign, no orchestrator redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96/S97/S98/S99/S100 boundaries. Commits: 903fc65, 995cf91.
- **Storefront Checkout-Readiness-to-Cart-Precision Hardening (DONE)**: S102 stayed storefront-only and added a bounded selector-backed cart-precision drafting layer after checkout-readiness already exists. Cart precision now appears only when a materially purchase-defining selector is actually supported; single-path survival alone is not enough, selectorless strong paths stay at S101 readiness, and weak or multi-option paths remain conservative. No retrieval redesign, no orchestrator redesign, no admin/Cesarin OS expansion, and no rollback of S93/S94/S95/S96/S97/S98/S99/S100/S101 boundaries. Commit: 383028e.
- **Checkout Foundation - Secure Submission Bridge MVP (DONE)**: Storefront checkout now has a bounded server-side submission bridge for authenticated orders through `src/actions/checkout.ts` and `supabase/functions/checkout-submit/index.ts`. Real checkout submission now persists `orders` plus `order_items`, recalculates totals from current DB product/variant pricing instead of trusting client prices, keeps guest checkout as an honest WhatsApp-only handoff, and requires coupon-tracking persistence for discounted acceptance. This remains checkout foundation only: not payment flow, not advanced checkout, not full stock reservation, and not admin/Cesarin OS expansion. Commits: `2a8ceb2`, `d1aeb03`; final acceptance followed the mechanical parse/typecheck repair that restored `src/hooks/useCheckout.ts` without changing accepted behavior.
- **Checkout Payment Continuation (DONE)**: Authenticated checkout now continues from the accepted secure submission bridge into the pre-existing Mercado Pago surface through a bounded, truthful continuation contract. `src/actions/checkout.ts` now returns `not_requested`, `ready`, or `unavailable`; payment continuation is requested only after `checkout-submit` succeeds with a real persisted `orderId`; `src/hooks/useCheckout.ts` consumes that contract instead of the old fragmented direct client-side payment initiation path; and `supabase/functions/create-payment/index.ts` now enforces bearer-token auth, scopes order lookup to `customer_id = user.id`, rejects non-Mercado Pago or otherwise non-payable orders, rejects empty order items, and reads the current persisted snake_case payer fields `customer_name` and `customer_phone`. Guest checkout remains honest WhatsApp handoff only. This is still not payment completion, not advanced checkout, not shipping, not stock reservation, and not admin/Cesarin OS expansion. Commit: `4d525d1`.
- **Post-Payment Order Status Normalization (DONE)**: Storefront checkout status surfaces now derive post-payment messaging from persisted order truth instead of route semantics alone. `src/lib/domain/orders.ts` now provides `normalizePaymentStatus()` and `getStorefrontOrderPaymentView()` as a bounded normalization layer over `payment_status`, `payment_method`, and `status`; `src/pages/OrderDetail.tsx` now distinguishes meaningful storefront payment states including `paid`, `pending`, `failed`, and `refunded`; `src/pages/PaymentSuccess.tsx` no longer makes fake success claims unless persisted payment truth is actually `paid`; and `src/pages/PaymentPending.tsx` plus `src/pages/PaymentFailure.tsx` now load the order and align copy to persisted truth when order data is available. This remains truthful storefront/checkout status normalization only: not payment completion, not advanced checkout, not guest persistence, not shipping, not stock reservation, and not admin/Cesarin OS expansion. Commit: `122cd61`.
- **Checkout Payment Success Cart-Clear Guard (DONE PATCH)**: `src/pages/PaymentSuccess.tsx` no longer clears the cart on route entry alone. The accepted patch now gates cart clearing on persisted paid truth only through the existing loaded order view; `processed.current` still prevents repeated clears once a paid order has triggered the effect, accepted post-payment messaging remains intact, and confetti remains paid-only. This is a narrow checkout patch only: not a new lane, not payment completion logic expansion, not guest checkout expansion, not shipping, not stock reservation, and not admin/Cesarin OS expansion. Commit: `a2b3194`.
- **Checkout Payment UX Mini-Block (Patch Pair 1 of 2) (DONE)**: Storefront payment-return UX now converges faster toward persisted order truth after Mercado Pago return without inventing paid state. `src/hooks/useOrders.ts` now provides `useBoundedOrderStatusRefresh(...)` on the existing order read path; `src/pages/PaymentSuccess.tsx` uses that bounded recheck only while persisted truth is unresolved or pending and adds a manual `Revisar estado de pago` action when the order is not yet paid; `src/pages/PaymentPending.tsx` adds the same bounded recheck plus manual refresh; `src/pages/PaymentFailure.tsx` adds manual persisted-status refresh only; and `src/pages/OrderDetail.tsx` adds `Revisar estado de pago` for unpaid `mercadopago` orders. Persisted order/payment truth remains authoritative, no paid-state invention or premature cart clear was reintroduced, guest checkout remains outside persisted payment flow, and no shipping, stock reservation, advanced checkout, or admin/Cesarin OS scope was added. Accepted with minor residual risk: page-level coverage remains thinner on `PaymentPending.tsx`, `PaymentFailure.tsx`, and `OrderDetail.tsx`, and the bounded recheck window may still require manual recheck if persistence settles later. Commit: `6de6106`.
- **Checkout Payment UX Mini-Block (Patch Pair 2 of 2) (DONE)**: Storefront checkout/payment surfaces now express post-payment continuity more clearly without changing the persisted truth model. `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` now separate order existence from payment confirmation more explicitly, use clearer next-step CTAs, and keep pointing the customer back to the persisted order state as the source of truth. `OrderDetail.tsx` now labels the payment section as `Estado de pago` and adds a `Siguiente paso real` block derived from persisted truth. The bounded recheck/manual refresh behavior from patch pair 1 remains preserved. This is a bounded storefront checkout/payment UX continuity pass only: no backend change, no auth change, no guest persisted payment flow, no shipping, no stock reservation, no advanced checkout, and no admin/Cesarin OS expansion. Accepted with minor residual risk: coverage remains thinner on the new `PaymentPending.tsx`, `PaymentFailure.tsx`, and `OrderDetail.tsx` copy/CTA branches. Commit: `6de6106`.
- **Checkout Order Detail Payment Continuation CTA (DONE)**: `src/pages/OrderDetail.tsx` now exposes a real bounded `Continuar pago en Mercado Pago` action for authenticated persisted orders only when persisted truth shows the order is still payable: `payment_method === 'mercadopago'`, `payment_status === 'pending'`, and `status !== 'cancelled'`. The storefront reuses the existing continuation infrastructure through `src/services/payments/mercadopago.service.ts` and the accepted `create-payment` path; no backend redesign, no guest persisted payment flow, no shipping, no stock reservation, no advanced checkout, and no admin/Cesarin or drafting drift were added. Accepted with minor residual risk: there is still no direct test for the cancelled-order hide-CTA branch or the continuation-failure toast path.
- **Storefront Checkout Recovery & Completion Hardening (DONE)**: Storefront checkout/payment continuity now uses a shared persisted-truth-first continuation model across `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx`, backed by `getStorefrontPaymentContinuationView(...)` in `src/lib/domain/orders.ts`. Direct Mercado Pago continuation now appears only when persisted truth says the authenticated order is still payable: `payment_method === 'mercadopago'`, normalized payment status is `pending`, and the order is not cancelled. Non-payable states now use clearer continuity messaging instead of fake retry semantics. Previously accepted protections remain preserved: `PaymentSuccess.tsx` still does not infer paid from route semantics, cart clear stays paid-only, confetti stays paid-only, and bounded refresh/manual refresh patterns remain intact. This is still not guest persisted order/payment flow, not shipping, not stock reservation, not advanced checkout, and not backend payment redesign or webhook redesign. Accepted with minor residual risk: the continuation error-notification path is not deeply asserted across all four storefront surfaces.
- **Storefront Auth Convergence + Hardening (DONE)**: Storefront auth login completion now converges on real Supabase session state before post-login navigation resumes. `src/contexts/AuthContext.tsx` now hydrates `user` immediately from the resolved Supabase sign-in result, clears `loading` immediately after successful sign-in state is set, and moves `loadProfile(currentUser.id)` out of the critical completion path so profile fetch latency no longer blocks login completion. `isAuthenticated` still derives from `!!user`, `getSession()` plus `onAuthStateChange(...)` still own long-lived synchronization and session restoration, and `React.StrictMode` remains in place. This is a narrow storefront auth hardening pass only: no auth redesign, no checkout/payment expansion, no guest-flow expansion, and no admin/Cesarin OS scope. Accepted with minor residual risk: profile-specific UI may briefly trail raw auth convergence, and some duplicate profile fetch work may still occur across immediate sign-in and later bootstrap/listener flows. Commit: `968cfcb`.
- **Storefront Authenticated Reorder & Catalog Drift Hardening (DONE)**: Authenticated storefront reorder now derives from persisted `order_items` and current catalog truth instead of reconstructing fake historical `Product` objects on the client. `src/lib/domain/orders.ts` now provides shared storefront reorder planning over current product existence, active/discontinued state, stock, current cart occupancy, and conservative variant remapping; `src/hooks/useAuthenticatedOrderReorder.ts` centralizes the authenticated reorder path; and both `src/pages/Orders.tsx` and `src/pages/OrderDetail.tsx` now reuse that shared flow. Only safe items are re-added through the normal cart path, current catalog/cart pricing remains authoritative, mixed outcomes stay explicit (`full add`, `partial add`, `blocked/unavailable`, `manual review`), and variant drift stays conservative and non-guessing. This remains storefront-only reorder hardening for authenticated persisted orders: no guest reorder, no automatic order recreation, no automatic payment creation, no shipping, no stock reservation, no tracking/returns platform, no advanced checkout, and no payment-continuation redesign.
- **Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening (DONE)**: Authenticated storefront checkout now reuses an equivalent persisted pending order before creating a new one when the current checkout intent matches the same authenticated customer, the same `pending` / `pending` order-payment state, the same payment method, the same delivery type, the same normalized customer identity fields used by the implementation, the same item signature, the same shipping signature, and the same coupon code. `supabase/functions/checkout-submit/index.ts` now performs that bounded storefront-only reuse check first; `src/actions/checkout.ts` now exposes `reusedPendingOrder` while preserving `paymentContinuation = not_requested | ready | unavailable`; and `src/hooks/useCheckout.ts` now routes reused authenticated non-Mercado Pago orders to `/orders/:orderId` instead of the new-order / WhatsApp success path. Reused authenticated Mercado Pago orders stay inside the existing bounded continuation model: `ready` continues to Mercado Pago, and a persisted `orderId` without ready continuation routes to `/orders/:orderId`. Guest checkout remains unchanged as WhatsApp handoff only, with no guest persisted order/payment flow and no guest reorder. This remains duplicate-submission hardening only: not strong locking-based idempotency, not a broad payment recovery system, not an order-management platform, not shipping, not stock reservation, and not advanced checkout. Accepted with minor truth adjustments.
- **Storefront Auth Session Persistence & Bootstrap Failure (DONE)**: Storefront auth bootstrap no longer drops legitimate auth updates under `React.StrictMode` because `src/contexts/AuthContext.tsx` now restores the mounted-ref state on effect setup before cleanup registration. `AuthContext` remains the storefront auth source of truth, `src/main.tsx` still runs the shell under `React.StrictMode`, and session bootstrap still flows through `supabase.auth.getSession()` plus `supabase.auth.onAuthStateChange(...)`; no auth architecture redesign or server auth policy change was introduced. `src/contexts/__tests__/AuthContext.test.tsx` now covers StrictMode session restore and immediate sign-in hydration, guest route smoke verified clean redirects through `ProtectedRoute` and `AdminGuard`, and typecheck/build passed. Automated authenticated browser proof was not available in this pass because no safe local credentials were discoverable, and installed PWA parity was not newly proven here; however, the product owner manually verified that the visible storefront login/session failure symptom appears resolved. Accepted with minor truth adjustments.
- **Storefront Payment State Convergence & Order Lifecycle Coherence (DONE)**: Storefront authenticated persisted-order lifecycle interpretation is now centralized in shared domain logic instead of being reinterpreted per route. `src/lib/domain/orders.ts` now provides `getStorefrontOrderLifecycleView(...)` over persisted order/payment truth, and `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` now consume that same lifecycle view for state messaging, continuity notes, refresh labels, and order-detail CTA behavior. Continuation remains bounded to authenticated persisted payable Mercado Pago orders only, while accepted safeguards remain intact: no route-based paid inference, cart clear stays paid-only, and confetti stays paid-only. Validation for this lane remains focused rather than live-browser broad: domain/page tests passed, `typecheck` passed, and `build` passed. This is a storefront-only lifecycle convergence/hardening pass: not a payment architecture redesign, not a payment recovery platform, not guest expansion, and not shipping/stock/tracking/returns work. Accepted with minor truth adjustments.
- **Storefront Authenticated Orders Index & Actionability Hardening (DONE)**: The authenticated storefront orders index now uses a shared persisted-truth-first actionability reading instead of deciding actions ad hoc per card. `src/lib/domain/orders.ts` now provides `getStorefrontOrdersIndexActionView(...)`, derived from persisted lifecycle/payment truth, and `src/pages/Orders.tsx` now consumes that shared reading for action headline/detail, detail label, continue-payment visibility, and reorder visibility. Continuation remains bounded to authenticated persisted truly payable Mercado Pago orders only, while reorder is now suppressed on the index for active payment or validation trajectories where immediate repeat-purchase would be noisy or misleading. This improves index/detail coherence, but does not claim perfect symmetry: `src/pages/OrderDetail.tsx` still retains a broader secondary reorder affordance. Validation for this lane remains focused rather than live-browser broad: focused domain/page tests passed, `typecheck` passed, and `build` passed. This is storefront-only authenticated orders-index hardening: not guest order history/reorder expansion, not tracking/returns/cancellations work, not admin/Cesarin work, and not payment architecture redesign. Accepted with minor truth adjustments.
- **Storefront Purchaseability Truth & Cart Integrity Hardening (DONE)**: Storefront purchaseability and cart-integrity truth are now centralized through `getStorefrontProductPurchaseability(...)` in `src/lib/domain/products.ts`. That shared interpretation now informs PDP/add-to-cart surfaces in `src/components/products/ProductActions.tsx`, `src/components/products/StickyAddToCart.tsx`, and `src/components/products/QuickViewModal.tsx`, plus card-level behavior in `src/components/products/ProductCard.tsx`, cart/store correction in `src/stores/cart.store.ts`, and checkout entry/final-submit gating in `src/components/cart/CheckoutForm.tsx`, `src/pages/Checkout.tsx`, and `src/hooks/useCheckout.ts`. Variant-bearing products are no longer blindly quick-added from `ProductCard.tsx`; card-level action now routes into option-selection behavior instead. Cart validation and correction are now variant-aware, preserve/correct variant metadata, and checkout submission now uses corrected post-validation cart truth rather than stale pre-validation items. Final checkout progression now blocks when corrected cart truth leaves zero purchasable items or critical removal issues such as `variant_removed`, and `CheckoutForm.tsx` now gates final submit from purchasable-cart truth instead of raw item count. Some PDP and Quick View flows still auto-select the first currently purchasable variant; this lane does not claim explicit manual variant selection on every path. Focused tests passed, `typecheck` passed, and `build` passed. This remains storefront purchaseability/cart-integrity hardening only: not stock reservation, not inventory guarantees, not guest expansion, and not payment architecture rewrite. Accepted.
- **Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening (DONE)**: Storefront cart-to-checkout readiness now centralizes in shared domain logic through `getStorefrontCheckoutTransitionView(...)` in `src/lib/domain/cart.ts`, including shared `ready` / `review` / `blocked` transition truth and user-readable next-step messaging. `src/components/cart/CartSidebar.tsx`, `src/pages/Checkout.tsx`, and `src/components/cart/CheckoutForm.tsx` now consume that same shared runtime transition interpretation instead of deriving readiness independently per surface. `CartSidebar.tsx` now validates before navigation and blocks checkout entry when corrected cart truth leaves no purchasable items. `src/stores/cart.store.ts` now shares `lastValidationResult` as cross-surface runtime state, and cart mutations clear stale validation state after the user changes the cart. Focused tests passed, `typecheck` passed, and `build` passed. This remains storefront-only cart/checkout-entry/commitment hardening: not advanced checkout, not guest expansion, not shipping or stock-reservation work, and not payment platform redesign. Accepted with minor truth adjustments.
- **Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention (DONE)**: Storefront authenticated recovery truth now includes shared open-order recovery derivation in `src/lib/domain/orders.ts` via `getStorefrontOpenOrderRecoveryView(...)`, bounded persisted-order fetch in `src/services/orders.service.ts` via `getCustomerOpenRecoverableOrder(...)`, and shared consumption through `src/hooks/useOrders.ts`. `src/hooks/useCheckout.ts` now performs real pre-submit duplicate-checkout prevention before `submitCheckout(...)`, while `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` now prioritize recovery guidance when an authenticated persisted genuinely payable order already exists. Accepted invariants remain preserved: unchanged `submitCheckout` contract, unchanged `create-payment` server enforcement, no guest persisted expansion, no route-based paid inference, paid-only clear, paid-only confetti, and no reopening of bounded continuation/recheck behavior. Validation remains focused rather than live-browser broad: relevant tests passed `56/56`, `typecheck` passed, and `build` passed. This is storefront-only authenticated recovery hardening: not guest persisted flow, not order-management expansion, not shipping/tracking/returns/invoicing/support expansion, and not payment rewrite. Accepted.
- **Storefront Post-Purchase Confidence & Receipt Surface Hardening (DONE)**: Storefront post-purchase confidence is now strengthened through shared persisted-truth-first receipt derivation in `src/lib/domain/orders.ts` via `getStorefrontPostPurchaseConfidenceView(...)` and a shared receipt/revisit surface in `src/components/order/PostPurchaseReceiptCard.tsx`. `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now consume that shared post-purchase reading so payment return pages present clearer order identity, registered purchase summary, persisted state, and revisit paths back to order detail and orders history without relying on route semantics. `src/pages/OrderDetail.tsx` received only bounded next-step / visibility reinforcement, while the persisted-order-first read path in `src/hooks/useOrders.ts` and `src/services/orders.service.ts` remained intact. Accepted safeguards remain preserved: no paid inference from route semantics, paid-only cart clear, paid-only confetti, bounded continuation only for authenticated persisted genuinely payable orders, bounded manual refresh/recheck preserved, and no guest persisted order/payment flow introduced. Validation remains focused rather than live-browser broad: relevant tests passed `57/57`, `typecheck` passed, and `build` passed. This is storefront-only post-purchase/receipt hardening: not shipping, tracking, returns, invoicing, support-platform expansion, guest persisted flow, or payment rewrite. Accepted.
- **Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening (DONE)**: Storefront payment re-entry is now routed through a shared persisted-truth-first eligibility gate via `getStorefrontPaymentReentryView(...)` in `src/lib/domain/orders.ts` and a shared guarded hook in `src/hooks/useStorefrontPaymentReentry.ts`. The shared hook performs a fresh persisted recheck before opening Mercado Pago; continuation only proceeds when the fresh persisted order is found and remains genuinely payable. A bounded patch cleared the previously rejected stuck-UI defect: `continuingOrderId` is now explicitly cleared on both non-success exits after the fresh persisted recheck â€” when the fresh order is not found and when fresh persisted truth blocks re-entry â€” so the UI cannot be left stuck in an opening/loading state when continuation is blocked. `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`, `src/pages/Checkout.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` all now consume the shared re-entry derivation. `supabase/functions/create-payment/index.ts` session, ownership, and payable-state enforcement were preserved within bounded scope. Accepted invariants remain intact: unchanged `submitCheckout` contract, unchanged `useCheckout` duplicate-checkout prevention lane, no guest persisted expansion, no paid inference from route semantics, paid-only cart clear, paid-only confetti, no order-management expansion, and no payment rewrite. Validation was focused rather than live-browser broad: initial cold audit REJECT (stuck-state defect), bounded patch applied, re-verify ACCEPT â€” relevant storefront suite `28/28` passed, focused hook tests passed, `typecheck` passed, and `build` passed. This is storefront-only re-entry consistency hardening: not guest persisted flow, not order-management expansion, not shipping/tracking/returns/invoicing/support expansion, not payment architecture rewrite, and not admin/Cesarin work. Accepted.
- **Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification (DONE)**: `src/lib/domain/orders.ts` now exposes `StorefrontPurchaseJourneyActionFamily` and `getStorefrontPurchaseJourneyView(...)` as the canonical composition-based storefront purchase-journey helper. The helper now materially owns the primary visible CTA branch across `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/components/cart/CartSidebar.tsx`, `src/components/cart/CheckoutForm.tsx`, and `src/pages/Checkout.tsx` through shared `actionFamily`, `actionTarget`, and `actionLabel` outputs, with `data-storefront-action-family` sourced from that same canonical view. Real bounded precedence is now `CONTINUE_PAYMENT`, `WAIT_FOR_RESOLUTION`, `REVIEW_CURRENT_ORDER`, `RETURN_TO_CATALOG`, then `START_NEW_PURCHASE`. The helper remains composition-based over accepted persisted-truth storefront helpers rather than introducing a new commerce engine; non-continuation families are now actionable and helper-owned as well, with review/wait families targeting the persisted order route and return/new-purchase families resolving to `/` while cart/checkout surfaces may truthfully reinterpret those latter families as new-purchase flow where appropriate. Accepted invariants remain intact: storefront-only scope, no guest persisted order/payment flow, no guest reorder expansion, unchanged `submitCheckout` contract, unchanged `useCheckout` contract path, persisted-truth ownership for `/orders/:orderId` and payment pages, paid-only cart clear, paid-only confetti, and bounded refresh/recheck behavior. Focused local validation passed `9/9` files, `102/102` tests, and `typecheck`.

**Storefront Performance Canon Ã¢â‚¬â€ Catalog Zero Lag**

- **Regla de Oro de Animaciones de CatÃƒÂ¡logo:** Cualquier efecto dinÃƒÂ¡mico continuo (spotlight, parallax, seguimiento de cursor, overlays guiados por Framer Motion) en arreglos de catÃƒÂ¡logo de **8 nodos visibles o mÃƒÂ¡s** debe ejecutarse con `requestAnimationFrame` o CSS local variables previamente cacheadas. Queda prohibido recalcular geometrÃƒÂ­a (`getBoundingClientRect` o lecturas equivalentes de layout) en cada `mousemove`.
- **PolÃƒÂ­tica de degradaciÃƒÂ³n por dispositivo:** Estos efectos deben bloquearse de renderizar en dispositivos touch o sin `pointer: fine` para mantener los 60 FPS inquebrantables de la meta VSM.

---

**Post-Wave-193 Operator Tooling:**

- **Cesarin OS Admin IA Rationalization** (implemented, structurally validated): `AdminCesarinOS` now reads as an operating console instead of a flat power-user tab pile. Primary reading model changed to four work modes: monitor, review, configure, and lab. `Pilot` is the default cockpit; `Analytics` is explicitly secondary/historical; `Improvements` is framed as governed follow-up while `Interventions` stays as suggestion review. Operator copy was tightened across `Pilot`, `Analytics`, `Quality`, `Concepts`, and runtime parity surfaces to reduce jargon, remove fake certainty, and surface real next-action cues. No backend schema changes. No AI routing changes. Commit: pending current UX refactor lane.
- **Cesarin OS Graph-Assisted Operator Workbench** (implemented, accepted, closed): A92 extends the A91 read-only repo-graph subview inside `Conceptos` without changing its lane boundaries. `admin-repo-graph.service.ts` still statically consumes local `graqle.json`, but now also derives truthful related-set outputs for the selected node: `containerNode`, `sameContainerNodes`, `sameTypeNodes`, `pathLocalNodes`, and `nodeDirectory`. `TabRepoGraph.tsx` now adds operator list scopes (`General`, `Mismo contenedor`, `Mismo tipo`, `Ruta local`, `Review set`), quick context actions including `Copiar ruta`, related-surface cards, a dedicated review-set panel, and compact guidance blocks (`Si muestra`, `No prueba`, `Inspeccion siguiente`). The review set is explicitly local to the Repo Graph view, does not persist, and is lost on reload or when leaving the subview. No backend graph intelligence, live graph infrastructure, or runtime dependency proof is claimed. Commits: 599c058 (workbench extension), ec0389a (review-set honesty). Audit: A92.
- **Learning Intervention Workflow MVP** (implemented, manually tested): Admin-only operator panel for intervention recommendations. Signal capture + rule-based diagnosis + decision tracking. Cold-review validated. Manual testing confirmed operator workflow (approve/reject transitions, data persistence, filtering). Commit a28ec1e. No autonomous learning or auto-execution. Ready for operator trial use.
- **Description Downstream Bridge** (implemented, cold-review approved): `description` field now survives mapper/contract boundaries in product search pipeline (exact + semantic paths). Structural alignment verified. No UI display claim. Enables downstream consumption of semantic context. Commit: a28ec1e (no separate commit).
- **Description Consumption Discipline Remediation** (implemented, cold-review approved): `description` usage restricted to semantic fallback-only (BRANCH E). BRANCH C (exact match) uses `ai_sales_note` only. Helper filtering hardened: rejects boilerplate, category repetition, title duplication. All fallback paths preserve safe behavior. Commit: eb3566c.
- **Out-of-Stock Alternative Justification Upgrade** (implemented, cold-review approved): BRANCH D (OUT_OF_STOCK_ALTERNATIVE) now provides brief spec-based similarity justification when available. Compares key specs from exhausted exact product vs. suggested alternatives. Falls back to generic message when justification weak or unavailable (conservative behavior). No new field bridges. No feature expansion. Commit: eb3566c.
- **Featured Fallback Justification Adoption** (implemented, cold-adoption approved): BRANCH B (FEATURED_FALLBACK) tone refined for cautious ambiguity posture ("Veo opciones que podrÃ­an encajar" instead of "Tengo opciones interesantÃ­simas"). Includes optional specs cue when top featured product has useful specs. Falls back to generic message when specs unavailable. Language micro-fix applied for natural Spanish flow. Ambiguity discipline fully preserved (still invites clarification). Commit: 3e87a6c.
- **Knowledge Capsule Input Contract Integrity â€” is_ambiguous Zod Gap** (implemented, Zod-validated + live-deploy verified, closed): Symmetric gap to A82, applied to `knowledgeToolSchema`. `is_ambiguous` was required (`z.boolean()` with no default); two paths omitted it: (1) POLICY_INQUIRY guardrail injection pushed `{ query: query || '' }` without `is_ambiguous` â€” every guardrail-injected policy query failed Zod validation in `executeKnowledgeCapsule` before any RAG execution; (2) the single `knowledge_rag_foundation` few-shot example omitted the field, training the Analyst to omit it for all policy calls. Result: every POLICY_INQUIRY returned `buildDegradedKnowledgeContract('SCHEMA_ERROR', ...)` â€” "Actualmente no puedo consultar el manual de polÃ­ticas de forma automÃ¡tica" â€” the knowledge capsule had never executed real RAG retrieval in production. Three-point fix: `knowledgeToolSchema` hardened with `z.boolean().default(false)` as permanent defense-in-depth (`false` allows `HIGH_CONFIDENCE_POLICY_MATCH` at â‰¥0.82 similarity for specific queries); POLICY_INQUIRY guardrail injection now includes `is_ambiguous: true` (broad/unresolved intent â€” prevents false high-confidence match); few-shot example 2 corrected to `"is_ambiguous": false` (specific policy question). Validation: 15/15 Zod simulation PASS + 4/4 live probes PASS â€” "Â¿hacen envÃ­os?", "Â¿cuÃ¡l es la polÃ­tica de envÃ­os?", "Â¿cÃ³mo manejan pagos y envÃ­os?" all â†’ `knowledge_rag_foundation` capsule with `is_ambiguous` present, no DEGRADED fallback; "hola" remains Sommelier path. Live observation: all policy probes showed Analyst emitting `is_ambiguous` directly (`injected_tools: []`) â€” corrected few-shot is immediately effective. No schema migration. No client changes. No router or capsule redesign. Commit: d35b1ea. Audit: A86.
- **Structured Guardrail Decision Telemetry** (implemented, simulation-validated + live-runtime verified, closed): Key AI-routing decisions were operationally invisible in persistent telemetry â€” a single `ai_analytics` row could not reconstruct Analyst classification, guardrail overrides, injected tools, or capsule outcome. Five blind spots closed: (1) `analyst_intent` captured before any guardrail override; `guardrail_intent` captures the resolved value â€” delta is now queryable per row; (2) `guardrail_overrides[]` records which override rules fired (`COMPATIBILITY_FORCE`, `UNKNOWN_RESOLVE_*`, `TERMINAL_RECOVERY`) â€” A83/A84 hardening is verifiable from production telemetry without reading edge logs; (3) `injected_tools[]` lists tool calls where `reason === 'guardrail_injection'`; (4) `capsule_execution_status` and `capsule_match_strategy` extracted from capsule contracts â€” hardcoded `capsule_match_success: true` and `fallback_used: false` replaced with contract-derived values; capsule DEGRADED rate no longer masked; (5) cart path `detected_intent` corrected from `'search'` to `'cart_operation'`. `guardrailTelemetry` struct built in edge function after injection chain and appended to all three capsule router debug payloads + OUT_OF_DOMAIN server insert. Client extracts from `data.debug?.guardrail_telemetry` with `?? null`/`?? []` safe defaults â€” Sommelier path unaffected. No schema migration. No new table. Additive JSONB keys only. Simulation 23/23 PASS. Live runtime verification passed. Commit: be461cb. Audit: A85.
- **Cart Guardrail Injection Gap â€” CART_OPERATION Without Safety Net** (implemented, simulation-validated + live-deploy validated, closed): `CART_OPERATION` was the only capsule-routable intent with no guardrail injection safety net. After A83 strict AND routing, an Analyst output with `intent: CART_OPERATION` and `tool_calls: []` would fail the cart router's AND condition and fall through to the Sommelier general path â€” silent cart intent loss. Remediation: added a symmetric injection block for `CART_OPERATION` consistent with the pattern already established for `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, and `COMPATIBILITY_CHECK`. Conservative defaults: `action: 'ADD'`, `quantity: 1`, `product_ref: query` â€” downstream ambiguity handled by cart capsule. No schema migration. No client changes. No routing logic changes. Simulation 4/4 PASS (injection fires on missing tool call, skipped on existing, product and greeting paths unchanged). Live probe: "agrega un vape de uva al carrito" â†’ `cart_operator` path confirmed. All five capsule-routable intents now have complete injection coverage. Commit: 109e150. Audit: A84.
- **Router Precedence Hardening â€” OR-Arm Capsule Dispatch Weakness** (implemented, simulation-validated + live-deploy validated, closed): All three capsule router blocks used OR-arm conditions that allowed tool call presence alone (without matching intent) to trigger capsule delegation. Product search router's second OR arm could swallow `CART_OPERATION`, `ORDER_TRACKING`, and `INVENTORY_OUTLOOK` when the Analyst emitted a `product_search_integrity` call alongside a primary tool. Knowledge router's OR arm could swallow `CART_OPERATION` on `knowledge_rag_foundation` presence alone. These OR arms were designed as fallbacks for the case where the Analyst classified intent correctly but omitted the tool call â€” a role already covered by the guardrail injection chain, making the OR arms redundant and actively harmful in mixed-tool-call outputs. Remediation: all three routers changed to strict AND conditions (`intent === 'X' && capsuleCall`). Structurally safe because guardrail injections guarantee tool call presence for every routable intent before the router evaluates. No schema migration. No client changes. No injection logic changes. Deterministic simulation 7/7 PASS (proves both pre-A83 misroutes and post-A83 correct dispatch). Live probes 4/4 PASS. Residual: cart guardrail injection gap (CART_OPERATION with empty tool_calls) confirmed and addressed in A84. Commit: ba8ac33. Audit: A83.
- **Capsule Input Contract Integrity â€” is_ambiguous Zod Gap** (implemented, Zod-validated + live-deploy validated, closed): `productSearchToolSchema` required `is_ambiguous` as a hard boolean with no default. Two paths omitted it: (1) guardrail injection pushed `{ query, requires_semantic_expansion: true }` without `is_ambiguous` â€” every query reaching A81 terminal recovery degraded at capsule execution with "Tuve un inconveniente interpretando tu bÃºsqueda" instead of returning product cards; (2) five open-ended few-shot examples (examples 1, 5, 6, 7, 8) omitted the field, training the Analyst to omit it for the highest-frequency storefront query class. Three-point fix: guardrail injection now includes `is_ambiguous: true`; all five open-ended few-shot examples corrected to `is_ambiguous: true` (specific lookups in examples 12â€“15 unchanged); `ai-capsule-schemas.ts` hardened with `z.boolean().default(false)` as permanent defense-in-depth. Validation: 7/7 Zod contract cases PASS + 4/4 live probes PASS â€” "algo frutal barato" and "recomiÃ©ndame algo suave y rico" now route to `product_search_integrity` with valid args; "hola" remains greeting path with no regression. Secondary router OR-arm weakness is a separate concern outside A82 scope. No schema migration. No client changes. No new capsule. No routing behavior change â€” contract integrity hardening only. A81 terminal recovery is now genuinely executable end-to-end. Commit: 862ab05. Audit: A82.
- **UNKNOWN Escape Hardening â€” Guardrail Vocabulary Gap + Terminal Recovery** (implemented, live-deploy runtime validated, closed): Product queries using informal vocabulary, product type terms, or discovery verbs were escaping `PRODUCT_SEARCH` classification and falling through to Sommelier-only paths with no catalog grounding. Three defects closed: (1) `isProductMatch` regex expanded with real vape-store vocabulary â€” discovery verbs (`busco`, `buscas`, `tienen`, `tienes`, `hay`) and product type terms (`liquido`, `vape`, `pod`, `pods`, `mod`, `kit`, `kits`, `cartucho`, `cartuchos`, `desechable`, `desechables`, `dispositivo`, `vaporizador`); (2) dead guardrail branch 3 (`else if (isProductMatch && intent === 'UNKNOWN')` was unreachable) replaced by an unconditional terminal recovery: any intent still `UNKNOWN` after all guardrail conditions â†’ `PRODUCT_SEARCH`; (3) `RESPONSE_FORMAT_RULES` in `persona.ts` corrected â€” Sommelier no longer claims capsule routing authority it does not possess; `routed_capsule` schema updated to always null for Sommelier paths; routing note added clarifying Sommelier is the terminal responder, not a router. Validation: 7/7 live probes PASS â€” "o un liquido de juicee", "tienen pods de vaporesso", "busco un desechable", "hay cartuchos de waka" all â†’ `requires_client_capsule: true`, `capsule_name: product_search_integrity`. Preserved intents confirmed: greeting â†’ CHIT_CHAT Sommelier, policy/shipping â†’ KNOWLEDGE_CAPSULE, compatibility â†’ COMPATIBILITY_CHECK Sommelier. No client changes. No schema migration. No new capsule. No new wave. No base build bump. Commit: 4b89235. Audit: A81.
- **Memory Persistence Reliability â€” Await Hardening + Failure Acknowledgement** (implemented, unit-validated, materially closed): `persistMemory` in the edge function was fire-and-forget â€” write failures were silently discarded with no acknowledgement. Refactored into `memory.ts` module with typed return contract `MemoryPersistResult {ok, merged_interests, metadata_count, error}`. Both read and write ops are `await`ed; any failure returns `{ok: false, error: message}` without throwing. Callsite in `index.ts` updated to `await persistMemory(...)` â€” `!memoryResult.ok` emits `console.error` with customer ID and error; user response is not blocked. Unit validation 2/2 PASS: (1) deferred-write test confirms promise does not resolve until upsert resolves; (2) failure-path test confirms `{ok: false, error}` returned instead of silent success. Runtime probe (CHIT_CHAT path): user response intact, `server_telemetry_logged: true`. Memory row absent â€” root cause: sentinel UUID FK violation against `auth.users` (pre-existing schema constraint, not a regression). Real-customer write confirmation is environment-blocked (requires live auth session), not code-blocked. No schema migration. No user-facing behavior change. No new wave. No base build bump. Audit: A80.
- **Sommelier Edge Telemetry Completeness â€” Ownership Hardening + Response_Text Persistence** (implemented, post-deploy runtime validated, closed): Edge-owned turns could claim `server_telemetry_logged: true` before telemetry was durably written, and some rows had `response_text: null` despite returning prose. Two paths hardened in `customer-intelligence/index.ts`: (1) OUT_OF_DOMAIN â€” insert awaited; `response_text` now set to actual rejection prose (was `null`); `server_telemetry_logged: !oodTelemetryErr` (truthful). (2) Non-capsule Sommelier â€” analytics moved AFTER TEXT GUARANTEE so `response_text` always reflects final guaranteed prose; insert awaited; `server_telemetry_logged = !analyticsErr` (truthful); guarded with `!requires_client_capsule` so capsule paths remain client-owned with `server_telemetry_logged = false`. Insert failure on any path: `server_telemetry_logged = false` â†’ client fallback activates â†’ no telemetry lost. Memory persistence fire-and-forget unchanged (out of scope). Validation: fresh OUT_OF_DOMAIN and CHIT_CHAT rows both confirmed non-null `response_text` matching actual reply prose; `server_telemetry_logged: true` truthful in both cases. No schema migration. No new wave. No base build bump. Commit: e8d3a28. Audit: A79.
- **Offer Evidence Lane â€” Offered Products Persistence + Operator Grading Visibility** (implemented, post-deploy runtime validated, closed): Operator could see response prose and card count for product-answer turns but not which products were offered. Root cause: `capsuleContract.resolved_products` existed at log time in `concierge.service.ts` but only `.length` was extracted. Three-scope fix: (C) `logAITelemetry` extended with `offered_products?: [{id, name, slug}]`; persisted into `ai_logic_debug` JSONB â€” no schema migration. (B) `OfferedProduct` type added; `PilotQueryRow.offered_products` added; `mapRow` extracts with type-guard filter. (A) `ReviewDrawer` renders compact "Productos Ofrecidos" section gated on `offered_products.length > 0`; `AdminCesarinOS` wires field through. Validation: live row `"algo de mango o menta"` â†’ 4 products confirmed in `ai_logic_debug.offered_products`, name-match exact. Historical rows have no offered snapshot by design â€” section hidden. Non-product paths unaffected. No new wave. No schema migration. No base build bump. Commit: a761e65. Audit: A78.
- **Operator Visibility Lane â€” Tab 8 Response Preview + Response_Text Persistence** (implemented, post-deploy runtime validated, closed): Two structural gaps repaired. (1) Tab 8 / PilotTelemetry: added compact "Respuesta" preview column (55-char truncation, full text in tooltip) â€” `response_text` was already in `PilotQueryRow` type and SELECT but never rendered. (2) Simulator ReviewDrawer: fixed stale `.select('response')` â†’ `.select('response_text')` in `handleReviewLastSimulatorTurn` â€” drawer was blank for all simulator-triggered evaluations. Root cause of both: `logAITelemetry` in `concierge.service.ts` never inserted `response_text` (all 187 historical rows null). Upstream persistence repaired: `response_text` added to INSERT payload across all 5 callsites (product_search = `customer_response_draft`, knowledge_rag = `ui_render_hint`, cart = null, generic = actual response text, error = null). Post-deploy validation: 2 live rows confirmed non-null `response_text` via anon INSERT + service-key read-back. Historical null rows display as `â€”` by design, no backfill. No schema migration (column pre-existed). No RLS changes. No new wave. No base build bump. Commits: b4d9b8e (UI fixes), 81ff8fa (persistence repair). Audit: A77.
- **Retrieval / Fallback Discipline Hardening** (implemented, post-deploy runtime validated, closed): Three-layer fix for four confirmed runtime failure patterns (out-of-domain routing, type-intent mismatch, low-confidence substitution). Layer 1: `OUT_OF_DOMAIN` intent + fast-path in Analyst (index.ts) â€” scope-rejection with no product cards; `requires_semantic_expansion` REGLA + 4 few-shot examples for specific brand/model/type queries. Layer 2: Orchestrator enforces `requires_semantic_expansion=false` by skipping semantic search entirely; `match_threshold` raised 0.4â†’0.55. Layer 3: BRANCH E language tightened to semantic-uncertainty posture. MICRO-FIX A applied: BRANCH B now falls through to Branch F `NO_MATCH` when `featuredProducts.length === 0` (defensive guard, existing behavior unchanged when products present). MICRO-FIX B evaluated and not needed. 6-query post-deploy validation: all PASS. No new wave. No base build bump. No downstream drafting hierarchy (A67â€“A75) reopened. Commits: a4ca51e, aea7944. Audit: A76.
- **BRANCH B Wording Naturalness Polish** (implemented, reconciled): BRANCH B optional specs cue refined for natural Spanish. Replaced floating `"sobre todo algunos"` with `"incluyendo algunas"` â€” `"algunas"` back-refers to `"opciones"` already in the sentence. Wording-only. Ambiguity discipline, fallback behavior, and branch logic unchanged. Commit: 9ac2b05. Audit: A75.
- **BRANCH D OOS Alternative Hierarchy Alignment** (implemented, reconciled): BRANCH D OUT_OF_STOCK_ALTERNATIVE now uses disciplined 4-tier justification (both specs â†’ alternative specs â†’ ai_sales_note â†’ generic). `ai_sales_note` of top alternative used as fallback when specs unavailable. Note formatting preserved. Tier 3 wording refined for natural Spanish (em-dash, 'disponible'). No orchestrator/RPC/schema changes. Deployable within scope. Commit: a0d2389. Audit: A74.
- **BRANCH F No-Match Recovery-Guidance Refinement** (implemented, reconciled): BRANCH F no-match response remains safe and honest. Recovery guidance now actionable: brand, flavor, device type, or specific model keywords suggested for reformulation. No candidate product invented, no availability implied. Wording-only change. Deployable within scope. Commit: 278eedb. Audit: A73.
- **BRANCH E Semantic Hierarchy Alignment** (implemented, reconciled): BRANCH E semantic drafting now uses disciplined 4-tier hierarchy (specs â†’ ai_sales_note â†’ description â†’ generic). `ai_sales_note` used when specs unavailable, note formatting preserved (no forced lowercasing), description tier tone softened to match semantic uncertainty. No orchestrator/RPC/schema changes. Semantic lane refinement only. Deployable within scope. Commit: 29433be. Audit: A72.
- **Exact-Path Improvement: Context Lift + Fallback Naturalness** (implemented, approved for reconciliation): BRANCH C exact path now carries full product context (description + specs fields). Schema extended, exact query select enhanced, BRANCH C fallback logic tiered (ai_sales_note â†’ specs â†’ generic). Phrasing refined with Viene verb for natural Spanish ("...Viene con sabor menta..."). Includes small downstream public-contract alignment (description propagated to public attachment schema via mapper). Real needed fix relative to committed HEAD (workspace drift resolved). No semantic lane reopening. Deployable within scope. Commits: 2b8be13, 33aa6b0. Audit: A71.
- **Pilot Miss Taxonomy Panel Semantic Stabilization** (implemented, Codex-validated, closed): `MissTaxonomyPanel` categorizes query outcomes into six operational buckets (`product_search_miss`, `semantic_match_miss`, `fallback_miss`, `policy_miss`, `guardrail_miss`, `otro`) with strict first-match-wins precedence. Four Codex blockers resolved: (1) **Precedence**: arbitrary category evaluation order replaced by deterministic precedence â€” `zero_product_cards` â†’ `fallback_used` â†’ `semantic_match_success` â†’ `policy_query` â†’ `guardrail_rescue` â†’ `otro`, computed once per row with `categorized` tracking flag, no overlap possible; (2) **Fallback narrowing**: `fallback_miss` now semantically accurate â€” only rows where `fallback_used=true && semantic_match_success=false` (fallback became necessary because semantic failed); (3) **Out-of-domain cardinality**: out-of-domain queries (scope rejections, guardrail decisions) now excluded from all operational miss categories via `!row.out_of_domain` guard on both `guardrail_rescue` and `otro`; (4) **Otro purity**: final catch-all narrowed to `!categorized && semantic_match_success===false && !out_of_domain` â€” only unmatched semantic queries that are in-domain. Separate data flows: `fullQueryLog` (unfiltered, used for taxonomy) vs `queryLog` (user-scoped, used for table displays). No schema migration. Operator-facing taxonomy now semantically truthful: categories correspond to actual operational outcomes, not interpretation artifacts. Three-pass implementation: Pass 1 (8bf96f4) established 6-category model with strict precedence; Pass 2 (fd8382e) addressed fallback narrowing and out-of-domain separation; Pass 3 (9844516) hardened residual bucket purity. Commits: 8bf96f4, fd8382e, 9844516. Audit: A87.
- **Cesarin OS TabLearning â€” Rule/Improvement Closure Semantics Clarity** (implemented, Codex-validated, closed): `TabLearning` friction-signal evaluation flow enhanced for operator clarity on signal-to-action outcomes. Four possible outcomes now explicitly distinguished: (1) **Pending review** â€” new "Pendiente revisiÃ³n" indicator for unacted signals; (2) **Converted to rule** â€” status label "Directriz creada" + contextual sublabel "InstrucciÃ³n activa" clarifies that an active guideline was created; (3) **Converted to improvement** â€” button copy changed "Abrir en mejoras" â†’ "Crear mejora", status shows "Mejora creada" + "En cola de mejoras", making the action direct and unambiguous; (4) **Reviewed without action** â€” status label changed "Descartada" â†’ "Revisada sin acciÃ³n", sublabel "Evaluada, cerrada" provides positive framing and decisiveness. Additional clarity improvements: (a) ref_label now marked "ID: {value}" so the identifier reference is explicit; (b) button titles refined for actionable intent ("Convertir en directriz activa que guÃ­e respuestas futuras", "Crear mejora en la cola de tareas", "Marcar como revisada sin cambios requeridos"); (c) header instruction clarified to enumerate the four outcomes. No behavioral changes. No telemetry impact. A87 (Miss Taxonomy) untouched. Scope bounded to TabLearning presentation layer. Build: v113-3f2caf7. Commit: 3f2caf7. Audit: A88.
- **B1: Cesarin OS Intake & Review Consolidation** (implemented, Codex-accepted, closed): Cross-surface truth gap closed between `cesarin_signal_states` (TabLearning) and `ai_evaluations` (ReviewDrawer). Four changes: (1) `admin-eval.service.ts` â€” `getEvaluationsByIds(ids)` batch fetch added (mirrors `getSignalStatesByIds` pattern); (2) `ReviewDrawer.tsx` â€” signal state cross-reference panel added: on open, loads `cesarin_signal_states` entry for the interaction in parallel with evaluation fetch; `SignalStatePanel` strip renders status chip, ref_label, and handled date between Route/Capsule context and Scoring sections; (3) `PilotTelemetry.tsx` â€” `evalMap` batch-fetched when `queryLog` changes; `QueryRow` receives `evalMap` + `signalStates` prop (from existing page-level hook, no redundant DB fetch); "Revision" column shows `â˜…N` score badge (color-coded â‰¥4/3/<3) and signal state badge (`â†’R`/`â†’M`/`âœ“`/`âœ•`/ðŸ‘) before the review button; (4) `TabPilot.tsx` â€” pre-existing breakage fixed: `PilotParityDiagnostics` import missing, 3 unused lucide imports and `useMutation` removed. Build: v113-cc8c0f9, 0 typecheck errors, 0 ESLint errors. Formal cold audit generated (`B1_CROSS_SURFACE_AUDIT.md`). Codex review cycle: initial review â†’ narrow corrective (1116428) â†’ micro-corrective (f11861b) â†’ nano-corrective (cc8c0f9) â†’ final Codex ACCEPT (2026-03-23). Closure entry added to AUDIT_LOG.md. Status: **CLOSED**.
- **B2 Pass 1: Operator Simulation Workspace â€” Reusable Private Case Draft Minimum Loop** (implemented, Codex-accepted with residual risk, pass 1 closed): Minimum reusable private case draft loop operational within Cesarin OS. Scope bounded to simulator, QA, and training case surfaces â€” search/retrieval, semantic quality, and broad OS redesign out of scope. Delivered: (1) `operator_case_drafts` table migration with full RLS, source_type/readiness_status check constraints, 3 indexes, updated_at trigger; (2) `PrivateCaseDraft` type + `CaseDraftSourceType`/`CaseDraftReadinessStatus` + `SimulationResult.user_input` field added to `cesarin.ts`; (3) `admin-case-drafts.service.ts` â€” create/get/update/delete + `deriveCaseDraftReadiness` utility; (4) `ReviewDrawer.tsx` â€” "Guardar como Caso de Prueba" footer button + `handleSaveAsCaseDraft()` handler; (5) `TabQuality.tsx` â€” `BookmarkPlus` save-draft button on non-PASS results, judge path corrected to use `result.user_input ?? scenario_id`, details drawer corrected from hardcoded placeholder to real input, `evaluation_score` mapped from `result.score` (0â€“1) to 1â€“5 integer; (6) `TabCaseDrafts.tsx` â€” minimal queue with readiness badges, source badges, hover-delete, refresh; (7) AdminCesarinOS `casos` tab wired (lab group). `savePilotFeedback` converted from unreviewed DB write to explicit not-implemented throw (no `pilot_feedback` migration in repo). `simulate_cesarin.ts` stores `user_input` on all new simulation results. Corrective micro-pass (231c57b) closed Codex rejection of initial pass (6e34d7c). Residual risk: historical `ai_simulation_reports` rows pre-pass have no `user_input`; fallback to `scenario_id` is truthful. B2 pass 1 is not full B2 completion. Commits: 6e34d7c (pass 1), 231c57b (corrective). Build: v113-f0e64e7, 0 typecheck errors. Codex: **ACCEPT WITH RESIDUAL RISK**.
- **B2 Pass 2: Operator Simulation Workspace â€” Private Case Draft Maturation Loop** (implemented, Codex-accepted, pass 2 closed): `TabCaseDrafts` upgraded from passive read-only queue to real operator-facing draft maturation surface. One file changed (`TabCaseDrafts.tsx`); service and types unchanged (hash-verified). Delivered: (1) row click opens slide-in maturation drawer; (2) captured source data shown read-only (input, observed response, detected intent, route/capsule, evaluation score); (3) editable fields: `expected_outcome`, `failure_reason`, `evaluation_summary`; (4) `readiness_status` live-computed via `deriveCaseDraftReadiness` from form state â€” active signal, not static label; (5) save via existing `updateCaseDraft` + optimistic local state update; (6) `hasUnsavedChanges` detection with "Sin guardar" badge and save-button guard; (7) delete closes drawer when open draft is deleted; (8) header shows "X listos" count. Codex audit confirmed scope discipline, form sync correctness, change detection, and optimistic update coherence. Non-blocking risk: backdrop-click dismisses without confirmation â€” consistent with codebase drawer patterns. No simulator integration, no scenario generation, no new entities. B2 as macro wave remains open. Commit: 98bdf80, 0 typecheck errors, Vite build clean. Codex: **ACCEPT**.
- **Cognitive Integrity Pack â€” Analyst Contract, Routing Truth, Parse Hardening & Telemetry Closure** (implemented, Codex-validated, closed): Four root cognitive contradictions resolved in `customer-intelligence/index.ts` and `concierge.service.ts`. (1) **Analyst contract truth**: `COMPATIBILITY_CHECK` added to the Analyst intent enum (line 297) â€” contract now matches training rules and guardrail logic. (2) **Routing truth**: `COMPATIBILITY_CHECK` is truthfully fallback-handled by Sommelier (no dedicated client capsule exists); fake pre-routing to a non-existent `compatibility_check` capsule was removed. Pre-routed intents are `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `CART_OPERATION`, and `OUT_OF_DOMAIN` only. (3) **Parse hardening**: Analyst parsing replaced with layered contract validation â€” direct JSON.parse first, regex fallback only for leading/trailing text, intent validated against `VALID_INTENTS`, `tool_calls` validated as array, `analystParseValid` flag gates safe degradation. Degradation condition fixed from `geminiError && !rawAnalystText` to `geminiError || !analystParseValid` â€” malformed nonempty output now explicitly degrades. Sommelier parse hardened with empty-text guards. (4) **Telemetry truth end-to-end**: `routing_path` field (`'pre_routed'` | `'fallback_handled'`) added to all debug payloads (edge-side) and to `logAITelemetry` signature + `ai_logic_debug` persistence (client-side). All three capsule call sites (`product_search_integrity`, `knowledge_rag_foundation`, `cart_operator`) now extract and persist `routing_path: 'pre_routed'` from edge debug payload. Two Codex rejection passes required before ACCEPT: first rejected for hollow compatibility route + missing client-side routing_path + weak Analyst degradation; second (micro-lane) rejected for client-owned capsule telemetry missing routing_path. All findings resolved. No schema migrations. No UI changes. Operator Surface Consolidation Pack (macro wave B) remains deferred as next candidate. Build: 0 typecheck errors. Codex acceptance: ACCEPT. Audit: A90.
- **Cesarin OS Production Hardening Pack â€” Closure & Acceptance** (implemented, Codex-validated, closed): Three-part production hardening pack now accepted and closed. (1) **Gap 1: Server-Trusted Auth Enforcement (CLOSED)** â€” `customer-intelligence/index.ts` lines 175-228 replace decode-only JWT validation with server-side Supabase Auth verification via `supabase.auth.getUser(bearerToken)`. Unauthorized requests return 403 Forbidden BEFORE any protected AI work (Gemini, tools, Judge). Trust source is server-verified Supabase Auth, not client-controlled body parameters. (2) **Gap 2: Gemini Resilience / Fallback (ACCEPTABLE, PRESERVED)** â€” Analyst (20s timeout, 429/5xx handling, fallback to PRODUCT_SEARCH) and Sommelier (25s timeout, 429/5xx handling, on-brand fallback text) timeout and error-handling logic remains intact and acceptable. Text guarantee maintained. JSON contract shape preserved. (3) **Gap 3: Async QA Judge Persistence (CLOSED)** â€” `cesarin-qa-judge/index.ts` implements `evaluate_turn` action with truthful persistence to `ai_evaluations` table using real schema from `20260319_human_evaluation_loop.sql`. Gemini output maps conservatively: `score` (1-5 normalized from relevance 1-10), `primary_tag` ('turn_quality_evaluation'), `secondary_tags` (issues array), `severity` (critical/high/medium/low computed from hallucination + relevance), `expected_outcome` (Gemini recommendation), `comment` (composite audit trail), `evaluator_id` (NULL for Gemini eval). No invented columns. Trigger conditions: `frustrationDetected OR (intent=PRODUCT_SEARCH AND productCardCount=0)`. Fire-and-forget IIFE, 5s best-effort timeout, silent failure. **A87 Semantics Restored:** PilotTelemetry.tsx reverted to commit ef012fb (A87 original state) â€” all six categories restored (`ruta_error`, `producto_sin_cards`, `unknown_rescatado`, `fallback_sin_capsula`, `dominio_rag`, `otro`), first-match-wins precedence preserved, frustration as independent secondary signal, out-of-domain exclusion logic restored. Admin telemetry properties (`gemini_api_error`, `tool_error_count`, `sommelier_fallback_reason`, `out_of_domain`) restored to `admin-pilot-ops.service.ts` for A87 taxonomy support. No unrelated spillover remains. **Build Status:** Exit code 0, 24.49s, no typecheck errors. **Final Accepted Corrective Pass:** 35208ad. Codex acceptance: ACCEPT. Audit: A89.
- **Cesarin Hyperlocal Personality Engine** (implemented): Ajuste de ingenierÃ­a de prompts base (`persona.ts`) para inyectar "colmillo" comercial. CÃ©sarÃ­n adapta su dialecto conversacional detectando la regiÃ³n del cliente (ej. norte="compare", costa="brody", chilango="paps") de manera fluida y sutil, para volverse una entidad empÃ¡tica que vende, entretiene y nunca suena como un robot corporativo.

- **GraQle Cloud Offloading (Heavy Computation CI/CD)** (implemented): Carga pesada de cÃ¡lculo de embeddings y parsing del AST del Knowledge Graph mudada de la CPU local del operador hacia runners remotos (GitHub Actions). El pipeline (`.github/workflows/graqle-sync.yml`) instala el core de GraQle (Python) y corre `graq grow` (incremental update) inyectando de forma asilada `GEMINI_API_KEY` como secret. Eliminamos el bloqueo local por falta de recursos / asfixia de mÃ¡quina local, manteniendo el frontend enteramente SPA y reintroduciendo asimetrÃ­a DevOps segura.

- **Admin Orders Panel CRUD (DONE â€” Wave 193+)**: GestiÃ³n administrativa completa de pedidos implementada y validada. Arquitectura: `lib/domain/orders.ts` (reglas de transiciÃ³n de estado `canTransitionTo`, `ADMIN_ORDER_STATUSES_LIST`, `ORDER_STATUS_TRANSITIONS`) â†’ `services/admin/admin-orders.service.ts` (getAllOrders con JOIN a customer_profiles + addresses, updateOrderStatus, updateOrderPaymentStatus, updateOrderTracking, exportOrdersToCSV) â†’ `hooks/admin/useAdminOrders.ts` (TanStack Query + bÃºsqueda local + filtro de fecha + paginaciÃ³n + bulk update + invalidaciÃ³n cruzada de stats/recent-orders) â†’ Componentes: `OrderListCard.tsx` (tarjeta expandible con selector de status + input de guÃ­a), `OrdersKanbanBoard.tsx` + `OrderBoardCard.tsx` (vista tablero por columna de status), `OrderDetailDrawer.tsx` (SideDrawer off-canvas con productos, tracking editable, WhatsApp 1-click, selector de status validado), `OrdersHeader.tsx` + `OrdersFilter.tsx` (filtros y bÃºsqueda) â†’ `pages/admin/AdminOrders.tsx` (thin component, paginaciÃ³n PAGE_SIZE=10, bulk action bar flotante) â†’ Ruta: `/admin/orders`, con entrada "Pedidos" en el nav sidebar de AdminLayout (badge de pending orders). Dominio de estados: pendingâ†’confirmedâ†’processingâ†’shippedâ†’delivered (terminales) + cancelled (terminal desde cualquier estado pre-shipped). AutomaciÃ³n: mover a processing/shipped/delivered actualiza payment_status a 'paid'.
- **Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening** (implemented, accepted, closed): Cesarin operator review now reads one canonical decision-trace story instead of reconstructing fragmented telemetry across surfaces. `src/services/admin/admin-decision-trace.service.ts` adds the bounded read model over already-persisted decision/logic-debug truth, including analyst intent, final routed intent, routing path, capsule vs non-capsule execution, guardrail overrides, injected tools, execution status, degraded/fallback reason, retrieval source/match strategy, response text, and trust labels `authoritative_runtime | partial_runtime | simulated`. `src/components/admin/cesarin/CesarinDecisionTracePanel.tsx` is the shared causal panel; `ReviewDrawer.tsx` now materially uses it, `PilotTelemetry.tsx` exposes canonical trust labeling from it, simulator-triggered review in `AdminCesarinOS.tsx` now reconstructs/preserves persisted trace context instead of reopening a stripped row, and `TabQuality.tsx` reuses the same model while labeling simulation honestly. This lane stayed bounded to admin/Cesarin operator trust hardening only: no storefront work, no routing redesign, no guardrail architecture rewrite, no analytics-platform rewrite, and no invented signals. Focused validation passed (`2` files / `4` tests, `typecheck`, `build`). Residual risk remained bounded to narrow test depth and historical rows that can only render `partial_runtime` when persistence is incomplete. Commit: 430247e.
- **Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening** (implemented, accepted, closed): Cesarin operator workflow now reads one canonical lifecycle/evidence story from simulation or review finding through recommendation, intervention, improvement-item state, and closure evidence instead of drifting across disconnected admin surfaces. `src/services/admin/admin-improvement-workflow.service.ts` provides the bounded admin workflow read model over existing persisted entities and services, exposing honest lifecycle states `detected | triaged | approved | rejected | implemented | validated | closed` and honest evidence kinds `authoritative | partial | simulated | missing`. `src/components/admin/cesarin/CesarinImprovementWorkflowPanel.tsx` is the shared lifecycle/evidence panel; `ReviewDrawer.tsx`, `TabQuality.tsx`, `TabInterventions.tsx`, `TabImprovements.tsx`, and `PilotTelemetry.tsx` now materially share that workflow truth, while targeted hydration by analytics/source refs is real through the aligned admin services. Missing direct linkage between `intervention_recommendations` and `cesarin_improvement_items` remains explicit as partial/missing evidence rather than being fabricated. This lane stayed bounded to admin/Cesarin workflow hardening only: no storefront work, no analytics-platform rewrite, no fake PM/ticketing platform, and no invented lifecycle links. Focused validation passed (`4` files / `7` tests, `typecheck`). Residual risk remained bounded to selective test depth and a thinner PilotTelemetry presentation than the deeper review surfaces. Commit: 5bbb2b3.
- **Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening** (implemented, accepted, closed): Cesarin OS simulator now operates as one bounded admin conversation lab instead of a fragmented one-shot prompt surface. `src/services/admin/admin-simulation-lab.service.ts` provides the canonical simulation-lab read model over persisted simulation-session truth, while `AdminCesarinOS.tsx` now persists structured simulated turn records plus session metadata and hydrates selected-turn trace/workflow evidence from the existing review systems. `TabSimulator.tsx` now renders a materially useful multi-turn transcript, selected-turn inspector, lifecycle state, honest error/runtime labeling, and per-turn review handoff. Simulator continuity remains explicitly bounded to persisted session truth and the accepted runtime context window, with legacy sessions falling back to truthful reconstruction from `history` rather than invented cross-session memory. This lane stayed bounded to admin/Cesarin simulation hardening only: no storefront work, no architecture rewrite, no fake multichannel/chat platform, and no production-equivalence claim beyond accepted simulator scope. Focused validation passed (`5` files / `11` tests, `typecheck`). Residual risk remained bounded to missing dedicated end-to-end handler tests and thinner legacy-session evidence. Commit: 05e5a0d.
- **Cesarin OS â€” Operational Truth Convergence** (implemented, accepted, closed): Cesarin OS operator surfaces now converge more truthfully across the existing pilot, knowledge, and concepts workbenches instead of mixing real persisted state with synthetic local interpretations. The accepted main lane (`1dc927d9ef5fb53c79ace78837c031f5cd3893a0`) made `TabPilot` consume the same real lab/runtime/session spine already used by Conversation Lab, made knowledge post-write state rehydrate authoritative persisted `store_knowledge` rows after writes/toggles instead of keeping synthetic client truth, and exposed persisted concept creation plus alias add/remove inside the existing concepts workbench. The accepted residual micro-fix (`4bca1373c77e31566b84379b742128f155a7064a`) is folded into final closure here: a selected historical pilot turn is now labeled as selected history rather than presented as the latest real turn, and concept summary relation truth now counts total incoming + outgoing persisted edges while the detailed relations view remains explicitly directional. This lane stayed bounded to targeted Cesarin OS/admin truth/coherence only: no storefront work, no broader admin architecture rewrite, no full Cesarin OS completion, no concept deletion support inside this workbench, and no claim that the environment-specific hanging `TabPilot.test.tsx` harness is resolved.
- **Wave 192 (DONE)**: Knowledge Ops Manager. Formal administrative tooling inside Cesarin OS (`TabKnowledge` & `TabConcepts`) for safe vector syncs and directional graph edits. Base Build v112.
- **Wave 191 (DONE)**: Canonical Closure of Compatibility & Concepts Layer. Validation suite 13/13 PASS. Deployment drift resolved (V121 uses correct `gemini-2.5-flash` model).
- **Wave 190 (DONE)**: Cesarin Human Evaluation Loop â€” Implementation of supervised review entity, simulation isolation, and v1 API protocol alignment.
- **Wave 189 (DONE)**: Analyst Refinement Loop â€” Improved first-pass intent classification.
- **Wave 188 (DONE)**: Knowledge Enrichment Loop â€”
## 1. Project Vision & Identity
**VSM Store (Vape Shop & More)**
Una PWA SPA de e-commerce para una tienda de vapeo y productos 420 base en Acapulco, Guerrero (MÃ©xico), operando ventas a nivel nacional. La aplicaciÃ³n sirve como vitrina rÃ¡pida, manejador de carrito persistente y panel administrativo impulsado por IA. CÃ©sarÃ­n, el "Conserje" IA (Sommelier/Analyst), ofrece atenciÃ³n a clientes nativa en la UI usando streaming JSON y adaptaciÃ³n regional mexicana para maximizar el engagement comercial.
- **Storefront AI Pilot (DONE)**: Slices 1Aâ€“2D closed. Phase 3.2C (Semantic Activation) closed.
- **Status:** **FULLY OPERATIONAL â€” Cleared for Unrestricted Pilot (Base Build v112)**
- **Current storefront recovery state:** Exact misses can recover through bounded token-based catalog matching when `requires_semantic_expansion === false`; embedding-driven semantic recovery remains a separate path. Ambiguous and exploratory product turns now also use sharper single-axis clarification plus decision-guide framing so the customer is pushed toward a clearer product choice, PDP inspection, or cart action. Drafting, UI labels, and telemetry still preserve `capsule_match_strategy` and `capsule_retrieval_source` truthfully.
- **Current storefront CÃ©sarÃ­n Stage 1 state:** The storefront assistant now uses a shorter, more oral, more honest sales voice under uncertainty, with a slimmer and less seller-scripted core identity; approximate product recovery is collaborative and visible inside the chat surface through `Esta se parece mÃ¡s` / `Ninguna`; honest WhatsApp escalation is used when rescue is no longer working; unresolved weak-intent turns are no longer terminally forced into `PRODUCT_SEARCH`; and visible `cart_operator` copy now follows the same Stage 1 voice discipline instead of older fixed robotic rewrites. This still does not provide deep customer memory, autonomous learning, or a fake human-support capability beyond the real WhatsApp path.
- **Current storefront CÃ©sarÃ­n Stage 2 state:** Authenticated returning customers now have lightweight taste-memory continuity through compact stored preference signals and summary injection, bounded to `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`. Evidence stays conservative (`inferred`, `explicit`, `confirmed`, `rejected`), current-turn intent always overrides stored memory, weak hints do not become hard truth immediately, guests still do not get fake durable memory, and the recency/hit metadata for interests is now honest: historical interests only gain reinforcement when they are actually re-observed in the current turn.
- **Current storefront CÃ©sarÃ­n Stage 3 state:** The storefront assistant now uses that same bounded taste memory as real commercial bias for authenticated returning customers: remembered likes can lift relevant options, remembered rejections can push stale dead ends down, budget posture can influence ordering conservatively, and the existing approximate recovery loop now inherits better top suggestions because reranking happens before recovery selection. This still does not create a giant ranking engine, deep transcript memory, fake guest persistence, or any creepy/overconfident memory claim.

Una PWA SPA de e-commerce para una tienda de vapeo y productos 420 en Acapulco, MÃ©xico. Dos verticales: **Vape** (azul) y **420/Herbal** (verde). Dark-only. Experiencia inmersiva con **Tactical UI** y **AI Concierge**. Deploy en **Cloudflare Pages**.

- **Current storefront CÃ©sarÃ­n Stage 4 state:** The storefront assistant still retains bounded conversation-mode shaping `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE` where it remains useful, but Wave 2 means this shaping no longer gets to dominate a materially different current turn. `conversation_mode_hint` is not a required runtime contract, and Stage 4 remains bounded to the main commercial/product-search lane rather than all CÃ©sarÃ­n behavior.

- **Current storefront CÃƒÂ©sarÃƒÂ­n Stage 5 state:** The storefront assistant now also resolves one bounded next actionable storefront step after recommendation through `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`. Stage 5 runs after Stage 3 reranking and Stage 4 posture shaping, hydrates real product data before deciding the next move, attaches `next_step_view` to the capsule contract, and renders a real `Siguiente paso` block in the UI using existing `OPEN_PDP` and `ADD_TO_CART` storefront actions only when the support is real. Selector-needed behavior stays grounded in real product/variant evidence, compare/exploration remain honest, and current-turn intent can still block stale memory/posture from forcing action confidence.

### Current Wave 4 Response Shape State
- The storefront assistant now also applies explicit anti-bloat response shaping.
- Runtime/storefront output is compacted through `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)`.
- Stage 4 no longer appends an extra commercial tail when the base move is already present.
- Stage 5 keeps the actionable move in `next_step_view` instead of duplicating it in main text.
- Storefront rendering no longer re-bloats what runtime already said with redundant recovery or next-step echo.
- This remains bounded heuristic shaping, not semantic perfection, and it preserves approximate recovery, next-step help, and honest WhatsApp fallback when those surfaces are genuinely justified.

### Current Wave 5 Capability State
- The storefront/customer-intelligence core now has a real explicit capability/tool index.
- The Wave 5 split is now explicit and operational in code: `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
- Runtime now builds and uses a bounded `capabilityPlan` instead of keeping capability assumptions embedded directly inside `customer-intelligence/index.ts`.
- Edge execution now routes through `capabilityPlan.serverToolCalls`.
- Wave 5 established `public_web_search` and `public_url_context` as explicit capability slots; Wave 6 Pass 1 now activates those two slots in bounded form as real `NATIVE_PUBLIC` capabilities.
- Guardrails remain border policy and no longer keep a separate hidden intent-to-tool routing table.
- Storefront contract remained stable; Wave 5 did not require a storefront UI redesign.

### Current Wave 6 Web Intelligence State
- The storefront/customer-intelligence core now has bounded active public-web intelligence through the existing capability box.
- `public_web_search` and `public_url_context` are now real active `NATIVE_PUBLIC` capabilities rather than reserved-only placeholders.
- Public web is policy-gated and non-reflexive: `MODEL_KNOWLEDGE` remains the default when external lookup is unnecessary, and `OWN_FUNCTION` remains authoritative for private truth, internal state, and real action.
- `public_url_context` is limited to explicit URL/page-context turns.
- `public_web_search` is limited to genuine public/fresh/external-info turns.
- Clarify-first turns suppress public web, and `PUBLIC_INFO` is explicitly non-catalog.
- Runtime execution remains bounded through `capabilityPlan.serverToolCalls`; this is not a planner/orchestrator redesign.
- Successful public-web turns may now emit compact truthful `source_context` only when public web actually ran successfully.
- That provenance remains bounded and optional: small public-context indicator, optional brief, and up to 2 normalized public sources.
- Explicit negative-path proof now exists that ordinary non-public-web turns do not surface `source_context`.
- Dead legacy `public_web_search_legacy` / `public_url_context_legacy` helpers are removed.
- The active public-web path is the bounded primary runtime path only.
- Storefront contract remained materially stable; Wave 6 Pass 2 only added a narrow contract extension and did not require a storefront UI redesign.

### Current Wave 2 Turn-First Addendum
- Runtime/storefront behavior is now materially turn-first.
- Runtime computes a bounded current-turn profile with `primary_intent`, `secondary_intents`, `turn_priority`, `current_turn_decision`, `turn_focus`, `primary_tool_calls`, and `queued_tool_calls`.
- Runtime acts from `primary_intent`, filters tool calls to the primary lane, and keeps secondary intents as bounded queued context.
- Current-turn needs can override stale prior-lane momentum.
- Storefront search/product/recovery/next-step product surfaces suppress themselves when the current turn is no longer search-first.

### Current Wave 3 Catalog Gate Addendum
- Runtime/storefront behavior is now materially catalog-gated.
- `resolveCatalogGate(...)` exists in `supabase/functions/customer-intelligence/intent-guardrails.ts`, and runtime consumes that gate in `supabase/functions/customer-intelligence/index.ts`.
- Storefront normalizes/applies the gate in `src/services/concierge.service.ts`, the hook carries/respects it in `src/hooks/useAIConcierge.ts`, and the UI suppresses product surfaces from it in `src/components/ui/ai/AIConcierge.tsx`.
- Clarification-first and non-catalog turns stay product-suppressed; `ASK_CLARIFYING_QUESTION` and `UNKNOWN` keep the gate closed.
- When the gate closes, products and `resolved_products` are cleared, `next_step_view` is nulled, and stale product/recovery/next-step product surfaces no longer linger after the lane changes.
- Legitimate search-leading turns still surface products and approximate recovery when the current turn is clear enough and product help is materially justified.

### Current Wave 4 Anti-Bloat Addendum
- Runtime/storefront behavior is now materially less bloated.
- `RESPONSE_SHAPE_RULES`, `compactCesarinResponseText(...)`, and `shapeCesarinResponseText(...)` are now accepted parts of the real storefront/customer-intelligence path.
- CÃ©sarÃ­n now tends toward one useful move, fewer duplicated phrases, and fewer robotic commercial tails.
- Stage 4 no longer appends an extra commercial tail when `baseMessage` already carries the useful move.
- Stage 5 now keeps actionable guidance in `next_step_view` instead of reinjecting the same move into the main assistant text.
- Storefront rendering no longer re-bloats search-path output with redundant recovery and next-step duplication.
- Useful help remains preserved when justified: approximate recovery, next-step help, honest WhatsApp fallback, and truthful business/action boundaries.
- This remains Wave 4 only: not Wave 5 tool-index work, not web-intelligence, not a planner/orchestrator redesign, not a new mode system, not a new funnel/CTA layer, and not live/voice.

### Current Wave 5 Tool Index Addendum
- Runtime/storefront behavior now includes an explicit consultable capability box.
- The accepted split is now explicit and real: model-only reasoning, bounded native/public capability, and own/private/action functions.
- The runtime consumes a bounded `capabilityPlan`; this is not a giant planner.
- Intent filtering is now centralized through the capability index / capability-id mapping rather than a separate hidden guardrail routing table.
- Wave 5 made the public-web slots explicit; Wave 6 Pass 1 now activates `public_web_search` and `public_url_context` in bounded form without turning them into a reflexive default.
- Wave 2 turn-first behavior, Wave 3 catalog gating, and Wave 4 anti-bloat remain preserved under the new capability plan.
- This remains Wave 5 only: not Wave 6 web intelligence, not a planner/orchestrator redesign, not live/voice, not admin / Cesarin OS work, and not a storefront UI redesign.

### Current Wave 6 Web Intelligence Addendum
- Runtime/storefront behavior now includes bounded active public-web intelligence.
- `public_web_search` and `public_url_context` are active `NATIVE_PUBLIC` capabilities inside the existing consultable capability box.
- Public web remains policy-gated and non-reflexive: it does not win over `OWN_FUNCTION` for private truth/action, and it does not replace `MODEL_KNOWLEDGE` when stable model-only reasoning is enough.
- `PUBLIC_INFO` is explicitly non-catalog, so public web does not reopen product surfacing when the catalog gate is closed.
- Public-web execution remains bounded through `capabilityPlan.serverToolCalls`, and public-web synthesis remains compact and explicitly external rather than pretending private/internal certainty.
- Successful public-web turns may now carry compact truthful `source_context`, but this remains bounded optional provenance rather than a citation framework or source wall.
- Explicit negative-path proof now exists that ordinary non-public-web turns do not surface `source_context`.
- Legacy web helpers are removed; the active public-web path is the bounded primary runtime path only.
- This remains Wave 6 Pass 1 plus Pass 2 plus final hygiene only: not full web-intelligence completion, not a giant planner/orchestrator, not live/voice, not admin / Cesarin OS work, and not a storefront UI redesign.

### Current Wave 7 Soft Continuity State
- The storefront/customer-intelligence core now has bounded soft continuity in the real runtime path.
- Runtime derives soft continuity from recent session history, authenticated `ia_context`, and lightweight existing memory context.
- Continuity remains soft, compact, humble, and optional rather than rigid or transcript-like.
- The current turn remains sovereign; continuity may inform, but it does not hijack the turn.
- Topic/lane shift suppresses stale continuity push.
- Continuity does not reopen catalog by itself and does not override own-function priority or bounded public-web policy.
- Guests still do not get fake durable memory.
- Authenticated continuity is more useful but remains lightweight and field-based rather than deep transcript memory or a CRM-style persistence layer.
- Storefront contract remained materially stable; Wave 7 did not require a storefront UI redesign.

### Current Wave 7 Soft Continuity Addendum
- `buildSoftContinuityContext(...)` now provides a bounded continuity layer over recent session history, authenticated `ia_context`, and lightweight existing memory context.
- Runtime injects that bounded continuity into Analyst and Sommelier prompting as soft guidance only.
- Storefront can now merge a compact `conversational_prefix` into search, knowledge, cart, and generic replies when it meaningfully helps avoid repetition.
- Continuity remains humble and compact; it is not a backstory dump or a transcript replay.
- Current-turn sovereignty remains load-bearing, and topic/lane shift suppresses stale continuity push.
- Guests still do not get fake durable memory, and authenticated continuity remains bounded to lightweight existing fields rather than deep transcript persistence.
- This is Wave 7 only: not a deep memory platform, not a CRM layer, not a planner/orchestrator redesign, and not a storefront UI redesign.

### Current Convergence / Hardening State
- The storefront concierge baseline is now explicitly `gemini-2.5-pro` for Analyst and Sommelier.
- Auxiliary/admin-style paths may still remain on auxiliary Flash where applicable.
- Analyst prompting is now more clearly grounded in the real capability box instead of a broad duplicated manual routing table.
- The capability box is now the clearer primary routing authority in the runtime prompt layer.
- Final-answer ownership is cleaner across continuity, bounded public web, and storefront shaping.
- Shared runtime suppression now prevents stale conversational prefix stacking on clarify-first turns, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
- Current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, and neutral degraded fallback remain preserved.
- Storefront contract remained materially stable; this wave did not require a storefront UI redesign.

### Current Convergence / Hardening Addendum
- `buildCapabilityPromptSummary(...)` now gives Analyst prompting a compact capability-box-derived routing summary instead of another broad manual tool-routing table.
- `shouldSuppressCesarinConversationalPrefix(...)` is now shared runtime truth for stale-prefix suppression.
- Soft continuity no longer stacks on top of clarify-first turns.
- Grounded `PUBLIC_INFO` turns with compact `source_context` no longer stack stale continuity prefix into the final answer path.
- This is convergence/hardening only: not a new architecture lane, not a redesign from zero, not a new planner/orchestrator, and not a storefront UI redesign.

### Current Storefront Visibility / UX Effectiveness State
- Visible help differentiation is now present in the storefront assistant UI.
- The current customer-facing label set is intentionally compact and bounded to four truthful surfaces only: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
- `Contexto publico` appears only when bounded public-web support actually produced `source_context`.
- `Ayuda de producto` appears only when catalog/product surfaces are truly open; suppressed/non-catalog turns do not get mislabeled as product help.
- `Paso accionable` appears only for real action-oriented help; it is distinct from product pressure.
- `Siguiente paso` is now more customer-clear, but still remains truthfully gated behind legitimate catalog-open product help.
- Stage 5 copy is clearer and more customer-facing without becoming pushy.
- This remains a bounded storefront visibility pass: no measured business uplift claim, no storefront redesign from zero, and no funnel-engine creation.

### Current Storefront Visibility / UX Effectiveness Addendum
- `src/components/ui/ai/AIConcierge.tsx` now provides light-touch visible help differentiation so customers can better tell what kind of help they are getting.
- `src/lib/cesarin-stage5.ts` now carries clearer customer-facing next-step copy while keeping next-step help honest and compact.
- Product help remains catalog-gated, public context remains bounded to real public-web support, and actionable help remains distinct from generic product pressure.
- Current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, and own-function priority remain preserved underneath this visible storefront pass.
- This is storefront/customer-facing effectiveness hardening only: not a core architecture rewrite, not a storefront redesign from zero, and not a new funnel/CTA engine.

### Current Commercial Outcome Hardening State
- Storefront commercial outcome selection is now materially improved rather than being just a copy polish layer.
- Stage 5 now explicitly grades support as `weak`, `supported`, or `strong`.
- Weak or approximate cases stay humbler and more exploratory/review-first.
- `ADD_READY` is now tightly restricted to genuinely strong single-product support.
- Two viable products remain compare-worthy more often instead of collapsing prematurely into action-ready.
- Weak single-product support remains review-first instead of action-ready.
- Storefront expression of action-ready help is clearer and still truthful: true add-ready turns may show `Paso accionable`, while ordinary catalog-open product help remains `Ayuda de producto`.
- No measured business uplift is claimed, and this is not a funnel-engine layer.

### Current Commercial Outcome Hardening Addendum
- `src/lib/cesarin-stage5.ts` now uses explicit support-strength grading to decide whether the storefront should keep exploring, compare, review, or surface a truly add-ready next move.
- Approximate, semantic, weak-fallback, and other weak-support cases stay humbler instead of sounding cart-ready just because one fallback item survived.
- Two viable products now stay compare-worthy more often when the real support is not yet strong enough to collapse honestly into one winner.
- `src/components/ui/ai/AIConcierge.tsx` now exposes true add-ready help more clearly as `Paso accionable` only when the support is genuinely action-ready; otherwise product help remains the broader catalog-gated `Ayuda de producto`.
- Current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, and degraded honesty remain preserved underneath this storefront hardening pass.
- This remains a bounded storefront/customer-facing improvement lane only: not a ranking engine, not a funnel planner, and not a storefront redesign from zero.

### Current Trust & Transparency Hardening State
- Trust-signaling is now visibly improved in the storefront assistant UI.
- Stage 5 guidance now communicates posture more clearly in human-facing language.
- Compare / review / add-ready states are now easier to read as distinct recommendation postures.
- Visible trust notes remain compact and subtle rather than becoming a confidence meter or badge zoo.
- Public context remains isolated from product-confidence language.
- Non-product/public turns do not receive misleading product-confidence signaling.
- Closed catalog lanes remain closed.
- No measured uplift is claimed.

### Current Trust & Transparency Hardening Addendum
- `src/lib/cesarin-stage5.ts` now carries clearer human trust-language so weak exploratory help, compare-worthy help, prudent review-first help, and clearer add-ready help read more understandably to customers.
- `src/components/ui/ai/AIConcierge.tsx` now surfaces compact posture notes such as `Todavia estamos afinando`, `Las dos traen buen caso`, `Es la mejor pista por ahora`, `Es la ruta mas clara`, `Ya va bien encaminado`, and `Ya viene bien amarrado`.
- These notes remain customer-facing and subtle: not internal telemetry, not a confidence score, not a confidence meter, and not a debug taxonomy surface.
- Public-context turns stay isolated from product-confidence language.
- Current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, commercial outcome hardening, and degraded honesty remain preserved underneath this storefront trust/clarity pass.
- This remains a bounded storefront/customer-facing improvement lane only: not a scoring system, not a broader redesign, and not a new funnel engine.

### Current Decision Flow Naturalization State

- Decision flow naturalization is now accepted as real storefront/runtime truth.
- `turnAnalysis` now materially informs storefront stage shaping.
- Stage 4 preserves upstream model posture more faithfully instead of leaning on older storefront forcing.
- The old forced storefront `EXPLORE_LIGHT` fallback through `modeHint` is gone from the accepted live service path.
- Regex/helper duplication between Stage 4 and Stage 5 was materially reduced rather than expanded.
- `isStrictExplorationQuery(...)` now narrows older exploration forcing.
- The weak-support / approximate single-candidate path now preserves humble `KEEP_EXPLORING` when upstream posture remains `GUIDED_COMPARE`.
- The model-first gain in posture wiring remains intact.
- No claim is made that Stage 5 is now fully non-heuristic or fully model-pure.

### Current Decision Flow Naturalization Addendum

- Storefront service now propagates normalized `turnAnalysis` into storefront shaping instead of forcing the older exploration fallback by reflex.
- Stage 4 follows upstream current-turn truth more directly, especially where clarify-first or compare-leaning posture should stay visible downstream.
- Stage 5 now preserves the accepted weak-support humility baseline instead of collapsing the semantic/approximate single-candidate path into premature `REVIEW_ONE`.
- Accepted storefront invariants remain preserved: current-turn sovereignty, catalog gate, anti-bloat, bounded public web, bounded soft continuity, truthful private/action boundaries, visible help differentiation, commercial outcome hardening, and degraded honesty.
- This remains a bounded naturalization lane only: not full heuristic removal, not a planner/orchestrator redesign, not a storefront redesign, and not an admin / Cesarin OS expansion.

### Current Technical Cleanup & Coherence State

- Technical cleanup and coherence is now accepted as real assistant-runtime truth.
- Stage 4 no longer carries the dead `modeHint` contract.
- Fallback `current_turn_decision` is now canonicalized through a shared resolver.
- Service and hook are materially aligned on fallback decision truth.
- Legacy `conversation_mode_hint` no longer contaminates fallback turn decision.
- This improved runtime coherence without reopening architecture or product behavior lanes.
- No claim is made that all fallback logic is now fully centralized.

### Current Technical Cleanup & Coherence Addendum

- The storefront/runtime path now uses a cleaner canonical fallback decision path when upstream `turn_analysis` is missing.
- Stage 4 keeps a cleaner boundary between upstream model / upstream turn-analysis truth and technical fallback behavior.
- Some bounded duplication still exists for `primary_intent` fallback between service and hook.
- This wave did not attempt to fully centralize every fallback field, and it does not claim a full runtime rewrite.

### Current AI Platform Integrity & Runtime Convergence State

- AI platform integrity and runtime convergence is now accepted as real bounded IA-stack truth.
- `knowledge-ingestor` no longer stays weakly exposed in the accepted config/deploy/runtime path: JWT verification is enabled again, deploy no longer forces `--no-verify-jwt`, and write actions require either `service_role` or an authenticated `admin_users` role of `admin` / `super_admin`.
- The audited `customer-intelligence` core path now uses one explicit shared Gemini API policy through `_shared/gemini-api.ts` instead of accidental mixed `v1` / `v1beta` URLs inside that core path.
- Edge/client telemetry now includes explicit `telemetry_contract` ownership signaling so telemetry ownership is more explicit than a bare boolean-only handshake.
- Focused tests validate the helper-level knowledge-ingestor auth rules, the shared Gemini helper usage in the audited customer-intelligence path, the telemetry contract resolver, and the storefront service ownership handoff.
- No claim is made that admin/service-role continuity is end-to-end proven live, that all Gemini consumers across the repo are now converged, or that legacy telemetry ownership signals are fully gone.

### Current AI Platform Integrity & Runtime Convergence Addendum

- The accepted Gemini convergence truth in this lane is deliberately bounded: the audited `customer-intelligence` core path now follows one shared `v1beta` policy for generation and embeddings in the audited codepath, but this document does not generalize that claim to every edge function in the repo.
- The accepted telemetry ownership hardening is also deliberately bounded: `telemetry_contract` is now real and materially reduces edge/client drift, but compatibility signals such as legacy ownership booleans still coexist and must remain documented honestly.
- The accepted knowledge-ingestor hardening is structurally real in code and deploy config, but continuity of admin and service-role automation is recorded here as code-inspected rather than separately proven by end-to-end execution in this pass.
- This lane did not reopen storefront UX, checkout behavior, admin cosmetics, or planner/orchestrator architecture.

### Current Recovery & Friction Handling State

- Recovery and friction handling is now accepted as real storefront truth in one bounded weak-review path.
- Weak `REVIEW_ONE` now has a subtle reentry affordance through `assistAction`.
- The accepted visible affordance copy is `Seguimos viendo`.
- That affordance returns the user to the normal conversation flow through ordinary `sendMessage(...)`.
- No new route, orchestrator path, or funnel behavior was introduced.
- No claim is made of measured conversion uplift or global friction elimination.

### Current Recovery & Friction Handling Addendum

- This wave reduces friction only inside the existing gated next-step surface.
- The reentry remains voluntary and non-pushy rather than reopening product pressure.
- No Stage 4 runtime change was introduced, and no service-shaping lane was reopened.
- Accepted invariants remain preserved: current-turn sovereignty, catalog gate, anti-bloat, degraded honesty, and no planner/orchestrator expansion.

### Current Shaping Spine Consolidation State

- Shared text-shaping utilities are now consolidated in `src/lib/cesarin-text-utils.ts`.
- Service and hook rely more directly on shared/server truth and less on local reinterpretation.
- `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
- `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`.
- The prior UI residual was auditability-only, not active product duplication.
- The spine is more coherent, but no claim is made that every layer is perfectly centralized.

### Current Shaping Spine Consolidation Addendum

- The accepted auditability micro-fix added focused UI regressions to explicitly guard the shared-util contract.
- That guard keeps the UI from silently drifting back to local copies of the shared text-shaping behavior.
- This consolidation did not reopen runtime, stages, catalog behavior, or commercial behavior.

### Current Visible Guidance Compression / Anti-Redundancy State

- Visible semantic echo between chip, trust note, and `Siguiente paso` is now materially reduced in the storefront UI.
- Chips are now more categorical when `next_step_view` already exists.
- `Siguiente paso` now carries the useful directional guidance more cleanly instead of being echoed by the chip layer.
- Trust-note echoes are suppressed when equivalent guidance is already shown.
- No runtime intelligence change is claimed.
- No measured UX or conversion uplift is claimed.
- No global copy-compression engine is claimed.

### Current Visible Guidance Compression / Anti-Redundancy Addendum

- `src/components/ui/ai/AIConcierge.tsx` now keeps the chip bounded and lets `Siguiente paso` own the useful direction when present.
- The storefront renderer now avoids repeating the same posture in multiple visible surfaces when that posture is already expressed clearly.
- The accepted UI regression coverage now guards the shared visible-boundary contract rather than depending on audit memory.
- Current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, visible help differentiation, commercial outcome hardening, trust signaling, and truthful private/action boundaries remain preserved.
- This remains a bounded storefront UI compression lane only: not a runtime-intelligence rewrite, not a global copy engine, and not a measured uplift claim.

### Current Sales / Persona Hardening State

- Cesarin's commercial voice is now materially warmer, sharper, and more commercially natural than before.
- The assistant now sounds more like a confident helpful seller and less like a disciplined system that is merely organizing states.
- The voice hardening came from prompt/persona wording plus bounded storefront phrasing, not from new rails or new modes.
- Existing support thresholds and behavioral safeguards remain intact: weak-support humility, compare-first honesty, add-ready truthfulness, public-info non-catalog behavior, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.
- The visible commercial feel still relies partly on deterministic Stage 4/5 scaffolding, so this is not a claim of fully free-form sales personality.
- No measured conversion uplift is claimed, and no storefront or runtime architecture rewrite is implied.

### Current Sales / Persona Hardening Addendum

- `supabase/functions/customer-intelligence/persona.ts` now frames Cesarin as a trusted seller with calm confidence, warmth, and light natural wit when it fits.
- `supabase/functions/customer-intelligence/index.ts` now includes a compact presence-commercial block in the Sommelier prompt so runtime answers can sound more human, sharper, and less like a disciplined state machine.
- `src/lib/cesarin-stage4.ts` and `src/lib/cesarin-stage5.ts` now use less mechanical commercial wording while keeping support truth and gating intact.
- The accepted tests now lock the new voice and wording, but they also make the residual explicit: deterministic scaffolding still shapes part of the visible commercial feel.
- This remains a bounded storefront/customer-intelligence lane, not a new architecture wave, not a planner, and not a funnel engine.
### Setup en 2 minutos

```bash
git clone <repo>
cd vsm-store
npm install
cp .env.example .env    # Agregar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev              # http://localhost:5173
```

### VerificaciÃ³n de salud

```bash
npm run typecheck        # EstÃ¡ndar: 0 errores (Estado actual: 0 errores verified post-Wave 189 remediation)
npm run lint             # 0 errores ESLint
npm run test:run         # 12 tests passing
npm run build            # Build exitoso
```

### Deploy

Cloudflare Pages conectado a rama `main`. Push to main = deploy automÃ¡tico.

- **URL producciÃ³n:** Cloudflare Pages (dominio configurado en dashboard)
- **Headers de seguridad:** `public/_headers` (CSP, HSTS, X-Frame-Options)
- **Fallback SPA:** Cloudflare Pages maneja SPA routing automÃ¡ticamente

---

## 1. REGLAS â€” LEY ABSOLUTA

> **TODAS estas reglas son obligatorias. No hay excepciones salvo las documentadas explÃ­citamente.** Un AI o desarrollador que viole estas reglas estÃ¡ introduciendo deuda tÃ©cnica no autorizada.

### 1.1 Arquitectura: Flujo unidireccional estricto

```text
Database (Supabase) â†’ Services (Normalizing Layer) â†’ Hooks â†’ Components/Pages
```

**NUNCA al revÃ©s.** **PRINCIPIO DE RESILIENCIA (Wave 80 & 168):** Cada componente debe ser capaz de fallar de forma aislada sin detener la venta. El Service Layer DEBE normalizar datos externos (ej: `specs: data.specs || {}`) para evitar crashes de componente por datos corruptos o nulos.

**NUNCA al revÃ©s.** Un componente no sabe que existe Supabase. Un hook no sabe que existe PostgreSQL.

| Capa | Puede importar de | NO puede importar de |
| :--- | :--- | :--- |
| `services/*.service.ts` | `lib/supabase`, `types/` | Hooks, Components, Pages |
| `hooks/use*.ts` | Services, `lib/`, `types/`, `stores/` | Components, Pages |
| `components/**/*.tsx` | Hooks, `lib/utils`, `types/`, `stores/` | Services, `lib/supabase` |
| `pages/**/*.tsx` | Hooks, Components, `lib/`, `types/`, `stores/` | Services, `lib/supabase` |

> [!IMPORTANT]
> **Admin Standard (Wave 90)**: La excepciÃ³n histÃ³rica que permitÃ­a a las pÃ¡ginas admin importar servicios directamente ha sido **DEPRECADA**. Toda lÃ³gica de negocio administrativa debe residir en `hooks/admin/` para mantener componentes ligeros (Thin Components).

### 1.2 TypeScript: Cero tolerancia

- **`strict: true`** + **`noUncheckedIndexedAccess: true`** activados.
- **Sin `any`.** Si necesitas un tipo genÃ©rico, usa `unknown` + type guards.
- **Sin `as X` casts** salvo en responses de Supabase (problema sistÃ©mico conocido, ver Â§10.2).
- **Sin `// @ts-ignore`** ni `// @ts-expect-error` sin justificaciÃ³n en comentario.
- [Cesarin OS: Neural Sales Engine (Wave 159)](#cesarin-os-neural-sales-engine-wave-159)
- [Seguridad y Rendimiento](#seguridad-y-rendimiento)

### 1.3 Modularidad: Componentes independientes

- **Cada feature es autocontenida.** Borrar un mÃ³dulo no debe romper otro.
- **Sin imports circulares.** Flujo unidireccional siempre.
- **Sin lÃ³gica de negocio en componentes.** CÃ¡lculos van en `lib/domain/`.
- **Sin datos mock en producciÃ³n.** Si un componente necesita datos, los obtiene de la DB o muestra un empty state honesto.
- **Sin dependencias entre features.** `FlashDeals` no debe importar de `SocialProof`. Cada secciÃ³n de Home es un "lego" independiente.

### 1.4 Estilos: Sistema temÃ¡tico

- **Sin `bg-white` ni colores hardcodeados.** Usar sistema temÃ¡tico (`bg-theme-*`, `glass-premium`, `text-theme-*`).
- **Sin CSS-in-JS.** Solo Tailwind + CSS Variables en `index.css`.
- **Sin archivos `.css` por componente.** Estilos globales en `index.css` layers.
- **Sin clases dinÃ¡micas de Tailwind** (`bg-${color}-500`). Usar condicionales estÃ¡ticos con `cn()`.

### 1.5 Testing: Obligatorio para nueva lÃ³gica

- **Todo archivo nuevo en `lib/domain/` DEBE tener tests.** Sin excepciÃ³n.
- **Todo nuevo hook con lÃ³gica compleja DEBE tener tests.**
- **Todo nuevo schema Zod DEBE tener tests.**
- **Tests van en `__tests__/` junto al mÃ³dulo que testean.**
- **Formato:** `[nombre].test.ts(x)`. Framework: Vitest + Testing Library.
- **Estado actual:** 12 tests en 12 archivos. Cobertura parcial. Ver Â§8.

### 1.6 Build: Cero errores

- **`npm run typecheck` = 0 errores.**
- **`npm run lint` = 0 errores.**
- **`npm run build` = exitoso.**
- **No se pushea con errores.** Verificar antes de cada commit.

### 1.7 Imports: Consistencia

- **Path alias `@/`** mapea a `src/`. No relative imports fuera de la carpeta actual.
- **`Section` type:** importar SIEMPRE de `@/types/constants` (canonical). Nunca de `@/types/product`.
- **Admin services:** importar del barrel `@/services/admin`, no de archivos individuales.
- **Named exports** siempre (no default). Lazy imports usan `.then(m => ({ default: m.X }))`.

### 1.8 Seguridad: No negociable

- **Sin hardcoded secrets.** Usar env vars.
- **Escape inputs en queries PostgREST.** `%` y `_` deben escaparse en ILIKE.
- **Validar URLs antes de redirect.** Verificar hostname de destino.
- **Sin `console.log` en producciÃ³n.** Terser los elimina, pero no confiar en eso para datos sensibles.
- **Sin `dangerouslySetInnerHTML`.** Nunca.
- **Rate limiting en auth.** Login tiene exponential backoff.

### 1.9 Nuevos archivos: Checklist

Antes de crear un archivo nuevo, verificar:

| Check | Pregunta |
| :--- | :--- |
| [ ] | Â¿Respeta el flujo unidireccional (Â§1.1)? |
| [ ] | Â¿Usa tipos de `src/types/` en vez de definir inline? |
| [ ] | Â¿Importa `Section` de `@/types/constants`? |
| [ ] | Â¿Usa `useNotification` en vez de `react-hot-toast` directo? |
| [ ] | Â¿Usa `cn()` para clases condicionales? |
| [ ] | Â¿Usa `optimizeImage()` para imÃ¡genes de productos? |
| [ ] | Â¿Usa clases temÃ¡ticas (`bg-theme-*`, `text-theme-*`)? |
| [ ] | Â¿Si tiene lÃ³gica â†’ la lÃ³gica va en `lib/domain/`? |
| [ ] | Â¿Si tiene lÃ³gica en `lib/domain/` â†’ tiene tests? |
| [ ] | Â¿Sin `any`, sin `as X` innecesarios? |
| [ ] | Â¿Named export (no default)? |
| [ ] | **Â¿ActualicÃ© AI_CONTEXT.md para reflejar este cambio? (Â§1.10)** |

| Si tocaste... | Actualizar en AI_CONTEXT.md |
| :--- | :--- |
| Nuevo archivo `.ts`/`.tsx` | Â§3 Estructura de carpetas (agregar archivo, actualizar conteos) |
| Nuevo archivo de test | Â§8 Testing (agregar a tabla Â§8.1, quitar de Â§8.3 si aplica) |
| Nueva ruta | Â§9 Routing (agregar a tabla correspondiente) |
| Nueva dependencia `npm install` | Â§2 Stack (agregar con versiÃ³n) |
| Nuevo tipo en `src/types/` | Â§3 Estructura (actualizar conteo de types/) |
| Archivo eliminado | Quitar de Â§3 + actualizar conteos |
| Feature nueva completada | Â§5 Features (mover de âš  a âœ… o agregar nueva) |
| Issue resuelto de Â§10 | Â§10 Issues (quitar de la lista) + AUDIT_LOG.md (agregar entrada) |
| MigraciÃ³n SQL nueva | Â§11.1 (agregar fila con nÃºmero y descripciÃ³n) |
| Cambio en build/deploy | Â§12 Build & Deploy |
| Cambio de regla o patrÃ³n | Â§1 Reglas o Â§14 Convenciones |
| DecisiÃ³n arquitectÃ³nica relevante | Â§15 Decisiones HistÃ³ricas (agregar con fecha)

- **Cualquier IA** que modifique cÃ³digo tiene la obligaciÃ³n de actualizar el documento antes de terminar la sesiÃ³n.
- **Cualquier desarrollador** que haga commit debe verificar que el documento refleja sus cambios.
- Si el documento no se actualiza, los datos se vuelven incorrectos y se pierde la confianza en la fuente de verdad.

---

## 2. STACK EXACTO

| Capa | TecnologÃ­a | VersiÃ³n | Rol |
| :--- | :--- | :--- | :--- |
| Runtime | React | 18.3.1 | SPA, JSX |
| Bundler | Vite | 6.0.5 | Dev server, build, HMR |
| Lenguaje | TypeScript | 5.6.2 | Strict mode + noUncheckedIndexedAccess |
| BaaS | Supabase | 2.39.0 | PostgreSQL, Auth, Storage, Realtime, Edge Functions, RLS |
| Server-state | TanStack Query | 5.17.0 | Cache, fetching, mutations, staleTime |
| Client-state | Zustand | 5.0.11 | Carrito (localStorage), wishlist (localStorage + DB sync), notificaciones |
| Routing | React Router | 6.22.0 | SPA routing, lazy loading |
| Styling | Tailwind CSS | 3.4.17 | Utility-first + CSS Variables (dark-only) |
| Forms | React Hook Form + Zod 4 | 7.71.2 / 4.3.6 | ValidaciÃ³n con schemas tipados |
| Animation | Framer Motion | 12.0.0 | Transiciones, AnimatePresence (migraciÃ³n masiva en Wave 127) |
| Icons | Lucide React | 0.574.0 | IconografÃ­a SVG |
| SEO | react-helmet-async | 2.0.5 | Meta tags dinÃ¡micos |
| Toast | react-hot-toast | 2.4.1 | Notificaciones transitorias |
| DnD | @dnd-kit | core 6.3.1, sortable 10.0.0 | Reordenamiento admin |
| Images | react-dropzone | 15.0.0 | Upload de imÃ¡genes admin |
| Payments | MercadoPago | Via Edge Function | `create-payment` + `mercadopago-webhook` (deploy canon: GitHub Actions pipeline, explicit webhook deploy step; webhook requires `verify_jwt = false`) |
| Monitoring | Sentry | 10.39.0 | Error tracking (lazy-loaded, solo si DSN configurado) |
| Analytics | Google Analytics 4 | `lib/analytics.ts` | Placeholder `G-XXXXXXXXXX` â€” no activo |
| Confetti | canvas-confetti | 1.9.4 | Efecto visual en loyalty/pedidos |
| Testing | Vitest + Testing Library | 4.0.18 | Unit tests (12 tests, cobertura parcial) |
| Linting | ESLint 9 + typescript-eslint | 9.15.0 | Config flat en `eslint.config.js` |
| PWA | Service Worker manual | `public/sw.js` | Offline fallback, caching |
| Minify | Terser | 5.46.0 | `drop_console` + `drop_debugger` en prod |

### Dependencias NO incluidas (decisiones conscientes)

- No hay Redux, MobX ni Context para estado global (Zustand reemplaza).
- No hay CSS-in-JS (styled-components, emotion). Solo Tailwind + CSS Variables.
- No hay Next.js/Remix. Es SPA pura desplegada en Cloudflare Pages.
- No hay ORM cliente. Supabase client directo en services.

---

## 3. ESTRUCTURA DE CARPETAS

```text
vsm-store/
â”œâ”€â”€ public/                          # Assets estÃ¡ticos
â”‚   â”œâ”€â”€ sw.js                        # Service Worker PWA
â”‚   â”œâ”€â”€ manifest.json                # PWA manifest
â”‚   â”œâ”€â”€ offline.html                 # Fallback offline
â”‚   â”œâ”€â”€ _headers                     # Cloudflare Pages headers (CSP, HSTS)
â”‚   â”œâ”€â”€ robots.txt / sitemap.xml     # SEO
â”‚   â”œâ”€â”€ logo-vsm.png                 # Logo tienda
â”‚   â”œâ”€â”€ .well-known/                 # Dominio verification
â”‚   â””â”€â”€ icons/                       # PWA icons
â”‚
â”œâ”€â”€ scripts/                         # 8 scripts de utilidad + admin/ (3)
â”‚   â”œâ”€â”€ generate-sitemap.js          # [Phase 1] Sitemap generator
â”‚   â”œâ”€â”€ migrate-woocommerce.cjs      # [Phase 1] Woo CSV â†’ SQL
â”‚   â”œâ”€â”€ simulate_cesarin.ts          # [Phase 3.4A] Simulator CLI
â”‚   â”œâ”€â”€ check-integrity.mjs          # [Phase 2] Integrity auditor
â”‚   â”œâ”€â”€ fix_css_phase2.mjs           # [Phase 2] CSS cleanup
â”‚   â”œâ”€â”€ fix_css_phase3.mjs           # [Phase 3.1] CSS cleanup
â”‚   â”œâ”€â”€ fix_css_violations.mjs       # [Phase 3.1] CSS violations
â”‚   â”œâ”€â”€ fix_encoding.mjs             # [Phase 3.4A] Encoding fix
â”‚   â””â”€â”€ admin/                       # [Phase 2] Cleanup Scripts (3 archivos)
â”‚       â”œâ”€â”€ tag-discovery.ts
â”‚       â”œâ”€â”€ tag-migration.ts
â”‚       â””â”€â”€ verify-phase-2b.ts
â”‚
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ migrations/                  # 55 migraciones SQL (001 â†’ 20260323_operator_case_drafts)
â”‚   â””â”€â”€ functions/                   # 14 Edge Functions (Specialized Gemini Stack: Flash 2.5/Pro/Lite)
â”‚       â”œâ”€â”€ inventory-oracle/        # IA: Predicciones de stock (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ dashboard-intelligence/  # IA: Insights de negocio para admin (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ customer-intelligence/   # IA: Multi-acciÃ³n NLP (Analyst: 2.5 Flash, Worker: 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ voice-intelligence/      # IA: NLP â†’ queries de bÃºsqueda (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ product-intelligence/    # IA: GeneraciÃ³n de copy/descriptions (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ loyalty-intelligence/    # IA: AnÃ¡lisis de patrones de lealtad (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ customer-narrative/      # IA: Narrativas contextuales de clientes (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ bundle-intelligence/     # IA: Sugerencias de bundles (Gemini 2.5 Flash-Lite)
â”‚       â”œâ”€â”€ cesarin-qa-judge/        # IA: AuditorÃ­a semÃ¡ntica de calidad (Gemini 2.5 Pro)
â”‚       â”œâ”€â”€ knowledge-ingestor/      # IA: RAG Ingestor (Document chunking & embedding)
â”‚       â”œâ”€â”€ create-payment/          # MercadoPago preference (deploy canon via GH Actions workflow)
â”‚       â”œâ”€â”€ mercadopago-webhook/     # Webhook de pago (verify_jwt=false obligatorio; deploy explÃ­cito en GH Actions)
â”‚       â”œâ”€â”€ track-shipment/          # DHL tracking
â”‚       â””â”€â”€ embeddings-processor/    # IA: Specialized gemini-embedding-001 (768d) for multi-modal search
â”‚
â”œâ”€â”€ constants/
â”‚   â””â”€â”€ specs.constants.ts           # [NEW] Guided specs and normalization maps
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ main.tsx                     # Entrypoint: providers stack
â”‚   â”œâ”€â”€ App.tsx                      # Router + layout switching
â”‚   â”œâ”€â”€ index.css                    # Design system CSS (323 lÃ­neas)
â”‚   â”œâ”€â”€ vite-env.d.ts                # Vite types
â”‚   â”‚
â”‚   â”œâ”€â”€ types/                       # Tipos de dominio (11 archivos)
â”‚   â”‚   â”œâ”€â”€ product.ts               # Product, Section, ProductStatus
â”‚   â”‚   â”œâ”€â”€ category.ts              # Category, CategoryWithChildren
â”‚   â”‚   â”œâ”€â”€ cart.ts                  # CartItem (con variant_id/name), Order
â”‚   â”‚   â”œâ”€â”€ order.ts                 # OrderItem (con variant_id/name), OrderRecord
â”‚   â”‚   â”œâ”€â”€ customer.ts              # CustomerProfile, CustomerTier
â”‚   â”‚   â”œâ”€â”€ testimonial.ts           # Testimonial
â”‚   â”‚   â”œâ”€â”€ variant.ts               # ProductAttribute, ProductVariant
â”‚   â”‚   â”œâ”€â”€ ai-capsule.ts            # AI State & Session persistence
â”‚   â”‚   â”œâ”€â”€ cesarin.ts               # Simulation types for E2E validation
â”‚   â”‚   â”œâ”€â”€ constants.ts             # Domain constants
â”‚   â”‚   â””â”€â”€ collection.ts            # Dynamic filters and groupings
â”‚   â”œâ”€â”€ lib/                         # Utilidades puras (sin side effects de UI)
â”‚   â”‚   â”œâ”€â”€ supabase.ts              # Cliente Supabase singleton
â”‚   â”‚   â”œâ”€â”€ react-query.ts           # QueryClient + error handling global
â”‚   â”‚   â”œâ”€â”€ utils.ts                 # cn(), formatPrice(), slugify(), optimizeImage()
â”‚   â”‚   â”œâ”€â”€ analytics.ts             # GA4 (placeholder, no activo)
â”‚   â”‚   â”œâ”€â”€ monitoring.ts            # Sentry init (lazy-loaded via dynamic import)
â”‚   â”‚   â”œâ”€â”€ accessibility.ts         # A11y utilities
â”‚   â”‚   â”œâ”€â”€ image-optimizer.ts       # Image optimization helpers
â”‚   â”‚   â”œâ”€â”€ z-index.ts               # Z scale: CONTENT(30)â†’SKIP(110)
â”‚   â”‚   â”œâ”€â”€ product-sorting.ts       # SortKey, SORT_OPTIONS, sortProducts (shared)
â”‚   â”‚   â””â”€â”€ domain/                  # LÃ³gica de negocio pura (DEBE tener tests)
â”‚   â”‚       â”œâ”€â”€ loyalty.ts           # Puntos, tiers, conversiones
â”‚   â”‚       â”œâ”€â”€ orders.ts            # Estados, transiciones, canTransitionTo
â”‚   â”‚       â”œâ”€â”€ pricing.ts           # calculateDiscount, calculateOrderTotal
â”‚   â”‚       â”œâ”€â”€ wheel.ts             # selectPrizeByProbability, calculateTargetRotation, formatPrizeValue [Wave 26]
â”‚   â”‚       â”œâ”€â”€ __tests__/           # 3 test files
â”‚   â”‚       â””â”€â”€ validations/         # Schemas Zod (DEBEN tener tests)
â”‚   â”‚           â”œâ”€â”€ address.schema.ts
â”‚   â”‚           â”œâ”€â”€ checkout.schema.ts
â”‚   â”‚           â”œâ”€â”€ profile.schema.ts
â”‚   â”‚           â””â”€â”€ __tests__/       # 3 test files
â”‚   â”‚
â”‚   â”œâ”€â”€ stores/                      # Zustand (client-state only) â€” 5 stores
â”‚   â”‚   â”œâ”€â”€ cart.store.ts            # Carrito: add/remove/validate
â”‚   â”‚   â”œâ”€â”€ wishlist.store.ts        # Wishlist: sync a customer_wishlists
â”‚   â”‚   â”œâ”€â”€ notifications.store.ts   # Notificaciones in-app
â”‚   â”‚   â”œâ”€â”€ search-overlay.store.ts  # MobileSearchOverlay visibility
â”‚   â”‚   â”œâ”€â”€ confirm.store.ts         # Custom premium modal confirmations
â”‚   â”‚   â””â”€â”€ __tests__/              # 2 test files
â”‚   â”‚
â”œâ”€â”€ services/                    # Capa de datos (44 services: 25 storefront + 19 admin)
â”‚   â”œâ”€â”€ products.service.ts      # Storefront: CRUD + Smart Upselling
â”‚   â”œâ”€â”€ orders.service.ts        # Storefront: Checkout & tracking
â”‚   â”œâ”€â”€ concierge.service.ts     # AI Chat (Consolidado)
â”‚   â”œâ”€â”€ auth.service.ts          # Auth: Login/Profile/Reset
â”‚   â”œâ”€â”€ loyalty.service.ts       # Loyalty: Points & Tiers
â”‚   â”œâ”€â”€ ...                      # 20 additional storefront services (5 above + 20 = 25 storefront total)
â”‚   â”œâ”€â”€ admin/                   # 19 archivos (18 services + barrel)
â”‚   â”‚   â”œâ”€â”€ admin-pilot-ops.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-auth.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-products.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-orders.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-customers.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-dashboard.service.ts
â”‚   â”‚   â”œâ”€â”€ admin-case-drafts.service.ts  # [B2 P1] operator_case_drafts CRUD + deriveCaseDraftReadiness
â”‚   â”‚   â””â”€â”€ ... (11 adicionales)
â”‚   â””â”€â”€ payments/
â”‚       â””â”€â”€ mercadopago.service.ts
```

### 17.2 Stabilized Debug Contract
El objeto `debug` retornado por la Edge Function DEBE contener:
- `detected_intent`: Un string canÃ³nico (ej. `POLICY_INQUIRY`).
- `tools_executed`: Array de strings con los nombres de las herramientas resueltas.
- `knowledge_chunks_count`: Entero indicando cuÃ¡ntos fragmentos RAG se usaron.
- `latency_ms`: MediciÃ³n interna de la funciÃ³n.

### 17.3 2026 Quota Mitigation
El entorno actual (Marzo 2026) tiene lÃ­mites estrictos de RPM en Free Tier.
- **MitigaciÃ³n**: El simulador (`simulate_cesarin.ts`) incluye un retraso forzado de **15 segundos** entre escenarios para evitar el error **429 (Too Many Requests)**.

### 17.4 Hybrid Judge / Scoring Layer (Wave 181)

La Fase 3.4C queda formalmente cerrada y validada como parte del baseline operativo real del sistema.

#### Alcance validado
- **Scoring determinÃ­stico** implementado en el simulador con perfiles sensibles por tipo de escenario.
- **Persistencia de reportes** activa en la tabla `ai_simulation_reports`.
- **Interfaz Admin QA** integrada dentro de `Cesarin OS` mediante `TabQuality.tsx`.
- **Juez semÃ¡ntico independiente** implementado en la Edge Function `cesarin-qa-judge`, fuera de `customer-intelligence`.
- **Persistencia de veredictos del juez** formalizada dentro de `ai_simulation_reports.results` a nivel de escenario individual.

#### Reglas canÃ³nicas de la capa QA
- La evaluaciÃ³n **determinÃ­stica** es la capa primaria.
- El **Judge LLM** es una capa secundaria, opcional y separada.

---

## 18. CESARÃN CAPABILITY CAPSULE PHILOSOPHY

To protect against monolithic sprawl, all CesarÃ­n AI behaviors must follow the **Capability Capsule** architecture. 
A **Capability Capsule** is a bounded AI behavior unit with a single commercial/assistant responsibility, explicit signals, local degraded behavior, and a dedicated QA surface.

### Core Architecture Principles
1. **Bounded Responsibility:** A capability owns its specific slice of intelligence and logic.
2. **Failure Isolation:** Missing or failing capabilities must fail locally and gracefully. They must never collapse unrelated conversational flows.
3. **Explicit Signaling:** Capsules communicate via compact machine-readable signals (e.g., `[FEATURED_FALLBACK]`). Do not bloat global contexts.
4. **Targeted QA Surface:** Each capsule must have an identifiable test surface in the deterministic simulator.
5. **Incremental Adoption:** Do not execute giant rewrites. Adopt the capsule structure incrementally across the ecosystem.
6. **Brain-First Orchestration (v106 canon, convergence reconciled):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority on the explicit Gemini 2.5 Pro concierge baseline, the runtime resolves the current turn first through a bounded turn-first profile, catalog/product surfacing is governed by an explicit catalog gate, final storefront/runtime copy is additionally shaped by explicit anti-bloat rules, capability use is routed through an explicit bounded capability box plus `capabilityPlan` instead of hidden scattered assumptions, bounded public-web capabilities remain policy-gated and non-catalog, and soft continuity can reuse recent session context plus lightweight authenticated context without overriding the current turn or stacking stale prefix onto clarify-first or grounded public-web turns. Weak storefront turns may still be rescued when there is real product, inventory, policy, or greeting signal, but `UNKNOWN` may remain honestly unresolved when no real rescue signal exists, and capsules still receive the routed primary intent plus bounded queued secondary context without becoming a giant planner.

### Recommended First Capsule Pattern
**Product Search Integrity Capsule**
This is the designated foundational template for the new architecture due to:
- Highest storefront frequency
- Strongest commercial trust impact
- Low architecture disruption
- High reuse value

**Current Status (Canonization Handoff Completed - Wave 185):**
- âœ… Contract types & Validation schemas
- âœ… Pure Mapper Shell
- âœ… Tool Schema & Function Calling Design
- âœ… Fallback Tree Materialized
- âœ… Runtime Execution Bridge / Orchestration
- âœ… AI/LLM Function Tool Routing
- âœ… E2E Validation & UI State Review

*Status: The Product Search Integrity Capsule is now fully operational and validated E2E. It stands as the official architectural blueprint and baseline pattern for all future Capability Capsules.*

### Second Capsule Pattern Materialized
**Knowledge & RAG Foundation Capsule**
This is the designated foundational template for knowledge retrieval, core FAQ resolution, and legal policy grounding.
- âœ… Contract types & Validation schemas
- âœ… Pure Mapper Shell
- âœ… Tool Schema & Function Calling Design
- âœ… Fallback Tree Materialized (Threshold-based)
- âœ… Runtime Execution Bridge / Orchestration
- âœ… AI/LLM Function Tool Routing
- âœ… E2E Validation & UI State Review

*Status: The Knowledge & RAG Foundation Capsule is now fully operational and validated E2E. It stands as the second official architectural blueprint and baseline pattern for all future memory, policy, or structured RAG-based Capability Capsules.*

### Third Capsule Pattern Materialized
**Cart Operator Capsule (Safe Mutator Blueprint)**
This is the designated foundational template for any future assistant-driven mutation that executes side-effects on client or global state.
- âœ… Contract types & Validation schemas
- âœ… Pure Mapper Shell (Ambiguity and safety gating)
- âœ… Tool Schema & Function Calling Design
- âœ… Fallback Tree Materialized (Threshold-based)
- âœ… Runtime Execution Bridge / Orchestration
- âœ… Execution Middleware (Execution gated by real DB product lookup, no hallucinated prices/titles)
- âœ… E2E Validation & UI State Review (Executor stripped of narrative UI copy; UI acts purely as a Presenter)

---

*Generado: 3 de marzo de 2026. Reestructurado: 4 de marzo de 2026. Revisado: 19 de marzo de 2026 (Wave 193 - Marketing AI Reality Repair - v113). Actualizado: 22 de marzo de 2026 (Admin Orders Panel CRUD). Actualizado: 23 de marzo de 2026 (B2 Pass 1 - Operator Case Draft Minimum Loop - Codex ACCEPT WITH RESIDUAL RISK). Actualizado: 23 de marzo de 2026 (B2 Pass 2 - Private Case Draft Maturation Loop - Codex ACCEPT). Actualizado: 24 de marzo de 2026 (A92 - Cesarin OS Graph-Assisted Operator Workbench - ACCEPT). Actualizado: 24 de marzo de 2026 (S93 + S94 - Storefront Sales Recovery Closure - ACCEPT). Actualizado: 24 de marzo de 2026 (S95 - Storefront Clarification-to-Conversion Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S96 - Storefront Comparison-to-Choice Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S97 - Storefront Choice-to-Confidence Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S98 - Storefront Confidence-to-Cart Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S99 - Storefront Objection-to-Recovery Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S100 - Storefront Recovery-to-Commitment Hardening - COMPLETE). Actualizado: 24 de marzo de 2026 (S101 - Storefront Commitment-to-Checkout-Readiness Hardening - ACCEPT). Actualizado: 24 de marzo de 2026 (S102 - Storefront Checkout-Readiness-to-Cart-Precision Hardening - ACCEPT). Actualizado: 25 de marzo de 2026 (Checkout Foundation - Secure Submission Bridge MVP - ACCEPT). Actualizado: 25 de marzo de 2026 (Checkout Payment Continuation - ACCEPT). Actualizado: 25 de marzo de 2026 (Post-Payment Order Status Normalization - ACCEPT). Actualizado: 25 de marzo de 2026 (Checkout Payment Success Cart-Clear Guard - ACCEPT). Actualizado: 25 de marzo de 2026 (Checkout Payment UX Mini-Block - Patch Pair 1 of 2 - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 25 de marzo de 2026 (Checkout Payment UX Mini-Block - Patch Pair 2 of 2 - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 25 de marzo de 2026 (Checkout Order Detail Payment Continuation CTA - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 25 de marzo de 2026 (Storefront Checkout Recovery & Completion Hardening - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 25 de marzo de 2026 (Storefront Auth Convergence + Hardening - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 25 de marzo de 2026 (Storefront Authenticated Reorder & Catalog Drift Hardening - ACCEPT). Actualizado: 25 de marzo de 2026 (Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening - ACCEPT WITH MINOR TRUTH ADJUSTMENTS). Actualizado: 25 de marzo de 2026 (Storefront Auth Session Persistence & Bootstrap Failure - ACCEPT WITH MINOR TRUTH ADJUSTMENTS). Actualizado: 25 de marzo de 2026 (Storefront Payment State Convergence & Order Lifecycle Coherence - ACCEPT WITH MINOR TRUTH ADJUSTMENTS). Actualizado: 25 de marzo de 2026 (Storefront Authenticated Orders Index & Actionability Hardening - ACCEPT WITH MINOR TRUTH ADJUSTMENTS). Actualizado: 26 de marzo de 2026 (Storefront Purchaseability Truth & Cart Integrity Hardening - ACCEPT). Actualizado: 26 de marzo de 2026 (Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening - ACCEPT WITH MINOR TRUTH ADJUSTMENTS). Actualizado: 26 de marzo de 2026 (Storefront Post-Purchase Confidence & Receipt Surface Hardening - ACCEPT). Actualizado: 26 de marzo de 2026 (Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention - ACCEPT). Actualizado: 26 de marzo de 2026 (Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening - ACCEPT). Actualizado: 27 de marzo de 2026 (Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification - ACCEPT). Actualizado: 27 de marzo de 2026 (Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening - ACCEPT). Actualizado: 27 de marzo de 2026 (Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening - ACCEPT). Actualizado: 27 de marzo de 2026 (Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening - ACCEPT). Actualizado: 28 de marzo de 2026 (CÃ©sarÃ­n Stage 2 â€” Taste Memory, Lightweight Continuity & Honest Preference Use - ACCEPT). Actualizado: 28 de marzo de 2026 (CÃ©sarÃ­n Stage 3 â€” Commercial Judgment From Taste Memory - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Core Refactor â€” Wave 1 + corrective micro-pass - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Core Refactor â€” Wave 2 turn-first engine - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Core Refactor â€” Wave 5 tool index real - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Core Refactor â€” Wave 6 web intelligence pass 1 - ACCEPT). Actualizado: 29 de marzo de 2026 (C?sar?n Core Refactor ? Wave 6 final web hygiene micro-pass - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Core Refactor â€” Post-Refactor Convergence / Hardening Wave - ACCEPT). Actualizado: 29 de marzo de 2026 (CÃ©sarÃ­n Storefront â€” Commercial Visibility / UX Effectiveness Wave - ACCEPT). Actualizado: 3 de abril de 2026 (Cesarin OS â€” Operational Truth Convergence - ACCEPT).*


*Este documento refleja el estado REAL, no aspiracional. LÃ©elo completo antes de tocar cÃ³digo.*
*Tras cualquier cambio al cÃ³digo, actualizar este documento (Â§1.10).*
*Historial de auditorÃ­as: ver `AUDIT_LOG.md`.*

### Storefront Turn-Level Commercial Judgment Tightening Guardrail Addendum
- A compact bounded `commercial_move` now exists for the product-search storefront path.
- Upstream `commercial_move` is primary truth when present; Stage 4 and Stage 5 only recompute through the shared resolver as fallback when it is absent.
- The accepted move vocabulary remains bounded to `KEEP_EXPLORING`, `COMPARE_TWO`, `REVIEW_ONE`, and `ADD_READY`.
- Stage 4 remains bounded and coherent.
- Stage 5 follows the turn-level commercial judgment more directly while preserving selector-needed behavior, weak/support/strong honesty, compare-worthiness, review-first truth, and strict add-ready gating.
- This lane improves turn-level commercial judgment propagation; it does not claim total commercial interpretation centralization everywhere or a planner/orchestrator redesign.
*Actualizado: 31 de marzo de 2026 (Cesarin Storefront - Selector-Needed Trigger Tightening / De-Scripted Surface - ACCEPT).*

### Storefront Selector-Needed Trigger Tightening / De-Scripted Surface State
- `SELECTOR_NEEDED` remains a local Stage 5 family by design; it is not promoted upstream into `commercial_move`.
- The selector-needed trigger is now tighter and no longer wins early just because a variant selector exists.
- Selector-needed is bounded to stronger single-product, non-approximate, non-compare cases where the missing selector is materially purchase-defining.
- Compare-worthy turns and weaker review-first turns are no longer stolen by selector-needed.
- The generic selector-needed family chip and trust-note scaffolding were removed from the storefront UI.
- Minimal missing-selector guidance remains only where it still adds value.
- This lane reduced scripted surface pressure without introducing planner/orchestrator drift or widening upstream commercial judgment.

### Storefront Selector-Needed Trigger Tightening / De-Scripted Surface Addendum
- Selector-needed now behaves more like a bounded commercial ask and less like a scripted edge.
- The accepted storefront baseline still preserves current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.
- This lane does not claim selector-needed removal, upstream move expansion, a planner layer, or full natural-language freedom.

### Storefront Tool-Selection / Intent-Guardrails De-Scripting State
- `intent-guardrails.ts` now subordinates regex-inferred intents more often instead of letting them overtake non-`UNKNOWN` analyst intent by default.
- `tool-selection.ts` now narrows fallback capability injection so it survives only when the resolved turn profile still requires capability use and the primary intent still matches.
- Public-web admission is now boundary-gated behind resolved `PUBLIC_INFO` instead of regex-led semantic self-routing.
- `index.ts` no longer applies the early compatibility force-correction before turn-profile resolution.
- Legitimate deterministic boundary controls remain intact: catalog-closed pruning, clarify-first suppression, own-function fallback for true private/action lanes, and public-web restraint.
- This lane reduced early local choreography without planner/orchestrator drift, without widening `commercial_move`, and without reopening Stage 4 / Stage 5.

### Storefront Tool-Selection / Intent-Guardrails De-Scripting Addendum
- This lane does not claim regex elimination or full model-pure behavior.
- This lane does not claim planner/orchestrator behavior, widened `commercial_move`, or Stage 4 / Stage 5 redesign.
- The accepted residual is auditability-only and non-blocking: there is still no one focused regression pinning the removed compatibility pre-correction in `index.ts`.

### Storefront Stage 5 Family-Resolution Thinning / Upstream Truth Obedience State
- Stage 5 now obeys upstream `commercial_move` more directly on the storefront product-search path.
- Local family arbitration inside `src/lib/cesarin-stage5.ts` is materially thinner once upstream truth already exists.
- Upstream `REVIEW_ONE` is no longer re-promoted into compare mode by local fallback heuristics.
- Upstream `ADD_READY` now degrades only through real Stage 5 guardrails, such as `SELECTOR_NEEDED` when a materially purchase-defining selector is still missing.
- `SELECTOR_NEEDED` remains a real local Stage 5 safety family; it was not removed or promoted upstream.
- The later evidence-hardening pass was test-only and closed the prior auditability gap through a focused runtime regression in `src/services/__tests__/concierge.service.stage4.test.ts`.

### Storefront Stage 5 Family-Resolution Thinning / Upstream Truth Obedience Addendum
- The primary production change lives in `src/lib/cesarin-stage5.ts`.
- The primary contract regressions live in `src/lib/__tests__/cesarin-stage5.test.ts`.
- The final auditability closure came later through a single service/runtime regression, not through a second production behavior change.
- This lane does not claim full Stage 5 removal, full model-pure rendering, widened `commercial_move`, Stage 4 rewrite, planner/orchestrator work, admin / Cesarin OS work, or measured business uplift.

### Storefront Availability Truth Alignment State
- Availability and outlook turns now state current availability first.
- Outlook/projection is explicitly secondary and separated from the present stock truth.
- Unsupported future-return implication was removed from active OOS wording.
- Inventory truth output was tightened without reopening routing architecture.
- Runtime/storefront proof now exists through focused regression on final `conciergeService.chat(...)` output for `INVENTORY_OUTLOOK`.

### Storefront Availability Truth Alignment Addendum
- The production change is bounded to storefront/customer-intelligence availability handling.
- The accepted implementation chain is `d0726ddf6c7ef3c4d89656600292403bbe6e323a` and `732e5ac46fb657acdf183f32ad72ce0e6329282d`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 reopening, storefront UI redesign, planner/orchestrator work, or admin / Cesarin OS expansion.
- The accepted baseline still preserves model-first discipline, catalog gate, anti-bloat, and degraded honesty.

### Storefront Text-Only Chat + Copy De-Robotization State
- Active opaque `amarrada`-style phrasing was removed from the active storefront assistant path.
- Replacement wording is clearer and more direct for uncertainty / weak-match cases.
- Storefront chat now behaves as text-only by removing automatic `speak(...)` usage from the active storefront assistant hook path.
- The accepted production change is concentrated in active storefront copy surfaces plus `src/hooks/useAIConcierge.ts`.
- Broader speech infrastructure was intentionally not redesigned or removed.

### Storefront Text-Only Chat + Copy De-Robotization Addendum
- This was a bounded storefront-only micro-pass.
- Accepted implementation commit: `6bc159d01e92bbb23e219c88595cf9dd11aeea0b`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 reopening, storefront redesign, planner/orchestrator work, voice/live platform redesign, admin / Cesarin OS expansion, or measured business uplift.
- The accepted baseline still preserves model-first discipline, catalog gate, anti-bloat, and degraded honesty.

### Storefront Direct-Answer Preservation / Stage 5 Restraint State
- Resolved concrete single-product fact turns now answer directly and stop.
- Secondary Stage 5/storefront help is suppressed only for the narrow intended case.
- Compare, selector-needed, weak review-first, and genuine follow-through cases remain preserved.
- The accepted production change is concentrated in `src/lib/cesarin-stage5.ts`, `src/services/concierge.service.ts`, and `src/components/ui/ai/AIConcierge.tsx`.
- This lane restrains secondary help after a sufficient direct answer; it does not reopen Stage 5 philosophy.

### Storefront Direct-Answer Preservation / Stage 5 Restraint Addendum
- This was a bounded storefront-only micro-lane.
- Accepted implementation commit: `74014a18813e6484bea05b3c2d88eb20cfcaa3db`.
- This lane does not claim routing redesign, Stage 4 / Stage 5 philosophy reopening, planner/orchestrator work, memory/preference work, storefront redesign, admin / Cesarin OS expansion, or measured business uplift.
- The accepted baseline still preserves model-first discipline, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.

### Storefront Attribute Precision / Fact Consistency State
- This was a bounded storefront-only factual hardening lane.
- Concrete product fact answers are now materially more precise and more consistent across supported factual families.
- Supported factual families now include stronger direct-answer handling for `puffs / caladas`, `nicotina`, `sabor`, `modelo / versiÃ³n`, and compatibility-style facts already present in the current data shape.
- Missing supported facts now stay explicit and honest instead of falling through to generic exact-match reinforcement or fabricated claims.
- Runtime/storefront proof now exists beyond `caladas`, including flavor, compatibility-style facts, and compatibility-missing honesty.
- The accepted production change is concentrated in `src/lib/product-search-capsule.ts`, with runtime evidence in `src/services/__tests__/concierge.service.stage4.test.ts` and a narrow compatibility inclusion in `src/lib/cesarin-stage5.ts`.

### Storefront Attribute Precision / Fact Consistency Addendum
- Accepted implementation chain: `ffb4a389cc1d5d2bff435363e7a3ccb92bebf8de` and `814bb3e247752ab6adfab1e1751f23a05c9041ed`.
- The compatibility inclusion in the direct-fact suppression detector remained narrow and did not reopen broader Stage philosophy.
- This lane does not claim routing redesign, prompt-heavy redesign, Stage 4 / Stage 5 philosophy reopening, planner/orchestrator work, memory/preference work, storefront redesign, admin / Cesarin OS expansion, or measured uplift.
- The accepted baseline still preserves model-first discipline, current-turn sovereignty, catalog gate, anti-bloat, and degraded honesty.

### Storefront Truth Spine Consolidation Wave State
- This was a bounded storefront-only consolidation wave.
- Truth/help ownership is now materially more concentrated in the capsule/truth layer instead of being inferred downstream as often.
- `truth_signals` and `help_contract` now exist as explicit capsule contract outputs.
- Stage 5 is materially less detector-heavy and consumes capsule truth/help more directly.
- Service now behaves more like a literal composer of upstream turn truth, capsule truth/help, and Stage 5 render intent.
- UI now consumes a more explicit upstream help/render contract with bounded backward compatibility.
- Dominant factual/help/compare storefront paths remained preserved under the consolidated truth spine.

### Storefront Truth Spine Consolidation Wave Addendum
- Accepted implementation commit: `4138b80`.
- This wave remained model-first: upstream turn analysis and catalog gate stayed primary.
- This wave does not claim routing redesign, planner/orchestrator work, storefront redesign, Stage philosophy rewrite from zero, admin / Cesarin OS expansion, or measured uplift.
- Residual non-blocking structural limits remain explicit: Stage 5 still exists as a bounded realization layer, `help_contract` is intentionally narrow, and UI keeps bounded backward-compatibility fallback where explicit render truth is absent.

### Storefront Runtime Telemetry Truth Hardening (MVL) State
- This lane is observability / runtime-truth hardening only.
- The real storefront/customer-intelligence telemetry path now persists a more useful bounded runtime-truth set.
- Added telemetry truth now includes compact fields such as `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
- Those fields are derived from runtime truth already present in the edge/service flow rather than from new behavior heuristics.
- Non-applicable paths remain explicit and honest through null/falsey telemetry values where the truth does not apply.
- Acceptance audit found no storefront behavior drift.

### Storefront Runtime Telemetry Truth Hardening (MVL) Addendum
- Accepted implementation commit: `f7f0a5b86731d09d5ecafb4d6a54dc7fd940b9a3`.
- This lane extends runtime evidence only; it does not introduce a new behavior lane, planner layer, dashboard layer, or analytics platform.
- This lane does not claim recommendation posture changes, catalog gate semantic changes, Stage 5 family semantic changes, routing redesign, public-web selection policy changes, admin / Cesarin OS expansion, or measured uplift.
- The accepted truth is structurally implemented and acceptance-audited. This entry does not over-claim exhaustive live production proof for every new telemetry combination.

### Storefront AI_Analytics Telemetry Readiness Micro-Fix State
- This pass is a telemetry-readiness micro-fix only.
- `ai_analytics` schema is now aligned to the accepted MVL telemetry read model.
- The bounded top-level telemetry columns now include `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
- The real edge and storefront service telemetry write paths now persist those bounded fields top-level while preserving `ai_logic_debug`.
- The existing inspection path now prefers top-level columns and falls back to historical `ai_logic_debug` rows when the new columns are absent.
- Acceptance audit found no storefront behavior semantic drift and no security/RLS drift.

### Storefront AI_Analytics Telemetry Readiness Micro-Fix Addendum
- Accepted implementation commit: `39732a405230107a1294b489eb24a2203db4256e`.
- This pass does not introduce a new storefront behavior lane, dashboard/platform lane, planner/orchestrator lane, or admin / Cesarin OS expansion beyond truthful inspection-path mention.
- This pass does not claim recommendation posture changes, catalog gate semantic changes, Stage 5 family semantic changes, routing redesign, or public-web selection redesign.
- The accepted truth is structurally implemented and acceptance-audited, but this entry does not over-claim direct live verification that the migration is already applied or that live production rows were directly verified in this pass.

### Storefront Search-Leading Product Grounding & Recovery Hardening State
- This is a bounded storefront retrieval/recovery hardening lane.
- The real search-leading capsule bridge now grounds and recovers more usefully before the existing fallback tree collapses into generic no-match behavior.
- The accepted lane materially improves broad entity-led product search, attribute-led narrowing, near-exact missing-product recovery, and mixed-need product recovery when grounded help is actually possible.
- It specifically reduces the repeated dead-zone pattern where useful search-leading turns were falling into `NO_MATCH`, `KEEP_EXPLORING`, `retrieval_source = NONE`, and `product_card_count = 0`.
- Honesty remains preserved: no fake exact-match invention and no forced catalog pressure when useful grounding is absent.
- The later auditability closure was test-only and added explicit runtime/service proof for `de menta y no muy caro`, `quiero algo frutal para diario`, and `no encuentro el waka somatch mb6000`.
- The lane is now fully live-proven on a strict non-degraded live window.
- The clean live window was `2026-04-03T03:14:33Z` to `2026-04-03T03:14:53Z`.
- The old dead-end signature stayed absent in that clean window: `retrieval_source = NONE`, `capsule_match_strategy = NO_MATCH`, `product_card_count = 0`, and `next_step_family = KEEP_EXPLORING` did not reappear as the zero-card dead-end combination.
- Five audited prompts now recover through `TOKEN_RECOVERY` with cards present and `next_step_family = COMPARE_TWO`.
- `busco un waka pero no se cual` still lands in `KEEP_EXPLORING`, but with `TOKEN_RECOVERY` and `product_card_count = 1`, so it is no longer the zero-card dead-end family.

### Storefront Search-Leading Product Grounding & Recovery Hardening Addendum
- Accepted implementation chain: `f79b222b857d73946e952efb2bf7162677a8c557` and `d2bce5fdd51faa8bb45eeefd047684d1a77ca36f`.
- The primary production change lives in `src/services/ai-capsule-orchestrator.service.ts`.
- The final auditability closure lives only in `src/services/__tests__/concierge.service.stage4.test.ts`; it is not a second behavior lane.
- This lane does not claim planner/orchestrator redesign, Stage 5/commercial-handoff redesign, standalone mixed-intent expansion, broad retrieval rewrite from zero, admin / Cesarin OS expansion, or measured uplift.
- Live-proof scope was exactly the same 6 prompts listed in the accepted lane entry.
- The proof window was explicitly non-degraded, with no `GEMINI_DEGRADED` and no `429`.
- Ambient `429` remains a separate watchpoint and is not a blocker for this lane's closure.
- Preserve the existing non-claims about no planner/orchestrator redesign, no Stage 5 redesign, no broad retrieval rewrite, no admin/Cesarin OS expansion, and no measured uplift.

### Storefront Store-Hours Misrouting Micro-Fix State
- This is a bounded storefront micro-fix.
- Store-hours/opening-hours style informational turns no longer misroute into `PRODUCT_SEARCH`.
- Those turns now stay in the existing non-catalog informational/policy family.
- The catalog gate now stays closed for those turns instead of opening product recovery.
- Product capsule recovery, token-recovery behavior, and product-card surfacing are suppressed for the store-hours family.
- Runtime/service proof explicitly covers `a que hora abren hoy?`, and preserves the already-correct non-catalog behavior for `hacen envios a todo mexico?`.

### Storefront Store-Hours Misrouting Micro-Fix Addendum
- Accepted implementation commit: `363cecf78e02129b70fb388f6028a86807716af0`.
- Guardrail/runtime classification now covers store-hours phrasing such as `a que hora abren`, `a que hora cierran`, and close adjacent opening-hours variants.
- Acceptance audit found no adjacent drift and no scope widening.
- This lane does not claim a broad informational-routing rewrite, planner/orchestrator redesign, Stage 5/commercial-handoff change, search-recovery redesign, admin / Cesarin OS expansion, or measured uplift.
- The accepted truth is structurally fixed and acceptance-audited; this entry does not separately over-claim fresh live re-verification for this micro-fix.

### Storefront Degraded Policy Fallback Micro-Fix State
- This is a bounded storefront micro-fix for degraded fallback quality on non-catalog `POLICY_INQUIRY` turns.
- Under real degraded `429 / GEMINI_DEGRADED` conditions, store-hours, shipping, payment, and adjacent bounded policy turns no longer collapse into the old generic degraded line.
- The active storefront path keeps those turns non-catalog with a closed catalog gate and no product capsule.
- Store-hours remains intentionally non-inventive: the accepted fallback stays honest instead of fabricating exact hours.
- Live verified bounded responses now include `Ahorita no traigo el horario exacto confirmado en sistema.`, `Manejamos envios por DHL Express a sucursal.`, and `Por ahora manejamos solo transferencia o deposito bancario.` on the audited turn families.

### Storefront Degraded Policy Fallback Micro-Fix Addendum
- Accepted implementation commit: `ea3ca63755914f3a7f9d2330de8e2b4c5ce8a5c5`.
- This lane is both acceptance-audited and live-verified under real authenticated storefront probes with real degraded `429 / GEMINI_DEGRADED` conditions.
- It preserves non-catalog behavior, closed catalog-gate truth, no product capsule, and honest non-invention of exact store hours.
- This lane does not claim a broad resilience framework, generic 429 platform fix, new policy lane, planner/orchestrator redesign, search-recovery redesign, admin / Cesarin OS expansion, or measured uplift.
- Residual truth remains explicit: upstream `429` rate limiting still exists live; this micro-fix improved degraded fallback quality, not 429 frequency.
### Storefront Proactive Compatibility & Basket Attachment State
- This is a bounded storefront attachment lane built on the existing compatibility/concepts graph substrate.
- The attachment resolver now uses confirmed compatible relations only, resolves only active in-stock catalog products, and stays explicit about the graph truth it can and cannot support.
- Attachment surfacing is hard-gated to strong single-product support and stays suppressed on compare, exploratory, approximate, and direct factual turns.
- Stage 5 uses existing `next_step_view` / `secondaryAction` surfaces only; the lane does not create a second funnel or a new UI surface.
- The lane improves basket-building and cross-sell usefulness without claiming a general recommendation engine or multi-attachment bundles.
- Products lacking graph grounding may still surface no attachment offer at all.

### Storefront Proactive Compatibility & Basket Attachment Addendum
- Accepted implementation commit: `bc513026f944f787dabbeaa2f96e4065a7db2b5c`.
- The primary production change lives in `supabase/functions/customer-intelligence/storefront-attachments.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/services/storefront-attachments.service.ts`, `src/services/concierge.service.ts`, and `src/lib/cesarin-stage5.ts`.
- The bounded acceptance audit verdict is `ACCEPT`.
- This lane does not claim admin / Cesarin OS expansion, checkout/payment redesign, a broad ranking-engine rewrite, or guaranteed attachment availability where graph grounding is absent.

### Storefront Contextual Cart-Aware Guidance (Pre-Checkout Basket Audit) - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Contextual Cart-Aware Guidance (Pre-Checkout Basket Audit)` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `b3de0cd35975220d027ca0da9ac3634176666c7d` (`feat storefront contextual cart aware guidance`).
- **Scope:** `supabase/functions/customer-intelligence/storefront-attachments.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/services/storefront-cart-audit.service.ts`, `src/hooks/useStorefrontCartDependencyOffer.ts`, `src/lib/domain/cart.ts`, `src/components/cart/CheckoutTransitionStatus.tsx`, `src/components/cart/CartSidebar.tsx`, `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, and the focused cart/checkout readiness tests tied to those surfaces. Storefront cart / checkout-readiness only.
- **Accepted truth:** Césarín storefront can now audit the active cart for one graph-backed missing dependency in relevant cart/checkout-readiness contexts. The lane reuses the existing compatibility/concepts graph substrate, stays limited to strict dependency relation types, and only suggests active in-stock dependent products when graph grounding is present.
- **Accepted operating discipline:** Guidance is suppressed when the cart already satisfies the dependency, suppressed when the cart is blocked or already has stronger correction issues, and surfaced through existing cart/checkout readiness surfaces only. The checkout transition contract remains advisory, so guidance may surface without blocking proceed/submit by itself.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim bundle mode, multiple dependency warnings, admin / Cesarin OS expansion, checkout/payment architecture redesign, variant-level or quantity-level dependency reasoning, or guaranteed guidance for products lacking graph grounding.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened, and this lane does not convert the storefront into a general recommendation engine.
- **Outcome:** The storefront can now issue one bounded pre-checkout dependency audit when the cart context is materially relevant, improving basket integrity and readiness without introducing a second funnel.

### Storefront Variant-Level Precision & Disambiguation - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Variant-Level Precision & Disambiguation` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `9a686a8f4faa091767cc0b6dd73f7260c4b42fd3` (`feat storefront variant level precision disambiguation`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, and the focused retrieval/shaping regressions tied to those surfaces. Storefront product-search, confidence, and PDP-handoff only.
- **Accepted truth:** Césarín storefront now carries bounded `variant_truth` in the product/capsule path. The accepted states are `available`, `missing`, `ambiguous`, and `unsupported`. Retrieval hydrates nested variant rows and option values so the storefront can distinguish parent-product existence from exact-variant availability.
- **Accepted operating discipline:** Variant precision is bounded to concrete catalog-grounded attributes such as color, resistance / ohms, nicotine strength, flavor, model, and size / presentation. Missing or ambiguous variant truth downgrades confidence/readiness and keeps the handoff at PDP review or selector-needed posture instead of cart-ready posture. Confirmed in-stock variant truth may be surfaced more explicitly when grounded.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim variant certainty beyond catalog grounding, variant-level reasoning when the catalog does not expose the attribute, storefront redesign from zero, Cesarin OS/admin expansion, checkout/payment redesign, or guaranteed handling of every unusual phrasing for variant requests.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened, and this lane does not become a general variant-intelligence engine or stock oracle.
- **Outcome:** The storefront now answers specific variant requests with narrower truth, better PDP handoff, and less false confidence around unavailable variants.

### Storefront Authentic Promotional Awareness & Bounded Incentive Yielding - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Authentic Promotional Awareness & Bounded Incentive Yielding` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `8dfdcff882eb2efd873a17f092b87e87c4a8a53f` (`feat storefront authentic promotional awareness`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/services/storefront-promotions.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/lib/product-search-capsule.ts`, and the focused storefront drafting/runtime regressions tied to those surfaces. Storefront message and drafting flow only.
- **Accepted truth:** Césarín storefront now carries one bounded `promotion_signal` in the product-search capsule path. The accepted states are `FLASH_DEAL` and `COUPON`. Promotion truth is hydrated only from real active storefront sources: product-matched active flash deals and structurally valid public coupons.
- **Accepted operating discipline:** Coupon truth is structurally bounded by active flag, valid date window, positive discount, max-uses not exhausted, and prior customer use filtered out when customer identity is available. Promotion surfacing is limited to relevant turns such as explicit promo/discount questions, price hesitation / cheaper / worth-it style turns, and strong closing-relevant turns. The surfacing remains informational only, and checkout remains the final eligibility truth.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim automatic discount application, universal coupon eligibility, multiple simultaneous promo signals, admin / Cesarin OS expansion, checkout/payment redesign, marketing-engine rewrite, or broad promotional browsing UI.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened, and missing or unavailable exact variant truth still suppresses promotion pressure rather than inventing urgency.
- **Outcome:** The storefront can now surface real active promotional truth in bounded relevant turns without hallucinating codes, discounts, or urgency.
 
### Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder) - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder)` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `ba544bc82346ab856a97de0124bb9872f00adb54` (`feat storefront frictionless routine replenishment`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/services/storefront-replenishment.service.ts`, `src/components/ui/ai/AIConcierge.tsx`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/soft-continuity.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront capsule/stage/runtime regressions tied to those surfaces. Authenticated storefront reorder/replenishment assistance only.
- **Accepted truth:** Césarín storefront now supports bounded authenticated routine replenishment / conversational reorder. Replenishment truth is grounded only in real authenticated order / order-item history, and candidate items are revalidated against current catalog truth before surfacing. The capsule/runtime now carries bounded `replenishment_signal` and `AUTHENTICATED_REORDER` truth for this explicit authenticated reorder path.
- **Accepted operating discipline:** Historical items that are inactive, discontinued, invalid-variant, or unavailable are not resurrected as ready-to-repeat. Stage 5 may surface `ADD_READY` only when current catalog truth still supports direct add with grounded quantity and variant intact; otherwise the path stays `REVIEW_ONE` and uses the existing storefront message / next-step / add-to-cart surfaces only. This lane remains bounded to explicit authenticated reorder intent rather than broad history browsing.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim guest reorder memory, a full purchase-history browser, subscription logic, auto-billing, predictive reorder, CRM expansion, checkout/payment redesign, or guaranteed reorder for historical items that no longer validate.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened, including `Storefront Authenticated Reorder & Catalog Drift Hardening`. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into a general reorder platform.
- **Outcome:** The storefront can now translate explicit authenticated reorder intent into one bounded conversational replenishment path grounded in real order history and current catalog truth, while preserving review-first honesty whenever direct add is no longer supported.

### Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `24b1afd027ae96d04cf6ca579b19795fbc83a123` (`feat storefront authentic conversational order tracking`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/types/order.ts`, `src/services/orders.service.ts`, `src/services/storefront-order-tracking.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, and the focused storefront runtime/assistant regressions tied to those surfaces. Authenticated storefront post-purchase assistance only.
- **Accepted truth:** Césarín storefront now supports bounded authenticated conversational order tracking / post-purchase resolution. The capsule/runtime now carries bounded `authenticated_order_tracking` and `order_tracking_signal` truth for this lane. Order-tracking truth is grounded only in authenticated persisted order data.
- **Accepted operating discipline:** Hydration is bounded to recent relevant orders and may support explicit order-number lookup only inside that bounded set. Payment, order-status, and tracking summaries reuse canonical storefront order/payment truth rather than inventing a parallel lifecycle model. `ORDER_TRACKING` storefront routing now prefers the authenticated capsule path instead of generic fallback/policy behavior, and assistant responses for these turns remain message-only with no catalog/product help surfaces.
- **Residual truth safeguards / explicit non-claims:** Guest/no-order/no-tracking cases degrade honestly. This lane does not claim guest access to order truth, refunds, cancellations, order edits, external courier API scraping, admin / Cesarin OS expansion, checkout/payment redesign, or a full order-history browser / CRM panel in chat.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes, does not redesign checkout/payment, and does not convert the storefront into an order-management console.
- **Outcome:** The storefront can now answer bounded authenticated post-purchase questions such as payment confirmation, order status, shipping state, and persisted guide availability from real order truth while staying honest when no authenticated bounded match exists.

### Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA)` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `0d3b0725967022803ab2b42d08ef21d5dbbc487c` (`feat storefront contextual warranty triage`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-warranty-triage.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Authenticated storefront post-purchase support triage only.
- **Accepted truth:** Césarín storefront now supports bounded authenticated contextual warranty / defect triage. `WARRANTY_SUPPORT` now exists as a bounded non-catalog storefront support intent, and the capsule/runtime now carries bounded `authenticated_warranty_triage` truth for this lane.
- **Accepted operating discipline:** Warranty-triage truth is grounded only in authenticated persisted recent fulfilled-order and order-item data. Explicit order-number lookup is bounded to that same authenticated recent-order set. The resolver classifies this lane into bounded states such as `LIKELY_ELIGIBLE`, `OUT_OF_POLICY`, `CANNOT_IDENTIFY_PRODUCT`, `NO_RELEVANT_ORDER`, and `AUTH_REQUIRED`. The lane remains strict read-only and message-only, catalog/product sales surfaces stay suppressed on these turns, and generic warranty-policy questions may still remain `POLICY_INQUIRY` when contextual authenticated triage is not the right lane.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim guest warranty access, RMA ticket creation, refunds, cancellations, order edits, admin / Cesarin OS expansion, checkout/payment redesign, or a full support desk / CRM / ticketing platform.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into an end-to-end warranty platform.
- **Outcome:** The storefront can now read bounded authenticated recent order truth to triage defect/warranty-style turns more contextually while staying honest when product identity, recency, or authentication do not support stronger claims.

### Storefront Authenticated Loyalty & VIP Yielding - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Authenticated Loyalty & VIP Yielding` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `e495a9d0c8a59ceeb832f6545e81d144e1af2c20` (`feat storefront authenticated loyalty vip yielding`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-loyalty-status.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Authenticated storefront loyalty/status assistance only.
- **Accepted truth:** Césarín storefront now supports bounded authenticated loyalty / VIP awareness. `LOYALTY_SUPPORT` now exists as a bounded non-catalog storefront intent, and the capsule/runtime now carries bounded `authenticated_loyalty_status` and `loyalty_status_signal` truth for this lane.
- **Accepted operating discipline:** Loyalty truth is grounded only in existing authenticated storefront loyalty/customer sources already present in the system. Points balance, tier/status, monetary equivalent, and next-tier distance are surfaced only when grounded by existing store rules/configuration. The lane is strict read-only and message-only, guest/unauthenticated users do not get fake loyalty access, zero-point and no-loyalty-data states degrade honestly, and catalog/product sales surfaces stay suppressed on loyalty turns.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim point redemption, point mutation, automatic discount application, admin / Cesarin OS expansion, checkout/payment redesign, a rewards dashboard, a gamification engine, or CRM expansion.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into a loyalty-management platform.
- **Outcome:** The storefront can now answer bounded authenticated loyalty and VIP questions with grounded points and tier truth while staying exact about what the system does not do.

### Storefront Contextual Out-of-Stock Pivot & Alternative Yielding - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Contextual Out-of-Stock Pivot & Alternative Yielding` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `537856a144854604c0b2170f99bc08cd37a47d12` (`feat storefront contextual oos pivot`).
- **Scope:** `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, `src/lib/__tests__/product-search-capsule.test.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, and the focused storefront product-search / stage shaping regressions tied to those surfaces. Product search and Stage 5 storefront recovery only.
- **Accepted truth:** Césarín storefront now supports bounded contextual out-of-stock pivoting toward in-stock alternatives. The lane reuses the existing product-search capsule / Stage 5 storefront flow. Pivoting only occurs when the requested item or requested variant is genuinely unavailable or out of stock.
- **Accepted operating discipline:** Suggested substitutes are grounded in existing catalog truth and currently purchasable in stock. Ranking remains bounded to close sibling signals already grounded in current metadata such as brand, flavor, model, type, section, and token overlap. Missing-variant cases may route into `OUT_OF_STOCK_ALTERNATIVE` when grounded substitutes exist. If no sufficiently grounded substitute exists, the lane degrades honestly to `NO_MATCH`. Existing in-stock paths and variant-truth discipline remain preserved, and Stage 5 surfaces the pivot through existing storefront message / next-step structures only.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim waitlist capture, notify-me flow, admin / Cesarin OS expansion, checkout/payment redesign, a broad recommendation-engine rewrite, guaranteed substitute availability beyond current in-stock catalog truth, or semantic equivalence when only approximate similarity exists.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into a generalized recommender or inventory-bypass system.
- **Outcome:** The storefront can now recover some high-intent out-of-stock turns into bounded in-stock alternatives while staying honest about availability, similarity, and unresolved cases.

### Storefront Conversational Compatibility & Fit Verification - 4 de abril de 2026
- **Accepted storefront lane:** `Storefront Conversational Compatibility & Fit Verification` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `713644bfb8535fa967f266f8991aa7367be5a396` (`feat storefront compatibility fit verification`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-compatibility-check.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/storefront-compatibility.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Explicit compatibility / fit verification only.
- **Accepted truth:** Césarín storefront now supports one bounded storefront lane for explicit compatibility / fit verification. `COMPATIBILITY_CHECK` now exists as a bounded storefront intent and routes through `storefront_compatibility_check`, and the client capsule/runtime now carries bounded compatibility truth for this lane.
- **Accepted operating discipline:** Compatibility resolution is strict read-only and grounded in catalog concept/relation truth already present in the system. Safe cart context may be used only when the anchor is unambiguous. The lane returns bounded states such as `COMPATIBLE`, `INCOMPATIBLE`, `NEEDS_MORE_CONTEXT`, `NO_GROUNDED_MATCH`, and `REVIEW_PRODUCT`. Existing storefront surfaces only are used, and the lane stays honest when truth is missing or weak.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim cart mutation, order/payment mutation, invented compatibility, admin / Cesarin OS expansion, web lookup, broad external fit intelligence, automatic cart injection, or order actions.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into a broad hardware-mechanics or external fit-intelligence system.
- **Outcome:** The storefront can now answer explicit compatibility / fit turns through bounded grounded storefront truth while staying conservative about missing context, ungrounded fit, and unsupported claims.

### Storefront Conversational Basket Kitting & Hardware Upgrades - 3 de abril de 2026
- **Accepted storefront lane:** `Storefront Conversational Basket Kitting & Hardware Upgrades` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `a8e097118a1f97d95458840edec935255972dc7c` (`feat storefront conversational basket kitting`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-kitting-basket.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Authenticated storefront kitting and hardware-upgrade assistance only.
- **Accepted truth:** Césarín storefront now supports bounded conversational basket kitting / hardware-upgrade assistance. `KIT_ASSEMBLY` now exists as a bounded storefront intent for explicit starter-kit, setup, switch-from-disposables, and hardware-upgrade style asks, and the capsule/runtime now carries bounded `storefront_kitting_basket` truth for this lane.
- **Accepted operating discipline:** Kitting is grounded only in active in-stock catalog truth plus existing compatibility/attachment truth already present in the system. The resolver returns bounded states such as `FULL_KIT`, `PARTIAL_KIT`, and `NO_GROUNDED_KIT`. Hardware, consumable, and liquid compatibility stay grounded rather than semantic-only, and the lane degrades honestly when one component cannot be grounded or stocked. The visible storefront outcome stays inside existing assistant message, next-step, and resolved-product surfaces only.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim a new bundle/cart entity, bundle UI, admin / Cesarin OS expansion, schema migrations, checkout/payment redesign, CRM/profile expansion, broad "build anything" orchestration, or guaranteed full-kit availability when catalog truth cannot support it.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert the storefront into a bundle platform or generic setup builder.
- **Outcome:** The storefront can now assemble bounded compatible in-stock starter baskets for explicit kit and hardware-upgrade requests while preserving grounded fit, stock truth, and honest degradation.

### Storefront Conversational Checkout Readiness & Friction Resolution - 4 de abril de 2026
- **Accepted storefront lane:** `Storefront Conversational Checkout Readiness & Friction Resolution` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `f1b9bb0ec08fa7cae189dfd058b1e685348cf878` (`feat storefront checkout readiness friction resolution`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-checkout-readiness.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Storefront checkout-readiness and close-now friction assistance only.
- **Accepted truth:** Césarín storefront now supports one bounded storefront lane for checkout-readiness / close-now friction. `CHECKOUT_READINESS` now exists as a bounded storefront intent, and the client capsule/runtime now carries bounded `storefront_checkout_readiness` truth for this lane.
- **Accepted operating discipline:** The resolver is strict read-only and reuses existing storefront truth only: cart truth, checkout draft truth, payment settings truth, address truth, coupon validation truth, and authenticated open-order recovery truth. The lane stays bounded to readiness states such as `READY_TO_CHECKOUT`, `MISSING_REQUIRED_INFO`, `CART_BLOCKER`, `PAYMENT_METHOD_INFO`, `SHIPPING_INFO_AVAILABLE`, `SHIPPING_INFO_PARTIAL`, and `AUTH_REQUIRED`. Responses remain message-only and non-catalog, and shipping-cost guidance stays bounded to what current storefront truth can actually support.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim order creation, payment mutation, checkout execution, payment execution, invented exact shipping quotes, admin / Cesarin OS expansion, or architecture reopening.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not redesign checkout, does not reopen Cesarin OS/admin lanes, and does not convert Césarín into a payment or order-execution surface.
- **Outcome:** The storefront can now answer “ya puedo pagar?”, “qué me falta para cerrar?”, payment-method questions, and bounded shipping-readiness questions from real storefront truth while staying exact about blockers, missing information, and unsupported quote precision.

### Storefront Contextual Budget Rescue & Trade-Down Yielding - 4 de abril de 2026
- **Accepted storefront lane:** `Storefront Contextual Budget Rescue & Trade-Down Yielding` is now canonized as `ACCEPT`.
- **Accepted implementation commit:** `ae2f5f7` (`feat storefront budget rescue trade down`).
- **Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-budget-rescue.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Explicit price-friction and trade-down assistance only.
- **Accepted truth:** Césarín storefront now supports one bounded storefront lane for explicit price-friction / cheaper-alternative turns. `BUDGET_RESCUE` now exists as a bounded storefront intent, and the client capsule/runtime now carries bounded `storefront_budget_rescue` truth for this lane.
- **Accepted operating discipline:** The resolver is strict read-only and reuses existing storefront truth only: current catalog truth, stock truth, promo truth, and optional safe single-cart-item context. The lane stays bounded to truthful states such as `CHEAPER_ALTERNATIVE_FOUND`, `PROMO_ALREADY_BEST_VALUE`, `NO_GOOD_TRADE_DOWN`, and `REVIEW_CURRENT_OPTION`. Responses remain message-only and use existing assistant message, product-card, and next-step surfaces only, and the lane does not invent discounts, price mutation, or savings claims.
- **Residual truth safeguards / explicit non-claims:** This lane does not claim fake discounting, price mutation, invented savings, admin / Cesarin OS expansion, checkout/payment redesign, dynamic discounting, or a broad recommender rewrite.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This lane does not reopen Cesarin OS/admin lanes and does not convert Césarín into a pricing engine.
- **Outcome:** The storefront can now recover explicit price-friction turns with bounded grounded trade-down help while staying honest about value, availability, and unsupported savings claims.

### Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass - 4 de abril de 2026
- **Accepted technical cleanup:** `Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass` is now canonized as `ACCEPT`.
- **Accepted cleanup commits:** `571da0ec7c9b2bbf0bfafa03d7b9fe31a6168de8` (`chore deprecate legacy policy routing`) and `8ee9d4ce8e5b145dc42a0f238ffd300c2a9b0c42` (`chore remove dead get_store_policy helper`).
- **Scope:** Legacy policy routing/dispatch hygiene only inside `customer-intelligence`. No new storefront feature, no commercial behavior expansion, and no architecture reopening.
- **Accepted truth:** Legacy `get_store_policy` routing residue is now removed from active capability, routing, and dispatch surfaces. Policy handling now relies on canonical surviving paths rather than the removed legacy route, and the dead orphaned `get_store_policy` helper block was removed from `supabase/functions/customer-intelligence/tools.ts`.
- **Accepted operating discipline:** `src/services/storefront-cart-audit.service.ts` was intentionally preserved because deleting or merging it was not behavior-safe within this micro-pass. No new storefront feature was introduced, `PRODUCT_SEARCH` remained untouched, promotions/replenishment remained untouched, and no admin drift occurred.
- **Residual truth safeguards / explicit non-claims:** This cleanup does not claim a new storefront lane, new commercial capability, `PRODUCT_SEARCH` changes, cart-audit redesign, promotions/replenishment changes, admin / Cesarin OS expansion, or architecture reopening.
- **What did not change:** Prior storefront/core lanes remain authoritative and non-reopened. This cleanup does not alter visible storefront pilot behavior and does not expand Césarín into a new capability surface.
- **Outcome:** Canonical runtime truth is cleaner: the obsolete legacy policy route is gone from active surfaces, the dead helper body is gone, and the preserved cart-audit overlap remains an intentional non-change rather than a hidden residual deletion.

### Vector Pipeline 768d Alignment & PRODUCT_SEARCH Operational Hold - 5 de abril de 2026
- **Accepted upstream/vector infrastructure truth:** The `768d` vector-pipeline correction is accepted in repo truth on commit `c1136f156e292f35e585534a74a151bcbabfb470` (`fix down migrate vector pipeline to 768d`).
- **Accepted live migration truth:** The target live environment was actually converged to `768d` schema/RPC truth by applying `supabase/migrations/20260404_vector_pipeline_down_migrate_to_768.sql`. `products.embedding` and `store_knowledge.embedding` now exist as `vector(768)`, and `match_products(768d)` / `match_knowledge(768d)` no longer fail on vector-dimension mismatch.
- **Operational truth after live migration:** The strict down-migration nulled incompatible `3072d` stored embeddings as designed. Canonical repopulation attempts then ran through the existing Gemini seed path and failed with `429 RESOURCE_EXHAUSTED`, so live embeddings remain empty: `products` = `44 active / 0 embedded`, `store_knowledge` = `41 active / 0 embedded`.
- **Current canonical status:** `PRODUCT_SEARCH` is no longer architecturally blocked by provider/schema/RPC mismatch. It remains on explicit operational hold because live embeddings are still empty and semantic retrieval cannot yet be validated. The current blocker is quota-only, not code, schema, RPC, routing, storefront UI, or storefront conversational logic.
- **Residual truth safeguards / explicit non-claims:** This entry does not claim live `PRODUCT_SEARCH` proof, retrieval quality, storefront-lane closure, new storefront functionality, or any reopened storefront AI lane. It does not claim that empty live embeddings are acceptable steady-state behavior.
- **What did not change:** No storefront conversational behavior was modified in this final state. No `customer-intelligence` routing posture, stage shaping, or UI behavior changed in canon because of this hold entry.
- **Outcome:** The vector/search substrate is now structurally aligned at `768d` both in repo truth and in the live target environment, but `PRODUCT_SEARCH` remains operationally blocked until Gemini quota becomes available and canonical repopulation restores live embeddings.

### Bulk Operational Data Hydration & Telemetry Triage - 6 de abril de 2026
- **Accepted operational data truth:** `Bulk Operational Data Hydration & Telemetry Triage` was accepted with minor residual. This was a non-coding live data hydration pass, not a new storefront capability lane.
- **Live data mutations accepted:** The pass inserted `+37` `product_variants`, `+2` `product_concepts`, `+4` `concept_aliases`, `+2` `compatibility_relations`, and `+3` `cesarin_improvement_items`.
- **Variant truth:** Active product variant coverage is now materially stronger and was validated as `44/44`. The inserted variants were grounded in existing live `products.sku`, `products.price`, `products.stock`, and `products.images`.
- **Compatibility truth:** Compatibility coverage improved only slightly. The two added relations were bounded `has_connector` relations to the existing `510 Connector`, grounded only in explicit `products.specs.conector` values for `Mod Regulado 80W Compact` and `Vaporizer Micro Pod 420`. Compatibility graph coverage remains sparse, so compatibility and kitting-style features remain materially under-seeded beyond this narrow connector truth.
- **Telemetry triage truth:** Three high-signal `cesarin_improvement_items` were added from live `ai_analytics`: store-hours knowledge gap, shipping-policy retrieval gap, and payment-method policy retrieval gap. No invented `store_knowledge` facts were inserted.
- **Rejected source for compatibility hydration:** `graqle.json` was inspected but not used for product compatibility inserts because it represented a technical code graph rather than grounded commercial catalog compatibility truth.
- **Residual truth safeguards / explicit non-claims:** This entry does not claim full compatibility completion, full kitting readiness, new storefront features, UI/routing/application logic changes, Cesarin OS/admin implementation expansion, or `PRODUCT_SEARCH` readiness.
- **Current blocker unchanged:** `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings. This data hydration pass did not unblock semantic retrieval validation.
- **Follow-on hydration truth:** A later accepted non-coding `Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized)` pass on 8 de abril de 2026 further extended live compatibility truth by inserting `+3` `product_concepts`, `+6` `concept_aliases`, and `+9` `compatibility_relations`, bounded to telemetry-prioritized `uses_battery`, `uses_pod`, and `has_connector` specific-model relations only.
- **Current compatibility residual:** Live compatibility coverage is now materially better for the seeded battery / pod / connector items from Batch 2 and the seeded device-to-liquid items from the later Batch 3, but the graph still remains sparse overall. Compatibility / fit / kitting flows must still degrade honestly when seeded truth is absent. These follow-on batches did not change storefront code, routing, UI, embeddings/search infrastructure, or `PRODUCT_SEARCH` operational hold status.

### Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized) - 8 de abril de 2026
- **Accepted operational data truth:** `Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized)` was accepted with minor residual. This was a non-coding live compatibility hydration pass, not a new storefront capability lane.
- **Priority basis:** The pass was telemetry-prioritized. Recent live `ai_analytics` showed repeated compatibility/fit pressure around `le queda`, `coil`, `pod`, `kit`, connector, and battery-adjacent queries, so the batch targeted those higher-friction catalog areas rather than broad blind ingestion.
- **Live data mutations accepted:** The pass inserted `+3` `product_concepts`, `+6` `concept_aliases`, and `+9` `compatibility_relations`.
- **Accepted relation-family truth:** Inserted compatibility relations were bounded to `uses_battery = 5`, `uses_pod = 3`, and `has_connector = 1`.
- **Grounding discipline:** Insertions were grounded only in explicit live product text/spec evidence such as `batería 18650`, `batería integrada`, `cartuchos`, `pods propietarios`, and `conexión 510 híbrida`. `graqle.json` was inspected but again rejected as a commercial compatibility source.
- **Seeded-item improvement truth:** The pass materially improved compatibility coverage for specific seeded products including battery-backed mods, integrated-battery devices, pod/cartucho devices, and one additional 510-connector model.
- **Residual truth safeguards / explicit non-claims:** This entry does not claim full compatibility completion, full kitting completion, exact coil truth where the catalog still lacks safe grounding, third-party pod-fit coverage, new storefront features, storefront code/UI/routing changes, Cesarin OS/admin implementation expansion, or `PRODUCT_SEARCH` readiness.
- **Current blocker unchanged:** `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings. This compatibility hydration pass did not change semantic retrieval state.

### Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized) - 8 de abril de 2026
- **Accepted operational data truth:** `Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized)` was accepted with minor residual. This was a non-coding live compatibility hydration pass, not a new storefront capability lane.
- **Priority basis:** The pass was telemetry-prioritized. After Batch 2, the next grounded high-value gap was concrete device-to-liquid compatibility on mixed device/liquid queries, while exact coil-fit and third-party pod-fit cases still lacked safe live catalog grounding.
- **Live data mutations accepted:** The pass inserted `+4` `product_concepts`, `+8` `concept_aliases`, and `+4` `compatibility_relations`.
- **Accepted relation-family truth:** Inserted compatibility relations were bounded to `recommended_for_liquid = 4`.
- **Grounding discipline:** Insertions were grounded only when the source device already had confirmed `recommended_for_liquid` truth to `Nic Salts` or `Freebase` and the target liquid product explicitly declared that same liquid type in live tags and/or description. This pass instantiated grounded device -> liquid-product truth; it did not speculate beyond that.
- **Seeded-item improvement truth:** The pass materially improved compatibility coverage for specific seeded device-to-liquid cases, including `Pod System Starter Kit` with concrete nic-salt products and `Box Mod` seeded devices with concrete freebase products.
- **Residual truth safeguards / explicit non-claims:** This entry does not claim full compatibility completion, full kitting completion, exact coil truth where the catalog still lacks safe grounding, third-party pod-fit coverage, broad liquid-family completion beyond the seeded items, new storefront features, storefront code/UI/routing changes, Cesarin OS/admin implementation expansion, or `PRODUCT_SEARCH` readiness.
- **Current blocker unchanged:** `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings. This compatibility hydration pass did not change semantic retrieval state.

### Phase Completion & Quota Escalation Waiting State - 8 de abril de 2026
- **Accepted status truth:** The project is now reconciled into a phase-complete / quota-escalation waiting state under current constraints. This is a status/canon truth entry, not a new implementation lane.
- **Front exhaustion truth:** All currently available grounded non-coding fronts have been exhausted or are legitimately paused. Compatibility hydration is paused due signal exhaustion rather than neglect, and telemetry/policy follow-on work no longer has a higher-signal grounded batch available inside current scope.
- **Knowledge saturation truth:** Policy / `store_knowledge` textual coverage is effectively saturated under current source truth, but semantic activation of that knowledge remains blocked because live embeddings are still empty.
- **Current blocker truth:** `PRODUCT_SEARCH` remains on explicit operational hold solely due Gemini provider quota exhaustion on embedding repopulation. The blocker is no longer architecture, code, schema, RPC, storefront routing, storefront UI, or Cesarin OS/admin implementation.
- **Open-lane truth:** No honest coding lane remains open in storefront or Cesarin OS/admin under the current project front.
- **Next-move truth:** The next correct move requires Gemini quota recovery, provider-tier upgrade, or an explicit strategic pivot outside the current storefront / Cesarin OS implementation front.
- **Residual truth safeguards / explicit non-claims:** This entry does not claim project closure, `PRODUCT_SEARCH` proof, embedding repopulation success, compatibility completion, or that no future work exists after quota recovery or a strategic pivot.
*Actualizado: 3 de abril de 2026 (Cesarin Storefront - Search-Leading Product Grounding & Recovery Hardening - ACCEPT, LIVE PROVEN). Actualizado: 3 de abril de 2026 (AI Platform Integrity & Runtime Convergence - ACCEPT WITH MINOR RESIDUAL RISK). Actualizado: 3 de abril de 2026 (Cesarin OS â€” Operational Truth Convergence - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Proactive Compatibility & Basket Attachment - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Contextual Cart-Aware Guidance (Pre-Checkout Basket Audit) - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Variant-Level Precision & Disambiguation - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Authentic Promotional Awareness & Bounded Incentive Yielding - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder) - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Authenticated Loyalty & VIP Yielding - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Contextual Out-of-Stock Pivot & Alternative Yielding - ACCEPT).*

*Actualizado: 3 de abril de 2026 (Storefront Conversational Basket Kitting & Hardware Upgrades - ACCEPT).*

*Actualizado: 4 de abril de 2026 (Storefront Conversational Checkout Readiness & Friction Resolution - ACCEPT).*
*Actualizado: 4 de abril de 2026 (Storefront Contextual Budget Rescue & Trade-Down Yielding - ACCEPT).*
*Actualizado: 4 de abril de 2026 (Storefront Conversational Compatibility & Fit Verification - ACCEPT).*
*Actualizado: 4 de abril de 2026 (Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass - ACCEPT).*
*Actualizado: 5 de abril de 2026 (Vector Pipeline 768d Alignment & PRODUCT_SEARCH Operational Hold - ACCEPTED / OPERATIONAL HOLD).*
*Actualizado: 6 de abril de 2026 (Bulk Operational Data Hydration & Telemetry Triage - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL).*
*Actualizado: 8 de abril de 2026 (Phase Completion & Quota Escalation Waiting State - RECONCILED).*
