# Cash Closeout Control Plane v1

Date: 2026-06-20

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

- Admin: `ventasdoodles/ivoy-admin` `957004031990f14165cca688c554f0ca47a17153`.
- Client: `ventasdoodles/ivoy` `50e2235920e9ce780c2005766df8df8fe42b54e4`.
- Canon: `ventasdoodles/ivoy-canon`.
- Supabase dev project: `inlvpbiphrrfrdvsadnh`.

## Accepted Changes

- Admin adds Cash Closeout Control Plane v1:
  - service-role-only RPC `admin_submit_cash_closeout(uuid,numeric,text,text,uuid)`;
  - service-role-only RPC `admin_reverse_cash_closeout(uuid,text,text,uuid)`;
  - `ledger_journal_reversals`;
  - reversal-aware active closeout checks;
  - `driver_financial_activity` and `admin_cash_closeout_queue` as `security_invoker` views;
  - narrow `admin-wallet-ledger` Edge Function actions for submit/reverse;
  - Admin cash closeout queue UI;
  - Driver/Admin wallet history from the unified financial activity view;
  - modular Playwright helper/spec coverage.
- Client adds:
  - guarded QA driver baseline reset migration;
  - Driver wallet financial history from `driver_financial_activity`.

## Remote DB Evidence

Migration `20260620220917_cash_closeout_control_plane_v1.sql` was applied by targeted:

```text
npx --yes supabase@2.106.0 db query --linked --file supabase\migrations\20260620220917_cash_closeout_control_plane_v1.sql --output json
```

Migration history was repaired as applied:

```text
npx --yes supabase@2.106.0 migration repair --linked --status applied 20260620220917
```

Remote probes confirmed:

- `public.ledger_journal_reversals` exists.
- `public.admin_submit_cash_closeout(uuid,numeric,text,text,uuid)` exists.
- `public.admin_reverse_cash_closeout(uuid,text,text,uuid)` exists.
- obsolete `driver_cash_settlements_one_active_order` is absent.
- `driver_cash_settlements_active_order_idx` exists.
- `driver_financial_activity` has `security_invoker=true`.
- `admin_cash_closeout_queue` has `security_invoker=true`.
- routine execute grants for submit/reverse are limited to `postgres` and `service_role`.
- migration list shows local and remote `20260620220917` aligned.

## Local Proof

Admin:

- `npm run verify:release-readiness`: `ADMIN_RELEASE_READINESS_PASS`.
- Full Vitest: `59 files / 211 tests`.
- `npm run verify:cash-wallet-ledger-contract`: `CASH_WALLET_LEDGER_CONTRACT_PASS`.
- `npm run verify:e2e-qa-workflow`: `E2E_QA_WORKFLOW_PASS target=admin`.
- `npm run test:e2e:list`: `11 tests in 8 files`.

Client:

- `npm run verify:release-readiness`: `RELEASE_READINESS_PASS`.
- Full Vitest: `79 files / 451 tests`.
- `npm run verify:migration-security`: `MIGRATION_SECURITY_PASS tables=1`.

WorkKit:

- `repo-baseline`: PASS.
- `workspace-sync`: PASS.

## Remote Proof

Admin `9570040`:

- Quality Gates: `27886832863`, success.
- Deploy Admin to Vercel: `27886832860`, success.
- Deploy Supabase Functions: `27886832876`, success after rerun.
- Deploy Admin to GitHub Pages: `27886832873`, success.
- Lighthouse CI: `27886832892`, success.
- Credentialed Admin E2E QA: `27886960686`, success.

Client `50e2235`:

- Client Quality Gates: `27886832753`, success.
- Deploy Client to Vercel: `27886832737`, success.
- Deploy Client to GitHub Pages: `27886832761`, success.
- Smoke Public Runtime: `27886832743`, success.
- Lighthouse CI: `27886832740`, success.
- Live Order Lifecycle Monitor: `27886960665`, success.

## E2E Cash Closeout Evidence

Admin E2E QA `27886960686`:

- Playwright stats: `expected=11 skipped=0 unexpected=0 flaky=0`.
- New spec listed and executed: `cash-closeout-lifecycle.spec.ts`.
- Cash closeout retained evidence:
  - order: `48a5719a-4318-4a38-b309-426c58990f38`;
  - first settlement: `5f3e4897-3de9-4c35-ba7b-e2ce7285af72`;
  - reversal settlement: `a0123a34-4fef-49bc-93c9-f25b514d3f9e`;
  - corrected short closeout settlement: `0fe98417-6e10-4168-94f0-4a75a133f26b`.
- The spec proved:
  - real customer order creation;
  - real Admin UI driver assignment with `assign-driver` request/response;
  - real driver status progression to delivered;
  - open cash closeout queue row;
  - closeout submit;
  - idempotent retry returns same settlement/journal;
  - balanced journal entries;
  - reversal audit via `ledger_journal_reversals`;
  - re-close after reversal as `short`.

Client Live Order Lifecycle Monitor `27886960665`:

- order: `e66627e7-de97-439d-88a0-67bf5ee7659c`;
- phases: `pending -> assigned -> to_pickup -> picked_up -> in_transit -> delivered`;
- cleanup: `deleted`; `terminal=true`.

## Residual Risks

- No certified accounting/compliance review.
- No real field cash handoff or cashier reconciliation procedure.
- No self-service driver deposit/SPEI proof.
- No physical mobile/PWA device proof.
- No provider-grade GPS/navigation proof.
- No push/WhatsApp/incident-readiness proof.
- No full security/compliance audit.
- The cash closeout E2E intentionally retains immutable ledger evidence; future QA retention and cleanup policy is still needed.

