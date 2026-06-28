# Driver Stale Arrival Wait Tracking Recovery v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `64debc95676495bd1a2418e31d71f8f3fe83d9ff`
- Message: `fix(driver): recover stale arrival wait tracking`
- Files changed:
  - `components/DriverOrderActions.tsx`
  - `src/test/DriverOrderActions.test.tsx`

## Behavior Accepted

This lane hardens driver arrival-to-wait transitions when the driver acts on stale UI.

Accepted behavior:

- If `driver_arrived_marketplace_contact_point` reports stale state such as `Only the assigned driver can start wait tracking.`, `Order is not ready for pickup wait.`, or `Order is not ready for dropoff wait.`, the driver surface treats the response as authoritative state drift.
- `onStatusChange()` is triggered to refresh the parent driver view.
- The driver sees:

`Este viaje ya cambio de estado. Actualizamos tu vista.`

- The generic inline mutation error is not shown.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/DriverOrderActions.test.tsx
Tests  1 failed | 15 passed (16)
Failure: stale dropoff arrival wait tracking did not trigger onStatusChange
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/DriverOrderActions.test.tsx
Test Files  1 passed (1)
Tests  16 passed (16)
```

The regression test requires:

- exact `driver_arrived_marketplace_contact_point` RPC call for `dropoff`
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
Tests  542 passed | 2 skipped (544)
exit 0
```

```text
npm run build
exit 0
```

```text
Browser local smoke
http://127.0.0.1:4201/ loaded
header auth navigation reached /auth
console errors/warnings: 0
```

## Known Non-Blocking Output

- Full Vitest still prints pre-existing `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning while exiting `0`.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned queued/waiting runs:

```text
gh run list --repo ventasdoodles/ivoy --commit 64debc95676495bd1a2418e31d71f8f3fe83d9ff --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
Smoke Public Runtime queued
Deploy Client to Vercel queued
Deploy Client to GitHub Pages waiting
Lighthouse CI queued
Client Quality Gates queued
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No authenticated browser stale arrival wait-tracking run for this commit.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
