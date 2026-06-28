# Workspace Single Truth + Premium Visual Reconciliation

- **Date:** 2026-06-27
- **Status:** ACCEPT
- **Repos:** `ivoy1.6`, `ivoy-admin`, `VSM Store`

## Decision

The user accepted only the desktop service-selection compact layout change:

- `components/ServiceSelectionStep.tsx` now uses a compact 2-column desktop grid.
- Desktop service cards use `variant="compact"`.
- Desktop service cards use `getShortTitle(...)`, matching the compact mobile title language.

The user rejected the local style/token changes that reduced the premium visual system:

- `styles/components.css` was restored to preserve premium dark/glassmorphism, gradients, shadows, blur, and richer interactions.
- `styles/tokens.css` was restored to preserve the canonical brand color and dark premium palette.

## Accepted Baselines

- Client: `F:\ivoy\ivoy1.6` `main` at `11ea4db1bbbc17513d95513494f653762601dced`, clean and aligned `0 0` with `origin/main`.
- Admin: `F:\ivoy\ivoy-admin` `main` at `f175e8161257423886bd6175f7a9e76aaa1f73aa`, clean and aligned `0 0` with `origin/main`.
- Canon: `C:\dev\vsm-store-fresh\.vsm-workkit` `main`, reconciled by this lane.

## Verification

- Client `git diff --check`: PASS before commit.
- Client `npm run typecheck`: PASS.
- Client focused visual harness test `npm run test:run -- src/test/pilotDemoVisualHarness.test.tsx`: PASS, 13 tests.
- `vsm-gate --lane repo-baseline`: PASS after pushing client commit `11ea4db`.

## Non-Claims

- No fresh hosted E2E proof.
- No production readiness claim.
- No GitHub Actions green claim.
- No DB/Auth/Supabase/browser/provider proof from this reconciliation lane.
