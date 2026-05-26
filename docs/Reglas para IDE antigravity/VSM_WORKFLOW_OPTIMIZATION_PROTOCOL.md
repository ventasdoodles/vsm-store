# VSM Store — Protocolo Optimizado de Flujo de Trabajo

**Tipo:** Fuente operativa / protocolo de orquestación
**Proyecto:** VSM Store
**Uso:** Subir como fuente del proyecto en ChatGPT para guiar la coordinación entre ChatGPT, Codex y Antigravity.
**Autoridad:** Complementa las reglas inmutables, el contexto maestro, la política de sizing, `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md` y `CONTEXTO_TEMPORAL_ACTUAL.md`. No los reemplaza.

---

## 1. Objetivo

Este documento define un flujo de trabajo más corto y eficiente para VSM Store, sin sacrificar calidad, control ni trazabilidad.

La meta es reducir rondas innecesarias entre herramientas, pero preservar la separación sana entre:

```text
ChatGPT = orquesta y decide el siguiente prompt.
Codex = audita, clasifica, readiness, acepta o rechaza.
Antigravity = ejecuta, valida en navegador/local/CLI, aplica cambios, commit/push cuando toca.
Usuario = dueño de producto y juez final.
```

---

## 1.1 Execution Blocks

Para LOW y MEDIUM risk, Codex readiness puede producir un **Execution Block** de hasta 4 lanes relacionadas.

```text
Lane 1 = executable now
Lane 2 = conditional next lane
Lane 3 = conditional next lane
Lane 4 = reserve / continuation / stop-refresh lane
```

Esto reduce overhead de readiness, no quality gates.

Reglas del bloque:

```text
- WIP = 1 lane activa a la vez
- WIP = 1 significa un solo batch activo, no una sola micro-lane
- acceptance audit independiente despues de cada implementation commit
- canon/doc reconciliation solo despues de ACCEPT o ACCEPT WITH RESIDUAL RISK
- lanes condicionales no son autorizacion ciega
- si aparece drift, se detiene el bloque y se pide fresh readiness
- high-risk lanes no entran en Execution Blocks
- prompts exactos de implementation/canon deben requerir commit/push completion cuando esta autorizado y no bloqueado
```

Una lane condicional sigue vigente solo si:

```text
- repo stays clean/aligned
- acceptance no agrega blocking residuals
- canon no cambia el risk profile
- no aparecen forbidden surfaces
- scope y riesgo siguen en LOW o MEDIUM
```

## 1.2 Evidence ladder

La evidencia debe escalar por contexto, no por inercia.

```text
1. source/test
2. local browser
3. local auth/admin
4. local/pre-prod reversible mutation
5. DB/Supabase read proof
6. dummy customer/order flow
7. controlled live smoke
8. monitored real-customer rollout
```

Regla de uso:

```text
- local y pre-prod pueden avanzar por la escalera con evidencias read-only o reversibles cuando el owner lo autoriza
- controlled live before daily customers requiere rollout disciplinado, monitoreo y non-claims estrictos
- production with daily customers requiere la postura mas conservadora: hotfix si el sistema necesita seguir vendiendo, fix correcto en ventana de baja trafico y observacion posterior
- no subir de escalon por inferencia; cada escalon requiere evidencia propia
```

## 1.3 Practical provisioning and context-sensitive risk

El entorno debe ser valido para el objetivo de la lane.

```text
- local/pre-prod QA may use dummy data, dummy customers, dummy orders, and reversible admin mutations when scoped
- a valid env target is required; placeholder or broken targets do not count as provisioning
- secrets should not be pasted or logged unnecessarily
- delicate keys and secrets should be rotated before real rollout
- local/pre-prod lanes can combine practical QA steps when the evidence remains reversible or read-only
- production with daily customers should avoid broad experiments and favor minimal blast-radius fixes
- for local/pre-prod admin and order observability, use `docs/Reglas para IDE antigravity/LOCAL_QA_IDENTITY_AND_ORDER_OBSERVABILITY_CHECKLIST.md`
- order proof must be anchored on `order_id` first; `order_number` is only a supporting label and can collide with historical rows
- if safe identity resolution is unavailable without secret/session inspection, stop and require owner-provided admin QA credential/provisioning
```

La evidencia de browser, auth, DB, dummy flow o rollout debe declararse con non-claims explicitos; no convertir fixture, local o pre-prod evidence en production proof.

---

## 2. Principio rector

La optimización no consiste en saltarse controles. Consiste en combinar pasos compatibles.

```text
Sí se puede combinar:
- readiness + prompt exacto de implementación
- implementación + validación + commit/push
- acceptance audit + prompt exacto de canonización
- canonización + validación + commit/push

No se debe combinar:
- implementación + aceptación final en la misma herramienta
- implementación + canonización sin acceptance audit
- fix + deploy + canonización en una sola orden gigante
- cambios de DB/Supabase/secrets/deploy sin readiness y auditoría
```

Regla corta:

```text
Quien implementa no debe aceptarse a sí mismo.
Quien acepta no debe haber sido quien metió el cambio.
Quien canoniza debe partir de un ACCEPT explícito.
```

---

## 3. Flujo optimizado estándar

Para cambios normales de VSM Store, usar este flujo de 4 fases operativas más cierre:

```text
FASE 1 — Codex readiness + prompt exacto
FASE 2 — Antigravity implementación + validación + commit/push
FASE 3 — Codex acceptance audit + prompt exacto de canon
FASE 4 — Antigravity canonización + validación + commit/push
FASE 5 — ChatGPT/User cierre + siguiente ruta
```

---

## 4. Fase 1 — Codex readiness + prompt exacto

Codex debe:

1. Leer las fuentes/canon necesarias.
2. Confirmar baseline.
3. Identificar lanes cerrados que no deben reabrirse.
4. Clasificar riesgo.
5. Decidir GO / NO-GO.
6. Definir scope exacto.
7. Entregar el prompt exacto para Antigravity si procede.
8. Si conviene, producir un Execution Block con 3-4 lanes y stop conditions.

Codex no debe implementar en esta fase.

Cuando Codex genere un prompt exacto para Antigravity en LOW/MEDIUM implementation o canon y commit/push no este prohibido, debe incluir:

```text
VALIDATION + COMMIT + PUSH REQUIRED
DO NOT RETURN "READY FOR COMMIT/PUSH" IF VALIDATION PASSES
stage only authorized files
commit with concise suggested message
push to origin/main
confirm final git status -sb
confirm final git rev-list --left-right --count origin/main...HEAD
```

Stop conditions para no commitear/pushear: validation failure, unauthorized files, unsafe repo state/divergence, scope drift, forbidden surface, o prompt que prohibe commit/push.

### Output requerido recomendado

```text
1. FILES READ
2. CURRENT CANON BASELINE
3. CLOSED LANES / DO NOT REOPEN
4. RISK CLASSIFICATION
5. BEST NEXT MOVE
6. WHY THIS MOVE
7. TOOL THAT SHOULD ACT NEXT
8. EXACT NEXT PROMPT
9. GO / NO-GO
10. RESIDUAL RISKS
```

### Output alterno para Execution Block

```text
1. FILES READ
2. CURRENT CANON BASELINE
3. BLOCK GOAL
4. LANE 1 - EXECUTABLE NOW
5. LANE 2 - CONDITIONAL
6. LANE 3 - CONDITIONAL
7. LANE 4 - RESERVE / STOP-REFRESH
8. BLOCK-LEVEL STOP CONDITIONS
9. EXACT IMPLEMENTATION PROMPT FOR LANE 1
10. GO / NO-GO
```

---

## 5. Fase 2 — Antigravity implementación + validación + commit/push

Antigravity puede combinar en una sola pasada:

1. Verificar repo state.
2. Implementar solo lo autorizado.
3. Validar diff.
4. Ejecutar pruebas/smoke necesarios.
5. Commit.
6. Push.
7. Reportar evidencia.

Esto sí es seguro porque sigue siendo ejecución, no aceptación final.

Si el prompt autoriza commit/push y los checks pasan, Antigravity debe completar commit/push. `Ready for commit/push` no es estado terminal normal; solo aplica si hay blocker o el prompt prohibe commit/push.

### Output requerido recomendado

```text
1. PRE-IMPLEMENTATION REPO STATE
2. FILES MODIFIED
3. EXACT CHANGES MADE
4. VALIDATION PERFORMED
5. COMMIT HASH + MESSAGE
6. PUSH RESULT
7. ACTIONS NOT PERFORMED
8. RESIDUAL RISKS
9. STATUS
```

---

## 6. Fase 3 — Codex acceptance audit + prompt exacto de canon

Codex debe auditar lo ya implementado.

Codex debe:

1. Revisar commit/diff.
2. Confirmar scope.
3. Confirmar validación.
4. Distinguir claims probados, no probados y bloqueados.
5. Revisar riesgos residuales.
6. Emitir `ACCEPT`, `REJECT` o `ACCEPT WITH RESIDUAL RISK`.
7. Si acepta, entregar prompt exacto de canonización.

### Output requerido recomendado

```text
1. FILES / COMMITS / RUNS INSPECTED
2. REPO STATE
3. DIFF SCOPE CHECK
4. VALIDATION CHECK
5. CLAIMS ACCEPTED
6. CLAIMS NOT ACCEPTED / NON-CLAIMS
7. RESIDUAL RISKS
8. FINAL VERDICT
9. EXACT NEXT PROMPT FOR CANON / DOC RECONCILIATION
10. NEXT PRE-PLANNED LANE VALIDITY
```

---

## 7. Fase 4 — Antigravity canonización + validación + commit/push

Antigravity puede canonizar y pushear en una sola pasada si existe un ACCEPT previo.

Debe actualizar solo los documentos necesarios, normalmente:

```text
AI_CONTEXT.md
AUDIT_LOG.md
STORE_FRONT_AI_PILOT_CONTEXT.md
docs/Reglas para IDE antigravity/CONTEXTO_TEMPORAL_ACTUAL.md
```

No todos los archivos tienen que cambiar siempre. Solo los que correspondan al hito.

Si el prompt autoriza commit/push y los checks docs/canon pasan, Antigravity debe completar commit/push. `Ready for commit/push` no es estado terminal normal; solo aplica si hay blocker o el prompt prohibe commit/push.

Si el hito pertenece a un Execution Block, el cierre de canon debe incluir:

```text
NEXT LANE RECOMMENDATION:
- continue with pre-approved Lane X
- o stop and request fresh readiness because X changed
```

### Output requerido recomendado

```text
1. PRE-CANON REPO STATE
2. FILES INSPECTED
3. FILES MODIFIED
4. EXACT FACTUAL UPDATES MADE
5. VALIDATION PERFORMED
6. COMMIT HASH + MESSAGE
7. PUSH RESULT
8. NON-CLAIMS PRESERVED
9. RESIDUAL RISKS RECORDED
10. STATUS
```

---

## 8. Fase 5 — ChatGPT/User cierre + siguiente ruta

ChatGPT debe cerrar el frente con claridad:

```text
- qué quedó probado
- qué quedó canonizado
- commit final
- estado main/origin
- residuales vivos
- non-claims importantes
- siguiente paso recomendado
```

No debe reabrir el frente cerrado sin evidencia nueva.

---

## 9. Flujo por tipo de tarea

### 9.1 Micro-fix de bajo riesgo

Ejemplos:

```text
- copy
- comentario
- link roto
- clase CSS simple
- ajuste visual menor
- doc pequeño
```

Flujo recomendado:

```text
1. Antigravity implementa + valida + commit/push
2. Codex acceptance audit
3. Antigravity canoniza + push si aplica
4. ChatGPT cierra
```

Readiness puede omitirse si el problema es evidente y el scope es muy pequeño.

---

### 9.2 Cambio medio

Ejemplos:

```text
- componente frontend
- service pequeño
- workflow no crítico
- ajuste de UX
- prueba/smoke local
```

Flujo recomendado:

```text
1. Codex readiness + prompt
2. Antigravity implementa + valida + push
3. Codex acceptance + canon prompt
4. Antigravity canoniza + push
5. ChatGPT cierra
```

---

### 9.3 Alta criticidad

Ejemplos:

```text
- DB / Supabase
- migrations
- auth
- secrets
- deploy
- payments
- checkout
- AI/Césarín runtime
- Product Search/retrieval
- producción
```

Flujo recomendado:

```text
1. Codex readiness
2. Antigravity fase segura / implementación acotada
3. Antigravity validación/smoke
4. Codex acceptance audit
5. Antigravity canonización
6. ChatGPT cierra
```

En estos frentes no mezclar fix + deploy + canonización en una sola orden.

---

## 10. Reglas de optimización

### Regla 0 - Skills aceleran, no aflojan

Las Skills son procedimientos reutilizables. No reemplazan reglas, canon, owner judgment, prompt scope ni lane discipline.

Con Skills:

```text
- Low-risk: se puede combinar readiness + implementation + local validation si el scope es estrecho.
- Medium-risk: se puede combinar implementation + local validation, pero acceptance debe quedar separado cuando el cambio afecte comportamiento visible o logica relevante.
- High-risk: readiness, implementation, validation/smoke, acceptance y canon reconciliation deben permanecer separados.
```

```text
Skills make the workflow faster, not looser.
```

### Regla 1 — No pedir pasos que ya están probados

Si Antigravity ya confirmó:

```text
main = origin/main
commit pushed
no tracked modifications
```

no pedir de nuevo lo mismo salvo que sea precondición crítica del siguiente paso.

---

### Regla 2 — No re-diagnosticar el diagnóstico

Si Codex ya identificó root cause y dio GO, el siguiente prompt a Antigravity debe decir:

```text
Execute the already-approved repair.
Do not re-audit root cause unless a check fails.
```

---

### Regla 3 — Separar claims

Siempre distinguir:

```text
PROVEN
STRUCTURAL
INFERRED
BLOCKED
NOT PROVEN
NON-CLAIM
```

Esto evita inflar resultados.

---

### Regla 4 — Un solo hito por ciclo

No meter backlog gigante.

```text
Máximo 1 hito principal.
Máximo 3 candidatos en readiness.
Elegir exactamente 1 best next move.
```

En Execution Blocks:

```text
- sigue habiendo 1 hito principal por bloque
- hasta 4 lanes relacionadas
- solo 1 lane activa a la vez
- Lane 2/3/4 se ejecutan solo si las stop conditions siguen limpias
```

---

### Regla 5 — El canon no es opcional

Si un cambio queda aceptado, debe canonizarse si afecta verdad operativa del proyecto.

Pero no todo requiere los cuatro docs. Ajustar según impacto.

---

## 11. Qué no se debe optimizar

No sacrificar:

```text
- acceptance audit independiente
- evidencia de validación
- separación entre ejecutor y auditor
- non-claims
- residual risks
- protección de secretos
- límites DB/Supabase/deploy
- lectura de fuentes/canon antes de frentes sensibles
```

---

## 12. Plantilla compacta para prompts optimizados

Usar esta estructura cuando el scope está claro:

```text
TOOL — TASK TITLE

STRICT MODE.
[TYPE OF WORK ONLY.]
NO [FORBIDDEN ACTIONS].

Authoritative current state:
- ...

Mission objective:
- ...

Required scope:
- ...

Required steps:
1. ...
2. ...
3. ...

Validation:
- ...

Commit/push:
- ...

Required output:
FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT.

Success condition:
- ...
```

Si no se usa una repo procedure o la lane necesita campos custom, definir un formato corto y especifico. Si se usa `USE REPO PROCEDURE: skills/<name>/SKILL.md`, no duplicar la lista de secciones que ya vive en el procedimiento.

---

## 13. Regla final

```text
Rápido no significa atropellado.
Optimizado no significa sin auditoría.
El objetivo es quitar vueltas tontas, no quitar frenos.
```
