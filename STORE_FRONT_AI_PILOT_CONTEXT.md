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
- Post-deploy live smoke: after `626a730` added `customer-intelligence` to `deploy-functions` and workflow_dispatch run `25980183647` succeeded, exactly one authenticated deployed app-triggered no-write smoke returned `metadata: present`, contract `customer_intelligence_no_write_v1`, suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- That smoke proves the bounded policy/shipping/payment retrieval-to-answer path only; it does not prove production answer quality, full RAG quality, Product Search quality, or all customer-intelligence routes.
- Partial six-prompt live smoke: after storefront runtime `d50379e` / `v113-d50379e` and deploy-functions run `26000841773` confirmed current `customer-intelligence` freshness, exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke ran through the existing trigger.
- The six-prompt smoke executed only `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, and `unsupported_delivery_guarantee`; all six showed `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- Verdict for that smoke: PARTIAL / NEEDS TARGETED FIX. It proves deployed no-write audit coverage for the six-prompt set, but not production answer quality for all six prompts.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Current Knowledge RAG Local Harness Truth
- Local UI harness proves mocked `knowledge_rag_foundation.resolved_chunks` render as customer-visible content in `AIConcierge`.
- Local service harness proves `conciergeService.chat` can return the expected `knowledge_rag_foundation` contract shape with `resolved_chunks`.
- Local main-message synthesis improvement proves successful `knowledge_rag_foundation` results can synthesize a substantive customer-visible main message from the top resolved chunk while preserving chunks.
- `3f7bb4b` adds a scoped local deterministic RAG answer-quality harness for six policy/RAG categories: payment method, shipping scope, DHL shipping cost, combined payment/shipping, store-hours limitation, and unsupported delivery guarantee.
- The harness asserts grounded fixture text, correct policy recall, useful main message, resolved chunk support, bounded fallback/uncertainty, and absence of hallucinated payment/shipping claims.
- `3f61e13` adds a local/tested authenticated app trigger for a future multi-prompt no-write RAG quality smoke. It requires `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, and `ci_rag_quality_smoke=true`, runs only the six allowlisted RAG quality prompts, and calls `conciergeService.chat` with `{ noWriteSmoke: true }` for each request.
- Its sanitized audit output includes prompt/category, status, contract, suppression metadata, capsule, answer/main-message presence, match strategy, and resolved chunk count.
- `7905b60` adds local/tested no-write error metadata preservation for recognized `customer_intelligence_no_write_v1` paths: Edge error responses include sanitized `no_write_smoke` metadata, service preserves that metadata from error response bodies, client telemetry is suppressed for no-write error paths, and the hook renders metadata-present audit rows when available.
- `9637596` adds local deterministic unsupported delivery-guarantee answer-shaping through the narrow `unsupported_shipping_promise_limit` degraded policy fallback when shipping policy context exists. It says next-day guaranteed home delivery cannot be confirmed, grounds shipping to DHL OCURRE / sucursal, and says timing/cost must be confirmed before closing the order.
- `cb6311e` adds local/source hardening for the `payment_method` and `shipping_cost` no-write RAG smoke paths: under recognized `customer_intelligence_no_write_v1`, the exact prompts `¿Aceptan tarjeta o cómo puedo pagar?` and `¿Cuánto cuesta el envío por DHL?` are forced to `POLICY_INQUIRY` / `knowledge_rag_foundation` instead of `storefront_checkout_readiness`; normal checkout-readiness behavior remains intact for real checkout phrases such as `ya puedo pagar?`.
- `cb6311e` also updates sanitized no-write failure audit rows to distinguish `edge_metadata_present` from `request_contract_present`.
- `cb6311e`, `7905b60`, and `9637596` were present in deployed source for the partial six-prompt smoke, but answer-quality residuals remain.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` and `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Current Retrieval / Ingestion Truth
- Direct `match_knowledge` retrieval smoke passed after active-corpus repair.
- Post-Gemini-repair `Run Knowledge Ingestion` run `25969669995` passed.
- `seed_runner.ts` has accepted local activation-safety hardening and later strictness repair; project-wide typecheck was green at `70ca5f2`.
- Retained inactive embedded rows remain as a non-blocking residual.
- `metadata.embedding_dims` mismatch remains open unless separately repaired.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` and `docs/audits/2026-05/seed-runner-typecheck-strictness.md`.

## Tactical Non-Claims
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write policy/shipping/payment smoke and the later partial six-prompt no-write RAG smoke.
- Remote `customer-intelligence` smoke evidence is limited to those explicitly described deployed app-triggered no-write smokes.
- The partial six-prompt smoke proves deployed trigger execution and visible no-write suppression metadata for that one run, not all-routes safety or full answer quality.
- DB transaction-log mutation absence is not proven.
- No claim is made that the payment/shipping policy corpus is internally consistent.
- Unsupported delivery-guarantee successful live RAG/Sommelier behavior still needs targeted fixing; `9637596` covered only deterministic degraded fallback.
- Store-hours behavior remains weak and needs clearer bounded not-found / ask-WhatsApp behavior.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No broad production readiness or all-routes `customer-intelligence` safety proof.
- No semantic completeness proof.
- No metadata cleanup.
- No retained inactive embedded row cleanup.
- No DB/Supabase mutation, deploy, workflow run, ingestion rerun, or secret exposure is implied by this canon update; live smoke claims are limited to the explicitly described runs.

## Tactical Operating Rules
- Do not reopen closed storefront/Cesarin waves by default.
- Do not infer production answer quality from local mocks.
- Do not run live smoke, DB/Supabase work, ingestion, deploy, or workflow commands without a separate explicit prompt.
- Keep customer-facing claims bounded to what was actually validated.
- Use `AI_CONTEXT.md` for current technical truth and `AUDIT_LOG.md` / `docs/audits/` for audit evidence.

## Historical Detail
- Pre-split full tactical snapshot: `docs/archive/STORE_FRONT_AI_PILOT_CONTEXT_ARCHIVE_2026-05-16.md`.
- Earlier storefront, checkout, admin, and Cesarin OS waves remain historical canon in the archive snapshot and compact audit index; they are not reopened by this tactical compaction.
