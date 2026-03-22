# CONTINGENCY REVIEW — CESARIN RETRIEVAL / FALLBACK DISCIPLINE POST-FIX

## 1. FAILURE BUCKETS TO WATCH FOR

- Out-of-domain queries still emit product cards.
- Specific brand/model queries still degrade into generic semantic suggestions.
- Product-type-intent mismatches still survive, especially `disposable -> liquids/salts` or `pod/accessory -> main device`.
- Ambiguous conceptual queries become too strict and collapse into `NO_MATCH` too often.
- `FEATURED_FALLBACK` still acts as a salvage branch for weak evidence instead of true ambiguity.
- `NO_MATCH` copy improves, but runtime behavior still over-suggests because branch-entry discipline did not actually tighten.

## 2. WHAT EACH FAILURE BUCKET WOULD IMPLY

- Out-of-domain still emitting cards implies the fix did not establish a real domain boundary. That means either upstream routing still sends those asks into `product_search_integrity`, or the capsule still treats weak semantic adjacency as enough to recommend.
- Specific brand/model queries still degrading implies `requires_semantic_expansion === false` is not being honored end-to-end in runtime. If that still happens, the hardening did not actually close the exactness discipline gap.
- `Disposable -> liquids/salts` implies type-intent filtering is still absent or too weak. That is not a wording issue; it means retrieval relevance remains structurally commercial-poor.
- Vague conceptual queries becoming too strict implies the fix over-corrected. In that case, semantic suppression or thresholding is now blocking legitimate discovery use cases.
- `FEATURED_FALLBACK` still rescuing weak evidence implies the system remains fundamentally over-suggesting, just with more careful copy.
- Better phrasing with unchanged cards implies the implementation mostly touched `customer_response_draft`, not retrieval/fallback discipline.

## 3. WHAT WOULD COUNT AS PARTIAL IMPROVEMENT VS REAL FIX

- Partial improvement:
  - Fewer weak cards, but out-of-domain still occasionally emits recommendations.
  - Brand/model strictness improves for some exact-look queries, but not consistently.
  - Type mismatches are reduced, but still appear in semantic or fallback paths.
  - `NO_MATCH` appears more often, but `FEATURED_FALLBACK` still catches too many unsupported requests.
- Real fix:
  - Out-of-domain requests cleanly stop producing product cards.
  - Exact-looking brand/model queries either resolve exactly or end in `NO_MATCH`/clarification, not generic semantic salvage.
  - Type-intent mismatches disappear across exact, semantic, and fallback paths.
  - Conceptual/vague requests still get useful semantic help when `requires_semantic_expansion = true`.
  - Runtime shows a real rebalance toward `clarification` and `NO_MATCH` where appropriate, not just softer recommendation copy.

## 4. WHAT WOULD COUNT AS OVER-CORRECTION

- Vague but legitimate discovery prompts like “algo frutal”, “algo suave”, or “quiero dejar de fumar” stop yielding useful semantic options.
- Broad exploratory requests that previously should have gone through `SEMANTIC` or `FEATURED_FALLBACK` now collapse into empty `NO_MATCH`.
- Clarification-worthy prompts no longer produce coherent narrowing help and instead reject too early.
- The system becomes strict enough that only exact catalog-name retrieval works reliably.
- Runtime stops over-suggesting, but also stops being commercially useful for honest exploratory shopping.

## 5. THE MINIMUM SAFE FOLLOW-UP LANE FOR EACH FAILURE TYPE

- Out-of-domain still emits cards:
  - Minimal lane: tighten domain-boundary routing and branch admission into `product_search_integrity`; do not touch broader retrieval architecture.
- Brand/model queries still degrade generically:
  - Minimal lane: harden exactness discipline around `requires_semantic_expansion = false` and exact-miss handling only.
- Disposable queries still return liquids/salts:
  - Minimal lane: add type-intent gating/filtering in the semantic/fallback admission path only.
- Vague conceptual queries become too strict:
  - Minimal lane: recalibrate semantic admission for `requires_semantic_expansion = true` prompts without reopening exact-query strictness.
- `FEATURED_FALLBACK` still overfires:
  - Minimal lane: narrow ambiguity/fallback branch-entry conditions in [product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts) only.
- Fix feels mostly cosmetic:
  - Minimal lane: shift from drafting edits to branch-discipline edits in [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) and [product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts).

## 6. FILES INSPECTED

- [src/lib/product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [supabase/functions/customer-intelligence/index.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts)
- [supabase/functions/customer-intelligence/persona.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/persona.ts)
- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/__tests__/scenarios/cesarin_qa_suite.json](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/__tests__/scenarios/cesarin_qa_suite.json)
