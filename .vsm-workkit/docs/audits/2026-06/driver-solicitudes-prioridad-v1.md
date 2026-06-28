# Driver Solicitudes + Prioridad v1

Date: 2026-06-22
Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane replaces the driver `Demanda` navigation concept with `Prioridad` and keeps `Solicitudes` as the live marketplace request surface. The driver home now shows marketplace requests when visible orders exist and falls back to the radar when there are no visible orders.

`Prioridad` is a personal driver stats surface, not a public profile. It shows data-backed stats intended to make the future priority model understandable: completed trips in the last 30 days, latest reviews, star rating, connected time, daily active streak, seniority, priority score, and tier.

## Product Changes

- Client commit `96ba6c0` adds the main feature: driver nav `Solicitudes / Prioridad / Mis ingresos / Cartera`, marketplace count routing, `DriverPriorityTab`, driver priority service/types/tests, and Supabase migrations.
- Client commit `2a07569` fixes guest/demo runtime so the priority tab and radar home do not issue invalid Supabase reads without a real driver session.
- The priority score is visible and explainable, but it is not yet wired as a production marketplace ranking or early-visibility algorithm.

## Supabase

- Project: `inlvpbiphrrfrdvsadnh`.
- Applied migration `driver_priority_v1`, version `20260622093005`.
- Applied migration `driver_priority_grant_hardening`, version `20260622093129`.
- Remote probes confirmed `driver_presence_events` and `driver_reviews` have RLS enabled.
- Remote probes confirmed `driver_priority_snapshot` is a `security_invoker=true` view.
- Remote grant probe confirmed authenticated access was hardened to the intended limited surface.

## Verification

- Focused final Vitest: `16/16` passed.
- Typecheck: PASS.
- Lint: PASS.
- Build: PASS.
- Release-readiness local gates through full test/build: PASS, including full Vitest `87` files / `514` passed / `2` skipped.
- `verify:release-readiness`: FAIL only at `github-deploy-readiness` because GitHub Actions for pushed client commits fail immediately before useful job logs.
- Manual production deployment: Vercel `dpl_6H4e81q37hRPZjXt9y6VZZtuH5g5`, aliased to `https://ivoyapp.vercel.app`.
- Hosted browser proof: `https://ivoyapp.vercel.app/driver?tab=priority` returned HTTP `200`, rendered priority tab, score, reviews, and the new nav; guest route produced zero browser console errors.

## GitHub Actions Boundary

Actions for `2a07569` failed in 3-5 seconds:

- `Client Quality Gates` run `27943920490`.
- `Lighthouse CI` run `27943920438`.
- `Deploy Client to Vercel` run `27943920460`.
- `Deploy Client to GitHub Pages` run `27943920463`.
- `Smoke Public Runtime` run `27943920451`.

This lane does not claim successful post-push GitHub Actions. The accepted proof is local verification, remote Supabase apply/probes, manual Vercel production deploy, and hosted browser proof.

## Residual Risk

- No heatmap demand map was implemented.
- No driver profile/photo/moto editing was implemented.
- No physical mobile, GPS, payment, payout, push, WhatsApp, or real courier operation proof is claimed.
- Priority score is not yet the production matching/ranking source of truth.
