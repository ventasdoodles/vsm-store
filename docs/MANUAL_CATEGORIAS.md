# Manual de Usuario: Módulo de Categorías (Admin Panel)

El módulo de Categorías organiza todo el catálogo de VSM Store en una estructura de árbol. Piénsalo como los "cajones" donde van los productos — si los cajones están bien organizados, la tienda funciona mejor.

---

## 1. ¿Qué es una Categoría?

Una categoría es una agrupación de productos. Tienen dos niveles:

- **Categoría principal (raíz)**: Ejemplo — "Líquidos", "Mods", "Vaporizers"
- **Subcategoría (hijo)**: Ejemplo — "Base Libre" y "Sales" son hijos de "Líquidos"

Cada categoría pertenece a una **sección**: `Vape` o `420`. Las subcategorías siempre heredan la sección de su padre.

---

## 2. Panel Principal

### Cabecera (CategoriesHeader)
En la parte superior encontrarás:
- **Contadores**: Cuántas categorías principales, subcategorías y 🔥 populares existen.
- **Filtro de sección**: Botones para ver **Todas**, solo **Vape**, o solo **420**.
- **Botón "Nueva"**: Abre el panel lateral para crear una categoría raíz.

### Árbol de Categorías
Cada fila del árbol muestra:
- **▶ / ▼** Botón para expandir o colapsar los hijos
- **Thumbnail**: Imagen pequeña de la categoría (si tiene `image_url` configurada)
- **🔥 Llama**: Badge naranja si la categoría está marcada como Popular/Trending
- **Nombre** y **badge de sección** (solo en raíces)
- **Descripción** (preview truncado en gris, si existe)
- **(N)** Contador de subcategorías
- **Acciones** (visibles al pasar el cursor): Toggle activo, Editar, Agregar subcategoría, Eliminar

---

## 3. Crear una Categoría

### Categoría Principal
1. Haz clic en **"Nueva"** (botón arriba a la derecha).
2. Se abre el **panel lateral** desde la derecha.
3. Llena los campos (ver sección 5).
4. Haz clic en **"Crear categoría"**.

### Subcategoría
1. Pasa el cursor sobre una categoría **raíz**.
2. Haz clic en el ícono **"+"** que aparece en las acciones.
3. El panel se abre preconfigurado con esa categoría como padre y su sección bloqueada.
4. Solo necesitas escribir el nombre y personalizar lo que desees.

---

## 4. Editar una Categoría

1. Pasa el cursor sobre cualquier categoría (raíz o hijo).
2. Haz clic en el ícono de **lápiz** (✏️).
3. El panel lateral se abre con todos los datos actuales precargados.
4. Modifica lo que necesites y haz clic en **"Guardar cambios"**.

> **Nota:** Si editas el slug manualmente, asegúrate de que sea único dentro de su sección. Un slug duplicado causará un error de base de datos.

---

## 5. Campos del Formulario (Panel Lateral)

| Campo | Obligatorio | Descripción |
|---|---|---|
| **Nombre** | ✅ | Nombre de la categoría como aparece en la tienda |
| **Slug** | ✅ | URL friendly, se auto-genera al escribir el nombre. Editable manualmente |
| **Sección** | ✅ | `Vape` o `420`. Bloqueado en subcategorías (hereda del padre) |
| **Categoría padre** | No | Convertir en subcategoría de otra raíz. Bloqueado si se creó desde el botón "+" |
| **Descripción** | No | Texto opcional para describir la categoría. Puede usarse en menús o para SEO |
| **URL de imagen** | No | Imagen de portada o thumbnail. Se muestra preview inmediato al pegar la URL |
| **Popular / Trending** | No | Toggle. Activo = muestra badge 🔥 en la tienda y en el árbol del admin |
| **Activa** | — | Toggle. Inactiva = oculta de la tienda. Default: activa |
| **Orden** | No | Número de posición en el menú. Menor número = aparece primero |

---

## 6. Popular / Trending 🔥

El toggle **Popular** es una forma de destacar categorías sin alterar su estructura. Cuando una categoría está marcada como popular:

- Aparece el badge 🔥 en la fila del árbol (admin)
- La tienda puede usarlo para mostrar llamas en el menú de navegación o en la home
- El contador de populares aparece en la cabecera del módulo

**¿Cuándo usarlo?**
- Para destacar una categoría en temporada alta ("Sales" antes del verano)
- Para guiar al cliente hacia productos con mayor margen
- Para indicar tendencias recientes

---

## 7. Imagen de Categoría

El campo `URL de imagen` acepta cualquier URL pública de imagen (JPG, PNG, WebP). Se usa como:

- **Thumbnail** en el árbol del admin (cuadro 32×32px)
- **Banner** o imagen de fondo en páginas de categoría (si el diseño de la tienda lo soporta)
- **Megamenú** — si en el futuro el menú de navegación muestra imágenes por categoría

> **Recomendación de tamaño**: Mínimo 400×300px. Para thumbnails perfectos, imágenes cuadradas (1:1).

---

## 8. Desactivar vs. Eliminar

| Acción | Qué hace | Reversible |
|---|---|---|
| **Toggle Inactivo** | Oculta la categoría y sus productos de la tienda | ✅ Sí, reactiva con el mismo toggle |
| **Eliminar** | Desactiva la categoría en base de datos (`soft delete`) | ✅ Sí, con SQL desde Supabase |

> Eliminar una categoría padre **desactiva también sus subcategorías**. Los productos asignados a ella no se eliminan, pero quedarán huérfanos hasta reasignarlos.

---

## 9. Slugs y URLs

El slug es la parte de la URL que identifica la categoría en la tienda:

```
vsm-store.com/vape/liquidos        ← slug: "liquidos"
vsm-store.com/vape/liquidos/sales  ← slug: "sales" (hijo de "liquidos")
```

**Reglas del slug:**
- Solo letras minúsculas, números y guiones (`-`)
- Único por sección (puedes tener "accesorios" en Vape y "accesorios" en 420)
- Se auto-genera al escribir el nombre, pero es editable

---

## 10. Orden del Menú

El campo **Orden** (`order_index`) controla en qué posición aparece la categoría en el menú de la tienda:

- **0** o el número más bajo = primera posición
- Si dos categorías tienen el mismo número, se ordena alfabéticamente
- Las subcategorías tienen su propio orden independiente dentro de su padre

**Ejemplo práctico (sección Vape):**

| Orden | Categoría |
|---|---|
| 1 | Mods |
| 2 | Atomizadores |
| 3 | Líquidos |
| 4 | Coils |
| 5 | Accesorios Vape |

---

## 11. Arquitectura del Módulo (Para Devs)

El módulo está construido con filosofía **Lego** — cada pieza es independiente:

```
src/pages/admin/AdminCategories.tsx         ← Orchestrator (~140 líneas)
src/components/admin/categories/
  ├── CategoriesHeader.tsx                  ← Cabecera con stats + tabs + botón
  ├── CategoryForm.tsx                      ← Panel deslizante de crear/editar
  └── CategoryTreeNode.tsx                  ← Fila recursiva del árbol
src/services/admin/admin-categories.service.ts
src/types/category.ts
```

**Campos en DB (`categories` table):**

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK auto-generada |
| `name` | TEXT | Nombre |
| `slug` | TEXT | URL friendly (UNIQUE por sección) |
| `section` | ENUM | `vape` \| `420` |
| `parent_id` | UUID | FK a categories(id) — null = raíz |
| `description` | TEXT | Descripción opcional |
| `image_url` | TEXT | URL de imagen (añadido en `20260223_enhance_categories.sql`) |
| `is_popular` | BOOLEAN | Badge trending (añadido en `20260223_enhance_categories.sql`) |
| `order_index` | INTEGER | Posición en menú |
| `is_active` | BOOLEAN | Visibilidad en tienda |
| `created_at` | TIMESTAMPTZ | Auto |
