# Admin Mutation Rollback / Feedback Hardening

Date: 2026-06-05

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Lane Identity

- Admin repo: `F:\ivoy\ivoy-admin`
- Previous Admin baseline: `63506c6 feat(admin): improve pilot command clarity`
- Accepted commit: `8936efa fix(admin): harden order mutation recovery`
- Canon repo: `C:\dev\vsm-store-fresh\.vsm-workkit`

## Accepted Files

- `F:\ivoy\ivoy-admin\src\components\OrderCardActions.tsx`
- `F:\ivoy\ivoy-admin\src\components\__tests__\OrderCardActions.test.tsx`
- `F:\ivoy\ivoy-admin\src\hooks\__tests__\useOrders.statusMutation.test.tsx`
- `F:\ivoy\ivoy-admin\src\hooks\useOrders.ts`

## Accepted Functional Behavior

- Admin status mutations now have a per-order in-flight guard in `useOrders`.
- Repeated/concurrent status changes for the same order are blocked before duplicate mutation execution.
- The orders query invalidates on mutation settlement to support stale-state recovery after success/failure.
- Failure rolls back optimistic status and surfaces error feedback.
- `OrderCardActions` blocks repeated confirm clicks while mutation is in flight.
- Failed actions do not show false success.
- Failed cancel confirmation keeps the cancel dialog open.
- The accepted cancel path still uses `admin_cancel_order_and_refund` through existing `mutateOrderStatus` behavior.
- Non-cancel transitions still use direct `orders.update({ status })` behavior.
- This is real Admin mutation rollback/recovery hardening, not copy, polish, or tooling.

## Accepted Test Coverage

- `useOrders.statusMutation` coverage proves duplicate same-order status mutation blocking.
- `useOrders.statusMutation` coverage proves rollback to the previous status, error feedback, and query invalidation after a failed non-cancel mutation.
- `useOrders.statusMutation` coverage proves authoritative returned status is stored and a refresh is scheduled after success.
- `OrderCardActions` coverage proves cancel confirmation still waits for confirmation before invoking update.
- `OrderCardActions` coverage proves failed cancel keeps the dialog open and does not show false success.
- `OrderCardActions` coverage proves repeated confirm clicks while a cancel mutation is in flight invoke the mutation only once.
- Existing `orderStatusMutation` coverage preserves cancel RPC routing and non-cancel direct update routing.
- Existing `offlineQueue` coverage preserves cancelled replay through the refund RPC helper.
- Existing pilot demo visual harness coverage remained passing.

## Validation Accepted

- `npx tsc -b`: PASS.
- `npm test -- --run src/components/__tests__/OrderCard.test.tsx src/components/__tests__/OrderCardActions.test.tsx src/hooks/__tests__/useOrders.statusMutation.test.tsx src/services/__tests__/orderStatusMutation.test.ts src/services/__tests__/offlineQueue.test.ts src/components/__tests__/pilotDemoVisualHarness.test.tsx`: PASS, 22/22 tests.
- `git diff --check`: PASS.
- `git show --check 8936efa`: PASS.
- Admin repo final state at acceptance: clean/aligned `0 0`.
- Canon repo acceptance-audit baseline: clean/aligned `0 0`.

## Residual Risks

- Validation is source/test-level only.
- No live Supabase/browser/runtime/manual operator QA was performed.
- Backend RPC/database locking semantics are unchanged and unproven.
- The duplicate guard applies to Admin status mutation flow, not every Admin mutation surface such as driver assignment/auto-assign.
- Realtime delivery remains dependent on existing Supabase channel behavior.
- Test output still includes stale `baseline-browser-mapping` warning and expected mocked rollback stderr.

## Non-Claims

- No production readiness.
- No production deploy.
- No DB/schema/RPC/auth/Supabase config change.
- No provider/payment/GPS/notification proof.
- No client change.
- No QA tooling/runner/handoff/qa-temp change.
- No live Supabase/runtime/manual browser proof.
- No physical mobile/PWA proof.
- No real courier/rider operations proof.
- No full security/compliance proof.
- No admin source/test changes in this canon lane.
- No client source/test changes in this canon lane.
- No secret/session/storage/env/token/cookie/auth-header inspection.

## Scope Boundary

- This canon entry records accepted Admin order status mutation rollback/recovery hardening only.
- It does not prove backend race locking, production readiness, or live realtime delivery.
- It does not upgrade readiness beyond the accepted source/test validation level.
