# VSM Store - README Work-kit

## Purpose

Entry point for the work-kit operating docs.

## Read order

1. `PROMPT_SYSTEM_RULES_IMMUTABLE.md`
2. `CONTEXTO_MAESTRO_HANDOFF.md`
3. `PROMPT_SIZING_POLICY_VSM_REPARTO.md`
4. `CONTEXTO_TEMPORAL_ACTUAL.md`
5. `VSM_SKILL_USAGE_POLICY.md`
6. `PROMPT_OUTPUT_QUALITY_GATE.md`
7. `CODEX_PROMPT_RELIABILITY_PROTOCOL.md`
8. `PROMPT_LIBRARY_TEMPLATES.md`
9. `VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`
10. `VSM_PHASE_COMBINATION_RISK_MATRIX.md`

## Workflow automation

- `docs\workkit\WORKSPACE_SYNC_POLICY.md` states the current truth for clean versus dirty checkouts and what is authoritative for canon work.
- `docs\workkit\WORKSPACE_INVENTORY.md` lists the current baseline, protected WIP, active branch worktrees, and removed obsolete scratch worktrees.
- `WORLD_CLASS_FLOW_AUTOMATION.md` describes the current local/manual workflow automation layer.
- `tools/workflow/vsm-gate.mjs` runs lane-specific local/manual gates for repo baseline, prompt reliability, QA preflight, and canon checks.
- `tools/workflow/evidence-ledger.mjs` creates canon-ready exact-order evidence drafts without touching DB.
- `tools/workflow/vsm-qa-rehearsal.mjs` runs the local/manual QA rehearsal shell. Default, `--dry-run`, and `--preflight-only` modes do not run mutating harnesses; `--run-harness` is required for controlled rehearsal execution.
- These helpers are local/manual only. They do not create hooks, CI, runtime enforcement, product/runtime behavior, DB/Auth/Supabase/browser/provider proof, or production readiness.
- `repo-baseline` is a prerequisite before readiness, canon, or implementation claims in `F:\ivoy`.
- When product repos are dirty, do not claim baseline truth until they are reconciled to `origin/main` or a fresh explicitly authorized worktree is created and verified.
- `workspace-sync` is the authoritative lane for current sync claims because it checks the current clean product baselines and canon checkout.

## Prompt lint

- `PROMPT_LINT_SPEC.md` describes the deterministic checks now used by Prompt Lint Helper v1.
- `PROMPT_LINT_EXAMPLES.md` is a docs-only fixture pack for human review and future lint design.
- `PROMPT_REPAIR_CONTRACT.md` is the docs-only readiness contract for future auto-repair boundaries and fail-code mapping.
- `tools/prompt-lint/prompt-lint.mjs` is the local/manual helper v1.
- `tools/prompt-lint/repair-evals.mjs` is the local/manual executable repair fixture/eval harness v0.
- `tools/prompt-lint/scorecard.mjs` is the local/manual prompt scorecard reporter v0.
- `tools/prompt-lint/scorecard-evals.mjs` is the local/manual scorecard fixture runner v0.
- Scorecard acceptance-report checks include embedded exact canon prompt
  structure only when such a prompt is present.
- `EVAL_COVERAGE_REGISTRY.md` explains Eval Coverage Registry v0.
- `tools/prompt-lint/eval-coverage.mjs` is the local/manual eval coverage registry validator/reporter v0.
- `tools/prompt-lint/reliability-smoke.mjs` is the local/manual Prompt
  Reliability Smoke Pack v0 runner for bounded stack health checks.
- v1 is heuristic and prompt-text-only.
- v1 treats acceptance audit reports as reports, not executable prompts, and directly checks incomplete embedded exact canon prompts when present.
- v0.1 is repair-ready in structure, but it does not implement `--repair`.
- Eval coverage is visibility tooling only and does not imply complete automation or semantic correctness.
- Reliability smoke is visibility tooling only and does not imply hooks, CI,
  automation, runtime integration, semantic AI judging, product/runtime proof,
  DB/Auth/Supabase/browser/provider proof, or production readiness.
- Missing authoritative context must block future repair instead of being invented.

## Non-claims

- No hook exists yet.
- No hook/CI/runtime enforcement automation exists yet.
- No CI integration exists yet.
- No runtime integration exists yet.
- No mechanical enforcement claim is made.
- No active skill behavior changed in this lane.
- No product/runtime/source/test behavior changed in this lane.
- No `--repair` behavior is implemented by the repair eval harness.
- No semantic AI judging or acceptance automation is implemented by Eval Coverage Registry v0.

## Domain docs

- `docs/product/VSM_STORE_DOMAIN_MODEL.md`
- `docs/product/VSM_STORE_MODULE_MAP.md`
- `docs/operations/VSM_REAL_SYSTEM_QA_RUNBOOK.md`
- `docs/operations/VSM_IDENTITY_DELIVERY_OBSERVABILITY_CHECKLIST.md`
