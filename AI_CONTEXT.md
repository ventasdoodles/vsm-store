# VSM STORE — DOCUMENTO MAESTRO TÉCNICO

> **FUENTE DE VERDAD ABSOLUTA.** Foto técnica real del sistema.
> NO es un plan. Es lo que EXISTE. Leer COMPLETO antes de tocar cualquier archivo.
> Cualquier IA o desarrollador que trabaje en este proyecto DEBE obedecer este documento.
> **Tras cada cambio al código, ACTUALIZAR este documento (ver §1.10).** Sin excepción.
> Historial de auditorías detallado en `AUDIT_LOG.md`.

## 🛰️ Project Status
- **Wave 193 (DONE)**: Marketing AI Reality Repair. Removed non-existent `marketing-intelligence` dependency. Implemented robust local heuristics for Coupons and Flash Deals. Renamed `Magic` branding to `System` for architectural sincerity. Cleaned `useAdminMarketing.ts` to use `suggestFlashDealSystem`. Base Build v113.
- **Catalog Grid Zero-Lag Canon (DONE)**: `src/components/products/ProductCard.tsx` no longer performs continuous `getBoundingClientRect()` reads during pointer motion. The spotlight effect now caches geometry, updates CSS local variables through `requestAnimationFrame`, and renders only on devices matching `matchMedia('(hover: hover) and (pointer: fine)')`. This closes the catalog layout-thrashing path that degraded scroll performance on touch devices and formalizes the permanent storefront rule that high-cardinality catalog animations must degrade by device capability instead of taxing the main thread.
- **Mercado Pago Checkout E2E Stabilization (DONE)**: Checkout Pro sandbox loop validated end-to-end. `create-payment` no longer hides order lookup failures behind restrictive profile assumptions: current implementation reads the order with `.select('*')`, surfaces raw DB errors, creates Mercado Pago preferences, and persists `mp_preference_id`. `mercadopago-webhook` is confirmed mutating `orders.mp_payment_id`, `orders.mp_payment_data`, `orders.payment_status`, and `orders.status` from asynchronous MP callbacks. Deployment canon for Supabase Edge Functions is GitHub Actions pipeline-first via `.github/workflows/deploy-functions.yml` because the host OS lacks reliable local Docker support for function deployment. `mercadopago-webhook` requires `[functions.mercadopago-webhook] verify_jwt = false` in `supabase/config.toml` to accept external Mercado Pago requests.
- **Technical Debt Closure — CI/CD Webhook & Loyalty RPC (DONE)**: The deploy canon is now materially aligned with workflow reality: `.github/workflows/deploy-functions.yml` explicitly deploys `mercadopago-webhook` with `--no-verify-jwt`, closing the last CI/CD gap for the Mercado Pago async payment loop. The loyalty dependency `process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)` from `supabase/migrations/20260310_loyalty_rpc_fix.sql` has been validated as present in the remote database with `EXECUTE` granted to `authenticated`, resolving the previously masked `PGRST202` failure path from `src/services/loyalty.service.ts`. Critical commercial infra is now documented as structurally satisfied across checkout webhook delivery and loyalty points RPC execution.

**Storefront Performance Canon â€” Catalog Zero Lag**

- **Regla de Oro de Animaciones de CatÃ¡logo:** Cualquier efecto dinÃ¡mico continuo (spotlight, parallax, seguimiento de cursor, overlays guiados por Framer Motion) en arreglos de catÃ¡logo de **8 nodos visibles o mÃ¡s** debe ejecutarse con `requestAnimationFrame` o CSS local variables previamente cacheadas. Queda prohibido recalcular geometrÃ­a (`getBoundingClientRect` o lecturas equivalentes de layout) en cada `mousemove`.
- **PolÃ­tica de degradaciÃ³n por dispositivo:** Estos efectos deben bloquearse de renderizar en dispositivos touch o sin `pointer: fine` para mantener los 60 FPS inquebrantables de la meta VSM.

---

**Post-Wave-193 Operator Tooling:**

- **Cesarin OS Admin IA Rationalization** (implemented, structurally validated): `AdminCesarinOS` now reads as an operating console instead of a flat power-user tab pile. Primary reading model changed to four work modes: monitor, review, configure, and lab. `Pilot` is the default cockpit; `Analytics` is explicitly secondary/historical; `Improvements` is framed as governed follow-up while `Interventions` stays as suggestion review. Operator copy was tightened across `Pilot`, `Analytics`, `Quality`, `Concepts`, and runtime parity surfaces to reduce jargon, remove fake certainty, and surface real next-action cues. No backend schema changes. No AI routing changes. Commit: pending current UX refactor lane.
- **Cesarin OS Graph-Assisted Operator Workbench** (implemented, accepted, closed): A92 extends the A91 read-only repo-graph subview inside `Conceptos` without changing its lane boundaries. `admin-repo-graph.service.ts` still statically consumes local `graqle.json`, but now also derives truthful related-set outputs for the selected node: `containerNode`, `sameContainerNodes`, `sameTypeNodes`, `pathLocalNodes`, and `nodeDirectory`. `TabRepoGraph.tsx` now adds operator list scopes (`General`, `Mismo contenedor`, `Mismo tipo`, `Ruta local`, `Review set`), quick context actions including `Copiar ruta`, related-surface cards, a dedicated review-set panel, and compact guidance blocks (`Si muestra`, `No prueba`, `Inspeccion siguiente`). The review set is explicitly local to the Repo Graph view, does not persist, and is lost on reload or when leaving the subview. No backend graph intelligence, live graph infrastructure, or runtime dependency proof is claimed. Commits: 599c058 (workbench extension), ec0389a (review-set honesty). Audit: A92.
- **Learning Intervention Workflow MVP** (implemented, manually tested): Admin-only operator panel for intervention recommendations. Signal capture + rule-based diagnosis + decision tracking. Cold-review validated. Manual testing confirmed operator workflow (approve/reject transitions, data persistence, filtering). Commit a28ec1e. No autonomous learning or auto-execution. Ready for operator trial use.
- **Description Downstream Bridge** (implemented, cold-review approved): `description` field now survives mapper/contract boundaries in product search pipeline (exact + semantic paths). Structural alignment verified. No UI display claim. Enables downstream consumption of semantic context. Commit: a28ec1e (no separate commit).
- **Description Consumption Discipline Remediation** (implemented, cold-review approved): `description` usage restricted to semantic fallback-only (BRANCH E). BRANCH C (exact match) uses `ai_sales_note` only. Helper filtering hardened: rejects boilerplate, category repetition, title duplication. All fallback paths preserve safe behavior. Commit: eb3566c.
- **Out-of-Stock Alternative Justification Upgrade** (implemented, cold-review approved): BRANCH D (OUT_OF_STOCK_ALTERNATIVE) now provides brief spec-based similarity justification when available. Compares key specs from exhausted exact product vs. suggested alternatives. Falls back to generic message when justification weak or unavailable (conservative behavior). No new field bridges. No feature expansion. Commit: eb3566c.
- **Featured Fallback Justification Adoption** (implemented, cold-adoption approved): BRANCH B (FEATURED_FALLBACK) tone refined for cautious ambiguity posture ("Veo opciones que podrían encajar" instead of "Tengo opciones interesantísimas"). Includes optional specs cue when top featured product has useful specs. Falls back to generic message when specs unavailable. Language micro-fix applied for natural Spanish flow. Ambiguity discipline fully preserved (still invites clarification). Commit: 3e87a6c.
- **Knowledge Capsule Input Contract Integrity — is_ambiguous Zod Gap** (implemented, Zod-validated + live-deploy verified, closed): Symmetric gap to A82, applied to `knowledgeToolSchema`. `is_ambiguous` was required (`z.boolean()` with no default); two paths omitted it: (1) POLICY_INQUIRY guardrail injection pushed `{ query: query || '' }` without `is_ambiguous` — every guardrail-injected policy query failed Zod validation in `executeKnowledgeCapsule` before any RAG execution; (2) the single `knowledge_rag_foundation` few-shot example omitted the field, training the Analyst to omit it for all policy calls. Result: every POLICY_INQUIRY returned `buildDegradedKnowledgeContract('SCHEMA_ERROR', ...)` — "Actualmente no puedo consultar el manual de políticas de forma automática" — the knowledge capsule had never executed real RAG retrieval in production. Three-point fix: `knowledgeToolSchema` hardened with `z.boolean().default(false)` as permanent defense-in-depth (`false` allows `HIGH_CONFIDENCE_POLICY_MATCH` at ≥0.82 similarity for specific queries); POLICY_INQUIRY guardrail injection now includes `is_ambiguous: true` (broad/unresolved intent — prevents false high-confidence match); few-shot example 2 corrected to `"is_ambiguous": false` (specific policy question). Validation: 15/15 Zod simulation PASS + 4/4 live probes PASS — "¿hacen envíos?", "¿cuál es la política de envíos?", "¿cómo manejan pagos y envíos?" all → `knowledge_rag_foundation` capsule with `is_ambiguous` present, no DEGRADED fallback; "hola" remains Sommelier path. Live observation: all policy probes showed Analyst emitting `is_ambiguous` directly (`injected_tools: []`) — corrected few-shot is immediately effective. No schema migration. No client changes. No router or capsule redesign. Commit: d35b1ea. Audit: A86.
- **Structured Guardrail Decision Telemetry** (implemented, simulation-validated + live-runtime verified, closed): Key AI-routing decisions were operationally invisible in persistent telemetry — a single `ai_analytics` row could not reconstruct Analyst classification, guardrail overrides, injected tools, or capsule outcome. Five blind spots closed: (1) `analyst_intent` captured before any guardrail override; `guardrail_intent` captures the resolved value — delta is now queryable per row; (2) `guardrail_overrides[]` records which override rules fired (`COMPATIBILITY_FORCE`, `UNKNOWN_RESOLVE_*`, `TERMINAL_RECOVERY`) — A83/A84 hardening is verifiable from production telemetry without reading edge logs; (3) `injected_tools[]` lists tool calls where `reason === 'guardrail_injection'`; (4) `capsule_execution_status` and `capsule_match_strategy` extracted from capsule contracts — hardcoded `capsule_match_success: true` and `fallback_used: false` replaced with contract-derived values; capsule DEGRADED rate no longer masked; (5) cart path `detected_intent` corrected from `'search'` to `'cart_operation'`. `guardrailTelemetry` struct built in edge function after injection chain and appended to all three capsule router debug payloads + OUT_OF_DOMAIN server insert. Client extracts from `data.debug?.guardrail_telemetry` with `?? null`/`?? []` safe defaults — Sommelier path unaffected. No schema migration. No new table. Additive JSONB keys only. Simulation 23/23 PASS. Live runtime verification passed. Commit: be461cb. Audit: A85.
- **Cart Guardrail Injection Gap — CART_OPERATION Without Safety Net** (implemented, simulation-validated + live-deploy validated, closed): `CART_OPERATION` was the only capsule-routable intent with no guardrail injection safety net. After A83 strict AND routing, an Analyst output with `intent: CART_OPERATION` and `tool_calls: []` would fail the cart router's AND condition and fall through to the Sommelier general path — silent cart intent loss. Remediation: added a symmetric injection block for `CART_OPERATION` consistent with the pattern already established for `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, and `COMPATIBILITY_CHECK`. Conservative defaults: `action: 'ADD'`, `quantity: 1`, `product_ref: query` — downstream ambiguity handled by cart capsule. No schema migration. No client changes. No routing logic changes. Simulation 4/4 PASS (injection fires on missing tool call, skipped on existing, product and greeting paths unchanged). Live probe: "agrega un vape de uva al carrito" → `cart_operator` path confirmed. All five capsule-routable intents now have complete injection coverage. Commit: 109e150. Audit: A84.
- **Router Precedence Hardening — OR-Arm Capsule Dispatch Weakness** (implemented, simulation-validated + live-deploy validated, closed): All three capsule router blocks used OR-arm conditions that allowed tool call presence alone (without matching intent) to trigger capsule delegation. Product search router's second OR arm could swallow `CART_OPERATION`, `ORDER_TRACKING`, and `INVENTORY_OUTLOOK` when the Analyst emitted a `product_search_integrity` call alongside a primary tool. Knowledge router's OR arm could swallow `CART_OPERATION` on `knowledge_rag_foundation` presence alone. These OR arms were designed as fallbacks for the case where the Analyst classified intent correctly but omitted the tool call — a role already covered by the guardrail injection chain, making the OR arms redundant and actively harmful in mixed-tool-call outputs. Remediation: all three routers changed to strict AND conditions (`intent === 'X' && capsuleCall`). Structurally safe because guardrail injections guarantee tool call presence for every routable intent before the router evaluates. No schema migration. No client changes. No injection logic changes. Deterministic simulation 7/7 PASS (proves both pre-A83 misroutes and post-A83 correct dispatch). Live probes 4/4 PASS. Residual: cart guardrail injection gap (CART_OPERATION with empty tool_calls) confirmed and addressed in A84. Commit: ba8ac33. Audit: A83.
- **Capsule Input Contract Integrity — is_ambiguous Zod Gap** (implemented, Zod-validated + live-deploy validated, closed): `productSearchToolSchema` required `is_ambiguous` as a hard boolean with no default. Two paths omitted it: (1) guardrail injection pushed `{ query, requires_semantic_expansion: true }` without `is_ambiguous` — every query reaching A81 terminal recovery degraded at capsule execution with "Tuve un inconveniente interpretando tu búsqueda" instead of returning product cards; (2) five open-ended few-shot examples (examples 1, 5, 6, 7, 8) omitted the field, training the Analyst to omit it for the highest-frequency storefront query class. Three-point fix: guardrail injection now includes `is_ambiguous: true`; all five open-ended few-shot examples corrected to `is_ambiguous: true` (specific lookups in examples 12–15 unchanged); `ai-capsule-schemas.ts` hardened with `z.boolean().default(false)` as permanent defense-in-depth. Validation: 7/7 Zod contract cases PASS + 4/4 live probes PASS — "algo frutal barato" and "recomiéndame algo suave y rico" now route to `product_search_integrity` with valid args; "hola" remains greeting path with no regression. Secondary router OR-arm weakness is a separate concern outside A82 scope. No schema migration. No client changes. No new capsule. No routing behavior change — contract integrity hardening only. A81 terminal recovery is now genuinely executable end-to-end. Commit: 862ab05. Audit: A82.
- **UNKNOWN Escape Hardening — Guardrail Vocabulary Gap + Terminal Recovery** (implemented, live-deploy runtime validated, closed): Product queries using informal vocabulary, product type terms, or discovery verbs were escaping `PRODUCT_SEARCH` classification and falling through to Sommelier-only paths with no catalog grounding. Three defects closed: (1) `isProductMatch` regex expanded with real vape-store vocabulary — discovery verbs (`busco`, `buscas`, `tienen`, `tienes`, `hay`) and product type terms (`liquido`, `vape`, `pod`, `pods`, `mod`, `kit`, `kits`, `cartucho`, `cartuchos`, `desechable`, `desechables`, `dispositivo`, `vaporizador`); (2) dead guardrail branch 3 (`else if (isProductMatch && intent === 'UNKNOWN')` was unreachable) replaced by an unconditional terminal recovery: any intent still `UNKNOWN` after all guardrail conditions → `PRODUCT_SEARCH`; (3) `RESPONSE_FORMAT_RULES` in `persona.ts` corrected — Sommelier no longer claims capsule routing authority it does not possess; `routed_capsule` schema updated to always null for Sommelier paths; routing note added clarifying Sommelier is the terminal responder, not a router. Validation: 7/7 live probes PASS — "o un liquido de juicee", "tienen pods de vaporesso", "busco un desechable", "hay cartuchos de waka" all → `requires_client_capsule: true`, `capsule_name: product_search_integrity`. Preserved intents confirmed: greeting → CHIT_CHAT Sommelier, policy/shipping → KNOWLEDGE_CAPSULE, compatibility → COMPATIBILITY_CHECK Sommelier. No client changes. No schema migration. No new capsule. No new wave. No base build bump. Commit: 4b89235. Audit: A81.
- **Memory Persistence Reliability — Await Hardening + Failure Acknowledgement** (implemented, unit-validated, materially closed): `persistMemory` in the edge function was fire-and-forget — write failures were silently discarded with no acknowledgement. Refactored into `memory.ts` module with typed return contract `MemoryPersistResult {ok, merged_interests, metadata_count, error}`. Both read and write ops are `await`ed; any failure returns `{ok: false, error: message}` without throwing. Callsite in `index.ts` updated to `await persistMemory(...)` — `!memoryResult.ok` emits `console.error` with customer ID and error; user response is not blocked. Unit validation 2/2 PASS: (1) deferred-write test confirms promise does not resolve until upsert resolves; (2) failure-path test confirms `{ok: false, error}` returned instead of silent success. Runtime probe (CHIT_CHAT path): user response intact, `server_telemetry_logged: true`. Memory row absent — root cause: sentinel UUID FK violation against `auth.users` (pre-existing schema constraint, not a regression). Real-customer write confirmation is environment-blocked (requires live auth session), not code-blocked. No schema migration. No user-facing behavior change. No new wave. No base build bump. Audit: A80.
- **Sommelier Edge Telemetry Completeness — Ownership Hardening + Response_Text Persistence** (implemented, post-deploy runtime validated, closed): Edge-owned turns could claim `server_telemetry_logged: true` before telemetry was durably written, and some rows had `response_text: null` despite returning prose. Two paths hardened in `customer-intelligence/index.ts`: (1) OUT_OF_DOMAIN — insert awaited; `response_text` now set to actual rejection prose (was `null`); `server_telemetry_logged: !oodTelemetryErr` (truthful). (2) Non-capsule Sommelier — analytics moved AFTER TEXT GUARANTEE so `response_text` always reflects final guaranteed prose; insert awaited; `server_telemetry_logged = !analyticsErr` (truthful); guarded with `!requires_client_capsule` so capsule paths remain client-owned with `server_telemetry_logged = false`. Insert failure on any path: `server_telemetry_logged = false` → client fallback activates → no telemetry lost. Memory persistence fire-and-forget unchanged (out of scope). Validation: fresh OUT_OF_DOMAIN and CHIT_CHAT rows both confirmed non-null `response_text` matching actual reply prose; `server_telemetry_logged: true` truthful in both cases. No schema migration. No new wave. No base build bump. Commit: e8d3a28. Audit: A79.
- **Offer Evidence Lane — Offered Products Persistence + Operator Grading Visibility** (implemented, post-deploy runtime validated, closed): Operator could see response prose and card count for product-answer turns but not which products were offered. Root cause: `capsuleContract.resolved_products` existed at log time in `concierge.service.ts` but only `.length` was extracted. Three-scope fix: (C) `logAITelemetry` extended with `offered_products?: [{id, name, slug}]`; persisted into `ai_logic_debug` JSONB — no schema migration. (B) `OfferedProduct` type added; `PilotQueryRow.offered_products` added; `mapRow` extracts with type-guard filter. (A) `ReviewDrawer` renders compact "Productos Ofrecidos" section gated on `offered_products.length > 0`; `AdminCesarinOS` wires field through. Validation: live row `"algo de mango o menta"` → 4 products confirmed in `ai_logic_debug.offered_products`, name-match exact. Historical rows have no offered snapshot by design — section hidden. Non-product paths unaffected. No new wave. No schema migration. No base build bump. Commit: a761e65. Audit: A78.
- **Operator Visibility Lane — Tab 8 Response Preview + Response_Text Persistence** (implemented, post-deploy runtime validated, closed): Two structural gaps repaired. (1) Tab 8 / PilotTelemetry: added compact "Respuesta" preview column (55-char truncation, full text in tooltip) — `response_text` was already in `PilotQueryRow` type and SELECT but never rendered. (2) Simulator ReviewDrawer: fixed stale `.select('response')` → `.select('response_text')` in `handleReviewLastSimulatorTurn` — drawer was blank for all simulator-triggered evaluations. Root cause of both: `logAITelemetry` in `concierge.service.ts` never inserted `response_text` (all 187 historical rows null). Upstream persistence repaired: `response_text` added to INSERT payload across all 5 callsites (product_search = `customer_response_draft`, knowledge_rag = `ui_render_hint`, cart = null, generic = actual response text, error = null). Post-deploy validation: 2 live rows confirmed non-null `response_text` via anon INSERT + service-key read-back. Historical null rows display as `—` by design, no backfill. No schema migration (column pre-existed). No RLS changes. No new wave. No base build bump. Commits: b4d9b8e (UI fixes), 81ff8fa (persistence repair). Audit: A77.
- **Retrieval / Fallback Discipline Hardening** (implemented, post-deploy runtime validated, closed): Three-layer fix for four confirmed runtime failure patterns (out-of-domain routing, type-intent mismatch, low-confidence substitution). Layer 1: `OUT_OF_DOMAIN` intent + fast-path in Analyst (index.ts) — scope-rejection with no product cards; `requires_semantic_expansion` REGLA + 4 few-shot examples for specific brand/model/type queries. Layer 2: Orchestrator enforces `requires_semantic_expansion=false` by skipping semantic search entirely; `match_threshold` raised 0.4→0.55. Layer 3: BRANCH E language tightened to semantic-uncertainty posture. MICRO-FIX A applied: BRANCH B now falls through to Branch F `NO_MATCH` when `featuredProducts.length === 0` (defensive guard, existing behavior unchanged when products present). MICRO-FIX B evaluated and not needed. 6-query post-deploy validation: all PASS. No new wave. No base build bump. No downstream drafting hierarchy (A67–A75) reopened. Commits: a4ca51e, aea7944. Audit: A76.
- **BRANCH B Wording Naturalness Polish** (implemented, reconciled): BRANCH B optional specs cue refined for natural Spanish. Replaced floating `"sobre todo algunos"` with `"incluyendo algunas"` — `"algunas"` back-refers to `"opciones"` already in the sentence. Wording-only. Ambiguity discipline, fallback behavior, and branch logic unchanged. Commit: 9ac2b05. Audit: A75.
- **BRANCH D OOS Alternative Hierarchy Alignment** (implemented, reconciled): BRANCH D OUT_OF_STOCK_ALTERNATIVE now uses disciplined 4-tier justification (both specs → alternative specs → ai_sales_note → generic). `ai_sales_note` of top alternative used as fallback when specs unavailable. Note formatting preserved. Tier 3 wording refined for natural Spanish (em-dash, 'disponible'). No orchestrator/RPC/schema changes. Deployable within scope. Commit: a0d2389. Audit: A74.
- **BRANCH F No-Match Recovery-Guidance Refinement** (implemented, reconciled): BRANCH F no-match response remains safe and honest. Recovery guidance now actionable: brand, flavor, device type, or specific model keywords suggested for reformulation. No candidate product invented, no availability implied. Wording-only change. Deployable within scope. Commit: 278eedb. Audit: A73.
- **BRANCH E Semantic Hierarchy Alignment** (implemented, reconciled): BRANCH E semantic drafting now uses disciplined 4-tier hierarchy (specs → ai_sales_note → description → generic). `ai_sales_note` used when specs unavailable, note formatting preserved (no forced lowercasing), description tier tone softened to match semantic uncertainty. No orchestrator/RPC/schema changes. Semantic lane refinement only. Deployable within scope. Commit: 29433be. Audit: A72.
- **Exact-Path Improvement: Context Lift + Fallback Naturalness** (implemented, approved for reconciliation): BRANCH C exact path now carries full product context (description + specs fields). Schema extended, exact query select enhanced, BRANCH C fallback logic tiered (ai_sales_note → specs → generic). Phrasing refined with Viene verb for natural Spanish ("...Viene con sabor menta..."). Includes small downstream public-contract alignment (description propagated to public attachment schema via mapper). Real needed fix relative to committed HEAD (workspace drift resolved). No semantic lane reopening. Deployable within scope. Commits: 2b8be13, 33aa6b0. Audit: A71.
- **Pilot Miss Taxonomy Panel Semantic Stabilization** (implemented, Codex-validated, closed): `MissTaxonomyPanel` categorizes query outcomes into six operational buckets (`product_search_miss`, `semantic_match_miss`, `fallback_miss`, `policy_miss`, `guardrail_miss`, `otro`) with strict first-match-wins precedence. Four Codex blockers resolved: (1) **Precedence**: arbitrary category evaluation order replaced by deterministic precedence — `zero_product_cards` → `fallback_used` → `semantic_match_success` → `policy_query` → `guardrail_rescue` → `otro`, computed once per row with `categorized` tracking flag, no overlap possible; (2) **Fallback narrowing**: `fallback_miss` now semantically accurate — only rows where `fallback_used=true && semantic_match_success=false` (fallback became necessary because semantic failed); (3) **Out-of-domain cardinality**: out-of-domain queries (scope rejections, guardrail decisions) now excluded from all operational miss categories via `!row.out_of_domain` guard on both `guardrail_rescue` and `otro`; (4) **Otro purity**: final catch-all narrowed to `!categorized && semantic_match_success===false && !out_of_domain` — only unmatched semantic queries that are in-domain. Separate data flows: `fullQueryLog` (unfiltered, used for taxonomy) vs `queryLog` (user-scoped, used for table displays). No schema migration. Operator-facing taxonomy now semantically truthful: categories correspond to actual operational outcomes, not interpretation artifacts. Three-pass implementation: Pass 1 (8bf96f4) established 6-category model with strict precedence; Pass 2 (fd8382e) addressed fallback narrowing and out-of-domain separation; Pass 3 (9844516) hardened residual bucket purity. Commits: 8bf96f4, fd8382e, 9844516. Audit: A87.
- **Cesarin OS TabLearning — Rule/Improvement Closure Semantics Clarity** (implemented, Codex-validated, closed): `TabLearning` friction-signal evaluation flow enhanced for operator clarity on signal-to-action outcomes. Four possible outcomes now explicitly distinguished: (1) **Pending review** — new "Pendiente revisión" indicator for unacted signals; (2) **Converted to rule** — status label "Directriz creada" + contextual sublabel "Instrucción activa" clarifies that an active guideline was created; (3) **Converted to improvement** — button copy changed "Abrir en mejoras" → "Crear mejora", status shows "Mejora creada" + "En cola de mejoras", making the action direct and unambiguous; (4) **Reviewed without action** — status label changed "Descartada" → "Revisada sin acción", sublabel "Evaluada, cerrada" provides positive framing and decisiveness. Additional clarity improvements: (a) ref_label now marked "ID: {value}" so the identifier reference is explicit; (b) button titles refined for actionable intent ("Convertir en directriz activa que guíe respuestas futuras", "Crear mejora en la cola de tareas", "Marcar como revisada sin cambios requeridos"); (c) header instruction clarified to enumerate the four outcomes. No behavioral changes. No telemetry impact. A87 (Miss Taxonomy) untouched. Scope bounded to TabLearning presentation layer. Build: v113-3f2caf7. Commit: 3f2caf7. Audit: A88.
- **B1: Cesarin OS Intake & Review Consolidation** (implemented, Codex-accepted, closed): Cross-surface truth gap closed between `cesarin_signal_states` (TabLearning) and `ai_evaluations` (ReviewDrawer). Four changes: (1) `admin-eval.service.ts` — `getEvaluationsByIds(ids)` batch fetch added (mirrors `getSignalStatesByIds` pattern); (2) `ReviewDrawer.tsx` — signal state cross-reference panel added: on open, loads `cesarin_signal_states` entry for the interaction in parallel with evaluation fetch; `SignalStatePanel` strip renders status chip, ref_label, and handled date between Route/Capsule context and Scoring sections; (3) `PilotTelemetry.tsx` — `evalMap` batch-fetched when `queryLog` changes; `QueryRow` receives `evalMap` + `signalStates` prop (from existing page-level hook, no redundant DB fetch); "Revision" column shows `★N` score badge (color-coded ≥4/3/<3) and signal state badge (`→R`/`→M`/`✓`/`✕`/👁) before the review button; (4) `TabPilot.tsx` — pre-existing breakage fixed: `PilotParityDiagnostics` import missing, 3 unused lucide imports and `useMutation` removed. Build: v113-cc8c0f9, 0 typecheck errors, 0 ESLint errors. Formal cold audit generated (`B1_CROSS_SURFACE_AUDIT.md`). Codex review cycle: initial review → narrow corrective (1116428) → micro-corrective (f11861b) → nano-corrective (cc8c0f9) → final Codex ACCEPT (2026-03-23). Closure entry added to AUDIT_LOG.md. Status: **CLOSED**.
- **B2 Pass 1: Operator Simulation Workspace — Reusable Private Case Draft Minimum Loop** (implemented, Codex-accepted with residual risk, pass 1 closed): Minimum reusable private case draft loop operational within Cesarin OS. Scope bounded to simulator, QA, and training case surfaces — search/retrieval, semantic quality, and broad OS redesign out of scope. Delivered: (1) `operator_case_drafts` table migration with full RLS, source_type/readiness_status check constraints, 3 indexes, updated_at trigger; (2) `PrivateCaseDraft` type + `CaseDraftSourceType`/`CaseDraftReadinessStatus` + `SimulationResult.user_input` field added to `cesarin.ts`; (3) `admin-case-drafts.service.ts` — create/get/update/delete + `deriveCaseDraftReadiness` utility; (4) `ReviewDrawer.tsx` — "Guardar como Caso de Prueba" footer button + `handleSaveAsCaseDraft()` handler; (5) `TabQuality.tsx` — `BookmarkPlus` save-draft button on non-PASS results, judge path corrected to use `result.user_input ?? scenario_id`, details drawer corrected from hardcoded placeholder to real input, `evaluation_score` mapped from `result.score` (0–1) to 1–5 integer; (6) `TabCaseDrafts.tsx` — minimal queue with readiness badges, source badges, hover-delete, refresh; (7) AdminCesarinOS `casos` tab wired (lab group). `savePilotFeedback` converted from unreviewed DB write to explicit not-implemented throw (no `pilot_feedback` migration in repo). `simulate_cesarin.ts` stores `user_input` on all new simulation results. Corrective micro-pass (231c57b) closed Codex rejection of initial pass (6e34d7c). Residual risk: historical `ai_simulation_reports` rows pre-pass have no `user_input`; fallback to `scenario_id` is truthful. B2 pass 1 is not full B2 completion. Commits: 6e34d7c (pass 1), 231c57b (corrective). Build: v113-f0e64e7, 0 typecheck errors. Codex: **ACCEPT WITH RESIDUAL RISK**.
- **B2 Pass 2: Operator Simulation Workspace — Private Case Draft Maturation Loop** (implemented, Codex-accepted, pass 2 closed): `TabCaseDrafts` upgraded from passive read-only queue to real operator-facing draft maturation surface. One file changed (`TabCaseDrafts.tsx`); service and types unchanged (hash-verified). Delivered: (1) row click opens slide-in maturation drawer; (2) captured source data shown read-only (input, observed response, detected intent, route/capsule, evaluation score); (3) editable fields: `expected_outcome`, `failure_reason`, `evaluation_summary`; (4) `readiness_status` live-computed via `deriveCaseDraftReadiness` from form state — active signal, not static label; (5) save via existing `updateCaseDraft` + optimistic local state update; (6) `hasUnsavedChanges` detection with "Sin guardar" badge and save-button guard; (7) delete closes drawer when open draft is deleted; (8) header shows "X listos" count. Codex audit confirmed scope discipline, form sync correctness, change detection, and optimistic update coherence. Non-blocking risk: backdrop-click dismisses without confirmation — consistent with codebase drawer patterns. No simulator integration, no scenario generation, no new entities. B2 as macro wave remains open. Commit: 98bdf80, 0 typecheck errors, Vite build clean. Codex: **ACCEPT**.
- **Cognitive Integrity Pack — Analyst Contract, Routing Truth, Parse Hardening & Telemetry Closure** (implemented, Codex-validated, closed): Four root cognitive contradictions resolved in `customer-intelligence/index.ts` and `concierge.service.ts`. (1) **Analyst contract truth**: `COMPATIBILITY_CHECK` added to the Analyst intent enum (line 297) — contract now matches training rules and guardrail logic. (2) **Routing truth**: `COMPATIBILITY_CHECK` is truthfully fallback-handled by Sommelier (no dedicated client capsule exists); fake pre-routing to a non-existent `compatibility_check` capsule was removed. Pre-routed intents are `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `CART_OPERATION`, and `OUT_OF_DOMAIN` only. (3) **Parse hardening**: Analyst parsing replaced with layered contract validation — direct JSON.parse first, regex fallback only for leading/trailing text, intent validated against `VALID_INTENTS`, `tool_calls` validated as array, `analystParseValid` flag gates safe degradation. Degradation condition fixed from `geminiError && !rawAnalystText` to `geminiError || !analystParseValid` — malformed nonempty output now explicitly degrades. Sommelier parse hardened with empty-text guards. (4) **Telemetry truth end-to-end**: `routing_path` field (`'pre_routed'` | `'fallback_handled'`) added to all debug payloads (edge-side) and to `logAITelemetry` signature + `ai_logic_debug` persistence (client-side). All three capsule call sites (`product_search_integrity`, `knowledge_rag_foundation`, `cart_operator`) now extract and persist `routing_path: 'pre_routed'` from edge debug payload. Two Codex rejection passes required before ACCEPT: first rejected for hollow compatibility route + missing client-side routing_path + weak Analyst degradation; second (micro-lane) rejected for client-owned capsule telemetry missing routing_path. All findings resolved. No schema migrations. No UI changes. Operator Surface Consolidation Pack (macro wave B) remains deferred as next candidate. Build: 0 typecheck errors. Codex acceptance: ACCEPT. Audit: A90.
- **Cesarin OS Production Hardening Pack — Closure & Acceptance** (implemented, Codex-validated, closed): Three-part production hardening pack now accepted and closed. (1) **Gap 1: Server-Trusted Auth Enforcement (CLOSED)** — `customer-intelligence/index.ts` lines 175-228 replace decode-only JWT validation with server-side Supabase Auth verification via `supabase.auth.getUser(bearerToken)`. Unauthorized requests return 403 Forbidden BEFORE any protected AI work (Gemini, tools, Judge). Trust source is server-verified Supabase Auth, not client-controlled body parameters. (2) **Gap 2: Gemini Resilience / Fallback (ACCEPTABLE, PRESERVED)** — Analyst (20s timeout, 429/5xx handling, fallback to PRODUCT_SEARCH) and Sommelier (25s timeout, 429/5xx handling, on-brand fallback text) timeout and error-handling logic remains intact and acceptable. Text guarantee maintained. JSON contract shape preserved. (3) **Gap 3: Async QA Judge Persistence (CLOSED)** — `cesarin-qa-judge/index.ts` implements `evaluate_turn` action with truthful persistence to `ai_evaluations` table using real schema from `20260319_human_evaluation_loop.sql`. Gemini output maps conservatively: `score` (1-5 normalized from relevance 1-10), `primary_tag` ('turn_quality_evaluation'), `secondary_tags` (issues array), `severity` (critical/high/medium/low computed from hallucination + relevance), `expected_outcome` (Gemini recommendation), `comment` (composite audit trail), `evaluator_id` (NULL for Gemini eval). No invented columns. Trigger conditions: `frustrationDetected OR (intent=PRODUCT_SEARCH AND productCardCount=0)`. Fire-and-forget IIFE, 5s best-effort timeout, silent failure. **A87 Semantics Restored:** PilotTelemetry.tsx reverted to commit ef012fb (A87 original state) — all six categories restored (`ruta_error`, `producto_sin_cards`, `unknown_rescatado`, `fallback_sin_capsula`, `dominio_rag`, `otro`), first-match-wins precedence preserved, frustration as independent secondary signal, out-of-domain exclusion logic restored. Admin telemetry properties (`gemini_api_error`, `tool_error_count`, `sommelier_fallback_reason`, `out_of_domain`) restored to `admin-pilot-ops.service.ts` for A87 taxonomy support. No unrelated spillover remains. **Build Status:** Exit code 0, 24.49s, no typecheck errors. **Final Accepted Corrective Pass:** 35208ad. Codex acceptance: ACCEPT. Audit: A89.
- **Cesarin Hyperlocal Personality Engine** (implemented): Ajuste de ingeniería de prompts base (`persona.ts`) para inyectar "colmillo" comercial. Césarín adapta su dialecto conversacional detectando la región del cliente (ej. norte="compare", costa="brody", chilango="paps") de manera fluida y sutil, para volverse una entidad empática que vende, entretiene y nunca suena como un robot corporativo.

- **GraQle Cloud Offloading (Heavy Computation CI/CD)** (implemented): Carga pesada de cálculo de embeddings y parsing del AST del Knowledge Graph mudada de la CPU local del operador hacia runners remotos (GitHub Actions). El pipeline (`.github/workflows/graqle-sync.yml`) instala el core de GraQle (Python) y corre `graq grow` (incremental update) inyectando de forma asilada `GEMINI_API_KEY` como secret. Eliminamos el bloqueo local por falta de recursos / asfixia de máquina local, manteniendo el frontend enteramente SPA y reintroduciendo asimetría DevOps segura.

- **Admin Orders Panel CRUD (DONE — Wave 193+)**: Gestión administrativa completa de pedidos implementada y validada. Arquitectura: `lib/domain/orders.ts` (reglas de transición de estado `canTransitionTo`, `ADMIN_ORDER_STATUSES_LIST`, `ORDER_STATUS_TRANSITIONS`) → `services/admin/admin-orders.service.ts` (getAllOrders con JOIN a customer_profiles + addresses, updateOrderStatus, updateOrderPaymentStatus, updateOrderTracking, exportOrdersToCSV) → `hooks/admin/useAdminOrders.ts` (TanStack Query + búsqueda local + filtro de fecha + paginación + bulk update + invalidación cruzada de stats/recent-orders) → Componentes: `OrderListCard.tsx` (tarjeta expandible con selector de status + input de guía), `OrdersKanbanBoard.tsx` + `OrderBoardCard.tsx` (vista tablero por columna de status), `OrderDetailDrawer.tsx` (SideDrawer off-canvas con productos, tracking editable, WhatsApp 1-click, selector de status validado), `OrdersHeader.tsx` + `OrdersFilter.tsx` (filtros y búsqueda) → `pages/admin/AdminOrders.tsx` (thin component, paginación PAGE_SIZE=10, bulk action bar flotante) → Ruta: `/admin/orders`, con entrada "Pedidos" en el nav sidebar de AdminLayout (badge de pending orders). Dominio de estados: pending→confirmed→processing→shipped→delivered (terminales) + cancelled (terminal desde cualquier estado pre-shipped). Automación: mover a processing/shipped/delivered actualiza payment_status a 'paid'.
- **Wave 192 (DONE)**: Knowledge Ops Manager. Formal administrative tooling inside Cesarin OS (`TabKnowledge` & `TabConcepts`) for safe vector syncs and directional graph edits. Base Build v112.
- **Wave 191 (DONE)**: Canonical Closure of Compatibility & Concepts Layer. Validation suite 13/13 PASS. Deployment drift resolved (V121 uses correct `gemini-2.5-flash` model).
- **Wave 190 (DONE)**: Cesarin Human Evaluation Loop — Implementation of supervised review entity, simulation isolation, and v1 API protocol alignment.
- **Wave 189 (DONE)**: Analyst Refinement Loop — Improved first-pass intent classification.
- **Wave 188 (DONE)**: Knowledge Enrichment Loop —
## 1. Project Vision & Identity
**VSM Store (Vape Shop & More)**
Una PWA SPA de e-commerce para una tienda de vapeo y productos 420 base en Acapulco, Guerrero (México), operando ventas a nivel nacional. La aplicación sirve como vitrina rápida, manejador de carrito persistente y panel administrativo impulsado por IA. Césarín, el "Conserje" IA (Sommelier/Analyst), ofrece atención a clientes nativa en la UI usando streaming JSON y adaptación regional mexicana para maximizar el engagement comercial.
- **Storefront AI Pilot (DONE)**: Slices 1A–2D closed. Phase 3.2C (Semantic Activation) closed.
- **Status:** **FULLY OPERATIONAL — Cleared for Unrestricted Pilot (Base Build v112)**

Una PWA SPA de e-commerce para una tienda de vapeo y productos 420 en Acapulco, México. Dos verticales: **Vape** (azul) y **420/Herbal** (verde). Dark-only. Experiencia inmersiva con **Tactical UI** y **AI Concierge**. Deploy en **Cloudflare Pages**.

### Setup en 2 minutos

```bash
git clone <repo>
cd vsm-store
npm install
cp .env.example .env    # Agregar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev              # http://localhost:5173
```

### Verificación de salud

```bash
npm run typecheck        # Estándar: 0 errores (Estado actual: 0 errores verified post-Wave 189 remediation)
npm run lint             # 0 errores ESLint
npm run test:run         # 12 tests passing
npm run build            # Build exitoso
```

### Deploy

Cloudflare Pages conectado a rama `main`. Push to main = deploy automático.

- **URL producción:** Cloudflare Pages (dominio configurado en dashboard)
- **Headers de seguridad:** `public/_headers` (CSP, HSTS, X-Frame-Options)
- **Fallback SPA:** Cloudflare Pages maneja SPA routing automáticamente

---

## 1. REGLAS — LEY ABSOLUTA

> **TODAS estas reglas son obligatorias. No hay excepciones salvo las documentadas explícitamente.** Un AI o desarrollador que viole estas reglas está introduciendo deuda técnica no autorizada.

### 1.1 Arquitectura: Flujo unidireccional estricto

```text
Database (Supabase) → Services (Normalizing Layer) → Hooks → Components/Pages
```

**NUNCA al revés.** **PRINCIPIO DE RESILIENCIA (Wave 80 & 168):** Cada componente debe ser capaz de fallar de forma aislada sin detener la venta. El Service Layer DEBE normalizar datos externos (ej: `specs: data.specs || {}`) para evitar crashes de componente por datos corruptos o nulos.

**NUNCA al revés.** Un componente no sabe que existe Supabase. Un hook no sabe que existe PostgreSQL.

| Capa | Puede importar de | NO puede importar de |
| :--- | :--- | :--- |
| `services/*.service.ts` | `lib/supabase`, `types/` | Hooks, Components, Pages |
| `hooks/use*.ts` | Services, `lib/`, `types/`, `stores/` | Components, Pages |
| `components/**/*.tsx` | Hooks, `lib/utils`, `types/`, `stores/` | Services, `lib/supabase` |
| `pages/**/*.tsx` | Hooks, Components, `lib/`, `types/`, `stores/` | Services, `lib/supabase` |

> [!IMPORTANT]
> **Admin Standard (Wave 90)**: La excepción histórica que permitía a las páginas admin importar servicios directamente ha sido **DEPRECADA**. Toda lógica de negocio administrativa debe residir en `hooks/admin/` para mantener componentes ligeros (Thin Components).

### 1.2 TypeScript: Cero tolerancia

- **`strict: true`** + **`noUncheckedIndexedAccess: true`** activados.
- **Sin `any`.** Si necesitas un tipo genérico, usa `unknown` + type guards.
- **Sin `as X` casts** salvo en responses de Supabase (problema sistémico conocido, ver §10.2).
- **Sin `// @ts-ignore`** ni `// @ts-expect-error` sin justificación en comentario.
- [Cesarin OS: Neural Sales Engine (Wave 159)](#cesarin-os-neural-sales-engine-wave-159)
- [Seguridad y Rendimiento](#seguridad-y-rendimiento)

### 1.3 Modularidad: Componentes independientes

- **Cada feature es autocontenida.** Borrar un módulo no debe romper otro.
- **Sin imports circulares.** Flujo unidireccional siempre.
- **Sin lógica de negocio en componentes.** Cálculos van en `lib/domain/`.
- **Sin datos mock en producción.** Si un componente necesita datos, los obtiene de la DB o muestra un empty state honesto.
- **Sin dependencias entre features.** `FlashDeals` no debe importar de `SocialProof`. Cada sección de Home es un "lego" independiente.

### 1.4 Estilos: Sistema temático

- **Sin `bg-white` ni colores hardcodeados.** Usar sistema temático (`bg-theme-*`, `glass-premium`, `text-theme-*`).
- **Sin CSS-in-JS.** Solo Tailwind + CSS Variables en `index.css`.
- **Sin archivos `.css` por componente.** Estilos globales en `index.css` layers.
- **Sin clases dinámicas de Tailwind** (`bg-${color}-500`). Usar condicionales estáticos con `cn()`.

### 1.5 Testing: Obligatorio para nueva lógica

- **Todo archivo nuevo en `lib/domain/` DEBE tener tests.** Sin excepción.
- **Todo nuevo hook con lógica compleja DEBE tener tests.**
- **Todo nuevo schema Zod DEBE tener tests.**
- **Tests van en `__tests__/` junto al módulo que testean.**
- **Formato:** `[nombre].test.ts(x)`. Framework: Vitest + Testing Library.
- **Estado actual:** 12 tests en 12 archivos. Cobertura parcial. Ver §8.

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
- **Sin `console.log` en producción.** Terser los elimina, pero no confiar en eso para datos sensibles.
- **Sin `dangerouslySetInnerHTML`.** Nunca.
- **Rate limiting en auth.** Login tiene exponential backoff.

### 1.9 Nuevos archivos: Checklist

Antes de crear un archivo nuevo, verificar:

| Check | Pregunta |
| :--- | :--- |
| [ ] | ¿Respeta el flujo unidireccional (§1.1)? |
| [ ] | ¿Usa tipos de `src/types/` en vez de definir inline? |
| [ ] | ¿Importa `Section` de `@/types/constants`? |
| [ ] | ¿Usa `useNotification` en vez de `react-hot-toast` directo? |
| [ ] | ¿Usa `cn()` para clases condicionales? |
| [ ] | ¿Usa `optimizeImage()` para imágenes de productos? |
| [ ] | ¿Usa clases temáticas (`bg-theme-*`, `text-theme-*`)? |
| [ ] | ¿Si tiene lógica → la lógica va en `lib/domain/`? |
| [ ] | ¿Si tiene lógica en `lib/domain/` → tiene tests? |
| [ ] | ¿Sin `any`, sin `as X` innecesarios? |
| [ ] | ¿Named export (no default)? |
| [ ] | **¿Actualicé AI_CONTEXT.md para reflejar este cambio? (§1.10)** |

| Si tocaste... | Actualizar en AI_CONTEXT.md |
| :--- | :--- |
| Nuevo archivo `.ts`/`.tsx` | §3 Estructura de carpetas (agregar archivo, actualizar conteos) |
| Nuevo archivo de test | §8 Testing (agregar a tabla §8.1, quitar de §8.3 si aplica) |
| Nueva ruta | §9 Routing (agregar a tabla correspondiente) |
| Nueva dependencia `npm install` | §2 Stack (agregar con versión) |
| Nuevo tipo en `src/types/` | §3 Estructura (actualizar conteo de types/) |
| Archivo eliminado | Quitar de §3 + actualizar conteos |
| Feature nueva completada | §5 Features (mover de ⚠ a ✅ o agregar nueva) |
| Issue resuelto de §10 | §10 Issues (quitar de la lista) + AUDIT_LOG.md (agregar entrada) |
| Migración SQL nueva | §11.1 (agregar fila con número y descripción) |
| Cambio en build/deploy | §12 Build & Deploy |
| Cambio de regla o patrón | §1 Reglas o §14 Convenciones |
| Decisión arquitectónica relevante | §15 Decisiones Históricas (agregar con fecha)

- **Cualquier IA** que modifique código tiene la obligación de actualizar el documento antes de terminar la sesión.
- **Cualquier desarrollador** que haga commit debe verificar que el documento refleja sus cambios.
- Si el documento no se actualiza, los datos se vuelven incorrectos y se pierde la confianza en la fuente de verdad.

---

## 2. STACK EXACTO

| Capa | Tecnología | Versión | Rol |
| :--- | :--- | :--- | :--- |
| Runtime | React | 18.3.1 | SPA, JSX |
| Bundler | Vite | 6.0.5 | Dev server, build, HMR |
| Lenguaje | TypeScript | 5.6.2 | Strict mode + noUncheckedIndexedAccess |
| BaaS | Supabase | 2.39.0 | PostgreSQL, Auth, Storage, Realtime, Edge Functions, RLS |
| Server-state | TanStack Query | 5.17.0 | Cache, fetching, mutations, staleTime |
| Client-state | Zustand | 5.0.11 | Carrito (localStorage), wishlist (localStorage + DB sync), notificaciones |
| Routing | React Router | 6.22.0 | SPA routing, lazy loading |
| Styling | Tailwind CSS | 3.4.17 | Utility-first + CSS Variables (dark-only) |
| Forms | React Hook Form + Zod 4 | 7.71.2 / 4.3.6 | Validación con schemas tipados |
| Animation | Framer Motion | 12.0.0 | Transiciones, AnimatePresence (migración masiva en Wave 127) |
| Icons | Lucide React | 0.574.0 | Iconografía SVG |
| SEO | react-helmet-async | 2.0.5 | Meta tags dinámicos |
| Toast | react-hot-toast | 2.4.1 | Notificaciones transitorias |
| DnD | @dnd-kit | core 6.3.1, sortable 10.0.0 | Reordenamiento admin |
| Images | react-dropzone | 15.0.0 | Upload de imágenes admin |
| Payments | MercadoPago | Via Edge Function | `create-payment` + `mercadopago-webhook` (deploy canon: GitHub Actions pipeline, explicit webhook deploy step; webhook requires `verify_jwt = false`) |
| Monitoring | Sentry | 10.39.0 | Error tracking (lazy-loaded, solo si DSN configurado) |
| Analytics | Google Analytics 4 | `lib/analytics.ts` | Placeholder `G-XXXXXXXXXX` — no activo |
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
├── public/                          # Assets estáticos
│   ├── sw.js                        # Service Worker PWA
│   ├── manifest.json                # PWA manifest
│   ├── offline.html                 # Fallback offline
│   ├── _headers                     # Cloudflare Pages headers (CSP, HSTS)
│   ├── robots.txt / sitemap.xml     # SEO
│   ├── logo-vsm.png                 # Logo tienda
│   ├── .well-known/                 # Dominio verification
│   └── icons/                       # PWA icons
│
├── scripts/                         # 8 scripts de utilidad + admin/ (3)
│   ├── generate-sitemap.js          # [Phase 1] Sitemap generator
│   ├── migrate-woocommerce.cjs      # [Phase 1] Woo CSV → SQL
│   ├── simulate_cesarin.ts          # [Phase 3.4A] Simulator CLI
│   ├── check-integrity.mjs          # [Phase 2] Integrity auditor
│   ├── fix_css_phase2.mjs           # [Phase 2] CSS cleanup
│   ├── fix_css_phase3.mjs           # [Phase 3.1] CSS cleanup
│   ├── fix_css_violations.mjs       # [Phase 3.1] CSS violations
│   ├── fix_encoding.mjs             # [Phase 3.4A] Encoding fix
│   └── admin/                       # [Phase 2] Cleanup Scripts (3 archivos)
│       ├── tag-discovery.ts
│       ├── tag-migration.ts
│       └── verify-phase-2b.ts
│
├── supabase/
│   ├── migrations/                  # 55 migraciones SQL (001 → 20260323_operator_case_drafts)
│   └── functions/                   # 14 Edge Functions (Specialized Gemini Stack: Flash 2.5/Pro/Lite)
│       ├── inventory-oracle/        # IA: Predicciones de stock (Gemini 2.5 Flash-Lite)
│       ├── dashboard-intelligence/  # IA: Insights de negocio para admin (Gemini 2.5 Flash-Lite)
│       ├── customer-intelligence/   # IA: Multi-acción NLP (Analyst: 2.5 Flash, Worker: 2.5 Flash-Lite)
│       ├── voice-intelligence/      # IA: NLP → queries de búsqueda (Gemini 2.5 Flash-Lite)
│       ├── product-intelligence/    # IA: Generación de copy/descriptions (Gemini 2.5 Flash-Lite)
│       ├── loyalty-intelligence/    # IA: Análisis de patrones de lealtad (Gemini 2.5 Flash-Lite)
│       ├── customer-narrative/      # IA: Narrativas contextuales de clientes (Gemini 2.5 Flash-Lite)
│       ├── bundle-intelligence/     # IA: Sugerencias de bundles (Gemini 2.5 Flash-Lite)
│       ├── cesarin-qa-judge/        # IA: Auditoría semántica de calidad (Gemini 2.5 Pro)
│       ├── knowledge-ingestor/      # IA: RAG Ingestor (Document chunking & embedding)
│       ├── create-payment/          # MercadoPago preference (deploy canon via GH Actions workflow)
│       ├── mercadopago-webhook/     # Webhook de pago (verify_jwt=false obligatorio; deploy explícito en GH Actions)
│       ├── track-shipment/          # DHL tracking
│       └── embeddings-processor/    # IA: Specialized gemini-embedding-001 (3072d) for multi-modal search
│
├── constants/
│   └── specs.constants.ts           # [NEW] Guided specs and normalization maps
│
├── src/
│   ├── main.tsx                     # Entrypoint: providers stack
│   ├── App.tsx                      # Router + layout switching
│   ├── index.css                    # Design system CSS (323 líneas)
│   ├── vite-env.d.ts                # Vite types
│   │
│   ├── types/                       # Tipos de dominio (11 archivos)
│   │   ├── product.ts               # Product, Section, ProductStatus
│   │   ├── category.ts              # Category, CategoryWithChildren
│   │   ├── cart.ts                  # CartItem (con variant_id/name), Order
│   │   ├── order.ts                 # OrderItem (con variant_id/name), OrderRecord
│   │   ├── customer.ts              # CustomerProfile, CustomerTier
│   │   ├── testimonial.ts           # Testimonial
│   │   ├── variant.ts               # ProductAttribute, ProductVariant
│   │   ├── ai-capsule.ts            # AI State & Session persistence
│   │   ├── cesarin.ts               # Simulation types for E2E validation
│   │   ├── constants.ts             # Domain constants
│   │   └── collection.ts            # Dynamic filters and groupings
│   ├── lib/                         # Utilidades puras (sin side effects de UI)
│   │   ├── supabase.ts              # Cliente Supabase singleton
│   │   ├── react-query.ts           # QueryClient + error handling global
│   │   ├── utils.ts                 # cn(), formatPrice(), slugify(), optimizeImage()
│   │   ├── analytics.ts             # GA4 (placeholder, no activo)
│   │   ├── monitoring.ts            # Sentry init (lazy-loaded via dynamic import)
│   │   ├── accessibility.ts         # A11y utilities
│   │   ├── image-optimizer.ts       # Image optimization helpers
│   │   ├── z-index.ts               # Z scale: CONTENT(30)→SKIP(110)
│   │   ├── product-sorting.ts       # SortKey, SORT_OPTIONS, sortProducts (shared)
│   │   └── domain/                  # Lógica de negocio pura (DEBE tener tests)
│   │       ├── loyalty.ts           # Puntos, tiers, conversiones
│   │       ├── orders.ts            # Estados, transiciones, canTransitionTo
│   │       ├── pricing.ts           # calculateDiscount, calculateOrderTotal
│   │       ├── wheel.ts             # selectPrizeByProbability, calculateTargetRotation, formatPrizeValue [Wave 26]
│   │       ├── __tests__/           # 3 test files
│   │       └── validations/         # Schemas Zod (DEBEN tener tests)
│   │           ├── address.schema.ts
│   │           ├── checkout.schema.ts
│   │           ├── profile.schema.ts
│   │           └── __tests__/       # 3 test files
│   │
│   ├── stores/                      # Zustand (client-state only) — 5 stores
│   │   ├── cart.store.ts            # Carrito: add/remove/validate
│   │   ├── wishlist.store.ts        # Wishlist: sync a customer_wishlists
│   │   ├── notifications.store.ts   # Notificaciones in-app
│   │   ├── search-overlay.store.ts  # MobileSearchOverlay visibility
│   │   ├── confirm.store.ts         # Custom premium modal confirmations
│   │   └── __tests__/              # 2 test files
│   │
├── services/                    # Capa de datos (44 services: 25 storefront + 19 admin)
│   ├── products.service.ts      # Storefront: CRUD + Smart Upselling
│   ├── orders.service.ts        # Storefront: Checkout & tracking
│   ├── concierge.service.ts     # AI Chat (Consolidado)
│   ├── auth.service.ts          # Auth: Login/Profile/Reset
│   ├── loyalty.service.ts       # Loyalty: Points & Tiers
│   ├── ...                      # 20 additional storefront services (5 above + 20 = 25 storefront total)
│   ├── admin/                   # 19 archivos (18 services + barrel)
│   │   ├── admin-pilot-ops.service.ts
│   │   ├── admin-auth.service.ts
│   │   ├── admin-products.service.ts
│   │   ├── admin-orders.service.ts
│   │   ├── admin-customers.service.ts
│   │   ├── admin-dashboard.service.ts
│   │   ├── admin-case-drafts.service.ts  # [B2 P1] operator_case_drafts CRUD + deriveCaseDraftReadiness
│   │   └── ... (11 adicionales)
│   └── payments/
│       └── mercadopago.service.ts
```

### 17.2 Stabilized Debug Contract
El objeto `debug` retornado por la Edge Function DEBE contener:
- `detected_intent`: Un string canónico (ej. `POLICY_INQUIRY`).
- `tools_executed`: Array de strings con los nombres de las herramientas resueltas.
- `knowledge_chunks_count`: Entero indicando cuántos fragmentos RAG se usaron.
- `latency_ms`: Medición interna de la función.

### 17.3 2026 Quota Mitigation
El entorno actual (Marzo 2026) tiene límites estrictos de RPM en Free Tier.
- **Mitigación**: El simulador (`simulate_cesarin.ts`) incluye un retraso forzado de **15 segundos** entre escenarios para evitar el error **429 (Too Many Requests)**.

### 17.4 Hybrid Judge / Scoring Layer (Wave 181)

La Fase 3.4C queda formalmente cerrada y validada como parte del baseline operativo real del sistema.

#### Alcance validado
- **Scoring determinístico** implementado en el simulador con perfiles sensibles por tipo de escenario.
- **Persistencia de reportes** activa en la tabla `ai_simulation_reports`.
- **Interfaz Admin QA** integrada dentro de `Cesarin OS` mediante `TabQuality.tsx`.
- **Juez semántico independiente** implementado en la Edge Function `cesarin-qa-judge`, fuera de `customer-intelligence`.
- **Persistencia de veredictos del juez** formalizada dentro de `ai_simulation_reports.results` a nivel de escenario individual.

#### Reglas canónicas de la capa QA
- La evaluación **determinística** es la capa primaria.
- El **Judge LLM** es una capa secundaria, opcional y separada.

---

## 18. CESARÍN CAPABILITY CAPSULE PHILOSOPHY

To protect against monolithic sprawl, all Cesarín AI behaviors must follow the **Capability Capsule** architecture. 
A **Capability Capsule** is a bounded AI behavior unit with a single commercial/assistant responsibility, explicit signals, local degraded behavior, and a dedicated QA surface.

### Core Architecture Principles
1. **Bounded Responsibility:** A capability owns its specific slice of intelligence and logic.
2. **Failure Isolation:** Missing or failing capabilities must fail locally and gracefully. They must never collapse unrelated conversational flows.
3. **Explicit Signaling:** Capsules communicate via compact machine-readable signals (e.g., `[FEATURED_FALLBACK]`). Do not bloat global contexts.
4. **Targeted QA Surface:** Each capsule must have an identifiable test surface in the deterministic simulator.
5. **Incremental Adoption:** Do not execute giant rewrites. Adopt the capsule structure incrementally across the ecosystem.
6. **Brain-First Orchestration (v106 canon):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. `UNKNOWN` is a last resort — any commercially-interpretable query MUST be rescued by the guardrail before returning `UNKNOWN`. Capsules receive the routed intent; they do not change it.

### Recommended First Capsule Pattern
**Product Search Integrity Capsule**
This is the designated foundational template for the new architecture due to:
- Highest storefront frequency
- Strongest commercial trust impact
- Low architecture disruption
- High reuse value

**Current Status (Canonization Handoff Completed - Wave 185):**
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized
- ✅ Runtime Execution Bridge / Orchestration
- ✅ AI/LLM Function Tool Routing
- ✅ E2E Validation & UI State Review

*Status: The Product Search Integrity Capsule is now fully operational and validated E2E. It stands as the official architectural blueprint and baseline pattern for all future Capability Capsules.*

### Second Capsule Pattern Materialized
**Knowledge & RAG Foundation Capsule**
This is the designated foundational template for knowledge retrieval, core FAQ resolution, and legal policy grounding.
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized (Threshold-based)
- ✅ Runtime Execution Bridge / Orchestration
- ✅ AI/LLM Function Tool Routing
- ✅ E2E Validation & UI State Review

*Status: The Knowledge & RAG Foundation Capsule is now fully operational and validated E2E. It stands as the second official architectural blueprint and baseline pattern for all future memory, policy, or structured RAG-based Capability Capsules.*

### Third Capsule Pattern Materialized
**Cart Operator Capsule (Safe Mutator Blueprint)**
This is the designated foundational template for any future assistant-driven mutation that executes side-effects on client or global state.
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell (Ambiguity and safety gating)
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized (Threshold-based)
- ✅ Runtime Execution Bridge / Orchestration
- ✅ Execution Middleware (Execution gated by real DB product lookup, no hallucinated prices/titles)
- ✅ E2E Validation & UI State Review (Executor stripped of narrative UI copy; UI acts purely as a Presenter)

---

*Generado: 3 de marzo de 2026. Reestructurado: 4 de marzo de 2026. Revisado: 19 de marzo de 2026 (Wave 193 — Marketing AI Reality Repair — v113). Actualizado: 22 de marzo de 2026 (Admin Orders Panel CRUD). Actualizado: 23 de marzo de 2026 (B2 Pass 1 — Operator Case Draft Minimum Loop — Codex ACCEPT WITH RESIDUAL RISK). Actualizado: 23 de marzo de 2026 (B2 Pass 2 — Private Case Draft Maturation Loop — Codex ACCEPT). Actualizado: 24 de marzo de 2026 (A92 — Cesarin OS Graph-Assisted Operator Workbench — ACCEPT).*

*Este documento refleja el estado REAL, no aspiracional. Léelo completo antes de tocar código.*
*Tras cualquier cambio al código, actualizar este documento (§1.10).*
*Historial de auditorías: ver `AUDIT_LOG.md`.*
