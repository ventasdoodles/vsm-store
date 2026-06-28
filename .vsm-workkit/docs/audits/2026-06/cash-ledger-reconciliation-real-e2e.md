# Cash Ledger Reconciliation Real E2E

Date: 2026-06-20
Status: ACCEPT WITH RESIDUAL RISK

## Scope

Canonize the Admin-side proof added for the current commercial model:

- Customer pays driver in cash outside the platform.
- Driver must have platform balance before working.
- Platform must reserve/release/capture commission without double-charging.

This lane is limited to QA proof of cash order creation, driver wallet top-up, assignment reserve, delivery commission capture, and retry safety. It does not claim full payments, payouts, tax, compliance, bank reconciliation, or production finance readiness.

## Workkit Baseline

- Workkit rule confirmed before work: `C:\dev\vsm-store-fresh\.vsm-workkit` is mandatory canon/workkit.
- `repo-baseline`: PASS.
- `workspace-sync`: PASS.
- Admin repo clean/aligned before the cash-ledger implementation.
- Canon repo clean/aligned before this canon update.

## External Best-Practice Inputs Used

The implementation direction was grounded in current public finance/marketplace reliability guidance:

- Stripe idempotency guidance: repeated client retries must not create duplicate operations when using the same idempotency intent.
- Modern Treasury ledger guidance: money movements need auditable immutable ledger behavior; mutable business rows are not enough.
- Square Books guidance: financial systems should make impossible states impossible through double-entry-style consistency.
- FinLego ledger guidance: ledger entries need amount, currency/context, timestamp, reference/idempotency key, and immutable posting semantics.
- Versapay cash-on-delivery guidance: COD is workable but requires explicit tracking and reconciliation because cash settlement happens outside the platform.
- Onro COD courier guidance: COD courier software should keep delivery, cash, wallet, and reporting state trackable to reduce disputes and reconciliation gaps.
- Supabase current guidance checked before Supabase-related work; service-role execution and explicit grants remain part of the security posture.

## Accepted Admin Commits

### 1. Cash ledger E2E proof

Admin commit:

- `25ab9a03d813739cad58633f2eda4b4919fcb617`
- `test(admin): prove cash ledger reconciliation flow`

Accepted implementation facts:

- Added `tests/helpers/qa-money.ts`.
- Added `tests/payment-and-ledger-reconciliation.spec.ts`.
- The spec is modular and focused on money-state reconciliation instead of being folded into dispatch UI lifecycle coverage.
- The spec proves the QA driver wallet baseline, top-up, assignment reserve, delivery capture, ledger entry shape, and retry safety.

The remote E2E path proves:

- Client creates a package order through real UI with `payment_method='cash'`.
- Driver is funded through the service-role admin wallet RPC as `transaction_type='topup'`.
- Admin assigns the driver through the real Admin UI.
- Assignment moves commission from `profiles.balance` to `profiles.reserved_balance`.
- Before delivery, no order-scoped wallet transaction exists.
- Driver completes pickup/in-transit/delivery through real driver UI/RPC path.
- Delivery releases `reserved_balance` and inserts exactly one `commission_capture` wallet transaction.
- A second `complete_order_and_charge_commission` retry is rejected and does not create another capture.

Local verification:

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, `51` files / `189` tests before CI contract fix.
- `npx playwright test tests/payment-and-ledger-reconciliation.spec.ts --list`: PASS.

Local limitation:

- Direct local execution of the new E2E skipped because local shell did not provide the credentialed QA URLs/secrets required by the spec.

### 2. Critical E2E CI service-role contract

Admin commit:

- `52e7357e4f09516fb88bc916a54de363f4dbe0a0`
- `ci(admin): provide service role to critical e2e gates`

Accepted implementation facts:

- Added `SUPABASE_SERVICE_ROLE_KEY` to the Quality Gates workflow environment.
- Added explicit live E2E contract validation for `SUPABASE_SERVICE_ROLE_KEY`.
- Hardened `scripts/verify-ci-workflow.cjs` so future CI edits cannot silently remove the service-role dependency.
- Expanded `src/tests/verifyCiWorkflow.test.js` with a direct negative test for missing service role key.

Local verification:

- `npm run verify:ci-workflow`: PASS.
- `npm test -- src/tests/verifyCiWorkflow.test.js --run`: PASS, `7` tests.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm test -- --run`: PASS, `51` files / `190` tests.

## Remote Evidence

### Initial push of the cash-ledger spec

Head SHA:

- `25ab9a03d813739cad58633f2eda4b4919fcb617`

Remote findings:

- Deploy Admin to Vercel: run `27880001098` PASS.
- Lighthouse CI: run `27880001105` PASS.
- Deploy Admin to GitHub Pages: run `27880001085` PASS.
- Deploy Supabase Functions: run `27880001107` FAIL due external `esm.sh` `522` while bundling `@supabase/supabase-js@2.45.0` for `assign-driver`.
- Quality Gates: run `27880001104` FAIL because critical live E2E flows needed `SUPABASE_SERVICE_ROLE_KEY` after the QA driver funding hardening.

Cold interpretation:

- The Supabase failure was external dependency bundling instability, not an app-code failure.
- The Quality Gates failure was a real CI contract gap and was fixed in the next commit.

### CI contract fix and full push gates

Head SHA:

- `52e7357e4f09516fb88bc916a54de363f4dbe0a0`

Remote proof:

- Quality Gates: run `27880185343` PASS.
- Deploy Supabase Functions: run `27880185328` PASS.
- Deploy Admin to Vercel: run `27880185337` PASS.
- Lighthouse CI: run `27880185335` PASS.
- Deploy Admin to GitHub Pages: run `27880185338` PASS.

### Credentialed Admin E2E QA proof

Run:

- `27880290004`

Head SHA:

- `52e7357e4f09516fb88bc916a54de363f4dbe0a0`

Accepted result:

- `E2E QA`: PASS.
- Job `Credentialed Admin E2E QA`: PASS.
- `List E2E scenarios`: PASS.
- `Prepare QA driver balance`: PASS.
- `Run credentialed E2E scenarios`: PASS.
- `Reject skipped or failed E2E scenarios`: PASS.
- `Upload E2E QA results`: PASS.

This run is the accepted remote proof that the modular cash-ledger spec did not skip and did not fail.

## Accepted Outcome

This lane closes one major "system real" gap:

- Cash-only order flow is now represented in QA.
- Driver pre-funded wallet behavior is now explicitly proven.
- Assignment reserve and delivery commission capture are now proven across real browser surfaces.
- Commission capture retry safety is now proven at the E2E level.
- CI now carries the service-role secret required by the critical live E2E gate instead of relying on the separate manual QA workflow only.

## Residual Risks

- Wallet model is still not a full double-entry ledger.
- `profiles.balance` and `profiles.reserved_balance` remain mutable operational balances; `wallet_transactions` is only partial ledger evidence.
- Real driver deposits/top-ups are not implemented as a complete product flow.
- No proof of cash collected amount, driver-to-platform settlement, debt aging, payout, refund, dispute, cancellation, or adjustment workflows.
- No immutable accounting journal table with debit/credit legs, currency, reference key, actor, posted-at, and reversal semantics.
- No admin UI for deposit intake, reconciliation queue, cash shortage, overage, or driver statement export.
- No production finance compliance, tax, KYC/KYB, AML, or audit-readiness claim.
- No field proof with real couriers, physical cash handling, or operational reconciliation.

## Next Spec Needed For "Real System" Feel

The next product spec should be `Driver Cash Wallet And Reconciliation v1`:

- Driver wallet top-up intake: admin records cash/bank deposit, amount, source, actor, receipt/evidence, and reference.
- Immutable ledger journal: every wallet change creates posted debit/credit legs and never edits history.
- Operational balance projection: `profiles.balance` can remain a cached projection, but ledger is the source of truth.
- Order cash settlement: delivered cash order records expected cash, driver-collected confirmation, commission due, and platform net position.
- Reconciliation queue: admin sees drivers with cash owed, negative/low balance, pending deposit proof, and mismatched settlements.
- Idempotency keys: top-up, capture, refund, adjustment, and reversal flows reject duplicates safely.
- Statements: driver can see top-ups, reserves, captures, refunds, adjustments, and resulting balance.
- Reversals: corrections happen through compensating entries, not mutation/deletion of posted money records.

## Non-Claims

- No full launch-ready claim.
- No real payments/payouts readiness claim.
- No legal/compliance finance readiness claim.
- No production accounting readiness claim.
- No canon claim beyond the accepted cash-ledger QA proof and CI contract hardening lane.
