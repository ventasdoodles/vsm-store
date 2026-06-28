# Audit Detail: Customer-Safe Cancellation RPC + Client Wiring + SQL QA

**Date:** 2026-05-31
**Verdict:** ACCEPT WITH RESIDUAL RISK

## Scope
- Canon reconciliation for the accepted customer-safe cancellation package only.
- Canon truth source: admin RPC migration, client wiring/tests, and connected Supabase SQL QA.

## Commits
- **Admin repo:** `332d496 feat(db): add customer cancellation rpc`
- **Client repo:** `b3f9a8a fix(client): route customer cancellation through refund rpc`

## Repo State Summary
- Canon repo baseline was clean on `origin/main` before docs edits, with an unrelated untracked `docs/operations/AUTH_PROFILES_STABILIZATION_HANDOFF.md` present.
- No source/runtime/test files were modified outside canon docs.

## Migration / Source Summary
- The accepted migration source is `F:\ivoy\ivoy-admin\supabase\migrations\20260531235950_customer_cancel_order_and_refund.sql`.
- The deployed function is `public.customer_cancel_order_and_refund(uuid)`.
- Verified properties from connected Supabase SQL QA:
  - `SECURITY DEFINER`
  - `search_path = public, pg_temp`
  - owner `postgres`
  - `authenticated` can execute
  - `anon` cannot execute
  - `auth.uid()` ownership gate present
  - ownership validated through `orders.user_id = auth.uid()`
  - allowed statuses: `pending`, `assigned`, `to_pickup`

## Client Wiring Summary
- Customer cancellation paths in the client call `customer_cancel_order_and_refund`.
- Direct customer cancellation bypass via `.update({ status: 'cancelled' })` is not used in the inspected paths.
- `admin_cancel_order_and_refund` is not used by the inspected customer cancellation paths.
- Tests cover:
  - confirm dismiss
  - RPC success
  - RPC error
  - RPC throw

## Validation Summary
- Admin `git diff --check HEAD~1..HEAD` passed.
- Client `npx tsc --noEmit` passed.
- Client targeted vitest for `OrderConfirmationStep.test.tsx` and `HistoryStep.test.tsx` passed.
- Client full test suite passed: `28` test files, `260` tests.
- Client `git diff --check HEAD~1..HEAD` passed.

## SQL QA Evidence
- Project: `iVoy Cliente Dev` (`inlvpbiphrrfrdvsadnh`)
- Owned pending dummy order:
  - `11111111-1111-4111-8111-111111111111`
  - `pending -> cancelled`
- Owned assigned dummy order:
  - `22222222-2222-4222-8222-222222222222`
  - offer `33333333-3333-4333-8333-333333333333`
  - `assigned -> cancelled`
  - driver balance `469.10 -> 500.00`
  - reserved balance `0.00 -> 0.00`
- Disallowed status dummy order:
  - `44444444-4444-4444-8444-444444444444`
  - `picked_up` remained unchanged
  - expected error: `Order cannot be cancelled in its current status.`
- Wrong owner dummy order:
  - `55555555-5555-4555-8555-555555555555`
  - `pending` remained unchanged
  - expected error: `Order not found or not owned by current user.`
- Order events were created inside the transactional QA path.

## Cleanup / Rollback Evidence
- SQL QA ran transaction-isolated and rolled back.
- Dummy orders remaining: `0`
- Dummy offers remaining: `0`
- Dummy events remaining: `0`
- Dummy wallet transactions remaining: `0`
- Retained evidence orders untouched:
  - `31b64a10-4b05-41c8-95e5-fcfe8971a65d`
  - `dbeb5226-e539-443f-b56f-3ae6a5641488`
  - `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`

## Accepted Claims
- The customer-safe cancellation RPC is deployed and behaves as intended on the connected Supabase project.
- The client now routes customer cancellation through `customer_cancel_order_and_refund`.
- The inspected customer cancellation paths no longer rely on a direct status update bypass.
- The SQL QA server-side evidence is sufficient for acceptance of the RPC behavior.

## Residual Risks
- Browser/client click-path remains unproven.
- SQL QA is transaction-isolated and server-side only; it does not replace full UX proof.
- Client worktree still has unrelated `qa-temp/` noise outside commit scope.

## Non-Claims
- No production readiness.
- No real payments/payouts.
- No GPS/tracking.
- No real notifications.
- No real rider/courier operations.
- No full security/compliance claim.

## Next Recommended Move
- Focused browser/client click-path QA for customer cancellation, without reopening SQL/server-side proof.
