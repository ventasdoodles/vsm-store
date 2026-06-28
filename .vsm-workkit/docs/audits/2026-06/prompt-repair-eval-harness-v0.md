# Skill System v2 Prompt Repair Fixture/Eval Harness v0

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commit `8c3c1a9 test: add prompt repair eval harness v0`.

## Scope

Accepted prompt reliability/work-kit surfaces:

- `tools/prompt-lint/repair-evals.mjs`
- `tools/prompt-lint/fixtures/repair/**`
- `tools/prompt-lint/README.md`
- `docs/workkit/README_WORKKIT.md`
- `docs/workkit/PROMPT_REPAIR_CONTRACT.md`

This note records the accepted local/manual repair fixture/eval harness v0 only. It does not canonize repair behavior, enforcement, hooks, CI, automation, or runtime integration.

## Evidence

- Commit `8c3c1a9` is reachable from `main` and was pushed to `origin/main`.
- Independent acceptance audit returned `ACCEPT WITH RESIDUAL RISK`.
- `node tools\prompt-lint\repair-evals.mjs` passed with 11/11 fixtures.
- `node tools\prompt-lint\repair-evals.mjs --strict` passed with 11/11 fixtures.
- `node tools\prompt-lint\prompt-lint.mjs tools\prompt-lint\fixtures\pass\implementation-safe.txt --strict` returned 0 findings.
- `node tools\prompt-lint\prompt-lint.mjs tools\prompt-lint\fixtures\fail\secret-session-storage-inspection.txt` produced expected default-mode errors, including `FAIL_SECRET_INSPECTION_RISK`.
- `git diff --check` returned exit 0; CRLF normalization warnings only were reported during the implementation lane.

## Accepted Facts

- `tools/prompt-lint/repair-evals.mjs` exists as a local/manual executable repair fixture/eval harness v0.
- The harness reads `tools/prompt-lint/fixtures/repair/manifest.json`.
- The harness reads repair fixture prompt text.
- The harness invokes existing `tools/prompt-lint/prompt-lint.mjs` without modifying helper behavior.
- The harness maps prompt-lint findings to `no-op`, `template-repairable`, `context-required`, and `unsafe-blocked`.
- The harness checks expected findings, expected classifications, expected blocked codes, no-invention assertions, non-claim text, and default/strict exit expectations.
- Default mode prints deterministic fixture results and exits `0`.
- `--strict` exits nonzero when fixture expectations fail.
- Fixture coverage includes pass/no-op, template-repairable, context-required blocked, unsafe-blocked, no-invention, lane-mixing blocked, credential/browser-state blocked, implementation git-completeness, canon git-completeness, stale external target, and missing-authoritative-context categories.
- Missing-context fixtures expect `REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT`.

## Preserved Non-Claims

- No `--repair` exists.
- No generated repaired prompt exists.
- No helper behavior changed.
- No hook exists.
- No CI integration exists.
- No automation exists.
- No runtime integration exists.
- No deterministic enforcement exists.
- No product/runtime/source behavior proof outside the work-kit is claimed.
- No DB/Auth/Supabase/browser/provider proof is claimed.
- No production readiness is claimed.
- No payment, GPS, or notification proof is claimed.
- No real rider/courier proof is claimed.
- No deploy readiness is claimed.
- No compliance proof is claimed.

## Residual Risks

- The harness is local/manual.
- The harness remains heuristic because it depends on prompt-lint findings and fixture expectations.
- The harness proves classification/eval coverage only; it does not prove future repair behavior.
- Fixture expectations currently allow contains-expected-codes checks; exact-only finding set checks remain future hardening.
- A separate accepted implementation lane is required before any repair behavior exists.

## Exact Next Recommended Lane

Prompt Scorecard v0 Readiness + Repair Dry-Run Roadmap.

Do not proceed directly to `--repair` implementation yet.
