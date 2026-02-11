# 🎨 Guía de Estilos - Tailwind CSS

## Colores del Diseño

### Primary (base: Slate)

Uso: fondos, textos, bordes generales

```
primary-950  → bg principal (más oscuro)
primary-900  → bg secciones, cards
primary-800  → bordes
primary-700  → bg hover
primary-500  → texto secundario
primary-400  → texto terciario
primary-200  → texto énfasis
primary-100  → texto principal
```

### Vape (Azul)

Uso: sección Vape, CTA de vape, badges

```
vape-500 (#3b82f6) → color principal
vape-400         → texto/hover
vape-500/20      → bg con transparencia
```

### Herbal (Verde)

Uso: sección 420, CTA de herbal, badges

```
herbal-500 (#10b981) → color principal
herbal-400           → texto/hover
herbal-500/20        → bg con transparencia
```

## Patrones comunes

### Cards

```html
<div class="rounded-2xl border border-primary-800 bg-primary-900/50 p-4 
            hover:border-primary-700 transition-all">
```

### Botones sección

```html
<!-- Vape -->
<button class="bg-vape-500 text-white hover:bg-vape-600 rounded-xl px-6 py-3 font-semibold 
               shadow-lg shadow-vape-500/25 transition-all hover:-translate-y-0.5">

<!-- Herbal -->
<button class="bg-herbal-500 text-white hover:bg-herbal-600 rounded-xl px-6 py-3 font-semibold 
               shadow-lg shadow-herbal-500/25 transition-all hover:-translate-y-0.5">
```

### Contenedor

```html
<div class="container-vsm"> <!-- max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -->
```

## Reglas

1. **Mobile-first** — Siempre diseñar mobile primero, luego `sm:`, `md:`, `lg:`
2. **No CSS modules** — Solo Tailwind, no `.module.css`
3. **Dark by default** — El tema es oscuro, no hay light mode (por ahora)
4. **Transiciones** — Siempre agregar `transition-all` o `transition-colors`
5. **Shadows con color** — `shadow-lg shadow-vape-500/25` (no shadows grises)
