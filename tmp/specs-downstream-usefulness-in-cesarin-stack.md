# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cold Gap Audit — Specs Downstream Usefulness in Cesarin Stack

## 1. What changed

- `specs` ya existen como dato persistido de producto, pero su consumo downstream real en Cesarin sigue siendo casi nulo.
- El stack actual usa `ai_sales_note` como puente narrativo principal; `specs` todavía no participan de forma material en el reasoning ni en la respuesta al cliente.

## 2. What is validated

### Current Cesarin paths that consume `specs`

- No encontré consumo downstream significativo de `specs` en:
  - `src/services/concierge.service.ts`
  - `src/services/ai-capsule-orchestrator.service.ts`
  - `src/lib/product-search-capsule.ts`
  - `src/lib/ai-capsule-schemas.ts`
  - `src/lib/ai-capsule-mappers.ts`
  - `supabase/functions/customer-intelligence/tools.ts`
  - `src/components/ui/ai/AIConcierge.tsx`

### Influence today

- `product search`
  - No: exact query no selecciona `specs`
  - No: semantic RPC path no transporta `specs`
- `retrieval`
  - No: `match_products` alimenta semantic match sin evidencia de `specs`
  - No: `search_products` en `customer-intelligence/tools.ts` trabaja con nombre, precio y stock
- `response generation`
  - No: `product-search-capsule.ts` redacta mensajes con texto fijo
  - Exact match usa `ai_sales_note`, no `specs`
  - Semantic match usa copy genérico, no `specs`
- `compatibility/helpfulness`
  - No: `check_compatibility` usa `concept_aliases` y `compatibility_relations`, no `specs`
- `product card rendering`
  - No: `AIConcierge.tsx` renderiza nombre, precio y `ai_sales_note` cuando existe, pero no `specs`

### Practical truth

- `specs` hoy aportan valor en persistencia/admin/editor.
- `specs` hoy no aportan valor downstream real en la experiencia Cesarin al cliente.

## 3. What remains open

- Sigue abierto qué forma mínima de `specs` conviene exponer downstream:
  - objeto completo
  - subset curado
  - o resumen derivado
- Sigue abierto si el bridge debe priorizar:
  - exact path
  - semantic path
  - o ambos dentro del mismo capsule lane

## 4. What is approved

- Aprobado:
  - `specs` no están siendo consumidas de forma significativa en Cesarin hoy
- No aprobado:
  - abrir un lane de UI/card rendering como siguiente paso principal
  - abrir primero un lane de compatibilidad basado en `specs`

### Single highest-value next bridge

- `product_search_integrity` response drafting
- Prioridad práctica:
  - **semantic product response drafting**

### Why

- El semantic path hoy es el más genérico y el que más ganaría contexto explicativo útil.
- El exact path ya tiene una mejora narrativa parcial vía `ai_sales_note`.
- `specs` tendrían más impacto si ayudan a justificar por qué una recomendación semántica encaja.

## 5. Exact next move

- Abrir un lane pequeño centrado en el `product_search_integrity` capsule path para que el semantic match pueda usar `specs` en su drafting.
- Surface mínimo probable de trabajo:
  - `src/services/ai-capsule-orchestrator.service.ts`
  - `src/lib/ai-capsule-schemas.ts`
  - `src/lib/product-search-capsule.ts`
  - y la capa de retrieval que hoy alimenta el semantic path si hace falta transportar `specs`

- Objetivo:
  - hacer que las recomendaciones semánticas no sólo digan “encajan con lo que pides”
  - sino que puedan justificarlo con 1–2 datos estructurados realmente útiles derivados de `specs`
