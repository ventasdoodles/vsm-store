# Competitive Marketplace Hosted QA Reconciliation 2026-06-22

Status: ACCEPT WITH RESIDUAL RISK

## Scope

- Client repo `F:\ivoy\ivoy1.6` commits `8b90755c84b77c683e80944a029b103ae7aee403` and `1dbbf918d1484c5f77e03743b6b89563fc5de66c`
- Admin repo `F:\ivoy\ivoy-admin` commit `7ab821d4bc7a1598ec349f93788dc8c9be53b6ca`
- Canon repo `C:\dev\vsm-store-fresh\.vsm-workkit`

## Accepted changes

- Client adds stable marketplace QA selectors:
  - `driver-marketplace-card-${order.id}`
  - `driver-counteroffer-option-${order.id}-${percent}`
  - `driver-active-order-card-${order.id}`
- Client hosted harness no longer depends on fragile fare/copy matching. It actively switches to `Disponibles`, keys fixture assertions by order id/details, retries the driver/admin surfaces once with diagnostic screenshots, and accepts either the old or current rejected-counteroffer copy.
- Client follow-up commit `1dbbf91` strengthens direct-accept customer visual proof. The harness now waits for the real customer confirmation surface (`Confirmar asignacion`, `Repartidor listo, falta tu confirmacion`, and `Confirma para cerrar la asignacion`) before writing `direct-accept\client-order-after-direct-accept.png`, and records `customerCapture.quality=meaningful_direct_accept_confirmation`.
- Admin adds stable marketplace observability selectors:
  - `admin-order-card-${order.id}`
  - `admin-order-details-toggle-${orderId}`
  - `admin-marketplace-observability-${orderId}`
- Admin hardens marketplace observability rendering when Supabase numeric fields arrive as strings.
- Admin runtime fix: `OrderHistoryTimeline` now reads drivers via `useDrivers({ realtime: false })`, while `useDrivers` itself supports snapshot-only callers and uses stable per-hook channel names instead of reusing the conflicting fixed realtime channel name.

## Local verification accepted

- Client:
  - `npm run test:run -- src/test/localMultiscenarioHarness.test.ts src/test/pilotDemoVisualHarness.test.tsx`
  - Follow-up RED/GREEN: `npm run test:run -- src/test/localMultiscenarioHarness.test.ts` first failed until the direct-accept customer confirmation surface was required, then passed `13/13`.
  - Follow-up focused proof: `npm run test:run -- src/test/localMultiscenarioHarness.test.ts src/test/verifyE2eQaWorkflow.test.ts` passed `25/25`.
  - Follow-up visual target self-test: `node qa-temp\private-mvp-multiscenario-harness.cjs --self-test-visual-target-contract` returned `ok=true` with `directCustomerProof=true`.
  - Follow-up full proof: Vitest `88` files / `521` passed / `2` skipped, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
  - `npm run build`
  - `git diff --check`
- Admin:
  - `npm test -- --run src/hooks/__tests__/useDrivers.test.tsx src/tests/supabaseClientRuntimeConfig.test.ts src/components/__tests__/OrderCardCostNotes.test.tsx`
  - `npm run build`
  - `git diff --check`

## Production deploy evidence accepted

- Client manual Vercel production deployment:
  - Deployment id: `dpl_He7RHtYmW2ZYpqkZLWfSUxCrYReh`
  - Aliased URL: `https://ivoyapp.vercel.app`
- Admin manual Vercel production deployment:
  - Deployment id: `dpl_G6fZGmp4G8xxgPG3bJcsDKrLfPqm`
  - Aliased URL: `https://ivoy-admin.vercel.app`

## Hosted end-to-end evidence accepted

- Fresh run label: `2026-06-22T08-30-27-920Z`
- Evidence root: `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-2026-06-22T08-30-27-920Z`
- All scenarios passed:
  - `direct-accept`
  - `counteroffer-roundtrip`
  - `awaiting-customer-acceptance`
  - `inactive-reactivation`
  - `cancel-review-resolution`
  - `pickup-wait-release`
  - `dropoff-support-release`
  - `admin-wrong-role-recovery`
  - `mobile-logout-and-switch`

## Follow-up hosted evidence accepted

- Fresh run label: `2026-06-22T15-10-00-682Z`
- Evidence root: `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-2026-06-22T15-10-00-682Z`
- Hosted targets: `https://ivoyapp.vercel.app` and `https://ivoy-admin.vercel.app`
- Supabase project: `inlvpbiphrrfrdvsadnh`
- All nine scenarios passed again.
- Direct-accept order: `efc67938-09a7-44e5-89af-7d500a57cce1`
- Direct customer proof is no longer weak: `customerCapture.quality=meaningful_direct_accept_confirmation`, `customerVisualTarget.state=PASS`, `code=null`, `inspectionRequiredBeforeCleanup=false`.
- Screenshot proof: `direct-accept\client-order-after-direct-accept.png` visibly renders `Repartidor listo, falta tu confirmacion` and the `Confirmar asignacion` button.

## Residual risks

- The previous direct-accept customer loading-state residual is closed by the `1dbbf91` follow-up and fresh hosted run `2026-06-22T15-10-00-682Z`.
- This lane proves local verification, manual production deploy, and hosted authenticated marketplace QA only.
- It does not claim real payments, GPS/tracking, notification delivery, physical mobile/PWA hardware proof, real courier operations, or full security/compliance proof.

## External blocker explicitly recorded

- Post-push GitHub Actions did not run successfully, but the root cause is external billing, not a code regression.
- Representative runs:
  - Client Quality Gates `27939651155`
  - Client Vercel `27939651167`
  - Admin Quality Gates `27939651184`
  - Admin Vercel `27939651208`
- Shared annotation from the run summary:
  - `The job was not started because recent account payments have failed or your spending limit needs to be increased.`
- Follow-up client Actions for `1dbbf91` also failed before useful logs: Client Quality Gates `27963189605`, Smoke Public Runtime `27963189519`, Lighthouse CI `27963189632`, Deploy Client to GitHub Pages `27963188813`, and Deploy Client to Vercel `27963188972`; representative jobs had `steps: []`, and `gh run view --log-failed` returned `log not found`.

## Non-claims

- No successful post-push GitHub Actions claim is made for these commits.
- No GitHub Pages deploy proof is made.
- No Supabase schema or migration apply happened in this lane.
- No broader production-readiness claim is made beyond the bounded marketplace proof above.
