# Admin Product Enrichment Assistant — Cold Design Gate

**Date:** 2026-03-20
**Type:** Design audit — READ ONLY. No implementation.
**Scope:** Minimum viable but strategically strong Product Enrichment Assistant for the admin product workflow.

---

## Current State Findings (Before Design)

### What already exists

The `product-intelligence` edge function is deployed and wired. The `ProductEditorDrawer` "Inteligencia" tab already calls it via `generateProductCopy()`. This is the foundation to build on, not replace.

**Current enrichment capability:**
- Action: `generate_copy`
- Input: product name + optional current description
- Output: `{ description, short_description, tags[] }` — 3 fields only
- Applied: Immediately to formData, no human review step

**Current product schema enrichment-relevant fields:**
```
description          string   — long copy
short_description    string   — short copy
tags                 string[] — semantic labels
specs                JSONB    — key-value structured specs
ai_sales_note        string   — AI sales angle (field exists, never populated by AI)
ai_is_featured       boolean  — AI feature flag
ai_exclude           boolean  — AI exclusion flag
```

**Critical bug found (not blocking design, flagged for execution):**
`product-intelligence/index.ts:69` uses `/v1beta/` endpoint with `responseMimeType: "application/json"` in `generationConfig`. This is the same payload drift that caused silent failures in `customer-intelligence`. The function may work intermittently or fail silently in production.

### What's missing today

| Gap | Field | Currently In Schema | Impact |
|---|---|---|---|
| AI sales angle | `ai_sales_note` | YES — never populated by AI | High — used in Cesarin product card responses |
| AI-proposed specs | `specs` (JSONB) | YES — only manual entry | High — enables Cesarin check_compatibility tool |
| Compatibility hint | `specs["Compatibilidad"]` | YES, via spec key | High — Cesarin can answer "¿Me queda?" questions |
| Enrichment review step | UI pattern | NOT in current UX | High — auto-apply without review is unsafe |
| Category-aware generation | Prompt context | NOT passed to edge function | Medium — specs suggestions are generic without it |
| Search/semantic keywords | `tags[]` | YES — partly | Medium — tags serve double duty |
| Concept links for Cesarin | n/a | NOT in schema | Low (deferred) |

---

## Design: MVP Enrichment Output

The enrichment MVP should return a **structured enrichment package** — not a set of strings to blindly apply, but a proposal object the admin reviews before committing.

### Enrichment Package Contract

```typescript
interface EnrichmentPackage {
    // Tier 1: Copy (high confidence, low stakes)
    short_description: string;          // Max 20 words
    description: string;                // 3+ paragraphs, SEO-oriented
    ai_sales_note: string;              // 1–2 sentences: use case + buyer angle

    // Tier 2: Structured data (medium confidence, high stakes if wrong)
    specs: Record<string, string>;      // Category-aware spec key-value pairs
    tags: string[];                     // 5–8 semantic tags

    // Meta
    confidence: 'high' | 'medium' | 'low';
    warnings: string[];                 // AI uncertainty signals
}
```

**What goes in each field:**

| Field | Example | AI Confidence | Stakes if Wrong |
|---|---|---|---|
| `short_description` | "Pod sistema compacto ideal para nicotina en sal." | High | Low |
| `description` | Long marketing copy 3 paragraphs | High | Low |
| `ai_sales_note` | "Perfecto para usuarios que migran de cigarrillo." | Medium | Low |
| `specs["Puffs"]` | "7000" | Medium | Medium |
| `specs["Nicotina"]` | "50mg/ml" | Medium | Medium |
| `specs["Compatibilidad"]` | "Coils XROS 4, XROS Pro" | Low | HIGH |
| `tags` | ["pod-system", "nicotina-sal", "recargable"] | High | Low |

---

## Highest-Value Fields

**For admin workflow efficiency:**

1. `ai_sales_note` — Operators spend significant time on this field. It's currently empty on most products. AI can draft it in seconds, human approves in one click.
2. `specs` (category-aware) — Manual spec entry is slow and inconsistent. AI can propose the right keys with pre-filled values. Human validates accuracy. This is the biggest time-save.
3. `short_description` — Low friction, high frequency, appropriate for auto-suggestion.

**For Cesarin learning and reasoning:**

1. `specs` — Cesarin's `check_compatibility` tool queries `specs["Compatibilidad"]` directly. Products without this populated are invisible to compatibility queries. **This is the highest-leverage field for AI accuracy.**
2. `tags` — Cesarin's Analyst uses tags for product search intent matching. Rich, accurate tags directly improve search result relevance.
3. `ai_sales_note` — Cesarin's product card responses currently pull from this field for the recommendation angle. Empty field = generic response.

**The intersection — fields that help both simultaneously:**

| Rank | Field | Admin Value | Cesarin Value |
|---|---|---|---|
| 1 | `specs` | Fast structured entry | Enables check_compatibility + accurate search |
| 2 | `ai_sales_note` | Copywriting shortcut | Product card recommendation angle |
| 3 | `tags` | Semantic labeling | Search routing accuracy |

---

## Auto-Generated vs. Suggested for Human Approval

**Hard rule:** Compatibility data must never auto-apply. If wrong, it actively misleads users who ask Cesarin "¿Me queda este coil?" The fallout (wrong purchase) is worse than no data.

| Field | Mode | Reason |
|---|---|---|
| `description` | Auto-suggest + editable | Low-stakes copy; operator can edit before saving |
| `short_description` | Auto-suggest + editable | Low-stakes; easy to verify |
| `ai_sales_note` | Suggest → human approves | Tone/angle is brand voice decision |
| `tags` | Suggest → human approves per tag | Some generated tags may be wrong brand/category |
| `specs` (non-compat) | Suggest → human approves per key | Numbers must be verified |
| `specs["Compatibilidad"]` | Suggest ONLY, clearly flagged as unverified | HIGH stakes — wrong = user misinformation |

**UI implication:** The enrichment panel must clearly distinguish "auto-applied" from "pending approval". Compatibility suggestions must carry a visible unverified warning before approval.

---

## Storage Strategy

### No schema changes needed for MVP

All MVP enrichment fields map directly to existing columns:

```
EnrichmentPackage.description      → products.description
EnrichmentPackage.short_description → products.short_description
EnrichmentPackage.ai_sales_note    → products.ai_sales_note
EnrichmentPackage.specs            → products.specs (JSONB merge)
EnrichmentPackage.tags             → products.tags (array merge, not replace)
```

**Key principle:** Enrichment applies as a **merge**, not an **overwrite**. Existing human-entered specs are never removed by AI suggestions.

### Deferred schema additions (not MVP, flagged for future)

Two fields would be high-value additions once MVP is validated:

| Field | Type | Purpose | When to Add |
|---|---|---|---|
| `ai_keywords` | `string[]` | Pure search-index terms distinct from display tags | After verifying tag/search accuracy baseline |
| `concept_links` | `string[]` | Cesarin domain concepts (e.g., "DTL vaping", "nic salt") | When simulator or concept-learning lane opens |

These require a schema migration. Do not add until the enrichment workflow is validated on existing fields.

---

## Minimum Safe Admin UX Shape

### Current UX (problematic)

```
[Inteligencia Tab]
  "Optimizar con IA" button
  → Calls edge function
  → Immediately overwrites: description, short_description, tags in formData
  → No preview
  → No per-field approval
  → No confidence signaling
```

### Target UX (review-and-apply pattern)

The core change: **AI generates a proposal; human reviews and applies per field.**

```
[Inteligencia Tab — Current Fields]
  Description textarea    ← human-editable
  AI Sales Note textarea  ← human-editable

[NEW: Enrichment Panel — appears after AI runs]

  ┌────────────────────────────────────────────────────┐
  │ ✨ SUGERENCIAS DE ENRIQUECIMIENTO                  │
  │  (Gemini — pendiente aprobación)                   │
  │────────────────────────────────────────────────────│
  │ Short Description                                  │
  │  [Pod compacto para nicotina en sal, recargable]   │
  │  [Aplicar] [Descartar]                             │
  │                                                    │
  │ Sales Note                                         │
  │  [Ideal para quienes migran de cigarrillo clásico] │
  │  [Aplicar] [Descartar]                             │
  │                                                    │
  │ Specs sugeridos                                    │
  │  Puffs: 7000          [Aplicar] [Editar] [✗]      │
  │  Nicotina: 50mg/ml    [Aplicar] [Editar] [✗]      │
  │  Compatibilidad: ...  [⚠ Verificar antes] [✗]     │
  │                                                    │
  │ Tags sugeridos                                     │
  │  [pod-system ✓] [nic-sal ✓] [recargable ✗]       │
  │  (click para toggle)                               │
  │────────────────────────────────────────────────────│
  │ [Aplicar Sugerencias Aprobadas]   [Descartar Todo] │
  └────────────────────────────────────────────────────┘
```

### UX Constraints

- Panel is **not a modal** — it renders inline in the Inteligencia tab below existing fields
- Panel appears only after AI runs; hidden by default
- "Aplicar Sugerencias Aprobadas" only commits fields the operator toggled as accepted
- Compatibility spec carries a persistent warning indicator until human explicitly confirms it
- AI can be re-run without losing already-approved suggestions
- Panel state is ephemeral (lives in component state, not persisted until Save is clicked)

---

## Edge Function Contract Evolution

### Current call contract

```
POST product-intelligence
Body: { name: string, description?: string, action: 'generate_copy' }
Returns: { description, short_description, tags[] }
```

### Target call contract (MVP)

```
POST product-intelligence
Body: {
    action: 'enrich_product',
    name: string,
    section: 'vape' | '420',
    category_slug: string,                  // enables spec awareness
    current_specs?: Record<string, string>, // avoid re-suggesting already-filled specs
    description?: string                    // existing copy for improvement context
}

Returns: {
    description: string,
    short_description: string,
    ai_sales_note: string,
    specs: Record<string, string>,          // only keys from SUGGESTED_SPECS[category_slug]
    tags: string[],
    confidence: 'high' | 'medium' | 'low',
    warnings: string[]                      // e.g., ["Compatibilidad requiere verificación manual"]
}
```

**Key differences from current:**
1. `category_slug` input → AI can use `SUGGESTED_SPECS` keys as spec targets
2. `ai_sales_note` in output → populates the already-existing field
3. `specs` in output → scoped to category-appropriate keys only, never invents arbitrary keys
4. `warnings[]` → surface uncertainty to operator (e.g., compatibility claims)
5. `confidence` → drives UI indicators per suggestion

---

## Prompt Strategy

### What the enrichment prompt needs to do differently

**Current prompt weakness:** Generic copywriting prompt with no category or domain context. Tags are "5 relevant tags" with no vape domain awareness.

**Target prompt approach:**

```
System context:
- You are a product specialist for VSM Store (premium vapes + cannabis accessories in Colombia)
- The product is in category: {category_slug}
- The section is: {section}
- Known spec keys for this category: {SUGGESTED_SPECS[category_slug]}

Product context:
- Name: {name}
- Existing description: {description}
- Existing specs already filled: {current_specs}

Output what you know with confidence.
For specs values: provide realistic values based on the product name/type.
For Compatibilidad: only fill if the product name makes compatibility explicit. Otherwise, omit it and include "Compatibilidad requiere verificación" in warnings[].
For tags: use vape-domain-specific terms (e.g., "dtl", "mtl", "nic-sal", "salt-nicotine", "recargable")
```

**The spec scoping is critical:** The AI must only propose values for keys in `SUGGESTED_SPECS[category_slug]`, not invent arbitrary keys. This preserves catalog consistency.

---

## Why This Is Strategically Right for Cesarin

This is not just an admin productivity feature. Every product enriched via this assistant directly improves what Cesarin can say:

**Before enrichment:**
```
User: ¿Me queda el XROS 4 Mini?
Cesarin: [check_compatibility] → specs["Compatibilidad"] = ""
→ Cannot answer compatibility question
→ Falls back to: "No tengo información de compatibilidad para este producto"
```

**After enrichment:**
```
User: ¿Me queda el XROS 4 Mini?
Cesarin: [check_compatibility] → specs["Compatibilidad"] = "Coils XROS 4 Series y XROS Pro"
→ Answers accurately
→ Builds user trust
```

**This is the connection between admin quality and AI quality.** The enrichment assistant is the data-quality pipeline that feeds Cesarin's reasoning. Every product with complete specs/compatibility is a Cesarin capability improvement with no edge-function changes required.

---

## Known Risks and Mitigations

| Risk | Probability | Mitigation |
|---|---|---|
| AI hallucinates incorrect spec values (e.g., wrong puff count) | Medium | Suggest-not-apply pattern; operator verifies before committing |
| AI provides incorrect compatibility claims | High for specific coils | Warning indicator on compatibility field; never auto-apply |
| Operators skip review and accept all blindly | Medium | Cannot eliminate; but warning design reduces this |
| Edge function v1beta bug causes intermittent failures | High (already documented) | Fix before implementing enrichment scope expansion |
| Generated tags pollute existing clean tag taxonomy | Low | Tags merge (not replace); dedup; operator toggles individually |
| AI generates Spanish copy with wrong tone/brand voice | Low | ai_sales_note is clearly AI-labeled; operator edits |

---

## What This Is NOT (Scope Guard)

- **Not a simulator.** No product concept-learning, no "explain this product to me" interface.
- **Not a Cesarin training pipeline.** This enriches product records. Cesarin consumes those records. The connection is indirect.
- **Not a bulk enrichment tool.** MVP is per-product enrichment in the editor drawer only. Bulk comes after quality is validated.
- **Not an autonomous agent.** Human approval is required before any enrichment data is saved.

---

## 1. What Changed

Nothing. This is a design document. No files were modified, no code was written.

---

## 2. What Is Validated

- The `product-intelligence` edge function exists and is the correct foundation for enrichment
- `ai_sales_note`, `specs`, `tags` are already in the product schema — no migration needed for MVP
- `specs["Compatibilidad"]` is already a canonical spec key in `specs.constants.ts` — no schema invention needed for compatibility hints
- The UI entry point (Inteligencia tab + `handleAIGenerate`) already exists and is wired to the edge function
- The edge function currently uses `/v1beta/` with `responseMimeType` — this is a pre-existing bug requiring a fix before expanding scope
- Auto-apply-without-review is the specific UX pattern that makes current enrichment unsafe to expand

---

## 3. What Remains Open

- Product schema does not currently have `ai_keywords` or `concept_links` — these are deferred to a later phase after MVP validation
- No Supabase RLS constraint for `ai_enrichment` audit trail — enrichment changes are indistinguishable from manual edits in `updated_at`
- Compatible coil/battery data currently exists only if operators manually fill `specs["Compatibilidad"]` — AI enrichment can only infer from product name, not from a structured compatibility matrix
- No rate limiting on edge function calls — not a problem at gated pilot scale but needs consideration before broad rollout
- Edge function uses `gemini-2.5-flash-lite` — adequate for copy generation, but spec accuracy may benefit from a more capable model when the domain knowledge is complex

---

## 4. What Is Approved

This design is approved as the target state for MVP product enrichment. The following decisions are made:

- **Approach:** Extend existing `product-intelligence` function (not create a new one)
- **New action:** `enrich_product` (existing `generate_copy` remains backward-compatible)
- **No schema changes** for MVP — use `description`, `short_description`, `ai_sales_note`, `specs`, `tags`
- **Review-and-apply UX** (not auto-apply) — non-negotiable for spec/compatibility fields
- **Category-aware prompting** — `category_slug` must be passed to the edge function
- **Compatibility warnings** — any compatibility suggestion must carry an explicit unverified warning in the UI until operator confirms

---

## 5. Exact Next Move

**Execute in this order:**

### Step 1 (Blocker): Fix the v1beta bug in product-intelligence
`supabase/functions/product-intelligence/index.ts:69`
Change `/v1beta/` to `/v1/` and remove `responseMimeType: "application/json"` from `generationConfig`. This is the same payload drift already fixed in `customer-intelligence`. Without this fix, expanding the enrichment scope on a broken foundation is wasted effort.

### Step 2: Expand edge function to `enrich_product` action
Add the `enrich_product` action to `product-intelligence/index.ts`:
- Accept `{ name, section, category_slug, current_specs?, description? }`
- Build a category-aware prompt using `SUGGESTED_SPECS[category_slug]` keys as spec targets
- Return: `{ description, short_description, ai_sales_note, specs, tags, confidence, warnings }`
- Scope spec keys strictly to `SUGGESTED_SPECS[category_slug]` + `SECTION_DEFAULT_SPECS[section]`
- Include `warnings[]` for any compatibility claims

### Step 3: Add enrichment review panel to ProductEditorDrawer
Add a `EnrichmentReviewPanel` sub-component to the Inteligencia tab:
- Renders after AI call completes (replaces loading spinner)
- Per-field toggle (accept/reject)
- Compatibility suggestions carry `⚠` indicator
- "Aplicar Aprobadas" applies only accepted fields as a merge (not overwrite)
- Panel state is component-local (ephemeral until Save is clicked)

### Step 4: Update `generateProductCopy` call in useAdminProducts
Change from `action: 'generate_copy'` to `action: 'enrich_product'` and pass `section`, `category_slug`, `current_specs` from form state.

### Step 5: Deploy and validate on 3 real products
Run the enrichment on 3 representative products (1 disposable, 1 pod kit, 1 liquid). Review what the AI proposes for specs and compatibility. Validate that spec keys match `SUGGESTED_SPECS`. Adjust prompt if needed.

---

_Design gate complete. The foundation is stronger than expected — the edge function, schema fields, and UI entry point all exist. The MVP is an evolution, not a greenfield build._
