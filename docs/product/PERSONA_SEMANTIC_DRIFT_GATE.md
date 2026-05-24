# PERSONA SEMANTIC DRIFT GATE — `persona.ts` Cold Audit

**Fecha:** 2026-03-20
**Tipo:** Read-only audit — uncommitted drift in `persona.ts`
**Archivo auditado:** `supabase/functions/customer-intelligence/persona.ts`
**Clasificación previa:** `NEEDS HUMAN DECISION`

---

## VEREDICTO

**Recomendación: REVERTIR ambos cambios.**

Los cambios introducen una contradicción de schema y un valor de cápsula sin handler.
El estado original (`routed_capsule: null` + `fallback_reason: "GREETING"`) es semánticamente correcto.

---

## 1. QUÉ CAMBIÓ

Dos líneas modificadas en `RESPONSE_FORMAT_RULES` de `persona.ts`:

### Cambio A — Enum del schema (línea 67)

```diff
- "routed_capsule": "(OBLIGATORIO) uno de: product_search_integrity | knowledge_rag_foundation | cart_operator | null",
+ "routed_capsule": "(OBLIGATORIO) uno de: product_search_integrity | knowledge_rag_foundation | cart_operator | general_concierge_dialog | null",
```

Añade `general_concierge_dialog` como valor válido en el schema que ve el Sommelier LLM.

### Cambio B — Regla de routing GREETING (línea 81)

```diff
- Si el cliente SALUDA → intent: "greeting", routed_capsule: null, fallback_reason: "GREETING", y en text salúdalo...
+ Si el cliente SALUDA → intent: "greeting", routed_capsule: "general_concierge_dialog", fallback_reason: "GREETING", y en text salúdalo...
```

Cambia el capsule output del Sommelier para saludos: de `null` a `"general_concierge_dialog"`.

---

## 2. QUÉ ESTÁ VALIDADO

### Arquitectura de routing (lectura de `index.ts` + `concierge.service.ts`)

El routing funciona en **dos capas independientes**:

**Capa 1 — Analyst (`index.ts`):** Decide si se delega a cápsula cliente.
- Retorna `requires_client_capsule: true, capsule_name: 'X'` si el intent activa una cápsula.
- Para `GREETING`, el Analyst no genera tool_calls de cápsula → no hay retorno temprano.
- El Sommelier ejecuta y produce la respuesta conversacional final.

**Capa 2 — Sommelier (`index.ts` → `concierge.service.ts`):** Produce el JSON de respuesta.
- Su output `routed_capsule` llega al path genérico de `concierge.service.ts` (línea 183+).
- Es consumido en línea 205: `capsule_contract: data.routed_capsule ? { capsule_name: data.routed_capsule } : null`

### Handlers de cápsula existentes (`concierge.service.ts` líneas 111–180)

| capsule_name | Handler cliente | Acción |
| ------------ | --------------- | ------ |
| `product_search_integrity` | ✅ | `executeProductSearchCapsule()` |
| `knowledge_rag_foundation` | ✅ | `executeKnowledgeCapsule()` |
| `cart_operator` | ✅ | `executeCartOperatorCapsule()` |
| `general_concierge_dialog` | ❌ **no existe** | ninguna |

### Consumo de `capsule_contract` en UI (`useAIConcierge.ts` + `AIConcierge.tsx`)

| Referencia | Qué comprueba | Resultado para `general_concierge_dialog` |
| ---------- | ------------- | ----------------------------------------- |
| `useAIConcierge.ts:97` | `capsule_name === 'cart_operator'` → ejecuta mutación de carrito | No activa — sin efecto |
| `AIConcierge.tsx:141` | `capsule_name === 'knowledge_rag_foundation'` → renderiza chunks | No activa — sin efecto |
| `AIConcierge.tsx:174` | `match_strategy` de productos | No activa — sin efecto |

**Conclusión validada:** `general_concierge_dialog` no tiene handler, no ejecuta nada, no renderiza componente especial.

### Telemetría

`concierge.service.ts:190` en el path genérico:

```typescript
routed_capsule: unknownCapsule ? (data.capsule_name ?? null) : null
```

Para el path Sommelier, `unknownCapsule = false` → telemetría registra `routed_capsule: null` siempre.
El `routed_capsule` del Sommelier va como `sommelier_routed_capsule` en el JSONB (`index.ts:723`).

**Conclusión validada:** El cambio B no altera los KPIs de telemetría del path principal.

---

## 3. QUÉ SIGUE ABIERTO (RIESGOS)

### Riesgo 1 — Contradicción de schema (CRÍTICO)

El schema define explícitamente:

```
"fallback_reason": "(solo si routed_capsule es null) uno de: GREETING | ..."
```

El Cambio B instruye al Sommelier a emitir:

```json
{
  "routed_capsule": "general_concierge_dialog",
  "fallback_reason": "GREETING"
}
```

`routed_capsule` es no-null. `fallback_reason` está condicionado a null. Son mutuamente excluyentes por definición del schema.

**Impacto:** El Sommelier LLM recibe reglas internas contradictorias. Un LLM entrenado en seguir instrucciones puede resolver la contradicción en cualquier dirección — omitir `fallback_reason`, emitir `null` en `routed_capsule`, o seguir la regla explícita del routing. El comportamiento no es predecible.

### Riesgo 2 — Generalización no controlada del enum

Añadir `general_concierge_dialog` al enum del schema (Cambio A) expone ese valor al Sommelier
como opción válida para **cualquier** caso donde el routing no sea claro. El Sommelier puede
comenzar a usar `general_concierge_dialog` para `recommendation`, `CHIT_CHAT`, respuestas
ambiguas — casos que actualmente devuelven `null` y disparan `fallback_reason` explícito.

**Impacto:** Deriva silenciosa. `capsule_contract` deja de ser null para casos que no son
GREETING pero que el Sommelier decide etiquetar como `general_concierge_dialog`. No hay handler,
pero el valor no-null cambia el shape del retorno para consumidores futuros.

### Riesgo 3 — `capsule_contract` no-null sin semántica definida

Antes del cambio, para greetings:
```
capsule_contract: null
```

Después del cambio, para greetings:
```
capsule_contract: { capsule_name: "general_concierge_dialog" }
```

Cualquier código futuro que inspect `capsule_contract != null` como señal de "cápsula activa"
incluirá greetings incorrectamente.

### Riesgo 4 — Valor de cambio nulo (BAJA PRIORIDAD)

El intent de distinguir "null por saludo" de "null por error" ya está resuelto con
`fallback_reason: "GREETING"` en telemetría (`sommelier_fallback_reason` en JSONB).
No hay observabilidad ganada con `general_concierge_dialog` que no exista ya.

---

## 4. QUÉ ESTÁ APROBADO

El **estado original** — `routed_capsule: null` + `fallback_reason: "GREETING"` — está validado:
- Semánticamente correcto: null capsule + fallback reason explícito
- Sin contradicción de schema
- Telemetría distingue GREETINGs via `sommelier_fallback_reason: "GREETING"` en JSONB
- `capsule_contract: null` — shape limpio, sin ambigüedad para consumidores

---

## 5. PRÓXIMO MOVIMIENTO EXACTO

**Revertir `persona.ts` a HEAD.**

```bash
git checkout HEAD -- supabase/functions/customer-intelligence/persona.ts
```

Esto revierte ambos cambios (A y B) en un solo comando.
No requiere redeploy inmediato — el archivo aún no está deployado en producción
(el último deploy fue `a4fcd20`, que incluye el `index.ts` con `persona.ts` del commit `a4fcd20`).

**Verificar post-revert:**

```bash
git diff HEAD -- supabase/functions/customer-intelligence/persona.ts
```

Debe retornar vacío (sin cambios).

**Si se desea `general_concierge_dialog` en el futuro (decisión humana):**

Requisitos antes de introducirlo:
1. Definir y registrar el handler en `concierge.service.ts` (igual que `product_search_integrity`, etc.)
2. Eliminar la contradicción: si `routed_capsule: "general_concierge_dialog"`, remover `fallback_reason` de esa regla
3. Definir qué renderiza `AIConcierge.tsx` para este capsule
4. Deploy + verificación en telemetría

Sin esos 4 puntos, el valor no tiene utilidad funcional y solo agrega ruido semántico.

---

## TABLA DE DECISIÓN

| Cambio | Riesgo | Valor | Decisión |
| ------ | ------ | ----- | -------- |
| A — enum `general_concierge_dialog` | Bajo (directo) / Medio (generalización) | Nulo — sin handler | **REVERTIR** |
| B — GREETING → `routed_capsule: "general_concierge_dialog"` | Alto — contradicción de schema | Nulo — ya cubierto por `fallback_reason` | **REVERTIR** |

---

_`persona.ts` debe quedar en el estado de HEAD. Ambos cambios introducen más riesgo que valor._
_La contradicción de schema (Riesgo 1) es suficiente para rechazar el Cambio B por sí solo._
