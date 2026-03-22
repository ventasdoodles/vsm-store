# 1. MINIMUM STOREFRONT-SAFE PRODUCT CONTRACT

Para que una card AI sea storefront-safe, el contrato mínimo no puede ser ambiguo ni “parecido a Product”.

Debe distinguir dos niveles:

- **PDP-safe contract**
  `id`
  `slug`
  `section`
  `name`

- **Cart-safe contract**
  debe ser `Product` real o equivalente completo para `cart.store`

La razón estructural es clara:

- PDP canónico sólo necesita ruta correcta.
- `addItem` en [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts) opera sobre `Product`, no sobre un attachment parcial.

Por lo tanto:

- un payload normalizado y parcial puede ser suficiente para navegación a PDP;
- ese mismo payload no debe asumirse automáticamente como seguro para carrito.

# 2. WHAT PDP CONTINUITY ABSOLUTELY REQUIRES

PDP continuity requiere, como mínimo:

- `section`
- `slug`

Y de forma práctica también:

- `id` para trazabilidad/keys/telemetry
- `name` para render y fallback UX razonable

El storefront real resuelve por `/{section}/{slug}`:

- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)

Entonces el bar mínimo es:

- nunca navegar por `id`;
- nunca hardcodear `/vape/` como fallback universal de items AI;
- no considerar “optional `section` + default `'vape'`” como cierre estructural suficiente si el runtime source puede producir productos `420`.

Un payload normalizado sí basta para PDP si garantiza:

- `slug` correcto
- `section` correcto

# 3. WHAT QUICK-ADD CONTINUITY ABSOLUTELY REQUIRES

Quick-add continuity requiere uno de estos dos caminos sanos:

- **rehidratación previa desde catálogo**
- **payload ya storefront-complete y cart-safe**

Lo que `addItem` exige hoy en la práctica:

- `id`
- `price`
- `stock`
- `section`
- `status`
- `is_active`

Y downstream compra/checkout además consume:

- `images`
- `name`
- `section`
- `price`

Eso sale de:

- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/types/product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)

Dado el contrato capsule actual, la opción preferible para quick-add es **rehidratación**.

Razón:

- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts) define `InternalResolvedProduct` con `display_price`, `raw_stock`, y sin el shape completo de `Product`.
- Incluso con `section` añadido, sigue sin cerrar el contrato de carrito.
- Ya existe un precedente sano: [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts) rehidrata producto real por `id` antes de mutar el store.

Conclusión fría:

- para PDP: payload normalizado suficiente;
- para quick-add: rehidratación preferible por defecto, salvo que el payload AI sea explícitamente elevado a contrato `Product` completo y verificado.

# 4. WHERE THE IMPLEMENTATION IS MOST LIKELY TO CHEAT OR STAY FRAGILE

Los cheats más probables serían:

- Cambiar `id` por `slug` pero dejar `section ?? 'vape'`.
  Eso “parece” arreglar PDP, pero sigue degradando items `420`.

- Añadir `section` al schema pero no garantizar que toda fuente runtime realmente la pueble correctamente.
  Un campo opcional con fallback no equivale a contrato cerrado.

- Mantener `addItem(prod as any, 1)` y considerar suficiente que la card “ya navega bien”.
  Eso deja abierta la fragilidad comercial en carrito.

- Fabricar campos tipo `price`, `is_active`, `status` o `images` sobre payload AI parcial para satisfacer TypeScript/UI.
  Eso sería una reparación cosmética, no storefront truth.

- Usar `display_price` como sustituto de `price`.
  `display_price` es string de presentación; no es un precio operativo seguro para carrito/checkout.

- Resolver sólo exact matches y olvidar semantic/fallback/out-of-stock alternative.
  El hardening debe cubrir cualquier path que alimente `suggestedProducts`.

En resumen, un fake fix sería:

- PDP aparentemente corregido,
- pero quick-add todavía apoyado sobre un payload incompleto,
- o `section` todavía dependiente de fallback silencioso.

# 5. COLD-REVIEW CHECKLIST FOR ANTIGRAVITY’S UPCOMING FIX

- ¿Toda card AI navega exclusivamente con `/${section}/${slug}`?
- ¿El `section` usado por la card viene de truth runtime real y no de fallback universal a `vape`?
- ¿El capsule path principal garantiza `section` en todos los `resolved_products` que puedan llegar a storefront?
- ¿Los items `420` abren PDP correcto sin degradarse a ruta `vape`?
- ¿El hardening cubre no sólo exact match sino también semantic, featured fallback y out-of-stock alternative si generan cards?
- ¿Quick-add dejó de operar directamente sobre payload AI parcial?
- ¿Si quick-add sigue existiendo, usa rehidratación desde catálogo o un `Product` completo y verificable?
- ¿El fix evita depender de `display_price` como valor operativo de carrito?
- ¿El fix evita inventar `is_active`, `status`, `stock`, `images` o `section` sólo para hacer pasar el flujo?
- ¿El contrato usado por PDP está claramente separado del contrato usado por quick-add?
- ¿El user puede pasar de “Cesarin recomienda” a “ver PDP” y luego a “agregar / comprar” sin ruptura de identidad del producto?
- ¿La solución se apoya en storefront truth existente en vez de crear otro contrato paralelo difícil de mantener?

Si la respuesta a cualquiera de estas preguntas es “no”, el hardening sigue frágil.

# 6. FILES INSPECTED

- [src/types/product.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/product.ts)
- [src/stores/cart.store.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/stores/cart.store.ts)
- [src/components/ui/ai/AIConcierge.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/ui/ai/AIConcierge.tsx)
- [src/lib/ai-capsule-schemas.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/App.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx)
- [src/pages/SectionSlugResolver.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/SectionSlugResolver.tsx)
- [src/pages/ProductDetail.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/ProductDetail.tsx)
- [src/services/products.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/products.service.ts)
- [src/components/products/ProductCard.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/products/ProductCard.tsx)
- [src/lib/cart-operator-executor.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/cart-operator-executor.ts)
- [src/hooks/useCheckout.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useCheckout.ts)
