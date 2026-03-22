# 1. WHAT IS CONFIRMED STRUCTURALLY SOUND

- El storefront canónico de producto sigue siendo consistente: la navegación real de catálogo usa `/{section}/{slug}`, no `id`.
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx) enruta `/vape/:slug` y `/420/:slug` hacia [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx), y ese resolver cae en [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx) cuando el slug no es categoría.
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts) resuelve PDP por `slug + section`, que es una forma sana y coherente para storefront.
- El storefront normal ya respeta ese contrato. [src/components/products/ProductCard.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/products/ProductCard.tsx) navega con `/${product.section}/${product.slug}`.
- El checkout y la compra posterior están estructuralmente bien una vez que el producto ya entró correctamente al flujo de carrito. [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts) valida stock, crea orden y deriva a Mercado Pago o WhatsApp.
- La vía de cart-operator es relativamente segura. [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts) rehidrata el producto real desde catálogo por `id` antes de mutar `cart.store`.

# 2. WHAT LOOKS FRAGILE OR INCONSISTENT

- Las cards AI en [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) siguen navegando con `window.location.href = /vape/${prod.id}`.
- Eso es inconsistente con el contrato real del storefront, que exige `section + slug`, no `id`.
- Además, la ruta está hardcodeada a `vape`, así que cualquier producto válido de `420` queda estructuralmente mal encaminado incluso si existe y es recomendable.
- El path principal de producto AI sigue usando `resolved_products` del capsule contract vía [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts), y ese contrato no es un `Product` storefront-complete.
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts) define `InternalResolvedProduct` con `id`, `slug`, `name`, `display_price`, `raw_stock`, señales comerciales y contexto semántico, pero sin `section`, sin `price` numérico, sin `images` y sin `cover_image`.
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) confirma esa forma reducida: el mapper produce `display_price`, no `price`, y no incorpora `section` ni assets visuales.
- La UI AI renderiza esas cards como si fueran un `Product` real: usa `prod.cover_image || prod.images?.[0]`, pinta `formatPrice(prod.price)` y hace `addItem(prod as any, 1)` en [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx).
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) exige un `Product` real y depende de campos como `is_active`, `status`, `stock`, y luego el checkout depende de `price`, `images` y `section`.

# 3. WHETHER THERE IS A REAL COMMERCE-CLOSURE BREAK OR ONLY A PLAUSIBLE RISK

Hay un **quiebre real de commerce-closure**, no sólo un riesgo plausible.

- El handoff AI hacia PDP está roto estructuralmente porque la card navega por `id` bajo `/vape/:slug`, mientras el storefront resuelve por `slug + section`.
- Eso hace que el resolver trate un UUID como slug y termine en `ProductDetail`, donde la búsqueda por slug falle y el usuario pueda caer en “Producto no encontrado”.
- El quiebre de `detail-view continuity` es real.
- Además hay una fragilidad real en `quick add continuity`: el payload capsule no cumple el contrato `Product`, pero la UI lo empuja directamente a `addItem`.

La lectura fría es:

- `detail-view continuity`: rota estructuralmente.
- `quick add continuity`: frágil/inconsistente con alto riesgo de degradación.
- `checkout continuity`: sana, pero depende de que el usuario haya logrado entrar bien al flujo storefront/cart.

# 4. WHAT THE MINIMUM SAFE ANTIGRAVITY IMPLEMENTATION LANE WOULD BE IF A FIX IS NEEDED

El lane mínimo seguro sería un **commerce handoff hardening** muy acotado.

- Normalizar un contrato storefront-safe para las cards AI.
- Hacer que toda salida de producto AI navegue por `section + slug`, no por `id`.
- Eliminar el hardcode a `/vape/`.
- Asegurar que el quick add opere sólo con `Product` real o con rehidratación previa desde catálogo.

Eso cierra el quiebre sin abrir una refactorización grande del sistema comercial.

# 5. WHETHER THIS SHOULD BE THE NEXT IMPLEMENTATION PRIORITY

Sí, probablemente sí.

- Las lanes de evidencia, evaluación y governed follow-up ya quedaron materialmente validadas.
- El siguiente gap de mayor apalancamiento operativo parece ser justamente este: `AI helps -> user can keep buying cleanly`.
- El problema no es cosmético ni marginal; afecta continuidad comercial real entre recomendación, PDP, carrito y conversión.

# 6. FILES INSPECTED

- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)
- [src/components/products/ProductCard.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/products/ProductCard.tsx)
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/types/product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts)
- [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)
