# Customer Stale Counteroffer Reject Recovery

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Client commit `a58d84780d41126cce7a556062b0af1765ab818b` hardens the customer-side stale counteroffer rejection path in the competitive marketplace.

Accepted files:

- `components/OrderConfirmationStep.tsx`
- `src/test/OrderConfirmationStep.test.tsx`

## Accepted Behavior

When the customer taps `Rechazar` on a counteroffer that is no longer pending, the UI now:

- Detects stale counteroffer/order errors using the existing stale counteroffer detector.
- Refetches authoritative offers.
- Removes stale pending accept/reject UI.
- Shows `Esta contraoferta ya no esta disponible. Actualizamos tus opciones.`
- Avoids the false success toast `Contraoferta rechazada.`

This mirrors the stale accept recovery and prevents stale counteroffer UI from staying visible after the lifecycle has already moved on.

## TDD Evidence

The new focused test first failed before implementation. The failure proved only one `/order_offers` fetch occurred after stale reject failure, so the UI did not perform authoritative offers recovery.

After implementation, focused proof passed:

- `npm run test:run -- src/test/OrderConfirmationStep.test.tsx`
- `1 passed file`
- `32 passed / 2 skipped`

## Full Local Verification

- Full Client Vitest passed: `90 files / 533 passed / 2 skipped`.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed with LF/CRLF warnings only.

Known non-blocking warnings remain:

- Full Vitest prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest path warning while exiting `0`.
- Build prints pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## Remote Actions

GitHub Actions for `a58d847` are not green:

- Deploy Client to Vercel `28097296675`: failure.
- Deploy Client to GitHub Pages `28097296557`: failure.
- Client Quality Gates `28097296562`: failure.
- Smoke Public Runtime `28097296619`: failure.
- Lighthouse CI `28097296580`: failure.

Representative Quality job `83189876468` had `steps: []`, and `gh run view --log-failed` returned `log not found`.

## Residual Risk

- No browser-authenticated customer/driver race was run for this specific commit.
- No DB/schema/RPC/Edge Function behavior changed.
- No Supabase remote apply or production deploy proof is claimed.
- No physical mobile/GPS/payment/push/WhatsApp/real courier proof is claimed.
- No global marketplace completion is claimed.

