# VSM STORE - ESTADO DEL PROYECTO

**Fecha:** 23 febrero 2026  
**Tiempo invertido:** ~16 horas  
**Deploy:** <https://vsm-store.pages.dev>

---

## ✅ COMPLETADO (100%)

### Bloque 1: Foundation

- React 18 + TypeScript + Vite 5 + Tailwind CSS 3
- Sistema `.context/` con documentación
- Layout base (Header, Footer)
- Rutas configuradas con React Router
- Git inicializado

### Bloque 2: Base de Datos

- Supabase configurado y conectado
- 13 categorías (5 Vape, 6 420, 2 subcategorías: Base Libre, Sales)
- 40 productos seed data
- Schema completo con RLS
- Tipos TypeScript sincronizados

### Bloque 3: Frontend Conectado

- Servicios: `products.service.ts`, `categories.service.ts`, `search.service.ts`
- Hooks React Query: `useProducts`, `useCategories`, `useSearch`
- Componentes UI: `ProductCard`, `ProductGrid`, `LoadingSkeleton`
- Home page con productos reales de Supabase
- Toggle Todos/Vape/420 funcional

### Bloque 4: Navegación Completa

- Página `ProductDetail` con galería de imágenes
- `SectionSlugResolver` (auto-detecta categorías vs productos)
- `CategoryPage` con soporte para subcategorías (muestra cards hijos o productos)
- Breadcrumbs dinámicos: Inicio > Sección > Categoría > Producto
- Menú dropdown de categorías en Header (hover desktop, inline móvil)
- Búsqueda en tiempo real con debounce

### Fase 1: Carrito y Configuración

- Logo VSM real integrado
- Carrito funcional con Zustand
- Persistencia en localStorage
- CartSidebar deslizable
- Checkout form con WhatsApp
- Archivo `site.ts` con configuración centralizada

### Fase 2: Admin Panel (Arquitectura de Legos)

- **Customers CRM:** Refactorizado a componentes modulares (Stats, Table, Details).
- **Coupons Module:** Refactorizado a componentes modulares (Stats, Card, Form).
  - Superpoderes: Magic Link (`/?coupon=CODE`) y Duplicar Cupón.
- **Settings Module:** Configuración dinámica desde base de datos (`store_settings`).
  - Gestión de Hero Sliders (Home).
  - Configuración del Programa de Lealtad (puntos por moneda, etc.).
- **Storefront Integrado:** `MegaHero` y `CheckoutForm` consumen configuración dinámica de la BD.

### Deploy

- **GitHub:** ventasdoodles/vsm-store
- **Cloudflare Pages:** vsm-store.pages.dev
- SSL automático
- Variables de entorno configuradas

---

## ⚠️ PENDIENTE

### Issue Menor: Carrito Sidebar

Productos se agregan pero no muestran imagen/nombre visualmente en sidebar.  
**Fix estimado:** 5 minutos

### Tareas Restantes (~11 horas disponibles)

#### 🔴 Alta Prioridad

| Tarea | Estimado |
|-------|----------|
| Admin Panel (auth, CRUD productos/categorías, upload imágenes) | 3-4 horas |
| PWA (manifest, service worker, iconos, instalable) | 1 hora |
| Dominio custom (conectar vsm.app, DNS) | 30 min |

#### 🟡 Media Prioridad

| Tarea | Estimado |
|-------|----------|
| Imágenes reales de productos (upload a Supabase Storage) | 1 hora |
| Filtros avanzados (sidebar en CategoryPage: marca, tamaño, concentración) | 1 hora |
| Animaciones y polish (micro-interacciones, transiciones) | 1 hora |

#### 🟢 Baja Prioridad

| Tarea | Estimado |
|-------|----------|
| Analytics | 30 min |
| SEO mejorado | 30 min |
| Testing | 1 hora |

---

## 🏗️ ARQUITECTURA TÉCNICA

### Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS 3 |
| Backend | Supabase (PostgreSQL + Storage) |
| State (cliente) | Zustand (carrito) |
| State (servidor) | React Query / TanStack Query |
| Deploy | Cloudflare Pages |
| Git | GitHub |

### Estructura de Carpetas

```
src/
├── components/
│   ├── cart/         CartButton, CartSidebar, CheckoutForm
│   ├── categories/   CategoryCard
│   ├── layout/       Header, Footer, Layout
│   ├── products/     ProductCard, ProductGrid, ProductImages, ProductInfo, RelatedProducts
│   ├── search/       SearchBar
│   └── ui/           LoadingSkeleton
├── config/           site.ts (configuración centralizada)
├── hooks/            useProducts, useCategories, useSearch
├── lib/              supabase.ts, utils.ts
├── pages/            Home, ProductDetail, CategoryPage, SearchResults, SectionSlugResolver, NotFound
├── services/         products.service.ts, categories.service.ts, search.service.ts
├── stores/           cart.store.ts (Zustand)
└── types/            product.ts, category.ts, cart.ts
```

### Base de Datos (Supabase)

**URL:** `https://cvvlorbiwtuhkxolhfie.supabase.co`

**Tablas:**

- `categories` (13 filas) — jerarquía con `parent_id`
- `products` (40 filas) — con `category_id`, `section`, `tags`, `status`

**Enums:**

- `section_type`: `'vape'` | `'420'`
- `product_status`: `'active'` | `'legacy'` | `'discontinued'` | `'coming_soon'`

### Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | Home | Página principal con toggle sección |
| `/buscar?q={query}` | SearchResults | Resultados de búsqueda |
| `/vape/:slug` | SectionSlugResolver | Categoría o producto vape |
| `/420/:slug` | SectionSlugResolver | Categoría o producto 420 |
| `*` | NotFound | Página 404 |

### Variables de Entorno (`.env`)

```
VITE_SUPABASE_URL=https://cvvlorbiwtuhkxolhfie.supabase.co
VITE_SUPABASE_ANON_KEY={ver en Supabase dashboard}
```

### Configuración del Sitio (`src/config/site.ts`)

- WhatsApp: número configurable
- Template mensaje pedido
- Ubicación física
- Redes sociales
- Moneda y locale

---

## 🛠️ COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build local
npm run preview

# TypeScript check
npx tsc --noEmit

# Git
git status
git add .
git commit -m "mensaje"
git push origin main

# Deploy automático:
# Push a GitHub → Cloudflare Pages auto-deploys
```

---

## 📋 PRÓXIMOS PASOS RECOMENDADOS

1. Fix carrito sidebar (5 min)
2. Admin panel básico (3 horas)
3. PWA setup (1 hora)
4. Imágenes reales (1 hora)
5. Dominio vsm.app (30 min)

---

## 📝 NOTAS IMPORTANTES

- Categorías padre (ej. Líquidos) muestran subcategorías como cards clickeables, no productos mezclados
- `SectionSlugResolver` detecta automáticamente si un slug es categoría o producto
- Carrito persiste en `localStorage` vía Zustand persist middleware
- Mensaje WhatsApp se genera con template de `site.ts`
- Build de Vite genera carpeta `dist/`
- Cloudflare Pages sirve desde `dist/`
- El `categoryId` en `products.service.ts` acepta `string | string[]` (`.eq()` o `.in()`)

---

## 📞 CONTACTO Y RECURSOS

| Recurso | URL |
|---------|-----|
| GitHub Repo | <https://github.com/ventasdoodles/vsm-store> |
| Deploy URL | <https://vsm-store.pages.dev> |
| Supabase Dashboard | <https://supabase.com/dashboard/project/cvvlorbiwtuhkxolhfie> |

**Herramientas usadas:**

- Antigravity IDE (Opus 4.6 Thinking)
- Claude Sonnet 4.5 (estrategia)
- Visual Studio + Copilot (refinamiento)

**Tiempo total:** 8 horas  
**Tokens eficientes en ambas herramientas**
