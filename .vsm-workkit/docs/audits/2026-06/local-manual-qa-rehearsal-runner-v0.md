# Local Manual QA Rehearsal Runner v0

Date: 2026-06-03

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Commit Identity

- Commit: `ba1a8c6 feat(workflow): add local qa rehearsal runner`
- Reachable from: `main`, `origin/main`

## Files Changed

- `tools/workflow/vsm-qa-rehearsal.mjs`
- `docs/workkit/WORLD_CLASS_FLOW_AUTOMATION.md`
- `docs/workkit/README_WORKKIT.md`

## Accepted Claims

- `ba1a8c6` adds `tools/workflow/vsm-qa-rehearsal.mjs` as a local/manual QA rehearsal runner v0.
- The runner reduces repeated local/manual QA operator shell around controlled QA rehearsals.
- Supported accepted flags include `--help`, `--json`, `--dry-run`, `--preflight-only`, `--run-harness` / `--run`, `--run-label`, `--require-evidence`, and `--start-dev-servers`.
- Default / `--dry-run` behavior is non-mutating and does not run the mutating harness.
- Mutating harness execution requires an explicit flag.
- The runner is local/manual only.
- The runner preserves `orders.id` / `order_id` as proof-key language and does not reintroduce `delivery_id`.
- Evidence extraction is bounded to local scratch/output and ledger formatting only.
- Documentation updates remain limited to `docs/workkit/WORLD_CLASS_FLOW_AUTOMATION.md` and `docs/workkit/README_WORKKIT.md`.

## Validation Evidence

- `node tools\workflow\vsm-gate.mjs --lane repo-baseline --json`
- `node tools\workflow\vsm-gate.mjs --lane prompt --json`
- `node tools\workflow\vsm-gate.mjs --lane qa-preflight --json`
- `node tools\workflow\vsm-qa-rehearsal.mjs --help`
- `node tools\workflow\vsm-qa-rehearsal.mjs --preflight-only --json`
- `node tools\workflow\vsm-qa-rehearsal.mjs --dry-run --json`
- `node tools\workflow\evidence-ledger.mjs --order-id 00000000-0000-0000-0000-000000000000 --status delivered --order-events 5 --order-offers 0 --wallet-transactions 1 --cleanup pass --driver-baseline "500.00 / 0.00 / libre" --retained-evidence untouched`
- `git show --check --stat --oneline ba1a8c6`

## Residual Risks

- The mutating path and dev-server process lifecycle are source-reviewed only, not runtime-proven in the acceptance audit.
- The `--run-harness --start-dev-servers` path was intentionally not executed.
- Evidence discovery can summarize stale local temp runs unless the operator constrains `--run-label`.
- Extracted scratch evidence is not accepted as fresh DB truth.
- `retainedEvidence` remains `unknown/not-checked` unless a separate authorized lane proves it.
- Retained evidence is not independently proven by this runner/audit.

## Non-Claims

- No hook.
- No CI.
- No automatic/runtime enforcement.
- No product/runtime behavior change.
- No DB/Auth/Supabase/browser/provider proof created by the runner.
- No production readiness.
- No real payment, GPS/tracking, notification, courier operation, deploy, or compliance proof.
- No product/client/admin source changes.
- No DB migrations.
- No Supabase functions.
- No Auth/session/profile changes.
- No provider/deploy/production/GPS/payment/notification behavior changes.

## Explicit Boundary

- The mutating runner path was not executed in the acceptance audit.
- This lane canonizes workflow automation only; it does not canonize product/runtime proof.
