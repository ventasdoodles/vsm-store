# VSM Store

Repository map for the current workspace.

## Current State

- Branch: `main`
- Expected integration base: `origin/main`
- Canon and workflow docs are maintained separately from implementation

## Active Canon

Keep these stable and do not move them without a deliberate repo-architecture lane:

- [`AI_CONTEXT.md`](./AI_CONTEXT.md)
- [`AUDIT_LOG.md`](./AUDIT_LOG.md)
- [`STORE_FRONT_AI_PILOT_CONTEXT.md`](./STORE_FRONT_AI_PILOT_CONTEXT.md)
- [`AGENTS.md`](./AGENTS.md)
- [`docs/audits/`](./docs/audits/)
- [`docs/Reglas para IDE antigravity/`](./docs/Reglas%20para%20IDE%20antigravity/)
- [`skills/`](./skills/)

## Workflow Surfaces

Repo procedures and prompt policy live here:

- `skills/vsm-readiness/SKILL.md`
- `skills/vsm-implementation/SKILL.md`
- `skills/vsm-acceptance-audit/SKILL.md`
- `skills/vsm-canon-reconciliation/SKILL.md`
- `skills/vsm-fast-lane-selector/SKILL.md`
- `skills/vsm-browser-visual-qa/SKILL.md`
- `skills/vsm-high-risk-lane/SKILL.md`
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`
- `docs/Reglas para IDE antigravity/PROMPT_SIZING_POLICY_VSM_STORE.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`
- `docs/Reglas para IDE antigravity/VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`

## Tool-Specific Folders

These folders are part of the current toolchain or historical workflow layer:

- [`.claude/`](./.claude/)
- [`.agents/`](./.agents/)
- [`.orchestra/`](./.orchestra/)
- [`output/`](./output/)

Treat them as tooling surfaces, not product canon.

## Legacy / Archive Candidates

These root-level docs are historical handoffs, reports, or old guidance. They should be reviewed before any move to `docs/archive/`, `docs/legacy/`, `docs/operations/`, or `docs/product/`:

- `ADMIN_PANEL.md`
- `AI_*.md`
- `antigravity_*.md`
- `AUDIT_REPORT*`
- `CODEX_*`
- `COLD_*`
- `DEPLOY_*`
- `SESSION_*`
- `VSM_*`
- `WAVE_*`
- `walkthrough.md`

## Regenerable / Local-Only Artifacts

These are safe cleanup candidates only after explicit owner approval:

- `node_modules/`
- `dist/`
- `temp-debug/`
- `.codex-*.log`
- other local build/debug outputs

Tracked generated artifacts that should be reviewed before any archive decision:

- `graqle.json`
- `output/pdf/vsm-store-app-summary.pdf`

## Suggested Docs Architecture

Target shape for later hygiene work:

- `docs/archive/` for closed handoffs and old reports
- `docs/legacy/` for obsolete root docs that still need to be retained
- `docs/ai-workflows/` for orchestration and prompt policy
- `docs/operations/` for admin or runbook material
- `docs/product/` for productization and architecture notes

## Next Lane Guidance

Safest first cleanup lane:

1. Refresh this README as the repo map.
2. Add a docs index only if the root map becomes too dense.
3. Archive historical docs before moving or deleting anything.

## Notes

- Do not treat this file as canon for implementation details.
- Use the current skill files and canonical docs for operational instructions.
- Preserve references before any future move/rename lane.
