# VSM STORE - CURRENT TECHNICAL CANON

> Live current-state technical source of truth for VSM Store.
> This file is current-state-first. Full historical detail lives in `AUDIT_LOG.md`, `docs/audits/`, and `docs/archive/`.
> Do not turn this file back into a full audit transcript. Add compact current truth here and place detailed evidence in audit detail files.

## Source-Of-Truth Hierarchy
1. Current user prompt and explicit authoritative state.
2. Applicable project canon in this file, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`, and `docs/audits/`.
3. `docs/Reglas para IDE antigravity/PROMPT-SYSTEM-RULES-—-IMMUTABLE.txt`.
4. `docs/Reglas para IDE antigravity/CONTEXTO-MAESTRO,-BASE-OPERATIVA-y-HANDOFF-CANÓNICO.txt`.
5. `docs/Reglas para IDE antigravity/PROMPT_SIZING_POLICY_VSM_STORE.md`.
6. `docs/Reglas para IDE antigravity/CONTEXTO_TEMPORAL_ACTUAL.md`.
7. `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`.

## Canon Archive Map
- Compact audit index: `AUDIT_LOG.md`.
- Audit archive rules: `docs/audits/README.md`.
- May 2026 detailed audit records: `docs/audits/2026-05/`.
- Pre-split full snapshots:
  - `docs/archive/AI_CONTEXT_ARCHIVE_2026-05-16.md`.
  - `docs/archive/AUDIT_LOG_ARCHIVE_2026-05-16.md`.
  - `docs/archive/STORE_FRONT_AI_PILOT_CONTEXT_ARCHIVE_2026-05-16.md`.

## Current Repository Baseline
- Latest canon before the split: `8e0dab7 docs: canonize no-write customer intelligence smoke readiness`.
- Latest post-split accepted canon lane: multi-prompt no-write RAG quality trigger, accepted with residual risk at `3f61e13`.
- Known local artifacts outside canon scope: `supabase/.temp/cli-latest` and `supabase/.branches/`.
- Cloudflare Pages native Git integration remains the primary deploy path; the GitHub Actions Pages workflow remains manual-only unless canon changes.
- Operating model: ChatGPT orchestrates, Codex audits/readiness/acceptance, Antigravity implements/validates/commits/pushes/canonizes when authorized, and the user is final judge.

## Current Product / Runtime Truth
- VSM Store is a PWA storefront/admin system for Vape / 420 commerce with Cesarin as the AI concierge.
- Storefront and Cesarin OS/admin coding fronts are not reopened by default. Closed lanes stay closed unless a new prompt explicitly selects one with evidence.
- The storefront/customer-intelligence path has accepted local harnesses for `knowledge_rag_foundation` chunk visibility, service-level knowledge handoff, main-message synthesis, scoped RAG answer-quality fixtures, seed-runner activation safety, seed-runner strictness, and no-write smoke readiness.
- Direct `match_knowledge` retrieval has a read-only smoke PASS after the active-corpus repair, but that is not full RAG, Product Search, or production answer-quality proof.
- `Run Knowledge Ingestion` has a post-Gemini-repair PASS at run `25969669995`; the earlier failed run `25947955038` remains historical failure-mode safety evidence only.

## Latest Accepted Lane: Multi-Prompt No-Write RAG Quality Trigger
- Implementation commit: `3f61e13` (`test: add multi-prompt no-write RAG quality trigger`).
- Changed files: `src/hooks/useAIConcierge.ts`, `src/hooks/__tests__/useAIConcierge.test.tsx`, `src/components/ui/ai/AIConcierge.tsx`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- The trigger is local/tested readiness for a future authenticated deployed multi-prompt no-write RAG quality smoke. It requires all three gates: `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, and `ci_rag_quality_smoke=true`.
- It runs only the six allowlisted prompts from the scoped RAG answer-quality harness and calls `conciergeService.chat` with `{ noWriteSmoke: true }` for each request.
- Sanitized audit output includes prompt/category, status, contract, suppression metadata, capsule, answer/main-message presence, match strategy, and resolved chunk count.
- Normal `sendMessage` remains unchanged, the existing single no-write smoke trigger remains valid, and no broad debug panel or normal customer-visible control was added.
- Validation accepted: targeted Vitest for `useAIConcierge.test.tsx` and `AIConcierge.test.tsx` PASS with 2 files / 46 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check 3f61e13^ 3f61e13` PASS; commit-diff secret-pattern scan found no secret values, only negative assertions.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Scoped Local RAG Answer-Quality Harness
- Implementation commit: `3f7bb4b` (`test: add scoped RAG answer-quality harness`).
- Changed file: `src/lib/__tests__/knowledge-rag-capsule.test.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- The harness is local/deterministic and covers exactly six representative policy/RAG categories: payment method, shipping scope, DHL shipping cost, combined payment/shipping, store-hours limitation, and unsupported delivery guarantee.
- Assertions cover grounded fixture text, correct policy recall, useful customer-visible main message, resolved chunk support, bounded fallback/uncertainty, and absence of hallucinated payment/shipping claims.
- Validation accepted: targeted Vitest for `knowledge-rag-capsule.test.ts` and `customer-intelligence-policy-degraded-fallback.test.ts` PASS with 2 files / 11 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 3f7bb4b^ 3f7bb4b` PASS; commit-diff secret-pattern scan `NO_SECRET_PATTERN_MATCHES`.
- The harness does not call Edge, Supabase, DB, network, provider, live app, workflow, deploy, ingestion, or smoke paths.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`.

## Accepted Lane: Post-Deploy No-Write Customer-Intelligence Smoke
- Workflow patch commit: `626a730` (`ci: include customer-intelligence in function deploy workflow`) added `customer-intelligence` to `.github/workflows/deploy-functions.yml`.
- Authorized workflow_dispatch run `25980183647` succeeded on `main` at `626a730d9363ca3dec01c82116ab85947c56209a`.
- Successful deploy steps in run `25980183647`: `knowledge-ingestor`, `customer-intelligence`, `create-payment`, and `mercadopago-webhook`.
- Exactly one authenticated deployed app-triggered no-write customer-intelligence smoke ran after that deploy via `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1`.
- Smoke question: `¿Cuáles son las opciones de envío o pago?`.
- Sanitized audit metadata showed `metadata: present`, contract `customer_intelligence_no_write_v1`, suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, answer/main message present, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- Supporting chunks: `Guía de Inicio para Nuevos Compradores (3/4)`, `Envíos Detallados y Costos (1/4)`, and `Política de Envíos (4/5)`.
- Verdict: ACCEPT WITH RESIDUAL RISK. This is a bounded live retrieval-to-answer/no-write smoke for one authenticated policy/shipping/payment-style question, not broad production answer-quality or full RAG/Product Search proof.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: No-Write Customer-Intelligence Smoke Readiness
- Implementation commit: `0795c51de54842df4dbf496855f785cd83ba45ba` (`test: add no-write customer intelligence smoke readiness`).
- Canon commit: `8e0dab7 docs: canonize no-write customer intelligence smoke readiness`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Contract identity: `customer_intelligence_no_write_v1`.
- Intended scope: authenticated `concierge_chat` knowledge handoff.
- Suppresses under the smoke contract:
  - `ai_customer_memory` persistence.
  - Edge `ai_analytics` insert.
  - QA Judge invocation.
  - client/service capsule telemetry.
- Response exposes auditable `no_write_smoke` metadata.
- Scope mismatch is rejected instead of silently broadening suppression.
- Normal production behavior remains unchanged when the smoke flag/contract is absent.
- Non-smoke `knowledge_rag_foundation` telemetry remains intact.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Recent Accepted Knowledge / Ingestion Lanes
- `70ca5f2317476f6fc66fcab060c1915db85d32c2` (`test: repair seed runner typecheck strictness`) repaired local seed-runner typecheck strictness; project-wide `npm run typecheck` was green at that commit. Detail: `docs/audits/2026-05/seed-runner-typecheck-strictness.md`.
- `c65ba2386247e87d22067463fb3bac90d6684550` (`test: improve cesarin knowledge main message synthesis`) improved local no-mutation main-message synthesis for successful `knowledge_rag_foundation` results. Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`.
- `05e3401c7d7bb2ac66786001fec24ce55409e233` (`test: harden store knowledge ingestion activation safety`) locally hardened seed-runner activation safety. Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.
- `7fbd3f127c9bfea82da01384f231858ed7473e09` and `a5a50af06d70505503c6d84cec739d26e34f350f` added local no-mutation UI/service harnesses for knowledge chunk visibility and service-level handoff. Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.
- `25927827351` and `25969669995` are accepted `Run Knowledge Ingestion` runtime verification runs. `25947955038` is accepted only as failure-mode safety observation for a failed run. Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Deployment / Workflow Current Truth
- Cloudflare Pages manual deploy recovery was proven at run `25918704188` and canonized.
- GitHub Actions Node 20 -> Node 24 migration was accepted and canonized at commit `f7519f7`; app/build Node remains Node 22 LTS.
- `supabase/setup-cli` is pinned by SHA in `deploy-functions`; the binary version remains intentionally mobile because `with: version: latest` was preserved.
- `626a730` added `customer-intelligence` to the `deploy-functions` workflow, and workflow_dispatch run `25980183647` successfully deployed `customer-intelligence` plus the existing function deploy steps.
- Runtime verifications are accepted for `deploy-functions` run `25924147087`, `graqle-sync` run `25925139071`, and `ingest-knowledge` run `25927827351`.
- Detailed workflow history is indexed in `AUDIT_LOG.md` and preserved in `docs/audits/2026-05/github-actions-runtime-verification.md` plus the full archive snapshot.

## Active Residuals / Non-Claims
- Bounded live retrieval-to-answer proof is claimed only for the post-deploy authenticated no-write `customer-intelligence` policy/shipping/payment smoke described above.
- Remote `customer-intelligence` smoke evidence is limited to that single deployed app-triggered no-write smoke.
- Edge HTTP no-write metadata evidence is limited to that single smoke and its visible sanitized audit block.
- No deployed availability or live execution is claimed for the multi-prompt no-write RAG quality trigger.
- No production Cesarin answer-quality proof is claimed.
- No full RAG quality proof is claimed; `3f7bb4b` is a scoped local deterministic policy/RAG harness only.
- No Product Search quality proof is claimed.
- No deployed/runtime RAG answer-quality proof is claimed from the local harness.
- No broad production readiness or all-routes `customer-intelligence` safety proof is claimed.
- No semantic completeness proof is claimed.
- No metadata cleanup is claimed.
- `metadata.embedding_dims` mismatch remains open: active vectors parse as `768d`, but metadata still records `3072` on many rows and is missing on one row unless separately repaired.
- Retained inactive embedded rows remain open/non-blocking unless separately repaired.
- Migration history divergence remains intentionally unresolved unless selected.
- Remote sandbox RPC smoke and production admin UI observation remain unresolved unless canon changes.
- No DB/Supabase mutation, deploy, workflow run, ingestion rerun, live smoke, or secret exposure is implied by doc/canon reconciliation.

## Closed Lanes / Do Not Reopen By Default
- Post-Gemini Run Knowledge Ingestion verification.
- `store_knowledge` active corpus repair.
- Direct `match_knowledge` retrieval smoke.
- Local no-mutation AIConcierge chunk visibility harness.
- Local no-mutation Cesarin service-level knowledge harness.
- `store_knowledge` ingestion activation safety hardening.
- Ingest failure-mode safety observation.
- Post-Gemini-repair Run Knowledge Ingestion runtime verification.
- Local no-mutation Cesarin knowledge main-message synthesis improvement.
- Seed-runner local typecheck strictness repair.
- No-write customer-intelligence smoke readiness.
- Post-deploy live no-write customer-intelligence smoke.
- Scoped local RAG answer-quality harness.
- Multi-prompt no-write RAG quality trigger.

## Canon Update Rules
- Keep this file current-state-first.
- Put detailed accepted evidence in `docs/audits/YYYY-MM/<lane>.md`.
- Keep `AUDIT_LOG.md` as the chronological index, not the full transcript.
- Preserve non-claims and residuals in live files when they affect future work.
- Do not create `AI_CONTEXT2.md` or `AUDIT_LOG2.md`; use archive/detail files instead.
