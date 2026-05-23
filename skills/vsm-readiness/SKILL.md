---
name: vsm-readiness
description: Use for VSM Store roadmap/readiness lanes, GO/NO-GO decisions, scope and risk classification, closed-lane/non-claim checks, and exact next-prompt generation. This skill is procedural only and must not be used for implementation, acceptance, canon reconciliation, deploy, DB/Supabase, provider, browser QA, live smoke, secrets, source/runtime/test edits, staging, commits, or pushes.
---

# vsm-readiness

Use this skill for VSM Store readiness, roadmap, config-planning, next-hito selection, and exact next prompt generation.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, or independent acceptance. It may narrow execution for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- decide GO / NO-GO before work starts;
- pick the best next hito or lane;
- classify risk and phase separation;
- identify closed lanes and non-claims;
- produce an exact prompt for the next actor.

Do not use this Skill to implement, validate runtime behavior, audit final acceptance, canonize, deploy, or operate live systems.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the prompt names a workspace, stay inside that workspace. If the repo is dirty, divergent, or the workspace is unclear, report the exact condition and do not proceed past readiness unless the prompt explicitly authorizes working from that state.

## Context Loading

Load only context needed for the active readiness decision. Prefer these surfaces, as relevant:

- `AGENTS.md`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`
- `docs/Reglas para IDE antigravity/PROMPT_SIZING_POLICY_VSM_STORE.md`
- `docs/Reglas para IDE antigravity/VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`
- `docs/Reglas para IDE antigravity/CONTEXTO_TEMPORAL_ACTUAL.md`

Do not load historical audits, templates, supplements, or duplicate canon by default unless they affect the decision, scope, evidence, or validation.

## Required Behavior

1. Confirm the current repo/workspace state when applicable.
2. Summarize only the baseline needed for this decision.
3. Identify closed lanes, active freezes, non-claims, and residual risks that constrain the next move.
4. Classify risk before recommending any phase combination.
5. Choose exactly one best next move when prioritization is requested.
6. Produce an exact next prompt only when the scope is safe and clear.
7. Preserve implementation, acceptance, canon, deploy, DB/Supabase, provider, browser QA, and live-smoke lanes as separate phases unless the current prompt explicitly authorizes a safe combination.

## Risk Classification

Use `LOW` only for narrow docs/copy/config planning where no high-risk surface is touched and local validation, if any, is simple.

Use `MEDIUM` for bounded frontend, service, workflow-noncritical, UX, or local validation work where implementation and local validation may combine but independent acceptance should remain separate when behavior changes.

Use `HIGH` when any of these appear:

- DB/Supabase;
- auth/session/storage/secrets;
- deploy/workflows;
- checkout/payment/provider;
- Mercado Pago;
- Product Search/retrieval/embeddings;
- AI/Cesarin runtime;
- production smoke/live smoke;
- provider/Gemini calls.

High-risk work requires explicit authorization and phase separation. A Skill never makes high-risk work low-risk.

## GO / NO-GO Rules

Return `GO` only when:

- scope is clear;
- authorized files/surfaces are clear;
- risk is classified;
- forbidden actions are explicit;
- the next actor and next lane are clear;
- the exact next prompt can be written without expanding scope.

Return `NO-GO / NEEDS SCOPING` when scope, files, risk, authority, environment, validation, or success condition are unclear.

Return `NO-GO` when the requested next action would violate canon, immutable rules, owner constraints, lane discipline, or high-risk restrictions.

Return `BLOCKED` when an external precondition prevents a safe next prompt.

## Forbidden Actions

During readiness, do not:

- edit files;
- implement changes;
- modify docs/canon/source/tests/runtime;
- stage, commit, push, or amend;
- deploy or run workflows;
- touch DB/Supabase;
- inspect secrets, env values, auth, session, storage, cookies, tokens, or headers;
- run browser QA or live smoke;
- invoke providers or external APIs;
- reopen Product Search, Cesarin runtime, payment, deploy, DB, auth, or provider lanes by inference;
- perform independent final acceptance of implemented work;
- canonize without prior `ACCEPT`, `ACCEPT WITH RESIDUAL RISK`, or owner authorization.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE
2. FILES READ
3. CURRENT BASELINE
4. CLOSED LANES / NON-CLAIMS
5. RISK CLASSIFICATION
6. BEST NEXT MOVE
7. EXACT NEXT PROMPT
8. RESIDUAL RISKS
9. GO / NO-GO

Keep the answer focused. Do not turn readiness into a backlog. Do not inflate claims beyond the evidence read in the current lane.
