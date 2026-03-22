# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# TASK: COLD REVIEW PREP — MISS TAXONOMY HEURISTIC INTEGRITY

## 1. WHAT A GOOD MISS TAXONOMY MUST DISTINGUISH

- `Product search miss with 0 cards`
  - routing reached `product_search_integrity`, but retrieval/result delivery failed to produce cards.
- `Fallback without capsule`
  - no meaningful capsule handoff happened; response degraded into generic handling.
- `Guardrail rescue / analyst unknown but recovered`
  - upstream analyst looked uncertain, but a capsule still handled the turn.
- `Knowledge/policy dominance`
  - the system answered via `knowledge_rag_foundation`; this is not a product miss unless the operator expected product retrieval.
- `Infra/degraded failure`
  - true degraded/runtime failure, not just low-quality retrieval.
- `Session-gate / activation variance`
  - pilot not exposed or not active locally; not an AI miss.

## 2. WHERE CATEGORY COLLISION IS MOST LIKELY

- `0 cards` vs `fallback`
  - a product-search row can have zero cards without being the same as generic fallback.
- `guardrail rescue` vs `fallback`
  - rescue is often a recovery success, not a miss.
- `knowledge/policy` vs `wrong routing`
  - policy answers may be correct, not evidence of failure.
- `pilot gate inactive` vs `no traffic`
  - operators can confuse absence of rows with AI failure if session-gate context is not surfaced.
- `frustration` vs actual miss class
  - frustration is an outcome/symptom, not a root-cause category.

## 3. WHAT SIGNALS ARE STRONG ENOUGH VS TOO WEAK FOR CONFIDENT ATTRIBUTION

- Strong enough:
  - `capsule`
  - `fallback_used`
  - `product_card_count`
  - `semantic_match_success`
  - `raw_analyst_intent`
  - `detected_intent`
  - explicit degraded/error markers from `ai_logic_debug`
  - pilot session origin from parity diagnostics
- Too weak on their own:
  - `frustration_detected`
  - latency alone
  - absence of product cards without capsule context
  - high fallback rate without row-level decomposition
  - policy query count without expected user intent context

## 4. WHAT FAILURE MODES COULD BE MISLABELED

- Correct policy answer mislabeled as retrieval miss.
- Guardrail rescue mislabeled as failure instead of recovery.
- Generic fallback mislabeled as product-search miss when no product intent existed.
- No telemetry traffic mislabeled as AI outage when pilot gate was inactive.
- Frustrated user turn mislabeled as routing failure when the answer path was structurally correct.
- Zero-card search mislabeled as infra failure when it was just no safe result.

## 5. A COLD-REVIEW CHECKLIST TO APPLY TO ANTIGRAVITY’S IMPLEMENTATION

- Does every category map to explicit existing signals, not inferred narrative?
- Can one row land in exactly one primary miss category when classified?
- Are “symptoms” separated from “root cause” categories?
  - `frustration` should not replace root attribution.
- Does the implementation avoid treating `knowledge_rag_foundation` as failure by default?
- Does it keep `guardrail rescue` distinct from `fallback`?
- Does it distinguish `product_search_integrity + 0 cards` from `fallback_used = true`?
- Is `other/uncategorized` small and explainable, not a dump bucket?
- Are categories conservative when signals are mixed or weak?
- Can an operator tell from the panel whether the issue is:
  - no traffic
  - pilot inactive
  - routing issue
  - retrieval miss
  - degraded runtime
- Does the taxonomy help actionability, not just counting?

## 6. WHETHER ANY CATEGORY SHOULD BE MERGED, SPLIT, OR LEFT CONSERVATIVE BY DEFAULT

- Leave conservative by default:
  - `Other / Uncategorized`
  - only for rows that truly lack enough signal.
- Keep split:
  - `0 cards product-search miss`
  - `fallback without capsule`
  - `guardrail rescue`
  - `knowledge/policy`
  - `infra/degraded`
- Do not split `frustration` into root-cause categories.
  - keep it as a cross-cutting severity/symptom overlay.
- Do not merge `knowledge/policy` with miss classes unless there is hard evidence of wrong routing.
