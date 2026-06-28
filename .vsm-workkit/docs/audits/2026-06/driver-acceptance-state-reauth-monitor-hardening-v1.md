# Driver Acceptance-State Reauth Monitor Hardening v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane hardens live marketplace lifecycle proof around the earliest driver lock-in state: once the driver accepts a trip and the order reaches `awaiting_customer_acceptance`, the trip must still remain attached to that same driver across reauth/app reopen until somebody actually closes it.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `740e2257a169eda6f345da520d021b60f58147c8`
- Message: `test(client): require acceptance-state driver reauth monitoring`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Behavior Accepted

This lane extends the live monitor so driver reauth persistence is now required as soon as the driver accepts the order.

Accepted behavior:

- After `driver_accept_order` moves the order to `awaiting_customer_acceptance`, the monitor reauthenticates the QA driver before customer confirmation.
- The fresh authenticated driver session must still read the same order in `awaiting_customer_acceptance`.
- The order must still be attached to the same `driver_id`.
- This keeps monitor proof aligned with the operational rule that a driver does not lose the trip simply by closing/reopening the app while waiting for the customer confirmation.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 2 passed (3)
Failure: monitor did not contain reauth recovery assertion for awaiting_customer_acceptance
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  3 passed (3)
```

The regression contract now requires:

- `expectDriverReauthActiveTripRecovery(...)` during accepted-order setup
- `expectedStatus: 'awaiting_customer_acceptance'`

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

This lane intentionally did not claim a fresh full live monitor PASS for commit `740e225`.

The current local boundary remains:

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_FAIL missing_env=SUPABASE_SERVICE_ROLE_KEY
```

So this lane proves stronger source/test monitor requirements, but not a new service-role-backed live run for this exact commit.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit 740e225 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
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
