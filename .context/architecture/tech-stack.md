# 🛠️ Tech Stack

## Core

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.3.x | UI library |
| TypeScript | 5.3.x | Tipado estático (strict mode) |
| Vite | 5.1.x | Build tool / Dev server |
| Tailwind CSS | 3.4.x | Estilos utility-first |

## Data & Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Supabase | 2.39.x | BaaS (Auth, DB, Storage) |
| React Query | 5.17.x | Cache & estado del servidor |

## UI & Utilidades

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React Router | 6.22.x | Routing SPA |
| Lucide React | 0.344.x | Iconos SVG |
| clsx | 2.1.x | Class names condicionales |

## Dev Tools

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| PostCSS | 8.4.x | Procesador CSS |
| Autoprefixer | 10.4.x | Prefijos CSS automáticos |

## Decisiones Técnicas

- **¿Por qué Vite?** — HMR ultra rápido, configuración mínima, soporte nativo TS
- **¿Por qué Tailwind?** — Velocidad de desarrollo, consistencia, dark mode fácil
- **¿Por qué Supabase?** — Postgres completo, auth integrada, storage, RLS
- **¿Por qué React Query?** — Cache automático, stale-while-revalidate, devtools
- **¿Por qué clsx?** — Ligero (292B) vs tailwind-merge (~5KB) para este proyecto
