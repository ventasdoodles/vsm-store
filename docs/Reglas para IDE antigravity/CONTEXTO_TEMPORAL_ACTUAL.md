# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Offers/Deals Consistency Canon Reconciliation
- Fecha: 2026-04-29
- Mission objective activa: registrar en canon la aceptacion del slice Offers/deals consistency
- Esta meta sigue abierta hasta: dejar `AI_CONTEXT.md`, `AUDIT_LOG.md` y `STORE_FRONT_AI_PILOT_CONTEXT.md` alineados sin tocar implementacion, runtime, DB, deploy ni helper artifacts

## 2. Estado autoritativo de entrada
- Commit aceptado: `25998e9c88c9f294f0f4ec825903cc5205a9f45e` (`fix offers discounted products query`).
- Veredicto aceptado: `ACCEPT WITH MINOR RESIDUAL RISK`.
- Slice aceptado: Offers/deals consistency.
- La vitrina/Césarín, Product Search, checkout, admin, DB/schema, remote Supabase, `/buscar`, hero clarity y PDP related products no se reabren desde esta tarea.

## 3. Riesgo principal del bloque
- Inflar el alcance y hacer parecer que toda la coherencia de merchandising, busqueda, ofertas, promociones, PDP relacionados o Product Discovery quedo resuelta.
- Confundir el fix de productos con descuento por `compare_at_price > price` con una arquitectura de coupons, flash deals o promociones.
- Tocar codigo, runtime, helper artifacts, DB, deploy o Supabase remoto durante un pase que es solo docs/canon.

## 4. Resultado que debe dejar este bloque
- Canon actualizado con hechos aceptados:
  - `/ofertas` podia mostrar `No hay ofertas activas` mientras `/vape` y `/420` mostraban descuentos.
  - root cause: `filter('compare_at_price', 'gt', 'price')` era un filtro remoto columna-vs-columna no confiable.
  - el catch devolvia `[]` y disparaba el empty state.
  - el fix aceptado usa candidate fetch bounded con `is_active = true`, `status = active`, `stock > 0`, `compare_at_price IS NOT NULL`.
  - el descuento real se filtra localmente con `typeof compare_at_price === 'number' && compare_at_price > price`.
  - resultados finales se cortan al limit solicitado.
  - select incluye variants/options para `ProductCard`.
- Auditoria registrada como cierre aceptado con riesgo menor.
- Residual explicitado: si muchos candidatos con compare price pero sin descuento aparecen antes que descuentos antiguos, algunos descuentos antiguos podrian no entrar en el fetch bounded.

## 5. No reabrir
- Implementacion o runtime.
- Rutas/componentes fuera de docs.
- Helper artifacts.
- Remote Supabase.
- Deploy.
- `db push` / `db reset`.
- Césarín, Product Search, checkout, admin, DB/schema, `/buscar`, PDP related products, hero clarity, coupons, flash deals, promotions architecture o broader Product Discovery.

## 6. Siguiente paso correcto
- Verificar diff limitado a docs/canon.
- Confirmar que no hay cambios source/runtime.
- Commit de documentacion/canon solamente.
