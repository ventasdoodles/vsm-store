# Ya VOY World-Class Flow Automation

## Purpose

This document defines the current local/manual automation layer for keeping Ya VOY work fast, repeatable, and hard to overclaim.

It does not introduce hooks, CI, runtime enforcement, product behavior, DB mutation, Auth mutation, browser automation, provider calls, or production proof.

## Current Components

| Component | Path | Purpose |
|---|---|---|
| Workspace sync policy | `docs\workkit\WORKSPACE_SYNC_POLICY.md` | States what is authoritative when local product repos drift from remote or from canon. |
| Workflow gate | `tools\workflow\vsm-gate.mjs` | Runs lane-specific local/manual checks and returns human or JSON output. |
| Evidence ledger | `tools\workflow\evidence-ledger.mjs` | Converts exact order evidence into canon-ready Markdown/JSON without touching DB. |
| QA rehearsal runner | `tools\workflow\vsm-qa-rehearsal.mjs` | Orchestrates the safe local/manual shell around repo baseline, QA preflight, optional explicit harness execution, scratch evidence discovery, and hygiene reporting. |
| QA runtime operator procedure | `skills\vsm-qa-runtime-operator\SKILL.md` | Guides authorized QA runtime lanes with preflight, order_id proof, cleanup, and non-claims. |
| Evidence ledger procedure | `skills\vsm-evidence-ledger\SKILL.md` | Preserves exact IDs, counts, cleanup facts, residual risks, and non-claims. |
| Prompt reliability operator procedure | `skills\vsm-prompt-reliability-operator\SKILL.md` | Runs and interprets prompt-lint, scorecard, repair evals, and reliability smoke. |

## Gate Commands

```powershell
node tools\workflow\vsm-gate.mjs --lane repo-baseline --json
node tools\workflow\vsm-gate.mjs --lane repo-baseline
node tools\workflow\vsm-gate.mjs --lane workspace-sync --json
node tools\workflow\vsm-gate.mjs --lane prompt --json
node tools\workflow\vsm-gate.mjs --lane qa-preflight --json
node tools\workflow\vsm-gate.mjs --lane canon --json
```

## QA Rehearsal Runner Commands

```powershell
node tools\workflow\vsm-qa-rehearsal.mjs --help
node tools\workflow\vsm-qa-rehearsal.mjs --preflight-only --json
node tools\workflow\vsm-qa-rehearsal.mjs --dry-run --json
node tools\workflow\vsm-qa-rehearsal.mjs --start-dev-servers-only --json
node tools\workflow\vsm-qa-rehearsal.mjs --self-test-run-label-contract --json
node tools\workflow\vsm-qa-rehearsal.mjs --run-harness --start-dev-servers --json
```

The default, `--dry-run`, `--preflight-only`, `--self-test-run-label-contract`, and `--start-dev-servers-only` modes do not run mutating QA harnesses. Harness execution requires `--run-harness` or `--run`. When `--run-label <label>` is supplied with `--require-evidence`, evidence must match that exact label; stale latest-temp evidence with another label is blocked. Run labels are limited to letters, numbers, dot, underscore, and hyphen. During mutating runs, the runner passes the requested label to the harness evidence layer through a label-specific `QA_SCREENSHOT_DIR` and normalizes current-run local scratch artifacts, including `visual-targets.json` and matching current-run `visual-targets.ready.json`, to the requested label while preserving the harness-generated label as metadata, so local temp evidence can be correlated without reading secrets and without reviving stale ready artifacts. When exact temp evidence and visual-target metadata share a label, temp evidence is preferred because it can contain DB readback files for ledger derivation. `--require-evidence` also requires ledger-complete order evidence: an `order_id` alone from visual metadata is insufficient unless status, event/offer/wallet counts, cleanup facts, and the evidence-ledger derivation are present and valid. For mutating runs, customer visual proof must survive cleanup either through an explicit handoff or current-run screenshot artifacts, and post-cleanup proof must explicitly verify protected retained evidence plus final driver baseline through the non-secret QA runtime contract path. Evidence extraction reads local scratch/output evidence only and formats it through the evidence ledger; it is not DB truth.

## Evidence Ledger Command

```powershell
node tools\workflow\evidence-ledger.mjs --order-id 00000000-0000-0000-0000-000000000000 --status delivered --order-events 5 --order-offers 0 --wallet-transactions 1 --cleanup pass --driver-baseline "500.00 / 0.00 / libre" --retained-evidence untouched
```

## Operating Rules

- Treat `repo-baseline` as the first check when client or admin truth is in question.
- When product checkouts drift, reconcile them to `origin/main` or create an explicitly authorized fresh worktree before claiming baseline truth.
- Use `workspace-sync` when the question is current authoritative sync for the clean product baselines and canon checkout.
- Use `orders.id` / `order_id` as the primary proof key for order work.
- Treat `order_number` as a label only.
- Use `qa-temp` only as local scratch; never commit it.
- Keep prompt reliability local/manual until a separate accepted lane authorizes hooks or CI.
- Keep evidence generation separate from canon mutation. The ledger drafts canon-ready text; it does not edit canon.
- Keep QA rehearsal runner evidence separate from DB truth; it only reports already collected local scratch/output evidence unless an explicitly authorized lane runs the underlying harness/checks.
- Keep source/test, browser, DB, provider, local/pre-prod, and production proof separate.

## Recommended Lane Flow

1. `repo-baseline`: confirm product checkout and canon baseline state.
2. `workspace-sync`: confirm current authoritative sync for client, admin, and canon.
3. `prompt`: check exact prompts before execution when prompt quality is in scope.
4. `qa-preflight`: check non-secret local runtime contract before any QA harness.
5. Implementation or QA work: only inside the authorized lane.
6. `evidence-ledger`: produce an evidence draft for exact order QA.
7. Acceptance audit: independent read-only verdict.
8. Canon reconciliation: docs-only update after acceptance.
9. `canon`: final local/manual gate before commit/push.

## Non-Claims

- No automatic enforcement exists.
- No hook or CI integration exists.
- No product/runtime behavior changed by this automation layer.
- No DB/Auth/Supabase/browser/provider proof is created unless an explicitly authorized lane runs those checks.
- No production, payment, GPS/tracking, notification, real courier, deploy, or full security/compliance proof is implied.
