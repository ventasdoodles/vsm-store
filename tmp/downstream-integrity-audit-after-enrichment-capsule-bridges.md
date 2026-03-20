# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD BACKEND LANE — DOWNSTREAM INTEGRITY AUDIT AFTER ENRICHMENT / CAPSULE BRIDGES

## 1. what changed
- The structural path is materially better than before:
  - `ai_sales_note` now reaches customer-visible Cesarin runtime in both EXACT and SEMANTIC paths.
  - `specs` now reach semantic drafting and influence the semantic response text.
- The remaining cold gaps are no longer in the active Antigravity bridges themselves.
- The residual issues are now structural asymmetries and field drop-offs between retrieval, mapper, contract, and runtime UI handoff.

## 2. what is validated
- **A) Which enriched fields now truly reach customer-visible runtime**
  - `ai_sales_note`
    - EXACT path: yes
      - `src/services/ai-capsule-orchestrator.service.ts` exact query selects `ai_sales_note`
      - `src/lib/product-search-capsule.ts` uses it in the exact-match draft
      - `src/components/ui/ai/AIConcierge.tsx` renders it in product cards when present
    - SEMANTIC path: yes
      - `match_products` latest migrations include `ai_sales_note`
      - mapper carries it
      - product cards render it
  - `specs`
    - SEMANTIC path: yes, indirectly
      - semantic path now carries `specs`
      - `src/lib/product-search-capsule.ts` uses curated facts from `specs` in semantic drafting
    - EXACT path: no
- **B) Which enriched fields still die in transit, and exactly where**
  - `description`
    - semantic RPC returns it
    - but `src/services/ai-capsule-orchestrator.service.ts` drops it in `mapDbToInternal()`
    - it does not reach `resolved_products`, public attachments, or card rendering
  - `short_description`
    - not selected in exact query
    - not returned by `match_products`
    - not present in internal capsule schema
    - dies before mapper/runtime
  - `tags`
    - not selected in exact query
    - not returned by `match_products`
    - not present in internal capsule schema
    - dies before mapper/runtime
  - `badges`
    - structurally absent from exact/semantic capsule path
    - not relevant to current accepted lane, but still excluded
- **C) Is `match_products` structurally complete for the intended semantic path?**
  - For the currently intended semantic path (`ai_sales_note` + `specs`): **yes**
  - As a broader enriched-product carrier: **no**
    - current final RPC shape includes:
      - `id, name, slug, description, price, cover_image, section, similarity, ai_sales_note, specs`
    - it still omits:
      - `short_description`
      - `tags`
      - `badges`
- **D) Contract asymmetries between exact path vs semantic path**
  - Exact path selects:
    - `id, slug, name, price, stock, ai_is_featured, ai_sales_note`
  - Semantic path returns:
    - `description`, `cover_image`, `section`, `similarity`, `ai_sales_note`, `specs`
  - But the mapper normalizes both into a much smaller internal shape:
    - `id, slug, name, display_price, raw_stock, status_signal, commercial_flag, ai_sales_note, specs`
  - So semantic retrieves more than exact, but most of that extra data is discarded before runtime usefulness.
- **Public attachment contract integrity**
  - `src/lib/ai-capsule-mappers.ts` defines a sanitized public attachment contract
  - but current storefront runtime does not use it
  - `src/services/concierge.service.ts` passes `capsuleContract.resolved_products` directly as `suggestedProducts`
  - `src/components/ui/ai/AIConcierge.tsx` renders those raw resolved products directly
  - This means the formal public attachment layer is structurally bypassed
- **E) Backend-level silent-null / permissiveness risks**
  - `src/lib/ai-capsule-schemas.ts`
    - `specs` is `z.any().nullable().optional()`
    - this is permissive and can hide malformed or unexpectedly empty specs payloads
  - `ai_sales_note` is optional/nullable throughout the path, so missing bridges can quietly collapse to `null`
  - `hydrateSemanticSpecs()` in `src/services/ai-capsule-orchestrator.service.ts` fails soft and returns original matches if enrichment fetch fails
  - `mapDbToInternal(dbProducts: any[])` uses loose input typing and silently drops unknown fields

## 3. what remains open
- `description` is still structurally wasted in the semantic path because retrieval already has it but the mapper drops it.
- `short_description` and `tags` still do not participate in the customer-facing capsule flow at all.
- The public attachment contract exists but is not the active runtime transport, so downstream field integrity still depends on raw `resolved_products`.
- `match_products` is sufficient for the accepted semantic bridge, but not yet a complete enriched-field carrier.

## 4. what should be approved
- Do **not** open another `match_products` lane for `ai_sales_note` or `specs`; that work is already structurally in place.
- Do **not** duplicate Antigravity’s semantic drafting lane.
- Approve this cold conclusion:
  - the highest-value remaining structural gap is **not** the semantic RPC anymore
  - it is the **mapper / contract boundary**, where useful retrieved fields still die before runtime
- Most valuable remaining cold gap:
  - `description` is already available from semantic retrieval but dropped in `src/services/ai-capsule-orchestrator.service.ts`
  - `short_description` is the next practical compact field if a broader bridge is later justified

## 5. exact next move
- If a new lane is justified, start at the **mapper / contract layer**, not at `match_products`.
- First file/layer to target:
  - `src/services/ai-capsule-orchestrator.service.ts`
- Reason:
  - that is the current choke point where semantic retrieval already has useful fields (`description`, `cover_image`) but they are discarded
  - it is also where exact-vs-semantic contract parity is currently defined in practice
- Only after deciding the intended internal/public payload there should any additional SQL/RPC widening be considered for fields like `short_description` or `tags`.
