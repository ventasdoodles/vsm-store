# AI Sales Note → Product Search Capsule Bridge

**Date:** 2026-03-20
**Type:** Execution — Surgical patch
**Commit:** `59df223`
**Status:** ✅ Shipped. TypeScript clean. Zero regressions.

---

## What Was Built

`ai_sales_note` is now wired into the client-side `product_search_integrity` capsule — the real Cesarin response path for product queries. Enriched product data now flows from the database through the capsule pipeline and reaches both the conversational response text and the product card attachments.

---

## Why This Mattered

The cold audit (COLD_AUDIT_ENRICHMENT_CESARIN.md) established that:

- Product search never reaches the edge-function Sommelier — it returns `requires_client_capsule: true` and the client-side capsule owns the entire response
- `ai_sales_note` was stored in the DB but consumed by nothing
- The capsule's product queries selected only `id, slug, name, price, stock, ai_is_featured` — the sales note was never fetched
- `customer_response_draft` was a static string with no per-product context

This lane closed that gap.

---

## Data Flow After This Patch

```
products table (ai_sales_note populated by admin enrichment)
    ↓
executeProductSearchCapsule() — orchestrator
    exact query: SELECT id, slug, name, price, stock, ai_is_featured, ai_sales_note  ← NEW
    semantic query: match_products RPC → p.ai_sales_note ?? null                      ← NEW (read-through)
    ↓
mapDbToInternal()
    ai_sales_note: p.ai_sales_note ?? null                                             ← NEW
    ↓
InternalResolvedProduct { ..., ai_sales_note?: string | null }                         ← NEW field
    ↓
evaluateProductSearchFallbackTree()
    BRANCH C (EXACT): customer_response_draft enriched with topNote when present       ← NEW
    All other branches: unchanged static drafts
    ↓
InternalCapsuleContract.resolved_products[]  (carry ai_sales_note per product)
    ↓
concierge.service.ts
    message = capsuleContract.customer_response_draft    ← now includes sales note on EXACT
    suggestedProducts = capsuleContract.resolved_products ← carry ai_sales_note
    ↓
mapCapsuleToFrontendResponse() → PublicAttachment[]
    ai_sales_note: conditionally spread when present                                   ← NEW
    ↓
UI card component (PublicAttachment)
    ai_sales_note available for rendering as product tagline
```

---

## Exact Changes

### 1. `src/lib/ai-capsule-schemas.ts`

Two schema additions:

```typescript
// internalResolvedProductSchema — internal capsule data
ai_sales_note: z.string().nullable().optional()

// publicAttachmentSchema — UI card contract
ai_sales_note: z.string().nullable().optional()
```

### 2. `src/services/ai-capsule-orchestrator.service.ts`

**Query change** — exact match SELECT:
```typescript
// BEFORE
.select('id, slug, name, price, stock, ai_is_featured')

// AFTER
.select('id, slug, name, price, stock, ai_is_featured, ai_sales_note')
```

**Mapper change** — `mapDbToInternal()`:
```typescript
// BEFORE
return { id, slug, name, display_price, raw_stock, status_signal, commercial_flag };

// AFTER
return { id, slug, name, display_price, raw_stock, status_signal, commercial_flag,
         ai_sales_note: p.ai_sales_note ?? null };
```

### 3. `src/lib/product-search-capsule.ts`

**BRANCH C (EXACT match) — response text enrichment:**
```typescript
// BEFORE
customer_response_draft: '¡Aquí tienes exactamente lo que buscabas!'

// AFTER
const topNote = exactInStock[0]?.ai_sales_note;
const exactDraft = topNote
  ? `¡Aquí tienes exactamente lo que buscabas! ${topNote}`
  : '¡Aquí tienes exactamente lo que buscabas!';
customer_response_draft: exactDraft
```

All other branches (AMBIGUITY, OUT_OF_STOCK_ALTERNATIVE, SEMANTIC, NO_MATCH, DEGRADED) unchanged.

### 4. `src/lib/ai-capsule-mappers.ts`

**PublicAttachment mapping — conditional spread:**
```typescript
// BEFORE
{ public_id, title, display_price, availability_label }

// AFTER
{ public_id, title, display_price, availability_label,
  ...(prod.ai_sales_note ? { ai_sales_note: prod.ai_sales_note } : {}) }
```

---

## Validation

| Check | Result |
|---|---|
| TypeScript — modified files | ✅ 0 errors |
| Pre-existing errors in admin-products.service.ts (lines 120, 355, 356) | Unchanged — not in scope |
| EXACT match with ai_sales_note present | Note injected into response text |
| EXACT match with ai_sales_note null/missing | Falls back to original static draft |
| All other branches | Unchanged behavior |
| Semantic path (match_products RPC) | ai_sales_note read-through — null if RPC doesn't return it |
| PublicAttachment carries ai_sales_note | ✅ Available for UI rendering |

---

## What Remains Open

| Gap | Notes |
|---|---|
| UI card rendering | `PublicAttachment.ai_sales_note` is now present in the data — the UI card component needs to render it as a subtle tagline. That is a UI-only lane. |
| Semantic RPC coverage | `match_products` RPC result carries `ai_sales_note` only if the SQL function definition returns it. If not, the field is null for semantic matches. Closing fully requires a DB migration to update the RPC SELECT — deferred by lane scope. |
| SEMANTIC / FEATURED_FALLBACK draft enrichment | Only the EXACT branch enriches the response text. The SEMANTIC branch draft (`"No encontré un producto con ese nombre exacto, pero estas opciones..."`) is unchanged. Can be extended in a follow-up. |

---

## Files Summary

| File | Changed | Nature |
|---|---|---|
| `src/lib/ai-capsule-schemas.ts` | ✅ | Added `ai_sales_note` to internal + public schemas |
| `src/services/ai-capsule-orchestrator.service.ts` | ✅ | Added to SELECT + mapDbToInternal |
| `src/lib/product-search-capsule.ts` | ✅ | EXACT branch draft enrichment |
| `src/lib/ai-capsule-mappers.ts` | ✅ | Pass-through to PublicAttachment |
| DB schema | — | Unchanged |
| Edge functions | — | Unchanged |
| Admin components | — | Unchanged |

---

_`ai_sales_note` is now a first-class citizen in the product search capsule. An operator who enriches a product via the admin panel will see that note surface in Cesarin's exact-match response text and in the product card data — for the first time closing the loop between admin enrichment and customer-facing Cesarin responses._
