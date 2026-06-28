# Customer Remount Browser QA Persistence v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the hosted/browser proof gap for the customer-side marketplace remount persistence contract. The customer must stay attached to the same still-open marketplace order after reload/reopen while the runtime remains in `awaiting_customer_acceptance`, `awaiting_pickup_contact`, or `awaiting_dropoff_contact`.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `4517a15e49b8ad0839915c19f9a00eaf1f4d7c2d`
- Short commit: `4517a15`
- Message: `test(client): prove customer remount persistence in browser qa`

## Changes

- `src/test/verifyE2eQaWorkflow.test.ts`
  - The client QA workflow contract now requires hosted/browser remount persistence coverage for:
    - `awaiting_customer_acceptance`
    - `awaiting_pickup_contact`
    - `awaiting_dropoff_contact`
    - `Confirmar asignacion`
    - the point-A and point-B wait copy
    - `page.reload`

- `scripts/prepare-playwright-visual-targets.cjs`
  - Authenticates the QA customer and QA driver.
  - Creates one pending customer walkthrough order plus three operational remount targets.
  - Uses bounded service-role updates to place those three orders into:
    - `awaiting_customer_acceptance`
    - `awaiting_pickup_contact`
    - `awaiting_dropoff_contact`
  - Writes those targets into `qa-temp\visual-targets.ready.json`.

- `e2e/helpers/visual-targets.ts`
  - Adds `customerOperationalTargets` support and `resolveCustomerOperationalTargets()`.

- `e2e/visual-qa.spec.ts`
  - Adds hosted/browser scenario `customer marketplace remount persistence`.
  - Visits each prepared customer route, proves the expected state, reloads the page, and proves the same state again after reload.
  - Captures before/after screenshots and records summary surface `ci-customer-remount-persistence`.

- `scripts/cleanup-playwright-visual-targets.cjs`
  - Deletes the walkthrough order plus all operational remount target orders after the browser run.

## Evidence

- Fresh target preparation against hosted runtimes passed:
  - `PLAYWRIGHT_VISUAL_TARGETS_PASS orderId=29025c65-2aad-4ae6-895f-6bacecb1244a`
  - artifact path: `F:\ivoy\ivoy1.6\qa-temp\visual-targets.ready.json`

- Fresh hosted/browser Playwright proof passed against:
  - Client: `https://ivoyapp.vercel.app`
  - Admin: `https://ivoy-admin.vercel.app`
  - Result: `5 passed (29.5s)`

- Passing hosted/browser scenarios:
  - `prepare credentialed storage states`
  - `customer walkthrough`
  - `customer marketplace remount persistence`
  - `driver marketplace/dashboard`
  - `admin observability dashboard`

- The new remount browser scenario proves:
  - `awaiting_customer_acceptance` still shows `Confirmar asignacion` and `Repartidor listo, falta tu confirmacion` after reload.
  - `awaiting_pickup_contact` still shows `Alguien debe atender al repartidor en el punto de origen`, `Tiempo restante`, and a live countdown after reload.
  - `awaiting_dropoff_contact` still shows `Alguien debe recibir al repartidor en el punto de entrega`, `Tiempo restante`, and a live countdown after reload.

- Fresh cleanup passed after the hosted/browser run:
  - `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=4 status=deleted`

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - `13` passed.

- `npm run prepare:e2e-visual-targets`
  - Pass.

- `npm run test:e2e`
  - `5` passed.

- `npm run cleanup:e2e-visual-targets`
  - Pass.

- Earlier same-lane broad verification also passed before push:
  - `npm run verify:e2e-qa-workflow`
  - full Client Vitest `90` files / `547` passed / `2` skipped
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `git diff --check`

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## GitHub Actions Evidence

Fresh lookup for this pushed `main` commit returned queued workflows, not completed green workflows:

```text
gh run list --repo ventasdoodles/ivoy --commit 4517a15e49b8ad0839915c19f9a00eaf1f4d7c2d --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
Deploy Client to GitHub Pages | queued
Smoke Public Runtime | queued
Lighthouse CI | queued
Client Quality Gates | queued
Deploy Client to Vercel | queued
```

So no CI-green or deploy-green claim is made for this commit.

## Residual Risks

- This lane proves hosted/browser customer remount persistence for the current QA runtime, not a new product behavior change in production.
- No DB/schema/RPC/Edge Function semantics changed in this commit.
- No Supabase remote apply was performed in this lane.
- No physical mobile reinstall proof, GPS/payment/push/WhatsApp proof, or full production-readiness proof is claimed.
- No global marketplace completion claim is made from this lane alone.
