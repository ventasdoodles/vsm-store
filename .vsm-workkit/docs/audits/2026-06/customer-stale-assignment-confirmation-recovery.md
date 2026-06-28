# Customer Stale Assignment Confirmation Recovery v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `fd04168d49a9ee6d12767bc96302c0e1d3c67136`
- Message: `fix(client): recover stale assignment confirmation`
- Files changed:
  - `components/OrderConfirmationStep.tsx`
  - `src/test/OrderConfirmationStep.test.tsx`

## Behavior Accepted

When a customer attempts to confirm a marketplace assignment after the assignment/order is no longer pending or available, the client now treats the error as stale marketplace state. The customer surface refreshes authoritative order and offer data, removes the stale `Confirmar asignacion` action when the refreshed order is inactive, and shows:

`La asignacion ya no esta disponible. Actualizamos el estado del pedido.`

The accepted behavior avoids the false success toast:

`Asignacion confirmada. Tu repartidor ya quedo atado al viaje.`

## TDD Evidence

RED was observed before the implementation: the new focused test failed because the stale assignment confirmation path did not refetch order/offers and only one `/orders?id=eq.99999` request occurred.

GREEN evidence after implementation:

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Test Files  1 passed (1)
Tests  33 passed | 2 skipped (35)
```

The regression test requires:

- `customer_confirm_marketplace_assignment` called with `p_order_id: '99999'`
- second authoritative order fetch after stale error
- second offers fetch after stale error
- stale confirm-assignment button removed after refreshed inactive state
- truthful stale-assignment toast shown
- no false assignment-confirmed success toast

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
Tests  534 passed | 2 skipped (536)
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
gh run list --repo ventasdoodles/ivoy --commit fd04168 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No authenticated browser customer/driver race run for this commit.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
