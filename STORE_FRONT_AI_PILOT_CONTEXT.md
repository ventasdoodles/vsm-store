# Storefront AI Pilot Context

Tactical guide for the controlled rollout of the Cesarín AI assistant.

## Current Phase & Reliability
- **Phase:** 3.2C CLOSED — Pilot Readiness Gate: **PASS (unrestricted, March 2026)**
- **Status:** **FULLY OPERATIONAL — Cleared for Unrestricted Pilot**
- **Build:** Version 106 (brain-first guardrail, 3072d canon, telemetry live)
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

## Pilot Activation Steps
To enable the assistant for testing or a specific pilot user:
1. Open the storefront URL.
2. Append `?pilot=cesarin` to the path (e.g., `vsm-store.com/?pilot=cesarin`).
3. The parameter clears automatically, but access is persisted in `sessionStorage`.

## Recommended Manual Pilot Flow
1. **Activate:** Use the pilot URL param.
2. **Interact:** Test commercial inquiries (vapes, extracts, stock, shipping).
3. **Verify:** Check if the assistant follows the Sommelier persona rules and surfaces product cards.
4. **Audit:** Go to Admin > Cesarin OS > Piloto Operativo and log the pass/fail result.
5. **Monitor:** Review `ai_analytics` table for `semantic_match_success`, `fallback_used`, `product_card_count`.

## Known Constraints
- **Quota/Latency:** Free tier Gemini API may experience 429 errors or latency spikes.
- **Memory:** Session-only history; closing the tab or clearing session data resets context.
- **Analyst Guardrail Dependency:** Abstract queries (price+flavor combos) may be rescued by the deterministic guardrail rather than classified directly by the Analyst. Routing is correct. Guardrail fires and logs `[GUARDRAIL]` to Edge Function console.
- **Cart Completion Rate:** Currently 0% via concierge — checkout-via-concierge not yet wired to payment flow.

## Non-Negotiable Rules
- **DO NOT** disable the pilot gate for all users without high-level approval.
- **DO NOT** hardcode the pilot bypass in `App.tsx`.
- **DO NOT** leak raw technical error messages to the customer.
- **Brain-First Capsule Rule (v106 canon):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. `UNKNOWN` is last resort — any commercially-interpretable query must be rescued by the guardrail before returning `UNKNOWN`.

## Brain-First Guardrail Signal Map (v106)
The deterministic guardrail in `customer-intelligence/index.ts` rescues `UNKNOWN` → `PRODUCT_SEARCH` for the following signals:
- **Flavor/texture:** frutal, dulce, suave, fuerte, fresco, mentol, rico, intenso, cremoso, tropical, uva, mango, fresa, sandía, melón, mora, cereza, menta, hielo, ice, tabaco, caramelo
- **Price/value:** barato, económico, precio, oferta, descuento
- **Recommendation:** recomiéndame, qué me conviene, algo que me guste, algo para, quiero probar, quiero algo, me puedes recomendar, qué tienes de
- **Product category:** vape, tienes, producto, liquido, pod, desechable, mod, coil, bobina, batería

And rescues `UNKNOWN` → `POLICY_INQUIRY` for: política, envío, pago, reembolso, devolución, garantía, entrega, costo, tarifa, cuánto cuesta, formas de pago, aceptan

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
