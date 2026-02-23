# Manual de Usuario: Dashboard (Admin Panel)

Bienvenido al manual de uso del **Dashboard** de VSM Store. Este módulo es el "centro de mando" de tu tienda, donde puedes ver de un vistazo cómo van las ventas, qué productos son los más populares y qué pedidos necesitan tu atención.

---

## 1. ¿Qué es el Dashboard?

Es la pantalla principal a la que llegas cuando entras al panel de administración. Su objetivo es darte un resumen rápido y visual de la salud de tu negocio en un periodo de tiempo específico.

---

## 2. Panel Principal (Los Legos)

El Dashboard está construido con diferentes "Legos" (componentes) que te muestran información clave:

### A. Cabecera y Filtros de Fecha
En la parte superior derecha, encontrarás los controles para cambiar el periodo de tiempo que estás analizando:
- **Filtros Rápidos (Presets):** Botones para ver los datos de "Hoy", los últimos "7D" (7 días) o los últimos "30D" (30 días) con un solo clic.
- **Selector de Fechas:** Si necesitas un periodo específico (ej. del 1 al 15 de Diciembre), puedes seleccionarlo manualmente en los calendarios.

### B. Tarjetas de Estadísticas (Métricas Globales)
Seis tarjetas que te dan los números más importantes del periodo seleccionado:
- **Ventas hoy:** El dinero total que ha entrado hoy (desde las 00:00 hasta las 23:59).
- **Pedidos pendientes:** Órdenes nuevas que los clientes han hecho y que aún no has preparado o enviado.
- **Stock bajo:** Cuántos productos están a punto de agotarse (tienen menos de 5 unidades en inventario).
- **Total clientes:** El número histórico de personas que se han registrado en tu tienda.
- **Productos activos:** Cuántos productos tienes actualmente a la venta.
- **Total pedidos:** El número histórico de todas las órdenes que has recibido.

### C. Gráfica de Ventas
Una gráfica de barras que te muestra visualmente cómo se han comportado las ventas en los últimos 7 días. 
- **Tip:** Si pasas el ratón (o tocas) sobre una de las barras, verás exactamente cuántos pedidos se hicieron ese día.

### D. Top Productos
Una lista de los productos que más dinero te han generado en el periodo seleccionado. Te muestra el nombre del producto, cuántas unidades se vendieron y el total de ingresos. La barra de color te ayuda a comparar visualmente cuál es el "rey" de las ventas.

### E. Pedidos Recientes
Una tabla con las últimas órdenes que han entrado a la tienda. Te muestra el número de orden, el cliente, el total a pagar, el estado actual (ej. Pendiente, Pagado, Enviado) y la fecha.

---

## 3. Los "Superpoderes" del Dashboard

### 📥 Exportar a CSV (Reportes)
- **¿Qué hace?** Descarga un archivo `.csv` (que puedes abrir en Excel o Google Sheets) con el resumen de las ventas y el top de productos del periodo que tengas seleccionado.
- **¿Para qué sirve?** Es ideal si necesitas enviarle un reporte de ventas a tu contador, o si quieres guardar un registro mensual de cómo le fue a la tienda. Solo selecciona las fechas que quieres (ej. todo Enero) y haz clic en el botón **"Exportar"** en la esquina superior derecha.

### 🔗 Acceso Rápido a Pedidos
- **¿Qué hace?** En la tabla de "Pedidos Recientes", si pasas el ratón sobre una orden, aparecerá un pequeño icono de una flecha (🔗).
- **¿Para qué sirve?** Al hacer clic en ese icono, te llevará directamente a los detalles de ese pedido específico para que puedas ver qué compró el cliente o cambiar su estado a "Enviado". ¡Te ahorra clics!

---

## 4. Preguntas Frecuentes

**¿La gráfica de ventas cambia si selecciono un mes entero?**
Actualmente, la gráfica de barras está diseñada para mostrar siempre los últimos 7 días para darte una visión rápida de la semana en curso. Sin embargo, las tarjetas de estadísticas y el Top de Productos sí se actualizan según las fechas que elijas.

**¿Qué significa que un producto tenga "Stock bajo"?**
El sistema considera que un producto tiene stock bajo cuando le quedan 5 unidades o menos. Es una alerta para que vayas pensando en resurtir.

**¿El botón de exportar descarga todos los pedidos?**
No, el botón de exportar descarga un *resumen* (Métricas globales y Top de productos). Si necesitas descargar la lista completa de pedidos uno por uno, esa función estará disponible en el módulo específico de "Pedidos".

---
*Documento generado para VSM Store - Arquitectura Modular (Legos)*