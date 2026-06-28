# Live Monitor Inactive Sweep Release Proof v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane extends the client live marketplace lifecycle monitor so it proves the inactive-sweep release branch end to end in the real QA Supabase environment.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `7f2cf34428636dc8d93e44d9b5612a5bbe01ae8c`
- Message: `test(client): prove inactive sweep release in live monitor`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Problem Truth

The marketplace backend now had canonical remote reconciliation for stale `awaiting_customer_acceptance` orders, but the client-side live monitor still did not prove that branch.

Before this lane, the monitor covered:

- happy path
- customer cancellation after assignment
- pickup no-show release
- dropoff support release
- pending raise-offer refresh
- driver cancellation returning the order to the feed

It did not prove the specific branch the user explicitly cares about:

- driver accepts
- customer does not respond
- order becomes `inactive`
- driver assignment is released
- reserved commission hold is released

So the system had backend proof and canonical docs, but not recurring live monitor proof from the client checkout.

## Behavior Accepted

This lane accepts the following live-monitor behavior:

- The monitor must include scenario `customer_acceptance_timeout_inactive`.
- That scenario must stop at `awaiting_customer_acceptance`, not auto-confirm the customer.
- It must invoke `sweep_stale_marketplace_orders(orderId)` and verify the order becomes `inactive`.
- It must verify:
  - `driver_id = NULL`
  - `final_fare = 0`
  - `commission_amount_snapshot = 0`
- It must verify the QA driver financial state returns exactly to the pre-scenario snapshot:
  - same `balance`
  - same `reserved_balance`
  - same `availability_status`
- Any temporary timing-setting override used to make the monitor deterministic must be restored before the scenario exits.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 3 passed (4)
Failure: monitor source did not contain scenario customer_acceptance_timeout_inactive
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  4 passed (4)
```

The accepted contract now requires:

- scenario `customer_acceptance_timeout_inactive`
- RPC `sweep_stale_marketplace_orders`
- phase `sweep_stale_marketplace_orders`
- helper `expectInactiveSweepRelease`
- inactive expected-status wiring in the monitor source

## Implementation Truth

`scripts/monitor-live-order-lifecycle.cjs` now:

- adds `fetchDriverFinancialSnapshot(...)`
- adds `fetchMarketplaceTimingSettings(...)`
- adds `setMarketplaceCustomerResponseMinutes(...)`
- adds `expectInactiveSweepRelease(...)`
- adds `createAwaitingCustomerAcceptanceOrder(...)`
- adds scenario `runCustomerAcceptanceTimeoutInactive(...)`

Method truth:

- the scenario snapshots the QA driver's financial state before the accept flow
- creates an order and stops after `driver_accept_order`
- temporarily sets `app_settings.marketplace_customer_response_minutes = 0`
- calls `sweep_stale_marketplace_orders(orderId)`
- verifies inactive order release semantics
- restores the original `marketplace_customer_response_minutes` value in `finally`

This keeps the monitor deterministic without leaving a persistent settings mutation behind.

## Fresh Local Runtime Proof

Real QA monitor proof from the client checkout passed:

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=7
LIVE_ORDER_LIFECYCLE_PASS orderId=5ac3dab3-30f4-48c7-a3f2-0f5dc03bb3e9 scenarios=7 phases=39
```

The generated summary `qa-temp/live-order-lifecycle-summary.json` recorded:

- scenario `customer_acceptance_timeout_inactive`
- order `2963d739-d6b8-48ed-a47f-ecaf1f192da2`
- phases:
  - `created`
  - `driver_accept_order`
  - `driver_reauth_active_trip_recovery`
  - `sweep_stale_marketplace_orders`
- expected terminal status `inactive`

This is real runtime proof from the existing QA users and current Supabase project, not only static source proof.

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
gh run list --repo ventasdoodles/ivoy --commit 7f2cf34 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
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
