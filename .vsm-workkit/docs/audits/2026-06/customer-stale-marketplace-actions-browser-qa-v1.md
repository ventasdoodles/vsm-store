# Customer Stale Marketplace Actions Browser QA v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the hosted/browser proof gap for customer-side stale marketplace action recovery. The customer UI already had source-level recovery for stale assignment confirmation and stale inactive-order actions, but there was no real hosted/browser proof that those recoveries survived the actual Supabase/runtime path when the order state changed underneath the customer just before the click.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `58215f5c5250f61d954266a416d3c2c9ed165027`
- Short commit: `58215f5`
- Message: `test(client): prove stale customer actions in browser qa`

## Changes

- `src/test/verifyE2eQaWorkflow.test.ts`
  - The client QA workflow contract now requires hosted/browser stale-action coverage for:
    - stale `Confirmar asignacion`
    - stale inactive `Reactivar`
    - stale inactive `Subir oferta (+10%)`
    - the truthful stale recovery toasts for each branch

- `scripts/prepare-playwright-visual-targets.cjs`
  - Now creates and records three extra QA orders for customer stale-action recovery:
    - `stale-confirm-assignment`
    - `stale-reactivate`
    - `stale-raise-offer`
  - Seeds those orders into the initial customer-visible states required before the stale transition:
    - `awaiting_customer_acceptance`
    - `inactive`
    - `inactive`

- `e2e/helpers/visual-targets.ts`
  - Adds `customerStaleActionTargets` artifact support and `resolveCustomerStaleActionTargets()`.

- `e2e/visual-qa.spec.ts`
  - Adds hosted/browser scenario `customer stale marketplace action recovery`.
  - Uses the service-role client only inside the bounded browser harness to mutate the prepared QA orders immediately before the customer click so the real UI hits stale runtime state.
  - Proves three real stale recoveries:
    - assignment confirmation becomes stale and the UI refreshes to inactive
    - inactive reactivation becomes stale and the UI refreshes to resolved cancellation
    - inactive raise-offer becomes stale and the UI refreshes to `awaiting_customer_acceptance`

- `scripts/cleanup-playwright-visual-targets.cjs`
  - Now deletes the three stale-action QA orders in addition to the original walkthrough and remount targets.

## Evidence

- Fresh target preparation against hosted runtimes passed:
  - `PLAYWRIGHT_VISUAL_TARGETS_PASS orderId=9c507a31-71a9-43e7-882e-fa710ee466c8`
  - artifact path: `F:\ivoy\ivoy1.6\qa-temp\visual-targets.ready.json`

- Fresh hosted/browser Playwright proof passed against:
  - Client: `https://ivoyapp.vercel.app`
  - Admin: `https://ivoy-admin.vercel.app`
  - Result: `6 passed (47.5s)`

- Passing hosted/browser scenarios:
  - `prepare credentialed storage states`
  - `customer walkthrough`
  - `customer marketplace remount persistence`
  - `customer stale marketplace action recovery`
  - `driver marketplace/dashboard`
  - `admin observability dashboard`

- The new stale-action browser scenario proves:
  - stale `Confirmar asignacion` shows `La asignacion ya no esta disponible. Actualizamos el estado del pedido.`, removes the confirm button, and refreshes the route into `Oferta inactiva`
  - stale inactive `Reactivar` shows `La oferta ya no se puede reactivar en este estado. Actualizamos el pedido.`, removes `Reactivar`, and refreshes into `Cancelacion resuelta por soporte`
  - stale inactive `Subir oferta (+10%)` shows `La oferta ya no se puede subir en este estado. Actualizamos el pedido.` and refreshes into the customer-confirmation state with `Confirmar asignacion`

- Fresh cleanup passed after the hosted/browser run:
  - `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=7 status=deleted`

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - `14` passed.

- `npm run test:e2e:list`
  - `6` tests listed, including `customer stale marketplace action recovery`.

- `npm run prepare:e2e-visual-targets`
  - Pass.

- `npm run test:e2e`
  - `6` passed.

- `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - `PLAYWRIGHT_VISUAL_QA_PASS expected=6 surfaces=3`

- `npm run cleanup:e2e-visual-targets`
  - Pass.

- Fresh broad Client verification also passed in this lane:
  - `npm run verify:e2e-qa-workflow`
  - full Client Vitest `90` files / `548` passed / `2` skipped
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `git diff --check`

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## GitHub Actions Evidence

Fresh lookup for this pushed `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit 58215f5c5250f61d954266a416d3c2c9ed165027 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Residual Risks

- This lane proves hosted/browser stale customer recovery for the current QA runtime, not a new production deploy or a global marketplace-complete verdict.
- No new DB/schema/RPC/Edge Function semantics changed in this commit.
- No Supabase remote apply was performed in this lane.
- This lane does not yet add hosted/browser proof for stale counteroffer accept/reject recovery.
- No physical mobile reinstall proof, GPS/payment/push/WhatsApp proof, or full production-readiness proof is claimed.
