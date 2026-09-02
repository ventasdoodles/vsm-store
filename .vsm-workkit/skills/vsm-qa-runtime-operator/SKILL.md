---
name: vsm-qa-runtime-operator
description: Use for authorized Ya VOY local/dev QA runtime execution or preflight, including qa-temp handling, QA runtime contract checks, protected evidence, order_id proof, rollback/cleanup, and non-secret evidence reporting.
---

# VSM Store QA Runtime Operator

## Required Behavior

- Confirm the lane explicitly authorizes QA runtime work before running any harness.
- Use `C:\dev\vsm-store-fresh\.vsm-workkit\docs\operations\QA_RUNTIME_CONTRACT.md` as the non-secret contract.
- Use `orders.id` / `order_id` as the primary proof key. `order_number` is only a label.
- Never inspect or print `.env`, `.env.local`, passwords, tokens, cookies, localStorage, sessionStorage, auth headers, service-role values, or Playwright storageState contents.
- Treat `F:\ivoy\ivoy1.6\qa-temp\` as local scratch only. Do not commit it.
- Run preflight before any harness:
  - `node scripts\qa-runtime-contract-check.cjs` from `F:\ivoy\ivoy1.6`
  - or `.\scripts\run-local-multiscenario-qa.ps1 -PreflightOnly`
- If the preflight does not produce a ready state, stop before mutation/harness work.
- For full smoke, preserve customer visual proof before cleanup expires the target, preserve protected retained evidence order IDs from the contract, and verify final cleanup/driver baseline when the lane requires it.
- Use `tools\workflow\evidence-ledger.mjs` for the acceptance/canon evidence draft when an exact order is involved.

## Output

1. ENVIRONMENT TARGET
2. PREFLIGHT COMMANDS AND RESULT
3. DUMMY DATA USED
4. PRIMARY PROOF KEY (`order_id` / `orders.id`)
5. UI OBSERVATIONS
6. DB / LEDGER OBSERVATIONS
7. MUTATIONS / CLEANUP / ROLLBACK
8. PROTECTED EVIDENCE CHECK
9. DRIVER BASELINE CHECK
10. ACCEPTED CLAIMS
11. RESIDUAL RISKS
12. NON-CLAIMS
13. GO / NO-GO
