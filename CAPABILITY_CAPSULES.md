# Cesarín Capability Capsules — Architectural Note

This document serves as a supporting note to the `AI_CONTEXT.md` "Capability Capsule Philosophy". It defines the boundaries for the immediate domains of the Storefront AI Assistant.

## What is a Capability Capsule?
A Capability Capsule is a bounded AI behavior unit with a single commercial/assistant responsibility, explicit signals/contracts, local degraded behavior gracefully handling failures, a dedicated QA surface, and absolute failure isolation from unrelated capabilities.

---

### Capsule 1: Product Search Integrity Capsule (Recommended First Implementation)
**Reasoning for priority:** Highest storefront frequency, strongest commercial trust impact, low architecture disruption, and serves as an ideal template for future capsules.

- **Purpose**: Translates natural language into relevant catalog subsets.
- **Owned Behaviors**: Semantic matching, featured fallback detection, stock availability decoration.
- **Inputs**: User intent string, semantic embeddings.
- **Outputs**: Formatted, machine-readable product list with exact data framing.
- **Fallback/Degraded**: Assumes a polite degraded state avoiding crashes if search fails.
- **QA Responsibility**: Verify correct products and correctly hedged featured fallbacks.
- **Adjacent Dependencies**: Vector database, generic inventory stock column.

### Capsule 2: Availability & Outlook Integrity Capsule
- **Purpose**: Predicts and communicates inventory exhaustion timelines.
- **Owned Behaviors**: Oracle interactions, days-until-out calculations, signal quality framing, out-of-stock substitution rules.
- **Inputs**: Specific Product ID, current DB stock.
- **Outputs**: Urgency levels, projected dates, signal quality flags (`[insufficient]`).
- **Fallback/Degraded**: Fall back strictly to current DB stock ("Stock: Disponible") if oracle fails.
- **QA Responsibility**: Verify projection math formatting and low-signal hedging.
- **Adjacent Dependencies**: Supply chain oracle edge function.

### Capsule 3: Storefront Degraded Experience Capsule
- **Purpose**: Protects user experience during systemic or network failures.
- **Owned Behaviors**: Absolute timeout enforcement (25s), Quota limit trapping, safe UI rendering, "Retry" workflows.
- **Inputs**: Promise rejections, HTTP status codes, latency timers.
- **Outputs**: Safe UI overlays, halted interactive state.
- **Fallback/Degraded**: Halt gracefully without exposing stack traces or infinite loaders.
- **QA Responsibility**: Prevent infinitely hanging states or raw technical error leakage.
- **Adjacent Dependencies**: Network layer, React state.
