# Customer Stale Cancellation Recovery v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `b73107c8deac8f5f4503bc0a1d86a71fc012664e`
- Message: `fix(client): recover stale customer cancellation`
- Files changed:
  - `components/CustomerCancellationPanel.tsx`
  - `src/test/OrderConfirmationStep.test.tsx`

## Behavior Accepted

When the customer submits a structured marketplace cancellation and the backend reports that the order is no longer in a cancellable/pending state, the client now treats that as stale marketplace state instead of leaving the customer on a misleading cancellation surface.

Accepted behavior:

- Edge Function stale response is treated as authoritative.
- Redundant fallback RPC is skipped when Edge already reports stale state.
- Existing `onSuccess` recovery refetches order and offers.
- Customer remains on the order detail screen.
- Refreshed `cancel_review` UI can render when the authoritative order state has moved there.
- Customer sees:

`La cancelacion ya no se pudo aplicar en este estado. Actualizamos el pedido.`

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Tests  1 failed | 33 passed | 2 skipped (36)
Failure: expected /orders?id=eq.99999 fetch count 2 but got 1
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/OrderConfirmationStep.test.tsx
Test Files  1 passed (1)
Tests  34 passed | 2 skipped (36)
```

The regression test requires:

- `customer-cancel-order` Edge Function attempted with structured reason `changed_mind`.
- no redundant `customer_cancel_marketplace_order` fallback RPC after an authoritative stale Edge response.
- second authoritative order fetch after stale response.
- second offers fetch after stale response.
- `Cancelacion en Revision` UI after refreshed order state.
- no navigation home.
- truthful stale-cancellation toast.

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
Tests  535 passed | 2 skipped (537)
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
gh run list --repo ventasdoodles/ivoy --commit b73107c --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

This lane therefore does not claim green CI or deployment proof.

## Non-Claims

- No DB/schema/RPC/Edge Function change.
- No Supabase remote apply.
- No authenticated browser customer/driver stale-cancellation run for this commit.
- No production deploy proof.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
- No global marketplace completion claim.
