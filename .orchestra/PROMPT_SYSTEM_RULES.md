# PROMPT SYSTEM RULES — IMMUTABLE
Este documento define reglas estables para construir prompts operativos del proyecto.
No es canon del producto. Es canon del método de trabajo.
Debe cambiar raramente.

## 1. Roles operativos fijos
- Codex audita, revisa, valida, clasifica, acepta o rechaza.
- Anty implementa, corrige, ejecuta cambios, refactors, migraciones y validaciones de implementación.
- ChatGPT orquesta, sintetiza, decide secuencia, redacta prompts y traduce hallazgos a acciones.
- El usuario es dueño de producto, mensajero entre herramientas, probador real y juez final de visión.

## 2. Regla de oro
Todo prompt debe dejar explícito:
- para qué herramienta va
- qué tipo de tarea es
- qué está autorizado y qué no
- cuál es la meta exacta
- qué formato de salida se exige
- qué condición de éxito define “terminado”

## 3. Separación obligatoria por tipo de tarea
Nunca mezclar en el mismo prompt:
- auditoría con implementación
- implementación con canon/doc si no está estable
- exploración abierta con cambio de código directo
- rediseño grande con micro-fix quirúrgico

## 4. Tipos válidos de prompt
Cada prompt debe pertenecer claramente a uno de estos tipos:
1. AUDIT
2. IMPLEMENTATION
3. VALIDATION / SMOKE
4. CANON / DOC RECONCILIATION
5. ROADMAP / READINESS
6. POLISH / MICRO-PASS

## 5. Estructura mínima obligatoria
Todo prompt debe incluir estas secciones, en este orden cuando aplique:
1. Título claro
2. Modo estricto
3. Herramienta objetivo
4. Estado autoritativo actual
5. Meta / mission objective
6. Scope requerido
7. Constraints
8. Output format
9. Success condition

## 6. Reglas para prompts de Codex
Codex:
- audita, valida, clasifica, define prioridad, hace acceptance audit, hace diagnosis, revisa implementación.
- no debe implementar si el prompt dice audit only.
Lenguaje recomendado: AUDIT ONLY, NO IMPLEMENTATION, NO DOC/CANON CHANGES, CLASSIFY / ACCEPT / REJECT / PRIORITIZE.

## 7. Reglas para prompts de Anty
Anty:
- implementa, corrige, ejecuta micro-passes, aplica migraciones, cambios de UI/UX, hace hardening.
- no debe re-auditar si el prompt es de implementación.
Lenguaje recomendado: IMPLEMENTATION AUTHORIZED, DO NOT REDESIGN FROM ZERO, DO NOT OPEN NEW FRONTS, USE CURRENT SYSTEM AS BASELINE.

## 8. Regla de continuidad temporal
El contexto temporal debe vivir fuera del prompt principal. Separar reglas inmutables, contexto temporal vigente y plantilla por tipo de tarea.

## 9. Contexto temporal
Resumir qué se logró, qué quedó pendiente, meta activa, qué no reabrir y siguiente paso lógico.

## 10. Regla de secuencia
1. Audit / diagnosis, 2. Implementation, 3. Validation / smoke, 4. Acceptance audit, 5. Canon / doc reconciliation. No saltarse pasos sin razón explícita.

## 11. Regla de no inflar claims
Distinguir: probado live, estructuralmente, inferido, no probado. No aceptar frases infladas.

## 12. Regla de micro-pass
Para problemas finos: usar micro-pass, scope pequeño, cambios de alto ROI, nada de reabrir el mundo.

## 13. Regla de documentación
La documentación/canon se toca al final de una implementación estable o en un pass específico de reconciliación.

## 14. Regla de lenguaje
Directos, concretos, sin teoría UX vacía, sin “sé creativo”, sin ambigüedad entre auditar e implementar.

## 15. Regla de outputs
Exigir: FILES INSPECTED, FILES MODIFIED, EXACT CHANGES MADE, VALIDATION PERFORMED, RESIDUAL RISK, COMMIT HASH + MESSAGE, STATUS.

## 16. Regla de verdad de producto
¿Esto se alinea con la visión del dueño? ¿Esto lo entiende un operador? ¿Esto cierra un loop real?
