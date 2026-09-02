# VSM Store — Prompt System Rules Immutable

## 1. Rol

Reglas estables de prompting y handoff. No es canon del producto. Cambia raramente.

## 2. Roles

- Codex: unica herramienta real.
- Codex, rol Codex: readiness/audit/acceptance/canon/read-only QA; audita, valida, readiness, clasifica, acepta/rechaza.
- Codex, rol Anty: implementation/executor/code-changing; implementa, corrige, valida, browser/local/CLI, commit/push cuando se autoriza.
- ChatGPT: orquesta, sintetiza, decide secuencia, redacta prompts.
- Usuario: dueño de producto y juez final.
- Gemini: solo consulta Google AI/Gemini cuando aplique.

## 3. Jerarquía

1. Prompt actual.
2. Canon real.
3. Este documento.
4. Contexto maestro.
5. Sizing policy.
6. Contexto temporal.
7. Templates.
8. Skills/procedures.

## 4. Todo prompt debe incluir

- herramienta objetivo;
- tipo de tarea;
- estado autoritativo;
- mission objective;
- scope;
- constraints;
- output format;
- success condition;
- ruta absoluta de repo procedure cuando aplique;
- fail-fast code cuando una precondicion obligatoria no existe.

## 4.1. Procedure paths

Todo prompt con `USE REPO PROCEDURE` debe usar una ruta absoluta bajo `C:\dev\vsm-store-fresh\.vsm-workkit\skills\...\SKILL.md`.

Si el archivo exacto no existe, detener con `FAIL_SKILL_PATH_NOT_FOUND`.

## 5. No mezclar

- auditoría con implementación;
- implementación con acceptance;
- implementación con canon;
- exploración abierta con cambio de código;
- DB/auth/pagos/tracking/deploy/live smoke sin fases.
- commit/push dentro de readiness, audit o QA/read-only;
- implementation/canon autorizado sin validation, commit y push.

## 6. Tipos válidos

AUDIT, IMPLEMENTATION, VALIDATION/SMOKE, CANON/DOC RECONCILIATION, ROADMAP/READINESS, POLISH/MICRO-PASS, REAL-SYSTEM QA, CONTROLLED ROLLOUT.

## 7. Anti-claims

Distinguir siempre:

- probado live;
- probado local/pre-prod;
- probado browser;
- probado source/test;
- inferido;
- no probado.

## 8. Superficies de alto riesgo VSM Store

- datos personales y direcciones de envío;
- checkout, gateway y webhook de Mercado Pago;
- autenticación, sesiones y secretos de API;
- base de datos, esquemas y migraciones de Supabase;
- catálogo, stock de inventario y mutación de órdenes;
- workflows de CI/CD y despliegues en producción;
- Cesarin AI runtime y llamadas a Gemini API.
