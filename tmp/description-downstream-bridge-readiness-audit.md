# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD SCOPING LANE — DESCRIPTION DOWNSTREAM BRIDGE READINESS AUDIT

## 1. what changed
- `description` is already present upstream in the semantic retrieval path.
- The lane is no longer blocked at SQL/RPC level.
- The remaining work is a narrow mapper/contract bridge.

## 2. what is validated
- **A) Upstream source**
  - Semantic path gets `description` from `match_products`.
  - Current RPC shape in `supabase/migrations/20260320_match_products_add_specs.sql` includes `description`.
- **B) Drop-off points**
  - First drop-off: `src/services/ai-capsule-orchestrator.service.ts`
    - `mapDbToInternal()` drops `description`
  - Second drop-off: `src/lib/ai-capsule-schemas.ts`
    - `internalResolvedProductSchema` has no `description`
    - `publicAttachmentSchema` has no `description`
  - Third drop-off: `src/lib/ai-capsule-mappers.ts`
    - public attachments do not carry `description`
- **C) Minimum safe implementation surface**
  - Required:
    - `src/services/ai-capsule-orchestrator.service.ts`
    - `src/lib/ai-capsule-schemas.ts`
  - Optional but recommended for contract alignment:
    - `src/lib/ai-capsule-mappers.ts`
- **D) Exact path parity**
  - Optional.
  - Exact path does not need widening for this first lane.
- **E) Contract / nullability risks**
  - `description` is nullable upstream, so bridge should preserve `string | null`.
  - If only internal schema is updated and public attachment schema is not, contract asymmetry remains.
  - Current runtime often uses `resolved_products` directly, so schema drift can stay hidden unless both layers are aligned.
- **F) Readiness**
  - This lane is ready now.
  - No prerequisite forces reopening `match_products`.

## 3. what remains open
- Bridging `description` through mapper/contract does not automatically make it visibly rendered in storefront UI.
- If product later wants `description` shown in cards or responses, that is a separate display lane.
- The only open scoping choice is whether to align the formal public attachment contract in the same pass.

## 4. what should be approved
- Approve a small mapper/contract lane now.
- Do not reopen `match_products`.
- Do not require exact-path parity for the first slice.

## 5. exact next move
- Open a surgical lane centered on:
  - `src/services/ai-capsule-orchestrator.service.ts`
  - `src/lib/ai-capsule-schemas.ts`
  - optionally `src/lib/ai-capsule-mappers.ts` for contract alignment in the same pass
