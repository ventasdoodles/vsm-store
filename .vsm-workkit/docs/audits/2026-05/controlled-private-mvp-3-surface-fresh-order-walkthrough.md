# Controlled Private MVP 3-Surface Fresh Order Walkthrough

Date: 2026-05-31

## Verdict

ACCEPT WITH RESIDUAL RISK

## Scope

Controlled private MVP 3-surface fresh order walkthrough for the local customer -> driver -> admin path, plus cleanup and reconciliation for the fresh dummy order only.

## Evidence

- Customer used the standard local UI to create a fresh dummy order.
- The verified QA driver credential was available for this walkthrough.
- Driver used the standard UI to log in, accept the order, and complete the canonical lifecycle.
- Admin used the standard UI to inspect the exact order card.

## Accepted state

- Fresh dummy order UUID: `e9fc5a45-100a-48c4-ae58-25371b1f218c`
- Lifecycle proven:
  - `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- Pre-cleanup DB readback:
  - `status = delivered`
  - `driver_id = 5335166a-7e13-4541-927b-b34a01224cca`
  - `final_fare = 55.00`
  - `customer_offer_fare = 55.00`
  - `base_fare = 55.00`
  - `commission_rate_snapshot = 0.150`
  - `commission_amount_snapshot = 8.25`
  - `order_events_count = 5`
  - `order_offers_count = 0`
  - `wallet_transactions_count = 0`
- Driver wallet baseline restored:
  - `balance = 500.00`
  - `reserved_balance = 0.00`
  - `availability_status = libre`
- Cleanup result:
  - `orders` row for the exact order was deleted
  - associated `order_events` rows were deleted
  - `order_offers` remained `0`
  - `wallet_transactions` remained `0` for the exact reference order

## Admin observability

- The exact order was searchable in the admin dashboard.
- The admin UI showed `Error al actualizar estado` during transitions even though the database advanced correctly.
- The admin UI matched the reported DB state for the exact order.

## Residual risk

- The fresh dummy order had no wallet/ledger evidence (`wallet_transactions_count = 0`).
- The admin UI produced the error toast during transitions.
- This is local UI + reported DB evidence, not production/live proof.
- No production/payment/GPS/notification/real rider/deploy/compliance claim is made.

## Non-claims

- No production readiness.
- No real payments or payouts.
- No deposits or withdrawals.
- No GPS or tracking.
- No notifications.
- No real rider/courier operations.
- No deploy/live-smoke proof.
- No full security/compliance proof.
- No full cleanup or deletion claim beyond the exact fresh order.
