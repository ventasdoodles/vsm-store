# 🧩 Template: Crear Componente

> Copia este template y adapta al componente que necesites.

## Prompt para Agente

```
Crea el componente [NOMBRE] en src/components/[CARPETA]/[NOMBRE].tsx

Requisitos:
- Named export (no default)
- Props interface definida
- Acepta className opcional
- Usa cn() para clases condicionales
- Tailwind CSS para estilos
- Mobile-first responsive
- Comentarios en español para lógica de negocio
- Importa tipos de @/types/ si aplica

El componente debe:
- [Descripción funcional]
- [Variantes si aplica: vape | herbal]
- [Estados: loading, error, empty]

Contexto:
- Lee .context/guides/components.md para convenciones
- Lee .context/guides/styling.md para colores y patrones
- Lee .context/state/current.md para estado actual
```

## Ejemplo de uso

```
Crea el componente ProductCard en src/components/products/ProductCard.tsx

Requisitos:
- Recibe un Product como prop
- Muestra imagen, nombre, precio, sección
- Badge de status (Nuevo, Popular, etc)
- Botón "Agregar al carrito"
- Colores según sección (vape=azul, 420=verde)
- Hover con elevación (-translate-y-1)
```
