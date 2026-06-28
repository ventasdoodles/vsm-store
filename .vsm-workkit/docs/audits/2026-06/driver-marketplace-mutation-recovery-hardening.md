# Driver Marketplace Mutation Recovery Hardening

Date: 2026-06-04

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Lane Identity

- Client repo: `F:\ivoy\ivoy1.6`
- Previous client baseline: `acdc87d`
- Accepted commit: `67b45fe fix(driver): harden marketplace mutation recovery`
- Canon repo: `C:\dev\vsm-store-fresh\.vsm-workkit`

## Accepted Files

- `F:\ivoy\ivoy1.6\components\DriverMarketplace.tsx`
- `F:\ivoy\ivoy1.6\components\DriverDashboard.tsx`
- `F:\ivoy\ivoy1.6\src\test\DriverMarketplace.test.tsx`

## Accepted Functional Behavior

- Driver accept and counteroffer actions now use a per-order in-flight guard to prevent repeated same-order submissions.
- Driver accept success refreshes marketplace/orders/offers and awaits active-order recovery before switching to `Activos`.
- Driver accept failure refreshes marketplace/offers and avoids a false active-order transition.
- Driver counteroffer success refreshes marketplace/offers.
- Driver counteroffer failure refreshes marketplace/offers.
- This is real Driver marketplace mutation recovery hardening, not copy, polish, or tooling.

## Accepted Test Coverage

- Duplicate rapid accept-click coverage proves `driver_accept_order` is submitted once for the same order.
- Accept success coverage proves marketplace/offers refresh and active-order recovery callback.
- Accept failure coverage proves marketplace/offers refresh and no active-order recovery callback.
- Counteroffer success coverage proves `driver_create_counteroffer` submission and marketplace/offers refresh.
- Counteroffer failure coverage proves marketplace/offers refresh after mutation failure.

## Validation Accepted

- `npm run test:run -- src/test/DriverMarketplace.test.tsx`: PASS, 5/5 tests.
- `npm run test:run -- src/test/DriverMarketplace.test.tsx src/test/pilotDemoVisualHarness.test.tsx`: PASS, 10/10 tests.
- `npm run typecheck`: PASS.
- `git diff --check`: PASS.
- `npm run build`: PASS.
- Client repo final state: clean/aligned `0 0`.
- Canon repo acceptance-audit baseline: clean/aligned `0 0`.

## Residual Risks

- Backend RPC/database race semantics are unchanged and not proven by this client lane.
- No live Supabase/runtime/browser/session/provider/production validation was performed.
- Realtime behavior remains dependent on existing Supabase channel delivery.
- Test output still includes stale `baseline-browser-mapping` / Browserslist warnings, mocked failure-path stderr, and jsdom geolocation warning.
- Build still warns about large chunks and ignored `"use no memo"` directive in `components/DetailsFormStep.tsx`.
- Broader Driver/Admin lifecycle risks remain outside this lane.

## Non-Claims

- No production readiness.
- No production deploy.
- No DB/schema/RPC/auth/Supabase config change.
- No wallet math change.
- No provider/payment/GPS/notification change.
- No live Supabase/runtime/manual browser proof.
- No physical mobile/PWA proof.
- No real courier/rider operations proof.
- No full security/compliance proof.
- No admin/canon/docs change in the implementation lane.
- No client/admin source/test changes in this canon lane.
- No secret/session/storage/token/cookie/auth-header/env inspection.

## Scope Boundary

- This canon entry records accepted Driver marketplace mutation recovery hardening only.
- It does not prove backend race locking, production readiness, or live realtime delivery.
- It does not upgrade readiness beyond the accepted source/test/build validation level.
