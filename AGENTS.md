# VSM Store Codex Workflow Profile

This file gives Codex a compact repo-level operating profile for VSM Store. It points to the canonical work-kit instead of duplicating it.

## Baseline Checks

At the start of audit, readiness, canon, or push-related lanes, confirm:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

Treat `C:\dev\vsm-store-fresh` as the authoritative workspace when the prompt names it. If the prompt names another workspace, obey the prompt and do not cross checkout boundaries.

## Canon And Work-Kit Pointers

Use these as the primary local references, loading only the parts needed for the current lane:

- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `docs/Reglas para IDE antigravity/README_WORKKIT.md`
- `docs/Reglas para IDE antigravity/VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`

Current user instructions override stale local context. Do not use temporal context to reopen closed lanes.

## Role Separation

- ChatGPT orchestrates, chooses sequence, and produces prompts.
- Codex audits, performs readiness, classifies risk, accepts or rejects, and may produce exact next prompts.
- Antigravity implements, validates, commits, pushes, and canonizes when authorized.
- The user is product owner and final judge.

Never remove the independent acceptance audit. Never let the same actor both implement a change and perform the final acceptance audit for that change.

## Lane Discipline

Respect the lane wording exactly:

- Readiness or roadmap: inspect and plan only. No edits.
- Audit or acceptance: inspect, validate, accept/reject, and preserve non-claims. No edits unless explicitly authorized.
- Implementation: edit only the authorized scope. Do not redesign from zero or open new fronts.
- Canon reconciliation: docs/canon only, and only after an explicit `ACCEPT` or `ACCEPT WITH RESIDUAL RISK`.
- Validation or smoke: perform only the authorized checks. Do not repair while validating.

Keep implementation, acceptance, canon, deploy, DB/Supabase, provider, auth, and live-smoke work in separate lanes unless the prompt explicitly authorizes a safe combination.

## VSM Readiness Lane

Use for `READINESS`, `ROADMAP`, or `CONFIG PLANNING` prompts.

Required behavior:

- Confirm repo state.
- Read only the relevant canon/work-kit surfaces.
- Identify closed lanes and non-claims.
- Classify risk.
- Decide `GO` or `NO-GO`.
- Produce the exact next prompt for the right actor when useful.

Do not implement, commit, push, deploy, run live smoke, inspect secrets, or touch DB/Supabase.

## VSM Acceptance Audit Lane

Use for pushed commits, local patches, or reported validation that need acceptance.

Required behavior:

- Confirm repo state and alignment.
- Inspect commit metadata, changed files, and targeted diff.
- Verify exact scope and no unrelated surfaces changed.
- Re-run only authorized local validation.
- Separate accepted claims from non-claims.
- End with `ACCEPT`, `REJECT`, or `ACCEPT WITH RESIDUAL RISK`.
- If accepted, produce the exact canon prompt.

Do not make implementation, test, or canon changes during acceptance audit.

## VSM Canon Reconciliation Lane

Use only after a prior explicit acceptance verdict.

Required behavior:

- Edit only the minimal canon/doc files needed.
- Preserve residual risks and non-claims exactly.
- Validate docs-only scope with:

```powershell
git diff --name-only
git diff --check
git diff
```

Before committing or pushing, also check:

```powershell
git diff --cached --name-only
git diff --name-only origin/main..HEAD
```

Do not modify source, tests, runtime, DB/Supabase, provider config, deploy workflows, auth, session, storage, or secrets unless the prompt explicitly names that scope.

## VSM Implementation Prompt Generator

When Codex is asked to produce an Antigravity prompt, include:

- strict mode
- authorized task type
- authoritative current state
- exact mission objective
- required file/surface scope
- explicit constraints
- validation commands
- required output format
- success condition

Keep prompts small. Include only context that changes the implementation decision. Preserve role separation and require independent acceptance afterward.

## VSM Browser / Visual QA Gate

Use browser or app context only when authorized and relevant.

- Use local browser QA for local frontend visual/runtime checks after frontend changes when the target is known.
- Use Chrome/authenticated browser only when the prompt explicitly authorizes an existing authenticated session.
- Stop on login, MFA, missing authorization, or native-host/plugin blockers.
- Do not inspect cookies, localStorage, session storage, auth headers, passwords, tokens, env values, or secrets unless explicitly authorized.
- Browser evidence proves only the observed UI/runtime behavior. It does not prove DB/Supabase, provider, payment, deploy, auth, or production correctness unless those were separately and explicitly validated.

## Web Search Policy

Default to local repo and canon for repo facts.

Use web search only for:

- current external documentation
- provider/API behavior
- legal/compliance or time-sensitive public facts
- user-explicit requests to browse

Prefer official primary sources for technical docs. Cite sources. Never treat web search as proof of VSM deployed/runtime behavior.

## Goal Mode Policy

Goal mode is allowed only for bounded lanes with:

- explicit lane type
- authorized scope
- forbidden actions
- validation gates
- stop condition

Goal mode must not merge implementation with independent acceptance. For high-risk lanes, keep phases separated even when Goal mode is active.

## High-Risk Surfaces

Require explicit authorization and strong phase separation for:

- checkout/payment/provider behavior
- Mercado Pago webhooks
- DB/Supabase
- auth/session/storage/secrets
- deploy/Cloudflare/workflows
- AI/Cesarin runtime
- Product Search/retrieval/embeddings
- live smoke

For these surfaces, do not infer production proof from local source/test evidence.

## Validation And Commit Gates

For instruction-only changes, do not run tests unless requested. Use:

```powershell
git diff --name-only
git diff --check
git diff
```

For code/test changes, choose targeted tests based on the touched surface and run `npm run typecheck` when scope or risk warrants it.

Before commit/push lanes, verify staged and outgoing scope. Do not stage unrelated dirty files.
