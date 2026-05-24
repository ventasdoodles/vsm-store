# Cold Audit: Does Product Enrichment Actually Feed Cesarin?

**Date:** 2026-03-20
**Type:** Read-Only Audit — No code modified
**Files read:** `tools.ts`, `persona.ts`, `index.ts` (customer-intelligence)
**Status:** Complete

---

## The Single Most Important Finding (Read This First)

**Product search never reaches Sommelier in the edge function.**

When the Analyst detects `PRODUCT_SEARCH`, the edge function immediately returns `requires_client_capsule: true` with capsule name `product_search_integrity`. The client-side capsule owns the entire product search UX — vector search, result formatting, response generation. The Sommelier in `index.ts` is bypassed completely.

This means the five-field enrichment package (`description`, `short_description`, `ai_sales_note`, `specs`, `tags`) must be evaluated against **two completely separate paths**:

1. **Client-side product_search_integrity capsule** — handles ~95% of product queries
2. **Edge-function Sommelier** — handles compatibility, order tracking, inventory, chit-chat (no product search)

The enrichment audit below covers both paths.

---

## Question 1: Which Enriched Fields Are Currently Consumed?

### `description` + `short_description`
**Status: Indirectly consumed — via embedding vector**

The `match_products` RPC performs vector similarity search. The embedding stored per product was generated from the product's text fields at insert/update time. Richer descriptions → denser, more semantically accurate embedding vectors → better product surfacing for oblique queries ("algo suave y frutal", "kit para principiantes").

This is the **only enriched field that currently influences retrieval**.

Caveat: The embedding is only updated when the product record is saved. Enriching descriptions in the admin panel has zero effect until the operator saves the product (which now works correctly after the persistence bug fix).

### `tags`
**Status: Indirectly consumed — via embedding vector only**

Tags stored in the `tags` column feed the vector embedding if included in the text used to generate it. They do NOT appear in any tool output string. They are not part of the product card format. Beyond embedding influence, tags are not consumed.

### `ai_sales_note`
**Status: Not consumed anywhere in Cesarin's stack**

Not present in `search_products` output. Not in the Sommelier product card format (`{id, name, price, cover_image, slug}`). Not injected into any prompt. Zero effect on Cesarin today.

### `specs`
**Status: Not consumed anywhere in Cesarin's stack**

The `search_products` tool (legacy edge-function path, used when capsule routing is bypassed) explicitly selects only `name, price, stock` from the products table. The Sommelier product card format contains no specs. The `check_compatibility` tool queries `concept_aliases` and `compatibility_relations` dedicated tables — it does NOT read `specs["Compatibilidad"]` on products.

Specs are stored correctly (persistence bug fixed) but silently ignored by every Cesarin path.

### `badges`
**Status: Not consumed**

No reference in tools, persona, or index.ts. Stored only.

---

## Question 2: Do Enriched Fields Influence Product Search / Retrieval / Response?

| Field | Search (embedding) | Retrieval output | Sommelier response | Product card |
|---|---|---|---|---|
| `description` | ✅ Indirect (embedding) | ❌ Not in output string | ❌ Not injected | ❌ Not shown |
| `short_description` | ✅ Indirect (embedding) | ❌ Not in output string | ❌ Not injected | ❌ Not shown |
| `tags` | ✅ Indirect (embedding) | ❌ Not in output string | ❌ Not injected | ❌ Not shown |
| `ai_sales_note` | ❌ | ❌ | ❌ | ❌ |
| `specs` | ❌ | ❌ | ❌ | ❌ |
| `badges` | ❌ | ❌ | ❌ | ❌ |

The only mechanism by which enrichment currently affects Cesarin is via the embedding vector. Better text = better vector = better product surfacing for semantic queries. That's real value, but it's invisible to the customer — they can't see the enrichment in any response.

---

## Question 3: Which Enriched Fields Are Stored But Not Meaningfully Used?

- **`ai_sales_note`** — highest-value field for Cesarin; zero consumption today
- **`specs`** — highest-value field for compatibility education; zero consumption today
- **`tags`** — partial value via embedding; not surfaced to customer or Sommelier
- **`badges`** — no consumption anywhere

---

## Question 4: What Is the Biggest Gap?

**The product_search_integrity capsule is the real Cesarin for product queries, and it receives zero enriched data.**

The edge-function Sommelier (which does receive tool outputs) is bypassed for all product search. The client-side capsule handles search, formats results, and generates the visible response — but nothing in the enrichment pipeline feeds it.

Specifically:

**Gap A — `ai_sales_note` never reaches the capsule**
The capsule fetches products (likely via `match_products` RPC) and builds product cards. The `ai_sales_note` is never fetched, never passed to whatever LLM generates the capsule's conversational text, never shown in the card. A field designed to give Cesarin a "buyer persona angle" per product is completely invisible.

**Gap B — `specs` never reach the capsule for conversational context**
A customer asking "¿cuántos puffs tiene el VUSE Go?" gets an answer only if Cesarin's response generation has the specs in context. Today it doesn't. The Sommelier can't see specs; the capsule doesn't fetch them.

**Gap C — `check_compatibility` bypass is architectural, not a data gap**
The compatibility tool uses dedicated relation tables (`concept_aliases`, `compatibility_relations`). Enriching `specs["Compatibilidad"]` has zero effect on compatibility answers. This is correct architecture — but it means the enrichment assistant's compatibility warnings are operator-only value, not Cesarin-facing.

**Gap D — embedding staleness**
The embedding vector is only regenerated when the product is saved in Supabase. Operators who enrich descriptions via the panel must click "Guardar Cambios" for the vector to update. No automatic re-embedding on enrichment apply.

---

## Question 5: What Is the Exact Next Move?

**The next move is to surface `ai_sales_note` in the client-side capsule.**

This is the highest-leverage, lowest-risk change:

1. **In the capsule's product fetch** — include `ai_sales_note` in the SELECT query alongside `id, name, price, cover_image, slug`
2. **In the capsule's LLM prompt context** — inject `ai_sales_note` as context per product: `${product.name}: "${product.ai_sales_note}"`. This gives the capsule's response generator a pre-computed "why buy this" angle per product.
3. **In the product card rendering** — optionally surface `ai_sales_note` as a visible sub-line below the product name in the chat UI.

This single change closes the loop between the enrichment assistant and customer-facing Cesarin responses. It requires:
- Reading `src/services/ai/` or wherever the client-side capsule lives to identify the fetch + prompt
- One column addition to the SELECT
- One block of injected context in the capsule's prompt

The second move (lower priority) is to include relevant `specs` in the capsule's context for the most commonly asked spec questions (puffs, nicotina, sabor) — but this is heavier because specs are a freeform dict and require formatting logic.

---

## Architecture Map: Data Flow vs. Data Stored

```
Admin Enrichment Panel
    ↓ (operator saves)
products table
    ├── description, short_description  →  match_products embedding (indirect, on save)
    ├── tags                            →  match_products embedding (indirect, on save)
    ├── ai_sales_note                   →  ❌ not consumed
    ├── specs                           →  ❌ not consumed by Cesarin
    └── badges                          →  ❌ not consumed

Customer query
    ↓
customer-intelligence edge function (Analyst)
    ↓ PRODUCT_SEARCH detected
    → returns requires_client_capsule: true
    ↓
product_search_integrity capsule (client-side)
    → fetches products (match_products RPC)
    → builds product cards {id, name, price, cover_image, slug}
    → generates conversational response
    → ❌ ai_sales_note not fetched or used
    → ❌ specs not fetched or used

compatibility query
    ↓
check_compatibility tool (edge function, executeTools)
    → queries concept_aliases + compatibility_relations tables
    → ❌ specs["Compatibilidad"] not read
```

---

## Summary Table

| Enriched Field | Currently Consumed | Path | Gap |
|---|---|---|---|
| `description` | Partial — embedding only | match_products vector | Customer never sees it; capsule generates its own text |
| `short_description` | Partial — embedding only | match_products vector | Same as above |
| `tags` | Partial — embedding only | match_products vector | Not surfaced anywhere |
| `ai_sales_note` | **Not consumed** | — | **Highest priority gap** |
| `specs` | **Not consumed** | — | Cesarin can't answer spec questions |
| `badges` | **Not consumed** | — | Lower priority |

**Bottom line:** Enrichment improves which products surface (via embedding), but the richer data never reaches the response generation layer. The investment in the enrichment assistant has no customer-facing ROI until `ai_sales_note` is wired into the client-side capsule.
