# SCENARIO COVERAGE + FALLBACK TAXONOMY AUDIT — Cesarin Cold Audit

**Fecha:** 2026-03-20
**Tipo:** Read-only audit — scenario coverage + fallback taxonomy quality
**Scope:** `index.ts` (Analyst + guardrails), `persona.ts` (Sommelier), `tools.ts`, `concierge.service.ts`

---

## VEREDICTO EJECUTIVO

El sistema tiene cobertura robusta en las rutas principales (producto, política, carrito, saludo).
Los blind spots críticos están en intents que tienen herramienta pero no cápsula
(`COMPATIBILITY_CHECK`, `ORDER_TRACKING`, `INVENTORY_OUTLOOK`), y en la métrica
`semantic_match_success` que subreporta cobertura real al excluir esas rutas.

---

## 1. ESTADO ACTUAL — DOS TAXONOMÍAS PARALELAS SIN MAPA

El sistema opera con dos capas LLM en secuencia. Cada una tiene su propia taxonomía de intents
y no existe un mapa formal de equivalencias entre ellas.

### Taxonomía del Analyst (`index.ts` prompt)

```
CART_OPERATION | POLICY_INQUIRY | PRODUCT_SEARCH | ORDER_TRACKING |
INVENTORY_OUTLOOK | CHIT_CHAT | UNKNOWN
```

- Guardrail-only (no en schema del Analyst): `COMPATIBILITY_CHECK`
- Referencia zombie (en código línea 453, nunca emitida): `SOCRATIC_CLARIFICATION`

### Taxonomía del Sommelier (`persona.ts`)

```
intents:   search | info | support | recommendation | whatsapp | greeting
fallbacks: GREETING | CHIT_CHAT | AMBIGUOUS_QUERY | NO_CAPSULE_MATCH | SUPPORT_ESCALATION
```

### Herramientas implementadas (`tools.ts`)

| Tool | Implementada | Cápsula cliente | Telemetría visible |
| ---- | ------------ | --------------- | ------------------ |
| `product_search_integrity` / `search_products` | ✅ | ✅ | ✅ `capsule` field |
| `knowledge_rag_foundation` / `get_store_policy` | ✅ | ✅ | ✅ `capsule` field |
| `cart_operator` | ✅ | ✅ | ✅ `cart_action_detected` |
| `check_compatibility` | ✅ | ❌ | ⚠️ solo `detected_intent` en JSONB |
| `track_order` | ✅ | ❌ | ⚠️ solo `detected_intent` en JSONB |
| `get_inventory_outlook` | ✅ | ❌ | ⚠️ solo `detected_intent` en JSONB |

---

## 2. QUÉ ESTÁ VALIDADO

### Ruta de búsqueda de productos — plenamente operativa

La ruta mejor cubierta del sistema:

- Clasificación por Analyst LLM con 6 few-shot examples (barato, frutal, dejar de fumar, recomiéndame, algo suave, preferencias)
- Guardrail regex `isProductMatch` como red de seguridad cuando Analyst devuelve `UNKNOWN` o `CHIT_CHAT`
- Inyección de `product_search_integrity` tool_call si guardrail upgradea intent pero Analyst omitió la herramienta
- Client-side capsule ejecuta búsqueda semántica real
- `VSM_OPERATIONAL_RULES §5` (FEATURED_FALLBACK) y `§6` (OUT-OF-STOCK): comportamiento especificado
- `VSM_OPERATIONAL_RULES §2 CRITICAL`: bias guard ("dejar de fumar" → pods/sales, no marca específica) + repetition guard

### Ruta de políticas/información — operativa

Analyst + `isPolicyMatch` regex + `knowledge_rag_foundation` capsule + RAG chunks.
`knowledge_chunks_count` registrado en telemetría.

### Ruta de carrito — operativa

Tool + client capsule. Few-shot claro. `cart_action_detected` en telemetría.

### Saludo/greeting — funcional

Analyst → `CHIT_CHAT` → Sommelier → `intent: "greeting"`, `routed_capsule: null`,
`fallback_reason: "GREETING"`. Schema correcto (post-revert). Respuesta conversacional.

### Guardrail regex — arquitectura sólida

Orden de precedencia: `COMPATIBILITY_CHECK` > `INVENTORY_OUTLOOK` > `POLICY_INQUIRY` >
`PRODUCT_SEARCH` > `GREETING`. El ordenamiento previene falsos positivos en consultas mixtas
(ej. "¿el mango tiene stock?" → hits `isProductMatch` AND `isInventoryMatch` → inventory gana).

### Restricciones de comportamiento en `VSM_OPERATIONAL_RULES` — bien especificadas

`§7` (proyecciones): lenguaje estimativo obligatorio, `CALIDAD_SEÑAL: insufficient` aumenta cautela.
`§8` (QA comercial): preguntas clarificadoras para ambigüedad, presupuesto respetado, comparación estructurada.
Sin cambio requerido.

### Telemetría — live

2 filas confirmadas post-deploy: `error_type: NULL`, `detected_intent` real, capsule routing activo.
Baseline operativo.

---

## 3. QUÉ SIGUE ABIERTO — BLIND SPOTS

### Blind Spot 1 — `COMPATIBILITY_CHECK` invisible en telemetría (PRIORIDAD ALTA)

El intent existe, la guardrail lo fuerza, `check_compatibility` tool ejecuta y el Sommelier
consume el output. Pero no hay cápsula cliente — el campo `capsule` en `ai_analytics` es
`null` para todas las consultas de compatibilidad.

Telemetría no puede distinguir:
- "usuario preguntó compatibilidad → Sommelier respondió con datos técnicos" (éxito)
- "usuario escribió algo genérico → Sommelier respondió sin tool data" (fallback)

Ambos producen `capsule: null`. La única señal diferenciadora es `detected_intent:
COMPATIBILITY_CHECK` en el JSONB — observable pero no surfaceado en KPI cards actuales.

Adicionalmente, las 4 reglas de comportamiento de compatibilidad (`[GENERALIZACION]`,
`[ESPECIFICO]`, `UNKNOWN_UNCONFIRMED`) están inline en el Sommelier prompt, no en `persona.ts`.
Esto las hace invisibles en el archivo de configuración canónico.

### Blind Spot 2 — `ORDER_TRACKING` sin guardrail de falla (PRIORIDAD MEDIA)

`track_order` delega a la edge function `track-shipment`. Si esa función falla o retorna
datos ambiguos, el Sommelier recibe output vacío y debe decidir solo. Contraste con
`INVENTORY_OUTLOOK` que tiene instrucción explícita de `CALIDAD_SEÑAL: insufficient`.

Adicionalmente, `track_order` no contribuye a `semantic_match_success` (línea 704 de `index.ts`
solo evalúa `search_products` y `get_store_policy`). Una consulta de pedido respondida
exitosamente se registra como `semantic_match_success: false` y puede disparar `fallback_used: true`
incorrectamente.

### Blind Spot 3 — `semantic_match_success` subreporta cobertura real (PRIORIDAD ALTA)

```typescript
// index.ts línea 704 — estado actual
const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0;
```

`check_compatibility`, `track_order` y `get_inventory_outlook` están excluidos.
El KPI "Match Semántico" en `TabAnalytics` muestra como miss cualquier consulta de
compatibilidad, pedido o inventario — independientemente del resultado de la herramienta.

Impacto: la métrica de salud principal de Cesarin subreporta cobertura real. Si
el pilot tiene uso significativo de esas rutas, el KPI está sistemáticamente deprimido.

### Blind Spot 4 — `recommendation` (Sommelier) es un intent huérfano

El Analyst no tiene intent `RECOMMENDATION`. Todas las consultas de recomendación se
clasifican como `PRODUCT_SEARCH`. El Sommelier puede emitir `intent: "recommendation"` en
su JSON output — confirmado en telemetría post-deploy — pero no hay routing ni comportamiento
diferenciado vinculado a este valor. Es decorativo.

Crea ruido en `sommelier_intent` vs `detected_intent` (Analyst): los dos campos divergen
en formas estructuralmente esperadas pero difíciles de interpretar en TabAnalytics.

### Blind Spot 5 — `SOCRATIC_CLARIFICATION` zombie en guardrail (BAJA PRIORIDAD)

```typescript
// index.ts línea 453
else if (isProductMatch && (intent === 'UNKNOWN' || intent === 'SOCRATIC_CLARIFICATION'))
```

`SOCRATIC_CLARIFICATION` no está en el schema del Analyst. Esta rama nunca se activa para
`SOCRATIC_CLARIFICATION` — solo para `UNKNOWN`. La referencia es un residuo de arquitectura
anterior. Cero riesgo de breakage, pero es ruido en la lógica de guardrail.

### Blind Spot 6 — CHIT_CHAT no-saludo sin regla de routing explícita en Sommelier

`RESPONSE_FORMAT_RULES` tiene reglas explícitas para: búsqueda de producto, políticas,
carrito, saludo, no-cápsula, whatsapp. No hay regla para CHIT_CHAT no-saludo
("¿cómo estás?", comentarios off-topic, conversación casual sin compra).

El Sommelier infiere `fallback_reason: "CHIT_CHAT"` sin instrucción. Funciona
probabilísticamente, pero la brecha entre la taxonomía declarada y el prompt es real.

### Blind Spot 7 — Loop de disambiguación sin estado (PRIORIDAD MEDIA)

`AMBIGUOUS_QUERY` está en la taxonomía y `VSM_OPERATIONAL_RULES §8` instruye 1-2 preguntas
clarificadoras. Pero el follow-up del usuario ingresa al pipeline frío — sin señal de que
la sesión está en modo de disambiguación.

Si el usuario responde "la opción 2" o "el de menta" a una pregunta clarificadora:
- Analyst no detecta señal de producto en esa respuesta aislada
- `isProductMatch` regex puede no disparar
- Intent puede clasificar como `CHIT_CHAT` → Sommelier sin contexto de búsqueda

El historial de las últimas 6 turns ayuda pero no garantiza recuperación. El loop puede
romperse silenciosamente.

---

## 4. QUÉ ESTÁ APROBADO

| Ruta | Estado |
| ---- | ------ |
| Búsqueda de productos (product_search_integrity) | ✅ Aprobada — no requiere cambio |
| Políticas/información (knowledge_rag_foundation) | ✅ Aprobada — no requiere cambio |
| Operaciones de carrito (cart_operator) | ✅ Aprobada — no requiere cambio |
| Saludo/greeting (Sommelier path, null capsule) | ✅ Aprobada post-revert |
| Guardrail regex con precedencia | ✅ Aprobada — arquitectura correcta |
| Restricciones de comportamiento en VSM_OPERATIONAL_RULES | ✅ Aprobadas — sin cambio |
| Telemetría baseline | ✅ Operativa |

---

## 5. PRÓXIMO MOVIMIENTO EXACTO

### Movimiento 1 — `semantic_match_success` correctness fix (MAYOR VALOR / MENOR RIESGO)

**Archivo:** `supabase/functions/customer-intelligence/index.ts`
**Línea:** 704

```diff
- const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0;
+ const semanticMatchSuccess = productMatchCount > 0 || policyMatchCount > 0
+     || toolResults.some(r => r.name === 'check_compatibility' && r.status === 'success')
+     || toolResults.some(r => r.name === 'track_order' && r.status === 'success')
+     || toolResults.some(r => r.name === 'get_inventory_outlook' && r.status === 'success');
```

**Impacto:** KPI "Match Semántico" en TabAnalytics pasa a reflejar cobertura real.
`fallback_used` deja de ser incorrecto para rutas de compatibilidad, pedido e inventario.

### Movimiento 2 — Eliminar `SOCRATIC_CLARIFICATION` zombie (LIMPIEZA / CERO RIESGO)

**Archivo:** `supabase/functions/customer-intelligence/index.ts`
**Línea:** 453

```diff
- else if (isProductMatch && (intent === 'UNKNOWN' || intent === 'SOCRATIC_CLARIFICATION')) {
+ else if (isProductMatch && intent === 'UNKNOWN') {
```

### Movimiento 3 — Añadir regla CHIT_CHAT al Sommelier `RESPONSE_FORMAT_RULES` (PRIORIDAD MEDIA)

**Archivo:** `supabase/functions/customer-intelligence/persona.ts`

Añadir en `REGLAS DE ROUTING ESTRICTAS` después de la regla de saludo:

```
- Si el cliente hace conversación casual no relacionada con compra → intent: "info", routed_capsule: null, fallback_reason: "CHIT_CHAT"
```

Ancla el comportamiento que ya funciona de forma implícita.

### Siguiente lane (requiere gate separado)

**Canonical Intent Taxonomy Map** — antes de cualquier cambio estructural a la taxonomía,
definir el mapa formal Analyst intent → Sommelier intent → capsule → fallback_reason.
Esto precede cualquier trabajo de alignment de los dos LLM layers.

---

## TABLA DE PRIORIDADES

| Ítem | Tipo | Riesgo | Valor | Orden |
| ---- | ---- | ------ | ----- | ----- |
| `semantic_match_success` fix | 3 líneas en `index.ts` | Muy bajo | Alto — KPI correcto | 1 |
| `SOCRATIC_CLARIFICATION` removal | 1 palabra en guardrail | Cero | Medio — código limpio | 2 |
| `CHIT_CHAT` routing rule en Sommelier | 1 línea en `persona.ts` | Muy bajo | Medio — explicitación | 3 |
| Canonical Intent Taxonomy Map | Gate doc | Cero (read-only) | Alto — precede todo lo demás | 4 |
| `compatibility` rules → `persona.ts` | Refactor inline rules | Bajo | Bajo-medio — observabilidad | 5 |
| `track_order` failure-mode guardrail | Prompt addition | Bajo | Medio — resiliencia | 6 |

---

_Dos taxonomías paralelas. Las rutas principales están validadas. Los blind spots críticos_
_están en la métrica `semantic_match_success` y en los intents con herramienta pero sin cápsula._
_El próximo movimiento exacto es el fix de 3 líneas en `index.ts` — KPI correcto antes de cualquier expansión._
