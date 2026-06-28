# VSM Store - Prompt Lint Examples / Fixture Pack

## Purpose

Human-readable examples for Prompt Lint Helper v1. These are docs-only fixtures, not an executable test suite.

## PASS fixtures

| ID | File | Why it passes |
| --- | --- | --- |
| P-01 | `tools/prompt-lint/fixtures/pass/read-only-safe.txt` | Readiness lane has `STRICT MODE.`, explicit lane declaration, `NO COMMIT`, `NO PUSH`, an Output section, and the required quality gate. |
| P-02 | `tools/prompt-lint/fixtures/pass/real-system-qa-safe.txt` | QA lane stays read-only and avoids secret/session/storage inspection. |
| P-03 | `tools/prompt-lint/fixtures/pass/acceptance-audit-safe.txt` | Acceptance audit lane includes `NO IMPLEMENTATION`, `NO DOC/CANON CHANGES`, `NO COMMIT`, and `NO PUSH`. |
| P-04 | `tools/prompt-lint/fixtures/pass/canon-safe.txt` | Canon lane includes the full git completeness block and the required output section. |
| P-05 | `tools/prompt-lint/fixtures/pass/implementation-safe.txt` | Implementation lane includes baseline git checks, validation, stage-only-authorized-files, commit, push, and final repo checks. |

## FAIL fixtures

| ID | File | Expected code |
| --- | --- | --- |
| F-01 | `tools/prompt-lint/fixtures/fail/canon-missing-strict-mode.txt` | `FAIL_MISSING_STRICT_MODE` |
| F-02 | `tools/prompt-lint/fixtures/fail/acceptance-audit-missing-lane-declaration.txt` | `FAIL_LANE_DECLARATION_MISSING` |
| F-03 | `tools/prompt-lint/fixtures/fail/acceptance-audit-missing-no-implementation.txt` | `FAIL_READONLY_CONSTRAINTS_MISSING` |
| F-04 | `tools/prompt-lint/fixtures/fail/acceptance-audit-missing-no-doc-canon-changes.txt` | `FAIL_READONLY_CONSTRAINTS_MISSING` |
| F-05 | `tools/prompt-lint/fixtures/fail/acceptance-audit-missing-no-commit.txt` | `FAIL_READONLY_CONSTRAINTS_MISSING` |
| F-06 | `tools/prompt-lint/fixtures/fail/acceptance-audit-missing-no-push.txt` | `FAIL_READONLY_CONSTRAINTS_MISSING` |
| F-07 | `tools/prompt-lint/fixtures/fail/canon-missing-baseline-git-checks.txt` | `FAIL_BASELINE_CHECKS_MISSING` |
| F-08 | `tools/prompt-lint/fixtures/fail/canon-missing-final-repo-checks.txt` | `FAIL_FINAL_REPO_CHECKS_MISSING` |
| F-09 | `tools/prompt-lint/fixtures/fail/canon-missing-validation-commit-push.txt` | `FAIL_CANON_WITHOUT_COMMIT_PUSH` |
| F-10 | `tools/prompt-lint/fixtures/fail/implementation-missing-validation-commit-push.txt` | `FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH` |
| F-11 | `tools/prompt-lint/fixtures/fail/quality-gate-pass-without-structure.txt` | `FAIL_MISSING_STRICT_MODE` and `FAIL_LANE_DECLARATION_MISSING` |
| F-12 | `tools/prompt-lint/fixtures/fail/missing-target-tool.txt` | `FAIL_TARGET_TOOL_MISSING` |
| F-13 | `tools/prompt-lint/fixtures/fail/stale-active-external-tool-wording.txt` | `FAIL_STALE_EXTERNAL_TOOL_NAME` |
| F-14 | `tools/prompt-lint/fixtures/fail/procedure-path-missing.txt` | `FAIL_SKILL_PATH_NOT_FOUND` |
| F-15 | `tools/prompt-lint/fixtures/fail/acceptance-report-incomplete-canon-prompt.txt` | `FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE` |

## Notes

- The `PROMPT QUALITY GATE CHECK: PASS` line is necessary but not sufficient.
- Read-only prompts must still declare their constraints.
- Implementation and canon prompts must include the git completeness block.
- Acceptance reports are not executable prompts; the helper only checks embedded exact canon prompt structure when such a prompt is present.
- The fixtures are docs-only source material for human review and future deterministic lint design.
