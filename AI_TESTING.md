# VSM AI Validation Harness

This harness provides automated verification for the Google AI front (Cesarín), ensuring architectural parity and preventing dimensional drift.

## 1. Core Principles
- **Canonical Model**: `gemini-embedding-001`
- **Canonical Dimensions**: **3072**
- **Drift Protection**: Any change to model output or DB schema that deviates from `test_config.ts` will trigger a failure in the suite.

## 2. Running the Tests

To execute the full validation suite (Provider + DB + Logic):

```bash
npm run test:ai
```

### Individual Test Components
If you need to isolate a failure, you can run components individually using `tsx`:

1.  **Provider Smoke**: `npx tsx supabase/tests/smoke_embeddings.ts`
    - Validates Edge Function response, latency, and 3072d alignment.
2.  **DB Retrieval**: `npx tsx supabase/tests/test_retrieval.ts`
    - Validates `products` and `store_knowledge` column sizes and RPC signatures.
3.  **Sommelier Scenarios**: `npx tsx supabase/tests/test_sommelier.ts`
    - Validates AI routing logic against "Golden Queries" (Product Search vs RAG).

## 3. Configuration
All tests are driven by [supabase/tests/test_config.ts](file:///c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/tests/test_config.ts). 

If a new model is introduced (e.g., 768d), the process is:
1. Update `test_config.ts`.
2. run `test:ai` (it will fail).
3. Align infra (Migrations/Edge Functions).
4. run `test:ai` (it should pass).

## 4. Expected Output
A successful run should report **🌟 PASS** for all three layers. Any **❌ FAIL** indicates an operational drift that must be corrected before shipping to production.
