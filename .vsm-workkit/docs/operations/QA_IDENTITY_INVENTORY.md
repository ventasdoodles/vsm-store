# QA Identity Inventory

Non-secret inventory for local/dev QA identities only.

## Active / verified

| Email | Role | Display name | Profile ID | Auth User ID | Purpose | Environment / scope | Status | Created / verified | Cleanup note | Password location note |
|---|---|---|---|---|---|---|---|---|---|---|
| smoke.driver.1780018983741@ivoy.com | driver | Rodrigo Repartidor Demo | 4c0882b4-7cd3-4fc7-b9bb-309891c49842 | 4c0882b4-7cd3-4fc7-b9bb-309891c49842 | Reusable QA driver for standard-login driver surface verification | Local dev / Supabase project `inlvpbiphrrfrdvsadnh` | active | Verified 2026-05-30 local | Keep available for controlled MVP lifecycle QA; do not delete during normal lanes | Stored outside repo; temporary lane password used only for verification |

## Found but not primary

| Email | Role | Display name | Profile ID | Auth User ID | Purpose | Environment / scope | Status | Created / verified | Cleanup note | Password location note |
|---|---|---|---|---|---|---|---|---|---|---|
| qa.driver.yavoy.lifecycle@example.com | driver | QA Driver Lifecycle | 4aa7fd81-5ce2-48a6-a77b-96d8b77a7f49 | 4aa7fd81-5ce2-48a6-a77b-96d8b77a7f49 | Provisioned fallback QA driver identity for lane recovery | Local dev / Supabase project `inlvpbiphrrfrdvsadnh` | unknown | Created 2026-05-30 local; login verification failed with database unexpected_failure | Retain unless later cleanup is explicitly requested; not the verified credential | Stored outside repo; lane-only dummy password |

## Notes

- No passwords, tokens, recovery links, cookies, session data, env values, or auth headers are stored here.
- The verified credential is the existing `smoke.driver...` driver account after a scoped password reset performed in the database.
- The fallback `qa.driver...` account remains documented only as a non-primary record because standard login did not complete successfully.
