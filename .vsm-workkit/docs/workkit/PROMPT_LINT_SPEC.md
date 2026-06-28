# VSM Store - Prompt Lint Spec

## Purpose

Define the deterministic checks that Prompt Lint Helper v1 now applies to exact-next-prompt text and bounded acceptance audit reports.

This spec is still work-kit documentation. It does not implement hooks, CI, automation, runtime enforcement, or product behavior changes.

## Current status

- Prompt Lint Helper v1 exists as a local/manual tool.
- It is heuristic, prompt-text-only, and bounded to approved prompt files.
- It checks exact-next-prompt completeness.
- It treats acceptance audit reports as reports, not executable prompts, and only checks embedded exact canon prompt structure when such a prompt is present.
- Prompt Reliability Smoke Pack v0 exists as a local/manual smoke runner for
  the current prompt-lint, scorecard, repair eval, eval coverage, hard-fail, and
  safe-fixture checks.
- `PROMPT QUALITY GATE CHECK: PASS` is not sufficient by itself.
- No hook exists.
- No CI integration exists.
- No runtime integration exists.
- No automatic enforcement exists.
- Future repair-readiness documentation lives in `PROMPT_REPAIR_CONTRACT.md`.

## Required checks

The helper should fail when any of these are true:

- `STRICT MODE.` is missing.
- An explicit lane declaration is missing.
- `Target tool:` is missing or does not resolve to Codex.
- Stale active external-tool wording such as active ChatGPT/Claude/Gemini/Cursor/Copilot instructions appears.
- A repo procedure is invoked without an absolute skill path.
- A repo procedure is invoked without `Output:` and `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT`.
- Read-only lanes miss `NO COMMIT`, `NO PUSH`, or the forbidden-actions / constraints section.
- Acceptance audit lanes miss `NO IMPLEMENTATION` or `NO DOC/CANON CHANGES`.
- Implementation or canon lanes miss baseline git checks.
- Implementation or canon lanes miss validation, stage-only-authorized-files, commit, or push requirements.
- Implementation or canon lanes miss final repo git checks.
- Canon reconciliation lanes are write lanes; `NO COMMIT` and `NO PUSH` are hard-fail contradictions there.
- Forbidden secret/session/storage inspection appears.
- Fragile inline command patterns appear.
- Non-claims or residual-risk language is missing when applicable.
- `PROMPT QUALITY GATE CHECK: PASS` is missing.
- An acceptance audit report contains an incomplete embedded exact canon prompt.

Acceptance audit reports without embedded exact canon prompts must not fail the helper merely because they are not executable prompts.

## Fail code mapping

Use these codes:

- `FAIL_MISSING_STRICT_MODE`
- `FAIL_LANE_DECLARATION_MISSING`
- `FAIL_TARGET_TOOL_MISSING`
- `FAIL_TARGET_TOOL_NOT_CODEX`
- `FAIL_SKILL_PATH_NOT_FOUND`
- `FAIL_RELATIVE_SKILL_PATH`
- `FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING`
- `FAIL_READONLY_CONSTRAINTS_MISSING`
- `FAIL_READONLY_WITH_COMMIT_PUSH`
- `FAIL_BASELINE_CHECKS_MISSING`
- `FAIL_GIT_COMPLETENESS_MISSING`
- `FAIL_FINAL_REPO_CHECKS_MISSING`
- `FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH`
- `FAIL_CANON_WITHOUT_COMMIT_PUSH`
- `FAIL_LANE_MIXING`
- `FAIL_FRAGILE_INLINE_COMMAND`
- `FAIL_SECRET_INSPECTION_RISK`
- `FAIL_NON_CLAIMS_MISSING`
- `FAIL_PROMPT_GATE_MISSING`
- `FAIL_STALE_EXTERNAL_TOOL_NAME`
- `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`

## Future repair mode

v0.1 prepares the helper for a future `--repair` mode.

- Future repair must never invent missing context.
- Missing authoritative context must become a blocked repair state, not hallucinated text.
- Suggested blocked-repair code for later docs: `REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT`
- The fuller repair boundary, fail-code map, and readiness scorecard live in `PROMPT_REPAIR_CONTRACT.md`.

## Notes

- This spec is about local/manual prompt linting only.
- Scorecard reporting caps prompts with any hard-fail `ERROR` finding at a maximum `overallScore` of `49/100` while preserving the hard-fail codes and classification.
- Acceptance Scorecard v0 evaluates acceptance audit reports with bounded deterministic text-pattern checks only; it does not implement acceptance automation or semantic AI judging.
- Acceptance Scorecard v0 hard-fail codes are `FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING`, `FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING`, `FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING`, `FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED`, `FAIL_ACCEPTANCE_REPO_STATE_MISSING`, `FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING`, `FAIL_ACCEPTANCE_NON_CLAIMS_MISSING`, and `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`.
- Acceptance reports are not scored as executable prompts, but an embedded exact canon prompt inside an acceptance report must satisfy deterministic canon prompt structure.
- Prompt Lint Helper v1 directly enforces the same embedded exact canon prompt structural gate for acceptance audit reports, while scorecard remains responsible for score cap and repairability classification.
- Eval Coverage Registry v0 reports fixture coverage by fail code, lane type, and historical regression; uncovered codes are allowed when explicitly marked.
- Prompt Reliability Smoke Pack v0 reports bounded local/manual health for the
  reliability stack and supports JSON output.
- It does not claim hook, CI, or runtime enforcement.
- It does not change active skill behavior.
