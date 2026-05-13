# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Audited Unpaid Cancellation RPC Substrate (Canonization)
- Fecha: 2026-05-13
- Mission objective activa: preservar continuidad despues del ACCEPT, commit y push del RPC `public.cancel_admin_unpaid_order_with_audit`, y dejar claro que sigue siendo sustrato no desplegado/no integrado.
- Esta meta sigue abierta hasta: que el usuario asigne el siguiente hito del roadmap.

## 2. Estado autoritativo de entrada
- Order Admin Events Schema Phase 1 ya estaba DONE / ACCEPTED / PUSHED / CANONIZED.
- Commit schema/types aceptado y pusheado: `b320150` (`feat(admin): add order admin event audit substrate`).
- Commit canon schema/types aceptado y pusheado: `61ddf2e` (`docs: canonize order admin event audit substrate`).
- Commit RPC aceptado y pusheado: `489c006` (`feat(db): add audited unpaid cancellation rpc substrate`).
- `main` quedo alineado con `origin/main` en `0 / 0`.
- Nuevo archivo del hito RPC:
  - `supabase/migrations/20260513000002_cancel_admin_unpaid_order_with_audit_rpc.sql`

## 3. Que se hizo en este bloque
- Se ejecuto: actualizacion de `AUDIT_LOG.md` con el log formal del hito `Audited Unpaid Cancellation RPC Substrate`.
- Se ejecuto: actualizacion de `AI_CONTEXT.md` insertando el estado del RPC en `Project Status`.
- Se ejecuto: actualizacion de `STORE_FRONT_AI_PILOT_CONTEXT.md` con la verdad operacional del RPC substrate.
- Se documento que el RPC `public.cancel_admin_unpaid_order_with_audit(p_order_id uuid, p_reason text)` fue aceptado como substrate transaccional: valida auth/admin, bloquea la orden con `FOR UPDATE`, permite solo `pending` / `confirmed` / `processing`, bloquea `payment_status = paid`, calcula `tracking_notes` desde DB, preserva `payment_status`, actualiza a `cancelled`, e inserta un evento interno `order_admin_events` en la misma transaccion.
- Se documentaron explicitamente los no-claims: no apply local/remoto, no `db push`, no deploy, no switch de `cancelAdminOrder`, no frontend integration, no order mutation, no refunds, no Mercado Pago/provider calls, no paid cancellation, no customer cancellation UX, no restock y no partial refunds.

## 4. Resultado real del bloque
- Que si quedo terminado:
  - Canon documental del RPC substrate completado.
  - El repo refleja que existe un RPC transaccional aceptado para futura cancelacion admin unpaid auditada.
- Que quedo a medias:
  - Ninguno en el alcance de canonizacion.
- Que quedo en hold:
  - Aplicar migraciones a local/remote Supabase sigue NO autorizado.
  - Cambiar `cancelAdminOrder` para usar el RPC sigue bloqueado hasta autorizar la ruta de deploy/apply de migracion.
  - Paid cancellation, manual refunds, provider refunds, customer cancellation UX, restock y partial refunds siguen NO-GO.

## 5. Estado de salida
- Baseline actual: `Audited Unpaid Cancellation RPC Substrate` completado, aceptado, pusheado y canonizado.
- Siguiente paso correcto: READINESS para decidir la ruta segura de aplicacion de migraciones/local-deploy antes de cualquier switch frontend/runtime.
- Herramienta que debe intervenir despues: Codex para readiness/auditoria de deployment/local apply; Antigravity solo si se autoriza validacion practica.

## 6. Riesgos y alertas
- Riesgos vivos:
  - El RPC esta en repo pero no aplicado local/remotamente.
  - El frontend aun usa el flujo aceptado existente de `cancelAdminOrder`.
  - Ejecutar el switch frontend antes de aplicar migraciones romperia runtime donde no exista `order_admin_events` / RPC.
- Puntos que pueden degradar:
  - Reabrir paid cancellation/refunds sin completar deploy/apply y validacion del audit trail.
  - Confundir el RPC substrate con comportamiento activo de producto.

## 7. No reabrir
- Lanes cerrados:
  - Audited Unpaid Cancellation RPC Substrate - cerrada, aceptada, pusheada y canonizada.
  - Order Admin Events Audit Substrate Phase 1 - cerrada, aceptada, pusheada y canonizada.
  - Homepage Desktop Width Fix - cerrada, validada y canonizada.
  - Customer Cancelled-State Notes Filter - cerrada, validada y canonizada.
  - Admin Unpaid Cancellation UX - cerrada, validada y canonizada.
  - Reverse Fulfillment Lifecycle Data Integrity - cerrada y validada.
  - Admin Fulfillment Browser Readiness - cerrada y validada.
  - Customer Orders / Tracking UX Readiness - cerrada y validada.
  - Slices 1-16 de Storefront Product Discovery - cerrados.

## 8. Regla de continuidad
- Este contexto temporal solo vale mientras la meta activa siga vigente.
- Si cambia el frente real, reemplazar `CONTEXTO_TEMPORAL_ACTUAL.md`. Si el canon cambia, el contexto temporal se actualiza; nunca al reves.
