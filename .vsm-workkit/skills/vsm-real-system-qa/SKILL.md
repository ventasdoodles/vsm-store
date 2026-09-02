---
name: vsm-real-system-qa
description: Use for practical real-system QA in VSM Store across local, pre-prod, and read-only live contexts when the prompt authorizes browser/admin/customer-flow evidence, dummy data, reversible local/pre-prod mutations, or read-only DB evidence. This skill is procedural only and must not be used to authorize secrets inspection, production mutation, deploys, acceptance, or canonization by itself.
---

# vsm-real-system-qa

Use this skill for bounded real-system QA when the goal is to prove what actually works in the current environment without inflating local evidence into production proof.

This Skill is procedural, not authoritative. It does not override the current user prompt, work-kit canon, owner decisions, lane discipline, high-risk restrictions, or explicit forbidden actions. It may narrow QA for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- verify local browser behavior on the current app or admin surfaces;
- verify an authenticated local/pre-prod admin session if the prompt authorizes manual login or an already-available session;
- test dummy customer or dummy order flows;
- perform reversible local or pre-prod mutations that are explicitly scoped;
- collect read-only DB/Supabase evidence when explicitly authorized;
- produce a compact evidence report with clear claims, non-claims, blockers, and next step.

Do not use this Skill to authorize deploys, production mutations, secret inspection, acceptance, or canon reconciliation by itself.

## Evidence Ladder

Use the smallest evidence step that answers the prompt:

1. source/test
2. local browser
3. local auth/admin
4. local/pre-prod reversible mutation
5. DB/Supabase read proof
6. dummy customer/order flow

If the prompt needs controlled live smoke or monitored rollout, hand off to `skills/vsm-controlled-rollout/SKILL.md` or `skills/vsm-high-risk-lane/SKILL.md` as appropriate.

## Pre-State

When a repo is involved, start with:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

If the prompt names a workspace or environment, stay inside that boundary. If the repo is dirty, divergent, or the target environment is unclear, report the exact condition and return `NO-GO / NEEDS SCOPING` unless the prompt explicitly authorizes working from that state.

## Authorization Gate

Before doing browser or environment work, confirm the prompt explicitly authorizes:

- the target environment: local, pre-prod, or read-only live;
- the exact URL, route, or flow;
- whether manual login is allowed if the user is already present in the browser;
- whether dummy data or a reversible mutation is allowed;
- whether screenshots or DOM evidence are required;
- whether DB/Supabase read-only observation is allowed;
- forbidden actions.

Return `NO-GO / NEEDS SCOPING` if any of the above is unclear.

## Required Behavior

1. Confirm the environment target and scope.
2. Identify whether browser, admin, customer-flow, or DB read evidence is needed.
3. Prefer read-only observations first.
4. If manual login is authorized and the user is present, continue through the normal UI only.
5. If dummy data or a reversible mutation is authorized, keep it local or pre-prod and document the rollback path.
6. Distinguish what was observed from what is only inferred.
7. Stop on login/MFA blockers, secret exposure risk, missing authorization, or any action that would mutate production data.
8. If the prompt needs controlled live rollout or monitored production stabilization, stop and hand off to `vsm-controlled-rollout`.

## Secret And Data Policy

Do not inspect, print, copy, or ask the user to paste:

- env values;
- API keys;
- tokens;
- passwords;
- cookies;
- localStorage/sessionStorage values;
- auth headers;
- service role keys;
- private customer data or PII.

Use presence-only or redacted forms when needed, and stop if safe continuation would require secret exposure.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. ENVIRONMENT TARGET
2. ROUTES / FLOWS CHECKED
3. AUTH STATE OBSERVED
4. EVIDENCE COLLECTED
5. CLAIMS SUPPORTED
6. NON-CLAIMS
7. BLOCKERS
8. GO / NO-GO

Keep the report bounded to what was actually observed. Local fixture evidence is not production proof, and browser evidence is not live rollout proof.
