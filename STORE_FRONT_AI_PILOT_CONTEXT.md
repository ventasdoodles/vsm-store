# Storefront AI Pilot Context

Tactical current-state guide for the controlled rollout of the Cesarin AI assistant.

> This file is tactical. It is not the full audit archive.
> Current technical canon lives in `AI_CONTEXT.md`.
> Chronological audit index lives in `AUDIT_LOG.md`.
> Detailed audit evidence lives in `docs/audits/` and pre-split snapshots live in `docs/archive/`.

## Current Phase & Reliability
- Phase: 3.2C CLOSED - Pilot Readiness Gate PASS.
- Status: OPERATIONAL under the accepted controlled rollout posture.
- Storefront and Cesarin OS/admin coding fronts remain closed unless a new authorized prompt selects one.
- The accepted reliability/harness lanes are regression evidence, not authorization to broaden production claims.

## Current Cesarin Knowledge / Customer-Intelligence Truth
- `customer_intelligence_no_write_v1` exists as a local/tested no-write smoke-readiness contract for authenticated `concierge_chat` knowledge handoff.
- Under that explicit smoke contract, the path suppresses `ai_customer_memory` persistence, Edge `ai_analytics` insert, QA Judge invocation, and client/service capsule telemetry.
- Responses expose auditable `no_write_smoke` metadata.
- Scope mismatch is rejected instead of silently broadening suppression.
- Normal non-smoke behavior remains preserved when the contract is absent.
- Existing non-smoke `knowledge_rag_foundation` telemetry remains intact.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Current Knowledge RAG Local Harness Truth
- Local UI harness proves mocked `knowledge_rag_foundation.resolved_chunks` render as customer-visible content in `AIConcierge`.
- Local service harness proves `conciergeService.chat` can return the expected `knowledge_rag_foundation` contract shape with `resolved_chunks`.
- Local main-message synthesis improvement proves successful `knowledge_rag_foundation` results can synthesize a substantive customer-visible main message from the top resolved chunk while preserving chunks.
- These are local/no-mutation proofs only.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` and `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Current Retrieval / Ingestion Truth
- Direct `match_knowledge` retrieval smoke passed after active-corpus repair.
- Post-Gemini-repair `Run Knowledge Ingestion` run `25969669995` passed.
- `seed_runner.ts` has accepted local activation-safety hardening and later strictness repair; project-wide typecheck was green at `70ca5f2`.
- Retained inactive embedded rows remain as a non-blocking residual.
- `metadata.embedding_dims` mismatch remains open unless separately repaired.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` and `docs/audits/2026-05/seed-runner-typecheck-strictness.md`.

## Tactical Non-Claims
- No live retrieval-to-answer proof.
- No remote `customer-intelligence` smoke.
- No Edge HTTP no-write smoke execution.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No semantic completeness proof.
- No metadata cleanup.
- No retained inactive embedded row cleanup.
- No DB/Supabase mutation, deploy, workflow run, ingestion rerun, live smoke, or secret exposure is implied by the local harnesses.

## Tactical Operating Rules
- Do not reopen closed storefront/Cesarin waves by default.
- Do not infer production answer quality from local mocks.
- Do not run live smoke, DB/Supabase work, ingestion, deploy, or workflow commands without a separate explicit prompt.
- Keep customer-facing claims bounded to what was actually validated.
- Use `AI_CONTEXT.md` for current technical truth and `AUDIT_LOG.md` / `docs/audits/` for audit evidence.

## Historical Detail
- Pre-split full tactical snapshot: `docs/archive/STORE_FRONT_AI_PILOT_CONTEXT_ARCHIVE_2026-05-16.md`.
- Earlier storefront, checkout, admin, and Cesarin OS waves remain historical canon in the archive snapshot and compact audit index; they are not reopened by this tactical compaction.
