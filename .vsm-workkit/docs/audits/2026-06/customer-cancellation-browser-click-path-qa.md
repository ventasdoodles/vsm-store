# Customer Cancellation Browser Click-Path QA

Date: 2026-06-01

Verdict: PASS

## Scope

Focused real-system browser QA for the customer cancellation click-path only. The goal was to prove the customer UI flow from a fresh pending order through `Cancelar búsqueda`, verify the DB state, and clean up the exact dummy rows without touching protected retained evidence.

No implementation, source changes, docs/canon changes, DB/RPC/migration changes, browser login archaeology, or broader lifecycle work are claimed by this note.

## Environment

- Client UI: `http://127.0.0.1:5173`
- Project: `iVoy Cliente Dev`
- Project ref: `inlvpbiphrrfrdvsadnh`
- Customer QA identity: `qa_client@ivoy.com`
- Admin QA identity for cleanup/readback: `qa_admin@ivoy.com`
- Repo: `C:\dev\vsm-store-fresh\.vsm-workkit`

## Order ID

- Fresh QA order: `5f77577f-f673-4c62-93e7-af4c69017a26`

## Browser Routes Used

- `http://127.0.0.1:5173/auth`
- `http://127.0.0.1:5173/new/shopping`
- `http://127.0.0.1:5173/order/5f77577f-f673-4c62-93e7-af4c69017a26`

## UI Observations

- Customer login succeeded.
- `new/shopping` required selecting a payment method before submission.
- After selecting `Efectivo`, the order creation navigated to the order page.
- The order page showed `Cancelar búsqueda`.
- Clicking `Cancelar búsqueda` and accepting the confirmation returned the UI to the home surface.
- No error toast or stuck spinner was observed.

## Initial DB State

- `status = pending`
- `driver_id = null`
- `base_fare = 55`
- `customer_offer_fare = 55`
- `final_fare = 0`
- `estimated_cost = 55`
- `user_id = 63cc3cda-bc02-4794-96c4-579dd7360e1d`
- `order_offers = 0`
- `wallet_transactions = 0`

## Final DB State

- `status = cancelled`
- `driver_id = null`
- `base_fare = 55`
- `customer_offer_fare = 55`
- `final_fare = 0`
- `estimated_cost = 55`
- `order_event` created: `9326e0cb-9023-4dab-a11c-27181e159eab`
- `order_offers = 0`
- `wallet_transactions = 0`

## Cleanup Evidence

- Deleted exact related `wallet_transactions` rows for the order only.
- Deleted exact related `order_events` rows for the order only.
- Deleted exact related `order_offers` rows for the order only.
- Deleted exact `orders` row for `5f77577f-f673-4c62-93e7-af4c69017a26`.
- After-check:
  - `orders remaining = 0`
  - `order_events remaining = 0`
  - `order_offers remaining = 0`
  - `wallet_transactions remaining = 0`

## Protected Retained Evidence Verification

- `31b64a10-4b05-41c8-95e5-fcfe8971a65d`: untouched
- `dbeb5226-e539-443f-b56f-3ae6a5641488`: untouched
- `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`: untouched

## Driver Baseline Verification

- Driver: `4c0882b4-7cd3-4fc7-b9bb-309891c49842`
- `balance = 500.00`
- `reserved_balance = 0.00`
- `availability_status = libre`

## Accepted Claims

- The customer cancellation browser click-path is proven on a fresh QA order.
- The exact order transitioned from `pending` to `cancelled`.
- One `order_event` was recorded for `pending -> cancelled`.
- No `order_offers` or `wallet_transactions` were created for the order.
- Exact-ID cleanup was completed.
- Protected retained evidence orders remained untouched.
- Driver baseline remained unchanged.
- This closes the earlier browser/client click-path residual for customer-safe cancellation.

## Residual Risks

- No material residual remains on the customer cancellation click-path itself.
- The usual global non-claims still apply.

## Non-Claims

- No production readiness claim.
- No real payments or payouts claim.
- No GPS or tracking claim.
- No real notifications claim.
- No real rider or courier claim.
- No deploy or live-smoke claim.
- No full security or compliance claim.
- No full customer -> driver -> delivered flow claim from this lane.
- No driver acceptance claim.
- No admin cancellation claim.

## Next Recommended Move

Keep this cancellation browser proof in canon and preserve the current driver baseline and retained evidence orders for future bounded lanes only.
