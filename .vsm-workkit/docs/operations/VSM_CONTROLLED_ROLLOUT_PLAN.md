# VSM Store — Controlled Rollout Plan

## Gate 0 — Source/test

Typecheck, unit/domain tests, component tests.

## Gate 1 — Local/pre-prod

Dummy customer, rider, motorcycle, delivery, admin observability, DB proof, rollback.

## Gate 2 — Internal live smoke

Usuario interno, rider interno, zona controlada, sin clientes diarios, monitoreo.

## Gate 3 — Pilot controlled

Pocas entregas, horario definido, soporte disponible, stop switch.

## Gate 4 — Monitored rollout

Clientes reales, repartidores reales, alertas, incidentes, reportes.

## Stop conditions

- pérdida de tracking;
- pago inconsistente;
- rider mal asignado;
- datos personales expuestos;
- errores críticos en admin;
- no hay rollback.
