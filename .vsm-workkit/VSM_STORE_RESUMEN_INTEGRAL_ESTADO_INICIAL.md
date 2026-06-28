# VSM Store — Resumen integral inicial y handoff operativo

## 0. Dónde estamos realmente

Este paquete no prueba una app. Instala un sistema serio de trabajo para construir/auditar una app de vsm store.

Dominio esperado:

- clientes/remitentes;
- destinatarios;
- repartidores/riders;
- motos/flota;
- entregas;
- rutas;
- tracking;
- pagos/cobros/liquidaciones;
- soporte;
- admin/operación;
- rollout controlado.

## 1. Qué se migra desde VSM

Se migra el método:

- roles claros;
- prompt sizing;
- templates;
- skills/procedures;
- risk matrix;
- evidence ladder;
- real-system QA;
- canon/audit discipline;
- non-claims;
- controlled rollout.

No se migra:

- ecommerce;
- Vape/420;
- Césarín;
- Product Search;
- Mercado Pago como obligación;
- Supabase como obligación;
- claims de VSM.

## 2. Filosofía técnica

```text
Database/API → Services → Hooks/State → Components/Pages
```

Principios:

- modularidad;
- sin circular imports;
- reglas de negocio fuera de JSX;
- estados de entrega auditables;
- `delivery_id` como proof key;
- folio visible solo como etiqueta;
- evidencia antes de claims;
- rollback antes de producción.

## 3. Evidence ladder

1. Source/test.
2. Local browser.
3. Local auth/session.
4. Local/pre-prod reversible mutation.
5. DB read proof.
6. Dummy customer/rider/delivery flow.
7. Admin delivery observability.
8. Controlled live smoke.
9. Monitored real-courier rollout.

## 4. Primer hito recomendado

Codex readiness inicial sobre el repo real.

Objetivo: producir un Execution Block de 3-4 lanes, con WIP=1, empezando por inventario real y un primer flujo dummy seguro.

## 5. Non-claims

No producción. No pagos reales. No GPS real. No entregas reales. No admin real. No seguridad completa. No multi-ciudad. No notificaciones reales.

## 6. Frase operativa

Entrega rápida, arquitectura con casco.
