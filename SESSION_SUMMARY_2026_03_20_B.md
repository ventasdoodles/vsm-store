# Sesión de Trabajo — 2026-03-20 (Continuación B)

**Proyecto:** VSM Store · Cesarin AI Concierge
**Base Build:** v113 (Wave 193) → post-hardening
**Rama:** `main`

---

## Resumen Ejecutivo

Sesión de 4 lanes consecutivos, todos de corrección y hardening sin wave nuevo. El hilo conductor: hacer que las superficies ya construidas (queue gobernada, analíticas, tab de mejoras, handoff comercial) sean estructuralmente correctas antes de cualquier expansión. Ningún lane añadió feature nueva — todos sellaron brechas de integridad identificadas en cold review.

---

## Lanes Ejecutados

### 1. Integrity Hardening Pass — Governed Improvement Queue
**Commit:** `c817984`

Cold adoption review identificó 4 brechas estructurales en el MVP de la queue del día anterior. Corrección quirúrgica aplicada.

#### 1.1 NavTab Type Drift
El array `TABS` en `AdminCesarinOS.tsx` ya tenía `{ id: 'improvements', ... }`, pero el union type `NavTab.id` en `cesarin.ts` no incluía `'improvements'`. TypeScript era silencioso (o dependía de cast implícito).

**Fix:** `'improvements'` añadido al union en [src/types/cesarin.ts](src/types/cesarin.ts):121.

#### 1.2 Closure Discipline
`EditPanel.handleSave` en `TabImprovements.tsx` permitía transicionar a `resolved` o `wont_fix` sin evidencia alguna — sin nota de ejecución ni ref de artefacto.

**Fix:** Guard en `handleSave` antes del async call:

```typescript
if ((status === 'resolved' || status === 'wont_fix') && !execNote.trim() && !artifactRef.trim()) {
    toast.error(
        status === 'resolved'
            ? 'Para marcar como resuelto se requiere una nota de ejecución o ref. de artefacto'
            : 'Para descartar se requiere una nota que explique la decisión'
    );
    return;
}
```

El mensaje de error varía según el estado destino. Se bloquea el save, no el select del estado — el operador puede preparar la nota y luego guardar.

#### 1.3 Anti-Duplication
El toggle de "Crear ítem de mejora" en `ReviewDrawer` podía crear ítems duplicados si el operador guardaba dos veces la misma evaluación. Sin protección estructural, solo UI.

**Fix en tres capas:**

| Capa | Mecanismo |
|---|---|
| DB | Nueva migración `20260320_improvement_items_anti_dupe.sql`: `UNIQUE(analytics_id)` en `cesarin_improvement_items` |
| Service | `createImprovementItem` captura error `23505` (unique_violation) y retorna `null` en lugar de throw |
| UI | `ReviewDrawer` detecta `created === null` → toast informativo "Ya existe un ítem de mejora para esta interacción" |

**Comportamiento:** Primera creación siempre tiene éxito. Réplica: silenciosa + informativa, sin excepción visible al operador.

#### 1.4 Anti-Fragmentation
`TabImprovements` (8.5) y `TabInterventions` (5.5) podían parecer backlogs competidores desde la perspectiva de un operador nuevo.

**Fix:** Descripción del header de `TabImprovements` actualizada para codificar la distinción explícitamente:

> *"Ítems creados explícitamente por el operador desde revisiones de interacciones (Tab 8). Distinto de las intervenciones auto-generadas por patrones de señal (Tab 5.5) — estos ítems requieren ejecución manual y cierre con evidencia."*

**Distinción semántica real:**
- **Tab 5.5 Intervenciones:** señales de patrón auto-detectadas → sistema genera recomendaciones → operador aprueba/rechaza
- **Tab 8.5 Cola de Mejoras:** operador revisa interacción específica → promueve explícitamente un ítem → operador rastrea ejecución

---

### 2. Runtime Failure Triage — Analytics + Improvements Tab
**Commit:** `7a246a5`

Dos tabs del admin fallaban en runtime con errores de carga. La autenticación y el AdminGuard estaban correctos — el fallo ocurría durante la carga de datos de los tabs.

#### Causa raíz: Analytics Tab

`TabAnalytics` ejecutaba `Promise.all([getPilotKPIs(...), getPilotQueryLog(...)])`.

`getPilotQueryLog` incluye `response_text` en su SELECT:
```typescript
.select('id, query, response_text, created_at, frustration_detected, ai_logic_debug')
```

Si la migración `20260320_response_text_to_ai_analytics.sql` no ha sido aplicada en el live DB, Supabase retorna `42703: column ai_analytics.response_text does not exist` → `Promise.all` rechaza → el tab completo falla, incluyendo los KPI cards que dependen de `getPilotKPIs` (que **no** selecciona `response_text`).

**Fix:** Carga secuencial independiente. KPIs primero (siempre funcional), query log después como overlay degradable:

```typescript
getPilotKPIs(from, to)
    .then((kpiData) => {
        setKpis(kpiData);
        return getPilotQueryLog(from, to, 200)
            .then((rows) => { /* build capsuleCounts */ })
            .catch(() => { setCapsuleUnavailable(true); });
    })
    .catch((err) => { setError(err.message); });
```

Cuando `capsuleUnavailable = true`, el panel "Distribución Cápsulas" muestra:
> *"Distribución no disponible — migración `response_text` pendiente en DB"*

Los 4 KPI cards (consultas, match semántico, frustración, latencia) permanecen intactos.

#### Causa raíz: Improvements Tab

`getImprovementItems` consulta `cesarin_improvement_items`. Si la migración `20260320_cesarin_improvement_items.sql` no ha sido aplicada, Supabase retorna `42P01: relation "cesarin_improvement_items" does not exist`. El catch anterior silenciaba el error con un toast genérico y dejaba la lista vacía sin explicación.

**Fix:** Estado `schemaError` con detección específica:

```typescript
catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('cesarin_improvement_items') || msg.includes('does not exist') || msg.includes('relation "')) {
        setSchemaError('20260320_cesarin_improvement_items.sql');
    } else {
        toast.error('Error cargando la cola de mejoras');
    }
}
```

Cuando `schemaError` está activo, el tab muestra un banner amber con el nombre exacto de la migración pendiente y oculta la lista de ítems y el footer de conteo.

---

### 3. Live Migration Dependency Triage
**Commit:** Ninguno — tarea de DB live, sin cambios de repo

Live DB confirmó errores:
- `ERROR: relation "public.ai_evaluations" does not exist`
- `ERROR: relation "public.cesarin_improvement_items" does not exist`

#### Mapa de dependencias confirmado

```
001_initial_schema.sql
    └── update_updated_at_column() fn
20260315_cesarin_os.sql
    └── ai_analytics (tabla base)
20260316_neural_v159.sql
    └── ai_analytics.frustration_detected + ai_logic_debug
20260319_human_evaluation_loop.sql          ← CONFIRMADO AUSENTE
    └── ai_evaluations (FK: ai_analytics + auth.users)
20260320_ai_analytics_rls_write_path.sql   ← VERIFICAR
    └── RLS en ai_analytics + políticas anon INSERT + admin SELECT
20260320_response_text_to_ai_analytics.sql  ← CONFIRMADO AUSENTE
    └── ai_analytics.response_text TEXT
20260320_cesarin_improvement_items.sql      ← CONFIRMADO AUSENTE
    └── cesarin_improvement_items
        FKs: ai_analytics + ai_evaluations + admin_users
20260320_improvement_items_anti_dupe.sql    ← AUSENTE (creada esta sesión)
    └── UNIQUE(analytics_id) en cesarin_improvement_items
20260320_intervention_signals_and_recommendations.sql  ← VERIFICAR (para Tab 5.5)
    └── intervention_signals + intervention_recommendations
```

#### Cadena de aplicación requerida (orden estricto)

| # | Migración | Nota |
|---|---|---|
| 1 | `20260319_human_evaluation_loop.sql` | Idempotente ✅ |
| 2 | `20260320_ai_analytics_rls_write_path.sql` | `CREATE POLICY` no idempotente ⚠️ — verificar `pg_policies` antes |
| 3 | `20260320_response_text_to_ai_analytics.sql` | `ADD COLUMN IF NOT EXISTS` — idempotente ✅ |
| 4 | `20260320_cesarin_improvement_items.sql` | Idempotente ✅ — requiere #1 ya aplicado |
| 5 | `20260320_improvement_items_anti_dupe.sql` | `ADD CONSTRAINT` — no idempotente ⚠️ — requiere #4 ya aplicado |
| 6 | `20260320_intervention_signals_and_recommendations.sql` | Para Tab 5.5 — `CREATE POLICY` no idempotente ⚠️ |

**Advertencia para paso 2:** Verificar antes:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'ai_analytics';
```
Si `ai_analytics_insert_anon`, `ai_analytics_insert_authenticated`, o `ai_analytics_select_admin` ya existen, eliminarlas o saltarse el paso.

---

### 4. Cesarin Commerce Handoff Hardening
**Commit:** `86a686b`

Cold verification confirmó un break real en el handoff AI → storefront. Dos rutas de compra rotas.

#### Break 1: PDP Navigation

**Antes (AIConcierge.tsx:186):**
```typescript
onClick={() => window.location.href = `/vape/${prod.id}`}
```

**Tres bugs en una línea:**
1. Sección hardcodeada a `/vape/` — rompe cualquier producto `section = '420'`
2. Usa `prod.id` (UUID) en lugar de `prod.slug` — la ruta canónica es `/:slug`
3. `window.location.href` — recarga completa de página, destruye estado React Router

**Causa raíz adicional:** `InternalResolvedProduct` no tenía campo `section` — no estaba en el SELECT ni en el schema de zod.

**Fix en cadena de 3 pasos:**

1. `ai-capsule-schemas.ts` — añadir `section: z.enum(['vape', '420']).optional()` al schema (opcional para backward-compat con path genérico del edge function)

2. `ai-capsule-orchestrator.service.ts` — dos cambios:
   ```typescript
   // SELECT
   .select('id, slug, section, name, price, stock, ...')

   // mapDbToInternal
   section: (p.section === 'vape' || p.section === '420') ? p.section : 'vape',
   ```
   El path semántico (RPC `match_products`) ya retornaba `section` — confirmado en la migración de reconciliación.

3. `AIConcierge.tsx` — reemplazar navegación:
   ```typescript
   // Antes
   onClick={() => window.location.href = `/vape/${prod.id}`}

   // Después
   onClick={() => navigate(`/${prod.section ?? 'vape'}/${prod.slug}`)}
   ```

#### Break 2: Quick-Add Cart

**Antes (AIConcierge.tsx:207):**
```typescript
addItem(prod as any, 1);
```

`prod` es `InternalResolvedProduct` — un contrato interno de cápsula con shape estructuralmente diferente a `Product`:

| Campo | Product (cart espera) | InternalResolvedProduct |
|---|---|---|
| `price` | `number` | — (tiene `display_price: string`) |
| `stock` | `number` | — (tiene `raw_stock: number`) |
| `status` | `'active' \| 'legacy' \| ...` | — (tiene `status_signal: enum`) |
| `is_active` | `boolean` | — ausente |
| `variants` | `ProductVariant[]` | — ausente |
| `section` | `'vape' \| '420'` | — ausente hasta esta sesión |

El cast `as any` bypaseaba TypeScript. En runtime, `cart.store.ts` recibía un objeto incompleto que podía pasar o fallar silenciosamente dependiendo de las validaciones internas.

**Fix:** Rehydratación desde catálogo antes del dispatch — patrón idéntico a `cart-operator-executor.ts:43`:

```typescript
onClick={async (e) => {
    e.stopPropagation();
    try {
        const full = await getProductsByIds([prod.id]);
        if (full[0]) {
            addItem(full[0], 1);
            notify.success('Agregado', `${prod.name} al carrito`);
        } else {
            notify.error('Error', 'Producto no disponible');
        }
    } catch {
        notify.error('Error', 'No se pudo agregar al carrito');
    }
}}
```

El carrito recibe un `Product` completo con todos los campos requeridos por las validaciones de `addItem`.

---

## Mapa de Archivos Modificados

### Nuevos archivos creados

| Archivo | Propósito |
|---|---|
| `supabase/migrations/20260320_improvement_items_anti_dupe.sql` | `UNIQUE(analytics_id)` en `cesarin_improvement_items` |
| `SESSION_SUMMARY_2026_03_20_B.md` | Este documento |

### Archivos modificados

| Archivo | Lane | Cambio |
|---|---|---|
| `src/types/cesarin.ts` | Lane 1 | `'improvements'` añadido al union `NavTab.id` |
| `src/components/admin/cesarin/TabImprovements.tsx` | Lanes 1 + 2 | Closure guard + error schema state + anti-fragmentation description |
| `src/components/admin/cesarin/ReviewDrawer.tsx` | Lane 1 | Handle `null` return de `createImprovementItemFn` |
| `src/services/admin/admin-improvement.service.ts` | Lane 1 | `createImprovementItem` retorna `null` en error `23505` |
| `src/components/admin/cesarin/TabAnalytics.tsx` | Lane 2 | Carga independiente KPIs vs query log; `capsuleUnavailable` state |
| `src/lib/ai-capsule-schemas.ts` | Lane 4 | `section` añadido a `internalResolvedProductSchema` |
| `src/services/ai-capsule-orchestrator.service.ts` | Lane 4 | `section` en SELECT + `mapDbToInternal` |
| `src/components/ui/ai/AIConcierge.tsx` | Lane 4 | PDP navigation + quick-add rehydration |

---

## Estado del Sistema al Cierre

| Área | Estado |
|---|---|
| Queue de mejoras — closure discipline | ✅ `resolved`/`wont_fix` requieren evidencia |
| Queue de mejoras — anti-duplication | ✅ `UNIQUE(analytics_id)` DB + null-return service + info toast UI |
| Queue de mejoras — anti-fragmentation | ✅ Descripción clarifica distinción con Tab 5.5 |
| NavTab typing | ✅ `'improvements'` en union — sin drift |
| Analytics tab runtime | ✅ KPIs independientes del query log; degradación parcial si migración ausente |
| Improvements tab runtime | ✅ Banner de migración pendiente en lugar de error silencioso |
| Dependencias DB live | 📋 Cadena documentada — 6 migraciones a aplicar en orden |
| PDP navigation AI cards | ✅ `/${section}/${slug}` — sin hardcode, sin reload |
| Quick-add cart | ✅ Rehydratación desde catálogo — Product shape completo garantizado |

---

## Brechas Residuales Documentadas

- **Migraciones live DB:** Las 6 migraciones de la cadena no han sido aplicadas — el admin runtime permanece degradado hasta su aplicación
- **`response_text` migración:** Sin ella, el tab de analíticas no puede mostrar distribución de cápsulas (degradado, no crasheado gracias a Lane 2)
- **Quick-add latencia:** La rehydratación agrega un round-trip de red al click de add-to-cart; sin loading indicator en el botón durante la fetch
- **`prod.cover_image || prod.images?.[0]`:** Cards AI todavía intentan usar `cover_image`/`images` que no existen en `InternalResolvedProduct` — display-only concern, no commerce-closure bug
- **Owner display en TabImprovements:** Muestra "asignado" (presencia), no nombre — requiere join a `admin_users`
- **Deduplicación del toggle de promoción:** Ahora protegida por `UNIQUE(analytics_id)` — resuelto
- **Edge function fallback products:** Si el path genérico retorna productos sin `section`, el navigation fallback usa `'vape'` — best-effort, no guarantee

---

## Commits de la Sesión

```
86a686b  fix(commerce): harden AI → storefront handoff for PDP navigation and quick-add
7a246a5  fix(cesarin): graceful degradation for unapplied migrations in analytics + improvements tabs
c817984  fix(cesarin): integrity hardening pass on governed improvement queue
```
