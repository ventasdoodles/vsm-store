# CONTEXTO TEMPORAL ACTUAL

> Punto de anclaje rapido para el bloque vigente.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Chat / sesion: Post DISABLE_QA_JUDGE local/dev toggle + Cesarin V1/V2 eval
- Fecha: 2026-05-11
- Mission objective activa: preservar continuidad y enrutar el siguiente bloque de trabajo correctamente despues de ACCEPT WITH BLOCKER
- Esta meta sigue abierta hasta: que el usuario elija un nuevo frente (roadmap/readiness) o hasta que las condiciones de cuota/key de Gemini mejoren para un V3 eval

## 2. Estado autoritativo de entrada
- Commit de implementacion aceptado y empujado: `d0812a4` (`feat(edge): add DISABLE_QA_JUDGE env toggle for local dev`)
- Commit de canon aceptado y empujado: `8b6b8e9` (`docs: canonize local QA judge dev toggle`)
- origin/main contiene ambos commits
- main alineado con origin/main (ahead 0 / behind 0)
- DISABLE_QA_JUDGE toggle probado y cerrado: 14/14 requests sin QA Judge, 0/14 wall-clock timeouts
- Evaluacion de calidad completa 7/7 de Cesarin bloqueada por Gemini free-tier 429
- match_products existe localmente (correccion de falso negativo previo; probar con vector(768), no con [])
- Slices cerrados 1-16 de Storefront Product Discovery and Merchandising Coherence se preservan
- Todos los lanes de Cesarin Core Refactor (Waves 1-7, post-refactor convergence, commercial hardening, trust, decision flow, cleanup, recovery, spine, de-scaffolding, judgment tightening, selector-needed, tool-selection, Stage 5 thinning, availability truth, text-only, direct-answer, attribute precision, truth spine, telemetry, search-leading grounding, store-hours, degraded policy, replenishment, order tracking, warranty, loyalty, OOS pivot, kitting, checkout readiness, budget rescue, clarification-first) se preservan cerrados

## 3. Que se hizo en este bloque
- Se implemento: toggle DISABLE_QA_JUDGE en `supabase/functions/customer-intelligence/index.ts` (d0812a4)
- Se audito: acceptance audit por Codex del commit de implementacion y del commit de canon
- Se valido: V1 y V2 local 7-prompt Cesarin eval con DISABLE_QA_JUDGE=true, payload autenticado, 14 requests combinados
- Se documento/canonizo: AI_CONTEXT.md, AUDIT_LOG.md, STORE_FRONT_AI_PILOT_CONTEXT.md actualizados en 8b6b8e9
- Se corrigio: match_products no esta missing (falso negativo anterior por llamada con [] en vez de vector(768))

## 4. Resultado real del bloque
- Que si quedo terminado:
  - DISABLE_QA_JUDGE toggle: PROVEN, implementado, canonizado, empujado
  - QA Judge skip: 14/14
  - Wall-clock timeouts eliminados: 0/14
  - Pipeline correcto cuando Gemini responde: 6/14 (prompts 1, 3, 4, 5 con al menos una respuesta limpia entre V1 y V2)
  - Code defects: 0
  - Repo mutations: 0
  - match_products: EXISTS, corregido
- Que quedo a medias:
  - Evaluacion de calidad completa 7/7 de Cesarin (3 prompts nunca tuvieron respuesta limpia: `que me recomiendas barato`, `que pasa si no encuentro un producto`, `compara un vape barato contra uno mejor`)
- Que quedo en hold:
  - V3 rerun de Cesarin eval hasta que cuota/key de Gemini mejore
- Que sigue siendo inferido o no probado:
  - Calidad de respuesta de Cesarin en prompts de producto/comparacion bajo condiciones no degradadas

## 5. Estado de salida
- Baseline actual: origin/main con d0812a4 + 8b6b8e9, tracked clean, staged empty, 38 untracked helpers preservados
- Siguiente paso correcto: ROADMAP / READINESS para elegir el siguiente bloque del proyecto, o V3 eval solo si hay key/cuota nueva
- Herramienta que debe intervenir despues: ChatGPT (orquestar roadmap) o Antigravity (V3 eval si hay cuota)
- Tipo de prompt que sigue: ROADMAP / READINESS o VALIDATION / SMOKE (solo con cuota recuperada)

## 6. Riesgos y alertas
- Riesgos vivos:
  - Gemini free-tier 429 RESOURCE_EXHAUSTED bloquea evaluacion de calidad completa
  - No intentar reruns si la cuota/key sigue agotada
  - No imprimir tokens/secrets locales en logs de terminal
- Dependencias externas:
  - Cuota/key de Gemini API para evaluacion de calidad
- Puntos que pueden degradar por falta de datos o cuota:
  - Respuestas de Cesarin en prompts de producto/comparacion/budget cuando Gemini esta rate-limited

## 7. No reabrir
- Lanes cerrados:
  - DISABLE_QA_JUDGE toggle (d0812a4) — implementacion cerrada
  - Canon reconciliation para d0812a4 (8b6b8e9) — cerrada
  - match_products substrate — EXISTS, no abrir lane
  - Broad Cesarin refactor — no autorizado
  - Product Search fix — no autorizado
  - Remote Supabase — no autorizado
  - Migrations/db push/db reset/deploy — no autorizado
  - .env edits — no autorizado
  - Slices 1-16 de Storefront Product Discovery — cerrados
  - Cesarin Core Refactor Waves 1-7 + todos los lanes post-refactor — cerrados
- Discusiones ya resueltas:
  - match_products no esta missing (confirmado con vector(768))
  - Pipeline de Cesarin es correcto cuando Gemini responde
  - QA Judge toggle funciona (14/14)
- Micro-issues sin prioridad:
  - supabase/.temp/cli-latest aparece como modified noise benigno
  - 38 untracked helpers preservados sin cleanup

## 8. Regla de continuidad
- Este contexto temporal solo vale mientras la meta activa siga vigente.
- Si cambia el frente real, reemplazar `CONTEXTO_TEMPORAL_ACTUAL.md`.
- Si el canon cambia, el contexto temporal se actualiza; nunca al reves.
