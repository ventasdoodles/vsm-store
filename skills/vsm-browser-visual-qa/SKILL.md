---
name: vsm-browser-visual-qa
description: Use for VSM Store authorized browser visual QA, rendered-fit checks, responsive local/prod visual evidence, screenshot policy, fixture-vs-runtime proof classification, browser evidence non-claims, and stop conditions. This skill is procedural only and must not be used to authorize browser use by itself, implement changes, inspect secrets/storage/auth data, touch DB/Supabase, deploy, run live smoke, call providers, or expand visual observations into production/runtime proof.
---

# vsm-browser-visual-qa

Use this skill to standardize VSM Store browser visual QA and classify visual evidence without inflating claims.

This Skill is procedural, not authoritative. It does not override the current user prompt, project canon, immutable work-kit rules, owner decisions, lane discipline, high-risk restrictions, or independent acceptance. It may narrow visual QA for safety, but it must never expand authorized scope.

This repo procedure lives under `skills/<name>/SKILL.md`; do not assume it is installed as a Codex runtime/global Skill unless the current environment exposes it that way.

## When To Use

Use when the user asks to:

- run or design browser visual QA;
- verify rendered fit, overlap, clipping, blank screens, or responsive layout;
- inspect a local fixture route, local app route, production URL, or authorized existing authenticated session;
- classify local fixture proof, browser visual evidence, screenshot proof, production visual proof, or live-smoke non-claims;
- produce visual QA instructions for Antigravity or Codex.

Do not use this Skill to authorize browser QA when the current prompt forbids it or does not clearly permit it.

For practical local or pre-prod QA, this skill may be used when the prompt explicitly authorizes:

- a local browser session against the current app or admin surfaces;
- a user-present manual login through the normal UI;
- existing authenticated browser state that the prompt allows using;
- dummy data, seeded data, or reversible local/pre-prod mutations;
- screenshot or DOM evidence of the exact routes named by the prompt.

## Operator Output Mode

Default to compact operator output for LOW and MEDIUM risk visual QA.

- Keep visual QA reports short and factual.
- Avoid narrative unless the target is blocked, the lane is high-risk, or the prompt requests explicit evidence detail.
- Use no more than 7 compact sections for local or bounded browser QA unless the prompt explicitly requests more.
- Keep evidence classification, non-claims, residual risks, and stop conditions visible.
- Use full reporting only when the browser QA lane is HIGH risk, blocked, or unresolved.

## Authorization Gate

Before opening a browser, confirm the current prompt explicitly authorizes:

- browser QA or visual QA;
- target environment: local fixture, local app, production public URL, or existing authenticated browser session;
- exact URL, route, or navigation path;
- viewport(s) or responsive scope;
- interactions allowed;
- screenshot requirement or prohibition;
- local server and dummy public env behavior, if needed;
- forbidden actions.

Return `NO-GO / NEEDS SCOPING` if authorization, target, route, environment, or stop condition is unclear.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If browser QA is part of implementation validation, confirm whether the prompt authorizes local server startup, process-local dummy public env placeholders, screenshots, commit/push, and later acceptance separation.

## Context Loading

Load only context needed for the visual check. Prefer:

- target files/components named by the prompt;
- relevant local route or fixture code;
- `AGENTS.md`;
- `AI_CONTEXT.md`;
- `AUDIT_LOG.md`;
- `STORE_FRONT_AI_PILOT_CONTEXT.md`;
- `docs/Reglas para IDE antigravity/VSM_SKILL_USAGE_POLICY.md`;
- `docs/Reglas para IDE antigravity/VSM_PHASE_COMBINATION_RISK_MATRIX.md`;
- browser plugin/runtime instructions when browser tooling is used.

Do not load unrelated historical audits or broad canon unless it affects authorization, non-claims, or residual risks.

## Evidence Taxonomy

Use these labels exactly when useful:

- `LOCAL FIXTURE PROOF`: deterministic test or local fixture route evidence only.
- `LOCAL BROWSER VISUAL EVIDENCE`: observed UI in a local browser target.
- `SCREENSHOT PROOF`: screenshot captured and delivered or referenced as evidence.
- `PRODUCTION VISUAL EVIDENCE`: observed public production URL only.
- `AUTHENTICATED VISUAL EVIDENCE`: observed existing authorized session only.
- `LIVE SMOKE`: runtime trigger/flow evidence; never implied by visual QA.
- `BLOCKED`: target, auth, data, browser tooling, or environment prevented safe QA.
- `NON-CLAIM`: explicitly not proven by the observed visual evidence.

Do not convert one evidence type into another. Local fixture evidence is not production proof. DOM checks are not screenshot proof. Production visual evidence is not live smoke unless the authorized smoke flow was actually performed.

## Visual Check Algorithm

1. Confirm browser QA authorization and target environment.
2. Confirm no forbidden high-risk surface is required.
3. Start or use the authorized target only. For local Vite, use process-local dummy public env placeholders only when authorized; do not write `.env`.
4. Navigate to the exact target URL/path. Avoid broad browsing or guessed route sweeps unless explicitly authorized.
5. If the prompt allows manual login and the user is present, use the normal UI only; do not inspect secrets or storage.
6. Wait for the page or target surface to load.
7. Check expected visible content, nonblank state, key UI surfaces, target interactions, and viewport-specific behavior.
8. Check for obvious overlap, clipping, hidden critical content, horizontal overflow, broken layout, or modal/scroll issues.
9. Use only authorized viewports. Common local visual QA viewports are desktop `1280x720` and mobile `390x844` when specified.
10. Capture screenshots only when required or when screenshot proof is part of the success condition.
11. If the prompt authorizes a dummy or reversible local/pre-prod mutation, keep it inside that boundary and document the rollback path.
12. Stop on login, MFA, missing authorization, native-host/plugin blockers, secret exposure risk, unexpected data exposure, or target data absence.
13. Report evidence classification, claims supported, non-claims, and residual risks.

## Screenshot Policy

Screenshot proof exists only when a screenshot is actually captured and made available in the report or artifact.

Screenshots are recommended when:

- the prompt requests screenshots;
- rendered-fit proof depends on visual layout;
- overlap, clipping, blank render, or modal placement must be reviewed later;
- acceptance will rely on visual evidence.

Screenshots are optional when:

- the prompt asks only for DOM/visibility checks;
- the target may contain sensitive or authenticated data;
- screenshot capture fails but visual/DOM evidence can still be reported as lower-grade evidence.

If screenshot capture fails, report that failure as a residual risk. Do not claim screenshot proof.

Do not capture screenshots of secrets, tokens, passwords, env values, private customer/PII data, or authenticated surfaces unless explicitly authorized and necessary.

## Stop Conditions

Stop and report `BLOCKED` or `NO-GO / NEEDS SCOPING` when:

- browser QA is not explicitly authorized;
- the target URL or route is unclear;
- login or MFA appears and existing session use was not authorized;
- a native-host, browser-plugin, or automation blocker prevents safe operation;
- the target requires DB/Supabase, provider, deploy, Product Search, Cesarin runtime, or live smoke not authorized by the prompt;
- the only way forward requires inspecting cookies, localStorage, sessionStorage, auth headers, tokens, passwords, env values, or secrets;
- real customer/PII data would be exposed outside authorization.

## Non-Claims

Browser visual QA does not prove any of the following unless separately authorized and actually validated:

- DB/Supabase behavior;
- provider/Gemini behavior;
- checkout/payment correctness;
- Product Search quality;
- Cesarin runtime quality;
- auth/session/storage/secret safety;
- deploy success or production freshness;
- live smoke success;
- all-browser or full responsive matrix coverage;
- legal/policy correctness;
- real product data correctness from local fixture evidence.

## Forbidden Actions

During browser visual QA, do not:

- edit files or implement fixes;
- stage, commit, push, amend, or force push unless another authorized lane explicitly permits it;
- deploy or run workflows;
- touch DB/Supabase;
- invoke providers or external APIs unless explicitly authorized;
- run live smoke unless explicitly authorized;
- inspect cookies, localStorage, sessionStorage, auth headers, passwords, tokens, env values, secrets, or hidden credentials;
- use login/MFA workarounds;
- access authenticated sessions unless the prompt explicitly authorizes an existing session;
- broaden from a target route into unrelated product/runtime surfaces;
- claim production/runtime proof from local or fixture observations.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. PRE-STATE / TARGET
2. AUTHORIZATION CHECK
3. URLS / VIEWPORTS
4. OBSERVED VISUAL EVIDENCE
5. SCREENSHOTS
6. CLAIMS SUPPORTED
7. NON-CLAIMS / RESIDUAL RISKS / GO / NO-GO

Keep the report bounded to what was actually observed. Separate local, fixture, production, screenshot, authenticated, and live-smoke evidence.

When a caller already names this repo procedure, the caller should not duplicate this section list by default. A compact `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` instruction is sufficient unless the lane needs custom fields.
