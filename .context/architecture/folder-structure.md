# 📁 Estructura de Carpetas

```
vsm-store/
├── .context/              → Documentación para agentes/devs
│   ├── architecture/      → Decisiones técnicas
│   ├── guides/            → Convenciones de código
│   ├── state/             → Estado actual del proyecto
│   └── prompts/           → Templates para crear cosas
├── src/
│   ├── components/        → Componentes React
│   │   ├── layout/        → Header, Footer, Layout
│   │   ├── products/      → Componentes de productos
│   │   └── ui/            → Componentes UI reutilizables
│   ├── pages/             → Páginas/rutas
│   ├── lib/               → Utilidades y clientes externos
│   ├── types/             → Tipos TypeScript
│   └── hooks/             → Custom hooks
├── public/                → Archivos estáticos
├── supabase/              → Migraciones y configuración
└── [config files]         → Vite, Tailwind, TypeScript, etc.
```

## Convenciones de Nombres

| Tipo | Patrón | Ejemplo |
|------|--------|---------|
| Componente | PascalCase.tsx | `ProductCard.tsx` |
| Hook | camelCase.ts | `useProducts.ts` |
| Utilidad | camelCase.ts | `formatPrice.ts` |
| Tipo | camelCase.ts | `product.ts` |
| Página | PascalCase.tsx | `Home.tsx` |
| Constante | UPPER_SNAKE | `VAPE_CATEGORIES` |

## Imports

Se usa el alias `@/` que mapea a `./src/`:

```tsx
import { Header } from '@/components/layout/Header';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
```
