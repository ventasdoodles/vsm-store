---
name: vsm-evidence-ledger
description: Use after Ya VOY QA, acceptance, or canon work when exact evidence must be preserved: order_id, order_events, order_offers, wallet_transactions, cleanup status, driver baseline, retained evidence, residual risks, and non-claims.
---

# Moto Evidence Ledger

## Required Behavior

- Preserve exact IDs verbatim.
- Use `orders.id` / `order_id` as the primary proof key.
- Keep cleanup facts separate from accepted behavior facts.
- Keep retained evidence checks separate from fresh dummy-order cleanup.
- Preserve residual risks and non-claims exactly; do not inflate local/manual proof into production readiness.
- If evidence is incomplete, mark it `BLOCKED` or `MISSING`; do not infer counts.
- Prefer the local/manual helper:
  - `node tools\workflow\evidence-ledger.mjs --order-id <uuid> --status <status> --order-events <n> --order-offers <n> --wallet-transactions <n>`

## Output

1. PRIMARY PROOF KEY
2. EXACT IDS
3. DB / LEDGER COUNTS
4. CLEANUP STATUS
5. DRIVER BASELINE
6. RETAINED EVIDENCE STATUS
7. ACCEPTED CLAIMS
8. RESIDUAL RISKS
9. NON-CLAIMS
10. CANON-READY SUMMARY
