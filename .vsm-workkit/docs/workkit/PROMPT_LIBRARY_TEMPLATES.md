# VSM Store — Prompt Library Templates

* Cualquier template que produzca un exact next prompt debe ejecutar el `PROMPT_OUTPUT_QUALITY_GATE.md`.
* El output prompt es un borrador (draft) hasta que sea revisado por ChatGPT/User.
* Incluir `PROMPT QUALITY GATE CHECK: PASS` antes del exact prompt propuesto.

## A. Codex Readiness

```text
[TITLE]

STRICT MODE.
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-readiness\SKILL.md
ROADMAP / READINESS ONLY.
NO IMPLEMENTATION.
NO DOC/CANON CHANGES.
NO COMMIT.
NO PUSH.

Target tool:
Codex, rol Codex.

Minimal read-first pack:
* C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md
* C:\dev\vsm-store-fresh\.vsm-workkit\AUDIT_LOG.md
* C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-readiness\SKILL.md
* C:\dev\vsm-store-fresh\.vsm-workkit\docs\workkit\PROMPT_OUTPUT_QUALITY_GATE.md
*(For High-Risk/Architecture add: PROMPT_SYSTEM_RULES_IMMUTABLE.md, VSM_PHASE_COMBINATION_RISK_MATRIX.md)*

Authoritative current state:
[brief state]

Mission objective:
[exact decision]

Scope:
[repo/modules/files]

Forbidden actions:
[source changes, DB, deploy, live smoke, secrets, providers]

Output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
GO/NO-GO and exact next prompt.
```

## B. Codex Implementation

```text
[TITLE]

STRICT MODE.
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-implementation\SKILL.md
IMPLEMENTATION AUTHORIZED.
VALIDATION + COMMIT + PUSH REQUIRED.
DO NOT RETURN "READY FOR COMMIT/PUSH" IF VALIDATION PASSES.
DO NOT REDESIGN FROM ZERO.
DO NOT OPEN NEW FRONTS.

Target tool:
Codex, rol Anty.

Minimal read-first pack:
* C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md
* C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-implementation\SKILL.md

Mission objective:
[exact change]

Scope:
[authorized files/surfaces]

Forbidden actions:
[what must not be touched]

Validation:
[commands/browser/local QA]

Commit/push:
- stage only authorized files
- commit with concise message
- push to origin/main
- confirm final git status -sb
- confirm final git rev-list --left-right --count origin/main...HEAD

Output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
Implemented and validated without self-acceptance.
```

## C. Real-System QA

```text
[TITLE]

STRICT MODE.
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-real-system-qa\SKILL.md
REAL-SYSTEM QA ONLY.
NO IMPLEMENTATION.
NO DOC/CANON CHANGES.
NO COMMIT.
NO PUSH.

Environment target:
[local/pre-prod/controlled live]

Target tool:
Codex, rol Codex.

Minimal read-first pack:
* C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md
* C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-real-system-qa\SKILL.md

Mission objective:
Prove [specific flow] without overclaiming.

Scope:
[routes, dummy data, DB read proof, rollback]

Forbidden:
- secrets/session/storage inspection
- unscoped DB mutation
- production impact
- provider calls unless authorized

Output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
Precise evidence + non-claims + blockers.
```

## D. Acceptance Audit

```text
[TITLE]

STRICT MODE.
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-acceptance-audit\SKILL.md
ACCEPTANCE AUDIT ONLY.
NO IMPLEMENTATION.
NO DOC/CANON CHANGES.
NO COMMIT.
NO PUSH.

Implemented commit / patch:
[commit/range/report]

Target tool:
Codex, rol Codex.

Minimal read-first pack:
* C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md
* C:\dev\vsm-store-fresh\.vsm-workkit\AUDIT_LOG.md
* C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-acceptance-audit\SKILL.md

Mission objective:
Accept/reject implemented lane.

Output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
ACCEPT / ACCEPT WITH RESIDUAL RISK / REJECT.
```

## E. Canon Reconciliation

```text
[TITLE]

STRICT MODE.
USE REPO PROCEDURE ABSOLUTE PATH:
C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-canon-reconciliation\SKILL.md
CANON / DOC RECONCILIATION ONLY.
VALIDATION + COMMIT + PUSH REQUIRED.
This is a write lane; do not include `NO COMMIT` or `NO PUSH`.
NO SOURCE/RUNTIME/TEST CHANGES.

Authoritative accepted state:
[ACCEPT / ACCEPT WITH RESIDUAL RISK]

Target tool:
Codex, rol Codex.

Minimal read-first pack:
* C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md
* C:\dev\vsm-store-fresh\.vsm-workkit\AUDIT_LOG.md
* C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-canon-reconciliation\SKILL.md

Mission objective:
Update canon with accepted facts only.

Output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
Canon updated, non-claims preserved, repo clean/aligned.
```
