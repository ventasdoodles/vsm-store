# Customer Stale Counteroffer Browser QA v1

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the hosted/browser proof gap for customer-side stale counteroffer recovery. The customer UI already had source-level recovery for stale counteroffer accept and reject actions, but there was still no real hosted/browser proof that those recoveries survived the actual Supabase/runtime path when the underlying counteroffer became invalid immediately before the customer click.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `c96353dba986d410e2246253f4ca6e184349efbe`
- Short commit: `c96353d`
- Message: `test(client): prove stale counteroffer recovery in browser qa`

## Changes

- `src/test/verifyE2eQaWorkflow.test.ts`
  - The client QA workflow contract now requires hosted/browser stale counteroffer coverage for:
    - stale customer `Aceptar oferta`
    - stale customer `Rechazar`
    - the truthful stale recovery toast `Esta contraoferta ya no esta disponible. Actualizamos tus opciones.`
    - the authoritative refreshed next-state UI `Tu motociclista esta activo` and `Esperando respuestas...`

- `scripts/prepare-playwright-visual-targets.cjs`
  - Now creates and records two extra QA orders for stale counteroffer recovery:
    - `stale-accept-counteroffer`
    - `stale-reject-counteroffer`
  - Seeds one pending `order_offers` row on each order so the customer reaches a real counteroffer state before the stale mutation.

- `e2e/helpers/visual-targets.ts`
  - Adds `customerStaleCounterofferTargets` artifact support and `resolveCustomerStaleCounterofferTargets()`.

- `e2e/visual-qa.spec.ts`
  - Adds hosted/browser scenario `customer stale counteroffer recovery`.
  - Uses the bounded service-role harness to mutate the authoritative state immediately before the customer click so the real hosted UI hits stale runtime state.
  - Proves two real stale recoveries:
    - stale counteroffer accept refreshes into the assigned state with `Tu motociclista esta activo`
    - stale counteroffer reject refreshes back into the pending marketplace state with `Esperando respuestas...`

- `scripts/cleanup-playwright-visual-targets.cjs`
  - Now deletes the two stale-counteroffer QA orders in addition to the original walkthrough, remount, and stale-action targets.

## Evidence

- Fresh target preparation against hosted runtimes passed:
  - `PLAYWRIGHT_VISUAL_TARGETS_PASS orderId=fe61e788-3081-428d-bb0d-0e51f02d1c6b`
  - artifact path: `F:\ivoy\ivoy1.6\qa-temp\visual-targets.ready.json`

- Fresh hosted/browser Playwright proof passed against:
  - Client: `https://ivoyapp.vercel.app`
  - Admin: `https://ivoy-admin.vercel.app`
  - Result: `7 passed (1.2m)`

- Passing hosted/browser scenarios:
  - `prepare credentialed storage states`
  - `customer walkthrough`
  - `customer marketplace remount persistence`
  - `customer stale marketplace action recovery`
  - `customer stale counteroffer recovery`
  - `driver marketplace/dashboard`
  - `admin observability dashboard`

- The new stale-counteroffer browser scenario proves:
  - stale `Aceptar oferta` shows `Esta contraoferta ya no esta disponible. Actualizamos tus opciones.`, removes the stale accept button, and refreshes into the assigned customer state with `Tu motociclista esta activo`
  - stale `Rechazar` shows the same stale toast, removes the stale accept button, and refreshes into the pending marketplace state with `Esperando respuestas...`

- Fresh cleanup passed after the hosted/browser run:
  - `PLAYWRIGHT_VISUAL_CLEANUP_PASS orders=9 status=deleted`

## Verification

- `npm run test:run -- src/test/verifyE2eQaWorkflow.test.ts`
  - `15` passed.

- `npm run test:e2e:list`
  - `7` tests listed, including `customer stale counteroffer recovery`.

- `npm run verify:e2e-qa-workflow`
  - `E2E_QA_WORKFLOW_PASS target=client`

- `npm run prepare:e2e-visual-targets`
  - Pass.

- `npm run test:e2e`
  - `7` passed.

- `node scripts/verify-playwright-visual-qa-results.cjs qa-temp/playwright-report/playwright-results.json qa-temp/playwright-visual-summary.json`
  - `PLAYWRIGHT_VISUAL_QA_PASS expected=7 surfaces=3`

- `npm run cleanup:e2e-visual-targets`
  - Pass.

- Fresh broad Client verification also passed in this lane:
  - full Client Vitest `90` files / `549` passed / `2` skipped
  - `npm run lint`
  - `npm run build`
  - `git diff --check`

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.
- `git diff --check` still prints LF/CRLF conversion warnings only.

## GitHub Actions Evidence

Fresh lookup for this pushed `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit c96353d --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Residual Risks

- This lane proves hosted/browser stale customer counteroffer recovery on the current QA runtime, not a new production deploy or a global marketplace-complete verdict.
- No new DB/schema/RPC/Edge Function semantics changed in this commit.
- No Supabase remote apply was performed in this lane.
- The broader competitive marketplace lifecycle still has open product lanes outside this proof gap.
- No physical mobile reinstall proof, GPS/payment/push/WhatsApp proof, or full production-readiness proof is claimed.
