# Admin Manual Assignment Unblock And Cross-Surface Funding

Date: 2026-06-20
Status: ACCEPT WITH RESIDUAL RISK

## Scope

Canonize the Admin dispatch unblock lane across:

- Client: `F:\ivoy\ivoy1.6`
- Admin: `F:\ivoy\ivoy-admin`
- Canon/workkit: `C:\dev\vsm-store-fresh\.vsm-workkit`

This lane is limited to the real Admin manual driver-assignment path, the credentialed Admin E2E QA workflow, and the specific cross-surface QA funding defect that remained after the UI unblock. It does not claim broader production readiness.

## Baseline

- `repo-baseline`: PASS.
- `workspace-sync`: PASS.
- Client repo clean/aligned before canon update.
- Admin repo clean/aligned before canon update.
- Canon repo clean/aligned before canon update.

## Problem Sequence

The original blocker was not theoretical:

- Admin browser E2E initially proved the real UI path was not completing cleanly.
- Earlier remote runs timed out waiting for `POST /functions/v1/assign-driver`.
- After UI wiring fixes, the failure changed shape:
  - `assign-driver` returned `{"error":"Order is missing a valid fare for manual driver assignment"}`.

Instrumentation then proved the order did contain valid pricing before assignment:

- `estimated_cost=50`
- `base_fare=50`
- `customer_offer_fare=50`
- `final_fare=0`
- `commission_rate_snapshot=0.15`
- `commission_amount_snapshot=0`

Root cause:

- `supabase/functions/assign-driver/index.ts` resolved fare with `??`.
- `final_fare=0` was treated as a present winner instead of falling through to the positive pricing fields.
- So the function incorrectly concluded the order had no valid fare.

## Accepted Fixes

### 1. Manual assignment fare resolution hardening

Admin commit:

- `9ef518098a78459e93803355b67745afd3ccb56c`
- `fix(admin): fallback manual assignment fare when final fare is zero`

Accepted implementation facts:

- Added `src/utils/manualAssignmentPricing.ts`.
- Added `src/utils/__tests__/manualAssignmentPricing.test.ts`.
- `assign-driver` now resolves the first positive fare candidate from:
  - `final_fare`
  - `customer_offer_fare`
  - `base_fare`
  - `estimated_cost`
- `.gitignore` now ignores `qa-temp/` so E2E artifacts do not keep poisoning repo baseline.

Accepted local verification:

- `npm test -- --run src/utils/__tests__/manualAssignmentPricing.test.ts src/tests/assignDriverStatusContract.test.js`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, `51` files / `189` tests.

Accepted remote proof on this SHA:

- Deploy Admin to Vercel: run `27878762614` PASS.
- Deploy Supabase Functions: run `27878762635` deployed `assign-driver` successfully, then failed later on `find-best-driver` because `esm.sh` returned `522`; this was external and not an `assign-driver` regression.

### 2. Cross-surface QA driver funding hardening

The next remote E2E proof on SHA `9ef5180` changed the truth again:

- `admin-manual-driver-assignment.spec.ts`: PASS.
- `dispatch-ui-lifecycle.spec.ts`: PASS through delivery.
- Remaining failure moved to `driver-assignment-cross-surface.spec.ts`.
- Exact error body:
  - `{"error":"Target driver has insufficient balance to reserve commission"}`

That meant the original UI/manual-assignment blocker was resolved, and the remaining defect was a QA fixture precondition gap.

Admin commit:

- `1b13545074b84106186a597c704abaebe56bd819`
- `fix(admin): fund qa drivers for cross-surface reassignment`

Accepted implementation facts:

- Added `tests/helpers/qa-driver-balance.ts`.
- `tests/driver-assignment-cross-surface.spec.ts` now explicitly tops up the two selected QA drivers with service-role authority before assignment/reassignment.

Accepted local verification:

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npx playwright test tests/driver-assignment-cross-surface.spec.ts --list`: PASS.

Accepted remote proof on this SHA:

- Deploy Admin to Vercel: run `27878936426` PASS.
- Deploy Supabase Functions: run `27878936438` PASS.
- E2E QA: run `27878982801` PASS.

## E2E QA Evidence

### Failure run that proved the unblock boundary

Run:

- `27878826095`

Head SHA:

- `9ef518098a78459e93803355b67745afd3ccb56c`

Accepted modular findings:

- `admin-manual-driver-assignment.spec.ts`: PASS.
- `dispatch-ui-lifecycle.spec.ts`: PASS.
- `driver-assignment-cross-surface.spec.ts`: FAIL.

This run is important because it proved the real manual Admin UI assignment path was no longer the blocker.

### Success run that closed the remaining cross-surface QA blocker

Run:

- `27878982801`

Head SHA:

- `1b13545074b84106186a597c704abaebe56bd819`

Accepted result:

- `E2E QA`: PASS.
- Job `Credentialed Admin E2E QA`: PASS.
- `Run credentialed E2E scenarios`: PASS.
- `Reject skipped or failed E2E scenarios`: PASS.

## Accepted Outcome

This lane materially changed the dispatch QA truth:

- The real Admin manual driver-assignment flow is now remotely proven.
- The longer Admin/customer/driver dispatch lifecycle is now remotely proven.
- The cross-surface reassignment QA path is now remotely proven after explicit QA-driver funding.
- The original claim "`admin-manual-driver-assignment.spec.ts` passes or fails" is now answered with direct evidence:
  - it passes remotely.

## Residual Risks

- This is still QA-runtime/browser proof, not full production readiness.
- No real payments, payouts, or settlement proof.
- No physical GPS/maps/navigation proof.
- No real courier fleet operations proof.
- No notification/WhatsApp proof.
- No physical mobile hardware proof.
- No full observability/compliance/security completeness claim.

## Non-Claims

- No broad launch-ready claim.
- No real payment readiness claim.
- No live courier field-operations claim.
- No full production incident-readiness claim.
- No canon claim beyond the accepted Admin dispatch unblock and cross-surface QA funding lane.
