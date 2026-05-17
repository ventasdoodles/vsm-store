# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.
> Live canon is now current-state-first: `AI_CONTEXT.md` summarizes active technical truth, `AUDIT_LOG.md` is the chronological index, and detailed evidence lives in `docs/audits/` plus `docs/archive/` snapshots.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Fecha: 2026-05-16
- Bloque vigente: post canonizacion del contrato local/tested no-write smoke-readiness de `customer-intelligence` en `0795c51`, post canon `8e0dab7`, y post split documental de canon hacia current-state index + audit archives.
- Baseline esperado despues del split: `main` alineado con `origin/main` tras el commit doc-only correspondiente.

## 2. Estado autoritativo actual
- `AI_CONTEXT.md` queda como fuente tecnica live/current-state-first.
- `AUDIT_LOG.md` queda como indice cronologico compacto.
- `STORE_FRONT_AI_PILOT_CONTEXT.md` queda tactico para Cesarin/storefront.
- Detalle historico focalizado vive en `docs/audits/2026-05/`.
- Snapshots completos pre-split viven en `docs/archive/`.
- No se permite crear `AI_CONTEXT2.md` ni `AUDIT_LOG2.md` como continuacion lineal.

## 3. Ultimos hitos cerrados
- No-write customer-intelligence smoke readiness: aceptado con riesgo residual y canonizado. Commit `0795c51`; canon `8e0dab7`; contract identity `customer_intelligence_no_write_v1`.
- Seed_runner typecheck strictness repair: aceptado con riesgo residual y canonizado. Commit `70ca5f2`; project-wide `npm run typecheck` green at that lane.
- Cesarin knowledge main-message synthesis improvement: aceptado con riesgo residual y canonizado. Commit `c65ba23`.
- Post-Gemini-repair ingest verification: aceptada con riesgo residual. Run `25969669995` PASS.
- Ingest failure-mode safety observation: aceptada como evidencia historica con riesgo residual. Run `25947955038` failed por Gemini `403 PERMISSION_DENIED`, pero mostro safety behavior.

## 4. Residuos explicitos
- No live retrieval-to-answer proof.
- No remote `customer-intelligence` smoke.
- No Edge HTTP no-write smoke execution.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No semantic completeness proof.
- `metadata.embedding_dims` mismatch sigue abierto salvo reparacion futura.
- Retained inactive embedded rows siguen como residual no bloqueante salvo limpieza futura.
- Remote sandbox RPC smoke y production admin UI observation siguen sin resolver salvo canon nuevo.
- Migration history divergence sigue intencionalmente sin reparar.

## 5. Lanes cerrados / no reabrir
- Post-Gemini Run Knowledge Ingestion verification.
- `store_knowledge` active corpus repair.
- Direct `match_knowledge` retrieval smoke.
- Local no-mutation AIConcierge chunk visibility harness.
- Local no-mutation Cesarin service-level knowledge harness.
- `store_knowledge` ingestion activation safety hardening.
- Ingest failure-mode safety observation.
- Post-Gemini-repair Run Knowledge Ingestion runtime verification.
- Local no-mutation Cesarin knowledge main-message synthesis improvement.
- Seed-runner local typecheck strictness repair.
- No-write customer-intelligence smoke readiness.

## 6. Proximo paso correcto
- Despues del split documental, Codex debe hacer acceptance audit del commit doc-only antes de seleccionar el siguiente hito tecnico/productivo.

## 7. Regla de continuidad
- Si cambia el frente real, este archivo se reemplaza.
- Si el canon cambia, el contexto temporal se actualiza; nunca al reves.
- No cargar la historia completa en prompts futuros; usar `AI_CONTEXT.md` + `AUDIT_LOG.md` + detalle especifico en `docs/audits/` segun necesidad.
