# Workspace Inventory

Date: 2026-06-27 (single truth reconciliation)

This is the operational inventory for `F:\ivoy`.

## Current Product Baselines

Use these for current product truth, audits, and new work:

- Client baseline: `F:\ivoy\ivoy1.6`
  - Branch: `main`
  - Commit: `11ea4db1bbbc17513d95513494f653762601dced`
  - Source: `ventasdoodles/ivoy` `origin/main`
  - Status: clean `main`, aligned `0 0`
  - Prod entry: `index.tsx` → `RouterProvider` → TanStack Router file routes (`src/routes/`)
  - Note: `App.tsx` and `react-router-dom` deleted in commit `65f4f46`
  - Visual rule: premium dark/glassmorphism remains canonical; the accepted desktop service-selection change is compact 2-column cards only.
- Admin baseline: `F:\ivoy\ivoy-admin`
  - Branch: `main`
  - Commit: `f175e8161257423886bd6175f7a9e76aaa1f73aa`
  - Source: `ventasdoodles/ivoy-admin` `origin/main`
  - Status: clean `main`, aligned `0 0`
- Work kit / canon: `C:\dev\vsm-store-fresh\.vsm-workkit`
  - Branch: `main`
  - Commit before this reconciliation: `cef248bd8ef72aae783c7ef5aacd21370b10ad17`
  - Source: `ventasdoodles/ivoy-canon` `origin/main`
  - Status: canonical work kit under 2026-06-27 single-truth reconciliation

## Protected WIP Branches (not baseline)

- Client `F:\ivoy\ivoy1.6` branch `codex/form-primitives-wip`
  - Commit: `afa0dd5` (local; push when operator authorizes)
  - Scope: legacy form primitive extraction phase 3
  - Status: isolated from `main`; does not change prod entry or E2E paths

## TanStack Router Prod Entry (active)

- Client TanStack file routes: `F:\ivoy\ivoy1.6\src\routes\` (this is the prod entry, no longer shadow)
- Storybook: `npm run storybook` in client repo (isolated visual sandbox)

## Active Branch Worktrees

Historical superpowers worktrees remain registered for traceability only:

- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\qa-cash-closeout`
  - Branch: `codex/qa-cash-closeout`
  - Commit: `50e2235920e9ce780c2005766df8df8fe42b54e4`
  - Status: clean local historical worktree
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client`
  - Branch: `codex/xalapa-city-zero-client`
  - Commit: `d468b85a9c85d7ec121e86adaa9cd01b5a31ab02`
  - Status: clean pushed branch worktree
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\cash-closeout-control-plane`
  - Branch: `codex/cash-closeout-control-plane`
  - Commit: `957004031990f14165cca688c554f0ca47a17153`
  - Status: clean local historical worktree
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin`
  - Branch: `codex/xalapa-city-zero-admin`
  - Commit: `b3b42be28219366684d2404d92f9993c573386f2`
  - Status: clean pushed branch worktree

## Removed As Obsolete

- `F:\ivoy\_scratch\ivoy-driver-customer-mode-main`
- `F:\ivoy\_scratch\ivoy-client-origin-main-clean`
- `F:\ivoy\_scratch\ivoy-admin-origin-main-clean`
- `F:\ivoy\_scratch\ivoy-driver-map-fullscreen`
- `F:\ivoy\_scratch\ivoy-pilot-operational-client`

## Rules

- New product work starts from the clean main baselines, not from protected WIP or scratch folders.
- Protected WIP must live on named branches; never leave `main` dirty for baseline claims.
- TanStack Router file routes in `src/routes/` are the sole prod entry since commit `65f4f46`. There is no shadow architecture.
- Obsolete clean scratch worktrees may be removed after their PR is merged and `git status` is clean.
- Dirty worktrees are never deleted, reset, or force-cleaned without explicit operator approval.
