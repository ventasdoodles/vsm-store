# Playwright Credentialed 3-Surface Visual QA Harness

Date: 2026-06-01

## Verdict

ACCEPT WITH RESIDUAL RISK

## Objective

Canon reconciliation for accepted client commit `70b41a284034c7605652bc68b1269b73cafd376d test(e2e): add playwright visual qa harness`.

## Scope

Accepted source/test harness only. This note records the Playwright-based 3-surface visual QA harness, the approved wrapper target consumption, and the validation outputs that were accepted. It does not change product behavior or open any source/runtime lanes outside the client test harness.

## Evidence

- `.\scripts\run-local-multiscenario-qa.ps1 -PreflightOnly` passed with `CONTRACT_CHECK: PASS`.
- `.\scripts\run-local-multiscenario-qa.ps1 -Run -PrepareVisualTargets -NoPause` produced a fresh exact customer `/order/:id` target and expected blocker codes for Driver/Admin.
- `npx playwright test --list` listed the setup project plus 3 visual-surface tests.
- `npx playwright test --project=setup --project=visual` passed `4/4`.
- `npm run test:run -- src/test/pilotDemoVisualHarness.test.tsx` passed `4/4`.
- `npm run typecheck` passed.
- `git diff --check` passed.

## Accepted Facts

- Lane name: Playwright Credentialed 3-Surface Visual QA Harness.
- Verdict: ACCEPT WITH RESIDUAL RISK.
- Client commit: `70b41a284034c7605652bc68b1269b73cafd376d test(e2e): add playwright visual qa harness`.
- The client repo now has a tracked Playwright-based 3-surface visual QA harness in `F:\ivoy\ivoy1.6`.
- The harness does not modify product behavior.
- It adds a tracked Playwright config at `F:\ivoy\ivoy1.6\playwright.config.ts`.
- It adds setup/auth and visual QA files under `F:\ivoy\ivoy1.6\e2e\auth.setup.ts`, `F:\ivoy\ivoy1.6\e2e\visual-qa.spec.ts`, `F:\ivoy\ivoy1.6\e2e\helpers\qa-credentials.ts`, `F:\ivoy\ivoy1.6\e2e\helpers\visual-targets.ts`, and `F:\ivoy\ivoy1.6\e2e\helpers\summary.ts`.
- It updates `F:\ivoy\ivoy1.6\package.json`, `F:\ivoy\ivoy1.6\package-lock.json`, and `F:\ivoy\ivoy1.6\.gitignore`.
- Playwright setup uses standard UI login and writes per-role storage state under ignored `qa-temp/.auth/`.
- Runtime artifacts and visual summaries are written under ignored `qa-temp/`.
- The harness reads approved wrapper visual-target output instead of guessing a fixed or stale customer route.
- The harness emits structured PASS/BLOCKED surface summaries.
- Driver and Admin passed under the validated Playwright setup.
- Customer remained BLOCKED as `CUSTOMER_TARGET_EXPIRED` in the no-pause validation path because wrapper cleanup completed before browser inspection.
- Evidence level is Mixed.
- The implementation preserves the previous runtime contract and does not claim Customer browser PASS.

## Preserved Non-Claims

- No production readiness.
- No Customer browser PASS in the no-pause validation path.
- No live DB mutation proof beyond the bounded approved wrapper behavior.
- No secret, token, cookie, storage, password, provider credential, or Playwright storageState contents inspection.
- No claim that the admin repo modification was introduced by this commit.
- No product behavior change.
- No real payment capture, refund, settlement, deposit, withdrawal, SPEI, card, provider behavior, or courier payout proof.
- No live GPS, tracking, ETA, notification, or physical mobile/PWA behavior proof.
- No full Supabase RLS/auth correctness proof.
- No full live DB end-to-end proof.
- No successful real rider/courier/admin browser walkthrough.
- No full security/compliance proof.

## Residual Risks

- Customer remains `CUSTOMER_TARGET_EXPIRED` in the no-pause run path because cleanup completes before browser check.
- Browser proof is mixed, not full tri-surface live PASS.
- `qa-temp/` is intentionally untracked, so long-term runtime evidence retention depends on generated summary artifacts.
- Admin repo still has an unrelated local `package.json` modification, which could confuse future continuity checks if not called out.
