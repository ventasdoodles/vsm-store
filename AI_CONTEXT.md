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
- Latest post-split accepted canon lane: controlled six-prompt no-write RAG validation after targeted ingestion `26124496125` and retrieval/RPC canon `1510d84`, verdict ACCEPT WITH RESIDUAL RISK, bounded runtime answer/chunk evidence accepted for one trigger with residual main-message limits.
- Known local artifacts outside canon scope: `supabase/.temp/cli-latest` and `supabase/.branches/`.
- Cloudflare Pages native Git integration remains the primary deploy path; the GitHub Actions Pages workflow remains manual-only unless canon changes.
- Operating model: ChatGPT orchestrates, Codex audits/readiness/acceptance, Antigravity implements/validates/commits/pushes/canonizes when authorized, and the user is final judge.
- Gemini / Google AI / Vertex AI implementation decisions must use official Google documentation and recommendations as the primary technical authority for the integration surface only (API request shape, SDK/API usage, `generationConfig`, `response_mime_type`, `response_schema`, structured output, tools/function calling, model selection, provider limits, and compatibility). This does not make Gemini the project orchestrator and does not override the work-kit roles or Codex acceptance. Deviations from Google-recommended patterns must be explicit, justified, locally tested when possible, and accepted by Codex.
- Documentation alone does not prove provider compatibility, production behavior, deploy readiness, secret safety, live-smoke readiness, or runtime correctness. The accepted local Analyst `response_schema` preservation still needs a later explicitly authorized provider-validation lane before production confidence.

## Current Product / Runtime Truth
- VSM Store is a PWA storefront/admin system for Vape / 420 commerce with Cesarin as the AI concierge.
- Storefront and Cesarin OS/admin coding fronts are not reopened by default. Closed lanes stay closed unless a new prompt explicitly selects one with evidence.
- The storefront/customer-intelligence path has accepted local harnesses for `knowledge_rag_foundation` chunk visibility, service-level knowledge handoff, main-message synthesis, scoped RAG answer-quality fixtures, seed-runner activation safety, seed-runner strictness, and no-write smoke readiness.
- Direct `match_knowledge` retrieval has accepted read-only evidence after the active-corpus repair and after targeted ingestion `26124496125`; the later controlled six-prompt no-write trigger accepts bounded runtime answer evidence for that one run only, not Product Search, all-routes safety, or broad production readiness.
- Product Search integrity micro-fix `ba2e39a` (`test: narrow product search compatibility wording`) is accepted with residual risk: `product_search_integrity` direct compatibility fact wording now frames spec/catalog evidence as ficha-grounded (`La ficha de ... indica compatibilidad con ...`) instead of graph-like certainty (`... es compatible con ...`), protecting that compatibility confidence must not exceed grounded relation strength; this is not broad Product Search quality, global compatibility correctness, `storefront_compatibility_check` relation-quality, production-runtime, or all-routes customer-intelligence proof.
- Product Search query-construction safety patch `cd9ac1e` (`test: harden product search query construction`) is ACCEPTED WITH RESIDUAL RISK: `searchProducts` now only emits `tags.cs.{...}` for trimmed letter/number/hyphen tag values, unsafe punctuation/commas/braces/`%`/`_` do not enter the Supabase tag contains filter, empty or unsafe tag input does not create a malformed `tags.cs` filter, and existing `name` / `short_description` / `description` / `sku` `ilike` behavior remains preserved with `%` and `_` escaping. Accepted validation: `git diff --check cd9ac1e^ cd9ac1e` passed and the bounded `search.service.test.ts` Vitest run passed (`1` file / `3` tests). Residuals: full typecheck was not run; tests do not explicitly pin whitespace-trimmed valid tags or Unicode tag values; the regex permits Unicode letters/numbers, not ASCII-only `[A-Za-z0-9-]`. This is not production Product Search proof, DB/Supabase runtime verification, semantic search proof, compatibility graph proof, deploy proof, provider/Gemini proof, live smoke, or auth/session/storage/secret proof.
- Mercado Pago webhook contract hardening `3c2e5f2` (`test: harden mercadopago webhook contract`) is ACCEPT WITH RESIDUAL RISK as local dependency-injected contract proof only: approved payment maps to `payment_status=paid` / `status=processing`, `mp_payment_id` and `mp_payment_data` are preserved in the local contract update payload, rejected/cancelled/refunded mappings are locally covered, non-payment or missing-ID and missing `external_reference` paths are locally covered safely, and duplicate already-paid `payment_completed` conversion events are locally idempotent. Vitest discovery now includes Supabase function tests, and the Product Search test-only typecheck blocker was fixed without Product Search runtime changes. Accepted validation: webhook contract test PASS (`1` file / `6` tests), bounded checkout/payment suite PASS (`5` files / `68` tests), `npm run typecheck` PASS, and `git diff --check 3c2e5f2^ 3c2e5f2` PASS. Residuals: webhook still returns `200 OK` on caught errors, there is no provider signature/origin verification, order update remains unconditional by `orderId`, Supabase update/insert errors are not surfaced by the adapter, and evidence is local contract/test proof only. This is not live Mercado Pago/provider proof, Supabase DB proof, deploy/live-smoke proof, Edge runtime proof, webhook signature/origin proof, production payment correctness proof, or auth/session/storage/secret inspection.
- Customer-intelligence recovery + Typewriter UX block is accepted with residual risk through commits `d69dc05`, `5f4d169`, `059e3e5`, `ebae4bf`, and `6ad7f31`. Current compact truth: malformed non-array Analyst `tool_calls` no longer silently coerce to `[]` and instead route through sanitized metadata plus neutral Analyst fallback; Analyst `response_mime_type` / `response_schema` are preserved by local source-guarded tests, without provider/Gemini acceptance proof; Google-first Gemini architecture rule is canon for Gemini / Google AI / Vertex AI integration details only; token telemetry is persisted/logged as sanitized token metadata only while no-write smoke suppression still blocks `ai_analytics`; the latest assistant reply renders through local Typewriter UX while older assistant and user messages render full text.
- Accepted validation for that block is local and bounded: parser/schema/token telemetry local tests, typecheck, and full suites were accepted as reported; Typewriter local tests/full suite plus bounded local Vite visual QA support the latest assistant welcome animation. This block did not deploy, run live smoke, change secrets, call providers/Gemini, prove production runtime behavior, prove deployed bundle behavior, prove Analyst provider-side `response_schema` compatibility, or visually prove real chat send-flow / older assistant / user-message browser states.
- Local Typewriter visual validation after the block is ACCEPTED WITH RESIDUAL RISK: focused Typewriter/frontend Vitest passed (`src/hooks/__tests__/useTypewriter.test.tsx` + `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, `2` files / `33` tests), and local browser QA used local Vite at `http://127.0.0.1:5174/?pilot=cesarin` with process-local dummy public env placeholders plus a process-local dummy endpoint at `127.0.0.1:59999`. Accepted local evidence: latest assistant welcome and simulated latest assistant response animated progressively and completed; simulated send-flow through the visible send button worked; user text rendered full immediately; the prior assistant welcome remained full text after the new assistant response; chat panel stayed anchored with input visible and no obvious overlap/broken layout. This is not deployed bundle proof, production runtime proof, real backend/customer-intelligence send-flow proof, Supabase/DB proof, Gemini/provider proof, authenticated-session proof, full responsive/browser matrix proof, or typecheck proof.
- Public bundle freshness validation for Typewriter is ACCEPTED WITH RESIDUAL RISK as static deployed evidence only: `https://vsm-store.pages.dev/runtime-build.json` reported `gitShortHash` `11e9f71`, `runtimeBuildFingerprint` `v113-11e9f71`, `canonBaseBuild` `v113`, `bundleBuildTimestamp` `2026-05-22T15:06:30.412Z`, and `manifestGeneratedAt` `2026-05-22T15:06:30.413Z`. The deployed public static bundle is stale versus latest canon `bf2f3a7`, but `6ad7f31` is an ancestor of deployed `11e9f71`, and the public AIConcierge chunk contained Typewriter markers (`setInterval`, `clearInterval`, `displayedText`, `isTyping`, `slice(0)`, `Que onda`, speed `3`, interval `12`). This proves static bundle inclusion for the Typewriter implementation only; it does not prove latest-canon deployment, runtime UX behavior, production visual behavior, chat send-flow, backend/customer-intelligence behavior, Supabase/DB behavior, Gemini/provider behavior, authenticated-session behavior, live smoke, or service-worker activation for real client sessions.
- Pages static 500 fix is ACCEPTED WITH RESIDUAL RISK at `47862ae` (`chore: force pages deploy asset reupload`): only `.github/workflows/deploy-pages.yml` changed, adding `--skip-caching` to the existing manual `wrangler pages deploy dist` command. Before the fix, repeated manual Pages deploys at `011233e` produced current `runtime-build.json` but `/` and Vite JS assets returned HTTP 500 while Wrangler reused cached assets (`Uploaded 1 files (361 already uploaded)`). Post-fix run `26300707725` on head SHA `47862aeb32d4a2d55cd9a4cbcc7440d706a47c4e` succeeded, logged `--skip-caching`, uploaded `362/362`, emitted `https://e6548488.vsm-store.pages.dev`, and public static checks on both production alias and unique deployment passed for `/`, `runtime-build.json`, `manifest.json`, `sw.js?v=v113-47862ae`, current JS/CSS assets, `robots.txt`, `sitemap.xml`, and `/offline`; `/index.html` redirects `308 -> /`. Public runtime manifest reports `gitShortHash` `47862ae` and `runtimeBuildFingerprint` `v113-47862ae`, and the current public AIConcierge chunk contains Typewriter static markers (`setInterval`, `clearInterval`, `displayedText`, `isTyping`, `slice(0)`, `Que onda`, `,3,12`). This proves static serving/freshness only, not production visual QA, chat send-flow, customer-intelligence smoke, backend/customer-intelligence behavior, Supabase/DB, Gemini/provider, authenticated-session behavior, service-worker activation for existing clients, or runtime UX/chat/backend behavior.
- Production Typewriter visual QA is ACCEPTED WITH RESIDUAL RISK as bounded production UI evidence on public bundle `v113-5e4f8ee`: `runtime-build.json` reported `gitShortHash` `5e4f8ee`, which is fresher than `47862ae` and includes the Pages static fix by ancestry. The only production URL opened was `https://vsm-store.pages.dev/?pilot=cesarin`, which normalized to `/`; no smoke trigger URL was opened and no chat message was typed or sent. Accepted visual evidence: storefront shell loaded with title `Inicio | VSM Store`, nonblank product/home content was visible, the AI Concierge panel opened from the visible blue bot control, the latest assistant welcome Typewriter animation progressed from partial `... inventarte cos` to complete `... inventarte cosas.`, the panel stayed visible/anchored on the left side, the chat input remained visible with placeholder `Preguntame lo que sea...`, and no obvious overlap, blank page, or broken layout was observed in that desktop panel state. This does not prove chat send-flow, real assistant response-after-send, customer-intelligence smoke, backend/customer-intelligence behavior, DB/Supabase, Gemini/provider, authenticated flow, service-worker activation for existing clients, responsive/browser matrix coverage, secret/session/storage inspection, or production behavior beyond the observed storefront shell, panel open, welcome animation, visible input, and no obvious desktop layout break.
- `Run Knowledge Ingestion` has a post-Gemini-repair PASS at run `25969669995`; the earlier failed run `25947955038` remains historical failure-mode safety evidence only.

## Latest Accepted Lane: Controlled Six-Prompt No-Write RAG Validation After Targeted Ingestion
- Validation target: existing deployed app trigger `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true` after targeted ingestion run `26124496125` and retrieval/RPC canon `1510d84`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Execution evidence accepted: an existing authenticated browser session was present; the trigger URL was opened exactly once; no reload, retry, second trigger, login, storage inspection, manual extra prompt, workflow, deploy, Supabase CLI, DB mutation, ingestion, cache clear, service-worker unregister, or secret inspection occurred; title `VSM Store`, `document.readyState=complete`, and sanitized console warnings/errors `0`.
- Visible audit evidence: one pending/preflight row for `rag_quality_smoke` and six `ok` prompt rows for `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, and `unsupported_delivery_guarantee`.
- No-write metadata accepted for all six prompt rows: metadata present, contract `customer_intelligence_no_write_v1`, suppressed writes `ai_customer_memory` and `ai_analytics`, suppressed call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, answer/main message present, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- Per-prompt verdicts: `payment_method` ACCEPT WITH RESIDUAL RISK because no MercadoPago/cards/cash active accepted-policy claim appeared and transfer/deposit grounding was visible in chunks, but the main text was terse/truncated; `shipping_scope` ACCEPT for DHL OCURRE/sucursal and no domicilio; `shipping_cost` ACCEPT for calculated-by-weight/destination/coverage and confirmed-before-closing language with no fixed `$150-$180` settled national policy; `combined_payment_shipping` ACCEPT WITH RESIDUAL RISK because normalized chunks include transfer/deposit, DHL OCURRE/no domicilio, and variable/calculated shipping, while the main answer foregrounded payment more than shipping; `store_hours_limitation` ACCEPT WITH RESIDUAL RISK as non-focus support/order-confirmation hours only; `unsupported_delivery_guarantee` ACCEPT because it refused/qualified guaranteed next-day home delivery and kept timing/cost estimated, conditional, or confirmed before closing.
- Accepted bounded claim: payment/shipping runtime answer/chunk evidence reflects the normalized corpus for this one controlled trigger, and old MercadoPago/cards/cash active accepted-policy plus fixed `$150-$180` settled shipping-cost conflicts were not present in the accepted runtime evidence.
- Non-claims preserved: no DB transaction-log mutation absence proof, Product Search proof, all-routes customer-intelligence safety proof, broad production readiness, inactive-row state proof, auth/session/storage/secret proof, broad Cesarin runtime proof, full RAG quality proof, or semantic completeness proof.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Latest Accepted Lane: Read-Only Retrieval/RPC Ranking After Targeted Ingestion
- Verification target: production `match_knowledge` through deployed `embeddings-processor`, target host metadata only `cvvlorbiwtuhkxolhfie.supabase.co`.
- Parameters: `match_threshold=0.5`, `match_count=3`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- `payment_method`: ACCEPT. Rank 1 returned `politica-pagos-v1`; ranks 2-3 returned normalized `politica-pagos-v2`; transfer/deposit language and negative/qualifying card/cash/PayPal text were present.
- `combined_payment_shipping`: ACCEPT WITH RESIDUAL. Rank 1 returned `politica-pagos-v1`; rank 3 returned `guia-onboarding-v1`; normalized payment plus DHL OCURRE evidence appeared, but `politica-pagos-v2` did not appear in top 3.
- `shipping_cost`: ACCEPT. Rank 1 returned `politica-envios-detallada-v1` with similarity `0.752457` and calculated by weight/destination/coverage plus confirmed-before-closing language.
- `shipping_scope`: ACCEPT. Rank 1 returned `politica-envios-v1` with OCURRE/no-home-delivery evidence; ranks 2-3 returned `politica-envios-detallada-v1`.
- `unsupported_delivery_guarantee`: ACCEPT WITH RESIDUAL for retrieval evidence only. Top matches included timing/cutoff/estimate evidence and `politica-envios-detallada-v1` local cost/time confirmation, but no explicit no-domicilio/OCURRE chunk appeared in top 3.
- Old conflict absence accepted for top matches: no MercadoPago/cards/cash accepted active payment policy and no fixed `$150-$180` / `fijo` settled national shipping-cost claim appeared as accepted active policy. Card/cash/PayPal wording in `politica-pagos-v2` is negative/qualifying.
- This lane did not mutate DB, run ingestion, run workflow, deploy, run live smoke, expose secrets, prove no-write behavior, prove Product Search, prove all-routes customer-intelligence safety, prove inactive-row state, or prove broad production readiness. Runtime answer quality was addressed later only by the bounded six-prompt no-write trigger lane above.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Accepted Lane: Targeted Knowledge Ingestion Run
- Workflow run: `26124496125` (`Run Knowledge Ingestion`, `workflow_dispatch`) on `main` at `ae34c110013213c15669d47dd6fc8fe5c051d7bb`.
- Input exactly: `source_ids=politica-pagos-v2,politica-envios-detallada-v1`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Sanitized logs showed the source allowlist, processed exactly `politica-pagos-v2` and `politica-envios-detallada-v1`, inserted `4` active replacement chunks for each, deactivated previous rows for each target, and finished with `Documents processed: 2`, `Documents ok: 2`, `Documents failed: 0`.
- Post-run read-only verification accepted active target rows for `politica-pagos-v2`: `4` active rows, `4` active embedded rows, `metadata.embedding_dims=768`, `metadata.embedding_model=models/gemini-embedding-001`, latest created/updated `2026-05-19T20:50:47.218463+00:00`, normalized transfer/deposit-only payment language present, and old MercadoPago/cards/cash accepted-payment claims absent.
- Post-run read-only verification accepted active target rows for `politica-envios-detallada-v1`: `4` active rows, `4` active embedded rows, `metadata.embedding_dims=768`, `metadata.embedding_model=models/gemini-embedding-001`, latest created/updated `2026-05-19T20:50:48.909625+00:00`, calculated/confirmed-before-closing shipping-cost language present, DHL Express to sucursal OCURRE language present, and old fixed `$150-$180` / `fijo` settled national shipping-cost claim absent.
- Adjacent source IDs `politica-pagos-v1`, `guia-onboarding-v1`, and `politica-envios-v1` appeared unchanged by active row count, embedding count, dims/model, and older timestamps; this is sanity evidence, not a complete DB diff.
- This run did not deploy, run live smoke, run Supabase CLI, expose secrets, prove Product Search, prove all-routes customer-intelligence safety, prove inactive-row state, or prove broad production readiness. Retrieval/RPC ranking and then bounded no-write runtime answer evidence were accepted later with residual risk in separate lanes.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Accepted Lane: Read-Only Metadata Dims Observer
- Observer tooling commit `8eb02af` (`tooling: add read-only store knowledge metadata observer`) and credential-requirements canon `debb6c1` were accepted with residual risk before execution.
- A later same-shell, read-only observer execution completed successfully with `node scripts/db-observation/store-knowledge-metadata-dims-observer.mjs --observe --allow-remote-db-read` after the no-DB self-check passed. No DB mutation, cleanup, ingestion, Supabase CLI, deploy, workflow, live smoke, file edit, staging, commit, push, or secret exposure occurred in that observation lane.
- Current observed `store_knowledge` rows are accepted as aligned to `metadata.embedding_dims=768`: `totalRows=41`, `activeWith768=41`, `activeWith3072=0`, `activeMissingDims=0`, `inactiveWith768=0`, `inactiveWith3072=0`, and `inactiveMissingDims=0`.
- Target source status from the observer: `politica-envios-detallada-v1` has `4` active embedded rows with derived embedding dimension `768`, `metadata.embedding_dims=768`, and `metadata.embedding_model=models/gemini-embedding-001`; `politica-pagos-v2` has `4` active embedded rows with derived embedding dimension `768`, `metadata.embedding_dims=768`, and `metadata.embedding_model=models/gemini-embedding-001`.
- Classification: the prior `metadata.embedding_dims` residual is accepted as observed resolved for current rows, and retained inactive embedded rows are accepted as observed absent for the current observer result. This does not prove future DB state, semantic content correctness, Product Search quality, Cesarin runtime behavior, production readiness, cleanup, ingestion, deploy, workflow, or live-smoke behavior.

## Accepted Lane: Targeted Knowledge Ingestion Source Allowlist
- Implementation commit: `7fb0a77` (`ci: add targeted knowledge ingestion source allowlist`).
- Changed files: `supabase/seeds/seed_runner.ts`, `.github/workflows/ingest-knowledge.yml`, and `src/__tests__/seed_runner.test.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- This is a local source/workflow/test patch that adds a future exact source-id allowlist path for `Run Knowledge Ingestion`.
- `seed_runner.ts` now accepts `--sources=` with comma-separated source IDs, trims entries, processes exactly the listed seed documents, preserves missing-allowlist full-ingestion behavior, and fails safely for unknown source IDs before insert/update/deactivation.
- The manual `Run Knowledge Ingestion` workflow remains `workflow_dispatch`; it now has optional `source_ids` input and passes `--sources=$SOURCE_IDS` only when the input is non-empty.
- Seed-runner safety semantics remain preserved: selected docs prepare chunks/embeddings before replacement, insert active replacement rows before deactivating previous active rows, deactivate previous active rows only after inserted IDs exist, and fail non-zero if any selected source fails.
- Validation accepted: `npm run test:run -- src/__tests__/seed_runner.test.ts` PASS with 1 file / 8 tests; `npm run typecheck` PASS; `git diff --check` PASS.
- This patch by itself did not run a workflow, ingestion, Supabase CLI, DB mutation, deploy, live smoke, auth/browser/storage action, or secret inspection. Later run `26124496125` used this path for the two accepted payment/shipping targets.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Accepted Lane: Payment / Shipping Static RAG Corpus Normalization
- Implementation commit: `caec050` (`test: normalize payment shipping RAG corpus policy`).
- Changed files: `supabase/seeds/seed_knowledge.ts`, `src/hooks/__tests__/useAIConcierge.test.tsx`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- This is a local source/test normalization for the static RAG seed corpus after the controlled `56e8ef4` run exposed payment/shipping corpus inconsistency.
- Static RAG payment corpus no longer claims MercadoPago/cards/cash as active accepted policy; it preserves transfer/deposit-only operational policy.
- Static RAG shipping-cost corpus no longer states fixed `$150-$180 MXN` as settled national shipping policy; it frames cost as calculated/estimated/confirmed before closing order.
- DHL Express to sucursal OCURRE and no-domicilio policy remain preserved.
- Validation accepted: focused Vitest PASS with 3 files / 62 tests for `src/hooks/__tests__/useAIConcierge.test.tsx`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, and `src/lib/__tests__/knowledge-rag-capsule.test.ts`; `git diff --check` PASS with only Git line-ending warnings.
- This does not mutate deployed `store_knowledge` rows, run ingestion, run Supabase CLI, deploy, run workflows, run live smoke, or prove deployed runtime behavior. MercadoPago infrastructure is not claimed absent; any future MercadoPago policy should come from dynamic store settings or an explicit policy change.
- Detail: `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md`.

## Accepted Lane: Controlled 56e8ef4 Valid-Trigger No-Write RAG Evidence
- Deployed baseline: `56e8ef4` (`test: add no-write smoke preflight audit state`).
- Freshness before validation: public `runtime-build.json` returned `gitShortHash` `56e8ef4` and `runtimeBuildFingerprint` `v113-56e8ef4`; deployed AIConcierge lazy chunk contained pending/preflight markers including `No-write RAG quality smoke pending`, `six-prompt audit armed`, `status:"pending"`, `rag_quality_smoke`, and `authenticated_session_required`.
- Exactly one deployed app-triggered valid no-write RAG trigger was opened: `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true`.
- The page rendered normally, stayed on the valid trigger URL, did not reproduce the prior blank-render symptom, and produced no sanitized console warnings/errors.
- Seven visible audit rows were observed: one pending/preflight row for `rag_quality_smoke`, plus six `ok` rows for `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, and `unsupported_delivery_guarantee`.
- Existing-tab answer capture accepted answer text for the same six rows without reload, retry, second trigger open, auth flow, browser login, storage/cookie/localStorage/token/auth-header/password/key/env inspection, cache clear, service-worker unregister, workflow, deploy, Supabase CLI, DB work, ingestion, implementation, test change, or secret exposure.
- Per-prompt quality classification for this bounded run: `unsupported_delivery_guarantee` ACCEPT; `shipping_scope` ACCEPT; `payment_method` ACCEPT WITH RESIDUAL due MercadoPago/cards versus transfer/deposit-only corpus inconsistency; `shipping_cost` ACCEPT WITH RESIDUAL due fixed `$150-$180 MXN` range versus confirmation/estimate expectation; `combined_payment_shipping` ACCEPT WITH RESIDUAL due payment corpus inconsistency; `store_hours_limitation` ACCEPT WITH RESIDUAL because it returned WhatsApp/support/order-confirmation hours Monday-Saturday 10:00 AM-7:00 PM, not broad store-opening proof.
- `unsupported_delivery_guarantee` now passes the targeted deployed runtime expectation after `2443caa`: it refuses or qualifies guaranteed next-day/home delivery, frames DHL timing as estimated/conditional, and says timing/costs are confirmed before closing the order.
- Verdict: ACCEPT WITH RESIDUAL RISK. This accepts deployed trigger observability, visible preflight/pending state, bounded six-prompt no-write audit execution, and captured answer evidence for this one controlled run; it does not prove DB mutation absence, Product Search, all-routes customer-intelligence safety, original blank-render root cause, or broad production readiness.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Stable No-Write Smoke Public Bundle Markers
- Implementation commit: `cff68c1` (`test: add stable no-write smoke public bundle markers`).
- Changed files: `src/lib/customer-intelligence-no-write-smoke.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and `src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- This is a narrow local/source patch for stable non-secret public bundle marker observability after a read-only deployed marker check returned `NO_GO_NEEDS_STABLE_MARKER_PATCH`.
- It adds `CUSTOMER_INTELLIGENCE_NO_WRITE_SMOKE_PUBLIC_BUNDLE_MARKERS` with exact public strings: `ci_no_write_smoke`, `ci_rag_quality_smoke`, `smoke_contract`, `customer_intelligence_no_write_v1`, `no_write_smoke`, `no_write_smoke_audit`, `edge_metadata_present`, and `request_contract_present`.
- Existing smoke trigger/audit code references these constants so future public bundle freshness checks can verify marker presence after deployment.
- The patch does not enable smoke by itself; trigger conditions, request payload semantics, no-write metadata semantics, six-prompt allowlist, normal `sendMessage`, normal customer-visible UI, and `2443caa` unsupported guarantee guard behavior remain unchanged.
- Validation accepted: targeted Vitest PASS with 3 files / 26 tests; targeted ESLint PASS with 0 errors and existing `AIConcierge.tsx` warnings only; `npm run typecheck` PASS; `git diff --check cff68c1^ cff68c1` PASS; commit-diff secret-value scan `COMMIT_DIFF_NO_SECRET_VALUE_PATTERN_MATCHES`.
- This is local/source proof only until deployed and read-only freshness-verified. Marker visibility proves bundle observability, not runtime smoke success or answer quality.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Unsupported Delivery Guarantee Retrieval Guard Hardening
- Implementation commit: `2443caa` (`test: harden unsupported delivery guarantee retrieval guard`).
- Changed files: `src/lib/knowledge-rag-capsule.ts` and `src/lib/__tests__/knowledge-rag-capsule.test.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- This is a narrow local/source patch for `unsupported_delivery_guarantee` successful `knowledge_rag_foundation` / client-capsule RAG retrieval/guard-gating behavior.
- It hardens timing/cutoff-only retrieval sets by replacing the prior OCURRE-only evidence gate with a two-tier evidence classifier: `ocurre_policy` preserves stronger DHL OCURRE / sucursal grounding when present, while `shipping_timing_policy` activates on DHL/shipping timing, cutoff, estimate, cost, coverage, or confirmation evidence.
- For unsupported next-day/home-delivery guarantee premises, the guard can now activate even when retrieved chunks contain DHL/shipping timing or cutoff evidence but lack OCURRE/no-domicilio chunks.
- Timing-only evidence is framed as estimated/conditional, and guaranteed next-day/home delivery is not confirmed.
- Ordinary prompts are not broadly rewritten because the guard still requires the unsupported guarantee query premise.
- No no-write trigger or metadata behavior changed.
- No docs/canon, workflow, env, package, Supabase migration/seed, no-write trigger, or no-write metadata code changed in `2443caa`.
- Validation accepted: targeted Vitest PASS with 3 files / 20 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 2443caa^ 2443caa` PASS; commit-diff secret scan `COMMIT_DIFF_NO_SECRET_PATTERN_MATCHES`. The stderr from the harness was the expected mocked Edge error-path log; tests passed.
- This is local/source proof only until deployed, freshness-verified, and smoke-tested. Any distinct server-side Sommelier path that bypasses this mapper remains unproven.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`.

## Accepted Lane: fa305b2 Live Six-Prompt No-Write RAG Smoke Partial Evidence
- Freshness before the smoke: storefront runtime `gitShortHash` `fa305b2`, `runtimeBuildFingerprint` `v113-fa305b2`, and deployed assets containing `826927f` successful RAG-path hardening markers plus no-write trigger/audit markers.
- Exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke rerun executed after that freshness check through `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true`.
- The trigger did not redirect to login, authenticated storefront execution state was available, and no tokens, cookies, localStorage, auth headers, passwords, keys, env values, service-role bearer misuse, user creation, password reset, DB mutation command, Supabase CLI, ingestion, workflow run, deploy, code/test/doc edits, extra prompt, or individual retry occurred.
- The trigger executed exactly six allowlisted categories once: `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, and `unsupported_delivery_guarantee`.
- For all six prompts, visible sanitized audit evidence showed `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, writes `ai_customer_memory` and `ai_analytics`, call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, answer/main message present, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- `edge_metadata_present` and `request_contract_present` were not visibly rendered as separate fields.
- Verdict: PARTIAL / NEEDS TARGETED FIX. Deployed no-write contract execution and visible suppression metadata are accepted for all six prompts, but full answer-quality proof is not accepted.
- Per-prompt quality classification: `shipping_scope` ACCEPT; `combined_payment_shipping` ACCEPT; `payment_method` ACCEPT WITH RESIDUAL due MercadoPago/cards versus transfer/deposit-only corpus inconsistency; `shipping_cost` ACCEPT WITH RESIDUAL due fixed `$150-$180 MXN` range versus confirmation/estimate expectation; `store_hours_limitation` ACCEPT WITH RESIDUAL because it returned WhatsApp/support/order-confirmation hours Monday-Saturday 10:00 AM-7:00 PM without inventing broad store-opening proof, but that is not general store-opening proof; `unsupported_delivery_guarantee` NEEDS FIX because it still did not clearly refuse or qualify guaranteed next-day home delivery in the customer-facing main answer.
- Root-cause hypothesis: `826927f` likely did not activate in live runtime because its guard requires unsupported-promise query context plus shipping / DHL OCURRE / sucursal policy evidence in resolved chunks; the live `unsupported_delivery_guarantee` result retrieved timing-estimate / same-day cutoff / local delivery chunks instead of OCURRE/no-domicilio evidence. The remaining issue is a retrieval/guard-gating plus answer-shaping interaction, not a no-write audit failure.
- No DB transaction-log mutation absence proof is claimed.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Unsupported Delivery Guarantee Successful RAG-Path Hardening
- Implementation commit: `826927f` (`test: harden unsupported delivery guarantee successful RAG path`).
- Changed files: `src/lib/knowledge-rag-capsule.ts`, `src/lib/__tests__/knowledge-rag-capsule.test.ts`, and `src/services/ai-capsule-orchestrator.service.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- This is a narrow local/source patch for `unsupported_delivery_guarantee` successful `knowledge_rag_foundation` / client-capsule RAG answer shaping.
- `evaluateKnowledgeRAGTree` now accepts optional query context, and `executeKnowledgeCapsule` passes `toolArgs.query` into that mapper.
- The successful RAG-path guard detects unsupported shipping-promise questions, requires shipping / DHL OCURRE / sucursal policy evidence in resolved chunks, and returns a bounded customer-facing answer saying next-day guaranteed home delivery is not confirmed, shipping is DHL ocurre / sucursal, and timing/cost are confirmed before closing the order.
- Local tests cover `Â¿Me garantizas entrega maÃ±ana a domicilio?`, `Â¿Garantizan entrega maÃ±ana?`, and `Â¿Me llega maÃ±ana seguro a mi casa?`.
- Tests assert the answer does not overclaim guaranteed next-day home delivery, and that the guard does not run without unsupported-promise query context or without shipping/OCURRE policy evidence.
- Existing tests remained green for payment method, shipping scope, shipping cost, combined payment/shipping, store-hours degraded fallback, degraded unsupported-guarantee fallback from `9637596`, and the no-write metadata preservation harness.
- No no-write trigger or metadata behavior was broadened.
- Validation accepted: targeted Vitest PASS with 3 files / 19 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 826927f^ 826927f` PASS; commit-diff secret scan `COMMIT_DIFF_NO_SECRET_PATTERN_MATCHES`.
- This was local/source proof until deployed freshness was verified at `fa305b2`; the later live six-prompt smoke still left `unsupported_delivery_guarantee` as NEEDS FIX because the live retrieved chunks did not include the OCURRE/no-domicilio policy evidence needed for the guard.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`.

## Accepted Lane: Partial Six-Prompt No-Write RAG Smoke Evidence
- Baseline before this canon pass: `d50379e` (`docs: canonize payment shipping no-write RAG path hardening`).
- Deployed freshness before the smoke: storefront runtime `gitShortHash` `d50379e`, `runtimeBuildFingerprint` `v113-d50379e`, deploy-functions run `26000841773` success, and `Deploy customer-intelligence` success.
- The deployed source contained `cb6311e`, `7905b60`, and `9637596`.
- Exactly one authenticated deployed app-triggered six-prompt no-write RAG smoke rerun executed through `https://vsm-store.pages.dev/?ci_no_write_smoke=true&smoke_contract=customer_intelligence_no_write_v1&ci_rag_quality_smoke=true`.
- The app was already authenticated at `/profile`, the storefront trigger did not redirect to login, and authenticated execution state was confirmed without inspecting or exposing tokens, cookies, localStorage, auth headers, passwords, keys, or env values.
- The trigger executed exactly six allowlisted categories once: `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, and `unsupported_delivery_guarantee`.
- For all six prompts, visible sanitized audit evidence showed `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, writes `ai_customer_memory` and `ai_analytics`, call `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, and `3` chunks.
- `edge_metadata_present` / `request_contract_present` were not visibly rendered as separate fields.
- Verdict: PARTIAL / NEEDS TARGETED FIX. Deployed no-write contract execution and visible suppression metadata are accepted for all six prompts, but full answer-quality proof is not accepted.
- Per-prompt quality classification at smoke time: `shipping_scope` ACCEPT; `combined_payment_shipping` ACCEPT; `payment_method` ACCEPT WITH RESIDUAL due payment corpus/policy inconsistency; `shipping_cost` ACCEPT WITH RESIDUAL due fixed `$150-$180 MXN` range versus confirmation/estimate expectation; `store_hours_limitation` ACCEPT WITH RESIDUAL due weak answer to the hours question; `unsupported_delivery_guarantee` NEEDS FIX because successful live RAG/Sommelier output did not clearly refuse or qualify guaranteed next-day home delivery. Follow-up local/source hardening for the client-capsule RAG path is accepted at `826927f`, without deployed/runtime proof.
- No DB transaction-log mutation absence proof is claimed.
- No tokens, cookies, localStorage, auth headers, passwords, keys, env values, service-role bearer misuse, user creation, password reset, DB mutation command, Supabase CLI, ingestion, workflow run, deploy, or code/test/doc edits occurred during the smoke execution.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Payment / Shipping-Cost No-Write RAG Smoke Path Hardening
- Implementation commit: `cb6311e` (`test: harden payment and shipping cost no-write smoke paths`).
- Changed files: `src/hooks/useAIConcierge.ts`, `src/hooks/__tests__/useAIConcierge.test.tsx`, `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`, `src/lib/__tests__/customer-intelligence-turn-first.test.ts`, `supabase/functions/customer-intelligence/index.ts`, and `supabase/functions/customer-intelligence/intent-guardrails.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Under recognized `customer_intelligence_no_write_v1` no-write smoke, the exact prompts `¿Aceptan tarjeta o cómo puedo pagar?` and `¿Cuánto cuesta el envío por DHL?` are forced to `POLICY_INQUIRY` / `knowledge_rag_foundation` instead of `storefront_checkout_readiness`.
- Normal checkout-readiness behavior remains intact for real checkout phrases such as `ya puedo pagar?`.
- The six-prompt allowlist and normal `sendMessage` behavior remain unchanged.
- Sanitized audit rows now distinguish `edge_metadata_present` from `request_contract_present`.
- Unsupported delivery-guarantee successful-path shaping was not included.
- Validation accepted: targeted Vitest PASS with 4 files / 70 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check cb6311e^ cb6311e` PASS; commit-diff secret scan found no secret-like values.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Unsupported Delivery Guarantee Answer-Shaping
- Implementation commit: `9637596` (`test: harden unsupported delivery guarantee policy answer`).
- Changed files: `supabase/functions/customer-intelligence/policy-degraded-fallback.ts`, `src/lib/__tests__/knowledge-rag-capsule.test.ts`, and `src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- The patch adds local deterministic unsupported delivery-guarantee answer-shaping through the narrow `unsupported_shipping_promise_limit` degraded policy fallback.
- It applies to unsupported shipping promise / delivery guarantee premises when shipping policy context exists.
- It states that next-day guaranteed home delivery cannot be confirmed, grounds shipping to DHL OCURRE / sucursal, and says timing/cost must be confirmed before closing the order.
- No-policy bounded fallback behavior remains preserved.
- Existing payment, shipping scope, shipping cost, combined payment/shipping, and store-hours harness behavior remains covered.
- The patch did not change no-write trigger behavior, no-write metadata preservation, workflow, deploy, DB, ingestion, or live paths.
- Validation accepted: targeted Vitest PASS with 2 files / 13 tests; targeted ESLint PASS; `npm run typecheck` PASS; `git diff --check 9637596^ 9637596` PASS; commit-diff secret scan found no secret-like values.
- Detail: `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md`.

## Accepted Lane: No-Write Error Metadata Preservation
- Implementation commit: `7905b60` (`test: preserve no-write metadata on customer intelligence errors`).
- Changed files: `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/no-write-smoke.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/lib/__tests__/customer-intelligence-no-write-smoke.test.ts`, `src/services/__tests__/concierge.service.knowledge-harness.test.ts`, and `src/hooks/__tests__/useAIConcierge.test.tsx`.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Recognized `customer_intelligence_no_write_v1` Edge error responses now include sanitized `no_write_smoke` metadata.
- Client service preserves `no_write_smoke` metadata from error response bodies, suppresses client telemetry for no-write error paths, and the hook renders metadata-present audit rows when preserved metadata exists.
- The existing `metadata_present=false` fallback remains when metadata is unavailable, and non-smoke error behavior remains unchanged.
- Validation accepted: targeted Vitest PASS with 3 files / 25 tests; targeted ESLint PASS with 0 errors and existing warnings only; `npm run typecheck` PASS; `git diff --check 7905b60^ 7905b60` PASS; commit-diff secret scan found no raw secret values.
- Detail: `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md`.

## Accepted Lane: Multi-Prompt No-Write RAG Quality Trigger
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
- Workflow_dispatch run `26000841773` later succeeded on `main` at `d50379e` and confirmed current `customer-intelligence` deploy freshness for `cb6311e`, `7905b60`, and `9637596`.
- Runtime verifications are accepted for `deploy-functions` run `25924147087`, `graqle-sync` run `25925139071`, and `ingest-knowledge` run `25927827351`.
- `7fb0a77` added the accepted local source allowlist path, and workflow run `26124496125` later used it for exactly `politica-pagos-v2` and `politica-envios-detallada-v1`.
- Detailed workflow history is indexed in `AUDIT_LOG.md` and preserved in `docs/audits/2026-05/github-actions-runtime-verification.md` plus the full archive snapshot.

## Active Residuals / Non-Claims
- Bounded live retrieval-to-answer proof is claimed only for the single post-deploy no-write policy/shipping/payment smoke, the older partial six-prompt no-write RAG smokes, and the controlled deployed `56e8ef4` valid-trigger run described above.
- Remote `customer-intelligence` smoke evidence is limited to those explicitly described deployed app-triggered no-write smokes.
- Visible no-write audit evidence is accepted for all six prompts in the controlled `56e8ef4` run, but DB transaction-log mutation absence is not proven.
- The controlled `56e8ef4` run proves deployed trigger execution, preflight/pending observability, no-write audit visibility, and bounded answer evidence for that one run; it does not prove full RAG quality or all customer-intelligence routes.
- Runtime failures for `payment_method` and `shipping_cost` were not reproduced in the partial smoke; `caec050` normalized the local static seed corpus, and targeted run `26124496125` applied the normalized active rows for `politica-pagos-v2` and `politica-envios-detallada-v1` only.
- Payment/shipping corpus consistency is accepted for local source/test after `caec050`, for deployed active target rows after `26124496125`, for read-only retrieval/RPC ranking with residual risk, and for one controlled six-prompt no-write runtime validation with residual risk.
- No broad shipping-cost production claim is made: target active rows now carry calculated/confirmed-before-close language, read-only retrieval/RPC can surface it, and one bounded no-write answer run accepted it, but broad generated runtime behavior still needs separate proof.
- Unsupported delivery-guarantee successful client-capsule RAG-path hardening from `826927f` was insufficient in the older `fa305b2` live rerun. Follow-up `2443caa` plus the deployed `56e8ef4` controlled run now has targeted runtime answer evidence for `unsupported_delivery_guarantee`, limited to that one run.
- `cff68c1` stable public no-write smoke markers and `56e8ef4` pending/preflight markers have deployed freshness evidence in the current controlled lane.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- `store_hours_limitation` is accepted with residual in the latest smoke: it returned WhatsApp/support/order-confirmation hours without broad store-opening proof.
- Existing raw console diagnostics remain outside the no-write lanes.
- No broad production Cesarin answer-quality proof is claimed beyond the bounded controlled `56e8ef4` six-prompt run and the bounded post-ingestion six-prompt no-write validation described above.
- No full RAG quality proof is claimed.
- No Product Search quality proof is claimed.
- No broad production readiness or all-routes `customer-intelligence` safety proof is claimed.
- No semantic completeness proof is claimed.
- No metadata cleanup is claimed.
- The prior `metadata.embedding_dims` mismatch is accepted as observed resolved for current rows by the read-only metadata observer: `41` observed rows, all active with `metadata.embedding_dims=768`, with `0` observed `3072` rows and `0` observed missing dims.
- Metadata observer tooling `8eb02af` (`tooling: add read-only store knowledge metadata observer`) and credential-requirements canon `debb6c1` are accepted with residual risk; the later read-only observer execution completed and did not mutate DB, run cleanup, ingest, deploy, run workflow, run live smoke, edit files, or expose secrets.
- Retained inactive embedded rows are accepted as observed absent for the current observer result: `inactiveWith768=0`, `inactiveWith3072=0`, and `inactiveMissingDims=0`.
- The observer result does not prove future DB state, semantic content correctness, metadata cleanup, future retained inactive-row state, Product Search, Cesarin runtime, production, deploy, workflow, or live-smoke behavior.
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
- No-write error metadata preservation.
- Unsupported delivery-guarantee answer-shaping.
- Payment/shipping-cost no-write RAG smoke path hardening.
- Partial six-prompt no-write RAG smoke evidence.
- Unsupported delivery-guarantee successful RAG-path hardening.
- fa305b2 live six-prompt no-write RAG smoke partial evidence.
- Unsupported delivery-guarantee retrieval guard hardening.

## Canon Update Rules
- Keep this file current-state-first.
- Put detailed accepted evidence in `docs/audits/YYYY-MM/<lane>.md`.
- Keep `AUDIT_LOG.md` as the chronological index, not the full transcript.
- Preserve non-claims and residuals in live files when they affect future work.
- Do not create `AI_CONTEXT2.md` or `AUDIT_LOG2.md`; use archive/detail files instead.
