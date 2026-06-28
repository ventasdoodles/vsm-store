# Eval Coverage Registry v0

## Purpose

Eval Coverage Registry v0 maps prompt-reliability fixture coverage across fail codes, lane types, and historical regressions.

It is local/manual visibility tooling only. It does not implement repair, acceptance automation, hooks, CI, runtime enforcement, semantic AI judging, DB/Auth/Supabase/browser/provider proof, or product/runtime behavior changes.

## Files

- `tools/prompt-lint/eval-coverage-registry.json` is the machine-readable registry.
- `tools/prompt-lint/eval-coverage.mjs` validates registry shape, confirms referenced fixture paths exist, and reports coverage.

## Usage

```bash
node tools/prompt-lint/eval-coverage.mjs
node tools/prompt-lint/eval-coverage.mjs --json
node tools/prompt-lint/reliability-smoke.mjs
node tools/prompt-lint/reliability-smoke.mjs --json
```

The default report is human-readable. `--json` emits a machine-readable report for local/manual inspection.

`reliability-smoke.mjs` is a local/manual smoke wrapper that includes eval
coverage checks plus scorecard, repair eval, safe fixture, hard-fail fixture,
and scorecard sanity checks. It is visibility tooling only, not CI, hooks,
automation, runtime enforcement, semantic AI judging, or product proof.

## What It Reports

- Fail code coverage status: `covered`, `partial`, `uncovered`, or `not-applicable-yet`.
- Lane coverage for readiness / roadmap, implementation, acceptance audit, canon reconciliation, real-system QA / read-only QA, repair eval classification, and scorecard reporting.
- Historical regression coverage, including stale tool names, relative skill paths, read-only commit/push leakage, write-lane git completeness gaps, secret/session/storage inspection risk, scorecard cap regressions, acceptance report evidence gaps, and incomplete embedded canon prompts in acceptance reports.

## Validator Behavior

The validator exits `0` when the registry is internally consistent.

It exits nonzero when:

- the registry cannot be parsed;
- required top-level arrays are missing;
- an entry has an invalid status;
- duplicate fail code, lane, or regression IDs are present;
- a covered or partial entry has no fixture references;
- an uncovered or not-applicable entry lists fixture references;
- a referenced fixture path is absolute, outside the repo, duplicated in one entry, or missing.

Uncovered fail codes are allowed when they are explicitly marked and reported. v0 is about visibility, not pretending total coverage.

## Current Residuals

- `FAIL_SKILL_PATH_NOT_FOUND` is now covered by a dedicated missing absolute skill path fixture.
- `FAIL_FRAGILE_INLINE_COMMAND` is now covered by a dedicated safe fragile-command fixture.
- `FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING` is now covered by a dedicated repo-procedure prompt that omits the required output contract.
- Coverage remains deterministic fixture/reference coverage only.

Current registry count: 28 fail codes covered, 0 partial, 0 uncovered, and 19 historical regressions covered.

Prompt Reliability Smoke Pack v0 can verify this current count in one bounded
local/manual run.

## Non-Claims

- No repair mode is implemented.
- No acceptance automation is implemented.
- No hook, CI, or runtime enforcement is implemented.
- No semantic AI judging is implemented.
- No product/runtime/source/test behavior is changed.
- No DB/Auth/Supabase/browser/provider surface is touched.
