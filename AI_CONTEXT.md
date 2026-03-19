# VSM STORE — DOCUMENTO MAESTRO TÉCNICO

> **FUENTE DE VERDAD ABSOLUTA.** Foto técnica real del sistema.
> NO es un plan. Es lo que EXISTE. Leer COMPLETO antes de tocar cualquier archivo.
> Cualquier IA o desarrollador que trabaje en este proyecto DEBE obedecer este documento.
> **Tras cada cambio al código, ACTUALIZAR este documento (ver §1.10).** Sin excepción.
> Historial de auditorías detallado en `AUDIT_LOG.md`.

## 🛰️ Project Status
- **Wave 193 (DONE)**: Marketing AI Reality Repair. Removed non-existent `marketing-intelligence` dependency. Implemented robust local heuristics for Coupons and Flash Deals. Renamed `Magic` branding to `System` for architectural sincerity. Cleaned `useAdminMarketing.ts` to use `suggestFlashDealSystem`. Base Build v113.
- **Wave 192 (DONE)**: Knowledge Ops Manager. Formal administrative tooling inside Cesarin OS (`TabKnowledge` & `TabConcepts`) for safe vector syncs and directional graph edits. Base Build v112.
- **Wave 191 (DONE)**: Canonical Closure of Compatibility & Concepts Layer. Validation suite 13/13 PASS. Deployment drift resolved (V121 uses correct `gemini-2.5-flash` model).
- **Wave 190 (DONE)**: Cesarin Human Evaluation Loop — Implementation of supervised review entity, simulation isolation, and v1 API protocol alignment.
- **Wave 189 (DONE)**: Analyst Refinement Loop — Improved first-pass intent classification.
- **Wave 188 (DONE)**: Knowledge Enrichment Loop — telemetry-driven RAG enrichment.

- **Storefront AI Pilot (DONE)**: Slices 1A–2D closed. Phase 3.2C (Semantic Activation) closed.
- **Status:** **FULLY OPERATIONAL — Cleared for Unrestricted Pilot (Base Build v112)** | **A64 Hygiene:** DONE
- **AI Runtime Stack (canonical, March 2026):**
  - Analyst / Sommelier: `gemini-2.5-flash` via `v1` (generateContent)
  - Embeddings: `gemini-embedding-001` via `v1beta` (3072d — v1 returns 404/405 for this model)
  - Guardrail: Brain-first — capsules execute; Analyst/Sommelier hold semantic authority; `UNKNOWN` is last resort.
- **Total Count**: 193 Waves / A65 Closure.

**Última actualización verificada:** 19 de marzo de 2026 (A65 — Marketing AI Reality Repair — v113).

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
npm run typecheck        # Estándar: 0 errores (Estado actual: 0 errores verified post-Wave 189 remediation)
npm run lint             # 0 errores ESLint
npm run test:run         # 12 tests passing
npm run build            # Build exitoso
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
Database (Supabase) → Services (Normalizing Layer) → Hooks → Components/Pages
```

**NUNCA al revés.** **PRINCIPIO DE RESILIENCIA (Wave 80 & 168):** Cada componente debe ser capaz de fallar de forma aislada sin detener la venta. El Service Layer DEBE normalizar datos externos (ej: `specs: data.specs || {}`) para evitar crashes de componente por datos corruptos o nulos.

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
- [Cesarin OS: Neural Sales Engine (Wave 159)](#cesarin-os-neural-sales-engine-wave-159)
- [Seguridad y Rendimiento](#seguridad-y-rendimiento)

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

### Wave 127: Performance Master

- **Upgrade Framer**: Migración masiva a framer-motion v12 (mode="wait").
- **LCP Optimizada**: Prioridad de carga en MegaHero y refactor de optimizeImage.
- **Code Health**: Resuelto 100% de errores de tipado de variantes en v12.

### Wave 128: Admin Hook Unification

- **Centralized Logic**: 100% de servicios administrativos migrados a hooks de TanStack Query.
- **Lego Master**: Todas las páginas admin refactorizadas para eliminar lógica de servicios directa.
- **Barrel Exports**: Implementado `src/hooks/admin/index.ts` para importaciones limpias.

### Wave 129: Sensorama UX (Tactical Admin)

- **Sensory Injection**: Integrado `useAdminTactical` en todas las mutaciones críticas (Productos, Pedidos, Marketing).
- **Audio & Haptic**: Sfx procedimentales y vibración en sidebar y búsquedas administrativas.

### Wave 130: Neural Identity (Hero Personalization)

- **useNeuralHero**: Nuevo hook puente entre CRM Intelligence y el Storefront.
- **Personalized Hero**: Inyección de slides dinámicos basados en segmentación RFM (Campeón, En Riesgo, Prospecto).

### Wave 132: Social Proof Mastery (Zero Fakes)

- **Real-time Pulse**: Activación de `SocialProofToast` conectado a Supabase Realtime para notificaciones de órdenes en vivo.
- **Data Integrity**: Anonimización estricta y enriquecimiento de datos de ubicación/producto en tiempo real.

### Wave 133: Professional Voice Assistant

- **Sensory Unity**: Implementado `useStorefrontTactical` para feedback auditivo y háptico unificado en todo el storefront.
- **Robust Voice**: Refactor de `useVoiceSearch` para compatibilidad Apple/Safari y manejo granular de errores.
- **Inmersive UI**: Rediseño de `VoiceSearchOverlay` con animaciones concéntricas reactivas y aura dinámica.

### Wave 134: Admin Quality & Standard Compliance

- **Type Purity**: 100% de tipos `any` eliminados en hooks y servicios administrativos críticos.
- **Safe Error Handling**: Estandarización de bloques `catch` con `error: unknown` y recuperación segura de mensajes.
- **Barrel Only Enforcement**: Verificación y refactorización para asegurar que components/pages admin utilicen el barrel `@/services/admin`.

### Wave 135: Critical Functional Debugging

- **Checkout Recovery**: Resuelto error 22P02 en generación de números de orden y casting de UUID en `shipping_address_id`.
- **Image Intelligence**: Refactor de `optimizeImage` para soportar URLs de Supabase Storage sin romper buckets.
- **Microphone Trust**: Mejorada detección de `isSecureContext` y guías de permiso en `useVoiceSearch`.
- **Zero-Any Compliance**: Eliminación de tipos `any` residuales en hooks de orquestación (Checkout/Voice).

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
| Animation | Framer Motion | 12.0.0 | Transiciones, AnimatePresence (migración masiva en Wave 127) |
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
├── scripts/                         # 7 scripts de utilidad
│   ├── generate-sitemap.js          # Generador de sitemap (post-build)
│   ├── migrate-woocommerce.cjs      # WooCommerce CSV → SQL migration
│   ├── simulate_cesarin.ts          # [NEW Phase 3.4A] Simulator CLI for E2E validation
│   ├── fix_css_phase2.mjs           # CSS cleanup phase 2
│   ├── fix_css_phase3.mjs           # CSS cleanup phase 3
│   ├── fix_css_violations.mjs       # CSS violations fix
│   ├── fix_encoding.mjs             # Encoding fix script
│   └── admin/                       # [NEW] Phase 2 Cleanup Scripts
│       ├── tag-discovery.ts         # Automated tag classifier (Context-aware)
│       ├── tag-migration.ts         # SQL Migration bridge generator
│       └── verify-phase-2b.ts       # Migration integrity auditor
│
├── supabase/
│   ├── migrations/                  # 52 migraciones SQL (001 → 20260317_store_knowledge)
│   └── functions/                   # 14 Edge Functions (Specialized Gemini Stack: Flash 2.5/Pro/Lite)
│       ├── inventory-oracle/        # IA: Predicciones de stock (Gemini 2.5 Flash-Lite)
│       ├── dashboard-intelligence/  # IA: Insights de negocio para admin (Gemini 2.5 Flash-Lite)
│       ├── customer-intelligence/   # IA: Multi-acción NLP (Analyst: 2.5 Flash, Worker: 2.5 Flash-Lite)
│       ├── voice-intelligence/      # IA: NLP → queries de búsqueda (Gemini 2.5 Flash-Lite)
│       ├── product-intelligence/    # IA: Generación de copy/descriptions (Gemini 2.5 Flash-Lite)
│       ├── loyalty-intelligence/    # IA: Análisis de patrones de lealtad (Gemini 2.5 Flash-Lite)
│       ├── customer-narrative/      # IA: Narrativas contextuales de clientes (Gemini 2.5 Flash-Lite)
│       ├── bundle-intelligence/     # IA: Sugerencias de bundles (Gemini 2.5 Flash-Lite)
│       ├── cesarin-qa-judge/        # IA: Auditoría semántica de calidad (Gemini 2.5 Pro)
│       ├── embeddings-processor/    - `embeddings-processor`: specialized `gemini-embedding-001` (3072d) for multi-modal neural search.
│       ├── knowledge-ingestor/      # IA: RAG Ingestor (Document chunking & embedding)
│       ├── create-payment/          # MercadoPago preference
│       ├── mercadopago-webhook/     # Webhook de pago
│       └── track-shipment/          # DHL tracking
│
├── constants/
│   └── specs.constants.ts           # [NEW] Guided specs and normalization maps
│
├── src/
│   ├── main.tsx                     # Entrypoint: providers stack
│   ├── App.tsx                      # Router + layout switching
│   ├── index.css                    # Design system CSS (379 líneas)
│   ├── vite-env.d.ts                # Vite types
│   │
│   ├── types/                       # Tipos de dominio (10 archivos)
│   │   ├── product.ts               # Product, Section, ProductStatus
│   │   ├── category.ts              # Category, CategoryWithChildren
│   │   ├── cart.ts                   # CartItem (con variant_id/name), Order, CheckoutFormData
│   │   ├── order.ts                 # OrderItem (con variant_id/name), OrderRecord, CreateOrderData
│   │   ├── customer.ts              # CustomerProfile, CustomerTier, AccountStatus
│   │   ├── testimonial.ts           # Testimonial
│   │   ├── variant.ts               # ProductAttribute, AttributeValue, Produc   │
   ├── lib/                         # Utilidades puras (sin side effects de UI)
   │   ├── supabase.ts              # Cliente Supabase singleton
   │   ├── react-query.ts           # QueryClient + error handling global
   │   ├── utils.ts                 # cn(), formatPrice(), slugify(), optimizeImage()
   │   ├── analytics.ts             # GA4 (placeholder, no activo)
   │   ├── monitoring.ts            # Sentry init (lazy-loaded via dynamic import)
   │   ├── accessibility.ts         # A11y utilities
   │   ├── image-optimizer.ts       # Image optimization helpers
   │   ├── z-index.ts               # Z scale: CONTENT(30)→SKIP(110)
   │   ├── product-sorting.ts       # SortKey, SORT_OPTIONS, sortProducts (shared)
   │   └── domain/                  # Lógica de negocio pura (DEBE tener tests)
   │       ├── loyalty.ts           # Puntos, tiers, conversiones
   │       ├── orders.ts            # Estados, transiciones, canTransitionTo
   │       ├── pricing.ts           # calculateDiscount, calculateOrderTotal
   │       ├── wheel.ts           # selectPrizeByProbability, calculateTargetRotation, formatPrizeValue [Wave 26]
   │       ├── __tests__/           # 3 test files
   │       └── validations/         # Schemas Zod (DEBEN tener tests)
   │           ├── address.schema.ts
   │           ├── checkout.schema.ts
   │           ├── profile.schema.ts
   │           └── __tests__/       # 3 test files
   │
   ├── stores/                      # Zustand (client-state only) — 4 stores
   │   ├── cart.store.ts            # Carrito: add/remove/validate, localStorage + version migration
   │   ├── wishlist.store.ts        # Wishlist: localStorage + sync a customer_wishlists (DB)
   │   ├── notifications.store.ts   # Notificaciones in-app
   │   ├── search-overlay.store.ts  # MobileSearchOverlay visibility
   │   └── __tests__/              # 2 test files
   │
   ├── services/                    # Capa de datos (25 services storefront)
   │   ├── products.service.ts      # CRUD productos (lectura storefront). Incluye Smart Upselling.
   │   ├── categories.service.ts    # Categorías (lectura storefront)
   │   ├── orders.service.ts        # Crear pedido, obtener pedidos usuario
   │   ├── search.service.ts        # Búsqueda ILIKE con escape
   │   ├── concierge.service.ts     # AI Chat, Semantic Search & Customer IQ (Consolidado)
   │   ├── auth.service.ts          # Profile CRUD, resetPassword
   │   ├── flash-deals.service.ts   # Ofertas relámpago (lectura)
   │   ├── addresses.service.ts     # Direcciones usuario
   │   ├── coupons.service.ts       # Validar/aplicar cupón
   │   ├── loyalty.service.ts       # Puntos, tiers, ajustes
   │   ├── brands.service.ts        # Marcas públicas
   │   ├── testimonials.service.ts  # Testimonios públicos
   │   ├── wishlist.service.ts      # Favoritos del usuario (lectura/escritura DB)
   │   ├── tracking.service.ts      # DHL tracking
   │   ├── monitoring.service.ts    # Log errores + Presence channel
   │   ├── notifications.service.ts # Notificaciones usuario + Realtime
   │   ├── settings.service.ts      # Store settings + slider images
   │   ├── stats.service.ts         # Estadísticas usuario
   │   ├── storage.service.ts       # Upload/delete imágenes
   │   ├── payments/
   │   │   └── mercadopago.service.ts
   │   └── admin/                   # 16 archivos (15 services + barrel)
   │       ├── index.ts             # Barrel re-export
   │       ├── admin-auth.service.ts
   │       ├── admin-products.service.ts
   │       ├── admin-categories.service.ts
   │       ├── admin-orders.service.ts
   │       ├── admin-customers.service.ts
   │       ├── admin-coupons.service.ts
   │       ├── admin-brands.service.ts
   │       ├── admin-tags.service.ts
   │       ├── admin-flash-deals.service.ts
   │       ├── admin-testimonials.service.ts
   │       ├── admin-variants.service.ts
   │       ├── admin-dashboard.service.ts
   │       ├── admin-crm.service.ts     # CRM e inteligencia de clientes
   │       ├── admin-marketing.service.ts # Marketing Intelligence (System Suggestions) [Wave 193]
   │       └── admin-nlp.service.ts     # Parseo de intenciones con Gemini [Wave 60]
   │
   ├── hooks/                       # TanStack Query wrappers (44 hooks)
   │   ├── useProducts.ts           # useProducts, useFeaturedProducts, useProductBySlug
   │   ├── useCategories.ts         # useCategories, useCategoryBySlug
   │   ├── useOrders.ts             # useCustomerOrders, useOrder, useCreateOrder
   │   ├── useRealtimeOrders.ts     # Suscripción realtime a nuevos pedidos
   │   ├── useFlashDeals.ts         # useFlashDeals (active deals)
   │   ├── useProductVariations.ts  # Fetches variants for a product
   │   ├── useCheckout.ts           # Checkout orchestration logic
   │   ├── useSearch.ts             # useSearch (debounced)
   │   ├── useAIConcierge.ts        # Chat state & AI interactions
   │   ├── useAuth.ts               # useAuth (from context)
   │   ├── useAddresses.ts          # useAddresses
   │   ├── useBrands.ts             # useBrands
   │   ├── useCoupons.ts            # useCoupon validation
   │   ├── useLoyalty.ts            # useLoyalty + useLoyaltyIA (Consolidado) [Wave 90]
   │   ├── useCustomerIQ.ts         # Centralized Customer Intel [NEW]
   │   ├── useLoyaltyStats.ts       # Admin stats via loyalty.service
   │   ├── useStoreSettings.ts      # useStoreSettings
   │   ├── useStats.ts              # useStats
   │   ├── useTestimonials.ts       # useTestimonials
   │   ├── useUpdateProfile.ts      # auth update profile
   │   ├── useAppMonitoring.ts      # Presence
   │   ├── useCartValidator.ts      # Cart validation
   │   ├── useDebounce.ts           # Debounce
   │   ├── useHaptic.ts             # Haptics
   │   ├── useNotification.ts       # Transitions / Toasts
   │   ├── useScrolled.ts           # Scroll
   │   ├── useSectionFromPath.ts    # Section helper
   │   ├── useSwipe.ts              # Swipe
   │   ├── useWheelConfig.ts        # Reward wheel config
   │   ├── useWheelAudio.ts         # Reward wheel audio
   │   ├── admin/                   # 8 hooks administrativos modulares [Wave 128]
   │   │   ├── index.ts             # Barrel export
   │   │   ├── useAdminProducts.ts  # Logic for AdminProducts page
   │   │   ├── useAdminOrders.ts    # Logic for AdminOrders page
   │   │   ├── useAdminDashboard.ts # Metrics, AI Insights, Pulse
   │   │   ├── useAdminCustomers.ts # CRM & Proactive Intel
   │   │   ├── useAdminCatalog.ts   # Categories, Brands, Tags
   │   │   ├── useAdminMarketing.ts # Coupons, Flash Deals, Testimonials
   │   │   ├── useAdminWheel.ts     # Reward Wheel Management
   │   │   ├── useAdminTactical.ts  # Sensory Admin Feedback [NEW]
   │   │   └── useVoiceRecorder.ts  # Speech interaction
   │   ├── useNeuralHero.ts         # AI Hero Personalization [NEW]
   │   └── __tests__/               # 2 test files
   │
   ├── components/
   │   ├── ErrorBoundary.tsx        # Global error boundary
   │   ├── layout/                  # Storefront shell (4 + header/)
   │   │   ├── Layout.tsx           # Header + main + Footer + BottomNav
   │   │   ├── Header.tsx           # Top header
   │   │   ├── header/             # 10 sub-components
   │   │   ├── Footer.tsx           # Footer (React.memo)
   │   │   └── BottomNavigation.tsx # Mobile bottom bar (React.memo)
   │   │
   │   ├── ui/                      # 13 componentes base reutilizables
   │   │   ├── PremiumSkeleton.tsx  # [NEW] Liquid Shimmer Effect
   │   │   └── ai/
   │   │       ├── AIConcierge.tsx  # Floating Assistant (Quantum Glass) [Wave 70]
   │   │       └── VoiceSearchOverlay.tsx
   │   ├── home/                    # 8 secciones de Home (cada una independiente)
   │   │   ├── social/              # 7 componentes (refactorización R1)
   │   │   └── ...                  # Otras secciones (FlashDeals, MegaHero, etc.)
   │   ├── products/                # 15 componentes de producto
   │   ├── cart/                    # 3: CartButton, CartSidebar (with internal CartItem/CartUpsell), CheckoutForm
   │   ├── search/                  # 2: SearchBar (317 líneas), MobileSearchOverlay
   │   ├── auth/                    # 3: LoginForm, SignUpForm, ProtectedRoute
   │   ├── categories/              # 1: CategoryCard
   │   ├── addresses/               # 3: AddressCard, AddressForm, AddressList
   │   ├── profile/                 # 7 componentes
   │   ├── loyalty/                 # 6: PointsDisplay, ProgressBar, TierBadge, ReferralCard, ApplyReferralForm, SmartRewardToast
   │   ├── notifications/           # 4 componentes
   │   ├── social/                  # 1: SocialLinks
   │   ├── seo/                     # 4: SEO, ProductJsonLd, OrganizationJsonLd, BreadcrumbJsonLd
   │   └── admin/                   # 93 archivos (componentes + sub-carpetas)
   │       ├── layout/                  # Estructura admin
   │       │   ├── AdminLayout.tsx
   │       │   ├── AdminPulse.tsx       # Pulso de negocio en tiempo real
   │       │   ├── AnimatedAtmosphere.tsx # Ambient BI Glow [Wave 60]
   │       │   └── Sidebar.tsx
   │       ├── ui/                      # UI Admin Reutilizable
   │       │   ├── AdminCommandPalette.tsx # Command Palette (NLP & Voice) [Wave 60]
   │       │   ├── SupplierOrderModal.tsx # Reordenar con IA [Wave 60]
   │       │   └── AdminEmptyState.tsx
   │       ├── dashboard/
   │       │   ├── AIInsights.tsx       # Recomendaciones proactivas Gemini [NEW]
   │       │   └── AdminOracleDashboard.ts
   │       └── products/
   │           └── ProductVariantsEditor.tsx
   │
   └── pages/                       # Páginas (route endpoints)
       ├── (23 páginas storefront)
       ├── admin/                   # 17 páginas admin
       ├── auth/                    # Login, SignUp
       ├── legal/                   # Terms, Privacy
       └── user/                    # Notifications
heckoutForm
+   │   ├── search/                  # 2: SearchBar (317 líneas), MobileSearchOverlay
+   │   ├── auth/                    # 3: LoginForm, SignUpForm, ProtectedRoute
+   │   ├── categories/              # 1: CategoryCard
+   │   ├── addresses/               # 3: AddressCard, AddressForm, AddressList
+   │   ├── profile/                 # 7 componentes
+   │   ├── loyalty/                 # 6: PointsDisplay, ProgressBar, TierBadge, ReferralCard, ApplyReferralForm, SmartRewardToast
+   │   ├── notifications/           # 4 componentes
+   │   ├── social/                  # 1: SocialLinks
+   │   ├── seo/                     # 4: SEO, ProductJsonLd, OrganizationJsonLd, BreadcrumbJsonLd
+   │   └── admin/                   # 93 archivos (componentes + sub-carpetas)
+   │       ├── layout/                  # Estructura admin
+   │       │   ├── AdminLayout.tsx
+   │       │   ├── AdminPulse.tsx       # Pulso de negocio en tiempo real
+   │       │   ├── AnimatedAtmosphere.tsx # Ambient BI Glow [Wave 60]
+   │       │   └── Sidebar.tsx
+   │       ├── ui/                      # UI Admin Reutilizable
+   │       │   ├── AdminCommandPalette.tsx # Command Palette (NLP & Voice) [Wave 60]
+   │       │   ├── SupplierOrderModal.tsx # Reordenar con IA [Wave 60]
+   │       │   └── AdminEmptyState.tsx
+   │       ├── dashboard/
+   │       │   ├── AIInsights.tsx       # Recomendaciones proactivas Gemini [NEW]
+   │       │   └── AdminOracleDashboard.ts
+   │       └── products/
+   │           └── ProductVariantsEditor.tsx
+   │
+   └── pages/                       # Páginas (route endpoints)
+       ├── (23 páginas storefront)
+       ├── admin/                   # 17 páginas admin
+       ├── auth/                    # Login, SignUp
+       ├── legal/                   # Terms, Privacy
+       └── user/                    # Notifications

**Totales:** ~340 archivos TypeScript/TSX · 12 test files · 52 SQL migrations · 14 Edge Functions · 11 Canonical Docs · **Build: v113 (Tested 19-March-2026)**

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
| **Neural Identity** (Wave 120/130) | ✅ | AI Preferences, Cognitive Context, Propensity Scoring, Personalized Hero (useNeuralHero) |
| IA Insights (Fase A) | ✅ | Motor de recomendaciones proactivas basado en reglas (Sin API) |
| IA Insights (Fase B/Neural) | ✅ | Integración completa con Google Gemini para análisis narrativo y estratégico |
| **Global Attribute Intelligence**: Toggles de variabilidad y aplicabilidad por sección y categoría (Wave 164).
| **Fixed Specs Editor**: Edición controlada de JSON de especificaciones técnicas con sugerencias dinámicas.
| **Collections Manager**: Agrupaciones transversales de productos independientes de categorías.
| **AI Concierge (Wave 70/149)** | ✅ | Asistente de cristal de obsidiana con Gemini Chat. **Wave 149 Upgrade**: Voz femenina natural y productos visuales. |
| **Búsqueda Semántica (Wave 70)** | ✅ | Búsqueda por concepto e intención con IA Smart |
| **Tactical UI Global (Wave 70)** | ✅ | Audio procedural y háptica en todo el Storefront |
| Haptic Immersive Gallery | ✅ | ProductImages (Zoom + Haptics) (Wave 13) |
| Flash Deals Superpowers | ✅ | Suggest IA, Burning Bar, Local String Precision (Wave 17) |
| **Ruleta de Premios Ultra-Premium** | ✅ | `PrizeWheel.tsx`, `useWheelConfig`, `usePrizeWheel`, `lib/domain/wheel.ts`, `useWheelAudio` (Wave 35) |
| Header & Search Intelligence | ✅ | AI Hints, Spring Physics, Live Pulse (Wave 18) |
| **Storefront AI Pilot Readiness** | ✅ | Slices 1A-2D: Kill Switch, Session Gate, Runbook, Commercial Hardening, Degraded UX (Wave 184-186) |
| **Semantic Activation + Pilot Gate** | ✅ PASS | 100% embeddings (44 products / 23 knowledge chunks @ 3072d). Brain-first guardrail v106. 7/7 pilot queries PASS. Telemetry live in `ai_analytics`. Readiness gate: **PASS unrestricted**. |
| **Pilot Operations Intelligence** | ✅ | Wave 187: Operational telemetry cockpit in Piloto Operativo. 8 KPI cards, 7 bucket filters, capped query log (100 rows, 7d default). |
| **Knowledge Enrichment Loop** | ✅ | Wave 188: Telemetry-driven RAG enrichment. 5 high-value gaps closed. |
| **Analyst Refinement Loop** | ✅ | Wave 189: Improved abstract query interpretation and reduced guardrail rescue reliance via prompt refinement and API stabilization. |
| **Marketing AI Reality Repair** | ✅ | Wave 193: Removed missing backend dependencies. Implemented local heuristics for Coupon/Flash Deal suggestions. Rebranded "Magic" to "Sugerencia del Sistema" for honesty. |

---

## 10. DEFERRED ISSUES & KNOWN CONSTRAINTS

### 10.1 Known Typecheck Drift
Status: **RESOLVED** (Wave 189). 100% of orchestration and hook types are now synchronized with capsule contracts.

### 10.2 Database Cast Error (22P02)
Known legacy issue in `addresses.service.ts` where UUID vs Integer casting can trigger `22P02` if `shipping_address_id` is null. Guarded by local null-checks.

### 10.3 Analyst Guardrail Dependency
Status: **Baseline-reduced** (Wave 189). Abstract commercial queries now show significantly improved direct classification. Deterministic guardrail remains active as universal safety net.

## 11. CANONICAL INFRASTRUCTURE

### 11.1 SQL Migrations History
| Wave | Code | Description |
|:---|:---|:---|
| 1-180 | 001-20260315 | Baseline architecture and Cesarin OS infra. |
| 183 | 20260317_ad... | Admin Refactor Phase 1. |
| 186 | 20260317_st... | Store Knowledge RAG table and embeddings support. |
| 191 | 20260319_co... | Compatibility relations, product concepts, and concept aliases tables. |

---

## 17. CESARIN OS — SIMULATION & CONTRACT (Wave 180)

### 17.1 E2E Validation Protocol
Para garantizar la estabilidad del concierge, todas las actualizaciones de prompt o lógica en `customer-intelligence` DEBEN ser validadas con el simulador:

```bash
npm run simulate
```

### 17.2 Stabilized Debug Contract
El objeto `debug` retornado por la Edge Function DEBE contener:
- `detected_intent`: Un string canónico (ej. `POLICY_INQUIRY`).
- `tools_executed`: Array de strings con los nombres de las herramientas resueltas.
- `knowledge_chunks_count`: Entero indicando cuántos fragmentos RAG se usaron.
- `latency_ms`: Medición interna de la función.

### 17.3 2026 Quota Mitigation
El entorno actual (Marzo 2026) tiene límites estrictos de RPM en Free Tier.
- **Mitigación**: El simulador (`simulate_cesarin.ts`) incluye un retraso forzado de **15 segundos** entre escenarios para evitar el error **429 (Too Many Requests)**.

### 17.4 Hybrid Judge / Scoring Layer (Wave 181)

La Fase 3.4C queda formalmente cerrada y validada como parte del baseline operativo real del sistema.

#### Alcance validado
- **Scoring determinístico** implementado en el simulador con perfiles sensibles por tipo de escenario.
- **Persistencia de reportes** activa en la tabla `ai_simulation_reports`.
- **Interfaz Admin QA** integrada dentro de `Cesarin OS` mediante `TabQuality.tsx`.
- **Juez semántico independiente** implementado en la Edge Function `cesarin-qa-judge`, fuera de `customer-intelligence`.
- **Persistencia de veredictos del juez** formalizada dentro de `ai_simulation_reports.results` a nivel de escenario individual.

#### Reglas canónicas de la capa QA
- La evaluación **determinística** es la capa primaria.
- El **Judge LLM** es una capa secundaria, opcional y separada.

---

## 18. CESARÍN CAPABILITY CAPSULE PHILOSOPHY

To protect against monolithic sprawl, all Cesarín AI behaviors must follow the **Capability Capsule** architecture. 
A **Capability Capsule** is a bounded AI behavior unit with a single commercial/assistant responsibility, explicit signals, local degraded behavior, and a dedicated QA surface.

### Core Architecture Principles
1. **Bounded Responsibility:** A capability owns its specific slice of intelligence and logic.
2. **Failure Isolation:** Missing or failing capabilities must fail locally and gracefully. They must never collapse unrelated conversational flows.
3. **Explicit Signaling:** Capsules communicate via compact machine-readable signals (e.g., `[FEATURED_FALLBACK]`). Do not bloat global contexts.
4. **Targeted QA Surface:** Each capsule must have an identifiable test surface in the deterministic simulator.
5. **Incremental Adoption:** Do not execute giant rewrites. Adopt the capsule structure incrementally across the ecosystem.
6. **Brain-First Orchestration (v106 canon):** "Las capsules no deciden; las capsules ejecutan." The Analyst/Sommelier retains primary semantic authority. `UNKNOWN` is a last resort — any commercially-interpretable query MUST be rescued by the guardrail before returning `UNKNOWN`. Capsules receive the routed intent; they do not change it.

### Recommended First Capsule Pattern
**Product Search Integrity Capsule**
This is the designated foundational template for the new architecture due to:
- Highest storefront frequency
- Strongest commercial trust impact
- Low architecture disruption
- High reuse value

**Current Status (Canonization Handoff Completed - Wave 185):**
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized
- ✅ Runtime Execution Bridge / Orchestration
- ✅ AI/LLM Function Tool Routing
- ✅ E2E Validation & UI State Review

*Status: The Product Search Integrity Capsule is now fully operational and validated E2E. It stands as the official architectural blueprint and baseline pattern for all future Capability Capsules.*

### Second Capsule Pattern Materialized
**Knowledge & RAG Foundation Capsule**
This is the designated foundational template for knowledge retrieval, core FAQ resolution, and legal policy grounding.
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized (Threshold-based)
- ✅ Runtime Execution Bridge / Orchestration
- ✅ AI/LLM Function Tool Routing
- ✅ E2E Validation & UI State Review

*Status: The Knowledge & RAG Foundation Capsule is now fully operational and validated E2E. It stands as the second official architectural blueprint and baseline pattern for all future memory, policy, or structured RAG-based Capability Capsules.*

### Third Capsule Pattern Materialized
**Cart Operator Capsule (Safe Mutator Blueprint)**
This is the designated foundational template for any future assistant-driven mutation that executes side-effects on client or global state.
- ✅ Contract types & Validation schemas
- ✅ Pure Mapper Shell (Ambiguity and safety gating)
- ✅ Tool Schema & Function Calling Design
- ✅ Fallback Tree Materialized (Threshold-based)
- ✅ Runtime Execution Bridge / Orchestration
- ✅ Execution Middleware (Execution gated by real DB product lookup, no hallucinated prices/titles)
- ✅ E2E Validation & UI State Review (Executor stripped of narrative UI copy; UI acts purely as a Presenter)

---

*Generado: 3 de marzo de 2026. Reestructurado: 4 de marzo de 2026. Revisado: 19 de marzo de 2026 (Wave 193 — Marketing AI Reality Repair — v113).*

*Este documento refleja el estado REAL, no aspiracional. Léelo completo antes de tocar código.*
*Tras cualquier cambio al código, actualizar este documento (§1.10).*
*Historial de auditorías: ver `AUDIT_LOG.md`.*
