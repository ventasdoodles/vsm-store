# VSM STORE — DOCUMENTO MAESTRO TÉCNICO

> **FUENTE DE VERDAD ABSOLUTA.** Foto técnica real del sistema.
> NO es un plan. Es lo que EXISTE. Leer COMPLETO antes de tocar cualquier archivo.
> Cualquier IA o desarrollador que trabaje en este proyecto DEBE obedecer este documento.
> **Tras cada cambio al código, ACTUALIZAR este documento (ver §1.10).** Sin excepción.
> Historial de auditorías detallado en `AUDIT_LOG.md`.

## Estado del Proyecto [VSM-STORE-PWA]

**Version: 1.12.3-neural
Date: 2026-03-15 (Wave 121: Gemini API Migration)
Status: Completed (Gemini 2.0 Flash Migration + DB Schema Fix)
Last Update: Migrated all AI Edge Functions from retired gemini-1.5-flash to gemini-2.0-flash. Fixed API endpoint (v1beta→v1), removed unsupported responseMimeType. Added loyalty_tiers_config column.
**Filosofía Máxima:** [MASTER_EXPERIENCE.md](file:///C:/Users/dgcar/.gemini/antigravity/brain/38c01788-253f-447d-b304-de07289d46d0/MASTER_EXPERIENCE.md) (Zero Waste & Modular Unity)

---

## 0. QUICK START

### ¿Qué es esto?

Una PWA SPA de e-commerce para una tienda de vapeo y productos 420 en Xalapa, México. Dos verticales: **Vape** (azul) y **420/Herbal** (verde). Dark-only. Experiencia inmersiva con **Tactical UI** y **AI Concierge**. Deploy en **Cloudflare Pages**.

### Setup en 2 minutos

```bash
git clone <repo>
cd vsm-store
npm install
cp .env.example .env    # Agregar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev              # http://localhost:5173
```

### Verificación de salud

```bash
npm run typecheck        # 0 errores tsc
npm run lint             # 0 errores ESLint
npm run test:run         # 12 tests passing
npm run build            # Build exitoso sin warnings
```

### Deploy

Cloudflare Pages conectado a rama `main`. Push to main = deploy automático.

- **URL producción:** Cloudflare Pages (dominio configurado en dashboard)
- **Headers de seguridad:** `public/_headers` (CSP, HSTS, X-Frame-Options)
- **Fallback SPA:** Cloudflare Pages maneja SPA routing automáticamente

---

## 1. REGLAS — LEY ABSOLUTA

> **TODAS estas reglas son obligatorias. No hay excepciones salvo las documentadas explícitamente.** Un AI o desarrollador que viole estas reglas está introduciendo deuda técnica no autorizada.

### 1.1 Arquitectura: Flujo unidireccional estricto

```text
Database (Supabase) → Services → Hooks → Components/Pages
```

**NUNCA al revés.** **PRINCIPIO DE RESILIENCIA (Wave 80):** Cada componente debe ser capaz de fallar de forma aislada sin detener la venta.

**NUNCA al revés.** Un componente no sabe que existe Supabase. Un hook no sabe que existe PostgreSQL.

| Capa | Puede importar de | NO puede importar de |
| :--- | :--- | :--- |
| `services/*.service.ts` | `lib/supabase`, `types/` | Hooks, Components, Pages |
| `hooks/use*.ts` | Services, `lib/`, `types/`, `stores/` | Components, Pages |
| `components/**/*.tsx` | Hooks, `lib/utils`, `types/`, `stores/` | Services, `lib/supabase` |
| `pages/**/*.tsx` | Hooks, Components, `lib/`, `types/`, `stores/` | Services, `lib/supabase` |

> [!IMPORTANT]
> **Admin Standard (Wave 90)**: La excepción histórica que permitía a las páginas admin importar servicios directamente ha sido **DEPRECADA**. Toda lógica de negocio administrativa debe residir en `hooks/admin/` para mantener componentes ligeros (Thin Components).

### 1.2 TypeScript: Cero tolerancia

- **`strict: true`** + **`noUncheckedIndexedAccess: true`** activados.
- **Sin `any`.** Si necesitas un tipo genérico, usa `unknown` + type guards.
- **Sin `as X` casts** salvo en responses de Supabase (problema sistémico conocido, ver §10.2).
- **Sin `// @ts-ignore`** ni `// @ts-expect-error` sin justificación en comentario.

### 1.3 Modularidad: Componentes independientes

- **Cada feature es autocontenida.** Borrar un módulo no debe romper otro.
- **Sin imports circulares.** Flujo unidireccional siempre.
- **Sin lógica de negocio en componentes.** Cálculos van en `lib/domain/`.
- **Sin datos mock en producción.** Si un componente necesita datos, los obtiene de la DB o muestra un empty state honesto.
- **Sin dependencias entre features.** `FlashDeals` no debe importar de `SocialProof`. Cada sección de Home es un "lego" independiente.

### 1.4 Estilos: Sistema temático

- **Sin `bg-white` ni colores hardcodeados.** Usar sistema temático (`bg-theme-*`, `glass-premium`, `text-theme-*`).
- **Sin CSS-in-JS.** Solo Tailwind + CSS Variables en `index.css`.
- **Sin archivos `.css` por componente.** Estilos globales en `index.css` layers.
- **Sin clases dinámicas de Tailwind** (`bg-${color}-500`). Usar condicionales estáticos con `cn()`.

### 1.5 Testing: Obligatorio para nueva lógica

- **Todo archivo nuevo en `lib/domain/` DEBE tener tests.** Sin excepción.
- **Todo nuevo hook con lógica compleja DEBE tener tests.**
- **Todo nuevo schema Zod DEBE tener tests.**
- **Tests van en `__tests__/` junto al módulo que testean.**
- **Formato:** `[nombre].test.ts(x)`. Framework: Vitest + Testing Library.
- **Estado actual:** 12 tests en 12 archivos. Cobertura parcial. Ver §8.

### 1.6 Build: Cero errores

- **`npm run typecheck` = 0 errores.**
- **`npm run lint` = 0 errores.**
- **`npm run build` = exitoso.**
- **No se pushea con errores.** Verificar antes de cada commit.

### 1.7 Imports: Consistencia

- **Path alias `@/`** mapea a `src/`. No relative imports fuera de la carpeta actual.
- **`Section` type:** importar SIEMPRE de `@/types/constants` (canonical). Nunca de `@/types/product`.
- **Admin services:** importar del barrel `@/services/admin`, no de archivos individuales.
- **Named exports** siempre (no default). Lazy imports usan `.then(m => ({ default: m.X }))`.

### 1.8 Seguridad: No negociable

- **Sin hardcoded secrets.** Usar env vars.
- **Escape inputs en queries PostgREST.** `%` y `_` deben escaparse en ILIKE.
- **Validar URLs antes de redirect.** Verificar hostname de destino.
- **Sin `console.log` en producción.** Terser los elimina, pero no confiar en eso para datos sensibles.
- **Sin `dangerouslySetInnerHTML`.** Nunca.
- **Rate limiting en auth.** Login tiene exponential backoff.

### 1.9 Nuevos archivos: Checklist

Antes de crear un archivo nuevo, verificar:

| ✅ | Pregunta |
| :--- | :--- |
| ☐ | ¿Respeta el flujo unidireccional (§1.1)? |
| ☐ | ¿Usa tipos de `src/types/` en vez de definir inline? |
| ☐ | ¿Importa `Section` de `@/types/constants`? |
| ☐ | ¿Usa `useNotification` en vez de `react-hot-toast` directo? |
| ☐ | ¿Usa `cn()` para clases condicionales? |
| ☐ | ¿Usa `optimizeImage()` para imágenes de productos? |
| ☐ | ¿Usa clases temáticas (`bg-theme-*`, `text-theme-*`)? |
| ☐ | ¿Si tiene lógica → la lógica va en `lib/domain/`? |
| ☐ | ¿Si tiene lógica en `lib/domain/` → tiene tests? |
| ☐ | ¿Sin `any`, sin `as X` innecesarios? |
| ☐ | ¿Named export (no default)? |
| ☐ | **¿Actualicé AI_CONTEXT.md para reflejar este cambio? (§1.10)** |

### 1.10 Documentación: Sincronización obligatoria

> **Esta es la regla más importante.** Sin ella, todas las demás se vuelven mentira con el tiempo.

**Tras CADA sesión de trabajo que modifique código, se DEBE actualizar este documento.**

#### ¿Qué actualizar?

| Si tocaste... | Actualizar en AI_CONTEXT.md |
| :--- | :--- |
| Nuevo archivo `.ts`/`.tsx` | §3 Estructura de carpetas (agregar archivo, actualizar conteos) |
| Nuevo archivo de test | §8 Testing (agregar a tabla §8.1, quitar de §8.3 si aplica) |
| Nueva ruta | §9 Routing (agregar a tabla correspondiente) |
| Nueva dependencia `npm install` | §2 Stack (agregar con versión) |
| Nuevo tipo en `src/types/` | §3 Estructura (actualizar conteo de types/) |
| Archivo eliminado | Quitar de §3 + actualizar conteos |
| Feature nueva completada | §5 Features (mover de ⚠ a ✅ o agregar nueva) |
| Issue resuelto de §10 | §10 Issues (quitar de la lista) + AUDIT_LOG.md (agregar entrada) |
| Migración SQL nueva | §11.1 (agregar fila con número y descripción) |
| Cambio en build/deploy | §12 Build & Deploy |
| Cambio de regla o patrón | §1 Reglas o §14 Convenciones |
| Decisión arquitectónica relevante | §15 Decisiones Históricas (agregar con fecha) |

#### ¿Qué actualizar en AUDIT_LOG.md?

- Si se hace una **auditoría formal** (revisión de múltiples archivos, refactoring de módulo), agregar entrada con: scope, archivos modificados, highlights, issues resueltos/diferidos.
- No es necesario para cambios individuales pequeños.

#### Formato de actualización

- Actualizar la fecha de `Última actualización verificada` en el header del documento.
- Actualizar conteos numéricos (archivos, líneas, tests) con valores reales.
- **NUNCA inventar datos.** Si no se verificó un conteo, no actualizarlo.

#### ¿Quién es responsable?

- **Cualquier IA** que modifique código tiene la obligación de actualizar el documento antes de terminar la sesión.
- **Cualquier desarrollador** que haga commit debe verificar que el documento refleja sus cambios.
- Si el documento no se actualiza, los datos se vuelven incorrectos y se pierde la confianza en la fuente de verdad.

---

## 2. STACK EXACTO

| Capa | Tecnología | Versión | Rol |
| :--- | :--- | :--- | :--- |
| Runtime | React | 18.3.1 | SPA, JSX |
| Bundler | Vite | 6.0.5 | Dev server, build, HMR |
| Lenguaje | TypeScript | 5.6.2 | Strict mode + noUncheckedIndexedAccess |
| BaaS | Supabase | 2.39.0 | PostgreSQL, Auth, Storage, Realtime, Edge Functions, RLS |
| Server-state | TanStack Query | 5.17.0 | Cache, fetching, mutations, staleTime |
| Client-state | Zustand | 5.0.11 | Carrito (localStorage), wishlist (localStorage + DB sync), notificaciones |
| Routing | React Router | 6.22.0 | SPA routing, lazy loading |
| Styling | Tailwind CSS | 3.4.17 | Utility-first + CSS Variables (dark-only) |
| Forms | React Hook Form + Zod 4 | 7.71.2 / 4.3.6 | Validación con schemas tipados |
| Animation | Framer Motion | 6.5.1 | Transiciones, AnimatePresence (pinned a v6, no migrado a v11) |
| Icons | Lucide React | 0.574.0 | Iconografía SVG |
| SEO | react-helmet-async | 2.0.5 | Meta tags dinámicos |
| Toast | react-hot-toast | 2.4.1 | Notificaciones transitorias |
| DnD | @dnd-kit | core 6.3.1, sortable 10.0.0 | Reordenamiento admin |
| Images | react-dropzone | 15.0.0 | Upload de imágenes admin |
| Payments | MercadoPago | Via Edge Function | `create-payment` + `mercadopago-webhook` |
| Monitoring | Sentry | 10.39.0 | Error tracking (lazy-loaded, solo si DSN configurado) |
| Analytics | Google Analytics 4 | `lib/analytics.ts` | Placeholder `G-XXXXXXXXXX` — no activo |
| Confetti | canvas-confetti | 1.9.4 | Efecto visual en loyalty/pedidos |
| Testing | Vitest + Testing Library | 4.0.18 | Unit tests (12 tests, cobertura parcial) |
| Linting | ESLint 9 + typescript-eslint | 9.15.0 | Config flat en `eslint.config.js` |
| PWA | Service Worker manual | `public/sw.js` | Offline fallback, caching |
| Minify | Terser | 5.46.0 | `drop_console` + `drop_debugger` en prod |

### Dependencias NO incluidas (decisiones conscientes)

- No hay Redux, MobX ni Context para estado global (Zustand reemplaza).
- No hay CSS-in-JS (styled-components, emotion). Solo Tailwind + CSS Variables.
- No hay Next.js/Remix. Es SPA pura desplegada en Cloudflare Pages.
- No hay ORM cliente. Supabase client directo en services.

---

## 3. ESTRUCTURA DE CARPETAS

```text
vsm-store/
├── public/                          # Assets estáticos
│   ├── sw.js                        # Service Worker PWA
│   ├── manifest.json                # PWA manifest
│   ├── offline.html                 # Fallback offline
│   ├── _headers                     # Cloudflare Pages headers (CSP, HSTS)
│   ├── robots.txt / sitemap.xml     # SEO
│   ├── logo-vsm.png                 # Logo tienda
│   ├── .well-known/                 # Dominio verification
│   └── icons/                       # PWA icons
│
├── scripts/                         # 6 scripts de utilidad
│   ├── generate-sitemap.js          # Generador de sitemap (post-build)
│   ├── migrate-woocommerce.cjs      # WooCommerce CSV → SQL migration
│   ├── fix_css_phase2.mjs           # CSS cleanup phase 2
│   ├── fix_css_phase3.mjs           # CSS cleanup phase 3
│   ├── fix_css_violations.mjs       # CSS violations fix
│   └── fix_encoding.mjs             # Encoding fix script
│
├── supabase/
│   ├── migrations/                  # 28 migraciones SQL (001 → 20260316)
│   └── functions/                   # 11 Edge Functions (9 AI + 2 Payments/Tracking)
│       ├── inventory-oracle/        # IA: Predicciones de stock (Gemini 2.0 Flash)
│       ├── dashboard-intelligence/  # IA: Insights de negocio para admin (Gemini 2.0 Flash)
│       ├── customer-intelligence/   # IA: Multi-acción NLP/WhatsApp/loyalty (Gemini 2.0 Flash)
│       ├── voice-intelligence/      # IA: NLP → queries de búsqueda (Gemini 2.0 Flash)
│       ├── product-intelligence/    # IA: Generación de copy/descriptions (Gemini 2.0 Flash)
│       ├── loyalty-intelligence/    # IA: Análisis de patrones de lealtad (Gemini 2.0 Flash)
│       ├── customer-narrative/      # IA: Narrativas contextuales de clientes (Gemini 2.0 Flash)
│       ├── bundle-intelligence/     # IA: Sugerencias de bundles (Gemini 2.0 Flash)
│       ├── embeddings-processor/    # IA: Embeddings vectoriales (text-embedding-004, v1beta)
│       ├── create-payment/          # MercadoPago preference
│       ├── mercadopago-webhook/     # Webhook de pago
│       └── track-shipment/          # DHL tracking
│
├── src/
│   ├── main.tsx                     # Entrypoint: providers stack
│   ├── App.tsx                      # Router + layout switching
│   ├── index.css                    # Design system CSS (379 líneas)
│   ├── vite-env.d.ts                # Vite types
│   │
│   ├── types/                       # Tipos de dominio (7 archivos)
│   │   ├── product.ts               # Product, Section, ProductStatus
│   │   ├── category.ts              # Category, CategoryWithChildren
│   │   ├── cart.ts                   # CartItem (con variant_id/name), Order, CheckoutFormData
│   │   ├── order.ts                 # OrderItem (con variant_id/name), OrderRecord, CreateOrderData
│   │   ├── customer.ts              # CustomerProfile, CustomerTier, AccountStatus
│   │   ├── testimonial.ts           # Testimonial
│   │   ├── variant.ts               # ProductAttribute, AttributeValue, ProductVariant
│   │   └── constants.ts             # Section, ProductStatus (CANONICAL re-exports)
│   │
│   ├── config/
│   │   └── site.ts                  # SITE_CONFIG: nombre, WhatsApp, redes, banco
│   │
│   ├── constants/                   # 3 archivos
│   │   ├── app.ts                   # SECTIONS, ORDER_STATUS, USER_ROLES
│   │   ├── category-showcase.ts     # Configuración showcase de categorías
│   │   └── slider.ts                # Constantes del slider
│   │
│   ├── contexts/                    # 2 archivos
│   │   ├── AuthContext.tsx           # Auth state (Supabase auth listener)
│   │   └── ThemeContext.tsx          # Dark-only. Aplica <html class="dark">
│   │
│   ├── lib/                         # Utilidades puras (sin side effects de UI)
│   │   ├── supabase.ts              # Cliente Supabase singleton
│   │   ├── react-query.ts           # QueryClient + error handling global
│   │   ├── utils.ts                 # cn(), formatPrice(), slugify(), optimizeImage()
│   │   ├── analytics.ts             # GA4 (placeholder, no activo)
│   │   ├── monitoring.ts            # Sentry init (lazy-loaded via dynamic import)
│   │   ├── accessibility.ts         # A11y utilities
│   │   ├── image-optimizer.ts       # Image optimization helpers
│   │   ├── z-index.ts               # Z scale: CONTENT(30)→SKIP(110)
│   │   ├── product-sorting.ts       # SortKey, SORT_OPTIONS, sortProducts (shared)
│   │   └── domain/                  # Lógica de negocio pura (DEBE tener tests)
│   │       ├── loyalty.ts           # Puntos, tiers, conversiones
│   │       ├── orders.ts            # Estados, transiciones, canTransitionTo
│   │       ├── pricing.ts           # calculateDiscount, calculateOrderTotal
│   │       ├── wheel.ts           # selectPrizeByProbability, calculateTargetRotation, formatPrizeValue [Wave 26]
│   │       ├── __tests__/           # 3 test files
│   │       └── validations/         # Schemas Zod (DEBEN tener tests)
│   │           ├── address.schema.ts
│   │           ├── checkout.schema.ts
│   │           ├── profile.schema.ts
│   │           └── __tests__/       # 3 test files
│   │
│   ├── stores/                      # Zustand (client-state only) — 4 stores
│   │   ├── cart.store.ts            # Carrito: add/remove/validate, localStorage + version migration
│   │   ├── wishlist.store.ts        # Wishlist: localStorage + sync a customer_wishlists (DB)
│   │   ├── notifications.store.ts   # Notificaciones in-app
│   │   ├── search-overlay.store.ts  # MobileSearchOverlay visibility
│   │   └── __tests__/              # 2 test files
│   │
│   ├── services/                    # Capa de datos (16 services storefront)
│   │   ├── products.service.ts      # CRUD productos (lectura storefront). Incluye Smart Upselling.
│   │   ├── categories.service.ts    # Categorías (lectura storefront)
│   │   ├── orders.service.ts        # Crear pedido, obtener pedidos usuario
│   │   ├── search.service.ts        # Búsqueda ILIKE con escape
│   │   ├── concierge.service.ts     # AI Chat, Semantic Search & Customer IQ (Consolidado)
│   │   ├── auth.service.ts          # Profile CRUD, resetPassword
│   │   ├── flash-deals.service.ts   # Ofertas relámpago (lectura)
│   │   ├── addresses.service.ts     # Direcciones usuario
│   │   ├── coupons.service.ts       # Validar/aplicar cupón
│   │   ├── loyalty.service.ts       # Puntos, tiers, ajustes
│   │   ├── brands.service.ts        # Marcas públicas
│   │   ├── testimonials.service.ts  # Testimonios públicos
│   │   ├── wishlist.service.ts      # Favoritos del usuario (lectura/escritura DB)
│   │   ├── tracking.service.ts      # DHL tracking
│   │   ├── monitoring.service.ts    # Log errores + Presence channel
│   │   ├── notifications.service.ts # Notificaciones usuario + Realtime
│   │   ├── settings.service.ts      # Store settings + slider images
│   │   ├── stats.service.ts         # Estadísticas usuario
│   │   ├── storage.service.ts       # Upload/delete imágenes
│   │   ├── payments/
│   │   │   └── mercadopago.service.ts
│   │   └── admin/                   # 12 archivos (11 services + barrel)
│   │       ├── index.ts             # Barrel re-export
│   │       ├── admin-auth.service.ts
│   │       ├── admin-products.service.ts
│   │       ├── admin-categories.service.ts
│   │       ├── admin-orders.service.ts
│   │       ├── admin-customers.service.ts
│   │       ├── admin-coupons.service.ts
│   │       ├── admin-brands.service.ts
│   │       ├── admin-tags.service.ts
│   │       ├── admin-flash-deals.service.ts
│   │       ├── admin-testimonials.service.ts
│   │       ├── admin-variants.service.ts
│   │       ├── admin- dashboard.service.ts
│   │       ├── admin-crm.service.ts     # CRM e inteligencia de clientes
│   │       └── admin-nlp.service.ts     # Parseo de intenciones con Gemini [Wave 60]
│   │
│   ├── hooks/                       # TanStack Query wrappers (27 hooks)
│   │   ├── useProducts.ts           # useProducts, useFeaturedProducts, useProductBySlug
│   │   ├── useCategories.ts         # useCategories, useCategoryBySlug
│   │   ├── useOrders.ts             # useCustomerOrders, useOrder, useCreateOrder
│   │   ├── useRealtimeOrders.ts     # Suscripción realtime a nuevos pedidos
│   │   ├── useFlashDeals.ts         # useFlashDeals (active deals)
│   │   ├── useProductVariations.ts  # Fetches variants for a product
│   │   ├── useCheckout.ts           # Checkout orchestration logic
│   │   ├── useSearch.ts             # useSearch (debounced)
│   │   ├── useAIConcierge.ts        # Chat state & AI interactions
│   │   ├── useAuth.ts               # useAuth (from context)
│   │   ├── useAddresses.ts          # useAddresses
│   │   ├── useBrands.ts             # useBrands
│   │   ├── useCoupons.ts            # useCoupon validation
│   │   ├── useLoyalty.ts            # useLoyalty + useLoyaltyIA (Consolidado) [Wave 90]
│   │   ├── useCustomerIQ.ts         # Centralized Customer Intel [NEW]
│   │   ├── useLoyaltyStats.ts       # Admin stats via loyalty.service
│   │   ├── useStoreSettings.ts      # useStoreSettings
│   │   ├── useStats.ts              # useStats
│   │   ├── useTestimonials.ts       # useTestimonials
│   │   ├── useUpdateProfile.ts      # auth update profile
│   │   ├── useAppMonitoring.ts      # Presence
│   │   ├── useCartValidator.ts      # Cart validation
│   │   ├── useDebounce.ts           # Debounce
│   │   ├── useHaptic.ts             # Haptics
│   │   ├── useNotification.ts       # Transitions / Toasts
│   │   ├── useScrolled.ts           # Scroll
│   │   ├── useSectionFromPath.ts    # Section helper
│   │   ├── useSwipe.ts              # Swipe
│   │   ├── useWheelConfig.ts        # Reward wheel config
│   │   ├── useWheelAudio.ts         # Reward wheel audio
│   │   ├── admin/                   # 4 hooks administrativos [NEW Wave 90]
│   │   │   ├── useAdminProducts.ts  # Logic for AdminProducts page
│   │   │   ├── useAdminOrders.ts    # Logic for AdminOrders page
│   │   │   ├── useAdminPulse.ts     # Business health monitor
│   │   │   └── useVoiceRecorder.ts  # Speech interaction
│   │   └── __tests__/               # 2 test files
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx        # Global error boundary
│   │   ├── layout/                  # Storefront shell (4 + header/)
│   │   │   ├── Layout.tsx           # Header + main + Footer + BottomNav
│   │   │   ├── Header.tsx           # Top header
│   │   │   ├── header/             # 10 sub-components
│   │   │   ├── Footer.tsx           # Footer (React.memo)
│   │   │   └── BottomNavigation.tsx # Mobile bottom bar (React.memo)
│   │   │
│   │   ├── ui/                      # 13 componentes base reutilizables
│   │   │   ├── PremiumSkeleton.tsx  # [NEW] Liquid Shimmer Effect
│   │   │   └── ai/
│   │   │       ├── AIConcierge.tsx  # Floating Assistant (Quantum Glass) [Wave 70]
│   │   │       └── VoiceSearchOverlay.tsx
│   │   ├── home/                    # 8 secciones de Home (cada una independiente)
│   │   │   ├── social/              # 7 componentes (refactorización R1)
│   │   │   └── ...                  # Otras secciones (FlashDeals, MegaHero, etc.)
│   │   ├── products/                # 15 componentes de producto
│   │   ├── cart/                    # 3: CartButton, CartSidebar (with internal CartItem/CartUpsell), CheckoutForm
│   │   ├── search/                  # 2: SearchBar (317 líneas), MobileSearchOverlay
│   │   ├── auth/                    # 3: LoginForm, SignUpForm, ProtectedRoute
│   │   ├── categories/              # 1: CategoryCard
│   │   ├── addresses/               # 3: AddressCard, AddressForm, AddressList
│   │   ├── profile/                 # 7 componentes
│   │   ├── loyalty/                 # 6: PointsDisplay, ProgressBar, TierBadge, ReferralCard, ApplyReferralForm, SmartRewardToast
│   │   ├── notifications/           # 4 componentes
│   │   ├── social/                  # 1: SocialLinks
│   │   ├── seo/                     # 4: SEO, ProductJsonLd, OrganizationJsonLd, BreadcrumbJsonLd
│   │   └── admin/                   # 93 archivos (componentes + sub-carpetas)
│   │       ├── layout/                  # Estructura admin
│   │       │   ├── AdminLayout.tsx
│   │       │   ├── AdminPulse.tsx       # Pulso de negocio en tiempo real
│   │       │   ├── AnimatedAtmosphere.tsx # Ambient BI Glow [Wave 60]
│   │       │   └── Sidebar.tsx
│   │       ├── ui/                      # UI Admin Reutilizable
│   │       │   ├── AdminCommandPalette.tsx # Command Palette (NLP & Voice) [Wave 60]
│   │       │   ├── SupplierOrderModal.tsx # Reordenar con IA [Wave 60]
│   │       │   └── AdminEmptyState.tsx
│   │       ├── dashboard/
│   │       │   ├── AIInsights.tsx       # Recomendaciones proactivas Gemini [NEW]
│   │       │   └── AdminOracleDashboard.ts
│   │       └── products/
│   │           └── ProductVariantsEditor.tsx
│   │
│   └── pages/                       # Páginas (route endpoints)
│       ├── (20 páginas storefront)
│       ├── admin/                   # 17 páginas admin
│       ├── auth/                    # Login, SignUp
│       ├── legal/                   # Terms, Privacy
│       └── user/                    # Notifications
│
├── AI_CONTEXT.md                    # ← ESTE ARCHIVO (fuente de verdad)
├── AUDIT_LOG.md                     # Historial de 18 auditorías
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.js
├── eslint.config.js
└── postcss.config.js
```

**Totales:** ~338 archivos TypeScript/TSX · 12 test files · 28 SQL migrations · 11 Edge Functions (9 AI + 2 Payments/Tracking)

---

## 4. STOREFRONT vs ADMIN — Separación total

Son dos aplicaciones dentro del mismo bundle. Se distinguen por ruta (`/admin/*`).

| Aspecto | Storefront | Admin |
| :--- | :--- | :--- |
| Layout | `Layout.tsx` (Header + Footer + BottomNav) | `AdminLayout.tsx` (Sidebar + TopBar) |
| Guard | `ProtectedRoute` (requiere auth) | `AdminGuard` (requiere rol admin) |
| Services | `src/services/*.service.ts` | `src/services/admin/admin-*.service.ts` |
| Hooks | `src/hooks/use*.ts` | `src/hooks/admin/useAdmin*.ts` (Wave 90) |
| No tiene | Sidebar, tablas de datos | Carrito, WhatsApp, SEO, social proof |

---

## 5. FEATURES IMPLEMENTADAS

### 5.1 Storefront (cliente)

| Feature | Estado | Archivos clave |
| :--- | :--- | :--- |
| Catálogo por sección (vape/420) | ✅ | SectionPage, CategoryPage, SectionSlugResolver |
| Detalle de producto completo | ✅ | ProductDetail, ProductImages, ProductInfo, ProductActions |
| Carrito persistente (localStorage) | ✅ | cart.store.ts, CartSidebar (Wave 5 Luxury Polish), CartButton |
| Checkout WhatsApp + MercadoPago | ✅ | CheckoutForm, useCheckout, mercadopago.service |
| Autenticación Supabase | ✅ | AuthContext, LoginForm (rate limit), SignUpForm (OWASP) |
| Búsqueda Visual Omni-Search | ✅ | SearchBar, useSearch, useCategories (Wave 13) |
| Perfil usuario | ✅ | Profile, ProfileForm, ProfileHero, ProfileInfo |
| Direcciones múltiples | ✅ | Addresses, AddressForm, AddressList |
| Historial de pedidos | ✅ | Orders, OrderDetail (con reorder) |
| Programa de lealtad | ✅ | Loyalty, PointsDisplay, ProgressBar, TierBadge, TierManagement (Dynamic) |
| Sistema de Referidos | ✅ | ReferralCard, ApplyReferralForm, process_referral_reward trigger |
| IA Reward Engine | ✅ | SmartRewardToast, loyalty-intelligence (Gemini), useLoyaltyIA |
| Wishlist (DB-synced) | ✅ | Wishlist, wishlist.store.ts (localStorage + customer_wishlists) |
| Notificaciones realtime | ✅ | OrderNotifications (Supabase Realtime) |
| SEO dinámico | ✅ | SEO, ProductJsonLd, OrganizationJsonLd, BreadcrumbJsonLd |
| PWA offline | ✅ | sw.js, manifest.json, InstallPrompt |
| Dark-only theme | ✅ | ThemeProvider ensures `<html class="dark">` |
| Rastreo DHL | ✅ | TrackOrder, track-shipment Edge Function |
| Social proof (testimonios DB) | ✅ | SocialProof (dinámico desde DB) |
| Realtime Social Proof | ✅ | SocialProofToast, useRealtimeOrders (Wave 13) |
| WhatsApp flotante | ✅ | WhatsAppFloat |
| Hero slider dinámico | ✅ | MegaHero (desde DB settings) |
| Flash deals (storefront) | ✅ | Consume tabla `flash_deals` real |
| Variaciones de producto | ✅ | Atributos globales, matriz de variantes, precios/stock x variante |
| CRM 360 & Inteligencia (Wave 120) | ✅ | RFM Metrics, Timeline 360, Customer Intelligence Panel (V3 Neural) |
| **Neural Identity** (Wave 120) | ✅ | AI Preferences, Cognitive Context, Propensity Scoring |
| IA Insights (Fase A) | ✅ | Motor de recomendaciones proactivas basado en reglas (Sin API) |
| IA Insights (Fase B/Neural) | ✅ | Integración completa con Google Gemini para análisis narrativo y estratégico |
| **AI Concierge (Wave 70)** | ✅ | Asistente de cristal de obsidiana con Gemini Chat |
| **Búsqueda Semántica (Wave 70)** | ✅ | Búsqueda por concepto e intención con IA Smart |
| **Tactical UI Global (Wave 70)** | ✅ | Audio procedural y háptica en todo el Storefront |
| Haptic Immersive Gallery | ✅ | ProductImages (Zoom + Haptics) (Wave 13) |
| Flash Deals Superpowers | ✅ | Suggest IA, Burning Bar, Local String Precision (Wave 17) |
| **Ruleta de Premios Ultra-Premium** | ✅ | `PrizeWheel.tsx`, `useWheelConfig`, `usePrizeWheel`, `lib/domain/wheel.ts`, `useWheelAudio` (Wave 35) |
| Header & Search Intelligence | ✅ | AI Hints, Spring Physics, Live Pulse (Wave 18) |
| Header & Search UX Impact | ✅ | Hero SearchBar, Layout Fix, Fluid Transitions (Wave 19) |
| Checkout UX & Image Robustness | ✅ | Floating Labels Refactor, OptimizedImage Summary (Wave 20) |
| Universal Shell (Wave 9) | ✅ | Header/Footer cinemáticos, Abyssal Glow, físicas de resorte |
| Analytics GA4 | ⚠ Inactivo | `lib/analytics.ts` con placeholder `G-XXXXXXXXXX` |

### 5.2 Admin Panel

| **Flash Deals Tabla con Tiempo Restante** | ✅ | `FlashDealsTable.tsx` — Badge ⚡ con urgencia-color en lugar de rangos de fecha |
| **Batch Manager (Lote Pro)** | ✅ | `AdminBatchManager.tsx` — Edición masiva de alta densidad para precio/stock |
| **Antigravity Pulse** | ✅ | `AdminPulse.tsx` — Monitoreo de salud del negocio en tiempo real en Header |
| **AI Proactive Insights** | ✅ | `AIInsights.tsx` — Motor de sugerencias estratégicas (Gemini 1.5 Pro) |
| **Command Palette & NLP** | ✅ | `AdminCommandPalette.tsx` — Navegación global omni-buscador (Cmd+K) |
| **WhatsApp Copy Generator** | ✅ | `CustomerIntelligencePanel.tsx` — Generación de copys personalizados RFM |
| **Tactical UI (Sensory)** | ✅ | `TacticalProvider.tsx` — Procedural Audio & Haptics [Wave 60] |
| **Ambient BI (Glow)** | ✅ | `AnimatedAtmosphere.tsx` — Dashboard state-aware background [Wave 60] |
| **Smart Supplier Connect** | ✅ | `SupplierOrderModal.tsx` — Automatización de re-stock via WA [Wave 60] |

---

## 6. PROVIDER STACK (orden exacto en main.tsx)

```text
StrictMode
  └─ ErrorBoundary
       └─ BrowserRouter
            └─ ThemeProvider
                 └─ Toaster (react-hot-toast, position: bottom-left)
                 └─ AuthProvider
                      └─ QueryClientProvider
                           └─ HelmetProvider
                                └─ App
```

Post-render: `navigator.serviceWorker.register('/sw.js')`.

---

## 7. SISTEMA DE DISEÑO

### 7.1 CSS Variables (`:root` en index.css)

Modo único: dark. No existe light mode.

| Token | Valor RGB | Uso |
| :--- | :--- | :--- |
| `--bg-primary` | `9 9 11` | Body, fondos principales |
| `--bg-secondary` | `24 24 27` | Tarjetas, superficies |
| `--bg-tertiary` | `39 39 42` | Inputs, elementos inset |
| `--text-primary` | `252 252 252` | Texto principal |
| `--text-secondary` | `161 161 170` | Texto secundario |
| `--text-tertiary` | `113 113 122` | Texto terciario |
| `--accent-primary` | `59 130 246` (blue) | CTAs, links activos |
| `--accent-secondary` | `139 92 246` (violet) | Focus rings |
| `--border-primary` | `255 255 255` | Bordes (se usa con alpha) |

### 7.2 Clases CSS clave (definidas en index.css @layer components)

| Clase | Propósito |
| :--- | :--- |
| `.glass-premium` | Glassmorphism: blur + border + shadow |
| `.glow-vape` / `.glow-herbal` | Box-shadow sección |
| `.container-vsm` | max-w-7xl + padding responsive |
| `.vsm-surface` / `.vsm-surface-inset` | Superficies con padding + border |
| `.vsm-pill` / `.vsm-tag` | Tags redondeados |
| `.vsm-btn` / `.vsm-btn-lg` / `.vsm-btn-icon` | Botones base |
| `.vsm-border` / `.vsm-border-subtle` / `.vsm-border-strong` | 3 niveles de borde |
| `.spotlight-container` | Efecto hover luminoso |
| `.bg-noise` | Textura de ruido SVG |
| `.skeleton-shimmer` | Loading skeleton animado |
| `.btn-shine` | Shimmer en CTAs |

### 7.3 Colores de sección

| Sección | Color | Tailwind |
| :--- | :--- | :--- |
| Vape | Azul (#3b82f6) | `vape-*` |
| 420 / Herbal | Verde (#10b981) | `herbal-*` |

### 7.4 Z-Index Scale (`lib/z-index.ts`)

| Layer | z-index | Uso |
| :--- | :--- | :--- |
| CONTENT | 30 | Sticky headers |
| FLOAT | 40 | WhatsApp FAB, CartSidebar, StickyAddToCart |
| NAV | 50 | BottomNav, SideDrawer, Dropdowns |
| OVERLAY | 100 | BottomSheet backdrop |
| SHEET | 101 | BottomSheet body |
| SKIP | 110 | Accessibility skip link |

---

## 8. TESTING

### 8.1 Estado actual — 12 tests en 12 archivos

| Carpeta | Archivos de test | Qué testean |
| :--- | :--- | :--- |
| `hooks/__tests__/` | `useHaptic.test.ts`, `useSwipe.test.ts` | Hooks de interacción |
| `lib/__tests__/` | `react-query.test.ts`, `utils.test.ts` | QueryClient config, utilidades |
| `lib/domain/__tests__/` | `loyalty.test.ts`, `orders.test.ts`, `pricing.test.ts` | Lógica de negocio |
| `lib/domain/validations/__tests__/` | `address.schema.test.ts`, `checkout.schema.test.ts`, `profile.schema.test.ts` | Schemas Zod |
| `stores/__tests__/` | `cart.store.test.ts`, `wishlist.store.test.ts` | Zustand stores |

### 8.2 Regla: Qué DEBE tener tests

| Tipo de archivo | ¿Test requerido? |
| :--- | :--- |
| `lib/domain/*.ts` | **SÍ, obligatorio** |
| `lib/domain/validations/*.schema.ts` | **SÍ, obligatorio** |
| `stores/*.store.ts` | **SÍ, obligatorio** |
| `hooks/use*.ts` (con lógica compleja) | **SÍ** |
| `services/*.service.ts` | Recomendado (requiere mock de Supabase) |
| `components/**/*.tsx` | Recomendado para componentes con lógica |
| `lib/utils.ts` | **SÍ** (ya tiene) |

### 8.3 Módulos SIN tests (gap conocido)

- `lib/product-sorting.ts` — tiene lógica de sort, debería tener tests
- `lib/domain/wheel.ts` — [NEW Wave 26] tiene lógica de selección de premios, debe tener tests
- `hooks/useCheckout.ts` — 231 líneas de lógica compleja, sin tests
- `hooks/useCartValidator.ts` — validación contra API, sin tests
- Todos los admin services — sin tests (excepción aceptada por ahora)

---

## 9. ROUTING

### 9.1 Storefront routes

| Ruta | Page | Auth |
| :--- | :--- | :--- |
| `/` | Home | No |
| `/vape` | SectionPage | No |
| `/420` | SectionPage | No |
| `/vape/:slug` | SectionSlugResolver → CategoryPage o ProductDetail | No |
| `/420/:slug` | SectionSlugResolver → CategoryPage o ProductDetail | No |
| `/buscar` | SearchResults | No |
| `/login` | Login | No |
| `/signup` | SignUp | No |
| `/profile` | Profile | Sí |
| `/addresses` | Addresses | Sí |
| `/orders` | Orders | Sí |
| `/orders/:orderId` | OrderDetail | Sí |
| `/loyalty` | Loyalty | Sí |
| `/stats` | Stats | Sí |
| `/notifications` | Notifications | Sí |
| `/checkout` | Checkout | No |
| `/wishlist` | Wishlist | No |
| `/contact` | Contact | No |
| `/rastreo` | TrackOrder | No |
| `/payment/success\|failure\|pending` | Payment pages | No |
| `/legal/terms` | Terms | No |
| `/legal/privacy` | Privacy | No |
| `/privacy` | Privacy (alias) | No |
| `*` | NotFound | No |

### 9.2 Admin routes (todas bajo `/admin`)

| Ruta | Page |
| :--- | :--- |
| `/admin` | AdminDashboard |
| `/admin/products` | AdminProducts |
| `/admin/products/new` | AdminProductForm |
| `/admin/products/:id` | AdminProductForm |
| `/admin/orders` | AdminOrders |
| `/admin/categories` | AdminCategories |
| `/admin/brands` | AdminBrands |
| `/admin/tags` | AdminTags |
| `/admin/customers` | AdminCustomers |
| `/admin/customers/:id` | AdminCustomerDetails |
| `/admin/coupons` | AdminCoupons |
| `/admin/settings` | AdminSettings |
| `/admin/sliders` | AdminHomeSliders |
| `/admin/monitoring` | AdminMonitoring |
| `/admin/testimonials` | AdminTestimonials |
| `/admin/home-editor` | AdminHomeEditor |
| `/admin/loyalty` | AdminLoyalty |
| `/admin/flash-deals` | AdminFlashDeals |
| `/admin/attributes` | AdminAttributes |
| `/admin/batch-manager` | AdminBatchManager |
| `/admin/*` | NotFound (catch-all) |

### 9.3 SectionSlugResolver (lógica dual)

1. Intenta cargar slug como **Categoría** (`useCategoryBySlug`).
2. Si existe → renderiza `CategoryPage`.
3. Si no existe → asume **Producto** → renderiza `ProductDetail`.

---

## 10. ISSUES PENDIENTES (deuda técnica activa)

### 10.1 CRÍTICOS — Afectan integridad del producto (Vacío)

> No hay issues críticos conocidos. Siguientes tareas son optimizaciones y features.

### 10.2 ALTOS — Type safety y data integrity (Depurado)

> Actualmente no hay issues de impacto Alto pendientes. ¡Excelente trabajo de limpieza!

### 10.3 BAJOS — Cosméticos y cleanup

| # | Issue |
| :--- | :--- |
| 14 | GA4 placeholder `G-XXXXXXXXXX` — analytics no activos |
| 15 | `SocialProof` FALLBACK_TESTIMONIALS — 5 testimonios inventados (solo si DB vacía) |
| 16 | MobileMenu sin focus trap |
| 17 | ProductImages sin touch zoom |
| 18 | `lib/monitoring.ts` vs `services/monitoring.service.ts` — logError duplicado |

### 10.5 RESUELTOS — Sprint 1 UI/UX (4 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| U1 | WhatsApp Float y ScrollToTop se solapaban | `ScrollToTop.tsx` | Posiciones separadas verticalmente (bottom-36 mobile, bottom-20 desktop) |
| U2 | CartSidebar decía "Envío: Gratis" siempre | `CartSidebar.tsx` | Ahora condicional: <$500 → "Se calcula al checkout" + barra progreso, ≥$500 → Gratis |
| U4 | Producto agotado sin badge claro | `ProductCard.tsx` | Badge "AGOTADO" rojo visible sin hover cuando stock=0 |
| Q1 | Badge stock pulsaba infinitamente | `ProductCard.tsx` | Limitado a 3 iteraciones vía animationIterationCount |
| Q2 | Botón carrito duplicado en ProductCard | `ProductCard.tsx` | Mini cart button ahora hidden en mobile (hidden md:flex) |
| Q4 | Shadow color naranja en CategoryShowcase | `CategoryShowcase.tsx` | Corregido de rgba(234,88,12) → rgba(59,130,246) (azul vape) |
| Q6 | Placeholders azules en CheckoutForm | `CheckoutForm.tsx` | 4 instancias cambiadas de accent-primary a theme-tertiary |

### 10.6 RESUELTOS — Sprint 2 UI/UX (4 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| U3 | Checkout sin resumen de productos | `CheckoutForm.tsx` | Mini-resumen colapsable con thumbnails, nombres, cantidades y precios |
| U5 | Empty state sin CTA activo | `ProductGrid.tsx`, `SectionPage.tsx` | Nuevo prop `onClearFilter` con botón "Limpiar filtro" o "Ver tienda" |
| Q3 | BottomNav "Popular" no funcionaba fuera de Home | `BottomNavigation.tsx` | Navigate + retries con `scrollIntoView` para scroll robusto |
| Q7 | WhatsApp Float sin tooltip ni animación | `WhatsAppFloat.tsx` | Tooltip auto-show 4-8s, animación de entrada, ping overlay |
| N5 | Cart sin límite de cantidad | `CartSidebar.tsx` | Botón + disabled cuando quantity >= stock |
| N10 | Wishlist sin bulk action | `Wishlist.tsx` | Botón "Agregar todo al carrito" + "Limpiar" con filtro de stock |

### 10.7 RESUELTOS — UI/UX Enhancement Sprint (Nuevas)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| O1 | ProductCard re-renders innecesarios | `ProductCard.tsx` | Selectores granulares zustand en vez de destructuring del store completo |
| O5 | Below-fold sin content-visibility | `Home.tsx` | `content-visibility: auto` + `containIntrinsicSize` en FlashDeals y SocialProof |
| O6 | SocialProof cargaba eagerly (633 líneas) | `Home.tsx` | `React.lazy()` + Suspense fallback skeleton |
| N1 | ProductCard sin indicador de múltiples imágenes | `ProductCard.tsx` | Dots indicator con highlight del índice activo (max 4 dots) |
| N3 | No scroll al grid al cambiar categoría | `SectionPage.tsx` | `gridRef` + useEffect con scrollIntoView smooth al seleccionar categoría |
| N4 | Eliminar del carrito sin aviso | `CartSidebar.tsx` | Notificación info con nombre del producto eliminado |

### 10.8 RESUELTOS — Hotfixes producción (5 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| H1 | Header 2da línea no alineada | `Header.tsx` | DeliveryLocation `flex-shrink-0` + DesktopNav `flex-1 justify-center` para igualar ancho |
| H2 | Slider título empuja CTAs fuera de vista | `MegaHero.tsx` | Font 6xl→5xl / 8xl→7xl / 7rem→6rem + justify-end con pb-28 |
| H3 | Categorías sin imagen (solo gradiente) o duplicadas | `CategoryShowcase.tsx`, `category-showcase.ts` | 1) Fallback icon usando estado local (`useState`/`useEffect`). 2) Prevenir race conditions. 3) Combinar `category.id` e `index` en el `key` de React para evitar re-uso del DOM si dos IDs de DB colisionan. 4) Arreglo de URL 404 de Unsplash.|
| H4 | FlashDeals imágenes rotas | `FlashDeals.tsx` | onError con 2-step: original URL → icon Package fallback |
| H5 | ProductCard sin imagen (icon invisible) | `OptimizedImage.tsx` | Early return con fallback +"Sin imagen" cuando src vacío |
| H6 | Imágenes rotas "Comprados Juntos" | `FrequentlyBoughtTogether.tsx` | Reemplazo de `img` tag crudo por componente `<OptimizedImage>` + props tipados directamente |
| H7 | Panel Admin: Imágenes rotas en Grid | `ProductTableRow.tsx` | Reemplazo de `<img>` raw por `<OptimizedImage>` con fallback a `product.cover_image` |
| H8 | Panel Admin: Botones Acción invisibles | `ProductTableRow.tsx` | Eliminado `sm:opacity-0 sm:group-hover:opacity-100` para garantizar visibilidad base en Desktop |
| H9 | Panel Admin: Command Palette (Cmd+K) | `AdminLayout.tsx`, `AdminCommandPalette.tsx` | Quick Win de UX. Barra de búsqueda global que permite saltar de un módulo del admin a otro presionando Cmd+K o Ctrl+K. |
| H10 | Panel Admin: Estados Vacíos inconsistentes | `AdminOrders.tsx`, `AdminCoupons.tsx`, `AdminCustomers.tsx`, `AdminCategories.tsx`, `AdminEmptyState.tsx` | Quick Win de Diseño. Remplazados múltiples layouts customizados y esparcidos por un único componente Lego premium con patrón glassmorphism y soporte de íconos de Lucide. |
| H11 | Panel Admin: Ping visual de Pedidos Pendientes | `AdminLayout.tsx` | Quick Win de Notificación. Un pequeño punto animado ("ping" Tailwind) notifica al admin sobre pedidos en status inicial generados en las últimas 24 hrs. |
| H12 | Storefront: Categorías truncadas | `CategoryShowcase.tsx` | Quick Win de UI. Removido `line-clamp-1` que truncaba nombres largos; se cambió por `line-clamp-2 leading-none` y texto responsivo. |
| H13 | Storefront: Placeholder de Imagen Rota | `OptimizedImage.tsx` | Quick Win de Diseño. Reemplazado bloque sólido color gris con padding ancho por cápsula Glassmorphism premium (desenfoque y hover) universal para no tener un "No Image" tosco. |
| H14 | Storefront: Migas de Pan flotantes | `ProductBreadcrumbs.tsx` | Quick Win de Diseño. Convertido enlace flotante ahogado en pastilla Glassmorphism con padding que otorga separación ("App feel"). |
| H15 | Bug: Sincronización Carrito | `cart.store.ts` | Corregido fallo de eliminación de variantes duplicadas por comparación inconsistente. |

### 10.9 RESUELTOS — Sprint 4: Robustez y Performance (6 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| N9 | Formulario de Contacto Robusto | `Contact.tsx`, `contact.schema.ts` | Migración a React Hook Form + Zod. Validación 100% client-side con feedback visual premium. |
| Q8 | Ocultar Newsletter | `Footer.tsx` | Sección de suscripción oculta por falta de backend. Limpieza de imports/iconos no usados. |
| O7 | Analytics Optimization | `CheckoutForm.tsx` | Cambio de import dinámico eager por import estático/persistente para evitar overhead en mount. |
| O8 | Scroll Throttle | `ScrollToTop.tsx` | Throttle de 150ms al listener de scroll global para ahorrar CPU en scroll infinito. |
| SEC | WhatsApp Sanitization | `Contact.tsx` | Uso estricto de `encodeURIComponent` en todos los campos para evitar inyecciones en la URL de la API. |
| DBG | Error Boundary Coverage | `App.tsx` | Verificada la cobertura de `ErrorBoundary` en Storefront y `AdminErrorBoundary` en Admin. |

### 10.10 RESUELTOS — Sprint 5: Experiencia de Usuario y Optimización (6 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| N2 | Categorías Skeletons | `SectionPage.tsx`, `CategorySkeleton.tsx` | Implementación de estados de carga animados para categorías, eliminando el CLS al cargar datos. |
| N6 | Persistencia Checkout | `CheckoutForm.tsx` | Uso de `sessionStorage` para mantener los datos del formulario tras recargas o navegaciones accidentales. |
| N7 | Brands Pause Touch | `BrandsCarousel.tsx` | El carrusel infinito de marcas ahora se pausa al tocar en dispositivos móviles. |
| N8 | TrustBadges Copy Fix | `TrustBadges.tsx` | Ajuste de textos ("Pagos") para evitar truncamiento en viewports pequeños (<380px). |
| N11 | ProductRail Card Size | `ProductRail.tsx` | Aumento del ancho de tarjetas en móvil (170px → 200px) para mejorar legibilidad. |
| O3 | Gradientes Map Lookup | `CategoryShowcase.tsx` | Mejora de performance O(n) → O(1) usando un Map estático para la búsqueda de estilos. |
| O4 | Sidebar GPU Accord | `CartSidebar.tsx` | Inyección de `will-change: transform` para forzar aceleración por hardware en la apertura del carrito. |

### 10.11 RESUELTOS — Sprint 6: Integridad y Refactorización (6 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| C1 | FlashDeals Real Data | `FlashDeals.tsx`, `flash-deals.service.ts` | Integración total con tabla `flash_deals`. Mock eliminado. |
| C2 | Zero Fakes Policy | `SocialProofToast.tsx` | Eliminación de compras falsas. Componente desactivado hasta Realtime. |
| R1 | SocialProof Atomicity | `social/` | Refactorización de 633 líneas en 6 componentes atómicos reutilizables. |
| T1 | MP Payment Safety | `types/cart.ts` | Eliminación de `any` en `mp_payment_data` via interfaz estricta. |
| T2 | Service Type Safety | Varios services | Reducción de casts `as Product[]` mediante tipado de retorno en Supabase. |
| N12| MegaHero Fallbacks | `MegaHero.tsx` | Expansión de fallback de 3 a 5 slides premium (ocean/gold presets). |

### 10.12 RESUELTOS — Mejoras Maestro y Estabilización Admin (6 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| A1 | Dashboard Restoration | `DashboardStats.tsx`, `AdminLayout.tsx` | Reversión de estilos experimentales a los originales para cumplir con el diseño maestro. |
| A2 | Admin Notification Rescue | `App.tsx` | Fix crítico: se habilitó el renderizado de Toaster y ToastContainer en rutas de admin que estaba bloqueado. |
| A3 | Insights Relocation | `DashboardHeader.tsx` | Movimiento de bloques de insights al lado izquierdo del dashboard para mejor flujo visual. |
| A4 | Position Awareness | `App.tsx` | Notificaciones movidas a `bottom-right` exclusivamente para el panel de administración. |

### 10.14 RESUELTOS — Wave 26: Ruleta Premium (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| RU1 | Violación §1.1 en `PrizeWheel` | `PrizeWheel.tsx`, `useWheelConfig.ts` | El componente llamaba a `gamificationService` directamente. Ahora usa hook `useWheelConfig` con TanStack Query |
| RU2 | Lógica de dominio inline | `lib/domain/wheel.ts` | `selectPrizeByProbability` y `calculateTargetRotation` extraidas a capa de dominio pura |
| RU3 | `select('*')` en service | `gamification.service.ts` | Reemplazado por selectores explícitos (Precision Fetching Wave 15) |
| RU4 | `console.log` en producción | `gamification.service.ts` | Eliminados 2 `console.log` de `recordSpin` |
| RU5 | Bug: `setIsSpinning(true)` nunca llamado | `usePrizeWheel.ts` | Corregido — la ruleta nunca mostraba estado de giro |
| RU6 | Rediseño Premium | `PrizeWheel.tsx`, `WheelInvitation.tsx` | Segmentos con shine, anillo orbital, particles, confetti, overlay de resultado con glow dinámico, botón shimmer |

---

 — Wave 25: Flash Deals UX & TypeScript Purity (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| FD1 | Flash Deals — Timer UX simplificado | `FlashDealEditor.tsx` | Reemplazo de `datetime-local` crudo por presets de duración (1h/3h/6h/12h/24h/Custom) + toggle "Ahora mismo" / "Programar inicio" + resumen de timing automático |
| FD2 | Flash Deals — Status Panel real | `FlashDealsConfig.tsx` | La card de "Timer Global" (desconectada del storefront) reemplazada por Status Panel con contadores en vivo y countdown a la próxima expiración |
| FD3 | Flash Deals — Tiempo restante en tabla | `FlashDealsTable.tsx` | Columna "Fechas" reemplazada por badge ⚡ con colores de urgencia: verde (OK), ámbar (< 2h), rojo parpadeante (< 60m), azul (programada) |
| TS1 | TypeScript purity — `any` eliminados | `CheckoutForm.tsx` | Reemplazados 6 usos de `any` con tipos estrictos: `React.ComponentType`, `FloatingInputProps extends React.InputHTMLAttributes`, `PaymentMethod` union |
| TS2 | TypeScript purity — unused imports | `FlashDealEditor.tsx` | Eliminados `Clock` y `getDurationLabel` no usados (eslint compliance) |

### 10.15 RESUELTOS — Wave 28: Core Audit, Type Safety & Performance (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| CA1 | The `any` Purge | `useOrders.tsx`, `DashboardStats.tsx`, `loyalty.service.ts`, `admin-variants.service.ts` | Eliminación sistémica y tipado estricto de docenas de afirmaciones `any` explícitas e implícitas en hooks y servicios críticos, reforzando la regla §1.2 de "Cero tolerancia". |
| CA2 | Function Overloads | `products.service.ts` | Refactor exacto para `mapProductVariations` implementando Method Overloads explícitos (Product vs Product[]) en vez de aserciones. |
| CA3 | Eliminación over-fetching `select('*')` | `addresses`, `coupons`, `auth`, `loyalty`, `notifications`, `testimonials`, `admin-orders`, `admin-customers` | Sustitución de 8 ocurrencias de `select('*')` por listados explícitos de campos para mitigar impacto en payload de red y mejorar query performance (§1.4 regla intrínseca). |
| CA4 | Producción log blocking | `AdminGuard.tsx`, `ShareButton.tsx`, `analytics.ts`, `main.tsx` | Aislamiento de 8 comandos `console.log` intrusivos bloqueándolos detrás de la bandera condicional `import.meta.env.DEV` (cumplimiento regla §1.8). |
| CA5 | Estandarización Headers JSDoc | `hooks/*.ts`, `services/*.ts` | Inyección de cabeceras JSDoc estándar de dominio a 24 archivos de interfaces para satisfacer la obligatoriedad de documentación a nivel módulo. |

### 10.16 RESUELTOS — Wave 34 & 35: Data Integrity y Premium Gamification (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| W34.1 | Phantom query order crash | `admin-orders`, `admin-customers`, `orders.service`, `OrderDetail` | Eliminación sistémica del campo fantasma `tracking_number` usado erróneamente en el front-end en favor de `tracking_notes` (existente en BD) recuperando la vista de Orders. |
| W34.2 | Missing Loyalty Visibility | `UserMenuDropdown.tsx` | Los V-Coins ahora son inyectados y visibles globalmente desde el Navbar Header como recordatorio y gancho de lealtad constante. |
| W34.3 | Header Layout Shift Loop | `Header.tsx` | Transición errática e inestable entre `relative` y `sticky` forzaba un reflow infinito. Reparado, convertido a un sticky permanente limpio. |
| W35.1 | Gamification Engine Revamp | `PrizeWheel.tsx` | Transición de CSS Confetti a lienzo `canvas-confetti` + motor React Spring/FramerMotion para colisión y rebotes reactivos del pointer durante el spin. |
| W35.2 | Procedural Audio | `useWheelAudio.ts` | Uso estricto de Web Audio API para síntesis en tiempo real del tick y arpegios casino sin depender de .mp3 externos reduciendo TTFB. |
| W35.3 | Linter Rule 1.10 Adherence | `AI_CONTEXT.md` | Cumplimiento retroactivo tras omisión crítica en la sync de la Wave 35 documentando el total de archivos y estado del hook de audio. |

### 10.17 RESUELTOS — Wave 36: Audit, Cart Integrity & Accessibility (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| W36.1 | Cart Variant Persistence | `cart.store.ts` | Corrección de bug crítico donde `loadOrderItems` (re-compra) perdía el `variant_id` y `variant_name`. Ahora se preserva la integridad de talla/color. |
| W36.2 | Mobile Navigation Focus Trap | `MobileMenu.tsx` | Implementación de ciclo de foco (Tab/Shift+Tab) y auto-focus inicial al abrir el menú móvil, alineando la navegación con estándares de accesibilidad premium. |
| W36.3 | MercadoPago Type Purity | `cart.ts`, `cart.store.ts` | Eliminación definitiva de `any` en interfaces de pago MP y mapeo de órdenes, reemplazados por `unknown` y casting seguro. Estado: 0 warnings. |

### 10.18 RESUELTOS — Wave 37: Identity & Profile Audit (10 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| W37.1 | JSDoc Standardization | `AuthContext`, `useAuth`, `auth.service`, `useAddresses`, `addresses.service` | Inyección de cabeceras JSDoc estándar de dominio a todo el núcleo de identidad para cumplimiento de la normativa §1.1. |
| W37.2 | Identity Integrity Audit | `Profile`, `ProfileForm`, `AvatarUpload` | Auditoría línea por línea de la gestión de perfiles. Verificación de seguridad RLS y persistencia de avatar exitosa. Cero deuda técnica detectada. |
| W37.3 | Address Service Reforce | `addresses.service.ts` | Verificación del cumplimiento de la regla §1.4 (selectores explícitos) en todo el módulo de gestión de direcciones. |

### 10.18.2 RESUELTOS — Wave 70: AI Immersion & Sensory (12 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| W70.1 | AI Assistant Integration | `AIConcierge.tsx`, `useAIConcierge.ts` | Implementación de asistente flotante con físicas de resorte y chat con Gemini. |
| W70.2 | Semantic Search upgrade | `SearchBar.tsx`, `concierge.service.ts` | Implementación de botón "IA Smart" para descubrimiento de productos basado en intenciones. |
| W70.3 | Global Sensory Engine | `App.tsx`, `CartSidebar.tsx`, `CheckoutForm.tsx` | Migración de `TacticalProvider` a nivel global y cableado de audio/háptica en flujos de venta. |
| W70.4 | Null Audio Safety | `TacticalContext.tsx` | Saneamiento de accesos nulos en el motor de audio para legacy browsers. |
## Cognitive Layer & Predictive UX (§110)
- **IA Context Persistence**: Customer profiles now include `ia_context` (JSONB) to store intent history and personas.
- **Predictive Prefetching**: `ProductCard` implements hover-intent prefetching to prime Apollo/React-Query cache.
- **Adaptive Identity**: `TacticalProvider` orchestrates global CSS variables based on AI-extracted user propensity (Vape vs Herbal).
- **Gamified Loyalty**: `SmartQuests` module provides personalized challenges based on IA interaction history.
---


### 10.19 RESUELTOS — Waves 52-57: Global Admin Audit & Sanitization (12 marzo 2026)

| # | Fix | Archivo(s) | Detalle |
|---|-----|-----------|--------|
| AA1 | Security Log Sanitization | 17 Admin Orchestrators | Envoltura de +25 `console.error` y `console.log` en bloques `import.meta.env.DEV` para prevenir fugas de datos en producción (§1.8). |
| AA2 | Explicit Data Selection | 12 Admin Services | Sustitución masiva de `select('*')` por selectores de columnas explícitos en todos los servicios de administración (§1.2, §10.13 compliance). |
| AA3 | Admin Dashboard Intelligence | `admin-dashboard.service.ts` | Integración con Google Gemini (Cloudflare Edge Function) para análisis estratégico de métricas en el cabecero del admin. |
| AA4 | Type Purity Verification | Todo el Admin | Verificación y corrección de tipos `any` residuales en componentes de monitoreo y ajustes. Estado final: 100% Type-safe. |

---

### 11.0 DICCIONARIO DE DATOS CORE (Obligatorio leer antes de migrar)

**LEY ESTRICTA PARA IA Y DEVS:** Nunca asumir los esquemas genéricos de Supabase. El esquema real es el siguiente:

- **Usuarios**: Tabla `customer_profiles` (Primary Key: `id UUID`). NUNCA usar la tabla `profiles`.
- **Cupones**: Tabla `coupons` (Primary Key: `code TEXT`). NUNCA usar UUID para referenciar cupones, usar `TEXT`.
- **Órdenes**: Tabla `orders` (Primary Key: `id UUID`, Folio Visual: `order_number TEXT`).

### 11.1 Migraciones (26 archivos, cronológicas)

| # | Archivo | Qué hace |
| :--- | :--- | :--- |
| 001 | initial_schema | Products, categories, orders, order_items, coupons |
| 002 | users_system | Profiles, addresses |
| 003 | admin_users | Admin role system |
| ... | (14 incrementales) | Payment fields, store settings, notes, bank, badges, monitoring, payments, sliders, loyalty, tracking, categories, constraints, flash deals, product tags |
| 20260224 | testimonials | Tabla testimonials |
| 20260301 | brands, loyalty_statistics, slider_images, featured_categories | Marcas, stats, sliders, featured |
| 20260302 | flash_deals, orphan_categories | Flash deals + trigger orphan protection |
| 20260306 | product_variations | Tablas product_attributes, product_attribute_values, product_variants, product_variant_options |
| 20260309 | coupon_integrity | Columnas de uso y restricciones en cupones |
| 20260310 | fix_coupon_rpc | Reparación de procedimiento almacenado de cupones |
| 20260310 | smart_loyalty | Sugerencias IA para Reward Engine |
| 20260306 | unified_product_variations | Unificación de tablas, RLS corregido y Seed inicial |
| 20260307 | crm_intelligence | Vistas `customer_rfm_metrics` y `customer_intelligence_360` |
| 20260307 | fix_crm_view_v2 | Expansión de vista inteligente para soportar listado completo sin JOINs |
| 20260308 | loyalty_referrals | Tabla referrals, códigos únicos y trigger奖励 automático |
| 20260309 | coupon_integrity | RPC atómico para cupones y tabla smart_loyalty_propositions |

### 11.2 Edge Functions (11 total: 9 AI + 2 Payments/Tracking)

> **Modelo AI:** `gemini-2.0-flash` via `v1` REST API (migrado 2026-03-15)
> **Secrets:** `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

| Función | Propósito | Modelo/API |
| :--- | :--- | :--- |
| `inventory-oracle` | Predicción de agotamiento de stock basada en series temporales | Gemini 2.0 Flash (v1) |
| `dashboard-intelligence` | Insights de negocio AI para el panel admin | Gemini 2.0 Flash (v1) |
| `customer-intelligence` | Brain central para CRM, Concierge, NLP y Búsqueda Semántica (5 acciones) | Gemini 2.0 Flash (v1) |
| `voice-intelligence` | Procesamiento de lenguaje natural → queries de búsqueda | Gemini 2.0 Flash (v1) |
| `product-intelligence` | Orquestación de copy y tags para productos | Gemini 2.0 Flash (v1) |
| `loyalty-intelligence` | Motor IA. Gemini analiza RFM y crea cupones únicos | Gemini 2.0 Flash (v1) |
| `customer-narrative` | Narrativas contextuales de clientes | Gemini 2.0 Flash (v1) |
| `bundle-intelligence` | Sugerencias inteligentes de bundles de productos | Gemini 2.0 Flash (v1) |
| `embeddings-processor` | Generación de vectores de embedding para Neural Search | text-embedding-004 (v1beta) |
| `create-payment` | Crea preferencia MercadoPago desde order_id | — |
| `mercadopago-webhook` | Recibe webhook de pago, actualiza order | — |
| `track-shipment` | Consulta tracking DHL | — |

#### Historial de migraciones AI

| Fecha | Cambio | Razón |
| :--- | :--- | :--- |
| 2026-03-15 | `v1beta` → `v1` | Endpoint v1beta deprecado |
| 2026-03-15 | `gemini-1.5-flash` → `gemini-2.0-flash` | Modelo 1.5 completamente retirado por Google |
| 2026-03-15 | Eliminado `responseMimeType` | Parámetro no soportado en API v1 |

---

## 16. CRM ELITE & INTELIGENCIA (Marzo 2026)

### 16.1 Arquitectura de Datos

- **Vista `customer_rfm_metrics`**: Agregación de Recencia (días), Frecuencia (pedidos) y Valor Monetario (total_spent).
- **Vista `customer_intelligence_360`**: Clasifica al cliente en segmentos:
  - *Campeón*: Alto RFM.
  - *Leal*: Alta frecuencia.
  - *Nuevo*: Recencia baja, frecuencia 1.
  - *En Riesgo*: Recencia alta (>30 días).
  - *Prospecto*: Sin compras.
- **Timeline Events**: Unión de `orders`, `admin_customer_notes`, `loyalty_history` y `coupons_used`.

### 16.2 Motor de Insights (Fase A - Reglas)

Implementado en `admin-crm.service.ts`:

- **Fuente de Datos Unificada**: La vista `customer_intelligence_360` provee tanto el perfil como los insights, evitando fallos de JOIN en PostgREST.
- Genera `CustomerInsight[]` analizando el objeto `CustomerIntelligence`.
- Provee alertas visuales en `CustomerIntelligencePanel.tsx` con acciones sugeridas.

### 16.3 Roadmap IA (Fase B - Generativa)

- **Integración Gemini**: Uso de `VITE_GEMINI_API_KEY` para análisis semántico.
- **Copywriting**: Redacción automática de mensajes de "recuperación" para clientes *En Riesgo*.
- **Business Analyst**: Chatbot de consultas sobre métricas globales de clientes.

---

### 11.3 Orphan Categories System

Al eliminar una categoría, trigger `trg_category_delete_protect` reasigna productos huérfanos a "Sin Categoría" y re-padrea hijos al abuelo. Las categorías fallback NO se pueden eliminar.

---

## 12. BUILD & DEPLOY

### 12.1 Bundle (vendor splitting)

| Chunk | Contenido | Notas |
| :--- | :--- | :--- |
| `index` | App code | Cambia en cada deploy |
| `vendor-react` | react + react-dom + scheduler | Inmutable entre deploys |
| `vendor-supabase` | @supabase/supabase-js | Inmutable |
| `vendor-framer` | framer-motion | Solo lazy pages |
| `vendor-query` | @tanstack/react-query | Inmutable |
| `vendor-router` | react-router-dom | Inmutable |
| `vendor-zod` | zod | Solo lazy forms |
| `vendor-sentry` | @sentry/react | Dynamic import, ~0 kB si no hay DSN |

### 12.2 Optimizaciones activas

- **Vendor chunks cacheables:** libs en chunks independientes que no cambian entre deploys
- **Source maps:** `sourcemap: 'hidden'` (genera .map para Sentry, browser no los descarga)
- **Console stripping:** `terser` con `drop_console: true, drop_debugger: true`
- **Lazy loading:** CartSidebar, OrderNotifications, AdminErrorBoundary, SocialProofToast, QuickViewModal, NotificationCenter — todos lazy
- **React.memo:** Footer, BottomNavigation, ProductCard
- **Supabase preconnect:** `<link rel="preconnect">` en index.html
- **Image optimization:** `optimizeImage()` reescribe URLs a Supabase render endpoint (WebP)
- **Presence WebSocket:** solo para admin (storefront visitors no abren WebSocket)
- **Hero LCP:** `fetchPriority="high"` + `loading="eager"` en MegaHero

### 12.3 Deploy (Cloudflare Pages)

- **Plataforma:** Cloudflare Pages
- **Build command:** `npm run build` (tsc + vite build + generate-sitemap)
- **Output directory:** `dist/`
- **SPA routing:** Cloudflare Pages maneja fallback automático
- **Headers:** `public/_headers` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **Env vars en Cloudflare:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 13. CONFIGURACIÓN CENTRAL

### 13.1 SITE_CONFIG (`src/config/site.ts`)

Nombre tienda, WhatsApp number, email, dirección física, datos bancarios, redes sociales, locale (es-MX/MXN), template de mensaje WhatsApp.

### 13.2 Constantes (`src/constants/app.ts`)

`SECTIONS`, `PRODUCT_FLAGS`, `ORDER_STATUS`, `STORE_SETTINGS_ID`, `USER_ROLES`.

### 13.3 Environment Variables

```text
VITE_SUPABASE_URL        # URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY   # Anon key (usada en cliente)
```

Solo estas dos. GA4 y Sentry están en código (placeholders).

---

## 14. CONVENCIONES DE CÓDIGO

| Aspecto | Convención |
| :--- | :--- |
| Naming archivos | kebab-case. Componentes: PascalCase.tsx. Services: kebab.service.ts |
| Exports | Named exports (no default). Lazy: `.then(m => ({ default: m.X }))` |
| Imports | Path alias `@/` → `src/`. No relative imports fuera de carpeta actual |
| Section type | SIEMPRE de `@/types/constants` (canonical) |
| Admin services | SIEMPRE del barrel `@/services/admin` |
| Hooks | `use*.ts`. Retornan useQuery/useMutation result |
| Services | `*.service.ts`. Funciones async puras |
| Types | En `src/types/`. Export interface + type Insert + type Update |
| Tests | `__tests__/` con `.test.ts(x)`. Vitest + Testing Library |
| Styles | Tailwind classes en JSX. Custom CSS en `index.css` layers |
| Notifications | `useNotification` hook. NUNCA `react-hot-toast` directo en componentes |
| Images | `optimizeImage()` para productos. `<OptimizedImage>` para componente |

---

## 15. DECISIONES HISTÓRICAS

| Decisión | Razón | Fecha |
| :--- | :--- | :--- |
| SPA pura (no SSR) | Deploy en Cloudflare Pages. SEO con react-helmet-async + JSON-LD + sitemap | Inicio |
| Supabase como BaaS | Auth + DB + Storage + Realtime + Edge Functions en uno | Inicio |
| Zustand sobre Context | Context causa re-renders. Zustand es selectivo y persiste | Inicio |
| TanStack Query sobre fetch manual | Cache, deduplicación, retry, staleTime | Inicio |
| Tailwind + CSS Variables | Variables para dark-only. Tailwind para utilities | Inicio |
| Secciones vape/420 dual | Dos verticales de negocio con color propio | Inicio |
| Hard delete categorías + trigger | Soft delete complicaba queries. Trigger maneja huérfanos | 02-Mar-2026 |
| Admin sin hooks layer | Pages importan services directamente. Excepción aceptada | Histórica |
| framer-motion v6 (pinned) | No se ha migrado a v11. `exitBeforeEnter` funciona en v6 | Histórica |
| Cart store version migration | localStorage puede tener schema viejo. Version 2 limpia | 03-Mar-2026 |
| `noUncheckedIndexedAccess` | Obliga a verificar undefined en accesos por índice | Inicio |
| Cloudflare Pages deploy | CDN global, builds rápidos, SPA routing nativo | Inicio |
| Zero Fakes Strategy | Eliminar datos fake de Social Proof para mantener integridad | 06-Mar-2026 |
| Component Split SocialProof | Dividir SocialProof en mini-componentes para mejorar mantenimiento | 06-Mar-2026 |
| Módulo de Variaciones | Implementación de atributos globales y matriz de variantes por producto | 06-Mar-2026 |
| Precision Fetching (Wave 15) | Optimización masiva de `select('*')` por selectores explícitos en servicios core y admin | 09-Mar-2026 |
| AI Recovery Insights (Wave 15)| Integración de Gemini para análisis estratégico y generación de copy de recuperación en CRM | 09-Mar-2026 |
| Flash Deals Duration UX (Wave 25) | Presets de duración reemplazan datetime-local crudo. Status Panel reemplaza timer global de store_settings | 10-Mar-2026 |
| Gamification Domain Separation (Wave 26) | Lógica de probabilidad de ruleta extraida a `lib/domain/wheel.ts`. Hook `useWheelConfig` implementado para cumplir §1.1 | 10-Mar-2026 |
| Admin Audit & Sanitization (Wave 57) | Auditoría integral de 17 módulos admin. Saneamiento total de logs. | 12-Mar-2026 |
| AI Immersion & Sensory (Wave 70) | Integración global de IA Asistente y Tactical UI en Storefront. | 12-Mar-2026 |
| Resilience-First Architecture (Wave 80) | Decisión de aislar errores por componente para proteger flujo de venta. | 12-Mar-2026 |
| Gemini API Migration (Wave 121) | Migración de gemini-1.5-flash (retirado) a gemini-2.0-flash. Endpoint v1beta→v1. Eliminado responseMimeType. | 15-Mar-2026 |

---

## 16. DEPENDENCIAS CRÍTICAS

| Dependencia | Efecto de cambiarla |
| :--- | :--- |
| `@supabase/supabase-js` | Reescribir todos los services |
| `@tanstack/react-query` | Reescribir todos los hooks |
| `zustand` | Reescribir carrito, wishlist, notificaciones + localStorage |
| `react-router-dom` | 50+ lazy imports dependen de esta API |
| `tailwindcss` | Todo el CSS. 1000+ archivos |
| `framer-motion` | Animaciones en ~30 componentes |
| `react-hook-form` + `zod` | Todos los forms: checkout, profile, address, admin |

---

*Generado: 3 de marzo de 2026. Reestructurado: 4 de marzo de 2026. Revisado: 15 de marzo de 2026 (Wave 121 - Gemini 2.0 Flash Migration).*
*Este documento refleja el estado REAL, no aspiracional. Léelo completo antes de tocar código.*
*Tras cualquier cambio al código, actualizar este documento (§1.10).*
*Historial de auditorías: ver `AUDIT_LOG.md`.*
| 20260312_neural_search_infra.sql | Set up pgvector and match_products RPC |
| 20260312_upgrade_crm_360.sql | Upgrade intelligence views to include cognitive fields |
