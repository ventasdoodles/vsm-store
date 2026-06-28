# Driver Wait-State Reauth Monitor Hardening v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane hardens live marketplace lifecycle proof around the rule that a driver must remain tied to the same active trip across app reopen/re-auth while the trip is still in operational wait states.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `88095d837d2ff6d271ebbc0c98953c361ece9eab`
- Message: `test(client): require wait-state driver reauth monitoring`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Behavior Accepted

This lane extends the live monitor so it no longer proves driver reauth persistence only at `assigned`.

Accepted behavior:

- During `pickup_no_show_release`, after `driver_arrived_marketplace_contact_point(... pickup)` moves the order to `awaiting_pickup_contact`, the monitor reauthenticates the QA driver and requires the same order to remain assigned to that same driver in the fresh session.
- During `dropoff_support_release`, after `driver_arrived_marketplace_contact_point(... dropoff)` moves the order to `awaiting_dropoff_contact`, the monitor reauthenticates the QA driver and requires the same order to remain assigned to that same driver in the fresh session.
- This keeps the monitor aligned with the operational rule that an active trip only disappears from the driver surface when customer, driver, or support actually closes/releases it.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 2 passed (3)
Failure: monitor did not contain reauth recovery assertions for awaiting_pickup_contact / awaiting_dropoff_contact
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  3 passed (3)
```

The regression contract now requires:

- `expectDriverReauthActiveTripRecovery(...)` inside `pickup_no_show_release`
- `expectedStatus: 'awaiting_pickup_contact'`
- `expectDriverReauthActiveTripRecovery(...)` inside `dropoff_support_release`
- `expectedStatus: 'awaiting_dropoff_contact'`

## Fresh Local Proof

```text
node --check scripts/monitor-live-order-lifecycle.cjs
exit 0
```

```text
npm run test:run -- src/test/DriverAssignedLifecycle.test.tsx src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  2 passed (2)
Tests  7 passed (7)
exit 0
```

```text
npm run verify:qa-auth-probe
QA_AUTH_PROBE_ROLE_PASS role=customer
QA_AUTH_PROBE_ROLE_PASS role=driver
QA_AUTH_PROBE_ROLE_PASS role=admin
QA_AUTH_PROBE_PASS roles=customer,driver,admin
```

```text
git diff --check
exit 0
warnings: LF will be replaced by CRLF only
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
npm run test:run
Test Files  90 passed (90)
Tests  542 passed | 2 skipped (544)
exit 0
```

```text
npm run build
exit 0
```

## Known Non-Blocking Output

- Full Vitest still prints pre-existing `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning while exiting `0`.

## Live Evidence Boundary

Attempting the full local live monitor after loading `.env.local` produced a truthful environment failure:

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_FAIL missing_env=SUPABASE_SERVICE_ROLE_KEY
```

This lane therefore proves:

- local QA auth credentials still work through `verify:qa-auth-probe`
- source/test monitor behavior now requires wait-state reauth persistence

But it does **not** prove a fresh full live monitor PASS for commit `88095d8` until local service-role material is provided.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit 88095d837d2ff6d271ebbc0c98953c361ece9eab --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No browser-authenticated E2E change.
- No fresh live monitor PASS for this commit because local `SUPABASE_SERVICE_ROLE_KEY` is absent.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
