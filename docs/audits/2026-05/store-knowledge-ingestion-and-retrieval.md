# Store Knowledge Ingestion And Retrieval - May 2026

## Covered Lanes
- `store_knowledge` active corpus repair.
- Direct `match_knowledge` retrieval smoke.
- Local no-mutation Cesarin knowledge chunk visibility harness.
- Local no-mutation Cesarin service-level knowledge harness.
- Store knowledge ingestion activation safety hardening.
- Ingest failure-mode safety observation.
- Post-Gemini-repair ingest verification.

## Accepted Facts
- Active-corpus repair restored table-level `match_knowledge` eligibility by setting exactly 41 preflight-selected inactive embedded rows to `is_active=true`.
- Direct `match_knowledge` retrieval smoke passed with five representative runtime-threshold queries.
- `7fbd3f1` added local no-mutation UI chunk visibility proof for mocked `knowledge_rag_foundation.resolved_chunks`.
- `a5a50af` added local no-mutation service-level proof that `conciergeService.chat` can return the expected knowledge capsule contract shape.
- `05e3401` locally hardened `seed_runner.ts` so chunks/embeddings are prepared before deactivation and previous active rows are only deactivated after inserted row IDs exist.
- Failed run `25947955038` is accepted only as failure-mode safety evidence: Gemini `403 PERMISSION_DENIED` blocked embedding generation, the run failed non-zero, and logs reported previous active rows untouched.
- Post-Gemini-repair run `25969669995` passed and post-run read-only validation found `41` active embedded `768d` rows eligible for `match_knowledge`.

## Key Validation / Evidence
- Active corpus after repair: `133` total rows, `41` active rows, `41` active embedded rows, `0` inactive embedded rows.
- Post-Gemini-repair validation: `174` total rows, `41` active rows, `82` embedded rows, `41` active embedded rows, `41` inactive embedded rows.
- Active categories after post-Gemini-repair ingestion remained seed-aligned: `faq`, `onboarding`, `payments`, `policies`, `shipping`, `vape_basics`.
- Direct retrieval smoke used read-only REST/RPC posture and did not use write endpoints.

## Non-Claims / Residuals
- No full RAG quality proof.
- No Product Search quality proof.
- No production Cesarin answer-quality proof.
- No semantic completeness proof.
- No metadata cleanup.
- `metadata.embedding_dims` mismatch remains open.
- Retained inactive embedded rows remain as a non-blocking residual.
- No future-ingestion guarantee is claimed.
- No secret value exposure is claimed.
