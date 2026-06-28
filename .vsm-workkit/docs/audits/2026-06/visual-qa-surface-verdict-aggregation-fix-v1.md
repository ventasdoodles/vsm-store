# Visual QA Surface Verdict Aggregation Fix v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Repair a real QA-tooling false negative in the hosted Playwright visual verification path. The credentialed browser suite could pass all scenarios while `scripts/verify-playwright-visual-qa-results.cjs` still failed because the summary file contains multiple entries for the same surface and the verifier only inspected the first match.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `b4e5496`
- Message: `fix(client): accept mixed visual surface evidence`

## Changes

- `scripts/verify-playwright-visual-qa-results.cjs`
  - No longer treats the first matching `surface` entry as authoritative.
  - Now groups all entries for each required surface (`customer`, `driver`, `admin`) and accepts the run when at least one entry for that surface is `PASS`.
  - Still fails honestly when:
    - a required surface is missing entirely
    - a required surface has only `BLOCKED` / non-pass verdicts
    - Playwright stats contain `skipped`, `unexpected`, or `flaky` results

- `src/test/verifyE2eQaWorkflow.test.ts`
  - Adds a regression contract for the exact mixed-summary case:
    - duplicate `customer` and `driver` entries
    - earlier `BLOCKED` entries followed by later `PASS` entries
    - verifier must still return `PLAYWRIGHT_VISUAL_QA_PASS`

## Evidence

- Fresh contract proof passed:
  - `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - result: `20 passed`

- Fresh hosted/browser suite still passed on current head:
  - `npm run test:e2e`
  - result: `9 passed`
  - surfaces exercised:
    - customer walkthrough
    - customer marketplace remount persistence
    - customer stale marketplace action recovery
    - customer stale counteroffer recovery
    - driver marketplace/dashboard
    - driver priority surface
    - driver profile settings surface
    - admin observability dashboard

- Fresh verifier rerun against the real generated artifacts now passes:
  - `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - result: `PLAYWRIGHT_VISUAL_QA_PASS expected=9 surfaces=3`

- Fresh cleanup also passed:
  - `npm run cleanup:e2e-visual-targets`
  - result: `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=11 status=deleted`

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - `20` passed.

- `npm run test:e2e`
  - `9` passed.

- `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - `PLAYWRIGHT_VISUAL_QA_PASS expected=9 surfaces=3`

- `npm run cleanup:e2e-visual-targets`
  - Pass.

## Residual Risks

- This lane fixes a QA verifier truth bug; it does not introduce new product/runtime marketplace behavior.
- The summary still records mixed `PASS`/`BLOCKED` scenario rows for the same surface. That is now interpreted correctly by the verifier, but the summary format remains multi-row rather than normalized.
- No new DB/schema/RPC/Edge Function change, remote apply, deploy proof, physical mobile proof, payment proof, GPS proof, or global marketplace completion claim is made.
