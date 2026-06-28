# Workspace Sync Policy

## Purpose

This policy defines how to treat the current workspace truth for Ya VOY.

It exists so the work kit does not silently trust stale clones, stale docs, or old local assumptions when the repo state has drifted.

## Authoritative Sources

Use these in order:

1. Current user instruction for the active task.
2. Live git state from the real checkout you are inspecting.
3. `tools\workflow\vsm-gate.mjs --lane repo-baseline`.
4. Canon docs in `C:\dev\vsm-store-fresh\.vsm-workkit`.
5. The workspace map as an index, not as proof.

## Current Snapshot

Date: 2026-06-27 (single truth reconciliation)

- `F:\ivoy\ivoy1.6` is clean on `main` and aligned with client `origin/main` at `11ea4db1bbbc17513d95513494f653762601dced`.
- `F:\ivoy\ivoy-admin` is clean on `main` and aligned with admin `origin/main` at `f175e8161257423886bd6175f7a9e76aaa1f73aa`.
- `C:\dev\vsm-store-fresh\.vsm-workkit` is the canon/workkit repo; update and push after this reconciliation lane.
- Client prod entry truth: `index.tsx` → `RouterProvider` → TanStack Router file routes (`src/routes/`). `App.tsx` and `react-router-dom` were deleted in commit `65f4f46`.
- Protected WIP branch: client `codex/form-primitives-wip` at `afa0dd5` (local side branch; not baseline).
- Visual product truth: premium dark/glassmorphism remains canonical. The accepted 2026-06-27 client visual change is only the compact 2-column desktop service-selection layout in `ServiceSelectionStep.tsx`; token/color and premium effects were intentionally preserved from `origin/main`.
- Registered historical superpowers worktrees remain listed in `WORKSPACE_INVENTORY.md`.
- `_scratch` contains evidence/archive material only. It is not the active product baseline.

## Operating Rules

- Run the repo baseline gate before any readiness, canon, or implementation work in this workspace.
- Do not use a dirty product checkout as the source of truth for canon updates.
- When client or admin local state disagrees with remote history, prefer the clean main baselines, production evidence, and explicitly authorized fresh worktrees.
- Clean branch worktrees may remain registered for traceability, but they do not replace the clean mains as current product truth once promotion to `origin/main` is completed.
- Use `tools\workflow\vsm-gate.mjs --lane workspace-sync` when you need the authoritative current-sync check for this workspace.
- Treat docs last-updated dates as advisory only.
- Keep workspace sync evidence separate from product runtime proof.

## Practical Use

Use this policy when you need to decide whether:

- a local checkout is current enough to trust;
- canon text should be updated now or deferred;
- a repo should be treated as a real code target or only as stale evidence/archive material.

For the concrete path-by-path inventory, read `docs\workkit\WORKSPACE_INVENTORY.md`.

For the alignment audit that established this snapshot, read `docs\audits\2026-06\workspace-single-truth-alignment-v1.md`.

## Non-Claims

- This policy does not clean any repo by itself.
- This policy does not force sync between local and remote.
- This policy does not prove production readiness.
- This policy does not replace branch or deployment evidence.
