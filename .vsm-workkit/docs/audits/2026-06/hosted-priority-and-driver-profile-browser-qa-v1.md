# Hosted Priority And Driver Profile Browser QA v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the hosted/browser proof gap for the post-marketplace driver surfaces: `Prioridad` and driver profile settings. The underlying runtime and source-level fields already existed, but there was still no accepted hosted/browser evidence proving those surfaces rendered correctly on the real credentialed QA client.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `9724109`
- Message: `test(client): close hosted priority and profile QA`

## Changes

- `e2e/visual-qa.spec.ts`
  - Adds hosted/browser scenario `driver priority surface`.
  - Adds hosted/browser scenario `driver profile settings surface`.
  - Requires visible runtime hooks for:
    - `driver-priority-tab`
    - `driver-priority-score`
    - `profile-driver-photo`
    - `profile-whatsapp-phone`
    - `profile-vehicle-type`
    - `profile-bank-clabe`

- `src/test/verifyE2eQaWorkflow.test.ts`
  - TDD-gates those hosted/browser scenarios and selectors as part of the critical QA workflow contract.

- `scripts/qa-runtime-env.cjs`
  - Extends the local/runtime QA environment plumbing so the hosted credentialed driver surface can be exercised safely.

- `scripts/prepare-playwright-visual-targets.cjs` and `scripts/cleanup-playwright-visual-targets.cjs`
  - Reconciled so the expanded hosted QA surface remains seedable and cleanable within the same bounded flow.

## Evidence

- Fresh contract proof passed on current head:
  - `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - result: covered by current `20 passed`

- Fresh hosted/browser proof passed on current head:
  - `npm run prepare:e2e-visual-targets`
    - `PLAYWRIGHT_VISUAL_TARGETS_PASS orderId=9243f133-a050-43ad-89cd-daa0a1c8665f`
  - `npm run test:e2e`
    - `9 passed`
  - included hosted driver scenarios:
    - `driver priority surface`
    - `driver profile settings surface`
  - `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
    - `PLAYWRIGHT_VISUAL_QA_PASS expected=9 surfaces=3`
  - `npm run cleanup:e2e-visual-targets`
    - `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=11 status=deleted`

- Current generated hosted/browser summary explicitly records:
  - Driver priority tab loaded with score/review surfaces visible.
  - Driver profile settings loaded with driver-only photo, contact, vehicle, and payout inputs visible.

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - Pass.

- `npm run prepare:e2e-visual-targets`
  - Pass.

- `npm run test:e2e`
  - `9` passed.

- `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - Pass.

- `npm run cleanup:e2e-visual-targets`
  - Pass.

## Residual Risks

- This lane proves hosted/browser rendering and driver credential reachability for the priority/profile surfaces, not remote migration-apply success for every profile/storage schema addition.
- No physical mobile/PWA proof, no full photo authenticity enforcement proof, no payment settlement proof, no GPS proof, and no global marketplace completion claim is made.
