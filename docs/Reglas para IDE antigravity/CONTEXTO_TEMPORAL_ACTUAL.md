# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.
> Live canon is now current-state-first: `AI_CONTEXT.md` summarizes active technical truth, `AUDIT_LOG.md` is the chronological index, and detailed evidence lives in `docs/audits/` plus `docs/archive/` snapshots.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Fecha: 2026-05-17
- Bloque vigente: post unsupported delivery-guarantee retrieval guard hardening `2443caa`, aceptado con riesgo residual como prueba local/source solamente, sobre fa305b2 live six-prompt no-write RAG smoke partial evidence, unsupported delivery-guarantee successful RAG-path hardening `826927f`, payment/shipping-cost no-write RAG smoke path hardening `cb6311e`, unsupported delivery guarantee degraded fallback answer-shaping `9637596`, no-write error metadata preservation `7905b60`, multi-prompt no-write RAG quality trigger `3f61e13`, scoped local RAG answer-quality harness `3f7bb4b`, y single deployed no-write `customer-intelligence` smoke con contract `customer_intelligence_no_write_v1`.
- Baseline esperado: `main` alineado con `origin/main` tras el commit doc-only correspondiente.

## 2. Estado autoritativo actual
- `AI_CONTEXT.md` queda como fuente tecnica live/current-state-first.
- `AUDIT_LOG.md` queda como indice cronologico compacto.
- `STORE_FRONT_AI_PILOT_CONTEXT.md` queda tactico para Cesarin/storefront.
- Detalle historico focalizado vive en `docs/audits/2026-05/`.
- Snapshots completos pre-split viven en `docs/archive/`.
- No se permite crear `AI_CONTEXT2.md` ni `AUDIT_LOG2.md` como continuacion lineal.

## 3. Ultimos hitos cerrados
- Unsupported delivery-guarantee retrieval guard hardening: aceptado con riesgo residual. Commit `2443caa`; patch local/source estrecho en `src/lib/knowledge-rag-capsule.ts` y `src/lib/__tests__/knowledge-rag-capsule.test.ts`. Reemplaza el gate previo solo-OCURRE por un clasificador de evidencia de dos niveles: `ocurre_policy` conserva grounding fuerte DHL OCURRE / sucursal cuando existe, y `shipping_timing_policy` activa con evidencia DHL/shipping de tiempo, corte, estimado, costo, cobertura o confirmacion. Para premisas de garantia de entrega manana/a domicilio, ahora puede rechazar/calificar aun sin chunks OCURRE/no-domicilio; los tiempos quedan como estimados/condicionales y no se confirma entrega garantizada. No cambia no-write trigger ni metadata. Validado localmente con 3 files / 20 tests, ESLint, typecheck, diff check, y secret scan sin valores secretos.
- Unsupported delivery-guarantee successful RAG-path hardening: aceptado con riesgo residual. Commit `826927f`; patch local/source estrecho en `src/lib/knowledge-rag-capsule.ts`, `src/lib/__tests__/knowledge-rag-capsule.test.ts`, y `src/services/ai-capsule-orchestrator.service.ts`. `evaluateKnowledgeRAGTree` acepta query context opcional y `executeKnowledgeCapsule` pasa `toolArgs.query`; el guard detecta unsupported shipping-promise questions, exige evidencia de shipping / DHL OCURRE / sucursal en chunks resueltos, y responde que no se confirma entrega garantizada al dia siguiente a domicilio, aterriza a DHL ocurre / sucursal, y pide confirmar tiempos/costos antes de cerrar la orden. Validado localmente con 3 files / 19 tests, ESLint, typecheck, diff check, y secret scan sin valores secretos.
- fa305b2 live six-prompt no-write RAG smoke partial evidence: veredicto PARTIAL / NEEDS TARGETED FIX. Freshness previa: runtime storefront `fa305b2`, fingerprint `v113-fa305b2`, assets con marcadores `826927f` y marcadores no-write trigger/audit. Se ejecuto exactamente un smoke autenticado via trigger `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, `ci_rag_quality_smoke=true`; corrio solo `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, y `unsupported_delivery_guarantee`. Los seis mostraron `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, writes suprimidos `ai_customer_memory` / `ai_analytics`, call suprimida `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, answer/main message present, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, y `3` chunks. La prueba sigue parcial: `unsupported_delivery_guarantee` no rechazo/califico claramente la garantia de entrega manana a domicilio; hipotesis: el guard `826927f` no activo porque retrieval devolvio chunks de estimado/corte/local delivery en vez de evidencia OCURRE/no-domicilio.
- Partial six-prompt no-write RAG smoke evidence: veredicto PARTIAL / NEEDS TARGETED FIX. Runtime storefront `d50379e`, fingerprint `v113-d50379e`, run deploy-functions `26000841773` success, `Deploy customer-intelligence` success, y source desplegado conteniendo `cb6311e`, `7905b60`, y `9637596`. Se ejecuto exactamente un smoke autenticado via trigger `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, `ci_rag_quality_smoke=true`; corrio solo `payment_method`, `shipping_scope`, `shipping_cost`, `combined_payment_shipping`, `store_hours_limitation`, y `unsupported_delivery_guarantee`. Los seis mostraron `status: ok`, `metadata: present`, contract `customer_intelligence_no_write_v1`, writes suprimidos `ai_customer_memory` / `ai_analytics`, call suprimida `cesarin-qa-judge`, capsule `knowledge_rag_foundation`, match `MODERATE_CONFIDENCE_MULTI_SOURCE`, y `3` chunks. La prueba de calidad queda parcial: `unsupported_delivery_guarantee` necesitaba fix al momento del smoke y queda cubierto solo local/source en `826927f`; `store_hours_limitation`, `payment_method`, y `shipping_cost` conservan residuales.
- Payment/shipping-cost no-write RAG smoke path hardening: aceptado con riesgo residual. Commit `cb6311e`; bajo `customer_intelligence_no_write_v1`, los prompts exactos `¿Aceptan tarjeta o cómo puedo pagar?` y `¿Cuánto cuesta el envío por DHL?` se fuerzan a `POLICY_INQUIRY` / `knowledge_rag_foundation` en vez de `storefront_checkout_readiness`; checkout-readiness normal sigue intacto para frases como `ya puedo pagar?`; el audit sanitizado distingue `edge_metadata_present` de `request_contract_present`; validado localmente con 4 files / 70 tests, ESLint, typecheck, diff check, y secret scan sin valores secretos.
- No-write error metadata preservation: aceptado con riesgo residual. Commit `7905b60`; errores Edge reconocidos como `customer_intelligence_no_write_v1` incluyen metadata sanitizada `no_write_smoke`; el servicio conserva metadata de error responses; se suprime client telemetry para no-write error paths; el hook renderiza audit rows con metadata presente cuando existe; validado localmente con 3 files / 25 tests, ESLint, typecheck, diff check, y secret scan sin valores secretos.
- Unsupported delivery guarantee answer-shaping: aceptado con riesgo residual. Commit `9637596`; agrega fallback local deterministico `unsupported_shipping_promise_limit` para promesas no soportadas de envio/garantia cuando hay contexto de politica de envio; indica que no se puede confirmar entrega garantizada al dia siguiente a domicilio; aterriza envio a DHL OCURRE / sucursal; exige confirmar tiempo/costo antes de cerrar la orden; validado localmente con 2 files / 13 tests, ESLint, typecheck, diff check, y secret scan sin valores secretos.
- Multi-prompt no-write RAG quality trigger: aceptado con riesgo residual. Commit `3f61e13`; requiere `ci_no_write_smoke=true`, `smoke_contract=customer_intelligence_no_write_v1`, y `ci_rag_quality_smoke=true`; corre solo seis prompts allowlisted; cada request usa `conciergeService.chat` con `{ noWriteSmoke: true }`; validado localmente con 2 files / 46 tests, ESLint, typecheck, diff check, y secret-pattern scan sin valores secretos.
- Scoped local RAG answer-quality harness: aceptado con riesgo residual. Commit `3f7bb4b`; cubre seis categorias policy/RAG con fixtures deterministicos y sin Edge/Supabase/DB/network/provider/live app/workflow/deploy/ingestion/smoke.
- Post-deploy live no-write customer-intelligence smoke: aceptado con riesgo residual. Commit workflow `626a730`; run `25980183647` success; one deployed authenticated smoke; contract `customer_intelligence_no_write_v1`; capsule `knowledge_rag_foundation`; match `MODERATE_CONFIDENCE_MULTI_SOURCE`; chunks `3`.
- Deploy-functions customer-intelligence refresh: run `25980183647` por `workflow_dispatch` desplego `knowledge-ingestor`, `customer-intelligence`, `create-payment`, y `mercadopago-webhook` con conclusion success.
- No-write customer-intelligence smoke readiness: aceptado con riesgo residual y canonizado. Commit `0795c51`; canon `8e0dab7`; contract identity `customer_intelligence_no_write_v1`.
- Seed_runner typecheck strictness repair: aceptado con riesgo residual y canonizado. Commit `70ca5f2`; project-wide `npm run typecheck` green at that lane.
- Cesarin knowledge main-message synthesis improvement: aceptado con riesgo residual y canonizado. Commit `c65ba23`.
- Post-Gemini-repair ingest verification: aceptada con riesgo residual. Run `25969669995` PASS.
- Ingest failure-mode safety observation: aceptada como evidencia historica con riesgo residual. Run `25947955038` failed por Gemini `403 PERMISSION_DENIED`, pero mostro safety behavior.

## 4. Residuos explicitos
- Live retrieval-to-answer proof queda limitado al single post-deploy no-write `customer-intelligence` smoke de politica/envio/pago y al partial six-prompt no-write RAG smoke descrito arriba.
- Remote `customer-intelligence` smoke queda limitado a esos smokes deployed app-triggered explicitamente descritos.
- El partial six-prompt smoke prueba ejecucion del trigger desplegado y metadata visible de supresion no-write para ese run, no full answer quality ni all-routes safety.
- No DB transaction-log mutation absence proof.
- No claim de consistencia interna completa del corpus/politica de pago/envio.
- `unsupported_delivery_guarantee` tiene fix desplegado/fresh para successful client-capsule RAG path en `826927f`, pero el live rerun `fa305b2` sigue parcial porque el set recuperado no incluyo evidencia OCURRE/no-domicilio requerida por el guard. `2443caa` corrige local/source ese gap para sets con evidencia de timing/corte DHL/shipping, pero todavia no tiene deployed availability ni live smoke.
- Cualquier server-side Sommelier path distinto que evite el client-capsule mapper sigue sin prueba.
- `store_hours_limitation` queda ACCEPT WITH RESIDUAL: devolvio horarios de WhatsApp/soporte/confirmacion de pedidos, no prueba de horario general de tienda.
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
- Scoped local RAG answer-quality harness.
- Multi-prompt no-write RAG quality trigger.
- No-write error metadata preservation.
- Unsupported delivery guarantee answer-shaping.
- Payment/shipping-cost no-write RAG smoke path hardening.
- Partial six-prompt no-write RAG smoke evidence.
- Unsupported delivery-guarantee successful RAG-path hardening.
- fa305b2 live six-prompt no-write RAG smoke partial evidence.
- Unsupported delivery-guarantee retrieval guard hardening.

## 6. Proximo paso correcto
- Despues de esta canonizacion, Codex debe hacer acceptance audit del commit doc-only antes de seleccionar el siguiente hito tecnico/productivo.

## 7. Regla de continuidad
- Si cambia el frente real, este archivo se reemplaza.
- Si el canon cambia, el contexto temporal se actualiza; nunca al reves.
- No cargar la historia completa en prompts futuros; usar `AI_CONTEXT.md` + `AUDIT_LOG.md` + detalle especifico en `docs/audits/` segun necesidad.
