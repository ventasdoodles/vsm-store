# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD REVIEW LANE — BRANCH C EXACT MATCH THIN RESPONSE WHEN `ai_sales_note` IS NULL

## 1. What changed in your understanding after inspection
- BRANCH C is no longer as data-starved as before.
- The exact path now already carries `specs` and uses them when `ai_sales_note` is null.
- So the original thinness was a combination issue, but the data-lift part has already been partially remediated.

## 2. What is validated
- In the exact-match lane, these useful fields now reach BRANCH C:
  - `name`
  - `price`
  - `stock`
  - `ai_is_featured`
  - `ai_sales_note`
  - `description`
  - `specs`
- Source:
  - `src/services/ai-capsule-orchestrator.service.ts` exact query now selects `ai_sales_note, description, specs`
  - the same file maps `ai_sales_note`, `description`, and `specs` into the internal product contract
  - `src/lib/ai-capsule-schemas.ts` already includes `description` and `specs` in `internalResolvedProductSchema`
- BRANCH C in `src/lib/product-search-capsule.ts` currently does:
  - prefer `ai_sales_note`
  - otherwise use `extractSpecsFact(topProduct)`
  - otherwise fallback to plain exact-match copy
- That means the earlier thinness was caused by:
  - prior missing downstream field availability
  - plus thin drafting logic
- Right now, the remaining weakness is mostly **drafting quality**, not missing transport.

## 3. What remains open
- `description` is present in exact path but intentionally unused in BRANCH C, which is good for discipline.
- The remaining open issue is that `extractSpecsFact()` may still yield weak or slightly awkward exact-match phrasing:
  - `¡Aquí tienes exactamente lo que buscabas, con ...!`
- There is no evidence that another field bridge is still required for BRANCH C.

## 4. What exact implementation lane you approve for Antigravity
- Smallest safe lane:
  - **BRANCH C exact-match phrasing refinement only**
- Scope:
  - `src/lib/product-search-capsule.ts`
- Goal:
  - keep `ai_sales_note` first
  - keep `specs` as the fallback cue when `ai_sales_note` is null
  - refine the exact-match sentence so the specs cue reads more naturally and less formulaic
- No new field lift is needed.

## 5. Specific risks / non-goals
- Do not touch:
  - semantic branches
  - orchestrator exact query
  - schemas/mappers
  - UI
- Collision risk with A67/A68/A69/A70:
  - low, if the lane stays inside BRANCH C wording only
- Non-goal:
  - do not reintroduce `description` into exact-match drafting
  - do not broaden this into another multi-branch drafting overhaul
