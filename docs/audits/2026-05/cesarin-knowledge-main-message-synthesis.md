# Cesarin Knowledge Main-Message Synthesis - May 2026

## Status
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Implementation commit: `c65ba2386247e87d22067463fb3bac90d6684550` (`test: improve cesarin knowledge main message synthesis`).
- Scoped RAG answer-quality harness verdict: ACCEPT WITH RESIDUAL RISK.
- Scoped RAG answer-quality harness commit: `3f7bb4b` (`test: add scoped RAG answer-quality harness`).
- Multi-prompt no-write RAG quality trigger verdict: ACCEPT WITH RESIDUAL RISK.
- Multi-prompt no-write RAG quality trigger commit: `3f61e13` (`test: add multi-prompt no-write RAG quality trigger`).
- No-write error metadata preservation verdict: ACCEPT WITH RESIDUAL RISK.
- No-write error metadata preservation commit: `7905b60` (`test: preserve no-write metadata on customer intelligence errors`).
- Unsupported delivery guarantee answer-shaping verdict: ACCEPT WITH RESIDUAL RISK.
- Unsupported delivery guarantee answer-shaping commit: `9637596` (`test: harden unsupported delivery guarantee policy answer`).
- Payment/shipping-cost no-write RAG smoke path hardening verdict: ACCEPT WITH RESIDUAL RISK.
- Payment/shipping-cost no-write RAG smoke path hardening commit: `cb6311e` (`test: harden payment and shipping cost no-write smoke paths`).
- Partial six-prompt live no-write RAG smoke verdict: PARTIAL / NEEDS TARGETED FIX.
- Unsupported delivery guarantee successful RAG-path hardening verdict: ACCEPT WITH RESIDUAL RISK.
- Unsupported delivery guarantee successful RAG-path hardening commit: `826927f` (`test: harden unsupported delivery guarantee successful RAG path`).

## Accepted Scope
- Changed implementation files:
  - `src/lib/knowledge-rag-capsule.ts`
  - `src/lib/ai-capsule-schemas.ts`
  - `src/lib/__tests__/knowledge-rag-capsule.test.ts`
  - `src/services/__tests__/concierge.service.knowledge-harness.test.ts`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`
- No docs/canon, workflow, package, Supabase migration/seed, env, or secret file changed in the implementation commit.

## Accepted Behavior
- Successful `evaluateKnowledgeRAGTree` results synthesize a substantive `ui_render_hint` / main message from the top resolved chunk title/content.
- `capsule_contract.resolved_chunks` remain preserved for `AIConcierge`.
- Optional `source_id` is carried on knowledge chunks.
- Empty/no-match and degraded fallback behavior remain intact.
- `turn_analysis`, `catalog_gate`, `match_strategy`, `execution_status`, and contract shape remain preserved.

## Scoped RAG Answer-Quality Harness
- Commit `3f7bb4b` changed only `src/lib/__tests__/knowledge-rag-capsule.test.ts`.
- The harness is local and deterministic.
- It covers exactly six representative policy/RAG categories:
  - payment method.
  - shipping scope.
  - DHL shipping cost.
  - combined payment/shipping.
  - store-hours limitation.
  - unsupported delivery guarantee.
- It uses deterministic fixture chunks and local fallback helpers only.
- It asserts grounded fixture text, correct policy recall, useful customer-visible main message, resolved chunk support, bounded fallback/uncertainty, and absence of hallucinated payment/shipping claims.
- It does not call Edge, Supabase, DB, network, provider, live app, workflow, deploy, ingestion, or smoke paths.

## Multi-Prompt No-Write RAG Quality Trigger
- Commit `3f61e13` added local/tested readiness for a future authenticated deployed multi-prompt no-write RAG quality smoke.
- The trigger requires `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, and `ci_rag_quality_smoke=true`.
- It runs only the same six allowlisted RAG quality prompts covered by the scoped local harness.
- Each request calls `conciergeService.chat` with `{ noWriteSmoke: true }`.
- Sanitized audit output includes prompt/category, status, contract, suppression metadata, capsule, answer/main-message presence, match strategy, and resolved chunk count.
- Normal `sendMessage` remains unchanged, the existing single no-write smoke trigger remains valid, and no broad debug panel or normal customer-visible control was added.

## No-Write Error Metadata Preservation
- Commit `7905b60` added local/tested preservation of sanitized `no_write_smoke` metadata on recognized `customer_intelligence_no_write_v1` error paths.
- The patch preserves Edge error metadata, service-level thrown-error metadata, client telemetry suppression for no-write error paths, and hook audit rendering when metadata exists.
- The existing missing-metadata fallback and non-smoke error behavior remain unchanged.
- This patch did not change answer shaping, including unsupported delivery-guarantee refusal/qualification.

## Unsupported Delivery Guarantee Answer-Shaping
- Commit `9637596` added local deterministic unsupported delivery-guarantee answer-shaping in the policy degraded fallback.
- Changed files: `supabase/functions/customer-intelligence/policy-degraded-fallback.ts`, `src/lib/__tests__/knowledge-rag-capsule.test.ts`, and `src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts`.
- The narrow `unsupported_shipping_promise_limit` fallback applies to unsupported shipping promise / delivery guarantee premises when shipping policy context exists.
- It states that next-day guaranteed home delivery cannot be confirmed, grounds shipping to DHL OCURRE / sucursal, and says timing/cost must be confirmed before closing the order.
- No-policy bounded fallback behavior remains preserved.
- Existing payment, shipping scope, shipping cost, combined payment/shipping, and store-hours harness behavior remains covered.
- This patch did not change no-write trigger behavior, no-write metadata preservation, workflow, deploy, DB, ingestion, or live paths.

## Payment / Shipping-Cost No-Write RAG Smoke Path Hardening
- Commit `cb6311e` added local/source hardening for the `payment_method` and `shipping_cost` no-write RAG smoke paths.
- Under recognized `customer_intelligence_no_write_v1` no-write smoke, the exact prompts `¿Aceptan tarjeta o cómo puedo pagar?` and `¿Cuánto cuesta el envío por DHL?` are forced to `POLICY_INQUIRY` / `knowledge_rag_foundation` instead of `storefront_checkout_readiness`.
- Normal checkout-readiness behavior remains intact for real checkout phrases such as `ya puedo pagar?`.
- The six-prompt allowlist and normal `sendMessage` behavior remain unchanged.
- Sanitized audit rows now distinguish `edge_metadata_present` from `request_contract_present`.
- Unsupported delivery-guarantee successful-path shaping was not included.

## Partial Live Six-Prompt Answer-Quality Evidence
- After storefront runtime `d50379e` / `v113-d50379e` and deploy-functions run `26000841773` confirmed current `customer-intelligence` freshness, exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke ran through the existing trigger.
- For all six categories, visible sanitized audit evidence showed `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- Answer-quality verdict: PARTIAL / NEEDS TARGETED FIX.
- Accepted live quality: `shipping_scope` directly matched DHL OCURRE / sucursal and no domicilio; `combined_payment_shipping` combined transfer/deposit plus DHL OCURRE / no domicilio.
- Accepted with residual: `payment_method` was grounded in visible payment chunks but exposed a MercadoPago/cards versus transfer/deposit-only policy inconsistency; `shipping_cost` was grounded in a visible `$150-$180 MXN` chunk but may conflict with confirmation/estimate expectations; `store_hours_limitation` avoided inventing hours but did not clearly answer the hours question from visible evidence.
- Needs fix: `unsupported_delivery_guarantee` did not clearly refuse or qualify guaranteed next-day home delivery in the successful live RAG/Sommelier path.
- This confirms that the `9637596` `unsupported_shipping_promise_limit` degraded fallback hardening does not cover the successful live RAG/Sommelier path.
- Follow-up `826927f` locally hardens the successful client-capsule RAG path for that unsupported guarantee case, but it is not deployed/runtime proof.

## Unsupported Delivery Guarantee Successful RAG-Path Hardening
- Commit `826927f` added local/source hardening for successful `knowledge_rag_foundation` / client-capsule RAG answer shaping.
- Changed files: `src/lib/knowledge-rag-capsule.ts`, `src/lib/__tests__/knowledge-rag-capsule.test.ts`, and `src/services/ai-capsule-orchestrator.service.ts`.
- No docs/canon, workflows, package/env files, Supabase migrations/seeds, DB scripts, no-write trigger code, or no-write metadata code changed in `826927f`.
- `evaluateKnowledgeRAGTree` now accepts optional query context.
- `executeKnowledgeCapsule` now passes `toolArgs.query` into the mapper so the successful `knowledge_rag_foundation` client-capsule RAG path can apply the guard.
- The successful RAG-path guard detects unsupported shipping-promise questions and requires shipping / DHL OCURRE / sucursal policy evidence in resolved chunks.
- When active, it returns a bounded customer-facing answer saying next-day guaranteed home delivery is not confirmed, grounds shipping to DHL ocurre / sucursal, and says timing and costs are confirmed before closing the order.
- Local tests cover `Â¿Me garantizas entrega maÃ±ana a domicilio?`, `Â¿Garantizan entrega maÃ±ana?`, and `Â¿Me llega maÃ±ana seguro a mi casa?`.
- Tests assert the answer does not overclaim guaranteed next-day home delivery.
- Tests also cover that the guard does not run without unsupported-promise query context or without shipping/OCURRE policy evidence.
- Existing tests remained green for payment method, shipping scope, shipping cost, combined payment/shipping, store-hours degraded fallback, degraded unsupported-guarantee fallback from `9637596`, and the no-write metadata preservation harness.
- No no-write trigger or metadata behavior was broadened.

## Accepted Validation
- Focused tests over mapper/service/UI harnesses: PASS, 3 files / 30 tests.
- Targeted ESLint: PASS with 0 errors and 1 existing warning.
- `git diff --check c65ba23^ c65ba23`: PASS.
- Commit-diff secret-pattern scan: no secret-like values.
- `npm run typecheck` was not accepted as green for this lane because it still failed on unrelated/pre-existing seed-runner strictness errors later addressed by `70ca5f2`.
- Scoped RAG answer-quality harness validation for `3f7bb4b`:
  - `npm run test:run -- src/lib/__tests__/knowledge-rag-capsule.test.ts src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts`: PASS, 2 files / 11 tests.
  - `npx eslint src/lib/__tests__/knowledge-rag-capsule.test.ts`: PASS.
  - `npm run typecheck`: PASS.
  - `git diff --check 3f7bb4b^ 3f7bb4b`: PASS.
  - Commit-diff secret-pattern scan: `NO_SECRET_PATTERN_MATCHES`.
- Multi-prompt no-write RAG quality trigger validation for `3f61e13`:
  - `npm run test:run -- src/hooks/__tests__/useAIConcierge.test.tsx src/components/ui/ai/__tests__/AIConcierge.test.tsx`: PASS, 2 files / 46 tests.
  - Targeted ESLint over changed hook/UI files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check 3f61e13^ 3f61e13`: PASS.
  - Commit-diff secret-pattern scan found no secret values; hits were only negative test assertions.
- No-write error metadata preservation validation for `7905b60`:
  - `npm run test:run -- src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts src/services/__tests__/concierge.service.knowledge-harness.test.ts src/hooks/__tests__/useAIConcierge.test.tsx`: PASS, 3 files / 25 tests.
  - Targeted ESLint over changed files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check 7905b60^ 7905b60`: PASS.
  - Commit-diff secret scan found no raw secret values.
- Unsupported delivery guarantee answer-shaping validation for `9637596`:
  - `npm run test:run -- src/lib/__tests__/knowledge-rag-capsule.test.ts src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts`: PASS, 2 files / 13 tests.
  - Targeted ESLint over changed source/test files: PASS.
  - `npm run typecheck`: PASS.
  - `git diff --check 9637596^ 9637596`: PASS.
  - Commit-diff secret scan found no secret-like values.
- Payment/shipping-cost no-write RAG smoke path hardening validation for `cb6311e`:
  - `npm run test:run -- src/lib/__tests__/customer-intelligence-turn-first.test.ts src/lib/__tests__/customer-intelligence-tool-selection.test.ts src/hooks/__tests__/useAIConcierge.test.tsx src/services/__tests__/concierge.service.knowledge-harness.test.ts`: PASS, 4 files / 70 tests.
  - Targeted ESLint over changed files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check cb6311e^ cb6311e`: PASS.
  - Commit-diff secret scan found no secret-like values.
- Unsupported delivery guarantee successful RAG-path hardening validation for `826927f`:
  - `npm run test:run -- src/lib/__tests__/knowledge-rag-capsule.test.ts src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts src/services/__tests__/concierge.service.knowledge-harness.test.ts`: PASS, 3 files / 19 tests.
  - Targeted ESLint over changed source/test files: PASS.
  - `npm run typecheck`: PASS.
  - `git diff --check 826927f^ 826927f`: PASS.
  - Commit-diff secret scan: `COMMIT_DIFF_NO_SECRET_PATTERN_MATCHES`.

## Non-Claims / Residuals
- No live production Cesarin answer-quality proof.
- Live retrieval-to-answer proof is limited to the separately canonized single post-deploy no-write customer-intelligence smoke and the partial six-prompt no-write RAG smoke.
- Remote `customer-intelligence` smoke evidence is limited to those separately canonized deployed app-triggered no-write smokes.
- No full RAG quality proof.
- No Product Search quality proof.
- The partial six-prompt smoke does not prove production answer quality for all six prompts.
- No claim is made that the payment/shipping policy corpus is internally consistent.
- Unsupported delivery-guarantee successful client-capsule RAG-path hardening is locally accepted at `826927f`, but deployed/runtime proof remains unaccepted.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- `store_hours_limitation` remains weak and needs clearer bounded not-found / ask-WhatsApp behavior.
- Failure UI is sanitized, but pre-existing raw error console diagnostics remain outside the trigger lane.
- No semantic completeness proof.
- No metadata cleanup.
- No DB/Supabase/workflow/deploy mutation.
- No project-wide typecheck green claim for this lane.
