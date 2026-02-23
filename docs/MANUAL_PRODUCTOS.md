# Manual de Usuario: Módulo de Productos (Admin Panel)

Bienvenido al manual del **Módulo de Productos** de VSM Store. Aquí es donde vive todo tu catálogo. Desde crear nuevos productos hasta ajustar precios y stock en segundos, este módulo es tu herramienta principal de gestión.

---

## 1. ¿Qué es el Módulo de Productos?

Es tu catálogo digital. Cada producto que aparece en la tienda existe aquí. Puedes controlar qué se ve, cómo se ve, a qué precio y con cuánto inventario — todo desde una sola pantalla.

---

## 2. Panel Principal (Los Legos)

El módulo está dividido en componentes modulares e independientes:

### A. Cabecera (ProductsHeader)
En la parte superior encontrarás:
- **Contador de productos**: Muestra cuántos productos cumplen con los filtros activos.
- **Botón "Exportar CSV"** (Superpoder): Descarga un archivo con los productos visibles en pantalla.
- **Botón "Nuevo producto"**: Abre el formulario completo para crear un producto desde cero.

### B. Filtros (ProductsFilter)
Una barra de búsqueda y filtros para encontrar exactamente lo que necesitas:
- **Buscador**: Filtra por nombre del producto o SKU en tiempo real.
- **Filtros de Sección**: Botones para ver **Todos**, solo **Vape**, o solo **420**.
- **Toggle "Inactivos"**: Por defecto los productos desactivados no aparecen. Activa este botón para verlos también (aparecen con menor opacidad en la tabla).

### C. Tabla de Productos (ProductsTable / ProductTableRow)
La tabla principal donde vive todo el catálogo. Cada fila tiene:
- **Imagen + Nombre + Sección + SKU**
- **Precio** (editable con Quick Edit)
- **Stock** con semáforo de color:
  - 🔴 Rojo: Menos de 5 unidades — ¡pon atención!
  - 🟡 Amarillo: Entre 5 y 14 unidades — stock bajo
  - 🟢 Verde: 15 o más — stock saludable
- **Flags** (iconos de estado especial): ⭐ Destacado, ✨ Nuevo, 📈 Bestseller
- **Toggle Activo/Inactivo**: Aparece o desaparece el producto de la tienda instantáneamente
- **Botones de Acción**: Ver, Editar, Quick Edit, Desactivar

---

## 3. Acciones Principales

### Crear un Producto Nuevo
Haz clic en **"Nuevo producto"** (botón azul arriba a la derecha). Se abrirá el formulario completo donde puedes llenar todos los detalles, incluyendo:
- Nombre, descripción, precio, stock, SKU
- Imágenes (drag-and-drop o URL)
- Categoría y sección
- Flags especiales (Destacado, Nuevo, Bestseller)

### Editar un Producto
Haz clic en el ícono de **lápiz con cuadro** (📄) para abrir el formulario completo de edición.

### Ver en la Tienda
Haz clic en el ícono de **ojo** (👁️) para ver cómo luce el producto en la tienda real (se abre en una nueva pestaña).

### Desactivar un Producto
Haz clic en el ícono de **papelera** (🗑️). Te pedirá confirmación. El producto **no se borra** — solo se oculta de la tienda. Puedes volver a activarlo en cualquier momento con el **Toggle Activo/Inactivo**.

---

## 4. Los "Superpoderes" de Productos

### ✏️ Quick Edit (Edición Rápida de Precio y Stock)
- **¿Qué hace?** Sin salir de la lista, puedes editar el precio y el stock de cualquier producto con 2 clics.
- **¿Cómo se usa?**
  1. Haz clic en el ícono de **lápiz simple** (✏️) en la columna de acciones.
  2. Los campos de Precio y Stock de esa fila se convierten en inputs editables.
  3. Modifica los valores y haz clic en el ícono de **guardar** (💾).
  4. O haz clic en la **X** para cancelar sin guardar.
- **¿Para qué sirve?** Para ajustar precios durante promociones o bajar stock sin tener que abrir el formulario completo.

### 📥 Exportación Inteligente (CSV)
- **¿Qué hace?** Descarga un archivo `.csv` con el catálogo completo.
- **¿Por qué es "inteligente"?** Respeta los filtros activos. Si filtras solo "Vape" o buscas un SKU específico, el CSV solo tendrá esos productos.
- **¿Qué incluye?** Nombre, SKU, Sección, Precio, Precio de Comparación, Stock, y todos los flags (Destacado, Nuevo, Bestseller, Activo).
- **¿Para qué sirve?** Para enviarle el catálogo a un proveedor, hacer auditorías de inventario, o armar listas de precios.

### 🏷️ Flags Rápidos (Destacado / Nuevo / Bestseller)
- Activa o desactiva las etiquetas especiales directamente desde la tabla con un clic, sin entrar al editor completo.
- **⭐ Destacado**: El producto aparece en la sección "Destacados" del Home.
- **✨ Nuevo**: Muestra una etiqueta "Nuevo" en la tarjeta del producto.
- **📈 Bestseller**: Muestra una etiqueta "Bestseller" en la tarjeta del producto.

---

## 5. Preguntas Frecuentes

**¿Qué pasa si desactivo un producto que está en el carrito de alguien?**
El producto se ocultará de la tienda, pero si el cliente ya lo tiene en su carrito, aún podrá completar la compra. El validador de carrito (que se ejecuta al cargar la app) lo notificará.

**¿Cuál es la diferencia entre "Editar" (📄) y "Quick Edit" (✏️)?**
- **Editar completo (📄)**: Abre una página nueva con el formulario completo. Úsalo para cambiar la descripción, imágenes, categoría, etc.
- **Quick Edit (✏️)**: Edita precio y stock inline, sin cambiar de pantalla. Ideal para ajustes rápidos de inventario.

**¿Puedo eliminar un producto permanentemente?**
No desde esta interfaz, por seguridad. La "eliminación" siempre es una desactivación (soft delete). Si necesitas borrar un registro permanentemente, hazlo directamente desde el panel de Supabase.

**¿Por qué el stock muestra rojo aunque tengo unidades?**
El umbral rojo es **menos de 5 unidades**. Si ves rojo con 3 o 4 unidades, es correcto. Es una advertencia para que replenishes inventario antes de quedarte sin stock.

---
*Documento generado para VSM Store - Arquitectura Modular (Legos)*
