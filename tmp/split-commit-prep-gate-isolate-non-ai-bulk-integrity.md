# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Split-Commit Prep Gate — Isolate Non-AI Bulk Integrity Lane

1. **What changed**
- The likely split-able lane was narrowed down.
- Based on caller truth and current diff shape, the non-AI bulk integrity lane is centered on one file, not two.

2. **What is validated**
- `src/services/admin/admin-products.service.ts` is sufficient for the lane’s actual purpose:
  - compensating rollback hardening
  - return-contract narrow-back to minimal `{ id }[]`-style shape
- No other changed file is required for correctness of that lane.
- `src/pages/admin/AdminBatchManager.tsx` should be excluded:
  - its current diff is copy/honesty text
  - caller census already showed it does not depend on the widened return payload
  - it is not needed for the service-level fix to function correctly
- The lane is safe to commit independently **once isolated**.

3. **What remains open**
- The only open item is orchestration:
  - isolate the file cleanly from the mixed worktree before committing
- There is no file-truth evidence that this lane needs any companion code file.

4. **What is approved**
- Approved minimal safe commit set:
  - `src/services/admin/admin-products.service.ts`
- Not approved for this lane:
  - `src/pages/admin/AdminBatchManager.tsx`
  - any Cesarin/runtime/doc file
  - any `tmp/*.md` artifact

5. **Exact next move**
- Isolate and stage **only**:
  - `src/services/admin/admin-products.service.ts`
- Exclude everything else, especially:
  - `src/pages/admin/AdminBatchManager.tsx`
- Exact minimal commit set:
  - **1 file only**: `src/services/admin/admin-products.service.ts`
