# 1. WHAT IS CONFIRMED STRUCTURALLY SOUND

- El storefront canónico de producto está definido de forma consistente como `/{section}/{slug}`, no por `id`.
- La resolución de detalle está estructuralmente clara: [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx) enruta `/vape/:slug` y `/420/:slug` hacia [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx), y ese resolver termina en [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx) cuando el slug no es categoría.
- La carga del PDP también es coherente con ese contrato: [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts) resuelve producto por `slug + section + is_active`.
- El storefront normal ya usa ese contrato correctamente. [src/components/products/ProductCard.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/products/ProductCard.tsx) navega con `/${product.section}/${product.slug}`.
- El checkout y la finalización de compra sí forman un flujo real una vez que el producto ya está correctamente en carrito: [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts) valida stock, crea orden y deriva a Mercado Pago o WhatsApp.
- El path de cart-operator es más seguro que el handoff visual AI: [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts) rehidrata el producto real desde catálogo por `id` antes de mutar el carrito.

# 2. WHAT LOOKS FRAGILE OR INCONSISTENT

- Las cards AI en [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) navegan con `window.location.href = /vape/${prod.id}`. Eso es inconsistente con el contrato storefront, que exige `section + slug`.
- El enlace está hardcodeado a `vape`, así que cualquier recomendación válida de `420` queda estructuralmente mal encaminada aunque el producto exista.
- El contrato capsule usado por el path principal de búsqueda no entrega un objeto storefront-complete. [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts) define `InternalResolvedProduct` con `id`, `slug`, `name`, `display_price`, `raw_stock` y señales comerciales, pero sin `section`, sin `price` numérico, sin `images` y sin `cover_image`.
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts) confirma esa forma reducida: el mapper produce `display_price`, no `price`, y no incorpora `section` ni assets visuales.
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts) mezcla dos shapes para `suggestedProducts`: `Product[]` en el generic path e `InternalResolvedProduct[]` en el capsule path. El renderer de [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx) asume ambos a la vez, lo que vuelve frágiles tanto el link como el quick add.
- El quick add de esa misma card llama `addItem(prod as any, 1)`, pero [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) espera un `Product` real y usa campos como `is_active`, `status`, `stock` y luego el checkout depende de `price`, `images` y `section`.
- Incluso cuando el path AI cayera en el generic path y sí recibiera `Product`, el click sigue mal porque usa `id` y no `slug`, y además fuerza `/vape/`.

# 3. WHETHER THERE IS A REAL COMMERCE-CLOSURE BREAK OR ONLY A PLAUSIBLE RISK

Hay un quiebre real de commerce-closure, no sólo un riesgo plausible.

- El handoff AI hacia detalle de producto no respeta el contrato real del storefront. El PDP no resuelve por `id`; resuelve por `slug + section`.
- La navegación de la card AI usa un UUID bajo `/vape/:slug`. Eso hace que el resolver trate ese UUID como slug y termine en `ProductDetail`, donde la búsqueda por slug falla y cae en "Producto no encontrado".
- Ese quiebre es directo para detail-view continuity.
- Además existe una fragilidad real en add-to-cart continuity cuando las cards vienen del capsule path: el payload reducido no coincide con el `Product` exigido por el carrito.

La conclusión fría es:

- `detail-view continuity`: rota estructuralmente.
- `quick add continuity`: frágil/inconsistente, con alto riesgo de degradación según el path.
- `checkout continuity`: sana, pero sólo después de que el producto haya entrado correctamente al flujo storefront/cart.

# 4. WHAT THE MINIMUM SAFE ANTIGRAVITY IMPLEMENTATION LANE WOULD BE IF A FIX IS NEEDED

El lane mínimo seguro no es un rediseño comercial amplio; es un hardening de handoff storefront-safe.

- Normalizar un contrato único de card AI orientado a storefront.
- Hacer que toda recomendación AI entregue o derive explícitamente `section + slug` para navegación canónica.
- Eliminar el uso de `/vape/${id}` como ruta de salida de la UI AI.
- Asegurar que el quick add no opere sobre payloads parciales; debe rehidratar producto real o recibir un `Product` storefront-safe antes de tocar carrito.

Ese lane es pequeño, de alto apalancamiento y suficiente para cerrar la deriva comercial detectada sin abrir una wave más grande.

# 5. WHETHER THIS SHOULD BE PRIORITIZED BEFORE OR AFTER LIVE INTERACTION EVIDENCE CLOSURE

Debe ir después de live interaction evidence closure, salvo que se detecte ya impacto visible en conversión o tickets.

Razón:

- El quiebre comercial aquí sí es real, pero es un lane acotado y fácil de fijar una vez que el sistema capture mejor evidencia productiva.
- Live interaction evidence closure sigue teniendo más prioridad sistémica porque mejora diagnóstico, validación del fix y priorización de otros fallos de runtime.
- En términos de secuencia Antigravity, este commerce-link hardening debería quedar inmediatamente después del cierre de evidencia en vivo, no mucho más abajo.

# 6. FILES INSPECTED

- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)
- [src/components/products/ProductCard.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/products/ProductCard.tsx)
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts)
- [src/hooks/useAIConcierge.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useAIConcierge.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)
