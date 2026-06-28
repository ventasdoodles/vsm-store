# Ya VOY QA Runtime Contract

Date: 2026-06-01

## Purpose

This is the non-secret source of truth for local/dev QA runtime readiness. Future QA runs must stop before any harness starts when the runtime host, project identity, QA users, credential shape, passwords presence, auth sign-in, schema contract, source selector contract, protected evidence, or driver baseline is unknown or inconsistent.

This document is canon only. It does not store passwords, tokens, service-role keys, cookies, session data, auth headers, recovery links, or local storage.

## Repo / path map

| Role | Path |
|---|---|
| Canon | `C:\dev\vsm-store-fresh\.vsm-workkit` |
| Client / Driver | `F:\ivoy\ivoy1.6` |
| Admin | `F:\ivoy\ivoy-admin` |

## Supabase project contract

| Field | Value |
|---|---|
| Project ref | `inlvpbiphrrfrdvsadnh` |
| Allowed host | `inlvpbiphrrfrdvsadnh.supabase.co` |
| Runtime URL | `https://inlvpbiphrrfrdvsadnh.supabase.co` |
| Service role | Required locally only for the executable contract check. |
| Canon policy | No `service_role` value, password, token, cookie, session, recovery link, or auth header may be stored in canon. |

## Required local ignored files

These files must exist locally in the client repo before a QA run:

- `F:\ivoy\ivoy1.6\qa-temp\qa-runtime.local.ps1`
- `F:\ivoy\ivoy1.6\qa-temp\qa-credentials.local.json`

Both files must remain gitignored and must not be committed.

## Required credentials JSON shape

The local JSON must contain these fields:

- `customerEmail`
- `customerPassword`
- `customerUserId`
- `driverEmail`
- `driverPassword`
- `driverUserId`
- `adminEmail`
- `adminPassword`
- `adminUserId`

Passwords are checked only as `PRESENT` / `MISSING`.

## Canonical QA users

| Surface | Email | User ID |
|---|---|---|
| Customer | `qa_client@ivoy.com` | `63cc3cda-bc02-4794-96c4-579dd7360e1d` |
| Driver | `ivoymx@gmail.com` | `5335166a-7e13-4541-927b-b34a01224cca` |
| Admin | `qa_admin@ivoy.com` | `73b0a545-e697-4e9a-b5b7-c1173ea3cf1e` |

## Auth route / selector truth table

| Surface | Route | Email selector candidates | Password selector candidates | Submit selector candidates | Post-login success signals |
|---|---|---|---|---|---|
| Customer / Client | `/auth` | `input[type="email"]` | `input[type="password"]` | `button[type="submit"]`, button text `Iniciar Sesión` | Redirect away from `/auth`; authenticated home/profile/order flow becomes available. |
| Driver | `/auth`, then `/driver` for driver role | `input[type="email"]` | `input[type="password"]` | `button[type="submit"]`, button text `Iniciar Sesión` | Driver profile role routes to `/driver`; driver dashboard loads. |
| Admin | `/login` | `#email`, `input[type="email"]` | `#password`, `input[type="password"]` | `button[type="submit"]`, button text `Iniciar Sesión` | Protected admin dashboard loads after auth context accepts the session. |

The executable checker must inspect source-level auth files for these candidates. It must not inspect browser storage, cookies, sessions, or tokens.

## Schema contract

### `public.orders`

Required columns for QA:

- `id`
- `user_id`
- `driver_id`
- `service_type`
- `details`
- `status`
- `payment_method`
- `client`
- `recipient`
- `estimated_cost`
- `base_fare`
- `customer_offer_fare`
- `final_fare`
- `commission_rate_snapshot`
- `commission_amount_snapshot`
- `created_at`
- `updated_at`

`orders.details` must exist. `orders.task_description` must not be used as a physical database column by the QA runtime. Client source may keep TypeScript/form-level `task_description`, but runtime insert payloads must strip it before PostgREST insert and map it into `details`.

Canonical statuses expected by QA:

- `pending`
- `assigned`
- `to_pickup`
- `picked_up`
- `in_transit`
- `delivered`
- `issue`
- `cancelled`

### `public.order_offers`

Required fields when used:

- `id`
- `order_id`
- `driver_id`
- `proposed_fare`
- `status`
- `expires_at`
- `created_at`
- `updated_at`

### `public.wallet_transactions`

Required fields when used:

- `id`
- `driver_id`
- `amount`
- `transaction_type`
- `reference_order_id`
- `created_at`

### `public.profiles` driver baseline fields

Required fields:

- `id`
- `role`
- `balance`
- `reserved_balance`
- `availability_status`

## Protected retained evidence

Known retained evidence order IDs from canon:

- `31b64a10-4b05-41c8-95e5-fcfe8971a65d`
- `dbeb5226-e539-443f-b56f-3ae6a5641488`
- `124c1cf6-cf71-4f22-a1e2-8f3bfa4788c3`

These orders must not be deleted, cancelled, overwritten, or reused as fresh test fixtures in a QA run. If the executable gate cannot identify this section or if the IDs are removed from canon, the run must stop with `FAIL_PROTECTED_EVIDENCE_UNKNOWN`.

## Driver baseline

Canonical driver ID:

- `5335166a-7e13-4541-927b-b34a01224cca`

Expected clean baseline before a full QA run:

- `balance = 500.00`
- `reserved_balance = 0.00`
- `availability_status = libre`

If the driver profile is missing or these fields cannot be read safely, the QA run must stop. If the values diverge, the QA run must stop before harness execution.

## Forbidden actions

- Do not print secrets.
- Do not inspect `.env` or `.env.local`.
- Do not store passwords in canon.
- Do not store service-role keys in canon.
- Do not commit `qa-temp` files.
- Do not mutate database rows.
- Do not mutate Auth users.
- Do not reset passwords.
- Do not run the full QA harness before the contract is ready.
- Do not modify product UI, product runtime, or business logic for this contract.
- Do not modify DB migrations for this contract.
- Do not touch payments, GPS/tracking, notifications, production, live smoke, real riders, or real couriers.

## Non-claims

This contract does not prove production readiness, real payment readiness, GPS/tracking readiness, notification readiness, real courier operations, deploy readiness, live-smoke readiness, full security/compliance, or complete accounting semantics.

## Stop / fail codes

- `FAIL_RUNTIME_FILE_MISSING`
- `FAIL_SUPABASE_HOST_MISMATCH`
- `FAIL_SERVICE_ROLE_MISSING`
- `FAIL_CREDENTIAL_SHAPE`
- `FAIL_QA_USER_MISMATCH`
- `FAIL_PASSWORD_MISSING`
- `FAIL_AUTH_SIGNIN_CUSTOMER`
- `FAIL_AUTH_SIGNIN_DRIVER`
- `FAIL_AUTH_SIGNIN_ADMIN`
- `FAIL_SCHEMA_ORDERS_DETAILS_MISSING`
- `FAIL_SCHEMA_ORDERS_TASK_DESCRIPTION_USED`
- `FAIL_SELECTOR_CONTRACT`
- `FAIL_PROTECTED_EVIDENCE_UNKNOWN`
- `READY_FOR_QA_RUN`
