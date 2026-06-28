# Driver Top-Up Operating Rail v1 Plan

## Phase 0: Preconditions

- Read WorkKit/canon before product edits.
- Run `repo-baseline` and `workspace-sync`.
- Verify current Admin, Client, and Canon SHAs.
- Check official Supabase docs/changelog for current grants/RLS/function guidance.

## Phase 1: Red Tests

- Admin migration contract test fails until `driver_wallet_topup_requests`, RLS, grants, and service-role RPC protection exist.
- Admin Edge Function/service tests fail until approve/reject/reverse top-up request actions exist.
- Admin component test fails until a top-up queue can approve/reject/reverse requests.
- Client component test fails until driver can submit a top-up request and see statuses.

## Phase 2: Database And API

- Add Admin migration for `driver_wallet_topup_requests`.
- Add RLS/grants for driver own insert/read and admin read.
- Add service-role-only RPCs:
  - `admin_approve_driver_wallet_topup_request`
  - `admin_reject_driver_wallet_topup_request`
  - `admin_reverse_driver_wallet_topup_request`
- Extend `driver_financial_activity` for top-up request metadata where useful.
- Extend `admin-wallet-ledger` Edge Function with new actions.

## Phase 3: UI

- Client `DriverWalletTab` gets request form and request status list.
- Admin gets top-up queue plus approve/reject/reverse controls.
- Existing direct top-up form is not treated as the primary driver-initiated operating rail.

## Phase 4: QA

- Run Admin lint/build/tests/release-readiness.
- Run Client lint/build/tests/release-readiness.
- Apply Supabase migration remotely with targeted `db query --linked --file`.
- Repair migration history only after successful apply.
- Run remote probes for schema/RPC/grants/views.
- Push Admin/Client, wait checks on same SHA.
- Run Admin E2E QA and Client lifecycle monitor.

## Phase 5: Canon

- Update `AI_CONTEXT.md`, `AUDIT_LOG.md`, and `docs/audits/2026-06/`.
- Record SHAs, migration version, remote run IDs, E2E evidence, and residual risks.
- Final WorkKit gates: `repo-baseline`, `workspace-sync`, `canon`.
