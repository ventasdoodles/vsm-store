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

En VSM Store, las Skills canonizadas bajo `skills/<nombre>/SKILL.md` son procedimientos del repo/work-kit. No deben asumirse como Codex runtime/global Skills instaladas salvo que el entorno actual las exponga explicitamente como Skills instaladas. Cuando no exista instalacion runtime, el prompt debe preferir `USE REPO PROCEDURE: skills/<nombre>/SKILL.md`; `USE SKILL: <nombre>` queda como shorthand historico del work-kit, no como prueba de instalacion en Codex.

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

Un prompt basado en procedimiento debe indicar:

- `USE REPO PROCEDURE: skills/<skill-name>/SKILL.md` cuando la Skill existe solo en el repo/work-kit;
- `USE SKILL: <skill-name>` solo cuando se quiera usar shorthand historico del work-kit o cuando la Skill este instalada en el runtime de Codex;
- tipo de lane;
- mission objective;
- scope autorizado;
- forbidden actions;
- validacion o evidencia esperada;
- `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT`, salvo que exista una razon concreta para formato custom;
- success condition.

ChatGPT no debe duplicar el output contract completo de una repo procedure cuando el prompt ya apunta a `skills/<nombre>/SKILL.md`. La Skill debe cargar su propio formato, sus checks estandar, su taxonomia de riesgo y sus forbidden actions por defecto. El prompt conserva solo el contexto minimo que cambia la ejecucion.

ChatGPT no debe usar una Skill para omitir el contexto minimo. La sizing policy sigue aplicando: cargar solo el contexto que cambie la decision o ejecucion de la lane.

---

## 5. Como Codex / Antigravity reciben prompts con Skills

Codex o Antigravity deben tratar `USE SKILL` como seleccion de procedimiento, no como autorizacion adicional.

Si el procedimiento vive en el repo, Codex debe leer `skills/<nombre>/SKILL.md` como archivo de work-kit. Esto no implica que la Skill este instalada globalmente en Codex ni disponible por el mecanismo runtime de Skills.

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

## 7. Additional Supported Skills

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

### vsm-real-system-qa

Uso para evidence practica local, pre-prod y read-only live cuando el prompt lo autoriza de forma explicita.

Para lanes de identidad y observabilidad de pedidos, seguir el checklist `docs/Reglas para IDE antigravity/LOCAL_QA_IDENTITY_AND_ORDER_OBSERVABILITY_CHECKLIST.md`:

- anclar la prueba en `order_id`;
- usar `customer_id`, email y timestamps como cross-check;
- tratar `order_number` como etiqueta auxiliar, no como prueba unica;
- detenerse si la identidad no se puede resolver sin inspeccionar secretos o sesion.

### vsm-high-risk-lane

Uso para readiness/scoping de superficies sensibles.

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

No ejecuta high-risk work por si misma, no inspecciona secretos/sesion/storage por defecto y no convierte guidance en automated enforcement.

Para admin/customer/order observability, si la prueba depende de identity resolution, DB read proof o admin_users provisioning, seguir primero el checklist local QA y solo avanzar con autorizacion explicita.

### Practical real-system QA and controlled rollout guidance

- `vsm-real-system-qa` puede usarse para evidence practica local, pre-prod y read-only live cuando el prompt lo autoriza de forma explicita.
- `vsm-controlled-rollout` puede usarse para controlled live smoke, gating y monitored stabilization cuando el prompt ya autoriza ese paso.
- `vsm-browser-visual-qa` sigue siendo la procedure para browser visual QA, incluyendo sesiones locales, pre-prod o authenticated existentes cuando el prompt lo autoriza.
- `vsm-high-risk-lane` sigue siendo la procedure correcta para auth, Supabase, deploy, provider, payment, Product Search, Cesarin runtime y live/high-risk scoping.
- Las skills siguen siendo procedurales, no authoritarias; no expanden autorizacion por si mismas.

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

Cada `skills/<nombre>/SKILL.md` define su output contract para esa lane. Los prompts skill-aware deben delegar ese formato con:

```text
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.
```

Solo copiar secciones en el prompt cuando:

- el owner exige un formato custom;
- la lane combina una evidencia excepcional;
- el procedimiento aun no tiene output contract suficiente;
- hay un blocker o high-risk detail que necesita campos extra.

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
