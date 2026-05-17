# Store Knowledge Ingestion And Retrieval - May 2026

## Covered Lanes
- `store_knowledge` active corpus repair.
- Direct `match_knowledge` retrieval smoke.
- Local no-mutation Cesarin knowledge chunk visibility harness.
- Local no-mutation Cesarin service-level knowledge harness.
- Local deterministic scoped RAG answer-quality harness.
- Local/tested multi-prompt no-write RAG quality trigger.
- Local/tested no-write error metadata preservation.
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

## Non-Claims / Residuals
- No full RAG quality proof; `3f7bb4b` is scoped local deterministic policy/RAG harness coverage only.
- No deployed/runtime RAG quality proof from `3f61e13`; it is trigger readiness only.
- No deployed availability or live smoke rerun is claimed for `7905b60`.
- No proof is claimed that the original `payment_method` / `shipping_cost` runtime failures are fixed.
- No unsupported delivery-guarantee quality hardening is claimed.
- No Product Search quality proof.
- No production Cesarin answer-quality proof.
- No deployed/runtime RAG answer-quality proof from the local harness.
- No semantic completeness proof.
- No metadata cleanup.
- `metadata.embedding_dims` mismatch remains open.
- Retained inactive embedded rows remain as a non-blocking residual.
- No future-ingestion guarantee is claimed.
- No secret value exposure is claimed.
