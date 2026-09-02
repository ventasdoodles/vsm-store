# VSM Store — Prompt Sizing Policy

## Regla central

El prompt debe cargar solo el contexto necesario para la lane actual.

Más contexto no significa mejor prompt.

## Capa 1 — Innegociable

- STRICT MODE.
- herramienta objetivo.
- estado autoritativo resumido.
- mission objective.
- scope.
- constraints.
- output format.
- success condition.

## Repo procedure

Si se usa `USE REPO PROCEDURE ABSOLUTE PATH: C:\dev\vsm-store-fresh\.vsm-workkit\skills\<name>\SKILL.md`, delegar output con:

```text
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.
```

No copiar todo el contrato si la procedure ya lo define.

Si la ruta absoluta exacta no existe, detener con `FAIL_SKILL_PATH_NOT_FOUND`.

## Ruido fuera

- historia vieja;
- reportes completos;
- canon duplicado;
- teoría general;
- ejemplos innecesarios.

## Bandas

- XS: typo/copy/micro-fix.
- S: audit acotada/smoke/doc pequeño.
- M: implementación bounded/QA local.
- L: mapa inicial/auth/pagos/tracking/DB/producción.

## Nunca recortar

- seguridad;
- non-claims;
- success condition;
- high-risk boundaries;
- verdad autoritativa.

## Minimal Read-First Packs

Do NOT paste the entire work-kit file list into every prompt. Trust the AI to follow the `SKILL.md` procedure.

- **Readiness (Standard):** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-readiness\SKILL.md`
- **Readiness (High-Risk/Architecture):** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-readiness\SKILL.md`, `docs/workkit/PROMPT_SYSTEM_RULES_IMMUTABLE.md`, `docs/workkit/VSM_PHASE_COMBINATION_RISK_MATRIX.md`
- **Implementation:** `AI_CONTEXT.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-implementation\SKILL.md`
- **Acceptance Audit:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-acceptance-audit\SKILL.md`
- **Canon Reconciliation:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-canon-reconciliation\SKILL.md`
- **Real-System QA:** `AI_CONTEXT.md`, `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-real-system-qa\SKILL.md`

## Workspace Hygiene Rules

- **Temp scripts:** Delete immediately after use.
- **Dev servers:** Kill after validation is complete to free ports.
- **.env / Secrets:** DO NOT PRINT. Rely on env vars silently.
- **Live DB / MCP:** Read-only for audits. Implementation mutations strictly via SQL files and tracked commits.
- **Command discipline:** Prefer simple read-only commands and simple `rg`; avoid parsing-heavy pipelines, complex variable expansion, and multiline PowerShell in exact next prompts.
