# Cash Closeout Control Plane v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the cash-only pilot into an operable, auditable cash-closeout flow with atomic settlements, a real Admin queue, a single financial activity read model, and a self-cleaning QA baseline.

**Architecture:** A protected Edge Function accepts only user-entered declared cash, evidence and idempotency intent. A service-role-only database RPC locks and derives all authoritative order facts, writes immutable ledger rows, and creates one final settlement. Security-invoker read views power the Admin queue and wallet history; the existing order-card write form becomes a deep link.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Playwright, Supabase Postgres/RLS/Edge Functions, GitHub Actions, Vercel.

---

## Operating Contract

- WorkKit is mandatory: before each mutation, read `C:\dev\vsm-store-fresh\.vsm-workkit\docs\workkit\PROMPT_SYSTEM_RULES_IMMUTABLE.md` and run `repo-baseline` plus `workspace-sync` through `tools/workflow/vsm-gate.mjs`.
- Use isolated worktrees for Admin and client. Do not alter the canonical clean product checkouts.
- Before SQL work fetch `https://supabase.com/changelog.md`, read current RLS/view documentation, and discover every Supabase CLI command using `--help`.
- Create every migration with `supabase migration new`; do not modify applied migrations or use broad `supabase db push`.
- Every behavior starts RED, then minimal GREEN, then refactor.
- E2E may read remote financial state with service role but must never directly update `profiles.balance`, `profiles.reserved_balance`, or delete a wallet row.

### Task 1: Create verified isolated bases

**Files:**
- Modify: none
- Test: `C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs`

- [ ] **Step 1: Prove the real workspace baseline**

Run:
```powershell
node tools/workflow/vsm-gate.mjs --lane repo-baseline
node tools/workflow/vsm-gate.mjs --lane workspace-sync
```

Expected: both print `VSM_GATE: PASS`.

- [ ] **Step 2: Create product worktrees**

Run in `F:\ivoy\ivoy-admin`:
```powershell
git check-ignore -q .worktrees
git worktree add .worktrees/cash-closeout-control-plane -b codex/cash-closeout-control-plane
```

Run in `F:\ivoy\ivoy1.6`:
```powershell
git check-ignore -q .worktrees
git worktree add .worktrees/qa-cash-closeout -b codex/qa-cash-closeout
```

Expected: both worktrees exist and are clean.

- [ ] **Step 3: Prove test baselines**

Run `npm test -- --run` and `npm run lint` in both worktrees. Expected: PASS before new work.

### Task 2: Guard QA financial baseline reset

**Files:**
- Create: `F:\ivoy\ivoy1.6\.worktrees\qa-cash-closeout\src\test\qaPrepareDriverBalanceMigration.test.ts`
- Create: the migration generated in `F:\ivoy\ivoy1.6\.worktrees\qa-cash-closeout\supabase\migrations\` by `supabase migration new qa_prepare_driver_balance_guard`
- Modify: `F:\ivoy\ivoy1.6\.worktrees\qa-cash-closeout\scripts\verify-migration-security.cjs` only if needed for the new contract

- [ ] **Step 1: Write the failing guard test**

The test loads the generated migration and requires all of these fragments:

```ts
expect(sql).toMatch(/status\s+not\s+in\s*\([^)]*'delivered'[^)]*'cancelled'[^)]*'issue'/i);
expect(sql).toMatch(/QA driver has a nonterminal assigned order/i);
expect(sql).toMatch(/reserved_balance\s*=\s*0/i);
expect(sql).toMatch(/balance\s*=\s*500/i);
expect(sql).toMatch(/grant execute on function public\.qa_prepare_lifecycle_driver_balance\(\) to service_role/i);
```

- [ ] **Step 2: Verify RED**

Run:
```powershell
npm test -- src/test/qaPrepareDriverBalanceMigration.test.ts --run
```

Expected: FAIL because the forward guard migration does not exist.

- [ ] **Step 3: Implement the generated forward migration**

Replace `qa_prepare_lifecycle_driver_balance()` as `SECURITY DEFINER` with `search_path = public, pg_temp`. It must detect an assigned order whose status is not `delivered`, `cancelled`, or `issue`; reject before writing if one exists. Otherwise it sets the canonical QA driver's fields exactly to `balance = 500`, `reserved_balance = 0`, `availability_status = 'libre'`. Revoke `PUBLIC`, `anon`, and `authenticated`; grant only `service_role`.

- [ ] **Step 4: Verify GREEN and commit**

Run:
```powershell
npm test -- src/test/qaPrepareDriverBalanceMigration.test.ts --run
npm run verify:migration-security
git add src/test/qaPrepareDriverBalanceMigration.test.ts supabase/migrations scripts/verify-migration-security.cjs
git commit -m "fix(qa): guard driver financial baseline reset"
```

Expected: tests PASS and the commit contains no unrelated files.

### Task 3: Add immutable closeout contract and secure read models

**Files:**
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\tests\cashCloseoutMigration.test.js`
- Create: the migration generated by `supabase migration new cash_closeout_control_plane_v1` in `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\supabase\migrations\`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\scripts\verify-cash-wallet-ledger-contract.cjs`

- [ ] **Step 1: Write the failing migration contract**

Require the generated migration to contain: a partial unique active-order index; `FOR UPDATE`; `payment_method = 'cash'`; `status = 'delivered'`; `security_invoker = true`; `(select auth.uid())`; a nonblank reversal reason guard; and an `admin_submit_cash_closeout` signature that accepts no caller-supplied driver or expected-cash values.

```js
expect(sql).toMatch(/create unique index .*driver_cash_settlements.*order_id.*where/i);
expect(sql).toMatch(/for update/i);
expect(sql).toMatch(/payment_method\s*=\s*'cash'/i);
expect(sql).toMatch(/status\s*=\s*'delivered'/i);
expect(sql).toMatch(/security_invoker\s*=\s*true/i);
expect(sql).toMatch(/\(select auth\.uid\(\)\)/i);
```

- [ ] **Step 2: Verify RED**

Run:
```powershell
npm test -- src/tests/cashCloseoutMigration.test.js --run
```

Expected: FAIL.

- [ ] **Step 3: Implement the generated migration**

Add a unique active-settlement index on `driver_cash_settlements(order_id)` and a dedicated immutable `ledger_journal_reversals` link table. Do not use `UPDATE` on an original posted journal or final settlement to indicate reversal.

Create `admin_submit_cash_closeout(p_order_id uuid, p_declared_cash_amount numeric, p_evidence_reference text, p_idempotency_key text, p_actor_id uuid)`. It locks the order with `FOR UPDATE`, verifies the actor is Admin, requires delivered cash, derives assigned driver and final fare, rejects null/nonpositive expected cash, rejects a second active settlement, and writes one balanced immutable journal plus final `matched`, `short`, or `over` settlement.

Create `admin_reverse_cash_closeout(p_settlement_id uuid, p_reason text, p_idempotency_key text, p_actor_id uuid)`. It requires Admin actor and trimmed reason, rejects an existing reversal, writes inverse entries and one reversal link. It never mutates historic financial facts.

Create `public.driver_financial_activity` and `public.admin_cash_closeout_queue` with `security_invoker = true`. The first normalizes top-ups, reserves, captures, settlements and reversals into `id, driver_id, occurred_at, activity_type, amount, currency, reference_order_id, journal_id, evidence_reference, metadata`. The second returns only actionable delivered cash rows: derived `open` plus final `short` and `over`.

Consolidate the two permissive ledger SELECT policies per table into one policy, using `(select auth.uid())`, an admin predicate and the relevant driver ownership predicate. Keep RLS enabled; revoke both new RPCs from `PUBLIC`, `anon`, and `authenticated`; grant only `service_role`.

- [ ] **Step 4: Extend the verifier and prove GREEN**

Add both new RPCs, the partial index, security-invoker views, immutable reversal link and RLS policy shape to `verify-cash-wallet-ledger-contract.cjs`.

Run:
```powershell
npm test -- src/tests/cashCloseoutMigration.test.js --run
npm run verify:cash-wallet-ledger-contract
npm run verify:migration-security
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/tests/cashCloseoutMigration.test.js supabase/migrations scripts/verify-cash-wallet-ledger-contract.cjs
git commit -m "feat(ledger): add atomic cash closeout contract"
```

### Task 4: Narrow the protected write API

**Files:**
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\supabase\functions\admin-wallet-ledger\index.ts`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\services\cashWalletLedger.ts`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\services\__tests__\cashWalletLedger.test.ts`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\supabase\functions\admin-wallet-ledger\index.test.ts`

- [ ] **Step 1: Write failing service/function tests**

Replace the old settlement call with:

```ts
submitCashCloseout({
  orderId: 'order-1',
  declaredCashAmount: 100,
  evidenceReference: 'corte-001',
  idempotencyKey: 'cash-closeout-order-1-v1',
});
```

Assert the payload has `action: 'submit_cash_closeout'` and has neither `driverId` nor `expectedCashAmount`. Add a failing reversal test for blank reason and an HTTP 400 validation test that verifies no RPC call happens.

- [ ] **Step 2: Verify RED, implement, then verify GREEN**

Run the focused service test and observe failure. Replace `recordDriverCashSettlement` with `submitCashCloseout` and add `reverseCashCloseout`. The Edge Function preserves `requireAdmin`, sends the verified actor only as `p_actor_id`, and invokes only the two new RPCs.

Run:
```powershell
npm test -- src/services/__tests__/cashWalletLedger.test.ts --run
npm run verify:supabase-function-inventory
npm run verify:release-readiness
```

Expected: PASS.

- [ ] **Step 3: Commit**

```powershell
git add supabase/functions/admin-wallet-ledger/index.ts supabase/functions/admin-wallet-ledger/index.test.ts src/services/cashWalletLedger.ts src/services/__tests__/cashWalletLedger.test.ts
git commit -m "feat(admin): narrow cash closeout write API"
```

### Task 5: Build one Admin cash-closeout queue

**Files:**
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\types\cashCloseout.ts`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\hooks\useCashCloseoutQueue.ts`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\cash-closeout\CashCloseoutQueue.tsx`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\cash-closeout\CashCloseoutDialog.tsx`
- Create: corresponding `.test.tsx` files beside each component
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\AdminDashboard.tsx`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\dashboard\DashboardToolbar.tsx`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\OrderCardCostNotes.tsx`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\__tests__\OrderCardCostNotes.test.tsx`

- [ ] **Step 1: Write RED component tests**

Queue test: provide `open`, `short`, and `matched` rows; assert only `open`/difference work appears and per-driver expected/declared/difference totals are correct. Dialog test: assert submit sends only order id, declared amount, evidence and idempotency key; reversal stays disabled until a nonblank reason is entered.

- [ ] **Step 2: Implement focused units**

The hook reads `admin_cash_closeout_queue` with driver/status/cut filters. The queue derives totals only from returned rows. The dialog owns field validation/loading/error, calls the narrow service, and visually distinguishes short/over from matched.

- [ ] **Step 3: Integrate a lazy route-like dashboard view**

Add `view=cash-closeout` in `AdminDashboard.tsx`, lazy-load the queue, and add one `Cierre de efectivo` toolbar control. Replace the old inline settlement form in `OrderCardCostNotes.tsx` with a deep link to `view=cash-closeout&orderId=<id>`; delete its financial write logic.

- [ ] **Step 4: Verify and commit**

```powershell
npm test -- src/components/cash-closeout/CashCloseoutQueue.test.tsx src/components/cash-closeout/CashCloseoutDialog.test.tsx src/components/__tests__/OrderCardCostNotes.test.tsx --run
npm run lint
npm run build
npm run verify:initial-entry-performance
git add src/types/cashCloseout.ts src/hooks/useCashCloseoutQueue.ts src/components/cash-closeout src/components/AdminDashboard.tsx src/components/dashboard/DashboardToolbar.tsx src/components/OrderCardCostNotes.tsx src/components/__tests__/OrderCardCostNotes.test.tsx
git commit -m "feat(admin): add cash closeout queue"
```

Expected: tests and initial-entry performance PASS; queue is lazy-loaded.

### Task 6: Unify financial history in Admin and driver surfaces

**Files:**
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\hooks\useDriverWallet.ts`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\components\drivers\DriverWalletHistory.tsx`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\src\hooks\__tests__\useDriverWallet.test.tsx`
- Modify: `F:\ivoy\ivoy1.6\.worktrees\qa-cash-closeout\components\DriverWalletTab.tsx`
- Create: `F:\ivoy\ivoy1.6\.worktrees\qa-cash-closeout\src\test\DriverWalletTab.financialActivity.test.tsx`

- [ ] **Step 1: Write RED reader tests**

Mock a `driver_financial_activity` response with top-up, capture, settlement and reversal. Assert Admin reads only that view and renders all four types. Assert the driver wallet tab renders settlement/reversal labels and never exposes financial writes.

- [ ] **Step 2: Implement shared view consumers**

Admin query:
```ts
supabase.from('driver_financial_activity')
  .select('*')
  .eq('driver_id', driverId)
  .order('occurred_at', { ascending: false })
  .limit(50);
```

Replace `WalletTransaction` assumptions with a local `FinancialActivity` display type. In `DriverWalletTab.tsx`, load the same view for the authenticated driver and keep cash-only explanation copy.

- [ ] **Step 3: Verify and commit per repository**

Run focused tests, lint and build in both worktrees. Commit Admin as `feat(admin): read wallet history from financial activity` and client as `feat(driver): show ledger financial activity`.

### Task 7: Add a real, clean closeout E2E

**Files:**
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\tests\cash-closeout-lifecycle.spec.ts`
- Create: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\tests\helpers\qa-cash-closeout.ts`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\tests\payment-and-ledger-reconciliation.spec.ts`
- Modify: `F:\ivoy\ivoy-admin\.worktrees\cash-closeout-control-plane\tests\helpers\qa-money.ts`

- [ ] **Step 1: Write RED collection test**

Create this journey before helpers:

```ts
test('closes delivered cash order through Admin queue and safely retries', async ({ browser }) => {
  // Client creates namespaced cash order through UI.
  // Admin assigns through UI; driver delivers through UI.
  // Admin uses queue UI to close, retry, and reverse with reason.
  // Test verifies exactly one active settlement, balanced journal and activity projection.
  // Cleanup uses protected business/QA operations only.
});
```

Run `npx playwright test tests/cash-closeout-lifecycle.spec.ts --list`. Expected: FAIL until the file exists, then the scenario lists without skip.

- [ ] **Step 2: Implement isolated helpers and journey**

Use a `testInfo` namespace in order/evidence values. Wait for the Admin function network response. Assert queue status, ledger balance, idempotent retry, reason-required reversal and activity projection. Remove direct profile update/delete patterns from the new flow. Cleanup uses `qa_cleanup_lifecycle_order` followed by guarded `qa_prepare_lifecycle_driver_balance`, and asserts exactly `500/0/libre`.

Keep the old payment/ledger E2E focused solely on commission reserve/capture; it must not claim settlement coverage.

- [ ] **Step 3: Verify and commit**

```powershell
npx playwright test tests/cash-closeout-lifecycle.spec.ts --list
npm test -- --run
npm run lint
npm run build
npm run verify:release-readiness
git add tests/cash-closeout-lifecycle.spec.ts tests/helpers/qa-cash-closeout.ts tests/payment-and-ledger-reconciliation.spec.ts tests/helpers/qa-money.ts
git commit -m "test(admin): prove cash closeout lifecycle"
```

### Task 8: Apply, deploy, and prove remote state

**Files:**
- Modify: none unless verification requires a new forward corrective migration
- Test: remote Supabase, Vercel and GitHub Actions evidence

- [ ] **Step 1: Re-run WorkKit gates and apply controlled migrations**

Before remote mutation rerun baseline/sync. Apply the client QA guard migration first, then Admin closeout migration through targeted linked queries; do not use `db push`. Query remote functions, triggers, indexes and views after each apply.

- [ ] **Step 2: Prove QA guard**

Invoke the protected preparation RPC with service role. Run:
```powershell
node tools/workflow/vsm-gate.mjs --lane qa-preflight
```

Expected: `READY_FOR_QA_RUN`. Separately create a temporary nonterminal QA order only via business flow, prove reset refusal, then clean it with the protected cleanup RPC.

- [ ] **Step 3: Push and inspect same-SHA release gates**

Wait for Admin Quality, Functions deploy, Vercel, Pages, Lighthouse, E2E QA, and client quality/deploy/lifecycle checks. Confirm no-token function access is 401 and non-Admin token access is 403.

- [ ] **Step 4: Record performance truth**

Pass `npm run verify:initial-entry-performance` and inspect Lighthouse. Only report live Core Web Vitals if a Chrome DevTools trace becomes available; bundle evidence is not a substitute.

### Task 9: Canonize only verified evidence

**Files:**
- Create: `C:\dev\vsm-store-fresh\.vsm-workkit\docs\audits\2026-06\cash-closeout-control-plane-v1.md`
- Modify: `C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md`
- Modify: `C:\dev\vsm-store-fresh\.vsm-workkit\AUDIT_LOG.md`

- [ ] **Step 1: Document evidence and residual risk**

Record migration filenames, commits, SHAs, run IDs, QA baseline proof, E2E boundaries, security/RLS checks, performance limitation, and non-claims. Do not claim payment-provider, accounting-certification or physical cash proof.

- [ ] **Step 2: Final WorkKit verification and commit**

```powershell
node tools/workflow/vsm-gate.mjs --lane repo-baseline
node tools/workflow/vsm-gate.mjs --lane workspace-sync
node tools/workflow/vsm-gate.mjs --lane qa-preflight
node tools/workflow/vsm-gate.mjs --lane canon
git diff --check
git add docs/audits/2026-06/cash-closeout-control-plane-v1.md AI_CONTEXT.md AUDIT_LOG.md
git commit -m "canon: record cash closeout control plane v1"
```

Expected: all gates PASS from clean canonical checkouts before any pilot-readiness claim.

## Plan Self-Review

- Scope coverage: QA safety, atomic settlement, RLS, reversal, unified history, queue, E2E, deploy and canon are each owned by one task.
- Safety: all changes are forward-only, idempotent and append-only; no direct test cleanup mutates balances.
- Performance: queue lazy-load is an explicit gate; live CWV remains unclaimed without trace evidence.
- No placeholders: migration filenames are intentionally generated by the required Supabase command rather than fabricated.

