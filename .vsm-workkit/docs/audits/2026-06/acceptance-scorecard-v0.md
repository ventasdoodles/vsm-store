# Skill System v2 Acceptance Scorecard v0

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commit `c677258 feat: add acceptance scorecard fixtures`.

## Scope

Accepted prompt reliability/work-kit surfaces:

- `tools/prompt-lint/scorecard.mjs`
- `tools/prompt-lint/fixtures/scorecard/manifest.json`
- `tools/prompt-lint/fixtures/scorecard/acceptance-good-report.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-commit-check.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-scope-check.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-validation-check.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-repo-state-check.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-residual-risks.txt`
- `tools/prompt-lint/fixtures/scorecard/acceptance-missing-non-claims.txt`
- `tools/prompt-lint/README.md`
- `docs/workkit/PROMPT_OUTPUT_QUALITY_GATE.md`
- `docs/workkit/CODEX_PROMPT_RELIABILITY_PROTOCOL.md`
- `docs/workkit/PROMPT_LINT_SPEC.md`

This note records accepted scorecard behavior and fixture coverage only. It does not canonize semantic judging, acceptance execution, automation, repair behavior, hooks, CI, runtime enforcement, or product/runtime behavior.

## Evidence

- Commit `c677258` is current `HEAD` before canon edits.
- Independent acceptance audit returned `ACCEPT WITH RESIDUAL RISK`.
- `acceptance-good-report.txt` reports `overallScore = 100`, no hard-fail codes, and `strictWouldFail = false`.
- `acceptance-missing-commit-check.txt` reports `overallScore = 49`, `uncappedOverallScore = 92`, and `hardFailScoreCap.applied = true`.
- `acceptance-missing-commit-check.txt` emits `FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING`.
- `excellent-prompt.txt` remains clean with `overallScore = 100`.
- `node tools/prompt-lint/scorecard-evals.mjs` passed with 17/17 fixtures.
- `node tools/prompt-lint/repair-evals.mjs --strict` passed with 11/11 fixtures.
- `git diff --check` returned exit 0.

## Accepted Facts

- Acceptance Scorecard v0 adds bounded deterministic text-pattern evaluation for acceptance audit reports.
- It checks for evidence wording around commit identity, scope verdict, validation evidence, unauthorized file review, repo cleanliness/alignment, residual risks, and non-claims.
- Acceptance fixture coverage includes:
  - `acceptance-missing-commit-check`
  - `acceptance-missing-scope-check`
  - `acceptance-missing-validation-check`
  - `acceptance-missing-repo-state-check`
  - `acceptance-missing-residual-risks`
  - `acceptance-missing-non-claims`
  - `acceptance-good-report`
- Missing commit identity emits `FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING`.
- Bad acceptance fixtures score low and hard-fail as expected.
- `acceptance-good-report` scores high and clean.
- Existing scorecard fixtures remain valid.
- Repair evals remain valid.
- Documentation aligns with the local/manual, deterministic, non-semantic boundary.

## Preserved Non-Claims

- No semantic AI judging exists.
- No acceptance execution exists.
- No acceptance automation exists.
- No repair implementation exists.
- No generated repaired prompt exists.
- No dry-run repair exists.
- No hook exists.
- No CI integration exists.
- No automation exists.
- No runtime enforcement exists.
- No product/runtime proof is claimed.
- No DB/Auth/Supabase/browser/provider proof is claimed.
- No production readiness is claimed.

## Residual Risks

- Checks are heuristic deterministic text-pattern checks.
- Checks confirm presence of evidence wording, not truthfulness of the underlying audit work.
- Acceptance-report detection is heuristic and can over-match or under-match unusual report formats.
- Detected acceptance reports skip normal prompt-lint structural hard fails by design.
- The tool remains local/manual and has no automated enforcement layer.
