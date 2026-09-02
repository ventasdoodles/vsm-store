---
name: vsm-controlled-rollout
description: Use for controlled live smoke, rollout gating, and monitored stabilization in VSM Store when the prompt explicitly authorizes live or pre-prod release checks. This skill is procedural only and must not be used to authorize production mutation, secret inspection, or rollout by itself.
---

# vsm-controlled-rollout

Use this skill for controlled rollout work after enough prior evidence exists to justify a live or pre-prod release check.

This Skill is procedural, not authoritative. It does not override the current user prompt, work-kit canon, owner decisions, lane discipline, high-risk restrictions, or explicit forbidden actions. It may narrow rollout for safety, but it must never expand authorized scope.

## When To Use

Use when the user asks to:

- plan or execute a controlled live smoke;
- verify a limited release in pre-prod or live with monitoring;
- define rollout gates, rollback expectations, and observation windows;
- distinguish controlled live before daily customers from production with daily customers;
- report rollout evidence, blockers, and residual risks.

Do not use this Skill to implement product changes, mutate production data, or perform uncontrolled exploration.

## Rollout Contexts

Treat these as different risk contexts:

- local or pre-prod controlled mutation: only for scoped evidence and rollback discipline;
- controlled live before daily customers: live but limited blast radius, explicit monitoring, explicit rollback;
- production with daily customers: highest caution, minimal change set, stronger rollback readiness, and no exploratory behavior.

If the prompt does not clearly authorize the current rollout context, return `NO-GO / NEEDS SCOPING`.

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

If the repo is dirty, divergent, or the release boundary is unclear, report the exact condition and stop.

## Required Behavior

1. Confirm the exact environment and rollout scope.
2. Confirm the change set or release set is already authorized.
3. Confirm the monitoring window, rollback owner, and success criteria.
4. Keep release, observation, and rollback separate from implementation.
5. Collect only the evidence needed to decide whether the rollout is healthy.
6. Stop immediately if the rollout is failing or the user-provided boundary is violated.
7. Do not treat a successful limited rollout as proof of broad production correctness.

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

Use metadata-only or redacted forms when needed. If safe continuation requires secret exposure, stop and report `NO-GO / NEEDS SCOPING`.

## Output Contract

Use the prompt's required output format when provided. Otherwise use:

1. TARGET / CONTEXT
2. RELEASE GATE
3. OBSERVATION WINDOW
4. ROLLOUT CHECKS
5. OBSERVED RESULTS
6. RESIDUAL RISKS
7. GO / NO-GO

Keep the report bounded to the rollout context. Do not inflate controlled live smoke into production proof, and do not treat production-with-daily-customers as the same as pre-prod.
