# Productization Config Boundary - May 2026

## Status
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Implementation commit: `9b4d29d` (`feat(config): add productization boundary`).
- Follow-up implementation commit: `d935a78` (`feat(config): extract tenant metadata boundary`).

## Accepted Scope
- The implementation changed only `src/config/productization/**`.
- Added typed productization boundary files:
  - `src/config/productization/types.ts`
  - `src/config/productization/tenant.ts`
  - `src/config/productization/vape420VerticalPack.ts`
  - `src/config/productization/index.ts`
  - `src/config/productization/__tests__/productization-config.test.ts`
- `TenantConfig` and `VerticalPackConfig` exist.
- `vsmStoreTenantConfig` represents current VSM tenant/store metadata as static local config.
- `vape420VerticalPackConfig` represents current Vape/420 section, taxonomy, spec, rule, caveat, and fixture assumptions as static local config.
- Tenant/store identity is separated from current vertical taxonomy and spec assumptions.
- No runtime consumers were rewired.
- No docs/canon, package, workflow, Supabase, checkout/payment, Product Search, Cesarin/customer-intelligence, deploy, or runtime files changed in the implementation commit.

## Accepted Validation
- `git status -sb`: `## main...origin/main`.
- `git rev-list --left-right --count origin/main...HEAD`: `0 0`.
- `git show --stat --oneline 9b4d29d`: 5 files changed, 307 insertions.
- `git diff --name-status 9b4d29d^ 9b4d29d`: only `src/config/productization/**`.
- `git diff --check 9b4d29d^ 9b4d29d`: PASS.
- `npm run test:run -- src/config/productization/__tests__`: PASS, 1 file / 3 tests.
- `npm run typecheck`: PASS.
- Import/dependency inspection found no runtime imports for DB/Supabase, env/secrets/session/storage, Mercado Pago/provider, checkout/payment runtime, Product Search runtime, Cesarin/customer-intelligence runtime, deploy, or workflows. Text hits for `payment` and `checkout` are config labels/feature flags and negative test assertions, not runtime wiring.

## Non-Claims
- This does not make VSM Store white-label or SaaS-ready.
- This does not prove runtime reusability.
- This does not prove second-vertical readiness.
- This does not prove production behavior.
- This does not prove DB/Supabase behavior.
- This does not prove deploy or live-smoke behavior.
- This does not prove provider behavior.
- This does not prove checkout/payment runtime behavior.
- This does not prove Product Search behavior.
- This does not prove Cesarin/customer-intelligence runtime behavior.
- This does not prove browser QA behavior.
- This does not prove env, secret, auth, session, or storage state.

## Residual Risks
- The new boundary is static metadata only.
- Existing runtime consumers still use existing scattered constants and hardcoded assumptions.
- Current Vape/420 assumptions are represented as the first vertical pack, but no second vertical has been implemented or proven.
- Later extraction lanes must independently validate any runtime rewiring from existing pages, services, hooks, components, constants, checkout/payment, Product Search, Cesarin/customer-intelligence, DB/Supabase, or deploy surfaces.

## Accepted Follow-Up: Tenant Metadata Extraction
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Implementation commit: `d935a78` (`feat(config): extract tenant metadata boundary`).
- The implementation changed exactly:
  - `src/config/productization/types.ts`
  - `src/config/productization/tenant.ts`
  - `src/config/productization/__tests__/productization-config.test.ts`
  - `src/config/site.ts`
  - `src/constants/storeMeta.ts`
- `TenantConfig` and `vsmStoreTenantConfig` now include public/static tenant metadata already present in current repo surfaces.
- `SITE_CONFIG` consumes `vsmStoreTenantConfig` while preserving its exported shape and expected runtime-facing fields.
- `STORE_META_COPY` consumes `vsmStoreTenantConfig.displayName` while preserving expected home/checkout copy and SEO behavior.
- No runtime consumers beyond `src/config/site.ts` and `src/constants/storeMeta.ts` were rewired.
- Order WhatsApp generation, bank account, payment/delivery wording, hero, routing, specs, DB/Supabase, Product Search, Cesarin/customer-intelligence runtime, deploy/workflows, and checkout/payment runtime were not changed.

## Accepted Follow-Up Validation
- `git status -sb`: `## main...origin/main`.
- `git rev-list --left-right --count origin/main...HEAD`: `0 0`.
- `git show --stat --oneline --name-only d935a78`: exactly the five accepted files above.
- `git diff --name-only d935a78^ d935a78`: exactly the five accepted files above.
- `git diff --check d935a78^ d935a78`: PASS.
- `npm run test:run -- src/config/productization/__tests__`: PASS, 1 file / 4 tests.
- `npm run typecheck`: PASS.
- Import/dependency inspection found no new DB/Supabase, env/secrets/session/storage, Mercado Pago/provider, checkout/payment runtime, Product Search runtime, Cesarin/customer-intelligence runtime, deploy, or workflow dependency.

## Follow-Up Non-Claims
- This does not make VSM Store white-label or SaaS-ready.
- This does not prove runtime reusability.
- This does not prove second-vertical readiness.
- This does not prove production behavior.
- This does not prove DB/Supabase behavior.
- This does not prove deploy or live-smoke behavior.
- This does not prove provider behavior.
- This does not prove checkout/payment runtime behavior.
- This does not prove Product Search behavior.
- This does not prove Cesarin/customer-intelligence runtime behavior.
- This does not prove browser QA behavior.
- This does not prove env, secret, auth, session, or storage state.
- This does not prove all hardcoded tenant or vertical assumptions are extracted.

## Follow-Up Residual Risks
- Runtime now depends on `src/config/productization/tenant.ts` through `SITE_CONFIG` and `STORE_META_COPY`.
- Owner review may still be needed for static metadata before broader tenant authoring.
- Hero, sections, specs, checkout, shipping/payment wording, Product Search, and Cesarin assumptions remain scattered for later lanes.
