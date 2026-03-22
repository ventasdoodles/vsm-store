# 🤖 AI-to-AI Asynchronous Protocol (Orchestra V2)

> **PURPOSE:** Zero-fluff, highly compressed, token-efficient communication between Gemini (Orchestrator), Anty/Claude (Implementer), and Codex (Auditor). 
> **RULE 1:** No conversational filler. No "Here is your code". 
> **RULE 2:** Strict YAML frontmatter for routing.
> **RULE 3:** Use GraQle (`graq reason`) as the primary context provider to avoid stuffing context windows with raw files unless strictly modifying them.

## 📂 Directory Structure (`.orchestra/`)
- `outbox/` → Prompts ready for Implementer (Anty/Claude).
- `inbox/` → Completed reports from Implementer, waiting for Auditor (Codex).
- `approved/` → Audited and merged.
- `rejected/` → Failed audits with `CORRECTIVE_PROMPT` appended.
- `graq_cache/` → Saved outputs from GraQle to avoid redundant graph API calls.

## 📄 1. TASK_PROMPT (Machine Format)
**Location:** `.orchestra/outbox/{TASK_ID}.md`

```md
---
type: task
id: {TASK_ID}
target: anty_claude
status: pending
---
# SCOPE
Action: {Strict imperative: Consolidate, Refactor, Add}
Target: {Comma-separated files}
Context: {GraQle Output Summary / Exact constraints}

# BOUNDARIES
- DO: {Action 1}
- NOT DO: {Restriction 1}

# SUCCESS
1. Build & Typecheck pass (0 errors).
2. {Specific structural outcome}.

# OUTPUT
Write exact `REPORT` to `.orchestra/inbox/{TASK_ID}_REPORT.md`.
```

## 📄 2. EXECUTION_REPORT (Machine Format)
**Location:** `.orchestra/inbox/{TASK_ID}_REPORT.md`

```md
---
type: report
id: {TASK_ID}
author: anty_claude
status: ready_for_audit
---
# SUMMARY
{1-2 sentences exact technical description of changes}

# DIFF MAP
- `path/file.ts` (MODIFIED): {1 sentence logic change}
- `path/new.ts` (CREATED): {1 sentence purpose}

# METRICS
- Typecheck: PASS
- Lint: PASS
- Build: PASS

# DEVIATIONS
{None or list of permitted deviations}
```

## 📄 3. AUDIT_VERDICT (Machine Format)
**Location:** `.orchestra/approved/` OR `.orchestra/rejected/`

```md
---
type: audit
id: {TASK_ID}
author: codex_gpt4
verdict: {ACCEPT | REJECT}
---
# VIOLATIONS (If REJECT)
1. Rule: {Vision/TypeScript strict} -> File: `file.ts` -> Line: {N}.

# RESOLUTION (If REJECT)
Append `CORRECTIVE_PROMPT` to this file and move back to `outbox/`.
```
