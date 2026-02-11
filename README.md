# VSM Store 🌿💨

E-commerce dual para productos de **Vape** y **420** (cannabis/herbal).

## Quick Start

```bash
# Instalar dependencias
npm install

# Iniciar dev server
npm run dev

# Type check
npm run lint

# Build producción
npm run build
```

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** — Dev server + bundler
- **Tailwind CSS** — Utility-first styling
- **Supabase** — Auth, Database, Storage
- **React Query** — Server state management
- **React Router** — Client-side routing
- **Lucide React** — Icons

## Estructura

```
src/
├── components/     → Componentes React
│   ├── layout/     → Header, Footer, Layout
│   ├── products/   → Componentes de productos
│   └── ui/         → Componentes UI reutilizables
├── pages/          → Páginas/rutas
├── lib/            → Utilidades y clientes
├── types/          → TypeScript interfaces
└── hooks/          → Custom hooks
```

## Configuración

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## Documentación

Revisa `.context/` para documentación completa del proyecto:

- `.context/architecture/` — Decisiones técnicas
- `.context/guides/` — Convenciones de código
- `.context/state/` — Estado actual del desarrollo

## Secciones

| Sección | Categorías |
|---------|-----------|
| 💨 Vape | Mods, Atomizadores, Líquidos, Coils, Accesorios |
| 🌿 420 | Vaporizers, Fumables, Comestibles, Concentrados, Tópicos, Accesorios |

## License

Private © VSM Store
