# VSM STORE — DOCUMENTO MAESTRO TÉCNICO

> Fuente de verdad absoluta. Foto técnica real del sistema al 3 de marzo de 2026.
> NO es un plan. Es lo que EXISTE. Leer antes de tocar cualquier archivo.

---

## 1. STACK EXACTO

| Capa | Tecnología | Versión | Rol |
|------|-----------|---------|-----|
| Runtime | React | 18.3.1 | SPA, JSX |
| Bundler | Vite | 6.0.5 | Dev server, build, HMR |
| Lenguaje | TypeScript | 5.6.2 | Strict mode + noUncheckedIndexedAccess |
| BaaS | Supabase | 2.39.0 | PostgreSQL, Auth, Storage, Realtime, Edge Functions, RLS |
| Server-state | TanStack Query | 5.17.0 | Cache, fetching, mutations, staleTime |
| Client-state | Zustand | 5.0.11 | Carrito (persiste localStorage), wishlist, notificaciones |
| Routing | React Router | 6.22.0 | SPA routing, lazy loading |
| Styling | Tailwind CSS | 3.4.17 | Utility-first + CSS Variables (dark-only) |
| Forms | React Hook Form + Zod 4 | 7.71.2 / 4.3.6 | Validación con schemas tipados |
| Animation | Framer Motion | 6.5.1 | Transiciones, AnimatePresence, layout animations |
| Icons | Lucide React | 0.574.0 | Iconografía SVG |
| SEO | react-helmet-async | 2.0.5 | Meta tags dinámicos |
| Toast | react-hot-toast | 2.4.1 | Notificaciones transitorias |
| DnD | @dnd-kit | core 6.3.1, sortable 10.0.0 | Reordenamiento admin (sliders, categorías) |
| Images | react-dropzone | 15.0.0 | Upload de imágenes admin |
| Payments | MercadoPago | Via Edge Function | `create-payment` + `mercadopago-webhook` |
| Monitoring | Sentry | 10.39.0 | Error tracking (inicializado en `lib/monitoring.ts`) |
| Analytics | Google Analytics 4 | gtag script | `lib/analytics.ts` (GA_MEASUREMENT_ID placeholder) |
| Confetti | canvas-confetti | 1.9.4 | Efecto visual en loyalty/pedidos |
| Testing | Vitest + Testing Library | 4.0.18 | Unit tests (cobertura parcial) |
| Linting | ESLint 9 + typescript-eslint | 9.15.0 | Config flat en `eslint.config.js` |
| PWA | Service Worker manual | `public/sw.js` | Offline fallback, caching |

### Dependencias NO incluidas (decisiones conscientes)
- No hay Redux, MobX ni Context para estado global (Zustand reemplaza).
- No hay CSS-in-JS (styled-components, emotion). Solo Tailwind + CSS Variables.
- No hay Next.js/Remix. Es SPA pura desplegada en Cloudflare Pages.
- No hay ORM cliente. Supabase client directo en services.

---

## 2. FILOSOFÍA Y PRINCIPIOS

### 2.1 Modularidad total
Cada feature es una unidad autocontenida. Borrar un módulo no debe romper otro. Las dependencias fluyen en una sola dirección:

```
Database (Supabase) → Services → Hooks → Components/Pages
```

**Nunca** al revés. Un componente no sabe que existe Supabase.

### 2.2 Separación Storefront / Admin
Son dos aplicaciones dentro del mismo bundle. Se distinguen por ruta (`/admin/*`). Comparten types y lib, pero NO comparten componentes visuales ni layouts.

| Aspecto | Storefront | Admin |
|---------|-----------|-------|
| Layout | `Layout.tsx` (Header + Footer + BottomNav) | `AdminLayout.tsx` (Sidebar + TopBar) |
| Guard | `ProtectedRoute` (requiere auth) | `AdminGuard` (requiere rol admin) |
| Services | `src/services/*.service.ts` | `src/services/admin/admin-*.service.ts` |
| No tiene | Sidebar, tablas de datos | Carrito, WhatsApp, SEO |

### 2.3 Reglas no negociables
1. **Sin `any`**. TypeScript strict mode activado.
2. **Sin imports circulares**. Flujo unidireccional.
3. **Sin lógica de negocio en componentes**. Cálculos van en `lib/domain/`.
4. **Sin Supabase fuera de services**. (Ver violaciones actuales en §9.)
5. **Sin `bg-white` duro**. Usar sistema temático (`bg-theme-*`, `glass-premium`).
6. **Build limpio** = 0 errores tsc + 0 errores ESLint. No se pushea con errores.

---

## 3. ESTRUCTURA DE CARPETAS (REAL)

```
vsm-store/
├── public/                          # Assets estáticos
│   ├── sw.js                        # Service Worker PWA
│   ├── manifest.json                # PWA manifest
│   ├── offline.html                 # Fallback offline
│   ├── robots.txt / sitemap.xml     # SEO
│   └── icons/                       # PWA icons
│
├── scripts/
│   ├── generate-sitemap.js          # Generador de sitemap (post-build)
│   ├── migrate-woocommerce.cjs      # WooCommerce CSV → SQL migration
│   ├── fix_css_phase2.mjs           # CSS cleanup phase 2
│   ├── fix_css_phase3.mjs           # CSS cleanup phase 3
│   ├── fix_css_violations.mjs       # CSS violations fix
│   └── fix_encoding.mjs             # Encoding fix script
│
├── supabase/
│   ├── migrations/                  # 24 migraciones SQL (001 → 20260302)
│   └── functions/                   # 3 Edge Functions
│       ├── create-payment/          # MercadoPago preference
│       ├── mercadopago-webhook/     # Webhook de pago
│       └── track-shipment/          # DHL tracking
│
├── src/
│   ├── main.tsx                     # Entrypoint: providers stack
│   ├── App.tsx                      # Router + layout switching
│   ├── index.css                    # Design system CSS (311 líneas)
│   ├── vite-env.d.ts                # Vite types
│   │
│   ├── types/                       # Tipos de dominio (6 archivos)
│   │   ├── product.ts               # Product, Section, ProductStatus
│   │   ├── category.ts              # Category, CategoryWithChildren
│   │   ├── cart.ts                   # CartItem, Order, CheckoutFormData
│   │   ├── order.ts                 # OrderRecord, OrderItem, CreateOrderData (fuente de verdad DB)
│   │   ├── testimonial.ts           # Testimonial
│   │   └── constants.ts             # Section, ProductStatus (re-exports)
│   │
│   ├── config/
│   │   └── site.ts                  # SITE_CONFIG: nombre, WhatsApp, redes, banco
│   │
│   ├── constants/
│   │   ├── app.ts                   # Magic strings: SECTIONS, ORDER_STATUS, USER_ROLES
│   │   ├── category-showcase.ts     # Configuración showcase de categorías
│   │   └── slider.ts                # Constantes del slider
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Auth state (Supabase auth listener)
│   │   └── ThemeContext.tsx          # Dark-only. Aplica <html class="dark">, sin toggle
│   │
│   ├── lib/                         # Utilidades puras (sin side effects de UI)
│   │   ├── supabase.ts              # Cliente Supabase singleton
│   │   ├── react-query.ts           # QueryClient + error handling global
│   │   ├── utils.ts                 # cn(), formatPrice(), slugify(), formatTimeAgo(), optimizeImage()
│   │   ├── analytics.ts             # GA4: pageView, trackEvent, trackAddToCart
│   │   ├── monitoring.ts            # Sentry init + logError
│   │   ├── accessibility.ts         # A11y utilities
│   │   ├── image-optimizer.ts       # Image optimization helpers
│   │   ├── z-index.ts               # Z scale: CONTENT(30), FLOAT(40), NAV(50), OVERLAY(100)
│   │   └── domain/                  # Lógica de negocio pura
│   │       ├── loyalty.ts           # Puntos, tiers, conversiones
│   │       ├── orders.ts            # Estados, transiciones, canTransitionTo, isTerminalStatus
│   │       ├── pricing.ts           # calculateDiscount, calculateOrderTotal, calculateSavingsPercentage
│   │       └── validations/         # Schemas Zod
│   │           ├── address.schema.ts
│   │           ├── checkout.schema.ts  # Usado por CheckoutForm (safeParse)
│   │           └── profile.schema.ts
│   │
│   ├── stores/                      # Zustand (client-state only)
│   │   ├── cart.store.ts            # Carrito: add/remove/validate, persiste en localStorage
│   │   ├── wishlist.store.ts        # Wishlist: persiste en localStorage
│   │   ├── notifications.store.ts   # Notificaciones in-app
│   │   └── search-overlay.store.ts  # MobileSearchOverlay visibility
│   │
│   ├── services/                    # Capa de datos (Supabase abstraction)
│   │   ├── products.service.ts      # CRUD productos (lectura storefront)
│   │   ├── categories.service.ts    # Categorías (lectura storefront)
│   │   ├── orders.service.ts        # Crear pedido, obtener pedidos usuario. Re-exports getPointsBalance de loyalty.service
│   │   ├── search.service.ts        # Búsqueda ILIKE con escape
│   │   ├── auth.service.ts          # Profile CRUD
│   │   ├── addresses.service.ts     # Direcciones usuario
│   │   ├── coupons.service.ts       # Validar/aplicar cupón
│   │   ├── loyalty.service.ts       # Puntos, tiers, ajustes, addLoyaltyPoints, getPointsBalance
│   │   ├── brands.service.ts        # Marcas públicas
│   │   ├── testimonials.service.ts  # Testimonios públicos
│   │   ├── tracking.service.ts      # DHL tracking
│   │   ├── monitoring.service.ts    # Log errores + Presence channel a Supabase
│   │   ├── notifications.service.ts # Notificaciones usuario + Realtime pedidos
│   │   ├── settings.service.ts      # Store settings + slider images
│   │   ├── stats.service.ts         # Estadísticas usuario
│   │   ├── storage.service.ts       # Upload/delete imágenes
│   │   └── payments/
│   │       └── mercadopago.service.ts # Edge Function call
│   │   └── admin/                   # Admin-only services
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
│   │       └── admin-dashboard.service.ts
│   │
│   ├── hooks/                       # TanStack Query wrappers
│   │   ├── useProducts.ts           # useProducts, useFeaturedProducts, useProductBySlug, etc.
│   │   ├── useCategories.ts         # useCategories, useCategoryBySlug
│   │   ├── useOrders.ts             # useCustomerOrders, useOrder, useCreateOrder, usePointsBalance
│   │   ├── useCheckout.ts           # useCheckout — orquesta submit, pago, cupón, WhatsApp, analytics
│   │   ├── useSearch.ts             # useSearch (debounced)
│   │   ├── useAuth.ts               # useAuth (from context)
│   │   ├── useAddresses.ts          # useAddresses, useCreateAddress, formatAddress re-export
│   │   ├── useBrands.ts             # useBrands (TanStack Query → brands.service)
│   │   ├── useCoupons.ts            # useCoupon validation
│   │   ├── useLoyalty.ts            # useLoyalty, useTierInfo
│   │   ├── useLoyaltyStats.ts       # Admin stats via loyalty.service (RPC)
│   │   ├── useStoreSettings.ts      # useStoreSettings
│   │   ├── useStats.ts              # useStats
│   │   ├── useTestimonials.ts       # useTestimonials, useTestimonialsStats
│   │   ├── useUpdateProfile.ts      # useMutation → auth.service.updateProfile
│   │   ├── useAppMonitoring.ts      # Presence via monitoring.service
│   │   ├── useCartValidator.ts      # Validates cart on load
│   │   ├── useDebounce.ts           # Generic debounce
│   │   ├── useHaptic.ts             # Vibration API
│   │   ├── useNotification.ts       # Toast wrapper
│   │   ├── useScrolled.ts           # Scroll position
│   │   ├── useSectionFromPath.ts    # Extract section from URL
│   │   └── useSwipe.ts              # Touch swipe detection
│   │
│   ├── components/
│   │   ├── ErrorBoundary.tsx        # Global error boundary
│   │   │
│   │   ├── layout/                  # Storefront shell
│   │   │   ├── Layout.tsx           # Header + main + Footer + BottomNav
│   │   │   ├── Header.tsx           # Top header
│   │   │   ├── header/              # Sub-components: Logo, Nav, Search, UserMenu, etc.
│   │   │   ├── Footer.tsx           # Footer
│   │   │   └── BottomNavigation.tsx  # Mobile bottom bar
│   │   │
│   │   ├── ui/                      # Componentes base reutilizables (11)
│   │   │   ├── Button.tsx, BottomSheet.tsx, SideDrawer.tsx
│   │   │   ├── OptimizedImage.tsx, DeferredSection.tsx
│   │   │   ├── ScrollToTop.tsx, WhatsAppFloat.tsx, InstallPrompt.tsx
│   │   │   ├── SocialProofToast.tsx  # ⚠ Fake mock data (violation)
│   │   │   ├── HelpTooltip.tsx, SectionErrorBoundary.tsx
│   │   │
│   │   ├── home/                    # Secciones de Home (8)
│   │   │   ├── MegaHero.tsx         # Hero slider
│   │   │   ├── CategoryShowcase.tsx  # Grid de categorías
│   │   │   ├── ProductRail.tsx      # Carrusel horizontal de productos
│   │   │   ├── FlashDeals.tsx       # Ofertas flash (⚠ no consume tabla real)
│   │   │   ├── BrandsCarousel.tsx   # Marcas (useBrands hook)
│   │   │   ├── PromoSection.tsx     # Banner promocional
│   │   │   ├── SocialProof.tsx      # Testimonios (585 líneas — god file)
│   │   │   └── TrustBadges.tsx      # Badges de confianza
│   │   │
│   │   ├── products/                # Componentes de producto (16)
│   │   │   ├── ProductCard.tsx, ProductGrid.tsx, ProductSkeleton.tsx
│   │   │   ├── ProductImages.tsx, ProductInfo.tsx, ProductActions.tsx
│   │   │   ├── ProductPriceSection.tsx, ProductBadgeGroup.tsx
│   │   │   ├── ProductBreadcrumbs.tsx, ShareButton.tsx
│   │   │   ├── StickyAddToCart.tsx, QuickViewModal.tsx
│   │   │   ├── RelatedProducts.tsx, FrequentlyBoughtTogether.tsx
│   │   │   ├── UrgencyIndicators.tsx, TrustBadges.tsx
│   │   │
│   │   ├── cart/                    # Carrito (3)
│   │   │   ├── CartButton.tsx, CartSidebar.tsx
│   │   │   └── CheckoutForm.tsx     # ⚠ 425 líneas — form UI (lógica en useCheckout hook)
│   │   │
│   │   ├── search/                  # Búsqueda (2)
│   │   │   ├── SearchBar.tsx        # Usa useSearch hook
│   │   │   └── MobileSearchOverlay.tsx  # Usa useSearch + store extraído
│   │   │
│   │   ├── auth/                    # Autenticación (3)
│   │   │   ├── LoginForm.tsx, SignUpForm.tsx, ProtectedRoute.tsx
│   │   │
│   │   ├── categories/              # Categorías storefront (1)
│   │   │   └── CategoryCard.tsx
│   │   │
│   │   ├── addresses/               # Direcciones (3)
│   │   │   ├── AddressCard.tsx, AddressForm.tsx, AddressList.tsx
│   │   │
│   │   ├── profile/                 # Perfil usuario (7)
│   │   │   ├── index.ts, ProfileHero.tsx, ProfileInfo.tsx
│   │   │   ├── ProfileForm.tsx, ProfileActions.tsx
│   │   │   ├── ProfileStats.tsx, ProfileQuickLinks.tsx
│   │   │
│   │   ├── loyalty/                 # Programa de lealtad (3)
│   │   │   ├── PointsDisplay.tsx, ProgressBar.tsx, TierBadge.tsx
│   │   │
│   │   ├── notifications/           # Notificaciones (4)
│   │   │   ├── NotificationCenter.tsx, OrderNotifications.tsx
│   │   │   ├── Toast.tsx, ToastContainer.tsx
│   │   │
│   │   ├── social/                  # Redes sociales (1)
│   │   │   └── SocialLinks.tsx
│   │   │
│   │   ├── seo/                     # SEO components (4)
│   │   │   ├── SEO.tsx, ProductJsonLd.tsx
│   │   │   ├── OrganizationJsonLd.tsx, BreadcrumbJsonLd.tsx
│   │   │
│   │   └── admin/                   # Admin panel components
│   │       ├── AdminLayout.tsx, AdminGuard.tsx, AdminErrorBoundary.tsx
│   │       ├── ImageUploader.tsx, CustomerSelect.tsx, Pagination.tsx
│   │       ├── brands/, categories/, coupons/, customers/
│   │       ├── dashboard/, flash-deals/, home-editor/
│   │       ├── loyalty/, monitoring/, orders/
│   │       ├── products/, settings/, sliders/
│   │       ├── tags/, testimonials/
│   │
│   └── pages/                       # Páginas (route endpoints)
│       ├── Home.tsx                 # Composición de secciones home
│       ├── SectionPage.tsx          # /vape, /420 — grid de categorías
│       ├── SectionSlugResolver.tsx  # /vape/:slug — resuelve categoría o producto
│       ├── CategoryPage.tsx         # Vista de categoría con productos
│       ├── ProductDetail.tsx        # Detalle de producto
│       ├── SearchResults.tsx        # Resultados de búsqueda
│       ├── Checkout.tsx             # Página de checkout
│       ├── Orders.tsx, OrderDetail.tsx  # Pedidos del usuario
│       ├── Profile.tsx, Addresses.tsx   # Perfil y direcciones
│       ├── Loyalty.tsx, Stats.tsx       # Lealtad y estadísticas
│       ├── Wishlist.tsx             # Lista de deseos
│       ├── Contact.tsx              # Contacto
│       ├── TrackOrder.tsx           # Rastreo DHL
│       ├── NotFound.tsx             # 404
│       ├── Payment{Success,Failure,Pending}.tsx  # Post-pago
│       ├── auth/Login.tsx, auth/SignUp.tsx
│       ├── legal/Terms.tsx, legal/Privacy.tsx
│       ├── user/Notifications.tsx   # Usa notifications.service
│       └── admin/                   # 17 páginas admin
│           ├── AdminDashboard.tsx, AdminProducts.tsx
│           ├── AdminProductForm.tsx, AdminOrders.tsx
│           ├── AdminCategories.tsx, AdminBrands.tsx
│           ├── AdminTags.tsx, AdminCustomers.tsx
│           ├── AdminCustomerDetails.tsx, AdminCoupons.tsx
│           ├── AdminSettings.tsx, AdminHomeSliders.tsx
│           ├── AdminMonitoring.tsx, AdminTestimonials.tsx
│           ├── AdminHomeEditor.tsx, AdminLoyalty.tsx
│           └── AdminFlashDeals.tsx
```

---

## 4. FEATURES IMPLEMENTADAS

### 4.1 Storefront (cliente)
| Feature | Estado | Archivos clave |
|---------|--------|----------------|
| Catálogo por sección (vape/420) | ✅ | SectionPage, CategoryPage, SectionSlugResolver |
| Detalle de producto completo | ✅ | ProductDetail, ProductImages, ProductInfo, ProductActions |
| Carrito persistente | ✅ | cart.store.ts, CartSidebar, CartButton |
| Checkout WhatsApp + MercadoPago | ✅ | CheckoutForm, mercadopago.service.ts |
| Autenticación Supabase | ✅ | AuthContext, LoginForm, SignUpForm, ProtectedRoute |
| Búsqueda con debounce | ✅ | SearchBar, MobileSearchOverlay, search.service |
| Perfil usuario | ✅ | Profile, ProfileForm, ProfileHero, ProfileInfo |
| Direcciones múltiples | ✅ | Addresses, AddressForm, AddressList |
| Historial de pedidos | ✅ | Orders, OrderDetail (con reorder) |
| Programa de lealtad | ✅ | Loyalty, PointsDisplay, ProgressBar, TierBadge |
| Wishlist | ✅ | Wishlist, wishlist.store.ts |
| Notificaciones realtime | ✅ | OrderNotifications (Supabase Realtime) |
| SEO dinámico | ✅ | SEO, ProductJsonLd, OrganizationJsonLd, BreadcrumbJsonLd |
| PWA offline | ✅ | sw.js, manifest.json, InstallPrompt |
| Dark-only theme | ✅ | ThemeProvider ensures <html class="dark"> |
| Rastreo DHL | ✅ | TrackOrder, track-shipment Edge Function |
| Social proof / testimonios | ✅ | SocialProof (dinámico desde DB), SocialProofToast (⚠ mock) |
| WhatsApp flotante | ✅ | WhatsAppFloat |
| Hero slider dinámico | ✅ | MegaHero (desde DB settings) |
| Flash deals (storefront) | ⚠ Parcial | FlashDeals.tsx — hardcodea descuentos fake, no consume tabla flash_deals |
| Analytics GA4 | ⚠ Placeholder | lib/analytics.ts — GA_MEASUREMENT_ID es 'G-XXXXXXXXXX' |

### 4.2 Admin Panel
| Feature | Estado | Archivos clave |
|---------|--------|----------------|
| Dashboard con métricas | ✅ | AdminDashboard |
| CRUD Productos | ✅ | AdminProducts, AdminProductForm, ProductEditorDrawer |
| CRUD Categorías (con drag) | ✅ | AdminCategories (hard delete + orphan trigger) |
| CRUD Pedidos + tracking | ✅ | AdminOrders |
| CRUD Clientes (God Mode) | ✅ | AdminCustomers, AdminCustomerDetails |
| CRUD Cupones | ✅ | AdminCoupons |
| CRUD Marcas | ✅ | AdminBrands |
| CRUD Tags | ✅ | AdminTags |
| CRUD Testimonios | ✅ | AdminTestimonials |
| Flash Deals admin | ✅ | AdminFlashDeals |
| Home Editor (slots) | ✅ | AdminHomeEditor |
| Sliders Hero | ✅ | AdminHomeSliders |
| Loyalty config | ✅ | AdminLoyalty |
| Settings tienda | ✅ | AdminSettings |
| Monitoring / Realtime | ✅ | AdminMonitoring |
| Upload imágenes | ✅ | ImageUploader (react-dropzone + Supabase Storage) |

---

## 5. PROVIDER STACK (orden exacto en main.tsx)

```
StrictMode
  └─ ErrorBoundary
       └─ BrowserRouter
            └─ ThemeProvider
                 └─ Toaster (react-hot-toast)
                 └─ AuthProvider
                      └─ QueryClientProvider
                           └─ HelmetProvider
                                └─ App
```

Después del render, se registra el Service Worker para PWA.

---

## 6. SISTEMA DE DISEÑO

### 6.1 Tema semántico (CSS Variables en index.css)
Modo único: `:root` (dark). No existe light mode.

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `9 9 11` | Body, fondos principales |
| `--bg-secondary` | `24 24 27` | Tarjetas, superficies |
| `--bg-tertiary` | `39 39 42` | Inputs, elementos inset |
| `--text-primary` | `252 252 252` | Texto principal |
| `--text-secondary` | `161 161 170` | Texto secundario |
| `--accent-primary` | `59 130 246` (blue) | CTAs, links activos |

### 6.2 Clases clave
| Clase | Propósito |
|-------|-----------|
| `.glass-premium` | Glassmorphism: blur + border sutil + shadow |
| `.glow-vape` | Box-shadow azul suave para sección vape |
| `.glow-herbal` | Box-shadow verde suave para sección 420 |
| `.container-vsm` | max-w-7xl + padding responsive |
| `.vsm-surface` | rounded-2xl + padding + border |
| `.vsm-pill` | Tag redondeado (badge) |
| `.vsm-btn` | Base de botón (rounded-xl, uppercase, tracking) |
| `.spotlight-container` | Efecto hover de línea luminosa superior |
| `.bg-noise` | Textura de ruido SVG de fondo |
| `.skeleton-shimmer` | Loading skeleton animado |

### 6.3 Colores de sección
| Sección | Color | Tailwind prefix |
|---------|-------|----------------|
| Vape | Azul (#3b82f6) | `vape-*` |
| 420 / Herbal | Verde (#10b981) | `herbal-*` |

### 6.4 Border Radius Scale (tailwind.config.js)
| Token | px | Uso |
|-------|-----|-----|
| `rounded-sm` | 4px | Pills, inline |
| `rounded` | 6px | Default |
| `rounded-md` | 8px | Tags, small cards |
| `rounded-lg` | 10px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, modals |
| `rounded-2xl` | 14px | Large cards |
| `rounded-3xl` | 16px | Hero sections |

### 6.5 Z-Index Scale (lib/z-index.ts)
| Layer | z-index | Uso |
|-------|---------|-----|
| CONTENT | 30 | Sticky headers |
| FLOAT | 40 | WhatsApp FAB, CartSidebar overlay, StickyAddToCart |
| NAV | 50 | BottomNav, SideDrawer, Dropdowns |
| OVERLAY | 100 | BottomSheet backdrop, SearchBar |
| SHEET | 101 | BottomSheet body |
| SKIP | 110 | Accessibility skip link |

---

## 7. ROUTING

### 7.1 Storefront routes
| Ruta | Page | Auth |
|------|------|------|
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
| `/privacy` | Privacy | No (alias de /legal/privacy) |
| `*` | NotFound | No |

### 7.2 Admin routes (todas bajo `/admin`)
| Ruta | Page |
|------|------|
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
| `/admin/*` | NotFound (catch-all) |

### 7.3 SectionSlugResolver (lógica dual)
`/vape/:slug` y `/420/:slug` pasan por `SectionSlugResolver.tsx`:
1. Intenta cargar el slug como **Categoría** (`useCategoryBySlug`).
2. Si existe → renderiza `CategoryPage`.
3. Si no existe → asume **Producto** → renderiza `ProductDetail`.

---

## 8. DATABASE (Supabase)

### 8.1 Migrations (24 archivos, cronológicas)
| # | Archivo | Qué hace |
|---|---------|----------|
| 001 | initial_schema | Products, categories, orders, order_items, coupons |
| 002 | users_system | Profiles, addresses |
| 003 | admin_users | Admin role system |
| ... | (14 incrementales) | Payment fields, store settings, customer notes, bank info, badges, monitoring, payment methods, sliders, loyalty, tracking, categories enhanced, constraints, flash deals end, product tags |
| 20260224 | testimonials | Tabla testimonials |
| 20260301 | brands, loyalty_statistics, slider_images, featured_categories | Marcas, stats, sliders, categorías destacadas |
| 20260302 | flash_deals | Tabla flash_deals real |
| 20260302 | orphan_categories | Categorías fallback "Sin Categoría" + trigger BEFORE DELETE |

### 8.2 Edge Functions (3)
| Función | Propósito |
|---------|-----------|
| `create-payment` | Crea preferencia MercadoPago desde order_id |
| `mercadopago-webhook` | Recibe webhook de pago, actualiza order |
| `track-shipment` | Consulta tracking DHL |

### 8.3 Orphan Categories System
Al eliminar una categoría:
- Trigger `trg_category_delete_protect` (BEFORE DELETE)
- Reasigna productos huérfanos a "Sin Categoría" (vape o 420)
- Re-padrea hijos al abuelo (o null si era raíz)
- Las categorías fallback (`is_active = false`, `order_index = 9999`) NO se pueden eliminar

---

## 9. VIOLACIONES DETECTADAS (Foto real)

### 9.1 CRÍTICAS — Componentes/páginas que importan services directamente

El principio dice: `Services → Hooks → Components`. Estas rutas lo rompen:

| Archivo | Importa | Estado |
|---------|---------|--------|
| ~~`CheckoutForm.tsx`~~ | ~~`orders.service`, `coupons.service`, `mercadopago.service`, `addresses.service`~~ | **RESUELTO** — Usa `useCheckout` hook + Zod `checkoutSchema.safeParse`. Zero service imports |
| ~~`SearchBar.tsx`~~ | ~~`search.service`~~ | **RESUELTO** — Usa `useSearch` hook |
| ~~`MobileSearchOverlay.tsx`~~ | ~~`products.service`~~ | **RESUELTO** — Usa `useSearch` hook + store extraído |
| ~~`BrandsCarousel.tsx`~~ | ~~`brands.service`~~ | **RESUELTO** — Usa `useBrands` hook. Type `PublicBrand` re-exportado desde hook |
| ~~`ProfileForm.tsx`~~ | ~~`auth.service`~~ | **RESUELTO** — Usa `useUpdateProfile` mutation hook |
| **Todas las admin pages** | `admin/*.service` | **EXCEPCIÓN ACEPTADA** — Ver §9.9 |

### 9.2 CRÍTICAS — Supabase directo fuera de services

| Archivo | Uso | Estado |
|---------|-----|--------|
| ~~`pages/user/Notifications.tsx`~~ | ~~`supabase.from()` directo~~ | **RESUELTO** — Usa `notifications.service` |
| ~~`components/notifications/OrderNotifications.tsx`~~ | ~~`supabase.channel()` + `supabase.removeChannel()` directo~~ | **RESUELTO** — Usa `subscribeToOrderUpdates()` + `channel.unsubscribe()`. Zero supabase imports |
| `pages/admin/AdminMonitoring.tsx` | `supabase` queries + Realtime | **EXCEPCIÓN ACEPTADA** — Admin (ver §9.9) |
| ~~`hooks/useLoyaltyStats.ts`~~ | ~~`supabase.rpc()` directo~~ | **RESUELTO** — Usa `getAdminLoyaltyStats()` de loyalty.service |
| ~~`hooks/useAppMonitoring.ts`~~ | ~~`supabase.channel()` directo~~ | **RESUELTO** — Usa `createPresenceChannel()` de monitoring.service |

### 9.3 ALTAS — God Files (>500 líneas)

| Archivo | Líneas | Problema |
|---------|--------|----------|
| `SocialProof.tsx` | 585 | ~100 líneas de fallback data + carousel + stats + todo en uno |
| `CheckoutForm.tsx` | 461 | Form UI (datos, dirección, pago, cupón). Validación con Zod schema. Lógica extraída a useCheckout (220 líneas) |

### 9.4 ALTAS — Datos mock/fake en producción

| Archivo | Qué |
|---------|-----|
| `SocialProofToast.tsx` | `MOCK_PURCHASES` — 3 compras inventadas (nombres reales, productos) que se muestran al usuario como si fueran reales |
| `SocialProof.tsx` | `FALLBACK_TESTIMONIALS` — 5 testimonios falsos con personas inventadas (se usa solo si DB está vacía, pero es engañoso) |
| `FlashDeals.tsx` | Usa array hardcodeado `[30, 40, 50, 35, 45, 40]` de descuentos indexado por posición (determinístico, no random). NO consume la tabla `flash_deals` que el admin gestiona |

### 9.5 MEDIAS — localStorage directo en componentes

| Archivo | Uso |
|---------|-----|
| `InstallPrompt.tsx` | PWA dismiss state |
| `SearchBar.tsx` | Historial de búsquedas recientes |
| `FlashDeals.tsx` | Expiración de countdown timer |
| `DeliveryLocation.tsx` | Código postal guardado |

### 9.6 MEDIAS — Zustand store en archivo de componente

~~`MobileSearchOverlay.tsx` define `useSearchOverlay` store inline.~~ **RESUELTO** — Store extraído a `src/stores/search-overlay.store.ts`.

### 9.7 MEDIAS — Types en componentes en vez de `src/types/`

| Archivo | Type |
|---------|------|
| `LiveUsersPanel.tsx` | `ActiveUser` (tipo de dominio exportado) |
| `SystemLogsPanel.tsx` | `AppLogEntry` (tipo de dominio exportado) |
| `SocialProofToast.tsx` | `Purchase` interface |

### 9.8 BAJAS — Lógica de negocio inline

| Archivo | Lógica |
|---------|--------|
| `CheckoutForm.tsx` | ~~Cálculo de descuento, validación de form, creación de orden, generación de mensaje WhatsApp~~ **RESUELTO** — Validación usa Zod, lógica en useCheckout, pricing usa calculateOrderTotal |
| `FrequentlyBoughtTogether.tsx` | Cálculo de precio del bundle |

### 9.9 INFORMATIVA — Admin sin capa de hooks

Todas las 17 páginas admin importan services directamente. No existe un `hooks/admin/` equivalente. Esto es consistente internamente (el admin NO usa hooks), pero viola el principio arquitectónico declarado. **Decisión: Excepción aceptada.** El panel admin es un área interna con desarrollador único; imponer hooks añadiría complejidad sin beneficio. `AdminMonitoring.tsx` también usa Supabase directo bajo esta misma excepción.

---

## 10. DECISIONES HISTÓRICAS

| Decisión | Razón | Fecha |
|----------|-------|-------|
| SPA pura (no SSR) | Deploy en Cloudflare Pages. SEO cubierto con react-helmet-async + JSON-LD + sitemap estático | Inicio |
| Supabase como BaaS | Evita backend custom. Auth + DB + Storage + Realtime + Edge Functions en uno | Inicio |
| Zustand sobre Context | Context causa re-renders. Zustand es selectivo y persiste en localStorage | Inicio |
| TanStack Query sobre fetch manual | Cache automático, deduplicación, retry, staleTime, invalidación | Inicio |
| Tailwind + CSS Variables | Variables para tema dark-only. Tailwind para utility classes. Sin CSS-in-JS | Inicio |
| Secciones vape/420 como concepto dual | El negocio vende en dos verticales. Cada sección tiene color propio | Inicio |
| Hard delete categorías + trigger | Soft delete complicaba queries. Trigger maneja huérfanos automáticamente | 02-Mar-2026 |
| WooCommerce migration script (CJS) | package.json tiene `"type": "module"`. Node script require() necesita .cjs | 02-Mar-2026 |
| Cart store version migration | localStorage puede tener schema viejo. Version 2 limpia automáticamente | 03-Mar-2026 |
| Admin sin hooks layer | Decisión implícita. Las pages importan services directamente. Funciona pero viola el principio declarado | Histórica |
| `noUncheckedIndexedAccess: true` | Seguridad extra en arrays — obliga a verificar undefined en accesos por índice | Inicio |
| framer-motion v6 (no v11) | Pinned. No se ha migrado a la API de v11 (motion component, etc.) | Histórica |

---

## 11. DEPENDENCIAS CRÍTICAS (las que NO se pueden cambiar sin efecto cascada)

| Dependencia | Razón de criticidad |
|-------------|-------------------|
| `@supabase/supabase-js` | Todo el backend depende de esto. Cambiar = reescribir services |
| `@tanstack/react-query` | Toda la capa de hooks está construida sobre esto. Cambiar = reescribir todos los hooks |
| `zustand` | Carrito, wishlist, notificaciones. La persistencia en localStorage depende del middleware de Zustand |
| `react-router-dom` | Toda la navegación. 50+ lazy imports que dependen de esta API |
| `tailwindcss` | Todo el CSS. 1000+ archivos usan clases de Tailwind |
| `framer-motion` | Animaciones en ~30 componentes. AnimatePresence, layout, motion.div por todas partes |
| `react-hook-form` + `zod` | Todos los forms: checkout (safeParse), profile, address, admin forms |

---

## 12. CONFIGURACIÓN CENTRAL

### 12.1 SITE_CONFIG (`src/config/site.ts`)
Contiene: nombre tienda, WhatsApp number, email, dirección física, datos bancarios, redes sociales, locale (es-MX/MXN), template de mensaje WhatsApp para pedidos.

### 12.2 Constantes (`src/constants/app.ts`)
Magic strings centralizadas: `SECTIONS`, `PRODUCT_FLAGS`, `ORDER_STATUS`, `STORE_SETTINGS_ID`, `USER_ROLES`.

### 12.3 Environment Variables
```
VITE_SUPABASE_URL        # URL del proyecto Supabase
VITE_SUPABASE_ANON_KEY   # Anon key (usada en cliente)
```

No hay más env vars. GA4 y Sentry están hardcodeados (placeholders).

---

## 13. CONVENCIONES DE CÓDIGO

| Aspecto | Convención |
|---------|-----------|
| Naming archivos | kebab-case. Componentes: PascalCase.tsx. Services: kebab.service.ts |
| Exports | Named exports (no default). Lazy imports usan `.then(m => ({ default: m.X }))` |
| Imports | Path alias `@/` mapea a `src/`. No relative imports fuera de la carpeta actual |
| Hooks | `use*.ts`. Retornan resultado de `useQuery` o `useMutation` |
| Services | `*.service.ts`. Funciones async puras. Reciben params, retornan data o throw |
| Types | `*.ts` en `src/types/`. Export interface X + type XInsert + type XUpdate |
| Tests | `__tests__/` con `.test.ts(x)`. Vitest + Testing Library |
| Styles | Tailwind classes en JSX. Custom CSS en `index.css` layers. No archivos .css por componente |

---

*Generado el 3 de marzo de 2026. Este documento refleja el estado REAL del código, incluyendo sus imperfecciones.*
