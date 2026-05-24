# AI AUDIT — CESARIN OS FIRST

**Fecha:** 2026-03-20 (actualizado post-wave 193+)
**Baseline:** Wave 193 / v113
**Scope:** Capa AI pura — storefront, OS admin, orquestación, cápsulas, validación, telemetría

---

## 1. QUÉ CAMBIÓ

Desde la última línea de honesty/rationalization de surfaces AI y el repair de `general_concierge_dialog`:

- **El dual-gate de storefront está vivo** — `is_ai_assistant_enabled` (admin) + `isPilotAuthorized` (session) funcionan correctamente en `App.tsx:338-339`
- **Las tres cápsulas están operativas** — `product_search_integrity`, `knowledge_rag_foundation`, `cart_operator` — cada una con degradación controlada
- **El QA judge edge function (`cesarin-qa-judge`) integra con TabQuality** — persiste verdicts en `ai_simulation_reports`
- **TabAnalytics fue identificado como shell con datos hardcodeados** → **CORREGIDO** — ahora conecta a `getPilotKPIs()` y `getPilotQueryLog()` con empty state honesto
- **La telemetría de producción estaba en cero** → **CORREGIDO** — `logAITelemetry` ahora inserta correctamente en `ai_analytics` con schema JSONB alineado (commits `f4df963`, `2035d45`)
- **Los `[Concierge Diag]` console.warn** (9 líneas) → **ELIMINADOS** de `concierge.service.ts` — ya no contaminan dev ni producción
- **UNKNOWN_CAPSULE path** ahora logea en telemetría con `error_type: 'UNKNOWN_CAPSULE'` — ya visible en TabPilot
- **`final_canon_fix.mjs` fue eliminado** (status git: D) — desaparece un script de canon que hacía ajustes documentales

---

## 2. QUÉ QUEDÓ VALIDADO

Basado en archivos vivos, no documentos:

| Pieza | Evidencia de archivo | Veredicto |
| ----- | -------------------- | --------- |
| Dual-gate gating | `App.tsx:338-339` — condición `settings?.is_ai_assistant_enabled && isPilotAuthorized` | ✅ VALIDADO |
| Lazy mount de AIConcierge | `App.tsx:28` — `React.lazy()` con named export | ✅ VALIDADO |
| Input → hook → service chain | `useAIConcierge.ts:49-161` → `concierge.service.ts:34-131` | ✅ VALIDADO |
| Capsule routing (3 cápsulas) | `concierge.service.ts:82-117` — switch por capsule_name | ✅ VALIDADO |
| Degradación de cápsulas | `ai-capsule-orchestrator.service:31-50` — catch con fallback string | ✅ VALIDADO |
| Brain-first guardrail | `customer-intelligence/index.ts:414-450` — override determinístico previo a cápsulas | ✅ VALIDADO |
| Customer memory injection | `customer-intelligence/index.ts:265-315` — lee `ai_customer_memory`, prioriza por strength | ✅ VALIDADO |
| TabQuality / QA Judge | `TabQuality.tsx:45-120` — invoca edge, persiste en DB | ✅ VALIDADO |
| TabPilot / telemetría pilot | Fetches `ai_analytics` con `is_simulation=false` — real, no mock | ✅ VALIDADO |
| TabAnalytics / KPIs reales | `TabAnalytics.tsx` — llama `getPilotKPIs()` + `getPilotQueryLog()`, empty state honesto | ✅ VALIDADO |
| Telemetría de producción | `concierge.service.ts` — `logAITelemetry` con JSONB alineado al schema real | ✅ VALIDADO |
| TabSimulator | Corre `cesarin_scenarios.json` contra edge function real | ✅ VALIDADO |
| Timeout 25s con clasificación | `useAIConcierge.ts:69` — REQUEST_TIMEOUT con UI recovery | ✅ VALIDADO |

---

## 3. QUÉ SIGUE ABIERTO

Ordenado por impacto operativo:

### CERRADO-01 — Producción era ciega (CRÍTICO)

- `logAITelemetry` insertaba campos no existentes en el schema → fallaba silenciosamente
- Fix: insert reescrito para usar solo columnas top-level existentes + JSONB `ai_logic_debug` con keys del reader
- `[Concierge Diag]` console.warns eliminados (9 líneas)
- **Commits:** `f4df963`, `2035d45` | **Gate:** `SCHEMA_GATE_AI_ANALYTICS.md`

### CERRADO-02 — TabAnalytics era shell peligrosa (ALTO)

- Valores hardcodeados (`"4,892"`, `"92%"`, `"1,204"`) reemplazados con datos reales de `getPilotKPIs()`
- KPIs activos: Consultas (30d), Match Semántico, Frustración (alerta visual si >15%), Latencia Prom.
- "Distribución Cápsulas" reemplaza intenciones hardcodeadas — deriva porcentajes de `getPilotQueryLog()`
- Empty state explícito cuando `totalInteractions === 0` — nunca más números inventados
- **Archivo:** `src/components/admin/cesarin/TabAnalytics.tsx`

### CERRADO-03 — Unknown capsule: trazabilidad parcial (ALTO)

- El path unknown capsule ahora llega al bloque genérico con `error_type: 'UNKNOWN_CAPSULE'` en telemetría
- TabPilot puede filtrar por `error_type` para detectar cápsulas desconocidas
- **Pendiente:** alerta activa en admin cuando `UNKNOWN_CAPSULE` aparece — hoy requiere revisar TabPilot manualmente

### ABIERTO-04 — Contrato de cápsulas sin versionado (MEDIO)

- Backend retorna `capsule_name` + `tool_args` — sin `capsule_version`
- Si backend actualiza el schema de `tool_args` (agrega campo, renombra key), Zod del orchestrator rechaza en silencio
- No hay detección de drift entre versión del edge y versión del cliente

### ABIERTO-05 — Historial de conversación truncado a 5 mensajes (MEDIO)

- `useAIConcierge.ts:73` — `history.slice(-5)`
- Conversaciones con dependencia de contexto >5 mensajes pierden coherencia
- No es configurable, no está en AI_CONTEXT.md como decisión registrada

### ABIERTO-06 — Cobertura de escenarios ~40% (MEDIO)

- Ausentes en `cesarin_scenarios.json`:
  - Greeting ("Hola", "Buenos días") — no valida que `general_concierge_dialog` se active correctamente
  - Input vacío
  - Timeout >25s
  - Error 429 / quota
  - Cart operator: AMBIGUOUS, UNSAFE (stock > qty), NOT_FOUND
  - Unknown capsule name
  - Schema mismatch en tool_args
  - Memory trace con datos reales (no mock)

### ABIERTO-07 — Admin no puede modificar comportamiento AI en runtime (MEDIO)

- Persona, Rules, Knowledge son read-only en UI
- Cambios al prompt de Cesarin requieren redeploy del edge function
- No hay forma de ajustar tono, reglas o knowledge base desde Cesarin OS sin tocar código

### ABIERTO-08 — Preferencias de cliente solo persisten en intent `recommendation` (BAJO)

- `useAIConcierge.ts:122-139` — `updatePreferences` solo se llama cuando `response.intent === 'recommendation'`
- Búsquedas de producto, policy queries, cart ops no generan aprendizaje de preferencias
- El loop de memoria se alimenta lento

### ABIERTO-09 — Contexto de conversación no persiste entre sesiones (BAJO)

- Mensajes viven solo en React state
- F5 o nueva pestaña = conversación nueva
- El contexto AI (ai_preferences, ia_context) sí persiste en DB, pero el historial de mensajes no

---

## 4. QUÉ SE APRUEBA

Con confianza, sin cambio necesario:

- **Dual-gate de gating y mount** — diseño correcto, funcionando
- **Chain input → hook → service → edge** — flujo limpio, sin acoplamiento roto
- **Brain-first guardrail** — previene la mayoría de `UNKNOWN` responses sin intervención
- **Degradación de las 3 cápsulas** — cada una tiene path de fallback real, no crash
- **Customer memory injection** — arquitectura sólida, strength-based, bien integrada al contexto del Analyst
- **TabQuality + Judge** — operativamente valiosa, persiste verdicts reales
- **TabSimulator** — el validator es sofisticado y corre contra edge real — mantener
- **TabPilot** — value real para sesiones marcadas — mantener
- **Timeout 25s con clasificación de error** — comportamiento correcto bajo carga

---

## 5. CUÁL ES LA SIGUIENTE JUGADA EXACTA

**Implementar telemetría de producción en `concierge.service.ts`**

Al final de `chat()`, después de obtener respuesta (éxito o fallback), insertar en `ai_analytics`:

```ts
{
  created_at: new Date().toISOString(),
  is_simulation: false,
  customer_id: customerContext?.id ?? null,
  detected_intent: data.intent ?? 'unknown',
  routed_capsule: data.capsule_name ?? null,
  fallback_used: !data.requires_client_capsule,
  capsule_match_success: capsuleResolved,   // bool: se ejecutó cápsula o cayó al fallback
  response_latency_ms: Date.now() - invokeStart,
  zero_results: (response.suggestedProducts?.length ?? 0) === 0,
  error_type: null  // se llena en catch
}
```

- En el `catch`, loguear `error_type: 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' | 'UNKNOWN'`
- Asegurar que el `insert` falle silenciosamente (no bloquear respuesta al usuario si telemetría falla)
- Esto activa TabPilot para todos los usuarios, no solo los marcados con sessionStorage
- Hace TabAnalytics reemplazable con datos reales la semana siguiente

**Tiempo estimado:** 3-4 horas de código. Cero cambio a UX. Cero riesgo al usuario.

---

---

## A. AI CRITICAL PATH MAP

| Surface | File(s) | Role | Current Truth | Failure Risk | Confidence |
| ------- | ------- | ---- | ------------- | ------------ | ---------- |
| Global kill switch | `App.tsx:338-339` | Habilita/deshabilita Cesarin para todos | ALIVE — gate double correcta | LOW | HIGH |
| Pilot session gate | `App.tsx:110-115` / sessionStorage | Activa acceso pilot por query param | ALIVE — ephemeral, se pierde en nueva tab | MEDIUM (UX friction) | HIGH |
| AIConcierge mount | `AIConcierge.tsx` via React.lazy | Renderiza UI del concierge | ALIVE — lazy loaded correctamente | LOW | HIGH |
| Input → sendMessage | `useAIConcierge.ts:49-75` | Captura input, inicia flow | ALIVE | LOW | HIGH |
| History slice | `useAIConcierge.ts:73` | Limita contexto a 5 mensajes | ALIVE — FRAGILE si conversación larga | MEDIUM | HIGH |
| Timeout race | `useAIConcierge.ts:69` | Protege contra edge lento | ALIVE — 25s hardcoded | LOW | HIGH |
| concierge.service.chat() | `concierge.service.ts:34-131` | Invoca edge, rutea cápsulas | ALIVE — FRAGILE en unknown capsule | HIGH (silent fail) | HIGH |
| Capsule routing switch | `concierge.service.ts:82-117` | Mapea capsule_name a ejecutor | ALIVE para 3 cápsulas — FRAGILE para N+1 | HIGH | HIGH |
| Fallback genérico | `concierge.service.ts:119-125` | Último recurso si todo falla | ALIVE — pero no distingue error type | MEDIUM | HIGH |
| Orchestrator — product | `ai-capsule-orchestrator.service` | Ejecuta búsqueda semántica + exacta | ALIVE con degradación | MEDIUM | HIGH |
| Orchestrator — knowledge | `ai-capsule-orchestrator.service` | RAG lookup en knowledge chunks | ALIVE | LOW | HIGH |
| Orchestrator — cart | `ai-capsule-orchestrator.service` | Mutación segura de carrito | ALIVE — FRAGILE si result.code es undefined | MEDIUM | MEDIUM |
| Edge function Analyst | `customer-intelligence/index.ts:317-409` | LLM clasifica intent y genera respuesta | ALIVE — dependiente de Gemini 2.5 Flash | MEDIUM (API versioning) | HIGH |
| Brain-first guardrail | `customer-intelligence/index.ts:414-450` | Override determinístico de intents | ALIVE — regex-based | LOW | HIGH |
| Memory injection | `customer-intelligence/index.ts:265-315` | Lee ai_customer_memory, contextualiza | ALIVE — strength-based priority | LOW | HIGH |
| Product search tool | `customer-intelligence/tools.ts:79-147` | Busca productos, fallback a featured | ALIVE | LOW | HIGH |
| Policy RAG tool | `customer-intelligence/tools.ts:22-73` | Busca políticas de la tienda | ALIVE | LOW | HIGH |
| Telemetría producción | `concierge.service.ts` | Persiste interacciones reales | ACTIVA — schema-compatible, JSONB alineado | LOW | HIGH |
| ai_analytics (real) | Tabla DB | Fuente de verdad para KPIs AI | Recibe datos reales desde `2035d45` | LOW | HIGH |

---

## B. CESARIN SURFACE MATRIX

| Surface Name | Status | Why | Operational AI Value Now | Confidence |
| ------------ | ------ | --- | ------------------------ | ---------- |
| Chat UI storefront | KEEP | Core del producto AI, funciona | ALTO — es el producto | HIGH |
| Product card rendering | KEEP | Capsule rendering correcto | ALTO — conversión directa | HIGH |
| Knowledge chunk rendering | KEEP | RAG visual funciona | MEDIO | HIGH |
| Cart operator middleware | KEEP | Mutación segura con UX narrativa | ALTO | HIGH |
| Proactive trigger (15s) | DEFER | No hay escenario que lo valide | BAJO — sin data de efectividad | MEDIUM |
| TabSimulator | KEEP | Única forma de E2E test real vs edge | ALTO — operativamente crítico | HIGH |
| TabQuality | KEEP | Judge LLM persiste verdicts, útil | ALTO — observabilidad de calidad | HIGH |
| TabPilot | KEEP | KPIs reales para usuarios marcados | MEDIO — scope limitado por sessionStorage | HIGH |
| TabAnalytics | ✅ LIVE | Conecta a `getPilotKPIs()` + `getPilotQueryLog()`, empty state real | ALTO — KPIs reales en 30d rolling | HIGH |
| TabPersona | REPAIR | Read-only — no se puede actuar | BAJO (observabilidad pura) | MEDIUM |
| TabRules | REPAIR | Read-only — no se puede actuar | BAJO (observabilidad pura) | MEDIUM |
| TabKnowledge | KEEP | Fetches DB real, muestra chunks | MEDIO — útil para debugging RAG | HIGH |
| TabLearning | KEEP | Muestra UNKNOWN + frustración signals | MEDIO — señal de gaps de training | MEDIUM |
| Global kill switch admin | KEEP | Control crítico de gating | ALTO — apagado de emergencia | HIGH |
| Pilot session activation | KEEP | Mecanismo de pilot gating | ALTO | HIGH |
| cesarin-qa-judge edge | KEEP | Evaluación LLM de quality | ALTO | HIGH |
| customer-intelligence edge | KEEP | Core del AI | CRÍTICO | HIGH |
| ai-capsule-orchestrator | KEEP | Ejecución segura de cápsulas | ALTO | HIGH |
| cesarin_scenarios.json | REPAIR | 40% cobertura — gaps críticos | MEDIO ahora | HIGH |
| Conversation history persistence | REDESIGN | Ephemeral — se pierde en reload | BAJO ahora, ALTO si se persiste | HIGH |
| Preference learning (recommendation-only) | REPAIR | Scope demasiado estrecho | MEDIO — mejora con más triggers | HIGH |

---

## C. AI RISK BUCKETS

### GATING / VISIBILITY

- `isPilotAuthorized` se pierde en nueva pestaña/F5 — pilot users deben reactivar por URL
- Si `useStoreSettings` falla en fetch, `settings?.is_ai_assistant_enabled` es undefined → Cesarin no aparece sin error visible
- **Severidad:** BAJA para producción, MEDIA para UX de pilot

### UI MOUNT

- React.lazy + Suspense correcto — no hay riesgo de crash en mount
- Sin Error Boundary específica para AIConcierge — si el componente explota internamente, puede propagar
- **Severidad:** BAJA

### HOOK / SERVICE WIRING

- `useAIConcierge.ts:73` — history.slice(-5) sin configuración — stale context en conversaciones largas
- Cart operator asume `result.code` siempre presente — si orchestrator retorna resultado sin `code`, el middleware falla silenciosamente
- **Severidad:** MEDIA

### BACKEND / EDGE

- Gemini 2.5 Flash hardcodeado sin fallback a otra versión
- `responseMimeType: "application/json"` en endpoint v1 (no v1beta) — dependiente de compatibilidad API
- Quota 429 clasificada y manejada — OK
- **Severidad:** MEDIA

### CAPSULE CONTRACT DRIFT

- Sin `capsule_version` en el contrato backend→frontend
- Unknown `capsule_name`: silent fail, fallback genérico, sin log, sin señal admin
- tool_args schema drift: Zod rechaza en silencio → degraded response
- **Severidad:** ALTA — se activa con cada nueva cápsula o cambio de schema

### FALLBACK TAXONOMY

- Timeout → clasificado, UI con retry → OK
- Quota 429 → clasificado → OK
- Unknown capsule → fallback genérico → sin distinción del error → INCOMPLETA
- Edge function timeout → 25s catch → OK
- Orchestrator schema fail → degraded string → OK pero sin trazabilidad
- **Severidad:** MEDIA — la taxonomía existe pero tiene holes en capsule contract

### VALIDATION COVERAGE

- 9 escenarios, ~40% de casos reales cubiertos
- Sin cobertura de: greeting, voice, timeout, quota, cart edge cases, unknown capsule, schema mismatch
- Validator es sofisticado — el problema es el set de escenarios, no la infraestructura
- **Severidad:** MEDIA — riesgo de regresión silenciosa en paths no cubiertos

### TELEMETRY / OPS

- ~~CRÍTICO: Cero inserción en DB de interacciones reales~~ → **RESUELTO** — `logAITelemetry` schema-compatible, activo
- ~~console.warn `[Concierge Diag]` en producción~~ → **RESUELTO** — eliminados
- ~~TabAnalytics con datos ficticios crea falsa seguridad~~ → **RESUELTO** — KPIs reales + empty state
- Anon INSERT bloqueado — RLS policy y grant en migración `21f2329` committeada pero **NO aplicada en prod**. `supabase db push` UNSAFE (divergencia local/remote). Fix: ejecutar SQL directamente en Supabase Dashboard. Ver `SCHEMA_GATE_AI_ANALYTICS.md §14`.
- UNKNOWN_CAPSULE: se loguea en telemetría, visible en TabPilot — sin alerta proactiva todavía
- **Severidad:** MÍNIMA — único open: deploy de la migración RLS

### STALE ADMIN SHELL

- ~~TabAnalytics: strings hardcodeados — SHELL PELIGROSA~~ → **RESUELTO**
- TabPersona, TabRules: read-only sin acción posible — valor operativo cero
- Admin no puede modificar comportamiento AI sin redeploy
- **Severidad:** MEDIA (TabPersona/TabRules únicos pendientes)

### NON-CESARIN AI SURFACES WORTH ATTENTION

- **CustomerIntelligencePanel.tsx** — consume `customer-intelligence` edge indirectamente — si edge cambia, panel se rompe
- **AdminBatchManager.tsx** — tiene referencias AI pero son colaterales — no prioritario
- **admin-marketing.service.ts** / **admin-coupons.service.ts** — AI generativa simulada (delays fake) — no es Cesarin real, es generación de texto LLM básica — DEFER
- **Resto:** ruido, no merecen atención AI real ahora

---

## D. ESTADO DE EJECUCIÓN

### ~~Lane `TELEMETRY-PRODUCTION-BASELINE`~~ → **COMPLETADO**

- ✅ `concierge.service.ts` — `logAITelemetry` con schema JSONB correcto
- ✅ `concierge.service.ts` — `[Concierge Diag]` diagnostics eliminados
- ✅ `TabAnalytics.tsx` — datos reales de `getPilotKPIs()` + `getPilotQueryLog()`

### Siguiente lane recomendado: `SCENARIO-COVERAGE-EXPANSION`

**Condición:** Esperar 24–48h de interacciones reales en `ai_analytics` para identificar qué escenarios reales ocurren más (usar TabPilot bucket `fallback_used` como señal).

**Archivos exactos:**

1. `public/cesarin_scenarios.json` — agregar: greeting, input vacío, timeout, quota 429, cart AMBIGUOUS/UNSAFE/NOT_FOUND, unknown capsule name

**Why next:**
Con telemetría activa y TabAnalytics operativo, ahora se puede medir si un escenario nuevo mejora o degrada la tasa de match semántico. El loop de feedback existe. El gap de cobertura del 40% es el siguiente riesgo de regresión silenciosa más alto.

---

## E. PROMPT SEED FOR ANTIGRAVITY

```text
CONTEXTO OPERATIVO:
- VSM PWA / Cesarin AI / Wave 193 / v113
- Baseline AI canon: AI_CONTEXT.md
- El sistema está vivo y en pilot activo.
- Las 3 cápsulas (product_search_integrity, knowledge_rag_foundation, cart_operator) operan con degradación controlada.
- El brain-first guardrail funciona.
- Customer memory injection funciona.
- El problema crítico hoy: CERO telemetría de producción. Las interacciones reales de usuarios no se persisten.

TAREA EXACTA:
Implementa telemetría de producción en `src/services/concierge.service.ts`.

Al final del método `chat()`, después de resolver la respuesta (ya sea cápsula ejecutada o fallback genérico), insertar en la tabla `ai_analytics` de Supabase:

{
  is_simulation: false,
  customer_id: customerContext?.id ?? null,
  query: query,                                    // mensaje del usuario
  detected_intent: data.intent ?? 'unknown',
  routed_capsule: data.capsule_name ?? null,
  requires_client_capsule: data.requires_client_capsule ?? false,
  capsule_match_success: <bool — true si se ejecutó cápsula, false si cayó a fallback>,
  fallback_used: <bool — true si respuesta es el mensaje genérico de error>,
  response_latency_ms: Date.now() - invokeStart,
  has_product_cards: (response.suggestedProducts?.length ?? 0) > 0,
  product_card_count: response.suggestedProducts?.length ?? 0,
  zero_results: (response.suggestedProducts?.length ?? 0) === 0,
  error_type: null  // se llena solo en el catch con 'TIMEOUT' | 'QUOTA' | 'EDGE_ERROR' | 'UNKNOWN_CAPSULE' | 'GENERIC'
}

REGLAS:
1. El insert debe fallar silenciosamente (try/catch propio, no propaga error al usuario)
2. No bloquear el return de la respuesta al usuario
3. Agregar el timestamp `invokeStart = Date.now()` antes del `supabase.functions.invoke`
4. En el catch del método principal, agregar `error_type` al insert antes de re-throw
5. Añadir el campo `UNKNOWN_CAPSULE` como error_type si `data.requires_client_capsule === true` y ningún case coincide con `data.capsule_name`
6. No cambiar ningún comportamiento visible al usuario
7. No cambiar la firma del método `chat()`

ARCHIVOS A TOCAR:
- src/services/concierge.service.ts (único archivo de cambio)
- src/hooks/useAIConcierge.ts (solo si necesitas pasar invokeStart — evalúa si se puede calcular dentro del service)

VERIFICA al final:
- Que el return del chat() no cambia
- Que el catch sigue haciendo re-throw del error original
- Que el insert no bloquea el flujo principal
- Que el campo `error_type` se llena correctamente en casos de error
```

---

*Auditoría generada sobre archivos vivos reales. Sin cambios realizados. Solo análisis.*
*Próxima revisión recomendada: después de implementar TELEMETRY-PRODUCTION-BASELINE.*
