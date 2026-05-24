# Macro Root Repository Cleanup - May 2026

## Status
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Implementation commit: `91528854cc23e8e19bdde2a471ee3b84b4680211` (`chore(cleanup): macro root repository clutter cleanup`).
- Implementer reported: Gemini temporary execution, not Codex/Antigravity.

## Accepted Scope
- 72 root documentation files moved as `R100` content-identical renames into:
  - `docs/ai-workflows/`
  - `docs/architecture/`
  - `docs/archive/`
  - `docs/operations/`
  - `docs/product/`
- 44 loose root/output/helper artifacts deleted, including debug scripts, temporary TS/Python/JS/MJS files, SQL exports/seeds, text outputs, PDFs, JSON reports, `run.js`, `setup.js`, and extensionless `STORE_FRONT_AI_PILOT_CONTEXT`.
- Protected source/runtime/test/canon paths were untouched in the implementation commit:
  - `AI_CONTEXT.md`
  - `AUDIT_LOG.md`
  - `STORE_FRONT_AI_PILOT_CONTEXT.md`
  - `AGENTS.md`
  - `README.md`
  - `src/`
  - `public/`
  - `supabase/`
  - `skills/`
  - `graqle.json`
  - `graqle.yaml`
  - `scripts/vendor/graqle/`
  - `.github/workflows/graqle-sync.yml`
  - `categories.json`

## Accepted Validation
- `git status -sb`: `## main...origin/main`.
- `git rev-list --left-right --count origin/main...HEAD`: `0 0`.
- `git show --stat --oneline 9152885`: inspected.
- `git diff --name-status 9152885^ 9152885`: 72 `R100` renames and 44 deletions.
- `git diff --check 9152885^ 9152885`: PASS.
- Blob comparison confirmed all `R100` moved docs were content-identical.
- Protected-path diff checks found no source/runtime/test/canon path changes.

## Non-Claims
- This does not prove the repository is completely productized or completely clean.
- This does not prove external archive completeness at `F:\vsm-store-private-archive\`.
- This does not prove runtime/source/test/product behavior.
- This does not prove browser QA, deploy/live smoke, DB/Supabase, provider/Gemini, Product Search, Cesarin runtime, checkout/payment, auth/session/storage/secret, or production behavior.

## Residual Risks
- The reported claim of 42 loose diagnostic/debug/stale files exported then removed does not exactly match Git evidence if `run.js`, `setup.js`, and extensionless `STORE_FRONT_AI_PILOT_CONTEXT` are excluded: the commit shows 44 deletions total, leaving 41 deletions after those 3 special removals.
- Stale tracked references remain after the move/delete cleanup:
  - `README.md` references deleted `walkthrough.md`.
  - `README.md` references deleted `output/pdf/vsm-store-app-summary.pdf`.
  - `docs/architecture/SUPABASE_REAL_ARCHITECTURE.md` references deleted `export_supabase_schema.sql`.
  - `scripts/simulate_cesarin.ts` still writes `simulation_report.json`.
  - `.orchestra/approved/2026-03-22_18-00_anty_claude_admin_orders_crud_REPORT.md` references root `ROADMAP.md`.
  - `graqle.json` retains generated references to deleted root helper files.
- These residual references were not fixed in the accepted cleanup lane because the implementation commit intentionally left protected canon/generated/source surfaces untouched.
