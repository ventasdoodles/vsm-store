# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD SCOPING LANE — DESCRIPTION CONSUMPTION DISCIPLINE AUDIT

## 1. what changed
- The remaining question is no longer whether `description` can reach runtime.
- The question is now consumption discipline: where it adds signal in drafting, and where it would just add noise.

## 2. what is validated
- **A) Where `description` should add real value**
  - In the **semantic** product-search drafting branch, when Cesarin needs one extra plain-language justification and:
    - `ai_sales_note` is absent or too salesy
    - `specs` are sparse or not useful
  - Best role:
    - a fallback semantic justification source
    - one short extracted benefit/theme, not full copy
- **B) Where `description` should NOT be used**
  - Not in exact-match drafting if `ai_sales_note` already exists
  - Not as raw text inside product cards
  - Not in ambiguity-hold responses
  - Not in no-match / degraded branches
  - Not as a second justification layer when `specs` already provide 1–2 useful facts
- **C) Redundancy risks**
  - Against `title`:
    - many descriptions restate product name/category
  - Against `ai_sales_note`:
    - both can sound like marketing justification
  - Against `specs`:
    - specs already give compact factual support
  - So `description` should be lowest-priority justification input, not first-choice
- **D) Verbosity / prompt-noise risks**
  - Product descriptions are long and marketing-heavy
  - Full inclusion would bloat semantic drafting and make responses repetitive
  - Safe discipline:
    - extract at most one concise usable idea
    - never paste long description fragments
    - skip when the text is generic boilerplate
- **E) Minimum acceptance standard**
  - Lane is “working” only if:
    - semantic responses become slightly more helpful when `specs` / `ai_sales_note` are weak
    - products with long/generic descriptions do not produce bloated replies
    - products with null/empty descriptions fall back cleanly with no tone regression
- **F) Nullability / fallback concerns**
  - `description` is nullable and often generic
  - implementation must treat it as optional, low-priority, and skippable
  - no branch should depend on it being present

## 3. what remains open
- The only real open decision is precedence:
  - `ai_sales_note` first
  - `specs` second or first depending on branch intent
  - `description` last-resort support
- Also open:
  - whether extraction should be heuristic-only or lightly sentence-trimmed, but still within a narrow drafting lane

## 4. what should be approved
- Approve `description` as a **fallback drafting aid**, not a primary signal.
- Approve semantic-only consumption.
- Do not approve raw description injection, multi-sentence reuse, or use in branches already well-served by `ai_sales_note` / `specs`.

## 5. exact next move
- Keep the active implementation lane narrowly scoped to:
  - semantic drafting only
  - one short non-redundant value cue from `description` only when stronger structured signals are missing or weak
- Success criterion:
  - helpful when needed, silent when not.
