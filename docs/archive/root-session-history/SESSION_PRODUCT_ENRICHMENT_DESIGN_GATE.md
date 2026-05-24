# Admin Product Enrichment Assistant — Design Gate Session

**Date:** 2026-03-20
**Type:** Cold Design Gate — Read Only
**Status:** ✅ Design approved. No implementation executed.
**Output:** [PRODUCT_ENRICHMENT_ASSISTANT_DESIGN.md](PRODUCT_ENRICHMENT_ASSISTANT_DESIGN.md)

---

## Context

Following the completion of Cesarin telemetry and quality repairs (documented in [SESSION_SUMMARY_CESARIN_REPAIRS.md](SESSION_SUMMARY_CESARIN_REPAIRS.md)), the strategic priority shifted from pilot repair to making the AI genuinely useful for the business.

The first move in that direction: design an Admin Product Enrichment Assistant that helps operators create better products while simultaneously improving Cesarin's reasoning capability.

---

## What Was Audited

### Files read

| File | Purpose |
|---|---|
| `src/pages/admin/AdminProducts.tsx` | Product admin page orchestrator — shows AI sync button already wired |
| `src/services/admin/admin-products.service.ts` | Product schema, `generateProductCopy()` call, `ProductFormData` type |
| `src/components/admin/products/ProductEditorDrawer.tsx` | 4-tab editor: Comercial / Clasificación / Configuración / Inteligencia |
| `supabase/functions/product-intelligence/index.ts` | Edge function — exists, deployed, has enrichment action wired |
| `src/constants/specs.constants.ts` | Canonical spec key ontology per category (`SUGGESTED_SPECS`) |

---

## Key Findings

### The foundation is stronger than expected

The edge function, schema fields, and UI entry point all exist today. The MVP is an evolution, not a greenfield build:

- `product-intelligence` edge function: **deployed and wired**
- `ai_sales_note`, `specs`, `tags`, `description`, `short_description`: **all in current schema**
- `specs["Compatibilidad"]`: **already a canonical key** in `specs.constants.ts`
- "Optimizar con IA" button in Inteligencia tab: **already calls the function**

### Pre-existing bug found

`product-intelligence/index.ts:69` uses `/v1beta/` endpoint with `responseMimeType: "application/json"` in `generationConfig`. This is the exact same payload drift that caused silent failures in `customer-intelligence` and was fixed there. The enrichment expansion cannot safely proceed on this foundation without fixing this first.

### Current enrichment gaps

| Gap | Impact |
|---|---|
| Only generates 3 fields (description, short_description, tags) | `ai_sales_note` and `specs` never populated by AI despite fields existing |
| No category context passed to edge function | AI can't propose spec values without knowing category |
| Auto-apply without review | Unsafe for specs and compatibility — wrong data is worse than no data |
| No compatibility hint generation | Cesarin's check_compatibility tool can't answer "¿Me queda?" on most products |

---

## Design Decisions

### 1. MVP enrichment output — 5 fields

| Field | Schema Column | Value Example |
|---|---|---|
| Short description | `short_description` | "Pod compacto para nicotina en sal, recargable." |
| Long description | `description` | 3-paragraph marketing copy |
| Sales angle | `ai_sales_note` | "Ideal para quienes migran de cigarrillo clásico." |
| Structured specs | `specs` (JSONB merge) | `{ "Puffs": "7000", "Nicotina": "50mg/ml" }` |
| Semantic tags | `tags[]` | `["pod-system", "nic-sal", "recargable"]` |

Compatibility hint (`specs["Compatibilidad"]`) is included with an unverified warning — never auto-applied.

### 2. Highest-value fields (for both admin and Cesarin)

| Rank | Field | Admin Value | Cesarin Value |
|---|---|---|---|
| 1 | `specs` | Fastest time-save on data entry | Enables check_compatibility tool |
| 2 | `ai_sales_note` | Copywriting shortcut | Product card recommendation angle |
| 3 | `tags` | Semantic labeling | Search routing accuracy |

### 3. Auto-generated vs. suggested for human approval

| Field | Mode |
|---|---|
| `description` | Auto-suggest (editable before save) |
| `short_description` | Auto-suggest (editable before save) |
| `ai_sales_note` | Suggest → operator approves |
| `specs` (non-compatibility) | Suggest → operator approves per key |
| `specs["Compatibilidad"]` | Suggest only with ⚠ unverified warning — operator must explicitly confirm |
| `tags` | Suggest → operator toggles per tag |

### 4. Storage: no schema migrations for MVP

All 5 MVP fields map to existing columns. `specs` applies as a **merge** (never overwrites human-entered data). Two fields are deferred to a future phase and require schema additions:

| Deferred Field | Type | Purpose |
|---|---|---|
| `ai_keywords` | `string[]` | Pure search-index terms, distinct from display tags |
| `concept_links` | `string[]` | Cesarin domain reasoning concepts (e.g., "DTL vaping", "nic salt") |

### 5. UX shape: review-and-apply panel

Replace the current auto-apply button with an inline enrichment review panel inside the Inteligencia tab:

```
[After AI runs — appears below existing fields]

┌────────────────────────────────────────────────────┐
│ ✨ SUGERENCIAS DE ENRIQUECIMIENTO                  │
│  (Pendiente aprobación)                            │
│────────────────────────────────────────────────────│
│ Short Description                                  │
│  [Pod compacto para nicotina en sal, recargable.]  │
│  [Aplicar]  [Descartar]                            │
│                                                    │
│ Sales Note                                         │
│  [Ideal para quienes migran de cigarrillo clásico] │
│  [Aplicar]  [Descartar]                            │
│                                                    │
│ Specs sugeridos                                    │
│  Puffs: 7000            [Aplicar] [Editar] [✗]    │
│  Nicotina: 50mg/ml      [Aplicar] [Editar] [✗]    │
│  Compatibilidad: ...    [⚠ Verificar antes] [✗]   │
│                                                    │
│ Tags sugeridos                                     │
│  [pod-system ✓] [nic-sal ✓] [recargable ✗]       │
│  (click para toggle)                               │
│────────────────────────────────────────────────────│
│ [Aplicar Aprobadas]              [Descartar Todo]  │
└────────────────────────────────────────────────────┘
```

Panel state is ephemeral (component-local) until the main Save button is clicked.

### 6. Edge function contract evolution

**Current:** `POST { action: 'generate_copy', name, description? }` → `{ description, short_description, tags }`

**Target:** `POST { action: 'enrich_product', name, section, category_slug, current_specs?, description? }` → `{ description, short_description, ai_sales_note, specs, tags, confidence, warnings[] }`

Key additions:
- `category_slug` input → AI uses `SUGGESTED_SPECS[category_slug]` as spec key targets
- `current_specs` input → AI skips already-filled keys
- `ai_sales_note` in output → populates the existing but always-empty column
- `specs` in output → scoped to canonical keys only, never invents arbitrary keys
- `warnings[]` → surfaces AI uncertainty (compatibility claims, low-confidence values)
- `confidence: 'high' | 'medium' | 'low'` → drives UI visual indicators

### 7. Why this improves Cesarin without touching Cesarin

```
Before enrichment:
  User: "¿Me queda el XROS 4 Mini?"
  Cesarin: check_compatibility → specs["Compatibilidad"] = ""
  → Falls back: "No tengo información de compatibilidad"

After enrichment:
  User: "¿Me queda el XROS 4 Mini?"
  Cesarin: check_compatibility → specs["Compatibilidad"] = "Coils XROS 4 Series"
  → Answers accurately, builds trust
```

Every enriched product is a Cesarin capability improvement with no edge-function changes required. The enrichment assistant is the data-quality pipeline that feeds Cesarin's reasoning.

---

## Risks

| Risk | Probability | Mitigation |
|---|---|---|
| AI hallucinates incorrect spec values | Medium | Suggest-not-apply; operator verifies |
| AI provides wrong compatibility claims | High | Warning indicator; never auto-apply |
| Operators skip review and accept all blindly | Medium | Warning design reduces this; can't eliminate |
| v1beta bug causes silent failures | High | Fix before expanding scope (Step 1) |
| Tags pollute existing clean taxonomy | Low | Merge-not-replace; operator toggles per tag |

---

## Scope Guard

This design does NOT cover:
- Bulk enrichment (per-product only in MVP)
- Simulator or concept-learning interface
- Cesarin training pipeline (indirect benefit only)
- Autonomous apply without human approval

---

## Exact Next Move — 5 Steps

### Step 1 (Blocker): Fix v1beta bug
`supabase/functions/product-intelligence/index.ts:69`
- Change `/v1beta/` → `/v1/`
- Remove `responseMimeType: "application/json"` from `generationConfig`
- Deploy function

### Step 2: Add `enrich_product` action to edge function
- Accept `{ name, section, category_slug, current_specs?, description? }`
- Build category-aware prompt using `SUGGESTED_SPECS[category_slug]`
- Return enrichment package: `{ description, short_description, ai_sales_note, specs, tags, confidence, warnings }`
- Spec keys scoped strictly to `SUGGESTED_SPECS[category_slug]` + `SECTION_DEFAULT_SPECS[section]`

### Step 3: Add `EnrichmentReviewPanel` to ProductEditorDrawer
- Renders inline in Inteligencia tab after AI call completes
- Per-field toggle (accept/reject)
- Compatibility suggestions carry `⚠` unverified warning
- "Aplicar Aprobadas" applies only accepted fields as merge (not overwrite)
- Panel state is component-local (ephemeral until Save)

### Step 4: Update client call
`generateProductCopy()` → new call signature passing `section`, `category_slug`, `current_specs` from form state.

### Step 5: Deploy and validate on 3 products
Run enrichment on: 1 disposable, 1 pod kit, 1 liquid. Review AI spec proposals against actual product specs. Adjust prompt if needed before broader rollout.

---

## Files

| File | Status |
|---|---|
| `PRODUCT_ENRICHMENT_ASSISTANT_DESIGN.md` | ✅ Created — full design specification |
| `SESSION_PRODUCT_ENRICHMENT_DESIGN_GATE.md` | ✅ Created — this document |
| All source files | Unchanged |
| All canon docs | Unchanged |

---

_Design gate complete. The enrichment assistant is 60% built already — the work is completing the edge function contract, scoping it to category-aware spec generation, and replacing auto-apply with a human review step._
