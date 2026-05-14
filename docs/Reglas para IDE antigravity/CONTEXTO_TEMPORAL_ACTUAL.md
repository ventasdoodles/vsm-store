# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Remote Manual SQL Apply for Audited Unpaid Cancellation RPC (Canonization)
- Fecha: 2026-05-14
- Mission objective activa: preservar continuidad despues del PASS del apply remoto manual SQL del RPC `public.cancel_admin_unpaid_order_with_audit`, y dejar claro que el frontend sigue sin switch/integracion.
- Esta meta sigue abierta hasta: que el usuario asigne el siguiente hito del roadmap.

## 2. Estado autoritativo de entrada
- Order Admin Events Schema Phase 1 ya estaba DONE / ACCEPTED / PUSHED / CANONIZED.
- Commit schema/types aceptado y pusheado: `b320150` (`feat(admin): add order admin event audit substrate`).
- Commit canon schema/types aceptado y pusheado: `61ddf2e` (`docs: canonize order admin event audit substrate`).
- Commit RPC aceptado y pusheado: `489c006` (`feat(db): add audited unpaid cancellation rpc substrate`).
- Commit canon RPC aceptado y pusheado: `b237927` (`docs: canonize audited unpaid cancellation rpc substrate`).
- Commit grant patch aceptado y pusheado: `c5e2da2` (`fix(db): restrict unpaid cancellation rpc grants`).
- Commit canon grant patch aceptado y pusheado: `4cc576a` (`docs: canonize unpaid cancellation rpc grant patch`).
- Commit canon local sandbox smoke aceptado y pusheado: `bca7234` (`docs: canonize unpaid cancellation rpc sandbox smoke`).
- `main` quedo alineado con `origin/main` en `0 / 0`.
- Target remoto usado para apply manual SQL: `cvvlorbiwtuhkxolhfie` / `Tienda VSM`.
- Nuevo archivo del hito RPC:
  - `supabase/migrations/20260513000002_cancel_admin_unpaid_order_with_audit_rpc.sql`
- Nuevo archivo del grant patch:
  - `supabase/migrations/20260513000003_restrict_cancel_admin_unpaid_order_rpc_grants.sql`

## 3. Que se hizo en este bloque
- Se ejecuto: actualizacion de `AUDIT_LOG.md` con el log formal del hito `Audited Unpaid Cancellation RPC Substrate`.
- Se ejecuto: actualizacion de `AI_CONTEXT.md` insertando el estado del RPC en `Project Status`.
- Se ejecuto: actualizacion de `STORE_FRONT_AI_PILOT_CONTEXT.md` con la verdad operacional del RPC substrate.
- Se documento que el RPC `public.cancel_admin_unpaid_order_with_audit(p_order_id uuid, p_reason text)` fue aceptado como substrate transaccional: valida auth/admin, bloquea la orden con `FOR UPDATE`, permite solo `pending` / `confirmed` / `processing`, bloquea `payment_status = paid`, calcula `tracking_notes` desde DB, preserva `payment_status`, actualiza a `cancelled`, e inserta un evento interno `order_admin_events` en la misma transaccion.
- Se documento que la validacion local encontro grants EXECUTE mas amplios de lo aceptado (`anon`, `authenticated`, `service_role`).
- Se documento que el patch `c5e2da2` restringe `public.cancel_admin_unpaid_order_with_audit(uuid, text)` a `authenticated` solamente, manteniendo `postgres` como owner.
- Se documento que la validacion local posterior paso: `anon_execute=false`, `authenticated_execute=true`, `service_role_execute=false`, `SECURITY DEFINER` preservado, RLS/policies de `order_admin_events` preservadas, sin UPDATE/DELETE policies, e indice unico parcial de idempotencia preservado.
- Se documento que el local sandbox RPC smoke paso contra `postgresql://postgres:postgres@127.0.0.1:54322/postgres`, sin target `supabase.co`.
- Se documento que admin sandbox `00000000-0000-4000-8000-00000000a501` cancelo solo la orden sandbox `00000000-0000-4000-8000-00000000b501` / `SANDBOX-RPC-SMOKE-20260513-0001`.
- Se documento que la orden sandbox paso de `pending` a `cancelled`, `payment_status` quedo `pending`, `payment_method` quedo `cash`, provider fields quedaron null, y `tracking_notes` preservo marcador previo mas nota de cancelacion.
- Se documento que se creo exactamente un evento `order_admin_events` con `event_type=admin_unpaid_order_cancelled`, `source=admin_rpc`, `visibility=internal`, snapshots `pending -> cancelled` / `pending -> pending`, provider/refund fields null, idempotency key `admin_unpaid_order_cancelled:00000000-0000-4000-8000-00000000b501`, y metadata `rpc_version`, `tracking_notes_source=latest_db_value`, `had_tracking_notes_before=true`.
- Se documento que el retry fallo seguro como orden no elegible y el event count siguio en 1.
- Se documento que anon fallo por permission denied y authenticated non-admin `00000000-0000-4000-8000-00000000a502` fallo por `Admin privileges required`.
- Se documento que las filas sandbox quedaron intencionalmente en local DB para auditabilidad.
- Se documento que el apply remoto manual SQL paso usando un bundle temporal BOM-free fuera del repo (`first bytes 42 45 47`, `BOM present: False`) con `npx supabase db query --linked --file <tempPath> --output json`.
- Se documento que el bundle remoto ejecuto exactamente, en orden y dentro de `BEGIN` / `COMMIT`: `20260513000001_order_admin_events.sql`, `20260513000002_cancel_admin_unpaid_order_with_audit_rpc.sql`, y `20260513000003_restrict_cancel_admin_unpaid_order_rpc_grants.sql`.
- Se documento que la validacion remota post-apply paso: `public.order_admin_events` existe, `public.cancel_admin_unpaid_order_with_audit(uuid,text)` existe, la funcion es `SECURITY DEFINER`, owner `postgres`, RLS habilitado, policies admin SELECT/INSERT presentes, sin UPDATE/DELETE policies, indices requeridos presentes incluido `order_admin_events_idempotency_key_uidx`, y grants finales `{postgres=X/postgres,authenticated=X/postgres}` con `anon_execute=false`, `authenticated_execute=true`, `service_role_execute=false`.
- Se documento que la migration history quedo intencionalmente sin tocar: filas `20260513000001`, `20260513000002`, `20260513000003` siguen en `0`, porque la divergencia local/remota es otro frente separado.
- Se documentaron explicitamente los no-claims: no `db push`, no `db reset`, no deploy, no switch de `cancelAdminOrder`, no frontend integration, no RPC smoke remoto, no production real-order smoke, no order mutation, no refunds, no Mercado Pago/provider calls, no paid cancellation, no customer cancellation UX, no restock, no partial refunds y no migration-history repair.

## 4. Resultado real del bloque
- Que si quedo terminado:
  - Canon documental del RPC substrate completado.
  - El repo refleja que existe un RPC transaccional aceptado para futura cancelacion admin unpaid auditada.
  - El repo refleja que el grant patch del RPC fue aceptado, validado localmente y pusheado.
  - El canon refleja que el RPC paso smoke local sandbox con datos disposable y sin mutar ordenes reales.
  - El remoto `cvvlorbiwtuhkxolhfie` / `Tienda VSM` tiene aplicado el table substrate, RPC y grant patch por SQL manual controlado, con validacion post-apply PASS.
- Que quedo a medias:
  - Ninguno en el alcance de canonizacion.
- Que quedo en hold:
  - Remote sandbox RPC smoke sigue NO autorizado hasta un prompt separado.
  - Cambiar `cancelAdminOrder` para usar el RPC sigue bloqueado hasta autorizar readiness/smoke remoto y plan de error UX/switch.
  - Paid cancellation, manual refunds, provider refunds, customer cancellation UX, restock y partial refunds siguen NO-GO.

## 5. Estado de salida
- Baseline actual: `Audited Unpaid Cancellation RPC Substrate` completado, aceptado, pusheado, canonizado, validado localmente, y aplicado remotamente por SQL manual controlado en `cvvlorbiwtuhkxolhfie` / `Tienda VSM`.
- Siguiente paso correcto: readiness para remote sandbox RPC smoke puede considerarse despues como paso separado con datos remotos disposable. Production real-order smoke sigue NO-GO. Frontend/runtime switch sigue bloqueado hasta aceptar smoke/readiness remoto y plan de error UX/switch.
- Herramienta que debe intervenir despues: Codex para readiness/auditoria de deployment/local apply; Antigravity solo si se autoriza validacion practica.

## 6. Riesgos y alertas
- Riesgos vivos:
  - El RPC y su grant patch estan en repo, fueron aplicados/validados localmente y aplicados/validados remotamente por SQL manual, pero migration history remota quedo intencionalmente sin reparar.
  - El frontend aun usa el flujo aceptado existente de `cancelAdminOrder`.
  - Ejecutar el switch frontend antes de smoke/readiness remoto y plan de error UX/switch sigue siendo NO-GO.
- Puntos que pueden degradar:
  - Reabrir paid cancellation/refunds sin completar deploy/apply y validacion del audit trail.
  - Confundir el RPC substrate con comportamiento activo de producto.

## 7. No reabrir
- Lanes cerrados:
  - Audited Unpaid Cancellation RPC Substrate - cerrada, aceptada, pusheada y canonizada.
  - Audited Unpaid Cancellation RPC Grants Patch - cerrado, aceptado, pusheado y canonizado.
  - Audited Unpaid Cancellation RPC Local Sandbox Smoke - cerrado y aceptado como PASS local.
  - Remote Manual SQL Apply for Unpaid Cancellation RPC - cerrado como PASS de apply remoto, sin frontend switch.
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
