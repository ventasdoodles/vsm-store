---
name: vsm-implementation
description: Use for VSM Store explicitly authorized and bounded implementation lanes, including docs-only, local source/test, and micro-pass changes with authorized validation. This skill is procedural only and must not be used to self-accept final work, canonize without acceptance or owner authorization, touch high-risk surfaces without explicit prompt authorization, or expand scope by inference.
---

# vsm-implementation

Use this skill for VSM Store implementation lanes where the current prompt explicitly authorizes the files, surfaces, validation, and success condition.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, independent acceptance, or explicit forbidden actions. It may narrow implementation scope for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- implement an explicitly authorized and bounded change;
- make docs-only, source/test-local, or micro-pass edits;
- run authorized local validation;
- report changed files, validation evidence, claims, non-claims, and residual risks;
- stage, commit, or push only when the current prompt explicitly authorizes those actions.

Do not use this Skill to infer permission for source, runtime, test, package, workflow, DB/Supabase, deploy, provider, browser QA, live smoke, secrets, auth, session, storage, Product Search, Cesarin runtime, payment, or checkout work.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the prompt names a workspace, stay inside that workspace. If the repo is dirty, divergent, or the authorized files/surfaces are unclear, report the exact condition and return `NO-GO / NEEDS SCOPING` unless the prompt explicitly authorizes working from that state.

## Context Loading

Load only context needed to implement the authorized change. Prefer these surfaces, as relevant:

- files named by the prompt;
- directly related local code/tests/docs;
- `AGENTS.md`;
- `AI_CONTEXT.md`;
- `AUDIT_LOG.md`;
- `STORE_FRONT_AI_PILOT_CONTEXT.md`;
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`;
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`;
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`;
- relevant existing tests or fixtures for the authorized surface.

Do not load historical audits, templates, supplements, or duplicate canon by default unless they affect scope, files, validation, or residual risk.

## Required Behavior

1. Confirm current repo/workspace state when applicable.
2. Confirm the current prompt authorizes implementation.
3. Confirm allowed files and surfaces before editing.
4. Classify risk before implementation.
5. Keep edits limited to the authorized files and surfaces.
6. Prefer existing project patterns and narrow reversible changes.
7. Run only authorized validation.
8. Verify changed-file scope before staging or committing when the current prompt authorizes those actions.
9. Report files read, files modified, validations run, claims verified, non-claims, residual risks, and commit status.
10. Return `NO-GO / NEEDS SCOPING` when scope, files, risk, validation, authority, or success condition are unclear.
11. If the lane belongs to a pre-planned Execution Block, execute only the currently active lane and stop if repo state, risk, or scope drifts.

## Risk Classification

Use `LOW` only when:

- the prompt explicitly authorizes the implementation;
- the scope is small and reversible;
- no high-risk surface is touched;
- validation is local and clear;
- acceptance can remain separate when needed.

Use `MEDIUM` when:

- the change affects bounded frontend, service, workflow-noncritical, UX, local validation, or shared behavior;
- implementation and local validation may combine under the current prompt;
- independent acceptance should remain separate when behavior changes.

Use `HIGH` when any of these appear:

- DB/Supabase;
- auth/session/storage/secrets;
- deploy/workflows;
- checkout/payment/provider;
- Mercado Pago;
- Product Search/retrieval/embeddings;
- AI/Cesarin runtime;
- production smoke/live smoke;
- provider/Gemini calls;
- PII/customer data.

High-risk work requires explicit authorization and phase separation. A Skill never makes high-risk work low-risk.

## Phase Rules

Implementation may include local validation only when the prompt authorizes it and the validation stays inside the permitted surface.

Implementation must not:

- perform independent final acceptance;
- self-accept final work;
- canonize without `ACCEPT`, `ACCEPT WITH RESIDUAL RISK`, or explicit owner authorization;
- convert local validation into production proof;
- claim browser QA, production smoke, provider behavior, DB behavior, deploy success, or secret safety unless that evidence was explicitly authorized and actually gathered;
- silently fix issues outside the authorized scope;
- expand the allowed file set by inference.
- auto-execute Lane 2/3/4 of a pre-planned Execution Block without a fresh prompt confirming the lane is still active.

For high-risk work, keep readiness, implementation, validation/smoke, acceptance audit, and canon reconciliation as separate phases unless the current prompt explicitly authorizes a safe subset.

## Forbidden Actions

During implementation, do not:

- edit files outside the authorized scope;
- stage, commit, push, amend, or force push unless explicitly authorized;
- deploy or run workflows unless explicitly authorized;
- touch DB/Supabase unless explicitly authorized;
- inspect secrets, env values, auth, session, storage, cookies, tokens, or headers unless explicitly authorized;
- run browser QA or live smoke unless explicitly authorized;
- invoke providers or external APIs unless explicitly authorized;
- reopen Product Search, Cesarin runtime, payment, checkout, deploy, DB, auth, or provider lanes by inference;
- perform acceptance audit;
- perform canon reconciliation unless explicitly authorized after acceptance or owner authorization.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE
2. FILES READ
3. FILES MODIFIED
4. IMPLEMENTATION SUMMARY
5. VALIDATION PERFORMED
6. CLAIMS VERIFIED
7. NON-CLAIMS
8. RESIDUAL RISKS
9. COMMIT STATUS
10. GO / NO-GO

Keep the implementation bounded to the authorized change. Do not inflate claims beyond the evidence gathered in the current lane.

When a caller already names this repo procedure, the caller should not duplicate this section list by default. A compact `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` instruction is sufficient unless the lane needs custom fields.
