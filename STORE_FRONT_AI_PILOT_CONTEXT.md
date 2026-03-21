# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Cesarín AI assistant.

## Current Phase & Reliability
- **Phase:** 3.2C CLOSED — Pilot Readiness Gate: **PASS (unrestricted, March 2026)**
- **Status:** **FULLY OPERATIONAL — Cleared for Unrestricted Pilot**
- **Base Build:** v113 (Wave 193 — Marketing AI Reality Repair)
- **Model Stack (canonical):**
  - Analyst / Sommelier: `gemini-2.5-flash` via Gemini API `v1`
  - Embeddings: `gemini-embedding-001` via Gemini API `v1beta` + `outputDimensionality: 3072`
  - Note: `v1` returns 404/405 for `gemini-embedding-001` — `v1beta` is the correct stable route.
- **Retrieval Quality:** High. 7/7 pilot queries routed correctly. Telemetry persisted to `ai_analytics`.
- **Coverage:** products 44/44 (100%) · store_knowledge 23/23 (100%) — all 3072d vectors.

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
3. **Verify:** Check if the assistant follows the Sommelier persona rules and surfaces product cards.
4. **Audit:** Go to Admin > Cesarin OS > Piloto Operativo and log the pass/fail result.
5. **Monitor:** Review `ai_analytics` table for `semantic_match_success`, `fallback_used`, `product_card_count`.
6. **Troubleshoot:** Use the **Runtime Parity Hygiene** dashboard in the admin panel to verify build fingerprints and PWA vs Browser state. Use **"Enable Pilot Session"** to jumpstart the pilot gate without editing the URL (ideal for installed PWAs). Use **"Clear Pilot Session"** if activation flags get stuck.

## Known Constraints
- **Quota/Latency:** Free tier Gemini API may experience 429 errors or latency spikes.
- **Memory:** Session-only history; closing the tab or clearing session data resets context.
- **Deployment Drift (Resolved):** Previous appearances of regression (404 errors) during the Wave 191 cycle were purely deployment drift caused by testing slim Edge Functions with the deprecated `gemini-1.5-flash` model. Resolved at Wave 191 closure — production Edge Function correctly uses `gemini-2.5-flash` via `/v1`, 13/13 scenario PASS rate confirmed.
- **Analyst Refinement Success (Wave 189/191):** Abstract queries (price+flavor combos) now show significantly improved direct classification by the Analyst. `PASS_WITH_WARNING` events are non-blocking and represent minor intent edge cases (e.g. inventory phrasing "queda stock" overlapping with `COMPATIBILITY_CHECK`), not functional failures. Intent precedence may need later tuning.
- **Cart Completion Rate:** Currently 0% via concierge — checkout-via-concierge not yet wired to payment flow.

## Non-Negotiable Rules
- **DO NOT** disable the pilot gate for all users without high-level approval.
- **DO NOT** hardcode the pilot bypass in `App.tsx`.
- **DO NOT** leak raw technical error messages to the customer.
- **Brain-First Capsule Rule (v106 canon):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. `UNKNOWN` is last resort — any commercially-interpretable query must be rescued by the guardrail before returning `UNKNOWN`.

## Brain-First Guardrail Signal Map (A81 — 21 mar 2026)
The deterministic guardrail in `customer-intelligence/index.ts` rescues `UNKNOWN` → `PRODUCT_SEARCH` for the following signals:
- **Flavor/texture:** frutal, dulce, suave, fuerte, fresco, mentol, rico, intenso, cremoso, tropical, uva, mango, fresa, sandía, melón, mora, cereza, menta, hielo, ice, tabaco, caramelo
- **Price/value:** barato, económico, precio, oferta, descuento
- **Recommendation:** recomiéndame, quiero, tengo, qué me conviene, algo que me guste, algo para, quiero probar, comprar
- **Discovery verbs:** busco, buscas, tienen, tienes, hay
- **Product type terms:** vape, líquido, pod, pods, mod, kit, kits, cartucho, cartuchos, desechable, desechables, dispositivo, vaporizador
- **Terminal recovery (A81):** any intent still `UNKNOWN` after all signal checks → `PRODUCT_SEARCH`. In a vape store, an unresolvable query defaults to product discovery.

And rescues `UNKNOWN` → `POLICY_INQUIRY` for: política, envío, pago, reembolso, devolución, garantía, entrega, costo, tarifa, aceptan

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
