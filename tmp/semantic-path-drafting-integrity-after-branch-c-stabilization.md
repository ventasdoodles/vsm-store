# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD REVIEW LANE — SEMANTIC PATH DRAFTING INTEGRITY AFTER BRANCH C STABILIZATION

## 1. qué cambió en tu entendimiento tras inspección

El path semántico ya no está débil por transporte de datos.

La debilidad principal ahora es de **consumo desigual**:

- `ai_sales_note` sí llega al drafting semántico
- pero hoy queda prácticamente sin usar

El siguiente choke point no es otro bridge; es una **asimetría de jerarquía de uso** frente al exact path.

## 2. qué quedó validado

En el path semántico, hoy sí llegan al drafting:

- `ai_sales_note`
- `specs`
- `description`

Eso queda validado por:

- [ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
  - `match_products` pasa por `hydrateSemanticSpecs(...)`
  - `mapDbToInternal()` mapea `ai_sales_note`, `description`, `specs`
- [ai-capsule-schemas.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/ai-capsule-schemas.ts)
  - `internalResolvedProductSchema` admite los tres campos

Jerarquía actual real en BRANCH E:

- `specs` primero
- `description` después
- `ai_sales_note` no se usa

Eso significa:

- `specs` está bien aprovechado
- `description` está usado con disciplina de fallback
- `ai_sales_note` está **presente pero subutilizado**

También queda validado que BRANCH E no está roto; está funcional, pero con asimetría respecto al exact path.

La otra rama aún delgada es BRANCH F (`NO_MATCH`), pero ahí el valor incremental es menor porque casi no hay contexto producto para explotar.

## 3. qué sigue abierto

Sigue abierto si `ai_sales_note` debe entrar en BRANCH E como:

- primera preferencia semántica
- o sólo como fallback disciplinado antes de `description`

Sigue abierto el riesgo de redundancia:

- `ai_sales_note` puede solaparse con `specs`
- `description` puede volver redundante lo que ya dicen nombre/categoría

Pero el hueco estructural más claro hoy es:

- **semantic branch con `ai_sales_note` disponible pero ignorado**

## 4. qué lane exacto apruebas para Antigravity

Apruebo un lane pequeño de **semantic drafting hierarchy alignment** en:

- [src/lib/product-search-capsule.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/lib/product-search-capsule.ts)

Objetivo exacto:

- revisar BRANCH E solamente
- incorporar `ai_sales_note` de forma disciplinada cuando exista y aporte valor
- mantener `specs` y `description` como soporte, no reabrir bridges

La oportunidad de más valor hoy es:

- alinear el branch semántico con el hecho de que `ai_sales_note` ya está disponible downstream

## 5. riesgos / no-goals

No tocar:

- [src/services/ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- RPCs
- schemas
- exact path
- UI

No-goals:

- no reabrir BRANCH C
- no hacer otro bridge de datos
- no convertir BRANCH E en copy más agresivo o salesy
- no hacer overhaul multi-branch

Riesgo principal:

- meter `ai_sales_note` sin filtro y volver BRANCH E más redundante o demasiado confiado
