# Customer Incident Ledger + Support Mediation v1

Date: 2026-06-22

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane closes the marketplace gap where pickup no-show and dropoff no-contact were operationally visible but not stored as durable customer account history.

Accepted implementation:

- Admin commit `2bddfe716291376a80b0fc680b61771e27c60c80` in `F:\ivoy\ivoy-admin`.
- Remote Supabase migration `customer_incident_ledger_v1` applied to project `inlvpbiphrrfrdvsadnh`.
- New migration `supabase/migrations/20260622161000_customer_incident_ledger_v1.sql`.
- New `public.customer_incidents` ledger with RLS, explicit grants, admin policy, support resolution fields, and `automatic_penalty_applied=false`.
- `driver_release_marketplace_wait` records `customer_no_show_at_pickup` warning/open incident.
- `driver_request_marketplace_support_release` records `customer_unreachable_at_dropoff` warning/support_mediation incident.
- `resolve_marketplace_cancel_review` resolves related incidents with selected support outcome.
- Admin `cancel_review` UI now renders `Historial operativo del cliente` from nested `customer_incidents`.

## Evidence

TDD RED/GREEN:

- `src/tests/marketplaceWaitAndResolutionMigration.test.js` failed first because `_customer_incident_ledger_v1.sql` did not exist.
- `src/components/__tests__/OrderCardActions.test.tsx` failed first because `OrderCardActions` did not render customer incident history.
- Both contracts passed after implementation.

Remote Supabase proof:

- `apply_migration` returned success for `customer_incident_ledger_v1`.
- Metadata smoke proved `table_exists=true`, `rls_enabled=true`, `anon_select=false`, authenticated select/insert/update grants true, and required RPCs exist.
- Behavior smoke with temporary orders proved:
  - `pickup_incident_created=true`, detail `customer_no_show_at_pickup/open`.
  - `dropoff_incident_created=true`, detail `customer_unreachable_at_dropoff/support_mediation`.
  - `dropoff_incident_resolved=true`, detail `resolved/support_release_no_fault`.
- Smoke data was cleaned up.

Local proof:

- `npm run test -- src/tests/verifyE2eQaWorkflow.test.js src/tests/marketplaceWaitAndResolutionMigration.test.js src/components/__tests__/OrderCardActions.test.tsx --run`: `32/32`.
- `npm run test -- --run`: `83` files / `297` tests.
- `npm exec -- tsc -b --pretty false`: pass.
- `npm run lint`: pass with `--max-warnings=0`.
- `npm run build`: pass.
- `npm run verify:migration-security`: `MIGRATION_SECURITY_PASS tables=10`.
- `git diff --check`: pass with LF/CRLF warnings only.
- Browser plugin local preview load of `http://127.0.0.1:4196/login`: title `Panel de Administracion - Gestion de Pedidos y Repartidores`, visible VSM Store login DOM, no framework overlay, and zero console errors/warnings.

## Residual Risk

- The two updated Playwright marketplace exception tests were attempted locally but skipped `2/2` because local `.env` has public runtime keys only, not the QA credential/service-role material those specs require.
- No Vercel deploy is claimed for Admin commit `2bddfe7`.
- No automatic suspension/baja decision engine exists yet; this lane records durable incidents for future support policy.
- No real payment, GPS, push, WhatsApp, physical mobile, or full support-operations compliance proof is claimed.
