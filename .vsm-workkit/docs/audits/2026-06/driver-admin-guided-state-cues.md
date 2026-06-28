# Driver/Admin Guided State Cues

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commits `05df1b64c06c1b636fa665d2ae3bcedadf8e4a14 feat(pilot): add guided state cues` and `d3f2cbf6a570c664047d24d849916440d9a56f20 feat(pilot): add operations priority cues`.

## Scope

Accepted source/test UX copy and guidance refinements only. This note records the visible Driver and Admin improvements that were accepted. It does not open any Customer/SPEI/WhatsApp lane, backend, schema, RPC, auth, payment, GPS, notification, Playwright/e2e, qa-temp, or runtime-behavior lane.

## Evidence

- Independent acceptance audit returned ACCEPT WITH RESIDUAL RISK.
- Client `npm run typecheck` passed.
- Client focused test command passed with 13 tests.
- Admin `npx tsc -b` passed.
- Admin focused test command passed with 59 tests.
- `git diff --check` passed for the scoped changed files.
- The broader client `npm run test:run` remains noisy because Vitest discovers the unrelated Playwright e2e spec `e2e/visual-qa.spec.ts`.

## Accepted Facts

- Lane name: Driver/Admin Guided State Cues.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Client commit: `05df1b64c06c1b636fa665d2ae3bcedadf8e4a14 feat(pilot): add guided state cues`.
- Admin commit: `d3f2cbf6a570c664047d24d849916440d9a56f20 feat(pilot): add operations priority cues`.
- Driver next-action clarity improved.
- Driver marketplace scanability improved.
- Driver active-order guidance is more explicit.
- Driver offer cards now surface clearer action cue and context.
- Admin queue priority is clearer.
- Admin order cards and dispatch views read more like an operational control surface.
- The changes are narrow UX/copy/guidance refinements.
- These changes do not alter product behavior, backend behavior, lifecycle behavior, or runtime capabilities.

## Preserved Non-Claims

- No Customer/SPEI/WhatsApp lane fix.
- No GPS, live tracking, or geolocation enhancement.
- No backend, schema, RPC, auth, Supabase, payment, notification, GPS, geolocation, lifecycle, commission, wallet, cancellation, or RLS capability expansion.
- No Playwright/e2e behavior change.
- No production readiness.
- No physical mobile/PWA proof.
- No real rider/courier operations proof.
- No full security/compliance proof.

## Residual Risks

- `CUSTOMER_SCOPE_BLOCKED_BY_PREEXISTING_LOCAL_EDITS` remains in force.
- The dirty Customer/SPEI/WhatsApp lane remains local, unstaged, and intentionally untouched:
  - `components/OrderConfirmationStep.tsx`
  - `services/whatsappService.ts`
  - `contexts/ToastContext.tsx`
  - `sql/supabase-spei-webhooks.sql`
  - `qa-temp/`
- Client worktree still has untracked `qa-temp/`.
- The unrelated pre-existing admin `package.json` modification remains outside the accepted commits.
- The value delivered here is UX clarity, not deeper runtime capability.
