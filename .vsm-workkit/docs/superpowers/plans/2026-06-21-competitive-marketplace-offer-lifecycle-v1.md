# Competitive Marketplace Offer Lifecycle v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-grade competitive marketplace lifecycle where multiple drivers can compete for the same order, the customer must explicitly accept the winning offer, assigned trips persist until formal closure, commission stays reserved after assignment until cancellation validity is resolved, and the critical no-offer / inactive / no-show / support-release variants are covered by tests.

**Architecture:** Extend the current marketplace contract instead of replacing it. The source of truth must live in Supabase state transitions first, then the client and admin surfaces should project those transitions without inventing state locally. Cancellation, inactivity, and arrival/no-show handling should be modeled as explicit order lifecycle states plus structured metadata so driver, customer, admin, and support all converge on the same truth.

**Tech Stack:** React, TypeScript, Vitest, Supabase Postgres migrations, Supabase Edge Functions, realtime subscriptions, local browser verification.

---

## File Structure

- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\migrations\*.sql`
  - Authoritative DB lifecycle, RPCs, settings, and state machine changes.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\functions\customer-cancel-order\index.ts`
  - Customer cancellation API path; extend to structured reasons and reservation-safe post-assignment behavior.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\functions\driver-create-counteroffer\index.ts`
  - Keep counteroffer validation aligned with DB rules.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\types.ts`
  - Shared client lifecycle/status/types contract.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\OrderConfirmationStep.tsx`
  - Customer-facing lifecycle, inactive/reactivate/raise/cancel surfaces, offer acceptance UX.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverMarketplace.tsx`
  - Driver marketplace feed and losing-offer visibility.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverDashboard.tsx`
  - Assigned-trip persistence and no-show / support escalation UX.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\*.test.tsx`
  - Marketplace and lifecycle behavior tests.
- `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\tests\*.test.js`
  - Migration contract and function inventory tests.

### Task 1: Freeze the lifecycle contract in tests

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\types.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\MarketplaceFourDriverLifecycle.test.tsx`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\MarketplaceLifecyclePolicy.test.ts`

- [ ] **Step 1: Write failing lifecycle policy tests**

```ts
it('defines explicit marketplace lifecycle states for inactive, cancel review, and contact-point waiting', () => {
  expect(ORDER_STATUS_ALL).toEqual(
    expect.arrayContaining([
      'pending',
      'awaiting_customer_acceptance',
      'inactive',
      'cancel_review',
      'awaiting_pickup_contact',
      'awaiting_dropoff_contact',
    ]),
  );
});

it('keeps cancellation reasons structured and allows free-text only for other', () => {
  expect(CUSTOMER_CANCEL_REASON_ALL).toContain('changed_mind');
  expect(CUSTOMER_CANCEL_REASON_ALL).toContain('mistake');
  expect(CUSTOMER_CANCEL_REASON_ALL).toContain('other');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/test/MarketplaceLifecyclePolicy.test.ts src/test/MarketplaceFourDriverLifecycle.test.tsx --run`
Expected: FAIL because the new lifecycle states and cancellation reason contract do not exist yet.

- [ ] **Step 3: Add the minimal shared type contract**

```ts
export const ORDER_STATUS_ALL = [
  'pending',
  'awaiting_customer_acceptance',
  'assigned',
  'to_pickup',
  'awaiting_pickup_contact',
  'picked_up',
  'in_transit',
  'awaiting_dropoff_contact',
  'delivered',
  'issue',
  'inactive',
  'cancel_review',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUS_ALL)[number];

export const CUSTOMER_CANCEL_REASON_ALL = [
  'changed_mind',
  'mistake',
  'delay_too_long',
  'price_no_longer_works',
  'other',
] as const;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/test/MarketplaceLifecyclePolicy.test.ts src/test/MarketplaceFourDriverLifecycle.test.tsx --run`
Expected: PASS.

### Task 2: Lock the database lifecycle around assignment, inactivity, and cancellation review

**Files:**
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\migrations\<new marketplace lifecycle migration>.sql`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\src\tests\marketplaceSupersededOfferClosureMigration.test.js`

- [ ] **Step 1: Write failing migration contract tests**

```js
it('keeps direct driver accept in awaiting_customer_acceptance until the customer explicitly confirms', () => {
  expect(sql).toMatch(/driver_accept_order[\s\S]*set[\s\S]*status\s*=\s*'awaiting_customer_acceptance'/i);
});

it('moves assigned cancellations into cancel_review instead of cancelling immediately', () => {
  expect(sql).toMatch(/set[\s\S]*status\s*=\s*'cancel_review'/i);
});

it('stores inactivity and contact-point wait settings in app_settings', () => {
  expect(sql).toMatch(/marketplace_customer_response_minutes/i);
  expect(sql).toMatch(/marketplace_pickup_wait_minutes/i);
  expect(sql).toMatch(/marketplace_dropoff_wait_minutes/i);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/tests/marketplaceSupersededOfferClosureMigration.test.js --run`
Expected: FAIL because the migration does not yet model the new lifecycle.

- [ ] **Step 3: Add the migration with minimal authoritative state changes**

```sql
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_customer_acceptance';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'inactive';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'cancel_review';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_pickup_contact';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_dropoff_contact';

ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS marketplace_customer_response_minutes integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS marketplace_inactive_after_minutes integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS marketplace_pickup_wait_minutes integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS marketplace_dropoff_wait_minutes integer NOT NULL DEFAULT 5;
```

The same migration should also:
- update `driver_accept_order` so a direct driver accept sets `awaiting_customer_acceptance` and keeps the driver reservation safe;
- add RPCs for `customer_confirm_marketplace_assignment`, `customer_reactivate_marketplace_order`, `customer_raise_marketplace_offer`, `customer_cancel_marketplace_order`, `driver_cancel_marketplace_assignment`, and support/arrival wait state transitions;
- ensure post-assignment cancellation goes to `cancel_review`, not `cancelled`;
- ensure driver cancellation returns the order to the marketplace feed when operationally valid;
- ensure inactivity demotes stalled pre-assignment orders to `inactive`.

- [ ] **Step 4: Run migration contract tests**

Run: `npm test -- src/tests/marketplaceSupersededOfferClosureMigration.test.js --run`
Expected: PASS.

### Task 3: Extend customer cancellation and order surfaces

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy-admin\xalapa-city-zero-admin\supabase\functions\customer-cancel-order\index.ts`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\OrderConfirmationStep.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\OrderConfirmationStep.test.tsx`

- [ ] **Step 1: Write failing customer cancellation and inactive-state tests**

```ts
it('requires a structured cancellation reason and free text only for other', async () => {
  renderWithProviders(<OrderConfirmationStep onReorder={vi.fn()} />);
  expect(await screen.findByText(/Selecciona un motivo/i)).toBeInTheDocument();
});

it('shows reactivate, raise offer, and delete actions for inactive marketplace orders', async () => {
  expect(await screen.findByRole('button', { name: /Reactivar/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Subir oferta/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Borrar oferta/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/test/OrderConfirmationStep.test.tsx --run`
Expected: FAIL because the UI does not yet expose the structured cancellation or inactive controls.

- [ ] **Step 3: Implement the minimum customer-side behavior**

```ts
const CUSTOMER_CANCEL_OPTIONS = [
  { value: 'changed_mind', label: 'Ya no quiero el servicio' },
  { value: 'mistake', label: 'Me equivoque' },
  { value: 'delay_too_long', label: 'Ya no me funciona el tiempo' },
  { value: 'price_no_longer_works', label: 'Ya no me funciona la tarifa' },
  { value: 'other', label: 'Otra razon' },
];
```

The implementation should:
- replace `window.confirm` style cancellation with reason-driven submission;
- send structured payload to the cancellation function/RPC;
- surface `inactive` orders with `Reactivar`, `Subir oferta`, and `Borrar oferta`;
- keep `awaiting_customer_acceptance` explicit when a driver accepted the base fare but the customer has not confirmed yet.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/test/OrderConfirmationStep.test.tsx --run`
Expected: PASS.

### Task 4: Extend driver active-trip persistence and no-show handling

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\components\DriverDashboard.tsx`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\DriverMarketplace.test.tsx`
- Create: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\DriverAssignedLifecycle.test.tsx`

- [ ] **Step 1: Write failing driver persistence and no-show tests**

```ts
it('keeps assigned or cancel-review trips visible across refresh-oriented reload state', async () => {
  expect(await screen.findByText(/Activos/i)).toBeInTheDocument();
  expect(screen.getByText(/cancel_review|Esperando resolucion/i)).toBeInTheDocument();
});

it('starts a five-minute wait flow when the driver reaches pickup or dropoff contact state', async () => {
  expect(await screen.findByText(/Tiempo de espera: 05:00/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Liberarme sin penalizacion/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/test/DriverAssignedLifecycle.test.tsx src/test/DriverMarketplace.test.tsx --run`
Expected: FAIL.

- [ ] **Step 3: Implement the minimum driver lifecycle UI**

The implementation should:
- query active orders with `assigned`, `awaiting_pickup_contact`, `to_pickup`, `picked_up`, `in_transit`, `awaiting_dropoff_contact`, and `cancel_review`;
- show explicit contact/wait guidance at point A and point B;
- keep cancel-review orders attached to the driver until customer, driver, or support resolves them;
- never rely on local tab state for persistence.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/test/DriverAssignedLifecycle.test.tsx src/test/DriverMarketplace.test.tsx --run`
Expected: PASS.

### Task 5: Validate and prove the end-to-end lifecycle

**Files:**
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\qa-temp\private-mvp-multiscenario-harness.cjs`
- Modify: `C:\Users\dgcar\.config\superpowers\worktrees\ivoy1.6\xalapa-city-zero-client\src\test\localMultiscenarioHarness.test.ts`

- [ ] **Step 1: Add failing multiscenario coverage**

Add scenarios for:
- driver accepts base fare, customer must still confirm;
- customer inactive then reactivate / raise offer;
- customer cancel after assignment -> `cancel_review`;
- driver cancel -> order returns to feed;
- pickup no-show wait path;
- dropoff no-show/support path.

- [ ] **Step 2: Run focused harness tests**

Run: `npm test -- src/test/localMultiscenarioHarness.test.ts --run`
Expected: FAIL until the new scenarios are wired.

- [ ] **Step 3: Update the harness and scenario assertions**

The harness should capture:
- primary `order_id`;
- order status transitions;
- offer counts/statuses;
- driver balance / `reserved_balance`;
- cleanup result;
- retained evidence when cancel review intentionally persists.

- [ ] **Step 4: Run validation**

Run:
- `npm test -- src/test/MarketplaceLifecyclePolicy.test.ts src/test/MarketplaceFourDriverLifecycle.test.tsx src/test/OrderConfirmationStep.test.tsx src/test/DriverMarketplace.test.tsx src/test/DriverAssignedLifecycle.test.tsx src/test/localMultiscenarioHarness.test.ts --run`
- `npm run build`
- local browser/harness verification for the critical marketplace scenarios

Expected: all targeted tests pass, build passes, and local runtime proof shows the intended lifecycle without state loss.
