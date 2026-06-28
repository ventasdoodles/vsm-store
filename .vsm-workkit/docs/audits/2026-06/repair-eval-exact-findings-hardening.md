# Skill System v2 Repair Eval Exact-Only Findings Hardening

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commit `dc1787f test: harden repair eval exact findings`.

## Scope

Accepted prompt reliability/work-kit surfaces:

- `tools/prompt-lint/repair-evals.mjs`
- `tools/prompt-lint/fixtures/repair/manifest.json`
- `tools/prompt-lint/prompt-lint.mjs` as a non-modified dependency

This note records the accepted exact-only hardening of the local/manual repair eval harness only. It does not canonize repair behavior, dry-run repair, enforcement, hooks, CI, automation, or runtime integration.

## Evidence

- Commit `dc1787f` is reachable from `main` and was pushed to `origin/main`.
- Independent acceptance audit returned `ACCEPT WITH RESIDUAL RISK`.
- `node tools\prompt-lint\repair-evals.mjs` passed with 11/11 fixtures.
- `node tools\prompt-lint\repair-evals.mjs --strict` passed with 11/11 fixtures.
- `node tools\prompt-lint\prompt-lint.mjs tools\prompt-lint\fixtures\pass\implementation-safe.txt --strict` returned 0 findings.
- `node tools\prompt-lint\prompt-lint.mjs tools\prompt-lint\fixtures\fail\secret-session-storage-inspection.txt` produced expected default-mode errors, including `FAIL_SECRET_INSPECTION_RISK`.
- `git diff --check` returned exit 0.

## Accepted Facts

- `tools/prompt-lint/repair-evals.mjs` now compares expected finding codes and actual finding codes with exact set equality via `sameCodeSet(...)`.
- Missing expected codes fail.
- Extra unexpected codes fail.
- Display order is normalized/deterministic for presentation only.
- Metadata corrections were limited to `repair-lane-mixing-001` and `repair-missing-authoritative-context-001`.
- No new fixture categories were created.
- Repairability classification behavior stayed unchanged.
- Blocked-code validation stayed unchanged.
- No-invention checks stayed unchanged.
- Non-claim checks stayed unchanged.
- Default mode remains report-only.
- `--strict` still exits nonzero on fixture expectation failures.
- Existing 11/11 repair fixture intent remains intact.

## Preserved Non-Claims

- No `--repair` exists.
- No dry-run repair exists.
- No generated repaired prompt exists.
- No helper behavior changed in `tools/prompt-lint/prompt-lint.mjs`.
- No hook exists.
- No CI integration exists.
- No automation exists.
- No runtime integration exists.
- No deterministic enforcement beyond the local/manual harness exists.
- No browser proof is claimed.
- No DB/Auth/Supabase proof is claimed.
- No production readiness is claimed.
- No payment, GPS, or notification proof is claimed.
- No real rider/courier proof is claimed.
- No deploy readiness is claimed.
- No compliance proof is claimed.

## Residual Risks

- The harness is still local/manual.
- Exact-set checking is now correct, but only within the current fixture set.
- Scorecard v0 remains unimplemented.
- This commit only hardens the evaluation base under future scorecard and repair-dry-run work.

## Exact Next Recommended Lane

Prompt Scorecard v0 Local/Manual Reporter.

Do not proceed directly to `--repair` implementation yet.
