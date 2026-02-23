# Manual de Usuario: Módulo de Pedidos (Admin Panel)

Bienvenido al manual de uso del **Módulo de Pedidos** de VSM Store. Este es el corazón operativo de tu tienda, donde podrás ver, gestionar y actualizar el estado de todas las compras que hacen tus clientes.

---

## 1. ¿Qué es el Módulo de Pedidos?

Es tu centro de control logístico. Aquí entra cada nueva compra que se realiza en la tienda. Tu objetivo principal en esta pantalla es mover los pedidos desde que entran ("Pendiente") hasta que se entregan al cliente ("Entregado").

---

## 2. Panel Principal (Los Legos)

El módulo está dividido en componentes modulares para facilitar su uso:

### A. Cabecera y Buscador
En la parte superior encontrarás:
- **Buscador:** Te permite encontrar rápidamente un pedido escribiendo el nombre del cliente, su número de teléfono o el ID del pedido (ej. `#A1B2C3`).
- **Filtro de Fechas:** Dos calendarios para buscar pedidos que se hicieron en un rango de fechas específico.
- **Botón Exportar (Superpoder):** Descarga un archivo `.csv` con todos los pedidos que estés viendo en pantalla.

### B. Vistas (Lista vs Tablero)
Tienes dos formas de ver tus pedidos. Puedes cambiar entre ellas usando los botones con iconos (Lista ☰ o Tablero ◫) que están debajo del buscador:

#### Vista de Lista (Por defecto)
- Muestra los pedidos uno debajo del otro.
- Es ideal para ver muchos pedidos a la vez y leer los detalles rápidamente.
- Puedes usar los **Botones de Filtro** (Todos, Pendiente, Pagado, etc.) para ver solo los pedidos que te interesan.
- Al hacer clic en un pedido, este se expande hacia abajo para mostrarte:
  - Los productos que compró el cliente.
  - Su dirección y teléfono.
  - El método de pago y envío.
  - Si usó algún cupón de descuento.

#### Vista de Tablero (Kanban)
- Muestra los pedidos como tarjetas organizadas en columnas según su estado (Pendiente, Pagado, Enviado, etc.).
- Es ideal para tener una visión general de cómo va el flujo de trabajo del día.
- Puedes cambiar el estado de un pedido rápidamente usando el menú desplegable que está dentro de cada tarjeta.

---

## 3. ¿Cómo gestionar un pedido? (Flujo de Trabajo)

El ciclo de vida normal de un pedido es el siguiente:

1. **Pendiente:** El cliente hizo el pedido, pero aún no lo ha pagado (ej. eligió transferencia y estás esperando el comprobante).
2. **Pagado:** Confirmaste que el dinero ya está en tu cuenta. ¡Es hora de preparar el paquete!
3. **Enviado:** Ya le entregaste el paquete a la paquetería o al repartidor.
4. **Entregado:** El cliente ya tiene sus productos en las manos. Fin del proceso.

**Para cambiar el estado de un pedido:**
- **En Vista de Lista:** Haz clic en el pedido para expandirlo. Busca la sección "Cambiar status" y selecciona el nuevo estado en el menú desplegable.
- **En Vista de Tablero:** Busca la tarjeta del pedido y cambia el estado directamente en el menú desplegable que aparece en la parte inferior de la tarjeta.

*Nota: También existen los estados "Cancelado" (si el cliente se arrepintió o no pagó) y "Reembolsado" (si tuviste que devolverle el dinero).*

---

## 4. Los "Superpoderes" de Pedidos

### 📥 Exportación Inteligente (CSV)
- **¿Qué hace?** Descarga un archivo Excel/CSV con los datos de los pedidos.
- **¿Por qué es "inteligente"?** Porque respeta los filtros que tengas activos. Si buscas "Juan" y seleccionas las fechas de la semana pasada, el archivo descargado solo contendrá los pedidos de Juan de esa semana.
- **¿Para qué sirve?** Es perfecto para armar rutas de entrega (exportas todos los pedidos "Pagados" del día y se los mandas al repartidor) o para hacer auditorías de ventas.

### � Número de Guía y Notificación por WhatsApp
- **¿Qué hace?** Te permite guardar el número de guía de la paquetería directamente en el pedido y avisarle al cliente con un solo clic.
- **¿Cómo funciona?** 
  1. Abre los detalles de un pedido.
  2. Escribe el número de guía en el campo "Número de Guía" y presiona "Guardar".
  3. Haz clic en el botón verde de WhatsApp. Se abrirá un chat con el cliente con un mensaje pre-escrito que incluye su nombre, el número de pedido y el número de guía.
- **¿Para qué sirve?** Ahorra tiempo escribiendo mensajes manuales y mantiene al cliente informado sobre el estado de su envío de forma profesional y rápida.

### �👁️ Vista Dual (Lista/Tablero)
- Te permite adaptar la herramienta a tu estilo de trabajo. Usa la lista para buscar detalles específicos y el tablero para gestionar la operación diaria de forma visual.

---

## 5. Preguntas Frecuentes

**¿Qué significa el icono de la tarjeta de crédito amarilla?**
En la vista de Tablero, si ves un pequeño icono de tarjeta de crédito amarilla en un pedido, significa que el cliente eligió pagar por **Transferencia**. Es un recordatorio visual para que revises tu cuenta bancaria antes de cambiar el estado a "Pagado".

**¿El cliente recibe una notificación cuando cambio el estado?**
Actualmente, el cambio de estado se refleja inmediatamente en el perfil del cliente dentro de la tienda (en su sección "Mis Pedidos"). Si necesitas avisarle urgentemente, puedes usar el número de teléfono que aparece en los detalles del pedido para mandarle un WhatsApp.

**¿Puedo editar los productos de un pedido?**
No. Por seguridad y para mantener un registro contable exacto, los pedidos no se pueden modificar una vez creados. Si el cliente quiere agregar algo, lo ideal es cancelar el pedido actual y pedirle que haga uno nuevo, o manejar la diferencia por fuera.

---
*Documento generado para VSM Store - Arquitectura Modular (Legos)*