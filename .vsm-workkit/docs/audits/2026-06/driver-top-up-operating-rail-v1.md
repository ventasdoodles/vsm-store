# Driver Top-Up Operating Rail v1

Date: 2026-06-20 local / 2026-06-21 UTC evidence.

## Verdict

ACCEPT WITH RESIDUAL RISK.

The controlled QA rail for cash-first driver top-ups is implemented and remotely proven. It is not a banking/SPEI/accounting/compliance system and does not by itself authorize public pilot expansion.

## Scope

- Driver submits a top-up request from `/driver?tab=wallet` with amount, evidence reference, and optional note.
- Admin validates the request from the cash-closeout dashboard and can approve, reject, or reverse.
- Approval and reversal mutate balances only through service-role RPCs and immutable ledger journals.
- Driver sees request status and ledger-backed financial activity.
- Tests are modular plus real remote E2E.

## Canonical SHAs

- Admin: `e852de7a2165aa0691323837331e5b0e99d011da`.
- Client: `1f359f64355cde8cb839f15a62ae464931cc3986`.
- Canon preliminary spec/plan: `76aefe6bfaa2121267ba9b6d1714e37ff44fea3c`.

## Supabase

- Project: `inlvpbiphrrfrdvsadnh`.
- Applied targeted migrations:
  - `20260620235500_driver_topup_operating_rail_v1.sql`.
  - `20260621001000_driver_topup_grant_hardening.sql`.
- Apply method: targeted `db query --linked --file`, then migration history repaired as applied.
- Remote probes confirmed:
  - `admin_driver_topup_requests_queue`.
  - `driver_wallet_topup_request_status`.
  - `admin_approve_driver_wallet_topup_request`.
  - `admin_reject_driver_wallet_topup_request`.
  - `admin_reverse_driver_wallet_topup_request`.
  - Minimal grants: authenticated `SELECT, INSERT`; service_role `SELECT, INSERT, UPDATE`.

## Failure Found

Admin E2E QA run `27889488334` failed in `driver-topup-operating-rail.spec.ts`.

Exact symptom: driver request was created and visible in Admin, but clicking Admin `Aprobar` did not emit `POST /functions/v1/admin-wallet-ledger`.

Root cause: Edge Function CORS was incomplete for the real browser QA origin and headers. `admin-wallet-ledger` did not allow GitHub Pages origin `https://ventasdoodles.github.io` and did not allow the global Supabase browser header `x-guest-session-id`. Browser preflight could be blocked before the POST, creating the same observable signature as a dead UI click.

Fix:

- Admin `9a679c6cfe44a6fe76c0ed1d2b4c28917731810f`: allowed QA Pages origin and Vercel preview origin support.
- Admin `e852de7a2165aa0691323837331e5b0e99d011da`: allowed `x-guest-session-id` across browser-facing Edge Functions.
- Added `src/tests/edgeFunctionCorsContract.test.js` so Pages origin and guest-session header are repo-controlled contracts.
- Direct preflight probe after deploy confirmed `admin-wallet-ledger` and `assign-driver` return `Access-Control-Allow-Origin: https://ventasdoodles.github.io` and include `x-guest-session-id`.

## Local Proof

Admin:

- Focused CORS/function/component contracts passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm test -- --run` passed: 62 files / 219 tests.
- `npm run verify:release-readiness` passed with `ADMIN_RELEASE_READINESS_PASS`.

Client:

- Focused driver wallet tests passed.
- `npm run typecheck -- --pretty false` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:run -- --run` passed: 79 files / 452 tests.
- `npm run verify:release-readiness` passed with `RELEASE_READINESS_PASS`.

## Remote Proof

Admin `e852de7`:

- Supabase Functions: `27889896147` success.
- Quality Gates: `27889896145` success.
- Vercel: `27889896136` success.
- GitHub Pages: `27889896142` success.
- Lighthouse: `27889896140` success.
- Credentialed Admin E2E QA: `27889999555` success.
- E2E summary: `expected=12 skipped=0 unexpected=0 flaky=0`.

Top-up E2E retained evidence:

- Request: `65319a45-2088-4ff4-899d-1792001b6b70`.
- Approval journal: `48b2ed44-c601-435e-b917-22643a4e84cf`.
- Reversal journal: `6720de3f-dca7-4e53-aea0-bf3fd840df4b`.

Client `1f359f6`:

- Quality Gates: `27889381342` success.
- Vercel: `27889381354` success.
- GitHub Pages: `27889381346` success.
- Smoke Public Runtime: `27889381358` success.
- Lighthouse: `27889381347` success.
- Live Order Lifecycle Monitor: `27889488370` success.

## Residual Risks

- No production SPEI/bank integration.
- No certified accounting, tax, or legal compliance claim.
- No real field cash custody SOP or cashier reconciliation policy.
- No physical mobile/PWA hardware proof.
- No provider GPS/navigation proof.
- No push/WhatsApp/incident-readiness proof.
- No fraud/risk automation.
- No public pilot claim beyond controlled QA evidence.
