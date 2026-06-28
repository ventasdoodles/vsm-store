# Audit: Customer Tracking Route Crash Prevention

## Metadata
* **Date**: 2026-06-02
* **Lane**: Customer Tracking Route Crash Prevention
* **Client Commit**: `48f3b3bc544d09cb67e5d14b9469381287b42975 fix(customer): prevent tracking route database crash`
* **Final Verdict**: ACCEPT WITH RESIDUAL RISK

## Validation Evidence
* `npx vitest run src/test/pilotDemoVisualHarness.test.tsx` PASS.
* `npx tsc -b` PASS.
* `git diff --check` PASS for the scoped client files.

## Accepted Facts
* Lane name: Customer Tracking Route Crash Prevention.
* Verdict: ACCEPT WITH RESIDUAL RISK.
* Client commit: `48f3b3bc544d09cb67e5d14b9469381287b42975 fix(customer): prevent tracking route database crash`.
* The customer tracking route for the known demo fixture slug `/order/fixture-pilot-demo-120-132` now renders a pilot-safe fallback (`Vista de seguimiento no disponible`) instead of raw `PGRST301` or `22P02`.
* `OrderConfirmationStep.tsx` no longer sends an empty Supabase JWT in the audited REST paths.
* `OrderConfirmationStep.tsx` uses a fixture-only guard for the demo slug.
* Real order IDs still follow the normal tracking path.
* The fallback copy is honest and does not claim tracking success.
* The harness test was updated to expect the fallback for the demo slug.
* This is crash prevention and demo-safe fallback behavior, not full customer publish/track runtime readiness.

## Preserved Non-Claims
* No full customer publish/track end-to-end readiness.
* No real order-ID browser proof from this lane.
* No driver runtime readiness proof.
* No admin runtime readiness proof.
* No production readiness.
* No production-grade GPS/SPEI/WhatsApp/balance/payout proof.
* No live browser/Supabase/production proof.
* No claim that all tracking auth/RLS cases are solved.
* Non-JWT failures may still collapse into generic unavailable-tracking copy because `!order` is treated as a safe fallback.
* Fixture routes no longer prove the pending-order walkthrough.
* No claim that the demo fallback means the fixture slug is a real persisted order.
* No admin files changed.
* No canon files changed by implementation/audit.
* No Playwright/e2e files changed.
* No qa-temp files changed.
* No Balance/wallet files changed.
* No GPS/map provider files changed.
* No SPEI/WhatsApp service files changed.
* No DB/schema/RPC/Supabase/Auth/provider/payment/notification changes.
* No lifecycle rules, commission math, wallet ledger semantics, cancellation behavior, or RLS assumptions changed.
* No full security/compliance proof.

## Residual Risks
* The customer demo fixture route is a safe fallback, not a full publish/track PASS.
* Real-order browser proof was not rerun in this audit lane.
* The real tracking path remains source-verified rather than freshly browser-verified.
* The visible fallback is intentionally not a success state.
* The fallback prevents a crash without pretending the fixture slug is a real persisted order.
* `qa-temp/` remains intentional untracked scratch in the client repo.
* Admin and canon were not touched in the implementation lane.
