# QA Rehearsal Runner Run-Label Contract Fix

Date: 2026-06-03

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Commit Identity

- Commit: `9e48dd9 fix(workflow): enforce qa rehearsal run labels`
- Accepted as: local/manual workflow-runner hardening only

## Accepted Claims

- `9e48dd9` fixes the prior local/manual runner issue where `--run-label` was treated as a preference and could fall back to latest local temp evidence.
- `--run-label` is now enforceable under `--require-evidence`.
- Stale/latest temp evidence with a mismatched label can no longer satisfy required evidence.
- Mismatched evidence blocks with `BLOCKED_RUN_LABEL_EVIDENCE_MISMATCH`.
- Missing requested evidence blocks with `BLOCKED_NO_RUN_LABEL_FOUND`.
- Structured evidence fields exist: `labelsFound`, `selectedRunLabel`, and `runLabelMatchesRequested`.
- The prior blocked case reports requested label, selected mismatched label, `runLabelMatchesRequested: false`, no stale orders, and blocker code.
- `--self-test-run-label-contract --json` is non-mutating and reports `harnessRan: false`, `devServersStarted: false`, and `mutations: false`.
- Safe defaults remain intact: default / `--dry-run` and `--preflight-only` do not run the mutating harness.
- Harness execution still requires `--run-harness` or `--run`.
- `orders.id` / `order_id` remains the primary proof key.
- `delivery_id` was not reintroduced.
- Documentation in `docs/workkit/WORLD_CLASS_FLOW_AUTOMATION.md` describes the enforceable run-label contract while preserving local/manual boundaries.

## Validation Evidence Accepted

- `node --check tools\workflow\vsm-qa-rehearsal.mjs`: PASS
- `node tools\workflow\vsm-gate.mjs --lane repo-baseline --json`: PASS
- `node tools\workflow\vsm-gate.mjs --lane prompt --json`: PASS, smoke 19/19, coverage 28/28
- `node tools\workflow\vsm-gate.mjs --lane qa-preflight --json`: PASS, `CONTRACT_CHECK: PASS`
- `node tools\workflow\vsm-qa-rehearsal.mjs --help`: PASS
- `node tools\workflow\vsm-qa-rehearsal.mjs --preflight-only --json`: PASS, no harness/dev servers
- `node tools\workflow\vsm-qa-rehearsal.mjs --dry-run --json`: PASS, no harness/dev servers
- `node tools\workflow\vsm-qa-rehearsal.mjs --self-test-run-label-contract --json`: PASS, non-mutating
- `git show --check --stat --oneline 9e48dd9`: PASS

## Residual Risks

- Full mutating runner proof still needs a fresh authorized run with a label strategy the harness produces and the runner can correlate.
- Evidence remains local/manual scratch evidence, not DB truth.
- Retained evidence remains `not-checked` unless separately authorized and proven.
- Browser/visual proof is still absent unless produced by a separate authorized lane.
- No full mutating runner proof was performed in the acceptance audit.

## Non-Claims

- No production readiness.
- No hook.
- No CI.
- No runtime enforcement.
- No DB/Auth/Supabase proof.
- No browser/provider proof.
- No product behavior proof.
- No real payment/GPS/notification/courier/compliance proof.
- No secret/env/token/cookie/storage inspection.
- No product/client/admin source behavior change.

## Explicit Boundary

- The run-label evidence matching contract is accepted.
- Full mutating `--run-harness --start-dev-servers` proof remains unproven.
- Local scratch evidence remains separate from DB truth.
- This canon entry does not convert local/manual workflow-runner hardening into product, DB, browser, provider, runtime enforcement, or production readiness.
