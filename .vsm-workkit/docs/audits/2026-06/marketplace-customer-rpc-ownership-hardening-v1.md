# Marketplace Customer RPC Ownership Hardening v1

Date: 2026-06-22

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane closes a real production Supabase RPC ownership defect in the competitive marketplace customer lifecycle. Before the fix, a direct `anon` RPC caller with a different `x-guest-session-id` could cancel another guest order because the customer-facing `SECURITY DEFINER` RPCs did not consistently re-check caller ownership.

## Accepted Changes

- Admin commit `8c6c31f7afa10e6aff30c494f52fa1529f6b7878` adds `supabase/migrations/20260622120205_marketplace_customer_rpc_ownership_hardening_v1.sql`.
- The migration replaces `customer_cancel_marketplace_order`, `customer_confirm_marketplace_assignment`, `customer_reactivate_marketplace_order`, and `customer_raise_marketplace_offer`.
- Each RPC now resolves caller ownership by `auth.uid()` for authenticated customers or by matching `x-guest-session-id` for guest checkout orders where `user_id IS NULL`.
- `service_role` remains allowed so backend Edge Functions can call the RPCs after server-side validation.
- `PUBLIC` execute is revoked and explicit execute remains limited to `anon`, `authenticated`, and `service_role`.
- Regression tests were added to the marketplace offer lifecycle and wait/cancel resolution migration suites.

## Proof

- Local focused tests: `npm run test -- --run src/tests/marketplaceWaitAndResolutionMigration.test.js src/tests/marketplaceOfferLifecycleMigration.test.js` passed `14/14`.
- Local full Admin suite: `npm run test -- --run` passed `81` files / `288` tests.
- Local gates passed: `npm run verify:migration-security`, `npm run lint`, `npm run build`, and `git diff --check`.
- Remote Supabase apply passed on project `inlvpbiphrrfrdvsadnh` with migration name `marketplace_customer_rpc_ownership_hardening_v1`.
- Remote rollback smoke proved wrong guest cancellation is blocked: `guest-intruder-b` could not cancel order owned by `guest-owner-a`; the order remained `pending`.
- Remote rollback smoke proved owner guest cancellation still works: `guest-owner-a` cancelled its own order and the order reached `cancelled` with the expected reason.
- Remote rollback smoke proved owner guest confirm/reactivate/raise flows still work: statuses reached `assigned`, `pending`, and `pending` with raised fare `175.00`.
- Remote metadata confirmed `PUBLIC` execute is false on all four customer RPCs while `anon` and `authenticated` execute remain true behind ownership checks.

## Residual Risk

- The four RPCs remain `SECURITY DEFINER` in `public`; this is accepted only because the lane added explicit ownership checks and narrowed grants. A future security architecture lane should consider moving privileged implementation details out of `public` or wrapping with private helpers.
- No client source changed and no Vercel redeploy was necessary for this DB-only hardening.
- No credentialed browser E2E, physical mobile, GPS, payment, push, WhatsApp, or real courier proof is claimed here.
- GitHub Actions remain externally blocked before useful job execution. Representative run `27951591958` for commit `8c6c31f` failed in 4 seconds with no job steps and no logs.
