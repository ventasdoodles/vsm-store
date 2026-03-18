# RAG Optionality Usage Rules

## 1) Purpose
The `rag_optional` flag exists to prevent false RAG (Retrieval-Augmented Generation) penalties in logic-focused verification scenarios where retrieval is not part of the primary test objective. This ensures that behavioral successes in memory-policy enforcement are not unfairly degraded by the absence of knowledge chunks.

## 2) Allowed Usage
The `rag_optional` flag is allowed ONLY when:
- Retrieval is NOT part of the validation objective.
- The scenario is validating logic behavior, memory-policy behavior (e.g., interest dominance or tiebreakers), or conversational flow/structure where factual retrieved content is irrelevant to the success of the test.

## 3) Forbidden Usage
The `rag_optional` flag is FORBIDDEN when:
- Factual store knowledge retrieval is part of the expected model answer.
- Policy retrieval, inventory specifics, or factual correctness depends on successfully calling retrieval tools.
- It is being used as a convenience escape hatch to "green" a report for weak or failing retrieval scenarios that *should* have returned data.

## 4) Default Rule
Default harness behavior remains unchanged. Unless `rag_optional: true` is explicitly and appropriately declared in the scenario expectations, the harness will enforce RAG scoring (requiring knowledge chunks for retrieval tools).

## 5) Guardrail Principle
`rag_optional` must never be used to mask real retrieval regressions. It is a tool for logic-validation isolation, not a filter for retrieval failures.

## 6) Minimal Example Guidance

### ✅ Allowed (Logic-Focused)
- **Objective**: Verify that the Analyst ignores a stale interest in memory and prioritizes a new user query.
- **Scenario**: User asks for "bandejas" while memory has "vapes".
- **Reason**: The test validates interest switching/priority. Retrieval results for "bandejas" are secondary to the correct intent and tool choice.

### ❌ Forbidden (Factual-Focused)
- **Objective**: Verify that the system accurately retrieves the store's return policy.
- **Scenario**: User asks "¿Cuál es su política de devoluciones?".
- **Reason**: The success of this scenario depends on factual correctness derived from retrieved knowledge chunks. Marking this as optional would allow the system to pass even if the knowledge base is inaccessible.

---
*Referenced verification set: src/__tests__/scenarios/verification_4.0e_minimal.json*
