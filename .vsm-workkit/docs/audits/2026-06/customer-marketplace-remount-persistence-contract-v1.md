# Customer Marketplace Remount Persistence Contract v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane hardens the customer-side marketplace contract for app reopen/remount while the trip is still operationally open.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `ae2bc63d7b2a3a938f53445ebce8aa290fa924e8`
- Message: `test(client): require customer remount marketplace persistence`
- Files changed:
  - `src/test/OrderConfirmationStep.test.tsx`

## Behavior Accepted

This lane accepts the contract that the customer order screen must remain attached to the same live marketplace trip after the screen is unmounted and mounted again, provided server truth still returns the same order state.

Accepted behavior:

- For `awaiting_customer_acceptance`, the customer still sees `Confirmar asignacion` and the confirmation guidance after remount.
- For `awaiting_pickup_contact`, the customer still sees the point-A wait guidance and the `04:00` countdown after remount.
- For `awaiting_dropoff_contact`, the customer still sees the point-B wait guidance and the `03:00` countdown after remount.
- This keeps customer behavior aligned with the operational rule that an assigned marketplace trip should not disappear from the surface just because the app or screen was reopened before customer, driver, or support closes the trip.

## Method Truth

This lane is regression-contract hardening, not a runtime fix.

The focused test file passed immediately after the three remount contracts were added, so the accepted truth is:

- the behavior already existed in current source/runtime
- the lane adds explicit regression protection so future changes cannot silently break it

No TDD RED/GREEN runtime fix is claimed for this lane.

## Fresh Local Proof

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Test Files  1 passed (1)
Tests  39 passed | 2 skipped (41)
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
Tests  545 passed | 2 skipped (547)
exit 0
```

```text
npm run build
exit 0
```

## Known Non-Blocking Output

- Focused/full verification passed with the same pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings during Vitest.
- Build passed with the same pre-existing Lightning CSS/Tailwind at-rule warnings and large Mapbox chunk warning.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit ae2bc63 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Non-Claims

- No new runtime/UI implementation change outside `src/test/OrderConfirmationStep.test.tsx`
- No DB/schema/RPC/Edge Function change
- No Supabase remote apply
- No browser-authenticated E2E or hosted QA proof
- No service-role-backed live monitor proof
- No physical mobile reinstall proof
- No production deploy proof
- No global marketplace completion claim
