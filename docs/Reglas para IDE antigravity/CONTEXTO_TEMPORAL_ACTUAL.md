# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Search Expectation Alignment Canon Reconciliation
- Fecha: 2026-04-29
- Mission objective activa: registrar en canon la aceptacion del slice Search expectation alignment
- Esta meta sigue abierta hasta: dejar `AI_CONTEXT.md`, `AUDIT_LOG.md` y `STORE_FRONT_AI_PILOT_CONTEXT.md` alineados sin tocar implementacion, runtime, DB, deploy ni helper artifacts

## 2. Estado autoritativo de entrada
- Commit aceptado: `5310a043af8dbef2c59367c393fee8ceb81db411` (`fix broad category search routing`).
- Veredicto aceptado: `ACCEPT WITH MINOR RESIDUAL RISK`.
- Slice aceptado: Search expectation alignment.
- La vitrina/Césarín, Product Search, semantic/vector search, Gemini, checkout, admin, DB/schema, remote Supabase, hero clarity, `/ofertas` y PDP related products no se reabren desde esta tarea.

## 3. Riesgo principal del bloque
- Inflar el alcance y hacer parecer que toda la coherencia de merchandising, busqueda, sinonimos, semantic search o Product Discovery quedo resuelta.
- Confundir el fix de terminos exactos `vape` / `vapes` / `vapeo` / `420` con un search engine nuevo, synonym engine completo o Product Search retrieval.
- Tocar codigo, runtime, helper artifacts, DB, deploy o Supabase remoto durante un pase que es solo docs/canon.

## 4. Resultado que debe dejar este bloque
- Canon actualizado con hechos aceptados:
  - `/buscar?q=vape` trataba `vape` como texto literal de producto y podia mostrar matches incidentales 420.
  - reconocimiento exacto broad-category agregado en `src/pages/SearchResults.tsx`.
  - `vape`, `vapes`, `vapeo` -> section `vape`, title `Vape Collection`, CTA `/vape`.
  - `420` -> section `420`, title `420 Zone`, CTA `/420`.
  - matching exacto tras `trim().toLowerCase()`.
  - para esos terminos se bypass normal literal search y se usa `getProducts({ section, limit: 20 })`.
  - terminos no broad siguen por `useSearch(query)`.
- Auditoria registrada como cierre aceptado con riesgo menor.
- Residual explicitado: solo quedan cubiertos los terminos exactos `vape`, `vapes`, `vapeo` y `420`; no hay claim de full synonym coverage ni semantic search.

## 5. No reabrir
- Implementacion o runtime.
- Rutas/componentes fuera de docs.
- Helper artifacts.
- Remote Supabase.
- Deploy.
- `db push` / `db reset`.
- Césarín, Product Search retrieval/embeddings, semantic/vector search, Gemini, checkout, admin, DB/schema, `/ofertas`, PDP related products, hero clarity, full search engine rewrite, full synonym engine o broader Product Discovery.

## 6. Siguiente paso correcto
- Verificar diff limitado a docs/canon.
- Confirmar que no hay cambios source/runtime.
- Commit de documentacion/canon solamente.
