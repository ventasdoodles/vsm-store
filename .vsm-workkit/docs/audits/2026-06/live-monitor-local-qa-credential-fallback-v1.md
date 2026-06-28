# Live Monitor Local QA Credential Fallback v1

Date: 2026-06-24

Verdict: ACCEPT WITH RESIDUAL RISK

## Scope

This lane fixes the local QA monitor plumbing so the client checkout can run the full marketplace lifecycle monitor using the same local QA credential bundle already used by the auth probe.

- Repo: `F:\ivoy\ivoy1.6`
- Commit: `347678f70c9009345e2c57f33b4d4cd87fda2ce1`
- Message: `fix(client): enable local QA fallback for live monitor`
- Files changed:
  - `scripts/monitor-live-order-lifecycle.cjs`
  - `src/test/verifyLiveOrderLifecycleMonitor.test.ts`

## Behavior Accepted

This lane accepts the following monitor behavior:

- If `QA_CUSTOMER_EMAIL`, `QA_CUSTOMER_PASSWORD`, `QA_DRIVER_EMAIL`, `QA_DRIVER_PASSWORD`, `QA_ADMIN_EMAIL`, or `QA_ADMIN_PASSWORD` are not materialized in the current shell, the live monitor can still load them from `qa-temp/qa-credentials.local.json`.
- If the env vars are present, they still take precedence, preserving the GitHub Actions path based on repository secrets.
- The monitor therefore becomes aligned with the local auth-probe workflow instead of requiring a second parallel credential-loading path.

## TDD Evidence

RED was observed before the implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Tests  1 failed | 3 passed (4)
Failure: monitor source did not contain local credential fallback contract
```

GREEN evidence after implementation:

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts
Test Files  1 passed (1)
Tests  4 passed (4)
```

The regression contract now requires:

- `const CREDENTIALS_PATH = path.join(process.cwd(), 'qa-temp', 'qa-credentials.local.json')`
- `function readLocalQaCredentials()`
- `function getQaCredential(envName, fallbackValue)`
- explicit fallback wiring for customer, driver, and admin credentials

## Fresh Local Proof

```text
npm run verify:qa-auth-probe
QA_AUTH_PROBE_ROLE_PASS role=customer
QA_AUTH_PROBE_ROLE_PASS role=driver
QA_AUTH_PROBE_ROLE_PASS role=admin
QA_AUTH_PROBE_PASS roles=customer,driver,admin
```

```text
npm run monitor:live-order-lifecycle
LIVE_ORDER_LIFECYCLE_CLEANUP_PASS status=deleted scenarios=6
LIVE_ORDER_LIFECYCLE_PASS orderId=f2b022c8-5e3e-4e97-aaa5-54825fbd8eb6 scenarios=6 phases=35
```

```text
npm run test:run -- src/test/verifyLiveOrderLifecycleMonitor.test.ts src/test/DriverAssignedLifecycle.test.tsx
Test Files  2 passed (2)
Tests  8 passed (8)
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

```text
npm run typecheck
exit 0
```

```text
npm run lint
exit 0
```

```text
npm run test:run
Test Files  90 passed (90)
Tests  546 passed | 2 skipped (548)
exit 0
```

```text
npm run build
exit 0
```

## Known Non-Blocking Output

- Full Vitest still prints the pre-existing non-fatal `PUBLIC_HTML_CONTRACT_FAIL` favicon/manifest warnings while exiting `0`.
- Build still prints the pre-existing Lightning CSS/Tailwind at-rule warnings and the large Mapbox chunk warning.

## GitHub Actions Evidence

Current lookup for this direct `main` commit returned no associated runs yet:

```text
gh run list --repo ventasdoodles/ivoy --commit 347678f --limit 10 --json databaseId,name,status,conclusion,url,createdAt,headSha
[]
```

So no CI-green or deploy-green claim is made for this commit.

## Non-Claims

- No new customer/driver runtime UI feature
- No DB/schema/RPC/Edge Function code change
- No Supabase remote apply
- No hosted browser E2E or Vercel proof for this exact commit
- No production deploy proof
- No physical mobile/GPS/payment/push/WhatsApp/real courier proof
- No global marketplace completion claim
