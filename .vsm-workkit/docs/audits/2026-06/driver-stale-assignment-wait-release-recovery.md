# Driver Stale Assignment + Wait Release Recovery v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `ff9e346b6dccd6302208bba61320507f03a63f90`
- Message: `fix(driver): recover stale assignment and wait release`
- Files changed:
  - `components/DriverOrderActions.tsx`
  - `src/test/DriverOrderActions.test.tsx`

## Behavior Accepted

This lane hardens driver-side stale lifecycle actions in the assigned-trip flow.

Accepted stale assignment-cancel behavior:

- If `driver_cancel_marketplace_assignment` reports stale state such as `Order no longer pending`, the driver surface treats the response as authoritative state drift.
- `onStatusChange()` is triggered to refresh the parent driver view.
- The driver sees:

`Este viaje ya cambio de estado. Actualizamos tu vista.`

- The generic inline mutation error is not shown.

Accepted stale pickup self-release behavior:

- If `driver_release_marketplace_wait` reports stale state such as `Only the assigned driver can release this wait.`, the driver surface treats that as authoritative state drift.
- `onStatusChange()` is triggered to refresh the parent driver view.
- The driver sees:

`Este viaje ya cambio de estado. Actualizamos tu vista.`

- The generic inline mutation error is not shown.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/DriverOrderActions.test.tsx
Tests  2 failed | 11 passed (13)
Failures:
- stale assignment cancellation did not trigger onStatusChange
- stale pickup self-release did not trigger onStatusChange
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/DriverOrderActions.test.tsx
Test Files  1 passed (1)
Tests  13 passed (13)
```

The regression tests require:

- exact `driver_cancel_marketplace_assignment` RPC call
- exact `driver_release_marketplace_wait` RPC call
- `onStatusChange()` invoked for stale-state recovery
- truthful stale-state toast
- no generic inline mutation-error banner

## Fresh Local Proof

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
Tests  539 passed | 2 skipped (541)
exit 0
```

```text
npm run build
exit 0
```

## Known Non-Blocking Output

- Full Vitest still prints pre-existing `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning while exiting `0`.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs:

```text
gh run list --repo ventasdoodles/ivoy --commit ff9e346 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No authenticated browser stale driver-cancel or stale wait-release run for this commit.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
