# VSM Store - Prompt Output Quality Gate

An exact-next-prompt is a draft and must pass this gate before it is presented to the user.

## Core rules

- The real target tool must be Codex.
- Stale active external-tool wording must not be used as an execution instruction.
- A prompt must declare an explicit lane.
- `STRICT MODE.` must be present.
- `PROMPT QUALITY GATE CHECK: PASS` is required, but it is not sufficient by itself.
- If a repo procedure is invoked, the prompt must include `Output:` and `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT`.
- If a repo procedure is invoked, the procedure path must be absolute and resolve under `C:\dev\vsm-store-fresh\.vsm-workkit\skills\<name>\SKILL.md`.
- Readiness, audit, acceptance audit, and QA/read-only prompts must declare `NO COMMIT` and `NO PUSH`.
- Acceptance audit prompts must also declare `NO IMPLEMENTATION` and `NO DOC/CANON CHANGES`.
- Implementation and canon reconciliation prompts are write lanes: they must include baseline checks, validation, stage-only-authorized-files, commit, push, and final repo checks.
- Canon reconciliation prompts must not declare `NO COMMIT` or `NO PUSH`; those markers are hard-fail contradictions in a write lane.
- Scorecard reports must cap any prompt with hard-fail `ERROR` findings at a maximum overall score of `49/100` while preserving the explicit hard-fail codes.
- Acceptance audit reports are scorecard-checkable only for bounded deterministic text evidence: commit identity, scope, validation evidence, unauthorized file review, repo cleanliness/alignment, residual risks, non-claims, and embedded exact canon prompt structure when such a prompt is present.
- Acceptance audit reports are not executable prompts; helper checks must not false-positive when no embedded exact canon prompt exists.
- Eval Coverage Registry v0 can report fixture coverage gaps, but it does not turn coverage into semantic prompt acceptance.
- Prompt Reliability Smoke Pack v0 can run the current local/manual reliability
  stack checks in one bounded command, but it does not turn them into hooks, CI,
  automatic enforcement, runtime enforcement, or product proof.
- The gate is local/manual only. It does not imply hooks, CI, automatic blocking, or runtime enforcement.

## Hard fail codes

- `FAIL_MISSING_STRICT_MODE`
- `FAIL_LANE_DECLARATION_MISSING`
- `FAIL_TARGET_TOOL_MISSING`
- `FAIL_TARGET_TOOL_NOT_CODEX`
- `FAIL_STALE_EXTERNAL_TOOL_NAME`
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
- `FAIL_SKILL_PATH_NOT_FOUND`
- `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE`

## Current non-claims

- No hook exists yet.
- No hook/CI/runtime enforcement automation exists yet.
- No CI integration exists yet.
- No runtime enforcement exists yet.
- No active skill behavior changed in this lane.
- No product/runtime/source/test behavior changed in this lane.
- No semantic AI judging or acceptance automation is implemented by Eval Coverage Registry v0.
- Prompt Reliability Enforcement Pack v1 remains local/manual only and does not prove
  product/runtime, DB/Auth/Supabase/browser/provider, or production readiness.
