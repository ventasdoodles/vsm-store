---
name: vsm-acceptance-audit
description: Use for VSM Store acceptance audits of commits, diffs, patches, validation claims, scope checks, accepted and non-accepted claims, residual risks, and exact canon prompt generation. This skill is procedural only and must not be used for implementation, silent fixes, canon edits, source/runtime/test edits, deploy, DB/Supabase, providers, browser QA, live smoke, secrets, staging, commits, pushes, or self-acceptance.
---

# vsm-acceptance-audit

Use this skill for independent VSM Store acceptance audits after an implementation, patch, commit, diff, or reported validation needs an `ACCEPT`, `REJECT`, or `ACCEPT WITH RESIDUAL RISK` verdict.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, or independent acceptance. It may narrow audit scope for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- audit a commit, diff, patch, artifact, or implementation report;
- verify exact changed-file scope;
- check validation claims;
- separate accepted claims from non-claims;
- preserve residual risks;
- decide `ACCEPT`, `REJECT`, or `ACCEPT WITH RESIDUAL RISK`;
- produce an exact canon prompt after acceptance.

Do not use this Skill to implement fixes, canonize, deploy, run live systems, or accept work done by the same actor when independence is required.

## Operator Output Mode

Default to compact operator output for LOW and MEDIUM risk audits.

- Keep the verdict and evidence tight.
- Avoid long explanations unless the audit is HIGH risk, `REJECT`, or blocked.
- Use no more than 7 compact sections for LOW and MEDIUM risk audits unless the prompt explicitly asks for more.
- Keep acceptance, non-claims, residual risks, and next action visible.
- Use full reporting only when the audited lane is HIGH risk, rejected, or unresolved.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

For commit audits, inspect only the target commit or range needed for the claim:

```powershell
git show --stat --oneline --name-only <commit>
git diff --name-only <commit>^ <commit>
git diff --check <commit>^ <commit>
```

Adjust the commands only when the prompt authorizes a different diff range, uncommitted patch, or validation surface.

## Context Loading

Load only context needed to judge the accepted claims. Prefer these surfaces, as relevant:

- `AGENTS.md`
- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`

Do not load historical audits, supplements, templates, or duplicate canon by default unless they affect scope, evidence, validation, or residual risk.

## Required Behavior

1. Confirm current repo/workspace state when applicable.
2. Inspect commit metadata, changed files, and the targeted diff or patch.
3. Verify that changed files match the authorized scope.
4. Verify validation claims only with authorized checks.
5. Separate evidence-backed claims from non-claims.
6. Preserve residual risks explicitly.
7. Check that high-risk surfaces were not touched unless explicitly authorized.
8. Emit exactly one verdict.
9. If accepted, produce the exact next canon prompt when useful and authorized by the current lane.

## Verdict Rules

Return `ACCEPT` only when scope, evidence, validation, and non-claims are clean enough that no meaningful residual risk remains for the audited lane.

Return `ACCEPT WITH RESIDUAL RISK` when the work is acceptable but evidence is local, bounded, guidance-only, untracked until a later pass, not production proof, or has explicit residuals that must remain visible.

Return `REJECT` when scope is wrong, validation fails, claims are inflated, forbidden files or surfaces changed, high-risk restrictions were bypassed, or the diff cannot support the reported claim.

Return `NO-GO / NEEDS SCOPING` when scope, files, validation, risk, authorization, or success condition are unclear enough that a verdict would be unsafe.

Return `BLOCKED` when a required artifact, commit, diff, or validation surface is unavailable.

## Forbidden Actions

During acceptance audit, do not:

- edit files;
- implement fixes;
- silently repair problems;
- modify docs/canon/source/tests/runtime;
- stage, commit, push, amend, or force push;
- deploy or run workflows;
- touch DB/Supabase;
- inspect secrets, env values, auth, session, storage, cookies, tokens, or headers;
- run browser QA or live smoke unless explicitly authorized for the audit;
- invoke providers or external APIs unless explicitly authorized;
- reopen Product Search, Cesarin runtime, payment, deploy, DB, auth, or provider lanes by inference;
- canonize; canon reconciliation requires a separate lane after `ACCEPT`, `ACCEPT WITH RESIDUAL RISK`, or owner authorization;
- accept final high-risk work implemented by the same actor.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. VERDICT
2. DIFF SCOPE
3. VALIDATION
4. ACCEPTED CLAIMS
5. NON-CLAIMS
6. RESIDUAL RISKS
7. NEXT ACTION

Keep the audit bounded to the claim under review. Do not implement while auditing. Do not inflate claims beyond the evidence inspected in the current lane.

If the current prompt explicitly requests an exact canon prompt after acceptance, append it only as a short separate trailer after section 7. For HIGH-risk lanes, unresolved blockers, or `REJECT`, expand only as needed to preserve evidence clarity and phase separation.

When a caller already names this repo procedure, the caller should not duplicate this section list by default. A compact `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` instruction is sufficient unless the lane needs custom fields.
