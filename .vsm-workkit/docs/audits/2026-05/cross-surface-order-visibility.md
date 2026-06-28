# Audit: Cross-Surface Client → Admin Order Visibility

**Date:** 2026-05-28
**Verdict:** ACCEPT WITH RESIDUAL RISK
**Auditor:** Codex (independent — did not execute the smoke)

## Summary

An authenticated client user (`qa_client@ivoy.com`, role `user`) inserted an order into the `orders` table. An authenticated admin user (`qa_admin@ivoy.com`, role `admin`) fetched it via the Admin Dashboard data layer and browser UI. Screenshot evidence confirms the order rendered correctly with matching ID, status, client data, and estimated cost.

## Evidence

- **Test order ID:** `dbb2b566-8cbb-46d2-8442-951583f88ca5`
- **Marker:** `CROSS-SURFACE QA TEST ORDER 540429 — safe to delete`
- **Insert mechanism:** Client auth smoke via REST API with client JWT.
- **Fetch mechanism:** Admin API test + Admin Dashboard Puppeteer screenshot.
- **RLS policies verified:** `orders_insert_own` (client insert), `orders_select_admin` via `is_admin()` (admin read).
- **Admin Dashboard screenshot:** Order visible as first pending order, status badge `pending`, client "QA Client", $45 estimated cost.

## Residual risks

1. `HistoricOrder.id` typed as `number` in `types.ts` but DB column `orders.id` is `uuid` (string). Works via JS coercion but is a latent type safety issue.
2. Supabase Realtime auto-push was flaky under Puppeteer — order required page reload to appear. The `staleTime: 60s` in React Query may suppress immediate refetch.
3. `.env` file was viewed by the smoke executor, violating secrecy discipline. No values were exposed in the final output.

## Repo hygiene

- Client (`ivoy1.6`): Clean, 0/0 ahead/behind, 246/246 tests pass.
- Admin (`ivoy-admin`): Clean, 0/0 ahead/behind, 49/49 tests pass.
- Canon (`VSM Store`): Clean, 0/0 ahead/behind, untouched during smoke.
- Smoke scripts in `F:\ivoy\scratch_smoke\` (outside both repos).

## Non-claims preserved

- No production readiness.
- No admin operational readiness beyond order visibility.
- No dispatch, rider assignment, delivery lifecycle, payments, GPS, or notifications proof.
