# Xalapa City Zero Master Plan Design

## Objective

Turn VSM Store from a promising pilot codebase into a city-operable product by
proving one repeatable operating system in a single real city before any
multi-city ambition.

`Xalapa City Zero` means:

- one bounded city with explicit operating coverage,
- a truthful competitive marketplace,
- one dispatch/cabina workflow that survives real contention,
- measurable service-level outcomes,
- repeatable QA and release gates,
- and a playbook that can later be copied to a second city.

This design does **not** treat “national architecture” as the first milestone.
It treats one city with verified operating truth as the prerequisite to any
credible national expansion.

## Problem Statement

The current workspace already contains meaningful proof:

- customer order creation works,
- driver assignment and lifecycle can be proven through QA,
- wallet, cash closeout, and top-up rails now exist,
- Admin, Client, and Canon have a serious operating workkit,
- and deployment/QA automation is materially better than a toy MVP.

But the product still lacks the one thing required for a real city launch:
**a fully proven operating marketplace with truthful demand mechanics and a
repeatable city playbook**.

Today the biggest gaps are:

1. The competitive marketplace lifecycle is not yet complete end to end.
2. Local product baselines are dirty, so implementation lanes are currently
   unsafe on the main checkouts.
3. City operations are still implicit. Coverage, zones, rules for no-interest
   orders, and escalation paths are not yet the primary product model.
4. The system is still too dependent on demo-safe assumptions and not yet
   shaped around daily city operations and service metrics.

## Why Xalapa First

Three strategic routes were considered:

### Option A — Xalapa first, then expansion

Build the full operating system for one intermediate city, prove it, then copy
the playbook.

Pros:

- lower operational entropy,
- faster proof of supply-demand truth,
- easier support and dispatch supervision,
- lower blast radius for pricing and marketplace mistakes,
- cleaner path to a repeatable operating handbook.

Cons:

- less impressive headline than “launching nationally,”
- slower surface-area growth.

### Option B — Feature-first multi-city growth

Keep adding product surfaces and city-agnostic features before proving one city.

Pros:

- feels fast,
- produces more visible product output quickly.

Cons:

- scales ambiguity and debt,
- hides operational failure under UI progress,
- creates a product that looks larger than it actually operates.

### Option C — National-grade architecture first

Design for multi-city, multi-zone, and multi-surface scale from day one.

Pros:

- cleaner theoretical architecture.

Cons:

- high risk of over-architecture,
- long delay before first real operating proof,
- likely to optimize for imagined scale instead of actual failures.

## Decision

Choose **Option A: Xalapa first**.

Reason:

- it is the highest-signal path to real proof,
- it reduces unknowns while preserving future scale,
- and it aligns with the actual current maturity of the workspace.

The city plan must therefore optimize for:

- truthful marketplace behavior,
- operational control,
- measurable service reliability,
- bounded economics,
- and clean scale-up seams.

## Scope and Boundaries

In scope for `Xalapa City Zero`:

- completing the competitive marketplace lifecycle,
- defining Xalapa operating coverage and service rules,
- dispatch/cabina workflow hardening,
- release and QA gates for one real city,
- metrics required to judge city readiness,
- and expansion criteria for a second city.

Out of scope for this design:

- banking/SPEI production integration,
- certified accounting or tax/legal compliance,
- national launch claims,
- provider-grade GPS/navigation claims,
- fake demand, fake proximity, fake driver counts, or fake SLA claims,
- and broad product redesign unrelated to operating truth.

## North-Star Principle

The product is not “ready” when it looks polished or deploys successfully.
It is ready when one city can operate through a bounded, repeatable loop:

1. customer publishes a valid request,
2. eligible drivers truly see and compete for it,
3. one winner is assigned atomically,
4. losers receive truthful closure,
5. the order advances through the lifecycle without stale or contradictory UI,
6. cash and wallet implications remain internally consistent,
7. cabina can explain what happened on any order,
8. and daily metrics show the city is functioning rather than merely rendering.

## Workstream Overview

`Xalapa City Zero` is split into five workstreams:

1. **Marketplace truth**
2. **City operations**
3. **Cabina and exception handling**
4. **Metrics and readiness gates**
5. **Expansion seam design**

Each workstream has a hard dependency order. No downstream work may be treated
as launch proof if upstream truth remains incomplete.

## Workstream 1 — Marketplace Truth

This is the immediate technical bottleneck.

Required outcome:

- a real multi-driver competitive marketplace with no false closure states and
  no operationally misleading customer/driver UI.

Required functional contract:

- multiple eligible drivers can view the same order,
- multiple drivers can offer or counteroffer on the same order,
- customer can compare multiple offers,
- accepting one offer atomically closes competing `pending` offers using a
  truthful state such as `superseded`,
- losing drivers cannot continue acting on the closed order,
- direct-accept races allow exactly one winner,
- expired offers cannot be accepted,
- orders either return to feed or become inactive through explicit rules,
- no fake scarcity or fake activity is shown to customers.

Required technical contract:

- database/RPC truth uses row locking and authoritative refetch,
- realtime is freshness only, not mutation truth,
- critical mutations gain idempotency protection,
- status enums are explicit and semantically honest,
- duplicated strings/rules are centralized,
- and test coverage includes direct-accept race, counteroffer win, losing-driver
  closure, expiry, republish, inactive, and raise-offer thresholds.

Current known gap:

- `superseded` exists only as local dirty-state WIP and is not yet proven
  remotely or in a full multiscenario live loop.

## Workstream 2 — Xalapa Operating Model

The city is not just geography. It is a constrained operating contract.

Required artifacts in product and operations:

- named operating zones for Xalapa,
- explicit service hours,
- service-type availability by zone and hour,
- rules for when an order is eligible for marketplace publication,
- rules for when an order becomes inactive,
- rules for when a customer should be prompted to raise the offer,
- and a human-operable exception path for no-interest orders.

The product must stop implying “coverage everywhere, any time.”
Instead it should make bounded availability an explicit operating fact.

Recommended Xalapa operating layers:

- `core zone`: highest supply confidence, tightest SLA
- `extended zone`: slower but still supported
- `manual-review fringe`: visible only when cabina can intervene or when the
  user explicitly accepts looser expectations

The point is not to deny demand; it is to avoid lying about serviceability.

## Workstream 3 — Cabina and Exception Handling

Cabina is the real operating heart of City Zero.

The Admin product should optimize first for:

- orders waiting too long for first offer,
- orders with multiple failed offer cycles,
- short/over cash exceptions,
- assignment or lifecycle contradictions,
- driver availability or capacity gaps,
- and retained order evidence for postmortem.

The cabina dashboard should be treated as an exception console, not a decorative
analytics board.

Required properties:

- every action is explainable from data,
- every important order can be reconstructed,
- every manual intervention is bounded and auditable,
- and the UI highlights “what needs attention now,” not vanity summaries.

## Workstream 4 — Metrics and Readiness Gates

City Zero cannot launch on feeling. It needs hard operating metrics.

Minimum daily operating metrics:

- time to first driver interest,
- time to accepted assignment,
- percent of orders with no offers,
- percent of orders that require raise-offer prompt,
- percent of orders that become inactive,
- cancellation rate by reason,
- lifecycle completion rate,
- average and percentile fulfillment time,
- margin proxy per order,
- and exception counts for wallet/cash/order inconsistency.

Readiness gates for Xalapa:

1. Marketplace lifecycle proof is green.
2. QA multiscenario proof is green and repeatable.
3. Repo baseline and workspace sync are green at release time.
4. Deployment, preview, and promoted production-like flows are stable.
5. No critical stale-state bug remains in client/admin-driver loop.
6. Daily metrics are being captured and interpreted, not merely logged.
7. No fake demand, fake GPS, fake counts, or false supply confidence is used.

If these gates are not green, the city is not ready no matter how polished the
UI looks.

## Workstream 5 — Expansion Seam Design

This design intentionally avoids full national complexity first, but it must
preserve a clean seam for later scale.

The city expansion seam should treat the following as configurable, not hardcoded:

- city
- zone
- service hours
- marketplace TTLs
- offer cycle thresholds
- inactive thresholds
- raise-offer thresholds
- dispatch escalation rules
- service-type availability
- and reporting dimensions

The first city must not be a one-off snowflake.
It should be a template with parameters.

## Recommended Phase Plan

### Phase 0 — Baseline Integrity

Goal:

- restore safe implementation conditions.

Required outcome:

- `ivoy1.6` and `ivoy-admin` stop being dirty baselines for new lanes.

Exit:

- either clean aligned mains,
- or fresh explicitly named worktrees become the only authorized targets for
  implementation lanes.

### Phase 1 — Competitive Marketplace Completion

Goal:

- close the largest product-truth gap.

Deliverables:

- `superseded` contract complete,
- single TTL contract,
- republish/inactive rules,
- truthful raise-offer logic,
- 4-driver QA scenario,
- remote apply and proof.

Exit:

- the product can honestly claim a working city marketplace under contention.

### Phase 2 — Xalapa Operating Contract

Goal:

- codify where and when service really exists.

Deliverables:

- zone model,
- serviceability rules,
- coverage UI copy,
- no-interest handling,
- cabina exception routes.

Exit:

- Xalapa operations are explicit and bounded.

### Phase 3 — Cabina Reliability

Goal:

- make Admin usable as a real operating console.

Deliverables:

- order attention queues,
- offer-cycle exception views,
- wait-time escalation views,
- and retained order evidence patterns.

Exit:

- dispatch can explain and manage failures instead of discovering them too late.

### Phase 4 — Metrics and Pilot Gates

Goal:

- turn daily operation into a measured system.

Deliverables:

- city dashboard metrics,
- daily/weekly review checklist,
- launch/no-launch thresholds,
- and second-city criteria.

Exit:

- a city can be judged with evidence instead of optimism.

## UX Contract for Xalapa City Zero

Customer UX must be honest:

- “Estamos buscando repartidor” is acceptable only while the system is truly
  searching.
- If no one takes the order, the product should say so directly.
- If the order needs a better offer, the product should say so without implying
  guarantee.
- If coverage or timing is bounded, the UI should state the boundary clearly.

Driver UX must be honest:

- visible supply is real eligible supply,
- losing a race yields truthful closure,
- offer expiry is server-enforced and visible,
- and no driver should see stale actionable UI after losing.

Admin UX must be operational:

- cabina sees lifecycle truth, not decoration,
- exceptions are elevated,
- and manual intervention never hides what actually happened.

## Technical Non-Negotiables

1. WorkKit stays first authority.
2. Dirty mains are not treated as safe implementation baselines.
3. Database truth owns assignment, closure, and financial state.
4. Realtime never becomes mutation truth.
5. No public client receives service-role-like power.
6. Every sensitive RPC keeps narrow grants and safe search path.
7. Every readiness claim must be backed by current evidence, not older memory.

## Risks

Main risks:

- shipping a visually convincing but operationally false marketplace,
- growing before Xalapa truth is proven,
- scaling stale-state bugs into multiple cities,
- and allowing deployment green checks to masquerade as city readiness.

Secondary risks:

- delayed transition away from legacy key assumptions,
- overuse of Postgres Changes where Broadcast would be more scalable,
- and lack of idempotency in non-financial but still critical marketplace mutations.

## Exit Criteria

The design is successful when:

- one city can be operated through a truthful, bounded, measurable loop,
- marketplace contention is solved rather than cosmetically softened,
- cabina can explain and act on exceptions,
- city-level metrics are live and meaningful,
- and expansion to a second city becomes a copy-and-parameterize exercise rather
  than a redesign.

## Non-Claims

This design does not claim:

- national readiness,
- banking readiness,
- legal/compliance readiness,
- provider-grade GPS proof,
- or broad production launch readiness.

It claims only the correct path:

- **prove one city deeply, then scale with discipline.**
