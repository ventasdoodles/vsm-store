# EXECUTION — TELEMETRY-PRODUCTION-BASELINE
**Fecha:** 2026-03-20
**Commit:** `f4df963`
**Lane:** TELEMETRY-PRODUCTION-BASELINE
**Baseline:** Wave 193 / v113

---

## STATUS: COMPLETADO

| Item | Estado |
|------|--------|
| Archivo modificado | `src/services/concierge.service.ts` |
| Archivo secundario | `src/hooks/useAIConcierge.ts` — NO TOCADO |
| UX changes | NINGUNO |
| Return shapes alterados | NINGUNO |
| Re-throw behavior | PRESERVADO |
| Commit | `f4df963` |

---

## 1. ARCHIVOS MODIFICADOS

### `src/services/concierge.service.ts`
- `+104 líneas / -7 líneas`
- Un único archivo. Quirúrgico.

### `src/hooks/useAIConcierge.ts`
- No tocado.
- La latencia se calcula dentro del service con `invokeStart` (movido antes del `try{}`), sin necesidad de handoff desde el hook.

---

## 2. QUÉ SE AÑADIÓ

### Función `logAITelemetry()` — líneas 28-47

```typescript
async function logAITelemetry(fields: {
    customer_id: string | null;
    query: string;
    detected_intent: string | null;
    routed_capsule: string | null;
    requires_client_capsule: boolean;
    capsule_match_success: boolean;
    fallback_used: boolean;
    response_latency_ms: number;
    has_product_cards: boolean;
    product_card_count: number;
    zero_results: boolean;
    error_type: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' | 'UNKNOWN_CAPSULE' | null;
}): Promise<void> {
    try {
        await supabase.from('ai_analytics').insert({ is_simulation: false, ...fields });
    } catch {
        // silent — telemetry must never block or affect user response
    }
}
```

**Garantías de diseño:**
- `void` en cada call site — fire-and-forget, no bloquea el return
- `try/catch` interno — fallo del insert nunca llega al usuario
- `is_simulation: false` hardcodeado — separa interacciones reales de simulaciones del admin

---

## 3. CAMPOS DE TELEMETRÍA

| Campo | Fuente | Notas |
|-------|--------|-------|
| `is_simulation` | `false` hardcoded | Siempre false en este path |
| `customer_id` | `customerProfile?.id ?? null` | null si usuario anónimo |
| `query` | parámetro de `chat()` | Texto crudo del usuario |
| `detected_intent` | `data.intent` del edge / hardcoded por cápsula | null en catch |
| `routed_capsule` | nombre de cápsula o null | En UNKNOWN_CAPSULE: el nombre que llegó del backend |
| `requires_client_capsule` | `data.requires_client_capsule ?? false` | Flag del backend |
| `capsule_match_success` | `true` solo en las 3 cápsulas conocidas | `false` en generic y catch |
| `fallback_used` | `true` en path genérico y catch | `false` en cápsulas exitosas |
| `response_latency_ms` | `Date.now() - invokeStart` | Desde inicio del invoke hasta return |
| `has_product_cards` | `product_card_count > 0` | Derivado |
| `product_card_count` | `resolved_products?.length ?? 0` | 0 para RAG y cart |
| `zero_results` | `product_card_count === 0` | Útil para detectar regresiones de búsqueda |
| `error_type` | clasificado en catch / `UNKNOWN_CAPSULE` en generic | `null` en éxito |

---

## 4. PATHS DE INSERCIÓN

### Path 1 — Cápsula `product_search_integrity`
- `capsule_match_success: true`
- `fallback_used: false`
- `has_product_cards` / `product_card_count` / `zero_results` calculados desde `capsuleContract.resolved_products`
- `error_type: null`
- El `void logAITelemetry(...)` se ejecuta **antes** del `return` — latencia incluye ejecución de cápsula

### Path 2 — Cápsula `knowledge_rag_foundation`
- `capsule_match_success: true`
- `fallback_used: false`
- `has_product_cards: false`, `product_card_count: 0` — RAG no retorna product cards
- `error_type: null`

### Path 3 — Cápsula `cart_operator`
- `capsule_match_success: true`
- `fallback_used: false`
- `has_product_cards: false`, `product_card_count: 0`
- `error_type: null`

### Path 4 — Generic fallback (texto plano / UNKNOWN_CAPSULE)
- `capsule_match_success: false`
- `fallback_used: true`
- **Detección de UNKNOWN_CAPSULE:**
  ```typescript
  const unknownCapsule = data.requires_client_capsule === true;
  // Si llegamos aquí con requires_client_capsule=true,
  // significa que ningún case del switch matcheó — capsule desconocida
  error_type: unknownCapsule ? 'UNKNOWN_CAPSULE' : null
  routed_capsule: unknownCapsule ? (data.capsule_name ?? null) : null
  ```
- Antes de este cambio: **silent fail total** — el usuario recibía "Lo siento..." sin ningún rastro en DB

### Path 5 — Catch block (errores de edge / runtime)
- `capsule_match_success: false`
- `fallback_used: true`
- Clasificación de `error_type`:
  ```typescript
  _errMsg === 'REQUEST_TIMEOUT'                              → 'TIMEOUT'
  _errMsg.includes('429') || includes('RESOURCE_EXHAUSTED') → 'QUOTA'
  default                                                    → 'EDGE_ERROR'
  ```
- `void logAITelemetry(...)` se ejecuta **antes** del `throw error` — re-throw preservado intacto
- El hook sigue recibiendo el error original, clasifica y muestra Retry UI igual que antes

---

## 5. CAMBIO ESTRUCTURAL: `invokeStart` movido

**Antes (línea 48 dentro de `try`):**
```typescript
try {
    const invokeStart = Date.now(); // no accesible en catch
```

**Después (línea 68 antes de `try`):**
```typescript
const invokeStart = Date.now(); // accesible en try Y en catch
try {
```

Sin este cambio, el catch block no podría calcular `response_latency_ms`. Es el único cambio estructural al método, y no afecta ningún comportamiento.

---

## 6. QUÉ NO SE TOCÓ — INTENCIONALMENTE

| Elemento | Razón |
|----------|-------|
| Lógica de routing de cápsulas | Sin cambio — misma semántica |
| Shapes de `return` | Idénticos — el hook recibe lo mismo |
| Re-throw en catch | Preservado — hook clasifica y muestra Retry UI |
| `console.warn` de diagnóstico | Se mantienen — Terser los elimina en build |
| `useAIConcierge.ts` | Sin necesidad — latencia se calcula en el service |
| `TabAnalytics.tsx` | Fuera de scope — siguiente carril |
| `cesarin_scenarios.json` | Fuera de scope |
| Capsule versioning | Fuera de scope |

---

## 7. POR QUÉ ESTO IMPORTA

### Antes de este commit
```
Usuario envía "busco vape barato"
    → edge function responde
    → concierge.service retorna
    → hook renderiza
    → NADA en DB
    → Operador: ciego total
```

### Después de este commit
```
Usuario envía "busco vape barato"
    → edge function responde
    → concierge.service retorna
    → void logAITelemetry() inserta en ai_analytics (async, no bloquea)
    → DB recibe: query, intent, capsule, latency, zero_results, etc.
    → Operador: puede ver en TabPilot qué pasó
```

### Escenario UNKNOWN_CAPSULE — antes vs. después
**Antes:** Backend lanza cápsula nueva → frontend no la reconoce → usuario ve "Lo siento..." → **operador nunca lo sabe**

**Después:** Backend lanza cápsula nueva → frontend no la reconoce → usuario ve "Lo siento..." → **fila en ai_analytics con `error_type: UNKNOWN_CAPSULE` y el `routed_capsule` que llegó del backend** → operador lo detecta en TabPilot el mismo día

---

## 8. COMMIT

```
f4df963
feat(telemetry): implement production AI interaction logging in concierge.service

Adds logAITelemetry() — a fire-and-forget insert into ai_analytics — at every
return path of chat(): product_search_integrity capsule, knowledge_rag_foundation
capsule, cart_operator capsule, generic fallback, and catch block.

Fields logged: is_simulation, customer_id, query, detected_intent, routed_capsule,
requires_client_capsule, capsule_match_success, fallback_used, response_latency_ms,
has_product_cards, product_card_count, zero_results, error_type.

UNKNOWN_CAPSULE error_type fires when backend signals requires_client_capsule=true
but no client case matches — previously a silent fail with no observable signal.

invokeStart moved before try{} to ensure latency is available in catch block.
Telemetry failures are caught and swallowed — user response is never blocked.
No UX changes. No hook changes. useAIConcierge.ts untouched.
```

---

## 9. SIGUIENTE CARRIL RECOMENDADO

Con telemetría activa, el siguiente movimiento de mayor valor es:

**`ANALYTICS-TAB-ACTIVATION`** — Conectar `TabAnalytics.tsx` a datos reales de `ai_analytics`.

Reemplazar los strings hardcodeados (`"4,892 consultas"`, `"92% sentimiento"`) con queries reales a la tabla que ahora tiene datos. Estimado: 2-3 horas. Sin riesgo para el usuario.

**No abrir ese carril hasta que haya al menos 24h de datos reales en `ai_analytics` desde interacciones de pilot.** Primero dejar que la telemetría acumule señal.

---

*Lane cerrado. Un archivo. Un commit. Sin UX changes. Cesarin ahora deja rastro.*
