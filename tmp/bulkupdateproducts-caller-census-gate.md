# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Caller Census Gate — bulkUpdateProducts Return Contract

1. **What changed**
- The caller census shows only one real caller of `bulkUpdateProducts()` in app code:
  - `src/pages/admin/AdminBatchManager.tsx`
- The barrel export in `src/services/admin/index.ts` is only re-export plumbing, not a consumer.

2. **What is validated**
- `bulkUpdateProducts()` is called in `AdminBatchManager` via React Query mutation:
  - `mutationFn: (...) => bulkUpdateProducts(updates)`
- The success result is **not consumed** there:
  - `onSuccess: () => { ... }`
  - no parameter is read
  - no returned row fields are used
- The UI flow only uses mutation completion:
  - invalidate queries
  - show success toast
  - clear dirty state
- From proven caller truth:
  - no current caller requires fields beyond `id`
  - in fact, no current caller requires even `id`
- Therefore the widened payload is currently **unused** by real callers.

3. **What remains open**
- It remains open whether there are non-app or future consumers not visible through current repo usage patterns.
- Within current repo callers, there is no evidence that the widened payload is needed.
- So the classification is not “proven safe widened contract”; it is:
  - **widened but currently unused**

4. **What is approved**
- Approved statement:
  - current callers do not depend on the widened payload
- Approved statement:
  - the widened return contract is currently unnecessary for proven callers
- Not approved statement:
  - that widening should remain just because it is harmless
- Based on caller truth, the cleaner contract is to **narrow back** to the prior minimal shape.

5. **Exact next move**
- Reopen only this lane enough to narrow `bulkUpdateProducts()` success payload back to the prior minimal `{ id }[]`-style contract, since no current caller needs the widened fields.
