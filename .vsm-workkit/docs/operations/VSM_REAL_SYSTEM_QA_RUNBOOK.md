# VSM Store — Real-System QA Runbook

## Propósito

Probar flujos reales local/pre-prod/controlados sin overclaim.

## Flujo mínimo

1. Crear customer dummy.
2. Confirmar perfil.
3. Crear recipient/dirección dummy.
4. Crear orden dummy.
5. Crear/usar rider dummy.
6. Asociar moto dummy.
7. Asignar orden.
8. Mover lifecycle por estados permitidos.
9. Admin observa la orden.
10. DB proof por `orders.id` / `order_id`.
11. Rollback si hubo mutación.

## Forbidden by default

- secrets;
- token/cookie/localStorage/sessionStorage;
- production mutation;
- real payment provider call;
- real notification;
- broad DB probing;
- unscoped status mutation.

## Output

1. ENVIRONMENT TARGET
2. DUMMY DATA USED
3. CHECKS PERFORMED
4. UI OBSERVATIONS
5. DB OBSERVATIONS
6. MUTATIONS
7. ROLLBACK
8. ACCEPTED CLAIMS
9. NON-CLAIMS
10. BLOCKERS
