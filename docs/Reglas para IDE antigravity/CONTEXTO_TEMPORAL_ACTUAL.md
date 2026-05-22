# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.
> No es canon de producto ni reemplaza `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md` ni `docs/audits/`.

## 1. Identidad del bloque
- Proyecto: VSM Store.
- Fecha del snapshot: 2026-05-22.
- Rol de este archivo: snapshot temporal de ejecucion y handoff, no historial ni fuente primaria de verdad.
- Canon vigente: usar `AI_CONTEXT.md` para verdad tecnica current-state-first, `AUDIT_LOG.md` como indice cronologico, `STORE_FRONT_AI_PILOT_CONTEXT.md` como contexto tactico storefront/Cesarin, y `docs/audits/` para evidencia detallada.

## 2. Baseline actual de entrada
- Rama esperada: `main`.
- Estado esperado: `main` limpio y alineado con `origin/main`.
- Ultimo bloque aceptado antes de este snapshot: customer-intelligence recovery + Typewriter UX (`d69dc05`, `5f4d169`, `059e3e5`, `ebae4bf`, `6ad7f31`), canonizado como verdad local/bounded.
- Hito work-kit reciente: `README_WORKKIT.md` fue reducido a entrypoint/order-of-reading y ACCEPTED por Codex.
- No hay reconciliacion canon/doc pendiente para ese hito ni para el bloque customer-intelligence recovery + Typewriter UX.

## 3. Estado operativo actual
- Estado de ciclo: STOP / sin hito product-runtime activo.
- No abrir Product Search, Cesarin runtime, DB/Supabase, deploy, workflow, live smoke, secrets, source/runtime o canon sin prompt explicito.
- El siguiente trabajo debe seleccionarse en una lane separada de roadmap/readiness o por instruccion explicita del usuario.

## 4. Residuales vivos que afectan handoff
- DB/RAG metadata observation: ACCEPTED AS OBSERVED RESOLVED FOR CURRENT ROWS.
- La observacion read-only aceptada vio `41` filas actuales de `store_knowledge`: `41` activas con `metadata.embedding_dims=768`, `0` con `3072` observado y `0` sin dims observado.
- `politica-envios-detallada-v1` y `politica-pagos-v2` tienen `4` filas activas embebidas cada una, dimension derivada `768`, `metadata.embedding_dims=768` y `metadata.embedding_model=models/gemini-embedding-001`.
- Retained inactive embedded rows quedan aceptadas como observadas ausentes para el resultado actual del observer: `inactiveWith768=0`, `inactiveWith3072=0` e `inactiveMissingDims=0`.
- Esto no prueba estado DB futuro, semantic content correctness, Product Search quality, Cesarin runtime behavior, production readiness, cleanup, ingestion, deploy, workflow, live smoke ni secret/auth proof.
- Customer-intelligence recovery + Typewriter UX: ACCEPTED WITH RESIDUAL RISK. `tool_calls` malformed non-array cae a fallback neutral con metadata sanitizada; `response_schema` Analyst queda preservado por tests locales, no por provider proof; Google-first Gemini rule aplica solo a detalles de integracion Google/Gemini; token telemetry queda sanitizada como metadata; Typewriter UX queda aceptado por tests locales y visual QA local bounded para welcome latest assistant.
- Ese bloque no prueba production runtime behavior, deployed bundle behavior, provider/Gemini acceptance, deploy/live smoke/secrets/provider calls, ni real chat send-flow visual QA.

## 5. Lanes cerrados / no reabrir por arrastre
- `product_search_integrity` queda cerrado como wording governance solamente.
- Product Search runtime/retrieval/compatibility quality sigue en hold salvo seleccion explicita.
- Cesarin runtime y live model/provider evaluation siguen cerrados salvo seleccion explicita.
- Local validation baselines aceptados no prueban produccion ni runtime broad behavior.
- Para la lista completa de closed lanes y non-claims, consultar `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md` y los audit details relevantes.

## 6. Regla de continuidad
- Si cambia el frente real, reemplazar este snapshot.
- Si cambia el canon, actualizar este snapshot despues; nunca usar este archivo para cambiar canon.
- No cargar historia larga en prompts futuros; resumir solo meta activa, baseline, bloqueos, residual vivo y siguiente herramienta.
