# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# COLD AUDIT ONLY — PILOT OBSERVABILITY / OPERATOR USABILITY

## 1. WHAT IS ALREADY VISIBLE / SOLVED

- An operator can already tell whether traffic is reaching the system.
  - [PilotTelemetry.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx) shows total interactions, time range, per-row query log, and refresh.
  - [admin-pilot-ops.service.ts](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts) reads directly from `ai_analytics`.
- An operator can already tell whether intent routing is happening.
  - Per row: `detected_intent`, `capsule`, `raw_analyst_intent`, `guardrail rescue`, `fallback_used`.
  - Aggregate: capsule distribution and guardrail rescue counts.
- An operator can already tell whether product retrieval is succeeding at a basic operational level.
  - `semantic_match_success`
  - `product_card_count`
  - `zeroProductCardCount`
  - bucket filters for `0 Cards`, `Match`, `Policy`, `Carrito`, `Frustración`
- Fallback dominance is already visible enough at headline level.
  - `fallbackRate` KPI in [PilotTelemetry.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx)
  - same rate surfaced in [TabAnalytics.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabAnalytics.tsx)
- Frustration/escalation-style signal is already visible enough for pilot ops triage.
  - `frustration_detected`
  - frustration rate KPI
  - dedicated bucket filter
  - review drawer path from telemetry log
- Session-gate / pilot activation confusion is already distinguishable from true AI failure.
  - [PilotParityDiagnostics.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotParityDiagnostics.tsx) exposes pilot session origin and lets the operator enable/clear the pilot gate locally.
  - [App.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/App.tsx) confirms storefront visibility depends on `sessionStorage` pilot gating plus store setting, not login.

## 2. WHAT IS PARTIALLY VISIBLE BUT OPERATIONALLY WEAK

- [TabAnalytics.tsx](c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabAnalytics.tsx) is operationally weaker than the telemetry cockpit.
  - It shows useful KPI snapshots, but its “Analíticas Avanzadas” panel is still basically a placeholder shell.
  - It is not the surface you’d trust first during a live “something feels off” moment.
- Product retrieval success is visible, but only in proxy form.
  - You can see `semantic_match_success`, `product_card_count`, and `zero cards`.
  - You cannot see a clean operator-facing decomposition of why retrieval failed:
    - no semantic hit
    - routed away from product search
    - degraded response
    - generic fallback
- Fallback behavior is visible, but diagnosis is still a bit coarse.
  - `fallback_used` exists, but the cockpit does not cleanly separate:
    - benign generic answer
    - unknown capsule
    - edge failure
    - degraded infra response
- Frustration is visible, but escalation usefulness is incomplete.
  - You can spot frustration rows.
  - You cannot yet see a strong summarized theme layer from pilot telemetry alone without opening row-by-row review or separate learning/intervention surfaces.

## 3. WHAT IS A REAL BLIND SPOT

- The real blind spot is **operator-friendly failure mode attribution**.
- Today, if the pilot feels “off”, the operator can tell that:
  - traffic exists
  - routing happened or not
  - cards appeared or not
  - fallback/frustration rose or not
- But the operator cannot cleanly answer, from one pilot observability surface alone:
  - *what kind of miss is dominating right now?*
- Specifically missing as a first-class ops view:
  - a breakdown of failure/miss categories such as:
    - routed to product search but `0 cards`
    - unknown/guardrail rescue
    - degraded infra/error path
    - fallback without capsule
    - policy/rag dominance instead of product retrieval
- That distinction exists in raw ingredients across `ai_logic_debug`, but not yet as one clear operator-facing summary surface.

## 4. WHAT SHOULD BE PRIORITIZED NEXT (max 2 items, ranked)

1. **Pilot miss taxonomy / failure attribution panel**
- Highest value because it closes the main remaining operator blind spot.
- Keep it within existing telemetry/admin surfaces; no speculative architecture needed.

2. **TabAnalytics rationalization or demotion behind PilotTelemetry**
- Lower priority.
- The telemetry cockpit is the real operational surface; `TabAnalytics` is still weaker and can mislead operators into the wrong tab for live diagnosis.

## 5. WHETHER THIS REQUIRES ANTI IMPLEMENTATION NOW OR CAN WAIT

- **Yes, this justifies implementation now** if pilot operations are actively being used for live diagnosis.
- The reason is not missing raw telemetry.
- The reason is that the remaining gap is now usability of already-existing telemetry for real operator decisions.
