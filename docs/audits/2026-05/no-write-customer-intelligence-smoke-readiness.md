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

## Non-Claims / Residuals
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write policy/shipping/payment smoke.
- Remote `customer-intelligence` smoke evidence is limited to that single deployed app-triggered no-write smoke.
- Edge HTTP no-write metadata evidence is limited to that smoke's sanitized audit block.
- No deployed trigger availability or live multi-prompt smoke execution is claimed for `3f61e13`.
- No deployed/runtime RAG answer-quality proof is claimed from the multi-prompt trigger.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No broad production readiness or all-routes `customer-intelligence` safety proof.
- No metadata cleanup.
- No DB/Supabase mutation absence at transaction-log level beyond no manual DB mutation command and visible no-write metadata evidence.
- No ingestion rerun or secret exposure.
- No fix for `metadata.embedding_dims` or retained inactive embedded rows.
- The smoke contract is explicit and narrow but not additionally environment-gated.
