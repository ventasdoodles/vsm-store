# Cesarin OS — Semantic Clarity Model

## Core Concepts

### Señal (Signal)
**What it is:** An observed issue in Cesarin's behavior or customer interaction
**Sources:**
- Query where Cesarin showed low confidence
- Query where customer showed frustration
- Detected intents marked as "desconocida" (unknown)

**States:**
- `nueva` — Just detected, awaiting operator review
- `revisada` — Operator reviewed, no action needed
- `convertida_regla` — Became a directriz (rule for future behavior)
- `convertida_mejora` — Became a work item in improvements queue
- `descartada` — Reviewed and discarded as not actionable
- `resuelta` — Closed (not actively used yet)

**What happens to a signal:**
- Convert → Directriz: "This query pattern should be handled differently going forward"
- Convert → Mejora: "This needs investigation/work in the improvements queue"
- Discard: "This is not actionable; mark as reviewed"

---

### Directriz (Directive/Rule)
**What it is:** An instruction that guides Cesarin's behavior going forward
**Characteristics:**
- Active or paused in real time
- Applied to ALL future conversations matching the directive's scope
- Can be created manually OR from a signal

**Examples:**
- Tono y personalidad: "How Cesarin speaks and behaves"
- Logistica y envios: "How Cesarin handles shipping/returns"
- Ventas y comercio: "How Cesarin recommends and presents products"
- Legal y seguridad: "Hard restrictions; always active"

**Lifecycle:**
- Create (manual or from signal)
- Edit content/category
- Toggle active/paused
- (Implicit: runs on every relevant future conversation)

---

### Mejora (Improvement)
**What it is:** A work item in the operator's improvement queue
**Characteristics:**
- Explicitly created by operator decision
- Has owner, lane (type of work), status, severity
- Requires manual execution and documented closure

**Lanes:**
- Regla: Signaled issue that might become a rule
- Conocimiento: Product/system knowledge gap
- Compatibilidad: Product compatibility issue
- Comercio: Commerce/commerce-related work
- Otro: Other

**Lifecycle:**
- Open → In Progress → Resolved (or Won't Fix)
- Requires manual action and evidence of closure

---

### Intervención (System Recommendation)
**What it is:** An issue or gap detected automatically by Cesarin
**Characteristics:**
- System-detected, not operator-initiated
- Requires operator approval before any action
- Execution is manual and out-of-band

**Types:**
- Enrichment gaps (missing product information)
- Compatibility issues (products that don't work together)
- Recurring patterns (customer pain points)

**Operator Role:**
- Review the recommendation
- Approve (will be executed manually later)
- Reject (not actionable)

---

### Traceability / Activity Log
**What it is:** A shared, timestamped record of operator actions on the system
**Purpose:**
- Proves who changed what and when
- Visible to all operators (shared trust)
- Helps with oversight and audit

**Captured actions:**
- Rule created/edited/enabled/disabled
- Signal converted to rule
- Signal converted to improvement
- Signal discarded
- (System diagnostics filtered out)

---

## Relationships

```
Señal (Observed Issue)
├→ Convert to Directriz: becomes a rule for future conversations
├→ Convert to Mejora: becomes a work item
└→ Discard: mark as reviewed, no action

Directriz (Rule)
└→ Guides every future conversation matching its scope
   └→ Execution is automatic

Mejora (Work Item)
└→ Requires manual execution and closure

Intervención (System Recommendation)
└→ Requires operator approval
   └→ Execution is manual and out-of-band
```

---

## Operator Mental Model

When you open Cesarin OS, you're managing four different kinds of things:

1. **Señales (Signals)** — "What did the system do wrong recently?"
   - Read these to find issues
   - Convert to rules (for future) or improvements (for work queue)
   - Or discard if not actionable

2. **Directrices (Directives/Rules)** — "What should the system do going forward?"
   - These ARE ACTIVE RIGHT NOW
   - Apply to all future conversations
   - Edit or pause them as behavior changes

3. **Mejoras (Improvements)** — "What work do we need to do?"
   - Your work queue
   - Each item needs manual execution + evidence
   - Track progress and close when done

4. **Intervenciones (Recommendations)** — "What does the system suggest we work on?"
   - System-detected issues
   - Requires your approval
   - Execution is manual, separate from the queue

5. **Actividad (Traceability)** — "What changed and when?"
   - Shared record across all operators
   - Proves accountability
   - Filter out system diagnostics noise