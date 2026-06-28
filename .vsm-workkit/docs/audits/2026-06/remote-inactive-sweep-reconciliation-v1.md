# Remote Inactive Sweep Reconciliation v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane reconciles a real remote Supabase runtime drift in the marketplace inactive sweep lifecycle for stale driver assignments awaiting customer acceptance.

- Repo: `F:\ivoy\ivoy-admin`
- Commit: `f3a1cf58a12e7e0a3d534061e35a9f6b25465772`
- Message: `fix(admin): reconcile remote inactive sweep lifecycle`
- Files changed:
  - `supabase/migrations/20260624143000_marketplace_inactive_sweep_remote_reconcile_v1.sql`
  - `src/tests/marketplaceInactiveSweepRemoteReconcileMigration.test.js`
  - `src/sw.ts`
  - `src/tests/useOrders.test.ts`

## Problem Truth

The problem was not hypothetical and not limited to local source.

Remote Supabase truth on project `inlvpbiphrrfrdvsadnh` showed:

- `pg_cron` was installed
- cron job `marketplace-inactive-sweep-every-minute` existed and was active
- the job called `SELECT public.sweep_stale_marketplace_orders(NULL);`
- but the live function body only demoted stale rows to `inactive`

That remote function did not perform the full operational cleanup required by the marketplace lifecycle:

- it did not clear `driver_id`
- it did not zero `final_fare`
- it did not zero `commission_amount_snapshot`
- it did not refund the driver's `reserved_balance`
- it did not restore the driver's available `balance`
- it did not restore `availability_status='libre'`

So the remote runtime contradicted local canonical intent and could leave stale financial and assignment residue after inactive sweep.

## Behavior Accepted

This lane accepts the following behavior as canonical:

- A stale order in `awaiting_customer_acceptance` swept to inactive must fully release the driver assignment and the reserved commission hold.
- The order must end with:
  - `status='inactive'`
  - `driver_id = NULL`
  - `final_fare = 0`
  - `commission_amount_snapshot = 0`
- The assigned driver profile must be restored with:
  - returned `reserved_balance`
  - restored available `balance`
  - `availability_status='libre'`
- The minute cron registration for the inactive sweep must remain present and idempotently repairable from migration code.

## TDD Evidence

RED was observed before the implementation:

```text
npm test -- --run src/tests/marketplaceInactiveSweepRemoteReconcileMigration.test.js
Test failed because the required remote-reconcile migration file and contract were absent.
```

The first implementation pass then exposed a second real remote constraint:

```text
Supabase apply_migration
ERROR: permission denied for table job
```

That proved direct `DELETE FROM cron.job` was not valid for the remote role.

GREEN evidence after the migration was corrected to use `cron.unschedule(...)`:

```text
npm test -- --run src/tests/marketplaceInactiveSweepRemoteReconcileMigration.test.js src/tests/marketplaceInactiveSweepMigration.test.js src/tests/marketplaceInactiveCronMigration.test.js
Test Files  3 passed (3)
Tests  6 passed (6)
```

The accepted contract now requires:

- migration file `20260624143000_marketplace_inactive_sweep_remote_reconcile_v1.sql`
- full stale-assignment release semantics inside `sweep_stale_marketplace_orders(...)`
- cron reconciliation via `cron.unschedule('marketplace-inactive-sweep-every-minute')`
- cron reschedule via `cron.schedule(...)`

## Remote Apply And Metadata Proof

Remote migration apply succeeded on Supabase project `inlvpbiphrrfrdvsadnh` under migration name `marketplace_inactive_sweep_remote_reconcile_v1`.

Remote metadata verification then confirmed:

- migration list includes version `20260624134241`
- live function body now includes:
  - `driver_id = NULL`
  - `final_fare = 0`
  - `commission_amount_snapshot = 0`
  - reserved-balance refund
  - balance restoration
  - `availability_status = 'libre'`
- active cron registration still exists with:
  - `jobname='marketplace-inactive-sweep-every-minute'`
  - `schedule='* * * * *'`
  - `command='SELECT public.sweep_stale_marketplace_orders(NULL);'`
  - `active=true`

## Real Runtime Smoke

Fresh runtime proof was taken against the real Supabase project using local QA credentials and a service-role client:

- seed QA driver profile to:
  - `balance=480`
  - `reserved_balance=20`
  - `availability_status='libre'`
- insert a stale QA order with:
  - `status='awaiting_customer_acceptance'`
  - assigned `driver_id`
  - `final_fare=100`
  - `commission_amount_snapshot=20`
  - backdated `updated_at`
- call `sweep_stale_marketplace_orders(orderId)`
- read the order/profile after
- clean up the seeded order and restore the driver profile baseline

Authoritative after-state:

```json
{
  "orderId": "5ef79312-6949-4e73-9850-2a100eeb8740",
  "sweepResult": 1,
  "orderAfter": {
    "status": "inactive",
    "driver_id": null,
    "final_fare": 0,
    "commission_amount_snapshot": 0
  },
  "profileAfter": {
    "balance": 500,
    "reserved_balance": 0,
    "availability_status": "libre"
  }
}
```

This is real runtime proof that the release/refund behavior now executes, not only static migration text proof.

## Fresh Local Proof

```text
npm test
Test Files  86 passed (86)
Tests  306 passed (306)
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
git diff --check
exit 0
```

## Incidental Build-Truth Repairs

These changes were accepted in the same commit because fresh workspace verification exposed them as real blockers to a green local build:

- `src/sw.ts` now has an explicit typed service-worker event surface so the current Admin build is valid again.
- `src/tests/useOrders.test.ts` now uses string-safe `Set<string>` status checks instead of invalid `OrderStatus` casts inside `Set.has(...)`.

These are not a broad feature claim; they are accepted as necessary drift repairs discovered while proving the lane in the current workspace.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy-admin --commit f3a1cf5 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Non-Claims

- No hosted browser E2E for this exact commit
- No Vercel deploy proof
- No physical mobile/GPS/payment/push/WhatsApp proof
- No full marketplace completion claim
- No claim that other remote Supabase functions or lifecycle branches are already reconciled unless separately audited
