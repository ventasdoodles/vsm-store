# Driver Priority Matching Engine v1

Date: 2026-06-22
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane closes the driver-side matching gap left by the previous `Solicitudes + Prioridad` UI lane. The Driver `Solicitudes` feed now uses a server-side authenticated priority matching RPC instead of exposing every pending marketplace order through the broad pending-orders view.

Accepted implementation:

- Client commit `442199085cce82f1fe9e856910c8100f16bb39d1` in `F:\ivoy\ivoy1.6`.
- `components/DriverMarketplace.tsx` calls `get_driver_marketplace_feed(false)` for visible marketplace requests.
- `components/DriverDashboard.tsx` uses the same RPC to decide whether to show the request list or radar state.
- `types.ts` carries optional eligibility and priority fields returned by the RPC.
- Supabase migrations:
  - `20260622150000_driver_priority_matching_engine_v1.sql`
  - `20260622153000_driver_priority_matching_engine_remote_fix_v1.sql`
  - `20260622154500_driver_priority_matching_audit_execution_fix_v1.sql`
- Regression coverage in `src/test/driverMarketplacePriorityMatching.test.ts`, `src/test/DriverMarketplace.test.tsx`, and `src/test/pilotDemoVisualHarness.test.tsx`.

## Matching Contract

The RPC evaluates each authenticated driver against current pending marketplace requests using:

- Driver role must be `driver`.
- Driver must be online.
- Driver must be available as `libre`.
- Driver must not already have an active/assigned/in-progress marketplace order.
- Driver must have a last known location.
- Order must have sender coordinates.
- Driver balance must cover the required commission.
- Distance must be within effective radius.

Radius policy:

- Base radius starts at `1.0 km`.
- Base radius expands by order age and is capped at `6.0 km`.
- Priority radius bonus is calculated from `driver_priority_snapshot.priority_score`.
- Priority bonus is capped at `2.5 km`.
- Drivers with no priority stats default to score `0` and base tier.

Traceability:

- Every evaluated candidate writes `driver_marketplace_visibility_events`.
- Decisions are stored as `visible` or `hidden`.
- Reasons include `driver_offline`, `driver_not_available`, `driver_busy`, `missing_driver_location`, `missing_order_location`, `insufficient_balance`, `visible`, and `outside_radius`.
- Audit rows are protected by RLS so drivers can read only their own visibility events.

## Verification

Local verification in `F:\ivoy\ivoy1.6`:

- `npm run test:run -- src/test/driverMarketplacePriorityMatching.test.ts src/test/DriverMarketplace.test.tsx src/test/MarketplaceFourDriverLifecycle.test.tsx src/test/pilotDemoVisualHarness.test.tsx`: `4 passed`, `31 passed`.
- `npm run test:run`: `88 passed`, `519 passed`, `2 skipped`.
- `npm run verify:migration-security`: `MIGRATION_SECURITY_PASS tables=4`.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `node scripts/verify-public-html-contract.cjs`: `PUBLIC_HTML_CONTRACT_PASS target=client`.

Remote Supabase verification on project `inlvpbiphrrfrdvsadnh`:

- Applied migrations `driver_priority_matching_engine_v1`, `driver_priority_matching_engine_remote_fix_v1`, and `driver_priority_matching_audit_execution_fix_v1`.
- Authenticated rollback smoke returned `feed_count=1`, `reason=visible`, `distance_km=0.031`, `effective_radius_km=1.000`, and `audit_count=1`.
- Priority threshold rollback smoke returned score `4` as `visible` at `distance_km=1.056` with `effective_radius_km=1.100`, while score `0` for the same request returned `outside_radius` with `effective_radius_km=1.000`.
- Blocking-reason rollback smoke returned `driver_offline`, `missing_driver_location`, `driver_busy`, and no-stats fallback `priority_score=0`.
- Metadata confirmed `get_driver_marketplace_feed` has `is_security_definer=false`.
- Metadata confirmed RLS enabled on `driver_marketplace_visibility_events`.
- Grant check confirmed no `anon` table grant on `driver_marketplace_visibility_events`.
- Routine grant check confirmed no `anon` execute grant on `get_driver_marketplace_feed(boolean)`.

Deploy/browser verification:

- Manual Vercel production deployment `dpl_HSHHHimwyF5gwxxDGhhuzjvKQovC`.
- Production alias: `https://ivoyapp.vercel.app`.
- Browser proof for `/` loaded the app root with manifest and zero console errors.
- Browser proof for `/driver?cachebust=4421990` rendered `Solicitudes`, `Prioridad`, `Mis ingresos`, and `Cartera`, did not render `Demanda`, and produced zero console errors.

GitHub Actions:

- Post-push Actions for `4421990` still fail before code execution.
- Representative run `27950337423` completed in 4 seconds with no runner id/name, no steps, and no logs.
- This is documented as an external runner/account blocker, not code-execution evidence.

## Residual Risk

- No credentialed browser driver session was executed because local `.env.local` contains Supabase URL/anon but no QA driver credentials.
- No physical mobile/PWA/GPS proof was executed.
- No push notification, WhatsApp, payment, payout, or provider-grade navigation proof is claimed.
- The heatmap demand map and full driver profile/photo/moto editing remain outside this lane.
- GitHub Actions remain externally blocked and are not claimed green.

## Non-Claims

This lane does not claim public pilot readiness, production field readiness, legal/accounting compliance, real courier operations, payment settlement, GPS reliability, push delivery, or full security/compliance completion.
