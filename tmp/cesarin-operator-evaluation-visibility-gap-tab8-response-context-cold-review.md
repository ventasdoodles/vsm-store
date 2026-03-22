# COLD REVIEW — OPERATOR EVALUATION VISIBILITY GAP (TAB 8 / RESPONSE CONTEXT)

## 1. Files inspected

- [src/pages/admin/AdminCesarinOS.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/admin/AdminCesarinOS.tsx)
- [src/components/admin/cesarin/TabPilot.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabPilot.tsx)
- [src/components/admin/cesarin/PilotTelemetry.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx)
- [src/components/admin/cesarin/ReviewDrawer.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/ReviewDrawer.tsx)
- [src/components/admin/cesarin/TabLearning.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabLearning.tsx)
- [src/services/admin/admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts)
- [src/services/admin/admin-eval.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-eval.service.ts)
- [src/types/cesarin.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/types/cesarin.ts)

## 2. Which tab/component is the grading surface

- The live operator grading surface for “tab 8” is [TabPilot.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabPilot.tsx) → [PilotTelemetry.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx) → [ReviewDrawer.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/ReviewDrawer.tsx).
- The actual scoring UI is `ReviewDrawer`, not `TabLearning`.
- `TabLearning` is a separate “Entrenar Cerebro” list and is not the rating surface.

## 3. What data it currently shows

- In the `Tab 8` table, [PilotTelemetry.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/PilotTelemetry.tsx) shows:
  - user query
  - detected intent
  - capsule
  - semantic/fallback/card counts
  - latency
  - timestamp
  - review button
- In the actual grading drawer, [ReviewDrawer.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/ReviewDrawer.tsx) shows:
  - user query
  - Cesarin response
  - route/capsule context
  - score
  - primary tag
  - severity
  - expected outcome
  - comments
- `ai_evaluations` itself only stores the judgment fields. It does not store the response text.

## 4. Whether Cesarin’s answer is already available but unsurfaced

- Yes, for the live `Tab 8` pilot path, Cesarin’s answer is already available in source and already rendered in the drawer.
- The data path is:
  - [admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts) reads `ai_analytics.response_text`
  - `PilotQueryRow.response_text` carries it
  - [AdminCesarinOS.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/admin/AdminCesarinOS.tsx) maps it into `interaction.response`
  - [ReviewDrawer.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/ReviewDrawer.tsx) renders it
- So this is not a live pilot persistence gap.
- The real gap is that the main `Tab 8` list does not surface the answer at all; you only see it after clicking into the drawer.
- Separate note: the simulator review helper in [AdminCesarinOS.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/pages/admin/AdminCesarinOS.tsx) still queries `response`, not `response_text`, so simulator-side review can blank out. That is a different path from live `Tab 8`.

## 5. Root cause classification (A/B/C/D)

- For the live operator `Tab 8` path: `D) workflow/discoverability problem`, with a small `A) UI surfacing gap` flavor.
- It is not `B)` for the live pilot path, because the correct source already includes `response_text`.
- It is not `C)`, because `response_text` is not missing from canonical persistence.
- If the complaint includes simulator review, there is also a separate `B) wrong data source/query shape` issue on that helper path.

## 6. Smallest safe next move

- Smallest safe move for `Tab 8` live grading is `display-only / workflow surfacing`:
  - expose a short response preview in the pilot table, or
  - make the presence of the response more obvious before/while opening review.
- No schema or evaluation-entity persistence change is justified for the live pilot path.
- If simulator review is also in scope, the smallest safe move there is a narrow query/data-contract correction from `response` to `response_text`.

## 7. Whether Antigravity implementation is needed or not

- Yes, but only as a small Antigravity UI/wiring pass if the target is the live `Tab 8` operator experience.
- No Antigravity persistence work is needed for the live pilot path.
- If simulator review is included, a second tiny Antigravity query fix is needed there too.
