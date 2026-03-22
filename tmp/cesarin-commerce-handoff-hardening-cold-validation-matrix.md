# COLD VALIDATION MATRIX — CESARIN COMMERCE HANDOFF HARDENING

## 1. REQUIRED RUNTIME TEST SCENARIOS

- Exact match, `vape`, PDP click.
- Exact match, `vape`, quick-add.
- Exact match, `420`, PDP click.
- Exact match, `420`, quick-add.
- Semantic match, `vape`, PDP click.
- Semantic match, `vape`, quick-add.
- Semantic match, `420`, PDP click.
- Semantic match, `420`, quick-add.
- Featured fallback, at least one `vape` item, PDP click plus quick-add.
- Featured fallback, at least one `420` item, PDP click plus quick-add.
- Out-of-stock alternative, `vape`, PDP click plus quick-add on the replacement item.
- Out-of-stock alternative, `420`, PDP click plus quick-add on the replacement item.
- Mixed-section session: one `vape` recommendation followed by one `420` recommendation in the same chat session.
- Cart-to-checkout continuity after AI quick-add: open cart, validate item, begin checkout flow.

## 2. WHAT EACH SCENARIO MUST PROVE

- PDP click must land on the canonical storefront route `/{section}/{slug}`, not on `id` and not on a hardcoded `vape` path.
- The loaded PDP must correspond to the same product the AI card represented, with correct section identity.
- `420` scenarios must prove that no silent `?? 'vape'` fallback is masking a missing section.
- Quick-add must prove that the UI is no longer relying on pseudo-`Product` payloads and is using catalog-truth rehydration before touching cart state.
- After quick-add, the cart item must be structurally valid for storefront use: correct `id`, `section`, `price`, `stock` behavior, and no malformed item shape downstream.
- Cart validation and checkout entry must remain clean after AI quick-add; the user must be able to continue buying without the cart later discovering a broken item.
- Semantic/fallback scenarios must prove that the fix covers all recommendation paths, not only exact matches.

## 3. WHAT WOULD COUNT AS A FAKE FIX

- All `vape` flows pass, but no `420` scenario is exercised.
- PDP navigation works for exact matches, but semantic/fallback cards still degrade to `vape`.
- The card opens a valid PDP only because `prod.section ?? 'vape'` is hiding missing section truth.
- Quick-add appears to work visually, but still pushes `prod as any` or another partial payload into cart.
- Quick-add succeeds for one path, but cart validation or checkout later fails because the item was not storefront-complete.
- The repo passes only “click the card” testing, while “add to cart and continue buying” is not validated.
- Only one recommendation family is tested; featured fallback and out-of-stock alternative remain unverified.

## 4. THE MINIMUM ACCEPTANCE BAR FOR COMMERCE HANDOFF CLOSURE

- Every AI product card path that can render in runtime must support correct PDP continuity.
- Every AI quick-add path that remains exposed in runtime must use catalog-safe truth before mutating cart.
- At least one real `vape` and one real `420` recommendation must pass both PDP and quick-add continuity.
- At least one semantic or fallback case must pass in each section, not only exact-match cases.
- No tested path may rely on a silent section fallback to make the route look correct.
- A user must be able to go from “Cesarin recommends” to “PDP or cart” to “checkout start” without a structural break.

## 5. WHAT ANTIGRAVITY’S IMPLEMENTATION MUST BE TESTED AGAINST IMMEDIATELY

- The click path in [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx), especially `navigate(\`/${prod.section ?? 'vape'}/${prod.slug}\`)`.
- The quick-add rehydration path in [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx), which now calls `getProductsByIds([prod.id])` before `addItem`.
- The capsule contract in [ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts), where `section` is still optional.
- The mapper in [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts), especially the `section` fallback to `'vape'`.
- The semantic RPC dependency `match_products`, because semantic/runtime correctness now depends on `section` being present in its return shape.
- The cart contract in [cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) and [product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts), to ensure the runtime item entering cart is really `Product`-safe.
- The canonical PDP resolution path in [App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx), [SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx), and [products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts).

## 6. FILES INSPECTED

- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/types/product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts)
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts)
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)
- [supabase/migrations/20260312_neural_search_infra.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
- [supabase/migrations/20260320_match_products_add_ai_sales_note.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_ai_sales_note.sql)
- [supabase/migrations/20260320_match_products_add_specs.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_specs.sql)
- [supabase/migrations/20260320_vector_dimensionality_reconciliation.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_vector_dimensionality_reconciliation.sql)
