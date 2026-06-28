# VSM Store - Codex Prompt Reliability Protocol

## Purpose

Make exact-next-prompts fail fast before they create broken handoffs, lane mixing, or unusable procedure paths.

This is a work-kit reliability contract only. It does not implement hooks, scripts, runtime behavior, QA runtime behavior, DB behavior, Auth behavior, or deployment behavior.

## Tool and role policy

- Codex is the only real target tool.
- Target tool must be declared explicitly as `Codex`.
- If the target tool is missing, stop with `FAIL_TARGET_TOOL_MISSING`.
- If the target tool is not Codex, stop with `FAIL_TARGET_TOOL_NOT_CODEX`.
- If stale external-tool wording appears as an active instruction anywhere in the prompt, stop with `FAIL_STALE_EXTERNAL_TOOL_NAME`.

## Structural policy

Exact-next-prompts must include:

- `STRICT MODE.`
- an explicit lane declaration;
- `Target tool: Codex`;
- `Mission objective:`;
- `Scope:`;
- `Authorized files` or `Authorized files/surfaces:`;
- `Forbidden actions:` or `Constraints:`;
- `Success condition:`;
- `PROMPT QUALITY GATE CHECK: PASS`;
- `Output:` with `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` whenever a repo procedure is invoked.

Fail codes:

- `FAIL_MISSING_STRICT_MODE`
- `FAIL_LANE_DECLARATION_MISSING`
- `FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING`
- `FAIL_PROMPT_GATE_MISSING`

## Absolute procedure path policy

Every prompt that invokes a repo procedure must use this form:

```text
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\<name>\SKILL.md
```

If the exact file is not found, stop with `FAIL_SKILL_PATH_NOT_FOUND`.

Relative procedure paths are not allowed. If a relative path is found, stop with `FAIL_RELATIVE_SKILL_PATH`.

If a repo procedure is invoked without an absolute procedure path, stop with `FAIL_SKILL_PATH_NOT_FOUND`.

## Lane and git policy

- Readiness, audit, acceptance audit, and QA/read-only lanes must declare `NO COMMIT` and `NO PUSH`.
- Acceptance audit lanes must also declare `NO IMPLEMENTATION` and `NO DOC/CANON CHANGES`.
- Implementation lanes must require baseline git checks, validation, stage-only-authorized-files, commit, push, and final repo checks.
- Canon reconciliation lanes are write lanes and must require the same git completeness discipline.
- Canon reconciliation lanes must not declare `NO COMMIT` or `NO PUSH`; treat either marker as a hard fail.

Fail codes:

- `FAIL_READONLY_CONSTRAINTS_MISSING`
- `FAIL_READONLY_WITH_COMMIT_PUSH`
- `FAIL_BASELINE_CHECKS_MISSING`
- `FAIL_GIT_COMPLETENESS_MISSING`
- `FAIL_FINAL_REPO_CHECKS_MISSING`
- `FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH`
- `FAIL_CANON_WITHOUT_COMMIT_PUSH`
- `FAIL_LANE_MIXING`

## Command discipline

Exact-next-prompts should prefer:

- simple read-only commands;
- quoted paths when paths contain spaces;
- simple `rg` searches for text checks;
- one command per check when possible.

Exact-next-prompts should avoid:

- fragile inline PowerShell parsing;
- parsing-heavy pipelines;
- complex variable expansion;
- multiline PowerShell blocks;
- commands that inspect `.env`, `.env.local`, tokens, cookies, sessions, auth headers, localStorage, or sessionStorage.

Fail codes:

- `FAIL_FRAGILE_INLINE_COMMAND`
- `FAIL_SECRET_INSPECTION_RISK`

## Non-claims and quality gate policy

Every exact-next-prompt must preserve non-claims and residual risks appropriate to the lane.

If non-claims are missing, stop with `FAIL_NON_CLAIMS_MISSING`.

If the quality-gate status is missing, stop with `FAIL_PROMPT_GATE_MISSING`.

## Scorecard policy

Scorecard reports must cap `overallScore` at `49/100` whenever any hard-fail
`ERROR` finding exists. The report must preserve the explicit hard-fail codes
and repairability classification so the cap does not hide the blocking cause.

Acceptance Scorecard v0 is bounded to deterministic text-pattern checks over
acceptance audit reports. It checks for commit identity, scope, validation
evidence, unauthorized file review, repo cleanliness/alignment, residual risks,
non-claims, and embedded exact canon prompt structure when such a prompt is
present. It does not perform semantic AI judging, acceptance execution,
automation, hooks, CI, or runtime enforcement.

Acceptance scorecard hard-fail codes:

- `FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING`
- `FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING`
- `FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING`
- `FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED`
- `FAIL_ACCEPTANCE_REPO_STATE_MISSING`
- `FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING`
- `FAIL_ACCEPTANCE_NON_CLAIMS_MISSING`
- `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`

Acceptance reports themselves are not required to be executable prompts. When an
acceptance report emits an embedded exact canon prompt, that embedded prompt
must satisfy deterministic canon reconciliation prompt structure.

Prompt Lint Helper v1 applies that embedded exact canon prompt check directly.
Acceptance reports without an embedded exact canon prompt must not fail merely
because they omit executable prompt-only structure.

## Reliability smoke policy

Prompt Reliability Smoke Pack v0 is a local/manual bounded smoke runner for the
current reliability stack. It checks eval coverage, scorecard evals, repair
evals, safe prompt-lint fixtures, critical hard-fail fixtures, scorecard
hard-fail score capping, and excellent-scorecard sanity in one command.

It supports human output and `--json`. It does not implement repair, acceptance
automation, hooks, CI, runtime integration, semantic AI judging, product/runtime
proof, DB/Auth/Supabase/browser/provider proof, or production readiness.

## Prompt lint fail code list

- `FAIL_STALE_EXTERNAL_TOOL_NAME`
- `FAIL_RELATIVE_SKILL_PATH`
- `FAIL_TARGET_TOOL_NOT_CODEX`
- `FAIL_TARGET_TOOL_MISSING`
- `FAIL_SKILL_PATH_NOT_FOUND`
- `FAIL_MISSING_STRICT_MODE`
- `FAIL_LANE_DECLARATION_MISSING`
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
- `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`

## Later phase candidates

A deterministic prompt-lint repair mode is useful later, but it is not implemented here.

Future repair must not invent missing context. If authoritative context is missing, the repair flow must block instead of hallucinating text.
