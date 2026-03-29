# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Césarín AI assistant.

## Current Phase & Reliability
- **Phase:** 3.2C CLOSED — Pilot Readiness Gate: **PASS (unrestricted, March 2026)**
- **Status:** **FULLY OPERATIONAL — Cleared for Unrestricted Pilot**
- **Base Build:** v113 (Wave 193 — Marketing AI Reality Repair)
- **Model Stack (canonical):**
  - Analyst / Sommelier: `gemini-2.5-flash` via Gemini API `v1`
  - Embeddings: `gemini-embedding-001` via Gemini API `v1beta` + `outputDimensionality: 3072`
  - Note: `v1` returns 404/405 for `gemini-embedding-001` — `v1beta` is the correct stable route.
- **Retrieval Quality:** High. 7/7 pilot queries routed correctly. Telemetry persisted to `ai_analytics`.
- **Sales Recovery Behavior:** Exact-product misses can recover through bounded token-based catalog matching when semantic expansion is not required. Token recovery remains useful, but it is now surfaced separately from embedding-based semantic suggestions in drafting, telemetry, and the storefront label surface.
- **Clarification-to-Conversion Behavior:** For exploratory product-seeking turns, the storefront response now tries to narrow on one useful axis first and frame the shown options as a choice only when the comparative evidence is actually supported. When product differences are weak, the storefront stays neutral instead of inventing a start-here hierarchy. This does not change retrieval architecture or S94 honesty boundaries.
- **Choice-to-Confidence Behavior:** Once the storefront already has a likely choice, the assistant may reinforce that option with short, modest confidence language only when the support is real. Weak-support cases must stay neutral, and multi-exact exact-match cases must not imply that one clear option already won unless there is truly only one exact in-stock match.
- **Confidence-to-Cart Behavior:** Storefront handoff strength must now match branch support honestly. Weak-support fallback cases should stay at review/PDP level, while stronger exact or support-backed paths may progress naturally into review-then-cart wording. Cart-adjacent language must not appear just because only one fallback product survived.
- **Objection-to-Recovery Behavior:** Late-stage objections should now recover locally inside the already narrowed branch instead of resetting the funnel. `cheaper`, `worth_it`, hesitation, and nearby-alternative handling must stay grounded in current branch support, only one nearby alternative should appear when justified, and objection paths should stay persuasive but conservative on action strength.
- **Recovery-to-Commitment Behavior:** After a grounded objection recovery already exists inside a narrowed branch, the storefront may now add a stronger commitment-ready close only when that recovery is support-backed. Weak-support recovery must remain conservative, and two-option recovery must stay focused on the current pair instead of reopening broader browsing.
- **Commitment-to-Checkout-Readiness Behavior:** After commitment already exists, the storefront may now add a bounded checkout-readiness step only when the readiness check itself is explicitly support-backed. This is not checkout execution or payment flow; weak and multi-option paths must stay conservative, and ordinary selectorless single-product paths must not sound checkout-ready.
- **Checkout-Readiness-to-Cart-Precision Behavior:** After checkout-readiness already exists, the storefront may now add a bounded selector-backed cart-precision step only when a materially purchase-defining selector is actually supported. This is not cart execution, checkout execution, or payment flow; selectorless strong paths must stay at readiness, and weak or multi-option paths must remain non-precise.
- **Césarín Stage 1 Behavior:** The storefront assistant now speaks in a shorter, more oral, more honest style under uncertainty, can admit when a product/query still catches him off guard, offers a visible approximate-recovery loop (`Esta se parece más` / `Ninguna`) when nearby products are all that can be shown truthfully, and escalates honestly to the real WhatsApp path when rescue is clearly failing. This does not add deep customer memory, autonomous learning, or fake human-support promises.
- **Césarín Stage 2 Behavior:** Authenticated returning customers may now receive sharper recommendation continuity through lightweight taste memory over `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`. Memory use is compact and humble: current turn always overrides prior memory, weak signals stay soft, explicit rejection stays conservative, and guests still do not get fake durable memory. Historical interests no longer gain fake recency/hits just because they survived merge.
- **Césarín Stage 3 Behavior:** The storefront now converts that same bounded taste memory into real commercial judgment for authenticated returning customers. Relevant liked profiles can lift stronger options, rejected/disliked paths can move downward, budget posture can nudge ordering conservatively, and approximate recovery inherits better top suggestions because reranking happens before the existing recovery loop. Current turn still overrides prior memory, and this remains bounded storefront behavior rather than a giant ranking engine or CRM layer.
- **Césarín Core Refactor — Wave 1 (accepted):** The storefront/customer-intelligence core is now materially less rail-driven. Césarín identity is slimmer and less seller-scripted, runtime separation is clearer between model reasoning, native capabilities, own functions, and UI affordances, the old main-path `UNKNOWN -> PRODUCT_SEARCH` coercion is gone, forced product-search injection is gone from the main path, and degraded Analyst fallback no longer coerces product search. This remains Wave 1 only: not Wave 2, not a catalog-gate redesign, not an anti-bloat rewrite, and not removal of all Stage 4 / Stage 5 infrastructure.
- **Coverage:** products 44/44 (100%) · store_knowledge 23/23 (100%) — all 3072d vectors.
- **Césarín Stage 4 Behavior:** The storefront still adapts the main commercial/product-search conversation shape through bounded modes `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE`, but storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime dependency. Strong-signal turns can still get shorter/cleaner recommendations, compare turns stay grounded, hesitation gets reassurance instead of reset, and broad weak-memory turns stay exploratory. This remains bounded primarily to the main commercial/product-search lane, not all Césarín behavior.
- **Césarín Stage 5 Behavior:** The storefront now also resolves one bounded next actionable storefront step after recommendation through `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`. Stage 5 runs after Stage 3 reranking and Stage 4 posture shaping, hydrates real product data before deciding the next move, attaches `next_step_view` to the capsule contract, and renders a real `Siguiente paso` block in the UI using existing `OPEN_PDP` and `ADD_TO_CART` storefront actions only when support is real. Compare/exploration remain honest when close is not justified, selector-needed stays grounded in real product/variant evidence, and current-turn intent can still block stale memory/posture from forcing action confidence.

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
3. **Verify:** Check if the assistant follows the Sommelier persona rules, asks one commercially useful narrowing question when needed, only steers toward one option when the comparative support is real, keeps post-choice confidence language modest and supported, matches handoff strength to real branch support, and recovers late-stage objections locally instead of resetting the funnel. Weak fallback cases should stay at review/PDP level; stronger exact or support-backed cases may move naturally toward cart; multi-exact cases must not imply that one clear option already won; objection paths should stay grounded, narrow, and conservative on action strength; once a grounded objection recovery exists, only strong-support recovery may tighten into a more commitment-ready close, while weak-support and two-option recovery must stay conservative and non-browsing; checkout-readiness may appear only when the final readiness check is explicitly support-backed, and it must never imply checkout execution or payment flow; cart precision may appear only when a materially purchase-defining selector is actually supported, and it must never imply cart execution, checkout execution, or payment flow.
4. **Audit:** Go to Admin > Cesarin OS > Piloto Operativo and log the pass/fail result.
5. **Monitor:** Review `ai_analytics` for `capsule_match_strategy`, `capsule_retrieval_source`, `semantic_match_success`, `fallback_used`, and `product_card_count` so token recovery, semantic recovery, and fallback behavior are not conflated.
6. **Troubleshoot:** Use the **Runtime Parity Hygiene** dashboard in the admin panel to verify build fingerprints and PWA vs Browser state. Use **"Enable Pilot Session"** to jumpstart the pilot gate without editing the URL (ideal for installed PWAs). Use **"Clear Pilot Session"** if activation flags get stuck.

## Known Constraints
- **Quota/Latency:** Free tier Gemini API may experience 429 errors or latency spikes.
- **Memory:** Conversation history is still session-scoped, but authenticated storefront customers now also have lightweight persistent taste memory through compact preference signals/summary, and that memory can now influence recommendation order commercially in a bounded way. Guests still reset fully with session loss and do not have durable cross-session memory.
- **Deployment Drift (Resolved):** Previous appearances of regression (404 errors) during the Wave 191 cycle were purely deployment drift caused by testing slim Edge Functions with the deprecated `gemini-1.5-flash` model. Resolved at Wave 191 closure — production Edge Function correctly uses `gemini-2.5-flash` via `/v1`, 13/13 scenario PASS rate confirmed.
- **Analyst Refinement Success (Wave 189/191):** Abstract queries (price+flavor combos) now show significantly improved direct classification by the Analyst. `PASS_WITH_WARNING` events are non-blocking and represent minor intent edge cases (e.g. inventory phrasing "queda stock" overlapping with `COMPATIBILITY_CHECK`), not functional failures. Intent precedence may need later tuning.
- **Cart Completion Rate:** Currently 0% via concierge — checkout-via-concierge not yet wired to payment flow.

## Non-Negotiable Rules
- **DO NOT** disable the pilot gate for all users without high-level approval.
- **DO NOT** hardcode the pilot bypass in `App.tsx`.
- **DO NOT** leak raw technical error messages to the customer.
- **Brain-First Capsule Rule (v106 canon, Stage 1 adjusted):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. Weak storefront turns should still be rescued when real product, inventory, policy, or greeting signals exist, but `UNKNOWN` may remain honestly unresolved when no real rescue signal is present.

## Brain-First Guardrail State (Wave 1 reconciled — 29 mar 2026)
The deterministic storefront edge layer is still allowed to preserve truthful boundary behavior, but product-search coercion is no longer the fallback spine of the system:
- Main-path weak-intent `UNKNOWN -> PRODUCT_SEARCH` coercion is removed.
- Forced product-search injection is removed from the main path.
- Real edge rescue remains allowed for truthful boundary lanes such as policy, inventory, and greeting signals.
- Real product guidance can still happen when the model actually asks for capability help or when truthful storefront evidence materially supports it.
- If no real rescue signal exists, the turn may remain honestly unresolved instead of being pushed into catalog guidance by reflex.
- If the Analyst degrades, the accepted neutral fallback now returns `intent: 'UNKNOWN'`, `turn_decision: 'ASK_CLARIFYING_QUESTION'`, `tool_calls: []`, and `fallback_reason: 'ANALYST_DEGRADED'`.

## Capability Capsules (All Materialized)
- **Product Search Integrity Capsule** — Read-Only Blueprint ✅
- **Knowledge & RAG Foundation Capsule** — Context/Memory Blueprint ✅
- **Cart Operator Capsule** — Safe Mutator Blueprint ✅
All three are fully materialized and E2E validated. The Edge Function returns `requires_client_capsule: true` for product/knowledge queries — actual DB retrieval and product card rendering happens client-side.

## Next Steps After Pilot Launch
1. Monitor `ai_analytics` weekly: `semantic_match_success`, `fallback_used`, `product_card_count`
2. Enrich `store_knowledge` with any unanswered queries observed in telemetry
3. Enable for all users (`is_ai_assistant_enabled = true`) when pilot metrics are satisfactory
4. Future: wire checkout-via-concierge to payment flow (unlocks `cart_action_detected` KPI)
