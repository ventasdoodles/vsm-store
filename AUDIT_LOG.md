# VSM STORE - AUDIT INDEX

> Compact chronological index of accepted audits and canon lanes.
> Full pre-split historical detail is preserved in `docs/archive/AUDIT_LOG_ARCHIVE_2026-05-16.md`.
> Focused current audit details live under `docs/audits/`.
> Do not turn this file back into a full audit transcript.

## Archive Rules
- Each new accepted lane gets one compact index entry here.
- Detailed evidence goes in `docs/audits/YYYY-MM/<lane>.md`.
- Current technical truth is summarized in `AI_CONTEXT.md`.
- Tactical storefront/Cesarin truth remains in `STORE_FRONT_AI_PILOT_CONTEXT.md`.
- No `AUDIT_LOG2.md` continuation file is allowed.

## Current Detailed Audit Files
- `docs/audits/README.md`
- `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`
- `docs/audits/2026-05/seed-runner-typecheck-strictness.md`
- `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`
- `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`
- `docs/audits/2026-05/github-actions-runtime-verification.md`
- `docs/audits/2026-05/admin-rpc-cancellation.md`

## Chronological Audit Index

| Date | Lane | Verdict | Implementation / Run | Canon | Detail |
|---|---|---|---|---|---|
| 2026-05-17 | Multi-prompt no-write RAG quality trigger | ACCEPT WITH RESIDUAL RISK | `3f61e13` | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-17 | Scoped local RAG answer-quality harness | ACCEPT WITH RESIDUAL RISK | `3f7bb4b` | current canon | `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` |
| 2026-05-17 | Post-deploy no-write customer-intelligence smoke | ACCEPT WITH RESIDUAL RISK | `626a730`, run `25980183647`, one deployed smoke | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-16 | No-write customer-intelligence smoke readiness | ACCEPT WITH RESIDUAL RISK | `0795c51` | `8e0dab7` | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-16 | Seed-runner typecheck strictness repair | ACCEPT WITH RESIDUAL RISK | `70ca5f2` | canonized before `8e0dab7` | `docs/audits/2026-05/seed-runner-typecheck-strictness.md` |
| 2026-05-16 | Cesarin knowledge main-message synthesis | ACCEPT WITH RESIDUAL RISK | `c65ba23` | canonized before `70ca5f2` | `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` |
| 2026-05-16 | Post-Gemini-repair knowledge ingestion verification | ACCEPT WITH RESIDUAL RISK | run `25969669995` | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | Ingest failure-mode safety observation | ACCEPT WITH RESIDUAL RISK for safety; NO-GO for successful runtime verification | run `25947955038` | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | Store knowledge ingestion activation safety hardening | ACCEPT WITH RESIDUAL RISK | `05e3401` | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | Cesarin knowledge service harness | ACCEPT WITH RESIDUAL RISK | `a5a50af` | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | Cesarin knowledge chunk visibility harness | ACCEPT WITH RESIDUAL RISK | `7fbd3f1` | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | Direct `match_knowledge` retrieval smoke | ACCEPT WITH RESIDUAL RISK | read-only smoke | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | `store_knowledge` active corpus repair | ACCEPT WITH RESIDUAL RISK | narrow REST PATCH | canonized | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-15 | `Run Knowledge Ingestion` runtime verification | ACCEPT WITH RESIDUAL RISK | run `25927827351` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05-15 | `graqle-sync` runtime verification | ACCEPT WITH RESIDUAL RISK | run `25925139071` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05-15 | `deploy-functions` runtime verification | ACCEPT WITH RESIDUAL RISK | run `25924147087` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05-15 | `supabase/setup-cli` pin | ACCEPT WITH RESIDUAL RISK | `d02e365` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05-15 | GitHub Actions Node 24 migration | ACCEPT WITH RESIDUAL RISK | `f7519f7`, run `25920238570` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05-15 | Cloudflare Pages manual deploy recovery | ACCEPT WITH RESIDUAL RISK | run `25918704188` | canonized | `docs/audits/2026-05/github-actions-runtime-verification.md` |
| 2026-05 | Admin RPC cancellation / remote admin residuals | mixed accepted/residual | see detail | canonized | `docs/audits/2026-05/admin-rpc-cancellation.md` |
| <= 2026-05-16 | Earlier storefront, checkout, admin, Cesarin OS, and product discovery lanes | historical canon | many | historical | `docs/archive/AUDIT_LOG_ARCHIVE_2026-05-16.md` |

## Active Non-Claims Carried Forward
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write `customer-intelligence` policy/shipping/payment smoke.
- Remote `customer-intelligence` smoke evidence is limited to that single deployed app-triggered no-write smoke.
- Edge HTTP no-write metadata evidence is limited to that single smoke and its visible sanitized audit block.
- No deployed availability or live execution is claimed for the multi-prompt no-write RAG quality trigger.
- No production Cesarin answer-quality proof.
- No full RAG quality proof; `3f7bb4b` is scoped local deterministic policy/RAG harness coverage only.
- No Product Search quality proof.
- No deployed/runtime RAG answer-quality proof from the local harness.
- No broad production readiness or all-routes `customer-intelligence` safety proof.
- No semantic completeness proof.
- No metadata cleanup.
- No fix for `metadata.embedding_dims`.
- No retained inactive embedded row cleanup.
- No DB/Supabase mutation, deploy, workflow run, ingestion rerun, live smoke, or secret exposure during doc/canon split.
