# Driver Active Trip Reopen Persistence v1

Date: 2026-06-22

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane hardens the Client Driver surface so an active assigned trip remains the default visible operational surface after reopening the app. It targets the user requirement that a driver must stay tied to the trip until customer, driver, or support finalizes it, not lose it by closing/reopening the app or losing local UI state.

## Accepted Changes

- Client commits `152a54db0aa4d9bda0d297b10d1b75d6f17a20a3` and `8fb73593a90ce55b2d96cecd4f0d7ecb217494c8`.
- `components/DriverDashboard.tsx` now redirects the local Driver UI from `home` or `marketplace` to `active` whenever Supabase returns at least one active/nonterminal order for the current driver.
- The `Disponibles` tab is disabled while active orders exist and shows `Disponibles bloqueado`, with title copy telling the driver to finish or release the active trip before returning to requests.
- `src/test/DriverAssignedLifecycle.test.tsx` now covers reopening `/driver` with an active assigned order and marketplace requests present.
- `src/test/pilotDemoVisualHarness.test.tsx` now separates fixtures for active-order and no-active-order Driver states, preserving radar/request coverage only when the driver is actually free.
- `scripts/monitor-live-order-lifecycle.cjs` now reauthenticates the QA driver during the happy-path live monitor and proves the same assigned order is still returned for the same driver after a fresh authenticated session.
- `src/test/verifyLiveOrderLifecycleMonitor.test.ts` now requires the `driver_reauth_active_trip_recovery` monitor phase.

## Proof

- TDD RED: `npm run test:run -- src/test/DriverAssignedLifecycle.test.tsx` failed because `/driver` rendered `driver-radar-home` instead of `Mis Pedidos Asignados` while the mocked Supabase order query returned an active `assigned` order.
- GREEN: `npm run test:run -- src/test/DriverAssignedLifecycle.test.tsx` passed `4/4`.
- Related focused proof passed: `npm run test:run -- src/test/DriverAssignedLifecycle.test.tsx src/test/DriverMarketplace.test.tsx src/test/pilotDemoVisualHarness.test.tsx` passed `27/27`.
- Full Client proof passed: Vitest `88` files / `520` passed / `2` skipped, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
- Follow-up TDD RED: `npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts` failed until the live monitor included `driver_reauth_active_trip_recovery`, `expectDriverReauthActiveTripRecovery`, and `role: 'driver_reauth'`.
- Follow-up GREEN: `npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts` passed `3/3`; `node --check scripts\monitor-live-order-lifecycle.cjs` passed.
- Follow-up live Supabase proof passed against project `inlvpbiphrrfrdvsadnh`: `LIVE_ORDER_LIFECYCLE_PASS orderId=657d8193-9dea-4c77-a767-a52137d566a3 scenarios=6 phases=29`, cleanup `deleted scenarios=6`, and report phase `happy_path / driver_reauth_active_trip_recovery: assigned`.
- Follow-up focused proof passed: `npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts src/test/DriverAssignedLifecycle.test.tsx` passed `7/7`.
- Follow-up full Client proof passed: Vitest `88` files / `520` passed / `2` skipped, `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.
- `npm run verify:release-readiness` passed all local/source/runtime gates including external runtime readiness, then failed only at `github-deploy-readiness` because remote Client workflows for the previous SHA were already failing before useful job execution.
- Post-push Client repo proof: `F:\ivoy\ivoy1.6` is clean and aligned with `origin/main` at `8fb73593a90ce55b2d96cecd4f0d7ecb217494c8`, divergence `0 0`.

## Residual Risk

- This is source/test/local build proof plus live Supabase monitor proof for the exact commit.
- GitHub Actions for `152a54d` remain externally blocked/failing before useful logs: Client Quality Gates `27961901851`, Smoke Public Runtime `27961900842`, Lighthouse CI `27961900602`, Deploy Client to GitHub Pages `27961900595`, and Deploy Client to Vercel `27961901626` completed with conclusion `failure`. Representative Quality, Smoke, and Lighthouse jobs had `steps: []`, and `gh run view --log-failed` returned `log not found`.
- GitHub Actions for `8fb7359` show the same external failure pattern: Smoke Public Runtime `27962381647`, Deploy Client to GitHub Pages `27962380768`, Deploy Client to Vercel `27962380506`, Client Quality Gates `27962379832`, and Lighthouse CI `27962379302` completed with conclusion `failure`; representative Quality, Smoke, and Lighthouse jobs had `steps: []`, and `gh run view --log-failed` returned `log not found`.
- No DB migration, RPC, Edge Function, or server lifecycle semantics changed in this lane.
- No hosted browser visual E2E was run for this exact commit.
- No physical mobile reinstall, GPS movement, payment settlement, push notification, WhatsApp delivery, or real courier operation proof is claimed.
