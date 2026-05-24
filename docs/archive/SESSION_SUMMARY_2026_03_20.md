# Sesión de Trabajo — 2026-03-20

**Proyecto:** VSM Store · Cesarin AI Concierge
**Base Build:** v113 (Wave 193)
**Rama:** `main`

---

## Resumen Ejecutivo

Sesión de trabajo dividida en 7 lanes consecutivos, todos dentro del mismo día. Cubre desde ajustes cosméticos de operador hasta correcciones de integridad de esquema de producción. El hilo conductor: hacer que el ciclo completo de **captura de evidencia → observabilidad → revisión → cola de mejoras** sea confiable y trazable para operadores reales en tráfico piloto real.

---

## Lanes Ejecutados

### 1. Pilot Miss Taxonomy Panel
**Commits:** `9b9d5b1`, `3421613`

Implementación y corrección de un panel de taxonomía de misses dentro de `PilotTelemetry.tsx`. El panel deriva 6 categorías de fallo directamente de `PilotKPIs` y `queryLog` (sin nuevas llamadas al servicio) y permite al operador hacer clic en una categoría para filtrar el log de interacciones.

**Commit inicial (`9b9d5b1`):** Implementación base con 6 categorías, barras proporcionales, y navegación a buckets.

**Corrección heurística (`3421613`):** El panel inicial tenía problemas de integridad categorial:

| Problema | Corrección |
|---|---|
| "Fallback utilizado" y "Producto sin resultado" compartían el mismo bucket `zero_product_cards` — colisión semántica | `bucket: null` para fallback (no hay bucket dedicado; `fallback_used ≠ zero_product_cards`) |
| "Frustración detectada" ordenada junto a causas raíz — síntoma tratado como causa | Movida a tier `signal`, renderizada debajo de separador con `opacity-60` |
| "Guardrail rescue" con color naranja — implicaba fallo | Recoloreada a teal; renombrada; descripción como recuperación, no error |
| "Solo política / RAG" implicaba enrutamiento incorrecto | Renombrada "Consulta política / RAG"; descripción neutral |
| "Sin cápsula" podía dominar el ranking por ser log-bounded | Movida a tier `signal` |

**Arquitectura final del panel:**

```
Tier PRIMARY (ordenado por count desc):
  • Producto sin resultado  → bucket: zero_product_cards  (rojo)
  • Fallback activado       → bucket: null               (ámbar)
  • Rescue guardrail        → bucket: guardrail_rescue   (teal)
  • Consulta política / RAG → bucket: policy_query       (azul)

── señales ──────────────────────────────────────────
Tier SIGNAL (ordenado por count desc, opacity-60):
  • Señal de frustración    → bucket: frustration        (rosa)
  • Sin cápsula asignada    → bucket: null               (blanco)
```

---

### 2. Vector Dimensionality Reconciliation
**Commits:** `ece4a33`, `9fb1aab`

**Problema encontrado:** Las migraciones del repo declaraban dimensiones obsoletas para las columnas de embeddings y las firmas de las funciones RPC, mientras que el sistema en producción y todas las herramientas canónicas (seeds, tests) ya operaban a 3072d.

| Capa | Antes | Después |
|---|---|---|
| `products.embedding` | `vector(768)` | `vector(3072)` |
| `store_knowledge.embedding` | `vector(1536)` | `vector(3072)` |
| `match_products` firma | `vector(768)` | `vector(3072)` + return shape completo |
| `match_knowledge` firma | `vector(1536)` | `vector(3072)` |
| `customer-intelligence/index.ts` embedding | sin `outputDimensionality` | `outputDimensionality: 3072` |
| `customer-intelligence/tools.ts` (×3 llamadas) | sin `outputDimensionality` | `outputDimensionality: 3072` |

**Migración:** `20260320_vector_dimensionality_reconciliation.sql`
- Drops de índices antes de ALTER (requerido por PostgreSQL)
- Recreación de índices con tipo original (IVFFlat para productos, HNSW para knowledge)
- DROP doble por cada función: cubre tanto replay fresco (vector(768/1536)) como DB en vivo (vector(3072))

**Hardening (`9fb1aab`):** Se añadió `USING embedding::vector(3072)` a ambos `ALTER COLUMN TYPE`. Sin esta cláusula, PostgreSQL rechaza el ALTER en columnas con datos.

- **Replay fresco:** columna vacía al momento de la migración → cast trivialmente seguro
- **DB en vivo ya a 3072d:** `vector(3072)::vector(3072)` = cast identidad → éxito incondicional

---

### 3. Live Interaction Evidence Closure
**Commit:** `c6f2616`

**Problema raíz:** El texto de la respuesta de Cesarin nunca se persistía en `ai_analytics`. El `ReviewDrawer` esperaba un campo `response` que siempre llegaba como string vacío. Los operadores no podían revisar lo que el asistente había dicho.

**Cadena de 5 capas reparada:**

```
[1] Schema          ai_analytics + response_text TEXT (migración)
        ↓
[2] Edge Function   analyticsPayload + response_text: aiData.text ?? null
        ↓
[3] Service Layer   PilotQueryRow + response_text, SELECT actualizado, mapRow actualizado
        ↓
[4] Admin mapping   response: reviewInteraction.response_text || ''
                    + 6 campos de contexto pasados al drawer
        ↓
[5] ReviewDrawer    Respuesta renderizada, placeholder si null
                    + bloque "Ruta · Cápsula" con badges
```

**Contexto visible en el drawer ahora:**

| Badge | Fuente |
|---|---|
| Intent (detected_intent) | `ai_logic_debug.detected_intent` |
| Capsule (Producto / RAG) | `ai_logic_debug.sommelier_routed_capsule` |
| Rescue | `raw_analyst_intent === 'UNKNOWN'` + capsule presente |
| Sem. ✓ | `semantic_match_success` |
| Fallback | `fallback_used` |
| N cards | `product_card_count` (verde si > 0, rojo si = 0) |

**Nota:** Rows históricas (anteriores a este commit) muestran "Respuesta no capturada en telemetría". No existe backfill posible — las respuestas anteriores nunca se almacenaron.

---

### 4. Governed Evaluation → Improvement Queue MVP
**Commit:** `261f729`

Cierre del ciclo completo de gobernanza: una interacción fallida revisada puede ahora convertirse en un ítem de mejora rastreable con lane, estado, propietario y referencia de artefacto.

#### Tabla: `cesarin_improvement_items`

```sql
analytics_id    uuid NOT NULL → ai_analytics(id)    -- origen: interacción real
evaluation_id   uuid          → ai_evaluations(id)  -- origen: evaluación humana
lane            text CHECK (rule|knowledge|compatibility|commerce|other)
title           text NOT NULL
summary         text
severity        text CHECK (low|medium|high|critical) DEFAULT 'medium'
status          text CHECK (open|in_progress|resolved|wont_fix) DEFAULT 'open'
owner_id        uuid → admin_users(id) NULLABLE
execution_note  text
artifact_ref    text
```

RLS: admins pueden SELECT, INSERT, UPDATE. **Sin DELETE** — trazabilidad preservada.

#### Auto-derivación de lane desde primary_tag

| primary_tag | lane sugerida |
|---|---|
| `intent_miss`, `bad_recommendation_fit`, `missing_followup` | `rule` |
| `hallucination`, `knowledge_gap`, `false_certainty` | `knowledge` |
| `compatibility_gap` | `compatibility` |
| `tone_or_clarity_issue`, `correct_response` | `other` |

#### Flujo completo

```
Tráfico piloto real → ai_analytics (con response_text)
    ↓ operador abre drawer desde PilotTelemetry
ReviewDrawer muestra: query + respuesta + contexto de ruta/cápsula
    ↓ operador evalúa (score, tag, severidad) + activa toggle "Crear ítem de mejora"
ai_evaluations upsert (1:1 con analytics_id)
    ↓ simultáneo (si toggle activo)
cesarin_improvement_items INSERT: analytics_id + evaluation_id + lane auto + title + severity
    ↓ operador navega a Tab 8.5
TabImprovements muestra ítem con status "open"
    ↓ operador expande, completa nota de ejecución, cambia status, añade artifact_ref
updateImprovementItem persiste: status → resolved, execution_note, artifact_ref
```

#### TabImprovements (Tab 8.5 "Cola de Mejoras")

- Filtros por status: Todos / Abiertos / En curso / Resueltos / Descartados
- Filtros por lane: pills con todas las lanes
- Por cada ítem: badges de severidad + lane + status, título, query fuente truncada, ref de analytics_id
- EditPanel inline animado: edición de título, lane, status, nota de ejecución, ref de artefacto, "Asignarme" / "Desasignar" (usa `supabase.auth.getUser()` para owner_id)

---

## Mapa de Archivos Modificados

### Nuevos archivos creados

| Archivo | Propósito |
|---|---|
| `supabase/migrations/20260320_vector_dimensionality_reconciliation.sql` | Reconciliación 3072d (productos + knowledge) |
| `supabase/migrations/20260320_response_text_to_ai_analytics.sql` | Column `response_text TEXT` |
| `supabase/migrations/20260320_cesarin_improvement_items.sql` | Tabla de cola de mejoras |
| `src/services/admin/admin-improvement.service.ts` | CRUD + `laneFromPrimaryTag` |
| `src/components/admin/cesarin/TabImprovements.tsx` | Surface de cola de mejoras |

### Archivos modificados

| Archivo | Cambios |
|---|---|
| `src/components/admin/cesarin/PilotTelemetry.tsx` | MissTaxonomyPanel (implementación + corrección heurística) |
| `src/components/admin/cesarin/ReviewDrawer.tsx` | `response_text`, contexto de ruta/cápsula, toggle de promoción |
| `src/pages/admin/AdminCesarinOS.tsx` | Tab 8.5, `response_text` mapping, `response_text` en simulador |
| `src/services/admin/admin-pilot-ops.service.ts` | `response_text` en interface, query, mapRow |
| `supabase/functions/customer-intelligence/index.ts` | `response_text` en payload, `outputDimensionality: 3072` |
| `supabase/functions/customer-intelligence/tools.ts` | `outputDimensionality: 3072` (×3 llamadas) |

---

## Estado del Sistema al Cierre de Sesión

| Capa | Estado |
|---|---|
| Embeddings (schema + runtime) | ✅ Alineados en 3072d — repo y producción |
| Captura de evidencia de tráfico real | ✅ `response_text` persistido desde el edge function |
| Observabilidad en drawer de revisión | ✅ Respuesta + contexto de ruta/cápsula visibles |
| Taxonomía de misses (operador) | ✅ Panel con tiers primario/señal, sin colisiones semánticas |
| Cola de mejoras gobernada | ✅ `cesarin_improvement_items` + TabImprovements + promote toggle |

### Lo que queda fuera de esta sesión (brechas residuales)

- **Rows históricas sin `response_text`:** No backfillable — respuestas anteriores no se guardaron
- **Nombre del propietario en TabImprovements:** Se muestra "asignado" (presencia), no nombre — requiere join a `admin_users`
- **Deduplicación del toggle de promoción:** Activarlo dos veces en el mismo drawer crea dos ítems
- **Validación de artefactos:** Cuando un ítem se marca `resolved` con `artifact_ref`, no hay verificación automática de que el artefacto realmente exista o resuelva el problema
- **Cierre del loop con `intervention_signals`:** Los ítems resueltos no reducen automáticamente señales en `intervention_recommendations`
- **IVFFlat con 44 productos:** `lists=100` es ineficiente para catálogos pequeños (requiere >2000 filas para ser efectivo) — concern de performance separado

---

## Commits de la Sesión

```
261f729  feat(cesarin): governed evaluation-to-improvement queue MVP
c6f2616  feat(cesarin): live interaction evidence closure — response_text + route context
9fb1aab  fix(schema): harden dimensionality reconciliation migration for live-DB safety
ece4a33  fix(schema): reconcile vector dimensionality to canonical 3072d standard
3421613  fix(cesarin): heuristic correction pass on MissTaxonomyPanel categorization
9b9d5b1  feat(cesarin): add MissTaxonomyPanel to PilotTelemetry operator surface
```
