# Launch Readiness Burn-Down Real

Date: 2026-06-19
Status: ACCEPT WITH RESIDUAL RISK

## Scope

Burn down launch-readiness risk across the current canonical baselines:

- Client: `F:\ivoy\ivoy1.6`
- Admin: `F:\ivoy\ivoy-admin`
- Canon/workkit: `C:\dev\vsm-store-fresh\.vsm-workkit`

This lane checks repo sync, release gates, unit/integration tests, credentialed QA, live Supabase lifecycle, and browser E2E. It does not claim real payments, physical GPS, real courier operations, or full production readiness.

## Baseline

- Client `ventasdoodles/ivoy`: `e508e8090e2c0cabc7b9b2b6a11357ca17ca15d5`, clean, divergence `0 0`.
- Admin `ventasdoodles/ivoy-admin`: `adf13eafdb371089e1e9895b740f6c2191cf3d03`, clean, divergence `0 0`.
- Canon `ventasdoodles/ivoy-canon`: clean before this canon update.

## Fix

Admin E2E had a real QA harness blocker:

- `tests/helpers/qa-targets.ts` listed `https://ivoyapp.vercel.app` as the first admin candidate.
- `isExpectedAdminPage()` accepted any HTML containing `iVoy`.
- Result: Admin E2E could seed an admin session, navigate to `/dashboard`, and still resolve/render the Client app. The failure snapshots showed the Client profile surface for `qa_admin@ivoy.com`, not the Admin dashboard.

Fix:

- Admin target candidates now start with `https://ivoy-admin.vercel.app`.
- Admin HTML matching now requires Admin-specific signals such as `iVoy Admin`, `Panel de Administracion`, or `Panel de Gestion`.
- `resetQaBaseUrlCacheForTests()` was added for deterministic helper tests.
- `src/tests/qaHarnessHelpers.test.ts` now proves the resolver does not accept the client app as the admin QA target.
- `src/tests/verifyMigrationSecurity.test.js` now gives the expensive service-role-only RPC negative test a targeted 15s timeout. The test runs the full migration-security verifier repeatedly and was intermittently timing out under full-suite load at Vitest's default 5s.

Admin commit:

- `adf13eafdb371089e1e9895b740f6c2191cf3d03`
- Message: `test(admin): harden QA target resolution`

## Evidence

Workkit gates:

- `node tools\workflow\vsm-gate.mjs --lane repo-baseline --json`: PASS, 3/3.
- `node tools\workflow\vsm-gate.mjs --lane workspace-sync --json`: PASS, 3/3.
- `node tools\workflow\vsm-gate.mjs --lane qa-preflight --json`: PASS.

Client local/release:

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run test:run`: PASS, 77 files / 446 tests.
- `npm run verify:release-readiness`: `RELEASE_READINESS_PASS`.
- `npm run test:e2e`: PASS, 4/4 credentialed visual/3-surface tests.

Client remote E2E QA proof on `bc7051336bc1fd38b95a2605991a906c00f54db6`:

- Workflow: `E2E QA`.
- Run: `https://github.com/ventasdoodles/ivoy/actions/runs/27854660259`.
- Result: PASS.
- Job: `Credentialed Client E2E QA`.
- Proved steps: workflow contract verification, QA credential materialization, Supabase QA runtime grant repair, QA user ensure, QA auth probe, E2E test listing, production build, visual target preparation, credentialed E2E QA execution, real-proof verification, visual target cleanup, credential material removal, and sanitized artifact upload.

Admin local/release:

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, 50 files / 181 tests.
- `npm run verify:release-readiness`: `ADMIN_RELEASE_READINESS_PASS`.
- `npm run test:e2e:critical`: PASS, 7/7 critical browser tests.

Admin post-push remote proof on `adf13eafdb371089e1e9895b740f6c2191cf3d03`:

- Quality Gates: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27854497347` PASS.
- Deploy Admin to Vercel: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27854497358` PASS.
- Deploy Supabase Functions: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27854497337` PASS.
- Deploy Admin to GitHub Pages: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27854497331` PASS.
- Lighthouse CI: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27854497333` PASS.

QA live:

- `npm run verify:qa-auth-probe`: PASS for `customer`, `driver`, and `admin`.
- `npm run monitor:live-order-lifecycle`: PASS.
- Live order: `d722590c-785c-4668-b196-06f6899d5a79`.
- Phases proven:
  - `created` -> `pending`
  - `driver_accept_order` -> `assigned`
  - `driver_status_to_pickup` -> `to_pickup`
  - `driver_status_picked_up` -> `picked_up`
  - `driver_status_in_transit` -> `in_transit`
  - `complete_order_and_charge_commission` -> `delivered`
- Cleanup: `deleted`, `terminal=true`.

Registration evidence boundary:

- Existing customer/driver/admin login/auth is proven by `verify:qa-auth-probe`.
- Existing QA-user bootstrap is proven by the remote Client E2E QA run, which ensured QA users before running credentialed E2E.
- Client commit `e508e8090e2c0cabc7b9b2b6a11357ca17ca15d5` adds source-level public signup coverage: successful signup shows a confirmation without navigating before email confirmation, records the sanitized auth attempt as success, and server-side rate-limit denial blocks before Supabase `signUp`.
- Fresh validation for that commit passed focused `AuthPage` tests 12/12, full Client Vitest 77 files / 448 tests, `npm run lint`, `npm run build`, and `npm run verify:release-readiness` with `RELEASE_READINESS_PASS`.
- Post-push GitHub Actions proof for Client `e508e80`: Quality Gates `https://github.com/ventasdoodles/ivoy/actions/runs/27854949060`, Deploy Client to Vercel `https://github.com/ventasdoodles/ivoy/actions/runs/27854949038`, Deploy Client to GitHub Pages `https://github.com/ventasdoodles/ivoy/actions/runs/27854949051`, Smoke Public Runtime `https://github.com/ventasdoodles/ivoy/actions/runs/27854949052`, and Lighthouse CI `https://github.com/ventasdoodles/ivoy/actions/runs/27854949069` completed successfully.
- Fresh live new-account signup is not claimed. A one-off Supabase Auth signup smoke against the live QA runtime stopped with `signup_failed=email rate limit exceeded`. This is classified as an external Supabase Auth email rate-limit condition; do not keep retrying fresh signup in a loop. Current registration coverage remains source/unit coverage plus QA-user bootstrap evidence, not a fresh arbitrary-user live signup proof.

## Remaining Risks

- Fresh arbitrary-user live signup still needs a controlled proof after Supabase Auth email rate limiting clears or after a safer signup-test strategy is configured.
- No real payment settlement, payout, SPEI reconciliation, or withdrawal proof.
- No physical GPS movement, live navigation, ETA, Maps/Places/Routes/Matrix provider flow, or mobile field tracking proof.
- No push notification or WhatsApp delivery proof.
- No physical mobile/PWA hardware proof.
- No real courier/rider operation proof.
- No full security/compliance audit claim.
- Mapbox bundles remain large; this is performance debt for the Maps/performance lane.

## Verdict

Pilot-readiness improved materially.

The current controlled pilot data path and browser QA are credible: role auth works, customer/admin/driver lifecycle can complete against live Supabase QA, and critical browser E2E now resolves the correct Admin surface. This is still not full production readiness because payments, physical GPS/maps, notifications, mobile hardware, real courier operations, and full compliance remain unproven.
