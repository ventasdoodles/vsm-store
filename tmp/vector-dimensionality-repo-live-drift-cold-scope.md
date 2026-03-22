# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# TASK: COLD SCOPING ONLY — VECTOR DIMENSIONALITY REPO/LIVE DRIFT

## 1. WHAT IS CONFIRMED 3072d IN REPO

- Canon/docs:
  - [AI_CONTEXT.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AI_CONTEXT.md) says embeddings are `gemini-embedding-001 (3072d)`.
  - [AUDIT_LOG.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AUDIT_LOG.md) records A55 standardization to 3072d and reseeding.
- Seed/test tooling:
  - [supabase/seeds/seed_products.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/seeds/seed_products.ts)
  - [supabase/seeds/seed_runner.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/seeds/seed_runner.ts)
  - [supabase/tests/test_config.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/test_config.ts)
  - [supabase/tests/smoke_embeddings.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/smoke_embeddings.ts)
  - [supabase/tests/diag_embedding_api.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/diag_embedding_api.ts)
  - [supabase/tests/wave_188_validation.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/wave_188_validation.ts)
- Active ingestion code:
  - [supabase/functions/knowledge-ingestor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/knowledge-ingestor/index.ts) explicitly requests `outputDimensionality: 3072`.
- Live-validated from prior probe:
  - live `match_products` accepts 3072-dim input and rejects 768-dim input.

## 2. WHAT STILL REFERENCES 768d

- **Migration-history / schema definitions**
  - [supabase/migrations/20260312_neural_search_infra.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
    - `products.embedding vector(768)`
    - `match_products(query_embedding vector(768))`
  - [supabase/migrations/20260320_match_products_add_ai_sales_note.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_ai_sales_note.sql)
    - drops/recreates `match_products(vector(768), ...)`
  - [supabase/migrations/20260320_match_products_add_specs.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_specs.sql)
    - drops/recreates `match_products(vector(768), ...)`
- **Mixed / stale comments**
  - [supabase/migrations/20260312_neural_search_infra.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql) has contradictory comments for 1536 and 768.
- **Not 768, but still mismatched**
  - [supabase/migrations/20260317_store_knowledge.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260317_store_knowledge.sql)
    - `store_knowledge.embedding vector(1536)`
    - `match_knowledge(query_embedding vector(1536))`
  - This is not 768 residue, but it is still out of line with the repo’s later 3072 standardization story.

## 3. WHETHER THE DRIFT IS HISTORICAL, ACTIVE, OR MIXED

- **Products embedding column**
  - `vector(768)` in repo migrations: **migration-history only, but dangerous stale history**
  - live instance: not 768, proven by live RPC behavior
- **match_products RPC**
  - `vector(768)` in repo migrations: **mixed**
  - stale in migrations, but active enough to be dangerous if replayed/reconciled locally
- **match_knowledge RPC / store_knowledge column**
  - `vector(1536)` in repo migrations: **mixed**
  - not part of the 768 residue, but still dimensionally inconsistent with the repo’s 3072 canon/tests
- **Seed scripts**
  - 3072d: **active and aligned with canon**
- **Edge functions**
  - [knowledge-ingestor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/knowledge-ingestor/index.ts): **active and explicitly 3072**
  - [embeddings-processor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/embeddings-processor/index.ts): **active runtime-critical but dimension implicit**
  - [customer-intelligence/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts) and [tools.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/tools.ts): **active, model aligned, dimension implicit**
- **Comments/docs**
  - 3072 canon is dominant
  - stale 768/1536 comments remain in migrations: **dead residue / historical drift**

## 4. RISK IF LEFT UNCHANGED

- Highest risk:
  - future migration replay or local environment rebuild can recreate `products.embedding` / `match_products` with wrong dimensionality.
- Medium risk:
  - developers reading repo schema can make wrong assumptions about live vector shape.
- Medium-high risk:
  - `embeddings-processor` does not explicitly lock output dimensionality in code, so repo truth relies on provider defaults/live behavior rather than explicit code intent.
- Broader structural risk:
  - product search and knowledge retrieval no longer share one clearly reconciled dimensionality story in repo.
- Practical implication:
  - production may keep working, but repo-as-source-of-truth is not trustworthy enough for infra changes or clean reprovisioning.

## 5. MINIMUM SAFE NEXT IMPLEMENTATION LANE

- **code + migration**
- Narrowly:
  - reconcile product-search migrations to 3072
  - reconcile knowledge/RAG dimensionality declarations if 3072 is truly the standard there too
  - make active embedding producers explicit about expected dimensionality where currently implicit
- Not enough:
  - docs + migration only
- Likely not required:
  - broader infra follow-up as first step
- Smallest safe lane is not docs; it is schema/runtime reconciliation.

## 6. WHETHER THIS SHOULD PREEMPT OTHER BACKLOG ITEMS

- **Yes, it should preempt normal backlog items that are lower-stakes UX/admin polish.**
- Reason:
  - this is repo/live infra drift, not cosmetic debt.
  - it threatens future correctness more than current operator UX polish.
- But:
  - it is not a “drop everything, production outage” emergency if live runtime is stable.
- Best classification:
  - **high-priority integrity reconciliation**
  - above polish lanes
  - below only active break/fix incidents

## 7. FILES INSPECTED

- [supabase/migrations/20260312_neural_search_infra.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260312_neural_search_infra.sql)
- [supabase/migrations/20260317_store_knowledge.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260317_store_knowledge.sql)
- [supabase/migrations/20260320_match_products_add_ai_sales_note.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_ai_sales_note.sql)
- [supabase/migrations/20260320_match_products_add_specs.sql](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_match_products_add_specs.sql)
- [supabase/functions/embeddings-processor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/embeddings-processor/index.ts)
- [supabase/functions/knowledge-ingestor/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/knowledge-ingestor/index.ts)
- [supabase/functions/customer-intelligence/index.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts)
- [supabase/functions/customer-intelligence/tools.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/tools.ts)
- [supabase/seeds/seed_products.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/seeds/seed_products.ts)
- [supabase/seeds/seed_runner.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/seeds/seed_runner.ts)
- [supabase/tests/test_config.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/test_config.ts)
- [supabase/tests/smoke_embeddings.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/smoke_embeddings.ts)
- [supabase/tests/diag_embedding_api.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/diag_embedding_api.ts)
- [supabase/tests/wave_188_validation.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/wave_188_validation.ts)
- [src/services/ai-capsule-orchestrator.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/services/concierge.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [AI_CONTEXT.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AI_CONTEXT.md)
- [AUDIT_LOG.md](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/AUDIT_LOG.md)
