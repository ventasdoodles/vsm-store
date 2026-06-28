# VSM Store — Delivery Lifecycle QA Matrix

| Estado | Quién lo ve | Fuente esperada | Riesgo |
|---|---|---|---|
| requested | cliente/admin | DB/API | medio |
| quoted | cliente/admin | pricing | medio |
| rider_assigned | cliente/rider/admin | assignment | alto |
| pickup_en_route | cliente/rider/admin | rider/tracking | alto |
| picked_up | cliente/rider/admin | rider action | alto |
| dropoff_en_route | cliente/rider/admin | tracking/action | alto |
| delivered | todos | proof + timestamp | alto |
| cancelled | todos | policy | alto |
| failed | admin/cliente | support/policy | alto |

## Non-claims

- Status local no prueba entrega real.
- UI de mapa no prueba GPS real.
- DB status no prueba notificación.
- Dummy delivery no prueba operación real.
