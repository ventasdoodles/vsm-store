# Marketplace Exception UI E2E Reconciliation v1

Date: 2026-06-22

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane adds hosted browser QA coverage for critical marketplace exceptions: the customer cancels after a driver has already been assigned, the pure marketplace path where a driver accepts from the feed, the customer explicitly confirms, and then the customer cancels, the pickup no-show path where the driver reaches point A, the wait expires, and the driver self-releases without penalty, the dropoff no-show path where the driver reaches point B and requests support-mediated release, the inactive customer offer path where the customer can reactivate, raise the offer, or delete it, plus the Admin cancel-review resolution path where support/cabina resolves the reserved commission. It also stabilizes the existing counteroffer browser QA so the new driver priority feed requirements are represented in test setup.

## Accepted Changes

- Admin commits `2ac43574cec9979dcf8fb965a6d1603f1360c73e`, `9e0785e2ada7b8b550cb5c3d20e8186bff46d6a9`, `64dad391503681846c3d5fdf026b48f9f284c7db`, `18e21b91f3a816fda477e6541473696a8710f376`, `88179eedc78a1a2f1a410c402d6135b48f3c2a59`, and `054f377eb5c2a6dbe3b8244a9ab9e7d01875dc8f`.
- Added `tests/marketplace-exceptions-ui.spec.ts`.
- Expanded the spec with `driver accepts from marketplace, customer confirms, then customer cancels`.
- Expanded the spec with `pickup no-show self-release after wait expires`.
- Expanded the spec with `dropoff no-show support release after wait expires`.
- Expanded the spec with `inactive marketplace order lets customer reactivate raise and delete`.
- Expanded the spec with `admin resolves marketplace cancel review and settles reserved commission`.
- Added the new spec to `npm run test:e2e:critical`.
- `src/tests/verifyE2eQaWorkflow.test.js` now requires marketplace exception UI coverage, `driver_accept_order`, `customer_confirm_marketplace_assignment`, `driver_arrived_marketplace_contact_point`, `driver_release_marketplace_wait`, `customer_no_show_at_pickup`, `driver_request_marketplace_support_release`, `customer_unreachable_at_dropoff`, `awaiting_dropoff_contact`, `mark_marketplace_order_inactive`, `customer_reactivate_marketplace_order`, `customer_raise_marketplace_offer`, `Borrar oferta`, `resolve_marketplace_cancel_review`, `Liberar driver sin culpa`, `Cobrar comision y cerrar`, and `reserved_balance` in the critical E2E suite.
- `scripts/prepare-qa-driver-balance.cjs` and `tests/helpers/qa-driver-balance.ts` now prepare the QA driver as funded, online, available, and located in central Xalapa.
- `tests/visual-residuals.spec.ts` now prepares order coordinates for the priority feed, cleans up its order/offers/events, and resets the QA driver after the counteroffer test.

## Proof

- TDD RED: `npm run test -- src/tests/verifyE2eQaWorkflow.test.js --run` failed because `tests/marketplace-exceptions-ui.spec.ts` did not exist.
- Second TDD RED: the focused contract failed again until the spec contained the direct marketplace accept/customer-confirm/cancel case plus `driver_accept_order` and `customer_confirm_marketplace_assignment`.
- Third TDD RED: the focused contract failed again until the spec contained the pickup no-show self-release case plus `driver_arrived_marketplace_contact_point`, `driver_release_marketplace_wait`, and `customer_no_show_at_pickup`.
- Fourth TDD RED: the focused contract failed again until the spec contained the dropoff no-show support-release case plus `driver_request_marketplace_support_release`, `customer_unreachable_at_dropoff`, and `awaiting_dropoff_contact`.
- Fifth TDD RED: the focused contract failed again until the spec contained the inactive customer offer case plus `mark_marketplace_order_inactive`, `customer_reactivate_marketplace_order`, `customer_raise_marketplace_offer`, and `Borrar oferta`.
- Sixth TDD RED: the focused contract failed again until the spec contained the Admin cancel-review resolution case plus `resolve_marketplace_cancel_review`, `Liberar driver sin culpa`, `Cobrar comision y cerrar`, and `reserved_balance`.
- TDD GREEN: the same focused contract passed `13/13`.
- Targeted hosted marketplace exception proof passed: `npx playwright test tests/marketplace-exceptions-ui.spec.ts --workers=1 --reporter=line` passed `5/5`.
- The marketplace exception spec proved real Client/Admin/Driver/Supabase behavior: order creation, Admin UI driver assignment through `assign-driver`, customer cancellation from tracking, successful `customer-cancel-order` / `customer_cancel_marketplace_order` path, DB status `cancel_review`, live `driver_id` cleared, `cancel_review_driver_id` preserved, driver `availability_status='libre'`, Admin `Cancelacion en Revision` visible, and Driver active-order card absent for the cancelled order.
- The direct marketplace accept spec proved the requested non-Admin assignment path: the customer creates an order, the QA driver sees it in Driver `Solicitudes`, clicks `Aceptar Viaje`, `driver_accept_order` returns `200`, DB reaches `awaiting_customer_acceptance`, Driver active UI keeps the order visible while waiting for customer confirmation, customer clicks `Confirmar asignacion`, `customer_confirm_marketplace_assignment` returns `200`, DB reaches `assigned`, customer cancels from tracking, DB reaches `cancel_review`, live driver assignment is cleared, the preserved driver snapshot remains in `cancel_review_driver_id`, and the driver returns to `availability_status='libre'`.
- The pickup no-show spec proved the point-A exception path: after marketplace accept and customer confirmation, the driver active UI keeps the order, `Ir al origen` moves the order to `to_pickup`, `Llegue al origen` invokes `driver_arrived_marketplace_contact_point` with `200`, DB reaches `awaiting_pickup_contact`, the QA wait timestamp is expired through service-role setup, Driver UI exposes `Liberarme sin penalizacion`, `driver_release_marketplace_wait` returns `200`, DB reaches `cancel_review`, live `driver_id` is cleared, `cancel_review_driver_id` preserves the driver, `cancel_review_reason='customer_no_show_at_pickup'`, Admin renders `Cancelacion en Revision`, and the driver returns to `availability_status='libre'`.
- The dropoff no-show spec proved the point-B exception path: after marketplace accept, customer confirmation, pickup, and in-transit transition, Driver active UI reaches `awaiting_dropoff_contact`, `Llegue al destino` invokes `driver_arrived_marketplace_contact_point` with `200`, the QA wait timestamp is expired through service-role setup, Driver UI exposes `Solicitar liberacion por soporte`, `driver_request_marketplace_support_release` returns `200`, DB reaches `cancel_review`, live `driver_id` is cleared, `cancel_review_driver_id` preserves the driver, `cancel_review_reason='customer_unreachable_at_dropoff'`, `cancel_review_reason_note='Driver requested support release at dropoff.'`, Admin renders `Cancelacion en Revision`, and the driver returns to `availability_status='libre'`.
- The inactive customer offer spec proved the customer-side inactive path: customer-created orders are marked inactive through `mark_marketplace_order_inactive`, the Client tracking page renders `Oferta inactiva`, `Reactivar`, `Subir oferta`, and `Borrar oferta`, reactivation calls `customer_reactivate_marketplace_order` and returns DB status `pending`, raise-offer calls `customer_raise_marketplace_offer` and returns DB status `pending` with fare `80 -> 88`, and deleting the inactive offer with reason `mistake` returns DB status `cancelled` with `cancel_review_reason='mistake'`.
- The Admin cancel-review resolution spec proved the support/cabina closure path: customer-created QA orders are placed in `cancel_review` with driver snapshot and controlled reserved commission, Admin renders `Cancelacion en Revision`, `La comision sigue resguardada`, `Liberar driver sin culpa`, and `Cobrar comision y cerrar`, the Admin UI calls `resolve_marketplace_cancel_review` with `200`, no-fault release returns DB status `cancelled` with `cancel_review_resolution='driver_no_fault_release'`, clears live `driver_id`, releases driver `reserved_balance` from `20 -> 0`, and restores balance to `500`; charge-commission closure returns DB status `cancelled` with `cancel_review_resolution='charge_commission'`, clears live `driver_id`, releases `reserved_balance` from `20 -> 0`, and keeps balance at `480`.
- Counteroffer stabilization proof passed: `node scripts/prepare-qa-driver-balance.cjs` returned `QA_DRIVER_BALANCE_PREP_PASS ... is_online=true`, and `npx playwright test tests/visual-residuals.spec.ts -g "Counteroffer UI" --workers=1 --reporter=line` passed `1/1`.
- Previous full critical hosted E2E proof passed before this final Admin-resolution addition: `npm run test:e2e:critical -- --reporter=line` passed `13/13`.
- Focused hosted Admin cancel-review resolution proof passed: `npx playwright test tests/marketplace-exceptions-ui.spec.ts -g "admin resolves marketplace cancel review and settles reserved commission" --workers=1 --reporter=line` passed `1/1`.
- Local Admin proof passed: `npm run test -- src/tests/verifyE2eQaWorkflow.test.js --run` `13/13`, focused source tests `25/25`, TypeScript, full Vitest `81` files / `289` tests, `npm run lint`, `npm run build`, and `git diff --check`.
- Admin repo after push is clean and aligned with `origin/main` at `054f377`, divergence `0 0`.

## Operating Policy Follow-up Proof

- Admin commit `02127ae5f16d0b1fe14d4b32971792fe77c9f7c1` adds a central `cancelReviewPolicy` taxonomy for cancel-review operations.
- Admin `OrderCardActions` now shows `Recomendacion operativa`, reason-specific guidance, `Impacto comision`, and `Cliente` before cabina/support resolves a cancel review.
- Covered policy reasons include pickup no-show (`customer_no_show_at_pickup` -> recommend `driver_no_fault_release` and customer admonition without automatic charge), dropoff no-show (`customer_unreachable_at_dropoff` -> recommend support-mediated release/return handling), support release, changed mind, mistake, and a conservative default policy.
- The lane found and fixed a real integration bug: `useSmartPrefetch` populated the shared `['orders']` React Query cache without marketplace/cancel-review fields, which could make Admin render the generic default policy even when the database had `cancel_review_reason`. The prefetch select now includes fare, wait, cancel-review driver/reason/note/resolution fields.
- `tests/helpers/admin-dispatch.ts` now opens Admin order cards with a QA cache-buster query so browser E2E reads freshly mutated orders instead of stale route state.
- Contract coverage now includes `src/tests/orderPrefetchMarketplaceContract.test.js`, `src/utils/__tests__/cancelReviewPolicy.test.ts`, `OrderCardActions` UI coverage, and the critical marketplace E2E workflow contract requiring `Recomendacion operativa` and `Impacto comision`.

Fresh proof:

- TDD RED: the initial local preview E2E failed because the second cancel-review card rendered `Revision operativa` default despite DB seeding a pickup no-show reason.
- Root cause evidence: DB poll proved `cancel_review_reason='customer_no_show_at_pickup'`; rendered error context showed the Admin card still displaying default `Revision operativa`, which led to the prefetch-cache fix.
- Focused source proof passed: `npm run test -- src/components/__tests__/OrderCardActions.test.tsx src/utils/__tests__/cancelReviewPolicy.test.ts src/tests/orderPrefetchMarketplaceContract.test.js src/tests/verifyE2eQaWorkflow.test.js --run` -> `4` files / `23` tests passed.
- Fresh local preview E2E passed against `http://127.0.0.1:4177` Admin, `https://ivoyapp.vercel.app` Client, and Supabase `inlvpbiphrrfrdvsadnh`: `npx playwright test tests/marketplace-exceptions-ui.spec.ts -g "admin resolves marketplace cancel review and settles reserved commission" --workers=1 --reporter=line` -> `1/1` passed, proving no-fault and charge resolution via `resolve_marketplace_cancel_review` after the policy UI rendered.
- Local Admin gates passed: `npx tsc -b --pretty false`, `npm run lint`, full `npm run test -- --run` -> `83` files / `293` tests passed, `npm run build`, and `git diff --check`.
- Attempted full critical E2E suite produced useful partial evidence but is not accepted as green: `6/14` passed, including the updated Admin cancel-review policy scenario; `8/14` failed because local `SUPABASE_SERVICE_ROLE_KEY` was absent for money/funding checks and two `assign-driver` flows hit `net::ERR_FAILED`. This is retained as residual environment/runtime debt, not hidden.
- Admin commit `02127ae5f16d0b1fe14d4b32971792fe77c9f7c1` was pushed to `origin/main`.
- Post-push GitHub Actions for `02127ae588781fbec52b997cef7755ef81d83197` triggered and failed before useful execution on all observed Admin workflows. `Quality Gates` run `27958875865` / job `82734558980` has `steps: []`, `gh run view 27958875865 --log-failed` returned `log not found`, and the failure is retained as external Actions/runtime blockage rather than green remote proof.

## Residual Risk

- This lane changes QA/tooling and browser evidence only; it does not change production runtime behavior.
- No new DB migration, Edge Function deploy, or Vercel deploy is claimed.
- The updated full critical suite was not re-run end-to-end in this shell because local `SUPABASE_SERVICE_ROLE_KEY` is not present; the new Admin-resolution scenario was run focused using local QA credentials materialized in the client checkout.
- Remaining marketplace/accounting variants still need closure beyond this lane: broader support-operations workflow, dispute policy taxonomy, and final operational policy review for commission-hold decisions outside the two proven no-fault/capture outcomes.
- The operating policy taxonomy is product/admin guidance only; it does not add legal/compliance policy enforcement, automatic customer penalties, support SLA automation, or new ledger/accounting semantics.
- No production deploy is claimed for `02127ae`; production will only reflect the UI after the existing deploy pipeline succeeds.
- No GitHub Actions green proof is claimed for `02127ae`; observed workflows failed before useful logs/steps.
- No physical mobile, GPS movement, payment settlement, push notification, WhatsApp delivery, or real courier operation proof is claimed.
