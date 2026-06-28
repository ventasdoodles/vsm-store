# Controlled Customer -> Driver -> Delivered MVP Lifecycle QA

Date: 2026-05-30

## Verdict

ACCEPT WITH RESIDUAL RISK

## Scope

Bounded controlled real-system QA only. Evidence is local standard UI plus DB readback.

## Proven flow

- Customer published dummy order `31b64a10-4b05-41c8-95e5-fcfe8971a65d`.
- Driver `4c0882b4-7cd3-4fc7-b9bb-309891c49842` (`smoke.driver.1780018983741@ivoy.com`) logged in through the standard UI.
- Driver saw the order in the marketplace and accepted it.
- Driver progressed the canonical lifecycle:
  - `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- Admin UI observed the completed order with pricing, internal marketplace observability, and timeline.

## DB proof

- `final_fare = 50.00`
- `commission_rate_snapshot = 0.150`
- `commission_amount_snapshot = 7.50`
- wallet transaction = `-7.50`
- driver balance = `492.50`
- reserved_balance = `0.00`

## Residual risk

- The dummy order remains persisted as evidence.
- No strict cleanup or rollback was performed.
- This is not production proof, payment proof, GPS/tracking proof, notification proof, deploy proof, or full security/compliance proof.

## Non-claims

- No production readiness.
- No real payments/payouts.
- No GPS/tracking.
- No notifications.
- No real rider operations.
- No full security/compliance.
- No live-smoke claim.
