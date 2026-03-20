# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Execution Lane — Use Curated Specs in Semantic Product Response Drafting

## Scope

- `src/services/ai-capsule-orchestrator.service.ts`
- `src/lib/ai-capsule-schemas.ts`
- `src/lib/product-search-capsule.ts`

## Intent

- Hacer que los semantic product matches puedan usar 1–2 facts curados derivados de `specs`.
- No pasar `specs` crudas al draft.
- No tocar UI/card rendering.
- No tocar compatibilidad.
- No tocar docs/canon.

## Current cold truth

- `specs` existen y están persistidas.
- `specs` no están siendo usadas downstream de forma material en Cesarin.
- El mejor siguiente puente es el drafting semántico del `product_search_integrity` path.

## Design constraints

- Mantener `EXACT` + `ai_sales_note` sin regresión.
- Mejorar sólo el drafting de `SEMANTIC`.
- Máximo 1–2 facts útiles por producto.
- Fallback limpio cuando `specs` estén vacías o sean pobres.

## Validation target

- Al menos un semantic match debe poder justificar mejor por qué encaja usando facts derivados de `specs`.
- Productos sin `specs` suficientes deben seguir respondiendo con el draft genérico actual.
