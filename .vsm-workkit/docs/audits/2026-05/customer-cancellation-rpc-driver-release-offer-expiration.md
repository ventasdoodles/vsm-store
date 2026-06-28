# Customer-Safe Cancellation RPC Hardening

**Date:** 2026-05-31
**Verdict:** ACCEPT WITH RESIDUAL RISK

## Scope
- Canon reconciliation for commit `2836afd fix(db): release driver and expire offers on cancellation`.
- The accepted implementation artifact is `F:\ivoy\ivoy-admin\supabase\migrations\20260531240000_harden_customer_cancel_order_and_refund.sql`.

## Facts Reconciled
- Customer cancellation now releases the assigned driver to `availability_status = 'libre'`.
- Active or accepted offers for the cancelled order are closed to `expired`.
- The order still transitions to `cancelled`.
- Driver wallet reconciliation remains at `500.00 / 0.00`.
- `wallet_transactions = 0` remains preserved on the cancel path.
- RPC security posture remains `SECURITY DEFINER` with `search_path = public, pg_temp`.
- Execution remains scoped to `authenticated`; `anon` and `public` cannot execute.

## Validation Summary
- The reported controlled dev DB validation showed the before/after/cleanup sequence:
  - before: `assigned`, driver `491.75 / 8.25 / en_ruta`, offer `accepted`, `order_events = 0`, `wallet_transactions = 0`
  - after cancel: `cancelled`, driver `500.00 / 0.00 / libre`, offer `expired`, `order_events = 1`, `wallet_transactions = 0`
  - cleanup: all dummy-created counts returned to `0`, driver restored to `500.00 / 0.00 / libre`

## Residual Risk
- Browser/client click-path proof remains unproven.
- No production/live-smoke proof is claimed.
- No real payment, payout, GPS, tracking, or notification proof is claimed.
- No real rider/courier proof is claimed.
