# Customer Stale Inactive Offer Actions Recovery v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `2f5f5dcc7132320b05cfbd3ac86537acc1804e02`
- Message: `fix(client): recover stale inactive offer actions`
- Files changed:
  - `components/CustomerCancellationPanel.tsx`
  - `src/test/OrderConfirmationStep.test.tsx`

## Behavior Accepted

This lane hardens inactive marketplace order actions when the customer acts on stale UI.

Accepted reactivation behavior:

- If `customer_reactivate_marketplace_order` reports stale state, including `Order is not inactive.`, the client refreshes authoritative order and offers.
- Stale `Reactivar` UI is removed when the refreshed order is no longer inactive.
- The customer sees:

`La oferta ya no se puede reactivar en este estado. Actualizamos el pedido.`

Accepted raise-offer behavior:

- If `customer_raise_marketplace_offer` reports stale state, including `Order is not active`, the client refreshes authoritative order and offers.
- The customer sees the authoritative next state, such as `awaiting_customer_acceptance` with `Confirmar asignacion`.
- The customer sees:

`La oferta ya no se puede subir en este estado. Actualizamos el pedido.`

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Tests  2 failed | 34 passed | 2 skipped (38)
Failures:
- stale reactivation expected /orders fetch count 2 but got 1
- stale raise-offer did not recover authoritative state
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Test Files  1 passed (1)
Tests  36 passed | 2 skipped (38)
```

The regression tests require:

- `customer_reactivate_marketplace_order` called with `p_order_id`.
- `customer_raise_marketplace_offer` called with `p_order_id` and the raised fare.
- second authoritative order fetch after stale response.
- second offers fetch after stale response.
- stale inactive action removal or authoritative next-state UI.
- truthful stale-action toast.
- no false success toast.

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
Tests  537 passed | 2 skipped (539)
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
gh run list --repo ventasdoodles/ivoy --commit 2f5f5dc --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No authenticated browser inactive reactivation/raise-offer race run for this commit.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
