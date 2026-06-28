# Customer Counteroffer Recovery Hardening

Date: 2026-06-04

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Lane Identity

- Client repo: `F:\ivoy\ivoy1.6`
- Accepted commit: `1b18bdc fix(client): harden customer counteroffer recovery`
- Accepted commit: `acdc87d test(client): cover counteroffer recovery mocks`
- Canon repo: `C:\dev\vsm-store-fresh\.vsm-workkit`

## Accepted Files

- `F:\ivoy\ivoy1.6\components\OrderConfirmationStep.tsx`
- `F:\ivoy\ivoy1.6\src\test\OrderConfirmationStep.test.tsx`

## Accepted Functional Behavior

- Customer accept counteroffer now marks the accepted offer non-pending locally before authoritative recovery.
- Accept counteroffer now awaits both authoritative order refresh and offer refresh.
- Customer reject counteroffer now marks the rejected offer non-pending locally before offer refresh.
- Reject counteroffer now awaits offer refresh.
- `order_offers` realtime now refreshes on `INSERT/UPDATE/DELETE` via `event: '*'`.
- New counteroffer toast/WhatsApp simulation remains limited to pending `INSERT` events only.
- This is real customer lifecycle hardening, not copy, polish, or tooling.

## Accepted Test Coverage

- Accept recovery test verifies accept RPC plus second order fetch and second offer fetch.
- Reject recovery test verifies reject RPC, second offer fetch, and removal of the pending accept button.
- Realtime test verifies `event: '*'` and that `UPDATE/DELETE` trigger offer fetches without new-offer toast.
- Commit `acdc87d` adds the missing Supabase mock for assigned-order driver-location lookup noise.

## Validation Accepted

- `npm run test:run -- src/test/OrderConfirmationStep.test.tsx`: PASS, 9/9 tests.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- Client repo final state: clean/aligned `0 0`.
- Canon repo acceptance-audit baseline: clean/aligned `0 0`.

## Residual Risks

- Validation is source/test/build only.
- No live Supabase/runtime/manual browser validation was performed.
- Test output still includes pre-existing jsdom/Mapbox WebGL stderr and stale Browserslist/baseline warnings.
- Build still warns about large chunks and ignored `"use no memo"` directive in `components/DetailsFormStep.tsx`.
- Driver/Admin lifecycle risks are not fixed by this lane.

## Non-Claims

- No production readiness.
- No production deploy.
- No DB/schema/RPC/auth/Supabase config change.
- No provider/payment/GPS/notification change.
- No real WhatsApp delivery proof.
- No live Supabase/runtime/manual browser proof.
- No physical mobile/PWA proof.
- No real courier/rider operations proof.
- No full security/compliance proof.
- No admin/canon/docs change in the implementation lane.
- No client/admin source/test changes in this canon lane.
- No secret/session/storage/token/cookie/auth-header/env inspection.

## Scope Boundary

- This canon entry records accepted Customer counteroffer recovery hardening only.
- It does not fix or claim Driver/Admin lifecycle readiness.
- It does not upgrade readiness beyond the accepted source/test/build validation level.
