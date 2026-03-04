# VSM STORE — DOCUMENTO MAESTRO TÉCNICO

> Fuente de verdad absoluta. Foto técnica real del sistema al 4 de marzo de 2026.
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
│   ├── types/                       # Tipos de dominio (7 archivos)
│   │   ├── product.ts               # Product, Section, ProductStatus
│   │   ├── category.ts              # Category, CategoryWithChildren
│   │   ├── cart.ts                   # CartItem, Order, CheckoutFormData
│   │   ├── order.ts                 # OrderRecord, OrderItem, CreateOrderData (fuente de verdad DB)
│   │   ├── customer.ts              # CustomerProfile, CustomerTier, AccountStatus
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
│   │   ├── product-sorting.ts       # SortKey, SORT_OPTIONS, sortProducts (shared)
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
│   │   │   ├── SocialProof.tsx      # Testimonios (634 líneas — god file)
│   │   │   └── TrustBadges.tsx      # Badges de confianza
│   │   │
│   │   ├── products/                # Componentes de producto (15)
│   │   │   ├── ProductCard.tsx, ProductGrid.tsx, ProductSkeleton.tsx
│   │   │   ├── ProductImages.tsx, ProductInfo.tsx, ProductActions.tsx
│   │   │   ├── ProductPriceSection.tsx, ProductBadgeGroup.tsx
│   │   │   ├── ProductBreadcrumbs.tsx, ShareButton.tsx
│   │   │   ├── StickyAddToCart.tsx, QuickViewModal.tsx
│   │   │   ├── RelatedProducts.tsx, FrequentlyBoughtTogether.tsx
│   │   │   └── UrgencyIndicators.tsx
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
| `SocialProof.tsx` | 634 | ~100 líneas de fallback data + carousel + stats + todo en uno |
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

### 9.10 AUDITORÍA MÓDULO PEDIDOS/ORDERS (37 issues → 37 resueltos)

Primera auditoría del proyecto. Refactor masivo del módulo de pedidos (storefront + admin). Commit `9c934ab`.

**Scope:** 56 archivos modificados (+2235/−946 líneas). Includes: pages (UserOrders, OrderDetail, admin orders), hooks (useOrders), services (orders.service, admin-orders.service), types (order.ts), checkout flow.

**Highlights:**
- Migración completa de validación a Zod schemas (`checkoutSchema.safeParse`)
- Extracción de lógica de checkout a `useCheckout` hook (220 líneas)
- Centralización de pricing en `calculateOrderTotal()` (eliminó cálculos duplicados)
- Integración loyalty points en checkout flow
- Fix OrderDetail component lifecycle y estado loading
- Admin orders: optimistic updates, DnD kanban, status transitions

**Archivos modificados:** 56

### 9.11 AUDITORÍA MÓDULO CLIENTES (22 issues → 22 resueltos)

Auditoría completa del módulo de clientes (perfil público + admin CRM). 4 HIGH, 9 MED, 9 LOW.

**Acciones ejecutadas:**

| Issue | Severidad | Archivo | Fix |
|-------|-----------|---------|-----|
| Tipos `CustomerProfile`, `CustomerTier`, `AccountStatus` dispersos | HIGH | `AuthContext.tsx` | Extraídos a `src/types/customer.ts`. AuthContext importa y re-exporta |
| `formatCurrency` duplicado (función local) | HIGH | `CustomerStats.tsx`, `CustomerTimeline.tsx` | Reemplazado por `formatPrice` de `@/lib/utils` |
| `(customer as any).loyalty_points` | HIGH | `CustomerMarketing.tsx` | Reemplazado por `useQuery` + `getPointsBalance()` de loyalty.service |
| Fake coupon stub con toast falso | HIGH | `CustomerMarketing.tsx` | Botón muestra `notify.warning('Próximamente')`. Sin setTimeout falso |
| Deep import `admin-customers.service` | MED | `CustomerList.tsx`, `CustomerDirectoryStats.tsx` | Cambiado a barrel `@/services/admin` |
| `react-hot-toast` en vez de `useNotification` | MED | `ProfileForm.tsx` | Migrado a `useNotification` hook |
| `orders.map((order: any)` | MED | `CustomerTimeline.tsx` | Tipado con `CustomerOrder` interface local + `useQuery<CustomerOrder[]>` |
| `useEffect` deps incompletas (auto-save) | MED | `CustomerNotes.tsx` | `eslint-disable-next-line` con comentario explicando intención (trigger solo en debounce) |
| Icono `Mail` para WhatsApp | LOW | `CustomerList.tsx` | Cambiado a `MessageCircle` de lucide-react |

**Archivos creados:** `src/types/customer.ts`
**Archivos modificados:** 8 (AuthContext.tsx, CustomerStats.tsx, CustomerTimeline.tsx, CustomerMarketing.tsx, CustomerNotes.tsx, CustomerList.tsx, CustomerDirectoryStats.tsx, ProfileForm.tsx)

### 9.12 AUDITORÍA MÓDULO PRODUCTOS (34 issues → 20 resueltos, 14 aceptados/diferidos)

Auditoría completa del módulo de productos (storefront + admin). 9 HIGH, 15 MED, 10 LOW.

**Acciones ejecutadas:**

| Issue | Sev. | Archivo(s) | Fix |
|-------|------|-----------|-----|
| `react-hot-toast` en vez de `useNotification` | HIGH | `ProductCard.tsx`, `QuickViewModal.tsx` | Migrado a `useNotification` hook |
| `SortKey`/`SORT_OPTIONS`/`sortProducts` duplicados | HIGH | `SectionPage.tsx`, `CategoryPage.tsx` | Extraído a `src/lib/product-sorting.ts` (shared) |
| `StickyAddToCart` loop `addItem` N veces | HIGH | `StickyAddToCart.tsx` | `addItem(product, quantity)` — una sola llamada |
| QuickView badges ignoran `_until` expiry | HIGH | `QuickViewModal.tsx` | Añadida validación de fecha (`is_new_until`, etc.) |
| JSDoc mismatch en `getProductsByIds` | MED | `products.service.ts` | JSDoc corregido (llamador filtra active/stock) |
| `RelatedProducts` nested `<Link>` → HTML inválido | MED | `RelatedProducts.tsx` | `<Link>` externo eliminado (ProductCard ya enlaza) |
| `CategoryPage` click-outside siempre registrado | MED | `CategoryPage.tsx` | Guard `if (!sortOpen) return` + dep array `[sortOpen]` |
| `CategoryPage` sort hardcodeado a vape colors | MED | `CategoryPage.tsx` | Section-aware `isVape ? 'vape-*' : 'herbal-*'` |
| `CategoryPage` `__skip__` hack | MED | `CategoryPage.tsx` | Reemplazado con `categoryId: undefined` |
| `ProductDetail` useEffect dep `[product]` → `[product?.id]` | MED | `ProductDetail.tsx` | Dep array usa `product?.id` (estable) |
| `ProductImages` thumbnail key usa index | MED | `ProductImages.tsx` | `key={image}` (URL única) |
| QuickView wishlist button sin funcionalidad | MED | `QuickViewModal.tsx` | Wired `useWishlistStore` + `toggleItem` + estado visual |
| `ProductCard` prop `index` no usada | LOW | `ProductCard.tsx`, `ProductGrid.tsx`, `ProductRail.tsx` | Prop eliminada de toda la cadena |
| `ProductBreadcrumbs` usa `window.location.pathname` | LOW | `ProductBreadcrumbs.tsx` | Migrado a `useLocation()` de react-router |
| TrustBadges re-export fantasma (no importado) | LOW | `products/TrustBadges.tsx` | Archivo eliminado |
| `section as 'vape' \| '420'` redundante | LOW | `ProductDetail.tsx` | Cast eliminado (ya es tipo `Section`) |

**No resueltos (aceptados o diferidos):**

| Issue | Sev. | Razón |
|-------|------|-------|
| `Record<string, any>` en `cart.ts` (mp_payment_data) | HIGH | Se necesita schema de MercadoPago; diferido |
| `ProductFormData.status: string` (no `ProductStatus`) | HIGH | Requiere refactor admin form; diferido |
| No Zod en `ProductEditorDrawer` | HIGH | Requiere schema completo de producto; diferido |
| `exitBeforeEnter` deprecated (framer-motion v6) | MED | Pinned a v6 que no tiene `mode="wait"`. Funciona. **Aceptado** |
| `as Product[]` casts en services | MED | Requiere Supabase generated types; diferido |
| `searchProducts` sin escape PostgREST | MED | Bajo riesgo (admin input), diferido |
| `useProducts` no pasa offset/filter | MED | No hay feature de paginación activa; diferido |
| `alert()` en ImageUploader / ProductEditorDrawer | MED/LOW | Admin-only; diferido a admin audit |
| Export arrow vs function consistency | LOW | Cosmético, no afecta funcionamiento |
| `FrequentlyBoughtTogether` shuffle no determinístico | LOW | Cosméticos; diferido |
| `ProductCard` export style inconsistente | LOW | Cosmético |

**Archivos creados:** `src/lib/product-sorting.ts`
**Archivos modificados:** 14 (ProductCard, QuickViewModal, StickyAddToCart, SectionPage, CategoryPage, ProductDetail, RelatedProducts, ProductImages, ProductBreadcrumbs, ProductGrid, ProductRail, ProductActions, UrgencyIndicators, products.service)
**Archivos eliminados:** 1 (`products/TrustBadges.tsx`)

### 9.13 AUDITORÍA MÓDULO CATEGORÍAS (9 issues → 4 resueltos, 5 aceptados/diferidos)

Auditoría completa del módulo de categorías (storefront + admin). 2 HIGH, 4 MED, 3 LOW.

**Archivos auditados (12):** `types/category.ts`, `categories.service.ts`, `admin-categories.service.ts`, `useCategories.ts`, `category-showcase.ts`, `CategoryCard.tsx`, `CategoryShowcase.tsx`, `CategoryPage.tsx`, `SectionPage.tsx`, `AdminCategories.tsx`, `CategoryForm.tsx`, `CategoryTreeNode.tsx`, `CategoryTreeContainer.tsx`, `CategoriesHeader.tsx`

**Acciones ejecutadas:**

| Issue | Sev. | Archivo(s) | Fix |
|-------|------|-----------|-----|
| `VAPE_CATEGORIES` / `HERBAL_CATEGORIES` dead code | HIGH | `types/category.ts` | Arrays eliminados (nunca importados, DB-driven) |
| Dynamic Tailwind class `ring-${sectionColor}` no sobrevive purge | HIGH | `CategoryTreeNode.tsx` | Refactorizado a condicional estático con `cn()` |
| `CategoryForm` deep import `admin-categories.service` | MED | `CategoryForm.tsx` | Cambiado a barrel `@/services/admin` |
| `Section` import inconsistente (`@/types/product` vs `@/types/constants`) | MED | 6 archivos | Normalizado a `@/types/constants` (canonical re-export) |

**No resueltos (aceptados o diferidos):**

| Issue | Sev. | Razón |
|-------|------|-------|
| `FALLBACK_CATEGORIES` hardcodeado en `category-showcase.ts` | MED | Mismo patrón que §9.4 (datos fallback). Solo se usa si DB vacía. **Aceptado** |
| `confirm()` nativo en `AdminCategories.tsx` delete | MED | Admin-only; diferido a admin audit |
| `as Category[]` casts en ambos services | MED | Requiere Supabase generated types; diferido |
| CategoryShowcase acoplado a exactamente 4 slots | LOW | Diseño intencional. **Aceptado** |
| Sin Zod schema en `CategoryForm` | LOW | Admin form; diferido a admin audit |

**Archivos modificados:** 9 (`types/category.ts`, `CategoryTreeNode.tsx`, `CategoryForm.tsx`, `CategoryCard.tsx`, `CategoriesHeader.tsx`, `CategoryTreeContainer.tsx`, `admin-categories.service.ts`, `AdminCategories.tsx`)

### 9.14 AUDITORÍA MÓDULO CARRITO & CHECKOUT (11 issues → 4 resueltos, 7 aceptados/diferidos)

Auditoría completa del módulo de carrito y checkout (store, hooks, components, pages). 2 HIGH, 5 MED, 4 LOW.

**Archivos auditados (8):** `types/cart.ts`, `stores/cart.store.ts`, `hooks/useCartValidator.ts`, `hooks/useCheckout.ts`, `components/cart/CartButton.tsx`, `components/cart/CartSidebar.tsx`, `components/cart/CheckoutForm.tsx`, `pages/Checkout.tsx`

**Acciones ejecutadas:**

| Issue | Sev. | Archivo(s) | Fix |
|-------|------|-----------|-----|
| `Checkout.tsx` redirect race condition al vaciar carrito post-success | HIGH | `Checkout.tsx` | `useRef(checkoutStarted)` — solo redirige a `/` si el carrito estaba vacío al entrar, no después de checkout exitoso |
| `CartSidebar` sin `role="dialog"` ni `aria-modal` | MED | `CartSidebar.tsx` | Añadido `role="dialog"`, `aria-modal="true"`, `aria-labelledby="cart-title"` |
| `CartSidebar` imagen guard verbose | MED | `CartSidebar.tsx` | `images && images.length > 0` → `images?.[0]` (más idiomático) |
| `useCheckout` importa `Address` type de service en vez de hook | MED | `useCheckout.ts` | Cambiado a `import type { Address } from '@/hooks/useAddresses'` |

**No resueltos (aceptados o diferidos):**

| Issue | Sev. | Razón |
|-------|------|-------|
| `Record<string, any>` en `cart.ts` (`mp_payment_data`) | HIGH | Necesita schema MercadoPago; diferido (ya documentado en §9.12) |
| `useCheckout` importa 3 services directamente | MED | Es un hook orquestador que llama services puntuales (`applyCoupon`, `mercadopagoService`, `markWhatsAppSent`). **Aceptado** — hooks SÍ pueden importar services según §2.1 |
| `CouponValidation` type importado directamente de `coupons.service` | MED | `useCoupons` no re-exporta el type. **Aceptado** — crear re-export sería solo boilerplate |
| `Order` interface en `types/cart.ts` vs `OrderRecord` en `types/order.ts` | LOW | `Order` es para el flujo local (WhatsApp), `OrderRecord` es para DB. Coexisten intencionalmente. **Aceptado** |
| `selectTotal === selectSubtotal` (alias con TODO) | LOW | Se separará cuando se implemente envío/descuentos a nivel store. **Aceptado** |
| `CheckoutForm` tiene 469 líneas | LOW | Toda la lógica está en `useCheckout`. El componente es solo UI con formulario extenso. **Aceptado** |
| `CartSidebar` `index` en AnimatePresence map | LOW | Se usa en `transition.delay`. Correcto. **No issue** |

**Archivos modificados:** 3 (`CartSidebar.tsx`, `useCheckout.ts`, `Checkout.tsx`)

### 9.15 AUDITORÍA MÓDULO SEARCH (7 issues → 5 resueltos, 2 aceptados/diferidos)

**Archivos auditados:** 6 (`search.service.ts`, `useSearch.ts`, `search-overlay.store.ts`, `SearchBar.tsx`, `MobileSearchOverlay.tsx`, `SearchResults.tsx`)

| Issue | Severidad | Archivos | Resolución |
|-------|-----------|----------|------------|
| `Section` import desde `@/types/product` en vez de canonical `@/types/constants` | MED | `search.service.ts`, `useSearch.ts` | ✅ Normalizado a `@/types/constants` |
| `SearchBar` no usa `optimizeImage` en imágenes del dropdown (MobileSearchOverlay sí lo hacía) | MED | `SearchBar.tsx` | ✅ Agregado `optimizeImage` con width:80 quality:80 format:webp |
| `MobileSearchOverlay` sin atributos ARIA (overlay fullscreen) | MED | `MobileSearchOverlay.tsx` | ✅ Agregado `role="dialog"`, `aria-modal="true"`, `aria-label` |
| Re-export muerto `export { useSearchOverlay }` desde componente | LOW | `MobileSearchOverlay.tsx` | ✅ Eliminado — `BottomNavigation` importa directamente del store |
| `as Product[]` cast en Supabase query | LOW | `search.service.ts` | Diferido — mismo issue sistémico (necesita generated types) |
| `SearchBar.tsx` 318 líneas | LOW | `SearchBar.tsx` | **Aceptado** — complejidad inherente (dropdown, keyboard nav, historial) |
| `SearchResults.tsx` limpio | INFO | `SearchResults.tsx` | Sin issues — usa `useSearch` + `ProductGrid` correctamente |

**Archivos modificados:** 4 (`search.service.ts`, `useSearch.ts`, `SearchBar.tsx`, `MobileSearchOverlay.tsx`)

### 9.16 AUDITORÍA MÓDULO AUTH (8 issues → 4 resueltos, 4 aceptados/diferidos)

**Archivos auditados:** 7 (`auth.service.ts`, `useAuth.ts`, `useUpdateProfile.ts`, `AuthContext.tsx`, `LoginForm.tsx`, `SignUpForm.tsx`, `ProtectedRoute.tsx`)

| Issue | Severidad | Archivos | Resolución |
|-------|-----------|----------|------------|
| `useEffect` deps vacías omiten `loadProfile` (ESLint warning, posible stale closure) | HIGH | `AuthContext.tsx` | ✅ Agregado `loadProfile` al array de deps |
| "¿Olvidaste tu contraseña?" era un `<Link to="/login">` (no hacía nada, link circular) | MED | `LoginForm.tsx` | ✅ Convertido a botón funcional que llama `resetPassword(email)` con feedback visual |
| `data as CustomerProfile \| null` cast innecesario (Supabase .single() ya retorna el tipo) | MED | `AuthContext.tsx` | ✅ Eliminado cast, usa `data ?? null` |
| `SignUpForm` términos/privacidad son `<span>` no navegables (deberían ser links o abrir modales) | MED | `SignUpForm.tsx` | **Aceptado** — dependería de páginas legales que no existen aún |
| `getCustomerProfile` retorna `any` (Supabase `.select('*')`) | LOW | `auth.service.ts` | Diferido — mismo issue sistémico (needs generated types) |
| `createCustomerProfile` silencia errores | LOW | `auth.service.ts` | **Aceptado** — intencional: no bloquear signup si tabla no existe |
| `SignUpForm` validación es string-based en vez de Zod | LOW | `SignUpForm.tsx` | **Aceptado** — funcional y suficiente para 5 campos simples |
| `useUpdateProfile` importa service directamente (hook → service) | LOW | `useUpdateProfile.ts` | **Aceptado** — sigue §2.1 (hooks CAN import services) |

**Archivos modificados:** 2 (`AuthContext.tsx`, `LoginForm.tsx`)

### 9.17 AUDITORÍA MÓDULO HOME (12 issues → 4 resueltos, 8 aceptados/diferidos)

**Archivos auditados:** 10 (`Home.tsx`, `MegaHero.tsx`, `CategoryShowcase.tsx`, `FlashDeals.tsx`, `ProductRail.tsx`, `PromoSection.tsx`, `SocialProof.tsx`, `BrandsCarousel.tsx`, `TrustBadges.tsx`, `SocialProofToast.tsx`)

| Issue | Severidad | Archivos | Resolución |
|-------|-----------|----------|------------|
| `SocialProofToast` muestra compras fake (`MOCK_PURCHASES`) como "verificadas" | HIGH | `SocialProofToast.tsx` | **Diferido** — necesita API de compras recientes reales. Violation documentada en §9.4 |
| `FlashDeals` hardcodea descuentos fake `[30,40,50,35,45,40]`, no consume tabla `flash_deals` | HIGH | `FlashDeals.tsx` | **Diferido** — necesita hook que consuma tabla flash_deals del admin. Violation documentada en §9.4 |
| `SocialProof.tsx` 634 líneas — god file (5 sub-componentes + fallback data + helper) | HIGH | `SocialProof.tsx` | **Diferido** — extracción requiere refactor significativo. Line count actualizado en §3 |
| `Section` import desde `@/types/product` en vez de canonical `@/types/constants` | MED | `ProductRail.tsx` | ✅ Normalizado |
| `FlashDeals` no usa `optimizeImage` para imágenes de producto | MED | `FlashDeals.tsx` | ✅ Agregado `optimizeImage` (560×440, webp, q80) |
| `MegaHero` carga textura de ruido desde URL externa (`transparenttextures.com`) | MED | `MegaHero.tsx` | ✅ Reemplazado con SVG data URI inline (sin dependencia externa) |
| `SocialProof` FALLBACK_TESTIMONIALS — 5 testimonios con personas inventadas | MED | `SocialProof.tsx` | **Aceptado** — solo se muestra si DB vacía (desarrollo). Documentado en §7 |
| AI_CONTEXT.md decía SocialProof 585 líneas, real 634 | LOW | `AI_CONTEXT.md` | ✅ Actualizado |
| `MegaHero` usa `exitBeforeEnter` (framer-motion v6) | LOW | `MegaHero.tsx` | **Aceptado** — v6 pinned, correcto |
| `CategoryShowcase`/`BrandsCarousel` limpios, usan hooks correctos | INFO | ambos | Sin issues — diseño correcto |
| `PromoSection`/`TrustBadges` limpios, sin deps externas | INFO | ambos | Sin issues — componentes estáticos correctos |
| `Home.tsx` composición limpia con SectionErrorBoundary + DeferredSection | INFO | `Home.tsx` | Sin issues — patrón de isolación correcto |

**Archivos modificados:** 4 (`ProductRail.tsx`, `FlashDeals.tsx`, `MegaHero.tsx`, `AI_CONTEXT.md`)

### 9.18 AUDITORÍA FULL SWEEP — Layout, UI, Notifications, Profile, Loyalty, Addresses, SEO, Social, Stores, Hooks, Services, Lib, Pages (19 issues → 12 resueltos, 7 diferidos)

**Archivos auditados:** ~90 archivos restantes del storefront (todo excepto admin)

| Issue | Severidad | Archivos | Resolución |
|-------|-----------|----------|------------|
| `ProductJsonLd` tenía `aggregateRating` fake con rating "4.9" y reviewCount random — viola directrices Google | HIGH | `ProductJsonLd.tsx` | ✅ Eliminado bloque completo de aggregateRating |
| `lib/domain/loyalty.ts` gold tier en 15,000 vs `loyalty.service.ts` gold en 20,000 — inconsistencia de tiers | HIGH | `loyalty.ts` | ✅ Corregido a 20,000 (service es autoritativo) |
| `SocialProofToast` MOCK_PURCHASES — compras fake (diferido desde §9.17) | HIGH | `SocialProofToast.tsx` | **Diferido** — necesita API de compras recientes reales |
| `Section` import desde `@/types/product` en vez de canonical `@/types/constants` | MED | `CategoryDropdown.tsx` | ✅ Normalizado a `@/types/constants` |
| `TierBadge` typo `bg-theme-secondary0/20` (0 sobrante) | MED | `TierBadge.tsx` | ✅ Corregido a `bg-theme-secondary/20` |
| `ProgressBar` clase CSS inexistente `text-text-secondary` | MED | `ProgressBar.tsx` | ✅ Corregido a `text-theme-secondary` |
| `SideDrawer` usa `overflow: 'unset'` en vez de `''` (inconsistente con BottomSheet) | MED | `SideDrawer.tsx` | ✅ Normalizado a `''` |
| `TopBanner` AnimatePresence sin `exitBeforeEnter` — promos se superponen al rotar | MED | `TopBanner.tsx` | ✅ Agregado `exitBeforeEnter` |
| `TrackOrder` usa `catch (err: any)` — viola TypeScript strict | MED | `TrackOrder.tsx` | ✅ Cambiado a `catch (err: unknown)` + `instanceof Error` |
| `Footer` URLs sociales placeholder (`instagram.com`, `facebook.com`) en vez de SITE_CONFIG | MED | `Footer.tsx` | ✅ Reemplazado con `SITE_CONFIG.social.*` + import agregado |
| `Loyalty.tsx` usa `alert()` en vez de `useNotification` | MED | `Loyalty.tsx` | ✅ Reemplazado con `notify.success()` / `notify.error()` |
| `Contact.tsx` usa `react-hot-toast` en vez de `useNotification` | MED | `Contact.tsx` | ✅ Reemplazado con `useNotification` |
| `ToastContainer` comentario de 30 líneas con divagaciones de diseño | LOW | `ToastContainer.tsx` | ✅ Reemplazado con JSDoc conciso |
| `Footer` arrow function export → named function (convención) | LOW | `Footer.tsx` | ✅ Cambiado a `function Footer()` |
| `useSwipe` posible stale closure en refs | LOW | `useSwipe.ts` | **Aceptado** — hook no es crítico actualmente |
| Duplicate `logError` en `lib/monitoring.ts` vs `services/monitoring.service.ts` | LOW | ambos | **Aceptado** — consolidar en futuro refactor |
| `analytics.ts` placeholder `GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'` | LOW | `analytics.ts` | **Aceptado** — se reemplaza al activar GA4 |
| `AddressList` usa `confirm()` nativo | LOW | `AddressList.tsx` | **Aceptado** — baja prioridad storefront |
| `z-index.ts` constantes definidas pero no importadas en componentes | INFO | `z-index.ts` | **Aceptado** — documentación para futuro uso |

**Archivos modificados:** 12 (`CategoryDropdown.tsx`, `TierBadge.tsx`, `ProgressBar.tsx`, `SideDrawer.tsx`, `TopBanner.tsx`, `TrackOrder.tsx`, `ProductJsonLd.tsx`, `Footer.tsx`, `ToastContainer.tsx`, `Loyalty.tsx`, `Contact.tsx`, `lib/domain/loyalty.ts`)

**Estado post-auditoría:** Todo el storefront auditado (§9.10–§9.18). Solo falta auditoría del módulo Admin (~118 archivos, cubierto en §9.19).

### 9.19 AUDITORÍA ADMIN MODULE — 118 archivos (89 componentes + 17 páginas + 12 servicios) (15 issues → 13 resueltos, 2 diferidos)

**Archivos auditados:** 118 (todos los archivos bajo `src/components/admin/`, `src/pages/admin/`, `src/services/admin/`)

| Issue | Severidad | Archivos | Resolución |
|-------|-----------|----------|------------|
| `ProductEditorDrawer` usa 4× `alert()` para validación en vez de `useNotification` | HIGH | `ProductEditorDrawer.tsx` | ✅ Reemplazado con `notify.warning('Campo requerido', ...)` |
| `products/ImageUploader` usa 2× `alert()` para max imágenes y error upload | HIGH | `products/ImageUploader.tsx` | ✅ Reemplazado con `notify.warning()` / `notify.error()` |
| `Section` import desde `@/types/product` en vez de canonical `@/types/constants` | MED | `ProductsFilter.tsx`, `CategoryCascader.tsx`, `ProductEditorDrawer.tsx`, `AdminProductForm.tsx`, `AdminProducts.tsx`, `admin-products.service.ts` | ✅ Normalizado a `@/types/constants` (imports combinados Product+Section separados) |
| `products/ImageUploader` tenía `console.error` sin eslint-disable | MED | `products/ImageUploader.tsx` | ✅ Agregado `eslint-disable-next-line no-console` |
| 5 páginas admin tenían `export default` redundante junto a named export | LOW | `AdminTestimonials.tsx`, `AdminLoyalty.tsx`, `AdminHomeSliders.tsx`, `AdminCustomers.tsx`, `AdminBrands.tsx` | ✅ Eliminados — App.tsx usa patrón `.then(m => ({ default: m.X }))` |
| `SalesChart.tsx` acceso `dayLabels[d.getDay()]` retorna `string \| undefined` bajo strict | LOW | `SalesChart.tsx` | **Aceptado** — riesgo mínimo, getDay() siempre 0-6 |
| `GeneralSettings.tsx` cast `as string` inseguro en formData | LOW | `GeneralSettings.tsx` | **Aceptado** — tipo controlado internamente |

**Archivos modificados:** 13 (`ProductsFilter.tsx`, `CategoryCascader.tsx`, `ProductEditorDrawer.tsx`, `products/ImageUploader.tsx`, `AdminProductForm.tsx`, `AdminProducts.tsx`, `admin-products.service.ts`, `AdminTestimonials.tsx`, `AdminLoyalty.tsx`, `AdminHomeSliders.tsx`, `AdminCustomers.tsx`, `AdminBrands.tsx`, `AI_CONTEXT.md`)

**Estado post-auditoría:** Codebase COMPLETO auditado (§9.10–§9.19). Storefront + Admin = ~210+ archivos auditados. 0 errores tsc, build exitoso.

### 9.20 REFACTOR Admin Tags — Vista compacta, modal, paginación, homogenización con Brands

**Motivación:** El módulo de etiquetas usaba tarjetas grandes (140px+ cada una) en grid, sin paginación ni modal. Scroll excesivo en mobile, inconsistente con el patrón premium de AdminBrands.

**Arquitectura anterior (eliminada):**
- `TagsHeader` — header con búsqueda inline
- `TagGrid` — grid de tarjetas grandes
- `TagCard` — tarjeta individual con edición inline y hover-only actions
- `TagCreateCard` — tarjeta-input para creación inline

**Arquitectura nueva (homogenizada con AdminBrands):**
- `TagsHeader` — refactorizado: título + badge + botón "Nueva Etiqueta" (como BrandsHeader)
- `TagsStats` — NUEVO: 3 pills de métricas (total, productos clasificados, más usada)
- `TagsFilters` — NUEVO: barra de búsqueda extraída (como BrandsFilters)
- `TagsTable` — NUEVO: vista tabla compacta con header row (filas ~48px vs 140px)
- `TagRow` — NUEVO: fila compacta con acciones always-visible en mobile
- `TagFormModal` — NUEVO: modal glassmorphism para crear/editar (como BrandsFormModal)
- `Pagination` — reutilizado del admin (PAGE_SIZE=20)

**Mejoras concretas:**
- Scroll reducido ~3x (filas de 48px vs tarjetas de 140px+)
- Paginación con 20 items/página
- Acciones siempre visibles en mobile (no dependen de hover)
- Modal para create/edit con auto-slug y validación
- Stats section con métricas globales
- Loading state premium (spinner + blur, como AdminBrands)

**Archivos creados:** 5 (`TagsStats.tsx`, `TagsFilters.tsx`, `TagsTable.tsx`, `TagRow.tsx`, `TagFormModal.tsx`)
**Archivos modificados:** 2 (`TagsHeader.tsx`, `AdminTags.tsx`)
**Archivos eliminados:** 3 (`TagGrid.tsx`, `TagCard.tsx`, `TagCreateCard.tsx`)

### 9.21 POLISH Admin UX — Touch targets, mobile actions, aria-labels, contrast, active preset

**Auditoría completa:** Subagent revisó 17 páginas admin + 89 componentes. Resultado: 6 HIGH, ~18 MED, ~15 LOW.

**Issues HIGH resueltos:**
1. **Touch targets < 44px** — Botones icon-only con `p-1.5` (~28px) → `p-2.5` (~44px) en Products, Categories, FlashDeals, Tags
2. **Hover-only actions en mobile** — Acciones invisibles en touch devices:
   - `ProductTableRow` → `sm:opacity-0 sm:group-hover:opacity-100` (siempre visibles en mobile)
   - `CategoryTreeNode` → `sm:translate-x-2 sm:opacity-0 sm:group-hover:*` (mobile-first visible)
   - `TestimonialAdminCard` → NUEVA barra mobile `flex md:hidden` con 5 botones (patrón BrandAdminCard)
3. **Contrast insuficiente** — `text-white/20` → `/40`, `text-theme-secondary/50` → `/60` mínimo

**Issues MED resueltos:**
4. **aria-labels ausentes en icon-only buttons** — Agregados en Products (7 botones), Tags (2), Categories (N por nodo), FlashDeals (3), Testimonials (5)
5. **DashboardHeader preset sin estado activo** — Nuevo `activePreset` state + `cn()` para highlight visual del preset seleccionado (ring + bg accent)

**Issues diferidos (refactor mayor):**
- `confirm()` nativo en 9 módulos → requiere ConfirmDialog global (futuro)
- inline editing en Coupons/Testimonials → módulo-level refactor como §9.20
- AdminProductForm monolítico (~600 lines) → split futuro
- Paginación ausente en Categories/FlashDeals/Sliders → feature futuro

**Archivos modificados:** 6
| Archivo | Cambios |
|---------|---------|
| `TagRow.tsx` | touch targets, aria-labels, contrast |
| `ProductTableRow.tsx` | touch targets, mobile-visible actions, aria-labels, contrast |
| `CategoryTreeNode.tsx` | mobile-visible actions, touch targets, aria-labels |
| `TestimonialAdminCard.tsx` | nueva barra mobile, desktop bar → hidden md:flex |
| `FlashDealsTable.tsx` | touch targets, aria-labels, contrast |
| `DashboardHeader.tsx` | activePreset state, cn() active styling, aria-label export |

**Estado post-polish:** Fase UX completada. Todos los módulos admin cumplen mínimos WCAG touch targets + mobile visibility + screen reader labels. Próxima fase: Optimización → Seguridad.

### 9.22 OPTIMIZACIÓN Bundle — Vendor splitting, lazy Sentry, lazy framer-motion, lazy CartSidebar

**Problema:** Main chunk `index.js` = 624.84 kB (189.74 kB gzip). Contenía React, Supabase, Sentry, framer-motion, TanStack Query, React Router, app code — todo junto. Cada deploy invalidaba toda la caché del browser.

**Resultado:** Main chunk reducido a **132.60 kB** (40.72 kB gzip) — **reducción del 79%**.

**Cambios realizados:**

1. **Sentry lazy-loaded (`lib/monitoring.ts`)** — `import * as Sentry from '@sentry/react'` → `const Sentry = await import('@sentry/react')`. Resultado: vendor-sentry = 0.04 kB (solo se descarga cuando `VITE_SENTRY_DSN` está configurado en producción). También se eliminó `replayIntegration()` (~40-60 kB).

2. **framer-motion removido del critical path:**
   - `CartButton.tsx`: `motion.button` → CSS `hover:scale-105 active:scale-90`, `AnimatePresence` → CSS `animate-in zoom-in-50`
   - `NotificationBell.tsx`: `motion.button` → CSS hover/active, badges → CSS animate-in
   - `TopBanner.tsx`: `AnimatePresence + motion.div` → CSS `animate-in slide-in-from-bottom-4 fade-in`
   - `NotificationCenter`: lazy-loaded desde NotificationBell (solo se descarga al click)

3. **CartSidebar lazy-loaded (`App.tsx`)** — Solo se descarga al abrir carrito. Chunk propio: 8.76 kB.

4. **OrderNotifications lazy + conditional (`App.tsx`)** — Solo se monta si `user` existe (auth). Chunk: 1.03 kB.

5. **AdminErrorBoundary lazy-loaded (`App.tsx`)** — Ya no se descarga para storefront. Chunk: 2.08 kB.

6. **Vendor manualChunks (`vite.config.ts`)** — Libs separadas en chunks independientes cacheables:

   | Vendor chunk | Tamaño | Contenido |
   |---|---|---|
   | vendor-react | 143.35 kB | react + react-dom + scheduler |
   | vendor-supabase | 174.30 kB | @supabase/supabase-js |
   | vendor-framer | 98.92 kB | framer-motion (solo lazy pages) |
   | vendor-query | 39.02 kB | @tanstack/react-query |
   | vendor-router | 21.54 kB | react-router-dom |
   | vendor-zod | 59.39 kB | zod (solo lazy forms) |
   | vendor-sentry | 0.04 kB | @sentry/react (dynamic import) |

7. **Source maps: `sourcemap: 'hidden'`** — Genera .map para Sentry-upload pero el browser no los descarga (elimina referencia `//# sourceMappingURL`).

**Archivos modificados:** 6
| Archivo | Cambios |
|---------|---------|
| `vite.config.ts` | manualChunks, sourcemap: 'hidden' |
| `lib/monitoring.ts` | Sentry dynamic import, eliminó replayIntegration |
| `App.tsx` | CartSidebar/OrderNotifications/AdminErrorBoundary lazy, useAuth |
| `CartButton.tsx` | framer-motion → CSS transitions |
| `NotificationBell.tsx` | framer-motion → CSS, NotificationCenter lazy |
| `TopBanner.tsx` | framer-motion → CSS animate-in |

**Impacto en primer load (storefront):**
- Antes: 624.84 kB (main) + 204.43 kB (CSS) = ~829 kB JS+CSS
- Después: 132.60 kB (index) + 143.35 kB (react) + 174.30 kB (supabase) + 21.54 kB (router) + 204.43 kB (CSS) = ~676 kB total, pero vendor chunks son **inmutables entre deploys**
- **framer-motion (98.92 kB) NO se descarga hasta que el usuario abre el carrito o panel de notificaciones**
- **Sentry (0.04 kB) NO se descarga a menos que DSN esté configurado**

### 9.23 DEEP PERFORMANCE — ProductCard memo, lazy QuickView, preconnect, image transforms

**Audit:** Subagente analizó React-Query config, re-renders, image optimization, data prefetching, CSS, service worker, third-party scripts, font loading. React-Query ya estaba bien configurado (staleTime: 5min, retry: 1, refetchOnWindowFocus: false). Se priorizaron 10 fixes por impacto/esfuerzo.

**Resultado:**
- ProductCard: 17.01 → **7.05 kB** (−58.5%) — framer-motion eliminado
- QuickViewModal: ahora chunk lazy separado **6.64 kB** (antes bundled en ProductCard)
- Presence WebSocket: deshabilitado para storefront visitors (solo admin)
- Hero LCP image: `fetchPriority="high"` + `loading="eager"`
- Supabase preconnect: ~100-200ms ahorrados en primer API call
- Fonts: non-blocking preload pattern
- GA4 placeholder script: eliminado (nunca configurado)
- `optimizeImage()`: ahora funcional con Supabase render endpoint

**Cambios realizados:**

1. **`index.html`** — Eliminó placeholder `<script>` de GA4 (`G-XXXXXXXXXX`, nunca configurado). Añadió `<link rel="preconnect" href="https://cvvlorbiwtuhkxolhfie.supabase.co">`. Fonts cambiados a `rel="preload" as="style" onload="this.rel='stylesheet'"` con `<noscript>` fallback. Eliminó peso 300 (no usado).

2. **`ProductCard.tsx`** — Eliminó `import { motion } from 'framer-motion'`. `motion.div` → `<div>` con CSS `hover:scale-[1.02] active:scale-[0.98]`. Envuelto en `React.memo`. `QuickViewModal` lazy-loaded con `React.lazy + Suspense` (solo se descarga al click "Vista Rápida").

3. **`useAppMonitoring.ts`** — Corrigió lógica invertida en Presence channel: `if (isAdmin) return` → `if (!isAdmin) return`. WebSocket ahora solo se abre para rutas admin. Antes, TODOS los visitantes de storefront abrían WebSocket persistente innecesariamente.

4. **`OptimizedImage.tsx`** — Añadió prop `priority?: boolean`. Cuando `priority=true`: `loading="eager"` + `fetchPriority="high"`. Para imágenes LCP (hero, above-the-fold).

5. **`MegaHero.tsx`** — Añadió `loading="eager"` + `fetchPriority="high"` en imagen hero del slider. Estas son las imágenes LCP del storefront.

6. **`Footer.tsx` + `BottomNavigation.tsx`** — Envueltos en `React.memo`. Son componentes estáticos que se re-renderizaban en cada navegación sin razón.

7. **`lib/utils.ts` → `optimizeImage()`** — Era un no-op (retornaba URL sin cambios, comentario: "planes gratuitos"). Ahora: detecta URLs de Supabase Storage (`/storage/v1/object/public/`), las reescribe a render endpoint (`/storage/v1/render/image/public/`) con params `?width=&height=&quality=&format=webp`. URLs externas pasan sin cambios.

**Archivos modificados:** 8
| Archivo | Cambios |
|---------|---------|
| `index.html` | Eliminó GA4, preconnect Supabase, font preload pattern |
| `ProductCard.tsx` | React.memo, eliminó framer-motion, lazy QuickViewModal |
| `useAppMonitoring.ts` | Presence channel admin-only |
| `OptimizedImage.tsx` | Prop `priority` → eager + fetchPriority |
| `MegaHero.tsx` | Hero image fetchPriority="high" |
| `Footer.tsx` | React.memo wrapper |
| `BottomNavigation.tsx` | React.memo wrapper |
| `lib/utils.ts` | optimizeImage() → Supabase render endpoint transforms |

**Impacto en storefront:**
- Eliminó WebSocket persistente para ~100% de visitantes (solo admin lo necesita)
- ProductCard grid: framer-motion ya no se importa → vendor-framer NO se descarga en listings
- QuickViewModal: solo se descarga bajo demanda (6.64 kB lazy chunk)
- Hero image: LCP mejorado con fetchPriority="high" + eager loading
- Todas las imágenes de productos: servidas en formato WebP con dimensiones correctas vía Supabase render endpoint
- Footer + BottomNav: no re-renders innecesarios en navegación

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

*Generado el 3 de marzo de 2026. Actualizado el 5 de marzo de 2026. Este documento refleja el estado REAL del código, incluyendo sus imperfecciones.*
