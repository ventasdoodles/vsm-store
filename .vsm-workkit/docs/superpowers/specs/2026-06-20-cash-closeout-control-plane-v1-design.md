# Cash Closeout Control Plane v1 Design

## Objective

Make the cash-only pilot operationally closable and auditable. A delivered cash
order must move through an explicit, immutable settlement lifecycle that only
allows values derived from the order itself. Admin must work from a cash
closeout queue rather than from an isolated button on an order card.

## Scope and Boundaries

In scope:

- Safe repair of the QA driver balance preparation RPC so a clean QA run starts
  from `balance = 500.00`, `reserved_balance = 0.00`, and `libre`, but never
  clears a reserve while that QA driver owns a nonterminal order.
- A versioned settlement lifecycle for delivered cash orders.
- Transactional database enforcement of settlement invariants and idempotency.
- An Admin queue for pending and discrepant cash closeouts, grouped and filtered
  by driver and operational cut.
- A single ledger-derived financial activity projection for Admin and driver
  history.
- Audited compensating reversals.
- Modular tests and an isolated real E2E cash-closeout scenario.

Out of scope:

- Google Maps, electronic payments, payouts, KYC/KYB, tax, AML, invoices,
  bank reconciliation, or accounting certification.
- Broad repair of historical Supabase migration drift.
- Physical cash collection or legal/compliance claims.

## Decision

Use one atomic database command for each settlement transition. The command
locks the target order, derives the driver, payment method, delivery state and
expected cash from persisted facts, and writes a new immutable journal. The
browser supplies only a declared amount, evidence reference and idempotency
intent; it cannot choose another driver, expected amount or settlement state.

`profiles.balance` and `profiles.reserved_balance` remain operational
projections during this version. The ledger is the financial source of truth;
all wallet and settlement history surfaces read the same ledger activity
projection rather than mixing `wallet_transactions` with ledger rows.

## Settlement State Machine

Every cash delivery has at most one active settlement. The persisted settlement
state is one of:

| State | Meaning | Allowed transition |
| --- | --- | --- |
| `open` | A delivered cash order has not been declared by Admin. | `submitted` |
| `submitted` | Admin supplied declared cash and evidence. | `matched`, `short`, `over` |
| `matched` | Declared cash equals expected cash; closure is accepted. | `reversed` |
| `short` | Declared cash is lower than expected cash. | `reversed` |
| `over` | Declared cash is greater than expected cash. | `reversed` |
| `reversed` | A compensating journal corrected a prior final state. | none |

`open` is a query-derived operational state for a delivered cash order with no
active settlement. `submitted` is retained only if a review boundary is later
needed; v1 processes submit and classification in the same transaction, so
successful operational records finish as `matched`, `short`, or `over`.

## Data Model and Invariants

The migration extends `driver_cash_settlements` and the existing immutable
ledger tables. It records `order_id`, `driver_id`, expected and declared cash,
currency, status, evidence reference, actor identity, idempotency key,
submitted/finalized/reversed timestamps, and reversal reason/reference.

Required invariants:

1. Only a delivered order with `payment_method = 'cash'` can settle.
2. The driver and expected cash are derived from the locked order; callers do
   not provide authoritative versions of either value.
3. The expected amount uses the persisted final fare selected by the existing
   order-pricing contract; a null or negative amount rejects the request.
4. One active settlement exists per order. A database unique partial index
   enforces this independently of the client idempotency key.
5. Repeating the same idempotency intent returns the original result. A second
   distinct intent for an already active order rejects.
6. A final settlement produces balanced, immutable ledger entries. Corrections
   append a compensating journal and never update/delete posted entries.
7. A reversal requires an authenticated Admin actor, nonblank reason, and a
   reference to the final settlement/journal it corrects.
8. No RLS policy relies on per-row reevaluation of `auth.uid()` or overlaps
   permissive policies unnecessarily. Browser users never receive service-role
   capabilities.

## Interfaces

The `admin-wallet-ledger` Edge Function exposes narrow actions:

- `submitCashCloseout`: accepts `orderId`, `declaredCash`, `evidenceReference`,
  and `idempotencyKey`; invokes the atomic database RPC.
- `reverseCashCloseout`: accepts `settlementId`, `reason`, and idempotency key;
  invokes the reversal RPC.
- Existing wallet top-up remains separate and must use the shared financial
  activity projection after this release.

The database RPCs perform authorization using the authenticated Admin identity
and avoid accepting caller-chosen financial facts. Service role is an execution
transport for the protected Edge Function, not a browser credential.

## Admin and Driver Experience

Admin gains a dedicated cash-closeout queue with only operationally actionable
rows:

- Delivered cash orders without an active settlement (`open`).
- Final settlements whose status is `short` or `over`.
- Filters for driver, status and operational cut/date.
- Per-driver subtotals for expected, declared and difference.
- A detail action that captures declared cash and evidence; a final settlement
  shows the immutable result and may expose a reason-required reversal action.

The existing order-card action becomes a deep link or a thin entry point to the
same queue/detail flow. It must not retain a separate write path.

Driver wallet history and Admin wallet history use a shared activity read model
that includes top-ups, reserves, captures, settlements, reversals and their
resulting balances. Raw legacy `wallet_transactions` is not a second history
source in these surfaces.

## QA State Safety

The forward-only QA helper migration changes
`qa_prepare_lifecycle_driver_balance()` to reset the QA reserve only after it
verifies there is no nonterminal order assigned to the canonical QA driver. If
such an order exists, it rejects with a clear error and preserves money state.
The helper remains service-role-only. Stale expired offers are a separate
hygiene lane and are not deleted by this release.

## Testing and Evidence

Tests are modular and own one contract each:

- SQL/static migration tests: state constraint, active-order uniqueness, RLS
  policy shape, RPC guards, and no mutable posted journals/entries.
- Edge Function tests: action allowlist, request validation, actor propagation,
  and error mapping.
- Component tests: queue filters/totals, submit payload, immutable final view,
  and reversal reason requirement.
- Real E2E: creates a namespaced cash order, funds the QA driver through a
  business operation, completes the actual lifecycle, opens the queue, submits
  a closeout, verifies one ledger projection, exercises safe retry, and cleans
  up through business operations only.

The scenario must not directly update `profiles.balance` or
`profiles.reserved_balance`. Its setup and cleanup must return the canonical QA
driver to the runtime contract and prove `qa-preflight` both before and after
the run.

## Exit Criteria

- `repo-baseline`, `workspace-sync`, and `qa-preflight` pass before release.
- A non-cash, non-delivered, unassigned, wrong-driver, null/negative-fare or
  duplicate settlement attempt fails without a journal write.
- Exactly one active settlement and one final immutable journal exist for a
  successful closeout; same-key retry is safe.
- Matched, short, over and reversal outcomes are visible and consistent in
  Admin queue/detail and driver/Admin history.
- Local lint, build, focused tests, complete suites and deployment contracts
  pass. Remote Admin E2E QA and client lifecycle proof pass against the same
  deployed SHAs.
- Canon records the migration, commits, remote run IDs, residual risks and the
  continuing non-claims.

## Risks and Rollback

The risk is monetary-state corruption, so every write is additive and
idempotent. A failed migration is not patched in place: create a new forward
migration. An incorrect final closeout is repaired only by an audited
compensating reversal. The queue may be hidden behind its existing Admin role
boundary until all remote gates are green; no data is destructively migrated.
