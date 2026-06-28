# Driver Real Google Map Phase 1 Implementation

## Lane

- Fecha: 2026-06-18
- Tipo: implementation note, not acceptance
- Herramienta: Codex
- Client branch: `codex/driver-real-google-map`
- Baseline: clean scratch worktree `F:\ivoy\_scratch\ivoy-driver-map-fullscreen` at `origin/main` commit `bc7051336bc1fd38b95a2605991a906c00f54db6`
- Workkit note: `F:\ivoy\ivoy1.6` and `F:\ivoy\ivoy-admin` remain dirty/stale, so this lane uses `_scratch` as the implementation truth per workkit guidance.

## Accepted implementation facts

- The driver home surface was moved away from the previous fake radar visual.
- Google Maps Code Assist MCP was used for product/API direction.
- Driver map Phase 1 uses `@vis.gl/react-google-maps` over the current Maps JavaScript API.
- Driver map runtime uses:
  - `VITE_GOOGLE_MAPS_API_KEY`
  - `VITE_GOOGLE_MAPS_MAP_ID`
- The map is driver-first:
  - full-screen driver surface;
  - driver availability control remains prominent;
  - driver location marker is rendered from GPS/profile/fallback location;
  - available marketplace requests with approximate sender coordinates render as request markers;
  - missing Google Maps config renders an explicit fallback instead of a broken or blank map.
- The map uses approximate marketplace coordinates only; exact customer detail stays in the authorized order flow.
- Residual `Radar` naming was removed from the live driver UI and renamed to map-oriented code where this lane touches the surface.

## Google Maps Platform direction

- Maps JavaScript API is the Phase 1 map renderer.
- Places UI Kit is the preferred next integration for pickup/dropoff autocomplete and place details.
- Routes API / Compute Route Matrix is the preferred next integration for driver/order ETA and distance.
- Distance Matrix legacy should not be introduced unless a later lane documents a specific reason.

## Validation so far

- `npm run test:run -- src/test/pilotDemoVisualHarness.test.tsx`: PASS, 10 tests.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run verify:env-example`: PASS, includes `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID`.
- `npm run verify:security-headers`: PASS.
- `npm run test:run`: PASS, 77 files / 448 tests.
- `npm run build`: PASS.
- `npm run verify:release-readiness`: FAIL only on `github-deploy-readiness`, with missing `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID`.
- Focused regression pack: `npm run test:run -- src/test/pilotDemoVisualHarness.test.tsx src/test/AppIntegration.test.tsx src/test/verifyEnvExample.test.ts src/test/mapsSecurityHeaders.test.ts`: PASS, 21 tests.
- Main baseline CI rerun for previous Maps material commit: Client Quality Gates `27778071042`: PASS after deploy race cleared.
- Browser mobile smoke at `http://127.0.0.1:5177/driver`: PASS for `driver-google-map-home`, `driver-live-map-stage`, Google Maps fallback, `Radar=0`, `Modo Cliente=0`, and welcome-card close preserving the map shell.
- Vercel manual preview:
  - deployment: `https://ivoyapp-pty9y2cqu-mario-carlos-macotela-moras-projects.vercel.app`
  - temporary share URL: `https://ivoyapp-pty9y2cqu-mario-carlos-macotela-moras-projects.vercel.app/?_vercel_share=MryBI0b3jfFCeu2mcJxK0IroqKQACyzh`
  - expires: 2026-06-19 19:15
  - browser mobile smoke at `/driver`: PASS for `driver-google-map-home`, `driver-live-map-stage`, Google Maps fallback, `Radar=0`, `Modo Cliente=0`, no console errors, and welcome-card close preserving the map shell.
- Vercel project truth:
  - team: `team_PxE2DyA8I2lcOrRvQrWzmdh5`
  - client project: `ivoyapp` / `prj_Y87gnBEZwAyzQJugeRKAYUMoDTcn`
  - admin project: `ivoy-admin` / `prj_uYk7cvO2xbswX2eFvfogo5tarRRh`
  - current production deploy before this PR: commit `bc7051336bc1fd38b95a2605991a906c00f54db6`
- Workkit gate:
  - `node tools\workflow\vsm-gate.mjs --lane repo-baseline`: FAIL while this note is uncommitted and while legacy product checkouts remain dirty/stale.
  - Expected cleanup for this lane is to commit this canon note and keep product implementation inside the clean `_scratch` worktree.
- Follow-up hardening:
  - `docs/github-deploy-readiness-contract.json` now requires `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` for the client repo.
  - `scripts/verify-github-deploy-readiness.cjs` now unions workflow-discovered secrets with contract-required secrets, so Maps runtime secrets cannot be silently omitted.
  - `.github/workflows/ci.yml` now exposes `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`, and `VITE_SUPABASE_ANON_KEY` to the aggregate release-readiness gate.
  - When `GITHUB_ACTIONS=true`, `scripts/verify-github-deploy-readiness.cjs` only treats a secret as present if the workflow env value is non-empty.
  - Focused hardening checks: `npm run test:run -- src/test/verifyCiWorkflow.test.ts src/test/verifyGithubDeployReadiness.test.ts --reporter verbose`: PASS, 17 tests.
  - `npm run verify:ci-workflow`: PASS.
  - Local `npm run verify:github-deploy-readiness`: FAIL as intended until GitHub Actions has both Google Maps secrets.
  - Local `npm run verify:release-readiness`: FAIL only on `github-deploy-readiness`, with missing `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID`.
  - GitHub Actions PR run `27787898451` for commit `4ff079349fd8bc08bf54780fc4331a8316109e9c`: FAIL only at `Run aggregate release readiness gate`; preceding checks including install, audit, typecheck, lint, security, tests, build, and initial-entry performance passed.
  - The PR run env showed `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`, and `VITE_SUPABASE_ANON_KEY` present, but `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` empty.
  - `scripts/verify-vercel-env-readiness.cjs` now verifies the deployed Vercel project has both Google Maps env vars for Preview and Production, using `VERCEL_TOKEN`/project env in CI or local Vercel CLI auth as fallback.
  - `npm run test:run -- src/test/verifyVercelEnvReadiness.test.ts src/test/verifyReleaseReadiness.test.ts --reporter verbose`: PASS, 9 tests.
  - Local `npm run verify:vercel-env-readiness` against Vercel project `ivoyapp` / `prj_Y87gnBEZwAyzQJugeRKAYUMoDTcn`: FAIL with `VITE_GOOGLE_MAPS_API_KEY:preview|production` and `VITE_GOOGLE_MAPS_MAP_ID:preview|production`.
  - Local `npm run verify:release-readiness` after the Vercel env gate: FAIL only on `vercel-env-readiness` and `github-deploy-readiness`; 78 test files / 452 tests passed and build passed.
  - GitHub Actions PR run `27788532420` for commit `5bb07f843d30d2518cb9d056d399018144664bda`: FAIL only at `Run aggregate release readiness gate`, with `RELEASE_READINESS_FAIL count=2 failures=vercel-env-readiness,github-deploy-readiness`.
  - Remote CI confirms Vercel env missing `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` in both Preview and Production, and GitHub Actions still lacks both repository secrets.

## Current status

- Status: pending / externally blocked as of 2026-06-19.
- Client PR: `ventasdoodles/ivoy#55`.
- Latest client commit in PR: `5bb07f843d30d2518cb9d056d399018144664bda`.
- Goal status in Codex thread: blocked, not complete.
- Reason for parking: Google Maps API material is not available yet, so the live map cannot be proven in preview/production.
- Work already delivered remains useful and should not be reimplemented from scratch when resuming.

## Known blockers / missing external config

- GitHub Actions currently lacks:
  - `VITE_GOOGLE_MAPS_API_KEY`
  - `VITE_GOOGLE_MAPS_MAP_ID`
- Vercel env still needs equivalent runtime values before live map activation can be claimed.
  - Required Vercel targets: Preview and Production.
- Google Cloud project must enable and restrict the required Google Maps Platform APIs before production use.
- Last verified Vercel state: `npm run verify:vercel-env-readiness` fails with `VITE_GOOGLE_MAPS_API_KEY:preview|production` and `VITE_GOOGLE_MAPS_MAP_ID:preview|production`.
- Last verified GitHub state: `gh secret list --repo ventasdoodles/ivoy` does not list either Google Maps secret.

## Non-claims

- No production readiness claim for the live Google map until the Google Maps secrets are present in GitHub Actions and Vercel.
- No real GPS/tracking SLA claim.
- No real ETA/distance computation claim yet.
- No Places autocomplete runtime claim yet.
- No Routes API / Compute Route Matrix runtime claim yet.
- No payment, payout, notification, or delivery lifecycle correctness claim.
- No acceptance claim; this lane still needs PR/CI, preview/live deployment, and acceptance review.

## Resume checklist

- Add `VITE_GOOGLE_MAPS_API_KEY` and `VITE_GOOGLE_MAPS_MAP_ID` to GitHub Actions secrets for `ventasdoodles/ivoy`.
- Add the same two env vars to Vercel project `ivoyapp` for Preview and Production.
- Re-run:
  - `npm run verify:github-deploy-readiness`
  - `npm run verify:vercel-env-readiness`
  - `npm run verify:release-readiness`
- Re-run PR #55 CI.
- Deploy or refresh a Vercel preview.
- Run mobile browser smoke at `/driver` and prove:
  - Google map renders, not fallback;
  - no radar/mock copy;
  - no customer-mode UI;
  - driver status control remains visible;
  - driver marker renders;
  - nearby marketplace order markers render when data exists.
- Only then consider PR #55 ready for merge/acceptance.
