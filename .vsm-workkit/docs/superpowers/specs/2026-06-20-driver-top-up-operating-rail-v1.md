# Driver Top-Up Operating Rail v1

## Objective

Build the cash-first driver top-up rail as an operational workflow, not as a direct balance edit:

- Driver submits a top-up request with amount, evidence reference, and optional note.
- Admin validates the request and approves, rejects, or reverses it.
- Approved top-ups credit driver balance only through immutable ledger journals.
- Driver wallet shows request status, updated balance, and ledger-backed financial activity.

## Mandatory Guardrails

- Work starts only after `repo-baseline` and `workspace-sync` pass in `C:\dev\vsm-store-fresh\.vsm-workkit`.
- New Supabase public objects must include explicit grants plus RLS.
- Service-role financial mutation RPCs stay protected from `anon` and `authenticated`.
- Any `SECURITY DEFINER` function must set `search_path`.
- Driver and customer clients must not directly update `profiles.balance`.
- Ledger journals and entries remain append-only; corrections use reversal records/journals.

## Data Contract

Top-up request states:

- `submitted`: driver request exists, no balance impact.
- `approved`: admin accepted evidence and credited wallet through ledger.
- `rejected`: admin rejected evidence, no balance impact.
- `reversed`: admin reversed a previously approved top-up through a reversal journal.

Required request fields:

- `driver_id`
- `requested_amount`
- `approved_amount`
- `status`
- `evidence_reference`
- `driver_note`
- `admin_note`
- `idempotency_key`
- `journal_id`
- `reversal_journal_id`
- `submitted_at`
- `decided_at`
- `reversed_at`
- `created_by`
- `decided_by`
- `reversed_by`

## API Contract

Driver-side:

- Driver can create only their own `submitted` request.
- Driver can read only their own requests.
- Submitted request never changes balance.

Admin-side:

- Admin can read all requests through a queue view.
- Admin approval locks the request, verifies status, validates admin actor, posts ledger, updates profile balance, and returns request/journal ids.
- Admin rejection locks the request, verifies status, records decision metadata, and has no balance impact.
- Admin reversal locks an approved request, posts reversal, subtracts balance consistently, links reversal journal, and marks request `reversed`.

## UI Contract

Driver wallet:

- Shows a top-up request form with amount, evidence/reference, note.
- Shows recent top-up request statuses.
- Shows ledger-backed history from `driver_financial_activity`.
- Copy must state cash/manual validation; no bank/SPEI production claim.

Admin:

- Shows a pending top-up queue.
- Admin can approve with final approved amount and note.
- Admin can reject with reason.
- Admin can reverse approved requests with reason.
- Existing direct admin top-up form must either route through request approval or be clearly demoted to controlled admin adjustment, not the primary operating rail.

## Verification Contract

Local modular proof:

- Migration contract tests for grants/RLS/RPC protection/idempotency/reversal shape.
- Edge Function contract tests for new actions and payload validation.
- Admin service/component tests for approve/reject/reverse.
- Client component tests for request submit and status rendering.

Remote proof:

- Targeted Supabase migration apply, not `db push`.
- Remote schema/function/grant probes.
- Admin E2E QA proves request approval through UI and ledger activity.
- Client/driver proof shows balance/history after approval.
- Lifecycle proof confirms cash order and closeout remain consistent after top-up.

## Non-Claims

This v1 does not claim production SPEI/banking integration, certified accounting, tax/legal compliance, physical cash custody operations, public pilot readiness, or broad fraud/risk automation.
