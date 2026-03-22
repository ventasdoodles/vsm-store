# Pilot Miss Taxonomy Panel — Estado y dirección de implementación

## Contexto

Se pidió un panel operador-first dentro de las superficies actuales de observabilidad del piloto para responder rápido:

> ¿Qué tipo de miss o falla está dominando ahora?

Restricciones vigentes:

- sin nueva ola
- sin rediseño general del admin
- sin tocar gating/sesión del piloto
- sin nuevas escrituras de telemetría salvo gap real de campos
- usar primero `ai_analytics` + `ai_logic_debug` + payloads ya presentes

## Hallazgo clave

El repositorio **ya contiene** una primera implementación de `MissTaxonomyPanel` dentro de:

- `src/components/admin/cesarin/PilotTelemetry.tsx`

Además:

- ya se renderiza dentro de `PilotTelemetry`
- ya consume `PilotKPIs` + `PilotQueryRow`
- ya muestra una lectura resumida de categorías

Commits históricos relevantes:

- `9b9d5b1` — `feat(cesarin): add MissTaxonomyPanel to PilotTelemetry operator surface`
- `3421613` — `fix(cesarin): heuristic correction pass on MissTaxonomyPanel categorization`

## Qué ya cubre bien

La versión actual ya ofrece una primera lectura para operadores sobre:

- `Producto sin resultado`
- `Fallback activado`
- `Rescue guardrail`
- `Consulta política / RAG`
- señales secundarias como:
  - `Señal de frustración`
  - `Sin cápsula asignada`

Eso significa que el gap original ya no es “no existe panel”, sino:

> la atribución todavía es útil pero demasiado gruesa en algunas categorías.

## Brechas reales que siguen abiertas

### 1. La taxonomía actual mezcla categorías fuertes con señales débiles

Hoy el panel combina:

- causas operativas más fuertes
- síntomas o heurísticas blandas

Ejemplo:

- `Señal de frustración` no es una causa raíz
- `Sin cápsula asignada` depende de muestra acotada del log, no de KPI agregado

### 2. Falta una categoría explícita de degradación / error path

La telemetría ya parece traer suficientes señales para inferir de forma conservadora:

- `gemini_api_error`
- errores de tools vía `analyst_report.tool_results`
- casos con `response_text` ausente junto con degradación/fallback

Pero hoy `admin-pilot-ops.service.ts` no los expone todavía en `PilotQueryRow`.

### 3. “Fallback activado” sigue siendo demasiado ancho

Agrupa cosas distintas:

- rescates
- no-match
- degradación
- ramas sin ruta clara

Para diagnóstico operativo, conviene separar al menos:

- `Fallback sin cápsula clara`
- `Ruta degradada / error`

### 4. “Consulta política / RAG” necesita framing más conservador

No toda ruta documental es un fallo.

Si se mantiene esa categoría, debe leerse como algo del tipo:

- `Dominio documental / RAG`

y sólo contar cuando realmente desplazó recuperación comercial de producto, no como “miss” automático en cualquier consulta documental válida.

### 5. El panel actual puede sesgarse si se alimenta del log ya filtrado

La lectura dominante de misses no debería recalcularse sobre un subconjunto ya filtrado por bucket.

La fuente del panel debe ser la muestra completa del rango activo, no la vista ya recortada.

## Dirección quirúrgica correcta

Sin abrir arquitectura nueva, la mejora correcta sería:

### A. Endurecer `PilotQueryRow` con campos ya presentes en `ai_logic_debug`

Campos candidatos:

- `gemini_api_error`
- `tool_error_count`
- `sommelier_fallback_reason`
- `out_of_domain`

Esto no requiere nuevas escrituras si el dato ya existe en payload.

### B. Rehacer la taxonomía sobre la muestra completa del rango actual

No sobre el log ya filtrado.

### C. Separar categorías con precedencia conservadora

Orden sugerido:

1. `Ruta degradada / error`
2. `Producto buscado sin cards`
3. `Fallback sin cápsula clara`
4. `UNKNOWN rescatado`
5. `Dominio documental / RAG`
6. `Otro / sin atribución clara`

### D. Mantener categorías sólo si la evidencia lo soporta

Si no hay filtro exacto o no hay campo robusto:

- mostrar la categoría
- pero no fingir precisión
- y no prometer drilldown más fino del que realmente existe

## Lo que no conviene hacer

- no mover `TabAnalytics`
- no abrir un rediseño completo de observabilidad
- no inventar “error path” si el dato no puede sostenerse
- no volver a tocar ownership de telemetría salvo descubrir deriva real
- no convertir señales blandas en causalidad falsa

## Estado práctico

La situación correcta hoy es:

- el panel ya existe
- ya agrega valor operatorio
- pero todavía merece un pass quirúrgico de endurecimiento heurístico

En otras palabras:

> no falta superficie; falta precisión útil de atribución.

## Siguiente paso recomendado

Ejecutar un micro-pass sólo sobre:

- `src/components/admin/cesarin/PilotTelemetry.tsx`
- `src/services/admin/admin-pilot-ops.service.ts`
- y sólo si hace falta, `src/hooks/admin/useAdminPilotOps.ts`

Objetivo:

- hacer que la taxonomía responda mejor “qué está dominando ahora”
- sin tocar arquitectura, tabs, ni telemetría nueva
