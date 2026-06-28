# Hosted Active Trip Lifecycle Browser QA v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the remaining hosted/browser proof gap for the long marketplace happy path after assignment: customer remount persistence in operational states, driver active-trip persistence after reload, and driver wait-state visibility through `to_pickup` and `in_transit`.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `e33e59d`
- Message: `test(client): close hosted active-trip lifecycle QA`

## Changes

- `e2e/visual-qa.spec.ts`
  - Hardens `customer marketplace remount persistence` so hosted/browser proof now covers:
    - `awaiting_customer_acceptance`
    - `to_pickup`
    - `in_transit`
    - `awaiting_pickup_contact`
    - `awaiting_dropoff_contact`
  - Adds robust helper `ensureDriverActiveTab(...)` so the driver harness first tries the in-app `Activos` UI and then falls back to `?tab=active`.
  - Strengthens hosted driver lifecycle assertions for:
    - active assigned trip persistence after reload
    - wait-state controls
    - seeded operational notes `qa_browser_driver_to_pickup_v1` and `qa_browser_driver_in_transit_v1`

- `scripts/prepare-playwright-visual-targets.cjs`
  - Seeds extra operational QA orders for `to_pickup` and `in_transit`.
  - Reconciles cleanup preparation to the bounded service-role cleanup path.

- `scripts/cleanup-playwright-visual-targets.cjs`
  - Uses the restricted cleanup RPC path and removes older authenticated-customer cleanup assumptions.

- `scripts/monitor-live-order-lifecycle.cjs`
  - Extends reauth persistence assertions across `STATUS_CHAIN = ['to_pickup', 'picked_up', 'in_transit']`.

- Contracts updated:
  - `src/test/verifyE2eQaWorkflow.test.ts`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Evidence

- Fresh contract proof passed:
  - `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts src/test/verifyLiveOrderLifecycleMonitor.test.ts`
  - result: `24 passed`

- Fresh hosted/browser proof passed on current head:
  - `npm run prepare:e2e-visual-targets`
    - `PLAYWRIGHT_VISUAL_TARGETS_PASS orderId=9243f133-a050-43ad-89cd-daa0a1c8665f`
  - `npm run test:e2e`
    - `9 passed`
  - the hosted driver/browser lane now passed together with:
    - `driver marketplace/dashboard`
    - `driver priority surface`
    - `driver profile settings surface`
  - `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
    - `PLAYWRIGHT_VISUAL_QA_PASS expected=9 surfaces=3`
  - `npm run cleanup:e2e-visual-targets`
    - `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=11 status=deleted`

- Fresh live lifecycle proof also passed on current head:
  - `npm run monitor:live-order-lifecycle`
  - result:
    - `LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=8`
    - `LIVE_ORDER_LIFECYCLE_PASS orderId=1974b3c9-d46a-41ff-89ec-9bc5e65abb9d scenarios=8 phases=51`

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts src/test/verifyLiveOrderLifecycleMonitor.test.ts`
  - `24` passed.

- `npm run prepare:e2e-visual-targets`
  - Pass.

- `npm run test:e2e`
  - `9` passed.

- `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - Pass.

- `npm run cleanup:e2e-visual-targets`
  - Pass.

- `npm run monitor:live-order-lifecycle`
  - Pass.

## Residual Risks

- This lane now proves the long hosted/browser lifecycle and the live monitor on the current QA runtime, but still does not prove physical mobile reinstall behavior on device hardware.
- No new DB/schema/RPC/Edge Function behavior is claimed from this QA lane itself.
- No production deploy proof, payment proof, GPS proof, push/WhatsApp provider proof, or global marketplace completion claim is made.
