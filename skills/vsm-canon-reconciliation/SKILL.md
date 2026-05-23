---
name: vsm-canon-reconciliation
description: Use for VSM Store docs/canon reconciliation after ACCEPT, ACCEPT WITH RESIDUAL RISK, or explicit owner authorization. This skill is procedural only and must not be used for implementation, source/runtime/test edits, deploy, DB/Supabase, providers, browser QA, live smoke, secrets, staging, commits, pushes, or self-acceptance unless the current prompt explicitly authorizes the relevant action.
---

# vsm-canon-reconciliation

Use this skill for VSM Store canon reconciliation after an implementation, audit, validation, or owner decision has already produced accepted facts that need to be recorded in authorized docs/canon files.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, or independent acceptance. It may narrow canon scope for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- reconcile accepted facts into canon;
- update authorized docs/canon files after `ACCEPT`;
- update authorized docs/canon files after `ACCEPT WITH RESIDUAL RISK`;
- preserve non-claims and residual risks from an accepted audit;
- keep `AI_CONTEXT.md`, `AUDIT_LOG.md`, or audit detail files aligned with accepted evidence;
- produce a compact canon entry without reopening implementation or validation lanes.

Do not use this Skill to implement fixes, audit final acceptance, deploy, run live systems, validate runtime behavior, or canonize work without prior acceptance or explicit owner authorization.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the repo is dirty, divergent, or the authorized docs/canon targets are unclear, report the exact condition and return `NO-GO / NEEDS SCOPING` unless the prompt explicitly authorizes working from that state.

## Context Loading

Load only context needed to reconcile the accepted facts. Prefer these surfaces, as relevant:

- `AGENTS.md`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `docs/audits/YYYY-MM/<lane>.md`
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`

Do not load historical audits, supplements, templates, or duplicate canon by default unless they affect accepted facts, non-claims, residual risks, allowed files, or validation.

## Required Behavior

1. Confirm current repo/workspace state when applicable.
2. Confirm the acceptance source: `ACCEPT`, `ACCEPT WITH RESIDUAL RISK`, or explicit owner authorization.
3. Confirm authorized docs/canon files before editing.
4. Reconcile only accepted facts into authorized docs/canon files.
5. Preserve accepted claims, non-claims, residual risks, validation limits, and evidence boundaries.
6. Distinguish local validation, browser QA, production smoke, acceptance, and canonization.
7. Keep current-state canon compact and place detailed evidence only where authorized.
8. Verify the changed-file set before staging or committing when the current prompt authorizes those actions.
9. Return `NO-GO / NEEDS SCOPING` when accepted state, allowed files, canon target, validation, risk, authority, or success condition are unclear.

## Canon Rules

Canon reconciliation must:

- record only accepted facts;
- preserve non-claims;
- preserve residual risks;
- preserve validation limits;
- keep local validation separate from production proof;
- keep browser QA separate from live smoke;
- keep acceptance separate from canonization;
- keep implementation separate from canonization unless the current prompt explicitly combines a low-risk docs-only lane;
- use compact current truth in `AI_CONTEXT.md`;
- use chronological index entries in `AUDIT_LOG.md`;
- use detailed audit files only when authorized and necessary.

Canon reconciliation must not:

- convert local validation into production proof;
- invent deploy, DB/Supabase, provider, auth/session/storage/secret, browser QA, live-smoke, Product Search, or Cesarin runtime evidence;
- reopen closed lanes by inference;
- edit source/runtime/tests/packages/workflows;
- implement fixes or silently repair audited work;
- expand the allowed file set;
- stage, commit, push, amend, or force push unless the current prompt explicitly authorizes the relevant action.

## Forbidden Actions

During canon reconciliation, do not:

- edit source, runtime, tests, packages, or workflows;
- implement fixes;
- silently repair accepted work;
- deploy or run workflows;
- touch DB/Supabase;
- inspect secrets, env values, auth, session, storage, cookies, tokens, or headers;
- run browser QA or live smoke;
- invoke providers or external APIs;
- reopen Product Search, Cesarin runtime, payment, deploy, DB, auth, or provider lanes by inference;
- perform independent final acceptance of implemented work;
- self-accept high-risk work;
- canonize without prior `ACCEPT`, `ACCEPT WITH RESIDUAL RISK`, or explicit owner authorization.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE
2. FILES READ
3. FILES MODIFIED
4. ACCEPTED FACTS CANONIZED
5. NON-CLAIMS PRESERVED
6. RESIDUAL RISKS PRESERVED
7. VALIDATION PERFORMED
8. COMMIT STATUS
9. GO / NO-GO

Keep the reconciliation bounded to the accepted facts and authorized files. Do not inflate claims beyond the evidence accepted in the current lane.
