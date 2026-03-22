# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# CESARIN OS — Deep State Audit

## Scope

This audit combines:

- auxiliary audit docs in `tmp/`
- current repo code truth
- current Supabase migration/schema truth in repo
- partial live-instance validation against Supabase using the configured anon client

It does **not** rewrite canon.
It does **not** treat old audit claims as facts unless code or live state supports them.

## Executive Summary

Cesarin OS is no longer a speculative AI sidecar.
It is a real, multi-surface pilot system with:

- live storefront runtime
- client-side capsule execution
- telemetry persisted to `ai_analytics`
- real admin operator surfaces
- real semantic product retrieval
- real knowledge retrieval
- real drafting hardening across branches B/C/D/E/F

The biggest current truth split is:

- **runtime and pilot operations are materially real**
- **the admin shell is still uneven in value**
- **the repo and live Supabase instance are not perfectly aligned in every low-level detail**

The most important concrete drift found in this audit:

- **live `match_products` expects `vector(3072)`**
- repo migrations still define it as `vector(768)`

That is not a cosmetic mismatch.
It means some local schema assumptions are stale relative to production reality.

## 1. What Cesarin OS Is Today

### Runtime architecture

Cesarin is split across:

- Edge orchestration:
  - [customer-intelligence/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts)
- Client-side capsules:
  - [ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
  - [product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
  - [knowledge-rag-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/knowledge-rag-capsule.ts)
- Storefront bridge:
  - [concierge.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)

Operationally, this means:

- the Edge function classifies/routs
- product search and knowledge capsules execute in the client layer
- telemetry is written to `ai_analytics`
- pilot exposure is gated by store setting + session pilot gate

### Core customer-visible capabilities

Real today:

- exact product match
- semantic product match
- out-of-stock safe alternative branch
- ambiguity hold branch
- no-match recovery guidance
- knowledge/policy retrieval via `store_knowledge`
- cart operator handoff

## 2. What Is Solid in Current Code

### Product search drafting surface

Current drafting in [product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts) is materially mature:

- BRANCH B `FEATURED_FALLBACK`
  - cautious ambiguity posture
  - short specs cue only
- BRANCH C `EXACT`
  - `ai_sales_note → specs → generic`
- BRANCH D `OUT_OF_STOCK_ALTERNATIVE`
  - `specs → alternative specs → ai_sales_note → generic`
- BRANCH E `SEMANTIC`
  - `specs → ai_sales_note → description → generic`
- BRANCH F `NO_MATCH`
  - actionable reformulation guidance

Cold conclusion:

- downstream drafting is no longer the main bottleneck
- branch hierarchy is coherent enough to stop opening new drafting lanes by default

### Downstream product context

Current repo truth:

- `ai_sales_note` reaches exact and semantic paths
- `specs` reaches exact and semantic paths
- `description` reaches exact and semantic paths

Relevant files:

- [ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [ai-capsule-schemas.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [ai-capsule-mappers.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-mappers.ts)

### Pilot telemetry / operator cockpit

The real operational cockpit is:

- [PilotTelemetry.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx)
- [admin-pilot-ops.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts)
- [useAdminPilotOps.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/admin/useAdminPilotOps.ts)

Operators can already see:

- traffic volume
- routed capsule
- detected intent
- semantic hit proxy
- fallback rate
- frustration rate
- zero-card misses
- guardrail rescues
- cart intent signals
- recent query log with review entrypoint

### Pilot activation / “is it even live?” truth

Current code makes Cesarin:

- **not auth-gated**
- **pilot-session-gated**
- **globally toggleable**

Relevant files:

- [App.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [PilotParityDiagnostics.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotParityDiagnostics.tsx)

This means missing anon rows do **not** automatically imply RLS failure.
They may also mean pilot gate inactive.

## 3. What Is Real but Uneven

### Admin Cesarin OS surface

[AdminCesarinOS.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/admin/AdminCesarinOS.tsx) is a real admin shell with these tabs:

- Persona
- Knowledge
- Rules
- Simulator
- Learning
- Interventions
- Analytics
- Quality
- Pilot
- Concepts

But value is uneven:

- high-value operator surfaces:
  - Pilot
  - Telemetry
  - Review drawer
  - Knowledge
  - Rules
  - Simulator
- medium or mixed surfaces:
  - Quality
  - Learning
  - Interventions
- weaker / still partially shell-like:
  - Analytics
  - Concepts in parts

### Interventions

Repo truth:

- schema exists:
  - [20260320_intervention_signals_and_recommendations.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_intervention_signals_and_recommendations.sql)
- service exists:
  - [intervention-workflow.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/intervention-workflow.service.ts)
- UI exists:
  - [TabInterventions.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabInterventions.tsx)

But structurally this remains MVP/manual:

- operator review is real
- autonomous execution is not
- backend signal producers are not really active in the current repo path

### Analytics tab

[TabAnalytics.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabAnalytics.tsx) is no longer pure fake shell, but it is still weaker than the pilot telemetry cockpit.

It shows:

- KPI snapshots
- capsule distribution

But its “advanced analytics” area is still effectively placeholder-grade.

Operational conclusion:

- use `PilotTelemetry`, not `TabAnalytics`, for live triage

## 4. Supabase Live Truth

### Live-validated successfully

Using the configured anon client against the real instance:

- `store_settings` exists and responds
- `store_knowledge` exists and has live rows
- `match_products` exists and responds

Live facts confirmed:

- `store_settings.id = 1`
- `is_ai_assistant_enabled = true`
- `pilot_runbook_status` exists live and shows mixed progress
  - `kill-switch` is `pass`
  - several others remain `pending`
- `store_knowledge` contains real rows
  - including shipping and payments chunks
  - plus at least one test-style row (`test title`)

### Live RPC truth

The most important live finding:

- live `match_products` returns:
  - `description`
  - `ai_sales_note`
  - `specs`
- live `match_products` expects **3072-dimensional vectors**

This was proven by:

- 768-dim probe → `400 different vector dimensions 3072 and 768`
- 3072-dim probe → `200 OK`

### Live truth that remains partially opaque

Anon probes to:

- `ai_analytics`
- `intervention_signals`
- `intervention_recommendations`

returned `[]`.

Interpretation must stay conservative:

- those tables definitely exist
- but anon cannot tell whether:
  - they are empty
  - or RLS hides all rows from anon

So:

- repo truth proves telemetry/interventions exist structurally
- live anon truth cannot prove current row volume in those admin-only tables

## 5. Real Drift Found

### Major drift: vector dimensionality

Repo migrations still define product embedding / `match_products` as `vector(768)`:

- [20260312_neural_search_infra.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
- [20260320_match_products_add_ai_sales_note.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_ai_sales_note.sql)
- [20260320_match_products_add_specs.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_specs.sql)

But live instance expects `3072`.

This is the biggest repo/live mismatch found in the audit.

### Knowledge embedding dimensionality split

Repo also shows inconsistent local assumptions:

- [knowledge-ingestor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/knowledge-ingestor/index.ts)
  - explicitly requests `outputDimensionality: 3072`
- [embeddings-processor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/embeddings-processor/index.ts)
  - does not specify output dimensionality
- local migrations/comments still talk about 768 in product search

Cold conclusion:

- production likely standardized on 3072
- repo migrations/documentation have stale residues

### Operator observability gap

Telemetry is real, but the main remaining ops blind spot is:

- **failure-mode attribution**

Operators can see:

- traffic
- fallback
- frustration
- 0 cards
- capsule

But they still cannot cleanly answer from one panel:

- what kind of miss is dominating?

This is a usability gap, not a data-collection gap.

## 6. What Is Closed Enough vs What Is Still Open

### Closed enough

- storefront pilot gating model
- product drafting hierarchy
- exact/semantic downstream product context
- knowledge RAG basic existence
- telemetry write-path baseline in schema/repo
- pilot telemetry cockpit as primary operator surface

### Still open

- repo/live alignment for vector dimensionality
- miss taxonomy / failure attribution panel
- analytics tab rationalization vs telemetry cockpit
- intervention workflow maturity beyond MVP/manual mode
- cleanup of stale admin surfaces and historical documentary drift

## 7. Priority Ranking

### Highest priority

1. **Repo/live alignment audit-fix for vector dimensionality**
- This is the strongest hard technical drift found.

2. **Operator-facing miss taxonomy / failure attribution**
- Highest operator value without inventing new telemetry.

### Medium priority

3. **Analytics surface rationalization**
- avoid splitting operator attention between `TabAnalytics` and the real cockpit

4. **Interventions reality pass**
- confirm whether MVP/manual state matches current operator expectations and live DB reality

## 8. Final Judgment

Cesarin OS is **real, live, and materially operational**.

It is not a fake shell.

But it is also not “fully clean” or “fully reconciled” in every layer.

The current true state is:

- **runtime**: strong
- **drafting quality**: strong enough to stop opening more lanes by default
- **pilot observability**: useful, but still missing failure attribution clarity
- **admin surface**: mixed quality
- **schema/docs/live alignment**: not fully clean, with one important live drift around vector dimensionality

If you need a one-line summary:

**Cesarin OS is production-shaped and operator-usable today, but still carries real internal drift between repo assumptions, admin surface maturity, and live Supabase technical truth.**
