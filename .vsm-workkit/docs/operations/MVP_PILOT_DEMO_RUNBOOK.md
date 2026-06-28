# VSM Store - MVP Pilot Demo Runbook

Date: 2026-05-31

## Purpose

Operator script for repeating the controlled local/dev MVP pilot demo across Customer, Driver, and Admin using only standard UI paths and narrow DB readback. This runbook is docs-only and does not authorize runtime changes.

## Evidence level

Level 2 evidence for the operator procedure itself: local UI plus narrow DB readback, grounded in canonized acceptance audits. The underlying flow was already proven in prior accepted audits; this runbook only sequences the repeatable operator steps.

## Required local targets

- Customer / Driver app: `http://127.0.0.1:5173`
- Admin app: `http://127.0.0.1:5174`

If either target is down, stop. Do not improvise alternate targets.

## QA identities to use, without passwords

| Surface | Identity | Role | Notes |
|---|---|---|---|
| Customer | `qa_client@ivoy.com` | user | Standard local customer QA account. |
| Driver | `smoke.driver.1780018983741@ivoy.com` | driver | Verified reusable QA driver; keep available for pilot demo lanes. |
| Admin | `qa_admin@ivoy.com` | admin | Standard local admin QA account. |

Verified driver baseline:

- Profile / auth ID: `4c0882b4-7cd3-4fc7-b9bb-309891c49842`
- Display name: `Rodrigo Repartidor Demo`
- Wallet baseline: `balance = 500.00`, `reserved_balance = 0.00`
- Availability baseline: `availability_status = libre`

Fallback recovery driver, not primary:

- `qa.driver.yavoy.lifecycle@example.com`
- Use only in a separate recovery lane if explicitly authorized.
- Do not use it for the standard pilot demo run.

Passwords, tokens, cookies, storage, and auth headers are intentionally excluded from this runbook.

## Preflight checks

1. Confirm the canonical repos are clean and synced.
2. Confirm the local targets above are reachable.
3. Confirm the QA identities are documented and available.
4. Confirm the canonical evidence orders remain retained:
   - `31b64a10-4b05-41c8-95e5-fcfe8971a65d`
   - `dbeb5226-e539-443f-b56f-3ae6a5641488`
   - `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`
5. Confirm the driver baseline remains `balance = 500.00`, `reserved_balance = 0.00`, `availability_status = libre`.
6. Confirm no step requires secret, token, cookie, localStorage, sessionStorage, or auth-header inspection.

## Customer script

1. Log in through the standard local UI on `http://127.0.0.1:5173`.
2. Create a fresh dummy pilot order using the normal customer flow.
3. Capture the order UUID and a unique demo tag in the order details.
4. Keep the order retained as evidence after the demo.
5. Do not attempt cleanup in this runbook lane.

## Driver script

1. Log in through the standard local UI on `http://127.0.0.1:5173`.
2. Confirm the driver lands on `/driver`.
3. Open the marketplace/active tab relevant to the order.
4. Accept the exact order created in the customer step.
5. Progress the canonical lifecycle through:
   - `assigned`
   - `to_pickup`
   - `picked_up`
   - `in_transit`
   - `delivered`
6. Confirm active orders clear after delivery.
7. Keep the driver wallet baseline clean after the compensation/reconciliation step.

## Admin script

1. Log in through the standard local UI on `http://127.0.0.1:5174`.
2. Search the exact order UUID.
3. Expand the exact order card.
4. Verify the marketplace observability section, status timeline, pricing fields, and driver assignment.
5. Confirm the admin view matches the DB state for the exact order.

## DB readback checklist

Use narrow, exact reads only.

- `orders.id = <exact order UUID>`
- `status = delivered`
- `driver_id = 4c0882b4-7cd3-4fc7-b9bb-309891c49842`
- `order_events` count = `5`
- event sequence:
  - `pending -> assigned`
  - `assigned -> to_pickup`
  - `to_pickup -> picked_up`
  - `picked_up -> in_transit`
  - `in_transit -> delivered`
- `order_offers` count = `0`
- `wallet_transactions` for the exact order matches the selected reconciliation pattern
  - order-linked refund pattern: `wallet_transactions_for_order = 2`
  - separate admin adjustment pattern: `wallet_transactions_for_order = 1`
- driver-level wallet history includes the expected order-linked capture and any explicitly authorized restoration transaction
- driver wallet:
  - `balance = 500.00`
  - `reserved_balance = 0.00`
  - `availability_status = libre`

If the readback does not match, stop.

## Wallet / ledger reconciliation expectations

- The earlier retained evidence pattern is one order-linked capture plus one order-linked compensating refund:
  - `commission_capture -7.50`
  - `commission_refund 7.50`
  - observed on retained orders `31b64a10-4b05-41c8-95e5-fcfe8971a65d` and `dbeb5226-e539-443f-b56f-3ae6a5641488`
- The latest retained rehearsal pattern is different:
  - order `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`
  - order ledger has `commission_capture -8.25`
  - driver restoration used separate `admin_adjust_driver_wallet(+8.25, adjustment)`
  - this restoration is not an order-linked `commission_refund`
- The driver wallet must return to the clean baseline after reconciliation.
- Do not broaden wallet checks beyond the exact driver and exact order.
- Do not attempt cleanup of the ledger history in this runbook lane.
- Do not describe either pattern as final production accounting semantics.

## Evidence retention policy

- Retain the fresh pilot order as evidence.
- Retain the original canonical order `31b64a10-4b05-41c8-95e5-fcfe8971a65d` as historical evidence.
- Retain repeatability evidence order `dbeb5226-e539-443f-b56f-3ae6a5641488`.
- Retain latest rehearsal evidence order `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`.
- Do not delete, cancel, or overwrite any retained evidence order in this runbook lane.

## Cleanup policy

- No cleanup by default.
- Cleanup or rollback is a separate lane and must be explicitly authorized.
- Do not infer cleanup from demo completion.

## Non-claims

- No production readiness.
- No real payments or payouts.
- No GPS or tracking proof.
- No notifications proof.
- No real rider operations.
- No deploy readiness.
- No full security/compliance proof.
- No live-smoke claim.
- No cleanup/deletion claim.
- No final accounting semantics claim.

## Stop conditions

Stop immediately if any of the following are true:

- the operator needs secrets, tokens, cookies, storage, or auth headers;
- a target URL is down or redirects unexpectedly;
- customer login fails;
- driver login fails or does not reach `/driver`;
- admin cannot locate the exact order;
- the DB readback diverges from the expected exact order/driver counts;
- wallet restoration is assumed to be a refund when the evidence shows a separate admin adjustment;
- the order cannot be retained as evidence;
- any step would require production, payment-provider, GPS, notification, or real-rider actions;
- any new overclaim would be needed.

## Operator checklist

- [ ] Repos are clean and synced.
- [ ] Local targets are reachable.
- [ ] QA identities are available without passwords in the runbook.
- [ ] Customer creates the fresh dummy order.
- [ ] Driver accepts and completes the exact order.
- [ ] Admin finds the exact order and confirms observability.
- [ ] DB readback matches the exact lifecycle and counts.
- [ ] Driver wallet returns to `500.00 / 0.00 / libre`.
- [ ] Wallet/ledger reconciliation pattern is recorded as either order-linked refund or separate admin adjustment.
- [ ] Fresh order remains retained as evidence.
- [ ] Prior retained orders remain untouched.
- [ ] No cleanup performed in this lane.

## Exact expected outputs

- Order UUID captured in the customer step.
- Driver lands on `/driver`.
- Admin search returns the exact order card.
- Lifecycle shown as:
  - `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- DB shows:
  - `status = delivered`
  - `order_events = 5`
  - `order_offers = 0`
  - wallet transactions matching the selected reconciliation pattern
  - `balance = 500.00`
  - `reserved_balance = 0.00`
  - `availability_status = libre`
- If the order-linked refund pattern is used:
  - exact order ledger includes `commission_capture`
  - exact order ledger includes `commission_refund`
  - `wallet_transactions_for_order = 2`
  - `wallet_transactions_for_driver = 3`
- If the separate admin adjustment pattern is used:
  - exact order ledger includes `commission_capture`
  - `wallet_transactions_for_order = 1`
  - driver restoration is recorded separately through `admin_adjust_driver_wallet(..., adjustment)`
  - the restoration is not reported as an order-linked `commission_refund`
- Canonical evidence orders remain retained:
  - `31b64a10-4b05-41c8-95e5-fcfe8971a65d`
  - `dbeb5226-e539-443f-b56f-3ae6a5641488`
  - `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`

## Operator note

This runbook is intentionally narrow. It is a repeatable procedure for the proven local/demo lane, not a production or live rollout guide.
