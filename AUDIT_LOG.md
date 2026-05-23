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
| 2026-05-22 | Cart shipping trust copy micro-fix | ACCEPT WITH RESIDUAL RISK | `db93fc3`; two-file CartSidebar UI/test patch; focused CartSidebar suite `1` file / `5` tests; bounded CartSidebar/Checkout/cart-domain suite `3` files / `14` tests; `npm run typecheck`; `git diff --check db93fc3^ db93fc3` | current canon | current canon |
| 2026-05-22 | Storefront order tracking trust view | ACCEPT WITH RESIDUAL RISK | `f205bcc`; four-file UI/service trust-view patch; focused tracking suite `2` files / `19` tests; bounded orders/detail regression suite `3` files / `71` tests; `npm run typecheck`; `git diff --check f205bcc^ f205bcc`; literal PowerShell `**tests**` glob did not expand, accepted validation used real `__tests__` paths | current canon | current canon |
| 2026-05-22 | Storefront payment failure status normalization | ACCEPT WITH RESIDUAL RISK | `9ea44e5`; corrected real-path checkout/payment suite `5` files / `72` tests; `npm run typecheck`; `git diff --check 9ea44e5^ 9ea44e5` | current canon | current canon |
| 2026-05-22 | Mercado Pago webhook handler response seam | ACCEPT WITH RESIDUAL RISK | `ffa4339`; webhook contract Vitest `1` file / `11` tests; bounded checkout/payment suite `5` files / `68` tests; `npm run typecheck`; `git diff --check ffa4339^ ffa4339` | current canon | current canon |
| 2026-05-22 | Mercado Pago webhook failure semantics hardening | ACCEPT WITH RESIDUAL RISK | `d692aad`; webhook contract Vitest `1` file / `8` tests; bounded checkout/payment suite `5` files / `68` tests; `npm run typecheck`; `git diff --check d692aad^ d692aad` | current canon | current canon |
| 2026-05-22 | Mercado Pago webhook contract hardening | ACCEPT WITH RESIDUAL RISK | `3c2e5f2`; webhook contract Vitest `1` file / `6` tests; bounded checkout/payment suite `5` files / `68` tests; `npm run typecheck`; `git diff --check 3c2e5f2^ 3c2e5f2` | current canon | current canon |
| 2026-05-22 | Product Search query construction safety patch | ACCEPT WITH RESIDUAL RISK | `cd9ac1e`; bounded `search.service.test.ts` Vitest `1` file / `3` tests; `git diff --check cd9ac1e^ cd9ac1e` | current canon | current canon |
| 2026-05-22 | Production Typewriter visual QA | ACCEPT WITH RESIDUAL RISK | public bundle `v113-5e4f8ee`; storefront shell and welcome Typewriter animation observed; no chat send | current canon | current canon |
| 2026-05-22 | Pages static 500 fix | ACCEPT WITH RESIDUAL RISK | `47862ae`; run `26300707725`; `--skip-caching`; static serving fresh at `v113-47862ae` | current canon | current canon |
| 2026-05-22 | Public Typewriter bundle freshness validation | ACCEPT WITH RESIDUAL RISK | deployed `runtime-build.json` at `11e9f71`; `6ad7f31` static markers present; stale vs `bf2f3a7` | current canon | current canon |
| 2026-05-22 | Local Typewriter visual validation | ACCEPT WITH RESIDUAL RISK | focused Vitest `2` files / `33` tests; local Vite + dummy local endpoint browser QA | current canon | current canon |
| 2026-05-22 | Customer-intelligence recovery + Typewriter UX block | ACCEPT WITH RESIDUAL RISK | `d69dc05`, `5f4d169`, `059e3e5`, `ebae4bf`, `6ad7f31` | current canon | current canon |
| 2026-05-22 | Read-only metadata dims observer | ACCEPT - OBSERVED RESOLVED FOR CURRENT ROWS | one read-only observer command after no-DB self-check | current canon | current canon |
| 2026-05-21 | Product Search compatibility wording micro-fix | ACCEPT WITH RESIDUAL RISK | `ba2e39a` | current canon | current canon |
| 2026-05-19 | Controlled six-prompt no-write RAG validation after targeted ingestion | ACCEPT WITH RESIDUAL RISK | one deployed app-trigger no-write validation after run `26124496125` and canon `1510d84` | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-19 | Read-only retrieval/RPC ranking after targeted ingestion | ACCEPT WITH RESIDUAL RISK | `match_knowledge`, threshold `0.5`, count `3` | current canon | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-19 | Targeted Run Knowledge Ingestion payment/shipping execution | ACCEPT WITH RESIDUAL RISK | run `26124496125` | current canon | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-19 | Targeted knowledge ingestion source allowlist | ACCEPT WITH RESIDUAL RISK | `7fb0a77` | current canon | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-18 | Payment/shipping static RAG corpus normalization | ACCEPT WITH RESIDUAL RISK | `caec050` | current canon | `docs/audits/2026-05/store-knowledge-ingestion-and-retrieval.md` |
| 2026-05-18 | Controlled 56e8ef4 valid-trigger no-write RAG evidence | ACCEPT WITH RESIDUAL RISK | `56e8ef4`, one deployed valid-trigger open with existing-tab answer capture | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-18 | Stable no-write smoke public bundle markers | ACCEPT WITH RESIDUAL RISK | `cff68c1` | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-17 | Unsupported delivery-guarantee retrieval guard hardening | ACCEPT WITH RESIDUAL RISK | `2443caa` | current canon | `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` |
| 2026-05-17 | fa305b2 live six-prompt no-write RAG smoke partial evidence | PARTIAL / NEEDS TARGETED FIX | `fa305b2`, one authenticated deployed six-prompt smoke after `826927f` freshness | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-17 | Unsupported delivery-guarantee successful RAG-path hardening | ACCEPT WITH RESIDUAL RISK | `826927f` | current canon | `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` |
| 2026-05-17 | Partial six-prompt no-write RAG smoke evidence | PARTIAL / NEEDS TARGETED FIX | `d50379e`, run `26000841773`, one authenticated deployed six-prompt smoke | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-17 | Payment/shipping-cost no-write RAG smoke path hardening | ACCEPT WITH RESIDUAL RISK | `cb6311e` | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
| 2026-05-17 | Unsupported delivery-guarantee answer-shaping | ACCEPT WITH RESIDUAL RISK | `9637596` | current canon | `docs/audits/2026-05/cesarin-knowledge-main-message-synthesis.md` |
| 2026-05-17 | No-write error metadata preservation | ACCEPT WITH RESIDUAL RISK | `7905b60` | current canon | `docs/audits/2026-05/no-write-customer-intelligence-smoke-readiness.md` |
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
- Bounded live retrieval-to-answer proof exists only for the single post-deploy authenticated no-write policy/shipping/payment smoke, the older partial six-prompt no-write RAG smokes, the controlled deployed `56e8ef4` valid-trigger run, and the controlled post-ingestion six-prompt no-write validation.
- Remote `customer-intelligence` smoke evidence is limited to those explicitly described deployed app-triggered no-write smokes.
- The controlled `56e8ef4` run proves deployed trigger execution, preflight/pending observability, visible no-write audit rows, and bounded answer evidence for that one run, not broad customer-intelligence safety.
- DB transaction-log mutation absence is not proven.
- The controlled `56e8ef4` run accepts answer evidence for the six prompt categories in that one run; it does not prove broad production answer quality.
- Payment/shipping policy corpus consistency is accepted at local source/test level after `caec050`, for deployed active target rows `politica-pagos-v2` / `politica-envios-detallada-v1` after targeted run `26124496125`, for read-only retrieval/RPC ranking with residual risk, and for one controlled six-prompt no-write runtime validation with residual risk.
- `7fb0a77` is accepted as the local source/workflow/test allowlist path used by targeted run `26124496125`; no broader workflow/ingestion behavior or production corpus change outside the two target source IDs is claimed.
- The older `fa305b2` rerun left `unsupported_delivery_guarantee` as NEEDS FIX under a retrieved timing-estimate chunk set; the controlled deployed `56e8ef4` run now accepts targeted `unsupported_delivery_guarantee` answer evidence for one run.
- `2443caa` retrieval/guard-gating hardening and `cff68c1` public no-write markers have deployed freshness/runtime evidence only through the bounded `56e8ef4` lane described above.
- Any distinct server-side Sommelier path that bypasses the client-capsule mapper remains unproven.
- No broad production Cesarin answer-quality proof beyond the bounded `56e8ef4` six-prompt run and bounded post-ingestion six-prompt no-write validation.
- No full RAG quality proof.
- No Product Search quality proof.
- No broad production readiness or all-routes `customer-intelligence` safety proof.
- No semantic completeness proof.
- No metadata cleanup.
- `metadata.embedding_dims` is accepted as observed resolved for current rows by one read-only observer result: `41` observed rows, `41` active with `768`, `0` observed `3072`, and `0` observed missing dims.
- Retained inactive embedded rows are accepted as observed absent for the current observer result: `inactiveWith768=0`, `inactiveWith3072=0`, and `inactiveMissingDims=0`.
- No retained inactive embedded row cleanup occurred or is claimed.
- No deploy, Supabase CLI, live smoke, or secret exposure during doc/canon split, `caec050` canonization, `7fb0a77` canonization, or this doc/canon update; run `26124496125` is the bounded targeted workflow/DB ingestion exception recorded above.
- Customer-intelligence recovery + Typewriter UX block claims are local/bounded only: no production runtime behavior, deployed bundle proof, live smoke, deploy, secret change, provider/Gemini call, or real chat send-flow visual QA is claimed; Analyst `response_schema` provider compatibility remains unproven until a separate authorized provider-validation lane.
- Local Typewriter visual validation is accepted only as local source/test plus local browser simulated-send-flow evidence; no deployed bundle, production runtime, real backend/customer-intelligence send-flow, Supabase/DB, Gemini/provider, authenticated-session, full responsive/browser matrix, or typecheck proof is claimed.
- Public Typewriter bundle freshness validation accepts only static deployed evidence that `11e9f71` is live, that `6ad7f31` Typewriter markers are present in the public AIConcierge chunk, and that the deployed bundle is stale versus `bf2f3a7`; it does not prove latest-canon deployment, production visual/runtime UX, chat send-flow, backend/customer-intelligence behavior, Supabase/DB, Gemini/provider, authenticated-session, live smoke, or service-worker activation for real clients.
- Pages static 500 fix accepts only workflow-scope deploy-command evidence and public static serving/freshness at `47862ae`; it does not prove production visual QA, chat send-flow, customer-intelligence smoke, backend/customer-intelligence behavior, Supabase/DB, Gemini/provider, authenticated-session behavior, service-worker activation for existing clients, Cloudflare settings/cache mutation, or runtime UX/chat/backend behavior.
- Production Typewriter visual QA accepts only the observed public storefront shell, AI Concierge panel open, welcome Typewriter progression/completion, visible input, and no obvious desktop layout break on bundle `v113-5e4f8ee`; it does not prove chat send-flow, real assistant response-after-send, customer-intelligence smoke, backend/customer-intelligence behavior, Supabase/DB, Gemini/provider, authenticated flow, service-worker activation, responsive/browser matrix coverage, or secret/session/storage inspection.
- Mercado Pago webhook contract hardening `3c2e5f2` accepts local dependency-injected contract/test evidence only. It does not prove live Mercado Pago/provider behavior, Supabase DB behavior, deployed/live-smoke behavior, Edge runtime behavior, webhook signature/origin safety, production payment correctness, or auth/session/storage/secret state. Residuals remain: caught webhook errors still return `200 OK`, provider signature/origin verification is absent, order update remains unconditional by `orderId`, Supabase update/insert errors are not surfaced by the adapter, and evidence is local contract/test proof only.
- Mercado Pago webhook failure semantics hardening `d692aad` accepts local source/test evidence only. It does not prove live Mercado Pago/provider behavior, Supabase DB behavior, deployed/live-smoke behavior, Edge runtime behavior beyond source behavior, webhook signature/origin safety, production payment correctness, or auth/session/storage/secret state. Residuals remain: no handler-level test directly asserts the `500` response, attribution-read error throwing is verified by code inspection rather than a dedicated unit test, provider signature/origin verification is absent, order update remains unconditional by `orderId`, and evidence is local source/test proof only.
- Mercado Pago webhook handler response seam `ffa4339` accepts local source/test evidence only. It does not prove live Mercado Pago/provider behavior, Supabase DB behavior, deployed/live-smoke behavior, Edge runtime behavior beyond source/test behavior, webhook signature/origin safety, production payment correctness, or auth/session/storage/secret state. Residuals remain: real Mercado Pago signature/origin validation is absent, Edge runtime behavior is inferred from source/test wiring rather than proven by deployed or Supabase Edge execution, production payment correctness is unproven, and evidence is local source/test proof only.
- Storefront payment failure status normalization `9ea44e5` accepts local contract/UI test evidence only. It does not prove production behavior, DB/Supabase behavior, live Mercado Pago/provider behavior, Edge runtime behavior, deploy/live-smoke behavior, real payment correctness, webhook Mercado Pago behavior, Product Search/Typewriter/Pages/customer-intelligence behavior, or auth/session/storage/secret state. Residuals remain: no production persisted data proof, no DB/Supabase proof, no provider/Mercado Pago proof, no Edge runtime proof, no deploy/live smoke, no real payment correctness proof, and the accepted test evidence uses real `__tests__` paths because the literal `**tests**` path pattern returned `No test files found`.
