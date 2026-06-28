# Authenticated 3-Surface Visual Bridge Closure

Date: 2026-06-04

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Lane Identity

- Repo: `C:\dev\vsm-store-fresh\.vsm-workkit`
- Accepted lane: authenticated 3-surface visual bridge closure plus multiscenario local/dev QA
- Prior accepted canon baseline: `d96d79d docs: canonize full multiscenario qa evidence repair`
- Fresh run label: `full-multiscenario-qa-visual-bridge-closure`
- Exact run command:
  - `node tools\workflow\vsm-qa-rehearsal.mjs --run-harness --start-dev-servers --require-evidence --run-label full-multiscenario-qa-visual-bridge-closure --json`

## Accepted Runtime Facts

- Fresh scenario results:
  - `direct-accept`: `PASS`
  - `counteroffer-roundtrip`: `PASS`
  - `admin-wrong-role-recovery`: `PASS`
  - `mobile-logout-and-switch`: `PASS`
- Fresh proof keys:
  - `c35c5cc9-c22d-4d41-baea-166aa6fd5c56` - `direct-accept`
  - `1e6f579e-4fb3-4b66-b24b-a0a1bdfaef0e` - `counteroffer-roundtrip`

## Accepted DB / Ledger Observations

- `c35c5cc9-c22d-4d41-baea-166aa6fd5c56`
  - `status=assigned`
  - `order_events=1`
  - `order_offers=0`
  - `wallet_transactions=0`
- `1e6f579e-4fb3-4b66-b24b-a0a1bdfaef0e`
  - `status=assigned`
  - `order_events=1`
  - `order_offers=2`
  - `wallet_transactions=0`
- Evidence-ledger structural checks passed for both fresh orders.

## Accepted Visual Facts

- Driver/Admin authenticated visual bridge residual is closed at bounded local/dev evidence level by fresh authenticated screenshot artifacts.
- Accepted driver screenshots:
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\direct-accept\driver-marketplace-after-accept.png`
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\counteroffer-roundtrip\driver-second-counteroffer.png`
- Accepted admin screenshots:
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\direct-accept\admin-observability-after-direct-accept.png`
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\counteroffer-roundtrip\admin-after-counteroffer-roundtrip.png`
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\admin-wrong-role-recovery\admin-restricted-screen.png`
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\admin-wrong-role-recovery\admin-recovered-with-admin-login.png`
- Customer lane-level visual evidence is sufficient for acceptance.
- Stronger accepted customer visual proof:
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\counteroffer-roundtrip\client-after-accept-counteroffer.png`
- Customer residual to preserve:
  - `C:\Users\dgcar\AppData\Local\Temp\ivoy-multiscenario-marketplace-qa-full-multiscenario-qa-visual-bridge-closure\direct-accept\client-order-after-direct-accept.png` is only a loading-state capture and is not strong enough to claim a separate direct-accept customer visual PASS by itself.
- `visual-targets.json` still encodes Driver/Admin bridge-blocked markers:
  - `DRIVER_AUTH_GATE_BLOCKED`
  - `DRIVER_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER`
  - `ADMIN_AUTH_GATE_BLOCKED`
  - `ADMIN_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER`
- That `visual-targets.json` state is preserved here as a residual/schema mismatch rather than erased or overclaimed as fixed.

## Accepted Cleanup / Retained Evidence / Baseline Facts

- Fresh accepted cleanup fact: `PASS`
- Fresh accepted protected retained evidence post-check: `PASS`
  - `31b64a10-4b05-41c8-95e5-fcfe8971a65d`
  - `dbeb5226-e539-443f-b56f-3ae6a5641488`
  - `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`
- Fresh accepted final driver baseline post-cleanup: `PASS`
  - driver `5335166a-7e13-4541-927b-b34a01224cca`
  - `500 / 0 / libre`
- Cleanup, protected retained evidence, and final driver baseline are accepted from the bounded produced evidence package rather than a fresh independent verification in the acceptance audit.

## Residual Risks

- Customer direct-accept screenshot remains a weak loading-state capture.
- `visual-targets.json` still bridge-blocks Driver/Admin in the summary schema, so schema/output mismatch remains residual.
- Cleanup, protected retained evidence, and final driver baseline are accepted from the produced evidence package rather than a fresh independent re-query in the acceptance audit.
- Evidence remains bounded local/dev evidence only.
- No broader readiness inference should be made from these artifacts.

## Non-Claims

- No production readiness.
- No production DB apply.
- No real payment/payout proof.
- No GPS/tracking proof.
- No notification proof.
- No real rider/courier proof.
- No deploy/live-smoke proof.
- No physical mobile/PWA proof.
- No full security/compliance proof.
- No claim that the runner schema or `visual-targets.json` blocker encoding was fixed.
- No secret/token/cookie/storage/auth-header inspection.

## Scope Boundary

- This canon entry records the accepted local/dev evidence package only.
- Driver/Admin authenticated visual bridge closure is accepted at bounded local/dev evidence level by fresh authenticated screenshot artifacts.
- Customer direct-accept weakness remains residual.
- `visual-targets.json` bridge-blocked markers remain residual/schema mismatch rather than a claimed implementation fix.
