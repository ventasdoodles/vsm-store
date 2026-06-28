# Marketplace Exception Live Monitor Expansion v1

Date: 2026-06-22

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane extends the Client live order lifecycle monitor so marketplace exception behavior is proven with real Supabase QA credentials, not only source-level migration tests. It does not change customer/driver UI and does not require a Vercel redeploy.

## Accepted Changes

- Client commit `467e35e1450f96aede256ee0c2fe31849b52d7dd`.
- Follow-up Client commit `cc11254c5eb3aee64c356056523779fbc6a48add`.
- Follow-up Client commit `258dca5bacb228390437f6e8b5ee914a87fd6f91`.
- Follow-up Client commit `14f9d8f453c1b43ee0ad4b13ce78aa6d50367f9d`.
- `scripts/monitor-live-order-lifecycle.cjs` now runs six scenarios:
  - `happy_path`
  - `customer_cancel_after_assignment`
  - `pickup_no_show_release`
  - `dropoff_support_release`
  - `pending_no_offers_raise_refresh`
  - `driver_cancel_returns_to_feed`
- `scripts/report-live-order-lifecycle.cjs` now reports scenario-scoped phases and per-scenario cleanup.
- `src/test/verifyLiveOrderLifecycleMonitor.test.ts` now requires the exception RPCs and scenario evidence in the monitor contract.
- The follow-up commit tightens `driver_cancel_returns_to_feed`: after `driver_cancel_marketplace_assignment`, the monitor now verifies the order is returned by authenticated RPC `get_driver_marketplace_feed(false)`, records phase `get_driver_marketplace_feed`, and classifies missing feed visibility as `driver_marketplace_feed`.
- Commit `258dca5` fixes the real live-monitor defect exposed by that stricter assertion: the QA order used for `driver_cancel_returns_to_feed` is now anchored to the QA driver's current feed location instead of static CDMX coordinates, so the priority/radius feed can legitimately return it after driver cancellation.
- Commit `14f9d8f` adds `pending_no_offers_raise_refresh`: the monitor creates a pending customer order with no `order_offers`, calls `customer_raise_marketplace_offer`, verifies status stays `pending`, verifies no driver is attached, and verifies `customer_offer_fare` changed to the raised fare.

## Proof

- TDD RED: focused monitor contract failed before implementation because `customer_cancel_marketplace_order` and exception scenario evidence were missing.
- GREEN: `npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts` passed `3/3`.
- Live Supabase monitor passed against project `inlvpbiphrrfrdvsadnh`: `LIVE_ORDER_LIFECYCLE_PASS orderId=354a75b1-0b81-4502-b64c-de428f9baa3b scenarios=5 phases=25`.
- Live cleanup passed: `LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=5`.
- `qa-temp/live-order-lifecycle-summary.json` recorded all five scenario order ids, expected statuses, `failure: null`, and cleanup `deleted; terminal=true` for every scenario.
- `npm run report:live-order-lifecycle` produced a PASS summary with scenario cleanup and scenario-scoped phase lines.
- Full Client verification passed: Vitest `88` files / `519` passed / `2` skipped, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run verify:public-html-contract`, `node --check scripts/monitor-live-order-lifecycle.cjs`, and `git diff --check`.
- Follow-up TDD RED: focused monitor contract failed because `expectOrderInDriverMarketplaceFeed` and the `get_driver_marketplace_feed` phase were missing.
- Follow-up GREEN: focused monitor contract passed `3/3`; related focused tests passed `17/17` across the monitor contract, `DriverOrderActions`, and `DriverAssignedLifecycle`.
- Follow-up local verification passed `node --check scripts\monitor-live-order-lifecycle.cjs`, `npm run typecheck`, `npm run lint`, full Client Vitest `88` files / `519` passed / `2` skipped, `npm run build`, and `git diff --check`.
- `npm run verify:release-readiness` passed all local gates and failed only at `github-deploy-readiness` because remote Client workflows were already failing before useful job execution.
- Live RED after `cc11254`: local monitor reached `driver_cancel_marketplace_assignment` and cleanup succeeded, then failed at `get_driver_marketplace_feed` with `driver_marketplace_feed_missing ... rows=0`. Root cause evidence showed the QA driver was online/free/funded but 231.84 km from the monitor's static CDMX order, outside the priority feed radius.
- Live GREEN after `258dca5`: `npm run monitor:live-order-lifecycle` passed against Supabase project `inlvpbiphrrfrdvsadnh` with `LIVE_ORDER_LIFECYCLE_PASS orderId=eca8d950-5245-49af-ac8b-109e55ba034e scenarios=5 phases=26` and `LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=5`.
- `npm run report:live-order-lifecycle` confirmed `driver_cancel_returns_to_feed / get_driver_marketplace_feed: pending` and terminal cleanup for all five scenarios.
- Post-fix local proof passed focused monitor contract `3/3`, related focused tests `21/21`, `node --check scripts\monitor-live-order-lifecycle.cjs`, `npm run typecheck`, `npm run lint`, full Client Vitest `88` files / `519` passed / `2` skipped, `npm run build`, and `git diff --check`.
- Post-fix `npm run verify:release-readiness` passed all local/source/runtime gates including external runtime readiness, then failed only at `github-deploy-readiness` because the pre-existing `cc11254` Client Actions were failed.
- Raise-offer TDD RED: focused monitor contract failed because `pending_no_offers_raise_refresh`, `customer_raise_marketplace_offer_pending`, and `expectNoDriverOffers` were missing.
- Raise-offer GREEN: focused monitor contract passed `3/3`; related focused tests passed `32` / `34` with `2` expected skips across monitor and `OrderConfirmationStep` no-offers UI tests.
- Live GREEN after `14f9d8f`: `npm run monitor:live-order-lifecycle` passed against Supabase project `inlvpbiphrrfrdvsadnh` with `LIVE_ORDER_LIFECYCLE_PASS orderId=ab428566-38bb-45d3-a040-2004314c39e3 scenarios=6 phases=28` and `LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=6`.
- `npm run report:live-order-lifecycle` confirmed `pending_no_offers_raise_refresh / customer_raise_marketplace_offer_pending: pending` and terminal cleanup for all six scenarios.
- Latest local proof passed `node --check scripts\monitor-live-order-lifecycle.cjs`, `npm run typecheck`, `npm run lint`, full Client Vitest `88` files / `519` passed / `2` skipped, `npm run build`, `git diff --check`, and `npm run verify:release-readiness` through all local/source/runtime gates before the known `github-deploy-readiness` failure against earlier failed Actions.

## Residual Risk

- This is monitor/tooling proof, not a new UI/browser proof.
- GitHub Actions for commit `467e35e` are still externally blocked before useful job execution. Representative Client Quality Gates run `27952185936` failed in 3 seconds, job `82711546392` had no steps, and logs were unavailable with `log not found`.
- GitHub Actions for follow-up commit `cc11254` show the same external pre-step failure pattern: Client Quality Gates run `27959555018` / job `82737025932` failed with `steps: []`, and `gh run view --log-failed` returned `log not found`.
- GitHub Actions for follow-up commit `258dca5` failed in the same external runner/deploy lane family after push: Client Quality Gates run `27960358667`, Smoke Public Runtime `27960358768`, Lighthouse CI `27960359298`, Deploy Client to GitHub Pages `27960359302`, and Deploy Client to Vercel `27960359438` completed with conclusion `failure`. Representative Quality job `82739896921` had `steps: []`, and `gh run view 27960358667 --log-failed` returned `log not found`.
- GitHub Actions for follow-up commit `14f9d8f` failed in the same external pre-step pattern: Client Quality Gates `27961137464`, Smoke Public Runtime `27961137424`, Lighthouse CI `27961137475`, Deploy Client to GitHub Pages `27961138016`, and Deploy Client to Vercel `27961137412` completed with conclusion `failure`. Representative Quality job `82742661732` and Vercel job `82742661568` had `steps: []`, and `gh run view --log-failed` returned `log not found`.
- No Vercel redeploy was required or claimed because no shipped frontend runtime changed.
- No physical mobile, GPS movement, payment settlement, push notification, WhatsApp delivery, or real courier operation proof is claimed.
