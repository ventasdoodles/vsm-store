# Auditoría Exhaustiva VSM Store PWA

**Fecha:** 2026-03-14
**Versión:** 1.12.1-neural
**Fuente:** AI_CONTEXT.md

---

## Estructura del Documento
- Por archivo → módulo → función/subcomponente → líneas clave.
- Encabezados claros, tablas de resumen, comentarios explicativos.
- Referencias a AI_CONTEXT.md y desviaciones.

---

### Archivo: src/App.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Orquestador principal, rutas, lazy loading, providers |
| Cumplimiento    | Modular, sigue AI_CONTEXT, separación de lógica/UI |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar rutas críticas, agregar tests de integración |

#### Módulo: App Component
- Propósito: Orquestar rutas, providers, boundaries.
- Cumple patrón Lego Master.

##### Función: App
- Implementa Suspense, ErrorBoundary, Providers.
- Lazy loading de componentes y páginas.

###### Líneas clave
- 1-10: Importación de módulos críticos.
- 11-30: Definición de componentes lazy.
- 31-80: Definición de rutas y providers.

---

### Archivo: src/main.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Entry point, providers, error boundaries, service worker |
| Cumplimiento    | Modular, sigue AI_CONTEXT, manejo de dark mode y cache busting |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar lógica de cache busting, agregar tests de integración |

#### Módulo: Main Entrypoint
- Propósito: Inicializar React, providers, boundaries, service worker.

##### Función: render
- Orquesta providers y boundaries.

###### Líneas clave
- 1-20: Importación y configuración global.
- 21-68: Renderizado y registro de service worker.

---

### Archivo: src/config/site.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Config provider, fuente única de verdad |
| Cumplimiento    | Constante inmutable, sincronizada con AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar cambios de configuración, validar consistencia con AI_CONTEXT |

#### Módulo: SITE_CONFIG
- Propósito: Centralizar identidad, contacto, WhatsApp, redes, tienda.

##### Función: generateMessage
- Genera mensaje de WhatsApp para pedidos.

###### Líneas clave
- 1-80: Definición de SITE_CONFIG y helpers.

---

### Archivo: src/contexts/AuthContext.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Contexto global de autenticación, gestión de perfil |
| Cumplimiento    | Modular, boundaries, validación de estado, sigue AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar flujos de autenticación, agregar tests de integración |

#### Módulo: AuthProvider
- Propósito: Gestionar usuario, perfil, loading, boundaries.

##### Función: loadProfile
- Carga perfil extendido, valida estado de cuenta.

###### Líneas clave
- 1-60: Definición de contexto, provider, lógica de perfil.

---

### Archivo: src/contexts/SafetyContext.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Contexto global de resiliencia, emergency mode |
| Cumplimiento    | Implementa Hyper-Resilience, sigue AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Validar cobertura de tests y fallback en UI |

#### Módulo: SafetyProvider
- Propósito: Orquestar estado de emergencia y chequeo de salud.

##### Función: useEmergencyMode
- Gestiona estado de emergencia.

###### Líneas clave
- 1-34: Definición de contexto, provider, hooks.

---

### Archivo: src/contexts/TacticalContext.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Contexto global de UI táctico, audio, haptics, adaptive theme |
| Cumplimiento    | Premium, sigue AI_CONTEXT, integración de preferencias AI |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar métodos de feedback, agregar tests de integración |

#### Módulo: TacticalProvider
- Propósito: Gestionar audio, haptics, adaptive theme.

##### Función: useEffect (adaptive theme)
- Sincroniza variables CSS con preferencias AI.

###### Líneas clave
- 1-60: Definición de contexto, provider, métodos.

---

### Archivo: src/contexts/ThemeContext.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Contexto ultra-safe, sin hooks ni side effects |
| Cumplimiento    | Wrapper puro, sigue AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar uso y limitaciones |

#### Módulo: ThemeProvider
- Propósito: Wrapper de children, sin lógica.

###### Líneas clave
- 1-11: Definición de ThemeProvider.

---

### Archivo: src/hooks/useAppMonitoring.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de monitoreo, canal de presencia, logging de errores |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de canal y logging |
| Recomendaciones | Agregar tests unitarios y documentación de canal |

#### Módulo: useAppMonitoring
- Propósito: Monitorear actividad, canal de presencia, logging.

##### Función: useAppMonitoring
- Gestiona canal de presencia, logging, boundaries.

###### Líneas clave
- 1-40: Definición de hook, canal, logging.

---

### Archivo: src/hooks/useAIConcierge.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de IA, gestión de mensajes, integración con Tactical UI |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de integración y logging |
| Recomendaciones | Agregar tests unitarios y documentación de triggers |

#### Módulo: useAIConcierge
- Propósito: Gestionar mensajes IA, triggers, integración UI.

##### Función: useAIConcierge
- Gestiona mensajes, triggers, integración con Tactical UI.

###### Líneas clave
- 1-40: Definición de hook, triggers, integración.

---

### Archivo: src/hooks/useAddresses.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hooks de direcciones, React Query, mutaciones |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de mutaciones y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useAddresses
- Propósito: Gestionar direcciones, mutaciones, queries.

##### Función: useAddresses, useDefaultAddress, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress
- Gestionan queries y mutaciones de direcciones.

###### Líneas clave
- 1-70: Definición de hooks, mutaciones, queries.

---

### Archivo: src/hooks/useCheckout.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de checkout, validación, integración pagos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de integración y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useCheckout
- Propósito: Gestionar flujo de checkout, validación, integración pagos.

##### Función: useCheckout
- Gestiona validación, mutaciones, integración pagos.

###### Líneas clave
- 1-60: Definición de hook, validación, integración.

---

### Archivo: src/hooks/useAuth.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de autenticación, boundaries |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar uso y agregar tests unitarios |

#### Módulo: useAuth
- Propósito: Gestionar acceso a contexto de autenticación.

##### Función: useAuth
- Valida contexto y boundaries.

###### Líneas clave
- 1-12: Definición de hook.

---

### Archivo: src/hooks/useBrands.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de marcas, React Query, cacheo |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useBrands
- Propósito: Obtener marcas activas, cacheo.

##### Función: useBrands
- Gestiona query de marcas.

###### Líneas clave
- 1-24: Definición de hook, query.

---

### Archivo: src/hooks/useCategories.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hooks de categorías, React Query, cacheo, filtros |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useCategories
- Propósito: Obtener categorías, filtros, cacheo.

##### Función: useCategories, useCategoriesWithChildren, useCategoryBySlug, useCategoryById
- Gestionan queries de categorías, filtros, cacheo.

###### Líneas clave
- 1-70: Definición de hooks, queries, filtros.

---

### Archivo: src/hooks/useSectionFromPath.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de sección, boundaries |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Ninguno crítico detectado |
| Recomendaciones | Documentar uso y agregar tests unitarios |

#### Módulo: useSectionFromPath
- Propósito: Determinar sección activa por pathname.

##### Función: useSectionFromPath
- Devuelve sección activa.

###### Líneas clave
- 1-13: Definición de hook.

---

### Archivo: src/hooks/useProducts.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hooks de productos, React Query, cacheo, filtros |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useProducts
- Propósito: Obtener productos, destacados, nuevos, bestsellers.

##### Función: useProducts, useFeaturedProducts, useNewProducts, useBestsellerProducts, useProductBySlug
- Gestionan queries de productos, cacheo, filtros.

###### Líneas clave
- 1-40: Definición de hooks, queries, filtros.

---

### Archivo: src/hooks/useStats.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hooks de estadísticas, React Query, cacheo |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useCustomerStats, useTopProducts, useSpendingHistory
- Propósito: Obtener estadísticas de cliente, productos top, historial de gasto.

##### Función: useCustomerStats, useTopProducts, useSpendingHistory
- Gestionan queries de estadísticas.

###### Líneas clave
- 1-31: Definición de hooks, queries.

---

### Archivo: src/hooks/useStoreSettings.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de configuración de tienda, React Query, mutaciones |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de mutaciones y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useStoreSettings
- Propósito: Obtener y actualizar configuración de tienda.

##### Función: useStoreSettings
- Gestiona query y mutación de configuración.

###### Líneas clave
- 1-40: Definición de hook, query, mutación.

---

### Archivo: src/hooks/useSwipe.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de swipe, boundaries, eventos táctiles |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de eventos y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useSwipe
- Propósito: Detectar gestos de swipe en elementos.

##### Función: useSwipe
- Gestiona eventos táctiles y callbacks.

###### Líneas clave
- 1-40: Definición de hook, eventos, callbacks.

---

### Archivo: src/hooks/useTestimonials.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de testimonios, React Query, cacheo |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useTestimonials
- Propósito: Obtener testimonios, stats, destacados.

##### Función: useTestimonials
- Gestiona query de testimonios.

###### Líneas clave
- 1-40: Definición de hook, query.

---

### Archivo: src/hooks/useFlashDeals.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de ofertas relámpago, React Query |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de cache y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useFlashDeals
- Propósito: Obtener ofertas relámpago activas.

##### Función: useFlashDeals
- Gestiona query de ofertas relámpago.

###### Líneas clave
- 1-17: Definición de hook, query.

---

### Archivo: src/hooks/useSmartRecommendations.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de recomendaciones IA, React Query |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de integración y logging |
| Recomendaciones | Agregar tests unitarios y documentación de triggers |

#### Módulo: useSmartRecommendations
- Propósito: Obtener productos relacionados IA.

##### Función: useSmartRecommendations
- Gestiona query de recomendaciones IA.

###### Líneas clave
- 1-22: Definición de hook, query.

---

### Archivo: src/hooks/useSmartBundleOffer.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de bundle IA, React Query |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de integración y logging |
| Recomendaciones | Agregar tests unitarios y documentación de triggers |

#### Módulo: useSmartBundleOffer
- Propósito: Obtener oferta dinámica de bundle IA.

##### Función: useSmartBundleOffer
- Gestiona query de bundle IA.

###### Líneas clave
- 1-22: Definición de hook, query.

---

### Archivo: src/hooks/useOrderNotifications.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de notificaciones de pedidos, listener |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de listeners y validación |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useOrderNotifications
- Propósito: Subscribirse a actualizaciones de pedido.

##### Función: useOrderNotifications
- Gestiona listeners de actualizaciones de pedido.

###### Líneas clave
- 1-32: Definición de hook, listener.

---

### Archivo: src/hooks/useCoupon.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de cupones, validación y aplicación |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación y edge cases |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useCoupon
- Propósito: Validar y aplicar cupones de descuento.

##### Función: useCoupon
- Gestiona lógica de validación y aplicación de cupones.

###### Líneas clave
- 1-28: Definición de hook, lógica de cupones.

---

### Archivo: src/hooks/useCart.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de carrito, gestión de items y totales |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de totales |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useCart
- Propósito: Gestionar items, totales y operaciones del carrito.

##### Función: useCart
- Gestiona lógica de carrito, totales, operaciones.

###### Líneas clave
- 1-45: Definición de hook, lógica de carrito.

---

### Archivo: src/hooks/useWishlist.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de wishlist, gestión de favoritos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y sincronización |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useWishlist
- Propósito: Gestionar productos favoritos.

##### Función: useWishlist
- Gestiona lógica de wishlist, sincronización.

###### Líneas clave
- 1-30: Definición de hook, lógica de favoritos.

---

### Archivo: src/hooks/useUserProfile.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Hook de perfil de usuario, gestión y actualización |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios y documentación de flujos |

#### Módulo: useUserProfile
- Propósito: Gestionar datos y actualización de perfil de usuario.

##### Función: useUserProfile
- Gestiona lógica de perfil, actualización.

###### Líneas clave
- 1-36: Definición de hook, lógica de perfil.

---

### Archivo: src/components/Header.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente principal, navegación, branding |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de accesibilidad y responsive |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: Header
- Propósito: Renderizar barra superior, navegación y branding.

##### Subcomponentes
- Logo, menú, buscador, links.

###### Líneas clave
- 1-60: Definición de componente, props, renderizado.

---

### Archivo: src/components/Footer.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente principal, información legal y enlaces |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de accesibilidad y responsive |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: Footer
- Propósito: Renderizar barra inferior, información legal y enlaces.

##### Subcomponentes
- Links legales, redes sociales.

###### Líneas clave
- 1-40: Definición de componente, props, renderizado.

---

### Archivo: src/components/ProductCard.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de producto, visualización y acciones |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: ProductCard
- Propósito: Renderizar información de producto y acciones.

##### Subcomponentes
- Imagen, nombre, precio, botones de acción.

###### Líneas clave
- 1-55: Definición de componente, props, renderizado.

---

### Archivo: src/components/CartWidget.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de carrito, visualización y acciones |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: CartWidget
- Propósito: Renderizar estado del carrito y acciones.

##### Subcomponentes
- Icono, contador, botón de acceso.

###### Líneas clave
- 1-35: Definición de componente, props, renderizado.

---

### Archivo: src/components/CategoryMenu.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de menú de categorías, navegación |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de accesibilidad y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: CategoryMenu
- Propósito: Renderizar menú de categorías para navegación.

##### Subcomponentes
- Lista de categorías, íconos, links.

###### Líneas clave
- 1-38: Definición de componente, props, renderizado.

---

### Archivo: src/components/TestimonialsCarousel.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de carrusel de testimonios, UI premium |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: TestimonialsCarousel
- Propósito: Renderizar carrusel de testimonios.

##### Subcomponentes
- Testimonios, controles de navegación.

###### Líneas clave
- 1-42: Definición de componente, props, renderizado.

---

### Archivo: src/components/FlashDealBanner.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de banner de oferta relámpago, UI premium |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: FlashDealBanner
- Propósito: Renderizar banner de oferta relámpago.

##### Subcomponentes
- Banner, countdown, CTA.

###### Líneas clave
- 1-28: Definición de componente, props, renderizado.

---

### Archivo: src/components/SmartRecommendationWidget.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Componente de recomendaciones IA, UI premium |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props |

#### Módulo: SmartRecommendationWidget
- Propósito: Renderizar recomendaciones IA.

##### Subcomponentes
- Lista de productos, triggers IA.

###### Líneas clave
- 1-36: Definición de componente, props, renderizado.

---

### Archivo: src/pages/Home.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página principal, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de integración y edge cases |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Home
- Propósito: Renderizar landing principal, integración de módulos.

##### Subcomponentes
- Header, Footer, ProductCard, CategoryMenu, FlashDealBanner, SmartRecommendationWidget, TestimonialsCarousel.

###### Líneas clave
- 1-120: Definición de página, integración de componentes.

---

### Archivo: src/pages/Product.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de producto, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Product
- Propósito: Renderizar información de producto, integración de módulos.

##### Subcomponentes
- ProductCard, CartWidget, SmartRecommendationWidget.

###### Líneas clave
- 1-80: Definición de página, integración de componentes.

---

### Archivo: src/pages/Cart.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de carrito, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de totales |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Cart
- Propósito: Renderizar estado del carrito, integración de módulos.

##### Subcomponentes
- CartWidget, ProductCard, Footer.

###### Líneas clave
- 1-65: Definición de página, integración de componentes.

---

### Archivo: src/pages/Wishlist.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de wishlist, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y sincronización |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Wishlist
- Propósito: Renderizar productos favoritos, integración de módulos.

##### Subcomponentes
- ProductCard, Footer.

###### Líneas clave
- 1-50: Definición de página, integración de componentes.

---

### Archivo: src/pages/Checkout.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de checkout, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de flujos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Checkout
- Propósito: Renderizar proceso de pago, integración de módulos.

##### Subcomponentes
- CartWidget, UserProfile, PaymentForm, Footer.

###### Líneas clave
- 1-90: Definición de página, integración de componentes.

---

### Archivo: src/pages/Profile.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de perfil de usuario, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Profile
- Propósito: Renderizar datos de usuario, integración de módulos.

##### Subcomponentes
- UserProfile, Footer.

###### Líneas clave
- 1-60: Definición de página, integración de componentes.

---

### Archivo: src/pages/FlashDeals.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de ofertas relámpago, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: FlashDeals
- Propósito: Renderizar ofertas relámpago, integración de módulos.

##### Subcomponentes
- FlashDealBanner, ProductCard, Footer.

###### Líneas clave
- 1-70: Definición de página, integración de componentes.

---

### Archivo: src/pages/Recommendations.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de recomendaciones IA, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y triggers IA |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Recommendations
- Propósito: Renderizar recomendaciones IA, integración de módulos.

##### Subcomponentes
- SmartRecommendationWidget, ProductCard, Footer.

###### Líneas clave
- 1-65: Definición de página, integración de componentes.

---

### Archivo: src/pages/BundleOffer.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de bundle IA, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y triggers IA |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: BundleOffer
- Propósito: Renderizar oferta de bundle IA, integración de módulos.

##### Subcomponentes
- SmartBundleOfferWidget, ProductCard, Footer.

###### Líneas clave
- 1-60: Definición de página, integración de componentes.

---

### Archivo: src/pages/OrderNotifications.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de notificaciones de pedidos, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de listeners y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: OrderNotifications
- Propósito: Renderizar notificaciones de pedidos, integración de módulos.

##### Subcomponentes
- OrderNotificationsWidget, Footer.

###### Líneas clave
- 1-55: Definición de página, integración de componentes.

---

### Archivo: src/pages/Brands.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de marcas, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Brands
- Propósito: Renderizar listado de marcas, integración de módulos.

##### Subcomponentes
- BrandCard, Footer.

###### Líneas clave
- 1-50: Definición de página, integración de componentes.

---

### Archivo: src/pages/Categories.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de categorías, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Categories
- Propósito: Renderizar listado de categorías, integración de módulos.

##### Subcomponentes
- CategoryMenu, Footer.

###### Líneas clave
- 1-45: Definición de página, integración de componentes.

---

### Archivo: src/pages/Addresses.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de direcciones, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Addresses
- Propósito: Renderizar listado de direcciones, integración de módulos.

##### Subcomponentes
- AddressCard, Footer.

###### Líneas clave
- 1-40: Definición de página, integración de componentes.

---

### Archivo: src/pages/Stats.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de estadísticas, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Stats
- Propósito: Renderizar estadísticas, integración de módulos.

##### Subcomponentes
- StatsWidget, Footer.

###### Líneas clave
- 1-35: Definición de página, integración de componentes.

---

### Archivo: src/pages/Settings.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de configuración de tienda, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Settings
- Propósito: Renderizar configuración de tienda, integración de módulos.

##### Subcomponentes
- StoreSettingsWidget, Footer.

###### Líneas clave
- 1-30: Definición de página, integración de componentes.

---

### Archivo: src/pages/Swipe.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de swipe, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y triggers IA |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Swipe
- Propósito: Renderizar swipe de productos, integración de módulos.

##### Subcomponentes
- SwipeWidget, ProductCard, Footer.

###### Líneas clave
- 1-40: Definición de página, integración de componentes.

---

### Archivo: src/pages/Testimonials.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de testimonios, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Testimonials
- Propósito: Renderizar testimonios, integración de módulos.

##### Subcomponentes
- TestimonialsCarousel, Footer.

###### Líneas clave
- 1-35: Definición de página, integración de componentes.

---

### Archivo: src/pages/Store.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de tienda, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de props |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Store
- Propósito: Renderizar información de tienda, integración de módulos.

##### Subcomponentes
- StoreInfoWidget, Footer.

###### Líneas clave
- 1-30: Definición de página, integración de componentes.

---

### Archivo: src/pages/Session.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de sesión, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Session
- Propósito: Renderizar información de sesión, integración de módulos.

##### Subcomponentes
- SessionWidget, Footer.

###### Líneas clave
- 1-25: Definición de página, integración de componentes.

---

### Archivo: src/pages/Audit.tsx
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Página de auditoría, UI premium, integración de módulos |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de edge cases y validación de datos |
| Recomendaciones | Agregar tests unitarios, mejorar documentación de props y flujos |

#### Módulo: Audit
- Propósito: Renderizar información de auditoría, integración de módulos.

##### Subcomponentes
- AuditWidget, Footer.

###### Líneas clave
- 1-20: Definición de página, integración de componentes.

---

### Archivo: src/types/variant.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de atributos y variantes de producto |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- ProductAttribute, ProductAttributeValue, ProductVariant

###### Líneas clave
- 1-20: Definición de interfaces de variantes.

---

### Archivo: src/types/testimonial.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de testimonios/reseñas |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- Testimonial

###### Líneas clave
- 1-20: Definición de interfaces de testimonios.

---

### Archivo: src/types/product.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de producto y variantes |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- Product, ProductVariant

###### Líneas clave
- 1-20: Definición de interfaces de producto.

---

### Archivo: src/types/order.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de pedidos y tracking |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- OrderItem

###### Líneas clave
- 1-20: Definición de interfaces de pedidos.

---

### Archivo: src/types/customer.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de cliente/perfil |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- CustomerTier, AccountStatus, IAContext, AIPreferences

###### Líneas clave
- 1-20: Definición de interfaces de cliente.

---

### Archivo: src/types/constants.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de constantes de dominio |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- Section, ProductStatus

###### Líneas clave
- 1-19: Definición de constantes y tipos.

---

### Archivo: src/types/category.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de categorías |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- Category, CategoryInsert, CategoryUpdate

###### Líneas clave
- 1-20: Definición de interfaces de categorías.

---

### Archivo: src/types/cart.ts
#### Resumen
| Aspecto         | Descripción |
|-----------------|-------------|
| Arquitectura    | Definición de carrito y checkout |
| Cumplimiento    | Modular, boundaries, sigue AI_CONTEXT |
| Issues          | Falta tests de validación de modelos |
| Recomendaciones | Agregar tests unitarios y documentación de tipos |

#### Tipos
- CartItem, DeliveryType, PaymentMethod, PaymentStatus, CheckoutFormData

###### Líneas clave
- 1-20: Definición de interfaces de carrito.

---

# (Continúa con todos los archivos pequeños, hooks, servicios, lib, componentes internos, etc...)

---

> Referencia: AI_CONTEXT.md. Cumplimiento, desviaciones y recomendaciones documentadas por bloque.

---

**Este documento se actualizará progresivamente hasta cubrir absolutamente todo el código.**
