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
- fa305b2 live rerun: after storefront freshness for `fa305b2` / `826927f` was proven, exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke rerun executed through the same trigger. All six again showed `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, answer/main message present, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- Verdict for the fa305b2 rerun: PARTIAL / NEEDS TARGETED FIX. No-write coverage passed, but `unsupported_delivery_guarantee` still did not clearly refuse or qualify guaranteed next-day home delivery because the live result retrieved timing-estimate / same-day cutoff / local delivery chunks instead of OCURRE/no-domicilio evidence.
- Controlled 56e8ef4 valid-trigger run: after deployed freshness proved `gitShortHash` `56e8ef4`, runtime fingerprint `v113-56e8ef4`, and deployed pending/preflight markers, exactly one valid trigger open rendered normally, did not reproduce the prior blank page, and showed one pending/preflight audit row plus six `ok` category rows.
- Existing-tab answer capture for that run is ACCEPT WITH RESIDUAL RISK: `unsupported_delivery_guarantee` and `shipping_scope` are accepted; `payment_method`, `shipping_cost`, `combined_payment_shipping`, and `store_hours_limitation` remain accepted with residuals for payment corpus consistency, fixed-cost versus confirmation/estimate policy, and support-hours versus broad store-hours scope.
- `caec050` normalizes the local static RAG seed corpus for payment/shipping consistency: static payment policy is transfer/deposit-only, static shipping cost is calculated/estimated/confirmed before closing, and DHL OCURRE/no-domicilio policy remains preserved. This is local source/test proof only until a separate ingestion/DB lane updates and verifies deployed `store_knowledge`.
- `7fb0a77` adds a local source/workflow/test allowlist path for future targeted `Run Knowledge Ingestion`: `seed_runner.ts` accepts `--sources=`, the manual workflow has optional `source_ids`, and missing input preserves full ingestion behavior. This is not a workflow run, ingestion, DB mutation, or production corpus change.
- Targeted run `26124496125` used that allowlist on `main` with exactly `source_ids=politica-pagos-v2,politica-envios-detallada-v1` and succeeded. Post-run read-only verification accepts normalized active deployed rows for those two source IDs with `768d` Gemini embeddings, old payment/shipping conflicts absent, and adjacent source IDs apparently unchanged by count/timestamp sanity check.
- Read-only retrieval/RPC ranking after `26124496125` is ACCEPT WITH RESIDUAL RISK. `match_knowledge` with deployed `embeddings-processor`, threshold `0.5`, and count `3` retrieved normalized payment/shipping evidence for the relevant queries and did not surface old MercadoPago/cards/cash accepted-policy or fixed `$150-$180` shipping-cost claims as active accepted policy. Residuals remain because `combined_payment_shipping` did not surface `politica-pagos-v2` in top 3 and `unsupported_delivery_guarantee` did not surface explicit no-domicilio/OCURRE evidence in top 3.
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
- `826927f` adds local/source successful-path answer shaping for unsupported delivery guarantees in `knowledge_rag_foundation`: the guard uses query context plus shipping / DHL OCURRE / sucursal policy chunks to refuse or qualify next-day home-delivery guarantees and require timing/cost confirmation before closing the order.
- `826927f` is deployed/fresh in the `fa305b2` storefront bundle, but the latest live rerun shows the guard is still insufficient when retrieval returns timing-estimate chunks without OCURRE/no-domicilio evidence.
- `2443caa` adds local/source retrieval/guard-gating hardening for that timing-estimate gap: unsupported next-day/home-delivery guarantee premises can now be refused or qualified when retrieved chunks contain DHL/shipping timing, cutoff, estimate, cost, coverage, or confirmation evidence even without OCURRE/no-domicilio chunks. It preserves stronger DHL OCURRE / sucursal grounding when that evidence is present and does not change no-write trigger or metadata behavior.
- `cff68c1` adds stable non-secret public bundle markers for future no-write smoke freshness checks: `ci_no_write_smoke`, `ci_rag_quality_smoke`, `smoke_contract`, `customer_intelligence_no_write_v1`, `no_write_smoke`, `no_write_smoke_audit`, `edge_metadata_present`, and `request_contract_present`. Existing smoke trigger/audit code references these markers; the patch does not enable smoke, change trigger conditions, alter no-write metadata semantics, change the six-prompt allowlist, or affect normal customer-visible UI.
- `56e8ef4` adds deployed/fresh pending/preflight observability for the valid six-prompt trigger before first chat execution. The controlled valid-trigger run proved that pending row appears and that `unsupported_delivery_guarantee` now refuses/qualifies guaranteed next-day home delivery using estimated/conditional timing and before-close confirmation language for that one run.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` and `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Current Retrieval / Ingestion Truth
- Direct `match_knowledge` retrieval smoke passed after active-corpus repair.
- Post-Gemini-repair `Run Knowledge Ingestion` run `25969669995` passed.
- `seed_runner.ts` has accepted local activation-safety hardening and later strictness repair; project-wide typecheck was green at `70ca5f2`.
- `7fb0a77` adds accepted targeted source-id allowlist readiness, and run `26124496125` executed it successfully for `politica-pagos-v2` and `politica-envios-detallada-v1` only.
- Read-only retrieval/RPC ranking after that run is accepted with residual risk; it proves normalized corpus can be retrieved by `match_knowledge`, not generated answer quality.
- Retained inactive embedded rows remain as a non-blocking residual.
- `metadata.embedding_dims` mismatch remains open unless separately repaired.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` and `docs/audits/2026-05/seed-runner-typecheck-strictness.md`.

## Tactical Non-Claims
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write policy/shipping/payment smoke, the older partial six-prompt no-write RAG smokes, and the controlled deployed `56e8ef4` valid-trigger run.
- Remote `customer-intelligence` smoke evidence is limited to those explicitly described deployed app-triggered no-write smokes.
- The controlled `56e8ef4` run proves deployed trigger execution, preflight/pending observability, visible no-write audit rows, and bounded answer evidence for that one run, not all-routes safety.
- DB transaction-log mutation absence is not proven.
- Payment/shipping policy corpus consistency is accepted for local source/test after `caec050`, for deployed active target rows after run `26124496125`, and for read-only retrieval/RPC ranking with residual risk; runtime answer quality after ingestion remains unproven.
- The `26124496125` evidence covers only `politica-pagos-v2` and `politica-envios-detallada-v1`; it is not a full DB diff and does not prove inactive-row state.
- Unsupported delivery-guarantee successful client-capsule RAG-path behavior has accepted targeted deployed evidence in the controlled `56e8ef4` run; older `fa305b2` evidence remains historical partial evidence.
- `cff68c1` marker visibility and `56e8ef4` pending/preflight markers have deployed freshness evidence in the current controlled lane.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- Store-hours behavior is accepted with residual in the latest smoke: it returned WhatsApp/support/order-confirmation hours without proving general store-opening hours.
- No broad production Cesarin answer-quality proof beyond the bounded controlled `56e8ef4` six-prompt run.
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
