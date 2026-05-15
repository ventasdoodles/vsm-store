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

Codex no debe implementar en esta fase.

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
1. PRE-STATE
2. FILES MODIFIED
3. EXACT CHANGES
4. VALIDATION
5. COMMIT/PUSH
6. RESIDUAL RISKS
7. STATUS

Success condition:
- ...
```

---

## 13. Regla final

```text
Rápido no significa atropellado.
Optimizado no significa sin auditoría.
El objetivo es quitar vueltas tontas, no quitar frenos.
```
