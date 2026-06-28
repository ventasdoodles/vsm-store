# Skill System v2 Scorecard Hard-Fail Score Cap

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted commit `e94c9b7 fix: cap scorecard hard-fail scores`.

## Scope

Accepted prompt reliability/work-kit surfaces:

- `tools/prompt-lint/scorecard.mjs`
- `tools/prompt-lint/scorecard-evals.mjs`
- `tools/prompt-lint/fixtures/scorecard/manifest.json`
- `tools/prompt-lint/README.md`
- `docs/workkit/PROMPT_OUTPUT_QUALITY_GATE.md`
- `docs/workkit/CODEX_PROMPT_RELIABILITY_PROTOCOL.md`
- `docs/workkit/PROMPT_LINT_SPEC.md`

This note records accepted scorecard reporting and fixture expectation changes only. It does not canonize product/runtime behavior, repair behavior, hooks, CI, automation, or runtime enforcement.

## Evidence

- Commit `e94c9b7` is reachable from `main` and was pushed to `origin/main`.
- Independent acceptance audit returned `ACCEPT WITH RESIDUAL RISK`.
- A hard-fail canon scorecard fixture reports `overallScore = 49` and `uncappedOverallScore = 92`.
- JSON output preserves `uncappedOverallScore` and `hardFailScoreCap`.
- Human output shows `Hard-fail score cap: 49/100 (uncapped 92/100)`.
- `excellent-prompt` still reports `overallScore = 100`, `uncappedOverallScore = 100`, and `hardFailScoreCap.applied = false`.
- `node tools/prompt-lint/scorecard-evals.mjs` passed with 10/10 fixtures.
- `node tools/prompt-lint/repair-evals.mjs --strict` passed with 11/11 fixtures.
- `node tools/prompt-lint/prompt-lint.mjs tools/prompt-lint/fixtures/pass/canon-safe.txt --strict` returned 0 findings.
- `node tools/prompt-lint/prompt-lint.mjs tools/prompt-lint/fixtures/pass/implementation-safe.txt --strict` returned 0 findings.
- `git diff --check` returned exit 0.

## Accepted Facts

- Scorecard reports with any `ERROR` hard-fail finding now cap `overallScore` at maximum `49/100`.
- `uncappedOverallScore` remains visible in JSON output.
- `hardFailScoreCap` remains visible in JSON output.
- Human output clearly shows capped versus uncapped score.
- Hard-fail codes and repairability classification remain visible.
- Excellent/safe fixtures still score normally.
- Scorecard evals now expect capped scores for hard-fail fixtures.

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

- Scorecard remains local/manual and heuristic.
- Category scores can still be high internally.
- No automated enforcement layer exists.
