# 🚀 Template: Crear Feature

> Template para implementar una feature completa.

## Prompt para Agente

```
Implementa la feature [NOMBRE] para VSM Store.

Contexto:
- Lee .context/state/current.md para estado actual
- Lee .context/architecture/overview.md para visión general
- Lee .context/guides/components.md y styling.md para convenciones

La feature necesita:

### Tipos (src/types/)
- [Tipos/interfaces necesarios]

### Hooks (src/hooks/)
- [Custom hooks con React Query si aplica]

### Componentes (src/components/)
- [Lista de componentes a crear]

### Páginas (src/pages/)
- [Páginas nuevas si aplica]

### Rutas (src/App.tsx)
- [Rutas nuevas si aplica]

### Base de datos (supabase/)
- [Migraciones si aplica]

Criterio de éxito:
- [ ] Feature funciona end-to-end
- [ ] Sin errores TypeScript
- [ ] Responsive (mobile-first)
- [ ] Actualizar .context/state/current.md al terminar
```

## Ejemplo

```
Implementa la feature "Listado de Productos" para VSM Store.

La feature necesita:

### Hooks
- useProducts(section?, categorySlug?) — query con filtros
- useCategories(section?) — query categorías

### Componentes
- ProductCard — card individual
- ProductGrid — grid responsive con loading states
- CategoryFilter — sidebar de filtros por categoría

### Páginas
- CategoryPage — /vape/:category y /420/:category

### Rutas
- /vape/:category → CategoryPage
- /420/:category → CategoryPage
```
