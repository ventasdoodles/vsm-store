# VSM Store - Deep Technical Analysis

> **Generated for AI Context**
> **Date:** 2026-02-16
> **Repository:** `https://github.com/ventasdoodles/vsm-store`
> **Production URL:** `https://vsm-store.pages.dev`
> **Hosting:** Cloudflare Pages (Frontend), Supabase (Backend)

---

## 1. Project Identity & Infrastructure

**VSM Store** is a specialized e-commerce PWA for Vape and Cannabis products, serving the Mexican market.

### Infrastructure Stack

- **Frontend Hosting:** Cloudflare Pages (Auto-deploys from `main` branch).
- **Backend:** Supabase (PostgreSQL 15+).
- **Database URL:** `https://cvvlorbiwtuhkxolhfie.supabase.co`
- **Auth Provider:** Supabase Auth (Email/Password).
- **Storage:** Supabase Storage (Buckets for product images).

### Environment Variables

Required in `.env`:

- `VITE_SUPABASE_URL`: API Endpoint.
- `VITE_SUPABASE_ANON_KEY`: Public API Key.

---

## 2. Database Architecture (Supabase / PostgreSQL)

The database schema is defined in `supabase/migrations/` and enforces business logic via SQL Triggers and RLS.

### 2.1 Core Tables & Schema

#### `products`

The central catalog table.

- **Primary Key:** `id` (UUID).
- **Categorization:**
  - `section` (ENUM: `'vape'`, `'420'`): Top-level split.
  - `category_id` (UUID): Reference to `categories`.
- **Status Flags:** `is_active`, `is_featured`, `is_new`, `is_bestseller`.
- **Inventory:** `stock` (Integer).
- **Search:** `tags` (Text array) for flexible keyword matching.

#### `categories`

Hierarchical category tree.

- **Structure:** Adjacency List pattern (`parent_id` references `id`).
- **Scope:** Scoped by `section` (a 'vape' category cannot be parent of '420').
- **Navigation:** Uses `slug` unique constraint per section for clean URLs (e.g., `/vape/liquidos`).

#### `orders` & `items`

- **Storage:** Hybrid Relational + JSONB.
  - Top-level columns for queryable data: `status`, `total`, `customer_id`.
  - **`items` (JSONB):** Stores the snapshot of products at time of purchase. This prevents historical order data from changing if product prices/names change later.
- **Identity:** Uses readable `order_number` (e.g., "VSM-0001") generated via PL/pgSQL function.

#### `customer_profiles`

Extension of `auth.users`.

- **Relation:** 1:1 with `auth.users`.
- **Sync:** Managed via Trigger (if implemented) or Client-side logic in `AuthContext`.
- **Logic:** Tracks `total_spent` and `total_orders` to automatically calculate `customer_tier` ('bronze', 'silver', 'gold', 'platinum').

### 2.2 Critical Database Logic (Triggers)

1. **`trg_set_order_number`**:
    - **Event:** `BEFORE INSERT ON orders`.
    - **Action:** meaningful ID generation (`generate_order_number()`).
2. **`trg_update_customer_stats`**:
    - **Event:** `AFTER UPDATE ON orders`.
    - **Condition:** When status becomes `'delivered'`.
    - **Action:** Recalculates user's total spend and upgrades their Tier automatically.

### 2.3 Security (Row Level Security - RLS)

- **Public Read:** `products` (active only), `categories`, `store_settings`.
- **User Scoped:** `orders`, `addresses`, `customer_profiles` (Users can only see/edit their own rows via `auth.uid() = customer_id`).
- **Admin Access:**
  - Table `admin_users` defines elevated privileges.
  - Policies check `EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())` to bypass user scoping and allow full CRUD.

---

## 3. Application Architecture

### 3.1 Directory Strategy (`src/`)

The codebase follows a **Feature-First** capability driven by a strict **Service-Layer Pattern**.

- **`components/`**: Pure UI.
  - `admin/`: Isolated Admin UI methodology.
  - `products/`, `cart/`: Domain-specific UI.
- **`services/`**: The **ONLY** place `supabase.from()` is called.
  - *Rule:* Components never query Supabase directly.
  - *Example:* `products.service.ts` handles querying, filtering (`.eq`, `.in`), and pagination.
- **`hooks/`**: React Query wrappers.
  - *Why:* To decouple Data Fetching from UI rendering and manage caching/loading states globally.
  - *Pattern:* `useProducts`, `useSearch`.
- **`stores/`**: Client-side Global State (Zustand).
  - `cart.store.ts`: Handles shopping cart, persistence to `localStorage`, and logic like "add to cart" functionality.

### 3.2 State Management Map

| State Type | Solution | Implementation |
| :--- | :--- | :--- |
| **Server Data** | TanStack Query | Caches API responses (Products, Categories). Auto-revalidates. |
| **Auth State** | React Context | `AuthContext` wraps app. Listen to `onAuthStateChange`. |
| **UI/Cart** | Zustand | `useCartStore` (Persisted). `useUIStore` (Sidebar toggles). |
| **Form State** | Local/React Hook Form | Managing inputs in Checkout/Login. |

### 3.3 Routing & Navigation

- **Router:** `react-router-dom` v6.
- **Lazy Loading:** Critical for performance. Admin pages are bundled separately.
- **Route Guards:**
  - `ProtectedRoute`: Checks `useAuth().isAuthenticated` for User Dashboard.
  - `AdminGuard`: Checks `admin.service.checkIsAdmin()` for `/admin/*` routes.
- **Dynamic Slugs:**
  - `/vape/:slug` & `/420/:slug` use `SectionSlugResolver` to determine if the slug is a Category or a Product dynamically, allowing cleaner URLs.

---

## 4. Key Workflows & Features

### 4.1 The Cart & Checkout

- **Persistence:** `cart.store.ts` uses `persist` middleware. Cart survives page reloads.
- **Checkout:**
    1. User fills address/details.
    2. **No Payment Gateway (MVP):** Order is created with status `pending`.
    3. **WhatsApp Handover:** System generates a formatted WhatsApp string (`site.ts`) and redirects user to WhatsApp API to finalize with an agent.

### 4.2 Authentication Flow

1. User signs up via Email/Pass.
2. `AuthContext` catches the session.
3. Effect triggers `authService.getCustomerProfile`.
4. If profile missing, create default. If present, load into Context.

### 4.3 Search with Debounce

- **Component:** `SearchBar`.
- **Hook:** `useSearch` (wraps `search.service.ts`).
- **Logic:** `ilike` query against `name` and `short_description`. Triggers only after user stops typing.

---

## 5. Deployment & DevOps

### Version Control

- **Convention:** Standard Git.
- **Remote:** GitHub.
- **Structure:** Monorepo-ish (Store + Admin in same codebase, same Supabase instance).

### Deployment (Cloudflare Pages)

- **Build Command:** `npm run build` -> `tsc && vite build`.
- **Output Dir:** `dist`.
- **Trigger:** Push to `main`.

### Testing

- **Framework:** Vitest (implied by `vite.config.ts` references).
- **Status:** Minimal. Focus is currently on Feature dev.

---

## 6. Recommendations for AI Agents

When working on this codebase:

1. **Respect the Layers:** Do not import `supabase` in components. Create a Service method, then a Hook.
2. **Type Safety:** Always update `src/types/database.types.ts` or domain types if Schema changes.
3. **Mobile First:** Tailwind classes must prioritize mobile (`w-full`) then MD/LG (`md:w-1/2`).
4. **Admin Awareness:** If modifying global styles (`index.css`), ensure it doesn't break the isolated Admin Layout.
