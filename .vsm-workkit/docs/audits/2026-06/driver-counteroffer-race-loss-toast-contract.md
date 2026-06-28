# Driver Counteroffer Race-Loss Toast Contract

Date: 2026-06-24
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

Client commit `3c71c939a80c92aaee458294a53c29175989e41d` adds regression coverage for the driver counteroffer race-loss path in the competitive marketplace.

Accepted files:

- `components/DriverMarketplace.tsx`
- `src/test/DriverMarketplace.test.tsx`

## Accepted Behavior

When a driver attempts a counteroffer after the order has already left the pending marketplace state, the UI must show the truthful race-loss message:

`Este pedido ya fue tomado por otro repartidor.`

The component already used `getMarketplaceRaceLossRecovery(...)` in the counteroffer catch path. This lane makes that behavior a required test contract and cleans the indentation around the existing accept/counteroffer `toast.error(...)` calls.

## Evidence

- Focused Vitest passed: `npm run test:run -- src/test/DriverMarketplace.test.tsx src/test/marketplaceRaceLossRecovery.test.ts` with `2 files / 12 tests`.
- Full Client Vitest passed: `90 files / 531 passed / 2 skipped`.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed with LF/CRLF warnings only.

## Remote Actions

GitHub Actions for `3c71c93` are not green:

- Deploy Client to GitHub Pages `28096639065`: failure.
- Client Quality Gates `28096639033`: failure.
- Smoke Public Runtime `28096639019`: failure.
- Lighthouse CI `28096639008`: failure.
- Deploy Client to Vercel `28096639000`: failure.

Representative Quality job `83187665054` had `steps: []`, and `gh run view --log-failed` returned `log not found`.

## Residual Risk

- No browser-authenticated multi-driver race was run for this specific commit.
- No DB/schema/RPC/Edge Function behavior changed.
- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest path warning while exiting `0`.
- Build still prints pre-existing Lightning CSS/Tailwind at-rule and large Mapbox chunk warnings.
- No production deploy proof, physical mobile/GPS/payment/push/WhatsApp/real courier proof, or global marketplace completion is claimed.

