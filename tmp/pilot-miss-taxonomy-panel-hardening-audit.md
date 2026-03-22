# Pilot Miss Taxonomy Panel Hardening Audit

## 1. CURRENT TAXONOMY — WHAT IS WORKING

- El panel ya existe dentro de `src/components/admin/cesarin/PilotTelemetry.tsx`.
- Ya está en la superficie correcta: observabilidad viva del piloto.
- Dos categorías actuales sí son suficientemente fuertes para conservarse:
  - `Producto sin resultado`
  - `Rescue guardrail`
- Son fuertes porque ya están soportadas por condiciones robustas derivadas de telemetría:
  - `product_search_integrity + 0 cards`
  - `raw_analyst_intent === UNKNOWN` con cápsula rescatada
- El panel ya aporta lectura operativa real; el gap ya no es ausencia de superficie.

## 2. CURRENT TAXONOMY — WHAT IS TOO COARSE / MISLEADING

- Mezcla causas con síntomas.
  - Más causales:
    - `Producto sin resultado`
    - `Rescue guardrail`
  - Más sintomáticas:
    - `Señal de frustración`
    - `Sin cápsula asignada`
- `Fallback activado` es demasiado ancho.
  - Hoy mezcla rescates, degradación, no-match y fallback sin ruta clara.
- `Consulta política / RAG` está demasiado suelta como categoría de miss.
  - Hoy describe una clase de ruteo, no necesariamente un fallo.
- `Sin cápsula asignada` es una señal débil.
  - Se deriva del log cargado, no de KPI agregado completo.
- `Señal de frustración` no debería competir con categorías de atribución primaria.

## 3. FIELDS ALREADY AVAILABLE BUT NOT YET EXPOSED CLEANLY

Campos ya disponibles en payload existente y ya expuestos en el worktree actual de `src/services/admin/admin-pilot-ops.service.ts`:

- `gemini_api_error`
- `tool_error_count`
- `sommelier_fallback_reason`
- `out_of_domain`

Campo ya disponible en `src/hooks/admin/useAdminPilotOps.ts` para evitar sesgo por subconjunto filtrado:

- `rawQueryLog`

Estos campos alcanzan para endurecer la atribución sin nuevas escrituras.

## 4. EXACT CATEGORY MODEL YOU RECOMMEND NEXT

Modelo recomendado para el micro-pass:

- `Producto buscado sin cards`
  - Miss duro de búsqueda comercial.
- `UNKNOWN rescatado`
  - Clase de recovery importante para operación.
- `Ruta degradada / error`
  - Sólo si hay soporte conservador con campos ya existentes.
- `Fallback sin cápsula clara`
  - Cuando hubo fallback pero no quedó una ruta operativa bien atribuible.
- `Dominio documental / RAG`
  - Como clase de dominancia/ruteo, no como fallo universal.
- `Otro / sin atribución clara`
  - Sólo residual.

## 5. CATEGORY PRECEDENCE ORDER

Usar precedencia por primer match, en este orden:

1. `Ruta degradada / error`
2. `Producto buscado sin cards`
3. `Fallback sin cápsula clara`
4. `UNKNOWN rescatado`
5. `Dominio documental / RAG`
6. `Otro / sin atribución clara`

Razonamiento:

- la degradación/error debe ganar primero porque explica mejor la rareza downstream
- el miss comercial duro debe ganar sobre fallback genérico
- el fallback sin ruta clara debe aplicarse sólo cuando no exista categoría más fuerte
- RAG/documental debe quedar tarde y ser conservador

## 6. WHAT SHOULD BE RENAMED / SPLIT / DEMOTED

Renombrar:

- `Producto sin resultado` -> `Producto buscado sin cards`
- `Consulta política / RAG` -> `Dominio documental / RAG`
- `Rescue guardrail` -> `UNKNOWN rescatado`

Separar:

- `Fallback activado`
  - en `Ruta degradada / error`
  - y `Fallback sin cápsula clara`

Degradar a señales secundarias:

- `Señal de frustración`
- `Sin cápsula asignada`

Si siguen mostrándose, deben ir fuera del bloque primario de atribución.

## 7. WHAT MUST BE COMPUTED FROM FULL ACTIVE-RANGE SAMPLE

La taxonomía debe calcularse con la muestra completa del rango activo, no con el subset ya filtrado por bucket.

Riesgo actual:

- `PilotTelemetry` recibe `queryLog`
- `queryLog` en `useAdminPilotOps` ya está filtrado por `activeBucket`
- entonces el panel puede sesgarse al cambiar filtros

Corrección mínima:

- usar `rawQueryLog` para construir la taxonomía
- mantener `queryLog` sólo para la tabla filtrable de interacciones

## 8. MINIMUM IMPLEMENTATION SURFACE FOR ANTY

Superficie mínima:

- `src/components/admin/cesarin/PilotTelemetry.tsx`
- `src/services/admin/admin-pilot-ops.service.ts`
- `src/hooks/admin/useAdminPilotOps.ts` sólo para asegurar acceso al log completo si hace falta

No se justifica tocar:

- tabs
- arquitectura de observabilidad
- telemetría write-path
- admin shell general

## 9. ACCEPTANCE CRITERIA FOR THE MICRO-PASS

- El panel sigue viviendo dentro de `PilotTelemetry`.
- La lectura primaria responde claramente:
  - “qué tipo de miss está dominando ahora”
- Las categorías primarias dejan de mezclar causas con síntomas.
- `Fallback activado` deja de existir como bucket sobredimensionado único.
- `Ruta degradada / error` sólo aparece si está soportada por campos reales ya existentes:
  - `gemini_api_error`
  - `tool_error_count`
  - o equivalente explícito ya presente
- `Dominio documental / RAG` queda enmarcado como dominancia/ruteo, no como miss automático.
- La taxonomía se calcula desde la muestra completa del rango activo.
- Las señales débiles, si permanecen, quedan claramente secundarias.
- No se agregan nuevas escrituras de telemetría.
- No hay nuevas tabs, ni relocalización del panel, ni rediseño general.

## Bottom line

El siguiente micro-pass no debe “crear” una nueva superficie.

Debe:

- mantener el panel actual
- endurecer la disciplina de atribución
- separar causas de señales
- y calcular la lectura dominante sobre la muestra completa del rango activo

Ese es el pass más pequeño y de mayor valor para Anty.
