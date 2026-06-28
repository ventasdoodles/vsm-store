# Cross-Surface QA: Driver Assignment Timeline & Masking

## Objective
Probar el ciclo operacional end-to-end de asignación de conductor:
Admin (Asignación) → Base de Datos (Trigger histórico) → Admin (Línea de tiempo) → Cliente (Máscara PII).

## Preparación
1. Asegurarse que ambos servidores locales están corriendo:
   - Admin: `http://localhost:5173`
   - Client: `http://localhost:5174`
2. Identificar una orden de prueba en estado `pending` creada por el cliente local.

## Pasos de Ejecución Manual (QA)

1. **Cliente**: Iniciar sesión en `http://localhost:5174` con el usuario de prueba y abrir la vista de la orden.
   - *Verificación*: El estado debe decir "Recibido" o "Pendiente".

2. **Admin**: Iniciar sesión en `http://localhost:5173` como administrador.
   - Navegar al detalle de la orden de prueba.
   - En la sección "Conductor", seleccionar un conductor interno de prueba (e.g. "Juan Perez") y confirmar la asignación.
   - *Verificación (Admin Card)*: La tarjeta debe actualizarse inmediatamente para mostrar "Juan Perez".
   - *Verificación (Admin Timeline)*: El componente `OrderHistoryTimeline` debe insertar un nuevo evento `Conductor Asignado` y mostrar explícitamente `Conductor: Juan Perez` bajo el nombre del admin.

3. **Cliente**: Regresar a la pestaña del cliente (`http://localhost:5174`). No refrescar la página.
   - *Verificación (Realtime)*: La interfaz debe actualizarse sola automáticamente (hot-reload).
   - *Verificación (Status)*: Debe mostrar el estado actualizado ("Conductor Asignado").
   - *Verificación (Máscara PII)*: En la caja de información del conductor, debe mostrar **exclusivamente** "Repartidor iVoy" y no exponer el nombre real del conductor ni su teléfono, asegurando la privacidad del PII.

## Cleanup / Rollback
1. Desde el Admin, usar el botón de Cancelar Orden o usar la base de datos para devolver el `status` a `pending` y `driver_id` a `null`.

## Resultado esperado
Todas las verificaciones pasan exitosamente. El trigger en la base de datos registra el `driver_id` en `order_events`, el Admin tiene observabilidad total del evento y la privacidad del Cliente queda blindada vía enmascaramiento UI.
