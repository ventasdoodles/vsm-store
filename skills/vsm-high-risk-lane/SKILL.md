---
name: vsm-high-risk-lane
description: Use for VSM Store HIGH-risk lane readiness, scoping, phase-gating, stop conditions, non-claims, residual-risk preservation, and exact prompt generation for sensitive work such as DB/Supabase, deploy/live smoke, providers, auth/secrets, Product Search, Cesarin runtime, and checkout/payment. This skill is procedural only and must not be used to authorize high-risk work by itself, implement changes, inspect secrets, run live systems, deploy, mutate DB, call providers, perform acceptance, canonize, stage, commit, or push.
---

# vsm-high-risk-lane

Use this skill to scope and phase-gate VSM Store HIGH-risk work before any implementation, validation, live operation, or canon update begins.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, independent acceptance, or explicit forbidden actions. It may narrow or stop a high-risk lane for safety, but it must never expand authorization.

This repo procedure lives under `skills/<name>/SKILL.md`; do not assume it is installed as a Codex runtime/global Skill unless the current environment exposes it that way.

## When To Use

Use when the user asks to scope, plan, or prepare work involving any HIGH-risk surface:

- DB/Supabase, migrations, RLS, RPC, Edge Functions, storage, ingestion, observers, or remote reads/writes;
- deploys, workflows, Cloudflare Pages, GitHub Actions, live smoke, production smoke, or runtime freshness checks;
- provider/Gemini calls, model behavior, quotas, embeddings, or live AI diagnostics;
- auth, sessions, storage, secrets, PII, cookies, tokens, headers, or credentials;
- Product Search runtime, retrieval, embeddings, ranking, compatibility, or search-quality behavior;
- Cesarin/customer-intelligence runtime, no-write smoke, RAG, concierge, or live answer quality;
- checkout, payment, provider behavior, Mercado Pago, webhooks, orders, fulfillment, or transaction semantics.

Do not use this Skill to run the high-risk action. Use it to classify, bound, phase, and produce the next exact prompt only when the lane is explicitly authorized and safe to advance.

Local or pre-prod environments do not make these surfaces low-risk. If the prompt involves auth, Supabase, deploy, provider, payment, Product Search, Cesarin runtime, or any live/live-adjacent boundary, keep using this skill even when the target is dummy data or a reversible mutation.

If the prompt is only local/pre-prod browser or admin QA with no high-risk surface, prefer `skills/vsm-real-system-qa/SKILL.md` instead. If the prompt is for controlled live smoke or monitored rollout, prefer `skills/vsm-controlled-rollout/SKILL.md` or this skill depending on the exact boundary.

## Operator Output Mode

Default to full operator output for HIGH-risk lanes.

- Keep the risk boundary explicit.
- Separate readiness, implementation, validation/smoke, acceptance, canon, and closeout.
- Keep evidence, non-claims, residual risks, and stop conditions visible.
- Return `NO-GO / NEEDS SCOPING` when authorization or evidence boundaries are unclear.
- Return `BLOCKED` when an external precondition prevents a safe next prompt.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the lane may touch remote truth, fetch the relevant branch first when authorized by the prompt:

```powershell
git fetch --no-tags origin main
git rev-list --left-right --count origin/main...HEAD
```

If the repo is dirty, divergent, or the target workspace is unclear, report the exact condition and do not recommend implementation, live validation, deploy, DB/provider/auth work, or combined phases unless the current prompt explicitly authorizes working from that state.

## Context Loading

Load only context needed to classify and scope the high-risk lane. Prefer these surfaces, as relevant:

- current user prompt and explicit authoritative state;
- `AGENTS.md`;
- `AI_CONTEXT.md`;
- `AUDIT_LOG.md`;
- `STORE_FRONT_AI_PILOT_CONTEXT.md`;
- `docs/audits/YYYY-MM/<relevant-lane>.md`;
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`;
- `docs/Reglas para IDE antigravity/VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md`;
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`;
- relevant existing `skills/*/SKILL.md`;
- target files named by the prompt.

Do not load secrets, env files, browser storage, cookies, tokens, headers, private customer data, historical supplements, or broad duplicate canon unless the current prompt explicitly authorizes and the lane cannot be scoped without it.

## Required Behavior

1. Confirm repo/workspace state when applicable.
2. Identify the exact high-risk surface(s).
3. Confirm explicit authorization for the current phase only.
4. Identify target files, commands, environments, URLs, credentials policy, validation, and forbidden actions.
5. Classify the lane as HIGH when any high-risk surface is involved.
6. Decide whether the next step is readiness, implementation, local validation, browser QA, live smoke, deploy, DB/provider/auth operation, acceptance audit, canon reconciliation, or closeout.
7. Keep phases separate unless the current prompt explicitly authorizes a safe subset.
8. Preserve non-claims and residual risks from prior canon.
9. Produce exactly one next prompt only when scope and authorization are clear.
10. Stop with `NO-GO / NEEDS SCOPING` or `BLOCKED` when the lane cannot safely advance.

## High-Risk Classification

Classify as `HIGH` if any of these are in scope:

- DB/Supabase, including read-only remote DB checks;
- auth/session/storage/secrets/PII;
- deploy/workflows/Cloudflare/production freshness;
- checkout/payment/provider/Mercado Pago/order transaction semantics;
- Product Search/retrieval/embeddings/ranking/search quality;
- AI/Cesarin/customer-intelligence runtime/RAG/no-write smoke;
- provider/Gemini calls, model diagnostics, quotas, embeddings, or live API behavior;
- production smoke/live smoke;
- browser work against authenticated or production surfaces with private data risk.

Risk is still HIGH when the work is local or pre-prod but the prompt authorizes or requires:

- auth/session handling;
- Supabase reads or writes;
- provider or external API calls;
- live or controlled-live smoke;
- payment or checkout semantics;
- Product Search, Cesarin runtime, or PII-adjacent flows.

Treat local/pre-prod dummy or reversible actions as scoped evidence, not as a downgrade to LOW risk.

Treat controlled live before daily customers as a distinct high-risk phase with explicit monitoring and rollback.

Treat production with daily customers as the highest caution context. Prefer minimal, bounded, rollback-ready changes and avoid exploratory work.

Local source/test changes around these surfaces remain HIGH unless the prompt explicitly narrows them and no live/system interaction occurs. A high-risk lane procedure never makes the work low-risk.

## Phase Gates

Keep these phases separate by default:

- readiness/scoping;
- implementation;
- local validation;
- browser visual QA;
- DB/Supabase, provider, auth, payment, deploy, or live operation;
- production/live smoke;
- independent acceptance audit;
- canon reconciliation;
- closeout/next-lane selection.

Combining phases is allowed only when the current prompt explicitly authorizes the exact subset and no forbidden high-risk action is implied. Independent acceptance and canon reconciliation must remain separate from implementation unless the owner explicitly authorizes a docs-only canon lane after an accepted verdict.

## Secret And Data Policy

Do not inspect, print, copy, infer, or ask the user to paste:

- env values;
- API keys;
- tokens;
- passwords;
- cookies;
- localStorage/sessionStorage values;
- auth headers;
- service role keys;
- private customer data or PII.

Allowed evidence should use metadata-only or presence-only forms such as `PRESENT` / `MISSING`, sanitized logs, command exit status, row counts without sensitive values, or explicitly authorized redacted outputs. If secret or PII exposure is required to continue, stop and report `NO-GO / NEEDS SCOPING`.

## Evidence Rules

Do not inflate evidence:

- local source/test evidence is not production proof;
- browser visual evidence is not live smoke;
- static bundle marker evidence is not runtime behavior proof;
- read-only DB observation is not mutation absence proof unless the exact mutation-audit mechanism was authorized and run;
- provider diagnostics are not broad provider reliability proof;
- fixture evidence is not real product/data proof;
- a successful deploy is not business-flow correctness;
- no-write smoke evidence is bounded to the exact trigger/session/prompt set.

Record residual risks explicitly when evidence is local, mocked, fixture-only, stale, implementation-reported, not independently reproduced, or bounded to a single run.

## Stop Conditions

Return `NO-GO / NEEDS SCOPING` when:

- authorization for the high-risk phase is unclear;
- target files, commands, environment, URL, or data boundary are unclear;
- the repo is dirty or divergent without explicit authorization;
- the lane would require secret or PII inspection;
- implementation is requested before readiness has clear scope;
- live smoke, deploy, DB/provider/auth/payment work is implied but not explicit;
- acceptance or canon would be performed by the implementer without an accepted verdict;
- the prompt asks to combine phases that canon/work-kit rules require to remain separate.

Return `BLOCKED` when:

- required credentials, authorized session, environment, dependency, remote service, or target artifact is unavailable;
- a login/MFA/native-host/tooling blocker prevents safe continuation;
- rate limits, provider capacity, workflow outage, or deploy/runtime unavailability prevents a valid result;
- local repo state cannot be safely realigned within the current authorization.

## Exact Next Prompt Guidance

When producing a next prompt, include:

- `STRICT MODE`;
- `USE REPO PROCEDURE: skills/<appropriate-skill>/SKILL.md`;
- authoritative repo state and branch expectations;
- exact phase to run and phases to keep separate;
- exact target files, commands, URLs, workflow names, or data scope;
- secret/PII handling rules;
- forbidden actions;
- validation expectations;
- evidence/non-claim/residual-risk reporting requirements;
- commit/push authorization or prohibition;
- exact stop conditions;
- `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` unless a custom format is truly needed;
- success condition.

For high-risk implementation, use `skills/vsm-implementation/SKILL.md` only when files and validation are explicit. For browser visual QA, use `skills/vsm-browser-visual-qa/SKILL.md`. For acceptance, use `skills/vsm-acceptance-audit/SKILL.md`. For canon after acceptance, use `skills/vsm-canon-reconciliation/SKILL.md`.

## Forbidden Actions

During high-risk lane scoping, do not:

- edit source, runtime, tests, docs, canon, packages, workflows, migrations, seeds, or generated artifacts;
- stage, commit, push, amend, or force push;
- deploy or run workflows;
- touch DB/Supabase or run remote reads/writes;
- run live smoke or production smoke;
- call providers, Gemini, embeddings, or model APIs;
- inspect secrets, env values, auth/session/storage/cookies/tokens/headers/passwords;
- access private customer data or PII;
- run checkout/payment/provider operations;
- invoke Product Search or Cesarin runtime;
- use browser QA unless separately and explicitly authorized;
- perform acceptance audit;
- canonize.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE
2. HIGH-RISK SURFACE
3. AUTHORIZATION CHECK
4. FILES / SYSTEMS IN SCOPE
5. PHASE GATE
6. VALIDATION / EVIDENCE PLAN
7. FORBIDDEN ACTIONS
8. NON-CLAIMS / RESIDUAL RISKS
9. EXACT NEXT PROMPT
10. GO / NO-GO

Keep the report bounded to the current phase. Do not turn high-risk scoping into implementation, live validation, deploy, DB/provider/auth work, acceptance, or canon reconciliation.

When a caller already names this repo procedure, the caller should not duplicate this section list by default. A compact `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` instruction is sufficient unless the lane needs custom fields.
