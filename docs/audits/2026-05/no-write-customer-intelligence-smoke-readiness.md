# No-Write Customer-Intelligence Smoke Readiness - May 2026

## Status
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Implementation commit: `0795c51de54842df4dbf496855f785cd83ba45ba` (`test: add no-write customer intelligence smoke readiness`).
- Canon commit: `8e0dab7 docs: canonize no-write customer intelligence smoke readiness`.
- Post-deploy smoke verdict: ACCEPT WITH RESIDUAL RISK.
- Workflow patch commit: `626a730` (`ci: include customer-intelligence in function deploy workflow`).
- Refresh workflow run: `25980183647` (`workflow_dispatch`, `main`, commit `626a730d9363ca3dec01c82116ab85947c56209a`) concluded success.
- Multi-prompt trigger verdict: ACCEPT WITH RESIDUAL RISK.
- Multi-prompt trigger commit: `3f61e13` (`test: add multi-prompt no-write RAG quality trigger`).
- No-write error metadata preservation verdict: ACCEPT WITH RESIDUAL RISK.
- No-write error metadata preservation commit: `7905b60` (`test: preserve no-write metadata on customer intelligence errors`).
- Payment/shipping-cost no-write RAG smoke path hardening verdict: ACCEPT WITH RESIDUAL RISK.
- Payment/shipping-cost no-write RAG smoke path hardening commit: `cb6311e` (`test: harden payment and shipping cost no-write smoke paths`).
- Partial six-prompt no-write RAG smoke verdict: PARTIAL / NEEDS TARGETED FIX.
- Partial six-prompt no-write RAG smoke baseline: storefront runtime `d50379e`, `runtimeBuildFingerprint` `v113-d50379e`, deploy-functions run `26000841773` success, and `Deploy customer-intelligence` success.
- Unsupported delivery guarantee successful RAG-path hardening verdict: ACCEPT WITH RESIDUAL RISK.
- Unsupported delivery guarantee successful RAG-path hardening commit: `826927f` (`test: harden unsupported delivery guarantee successful RAG path`).

## Accepted Scope
- Changed implementation files:
  - `src/lib/customer-intelligence-no-write-smoke.ts`
  - `src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`
  - `src/services/concierge.service.ts`
  - `src/services/__tests__/concierge.service.knowledge-harness.test.ts`
  - `supabase/functions/customer-intelligence/index.ts`
  - `supabase/functions/customer-intelligence/no-write-smoke.ts`
- No docs/canon, workflows, package/env/secret files, Supabase migrations, or seeds changed in the implementation commit.

## Accepted Behavior
- Explicit contract identity: `customer_intelligence_no_write_v1`.
- Intended scope: authenticated `concierge_chat` knowledge handoff.
- Under the contract, the path suppresses:
  - `ai_customer_memory` persistence.
  - Edge `ai_analytics` insert.
  - QA Judge invocation.
  - client/service capsule telemetry.
- Response exposes auditable `no_write_smoke` metadata.
- Scope mismatch is rejected instead of silently broadening suppression.
- Normal production behavior remains unchanged when the smoke flag/contract is absent.
- Existing non-smoke `knowledge_rag_foundation` telemetry remains intact.

## Accepted Validation
- `npm run test:run -- src/services/__tests__/concierge.service.knowledge-harness.test.ts src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`: PASS, 2 files / 5 tests.
- Targeted ESLint over changed code/test files: PASS with 0 errors and existing warnings only.
- `npm run typecheck`: PASS.
- `git diff --check`: PASS.
- `git diff --check 0795c51^ 0795c51`: PASS.
- Commit-diff secret-pattern scan: `NO_SECRET_PATTERN_MATCHES`.

## Post-Deploy Live Smoke Evidence
- `626a730` added `customer-intelligence` to `.github/workflows/deploy-functions.yml`.
- Workflow run `25980183647` succeeded and deployed `knowledge-ingestor`, `customer-intelligence`, `create-payment`, and `mercadopago-webhook`.
- After that deploy, exactly one authenticated deployed app-triggered no-write smoke ran through `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1`.
- Smoke question: `¿Cuáles son las opciones de envío o pago?`.
- Sanitized audit metadata:
  - `metadata: present`.
  - `contract: customer_intelligence_no_write_v1`.
  - `writes: ai_customer_memory, ai_analytics`.
  - `calls: cesarin-qa-judge`.
  - `capsule: knowledge_rag_foundation`.
  - `answer: present`.
  - `main message: present`.
  - `match: MODERATE_CONFIDENCE_MULTI_SOURCE`.
  - `chunks: 3`.
- Supporting chunks:
  - `Guía de Inicio para Nuevos Compradores (3/4)`.
  - `Envíos Detallados y Costos (1/4)`.
  - `Política de Envíos (4/5)`.
- No second smoke was run.
- No secrets were printed/exported.
- No Supabase CLI, local ingestion, knowledge ingestion rerun, code/test changes, DB work, or manual DB mutation command occurred during the smoke.

## Multi-Prompt No-Write RAG Quality Trigger
- Commit `3f61e13` added a local/tested authenticated app trigger for a future deployed multi-prompt no-write RAG quality smoke.
- Changed files:
  - `src/hooks/useAIConcierge.ts`.
  - `src/hooks/__tests__/useAIConcierge.test.tsx`.
  - `src/components/ui/ai/AIConcierge.tsx`.
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`.
- The trigger requires all three gates:
  - `ci_no_write_smoke=true`.
  - `smoke_contract=customer_intelligence_no_write_v1`.
  - `ci_rag_quality_smoke=true`.
- It runs only the six allowlisted prompts from the scoped RAG answer-quality harness.
- Each request calls `conciergeService.chat` with `{ noWriteSmoke: true }`.
- Sanitized audit output includes prompt/category, status, contract, suppression metadata, capsule, answer/main-message presence, match strategy, and resolved chunk count.
- Normal `sendMessage` remains unchanged.
- Existing single no-write smoke trigger remains valid.
- No broad debug panel or normal customer-visible control was added.
- Validation for `3f61e13`:
  - `npm run test:run -- src/hooks/__tests__/useAIConcierge.test.tsx src/components/ui/ai/__tests__/AIConcierge.test.tsx`: PASS, 2 files / 46 tests.
  - Targeted ESLint over changed hook/UI files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check 3f61e13^ 3f61e13`: PASS.
  - Commit-diff secret-pattern scan found no secret values; hits were only negative test assertions.

## No-Write Error Metadata Preservation
- Commit `7905b60` added no-write error metadata preservation for recognized `customer_intelligence_no_write_v1` paths.
- Changed files:
  - `supabase/functions/customer-intelligence/index.ts`.
  - `supabase/functions/customer-intelligence/no-write-smoke.ts`.
  - `src/services/concierge.service.ts`.
  - `src/hooks/useAIConcierge.ts`.
  - `src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`.
  - `src/services/__tests__/concierge.service.knowledge-harness.test.ts`.
  - `src/hooks/__tests__/useAIConcierge.test.tsx`.
- Recognized no-write Edge error responses now include sanitized `no_write_smoke` metadata.
- Client service preserves `no_write_smoke` metadata from error response bodies and suppresses client telemetry for no-write error paths.
- The hook renders metadata-present audit rows when preserved metadata exists.
- The existing `metadata_present=false` fallback remains when metadata is unavailable.
- Non-smoke error behavior remains unchanged.
- Unsupported delivery-guarantee answer shaping was not included.
- Validation for `7905b60`:
  - `npm run test:run -- src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts src/services/__tests__/concierge.service.knowledge-harness.test.ts src/hooks/__tests__/useAIConcierge.test.tsx`: PASS, 3 files / 25 tests.
  - Targeted ESLint over changed files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check 7905b60^ 7905b60`: PASS.
  - Commit-diff secret scan found no raw secret values.

## Payment / Shipping-Cost No-Write RAG Smoke Path Hardening
- Commit `cb6311e` added local/source hardening for the `payment_method` and `shipping_cost` no-write RAG smoke paths.
- Changed files:
  - `src/hooks/useAIConcierge.ts`.
  - `src/hooks/__tests__/useAIConcierge.test.tsx`.
  - `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`.
  - `src/lib/__tests__/customer-intelligence-turn-first.test.ts`.
  - `supabase/functions/customer-intelligence/index.ts`.
  - `supabase/functions/customer-intelligence/intent-guardrails.ts`.
- Under recognized `customer_intelligence_no_write_v1` no-write smoke, the exact prompts `¿Aceptan tarjeta o cómo puedo pagar?` and `¿Cuánto cuesta el envío por DHL?` are forced to `POLICY_INQUIRY` / `knowledge_rag_foundation` instead of `storefront_checkout_readiness`.
- Normal checkout-readiness behavior remains intact for real checkout phrases such as `ya puedo pagar?`.
- The six-prompt allowlist and normal `sendMessage` behavior remain unchanged.
- Sanitized audit rows now distinguish `edge_metadata_present` from `request_contract_present`.
- Unsupported delivery-guarantee successful-path shaping was not included.
- Validation for `cb6311e`:
  - `npm run test:run -- src/lib/__tests__/customer-intelligence-turn-first.test.ts src/lib/__tests__/customer-intelligence-tool-selection.test.ts src/hooks/__tests__/useAIConcierge.test.tsx src/services/__tests__/concierge.service.knowledge-harness.test.ts`: PASS, 4 files / 70 tests.
  - Targeted ESLint over changed files: PASS with 0 errors and existing warnings only.
  - `npm run typecheck`: PASS.
  - `git diff --check cb6311e^ cb6311e`: PASS.
  - Commit-diff secret scan found no secret-like values.

## Partial Six-Prompt No-Write RAG Smoke Evidence
- Baseline before the smoke canon pass: `d50379e` (`docs: canonize payment shipping no-write RAG path hardening`).
- Deployed freshness was established before the smoke:
  - Storefront runtime `gitShortHash`: `d50379e`.
  - Runtime fingerprint: `v113-d50379e`.
  - `deploy-functions` run `26000841773`: success.
  - `Deploy customer-intelligence`: success.
  - Deployed source contained `cb6311e`, `7905b60`, and `9637596`.
- Exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke rerun executed through `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true`.
- The app was already authenticated at `/profile`.
- The storefront trigger did not redirect to login, and authenticated execution state was confirmed.
- The trigger executed exactly six allowlisted categories once:
  - `payment_method`.
  - `shipping_scope`.
  - `shipping_cost`.
  - `combined_payment_shipping`.
  - `store_hours_limitation`.
  - `unsupported_delivery_guarantee`.
- For all six prompts, visible sanitized audit evidence showed:
  - `status: ok`.
  - `metadata: present`.
  - `contract: customer_intelligence_no_write_v1`.
  - `writes: ai_customer_memory, ai_analytics`.
  - `calls: cesarin-qa-judge`.
  - `capsule: knowledge_rag_foundation`.
  - `match: MODERATE_CONFIDENCE_MULTI_SOURCE`.
  - `chunks: 3`.
- `edge_metadata_present` / `request_contract_present` were not visibly rendered as separate fields.
- Visible/proven for all six: suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, and preserved contract `customer_intelligence_no_write_v1`.
- Not proven: DB transaction-log mutation absence.
- No tokens, cookies, localStorage, auth headers, passwords, keys, env values, service-role bearer misuse, user creation, password reset, DB mutation command, Supabase CLI, ingestion, workflow run, deploy, or code/test/doc edits occurred during the smoke execution.

### Per-Prompt Answer-Quality Classification
- `payment_method`: ACCEPT WITH RESIDUAL. Runtime routing/no-write passed and the answer was grounded in visible payment chunks, but a policy inconsistency remains because visible evidence mentions MercadoPago/cards while combined policy text says transfer/deposit only.
- `shipping_scope`: ACCEPT. The answer directly matched DHL OCURRE / sucursal and no domicilio.
- `shipping_cost`: ACCEPT WITH RESIDUAL. Runtime routing/no-write passed and the answer was grounded in the visible `$150-$180 MXN` chunk, but a residual remains if canonical policy expects confirmation/estimate handling instead of a fixed range.
- `combined_payment_shipping`: ACCEPT. The answer was a strong bounded policy answer combining transfer/deposit plus DHL OCURRE / no domicilio.
- `store_hours_limitation`: ACCEPT WITH RESIDUAL. The answer did not invent unsupported hours, but did not clearly answer the hours question from visible evidence.
- `unsupported_delivery_guarantee`: NEEDS FIX. The answer did not clearly refuse or qualify guaranteed next-day home delivery, confirming that `9637596` degraded fallback hardening does not cover the successful live RAG/Sommelier path.
- Follow-up local/source fix: `826927f` is accepted with residual risk for successful client-capsule RAG-path answer shaping of unsupported delivery guarantee prompts. It has not yet been deployed, freshness-verified, or live-smoke tested.

## Non-Claims / Residuals
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write policy/shipping/payment smoke and the later partial six-prompt no-write RAG smoke.
- Remote `customer-intelligence` smoke evidence is limited to those explicitly described deployed app-triggered no-write smokes.
- The partial six-prompt smoke proves deployed trigger execution and visible no-write suppression metadata for that one run.
- No DB transaction-log mutation absence proof is claimed.
- No production answer-quality proof is accepted for all six prompts.
- No claim is made that payment/shipping policy corpus evidence is internally consistent.
- `unsupported_delivery_guarantee` successful client-capsule RAG-path answer shaping has a local/source fix at `826927f`, but deployed/runtime proof remains unaccepted.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- `store_hours_limitation` needs clearer bounded not-found / ask-WhatsApp behavior.
- Existing raw console diagnostics remain outside the no-write error metadata preservation lane.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No broad production readiness or all-routes `customer-intelligence` safety proof.
- No metadata cleanup.
- No DB/Supabase mutation absence at transaction-log level beyond no manual DB mutation command and visible no-write metadata evidence.
- No ingestion rerun or secret exposure.
- No fix for `metadata.embedding_dims` or retained inactive embedded rows.
- The smoke contract is explicit and narrow but not additionally environment-gated.
