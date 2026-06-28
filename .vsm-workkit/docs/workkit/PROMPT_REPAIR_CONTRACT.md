# VSM Store - Prompt Auto-Repair Contract & Fail-Code Map

## Purpose

Define the safe readiness contract for a future Prompt Auto-Repair Mode. This is docs/spec only. It does not implement repair behavior, hooks, CI, automation, or runtime integration.

## Current status

- Prompt Lint Helper v0.1 is accepted/canonized with residual risk.
- Local/manual repair fixture/eval harness v0 exists for executable coverage of repair classifications and blocked cases.
- `--repair` does not exist yet.
- Direct repair implementation is explicitly future-only.
- Missing authoritative context must block future repair instead of being invented.

## Non-goals

- Do not implement `--repair`.
- Do not add helper behavior.
- Do not add hooks, CI, automation, or runtime integration.
- Do not change source/runtime/test/product behavior.
- Do not widen scope beyond prompt-text repair readiness.
- Do not remove forbidden actions from any prompt contract.

## Repair allowed cases

Future repair may only rewrite prompt text when the missing or defective structure is directly derivable from:

- explicit prompt text;
- canonical templates;
- the supported skill registry;
- existing fail-code mapping;
- current canon facts.

Allowed repair examples are limited to structural normalization of known prompt contracts, such as restoring missing lane blocks, restoring required output sections, restoring required quality-gate markers, and normalizing wording to the approved target-tool / procedure syntax when the intended lane is otherwise explicit.

## Repair blocked cases

Repair must block when any of the following are missing or ambiguous:

- target tool;
- lane type;
- role;
- skill path;
- authoritative accepted state;
- authorized files/surfaces;
- forbidden actions;
- validation requirements;
- commit/push requirements;
- non-claims/residual risks;
- source-of-truth context.

Repair must also block when it would need to invent or infer:

- scope;
- validation commands;
- commit hashes;
- acceptance status;
- canon facts;
- file paths;
- risk posture;
- proof claims.

## Required blocked code

`REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT`

Use this when repair cannot proceed because authoritative context is missing, incomplete, or too ambiguous to safely reconstruct the prompt.

## No-invention rules

- Repair must not invent scope.
- Repair must not invent validation commands.
- Repair must not invent commit hashes.
- Repair must not invent acceptance status.
- Repair must not invent canon facts.
- Repair must not invent file paths.
- Repair must not widen risk.
- Repair must not convert read-only lanes into mutation lanes.
- Repair must not remove forbidden actions.
- Repair must not erase non-claims.
- Repair must not claim browser/DB/Auth/Supabase/product/runtime proof from prompt text alone.
- Repair must not inspect secrets or storage to guess missing context.

## Fail-code repair classification

| Fail code | Category | Notes |
|---|---|---|
| `FAIL_STALE_EXTERNAL_TOOL_NAME` | `template-repairable` | Canonical target wording can usually be normalized from existing templates. |
| `FAIL_RELATIVE_SKILL_PATH` | `template-repairable` | Relative skill paths can be rewritten to the approved absolute form when the underlying skill is already known. |
| `FAIL_TARGET_TOOL_NOT_CODEX` | `unsafe-blocked` | Changes the real target tool; requires human review, not automatic repair. |
| `FAIL_TARGET_TOOL_MISSING` | `context-required` | Cannot safely infer the target tool without authoritative context. |
| `FAIL_SKILL_PATH_NOT_FOUND` | `context-required` | Needs registry-backed path data or explicit authoritative context. |
| `FAIL_MISSING_STRICT_MODE` | `template-repairable` | Structural contract marker can be restored directly. |
| `FAIL_LANE_DECLARATION_MISSING` | `template-repairable` | Lane declaration is a canonical prompt skeleton element. |
| `FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING` | `template-repairable` | Repo procedure wrapper syntax is template-driven. |
| `FAIL_READONLY_CONSTRAINTS_MISSING` | `template-repairable` | Read-only constraints are canonical scaffolding. |
| `FAIL_READONLY_WITH_COMMIT_PUSH` | `unsafe-blocked` | Would mutate a read-only lane into a mutation lane. |
| `FAIL_BASELINE_CHECKS_MISSING` | `template-repairable` | Baseline git checks are a known implementation/canon structure. |
| `FAIL_GIT_COMPLETENESS_MISSING` | `template-repairable` | Git completeness is a canonical checklist item. |
| `FAIL_FINAL_REPO_CHECKS_MISSING` | `template-repairable` | Final repo checks are a canonical closing block. |
| `FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH` | `unsafe-blocked` | Changes lane obligations in a way that must remain explicit. |
| `FAIL_CANON_WITHOUT_COMMIT_PUSH` | `unsafe-blocked` | Canon lanes must preserve their validation/commit/push obligations. |
| `FAIL_LANE_MIXING` | `unsafe-blocked` | Mixed intent cannot be repaired safely without human judgment. |
| `FAIL_FRAGILE_INLINE_COMMAND` | `unsafe-blocked` | Command rewrites can change execution semantics. |
| `FAIL_SECRET_INSPECTION_RISK` | `unsafe-blocked` | Repair must not route into secret/session/storage inspection. |
| `FAIL_NON_CLAIMS_MISSING` | `template-repairable` | Non-claims blocks are canonical governance scaffolding. |
| `FAIL_PROMPT_GATE_MISSING` | `template-repairable` | The quality-gate footer is a canonical structural requirement. |

No current hard-fail code belongs in `no-op / informational`; reserve that bucket for future warning-only telemetry if the protocol grows a non-blocking class later.

## Future repair output contract

Future repair mode must return:

- original findings;
- repairability classification;
- repaired prompt if safe;
- blocked reason if unsafe;
- authoritative context used;
- authoritative context missing;
- non-claims preserved;
- residual-risk note;
- default / strict exit behavior.

Default mode should remain proposal-only and read-only: safe repair or explicit block, with no mutation.

Strict mode should fail closed on ambiguity, missing authoritative context, or unsafe semantic shifts.

## Repair fixture / eval coverage

Executable repair fixture/eval coverage should include:

- pass / no-op fixtures;
- safe repair fixtures;
- blocked repair fixtures;
- no-invention fixtures;
- lane-mixing blocked fixtures;
- secret/session/storage blocked fixtures;
- canon / implementation git-completeness fixtures;
- stale external-target fixtures;
- missing-authoritative-context fixtures.

Existing docs-only examples are not enough by themselves; repair-specific fixture coverage must remain local/manual unless a later accepted lane authorizes hooks, CI, automation, or runtime integration.

## Future scorecard model

Minimum repair-readiness scorecard fields:

- prompt structure score;
- lane purity score;
- authoritative context score;
- non-claims preservation score;
- git/evidence completeness score;
- repairability score;
- blocked-repair correctness score;
- regression history.

Any critical red field should block repair.

## Staged implementation path

1. Docs/spec contract.
2. Executable repair fixture harness.
3. Repair dry-run prototype.
4. Strict blocked-repair behavior.
5. Only later optional hook / CI / Codex integration after separate readiness and acceptance.

## Current non-claims

- No `--repair` implementation exists yet.
- No helper behavior was changed by this contract.
- No hook, CI, automation, or runtime integration exists yet.
- No deterministic enforcement exists yet.
- Repair-specific executable fixtures/evals are local/manual only.
- No browser, DB/Auth/Supabase, product/runtime, production, payment, GPS, notification, real rider, deploy, or compliance proof is created by this lane.
- The helper remains local/manual and heuristic.
