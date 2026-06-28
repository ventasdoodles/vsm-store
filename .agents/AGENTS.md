# VSM Store — Codex Workflow Profile

Perfil operativo repo-level para Codex.

## Baseline Checks

Al inicio de audit, readiness, canon o push lanes:

```powershell
git status -sb
git rev-list --left-right --count origin/main...HEAD
```

## Canon and Work-kit Pointers

Cargar solo lo necesario:

- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `docs/audits/`
- `docs/workkit/README_WORKKIT.md`
- `docs/workkit/PROMPT_SYSTEM_RULES_IMMUTABLE.md`
- `docs/workkit/CONTEXTO_MAESTRO_HANDOFF.md`
- `docs/workkit/PROMPT_SIZING_POLICY_VSM_REPARTO.md`
- `docs/workkit/PROMPT_LIBRARY_TEMPLATES.md`
- `docs/workkit/VSM_SKILL_USAGE_POLICY.md`
- `docs/workkit/CODEX_PROMPT_RELIABILITY_PROTOCOL.md`
- `docs/product/VSM_STORE_DOMAIN_MODEL.md`
- `docs/operations/VSM_REAL_SYSTEM_QA_RUNBOOK.md`

## Role Separation

- ChatGPT orquesta.
- Codex es la unica herramienta real.
- Codex, rol Codex: readiness/audit/acceptance/canon/read-only QA; audita, hace readiness, clasifica, acepta o rechaza.
- Codex, rol Anty: implementation/executor/code-changing; implementa, valida, commit/push cuando esta autorizado.
- Usuario decide visión y prioridad.

Nunca permitir que quien implementa haga acceptance final de su propio cambio.

## Prompt Reliability Gates

- Todo `USE REPO PROCEDURE` debe usar ruta absoluta `C:\dev\vsm-store-fresh\.vsm-workkit\skills\<name>\SKILL.md`.
- Si la ruta exacta del procedimiento no existe, detener con `FAIL_SKILL_PATH_NOT_FOUND`.
- Todo exact next prompt debe usar Codex como target tool real.
- Implementation y canon reconciliation autorizados deben exigir validation, commit y push.
- Readiness, audit y QA/read-only deben declarar `NO COMMIT` y `NO PUSH`.
- Evitar PowerShell inline fragil: preferir comandos simples, rutas entre comillas y `rg` simple; evitar parsing-heavy pipelines, expansion compleja y PowerShell multilinea en exact next prompts.
- Si el prompt incumple el protocolo de confiabilidad, detener con el fail code correspondiente definido en `docs/workkit/CODEX_PROMPT_RELIABILITY_PROTOCOL.md`.

## Lane Discipline

- Readiness: inspección y plan. No edits.
- Audit: inspección, evidencia, verdict. No fixes silenciosos.
- Implementation: solo scope autorizado.
- Validation / smoke: solo checks autorizados.
- Canon reconciliation: solo después de ACCEPT, ACCEPT WITH RESIDUAL RISK o autorización explícita.

## High-risk surfaces

Requieren autorización explícita y fases separadas:

- auth/session/storage/secrets;
- PII: nombres, teléfonos, direcciones;
- GPS/tracking;
- pagos/cobros/liquidaciones;
- repartidor/moto/documentos;
- delivery lifecycle real;
- DB/migrations;
- deploy/live smoke;
- notificaciones reales;
- integraciones externas: mapas, geocoding, pagos, SMS/WhatsApp/push.

## Browser QA

Usar navegador solo cuando el prompt lo autorice. No inspeccionar cookies, localStorage, sessionStorage, auth headers, tokens, passwords ni env values.

## Production proof

No inferir producción desde source tests, mocks, local browser o DB local.

## Mandatory VSM Store Operations (Agent Rule)

**THIS IS A CRITICAL DIRECTIVE FOR ALL AGENTS WORKING ON THIS PROJECT:**

1. **Obey the Work Kit**: You must ALWAYS adhere 100% to the VSM Store Work Kit (`C:\dev\vsm-store-fresh\.vsm-workkit\docs\workkit\README_WORKKIT.md`). Never deviate from its architectural, design, or lane discipline guidelines.
2. **Moto-Gate Baseline Checks**: EVERY TIME you are instructed to implement a new lane (Implementation, Audit, Readiness, etc.), you MUST start by running `node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane repo-baseline` to verify that the repositories are clean and synchronized. Do not proceed with code changes if this check fails.
3. **Canon Documentation Maintenance**: Whenever you complete a significant implementation, you must review the Canon documentation (`C:\dev\vsm-store-fresh\.vsm-workkit\docs\`) and propose updates if the implementation changes the single source of truth or architecture. Do not leave the Canon docs outdated.
