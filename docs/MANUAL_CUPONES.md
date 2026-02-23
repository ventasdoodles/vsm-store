# Manual de Usuario: Módulo de Cupones (Admin Panel)

Bienvenido al manual de uso del **Módulo de Cupones** de VSM Store. Este módulo te permite crear, gestionar y analizar los códigos de descuento que ofreces a tus clientes.

---

## 1. ¿Qué es el Módulo de Cupones?

Es tu centro de control para todas las promociones. Aquí puedes crear códigos (ej. `VERANO20`), definir cuánto descuentan (porcentaje o cantidad fija), establecer reglas (compra mínima, límite de usos) y ver cuántas veces se han utilizado.

---

## 2. Panel Principal (Dashboard)

Al entrar a la sección de Cupones, verás tres áreas principales:

### A. Estadísticas Globales (Los "Legos" de arriba)
Te dan un resumen rápido de la salud de tus promociones:
- **Activos:** Cupones que los clientes pueden usar ahora mismo.
- **Agotados:** Cupones que llegaron a su límite máximo de usos.
- **Expirados:** Cupones cuya fecha de validez ya pasó.
- **Total Usos:** Cuántas veces se han canjeado cupones en toda la historia de la tienda.

### B. Buscador
Una barra de búsqueda para encontrar rápidamente un cupón por su código (ej. "BUENFIN") o por su descripción.

### C. Grid de Cupones (Las Tarjetas)
Cada cupón se muestra como una tarjeta individual con colores que indican su estado:
- 🟢 **Verde:** Activo y listo para usarse.
- 🔴 **Rojo:** Expirado (la fecha límite pasó).
- 🟡 **Amarillo:** Agotado (se usaron todas las veces permitidas).
- ⚪ **Gris:** Inactivo (lo apagaste manualmente).

---

## 3. ¿Cómo crear un Nuevo Cupón?

1. Haz clic en el botón azul **"+ Nuevo Cupón"** en la esquina superior derecha.
2. Se abrirá un formulario. Llena los siguientes campos:
   - **Código:** La palabra que el cliente escribirá (ej. `BIENVENIDO10`). *Se convertirá a mayúsculas automáticamente.*
   - **Descripción:** (Opcional) Una nota para ti, ej. "Campaña de Instagram de Mayo".
   - **Tipo de Descuento:** 
     - *Porcentaje:* Descuenta un % del total (ej. 10%).
     - *Monto Fijo:* Descuenta una cantidad exacta en pesos (ej. $50 MXN).
   - **Valor:** El número del descuento (el 10 del porcentaje o los 50 del monto fijo).
   - **Compra Mínima:** (Opcional) El cliente debe gastar al menos esta cantidad para que el cupón funcione.
   - **Límite de Usos:** (Opcional) Cuántas veces en total se puede usar este cupón entre todos los clientes. Déjalo en blanco para usos ilimitados.
   - **Fechas de Validez:** (Opcional) Cuándo empieza y cuándo termina la promoción.
3. Haz clic en **"Guardar Cupón"**.

---

## 4. Los "Superpoderes" de las Tarjetas

Cada tarjeta de cupón tiene botones de acción rápida en la parte inferior:

### 🪄 Enlace Mágico (Magic Link)
- **¿Qué hace?** Copia un enlace especial a tu portapapeles (ej. `vsm-store.pages.dev/?coupon=BIENVENIDO10`).
- **¿Para qué sirve?** Si envías este enlace por WhatsApp o lo pones en Instagram, cuando el cliente haga clic, entrará a la tienda y **el cupón se aplicará automáticamente** en su carrito. ¡No tienen que escribir nada!

### 👯 Duplicar Cupón
- **¿Qué hace?** Crea una copia exacta del cupón, pero le añade "_COPIA" al código.
- **¿Para qué sirve?** Si tienes un cupón con reglas complejas (fechas específicas, compra mínima) y quieres hacer uno igual para otra campaña, solo lo duplicas, le cambias el código y listo. Ahorras tiempo.

### ✏️ Editar
- Te permite cambiar cualquier regla del cupón (excepto el código, para evitar problemas con pedidos pasados).

### 🗑️ Desactivar / Eliminar
- Apaga el cupón inmediatamente. Los clientes ya no podrán usarlo, pero el registro se mantiene en tu base de datos para el historial de ventas.

---

## 5. Preguntas Frecuentes

**¿Qué pasa si un cupón llega a su límite de usos?**
El sistema lo marca automáticamente como "Agotado" (tarjeta amarilla) y los clientes ya no podrán aplicarlo en el checkout.

**¿Puedo hacer un cupón solo para un cliente específico?**
Sí. En el formulario de creación, hay una opción avanzada para asignar el cupón a un cliente específico buscándolo por su correo. Solo ese cliente podrá usarlo.

**¿Los cupones aplican al costo de envío?**
No, los cupones de descuento (porcentaje o monto fijo) solo aplican al subtotal de los productos en el carrito.

---
*Documento generado para VSM Store - Arquitectura Modular (Legos)*