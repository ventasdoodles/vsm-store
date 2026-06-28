# Admin Xalapa Exception Cabina Local Proof

Date: 2026-06-21

## Verdict

ACCEPT WITH RESIDUAL RISK.

The Admin Xalapa city-zero lane has strong local source/test/browser evidence and a full local `ADMIN_RELEASE_READINESS_PASS` in its isolated worktree. It is not yet an accepted remote baseline, and it does not yet justify any deploy, live-authenticated, or public-pilot claim.

## Scope

- Admin-only local implementation lane in isolated worktree `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin`.
- Exception-first dashboard triage and queue focus.
- Demo-only rendered proof route for the pilot cabina.
- Repo-controlled bundle budget gate.
- Local release-readiness verification only.

## Baseline Boundary

- Clean accepted Admin baseline remains `F:\ivoy\ivoy-admin` aligned to `ventasdoodles/ivoy-admin` `origin/main` at `adf13eafdb371089e1e9895b740f6c2191cf3d03`.
- Clean canon baseline remains `C:\dev\vsm-store-fresh\.vsm-workkit` aligned to `ventasdoodles/ivoy-canon` `origin/main`.
- This lane was developed outside the clean baseline in isolated worktree `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin`.
- The isolated Admin worktree is still dirty and contains both current-lane changes and unrelated pre-existing modifications; this note does not canonize or normalize that dirty state.

## Accepted Facts

- `DashboardStats.tsx`, `DashboardToolbar.tsx`, `AdminDashboard.tsx`, `useFilteredOrders.ts`, and `src/utils/exceptionQueues.ts` now support an exception-first cabina centered on queue triage instead of only status tabs.
- The exposed priority queues are `Espera sin interes`, `Revision manual`, `Contradiccion de ciclo`, and `Efectivo por revisar`.
- Queue focus is synchronized in the URL through `queueFocus`, so the filtered view is addressable and stable in the local preview.
- `useFilteredOrders.ts` closes a real filtering defect: non-digit search text no longer matches every phone by falling through to `phoneDigits.includes('')`.
- `useOrders` and `useDrivers` now accept an `enabled` option so the dashboard can disable live Supabase-backed queries in bounded demo mode.
- `AdminDashboard.tsx` now supports `/dashboard?demo=pilot-cabina`.
- Demo mode reads explicit fixtures from `src/demo/pilotCabinaFixtures.ts` and does not claim live operational data.
- Bundle-budget verification is repo-controlled through `scripts/verify-bundle-budgets.cjs` plus `src/tests/verifyBundleBudgets.test.js`.
- The current budget contract allows ordinary JS chunks up to `600 KiB` and the intentionally lazy `mapbox-gl` chunk up to `1900 KiB`.
- `vite.config.ts` raises `chunkSizeWarningLimit` to `1900` only because an explicit verifier now enforces the real budget contract.

## Local Proof

- Focused tests passed for:
  - `src/hooks/__tests__/useFilteredOrders.test.tsx`
  - `src/components/__tests__/DashboardStats.test.tsx`
  - `src/components/__tests__/XalapaOperatingRules.test.tsx`
  - `src/tests/verifyBundleBudgets.test.js`
  - `src/tests/verifyInitialEntryPerformance.test.js`
- `npm run lint` passed.
- `npm run build` passed.
- `npm run verify:bundle-budgets` passed with `BUNDLE_BUDGET_PASS assets=54 allowed_oversized_mapbox=mapbox-gl-_o-y1hhW.js:1720.6KiB`.
- `npm run verify:release-readiness` passed with `ADMIN_RELEASE_READINESS_PASS`.
- The release-readiness pass included audit, typecheck, lint, build, bundle budgets, production console/runtime checks, security headers, observability contract, env/deploy/workflow verifiers, migration security, cash-wallet ledger contract, browser runtime, and Supabase functions runtime.

## Browser Proof

- Local preview proof was captured at `http://127.0.0.1:4181/dashboard?demo=pilot-cabina`.
- The rendered surface showed `Operacion en vivo`, `Cabina piloto demo activa`, and `Cabina de excepciones`.
- The demo feed rendered three bounded fixture orders initially.
- Clicking `Efectivo por revisar · 1` narrowed the feed to only `Pedido #demo-cash-watch`.
- This is the strongest current rendered proof for the lane, but it is explicitly a demo route with live queries disabled.

## Preserved Non-Claims

- No commit, push, merge, or remote workflow proof is claimed.
- No new accepted `origin/main` Admin baseline is claimed.
- No live authenticated browser proof against hosted Admin is claimed.
- No client repo change, customer flow proof, or driver flow proof is claimed from this lane.
- No Supabase migration apply, RPC, auth, payment, payout, GPS, notification, WhatsApp, or physical-device proof is claimed.
- No public pilot or production-readiness claim is made.

## Residual Risks

- The isolated Admin worktree is still dirty, so this lane remains a local implementation state rather than a canonized published baseline.
- Demo mode is intentionally not live data; it proves rendering and local interaction shape, not real operational traffic.
- No remote deploy, hosted browser QA, or credentialed E2E proof exists yet for the exception-first cabina route.
- Bundle budgets are now explicit and enforced locally, but the large lazy `mapbox-gl` chunk remains real performance debt.
- This lane does not close broader non-claims around accounting/compliance, payments, GPS/navigation, notifications, physical mobile, or real field operations.
