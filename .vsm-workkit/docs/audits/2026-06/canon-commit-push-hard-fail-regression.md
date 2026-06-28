# Skill System v2 Canon Commit/Push Hard-Fail Regression

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commit `6f7f8eb fix: hard-fail canon prompts without commit push`.

## Scope

Accepted prompt reliability/work-kit surfaces:

- `tools/prompt-lint/prompt-lint.mjs`
- `tools/prompt-lint/fixtures/fail/canon-with-no-commit-no-push.txt`
- `tools/prompt-lint/fixtures/fail/canon-with-no-commit-only.txt`
- `tools/prompt-lint/fixtures/fail/canon-with-no-push-only.txt`
- `tools/prompt-lint/fixtures/scorecard/canon-with-no-commit-no-push.txt`
- `tools/prompt-lint/fixtures/scorecard/canon-with-no-commit-only.txt`
- `tools/prompt-lint/fixtures/scorecard/canon-with-no-push-only.txt`
- `tools/prompt-lint/fixtures/scorecard/manifest.json`
- `docs/workkit/CODEX_PROMPT_RELIABILITY_PROTOCOL.md`
- `docs/workkit/PROMPT_LIBRARY_TEMPLATES.md`
- `docs/workkit/PROMPT_LINT_SPEC.md`
- `docs/workkit/PROMPT_OUTPUT_QUALITY_GATE.md`

This note records accepted prompt-lint and scorecard regression coverage only. It does not canonize product/runtime behavior, repair behavior, dry-run repair, hooks, CI, automation, or runtime enforcement.

## Evidence

- Commit `6f7f8eb` is reachable from `main` and was pushed to `origin/main`.
- Independent acceptance audit returned `ACCEPT WITH RESIDUAL RISK`.
- `canon-with-no-commit-no-push.txt` emitted `FAIL_CANON_WITHOUT_COMMIT_PUSH`; strict mode exited `1`.
- `canon-with-no-commit-only.txt` emitted `FAIL_CANON_WITHOUT_COMMIT_PUSH`; strict mode exited `1`.
- `canon-with-no-push-only.txt` emitted `FAIL_CANON_WITHOUT_COMMIT_PUSH`; strict mode exited `1`.
- `node tools/prompt-lint/prompt-lint.mjs tools/prompt-lint/fixtures/pass/canon-safe.txt --strict` returned 0 findings.
- `node tools/prompt-lint/prompt-lint.mjs tools/prompt-lint/fixtures/pass/implementation-safe.txt --strict` returned 0 findings.
- `node tools/prompt-lint/scorecard-evals.mjs` passed with 10/10 fixtures.
- `node tools/prompt-lint/repair-evals.mjs --strict` passed with 11/11 fixtures.
- `git diff --check` returned exit 0.

## Accepted Facts

- Canon reconciliation prompts containing `NO COMMIT` and/or `NO PUSH` now hard-fail with `FAIL_CANON_WITHOUT_COMMIT_PUSH`.
- The three prompt-lint regression fixtures are:
  - `canon-with-no-commit-no-push`
  - `canon-with-no-commit-only`
  - `canon-with-no-push-only`
- Scorecard coverage exists for all three variants.
- Existing safe canon and implementation fixtures still pass.
- Scorecard and repair eval suites remain passing after the hardening.
- Documentation now states canon reconciliation is a write lane and must not include `NO COMMIT` or `NO PUSH`.

## Preserved Non-Claims

- No `--repair` exists.
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

- The tool remains local/manual.
- Scorecard overall score remains `92/100` for these hard-fail fixtures even though strict mode blocks them.
- Broader prompt variants remain bounded by heuristic text checks.
