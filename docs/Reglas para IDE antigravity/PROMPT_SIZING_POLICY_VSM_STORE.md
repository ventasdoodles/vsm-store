# PROMPT SIZING POLICY VSM STORE

## Rol de este documento
Este archivo regula el tamano operativo de los prompts del work-kit.
No define la estrategia del producto.
No reemplaza reglas, contexto maestro, contexto temporal ni plantillas.

## Objetivo
Mantener prompts:
- suficientemente completos para ejecutar bien
- suficientemente cortos para no contaminar la tarea con ruido
- consistentes entre auditoria, implementacion, validacion y reconciliacion

## Regla central
El prompt debe cargar solo el contexto necesario para que la herramienta haga bien la tarea actual.
Mas contexto no significa mejor prompt.

## Regla para Skills
Una Skill no justifica cargar contexto excesivo.

Los prompts skill-aware deben seguir cargando solo el minimo contexto necesario para la lane activa. No cargar auditorias historicas, plantillas, suplementos o canon duplicado por defecto salvo que afecten la decision, el scope, la evidencia o la validacion de la tarea.

Cuando un prompt usa `USE REPO PROCEDURE: skills/<name>/SKILL.md`, no debe copiar el output contract completo de la Skill por defecto. Debe usar `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` salvo que la lane necesite un formato custom por una razon concreta.

## Capas de contexto
### Capa 1. Innegociable
Siempre incluir:
- modo estricto
- herramienta objetivo
- estado autoritativo actual resumido
- mission objective
- scope
- constraints
- output format, preferentemente delegado como `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT` cuando aplique una repo procedure
- success condition

### Capa 1.1. Contrato minimo para prompts con repo procedure
Siempre incluir:
- `STRICT MODE`
- `USE REPO PROCEDURE: skills/<name>/SKILL.md`
- rol / tipo de lane
- repo y estado autoritativo actual resumido
- mission objective
- scope autorizado o target commit/rango
- validacion o evidencia lane-specific
- commit/push autorizado o prohibido
- forbidden actions solo cuando sean lane-specific o high-risk
- `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT`
- success condition

Delegar a la repo procedure:
- pre-state checks estandar
- risk taxonomy
- default forbidden actions
- phase discipline
- output section list
- GO / NO-GO behavior

### Capa 2. Contexto de soporte
Incluir solo si cambia el resultado:
- archivos o superficies exactas
- freezes o lanes que no deben reabrirse
- dependencias previas
- estado live vs estructural vs inferido

### Capa 3. Ruido que debe quedar fuera
No cargar:
- historia larga del proyecto que no afecta la tarea
- reportes viejos completos si basta el veredicto
- canon duplicado en bruto
- teoria general de prompting

## Bandas de sizing recomendadas
### XS
Uso:
- micro-fix
- micro-pass
- aclaracion operacional puntual

Debe incluir:
- un objetivo exacto
- un scope pequeno
- constraints muy cerrados

### S
Uso:
- auditoria acotada
- reconciliacion documental puntual
- validacion o smoke especifico

Debe incluir:
- estado autoritativo resumido
- superficies exactas
- claims que deben verificarse o no inflarse

### M
Uso:
- implementacion bounded multi-file
- hardening documental como este lane
- migraciones o operaciones con varias superficies relacionadas

Debe incluir:
- bootstrap suficiente
- fronteras claras
- lista concreta de artefactos implicados

### L
Uso excepcional:
- convergencia estructural
- auditorias complejas cross-surface
- frentes con alto riesgo de scope creep

Regla:
- solo usar cuando el riesgo real justifique mas contexto
- aun en L, resumir y comprimir todo lo que no sea load-bearing

## Reglas por tipo de prompt
### AUDIT
- priorizar claim bajo revision
- no copiar implementaciones completas si basta el diff o la superficie
- incluir criterios de accept/reject

### IMPLEMENTATION
- priorizar estado actual, scope y constraints
- incluir solo el contexto que cambie decisiones de implementacion
- no cargar canon historico innecesario

### VALIDATION / SMOKE
- priorizar checks, evidencia esperada y bloqueos
- eliminar toda narrativa que no afecte la prueba

### CANON / DOC RECONCILIATION
- priorizar hechos aceptados y no-claims
- no recontar toda la implementacion si el hecho canonico ya esta cerrado

### ROADMAP / READINESS
- priorizar exclusions y una sola decision
- no convertirlo en backlog general

## Regla de recorte
Si un prompt crece demasiado, recortar en este orden:
1. historia vieja no operativa
2. ejemplos redundantes
3. justificaciones obvias
4. listas largas que no cambian la ejecucion
5. output section lists ya definidas por la repo procedure

Nunca recortar:
- restricciones de seguridad
- freezes activos
- verdad autoritativa actual
- success condition

## Regla de contexto temporal
El contexto temporal se resume dentro del prompt, no se pega completo por defecto.
Si hay que citarlo, extraer solo:
- meta activa
- baseline actual
- no reabrir
- siguiente paso correcto

## Regla de handoff
Un buen handoff futuro debe dejar claro:
- que leer primero
- que parte del contexto sigue viva
- que parte ya es historia cerrada
- que no debe reabrirse accidentalmente
