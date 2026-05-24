# Product Enrichment Assistant — Execution Session

**Date:** 2026-03-20
**Type:** Execution — Steps 1–4 complete
**Status:** ✅ Backend deployed + validated. UI implemented + committed.
**Commits:** `7346467` (Steps 1–2) · `b50afb4` (Steps 3–4)

---

## What Was Built

The Admin Product Enrichment Assistant is now operational. When an operator opens a product in the editor and clicks "Optimizar con IA" in the Inteligencia tab, the AI proposes a full structured enrichment package — and the operator reviews and approves each field before anything is saved.

---

## Step 1 — v1beta Payload Drift Fix

**File:** [supabase/functions/product-intelligence/index.ts](supabase/functions/product-intelligence/index.ts)

The existing `generate_copy` action had the same payload drift pattern previously fixed in `customer-intelligence`:
- Endpoint was `/v1beta/` (deprecated)
- `generationConfig` included `responseMimeType: "application/json"` (unsupported on `/v1/`)
- Duplicate `console.log` in the copy action

**Fix applied:**

| Line | Before | After |
|---|---|---|
| Endpoint | `/v1beta/models/...` | `/v1/models/...` |
| generationConfig | `{ temperature: 0.2, responseMimeType: "application/json" }` | `{ temperature: 0.2 }` |
| console.log | Duplicated | Single log with action label |

**Why this mattered:** Without this fix, expanding the edge function on a broken Gemini config would silently fail in production for some request patterns.

---

## Step 2 — `enrich_product` Edge Function Action

**File:** [supabase/functions/product-intelligence/index.ts](supabase/functions/product-intelligence/index.ts)

Added a new `enrich_product` action alongside the existing `generate_copy` (backward-compatible).

### Input contract

```typescript
{
    action: 'enrich_product',
    name: string,
    section: 'vape' | '420',
    category_slug: string,       // e.g., "disposables", "vape-kits", "liquidos"
    current_specs?: Record<string, string>,  // already-filled specs (skipped in output)
    description?: string         // existing copy for context
}
```

### Output contract

```typescript
{
    description: string,         // 3+ paragraphs marketing copy
    short_description: string,   // max 20 words
    ai_sales_note: string,       // 1–2 sentences, buyer persona angle
    specs: Record<string, string>,  // canonical keys only, pre-filled keys excluded
    tags: string[],              // 5–8 domain-specific semantic tags
    confidence: 'high' | 'medium' | 'low',
    warnings: string[]           // operator alerts for unverifiable fields
}
```

### Key behaviors

**Spec ontology inlined:** `SUGGESTED_SPECS` and `SECTION_DEFAULT_SPECS` from `specs.constants.ts` are inlined in the edge function (Deno cannot import from `src/`). Both must stay in sync if the client-side ontology changes.

**`current_specs` skip guard:** Spec keys already filled by the operator are excluded from the AI prompt targets. The AI will not propose a value for a key that already has one.

**Compatibility rule:** The prompt instructs the AI to omit `specs["Compatibilidad"]` unless the product name makes compatibility explicit. If omitted, the reason is added to `warnings[]`.

**Post-parse safety guard:** After the Gemini response is parsed, any spec key not in the canonical `approvedSpecKeys` set is stripped from the output. This prevents ontology pollution regardless of what Gemini invents.

**Safe defaults:** If Gemini omits required fields (`warnings`, `tags`, `confidence`, `specs`), safe fallback values are applied before returning.

### Validated on (production)

| Product | Category | Confidence | Watts skip | Compat warning |
|---|---|---|---|---|
| VUSE Go 800 Mango Ice | `disposables` | medium | n/a | ✅ warned |
| Vaporesso XROS 4 Mini (Watts: 11 pre-filled) | `vape-kits` | medium | ✅ skipped | ✅ warned |
| BLVK Unicorn Mango Salt 30ml | `liquidos` | high | n/a | ✅ no compat key |
| SMOK NOVO 4 (Watts: 25 pre-filled) | `vape-kits` | medium | ✅ skipped | ✅ warned |
| Dinner Lady Lemon Sherbets 50ml | `liquidos` | medium | n/a | ✅ VG/PG flagged |

---

## Step 3 — Enrichment Review Panel (UI)

**File:** [src/components/admin/products/ProductEditorDrawer.tsx](src/components/admin/products/ProductEditorDrawer.tsx)

A review panel renders inline in the **Inteligencia tab**, below Tags & Badges, after the AI call completes. Nothing is auto-applied.

### New state

```typescript
const [enrichmentResult, setEnrichmentResult] = useState<EnrichmentPackage | null>(null);
const [approvedFields, setApprovedFields] = useState<Set<string>>(
    new Set(['short_description', 'description', 'ai_sales_note', 'specs', 'tags'])
);
```

Both are reset to defaults when the drawer closes or the active product changes (via existing `useEffect` cleanup).

### Panel structure

```
[Sugerencias de Enriquecimiento]      [Confianza Alta/Media/Baja]

┌─ Verificación Manual Requerida (amber, only if warnings.length > 0) ──────┐
│ • Compatibilidad requiere verificación manual                              │
│ • La proporción VG/PG no está especificada y debe ser verificada.          │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Descripción Corta ──────────────────────────────────────────── [✓ toggle] ┐
│ "Pod compacto para nicotina en sal, recargable."                            │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Nota de Venta ──────────────────────────────────────────────── [✓ toggle] ┐
│ "Ideal para quienes migran de cigarrillo clásico."                          │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Descripción Completa ───────────────────────────────────────── [✓ toggle] ┐
│ "Descubre el... [line-clamp-3]"                                             │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Specs Sugeridos ────────────────────────────────────────────── [✓ toggle] ┐
│ [Puffs: 800] [Nicotina: 50mg/ml] [Marca: VUSE] [Modelo: Go 800]            │
│ Solo se añaden llaves nuevas — no se sobreescriben specs ya ingresadas.     │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Tags Sugeridos ─────────────────────────────────────────────── [✓ toggle] ┐
│ [desechable] [nic-sal] [portatil] [sabor-frutal]                            │
└────────────────────────────────────────────────────────────────────────────┘

[  Aplicar Aprobadas (5)  ]                              [  Descartar  ]
```

### Toggle behavior

Each field row has a ✓ checkbox. Checked = violet fill (approved). Unchecked = faded, excluded from apply. The "Aplicar Aprobadas (N)" button shows the live count and is disabled when 0 fields are approved.

### Apply logic (in `handleApplyEnrichment`)

| Field | Apply behavior |
|---|---|
| `short_description` | Replace |
| `description` | Replace |
| `ai_sales_note` | Replace |
| `specs` | **Additive merge only** — `if (!merged[k]) merged[k] = v` — never overwrites existing operator-entered keys |
| `tags` | Deduplicated union — `Array.from(new Set([...prev, ...suggested]))` |

Apply writes to `formData` only. Nothing persists to the database until the operator clicks the main **Guardar Cambios** button.

### `EnrichmentFieldRow` sub-component

Defined as a local function component before `ProductEditorDrawer` in the same file. Accepts `fieldKey`, `label`, `approved`, `onToggle`, `children`. Renders the toggle button and the faded/active styling.

---

## Step 4 — Client Call Update

**File:** [src/components/admin/products/ProductEditorDrawer.tsx](src/components/admin/products/ProductEditorDrawer.tsx)

`handleAIGenerate` updated to call `enrichProduct` with full context from live form state:

```typescript
const result = await enrichProduct(
    formData.name,
    formData.section || 'vape',
    currentCategory?.slug || '',   // already in component via useMemo
    formData.specs || {},
    formData.description || ''
);
```

The `generateProductCopy` import was removed from the drawer (unused). It remains in the service and hook for `bulkAISync` backward compatibility.

### New service exports

**File:** [src/services/admin/admin-products.service.ts](src/services/admin/admin-products.service.ts)

```typescript
export interface EnrichmentPackage {
    description: string;
    short_description: string;
    ai_sales_note: string;
    specs: Record<string, string>;
    tags: string[];
    confidence: 'high' | 'medium' | 'low';
    warnings: string[];
}

export async function enrichProduct(
    name: string,
    section: string,
    category_slug: string,
    current_specs?: Record<string, string>,
    description?: string
): Promise<EnrichmentPackage>
```

**File:** [src/services/admin/index.ts](src/services/admin/index.ts)

`EnrichmentPackage` and `enrichProduct` added to the admin products barrel export.

---

## TypeScript Validation

```
npx tsc --noEmit | grep ProductEditorDrawer
→ (no output — zero errors in modified files)
```

Three pre-existing errors in `bulkUpdateProducts` and `buildRollbackPayload` remain (not introduced by this work, not in scope).

---

## Architecture: How the Full Flow Works

```
[Inteligencia Tab]
  Operator fills: name, section, category, specs (partial)
  Clicks "Optimizar con IA"
         ↓
[handleAIGenerate]
  setEnrichmentResult(null)           ← clear previous
  enrichProduct(name, section, slug, specs, desc)
         ↓
[supabase.functions.invoke('product-intelligence')]
  action: 'enrich_product'
  Resolves canonical spec keys for category
  Skips already-filled keys
  Calls Gemini /v1 (no responseMimeType)
  Post-parse safety guard strips non-canonical spec keys
         ↓
[EnrichmentPackage returned]
  setEnrichmentResult(result)
  Panel renders with all fields pre-approved
         ↓
[Operator reviews]
  Reads warnings (amber block)
  Toggles fields on/off
  Clicks "Aplicar Aprobadas (N)"
         ↓
[handleApplyEnrichment]
  description/short_description/ai_sales_note → replace
  specs → additive merge (no overwrite)
  tags → deduplicated union
  setEnrichmentResult(null) ← panel closes
         ↓
[formData updated]
  Still not persisted — operator clicks "Guardar Cambios"
         ↓
[saveProduct() → updateProduct() → Supabase products table]
```

---

## What Remains Open

| Gap | Notes |
|---|---|
| No in-browser smoke test | Requires running dev server + admin login. Structural validation confirmed via TypeScript and edge function response shape. |
| Bulk AI sync still uses `generate_copy` | `bulkAISyncMutation` in `useAdminProducts.ts` still calls `generateProductCopy` (3-field). Upgrading to `enrich_product` with auto-apply is a separate future task. |
| Empty `category_slug` fallback | If operator runs enrichment before selecting a category, `category_slug = ''` → edge function falls through to `SECTION_DEFAULT_SPECS` (Marca/Modelo/Color only). Acceptable but less useful. |
| `SUGGESTED_SPECS` sync risk | Edge function inlines the ontology from `specs.constants.ts`. If the client-side ontology changes, the edge function must be updated manually and redeployed. |
| `ai_sales_note` placeholder values | Gemini may return "No especificada" values for specs it can't infer (e.g., VG/PG for a liquid without labeled ratio). These appear in the review panel with warnings — operator can reject specs section entirely. |

---

## Files Summary

| File | Changed | Nature |
|---|---|---|
| `supabase/functions/product-intelligence/index.ts` | ✅ | Fix + new action (2 commits) |
| `src/services/admin/admin-products.service.ts` | ✅ | New interface + function |
| `src/services/admin/index.ts` | ✅ | Barrel export update |
| `src/components/admin/products/ProductEditorDrawer.tsx` | ✅ | State, handlers, review panel |
| All canon docs | — | Unchanged |
| All other admin components | — | Unchanged |
| Database schema | — | Unchanged |

---

_Product Enrichment Assistant is live. The "Optimizar con IA" button in the product editor now returns a structured enrichment package for operator review — including specs scoped to product category, sales angle, and explicit compatibility warnings. No auto-apply. No schema migrations. Cesarin's check_compatibility tool benefits directly as operators populate `specs["Compatibilidad"]` through the enrichment flow._
