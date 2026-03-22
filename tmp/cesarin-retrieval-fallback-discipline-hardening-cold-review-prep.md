# COLD REVIEW PREP — RETRIEVAL / FALLBACK DISCIPLINE HARDENING

## 1. WHAT A REAL FIX MUST IMPROVE

- It must reduce product-card emission, not merely soften the language around weak matches. If the system still produces low-relevance cards for weak evidence, the behavior is still open.
- It must separate three cases cleanly:
  - clear product retrieval
  - clarification-worthy ambiguity
  - no-safe-result / out-of-domain
- It must make `requires_semantic_expansion` and `is_ambiguous` materially govern behavior, not just phrasing. A specific brand/model query should not quietly degrade into semantic approximation if exact retrieval fails.
- It must tighten type-intent discipline so that retrieval respects the requested product class, not just lexical similarity.
- It must make `NO_MATCH` a real operational branch, not a cosmetic last-resort branch that rarely wins because weak semantic cards are still allowed through.

## 2. WHAT SHOULD NOW BE REJECTED OR CLARIFIED INSTEAD OF SUGGESTED

- Clear out-of-domain requests should stop receiving product cards. If the user is asking for something the catalog plainly does not cover, the correct behavior is rejection or redirection, not “opciones parecidas”.
- Specific-looking brand/model requests with no exact hit should usually stop at `NO_MATCH`, not semantic downgrade, when `requires_semantic_expansion = false`.
- Weak brand-only or model-only lookups that map to multiple incompatible products should trigger clarification before showing cards.
- Product-type-intent requests should clarify when the catalog signal is mixed. If the user asks for a `disposable`, returning `liquids`, `salts`, or generic vape accessories should count as failure, not as “closest available”.
- Generic exploratory prompts may still allow suggestion, but only when ambiguity is real and the suggested products remain type-coherent with the ask.

## 3. WHAT WOULD STILL COUNT AS OVER-SUGGESTING

- Returning semantic cards for a brand/model query that looks exact enough to deserve strict failure when exact retrieval misses.
- Returning “featured” cards for a request that is not ambiguous, only unsupported.
- Returning product cards for out-of-domain questions just because embeddings found nearby catalog language.
- Returning cross-type products under a vague “coincidencias” label when the user asked for a more specific product class.
- Using a higher threshold and hedged wording while still allowing the same structurally weak cards to appear.
- Treating “something related exists in the catalog” as sufficient reason to recommend, even when commercial relevance is weak.

## 4. WHAT WOULD COUNT AS A FAKE FIX

- Response text becomes more cautious, but the same low-discipline product cards still render.
- Exact-model misses stop saying “exactamente”, but still show generic semantic alternatives without a clarification gate.
- Out-of-domain queries switch from “coincidencias encontradas” to “quizá te interesen”, while still pushing products.
- Disposable vs liquid vs pod mismatches remain, just with softer copy.
- `NO_MATCH` copy improves, but the branch still loses in practice because semantic or featured fallback keeps firing too often.
- The implementation only tweaks `customer_response_draft` in [product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts) without changing branch-entry discipline in [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) or the fallback-tree conditions.

## 5. THE CHECKLIST TO AUDIT ANTIGRAVITY’S IMPLEMENTATION

- Confirm that exact-looking brand/model queries no longer semantic-degrade when `requires_semantic_expansion = false`.
- Confirm that out-of-domain queries can terminate with `NO_MATCH` or clarification and no product cards.
- Confirm that ambiguity fallback is only used for genuinely broad asks, not for failed exact retrieval.
- Confirm that semantic fallback now preserves product-type discipline:
  - disposable requests should not yield liquids/salts
  - pod requests should not yield pens/accessories unless explicitly broadened
  - accessory requests should not yield main devices
- Confirm that low-confidence semantic results no longer surface merely because a vector threshold was passed.
- Confirm that `FEATURED_FALLBACK` is not acting as a catch-all salvage branch for unsupported requests.
- Confirm that `NO_MATCH` wins when evidence is weak, even if some semantically adjacent products exist.
- Confirm that runtime UI behavior changes with the logic:
  - fewer weak cards
  - more clarification turns where appropriate
  - more true no-result outcomes where appropriate
- Confirm that the hardening changed branch discipline, not just drafting strings.

## 6. FILES INSPECTED

- [src/lib/product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [supabase/migrations/20260312_neural_search_infra.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
- [supabase/migrations/20260320_vector_dimensionality_reconciliation.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_vector_dimensionality_reconciliation.sql)
- [src/__tests__/scenarios/cesarin_scenarios.json](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/__tests__/scenarios/cesarin_scenarios.json)
- [src/__tests__/scenarios/cesarin_qa_suite.json](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/__tests__/scenarios/cesarin_qa_suite.json)
