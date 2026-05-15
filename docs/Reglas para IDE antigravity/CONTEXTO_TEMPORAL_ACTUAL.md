# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Admin RPC Switch Read-Only Browser Smoke (Canonization)
- Fecha: 2026-05-14
- Mission objective activa: preservar continuidad despues del smoke browser/admin read-only del switch RPC, dejando claros limites, no-mutacion, validacion UI y residual de smoke remoto.
- Esta meta sigue abierta hasta: que el usuario asigne el siguiente hito del roadmap.

## 2. Estado autoritativo de entrada
- Order Admin Events Schema Phase 1 ya estaba DONE / ACCEPTED / PUSHED / CANONIZED.
- RPC substrate aceptado y pusheado: `489c006` (`feat(db): add audited unpaid cancellation rpc substrate`).
- Grant patch aceptado y pusheado: `c5e2da2` (`fix(db): restrict unpaid cancellation rpc grants`).
- Local sandbox RPC smoke: PASS y canonizado.
- Remote manual SQL apply: PASS y canonizado contra `cvvlorbiwtuhkxolhfie` / `Tienda VSM`.
- Remote schema validado: `public.order_admin_events` y `public.cancel_admin_unpaid_order_with_audit(uuid,text)` existen; RLS/policies/indexes/grants aceptados.
- Remote final grant posture: `{postgres=X/postgres,authenticated=X/postgres}`, `anon_execute=false`, `authenticated_execute=true`, `service_role_execute=false`.
- Migration history remota sigue intencionalmente sin reparar/divergente.
- Remote sandbox RPC smoke sigue sin PASS: dos intentos quedaron bloqueados antes de ejecucion por el safety filter.
- Commit de switch aceptado y pusheado: `eec1d46` (`fix(admin): switch unpaid cancellation to audited rpc`).
- Canon del switch aceptado y pusheado: `ed1be3e` (`docs: canonize admin unpaid cancellation rpc switch`).
- Browser/admin read-only smoke del switch RPC: PASS.
- Target usado: `http://127.0.0.1:5174/admin/orders` con Vite local y Supabase local.
- `main` quedo alineado con `origin/main` en `0 / 0`.

## 3. Que se hizo en este bloque
- Se documento en canon que `eec1d46` fue pusheado a `origin/main`.
- Se documento que el camino activo de admin unpaid cancellation ahora usa el RPC auditado desplegado.
- Se documento que `cancelAdminOrder(orderId: string, reason: string)` devuelve `Promise<{ id: string }>`.
- Se documento que el servicio llama `supabase.rpc('cancel_admin_unpaid_order_with_audit', { p_order_id: orderId, p_reason: trimmedReason })`.
- Se documento que el viejo flujo client-side fetch/update/`tracking_notes` ya no se usa en `cancelAdminOrder`.
- Se documento que `currentNotes` fue removido del path service/hook/drawer.
- Se documento que no hay insert directo a `order_admin_events` desde el cliente.
- Se documento que se preservan validacion local de motivo corto, superficie existente de error/admin notification, y las invalidaciones `['admin', 'orders']`, `['admin', 'stats']`, `['admin', 'recent-orders']`.
- Se documento que validacion pre-commit paso: `npm run typecheck`, `npx vitest run src/services/admin/__tests__/admin-orders.service.test.ts`, y ESLint focalizado en archivos tocados.
- Se documento que no hubo RPC call, order mutation, browser cancellation smoke, remote SQL, `db push`, `db reset`, deploy ni operacion remota de Supabase durante implementacion/push/canonizacion.
- Se documento explicitamente que remote sandbox RPC smoke sigue unresolved/blocked y no debe reclamarse como PASS.
- Se documento que el browser/admin read-only smoke cargo Admin Orders con sesion sandbox local y mostro 9 pedidos.
- Se documento que el pedido local unpaid elegible `#A8D28D` / `6ea29f71-1c12-42f5-948e-5b4033a8d28d` abrio coherentemente en el drawer.
- Se documento que la UI de confirmacion de cancelacion, textarea de motivo y boton final `Si, cancelar pedido` renderizaron, pero el boton final no fue clickeado.
- Se documento que el pedido terminal cancelado `#00B501` no mostro affordance inseguro de cancelacion.
- Se documento que la captura de red tuvo `0` llamadas a `cancel_admin_unpaid_order_with_audit`.
- Se documento que la lectura local post-smoke confirmo `#A8D28D` aun `processing` / `pending` y `order_admin_events` count `0`.
- Se documento el ruido no bloqueante observado (`noise.svg` 404 y errores 403 de sesion sintetica), sin crash de UI.
- Se documento que no hubo RPC call, order mutation, DB push/reset, remote SQL, deploy, codigo/docs durante el smoke ni ejecucion de cancelacion browser.

## 4. Resultado real del bloque
- Que si quedo terminado:
  - El canon refleja que `cancelAdminOrder` ya esta integrado con el RPC auditado desplegado.
  - El repo esta alineado con `origin/main` despues del push de `eec1d46`.
  - Las pruebas focalizadas y typecheck del switch estan registradas como PASS.
  - El canon refleja el PASS del browser/admin read-only smoke posterior al switch.
  - El smoke probo reachability visual de la UI de cancelacion sin ejecutar la cancelacion.
  - El smoke probo que la orden elegible inspeccionada no muto y no genero evento de auditoria.
- Que quedo a medias:
  - Remote sandbox RPC smoke sigue bloqueado/no ejecutado por safety filter.
- Que quedo en hold:
  - Production real-order cancellation smoke sigue NO-GO.
  - Browser/admin UX smoke solo puede considerarse si evita mutar ordenes reales o usa una ruta de orden/admin sandbox disposable explicitamente autorizada.
  - Deploy/release decision sigue separada si el hosting workflow lo requiere.
  - Paid cancellation, manual refunds, provider refunds, customer cancellation UX, restock y partial refunds siguen NO-GO.

## 5. Estado de salida
- Baseline actual: `Admin Unpaid Cancellation RPC Switch` completado, aceptado, pusheado, canonizado y con browser/admin read-only smoke PASS.
- El RPC substrate y grant patch estan aplicados/validados localmente y aplicados/validados remotamente por SQL manual controlado.
- `cancelAdminOrder` ya usa el RPC auditado en codigo; no usa el viejo fetch/update/tracking_notes client-side path.
- Siguiente paso correcto: deploy/release decision sigue separada si el hosting workflow lo requiere. Cualquier prueba ejecutable de cancelacion futura debe usar datos disposable/sandbox explicitamente autorizados. Production real-order smoke sigue NO-GO.
- Herramienta que debe intervenir despues: Codex para readiness/auditoria del siguiente paso; Antigravity solo si se autoriza validacion practica acotada.

## 6. Riesgos y alertas
- Riesgos vivos:
  - Remote sandbox RPC smoke sigue unresolved/blocked; no reclamar PASS remoto de ejecucion del RPC.
  - Migration history remota quedo intencionalmente sin reparar/divergente.
  - Primer uso remoto real del RPC por UI dependera de admin/product workflow real si no se autoriza smoke sandbox remoto por otra via.
  - El browser smoke aceptado fue read-only: no prueba ejecucion remota del RPC ni cancelacion real.
- Puntos que pueden degradar:
  - Ejecutar production real-order cancellation smoke sin autorizacion explicita.
  - Confundir el PASS browser read-only con RPC smoke remoto o con prueba de cancelacion ejecutada.
  - Reabrir paid cancellation/refunds sin un frente separado.
  - Confundir el switch de unpaid cancellation con soporte de refunds, paid cancellation, customer cancellation UX o provider calls.

## 7. No reabrir
- Lanes cerrados:
  - Admin Unpaid Cancellation RPC Switch - cerrado, aceptado, pusheado y canonizado.
  - Remote Manual SQL Apply for Unpaid Cancellation RPC - cerrado como PASS de apply remoto, sin migration-history repair.
  - Audited Unpaid Cancellation RPC Local Sandbox Smoke - cerrado y aceptado como PASS local.
  - Audited Unpaid Cancellation RPC Grants Patch - cerrado, aceptado, pusheado y canonizado.
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
