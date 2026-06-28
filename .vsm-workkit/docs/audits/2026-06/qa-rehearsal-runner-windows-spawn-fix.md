# QA Rehearsal Runner Windows Spawn Fix

Date: 2026-06-03

## Verdict

ACCEPT WITH RESIDUAL RISK.

## Commit Identity

- Commit: `278af21 fix(workflow): harden qa rehearsal dev server startup`
- Accepted as: local/manual workflow-runner hardening only

## Accepted Claims

- `278af21` fixes the Windows dev-server startup path for the local/manual QA rehearsal runner.
- The prior failure was `spawn EINVAL` in `startLocalDevServers`.
- The fix removes the unsafe Windows/Node raw file-descriptor `stdio` spawn pattern and uses a safer Windows startup path.
- `node tools\workflow\vsm-qa-rehearsal.mjs --start-dev-servers-only --json` passes as a bounded non-mutating startup/shutdown validation path.
- The runner starts local Vite dev servers on ports `5173` and `5174`, verifies both ports are listening, stops only runner-started PIDs, and verifies final port release.
- Safe defaults remain intact.
- Mutating harness execution still requires explicit `--run-harness` or `--run`.
- No product/client/admin source behavior changed.
- No DB/Auth/Supabase/browser/provider/production behavior changed.
- No secrets were inspected or printed.
- Documentation remains workflow/tooling documentation only.

## Startup/Shutdown Evidence

- Port precheck: `5173` and `5174` available.
- Started client PID: `18572`.
- Started admin PID: `8632`.
- Both ports listened.
- Both runner-started PIDs stopped.
- Final port check showed both ports available.
- External post-check showed both ports available.
- Harness remained `requested: false` and `ran: false`.

## Residual Risks

- Full mutating path `--run-harness --start-dev-servers` remains unexecuted.
- Startup/shutdown proof is local/manual workflow-runner proof only, not product readiness.
- This acceptance covers local/manual workflow-runner hardening, not business-flow correctness.
- Scratch evidence remains local/manual and not DB truth.
- `qa-temp/` remains untracked scratch in `F:\ivoy\ivoy1.6`.

## Non-Claims

- No hook.
- No CI.
- No runtime enforcement.
- No product behavior proof.
- No DB/Auth/Supabase proof.
- No browser/provider proof.
- No production readiness.
- No real payment/GPS/notification/courier/compliance proof.
- No product/client/admin source behavior change.
- No DB migration.
- No Supabase function.
- No Auth/session/profile change.
- No provider/deploy/production/GPS/payment/notification behavior change.
- No secret inspection.

## Explicit Boundary

- Startup/shutdown proof is accepted.
- Full `--run-harness --start-dev-servers` remains unproven.
- This canon entry does not convert local/manual workflow-runner hardening into product, DB, browser, provider, runtime enforcement, or production readiness.
