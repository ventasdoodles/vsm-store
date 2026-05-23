# VSM Store - Skill Usage Policy

**Tipo:** Politica operativa / procedimientos reutilizables.
**Proyecto:** VSM Store.
**Uso:** Definir como ChatGPT Skills entran al work-kit sin cambiar la autoridad, el canon ni la disciplina de lanes.
**Autoridad:** Complementa `AGENTS.md`, las reglas inmutables, el contexto maestro, la sizing policy, el contexto temporal, el protocolo optimizado y la matriz de riesgo. No reemplaza ninguno.

---

## 1. Proposito

Las Skills existen para convertir patrones repetidos de trabajo en procedimientos reutilizables.

En VSM Store una Skill debe:

- hacer mas rapido el flujo operativo;
- reducir prompts largos y repetitivos;
- aplicar de forma consistente la lane activa;
- preservar evidencia, non-claims y riesgos residuales;
- detenerse cuando el scope, riesgo o autorizacion no esten claros.

Una Skill no existe para ampliar scope, saltar auditoria, tocar superficies sensibles por inferencia ni convertir evidencia local en prueba de produccion.

---

## 2. Regla central

```text
Skills are procedural, not authoritative.
```

Una Skill es un procedimiento. No es una fuente superior de verdad.

Una Skill puede estrechar la ejecucion para hacerla mas segura, pero no puede expandir lo autorizado por el prompt actual.

---

## 3. Jerarquia de autoridad

Cuando haya conflicto, usar esta precedencia:

1. Prompt actual del usuario y estado autoritativo explicito.
2. Canon real aplicable del proyecto (`AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`, `docs/audits/`).
3. `docs/Reglas para IDE antigravity/PROMPT-SYSTEM-RULES-—-IMMUTABLE.txt`.
4. `docs/Reglas para IDE antigravity/CONTEXTO-MAESTRO,-BASE-OPERATIVA-y-HANDOFF-CANÓNICO.txt`.
5. `docs/Reglas para IDE antigravity/PROMPT_SIZING_POLICY_VSM_STORE.md`.
6. `docs/Reglas para IDE antigravity/CONTEXTO_TEMPORAL_ACTUAL.md`.
7. `docs/Reglas para IDE antigravity/PROMPT_LIBRARY_TEMPLATES.txt`.
8. Esta Skill Usage Policy y cualquier Skill derivada.

Si una Skill contradice una capa superior, pierde la Skill.

---

## 4. Como ChatGPT usa Skills

ChatGPT puede usar Skills para redactar prompts mas compactos y consistentes.

Un prompt skill-aware debe indicar:

- `USE SKILL: <skill-name>`;
- tipo de lane;
- mission objective;
- scope autorizado;
- forbidden actions;
- validacion o evidencia esperada;
- output format;
- success condition.

ChatGPT no debe usar una Skill para omitir el contexto minimo. La sizing policy sigue aplicando: cargar solo el contexto que cambie la decision o ejecucion de la lane.

---

## 5. Como Codex / Antigravity reciben prompts con Skills

Codex o Antigravity deben tratar `USE SKILL` como seleccion de procedimiento, no como autorizacion adicional.

Si el prompt dice `USE SKILL: vsm-implementation`, pero prohibe source changes, la Skill no puede editar source.

Si el prompt dice `USE SKILL: vsm-browser-visual-qa`, pero no autoriza navegador, produccion o sesion autenticada, la Skill debe limitarse a lo autorizado o devolver `NO-GO / NEEDS SCOPING`.

---

## 6. Initial Supported Skills

### vsm-readiness

Uso:

- roadmap;
- readiness;
- GO / NO-GO;
- seleccionar un siguiente hito;
- producir prompt exacto para implementacion o auditoria posterior.

Debe:

- confirmar repo state cuando aplique;
- leer solo canon/work-kit relevante;
- identificar lanes cerradas y non-claims;
- clasificar riesgo;
- elegir un solo best next move cuando se pida priorizacion;
- no implementar.

### vsm-implementation

Uso:

- cambios autorizados y acotados;
- docs-only, source/test local o micro-pass, segun prompt;
- validacion local autorizada;
- reporte de diff y evidencia.

Debe:

- editar solo archivos/superficies autorizadas;
- validar con comandos permitidos;
- reportar files read, files modified, validations, claims, non-claims y residual risks;
- no canonizar salvo autorizacion explicita;
- no performar independent final acceptance para cambios high-risk.

### vsm-acceptance-audit

Uso:

- auditar commits, diffs o patches ya implementados;
- verificar scope y evidencia;
- emitir `ACCEPT`, `REJECT` o `ACCEPT WITH RESIDUAL RISK`;
- producir prompt exacto de canon si aplica.

Debe:

- no implementar silenciosamente;
- no corregir mientras audita;
- distinguir evidencia local, browser QA, production smoke, acceptance y canonizacion;
- preservar non-claims.

---

## 7. Future Optional Skills

### vsm-canon-reconciliation

Solo puede correr despues de:

- `ACCEPT`;
- `ACCEPT WITH RESIDUAL RISK`;
- o autorizacion explicita del owner.

Debe actualizar solo docs/canon necesarios y preservar residual risks y non-claims.

### vsm-browser-visual-qa

Solo puede usar navegador cuando el prompt lo autorice.

Debe distinguir:

- local browser QA;
- authenticated Chrome/session work;
- production visual QA;
- live smoke.

No puede inspeccionar cookies, localStorage, session storage, auth headers, passwords, tokens, env values o secrets salvo autorizacion explicita.

### vsm-high-risk-lane

Uso para superficies sensibles.

Debe imponer fase separada y autorizacion explicita para:

- DB/Supabase;
- auth/session/storage/secrets;
- deploy/workflows;
- checkout/payment/provider;
- Mercado Pago;
- Product Search/retrieval/embeddings;
- AI/Cesarin runtime;
- production smoke/live smoke;
- provider/Gemini calls.

---

## 8. Universal Skill Rules

- Una Skill es procedural, no authoritative.
- Una Skill no puede overridear reglas inmutables, canon vivo, prompt constraints, owner decisions ni lane discipline.
- Una Skill puede narrow execution, pero no expandirla.
- Si scope, files, riesgo o autorizacion no estan claros, devolver `NO-GO / NEEDS SCOPING`.
- Una Skill debe clasificar riesgo antes de recomendar combinacion de fases.
- Una Skill no puede tocar high-risk surfaces salvo autorizacion explicita en el prompt actual.
- Implementation Skills pueden implementar y validar, pero no hacer independent final acceptance de high-risk changes.
- Acceptance Skills pueden auditar y aceptar/rechazar, pero no implementar silenciosamente.
- Canon reconciliation requiere `ACCEPT`, `ACCEPT WITH RESIDUAL RISK` o owner authorization explicita.
- Skills deben reportar files read, files modified, validations run, claims verified, non-claims y residual risks.
- Skills deben distinguir local validation, browser QA, production smoke, acceptance y canonization.
- Skills no deben inflar claims mas alla de la evidencia.

---

## 9. Risk-Based Phase Combination

### Low Risk

Skills pueden combinar readiness + implementation + local validation cuando:

- el scope es pequeno;
- no hay high-risk surfaces;
- rollback es obvio;
- la validacion es local y clara.

### Medium Risk

Skills pueden combinar implementation + local validation.

Acceptance debe quedar separado cuando el cambio afecta comportamiento visible, service/query logic, workflow no critico o UX relevante.

### High Risk

Skills deben mantener separadas:

- readiness;
- implementation;
- validation/smoke;
- acceptance audit;
- canon reconciliation.

High-risk nunca se vuelve low-risk por usar una Skill.

---

## 10. Canon Reconciliation Restrictions

Una Skill no puede canonizar por si misma si no existe acceptance o autorizacion explicita.

Canon reconciliation debe:

- registrar solo hechos aceptados;
- preservar non-claims;
- preservar residual risks;
- no convertir local validation en production proof;
- no inventar deploy, DB, provider, auth, smoke o secret evidence.

---

## 11. Required Reporting Format

Cuando una Skill ejecute o audite una lane, el output debe incluir las secciones relevantes:

1. PRE-STATE
2. FILES READ
3. FILES MODIFIED
4. EXACT CHANGES MADE
5. VALIDATION PERFORMED
6. CLAIMS VERIFIED
7. NON-CLAIMS
8. RESIDUAL RISKS
9. COMMIT STATUS
10. GO / NO-GO

---

## 12. High-Risk Surfaces

Estas superficies requieren autorizacion explicita y phase separation:

- DB/Supabase;
- auth/session/storage/secrets;
- deploy/workflows;
- checkout/payment/provider;
- Mercado Pago;
- Product Search/retrieval/embeddings;
- AI/Cesarin runtime;
- production smoke/live smoke;
- provider/Gemini calls;
- PII/customer data.

Ninguna Skill autoriza estas superficies por si misma.

---

## 13. Explicit Non-Claims

La existencia de una Skill o de un prompt skill-aware no prueba:

- source/runtime/test behavior;
- production behavior;
- DB/Supabase behavior;
- provider behavior;
- deploy/live-smoke readiness;
- auth/session/storage/secret safety;
- payment correctness;
- Product Search quality;
- Cesarin runtime quality;
- browser visual behavior;
- workflow automation success.

La evidencia debe venir de la validacion autorizada de la lane activa.
