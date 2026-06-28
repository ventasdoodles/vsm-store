# Live Monitor Cancel Review Resolution Proof v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane extends the client live marketplace lifecycle monitor so it proves `cancel_review` resolution end to end in the real QA Supabase environment.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `90e53735eef45bb1c88b97027507b443b7838911`
- Message: `test(client): prove cancel review resolution in live monitor`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Problem Truth

The marketplace runtime already had:

- `cancel_review` lifecycle state
- admin UI resolution actions
- RPC `resolve_marketplace_cancel_review`
- durable `customer_incidents` ledger

But the live client-side QA monitor still stopped early:

- pickup no-show reached `cancel_review`
- dropoff support release reached `cancel_review`
- then the monitor stopped

That left a real proof gap on two important business branches:

- whether admin resolution actually closes the order correctly
- whether the incident ledger is marked resolved
- whether the driver's resguarded commission state is released correctly

So the project had source and migration coverage, but not recurring runtime proof of full operational closure.

## Behavior Accepted

This lane accepts the following live-monitor behavior:

- `pickup_no_show_release` must not stop at `cancel_review`.
- It must resolve through `resolve_marketplace_cancel_review` with `driver_no_fault_release`.
- `dropoff_support_release` must not stop at `cancel_review`.
- It must resolve through `resolve_marketplace_cancel_review` with `support_release_no_fault`.
- In both cases the monitor must verify:
  - final order status `cancelled`
  - `driver_id = NULL`
  - latest `customer_incidents` row is `resolved`
  - incident `resolution` matches the applied admin resolution
  - QA driver `balance`, `reserved_balance`, and `availability_status` return exactly to the pre-scenario snapshot

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 3 passed (4)
Failure: monitor source did not contain resolve_marketplace_cancel_review coverage
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  4 passed (4)
```

The accepted contract now requires:

- RPC `resolve_marketplace_cancel_review`
- helper `expectResolvedCustomerIncident`
- dynamic resolution phase `resolve_marketplace_cancel_review_${resolution}`
- explicit runtime resolutions:
  - `driver_no_fault_release`
  - `support_release_no_fault`

## Implementation Truth

`scripts/monitor-live-order-lifecycle.cjs` now adds:

- `expectResolvedCustomerIncident(...)`
- `resolveCancelReviewAndExpectClosed(...)`
- cancel-review resolution step inside `runPickupNoShowRelease(...)`
- cancel-review resolution step inside `runDropoffSupportRelease(...)`

Method truth:

- the monitor snapshots QA driver financial state before each scenario
- the driver-side operational exception still occurs first
- admin resolution is then executed through the real RPC with the real QA admin session
- final order state, incident resolution, and driver financial restoration are all verified from current DB state

## Fresh Local Runtime Proof

Real QA monitor proof from the client checkout passed:

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=7
LIVE_ORDER_LIFECYCLE_PASS orderId=5527a3cc-a56a-4c28-986b-a0a6371997de scenarios=7 phases=41
```

The generated summary `qa-temp/live-order-lifecycle-summary.json` recorded:

- pickup no-show scenario order `5e25fbed-6655-4e7b-9526-0d82a5d04abf`
  - phase `resolve_marketplace_cancel_review_driver_no_fault_release`
  - expected terminal status `cancelled`
- dropoff support release scenario order `e7955f25-6605-4f0b-b9f2-28bc094dc124`
  - phase `resolve_marketplace_cancel_review_support_release_no_fault`
  - expected terminal status `cancelled`

This is real runtime proof from the current Supabase QA users and current project state, not only source proof.

## Fresh Local Proof

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts src/test/DriverAssignedLifecycle.test.tsx
Test Files  2 passed (2)
Tests  8 passed (8)
exit 0
```

```text
npm run test:run
Test Files  90 passed (90)
Tests  546 passed | 2 skipped (548)
exit 0
```

```text
npm run typecheck
exit 0
```

```text
npm run lint
exit 0
```

```text
npm run build
exit 0
```

```text
node --check scripts/monitor-live-order-lifecycle.cjs
exit 0
```

```text
git diff --check
exit 0
```

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit 90e5373 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Non-Claims

- No new customer-facing UI behavior
- No new DB migration or remote apply in this commit
- No hosted browser E2E
- No production deploy proof
- No physical mobile/GPS/payment/push/WhatsApp proof
- No global marketplace completion claim
