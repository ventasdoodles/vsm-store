# Prompt Lint Helper v1

Local/manual helper for exact-next-prompt text files.

## Purpose

Catch recurring prompt defects before a user executes an exact next prompt.

## What v1 checks

- `STRICT MODE.`
- explicit lane declarations;
- `Target tool: Codex`;
- stale active external-tool instructions;
- repo procedure path validity;
- missing absolute repo procedure paths;
- `Output:` with `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` when a repo procedure is invoked;
- read-only constraints such as `NO COMMIT` and `NO PUSH`;
- implementation/canon git completeness, including baseline, validation, stage-only-authorized-files, commit, push, and final repo checks;
- secret/session/storage inspection wording;
- fragile inline command patterns;
- non-claims and residual-risk language;
- the final `PROMPT QUALITY GATE CHECK: PASS` marker.
- incomplete embedded exact canon prompts inside acceptance audit reports.

Acceptance audit reports are treated as reports, not executable prompts. If an
acceptance report has no embedded exact canon prompt, the helper must not
false-positive on missing prompt-only sections such as `Target tool` or lane.

## Non-goals

- No Git hook integration.
- No CI integration.
- No Codex runtime integration claim.
- No automatic blocking of normal repo work.
- No product/runtime/source/test behavior changes.
- No DB/Auth/Supabase/browser/provider interaction.

## Usage

```bash
node tools/prompt-lint/prompt-lint.mjs <prompt-file>
node tools/prompt-lint/prompt-lint.mjs <prompt-file> --strict
node tools/prompt-lint/repair-evals.mjs
node tools/prompt-lint/repair-evals.mjs --strict
node tools/prompt-lint/scorecard.mjs <prompt-file>
node tools/prompt-lint/scorecard.mjs <prompt-file> --json
node tools/prompt-lint/scorecard.mjs <prompt-file> --strict
node tools/prompt-lint/scorecard-evals.mjs
node tools/prompt-lint/eval-coverage.mjs
node tools/prompt-lint/eval-coverage.mjs --json
node tools/prompt-lint/reliability-smoke.mjs
node tools/prompt-lint/reliability-smoke.mjs --json
```

## Repair eval harness v0

`repair-evals.mjs` is a local/manual fixture runner for the future repair contract.
It reads `tools/prompt-lint/fixtures/repair/manifest.json`, runs the existing
`prompt-lint.mjs` helper against each repair fixture prompt, maps findings to
the accepted repairability categories, and verifies expected findings,
classifications, blocked codes, no-invention assertions, exit behavior, and
non-claims.

The harness does not implement `--repair`, does not generate repaired prompt
text, and does not change prompt-lint helper behavior.

## Scorecard reporter v0

`scorecard.mjs` is a local/manual prompt quality reporter built on
`prompt-lint.mjs` and the repair-eval concepts. It prints deterministic human
output by default, supports `--json` for machine-readable output, and supports
`--strict` with a conservative threshold. `scorecard-evals.mjs` is the local
fixture runner for `tools/prompt-lint/fixtures/scorecard/manifest.json`.

If any hard-fail `ERROR` finding exists, the reporter caps `overallScore` at
`49/100` and preserves the uncapped score plus hard-fail codes in the report.
This prevents a structurally polished but blocked prompt from receiving a
deceptively high overall score.

Acceptance Scorecard v0 adds bounded fixture coverage for acceptance audit
reports. It uses deterministic text-pattern checks for commit identity, scope,
validation evidence, unauthorized file review, repo cleanliness/alignment,
residual risks, non-claims, and embedded exact canon prompt structure when such
a prompt is present. It does not perform semantic AI judging and does not execute
acceptance work.

Acceptance report hard-fail codes:

- `FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING`
- `FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING`
- `FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING`
- `FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED`
- `FAIL_ACCEPTANCE_REPO_STATE_MISSING`
- `FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING`
- `FAIL_ACCEPTANCE_NON_CLAIMS_MISSING`
- `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`

The reporter does not implement repair behavior, dry-run repair, hooks, CI,
automation, runtime integration, or any deterministic enforcement layer.

Prompt Lint Helper v1 also emits
`FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE` directly when an acceptance
audit report contains an incomplete embedded exact canon prompt. Scorecard
remains responsible for the `49/100` hard-fail cap and `unsafe-blocked`
repairability classification.

## Eval Coverage Registry v0

`eval-coverage-registry.json` maps local/manual fixture coverage by fail code,
lane type, and historical regression. `eval-coverage.mjs` validates the registry
shape, confirms referenced fixture paths exist, and reports counts by coverage
status plus coverage by fail code, lane, and historical regression.

Uncovered fail codes are allowed when explicitly marked. The registry is a
visibility surface only; it does not implement repair, acceptance automation,
hooks, CI, runtime enforcement, semantic AI judging, or product/runtime proof.

Gap-closure fixtures now cover the former v0 residuals:
`FAIL_SKILL_PATH_NOT_FOUND`, `FAIL_FRAGILE_INLINE_COMMAND`, and
`FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING`. This makes the registry fully covered
for known fail codes as of v0.1.0, while preserving local/manual-only
non-claims.

## Prompt Reliability Smoke Pack v0

`reliability-smoke.mjs` is a local/manual smoke runner for the prompt reliability
stack. It runs the current eval coverage, scorecard eval, repair eval,
  safe-fixture, hard-fail fixture, and scorecard sanity checks in one bounded
command. It prints a compact PASS/FAIL summary by default and supports `--json`
for machine-readable local inspection.

The smoke runner does not implement repair behavior, hooks, CI, automatic enforcement,
runtime integration, product/runtime proof, DB/Auth/Supabase/browser/provider
proof, or deterministic enforcement beyond this local/manual command.

## Mode behavior

- Default mode prints a structured report and exits `0` even when findings exist.
- Strict mode prints the same structured report and exits nonzero if any `ERROR` finding exists.
- Repair eval strict mode exits nonzero if any fixture expectation fails.
- Scorecard strict mode exits nonzero when the score is below threshold or
  hard fail codes are present.
- Eval coverage exits nonzero only for registry shape errors or missing/invalid
  fixture references, not for explicitly marked uncovered codes.
- Reliability smoke exits nonzero when any required local/manual smoke check
  fails.

## Current non-claims

- No hook exists yet.
- No hook/CI/runtime enforcement automation exists yet.
- No CI integration exists yet.
- No runtime integration exists yet.
- No mechanical enforcement claim is made beyond local/manual helper usage.
- Future `--repair` mode is only a design target; it does not exist yet.
- Missing authoritative context must block future repair instead of being invented.
- Repair eval coverage is local/manual only and does not imply auto-repair behavior.
- Eval coverage is local/manual only and does not imply full automation,
  semantic correctness, or complete fixture coverage.
- Reliability smoke is local/manual only and does not imply hooks, CI,
  automatic enforcement, runtime integration, semantic AI judging, product/runtime proof,
  DB/Auth/Supabase/browser/provider proof, or production readiness.
