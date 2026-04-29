# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Home Featured Category Route/Content Canon Reconciliation
- Fecha: 2026-04-29
- Mission objective activa: registrar en canon la aceptacion del slice Home featured category route/content integrity
- Esta meta sigue abierta hasta: dejar `AI_CONTEXT.md`, `AUDIT_LOG.md` y `STORE_FRONT_AI_PILOT_CONTEXT.md` alineados sin tocar implementacion, runtime, DB, deploy ni helper artifacts

## 2. Estado autoritativo de entrada
- Commit aceptado: `bf925f3a371798d6193e9b987caa7048c4958e95` (`fix home featured category routes`).
- Veredicto aceptado: `ACCEPT WITH MINOR RESIDUAL RISK`.
- Slice aceptado: Home featured category route/content integrity.
- La vitrina/Césarín, Product Search, checkout, admin, DB/schema, remote Supabase, `/ofertas`, `/buscar` y PDP related products no se reabren desde esta tarea.

## 3. Riesgo principal del bloque
- Inflar el alcance y hacer parecer que toda la coherencia de merchandising, busqueda, ofertas, PDP relacionados o Product Discovery quedo resuelta.
- Confundir el normalizador Home-only con un sistema global de validacion de slugs admin-configurados.
- Tocar codigo, runtime, helper artifacts, DB, deploy o Supabase remoto durante un pase que es solo docs/canon.

## 4. Resultado que debe dejar este bloque
- Canon actualizado con hechos aceptados:
  - `LÃ­quidos` corregido a `Líquidos`.
  - `Líquidos` -> `/vape/liquidos`.
  - `Pods & Mods` -> `/vape/mods`.
  - `Cannabis Premium` -> `/420/concentrados`.
  - `Accesorios` -> `/vape/accesorios-vape`.
  - normalizador bounded Home-only para valores stale conocidos.
- Auditoria registrada como cierre aceptado con riesgo menor.
- Residual explicitado: slugs invalidos futuros arbitrarios configurados por admin no quedan globalmente impedidos.

## 5. No reabrir
- Implementacion o runtime.
- Rutas/componentes fuera de docs.
- Helper artifacts.
- Remote Supabase.
- Deploy.
- `db push` / `db reset`.
- Césarín, Product Search, checkout, admin, DB/schema, `/ofertas`, `/buscar`, PDP related products, hero clarity o broader Product Discovery.

## 6. Siguiente paso correcto
- Verificar diff limitado a docs/canon.
- Confirmar que no hay cambios source/runtime.
- Commit de documentacion/canon solamente.
