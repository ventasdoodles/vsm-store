# CHIT_CHAT / UNKNOWN INTENT QUALITY AUDIT — Cesarin Cold Audit

**Fecha:** 2026-03-20
**Tipo:** Read-only audit — dialog quality + intent classification coverage
**Scope:** `persona.ts` (Sommelier rules), `index.ts` (Analyst + guardrails), live `ai_analytics` telemetry

---

## VEREDICTO EJECUTIVO

**CHIT_CHAT explicitness no es el próximo lane de mayor valor.**

El GREETING path está funcionando. El gap real es el cluster `UNKNOWN` del Analyst — aproximadamente
30% de las interacciones en producción donde el Analyst no clasifica el intent, el Sommelier
responde sin datos de herramienta, y existe riesgo real de alucinación de producto.

---

## 1. ESTADO ACTUAL — CHIT_CHAT / DIALOG HANDLING

### Greeting path — completamente operativo

`RESPONSE_FORMAT_RULES` tiene regla explícita (línea 81 de `persona.ts`):

```
Si el cliente SALUDA (hola, buenas, qué tal) → intent: "greeting", routed_capsule: null,
fallback_reason: "GREETING", y en text salúdalo de forma breve y ofrece ayuda
```

Telemetría confirma: `CHIT_CHAT + GREETING + sommelier_intent: greeting` — **4 filas en producción**.
Schema correcto, comportamiento determinístico. Sin cambio requerido.

### Non-greeting CHIT_CHAT — sin regla explícita

`RESPONSE_FORMAT_RULES` tiene 6 reglas de routing: búsqueda de producto, políticas, carrito,
saludo, no-cápsula, whatsapp. **No hay regla para conversación casual no-saludo.**

Ejemplos sin cobertura explícita:
- "¿qué opinas del vapeo?"
- "eso suena interesante"
- "muy bien, gracias"
- preguntas filosóficas o off-topic

El Sommelier debe inferir `fallback_reason: "CHIT_CHAT"` sin instrucción. Funciona
probabilísticamente pero es comportamiento implícito.

---

## 2. LO QUE REVELA LA TELEMETRÍA EN VIVO

Query ejecutada:

```sql
SELECT detected_intent, sommelier_intent, fallback_reason, semantic_match_success, count(*)
FROM ai_analytics
GROUP BY detected_intent, sommelier_intent, fallback_reason, semantic_match_success
ORDER BY count DESC;
```

### Distribución completa de intents

| Analyst `detected_intent` | Sommelier `intent` | `fallback_reason` | Filas | Señal |
| ------------------------- | ------------------ | ----------------- | ----- | ----- |
| `UNKNOWN` | `info` | — | **21** | ⚠️ Analyst fallido → Sommelier adivinando |
| `INVENTORY_OUTLOOK` | `info` | — | 21 | filas pre-fix (schema antiguo) |
| `UNKNOWN` | `search` | — | **10** | ⚠️ Analyst fallido → Sommelier redirigiendo |
| `search` (antiguo) | — | — | 19 | filas pre-fix |
| `recommendation` (antiguo) | — | — | 17 | filas pre-fix |
| `info` (antiguo) | — | — | 11 | filas pre-fix |
| `INVENTORY_OUTLOOK` | `search` | — | 9 | filas pre-fix |
| `chit_chat` (antiguo) | — | — | 7 | filas pre-fix |
| `UNKNOWN` | `recommendation` | — | **4** | ⚠️ Analyst fallido → Sommelier improvisando |
| `UNKNOWN` | `recommendation` | `AMBIGUOUS_QUERY` | **4** | Sommelier capturó ambigüedad correctamente |
| `CHIT_CHAT` | `greeting` | `GREETING` | 4 | ✅ correcto |
| `COMPATIBILITY_CHECK` | `whatsapp` | `SUPPORT_ESCALATION` | 3 | ✅ escalación correcta |
| `UNKNOWN` | `recommendation` | `NO_CAPSULE_MATCH` | 1 | ⚠️ fallback genérico |
| `ORDER_TRACKING` | `whatsapp` | — | 1 | ✅ correcto |
| `COMPATIBILITY_CHECK` | `info` | — | 1 | ✅ correcto |

### Resumen del cluster UNKNOWN

| Categoria | Filas |
| --------- | ----- |
| `UNKNOWN` → Sommelier cualquier intent | **39** |
| Filas post-fix con schema nuevo | ~15 |
| Filas pre-fix (schema antiguo, intents en minúscula) | ~90 |
| Intents correctamente clasificados (post-fix) | ~15 |

**El cluster UNKNOWN representa ~25–30% de las interacciones Analyst-path en producción.**

---

## 3. RIESGO DEL CLUSTER UNKNOWN (PRIORIDAD ALTA)

Cuando el Analyst retorna `UNKNOWN`:

1. **No se ejecuta ninguna herramienta** — sin `search_products`, sin `get_store_policy`, sin datos reales
2. **El Sommelier responde desde memoria de entrenamiento** — sin catálogo actual, sin precios reales, sin estado de stock
3. **Riesgo de alucinación de producto** — el Sommelier puede mencionar productos que no existen en el catálogo, precios incorrectos, disponibilidad incorrecta
4. **`semantic_match_success: false`** en todos — KPI de salud deprimido aunque la respuesta parezca razonable

Queries que probablemente generan `UNKNOWN`:
- "¿tienes algo para principiantes?" → `isProductMatch` no dispara (sin keyword de sabor/precio)
- "¿cuánto cuesta el envío a Monterrey?" → `isPolicyMatch` puede fallar si "envío" tiene acento
- "me lo mandas a mi casa" → sin keyword match
- "¿aceptan PayPal?" → `isPolicyMatch` tiene "aceptan" pero no "PayPal"
- "¿tienen descuentos este mes?" → "descuento" en singular no está en regex (tiene "descuento")

---

## 4. RIESGO DE CHIT_CHAT NON-GREETING (PRIORIDAD BAJA)

Por contraste, el riesgo del gap de CHIT_CHAT non-greeting es **leve y no dañino**:

- El Sommelier infiere `CHIT_CHAT` implícitamente para conversación casual
- En el peor caso: el usuario recibe una sugerencia de producto o respuesta de info para una pregunta casual
- No es trust-breaking — el Sommelier sigue siendo coherente con la persona de Cesarin
- Frecuencia baja en uso real del pilot

La brecha es real y vale un one-liner en `persona.ts`, pero no justifica una lane completa.

---

## 5. COMPARACIÓN DE VALOR

| Lane | Filas afectadas | Riesgo usuario | Esfuerzo fix | Prioridad |
| ---- | --------------- | -------------- | ------------ | --------- |
| Reducir cluster `UNKNOWN` (Analyst) | ~39 filas (~30%) | Alto — alucinación de producto | Medio | **1** |
| CHIT_CHAT non-greeting explícito | ~0-5 filas estimadas | Bajo — respuesta levemente incorrecta | Muy bajo (1 línea) | 3 |
| Taxonomy alignment (Analyst↔Sommelier) | Todas | Observabilidad | Alto | 2 |

---

## 6. QUÉ ESTÁ APROBADO

- **Greeting path**: ✅ aprobado como está, sin cambio
- **CHIT_CHAT explicitness como lane separada**: ❌ no aprobada como prioridad — absorberla como one-liner en el mismo edit que UNKNOWN reduction
- **`UNKNOWN` reduction como próximo lane**: ✅ aprobado — confirmado por telemetría real

---

## 7. PRÓXIMO MOVIMIENTO EXACTO

### Paso 1 — Leer las queries reales del cluster UNKNOWN (read-only)

```sql
SELECT query, ai_logic_debug->>'sommelier_intent' as sommelier_intent, created_at
FROM public.ai_analytics
WHERE detected_intent = 'UNKNOWN'
  AND (ai_logic_debug->>'is_simulation' = 'false' OR ai_logic_debug->>'is_simulation' IS NULL)
ORDER BY created_at DESC
LIMIT 30;
```

Objetivo: confirmar qué queries reales del pilot caen en UNKNOWN antes de modificar el prompt.

### Paso 2 — Aplicar mínimas adiciones al Analyst (en `index.ts`)

Basado en los resultados del Paso 1:

**A. Guardrail regex — expandir variantes coloquiales:**
```typescript
const isPolicyMatch = /politica|envio|envíos|pago|reembolso|devolucion|garantia|entrega|
  costo|tarifa|aceptan|paypal|transferencia|deposito|dhl|ocurre|domicilio|cuanto.*tarda|
  cuando.*llega/.test(normalizedQuery);

const isProductMatch = /...existentes...|principiante|starter|inicio|barato|economico|
  regalo|recomendacion|recomiendas|quiero.*probar|para.*empezar|tengo.*presupuesto|
  quiero.*algo/.test(normalizedQuery);
```

**B. Few-shot examples — añadir 4–6 patrones coloquiales:**
```json
9. "¿tienes algo para principiantes?" → {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "starter kit principiantes", "requires_semantic_expansion": true}}]}
10. "¿aceptan PayPal?" → {"intent": "POLICY_INQUIRY", "tool_calls": [{"name": "knowledge_rag_foundation", "args": {"query": "métodos de pago"}}]}
11. "¿me lo mandan a mi casa?" → {"intent": "POLICY_INQUIRY", "tool_calls": [{"name": "knowledge_rag_foundation", "args": {"query": "política de envíos domicilio"}}]}
12. "¿tienen descuentos?" → {"intent": "PRODUCT_SEARCH", "tool_calls": [{"name": "product_search_integrity", "args": {"query": "productos en oferta descuento", "requires_semantic_expansion": true}}]}
```

**C. CHIT_CHAT rule en `persona.ts` — one-liner que viaja en el mismo edit:**
```
- Si el cliente hace conversación casual no relacionada con compra →
  intent: "info", routed_capsule: null, fallback_reason: "CHIT_CHAT"
```

### Paso 3 — Verificar post-deploy

```sql
SELECT detected_intent, count(*) as n
FROM ai_analytics
WHERE created_at > [timestamp_deploy]
GROUP BY detected_intent
ORDER BY n DESC;
```

`UNKNOWN` debe bajar de ~30% a <10%.

---

## 8. COMMITS RELACIONADOS

```
2e76b4c  fix(telemetry): correct semantic_match_success to include compatibility/order/inventory
05f9931  fix(telemetry): eliminate duplicate ai_analytics rows on Sommelier-path responses
```

---

_CHIT_CHAT explicitness es un one-liner válido pero no una lane._
_El gap real es el 30% de interacciones donde el Analyst emite UNKNOWN y el Sommelier responde sin datos reales._
_Leer las queries UNKNOWN antes de modificar guardrail regex y few-shots._
