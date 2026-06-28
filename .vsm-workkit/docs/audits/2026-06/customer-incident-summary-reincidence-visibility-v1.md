# Customer Incident Summary / Reincidence Visibility v1

Date: 2026-06-22

Repos:
- Admin: `F:\ivoy\ivoy-admin`
- Canon: `C:\dev\vsm-store-fresh\.vsm-workkit`

Admin commit:
- `d6a6318cbd4a71c422e58de95d807d6d07585549`
- `feat(admin): add customer incident recurrence summary`

## Scope

This lane adds support/admin visibility for repeated customer incidents in the competitive marketplace lifecycle. It does not apply automatic customer penalties, suspensions, or account deletion.

Implemented Admin pieces:
- `supabase/migrations/20260622173500_customer_incident_summary_v1.sql`
- `supabase/migrations/20260622181000_customer_incident_summary_service_role_v1.sql`
- `src/services/customerIncidentSummary.ts`
- `src/services/__tests__/customerIncidentSummary.test.ts`
- `src/tests/customerIncidentSummaryMigration.test.js`
- `src/components/OrderCardActions.tsx`
- `src/components/__tests__/OrderCardActions.test.tsx`
- `src/hooks/useOrders.ts`
- `src/services/supabaseClient.ts`
- `src/types.ts`
- `src/components/OrderCard.tsx`

## Behavior

`public.customer_incident_summary` aggregates the durable `customer_incidents` ledger by authenticated customer or guest session. It exposes:
- total incidents
- open incidents
- support mediation incidents
- resolved incidents
- warning incidents
- critical incidents
- last incident timestamp
- last incident type
- risk tier: `learning`, `watch`, or `review_required`
- `automatic_penalty_applied=false`

Admin list loading now fetches recurrence summaries by `user_id` and `guest_session_id`, merges them into each order, normalizes them into `HistoricOrder.customer_incident_summary`, and renders them in `OrderCardActions` when an order is in `cancel_review`.

The UI shows `Reincidencia cliente`, the counts, the operational risk label, last incident type, and `Sin bloqueo automatico`.

## Evidence

TDD RED evidence:
- `customerIncidentSummaryMigration.test.js` first failed because `_customer_incident_summary_v1.sql` did not exist.
- `customerIncidentSummary.test.ts` first failed because `../customerIncidentSummary` did not exist.
- `OrderCardActions.test.tsx` first failed because `/reincidencia cliente/i` was not rendered.

Focused GREEN evidence:
- `npm run test -- src/tests/customerIncidentSummaryMigration.test.js --run`: `3/3` then `4/4` after service-role contract.
- `npm run test -- src/services/__tests__/customerIncidentSummary.test.ts --run`: `2/2`.
- `npm run test -- src/components/__tests__/OrderCardActions.test.tsx --run`: `9/9`.
- Combined focused command: `4` files / `25` tests passed.

Full local Admin proof:
- `npm run test -- --run`: `85` files / `304` tests passed.
- `npm exec -- tsc -b --pretty false`: exit `0`.
- `npm run lint`: exit `0`.
- `npm run build`: exit `0`.
- `npm run verify:migration-security`: `MIGRATION_SECURITY_PASS tables=10`.
- `git diff --check`: no whitespace errors; LF/CRLF warnings only.

Browser proof:
- Preview: `http://127.0.0.1:4198/login`.
- Title: `Panel de Administración - Gestión de Pedidos y Repartidores`.
- DOM state: `VSM Store=true`, login button present, `inputCount=2`, root mounted.
- Console: `0` errors/warnings.

Remote Supabase evidence:
- Project: `inlvpbiphrrfrdvsadnh`.
- `customer_incident_summary_v1` migration applied successfully through Supabase connector.
- Metadata smoke proved `relkind='v'`, `security_invoker=true`, `anon_select=false`, `authenticated_select=true`, `service_role_select=true`, and expected columns.

Remote Supabase residual:
- The connector later returned `HTTP 401 token_revoked`.
- The follow-up service-role migration could not be applied in this session.
- Local workspace did not contain a Postgres password/PAT for direct DDL fallback.
- Service-role Data API smoke against the first remote view returned no row, proving the follow-up migration is required before accepting service-role summary behavior as green.

GitHub Actions:
- Admin push `d6a6318` triggered failures:
- `Deploy Supabase Functions` run `27968736283`: failure.
- `Quality Gates` run `27968736243`: failure.
- `Lighthouse CI` run `27968734863`: failure.
- `Deploy Admin to Vercel` run `27968734679`: failure.
- `Deploy Admin to GitHub Pages` run `27968732836`: failure.
- Quality job `82769213726` had `steps: []`.
- `gh run view 27968736243 --log-failed`: `log not found`.

## Verdict

ACCEPT WITH RESIDUAL RISK.

The repo-controlled Admin implementation is tested, built, pushed, and canonized. The first remote view exists and has correct metadata/grants. Full remote behavior for the follow-up service-role view remains blocked by Supabase OAuth/token access, not by source tests.

## Non-Claims

- No global marketplace completion claim.
- No automatic customer suspension or account baja.
- No green post-push GitHub Actions.
- No full remote behavior smoke for the service-role summary until Supabase OAuth/PAT/DB credential access is repaired.
- No physical mobile, GPS, payment, push, WhatsApp, or real courier proof.
