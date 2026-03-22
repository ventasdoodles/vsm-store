# COLD RISK REVIEW — CESARIN COMMERCE HANDOFF POST-FIX

## 1. WHAT NOW LOOKS STRUCTURALLY STRONG

- AI product-card navigation is now aligned with storefront truth at the primary handoff point: [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) routes by `/${section}/${slug}` instead of `id` under a hardcoded `/vape/`.
- The storefront PDP path is structurally coherent: [App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx), [SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx), and [products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts) all resolve around the canonical `section + slug` path.
- Quick-add no longer trusts the capsule payload as if it were a full `Product`. [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) now rehydrates via `getProductsByIds([prod.id])` before calling cart mutation.
- Downstream cart and checkout integrity are real. [cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) and [useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts) still validate stock, removals, and price drift before purchase continuation.

## 2. WHAT STILL LOOKS FRAGILE

- `section` is still not treated as hard truth. In [ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts) it remains optional, and both [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) and [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) still mask absence with a `'vape'` fallback. That means a missing-section defect can survive if tests skew vape-heavy.
- `slug` is still softened. [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) synthesizes `slug` from `name` if absent, which can create a route that looks valid but is not the canonical storefront slug.
- Product eligibility truth is still inconsistent across layers. Search/orchestration uses `status = 'active'` in [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) and `match_products` in [20260320_vector_dimensionality_reconciliation.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_vector_dimensionality_reconciliation.sql), but PDP resolution in [products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts) gates on `is_active`, while cart mutation in [cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) blocks inactive or discontinued products. A product can still be recommendable without being safely purchasable.
- Quick-add success reporting is still structurally weak. In [AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx), `notify.success` fires whenever `full[0]` exists, but [cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) can silently no-op on inactive, discontinued, or overstocked products. That can produce a false “Agregado” even when no item was actually added.
- Semantic and fallback identity still depend on RPC truth staying clean. [ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) only rehydrates `specs` after `match_products`; it does not rehydrate canonical `slug` or `section`.

## 3. WHICH SCENARIOS ARE MOST LIKELY TO FAIL LATER

- `420` semantic, featured-fallback, and out-of-stock-alternative flows. These are the most exposed to silent `'vape'` fallback if `section` arrives missing or malformed.
- Products where `status = 'active'` but `is_active = false`. Those can still be recommended by search/RPC, then fail at PDP or silently fail at cart mutation.
- Products with stale or missing canonical slugs. The synthetic slug fallback can make click-through look implemented while landing on “Producto no encontrado”.
- Quick-add for products that rehydrate successfully by `id` but are inactive, discontinued, or stock-invalid. That is the cleanest path to “toast says success, cart did not actually change”.
- Mixed-source sessions where exact-match passes first, then semantic or OOS fallback fails on the next turn. Those are more likely than a full exact-path regression.

## 4. WHAT WOULD COUNT AS A FALSE SENSE OF SUCCESS

- Only exact-match `vape` cards pass.
- PDP clicks work, but only because the dataset happened to include valid `section` on the tested rows.
- Quick-add shows a success toast, but cart count or cart contents do not actually change.
- A card opens a PDP that exists, but not the exact product the card represented.
- Checkout is only validated after manually curated exact-match adds, while semantic, fallback, and OOS alternatives remain unproven.
- Runtime looks healthy because live catalog rows currently have aligned `status/is_active`, masking the fact that the contract is still structurally permissive.

## 5. WHAT SHOULD BE WATCHED IMMEDIATELY AFTER ANTIGRAVITY’S RUNTIME VALIDATION

- Any `420` recommendation that lands on `/vape/...` or on the wrong PDP.
- Any semantic/fallback/OOS card where displayed product identity does not match the resolved PDP identity.
- Any quick-add toast that does not produce a real cart increment.
- Any case where AI recommendation succeeds, but the PDP returns “Producto no encontrado”.
- Any case where rehydration returns a row that cart later rejects because `is_active`, `status`, or `stock` truth is stricter downstream.
- Any sign that `match_products` or capsule payloads are still yielding rows with missing `section` or non-canonical `slug`.

## 6. FILES INSPECTED

- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/lib/product-search-capsule.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx)
- [src/hooks/useSectionFromPath.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useSectionFromPath.ts)
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)
- [src/types/product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts)
- [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts)
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [supabase/migrations/20260312_neural_search_infra.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
- [supabase/migrations/20260320_vector_dimensionality_reconciliation.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_vector_dimensionality_reconciliation.sql)
