# Store Knowledge Ingestion And Retrieval - May 2026

## Covered Lanes
- `store_knowledge` active corpus repair.
- Direct `match_knowledge` retrieval smoke.
- Local no-mutation Cesarin knowledge chunk visibility harness.
- Local no-mutation Cesarin service-level knowledge harness.
- Local deterministic scoped RAG answer-quality harness.
- Local/tested multi-prompt no-write RAG quality trigger.
- Local/tested no-write error metadata preservation.
- Local deterministic unsupported delivery-guarantee answer-shaping.
- Local/source unsupported delivery-guarantee successful RAG-path hardening.
- Partial deployed six-prompt no-write RAG smoke evidence.
- fa305b2 deployed six-prompt no-write RAG smoke partial evidence.
- Local/source unsupported delivery-guarantee retrieval guard hardening.
- Local/source payment/shipping static RAG corpus normalization.
- Local/source targeted knowledge ingestion source allowlist.
- Store knowledge ingestion activation safety hardening.
- Ingest failure-mode safety observation.
- Post-Gemini-repair ingest verification.

## Accepted Facts
- Active-corpus repair restored table-level `match_knowledge` eligibility by setting exactly 41 preflight-selected inactive embedded rows to `is_active=true`.
- Direct `match_knowledge` retrieval smoke passed with five representative runtime-threshold queries.
- `7fbd3f1` added local no-mutation UI chunk visibility proof for mocked `knowledge_rag_foundation.resolved_chunks`.
- `a5a50af` added local no-mutation service-level proof that `conciergeService.chat` can return the expected knowledge capsule contract shape.
- `3f7bb4b` added local deterministic scoped RAG answer-quality harness coverage for payment method, shipping scope, DHL shipping cost, combined payment/shipping, store-hours limitation, and unsupported delivery guarantee.
- `3f61e13` added a local/tested authenticated app trigger for a future multi-prompt no-write RAG quality smoke over the same six allowlisted prompts, gated by `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, and `ci_rag_quality_smoke=true`.
- `7905b60` added local/tested no-write error metadata preservation for recognized `customer_intelligence_no_write_v1` paths; this improves auditability for error responses but does not prove the original runtime failure cause is fixed.
- `9637596` added local deterministic unsupported delivery-guarantee answer-shaping through the narrow `unsupported_shipping_promise_limit` degraded policy fallback; it applies when shipping policy context exists, says next-day guaranteed home delivery cannot be confirmed, grounds shipping to DHL OCURRE / sucursal, and says timing/cost must be confirmed before closing the order.
- A later authenticated deployed six-prompt no-write RAG smoke ran once at current runtime `d50379e` / `v113-d50379e` after deploy-functions run `26000841773` succeeded. All six allowlisted categories returned `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks. The smoke is PARTIAL / NEEDS TARGETED FIX for answer quality.
- `826927f` added local/source successful `knowledge_rag_foundation` client-capsule answer shaping for unsupported delivery guarantee prompts; it uses query context plus shipping / DHL OCURRE / sucursal policy evidence to refuse or qualify next-day home-delivery guarantees and require timing/cost confirmation before closing the order.
- After storefront freshness for `fa305b2` / `826927f` was proven, exactly one authenticated deployed six-prompt no-write RAG smoke rerun executed. All six prompts again returned visible no-write metadata, contract `customer_intelligence_no_write_v1`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks. The smoke remains PARTIAL / NEEDS TARGETED FIX because `unsupported_delivery_guarantee` still did not clearly refuse or qualify guaranteed next-day home delivery.
- `2443caa` added local/source retrieval/guard-gating hardening for that gap: unsupported next-day/home-delivery guarantee premises can now activate the successful RAG-path guard on DHL/shipping timing, cutoff, estimate, cost, coverage, or confirmation evidence even without OCURRE/no-domicilio chunks; timing-only evidence is framed as estimated/conditional and does not confirm guaranteed next-day/home delivery.
- `caec050` normalized the local static RAG seed corpus for payment/shipping consistency. `politica-pagos-v2` no longer claims MercadoPago/cards/cash as active accepted static policy and now preserves transfer/deposit-only operational policy. The detailed national shipping-cost seed no longer states fixed `$150-$180 MXN` as settled policy and now frames cost as calculated by weight/destination/coverage and confirmed before closing. DHL Express to sucursal OCURRE and no-domicilio policy remain preserved.
- `7fb0a77` added a local source/workflow/test path for future targeted `store_knowledge` ingestion. `seed_runner.ts` accepts `--sources=` comma-separated source IDs, processes exactly the listed seed documents, preserves missing-allowlist all-doc ingestion behavior, and fails safely for unknown source IDs before insert/update/deactivation. The manual `Run Knowledge Ingestion` workflow remains `workflow_dispatch` and adds optional `source_ids` input that passes `--sources=$SOURCE_IDS` only when provided. No workflow run, ingestion, DB mutation, deploy, Supabase CLI, live smoke, auth/browser/storage action, or secret inspection occurred.
- `05e3401` locally hardened `seed_runner.ts` so chunks/embeddings are prepared before deactivation and previous active rows are only deactivated after inserted row IDs exist.
- Failed run `25947955038` is accepted only as failure-mode safety evidence: Gemini `403 PERMISSION_DENIED` blocked embedding generation, the run failed non-zero, and logs reported previous active rows untouched.
- Post-Gemini-repair run `25969669995` passed and post-run read-only validation found `41` active embedded `768d` rows eligible for `match_knowledge`.

## Key Validation / Evidence
- Active corpus after repair: `133` total rows, `41` active rows, `41` active embedded rows, `0` inactive embedded rows.
- Post-Gemini-repair validation: `174` total rows, `41` active rows, `82` embedded rows, `41` active embedded rows, `41` inactive embedded rows.
- Active categories after post-Gemini-repair ingestion remained seed-aligned: `faq`, `onboarding`, `payments`, `policies`, `shipping`, `vape_basics`.
- Direct retrieval smoke used read-only REST/RPC posture and did not use write endpoints.
- Scoped RAG answer-quality harness `3f7bb4b`: targeted Vitest PASS for `src/lib/__tests__/knowledge-rag-capsule.test.ts` and `src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts` with 2 files / 11 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 3f7bb4b^ 3f7bb4b` PASS; commit-diff secret-pattern scan `NO_SECRET_PATTERN_MATCHES`.
- Multi-prompt no-write RAG quality trigger `3f61e13`: targeted Vitest PASS for `src/hooks/__tests__/useAIConcierge.test.tsx` and `src/components/ui/ai/__tests__/AIConcierge.test.tsx` with 2 files / 46 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check 3f61e13^ 3f61e13` PASS; commit-diff secret-pattern scan found no secret values, only negative test assertions.
- No-write error metadata preservation `7905b60`: targeted Vitest PASS for `src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`, `src/services/__tests__/concierge.service.knowledge-harness.test.ts`, and `src/hooks/__tests__/useAIConcierge.test.tsx` with 3 files / 25 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check 7905b60^ 7905b60` PASS; commit-diff secret scan found no raw secret values.
- Unsupported delivery guarantee answer-shaping `9637596`: targeted Vitest PASS for `src/lib/__tests__/knowledge-rag-capsule.test.ts` and `src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts` with 2 files / 13 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 9637596^ 9637596` PASS; commit-diff secret scan found no secret-like values.
- Payment/shipping-cost no-write RAG smoke path hardening `cb6311e`: targeted Vitest PASS for `src/lib/__tests__/customer-intelligence-turn-first.test.ts`, `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`, `src/hooks/__tests__/useAIConcierge.test.tsx`, and `src/services/__tests__/concierge.service.knowledge-harness.test.ts` with 4 files / 70 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check cb6311e^ cb6311e` PASS; commit-diff secret scan found no secret-like values.
- Partial deployed six-prompt no-write RAG smoke evidence: all six prompts showed visible no-write audit metadata and `3` resolved chunks, but answer-quality classification remained partial because `unsupported_delivery_guarantee` needed successful-path fixing at smoke time, `store_hours_limitation` was weak, and payment/shipping policy consistency residuals remain.
- Unsupported delivery guarantee successful RAG-path hardening `826927f`: targeted Vitest PASS for `knowledge-rag-capsule.test.ts`, `customer-intelligence-policy-degraded-fallback.test.ts`, and `concierge.service.knowledge-harness.test.ts` with 3 files / 19 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 826927f^ 826927f` PASS; commit-diff secret scan `COMMIT_DIFF_NO_SECRET_PATTERN_MATCHES`.
- fa305b2 deployed six-prompt no-write RAG smoke partial evidence: runtime `fa305b2` / `v113-fa305b2`, deployed assets with `826927f` and no-write trigger/audit markers, all six prompts with visible no-write audit metadata and `3` resolved chunks. `unsupported_delivery_guarantee` remained NEEDS FIX because the live result retrieved timing-estimate / same-day cutoff / local delivery chunks instead of OCURRE/no-domicilio evidence needed by the guard.
- Unsupported delivery guarantee retrieval guard hardening `2443caa`: targeted Vitest PASS for `knowledge-rag-capsule.test.ts`, `customer-intelligence-policy-degraded-fallback.test.ts`, and `concierge.service.knowledge-harness.test.ts` with 3 files / 20 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 2443caa^ 2443caa` PASS; commit-diff secret scan `COMMIT_DIFF_NO_SECRET_PATTERN_MATCHES`.
- Payment/shipping static RAG corpus normalization `caec050`: focused Vitest PASS for `src/hooks/__tests__/useAIConcierge.test.tsx`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, and `src/lib/__tests__/knowledge-rag-capsule.test.ts` with 3 files / 62 tests; `git diff --check` PASS with only Git line-ending warnings. No docs/canon, workflow, deploy, Supabase CLI, DB work, ingestion, live smoke, auth/browser/storage, cache/service-worker, or secret inspection occurred in the implementation/validation lane.
- Targeted knowledge ingestion source allowlist `7fb0a77`: focused Vitest PASS for `src/__tests__/seed_runner.test.ts` with 1 file / 8 tests; `npm run typecheck` PASS; `git diff --check` PASS. Changed only `supabase/seeds/seed_runner.ts`, `.github/workflows/ingest-knowledge.yml`, and `src/__tests__/seed_runner.test.ts`.

## Non-Claims / Residuals
- No full RAG quality proof.
- The partial six-prompt smoke proves deployed trigger execution and visible no-write suppression metadata for that one run, not all-routes customer-intelligence safety.
- No DB transaction-log mutation absence proof.
- Payment/shipping policy corpus consistency is accepted only at local source/test level after `caec050`; deployed DB `store_knowledge` corpus consistency remains unproven until a separate ingestion/DB verification lane.
- `7fb0a77` is accepted only as a future targeted ingestion path; it does not run the workflow, mutate DB rows, or apply the normalized `caec050` corpus to deployed `store_knowledge`.
- Unsupported delivery-guarantee successful client-capsule RAG-path hardening is deployed/fresh at `fa305b2`, but live answer quality remains unaccepted under the latest retrieved timing-estimate chunk set.
- `2443caa` locally hardens that timing-estimate retrieval gap, but no deployed availability proof, live smoke success, or production answer-quality proof is claimed.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- `store_hours_limitation` is accepted with residual in the fa305b2 rerun: support/order-confirmation hours were returned, not broad store-opening proof.
- No Product Search quality proof.
- No production Cesarin answer-quality proof.
- No semantic completeness proof.
- No metadata cleanup.
- `metadata.embedding_dims` mismatch remains open.
- Retained inactive embedded rows remain as a non-blocking residual.
- No future-ingestion guarantee is claimed.
- No deployed DB `store_knowledge` rows changed from `caec050`; no ingestion was run.
- No deployed DB `store_knowledge` rows changed from `7fb0a77`; no targeted workflow/ingestion has run.
- MercadoPago infrastructure is not claimed absent; future activation should come from dynamic store settings or explicit business-policy change.
- No secret value exposure is claimed.
