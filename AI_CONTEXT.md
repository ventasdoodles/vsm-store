# 🧠 VSM STORE - AI PROJECT CONTEXT & HANDOFF GUIDE

Este documento es la fuente de verdad absoluta para cualquier IA que retome este proyecto. Contiene la arquitectura profunda, decisiones de diseño y el "ADN" técnico de VSM Store.

---

## 🚀 1. TECH STACK & CORE PHILOSOPHY

- **Core**: React 18 (Vite) + TypeScript.
- **Backend-as-a-Service**: Supabase (PostgreSQL + RLS + Auth).
- **Styling**: Tailwind CSS + Vanilla CSS Variables (Thematic System).
- **State**:
  - **Server-State**: TanStack Query v5 (Caché, Fetching, Mutaciones).
  - **Client-State**: Zustand (Carrito persistente, UI simple).
- **Routing**: React Router v6.

---

## 🏗️ 2. ARCHITECTURE LAYERS

El proyecto sigue un flujo de datos unidireccional pero desacoplado:

1. **Database**: Supabase Tables + RLS (Row Level Security).
2. **Services** (`src/services/`): Abstracción pura de Supabase.
    - *Note*: Los servicios de administración están modularizados en `src/services/admin/`.
3. **Hooks wrappers** (`src/hooks/`): Wrappers de `@tanstack/react-query` que consumen los servicios.
4. **Components**: Consumen los hooks. Las páginas (`src/pages/`) son composiciones de componentes.

---

## 🎨 3. DESIGN SYSTEM: "PREMIUM GLASSMORPHISM"

El look visual es crítico ("Wow factor"). No es solo Tailwind plano; es un sistema híbrido.

### A. Variables Semánticas (`src/index.css`)

- **Glassmorphism**: Usa `.glass-premium`. No uses `bg-white` para tarjetas.
- **Thematic Sections**:
  - **Vape**: Azul (`vape-500`). Usa `.glow-vape`.
  - **420 / Herbal**: Verde (`herbal-500`). Usa `.glow-herbal`.
- **Spotlight**: Muchos componentes usan `.spotlight-container` para efectos de borde al hacer hover.

### B. Tokens Críticos

- `rounded-[2.5rem]`: Estándar para contenedores grandes (Tarjetas de Home, Contacto, etc).
- `font-black text-white italic uppercase tracking-tighter`: Estilo para headers de impacto.
- `bg-noise`: Clase en el body o contenedores principales para añadir textura.

---

## 🚦 4. ROUTING & DATA DYNAMICS

### Section & Slug Resolver

El catálogo se divide en `vape` y `420`.

- **`SectionSlugResolver.tsx`**: Maneja rutas como `/vape/:slug`.
- **Lógica de Resolución**: Intenta cargar el slug como **Categoría** primero. Si existe, renderiza `CategoryPage`. Si no, asume que es un **Producto** y renderiza `ProductDetail`.

### Admin vs Storefront

- **Detección**: `App.tsx` usa `location.pathname.startsWith('/admin')`.
- **Layout**: El Admin usa un layout totalmente separado (`AdminLayout`) sin elementos del storefront (ni carrito, ni floating buttons).

---

## 📦 5. KEY PROJECT STRUCTURE

- `src/components/ui/`: Componentes base (Botones premium, OptimizedImage).
- `src/services/admin/`: Servicios modulares para el panel (admin-products, admin-orders, admin-customers con "God Mode").
- `src/stores/`: Zustand stores. `cart.store.ts` maneja la persistencia y validación contra stock real.
- `src/types/`: Definiciones estrictas de TypeScript. No uses `any`.

---

## 🛠️ 6. AI WORKFLOWS (HOW TO)

### ¿Cómo agregar una sección a la Home?

1. Crea el componente en `src/components/home/`.
2. Regístralo en `src/pages/Home.tsx` envolviéndolo en un `SectionErrorBoundary`.
3. Mantén el espaciado modular (`my-12` o `my-20`).

### ¿Cómo manejar datos?

- **Lectura**: Siempre crea un hook en `src/hooks/` que use `useQuery`.
- **Escritura**: Usa `useMutation` e invalida las queries en `onSuccess`.

---

## ⚠️ 7. AI INSTRUCTIONS (DOs & DON'Ts)

- **DO**: Revisar siempre `src/index.css` antes de proponer nuevos estilos complejos.
- **DO**: Usar `cn` de `@/lib/utils` para composición de clases.
- **DO**: Mantener la estética premium (sombras profundas, desenfoque de fondo, degradados suaves).
- **DON'T**: Ignorar lints de "unused variables". El build debe estar 100% limpio.
- **DON'T**: Crear hooks que llamen a Supabase directamente; usa la capa de `services`.

---

## 🚩 8. CURRENT STATUS

El proyecto ha superado el MVP básico y está en fase de **Refinamiento Premium**.

- ✅ Arquitectura modularizada.
- ✅ Sistema de diseño premium implementado.
- ✅ Admin Panel completo con gestión de clientes y monitoreo.
- 🔄 Próximo: Optimización de carga (Lighthouse 90+) y pasarela de pago real.

---
*Documento generado por Antigravity. El futuro asistente debe leer este archivo antes de cualquier intervención.*
