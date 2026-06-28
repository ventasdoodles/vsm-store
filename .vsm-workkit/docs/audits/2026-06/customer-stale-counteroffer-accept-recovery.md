# Customer Stale Counteroffer Accept Recovery

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Client commit `cc695d71a530404d1ebaae952433ecb7519a9713` hardens the customer-side counteroffer acceptance race in the competitive marketplace.

Accepted files:

- `components/OrderConfirmationStep.tsx`
- `src/test/OrderConfirmationStep.test.tsx`

## Accepted Behavior

When the customer taps `Aceptar` on a counteroffer that is no longer pending, the UI now:

- Detects stale counteroffer/order errors such as `Offer is no longer pending`.
- Refetches the authoritative order.
- Refetches the authoritative offers.
- Shows `Esta contraoferta ya no esta disponible. Actualizamos tus opciones.`
- Avoids a false success toast.

This prevents the customer from being left with a stale pending offer after another lifecycle transition wins the race.

## TDD Evidence

The new focused test first failed before implementation. The failure proved only one `/orders` fetch occurred after stale counteroffer accept failure, so the UI did not perform authoritative recovery.

After implementation, focused proof passed:

- `npm run test:run -- src/test/OrderConfirmationStep.test.tsx`
- `1 passed file`
- `31 passed / 2 skipped`

## Full Local Verification

- Full Client Vitest passed: `90 files / 532 passed / 2 skipped`.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed with LF/CRLF warnings only.

Known non-blocking warnings remain:

- Full Vitest prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest path warning while exiting `0`.
- Build prints pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## Remote Actions

GitHub Actions for `cc695d7` are not green:

- Smoke Public Runtime `28096974059`: failure.
- Lighthouse CI `28096974115`: failure.
- Deploy Client to Vercel `28096974091`: failure.
- Client Quality Gates `28096974089`: failure.
- Deploy Client to GitHub Pages `28096974088`: failure.

Representative Quality job `83188794730` had `steps: []`, and `gh run view --log-failed` returned `log not found`.

## Residual Risk

- No browser-authenticated customer/driver race was run for this specific commit.
- No DB/schema/RPC/Edge Function behavior changed.
- No Supabase remote apply or production deploy proof is claimed.
- No physical mobile/GPS/payment/push/WhatsApp/real courier proof is claimed.
- No global marketplace completion is claimed.

