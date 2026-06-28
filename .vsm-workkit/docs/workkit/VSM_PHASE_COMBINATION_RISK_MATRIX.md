# VSM Store — Risk Matrix

## Low risk

- copy;
- docs;
- iconos;
- layout simple;
- componentes sin datos sensibles.

## Medium risk

- pantallas con datos mock/local;
- perfiles;
- historial;
- listado de entregas;
- filtros admin;
- validaciones de formulario;
- configuración local.

## High risk

- datos personales;
- auth;
- pagos;
- GPS/tracking;
- asignación real;
- delivery lifecycle real;
- notificaciones;
- DB/migrations;
- producción;
- proveedores externos.

## Regla corta

Si toca dinero, identidad, ubicación, producción o personas reales: no es LOW risk.

## Matriz

| Tarea | Flujo |
|---|---|
| Copy/doc | corto |
| UI simple | corto/medio |
| Pantalla con datos | medio |
| Service/query | medio |
| Auth | alto |
| Tracking/GPS | alto |
| Pagos | alto |
| DB/migrations | alto |
| Deploy/live smoke | alto |
