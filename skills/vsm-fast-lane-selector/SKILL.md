---
name: vsm-fast-lane-selector
description: Use for VSM Store accelerated lane selection, fastest-safe workflow decisions, LOW/MEDIUM/HIGH risk classification, compact/standard/full reporting mode selection, phase-combination decisions, actor selection, and exact next-prompt generation. This skill is procedural only and must not be used for implementation, acceptance, canon reconciliation, browser QA, deploy, DB/Supabase, provider calls, live smoke, secrets, source/runtime/test edits, staging, commits, or pushes.
---

# vsm-fast-lane-selector

Use this skill to choose the shortest safe workflow for a VSM Store task without weakening evidence, role separation, non-claims, or residual-risk discipline.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, or independent acceptance. It may narrow a workflow for safety and speed, but it must never expand authorized scope.

This repo procedure lives under `skills/<name>/SKILL.md`; do not assume it is installed as a Codex runtime/global Skill unless the current environment exposes it that way.

## When To Use

Use when the user asks to:

- choose the fastest safe next move;
- select compact, standard, or full workflow/reporting;
- classify LOW, MEDIUM, or HIGH risk;
- decide which phases can be combined;
- pick the next actor and exact prompt;
- reduce micro-steps while preserving acceptance and canon discipline.
- pre-plan a short Execution Block of related LOW/MEDIUM lanes.

Do not use this Skill to implement, validate runtime behavior, run browser QA, audit final acceptance, canonize, deploy, operate live systems, inspect secrets, or touch DB/Supabase.

## Operator Output Mode

Default to operator output for LOW and MEDIUM risk lanes.

- Keep the answer compact and decision-oriented.
- Do not add narrative unless the prompt is blocked, high-risk, or conflicting.
- Prefer at most 7 sections for LOW and MEDIUM lanes.
- Use the exact required format requested by the prompt when one is provided.
- Use FULL only when risk is HIGH, the verdict is `REJECT`, or a blocker remains unresolved.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the repo is dirty, divergent, or the target workspace is unclear, report the exact condition and do not recommend combined execution unless the current prompt explicitly authorizes working from that state.

## Context Loading

Load only context needed to make the workflow decision. Prefer these surfaces:

- `AGENTS.md`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`
- `docs/Reglas para IDE antigravity/VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`
- relevant existing `skills/*/SKILL.md`

Do not load historical audits, supplements, templates, or duplicate canon by default unless they affect risk, scope, phase separation, validation, or non-claims.

## Decision Algorithm

1. Confirm repo/workspace state when applicable.
2. Identify the requested lane: readiness, implementation, validation/browser QA, acceptance audit, canon reconciliation, commit/push, or closeout.
3. Confirm the authorized actor: Codex, Antigravity, ChatGPT, or user.
4. Identify target files, surfaces, validation, commit/push authorization, and forbidden actions.
5. Classify risk before recommending any phase combination.
6. Choose the workflow mode: short, medium, or high-risk.
7. Choose the reporting mode: compact, standard, or full.
8. Decide which phases may combine and which must remain separate.
9. Produce exactly one next prompt for the correct actor, or return `NO-GO / NEEDS SCOPING`.
10. For Execution Blocks, keep only one active lane at a time and treat later lanes as conditional, not blind authorization.

## Risk Classification

Use `LOW` only when all are true:

- scope is small, clear, and reversible;
- no high-risk surface is touched;
- validation is local and simple;
- commit/push, if requested, is explicitly authorized;
- independent acceptance can remain separate when needed.

Use `MEDIUM` when the task affects bounded frontend, service, workflow-noncritical logic, UX, browser visual QA, or local validation where implementation and validation may combine but independent acceptance should remain separate.

Use `HIGH` when any of these appear:

- DB/Supabase;
- auth/session/storage/secrets/PII;
- deploy/workflows/Cloudflare;
- checkout/payment/provider/Mercado Pago;
- Product Search/retrieval/embeddings;
- AI/Cesarin runtime;
- production smoke/live smoke;
- provider/Gemini calls.

High-risk work requires explicit authorization and strong phase separation. A Skill never makes high-risk work low-risk.

## Workflow Modes

Use `SHORT` for low-risk tasks where readiness may be implicit and Antigravity may combine implementation, local validation, commit, and push when explicitly authorized.

Use `MEDIUM` for normal bounded frontend/service/workflow/UX work. Codex readiness may produce an exact prompt; Antigravity may combine implementation, local validation, commit, and push; Codex acceptance remains separate; canon remains separate after acceptance.

Execution Blocks are allowed only inside LOW/MEDIUM work and only when later lanes can be invalidated cleanly if acceptance/canon introduces drift.

Use `HIGH-RISK` for sensitive or production-adjacent work. Keep readiness, implementation, validation/smoke, acceptance audit, canon reconciliation, deploy, DB/provider/auth work, and closeout as separate lanes unless the current prompt explicitly authorizes a safe subset.

## Reporting Modes

Use `COMPACT` for low-risk docs/copy/config/CSS micro-lanes. Prefer 5-7 sections and short evidence statements. This is the default operator output mode for LOW risk.

Use `STANDARD` for medium-risk frontend/service/browser/local-validation lanes. Prefer 8-10 sections with claims, non-claims, and residual risks. This is the default operator output mode for MEDIUM risk.

Use `FULL` for high-risk, production, DB/Supabase, auth/secrets, provider, payment, Product Search, Cesarin, deploy, or live-smoke work. Include explicit evidence, blockers, non-claims, residual risks, and phase gates.

## Phase Combination Rules

May combine:

- readiness + exact next prompt;
- implementation + local validation + commit/push when explicitly authorized;
- acceptance audit + exact canon prompt;
- canon reconciliation + validation + commit/push after acceptance when explicitly authorized.

May pre-plan:

- a 3-4 lane Execution Block for related LOW/MEDIUM work, with Lane 1 executable now, Lanes 2 and 3 conditional, and Lane 4 reserve or stop-refresh.

Must keep separate:

- implementation and independent final acceptance;
- implementation and canon reconciliation without acceptance;
- high-risk implementation and live smoke;
- deploy/live smoke and canonization;
- DB/Supabase, provider, auth/secrets, checkout/payment, Product Search, or Cesarin runtime work unless explicitly authorized.
- multiple active implementation lanes inside one block.

## Exact Prompt Requirements

When producing a next prompt, include:

- `STRICT MODE`;
- `USE REPO PROCEDURE: skills/<name>/SKILL.md` when relevant;
- current authoritative state;
- one mission objective;
- authorized files/surfaces;
- forbidden actions;
- validation expectations;
- commit/push authorization or prohibition;
- `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` unless a custom format is truly needed;
- success condition;
- explicit independent acceptance or canon follow-up when needed.

## GO / NO-GO Rules

Return `GO` only when:

- scope and actor are clear;
- risk and reporting mode are classified;
- phase combination is safe;
- forbidden actions are explicit;
- the exact next prompt does not expand scope.

For Execution Blocks, require explicit stop conditions and a rule for when fresh readiness becomes mandatory.

Return `NO-GO / NEEDS SCOPING` when scope, files, actor, validation, risk, environment, or authorization is unclear.

Return `NO-GO` when the requested shortcut would violate canon, owner constraints, independent acceptance, or high-risk restrictions.

Return `BLOCKED` when an external precondition prevents a safe next prompt.

## Forbidden Actions

During fast-lane selection, do not:

- edit files;
- implement changes;
- modify docs/canon/source/tests/runtime;
- stage, commit, push, amend, or force push;
- run browser QA or live smoke;
- deploy or run workflows;
- touch DB/Supabase;
- inspect secrets, env values, auth, session, storage, cookies, tokens, headers, or passwords;
- invoke providers or external APIs;
- reopen Product Search, Cesarin runtime, payment, deploy, DB, auth, provider, or closed lanes by inference;
- perform acceptance audit;
- canonize.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE
2. FILES READ
3. TASK / LANE
4. RISK CLASSIFICATION
5. WORKFLOW MODE
6. REPORTING MODE
7. PHASES THAT CAN BE COMBINED
8. PHASES THAT MUST REMAIN SEPARATE
9. EXACT NEXT PROMPT
10. GO / NO-GO

Keep the output focused. Choose exactly one next move when prioritization is requested.

When a caller already names this repo procedure, the caller should not duplicate this section list by default. A compact `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` instruction is sufficient unless the lane needs custom fields.
