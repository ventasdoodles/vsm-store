# VSM Store — Documentación Completa para IA y Desarrolladores

> [!IMPORTANT]
> **GUÍA PARA IA:** Si eres un asistente de IA, lee primero el archivo [AI_CONTEXT.md](./AI_CONTEXT.md) para entender la arquitectura profunda y el sistema de diseño premium del proyecto.

> **Última actualización:** 2026-02-22
> **Estado:** MVP Funcional (~98%)
> **Producción:** [vsm-store.pages.dev](https://vsm-store.pages.dev)
> **Repo:** [github.com/ventasdoodles/vsm-store](https://github.com/ventasdoodles/vsm-store)

---

## 1. RESUMEN EJECUTIVO

**VSM Store** es una aplicación e-commerce B2C tipo PWA (Progressive Web App) para **VSM (Vape Store Mexico)**, ubicada en Xalapa, Veracruz, México. Vende productos de vape y cannabis (sección "420"). La app incluye un **storefront público** y un **panel de administración integrado** en la misma SPA, separados por rutas y lazy loading.

### Modelo de negocio

- Catálogo de ~40 productos divididos en 2 secciones: `vape` y `420`
- 13 categorías jerárquicas (con subcategorías vía `parent_id`)
- Checkout vía WhatsApp + Mercado Pago (parcialmente implementado)
- Sistema de lealtad con 4 tiers: Bronze → Silver → Gold → Platinum
- Moneda: MXN (Pesos Mexicanos), locale: `es-MX`

---

## 2. STACK TECNOLÓGICO

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework** | React | 18.3.1 | UI declarativa con hooks |
| **Lenguaje** | TypeScript | ~5.6.2 | Tipado estático |
| **Bundler** | Vite | ^6.0.5 | Dev server + build |
| **Estilos** | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| **Estado servidor** | React Query (TanStack) | ^5.17.0 | Cache, fetch, mutations |
| **Estado cliente** | Zustand | ^5.0.11 | Store global (carrito, notificaciones) |
| **Backend/DB** | Supabase | ^2.39.0 | PostgreSQL, Auth, Storage, RLS |
| **Routing** | React Router DOM | ^6.22.0 | SPA routing |
| **Iconos** | Lucide React | ^0.574.0 | Iconos SVG |
| **SEO** | react-helmet-async | ^2.0.5 | Meta tags dinámicos |
| **Toasts** | react-hot-toast | ^2.4.1 | Notificaciones toast |
| **Monitoring** | Sentry (@sentry/react) | ^10.39.0 | Error tracking + replays |
| **Analytics** | Google Analytics 4 | — | Tracking de eventos e-commerce |
| **Confetti** | canvas-confetti | ^1.9.4 | Animaciones de celebración |
| **CSS Utils** | clsx | ^2.1.0 | Clases condicionales |
| **Hosting** | Cloudflare Pages | — | CDN + deploy |
| **Fuente** | Inter (Google Fonts) | 300-800 | Tipografía principal |

### DevDependencies clave

- `@vitejs/plugin-react` — JSX transform
- `autoprefixer` + `postcss` — PostCSS pipeline
- `sharp` — Optimización de imágenes (build-time)
- `eslint` + `typescript-eslint` — Linting
- `dotenv` — Variables de entorno en scripts

---

## 3. VARIABLES DE ENTORNO

Archivo `.env` en la raíz (ver `.env.example`):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx    # Opcional
```

> **IMPORTANTE:** Sin `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, la app muestra pantalla de error de configuración (ver `App.tsx` línea 72-90).

---

## 4. SCRIPTS NPM

```bash
npm run dev            # Inicia dev server (Vite)
npm run build          # tsc && vite build && generate-sitemap
npm run preview        # Preview del build de producción
npm run typecheck      # tsc --noEmit (verificación de tipos)
npm run lint           # ESLint sobre src/
npm run lint:fix       # ESLint con auto-fix
npm run generate-sitemap  # Genera sitemap.xml en dist/
```

---

## 5. ESTRUCTURA DEL PROYECTO

```
vsm-store/
├── public/                     # Assets estáticos (icons, manifest.json, sw.js)
├── supabase/
│   ├── migrations/             # 10 archivos SQL de migración
│   │   ├── 001_initial_schema.sql          # Schema principal (27KB)
│   │   ├── 002_users_system.sql            # Sistema de usuarios
│   │   ├── 003_admin_users.sql             # Tabla admin_users + RLS
│   │   ├── 20240214_add_payment_fields.sql # Campos Mercado Pago
│   │   ├── 20260216_create_store_settings.sql
│   │   ├── 20260216_admin_customer_notes.sql
│   │   ├── 20260216_bank_account_info.sql
│   │   ├── 20260216_expiring_badges_and_cover.sql
│   │   ├── 20260216_god_mode_notifications.sql
│   │   └── 20260216_monitoring_system.sql
│   └── functions/              # Edge Functions de Supabase
├── scripts/
│   └── generate-sitemap.js     # Generador de sitemap
├── src/
│   ├── App.tsx                 # Router principal (164 líneas)
│   ├── main.tsx                # Entry point + providers (78 líneas)
│   ├── index.css               # Estilos globales + CSS variables (16KB)
│   ├── vite-env.d.ts           # Tipos de Vite
│   │
│   ├── components/             # 60 archivos en 14 subdirectorios
│   │   ├── ErrorBoundary.tsx   # Error boundary global
│   │   ├── addresses/          # (3) Gestión de direcciones
│   │   ├── admin/              # (6) AdminGuard, AdminLayout, AdminSidebar...
│   │   ├── auth/               # (3) ProtectedRoute, LoginForm, SignUpForm
│   │   ├── cart/               # (3) CartSidebar, CartItem, CheckoutForm
│   │   ├── categories/         # (1) CategoryCard
│   │   ├── home/               # (10) MegaHero, FlashDeals, FeaturedGrid...
│   │   ├── layout/             # (4) Layout, Header, Footer, MobileNav
│   │   ├── loyalty/            # (3) LoyaltyBadge, LoyaltyDashboard...
│   │   ├── notifications/      # (4) ToastContainer, OrderNotifications...
│   │   ├── products/           # (10) ProductCard, ProductDetail, ProductImages,
│   │   │                       #      QuickViewModal, UrgencyIndicators...
│   │   ├── search/             # (2) SearchOverlay, SearchResults
│   │   ├── seo/                # (1) SEO component
│   │   ├── social/             # (1) SocialLinks
│   │   └── ui/                 # (8) Skeleton, WhatsAppFloat, SocialProofToast...
│   │
│   ├── config/
│   │   └── site.ts             # Configuración centralizada (94 líneas)
│   │
│   ├── constants/
│   │   └── app.ts              # Magic strings centralizadas
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Autenticación global (159 líneas)
│   │   └── ThemeContext.tsx     # Dark/Light theme (45 líneas)
│   │
│   ├── hooks/                  # 14 custom hooks (React Query wrappers)
│   │   ├── useProducts.ts      # useProducts, useFeaturedProducts, useNewProducts...
│   │   ├── useOrders.ts        # useCustomerOrders, useOrder, useCreateOrder
│   │   ├── useAuth.ts          # Wrapper para AuthContext
│   │   ├── useCategories.ts    # useCategories, useCategoriesBySection
│   │   ├── useCoupons.ts       # useCoupons
│   │   ├── useLoyalty.ts       # useLoyaltyPoints, useLoyaltyHistory
│   │   ├── useAddresses.ts     # useAddresses, useCreateAddress...
│   │   ├── useSearch.ts        # useSearch (debounced)
│   │   ├── useStats.ts         # useStats
│   │   ├── useStoreSettings.ts # useStoreSettings
│   │   ├── useDebounce.ts      # Generic debounce hook
│   │   ├── useHaptic.ts        # Haptic feedback (mobile)
│   │   ├── useNotification.ts  # Wrapper para notification store
│   │   └── useAppMonitoring.ts # Sentry + presence tracking
│   │
│   ├── lib/                    # 7 utilidades
│   │   ├── supabase.ts         # Cliente Supabase (singleton)
│   │   ├── utils.ts            # cn(), formatPrice(), slugify(), formatTimeAgo()
│   │   ├── analytics.ts        # GA4: pageView, trackEvent, trackViewItem, trackAddToCart
│   │   ├── monitoring.ts       # Sentry: initMonitoring(), logError()
│   │   ├── react-query.ts      # QueryClient config
│   │   ├── image-optimizer.ts  # Optimización de imágenes client-side
│   │   └── accessibility.ts    # Utilidades de accesibilidad
│   │
│   ├── pages/                  # 18 páginas + 4 subdirectorios
│   │   ├── Home.tsx            # Página principal
│   │   ├── CategoryPage.tsx    # Vista de categoría con filtros
│   │   ├── ProductDetail.tsx   # Detalle de producto
│   │   ├── SearchResults.tsx   # Resultados de búsqueda
│   │   ├── SectionSlugResolver.tsx  # Resuelve /vape/:slug y /420/:slug
│   │   ├── Checkout.tsx        # Proceso de checkout
│   │   ├── Profile.tsx         # Perfil del usuario
│   │   ├── Orders.tsx          # Historial de pedidos
│   │   ├── OrderDetail.tsx     # Detalle de un pedido
│   │   ├── Addresses.tsx       # Gestión de direcciones
│   │   ├── Loyalty.tsx         # Dashboard de lealtad
│   │   ├── Stats.tsx           # Estadísticas del usuario
│   │   ├── Contact.tsx         # Página de contacto
│   │   ├── NotFound.tsx        # 404
│   │   ├── PaymentSuccess.tsx  # Callback de pago exitoso
│   │   ├── PaymentFailure.tsx  # Callback de pago fallido
│   │   ├── PaymentPending.tsx  # Callback de pago pendiente
│   │   ├── PrivacyPolicy.tsx   # (Legacy, reemplazado por legal/Privacy)
│   │   ├── admin/              # (10) Panel de administración completo
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   ├── AdminProductForm.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── AdminCategories.tsx
│   │   │   ├── AdminCustomers.tsx
│   │   │   ├── AdminCustomerDetails.tsx
│   │   │   ├── AdminCoupons.tsx
│   │   │   ├── AdminSettings.tsx
│   │   │   └── AdminMonitoring.tsx
│   │   ├── auth/               # (2) Login.tsx, SignUp.tsx
│   │   ├── legal/              # (2) Terms.tsx, Privacy.tsx
│   │   └── user/               # (1) Notifications.tsx
│   │
│   ├── services/               # 13 servicios + 1 subdirectorio
│   │   ├── products.service.ts # CRUD productos (storefront)
│   │   ├── orders.service.ts   # CRUD pedidos + loyalty points
│   │   ├── auth.service.ts     # signUp/In/Out, profiles
│   │   ├── admin.service.ts    # 51+ funciones admin (705 líneas)
│   │   ├── categories.service.ts
│   │   ├── addresses.service.ts
│   │   ├── coupons.service.ts
│   │   ├── loyalty.service.ts
│   │   ├── search.service.ts
│   │   ├── storage.service.ts  # Upload/delete de archivos a Supabase Storage
│   │   ├── settings.service.ts # Store settings CRUD
│   │   ├── stats.service.ts    # Estadísticas de usuario
│   │   ├── monitoring.service.ts
│   │   └── payments/           # (1) Integración Mercado Pago
│   │
│   ├── stores/                 # 2 stores Zustand
│   │   ├── cart.store.ts       # Carrito (persistido en localStorage)
│   │   └── notifications.store.ts  # Centro de notificaciones (in-memory)
│   │
│   ├── styles/
│   │   └── (1 archivo)         # Estilos modulares
│   │
│   └── types/                  # 4 archivos de tipos TypeScript
│       ├── product.ts          # Product, ProductInsert, ProductUpdate
│       ├── cart.ts             # CartItem, Order, CheckoutFormData
│       ├── category.ts         # Category, CategoryWithChildren
│       └── constants.ts        # Section ('vape'|'420'), ProductStatus
│
├── index.html                  # Entry HTML (PWA meta, GA4, Inter font)
├── package.json
├── tsconfig.json
├── vite.config.ts              # Alias @, manual chunks, sourcemaps
├── tailwind.config.js          # Theme customizado con CSS variables
├── postcss.config.js
└── eslint.config.js
```

---

## 6. ARQUITECTURA Y FLUJO DE DATOS

### 6.1 Provider Tree (main.tsx)

```
React.StrictMode
  └─ ErrorBoundary
       └─ BrowserRouter
            └─ ThemeProvider (dark/light, localStorage)
                 └─ Toaster (react-hot-toast)
                      └─ AuthProvider (Supabase auth + customer_profiles)
                           └─ QueryClientProvider (React Query, staleTime: 5min)
                                └─ HelmetProvider (SEO)
                                     └─ App
```

### 6.2 Flujo de datos principal

```
Base de datos (Supabase PostgreSQL)
    ↓ (RLS policies filtran datos)
Services (src/services/*.service.ts)
    ↓ (funciones async que llaman a supabase client)
Hooks (src/hooks/use*.ts)
    ↓ (React Query: useQuery/useMutation wrappers)
Componentes React (src/components/ + src/pages/)
    ↓ (renderizan datos, despachan acciones)
UI del usuario
```

### 6.3 Estado global

| Store | Librería | Persistencia | Contenido |
|-------|----------|-------------|-----------|
| **Cart** | Zustand | localStorage (`vsm-cart`) | items[], isOpen, acciones CRUD |
| **Notifications** | Zustand | In-memory (máx 50) | notifications[], CRUD + markAsRead |
| **Auth** | React Context | Supabase session | user, profile, loading, signIn/Up/Out |
| **Theme** | React Context | localStorage (`vsm-theme`) | theme ('dark'\|'light'), toggleTheme |
| **Server State** | React Query | In-memory cache (5min stale) | Productos, categorías, pedidos, etc. |

---

## 7. BASE DE DATOS (SUPABASE)

### 7.1 Tablas principales

| Tabla | Descripción | Campos clave |
|-------|-------------|-------------|
| `products` | Catálogo de prod. | id, name, slug, price, compare_at_price, stock, section, category_id, tags[], images[], status, is_featured/new/bestseller, cover_image, is_featured_until/is_new_until/is_bestseller_until |
| `categories` | Categorías jerárquicas | id, name, slug, section, parent_id, order_index, is_active |
| `customer_profiles` | Perfiles extendidos | id (=auth.uid), full_name, phone, whatsapp, birthdate, customer_tier, total_orders, total_spent, account_status |
| `orders` | Pedidos | id, order_number (auto-generated), customer_id, items (JSONB), subtotal, shipping_cost, discount, total, status, payment_method, payment_status, whatsapp_sent |
| `addresses` | Direcciones de envío/facturación | id, customer_id, type, street, city, state, zip_code, is_default |
| `coupons` | Cupones de descuento | id, code, discount_type (fixed/percent), discount_value, min_purchase, max_uses |
| `loyalty_points` | Historial de puntos | id, customer_id, points, transaction_type (earned/burned), order_id, description |
| `admin_users` | Roles admin | id (=auth.uid), role |
| `store_settings` | Config dinámica | key, value, updated_at |

### 7.2 Secciones del catálogo

```typescript
type Section = 'vape' | '420';
```

- **`vape`**: Mods, Atomizadores, Líquidos, Coils, Accesorios Vape
- **`420`**: Vaporizers, Fumables, Comestibles, Concentrados, Tópicos, Accesorios 420

### 7.3 Estados de producto

```typescript
type ProductStatus = 'active' | 'legacy' | 'discontinued' | 'coming_soon';
```

### 7.4 Estados de pedido

```typescript
type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
```

### 7.5 Seguridad (RLS)

- Todas las tablas tienen Row Level Security (RLS) habilitado
- `admin_users` actúa como gatekeeper para operaciones admin
- Los clientes solo ven sus propios pedidos/direcciones/perfil
- Los admins tienen acceso completo via políticas específicas

---

## 8. ROUTING COMPLETO

### 8.1 Storefront (público/autenticado)

| Ruta | Componente | Auth | Descripción |
|------|-----------|------|-------------|
| `/` | `Home` | No | Landing page con hero, flash deals, featured |
| `/buscar` | `SearchResults` | No | Búsqueda de productos |
| `/vape/:slug` | `SectionSlugResolver` | No | Producto o categoría vape |
| `/420/:slug` | `SectionSlugResolver` | No | Producto o categoría 420 |
| `/login` | `Login` | No | Inicio de sesión |
| `/signup` | `SignUp` | No | Registro |
| `/profile` | `Profile` | **Sí** | Perfil del usuario |
| `/addresses` | `Addresses` | **Sí** | Gestión de direcciones |
| `/orders` | `Orders` | **Sí** | Historial de pedidos |
| `/orders/:orderId` | `OrderDetail` | **Sí** | Detalle de pedido |
| `/loyalty` | `Loyalty` | **Sí** | Dashboard de lealtad |
| `/stats` | `Stats` | **Sí** | Estadísticas personales |
| `/notifications` | `Notifications` | **Sí** | Centro de notificaciones |
| `/checkout` | `Checkout` | No | Proceso de compra |
| `/contact` | `Contact` | No | Página de contacto |
| `/legal/terms` | `Terms` | No | Términos y condiciones |
| `/legal/privacy` | `Privacy` | No | Política de privacidad |
| `/privacy` | `Privacy` | No | Alias de privacy |
| `/payment/success` | `PaymentSuccess` | No | Callback pago exitoso |
| `/payment/failure` | `PaymentFailure` | No | Callback pago fallido |
| `/payment/pending` | `PaymentPending` | No | Callback pago pendiente |
| `*` | `NotFound` | No | 404 |

### 8.2 Admin Panel (`/admin/*`)

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/admin` | `AdminDashboard` | Dashboard con métricas |
| `/admin/products` | `AdminProducts` | Lista de productos |
| `/admin/products/new` | `AdminProductForm` | Crear producto |
| `/admin/products/:id` | `AdminProductForm` | Editar producto |
| `/admin/orders` | `AdminOrders` | Gestión de pedidos |
| `/admin/categories` | `AdminCategories` | Gestión de categorías |
| `/admin/customers` | `AdminCustomers` | Lista de clientes |
| `/admin/customers/:id` | `AdminCustomerDetails` | Detalle de cliente |
| `/admin/coupons` | `AdminCoupons` | Gestión de cupones |
| `/admin/settings` | `AdminSettings` | Configuración |
| `/admin/monitoring` | `AdminMonitoring` | Monitoreo del sistema |

> El admin panel usa `AdminGuard` (verifica `admin_users` table) + `AdminLayout` (sidebar separado). Completamente aislado del storefront (sin Header/Footer del storefront).

---

## 9. SERVICIOS (API LAYER)

Todos los servicios están en `src/services/` y abstraen las llamadas a Supabase.

### 9.1 products.service.ts

```typescript
getProducts(options?: { section?, categoryId?, limit?, offset?, filter? }): Promise<Product[]>
getFeaturedProducts(section?: Section): Promise<Product[]>
getNewProducts(section?: Section): Promise<Product[]>
getBestsellerProducts(section?: Section): Promise<Product[]>
getProductBySlug(slug: string, section: Section): Promise<Product | null>
searchProducts(query: string): Promise<Product[]>  // ilike search, limit 10
```

### 9.2 orders.service.ts

```typescript
createOrder(data: CreateOrderData): Promise<OrderRecord>  // + auto loyalty points
getCustomerOrders(customerId: string): Promise<OrderRecord[]>
getOrderById(id: string): Promise<OrderRecord | null>
updateOrderStatus(id: string, status: OrderStatus, notes?: string): void
markWhatsAppSent(orderId: string): void
calculateLoyaltyPoints(total: number): number  // $100 MXN = 10 puntos
addLoyaltyPoints(customerId, points, orderId, description): void
getPointsBalance(customerId: string): Promise<number>  // Usa RPC
```

### 9.3 auth.service.ts

```typescript
signUp(email, password, fullName, phone?): Promise<AuthResponse>
signIn(email, password): Promise<AuthResponse>
signOut(): void
resetPassword(email): void
getCurrentUser(): Promise<User | null>
getCustomerProfile(userId): Promise<CustomerProfile | null>
createCustomerProfile(userId, data): void  // Upsert
updateProfile(userId, data): void
```

### 9.4 admin.service.ts (705 líneas, 51+ funciones)

- **Auth:** `checkIsAdmin(userId)`
- **Dashboard:** `getDashboardStats(startDate?, endDate?)`
- **Productos CRUD:** `getAllProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductFlag`
- **Categorías CRUD:** `getAllCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- **Pedidos:** `getAllOrders(statusFilter?)`, `updateOrderStatus`, `getRecentOrders`
- **Clientes:** Management completo con notas, ban/suspend (God Mode)
- **Cupones:** CRUD completo
- **Settings:** Configuración dinámica
- **Storage:** Upload de imágenes con service account

### 9.5 Otros servicios

| Servicio | Funcionalidad |
|----------|--------------|
| `categories.service.ts` | getCategories, getCategoriesBySection |
| `addresses.service.ts` | CRUD direcciones, setDefault |
| `coupons.service.ts` | validateCoupon, applyCoupon |
| `loyalty.service.ts` | getLoyaltyHistory, redeemPoints |
| `search.service.ts` | Búsqueda avanzada |
| `storage.service.ts` | uploadFile, deleteFile (Supabase Storage) |
| `settings.service.ts` | getSettings, updateSettings |
| `stats.service.ts` | User statistics |
| `monitoring.service.ts` | App health monitoring |

---

## 10. HOOKS (REACT QUERY WRAPPERS)

| Hook | Query Key | Servicio |
|------|-----------|---------|
| `useProducts(options?)` | `['products', section, categoryId, limit]` | products.service |
| `useFeaturedProducts(section?)` | `['products', 'featured', section]` | products.service |
| `useNewProducts(section?)` | `['products', 'new', section]` | products.service |
| `useBestsellerProducts(section?)` | `['products', 'bestseller', section]` | products.service |
| `useProductBySlug(slug, section)` | `['products', 'detail', section, slug]` | products.service |
| `useCustomerOrders(customerId)` | `['orders', customerId]` | orders.service |
| `useOrder(orderId)` | `['orders', 'detail', orderId]` | orders.service |
| `useCreateOrder()` | mutation, invalida `['orders']` | orders.service |
| `usePointsBalance(customerId)` | `['points', customerId]` | orders.service |
| `useCategories()` | `['categories']` | categories.service |
| `useAddresses()` | `['addresses']` | addresses.service |
| `useCoupons()` | `['coupons']` | coupons.service |
| `useLoyalty()` | `['loyalty']` | loyalty.service |
| `useSearch(query)` | Debounced search | search.service |
| `useDebounce(value, delay)` | — | Generic utility |
| `useHaptic()` | — | Navigator vibrate API |
| `useNotification()` | — | notifications.store |
| `useStoreSettings()` | `['store-settings']` | settings.service |
| `useStats()` | `['stats']` | stats.service |
| `useAppMonitoring()` | — | Sentry init + presence |

---

## 11. STORES (ZUSTAND)

### 11.1 cart.store.ts

```typescript
interface CartState {
    items: CartItem[];              // { product: Product, quantity: number }[]
    isOpen: boolean;                // Sidebar visible
    addItem(product, qty?): void;   // Valida stock, is_active, status
    removeItem(productId): void;
    updateQuantity(productId, qty): void;  // Clamp to stock
    clearCart(): void;
    toggleCart/openCart/closeCart(): void;
    loadOrderItems(items): void;    // Re-order desde historial
}

// Selectores memoizados:
selectTotalItems(state): number     // Suma de quantities
selectSubtotal(state): number       // Suma de price * quantity
selectTotal = selectSubtotal        // TODO: descuentos/envío
```

**Persistencia:** localStorage key `vsm-cart`, solo persiste `items` (no `isOpen`).
**Analytics:** Dispara `trackAddToCart` de GA4 al agregar items.

### 11.2 notifications.store.ts

```typescript
interface NotificationsState {
    notifications: Notification[];   // Max 50, LIFO
    addNotification(n): void;
    removeNotification(id): void;
    markAsRead(id): void;
    markAllAsRead(): void;
    clearAll(): void;
}
```

---

## 12. SISTEMA DE TEMAS

### 12.1 ThemeContext

- 2 modos: `dark` (default) y `light`
- Persiste en `localStorage` (`vsm-theme`)
- Aplica clase `dark` o `light` al `<html>`
- Hook: `useTheme()` → `{ theme, toggleTheme, isDark }`

### 12.2 CSS Variables (index.css)

Los temas usan CSS custom properties resueltas por Tailwind:

```css
:root /* dark */ {
    --bg-primary: 15 23 42;       /* slate-900 */
    --bg-secondary: 30 41 59;     /* slate-800 */
    --bg-tertiary: 51 65 85;      /* slate-700 */
    --text-primary: 248 250 252;  /* slate-50 */
    --text-secondary: 148 163 184; /* slate-400 */
    --border-primary: 51 65 85;
    --accent-primary: 139 92 246; /* violet */
}

.light {
    --bg-primary: 248 250 252;
    --bg-secondary: 241 245 249;
    --text-primary: 15 23 42;
    /* etc. */
}
```

### 12.3 Tailwind Theme Extensions

- Colores custom: `vape-50..900` (blue scale), `herbal-50..900` (green scale)
- Background: `bg-theme-primary`, `bg-theme-secondary`, `bg-theme-tertiary`
- Text: `text-theme-primary`, `text-theme-secondary`
- Border: `border-theme`
- Accent: `bg-accent-primary`, `text-accent-primary`
- 9 animaciones custom: fade-in, slide-up/down, scale-in, shimmer, pulse-glow, float, aurora, spotlight, border-beam
- Font: Inter (300-800)

---

## 13. TIPOS TYPESCRIPT CLAVE

### Product

```typescript
interface Product {
    id: string; name: string; slug: string;
    description: string | null; short_description: string | null;
    price: number; compare_at_price: number | null;
    stock: number; sku: string | null;
    section: 'vape' | '420'; category_id: string;
    tags: string[]; status: 'active'|'legacy'|'discontinued'|'coming_soon';
    images: string[]; cover_image: string | null;
    is_featured: boolean; is_featured_until: string | null;
    is_new: boolean; is_new_until: string | null;
    is_bestseller: boolean; is_bestseller_until: string | null;
    is_active: boolean;
    created_at: string; updated_at: string;
}
```

### CartItem / Order

```typescript
interface CartItem { product: Product; quantity: number; }
type DeliveryType = 'pickup' | 'delivery';
type PaymentMethod = 'whatsapp' | 'mercadopago' | 'cash' | 'transfer';
interface Order extends CheckoutFormData {
    id: string; items: CartItem[];
    subtotal: number; total: number;
    payment_status?: 'pending'|'paid'|'failed'|'refunded';
    mp_preference_id?: string | null;  // Mercado Pago
}
```

### Category

```typescript
interface Category {
    id: string; name: string; slug: string;
    section: Section; parent_id: string | null;
    order_index: number; is_active: boolean;
}
```

### CustomerProfile (from AuthContext)

```typescript
interface CustomerProfile {
    id: string; full_name: string;
    phone: string | null; whatsapp: string | null;
    birthdate: string | null;
    customer_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    total_orders: number; total_spent: number;
}
```

---

## 14. CONFIGURACIÓN CENTRALIZADA (site.ts)

```typescript
SITE_CONFIG = {
    name: 'VSM Store',
    description: 'Tu tienda de vape y productos 420',
    logo: '/logo-vsm.png',
    whatsapp: { number: '5212281234567', defaultMessage: '...' },
    contact: { email: 'ayuda@vsmstore.com', phone: '2281234567' },
    location: { address: '...', city: 'Xalapa', state: 'Veracruz', country: 'México' },
    bankAccount: 'BBVA / CLABE / Beneficiario',
    social: { facebook, instagram, youtube, tiktok, whatsapp },
    store: { currency: 'MXN', currencySymbol: '$', locale: 'es-MX', timezone: 'America/Mexico_City' },
    orderWhatsApp: { enabled: true, generateMessage: (order) => '...' }
}
```

---

## 15. VITE BUILD CONFIG

- **Path alias:** `@` → `./src`
- **Source maps:** Habilitados (para Sentry)
- **Target:** ES2020
- **Manual chunks:**
  - `vendor-react` — react, react-dom, react-router-dom
  - `vendor-query` — @tanstack, react-query
  - `vendor-supabase` — @supabase
  - `vendor-icons` — lucide-react
  - `vendor` — resto de node_modules
  - `admin-panel` — todo `/src/pages/admin/`
  - `legal-pages` — páginas legales

---

## 16. PWA

- `manifest.json` en `/public/`
- Service Worker registrado en `main.tsx` (`/sw.js`)
- Icons en `/public/icons/` (96x96, 192x192)
- `apple-mobile-web-app-capable: yes`
- `theme-color: #0f172a` (slate-900)

---

## 17. UTILIDADES (lib/utils.ts)

```typescript
cn(...inputs: ClassValue[]): string          // clsx wrapper para combinar clases
formatPrice(price: number): string           // "$299.99" (es-MX, MXN)
slugify(text: string): string                // "mod-aegis-legend"
formatTimeAgo(date: string | Date): string   // "hace 5 min"
optimizeImage(url, options?): string         // Passthrough (Supabase free tier)
```

---

## 18. MONITORING

### Sentry

- Se inicializa en `main.tsx` vía `initMonitoring()`
- Solo en producción y si `VITE_SENTRY_DSN` existe
- Integrations: `browserTracingIntegration`, `replayIntegration`
- `tracesSampleRate: 1.0` (100% de transacciones)
- `replaysOnErrorSampleRate: 1.0` (100% replays on error)
- Función `logError(error, context?)` para captura manual

### Google Analytics 4

- Script en `index.html` (ID: `G-XXXXXXXXXX` — reemplazar)
- Eventos e-commerce: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- `pageView(url)` para tracking de navegación

---

## 19. CONSTANTES CENTRALIZADAS (constants/app.ts)

```typescript
SECTIONS = { VAPE: 'vape', HERBAL: '420' }
PRODUCT_FLAGS = { IS_FEATURED, IS_NEW, IS_BESTSELLER, IS_ACTIVE }
ORDER_STATUS = { PENDING: 'pendiente', PROCESSING, SHIPPED, DELIVERED, CANCELLED }
USER_ROLES = { ADMIN: 'admin', CUSTOMER: 'customer', DRIVER: 'driver' }
```

---

## 20. FEATURES IMPLEMENTADAS

- ✅ Catálogo completo con filtros por sección/categoría/featured/new/bestseller
- ✅ Búsqueda en vivo (ilike sobre nombre/descripción)
- ✅ Carrito persistente con validación de stock
- ✅ Checkout con WhatsApp integration (mensaje formateado automático)
- ✅ Autenticación completa (signup, login, logout, reset password)
- ✅ Perfiles de cliente con tiers de lealtad
- ✅ Sistema de puntos de lealtad (earn/burn)
- ✅ Gestión de direcciones
- ✅ Historial de pedidos con detalle
- ✅ Panel admin completo (dashboard, CRUD productos/categorías/cupones, gestión de pedidos/clientes)
- ✅ Sistema de cupones
- ✅ Dark/Light theme
- ✅ PWA installable
- ✅ SEO dinámico (react-helmet-async + sitemap)
- ✅ Monitoring (Sentry + GA4)
- ✅ Error Boundary global
- ✅ Lazy loading + code splitting
- ✅ Social proof toasts
- ✅ WhatsApp floating button
- ✅ Haptic feedback (mobile)
- ✅ Micro-animaciones (shimmer, fade, slide, aurora, etc.)
- ✅ God Mode (ban/suspend users desde admin)
- ✅ Driver assignment system
- ✅ Store settings dinámicos

---

## 21. FEATURES PENDIENTES / ROADMAP

### Crítico

- [ ] Pasarela de pagos completa (Mercado Pago / Stripe)
- [ ] Imágenes reales de productos (reemplazar placeholders)
- [ ] Inventario real-time
- [ ] Sistema de envíos (FedEx/DHL API)
- [ ] Facturación fiscal (CFDI para México)
- [ ] Google Analytics ID real (reemplazar `G-XXXXXXXXXX`)
- [ ] Sentry DSN real

### Importante

- [ ] Email notifications (SendGrid/Resend)
- [ ] Reviews & Ratings
- [ ] Wishlist persistence
- [ ] Landing page épica mejorada
- [ ] Tests unitarios y e2e

### Deuda técnica

- [ ] Eliminar magic strings restantes
- [ ] Extraer lógica de negocio a `src/lib/domain/`
- [ ] Separar admin panel en proyecto independiente (opcional)
- [ ] `selectTotal` incluir descuentos y envío

---

## 22. CÓMO EMPEZAR (PARA IA / DESARROLLADORES)

```bash
# 1. Clonar
git clone https://github.com/ventasdoodles/vsm-store.git
cd vsm-store

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales reales de Supabase

# 4. Ejecutar migraciones en Supabase
# Los archivos SQL están en supabase/migrations/ (ejecutar en orden)

# 5. Dev server
npm run dev
# → http://localhost:5173

# 6. Build de producción
npm run build
npm run preview
```

---

## 23. PATRONES Y CONVENCIONES

1. **Nombrado de archivos:**
   - Componentes: `PascalCase.tsx`
   - Servicios: `nombre.service.ts`
   - Hooks: `useNombre.ts`
   - Stores: `nombre.store.ts`
   - Tipos: `nombre.ts` (en `/types`)

2. **Imports:** Usan alias `@/` para `src/`, e.g. `import { Product } from '@/types/product'`

3. **Servicios:** Funciones `async` exportadas individualmente, no clases. Cada servicio importa `supabase` de `@/lib/supabase`.

4. **Hooks:** Son thin wrappers de React Query sobre servicios. Definen `queryKey` y `queryFn`. Mutations invalidan queries relacionadas.

5. **Componentes:** Exportados como named exports (`export function ComponentName()`), lazy-loaded en `App.tsx` con `React.lazy()`.

6. **Errores:** Try/catch en servicios con `console.error` + re-throw. Error Boundary global en la raíz. Sentry en producción.

7. **Idioma:** Codebase en inglés. UI y mensajes en español (es-MX).

---

*Este documento fue generado automáticamente analizando el código fuente completo del proyecto VSM Store. Última actualización: 2026-03-15.*

---

## 24. AI EDGE FUNCTIONS (SUPABASE)

> **Última migración:** 2026-03-15 — Gemini 1.5 Flash → Gemini 2.0 Flash

Todas las funciones de IA corren como **Supabase Edge Functions** (Deno runtime) y se comunican con la API REST de Google Gemini.

### 24.1 Configuración Global

| Parámetro | Valor |
|-----------|-------|
| **API Endpoint** | `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent` |
| **Modelo** | `gemini-2.0-flash` |
| **API Version** | `v1` (estable) |
| **Runtime** | Deno (Supabase Edge Functions) |
| **JWT Verification** | Deshabilitado (`verify_jwt = false` en `config.toml`) |

### 24.2 Secrets Requeridos (Supabase)

```bash
GEMINI_API_KEY          # API key de Google AI Studio
SUPABASE_URL            # URL del proyecto Supabase
SUPABASE_SERVICE_ROLE_KEY  # Service role key (acceso completo a DB)
```

### 24.3 Funciones

| Función | Propósito | Secrets |
|---------|-----------|---------|
| `inventory-oracle` | Predicciones de stock y recomendaciones de restock | Todos |
| `dashboard-intelligence` | Insights de negocio para el panel admin | `GEMINI_API_KEY` |
| `customer-intelligence` | Multi-acción: NLP, WhatsApp copy, loyalty, supplier messages | Todos |
| `voice-intelligence` | Procesamiento de lenguaje natural → queries de búsqueda | `GEMINI_API_KEY` |
| `product-intelligence` | Generación de descripciones y copy de productos | `GEMINI_API_KEY` |
| `loyalty-intelligence` | Análisis de patrones de lealtad y retención | Todos |
| `customer-narrative` | Narrativas contextuales de clientes | Todos |
| `bundle-intelligence` | Sugerencias de bundles de productos | Todos |
| `embeddings-processor` | Embeddings vectoriales (`text-embedding-004`, usa `v1beta`) | `GEMINI_API_KEY` |

### 24.4 Despliegue

```bash
# Desplegar una función específica
npx supabase functions deploy inventory-oracle --project-ref <PROJECT_REF>

# Desplegar todas las funciones
npx supabase functions deploy --project-ref <PROJECT_REF>
```

### 24.5 Historial de Migraciones

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2026-03-15 | `v1beta` → `v1` | Endpoint v1beta deprecado para gemini-1.5-flash |
| 2026-03-15 | `gemini-1.5-flash` → `gemini-2.0-flash` | Modelo 1.5 completamente retirado |
| 2026-03-15 | Eliminado `responseMimeType` de `generationConfig` | Parámetro no soportado en API v1 |

> **Nota:** `embeddings-processor` usa `v1beta` para `text-embedding-004` (el modelo de embeddings lo requiere).
