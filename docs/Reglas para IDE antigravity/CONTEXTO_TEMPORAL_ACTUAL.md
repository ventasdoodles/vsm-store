# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.
> Live canon is now current-state-first: `AI_CONTEXT.md` summarizes active technical truth, `AUDIT_LOG.md` is the chronological index, and detailed evidence lives in `docs/audits/` plus `docs/archive/` snapshots.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Fecha: 2026-05-16
- Bloque vigente: post deploy-functions workflow patch `626a730`, post workflow_dispatch `25980183647` success, y post accepted single deployed no-write `customer-intelligence` smoke con contract `customer_intelligence_no_write_v1`.
- Baseline esperado: `main` alineado con `origin/main` tras el commit doc-only correspondiente.

## 2. Estado autoritativo actual
- `AI_CONTEXT.md` queda como fuente tecnica live/current-state-first.
- `AUDIT_LOG.md` queda como indice cronologico compacto.
- `STORE_FRONT_AI_PILOT_CONTEXT.md` queda tactico para Cesarin/storefront.
- Detalle historico focalizado vive en `docs/audits/2026-05/`.
- Snapshots completos pre-split viven en `docs/archive/`.
- No se permite crear `AI_CONTEXT2.md` ni `AUDIT_LOG2.md` como continuacion lineal.

## 3. Ultimos hitos cerrados
- Post-deploy live no-write customer-intelligence smoke: aceptado con riesgo residual. Commit workflow `626a730`; run `25980183647` success; one deployed authenticated smoke; contract `customer_intelligence_no_write_v1`; capsule `knowledge_rag_foundation`; match `MODERATE_CONFIDENCE_MULTI_SOURCE`; chunks `3`.
- Deploy-functions customer-intelligence refresh: run `25980183647` por `workflow_dispatch` desplego `knowledge-ingestor`, `customer-intelligence`, `create-payment`, y `mercadopago-webhook` con conclusion success.
- No-write customer-intelligence smoke readiness: aceptado con riesgo residual y canonizado. Commit `0795c51`; canon `8e0dab7`; contract identity `customer_intelligence_no_write_v1`.
- Seed_runner typecheck strictness repair: aceptado con riesgo residual y canonizado. Commit `70ca5f2`; project-wide `npm run typecheck` green at that lane.
- Cesarin knowledge main-message synthesis improvement: aceptado con riesgo residual y canonizado. Commit `c65ba23`.
- Post-Gemini-repair ingest verification: aceptada con riesgo residual. Run `25969669995` PASS.
- Ingest failure-mode safety observation: aceptada como evidencia historica con riesgo residual. Run `25947955038` failed por Gemini `403 PERMISSION_DENIED`, pero mostro safety behavior.

## 4. Residuos explicitos
- Live retrieval-to-answer proof queda limitado al single post-deploy no-write `customer-intelligence` smoke de politica/envio/pago.
- Remote `customer-intelligence` smoke queda limitado a ese single deployed app-triggered no-write smoke.
- Edge HTTP no-write metadata evidence queda limitado al audit block sanitizado de ese smoke.
- No production Cesarin answer-quality proof.
- No full RAG quality proof.
- No Product Search quality proof.
- No broad production readiness ni all-routes `customer-intelligence` safety proof.
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
- Post-deploy live no-write customer-intelligence smoke.

## 6. Proximo paso correcto
- Despues de esta canonizacion, Codex debe hacer acceptance audit del commit doc-only antes de seleccionar el siguiente hito tecnico/productivo.

## 7. Regla de continuidad
- Si cambia el frente real, este archivo se reemplaza.
- Si el canon cambia, el contexto temporal se actualiza; nunca al reves.
- No cargar la historia completa en prompts futuros; usar `AI_CONTEXT.md` + `AUDIT_LOG.md` + detalle especifico en `docs/audits/` segun necesidad.
