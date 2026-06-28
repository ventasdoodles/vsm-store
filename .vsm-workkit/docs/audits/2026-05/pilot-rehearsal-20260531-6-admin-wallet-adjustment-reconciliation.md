# Pilot Rehearsal 20260531-6 Admin Wallet Adjustment Reconciliation

Date: 2026-05-31

## Verdict

ACCEPT WITH RESIDUAL RISK

## Scope

Controlled customer -> driver -> admin pilot rehearsal for the local MVP demo lane, plus wallet reconciliation for the fresh dummy order only.

## Evidence

- Customer used the standard local UI to create a fresh dummy order.
- The verified QA driver credential was available for this rehearsal.
- Driver used the standard UI to log in, accept the order, and complete the canonical lifecycle.
- Admin used the standard UI to search and expand the exact order card.

## Accepted state

- Fresh dummy order UUID: `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`
- Unique tag: `QA PILOT REHEARSAL 20260531-6`
- Lifecycle proven:
  - `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- Verified QA driver:
  - `id = 4c0882b4-7cd3-4fc7-b9bb-309891c49842`
  - `email = smoke.driver.1780018983741@ivoy.com`
  - `display = Rodrigo Repartidor Demo`
- Order pricing:
  - `base_fare = 55`
  - `customer_offer_fare = 55`
  - `final_fare = 55`
  - `commission_rate_snapshot = 0.15`
  - `commission_amount_snapshot = 8.25`
- Exact counts:
  - `order_events = 5`
  - `order_offers = 0`
  - `wallet_transactions_for_order = 1`
- Exact order ledger rows:
  - `commission_capture -8.25`
- Driver wallet baseline restored:
  - `balance = 500.00`
  - `reserved_balance = 0.00`
  - `availability_status = libre`
- Reconciliation detail:
  - the driver restoration was done via separate `admin_adjust_driver_wallet(+8.25, adjustment)`
  - the restoration was not order-linked `commission_refund`

## Admin observability

- The exact order was searchable in the admin dashboard.
- The expanded card showed marketplace observability for the delivered order.
- The admin UI matched the reported DB state for the exact order.

## Residual risk

- The fresh dummy order remains retained as evidence.
- The accounting reconciliation used a separate admin adjustment.
- This is local UI + reported DB evidence, not production/live proof.
- The reconciliation pattern is bounded and should not be generalized as final production accounting semantics.

## Non-claims

- No production readiness.
- No real payments or payouts.
- No deposits or withdrawals.
- No GPS or tracking.
- No notifications.
- No real rider/courier operations.
- No deploy/live-smoke proof.
- No full security/compliance proof.
- No full cleanup or deletion claim.
- No claim that the fresh dummy order was removed.
