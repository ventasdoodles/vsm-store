# Live Monitor Customer Cancel Review Outcomes v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane extends the client live marketplace lifecycle monitor so it proves both administrative outcomes of customer cancellation after assignment in the real QA Supabase environment.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `a3f98a8f0cf46ce3eb27a6fe85ee6d95dcfbd58c`
- Message: `test(client): prove customer cancel review outcomes`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Problem Truth

The marketplace runtime already supported:

- customer cancellation after assignment moving the order into `cancel_review`
- admin resolution through `resolve_marketplace_cancel_review`
- distinct resolution labels such as `valid_customer_cancellation` and `invalid_customer_cancellation`

But the live QA monitor still did not prove the critical business rule the user asked for:

- commission remains resguardada after assignment
- admin later decides whether the cancellation was valid
- that decision changes what happens to the driver's reserved commission state

Before this lane, the monitor only proved that the customer cancellation could reach `cancel_review`. It did not prove either of the administrative outcomes.

## Behavior Accepted

This lane accepts the following live-monitor behavior:

- The monitor must include scenario `customer_cancel_after_assignment_valid`.
- That scenario must resolve through `resolve_marketplace_cancel_review(... valid_customer_cancellation ...)`.
- The monitor must include scenario `customer_cancel_after_assignment_invalid`.
- That scenario must resolve through `resolve_marketplace_cancel_review(... invalid_customer_cancellation ...)`.
- In the valid scenario, the driver must return exactly to the pre-scenario:
  - `balance`
  - `reserved_balance`
  - `availability_status`
- In the invalid scenario, the driver must:
  - keep the reduced available balance
  - release `reserved_balance` to `0`
  - return availability to `libre`
- Both scenarios must end with final order status `cancelled`.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 3 passed (4)
Failure: monitor source did not contain explicit valid/invalid customer cancel review outcomes
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  4 passed (4)
```

The accepted contract now requires:

- scenario `customer_cancel_after_assignment_valid`
- scenario `customer_cancel_after_assignment_invalid`
- resolution label `valid_customer_cancellation`
- resolution label `invalid_customer_cancellation`

## Implementation Truth

`scripts/monitor-live-order-lifecycle.cjs` now:

- replaces the single generic customer-cancel-after-assignment scenario with two explicit scenarios
- resolves the valid branch through `valid_customer_cancellation`
- resolves the invalid branch through `invalid_customer_cancellation`
- verifies different post-resolution driver financial states for each branch

Method truth:

- both scenarios still create real QA assigned orders
- both still use the real customer RPC to move into `cancel_review`
- the admin resolution then runs through the real RPC with the real QA admin session
- verification is performed against current DB state in the QA project

## Fresh Local Runtime Proof

Real QA monitor proof from the client checkout passed:

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=8
LIVE_ORDER_LIFECYCLE_PASS orderId=5b33cc49-8f86-4866-a519-bc8e4bd22e98 scenarios=8 phases=48
```

The generated summary `qa-temp/live-order-lifecycle-summary.json` recorded:

- valid customer-cancel scenario order `b143f6d1-7e69-4ddf-aac6-466a3a3f65e2`
  - phase `resolve_marketplace_cancel_review_valid_customer_cancellation`
  - expected terminal status `cancelled`
- invalid customer-cancel scenario order `605a325a-9ae6-4bff-8253-c902d5091a2a`
  - phase `resolve_marketplace_cancel_review_invalid_customer_cancellation`
  - expected terminal status `cancelled`

This is real runtime proof of the two admin outcomes on the current QA Supabase project, not only source proof.

## Fresh Local Proof

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts src/test/DriverAssignedLifecycle.test.tsx
Test Files  2 passed (2)
Tests  8 passed (8)
exit 0
```

```text
npm run test:run
Test Files  90 passed (90)
Tests  546 passed | 2 skipped (548)
exit 0
```

```text
npm run typecheck
exit 0
```

```text
npm run lint
exit 0
```

```text
npm run build
exit 0
```

```text
node --check scripts/monitor-live-order-lifecycle.cjs
exit 0
```

```text
git diff --check
exit 0
```

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit a3f98a8 --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Non-Claims

- No new customer-facing UI behavior
- No new DB migration or remote apply in this commit
- No hosted browser E2E
- No production deploy proof
- No physical mobile/GPS/payment/push/WhatsApp proof
- No global marketplace completion claim
