# VSM Store — Identity + Delivery Observability Checklist

## Core rules

1. Empezar por `orders.id` / `order_id`.
2. Folio, `delivery_number` u `order_number` son etiquetas auxiliares.
3. Cruzar customer por customer_id, teléfono/email y timestamps.
4. Cruzar rider por rider_id, teléfono y vsm.
5. Cruzar moto por motorcycle_id o placa.
6. No inspeccionar cookies/localStorage/sessionStorage/auth headers/tokens/passwords/env values.
7. Si identidad no se resuelve sin secretos, detener.

## Customer proof

customer_id, email/telefono, pickup, dropoff, timestamp, order_id.

## Rider proof

rider_id, teléfono, motorcycle_id/placa, disponibilidad, assignment timestamp.

## Admin proof

admin UI muestra la misma entrega, status, rider, customer, timestamps y datos coherentes.

## Stop conditions

- requiere secretos/sesión;
- requiere producción;
- depende solo de folio;
- requiere DB probing amplio;
- requiere mutación irreversible.
