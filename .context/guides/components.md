# 🧩 Guía de Componentes React

## Convenciones

### Estructura de un componente

```tsx
// Descripción breve - VSM Store
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Props interface
interface MiComponenteProps {
  titulo: string;
  variante?: 'vape' | 'herbal';
  className?: string;
}

// Named export (NO default export)
export function MiComponente({ titulo, variante = 'vape', className }: MiComponenteProps) {
  const [estado, setEstado] = useState(false);

  return (
    <div className={cn('base-classes', className)}>
      {/* Contenido */}
    </div>
  );
}
```

### Reglas

1. **Named exports** — `export function X` (nunca `export default`)
2. **Props interface** — Siempre definir interface para props
3. **className** — Siempre aceptar `className?` opcional para composición
4. **cn()** — Usar `cn()` para combinar clases condicionalmente
5. **Comentarios** — En español para lógica de negocio
6. **Un componente por archivo** — Excepto componentes internos pequeños

### Organización

| Carpeta | Contenido |
|---------|-----------|
| `components/layout/` | Header, Footer, Layout, Sidebar |
| `components/products/` | ProductCard, ProductGrid, ProductDetail |
| `components/ui/` | Button, Input, Modal, Badge (reutilizables) |
| `pages/` | Componentes de página completa |

### Imports

```tsx
// 1. React/libs externas
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. Componentes internos
import { Button } from '@/components/ui/Button';

// 3. Hooks, lib, types
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/product';
```
