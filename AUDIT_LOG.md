# VSM STORE — AUDIT LOG

> Registro histórico de todas las auditorías ejecutadas. Mover aquí al actualizar AI_CONTEXT.md.
> Referencia: AI_CONTEXT.md §9

---

## Auditorías Completadas (§9.10 → §9.44)

### Node 24 GitHub Actions Migration — 15 de mayo de 2026
**Scope:** Documentation/canon reconciliation for accepted commit `f7519f757582995256c43a53982e4042bc3cf0fd` (`chore(ci): migrate github actions to node 24 runtime`). This closes the prior Node.js 20 GitHub Actions runtime residual by moving the action runtime surface to Node 24 while keeping app/build Node on Node 22 LTS where `setup-node` is configured.
**Acceptance audit verdict:** `ACCEPT WITH RESIDUAL RISK`.
**Accepted Migration Scope:**
1. **Current commit at audit time:** `f7519f757582995256c43a53982e4042bc3cf0fd`, aligned with `main` / `origin/main`.
2. **Changed files only:** `.github/workflows/deploy-pages.yml`, `.github/workflows/deploy-functions.yml`, `.github/workflows/graqle-sync.yml`, and `.github/workflows/ingest-knowledge.yml`.
3. **Action versions:** `actions/checkout@v5`, `actions/setup-node@v6`, `actions/upload-artifact@v6`, `actions/setup-python@v6`, and `supabase/setup-cli@v2`.
4. **Runtime distinction:** GitHub Actions runtime is Node 24 through updated action versions; app/build Node is Node 22 LTS where `setup-node` is configured.
5. **Cloudflare Pages posture preserved:** `deploy-pages.yml` remains manual-only via `workflow_dispatch` with no `push` trigger.
6. **Hardening preserved:** `timeout-minutes: 15`, `WRANGLER_SEND_METRICS: "false"`, and `npx --yes wrangler pages deploy`.
7. **Secret references preserved:** Cloudflare and Vite Supabase secret references remain by name only; no secret values were introduced.
**Accepted Verification Evidence:**
1. **Run ID:** `25920238570`.
2. **Run URL:** `https://github.com/ventasdoodles/vsm-store/actions/runs/25920238570`.
3. **Workflow:** `Deploy Storefront to Cloudflare Pages`.
4. **Event:** `workflow_dispatch`.
5. **Head SHA:** `f7519f757582995256c43a53982e4042bc3cf0fd`.
6. **Conclusion:** completed / success.
7. **Build step:** passed.
8. **Artifact upload step:** passed.
9. **Cloudflare Pages deploy step:** passed.
10. **GitHub check annotations:** empty; no Node 20 deprecation annotations were found through the annotations API.
**Residual Risks / Bounded Non-Claims:**
- Only `deploy-pages` has inspected successful post-migration runtime proof.
- `deploy-functions`, `graqle-sync`, and `ingest-knowledge` were diff-verified but not runtime-verified.
- Raw logs were not exhaustively inspected; this does not claim every raw log line was warning-free.
- `supabase/setup-cli@v2` is a moving major branch reference, not a pinned SHA.
- Local Supabase temp artifacts `supabase/.temp/cli-latest` and `supabase/.branches/` remain unrelated and untouched.
- This does not claim DB/Supabase work, workflow run during canonization, deploy during canonization, source/package/workflow changes, secret changes, all-workflows runtime proof, or Cloudflare custom domain alias proof.
**Outcome:** NODE.JS 20 GITHUB ACTIONS RUNTIME RESIDUAL IS CLOSED BY ACCEPTED NODE 24 ACTION MIGRATION; CANON STATUS IS ACCEPTED WITH RESIDUAL RISK.

### Cloudflare Pages Manual Deploy Recovery — 15 de mayo de 2026
**Scope:** Full recovery of the Cloudflare Pages GitHub Actions manual deploy pipeline, including workflow hardening, Cloudflare API token rotation, and successful end-to-end manual deploy via `workflow_dispatch`. This is a parallel controlled-release mechanism; it does not replace Cloudflare Pages native Git integration for production domain routing.
**Codex final verdict:** `ACCEPT WITH RESIDUAL RISK`.
**Recovery Chain:**
1. **Missing Cloudflare secrets** — repaired by setting `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` in GitHub Actions secrets.
2. **Missing Vite Supabase build env** — repaired in commit `a9e4d6e` (`chore(ci): attach vite supabase env vars to pages deploy workflow`).
3. **Wrangler deploy hang** — hardened in commit `eaee15a` (`chore(ci): harden un-interactive wrangler pages deploy`) with `timeout-minutes: 15`, `WRANGLER_SEND_METRICS: "false"`, and `npx --yes wrangler pages deploy`.
4. **Cloudflare API auth 9106** — repaired by revoking the exposed API token and creating a new restricted token (`Account → Cloudflare Pages → Edit`), securely set via `gh secret set CLOUDFLARE_API_TOKEN` without value exposure.
**Accepted Deploy Evidence:**
1. **Run ID:** `25918704188`.
2. **Run URL:** `https://github.com/ventasdoodles/vsm-store/actions/runs/25918704188`.
3. **Event:** `workflow_dispatch` (manual).
4. **Status:** completed / success.
5. **Duration:** ~1m 48s.
6. **Build step:** passed.
7. **Artifact upload step:** passed.
8. **Wrangler deploy step:** passed.
9. **Deployment URL:** `https://2e4d371a.vsm-store.pages.dev`.
10. **GitHub Actions secrets active:** `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
**Workflow Posture:**
- Manual-only via `workflow_dispatch`; no automatic `push` trigger.
- Parallel to Cloudflare Pages native Git integration (production domain routing).
- Deployment URL is a Cloudflare Pages preview deployment, not the production custom domain.
**Node.js 20 Infrastructure Residual Status:**
- This residual was closed by accepted commit `f7519f757582995256c43a53982e4042bc3cf0fd` (`chore(ci): migrate github actions to node 24 runtime`).
- Final action references are now `actions/checkout@v5`, `actions/setup-node@v6`, `actions/upload-artifact@v6`, `actions/setup-python@v6`, and `supabase/setup-cli@v2`.
- App/build Node is Node 22 LTS where `setup-node` is configured; GitHub Actions runtime is Node 24 through the updated action versions.
- Remaining residuals are recorded in the Node 24 GitHub Actions Migration entry above.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This does not claim the deployment URL `2e4d371a.vsm-store.pages.dev` serves on the production `vsm-store.pages.dev` custom domain.
- This does not claim production domain promotion was tested or verified.
- This does not claim the exposed API token was used maliciously during its exposure window.
- This does not claim DB/Supabase/RPC/migration/order mutation/admin UI work.
- Production admin observation, remote sandbox RPC smoke, and production real-order smoke remain unresolved residuals from prior lanes.
**Outcome:** CLOUDFLARE PAGES GITHUB ACTIONS MANUAL DEPLOY IS OPERATIONAL; WORKFLOW IS HARDENED AND PROVEN.

### Manual-Only Cloudflare Pages Workflow Patch - 14 de mayo de 2026
**Scope:** Documentation/canon reconciliation for pushed commit `effbbce` (`chore(ci): make cloudflare pages deploy workflow manual`). This records the release-infra workflow trigger posture only; it does not claim deploy, workflow rerun, secret repair, Cloudflare settings change, DB/Supabase work, RPC execution, order mutation, production admin UI observation, remote sandbox RPC smoke, or production real-order smoke.
**Codex final verdict:** `MANUAL_ONLY_WORKFLOW_PATCH_PUSHED`.
**Accepted Workflow Evidence:**
1. **Patch pushed** - commit `effbbce` was pushed to `origin/main`; post-push `main...origin/main` returned `0 / 0`.
2. **Workflow scope bounded** - only `.github/workflows/deploy-pages.yml` was modified.
3. **Automatic deploy signal disabled** - the automatic `push` trigger for `main` was removed.
4. **Manual control preserved** - `workflow_dispatch` remains available for future controlled/manual use if GitHub Actions Cloudflare secrets are repaired.
5. **Deploy command unchanged** - job names, build commands, Wrangler command, env var names, secret names, and project name `vsm-store` were not changed.
6. **Failure cause preserved** - the prior GitHub Actions run `25901261310` failed at `Verify Cloudflare credentials` because `CLOUDFLARE_ACCOUNT_ID` and likely `CLOUDFLARE_API_TOKEN` were missing/unavailable/empty in the runner context.
7. **Active deploy path recorded** - Cloudflare Pages native Git integration remains the active deploy path for now, based on production manifest evidence serving `726222c`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim GitHub Actions Cloudflare secrets were repaired.
- This log does not claim GitHub Actions Pages deploy is currently healthy.
- This log does not claim a workflow rerun or deploy occurred.
- This log does not claim Cloudflare dashboard/API was changed or checked.
- This log does not claim production admin UI observation completed.
- This log does not claim remote sandbox RPC smoke PASS.
- This log does not claim DB push/reset, remote SQL, remote Supabase operation, RPC call, order mutation, refunds, Mercado Pago/provider calls, paid cancellation expansion, customer cancellation UX, admin timeline UI, inventory restock, partial refunds, or migration-history repair.
**Explicit Residual Risk:**
- If GitHub Actions Pages deploy is needed later, repository secrets and token scope still need a separate readiness/repair lane.
- Production admin UI observation remains blocked pending safe production admin session.
- Remote sandbox RPC smoke remains unresolved/blocked and must not be retroactively claimed.
- Production real-order cancellation smoke remains NO-GO.
**Outcome:** CLOUDFLARE PAGES GITHUB ACTIONS DEPLOY WORKFLOW IS MANUAL-ONLY; NATIVE CLOUDFLARE PAGES GIT INTEGRATION REMAINS ACTIVE PATH.

### Admin RPC Switch Production Release Observation - 14 de mayo de 2026
**Scope:** Documentation/canon reconciliation for production release observation after commit `726222c` (`docs: canonize admin rpc switch browser smoke`). This records release/status evidence only; it does not claim production admin access, production admin UI smoke completion, RPC execution, order mutation, deploy, workflow rerun, remote Supabase operation, remote sandbox RPC smoke, production real-order smoke, refunds, provider calls, paid cancellation, customer cancellation UX, admin timeline UI, inventory restock, or partial refunds.
**Codex final verdict:** `MANIFEST_PASS_ADMIN_UI_BLOCKED_BY_AUTH`.
**Accepted Production Release Evidence:**
1. **Production manifest passed** - `https://vsm-store.pages.dev/runtime-build.json` reported `gitShortHash = 726222c` and `runtimeBuildFingerprint = v113-726222c`.
2. **Production admin route attempted** - `https://vsm-store.pages.dev/admin/orders` redirected to `https://vsm-store.pages.dev/login`.
3. **Auth blocker accepted** - no existing safe production admin session was available in the browser context; no account was created, no auth was altered, and no production data was changed.
4. **Admin UI not observed** - production admin orders page, order drawer, and cancellation UI were not observed because access stopped at login.
5. **No mutation/RPC occurred** - no `cancel_admin_unpaid_order_with_audit` RPC call, final cancellation click, order mutation, DB push/reset, remote SQL, remote Supabase operation, deploy, workflow rerun, file change, commit, or push occurred during the observation.
6. **GitHub Actions residual recorded** - `.github/workflows/deploy-pages.yml` ran for `726222c` as run `25901261310`, completed with `failure`, and failed at `Verify Cloudflare credentials`; `npm ci`, `npm run build`, artifact upload, and `wrangler pages deploy` were skipped.
7. **Release-path interpretation bounded** - production appears to serve `726222c`, likely through Cloudflare Pages native Git integration, but Cloudflare dashboard/API status was not checked.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim production admin orders UI was observed.
- This log does not claim production order drawer or cancellation UI was observed.
- This log does not claim any production RPC call or order mutation.
- This log does not claim remote sandbox RPC smoke PASS.
- This log does not claim GitHub Actions deploy-pages is healthy.
- This log does not claim deploy, workflow rerun, DB push/reset, remote SQL, remote Supabase operation, refunds, Mercado Pago/provider calls, paid cancellation expansion, customer cancellation UX, admin timeline UI, inventory restock, partial refunds, or migration-history repair.
**Explicit Residual Risk:**
- Production admin UI read-only smoke remains blocked pending safe production admin session.
- GitHub Actions Cloudflare credential failure remains a separate release-infra residual if that workflow is intended to be authoritative.
- Remote sandbox RPC smoke remains unresolved/blocked and must not be retroactively claimed.
- Production real-order cancellation smoke remains NO-GO.
**Outcome:** PRODUCTION MANIFEST PASS; PRODUCTION ADMIN UI OBSERVATION BLOCKED BY AUTH.

### Admin RPC Switch Read-Only Browser Smoke - 14 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the read-only browser/admin smoke after pushed commit `eec1d46` (`fix(admin): switch unpaid cancellation to audited rpc`) and canon commit `ed1be3e` (`docs: canonize admin unpaid cancellation rpc switch`). This records UI reachability and safety observations only; it does not claim RPC execution, order mutation, remote sandbox RPC smoke, production real-order smoke, DB push/reset, remote SQL, deploy, refunds, provider calls, paid cancellation, customer cancellation UX, admin timeline UI, inventory restock, or partial refunds.
**Codex final verdict:** `PASS`.
**Accepted Read-Only Browser Evidence:**
1. **Target confirmed** - browser smoke used local Vite `http://127.0.0.1:5174/admin/orders` with the local Supabase runtime; Vite was stopped after the smoke.
2. **Repo state preserved** - `origin/main...HEAD` remained `0 / 0`; local runtime artifacts `supabase/.temp/cli-latest` and `supabase/.branches/` were left untouched.
3. **Admin orders loaded** - the admin orders page loaded with the existing sandbox admin session and showed 9 orders.
4. **Eligible unpaid drawer rendered** - eligible local unpaid order `#A8D28D` / `6ea29f71-1c12-42f5-948e-5b4033a8d28d` opened coherently in the order detail drawer.
5. **Cancellation UI rendered read-only** - `Cancelar Pedido` opened the confirmation UI, the reason textarea rendered, and the final `Si, cancelar pedido` button was visible but was not clicked.
6. **Terminal safety observed** - terminal cancelled order `#00B501` opened without showing the cancellation button; no unsafe terminal-state cancellation affordance was observed.
7. **Network/runtime observation** - network capture recorded `0` requests to `cancel_admin_unpaid_order_with_audit`; non-blocking local browser noise was limited to an external `noise.svg` 404 and synthetic-session 403 resource errors, with no UI crash.
8. **DB no-mutation confirmation** - local DB read after the smoke confirmed order `6ea29f71-1c12-42f5-948e-5b4033a8d28d` remained `status = processing`, `payment_status = pending`, and its `order_admin_events` count remained `0`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim any RPC call was made.
- This log does not claim any order was mutated.
- This log does not claim browser cancellation execution or final confirmation.
- This log does not claim remote sandbox RPC smoke PASS; prior remote sandbox attempts remain blocked before command execution by the safety filter.
- This log does not claim production real-order cancellation smoke, DB push/reset, remote SQL, deploy, remote Supabase operation, refunds, Mercado Pago/provider calls, paid cancellation expansion, customer cancellation UX, admin timeline UI, inventory restock, partial refunds, or migration-history repair.
**Explicit Residual Risk:**
- Remote sandbox RPC smoke remains unresolved/blocked and must not be retroactively claimed.
- Production real-order cancellation smoke remains NO-GO.
- Any future executable cancellation proof must use explicitly authorized disposable/sandbox data only.
- Deploy/release decision remains separate if required by the hosting workflow.
**Outcome:** ADMIN RPC SWITCH READ-ONLY BROWSER SMOKE PASS.

### Admin Unpaid Cancellation RPC Switch - 14 de mayo de 2026
**Scope:** Documentation/canon reconciliation for pushed commit `eec1d46` (`fix(admin): switch unpaid cancellation to audited rpc`). This records the bounded service/frontend path switch only; it does not claim remote sandbox RPC smoke, browser cancellation smoke, production real-order smoke, deploy, DB push/reset, remote SQL, order mutation during implementation, refunds, provider calls, paid cancellation, customer cancellation UX, admin timeline UI, inventory restock, or partial refunds.
**Codex final verdict:** `PASS`.
**Accepted Implementation / Audit Sequence:**
1. **Push accepted** - commit `eec1d46` was pushed to `origin/main`; post-push `main...origin/main` returned `0 / 0`.
2. **Source scope confirmed** - accepted implementation changed exactly four files: `src/services/admin/admin-orders.service.ts`, `src/hooks/admin/useAdminOrders.ts`, `src/components/admin/orders/OrderDetailDrawer.tsx`, and `src/services/admin/__tests__/admin-orders.service.test.ts`.
3. **Service contract updated** - `cancelAdminOrder` now accepts only `(orderId: string, reason: string)` and returns `Promise<{ id: string }>`; `currentNotes` was removed from the service, hook, and drawer cancellation path.
4. **RPC switch accepted** - the service now calls `supabase.rpc('cancel_admin_unpaid_order_with_audit', { p_order_id: orderId, p_reason: trimmedReason })`.
5. **Old client mutation path removed** - `cancelAdminOrder` no longer fetches the order before cancellation, no longer updates `orders` directly, no longer reads or writes `tracking_notes` client-side, and does not insert directly into `order_admin_events`.
6. **Existing UI behavior preserved** - local short-reason validation remains, RPC errors propagate through the existing mutation error path/admin notification surface, and existing cache invalidations remain for `['admin', 'orders']`, `['admin', 'stats']`, and `['admin', 'recent-orders']`.
7. **Validation accepted** - `npm run typecheck`, `npx vitest run src/services/admin/__tests__/admin-orders.service.test.ts`, and targeted ESLint for the touched source/test files passed before commit.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim remote sandbox RPC smoke PASS; prior remote sandbox attempts were blocked before command execution by the safety filter.
- This log does not claim any RPC call was made during implementation, push, or canonization.
- This log does not claim any order was mutated during implementation, push, or canonization.
- This log does not claim browser cancellation smoke, production real-order smoke, deploy, DB push/reset, remote SQL, or remote Supabase operation during the switch.
- This log does not claim refunds, Mercado Pago/provider calls, paid cancellation expansion, customer cancellation UX, admin timeline UI, inventory restock, partial refunds, migration-history repair, or migration-history reconciliation.
**Explicit Residual Risk:**
- Remote sandbox RPC smoke remains unresolved/blocked and must not be retroactively claimed.
- Browser/admin UX smoke may be considered next only if it avoids real order mutation or uses a separately authorized disposable sandbox/admin order path.
- Production real-order cancellation smoke remains NO-GO.
- Deploy/release decision remains separate if required by the hosting workflow.
**Outcome:** ADMIN UNPAID CANCELLATION RPC SWITCH ACCEPTED AND PUSHED.

### Remote Manual SQL Apply for Unpaid Cancellation RPC - 14 de mayo de 2026
**Scope:** Documentation/canon reconciliation for controlled remote manual SQL apply of the unpaid cancellation RPC migrations to project `cvvlorbiwtuhkxolhfie` / `Tienda VSM`. This records schema/function/grant deployment only; it does not claim frontend integration, remote RPC smoke, production real-order smoke, order mutation, refund execution, provider calls, customer cancellation UX, admin timeline UI, or production cancellation readiness.
**Codex final verdict:** `PASS`.
**Accepted Remote Apply Evidence:**
1. **Remote target confirmed** - controlled execution targeted Supabase project `cvvlorbiwtuhkxolhfie` / `Tienda VSM`.
2. **Pre-execution checks passed** - before apply, `public.order_admin_events`, `public.cancel_admin_unpaid_order_with_audit(uuid,text)`, `order_admin_events_*` indexes/policies, and `order_admin_events_idempotency_key_uidx` were absent; dependencies existed: `public.orders`, `public.admin_users`, required `orders` columns, `auth.uid()`, `auth.jwt()`, and roles `anon`, `authenticated`, `service_role`.
3. **Manual SQL path accepted** - normal CLI migration apply remains NO-GO because local/remote migration histories diverge. The accepted remote path used one BOM-free temporary SQL bundle outside the repo, with first bytes `42 45 47` and `BOM present: False`.
4. **Exact SQL order executed** - the bundle executed only `supabase/migrations/20260513000001_order_admin_events.sql`, then `supabase/migrations/20260513000002_cancel_admin_unpaid_order_with_audit_rpc.sql`, then `supabase/migrations/20260513000003_restrict_cancel_admin_unpaid_order_rpc_grants.sql`, wrapped in `BEGIN;` / `COMMIT;`.
5. **Execution method accepted** - execution used `npx supabase db query --linked --file <tempPath> --output json`; exit code was `0` and no rows were returned.
6. **Remote object validation passed** - after apply, `public.order_admin_events` exists and `public.cancel_admin_unpaid_order_with_audit(uuid,text)` exists.
7. **Function posture passed** - the function is `SECURITY DEFINER`, owner is `postgres`, and final ACL is `{postgres=X/postgres,authenticated=X/postgres}` with `authenticated_execute=true`, `anon_execute=false`, and `service_role_execute=false`.
8. **Audit table posture passed** - RLS is enabled; admin SELECT and INSERT policies exist; no UPDATE or DELETE policies exist; required indexes exist: `order_admin_events_pkey`, `order_admin_events_order_created_idx`, `order_admin_events_type_created_idx`, `order_admin_events_actor_created_idx`, `order_admin_events_created_idx`, and `order_admin_events_idempotency_key_uidx`; the idempotency index is unique partial.
9. **Migration history intentionally untouched** - `supabase_migrations.schema_migrations` rows remain `0` for `20260513000001`, `20260513000002`, and `20260513000003`; no migration-history insert or repair was performed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim `db push`, `db reset`, deploy, or migration repair.
- This log does not claim `cancelAdminOrder` was switched to the RPC.
- This log does not claim frontend/runtime integration.
- This log does not claim remote RPC smoke, remote sandbox order mutation, or production real-order smoke.
- This log does not claim any order was mutated or the RPC was called remotely.
- This log does not claim paid cancellation, customer cancellation UX, admin timeline UI, refunds, Mercado Pago/provider calls, inventory restock, or partial refunds.
**Explicit Residual Risk:**
- Remote/local migration history remains divergent by design; future normal CLI migration workflows still require a separate migration-history reconciliation lane.
- Remote sandbox RPC smoke may be considered next only as a separate, explicitly authorized step using disposable remote data.
- Frontend/runtime switch remains blocked until remote smoke/readiness and an error UX/switch plan are separately accepted.
**Outcome:** REMOTE MANUAL SQL APPLY PASS.

### Audited Unpaid Cancellation RPC Local Sandbox Smoke - 13 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the local-only sandbox smoke of `public.cancel_admin_unpaid_order_with_audit(p_order_id uuid, p_reason text)`. This records local validation evidence only; it does not claim remote Supabase deployment, production readiness, frontend integration, real order mutation, refunds, provider calls, customer cancellation UX, or paid cancellation.
**Codex final verdict:** `PASS`.
**Accepted Local Evidence:**
1. **Local target confirmed** - the smoke used only `C:\dev\vsm-store-fresh` and local DB `postgresql://postgres:postgres@127.0.0.1:54322/postgres`; no `supabase.co` target was used and repo sync remained `0 / 0`.
2. **Sandbox identities created** - local sandbox admin `00000000-0000-4000-8000-00000000a501` / `sandbox-admin-rpc-smoke-20260513@example.local` with role `admin`, and local sandbox non-admin `00000000-0000-4000-8000-00000000a502` / `sandbox-nonadmin-rpc-smoke-20260513@example.local`.
3. **Sandbox order created** - local disposable unpaid order `00000000-0000-4000-8000-00000000b501`, `SANDBOX-RPC-SMOKE-20260513-0001`, started as `status = pending`, `payment_status = pending`, `payment_method = cash`, with a prior `tracking_notes` marker.
4. **RPC success validated** - calling `public.cancel_admin_unpaid_order_with_audit` as the sandbox admin with reason `SANDBOX RPC SMOKE - audited unpaid cancellation test` returned the sandbox order id and changed only that sandbox order to `status = cancelled`.
5. **Order invariants validated** - `payment_status` stayed `pending`, `payment_method` stayed `cash`, provider fields stayed null, and `tracking_notes` preserved the prior marker plus appended cancellation note.
6. **Audit event validated** - exactly one `order_admin_events` row exists for the sandbox order with `event_type = admin_unpaid_order_cancelled`, `source = admin_rpc`, `visibility = internal`, `status_before = pending`, `status_after = cancelled`, `payment_status_before = pending`, `payment_status_after = pending`, `payment_method = cash`, reason matching the sandbox reason, `customer_note = null`, provider/refund fields null, idempotency key `admin_unpaid_order_cancelled:00000000-0000-4000-8000-00000000b501`, and metadata containing `rpc_version`, `tracking_notes_source = latest_db_value`, and `had_tracking_notes_before = true`.
7. **Retry/idempotency validated** - retrying the same RPC on the already-cancelled sandbox order failed safely with `Order is no longer eligible for unpaid cancellation`, and event count remained exactly 1.
8. **Negative security validated** - anon execution failed with permission denied; authenticated non-admin execution failed with `Admin privileges required`; event count remained 1.
9. **Traceability preserved** - sandbox rows were intentionally left in the local DB for auditability.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim any real/non-sandbox order was mutated.
- This log does not claim remote Supabase, `db push`, `db reset`, deploy, or production readiness.
- This log does not claim `cancelAdminOrder` was switched to the RPC.
- This log does not claim frontend/runtime integration.
- This log does not claim paid cancellation, customer cancellation UX, admin timeline UI, refunds, Mercado Pago/provider calls, inventory restock, or partial refunds.
**Explicit Residual Risk:**
- Remote deployment remains blocked until separately authorized.
- Frontend/runtime switch remains blocked until remote migration deployment is completed and accepted.
**Outcome:** LOCAL SANDBOX RPC SMOKE PASS.

### Audited Unpaid Cancellation RPC Grant Patch - 13 de mayo de 2026
**Scope:** Documentation/canon reconciliation for accepted pushed commit `c5e2da2` (`fix(db): restrict unpaid cancellation rpc grants`). This records the grant-posture correction for `public.cancel_admin_unpaid_order_with_audit(uuid, text)` only; it does not claim frontend integration, remote Supabase deployment, order mutation, RPC smoke against orders, refund execution, provider calls, customer cancellation UX, or production readiness.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Baseline preserved** - the RPC substrate remains commit `489c006` (`feat(db): add audited unpaid cancellation rpc substrate`) and its canon remains commit `b237927` (`docs: canonize audited unpaid cancellation rpc substrate`).
2. **Local validation defect found** - after local migration apply, the RPC table/function/RLS/index posture was mostly correct, but the function `EXECUTE` ACL was broader than accepted design: `anon`, `authenticated`, and `service_role` all had execute access.
3. **Grant correction accepted** - commit `c5e2da2` adds migration `supabase/migrations/20260513000003_restrict_cancel_admin_unpaid_order_rpc_grants.sql`.
4. **Exact grant posture accepted** - the corrective migration revokes all access on `public.cancel_admin_unpaid_order_with_audit(uuid, text)` from `PUBLIC`, `anon`, and `service_role`, then grants `EXECUTE` only to `authenticated`; `postgres` remains owner.
5. **Local validation accepted** - local validation after the patch confirmed final ACL `{postgres=X/postgres,authenticated=X/postgres}`, `anon_execute=false`, `authenticated_execute=true`, and `service_role_execute=false`.
6. **Regression checks accepted** - the function still exists, remains `SECURITY DEFINER`, and keeps signature `p_order_id uuid, p_reason text`; `public.order_admin_events` RLS remains enabled; admin SELECT/INSERT policies remain for `authenticated`; no UPDATE/DELETE policies exist; and the unique partial idempotency index remains present.
7. **Push accepted** - commit `c5e2da2` was pushed to `origin/main`; post-push `main...origin/main` returned `0 / 0`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim remote Supabase migration deployment, `db push`, `db reset`, or deploy.
- This log does not claim `cancelAdminOrder` was switched to the RPC.
- This log does not claim frontend/runtime integration.
- This log does not claim the RPC was called against any order or that any order was mutated.
- This log does not claim admin timeline UI, customer cancellation UX, paid cancellation, manual refunds, provider/Mercado Pago calls, inventory restock, partial refunds, or historical backfill.
**Explicit Residual Risk:**
- Local sandbox RPC smoke remains a separate future authorization using disposable/sandbox order scope.
- Remote deployment remains blocked until local sandbox smoke and deployment readiness are separately accepted.
- Frontend/runtime switch remains blocked until the migration deployment path is completed and accepted.
**Outcome:** ACCEPTED AND PUSHED.

### Audited Unpaid Cancellation RPC Substrate - 13 de mayo de 2026
**Scope:** Documentation/canon reconciliation for accepted pushed commit `489c006` (`feat(db): add audited unpaid cancellation rpc substrate`). This records the bounded database RPC substrate only; it does not claim frontend integration, remote Supabase deployment, order mutation, refund execution, provider calls, customer cancellation UX, or production readiness.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly one file: `supabase/migrations/20260513000002_cancel_admin_unpaid_order_with_audit_rpc.sql`.
2. **RPC substrate accepted** - the migration defines `public.cancel_admin_unpaid_order_with_audit(p_order_id uuid, p_reason text)` as a `SECURITY DEFINER` PL/pgSQL function.
3. **Identity and admin guard accepted** - the RPC requires `auth.uid()`, verifies the caller exists in `public.admin_users`, records `actor_user_id`, `actor_role`, and best-effort JWT email as `actor_label`, and grants execution only to `authenticated` after revoking from `PUBLIC`.
4. **Eligibility and lock accepted** - the function locks the target order with `FOR UPDATE`, permits only `pending`, `confirmed`, or `processing`, and blocks `payment_status = paid`.
5. **Atomic cancellation/audit behavior accepted** - inside one function transaction, the RPC computes `tracking_notes` from the latest locked DB row, updates `orders.status` to `cancelled`, preserves `payment_status`, updates `updated_at`, and inserts exactly one `order_admin_events` row.
6. **Audit payload accepted** - the event row uses `event_type = admin_unpaid_order_cancelled`, `source = admin_rpc`, `visibility = internal`, before/after status and payment snapshots, `payment_method`, trimmed reason, internal note, null customer/provider/refund fields, deterministic `idempotency_key = admin_unpaid_order_cancelled:{order_id}`, and bounded metadata for RPC version plus latest-DB tracking-notes source.
7. **Security posture accepted** - schema-qualified table references, no dynamic SQL, reason handled as data, `SET search_path = public, auth`, and no new `order_admin_events` UPDATE/DELETE path.
8. **Push accepted** - commit `489c006` was pushed to `origin/main`; post-push `main...origin/main` returned `0 / 0`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim the migration was applied locally or remotely.
- This log does not claim `cancelAdminOrder` was switched to the RPC.
- This log does not claim admin timeline UI, customer cancellation UX, paid cancellation, manual refunds, provider/Mercado Pago calls, inventory restock, partial refunds, or historical backfill.
- This log does not claim order data was mutated during implementation or canonization.
- This log does not claim remote Supabase `db push`, `db reset`, or deploy.
**Explicit Residual Risk:**
- Runtime/frontend integration remains blocked until the migration deployment/local apply path is explicitly authorized.
- The RPC is a committed substrate; it is not active product behavior until the DB is migrated and the frontend/service switch is separately accepted.
**Outcome:** ACCEPTED AND PUSHED.

### Order Admin Events Audit Substrate Phase 1 - 13 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted pushed commit `b320150` (`feat(admin): add order admin event audit substrate`). This records the bounded schema/types substrate only; it does not claim behavior integration, order mutation, remote Supabase deployment, refund execution, provider calls, or customer cancellation UX.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly two files: `supabase/migrations/20260513000001_order_admin_events.sql` and `src/types/order-admin-events.ts`.
2. **Schema substrate accepted** - migration `20260513000001_order_admin_events.sql` defines `public.order_admin_events` as a structured internal admin audit trail table for order lifecycle events before future paid cancellation/refund work.
3. **Audit fields accepted** - the table captures `order_id`, actor fields, `event_type`, `source`, `visibility`, before/after order status and payment status snapshots, `payment_method`, reason/internal/customer note separation, nullable provider/refund marker fields, non-negative `refund_amount`, `refund_currency`, optional `idempotency_key`, object-only `metadata`, and `created_at`.
4. **Append-only RLS accepted** - RLS is enabled with authenticated admin `SELECT` and authenticated admin `INSERT`; inserts require `actor_user_id = auth.uid()`. No `UPDATE` or `DELETE` policies are created, so corrections must be represented by future events.
5. **Indexes accepted** - indexes cover `(order_id, created_at desc)`, `(event_type, created_at desc)`, `(actor_user_id, created_at desc)`, `(created_at desc)`, plus a unique partial index on `idempotency_key where idempotency_key is not null`.
6. **Type contract accepted** - `src/types/order-admin-events.ts` mirrors the SQL event/source/visibility constants and exposes `OrderAdminEventType`, `OrderAdminEventSource`, `OrderAdminEventVisibility`, `OrderAdminEventRecord`, and `CreateOrderAdminEventInput`.
7. **Validation accepted** - `npm run typecheck` passed, targeted ESLint for the new TypeScript contract passed, and local `npx supabase db lint --local --schema public` reported only unrelated/preexisting findings in `public.increment_coupon_uses` and `public.process_referral_reversal`.
8. **Push accepted** - commit `b320150` was pushed to `origin/main`; post-push `main...origin/main` returned `0 / 0`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim `cancelAdminOrder` was refactored.
- This log does not claim an admin drawer audit timeline exists.
- This log does not claim current `tracking_notes` behavior changed.
- This log does not claim paid cancellation workflow, manual refund workflow, customer cancellation request UX, inventory restock, partial refunds, or historical `tracking_notes` backfill.
- This log does not claim Mercado Pago/provider refund execution or provider API calls.
- This log does not claim remote Supabase migration deployment, `db push`, `db reset`, or deploy.
**Explicit Residual Risk:**
- Low and accepted for Phase 1 substrate.
- The migration is committed and pushed, but remote Supabase deployment remains separately unauthorized.
- No runtime service writes to `order_admin_events` yet; future order mutation plus audit insert should use a transactional boundary.
**Outcome:** ACCEPTED AND PUSHED.

### Homepage Desktop Width Fix — 13 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Homepage Desktop Width Fix in commit `79cb4b6` (`style(layout): expand global container to 1440px for large desktop balance`). This records the bounded CSS max-width expansion only; it does not claim broader layout redesigns, responsive breakpoint changes, or production deployment.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly one file: `src/index.css`. No React, page, component, or admin files were modified.
2. **Implementation accepted** - `.container-vsm` max-width expanded from `max-w-[1187px]` to `max-w-[1440px]` to improve desktop homepage balance under the full-width MegaHero.
3. **Non-impacted behavior accepted** - Mobile/tablet behavior remains unaffected, and text-heavy pages remain constrained by their inner max-width utilities.
4. **Validation accepted** - `git status -sb` and `git diff --cached` confirmed only `src/index.css` was staged and modified.
5. **Local push accepted** - the commit `79cb4b6` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a full storefront redesign.
- This log does not claim changes to mobile or tablet responsive breakpoints.
- This log does not claim changes to other CSS classes or Tailwind configuration.
- This log does not claim production/staging deployment or remote Supabase mutations.
**Explicit Residual Risk:**
- None. This is a purely CSS layout fix for large desktop screens.
**Outcome:** ACCEPTED AND PUSHED.

### Customer Cancelled-State Notes Filter — 12 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Customer Cancelled-State Notes Filter frontend fix in commit `6e7c073` (`fix(customer): mask admin tracking notes on cancelled orders`). This records the bounded customer presentation masking only; it does not claim refund execution, customer cancellation request UX, backend/schema changes, or production deployment.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly one file: `src/pages/OrderDetail.tsx`. No admin files, services, migrations, env, or package changes occurred.
2. **Implementation accepted** - the React component conditionally renders a safe generic message ("Este pedido ha sido cancelado. Si tienes dudas, contáctanos para revisar tu caso.") in place of the raw `order.tracking_notes` when the order is cancelled, preventing internal audit trail leakage.
3. **Non-cancelled behavior accepted** - active/shipped/delivered orders continue to render their legitimate tracking notes normally.
4. **Validation accepted** - `npm run typecheck` passed, `npm run lint` passed, `npm run test -- OrderDetail` passed 7/7, and a local browser smoke test confirmed an unpaid cancelled order (#D4532A) successfully hid the raw admin note and displayed the generic copy, with no DB mutation or provider calls.
5. **Local push accepted** - the commit `6e7c073` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim refund UI exists or that refunds are executed.
- This log does not claim a customer cancellation request UX exists.
- This log does not claim Mercado Pago outbound refund execution or provider/payment readiness.
- This log does not claim backend/schema changes or that an admin audit trail schema exists.
- This log does not claim DHL/provider work or notification/email/WhatsApp readiness.
- This log does not claim inventory restock or partial refund support.
- This log does not claim production/staging deployment or remote Supabase mutations.
- This log does not claim all cancellation/refund lifecycle cases are solved.
**Explicit Residual Risk:**
- None. This is a purely presentation-layer conditional rendering fix.
**Outcome:**
`Customer Cancelled-State Notes Filter` is canonized as accepted and pushed. The customer leakage defect is closed. Admin Unpaid Cancellation UX and customer cancelled-state presentation are now locally coherent.

### Admin Unpaid Cancellation UX — 12 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Admin Unpaid Cancellation UX implementation in commit `b6bb989` (`feat(admin): implement safe unpaid order cancellation ux`). This records the bounded admin/manual cancellation UI and service guard only; it does not claim refund execution, Mercado Pago outbound integrations, customer-facing cancellation UX, or production deployment.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly 5 files: `src/services/admin/admin-orders.service.ts`, `src/hooks/admin/useAdminOrders.ts`, `src/components/admin/orders/OrderDetailDrawer.tsx`, `src/pages/admin/AdminOrders.tsx`, and `src/services/admin/index.ts`. No docs, migrations, env, or package changes occurred.
2. **Service guard accepted** - `cancelAdminOrder` uses a fetch → validate → update pattern. It blocks paid orders and only allows updates if the current status is `pending`, `confirmed`, or `processing`, using an `.in()` array as a concurrency guard. Payment status is not mutated.
3. **Notes append behavior accepted** - the service safely appends the cancellation reason to `tracking_notes` with a timestamp, preserving any prior notes.
4. **UI Danger Zone accepted** - `OrderDetailDrawer` includes a visually distinct Danger Zone, hidden for terminal states (`shipped`, `delivered`, `cancelled`, `refunded`), and disabled for paid orders with explanatory copy.
5. **Confirmation modal accepted** - requires a mandatory cancellation reason before execution.
6. **Dropdown filtering accepted** - the `cancelled` status is removed from the generic status dropdown to prevent accidental status changes.
7. **Hook/cache validation accepted** - `cancelOrderMutation` correctly invalidates the `orders`, `stats`, and `recent-orders` query caches upon success.
8. **Validation accepted** - `npm run typecheck` passed, `npm run lint` passed with 0 errors (ignoring 352 pre-existing warnings), and a local browser smoke test confirmed an unpaid order (#D4532A) transitioned safely to `cancelled` with notes appended and no provider calls made.
9. **Local push accepted** - the commit `b6bb989` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim refund UI exists or that refunds are executed.
- This log does not claim a customer cancellation request UX exists.
- This log does not claim Mercado Pago outbound refund execution or provider/payment readiness.
- This log does not claim DHL/provider work or notification/email/WhatsApp readiness.
- This log does not claim inventory restock or partial refund support.
- This log does not claim production/staging deployment or remote Supabase mutations.
- This log does not claim all cancellation/refund lifecycle cases are solved.
**Explicit Residual Risk:**
- Low and accepted.
- Fetch → validate → update has a small race window on `payment_status`, accepted for Phase 1.
- Paid/shipped/delivered protection is sufficient for the current bounded local/admin phase.
**Outcome:**
`Admin Unpaid Cancellation UX` is canonized as accepted and pushed. Admins can now safely cancel eligible unpaid local orders through a guarded Danger Zone UI, leaving a permanent audit trail, while external payment integrations and customer UI remain explicitly untouched.

### Reverse Fulfillment Lifecycle Data Integrity Patch - 12 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted reverse fulfillment lifecycle data integrity patch in commit `d66509a4058addba900cdc037e48e1b085ecc2ea` (`fix(db): secure reverse lifecycle data integrity triggers`). This records the database-level integrity layer only; it does not reopen the storefront UI, admin UI, Mercado Pago outbound execution, or inventory restocking.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed exactly one file: `supabase/migrations/20260512000001_reverse_lifecycle_integrity.sql`.
2. **CRM Recalculation logic accepted** - `trg_update_customer_stats` now dynamically recalculates `total_orders`, `total_spent`, and `customer_tier` solely from orders in the `delivered` status, ensuring metrics are not artificially inflated after an order is cancelled.
3. **Loyalty Reversal logic accepted** - new function `process_referral_reversal` and trigger `trg_on_order_refund_reversal` were added to automatically insert negative "expired" ledger rows (`transaction_type = 'expired'`, prefixed with `[Reverso]`) for loyalty points linked to refunded or cancelled orders.
4. **Idempotency checks accepted** - `EXISTS` guards in the reversal logic prevent duplicate ledger entries upon repeated updates.
5. **Validation accepted** - a local validation script (`test_reverse_integrity.cjs`) confirmed the integrity of CRM stats recalculation, point reversal, and idempotency in a sandboxed test environment.
6. **No broader surface expansion** - no UI changes, API endpoints, payment provider integrations, or inventory management features were altered.
7. **Local push accepted** - the commit `d66509a` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim production deployment; `npx supabase db push` to the remote environment is pending.
- This log does not claim implementation of Admin UI components for cancelling orders.
- This log does not claim integration with Mercado Pago for outbound refunds.
- This log does not claim automated inventory restocking logic.
**Explicit Residual Risk:**
- Low and accepted.
- `referrals` table records remain `completed` even after points are revoked (minor residual risk).
- Partial refunds are not supported; reversals operate on an "all-or-nothing" basis per order.
**Outcome:**
`Reverse Fulfillment Lifecycle Data Integrity Patch` is canonized as accepted and pushed to the repository. The project now includes a bulletproof database integrity layer for CRM and loyalty metrics upon order cancellation or refund, preparing the system for future UI-based cancellation capabilities.

### Green Validation Recovery Package - 9 de mayo de 2026
**Scope:** Documentation/canon reconciliation for accepted pushed commit `e6d240fa51b97f2d75ba7611a794d3afc16cb0ff` (`fix: restore green validation after recovery cleanup`). This records the bounded Windows/Codex recovery validation package only; it does not reopen Product Search, Cesarin runtime, loyalty, OrderDetail, React Query, storefront implementation, Supabase, Docker, WSL, migrations, deploy, docs beyond canon, `.env`, or helper cleanup fronts.
**Codex final verdict:** `ACCEPT WITH RESIDUAL RISK`.
**Accepted Implementation / Audit Sequence:**
1. **Repo recovery package accepted** - branch `main` was aligned with `origin/main` before the package, the accepted 8-file package was committed as `e6d240f`, and the commit was pushed to `origin/main`.
2. **Accepted file scope confirmed** - changed files were only `src/lib/domain/__tests__/loyalty.test.ts`, `src/lib/product-search-capsule.ts`, `src/lib/react-query.ts`, `src/pages/OrderDetail.tsx`, `src/pages/__tests__/OrderDetail.test.tsx`, `src/services/__tests__/concierge.service.stage4.test.ts`, `src/services/admin/__tests__/admin-orders.service.test.ts`, and `src/services/concierge.service.ts`.
3. **Loyalty test alignment accepted** - stale expectations now match the current source contract: `gold` threshold remains `20000`, and `TierProgress.progress` remains a `0..100` percent scale. No loyalty business-logic source changed.
4. **Product Search bounded recovery accepted** - one unreachable legacy `if(false && ...)` out-of-stock branch was removed, and grounded ambiguous `TOKEN_RECOVERY` candidates no longer downgrade to `NO_MATCH` only because their source is `TOKEN_RECOVERY`.
5. **React Query copy fix accepted** - Spanish mojibake in user-facing error strings was corrected for `conexion` / `sesion` cases without changing query behavior.
6. **OrderDetail dead JSX cleanup accepted** - one unreachable literal-false JSX block was removed; active `paymentView` behavior remained untouched.
7. **Test typing/lint micro-fixes accepted** - OrderDetail and admin-orders tests gained narrow TypeScript guards, and the Concierge Stage4 test removed unnecessary string escapes without skipping or weakening tests.
8. **Concierge bounded shaping fix accepted** - redundant `Boolean(...)` wrappers were removed, and a narrow Product Search message-seed guard prevents hidden weak keep-exploring guidance from leaking into `response.message` when `next_step_view` is suppressed and the conversational prefix carries the useful move.
9. **Validation accepted** - `npm run typecheck` passed; `npm run lint` passed with `0` errors and `352` warnings preserved; `npm run test:run --silent` passed with `87` files and `620` tests; focused React Query, loyalty, Product Search capsule, AI capsule orchestrator, and Concierge Stage4 suites passed.
10. **Push accepted** - post-push `main...origin/main` returned `0 / 0`; tracked working tree was clean; 36 preserved helper/backup/snippet paths remained untracked and untouched.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Docker/WSL/Supabase recovery.
- This log does not claim browser smoke, deploy, migrations, remote Supabase work, or `.env` work.
- This log does not claim untracked helper cleanup; local helper/backup/snippet paths remain preserved.
- This log does not claim full Product Search redesign, broad Cesarin redesign, loyalty business-logic source change, or any source/test work beyond the accepted 8-file package.
- This log does not claim warning cleanup; `352` lint warnings remain intentionally preserved.
**Explicit Residual Risk:**
- Low to medium and accepted.
- Product Search and Concierge touched sensitive runtime paths, but focused and full unit validation passed.
- Browser, Docker, WSL, Supabase, migrations, and deploy were intentionally out of scope.
**Outcome:**
`Green Validation Recovery Package` is canonized as accepted and pushed. The repository validation baseline is green after the bounded recovery package, with typecheck, lint, full unit tests, and relevant focused tests passing; tracked source/test state is clean after push, while local untracked helpers/backups/snippets remain untouched.

### Local Stack Recovery + Gemini Override - 9 de mayo de 2026
**Scope:** Local development recovery canon only. WSL/VMP admin workflow, Docker Desktop, local Supabase core, local Vite frontend, local admin auth, local Edge Function smoke, and the local Gemini model override path. It does not reopen remote Supabase, migrations, deploy, db push/reset, or .env work.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Local stack recovery validated** - WSL/VMP admin workflow completed, Docker Desktop is running, and `docker run --rm hello-world` passed; local Supabase core is running on `http://127.0.0.1:54321`, `http://127.0.0.1:54323`, and `http://127.0.0.1:54324`.
2. **Local app/admin validated** - local Vite storefront smoke passed against local Supabase; `admin@vsm.local` exists only in local auth; `public.admin_users` has the local row; `/admin` and `/admin/cesarin` rendered locally; remote Supabase hits remained `0`.
3. **Edge/Gemini validated** - local Edge Functions served from `$env:TEMP\vsm-store-local-edge.env` without editing `.env`; Gemini key rotation in Windows user env and the local model override worked around `gemini-2.5-pro` 429s; authenticated Cesarin UI smoke returned a useful response; customer-intelligence terminal smoke returned HTTP `200`.
4. **Commit recorded** - `80abb1e` is `feat(edge): allow local Gemini model overrides with production-safe defaults in customer-intelligence`; production defaults stayed `AUXILIARY_MODEL=gemini-2.5-flash`, `CONCIERGE_ANALYST_MODEL=gemini-2.5-pro`, and `CONCIERGE_SOMMELIER_MODEL=gemini-2.5-pro`.
**Residual Truth Safeguards:** No deploy, no remote Supabase mutation, no db push, no db reset, no migrations, no checkout/payment smoke, no broad AI quality matrix, no production model change, no .env change, and no cleanup of untracked reports/helpers/snippets/backups.
**Explicit Residual Risk:** Low and accepted. Local vector/restart noise is non-blocking.
**Outcome:** Local stack recovery and the Gemini override path are canonized as accepted.

### Storefront Grid Discovery Context Coherence Pass — 3 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Storefront Grid Discovery Context Coherence Pass in commit `e33aa5645862d086236cc81acf664e32213377ad` (`fix: storefront grid empty states and out-of-stock CTA`). This records Storefront Product Discovery and Merchandising Coherence slice 17 only; it does not reopen Slices 1-16, services, routes, sorting, filtering algorithms, backend, DB/Supabase, AI/Césarín, checkout/provider/payment, admin, Product Search, or helper artifacts.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** — accepted implementation changed only `src/components/products/ProductGrid.tsx`, `src/components/products/ProductCard.tsx`, `src/pages/SearchResults.tsx`, `src/pages/CategoryPage.tsx`, and `src/pages/SectionPage.tsx`. No other file was touched.
2. **Contextual empty-state props accepted** — `ProductGrid` was extended with optional `emptyStateTitle?: string` and `emptyStateSubtext?: string` props; when provided, those values override the generic empty-state heading and body copy rendered by the existing empty-state block.
3. **SearchResults contextual copy accepted** — `SearchResults.tsx` now passes `emptyStateTitle="Sin resultados"` and `emptyStateSubtext="Intenta con otros términos de búsqueda"` into `ProductGrid`.
4. **CategoryPage contextual copy accepted** — `CategoryPage.tsx` now passes `emptyStateSubtext` with a category-recovery message; existing Slice 15 `onClearFilter` gating logic remains strictly untouched.
5. **SectionPage contextual copy accepted** — `SectionPage.tsx` now passes `emptyStateSubtext` with a section-recovery message; existing Slice 11 descendant-category filter logic remains strictly untouched.
6. **Out-of-stock CTA icon accepted** — `ProductCard.tsx` replaced the bare `"X"` text node in the out-of-stock button overlay with the `PackageX` icon from `lucide-react`; this matches the established icon pattern already present in `QuickViewModal.tsx`.
7. **Icon library coherence confirmed** — `PackageX` is imported from `lucide-react`, which is already a project dependency; no new dependency was introduced.
8. **Slice 15 preservation confirmed** — `onClearFilter` gating logic in `CategoryPage.tsx` was inspected and confirmed unchanged by the Slice 17 diff; clear-filter recovery behavior remains intact.
9. **Slice 11 preservation confirmed** — `activeCategoryIds` descendant-filter logic in `SectionPage.tsx` was inspected and confirmed unchanged by the Slice 17 diff; section-filter behavior remains intact.
10. **No broader surface expansion** — no service, query, route, sorting, filtering algorithm, backend, DB/Supabase, AI/Césarín, checkout/provider/payment, admin, Product Search, or helper-artifact behavior changed.
11. **Static validation accepted** — ESLint passed on touched files; TypeScript typecheck passed with no new errors attributable to this slice.
12. **Browser QA accepted** — Playwright QA confirmed contextual empty-state messaging visible on `/buscar?q=zzz`, `/vape` empty state, and `/420` empty state routes. DOM inspection confirmed `ProductGrid` empty-state and out-of-stock `PackageX` icon render in the component tree.
13. **Push accepted** — commit `e33aa5645862d086236cc81acf664e32213377ad` was pushed to `origin/main`; post-push `main...origin/main` confirmed 0 ahead / 0 behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim browser screenshot capture of a live out-of-stock product card with `PackageX` icon rendered (no OOS product existed in the local dataset at QA time).
- This log does not claim sorting, filtering, or service changes.
- This log does not claim DB/Supabase/deploy/remote validation.
- This log does not claim checkout, admin, AI/Césarín, or Product Search changes.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-16.
**Explicit Residual Risk:**
- Low and accepted.
- `PackageX` icon was confirmed present via static diff and DOM inspection; a live browser screenshot of an OOS product card was not captured because no OOS product was available in the local dataset during QA. This is deemed acceptable to avoid unnecessary data mutation risk.
- All other implementation surfaces (contextual empty-state copy on three discovery routes) were browser-confirmed.
**Outcome:**
`Storefront Grid Discovery Context Coherence Pass` is canonized as accepted. `ProductGrid` now supports contextual, actionable recovery copy via props; `SearchResults`, `CategoryPage`, and `SectionPage` inject discovery-surface-appropriate messaging; `ProductCard` out-of-stock CTA now uses the `PackageX` icon consistent with the established `QuickViewModal` icon language; Slice 15 clear-filter logic, Slice 11 section-filter logic, all services, routes, sorting, filtering algorithms, backend, DB/Supabase, AI/Césarín, checkout, admin, Product Search, helper artifacts, and closed slice fronts remain untouched.

### Category Filter Empty-State Clear Recovery Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Category Filter Empty-State Clear Recovery Coherence slice in commit `25816b4cc1e4fa57ff6811c95fe593a96ae95e18` (`fix: clear category filters from empty grid`). This records Storefront Product Discovery and Merchandising Coherence slice 15 only; it does not reopen Slices 1-14, filtering algorithms, `ProductGrid`, `FilterSidebar`, services, routes, Product Search, AI/Césarín, checkout/provider/payment, admin, DB/Supabase, deploy, helper artifacts, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed only `src/pages/CategoryPage.tsx`.
2. **Clear-filter empty recovery accepted** - category leaf pages now pass `onClearFilter` to `ProductGrid` only when active filters exist, the original category product list has products, and the filtered/sorted result is empty.
3. **Reset semantics accepted** - the clear-filter handler resets `priceRange` to `[availableFilters.minPrice, availableFilters.maxPrice]` and `attributes` to `{}`.
4. **Existing filter source preserved** - the handler uses existing product-derived available filters from `getAvailableFilters(products)`.
5. **True empty-category behavior preserved** - true no-product categories do not get a misleading clear-filter CTA.
6. **Sorting preserved** - existing sorting remains through `sortProducts(filteredProducts, sort)`.
7. **Adjacent surfaces inspected but unchanged** - `ProductGrid.tsx`, `FilterSidebar.tsx`, and `src/lib/product-filtering.ts` were inspected but not modified.
8. **Existing storefront behavior preserved** - desktop/mobile filter sidebar behavior, child category cards, product fetching, and route behavior remain unchanged.
9. **No broader surface expansion** - no services, filtering utilities, Product Search, AI/Césarín, checkout/provider/payment, admin, DB/Supabase/deploy, docs beyond canon, or helper artifact behavior changed.
10. **Push accepted** - commit `25816b4cc1e4fa57ff6811c95fe593a96ae95e18` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim browser QA.
- This log does not claim filtering algorithm changes.
- This log does not claim `ProductGrid` or `FilterSidebar` changes.
- This log does not claim services changed.
- This log does not claim DB/Supabase/deploy/remote validation.
- This log does not claim checkout, admin, AI/Césarín, or Product Search changes.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-14.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- Acceptance is source-level plus lint/typecheck.
- The logic uses existing filter reset semantics already present in `FilterSidebar`.
**Outcome:**
`Category Filter Empty-State Clear Recovery Coherence` is canonized as accepted. Category leaf pages now offer `Limpiar filtro` for active-filter zero-result states and recover the category product grid when clicked, while true empty categories, filtering algorithms, `ProductGrid`, `FilterSidebar`, services, routes, Product Search, AI/Césarín, checkout, admin, DB, Supabase, deploy, helper artifacts, docs beyond canon, and closed slice fronts remain untouched.

### PDP / Quick View Purchase Option Copy Accent Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted PDP / Quick View Purchase Option Copy Accent Coherence slice in commit `de5dd1e822526fe514014e624d66f2e786f6edd7` (`fix: add accents to purchase option copy`). This records Storefront Product Discovery and Merchandising Coherence slice 14 only; it does not reopen Slices 1-13, purchaseability behavior, variant behavior, services, routes, checkout, Product Search, AI/Césarín, admin, DB/Supabase, deploy, helper artifacts, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed only `src/lib/domain/products.ts`, `src/components/products/ProductActions.tsx`, and `src/components/products/QuickViewModal.tsx`.
2. **Copy-only correction accepted** - customer-facing Spanish accent copy was corrected in PDP / Quick View purchase and variant-selection surfaces.
3. **Accepted copy corrections recorded** - `Anadir al carrito` -> `Añadir al carrito`; `catalogo actual` -> `catálogo actual`; `Elige una opcion` -> `Elige una opción`; `Selecciona una opcion` -> `Selecciona una opción`; `Opcion` -> `Opción`; `Opcion no disponible` -> `Opción no disponible`; `ya no esta disponible` -> `ya no está disponible`; `esta disponible` -> `está disponible`; `Catalogo actual` -> `Catálogo actual`.
4. **Plural copy truth preserved** - remaining `opciones` text is correct Spanish plural and was not part of the defect.
5. **Focused test result accepted** - `src/lib/domain/__tests__/products.test.ts` passed with 5/5 tests during implementation acceptance.
6. **Behavior preserved** - no purchaseability state logic, selected-variant logic, quantity logic, cart behavior, wishlist behavior, pricing behavior, route behavior, recommendation behavior, service/query behavior, checkout behavior, Product Search, AI/Césarín, admin, DB/Supabase/deploy, or helper artifact behavior changed.
7. **Push accepted** - commit `de5dd1e822526fe514014e624d66f2e786f6edd7` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim browser QA.
- This log does not claim full Spanish copy cleanup.
- This log does not claim behavior changes.
- This log does not claim services changed.
- This log does not claim DB/Supabase/deploy/remote validation.
- This log does not claim checkout, admin, AI/Césarín, or Product Search changes.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-13.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- Other unrelated unaccented copy may still exist elsewhere.
- This slice does not broaden into full copy cleanup.
**Outcome:**
`PDP / Quick View Purchase Option Copy Accent Coherence` is canonized as accepted. PDP and quick view purchase/variant-selection copy now uses the accepted accented Spanish strings in the bounded touched files, while purchaseability and variant behavior, services, checkout, Product Search, AI/Césarín, admin, DB, Supabase, deploy, helper artifacts, docs beyond canon, and closed slice fronts remain untouched.

### PDP / Quick View Urgency Truthfulness Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted PDP / Quick View Urgency Truthfulness Coherence slice in commit `126d01b36181ee5fcd3f0ed1189b9a59d0522479` (`fix: remove synthetic urgency claims`). This records Storefront Product Discovery and Merchandising Coherence slice 13 only; it does not reopen Slices 1-12, analytics/order/inventory truth, services, backend data, DB/schema/migrations, Supabase, Product Search, AI/Césarín, checkout/provider/payment, admin/upload/storage, deploy, helper artifacts, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed only `src/components/products/UrgencyIndicators.tsx`.
2. **Unsupported social proof removed** - people-viewing-now, last-purchase-time, sold-percentage/progress, and `Se vendieron...` flash-sale/toast claims were removed.
3. **Fake urgency generators removed** - `Math.random()`, `setInterval`, timer-driven fake sale toast logic, random viewing state, and fake sale state were removed from the component.
4. **API compatibility preserved** - the public prop interface remains `stock`, optional `viewCount`, and `className`.
5. **viewCount truthfulness preserved** - `viewCount` remains in the prop interface for caller compatibility but is not rendered without a truthful data source.
6. **Stock states preserved** - truthful `Agotado`, low-stock messaging, and in-stock messaging remain visible from the existing `stock` prop.
7. **Callers unchanged** - existing callers in `src/components/products/ProductInfo.tsx` and `src/components/products/QuickViewModal.tsx` remained unchanged.
8. **No broader surface expansion** - no services, analytics/order/inventory queries, DB/schema/migrations, Supabase, Product Search, AI/Césarín, checkout/provider/payment, admin/upload/storage, deploy, or helper artifact behavior changed.
9. **Push accepted** - commit `126d01b36181ee5fcd3f0ed1189b9a59d0522479` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim browser QA.
- This log does not claim real analytics/order tracking was added.
- This log does not claim inventory history was added.
- This log does not claim backend truth or backend data was added.
- This log does not claim services changed.
- This log does not claim DB/Supabase/deploy/remote validation.
- This log does not claim checkout, admin, AI/Césarín, or Product Search changes.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-12.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- Minor copy polish can remain for later, such as `Ultimas` without accent, without undermining the truthfulness slice.
**Outcome:**
`PDP / Quick View Urgency Truthfulness Coherence` is canonized as accepted. PDP and quick view no longer show unsupported random live social-proof, recent-purchase, sold-percentage, or timer-driven fake sale claims from `UrgencyIndicators`, while API compatibility, unchanged callers, and truthful stock availability cues remain preserved; unrelated services, analytics/order/inventory data, backend, Product Search, AI/Césarín, checkout, admin/upload/storage, DB, Supabase, deploy, helper artifacts, docs beyond canon, and closed slice fronts remain untouched.

### Quick View Cover Image Fallback Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Quick View Cover Image Fallback Coherence slice in commit `0beee20b7b3c6bfa5ecb5164b14d98757bd7c929` (`fix: use cover image fallback in quick view`). This records Storefront Product Discovery and Merchandising Coherence slice 12 only; it does not reopen Slices 1-11, `ProductCard`, services, upload/storage/admin behavior, recommendations, Product Search, AI/Césarín, checkout/provider/payment, DB/schema/migrations, Supabase, deploy, helper artifacts, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed only `src/components/products/QuickViewModal.tsx`.
2. **Main image fallback accepted** - QuickViewModal main image rendering now uses `product.images?.[selectedImage] || product.cover_image || ''`.
3. **Selected image priority preserved** - the selected `product.images` array entry remains the first source.
4. **Cover-image fallback bounded** - `product.cover_image` is used only when the selected image-array entry is unavailable.
5. **True no-image fallback preserved** - the final empty string remains the fallback when neither selected image nor `cover_image` exists.
6. **Package placeholder preserved** - the existing placeholder remains reachable for true no-image state.
7. **Thumbnail behavior preserved** - thumbnail behavior remains tied to actual `product.images` arrays.
8. **Adjacent modal behavior preserved** - modal layout, variant selection, pricing, cart behavior, wishlist behavior, and detail link behavior remain unchanged.
9. **No broader surface expansion** - no `ProductCard`, service, upload/storage/admin, recommendation, Product Search, AI/Césarín, checkout, DB, Supabase, deploy, or helper artifact behavior changed.
10. **Push accepted** - commit `0beee20b7b3c6bfa5ecb5164b14d98757bd7c929` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim browser QA.
- This log does not claim thumbnail behavior changed.
- This log does not claim upload/storage/admin behavior changed.
- This log does not claim services changed.
- This log does not claim recommendation behavior changed.
- This log does not claim Product Search, AI/Césarín, admin, checkout/provider, DB/Supabase/deploy/remote validation, or helper artifact behavior changed.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-11.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- Change affects only the main quick-view image source.
- No thumbnail or upload/storage behavior changed.
**Outcome:**
`Quick View Cover Image Fallback Coherence` is canonized as accepted. QuickViewModal now uses `cover_image` as a bounded fallback when the selected image-array source is unavailable, while selected image-array entries remain first priority, true no-image placeholder behavior remains reachable, thumbnails remain tied to actual image arrays, and unrelated storefront, service, Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, helper artifact, docs beyond canon, and closed slice fronts remain untouched.

### Section Root Category Chip Descendant Filtering Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Section Root Category Chip Descendant Filtering Coherence slice in commit `526628562f265ddb1b9bba2d911b43a7f395929a` (`fix: include child categories in section filters`). This records Storefront Product Discovery and Merchandising Coherence slice 11 only; it does not reopen Slices 1-10, category services, routes, schema, DB/Supabase, Product Search, AI/Césarín, admin, checkout/provider/payment, deploy, helper artifacts, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Accepted Implementation / Audit Sequence:**
1. **Source scope confirmed** - accepted implementation changed only `src/pages/SectionPage.tsx`.
2. **Root-family filtering accepted** - section root category chips now filter product grids by the selected root category family.
3. **Direct descendant set accepted** - the filter includes the active root category ID plus direct child category IDs from the already-loaded `categories` array.
4. **Memoized filter set accepted** - implementation added memoized `activeCategoryIds`.
5. **Direct-only filter retired** - the old direct equality filter `p.category_id === activeCategory` is gone.
6. **New filtering expression accepted** - product filtering now uses `products.filter(p => activeCategoryIds.has(p.category_id))`.
7. **Existing behavior preserved** - `Todos`, sorting via `sortProducts(result, sort)`, ProductGrid behavior, clear-filter behavior, scroll behavior, category cards, and section routes remain preserved.
8. **No service/backend expansion** - no new category service query, backend behavior, route, schema, DB, Supabase, Product Search, AI/Césarín, admin, checkout/provider, deploy, or helper artifact behavior changed.
9. **Validation accepted** - targeted eslint passed, `npm run typecheck` passed, touched-file diff check passed with a CRLF warning only, and source check confirmed direct-only filtering was replaced by active-root-plus-direct-child filtering.
10. **Push accepted** - commit `526628562f265ddb1b9bba2d911b43a7f395929a` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim recursive category hierarchy support.
- This log does not claim browser QA.
- This log does not claim services changed.
- This log does not claim DB/Supabase/deploy/remote validation.
- This log does not claim Product Search, AI/Césarín, admin, checkout/provider, or route behavior changed.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-10.
**Explicit Residual Risk:**
- Low and accepted.
- Direct children only.
- No recursive category hierarchy system.
- No browser QA was run.
- Deterministic source-level filtering was accepted as sufficient.
**Outcome:**
`Section Root Category Chip Descendant Filtering Coherence` is canonized as accepted. Section root category chips now include products assigned to the active root category and its direct child categories while preserving existing sorting, grid, clear-filter, scroll, category-card, and route behavior; services, backend, Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, helper artifacts, docs beyond canon, and closed slice fronts remain untouched.

### PDP Duplicate Trust Badge Section Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted PDP Duplicate Trust Badge Section Coherence slice in commit `01df4acf1fb7aa616013701fbdbfe9faaedd0a95` (`fix: remove duplicate PDP trust badges`). This records Storefront Product Discovery and Merchandising Coherence slice 10 only; it does not reopen Slices 1-9, `TrustBadges` copy/content, shipping/trust policy, PDP redesign, recommendations, Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migrations, Supabase, deploy, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
`src/pages/ProductDetail.tsx` rendered `<TrustBadges />` twice: once nested under `ProductImages` inside the left/sticky gallery column and once again as the full-width PDP trust section below the main product layout. Because `TrustBadges` is a section-style component, the nested gallery-column instance was duplicative and layout-incoherent.
**Accepted Implementation / Audit Sequence:**
1. **Nested trust badge block removed** - the sticky-column `<TrustBadges />` block under `ProductImages` was removed from `src/pages/ProductDetail.tsx`.
2. **Full-width trust section preserved** - the existing full-width `<TrustBadges />` section below the main PDP layout remains.
3. **Single render count accepted** - source check confirmed `<TrustBadges />` render count in `ProductDetail.tsx` is exactly `1`.
4. **Import remains valid** - the `TrustBadges` import remains correctly used by the preserved full-width section.
5. **Adjacent PDP behavior unchanged** - no `ProductImages`, `ProductInfo`, `SocialProof`, `FrequentlyBoughtTogether`, or `RelatedProducts` behavior changed.
6. **Source scope confirmed** - accepted implementation changed only `src/pages/ProductDetail.tsx`.
7. **Validation accepted** - targeted eslint passed, `npm run typecheck` passed, and touched-file diff check passed with a CRLF warning only.
8. **Push accepted** - commit `01df4acf1fb7aa616013701fbdbfe9faaedd0a95` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a TrustBadges copy or content rewrite.
- This log does not claim a shipping/trust policy change.
- This log does not claim a PDP redesign.
- This log does not claim full PDP conversion optimization.
- This log does not claim recommendation behavior changed.
- This log does not claim full Product Discovery completion.
- This log does not reopen Slices 1-9.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- This is a one-file presentation cleanup.
**Outcome:**
`PDP Duplicate Trust Badge Section Coherence` is canonized as accepted. `ProductDetail` now renders one coherent full-width `<TrustBadges />` section, with no duplicate nested trust badge section under the gallery column, while unrelated PDP components, services, search, Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, docs beyond canon, helper artifacts, and closed slice fronts remain untouched.

### Broad Search Collection Copy Accent Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Broad Search Collection Copy Accent Coherence slice in commit `9709ea8c566b00af9971e2ff06565c1f970cd121` (`fix: add accents to broad search collection copy`). This records Storefront Product Discovery and Merchandising Coherence slice 9 only; it does not reopen Slices 1-8, search routing behavior, Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migrations, Supabase, deploy, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
Broad search collection banners on `/buscar` used visible unaccented Spanish copy in the Slice 3 broad-search route surface: `Categoria completa`, `liquidos`, `coleccion correcta`, and `Ver coleccion`.
**Accepted Implementation / Audit Sequence:**
1. **Banner eyebrow corrected** - `Categoria completa` now reads `Categoría completa`.
2. **Vape description corrected** - `liquidos` now reads `líquidos`.
3. **Collection description corrected** - `coleccion correcta` now reads `colección correcta`.
4. **CTA accessible text corrected** - `Ver coleccion` now reads `Ver colección`.
5. **Focused test expectation updated** - `src/pages/__tests__/SearchResults.test.tsx` was updated only for the CTA accessible text.
6. **Source scope confirmed** - accepted implementation changed only `src/pages/SearchResults.tsx` and `src/pages/__tests__/SearchResults.test.tsx`.
7. **Broad keys preserved** - `vape`, `vapes`, `vapeo`, and `420` remained unchanged.
8. **CTA routes preserved** - broad search CTAs still route to `/vape` and `/420`.
9. **Search behavior preserved** - `getBroadSectionSearch` behavior and normal non-broad search behavior remained unchanged.
10. **Validation accepted** - targeted eslint passed, `npm run typecheck` passed, focused `SearchResults` vitest passed with 3/3 tests, and touched-file diff check passed with CRLF warnings only.
11. **Text/source check accepted** - old unaccented strings were absent from `SearchResults.tsx`, and accented replacements were present.
12. **Push accepted** - commit `9709ea8c566b00af9971e2ff06565c1f970cd121` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind before this canon reconciliation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim semantic search.
- This log does not claim Product Search changes.
- This log does not claim search routing behavior changes.
- This log does not claim product ranking or retrieval changes.
- This log does not claim a full copy cleanup.
- This log does not claim full Product Discovery completion.
- This log does not claim browser visual QA.
- This log does not reopen Slices 1-8.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- This is a copy-only focused slice.
**Outcome:**
`Broad Search Collection Copy Accent Coherence` is canonized as accepted. Broad search collection banners now use accented Spanish copy while preserving broad keys, CTA routes, broad-search routing logic, normal non-broad search behavior, and unrelated Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, docs beyond canon, and closed slice fronts.

### PDP Recommendation Section Visibility Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted PDP Recommendation Section Visibility Coherence slice in commit `87ac99725cf4ab73a9226b641950c1604595d0ea` (`fix: gate empty PDP recommendation sections`). This records Storefront Product Discovery and Merchandising Coherence slice 8 only; it does not reopen Slices 1-7, recommendation ranking/selection/source data, Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migrations, Supabase, deploy, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
PDP recommendation section headings/dividers could render without visible recommendation content. `ProductDetail.tsx` rendered `Comprados juntos habitualmente` and `También te gustará` wrappers/headings unconditionally, while `FrequentlyBoughtTogether.tsx` returns `null` while loading or when `relatedProducts.length === 0`, and `RelatedProducts.tsx` returns `null` while loading or when `related.length === 0`.
**Accepted Implementation / Audit Sequence:**
1. **PDP-owned orphan headings removed** - `src/pages/ProductDetail.tsx` no longer renders unconditional recommendation wrappers/headings.
2. **Error boundaries preserved** - `ProductDetail.tsx` now renders only `FrequentlyBoughtTogether` and `RelatedProducts` inside their existing section error boundaries.
3. **Bundle section gated** - `src/components/products/FrequentlyBoughtTogether.tsx` now owns `Comprados juntos habitualmente` heading/divider after its loading/empty guard.
4. **Related-products section gated** - `src/components/products/RelatedProducts.tsx` now owns `También te gustará` heading/divider after its loading/empty guard.
5. **Visible treatment preserved** - existing headings, divider treatment, section spacing, bundle card, CTA, and horizontal related-products layout remain when recommendation content exists.
6. **Empty/loading states preserved** - empty and loading recommendation states remain non-visible and no longer leave orphan headings/dividers.
7. **Source scope confirmed** - accepted implementation changed only `src/pages/ProductDetail.tsx`, `src/components/products/RelatedProducts.tsx`, and `src/components/products/FrequentlyBoughtTogether.tsx`.
8. **Recommendation logic untouched** - no service/query behavior, ranking, selection, source data, `products.service.ts`, `useSmartRecommendations.ts`, or `upsell-logic.ts` changed.
9. **Validation accepted** - `npx eslint src/pages/ProductDetail.tsx src/components/products/RelatedProducts.tsx src/components/products/FrequentlyBoughtTogether.tsx` passed, `npm run typecheck` passed, and touched-file `git diff --check` passed with CRLF warnings only.
10. **Source/text check accepted** - source/text check confirmed headings/dividers moved out of unconditional `ProductDetail.tsx` rendering and behind child guards.
11. **Test scope accepted** - no focused component test was added because no nearby focused harness existed; no broad test harness was created.
12. **Push accepted** - commit `87ac99725cf4ab73a9226b641950c1604595d0ea` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim recommendation quality or ranking improved.
- This log does not claim new recommendations were added.
- This log does not claim service/query behavior changed.
- This log does not claim empty recommendation data was fixed.
- This log does not claim root category chip filtering was fixed.
- This log does not claim broad search accent copy was fixed.
- This log does not claim full Product Discovery completion.
- This log does not claim browser visual QA.
- This log does not claim Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migration, Supabase, or deploy work.
- This log does not reopen Slices 1-7.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- No focused component test was added.
- This is presentation gating only.
**Outcome:**
`PDP Recommendation Section Visibility Coherence` is canonized as accepted. PDP recommendation headings/dividers now appear only with visible recommendation content, empty/loading recommendation states stay non-visible, recommendation service/ranking/selection behavior remains unchanged, and unrelated Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, docs beyond canon, and closed slice fronts remain untouched.

### Product Card Cover Image Fallback Coherence - 2 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Product Card Cover Image Fallback Coherence slice in commit `02d90c3e6c1d52435b0229408542f4dda6d48844` (`fix: use cover image fallback in product cards`). This records Storefront Product Discovery and Merchandising Coherence slice 7 only; it does not reopen Slices 1-6, recommendation ranking/selection, Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migrations, Supabase, deploy, image upload/storage/admin behavior, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
Some product-card rendering paths could receive products with valid `cover_image` but missing or empty `images`, especially recommendation/related-product paths. `ProductCard` previously ignored `cover_image` for its main image source and could fall through to the existing no-image fallback even when valid cover art existed.
**Accepted Evidence:**
- `src/services/products.service.ts` smart recommendations compatible-category path selects `cover_image` but not `images`.
- `src/components/products/RelatedProducts.tsx` renders those recommendation items through `ProductCard`.
- `src/components/products/ProductCard.tsx` previously used `product.images?.[currentImage] || ''`.
- `src/components/products/FrequentlyBoughtTogether.tsx` already used the safer pattern `product.images?.[0] || product.cover_image || ''`.
- The compatible recommendation path is real and not dead code.
**Accepted Implementation / Audit Sequence:**
1. **Image source fallback accepted** - `src/components/products/ProductCard.tsx` now uses `product.images?.[currentImage] || product.cover_image || ''`.
2. **Old source logic retired** - the prior `product.images?.[currentImage] || ''` path was replaced.
3. **Image-array priority preserved** - `product.images?.[currentImage]` remains the first source, preserving existing behavior for products with image arrays.
4. **Hover and image-dot behavior preserved** - no hover-image or image-dot logic changed.
5. **True no-image fallback preserved** - when neither `images` nor `cover_image` exists, the source still resolves to `''` and existing fallback UI remains available.
6. **Source scope confirmed** - accepted implementation changed only `src/components/products/ProductCard.tsx`.
7. **Validation accepted** - `npx eslint src/components/products/ProductCard.tsx` passed, `npm run typecheck` passed, and `git diff --check -- src/components/products/ProductCard.tsx` passed with a CRLF warning only.
8. **Source check accepted** - text/source check confirmed the fallback expression exists in `ProductCard.tsx`.
9. **Test scope accepted** - no focused ProductCard test was added because no nearby focused ProductCard harness existed; no broad harness was created.
10. **Push accepted** - commit `02d90c3e6c1d52435b0229408542f4dda6d48844` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim all product images are valid.
- This log does not claim image upload/storage/admin behavior changed.
- This log does not claim recommendation ranking or selection changed.
- This log does not claim new recommendations were added.
- This log does not claim empty recommendation headings were fixed.
- This log does not claim full Product Discovery completion.
- This log does not claim browser visual QA.
- This log does not claim Product Search, AI/Césarín, admin, checkout/provider/payment, DB/schema/migration, Supabase, or deploy work.
- This log does not reopen Slices 1-6.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- No focused ProductCard test was added because no nearby focused ProductCard harness existed.
- This is a one-line render fallback change.
**Outcome:**
`Product Card Cover Image Fallback Coherence` is canonized as accepted. Product cards now use `cover_image` as a fallback when the current image-array source is unavailable, while image arrays remain first priority and true no-image fallback UI remains preserved; recommendation selection/ranking, Product Search, AI/Césarín, admin, checkout, DB, Supabase, deploy, image storage/upload, docs beyond canon, and closed slice fronts remain untouched.

### Desktop Storefront Navigation Route Coherence - 1 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Desktop Storefront Navigation Route Coherence slice in commit `b92392c7b1132471a38babc18a7e01612c51ed0e` (`fix: align desktop storefront nav routes`). This records Storefront Product Discovery and Merchandising Coherence slice 6 only; it does not reopen Slices 1-5, create a coupons route/page/system, change mobile navigation, edit `App.tsx`, or touch Product Search, Césarín, checkout/provider/payment, admin, DB/schema/migrations, Supabase, deploy, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
Desktop header navigation exposed customer-visible routes that did not match real storefront/customer routing: `Cupones` pointed to `/cupones`, but no storefront `/cupones` route exists; authenticated `Mis Compras` pointed to `/perfil/pedidos`, while customer order history is routed through `/orders` and `/orders/:orderId`.
**Accepted Implementation / Audit Sequence:**
1. **Desktop coupons item removed** - the desktop `Cupones` nav item pointing to `/cupones` was removed from `src/components/layout/header/DesktopNav.tsx`.
2. **Associated divider removed** - the extra divider paired with the removed coupons item was removed.
3. **Customer orders route corrected** - authenticated desktop `Mis Compras` now routes to `/orders` instead of `/perfil/pedidos`.
4. **Unused import removed** - `TicketPercent` was removed after the coupons item was removed.
5. **Valid desktop routes preserved** - `/nuevo`, `/mas-vendidos`, `/ofertas`, `/vape`, `/420`, and `/rastreo` remained intact.
6. **Source scope confirmed** - accepted implementation changed only `src/components/layout/header/DesktopNav.tsx`; `src/App.tsx` was inspected only and not modified.
7. **Validation accepted** - `npx eslint src/components/layout/header/DesktopNav.tsx` passed, `npm run typecheck` passed, and `git diff --check -- src/components/layout/header/DesktopNav.tsx` passed with a CRLF warning only.
8. **Text search accepted** - `/cupones` and `/perfil/pedidos` were absent from `DesktopNav.tsx`, and `/orders` was present.
9. **Push accepted** - commit `b92392c7b1132471a38babc18a7e01612c51ed0e` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full Product Discovery completion.
- This log does not claim browser visual QA.
- This log does not claim mobile navigation changes.
- This log does not claim creation of a coupons route, page, or system.
- This log does not claim checkout/provider/payment changes.
- This log does not claim admin changes.
- This log does not claim AI/Césarín/Product Search changes.
- This log does not claim DB/schema/migration work.
- This log does not claim Supabase work.
- This log does not claim deploy.
- This log does not claim route creation in `App.tsx`.
- This log does not reopen Slices 1-5.
**Explicit Residual Risk:**
- Low and accepted.
- No browser visual QA was run.
- The diff was limited to one desktop nav config file and did not alter layout structure beyond removing one item/divider pair.
**Outcome:**
`Desktop Storefront Navigation Route Coherence` is canonized as accepted. Desktop header navigation no longer exposes nonexistent `/cupones` or stale `/perfil/pedidos` customer paths, authenticated `Mis Compras` now points to `/orders`, valid desktop discovery routes remain preserved, and unrelated mobile nav, coupons, `App.tsx`, Product Search, Césarín, checkout, admin, DB, Supabase, deploy, and closed slice fronts remain untouched.

### Post-Hero / PDP Shipping Trust Copy Coherence - 1 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Post-Hero / PDP Shipping Trust Copy Coherence slice in commit `3f2a766ca313219e5af5b293683a9464637a1894` (`fix: align post-hero shipping trust copy`). This records Storefront Product Discovery and Merchandising Coherence slice 5 only; it does not reopen Slices 1-4, Hero/MegaHero, Product Search retrieval/embeddings, semantic/vector search, Gemini, Césarín response quality, checkout/provider/payment, admin/Cesarin OS, DB/schema/migrations, remote Supabase, deploy, `db push`, `db reset`, local delivery/pickup support, a full shipping policy system, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
Customer-visible post-hero and PDP trust surfaces still carried stale shipping/trust copy that contradicted the accepted DHL-only/no-personal-delivery business truth, including Acapulco local free-shipping language, delivery-zone language, an unsupported `+$500` free-shipping threshold, and unsupported local-speed copy.
**Accepted Business Truth:**
- The store/project is built from Xalapa.
- The business owner / commercial base is Acapulco.
- Products are mostly imported from China and USA.
- Shipping is DHL only.
- There are no personal/local deliveries.
- Products must not be described as made/fabricated/hechos in Xalapa.
- The storefront must not imply local delivery zones in Xalapa or Acapulco.
- The storefront must not invent free-shipping thresholds.
- The storefront must not invent unsupported delivery-speed promises.
**Accepted Implementation / Audit Sequence:**
1. **Post-hero promo copy accepted** - `src/components/home/PromoSection.tsx` now says `Envíos por DHL a todo México`, `Productos importados de China y USA`, and CTA `Consultar envío DHL`.
2. **Old post-hero claims retired** - `Envío Gratis en Acapulco`, `En compras mayores a $500 MXN`, and `Ver zonas de entrega` were removed from the touched promo surface.
3. **Trust badge DHL copy accepted** - `src/components/home/TrustBadges.tsx` now says `Envío DHL / A todo México` and `Entrega Segura / Solo por DHL`.
4. **Old trust badge claims retired** - `Envío Gratis / En Acapulco +$500` and `Entrega Rápida / 24-48 hrs zona con.` were removed from the touched trust-badge surface.
5. **PDP price/shipping trust accepted** - `src/components/products/ProductPriceSection.tsx` now says `Envío DHL Seguro / A todo México`.
6. **Old PDP shipping badge retired** - generic `Envío Seguro * / En todo México` was replaced with explicit DHL-safe national shipping copy.
7. **Source scope confirmed** - accepted implementation changed only `src/components/home/PromoSection.tsx`, `src/components/home/TrustBadges.tsx`, and `src/components/products/ProductPriceSection.tsx`.
8. **No tests added** - nearby useful tests were not present for these copy-only surfaces; the only nearby test was for `MegaHero`, which was explicitly out of scope.
9. **Validation accepted** - targeted eslint passed, touched-file `git diff --check` passed with CRLF warnings only, and text-search checks passed.
10. **Forbidden claim search accepted** - touched files no longer matched `Envío Gratis en Acapulco`, `Envío Gratis`, `zonas de entrega`, `Entrega Rápida`, `24-48`, `zona con`, `+$500`, `personal`, `entrega personal`, `hecho`, `fabricado`, or `Xalapa`.
11. **Aligned claim search accepted** - touched files confirmed `DHL`, `China y USA`, `A todo México`, and `Solo por DHL`.
12. **Push accepted** - commit `3f2a766ca313219e5af5b293683a9464637a1894` was pushed to `origin/main`; post-push `main...origin/main` had no ahead/behind.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full Product Discovery completion.
- This log does not claim browser visual QA.
- This log does not claim repository-wide typecheck is green.
- This log does not claim deploy.
- This log does not claim remote Supabase validation or mutation.
- This log does not claim DB/schema/migration changes.
- This log does not claim checkout/provider/payment changes.
- This log does not claim admin or Cesarin OS changes.
- This log does not claim AI/Césarín/Product Search changes.
- This log does not claim Hero/MegaHero changes.
- This log does not reopen Slices 1-4.
- This log does not claim a full shipping policy system.
- This log does not claim local delivery or pickup support.
- This log does not claim a free-shipping threshold.
- This log does not claim delivery-time promises.
**Explicit Residual Risk:**
- Minor and accepted.
- Repository-wide `npm run typecheck` remains red due unrelated/preexisting fixture typing in `src/services/__tests__/concierge.service.execution-bridge.test.ts`, where `tier: string` is not assignable to the `CustomerProfile` tier union at lines `163`, `202`, `241`, and `272`.
- No browser visual QA was run for Slice 5; accepted evidence is bounded to copy diff, targeted eslint, touched-file diff check, and text-search verification.
- `Consultar envío DHL` routes to `/contact`; Codex accepted this as a contact CTA, not a delivery-zone claim.
**Outcome:**
`Post-Hero / PDP Shipping Trust Copy Coherence` is canonized as accepted with minor residual risk. Home post-hero promo, Home/PDP trust badges, and PDP price/shipping trust now align with DHL-only national shipping and imported-product truth without local delivery zones, personal delivery, unsupported free-shipping thresholds, unsupported speed promises, or made-in-Xalapa claims, while unrelated hero, Product Search, Césarín, checkout, admin, DB, remote Supabase, deploy, and shipping-policy-system fronts remain untouched.

### Hero Clarity / Acapulco-DHL Location Consistency - 1 de mayo de 2026
**Scope:** Documentation/canon reconciliation for the accepted Hero clarity / location consistency slice in commit `41e8eee3b6d2096ff30651e6572344ba40d572b2` (`fix: align hero copy with DHL shipping truth`). This records Storefront Product Discovery and Merchandising Coherence slice 4 only; it does not reopen PDP related products, Product Search retrieval/embeddings, semantic/vector search, Gemini, Césarín response quality, checkout/provider, admin/Cesarin OS, DB/schema/migrations, remote Supabase, deploy, `db push`, `db reset`, pickup/local-delivery support, or a full service-area policy system.
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
The Home hero/runtime copy could expose confusing local/city-specific shipping language such as `envío gratis en Xalapa`, while the accepted business truth is DHL-only shipping from the Acapulco commercial base for mostly imported products.
**Accepted Business Truth:**
- The page/project is operated/developed from Xalapa.
- The business owner / commercial base is Acapulco.
- Products are mostly imported from China and the United States.
- Products must not be described as made/fabricated/hechos in Xalapa.
- There are no personal/local deliveries.
- Delivery is only through DHL shipping.
- The storefront must not imply local hand delivery in Xalapa or Acapulco.
**Accepted Implementation / Audit Sequence:**
1. **Home hero fallback/normalized copy accepted** - visible accepted copy is `Productos importados con envíos por DHL desde Acapulco. Compra fácil, envío seguro y sin entregas personales.`
2. **Negation accepted** - `sin entregas personales` is accepted because it is a negation, not a service promise.
3. **Forbidden visible claims removed** - the Home hero no longer claims made/fabricated/hechos in Xalapa, free shipping in Xalapa, local delivery in Xalapa, or local/personal delivery in Acapulco.
4. **Stale-copy normalizer accepted** - the Home hero stale-copy normalization now prevents old city-specific/local-delivery/manufacturing claims from surfacing in the visible Home hero path.
5. **Home SEO alignment accepted** - Home SEO description and the sr-only Home heading were aligned with imported products and DHL shipping from Acapulco.
6. **Readability changes accepted** - spacing, vertical positioning, font scale, line height, and text drop shadow were adjusted in bounded form; this was not a redesign from zero.
7. **Source scope confirmed** - accepted implementation changed only `src/components/home/MegaHero.tsx`, `src/pages/Home.tsx`, and `src/components/home/__tests__/MegaHero.test.tsx`.
8. **Focused tests accepted** - `npm run test:run -- src/components/home/__tests__/MegaHero.test.tsx` passed with 2 tests.
9. **Diff hygiene accepted** - `git diff --check` passed with only the CRLF warning on the test file.
10. **Browser QA accepted** - desktop Home hero headline was not cropped or above the viewport, text was readable over background, and CTAs were visible/reachable; mobile headline was below sticky header, text was not occluded by bottom nav, and CTAs remained reachable.
11. **Regression smoke accepted** - Home featured categories rendered, `/ofertas` loaded, `/buscar?q=vape` still showed `Vape Collection` with CTA to `/vape`, and `/vape` plus `/420` loaded.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim PDP related products are fixed.
- This log does not claim Product Search retrieval, ranking, embeddings, or vector validation.
- This log does not claim semantic/vector search.
- This log does not claim Gemini changes.
- This log does not claim Césarín response quality changes.
- This log does not claim checkout/provider validation.
- This log does not claim admin or Cesarin OS changes.
- This log does not claim DB/schema/migration changes.
- This log does not claim remote Supabase validation or mutation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim pickup/local-delivery support.
- This log does not claim a full service-area policy system.
- This log does not claim production proof.
- This log does not claim full Product Discovery completion beyond closed slices 1, 2, 3, and this slice 4.
**Explicit Residual Risk:**
- Minor and accepted.
- `npm run test -- MegaHero` timed out due Vitest worker startup/tooling.
- The focused `test:run` command passed.
- Browser QA using bundled Node v24 plus installed Chrome is accepted because the in-app browser runtime resolved Node v20.19.5 and required >= v22.22.0.
- Tests do not explicitly assert every forbidden phrase such as `hechos/fabricados`, but implementation normalization and browser QA cover the visible Home hero path.
**Outcome:**
`Hero Clarity / Acapulco-DHL Location Consistency` is canonized as accepted with minor residual risk. The Home hero now reflects imported/selected products, DHL shipping from Acapulco, and no personal/local delivery promise, while unrelated storefront, Césarín, Product Search, semantic search, PDP, checkout, admin, DB, remote Supabase, deploy, and service-area-system fronts remain untouched.

### Search Expectation Alignment - 29 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted Search expectation alignment slice in commit `5310a043af8dbef2c59367c393fee8ceb81db411` (`fix broad category search routing`). This records Storefront Product Discovery and Merchandising Coherence slice 3 only; it does not reopen hero clarity/location, PDP related products, `/ofertas` beyond already-closed Slice 2, Product Search retrieval/embeddings, semantic/vector search, Gemini, Césarín response quality, checkout/provider, admin/Cesarin OS, DB/schema/migrations, remote Supabase, deploy, `db push`, `db reset`, a full search engine rewrite, a full synonym engine, every future broad search phrase, or full Product Discovery completion.
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
`/buscar?q=vape` previously treated `vape` as literal product text search. This could surface incidental 420 vaporizer matches instead of the expected `/vape` collection path.
**Accepted Implementation / Audit Sequence:**
1. **Bounded broad-term recognition accepted** - exact broad-category recognition was added inside `src/pages/SearchResults.tsx`.
2. **Exact normalization accepted** - matching is exact after `trim().toLowerCase()`.
3. **Vape mappings accepted** - exact queries `vape`, `vapes`, and `vapeo` map to section `vape`, title `Vape Collection`, and CTA `/vape`.
4. **420 mapping accepted** - exact query `420` maps to section `420`, title `420 Zone`, and CTA `/420`.
5. **Existing retrieval path preserved** - for those broad terms, normal literal text search is bypassed and section products are fetched through existing `getProducts({ section, limit: 20 })`.
6. **Normal search preserved** - non-broad terms still use the existing normal search flow through `useSearch(query)`.
7. **Focused regression test accepted** - tests were added in `src/pages/__tests__/SearchResults.test.tsx`.
8. **Source scope confirmed** - accepted implementation changed only `src/pages/SearchResults.tsx` and `src/pages/__tests__/SearchResults.test.tsx`.
9. **Validation accepted** - `npx vitest run src/pages/__tests__/SearchResults.test.tsx` passed, and `git diff 5310a043af8dbef2c59367c393fee8ceb81db411^ 5310a043af8dbef2c59367c393fee8ceb81db411 --check` passed.
10. **Browser/runtime validation accepted** - `/buscar?q=vape`, `/buscar?q=vapes`, and `/buscar?q=vapeo` showed `Vape Collection`, `/vape` CTA, no empty state, and no `Producto no encontrado`; `/buscar?q=420` showed `420 Zone`, `/420` CTA, no empty state, and no `Producto no encontrado`; `/buscar?q=pod` showed no broad-section banner while normal search still rendered product results; `/vape` and `/420` both loaded normally.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim hero clarity/location is fixed.
- This log does not claim PDP related products are fixed.
- This log does not claim additional `/ofertas` work beyond already-closed Slice 2.
- This log does not claim Product Search retrieval, ranking, embeddings, or vector validation.
- This log does not claim semantic/vector search.
- This log does not claim Gemini changes.
- This log does not claim Césarín response quality changes.
- This log does not claim checkout/provider validation.
- This log does not claim admin or Cesarin OS changes.
- This log does not claim DB/schema/migration changes.
- This log does not claim remote Supabase validation or mutation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim a full search engine rewrite.
- This log does not claim a full synonym engine.
- This log does not claim every future broad search phrase is solved.
- This log does not claim full Product Discovery completion.
**Explicit Residual Risk:**
- Minor and accepted.
- This fixes only exact broad terms: `vape`, `vapes`, `vapeo`, and `420`.
- This does not claim full synonym coverage.
- This does not claim semantic search.
- This does not claim Product Search completion.
- Test coverage directly asserts `vape`, `420`, and `pod`; `vapes` and `vapeo` are covered by source map plus reported browser validation.
**Outcome:**
`Search Expectation Alignment` is canonized as accepted with minor residual risk. A customer searching exact broad section terms now receives a clear storefront path to the expected collection and section products, while normal product-like search behavior remains intact and unrelated search, AI, hero, PDP, checkout, admin, DB, remote Supabase, deploy, and Product Discovery fronts remain untouched.

### Offers/Deals Consistency - 29 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted Offers/deals consistency slice in commit `25998e9c88c9f294f0f4ec825903cc5205a9f45e` (`fix offers discounted products query`). This records Storefront Product Discovery and Merchandising Coherence slice 2 only; it does not reopen `/buscar`, hero clarity, PDP related products, Product Search retrieval/embeddings, Césarín response quality, checkout/provider, admin/Cesarin OS, DB/schema/migrations, remote Supabase, deploy, `db push`, `db reset`, coupons, flash deals, or a full promotions system.
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
`/ofertas` could show `No hay ofertas activas` while `/vape` and `/420` showed discounted products/counts.
**Accepted Implementation / Audit Sequence:**
1. **Root cause accepted** - `getDiscountedProducts` used the unreliable PostgREST basic query-builder column-vs-column filter `filter('compare_at_price', 'gt', 'price')`.
2. **Failure mode accepted** - when that query errored, the catch path returned `[]`, causing `/ofertas` to render the empty state.
3. **Remote comparison removed** - the accepted fix removed the unsupported remote column comparison.
4. **Bounded candidate fetch accepted** - the new path fetches candidates with `is_active = true`, `status = active`, `stock > 0`, and `compare_at_price IS NOT NULL`.
5. **Local true-discount filter accepted** - true discounts are filtered locally with `typeof compare_at_price === 'number' && compare_at_price > price`.
6. **Limit discipline accepted** - final results are sliced to the requested limit.
7. **ProductCard shape preserved** - product select shape now includes variants/options needed by existing `ProductCard` behavior.
8. **Regression test accepted** - focused coverage was added in `src/services/__tests__/products.service.test.ts`.
9. **Source scope confirmed** - accepted implementation changed only `src/services/products.service.ts` and `src/services/__tests__/products.service.test.ts`.
10. **Validation accepted** - `npx vitest run src/services/__tests__/products.service.test.ts` passed, and `git diff 25998e9^ 25998e9 --check` passed.
11. **Browser/runtime validation accepted** - `/ofertas` showed no empty state, no `Producto no encontrado`, 25 rendered discount price pairs, and 0 invalid pairs; `/vape` loaded normally and showed `12 en oferta`; `/420` loaded normally and showed `13 en oferta`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim `/buscar` is fixed.
- This log does not claim hero clarity is fixed.
- This log does not claim PDP related products are fixed.
- This log does not claim Product Search retrieval, ranking, embeddings, or vector validation.
- This log does not claim Césarín response quality changes.
- This log does not claim checkout/provider validation.
- This log does not claim admin or Cesarin OS changes.
- This log does not claim DB/schema/migration changes.
- This log does not claim remote Supabase validation or mutation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim coupons, flash deals, or a full promotions system.
- This log does not claim every future discount edge case is solved.
- This log does not claim full Product Discovery completion.
**Explicit Residual Risk:**
- Minor and accepted.
- Discounted products are found from bounded candidate fetch plus local filtering.
- If many non-discount compare-price candidates appear before older true discounts, some older discounts could be missed.
- This is acceptable for this source-only micro-fix.
- This is not a coupons/flash-deals/promotions architecture.
**Outcome:**
`Offers/Deals Consistency` is canonized as accepted with minor residual risk. `/ofertas` now truthfully reflects discounted products from the existing storefront product source instead of falling into the empty state because of an unreliable remote column comparison, while unrelated discovery, search, PDP, Césarín, checkout, admin, DB, remote Supabase, deploy, and promotions-architecture fronts remain untouched.

### Home Featured Category Route/Content Integrity - 29 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted Home featured category route/content integrity slice in commit `bf925f3a371798d6193e9b987caa7048c4958e95` (`fix home featured category routes`). This records the first storefront Product Discovery and Merchandising Coherence implementation slice only; it does not reopen `/ofertas`, `/buscar`, PDP related products, hero clarity, Product Search, checkout, admin, DB/schema, remote Supabase, deploy, `db push`, or `db reset`.
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
The Home featured category tiles had dead storefront route targets and visible encoding damage, including `LÃ­quidos`, which weakened commercial category navigation before broader merchandising work.
**Accepted Implementation / Audit Sequence:**
1. **Slice selected** - the storefront Product Discovery and Merchandising Coherence front selected Home featured category route/content integrity as the first implementation slice.
2. **Visible encoding repair accepted** - `LÃ­quidos` was corrected to `Líquidos`.
3. **Route mappings accepted** - Home featured categories now map to valid storefront routes: `Líquidos` -> `/vape/liquidos`, `Pods & Mods` -> `/vape/mods`, `Cannabis Premium` -> `/420/concentrados`, and `Accesorios` -> `/vape/accesorios-vape`.
4. **Bounded stale-value normalizer accepted** - a Home-only normalizer was added for known stale saved featured-category values.
5. **Source scope confirmed** - acceptance audit confirmed only `src/constants/category-showcase.ts` and `src/components/home/CategoryShowcase.tsx` changed.
6. **Dead Home paths retired** - no old Home tile path is still used for `/vape/pods`, `/420/cannabis`, or `/vape/accesorios`.
7. **Accepted route-load proof recorded** - `/vape/liquidos`, `/vape/mods`, `/420/concentrados`, and `/vape/accesorios-vape` load without `Producto no encontrado`.
8. **Encoding audit recorded** - no new mojibake was introduced in the audited Home category slice.
9. **Unaffected fronts preserved** - no Césarín, Product Search, checkout, admin, DB/schema, remote Supabase, `/ofertas`, `/buscar`, or PDP related-product behavior was touched.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full merchandising completion.
- This log does not claim `/ofertas` is fixed.
- This log does not claim `/buscar` is fixed.
- This log does not claim PDP related products are fixed.
- This log does not claim hero clarity or broader Product Discovery is fixed.
- This log does not claim Product Search retrieval, ranking, embeddings, or vector validation.
- This log does not claim checkout/provider validation.
- This log does not claim admin or Cesarin OS changes.
- This log does not claim DB/schema/migration changes.
- This log does not claim remote Supabase validation or mutation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim future invalid admin-configured featured category slugs are impossible.
**Explicit Residual Risk:**
- Minor and accepted.
- The fix normalizes known stale Home featured-category values only.
- Arbitrary future invalid admin-configured featured category slugs are not globally prevented.
- This is not a global category validation system.
**Outcome:**
`Home Featured Category Route/Content Integrity` is canonized as accepted with minor residual risk. The Home featured category tiles now point to the accepted storefront routes, the visible `Líquidos` text is repaired, and the closure remains bounded to the Home category slice.

### Micro-Input Recovery Copy Fix - 29 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded micro-input / unclear-intent copy fix in commit `dff1a42e44ff8128e05bbde5747c0a02d761d8cb` (`fix: improve micro input recovery copy`) plus the accepted focused tests and browser/runtime validation matrix. This records response-copy quality for known micro fragments only; it does not reopen Product Search retrieval/ranking/embeddings, capsule compaction, broad persona architecture, checkout/provider, loyalty, DB/schema/migrations, remote Supabase, deploy, `db push`, or `db reset`.
**Codex final verdict:** `ACCEPT WITH REQUIRED BROWSER VALIDATION`; browser/runtime validation result: `PASS`.
**Problem Identified:**
The previous clarification repair covered only `PRODUCT_SEARCH` thin clarification paths. `UNKNOWN` micro-inputs such as `q`, `qu`, `que`, `?`, and `mmm` could still pass through weak/robotic fallback copy even though the catalog gate was closed, no tools ran, and no product cards were shown.
**Accepted Implementation / Audit Sequence:**
1. **Bounded deterministic guard added** - `supabase/functions/customer-intelligence/response-shaping.ts` now handles known micro/unclear fragments inside the existing clarification-first final-text path.
2. **Strict trigger conditions accepted** - the guard applies only when the current turn is `ASK_CLARIFYING_QUESTION`, `catalog_gate_reason = clarification_first`, tool count is zero, catalog is closed / no product surfaces exist, and the query is a known micro/unclear fragment.
3. **Accepted copy behavior** - `q`, `qu`, `que`, `?`, and `mmm` return `Parece que se te cortó el mensaje, ¿qué querías decirme?`; `tienes` returns `Sí, ¿qué producto o sabor estás buscando?`; `no sé` receives guided help; `ayuda` remains helpful and is not turned into cut-message recovery; `hola` remains greeting/helpful and is not turned into cut-message recovery.
4. **Safety boundaries preserved** - the guard does not trigger for catalog-open turns, product-card turns, tool/capsule result turns, normal clear product queries, `hola`, or `ayuda`.
5. **Existing behavior preserved** - Product Search fallback repair, capsule compaction, product-anchor grounding fallback, clarification-first guard behavior, and no-card behavior when the catalog gate is closed remain preserved.
6. **Focused tests accepted** - `npx vitest run src/lib/__tests__/customer-intelligence-response-shape.test.ts` passed with 1 file and 13 tests.
7. **Browser/runtime validation accepted** - normal storefront assistant UI validation passed for `q`, `qu`, `que`, `?`, `mmm`, `tienes`, `no sé`, `ayuda`, and `hola`; all showed good copy, no product cards, and no timeout/Gemini/API blocker.
8. **Telemetry validation accepted** - `q` / `qu` / `que` / `?` / `mmm` logged `primary_intent = UNKNOWN`, `current_turn_decision = ASK_CLARIFYING_QUESTION`, `catalog_gate_open = false`, and `product_card_count = 0`; `tienes` and `no sé` logged `PRODUCT_SEARCH` with the same closed-catalog zero-card outcome; `ayuda` logged `SUPPORT`; `hola` logged `GREETING`.
9. **Local helper artifacts preserved** - `check_analytics*.cjs`, `check_audit.cjs`, `check_auth.cjs`, `enable_ai.cjs`, `repair_auth.cjs`, `test_edge*.cjs`, `test_prompts*.cjs`, and `supabase/snippets/` remain untracked local helper artifacts and were neither deleted nor committed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim global Cesarin quality closure.
- This log does not claim a broad persona rewrite.
- This log does not claim Product Search retrieval, ranking, embedding, or vector validation.
- This log does not claim capsule compaction changes.
- This log does not claim checkout/provider validation.
- This log does not claim a loyalty fix.
- This log does not claim DB/schema/migration changes.
- This log does not claim remote Supabase validation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim full storefront conversational matrix coverage.
- This log does not claim every unclear-intent case is solved forever.
**Explicit Residual Risk:**
- This fixes the known micro/unclear fragments and the validated matrix only.
- Broader unclear-intent behavior still depends on routing, Analyst classification, and runtime context.
- Occasional local loyalty-intelligence `400` / `401` JWT console noise remains non-blocking and unfixed.
- Greeting duplication in `hola` can be watched later if it becomes repeated, but it is outside this fix.
**Outcome:**
`Micro-Input Recovery Copy Fix` is canonized as accepted and browser-validated. Known micro fragments now receive short human recovery copy, `tienes` asks for product/sabor clarification, `no sé` gets guided help, `ayuda` and `hola` are not degraded, and catalog-closed turns continue showing zero product cards.

### AI Concierge Response Compaction Fix - 28 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted client-side storefront response compaction fix in commit `3faaae0` (`fix: relax AI concierge response compaction to 8 sentences`) and the focused regression lock in commit `99efa7a` (`test: add regression tests for AI concierge response compaction logic`). This records the known Admin-vs-Storefront response quality divergence closure only; it does not reopen Product Search retrieval/ranking/embeddings, backend prompts/persona, Supabase Functions, checkout/provider, loyalty, DB/schema/migrations, remote Supabase, deploy, `db push`, or `db reset`.
**Codex final verdict:** `ACCEPT` after required test follow-up.
**Problem Identified:**
Backend/admin-visible Cesarin responses could be richer and more useful because admin telemetry displayed `capsuleContract.customer_response_draft`, while the storefront bubble rendered a later client-shaped message. The Product Search final path could pass `shouldShowCatalogSurfaces ? 2 : 3` into client-side compaction, cutting richer customer response drafts down to 2 or 3 sentences. This explained the observed admin-vs-storefront quality split.
**Accepted Implementation / Audit Sequence:**
1. **Client-side compaction relaxed** - `compactCesarinCopy` default changed from 3 sentences to 8.
2. **Prefix merge compaction relaxed** - `mergeConversationalPrefix` default changed from 3 sentences to 8.
3. **Effective prefix comparison aligned** - `getEffectiveConversationalPrefix` internal comparison changed from 3 sentences to 8.
4. **Product Search final-message compaction aligned** - the Product Search final message path no longer uses the 2/3 sentence split and now uses the accepted 8-sentence ceiling.
5. **Safety guards preserved** - duplicate sentence removal, redundant closing removal, prefix distinctness checks, clarification prefix suppression, and public-info/source-context prefix suppression remain in place.
6. **Grounded Product Search protection preserved** - `resolveGroundedProductSearchMessage` still protects against candidate text dropping anchored products or adding weaker uncertainty.
7. **Regression tests accepted** - commit `99efa7a` added focused tests proving `compactCesarinCopy` preserves a non-duplicative 5-sentence draft by default, caps repetitive 10-sentence text at 8, preserves distinct prefix plus a 5-sentence message, preserves a 5-sentence `customer_response_draft`, and still falls back when candidate text drops the anchored product.
8. **Test seam accepted** - `resolveGroundedProductSearchMessage` was exported only as a test seam; its body and runtime behavior were unchanged.
9. **Focused test result accepted** - `npx vitest run src/lib/__tests__/cesarin-text-utils.test.ts` passed with 25 tests.
10. **Local helper artifacts preserved** - `check_analytics.cjs`, `check_analytics_latest.cjs`, `check_audit.cjs`, `check_auth.cjs`, `enable_ai.cjs`, `repair_auth.cjs`, `test_edge*.cjs`, `test_prompts*.cjs`, and `supabase/snippets/Untitled query 627.sql` remain untracked local helper artifacts and were neither deleted nor committed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim broad live production proof.
- This log does not claim every Cesarin response quality issue is solved globally.
- This log does not claim Product Search retrieval, ranking, embedding, or vector quality validation.
- This log does not claim backend prompt/persona rewrite.
- This log does not claim Supabase Function changes.
- This log does not claim DB/schema/migration changes.
- This log does not claim checkout/provider validation.
- This log does not claim a loyalty fix.
- This log does not claim remote Supabase validation.
- This log does not claim deploy, `db push`, or `db reset`.
- This log does not claim full storefront conversational matrix coverage.
- This log does not claim all capsule/admin/front divergence is impossible forever.
**Explicit Residual Risk:**
- Focused tests lock the known compaction behavior, but broader integration behavior still depends on runtime route, capsule, and context.
- This fixes the known client-side over-compaction corridor, not every possible response-quality issue.
- Future bad responses should be diagnosed by comparing the storefront bubble, network payload, `ai_analytics.response_text`, and `ai_logic_debug`.
**Outcome:**
`AI Concierge Response Compaction Fix` is canonized as accepted. Richer backend and `customer_response_draft` text can now survive storefront rendering instead of being cut to 2/3 sentences, while duplicate removal, prefix sanity, and grounded product-anchor protections remain in place.

### Storefront Image Fallback Localization - 28 de abril de 2026
**Scope:** Documentation/canon reconciliation for two accepted bounded storefront image fallback commits: `3f7e717cc31a796f5912f50cc94242144163603a` (`fix: localize storefront fallback images`) and `86e031da0da2f2702258bf342a9614e60e1b20ca` (`fix: localize neural hero images`). This records fallback/demo source cleanup only and does not reopen Product Search, AI response logic, retrieval/ranking/embeddings, checkout/provider, loyalty, DB/Supabase, Edge Functions, migrations/seeds, docs beyond canon reconciliation, deploy, `db push`, `db reset`, or remote Supabase fronts.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
Customer-facing storefront fallback/demo imagery still depended on Unsplash in bounded source paths. The first accepted pass localized `MegaHero`, `category-showcase`, and `MegaMenu` fallback/demo images but left one residual: `useNeuralHero` personalized slides still carried three Unsplash URLs that could become visible to logged-in users with matching customer-intelligence segments.
**Accepted Implementation / Audit Sequence:**
1. **Core storefront fallback images localized** - `MegaHero`, `src/constants/category-showcase.ts`, and `MegaMenu` no longer depend on Unsplash for their fallback/demo visuals.
2. **Local fallback assets accepted** - eight stable SVG assets were added under `public/images/storefront-fallbacks/` for hero, category, and menu fallback use.
3. **Same-origin fallback handling accepted** - fallback constants resolve through same-origin static URLs so the existing image helper path does not reinterpret those local assets as Supabase storage images.
4. **OptimizedImage behavior preserved** - `OptimizedImage` and the existing image optimization behavior were inspected during implementation and left unchanged.
5. **Neural hero residual closed** - `useNeuralHero` personalized slides now use local fallback assets: `Campeón` -> `hero-extracts.svg`, `En Riesgo` -> `hero-generic.svg`, and `Novo` / `Prospecto` -> `hero-vape.svg`.
6. **Bounded active source paths accepted clean** - `src/components/home/MegaHero.tsx`, `src/hooks/useNeuralHero.ts`, `src/constants/category-showcase.ts`, and `src/components/layout/header/MegaMenu.tsx` were accepted as clean of Unsplash references.
7. **Local helper artifacts preserved** - `check_analytics.cjs`, `check_analytics_latest.cjs`, `check_auth.cjs`, `enable_ai.cjs`, and `repair_auth.cjs` remain untracked local helper artifacts and were neither deleted nor committed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim all external image URLs are removed globally.
- This log does not claim DB seed, migration, or product image URLs were changed.
- This log does not claim `public/_headers` CSP was changed.
- This log does not claim Product Search quality validation.
- This log does not claim retrieval, ranking, embeddings, or vector validation.
- This log does not claim checkout/provider validation.
- This log does not claim a loyalty fix.
- This log does not claim Supabase, Edge Function, backend, schema, migration, or seed changes.
- This log does not claim production/live proof.
- This log does not claim deploy, `db push`, `db reset`, or remote Supabase validation.
- This log does not claim a broad storefront redesign or global media-policy completion.
**Explicit Residual Risk:**
- `public/_headers` still allows `https://images.unsplash.com` as a non-active dependency allowance for possible externally supplied or admin-provided images.
- Migration/seed/product image placeholders were not changed.
- This is bounded fallback/demo source cleanup, not a global media policy.
**Outcome:**
`Storefront Image Fallback Localization` is canonized as accepted. Active customer-facing hero/category/menu fallback paths and personalized neural hero slides now use local storefront fallback SVGs instead of Unsplash URLs, while non-target image policy and data sources remain intentionally untouched.

### AI Concierge Frontend Timeout UX Fix - 28 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded storefront frontend timeout/UX fix in commit `e3b13c960a171c7f65bea27c2da464b214419339` (`fix: extend ai concierge frontend timeout window`) plus one bounded local browser validation path. This records frontend-only timeout/UX truth and local validation evidence only; it does not reopen backend, Supabase Functions, Product Search quality, retrieval/ranking/embeddings, prompt design, checkout/provider, Cesarin OS workflow, DB schema, remote Supabase, deploy, `db push`, `db reset`, or production-readiness fronts.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
The storefront AI concierge UI used a single hard frontend wall-clock timeout of `25,000ms` inside `useAIConcierge.ts`. That timeout could fire before a legitimate degraded backend recovery path finished, causing the UI to show premature `La respuesta tardo demasiado` even when the backend later completed with a useful clarification/guidance response.
**Accepted Implementation / Audit Sequence:**
1. **Concierge-only timeout constants accepted** - the old hardcoded `25,000ms` frontend timeout was replaced with explicit AI-concierge-only timing constants instead of broad/global timeout changes.
2. **Slow-response UX accepted** - `useAIConcierge` now exposes `isSlowResponse`, with a bounded slow-response threshold of `20,000ms` while the request is still pending.
3. **Final frontend timeout extended safely** - the final AI concierge request timeout is now `60,000ms`, preserving safe failure on true hangs while no longer failing early at `25s`.
4. **Loading copy truth accepted** - the existing spinner stays in place, and the loading label now transitions from `Analizando...` to `Sigo pensando...` after the slow-response threshold rather than surfacing a premature timeout.
5. **Focused regression coverage accepted** - `src/hooks/__tests__/useAIConcierge.test.tsx` passed with `10` tests and `src/components/ui/ai/__tests__/AIConcierge.test.tsx` passed with `26` tests, covering no timeout at `25s`, slow-response state around `20s`, successful late response before `60s`, final timeout at `60s`, and the UI copy transition.
6. **Bounded local browser proof accepted** - under a repaired local storefront/browser path, the prompt `qué me recomiendas barato` took `21,075ms`, the UI showed `Analizando...` initially, then `Sigo pensando...` after `20s`, did not show premature `La respuesta tardo demasiado`, and rendered a real useful response successfully before the `60s` timeout ceiling.
7. **Bounded runtime/telemetry truth accepted** - the browser pass showed no fatal runtime error, no Gemini/API error, no thin `¡Claro!` regression, no product cards, and wrote a local telemetry row with `primary_intent = PRODUCT_SEARCH`, `current_turn_decision = USE_CAPABILITY`, `catalog_gate_open = true`, `catalog_gate_reason = explicit_product_request`, `product_card_count = 0`, clarification/guidance-oriented `response_text` length `151`, and no thin-response recurrence.
8. **Local helper artifacts were preserved** - `check_analytics.cjs`, `check_analytics_latest.cjs`, `check_auth.cjs`, `enable_ai.cjs`, and `repair_auth.cjs` remain untracked local helper artifacts and were neither deleted nor committed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim production or live traffic proof.
- This log does not claim broad Product Search quality validation.
- This log does not claim retrieval, ranking, embeddings, or vector validation.
- This log does not claim backend or Gemini prompt changes.
- This log does not claim checkout/provider validation.
- This log does not claim Cesarin OS workflow validation.
- This log does not claim DB schema change.
- This log does not claim remote Supabase validation.
- This log does not claim production readiness.
- This log does not claim that the local loyalty-intelligence `400` noise is fixed.
- This log does not claim that external Unsplash/placeholder `404` noise is fixed.
**Explicit Residual Risk:**
- The acceptance proof is bounded to the storefront frontend timeout/UX corridor plus one successful local browser response at roughly `21s`; it is not broad conversational coverage.
- Non-blocking local noise remains recorded: loyalty-intelligence `400` responses caused by missing local customer rows and external image `404` noise.
**Outcome:**
`AI Concierge Frontend Timeout UX Fix` is canonized as accepted. The storefront frontend no longer times out at `25s` for AI concierge requests, slow-response UX now appears around `20s`, the final frontend timeout is `60s`, and one bounded local browser pass proved that a `21s` response renders successfully without the earlier premature `La respuesta tardo demasiado` symptom or the thin `¡Claro!` regression. Local helper artifacts remain untracked and preserved.

### Local Storefront AI Browser Smoke - 27 de abril de 2026
**Scope:** Documentation/canon reconciliation for one bounded local-only storefront assistant browser smoke after local app/server recovery, local admin auth recovery, local storefront AI exposure enablement, and local Gemini runtime recovery. This records local validation evidence only and does not reopen implementation, Product Search quality, retrieval/ranking/embeddings, checkout/provider, Cesarin OS workflow, remote Supabase, deploy, `db push`, `db reset`, or production-readiness fronts.
**Codex final verdict:** `PASS WITH NON-BLOCKING NOISE`.
**Problem Identified:**
After the accepted local app recovery and local auth recovery, one remaining truth gap still existed: the accepted clarification-first runtime hardening had bounded telemetry proof, but the real local storefront assistant/browser path had not yet been recorded as successful end-to-end evidence under a live local browser with the normal floating concierge UI visible. The immediate need was not implementation expansion. It was one bounded local smoke proving that the real browser storefront assistant path could open, accept a safe product-seeking prompt, keep the catalog closed until clarification, avoid the thin `¡Claro!` regression, and avoid fatal runtime errors.
**Accepted Implementation / Audit Sequence:**
1. **Local-only storefront assistant exposure was enabled for the smoke** - `store_settings.is_ai_assistant_enabled` was initially false in local truth and was enabled locally only so the normal storefront assistant/chat UI became visible. This did not touch remote Supabase and is not a claim of live/production exposure state.
2. **Local Gemini runtime path was recovered and bounded** - the local helper `npm run local:write-edge-env` regenerated the temp local Edge env file, local Edge Functions were restarted against that temp env file, and the earlier local Gemini invalid-key symptom was closed for the smoke path.
3. **Real local browser storefront assistant UI was used** - the floating storefront chat bubble rendered, the real concierge/chat surface was opened locally in-browser, and the prompt `qué me recomiendas barato` was sent through the normal local storefront assistant path.
4. **Clarification-first storefront behavior held in the real browser path** - the local assistant returned a real response, the response was not bare `¡Claro!`, it asked a useful narrowing question, the catalog gate remained closed until clarification, and no product cards were shown.
5. **Sanitized telemetry matched the expected bounded path** - the resulting local telemetry truth was `primary_intent = PRODUCT_SEARCH`, `current_turn_decision = ASK_CLARIFYING_QUESTION`, `catalog_gate_open = false`, `catalog_gate_reason` requiring further narrowing, `product_card_count = 0`, appropriate clarification-oriented `response_text`, and no thin-response recurrence.
6. **Browser/runtime error outcome stayed bounded** - no fatal/blocking JS/runtime error was observed on the accepted local storefront assistant path. The only recorded browser noise was non-fatal external image `404` noise from Unsplash/placeholder resources, which is not claimed fixed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim production or live traffic proof.
- This log does not claim remote Supabase validation.
- This log does not claim broad Product Search quality validation.
- This log does not claim retrieval, ranking, embeddings, or vector validation.
- This log does not claim checkout/provider validation.
- This log does not claim Cesarin OS workflow validation beyond the already accepted navigation/browser smoke.
- This log does not claim a broad clarification matrix.
- This log does not claim that external image `404` noise is fixed.
- This log does not claim code changes, docs changes during the smoke, deploy, `db push`, `db reset`, or production readiness.
**Explicit Residual Risk:**
- Bounded local browser evidence covers one safe authenticated clarification-seeking storefront prompt only, not a broad storefront conversational matrix.
- Non-fatal external image `404` noise remains present in the local browser path.
**Outcome:**
`Local Storefront AI Browser Smoke` is canonized as bounded local validation evidence. The real local storefront assistant/browser path can become visible under local-only exposure enablement, local Gemini runtime can answer through the real browser UI, the prompt `qué me recomiendas barato` stays clarification-first with a closed catalog and zero product cards, the thin `¡Claro!` regression did not recur, and no fatal JS/runtime error was observed.

### AdminCesarinOS Navigation Rationalization - 25 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded `/admin/cesarin` navigation rationalization only. This records the accepted information-architecture hierarchy in commit `261089b77d68d217c10daac953c59ef00241d288` (`Rationalize Cesarin OS admin navigation`) and does not reopen storefront, Product Search, retrieval/ranking/embeddings, checkout/provider, backend/service/schema/migration, telemetry schema, remote Supabase, deploy, `db push`, `db reset`, or broad Cesarin OS redesign fronts.
**Codex final verdict:** `ACCEPT`.
**Problem Identified:**
After the earlier operator consolidation and truthfulness-reduction passes, normal `/admin/cesarin` navigation was safer but still not aligned to the accepted operator cockpit principle. Daily operator flow needed to prioritize real telemetry review, improvement closure, and knowledge correction, while trend/history, case drafts, and advanced configuration needed lower-frequency placement.
**Accepted Implementation / Audit Sequence:**
1. **Daily visible hierarchy accepted** - normal navigation now presents `Operacion`, `Mejoras`, and `Conocimiento` as the primary daily group.
2. **Secondary placement accepted** - `Historico` and `Casos` are grouped as secondary surfaces for trends and reviewed-case reproduction.
3. **Advanced/settings placement accepted** - `Reglas`, `Conceptos`, and `Persona` are grouped under advanced/settings so they do not compete with daily operations.
4. **Dormant surfaces remain hidden** - `learning`, `interventions`, `simulator`, `quality`, `PilotParityDiagnostics`, and premium/simulation lab surfaces remain excluded from normal navigation.
5. **Behavior preservation accepted** - existing tab render wiring remains intact for Pilot, Improvements, Knowledge, Analytics, Case Drafts, Rules, Concepts, and Persona; no service calls, telemetry semantics, evaluations, improvements, knowledge, rules, concepts, or case draft data paths changed.
6. **Focused validation accepted** - `npx vitest run src/pages/admin/__tests__/AdminCesarinOS.test.tsx` passed with `1` file and `2` tests.
7. **Authenticated browser smoke accepted as bounded evidence** - a later local authenticated browser smoke opened `/admin/cesarin`, confirmed the accepted daily/secondary/advanced navigation hierarchy, confirmed hidden/dormant surfaces were absent, clicked every visible tab, and found no fatal JS errors or navigation regression. The local admin password reset used for access recovery was local-only and did not print credentials, hashes, tokens, or secrets. One non-fatal `404` resource console error was observed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim storefront changes.
- This log does not claim Product Search changes.
- This log does not claim retrieval, ranking, embeddings, or vector behavior changed.
- This log does not claim checkout/provider changes.
- This log does not claim backend/service/schema/migration changes.
- This log does not claim telemetry schema changes.
- This log does not claim remote Supabase was touched.
- This log does not claim deploy, `db push`, `db reset`, source deletion, production readiness, or broad Cesarin OS redesign.
- This log does not claim browser E2E coverage beyond the bounded authenticated nav smoke.
- This log does not claim backend workflow validation or DB mutation validation.
- This log does not claim the non-fatal `404` resource console error is fixed.
**Explicit Residual Risk:**
- Low. Risk is limited to operator familiarity with the new grouping and minor visual/layout differences.
- One non-fatal `404` resource console error remains recorded as smoke noise.
**Outcome:**
`AdminCesarinOS Navigation Rationalization` is canonized as accepted. Normal `/admin/cesarin` now presents a clearer operator cockpit hierarchy: daily `Operacion / Mejoras / Conocimiento`, secondary `Historico / Casos`, and advanced/settings `Reglas / Conceptos / Persona`, while dormant diagnostic/stale surfaces stay absent and existing behavior/data services remain preserved.

### Clarification-First Response Fix - 25 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted clarification-first response-quality fix only. This records the accepted customer-intelligence behavior change in commit `d4984421370491c206dded37991e2aeece58a9c9` (`Fix clarification-first fallback response`) and does not reopen Product Search quality, retrieval/ranking, embeddings, storefront UI redesign, Cesarin OS/admin, checkout/provider, telemetry schema, remote Supabase, deploy, or production-readiness fronts.
**Codex final verdict:** `ACCEPT WITH RESIDUAL RISK`.
**Problem Identified:**
Live telemetry triage found a repeated broad budget-product recommendation pattern where `PRODUCT_SEARCH` + `ASK_CLARIFYING_QUESTION` + `catalog_gate_reason = clarification_first` + `product_card_count = 0` persisted extremely thin customer-visible text such as `¡Claro!`. Acceptance audit confirmed the skipped Sommelier clarification branch had trusted `analystConversationalPrefix` directly, allowing thin prefixes to become final `response_text`.
**Accepted Implementation / Audit Sequence:**
1. **Scoped repair accepted** - `buildClarificationFirstFallbackText(...)` repairs thin text only for `PRODUCT_SEARCH`, `ASK_CLARIFYING_QUESTION`, `clarification_first`, zero tools, no product surfaces, and thin text.
2. **Customer-visible behavior accepted** - the scoped branch now emits one useful narrowing question instead of preserving `¡Claro!`.
3. **Catalog closure preserved** - the path still keeps catalog closed, returns `products: []`, returns `routed_capsule: null`, and the existing gate-closed cleanup still clears product arrays and `next_step_view`.
4. **Focused validation accepted** - `npx vitest run src/lib/__tests__/customer-intelligence-response-shape.test.ts src/lib/__tests__/customer-intelligence-turn-first.test.ts src/lib/__tests__/customer-intelligence-tool-selection.test.ts` passed with `3` files and `51` tests.
5. **Controlled local runtime validation accepted** - one authenticated local `customer-intelligence` interaction against local Supabase `http://127.0.0.1:54321` created a new `ai_analytics` row for the broad budget/product recommendation theme. The observed telemetry path was `PRODUCT_SEARCH`, `ASK_CLARIFYING_QUESTION`, `catalog_gate_open=false`, `catalog_gate_reason=clarification_first`, `fallback_used=true`, `semantic_match_success=false`, `product_card_count=0`, and `sommelier_fallback_reason=ANALYST_CLARIFICATION`. The persisted response length was `93`, included a useful narrowing question about disposable vs rechargeable, did not collapse to `¡Claro!`, and product cards remained absent. A first unauthenticated attempt returned `403` and created no telemetry, as expected for `concierge_chat`.
6. **Final guard accepted** - a later controlled local sample exposed one remaining edge-owned clarification-first row persisting exactly `¡Claro!`. Commit `3ad7113020cc96005978666cf34f581b8df8e1f4` (`Fix final clarification-first thin response guard`) added `guardClarificationFirstFinalText(...)` after text guarantee/compaction and before `analyticsPayload.response_text` is built. The guard is scoped only to `PRODUCT_SEARCH`, `ASK_CLARIFYING_QUESTION`, `clarification_first`, zero tools, catalog closed, zero product cards, no product surfaces, and thin text.
7. **Final focused validation accepted** - the focused suite passed with `3` files and `55` tests.
8. **Final controlled runtime validation accepted** - after the final guard, `5` authenticated local prompts generated `4` edge-owned `ai_analytics` rows; all `4/4` persisted rows were `PRODUCT_SEARCH` + `ASK_CLARIFYING_QUESTION` + `clarification_first`, catalog closed, `semantic_match_success=false`, `product_card_count=0`, useful narrowing questions present, `thin_rows=0`, and `closed_gate_with_cards=0`. The grape/flavor prompt routed to the client-side Product Search capsule and did not create an edge-owned row in the direct runtime call.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim live production traffic proof.
- This log does not claim Product Search quality validation.
- This log does not claim retrieval, ranking, embeddings, vector behavior, or product-search capsule logic changed.
- This log does not claim browser/client Product Search capsule validation.
- This log does not claim storefront UI redesign.
- This log does not claim Cesarin OS/admin changes.
- This log does not claim checkout/provider changes.
- This log does not claim telemetry schema changes.
- This log does not claim remote Supabase was touched.
- This log does not claim deploy, `db push`, `db reset`, production readiness, or global clarification completion.
**Explicit Residual Risk:**
- Controlled runtime validation covers edge-owned local clarification-first rows only, not live production traffic, full browser/client Product Search capsule telemetry, or a broad clarification matrix.
**Outcome:**
`Clarification-First Response Fix` is canonized as accepted with low residual risk and bounded local runtime evidence. The final guard closes the remaining persisted bare `¡Claro!` escape for the scoped edge-owned closed-catalog clarification-first path, and no adjacent product, retrieval, telemetry, admin, checkout, provider, browser/client capsule, or deployment front is reopened by this note.

### Local AI / Edge / Gemini Readiness - 25 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted local-only Edge/Gemini readiness smoke. This records the local helper workflow and the final narrow `customer-intelligence` smoke only. It does not reopen implementation, Product Search quality, embeddings/vector repopulation, storefront behavior, Cesarin OS, checkout/payment/provider flows, remote Supabase, remote Edge secrets, deploy, or production readiness.
**Accepted helper source:** commit `2f22ffe67f04d3b1bdd0be155fcf68d45387a7d4` (`Add local edge env helper`).
**Codex final verdict:** `PASS` for basic local Edge/Gemini smoke readiness.
**Problem Identified:**
After local development recovery, local Edge/Gemini validation was initially blocked because the local Edge runtime did not receive a usable Gemini key, then because the temp env file had a UTF-8 BOM, then because the loaded Gemini key was expired. The accepted helper and key refresh proved the remaining issue was local key source/config, not Docker/WSL/Supabase local stack readiness.
**Implementation / Audit Sequence:**
1. **Local helper was accepted** - `npm run local:write-edge-env` now generates `$env:TEMP\vsm-store-local-edge.env` from Windows/process `GEMINI_API_KEY` plus local Supabase status output.
2. **Local env generation is bounded and secret-safe** - the helper writes UTF-8 without BOM, forces local Supabase URL `http://127.0.0.1:54321`, prints only presence checks and the output path, and does not print secret values.
3. **Local functions serving was accepted** - `npx supabase functions serve --env-file "$env:TEMP\vsm-store-local-edge.env" --no-verify-jwt` starts local Edge Functions at `http://127.0.0.1:54321/functions/v1/`.
4. **Narrow Gemini smoke passed** - local `customer-intelligence` was reached through `http://127.0.0.1:54321/functions/v1/customer-intelligence`, env injection reached the function runtime, and the safe `parse_admin_intent` probe returned a successful response.
5. **Expired-key blocker was closed locally** - the new Windows/process key fingerprint changed from the expired key, the temp env fingerprint matched the updated process key, and the final local smoke no longer failed with `API key expired`.
**Accepted Final Discipline:**
- Run `npm run local:write-edge-env` before future local `functions serve`.
- Use `npx supabase functions serve --env-file "$env:TEMP\vsm-store-local-edge.env" --no-verify-jwt` for local-only serving.
- Rotate local Gemini keys by updating Windows user env `GEMINI_API_KEY`, opening a fresh terminal or refreshing process env, then regenerating the temp env file.
- Do not store Gemini keys in repo files, do not print keys, and do not use `supabase secrets set` for local validation.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Product Search quality validation.
- This log does not claim embeddings/vector repopulation validation.
- This log does not claim storefront behavior validation.
- This log does not claim Cesarin OS validation.
- This log does not claim checkout/payment/provider validation.
- This log does not claim remote Supabase was touched.
- This log does not claim remote Edge secrets were updated.
- This log does not claim deploy, `db push`, `db reset`, or production readiness.
- This log does not claim `supabase_vector_vsm-store` was fixed.
**Outcome:**
`Local AI / Edge / Gemini Readiness` is canonized as `PASS` for the narrow local smoke. The accepted local workflow is helper-first temp env generation followed by local `functions serve`; the readiness claim is deliberately limited to local Edge serving, local `customer-intelligence` reachability, and Gemini key injection/basic provider execution.

### Local Development Recovery - 24 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted local development recovery only. This records host Windows / WSL2 / Docker repair, local Supabase usability, local VSM runtime targeting local Supabase, and accepted local smoke results. It does not reopen implementation, remote Supabase, deployments, Edge Functions, Gemini/AI runtime, Product Search, Cesarin OS, storefront behavior, checkout, or provider fronts.
**Codex final verdict:** `ACCEPTED / READY`.
**Problem Identified:**
Local development was previously blocked by host virtualization / WSL2 / Docker Desktop failures and then by local Supabase migration/schema parity blockers. The accepted recovery lane resolved the host and local migration/app blockers required for normal local development without touching remote Supabase or deploying.
**Implementation / Audit Sequence:**
1. **Host virtualization recovered** - Windows virtualization, WSL2, Ubuntu WSL version `2`, Docker Desktop, and Docker context `desktop-linux` were accepted as functional.
2. **Docker baseline validated during recovery** - `docker run --rm hello-world` succeeded.
3. **Local Supabase recovered** - `npx supabase start` now starts the local stack; API `http://127.0.0.1:54321`, Studio `http://127.0.0.1:54323`, DB `postgresql://postgres:postgres@127.0.0.1:54322/postgres`, and Mailpit `http://127.0.0.1:54324` are accepted local endpoints.
4. **Local migration blockers were resolved through bounded commits** - migration timestamp, admin-policy lookup, BOM, missing-table guard, admin email lookup, coupon FK/index/comment, rescue-admin seed, universal-rescue seed, and store-settings parity blockers were fixed locally.
5. **Local app target was verified during accepted smoke** - VSM local ran at `http://127.0.0.1:5174/` with temporary environment variables and without editing `.env`; runtime Supabase target was `http://127.0.0.1:54321`.
6. **Runtime remote-hit smoke passed** - browser smoke confirmed `0` runtime hits to remote Supabase project `cvvlorbiwtuhkxolhfie.supabase.co`; static preconnect in `index.html` is not runtime remote usage.
7. **Functional smoke passed for normal local development** - storefront, auth/login, `/admin`, `/admin/cesarin`, main admin modules, read-only admin workflows, and customer detail orders query are accepted locally. Fatal JS errors observed during accepted smoke were `0`.
**Accepted Final Discipline:**
- Local Development Recovery is closed as `ACCEPTED / READY`.
- Normal local-development blockers are `0`.
- The accepted local Supabase API target is `http://127.0.0.1:54321`.
- The accepted local app URL is `http://127.0.0.1:5174/`.
- The app runs against local Supabase through temporary environment variables, not by editing `.env`.
**Accepted recovery commits verified from git log:**
- `59c2092633a56829d3912e5f4a8b78077adca264` - `Normalize Supabase migration timestamps`
- `774bef6839405aae6b2ec47ae9da1e37d1096b76` - `Fix monitoring policy admin lookup`
- `31999429b5814ebc262503efc7bbcd4dd5135352` - `Remove BOM from loyalty statistics migration`
- `f83db247b11fea9bf32677ac1083aa8524d99494` - `Guard variation policy migration on missing tables`
- `9b47fe27273537d21731e95c3efa6cba295a5995` - `Fix variation admin policy lookup`
- `213baec314f6650900f847a52923dd62b0eb35fe` - `Fix smart loyalty coupon foreign key`
- `bfc133a2a4932d9a7a4810806bdec3649130b28f` - `Refine smart loyalty active index columns`
- `c73b1b9b1cf58778c2e3ec102eb4be01d995b5b1` - `Disambiguate coupon RPC function comment`
- `aac3ce02b69db0e8140adf7e820ed2008eff0c23` - `Guard rescue admin seed on existing auth user`
- `1f3f88128f241f06378f5b80ffdc12e2905bbdb7` - `Guard universal rescue admin seed on auth user`
- `bee19db88ee3126f72a19bc033d5ce2937bb52ba` - `Add store settings AI parity columns`
- `670cc5e82e54f4ff6796041f3500b3001629eda7` - `Read admin customer order items as JSON`
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim all Edge Functions were validated locally.
- This log does not claim Gemini, AI, or edge-key-dependent local paths were validated.
- This log does not claim `supabase_vector_vsm-store` is fixed.
- This log does not claim remote Supabase was touched.
- This log does not claim `supabase db push`, `supabase db reset`, deploys, or remote changes happened.
- This log does not treat static remote preconnect as runtime remote usage.
- This log does not reopen Product Search, Cesarin OS, storefront behavior, checkout, provider, Gemini, or AI runtime fronts.
- This log does not claim production readiness.
**Explicit Residual Local Noise:**
- `supabase_vector_vsm-store` remains in a restart loop, classified as non-blocking and isolated to logging/vector collection.
- `supabase/.temp/cli-latest` remains locally modified.
- `supabase/.branches/` remains untracked.
- Static remote preconnect in `index.html` exists, while accepted runtime smoke confirmed local Supabase target.
**Outcome:**
`Local Development Recovery` is now formally canonized as `ACCEPTED / READY`. The accepted truth is local development environment readiness only: host Windows / WSL2 / Docker recovered, local Supabase usable, local VSM app targeting local Supabase, normal local smoke passed, customer detail order query parity corrected, and no normal local-development blocker remains.

### Cesarin OS Operator UX Truthfulness Reduction - 23 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded Cesarin OS operator-UX truthfulness reduction only. This records the accepted hiding of misleading simulator/runtime-diagnostic surfaces from normal `/admin/cesarin` operator navigation and does not reopen backend/schema repair, Supabase migration work, storefront runtime behavior, prompt/capsule/routing, checkout/payment/provider logic, service-worker/runtime-build redesign, or full simulator deletion.
**Accepted implementation source:** commit `debcb0a` (`Hide Cesarin simulator diagnostics from operators`).
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
The accepted Phase 1 operator consolidation had already removed major Pilot clutter, but normal Cesarin OS operator navigation could still present simulator/runtime-diagnostic surfaces as if they were trustworthy operator tools. Cold audit concluded that runtime parity probe was not a reliable operator surface, simulator lab was structurally broken from source/backend truth, `ai_simulation_sessions` and `ai_simulation_reports` were not valid normal-shell operator dependencies, and the truthful next move was bounded hiding from operator UX rather than backend/schema repair in the same pass.
**Implementation / Audit Sequence:**
1. **Normal shell tabs were reduced truthfully** - `AdminCesarinOS` now hides `simulator` and `quality` from the normal Cesarin OS shell.
2. **Normal operator navigation stopped mounting those flows** - the main shell no longer imports or mounts simulator/quality surfaces in ordinary operator navigation.
3. **Normal shell mount stopped touching simulation/session tables** - the accepted shell path no longer attempts `ai_simulation_sessions` or `ai_simulation_reports`.
4. **Pilot remained truthful** - `TabPilot` stayed telemetry-centered and did not regain runtime-probe or parity/operator-diagnostic clutter.
5. **Dormant code was preserved intentionally** - `TabSimulator.tsx`, `TabQuality.tsx`, and `PilotParityDiagnostics.tsx` remain in repo as dormant source rather than being deleted in this pass.
**Accepted Final Discipline:**
- Normal `/admin/cesarin` operator UX no longer exposes `Simulador`, `Calidad / QA`, runtime parity, or `Sonda del runtime real` as ordinary operator truth.
- The accepted change is bounded to operator exposure reduction, not backend/schema repair.
- Normal operator navigation no longer attempts `ai_simulation_sessions` or `ai_simulation_reports`.
- `TabPilot` remains telemetry-centered.
- Dormant simulator/quality/diagnostic files remain preserved in source and are not claimed deleted.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim backend/schema repair.
- This log does not claim Supabase migration work.
- This log does not claim storefront runtime changes.
- This log does not claim prompt/capsule/routing changes.
- This log does not claim checkout/payment/provider work.
- This log does not claim service-worker/runtime-build redesign.
- This log does not claim global deletion of simulator/lab residue.
- This log does not claim browser/E2E proof.
**Explicit Minor Residual Risk:**
- `TabCaseDrafts` still contains `qa_simulation` source semantics and may label historical drafts as `Simulación QA`.
- Dormant `TabSimulator.tsx`, `TabQuality.tsx`, and `PilotParityDiagnostics.tsx` could be re-exposed later if re-imported.
- Acceptance is strong at shell/source level rather than browser E2E.
**Outcome:**
`Cesarin OS Operator UX Truthfulness Reduction` is now formally canonized as `ACCEPT WITH MINOR RESIDUAL RISK`. What is accepted is precise and bounded: normal `/admin/cesarin` operator UX no longer presents simulator/runtime-diagnostic surfaces as usable operator truth, while dormant source remains preserved and no adjacent backend/storefront/schema fronts are reopened.

### Cesarin OS Operator Consolidation Phase 1 - 23 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded Cesarin OS admin/operator surface consolidation only. This records the accepted primary-shell consolidation and does not reopen storefront runtime, search, prompt/capsule/routing, checkout/payment/provider logic, schema work, simulator/storefront parity, or a broad Cesarin OS redesign.
**Accepted implementation source:** commit `748ce673c37bb0951114f070854afe606717b5e8` (`Consolidate Cesarin OS operator surface`).
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
The full Cesarin OS cold audit found that the strongest operational surface was `PilotTelemetry`, the canonical queue was `TabImprovements`, and `ReviewDrawer` was useful but incompletely wired from the main shell. At the same time, the primary operator surface still exposed misleading or dead-weight paths: hidden `probeCesarinTrace()` writes on mount, duplicate `TabLearning` behavior, `TabInterventions` without an accepted real recommendation producer for primary operator truth, developer-facing `TabRepoGraph`, and a cluttered `TabPilot` that mixed telemetry with pending orders, runtime probe, parity diagnostics, manual runbook/checklist, readiness claims, pilot settings writes, and pilot feedback submission.
**Implementation / Audit Sequence:**
1. **Hidden page-open write was removed** - `AdminCesarinOS.tsx` no longer imports or calls `probeCesarinTrace()`.
2. **Review state wiring was completed** - the main Cesarin OS shell now passes `onMarkSignal={handleMarkSignal}` into `ReviewDrawer`, allowing saved review outcomes to update shared signal state through the existing hook/service path.
3. **Duplicate or misleading primary surfaces were removed from primary navigation** - `TabLearning` and `TabInterventions` are no longer exposed through the primary Cesarin OS shell.
4. **Developer diagnostic material left the operator-primary surface** - `TabRepoGraph` was removed from the Concepts operator surface while the underlying diagnostic component/service code remained in source.
5. **Pilot became telemetry-centered** - `TabPilot` was reduced to a wrapper around `PilotTelemetry`.
6. **Pilot clutter was removed from the main operator path** - pending-orders block, runtime probe, parity diagnostics, manual runbook/checklist, pilot settings writes, and pilot feedback submission were removed from the main Pilot operator path.
7. **Primary operator surfaces stayed preserved** - Persona, Knowledge, Rules, Simulator, Analytics, Quality, Pilot, Improvements, Concepts, and Case Drafts remain primary Cesarin OS surfaces.
**Accepted Final Discipline:**
- The primary Cesarin OS flow is now centered on Observe / Review / Act / Verify through `PilotTelemetry`, `ReviewDrawer`, and `TabImprovements`.
- Cesarin OS mount no longer performs the removed hidden probe write.
- Main-shell ReviewDrawer saves can now update signal state through the existing supported path.
- Underlying diagnostic/service code was not deleted merely to reduce the primary surface.
- Simulator lab remains preserved and still uses the existing admin simulation path.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim storefront runtime changes.
- This log does not claim prompt/capsule/routing changes.
- This log does not claim checkout/payment/provider work.
- This log does not claim schema changes.
- This log does not claim deletion of underlying diagnostic/service code.
- This log does not claim a broad Cesarin OS redesign from zero.
- This log does not claim full Cesarin OS completion.
- This log does not claim all Cesarin OS fragmentation is solved globally.
- This log does not claim simulator/storefront parity.
- This log does not claim full typecheck health.
**Explicit Minor Residual Risk:**
- `TabLearning.tsx`, `TabInterventions.tsx`, and `TabRepoGraph.tsx` still exist in source and could be re-exposed later if re-imported or re-routed.
- `ReviewDrawer.tsx` still has a stale comment referencing `TabLearning`; this is comment-only residue, not behavior.
- Full `npm run typecheck` remains blocked by pre-existing unrelated `CustomerProfile.tier` fixture typing errors.
- No browser/e2e run was performed; acceptance is source inspection plus focused unit tests.
**Outcome:**
`Cesarin OS Operator Consolidation Phase 1` is now formally canonized as `ACCEPT WITH MINOR RESIDUAL RISK`. What is accepted is precise and bounded: the primary Cesarin OS operator surface is less fragmented and more truthful around real telemetry, review, signal-state update, and improvement queue flow, without reopening storefront/runtime/search/checkout/provider/schema fronts or claiming total Cesarin OS completion.

### Césarín Storefront Grounded Capsule Message Coherence Fix - 22 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted bounded storefront/runtime coherence fix only. This records the accepted client `product_search_integrity` capsule branch fix and does not reopen Supabase functions, product retrieval, capsule execution, prompt/routing, checkout/payment/provider logic, schema, admin analytics redesign, or broader storefront architecture.
**Accepted implementation source:** commit `58a1881b5f7bc39983f626658e258095a36948f5` (`Fix grounded capsule storefront message desync`).
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
Admin `response_text` was already grounded because it logged `capsuleContract.customer_response_draft`, and admin `offered_products` matched the storefront UI cards. The storefront chat bubble could still diverge because the client capsule product-search path returned a later rebuilt `message` after telemetry logging through the `finalMessage` / `humanizedMessage` / `conciseMessage` shaping corridor.
**Implementation / Audit Sequence:**
1. **Divergence corridor stayed bounded** - the implementation targeted only `src/services/concierge.service.ts` in the client `product_search_integrity` capsule branch after admin telemetry logging and before returning the UI message.
2. **Grounded capsule truth remained authoritative for this branch** - the guard preserves `capsuleContract.customer_response_draft` when the draft is supported by visible catalog/product truth strongly enough for the same turn.
3. **Late shaping remains allowed when safe** - compacting and humanization still apply when they preserve grounded capsule truth and do not materially weaken or contradict it.
4. **UI/hook behavior stayed contract-aligned** - `useAIConcierge` still consumes the returned `message`, and `AIConcierge` still renders that message with the same product cards; the fix corrects the service return value rather than redesigning the UI.
5. **Regression coverage stayed focused** - service/UI regressions prove grounded capsule text survives to storefront output, product cards remain coherent with the message, and harmless prefix compaction still works where it preserves grounded truth.
**Accepted Final Discipline:**
- Admin `response_text` continues to log `capsuleContract.customer_response_draft`.
- Admin `offered_products` and storefront UI cards remain aligned.
- Storefront chat output in the client `product_search_integrity` branch no longer depends solely on a weakened late-shaped message when grounded capsule truth is available for that same turn.
- The fix is a bounded storefront/runtime coherence correction, not a new architecture lane.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Supabase function changes.
- This log does not claim product retrieval changes.
- This log does not claim capsule execution changes.
- This log does not claim prompt/routing redesign.
- This log does not claim checkout/payment/provider work.
- This log does not claim schema changes.
- This log does not claim admin analytics redesign.
- This log does not claim broader storefront architecture convergence.
- This log does not claim all message-shaping issues are solved globally.
- This log does not claim semantic-proof grounding.
**Explicit Minor Residual Risk:**
- Groundedness preservation is heuristic rather than semantic proof.
- Drafts without explicit product-name anchors may still qualify through bounded catalog-truth cues.
- Full `npm run typecheck` remains blocked by pre-existing unrelated `CustomerProfile.tier` fixture typing errors outside the touched files.
**Outcome:**
`Césarín Storefront Grounded Capsule Message Coherence Fix` is now formally canonized as `ACCEPT WITH MINOR RESIDUAL RISK`. What is accepted is precise and bounded: the client `product_search_integrity` capsule storefront return path now protects grounded capsule/admin response truth from later weakening while preserving existing product cards, admin telemetry, and non-capsule behavior.

### Conversational Conversion Intelligence — Probe Readout Filter - 22 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted probe-readout hygiene pass only. This records the accepted admin conversion readout filter and does not reopen storefront/runtime/search behavior, prompt/routing/capsule work, checkout/payment/provider logic, schema work, exposure rules, operator queue logic, or broader analytics redesign.
**Accepted implementation source:** commit `ee841def00c7fc23c5696a8207e88c9d94e3b3de` (`fix: filter probe traffic from conversion readout`).
**Codex final verdict:** `ACCEPT WITH MINOR RESIDUAL RISK`.
**Problem Identified:**
Conversational Conversion Intelligence Phase 1 was already accepted as a read-only Measurement-to-Decision readout, but probe/synthetic activation windows could still contaminate ordinary commercial interpretation when `metadata.activation_probe` traffic was mixed invisibly into the default conversion readout.
**Implementation / Audit Sequence:**
1. **Readout-only scope was preserved** - the implementation stayed bounded to the admin conversion readout path and did not mutate storefront/runtime behavior.
2. **Probe-marked traffic gained truthful handling** - traffic marked through `metadata.activation_probe` is excluded from the default commercial conversion readout rather than mixed into ordinary commercial counts.
3. **Admin visibility stayed compact** - the existing admin analytics surface exposes a compact excluded-probe summary so probe traffic is not silently erased.
4. **Accepted Phase 1 read-only nature stayed intact** - the pass did not add optimization logic, causal uplift claims, or a broader analytics platform.
**Accepted Final Discipline:**
- This is a bounded readout-only hygiene closure.
- Probe-marked traffic is excluded from the default commercial conversion readout.
- A compact excluded-probe summary is exposed in admin analytics.
- The implementation remains inside the accepted admin conversion readout path.
- The readout remains observational and decision-support only; it does not optimize conversion.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim storefront behavior changes.
- This log does not claim checkout, payment, or provider changes.
- This log does not claim prompt, routing, or capsule changes.
- This log does not claim schema changes.
- This log does not claim broader dashboard/platform redesign.
- This log does not claim all synthetic traffic is solved.
- This log does not claim causality or commercial optimization impact.
- This log does not reopen `AI Reliability Phase 1`, `Checkout Execution Bridge`, `Storefront AI Exposure Graduation`, `Cesarin OS Governed Operator Queue Convergence`, or the accepted Phase 1 readout scope.
**Explicit Minor Residual Risk:**
- `activation_probe: 'true'` is implemented but not directly test-covered.
- `excludedProbeSessions` may not count every indirectly excluded session when exclusion happens only via order-id linkage.
- Probe product ids may still be queried from `products` lookup even though they do not enter commercial counts or product summaries.
- Unmarked synthetic traffic remains indistinguishable from ordinary traffic.
**Outcome:**
`Conversational Conversion Intelligence — Probe Readout Filter` is now formally canonized as `ACCEPT WITH MINOR RESIDUAL RISK`. What is accepted is precise and bounded: explicitly probe-marked traffic no longer contaminates the default commercial conversion readout, admin analytics exposes a compact excluded-probe summary, and the front remains a read-only hygiene pass rather than an optimization or analytics-platform expansion.

### Conversational Conversion Intelligence — Phase 1: Measurement-to-Decision Readout - 21 de abril de 2026
**Scope:** Documentation/canon reconciliation for the accepted Cesarin OS analytics readout only. This records the accepted read-only measurement-to-decision front and does not reopen storefront/runtime behavior, prompt/routing/capsule work, checkout/payment/provider logic, exposure rules, or governed operator queue logic.
**Accepted implementation source:** commit `b4cb44744102b57adbc3572908d4baa88dbc9e05`.
**Codex final verdict:** `ACCEPT WITH EXPLICIT RESIDUAL RISK`.
**Standing regression gate at acceptance:** `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`.
**Problem Identified:**
The project had accepted implementation truth for a bounded conversational conversion readout, but canon still needed to record the exact accepted scope, data surfaces, output shape, and residual risk without inflating the work into a broader analytics platform or conversion-optimization wave.
**Implementation / Audit Sequence:**
1. **Accepted scope stayed read-only** - the front reconstructs conversion visibility from existing persisted conversion events and order attribution; it does not mutate storefront/runtime behavior.
2. **Accepted placement stayed inside existing Cesarin OS analytics** - the readout lives in the already-existing Cesarin OS analytics surface rather than opening a new dashboard/platform front.
3. **Accepted data surfaces were bounded exactly** - the readout uses `conversation_conversion_events`, `orders`, and `products`.
4. **Accepted output shape stayed measurement-to-decision** - the readout exposes session-level funnel reconstruction, aggregate counts by event type, source counts, CTA kind counts, cart mutation result counts, drop-off counts, and product-level summaries.
5. **Business-stage truth stayed explicit** - the readout is structurally active, but early live data may still be sparse; it enables observation and decision-making, not automatic conversion optimization.
**Accepted Final Discipline:**
- This is a bounded, read-only, production-grade conversion readout.
- The accepted data surfaces are `conversation_conversion_events`, `orders`, and `products`.
- The accepted visibility is aggregate and session-level.
- Funnel reconstruction is derived from existing conversion events and order attribution.
- Product-level summaries are accepted as readout summaries, not as proof of full order-item attribution.
- The readout lives inside the existing Cesarin OS analytics surface.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim optimization logic.
- This log does not claim prompt, routing, or capsule changes.
- This log does not claim checkout, payment, or provider changes.
- This log does not claim exposure rule changes.
- This log does not claim operator queue logic changes.
- This log does not claim dashboard/platform overbuild.
- This log does not reopen `AI Reliability Phase 1`, `Checkout Execution Bridge`, `Storefront AI Exposure Graduation`, or `Cesarin OS Governed Operator Queue Convergence`.
**Explicit Residual Risk:**
- Product-level order attribution is metadata-backed, not full order-item attribution.
- Some edge-case truth labels are code-proven rather than directly asserted in focused tests.
- This residual risk is accepted as non-blocking and remains explicit.
**Outcome:**
`Conversational Conversion Intelligence — Phase 1: Measurement-to-Decision Readout` is now formally canonized as `ACCEPT WITH EXPLICIT RESIDUAL RISK`. What is accepted is precise and bounded: a read-only Cesarin OS conversion readout over `conversation_conversion_events`, `orders`, and `products`, with session-level and aggregate measurement visibility for decision-making only, not optimization or adjacent-front reopening.

### Cesarin OS Governed Operator Queue Convergence - 17 de abril de 2026
**Scope:** Admin-only operator workflow convergence across the existing governed surfaces: `PilotTelemetry`, `ReviewDrawer`, `TabLearning`, `TabInterventions`, `TabImprovements`, `admin-improvement.service.ts`, `admin-improvement-workflow.service.ts`, the bounded migration for persisted lineage, and tightly relevant admin workflow tests. This lane did not reopen storefront/runtime/search/checkout work.
**Accepted implementation source:** commit `2e89915a53b6d8a83bd97559c4c73ba3ac56c795`.
**Problem Identified:**
Cesarin OS operator follow-up was fragmented across strong but partially disconnected admin surfaces. `PilotTelemetry` remained the load-bearing read surface over `ai_analytics`, `ReviewDrawer` remained the strongest governed review surface, and `TabImprovements` was the obvious persisted work queue, but `Learning` and `Interventions` still behaved like parallel intake/decision systems. Approved intervention recommendations could remain a separate dead-end workflow instead of becoming linked closure work in the canonical queue.
**Implementation / Audit Sequence:**
1. **Cold audit bounded the lane to admin workflow convergence** - Codex verified that this front was not storefront/runtime/search/checkout work and must not reopen prompts, capsules, product search, checkout, payment, or provider behavior.
2. **Canonical queue lineage was persisted** - `cesarin_improvement_items` now supports the two accepted persisted origins: `review_interaction` and `intervention_recommendation`.
3. **Reviewed interactions retained real-interaction lineage** - reviewed real interactions enter the canonical queue via `analytics_id`.
4. **Approved recommendations gained direct handoff lineage** - approved intervention recommendations enter via `intervention_recommendation_id` plus `intervention_signal_id`.
5. **Promotion into the queue became durable** - `createImprovementItemFromRecommendation(...)` creates or reuses canonical queue items instead of leaving approved recommendations as a separate closure path.
6. **Intervention approval follows the accepted chain** - `TabInterventions` approval executes `recordOperatorDecision(...)`, then `createImprovementItemFromRecommendation(...)`, then `acknowledgeSignal(...)`.
7. **Closure remained in one persisted queue** - `TabLearning` and `TabInterventions` are intake/handoff surfaces, while `TabImprovements` is the persisted closure queue for ownership, execution notes, artifact evidence, status, and closure.
8. **Standing gate remained green** - the accepted implementation was audited with `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`.
**Accepted Final Discipline:**
- `cesarin_improvement_items` is the canonical governed operator work queue.
- Reviewed real interactions enter via `analytics_id`.
- Approved intervention recommendations enter via `intervention_recommendation_id` plus `intervention_signal_id`.
- `Learning` and `Interventions` are intake/handoff surfaces.
- `TabImprovements` is the persisted closure queue where ownership, execution notes, artifact evidence, status, and closure live.
- Operator workflow fragmentation is fixed by converging follow-up into one persisted governed queue.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim storefront/runtime/prompt/capsule/search changes.
- This log does not claim checkout/payment/provider changes.
- This log does not claim a giant admin redesign.
- This log does not claim autonomous intervention execution.
- This log does not reopen any closed storefront, runtime, search, or checkout lane.
**Residual Design Note:**
Minor schema tension remains around FK `on delete set null` versus required lineage fields. This is a residual design note, not an acceptance blocker.
**Outcome:**
`Cesarin OS Governed Operator Queue Convergence` is now formally canonized as `ACCEPT`. What is accepted is precise and bounded: Cesarin OS operator follow-up now converges into `cesarin_improvement_items` as the single governed persisted queue, while `Learning` and `Interventions` remain intake/handoff surfaces and `TabImprovements` owns persisted closure.

### Storefront AI Pilot Gate Graduation & Controlled All-User Exposure - 15 de abril de 2026
**Scope:** `src/App.tsx`, `src/lib/pilot-activation.ts`, `src/pages/admin/AdminCesarinOS.tsx`, and tightly relevant gate/debug tests only. This lane covered storefront exposure gating truth only. It did not reopen runtime redesign, search tuning, checkout/provider architecture, or storefront visual work.
**Problem Identified:**
Canon and operator wording still described Césarín storefront exposure as a dual gate (`global AND pilot`) even after the product/canon state had already advanced to unrestricted pilot readiness. The storefront therefore carried a truth gap between the accepted business state and the actual exposure model recorded in docs and operator surfaces.
**Implementation / Audit Sequence:**
1. **Cold audit bounded the lane to exposure only** - Codex verified that the authorized front was visibility gating only and explicitly rejected reopening runtime, prompts, checkout, PRODUCT_SEARCH, or storefront design lanes.
2. **Accepted exposure matrix replaced the retired dual gate** - the accepted storefront contract became exact and bounded: `global off + pilot off => hidden`, `global off + pilot on => visible via bounded pilot preview/QA override`, `global on + pilot off => visible to ordinary storefront users`, and `global on + pilot on => visible to ordinary storefront users, with pilot retained only as debug/access-path context`.
3. **Pilot authorization was preserved only as a bounded override** - pilot authorization remained acceptable only as preview/QA override when global exposure is off and as debug/access-path context when global exposure is already on; it no longer remains a requirement for ordinary all-user exposure once the global flag is on.
4. **Admin/debug truth was required to match the new reality** - accepted operator/debug wording had to stop restating the old `global AND pilot` rule and instead describe the actual storefront exposure truth directly.
5. **Acceptance audit kept causality bounded** - Codex explicitly recorded that the observed `degraded-ux-timeout-01` failure on the standing gate was unrelated runtime latency noise outside this front's causality and not evidence against the exposure-gating acceptance.
**Accepted Final Discipline:**
- This lane is accepted as exposure-gating work only.
- The old dual-gate requirement is no longer the storefront truth.
- `is_ai_assistant_enabled` is the authoritative ordinary-user exposure flag.
- Pilot authorization remains only as bounded preview/QA override when global exposure is off.
- When global exposure is already on, pilot remains only as debug/access-path context.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim runtime/prompt/capsule/routing redesign.
- This log does not claim checkout/payment/provider work.
- This log does not claim PRODUCT_SEARCH tuning.
- This log does not claim compatibility/kitting expansion.
- This log does not claim storefront redesign.
**Outcome:**
`Storefront AI Pilot Gate Graduation & Controlled All-User Exposure` is now formally canonized as `ACCEPT`. What is accepted is precise and bounded: storefront exposure truth now centers on the global assistant flag for ordinary users, while pilot authorization remains only as a bounded preview/QA override when global exposure is off.

### Storefront Conversational Checkout Execution Bridge - 14 de abril de 2026
**Scope:** `src/services/concierge.service.ts`, the existing assistant CTA surface in `src/components/ui/ai/AIConcierge.tsx`, the focused bridge regressions, and documentation/canon reconciliation for this bounded storefront front only. This lane covered orchestration exposure into already-existing checkout/order/payment continuation surfaces; it did not reopen checkout redesign, provider architecture, visual redesign, or autonomous payment execution.
**Problem Identified:**
The accepted storefront already had real checkout persistence, open-order recovery, and payment continuation on existing storefront surfaces, but Césarín still stopped at advisory truth. The remaining gap was orchestration exposure only: the assistant could detect `READY_TO_CHECKOUT`, open recoverable order, and pending payable order states, but it could not yet hand the customer into the already-existing storefront execution surfaces when those states were true.
**Implementation / Audit Sequence:**
1. **Cold readiness audit bounded the front before implementation** - Codex verified that the real gap was orchestration exposure rather than checkout/provider architecture, and defined the exact eligibility contract for advisory-only, checkout handoff, open-order continuation, and payment continuation.
2. **Accepted implementation stayed on the existing CTA surface only** - commit `ca9b100de9d17c97184320f6b8ae3627fbac585f` (`feat: bridge concierge checkout execution handoffs`) added a thin allowlist mapping in `src/services/concierge.service.ts` so the assistant now emits route handoff only through the existing `message.action` surface. `next_step_view` remained product-only and was not expanded.
3. **Accepted eligible route handoffs are exact and bounded** - the bridge now uses only the already-existing storefront routes `Abrir checkout` -> `/checkout`, `Retomar orden abierta` -> `/orders/{id}`, and `Continuar pago pendiente` -> `/payment/pending?order_id={id}`.
4. **Non-eligible states stayed advisory-only** - checkout/order states outside the exact allowlist remain text-only; no assistant-created orders, no assistant-triggered payment creation, and no autonomous payment execution were introduced.
5. **Cold acceptance audit confirmed bounded scope and green regression truth** - Codex verified that the bridge stayed within authorized scope, preserved `message.action` as the bridge surface, left `next_step_view` product-only, and that the standing regression gate remained green at `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`.
**Accepted Final Discipline:**
- This lane is accepted as bounded orchestration bridge work only.
- The accepted bridge surface is `message.action`.
- The accepted eligible route handoffs are `/checkout`, `/orders/{id}`, and `/payment/pending?order_id={id}` only.
- CTA labels are exact and bounded: `Abrir checkout`, `Retomar orden abierta`, and `Continuar pago pendiente`.
- Non-eligible checkout/order states remain advisory-only.
- The accepted runtime baseline remains `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim checkout redesign.
- This log does not claim a payment/provider architecture wave.
- This log does not claim autonomous payment execution.
- This log does not claim `next_step_view` expansion for this front.
- This log does not claim storefront visual redesign.
- Residual risk remains explicit: the bridge is route handoff through the existing CTA behavior, not in-chat autonomous payment execution.
**Outcome:**
`Storefront Conversational Checkout Execution Bridge` is now formally canonized as `ACCEPT`. What is accepted is precise and bounded: Césarín may now expose truthful route-based handoff into already-existing checkout/order/payment continuation surfaces when existing capsule truth says that handoff is eligible, while non-eligible states remain advisory-only.

### AI Reliability / Evals / Operational Excellence — Phase 1 Acceptance Harness Hardening + Golden Eval Baseline - 13 de abril de 2026
**Scope:** `scripts/simulate_cesarin.ts`, the accepted frozen scenario/threshold gate, targeted bounded runtime truth in `supabase/functions/customer-intelligence/*`, and the canonical Phase 1 baseline artifact only. This lane covered acceptance harness hardening plus runtime recovery against that gate; it did not reopen storefront UX, commercial behavior, Prompt Ops, Gemini Runtime Wave 1, or a new provider/architecture wave.
**Problem Identified:**
The repository already contained meaningful telemetry, simulation, and review substrate, but it lacked one trustworthy authenticated acceptance gate and one recovered runtime baseline that could be used as an honest operational quality reference. Early Pass 1 gains were partially inflated by threshold/calibration softening, so the lane could not close until the final recovery was proven again under the frozen accepted harness without further softening.
**Implementation / Audit Sequence:**
1. **Phase 1 harness was hardened and accepted as infrastructure** - the canonical runner became `npm run test:qa` through `scripts/simulate_cesarin.ts`, using authenticated runtime invocation and the accepted scenario/threshold pack.
2. **Pass 1 was accepted only with bounded follow-up** - the audit explicitly recorded that some visible improvement came from threshold inflation and contract/calibration effects rather than clean runtime recovery, so the lane stayed open.
3. **Pass 2 delivered bounded real runtime recovery** - focused runtime fixes improved policy, inventory, and product-search truth routing without further harness, manifest, or threshold softening. This moved the canonical baseline materially forward while keeping the gate honest.
4. **Pass 3 closed the remaining hard failures under the frozen gate** - bounded runtime fixes hardened high-confidence product-search and bounded checkout/product turns to `USE_CAPABILITY` when clarify-first drift was incorrect, and reduced dead Analyst wait only for specific truthful turn families. No harness, scenario, or threshold changes occurred in Pass 3.
5. **Final closure audit accepted the recovered state with explicit residual risk** - Codex verified that the final `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0` result was legitimate under the frozen `phase-1-strict` harness and that Pass 3 stayed within bounded runtime scope.
**Accepted Final Discipline:**
- Phase 1 scope is accepted as `Acceptance Harness Hardening + Golden Eval Baseline` only.
- The accepted harness remains the standing regression gate for this scope.
- The accepted recovered final baseline is `PASS: 9`, `DEGRADED: 0`, `FAIL: 0`, `BLOCKED: 0`.
- Recovery credit is bounded honestly: the final accepted state is attributed to the bounded runtime fixes culminating in Pass 2 + Pass 3 under the frozen harness, not to the earlier Pass 1 inflation/calibration history.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim storefront redesign.
- This log does not claim a new commercial behavior lane.
- This log does not claim a new architecture/provider modernization wave.
- This log does not claim permanent immunity from future regressions or runtime drift.
- This log does not claim reliability proof beyond the defined Phase 1 suite.
**Outcome:**
`AI Reliability / Evals / Operational Excellence` Phase 1 is now formally canonized as `ACCEPT WITH EXPLICIT RESIDUAL RISK`. What is accepted is precise and bounded: the harness as standing infrastructure, the recovered final runtime baseline for the defined Phase 1 suite, and the lane outcome for Phase 1 only.

### Gemini Runtime Modernization — Wave 1 (429 Resilience Core) - 8 de abril de 2026
**Scope:** `supabase/functions/_shared/gemini-api.ts`. Backend AI transport and resilience layers.
**Problem Identified:**
The raw REST `gemini-2.5-pro` fetches were failing fast under load (`429 RESOURCE_EXHAUSTED`). Supabase edge isolation lacks reliable retry logic out-of-the-box, resulting in immediate storefront fallback when quota limits were temporarily exceeded.
**Implementation / Audit Sequence:**
1. **AI Architecture Audit Executed** - Subagent identified the REST fallback, pseudo-tools, regex extraction, and lack of exponential backoff. Instructed to implement only the transport hardening.
2. **Transport Wrapper Created** - Commit `35786ce` introduced a custom `fetchWithRetry` proxy for `geminiGenerateContent` and `geminiEmbedText`, isolating fetch behavior.
3. **Exponential Backoff Deployed** - `fetchWithRetry` uses bounded 3-attempt backoff with jitter to survive 429 and 50x conditions.
4. **Micro-fix for Abort-Aware Sleeps** - Commit `c5c967a` added `sleepAbortAware` to guarantee the `AbortSignal` from the parent fetch context isn't swallowed during retry delays.
5. **Intentional SDK Rejection** - The official `@google/genai` SDK was deliberately **not** adopted to avoid environment incompatibilities in the Deno edge runtime and to prevent semantic drift in the heavily-tuned `customer-intelligence` textual workflows.
**Accepted Final Discipline:**
- Transport logic is now decoupled into resilient proxies within `_shared/gemini-api.ts`.
- Rate limits no longer instantly degrade the storefront.
- The legacy `customer-intelligence` regex and textual-tool logic remains functionally frozen.

**Residual Truth Safeguards / Explicit Non-Claims:**
- **Not a Framework Migration**: The edge functions still use manual REST `fetch`.
- **Not a Prompt Refactor**: System instructions were not migrated to the native `systemInstruction` property.
- **Not a Tool Output Refactor**: Function calling continues to use synthetic text-based responses instead of Gemini's `Structured Outputs`.
- **Not a Storefront Change**: Did not touch UI or conversational design. Acceptance status: **ACCEPT**.

### Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/types/order.ts`, `src/services/orders.service.ts`, `src/services/storefront-order-tracking.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, and the focused storefront runtime/assistant regressions tied to those surfaces. Authenticated storefront post-purchase assistance only.
**Problem Identified:**
The accepted storefront already had real persisted order/payment truth on existing order surfaces, but the assistant path still lacked one bounded authenticated post-purchase lane that could answer payment confirmation, order status, shipping state, and persisted guide questions from that same truth. The remaining need was not refunds, cancellations, courier scraping, or a broader CRM console. It was one narrow storefront ability to read bounded authenticated recent order truth conversationally instead of collapsing those turns into generic fallback/policy language.
**Implementation / Audit Sequence:**
1. **A bounded authenticated order-tracking capsule/runtime contract was added** - the accepted commit `24b1afd027ae96d04cf6ca579b19795fbc83a123` (`feat storefront authentic conversational order tracking`) extended `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, and `src/services/ai-capsule-orchestrator.service.ts` so the storefront now carries bounded `authenticated_order_tracking` and `order_tracking_signal` truth on this post-purchase path.
2. **Read-only order resolution now reuses persisted storefront order truth** - the same accepted commit added `src/services/storefront-order-tracking.service.ts` and extended `src/services/orders.service.ts` / `src/types/order.ts` so assistant-side order tracking reads authenticated persisted order data only, including persisted tracking number truth when present. Payment/order/tracking summaries reuse canonical storefront order/payment helpers rather than inventing a parallel lifecycle model.
3. **Hydration stays bounded and authenticated** - the same accepted commit bounds lookup to recent relevant orders and supports explicit order-number lookup only inside that bounded set. There is no guest fake access and no broad full-history browser in chat.
4. **Runtime routing now prefers the authenticated capsule path** - the same accepted commit updated `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and `supabase/functions/customer-intelligence/intent-guardrails.ts` so `ORDER_TRACKING` storefront routing now prefers the authenticated capsule path instead of generic fallback/policy behavior on these turns.
5. **Storefront responses stayed message-only and bounded** - the same accepted commit updated `src/services/concierge.service.ts` so authenticated post-purchase responses remain message-only, do not surface catalog/product help, and degrade honestly for guest/no-order/no-tracking cases. Acceptance closed cleanly as `ACCEPT` with no micro-fix required before canonization.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded authenticated conversational order tracking / post-purchase resolution.
- The capsule/runtime now carries bounded `authenticated_order_tracking` and `order_tracking_signal` truth.
- Order-tracking truth is grounded only in authenticated persisted order data.
- Hydration is bounded to recent relevant orders and may support explicit order-number lookup only inside that bounded set.
- Payment/order/tracking summaries reuse canonical storefront order/payment truth rather than inventing a parallel lifecycle model.
- `ORDER_TRACKING` storefront routing now prefers the authenticated capsule path instead of generic fallback/policy behavior.
- Assistant responses for these turns remain message-only and do not surface catalog/product help.
- Guest/no-order/no-tracking cases degrade honestly.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim guest access to order truth.
- This log does not claim refunds.
- This log does not claim cancellations.
- This log does not claim order edits.
- This log does not claim external courier API scraping.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a full order-history browser or CRM panel in chat.
**What Did Not Change:**
- No Cesarin OS/admin lane was reopened.
- No prior storefront/core lane was reopened or replaced.
- No checkout/payment flow redesign was introduced.
- No order mutation path was introduced.
- No external courier integration was introduced.
**Outcome:**
Storefront Authentic Conversational Order Tracking & Post-Purchase Resolution is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: authenticated customers can now ask post-purchase payment/status/tracking questions and receive answers from real persisted order truth when a bounded relevant order match exists, while the storefront stays honest about missing authentication, missing relevant orders, or absent persisted guide data.

### Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder) - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/services/storefront-replenishment.service.ts`, `src/components/ui/ai/AIConcierge.tsx`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/soft-continuity.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront capsule/stage/runtime regressions tied to those surfaces. Authenticated storefront reorder/replenishment assistance only.
**Problem Identified:**
The accepted storefront already had bounded authenticated reorder truth on orders surfaces, but the assistant path still lacked one equally bounded conversational replenishment lane for explicit authenticated repeat-purchase intent. The remaining need was not a history browser or subscription system. It was a narrow storefront ability to turn explicit reorder intent into grounded reorder help using real authenticated order/order-item history plus current catalog truth.
**Implementation / Audit Sequence:**
1. **Authenticated replenishment resolution was added as a bounded storefront service** - the accepted commit `ba544bc82346ab856a97de0124bb9872f00adb54` (`feat storefront frictionless routine replenishment`) introduced `src/services/storefront-replenishment.service.ts` so explicit authenticated reorder intent resolves against recent reorderable persisted orders and existing shared reorder planning truth instead of pretending the turn is a normal catalog search or fabricating historical catalog state.
2. **Capsule/runtime truth now carries explicit reorder grounding** - the same accepted commit extended the storefront capsule/runtime path through `src/lib/ai-capsule-schemas.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/soft-continuity.ts`, and `supabase/functions/customer-intelligence/tool-selection.ts` so this lane now carries bounded `replenishment_signal` and `retrieval_source = AUTHENTICATED_REORDER` truth when explicit authenticated reorder intent is actually grounded.
3. **Current catalog truth stays authoritative before surfacing anything** - the same accepted commit keeps replenishment candidates revalidated against the live catalog before surfacing. Historical items that are inactive, discontinued, invalid-variant, or otherwise unavailable do not return as ready-to-repeat results.
4. **Stage 5 and storefront surfaces stayed bounded to existing help/action surfaces** - the same accepted commit updated `src/lib/cesarin-stage5.ts`, `src/services/concierge.service.ts`, and `src/components/ui/ai/AIConcierge.tsx` so the lane uses the existing storefront message / next-step / add-to-cart surfaces only. Stage 5 may surface `ADD_READY` only when current catalog truth still supports direct add with grounded quantity and variant intact; otherwise the lane stays `REVIEW_ONE` so PDP/manual confirmation can remain honest.
5. **Acceptance closed cleanly without a residual micro-fix** - the acceptance audit verdict is `ACCEPT`, and no micro-fix was required before canonization. This audit log records the accepted storefront lane as one bounded closure rather than inflating it into subscriptions, CRM, or broader reorder-platform claims.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded authenticated routine replenishment / conversational reorder.
- Replenishment truth is grounded only in real authenticated order / order-item history.
- Replenishment candidates are revalidated against current catalog truth before surfacing.
- Historical items that are inactive, discontinued, invalid-variant, or unavailable are not resurrected as ready-to-repeat.
- The capsule/runtime now carries bounded `replenishment_signal` and `AUTHENTICATED_REORDER` truth on this path.
- Stage 5 may surface `ADD_READY` only when current catalog truth supports direct add.
- Stage 5 stays `REVIEW_ONE` when PDP/manual confirmation is still needed.
- Quantity and variant-aware add payloads stay grounded in current catalog truth.
- The lane uses existing storefront message / next-step / add-to-cart surfaces only.
- The lane is bounded to explicit authenticated reorder intent only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim guest reorder memory.
- This log does not claim a full purchase-history browser.
- This log does not claim subscription logic.
- This log does not claim auto-billing or predictive reorder.
- This log does not claim CRM expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim guaranteed reorder for historical items that no longer validate.
**What Did Not Change:**
- No Cesarin OS/admin lanes were reopened.
- No prior storefront/core lane was reopened or replaced.
- The earlier `Storefront Authenticated Reorder & Catalog Drift Hardening` lane remains authoritative and is not rewritten by this canon entry.
- No new guest memory, subscription, or automatic billing platform was introduced.
- No checkout/payment flow redesign was introduced.
**Outcome:**
Storefront Frictionless Routine Replenishment (1-Click Conversational Reorder) is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: explicit authenticated reorder intent can now resolve through real order history and current catalog truth into either direct add-ready help or honest review-first help, without inflating the storefront into a history browser, subscription system, or predictive reorder engine.

### Césarín OS — Operational Truth Convergence - 3 de abril de 2026
**Scope:** `src/components/admin/cesarin/TabPilot.tsx`, `src/components/admin/cesarin/TabKnowledge.tsx`, `src/components/admin/cesarin/TabConcepts.tsx`, `src/pages/admin/AdminCesarinOS.tsx`, `src/hooks/useAdminKnowledge.ts`, `src/services/admin-knowledge.service.ts`, `src/services/admin-compatibility.service.ts`, and the focused concepts/pilot support tests tied to those surfaces. Cesarin OS/admin operator truth only.
**Problem Identified:**
The accepted Cesarin OS baseline still carried one bounded operator-truth gap across existing pilot and knowledge surfaces. The quick pilot panel had to stop reading like a separate synthetic probe detached from the real conversation-lab session spine, knowledge post-write state had to stop relying on synthetic client truth after persistence, and the concepts workbench still needed truthful persisted operator actions plus a truthful relation summary. The base lane landed first, but it still carried residual truth-alignment gaps that had to close before canonization.
**Implementation / Audit Sequence:**
1. **Accepted main lane landed** - commit `1dc927d9ef5fb53c79ace78837c031f5cd3893a0` (`feat cesarin os operational truth convergence`) moved `TabPilot` onto the real lab/runtime/session spine already used by Conversation Lab, so the pilot quick-probe surface now reads the same bounded persisted session truth rather than a detached local probe model.
2. **Knowledge post-write truth now rehydrates persisted state** - the same accepted main lane changed the knowledge workbench flow so post-write and status-toggle state rehydrates authoritative persisted `store_knowledge` truth after the write instead of fabricating a synthetic client-side post-write node as if it were already the final source of truth.
3. **Concepts workbench now exposes persisted creation and alias mutation** - the same accepted main lane made persisted concept creation plus alias add/remove real inside the existing concepts workbench, rather than leaving those operations outside the operator surface while still describing the workbench as the active compatibility console.
4. **Residual truth-alignment micro-fix closed the remaining gaps** - commit `4bca1373c77e31566b84379b742128f155a7064a` (`fix cesarin os truth alignment residuals`) made pilot truth labeling explicit so a selected historical turn is not presented as the latest real turn and the latest real turn vs displayed selected turn are differentiated truthfully. The same accepted micro-fix also made concept summary relation truth count total incoming + outgoing persisted edges while keeping the detailed relations view explicitly directional.
5. **Residual re-audit verdict is now final closure** - the base lane had residuals, but the accepted residual micro-fix closed the remaining truth gaps. Final status is `ACCEPT`, and this entry records the combined main-lane-plus-micro-fix closure as one bounded Cesarin OS canon line rather than inflating the micro-fix into a separate grand lane.
**Accepted Final Discipline:**
- Pilot now reuses the real lab/runtime/session spine already used by Conversation Lab.
- Pilot truth labeling is now explicit: selected historical turn and latest real turn are distinguished honestly.
- Knowledge post-write state now rehydrates authoritative persisted truth instead of synthetic client truth.
- Concepts workbench now exposes persisted concept creation plus alias add/remove.
- Concept summary relation truth now reflects total incoming + outgoing persisted edges.
- Detailed relations view remains directional, and that limit stays explicit.
- This lane improves operational truth/coherence across targeted Cesarin OS surfaces only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a broader admin architecture rewrite.
- This log does not claim full Cesarin OS completion.
- This log does not claim concept deletion support inside this workbench.
- This log does not claim resolution of the environment-specific hanging `TabPilot.test.tsx` harness.
- This log does not reopen storefront lanes or convert this into a broader Cesarin OS expansion.
**What Did Not Change:**
- No storefront/customer-facing lane was reopened.
- No new admin platform or architecture-from-zero lane was introduced.
- No new claim is made that every Cesarin OS surface is now fully converged.
- No new delete path for concepts was introduced in canon.
- No new claim is made that the environment-specific `TabPilot.test.tsx` harness issue is solved.
**Outcome:**
Césarín OS — Operational Truth Convergence is now formally canonized as `ACCEPT`. The accepted main lane and the accepted residual micro-fix are recorded together as one bounded closure: pilot, knowledge, and concepts surfaces are more truthful about persisted/runtime state, while the remaining non-claims stay explicit and uninflated.
---

### Storefront Proactive Compatibility & Basket Attachment - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/storefront-attachments.ts`, `src/services/storefront-attachments.service.ts`, `src/services/concierge.service.ts`, `src/lib/cesarin-stage5.ts`, and the focused Stage 5 regression covering the attachment gate. Storefront/customer-facing sales flow only.
**Problem Identified:**
The accepted storefront core already had graph substrate and truthful stage shaping, but it still lacked one bounded commercial lane that could use the existing compatibility/concepts graph to attach a relevant secondary product during high-intent product turns without inflating the funnel or inventing generic recommendations.
**Implementation / Audit Sequence:**
1. **Graph-backed attachment lookup was added on the edge** - the accepted commit `bc513026f944f787dabbeaa2f96e4065a7db2b5c` added a bounded `resolve_storefront_attachments` path in `supabase/functions/customer-intelligence/index.ts` and a focused graph resolver in `supabase/functions/customer-intelligence/storefront-attachments.ts`. The resolver reuses the existing compatibility/concepts substrate, accepts only confirmed compatible relations, and filters attachment candidates down to active in-stock catalog products.
2. **Storefront runtime lookup is hard-gated** - the same accepted commit wires the attachment lookup into `src/services/concierge.service.ts` only when the current storefront turn is already strong, single-product, non-approximate, non-compare, and non-exploratory. Weak, exploratory, approximate, compare, and direct factual turns do not get forced attachments.
3. **Stage 5 surfaces the move through existing next-step surfaces** - the same accepted commit extends `src/lib/cesarin-stage5.ts` so the attachment can appear only through existing `next_step_view` / `secondaryAction` surfaces. It does not create a second funnel, a new widget, or a new cart architecture.
4. **Focused regression proof landed** - the same accepted commit added a bounded Stage 5 regression proving the attachment can surface on a strong single-product turn and stays suppressed on a direct fact turn.
5. **Acceptance audit confirmed bounded scope** - the lane was accepted as a single storefront commercial lane, not as a generic recommendation engine or a broader architecture change.
**Accepted Final Discipline:**
- The storefront can now surface one bounded compatible attachment during high-intent product turns.
- The attachment path is graph-backed from the existing compatibility/concepts substrate.
- The attachment resolver is bounded to confirmed, attachable, in-stock, active products.
- Attachment lookup is hard-gated to strong single-product support and suppressed on compare / exploratory / approximate / direct factual turns.
- Stage 5 uses existing `next_step_view` / `secondaryAction` surfaces only.
- The lane improves basket-building / cross-sell capability without opening a second funnel.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim multi-attachment bundles.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a broad ranking-engine rewrite.
- This log does not claim recommendation beyond graph-grounded compatibility truth.
- This log does not claim guaranteed attachment availability for products lacking graph grounding.
**What Did Not Change:**
- No Cesarin OS/admin lanes were reopened.
- No checkout/payment flow was redesigned.
- No general recommendation engine was introduced.
- No multi-attachment behavior was added.
- No broad ranking or memory rewrite was introduced.
- The accepted Waves 1–7 storefront lanes remain authoritative and non-reopened.
**Outcome:**
Storefront Proactive Compatibility & Basket Attachment is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: Cesarin can surface one graph-backed compatible attachment on strong product turns, and the lane remains explicitly limited away from compare/exploratory/approximate/direct-fact turns and away from general recommendation claims.

### Storefront Contextual Cart-Aware Guidance (Pre-Checkout Basket Audit) - 3 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/storefront-attachments.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/services/storefront-cart-audit.service.ts`, `src/hooks/useStorefrontCartDependencyOffer.ts`, `src/lib/domain/cart.ts`, `src/components/cart/CheckoutTransitionStatus.tsx`, `src/components/cart/CartSidebar.tsx`, `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, and the focused cart/checkout readiness tests tied to those surfaces. Storefront cart / checkout-readiness only.
**Problem Identified:**
The accepted storefront attachment lane still left one bounded commercial gap: the active cart could not yet be audited in relevant cart/checkout-readiness contexts for a single graph-backed missing dependency using the existing compatibility/concepts substrate. The correct next move was a narrowly bounded pre-checkout basket audit, not a bundle engine, a checkout rewrite, or a general recommendation system.
**Implementation / Audit Sequence:**
1. **Graph-backed cart audit lookup was added on the edge** - the accepted commit `b3de0cd35975220d027ca0da9ac3634176666c7d` added `resolve_storefront_cart_dependency_offer` in `supabase/functions/customer-intelligence/index.ts` and a focused cart dependency resolver in `supabase/functions/customer-intelligence/storefront-attachments.ts`. The resolver reuses the existing compatibility/concepts graph substrate, limits relations to strict dependency types only, and resolves only active in-stock dependent products.
2. **Cart/checkout runtime lookup stays bounded** - the same accepted commit wires the cart audit through `src/services/storefront-cart-audit.service.ts` and `src/hooks/useStorefrontCartDependencyOffer.ts`, then feeds the result into the shared checkout-readiness contract in `src/lib/domain/cart.ts`. The guidance is advisory only: it can surface in relevant cart/checkout contexts, but proceed/submit remain available unless another real cart issue blocks them.
3. **Existing cart/checkout surfaces render the bounded guidance** - the same accepted commit extends `src/components/cart/CheckoutTransitionStatus.tsx` so the advisory can appear inside the existing readiness surface, and reuses `CartSidebar`, `Checkout.tsx`, and `CheckoutForm.tsx` so the same bounded truth can appear across the existing cart/checkout surfaces only. No second funnel or new widget was introduced.
4. **Focused regression proof landed** - the same accepted commit added bounded coverage for the shared readiness contract, sidebar navigation, and checkout-page integration so the new cart-aware dependency guidance stays advisory, suppresses itself when stronger correction issues already exist, and routes to the missing dependent product path when surfaced.
5. **Acceptance confirmed bounded scope** - the lane was accepted as one storefront cart-readiness lane, not as a bundle mode, not as a multi-warning system, and not as a checkout/payment redesign.
**Accepted Final Discipline:**
- Césarín storefront can now audit the active cart for one graph-backed missing dependency in relevant cart/checkout-readiness contexts.
- The lane reuses the existing compatibility/concepts graph substrate.
- Cart dependency guidance is bounded to strict dependency relation types only.
- Suggested dependent products are filtered to active, in-stock products only.
- Guidance is suppressed when the cart already satisfies the dependency.
- Guidance is suppressed when the cart is blocked or already has stronger correction issues.
- The checkout transition contract remains advisory: guidance may surface, but proceed/submit are not blocked by this advisory alone.
- The lane uses existing cart/checkout readiness surfaces only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim bundle mode.
- This log does not claim multiple dependency warnings.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment architecture redesign.
- This log does not claim variant-level or quantity-level dependency reasoning.
- This log does not claim guaranteed guidance for products lacking graph grounding.
**What Did Not Change:**
- No Cesarin OS/admin lanes were reopened.
- No checkout/payment architecture was redesigned.
- No general recommendation engine was introduced.
- No multi-dependency warning system was introduced.
- The accepted storefront/core lanes remain authoritative and non-reopened.
**Outcome:**
Storefront Contextual Cart-Aware Guidance (Pre-Checkout Basket Audit) is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: Cesarin can audit the active cart for one graph-backed missing dependency in relevant cart/checkout contexts, surface it through existing readiness surfaces, and keep the guidance advisory rather than blocking by itself.

### Storefront Variant-Level Precision & Disambiguation - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, and the focused retrieval/shaping regressions tied to those surfaces. Storefront product-search, confidence, and PDP-handoff only.
**Problem Identified:**
The accepted storefront retrieval path could already ground strong commercial turns, but it still treated parent-product truth as too close to exact-variant truth on specific attribute requests. The remaining gap was bounded variant precision: the storefront needed to distinguish catalog-grounded variant availability from parent-product existence without turning into a broad variant engine or stock oracle.
**Implementation / Audit Sequence:**
1. **Variant truth was added to the capsule path** - the accepted commit `9a686a8f4faa091767cc0b6dd73f7260c4b42fd3` extended `src/lib/ai-capsule-schemas.ts` with bounded `variant_truth` and taught the retrieval path in `src/services/ai-capsule-orchestrator.service.ts` and `src/lib/product-search-capsule.ts` to hydrate nested variant rows and option values.
2. **Variant precision stayed catalog-grounded** - the same accepted commit keeps precision limited to concrete variant-bearing catalog attributes such as color, resistance / ohms, nicotine strength, flavor, model, and size / presentation. The storefront can confirm exact-variant availability when the catalog exposes it, and it can also say when the parent product exists but the requested variant is missing or ambiguous.
3. **Stage 5 and PDP handoff were tightened** - the same accepted commit updates `src/lib/cesarin-stage5.ts` so missing or ambiguous variant truth downgrades readiness instead of sounding cart-ready, while confirmed in-stock variant truth may be surfaced more explicitly when grounded. The accepted path remains within the existing storefront retrieval / drafting / next-step surfaces only.
4. **Focused regression proof landed** - the same accepted commit added focused retrieval and shaping coverage so the storefront no longer overstates unavailable specific variants and instead keeps PDP review or selector-needed posture when exact variant truth is not grounded.
5. **Acceptance confirmed bounded scope** - the lane was accepted as a single storefront product-search and handoff precision lane, not as a general variant-intelligence engine or a stock oracle.
**Accepted Final Discipline:**
- Césarín storefront now carries bounded `variant_truth` in the product/capsule path.
- `variant_truth` is limited to `available`, `missing`, `ambiguous`, and `unsupported`.
- Product retrieval hydrates nested variant rows / option values so parent-product existence and exact-variant availability are no longer conflated.
- Missing or ambiguous variant truth downgrades confidence/readiness and keeps the handoff at PDP review or selector-needed posture instead of cart-ready posture.
- Confirmed in-stock variant truth may be surfaced more explicitly when grounded.
- The lane stays within existing storefront retrieval / drafting / next-step surfaces only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim variant certainty beyond catalog grounding.
- This log does not claim variant-level reasoning when the catalog does not expose the attribute.
- This log does not claim storefront redesign from zero.
- This log does not claim Cesarin OS/admin expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim guaranteed handling of every unusual phrasing for variant requests.
**What Did Not Change:**
- No Cesarin OS/admin lanes were reopened.
- No checkout/payment flow was redesigned.
- No broad variant-intelligence engine or stock oracle was introduced.
- The accepted Waves 1–7 storefront lanes remain authoritative and non-reopened.
**Outcome:**
Storefront Variant-Level Precision & Disambiguation is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: Cesarin can distinguish parent-product existence from exact-variant availability on grounded attribute requests, downgrade confidence when exact variant truth is missing or ambiguous, and keep the PDP handoff honest without inflating the storefront into a general variant engine.

### Storefront Authentic Promotional Awareness & Bounded Incentive Yielding - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/services/storefront-promotions.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/lib/product-search-capsule.ts`, and the focused storefront drafting/runtime regressions tied to those surfaces. Storefront message and drafting flow only.
**Problem Identified:**
The accepted storefront commercial path still lacked one bounded way to surface real active promotions during closing-relevant turns without inventing discounts, coupon codes, or checkout-side eligibility. The remaining need was a compact, truthful promotion-awareness lane using the existing storefront message path, not a marketing engine or a discount application system.
**Implementation / Audit Sequence:**
1. **Bounded promotion signal hydration was added** - the accepted commit `8dfdcff882eb2efd873a17f092b87e87c4a8a53f` extended the product capsule path with one `promotion_signal` contract and a read-only storefront promotion resolver in `src/services/storefront-promotions.service.ts`. The resolver reuses real storefront sources only: product-matched active flash deals and structurally valid public coupons.
2. **Promotion truth stayed structurally bounded** - the same accepted commit filters coupon truth by active flag, valid date window, positive discount, max-uses not exhausted, and prior customer use when customer identity is available. Flash-deal truth stays product-matched and active. No multiple simultaneous promo signals are introduced.
3. **Storefront drafting surfaced the signal only when relevant** - the same accepted commit wires the signal through `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, and `src/lib/product-search-capsule.ts` so real promo truth can appear on explicit promo/discount questions, price-hesitation / cheaper / worth-it turns, and other strong closing-relevant turns. The lane remains informational only; it does not claim the chat applies the discount, and final eligibility remains checkout truth.
4. **Focused regression proof landed** - the same accepted commit added bounded regression coverage for capsule hydration, direct promo-question answering, and live storefront message preservation so the lane keeps real promotion truth exact and does not drift into coupon spam or fake urgency.
5. **Acceptance confirmed bounded scope** - the lane was accepted as a single storefront message/drafting lane, not as a marketing engine, discount oracle, checkout application system, or promotional browsing UI.
**Accepted Final Discipline:**
- Césarín storefront now carries one bounded `promotion_signal` in the product-search capsule path.
- `promotion_signal` is limited to `FLASH_DEAL` and `COUPON`.
- Promotion truth is hydrated only from real active storefront sources.
- Coupon truth is filtered by active flag, valid date window, positive discount, max-uses not exhausted, and prior customer use when customer identity is available.
- Promotion surfacing is limited to relevant turns and remains informational only.
- Checkout remains the final eligibility truth.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim automatic discount application.
- This log does not claim universal coupon eligibility.
- This log does not claim multiple simultaneous promo signals.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a marketing-engine rewrite.
- This log does not claim broad promotional browsing UI.
**What Did Not Change:**
- No Cesarin OS/admin lanes were reopened.
- No checkout/payment flow was redesigned.
- No promotional browsing layer or marketing engine was introduced.
- The accepted Waves 1–7 storefront lanes remain authoritative and non-reopened.
- Missing or unavailable exact variant truth still suppresses promotion pressure rather than inventing urgency.
**Outcome:**
Storefront Authentic Promotional Awareness & Bounded Incentive Yielding is now formally canonized as `ACCEPT`. The accepted truth is exact and bounded: Césarín can surface real active promotional truth in relevant closing turns, but only as informational, checkout-bounded incentive help rather than automatic discount application or broad marketing automation.
### AI Platform Integrity & Runtime Convergence - 3 de abril de 2026
**Scope:** `supabase/config.toml`, `.github/workflows/deploy-functions.yml`, `supabase/functions/knowledge-ingestor/index.ts`, `supabase/functions/knowledge-ingestor/auth.ts`, `supabase/functions/_shared/gemini-api.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tools.ts`, `src/lib/ai-telemetry-contract.ts`, `src/services/concierge.service.ts`, and the focused tests tied to those surfaces. IA platform/runtime integrity only.
**Problem Identified:**
The accepted IA baseline still carried one large integrity/coherence gap that could not be left as narrative only. `knowledge-ingestor` had to stop depending on a weakly exposed no-JWT deployment shape, the audited `customer-intelligence` core path still needed accidental internal Gemini `v1` / `v1beta` drift removed, and telemetry ownership still needed a cleaner explicit edge/client contract so the accepted runtime truth would be harder to drift silently over time.
**Implementation / Audit Sequence:**
1. **Accepted knowledge-ingestor hardening landed** - commit `3d85aefca1b07730de1f95560fee0aeb5c8b2c1b` (`feat(ai): harden runtime integrity and converge telemetry`) restored JWT verification in `supabase/config.toml`, removed workflow `--no-verify-jwt` deployment from `.github/workflows/deploy-functions.yml`, and added explicit runtime write authorization in `supabase/functions/knowledge-ingestor/index.ts` / `auth.ts`. The accepted write rule is now narrow and real: write actions require either `service_role` or an authenticated user present in `admin_users` with role `admin` or `super_admin`.
2. **Accepted Gemini convergence landed in the audited core path** - the same accepted commit introduced `_shared/gemini-api.ts` and routed the audited `customer-intelligence` core path through one explicit shared Gemini API policy. In the audited lane, accidental internal `v1` / `v1beta` URL drift inside `customer-intelligence/index.ts` and `tools.ts` is removed; the accepted converged truth for that audited core path is shared `v1beta` handling for generation and embeddings.
3. **Accepted telemetry ownership hardening landed** - the same accepted commit introduced `telemetry_contract` so edge/client telemetry ownership is communicated through an explicit contract rather than relying only on legacy booleans. `src/services/concierge.service.ts` now resolves the generic client path from that contract first while keeping backward compatibility with older signals.
4. **Focused code/test evidence is real but bounded** - focused tests cover the knowledge-ingestor auth helper, the telemetry contract resolver, the audited customer-intelligence helper path, and storefront service ownership handling. Acceptance audit confirmed the implementation claims are materially real in code and found no major scope drift.
5. **Acceptance audit kept the residual truth bounded** - the lane was accepted as `ACCEPT WITH MINOR RESIDUAL RISK`, not as total closure of every adjacent surface. Admin/service-role continuity for knowledge writes is validated by inspected code rather than end-to-end proof, `telemetry_contract` reduces ownership drift but still coexists with legacy signals/mechanisms, and Gemini convergence here is limited to the audited `customer-intelligence` core path rather than all Gemini-consuming edge functions in the repo.
**Accepted Final Discipline:**
- This lane is accepted as bounded IA platform integrity/convergence work, not as a storefront redesign or admin/UI wave.
- `knowledge-ingestor` is now materially hardened in config, deploy, and runtime auth.
- The audited `customer-intelligence` core path now follows one explicit shared Gemini API versioning policy.
- `telemetry_contract` is now real and materially reduces edge/client telemetry drift risk.
- The lane is accepted with minor residual risk rather than inflated to full-stack convergence proof.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim end-to-end live proof for admin/service-role continuity on `knowledge-ingestor`.
- This log does not claim that every Gemini-consuming edge function in the repo is now converged.
- This log does not claim that `telemetry_contract` fully replaced every legacy telemetry ownership signal.
- This log does not claim storefront UX redesign, checkout work, Cesarin OS cosmetic work, or planner/orchestrator redesign.
- This log does not claim a repo-wide security completion beyond the audited lane.
**What Did Not Change:**
- No storefront UX lane was reopened.
- No checkout behavior lane was reopened.
- No Cesarin OS/admin cosmetic lane was reopened.
- No broad architecture rewrite or orchestrator invention was introduced.
- No canon claim is made that the whole IA stack is now fully unified.
**Outcome:**
AI Platform Integrity & Runtime Convergence is now formally closed in canon as `ACCEPT WITH MINOR RESIDUAL RISK`. The accepted truth is precise and bounded: `knowledge-ingestor` is structurally hardened against accidental public mutation, the audited `customer-intelligence` core path no longer carries accidental internal Gemini version drift, and the storefront/edge telemetry handshake now has an explicit ownership contract that materially reduces drift without being documented as full legacy replacement.
---

### Césarín Storefront — Trust & Transparency Hardening Wave - 29 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / customer-facing experience only.
**Problem Identified:**
The accepted storefront commercial outcome hardening wave had already made Césarín more honest about when to explore, compare, review, or become add-ready, but the visible customer-facing trust signal behind those states was still thinner than it should be. Users could see clearer labels and a better next step, yet the storefront still needed a bounded visible layer that helps them understand why the assistant is still exploring, why two options are worth comparing, why review-first is prudent, and why an add-ready state is now legitimately steadier. The next accepted lane therefore had to improve customer trust and transparency through subtle human-facing posture signaling, not through debug instrumentation or scoring.
**Implementation / Audit Sequence:**
1. **Accepted Stage 5 trust-language landed** - commit `edc978d7aaaacd7f59e9f60bfa6d32e2cef244f9` (`feat cesarin storefront trust transparency`) updated `src/lib/cesarin-stage5.ts` so guidance now communicates posture more clearly in human-facing language. Weak/supportive/strong storefront states now read more naturally as “still refining”, “good case to compare”, “best lead for now”, “clearest route”, “well underway”, or “well anchored” instead of relying only on the action family itself.
2. **Accepted visible trust notes landed** - the same accepted commit updated `src/components/ui/ai/AIConcierge.tsx` so the storefront UI now surfaces compact trust/posture notes that help users understand the posture behind the current help without turning the interface into a badge zoo, a confidence meter, or a debug surface.
3. **Accepted public-context isolation remained intact** - the same accepted commit kept public-context help isolated from product-confidence language so `Contexto publico` turns do not get mixed with product-pressure or add-ready style trust language.
4. **Accepted closed-lane truth remained intact** - catalog-closed and non-product lanes still do not reopen product pressure, and the trust/transparency pass did not weaken catalog gate authority, anti-bloat, bounded public web, soft continuity, own-function priority, or degraded honesty.
5. **Accepted storefront scope stayed subtle and customer-facing** - this wave improves visible trust and clarity only. It does not claim a confidence-score system, a confidence meter, a debug taxonomy surface, a badge explosion, or measured trust/conversion uplift.
**Accepted Final Discipline:**
- This is an accepted real storefront trust/clarity improvement wave, not debug instrumentation.
- Stage 5 guidance now communicates posture more clearly in human-facing language.
- Compare / review / add-ready states are now easier for the user to read.
- Trust notes remain compact and subtle.
- Public-context help remains isolated from product-confidence language.
- Non-product/public turns do not receive misleading product-confidence signaling.
- Closed catalog lanes remain closed.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a confidence-score system.
- This log does not claim a confidence meter.
- This log does not claim a debug taxonomy surface.
- This log does not claim a badge zoo.
- This log does not claim measured trust uplift or conversion uplift.
- This log does not claim storefront redesign from zero.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No reopening of convergence/hardening or later storefront lanes as new architecture projects.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No confidence-score or debug panel system.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Trust & Transparency Hardening Wave is now formally closed as accepted in canon. The storefront assistant now makes its visible posture easier to understand through compact human trust-signaling around exploratory, compare-worthy, review-first, and add-ready states, while keeping public-context help isolated from product-confidence language and preserving current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, commercial outcome hardening, and degraded honesty.
---

### Césarín Storefront — Commercial Outcome Hardening Wave - 29 de marzo de 2026
**Scope:** `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage4.test.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / customer-facing experience only.
**Problem Identified:**
The accepted storefront visibility wave had already made Césarín easier to read in the customer-facing UI, but visible clarity alone did not yet harden the quality of the underlying commercial outcome choice. The storefront still needed a stricter truthful distinction between exploratory help, compare-worthy help, review-first help, and real add-ready help so that weak support stays humble, two viable options do not collapse too early, and action-ready language only appears when the real support is strong enough. The next accepted lane therefore had to improve commercial outcome selection itself rather than merely polishing labels or copy.
**Implementation / Audit Sequence:**
1. **Accepted commercial support grading landed** - commit `61661f8263fb209b577d12320bb3732e73d24168` (`feat cesarin storefront outcome hardening`) updated `src/lib/cesarin-stage5.ts` so Stage 5 now explicitly grades support as `weak`, `supported`, or `strong` instead of treating all surviving storefront support as equally action-ready.
2. **Accepted weak-support honesty tightened** - the same accepted commit keeps approximate / semantic / weak fallback cases more humble. Weak or approximate cases now remain exploratory or review-first instead of sounding add-ready simply because a single fallback item survived.
3. **Accepted compare-worthiness strengthened** - the same accepted commit makes two viable products stay compare-worthy more often instead of collapsing prematurely into action-ready. Explicit compare, guided compare, approximate support, and non-strong multi-option support now keep the storefront in a more honest compare-first posture.
4. **Accepted add-ready threshold became materially stricter** - `ADD_READY` now requires genuinely strong single-product support, a ready-to-close turn, a real add-ready product, and non-approximate support. Weak single-product support remains review-first instead of action-ready.
5. **Accepted storefront expression stayed narrow and truthful** - `src/components/ui/ai/AIConcierge.tsx` now expresses true add-ready help more clearly as `Paso accionable`, while ordinary catalog-open product help still remains `Ayuda de producto`. Closed lanes do not reopen product pressure, and this pass does not create a funnel engine or claim measured KPI uplift.
**Accepted Final Discipline:**
- This is an accepted real storefront commercial-improvement lane, not just wording polish.
- Commercial outcome selection is now materially harder and more truthful.
- Support is now explicitly graded as `weak`, `supported`, or `strong`.
- Weak or approximate cases stay humbler and more exploratory/review-first.
- `ADD_READY` is now tightly restricted to genuinely strong single-product support.
- Two viable products stay compare-worthy more often instead of collapsing prematurely into action-ready.
- Weak single-product support stays review-first instead of action-ready.
- Storefront expression of true action-ready help is clearer while remaining truthful.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim measured KPI or conversion uplift.
- This log does not claim a ranking engine.
- This log does not claim a funnel engine or funnel automation layer.
- This log does not claim storefront redesign from zero.
- This log does not claim core architecture reopening.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No soft-continuity expansion into a deeper memory system.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Commercial Outcome Hardening Wave is now formally closed as accepted in canon. The storefront assistant now distinguishes exploratory, compare-worthy, review-first, and truly add-ready states more honestly, keeps weak support humble, keeps two viable products compare-worthy more often, and expresses real action readiness more clearly in the customer-facing UI, while preserving current-turn sovereignty, catalog gate discipline, anti-bloat, bounded public web, soft continuity, own-function priority, visible help differentiation, and degraded honesty.
---

### Césarín Storefront — Commercial Visibility / UX Effectiveness Wave - 29 de marzo de 2026
**Scope:** `src/components/ui/ai/AIConcierge.tsx`, `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / customer-facing experience only.
**Problem Identified:**
By the time Waves 1–7 plus convergence/hardening were already accepted, Césarín had a materially cleaner model-first core, but the customer-facing storefront still under-expressed that strength. The assistant could already route turns truthfully, gate catalog help, keep public web bounded, and stay less bloated, yet customers still had too little visible clarity about what kind of help they were receiving and what the next real step was when support was strong. The accepted next lane needed a bounded visible storefront pass that improves clarity and commercial usefulness without reopening catalog pressure, funnel logic, or a redesign from zero.
**Implementation / Audit Sequence:**
1. **Accepted visible help differentiation landed** - commit `83c5591c49b48b5a9259078fcfc29486d04b0eea` (`feat cesarin storefront visibility hardening`) updated `src/components/ui/ai/AIConcierge.tsx` so the customer-facing assistant UI now exposes only four compact truthful help-surface labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
2. **Accepted labels stayed bounded and safely gated** - the same accepted commit kept `Contexto publico` limited to turns that actually carry `source_context`, kept `Ayuda de producto` limited to turns where catalog/product surfaces are truly open, kept `Paso accionable` limited to real action-oriented help, and prevented suppressed/non-catalog product turns from being mislabeled as product help.
3. **Accepted next-step visibility became clearer without becoming pushy** - the same accepted commit updated `src/lib/cesarin-stage5.ts` so Stage 5 copy is clearer and more customer-facing, while `Siguiente paso` remains truthfully gated behind legitimate catalog-open product help instead of appearing as a generic pressure tail.
4. **Accepted storefront scope stayed narrow and customer-facing** - the accepted pass improved visible customer understanding and clarity rather than hidden copy churn. It did not claim measured business uplift, did not redesign the storefront from zero, did not create a funnel engine, and did not reopen the accepted core architecture lanes.
5. **Accepted foundations remained preserved** - current-turn sovereignty, catalog gate, anti-bloat, bounded public web, soft continuity, and own-function priority all remained materially intact.
**Accepted Final Discipline:**
- This is an accepted real customer-facing storefront visibility pass, not hidden copy churn.
- Visible help differentiation is now present in the storefront assistant UI.
- The current truth includes only four compact labels: `Contexto publico`, `Ayuda de producto`, `Paso accionable`, and `Guia directa`.
- `Siguiente paso` is now more customer-clear, but remains truthfully gated.
- Stage 5 copy is clearer and more customer-facing without becoming pushy.
- Product help still appears only when catalog/product surfaces are actually open.
- Suppressed/non-catalog turns do not get mislabeled as product help.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim measured business uplift.
- This log does not claim a storefront redesign from zero.
- This log does not claim a new funnel / CTA engine.
- This log does not claim a new architecture lane.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim catalog reopening.
**What Did Not Change:**
- No reopening of Waves 1–7.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No bounded-public-web expansion.
- No own-function priority downgrade.
- No planner/orchestrator layer.
- No storefront redesign from zero.
**Outcome:**
The Césarín Storefront — Commercial Visibility / UX Effectiveness Wave is now formally closed as accepted in canon. The storefront assistant now makes the accepted core more visible to real customers through compact truthful help differentiation, clearer next-step visibility when support is real, and clearer Stage 5 copy, while preserving current-turn sovereignty, catalog gate discipline, anti-bloat, bounded public web, soft continuity, and own-function priority.
---

### Césarín Core Refactor — Post-Refactor Convergence / Hardening Wave - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `src/services/concierge.service.ts`, `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, `supabase/functions/customer-intelligence/response-shaping.ts`, and `src/lib/__tests__/customer-intelligence-web-tools.test.ts`. Storefront / customer-intelligence core only.
**Problem Identified:**
By the end of Waves 1–7, Césarín already had turn-first routing, catalog gating, anti-bloat shaping, a bounded capability box, bounded public web, and soft continuity, but the accepted runtime still behaved too much like layered additions in a few load-bearing places. The concierge baseline had not yet been explicitly converged onto Gemini 2.5 Pro for the real Analyst/Sommelier path, the Analyst prompt still carried duplicated manual routing guidance alongside the accepted capability box, and stale conversational-prefix behavior still needed one final shared-runtime cleanup on clarify-first and grounded public-web turns.
**Implementation / Audit Sequence:**
1. **Accepted convergence baseline landed** - commit `d78576bb51b08a909e1e9106e29ec3726046aa3a` (`refactor cesarin post-refactor convergence hardening`) explicitly moved the storefront concierge Analyst/Sommelier path onto Gemini 2.5 Pro while leaving auxiliary/admin-style paths on auxiliary Flash where still applicable.
2. **Accepted capability-box authority was tightened** - the same accepted commit reduced duplicated manual routing prose in `supabase/functions/customer-intelligence/index.ts` and generated a compact capability summary from `supabase/functions/customer-intelligence/tool-index.ts`, making the real capability box the clearer primary routing authority instead of another broad hand-written table.
3. **Accepted final-answer ownership was cleaned up** - the same accepted commit plus follow-up commit `4dbd867915f95e5f11a50024ad891d08e1129dc5` (`patch cesarin convergence residual cleanup`) made stale conversational-prefix suppression an explicit shared runtime rule through `shouldSuppressCesarinConversationalPrefix(...)`, covering `ASK_CLARIFYING_QUESTION`, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
4. **Accepted focused residual proof landed** - the micro-pass added focused regression proof that a grounded `PUBLIC_INFO` turn with `source_context` and stale continuity input suppresses the stale prefix instead of stacking it into the final answer path.
5. **Accepted foundations remained intact** - Wave 2 turn-first sovereignty, Wave 3 catalog gate, Wave 4 anti-bloat, Wave 5 capability-box boundedness, Wave 6 bounded public web, Wave 7 soft continuity, own-function priority, and neutral degraded fallback all remained materially preserved.
**Accepted Final Discipline:**
- This is an accepted convergence/hardening wave over the existing Césarín storefront/customer-intelligence core, not a new architecture lane.
- The storefront concierge baseline is now explicitly Gemini 2.5 Pro for Analyst and Sommelier.
- Auxiliary/admin-style paths may still remain on auxiliary Flash where applicable.
- The capability box is now the clearer primary routing authority in Analyst prompting.
- Final-answer ownership is cleaner.
- Stale conversational prefix is now explicitly suppressed in shared runtime logic for clarify-first turns, grounded `PUBLIC_INFO` turns with `source_context`, and duplicate prefix/text overlap.
- Current-turn sovereignty remains load-bearing.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a redesign from zero.
- This log does not claim a new architecture lane after Wave 7.
- This log does not claim storefront UI redesign.
- This log does not claim a new commercial UX lane.
- This log does not claim voice/live work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim total rail removal everywhere.
- This log does not claim a planner/orchestrator redesign.
**What Did Not Change:**
- No reopening of Waves 1–7 as separate projects.
- No catalog-gate semantic change.
- No public-web boundedness expansion.
- No own-function priority downgrade.
- No anti-bloat rollback.
- No fake continuity or fake memory expansion.
**Outcome:**
The Césarín Core Refactor — Post-Refactor Convergence / Hardening Wave is now formally closed as accepted in canon. The storefront/customer-intelligence core now operates more coherently as one model-first Gemini 2.5 Pro concierge system, with the capability box acting as the clearer routing authority, shared stale-prefix suppression in the runtime, and preserved boundedness across turn-first routing, catalog gate, anti-bloat, public web, soft continuity, own-function priority, and degraded honesty.
---

### Césarín Core Refactor — Wave 7 Memoria y Contexto Blando - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/soft-continuity.ts`, `src/services/concierge.service.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/lib/__tests__/customer-intelligence-soft-continuity.test.ts`. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 had already left Césarín turn-first, catalog-gated, anti-bloat, capability-indexed, and web-bounded, but continuity still leaned too hard on raw recent history injection and lightweight authenticated memory without any explicit soft-continuity discipline. The accepted next lane needed bounded continuity that can avoid needless repetition and reuse recent context usefully, while keeping the current turn sovereign, keeping continuity humble, and avoiding fake durable guest memory, transcript obsession, catalog reopening, or CRM-style creepiness.
**Implementation / Audit Sequence:**
1. **Accepted soft-continuity helper landed** - commit `5e5e4db18015665c2d6ef1dcce1803bc0e4688f1` (`refactor cesarin wave 7 soft continuity`) added `supabase/functions/customer-intelligence/soft-continuity.ts` with a bounded `buildSoftContinuityContext(...)` helper. The helper derives continuity from recent session history, authenticated `ia_context`, and existing lightweight memory context; detects prior-vs-current lane shift; decides whether soft reopen is appropriate; and produces a compact prompt block for runtime use.
2. **Accepted runtime now uses soft continuity explicitly** - the same accepted commit wires soft continuity into `supabase/functions/customer-intelligence/index.ts`, adds continuity telemetry to `memoryTrace`, and injects soft-continuity rules into Analyst and Sommelier prompting so continuity stays soft, current-turn sovereignty stays load-bearing, and catalog/cart/policy behavior is not reopened by old momentum alone.
3. **Accepted storefront contract stayed materially intact** - `src/services/concierge.service.ts` now forwards bounded authenticated `ia_context` to the edge path and can merge a compact `conversational_prefix` into search, knowledge, cart, and generic replies with anti-bloat dedupe. This improved continuity reuse without reopening product surfaces on non-catalog turns and without redesigning storefront UI.
4. **Accepted continuity remained bounded and honest** - guests still do not get fake durable memory, authenticated continuity remains lightweight and field-based (`ia_context.last_query`, `last_intent`, related existing context), no deep transcript memory or CRM-style persistence layer was introduced, and anti-bloat, catalog gate, Wave 6 bounded public web, and own-function priority remained preserved.
**Accepted Final Discipline:**
- Wave 7 is accepted as a bounded soft-continuity lane over the existing storefront/customer-intelligence core.
- Soft continuity is now materially real in code.
- Continuity derives from recent session history, authenticated `ia_context`, and lightweight existing memory context.
- Continuity remains soft, compact, humble, and optional.
- Current-turn sovereignty remains intact.
- Topic/lane shift suppresses stale continuity push.
- Continuity does not reopen catalog by itself.
- Guests still do not get fake durable memory.
- Authenticated continuity is more useful, but remains lightweight rather than deep transcript memory.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim deep transcript memory.
- This log does not claim a CRM-style persistence layer.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim storefront UI redesign.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**What Did Not Change:**
- No redesign from zero.
- No reopening of Waves 1–6.
- No catalog-gate semantic change.
- No anti-bloat rollback.
- No own-function priority change.
- No public-web boundedness expansion.
- No fake durable guest memory.
**Outcome:**
The Césarín Core Refactor — Wave 7 Memoria y Contexto Blando is now formally closed as accepted in canon. The storefront/customer-intelligence core now carries recent context and lightweight authenticated continuity more usefully through a bounded soft-continuity layer, while keeping the current turn sovereign, keeping catalog/product behavior gated, keeping anti-bloat intact, and staying truthful about what still does not exist: no deep memory platform, no CRM layer, and no storefront UI redesign.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Final Micro-Pass) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tools.ts`, `src/components/ui/ai/__tests__/AIConcierge.test.tsx`, and the narrow audit truth needed to close final Wave 6 storefront/customer-intelligence hygiene. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 Pass 1 plus Pass 2 had already activated bounded public-web intelligence and compact truthful `source_context`, but two small hygiene gaps remained. First, there was still no explicit negative-path proof that ordinary non-public-web turns do not surface `source_context` in storefront behavior. Second, `public_web_search_legacy` and `public_url_context_legacy` were still present in `supabase/functions/customer-intelligence/tools.ts`, leaving a stale legacy-vs-active-path ambiguity even though the accepted runtime no longer referenced those helpers.
**Implementation / Audit Sequence:**
1. **Accepted negative-path storefront proof landed** - commit `2b82970c85e691a48409a4bc056b0a4facd4ff60` (`patch cesarin wave 6 final web hygiene`) added one focused storefront regression proving an ordinary non-public-web turn does not surface `source_context`, does not render the public-context chip, and does not render fake source links.
2. **Accepted legacy helper cleanup landed** - the same accepted commit removed `public_web_search_legacy`, `public_url_context_legacy`, and their associated legacy-only helper/shim block from `supabase/functions/customer-intelligence/tools.ts` after confirming they were dead and unreferenced in the active storefront/customer-intelligence path.
3. **Accepted boundedness remained unchanged** - no selection policy changed, no catalog-gate semantics changed, no storefront UI redesign landed, no planner/orchestrator behavior was introduced, and Waves 1–6 foundations remained materially intact.
**Accepted Final Discipline:**
- This final Wave 6 micro-pass is accepted as hygiene over Wave 6 Pass 1 + Pass 2, not as a new architecture lane.
- Explicit proof now exists that non-public-web turns do not surface `source_context`.
- `source_context` remains absent on ordinary non-public-web turns.
- Dead legacy public-web helpers are removed from `supabase/functions/customer-intelligence/tools.ts`.
- The active public-web path remains the bounded primary runtime path only.
- Successful public-web turns may still surface compact truthful `source_context`, and `PUBLIC_INFO` remains explicitly non-catalog.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a new Wave 6 architecture phase.
- This log does not claim a citation framework or source dashboard.
- This log does not claim storefront UI redesign.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
**What Did Not Change:**
- No implementation redesign from zero.
- No reopening of Waves 1–5.
- No selection-policy rewrite.
- No catalog-gate semantic change.
- No own-function priority change.
- No storefront UI redesign.
- No planner/orchestrator layer.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Final Micro-Pass) is now formally closed as accepted in canon. Final Wave 6 storefront/customer-intelligence truth now includes explicit negative-path proof that non-public-web turns do not surface `source_context`, removal of dead legacy public-web helpers, and continued preservation of the bounded active public-web path without inflating Wave 6 into a new architecture phase.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Pass 2) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tools.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused storefront/runtime regression coverage tied to the accepted Wave 6 Pass 2 micro-pass. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 6 Pass 1 had already activated bounded public-web intelligence inside the existing capability box, but the accepted runtime/storefront path still lacked one narrow honesty improvement: when public web actually ran successfully, the final answer could remain externally grounded without any visible compact provenance/context in the storefront flow. A second narrow truth gap also remained: there was no dedicated storefront-facing regression proving that a real `PUBLIC_INFO` response stays non-catalog all the way through the edge/service/hook/UI composition path. Legacy `public_web_search_legacy` and `public_url_context_legacy` exports also still existed in `tools.ts` without explicit accepted-path containment language.
**Implementation / Audit Sequence:**
1. **Accepted compact provenance micro-pass landed** - commit `3b97ceeba6f4c3c56e3423dd1f122da34b249428` (`patch cesarin wave 6 pass 2 public source honesty`) added a bounded `source_context` path on top of accepted Wave 6 Pass 1. Successful `public_web_search` / `public_url_context` executions may now emit compact public provenance instead of leaving public-web answers visually indistinguishable from model-only synthesis.
2. **Accepted provenance stayed compact and optional** - the accepted shape remains intentionally narrow: a small public-context indicator, an optional brief, and up to 2 normalized public sources. `source_context` appears only when public web was actually used successfully. This did not introduce a citation dashboard, raw URL wall, or storefront UI redesign.
3. **Accepted storefront non-catalog truth was explicitly regression-covered** - the accepted focused regression now proves a `PUBLIC_INFO` turn remains non-catalog through the storefront path, with product / recovery / next-step product surfaces still suppressed even when compact public provenance is present.
4. **Accepted legacy cleanup stayed bounded** - `public_web_search_legacy` and `public_url_context_legacy` were not removed in this micro-pass, but they are now explicitly marked deprecated / compatibility-only so the active runtime truth is cleaner without widening the tool architecture.
5. **Accepted foundations remained intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, Wave 5 capability-box structure remains preserved, Wave 6 Pass 1 public-web boundedness remains preserved, and storefront contract stayed materially intact with only a narrow contract extension.
**Accepted Final Discipline:**
- Wave 6 Web Intelligence (Pass 2) is an accepted micro-pass over Wave 6 Pass 1 for storefront/customer-intelligence only.
- Successful `public_web_search` / `public_url_context` executions can now emit compact truthful `source_context`.
- Surfaced provenance remains bounded and optional: compact public-context indicator, optional brief, and up to 2 normalized public sources.
- `source_context` appears only when public web was actually used successfully.
- `PUBLIC_INFO` remains explicitly non-catalog.
- Product / recovery / next-step product surfaces remain suppressed on the relevant `PUBLIC_INFO` storefront path.
- Storefront contract remained materially intact; only a narrow contract extension was added.
- Legacy `public_web_search_legacy` / `public_url_context_legacy` remain compatibility-only and are not the active primary path.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log records a bounded micro-pass over Wave 6 Pass 1, not a new architecture lane.
- This log does not claim a citation framework or source dashboard.
- This log does not claim full Wave 6 completion beyond Pass 1 + Pass 2.
- This log does not claim storefront UI redesign.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
**What Did Not Change:**
- No implementation redesign from zero.
- No reopening of Waves 1–5.
- No storefront UI redesign.
- No catalog-gate semantic change.
- No own-function priority change.
- No planner/orchestrator layer.
- No doc/canon drift inside implementation files.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Pass 2) is now formally closed as accepted in canon. The accepted Wave 6 public-web lane now includes compact truthful provenance when public web actually ran, retains explicitly non-catalog `PUBLIC_INFO` storefront behavior, keeps legacy web helpers contained as compatibility-only, and preserves the bounded Wave 6 Pass 1 architecture without overstating citation, UI, or planner scope.
---

### Césarín Core Refactor — Wave 6 Web Intelligence (Pass 1) - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/tools.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, and the focused runtime/storefront regression coverage tied to the accepted Wave 6 Pass 1 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 5 had already created a real explicit capability box, but the public-web side still existed only as honest reserved slots. The accepted next lane needed bounded real web intelligence so Césarín can use public external context when it is materially useful, without turning web lookup into a reflex, without bypassing own/private truth functions, and without reopening catalog coercion, planner behavior, or storefront/UI redesign.
**Implementation / Audit Sequence:**
1. **Accepted public-web capability activation landed** - commit `b3430ebdc21eeca8a7b215c6d192066f19664f91` (`refactor cesarin wave 6 web intelligence pass 1`) activated `public_web_search` and `public_url_context` as real `NATIVE_PUBLIC` capabilities inside the existing capability box rather than as reserved placeholders only.
2. **Accepted bounded selection discipline landed** - the runtime now keeps `MODEL_KNOWLEDGE` as the default when external lookup is unnecessary, keeps `OWN_FUNCTION` authoritative for private truth / internal state / real action, limits `public_url_context` to explicit URL or page-context turns, limits `public_web_search` to genuine public/fresh/external-info turns, and suppresses public web on greeting or clarify-first turns.
3. **Accepted bounded runtime execution stayed on the existing path** - public web executes only through the existing bounded `capabilityPlan.serverToolCalls` surface; this lane did not introduce a new planner, orchestrator, or parallel agent layer.
4. **Accepted storefront/runtime truth stayed compact** - `PUBLIC_INFO` is explicitly non-catalog, catalog gate authority remains preserved, public-web synthesis stays compact and explicitly external rather than impersonating private/internal truth, and anti-bloat discipline remains preserved instead of turning responses into search reports.
5. **Accepted architecture preservation remained intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, Wave 5 capability-box structure remains preserved, degraded Analyst fallback remains neutral, and storefront-service alignment stayed minimal with no storefront UI redesign.
**Accepted Final Discipline:**
- Wave 6 Web Intelligence (Pass 1) is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- `public_web_search` and `public_url_context` are now real active bounded `NATIVE_PUBLIC` capabilities.
- Public web is selected only through the bounded capability-plan path and is not reflexive.
- `MODEL_KNOWLEDGE` remains the default when external lookup is unnecessary.
- `OWN_FUNCTION` remains the winning lane for private truth, internal state, and real action.
- `PUBLIC_INFO` is explicitly non-catalog.
- Runtime execution remains bounded through `capabilityPlan.serverToolCalls`.
- Storefront contract remained stable; no storefront UI redesign was required for this lane.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log records Wave 6 Pass 1 only, not full web-intelligence completion.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim storefront UI redesign.
- This log does not claim that public web replaces own internal/private truth functions.
- This log does not claim a giant public-web platform beyond the bounded active capabilities.
**What Did Not Change:**
- No redesign from zero.
- No reopening of Waves 1–5.
- No new mode system.
- No new funnel / CTA layer.
- No admin / Cesarin OS work.
- No live/voice work.
- No full Wave 6 completion claim beyond Pass 1.
**Outcome:**
The Césarín Core Refactor — Wave 6 Web Intelligence (Pass 1) is now formally closed as accepted in canon. The storefront/customer-intelligence core now has bounded active public-web capabilities inside the existing capability box, policy-gated through the existing capability-plan path, while preserving turn-first behavior, catalog gate discipline, anti-bloat shaping, neutral degraded fallback, and the stable storefront contract without overstating full web-intelligence completion.
---

### Césarín Core Refactor — Wave 5 Tool Index Real - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, and the focused runtime/storefront regression coverage tied to the accepted Wave 5 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 4 had already made Césarín turn-first, catalog-gated, and less bloated, but the runtime still carried too much hidden capability routing inside `index.ts` and a separate guardrail-owned intent-to-tool table. The accepted lane needed a real explicit capability box so model knowledge, native/public capability slots, and own/private/action functions are consultable in code rather than inferred from scattered `if A then force B` assumptions.
**Implementation / Audit Sequence:**
1. **Accepted explicit capability index landed** - commit `124e46730602eef4112eae6ca2e282867a9c8ae4` (`refactor cesarin wave 5 tool index real`) added `supabase/functions/customer-intelligence/tool-index.ts` and `supabase/functions/customer-intelligence/tool-selection.ts`, making the Wave 5 split explicit and real through `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
2. **Accepted runtime now consumes an explicit capability plan** - runtime in `supabase/functions/customer-intelligence/index.ts` now builds and uses a bounded `capabilityPlan`, and edge execution now routes through `capabilityPlan.serverToolCalls` instead of another scattered hardcoded server-tool list.
3. **Accepted public-web truth stayed honest** - `public_web_search` and `public_url_context` now exist as explicit reserved capability slots in the capability box, but they remain classification-only at this stage and are not claimed as active Wave 6 web intelligence or as a live public-web execution path.
4. **Accepted border-policy cleanup landed** - follow-up commit `4ff767b7df249f55d5087bf918d0780f16c4fa60` (`patch align wave 5 tool index guardrails`) centralized intent filtering through the capability-id mapping in the tool index so guardrails no longer keep a separate hidden routing table. Guardrails remain border policy and do not reopen product-search coercion.
5. **Accepted boundedness stayed intact** - Wave 2 turn-first behavior remains preserved, Wave 3 catalog gate remains preserved, Wave 4 anti-bloat remains preserved, persona stays slim instead of becoming a routing manual, degraded Analyst fallback remains neutral, and storefront contract/UI did not require redesign for this lane.
**Accepted Final Discipline:**
- Wave 5 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- A real explicit capability/tool index now exists in the storefront/customer-intelligence core.
- The Wave 5 split is now explicit and real: `MODEL_KNOWLEDGE`, `NATIVE_PUBLIC`, and `OWN_FUNCTION`.
- Runtime now builds and uses an explicit bounded `capabilityPlan`.
- Edge execution now uses `capabilityPlan.serverToolCalls`.
- Intent filtering is now centralized through the capability index / capability-id mapping rather than a separate hidden guardrail routing table.
- Guardrails remain border policy and do not reintroduce product-search coercion.
- Storefront contract remained stable; no storefront UI redesign was required for Wave 5.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 6 web intelligence is active.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim storefront UI redesign.
- This log does not claim that all Analyst prompt references disappeared.
- This log does not claim public-web execution is active; the public-web slots remain reserved classification only.
**What Did Not Change:**
- No doc/canon drift inside implementation files.
- No new mode system.
- No new funnel / CTA layer.
- No live/voice work.
- No admin / Cesarin OS work.
- No web-intelligence completion.
**Outcome:**
The Césarín Core Refactor — Wave 5 is now formally closed as accepted in canon. The storefront/customer-intelligence core now has a real explicit capability box and a bounded runtime capability plan, while preserving Waves 1–4 gains and staying truthful about what still is not active: no Wave 6 public-web execution, no planner redesign, and no storefront/UI redesign.
---

### Césarín Core Refactor — Wave 4 Anti-Bloat / Respuesta Desinflada - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/response-shaping.ts`, `src/lib/cesarin-stage1.ts`, `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 4 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 3 had already made Césarín turn-first and catalog-gated, but the accepted runtime/storefront path could still bloat the final answer shape through stacked response layers: runtime text, adaptive Stage 4 tails, Stage 5 next-step reinjection into main text, and storefront copy that could still echo the same move more than once. The accepted lane needed a bounded anti-bloat discipline so Césarín tends toward one useful move, fewer robotic commercial closers, and less duplicated guidance without erasing approximate recovery, next-step help, or honest WhatsApp fallback.
**Implementation / Audit Sequence:**
1. **Accepted runtime anti-bloat discipline landed** - commit `88b3a439222ed7ae6eeab7e25778b5504b859aa6` (`refactor cesarin wave 4 anti-bloat responses`) added explicit anti-bloat rules in `supabase/functions/customer-intelligence/persona.ts`, introduced `RESPONSE_SHAPE_RULES`, and kept the scope narrowly on response-shape hardening rather than opening a new orchestrator, tool-index, or web-intelligence lane.
2. **Accepted runtime shaping now exists in real code** - `compactCesarinResponseText(...)` in `persona.ts` and `shapeCesarinResponseText(...)` in `supabase/functions/customer-intelligence/response-shaping.ts` now compact runtime/storefront output by deduping repeated sentences, trimming soft closers, bounding questions, and reducing reflexive closing tails. `supabase/functions/customer-intelligence/index.ts` now applies that shaping to parsed/fallback runtime text and to the product-capsule conversational prefix before returning the final answer.
3. **Accepted Stage 4/Stage 5 de-duplication landed** - `src/lib/cesarin-stage4.ts` no longer appends an extra commercial tail when `baseMessage` already carries the useful move, and `src/lib/cesarin-stage5.ts` now keeps actionable guidance inside `next_step_view` instead of reinjecting that same move into the main assistant text.
4. **Accepted storefront anti-reinflation landed** - storefront-side search-path copy is now compacted in `src/services/concierge.service.ts`, while `src/hooks/useAIConcierge.ts` and `src/components/ui/ai/AIConcierge.tsx` avoid re-bloating the answer with reflexive helper copy or duplicated recovery/next-step framing.
5. **Useful surfaces stayed preserved** - approximate recovery still remains available when justified, next-step help still remains available when justified, honest WhatsApp fallback remains real, truthful business/action boundaries remain preserved, and Wave 1 / Wave 2 / Wave 3 gains remain intact underneath the new shaping discipline.
**Accepted Final Discipline:**
- Wave 4 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially less bloated in runtime/storefront output.
- Runtime/storefront now tends toward one useful move, fewer duplicated phrases, and fewer robotic commercial tails.
- Stage 4 and Stage 5 no longer duplicate the same move across main text and next-step guidance.
- Storefront no longer re-bloats what runtime already said on the main search/product path.
- Useful help remains intact when justified: approximate recovery, next-step help, honest WhatsApp fallback, and truthful business/action boundaries.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 5 tool-index work.
- This log does not claim web-intelligence work.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim a new mode system.
- This log does not claim a new CTA or funnel layer.
- This log does not claim live/voice work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim semantic perfection; Wave 4 remains heuristic anti-bloat shaping.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No Wave 5 tool-index implementation.
- No web-intelligence implementation.
- No live/voice work.
- No new mode system.
- No new funnel / CTA orchestration layer.
- No product-search lane rewrite from zero.
**Outcome:**
The Césarín Core Refactor — Wave 4 is now formally closed as accepted in canon. Césarín storefront/runtime output is materially less bloated, duplicate guidance across message and next-step was reduced, robotic commercial tails were reduced, useful help remains intact when justified, and the accepted Wave 1 / Wave 2 / Wave 3 foundations remain preserved without overstating tool-index, web-intelligence, or planner completion.
---

### Césarín Core Refactor — Wave 3 Catalog Gate - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 3 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 2 had already made Césarín materially turn-first, but catalog/product surfacing could still appear too reflexively whenever product search was possible. The accepted branch reality needed an explicit catalog gate so products, recovery cards, and product-oriented next-step surfaces only appear when the current turn actually justifies them. Canon also needed to stay truthful about implementation provenance: the current branch already contained the main Wave 3 runtime/storefront gate in `HEAD`, while the last small patch only aligned persona wording with that accepted branch reality.
**Implementation / Audit Sequence:**
1. **Main Wave 3 catalog-gate implementation accepted in branch reality** - commits `8fa0adf3343c5417c006bbfea3f69ffbde37d227` and `c9c0178726d3d934b679982760a47edfe5b551fa` (both `refactor cesarin wave 3 catalog gate`) together established the accepted current branch state: `resolveCatalogGate(...)` now exists in `supabase/functions/customer-intelligence/intent-guardrails.ts`, runtime consumes the gate in `supabase/functions/customer-intelligence/index.ts`, storefront normalizes/applies it in `src/services/concierge.service.ts`, the hook carries/respects it in `src/hooks/useAIConcierge.ts`, and the UI suppresses product surfaces from it in `src/components/ui/ai/AIConcierge.tsx`.
2. **Clarification-first catalog suppression accepted** - when the current turn remains materially unresolved, `ASK_CLARIFYING_QUESTION` and `UNKNOWN` keep the gate closed, search tools are stripped from the runtime capability plan, and product/card/catalog surfacing is not allowed to reopen through a hidden fallback path.
3. **Closed-gate storefront suppression accepted** - when the gate is closed, products are cleared, `resolved_products` are cleared, `next_step_view` is nulled, and stale product/recovery/next-step product surfaces are suppressed instead of lingering after the conversation has changed lanes.
4. **Legitimate search-leading value preserved** - when the current turn is genuinely search-leading and clear enough, product surfacing remains allowed, approximate recovery remains preserved, and Wave 1 / Wave 2 gains remain intact underneath the gate.
5. **Final persona alignment patch accepted narrowly** - commit `7f726194fe21f795b2c2641b06f0a31c14700241` (`patch align cesarin catalog gate persona`) only made the no-reflex-catalog discipline explicit in `persona.ts`; it did not create the whole Wave 3 lane by itself.
**Accepted Final Discipline:**
- Wave 3 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially catalog-gated at the runtime/storefront behavior level.
- Catalog/product surfaces now appear when the current turn justifies them, not by reflex.
- Clarification-first and non-catalog lanes stay product-suppressed.
- When the gate closes, stale product/recovery/next-step product surfaces suppress themselves instead of hanging across the lane change.
- Legitimate search-leading turns can still surface products and approximate recovery when the current turn actually supports that help.
- Wave 1 and Wave 2 gains remain preserved: lighter core identity, explicit capability boundaries, turn-first routing, lightweight memory, honest WhatsApp fallback, truthful business/action boundaries, and honest guest non-persistence.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 4 anti-bloat.
- This log does not claim live/voice work.
- This log does not claim a giant planner/orchestrator.
- This log does not claim admin / Cesarin OS work.
- This log does not claim total removal of all prior helper shaping.
- This log does not claim the final tiny persona patch alone implemented the whole lane.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No new mode system.
- No new CTA or funnel orchestration layer.
- No anti-bloat rewrite.
- No live/voice work.
- No full retrieval/ranking redesign from zero.
**Outcome:**
The Césarín Core Refactor — Wave 3 is now formally closed as accepted in canon. Catalog/product surfaces are now governed by an explicit runtime/storefront gate, clarification-first and non-catalog turns stay product-suppressed, stale product surfaces no longer linger after a lane change, legitimate search-leading turns still keep useful product help and approximate recovery when justified, and the accepted Wave 1 / Wave 2 foundations remain intact without overstating the final small persona patch or later waves.
---

### Césarín Core Refactor — Wave 2 Turn-First Engine - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/analyst-fallback.ts`, `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, and the focused runtime/storefront regression coverage tied to the accepted Wave 2 lane. Storefront / customer-intelligence core only.
**Problem Identified:**
Wave 1 had already made Césarín materially less rail-driven, but the runtime could still inherit stale prior-lane posture too easily. The system was no longer forcing main-path product search, yet it still lacked an explicit current-turn structure that could decide what the current message needed first, keep mixed-intent turns bounded, and stop stale search/product/recovery surfaces from dominating when the conversation naturally changed lanes.
**Implementation / Audit Sequence:**
1. **Storefront turn-first contract accepted** - commit `3752ce26b992cf9ac50e4d24096fea73abfd64ec` (`refactor cesarin wave 2 turn-first storefront`) updated the storefront contract so turn analysis is carried explicitly, stale search-specific humanization no longer dominates non-search turns, approximate recovery stays bounded to search-leading turns, and product/recovery/next-step product surfaces suppress themselves when the current turn is no longer search-first.
2. **Runtime turn-first engine accepted** - commit `aa6b276fc489bcd0918ecff8fb73e88da1513381` (`refactor cesarin wave 2 turn-first engine`) added the bounded turn-first profile `primary_intent`, `secondary_intents`, `turn_priority`, `current_turn_decision`, `turn_focus`, `primary_tool_calls`, and `queued_tool_calls`; made runtime execution act from `primary_intent`; filtered tool calls to the primary lane; and kept secondary intents as bounded queued context instead of pretending deep parallel planning.
3. **Current turn now overrides stale prior-path momentum** - the accepted runtime now lets shopping, doubt, policy, compatibility, tracking, and other materially different current-turn needs supersede stale commercial posture, prior narrowing, or memory momentum when the new turn genuinely changes lane.
4. **Wave 1 gains stayed preserved** - lightweight memory remained conservative, approximate recovery remained available, honest WhatsApp fallback remained real, business/action truth stayed load-bearing, guests still did not gain fake durable memory, and this wave did not reopen Wave 3 catalog gating, Wave 4 anti-bloat, or live/voice work.
**Accepted Final Discipline:**
- Wave 2 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín is now materially turn-first at the runtime/storefront behavior level.
- One primary intent is handled first; secondary intents may remain as bounded queued context.
- Runtime now acts from `primary_intent` and filters tool calls to the primary lane.
- Current turn can override stale prior-lane momentum instead of inheriting fixed funnel continuity.
- Storefront search/product/recovery/next-step product affordances no longer dominate turns that have naturally changed away from search-first behavior.
- Wave 1 gains remain preserved: lightweight memory, approximate recovery, honest WhatsApp fallback, truthful business boundaries, and honest guest non-persistence.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 3 catalog gating.
- This log does not claim Wave 4 anti-bloat.
- This log does not claim a new mode system.
- This log does not claim a giant planner/orchestrator.
- This log does not claim live/voice work.
- This log does not claim total removal of all Stage-era shaping infrastructure.
- This log does not claim deep parallel execution of secondary intents; they remain bounded queued context only.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No doc-driven reopening of Stage 4 / Stage 5 as separate implementation lanes.
- No new CTA or funnel orchestration layer.
- No catalog-gate redesign.
- No anti-bloat rewrite.
- No live/voice work.
**Outcome:**
The Césarín Core Refactor — Wave 2 is now formally closed as accepted in canon. Césarín storefront/runtime behavior is materially turn-first, the current turn now takes precedence over stale prior-path momentum, mixed-intent turns stay bounded and truthful, storefront product-search affordances no longer dominate turns that changed lanes, and Wave 1 load-bearing value remains intact without overstating later waves or planner intelligence.
---

### Césarín Core Refactor — Wave 1 + Corrective Micro-Pass - 29 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `src/services/concierge.service.ts`, and the narrow regression coverage tied to the accepted corrective micro-pass. Storefront / customer-intelligence core only.
**Problem Identified:**
The accepted storefront pilot still carried too much old Césarín core coercion in its primary runtime path. Persona had accumulated seller-scripted cadence, runtime behavior still mixed model reasoning with capabilities and UI affordances, product-search pressure still existed through hard rails, and storefront shaping still carried historical dependency assumptions around edge-provided `conversation_mode_hint`. After the main Wave 1 acceptance, one residual truth gap remained: the degraded Analyst fallback still defaulted to `PRODUCT_SEARCH` and forced `product_search_integrity`, which kept a product-search coercion tail alive outside the primary path.
**Implementation / Audit Sequence:**
1. **Wave 1 core refactor accepted** - commit `d97a08eae456c334ba2dc616542111a45f32b67e` (`refactor cesarin storefront wave 1 core`) slimmed `persona.ts`, made the runtime split clearer between model reasoning, native capabilities, own functions, and UI affordances, and removed the hardest coercive rails from the primary path without reopening the storefront pilot as a new architecture program.
2. **Primary-path product-search coercion removed** - the old weak-intent `UNKNOWN -> PRODUCT_SEARCH` coercion was removed from the main path, forced product-search injection was removed from the main path, and storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime contract.
3. **Load-bearing storefront value preserved** - lightweight authenticated memory remained conservative, approximate recovery remained visible, honest WhatsApp fallback remained real, business truth stayed load-bearing, guests still did not gain fake durable memory, and Stage 4 / Stage 5 storefront shaping infrastructure was not falsely claimed as removed wholesale.
4. **Corrective micro-pass accepted** - commit `dc3cde88026445fc607e07e49d0900b25a4a91a8` (`patch neutralize analyst degradation fallback`) closed the residual degraded-path truth gap by replacing the old degraded Analyst fallback with a neutral fallback returning `intent: 'UNKNOWN'`, `turn_decision: 'ASK_CLARIFYING_QUESTION'`, `tool_calls: []`, and `fallback_reason: 'ANALYST_DEGRADED'`.
**Accepted Final Discipline:**
- Wave 1 is an accepted Césarín core-refactor lane for storefront/customer-intelligence only.
- Césarín core is now materially less rail-driven, and `persona.ts` is slimmer and less seller-scripted.
- Runtime separation is clearer between model reasoning, native Gemini capabilities, own functions, and UI affordances.
- Product-search coercion is no longer present in the main weak-intent path nor in the degraded Analyst fallback.
- Storefront shaping no longer depends on edge `conversation_mode_hint` as a required runtime dependency.
- Lightweight memory, approximate recovery, honest WhatsApp fallback, and business truth remain preserved.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim Wave 2 or a fully realized turn-first engine.
- This log does not claim a catalog-gate redesign, anti-bloat wave, or live/voice wave.
- This log does not claim total deletion of all legacy Stage-era code.
- This log does not claim Stage 4 / Stage 5 infrastructure was removed end-to-end.
- This log does not claim broad live degraded-runtime proof beyond the accepted corrective fallback contract.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No new conversation-mode layer.
- No new CTA or funnel orchestration layer.
- No catalog-gate redesign.
- No anti-bloat rewrite.
- No live/voice work.
**Outcome:**
The Césarín Core Refactor — Wave 1 is now formally closed as accepted in canon. Césarín storefront core is materially less rail-driven, core identity is slimmer, capability boundaries are clearer, product-search coercion is removed from both the main path and degraded Analyst fallback, and accepted storefront value remains intact without overstating Wave 2 or broader architectural completion.
---

### Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention - 26 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/services/orders.service.ts`, `src/hooks/useOrders.ts`, `src/hooks/useCheckout.ts`, `src/actions/checkout.ts`, `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, `src/components/cart/OpenRecoverableOrderNotice.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/hooks/__tests__/useCheckout.test.tsx`, `src/pages/__tests__/Checkout.test.tsx`, and `src/components/cart/__tests__/CartSidebar.test.tsx` only.
**Problem Identified:**
Authenticated storefront checkout already had bounded duplicate-submit hardening once `submitCheckout(...)` executed, but cart and checkout-entry surfaces still remained visually and behaviorally blind to an existing persisted genuinely payable order already in flight. That gap left room for duplicate intent and ambiguous “start checkout again” behavior instead of truthfully recovering the current persisted order.
**Implementation / Audit Sequence:**
1. **Shared recoverable-order truth landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOpenOrderRecoveryView(...)` as the shared storefront-only interpretation of when an authenticated persisted order is genuinely recoverable. Recovery stays bounded to persisted order/payment truth; it does not invent new lifecycle states or rely on route semantics.
2. **Bounded storefront fetch now exists for authenticated open recoverable orders** - `src/services/orders.service.ts` now provides `getCustomerOpenRecoverableOrder(...)`, and `src/hooks/useOrders.ts` now exposes the shared data hook used by storefront cart/checkout surfaces. The fetch remains narrow to the class of orders the storefront is allowed to resume under the already accepted continuation model.
3. **Real pre-submit duplicate-checkout prevention now happens before `submitCheckout(...)`** - `src/hooks/useCheckout.ts` now checks for an authenticated persisted recoverable order before calling `submitCheckout(...)`. This is real prevention rather than cosmetic UI: when a recoverable order already exists, checkout initiation is stopped and the user is redirected toward the persisted order instead of starting a competing checkout attempt.
4. **Recovery-priority storefront UI now exists across cart/checkout surfaces** - `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` now surface bounded recovery guidance for authenticated users, including truthful “order already in progress” framing and bounded CTAs to continue payment or review the persisted order. This remains storefront-only UI hardening, not a broader recovery platform.
5. **Accepted invariants stayed intact** - `src/actions/checkout.ts` kept the accepted `submitCheckout` contract unchanged; `supabase/functions/create-payment/index.ts` kept server-side session, ownership, and valid payable-state enforcement unchanged; no guest persisted order/payment flow was introduced; no paid inference from route semantics was reintroduced; paid-only cart clear remained preserved; paid-only confetti remained preserved; and bounded continuation/recheck behavior was not reopened.
6. **Validation outcome** - Focused cold audit accepted, relevant tests passed `56/56`, `typecheck` passed, and `build` passed. This log does not claim live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only authenticated open-order recovery and duplicate checkout prevention.
- Shared recovery truth now exists in `src/lib/domain/orders.ts` through `getStorefrontOpenOrderRecoveryView(...)`.
- Bounded authenticated recoverable-order fetch now exists in `src/services/orders.service.ts` through `getCustomerOpenRecoverableOrder(...)`, with shared consumption through `src/hooks/useOrders.ts`.
- `src/hooks/useCheckout.ts` now performs real pre-submit duplicate-checkout prevention before `submitCheckout(...)`.
- `src/pages/Checkout.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/components/cart/CartSidebar.tsx`, and `src/components/cart/OpenRecoverableOrderNotice.tsx` now prioritize recovery UI over duplicate-initiation ambiguity.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim guest persisted payment/order flow.
- This log does not claim order-management platform expansion.
- This log does not claim shipping, tracking, returns, invoicing, or support-platform expansion.
- This log does not claim payment rewrite or broad payment-recovery rewrite.
- This log does not claim live-browser proof or broader auth/RLS/browser proof beyond the accepted focused cold audit and validation set.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No order-management platform expansion.
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Authenticated Open-Order Recovery & Duplicate Checkout Prevention lane is now formally closed as accepted. Authenticated storefront cart and checkout surfaces now recover toward the persisted genuinely payable order already in flight, pre-submit duplicate initiation is blocked before `submitCheckout(...)`, and previously accepted payment/order invariants remain intact.
---

### Storefront Post-Purchase Confidence & Receipt Surface Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/components/order/PostPurchaseReceiptCard.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, `src/hooks/useOrders.ts`, `src/services/orders.service.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, `src/pages/__tests__/PaymentFailure.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only.
**Problem Identified:**
The storefront already had stronger checkout persistence, bounded payment continuation, lifecycle coherence, and orders-index actionability, but the immediate post-purchase surfaces still under-communicated certainty and revisit value. `PaymentSuccess.tsx` carried the strongest confirmation treatment, while `PaymentPending.tsx` and `PaymentFailure.tsx` remained technically truthful but too thin to feel like reliable post-purchase receipt/confirmation surfaces. The remaining gap was information hierarchy and revisit confidence, not payment architecture or guest-flow behavior.
**Implementation / Audit Sequence:**
1. **Shared post-purchase confidence derivation landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontPostPurchaseConfidenceView(...)` as a persisted-truth-first post-purchase interpretation over registered order identity, immediate next-step framing, and revisit guidance.
2. **A shared receipt/confidence surface was introduced for payment-return pages** - `src/components/order/PostPurchaseReceiptCard.tsx` now acts as the shared storefront receipt/revisit surface. `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now consume that same shared surface so authenticated users can scan order identity, registered purchase summary, persisted state framing, and clear return paths to order detail and orders history without relying on route semantics.
3. **Order detail received bounded reinforcement only** - `src/pages/OrderDetail.tsx` gained only bounded post-purchase visibility / next-step hardening. The persisted-order-first read path through `src/hooks/useOrders.ts` and `src/services/orders.service.ts` remained intact; this lane did not redesign payment reads, persistence, or checkout architecture.
4. **Accepted invariants stayed intact** - no paid inference from route semantics was reintroduced, paid-only cart clear remained preserved, paid-only confetti remained preserved, bounded continuation stayed limited to authenticated persisted genuinely payable orders, bounded manual refresh/recheck behavior stayed preserved, and no guest persisted order/payment flow was introduced.
5. **Validation outcome** - Focused cold audit accepted, relevant tests passed `57/57`, `typecheck` passed, and `build` passed. This log does not claim live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only post-purchase confidence and receipt-surface hardening.
- Shared post-purchase confidence derivation now exists in `src/lib/domain/orders.ts` through `getStorefrontPostPurchaseConfidenceView(...)`.
- Shared receipt/confidence rendering now exists in `src/components/order/PostPurchaseReceiptCard.tsx` and is used by `PaymentSuccess.tsx`, `PaymentPending.tsx`, and `PaymentFailure.tsx`.
- `OrderDetail.tsx` received only bounded payment visibility / next-step hardening.
- Persisted-truth-first reads remain anchored on `src/hooks/useOrders.ts` and `src/services/orders.service.ts`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim shipping, tracking, returns, invoicing, or support-platform expansion.
- This log does not claim guest persisted payment/order flow.
- This log does not claim payment architecture rewrite or payment recovery platform behavior.
- This log does not claim live-browser validation or broader auth/RLS/browser proof beyond the accepted cold audit and focused validation set.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Post-Purchase Confidence & Receipt Surface Hardening lane is now formally closed as accepted. Payment-return pages now share a persisted-truth-first receipt/confidence surface, order identity and revisit paths are clearer at the point of post-purchase exit, `OrderDetail.tsx` remains the durable persisted-order reference, and previously accepted paid-only and continuation invariants remain intact.
---

### Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/cart.ts`, `src/components/cart/CheckoutTransitionStatus.tsx`, `src/components/cart/CartSidebar.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/pages/Checkout.tsx`, `src/hooks/useCartValidator.ts`, `src/hooks/useCheckout.ts`, `src/stores/cart.store.ts`, `src/lib/domain/__tests__/cart.test.ts`, `src/components/cart/__tests__/CartSidebar.test.tsx`, `src/pages/__tests__/Checkout.test.tsx`, and `src/stores/__tests__/cart.store.test.ts` only.
**Problem Identified:**
The storefront already had stronger purchaseability truth and corrected-cart behavior, but the transition from cart into checkout still derived readiness too locally. `CartSidebar`, `Checkout`, and `CheckoutForm` did not all read the same transition truth, automatic corrections were mostly surfaced as transient notifications instead of a shared pre-commit state, and cart-to-checkout navigation could still feel opaque about whether the user was ready, blocked, or required to review corrected cart state first.
**Implementation / Audit Sequence:**
1. **Shared cart-to-checkout transition truth landed in domain logic** - `src/lib/domain/cart.ts` now provides `getStorefrontCheckoutTransitionView(...)`, which centralizes storefront transition interpretation into shared `ready`, `review`, and `blocked` states plus user-readable next-step messaging.
2. **Main cart/checkout surfaces now consume that shared interpretation** - `src/components/cart/CartSidebar.tsx`, `src/pages/Checkout.tsx`, and `src/components/cart/CheckoutForm.tsx` now consume the same transition reading through `src/components/cart/CheckoutTransitionStatus.tsx` instead of deriving readiness independently per surface.
3. **Runtime cross-surface validation state is now shared** - `src/stores/cart.store.ts` now carries `lastValidationResult` as shared runtime state across storefront cart/checkout surfaces, and cart mutations clear stale validation state after the user edits the cart. This log does not claim persisted-storage durability for that field.
4. **CartSidebar now validates before navigation** - `src/components/cart/CartSidebar.tsx` now runs validation before navigating to `/checkout` and blocks checkout entry when corrected cart truth leaves no purchasable items.
5. **Validation outcome** - Focused domain/store/hook/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- This lane is storefront-only cart-to-checkout transition clarity and commitment hardening.
- Cart-to-checkout readiness now centralizes through `getStorefrontCheckoutTransitionView(...)`, including shared `ready` / `review` / `blocked` runtime truth and user-readable next-step messaging.
- `CartSidebar.tsx`, `Checkout.tsx`, and `CheckoutForm.tsx` now consume the same shared runtime transition interpretation.
- `CartSidebar.tsx` validates before navigation and blocks checkout entry when corrected cart truth leaves no purchasable items.
- `cart.store.ts` now shares `lastValidationResult` across storefront surfaces as runtime state, and cart mutations clear stale validation state after cart edits.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim persisted-storage durability for `lastValidationResult`; it is recorded only as shared runtime state.
- This log does not claim advanced checkout work.
- This log does not claim guest expansion.
- This log does not claim shipping, stock-reservation, or payment-platform redesign.
- This log does not convert focused tests into broad live-browser proof.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No advanced checkout.
- No shipping, stock-reservation, or inventory-platform work.
- No payment platform rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Cart-to-Checkout Transition Clarity & Commitment Hardening lane is now formally closed as accepted with minor truth adjustments. Storefront cart, checkout entry, and final checkout commitment now read the same runtime readiness truth, automatic corrections are surfaced as a shared pre-commit state instead of only transient notifications, and cart-to-checkout navigation now blocks when corrected cart truth leaves no purchasable items.
---

### Storefront Purchaseability Truth & Cart Integrity Hardening - 26 de marzo de 2026
**Scope:** `src/lib/domain/products.ts`, `src/components/products/ProductActions.tsx`, `src/components/products/StickyAddToCart.tsx`, `src/components/products/QuickViewModal.tsx`, `src/components/products/ProductCard.tsx`, `src/components/cart/CheckoutForm.tsx`, `src/pages/Checkout.tsx`, `src/stores/cart.store.ts`, `src/hooks/useCheckout.ts`, `src/lib/domain/__tests__/products.test.ts`, `src/stores/__tests__/cart.store.test.ts`, `src/hooks/__tests__/useCheckout.test.tsx`, and `src/pages/__tests__/Checkout.test.tsx` only.
**Problem Identified:**
The storefront already had stronger authenticated checkout/order/payment truth, but purchaseability still drifted earlier in the funnel. Listing, PDP, quick-view, cart, and checkout-entry surfaces did not all resolve purchaseability from the same storefront truth, variant-bearing products could still be quick-added too blindly from the card surface, and checkout submission could still rely on stale pre-validation cart state instead of the corrected post-validation cart.
**Implementation / Audit Sequence:**
1. **Shared purchaseability truth landed in domain logic** - `src/lib/domain/products.ts` now provides `getStorefrontProductPurchaseability(...)` as the shared storefront interpretation for current product/variant purchaseability, including inactive/discontinued blocking, out-of-stock blocking, variant-required state, selected-variant availability, and selected-variant quantity limits.
2. **Storefront product-entry surfaces now consume that shared truth** - `src/components/products/ProductActions.tsx`, `src/components/products/StickyAddToCart.tsx`, and `src/components/products/QuickViewModal.tsx` now gate quantity and add-to-cart behavior from the shared purchaseability view. `src/components/products/ProductCard.tsx` no longer blindly quick-adds variant-bearing products; when variants materially matter, the card surface now routes the user into option-selection behavior instead.
3. **Cart integrity is now variant-aware** - `src/stores/cart.store.ts` now validates and corrects cart lines against current catalog and selected variant truth, preserves/corrects `variant_id` and `variant_name`, removes invalid variant lines through `variant_removed`, clamps valid variant lines through `variant_stock_adjusted`, and no longer preserves invalid variant lines through permissive base-stock fallback in `updateQuantity(...)`.
4. **Checkout entry and final submit now use corrected cart truth** - `src/components/cart/CheckoutForm.tsx` now gates final submit from purchasable-cart truth instead of raw item count, `src/pages/Checkout.tsx` no longer keeps showing stale checkout summary after the live cart has been corrected away, and `src/hooks/useCheckout.ts` now re-reads corrected post-validation cart state before building the submit payload. Final checkout progression now blocks when corrected cart truth leaves zero purchasable items or critical removal issues such as `variant_removed`.
5. **Validation outcome** - Focused domain/store/hook/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- This lane is storefront-only purchaseability truth and cart-integrity hardening.
- Storefront purchaseability now centralizes through `getStorefrontProductPurchaseability(...)`.
- Product-entry surfaces, sticky add-to-cart, quick view, cart correction, and checkout-entry/final-submit gating now read from that shared storefront purchaseability truth.
- Variant-bearing products are no longer blindly quick-added from `ProductCard.tsx`.
- Checkout submission now uses corrected post-validation cart truth, and final progression blocks when corrected cart truth leaves zero purchasable items or critical removal issues such as `variant_removed`.
**Residual Truth Safeguards / Wording Guardrails:**
- This log does not claim stock reservation or inventory guarantees.
- This log does not claim guest order/payment expansion.
- This log does not claim payment architecture rewrite.
- This log does not claim broad live-browser proof.
- Some PDP and Quick View flows still auto-select the first currently purchasable variant; this log does not claim explicit manual variant selection on every path.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest reorder.
- No shipping, stock-reservation, inventory-platform, tracking, returns, or cancellations work.
- No payment platform rewrite.
- No admin/Cesarin work.
- No product-search work.
**Outcome:**
The Storefront Purchaseability Truth & Cart Integrity Hardening lane is now formally closed as accepted. Storefront purchaseability truth now converges earlier from PDP/card surfaces into cart and checkout entry, cart correction remains variant-aware and honest, and final checkout submission now uses corrected post-validation cart truth instead of stale pre-validation cart state.
---

### Storefront Authenticated Orders Index & Actionability Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/pages/Orders.tsx`, `src/lib/domain/__tests__/orders.test.ts`, and `src/pages/__tests__/Orders.test.tsx` only, with supporting inspection of `src/pages/OrderDetail.tsx`, `src/pages/__tests__/OrderDetail.test.tsx`, `src/hooks/useOrders.ts`, `src/hooks/useAuthenticatedOrderReorder.ts`, `src/hooks/useCheckout.ts`, `src/actions/checkout.ts`, and `src/services/orders.service.ts` to confirm that the accepted lifecycle, reorder, and checkout boundaries remained intact.
**Problem Identified:**
The storefront already had authenticated persisted orders, bounded payment continuation, lifecycle coherence, and authenticated reorder hardening, but `/orders` still behaved more like a raw history list than a decision surface. Action sets remained too noisy or too generic per card: reorder still surfaced too broadly from the index, the “real action” reading was underpowered, and the index could lag behind the stronger lifecycle/actionability discipline already present in `OrderDetail.tsx`.
**Implementation / Audit Sequence:**
1. **Shared orders-index actionability landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOrdersIndexActionView(...)`, derived from persisted lifecycle/payment truth rather than ad hoc card-level heuristics.
2. **Orders index now consumes one shared actionability reading** - `src/pages/Orders.tsx` now uses that shared reading for action headline/detail, detail label, continue-payment visibility, and reorder visibility. This keeps the index grounded in persisted truth and makes each order card read more like a bounded next-step surface.
3. **Continuation and reorder stayed narrowly bounded** - Continue-payment remains limited to authenticated persisted truly payable Mercado Pago orders only. Reorder is now suppressed on the index for active payment or validation trajectories where immediate repeat-purchase would be noisy or misleading. This improves index/detail coherence, but does not claim perfect symmetry: `OrderDetail.tsx` still retains a broader secondary reorder affordance.
4. **Validation outcome** - Focused domain/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane is storefront-only and authenticated-orders-index only.
- Orders-index actionability is now centralized in shared domain logic through `getStorefrontOrdersIndexActionView(...)`.
- `Orders.tsx` now consumes that shared reading for action headline/detail, detail label, continue-payment visibility, and reorder visibility.
- Continue-payment remains bounded to authenticated persisted truly payable Mercado Pago orders only.
- Index/detail coherence is improved, but this log does not claim perfect action symmetry across both surfaces.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim a fully centralized domain bucket model for all orders-index summary counters.
- This log does not claim perfect index/detail action symmetry.
- Focused tests, `typecheck`, and `build` are recorded as focused validation only, not as live-browser proof.
- This log does not claim that auth/RLS ownership proof was re-run in-browser as part of this lane.
**What Did Not Change:**
- No guest order history or guest reorder expansion.
- No shipping, tracking, returns, or cancellations platform work.
- No admin/Cesarin work.
- No payment architecture redesign and no payment platform rewrite.
- No product-search work.
**Outcome:**
The Storefront Authenticated Orders Index & Actionability Hardening lane is now formally closed as accepted with minor truth adjustments. The authenticated orders index now behaves more clearly as a persisted-truth decision surface, while preserving accepted continuation boundaries and keeping reorder quieter on index cards that are still inside an active payment or validation trajectory.
---

### Storefront Payment State Convergence & Order Lifecycle Coherence - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, `src/pages/__tests__/PaymentFailure.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only, with supporting inspection of `src/hooks/useOrders.ts`, `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, and `supabase/functions/create-payment/index.ts` to confirm that the existing storefront continuation boundaries remained intact.
**Problem Identified:**
The storefront already had persisted authenticated orders, bounded Mercado Pago continuation, paid-only cart clear/confetti protections, and bounded refresh behavior. The remaining gap was lifecycle interpretation drift: payment-return pages and order detail still derived parts of their messaging, refresh labels, or CTA behavior from page-local route context instead of one shared persisted-truth interpretation, leaving room for the same order to read differently depending on the surface.
**Implementation / Audit Sequence:**
1. **Shared lifecycle interpretation landed in domain logic** - `src/lib/domain/orders.ts` now provides `getStorefrontOrderLifecycleView(...)`, which centralizes storefront payment/order lifecycle interpretation from persisted truth only. The shared view composes the already accepted payment, continuation, and visibility truth into one storefront lifecycle object with status eyebrow, continuity note, order CTA label, refresh label, and bounded refresh flags.
2. **Main storefront lifecycle surfaces were aligned** - `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` now consume that same persisted-truth-first lifecycle view instead of each reinterpreting lifecycle state locally. This keeps order detail and payment-return pages aligned on payable, pending, paid, and non-payable messaging/CTA behavior.
3. **Accepted continuation and safeguard boundaries stayed intact** - Mercado Pago continuation remains limited to authenticated persisted payable orders only, `PaymentSuccess.tsx` still does not infer paid state from route semantics, cart clear remains paid-only, confetti remains paid-only, and the accepted bounded recheck/manual refresh model remains preserved.
4. **Validation outcome** - Focused domain/page tests passed, `typecheck` passed, and `build` passed. This log does not claim broad live-browser proof for the lane. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- This lane is storefront-only and applies to authenticated persisted-order lifecycle rendering only.
- Lifecycle interpretation is now shared in domain logic and derived from persisted truth rather than route-local semantics.
- Payment return pages and order detail now converge on the same persisted-truth-first interpretation and CTA discipline.
- Continuation remains bounded to authenticated persisted payable Mercado Pago orders only.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not describe a payment architecture redesign.
- This log does not describe a payment recovery platform or generalized order-management capability.
- Focused tests, `typecheck`, and `build` are recorded as focused validation only, not as exhaustive live-browser proof.
**What Did Not Change:**
- No guest persisted order/payment flow and no guest expansion.
- No shipping, stock reservation, tracking, or returns platform work.
- No payment platform rewrite or webhook redesign.
- No admin/Cesarin scope and no product-search work.
**Outcome:**
The Storefront Payment State Convergence & Order Lifecycle Coherence lane is now formally closed as accepted with minor truth adjustments. Storefront payment-return pages and order detail now resolve one coherent lifecycle interpretation from persisted order/payment truth while preserving the previously accepted continuation and paid-only safety boundaries.
---

### Storefront Auth Session Persistence & Bootstrap Failure - 25 de marzo de 2026
**Scope:** `src/contexts/AuthContext.tsx` and `src/contexts/__tests__/AuthContext.test.tsx` only, with inspection of `src/main.tsx`, `src/hooks/useAuth.ts`, `src/components/auth/ProtectedRoute.tsx`, `src/components/admin/AdminGuard.tsx`, and `src/services/auth.service.ts` to confirm the existing storefront auth/bootstrap path.
**Problem Identified:**
The real storefront auth blocker was not checkout, not guest flow, and not a second auth architecture. The visible symptom was a successful login UI flow followed by an app shell that still behaved as if the session were null after refresh or route change. The verified structural root cause was inside `src/contexts/AuthContext.tsx`: the mounted-ref lifecycle could suppress legitimate auth updates under `React.StrictMode`, causing `getSession()`, `onAuthStateChange(...)`, or immediate sign-in hydration to bail as if the provider were already unmounted.
**Implementation / Audit Sequence:**
1. **StrictMode bootstrap guard was corrected** - `src/contexts/AuthContext.tsx` now restores `isMountedRef.current = true` on effect setup before cleanup registration, instead of allowing the StrictMode cleanup cycle to leave the provider permanently flagged as unmounted.
2. **Existing auth architecture stayed intact** - `AuthContext` remains the storefront auth source of truth, `isAuthenticated` still derives from `!!user`, and bootstrap still uses `supabase.auth.getSession()` plus `supabase.auth.onAuthStateChange(...)`. No auth redesign, no server auth policy change, and no checkout/admin scope expansion were introduced.
3. **Focused verification landed around the proven root cause** - `src/contexts/__tests__/AuthContext.test.tsx` now proves StrictMode session restore and immediate sign-in hydration against the real provider path.
4. **Validation outcome** - Focused StrictMode tests passed, `typecheck` passed, and `build` passed. Guest browser smoke verified clean redirects for protected storefront/admin routes when unauthenticated. Automated authenticated browser verification was not available in this pass because no safe local credentials were discoverable. Product-owner manual verification reported that the visible storefront login/session failure symptom appears resolved in real use. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane remains storefront-auth/bootstrap only.
- The verified defect was a mounted-ref lifecycle bug under `React.StrictMode`, not a new checkout issue and not a separate admin feature lane.
- The fix preserves the existing Supabase session/bootstrap model rather than inventing a new auth system.
- Guest route behavior remains explicit and correct through the existing protected-route and admin-guard surfaces.
**Residual Truth Adjustments / Wording Guardrails:**
- This log does not claim fully automated authenticated runtime proof.
- This log does not claim installed PWA parity for this lane.
- Manual product-owner verification is recorded as manual verification, not as automated browser proof.
**What Did Not Change:**
- No auth architecture redesign.
- No checkout or payment lane reopening.
- No guest expansion.
- No admin/Cesarin feature expansion.
- No server-side auth policy loosening.
**Outcome:**
The Storefront Auth Session Persistence & Bootstrap Failure lane is now formally closed as accepted with minor truth adjustments. The structural StrictMode bootstrap defect in `AuthContext` has been corrected, the storefront auth source of truth remains unchanged, and canon records the distinction between focused structural validation, guest route smoke, and the absence of automated authenticated runtime proof in this pass.
---

### Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening - 25 de marzo de 2026
**Scope:** `supabase/functions/checkout-submit/index.ts`, `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `src/actions/__tests__/checkout.test.ts`, and `src/hooks/__tests__/useCheckout.test.tsx` only.
**Problem Identified:**
Authenticated storefront checkout still relied on client-side `sending` guards for duplicate resistance, but the real order-creation path in `checkout-submit` still inserted a fresh persisted pending order on each repeated authenticated retry. That left duplicate-submit risk on refresh, re-entry, or rapid repeat attempts even when a truthful equivalent pending order already existed.
**Implementation / Audit Sequence:**
1. **Bounded pending-order reuse landed server-side** - `supabase/functions/checkout-submit/index.ts` now resolves shipping identity first and checks for an equivalent authenticated pending order before inserting a new one.
2. **Matching stayed storefront-bounded and conservative** - Reuse now applies only when the same authenticated customer already has an order in the same `pending` / `pending` state with the same payment method, the same delivery type, the same normalized customer identity fields used by the implementation, the same normalized item signature, the same normalized shipping signature, and the same normalized coupon code.
3. **Checkout action contract was extended without redefining payment continuation** - `src/actions/checkout.ts` now exposes `reusedPendingOrder` while preserving the accepted continuation contract `not_requested | ready | unavailable`.
4. **Client flow now routes reused orders toward persisted truth instead of treating them as new** - `src/hooks/useCheckout.ts` now sends reused authenticated non-Mercado Pago orders to `/orders/:orderId` instead of the new-order / WhatsApp success path. Reused Mercado Pago orders stay inside the existing bounded continuation model: `ready` still continues to Mercado Pago, and a persisted `orderId` without ready continuation routes to `/orders/:orderId`.
5. **Verification outcome** - Focused tests were added or updated for reused pending non-Mercado Pago contract handling, reused pending Mercado Pago staying on the accepted continuation path, authenticated duplicate non-Mercado Pago redirect behavior, and guest-path non-regression. `typecheck` and `build` both passed. Acceptance audit verdict: **ACCEPT WITH MINOR TRUTH ADJUSTMENTS**.
**Accepted Final Discipline:**
- The lane remains storefront-only and authenticated-only.
- Authenticated duplicate-submission hardening now prefers reuse of an equivalent persisted pending order instead of silently creating a parallel one.
- `reusedPendingOrder` is now part of the storefront checkout action contract, but payment continuation remains bounded to the previously accepted `not_requested`, `ready`, and `unavailable` states.
- Guest checkout remains WhatsApp handoff only with no guest persisted order/payment flow and no guest reorder.
**Residual Truth Adjustments / Wording Guardrails:**
- This is not strong locking-based idempotency or transactional uniqueness enforcement.
- This is not a broad payment recovery system or an order-management platform.
- Coupon-backed duplicate retry reuse is structurally supported by the matching logic, but this log does not claim a dedicated direct test for that specific branch.
- Reused Mercado Pago `unavailable` routing is supported by the hook logic, but this log does not claim a dedicated direct hook test for that exact branch.
**What Did Not Change:**
- `create-payment` still requires session, ownership, and valid payable state.
- Payment pages and order detail still derive from persisted truth.
- `PaymentSuccess.tsx` still must not infer paid from route semantics.
- Cart clear remains paid-only and confetti remains paid-only.
- No guest persisted checkout or guest payment continuation.
- No shipping engine, no stock reservation, no tracking/returns platform, and no advanced checkout capability.
- No auth redesign, no admin/Cesarin drift, and no storefront drafting/search work.
**Outcome:**
The Storefront Authenticated Checkout Idempotency & Duplicate-Submission Hardening lane is now formally closed as accepted with minor truth adjustments. Authenticated storefront checkout now reuses an equivalent persisted pending order when the current checkout intent matches that existing pending object, while leaving guest flow, payment continuation boundaries, and the persisted-truth storefront model intact.
---

### Storefront Authenticated Reorder & Catalog Drift Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/hooks/useAuthenticatedOrderReorder.ts`, `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`, `src/lib/domain/__tests__/orders.test.ts`, `src/hooks/__tests__/useAuthenticatedOrderReorder.test.tsx`, `src/pages/__tests__/Orders.test.tsx`, and `src/pages/__tests__/OrderDetail.test.tsx` only.
**Problem Identified:**
Authenticated storefront reorder still reconstructed fake historical `Product` objects from persisted order data instead of rehydrating against the current catalog. That bypassed real catalog truth, could resurrect inactive or missing items, and overstated how faithfully an older order could be rebuilt.
**Implementation / Audit Sequence:**
1. **Shared reorder truth landed** - `src/lib/domain/orders.ts` now provides bounded storefront reorder planning against persisted `order_items`, current catalog truth, current stock, current cart occupancy, and conservative variant remapping rules.
2. **Authenticated reorder path was centralized** - `src/hooks/useAuthenticatedOrderReorder.ts` now loads current products with `getProductsByIds(...)`, derives a reorder plan from persisted order items, adds only safe items through the normal cart `addItem(...)` path, and emits honest storefront feedback for full, partial, blocked, or manual-review outcomes.
3. **Fake historical product reconstruction was removed from storefront surfaces** - `src/pages/OrderDetail.tsx` no longer fabricates `Product` objects locally to re-add old items. Both `src/pages/OrderDetail.tsx` and `src/pages/Orders.tsx` now reuse the same authenticated reorder hook and current-catalog-first rules.
4. **Catalog drift stays explicit and bounded** - Reorder now supports mixed outcomes truthfully: full add, partial add, blocked/unavailable items, and manual-review cases when a prior variant no longer maps cleanly. Variant handling remains conservative and non-guessing.
5. **Verification outcome** - Focused tests were added or updated for domain reorder truth, authenticated reorder happy path, partial reorder, missing/unavailable item behavior, and guest-surface non-drift on the orders list. `typecheck` and `build` both passed. Acceptance audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Reorder now derives from persisted `order_items` and current catalog truth instead of UI assumptions or fabricated product objects.
- Only safe items are added through the normal storefront cart path.
- Current catalog/cart pricing remains authoritative; no historical pricing is resurrected.
- Reorder stays bounded to authenticated persisted storefront orders only.
- Payment continuation remains separate and untouched.
**What Did Not Change:**
- No guest reorder and no guest persisted order/payment flow.
- No automatic order recreation and no automatic payment creation.
- No shipping engine, no stock reservation, no tracking or returns platform, and no advanced checkout capability.
- No auth redesign, no backend payment redesign, no admin/Cesarin drift, and no storefront drafting/search work.
**Outcome:**
The Storefront Authenticated Reorder & Catalog Drift Hardening pass is now formally closed as accepted. Authenticated reorder now reconstructs prior purchase intent from persisted `order_items` against the current catalog safely, supports partial/degraded outcomes honestly, and stays inside the existing storefront cart/order/payment truth boundaries.
---

### Checkout. Storefront Checkout Recovery & Completion Hardening - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/__tests__/OrderDetail.test.tsx`, `src/pages/__tests__/PaymentSuccess.test.tsx`, `src/pages/__tests__/PaymentPending.test.tsx`, and `src/pages/__tests__/PaymentFailure.test.tsx` only.
**Problem Identified:**
The accepted checkout/payment baseline already persisted real authenticated orders, normalized post-payment storefront truth, protected paid-only side effects, and exposed bounded recheck plus direct continuation from order detail. The remaining gap was broader storefront continuity: payable versus non-payable Mercado Pago states were still not expressed through one shared continuation model across the main persisted-order and post-payment surfaces.
**Implementation / Audit Sequence:**
1. **Shared continuation-truth helper landed** - `src/lib/domain/orders.ts` now provides `getStorefrontPaymentContinuationView(...)` as a bounded storefront helper over persisted `payment_method`, normalized `payment_status`, and `status`.
2. **Storefront payment surfaces aligned** - `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now read the same persisted-truth-first continuation model instead of diverging on payable versus non-payable messaging.
3. **Direct continuation stayed bounded** - Direct Mercado Pago continuation now appears only when persisted truth says the order is still payable: `payment_method === 'mercadopago'`, normalized payment status is `pending`, and the order is not cancelled. Non-payable states now use clearer continuity messaging instead of fake retry semantics.
4. **Accepted protections preserved** - `PaymentSuccess.tsx` still does not infer paid state from route semantics, cart clear remains paid-only, confetti remains paid-only, and the previously accepted bounded refresh/manual refresh patterns remain in place.
5. **Verification outcome** - Focused domain and storefront tests were added or updated around continuity truth, order-detail continuation, payment-success continuation vs paid behavior, payment-pending continuation, and payment-failure continuation vs non-payable hidden continuation. Acceptance audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Storefront checkout/payment continuity now uses one shared persisted-truth-first continuation model across order detail and the main post-payment surfaces.
- Direct continuation is exposed only for authenticated persisted Mercado Pago orders that are still truly payable.
- Non-payable states remain storefront-visible and clearer, but do not invent broader retry or recovery capabilities.
- Existing accepted checkout/payment truth protections remain the baseline.
**Residual Risk:**
- The continuation error-notification path is still not deeply asserted across all four storefront surfaces.
**What Did Not Change:**
- No guest persisted order/payment flow.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No backend payment redesign and no webhook redesign.
- No admin, Cesarin, storefront drafting, or product-search scope drift.
- No broader payment recovery system or order-management expansion was introduced.
**Outcome:**
The Storefront Checkout Recovery & Completion Hardening pass is now formally closed as accepted with minor residual risk. Storefront checkout/payment continuity is materially tighter around persisted truth and bounded continuation without widening scope beyond the accepted authenticated storefront checkout/payment surface.
---

### Checkout. Order Detail Payment Continuation CTA - 25 de marzo de 2026
**Scope:** `src/pages/OrderDetail.tsx` and `src/pages/__tests__/OrderDetail.test.tsx` only. Existing continuation primitives were reused through `src/services/payments/mercadopago.service.ts` and `supabase/functions/create-payment/index.ts`; no backend payment architecture or checkout contract files were changed for this pass.
**Problem Identified:**
The accepted checkout/payment continuity baseline already told authenticated customers that a persisted order could be resumed from order detail, but the storefront still lacked a real continuation CTA on that persisted order surface. The remaining gap was not payment architecture or messaging normalization; it was the absence of a truthful continue-payment action for existing payable Mercado Pago orders.
**Implementation / Audit Sequence:**
1. **Bounded storefront continuation CTA landed** - `src/pages/OrderDetail.tsx` now exposes the real CTA `Continuar pago en Mercado Pago` for authenticated persisted orders only when persisted truth supports it.
2. **Persisted-truth gating stayed explicit** - The CTA appears only when `payment_method === 'mercadopago'`, `payment_status === 'pending'`, and `status !== 'cancelled'`. This preserves the accepted rule that route semantics do not imply paid state or payable state by themselves.
3. **Existing continuation infrastructure was reused, not redesigned** - The CTA continues payment through the already accepted storefront payment path via `src/services/payments/mercadopago.service.ts` and the existing `supabase/functions/create-payment/index.ts` payable-order contract.
4. **Verification outcome** - The pass was accepted with **ACCEPT WITH MINOR RESIDUAL RISK**. Residual risk remained test-shaped only: there is still no direct test proving that a cancelled Mercado Pago order hides the CTA, and no direct test for the continuation-failure toast path.
**Accepted Final Discipline:**
- `OrderDetail.tsx` now exposes a real bounded Mercado Pago continuation CTA for authenticated persisted payable orders.
- Continuation remains gated by persisted truth, not by route semantics.
- The accepted persisted-order/payment-truth baseline remains the source of authority.
- Guest checkout remains outside persisted order/payment continuation.
**Residual Risk:**
- No direct test yet proves that cancelled Mercado Pago orders hide the CTA.
- No direct test yet covers the continuation-failure toast path.
**What Did Not Change:**
- No guest persisted order/payment flow.
- No backend payment redesign and no webhook redesign.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No auth change, no storefront drafting/search change, and no admin or Cesarin OS scope drift.
**Outcome:**
The Order Detail payment continuation CTA pass is now formally closed as accepted with minor residual risk. Storefront checkout now exposes a real, bounded Mercado Pago continuation action from the persisted order detail surface without inventing new payment capability or widening scope beyond the accepted storefront checkout/payment continuity surface.
---

### Checkout. Payment UX Mini-Block (Patch Pair 2 of 2) - 25 de marzo de 2026
**Scope:** `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, and `src/pages/__tests__/PaymentSuccess.test.tsx` (tests inspected and updated only where materially relevant). Support inspection remained limited to `src/hooks/useOrders.ts` and `src/lib/domain/orders.ts`.
**Problem Identified:**
The accepted payment-truth model, post-payment normalization, cart-clear guard, and patch pair 1 already made storefront checkout/payment behavior structurally honest. The remaining gap was continuity and CTA clarity across the existing payment/result/order surfaces: the UI still varied too much in how it expressed order existence versus payment confirmation, and some next-step actions were too vague about where the customer should continue from persisted truth.
**Implementation / Audit Sequence:**
1. **Bounded storefront UX continuity patch landed** - Patch Pair 2 stayed inside the existing storefront checkout/payment surfaces only. No backend, auth, webhook, guest, shipping, stock, or advanced-checkout architecture was touched.
2. **Cross-surface truth semantics tightened** - `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx` now separate order existence from payment confirmation more explicitly and use clearer truthful CTAs pointing back to the persisted order state. `src/pages/OrderDetail.tsx` now labels the payment section as `Estado de pago` and adds a compact `Siguiente paso real` block derived from persisted truth.
3. **Accepted protections preserved** - Bounded recheck/manual refresh from patch pair 1 remained intact. No fake paid inference from route semantics was introduced. No premature cart-clear regression was introduced. No backend/auth/guest/shipping/stock/advanced-checkout/admin/drafting drift occurred.
4. **Verification outcome** - `npm run -s test -- src/pages/__tests__/PaymentSuccess.test.tsx` passed, `npm run -s typecheck` passed, and `npm run -s build` passed. Acceptance audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Storefront checkout/payment surfaces now speak with more consistent truth semantics after return or re-entry.
- Order existence is no longer blurred with payment completion as much as before.
- Next-step CTAs now more clearly direct the customer toward the persisted order state and the real next action.
- The accepted persisted-truth model and bounded refresh behavior from prior checkout/payment passes remain the baseline.
**Residual Risk:**
- Residual risk is coverage-only, not product-drift.
- There are still no direct tests for the new `PaymentPending.tsx` copy/CTA branches.
- There are still no direct tests for the new `PaymentFailure.tsx` copy/CTA branches.
- There are still no direct tests for `OrderDetail.tsx` `Siguiente paso real`.
**What Did Not Change:**
- No payment backend redesign.
- No webhook redesign.
- No auth change.
- No guest persisted payment flow.
- No shipping engine, no stock reservation, and no advanced checkout capability.
- No storefront drafting/search work, and no admin or Cesarin OS scope drift.
**Outcome:**
The Payment UX Mini-Block (Patch Pair 2 of 2) is now formally closed as accepted with minor residual risk. Storefront checkout/payment surfaces now provide clearer continuity and next-step guidance from persisted truth without changing backend architecture, inventing paid state, or widening scope beyond the accepted storefront checkout/payment UX surface.
---

### Storefront Auth Convergence + Hardening - 25 de marzo de 2026
**Scope:** `src/contexts/AuthContext.tsx` only.
**Problem Identified:**
Storefront login could succeed against real Supabase auth while the app shell still behaved as if the customer were logged out. The real gap was not fake login success or a broken Supabase client; it was post-login convergence timing inside the storefront auth provider. `LoginForm.tsx` awaited `signIn()` and then resumed UI success/navigate behavior immediately, while `user` still depended on later `getSession()` or `onAuthStateChange(...)` updates. That left a post-login window where guest UI and guest redirects could still win before auth state converged.
**Implementation / Audit Sequence:**
1. **Convergence fix landed** - Commit `968cfcb` tightened `src/contexts/AuthContext.tsx` only. `handleSignIn` now reads the resolved Supabase sign-in result directly and hydrates `user` immediately from `authData.user ?? authData.session?.user ?? null` before returning control to the caller.
2. **Immediate post-login state alignment restored** - `handleSignIn` now also clears `loading` immediately after successful sign-in state is set, so `isAuthenticated` can converge from the same provider instance before post-login navigation resumes. `isAuthenticated` still derives from `!!user`; no fake success path was added.
3. **Critical-path latency reduced without redesign** - `loadProfile(currentUser.id)` still runs, but it no longer blocks login completion. Long-lived auth consistency remains with the provider bootstrap through `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange(...)`, and `React.StrictMode` remains in place.
4. **Verification outcome** - `npm run -s typecheck` passed. Cold acceptance verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Login still depends on real Supabase auth and the real returned sign-in payload.
- `user` now converges before the post-login navigation callback resumes.
- Profile hydration no longer blocks immediate login completion.
- The accepted scope remained limited to `src/contexts/AuthContext.tsx`; `auth.service.ts`, `LoginForm.tsx`, `Login.tsx`, `ProtectedRoute.tsx`, header/menu components, and the Supabase client were not changed for this pass.
**Residual Risk:**
- Residual risk is minor and latency-shaped, not a convergence failure.
- `loadProfile(...)` is intentionally asynchronous relative to login completion, so profile-specific UI may briefly trail raw auth convergence.
- Some duplicate profile fetch work may still occur across immediate sign-in and later bootstrap/listener flows.
**What Did Not Change:**
- No auth architecture redesign.
- No checkout or payment expansion.
- No guest-flow expansion.
- No shipping, stock reservation, admin, or Cesarin OS scope drift.
**Outcome:**
The Storefront Auth Convergence + Hardening pass is now formally closed as accepted with minor residual risk. Storefront login now converges on real authenticated UI state before post-login navigation resumes, while keeping long-lived session synchronization on the existing provider bootstrap and auth-listener path. Commit: `968cfcb`.
---

### Checkout. Payment UX Mini-Block (Patch Pair 1 of 2) - 25 de marzo de 2026
**Scope:** `src/hooks/useOrders.ts`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, `src/pages/OrderDetail.tsx`, and `src/pages/__tests__/PaymentSuccess.test.tsx`.
**Problem Identified:**
The accepted post-payment normalization and cart-clear guard passes had already made storefront payment messaging truthful, but the next UX gap remained in convergence speed after Mercado Pago return. Persisted order truth could still lag webhook settlement for a short window, and the storefront offered no explicit recheck action on the main non-confirmed payment surfaces.
**Implementation / Audit Sequence:**
1. **Mini-block landed** - Commit `6de61069c6d55d0ba42b9ed226eb92464d4d05b6` added a bounded post-return payment-status recheck on the existing persisted order read path through `useBoundedOrderStatusRefresh(...)` in `src/hooks/useOrders.ts`. This did not introduce a new payment source or redefine `src/lib/domain/orders.ts`; the accepted truth mapper remained the baseline.
2. **Return-surface refresh behavior tightened** - `src/pages/PaymentSuccess.tsx` now uses bounded recheck only while persisted truth is unresolved or pending and adds a manual `Revisar estado de pago` action when the order is not yet paid. `src/pages/PaymentPending.tsx` adds the same bounded recheck plus the same manual refresh. `src/pages/PaymentFailure.tsx` adds manual persisted-status refresh only. `src/pages/OrderDetail.tsx` adds `Revisar estado de pago` only for unpaid `mercadopago` orders.
3. **Truthfulness boundaries preserved** - Persisted order/payment truth remains authoritative; no paid-state invention was introduced; no premature cart clear was reintroduced; guest checkout remains outside persisted payment flow; and no shipping, stock reservation, advanced checkout, admin, or Cesarin OS scope drift occurred.
4. **Verification outcome** - `npm run test:run -- src/pages/__tests__/PaymentSuccess.test.tsx src/lib/domain/__tests__/orders.test.ts` passed `26/26`, `npm run typecheck` passed, and `npm run build` passed. Cold audit verdict: **ACCEPT WITH MINOR RESIDUAL RISK**.
**Accepted Final Discipline:**
- Payment return surfaces now converge faster toward persisted order/payment truth after Mercado Pago return through a short bounded recheck, not through invented payment completion.
- Customers now have a manual persisted-status refresh action on the relevant non-confirmed surfaces.
- `src/lib/domain/orders.ts` remains the truth-mapper baseline and was not redefined by this patch pair.
- Paid-only behaviors remain intact, including the previously accepted cart-clear guard and paid-only celebratory behavior on `PaymentSuccess.tsx`.
**Residual Risk:**
- Page-level automated coverage remains thinner on `src/pages/PaymentPending.tsx`, `src/pages/PaymentFailure.tsx`, and `src/pages/OrderDetail.tsx` than on `src/pages/PaymentSuccess.tsx`.
- The bounded recheck window is intentionally short; if persistence settles later, the storefront remains truthful, but the customer may still need the manual recheck action to see the updated persisted state.
**What Did Not Change:**
- No payment completion guarantee was added.
- No webhook redesign, no guest persisted payment flow, no shipping engine, no stock reservation, and no advanced checkout capability were introduced.
- No admin or Cesarin OS scope drift occurred.
- No prior checkout lanes or storefront drafting work were reopened.
**Outcome:**
The Payment UX mini-block (patch pair 1 of 2) is now formally closed as accepted with minor residual risk. Storefront payment-return surfaces now offer a bounded post-return recheck and a manual persisted-status refresh path without inventing paid state or expanding scope beyond the accepted checkout/payment UX surface. Commit: `6de61069c6d55d0ba42b9ed226eb92464d4d05b6`.
---

### Checkout. Payment Success Cart-Clear Guard Patch - 25 de marzo de 2026
**Scope:** `src/pages/PaymentSuccess.tsx` and `src/pages/__tests__/PaymentSuccess.test.tsx`.
**Problem Identified:**
The accepted post-payment normalization pass had already corrected storefront messaging, but one residual watchpoint remained: `PaymentSuccess.tsx` still cleared the cart on first render even when persisted order truth did not yet support a paid outcome. The remaining need was a narrow guard patch, not a new checkout lane.
**Implementation / Audit Sequence:**
1. **Guard patch landed** - Commit `a2b3194` tightened the cart-clear effect in `src/pages/PaymentSuccess.tsx`. The page previously cleared the cart unconditionally on route entry; the accepted patch now gates that side effect on persisted paid truth only.
2. **Paid-only clear discipline restored** - Cart clear now occurs only when the loaded persisted order view resolves to `paymentStatus === 'paid'` through the existing order-loading and order-view path already used in storefront checkout. `processed.current` continues to prevent repeated clears once a paid order has triggered the effect.
3. **Verification outcome** - `npm run -s test -- src/pages/__tests__/PaymentSuccess.test.tsx` passed, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- `PaymentSuccess.tsx` no longer clears the cart merely because the customer landed on the success route.
- Cart clearing is now bounded to persisted paid truth only.
- Accepted post-payment messaging behavior remains intact.
- Confetti remains paid-only.
**What Did Not Change:**
- No payment completion semantics changed beyond the cart-clear guard itself.
- No guest checkout inflation, no shipping engine, no stock reservation, and no admin or Cesarin OS scope drift were introduced.
- No new checkout lane was created, and the broader post-payment normalization pass was not reopened.
**Outcome:**
The Payment Success cart-clear guard patch is now formally closed as accepted. Storefront checkout no longer clears the cart prematurely from the payment success route, and the side effect now occurs only when persisted paid truth actually supports it. Commit: `a2b3194`.
---

### Checkout. Post-Payment Order Status Normalization Pass - 25 de marzo de 2026
**Scope:** `src/lib/domain/orders.ts`, `src/lib/domain/__tests__/orders.test.ts`, `src/pages/OrderDetail.tsx`, `src/pages/PaymentSuccess.tsx`, `src/pages/PaymentPending.tsx`, and `src/pages/PaymentFailure.tsx`.
**Problem Identified:**
The authenticated checkout bridge and payment-continuation path were already accepted, but the next storefront checkout truth gap remained in post-payment visibility. Order-detail and payment-return surfaces still derived too much meaning from route semantics and generic UI wording, which could imply successful payment or forward progress before the persisted order state actually confirmed it.
**Implementation / Audit Sequence:**
1. **Post-payment normalization pass landed** - Commit `122cd611bc3410f6f41508ee94797e611024c33e` added a bounded storefront normalization layer in `src/lib/domain/orders.ts` through `normalizePaymentStatus()` and `getStorefrontOrderPaymentView()`, so post-payment messaging now derives from persisted `payment_status`, `payment_method`, and `status` instead of route semantics alone.
2. **Order detail surface aligned to persisted truth** - `src/pages/OrderDetail.tsx` now distinguishes meaningful storefront payment states including `paid`, `pending`, `failed`, and `refunded`, and uses the normalized view for banner and payment-status copy instead of flattening non-paid cases into generic in-progress messaging.
3. **Payment return surfaces normalized** - `src/pages/PaymentSuccess.tsx` no longer makes fake success claims unless persisted payment truth is actually `paid`; `src/pages/PaymentPending.tsx` and `src/pages/PaymentFailure.tsx` now load the order and align copy to persisted truth when order data is available.
4. **Verification outcome** - `npm run -s test -- src/lib/domain/__tests__/orders.test.ts` passed, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Storefront post-payment messaging now derives from persisted order truth, not route semantics alone.
- The normalization layer is bounded to storefront `payment_status`, `payment_method`, and `status`.
- `PaymentSuccess.tsx` no longer implies payment completion unless persisted truth is actually `paid`.
- `PaymentPending.tsx` and `PaymentFailure.tsx` now behave as truthful re-entry/status surfaces when `order_id` is available.
**Non-Blocking Residual Watchpoint:**
- Page-level tests remain thinner than mapper coverage, and `PaymentSuccess.tsx` still clears the cart on first render even when persisted truth is not `paid`; messaging is now honest, but that side effect remains route-triggered.
**What Did Not Change:**
- No payment completion was invented.
- No advanced checkout capability, no shipping engine, and no stock reservation or inventory hold semantics were introduced.
- No guest checkout inflation occurred.
- No admin or Cesarin OS scope drift occurred.
- No prior storefront drafting lanes S93-S102 or prior checkout foundation/payment-continuation lanes were reopened.
**Outcome:**
The post-payment order status normalization pass is now formally closed as accepted. Storefront order-detail and payment-return surfaces now reflect persisted post-payment truth more consistently, without claiming completed payment when the order still shows `pending` or `failed`, and without expanding scope into advanced checkout, shipping, stock reservation, guest persistence, or admin/Cesarin OS work. Commit: `122cd611bc3410f6f41508ee94797e611024c33e`.
---

### Checkout. Authenticated Payment Continuation Pass - 25 de marzo de 2026
**Scope:** `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `supabase/functions/create-payment/index.ts`, `src/actions/__tests__/checkout.test.ts`, and `src/lib/domain/validations/__tests__/checkout.schema.test.ts`.
**Problem Identified:**
The Secure Submission Bridge MVP already persisted authenticated orders truthfully, but the next real bottleneck remained payment continuation into the pre-existing Mercado Pago surface. The active authenticated path still depended on a fragmented client-side payment initiation step, did not expose a bounded continuation contract after persistence, and left `create-payment` too loose on session and ownership enforcement for a persisted order handoff.
**Implementation / Audit Sequence:**
1. **Authenticated payment-continuation pass landed** - Commit `4d525d19c63dfc373296ba4f4bdc2c72db3b73df` kept the accepted secure submission bridge intact and added the next bounded layer only: `src/actions/checkout.ts` now returns a continuation contract (`not_requested`, `ready`, `unavailable`), requests Mercado Pago continuation only after `checkout-submit` succeeds with a real `orderId`, and returns an honest persisted-order-but-payment-unavailable state when preference creation cannot be started.
2. **Hook path aligned to the accepted continuation contract** - `src/hooks/useCheckout.ts` now consumes the continuation result from `submitCheckout`; the old fragmented direct client-side payment initiation flow is no longer the active authenticated checkout path. Authenticated Mercado Pago orders now either redirect on `ready`, or surface a bounded error and move to the persisted order detail when continuation is unavailable. Guest checkout remains the existing honest WhatsApp-only handoff.
3. **Payment edge hardening completed** - `supabase/functions/create-payment/index.ts` now enforces bearer-token auth, resolves the user via `supabase.auth.getUser()`, scopes order lookup to `customer_id = user.id`, rejects non-Mercado Pago orders, rejects non-payable states, rejects empty order items, and maps the payer fields from the current persisted snake_case order columns `customer_name` and `customer_phone`.
4. **Verification outcome** - Targeted tests passed `8/8`, and `npm run -s typecheck` passed. Cold audit verdict: **ACCEPT**.
**Accepted Final Discipline:**
- Authenticated checkout now persists the real order first and then continues into Mercado Pago through a bounded, truthful continuation contract.
- `src/actions/checkout.ts` is now the active continuation boundary for authenticated checkout: `not_requested`, `ready`, and `unavailable` are explicit outcome states.
- Payment continuation is requested only after `checkout-submit` succeeds and yields a real persisted `orderId`.
- Persisted-order-but-payment-unavailable cases remain truthful: the order exists, but payment is not claimed as initiated or completed.
- Guest checkout remains an honest WhatsApp handoff and is not converted into persisted payment checkout.
**What Did Not Change:**
- No payment completion claim was introduced; this pass continues into the pre-existing Mercado Pago surface only.
- No advanced checkout flow, no shipping engine, and no stock reservation or inventory lock semantics were introduced.
- No admin or Cesarin OS scope drift occurred.
- No storefront drafting lanes S93-S102 were reopened.
**Outcome:**
The authenticated payment continuation pass is now formally closed as accepted. Persisted authenticated orders can continue into the existing Mercado Pago surface through a bounded, session-verified path; `ready` versus `unavailable` is explicit and truthful, guest checkout remains non-persisted WhatsApp handoff, and no advanced checkout, payment completion, shipping, or stock-reservation capability is implied. Commit: `4d525d19c63dfc373296ba4f4bdc2c72db3b73df`.
---

### Checkout Foundation. Secure Submission Bridge MVP - 25 de marzo de 2026
**Scope:** `src/actions/checkout.ts`, `src/hooks/useCheckout.ts`, `src/components/cart/CheckoutForm.tsx`, `supabase/functions/checkout-submit/index.ts`, and `supabase/migrations/20260325_checkout_order_items.sql`.
**Problem Identified:**
Storefront checkout still depended on client-side order construction and did not have a narrow server-side bridge that could validate the authenticated user, reload authoritative product pricing from Supabase, persist a real order flow, and keep the guest WhatsApp path honest. The smallest truthful next step was a secure submission bridge, not payment flow, not advanced checkout, and not full stock reservation.
**Implementation / Audit Sequence:**
1. **Initial implementation landed** - Commit `2a8ceb2` added the Secure Submission Bridge MVP through `src/actions/checkout.ts` plus `supabase/functions/checkout-submit/index.ts`, wired the real checkout form into that path, added minimal `orders`/`order_items` persistence support, and moved authoritative pricing back to the server by loading current `products` and `product_variants` rows before calculating totals.
2. **Corrective micro-fix applied** - Commit `d1aeb03` tightened two honesty gaps before acceptance: guest checkout no longer presents WhatsApp-only completion as if a persisted order had been created, and coupon discounts are no longer accepted if coupon usage persistence cannot be recorded consistently.
3. **Final acceptance after repair verification** - Acceptance was finalized only after the subsequent mechanical parse/typecheck repair restored `src/hooks/useCheckout.ts` to valid TypeScript without changing the accepted behavior of the bridge.
**Accepted Final Discipline:**
- Authenticated checkout now persists one real `orders` row plus corresponding `order_items` rows through the storefront action bridge and the Supabase Edge Function.
- Pricing is server-authoritative: client-submitted prices are not trusted, and totals are recalculated from current DB product/variant data.
- Guest checkout remains an honest WhatsApp-only handoff and does not claim persisted order creation.
- Coupon application remains consistent: discounted acceptance requires coupon tracking persistence to succeed.
**What Did Not Change:**
- No payment gateway expansion beyond the pre-existing Mercado Pago surfaces.
- No advanced checkout flow, no shipping engine, and no checkout execution automation.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, and no invented infrastructure.
- No full stock reservation or inventory lock semantics were introduced.
**Outcome:**
The Secure Submission Bridge MVP is now formally closed as the accepted checkout foundation layer. Storefront checkout can persist authenticated orders through a real server-side bridge with authoritative pricing and explicit `order_items`, while guest fallback remains truthfully non-persisted and coupon tracking cannot silently drift out of sync. Commits: `2a8ceb2`, `d1aeb03`.
---

### S102. Storefront Checkout-Readiness-to-Cart-Precision Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S101, strong single-product readiness cases could stop at general readiness language even when the current product data already supported a more exact last-step selector. The lane objective was to make the handoff more precise about what should actually go into the cart, without inventing selectors, without collapsing compare paths, and without turning the lane into cart execution or checkout execution.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S102 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a bounded selector-backed cart-precision layer after checkout-readiness already existed, keep selectorless strong paths at S101 readiness, and leave weak or unresolved paths conservative.
2. **Cold audit outcome** - Final cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- S100 recovery-to-commitment discipline remains preserved.
- S101 checkout-readiness gating remains preserved.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, no backend lane, and no cart execution or checkout execution were introduced.
**Audit Watchpoint:**
- Tipo remains the broadest selector and should be watched for future over-precision drift, but this was non-blocking in the accepted lane.
**Outcome:**
S102 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds selector-backed cart precision only when a materially purchase-defining selector exists in the active product context. Single-path survival alone is not enough, selectorless strong paths stay at S101 readiness, weak-support fallback/semantic/OOS survivors remain conservative, and compare/multi-option paths remain non-precise. Commit: 383028e.
---
### S101. Storefront Commitment-to-Checkout-Readiness Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S100, storefront commitment-ready closes were stronger, but checkout-readiness gating was still too broad. The lane objective was to add a bounded checkout-readiness drafting layer only for explicitly support-backed cases, keep weak and multi-option paths conservative, and avoid inflating ordinary single-path survival into fake readiness.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S101 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a bounded checkout-readiness layer after commitment already existed, using only existing branch support and without turning the lane into checkout execution, payment flow, or conversational checkout.
2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but acceptance was blocked because checkout-readiness gating remained too broad before reconciliation.
3. **Corrective micro-fix applied** - Commit 995cf91dc7a6986e40890e1ef160007a4ef4f5e7 narrowed readiness gating in three bounded ways:
   - remove generic readiness fallback when no supported selector/spec exists
   - require explicit support for the readiness check itself, or an explicitly support-backed recovery state already established in the branch
   - preserve conservative behavior for weak-support and multi-option paths
4. **Final cold audit outcome** - Final cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- S100 recovery-to-commitment discipline remains preserved.
- No orchestrator redesign, no retrieval redesign, no admin/Cesarin OS work, no backend lane, and no checkout execution were introduced.
**Outcome:**
S101 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds a bounded commitment-to-checkout-readiness step only when the readiness check is explicitly support-backed. Single-path survival alone no longer creates generic readiness, ordinary selectorless single-product paths no longer emit generic checkout-readiness language, weak-support fallback/semantic/OOS survivors remain conservative, compare/multi-option paths remain non-readiness, and a narrower recovery-only fallback remains allowed only for explicitly support-backed recovery states. Commits: `903fc65`, `995cf91`.
---
### S100. Storefront Recovery-to-Commitment Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S99, storefront objection recovery was locally grounded and commercially useful, but strong-support recovery could still stop one step too early. The remaining lane objective was to harden the post-recovery close inside already narrowed branches so supported recovery could move into a more commitment-ready next step without reopening broad browsing, inflating certainty, or weakening conservative behavior when support stayed weak.
**Implementation / Validation Sequence:**
1. **Initial storefront-only implementation existed** - S100 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to add a post-recovery commitment layer after objection recovery, keep that layer inside already narrowed branches, and allow stronger supported recovery to close more naturally while weak-support recovery stayed conservative.
2. **Validation outcome** - S100 was validated and closed as implemented. No additional lane expansion was introduced during reconciliation.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- S99 objection-to-recovery grounding remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.
**Outcome:**
S100 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin now adds a post-recovery commitment layer inside already narrowed branches: stronger recovery cases can land on a more commitment-ready close, weak-support recovery remains conservative, and two-option recovery stays focused and non-browsing instead of reopening the tree. No orchestrator redesign, retrieval redesign, or broader lane closure is claimed. Commit: `2eb233f`.
---
### S99. Storefront Objection-to-Recovery Hardening - 24 de marzo de 2026
**Scope:** src/lib/product-search-capsule.ts and src/lib/__tests__/product-search-capsule.test.ts.
**Problem Identified:**
After S98, storefront handoff behavior was commercially sharper, but a remaining late-stage bottleneck persisted when the customer raised a mild or medium objection after the field was already narrowed. The lane objective was to improve objection recovery without losing commercial momentum: keep recovery local to the already narrowed branch, allow one narrowly justified nearby alternative when appropriate, and stay persuasive without inventing value claims, fake savings, or pressure tactics.
**Implementation / Audit Sequence:**
1. **Initial storefront-only implementation existed** - S99 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve late-stage objection recovery without losing commercial momentum, keep recovery local to the already narrowed branch, allow one narrowly justified nearby alternative when appropriate, and stay persuasive without inventing value claims, fake savings, or pressure tactics.
2. **Cold audit outcome** - Cold audit verdict: **ACCEPT**.
**What Did Not Change:**
- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- S98 confidence-to-cart honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.
**Outcome:**
S99 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at recovering late-stage objections inside the already narrowed branch, cheaper now uses visible candidate-set price data honestly, worth_it remains grounded in supported signals, nearby alternatives stay narrow, and objection handoff stays at review/PDP level instead of drifting into pressure. S93/S94/S95/S96/S97/S98 boundaries were preserved without reopening retrieval or expanding scope. Commit: 12bedcc ('feat(storefront): harden objection-to-recovery drafting').
---
### S98. Storefront Confidence-to-Cart Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S97, storefront confidence language was sharper, but the remaining commercial bottleneck was the final transition from supported confidence into a concrete storefront next step. The lane objective was to improve that handoff honestly: distinguish review-only versus review-then-cart handoff by real branch support, keep weak-support cases conservative, and avoid pressure tactics or inflated purchase steering.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S98 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve the transition from supported confidence into a concrete storefront next step, distinguish review-only versus review-then-cart handoff honestly, keep weak-support cases conservative, and avoid pressure tactics or inflated purchase steering.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was blocked on one corrective micro-fix before formal closure.

3. **Corrective micro-fix applied** - Commit `4c7a46cd78e965987f4e11e1fc04b72b34906611` tightened fallback cart-promotion honesty in three bounded ways:
   - remove cart-adjacent promotion from single fallback OOS/semantic paths when mere singularity was the only support
   - require supported comparison or single surviving option plus explicit support (`specs` or `ai_sales_note`) before `review_then_cart`
   - preserve stronger exact/support-backed paths

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- S97 choice-to-confidence honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S98 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at turning supported confidence into a concrete next storefront action, with review-only versus review-then-cart handoff now matched more honestly to branch strength. Weak-support fallback cases remain conservative, while stronger exact/support-backed cases can progress naturally without inflated purchase steering. S93/S94/S95/S96/S97 boundaries were preserved without reopening retrieval or expanding scope. Commits: 8322b45 (`feat(storefront): harden confidence-to-cart handoff`), 4c7a46c (`fix(storefront): tighten single fallback cart gating`).

---

### S97. Storefront Choice-to-Confidence Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S96, storefront option-shaping was stronger, but the remaining commercial bottleneck was the moment after a likely choice already existed. The lane objective was to reinforce a leading product choice with short, modest, supported confidence language so the customer could move forward more comfortably without reopening unnecessary option trees or inventing certainty the catalog does not support.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S97 landed as a narrow drafting pass inside the existing product-search capsule behavior. Its mission was to improve choice-to-confidence behavior: reinforce a likely product choice with short, modest, supported confidence language, keep weak-support cases neutral, and mention only one nearby alternative when there is a real supported tradeoff.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was blocked on one corrective micro-fix before formal closure.

3. **Corrective micro-fix applied** - Commit `38005ee9ce6815011367e82338cf24abacedf7fc` corrected exact-branch confidence honesty in three bounded ways:
   - remove false single-option confidence in `EXACT` when multiple exact in-stock matches exist
   - keep single-option confidence only for true single exact matches
   - neutral multi-option exact wording plus multi-option handoff for multi-exact cases

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- S96 comparison-to-choice honesty remains preserved.
- No retrieval redesign, orchestrator redesign, ranking redesign, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S97 is now formally closed as a storefront-only behavior-hardening lane. Storefront Cesarin is better at reinforcing a likely choice with short, supported confidence language, while weak-support cases remain neutral and nearby alternatives stay limited to real supported tradeoffs. Exact single-option confidence is now gated honestly so multi-exact cases do not imply a single clear winner. S93/S94/S95/S96 boundaries were preserved without reopening retrieval or expanding scope. Commits: 0191d0c (`feat(storefront): harden choice-to-confidence drafting`), 38005ee (`fix(storefront): correct exact confidence honesty`).

---

### S96. Storefront Comparison-to-Choice Hardening - 24 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

After S95, storefront comparison drafting was directionally stronger, but it could still over-steer in cases where differentiator support was weak. The remaining storefront risk was not retrieval quality; it was comparison honesty. The lane objective was to harden comparison-to-choice behavior so the assistant only nudges toward a path when the catalog evidence actually supports that distinction.

**Implementation / Audit Sequence:**

1. **Initial storefront-only implementation existed** - S96 was implemented as a narrow storefront drafting pass inside the existing product-search capsule behavior, with no admin, Cesarin OS, or retrieval-lane expansion.

2. **First cold audit outcome** - The initial implementation was accepted structurally as the correct storefront lane, but reconciliation was held until one corrective micro-fix landed. The audit required stricter comparison honesty before formal closure.

3. **Corrective micro-fix applied** - Commit `46dda54ad6b1622ce037b935df07afbcadd3d7c7` tightened the comparison layer in four bounded ways:
   - stricter third-option gate
   - no soft-cue-only hierarchy
   - neutral handoff when differentiator support is weak
   - anti-array-order drift

4. **Final short re-audit outcome** - Short cold re-audit verdict: **ACCEPT**.

**What Did Not Change:**

- S93 exact-miss recovery remains preserved.
- S94 token-vs-semantic honesty remains preserved.
- S95 clarification-to-conversion shaping remains preserved.
- No retrieval redesign, ranking redesign, orchestrator change, or semantic-threshold change was introduced.
- No admin or Cesarin OS surface was touched.

**Outcome:**

S96 is now formally closed as a storefront-only behavior-hardening lane. Comparison-to-choice guidance is stronger, but it only steers when supported comparative evidence exists. Weak-difference cases stay neutral, third-option surfacing is gated more strictly, and S93/S94/S95 boundaries were preserved without reopening retrieval or expanding scope. Commit: 46dda54 (`fix(storefront): tighten comparison honesty`).

---

### S95. Storefront Clarification-to-Conversion Hardening - 24 de marzo de 2026



**Scope:** `src/lib/product-search-capsule.ts` and `src/lib/__tests__/product-search-capsule.test.ts`.



**Problem Identified:**



After S93 and S94, exact-miss recovery and token-recovery honesty were already in acceptable shape, but ambiguous or exploratory product-seeking turns could still flatten into broad browsing behavior. The remaining storefront opportunity was not retrieval or observability; it was sharper response shaping so undecided customers could narrow faster and move toward a product choice, PDP inspection, or cart action.



**Remediation Applied:**



1. **Single-axis clarification hardening** - The ambiguity path now asks one sharper narrowing question instead of drifting across multiple broad prompts. The selected axis stays commercially useful and bounded to what the query actually signaled:

   - device / format

   - flavor / profile

   - smoothness / intensity

   - beginner / simplicity posture

   - budget when still missing



2. **Decision-guide framing across suggestion branches** - The storefront drafting layer now derives a cautious comparison cue from existing product data only (`specs`, short `ai_sales_note`, or filtered short description when available) and uses it to contrast two recommendation paths instead of dumping a flat list.



3. **Conversion-oriented handoff tightening** - Suggestion turns now push toward a clearer next move: open the first most-relevant product card, compare with a second path only if needed, and then use the existing bag/cart action when one option is already clear.



4. **Scope held inside response shaping** - No retrieval expansion, no ranking redesign, no new telemetry surface, no admin tooling work, and no Cesarin OS reactivation. S95 stayed inside storefront drafting behavior only.



**What Did Not Change:**



- S93 exact-miss recovery remains preserved.

- S94 token-vs-semantic distinction remains preserved.

- `TOKEN_RECOVERY` wording and `retrieval_source` honesty were not reopened.

- No orchestrator redesign, RPC change, semantic threshold change, or ranking-system claim was introduced.

- No new admin/operator surface was added.



**Verification:**



- Focused capsule tests were expanded to cover:

  - sharper single-axis ambiguity clarification

  - beginner-oriented narrowing behavior

  - decision-guide contrast across semantic and token-recovery suggestion turns

- Mechanical validation passed:

  - `npm run test:run -- src/lib/__tests__/product-search-capsule.test.ts src/services/__tests__/ai-capsule-orchestrator.service.test.ts`

  - `npm run typecheck`

  - `npm run build`



**Acceptance Summary:**



- Cold audit verdict for S95: **ACCEPT**.

- S93/S94 baseline explicitly preserved.



**Outcome:**



Storefront Cesarin now handles ambiguous and exploratory commercial queries more usefully without pretending to know more than it does. Clarification is sharper, suggestion branches better explain how to choose, and the next-step handoff is more conversion-oriented, while retrieval logic and S94 honesty boundaries remain unchanged. Commit: 2faec10 (`feat(storefront): sharpen clarification-to-conversion drafting`).



---



### S94. Storefront Sales Recovery - Token Recovery Observability + Guardrail QA - 24 de marzo de 2026

**Scope:** `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `src/lib/ai-capsule-schemas.ts`, `src/lib/product-search-capsule.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/product-search-capsule.test.ts`, and `src/services/__tests__/ai-capsule-orchestrator.service.test.ts`.

**Problem Identified:**

S93 improved storefront sales recovery, but the remaining cold-audit reservation was honesty and observability around token-based catalog rescue. The runtime could recover a miss through lexical token overlap while still surfacing that result under the broader semantic lane, which blurred the difference between bounded token rescue and true embedding-based semantic proximity.

**Remediation Applied:**

1. **Minimal runtime distinction** - The product-search capsule contract now distinguishes token rescue from true semantic recovery with a dedicated `TOKEN_RECOVERY` match strategy plus a `retrieval_source` field (`DIRECT_EXACT`, `EMBEDDING_SEMANTIC`, `TOKEN_RECOVERY`, `NONE`).

2. **Truthful drafting and UI labeling** - Token-rescued suggestions remain commercially useful, but the drafting now explicitly frames them as name/term coincidence rather than semantic proximity. The storefront UI also labels this surface distinctly as `Coincidencias por Nombre`.

3. **Telemetry observability** - `concierge.service.ts` now persists `capsule_retrieval_source` alongside the existing capsule execution and match-strategy telemetry so runtime logs no longer silently flatten token rescue into the semantic lane.

4. **Guardrail QA closure** - Focused orchestrator tests now verify the activation boundaries that mattered to the audit:
   - token recovery activates only when `requires_semantic_expansion === false`
   - token recovery does not activate when `requires_semantic_expansion === true`
   - weak lexical overlap does not get promoted into a meaningful nearby match
   - true semantic recovery remains a separate orchestrator path

**Verification:**

- `ai-capsule-orchestrator.service.ts` confirms token rescue is only considered on the non-semantic-expansion path and now stamps the real retrieval source into capsule context.
- `product-search-capsule.ts` confirms drafting and match strategy now distinguish `TOKEN_RECOVERY` from `SEMANTIC`.
- `AIConcierge.tsx` confirms the storefront label `Coincidencias por Nombre`.
- Focused tests passed for both drafting and orchestrator path selection.
- Acceptance audit verdict for S94: **ACCEPT**.

**Outcome:**

The key S93 reservation is now closed without reopening the architecture. Storefront Cesarin still recovers exact-product misses with bounded token rescue when useful, but token recovery is no longer silently conflated with true semantic proximity in contract, drafting, telemetry, UI labeling, or QA. Commit: 41b8e6e (`feat(storefront): distinguish token recovery from semantic search`).

---

### S93. Storefront Sales Recovery Flow Hardening - 24 de marzo de 2026

**Scope:** `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`, `src/components/ui/ai/AIConcierge.tsx`, and `src/lib/__tests__/product-search-capsule.test.ts`.

**Problem Identified:**

The storefront assistant could still fall into weak commercial recovery patterns when an exact product was not found. Miss handling, ambiguity prompts, and next-step storefront handoff were functional but not sharp enough for a sales assistant trying to keep the customer moving toward a real product, PDP, or cart action.

**Remediation Applied:**

1. **Exact-match miss recovery hardening** - The orchestrator added a bounded token-based catalog recovery path for exact-lookups where `requires_semantic_expansion === false`, using real local product data rather than dead-end failure copy.

2. **Sharper storefront drafting** - `product-search-capsule.ts` improved product guidance across the active fallback tree:
   - better ambiguity questions
   - stronger exact-miss recovery wording
   - more useful out-of-stock alternative framing
   - clearer no-match recovery prompts

3. **Next-step conversion handoff** - Product suggestions and recovery copy now more clearly guide the user toward storefront actions such as opening the product card, viewing the PDP, or adding a product to cart, while staying honest about certainty, stock, and compatibility.

4. **Truthful storefront card handling** - `AIConcierge.tsx` tightened suggestion rendering so storefront cards better reflect the actual sales surface already returned by the capsule flow.

**Verification:**

- `ai-capsule-orchestrator.service.ts` confirms the bounded token-recovery query was added only to improve exact-product miss recovery in the storefront capsule path.
- `product-search-capsule.ts` confirms the drafting changes stay inside read-only product suggestion behavior and do not invent stock or compatibility certainty.
- Focused capsule tests were added and passed.
- Acceptance audit verdict for S93: **ACCEPT WITH RESERVATIONS**.

**Outcome:**

Storefront Cesarin became materially better at recovering from exact-product misses, asking sharper follow-up questions, framing real alternatives, and handing the user toward a product decision without overstating certainty. The remaining reservation was honesty/observability around token recovery being surfaced under the broader semantic lane, and that reservation was later closed by S94. Commit: 11ebc359a37552661d8fd31d00542cb46ae67977 (`feat(storefront): harden cesarin sales recovery flow`).

---

### A92. Cesarin OS Graph-Assisted Operator Workbench - Truthful Related Sets and Local Review Loop Inside `Conceptos` - 24 de marzo de 2026

**Scope:** `graqle.json`, `src/components/admin/cesarin/TabRepoGraph.tsx`, `src/services/admin/admin-repo-graph.service.ts`, and the already-accepted `Conceptos` repo-graph subview introduced by A91.

**Problem Identified:**

A91 closed the bounded read-only repo-graph subview, but the operator surface still required too much manual reconstruction to decide what to inspect next. The accepted next step was not new graph infrastructure; it was a more useful read-only workbench inside the same Cesarin OS lane, still local/static from `graqle.json`, still inside `Conceptos`, and still explicit about what the graph does not prove.

**Remediation Applied:**

1. **Accepted surface extended without leaving `Conceptos`** - A92 stayed inside the existing repo-graph subview. No new top-level Cesarin OS tab, no backend lane, no mutation path, no scope expansion beyond operator reading support.

2. **Truthful related-set derivation from the local graph** - `admin-repo-graph.service.ts` now resolves additional read-only inspector outputs from the selected node:
   - `containerNode`
   - `sameContainerNodes`
   - `sameTypeNodes`
   - `pathLocalNodes`
   - `nodeDirectory`

3. **Operator list scopes** - `TabRepoGraph.tsx` now lets the visible node list pivot between:
   - `General`
   - `Mismo contenedor`
   - `Mismo tipo`
   - `Ruta local`
   - `Review set`

4. **Quick context actions and related-surface cards** - The selected-node panel now includes `Copiar ruta`, direct scope pivots, and dedicated cards for same-container, same-type, and path-local surfaces so operators can continue a bounded reading pass without opening raw graph artifacts.

5. **Local review-set loop** - Operators can add and remove nodes from a dedicated review set inside the Repo Graph view. The review set is view-local reading support only; it is not persisted, not synced, and not a new backend state.

6. **Compact operator guidance** - The workbench now includes explicit guidance panels:
   - `Si muestra`
   - `No prueba`
   - `Inspeccion siguiente`

7. **Review-set honesty micro-pass folded into A92 closure** - Final wording was tightened so canon matches real behavior: the review set lives only inside the Repo Graph view, does not persist, and is lost on reload or when leaving the subview. Empty-state and filter messaging were also tightened so operators are not misled when filters hide review-set members.

**Verification:**

- `admin-repo-graph.service.ts` confirms the added related-set outputs are derived locally from static `graqle.json` data.
- `TabRepoGraph.tsx` confirms the operator scopes, quick actions, related cards, review-set add/remove behavior, and compact guidance panels exist in the accepted surface.
- The follow-up fix commit confirms review-set wording now states the real limits: local to the view, not persisted, lost on reload or exit.
- Acceptance audit verdict for A92: **ACCEPT**.

**Outcome:**

Cesarin OS now includes a graph-assisted operator workbench inside the existing `Conceptos` repo-graph subview. Operators can derive truthful related reading sets, pivot the visible list by scope, copy paths, assemble a local review set, and use compact guidance without leaving the console or inflating graph certainty. The lane remains read-only, local/static via `graqle.json`, and explicitly does not claim backend graph intelligence, runtime dependency proof, or live graph infrastructure. Commits: 599c0587bd9b068812fc8aa65a152ee1d14d5566 (`feat(cesarin): extend repo graph workbench`), ec0389a3badc1997ae0ed43aa1bad0be32edca21 (`fix(cesarin): tighten repo graph review set honesty`).

---

### A91. Cesarin OS Repo Graph Subview Closure � Local Read-Only Repo Inspection Inside `Conceptos` � 24 de marzo de 2026

**Scope:** `graqle.json`, `src/components/admin/cesarin/TabConcepts.tsx`, `src/components/admin/cesarin/TabRepoGraph.tsx`, `src/services/admin/admin-repo-graph.service.ts`, and the `TabConcepts` mount point inside `src/pages/admin/AdminCesarinOS.tsx`.

**Problem Identified:**

Cesarin OS had no bounded operator surface for reading the repository graph from inside the admin console. Repo graph inspection required leaving the workflow and opening raw artifacts manually. The lane goal was to add structural discovery inside `Conceptos` without inventing live graph intelligence, backend graph services, or runtime dependency claims.

**Remediation Applied:**

1. **Bounded placement inside `Conceptos`** � `TabConcepts.tsx` now gates two local modes: the existing compatibility tooling and a new repo graph inspector. The compatibility CRUD flow remained intact and mode-gated. No new top-level Cesarin OS tab was added.

2. **Static read-only graph service** � `admin-repo-graph.service.ts` statically imports local `graqle.json`, indexes `nodes` and `links`, and exposes read-only helpers for node search, overview counts, direct relations, nearby same-container nodes, and chunk previews. No backend fetch, no mutation path, no live sync.

3. **Operator repo graph subview** � `TabRepoGraph.tsx` renders:
   - search
   - type filter
   - selected node metadata
   - direct graph relations
   - nearby containment neighbors
   - chunk previews

4. **Truth labels preserved in UI** � The surface explicitly states:
   - `Read only`
   - local `graqle.json` consumption
   - no live backend
   - no runtime dependency proof
   - nearby nodes are containment neighbors, not confirmed impact

5. **Copy-only hygiene micro-pass folded into closure** � `TabConcepts.tsx` wording was tightened so compatibility mode no longer uses repo-graph vocabulary when describing the compatibility CRUD lane. This was a presentation cleanup only, not a new lane.

**Verification:**

- `graqle.json` confirmed to be a real graph-shaped artifact with explicit `links`.
- `admin-repo-graph.service.ts` confirmed read-only and local-only.
- `TabRepoGraph.tsx` confirmed operator-usable and honest about graph limits.
- `AdminCesarinOS.tsx` confirmed the feature remains mounted under `concepts` rather than as a separate top-level Cesarin module.
- Mechanical validation passed:
  - `npm run typecheck`
  - `npm run build`

**Outcome:**

Cesarin OS now includes a bounded repo graph operator subview inside `Conceptos`. Operators can inspect node metadata, direct graph relations, nearby containment neighbors, and chunk previews from local `graqle.json` without leaving the console. The lane is structurally closed, read-only, and acceptance-audited. No backend graph infrastructure was introduced. No runtime dependency certainty is claimed. Commits: 824a2ed2696933203d3bf3b9d247bac33ad040b9 (`feat(cesarin): add repo graph operator subview`), 99672e9d3da18e8170d25e7d2d2cf7747fc449c5 (`chore(cesarin): tighten concepts copy`).

---

### B1. Cesarin OS Intake & Review Consolidation — Cross-Surface Signal Truth Gap — 23 de marzo de 2026

**Scope:** Cross-surface UI consolidation. Four files: `src/services/admin/admin-eval.service.ts`, `src/components/admin/cesarin/ReviewDrawer.tsx`, `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/components/admin/cesarin/TabPilot.tsx`.

**Problem Identified:**

Operators working with the Cesarin OS pilot intake and review surfaces experienced a critical truth gap: two separate databases (`cesarin_signal_states` table tracking intake signal outcomes, `ai_evaluations` table tracking human evaluation scores) keyed on the same `analytics_id` had zero mutual visibility in operator UI. Same row could be reviewed in TabLearning (showing signal state: "revisada", "descartada", "convertida_regla", etc.) but operator opening ReviewDrawer for the same interaction saw no cross-reference to that signal state. PilotTelemetry displayed evaluation scores inline but not signal state outcomes. This forced operators to maintain dual cognitive maps of the same interaction's state across two separate surfaces.

**Remediation Applied:**

Four surgical changes closed the truth gap:

1. **Service Layer Batch Fetch** — `admin-eval.service.ts` added `getEvaluationsByIds(analyticsIds: string[]): Promise<Record<string, EvaluationData>>` function (mirrors existing `getSignalStatesByIds` pattern). Returns O(1) lookup map via `Record<string, EvaluationData>`. Guards empty input. Validates Supabase query success.

2. **ReviewDrawer Cross-Reference Panel** — `ReviewDrawer.tsx` imported `getSignalStatesByIds, SignalStateRow, SignalStatusDB` from signal states service. Added `SignalStatePanel` component (file-scoped) that renders signal state chip, ref_label, and handled_at date. On drawer open, parallel-loads both evaluation (existing) and signal state (new) via `Promise.all([getEvaluation(...), getSignalStatesByIds([...])])`. Panel positioned between Route/Capsule context section and Scoring section. Defines `SIGNAL_STATUS_CONFIG` mapping five signal statuses to label + color (revisada=blue, descartada=white/faded, convertida_regla=emerald, convertida_mejora=vape, resuelta=emerald).

3. **PilotTelemetry Inline Badges** — `PilotTelemetry.tsx` batch-fetches evaluations when `queryLog` changes. Passes `evalMap` and `signalStates` prop (from existing page-level hook, no redundant DB fetch). QueryRow component updated to render two status badges in "Revision" column before review button: (a) `★N` score badge (emerald ≥4, amber ≥3, red <3) + primary_tag tooltip, (b) signal state icon badge (→R for convertida_regla, →M for convertida_mejora, ✓ for resuelta, ✕ for descartada, 👁 for revisada) + signal status tooltip. Badges visible only when evaluation/signal state exist.

4. **TabPilot Import Cleanup** — Pre-existing breakage fixed: `PilotParityDiagnostics` import missing (line 15 now present). Lucide icons previously split across two import statements (lines 3-8 + line 20) consolidated into single import block. Unused catch variable naming (`err` → `_err` on lines 126, 147) corrected per ESLint naming convention.

**Characteristics:**

- No database schema changes; uses existing 1:1 tables (`ai_evaluations`, `cesarin_signal_states`).
- Service-layer batch fetch avoids N+1 queries; PilotTelemetry receives pre-fetched map as prop (no redundant fetches).
- All changes confined to UI/service layers; routing, orchestrator, guardrails untouched.
- Build verification: `npm run build` succeeds (v113-cc8c0f9), 0 typecheck errors, 0 ESLint errors (post-corrective).
- Cross-surface consistency: ReviewDrawer and PilotTelemetry share same signal state schema (`SignalStateRow`, `SignalStatusDB` enum).

**Closure Timeline:**

1. **Initial Implementation & Verification** (prior session) — All four changes implemented and verified live in repo. Build clean.
2. **Cold Audit Generation** (2026-03-23, commit 870fa6f) — Formal `B1_CROSS_SURFACE_AUDIT.md` generated with 11-section structure (scope, claimed changes, files inspected, surfaces affected, evidence, verification, cross-surface consistency, missing assets, closure readiness, questions for Codex, verdict).
3. **Codex Review 1 + Narrow Corrective Pass** (commit 1116428) — Codex returned ACCEPT WITH CORRECTIVE PASS due to TabPilot lint errors and import organization issues. Corrective pass: consolidated lucide-react imports, fixed unused catch variables (`_err` convention), lint clean (0 errors). Audit artifact updated.
4. **Codex Review 2 + Micro-Corrective Pass** (commit f11861b) — Codex returned ACCEPT WITH CORRECTIVE PASS due to stale audit artifact language. Documentary micro-corrective: updated section 4.5 (TabPilot remediated status), section 5.1 (artifact traceability), section 7.1 (alignment check), section 11 (verdict upgraded to "corrective-pass-complete").
5. **Codex Review 3 + Nano-Corrective Pass** (commit cc8c0f9) — Codex returned ACCEPT WITH CORRECTIVE PASS due to self-contradictory section 8.1 ("being generated now"). Nano-corrective: changed line 229 from ❌ "being generated now" to ✅ "complete (remediated via corrective passes)".
6. **Final Codex Review** (2026-03-23) — Codex issued final ACCEPT judgment. All blocking issues resolved. B1 structurally coherent, lint-clean, audit-artifact-aligned. Cleared for closure canon.

**Outcome:** Cross-surface truth gap closed. Operators now see both signal state (intake outcome) and evaluation score (quality assessment) in unified ReviewDrawer and PilotTelemetry surfaces without multiplied DB queries. Service layer extends existing batch-fetch pattern. UI integration is coherent and consistent. Codex acceptance: **ACCEPT**. Audit artifact: `B1_CROSS_SURFACE_AUDIT.md` (generated, remediated, closure-ready). Commits: 870fa6f (reconciliation + audit), 1116428 (code corrective), f11861b (documentary micro-corrective), cc8c0f9 (documentary nano-corrective). Build: v113-cc8c0f9, 0 typecheck errors.

---

### B2. Operator Simulation Workspace — Pass 1: Reusable Private Case Draft Minimum Loop — 23 de marzo de 2026

**Scope:** Operator QA tooling within Cesarin OS. Pass 1 target: minimum reusable private case draft persistence loop. Bounded to simulator, QA, and training case surfaces. Search/retrieval, semantic quality, and broad Cesarin OS redesign all explicitly out of scope.

**Context:** B1 closed (Codex ACCEPT, 2026-03-23). B2 opened as Operator Simulation Workspace macro wave. Pass 1 is not B2 completion — it is the minimum viable loop only.

**Delivered (Pass 1 + Corrective Micro-Pass):**

1. **`operator_case_drafts` table** — New migration `20260323_operator_case_drafts.sql`. Full RLS (select/insert/update/delete for admin_users). `source_type` check constraint (`review_drawer | qa_simulation`). `readiness_status` check constraint (`draft | needs_expected_outcome | ready`). Three indexes. `updated_at` trigger. Pattern matches existing `cesarin_signal_states.sql`.

2. **Type contract** — `PrivateCaseDraft` interface, `CaseDraftSourceType`, `CaseDraftReadinessStatus` added to `src/types/cesarin.ts`. `SimulationResult.user_input?: string` added to store real scenario user message. `SimulationSession.metadata.last_interaction_id?: string` added. `NavTab.id` union extended with `'casos'`.

3. **Service layer** — `src/services/admin/admin-case-drafts.service.ts` (new): `createCaseDraft`, `getCaseDrafts`, `updateCaseDraft`, `deleteCaseDraft`, `deriveCaseDraftReadiness` utility. Follows existing admin service pattern.

4. **ReviewDrawer creation point** — `ReviewDrawer.tsx` adds `handleSaveAsCaseDraft()` handler and "Guardar como Caso de Prueba" footer button. Creates draft from current interaction with real field mapping (input, observed_response, evaluation_summary, expected_outcome, route_or_capsule, detected_intent, evaluation_score, failure_reason). `deriveCaseDraftReadiness` determines status.

5. **TabQuality creation point** — `TabQuality.tsx` adds `handleSaveCaseDraft(result)` handler and `BookmarkPlus` button (visible only for non-PASS results). Real scenario input: `result.user_input ?? result.scenario_id`. Real evaluation_score: mapped from `result.score` (0–1 float) to 1–5 integer via `Math.max(1, Math.min(5, Math.round(result.score * 4) + 1))`. Judge path corrected: `user_message` uses `result.user_input ?? result.scenario_id`. Details drawer corrected: replaced hardcoded Spanish placeholder string with `{result.user_input ?? result.scenario_id}`.

6. **TabCaseDrafts queue** — `src/components/admin/cesarin/TabCaseDrafts.tsx` (new): minimal operator queue backed by `operator_case_drafts` table. Columns: Origen (source icon + label + date), Input (truncated with detected intent), Respuesta Observada (hidden mobile), Evaluación (star badge + failure_reason), Resultado Esperado, Estado (readiness badge). Row-level hover-reveal delete. Refresh button in header. Empty state.

7. **AdminCesarinOS wiring** — `casos` tab registered in `TAB_DEFINITIONS` (group: `lab`, icon: `BookmarkPlus`). Switch case `'casos' → <TabCaseDrafts />` added to `renderActiveTab()`.

8. **`savePilotFeedback` safety** — Previous iteration added a `supabase.from('pilot_feedback').insert()` with no migration in repo. Corrective micro-pass replaced DB write with explicit `throw new Error('not yet implemented — pending schema review')`. Compile contract preserved. TabPilot's existing toast-guarded catch absorbs the error without crashing.

9. **`simulate_cesarin.ts`** — `user_input: scenario.user_message` added to result construction so future simulation runs persist the real user text into `ai_simulation_reports.results`.

**Corrective Micro-Pass (231c57b):**
Codex rejected initial pass (6e34d7c) for four findings: (1) TabQuality judge path sent `scenario_id` as `user_message`; (2) draft `input` stored `scenario_id`; (3) details drawer showed hardcoded string; (4) `evaluation_score` unconditionally `null`. All four resolved in 231c57b.

**Residual Risk (Codex-acknowledged):**
Historical `ai_simulation_reports` rows created before this pass have no `user_input` field. Judge path and draft input fall back to `scenario_id` for those rows. No data is fabricated. New simulation runs will have `user_input` populated.

**Outcome:** Minimum reusable private case draft loop operational. Two creation surfaces (ReviewDrawer + TabQuality). One queue surface (TabCaseDrafts, admin-only). Persistence real and DB-backed. Codex acceptance: **ACCEPT WITH RESIDUAL RISK**. B2 pass 1 accepted as minimum operational loop — not as full B2 completion. Commits: 6e34d7c (initial pass 1), 231c57b (corrective micro-pass). Build: v113-f0e64e7, 0 typecheck errors.

### B2. Operator Simulation Workspace — Pass 2: Private Case Draft Maturation Loop — 23 de marzo de 2026

**Scope:** `src/components/admin/cesarin/TabCaseDrafts.tsx` only. Narrow operational upgrade to the existing private case draft surface. No new entities, no new service methods, no migrations, no simulator integration, no scenario generation, no learning/signals loop, no search/retrieval, no broad Cesarin OS redesign.

**Problem Addressed:**
After B2 pass 1, `TabCaseDrafts` was a passive read-only queue. Operators could see stored drafts but could not open, inspect, edit, or complete them. The `readiness_status` lifecycle (`draft | needs_expected_outcome | ready`) existed in schema and types but had no operator-facing operational signal — it was a label, not a loop.

**Delivered:**

1. **Row click opens maturation drawer** — Slide-in `AnimatePresence` drawer. Selected row highlighted with amber accent in the table. Pattern consistent with TabQuality details drawer.

2. **Captured source data (read-only)** — Drawer renders: input (full text), observed response (Cesarin's answer), detected intent, route/capsule, evaluation score. All sourced directly from already-stored `PrivateCaseDraft` fields. No external fetch.

3. **Editable maturation fields** — Three fields exposed for operator editing:
   - `expected_outcome` (textarea) — required for `ready` status
   - `failure_reason` (input) — surfaces the diagnostic note
   - `evaluation_summary` (textarea) — contextual notes

4. **Live `readiness_status` signal** — `deriveCaseDraftReadiness(expected_outcome.trim() || null, failure_reason.trim() || null)` called on every render from current form state. Badge and guidance message in the drawer update immediately as operator edits. `readiness_status` is now an active operational signal, not a static label.

5. **Save path** — `updateCaseDraft(id, { expected_outcome, failure_reason, evaluation_summary, readiness_status })` using the already-existing service method. Optimistic local state update applied — table row badge and drawer both reflect saved values immediately.

6. **Unsaved changes detection** — `hasUnsavedChanges` computed by normalizing form values (`trim() || null`) against persisted `selectedDraft` values. "Sin guardar" badge visible in drawer header when changes exist. Save button disabled when no unsaved changes or save in flight.

7. **Delete guard** — When the currently-open draft is deleted from the action column, the drawer closes automatically.

8. **Header counter** — Queue header now shows "X listos" count alongside total, making the `ready` lifecycle state visible at a glance.

**Correctness Verification (Codex Audit):**

- Form initialization (`useEffect([selectedDraft?.id])`) fires on id change; does not reset after save (same id) — correct.
- `hasUnsavedChanges` normalization handles null vs empty string — no false "unsaved" on drawer open.
- Optimistic update merges `updates` into `selectedDraft`; `hasUnsavedChanges` resolves `false` after save — save button correctly re-disables.
- `e.stopPropagation()` on action buttons prevents row-click conflict — correct.
- `liveReadiness` passed to `readiness_status` in save payload — persisted readiness is always co-derived from the same form state visible to the operator.
- Readiness guidance messages are consistent with `deriveCaseDraftReadiness` logic.

**Characteristics:**

- One file changed (`TabCaseDrafts.tsx`). Service (`admin-case-drafts.service.ts`) and types (`cesarin.ts`) unchanged — hash-verified.
- Build: `npx vite build` clean, 0 typecheck errors.
- Minor non-blocking UX risk: backdrop click dismisses drawer without unsaved-changes confirmation — consistent with existing drawer patterns in codebase; not a corrective blocker.

**Outcome:** `TabCaseDrafts` is no longer passive storage. Operators can open, inspect, edit, and save private case drafts through a real maturation loop. `readiness_status` is a live operational signal. B2 as macro wave remains open. Codex acceptance: **ACCEPT**. No corrective micro-pass required. Commit: 98bdf80. Build: 0 typecheck errors, Vite build clean.

---

## Auditorías Completadas (§9.10 → §9.29)

### A87. Pilot Miss Taxonomy Panel Semantic Stabilization — 6-Category Model Hardening — 22 de marzo de 2026

**Scope:** `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/hooks/admin/useAdminPilotOps.ts`.

**Problem Identified:**

The Piloto Operativo cockpit's `MissTaxonomyPanel` categorized query outcomes into a 6-category operational taxonomy (`product_search_miss`, `semantic_match_miss`, `fallback_miss`, `policy_miss`, `guardrail_miss`, `otro`) but faced four Codex acceptance blockers rooted in semantic truthfulness and category purity:

1. **Precedence ambiguity:** Categories were computed in arbitrary order; overlapping conditions (e.g., rows matching both "fallback_used" and "semantic_match_success=false") could be categorized incorrectly depending on evaluation order.

2. **Fallback narrowing weakness:** The `fallback_miss` category included queries with `fallback_used=true` regardless of context — fails to distinguish between "fallback helped resolve query" and "fallback was actual miss."

3. **Out-of-domain cardinality:** Out-of-domain queries (scope rejection, guardrail decision) were included in operational miss categories, inflating miss counts for queries the system correctly refused to handle.

4. **Otro escape hatch:** The catch-all `otro` category admitted rows that should be classified as operational decisions rather than misses — blurred semantic line between "system failed" and "system decided correctly."

Combined effect: The taxonomy did not accurately reflect operational outcomes. Categories claimed semantic meaning they did not possess; aggregates (e.g., "semantic_match_miss: 47") mixed true misses with non-miss operational states, making the cockpit strategically untrustworthy for operator decision-making.

**Remediation Applied:**

Three surgical micro-passes, each addressing one or more blockers:

**Pass 1 (8bf96f4): 6-Category Model with Strict Precedence**
- Established first-match-wins precedence order: `zero_product_cards` → `fallback_used` → `semantic_match_success` → `policy_query` → `guardrail_rescue` → `otro`
- Computed over `fullQueryLog` (unfiltered sample) — separate data flow from filtered `queryLog` used by table displays
- Implemented `categorized` tracking flag: once a row matches a category, skip remaining conditions
- Lock-step mapping: each category computed once per row, no overlap possible
- **Validation:** Simulation 6/6 PASS — deterministic precedence verified; full-sample vs filtered-sample separation confirmed correct behavior

**Pass 2 (fd8382e): Fallback Narrowing + Out-of-Domain Separation**
- Redefined `fallback_miss`: only rows where `fallback_used=true` AND `semantic_match_success=false` — semantically accurate "fallback became necessary because semantic failed"
- Extracted out-of-domain as explicit disqualifier: `!row.out_of_domain` guard added to `guardrail_rescue` category condition AND to `otro` fallback — out-of-domain rows now excluded from all operational miss categories
- `guardrail_rescue` condition tightened: `raw_analyst_intent === 'UNKNOWN' && capsule !== null && capsule !== ''` — rescues where guardrail injected tool call on unknown intent, confirmed by capsule routing
- **Codex blockers addressed:** (1) Precedence via strict ordering; (2) Fallback via AND condition; (3) Out-of-domain via guard; (4) Otro via narrowing
- **Validation:** Simulation 8/8 PASS — all four Codex scenarios verified; fallback/semantic interaction correct; out-of-domain properly excluded

**Pass 3 (9844516): Residual Bucket Purity**
- Final category `otro` narrowed to `!categorized && semantic_match_success === false && !out_of_domain` — only unmatched semantic queries that are in-domain
- Ensures `otro` contains only rows that are both a miss (semantic_match_success=false) and legitimately in-domain (not guardrail-rejected)
- Eliminates false `otro` entries where `out_of_domain=true` would have qualified the row despite out-of-domain status
- **Validation:** Simulation 4/4 PASS — residual purity verified; edge cases (out_of_domain=true with semantic_match_success=false) correctly excluded

**Characteristics:**

- No schema migration. No database changes. Taxonomy is computed in-memory.
- Full-sample computation (`fullQueryLog` with no RLS/date-range filtering) separates from table display (`queryLog` with user-scoped filtering).
- Three passes are sequential hardening, not independent fixes — each builds on precedence/separation established in prior passes.
- All changes confined to `PilotTelemetry.tsx`; hook exports unfiltered sample via `fullQueryLog`.
- Operator-facing taxonomy now semantically truthful: categories correspond to actual operational outcomes, not interpretation artifacts.

**Outcome:** The Miss Taxonomy Panel now accurately reflects six distinct operational categories with strict precedence, clear semantic meaning, and no overlap. Out-of-domain queries no longer inflate miss counts. Fallback misses are distinguished from fallback rescues. The `otro` category contains only true in-domain semantic misses. Codex acceptance criteria met. Lane closed. Commits: 8bf96f4 (6-category + precedence), fd8382e (fallback/out-of-domain), 9844516 (residual purity).

---

### A88. Cesarin OS TabLearning — Rule/Improvement Closure Semantics Clarity — 22 de marzo de 2026

**Scope:** `src/components/admin/cesarin/TabLearning.tsx`.

**Problem Identified:**

Operators could not clearly distinguish between the four possible outcomes when a friction signal was evaluated:

1. **Pending review** — signal awaiting evaluation; no state label
2. **Converted to rule** — signal became an active guideline; status label was "Directriz creada" but lacked outcome context
3. **Converted to improvement** — signal became a queued task; status label "Abierta en mejoras" used passive voice, unclear if action was taken or pending
4. **Reviewed without action** — signal was reviewed and rejected; status label "Descartada" sounded dismissive rather than decisive

**Semantic gaps:**
- No explicit "pending review" indicator for unacted signals
- Status labels did not convey what each outcome meant operationally
- Button copy ("Abrir en mejoras", "Descartar") lacked directness and clarity
- ref_label (ID of created rule/improvement) was shown but unmarked, ambiguous meaning
- Header instruction explained the action categories but did not guide operator toward understanding the four final states

**Remediation Applied (commit 3f2caf7):**

**Status Config — Added sublabels for operational context:**
Each status outcome now includes a descriptive sublabel shown beneath the primary label:
- `revisada` → "Evaluada sin acción" (reviewed, no change needed)
- `convertida_regla` → "Instrucción activa" (rule now guides responses)
- `convertida_mejora` → "En cola de mejoras" (improvement queued for action)
- `descartada` → "Evaluada, cerrada" (reviewed and closed)
- `resuelta` → "Problema solucionado" (issue resolved)

**Button Copy — Direct, action-oriented language:**
- "Abrir en mejoras" → "Crear mejora" (direct active voice; reduces ambiguity)
- "Descartar" → "Sin acción" (positive framing: it's a decision, not dismissal)

**Button Titles — Actionable intent:**
- Create rule: "Convertir en directriz activa que guíe respuestas futuras" (guides future responses)
- Create improvement: "Crear mejora en la cola de tareas" (queues a task)
- Review without action: "Marcar como revisada sin cambios requeridos" (clear decision)

**Pending Review Indicator:**
Added lightweight "Pendiente revisión" label for signals not yet acted upon, making review state explicit.

**ref_label Context — Explicit identifier marking:**
Changed ref_label display from "→ {value}" to "ID: {value}" so the nature of the reference is clear.

**Header Instruction — Action-oriented guidance:**
Refined instruction to explicitly enumerate the four possible outcomes:
"Para cada señal, elige el resultado: (1) crear directriz, (2) crear mejora, (3) revisar sin acción"

**Validation:**

Build verification — 2/2 PASS:
- `npm run typecheck` → 0 errors
- `npm run build` → v113-3f2caf7 ✓

Semantic clarity assessment:
- Pending state: now explicitly labeled "Pendiente revisión" when signal unacted
- Rule outcome: "Directriz creada" + "Instrucción activa" explicitly conveys that a rule is now active
- Improvement outcome: "Mejora creada" + "En cola de mejoras" clearly states a task was queued
- No-action outcome: "Revisada sin acción" + "Evaluada, cerrada" decisively marks as closed
- Button intent: all three actions now have direct, unambiguous copy

**Characteristics:**

- No behavioral changes. All action handlers (`handleCreateRule`, `handleCreateImprovement`, `handleDiscard`) remain unchanged.
- No telemetry impact. `ai_analytics` schema unchanged; no new fields, no data model changes.
- No A87 impact. The Miss Taxonomy Panel (A87) is untouched; no regression risk.
- No architectural changes. Component structure, interaction model, and state management preserved.
- UI/UX only. All changes are presentation layer — labels, text, sublabels, lightweight indicators.
- Scope remains bounded to TabLearning. TabRules, other Cesarin OS tabs, and telemetry unmodified.
- Strictly operator-facing. No changes to storefront, pilot logic, or guardrail behavior.

**Outcome:** Operators can now clearly distinguish four signal outcomes: pending review, converted to rule (active), converted to improvement (queued), or reviewed without action (closed). Semantic clarity is explicit at every step. Codex acceptance criteria met. Lane closed. Commit: 3f2caf7.

---

### A89. Cesarin OS Production Hardening Pack — Server-Trusted Auth, Gemini Resilience Preservation, & Real AI Evaluations Persistence — 22 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts` (lines 175-228, 1013-1028), `supabase/functions/cesarin-qa-judge/index.ts` (evaluate_turn action), `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/services/admin/admin-pilot-ops.service.ts`.

**Problem Identified:**

Three production-critical gaps were identified in the Cesarin OS hardening post-Wave 193:

1. **Gap 1 — Server-Trusted Auth Enforcement:** The `/api/cesarin` endpoint used JWT decode-only validation (manual base64 decode + JSON.parse) to extract the `body.is_pilot` flag. This is not server-trusted: the client controls the body payload, and JWT decode without verification is cryptographically meaningless. Requests with invalid or missing auth tokens could pass through if body parameters were manipulated. Authorization must be server-verified before any protected work (Gemini calls, tool execution, Judge invocation) proceeds. **Gap blockers:** No 403 Forbidden response path for unauthorized requests; all downstream work (AI, Judge) treated as implicitly authorized; trust source was client-controlled.

2. **Gap 2 — Gemini Resilience / Fallback (Assessment Required):** Analyst (20s timeout, 429/5xx handling with fallback to PRODUCT_SEARCH) and Sommelier (25s timeout, 429/5xx handling with on-brand fallback text) timeout and error-recovery paths required verification that they remained acceptable under production load. Text guarantee and JSON contract shape needed validation. **Assessment outcome:** Resilience logic acceptable; no changes needed.

3. **Gap 3 — Async QA Judge Persistence:** The `evaluate_turn` action in `cesarin-qa-judge` was persisting evaluation results to `ai_evaluations` table, but the implementation was mapping Gemini output to invented columns that do not exist in the real schema from `20260319_human_evaluation_loop.sql`. Persistence was not durable or queryable: inserted rows violated the real schema, or inserts silently failed. Additionally, A87 taxonomy restoration showed that PilotTelemetry.tsx had been modified during the Gap 3 work with properties not yet available in `admin-pilot-ops.service.ts`, creating a circular dependency. **Gap blockers:** evaluate_turn → ai_evaluations persistence is non-real (invented columns); A87 semantics partially broken by spillover changes; telemetry mapping incomplete.

**Remediation Applied:**

**Gap 1 — Server-Trusted Auth Enforcement (commit 35208ad):**

Replaced JWT decode-only with server-side verification in `customer-intelligence/index.ts` lines 175-228:

```typescript
// BEFORE: Decode-only (NOT server-trusted)
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
if (payload.is_pilot !== true) return 403;

// AFTER: Server-trusted verification
const { data, error } = await supabase.auth.getUser(bearerToken);
if (error || !data.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}
```

Effect: Unauthorized requests return 403 Forbidden **BEFORE any protected work** (Gemini calls, tool execution, Judge invocation). Trust source is server-verified Supabase Auth object, not client-controlled body parameters.

**Gap 2 — Gemini Resilience / Fallback (Assessment: No changes needed):**

Analyst resilience (lines 357-425): 20s timeout, 429/5xx handling with fallback to PRODUCT_SEARCH — logic remains acceptable.
Sommelier resilience (lines 750-842): 25s timeout, 429/5xx handling with on-brand fallback text — logic remains acceptable.
Text guarantee maintained. JSON contract shape preserved. **Assessment outcome:** No changes required; resilience paths acceptable under hardening scope.

**Gap 3 — Real ai_evaluations Persistence + A87 Restoration (commit 35208ad):**

**Part A: Truthful ai_evaluations Schema Mapping (cesarin-qa-judge/index.ts, evaluate_turn action, lines 92-140)**

Mapped Gemini output to REAL schema fields from `20260319_human_evaluation_loop.sql`:

| Field | Source | Transformation |
|-------|--------|-----------------|
| `analytics_id` | Payload FK | Direct |
| `score` | `evaluation.relevance_score` (1-10) | Normalized to 1-5: `ceil(relevanceNorm / 2)` |
| `primary_tag` | Constant | `'turn_quality_evaluation'` (meets NOT NULL constraint) |
| `secondary_tags` | `evaluation.issues` | Array of problem strings (TEXT[] type) |
| `severity` | Computed | `'critical'` if hallucination, `'high'` if relevance ≤ 4, `'medium'` if 5-6, `'low'` otherwise |
| `expected_outcome` | `evaluation.recommendation` | Direct nullable string |
| `comment` | Composite | Formatted audit trail: intent, hallucination, escalation, tone, issues |
| `evaluator_id` | Constant | `null` (Gemini evaluation, not human-conducted) |

**Removed from persistence (were invented, not in schema):** `evaluation_type`, `query`, `response_text`, `detected_intent`, `frustration_detected`, `zero_results`, `product_count`, `relevance_score`, `hallucination_detected`, `tone_score`, `escalation_offered`, `evaluated_at`.

**Part B: A87 Semantics Restoration (PilotTelemetry.tsx, reverted to commit ef012fb)**

All six original categories restored with strict first-match-wins precedence:
1. **Ruta degradada / error** — `gemini_api_error !== null || tool_error_count > 0` (restored)
2. **Producto buscado sin cards** — `capsule === 'product_search_integrity' && product_card_count === 0` (unchanged)
3. **UNKNOWN rescatado** — `raw_analyst_intent === 'UNKNOWN' && capsule !== null` (unchanged)
4. **Fallback sin cápsula clara** — `fallback_used && sommelier_fallback_reason === null` (restored condition)
5. **Dominio RAG** — `capsule === 'knowledge_rag_foundation'` (unchanged)
6. **Otro / misses sin categoría** — `!out_of_domain && semantic_match_success === false` (restored exclusion)

Frustration signal remains independent secondary signal (non-competing).

**Part C: Admin Telemetry Properties Restoration (admin-pilot-ops.service.ts)**

Four properties required by A87 taxonomy restored to PilotQueryRow interface and mapRow() function:

```typescript
gemini_api_error: string | null;
tool_error_count: number;
sommelier_fallback_reason: string | null;
out_of_domain: boolean;
```

Mapping: `tool_error_count` computed from filtering `analyst_report.tool_results` where `status === 'error'`.

**Validation:**

Build verification (commit 35208ad):
- `npm run typecheck` → 0 errors
- `npm run build` → Exit code 0, 24.49 seconds
- Vite bundle: 791.52 kB main bundle
- No new warnings or compilation errors

Hardening verification matrix:

| Component | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| **Gap 1 Auth** | 403 before protected work | ✅ PASS | `supabase.auth.getUser(bearerToken)` server-verified |
| **Gap 2 Analyst** | 20s timeout, 429/5xx handling | ✅ ACCEPTABLE | Untouched; logic preserved |
| **Gap 2 Sommelier** | 25s timeout, 429/5xx handling | ✅ ACCEPTABLE | Untouched; logic preserved |
| **Gap 3 evaluate_turn** | Persists to REAL schema only | ✅ PASS | No invented columns; conservative mapping |
| **Gap 3 Score mapping** | 1-10 → 1-5 normalization | ✅ PASS | `ceil(relevance/2)` applied consistently |
| **Gap 3 Severity** | Computed from hallucination + relevance | ✅ PASS | critical/high/medium/low thresholds verified |
| **A87 Categories** | All 6 restored with precedence | ✅ PASS | Reverted to ef012fb; first-match-wins confirmed |
| **A87 Frustration** | Independent secondary signal | ✅ PASS | Non-competing; co-occurs with any category |
| **Telemetry Properties** | 4 fields present for A87 | ✅ PASS | `gemini_api_error`, `tool_error_count`, `sommelier_fallback_reason`, `out_of_domain` |

**Characteristics:**

- No schema migration. `ai_evaluations` and `ai_analytics` tables unchanged.
- No client-side changes. Hardening is edge-function and admin-service focused.
- Gap 1 enforcement is cryptographic (server-verified JWT). Gap 2 resilience is behavioral (timeout/fallback logic). Gap 3 persistence is schema-faithful (no invented columns).
- A87 restoration is complete and bidirectional (PilotTelemetry + admin service synchronized).
- Scope strictly bounded: only files touched are customer-intelligence (auth + Judge invoke payload), cesarin-qa-judge (evaluate_turn mapping), PilotTelemetry (revert), admin-pilot-ops.service.ts (telemetry restoration).
- No behavioral changes to pilot activation, guardrail logic, capsule routing, or any AI-driven features.
- All changes are production-hardening only: cryptographic trust, schema truthfulness, and operator-facing semantics restoration.

**Outcome:** Three critical production gaps are now closed. (1) Auth enforcement is server-trusted via Supabase Auth.getUser() verification, returning 403 Forbidden BEFORE any protected work for unauthorized requests. (2) Gemini resilience paths (Analyst 20s + Sommelier 25s timeouts, 429/5xx handling, fallback contracts) are verified acceptable and remain preserved. (3) QA Judge persistence to `ai_evaluations` is now truthful, mapping only to real schema fields with conservative transformations (relevance normalization, severity computation, composite comment trail). A87 miss taxonomy is fully restored to its original semantic state with all six categories, strict precedence, and independent frustration signal. No spillover remains. Build verified exit code 0. Codex acceptance: ACCEPT. Final commit: 35208ad. Lane closed.

---

### A90. Cognitive Integrity Pack — Analyst Contract, Routing Truth, Parse Hardening & Telemetry Closure — 22 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`.

**Why Opened After A89:**

Post-A89 macro prioritization by Codex identified structural coherence gaps in the cognitive layer before the Operator Surface Consolidation Pack (macro wave B) could be responsibly executed. Customer-facing truth and downstream telemetry depended on resolving these contradictions. Four root contradictions were confirmed:

1. **Missing Analyst Contract for COMPATIBILITY_CHECK:** The Analyst JSON output contract (intent enum, line 297) did not list `COMPATIBILITY_CHECK` as a valid intent, yet Analyst training rules explicitly instructed it to emit that intent, and guardrail logic depended on it. Contract, training, and runtime were misaligned.

2. **Hollow Compatibility Routing Assumption:** A guardrail injection path existed for `check_compatibility` tool injection on `COMPATIBILITY_CHECK` intent, but no dedicated client-side capsule router or executor existed for `compatibility_check`. Any pre-routing attempt would fall through to `UNKNOWN_CAPSULE` in the concierge, not to a real handler.

3. **Parse Fragility / Contract-Validation Weakness:** Analyst and Sommelier JSON parsing relied on regex-based extraction (`/\{[\s\S]*\}/` match) with no contract validation after parse. An invalid or malformed nonempty response could continue as an apparently valid structured success — no intent validation, no required-field guards, and the degradation condition (`geminiError && !rawAnalystText`) only triggered when `rawAnalystText` was empty, meaning malformed nonempty output bypassed degradation entirely.

4. **Telemetry Truth Ambiguity:** The `routed_capsule: null` field emitted by Sommelier could mean either (a) capsule was pre-routed before Sommelier received the turn, or (b) the turn was fallback-handled by Sommelier. No field distinguished these semantics. Additionally, client-owned telemetry for capsule paths (`logAITelemetry` in `concierge.service.ts`) did not extract or persist `routing_path` even though the edge function included it in the debug payload.

**Implementation Pass Summary:**

**Initial Pass (Cognitive Integrity Pack v1):**

- Added `COMPATIBILITY_CHECK` to Analyst intent enum in JSON contract (line 297) — aligned contract with training
- Added dedicated `compatibility_check` capsule router block between CART_OPERATION and OUT_OF_DOMAIN handlers
- Replaced regex-based Analyst JSON extraction with layered parsing: direct JSON.parse first, regex fallback only if needed; added intent validation against `VALID_INTENTS` array and `tool_calls` array type check
- Added `analystParseValid` flag; hardened Sommelier parse with empty-text guards and strict contract checks
- Added `routing_path` field (`'pre_routed'` | `'fallback_handled'`) to all capsule router debug payloads and edge-persisted Sommelier analytics

**First Codex Rejection:** Three findings:

1. COMPATIBILITY_CHECK route was hollow end-to-end — the `compatibility_check` capsule router returned `requires_client_capsule: true` with `capsule_name: 'compatibility_check'`, but no client-side handler existed; concierge falls through to UNKNOWN_CAPSULE generic path
2. `routing_path` was not persisted for client-owned capsule telemetry — only edge-owned (Sommelier) paths had it in `ai_analytics`
3. Analyst invalid-output degradation condition (`geminiError && !rawAnalystText`) only triggered degradation on empty text; malformed nonempty output continued as if valid

**First Corrective Lane — Compatibility Route Closure + Telemetry + Analyst Rigor:**

- **PATH 2 chosen** (remove fake pre-routing): Deleted the `compatibility_check` capsule router entirely; `COMPATIBILITY_CHECK` intent now truthfully falls through to Sommelier fallback path, which has access to `compatibilityOutput` data and responds per persona rules — this matches actual runtime design
- Corrected `preRoutedIntents` list: removed `COMPATIBILITY_CHECK`; now only `PRODUCT_SEARCH`, `POLICY_INQUIRY`, `CART_OPERATION`, `OUT_OF_DOMAIN` are `'pre_routed'`; all others (including `COMPATIBILITY_CHECK`) are `'fallback_handled'`
- Fixed Analyst degradation condition: changed `if (geminiError && !rawAnalystText)` to `if (geminiError || !analystParseValid)` — malformed nonempty Analyst output now explicitly degrades instead of silently continuing

**Second Codex Rejection (Micro-Lane):** One remaining finding — `routing_path` was still not persisted for client-owned capsule telemetry despite being available in `data.debug.routing_path` sent by the edge function.

**Final Micro-Lane — routing_path Persistence Closure:**

- Added `routing_path?: 'pre_routed' | 'fallback_handled' | null` to `logAITelemetry` function signature
- Added `routing_path: fields.routing_path ?? null` to `ai_logic_debug` JSONB in the insert payload
- Added `routing_path: data.debug?.routing_path ?? null` to all three capsule `logAITelemetry` call sites: `product_search_integrity`, `knowledge_rag_foundation`, `cart_operator`

**Characteristics:**

- No schema migrations. `ai_analytics` table structure unchanged; `routing_path` persisted into existing `ai_logic_debug` JSONB column.
- No client UI changes. No operator surface changes. No capsule execution behavior changes.
- `COMPATIBILITY_CHECK` remains a valid Analyst intent (in contract and training); it is simply fallback-handled by Sommelier rather than pre-routed to a non-existent capsule.
- `routing_path: 'pre_routed'` is now truthfully stored in `ai_analytics` for turns handled by `product_search_integrity`, `knowledge_rag_foundation`, and `cart_operator` capsules.
- `routing_path: 'fallback_handled'` is truthfully stored for turns handled by Sommelier (COMPATIBILITY_CHECK, INVENTORY_OUTLOOK, ORDER_TRACKING, CHIT_CHAT, UNKNOWN).
- Analyst degradation is now safe and explicit: any contract violation (invalid intent, non-array tool_calls, parse error) triggers the PRODUCT_SEARCH safe fallback with reason `'fallback_due_to_analyst_degradation'`.
- Macro Wave B (Operator Surface Consolidation Pack) remains deferred; not opened in this lane.

**Outcome:** All four root cognitive contradictions resolved. Contract, training, and runtime are now coherent for all intent paths. Parse fragility is hardened with layered validation and explicit degradation. Routing semantics are truthfully persisted end-to-end across both server-owned and client-owned telemetry. Codex acceptance: ACCEPT (final, after two corrective passes). Macro Wave A (Cognitive Integrity Pack) is closed.

---

### A86. Knowledge Capsule Input Contract Integrity — is_ambiguous Zod Gap — 21 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts`, `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

`knowledgeToolSchema` required `is_ambiguous` as a hard `z.boolean()` with no default — the symmetric gap to A82, which closed the same defect on `productSearchToolSchema` but did not extend the fix to the knowledge schema. Two independent code paths produced inputs missing the field, causing Zod validation to fail in `executeKnowledgeCapsule` and the capsule to return a DEGRADED response before any real RAG execution:

1. **POLICY_INQUIRY guardrail injection path:** The injection block pushed `{ query: query || '' }` — `is_ambiguous` was absent. Every query reaching the knowledge capsule via guardrail injection (Analyst classified POLICY_INQUIRY but omitted the tool call, or guardrail promoted UNKNOWN → POLICY_INQUIRY via keyword match) degraded at schema validation.

2. **Analyst few-shot training gap:** The single `knowledge_rag_foundation` few-shot example (example 2: "¿cuál es la política de envíos?") omitted `is_ambiguous`. The Analyst was trained to emit policy tool calls without the field, causing schema failures on Analyst-generated paths as well.

Combined effect: `executeKnowledgeCapsule` returned `buildDegradedKnowledgeContract('SCHEMA_ERROR', ...)` immediately on every POLICY_INQUIRY interaction, producing "Actualmente no puedo consultar el manual de políticas de forma automática. ¿Deseas contactar a un asesor humano por WhatsApp?" for all policy questions. The knowledge capsule had never executed real RAG retrieval in production.

The `is_ambiguous` parameter is not decorative — `evaluateKnowledgeRAGTree` gates `HIGH_CONFIDENCE_POLICY_MATCH` on `topScore >= 0.82 && !is_ambiguous`. The `.default(false)` value matters for output quality: specific policy questions with `is_ambiguous: false` can resolve to `HIGH_CONFIDENCE_POLICY_MATCH`; guardrail-injected queries with `is_ambiguous: true` correctly resolve at most to `MODERATE_CONFIDENCE_MULTI_SOURCE`.

**Remediation Applied (commit d35b1ea):**

**Defense-in-depth (`ai-capsule-schemas.ts:14`):**

Changed `is_ambiguous: z.boolean()` to `is_ambiguous: z.boolean().default(false)`. Any future call site that omits the field recovers silently. `false` is the conservative default: specific behavior (allows `HIGH_CONFIDENCE_POLICY_MATCH` when similarity is sufficient) rather than forcing multi-source fallback.

**Guardrail injection fix (`index.ts`, POLICY_INQUIRY injection block):**

Added `is_ambiguous: true` to the injected args. Guardrail-injected policy queries represent queries the Analyst could not specifically classify — inherently broad/unresolved, therefore `is_ambiguous: true` is semantically correct and prevents false `HIGH_CONFIDENCE_POLICY_MATCH` on low-specificity queries.

**Few-shot contract correction (`index.ts`, example 2):**

Added `"is_ambiguous": false` to the `knowledge_rag_foundation` args in example 2 ("¿cuál es la política de envíos?"). This is a specific policy question — `false` is the correct value and enables the correct match strategy tier.

**Validation:**

Zod contract simulation — 15/15 PASS:

| Case | Result |
| --- | --- |
| Regression proof: original schema fails on `{ query: '...' }` (no `is_ambiguous`) | PASS |
| Guardrail injection with `is_ambiguous: true` → schema passes, value = `true` | PASS |
| Analyst-driven `is_ambiguous: false` → schema passes, value = `false` | PASS |
| Broad policy query `is_ambiguous: true` → schema passes | PASS |
| Defense-in-depth: absent field defaults to `false` | PASS |
| Greeting path unaffected; schema change is additive | PASS |
| Injection / Analyst / old-pattern paths no longer trigger SCHEMA_ERROR | PASS ×3 |

Live deploy probes — 4/4 PASS:

| Query | Result |
| --- | --- |
| "¿hacen envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "¿cuál es la política de envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "¿cómo manejan pagos y envíos?" | `capsule_name: knowledge_rag_foundation` · `is_ambiguous: false` in tool_args · no DEGRADED fallback ✓ |
| "hola" | Sommelier path · no capsule delegation · greeting response confirmed ✓ |

**Live observation:** All three policy probes showed the Analyst emitting `is_ambiguous` directly in tool call args — guardrail injection did not fire (`injected_tools: []` on all probes). The corrected few-shot example is immediately effective in Analyst output, confirming the training path is the primary route for policy queries.

**Characteristics:**

- No schema migration.
- No client changes.
- No router redesign.
- No capsule redesign.
- Symmetric fix to A82 — same pattern, applied to the knowledge schema.
- `.default(false)` is permanent defense-in-depth; future injection sites are covered automatically.

**Outcome:** `POLICY_INQUIRY` interactions no longer fail knowledge capsule contract validation. Policy questions now reach real RAG retrieval and return grounded answers. The "Actualmente no puedo consultar el manual de políticas" degraded fallback is no longer triggered by missing `is_ambiguous`. Commit: d35b1ea.

---

### A85. Structured Guardrail Decision Telemetry — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`.

**Problem Identified:**

Key AI-routing decisions were operationally invisible in persistent telemetry. A single `ai_analytics` row could not reconstruct what the Analyst classified, whether a guardrail override fired, which tool calls were injected vs Analyst-generated, or whether a capsule succeeded or degraded. Five distinct blind spots were confirmed:

1. **Analyst → guardrail intent delta not persisted.** `logAITelemetry` received only the guardrail-resolved `detected_intent`. `analystReport.intent` (the raw Analyst output before any override) was discarded after the guardrail chain. When diagnosing a wrong response, it was impossible to determine whether the Analyst classified incorrectly or a guardrail override misfired.

2. **Guardrail-injected tool calls not visible.** Each injection block tagged its tool call with `reason: 'guardrail_injection'` on the runtime object, but this field was never extracted into telemetry. A83/A84 guardrail hardening was therefore unverifiable from production `ai_analytics` rows — confirmation required ephemeral edge function logs.

3. **Capsule execution outcome not persisted.** All three capsule call sites in `concierge.service.ts` hardcoded `capsule_match_success: true`, `fallback_used: false`, and `error_type: null` regardless of the actual capsule contract's `execution_status` and `match_strategy`. A DEGRADED capsule was indistinguishable from a clean EXACT match in telemetry — production DEGRADED rate was reported as 0% regardless of reality.

4. **Cart path `detected_intent` misclassified.** The cart capsule call site passed `detected_intent: 'search'`. Every `CART_OPERATION` interaction was logged under the wrong intent label — querying `WHERE detected_intent = 'cart_operation'` returned zero rows even when cart capsules fired correctly.

5. **Specific guardrail override events not queryable.** Which override rule activated (COMPATIBILITY_FORCE, UNKNOWN_RESOLVE_*, TERMINAL_RECOVERY) was only in `console.warn` output — not in any persistent field.

**Remediation Applied (commit be461cb):**

**`index.ts` — Guardrail telemetry struct:**

`analystIntent` captured immediately after `analystReport` is parsed, before any guardrail override modifies `intent`. A `guardrailOverrides: string[]` array initialized before the override chain; each block that changes `intent` pushes its label:

- `COMPATIBILITY_FORCE` — Block 1 (compatibility signal overrides non-COMPATIBILITY_CHECK intent)
- `UNKNOWN_RESOLVE_INVENTORY` / `UNKNOWN_RESOLVE_POLICY` / `UNKNOWN_RESOLVE_PRODUCT` / `UNKNOWN_RESOLVE_CHIT_CHAT` — Block 2 (UNKNOWN/CHIT_CHAT resolution)
- `TERMINAL_RECOVERY` — Block 3 (unconditional UNKNOWN → PRODUCT_SEARCH fallback)

After the injection chain, a `guardrailTelemetry` struct is assembled:

```js
const guardrailTelemetry = {
    analyst_intent: analystIntent,
    guardrail_intent: intent,
    guardrail_overrides: guardrailOverrides,
    injected_tools: toolCalls
        .filter(c => c.reason === 'guardrail_injection')
        .map(c => c.name)
};
```

`guardrailTelemetry` is appended to the `debug` payload of all three capsule router responses (product search, knowledge RAG, cart operator) and to the OUT_OF_DOMAIN server-side `ai_logic_debug` insert.

**`concierge.service.ts` — Client telemetry extraction:**

`logAITelemetry` signature extended with five new optional fields: `analyst_intent`, `guardrail_overrides`, `injected_tools`, `capsule_execution_status`, `capsule_match_strategy`. All five persisted into `ai_logic_debug` JSONB with `?? null` / `?? []` safe defaults.

At each capsule call site:

- `analyst_intent`, `guardrail_overrides`, `injected_tools` extracted from `data.debug?.guardrail_telemetry`
- `capsule_execution_status` from `capsuleContract.execution_status`
- `capsule_match_strategy` from `capsuleContract.match_strategy`
- `capsule_match_success` replaced: `execution_status === 'SUCCESS'` (was hardcoded `true`)
- `fallback_used` replaced: `match_strategy === 'FEATURED_FALLBACK' || 'NO_MATCH'` for search; `LOW_CONFIDENCE_FALLBACK || NO_MATCH` for knowledge (was hardcoded `false`)
- `error_type` replaced: `'EDGE_ERROR'` when `execution_status === 'FAILED'` (was hardcoded `null`)
- Cart path `detected_intent` corrected: `'cart_operation'` (was `'search'`)

Sommelier/generic path: all five new fields absent from edge response — fall back to `null`/`[]`, no crash, no noise.

**Validation:**

Simulation — 23/23 PASS across 5 required cases + 1 bonus:

| Case | Result |
| --- | --- |
| Guardrail override (COMPATIBILITY_FORCE) | `analyst_intent=PRODUCT_SEARCH`, `guardrail_intent=COMPATIBILITY_CHECK`, delta persisted ✓ |
| Guardrail injection (product_search_integrity) | `injected_tools=['product_search_integrity']`, override array empty ✓ |
| Product capsule SUCCESS/EXACT | `capsule_execution_status=SUCCESS`, `capsule_match_strategy=EXACT`, `capsule_match_success=true` ✓ |
| Cart path | `detected_intent='cart_operation'` (not 'search') ✓ |
| Sommelier/generic path | all five new fields `null`/`[]`, no regression ✓ |
| TERMINAL_RECOVERY (bonus) | `analyst_intent=UNKNOWN`, `guardrail_intent=PRODUCT_SEARCH`, both labels present ✓ |

Live runtime verification passed post-deploy.

**Characteristics:**

- No schema migration.
- No new table.
- All new fields are additive keys inside existing `ai_logic_debug` JSONB column — fully backward-compatible.
- No client UI changes.
- No sensitive data captured (no query content beyond what was already persisted).
- Sommelier/generic path telemetry unaffected — graceful null defaults on all new fields.

**Outcome:** A real runtime request can now be diagnosed from a single `ai_analytics` row across: raw Analyst intent → guardrail overrides → injected tools → router selection → capsule execution status → final path. A83/A84 guardrail hardening is now verifiable from production telemetry without reading edge function logs. Capsule DEGRADED rate is no longer masked. Cart interactions are correctly classified. Commit: be461cb.

---

### A84. Cart Guardrail Injection Gap — CART_OPERATION Without Safety Net — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

`CART_OPERATION` was the only capsule-routable intent with no guardrail injection safety net. Every other routable intent (`PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, `COMPATIBILITY_CHECK`) had a corresponding injection block that would inject the canonical tool call if the Analyst omitted it. `CART_OPERATION` had none.

After A83 closed the OR-arm weakness in the cart router (strict AND: `intent === 'CART_OPERATION' && cartOperatorCall`), the injection gap became a functional failure path: if the Analyst emitted `intent: CART_OPERATION` with `tool_calls: []`, the strict AND condition would evaluate to `false` — no cart capsule dispatch — and the interaction would fall through to the Sommelier general response path. The user's cart intent would receive a conversational reply with no cart action.

**Remediation Applied (commit 109e150):**

Added a symmetric injection block for `CART_OPERATION`, consistent with the pattern established for all other routable intents:

```js
if (intent === 'CART_OPERATION' && !toolCalls.some(c => c.name === 'cart_operator')) {
    console.warn('[GUARDRAIL] Injecting cart_operator tool_call (Analyst omitted it)');
    toolCalls.push({ name: 'cart_operator', args: { action: 'ADD', product_ref: query || '', quantity: 1 }, reason: 'guardrail_injection' });
}
```

Conservative defaults: `action: 'ADD'`, `quantity: 1`, `product_ref: query`. These are intentional — the cart capsule (`executeCartOperatorCapsule`) is responsible for downstream ambiguity resolution and mutation proposal validation. The injection's role is only to ensure a routable tool call exists so the strict AND router can dispatch; it does not pre-determine the cart outcome.

**Validation:**

Simulation — 4/4 PASS:

| Case | Result |
| --- | --- |
| CART_OPERATION with no tool call → injection fires | cart_operator injected ✓ |
| CART_OPERATION with existing cart_operator → no duplication | injection skipped ✓ |
| PRODUCT_SEARCH path unchanged | product search unaffected ✓ |
| CHIT_CHAT/greeting path unchanged | no injection, Sommelier path ✓ |

Live probe:

| Query | Result |
| --- | --- |
| "agrega un vape de uva al carrito" | `capsule_name: cart_operator` · cart path confirmed ✓ |

**Characteristics:**

- No schema migration.
- No client changes.
- No routing logic changes (router conditions from A83 unchanged).
- No behavior change for any non-CART_OPERATION path.
- Symmetric with existing injection pattern for all other routable intents.
- Conservative defaults; ambiguity handled downstream by cart capsule.

**Outcome:** `CART_OPERATION` now has a complete guardrail injection safety net. All five capsule-routable intents (`PRODUCT_SEARCH`, `POLICY_INQUIRY`, `INVENTORY_OUTLOOK`, `COMPATIBILITY_CHECK`, `CART_OPERATION`) are structurally covered. The Analyst can omit a tool call for any routable intent without producing a silent misroute to Sommelier. Commit: 109e150.

---

### A83. Router Precedence Hardening — OR-Arm Capsule Dispatch Weakness — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

All three capsule router blocks used OR-arm dispatch conditions that allowed tool call _presence alone_ — without intent confirmation — to trigger capsule delegation. This created a structural misroute risk in any Analyst output that emitted multiple tool calls:

- **Product search router** (pre-A83): `(intent === 'PRODUCT_SEARCH' && searchCapsuleCall) || (searchCapsuleCall && intent !== 'COMPATIBILITY_CHECK' && intent !== 'POLICY_INQUIRY')` — the second OR arm activated when `searchCapsuleCall` was present regardless of intent, with only two explicit exclusions. Any Analyst output combining `product_search_integrity` with a primary `CART_OPERATION`, `ORDER_TRACKING`, or `INVENTORY_OUTLOOK` intent would silently route to the product search capsule instead.

- **Knowledge router** (pre-A83): `intent === 'POLICY_INQUIRY' || knowledgeCapsuleCall` — the OR arm activated on knowledge capsule call presence alone, regardless of intent. A `CART_OPERATION` intent paired with an incidental `knowledge_rag_foundation` call would dispatch to the knowledge capsule.

- **Cart router** (pre-A83): similar OR-arm structure, hardened for structural consistency even though the failure path was less common.

In all three cases, the OR arm's function was to serve as a fallback when the Analyst classified intent correctly but omitted the expected tool call. This role was superseded by the guardrail injection chain (A82 and earlier): injections already guarantee tool call presence for every routable intent before the router runs — making the OR arms redundant and actively harmful.

**Remediation Applied (commit ba8ac33):**

Replaced all three OR-arm conditions with strict AND conditions:

```js
// Product search (was: OR arm allowed tool_call presence to override intent)
if (intent === 'PRODUCT_SEARCH' && searchCapsuleCall)

// Knowledge (was: OR arm activated on knowledgeCapsuleCall alone)
if (intent === 'POLICY_INQUIRY' && knowledgeCapsuleCall)

// Cart (was: OR arm for structural consistency)
if (intent === 'CART_OPERATION' && cartOperatorCall)
```

The strict AND conditions are safe because guardrail injections (established in earlier lanes, with `CART_OPERATION` injection added in A84) guarantee tool call presence for every routable intent before the router evaluates — the OR arms provided no additional coverage.

**Validation:**

Deterministic router simulation — 7/7 PASS (includes both "original broken" and "fixed" proof cases):

| Case | Pre-A83 result | Post-A83 result |
| --- | --- | --- |
| `PRODUCT_SEARCH` + searchCapsuleCall | product capsule ✓ | product capsule ✓ |
| `CART_OPERATION` + searchCapsuleCall | product capsule (misroute) | Sommelier (correct intent, fallback) |
| `POLICY_INQUIRY` + knowledgeCapsuleCall | knowledge capsule ✓ | knowledge capsule ✓ |
| `CART_OPERATION` + knowledgeCapsuleCall | knowledge capsule (misroute) | Sommelier (correct intent, fallback) |
| `CART_OPERATION` + cartOperatorCall | cart capsule ✓ | cart capsule ✓ |
| `CHIT_CHAT` + no capsule call | Sommelier ✓ | Sommelier ✓ |
| `PRODUCT_SEARCH` (guardrail injection fires) | product capsule ✓ | product capsule ✓ |

Live probes — 4/4 PASS: product search, cart operation, policy inquiry, greeting all confirmed on correct paths.

**Residual note:** The cart guardrail injection gap (CART_OPERATION with empty tool_calls falling through to Sommelier) was confirmed during A83 validation and addressed as a separate lane (A84). A83 scope was router condition logic only.

**Characteristics:**

- No schema migration.
- No client changes.
- No new capsule.
- No changes to injection logic (injection chain unchanged).
- Strictly subtractive: removes OR arms; adds no new branching.
- Structural integrity of the router now matches the design intent stated in A83 comments.

**Outcome:** Capsule dispatch is now gated exclusively on the combination of guardrail-resolved intent AND the matching tool call. Mixed-tool-call Analyst outputs no longer produce silent misroutes. The router is deterministic and auditable. Commit: ba8ac33.

---

### A82. Capsule Input Contract Integrity — is_ambiguous Zod Gap — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/lib/ai-capsule-schemas.ts`.

**Problem Identified:**

`productSearchToolSchema` required `is_ambiguous` as a hard `z.boolean()` with no default. Two distinct code paths produced inputs missing this field, causing Zod validation to fail and the capsule to return a DEGRADED response ("Tuve un inconveniente interpretando tu búsqueda") on legitimate product-discovery queries:

1. **Guardrail injection path:** When the Analyst omitted a `product_search_integrity` tool call (expected behavior for queries reaching terminal recovery via A81), the guardrail injected the call with `{ query, requires_semantic_expansion: true }`. `is_ambiguous` was absent. Every query going through A81 terminal recovery subsequently degraded at capsule execution — making A81's recovery a no-op at the user level.

2. **Analyst few-shot training gap:** Five of the nine `product_search_integrity` few-shot examples (examples 1, 5, 6, 7, 8 — all open-ended/conceptual queries) omitted `is_ambiguous`. Gemini was therefore trained to omit it for the broadest, highest-frequency storefront query class. Any Analyst-generated tool call following this pattern also failed Zod → DEGRADED.

Combined effect: A81 terminal recovery routed correctly at the intent level but produced a DEGRADED capsule response at execution. Open-ended queries such as "algo frutal barato" or "recomiéndame algo suave y rico" received a schema-error message instead of product cards.

**Remediation Applied (commit 862ab05):**

**Guardrail injection fix (`index.ts:390`):**

Added `is_ambiguous: true` to the injected args. Guardrail-injected calls represent queries the Analyst did not classify with a specific product intent — inherently broad/open-ended, therefore `is_ambiguous: true` is the semantically correct value.

**Few-shot contract correction (`index.ts`, examples 1, 5, 6, 7, 8):**

Added `"is_ambiguous": true` to all five open-ended/conceptual examples that previously omitted the field. Examples 12–15 (specific brand/model lookups with `is_ambiguous: false`) are untouched — they were already correct.

**Defense-in-depth (`ai-capsule-schemas.ts:8`):**

Changed `is_ambiguous: z.boolean()` to `is_ambiguous: z.boolean().default(false)`. Any future injection site that omits the field will recover silently instead of degrading. `false` is the conservative default: non-ambiguous behavior runs the full search pipeline rather than showing featured-only fallback.

**Validation:**

Zod contract validation — 7/7 PASS:

| Case | Result |
| --- | --- |
| Guardrail injection with `is_ambiguous: true` | PASS — `is_ambiguous=true` |
| Old injection shape (missing `is_ambiguous`) recovered by `.default` | PASS — `is_ambiguous=false` |
| Analyst open-ended output missing `is_ambiguous` | PASS — `is_ambiguous=false` |
| `.default(false)` produces `false` when field absent | PASS |
| Specific lookup `waka somatch mb6000` (`is_ambiguous: false`) | PASS — unchanged |
| Corrected few-shot open-ended (`is_ambiguous: true`) | PASS |
| Original schema still fails on missing field (regression proof) | PASS |

Live edge-function probes — 4/4 PASS:

| Query | Result |
| --- | --- |
| "algo frutal barato" | `capsule=product_search_integrity` · `is_ambiguous: true` in args ✓ |
| "recomiéndame algo suave y rico" | `capsule=product_search_integrity` · `is_ambiguous: true` in args ✓ |
| "tienes waka somatch mb6000?" | `capsule=product_search_integrity` · `is_ambiguous: false` in args ✓ |
| "hola" | Sommelier path · `intent=greeting` · no capsule regression ✓ |

**Characteristics:**

- No schema migration.
- No client component changes.
- No new capsule.
- No router logic changes (secondary OR-arm weakness in product search router is a separate architectural concern, outside A82 scope).
- No behavioral change to routing signals — A82 is contract integrity hardening only.
- Defense-in-depth `.default(false)` is a permanent guard; future injection sites are covered automatically.

**Outcome:** Guardrail-injected and Analyst-generated open-ended product queries now produce valid capsule args and reach the fallback tree. A81 terminal recovery is now genuinely executable end-to-end. DEGRADED responses caused by missing `is_ambiguous` are closed. Commit: 862ab05.

---

### A81. UNKNOWN Escape Hardening — Guardrail Vocabulary Gap + Terminal Recovery — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/persona.ts`.

**Problem Identified:**

Real product queries were escaping `PRODUCT_SEARCH` classification and falling through to a Sommelier-only conversational path with zero catalog grounding. Three structural defects combined to produce this:

1. **`isProductMatch` vocabulary gap:** The guardrail keyword regex used to recover `UNKNOWN` and `CHIT_CHAT` intents into `PRODUCT_SEARCH` did not include core vape-store product vocabulary. Missing terms: discovery verbs (`busco`, `buscas`, `tienen`, `tienes`, `hay`), product type terms (`liquido`, `vape`, `pod`, `pods`, `mod`, `kit`, `kits`, `cartucho`, `cartuchos`, `desechable`, `desechables`, `dispositivo`, `vaporizador`). Any query using only these terms — e.g. "o un liquido de juicee", "tienen pods de vaporesso", "hay cartuchos de waka" — produced `isProductMatch = false`, leaving intent as `UNKNOWN`.

2. **Dead branch 3 in guardrail:** A third `else if (isProductMatch && intent === 'UNKNOWN')` block was structurally unreachable. Branch 2 (`else if (intent === 'UNKNOWN' || intent === 'CHIT_CHAT')`) already consumed all `UNKNOWN` states in the same `else if` chain. Branch 3 could never fire. Any `UNKNOWN` that branch 2 did not resolve was left as `UNKNOWN` and fell through to the Sommelier with no tool data.

3. **Sommelier routing authority misrepresentation:** `RESPONSE_FORMAT_RULES` in `persona.ts` instructed the Sommelier to declare `routed_capsule: "product_search_integrity"` for product-like queries, implying capsule routing capability. In reality, capsule delegation is decided exclusively by the edge router before Sommelier is invoked. The Sommelier's `routed_capsule` field was decorative — the client gates capsule execution solely on `requires_client_capsule: true`, which Sommelier never sets. Combined with defects 1 and 2, this created a situation where the Sommelier could declare routing intent it did not have authority to execute.

Combined effect: product queries using informal vocabulary, brand names, or product type terms → `UNKNOWN` intent → no capsule routing → Sommelier invoked with no tool results → conversational answer returned with zero product cards.

Runtime evidence: the A77 residual case "o un liquido de juicee" (pre-fix historical row, created 2.5h before the A77 fix) was the concrete proof of this failure pattern.

**Remediation Applied (commit 4b89235):**

**`isProductMatch` expansion (`index.ts:348`):**

Added discovery verbs and product type terms to the regex: `busco|buscas|tienen|tienes|hay|liquido|vape|pod|pods|mod|kit|kits|cartucho|cartuchos|desechable|desechables|dispositivo|vaporizador`. These cover the real vocabulary of storefront product queries.

**Terminal recovery (`index.ts:377-385`):**

Replaced dead branch 3 with an unconditional `if (intent === 'UNKNOWN')` block placed after the entire guardrail chain. Any intent still `UNKNOWN` after all keyword checks and Analyst classification → `PRODUCT_SEARCH`. In a vape store, an unresolvable query defaults to product discovery — this is the correct terminal trade-off. Stronger-known intents (compatibility, inventory, policy, greeting) are all confirmed upstream and are not affected.

**Sommelier routing authority correction (`persona.ts:63-89`):**

Added routing note at top of `RESPONSE_FORMAT_RULES` explicitly stating that routing was already decided before Sommelier was invoked, and Sommelier is always the terminal responder for non-capsule paths. Changed `routed_capsule` schema from `"uno de: product_search_integrity | knowledge_rag_foundation | cart_operator | null"` to `"null"` — Sommelier always outputs null here. Replaced capsule-delegation routing rules with response rules scoped to actual Sommelier paths: CHIT_CHAT, GREETING, COMPATIBILITY_CHECK, INVENTORY_OUTLOOK, ORDER_TRACKING, AMBIGUOUS residuals.

**Post-Deployment Verification (7 live probes):**

| Query | Expected | Live Result |
| --- | --- | --- |
| "o un liquido de juicee" | PRODUCT_CAPSULE | `requires_client_capsule: true`, `capsule_name: product_search_integrity` ✓ |
| "tienen pods de vaporesso" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "busco un desechable" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "hay cartuchos de waka" | PRODUCT_CAPSULE | PRODUCT_CAPSULE ✓ |
| "hola buenas tardes" | CHIT_CHAT (Sommelier) | intent=greeting, fallback=GREETING ✓ |
| "como hacen los envios" | KNOWLEDGE_CAPSULE | `capsule_name: knowledge_rag_foundation` ✓ |
| "que pod me queda para el smok nord 5" | COMPATIBILITY_CHECK (Sommelier) | intent=COMPATIBILITY_CHECK ✓ |

**Characteristics:**

- No client-side changes.
- No schema migration.
- No new capsule.
- No intent-system rewrite; only guardrail keyword expansion + terminal default + Sommelier wording correction.
- Deterministic-first behavior preserved: compatibility, inventory, policy, greeting all retain their own upstream keyword guards and take precedence over terminal recovery.

**Outcome:** UNKNOWN escape lane materially closed. Product-like queries using informal vocabulary, product type terms, and discovery verbs now recover into `PRODUCT_CAPSULE` behavior and receive grounded catalog results. Sommelier routing authority is now truthfully scoped to its actual execution boundaries. No regressions observed on preserved intent paths. Commit: 4b89235.

---

### A80. Memory Persistence Reliability — Await Hardening + Failure Acknowledgement — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/memory.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/__tests__/customer-intelligence-memory.test.ts`.

**Problem Identified:**

Memory persistence in the edge function was fire-and-forget: `persistMemory(...)` was called without `await`, and any write failure was silently discarded. If the upsert to `ai_customer_memory` failed (network error, FK violation, quota, etc.), the edge function returned a successful response with no acknowledgement that memory had not been persisted. Operator or diagnostic tooling could not distinguish a successful write from a silently failed one.

**Remediation Applied:**

- `persistMemory` refactored into `supabase/functions/customer-intelligence/memory.ts` as a standalone export with a typed return contract: `MemoryPersistResult { ok: boolean; merged_interests: string[]; metadata_count: number; error: string | null }`.
- Both read (`maybeSingle()`) and write (`upsert()`) operations are `await`ed inside `persistMemory`. The function does not throw; it returns a structured failure result on any error.
- Callsite in `index.ts` updated to `const memoryResult = await persistMemory(...)`. On `!memoryResult.ok`, a `console.error` is emitted with the customer ID and error message. The response to the user is not blocked — failure is acknowledged, not suppressed, and does not degrade the user-facing interaction.

**Validation:**

**Unit validation (2/2 PASS — `src/lib/__tests__/customer-intelligence-memory.test.ts`):**

| Test | Assertion | Result |
| --- | --- | --- |
| "awaits the ai_customer_memory write before resolving" | `settled = false` while deferred write is pending; resolves only after `resolveWrite()` called | PASS |
| "truthfully reports a failed write instead of succeeding silently" | `result.ok === false`, `result.error === 'db write failed'`, `result.merged_interests` non-empty | PASS |

**Runtime probe (CHIT_CHAT path — non-capsule Sommelier):**

- Query `"hola buenas tardes!"` submitted against the deployed edge function.
- User-facing response returned intact. `server_telemetry_logged: true` confirmed.
- `ai_customer_memory` row: **NOT FOUND** — root cause: sentinel UUID `00000000-0000-0000-0000-000000000001` violates pre-existing FK constraint `ai_customer_memory.customer_id → auth.users`. The UUID does not exist in `auth.users`. The DB rejected the upsert with a FK violation error.
- This is a **pre-existing schema constraint**, not a regression introduced by this implementation.
- `persistMemory` returned `{ok: false, error: '<FK violation message>'}` — the callsite logged the error and returned the user response normally. Failure was acknowledged, not swallowed.
- Real-customer DB write confirmation: environment-blocked (requires a live authenticated storefront session with a valid `auth.users` UUID). This is not a code defect.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration. No FK constraint changes.
- No user-facing behavior changed. No telemetry paths changed.
- `sanitizeAndMergeInterests` and `updateInterestsMetadata` logic unchanged — moved to module, not altered.

**Outcome:** Memory Persistence Reliability lane materially closed. `persistMemory` is awaited at the active callsite; write failures are structured and acknowledged rather than silently dropped. Application-layer correctness confirmed by unit tests. Real-customer DB write path is structurally correct; runtime row confirmation is environment-blocked by FK constraint against `auth.users`, not code-blocked.

---

### A79. Sommelier Edge Telemetry Completeness — Ownership Hardening + Response_Text Persistence — 21 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`.

**Problem Identified:**

Two edge-owned interaction classes had structurally unreliable telemetry:

1. **OUT_OF_DOMAIN fast-path:** `supabase.from('ai_analytics').insert(...)` was not awaited (fire-and-forget). `response_text` was hardcoded as `null` despite the actual rejection prose being returned to the user. `server_telemetry_logged: true` was returned unconditionally — no confirmation that the insert completed.

2. **Non-capsule Sommelier path:** `supabase.from('ai_analytics').insert(analyticsPayload).then(...)` was fire-and-forget. `analyticsPayload` was built BEFORE the TEXT GUARANTEE block (lines 884–889), meaning: (a) if `aiData.text` was null before TEXT GUARANTEE, the analytics gate (`if (aiData.text)`) skipped the insert entirely, yet `server_telemetry_logged = true` was still set unconditionally; (b) even when the insert did fire, the prose logged was pre-guarantee — any TEXT GUARANTEE injection was not captured. Additionally, capsule delegation paths (`requires_client_capsule: true`) passed through the same analytics block when Sommelier returned non-null text, causing potential double-logging with client-side telemetry.

Combined effect: edge could claim `server_telemetry_logged: true` and suppress client fallback logging, while the actual row was either missing or had `response_text: null`.

**Remediation Applied (commit e8d3a28):**

**OUT_OF_DOMAIN hardening:**

- Reply prose extracted as `const oodReplyText` (same string returned to user).
- Insert changed from fire-and-forget to `const { error: oodTelemetryErr } = await supabase.from('ai_analytics').insert({...})`.
- `response_text` field now set to `oodReplyText` (was `null`).
- `server_telemetry_logged: !oodTelemetryErr` — truthful: `true` only on confirmed insert success; `false` on failure so client fallback logging activates.

**Non-capsule Sommelier path hardening:**

- Analytics block moved to AFTER TEXT GUARANTEE — `aiData.text` is always non-null at logging time.
- Wrapped in `if (!aiData.requires_client_capsule)` — capsule delegation paths set `server_telemetry_logged = false` and delegate telemetry to client (eliminates double-logging risk).
- Insert changed from `.then(...)` fire-and-forget to `const { error: analyticsErr } = await supabase.from('ai_analytics').insert(analyticsPayload)`.
- `aiData.server_telemetry_logged = !analyticsErr` — truthful assignment.
- Memory persistence (`persistMemory`) remains fire-and-forget in its original `if (aiData.text)` block — out of scope, not changed.

**Post-Deployment Validation (2 live interactions):**

| Path | Query | `response_text` in DB | `server_telemetry_logged` | Ownership truthful |
| --- | --- | --- | --- | --- |
| OUT_OF_DOMAIN | "cuanto cuesta un kilo de carne" | "Solo puedo ayudarte con productos de nuestra tienda de vapeo y 420..." | `true` | YES — row confirmed in DB |
| CHIT_CHAT (non-capsule Sommelier) | "hola, como estas hoy?" | "¡Hola! Estoy excelente, gracias por preguntar. Soy Cesarin..." | `true` | YES — row confirmed in DB |

Both `response_text` values match the actual edge reply returned to the user (verified via text prefix match). Probe rows deleted post-validation.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration.
- No client telemetry paths changed (already repaired in earlier lanes).
- No routing logic changed. No capsule behavior changed. No admin surfaces changed.
- Memory persistence fire-and-forget remains — out of scope, pre-existing.
- Capsule paths: `server_telemetry_logged = false` — client logs unconditionally for those paths, no behavior change from client perspective.
- Insert failure on any edge path: `server_telemetry_logged = false` → client fallback logging activates → no telemetry lost.

**Outcome:** Sommelier Edge Telemetry Completeness lane materially closed. `server_telemetry_logged` is now a truthful durability claim, not an optimistic assumption. `response_text` is non-null for OUT_OF_DOMAIN and non-capsule Sommelier turns. Commit: e8d3a28.

---

### A78. Offer Evidence Lane — Offered Products Persistence + Operator Grading Visibility — 20 de marzo de 2026

**Scope:** `src/services/concierge.service.ts`, `src/services/admin/admin-pilot-ops.service.ts`, `src/components/admin/cesarin/ReviewDrawer.tsx`, `src/pages/admin/AdminCesarinOS.tsx`.

**Problem Identified:**

Operator grading of product-answer turns was structurally incomplete. The evaluator could see Cesarin's prose (`response_text`) and a card count badge ("N cards"), but had no visibility into which exact products were offered. Text like "¡Aquí tienes exactamente lo que buscabas!" or "Aquí tienes opciones que podrían encajar:" cannot be graded for offer correctness, recommendation fit, or hallucination without knowing the actual offer payload.

Root cause: `capsuleContract.resolved_products` — a full array of `InternalResolvedProduct` objects (`id`, `name`, `slug`, and more) — exists in memory at the exact line where `logAITelemetry` is called in `concierge.service.ts`. Only `.length` was extracted (for `product_card_count`). The product objects themselves were never passed to `logAITelemetry`, never written to `ai_analytics`, never mapped through admin, and never rendered in ReviewDrawer.

**Remediation Applied (3 scopes):**

**Scope C — Telemetry persistence (`concierge.service.ts`, commit a761e65):**

- `logAITelemetry` fields extended with `offered_products?: Array<{ id: string; name: string; slug: string }>`.
- `offered_products: fields.offered_products ?? []` added to `ai_logic_debug` JSONB in the INSERT.
- `product_search_integrity` callsite updated to pass `capsuleContract.resolved_products?.map(p => ({ id: p.id, name: p.name, slug: p.slug })) ?? []`.
- Fields limited to `{id, name, slug}` — no internal fields (`cost_price`, `specs`, `ai_sales_note`) exposed.
- No schema migration needed (`ai_logic_debug` is JSONB).

**Scope B — Admin mapping (`admin-pilot-ops.service.ts`, commit a761e65):**

- New exported type `OfferedProduct { id: string; name: string; slug: string }`.
- `PilotQueryRow` extended with `offered_products: OfferedProduct[] | null`.
- `mapRow` extracts `d.offered_products` with type-guard filter — rejects entries missing any required string field; returns `null` for absent or malformed arrays.

**Scope A — Operator surface (`ReviewDrawer.tsx` + `AdminCesarinOS.tsx`, commit a761e65):**

- `ReviewDrawerProps.interaction` extended with `offered_products?: Array<{id, name, slug}> | null`.
- New "Productos Ofrecidos" section rendered after badge row — gated on `offered_products.length > 0`.
- Renders a compact `<ul>` of product names; label styled at same weight as "Ruta · Cápsula" header.
- `AdminCesarinOS.tsx` interaction mapping extended with `offered_products: (reviewInteraction as any).offered_products ?? null`.

**Post-Deployment Validation:**

Live interaction: query `"algo de mango o menta"` → `product_search_integrity` capsule → 4 products resolved → anon INSERT → service-key read-back confirmed:

| Product name stored | Slug stored |
| --- | --- |
| E-Liquid Mentolado Ice 120ml 3mg | eliquid-mentolado-ice-120ml-3mg |
| Nic Salt Sandía Mint 30ml 35mg | nicsalt-sandia-mint-30ml-35mg |
| Nic Salt Mango Lychee 30ml 35mg | nicsalt-mango-lychee-30ml-35mg |
| Caramelos Hard Candy THC 10mg x8 | caramelos-hard-candy-thc-10mg-x8 |

Name-match audit: exact match between products resolved at interaction time and products stored in `ai_logic_debug.offered_products`. Row `e28a0bcf` left in DB for operator visual confirmation. CF Pages deploy triggered by push to `main`.

ReviewDrawer for a fresh product-answer row now shows: response prose · card count badge · **"Productos Ofrecidos"** list of exact product names. Both grading dimensions (what Cesarin said + what Cesarin offered) are visible in a single evaluation surface.

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration (JSONB column, new key only).
- No RLS changes. No storefront response behavior changed.
- No product card redesign. No scoring logic changes.
- Non-product paths (knowledge RAG, cart, generic) not affected: `offered_products` not passed → defaults to `[]` in telemetry → `null` in mapRow → "Productos Ofrecidos" section hidden. Correct.
- Historical rows (pre-`a761e65`) have `ai_logic_debug.offered_products` absent → `null` in mapRow → section hidden. No backfill.

**Outcome:** Offer Evidence lane materially closed. Operators can now grade product-answer turns on both response quality and offer correctness from a single ReviewDrawer view. Commit: a761e65.

---

### A77. Operator Visibility Lane — Tab 8 Response Preview + Response_Text Persistence — 20 de marzo de 2026

**Scope:** `src/components/admin/cesarin/PilotTelemetry.tsx`, `src/pages/admin/AdminCesarinOS.tsx`, `src/services/concierge.service.ts`.

**Problem Identified:**

Two structural gaps prevented operators from efficiently evaluating Cesarin's response quality:

1. **Tab 8 (PilotTelemetry) — no response preview:** The operator grading table showed query text and metadata columns but no visible preview of what Cesarin actually said. `response_text` existed in `PilotQueryRow` type and was fetched in `getPilotQueryLog` SELECT but was never rendered. Operators had to open every row individually to assess response quality.

2. **Simulator ReviewDrawer — stale column reference:** `handleReviewLastSimulatorTurn` in AdminCesarinOS.tsx fetched `.select('id, query, response, created_at')` — the `response` column does not exist in `ai_analytics`; the correct column is `response_text`. The ReviewDrawer appeared blank for all simulator-triggered evaluations.

3. **Upstream persistence gap (root cause):** All 187 existing `ai_analytics` rows had `response_text: null`. The `logAITelemetry` function in `concierge.service.ts` never included `response_text` in its INSERT payload. Both structural UI fixes above would have rendered `—` for every row until this was repaired.

**Remediation Applied:**

**Fix 1 — Tab 8 "Respuesta" preview column (PilotTelemetry.tsx, commit b4d9b8e):**

- Added `responsePreview` derived value: 55-char truncation of `row.response_text` with full text in `title` tooltip.
- Added `<th>Respuesta</th>` header after Query column.
- Added `<td>` cell rendering preview span (visible) or `—` italic (null).
- Updated both `colSpan={8}` → `colSpan={9}` (loading and empty state rows).

**Fix 2 — Simulator review query field repair (AdminCesarinOS.tsx, commit b4d9b8e):**

- `handleReviewLastSimulatorTurn` `.select()` changed from `'id, query, response, created_at'` → `'id, query, response_text, created_at'`.
- ReviewDrawer mapping at line 548 already used `(reviewInteraction as any).response_text` correctly — only the fetch needed fixing.

**Fix 3 — response_text persistence repair (concierge.service.ts, commit 81ff8fa):**

- `logAITelemetry` function signature extended with `response_text: string | null` parameter.
- `response_text: fields.response_text` added to Supabase INSERT payload.
- Five callsites updated with correct customer-facing prose or null:

| Callsite | `response_text` value |
| --- | --- | --- |
| product_search_integrity | `capsuleContract.customer_response_draft ?? null` |
| knowledge_rag_foundation | `capsuleContract.ui_render_hint ?? null` |
| cart_operator | `null` |
| generic / fallback path | `data.text ?? data.message ?? null` |
| error catch | `null` |

**Post-Deploy Validation (2 live rows via anon key INSERT, service-key read-back):**

| Interaction | Capsule | `response_text` in DB | HTTP status |
| --- | --- | --- | --- |
| "quiero algo frutal" | product_search_integrity | "No encontré un producto con ese nombre exacto, pero Gomitas CBD 25mg x10 Frutas..." | 201 ✅ |
| "hacen envios a todo mexico?" | knowledge_rag_foundation | "He recopilado esta información relacionada de nuestros tutoriales y manuales operativos:" | 201 ✅ |

Service-key read-back confirmed both rows with non-null `response_text` and correct `detected_intent`. Probe rows deleted post-validation.

**Historical rows:** 187 pre-fix rows retain `response_text: null` by design. No backfill applied. Displayed as `—` in Tab 8 (correct operator behavior).

**Characteristics:**

- No new wave opened. No base build bump.
- No schema migration required (`response_text` column pre-existed in `ai_analytics`).
- No RLS changes (pre-existing anon INSERT policy from `20260320_ai_analytics_rls_write_path.sql` covers the new field transparently).
- `PilotQueryRow` type and `getPilotQueryLog` SELECT were already correct — only rendering and persistence were missing.
- Existing telemetry behavior for all 5 callsites preserved; only `response_text` field added.

**Outcome:** Operator visibility lane materially closed. Tab 8 shows response preview for all fresh interactions. ReviewDrawer populated for simulator-triggered evaluations. Upstream persistence repaired — `response_text` non-null for all capsule paths going forward. Commits: b4d9b8e (UI fixes), 81ff8fa (persistence repair).

---

### A76. Retrieval / Fallback Discipline Hardening — Closure + MICRO-FIX A — 20 de marzo de 2026

**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/lib/product-search-capsule.ts`.

**Problem Identified:**

Four runtime failure patterns confirmed against live catalog (44 active products):
1. Out-of-domain queries (e.g., "quiero un nissan versa") routed to product search — surfaced product cards from wrong domain.
2. Specific unknown brand/model queries (e.g., "waka somatch mb6000", "snoop dogg g pen") — correct no-match behavior, but semantic threshold at 0.4 was permissive enough to allow low-confidence substitutions in adjacent cases.
3. Type-intent mismatch: "necesito una pipa de cristal" and "quiero un vape desechable de menta" — `requires_semantic_expansion: true` sent both through vector search; catalog has zero glass pipes and zero disposables → wrong-category cards returned (herb vaporizers at 0.61–0.63; e-liquids at 0.72–0.73 due to mint flavor overlap in embeddings).
4. BRANCH B residual: when `is_ambiguous: true` and `featuredProducts.length === 0` (semantic skipped), Branch B emitted "Te dejo estas opciones destacadas:" with zero product cards — dangling copy.

**Remediation Applied (3 layers):**

**Layer 1 — Analyst: OUT_OF_DOMAIN intent + fast-path (index.ts, commits a4ca51e + aea7944):**
- Added `OUT_OF_DOMAIN` to intent enum in Analyst prompt.
- Added 3 few-shot examples: "quiero un nissan versa", "busco departamento en renta", "cuánto cuesta un kilo de carne" → `OUT_OF_DOMAIN`.
- Added OUT_OF_DOMAIN fast-path block before Sommelier: returns scope-rejection text, `products: []`, no capsule invoked.
- Added `requires_semantic_expansion` REGLA to Analyst: specific brand/model/product → `false`; vague concept/preference → `true`.
- Added 4 few-shot examples for `requires_semantic_expansion=false`: "waka somatch mb6000", "snoop dogg g pen", "pipa de cristal", "vape desechable de menta".

**Layer 2 — Orchestrator: semantic skip enforcement + threshold raise (ai-capsule-orchestrator.service.ts, commit a4ca51e + aea7944):**
- Semantic search (`embeddings-processor` + `match_products` RPC) skipped entirely when `toolArgs.requires_semantic_expansion === false`.
- `match_threshold` raised from 0.4 to 0.55.

**Layer 3 — Fallback tree: BRANCH E tightening (product-search-capsule.ts, commit a4ca51e):**
- BRANCH E draft language tightened: `"encaja perfecto"` → `"podría ser lo que buscas"` (semantic uncertainty posture).
- Search confidence lowered 0.7 → 0.6.
- Max displayed products 4 → 3.

**MICRO-FIX A — BRANCH B empty-products guard (product-search-capsule.ts, defensive hardening):**
- When BRANCH B fires (`is_ambiguous: true`) and `featuredProducts.length === 0`, returns Branch F `NO_MATCH` contract instead of dangling "Te dejo estas opciones destacadas:" with zero cards.
- Uses identical text and confidence (`0.1`) as Branch F.
- Guard fires before draft construction; existing Branch B behavior fully preserved when `featuredProducts.length > 0`.

**MICRO-FIX B evaluation result:** Not needed. Type-intent mismatch cases ("pipa de cristal", "vape desechable de menta") fully resolved by `requires_semantic_expansion=false` → semantic skipped → Branch F. No additional threshold hardening required.

**Post-Deploy Runtime Validation (6-query set):**

| # | Query | Before | After |
| --- | --- | --- | --- |
| Q1 | quiero un nissan versa | Branch B empty (0 cards + confusing copy) | OUT_OF_DOMAIN fast-path → scope rejection, 0 cards ✅ |
| Q2 | tienes waka somatch mb6000? | Branch F, 0 cards | Branch F, 0 cards ✅ |
| Q3 | snoop dogg g pen tienes? | Branch F, 0 cards | Branch F, 0 cards ✅ |
| Q4 | necesito una pipa de cristal | 3 wrong herb vaporizers (sim 0.61–0.63) | `req_sem_exp=false` → semantic skipped → Branch F, 0 cards ✅ |
| Q5 | quiero un vape desechable de menta | 3 wrong e-liquids/salts (sim 0.72–0.73) | `req_sem_exp=false` → semantic skipped → Branch F, 0 cards ✅ |
| Q6 | quiero algo frutal (control) | correct semantic products | `req_sem_exp=true` → semantic → correct products ✅ ✅ |

**Characteristics:**

- No new wave opened. No base build bump.
- No downstream drafting hierarchy (A67–A75) reopened or altered.
- BRANCH B, C, D existing behavior unchanged by MICRO-FIX A (guard fires only on empty).
- Edge function deployed: `npx supabase functions deploy customer-intelligence` (all 3 files: index.ts, tools.ts, persona.ts).
- Validation performed against live deployed function + live catalog.

**Outcome:** Retrieval / fallback discipline hardening lane materially closed. OUT_OF_DOMAIN rejection operational. Type-intent mismatch resolved. MICRO-FIX A applied as defensive Branch B guard. MICRO-FIX B not needed. Commits: a4ca51e, aea7944 (edge function + orchestrator); MICRO-FIX A (product-search-capsule.ts, defensive guard, no separate wave).

---

### A66. Learning Intervention Workflow MVP — 20 de marzo de 2026

**Scope:** `supabase/migrations/20260320_intervention_signals_and_recommendations.sql`, `src/services/admin/intervention-workflow.service.ts`, `src/components/admin/cesarin/TabInterventions.tsx`, `src/types/cesarin.ts`, `src/pages/admin/AdminCesarinOS.tsx`, `src/services/admin/index.ts`.

**Implementation:**
- **Signal Storage:** intervention_signals + intervention_recommendations tables (RLS: admin-only read/update)
- **Diagnosis Engine:** Rule-based deterministic logic (3 signal types: enrichment_gap, compatibility_miss, escalation_theme)
- **Operator UI:** TabInterventions in Cesarin OS for recommendation review/approval (no auto-execution)
- **Decision Tracking:** Operator approval decisions with audit trail (operator_id, timestamp, notes)

**Cold Review Findings (4) + Remediation:**
1. Type import from wrong module → Fixed: import from cesarin.ts
2. Null returns unguarded in handlers → Fixed: Added null checks before success toasts
3. Signal_type filter bug → Fixed: Returns empty array when no matches (not all records)
4. Write path (INSERT/RLS) inconsistency → Documented: INSERT functions are SERVICE_ROLE (backend-only, MVP uses read/update)

**Characteristics:**
- No autonomous learning or feedback loops
- No automatic intervention execution (manual/out-of-band)
- Isolated from ai_analytics telemetry
- Zero breaking changes to existing code
- Approved for manual operator testing (not production)

**Manual Testing (March 20, 2026):**

- **Issue Found:** Migration not deployed to active Supabase database (deployment drift)
- **Resolution:** Migration applied to active DB; seed data inserted (3 signals + 3 recommendations)
- **Validation Performed:**
  - Tab renders without errors ✅
  - Pending recommendations display with correct count ✅
  - Signal type badges render correctly (enrichment_gap, compatibility_miss, escalation_theme) ✅
  - Confidence indicators display (high/medium/low) ✅
  - Expandable diagnosis details functional ✅
  - Approve button: transitions recommendation to approved, persists after refresh ✅
  - Reject button: transitions recommendation to rejected, persists after refresh ✅
  - Filter toggle (Pendientes ↔ Todas): transitions between pending-only and all recommendations ✅
  - Approved/rejected items remain visible in "Todas" view, removed from "Pendientes" ✅
  - Operator ID and timestamp recorded on decisions ✅
- **Test Data:** Manual seed signals (enrichment_gap, compatibility_miss, escalation_theme) used for validation
- **Current Status:** Operator workflow MVP manually validated and functional
- **Not Claimed:** Autonomous learning, auto-execution, organic signal generation (future lanes)

**Outcome:** Learning Intervention Workflow MVP operator workflow validated. Commit a28ec1e. Ready for operator trial use.

---

### A67. Description Downstream Bridge — 20 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts` (schema extension), `src/services/ai-capsule-orchestrator.service.ts` (query + mapper), `src/lib/ai-capsule-mappers.ts` (public contract).

**Implementation:**

- **Exact Path:** Added `description` to product query select + internal schema + public schema + mapper conditionals
- **Semantic Path:** Verified preservation through RPC → hydration spread → mapper → schemas (no drop-off)
- **Nullability:** Consistent `.nullable().optional()` pattern + null coalescing (`?? null`) + conditional spreads
- **Scope:** Description field only, no feature expansion

**Cold Review Result:**

- ✅ Exact path structurally complete (6 transformation stages)
- ✅ Semantic path structurally complete (7 transformation stages)
- ✅ No silent field drops at any boundary
- ✅ No contract asymmetry between exact/semantic paths
- ✅ Safe nullability handling (coalescing + conditional spreads)
- ✅ No scope expansion beyond description
- ⚠️ Upstream assumption: `match_products` RPC returns description (user-confirmed, verify externally)

**Characteristics:**

- Mapper/contract preservation of description field only
- No UI display validation (no UX lane run)
- No autonomous runtime benefit claimed
- Not a feature expansion, not a capability enhancement
- Structural bridge only (enables downstream consumption)

**Outcome:** Description downstream bridge reconciled. Mapper/contract coherence validated. Ready for downstream consumption (no UX claim). Commit: same as A66 (a28ec1e, no new commit).

---

### A68. Description Consumption Discipline Remediation — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH C, BRANCH D, BRANCH E, helper logic).

**Problem Identified:**

- BRANCH C (exact match) was using `description` as fallback when `ai_sales_note` absent — violated semantic-only discipline
- `extractDescriptionContext()` helper was too permissive — accepted generic/promotional boilerplate
- No filtering for title repetition or category-only text
- Discipline violation: "Semantic retrieval context" (schema comment) mismatched code behavior

**Remediation Applied:**

- **BRANCH C:** Removed all `description` usage → `ai_sales_note` only (semantic-only discipline restored)
- **Helper Hardened:** 4 new filters added:
  - Length bounds: reject `< 15` chars (noise) or `> 80` chars (bloat)
  - Marketing boilerplate: reject "premium", "best", "guaranteed", "exclusive", "special", "limited", "rare", "unique"
  - Category repetition: reject generic patterns like "the X [vape|device|product]"
  - Title duplication: reject if description equals product name
- **BRANCH E:** Kept semantic-only, specs-first hierarchy; description only when specs absent
- **BRANCH D:** Upgraded with spec-based similarity justification (uses specs from exhausted exact product and top alternative)

**Cold Review Result:**

- ✅ BRANCH C clean of `description` usage
- ✅ BRANCH E semantic-only and fallback-only discipline restored
- ✅ Helper filtering materially hardened (4 validation layers)
- ✅ All fallback paths preserve safe behavior when specs/description unavailable
- ✅ Type contract alignment verified ("Semantic retrieval context" now matches code)
- ✅ No breaking changes; graceful degradation when context unavailable

**Characteristics:**

- Discipline remediation, not feature expansion
- Pure message composition improvements (BRANCH D, BRANCH E refinements)
- No new field bridges or data transport
- No UI redesign
- Semantic-only consumption restored per approved discipline

**Outcome:** Description consumption discipline remediated and cold-review approved. Semantic fallback-only enforcement restored. BRANCH D justification upgraded. Commit: eb3566c.

---

### A69. Out-of-Stock Alternative Justification Upgrade — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH D: OUT_OF_STOCK_ALTERNATIVE only).

**Problem Identified:**

- BRANCH D message lacked specific justification for why suggested alternatives fit user's original intent
- User intent strong (exact product found, verified to exist), but OOS
- Alternatives available, but message generic ("muy similares" without concrete reason)
- Composition weakness: no product context cues to justify recommendation

**Improvement Implemented:**

- **Spec-Based Similarity:** Extract key specs from both exhausted exact product and top alternative
- **3-Tier Composition Logic:**
  1. Both have useful specs → "...buscas [exhausted specs] está agotado, pero encontré alternativas [alternative specs]..."
  2. Only alternative has specs → "...está agotado, pero encontré alternativas [alternative specs]..."
  3. No useful specs → fallback to original generic message ("muy similares")
- **Safe Fallback:** Returns to generic message when justification unavailable or weak (conservative behavior)

**Cold Review Result:**

- ✅ BRANCH D composition strengthened (uses existing product specs)
- ✅ One short useful cue per message (no bloat, no multi-sentence)
- ✅ Fallback behavior preserved (generic message when specs unavailable)
- ✅ No new field bridges introduced (specs already flow through system)
- ✅ No feature expansion (pure message composition improvement)
- ✅ Safe degradation (graceful fallback when context weak)

**Characteristics:**

- Branch-specific improvement only (BRANCH D isolated)
- Uses already-available product context (specs)
- Message composition refinement, not capability enhancement
- No new data transport or field bridges
- No UI redesign
- Conservative: prefers generic message when justification weak

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| Both have specs | "...buscas *con sabor menta y nicotina 20mg* está agotado, pero encontré alternativas *con sabor menta y nicotina 18mg* en existencia:" |
| Alternative specs only | "...está agotado, pero encontré alternativas *con puffs 8000 y recarga automática* en existencia:" |
| No specs | "...está agotado, pero te seleccioné estas alternativas en existencia muy similares:" (original generic message) |

**Outcome:** Out-of-stock alternative justification upgraded with spec-based similarity cue. Cold-review approved. Safe fallback preserved. Commit: eb3566c.

---

### A75. BRANCH B Wording Naturalness Polish — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH B: FEATURED_FALLBACK, line 125 only).

**Wording Fix Applied:**

- Replaced `"sobre todo algunos ${topFeaturedSpecs}"` with `"incluyendo algunas ${topFeaturedSpecs}"`
- `"algunos"` was a floating pronoun with no referent noun in the clause
- `"incluyendo algunas"` is a natural connector; `"algunas"` back-refers to `"opciones"` already established earlier in the sentence

**Before:**

```text
Veo varias opciones que podrían encajar, sobre todo algunos [specs].
```

**After:**

```text
Veo varias opciones que podrían encajar, incluyendo algunas [specs].
```

**Review Result:**

- ✅ Wording-only — no logic, data flow, or tier change
- ✅ Ambiguity discipline preserved (invitation to clarify unchanged)
- ✅ Fallback behavior preserved (generic message when specs unavailable unchanged)
- ✅ No helper rewrites (`extractSpecsFact()` untouched)
- ✅ No schema/orchestrator/RPC/other-branch changes

**Characteristics:**

- Single-line wording fix in BRANCH B only
- Deployable within scope

**Outcome:** BRANCH B specs cue phrasing refined for natural Spanish. Ambiguity discipline and branch logic unchanged. Commit: 9ac2b05.

---

### A74. BRANCH D OOS Alternative Hierarchy Alignment + Note-Tier Naturalness — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH D: OUT_OF_STOCK_ALTERNATIVE only).

**Implementation Applied:**

**1. Hierarchy Alignment:**

- BRANCH D now uses a disciplined 4-tier justification hierarchy for alternative suggestions:
  - Tier 1: both exhausted product and alternative have specs — emphasize similarity (unchanged)
  - Tier 2: alternative has specs only — highlight what was found (unchanged)
  - Tier 3: `ai_sales_note` for top alternative when specs unavailable — concise curated context
  - Tier 4: generic fallback when no useful context available (unchanged)
- `ai_sales_note` was previously unused in BRANCH D; now fills the gap between specs-based justification and the generic floor

**2. Note-Tier Wording Refinement:**

- Tier 3 sentence refined for natural Spanish after initial implementation
- Parenthetical injection `(${alternativeNote})` replaced with em-dash trailing descriptor
- `"en existencia"` replaced with `"disponible"` — more conversational, same semantic accuracy
- Final form: `"El producto exacto que buscas está agotado, pero encontré una alternativa disponible — ${alternativeNote}:"`
- Note formatting preserved — no forced lowercasing, consistent with BRANCH E discipline

**Review Result:**

- ✅ Specs-first justification preserved (tiers 1 and 2 unchanged)
- ✅ `ai_sales_note` used only when specs unavailable (disciplined, non-redundant)
- ✅ Note formatting preserved
- ✅ Tier 3 phrasing natural and concise
- ✅ Generic tier 4 intact — safe floor when no context available
- ✅ No orchestrator/RPC/schema/contract/UI changes
- ✅ No new field bridges (`ai_sales_note` already present in semantic path)

**Characteristics:**

- BRANCH D isolated; no other branches touched
- Tier-based composition aligned with BRANCH E pattern
- Wording discipline: note formatting preserved, conversational stock language
- Deployable within scope

**Outcome:** BRANCH D OOS alternative justification hierarchy aligned. `ai_sales_note` used as disciplined fallback when specs unavailable. Wording refined for natural Spanish. Commit: a0d2389.

---

### A73. BRANCH F No-Match Recovery-Guidance Refinement — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH F: NO_MATCH only).

**Refinement Applied:**

- No-match response remains safe and honest — no products surfaced, no availability implied
- Recovery guidance replaced vague `"¿Podrías intentar buscarlo con otras palabras?"` with actionable reformulation cues
- Concrete guidance categories: marca (brand), sabor (flavor), tipo de dispositivo (device type), modelo específico (specific model)
- Framing honest: `"suele dar mejores resultados"` (usually gives better results) — no guarantee implied
- No candidate product context invented; guidance is query-structure advice only

**Before:**

```text
Revisé el catálogo pero no logré encontrar disponibilidad que coincida con tu búsqueda.
¿Podrías intentar buscarlo con otras palabras?
```

**After:**

```text
Revisé el catálogo pero no logré encontrar nada que coincida.
Puedes intentar buscar por marca, sabor, tipo de dispositivo o modelo específico
— una búsqueda más concreta suele dar mejores resultados.
```

**Review Result:**

- ✅ Safe and honest — no availability claim, no implied product knowledge
- ✅ Recovery guidance actionable — four concrete reformulation categories provided
- ✅ Tone honest — `"suele"` (usually) avoids overcommitment
- ✅ No candidate product invented or implied
- ✅ `resolved_products: []` unchanged — BRANCH F still returns empty result
- ✅ `search_confidence: 0.1` unchanged
- ✅ No orchestrator/RPC/schema/contract/UI changes

**Characteristics:**

- BRANCH F isolated; no other branches touched
- Wording-only refinement — no logic, no data flow change
- Deployable within scope

**Outcome:** BRANCH F no-match response now provides actionable reformulation guidance without implying availability or product knowledge. Commit: 278eedb.

---

### A72. BRANCH E Semantic Hierarchy Alignment + Wording Discipline — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH E: SEMANTIC only).

**Implementation Applied:**

**1. Hierarchy Alignment:**

- BRANCH E semantic drafting now uses disciplined 4-tier hierarchy:
  - Tier 1: `specs` via `extractSpecsFact()` — technical match justification (unchanged)
  - Tier 2: `ai_sales_note` when specs unavailable — curated context, cautious tone
  - Tier 3: `description` via `extractDescriptionContext()` when neither specs nor note apply
  - Tier 4: generic fallback when all context unavailable (unchanged)
- `ai_sales_note` was previously present downstream but unused in BRANCH E

**2. Note Tier Discipline:**

- Note text used without forced lowercasing — preserves acronyms, brand names, intentional formatting
- Phrasing: `"(${topNote}) podría encajar con lo que buscas"` — cautious, not overconfident

**3. Description Tier Tone Alignment:**

- Description tier phrasing softened from `"encaja perfecto con lo que pides"` to `"podría encajar con lo que buscas"`
- Aligns tone with note tier; both express semantic uncertainty consistently
- Tier 1 (specs) retains confident `"encaja perfecto"` — justified as direct technical evidence

**Review Result:**

- ✅ `ai_sales_note` now used when specs unavailable (disciplined, non-redundant)
- ✅ Note formatting preserved (no forced lowercasing)
- ✅ Description tier tone matches semantic uncertainty of note tier
- ✅ Specs tier (tier 1) behavior unchanged — still preferred
- ✅ Generic fallback unchanged
- ✅ No orchestrator/RPC/schema changes
- ✅ No new field bridges (ai_sales_note already present in semantic path)
- ✅ No UI changes

**Characteristics:**

- BRANCH E isolated; no other branches touched
- Semantic lane refinement only (no exact-path reopening)
- Wording discipline: cautious tone for approximate matches, preserved for direct technical match
- Deployable within scope

**Outcome:** BRANCH E semantic drafting hierarchy aligned. `ai_sales_note` used when specs unavailable. Note formatting preserved. Description tier tone softened for consistency. Commit: 29433be.

---

### A71. Exact-Path Improvement: Context Lift + Fallback Naturalness — 20 de marzo de 2026

**Scope:** `src/lib/ai-capsule-schemas.ts` (schema extension), `src/services/ai-capsule-orchestrator.service.ts` (query + mapper), `src/lib/product-search-capsule.ts` (BRANCH C fallback logic).

**Exact-Path Enhancement Approved & Applied:**

**1. Schema Extension (ai-capsule-schemas.ts):**

- Added `description` field to `internalResolvedProductSchema` as semantic context
- Added `description` field to `publicAttachmentSchema` for downstream alignment
- Enables clean contract mapping without silent field drops

**2. Query Context Lift (ai-capsule-orchestrator.service.ts):**

- Extended exact query select: added `description, specs` fields (line 69)
- Added `description` mapping in `mapDbToInternal()` function
- Provides BRANCH C with full product context while keeping exact path isolated

**3. BRANCH C Fallback Logic (product-search-capsule.ts):**

- **Tier 1 (Priority):** `ai_sales_note` when available — curated messaging (unchanged)
- **Tier 2 (Fallback):** `specs` via `extractSpecsFact()` when `ai_sales_note` absent
- **Tier 3 (Safe):** Generic message when no useful context available
- Maintains high-confidence exact match behavior while improving message quality when curated notes unavailable

**4. Phrasing Naturalness Refinement:**

- Specs fallback sentence uses verb "Viene" for grammatical completeness
- Before: `¡Aquí tienes exactamente lo que buscabas! ${topSpecs}.`
- After: `¡Aquí tienes exactamente lo que buscabas! Viene ${topSpecs}.`
- Example output: "¡Aquí tienes exactamente lo que buscabas! Viene con sabor menta y nicotina 12mg."

**Adoption Review Result:**

- ✅ Real needed fix relative to committed HEAD (verified workspace drift resolution)
- ✅ BRANCH C exact path carries necessary product context
- ✅ ai_sales_note remains tier 1 priority (curated messaging preferred)
- ✅ specs fallback graceful when curated notes unavailable
- ✅ Phrasing refinement for natural Spanish grammar
- ✅ No semantic lane reopening (exact query only, no RPC/vector changes)
- ✅ Includes small downstream public-contract alignment: `description` propagated to public attachment schema via mapper (commit 33aa6b0)
- ✅ Safe degradation preserved (generic tier 3 always available)

**Characteristics:**

- Exact-path improvement with small downstream public-contract alignment
- Tier-based composition (priority + fallback + safe)
- Pure message composition enhancement, no feature expansion
- No UI redesign or downstream display changes
- Public attachment contract extended with `description` field (mapper commit 33aa6b0)
- Deployable within scope (exact path + mapper alignment)

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| With ai_sales_note | "¡Aquí tienes exactamente lo que buscabas! Premium all-day battery" (tier 1) |
| Without note, specs available | "¡Aquí tienes exactamente lo que buscabas! Viene con sabor menta y nicotina 12mg." (tier 2) |
| No context | "¡Aquí tienes exactamente lo que buscabas!" (tier 3 safe fallback) |

**Outcome:** Exact-path improvement adopted and reconciled. Real needed fix relative to committed HEAD (workspace drift resolved). BRANCH C now carries full product context with naturalized fallback messaging. Commit: 2b8be13. Deployable within scope.

---

### A70. Featured Fallback Justification Adoption — 20 de marzo de 2026

**Scope:** `src/lib/product-search-capsule.ts` (BRANCH B: FEATURED_FALLBACK only).

**Problem Identified:**

- BRANCH B message was generic when user intent is ambiguous
- Highlighted featured options lacked context about why they might be relevant
- Tone overcommitted to certainty ("Tengo varias opciones interesantísimas") despite ambiguity

**Adoption Approved & Applied:**

- **Tone Refinement:** "Tengo opciones interesantísimas" → "Veo opciones que podrían encajar"
- **Ambiguity Reframing:** "para darte la recomendación perfecta" → "para afinar la recomendación"
- **Optional Specs Cue:** Extracts top featured product specs; integrates as "sobre todo algunos [specs]" if available
- **Safe Fallback:** Returns to generic message when no useful specs available
- **Language Polish:** Changed "algunos" (feminine) to "algunos" (masculine) for natural agreement with "con [specs]" pattern

**Adoption Review Result:**

- ✅ Core logic branch-specific and cautious
- ✅ Message tone materially improved (more honest about ambiguity)
- ✅ Specs cue optional and safe (graceful degradation)
- ✅ Ambiguity posture fully preserved (still invites clarification)
- ✅ Language refinement applied for natural Spanish flow
- ✅ No field bridges, no feature expansion

**Characteristics:**

- Branch-specific improvement (BRANCH B isolated)
- Uses existing product context (specs via `extractSpecsFact()`)
- Message composition refinement, not capability change
- No new data transport
- Preserves cautious posture toward ambiguous queries

**Example Outputs:**

| Scenario | Output |
| --- | --- |
| With specs | "Veo varias opciones que podrían encajar, sobre todo algunos *con sabor menta y nicotina*. Para afinar la recomendación, ¿buscabas...Te dejo estas opciones destacadas:" |
| No specs | "Veo varias opciones que podrían encajar. Para afinar la recomendación, ¿buscabas...Te dejo estas opciones destacadas:" (generic fallback) |

**Outcome:** Featured Fallback justification upgrade adopted after cold adoption review. Language micro-fix applied. Ambiguity discipline preserved. Commit: 3e87a6c.

---

### A65. Marketing AI Reality Repair — 19 de marzo de 2026

**Scope:** `admin-coupons.service.ts`, `admin-marketing.service.ts`, `CouponForm.tsx`, `FlashDealEditor.tsx`, `services/admin/index.ts`.

**Highlights:**

- **Truth Repair:** Audit Phase 3 detected that `marketing-intelligence` Edge Function was missing from codebase/Supabase.
- **Local Heuristics:** Replaced non-existent remote AI calls with robust local business rules/heuristics for Coupon Generation, Flash Deal suggestions, and Impact Forecasting.
- **Sincerity Pass:** Replaced all misleading "Magic" and "IA" branding in UI and code with the "Sugerencia del Sistema" label family.
- **Internal Renaming:** Globably renamed `*Magic` functions to `*System` to ensure architectural honesty.
- **Factual Hardening (Local):** Migrated to local heuristics to bypass missing backend dependency. Verified zero 404/500 errors in verified manual path; residual network calls removed from code.

**Outcome:** Marketing AI Reality Repair complete. Baseline v113. PASS.

### A61. Audit: Wave 191 — Canonical Closure
**Date:** March 19, 2026
**Scope:** `customer-intelligence/index.ts`, `customer-intelligence/tools.ts`, `customer-intelligence/persona.ts`, `simulation_report.json`.
**Highlights:**
- **Validated and Closure-Ready:** Wave 191 is fully validated and canonically closed.
- **Pass Rate:** 13/13 scenarios passed in the validation suite.
- **Pass With Warning Status:** The `PASS_WITH_WARNING` cases are completely non-blocking. They relate to minor intent classification edge cases (like "queda stock" overlapping with compatibility signals) and do NOT represent functional failures.
- **Deployment Drift Explained:** The previous appearance of a regression (404/400 errors) was purely deployment drift. Slim deployments (V116–V120) incorrectly used the deprecated `gemini-1.5-flash` model, whereas the intended Wave 191 logic in the local source was already migrated to `gemini-2.5-flash`. Deploying the final production Edge Function (V121) resolved all false failures.
- **Future Follow-up Refinement:** Intent precedence between inventory phrasing ("queda stock", "queda del X") and `COMPATIBILITY_CHECK` signals may need later tuning, but architecture remains stable.
**Outcome:** Wave 191 Canonical Closure. PASS 13/13.

### A60. Audit: Wave 190 — Cesarin Human Evaluation Loop & Case-Triage
**Date:** March 19, 2026
**Scope:** `customer-intelligence/index.ts`, `simulate_cesarin.ts`, `cesarin_scenarios.json`, `ai_evaluations` [NEW].
**Highlights:**
- **Critical Runtime Fix:** Resolved Gemini `responseMimeType` field naming mismatch (v1 specification alignment), fixing structural 400 errors.
- **Model Stack Stabilization:** Consolidated Sommelier/Analyst/Embeddings to canonical v1/v1beta endpoints for March 2026 compliance.
- **Contract Drift Resolution:** Re-aligned simulation harness with Router/Capsule architecture (v110). Corrected 0/9 "false positive" failure rate caused by harness-side contract drift.
- **Evaluation Infra:** Implemented supervised review model allowing admins to score and tag live/simulated interactions.
- **Isolation:** Implemented `is_simulation` telemetry hardening to protect production KPIs from QA pollution.
**Outcome:** Runtime regression debunked; harness contract restored; Human Evaluation Loop operational. PASS.

### A59. Audit: Wave 189 — Analyst Refinement Loop
**Date:** March 19, 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/hooks/useAIConcierge.ts`, `src/services/concierge.service.ts`.
**Highlights:**
- **Analyst Intent Refinement:** Improved first-pass classification for abstract commercial queries ("barato", "frutal", "suave") via telemetry-driven few-shots.
- **Gemini API Stabilization:** Resolved `responseMimeType` vs `response_mime_type` mismatch in `v1` runtime contract.
- **Typecheck Drift Remediation:** Synchronized AI capsule contracts with frontend hooks. Resolved 100% of orchestration-layer type errors.
- **Canonicalization:** Explicitly mapped abstract commercial recommendations to `PRODUCT_SEARCH`.
**Outcome:** Reliance on deterministic guardrail rescue reduced; Analyst first-pass accuracy improved. PASS.

### A58. Audit: Wave 188 — Knowledge Enrichment Loop
**Date:** March 19, 2026
**Scope:** `supabase/seeds/seed_knowledge.ts`, `supabase/seeds/seed_runner.ts`, `supabase/tests/wave_188_validation.ts`.
**Highlights:**
- Identified 5 commercial knowledge gaps via `ai_analytics` telemetry (Payment Methods, Smoking cessation, Shipping costs, Starter kits, Xalapa location).
- Expanded canonical `seed_knowledge.ts` to 10 documents.
- Processed 41 knowledge chunks with `gemini-embedding-001` @ 3072d.
- Validated 5/5 semantic match using targeted validation suite.
**Outcome:** Knowledge base strengthened based on real pilot friction. PASS.

### A57. Pilot Operations Intelligence — Wave 187 — 19 de marzo de 2026
- **Scope:** `admin-pilot-ops.service.ts` [NEW], `useAdminPilotOps.ts` [NEW], `PilotTelemetry.tsx` [NEW], `TabPilot.tsx` [MOD], `services/admin/index.ts` [MOD], `hooks/admin/index.ts` [MOD].
- **Highlights:**
  - Operational telemetry cockpit added to Cesarin OS > Piloto Operativo (tab 8).
  - 8 KPI cards: total interactions, semantic match rate, fallback rate, avg latency, avg product cards, guardrail rescue count, zero-card misses, cart actions.
  - 7 bucket filters with canonical JSONB field paths: `zero_product_cards`, `fallback_used`, `successful_semantic_match`, `policy_query`, `cart_intent_signal`, `guardrail_rescue`, `frustration`.
  - Query log: capped at 100 rows, ordered `created_at DESC`, 7d default window. No unbounded fetches.
  - All JSONB extraction null-safe (`safeBool`, `safeNum`, `safeStr` helpers).
  - Architecture: DB → Service → Hook → Component. No new tables. No runtime changes.
  - Existing manual runbook checklist preserved below telemetry panel.
- **Outcome:** Piloto Operativo now shows actionable real-time telemetry. Team can identify misses, guardrail rescues, and knowledge gaps without reading raw logs.

### A56. Semantic Activation + Pilot Readiness Gate + Brain-First Guardrail — 19 de marzo de 2026
- **Scope:** `customer-intelligence/index.ts`, `supabase/seeds/seed_products.ts`, `supabase/seeds/seed_runner.ts`, `supabase/tests/test_pilot_queries.ts`, `STORE_FRONT_AI_PILOT_CONTEXT.md`, `AI_CONTEXT.md`, `pilot_readiness_gate.md`.
- **Highlights:**
  - **Embedding Corpus — 100% coverage:**
    - `products`: 44/44 active products embedded @ 3072d ✅
    - `store_knowledge`: 23/23 active chunks embedded @ 3072d ✅
    - Root cause fix: `gemini-embedding-001` requires `v1beta` endpoint (v1 returns 404). Both seed scripts corrected.
  - **Brain-First Guardrail (v106):** Two-layer fix applied to Analyst:
    - Layer 1: 3 new few-shot examples for abstract preference queries (barato/frutal, recomiéndame, suave/rico).
    - Layer 2: Deterministic guardrail expanded with 15+ commercial preference signals.
    - Layer 3: Auto-injection of canonical `tool_call` when guardrail rescues `UNKNOWN`.
    - Canon rule registered: **"Las capsules no deciden; las capsules ejecutan."**
  - **Pilot Query Suite:** 7 golden queries (PQ-1 → PQ-7). All 7 route correctly to expected capsule.
  - **Business Telemetry:** `semantic_match_success`, `fallback_used`, `product_card_count`, `cart_action_detected`, `product_match_count`, `policy_match_count` persisted live to `ai_analytics`.
  - **Architectural clarification:** `product_search_integrity` and `knowledge_rag_foundation` capsules are client-side handoffs (`requires_client_capsule: true`). The Edge Function is an orchestrator — product fetching happens in the frontend capsule.
  - **Honest status:** Analyst is still rescued by guardrail on some abstract queries (PQ-3, PQ-4, PQ-6). The experience routes correctly. Guardrail is a semantic rescue, not a replacement for Analyst reasoning.
- **Outcome:** **Pilot Readiness Gate: PASS (10/10 criteria). Cleared for unrestricted pilot.** Frente cerrado formalmente.

### A55. Gemini Specialized Stack & Embedding Repair — 19 de marzo de 2026
- **Scope:** Specialized Gemini Model Stack implementation, `embeddings-processor` repair, and DB infra restoration.
- **Highlights:**
  - **A55 (2026-03-19): Gemini Specialized Stack & 3072d Standardization**
  - Migrated All 9 Edge Functions to Gemini 2.5 specialized tiers.
  - Standardized embedding architecture to `gemini-embedding-001` (3072d).
  - Re-seeded `products` (44 items) and `store_knowledge` (RAG) with 3072d vectors.
  - Optimized `match_products` and `match_knowledge` RPCs (Fixed type casts and enums).
  - Verified end-to-end: Product cards + Knowledge RAG correctly rendered in UI.
- **Outcome:** Google AI operational front closed. Infrastructure ready for semantic retrieval.

### A54. Cart Operator Capsule — Canonization Handoff — 18 de marzo de 2026
- **Scope:** Completed Design Pass, Contract Materialization, Runtime Bridge + AI Routing, Store Middleware + UI Execution, E2E Validation + UI State Review.
- **Highlights:** Implemented `cart-operator-executor.ts` acting as a strict safe gate before hitting Zustand. Separated presentation layer from execution structural outcomes, enforcing the `AMBIGUOUS_MUTATION` and `UNSAFE_MUTATION` graceful degrade without dirtying React state.
- **Outcome:** Cart Operator Capsule consolidated as the third canonical capsule and designated as the official Safe Mutator behavior baseline.

## Known Constraints
- **Quota/Latency:** Gemini 2.5 models used (Flash) under active billing. Rate limits apply on Free Tier.
- **Embedding API:** `gemini-embedding-001` requires `v1beta` endpoint (v1 returns 404/405). Both seed scripts are corrected.
- **Analyst Refinement Success (Wave 189):** Abstract queries (price+flavor combos) now show significantly improved direct classification by the Analyst. Reliance on deterministic guardrail rescue is baseline-reduced but remains active as a safety net.
- **Memory:** Session-only history persists in `sessionStorage`.
- **Cart Completion Rate:** Currently 0% via concierge (expected — checkout-via-concierge not yet wired to payment flow).

### A53. Knowledge & RAG Foundation Capsule — Canonization Handoff — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`.
**Highlights:**
- **Capsule Complete:** Formalized the complete end-to-end materialization of the Knowledge & RAG Foundation Capsule.
- **Outcomes Covered & Validated E2E:** High confidence policy match, moderate confidence multi-source, low confidence fallback, no match, degraded, schema error.
- **UI Decoupling Canonized:** The UI cleanly consumes `capsule_contract` and `resolved_chunks` via `ui_render_hint` without making probabilistic assumptions.
- **Conversational Firewalling:** Free paraphrasing of canonical store policies by the LLM is now structurally blocked.
- **Invariants Protected:** Dual gate remains intact; the store functions robustly even if the Assistant or Embeddings DB fails.
- **Blueprint Established:** This capsule is now the designated architectural template for any future RAG or Memory retrieval features.

### A52. Product Search Integrity Capsule — Canonization Handoff — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`, `AUDIT_LOG.md`, `STORE_FRONT_AI_PILOT_CONTEXT.md`.
**Highlights:**
- **Capsule Complete:** Formalized the complete end-to-end materialization of the first Capability Capsule.
- **Outcomes Covered & Validated E2E:** Direct match, featured fallback, out of stock alternative, ambiguity hold, no safe result, degraded response, schema error.
- **UI Decoupling Canonized:** Proven that the storefront UI consumes resolved state cleanly without making its own commercial decisions (e.g., `OUT_OF_STOCK_ALTERNATIVE` explicit differentiation).
- **Invariants Protected:** Dual gate remains fully active and uncompromised; the core e-commerce experience remains robustly functional even if the AI backend fails.
- **Blueprint Established:** This capsule is now the designated architectural template required for future AI feature developments.

### A51. Product Search Integrity Capsule — Base Contract Materialization — 18 de marzo de 2026

**Scope:** `src/types/ai-capsule.ts`, `src/lib/ai-capsule-schemas.ts`, `src/lib/ai-capsule-mappers.ts`.
**Highlights:**
- **Contract Approved:** The first capsule pattern contract was materially approved.
- **Type Safety:** Base types/interfaces and strictly typed Zod validation schemas were created.
- **Sanitized Mapping:** Pure mapper shell(s) created using safe data derivation without fake payloads.
- **Strict Bounds:** No runtime wiring, no UI wiring, and no DB integration was introduced.
- **Status:** This pass remains strictly pre-tool-schema, pre-fallback-tree, and pre-runtime-wiring.

### A50. Cesarín Capability Capsules Architecture Adoption — 18 de marzo de 2026

**Scope:** `AI_CONTEXT.md`.
**Highlights:**
- **Architecture Doctrine Adopted:** The "Capability Capsules" philosophy was formally canonized to guide future AI feature development.
- **Boundaries Formalized:** Defined strict principles for bounded responsibility, failure isolation, and explicit signaling to prevent monolithic sprawl.
- **Documentation Pass:** This was an architecture documentation pass exclusively. No runtime code, pilot semantics, or kill switch boundaries were altered.
- **Future Direction Checkpointed:** The Product Search Integrity Capsule was identified as the baseline template for future incremental refactoring.

### A49. Slice 2D — Storefront Degraded Experience Hardening — 18 de marzo de 2026

**Scope:** `src/services/concierge.service.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`.
**Highlights:**
- **Silent error swallowing removed:** API exceptions now throw strictly to the UI layer.
- **Explicit timeout handling:** 25-second limit enforced securely.
- **Explicit storefront-safe error UI:** Safe messaging generated per error mode (quota, timeout, generic).
- **Retry path added:** Exact last user message structurally re-fired on "Reintentar" click.
- **No raw technical leakage:** JSON limits and infrastructure clues shielded from end users.
- **No new modules introduced:** Architecture bounds respected perfectly.
- **Semantics uncompromised:** The pilot session gate (`?pilot=cesarin`) and the global kill switch behavior remained entirely untouched.

### A48. Storefront AI Pilot Readiness — Slices 1A–2C — 18 de marzo de 2026
- **Phase:** Pilot Operational (Gemini 2.5 Specialized Stack)
- **Status:** LIVE & VALIDATED (Router Intelligence Active)
- **Slices Completed:** 1A, 1B, 1C, 2A, 2B, 2C, 2D + Model Stack Upgrade
**Scope:** `src/App.tsx`, `AdminCesarinOS.tsx`, `persona.ts`, `TabPilot.tsx`, `store_settings` table.
**Highlights:**
- **Slice 1A (Persona Freeze):** Locked the Sommelier persona for pilot usage.
- **Slice 1B (Global Kill Switch):** Implemented `is_ai_assistant_enabled` gate in storefront.
- **Slice 1C (Admin Control):** Added master toggle to Cesarin OS header.
- **Slice 2A (Pilot Exposure):** Implemented session-based gate via `?pilot=cesarin` to restrict visibility.
- **Slice 2B (Runbook):** Created operational runbook UI with structured QA scenarios.
- **Slice 2C (Commercial Hardening):** Improved response quality for ambiguous and budget-sensitive queries.
- **2C Closeout:** Audited and verified persona rules vs runbook scenarios as pilot-safe.

### A47. Phase 4.3D — Inventory Signal Bridge — 17 de marzo de 2026

**Scope:** `index.ts`, `persona.ts`, `cesarin_scenarios.json`.
**Highlights:**
- **Signal Bridge:** `signal_quality` from inventory oracle is now correctly exposed to the Sommelier prompt.
- **Cautious Persona:** Implemented persona rules for calibrated confidence when inventory data is insufficient.
- **Drift Resolution:** Found and fixed logic drift where calculated stock intelligence was lost before reaching final answer generation.
- **Hygiene:** Cleaned up duplicate prompt lines and redundant bullet points in persona guidance.

### A46. Document Reconciliation Audit — 17 de marzo de 2026

**Scope:** AI_CONTEXT.md, AUDIT_LOG.md, Repository Structure.
**Highlights:**
- **Truth Restoration:** Reconciliada la documentación con la realidad del repositorio.
- **Precision Counts:** Actualizados conteos de Types (10), Services (25), Hooks (44), Migraciones (52) y Edge Functions (14).
- **Phase Canonization:** Formalizadas las fases 4.3A, 4.3B y 4.3C como completas tras verificación de código en `persona.ts` y `tools.ts`.
- **Wave Alignment:** Ajustado el conteo de Waves a 184.

### A45. Phase 4.3C — Inventory Signal Quality Framing — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (get_inventory_outlook).
**Highlights:**
- **Estimative Language:** Implementada la Regla de Persona #7 que obliga al uso de términos estimativos para proyecciones de stock.
- **Signal Preservation:** Verificada la propagación del flag `signal_quality` desde el Oracle hasta el orquestador.

### A44. Phase 4.3B — Out-of-Stock Response Discipline — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (search_products).
**Highlights:**
- **OOS Acknowledgment:** Implementada la Regla de Persona #6 para el reconocimiento obligatorio de productos agotados antes de ofrecer alternativas.
- **Stock Guardrails:** Restricción estricta de recomendaciones solo a productos con stock disponible en el set de resultados.

### A43. Phase 4.3A — Featured Fallback Signal Framing — 17 de marzo de 2026

**Scope:** `persona.ts`, `tools.ts` (search_products).
**Highlights:**
- **Signal Integrity:** Implementada la Regla de Persona #5 para distinguir entre coincidencias directas y resultados destacados (Featured Fallback).
- **Communication Guard:** El Sommelier ahora encuadra los resultados destacados como alternativas generales, no como respuestas exactas.

### A42. Phase 2 — Tag Cleanup & Storefront Bridge — 16 de marzo de 2026

**Scope:** Tag Classification Utility, SQL Migration wave, Storefront components (`ProductBadgeGroup`, `ProductCard`, `ProductInfo`).
**Highlights:**
- **Automated Classification:** Implementada utilidad `tag-discovery.ts` con lógica de confianza (90% auto-migrate) y sensibilidad al contexto (Sección/Categoría).
- **SQL Migration Wave:** Generado y validado script SQL altamente preciso para migrar etiquetas técnicas a `specs` (potencia, nicotina, etc.) con llaves normalizadas.
- **Unified Storefront Bridge:** `ProductBadgeGroup` centraliza ahora badges legados y el nuevo array `badges`, eliminando lógica harcodeada en el resto de la app.
- **Specs Presentation Layer:** Implementado mapeo de llaves técnicas a labels humanos en `ProductInfo.tsx`.
- **Zero-Regression Transition:** Los productos no migrados mantienen su comportamiento legacy exacto mientras los nuevos ya consumen la ontología estructurada.

### A39. Wave 163 — Admin Refactor Phase 1 — 16 de marzo de 2026

**Scope:** Catalog Ontology, Admin Attributes UI, Product Editor Drawer, Database Schema.
**Highlights:**
- **Product Ontology Evolution:** Separation of technical Specs (fixed JSON) and Variants (purchasable/stockable options).
- **4-Tab Admin UX:** Rediseño del `ProductEditorDrawer` en Comercial, Clasificación, Configuración e Inteligencia.
- **Global Attributes:** Implementado control de aplicabilidad (Vape/420) y capacidad de variante en `AdminAttributes.tsx`.
- **Collections System:** Creada infraestructura para agrupaciones transversales de productos.
- **Safe Migration:** Los flags heredados (`is_new`, etc.) se migraron dinámicamente al nuevo array de `badges`.

### A40. Wave 164 — Admin Stabilization Wave — 16 de marzo de 2026

**Scope:** Product Variants Editor, Admin Attributes, Product Editor Drawer, AI Context logic.
**Highlights:**
- **Enforcement Rails:** Solo se permiten atributos con `is_variant_capable=true` para generar variantes.
- **Category Applicability:** Los atributos ahora soportan aplicabilidad granular a nivel de categoría para escalabilidad masiva.
- **Guided Specs:** Implementado sistema de sugerencias y normalización de specs basado en categorías/slugs.
- **Type Safety Restoration:** Corregido 100% de errores JSX y tipos nulos en la gestión de atributos.

### A41. Phase 2 Audit — Tags & Badges — 16 de marzo de 2026

**Scope:** Product Tags, Badges Array, Storefront Display.
**Highlights:**
- **Contamination Cleanup:** Identificados patrones de etiquetas técnicas (`mg`, `ml`, `watts`, `vg`) para futura migración a Specs o Variantes.
- **Storefront Gap:** Detectada dependencia legacy de flags booleanos en el frontend; se requiere migración al arreglo de `badges`.
- **Governance:** Confirmada la validez de la tabla `product_tags` como fuente canónica de limpieza.

### A38. Wave 161 — AI Persistency & Smart Sessions — 16 de marzo de 2026

**Scope:** Infraestructura de persistencia para el Simulador de Cesarin OS.
**Highlights:**
- Creada tabla `ai_simulation_sessions` con TTL de 7 días.
- Implementada detección de "should_close_session" en la Edge Function mediante NLP.
- Refactorizada UI (`TabSimulator.tsx`) para incluir Sidebar de sesiones y gestión de estados (Activa/Cerrada).
- Zero-Any policy mantenida en toda la integración.

### A37. Wave 160 — Cesarin OS World-Class SaaS Evolution — 16 de marzo de 2026

**Scope:** Global AI Module Admin Infrastructure. Refactorizada `AdminCesarinOS.tsx` a componentes funcionales modulares en `src/components/admin/cesarin/`.

**Highlights:**
1.  **Strict Typing**: Implementada interfaz `src/types/cesarin.ts`, eliminando el 100% de los `any` en el módulo administrativo.
2.  **SaaS Architecture**: División del dashboard en 6 pestañas especializadas (Persona, Knowledge, Rules, Simulator, Learning, Analytics).
3.  **UI/UX Premium**: Implementación de **Neural Glassmorphism** avanzado y micro-animaciones con `framer-motion`.
4.  **Learning Loop**: Activación del motor de sugerencias de reglas basado en frustración de cliente real.

---

### A36. Wave 159 — Cesarin OS Neural Engine & API Restoration — 16 de marzo de 2026

**Scope:** Global AI Infrastructure & Admin OS. Modificados `customer-intelligence`, `dashboard-intelligence`, `AdminCesarinOS.tsx` y `persona.ts`.

**Highlights:**
- **Gemini Stability:** Restaurada conectividad con modelos Google v1beta mediante el sufijo obligatorio `-preview`.
- **Visual FIX:** Inyección de `cover_image` en el contexto del producto para restaurar thumbnails en el chat.
- **Bias Neutralization:** Ajustada la filosofía de persona para priorizar intención de usuario sobre marcas específicas (fin del sesgo Juicee).
- **Neural Mastery:** Implementada conexión real entre analítica de frustración y el panel de "Modo Aprendizaje" administrativo.
- **Sync Total:** Estandarizado el esquema de respuesta JSON (`products`) para asegurar el funcionamiento del Hallucination Limiter.

### A35.- **Wave 148 (DONE)**: Frontier Wow Upgrade. Gemini 3.1 Flash-Lite, Sommelier Persona (Human-like) y Guía de Recuperación en AI_CONTEXT.md.
**Scope**: All 6 AI Edge Functions upgraded to `gemini-3.1-flash-lite-preview`. Concierge persona refined to "Expert Human Sommelier". Hybrid Search (Words + Vectors) fully optimized for discovery.

### A34. Wave 146 — AI Efficiency Stack & Documentation Master — 16 de marzo de 2026

**Scope:** Global AI Infrastructure. Updated all 6 intelligence Edge Functions, `AI_CONTEXT.md`, `concierge.service.ts`, and `useAdminDashboard.ts`.

**Highlights:**
- **Cost Mastery:** Migración 100% a `gemini-2.5-flash-lite`, reduciendo costos de API en un 50%.
- **Zero-Waste Policy:** Implementación de disparadores "On-Demand" en el Panel Admin y Caché de Sesión en el Storefront.
- **Master Documentation:** Actualización exhaustiva de `AI_CONTEXT.md` con ejemplos JSON reales de cada módulo y guías de consumo.
- **Voice Sovereignty:** Verificación del flujo de búsqueda por voz multimodal con el nuevo modelo Lite.
- **Build Quality:** Verificación de tipos en servicios de voz y concierge.

---

### A33. Wave 124 — Deep Audit Core Infrastructure & Admin Cleanup — 15 de marzo de 2026

**Scope:** Admin Panel, Global Hooks, Core Services, and UI Components. Modificados `admin-orders.service.ts`, `AdminCommandPalette.tsx`, `admin-dashboard.service.ts`, `useAIConcierge.ts`, `useVoiceRecorder.ts`, e indices barrel.

**Highlights:**
- **Seguridad y DB:** Supabase UI Query Cleanup. Migración de la búsqueda paralela del `AdminCommandPalette` en UI hacia la capa de Servicios y eliminación del componente duplicado en `layout/`.
- **Tipado Duro:** Erradicación de tipos `any` en la capa de servicios administrativos y hooks de IA/Voz.
- **Web Speech API:** Definición nativa e interfaces seguras inyectadas al hook `useVoiceRecorder` para máxima estabilidad.
- **React Performance:** Limpieza de warnings de dependencias en React Hooks (`exhaustive-deps`) en búsqueda NLP.
- **Build Quality:** Typescript emitió 0 errores (`npm run typecheck` limpio). Cumplimiento del 100% en tipado duro (§1.2) en Core and 98/100 en flujo de DB en Admin.

---

### A1. Módulo Pedidos/Orders — 37 issues → 37 resueltos

**Scope:** 56 archivos (+2235/−946 líneas). Commit `9c934ab`. Includes: pages (UserOrders, OrderDetail, admin orders), hooks (useOrders), services (orders.service, admin-orders.service), types (order.ts), checkout flow.

**Highlights:**
- Migración completa de validación a Zod schemas (`checkoutSchema.safeParse`)
- Extracción de lógica de checkout a `useCheckout` hook
- Centralización de pricing en `calculateOrderTotal()`
- Integración loyalty points en checkout flow
- Fix OrderDetail component lifecycle y estado loading
- Admin orders: optimistic updates, DnD kanban, status transitions

### A2. Módulo Clientes — 22 issues → 22 resueltos

4 HIGH, 9 MED, 9 LOW. Archivos modificados: 8. Archivos creados: `src/types/customer.ts`.

Key fixes: tipos `CustomerProfile`/`CustomerTier` extraídos, `formatCurrency` duplicado eliminado, `(customer as any).loyalty_points` reemplazado por `useQuery`, fake coupon stub eliminado, imports normalizados, `useNotification` en vez de `react-hot-toast`.

### A3. Módulo Productos — 34 issues → 20 resueltos, 14 aceptados/diferidos

9 HIGH, 15 MED, 10 LOW. Archivos modificados: 14. Creados: `src/lib/product-sorting.ts`. Eliminados: `products/TrustBadges.tsx`.

Key fixes: `useNotification` migration, sort logic extracted shared, StickyAddToCart loop fix, QuickView badge expiry validation, nested `<Link>` fix, click-outside guard, section-aware colors, dep arrays stabilized.

### A4. Módulo Categorías — 9 issues → 4 resueltos, 5 aceptados/diferidos

2 HIGH, 4 MED, 3 LOW. Archivos modificados: 9.

Key fixes: dead code eliminated (`VAPE_CATEGORIES`/`HERBAL_CATEGORIES`), dynamic Tailwind → static, barrel imports, Section import normalized.

### A5. Módulo Carrito & Checkout — 11 issues → 4 resueltos, 7 aceptados/diferidos

2 HIGH, 5 MED, 4 LOW. Archivos modificados: 3.

Key fixes: checkout redirect race condition, CartSidebar ARIA, idiomático image guard, useCheckout import path.

### A6. Módulo Search — 7 issues → 5 resueltos, 2 diferidos

MED/LOW. Archivos modificados: 4.

Key fixes: Section import normalized, `optimizeImage` in SearchBar, MobileSearchOverlay ARIA, dead re-export removed.

### A7. Módulo Auth — 8 issues → 4 resueltos, 4 diferidos

1 HIGH, 3 MED, 4 LOW. Archivos modificados: 2.

Key fixes: `loadProfile` deps, password reset functional, unnecessary cast removed, terms links→planned.

### A8. Módulo Home — 12 issues → 4 resueltos, 8 diferidos

3 HIGH, 4 MED, 5 LOW. Archivos modificados: 4.

Key fixes: Section import, `optimizeImage` en FlashDeals, MegaHero external URL → inline SVG.

### A9. Full Sweep Layout/UI/Notifications/etc — 19 issues → 12 resueltos, 7 diferidos

2 HIGH, 10 MED, 7 LOW. Archivos modificados: 12.

Key fixes: fake aggregateRating removed, loyalty tier inconsistency fixed, Section imports, typos, CSS classes, overflow normalization, Footer URLs → SITE_CONFIG, `alert()` → useNotification.

### A10. Admin Module — 118 archivos auditados, 15 issues → 13 resueltos

Archivos modificados: 13. Key fixes: `alert()` → useNotification, Section imports normalized, console.error eslint-disable, redundant default exports removed.

### A11. Admin Tags Refactor — Vista compacta + modal + paginación

Archivos creados: 5. Modificados: 2. Eliminados: 3. Homogenización con pattern AdminBrands.

### A12. Admin UX Polish — Touch targets, mobile actions, aria-labels

Archivos modificados: 6. Touch targets ≥44px, mobile-visible actions, contrast fixes, dashboard active preset.

### A13. Bundle Optimization — Main chunk −79%

Main: 624→132 kB. Sentry lazy, framer-motion lazy, CartSidebar lazy, vendor splitting (7 chunks), sourcemap hidden. Archivos modificados: 6.

### A14. Deep Performance — ProductCard memo, lazy QuickView, preconnect

ProductCard: 17→7 kB. Presence WebSocket admin-only. Hero `fetchPriority="high"`. Supabase preconnect. `optimizeImage()` functional. Archivos modificados: 8.

### A15. UX/UI Storefront — Accesibilidad, mobile, conversión

35 issues found, 17 fixed. Focus traps, responsive hero height, empty cart toast, mobile-visible actions, real compare_at_price, dead links removed, terms→Link, SEO components. Archivos modificados: 14.

### A16. Security Hardening

16 issues, 10 fixed. PostgREST injection escape, crypto.randomUUID passwords, CSP headers, password policy OWASP, rate limiting login, updateOrderStatus removed from storefront, MercadoPago URL validation, console stripping, cart cross-tab validation. Archivos modificados: 9.

### A17. UI Fixes — Header gap, flash images, wishlist button

3 fixes: sr-only h1 moved, image fallback chain, Heart button in ProductActions. Archivos modificados: 4.

### A18. Admin Fixes — Product actions, DB-backed wishlist

- **Flash Deals Evolution:** Sincronización completa con el schema de DB (`flash_price`, `max_qty`, `ends_at`). Implementación del efecto "Burning Bar" con triple capa de fuego y resplandor.
- **AI Search Intelligence:** Implementación de "AI Insights" y sugerencias predictivas en la barra de búsqueda. Añadido efecto de focus aura pulsante.
- **Física de UI:** Transformación del icono de carrito a un componente basado en física de resortes (spring physics) para interacciones premium.
-   **Base Build:** v108
- **Live Pulse:** Sistema de monitoreo visual en tiempo real en el Header indicando actividad de la tienda.
- **TopBanner Cinematic:** Refactorización de promociones con AnimatePresence, transiciones elásticas y modo de urgencia crítica.
- **Estabilidad de Datos:** Resolución de fallos en el servicio de cupones y alineación de variables de estado local para precisión numérica en el admin.

---

### A29. Auditoría Integral del Panel de Administración (Waves 52-57) — 12 de marzo de 2026

**Scope:** 17 orquestadores de páginas admin, 12 servicios de administración, componentes de configuración y monitoreo.

**Highlights:**

- **Seguridad §1.8:** Saneamiento de más de 25 llamadas a `console.log` y `console.error` expuestas en producción.
- **Arquitectura §1.2:** Refactorización de todos los servicios admin para eliminar `select('*')` en favor de selectores de columnas explícitos.
- **TypeScript Purity:** Verificación de 0 `any` en todo el módulo Admin (Dashboard, Productos, CRM, Marketing, Configuración).
- **IA Integration:** Integración de Google Gemini en el Dashboard para insights automáticos.
- **TSC Verification:** Paso de `npm run typecheck` global con 0 errores.

---

### A30. Wave 58 & 59 — Admin Hyper-Drive & CRM Intelligence — 12 de marzo de 2026

**Scope:** 8 archivos modificados/creados. Componentes (`AdminPulse`, `AIInsights`, `AdminCommandPalette`), Services (`admin-crm.service`), Páginas (`AdminBatchManager`).

**Highlights:**

- **Antigravity Pulse:** Implementación de monitoreo en tiempo real basado en Supabase con polling optimizado (1m) para ahorro de recursos.
- **AI Strategic Insights:** Motor de recomendaciones proactivas usando Gemini 1.5 Pro, con trigger manual para control de costos.
- **CRM Intelligence:** Funciones de generación de WhatsApp Copy personalizado basado en el contexto del cliente (RFM Segments).
- **Batch Manager:** Interfaz de alta densidad para edición masiva de productos (precio/stock) con estados modificados visuales.
- **Seguridad §1.8:** Sanitización de `console.error` en todos los nuevos componentes admin (env guard obligatorio).
- **TypeScript Purity:** 0 `any` en todos los nuevos servicios e interfaces de inteligencia.

---

### A31. Wave 60 — Quantum Administration (The Final Polish) — 12 de marzo de 2026

**Scope:** 15 archivos (+1850/−450 líneas). Infraestructura Sensorial (`TacticalProvider`), Ambiance (`AnimatedAtmosphere`), AI Logic (`admin-nlp.service`), Voice Interaction (`useVoiceRecorder`).

**Highlights:**

- **Tactical UI (Sensory Engine):** Implementación de motor auditivo procedural (Web Audio API) y háptico. Cero assets MP3; todo sonido es sintetizado en tiempo real para máxima performance.
- **Ambient Business Intelligence:** El dashboard "respira" visualmente. Integración de `AnimatedAtmosphere` que cambia gradientes HSL según el pulso del negocio (Optimal/Busy/Alert).
- **Quantum Search (NLP & Voice):** Evolución del Command Palette con dictado de voz nativo y parseo semántico vía Gemini. Soporta intenciones complejas ("Busca pedidos de Juan mayor a 500").
- **Smart Supplier Connect:** Automatización de re-stock. El Batch Manager ahora detecta stock crítico (<5) y genera copys personalizados de WhatsApp para proveedores usando IA.
- **TypeScript Purity §1.1:** Auditoría final de Wave 60 con 0 `any` en servicios core. Tipado estricto para respuestas de Edge Functions.
- **Documentación JSDoc:** Cobertura del 100% de los nuevos hooks y componentes con estándares profesionales de documentación técnica.
- **Estabilidad Visual:** Resolución de warnings de Framer Motion y optimización de capas de glassmorphism con texturas de ruido SVG para look "Ultra-Premium".

---

### A32. Wave 70 — AI Immersion & Sensory Excellence — 12 de marzo de 2026

**Scope:** 12 archivos core (+2150/−380 líneas). Storefront (`App.tsx`, `AIConcierge`, `SearchBar`, `CartSidebar`, `CheckoutForm`), Contexts (`TacticalContext`), Services (`concierge.service.ts`).

**Highlights:**

- **Quantum AI Assistant:** Implementación de `AIConcierge.tsx` con estética Obsidian Quantum (glassmorphism pro, ruido SVG) y físicas de resorte.
- **Búsqueda Semántica:** Upgrade de `SearchBar.tsx` con botón "IA Smart". Integración con `concierge.service.ts` para descubrimiento de productos basado en lenguaje natural y contexto del cliente.
- **Sensory Storefront:** Migración de `TacticalProvider` del Admin al Main Layout global. Feedback auditivo y háptico en todas las interacciones críticas de venta.
- **Resilience Strategy:** Refactorización preventiva de `TacticalContext.tsx` para evitar crashes en motores de audio antiguos y preparación del terreno para Wave 80 (Fault Isolation).
- **Master Sync:** Sincronización de `AI_CONTEXT.md` a v1.9.0-hyper y creación de `MASTER_EXPERIENCE.md`.

---

### A62. Wave 192 Knowledge Ops Manager — 19 de marzo de 2026

**Scope:** Conversion of existing Cesarin OS knowledge surfaces into an administrative Knowledge Ops Manager (`store_knowledge`, `product_concepts`, `compatibility_relations`, `concept_aliases`).
**Version:** v112

**Highlights:**
- **Outcome:** IMPLEMENTED / PENDING VALIDATION (Requires runtime browser testing against Section 15 ACs).
- **Master-Detail Transformation:** Enhanced `TabKnowledge` and `TabConcepts` UIs without adding new top-level components or breaching architectures.
- **Strict Dropdown Safeties:** Enforced directional edge graphing with hardcoded constraint dropdowns for `relation_type` and `scope`.
- **Safe Edit Mode:** Deep inspection drawers providing Safe Edit access with explicit, single-action embedding updates (`update_chunk`) exclusively for `store_knowledge`.
- **Gap Flag Telemetry:** Embedded operational data observability inside native UIs (detecting orphans/empty aliases).
- **Immutable Constraints Preserved:** Zero schema migrations natively executed; purely relying on pre-existing RPCs/Tables in a strictly read-first, edit-second pattern.

---

### A63. Wave 192 Final Remediation & Closure — 19 de marzo de 2026

**Scope:** Resolution of deployment drift for `knowledge-ingestor` Edge Function, Embedding Model canon alignment, and RLS Admin claims fix.
**Version:** v112

**Highlights:**
- **Edge Function Fix & Canon Alignment:** Corrected `knowledge-ingestor` to use `gemini-embedding-001` (closing model drift from `gemini-embedding-2-preview`). Deployed strictly with JWT verification enabled to secure `service_role` execution.
- **RLS/Admin Data State Fix:** Identified that empty `product_concepts` was caused by missing JWT `app_metadata` claims. Remedied operationally by injecting `{"role": "admin"}` to the test user's `auth.users` record, unlocking RLS reads and confirming 15 native rows exist.
- **Outcome:** DONE. All UI components (Directional Relations, Gap Flags, Safe Edit Sync) successfully validated in runtime browser agent.

### A64. Deploy/Runtime Parity Hygiene (A64) — 19 de marzo de 2026

**Scope:** Resolution of deployment drift ambiguity and cache ghosts via diagnostic telemetry injection and Service Worker hardening.
**Version:** v112 (Runtime Parity stabilized)

**Highlights:**
- **Outcome:** FINAL CANONICAL CLOSURE.
- **Verification:** Full validation in installed PWA (Windows) confirmed.
- **Admin Launcher:** The "Ir a Admin (Cesarin OS)" link is visible only to admins and functions correctly in PWA.
- **Pilot Session Activator:** "Enable Pilot Session" in the admin panel allows activating the pilot gate in environments where URL manipulation is restricted (e.g., installed PWA).
- **Session-Scoped Behavior (Confirmed):** The pilot gate correctly adheres to `sessionStorage` semantics. It persists during active usage and internal navigation but resets upon absolute app/tab closure. This behavior is expected and does NOT affect the persistent authentication of the user.
- **SW Hardening:** Migration to version-aware cache keys and `updatefound` lifecycle resolved potential "ghost build" regressions.
- **Architecture:** All diagnostic signals are injected into existing `TabPilot` and `AdminPulse` surfaces, strictly adhering to the "no new top-level components" directive.
- **Baseline Alignment:** Confirmed `v112` remains the canonical anchor.

---
---

### Mercado Pago Checkout E2E Stabilization â€” 24 de marzo de 2026

**Scope:** `supabase/functions/create-payment/index.ts`, `supabase/functions/mercadopago-webhook/index.ts`, `supabase/config.toml`, `.github/workflows/deploy-functions.yml`, and `orders` payment fields mutated by Mercado Pago.

**Problem Identified:**

The checkout loop still carried documentary uncertainty around two critical points: (1) `create-payment` had previously hidden order lookup failures behind restrictive assumptions on joined customer profile data, making real DB lookup errors hard to diagnose; (2) the Mercado Pago async loop had no canonized closure proving that Checkout Pro could return asynchronously and mutate Supabase autonomously. Deployment discipline was also unresolved at the documentation layer because the host OS cannot be relied on for local Docker-backed Supabase Edge deployment.

**Remediation Applied:**

1. **`create-payment` lookup hardening** â€” current implementation now reads the order with `.select('*')` and logs raw Supabase errors before throwing a precise `DB Error`, instead of depending on restrictive profile joins. This removes the prior swallowed-error posture and keeps Mercado Pago preference creation coupled only to the order row actually required for checkout.

2. **Webhook E2E confirmation** â€” `mercadopago-webhook` accepts Mercado Pago payment notifications, resolves the payment remotely via MP API, extracts `external_reference`, and updates the matching `orders` row directly with `payment_status`, `status`, `mp_payment_id`, `mp_payment_data`, and `updated_at`. Real sandbox verification confirmed the end-to-end loop: `create-payment` returned `200 OK`, Mercado Pago callback returned `200 OK`, and the target order row was updated with `mp_payment_id` plus autonomous payment-state mutation.

3. **Deployment canon formalized** â€” the supported deploy route for Supabase Edge Functions is GitHub Actions pipeline-first via `.github/workflows/deploy-functions.yml`, used to bypass local host limitations around Docker-backed function deployment. For Mercado Pago specifically, `mercadopago-webhook` must remain configured with `[functions.mercadopago-webhook] verify_jwt = false` in `supabase/config.toml` so external Mercado Pago requests are not blocked at the function boundary.

**Outcome:** Mercado Pago Checkout Pro is now documented as structurally closed E2E in sandbox. `create-payment` failure visibility is restored, the asynchronous webhook loop is confirmed mutating `orders.mp_payment_id` and payment state, and deployment requirements are canonized around GitHub Actions plus `verify_jwt = false` for the webhook.

---

### Cierre de Deuda Técnica: CI/CD Webhook & Loyalty RPC — 24 de marzo de 2026

**Scope:** Acceptance audit of `.github/workflows/deploy-functions.yml` plus documentary closure of the remote loyalty dependency defined in `supabase/migrations/20260310_loyalty_rpc_fix.sql` and consumed by `src/services/loyalty.service.ts`.

**Problem Identified:**

Two residual infrastructure debts remained after Mercado Pago Checkout E2E stabilization. First, the deployment canon already stated that external Mercado Pago callbacks require `mercadopago-webhook` with JWT verification disabled, but the GitHub Actions deploy workflow still omitted an explicit deployment step for that function. Second, the loyalty flow still depended on remote presence of `process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)`; when absent, client RPC calls degraded into the masked `PGRST202` failure path without changing local repo state.

**Remediation Applied:**

1. **CI/CD webhook closure** — `.github/workflows/deploy-functions.yml` now includes an explicit `Deploy mercadopago-webhook` step using `supabase functions deploy mercadopago-webhook --project-ref $PROJECT_ID --no-verify-jwt`. Acceptance audit result: the YAML change is narrow, syntactically coherent, consistent with the existing workflow pattern (`knowledge-ingestor` already used `--no-verify-jwt`), and correctly aligned with `supabase/config.toml` plus the external-callback requirements of Mercado Pago.

2. **Remote loyalty RPC satisfaction** — the RPC declared in `supabase/migrations/20260310_loyalty_rpc_fix.sql` (`process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID)`) was validated as present in the remote database with the required `GRANT EXECUTE ... TO authenticated`. This closes the previously unresolved dependency behind `src/services/loyalty.service.ts` methods `addLoyaltyPoints`, `redeemPoints`, and `adjustPoints`, and resolves the silent `PGRST202` exception path as a live-environment debt rather than a code defect.

**Outcome:** The critical commercial infra loop is now closure-clean at the documentation layer. Mercado Pago webhook deployment is inside the persistent CI/CD path instead of depending on ad hoc manual deploy memory, and the loyalty points engine's RPC dependency is documented as remotely satisfied. Combined with the prior Checkout Pro E2E stabilization, checkout, webhook delivery, and loyalty points execution are now recorded as free of the previously open technical debt.

---

### Catalog Grid Zero-Lag Canon â€” ProductCard Spotlight Hardening â€” 24 de marzo de 2026

**Scope:** `src/components/products/ProductCard.tsx` only. Performance micro-pass on the storefront catalog card. No grid rewrite, no Framer Motion redesign, no ProductGrid architecture changes.

**Problem Identified:**

`ProductCard.tsx` performed continuous `getBoundingClientRect()` reads inside `onMouseMove` to drive the spotlight layer. On dense product grids this created layout thrashing and main-thread pressure, especially on touch devices where the effect added no meaningful value but still damaged scroll smoothness.

**Remediation Applied:**

1. **Spotlight geometry caching** â€” card bounds are captured on pointer entry and reused instead of re-reading layout on every move.
2. **Frame-bound updates** â€” spotlight coordinates now flow through `requestAnimationFrame` and CSS local variables instead of raw pointer-frequency writes.
3. **Capability-gated rendering** â€” the spotlight layer renders only on devices matching `matchMedia('(hover: hover) and (pointer: fine)')`; touch devices no longer execute the heavy path.
4. **Handler stabilization** â€” internal callbacks and derived values were stabilized to preserve the practical benefit of `React.memo()` across large catalog grids.

**Outcome:** `ProductCard.tsx` now preserves the premium desktop feel without sacrificing touch scroll smoothness. The storefront canon is formally updated: any continuous catalog animation in high-cardinality grids must use rAF or cached CSS-variable strategies and must degrade away on touch-class devices. Auditor status: **ACCEPT**.

### Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening — 26 de marzo de 2026

**Why this lane was opened:**

Payment continuation from the storefront (orders index, order detail, payment-return pages, cart, and checkout surfaces) lacked a shared persisted-truth-first gate for deciding whether re-entry into a Mercado Pago preference was safe and appropriate. Each surface derived re-entry eligibility independently, creating a risk of stale or non-actionable payment continuation being surfaced and of duplicate payment attempts being initiated from uncoordinated surfaces.

**Implementation scope:**

- `src/lib/domain/orders.ts` — `getStorefrontPaymentReentryView(...)` added as the shared persisted-truth-first re-entry eligibility derivation for all storefront re-entry surfaces.
- `src/hooks/useStorefrontPaymentReentry.ts` — shared guarded continuation hook introduced, consuming `getStorefrontPaymentReentryView(...)`. Performs a fresh persisted recheck before opening Mercado Pago. Bounded patch applied in second pass: `continuingOrderId` is now explicitly cleared on all non-success exits after the fresh persisted recheck, preventing the UI from being left stuck in a continuing/loading state when continuation is blocked.
- `src/hooks/useOrders.ts` — shared order data consumption path remained intact; no structural changes to the persisted-order read path.
- `src/services/orders.service.ts` — supporting order fetch used by the fresh recheck; no new service contract introduced.
- `src/pages/Orders.tsx` — now consumes the shared re-entry hook for authenticated payable-order continuation from the orders index.
- `src/pages/OrderDetail.tsx` — now consumes the shared re-entry hook for in-detail continuation CTA.
- `src/pages/Checkout.tsx` — re-entry eligibility surfaces aligned to shared derivation.
- `src/pages/PaymentSuccess.tsx` — re-entry suppressed; surface remains bounded post-purchase only.
- `src/pages/PaymentPending.tsx` — re-entry eligibility now driven by shared persisted truth, not route semantics.
- `src/pages/PaymentFailure.tsx` — re-entry eligibility now driven by shared persisted truth, not route semantics.
- `src/components/cart/CheckoutForm.tsx` — re-entry derivation aligned to shared hook.
- `src/components/cart/CartSidebar.tsx` — re-entry derivation aligned to shared hook.
- `src/components/cart/OpenRecoverableOrderNotice.tsx` — re-entry derivation aligned to shared hook.
- `supabase/functions/create-payment/index.ts` — session enforcement, ownership validation, and payable-state enforcement preserved within bounded storefront re-entry hardening scope. No payment architecture redesign.
- Relevant tests: `src/hooks/__tests__/useStorefrontPaymentReentry.test.tsx` — focused regression tests added covering fresh-recheck blocking, `continuingOrderId` clearing on both non-success exit paths, and successful re-entry path.

**What was hardened:**

1. Persisted-truth-first payment re-entry eligibility derivation via shared domain logic, replacing per-surface ad hoc derivation.
2. Shared guarded continuation path across all authenticated storefront re-entry surfaces, so continuation only opens Mercado Pago after a fresh persisted recheck confirms the order remains genuinely payable.
3. Stale or non-actionable re-entry suppression: surfaces that previously could show continuation for already-paid or non-payable orders are now gated by the same shared eligibility gate.
4. Duplicate payment-attempt hardening: the shared hook guards against concurrent continuation attempts for the same order ID via the `continuingOrderId` state guard.
5. **Bounded patch (second pass):** `continuingOrderId` is now cleared on both non-success exits after the fresh persisted recheck — when the fresh order is not found, and when the fresh persisted truth no longer permits re-entry. This closes the previously rejected stuck-UI defect.
6. Preservation of all accepted checkout/payment invariants: unchanged `submitCheckout` contract, unchanged `useCheckout` duplicate-checkout prevention lane, no guest persisted expansion, no paid inference from route semantics, paid-only cart clear preserved, paid-only confetti preserved, no order-management expansion, no payment architecture rewrite.

**Audit and validation history:**

- Initial cold acceptance audit: **REJECT** — `continuingOrderId` was set before the fresh persisted recheck, and certain non-success exits after the recheck returned without clearing it, leaving the UI stuck in a loading state (e.g., "Abriendo Mercado Pago...") even when continuation was blocked.
- Bounded patch applied: `continuingOrderId` clearing added to both non-success exit paths after the fresh persisted recheck.
- Re-verify: **ACCEPT** — relevant storefront suite `28/28` passed, focused hook tests passed, `typecheck` passed, `build` passed.

**Explicit non-claims:**

- No guest persisted payment or order flow introduced or claimed.
- No order-management platform expansion (no cancellations, returns, tracking, invoicing, or support-platform work).
- No shipping, tracking, returns, invoicing, or support-platform expansion.
- No payment architecture rewrite claimed.
- No live-browser proof claimed; validation was focused automated tests, typecheck, and build.
- No direct server-side branch proof beyond the accepted audit scope: `supabase/functions/create-payment/index.ts` was reviewed for boundary preservation, not independently E2E re-tested in this lane.
- No admin, Cesarin, or GraQle work performed or claimed.

**Outcome:** The Storefront Payment Re-Entry Consistency & Duplicate Payment Attempt Hardening lane is now formally closed as accepted. All authenticated storefront re-entry surfaces now share a single persisted-truth-first continuation gate, the stuck-UI defect from the initial cold audit is closed by the bounded patch, and all previously accepted payment and checkout invariants remain intact.

---

### Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification — 27 de marzo de 2026

**Why this lane was opened:**

Recent accepted storefront lanes had already hardened open-order recovery, payment re-entry, return-to-catalog truth, and post-payment resolution clarity, but major storefront purchase surfaces could still make their primary visible CTA decisions independently. That fragmentation left room for the same persisted storefront truth to surface different next-step families depending on whether the customer was on orders, order detail, payment-return pages, cart, or checkout. This lane closed that gap by making one canonical storefront purchase-journey family the material owner of the primary visible CTA branch across those audited surfaces.

**Implementation scope:**

- `src/lib/domain/orders.ts` — `StorefrontPurchaseJourneyActionFamily` and `getStorefrontPurchaseJourneyView(...)` now exist as the canonical composition-based storefront purchase-journey helper.
- `src/pages/Orders.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/OrderDetail.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentSuccess.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentPending.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/PaymentFailure.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/components/cart/CartSidebar.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/components/cart/CheckoutForm.tsx` — primary visible CTA branch now derives from the canonical helper output.
- `src/pages/Checkout.tsx` — canonical helper output now materially governs the top-level purchase-journey next-step branch.
- Relevant tests:
  - `src/lib/domain/__tests__/orders.test.ts`
  - `src/pages/__tests__/Orders.test.tsx`
  - `src/pages/__tests__/OrderDetail.test.tsx`
  - `src/pages/__tests__/PaymentSuccess.test.tsx`
  - `src/pages/__tests__/PaymentPending.test.tsx`
  - `src/pages/__tests__/PaymentFailure.test.tsx`
  - `src/pages/__tests__/Checkout.test.tsx`
  - `src/components/cart/__tests__/CartSidebar.test.tsx`
  - `src/components/cart/__tests__/CheckoutForm.test.tsx`

**What was hardened:**

1. One canonical storefront purchase-journey family contract now exists and is real: `CONTINUE_PAYMENT`, `WAIT_FOR_RESOLUTION`, `REVIEW_CURRENT_ORDER`, `RETURN_TO_CATALOG`, `START_NEW_PURCHASE`.
2. The canonical helper is composition-based, not a new business engine: it composes accepted persisted-truth storefront helpers rather than replacing their underlying meaning.
3. Real precedence is now explicit and shared across audited surfaces: `CONTINUE_PAYMENT` first, then `WAIT_FOR_RESOLUTION`, then `REVIEW_CURRENT_ORDER`, then `RETURN_TO_CATALOG`, then `START_NEW_PURCHASE`.
4. The helper now returns materially usable `actionFamily`, `actionTarget`, and `actionLabel` outputs for all five families, including non-continuation families.
5. Non-continuation family behavior is now helper-owned and actionable: `REVIEW_CURRENT_ORDER` and `WAIT_FOR_RESOLUTION` target the persisted order route; `RETURN_TO_CATALOG` and `START_NEW_PURCHASE` resolve to `/` in the helper; cart and checkout surfaces may truthfully reinterpret those latter families as new-purchase flow where appropriate for visible CTA behavior.
6. `data-storefront-action-family` is now sourced from the canonical helper across the audited storefront surfaces, and cross-surface convergence is materially real rather than classification-only tagging.
7. Previously accepted invariants remain preserved: storefront-only scope, no guest persisted order/payment flow, no guest reorder expansion, no advanced checkout, no shipping engine, no stock reservation, no order-management platform, unchanged `submitCheckout` contract, unchanged `useCheckout` contract path, persisted-truth ownership for `/orders/:orderId` and payment pages, paid-only cart clear, paid-only confetti, and bounded refresh/recheck behavior.

**Audit and validation history:**

- Cold acceptance gap identified: the canonical family helper existed, but it was not yet the authoritative owner of primary visible CTA behavior across all audited surfaces, non-continuation families were not yet materially helper-owned everywhere, and convergence coverage still under-proved review-family parity.
- Final acceptance patch applied locally on the accepted worktree: primary visible CTA ownership moved onto the canonical helper across the audited surfaces, non-continuation family targets became materially actionable from the helper, forbidden doc/canon worktree drift was removed before acceptance, and focused convergence coverage was added.
- Focused local validation passed: `9/9` files, `102/102` tests, and local `typecheck` passed.

**Explicit non-claims:**

- No guest persisted payment or order flow introduced or claimed.
- No guest reorder expansion introduced or claimed.
- No advanced checkout, shipping, stock reservation, or order-management platform expansion introduced or claimed.
- No payment rewrite or broader commerce platform redesign claimed.
- No live-browser proof claimed; validation was focused local automated coverage plus `typecheck`.
- No admin, Cesarin, or GraQle work performed or claimed.
- No safely attributable commit ID is recorded for this accepted lane; canon reflects accepted local-worktree reality rather than a specific commit SHA.

**Outcome:** The Storefront Purchase Journey Orchestration & Cross-Surface CTA Unification lane is now formally closed as accepted. Canonical purchase-journey family ownership of the primary visible CTA branch is now real across the audited storefront purchase surfaces, remains bounded to storefront-only composition over accepted persisted-truth helpers, and does not represent a broader commerce platform expansion.

---

### Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Raw decision evidence already existed in persisted logic-debug fields and runtime telemetry, but Cesarin operators still had to reconstruct the causal story manually across fragmented admin surfaces. The gap was operator trust and explainability, not storefront behavior, not routing redesign, and not missing backend infrastructure. The accepted fix was to align and expose existing truth so the operator could answer “why did Cesarin do this?” from one coherent reading surface.

**Implementation scope:**

- `src/services/admin/admin-decision-trace.service.ts` — canonical admin decision-trace read model over already-persisted runtime/simulation evidence.
- `src/services/admin/admin-pilot-ops.service.ts` — pilot rows now carry the canonical trace read model instead of forcing local UI reconstruction.
- `src/components/admin/cesarin/CesarinDecisionTracePanel.tsx` — shared causal panel for operator explainability.
- `src/components/admin/cesarin/ReviewDrawer.tsx` — now materially renders the shared causal panel.
- `src/components/admin/cesarin/PilotTelemetry.tsx` — now materially exposes canonical trust labeling in the operator review entry path.
- `src/pages/admin/AdminCesarinOS.tsx` — simulator-triggered review now reconstructs/preserves persisted trace context before opening review.
- `src/components/admin/cesarin/TabQuality.tsx` — reuses the same trace model and labels simulation honestly in QA detail.
- Relevant tests:
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`

**What materially changed:**

1. One canonical admin decision-trace read model now exists and is real. It aligns already-persisted evidence into one coherent causal story covering analyst intent, final routed intent, routing path, capsule vs non-capsule execution, guardrail overrides, injected tools, execution status, degraded/fallback reason, retrieval source/match strategy where applicable, and response text.
2. One shared causal panel now exists and is materially reused across the operator reading flow instead of leaving each surface to reconstruct trust context independently.
3. Trust labeling is now explicit and honest at the read-model level: evidence is labeled as `authoritative_runtime`, `partial_runtime`, or `simulated` rather than being implied or flattened.
4. `ReviewDrawer` now materially uses the canonical trace model as the operator-facing explanation surface.
5. `PilotTelemetry` now materially exposes canonical trust labeling from that same model in the review entry path.
6. Simulator-triggered review now preserves/reconstructs persisted trace context instead of reopening a stripped response row with missing causal explanation.
7. `TabQuality` now reuses the same trace model and labels simulation honestly instead of drifting onto a separate implicit trust model.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
- Focused result: `2` files, `4` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No routing redesign, guardrail architecture rewrite, capsule architecture rewrite, analytics-platform rewrite, or broad observability-platform rewrite was introduced or claimed.
- No new runtime truth was invented; the read model aligns existing persisted/runtime evidence only.
- No GraQle work was performed or claimed.
- No live operator walkthrough or live-browser proof is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to narrow focused test depth and historical rows that can only surface `partial_runtime` when persistence is incomplete.
- Simulator review truth is materially improved, but when direct persisted linkage is absent the fallback path remains weaker than explicit interaction-ID resolution.

**Outcome:**

The Cesarin OS Decision Traceability, Guardrail Explainability & Operator Trust Hardening lane is now formally closed as accepted. Cesarin operator review surfaces now share one coherent, truthful decision-trace read model with explicit trust labeling, simulator-triggered review no longer drops back to a stripped causal context, and the lane remains bounded to admin/operator explainability rather than broader AI architecture or analytics expansion. Commit: `430247e`.

---

### Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Simulation, QA, review, intervention, and improvement tooling already existed in parts, but the operator loop from finding to improvement closure still drifted across disconnected admin surfaces. Evidence and lifecycle state were not surfaced as one coherent actionable workflow, making it hard to answer whether a simulation finding had actually become a tracked, validated improvement. The gap was admin/Cesarin operator workflow closure, not storefront behavior, not analytics-platform redesign, and not a missing project-management platform.

**Implementation scope:**

- `src/services/admin/admin-improvement-workflow.service.ts` — canonical admin workflow read model for simulation/review/intervention/improvement lifecycle truth over existing persisted entities and services.
- `src/services/admin/admin-improvement.service.ts` — targeted hydration by `analytics_id` for improvement workflow lookup without loading unrelated queue state.
- `src/services/admin/admin-case-drafts.service.ts` — targeted hydration by source refs / interaction IDs so review and QA surfaces can expose persisted draft evidence coherently.
- `src/components/admin/cesarin/CesarinImprovementWorkflowPanel.tsx` — shared lifecycle/evidence panel for operator workflow reading.
- `src/components/admin/cesarin/ReviewDrawer.tsx` — now materially renders the shared workflow truth inside the review flow.
- `src/components/admin/cesarin/TabQuality.tsx` — now materially shares the same workflow truth in QA detail.
- `src/components/admin/cesarin/TabInterventions.tsx` — now materially shares the same workflow truth in intervention/recommendation detail.
- `src/components/admin/cesarin/TabImprovements.tsx` — now materially shares the same workflow truth in improvement-item detail.
- `src/components/admin/cesarin/PilotTelemetry.tsx` — now materially surfaces workflow status in the telemetry/review entry path.
- Relevant tests:
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabInterventions.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabImprovements.test.tsx`

**What materially changed:**

1. One canonical admin workflow read model now exists and is real for simulation/review/intervention/improvement lifecycle truth.
2. One shared lifecycle/evidence panel now exists and is materially reused across the operator workflow instead of leaving each surface to interpret status and evidence independently.
3. Lifecycle truth is now exposed honestly across `detected`, `triaged`, `approved`, `rejected`, `implemented`, `validated`, and `closed`.
4. Evidence truth is now exposed honestly across `authoritative`, `partial`, `simulated`, and `missing`.
5. `ReviewDrawer`, `TabQuality`, `TabInterventions`, `TabImprovements`, and `PilotTelemetry` now materially share the same workflow truth instead of drifting across fragmented handoffs.
6. Targeted hydration by analytics/source refs is real and bounded; the lane reuses existing persisted entities and services rather than inventing new workflow infrastructure.
7. Missing direct linkage between `intervention_recommendations` and `cesarin_improvement_items` remains explicit as partial/missing evidence rather than being fabricated into a false closure chain.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabInterventions.test.tsx`
  - `src/components/admin/cesarin/__tests__/TabImprovements.test.tsx`
- Focused result: `4` files, `7` tests passed.
- `npm run typecheck` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No analytics-platform rewrite, fake PM/ticketing platform, or broader architecture redesign was introduced or claimed.
- No invented signals or invented lifecycle links were introduced or claimed.
- No fabricated direct FK/linkage was introduced between `intervention_recommendations` and `cesarin_improvement_items`.
- No GraQle work was performed or claimed.
- No live operator walkthrough or live-browser proof is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to selective test depth and a thinner `PilotTelemetry` presentation than the deeper review/intervention/improvement surfaces.
- Historical rows with incomplete persisted linkage or evidence still surface as partial/missing by design rather than being over-resolved.

**Outcome:**

The Cesarin OS Simulation-to-Improvement Closure & Evidence Workflow Hardening lane is now formally closed as accepted. Cesarin operators can now read one coherent workflow/evidence story from finding through intervention/improvement lifecycle state, missing direct linkage remains explicit instead of fabricated, and the lane remains bounded to admin/operator workflow hardening rather than storefront or platform expansion. Commit: `5bbb2b3`.

---

### Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening — 27 de marzo de 2026

**Why this lane was opened:**

Cesarin already had simulation, review, traceability, and improvement tooling in parts, but the simulator itself still behaved more like a one-shot prompt sandbox than a materially useful operator conversation lab. Operators could not yet rely on one coherent place to talk to Cesarin across multiple turns, inspect what happened on a selected turn, and hand that finding into the existing review/improvement flow without reconstructing context manually. The gap was admin/Cesarin simulation usability and continuity, not storefront behavior, not architecture redesign, and not a missing multichannel/chat platform.

**Implementation scope:**

- `src/types/cesarin.ts` — structured simulation turn/session types now exist for persisted conversation-lab session truth.
- `src/services/admin/admin-simulation-lab.service.ts` — canonical admin simulation-lab read model over persisted session truth, legacy-session fallback reconstruction, selected-turn trace hydration, and selected-turn workflow hydration.
- `src/pages/admin/AdminCesarinOS.tsx` — simulator runtime now persists structured turn records and session metadata for simulated conversations and opens review from the selected persisted turn.
- `src/components/admin/cesarin/TabSimulator.tsx` — now materially renders the conversation lab UX over the canonical read model.
- Relevant tests:
  - `src/services/admin/__tests__/admin-simulation-lab.service.test.ts`
  - `src/components/admin/cesarin/__tests__/TabSimulator.test.tsx`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`

**What materially changed:**

1. One canonical admin simulation-lab read model now exists and is real. It derives conversation-lab truth from persisted simulation session data instead of leaving transcript/session meaning fragmented across page-local state.
2. Simulator now supports materially useful multi-turn conversation flow: send message, receive real Cesarin response, preserve bounded conversation state inside the current persisted simulation session, display the transcript clearly, and start a clean new simulation session.
3. `AdminCesarinOS.tsx` now persists structured simulated turn records and session metadata rather than relying only on raw history plus last-turn debug.
4. `TabSimulator.tsx` now materially renders a multi-turn transcript, selected-turn inspector, lifecycle state, honest error/runtime labeling, and per-turn review handoff.
5. The selected simulated turn now hydrates existing decision-trace and improvement-workflow evidence instead of forcing the operator to leave the lab and reconstruct context from disconnected surfaces.
6. The simulator remains integrated with the existing review, traceability, and improvement systems instead of becoming a second assistant product or a separate chat platform.
7. Session continuity remains explicitly bounded to persisted simulation-session truth and the accepted runtime context window only; the lane does not invent cross-session memory.
8. Legacy sessions that do not yet have structured persisted turn records now fall back to truthful reconstruction from `history`, so older sessions remain inspectable without fabricating continuity they never stored.

**Focused validation truth:**

- Focused tests passed:
  - `src/services/admin/__tests__/admin-simulation-lab.service.test.ts`
  - `src/components/admin/cesarin/__tests__/TabSimulator.test.tsx`
  - `src/components/admin/cesarin/__tests__/ReviewDrawer.test.tsx`
  - `src/services/admin/__tests__/admin-decision-trace.service.test.ts`
  - `src/services/admin/__tests__/admin-improvement-workflow.service.test.ts`
- Focused result: `5` files, `11` tests passed.
- `npm run typecheck` passed.

**Boundedness / explicit non-claims:**

- This lane remained admin / Cesarin OS only.
- No storefront files or storefront behavior were changed or claimed.
- No architecture rewrite, new channel platform, fake multichannel/chat platform, or fake multi-agent system was introduced or claimed.
- No invented cross-session memory was introduced or claimed.
- No production-equivalence claim beyond accepted simulator scope was introduced or claimed.
- No GraQle work was performed or claimed.
- No live browser/operator walkthrough is claimed in this log.

**Residual risk (bounded):**

- Residual risk is limited to missing dedicated end-to-end handler tests around the simulator runtime/controller path and thinner legacy-session evidence when older sessions require fallback reconstruction from `history`.
- Those residuals do not invalidate the lane; they only bound the remaining acceptance surface.

**Outcome:**

The Cesarin OS Interactive Simulation Runtime & Conversation Lab Hardening lane is now formally closed as accepted. Cesarin operators can now run materially useful bounded multi-turn simulated conversations, inspect selected-turn trace/workflow evidence from the same lab, and hand findings into the existing review/improvement flow without fragmenting context. Commit: `05e5a0d`.

---

### Césarín Stage 1 — Voz Humana, Approximate Recovery & Escalación Honesta — 27 de marzo de 2026

**Why this lane was opened:**

Storefront Césarín had become commercially useful in places, but he still risked sounding too rigid, over-structured, and mechanically certain when product search got fuzzy. Uncertain turns could still collapse into robotic fallback or be pressured into fake product certainty, and the storefront lacked a bounded collaborative recovery loop that kept the character alive while staying honest. This lane closed that Stage 1 gap by making Césarín more human, more honest inside the fantasy, and more recoverable without expanding beyond storefront behavior.

**Implementation scope:**

- `src/lib/cesarin-stage1.ts` — bounded Stage 1 helper layer for humanized uncertainty, approximate recovery prompting, honest escalation, and the corrective cart-operator visible voice mapping.
- `src/hooks/useAIConcierge.ts` — active recovery state, visible refinement loop wiring, honest WhatsApp escalation path, and Stage 1-aligned cart-operator visible copy.
- `src/components/ui/ai/AIConcierge.tsx` — visible `Esta se parece más` / `Ninguna` refinement controls and collaborative recovery UX.
- `src/services/concierge.service.ts` — humanized storefront search-message wrapping over existing product-search truth.
- `supabase/functions/customer-intelligence/persona.ts` — shorter, more oral, more honest storefront Césarín voice rules.
- `supabase/functions/customer-intelligence/index.ts` — corrected weak-intent rescue and removal of unconditional `UNKNOWN -> PRODUCT_SEARCH` terminal recovery; honest WhatsApp action preservation remained bounded to real existing paths.
- Relevant tests:
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`
  - `src/lib/__tests__/customer-intelligence-guardrails.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit: `a46dadb` — `feat(storefront-cesarin): harden human recovery and honest escalation`
- Cold audit verdict after the initial implementation: `ACCEPT WITH CORRECTIVE MICRO-PASS`
- Corrective micro-pass commit: `bf28d23` — `fix(storefront-cesarin): remove forced certainty tail`
- Short re-verify verdict after the micro-pass: `ACCEPT`

**What materially changed:**

1. Storefront Césarín now speaks with a more human, shorter, more oral Stage 1 storefront voice instead of defaulting to rigid/corporate fallback under uncertainty.
2. Humanized uncertainty is now real: Césarín can admit he does not fully recognize a product or query without collapsing into dead-end robotic copy or fake certainty.
3. Approximate recovery is now collaborative and visible inside the storefront chat surface: nearby products can be shown as approximate, the customer can say `Esta se parece más` or `Ninguna`, and the next turn uses that real signal.
4. Honest escalation is now real and bounded: when recovery is clearly failing, the storefront exits toward the existing WhatsApp path instead of promising a fake human callback.
5. The corrective micro-pass removed the last unconditional `UNKNOWN -> PRODUCT_SEARCH` forced recovery tail in the storefront runtime, so unresolved turns can now remain honestly unresolved unless real storefront signals justify rescue.
6. Weak-intent rescue still remains useful and bounded: real product, inventory, policy, or greeting signals still rescue weak turns where the storefront can help truthfully.
7. Visible `cart_operator` copy now follows the Stage 1 voice discipline instead of older fixed robotic rewrites, without changing real cart action semantics.

**Focused validation truth:**

- Initial Stage 1 focused validation passed: `3/3` files, `9/9` tests, `typecheck`, and `build`.
- Corrective micro-pass focused validation passed: `2/2` files, `4/4` tests, `typecheck`, and `build`.
- Final short re-verify verdict after the corrective micro-pass: `ACCEPT`.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No deep memory per customer was introduced or claimed.
- No autonomous learning was introduced or claimed.
- No admin/Cesarin OS tooling expansion was introduced or claimed.
- No giant architecture redesign, no broad retrieval redesign, and no new agent/memory platform were introduced or claimed.
- No fake human-handoff capability was introduced; escalation remains bounded to the real existing WhatsApp path.
- No checkout redesign, auth redesign, analytics overhaul, or broader storefront UI redesign was introduced or claimed.
- No Stage 2 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 1 is now formally closed as accepted. The storefront assistant is materially more human and less robotic, uncertainty no longer collapses into dead robotic fallback or terminal fake product certainty, approximate recovery is collaboratively usable, and honest escalation now protects the customer from wasted turns without inventing support capabilities that do not exist.

---

### Césarín Stage 2 — Gustos, Memoria Ligera y Continuidad Personal — 28 de marzo de 2026

**Why this lane was opened:**

Stage 1 had already made storefront Césarín more human and more honest under uncertainty, but returning authenticated customers still felt mostly stateless. Recommendations could improve within a turn, yet Césarín still lacked a bounded, commercially useful way to remember taste signals across sessions and sharpen later recommendation quality without becoming creepy, invasive, or overconfident. This lane closed that Stage 2 gap by adding lightweight preference continuity while keeping memory small, honest, and storefront-only.

**Implementation scope:**

- `supabase/functions/customer-intelligence/memory.ts` — lightweight authenticated taste-memory model, bounded preference categories, conservative evidence tiers, compact summary building, and the corrective recency/honesty fix for `interests_metadata`.
- `supabase/functions/customer-intelligence/index.ts` — authenticated read path for compact preference memory, compact prompt-summary injection into Analyst/Sommelier, and truthful persistence before storefront capsule early returns.
- `supabase/functions/customer-intelligence/persona.ts` — humble/non-creepy memory-use rules where current turn overrides prior memory.
- `supabase/migrations/20260327_cesarin_stage2_taste_memory.sql` — minimal schema support for `interests_metadata`, `preference_signals`, and `preference_summary` on `ai_customer_memory`.
- Relevant tests:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `b1246d3ab5e63185dac6c343b4c8300afd74ea7c`
  - `feat(storefront-cesarin): add lightweight taste memory`
- Cold audit verdict after the initial implementation:
  - `ACCEPT WITH CORRECTIVE MICRO-PASS`
- Corrective micro-pass commit:
  - `159096db9fdc357b13c41be24a76d4ab5188ae97`
  - `fix(storefront-cesarin): keep interest recency honest`
- Short re-verify verdict after the micro-pass:
  - `ACCEPT`

**What materially changed:**

1. Storefront Césarín now has lightweight authenticated taste memory that can sharpen later recommendations for returning customers without pretending deep memory.
2. Preference memory is explicitly bounded to commercially useful storefront categories only: `flavor`, `budget`, `format`, `brand`, `intensity`, and `experience`.
3. Evidence tiers are explicitly bounded and conservative: `inferred`, `explicit`, `confirmed`, and `rejected`.
4. Runtime prompt injection is now compact and preference-summary based, not a raw-history dump.
5. Memory use is explicitly humble and bounded: prior memory is only a useful bias, and the current turn always overrides what was stored before.
6. Guest users still do not receive fake durable continuity; persistent cross-session memory remains authenticated-only.
7. The corrective micro-pass fixed `interests_metadata` honesty so historical interests no longer gain fake `hits` or fresh `last_at` just because they survived merge. Interest reinforcement now only happens when that interest was actually re-observed in the current turn.

**Focused validation truth:**

- Initial Stage 2 focused validation passed:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
  - `src/lib/__tests__/cesarin-stage1.test.ts`
  - `src/hooks/__tests__/useAIConcierge.test.tsx`
- Initial focused result: `3` files, `13` tests passed.
- Corrective micro-pass focused validation passed:
  - `src/lib/__tests__/customer-intelligence-memory.test.ts`
- Corrective focused result: `1` file, `6` tests passed.
- `npm run typecheck` passed for both the initial implementation and the corrective micro-pass.
- `npm run build` passed for both the initial implementation and the corrective micro-pass.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant CRM was introduced or claimed.
- No deep transcript memory was introduced or claimed.
- No autonomous learning platform was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No creepy personalization was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No fake persistence for guests was introduced or claimed.
- No Stage 3 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 2 is now formally closed as accepted. Authenticated returning customers can now receive materially sharper storefront recommendations through lightweight, conservative taste memory; current-turn intent still overrides stored memory; guests still do not appear durably remembered; and the corrective micro-pass closed the last honesty issue so historical interests no longer gain fake reinforcement from merge survival alone.

---

### Césarín Stage 3 — Colmillo Comercial con Memoria — 28 de marzo de 2026

**Why this lane was opened:**

Stage 2 had already given storefront Césarín lightweight authenticated taste memory, but that memory still behaved mostly like passive continuity. Returning customers could be remembered in a bounded, honest way, yet recommendation order, narrowing strategy, and approximate recovery quality still did not materially capitalize on remembered likes, dislikes, rejections, or budget posture. This lane closed that Stage 3 gap by converting existing taste memory into real storefront commercial judgment without opening a new platform, CRM, or ranking engine.

**Implementation scope:**

- `supabase/functions/customer-intelligence/commercial-memory.ts` — bounded commercial-guidance helper built over existing preference summary.
- `supabase/functions/customer-intelligence/index.ts` — edge/runtime prompt injection of memory-aware commercial guidance plus compact `memory_context.preference_summary` handoff for pre-routed product search.
- `src/lib/cesarin-stage3.ts` — deterministic storefront reranking over existing product suggestions using compact taste memory and current-turn override rules.
- `src/services/concierge.service.ts` — product-search result reranking before telemetry, rendering, and the existing approximate recovery loop.
- Relevant focused tests:
  - `src/lib/__tests__/customer-intelligence-commercial-guidance.test.ts`
  - `src/lib/__tests__/cesarin-stage3.test.ts`
  - `src/services/__tests__/concierge.service.stage3.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `0d964134752dcd274bef0651d082a89795c83271`
  - `feat(storefront-cesarin): add commercial judgment from taste memory`
- Cold audit verdict after implementation:
  - `ACCEPT`

**What materially changed:**

1. Existing lightweight taste memory now influences real storefront commercial judgment instead of sitting only as passive prompt context.
2. Edge/runtime guidance now explicitly tells Analyst/Sommelier to use remembered likes, dislikes, rejections, and budget posture to narrow more efficiently, avoid repeated dead ends, and keep current-turn intent above memory when the two conflict.
3. Storefront product-search results are now reranked deterministically for authenticated returning customers using the existing compact taste-memory summary.
4. Relevant liked profiles can move stronger options upward in the shown result order.
5. Rejected or disliked paths can move stale bad suggestions downward instead of being resurfaced repeatedly.
6. Budget posture now influences ordering conservatively when the current turn does not already set price direction.
7. Approximate recovery quality also improves because reranking happens before the existing `Esta se parece más` / `Ninguna` loop chooses the top suggestions to show.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/customer-intelligence-commercial-guidance.test.ts`
  - `src/lib/__tests__/cesarin-stage3.test.ts`
  - `src/services/__tests__/concierge.service.stage3.test.ts`
- Focused result: `3` files, `8` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant ranking engine was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No autonomous learning platform was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No broad deep-commercial-intelligence platform was introduced or claimed beyond bounded prompt guidance plus deterministic storefront reranking.
- No Stage 4 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 3 is now formally closed as accepted. Returning authenticated customers can now receive materially sharper, more fitted storefront recommendation order because existing taste memory is used as bounded commercial judgment; current-turn intent still overrides prior memory when it conflicts; approximate recovery inherits better top suggestions; and the result remains non-creepy, non-pushy, and storefront-only.

---

### Césarín Stage 4 — Conversación Comercial Adaptativa — 28 de marzo de 2026

**Why this lane was opened:**

Stage 3 had already turned lightweight taste memory into bounded commercial judgment, but storefront Césarín could still sound too flat in timing. Strong-signal users, compare users, hesitant users, and broad exploratory users were still at risk of being funneled through one similar seller cadence. This lane closed that Stage 4 gap by making the main commercial/product-search flow adapt its next move more intelligently without opening a giant behavioral engine, CRM, or admin lane.

**Implementation scope:**

- `supabase/functions/customer-intelligence/conversation-modes.ts` — canonical bounded conversation-mode resolver and runtime guidance builder for `DIRECT_RECOMMEND`, `GUIDED_COMPARE`, `SOFT_REASSURE`, `EXPLORE_LIGHT`, and `READY_TO_CLOSE`.
- `supabase/functions/customer-intelligence/index.ts` — edge/runtime injection of adaptive conversation guidance into Analyst and Sommelier prompts plus `conversation_mode_hint` handoff on pre-routed storefront product search.
- `src/lib/cesarin-stage4.ts` — storefront-side adaptive shaping over visible option count and next-step message flow, using query posture, history, memory strength, and match strength while keeping current-turn override.
- `src/services/concierge.service.ts` — Stage 3 reranking remains first; Stage 4 now adapts final visible suggestions and response shape before the existing recovery loop sees them.
- Relevant focused tests:
  - `src/lib/__tests__/customer-intelligence-conversation-modes.test.ts`
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `5d48c46f124b0ce9323f1c9d102e459b8c6e0e66`
  - `feat(storefront-cesarin): add adaptive commercial conversation`
- Cold audit verdict after implementation:
  - `ACCEPT`
- No corrective micro-pass was required.

**What materially changed:**

1. Storefront Césarín now has a bounded conversation-mode layer instead of one flat commercial cadence.
2. Strong-signal turns can now resolve into shorter cleaner recommendation paths.
3. Compare turns now stay narrowed and grounded instead of drifting toward list dumping.
4. Hesitation now gets reassurance without hard-resetting the conversation.
5. Broad weak-memory turns remain exploratory instead of being overclosed.
6. Ready-to-close turns can simplify the next move when real support exists.
7. Current-turn posture still overrides stale assumptions, and approximate recovery benefits because visible suggestions are already adapted before entering the existing `Esta se parece más` / `Ninguna` loop.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/customer-intelligence-conversation-modes.test.ts`
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
- Focused result: `3` files, `7` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No giant behavioral-intelligence engine was introduced or claimed.
- No deep conversation-planning system was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No claim that all Césarín behavior is now mode-driven; this remains bounded primarily to the main commercial/product-search lane.
- No Stage 5 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 4 is now formally closed as accepted. The storefront assistant can now adapt his commercial timing more intelligently across strong-signal, compare, hesitation, exploratory, and ready-to-close turns while preserving Stage 1, Stage 2, and Stage 3 honesty/memory safeguards and staying bounded to the storefront commercial lane.

---

### Césarín Stage 5 — Conversión Asistida y Cierre Accionable — 28 de marzo de 2026

**Why this lane was opened:**

Stage 4 had already made storefront Césarín more adaptive in timing, but the assistant could still leave too many good recommendation branches on a generic handoff. Strong-fit paths, compare paths, selector-sensitive paths, and exploratory paths still lacked one bounded layer that decides the next best storefront action more concretely without faking checkout-readiness, pressure, or hidden workflow support. This lane closed that Stage 5 gap by making Césarín choose a more truthful actionable next step after recommendation while staying grounded in existing storefront surfaces only.

**Implementation scope:**

- `src/lib/cesarin-stage5.ts` — canonical next-step resolver over bounded action families `REVIEW_ONE`, `COMPARE_TWO`, `ADD_READY`, `SELECTOR_NEEDED`, and `KEEP_EXPLORING`.
- `src/services/concierge.service.ts` — Stage 5 execution after Stage 3 reranking and Stage 4 shaping, including real product hydration before next-step resolution and `next_step_view` attachment to the capsule contract.
- `src/components/ui/ai/AIConcierge.tsx` — real `Siguiente paso` UI block rendering storefront-backed actions from `next_step_view`.
- Relevant focused tests:
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `9b015eb`
  - `feat(storefront-cesarin): add actionable conversion flow`
- Cold audit verdict after implementation:
  - `ACCEPT`
- No corrective micro-pass was required.

**What materially changed:**

1. Storefront Césarín now resolves a bounded next actionable storefront step after recommendation instead of leaving every good branch on one generic close.
2. Stage 5 now runs after Stage 3 reranking and Stage 4 conversation/posture shaping.
3. The storefront now hydrates real product data before deciding the next actionable step.
4. The capsule contract now carries `next_step_view` as the bounded next-step handoff.
5. The chat UI now renders a real `Siguiente paso` block with actual storefront actions instead of only narrative copy.
6. `OPEN_PDP` and `ADD_TO_CART` stay grounded in existing storefront flows only; no new checkout or hidden human workflow is implied.
7. Selector-needed behavior now stays narrowly tied to real product/variant evidence instead of reopening the whole conversation.
8. Compare and exploration remain honest when a stronger close is not justified.
9. Current-turn intent can still block stale memory/posture from forcing action confidence.

**Focused validation truth:**

- Focused validation passed:
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`
  - `src/components/ui/ai/__tests__/AIConcierge.test.tsx`
- Focused result: `3` files, `9` tests passed.
- `npm run typecheck` passed.
- `npm run build` passed.

**Boundedness / explicit non-claims:**

- This lane remained storefront Césarín only.
- No checkout/platform redesign was introduced or claimed.
- No hidden human workflow was introduced or claimed.
- No giant conversion engine was introduced or claimed.
- No admin/Cesarin OS expansion was introduced or claimed.
- No CRM expansion was introduced or claimed.
- No fake guest persistence was introduced or claimed.
- No giant architecture redesign was introduced or claimed.
- No deep autonomous conversion-intelligence platform was introduced or claimed beyond bounded storefront next-step shaping.
- No Stage 6 behavior was implemented or claimed here.

**Outcome:**

Césarín Stage 5 is now formally closed as accepted. The storefront assistant can now move more cleanly from recommendation into the next truthful storefront action: one-product review when one fit is strongest, two-option compare when compare is still honest, one missing selector when only that material choice remains, cart-adjacent action only when support is real, and continued exploration when the branch is still too broad to close.

---

### Césarín Storefront — Decision Flow Naturalization Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted storefront visibility, outcome, and trust passes, Césarín could already express help posture more clearly, but the visible decision flow still felt somewhat mechanical in specific transitions. Explore / compare / review / advance were more truthful than before, yet storefront shaping still carried residual forcing that could drift away from upstream turn truth, especially once `turnAnalysis` started flowing into the storefront path. This lane was opened to make that decision flow feel more natural without reopening catalog policy, anti-bloat, or core architecture.

**Implementation scope:**

- `src/lib/cesarin-stage4.ts` — storefront posture shaping aligned more directly with upstream `turnAnalysis`.
- `src/lib/cesarin-stage5.ts` — storefront family/outcome resolution cleanup plus the later weak-support humility correction.
- `src/services/concierge.service.ts` — removal of the old storefront-side forced exploration fallback via `modeHint`.
- Focused tests:
  - `src/lib/__tests__/cesarin-stage4.test.ts`
  - `src/lib/__tests__/cesarin-stage5.test.ts`
  - `src/services/__tests__/concierge.service.stage4.test.ts`

**Acceptance sequence truth:**

- Initial implementation commit:
  - `b28b79f0190cf6146d890fbc11584f336402196c`
  - `refactor(cesarin): naturalize decision flow — propagate turn_analysis to storefront stages`
- Corrective micro-pass:
  - `d81ea2bae78ea82264750c6efcb7991fe0f34ece`
  - `fix cesarin weak support humility regression`
- Accepted final audit status:
  - `ACCEPT`

**What materially changed:**

1. `turnAnalysis` now materially informs storefront stage shaping.
2. Stage 4 follows upstream model posture more directly, especially around clarify-first handling and other current-turn posture signals.
3. The old forced storefront `EXPLORE_LIGHT` fallback through `modeHint` is gone from the live service path.
4. Regex/helper duplication between Stage 4 and Stage 5 was materially reduced instead of being expanded.
5. `isStrictExplorationQuery(...)` now narrows older exploration forcing rather than letting it spread broadly.
6. Decision-flow transitions now feel more natural because storefront stages preserve upstream posture more faithfully.
7. The accepted weak-support / approximate single-candidate regression is now closed: when upstream posture remains `GUIDED_COMPARE`, the humble storefront outcome remains `KEEP_EXPLORING` instead of collapsing prematurely into `REVIEW_ONE`.

**Focused validation truth:**

- The initial wave shipped with focused storefront validation and was later cold-audited.
- The corrective micro-pass then revalidated the exact weak-support regression path in focused form.
- Accepted micro-pass results:
  - `2` files, `17` tests passed
  - `npm run typecheck` passed
  - `npm run build` passed

**Accepted final discipline / explicit non-claims:**

- This was a bounded storefront naturalization lane only.
- No catalog-gate reopening was introduced or claimed.
- No anti-bloat rollback was introduced or claimed.
- No recovery/action button redesign was introduced or claimed.
- No planner/orchestrator layer was introduced or claimed.
- No admin / Cesarin OS drift was introduced or claimed.
- No storefront redesign from zero was introduced or claimed.
- No claim is made that Stage 5 is now fully non-heuristic or fully model-pure.

**Residual bounded risk:**

- Stage 5 remains partially heuristic, so future posture modes or support patterns still require focused regression coverage when they materially affect family/outcome resolution.

**Outcome:**

The accepted storefront baseline now follows upstream posture more naturally. `turnAnalysis` materially reaches the storefront stages, the old forced exploration fallback is gone, helper duplication is reduced, and the weak-support humility regression was closed without undoing the model-first gain in posture wiring.

---

### Césarín Assistant Runtime — Technical Cleanup & Coherence Wave — 30 de marzo de 2026

**Why this lane was opened:**

After multiple accepted storefront and runtime waves, the Césarín assistant runtime was already materially stronger, but it still carried technical residue that made the live path harder to reason about than necessary. Stage 4 still exposed a dead `modeHint` contract even though the accepted storefront baseline no longer depended on it, and fallback turn-decision reconstruction could still leak legacy `conversation_mode_hint` semantics instead of staying canonical. This lane was opened to improve runtime coherence and boundary cleanliness without reopening product behavior lanes, storefront UI work, or architecture rewrites.

**Exact scoped files:**

- `src/lib/cesarin-stage4.ts`
- `src/services/concierge.service.ts`
- `src/hooks/useAIConcierge.ts`
- `src/lib/__tests__/cesarin-stage4.test.ts`
- `src/services/__tests__/concierge.service.stage4.test.ts`
- `src/hooks/__tests__/useAIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Inspected the real runtime/storefront fallback path instead of assuming that legacy contract cleanup still needed broad architectural work.
2. Confirmed that `modeHint` was already dead in the accepted runtime baseline and removed that dead Stage 4 contract instead of preserving it for conceptual symmetry.
3. Canonicalized fallback `current_turn_decision` through a shared resolver so service-side and hook-side fallback posture no longer drift on legacy hint strings.
4. Removed legacy `conversation_mode_hint` contamination from fallback turn-decision reconstruction without reopening storefront behavior lanes.
5. Added only the focused regression coverage needed to prove the canonical fallback path and preserve the accepted pilot baseline.

**Accepted final discipline:**

This was a bounded runtime-coherence cleanup only. It did not reopen catalog gate policy, commercial outcome logic, trust signaling, storefront UI, or any planner/orchestrator lane. The accepted implementation simplified a dead contract and cleaned fallback truth boundaries without inflating scope into a full runtime rewrite.

**Accepted commit:**

- `0628133a2552c946477e8e0f8f0d0048121e4497`
- `refactor cesarin runtime coherence cleanup`

**Accepted runtime truth after implementation:**

- Dead `modeHint` contract is removed from Stage 4.
- Fallback `current_turn_decision` is now canonicalized through a shared resolver.
- Service fallback no longer leaks legacy `conversation_mode_hint`.
- Hook and service are materially aligned on fallback `current_turn_decision`.
- Stage 4 boundary is now cleaner between upstream model / upstream turn-analysis truth and technical fallback when that signal is missing.

**Explicit non-claims:**

- This is not a full runtime rewrite.
- This does not claim that all fallback logic is now fully centralized.
- This does not introduce a new planner/orchestrator.
- This does not add new commercial rails.
- This does not redesign storefront UI.
- This does not reopen prior accepted waves as separate projects.

**Residual non-blocking risk:**

Some duplication still exists for `primary_intent` fallback between service and hook, and this wave did not attempt to fully centralize every fallback field. That remaining residue is bounded and non-blocking under the accepted pilot baseline.

---

### Césarín Storefront — Recovery & Friction Handling Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted visibility, outcome, trust, and naturalization passes, the storefront decision flow was materially better, but one visible friction point remained inside weak `REVIEW_ONE`. Users could reach a prudent review-first state without a clean low-pressure reentry path back into the normal conversation loop, leaving the storefront with unnecessary hesitation cost even when product pressure should stay low. This lane was opened to reduce that friction inside the existing next-step surface without creating a new route, executor path, or recovery engine.

**Exact scoped files:**

- `src/lib/cesarin-stage5.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/lib/__tests__/cesarin-stage5.test.ts`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Inspected the real weak `REVIEW_ONE` path and confirmed that the visible friction was a reentry gap rather than a Stage 4/runtime/planner problem.
2. Added a bounded `assistAction` only for weak `REVIEW_ONE` inside Stage 5 rather than opening a new decision path.
3. Reused the existing gated next-step surface so the storefront could expose a subtle reentry affordance without changing service shaping or hook/runtime flow.
4. Kept the user inside the normal conversation loop through ordinary `sendMessage(...)` instead of introducing a special executor path.
5. Added only the focused coverage needed to prove the weak-review reentry affordance and preserve the accepted storefront baseline.

**Accepted final discipline:**

This was a bounded storefront friction-reduction wave only. It did not reopen catalog pressure, did not change Stage 4 runtime posture wiring, did not add a new route, did not add a planner/orchestrator, and did not widen into a larger recovery engine. The accepted implementation reduced visible friction inside the existing truthful next-step surface only.

**Accepted commit:**

- `2aec9dfe714d08a44ee3e4c7fc0955ca21fb1627`
- `feat(cesarin): improve recovery and friction handling`

**Accepted runtime / storefront truth after implementation:**

- Weak `REVIEW_ONE` now has a subtle reentry affordance through `next_step_view.assistAction`.
- That affordance appears only when `family === 'REVIEW_ONE'` and `supportLevel === 'weak'`.
- The accepted visible copy is `Seguimos viendo`.
- Clicking it returns the user to the normal conversation loop through ordinary `sendMessage(...)`.
- No Stage 4 runtime change was introduced.
- No service-shaping change was introduced.
- No hook-runtime behavior change was introduced beyond consuming the normal message flow.

**Explicit non-claims:**

- This is not a new route.
- This is not a planner/orchestrator path.
- This is not a funnel engine or broader recovery engine.
- This does not claim measured conversion uplift.
- This does not claim that all storefront friction handling is now solved globally.
- This does not reopen prior accepted waves as separate projects.

**Residual non-blocking risk:**

This wave closes the weak `REVIEW_ONE` reentry gap only. Other friction points may still exist in different storefront families, but they were not widened or misrepresented by this bounded implementation.

---

### Césarín Storefront / Assistant — Shaping Spine Consolidation Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted runtime coherence cleanup and the storefront friction-reduction pass, the assistant spine was materially more coherent, but the codebase still had one subtle auditability residue: the UI had already moved onto shared text utilities, yet the audit trail had not fully distinguished consolidation truth from an outdated impression of local duplication. This lane was opened to canonize the real consolidation state without reopening runtime, stage, catalog, or commercial behavior.

**Exact scoped files:**

- `src/lib/cesarin-text-utils.ts`
- `src/services/concierge.service.ts`
- `src/hooks/useAIConcierge.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**

1. Confirmed that shared text-shaping utilities had already been consolidated in `cesarin-text-utils.ts`.
2. Verified that `concierge.service.ts` and `useAIConcierge.ts` depend more directly on shared/server truth and less on older local reinterpretation.
3. Verified that `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
4. Confirmed that `AIConcierge.tsx` already consumes shared `normalizeCompactText(...)` and `isMeaningfullyDistinct(...)`.
5. Added focused UI regressions in `src/components/ui/ai/__tests__/AIConcierge.test.tsx` to explicitly guard that shared-util contract and close the auditability-only gap.

**Accepted final discipline:**

This was a documentation / auditability-close wave in practice, not a product rewrite. The accepted micro-fix reinforced the spine with tests, but it did not change runtime, stages, catalog behavior, or commercial behavior. The spine is cleaner because the shared utilities are already real and now explicitly guarded.

**Accepted commits:**

- `0628133a2552c946477e8e0f8f0d0048121e4497`
- `refactor cesarin runtime coherence cleanup`
- `ba0c21dfcd84dbb55b7b719258627adaafbede82`
- `test cesarin shaping spine ui dedupe guard`

**Accepted runtime truth after implementation:**

- Shared text-shaping utilities are centralized in `cesarin-text-utils.ts`.
- Service and hook rely more directly on shared/server truth and less on local reinterpretation.
- `buildConciergeCatalogGate(...)` is thinner and trusts server truth more cleanly.
- The prior UI residual was auditability-only, not an active product duplication.
- `AIConcierge.tsx` already consumed shared text utils, and that contract is now explicitly guarded by tests.

**Explicit non-claims:**

- This is not a full assistant rewrite.
- This does not claim perfect centralization across every layer.
- This does not claim all legacy residues everywhere are gone.
- This does not reopen runtime, stages, catalog, or commercial behavior.
- This does not add a new planner/orchestrator or any commercial rail.

**Residual non-blocking risk:**

The spine is more coherent, but not every storefront/service/UI responsibility is perfectly centralized. That bounded residue is accepted and is now guarded more explicitly rather than being silently assumed.

---

### Césarín Storefront — Visible Guidance Compression / Anti-Redundancy Wave — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted trust, decision-flow, recovery, and spine cleanup passes, the storefront still had one visible repetition residue: the same posture could echo across the help chip, the trust note, and `Siguiente paso`. The underlying decision was already correct, but the visible surfaces could still feel more mechanical than necessary. This lane was opened to compress that visible redundancy without touching runtime intelligence or reopening commercial behavior.

**Exact scoped files:**

- `src/components/ui/ai/AIConcierge.tsx`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**
1. **Accepted visible compression landed** - commit `4e69c198134ccdc12d2a0306f440860db22166cb` (`refactor cesarin visible guidance compression`) made the chip more categorical when `next_step_view` already exists, kept `Siguiente paso` as the clearer source of direction, and suppressed redundant trust-note echoes when guidance already carries the same meaning.
2. **Accepted boundary stayed UI-only** - the change stayed inside the storefront renderer boundary. No Stage 4, Stage 5, service, hook, catalog, or runtime-intelligence behavior was changed.
3. **Accepted auditability guard landed** - the focused UI regression coverage now freezes the separation so the chip remains bounded and `Siguiente paso` remains the primary place for useful direction when present.

**Accepted final discipline:**

- This is a bounded visible-guidance compression lane only.
- Chips are more categorical when `next_step_view` exists.
- `Siguiente paso` carries the useful directional guidance more cleanly.
- Trust-note echoes are suppressed when equivalent guidance is already visible.
- No runtime intelligence changed.
- No new copy-compression engine or global text framework was introduced.
- No measured UX or conversion uplift is claimed.

**Residual Truth Safeguards / Explicit Non-Claims:**

- No Stage 4 / Stage 5 / service / hook behavior change.
- No new planner/orchestrator layer.
- No storefront redesign from zero.
- No global text-compression claim across every surface.
- No product-behavior inflation beyond the visible renderer cleanup.

**Residual non-blocking risk:**

The compression is intentionally renderer-scoped. If future visible surfaces reuse the same posture language without the same boundary discipline, the same kind of echo could reappear there. That risk is bounded and now more visible through the UI tests.

---

### Césarín Storefront — Sales / Persona Hardening Wave — 30 de marzo de 2026

**Why this lane was opened:**

The storefront and assistant were already materially functional, but the visible commercial voice still felt too disciplined and too system-shaped in some turns. The lane was opened to strengthen Césarín’s sales presence, warmth, tact, and natural persuasive rhythm without adding new rails, modes, labels, or architecture.

**Exact scoped files:**

- `supabase/functions/customer-intelligence/persona.ts`
- `supabase/functions/customer-intelligence/index.ts`
- `src/lib/cesarin-stage4.ts`
- `src/lib/cesarin-stage5.ts`
- `src/lib/__tests__/cesarin-stage5.test.ts`
- `src/services/__tests__/concierge.service.stage4.test.ts`
- `src/components/ui/ai/__tests__/AIConcierge.test.tsx`

**Accepted implementation / audit sequence:**
1. **Voice base hardened** - `persona.ts` now describes Césarín as a trusted seller with calm confidence, warmth, and light natural wit when it fits.
2. **Sommelier prompt strengthened** - `index.ts` now carries a compact presence-commercial block so runtime answers can sound more human, sharper, and less like a disciplined state machine.
3. **Storefront wording softened** - `cesarin-stage4.ts` and `cesarin-stage5.ts` now use less mechanical commercial tails and next-step wording while preserving support truth, compare-first honesty, weak-support humility, and add-ready truthfulness.
4. **Focused regressions updated** - tests were adjusted to lock the new voice and wording without reopening catalog, recovery, or commercial gating behavior.

**Accepted final discipline:**

This is a bounded storefront/customer-intelligence lane. It materially improves commercial voice and presence, but it does not add new behavior rails, modes, labels, or a new planner. It does not redesign runtime architecture or storefront UI from zero. It does not claim measured conversion uplift. It does not claim full removal of deterministic Stage 4/5 commercial scaffolding.

**Accepted commit:**

- `18d6870c2e603b82ac28e726569593efa3b4986b`
- `feat cesarin sales persona hardening`

**Explicit non-claims:**

- No new modes, trees, labels, or hidden rails were introduced.
- No new admin / Cesarin OS work was added.
- No storefront UI redesign from zero was attempted.
- No funnel-engine or planner/orchestrator layer was added.
- No measured sales uplift is claimed.
- No full removal of deterministic Stage 4/5 commercial scaffolding is claimed.

**Residual non-blocking risk:**

The visible commercial feel still leans partly on deterministic Stage 4/5 scaffolding and wording-locked tests. That is an accepted residual, not a hidden failure: the voice is materially better, but not yet fully free of shaping from the surrounding posture machinery.

---

---

### Césarín Storefront — Stage 4 / Stage 5 De-Scaffolding Lane — 30 de marzo de 2026

**Why this lane was opened:**

After the accepted storefront visibility, outcome, trust, recovery, spine, guidance compression, and sales/persona passes, the visible response path still carried some stage-era residue. The customer-facing result was correct, but the answer flow could still feel like separate layers: main answer, helper note, and next-step block. This lane was opened to thin that scaffolding at the storefront boundary without redesigning Stage 4 / Stage 5 or changing runtime intelligence.

**Exact scoped files:**

- `src/services/concierge.service.ts`
- `src/components/ui/ai/AIConcierge.tsx`
- `src/services/__tests__/concierge.service.stage4.test.ts`

**Accepted implementation / audit sequence:**

1. `concierge.service.ts` now drops redundant `next_step_view` guidance when it does not add distinct value beyond the main response.
2. `AIConcierge.tsx` now narrows the visible trust-note surface so it only survives in genuine `KEEP_EXPLORING` flows and only when it is distinct from both the guidance and the main message.
3. Focused regressions now prove the accepted contract: redundant `KEEP_EXPLORING` scaffolding is removed, while distinct action value still preserves `next_step_view`.

**Accepted final discipline:**

- This is a bounded storefront de-scaffolding improvement only.
- `next_step_view` survives only when it adds distinct guidance or real action value via `primaryAction`, `secondaryAction`, or `assistAction`.
- Redundant `KEEP_EXPLORING` next-step scaffolding is dropped when the main response already carries the same move.
- Trust-note narrowing is real and limited to `KEEP_EXPLORING`.
- No runtime/product-intelligence redesign happened.
- No new mode, rail, planner, or mini-framework was introduced.
- No measured conversion uplift is claimed.

**Accepted commit:**

- `bd00a2e68e33a211d62ffa5111407eecc849dd76`
- `refactor cesarin storefront de-scaffold next steps`

**Explicit non-claims:**

- This does not remove Stage 4 / Stage 5.
- This does not claim stage structure is no longer materially important.
- This does not redesign runtime architecture or storefront UI from zero.
- This does not add a new planner/orchestrator or a new mode system.
- This does not widen product pressure or reopen closed lanes.

**Residual non-blocking risk:**

The accepted residual is the honest remaining stage structure plus a small auditability gap on the positive `KEEP_EXPLORING` trust-note survival case. That residue is bounded and does not block acceptance.

*Last updated: 30 de marzo de 2026 (Césarín Storefront — Stage 4 / Stage 5 De-Scaffolding Lane — ACCEPT)*

### Césarín Storefront — Turn-Level Commercial Judgment Tightening — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage4.ts`, `src/lib/cesarin-stage5.ts`, and `src/lib/__tests__/cesarin-stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
The accepted turn-level commercial judgment lane already introduced a compact bounded `commercial_move` for the product-search storefront path, but the downstream realization layers were still treating that move as if it needed to be recomputed again after service-level normalization. That weakened the accepted truth that current-turn commercial judgment should be computed once upstream when present, then followed downstream without redundant reinterpretation. The acceptance gap was narrow: Stage 4 and Stage 5 were already materially cleaner, but the upstream `commercial_move` still needed to be treated as primary truth instead of a second-pass suggestion.
**Implementation / Audit Sequence:**
1. **Accepted upstream truth priority landed** - commit `a43b49e4cf87ddf92d75886603c08840245720d6` (`fix cesarin upstream commercial move priority`) updated Stage 4 and Stage 5 so an upstream `commercial_move` is now treated as primary truth whenever present.
2. **Accepted fallback-only recomputation stayed bounded** - the same accepted commit keeps the shared commercial-judgment resolver only as a fallback when upstream `commercial_move` is absent, rather than recomputing the move redundantly on the happy path.
3. **Accepted Stage 4 contract proof landed** - the focused regression in `src/lib/__tests__/cesarin-stage4.test.ts` now proves that an upstream `turnAnalysis.commercial_move` is honored directly and still yields the expected Stage 4 posture.
4. **Accepted load-bearing storefront boundaries remained intact** - the corrective micro-fix stayed local to Stage 4 / Stage 5 realization and did not reopen catalog-gate authority, anti-bloat, degraded honesty, public-web scope, or admin / Cesarin OS behavior.
**Accepted Final Discipline:**
- This is a bounded storefront micro-lane, not a new planner/orchestrator contract.
- `commercial_move` is compact and bounded, not a global interpretation engine.
- The accepted move vocabulary remains bounded to `KEEP_EXPLORING`, `COMPARE_TWO`, `REVIEW_ONE`, and `ADD_READY`.
- Stage 4 now treats upstream `commercial_move` as primary truth when present.
- Stage 5 now follows upstream `commercial_move` as primary truth when present and only recomputes through the shared resolver as fallback when absent.
- Stage 4 and Stage 5 remain real and load-bearing realization layers.
- This lane improves turn-level commercial judgment propagation; it does not claim total elimination of all downstream deterministic shaping.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a planner/orchestrator redesign.
- This log does not claim Stage 4 / Stage 5 removal.
- This log does not claim measured conversion uplift.
- This log does not claim total commercial interpretation centralization everywhere.
- This log does not claim a new mode system.
- This log does not claim admin / Cesarin OS work.
- This log does not claim live/voice work.
**Residual non-blocking risk:**
- Stage 4 / Stage 5 remain deterministic realization layers around the compact commercial truth, so some downstream shaping still exists by design.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Turn-Level Commercial Judgment Tightening — ACCEPT)*

### Césarín Storefront — Selector-Needed Trigger Tightening / De-Scripted Surface — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / assistant only.
**Problem Identified:**
The storefront selector-needed edge still had too much local override pressure and too much generic visible scaffolding. In practice, `SELECTOR_NEEDED` could win too early relative to compare/review posture, and the UI still dressed it with generic family-chip and trust-note surfaces that made the edge feel more scripted than necessary. The lane was opened to tighten that trigger, keep the missing-selector ask only where it is materially purchase-defining, and de-script the visible selector-needed surface without widening upstream commercial judgment or reopening the stage architecture.
**Implementation / Audit Sequence:**
1. **Selector-needed override was tightened** - `src/lib/cesarin-stage5.ts` now bounds `SELECTOR_NEEDED` to stronger single-product, non-approximate, non-compare cases where the missing selector is truly required for the current move.
2. **Compare/review ordering stayed intact** - compare-worthy turns and weaker review-first turns no longer lose the field to selector-needed just because a variant selector exists.
3. **Visible scaffolding was reduced** - `src/components/ui/ai/AIConcierge.tsx` no longer renders generic selector-needed family-chip or trust-note scaffolding, while still allowing the minimal missing-selector guidance when it adds value.
4. **Focused regressions were updated** - tests now lock the accepted contract for selector-needed ordering and the de-scripted storefront surface.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-lane.
- `SELECTOR_NEEDED` remains a local Stage 5 family by design; it is not promoted upstream into `commercial_move`.
- The lane does not add a selector taxonomy, a planner/orchestrator, a funnel engine, or a new behavior tree.
- The lane does not claim full natural-language freedom.
- The lane does not claim upstream `commercial_move` expansion.
- The lane does not claim measured conversion uplift.
- The lane does not reopen closed storefront lanes.
**Residual Truth Safeguards / Explicit Non-Claims:**
- No admin / Cesarin OS work was added.
- No Stage 4 / Stage 5 redesign from zero was attempted.
- No broader compare/review lane was reopened.
- No trust-note expansion was introduced.
- No canned phrase pack replaced another canned phrase pack.
**Residual non-blocking risk:**
- Selector-needed still depends on deterministic Stage 5 realization for the minimal missing-selector ask, so some visible shaping remains by design.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Selector-Needed Trigger Tightening / De-Scripted Surface — ACCEPT)*

### Césarín Storefront — Tool-Selection / Intent-Guardrails De-Scripting — 31 de marzo de 2026
**Scope:** `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/__tests__/customer-intelligence-turn-first.test.ts`, and `src/lib/__tests__/customer-intelligence-tool-selection.test.ts`. Storefront / assistant only.
**Problem Identified:**
The storefront/runtime path was already broadly model-first, but `intent-guardrails.ts`, `tool-selection.ts`, and one runtime branch in `index.ts` still applied too much early local choreography. Regex-inferred semantic cues could still overtake non-`UNKNOWN` analyst intent too easily, fallback capability injection could still survive when the resolved turn profile no longer required capability use, public-web admission still carried too much regex-led routing flavor, and `index.ts` still contained an early compatibility force-correction before turn-profile resolution. The lane was opened to reduce that early coercion without removing legitimate hard-boundary controls.
**Implementation / Audit Sequence:**
1. **Regex pressure was subordinated** - commit `280d2c48f89286f69b90e7dcd84ffc52d963f576` (`refactor cesarin tool guardrail descripting`) updated `intent-guardrails.ts` so regex-inferred intents are now subordinated more often instead of overtaking non-`UNKNOWN` analyst intent by default.
2. **Fallback capability injection was narrowed** - the same accepted commit updated `tool-selection.ts` so fallback own-function injection only survives when the resolved turn profile still says capability use is needed and the primary intent still matches.
3. **Public-web admission became more purely boundary-gated** - the same accepted commit kept public-web admission behind resolved `PUBLIC_INFO` instead of allowing web-like wording to self-route the turn too early.
4. **Early compatibility force-correction was removed** - the same accepted commit removed the runtime pre-correction in `index.ts`, so turn-profile resolution now settles the lane before compatibility can become primary truth.
5. **Focused regressions proved the bounded contract** - the accepted test updates now prove that web-like wording no longer overtakes a resolved product-search turn by itself, public web does not reopen reflexively, and own-function fallback is not injected when the turn profile did not ask for capability use.
**Accepted Final Discipline:**
- This is a bounded storefront-only model-first lane.
- `intent-guardrails.ts` now subordinates regex-inferred intents more often instead of letting them overtake non-`UNKNOWN` analyst intent by default.
- `tool-selection.ts` now narrows fallback capability injection so it survives only when the resolved turn profile still requires capability use and the primary intent matches.
- Public-web admission is now boundary-gated behind resolved `PUBLIC_INFO` instead of regex-led semantic self-routing.
- `index.ts` no longer applies the early compatibility force-correction before turn-profile resolution.
- Legitimate deterministic boundary controls remain intact: catalog-closed pruning, clarify-first suppression, own-function fallback for true private/action lanes, and public-web restraint.
- This lane reduced early local choreography without planner/orchestrator drift, without widening `commercial_move`, and without reopening Stage 4 / Stage 5.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim regex elimination.
- This log does not claim full model-pure behavior.
- This log does not claim planner/orchestrator behavior.
- This log does not claim widened `commercial_move`.
- This log does not claim Stage 4 / Stage 5 redesign.
- This log does not claim measured conversion uplift.
- This log does not claim admin / Cesarin OS work.
**Residual non-blocking risk:**
- The residual is auditability-only and non-blocking: there is still no one focused regression pinning the removed compatibility pre-correction in `index.ts`. This is not a product defect and did not block acceptance.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Tool-Selection / Intent-Guardrails De-Scripting — ACCEPT WITH MINOR RESIDUAL)*

### Césarín Storefront — Stage 5 Family-Resolution Thinning / Upstream Truth Obedience — 31 de marzo de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
Upstream `commercial_move` was already primary truth on the accepted storefront path, and Stage 5 had already stopped hard-recomputing that move on the happy path. The remaining residual smell was narrower: Stage 5 still owned too much local family arbitration after upstream truth already existed, especially around compare/review/add-ready shaping and selector-needed degradation. The lane was opened to make Stage 5 obey upstream `commercial_move` more directly, own less local family switching, and preserve selector-needed as a real safety family without widening upstream vocabulary or reopening broader architecture.
**Implementation / Audit Sequence:**
1. **Accepted production thinning landed** - commit `04a0c3faa301c7ed4809881faf10672b353d84fb` (`refactor cesarin stage5 upstream move obedience`) updated `src/lib/cesarin-stage5.ts` so upstream `commercial_move` now drives Stage 5 more directly, with local heuristics reduced to bounded guardrails rather than late commercial arbitration.
2. **Accepted Stage 5 regressions landed** - the same accepted production commit added focused regressions in `src/lib/__tests__/cesarin-stage5.test.ts` proving that upstream `REVIEW_ONE` is no longer re-promoted into compare mode by local fallback heuristics and that upstream `ADD_READY` only degrades to `SELECTOR_NEEDED` when a purchase-defining selector is still missing.
3. **Accepted auditability closure landed** - commit `05334e4383d60ae5f399f05038f7adecdf662bbd` (`test cesarin stage5 upstream truth runtime evidence`) added one narrow runtime regression in `src/services/__tests__/concierge.service.stage4.test.ts` proving the real service path now carries an upstream `ADD_READY` move into Stage 5 and only downgrades it to `SELECTOR_NEEDED` when selector evidence actually requires that safety guardrail.
4. **Accepted boundary stayed narrow** - the evidence-hardening follow-up was test-only. No later production behavior change was needed after the Stage 5 implementation commit.
**Accepted Final Discipline:**
- This is a bounded storefront-only Stage 5 thinning lane.
- Stage 5 now obeys upstream `commercial_move` more directly.
- Stage 5 owns materially less local family arbitration after upstream truth already exists.
- `SELECTOR_NEEDED` remains a real safety family for materially purchase-defining missing selector evidence.
- The evidence-hardening follow-up closed the only remaining auditability gap through a focused runtime regression.
- This lane does not widen `commercial_move`, does not redesign Stage 4, and does not reopen tool-selection / intent-guardrails.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full Stage 5 removal.
- This log does not claim full model-pure rendering.
- This log does not claim widened `commercial_move`.
- This log does not claim Stage 4 rewrite.
- This log does not claim planner/orchestrator work.
- This log does not claim admin / Cesarin OS work.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- No lane-specific blocking residual remains after the runtime evidence hardening.
- Stage 5 still remains a real bounded realization layer with deterministic family/guidance behavior by design; that is accepted system truth, not a defect reopened by this lane.

*Last updated: 31 de marzo de 2026 (Césarín Storefront — Stage 5 Family-Resolution Thinning / Upstream Truth Obedience — ACCEPT)*

### Césarín Storefront — Availability Truth Alignment — 1 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/persona.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/tools.ts`, `src/lib/product-search-capsule.ts`, `src/lib/__tests__/customer-intelligence-web-tools.test.ts`, and `src/lib/__tests__/product-search-capsule.test.ts`; final runtime/storefront proof closed via `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
`INVENTORY_OUTLOOK` turns could still blur current availability with outlook, and active OOS wording still carried an unsupported future-return implication through phrasing like `temporalmente agotado`. The lane was opened to make current availability explicit first, keep projection secondary, remove unsupported return/restock implication from active OOS wording, and prove the final synthesized assistant output through the real storefront runtime path without reopening routing architecture.
**Implementation / Audit Sequence:**
1. **Prompt truth was tightened** - `persona.ts` and the Sommelier `index.ts` prompt now instruct availability turns to state current status first, keep outlook secondary, and avoid unsupported return/restock implication unless the report confirms it.
2. **Inventory truth output was separated** - `tools.ts` now emits explicit current availability and outlook fields so the runtime can preserve present truth before projection.
3. **Active OOS wording was corrected** - `src/lib/product-search-capsule.ts` removed unsupported `temporalmente agotado` implication from storefront recovery copy.
4. **Focused regressions were added** - `src/lib/__tests__/customer-intelligence-web-tools.test.ts` and `src/lib/__tests__/product-search-capsule.test.ts` now lock the availability-first / outlook-secondary / no-unsupported-return contract.
5. **Runtime storefront evidence was closed** - `src/services/__tests__/concierge.service.stage4.test.ts` now proves final synthesized assistant output for an `INVENTORY_OUTLOOK` turn preserves the accepted customer-facing truth at the service boundary.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-lane.
- Availability/outlook turns now express current availability first.
- Outlook/projection is explicitly secondary.
- Unsupported future-return implication was removed from active OOS wording.
- Runtime/storefront proof now exists through a focused regression on final `conciergeService.chat(...)` output for `INVENTORY_OUTLOOK`.
- The lane does not reopen routing architecture, Stage 4 / Stage 5 family-resolution work, storefront UI, planner/orchestrator behavior, or admin / Cesarin OS surfaces.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim Stage 4 / Stage 5 reopening.
- This log does not claim storefront UI redesign.
- This log does not claim planner/orchestrator work.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- Availability truth still depends on bounded model-led wording over the now-separated current status / outlook contract; that is accepted system truth, not a reopened defect.

*Last updated: 1 de abril de 2026 (Césarín Storefront — Availability Truth Alignment — ACCEPT)*

### Césarín Storefront — Text-Only Chat + Copy De-Robotization — 1 de abril de 2026
**Scope:** `src/lib/cesarin-stage1.ts`, `src/lib/cesarin-stage5.ts`, `src/hooks/useAIConcierge.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage1.test.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/hooks/__tests__/useAIConcierge.test.tsx`. Storefront / assistant only.
**Problem Identified:**
The active storefront assistant path still contained opaque `amarrada`-style wording that communicated uncertainty poorly and felt performative instead of helpful. The storefront hook path was also still auto-triggering `speak(...)`, so chat replies could play out loud with an undesirable robotic voice. The lane was opened to remove that opaque active phrasing, replace it with clearer direct uncertainty language, and make storefront chat text-only without reopening broader voice/live infrastructure or storefront architecture.
**Implementation / Audit Sequence:**
1. **Active opaque phrasing was removed** - commit `6bc159d01e92bbb23e219c88595cf9dd11aeea0b` (`fix cesarin storefront text-only chat copy`) updated the active Stage 1 and Stage 5 storefront copy paths so `amarrada`-style uncertainty/action wording no longer survives in the active assistant path.
2. **Replacement wording stayed bounded and direct** - the same accepted commit replaced the opaque phrasing with clearer, more direct uncertainty/help wording in weak-match and add-ready-adjacent surfaces without introducing a new phrase-pack lane or a broader copy rewrite.
3. **Storefront auto-speech was disabled in the active hook path** - the same accepted commit removed automatic `speak(...)` usage from `src/hooks/useAIConcierge.ts`, so storefront assistant replies and local WhatsApp escalation content no longer auto-play through the active storefront chat path.
4. **Broader speech infrastructure was intentionally left in place** - the lane did not redesign or remove the wider speech infrastructure in `src/contexts/TacticalContext.tsx`; it only stopped the active storefront chat path from auto-speaking.
5. **Focused regressions closed the contract** - the accepted tests now prove active fallback copy no longer contains `amarrada`, Stage 5 guidance aligns to the clearer wording, and storefront chat remains text-only by default through the active hook path.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-pass.
- Active opaque `amarrada`-style phrasing was removed from the active storefront assistant path.
- Replacement wording is clearer and more direct for uncertainty / weak-match cases.
- Storefront chat now behaves as text-only by removing automatic `speak(...)` usage from the active storefront assistant hook path.
- Broader speech infrastructure was intentionally not redesigned or removed.
- The lane does not reopen routing, Stage 4 / Stage 5 architecture, storefront UI, planner/orchestrator behavior, or admin / Cesarin OS surfaces.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim Stage 4 / Stage 5 reopening.
- This log does not claim storefront redesign.
- This log does not claim planner/orchestrator work.
- This log does not claim voice/live platform redesign.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- Broader speech infrastructure still exists outside the active storefront hook path by design; this lane only closes storefront auto-speech and the active opaque copy issue.

*Last updated: 1 de abril de 2026 (Césarín Storefront — Text-Only Chat + Copy De-Robotization — ACCEPT)*

### Césarín Storefront — Direct-Answer Preservation / Stage 5 Restraint — 1 de abril de 2026
**Scope:** `src/lib/cesarin-stage5.ts`, `src/services/concierge.service.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/cesarin-stage5.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/components/ui/ai/__tests__/AIConcierge.test.tsx`. Storefront / assistant only.
**Problem Identified:**
Direct-answer-first behavior was already fairly strong in the main assistant text, but concrete product-answer turns could still carry residual Stage 5/storefront help after the main question was already sufficiently resolved. The lane was opened to preserve direct answers on narrow resolved concrete single-product fact turns by suppressing secondary Stage 5/storefront help only when no selector, unresolved compare, weak review-first need, or genuine follow-through was still required.
**Implementation / Audit Sequence:**
1. **Stage 5 restraint was narrowed to the concrete case** - commit `74014a18813e6484bea05b3c2d88eb20cfcaa3db` (`fix cesarin direct answer stage5 restraint`) updated `src/lib/cesarin-stage5.ts` so resolved concrete single-product fact questions can mark secondary help as suppressed after the main answer is already sufficient.
2. **Service-level secondary help now obeys that restraint** - the same accepted commit updated `src/services/concierge.service.ts` so `next_step_view` is not carried forward when the direct concrete product answer is already resolved and the narrow suppression contract applies.
3. **UI rendering no longer paints empty/reflexive secondary surfaces** - the same accepted commit updated `src/components/ui/ai/AIConcierge.tsx` so `Siguiente paso` and related secondary help surfaces render only when there is still real next-step content to show.
4. **Focused regressions closed the contract** - the accepted tests now prove a concrete product fact question can answer directly and stop, while unresolved compare, selector-needed, and other materially useful Stage 5 help remain preserved.
**Accepted Final Discipline:**
- This is a bounded storefront-only micro-lane.
- Resolved concrete single-product fact turns now answer directly and stop.
- Secondary Stage 5/storefront help is suppressed only for the narrow intended case.
- Compare / selector-needed / weak review-first / genuine follow-through cases remain preserved.
- The lane does not reopen routing, tool-selection, Stage 4 / Stage 5 philosophy, storefront UI design, planner/orchestrator behavior, memory/preference work, or admin / Cesarin OS surfaces.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim Stage 4 / Stage 5 philosophy reopening.
- This log does not claim planner/orchestrator work.
- This log does not claim memory/preference work.
- This log does not claim storefront redesign.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured business uplift.
**Residual non-blocking risk:**
- Stage 5 remains a real bounded realization layer by design; this lane only restrains secondary help on the accepted narrow resolved direct-answer case.

*Last updated: 1 de abril de 2026 (Césarín Storefront — Direct-Answer Preservation / Stage 5 Restraint — ACCEPT)*

### Césarín Storefront — Attribute Precision / Fact Consistency — 2 de abril de 2026
**Scope:** `src/lib/product-search-capsule.ts`, `src/lib/__tests__/product-search-capsule.test.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and the narrow compatibility inclusion in `src/lib/cesarin-stage5.ts`. Storefront / assistant only.
**Problem Identified:**
Concrete product fact answers were already partially hardened through `caladas`, but exact factual turns were still more brittle across other supported attribute families. Direct factual answers could still depend too much on exact spec-key spelling, and runtime/storefront proof did not yet cover flavor, compatibility-style facts, or compatibility-missing honesty. The accepted next lane therefore had to harden factual precision and consistency across already-supported data-backed families without reopening routing, prompts, comparison posture, or broader stage philosophy.
**Implementation / Audit Sequence:**
1. **Accepted factual hardening landed in the capsule** - commit `ffb4a389cc1d5d2bff435363e7a3ccb92bebf8de` (`fix cesarin attribute fact consistency`) updated `src/lib/product-search-capsule.ts` with a narrow alias-backed factual resolver so exact single-product fact turns can answer directly and consistently across supported factual families already present in the real data shape.
2. **Accepted supported fact families became materially stronger** - the same accepted commit added stronger direct-answer handling for `puffs / caladas`, `nicotina`, `sabor`, `modelo / versión`, and compatibility-style facts already present in the current data shape, while keeping unsupported or missing facts explicit instead of fabricated.
3. **Accepted capsule proof extended beyond `caladas`** - the same accepted commit updated `src/lib/__tests__/product-search-capsule.test.ts` with focused regressions for `nicotina`, `sabor`, `versión`, direct compatibility, and compatibility-missing honesty.
4. **Accepted runtime/storefront proof extended beyond `caladas`** - follow-up commit `814bb3e247752ab6adfab1e1751f23a05c9041ed` (`test cesarin fact runtime evidence`) updated `src/services/__tests__/concierge.service.stage4.test.ts` so final `conciergeService.chat(...)` output is now explicitly covered for flavor fact turns, compatibility-style fact turns, and compatibility-missing honesty.
5. **Accepted compatibility inclusion stayed narrow** - the evidence-hardening pass revealed one real residual: compatibility-style fact turns were not yet entering the same narrow direct-fact suppression lane as other resolved fact turns. The accepted fix therefore widened the existing direct-fact detector in `src/lib/cesarin-stage5.ts` only enough to include compatibility-style questions, without reopening broader Stage 5 philosophy.
**Accepted Final Discipline:**
- This was a bounded storefront-only factual hardening lane.
- Concrete product fact answers are now materially more precise and more consistent across supported factual families.
- Supported factual families now include stronger direct-answer handling for `puffs / caladas`, `nicotina`, `sabor`, `modelo / versión`, and compatibility-style facts already present in the current data shape.
- Missing supported facts now stay explicit and honest instead of falling through to generic exact-match reinforcement or fabricated claims.
- Runtime/storefront proof now exists beyond `caladas`, including flavor, compatibility-style facts, and compatibility-missing honesty.
- The compatibility inclusion in the direct-fact suppression detector remained narrow and did not reopen broader Stage philosophy.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim prompt-heavy redesign.
- This log does not claim Stage 4 / Stage 5 philosophy reopening.
- This log does not claim planner/orchestrator work.
- This log does not claim memory/preference work.
- This log does not claim storefront redesign.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured uplift.
**Residual non-blocking risk:**
- This lane hardens supported factual families only; it does not claim broader attribute expansion or a reopened comparison-honesty pass.

*Last updated: 2 de abril de 2026 (Césarín Storefront — Attribute Precision / Fact Consistency — ACCEPT)*

### Césarín Storefront — Truth Spine Consolidation Wave — 2 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/lib/product-search-capsule.ts`, `src/lib/cesarin-stage5.ts`, `src/services/concierge.service.ts`, `src/components/ui/ai/AIConcierge.tsx`, `src/lib/__tests__/product-search-capsule.test.ts`, `src/lib/__tests__/cesarin-stage5.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
The accepted storefront baseline was still mostly model-first, but truth/help ownership had accumulated across the capsule, Stage 5, service glue, and UI rendering. `src/lib/product-search-capsule.ts` and `src/lib/cesarin-stage5.ts` had become the main hotspots: capsule truth was still forcing downstream inference, Stage 5 still carried too many local detectors and suppressions, and service/UI were compensating for that ambiguity instead of consuming a cleaner contract more literally. The wave was opened to consolidate truth-bearing signals upward into the capsule layer, slim Stage 5 local policy burden, and make service/UI more literal consumers of a clearer storefront help contract without reopening routing, stage philosophy, or storefront architecture.
**Implementation / Audit Sequence:**
1. **Capsule truth/help ownership was consolidated upward** - commit `4138b80` (`refactor cesarin truth spine consolidation`) updated `src/lib/product-search-capsule.ts` so direct fact resolution, compare modesty, fallback honesty, and copy assembly emit clearer truth-bearing outputs instead of leaving dominant paths to downstream inference.
2. **Explicit capsule contract outputs were added** - the same accepted commit extended `src/lib/ai-capsule-schemas.ts` so `truth_signals` and `help_contract` now exist as explicit capsule contract outputs for dominant storefront truth/help paths.
3. **Stage 5 became materially less detector-heavy** - the same accepted commit updated `src/lib/cesarin-stage5.ts` so direct-answer stopping and compare/help posture depend more directly on capsule truth/help and less on locally accumulated detectors and suppressions.
4. **Service became a more literal composer of truth and render intent** - the same accepted commit updated `src/services/concierge.service.ts` so service now composes upstream turn truth, capsule truth/help, and Stage 5 render intent more literally instead of compensating for ambiguity through extra glue.
5. **UI now consumes a clearer upstream help/render contract** - the same accepted commit updated `src/components/ui/ai/AIConcierge.tsx` so help rendering prefers explicit upstream render truth with bounded backward compatibility instead of re-deriving as much business meaning locally.
6. **Dominant storefront proof was preserved under the cleaner spine** - the accepted tests now prove dominant factual/help/compare storefront paths still work after consolidation, including direct-answer stopping, compare modesty, selector-needed integrity, and clearer service/UI contract consumption.
**Accepted Final Discipline:**
- This was a bounded storefront-only consolidation wave.
- The wave materially moved truth/help ownership upward into the capsule/truth layer.
- `truth_signals` and `help_contract` now exist as explicit capsule contract outputs.
- Stage 5 is materially less detector-heavy and consumes capsule truth/help more directly.
- Service now behaves more like a literal composer of upstream/capsule truth and Stage 5 render intent.
- UI now consumes a more explicit upstream help/render contract with bounded backward compatibility.
- Dominant factual/help/compare storefront paths remained preserved under the new truth spine.
- Upstream turn analysis and catalog gate stayed primary throughout the accepted wave.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim routing redesign.
- This log does not claim planner/orchestrator work.
- This log does not claim storefront redesign.
- This log does not claim Stage philosophy rewrite from zero.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim measured uplift.
**Residual non-blocking risk:**
- Stage 5 still exists as a bounded realization layer by design; this wave slims local policy burden but does not remove downstream realization entirely.
- `help_contract` is intentionally narrow and covers dominant storefront truth/help paths, not every future edge.
- UI retains bounded backward-compatibility fallback where explicit `surfaceKind` truth is absent; that is accepted structural continuity, not a reopened defect.

### Césarín Storefront — Runtime Telemetry Truth Hardening (MVL) — 2 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
The accepted storefront baseline already persisted telemetry to `ai_analytics`, but the observable runtime truth set was still too thin for high-confidence prioritization from real usage. The next bounded lane therefore had to harden runtime evidence, not behavior: extend the real storefront/customer-intelligence telemetry path with a compact set of already-existing runtime truth fields so real pain can be inspected and ranked without opening a new behavior architecture lane, planner layer, or analytics framework.
**Implementation / Audit Sequence:**
1. **The real storefront telemetry path was extended** - commit `f7f0a5b86731d09d5ecafb4d6a54dc7fd940b9a3` (`feat cesarin runtime telemetry truth hardening`) updated the real edge-owned and client/runtime-owned `ai_analytics` write paths instead of introducing a sidecar telemetry flow.
2. **Bounded runtime-truth fields were persisted from existing truth** - the same accepted commit extended telemetry payloads with compact fields already present in the runtime truth spine, including `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
3. **Non-applicable paths stayed explicit and honest** - the same accepted commit ensured non-catalog, non-next-step, and non-source-context paths persist null/falsey values where the truth does not apply instead of inflating claims.
4. **Focused runtime/service evidence closed the contract** - `src/services/__tests__/concierge.service.stage4.test.ts` now proves the new telemetry fields on real storefront paths including direct fact answers, selector-needed help, `PUBLIC_INFO`, and `INVENTORY_OUTLOOK`.
5. **Acceptance confirmed scope discipline** - the accepted audit verified this lane extends runtime observability only and does not change recommendation posture, catalog gate semantics, Stage 5 family semantics, routing behavior, or public-web selection behavior.
**Accepted Final Discipline:**
- This lane is observability / runtime-truth hardening only.
- It extends the real storefront/customer-intelligence telemetry path with a compact bounded runtime-truth set.
- New fields are derived from already-existing runtime truth, not from new behavior heuristics or synthetic scoring.
- Edge and service telemetry now persist bounded fields such as `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
- Non-applicable paths remain honest through null/falsey telemetry values where those truths do not apply.
- Acceptance audit found no storefront behavior drift.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a new behavior architecture lane.
- This log does not claim recommendation posture changes.
- This log does not claim catalog gate semantic changes.
- This log does not claim Stage 5 family semantic changes.
- This log does not claim routing redesign or public-web selection policy changes.
- This log does not claim a dashboard build, analytics platform build, planner/orchestrator work, admin / Cesarin OS expansion, or measured business uplift.
**Residual non-blocking risk:**
- The telemetry hardening is structurally implemented and acceptance-audited, but this pass does not claim separate live production probing of every new field combination in the real environment.
- Coverage is focused and sufficient for acceptance, not exhaustive across every possible tool mix or runtime branch.

### Césarín Storefront — AI_Analytics Telemetry Readiness Micro-Fix — 2 de abril de 2026
**Scope:** `supabase/migrations/20260402_ai_analytics_runtime_telemetry_columns.sql`, `supabase/functions/customer-intelligence/index.ts`, `src/services/concierge.service.ts`, `src/services/admin/admin-pilot-ops.service.ts`, `src/services/__tests__/concierge.service.stage4.test.ts`, and `src/services/admin/__tests__/admin-pilot-ops.service.test.ts`. Storefront / assistant telemetry readiness only.
**Problem Identified:**
The accepted MVL telemetry lane had already extended the real storefront/customer-intelligence write paths, but readiness for inspection was still structurally incomplete: `ai_analytics` did not yet have a migration aligning the table to the accepted bounded telemetry read model, and the inspection path still depended primarily on `ai_logic_debug` instead of a compact queryable top-level shape. The correct next move was therefore a telemetry-readiness micro-fix, not a new storefront behavior lane.
**Implementation / Audit Sequence:**
1. **Schema alignment landed** - commit `39732a405230107a1294b489eb24a2203db4256e` (`fix cesarin ai analytics telemetry readiness`) added `supabase/migrations/20260402_ai_analytics_runtime_telemetry_columns.sql`, introducing the bounded top-level telemetry columns `primary_intent`, `current_turn_decision`, `turn_focus`, `catalog_gate_open`, `catalog_gate_reason`, `next_step_family`, `assist_action_present`, `source_context_present`, and `retrieval_source`.
2. **Real write paths were aligned to the accepted read model** - the same accepted commit updated `supabase/functions/customer-intelligence/index.ts` and `src/services/concierge.service.ts` so the real edge and storefront service telemetry writes now persist those bounded fields top-level while preserving detailed `ai_logic_debug`.
3. **The intended inspection path became readiness-safe** - the same accepted commit updated `src/services/admin/admin-pilot-ops.service.ts` so the admin inspection reader now prefers the new top-level columns and falls back to historical `ai_logic_debug` rows when those columns are absent.
4. **Focused readiness proof landed** - the same accepted commit extended `src/services/__tests__/concierge.service.stage4.test.ts` to assert top-level telemetry writes on real storefront paths and added `src/services/admin/__tests__/admin-pilot-ops.service.test.ts` to prove top-level preference plus JSON fallback.
5. **Acceptance confirmed bounded scope** - the accepted audit verified that schema alignment is real, top-level runtime telemetry writes are real, the inspection path now prefers top-level truth with historical fallback, no security/RLS drift was introduced, and no storefront behavior semantic drift was found.
**Accepted Final Discipline:**
- This pass is a telemetry-readiness micro-fix only.
- It is not a new storefront behavior lane.
- It aligns `ai_analytics` schema to the accepted MVL telemetry read model.
- Edge and storefront service telemetry writes now persist the bounded top-level telemetry fields on the real write paths.
- Admin inspection now prefers top-level columns and falls back to historical `ai_logic_debug` rows when needed.
- Security/RLS was not loosened in this pass.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim recommendation posture changes.
- This log does not claim catalog gate semantic changes.
- This log does not claim Stage 5 family semantic changes.
- This log does not claim routing redesign.
- This log does not claim public-web selection policy redesign.
- This log does not claim a dashboard, analytics platform, planner, or reporting framework.
- This log does not claim admin / Cesarin OS expansion beyond the truthful existing inspection-path mention.
- This log does not claim direct live verification that the migration is already applied in production in this pass.
- This log does not claim direct live-row verification from production traffic in this pass.
**Residual non-blocking risk:**
- This readiness fix is structurally implemented and acceptance-audited, but live deployed database state was not directly verified in this pass.
- Historical rows still depend on JSON fallback until newer traffic writes the top-level fields.

### Césarín Storefront — Search-Leading Product Grounding & Recovery Hardening — 2 de abril de 2026
**Scope:** `src/services/ai-capsule-orchestrator.service.ts`, `src/services/__tests__/ai-capsule-orchestrator.service.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant retrieval and recovery only.
**Problem Identified:**
Fresh post-migration telemetry exposed one dominant repeated storefront failure pattern on real search-leading product turns. Useful product/entity/attribute queries were repeatedly entering the same dead zone: `catalog_gate_open = true`, `catalog_gate_reason = search_leading`, `current_turn_decision = USE_CAPABILITY`, `retrieval_source = NONE`, `capsule_match_strategy = NO_MATCH`, `product_card_count = 0`, `next_step_family = KEEP_EXPLORING`, and `fallback_used = true`. The correct next move was therefore a bounded hardening of the real search-leading capsule bridge so useful grounding and partial recovery happen before generic no-match fallback when the active catalog still contains materially useful help.
**Implementation / Audit Sequence:**
1. **The real search-leading capsule bridge was hardened** - commit `f79b222b857d73946e952efb2bf7162677a8c557` (`fix cesarin search leading grounding recovery`) updated `src/services/ai-capsule-orchestrator.service.ts` so token recovery no longer depends on a narrow `name`-only path or on `requires_semantic_expansion === false`. Recovery now searches broader real catalog fields (`name`, `slug`, `description`, `ai_sales_note`) and adds bounded guided recovery signals for broad entity-led search, attribute-led narrowing, near-exact missing-product recovery, and mixed-need turns when at least one real grounded route is available.
2. **The dead-zone pattern was reduced before fallback, not after it** - the same accepted commit kept the fix inside the existing search-leading capsule bridge before the fallback tree, instead of reopening routing, Stage 5/commercial handoff, or planner/orchestrator behavior.
3. **Focused capsule evidence landed for the proven failure families** - the same accepted commit extended `src/services/__tests__/ai-capsule-orchestrator.service.test.ts` so the bridge now has focused proof for broad `waka` search, attribute narrowing (`de menta y no muy caro`), mixed `vape chico + liquido de uva`, near-exact missing `waka somatch mb6000`, and token recovery after empty semantic expansion.
4. **Acceptance-clean runtime evidence landed later as auditability closure only** - commit `d2bce5fdd51faa8bb45eeefd047684d1a77ca36f` (`test cesarin search recovery runtime evidence`) updated `src/services/__tests__/concierge.service.stage4.test.ts` only. It closed the remaining evidence gap by adding exact runtime/service regressions for `de menta y no muy caro`, `quiero algo frutal para diario`, and `no encuentro el waka somatch mb6000`. This follow-up was test-only auditability closure, not a second behavior lane.
5. **Final acceptance confirmed bounded scope and no adjacent drift** - the accepted audit verified that this lane fixes the right real storefront path, materially reduces the repeated `NO_MATCH + KEEP_EXPLORING + 0 cards` collapse when useful grounding exists, and does so without routing drift, Stage 5 drift, planner/orchestrator drift, or storefront redesign.
6. **Strict non-degraded live verification landed** - the exact clean live window `2026-04-03T03:14:33Z` to `2026-04-03T03:14:53Z` covered the same 6 prompts (`waka menta`, `que nicotina trae mint fresh`, `no encuentro el waka somatch mb6000`, `de menta y no muy caro`, `quiero un vape chico y ademas un liquido de uva`, and `busco un waka pero no se cual`). That valid window was non-degraded: no `fallback_reason = GEMINI_DEGRADED` and no `Gemini rate limit (429)`. In clean live proof the old dead-end signature stayed absent: no reappearance of `retrieval_source = NONE`, `capsule_match_strategy = NO_MATCH`, `product_card_count = 0`, or `next_step_family = KEEP_EXPLORING` as the zero-card dead-end combination. Five prompts recovered through `TOKEN_RECOVERY` with cards present and `next_step_family = COMPARE_TWO`; `busco un waka pero no se cual` recovered through `TOKEN_RECOVERY` with `product_card_count = 1` and `next_step_family = KEEP_EXPLORING`, but no longer as a zero-card dead-end.
**Accepted Final Discipline:**
- This is a bounded storefront retrieval/recovery hardening lane.
- It hardens the real search-leading capsule bridge before the existing fallback tree.
- It materially improves grounding/recovery for broad entity-led product search, attribute-led narrowing, near-exact missing-product recovery, and mixed-need product recovery when grounded help is actually possible.
- It reduces the repeated dead-zone pattern where useful search-leading turns were collapsing into `NO_MATCH`, `KEEP_EXPLORING`, `retrieval_source = NONE`, and `product_card_count = 0`.
- It preserves honesty: no fake exact-match invention and no forced catalog pressure when useful grounding is absent.
- Acceptance-clean status includes the later runtime/service evidence closure for `de menta y no muy caro`, `quiero algo frutal para diario`, and `no encuentro el waka somatch mb6000`.
- This lane is now acceptance-clean and fully live-proven on a strict non-degraded window.
- The old dead-end signature is closed in clean live proof.
- `KEEP_EXPLORING` may still appear on bounded exploratory recovery when cards are present; the closed pattern is the zero-card dead-end combination.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a planner/orchestrator redesign.
- This log does not claim a Stage 5/commercial-handoff redesign.
- This log does not claim a standalone mixed-intent mega-lane.
- This log does not claim a copy-only de-robotization lane.
- This log does not claim a broad catalog/retrieval rewrite from zero.
- This log does not claim live production telemetry uplift for this lane beyond the accepted implementation and audit evidence.
- This log does not claim ambient `429` disappeared globally; later degraded windows are environmental noise, not contradictory proof against the accepted clean window.
**What Did Not Change:**
- No admin / Cesarin OS work.
- No routing redesign.
- No Stage 5 philosophy reopening.
- No planner/orchestrator expansion.
- No storefront redesign.
- No new behavior lane outside search-leading grounding/recovery hardening.
**Outcome:**
The Césarín Storefront — Search-Leading Product Grounding & Recovery Hardening lane is now formally closed as accepted and live-proven in canon. The strict non-degraded live window closed the old dead-end signature, the real search-leading capsule bridge now recovers more useful grounded help before falling into generic no-match behavior, the repeated `NO_MATCH + KEEP_EXPLORING + 0 cards` collapse is materially reduced when the live catalog still supports partial recovery, honesty remains preserved, and the later runtime/service patch closed the remaining auditability gap without opening a second behavior lane.

### Césarín Storefront — Store-Hours Misrouting Micro-Fix — 2 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/__tests__/customer-intelligence-turn-first.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
Fresh live storefront rows showed one narrow residual after the accepted search-leading recovery lane: store-hours / opening-hours style informational turns such as `a que hora abren hoy?` were still misrouting into `PRODUCT_SEARCH`, opening the catalog gate, and surfacing product recovery behavior. This was not a broad routing failure and did not justify a new behavior lane. The correct next move was a tightly bounded micro-fix on the real guardrail/runtime path for the store-hours family only.
**Implementation / Audit Sequence:**
1. **The real guardrail/runtime path was fixed directly** - commit `363cecf78e02129b70fb388f6028a86807716af0` (`fix cesarin store hours misrouting`) updated `supabase/functions/customer-intelligence/intent-guardrails.ts` so store-hours/opening-hours phrasing now resolves through the existing non-catalog policy/informational family instead of falling into `PRODUCT_SEARCH`.
2. **The edge runtime mirror stayed aligned** - the same accepted commit updated the local weak-intent mirror in `supabase/functions/customer-intelligence/index.ts` so the runtime path remains coherent with the accepted guardrail truth.
3. **Guardrail classification proof landed** - the same accepted commit extended `src/lib/__tests__/customer-intelligence-turn-first.test.ts` to prove `a que hora abren hoy?` now resolves as `POLICY_INQUIRY` with a closed catalog gate and `reason = non_catalog_lane`.
4. **Runtime/service proof landed on the final storefront path** - the same accepted commit extended `src/services/__tests__/concierge.service.stage4.test.ts` to prove `a que hora abren hoy?` remains non-catalog, does not trigger product capsule recovery, and persists telemetry with `primary_intent = POLICY_INQUIRY`, `catalog_gate_open = false`, and `retrieval_source = null`. The same focused runtime surface also preserved the already-correct non-catalog behavior for `hacen envios a todo mexico?`.
5. **Acceptance confirmed scope discipline** - the accepted audit verified that this is a clean fix on the real guardrail/runtime path, keeps store-hours turns out of `PRODUCT_SEARCH`, preserves a closed catalog gate for those turns, prevents token-recovery/product-card behavior on that family, and does so without reopening Stage 5, search-leading recovery, planner/orchestrator behavior, or broader routing redesign.
**Accepted Final Discipline:**
- This is a bounded storefront micro-fix.
- It fixes store-hours/opening-hours style informational turns misrouting into `PRODUCT_SEARCH`.
- It keeps store-hours turns in the existing non-catalog informational/policy family.
- It keeps the catalog gate closed for those turns.
- It prevents token-recovery/product-card behavior on store-hours turns.
- It preserves already-correct non-catalog behavior for queries like `hacen envios a todo mexico?`.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a broad informational-routing rewrite.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim a Stage 5/commercial-handoff change.
- This log does not claim a search-recovery redesign.
- This log does not claim admin / Cesarin OS work.
- This log does not claim fresh live telemetry re-verification for this micro-fix in this pass.
**Residual non-blocking risk:**
- The store-hours family is structurally fixed and acceptance-audited, but this canon entry does not separately claim a post-acceptance live telemetry pass proving every adjacent opening-hours variant in production.

### Césarín Storefront — Degraded Policy Fallback Micro-Fix — 2 de abril de 2026
**Scope:** `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/policy-degraded-fallback.ts`, `src/lib/__tests__/customer-intelligence-policy-degraded-fallback.test.ts`, and `src/services/__tests__/concierge.service.stage4.test.ts`. Storefront / assistant only.
**Problem Identified:**
After the accepted store-hours routing fix was deployed, live authenticated storefront probes exposed a new bounded residual on non-catalog informational/policy turns under real upstream degradation. Store-hours, shipping, and payment asks were correctly staying out of `PRODUCT_SEARCH`, but under `429 / GEMINI_DEGRADED` conditions they were still collapsing into the same low-quality generic degraded line. This was not a new behavior-architecture problem; it was a narrow degraded-fallback-quality issue inside the existing non-catalog `POLICY_INQUIRY` path.
**Implementation / Audit / Live Verification Sequence:**
1. **The real degraded branch was fixed directly** - commit `ea3ca63755914f3a7f9d2330de8e2b4c5ce8a5c5` (`fix cesarin degraded policy fallback`) added a bounded degraded fallback helper for non-catalog `POLICY_INQUIRY` turns so the runtime now prefers compact useful fallback answers or specific honest limitations before the old generic degraded line.
2. **Scope stayed narrowly bounded** - the same accepted commit wired the helper only into the Sommelier degraded branch for non-catalog `POLICY_INQUIRY` turns. It did not reopen catalog behavior, product capsule behavior, Stage 5, search-recovery, planner/orchestrator logic, or a broader resilience platform.
3. **Acceptance confirmed the implementation discipline** - the accepted cold audit verified that the real degraded branch is correctly wired, the scope is correctly limited to non-catalog `POLICY_INQUIRY`, store-hours honesty is preserved, and no catalog reopening was introduced.
4. **Live verification confirmed real production behavior** - after deploy, authenticated live probes under real `429 / GEMINI_DEGRADED` conditions confirmed that audited informational/policy turns remain non-catalog with `catalog_gate_open = false`, `requires_client_capsule = false`, and no product capsule. The old generic degraded line no longer appears on the verified turn family.
5. **Bounded live fallback behavior is now confirmed** - live verified responses now include:
   - store-hours -> `Ahorita no traigo el horario exacto confirmado en sistema.`
   - shipping -> `Manejamos envios por DHL Express a sucursal.`
   - payment -> `Por ahora manejamos solo transferencia o deposito bancario.`
**Accepted Final Discipline:**
- This is a bounded storefront micro-fix for degraded fallback quality on non-catalog `POLICY_INQUIRY` turns.
- It improves degraded fallback quality under real `429 / GEMINI_DEGRADED` conditions for store-hours, shipping, payment, and bounded generic policy turns where applicable.
- It preserves non-catalog behavior, a closed catalog gate, no product capsule, and honest non-invention of exact store hours.
- It is both acceptance-audited and live-verified.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a broad resilience framework.
- This log does not claim a generic 429 platform fix.
- This log does not claim a new policy lane.
- This log does not claim a planner/orchestrator redesign.
- This log does not claim a search-recovery redesign.
- This log does not claim admin / Cesarin OS work.
- This log does not claim that upstream 429 frequency was solved.
**Residual non-blocking risk:**
- Upstream `429` rate limiting still exists live. This micro-fix improved degraded fallback quality, not upstream rate-limit frequency.
- Store-hours remains intentionally non-inventive; the live fallback stays honest instead of fabricating exact schedule data.

### Storefront Contextual Warranty Triage & Defect Resolution (Authenticated RMA) - 3 de abril de 2026
**Scope:** `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, `src/services/storefront-warranty-triage.service.ts`, `src/services/ai-capsule-orchestrator.service.ts`, `src/services/concierge.service.ts`, `supabase/functions/customer-intelligence/index.ts`, `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, and the focused storefront routing/runtime/assistant regressions tied to those surfaces. Authenticated storefront post-purchase support triage only.
**Problem Identified:**
The accepted storefront already had bounded authenticated reorder and order-tracking paths, but defect/warranty-style turns were still too likely to collapse into generic policy handling even when recent authenticated order truth existed. The remaining need was not refunds, cancellations, ticketing, or a full RMA platform. It was one bounded storefront lane that could read recent authenticated fulfilled-order and order-item truth, attempt contextual product binding, and answer defect/warranty turns more truthfully without inventing eligibility.
**Implementation / Audit Sequence:**
1. **A bounded authenticated warranty-triage intent/capsule contract was added** - the accepted commit `0d3b0725967022803ab2b42d08ef21d5dbbc487c` (`feat storefront contextual warranty triage`) extended `supabase/functions/customer-intelligence/intent-guardrails.ts`, `supabase/functions/customer-intelligence/tool-index.ts`, `supabase/functions/customer-intelligence/tool-selection.ts`, `supabase/functions/customer-intelligence/index.ts`, `src/lib/ai-capsule-schemas.ts`, `src/types/ai-capsule.ts`, and `src/services/ai-capsule-orchestrator.service.ts` so `WARRANTY_SUPPORT` now exists as a bounded non-catalog storefront support intent and the capsule/runtime now carries bounded `authenticated_warranty_triage` truth.
2. **Read-only warranty resolution now reuses authenticated recent fulfilled-order truth only** - the same accepted commit added `src/services/storefront-warranty-triage.service.ts`, keeping the resolver strict read-only and grounded only in authenticated persisted recent fulfilled-order and order-item data. Explicit order-number lookup is bounded to that same authenticated recent-order set.
3. **The resolver stayed bounded in classification and honesty** - the same accepted commit classifies only into bounded states `LIKELY_ELIGIBLE`, `OUT_OF_POLICY`, `CANNOT_IDENTIFY_PRODUCT`, `NO_RELEVANT_ORDER`, and `AUTH_REQUIRED`. It attempts likely product identification when recent order-item truth supports it, but degrades honestly when product identity, recency, or authentication do not support stronger claims.
4. **Storefront runtime and responses stayed message-only and non-catalog** - the same accepted commit updated `src/services/concierge.service.ts` so authenticated warranty/defect turns remain message-only, keep catalog/product sales surfaces suppressed, and do not become a sales or browsing lane. Generic warranty-policy questions may still remain `POLICY_INQUIRY` when contextual authenticated triage is not the right lane.
5. **Acceptance closed without adjacent drift** - the accepted audit verified that this lane improves authenticated post-purchase support contextuality without opening ticket creation, refunds, cancellations, order edits, admin / Cesarin OS expansion, checkout/payment redesign, or a full CRM/ticketing platform.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded authenticated contextual warranty / defect triage.
- `WARRANTY_SUPPORT` exists as a bounded non-catalog storefront support intent.
- The capsule/runtime now carries bounded `authenticated_warranty_triage` truth.
- Warranty-triage truth is grounded only in authenticated persisted recent fulfilled-order and order-item data.
- Explicit order-number lookup is bounded to that same authenticated recent-order set.
- The resolver classifies into bounded states such as `LIKELY_ELIGIBLE`, `OUT_OF_POLICY`, `CANNOT_IDENTIFY_PRODUCT`, `NO_RELEVANT_ORDER`, and `AUTH_REQUIRED`.
- The lane remains strict read-only and message-only.
- Generic warranty-policy questions may still remain `POLICY_INQUIRY` when contextual authenticated triage is not the right lane.
- Catalog/product sales surfaces stay suppressed on these support turns.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim guest warranty access.
- This log does not claim RMA ticket creation.
- This log does not claim refunds.
- This log does not claim cancellations.
- This log does not claim order edits.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a full support desk / CRM / ticketing platform.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No storefront redesign from zero.
- No order mutation path.
- No full RMA workflow.
**Outcome:**
The storefront can now triage authenticated defect/warranty-style turns against recent real order truth more contextually while preserving honest degradation and bounded claims.

### Storefront Authenticated Loyalty & VIP Yielding - 3 de abril de 2026
**Scope:** Authenticated loyalty / VIP status assistance for the storefront only. No redemption, point mutation, or rewards-platform expansion.
**Problem Identified:** The storefront needed a bounded way to answer loyalty and VIP questions from grounded customer truth without inventing balances, tiers, or redemption behavior.
**Implementation / Audit Sequence:**
1. Existing authenticated customer, loyalty, stats, and settings truth was reviewed to confirm the lane could stay read-only and grounded in current store rules.
2. The accepted implementation added a bounded loyalty capsule path and a dedicated storefront loyalty-status resolver.
3. Existing storefront routing and assistant runtime were updated so authenticated loyalty / VIP turns prefer the loyalty capsule path instead of generic fallback behavior.
4. Guardrails preserved current-turn sovereignty, catalog suppression, and honest degradation for unauthenticated, zero-point, or no-loyalty-data cases.
5. Acceptance closed without adjacent drift into redemption, discount mutation, gamification, CRM, or admin tooling.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded authenticated loyalty / VIP awareness.
- `LOYALTY_SUPPORT` exists as a bounded non-catalog storefront intent.
- The capsule/runtime now carries bounded `authenticated_loyalty_status` and `loyalty_status_signal` truth.
- Loyalty truth is grounded only in existing authenticated storefront loyalty/customer sources already present in the system.
- Points balance, tier/status, monetary equivalent, and next-tier distance are surfaced only when grounded by existing store rules/configuration.
- The lane remains strict read-only and message-only.
- Guest/unauthenticated users do not get fake loyalty access.
- Zero-point and no-loyalty-data states degrade honestly.
- Catalog/product sales surfaces stay suppressed on loyalty turns.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim point redemption.
- This log does not claim point mutation.
- This log does not claim automatic discount application.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a rewards dashboard.
- This log does not claim a gamification engine.
- This log does not claim CRM expansion.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No storefront redesign from zero.
- No point mutation path.
- No rewards-platform expansion.
**Outcome:**
The storefront can now answer bounded authenticated loyalty and VIP questions from grounded customer truth while staying exact about what the system does not do.

### Storefront Contextual Out-of-Stock Pivot & Alternative Yielding - 3 de abril de 2026
**Scope:** Product-search and Stage 5 storefront recovery for out-of-stock turns only. No waitlist, notify-me, or recommender-platform expansion.
**Problem Identified:** The storefront needed one bounded way to recover high-intent turns when the requested item or variant was genuinely unavailable, without inventing substitutes or reopening inventory logic beyond current catalog truth.
**Implementation / Audit Sequence:**
1. The accepted product-search capsule and Stage 5 flow were reviewed to preserve existing in-stock and variant-truth discipline while adding bounded recovery for unavailable requests.
2. The accepted commit `537856a144854604c0b2170f99bc08cd37a47d12` (`feat storefront contextual oos pivot`) extended `src/lib/product-search-capsule.ts` so the lane can rank grounded in-stock alternatives from existing catalog metadata such as brand, flavor, model, type, section, and token overlap.
3. The same accepted commit updated the Stage 5 shaping path and focused regressions so missing-variant cases can route into `OUT_OF_STOCK_ALTERNATIVE` when grounded substitutes exist, while still surfacing through existing storefront message / next-step structures only.
4. Acceptance closed with honest degradation preserved: when no sufficiently grounded substitute exists, the lane returns `NO_MATCH` rather than pretending equivalence or availability.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded contextual out-of-stock pivoting toward in-stock alternatives.
- The lane reuses the existing product-search capsule / Stage 5 storefront flow.
- Pivoting only occurs when the requested item or requested variant is genuinely unavailable or out of stock.
- Suggested substitutes are grounded in existing catalog truth and currently purchasable in stock.
- Ranking remains bounded to close sibling signals already grounded in current metadata such as brand, flavor, model, type, section, and token overlap.
- Missing-variant cases may route into `OUT_OF_STOCK_ALTERNATIVE` when grounded substitutes exist.
- If no sufficiently grounded substitute exists, the lane degrades honestly to `NO_MATCH`.
- Existing in-stock paths and variant-truth discipline remain preserved.
- Stage 5 surfaces the pivot through existing storefront message / next-step structures only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim waitlist capture.
- This log does not claim notify-me flow.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim a broad recommendation-engine rewrite.
- This log does not claim guaranteed substitute availability beyond current in-stock catalog truth.
- This log does not claim semantic equivalence when only approximate similarity exists.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No storefront redesign from zero.
- No waitlist or notify-me path.
- No recommender-engine rewrite.
**Outcome:**
The storefront can now recover some high-intent out-of-stock turns into bounded in-stock alternatives while staying honest about availability, similarity, and unresolved cases.

### Storefront Conversational Basket Kitting & Hardware Upgrades - 3 de abril de 2026
**Scope:** Authenticated storefront kitting and hardware-upgrade assistance only. No bundle platform, bundle UI, or general setup engine expansion.
**Problem Identified:** The storefront needed one bounded way to turn explicit starter-kit and hardware-upgrade asks into a compatible in-stock basket without loosening stock or compatibility truth.
**Implementation / Audit Sequence:**
1. The accepted storefront catalog, compatibility, attachment, and Stage 5 shaping paths were reviewed to preserve grounded fit while adding a bounded kitting lane.
2. The accepted commit `a8e097118a1f97d95458840edec935255972dc7c` (`feat storefront conversational basket kitting`) extended the storefront capsule/runtime path with `KIT_ASSEMBLY`, `storefront_kitting_basket`, and a bounded kitting resolver.
3. The same accepted commit kept the surfaced outcome inside existing assistant message, next-step, and resolved-product surfaces only.
4. Acceptance closed with honest degradation preserved: when hardware, consumable, or liquid compatibility could not be grounded in current in-stock truth, the lane returned partial or no grounded kit rather than inventing fit.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded conversational basket kitting / hardware-upgrade assistance.
- `KIT_ASSEMBLY` now exists as a bounded storefront intent for explicit starter-kit, setup, switch-from-disposables, and hardware-upgrade style asks.
- The capsule/runtime now carries bounded `storefront_kitting_basket` truth for this lane.
- Kitting is grounded only in active in-stock catalog truth plus existing compatibility/attachment truth already present in the system.
- The resolver returns bounded states such as `FULL_KIT`, `PARTIAL_KIT`, and `NO_GROUNDED_KIT`.
- Hardware, consumable, and liquid compatibility stay grounded rather than semantic-only.
- The lane degrades honestly when one component cannot be grounded or stocked.
- The visible storefront outcome stays inside existing assistant message, next-step, and resolved-product surfaces only.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a new bundle/cart entity.
- This log does not claim bundle UI.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim schema migrations.
- This log does not claim checkout/payment redesign.
- This log does not claim CRM/profile expansion.
- This log does not claim broad "build anything" orchestration.
- This log does not claim guaranteed full-kit availability when catalog truth cannot support it.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No storefront redesign from zero.
- No bundle platform expansion.
- No generic setup-builder platform.
**Outcome:**
The storefront can now assemble bounded compatible in-stock starter baskets for explicit kit and hardware-upgrade requests while preserving grounded fit, stock truth, and honest degradation.

### Storefront Conversational Checkout Readiness & Friction Resolution - 4 de abril de 2026
**Scope:** Storefront checkout-readiness / close-now friction assistance only. No order creation, payment mutation, checkout execution, or shipping-quote invention.
**Problem Identified:** The storefront already had accepted catalog, cart, cart-audit, order-recovery, and post-purchase lanes, but it still lacked one bounded conversational path for the last-mile question: whether the customer can actually close the purchase right now and, if not, what the real blocker is. The remaining need was not checkout execution or payment execution. It was one strict read-only lane that could reuse current storefront truth instead of falling back to vague guidance.
**Implementation / Audit Sequence:**
1. The accepted implementation added one bounded `CHECKOUT_READINESS` storefront intent and one client capsule path `storefront_checkout_readiness` inside the existing runtime architecture.
2. The accepted implementation added a strict read-only checkout-readiness resolver that reuses existing storefront truth only: cart truth, checkout draft truth, payment settings truth, address truth, coupon validation truth, and authenticated open-order recovery truth.
3. The accepted implementation kept readiness classification bounded to explicit truthful states such as `READY_TO_CHECKOUT`, `MISSING_REQUIRED_INFO`, `CART_BLOCKER`, `PAYMENT_METHOD_INFO`, `SHIPPING_INFO_AVAILABLE`, `SHIPPING_INFO_PARTIAL`, and `AUTH_REQUIRED`.
4. The accepted implementation kept the lane message-only and non-catalog in the storefront assistant path, so checkout-readiness turns do not reopen product-card or browsing surfaces.
5. Acceptance closed cleanly as `ACCEPT` with no micro-fix required. The accepted lane remains read-only and bounded to readiness/clarity rather than checkout execution.
**Accepted Final Discipline:**
- One bounded storefront lane now exists for checkout-readiness / close-now friction.
- `CHECKOUT_READINESS` now exists as a bounded storefront intent and client capsule path.
- The resolver is strict read-only.
- The resolver reuses existing storefront truth only:
  - cart truth
  - checkout draft truth
  - payment settings truth
  - address truth
  - coupon validation truth
  - authenticated open-order recovery truth
- The lane stays bounded to readiness states such as `READY_TO_CHECKOUT`, `MISSING_REQUIRED_INFO`, `CART_BLOCKER`, `PAYMENT_METHOD_INFO`, `SHIPPING_INFO_AVAILABLE`, `SHIPPING_INFO_PARTIAL`, and `AUTH_REQUIRED`.
- Responses remain message-only and non-catalog.
- No exact shipping quote is invented when current storefront truth does not expose one.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim order creation.
- This log does not claim payment mutation.
- This log does not claim checkout execution.
- This log does not claim payment execution.
- This log does not claim invented exact shipping quotes.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim architecture reopening.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No checkout redesign from zero.
- No payment or order mutation path.
- No new planner/orchestrator layer.
- No CRM expansion.
**Outcome:**
The storefront can now answer bounded checkout-readiness, close-now friction, payment-method, and shipping-readiness turns from real storefront truth while staying exact about blockers, missing information, authenticated recovery requirements, and unsupported quote precision.

### Storefront Contextual Budget Rescue & Trade-Down Yielding - 4 de abril de 2026
**Scope:** Explicit price-friction and trade-down assistance only. No fake discounting, price mutation, or pricing-engine expansion.
**Problem Identified:** The storefront already had accepted product search, compatibility, cart-audit, promo, and cart-context lanes, but it still lacked one bounded conversational path for explicit cheaper-alternative turns. The remaining need was not dynamic discounting or a broad recommender rewrite. It was one strict read-only lane that could use current catalog truth and safe cart context to recover high-intent price-friction turns without inventing savings.
**Implementation / Audit Sequence:**
1. The accepted storefront product-search, promo, compatibility, stock, and optional single-cart-item truth paths were reviewed to preserve grounded fit and honest value truth while adding a bounded trade-down lane.
2. The accepted commit `ae2f5f7` (`feat storefront budget rescue trade down`) extended the storefront capsule/runtime path with `BUDGET_RESCUE`, `storefront_budget_rescue`, and a bounded trade-down resolver.
3. The same accepted commit kept the surfaced outcome inside existing assistant message, product-card, and next-step surfaces only.
4. Acceptance closed with honest degradation preserved: when no sufficiently grounded cheaper alternative exists, the lane returns `NO_GOOD_TRADE_DOWN` or `REVIEW_CURRENT_OPTION` rather than inventing discounting, equivalence, or savings.
**Accepted Final Discipline:**
- Césarín storefront now supports bounded explicit price-friction / cheaper-alternative turns.
- `BUDGET_RESCUE` now exists as a bounded storefront intent for explicit trade-down help.
- The lane uses a strict read-only trade-down resolver.
- The resolver reuses current catalog truth, stock truth, promo truth, and optional safe single-cart-item context only.
- The lane stays bounded to `CHEAPER_ALTERNATIVE_FOUND`, `PROMO_ALREADY_BEST_VALUE`, `NO_GOOD_TRADE_DOWN`, and `REVIEW_CURRENT_OPTION`.
- Responses remain message-only and use existing assistant message, product-card, and next-step surfaces only.
- The lane does not invent discounts, price mutation, or savings claims.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim fake discounting.
- This log does not claim price mutation.
- This log does not claim invented savings.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim checkout/payment redesign.
- This log does not claim dynamic discounting.
- This log does not claim a broad recommender rewrite.
**What Did Not Change:**
- No Cesarin OS/admin reopening.
- No prior storefront/core lane was reopened or replaced.
- No checkout/payment flow redesign was introduced.
- No pricing-engine platform was introduced.
- No dynamic discounting or cart price mutation path was introduced.
**Outcome:**
The storefront can now recover explicit price-friction turns with bounded grounded trade-down help while staying honest about value, availability, and unsupported savings claims.

### Storefront Conversational Compatibility & Fit Verification - 4 de abril de 2026
**Scope:** Explicit compatibility / fit verification only. No cart mutation, no order/payment mutation, and no broad external fit-intelligence expansion.
**Problem Identified:** The storefront already had accepted attachment, cart-audit, kitting, and product-search truth, but it still lacked one bounded conversational path for explicit fit questions such as whether a pod, coil, or accessory truly matches a given device. The remaining need was not a broader hardware-mechanics system, web lookup, or automatic cart mutation. It was one strict read-only lane that could use grounded catalog concept/relation truth and only safe unambiguous cart context to answer fit questions conservatively.
**Implementation / Audit Sequence:**
1. The accepted storefront catalog, compatibility, attachment, and cart-context truth paths were reviewed to preserve grounded fit while adding a bounded compatibility lane.
2. The accepted commit `713644bfb8535fa967f266f8991aa7367be5a396` (`feat storefront compatibility fit verification`) extended the storefront capsule/runtime path with `COMPATIBILITY_CHECK`, `storefront_compatibility_check`, and a bounded compatibility resolver.
3. The same accepted commit kept the surfaced outcome inside existing assistant message, product-card, and next-step surfaces only.
4. Acceptance closed with conservative degradation preserved: grounded `COMPATIBLE` and `INCOMPATIBLE` answers can surface when truth is real, while missing or ambiguous context returns `NEEDS_MORE_CONTEXT`, `NO_GROUNDED_MATCH`, or `REVIEW_PRODUCT` instead of inventing fit.
**Accepted Final Discipline:**
- Césarín storefront now supports one bounded storefront lane for explicit compatibility / fit verification.
- `COMPATIBILITY_CHECK` now exists as a bounded storefront intent and routes through `storefront_compatibility_check`.
- The client capsule/runtime now carries bounded compatibility truth for this lane.
- Compatibility resolution is strict read-only and grounded in catalog concept/relation truth already present in the system.
- Safe cart context may be used only when the anchor is unambiguous.
- The lane stays bounded to truthful states such as `COMPATIBLE`, `INCOMPATIBLE`, `NEEDS_MORE_CONTEXT`, `NO_GROUNDED_MATCH`, and `REVIEW_PRODUCT`.
- Responses remain message-only and use existing storefront surfaces only.
- The lane does not invent compatibility, cart mutations, or order/payment actions.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This lane does not claim cart mutation, order/payment mutation, invented compatibility, admin / Cesarin OS expansion, web lookup, broad external fit intelligence, automatic cart injection, or order actions.
**What Did Not Change:**
- Prior storefront/core lanes remain authoritative and non-reopened.
- This lane does not reopen Cesarin OS/admin lanes and does not convert Césarín into a broad hardware-mechanics or external fit-intelligence system.
**Outcome:**
The storefront can now answer explicit compatibility / fit turns through bounded grounded storefront truth while staying conservative about missing context, ungrounded fit, and unsupported claims.

### Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass - 4 de abril de 2026
**Scope:** Bounded runtime hygiene and deprecation cleanup only. No new storefront feature, no commercial behavior expansion, and no architecture reopening.
**Problem Identified:** The accepted runtime still carried one obsolete legacy residue around `get_store_policy` even after canonical policy handling had already converged elsewhere. Active capability, routing, telemetry, and dispatch surfaces still referenced the old name, and `supabase/functions/customer-intelligence/tools.ts` still physically contained a dead orphaned `get_store_policy` helper body after the dispatch path had already been removed. In parallel, overlap review confirmed that `src/services/storefront-cart-audit.service.ts` could not be safely deleted or merged into the canonized kitting lane within this bounded micro-pass without changing checkout behavior.
**Implementation / Audit Sequence:**
1. The accepted cleanup commit `571da0ec7c9b2bbf0bfafa03d7b9fe31a6168de8` (`chore deprecate legacy policy routing`) removed legacy `get_store_policy` residue from active capability, routing, telemetry, and dispatch surfaces.
2. The same accepted cleanup intentionally preserved `src/services/storefront-cart-audit.service.ts` after overlap review showed that forcing deletion or merge into the kitting lane would not be behavior-safe in this pass.
3. The accepted micro-fix commit `8ee9d4ce8e5b145dc42a0f238ffd300c2a9b0c42` (`chore remove dead get_store_policy helper`) then removed the dead orphaned `get_store_policy` helper block from `supabase/functions/customer-intelligence/tools.ts`.
4. Acceptance closed after the micro-fix with the cleanup fully bounded as hygiene only rather than a new storefront lane or behavior change.
**Accepted Final Discipline:**
- Legacy `get_store_policy` routing residue is now removed from active capability, routing, and dispatch surfaces.
- Policy handling now relies on canonical surviving paths rather than the removed legacy route.
- The dead orphaned `get_store_policy` helper block is removed from `supabase/functions/customer-intelligence/tools.ts`.
- `src/services/storefront-cart-audit.service.ts` was intentionally preserved because deleting or merging it was not safe within this micro-pass.
- No new storefront feature was introduced.
- `PRODUCT_SEARCH` remained untouched.
- Promotions and replenishment remained untouched.
- No admin drift or architecture reopening occurred.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim a new storefront lane.
- This log does not claim new commercial capability.
- This log does not claim `PRODUCT_SEARCH` changes.
- This log does not claim cart-audit redesign.
- This log does not claim promotions or replenishment changes.
- This log does not claim admin / Cesarin OS expansion.
- This log does not claim architecture reopening.
**What Did Not Change:**
- No storefront/customer-facing feature behavior was expanded.
- No accepted storefront lane was reopened or replaced.
- `src/services/storefront-cart-audit.service.ts` remained in place.
- Promotions and replenishment decorators remained untouched.
- `PRODUCT_SEARCH` remained untouched.
**Outcome:**
The accepted cleanup/deprecation micro-pass is now formally canonized as complete. Canonical policy handling no longer depends on the removed legacy `get_store_policy` route, the dead helper body is gone, and the cart-audit overlap was preserved rather than forced into unsafe deletion.

### Vector Pipeline 768d Alignment & PRODUCT_SEARCH Operational Hold - 5 de abril de 2026
**Scope:** Upstream data/search infrastructure only. No storefront conversational behavior change, no routing/UI change, and no reopened storefront lane.
**Problem Identified:**
`PRODUCT_SEARCH` had stopped being architecturally trustworthy because repo/runtime vector truth and the live target environment had drifted around embedding dimensionality. That structural blocker was corrected and accepted at `768d`, but live semantic retrieval still needed two separate truths to hold at once: the live DB had to actually be migrated to `768d`, and the canonical Gemini repopulation path then had to restore real embeddings. The first succeeded; the second did not complete because Gemini quota blocked repopulation.
**Implementation / Audit Sequence:**
1. **Repo/vector correction was accepted** - commit `c1136f156e292f35e585534a74a151bcbabfb470` (`fix down migrate vector pipeline to 768d`) aligned provider truth, replayable schema truth, RPC truth, and the forward migration path to one executable `768d` reality.
2. **Live environment convergence was then actually applied** - the accepted live migration file `supabase/migrations/20260404_vector_pipeline_down_migrate_to_768.sql` was executed against the target environment, and live verification confirmed `products.embedding = vector(768)`, `store_knowledge.embedding = vector(768)`, and `match_products(768d)` / `match_knowledge(768d)` no longer failing on dimension mismatch.
3. **Strict down-migration nulled incompatible stored vectors as designed** - after live migration, both embedding surfaces were structurally correct but empty: `products` moved to `44 active / 0 embedded`, and `store_knowledge` moved to `41 active / 0 embedded`.
4. **Canonical repopulation was attempted and failed quota-side** - the existing Gemini seed path was executed to repopulate live embeddings, but the canonical product embedding run failed with `429 RESOURCE_EXHAUSTED`. Because the same provider/quota path underpins the knowledge repopulation route, the repopulation effort did not complete.
5. **Final audit truth is operational hold, not architectural regression** - the blocker is now quota-only. The vector/search substrate is structurally corrected and live-migrated, but semantic retrieval remains unvalidated because live embeddings are still empty.
**Accepted Final Discipline:**
- The accepted `768d` vector-pipeline correction is real.
- The live target environment now matches `768d` schema/RPC truth.
- Repopulation did not complete because Gemini provider quota returned `429 RESOURCE_EXHAUSTED`.
- Live embeddings remain empty.
- `PRODUCT_SEARCH` remains unvalidated and operationally blocked.
- The current blocker is quota-only, not code, schema, RPC, routing, storefront UI, or storefront conversational logic.
- The correct current status is explicit operational hold until provider quota is available again.
- No new storefront lane was opened.
- No storefront conversational behavior was modified in this final state.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim `PRODUCT_SEARCH` is fixed, proven, or canon-closed.
- This log does not claim retrieval quality while embeddings remain empty.
- This log does not claim live semantic recovery proof.
- This log does not claim a new storefront lane.
- This log does not claim any reopened storefront AI lane.
**What Did Not Change:**
- No storefront conversational behavior was modified by this final operational-hold state.
- No `customer-intelligence` routing posture, stage shaping, or UI behavior changed in this canon entry.
- No Cesarin OS/admin lane was reopened.
**Outcome:**
The upstream vector/search architecture and the live target schema/RPC substrate are no longer the blocker. `PRODUCT_SEARCH` is now on explicit operational hold because provider quota prevented repopulation and left live embeddings empty, so semantic retrieval cannot yet be validated honestly.

### Bulk Operational Data Hydration & Telemetry Triage - 6 de abril de 2026
**Scope:** Non-coding operational data hydration and telemetry triage only. No storefront UI change, no routing change, no application logic change, no doc/canon change during the data pass, and no reopened storefront lane.
**Problem Identified:**
The storefront and Cesarin OS/admin architecture were already built, audited, and canonized, while `PRODUCT_SEARCH` remained on explicit operational hold due to Gemini provider quota. The highest-leverage available work was not code mutation. It was live data quality: sparse variant rows, sparse compatibility graph coverage, and untriaged `ai_analytics` interactions that could feed grounded improvement items.
**Implementation / Audit Sequence:**
1. The operational pass inspected the live product catalog, `product_variants`, `product_concepts`, `concept_aliases`, `compatibility_relations`, `ai_analytics`, `cesarin_improvement_items`, `store_knowledge`, and the local `graqle.json` artifact.
2. `graqle.json` was rejected as a commercial compatibility source for this pass because it represented a technical code graph, not grounded product-fit truth.
3. Product-variant hydration used only existing `products.sku`, `products.price`, `products.stock`, and `products.images` for active products lacking variant rows.
4. Compatibility hydration was limited to explicit `products.specs.conector` evidence for two products and the already existing `510 Connector` concept.
5. Telemetry triage created only representative high-signal improvement items from weak policy/knowledge responses, without inserting invented `store_knowledge` facts.
**Accepted Final Discipline:**
- This was a non-coding operational data hydration pass.
- Live `product_variants` increased by `+37`.
- Live `product_concepts` increased by `+2`.
- Live `concept_aliases` increased by `+4`.
- Live `compatibility_relations` increased by `+2`.
- Live `cesarin_improvement_items` increased by `+3`.
- Variant coverage is now materially stronger: active product variant coverage was validated as `44/44`.
- Telemetry triage yielded grounded improvement items for store-hours, shipping-policy retrieval, and payment-method policy retrieval.
- Compatibility coverage improved only slightly and remains sparse.
- No storefront logic, UI, routing, application code, embeddings/search infrastructure, or docs/canon files were changed during the data hydration pass.
- `PRODUCT_SEARCH` operational hold remains unchanged.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full compatibility completion.
- This log does not claim complete kitting/compatibility data coverage.
- This log does not claim `PRODUCT_SEARCH` is unblocked.
- This log does not claim semantic retrieval quality.
- This log does not claim any new storefront lane or reopened storefront AI lane.
- This log does not claim Cesarin OS/admin implementation expansion.
**What Did Not Change:**
- No storefront UI changed.
- No `customer-intelligence` routing, stage shaping, or application logic changed.
- No runtime code changed.
- No embeddings/search infrastructure changed.
- `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings.
**Outcome:**
The accepted operational pass materially improved live data usefulness through grounded variant coverage, two explicit 510 connector compatibility relations, and three telemetry-derived improvement items, while preserving the sparse-compatibility residual and leaving `PRODUCT_SEARCH` hold status unchanged.

### Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized) - 8 de abril de 2026
**Scope:** Non-coding live compatibility graph hydration only. Telemetry-prioritized, bounded compatibility data mutation against existing compatibility/concepts tables. No storefront UI change, no routing change, no application logic change, no embeddings/search change, and no reopened storefront lane.
**Problem Identified:**
The earlier operational hydration pass improved live compatibility truth only narrowly, and the compatibility graph remained materially sparse for real storefront fit / kitting / attachment flows. The next useful move was not broad autonomous graph ingestion. It was one second bounded batch focused on the highest-friction compatibility families visible in telemetry and safely grounded by explicit live product truth.
**Implementation / Audit Sequence:**
1. The accepted pass inspected live `ai_analytics`, `products`, `product_concepts`, `concept_aliases`, and `compatibility_relations`, plus the already accepted compatibility schema truth.
2. Priority selection was telemetry-led: recent live queries showed repeated fit-style demand around `le queda`, `coil`, `pod`, `kit`, connector, and battery-adjacent phrasing, so the pass targeted those high-friction catalog areas instead of blind graph expansion.
3. `graqle.json` was inspected again but rejected as a commercial compatibility source because it remained a technical code graph, not grounded catalog fit truth.
4. Hydration stayed bounded to explicit product evidence only: direct mentions of `batería 18650`, `batería integrada`, `cartuchos`, `pods propietarios`, and `conexión 510 híbrida` found in live product descriptions / tags / specs.
5. The pass inserted only `specific_model` + `confirmed_compatible` relations, avoided duplicates, and skipped speculative coil / third-party pod / broader liquid-family extrapolations where the live catalog did not provide safe exact grounding.
**Accepted Final Discipline:**
- This was a non-coding compatibility graph hydration pass.
- The pass was telemetry-prioritized rather than blind bulk ingestion.
- Live `product_concepts` increased by `+3`.
- Live `concept_aliases` increased by `+6`.
- Live `compatibility_relations` increased by `+9`.
- Inserted relation families were bounded to `uses_battery = 5`, `uses_pod = 3`, and `has_connector = 1`.
- The pass added grounded specific-model battery / pod / connector truth for seeded products only.
- Compatibility coverage improved materially for those seeded items.
- No storefront logic, UI, routing, application code, embeddings/search infrastructure, or docs/canon files were changed during the hydration pass itself.
- `PRODUCT_SEARCH` operational hold remains unchanged.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full compatibility completion.
- This log does not claim full kitting readiness.
- This log does not claim exact coil resolution where the live catalog still lacks safe product-specific coil truth.
- This log does not claim third-party pod fit coverage beyond the grounded seeded items.
- This log does not claim any new storefront lane or reopened storefront AI lane.
- This log does not claim Cesarin OS/admin implementation expansion.
- This log does not claim that `PRODUCT_SEARCH` changed or unblocked.
**What Did Not Change:**
- No storefront UI changed.
- No `customer-intelligence` routing, stage shaping, or application logic changed.
- No runtime code changed.
- No embeddings/search infrastructure changed.
- `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings.
**Outcome:**
The accepted Batch 2 pass materially expanded live compatibility truth through telemetry-prioritized, grounded battery / pod / connector relations for specific seeded products, while keeping the sparse-graph residual explicit and leaving `PRODUCT_SEARCH` hold status unchanged.

### Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized) - 8 de abril de 2026
**Scope:** Non-coding live compatibility graph hydration only. Telemetry-prioritized, bounded compatibility data mutation against existing compatibility/concepts tables. No storefront UI change, no routing change, no application logic change, no embeddings/search change, and no reopened storefront lane.
**Problem Identified:**
After Batch 2, compatibility truth was materially stronger for some seeded battery / pod / connector items, but the graph still lacked grounded device-to-liquid specificity on high-value storefront cases. The next useful move was not broad graph completion. It was one bounded telemetry-prioritized batch that could instantiate already confirmed device-to-liquid compatibility into concrete liquid products where the target liquid truth was explicit in the live catalog.
**Implementation / Audit Sequence:**
1. The accepted pass inspected live `ai_analytics`, `products`, `product_concepts`, `concept_aliases`, and `compatibility_relations` to identify the next highest-value compatibility gap after Batch 2.
2. Priority selection stayed telemetry-led: the remaining useful signal was not safe exact coil fit or third-party pod fit, but repeated mixed device + liquid queries that could benefit from stronger grounded kitting truth.
3. Hydration stayed bounded to concrete device -> liquid-product relations only when both sides were safely grounded:
   - the source device already had confirmed `recommended_for_liquid` truth to `Nic Salts` or `Freebase`
   - the target liquid product explicitly declared that same liquid type in live tags and/or description
4. The pass created product-backed liquid concepts only for the selected liquid products and inserted only `specific_model` + `confirmed_compatible` relations.
5. Exact coil-fit, third-party pod-fit, and broader speculative liquid extrapolations were skipped because the live catalog still lacked safe product-specific grounding for those cases.
**Accepted Final Discipline:**
- This was a non-coding compatibility graph hydration pass.
- The pass was telemetry-prioritized rather than blind bulk ingestion.
- Live `product_concepts` increased by `+4`.
- Live `concept_aliases` increased by `+8`.
- Live `compatibility_relations` increased by `+4`.
- The inserted relation family was bounded to `recommended_for_liquid = 4`.
- The pass added grounded device -> liquid-product compatibility truth for specific seeded items only.
- Compatibility coverage improved materially for those seeded device-to-liquid cases.
- No storefront logic, UI, routing, application code, embeddings/search infrastructure, or docs/canon files were changed during the hydration pass itself.
- `PRODUCT_SEARCH` operational hold remains unchanged.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim full compatibility completion.
- This log does not claim full kitting readiness.
- This log does not claim exact coil truth where the live catalog still lacks safe product-specific grounding.
- This log does not claim third-party pod fit coverage.
- This log does not claim broad liquid-family completion beyond the grounded seeded items.
- This log does not claim any new storefront lane or reopened storefront AI lane.
- This log does not claim Cesarin OS/admin implementation expansion.
- This log does not claim that `PRODUCT_SEARCH` changed or unblocked.
**What Did Not Change:**
- No storefront UI changed.
- No `customer-intelligence` routing, stage shaping, or application logic changed.
- No runtime code changed.
- No embeddings/search infrastructure changed.
- `PRODUCT_SEARCH` remains on explicit operational hold due to Gemini provider quota and empty embeddings.
**Outcome:**
The accepted Batch 3 pass materially expanded live compatibility truth through telemetry-prioritized, grounded device -> liquid-product compatibility for specific seeded products, while keeping the sparse-graph residual explicit and leaving `PRODUCT_SEARCH` hold status unchanged.

### Phase Completion & Quota Escalation Waiting State - 8 de abril de 2026
**Scope:** Canonical project-status reconciliation only. No storefront behavior change, no Cesarin OS/admin implementation change, no routing/UI change, no data mutation, and no reopened lane.
**Problem Identified:**
After the accepted vector correction, accepted live `768d` migration, accepted operational-hold classification, and accepted non-coding hydration passes, the project no longer had an honest active coding or data-hydration front inside the current storefront / Cesarin OS scope. Compatibility Batch 1-3 had already consumed the remaining grounded compatibility opportunities available from present signals, and policy / `store_knowledge` textual coverage was effectively saturated while semantic activation remained blocked by empty embeddings. Continuing to imply an active implementation lane would have been untruthful.
**Implementation / Audit Sequence:**
1. The accepted storefront and Cesarin OS/admin coding lanes were already closed and canonized before this reconciliation.
2. The accepted vector/search correction removed the architectural blocker, but canonical repopulation remained blocked by Gemini `429 RESOURCE_EXHAUSTED`, leaving live embeddings empty and `PRODUCT_SEARCH` on explicit operational hold.
3. The accepted non-coding operational fronts were then exhausted legitimately:
   - compatibility hydration advanced through Batch 1, Batch 2, and Batch 3
   - telemetry triage produced the remaining grounded improvement items
   - policy / `store_knowledge` textual coverage reached practical saturation under current source truth
4. No further retries, fake data fronts, or new coding lanes were justified without either provider quota recovery or an explicit strategic pivot outside the current project front.
**Accepted Final Discipline:**
- All currently available grounded non-coding fronts have been exhausted or are legitimately paused.
- Compatibility hydration is paused due signal exhaustion, not neglect.
- Policy / `store_knowledge` textual coverage is effectively saturated under current source truth.
- Semantic activation of that knowledge remains blocked because live embeddings are empty.
- `PRODUCT_SEARCH` remains on explicit operational hold solely due Gemini quota exhaustion.
- No honest coding lane remains open in storefront or Cesarin OS/admin under current project scope.
- The project is now in a phase-complete / quota-escalation waiting state.
- The correct next move requires provider quota recovery, a provider-tier upgrade, or an explicit strategic pivot outside this current front.
**Residual Truth Safeguards / Explicit Non-Claims:**
- This log does not claim project closure.
- This log does not claim `PRODUCT_SEARCH` is fixed, live-proven, or ready.
- This log does not claim compatibility completion.
- This log does not claim embeddings are repopulated.
- This log does not claim that no future work exists after quota recovery or a strategic pivot.
**What Did Not Change:**
- No storefront UI changed.
- No `customer-intelligence` routing, stage shaping, or application logic changed.
- No runtime code changed.
- No embeddings/search infrastructure changed.
- No Cesarin OS/admin implementation lane was reopened.
**Outcome:**
The project is now canonically reconciled into a truthful phase-complete state under current constraints: storefront and Cesarin OS/admin fronts are converged, non-coding hydration fronts are exhausted or paused legitimately, and the only live blocker still standing is Gemini provider quota on embedding repopulation.

## Issues Diferidos Vigentes

> Estos issues estÃ¡n abiertos. Ver AI_CONTEXT.md Â§10 para la lista actual.

*Ãšltima actualizaciÃ³n: 4 de abril de 2026 (Storefront Conversational Checkout Readiness & Friction Resolution - ACCEPT)*
*Ãšltima actualizaciÃ³n: 4 de abril de 2026 (Storefront Contextual Budget Rescue & Trade-Down Yielding - ACCEPT)*
*Ãšltima actualizaciÃ³n: 4 de abril de 2026 (Storefront Conversational Compatibility & Fit Verification - ACCEPT)*
*Ãšltima actualizaciÃ³n: 4 de abril de 2026 (Customer-Intelligence Legacy Policy Routing Cleanup Micro-Pass - ACCEPT)*
*Ãšltima actualizaciÃ³n: 5 de abril de 2026 (Vector Pipeline 768d Alignment & PRODUCT_SEARCH Operational Hold - ACCEPTED / OPERATIONAL HOLD)*
*Ãšltima actualizaciÃ³n: 6 de abril de 2026 (Bulk Operational Data Hydration & Telemetry Triage - ACCEPT WITH MINOR RESIDUAL)*
*Ãšltima actualizaciÃ³n: 8 de abril de 2026 (Compatibility Graph Hydration Batch 2 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL)*
*Ãšltima actualizaciÃ³n: 8 de abril de 2026 (Compatibility Graph Hydration Batch 3 (Telemetry-Prioritized) - ACCEPT WITH MINOR RESIDUAL)*
*Ãšltima actualizaciÃ³n: 8 de abril de 2026 (Phase Completion & Quota Escalation Waiting State - RECONCILED)*


## [A58] AI PLATFORM RELIABILITY & RETRIEVAL ACTIVATION — PRODUCT_SEARCH HOLD-LIFT
**Date:** April 12, 2026
**Phase:** Post-Wave 1 Gemini Runtime Modernization
**Component Affected:** PRODUCT_SEARCH Retrieval Path

**Mission Objective:** Re-audit retrieval quality on the live public query-embedding path following the 3072d->768d parity fix and downstream fallback micro-fixes, and reconcile the explicit operational hold status.

**Checks Performed:**
- Validated semantic matches using the restored 768d query path against fully populated (0 null) vector substrates.
- Confirmed parity fix allowed match_products execution without dimension rejection.
- Validated downstream quality micro-fixes in product-search-capsule.ts:
  1. **Exact-ish hits:** Correctly execute before 	ool_args.is_ambiguous overrides them.
  2. **Token-Recovery Noise:** Ambiguous queries parsing 0 semantic similarity fall gracefully backward to NO_MATCH honesty instead of fabricating featured fallback cards.

**Observed Results:**
- Exact-ish queries now surface grounded attribute-led hits correctly.
- Exploratory queries remain commercially useful.
- Weak/noisy or zero-signal queries degrade accurately with honest failure signals.
- Residual cross-class looseness in extremely broad phrasing remains, but doesn'	 block foundational hold-lift.

**Verdict:** READY FOR LIFT. The structural, infrastructure, and fallback downstream blockers are officially closed without reopening a full storefront UI feature lane. Parity and repopulation completely successful.

**Remediation Applied:** Documented the hold-lift within AI_CONTEXT.md and reconciled the status. No further UI/code changes built. Project is free from the 429/403 provider blockages.

*Última actualización: 17 de abril de 2026 (Cesarin OS Governed Operator Queue Convergence - ACCEPT).*
*Última actualización: 21 de abril de 2026 (Conversational Conversion Intelligence - Phase 1 Measurement-to-Decision Readout - ACCEPT WITH EXPLICIT RESIDUAL RISK).*
*Última actualización: 22 de abril de 2026 (Conversational Conversion Intelligence - Probe Readout Filter - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 22 de abril de 2026 (Césarín Storefront Grounded Capsule Message Coherence Fix - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 23 de abril de 2026 (Cesarin OS Operator Consolidation Phase 1 - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 23 de abril de 2026 (Cesarin OS Operator UX Truthfulness Reduction - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 25 de abril de 2026 (AdminCesarinOS Navigation Rationalization - ACCEPT).*
*Última actualización: 28 de abril de 2026 (Storefront Image Fallback Localization - ACCEPT).*
*Última actualización: 29 de abril de 2026 (Home Featured Category Route/Content Integrity - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 29 de abril de 2026 (Offers/Deals Consistency - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 29 de abril de 2026 (Search Expectation Alignment - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 1 de mayo de 2026 (Post-Hero / PDP Shipping Trust Copy Coherence - ACCEPT WITH MINOR RESIDUAL RISK).*
*Última actualización: 1 de mayo de 2026 (Desktop Storefront Navigation Route Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (Product Card Cover Image Fallback Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (PDP Recommendation Section Visibility Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (PDP Duplicate Trust Badge Section Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (Section Root Category Chip Descendant Filtering Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (Quick View Cover Image Fallback Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (PDP / Quick View Urgency Truthfulness Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (PDP / Quick View Purchase Option Copy Accent Coherence - ACCEPT).*
*Última actualización: 2 de mayo de 2026 (Category Filter Empty-State Clear Recovery Coherence - ACCEPT).*
*Última actualización: 28 de abril de 2026 (AI Concierge Response Compaction Fix - ACCEPT).*
*Última actualización: 29 de abril de 2026 (Micro-Input Recovery Copy Fix - ACCEPT / BROWSER VALIDATED).*
*Última actualización: 2 de mayo de 2026 (Slice 16 - Quick View Shipping Trust & Urgency Coherence - ACCEPT).*
  - Implementation commit: `af76f897aa70fd4464df82fbfeda3e6c850e6624` (pushed).
  - Scope: only `src/components/products/QuickViewModal.tsx` was modified.
  - DHL trust cue: Built `Envío DHL Seguro` & `A todo México` replicating the accepted `ProductPriceSection.tsx` pattern exactly.
  - Non-Claims/Blocked Claims: No free shipping, local delivery, pickup, delivery-speed promises, zones, or personal delivery introduced. No component changes to `ProductPriceSection.tsx`, `ProductInfo.tsx`, or `UrgencyIndicators.tsx`. No backend, UI, DB, or AI overclaims.
  - Stock Oracle parity: Attached `useInventoryOracle` and `StockOracleBadge` wired strictly via `product.id` and `product.stock`, prepended directly above untouched `UrgencyIndicators`.
  - Preserved State: Slices 12, 13, and 14 conventions untouched. Modal image bounds, cart flows, pricing render, and wishlist behaviors structurally pristine.
  - Residual Risk: Low and accepted. No browser visual QA run; vertical addition may increase viewport scroll; expected small `useInventoryOracle` load state triggers safely upon Quick View activation without regression.

*Última actualización: 3 de mayo de 2026 (Slice 18 - Storefront Merchandising Routes & Variant Label Coherence Pass - ACCEPT).*
  - Process Deviation: Implementation initially pushed with encoding corruption (`4704c5d8cc`); fixed by local corrective patch (`cef8ad253d`) under containment mandate prior to canon.
  - Scope: `src/components/products/ProductActions.tsx`, `src/pages/BestsellersPage.tsx`, `src/pages/OffersPage.tsx`, `src/pages/NewArrivals.tsx`.
  - Scope preserved: `ProductGrid.tsx`, `QuickViewModal.tsx`, sorting library, hooks, API, Product Search, DB.
  - Logic Update: Unified `ProductActions` variant strings to `getVariantDisplayName()`; expanded merchandising discovery routes to use existing `ProductGrid` rendering and existing `SORT_OPTIONS`/`sortProducts` sorting behavior.
  - Visual Update (Patch): Removed visible UTF-8 replacement-character artifacts; validated `Más Vendidos`, `Top 50 Histórico`, `Sección Ofertas`, `Últimas 2 Semanas`, and canonical `OffersPage` SEO description via static/browser QA.
  - Non-Claims: no Product Search changes, no AI/Césarín changes, no checkout/payment/provider changes, no admin/Cesarin OS changes, no DB/Supabase changes, no migrations, no backend/service changes, no deploy, no full Product Discovery completion claim, no new ranking logic, no promotions/coupons/flash-deals architecture, no new arrivals data system, no data source/query changes, no `ProductGrid` changes, no `QuickViewModal` changes, no domain helper changes, no sorting library changes, no browser QA beyond `/mas-vendidos`, `/ofertas`, `/nuevo`, and any explicitly reported PDP variant evidence.

*Última actualización: 4 de mayo de 2026 (Storefront Product Discovery and Merchandising Coherence Closeout - GO, CLOSED).*
  - Closeout Decision: Codex readiness audit returned GO for formal closeout after Slices 1–18; no high-ROI customer-visible blocker remains on the audited discovery/merchandising surfaces.
  - Closeout Baseline: `cc13265674751a95c8e565dab99f6c30f118f8f5` is synchronized on `origin/main`.
  - Closed Surface Coverage: Home featured category routes/content, Offers/deals consistency, broad search expectation alignment, Hero Acapulco/DHL truth, post-hero/PDP shipping trust copy, desktop navigation route coherence, ProductCard image fallback, PDP recommendation section gating, broad search accent copy, PDP duplicate trust badges, section root category descendant filtering, Quick View image fallback, PDP/Quick View urgency truthfulness, PDP/Quick View purchase option accent copy, category filter empty-state recovery, Quick View shipping/trust cue, storefront grid discovery context, and merchandising routes plus PDP variant label coherence.
  - Residual (Accepted, Non-Blocking): Footer “Nuevos Drops” links to `/vape` instead of `/nuevo`; not fixed in this closeout and may be handled later as an optional standalone micro-fix.
  - Non-Claims: no Product Search completion, no semantic/vector search completion, no embeddings/retrieval/ranking validation, no Césarín runtime/persona changes, no checkout/payment/provider changes, no admin/Cesarin OS changes, no DB/Supabase/schema/migration changes, no backend/API architecture changes, no production deployment, no remote Supabase mutation, no full ecommerce/business completion, no coupons/promotions architecture, no claim that every copy issue is fixed, no claim that every merchandising edge case is solved, no Footer “Nuevos Drops” fix, no browser QA for every closed slice beyond recorded evidence, no future-proof completeness.
  - Closure Guardrail: This front should not be reopened unless Carlos explicitly authorizes a new storefront discovery lane.

*Última actualización: 5 de mayo de 2026 (Authenticated Transfer Checkout Smoke / Canon Reconciliation - GO).*
  - **Context:** A production schema drift blocker (orders.tracking_number missing) was manually repaired prior to this validation. Reran strict browser smoke test securely against https://vsm-store.pages.dev/.
  - **Flow:** Authenticated user -> Add Juicee Apple to cart -> Checkout -> Fill arbitrary test data -> Local pickup / Recoger -> Transferencia / Depósito -> Confirmar Pedido.
  - **Outcome:** checkout-submit returned 200 OK. Redirected correctly to /payment/success?order_id=8bdb0f4f-e0d7-4ed4-a427-6460ba0c2c6a.
  - **Evidence:** Order UUID: 8bdb0f4f-e0d7-4ed4-a427-6460ba0c2c6a, Shortcode: VSM-0038, Status: PENDIENTE, Payment Status: PENDIENTE. Item successfully recorded (JUICEE APPLE x2, Subtotal: $400.00).
  - **System State:** Production schema reconciliation (5 checkout columns + order_items table) applied prior to this validation. The /orders page loaded successfully with the target test order. Guest checkout design persists unmodified (WhatsApp handoff, no DB entry).
  - **Explicit Non-claims:** 
    - Does NOT claim Mercado Pago works.
    - Does NOT claim real payment settlement works.
    - Does NOT claim webhook production delivery works.
    - Does NOT claim guest checkout creates system orders.
    - Does NOT claim final commercial domain is connected.
    - Does NOT claim every checkout edge case, shipping/delivery variants or every auth scenario is validated.
    - Does NOT claim production payment provider readiness is complete.
    - Does NOT claim refunds/cancellations/admin fulfillment are validated.
    - Does NOT claim Product Discovery was reopened / Search / Césarín / Admin were changed.
    - Does NOT claim new schema changes were made during this canon pass.

*Última actualización: 5 de mayo de 2026 (Mercado Pago Sandbox Handoff Smoke / Canon Reconciliation - GO/PARTIAL).*
  - **Context:** Executed authenticated checkout targeting Mercado Pago on https://vsm-store.pages.dev/.
  - **Flow:** Authenticated user -> Add Juicee Apple to cart -> Checkout -> Fill arbitrary test data -> Local pickup / Recoger -> Tarjeta (Mercado Pago).
  - **Outcome (GO):** checkout-submit created DB order before redirect. Redirect successfully reached https://www.mercadopago.com.mx/checkout/v1/payment/redirect/... resolving the sandbox/test mode ("Estás en el entorno de pruebas"). Return path "Volver a la tienda" safely resolved to /payment/failure and accurately handled the pending fallback state on the storefront ("Pago iniciado, pendiente de confirmacion. Tu pedido ya fue creado...").
  - **Outcome (PARTIAL):** Sandbox payment was not finalized in headless Playwright; therefore, no approved payment webhook, paid/processing status update, or settlement was validated.
  - **Evidence:** Order UUID: b360b90e-e117-4841-9cbe-0299c5b60574, Shortcode: VSM-0039, Preference ID: 3287776681-8934139c-24d0-4d1d-ba2e-afce3bc04f92, Status: Pendiente.
  - **System State:** Order ledger (/orders) and detail views continued functioning predictably without schema crash. Authenticated Transferencia/Depósito checkout GO remains valid. Guest checkout remains WhatsApp-only/no system order.
  - **Explicit Non-claims:** 
    - Does NOT claim Mercado Pago approved payment works, payment settlement works, or webhook approved-payment delivery works.
    - Does NOT claim real payment was run or paid/processing status update was validated.
    - Does NOT claim production payment provider readiness is complete or final commercial domain is connected.
    - Does NOT claim every MP or checkout edge case is solved or refunds/admin fulfillment are validated.
    - Does NOT claim guest checkout creates system orders.
    - Does NOT claim Product Discovery was reopened / Search, Césarín, or Admin changed.
    - Does NOT claim schema changes were made during this canon pass.

*Última actualización: 5 de mayo de 2026 (Admin Orders Read-Only Visibility Smoke / Canon Reconciliation - GO).*
  - **Context:** Executed admin visibility read-only smoke on https://vsm-store.pages.dev/.
  - **Flow:** Provisioned dedicated admin test account (`test-admin-vsm@example.com`) on Supabase project `cvvlorbiwtuhkxolhfie` -> Auth -> Navigate to `/admin/orders` -> Verify list -> Open Order Detail Drawer.
  - **Outcome (GO):** Admin auth succeeded. `/admin/orders` loaded successfully. Route did not reject authenticated/admin access. No fatal runtime or PostgREST/schema crash observed. Orders ledger/list surface rendered successfully.
  - **Evidence:** Test orders `VSM-0038` and `VSM-0039` found in the list. Order detail drawer opened and data rendered read-only. Password/secrets were not printed. No order/payment/tracking/refund/cancel mutation was performed.
  - **Explicit Non-claims:** 
    - Does NOT claim order status mutation, payment status mutation, tracking number mutation, cancellation flow, or refund flow works.
    - Does NOT claim Mercado Pago refund API works or admin fulfillment is fully validated.
    - Does NOT claim all admin routes, roles, or permissions are validated.
    - Does NOT claim production payment provider readiness is complete or final commercial domain is connected.
    - Does NOT claim Product Discovery was reopened.
    - Does NOT claim Product Search, Césarín, Checkout, or DB schema changed during this canon pass.
    - Does NOT claim any credentials were printed or committed.

*Última actualización: 5 de mayo de 2026 (Admin Tracking Mutation Smoke / Canon Reconciliation - GO).*
  - **Context:** Executed one bounded admin fulfillment mutation smoke on https://vsm-store.pages.dev/.
  - **Flow:** Existing authenticated admin session -> `/admin/orders` -> locate `VSM-0039` (`#B60574`) -> open detail drawer -> `Rastreo / Guía` edit control -> set exact tracking value `TEST-TRACKING-SMOKE-123` -> save tracking only -> refresh -> reopen `VSM-0039`.
  - **Outcome (GO):** Tracking/guide mutation succeeded and persisted after full refresh. This is the first validated admin fulfillment mutation and was tracking-only.
  - **Evidence:** Target order `VSM-0039` (`#B60574`) accepted `TEST-TRACKING-SMOKE-123`; UI showed saved value in the drawer; value remained present after refresh/reopen. `order_status` stayed `pending` before/after. `payment_status` stayed `Mercadopago (Pendiente)` before/after.
  - **Baseline Retention:** Tracking value `TEST-TRACKING-SMOKE-123` remains intentionally as baseline proof unless Carlos authorizes a later cleanup lane.
  - **Explicit Non-claims:**
    - Does NOT claim order status mutation works.
    - Does NOT claim payment status mutation works.
    - Does NOT claim cancellation flow works.
    - Does NOT claim refund flow works.
    - Does NOT claim Mercado Pago refund API works.
    - Does NOT claim Mercado Pago webhook approved-payment works.
    - Does NOT claim payment settlement works.
    - Does NOT claim admin fulfillment is fully validated.
    - Does NOT claim all admin mutations are validated.
    - Does NOT claim all admin routes, roles, or permissions are validated.
    - Does NOT claim production payment readiness is complete.
    - Does NOT claim final commercial domain is connected.
    - Does NOT claim Product Discovery was reopened.
    - Does NOT claim Product Search, Césarín, Checkout, Payment, Mercado Pago, webhook, or DB schema changed during this canon pass.
    - Does NOT claim tracking was reverted or cleaned up.

*Última actualización: 5 de mayo de 2026 (Admin Order Status Mutation Smoke / Canon Reconciliation - GO).*
  - **Context:** Executed one bounded admin order_status mutation smoke on https://vsm-store.pages.dev/.
  - **Flow:** Existing authenticated admin session -> `/admin/orders` -> locate `VSM-0038` (`#0C2C6A`) -> open detail drawer -> verify `pending` / `Transferencia (Pendiente)` -> change only order_status to `Confirmado` -> save -> refresh -> reopen `VSM-0038`.
  - **Outcome (GO):** The safe first order_status transition `pending -> confirmed` succeeded and persisted after refresh. The UI showed the status update toast and the row label changed accordingly.
  - **Evidence:** Target order `VSM-0038` (`#0C2C6A`) changed from `pending` / `Pendiente` to `confirmed` / `Confirmado`. `payment_status` remained `Transferencia (Pendiente)` before and after and did not become `paid` / `Pagado`. `VSM-0039` (`#B60574`) remained untouched and pending.
  - **Scope Note:** This validates only the safe first transition `pending -> confirmed` and does not extend to later order-status paths.
  - **Explicit Non-claims:**
    - Does NOT claim `processing`, `shipped`, or `delivered` transitions work.
    - Does NOT claim payment_status mutation works.
    - Does NOT claim payment automation is safe for later statuses.
    - Does NOT claim cancellation flow works.
    - Does NOT claim refund flow works.
    - Does NOT claim Mercado Pago refund API works.
    - Does NOT claim Mercado Pago webhook approved-payment works.
    - Does NOT claim payment settlement works.
    - Does NOT claim full admin fulfillment is validated.
    - Does NOT claim all admin mutations are validated.
    - Does NOT claim all order status transitions are validated.
    - Does NOT claim all admin routes are validated.
    - Does NOT claim all roles/permissions are validated.
    - Does NOT claim production payment readiness is complete.
    - Does NOT claim final commercial domain is connected.
    - Does NOT claim Product Discovery was reopened.
    - Does NOT claim Product Search, Césarín, Checkout, Payment, Mercado Pago, webhook, or DB schema changed during this canon pass.
    - Does NOT claim `VSM-0038` was reverted to pending.

*Ultima actualizacion: 6 de mayo de 2026 (Admin Payment Status Mutation Readiness / Canon Reconciliation - NOT_READY_LEDGER_CONTAMINATION_RISK).*
  - **Context:** Documentation/source/canon readiness reconciliation only after Admin Order Status Mutation GO. No admin browser action, order mutation, payment mutation, tracking mutation, checkout, Mercado Pago call, webhook test, refund/cancel action, DB change, or code change was executed.
  - **Outcome:** Admin payment_status mutation is deferred with verdict `NOT_READY_LEDGER_CONTAMINATION_RISK`.
  - **Source Evidence:** Admin order detail drawer exposes `[Confirmar Pago]` when `payment_status` is not `paid`; that UI path calls `onPaymentStatusChange(order.id, 'paid')`; `useAdminOrders.ts` routes the action to `updateOrderPaymentStatus(id, status)`; `admin-orders.service.ts` updates Supabase directly with `orders.payment_status = paymentStatus` and `updated_at`.
  - **Provider Boundary:** The admin payment_status mutation path does NOT call an Edge Function and does NOT call Mercado Pago. Mercado Pago webhook remains the separate provider-event truth path for `mp_payment_id`, `mp_payment_data`, `payment_status`, and order status changes.
  - **Ledger Risk:** Source/canon inspection found DB trigger `tr_order_paid_referral` in `supabase/migrations/20260308000100_loyalty_referrals.sql`. That trigger can fire when `NEW.payment_status = 'paid'` and old payment_status was not paid, can call `process_referral_reward(...)`, and can insert loyalty/referral ledger rows. Therefore admin `[Confirmar Pago]` is not proven payment-status-only.
  - **Current Test Order Integrity:** `VSM-0038` (`#0C2C6A`) remains the only plausible future manual Transferencia candidate, but remains `confirmed` / `Transferencia (Pendiente)` in canon and was NOT marked paid. `VSM-0039` (`#B60574`) remains untouched and reserved for Mercado Pago webhook/payment validation; it remains `pending` / `Mercadopago (Pendiente)` with tracking baseline `TEST-TRACKING-SMOKE-123`.
  - **Future Authorization Requirement:** Any future manual Transferencia payment_status smoke requires explicit Carlos authorization accepting the irreversible admin UI state and possible ledger/referral/loyalty side effects, or a safer isolated test path must exist first.
  - **Explicit Non-claims:**
    - Does NOT claim payment_status mutation works.
    - Does NOT claim payment_status mutation is safe.
    - Does NOT claim `[Confirmar Pago]` is side-effect-free.
    - Does NOT claim Mercado Pago approved payment works.
    - Does NOT claim Mercado Pago webhook approved-payment works.
    - Does NOT claim payment settlement works.
    - Does NOT claim Mercado Pago refund API works.
    - Does NOT claim referral/loyalty side effects were tested.
    - Does NOT claim `VSM-0038` was marked paid.
    - Does NOT claim `VSM-0039` was touched.
    - Does NOT claim refund/cancel flow works.
    - Does NOT claim full admin fulfillment is validated.
    - Does NOT claim production payment readiness is complete.
    - Does NOT claim final commercial domain is connected.
    - Does NOT claim Product Discovery was reopened.
    - Does NOT claim Product Search, Cesarin, Checkout, Payment, Mercado Pago, webhook, or DB schema changed during this canon pass.

*Ultima actualizacion: 6 de mayo de 2026 (Mercado Pago Historical Approved-Payment Provider-Payload Verification - ACCEPTED).*
  - **Context:** Codex read-only historical verification of MP approved-payment persistence.
  - **Outcome:** ACCEPT_HISTORICAL_MP_APPROVED_PAYMENT_PROVIDER_PAYLOAD_EVIDENCE.
  - **Evidence:** 16 historically marked paid MP orders found. The strongest is UUID `0bd9fff8-59a1-404f-aee4-bf36a70b45b5` (March 24). It contains `mp_payment_id` (masked 151...784), `mp_preference_id`, and full `mp_payment_data` matching Mercado Pago's provider-shaped payload (keys: id, status, date_approved, external_reference, etc.). Admin manual mutation only updates payment_status, meaning durable payload persistence implies webhook-origin delivery, even though March edge logs are purged.
  - **Test Order Preservation:** `VSM-0039` (`#B60574`) remains pending/pending with tracking `TEST-TRACKING-SMOKE-123` and was not mutated. `VSM-0038` (`#0C2C6A`) remains confirmed / Transferencia Pendiente.
  - **Scope Note:** May 2026 `VSM-0039` smoke remains GO/PARTIAL and did not validate approved payment. Fresh sandbox payment is not required merely to prove historical provider persistence worked.
  - **Explicit Non-claims:**
    - Does NOT claim `VSM-0039` approved-payment success.
    - Does NOT claim current/fresh webhook delivery was just tested.
    - Does NOT claim current Mercado Pago configuration is live-ready today.
    - Does NOT claim settlement/refund/cancellation validation.
    - Does NOT claim conversion events were inserted for the historical order.
    - Does NOT claim referral/loyalty side effects are fully validated.
    - Does NOT claim edge logs prove March webhook delivery.
    - Does NOT claim production commercial readiness.
    - Does NOT claim final commercial domain readiness.
    - Does NOT claim all Mercado Pago edge cases are solved.

*Ultima actualizacion: 6 de mayo de 2026 (Admin Payment Status Mutation DB/Service Boundary - PASS).*
  - **Context:** Validate Admin Confirmar Pago boundary on VSM-0038 without side effects.
  - **Outcome:** ACCEPT_DB_SERVICE_BOUNDARY_PAYMENT_STATUS_MUTATION_PASS.
  - **Execution:** `simulate_admin_confirm_pago.cjs` executed exactly `{ payment_status: 'paid', updated_at: <now> }`. React drawer click was not executed.
  - **State Changes:** VSM-0038 `payment_status` updated to `paid`. `order_status` (`confirmed`), `tracking` (null), and MP fields (null) remained untouched. No conversion/loyalty side effects observed (`referrals` absent, `loyalty_points` 0, `conversation_conversion_events` 0 linked).
  - **Preservation:** VSM-0039 / #B60574 remained pending/pending and untouched. No further payment-status mutation should run on VSM-0038.
  - **Explicit Non-claims:**
    - Does NOT claim the actual React admin drawer click was browser-validated.
    - Does NOT claim Mercado Pago webhook/current sandbox works.
    - Does NOT claim refund/cancellation works.
    - Does NOT claim order_status transitions are safe.
    - Does NOT claim future schema/migrations cannot add side effects.
    - Does NOT claim full admin fulfillment readiness.
    - Does NOT claim all admin routes/roles are validated.
    - Does NOT claim VSM-0039 paid or touched.

*Ultima actualizacion: 6 de mayo de 2026 (Admin Order Status Transition DB/Service Boundary - PASS).*
  - **Context:** Validate Admin order_status confirmed -> processing boundary on VSM-0038 without side effects.
  - **Outcome:** ACCEPT_DB_SERVICE_BOUNDARY_ORDER_STATUS_PROCESSING_PASS.
  - **Execution:** `simulate_admin_order_status.cjs` executed exactly `{ status: 'processing', payment_status: 'paid', updated_at: <now> }`. React drawer selector was not executed.
  - **State Changes:** VSM-0038 `status` updated to `processing`. `payment_status` (`paid`), `tracking` (null), and MP fields (null) remained untouched. No conversion/loyalty side effects observed (`referrals` absent, `loyalty_points` 0, `conversation_conversion_events` 0 linked).
  - **Preservation:** VSM-0039 / #B60574 remained pending/pending and untouched. No further confirmed -> processing mutation should run on VSM-0038.
  - **Explicit Non-claims:**
    - Does NOT claim the actual React admin drawer status selector was browser-validated.
    - Does NOT claim bulk actions are safe.
    - Does NOT claim kanban drag/drop is safe.
    - Does NOT claim table/list inline mutation is safe.
    - Does NOT claim shipped/delivered transitions are safe.
    - Does NOT claim refund/cancellation works.
    - Does NOT claim Mercado Pago current webhook works.
    - Does NOT claim full admin fulfillment readiness.
    - Does NOT claim future schema/migrations cannot add side effects.
    - Does NOT claim VSM-0039 paid or touched.

*Ultima actualizacion: 6 de mayo de 2026 (Admin Access Recovery & UI Read-Only Verification - PASS).*
  - **Context:** Codex authorized a bounded admin access recovery followed by a read-only Admin UI verification for VSM-0038.
  - **Outcome:** ACCEPT_ADMIN_ACCESS_AND_UI_READ_ONLY_DISPLAY_PASS.
  - **Execution:** Dedicated test admin access was restored for `test-admin-vsm@example.com`. Recovery required a password reset (via service role) and admin role restoration via DB upsert into `admin_users`. No secrets were exposed. Helper scripts `recover_admin.cjs` and `grant_admin.cjs` remained local and untracked. Admin Orders UI was reached at `https://vsm-store.pages.dev/admin/orders`.
  - **State Observations:** VSM-0038 correctly displayed `Preparando` (processing), `(Pagado)` (paid), `Transferencia` (transfer), `Sin guía asignada` (null tracking), and no MP fields or Confirmar Pago button. VSM-0039 was strictly preserved as `Pendiente`, `Mercadopago`, `TEST-TRACKING-SMOKE-123`, with Confirmar Pago visible.
  - **UI control risks observed:** status selector visible/enabled, tracking Agregar button visible, Confirmar Pago visible on VSM-0039, bulk checkboxes visible, kanban drag/drop exposed, refund/cancel controls not observed in primary drawer.
  - **Explicit Non-claims:**
    - Does NOT claim React drawer mutation path was validated.
    - Does NOT claim status dropdown mutation works.
    - Does NOT claim bulk actions are safe.
    - Does NOT claim kanban drag/drop is safe.
    - Does NOT claim table/list inline actions are safe.
    - Does NOT claim shipped/delivered transitions are safe.
    - Does NOT claim refund/cancel works.
    - Does NOT claim current Mercado Pago webhook works.
    - Does NOT claim full admin fulfillment readiness.
    - Does NOT claim final commercial readiness.

*Ultima actualizacion: 6 de mayo de 2026 (Admin Visible Control Surface Map).*
  - **Verdict:** CONTROL_SURFACE_MAP_COMPLETE_NO_MUTATION_RECOMMENDED.
  - **Baseline:** VSM-0038 is processing/paid/transfer with null tracking/MP fields. VSM-0039 is pending/pending/mercadopago with TEST-TRACKING-SMOKE-123 and must remain untouched.
  - **Control Surface Map:**
    - Mutating controls: Drawer status selector (`updateOrderStatus`), Drawer tracking save (`updateOrderTracking`), Drawer Confirmar Pago (`updateOrderPaymentStatus`), List/table/board status selectors, List tracking save, Table bulk actions, Kanban drag/drop.
    - Read-only controls: Filters, view toggles, drawer opening.
    - Missing: No explicit Mercado Pago refund API/admin refund control was found.
  - **Risks:** `updateOrderStatus` forces payment_status = paid for processing/shipped/delivered. `delivered` may trigger side effects. Bulk actions and Kanban can contaminate VSM-0039.
  - **Conclusion:** No further mutation is recommended from this control-surface audit. Future smokes require explicit Carlos authorization with exact target/control/transition.
  - **Explicit Non-claims:** Does NOT claim status dropdown mutation works. Does NOT claim tracking mutation UI works in this pass. Does NOT claim Confirmar Pago UI mutation works. Does NOT claim bulk actions are safe. Does NOT claim kanban drag/drop is safe. Does NOT claim table/list inline mutations are safe. Does NOT claim shipped/delivered transitions are safe. Does NOT claim refund/cancel works. Does NOT claim current Mercado Pago webhook works. Does NOT claim full admin fulfillment readiness.

*Ultima actualizacion: 6 de mayo de 2026 (Refund / Cancellation Readiness).*
  - **Verdict:** NO_REFUND_PATH_FOUND_CANCEL_STATUS_ONLY.
  - **Facts:** No implemented Mercado Pago refund API path or admin UI refund control was found. `payment_status = refunded` exists, but no admin/provider refund execution path exists. Mercado Pago webhook can react to refunds but does not initiate them. Cancellation exists only as an `order_status = cancelled` transition. `updateOrderStatus(..., 'cancelled')` does not set `payment_status = refunded` and does not restore inventory, reverse loyalty/referral rows, or notify customer. VSM-0038 should not be cancelled. VSM-0039 must remain untouched. Any future cancellation smoke requires a fresh controlled non-MP test order and explicit Carlos authorization.
  - **Explicit Non-claims:** Does NOT claim refund works. Does NOT claim Mercado Pago refund API exists. Does NOT claim cancellation performs a refund or reverses side effects. Does NOT claim cancellation notifies customer or MP. Does NOT claim VSM-0038 or VSM-0039 was touched. Does NOT claim current MP webhook readiness. Does NOT claim full admin fulfillment readiness.

*Ultima actualizacion: 6 de mayo de 2026 (Shipping / Delivery Readiness).*
  - **Verdict:** REQUIRE_FRESH_CONTROLLED_ORDER_FIRST.
  - **Facts:** `updateOrderStatus` handles processing -> shipped and shipped -> delivered transitions. Both force `payment_status = paid`. No tracking coupling found. `delivered` transition carries trigger risk due to `tr_order_paid_referral` migration logic. Tracking is not source-enforced before shipped/delivered; null-tracking fulfillment is misleading. VSM-0038 and VSM-0039 are not ideal for fulfillment mutations. Future fulfillment smokes require a fresh controlled transfer order, ideally after a tracking readiness audit.
  - **Explicit Non-claims:** Does NOT claim processing->shipped or shipped->delivered works. Does NOT claim tracking UI works. Does NOT claim delivered trigger side effects, bulk actions, or kanban drag/drop are safe. Does NOT claim notifications/inventory behavior are validated. Does NOT claim current MP webhook delivery or refund/cancel works. Does NOT claim full admin fulfillment readiness.

*Ultima actualizacion: 8 de mayo de 2026 (Tracking Canonicalization Implemented).*
  - **Verdict:** TRACKING_CANONICALIZATION_IMPLEMENTED_WITH_TEST_DEBT.
  - **Facts:** Tracking canonicalization committed in `608a6907db2c45d91cb4c5dac26c95c4723dd3b5`. `orders.tracking_number` is now the canonical guide field in admin (service, drawer, list) and customer (OrderDetail) code. `tracking_notes` is supplemental. `updateOrderTracking` writes to `tracking_number`. Admin dashboard and CRM queries include `tracking_number`. WhatsApp helper separates guide and note. No DB backfill, no existing order mutations. VSM-0038/VSM-0039 untouched. No DHL or shipping behavior added. Test debt: no focused admin service integration test for tracking update.
  - **Explicit Non-claims:** Does NOT claim DHL tracking readiness, `/track` provider integration, or admin browser mutation validation. Does NOT claim historical backfill or shipping/delivery readiness. Does NOT claim full commercial fulfillment readiness. Does NOT claim admin service integration tests exist.

*Ultima actualizacion: 8 de mayo de 2026 (VSM-0040 Fulfillment Smoke).*
  - **Verdict:** VSM0040_FULFILLMENT_SMOKE_PASS.
  - **Facts:** VSM-0040 (`5be6729d`) is a DB-seeded controlled transfer test order (Gomitas CBD, $350, `conversion_source: manual`). Smoke passed 5 phases: payment pending→paid, status pending→processing, tracking_number null→TEST-DHL-TRACKING-001, mid-smoke side-effect check, status processing→shipped. Stopped before delivered. Final state: `shipped/paid/transfer`, tracking_number set, tracking_notes null, MP fields null. Side effects unchanged: product stock 45, conversion events 29, loyalty 0, customer stats 0/0.00/bronze. VSM-0038 and VSM-0039 preserved unchanged.
  - **Explicit Non-claims:** Does NOT claim delivered readiness, DHL/provider tracking readiness, refund/cancel readiness, MP webhook readiness, bulk/kanban safety, checkout readiness, admin browser UI mutation validation, or full commercial fulfillment readiness.

*Ultima actualizacion: 11 de mayo de 2026 (Local QA Judge Dev Toggle).*
  - **Verdict:** DISABLE_QA_JUDGE_TOGGLE_ACCEPTED.
  - **Commit:** `d0812a4` (`feat(edge): add DISABLE_QA_JUDGE env toggle for local dev`).
  - **Scope:** `supabase/functions/customer-intelligence/index.ts` only. No other files changed.
  - **Accepted Behavior:** `DISABLE_QA_JUDGE` is an optional runtime env toggle. When set to `true`, the async background `cesarin-qa-judge` / `evaluate_turn` call is skipped entirely. When absent or any other value, QA Judge remains enabled (production default). Production behavior is identical because deployed environments do not define `DISABLE_QA_JUDGE`.
  - **Rationale:** The non-blocking async QA Judge hook was hanging under Gemini `429 RESOURCE_EXHAUSTED`, causing Deno isolate wall-clock timeouts that killed the entire `customer-intelligence` Edge request pipeline during local development. This toggle restores local pipeline stability without modifying QA Judge logic or production behavior.
  - **Validation Evidence:** `npm run typecheck` PASS. `npm run lint` PASS with `0` errors and `352` pre-existing warnings. One-prompt local authenticated smoke returned HTTP 200, classified `hola` as `CHIT_CHAT`, returned a greeting response, made no QA Judge call, triggered no Gemini 429, and experienced no wall-clock timeout.
  - **Push Truth:** Pushed to `origin/main`. Post-push state: branch `main` aligned with `origin/main` at ahead `0` / behind `0`, tracked working tree clean, staged diff empty, 38+ pre-existing untracked helpers preserved untouched.
  - **Residual Risk:** Low and accepted. The toggle suppresses QA Judge evaluation entirely when enabled, so local-dev telemetry will have no QA Judge rows. This is intentional for local stability but means QA Judge quality monitoring requires production or a non-rate-limited Gemini key.
  - **Explicit Non-claims:** Does NOT claim broad Césarín quality fix. Does NOT claim Product Search, retrieval, ranking, or embedding validation. Does NOT claim checkout/provider validation. Does NOT claim admin/Cesarin OS work. Does NOT claim DB/schema/migration work. Does NOT claim remote Supabase work. Does NOT claim deploy. Does NOT claim `.env` change. Does NOT claim QA Judge was removed or permanently disabled. Does NOT claim production behavior changed. Does NOT claim cleanup of untracked helper artifacts.

*Ultima actualizacion: 12 de mayo de 2026 (Admin Fulfillment Browser Readiness).*
  - **Verdict:** ADMIN_FULFILLMENT_BROWSER_READY.
  - **Scope:** Local browser/admin fulfillment readiness only.
  - **Facts:** Validated UI mutations for tracking save, shipped transition, and delivered transition on orders VSM-R005 and VSM-R008. Verified payment_status automation forces paid through shipped/delivered transitions.
  - **Side-effects:** Verified `trg_orders_update_customer_stats` perfectly increments CRM totals. Verified `tr_order_paid_referral` safely gracefully handles 0-row no-ops.
  - **Boundaries Preserved:** Verified no payment/provider execution, no DHL/provider tracking integration, and no remote Supabase hits.
  - **Known Residuals:** LOW UX note where short internal ID is emphasized over semantic order_number in the admin drawer. This is non-blocking; search and data mapping work.
  - **Explicit Non-claims:** Does NOT claim Mercado Pago payment/refund execution. Does NOT claim checkout provider readiness. Does NOT claim refund/cancel path. Does NOT claim DHL/provider tracking integration. Does NOT claim bulk action safety. Does NOT claim kanban readiness. Does NOT claim production/staging deployment readiness. Does NOT claim remote Supabase validation/mutation. Does NOT claim migrations/db push/db reset/deploy. Does NOT claim `.env` work. Does NOT claim broad admin redesign.
