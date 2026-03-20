# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Cold Gap Audit — ai_sales_note Coverage in Semantic Product Match Path

## 1. What changed

- El gap existe, pero es más estrecho de lo que parecía.
- `ai_sales_note` ya está soportado en:
  - schema
  - mapper interno
  - mapping frontend/public
- La pérdida ocurre en la capa de retrieval semántico.

## 2. What is validated

### Semantic product match path

- `src/services/concierge.service.ts`
- `src/services/ai-capsule-orchestrator.service.ts`
- RPC `match_products`
- `src/lib/product-search-capsule.ts`
- `src/lib/ai-capsule-mappers.ts`

### Exact match path

- El exact match ya trae `ai_sales_note`:
  - `.select('id, slug, name, price, stock, ai_is_featured, ai_sales_note')`

### Semantic path truth

- El path semántico obtiene productos desde `match_products`.
- `match_products` hoy NO retorna `ai_sales_note`.
- Por eso los semantic matches llegan sin ese campo.

### Layers already ready

- `src/services/ai-capsule-orchestrator.service.ts`
  - ya mapea `ai_sales_note: p.ai_sales_note ?? null`
- `src/lib/ai-capsule-schemas.ts`
  - ya acepta `ai_sales_note`
- `src/lib/ai-capsule-mappers.ts`
  - ya expone `ai_sales_note` al attachment público

## 3. What remains open

- Sigue abierto que el RPC `match_products` proyecte `ai_sales_note`.
- Hay una superficie adyacente que también usa ese RPC:
  - `conciergeService.neuralSearch()`
- Pero en el path cliente-facing auditado, el cuello real no está en UI, schema ni mapper.

## 4. What is approved

- Root cause aprobado:
  - `SQL/RPC layer`
- Root cause no aprobado:
  - mapper
  - type/schema layer

### Minimum safe future change set

- actualizar la firma de retorno de `match_products`
- agregar `ai_sales_note` al `SELECT` dentro del RPC

No hace falta cambiar, para este gap mínimo:

- `src/services/ai-capsule-orchestrator.service.ts`
- `src/lib/product-search-capsule.ts`
- `src/lib/ai-capsule-schemas.ts`

## 5. Exact next move

- Abrir un lane backend pequeño centrado en:
  - `supabase/migrations/20260312_neural_search_infra.sql`
- Objetivo:
  - hacer que `match_products` retorne `ai_sales_note`
  - para que los semantic matches lo arrastren end-to-end también
