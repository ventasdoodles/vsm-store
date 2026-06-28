# Operational Pilot Live Lifecycle v0

Date: 2026-06-19
Status: ACCEPT WITH RESIDUAL RISK

## Scope

Close the minimum real operational path without depending on Google Maps:

- Customer creates a QA order.
- Driver accepts the order.
- Driver advances the lifecycle.
- Customer, driver, and admin can observe the canonical status changes.
- Completion reaches a terminal application state.
- Cleanup removes QA residue.

Maps, Places, Routes, physical GPS movement, real payment settlement, push delivery, and real courier operations are explicitly out of this proof.

## Repos And Worktrees

- Client clean worktree: `F:\ivoy\_scratch\ivoy-pilot-operational-client`
- Admin clean worktree: `F:\ivoy\_scratch\ivoy-pilot-operational-admin`
- Workkit/canon: `C:\dev\vsm-store-fresh\.vsm-workkit`
- Dirty legacy checkouts `F:\ivoy\ivoy1.6` and `F:\ivoy\ivoy-admin` were not used as implementation truth.

## Fixes

### Admin Edge Function Status Contract

`supabase/functions/assign-driver/index.ts` no longer writes the Spanish UI label `Conductor Asignado` into `public.orders.status`.

It now writes the canonical storage status:

- `assigned`

Reason: customer, driver, admin, monitors, and migrations already rely on canonical order statuses. Writing UI text to storage can break driver visibility, customer progress, and lifecycle monitors.

### Admin Public Order Status Rendering

`src/components/PublicOrderView.tsx` now uses the centralized `getStatusConfig()` mapping.

Customer-facing public order views render canonical storage statuses as Spanish labels, for example:

- storage: `assigned`
- visible label: `Conductor Asignado`

The UI should not expose raw internal status keys to customers.

## Local Proof

Admin:

- `npx vitest run src/tests/assignDriverStatusContract.test.js src/tests/PublicOrderView.statusContract.test.tsx src/tests/useOrders.test.ts src/services/__tests__/orderStatusMutation.test.ts src/components/__tests__/OrderCardActions.test.tsx`
- Result: 5 files passed, 16 tests passed.
- `npm run lint`
- Result: PASS.
- `npm run build`
- Result: PASS.

Client:

- `npx vitest run src/test/verifyLiveOrderLifecycleMonitor.test.ts src/test/DriverOrderActions.test.tsx src/test/DriverMarketplace.test.tsx src/test/OrderConfirmationStep.test.tsx`
- Result: 4 files passed, 24 tests passed.
- `npm run lint`
- Result: PASS.
- `npm run build`
- Result: PASS.

Both builds still warn about large Mapbox chunks. That is performance debt, not a blocker for the no-Maps operational pilot proof.

## Live Supabase Proof

Supabase project:

- `inlvpbiphrrfrdvsadnh`

Deployed Edge Function:

- `assign-driver`
- version: 7
- status: ACTIVE
- `verify_jwt`: true
- deployed via Supabase MCP
- deployed hash: `c1613bf11a25e38fa5094c9231bf9e67d7d6690ca829a5e80830da56c4d0480b`

## GitHub Actions Live Lifecycle Proof

Workflow:

- Repo: `ventasdoodles/ivoy`
- Workflow: `Live Order Lifecycle Monitor`
- Run: `27835947157`
- URL: `https://github.com/ventasdoodles/ivoy/actions/runs/27835947157`
- Result: PASS

Evidence:

- `QA_CREDENTIALS_ENV_PASS`
- `SUPABASE_QA_RUNTIME_GRANTS_PASS`
- `QA_USER_BOOTSTRAP_PASS roles=customer,driver,admin`
- `QA_AUTH_PROBE_PASS roles=customer,driver,admin`
- `LIVE_ORDER_LIFECYCLE_PASS orderId=502978f6-432f-4fee-9678-9063abbc8f0f phases=6`
- `LIVE_ORDER_LIFECYCLE_CLEANUP_PASS orderId=502978f6-432f-4fee-9678-9063abbc8f0f status=deleted`

Lifecycle phases proven by artifact:

1. `created` -> `pending`
2. `driver_accept_order` -> `assigned`
3. `driver_status_to_pickup` -> `to_pickup`
4. `driver_status_picked_up` -> `picked_up`
5. `driver_status_in_transit` -> `in_transit`
6. `complete_order_and_charge_commission` -> `delivered`

Cleanup:

- status: `deleted`
- terminal: `true`
- failure: `null`

## Post-Merge Remote Proof

Admin PR:

- `https://github.com/ventasdoodles/ivoy-admin/pull/38`
- merged to `main`
- merge commit: `983edf26bafca39c579c06d8904a261dfa906050`

Post-merge Admin workflows:

- Quality Gates: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27836319502` PASS
- Deploy Supabase Functions: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27836319479` PASS
- Deploy Admin to Vercel: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27836319565` PASS
- Deploy Admin to GitHub Pages: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27836319509` PASS
- Lighthouse CI: `https://github.com/ventasdoodles/ivoy-admin/actions/runs/27836319514` PASS

Final post-merge live lifecycle rerun:

- Workflow: `Live Order Lifecycle Monitor`
- Run: `https://github.com/ventasdoodles/ivoy/actions/runs/27836522107`
- Result: PASS
- Order: `d7e57f67-e881-4fe4-bc55-9f8528dc9ba5`
- Phases: `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`
- Cleanup: `deleted` / `terminal=true`

## Canonical Status Mapping

Current storage canon remains the established 8-key set:

- `pending`
- `assigned`
- `to_pickup`
- `picked_up`
- `in_transit`
- `delivered`
- `issue`
- `cancelled`

Spanish product labels are presentation labels only. They must not be stored in `orders.status`.

Approximate product-language mapping for the pilot:

- creado / pendiente_admin -> `pending`
- asignado / aceptado_driver -> `assigned`
- en_camino -> `to_pickup`, `picked_up`, or `in_transit` depending on sub-step
- entregado -> `delivered`
- cancelado -> `cancelled`

## Remaining Risks

- The live proof is data/API lifecycle proof, not physical courier proof.
- No Google Maps, Places, Routes, Matrix, real GPS movement, ETA, or navigation provider claim is made.
- No real payment settlement, payout, SPEI, cash reconciliation, or wallet withdrawal proof is made.
- No push notification or WhatsApp delivery proof is made.
- Admin browser E2E assignment/reassignment against deployed UI remains a useful next proof layer.
- Mapbox chunks remain large and should be addressed in the future Maps/performance lane.

## Verdict

The no-Maps operational pilot lifecycle has credible live proof for the core data path.

This is not full production readiness, but it is a real step toward a controlled pilot: the customer-admin-driver lifecycle can reach a terminal state in Supabase real QA with role-specific QA users and cleanup evidence.
