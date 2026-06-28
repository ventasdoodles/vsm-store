# Skill System v2 Prompt Auto-Repair Contract

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted docs-only commit `d15ec3e docs: add prompt repair contract`.

## Scope

Accepted docs-only repair-contract lane:

- `docs/workkit/PROMPT_REPAIR_CONTRACT.md`
- `docs/workkit/PROMPT_LINT_SPEC.md`
- `docs/workkit/README_WORKKIT.md`

This note records the accepted Skill System v2 Prompt Auto-Repair Contract lane only. It does not canonize any repair implementation or enforcement layer.

## Evidence

- Commit `d15ec3e` added the repair contract document and README link.
- Acceptance audit verified the repair contract remains docs-only and future-only.
- Acceptance audit verified the repair contract preserves explicit non-claims for helper changes, hooks, CI, automation, runtime integration, deterministic enforcement, and product/runtime behavior.
- Acceptance audit verified the contract defines the blocked-authoritative-context code and the fail-code classification map without inventing active repair behavior.

## Changed Files

- `docs/workkit/PROMPT_REPAIR_CONTRACT.md`
- `docs/workkit/PROMPT_LINT_SPEC.md`
- `docs/workkit/README_WORKKIT.md`

## Accepted Facts

- `PROMPT_REPAIR_CONTRACT.md` exists as a docs-only Prompt Auto-Repair Contract & Fail-Code Map.
- `README_WORKKIT.md` links the repair contract.
- `PROMPT_LINT_SPEC.md` references the repair contract as future-readiness documentation only.
- The contract defines purpose, current status, non-goals, repair-allowed cases, repair-blocked cases, required blocked code `REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT`, no-invention rules, fail-code repair classification, future repair output contract, required future fixtures/evals, future scorecard model, staged implementation path, and current non-claims.
- All current prompt-lint fail codes are classified into `template-repairable`, `context-required`, `unsafe-blocked`, or `no-op / informational`.
- The contract explicitly forbids repair from inventing scope, validation commands, commit hashes, acceptance status, canon facts, file paths, runtime/product/browser/DB/Auth/Supabase proof, or wider lane risk.
- No `--repair` implementation was added.
- No helper behavior changed.
- No executable repair harness was created.
- No hook, CI, automation, Codex runtime integration, deterministic repo-wide enforcement, product/runtime/source/test behavior, DB/Auth/Supabase/browser/provider proof, or production/payment/GPS/notification/real rider/deploy/compliance proof was added or claimed.

## Preserved Non-Claims

- Repair remains future-only.
- The repair contract is documentation/spec only.
- No `--repair` exists yet.
- No executable repair fixtures/evals exist yet.
- No scorecard implementation exists yet.
- No automatic enforcement exists yet.
- No hook exists.
- No CI integration exists.
- No Codex runtime integration exists.
- No deterministic repo-wide enforcement exists.
- Future repair remains unsafe unless missing authoritative context blocks instead of being invented.
- A separate accepted implementation lane is required before any repair behavior exists.

## Residual Risks

- The contract is a bounded future-readiness specification, not an enforcement mechanism.
- Prompt quality still depends on ChatGPT/User review until a separate implementation lane is accepted.
- Repair behavior remains unimplemented and unsupported.
