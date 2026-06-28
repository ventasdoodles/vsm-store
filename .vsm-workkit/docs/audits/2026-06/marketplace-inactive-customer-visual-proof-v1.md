# Marketplace Inactive Customer Visual Proof v1

Date: 2026-06-22
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Close the remaining customer visual proof gap for inactive marketplace offers. The customer must not see an inactive offer as active, waiting, published, or visible to drivers; they must clearly see inactive state, allowed actions, and cancellation reasons.

## Code State

- Client repo: `F:\ivoy\ivoy1.6`
- Remote: `ventasdoodles/ivoy`
- Commit: `399aac51c70dd7a7191ea2c4a3fb140fe15196b1`
- Short commit: `399aac5`
- Branch state after push: `main...origin/main`, divergence `0 0`

## Changes

- `components/OrderConfirmationStep.tsx`
  - Inactive marketplace orders now render as paused/out of active feed.
  - Removed inactive-state contradictions from secondary guide copy, role cards, status indicator, and ambient tracking copy.
  - Preserved inactive actions: `Borrar oferta`, `Reactivar`, `Subir oferta (+10%)`.

- `qa-temp/private-mvp-multiscenario-harness.cjs`
  - Captures `inactive-reactivation\inactive-customer-actions.png` before lifecycle RPC mutation.
  - Records `customerCapture.quality=meaningful_inactive_customer_actions`.
  - Adds inactive visual artifact to `customerVisualTarget.artifactPaths`.
  - Hardens counteroffer proof by clicking the exact first counteroffer option after proving it is a single visible locator.
  - Confirms a pending `order_offers` row through Supabase before asserting the Driver pending-offer UI.

- `src/test/OrderConfirmationStep.test.tsx`
  - Regression proves inactive UI does not render `Esperando respuestas`, `Oferta visible para repartidores disponibles`, `puede verse en Disponibles`, `Solicitud publicada`, or `Mientras el pedido sigue publicado`.

- `src/test/localMultiscenarioHarness.test.ts`
  - Contract coverage requires inactive screenshot capture, inactive visual artifact propagation, exact counteroffer-option click, and Supabase-backed pending-offer confirmation.

## Evidence

- Final multiscenario QA:
  - Client: `http://localhost:4173`
  - Admin: `https://ivoy-admin.vercel.app`
  - Supabase project: `inlvpbiphrrfrdvsadnh`
  - Evidence root: `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-2026-06-22T15-47-37-299Z`
  - Result: all 9 scenarios passed.

- Passing scenarios:
  - `direct-accept`
  - `counteroffer-roundtrip`
  - `awaiting-customer-acceptance`
  - `inactive-reactivation`
  - `cancel-review-resolution`
  - `pickup-wait-release`
  - `dropoff-support-release`
  - `admin-wrong-role-recovery`
  - `mobile-logout-and-switch`

- Final inactive screenshot:
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-2026-06-22T15-47-37-299Z\inactive-reactivation\inactive-customer-actions.png`
  - Visible: `Oferta inactiva`, `Pedido pausado temporalmente`, `La publicacion salio del feed activo`, `Oferta fuera del feed activo`, `Oferta pausada fuera del feed activo`, predefined cancellation reasons, `Borrar oferta`, `Reactivar`, and `Subir oferta (+10%)`.
  - Not visible: `Esperando respuestas`, `Oferta visible para repartidores disponibles`, `Solicitud publicada`, `puede verse en Disponibles`, and `Mientras el pedido sigue publicado`.

## Verification

- `npm run test:run -- src/test/OrderConfirmationStep.test.tsx src/test/localMultiscenarioHarness.test.ts`
  - `2` files passed.
  - `46` passed / `2` skipped.
- `npm run test:run`
  - `88` files passed.
  - `525` passed / `2` skipped.
  - Existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` text printed while process exited `0`.
- `npm run typecheck`
  - Pass.
- `npm run lint`
  - Pass.
- `npm run build`
  - Pass.
- `node --check qa-temp\private-mvp-multiscenario-harness.cjs`
  - Pass.
- `node qa-temp\private-mvp-multiscenario-harness.cjs --self-test-visual-target-contract`
  - Pass with `ok=true`.
- Local QA preflight
  - `CONTRACT_CHECK: PASS`, `READY_FOR_QA_RUN`.
- `git diff --check`
  - Pass.
- Browser plugin local load
  - `http://127.0.0.1:5174/` loaded as `VSM Store`, no framework overlay, meaningful content present.
  - Only expected OneSignal-not-configured warnings were observed.

## Findings During QA

- Running the local harness against `http://127.0.0.1:5174` failed the counteroffer scenario because the deployed `driver-create-counteroffer` Edge Function CORS allowlist accepts `http://localhost:4173` but not `http://127.0.0.1:5174`.
- Final proof used `vite preview` on `http://localhost:4173`, an allowed origin, and passed 9/9.
- This is a QA-environment constraint, not a marketplace lifecycle logic failure.

## Residual Risks

- This lane proves local/dev Client preview plus hosted Admin/Supabase behavior for commit `399aac5`; it does not claim a fresh hosted production Client deploy proof for this exact commit.
- GitHub Actions for `399aac5` completed with conclusion `failure` before useful execution; representative Client Quality Gates run `27965593381` showed `steps: []`, and `gh run view --log-failed` returned `log not found`.
- Existing full Vitest non-fatal `PUBLIC_HTML_CONTRACT_FAIL` output remains a separate public HTML contract issue.
- No real payments, GPS, push, WhatsApp, physical mobile/PWA, field operations, full security/compliance, or full production readiness proof is claimed.
