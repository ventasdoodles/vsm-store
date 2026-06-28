# Pilot Demo Repeatability Rehearsal

Date: 2026-05-31

## Verdict

ACCEPT WITH RESIDUAL RISK

## Scope

Controlled repeatability rehearsal for the customer -> driver -> admin pilot demo path, plus wallet reconciliation for the new dummy order only.

## Evidence

- Customer used the standard local UI to create a fresh dummy order.
- The verified QA driver credential was re-provisioned outside the repo for this rehearsal.
- Driver used the standard UI to log in, accept the order, and complete the canonical lifecycle.
- Admin used the standard UI to search and expand the exact order card.

## Accepted state

- Fresh dummy order UUID: `dbeb5226-e539-443f-b56f-3ae6a5641488`
- Unique tag: `QA PILOT REHEARSAL 20260531-3`
- Lifecycle proven:
  - `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- Verified QA driver:
  - `id = 4c0882b4-7cd3-4fc7-b9bb-309891c49842`
  - `email = smoke.driver.1780018983741@ivoy.com`
  - `display = Rodrigo Repartidor Demo`
- Driver wallet baseline restored:
  - `balance = 500.00`
  - `reserved_balance = 0.00`
  - `availability_status = libre`
- Exact ledger rows for the new order:
  - `commission_capture -7.50`
  - `commission_refund 7.50`
- Exact counts:
  - `order_events = 5`
  - `order_offers = 0`
  - `wallet_transactions_for_order = 2`
  - `wallet_transactions_for_driver = 3`

## Admin observability

- The exact order was searchable in the admin dashboard.
- The expanded card showed marketplace observability for the delivered order.
- The admin UI matched the DB state for the exact order.

## Residual risk

- The fresh dummy order remains retained as evidence.
- The earlier retained order `31b64a10-4b05-41c8-95e5-fcfe8971a65d` was left untouched.
- The verified credential is managed outside the repo/canon.
- This is local UI + DB evidence, not production/live proof.
- The acceptance basis is documented in this audit lane; the canonization is evidence-backed but procedurally compressed, so the missing standalone acceptance step is recorded only as a procedural residual.

## Non-claims

- No production readiness.
- No real payments/payouts.
- No GPS/tracking.
- No notifications.
- No real rider operations.
- No deploy readiness.
- No full security/compliance.
