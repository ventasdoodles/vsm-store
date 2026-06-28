# Xalapa City Zero Master Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove one real city operating loop for VSM Store by completing the competitive marketplace, codifying Xalapa operating constraints, hardening cabina workflows, and establishing measurable launch gates from clean implementation lanes.

**Architecture:** The city-zero build is sequenced around product truth, not UI breadth. Postgres and narrow RPCs remain the authority for assignment, offer closure, and financial side effects; client/admin realtime remains freshness only. Delivery work must start from isolated worktrees because current `ivoy1.6` and `ivoy-admin` mains already contain dirty marketplace and operations WIP that cannot be treated as a safe baseline.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Playwright, Supabase Postgres/RLS/Edge Functions, Vercel, VSM Store WorkKit gates.

---

## Operating Contract

- WorkKit is mandatory: before each implementation block, read `C:\dev\vsm-store-fresh\.vsm-workkit\docs\workkit\PROMPT_SYSTEM_RULES_IMMUTABLE.md` and rerun `repo-baseline`, `workspace-sync`, and any lane-specific gate through `C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs`.
- Do not implement on the current dirty mains of `F:\ivoy\ivoy1.6` or `F:\ivoy\ivoy-admin`. All feature work must happen in fresh named worktrees created from verified source refs.
- For this lane, the verified execution roots are `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client` and `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin`. Use repo-local `.worktrees\...` only if `.worktrees` is already ignored in the source repo; otherwise use the managed global worktree root.
- Database truth owns marketplace and cash state. Realtime may refresh projections, but it must never become mutation authority.
- Every new behavior starts RED, then minimal GREEN, then refactor. No canon claim is allowed without current proof from tests, lane gates, and remote verification where applicable.
- Xalapa scope is intentionally bounded. No task below should drift into "national platform" work before the city-zero gates are green.

## Task 1: Restore safe implementation lanes

**Files:**
- Modify: none
- Test: `C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs`

- [ ] **Step 1: Prove current workspace truth**

Run:
```powershell
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane repo-baseline
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane workspace-sync
git -C "F:\ivoy\ivoy1.6" status --short --branch
git -C "F:\ivoy\ivoy-admin" status --short --branch
```

Expected: `repo-baseline` and `workspace-sync` describe the current failures honestly, and the dirty file set matches the known marketplace/cost-note WIP.

- [ ] **Step 2: Create clean worktrees for the city-zero lane**

Run:
```powershell
git -C "F:\ivoy\ivoy1.6" check-ignore -q .worktrees
git -C "F:\ivoy\ivoy-admin" check-ignore -q .worktrees
git -C "F:\ivoy\ivoy1.6" worktree add "C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client" -b codex/xalapa-city-zero-client origin/main
git -C "F:\ivoy\ivoy-admin" worktree add "C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin" -b codex/xalapa-city-zero-admin origin/main
git -C "C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client" status --short --branch
git -C "C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin" status --short --branch
```

Expected: both worktrees exist and start clean. If `.worktrees` is safely ignored, repo-local worktrees are allowed; if not, use the managed global worktree root exactly as above. If the current dirty WIP must be preserved, copy it intentionally with patch commits, not ad hoc edits on main.

- [ ] **Step 3: Prove baseline health inside both worktrees**

Run in both new worktrees:
```powershell
npm install
npm test -- --run
npm run lint
npm run build
```

Expected: each worktree has a known baseline before new city-zero mutations begin.

## Task 2: Finish competitive marketplace truth

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\migrations\20260620213000_marketplace_superseded_offer_closure_v1.sql`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\functions\driver-create-counteroffer\index.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\types.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\types.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverMarketplace.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverOfferCard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\OrderConfirmationStep.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\DriverMarketplace.test.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\OrderConfirmationStep.test.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\pilotDemoFixtures.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\pilotDemoVisualHarness.test.tsx`

- [ ] **Step 1: Lock the lifecycle contract in tests first**

Add failing tests for:
- one accepted offer closing competing `pending` offers as `superseded`,
- direct-accept races yielding exactly one winner,
- expired offers refusing acceptance,
- a no-winner cycle returning the order either to republish or to explicit inactive state,
- a raise-offer threshold that is server-driven and customer-visible.

Run:
```powershell
npm test -- src/test/DriverMarketplace.test.tsx src/test/OrderConfirmationStep.test.tsx src/test/pilotDemoVisualHarness.test.tsx --run
```

Expected: RED before SQL/UI fixes.

- [ ] **Step 2: Finish the authoritative SQL and function contract**

Update `20260620213000_marketplace_superseded_offer_closure_v1.sql` so that offer closure, expiry handling, republish/inactive decisions, and truthful offer status transitions are decided server-side under row locks. Remove duplicated status literals across client/admin code by extending shared type unions from one authoritative contract. In `driver-create-counteroffer\index.ts`, stop hardcoding TTL in a way that can drift from the database contract.

- [ ] **Step 3: Align customer and driver surfaces**

`DriverMarketplace.tsx`, `DriverOfferCard.tsx`, and `OrderConfirmationStep.tsx` must refetch authoritative state after critical mutations and render truthful losing/expired/superseded outcomes. No stale action button may survive after the order is already won elsewhere.

- [ ] **Step 4: Verify locally and commit per repo**

Run:
```powershell
npm test -- --run
npm run lint
npm run build
```

Expected: all focused marketplace tests PASS in the client worktree, and migration/function checks PASS in the admin worktree before commit.

## Task 3: Prove multi-driver contention with QA harnesses

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\qa-temp\private-mvp-multiscenario-harness.cjs`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\pilotDemoFixtures.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\pilotDemoVisualHarness.test.tsx`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\MarketplaceFourDriverLifecycle.test.tsx`

- [ ] **Step 1: Expand the harness from demo-safe to contention-safe**

Model at least four eligible drivers with mixed behaviors: immediate accept, counteroffer, late accept, and no response. The harness must prove customer-visible comparison and truthful closure of losers without inventing fake driver counts beyond the scenario.

- [ ] **Step 2: Add the failing four-driver regression**

Run:
```powershell
npm test -- src/test/MarketplaceFourDriverLifecycle.test.tsx --run
```

Expected: RED until the lifecycle contract is complete.

- [ ] **Step 3: Verify the full multiscenario loop**

Run:
```powershell
npm test -- src/test/MarketplaceFourDriverLifecycle.test.tsx src/test/pilotDemoVisualHarness.test.tsx --run
```

Expected: GREEN with deterministic fixture output and no stale actionable UI.

## Task 4: Codify Xalapa operating constraints

**Files:**
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\config\xalapaCityZero.ts`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\config\xalapaCityZero.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\OrderConfirmationStep.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverDashboard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\AdminDashboard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\dashboard\DashboardToolbar.tsx`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\xalapaCityZeroConfig.test.ts`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\__tests__\XalapaOperatingRules.test.tsx`

- [ ] **Step 1: Create one explicit city contract**

Define Xalapa operating zones, service hours, service-type availability, inactive thresholds, and raise-offer thresholds in dedicated config modules. The contract must be parameterized enough to clone later, but it must optimize first for Xalapa truth.

- [ ] **Step 2: Make coverage boundaries visible in the product**

Customer UX must stop implying universal coverage. If an order falls into extended or manual-review conditions, surface bounded copy instead of silent failure. Driver and Admin surfaces should expose zone or serviceability context where it changes operations.

- [ ] **Step 3: Verify and commit**

Run:
```powershell
npm test -- src/test/xalapaCityZeroConfig.test.ts --run
npm test -- src/components/__tests__/XalapaOperatingRules.test.tsx --run
npm run lint
npm run build
```

Expected: the city contract is exercised by tests rather than living as undocumented constants.

## Task 5: Turn Admin into a cabina exception console

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\AdminDashboard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\DashboardControls.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\DashboardTabs.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\DashboardStats.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\dashboard\DashboardToolbar.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\OrderCardCostNotes.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\__tests__\OrderCardCostNotes.test.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\__tests__\pilotDemoFixtures.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\__tests__\pilotDemoVisualHarness.test.tsx`

- [ ] **Step 1: Define the exception queues before polishing visuals**

Admin must prioritize:
- orders waiting too long for first interest,
- repeated failed offer cycles,
- no-interest orders requiring manual review,
- cash short/over anomalies,
- lifecycle contradictions between order, offer, and assignment views.

Add failing component tests that assert exception-first ordering rather than vanity-stat rendering.

- [ ] **Step 2: Implement queue-first Admin views**

`AdminDashboard.tsx` and related controls should expose a dedicated cabina view with actionable queues, not only generic stats. `OrderCardCostNotes.tsx` must stay aligned with the ledger/closeout truth already in progress and must not become a second mutation surface with divergent rules.

- [ ] **Step 3: Verify and commit**

Run:
```powershell
npm test -- src/components/__tests__/OrderCardCostNotes.test.tsx src/components/__tests__/pilotDemoVisualHarness.test.tsx src/components/__tests__/DashboardStats.test.tsx --run
npm run lint
npm run build
```

Expected: Admin renders operational attention states clearly and without contradicting marketplace truth.

## Task 6: Add city metrics and launch gates

**Files:**
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\lib\cityZeroMetrics.ts`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\CityZeroReadinessPanel.tsx`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\__tests__\CityZeroReadinessPanel.test.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\AdminDashboard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\components\DashboardStats.tsx`

- [ ] **Step 1: Encode the minimum operating metrics**

Implement derived metrics for time to first driver interest, time to accepted assignment, no-offer rate, raise-offer rate, inactive rate, lifecycle completion rate, and key cash/order inconsistency counts. If some metric depends on missing source truth, fail loudly and log the gap instead of fabricating a proxy.

- [ ] **Step 2: Build explicit readiness gates**

The readiness panel must gate Xalapa on:
- marketplace lifecycle proof,
- four-driver QA proof,
- clean repo-baseline/workspace-sync at release time,
- stable deploy and promoted flow,
- no known critical stale-state bug across client/admin/driver,
- live metric capture rather than dead counters.

- [ ] **Step 3: Verify and commit**

Run:
```powershell
npm test -- src/components/__tests__/CityZeroReadinessPanel.test.tsx --run
npm run lint
npm run build
```

Expected: the product has an explicit city-zero go/no-go surface backed by code, not a slide narrative.

## Task 7: Prove remote lifecycle and canonize only verified truth

**Files:**
- Create: `C:\dev\vsm-store-fresh\.vsm-workkit\docs\audits\2026-06\xalapa-city-zero.md`
- Modify: `C:\dev\vsm-store-fresh\.vsm-workkit\AI_CONTEXT.md`
- Modify: `C:\dev\vsm-store-fresh\.vsm-workkit\AUDIT_LOG.md`

- [ ] **Step 1: Apply only forward-safe remote mutations**

Apply the marketplace and city-zero migrations from the admin worktree through the approved Supabase process. Query remote schema state after each apply. Do not mutate older applied migrations.

- [ ] **Step 2: Run end-to-end proof against the real workspace**

At minimum, prove:
- customer publishes,
- multiple eligible drivers compete,
- one winner is assigned atomically,
- losers close truthfully,
- order advances through lifecycle without stale UI,
- admin cabina can explain exceptions,
- metrics update for the scenario.

Use Playwright or the existing QA harnesses from clean worktrees, not the dirty mains.

- [ ] **Step 3: Re-run WorkKit gates before any readiness claim**

Run:
```powershell
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane repo-baseline
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane workspace-sync
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane qa-preflight
node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane canon
git -C "C:\dev\vsm-store-fresh\.vsm-workkit" diff --check
```

Expected: no city-zero readiness claim survives if any lane remains red.

- [ ] **Step 4: Canonize evidence, not aspiration**

Document exact commits, migrations, run IDs, QA proofs, known non-claims, and remaining debts in `docs\audits\2026-06\xalapa-city-zero.md`, then update `AI_CONTEXT.md` and `AUDIT_LOG.md` only after the evidence exists.

## Plan Self-Review

- The first blocker is treated correctly: current dirty mains are prerequisite debt, not an invisible detail.
- The largest product-truth gap remains first in sequence: competitive marketplace completion precedes city metrics and polish.
- Xalapa is modeled as a bounded operating contract, not as a vague "launch city" label.
- The plan preserves expansion seams through config modules, but deliberately refuses to optimize for speculative national complexity before one city is proven.
