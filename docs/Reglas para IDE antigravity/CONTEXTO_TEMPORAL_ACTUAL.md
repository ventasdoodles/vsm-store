# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Hero Clarity / Acapulco-DHL Canon Reconciliation
- Fecha: 2026-05-01
- Mission objective activa: registrar en canon la aceptacion del slice Hero clarity / location consistency
- Esta meta sigue abierta hasta: dejar `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md` y este contexto temporal alineados sin tocar implementacion, runtime, DB, deploy ni helper artifacts

## 2. Estado autoritativo de entrada
- Commit aceptado: `41e8eee3b6d2096ff30651e6572344ba40d572b2` (`fix: align hero copy with DHL shipping truth`).
- Veredicto aceptado: `ACCEPT WITH MINOR RESIDUAL RISK`.
- Slice aceptado: Hero clarity / location consistency, Slice 4 de Storefront Product Discovery and Merchandising Coherence.
- Business truth aceptado: proyecto operado/desarrollado desde Xalapa; base comercial/owner en Acapulco; productos mayormente importados de China y Estados Unidos; no describir productos como hechos/fabricados en Xalapa; no hay entregas personales/locales; entrega solo por DHL; no insinuar hand delivery local en Xalapa ni Acapulco.
- Los slices cerrados 1, 2 y 3 se preservan y no se reabren desde esta tarea.

## 3. Riesgo principal del bloque
- Inflar el alcance y hacer parecer que todo Product Discovery, service-area policy, shipping policy, pickup/local-delivery support o produccion quedo resuelto.
- Convertir la verdad de Home hero en claims globales sobre PDP, search, offers, Product Search, semantic/vector search, Cesarin, checkout, admin, DB o Supabase remoto.
- Tocar codigo, runtime, tests, helper artifacts, DB, deploy o Supabase remoto durante un pase que es solo docs/canon.

## 4. Resultado que debe dejar este bloque
- Canon actualizado con hechos aceptados:
  - Home hero fallback/normalized copy comunica productos importados y envio por DHL desde Acapulco.
  - Copy visible aceptado: `Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.`
  - `sin entregas personales` es una negacion aceptada, no una promesa de servicio.
  - El hero ya no debe mostrar `envío gratis en Xalapa`, made/fabricated/hechos en Xalapa, local delivery en Xalapa, ni local/personal delivery en Acapulco.
  - stale-copy normalizer protege el Home hero contra claims viejos city-specific/local-delivery/manufacturing.
  - Home SEO description / sr-only heading quedan alineados con esta verdad.
  - readability se ajusto solo de forma acotada: spacing, vertical positioning, font scale, line height y text drop shadow; no rediseño desde cero.
  - implementacion aceptada limitada a `src/components/home/MegaHero.tsx`, `src/pages/Home.tsx` y `src/components/home/__tests__/MegaHero.test.tsx`.
- Auditoria registrada como cierre aceptado con riesgo menor.
- Residual explicitado: `npm run test -- MegaHero` tuvo timeout por Vitest worker/tooling; focused `test:run` paso; browser QA con Node v24 bundled + Chrome instalado fue aceptado por mismatch del in-app browser runtime; tests no cubren cada frase prohibida pero normalizer + browser QA cubren el visible Home hero path.

## 5. No reabrir
- Implementacion, runtime o tests.
- Rutas/componentes fuera de docs.
- Helper artifacts.
- Remote Supabase.
- Deploy.
- `db push` / `db reset`.
- PDP related/cross-sell, Product Search retrieval/embeddings, semantic/vector search, Gemini, Cesarin response quality, checkout/provider, admin/Cesarin OS, DB/schema/migrations, `/ofertas`, `/buscar`, Home featured categories, full service-area policy system, pickup/local-delivery support, production proof o broader Product Discovery.

## 6. Siguiente paso correcto
- Verificar diff limitado a docs/canon.
- Confirmar que no hay cambios source/runtime.
- Commit de documentacion/canon solamente.
