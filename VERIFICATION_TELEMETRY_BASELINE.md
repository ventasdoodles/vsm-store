# VERIFICATION GATE — TELEMETRY-PRODUCTION-BASELINE
**Fecha:** 2026-03-20
**Commit verificado:** `f4df963`
**Modo:** READ ONLY — sin edits, sin commits, sin refactor
**Archivo auditado:** `src/services/concierge.service.ts`

---

## VEREDICTO GLOBAL: APROBADO

Lane file-true. Scope-faithful. Sin regresión semántica. Sin scope creep.

---

## 1. QUÉ CAMBIÓ

Verificado línea por línea contra el archivo real en disco:

| Cambio | Líneas | Descripción |
|--------|--------|-------------|
| `logAITelemetry()` añadida | 28-47 | Función async, tipada, fail-silent por diseño |
| `invokeStart` movido pre-try | 68 | Accesible en catch para calcular latencia en error path |
| Telemetría en `product_search_integrity` | 107-120 | `void` antes del return, capsule_match_success: true |
| Telemetría en `knowledge_rag_foundation` | 132-145 | `void` antes del return, capsule_match_success: true |
| Telemetría en `cart_operator` | 156-169 | `void` antes del return, capsule_match_success: true |
| Detección UNKNOWN_CAPSULE + telemetría | 179-195 | `unknownCapsule = data.requires_client_capsule === true` |
| Telemetría en catch con error_type | 210-223 | Antes del throw — TIMEOUT / QUOTA / EDGE_ERROR |

---

## 2. QUÉ QUEDÓ VALIDADO

### Claims del reporte de ejecución — verificados contra archivo

| Claim | Línea(s) | Veredicto |
|-------|----------|-----------|
| Telemetría añadida en concierge.service | 28-47, 107-223 | ✅ FILE-TRUE |
| `invokeStart` accesible en catch | 68 — pre-try | ✅ FILE-TRUE |
| `product_search_integrity` cubierto | 107-120 | ✅ FILE-TRUE |
| `knowledge_rag_foundation` cubierto | 132-145 | ✅ FILE-TRUE |
| `cart_operator` cubierto | 156-169 | ✅ FILE-TRUE |
| UNKNOWN_CAPSULE clasificado | 180 + 194 | ✅ FILE-TRUE |
| Path genérico cubierto | 182-195 | ✅ FILE-TRUE |
| Catch cubierto con error_type | 210-223 | ✅ FILE-TRUE |
| `throw error` preservado en catch | 225 | ✅ FILE-TRUE |
| Return shapes idénticos al original | 121-126, 146-150, 170-175, 196-202 | ✅ FILE-TRUE |
| Telemetría fail-silent | 42-46 (catch vacío interno) | ✅ FILE-TRUE |
| `void` en cada call site | 107, 132, 156, 182, 210 | ✅ FILE-TRUE |
| `useAIConcierge.ts` no tocado | — | ✅ CONFIRMADO |
| Todo fuera de `chat()` intacto | 229-386 | ✅ FILE-TRUE |

---

### Lógica UNKNOWN_CAPSULE — trazada desde el archivo

```
:103  if (data.requires_client_capsule) {
:104    if capsule_name === 'product_search_integrity' → return  ✓ no cae abajo
:129    if capsule_name === 'knowledge_rag_foundation' → return  ✓ no cae abajo
:153    if capsule_name === 'cart_operator'            → return  ✓ no cae abajo
:177  }
:180  const unknownCapsule = data.requires_client_capsule === true
        ↑ si llegó aquí con flag=true, ningún case matcheó
:194  error_type: unknownCapsule ? 'UNKNOWN_CAPSULE' : null
        ↑ clasificación correcta, sin falso positivo posible
```

**Veredicto:** lógica sólida. El único camino para que `unknownCapsule` sea `true` es que `requires_client_capsule` viniera del backend como `true` y que los tres `if` previos hayan fallado. No existe camino alternativo que genere un falso positivo.

---

### Fail-silent — verificado

```
:42  try {
:43    await supabase.from('ai_analytics').insert({ is_simulation: false, ...fields });
:44  } catch {
:45    // silent — telemetry must never block or affect user response
:46  }
```

`catch` vacío en `logAITelemetry` → ningún error de DB sube al caller.
`void` en cada call site → Promise descartada sin await.
**Doble garantía. El usuario nunca es afectado por un fallo de telemetría.**

---

### Re-throw — verificado

```
:203  } catch (error) {
:204    console.error('Concierge Chat Error:', error)
:205    const _errMsg = ...
:206    const _errType = ...
:210    void logAITelemetry({...})   ← fire-and-forget, no bloquea
:224    // SLICE 2D: Re-throw...
:225    throw error                  ← idéntico al original
```

El hook recibe exactamente el mismo error que antes de este commit. La clasificación `_errType` solo alimenta la telemetría — no altera el error que se re-lanza. ✅

---

### Scope externo a `chat()` — intacto

| Método | Líneas | Estado |
|--------|--------|--------|
| `semanticSearch()` | 232-252 | Sin cambio |
| `neuralSearch()` | 258-284 | Sin cambio |
| `updatePreferences()` | 290-314 | Sin cambio |
| `getMyIntelligence()` | 319-336 | Sin cambio |
| `getPersonalizedBanner()` | 338-385 | Sin cambio |

---

## 3. QUÉ SIGUE ABIERTO

Abiertos pre-existentes no creados ni agravados por este commit:

| Open | Origen | Estado |
|------|--------|--------|
| `TabAnalytics.tsx` con datos hardcodeados | Pre-existente | Fuera de scope — correctamente no tocado |
| `cesarin_scenarios.json` — cobertura ~40% | Pre-existente | Fuera de scope |
| Contrato de cápsulas sin versionado | Pre-existente | Fuera de scope |
| Historial de conversación ephemeral | Pre-existente | Fuera de scope |

**Open nuevo detectado en verificación:**

El insert en `ai_analytics` usa campos como `query`, `detected_intent`, `routed_capsule`, `capsule_match_success`, `fallback_used`, `response_latency_ms`, `has_product_cards`, `product_card_count`, `zero_results`, `error_type`. Estos campos no son verificables desde el código cliente — no existe un archivo de schema en el repo que confirme que esas columnas existen en la tabla.

Si la columna no existe en el schema de Supabase, el insert falla silenciosamente (por diseño). El código es correcto — el schema es la única variable no verificada.

**Riesgo:** BAJO — el fallo es silencioso y no afecta al usuario. Pero si el schema no coincide, la telemetría no llega y el baseline no está activo aunque el código esté correcto.

---

## 4. QUÉ SE APRUEBA

- ✅ **TELEMETRY-PRODUCTION-BASELINE: APROBADO** — file-true, scope-faithful
- ✅ `logAITelemetry()` — diseño correcto, tipado, fail-silent garantizado
- ✅ Cobertura de los 5 paths — completa sin excepción
- ✅ UNKNOWN_CAPSULE — clasificación correcta, lógica cerrada
- ✅ Return shapes — preservados sin alteración en los 4 paths de éxito
- ✅ Re-throw — preservado, hook no afectado
- ✅ Scope externo a `chat()` — intacto
- ✅ `useAIConcierge.ts` — no tocado, confirmado

---

## 5. CUÁL ES LA SIGUIENTE JUGADA EXACTA

**Validar schema de `ai_analytics` contra los campos del insert.**

Antes de abrir `ANALYTICS-TAB-ACTIVATION` o declarar telemetría activa con datos reales, verificar en Supabase Dashboard que la tabla tiene estas columnas:

```
is_simulation         boolean
customer_id           uuid / text
query                 text
detected_intent       text
routed_capsule        text
requires_client_capsule boolean
capsule_match_success boolean
fallback_used         boolean
response_latency_ms   integer / bigint
has_product_cards     boolean
product_card_count    integer
zero_results          boolean
error_type            text
```

Si alguna columna falta: crear migración de Supabase para añadirla.
Si todas existen: telemetría está activa desde el primer chat real.
Una sola verificación en el dashboard cierra este open antes de cualquier siguiente carril.

---

*Verificación completada sobre archivo vivo. Sin cambios. Solo lectura.*
*Lane TELEMETRY-PRODUCTION-BASELINE: CERRADO Y APROBADO.*
