# Driver Cash Wallet And Reconciliation v1

Date: 2026-06-20
Status: ACCEPT WITH RESIDUAL RISK

## Scope

Canonize the first real driver cash wallet and reconciliation implementation across:

- Admin: `F:\ivoy\ivoy-admin`
- Client/Driver: `F:\ivoy\ivoy1.6`
- Supabase project: `inlvpbiphrrfrdvsadnh`

This lane implements the pilot model where the customer pays the driver in cash outside the platform, and the driver must maintain platform balance to work. It adds a double-entry-style ledger foundation, admin wallet top-up intake, admin per-order cash settlement action, and a driver wallet tab. It does not claim full financial compliance or real field cash operations.

## WorkKit Baseline

- WorkKit was treated as mandatory before and after implementation.
- `repo-baseline`: PASS after push and canon preflight.
- `workspace-sync`: PASS after push and canon preflight.
- Client, Admin, and Canon repos were clean and aligned to `origin/main` before this canon update.

## External Practice Inputs

Implementation direction used current public guidance from Stripe idempotency, Modern Treasury wallet/ledger design, FinLego double-entry ledger design, Stripe reconciliation guidance, and COD courier operational guidance. Accepted principles:

- Every money movement needs an idempotency key.
- Mutable balances are operational projections, not the accounting source of truth.
- Posted ledger entries should be immutable; corrections should be reversals.
- Cash-on-delivery needs explicit expected cash, declared cash, evidence reference, and reconciliation status.
- Driver-facing wallet history must separate top-ups, reservations, captures, settlements, and adjustments.

## Accepted Commits

Admin commits:

- `cde0a56 feat(admin): add cash wallet ledger foundation`
- `19a9a5a feat(admin): add cash settlement action`

Client commit:

- `addd32d feat(driver): add cash wallet tab`

## Accepted Implementation Facts

Admin DB and function foundation:

- Added migration `supabase/migrations/20260620191051_driver_cash_wallet_ledger_v1.sql`.
- Added tables `ledger_accounts`, `ledger_journals`, `ledger_entries`, and `driver_cash_settlements`.
- Enabled RLS and explicit role grants.
- Added immutable-entry trigger for `ledger_entries`.
- Added unique idempotency index for `ledger_journals(idempotency_key)`.
- Added RPCs `admin_record_driver_wallet_topup`, `admin_record_driver_cash_settlement`, and `admin_reverse_ledger_journal`.
- Added `admin-wallet-ledger` Edge Function with admin auth check and service-role RPC execution.
- Added static verifier `verify:cash-wallet-ledger-contract` and release-readiness wiring.

Admin UI:

- Driver cards now expose `DriverWalletTopUpForm` for admin-recorded driver wallet top-ups.
- Delivered cash orders with assigned registered drivers now expose a per-order `Conciliación cash` action in `OrderCardCostNotes`.
- The settlement action records expected cash, declared cash, evidence/reference, metadata, and stable idempotency key through `admin-wallet-ledger`.

Client/Driver UI:

- `/driver?tab=wallet` now renders a real driver wallet tab.
- The tab displays available balance, reserved balance, cash to reconcile, commission captures, and explicit model copy: client pays driver cash, platform discounts commission from driver balance, and Admin reconciles differences.

## Remote DB Apply

The migration was applied to the linked Supabase project by targeted query, not by global `supabase db push`, because the migration history has unrelated historical drift.

Accepted remote apply evidence:

- `supabase db query --linked --file supabase/migrations/20260620191051_driver_cash_wallet_ledger_v1.sql`: PASS.
- `supabase migration repair --linked --status applied 20260620191051`: PASS.
- Remote table query confirmed `driver_cash_settlements`, `ledger_accounts`, `ledger_entries`, and `ledger_journals`.
- Remote RPC query confirmed `admin_record_driver_cash_settlement`, `admin_record_driver_wallet_topup`, `admin_reverse_ledger_journal`, and `assert_ledger_journal_balanced`.
- Remote migration history query confirmed version `20260620191051`.

Important boundary:

- `supabase migration list --linked` is not reliable in this environment without `SUPABASE_DB_PASSWORD`; verification used management-API-backed `db query --linked`.
- Historical migration drift remains outside this lane and must not be “fixed” by a broad `db push`.

## Local Verification

Admin:

- `npm test -- src/tests/verifyCashWalletLedgerContract.test.js --run`: PASS.
- `npm run verify:migration-security`: PASS.
- `npm run verify:cash-wallet-ledger-contract`: PASS.
- `npm run verify:supabase-function-inventory`: PASS.
- `npm run verify:deploy-workflows`: PASS.
- Focused service/component tests for wallet top-up and cash settlement: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, 54 files / 201 tests.
- `npm run verify:release-readiness`: PASS.

Client:

- Focused driver wallet visual harness: PASS, 10 tests.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, 77 files / 449 tests.

## Remote Evidence

Admin head SHA:

- `19a9a5a`

Admin push proof:

- Quality Gates `27881748208`: PASS.
- Deploy Supabase Functions `27881748198`: PASS.
- Deploy Admin to Vercel `27881748213`: PASS.
- Deploy Admin to GitHub Pages `27881748202`: PASS.
- Lighthouse CI `27881748209`: PASS.
- Live protected-function probe for `admin-wallet-ledger`: `401 {"code":"UNAUTHORIZED_NO_AUTH_HEADER","message":"Missing authorization header"}`.
- Credentialed Admin E2E QA `27881881606`: PASS.

Client head SHA:

- `addd32d`

Client push proof:

- Client Quality Gates `27881750879`: PASS.
- Deploy Client to Vercel `27881750854`: PASS.
- Deploy Client to GitHub Pages `27881750877`: PASS.
- Smoke Public Runtime `27881750847`: PASS.
- Lighthouse CI `27881750851`: PASS.
- Live Order Lifecycle Monitor `27881937802`: PASS.

## Accepted Outcome

- The previous Admin UI manual assignment blocker is no longer reproducing in the credentialed Admin E2E QA gate.
- The cash wallet model is no longer only demo copy: it now has a versioned ledger schema, admin top-up path, admin settlement path, service-role Edge Function, and driver wallet surface.
- The new ledger tables are live in the linked Supabase project.
- The new protected Edge Function is deployed and rejects unauthenticated calls.
- Client and Admin are both clean, aligned, deployed, and green on their main remote gates.

## Residual Risks

- This is still a pilot cash ledger, not certified accounting infrastructure.
- Real cash handling was not performed with actual couriers or customers.
- No KYC/KYB, AML, tax, invoice, payout, bank reconciliation, or legal compliance proof is claimed.
- Driver top-ups and settlements are admin-operated; there is no self-service deposit proof workflow.
- `profiles.balance` and `profiles.reserved_balance` remain operational projections and still need broader migration toward ledger-derived balances.
- Historical Supabase migration drift remains and must be handled as a separate controlled lane.
- No physical mobile/PWA hardware proof, provider GPS/navigation proof, push/WhatsApp delivery proof, or full incident-readiness proof is claimed.

## Non-Claims

- No full launch-ready claim.
- No production finance readiness claim.
- No real payment provider or payout integration claim.
- No real field-operations cash reconciliation claim.
- No broad database migration history repair claim.
